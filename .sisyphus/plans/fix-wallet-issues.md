# Fix Wallet Event and Signing Issues

## TL;DR

> **Quick Summary**: 修复钱包事件监听和签名时的三个问题
> 
> **Deliverables**: 
> - 修复签名时的网络/地址验证
> - 修复签名前不必要的连接尝试
> - 修复 Crossmark 网络切换监听
> - 修复 Gemwallet 事件监听重复注册

---

## Problem Analysis

### Problem 1: 签名时网络/地址验证没有触发

当前 `signAndSubmit` 和 `sign` 函数只检查是否连接，没有验证网络和地址匹配。

### Problem 2: 签名前不必要的连接尝试

- **Gemwallet**: `getAddress()` 会触发连接提示，不应该用于检查连接状态
- **Crossmark**: `sync.isConnected()` 可能有 false negative
- 应该使用更可靠的方式检查连接状态

### Problem 3: Crossmark 网络切换监听不到

可能的原因：
1. 事件监听需要在 signIn 之后
2. 回调数据格式可能需要验证

### Problem 4: Gemwallet 事件监听不工作

`on()` 函数每次调用都会添加新的 `window.addEventListener`，没有取消订阅机制。

---

## Solution

### 1. 修复 checkWalletConnection

**不要使用 `getAddress()` 检查连接**，改用 `session` 或 `isInstalled` + session

**Crossmark**:
```typescript
function checkCrossmarkConnection(): boolean {
  const crossmarkSDK = sdk as any;
  // 只检查 session，不触发任何提示
  return !!(crossmarkSDK?.session?.address);
}
```

**Gemwallet**:
```typescript
async function checkGemwalletConnection(): Promise<boolean> {
  // isInstalled 不会触发连接提示
  const installed = await gemIsInstalled();
  if (!installed?.result?.isInstalled) return false;
  // 检查是否有地址（可能需要先连接）
  // Gemwallet 没有 session 概念，需要通过其他方式
  return true; // 如果已安装就认为可能已连接
}
```

### 2. 添加网络/地址验证

在签名前验证网络和地址是否匹配：

```typescript
async function validateWalletState(type: WalletType, expectedAddress: string, expectedNetwork: NetworkType): Promise<{ valid: boolean; error?: string }> {
  if (type === 'crossmark') {
    const session = (sdk as any).session;
    const currentAddress = session?.address;
    const currentNetwork = session?.network?.type;
    
    if (currentAddress && currentAddress !== expectedAddress) {
      return { valid: false, error: `Address mismatch. Expected: ${expectedAddress}, Current: ${currentAddress}` };
    }
    
    if (currentNetwork) {
      const mapped = mapNetworkType(currentNetwork);
      if (mapped !== expectedNetwork) {
        return { valid: false, error: `Network mismatch. Expected: ${expectedNetwork}, Current: ${mapped}` };
      }
    }
  }
  
  if (type === 'gemwallet') {
    const addressRes = await gemGetAddress();
    const networkRes = await gemGetNetwork();
    
    if (addressRes?.result?.address && addressRes.result.address !== expectedAddress) {
      return { valid: false, error: `Address mismatch` };
    }
    
    if (networkRes?.result?.network) {
      const mapped = mapNetworkType(networkRes.result.network);
      if (mapped !== expectedNetwork) {
        return { valid: false, error: `Network mismatch` };
      }
    }
  }
  
  return { valid: true };
}
```

### 3. 修复 signAndSubmit 和 sign

```typescript
const signAndSubmit = async (transaction: object) => {
  if (!store.walletType) {
    throw new Error('No wallet connected');
  }
  
  // 验证网络和地址
  const validation = await validateWalletState(store.walletType, store.address, store.network);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  return signAndSubmitTransaction(store.walletType, transaction);
};
```

### 4. 修复 Gemwallet 事件监听

使用 ref 防止重复注册：

```typescript
const gemwalletRegisteredRef = useRef(false);

useEffect(() => {
  if (!connected || walletType !== 'gemwallet') return;
  
  // 防止重复注册
  if (gemwalletRegisteredRef.current) return;
  gemwalletRegisteredRef.current = true;
  
  console.log('[Gemwallet] Setting up event listeners');
  
  on('EVENT_NETWORK_CHANGED', (result: { network?: { name?: string } }) => {
    // handle event
  });
  
  // ... other events
}, [connected, walletType]);
```

### 5. 修复 Crossmark 网络切换监听

确保事件数据格式正确：

```typescript
const handleNetworkChange = (network: { type: string; protocol?: string; wss?: string; rpc?: string }) => {
  console.log('[Crossmark] network-change:', network);
  // network.type 是 'main', 'test', 'dev'
  if (network?.type) {
    const newNetwork = mapNetworkType(network.type);
    setNetwork(newNetwork);
    toast({ ... });
  }
};
```

---

## TODOs

- [ ] 1. Rewrite src/lib/wallets/index.ts with validation

- [ ] 2. Rewrite src/hooks/useWalletEvents.ts with fixed event handling

- [ ] 3. Build and test
