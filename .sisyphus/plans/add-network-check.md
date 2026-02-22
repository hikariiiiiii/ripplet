# Add Network Check to Sign Operations

## TL;DR

> **Quick Summary**: 在签名操作中添加网络匹配检查
> 
> **Deliverables**: 
> - 新增 `getCurrentWalletState()` 函数，同时获取地址和网络
> - 在 `signAndSubmit` 和 `sign` 中检查网络匹配
> 
> **Estimated Effort**: Quick

---

## Problem

当前签名操作只检查地址匹配，没有检查网络匹配。

## Solution

### 1. 新增 `getCurrentWalletState()` 函数

```typescript
const getCurrentWalletState = async (): Promise<{ 
  address: string | null; 
  network: string | null;
}> => {
  if (!store.walletType) return { address: null, network: null };
  
  if (store.walletType === 'crossmark') {
    const crossmarkSDK = sdk as any;
    const session = crossmarkSDK?.session;
    return {
      address: session?.address || null,
      network: session?.network?.type 
        ? mapNetworkType(session.network.type) 
        : null,
    };
  }
  
  if (store.walletType === 'gemwallet') {
    const { getAddress, getNetwork } = await import('@gemwallet/api');
    const [addrRes, netRes] = await Promise.all([
      getAddress(),
      getNetwork(),
    ]);
    return {
      address: addrRes?.result?.address || null,
      network: netRes?.result?.network 
        ? mapNetworkType(netRes.result.network) 
        : null,
    };
  }
  
  return { address: null, network: null };
};
```

### 2. 更新 `signAndSubmit()` 和 `sign()`

```typescript
const signAndSubmit = async (transaction: object) => {
  if (!store.walletType) {
    throw new Error('No wallet connected');
  }
  
  // 获取当前钱包状态
  const { address, network } = await getCurrentWalletState();
  
  // 检查地址匹配
  if (address && address !== store.address) {
    throw new Error(
      `Wallet account changed. Current wallet address (${address.slice(0, 8)}...) ` +
      `does not match connected address (${store.address?.slice(0, 8)}...). ` +
      `Please switch to the correct account in your wallet.`
    );
  }
  
  // 检查网络匹配
  if (network && network !== store.network) {
    const networkNames: Record<string, string> = {
      mainnet: 'Mainnet',
      testnet: 'Testnet',
      devnet: 'Devnet',
    };
    throw new Error(
      `Wallet network changed to ${networkNames[network]}. ` +
      `Please switch your wallet to ${networkNames[store.network]} to continue.`
    );
  }
  
  // ... 其余逻辑
};
```

---

## TODOs

- [ ] 1. Update `useWallet()` in `src/lib/wallets/index.ts`
  
  **Changes**:
  
  1. 替换 `getCurrentWalletAddress()` 为 `getCurrentWalletState()`
  2. 更新 `signAndSubmit()` 添加网络检查
  3. 更新 `sign()` 添加网络检查

- [ ] 2. Build and test
