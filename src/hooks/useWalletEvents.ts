import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWalletStore } from '@/stores/wallet';
import type { NetworkType } from '@/types';
import { useToast } from '@/hooks/useToast';
import { on } from '@gemwallet/api';
import sdk from '@crossmarkio/sdk';

function mapNetworkType(walletNetwork: string): NetworkType {
  const network = walletNetwork?.toLowerCase() || '';
  if (network.includes('mainnet') || network === 'main') return 'mainnet';
  if (network.includes('testnet') || network === 'test') return 'testnet';
  if (network.includes('devnet') || network === 'dev') return 'devnet';
  return 'mainnet';
}

export function useWalletEvents() {
  const { connected, walletType, setAddress, setNetwork, disconnect } = useWalletStore();
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    if (!connected || !walletType) return;

    if (walletType === 'crossmark') {
      console.log('[Crossmark] Setting up event listeners');

      const handleNetworkChange = (network: { type: string }) => {
        console.log('[Crossmark] network-change:', network);
        if (network?.type) {
          const newNetwork = mapNetworkType(network.type);
          setNetwork(newNetwork);
          toast({
            title: t('toast.networkChanged'),
            description: t('toast.networkChangedDesc', { network: newNetwork }),
          });
        }
      };

      const handleUserChange = () => {
        console.log('[Crossmark] user-change');
        setTimeout(() => {
          const session = (sdk as any).session;
          if (session?.address) {
            setAddress(session.address);
            toast({ title: t('toast.accountChanged'), description: t('toast.accountChangedDesc') });
          }
        }, 100);
      };

      const handleSignout = () => {
        console.log('[Crossmark] signout');
        disconnect();
        toast({ title: t('toast.walletDisconnected'), description: t('toast.walletDisconnectedDesc'), variant: 'destructive' });
      };

      sdk.on('network-change', handleNetworkChange);
      sdk.on('user-change', handleUserChange);
      sdk.on('signout', handleSignout);

      return () => {
        sdk.off('network-change', handleNetworkChange);
        sdk.off('user-change', handleUserChange);
        sdk.off('signout', handleSignout);
      };
    }

    if (walletType === 'gemwallet') {
      console.log('[Gemwallet] Setting up event listeners');

      on('EVENT_NETWORK_CHANGED', (result: { network?: { name?: string } }) => {
        console.log('[Gemwallet] EVENT_NETWORK_CHANGED:', result);
        const networkName = result?.network?.name;
        if (networkName) {
          const newNetwork = mapNetworkType(networkName);
          setNetwork(newNetwork);
          toast({ title: t('toast.networkChanged'), description: t('toast.networkChangedDesc', { network: newNetwork }) });
        }
      });

      on('EVENT_WALLET_CHANGED', (result: { wallet?: { publicAddress?: string } }) => {
        console.log('[Gemwallet] EVENT_WALLET_CHANGED:', result);
        const address = result?.wallet?.publicAddress;
        if (address) {
          setAddress(address);
          toast({ title: t('toast.accountChanged'), description: t('toast.accountChangedDesc') });
        }
      });

      on('EVENT_LOGOUT', () => {
        console.log('[Gemwallet] EVENT_LOGOUT');
        disconnect();
        toast({ title: t('toast.walletDisconnected'), description: t('toast.walletDisconnectedDesc'), variant: 'destructive' });
      });

      return () => {
        console.log('[Gemwallet] Cleanup (on() does not support removal)');
      };
    }

    return undefined;
  }, [connected, walletType, setAddress, setNetwork, disconnect]);
}

export async function checkWalletConnection(walletType: string): Promise<boolean> {
  try {
    if (walletType === 'crossmark') {
      const crossmarkSDK = sdk as any;
      return !!crossmarkSDK?.sync?.isConnected?.() && !!crossmarkSDK?.session?.address;
    }
    if (walletType === 'gemwallet') {
      const { isInstalled, getAddress } = await import('@gemwallet/api');
      const installed = await isInstalled();
      if (!installed?.result?.isInstalled) return false;
      const response = await getAddress();
      return response?.type === 'response' && !!response.result?.address;
    }
    if (walletType === 'xaman') {
      // Xaman is always "connected" if we have the address in store
      // The actual connection happens via QR code each time
      return true;
    }
  } catch (e) {
    console.warn('Wallet connection check failed:', e);
  }
  return false;
}
