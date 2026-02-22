# Fix Wallet Event Listeners with Correct APIs

## TL;DR

> **Quick Summary**: 使用正确的官方 API 重写钱包事件监听器
> 
> **Deliverables**: 
> - 使用 `@crossmarkio/sdk` 的 `sdk.on()` 方法
> - 使用 `@gemwallet/api` 的 `on()` 方法
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO

---

## Context

### Problem
- `window.gemwallet` 不存在
- `window.crossmark.sdk` 可能不稳定
- 需要使用官方 API 包

### Correct APIs

**Crossmark**:
```typescript
import sdk from '@crossmarkio/sdk';

sdk.on('network-change', (network) => { ... });
sdk.on('user-change', () => { ... });
sdk.on('signout', () => { ... });
```

**Gemwallet**:
```typescript
import { on } from '@gemwallet/api';

on('EVENT_NETWORK_CHANGED', (result) => { ... });
on('EVENT_WALLET_CHANGED', (result) => { ... });
on('EVENT_LOGOUT', () => { ... });
```

---

## TODOs

- [ ] 1. Rewrite useWalletEvents.ts

  **File**: `src/hooks/useWalletEvents.ts`
  
  **New implementation**:
  ```typescript
  import { useEffect, useRef } from 'react';
  import { useTranslation } from 'react-i18next';
  import { useWalletStore } from '@/stores/wallet';
  import type { NetworkType } from '@/types';
  import { useToast } from '@/hooks/useToast';
  import { on } from '@gemwallet/api';
  import sdk from '@crossmarkio/sdk';

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
    const { connected, walletType, setAddress, setNetwork, disconnect } = useWalletStore();
    const { t } = useTranslation();
    const { toast } = useToast();
    const cleanupRef = useRef<(() => void) | null>(null);

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
              toast({
                title: t('toast.accountChanged'),
                description: t('toast.accountChangedDesc'),
              });
            } else {
              disconnect();
              toast({
                title: t('toast.walletDisconnected'),
                description: t('toast.walletDisconnectedDesc'),
                variant: 'destructive',
              });
            }
          }, 100);
        };

        const handleSignout = () => {
          console.log('[Crossmark] signout');
          disconnect();
          toast({
            title: t('toast.walletDisconnected'),
            description: t('toast.walletDisconnectedDesc'),
            variant: 'destructive',
          });
        };

        sdk.on('network-change', handleNetworkChange);
        sdk.on('user-change', handleUserChange);
        sdk.on('signout', handleSignout);

        cleanupRef.current = () => {
          sdk.off('network-change', handleNetworkChange);
          sdk.off('user-change', handleUserChange);
          sdk.off('signout', handleSignout);
        };

        return cleanupRef.current;
      }

      if (walletType === 'gemwallet') {
        console.log('[Gemwallet] Setting up event listeners');

        on('EVENT_NETWORK_CHANGED', (result: { network?: { name?: string } }) => {
          console.log('[Gemwallet] EVENT_NETWORK_CHANGED:', result);
          const networkName = result?.network?.name;
          if (networkName) {
            const newNetwork = mapNetworkType(networkName);
            setNetwork(newNetwork);
            toast({
              title: t('toast.networkChanged'),
              description: t('toast.networkChangedDesc', { network: newNetwork }),
            });
          }
        });

        on('EVENT_WALLET_CHANGED', (result: { wallet?: { publicAddress?: string } }) => {
          console.log('[Gemwallet] EVENT_WALLET_CHANGED:', result);
          const address = result?.wallet?.publicAddress;
          if (address) {
            setAddress(address);
            toast({
              title: t('toast.accountChanged'),
              description: t('toast.accountChangedDesc'),
            });
          } else {
            disconnect();
            toast({
              title: t('toast.walletDisconnected'),
              description: t('toast.walletDisconnectedDesc'),
              variant: 'destructive',
            });
          }
        });

        on('EVENT_LOGOUT', () => {
          console.log('[Gemwallet] EVENT_LOGOUT');
          disconnect();
          toast({
            title: t('toast.walletDisconnected'),
            description: t('toast.walletDisconnectedDesc'),
            variant: 'destructive',
          });
        });

        return () => {
          console.log('[Gemwallet] Cleanup (note: on() does not support removal)');
        };
      }

      return undefined;
    }, [connected, walletType, setAddress, setNetwork, disconnect]);
  }

  export async function checkWalletConnection(walletType: string): Promise<boolean> {
    try {
      if (walletType === 'crossmark') {
        const crossmarkSDK = sdk as any;
        const isConnected = crossmarkSDK?.sync?.isConnected?.();
        const session = crossmarkSDK?.session;
        return !!isConnected && !!session?.address;
      }
      if (walletType === 'gemwallet') {
        const { isInstalled, getAddress } = await import('@gemwallet/api');
        const installed = await isInstalled();
        if (!installed?.result?.isInstalled) return false;
        const response = await getAddress();
        return response?.type === 'response' && !!response.result?.address;
      }
    } catch (e) {
      console.warn('Wallet connection check failed:', e);
    }
    return false;
  }
  ```

  **Commit**: YES
  - Message: `fix: use correct wallet API for event listeners`
