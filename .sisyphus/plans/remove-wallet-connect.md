# Remove xrpl-wallet-connect and Use Official Wallet APIs

## TL;DR

> **Quick Summary**: 移除 `xrpl-wallet-connect` 库，直接使用 Crossmark 和 Gemwallet 的官方 API
> 
> **Deliverables**: 
> - 删除 `xrpl-wallet-connect` 依赖
> - 重写 `src/lib/wallets/index.ts` 使用官方 API
> - 重写 `src/hooks/useWalletEvents.ts` 使用官方 API
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: NO - sequential

---

## Context

### Problem
- `xrpl-wallet-connect` 封装了钱包 API，但：
  - 没有暴露事件监听 API
  - 增加了调试难度
  - 多了一层抽象

### Solution
直接使用官方 API：

| 钱包 | 官方库 | 功能 |
|------|--------|------|
| Crossmark | `@crossmarkio/sdk` | 连接、签名、事件监听 |
| Gemwallet | `@gemwallet/api` | 连接、签名、事件监听 |

### Official API Reference

**Crossmark**:
```typescript
import sdk from '@crossmarkio/sdk';

// 连接
const { response } = await sdk.methods.signInAndWait();
const address = response.data.address;

// 签名并提交
const { response } = await sdk.methods.signAndSubmitAndWait(transaction);
const hash = response.data.resp?.result?.hash;

// 签名
const { response } = await sdk.methods.signAndWait(transaction);
const signedTx = response.data.txBlob;

// 事件监听
sdk.on('network-change', (network) => { ... });
sdk.on('user-change', () => { ... });
sdk.on('signout', () => { ... });

// 获取状态
const session = sdk.session; // { address, network: { type, ... } }
const isConnected = sdk.sync.isConnected();
```

**Gemwallet**:
```typescript
import { 
  isInstalled, 
  getAddress, 
  getNetwork, 
  signTransaction, 
  submitTransaction,
  on 
} from '@gemwallet/api';

// 检查安装
const installed = await isInstalled();

// 获取地址
const addressRes = await getAddress();
const address = addressRes.result?.address;

// 获取网络
const networkRes = await getNetwork();
const network = networkRes.result?.network; // "Mainnet", "Testnet", "Devnet"

// 签名并提交
const result = await submitTransaction({ transaction });
const hash = result.result?.hash;

// 签名
const result = await signTransaction({ transaction });
const signature = result.result?.signature;

// 事件监听
on('EVENT_NETWORK_CHANGED', (result) => { ... });
on('EVENT_WALLET_CHANGED', (result) => { ... });
on('EVENT_LOGOUT', () => { ... });
```

---

## TODOs

