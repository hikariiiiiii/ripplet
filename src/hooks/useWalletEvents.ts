import { useEffect, useRef } from 'react';
import { useWalletStore } from '@/stores/wallet';
import type { NetworkType } from '@/types';

declare global {
  interface Window {
    crossmark?: {
      sdk?: {
        on?: (event: string, callback: (data: unknown) => void) => void;
        off?: (event: string, callback: (data: unknown) => void) => void;
        getNetwork?: () => Promise<{ type: string }>;
        getAddress?: () => Promise<{ address: string }>;
      };
    };
    gemwallet?: {
      on?: (event: string, callback: (data: unknown) => void) => void;
      off?: (event: string, callback: (data: unknown) => void) => void;
      getNetwork?: () => Promise<{ result?: { type: string } }>;
      getAddress?: () => Promise<{ result?: { address: string } }>;
    };
  }
}

const CROSSMARK_EVENTS = {
  NETWORK_CHANGE: 'network-change',
  USER_CHANGE: 'user-change',
};

const GEMWALLET_EVENTS = {
  ACCOUNT_CHANGE: 'accountChange',
  NETWORK_CHANGE: 'networkChange',
};

function mapNetworkType(walletNetwork: string): NetworkType {
  const network = walletNetwork?.toLowerCase() || '';
  if (network.includes('mainnet') || network === 'main') {
    return 'mainnet';
  }
  if (network.includes('testnet') || network === 'test' || network.includes('altnet')) {
    return 'testnet';
  }
  if (network.includes('devnet') || network === 'dev') {
    return 'devnet';
  }
  return 'mainnet';
}

export function useWalletEvents() {
  const { connected, walletType, setAddress, setNetwork } = useWalletStore();
  const callbacksRef = useRef<{
    networkChange?: (data: unknown) => void;
    userChange?: (data: unknown) => void;
    accountChange?: (data: unknown) => void;
  }>({});

  useEffect(() => {
    if (!connected || !walletType) return;

    if (walletType === 'crossmark' && window.crossmark?.sdk) {
      const sdk = window.crossmark.sdk;

      callbacksRef.current.networkChange = (data: unknown) => {
        const networkData = data as { type?: string };
        if (networkData?.type) {
          setNetwork(mapNetworkType(networkData.type));
        }
      };

      callbacksRef.current.userChange = async () => {
        try {
          const result = await sdk?.getAddress?.();
          if (result?.address) {
            setAddress(result.address);
          }
        } catch (error) {
          console.warn('Failed to get updated address from Crossmark:', error);
        }
      };

      sdk?.on?.(CROSSMARK_EVENTS.NETWORK_CHANGE, callbacksRef.current.networkChange);
      sdk?.on?.(CROSSMARK_EVENTS.USER_CHANGE, callbacksRef.current.userChange);

      return () => {
        if (callbacksRef.current.networkChange) {
          sdk?.off?.(CROSSMARK_EVENTS.NETWORK_CHANGE, callbacksRef.current.networkChange);
        }
        if (callbacksRef.current.userChange) {
          sdk?.off?.(CROSSMARK_EVENTS.USER_CHANGE, callbacksRef.current.userChange);
        }
      };
    }

    if (walletType === 'gemwallet' && window.gemwallet) {
      const gem = window.gemwallet;

      callbacksRef.current.networkChange = (data: unknown) => {
        const networkData = data as { type?: string };
        if (networkData?.type) {
          setNetwork(mapNetworkType(networkData.type));
        }
      };

      callbacksRef.current.accountChange = (data: unknown) => {
        const accountData = data as { address?: string };
        if (accountData?.address) {
          setAddress(accountData.address);
        }
      };

      gem?.on?.(GEMWALLET_EVENTS.NETWORK_CHANGE, callbacksRef.current.networkChange);
      gem?.on?.(GEMWALLET_EVENTS.ACCOUNT_CHANGE, callbacksRef.current.accountChange);

      return () => {
        if (callbacksRef.current.networkChange) {
          gem?.off?.(GEMWALLET_EVENTS.NETWORK_CHANGE, callbacksRef.current.networkChange);
        }
        if (callbacksRef.current.accountChange) {
          gem?.off?.(GEMWALLET_EVENTS.ACCOUNT_CHANGE, callbacksRef.current.accountChange);
        }
      };
    }

    return undefined;
  }, [connected, walletType, setAddress, setNetwork]);
}

export function useNetworkValidation() {
  const { network, address, connected } = useWalletStore();

  const validateNetwork = async (requiredNetwork: NetworkType): Promise<{ valid: boolean; message?: string }> => {
    if (!connected) {
      return { valid: false, message: 'Wallet not connected' };
    }

    if (network !== requiredNetwork) {
      const networkNames: Record<NetworkType, string> = {
        mainnet: 'Mainnet',
        testnet: 'Testnet',
        devnet: 'Devnet',
      };
      return {
        valid: false,
        message: `Please switch your wallet to ${networkNames[requiredNetwork]}. Current network: ${networkNames[network]}`,
      };
    }

    return { valid: true };
  };

  const validateAddress = (requiredAddress: string): { valid: boolean; message?: string } => {
    if (!connected) {
      return { valid: false, message: 'Wallet not connected' };
    }

    if (address !== requiredAddress) {
      return {
        valid: false,
        message: `Wallet address changed. Please reconnect or switch back to the original account.`,
      };
    }

    return { valid: true };
  };

  return { validateNetwork, validateAddress, currentNetwork: network, currentAddress: address };
}