- [ ] 1. Rewrite src/lib/wallets/index.ts

  **What to do**:
  - 移除 `xrpl-wallet-connect` 导入
  - 直接使用 `@crossmarkio/sdk` 和 `@gemwallet/api`
  
  **New implementation**:
  ```typescript
  import { useWalletStore } from '@/stores/wallet';
  import type { WalletType, NetworkType } from '@/types';
  import { checkWalletConnection } from '@/hooks/useWalletEvents';
  import sdk from '@crossmarkio/sdk';
  import { 
    isInstalled as gemIsInstalled,
    getAddress as gemGetAddress,
    getNetwork as gemGetNetwork,
    signTransaction as gemSignTransaction,
    submitTransaction as gemSubmitTransaction
  } from '@gemwallet/api';

  const errorMessages: Record<string, string> = {
    'not installed': 'Wallet extension not found. Please install the wallet extension.',
    'not found': 'Wallet extension not found. Please install the wallet extension.',
    'rejected': 'Connection request was rejected. Please try again.',
    'cancelled': 'Connection request was cancelled.',
  };

  function getUserFriendlyError(error: unknown): string {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    for (const [pattern, friendlyMessage] of Object.entries(errorMessages)) {
      if (message.toLowerCase().includes(pattern.toLowerCase())) {
        return friendlyMessage;
      }
    }
    
    return `Failed to connect wallet: ${message}`;
  }

  function mapNetworkType(walletNetwork: string): NetworkType {
    const network = walletNetwork?.toLowerCase() || '';
    if (network.includes('mainnet') || network === 'main') return 'mainnet';
    if (network.includes('testnet') || network === 'test') return 'testnet';
    if (network.includes('devnet') || network === 'dev') return 'devnet';
    return 'mainnet';
  }

  // Crossmark
  async function connectCrossmark(): Promise<string> {
    const crossmarkSDK = sdk as any;
    
    if (crossmarkSDK?.sync?.isInstalled && !crossmarkSDK.sync.isInstalled()) {
      throw new Error('Crossmark extension is not installed');
    }
    
    const { response } = await sdk.methods.signInAndWait();
    
    if (!response?.data?.address) {
      throw new Error('No address received from Crossmark');
    }
    
    return response.data.address;
  }

  async function signAndSubmitCrossmark(transaction: object): Promise<{ hash: string }> {
    const crossmarkSDK = sdk as any;
    const address = crossmarkSDK?.session?.address;
    
    if (!address) {
      throw new Error('Not signed in to Crossmark');
    }
    
    const tx = { ...transaction, Account: address };
    const { response } = await sdk.methods.signAndSubmitAndWait(tx);
    
    const txResult = response?.data?.resp as any;
    const hash = txResult?.result?.hash || txResult?.hash;
    
    if (!hash) {
      throw new Error('Transaction failed or was rejected');
    }
    
    return { hash };
  }

  async function signCrossmark(transaction: object): Promise<{ signedTx: string; txJson: unknown }> {
    const crossmarkSDK = sdk as any;
    const address = crossmarkSDK?.session?.address;
    
    if (!address) {
      throw new Error('Not signed in to Crossmark');
    }
    
    const tx = { ...transaction, Account: address };
    const { response } = await sdk.methods.signAndWait(tx);
    
    if (!response?.data?.txBlob) {
      throw new Error('Signing failed or was rejected');
    }
    
    return { signedTx: response.data.txBlob, txJson: tx };
  }

  function getCrossmarkNetwork(): string | null {
    const crossmarkSDK = sdk as any;
    const networkType = crossmarkSDK?.session?.network?.type;
    return networkType ? mapNetworkType(networkType) : null;
  }

  // Gemwallet
  async function connectGemwallet(): Promise<string> {
    const installed = await gemIsInstalled();
    
    if (!installed?.result?.isInstalled) {
      throw new Error('Gemwallet extension is not installed');
    }
    
    const response = await gemGetAddress();
    
    if (response?.type !== 'response' || !response.result?.address) {
      throw new Error('No address received from Gemwallet');
    }
    
    return response.result.address;
  }

  async function signAndSubmitGemwallet(transaction: object): Promise<{ hash: string }> {
    const response = await gemSubmitTransaction({ transaction: transaction as any });
    
    if (response?.type !== 'response' || !response.result?.hash) {
      throw new Error('Transaction failed or was rejected');
    }
    
    return { hash: response.result.hash };
  }

  async function signGemwallet(transaction: object): Promise<{ signedTx: string; txJson: unknown }> {
    const response = await gemSignTransaction({ transaction: transaction as any });
    
    if (response?.type !== 'response' || !response.result?.signature) {
      throw new Error('Signing failed or was rejected');
    }
    
    return { signedTx: response.result.signature, txJson: transaction };
  }

  async function getGemwalletNetwork(): Promise<string | null> {
    try {
      const response = await gemGetNetwork();
      if (response?.type === 'response' && response.result?.network) {
        return mapNetworkType(response.result.network);
      }
    } catch (e) {
      console.warn('Failed to get Gemwallet network:', e);
    }
    return null;
  }

  // Unified API
  export async function connectWallet(type: WalletType): Promise<string> {
    try {
      if (type === 'crossmark') {
        return connectCrossmark();
      }
      if (type === 'gemwallet') {
        return connectGemwallet();
      }
      throw new Error(`Unsupported wallet type: ${type}`);
    } catch (error) {
      console.error(`Wallet connection error (${type}):`, error);
      throw new Error(getUserFriendlyError(error));
    }
  }

  export async function signAndSubmitTransaction(
    type: WalletType, 
    transaction: object
  ): Promise<{ hash: string }> {
    try {
      if (type === 'crossmark') {
        return signAndSubmitCrossmark(transaction);
      }
      if (type === 'gemwallet') {
        return signAndSubmitGemwallet(transaction);
      }
      throw new Error(`Unsupported wallet type: ${type}`);
    } catch (error) {
      console.error(`Transaction error (${type}):`, error);
      throw new Error(getUserFriendlyError(error));
    }
  }

  export async function signTransaction(
    type: WalletType, 
    transaction: object
  ): Promise<{ signedTx: string; txJson: unknown }> {
    try {
      if (type === 'crossmark') {
        return signCrossmark(transaction);
      }
      if (type === 'gemwallet') {
        return signGemwallet(transaction);
      }
      throw new Error(`Unsupported wallet type: ${type}`);
    } catch (error) {
      console.error(`Signing error (${type}):`, error);
      throw new Error(getUserFriendlyError(error));
    }
  }

  export async function disconnectWallet(type: WalletType): Promise<void> {
    // Crossmark and Gemwallet don't have explicit logout
    // Just clear local state
    console.log(`Disconnecting ${type}`);
  }

  export function useWallet() {
    const store = useWalletStore();

    const connect = async (type: WalletType) => {
      store.setConnecting(true);
      try {
        const address = await connectWallet(type);
        store.setAddress(address);
        store.setWalletType(type);
        store.setConnected(true);
        
        // Detect network
        try {
          let network: string | null = null;
          if (type === 'crossmark') {
            network = getCrossmarkNetwork();
          } else if (type === 'gemwallet') {
            network = await getGemwalletNetwork();
          }
          if (network) {
            store.setNetwork(network as NetworkType);
          }
        } catch (e) {
          console.warn('Could not detect wallet network:', e);
        }
        
        return address;
      } catch (error) {
        console.error('Wallet connection error:', error);
        throw error;
      } finally {
        store.setConnecting(false);
      }
    };

    const disconnect = async () => {
      if (store.walletType) {
        await disconnectWallet(store.walletType);
      }
      store.disconnect();
    };

    const signAndSubmit = async (transaction: object) => {
      if (!store.walletType) {
        throw new Error('No wallet connected');
      }
      
      const isActuallyConnected = await checkWalletConnection(store.walletType);
      if (!isActuallyConnected) {
        try {
          const newAddress = await connectWallet(store.walletType);
          store.setAddress(newAddress);
          store.setConnected(true);
        } catch {
          store.disconnect();
          throw new Error('Wallet disconnected. Please reconnect.');
        }
      }
      
      return signAndSubmitTransaction(store.walletType, transaction);
    };

    const sign = async (transaction: object) => {
      if (!store.walletType) {
        throw new Error('No wallet connected');
      }
      
      const isActuallyConnected = await checkWalletConnection(store.walletType);
      if (!isActuallyConnected) {
        try {
          const newAddress = await connectWallet(store.walletType);
          store.setAddress(newAddress);
          store.setConnected(true);
        } catch {
          store.disconnect();
          throw new Error('Wallet disconnected. Please reconnect.');
        }
      }
      
      return signTransaction(store.walletType, transaction);
    };

    return {
      address: store.address,
      connected: store.connected,
      walletType: store.walletType,
      connecting: store.connecting,
      network: store.network,
      networkInfo: store.networkInfo,
      connect,
      disconnect,
      signAndSubmit,
      sign,
    };
  }
  ```

- [ ] 2. Rewrite src/hooks/useWalletEvents.ts

  **What to do**:
  - 使用官方 API 的事件监听
  
  ```typescript
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
            } else {
              disconnect();
              toast({ title: t('toast.walletDisconnected'), description: t('toast.walletDisconnectedDesc'), variant: 'destructive' });
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
          } else {
            disconnect();
            toast({ title: t('toast.walletDisconnected'), description: t('toast.walletDisconnectedDesc'), variant: 'destructive' });
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
    } catch (e) {
      console.warn('Wallet connection check failed:', e);
    }
    return false;
  }
  ```

- [ ] 3. Remove xrpl-wallet-connect dependency

  ```bash
  npm uninstall xrpl-wallet-connect
  ```

- [ ] 4. Build and test

  ```bash
  npm run build
  ```

---

## Success Criteria

- [ ] `xrpl-wallet-connect` 依赖已移除
- [ ] Crossmark 连接、签名、事件监听正常
- [ ] Gemwallet 连接、签名、事件监听正常
- [ ] Build 通过
