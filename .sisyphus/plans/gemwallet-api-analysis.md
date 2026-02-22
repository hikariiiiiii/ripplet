# Gemwallet API 分析报告

## TL;DR

> **Quick Summary**: 分析 Gemwallet API 使用方式，发现几个需要优化的问题
> 
> **主要发现**:
> - 当前使用 Raw Transaction Methods，可考虑切换到 Helper Methods
> - 响应处理需要检查 `type` 字段
> - 网络格式正确处理了大小写
> 
> **Estimated Effort**: Medium

---

## 官方 API 分类

### Helper Methods（推荐）

官方推荐的易用方法，封装了交易细节：

| 方法 | 用途 |
|-----|------|
| `sendPayment()` | 发送支付 |
| `setAccount()` | 设置账户 |
| `setTrustline()` | 设置信任线 |
| `createOffer()` | 创建挂单 |
| `cancelOffer()` | 取消挂单 |

### Raw Transaction Methods（当前使用）

需要传入完整的 XRPL 交易格式：

| 方法 | 用途 |
|-----|------|
| `signTransaction()` | 签名交易 |
| `submitTransaction()` | 签名并提交交易 |

---

## 当前代码使用情况

### 1. 连接流程 ✅ 正确

```typescript
// 当前实现
const installed = await isInstalled();
if (!installed?.result?.isInstalled) {
  throw new Error('Gemwallet extension is not installed');
}
const response = await getAddress();
if (response?.type !== 'response' || !response.result?.address) {
  throw new Error('No address received from Gemwallet');
}
return response.result.address;
```

**符合官方推荐流程**:
```typescript
// 官方示例
isInstalled().then((response) => {
  if (response.result.isInstalled) {
    getAddress().then((response) => {
      console.log(`Your address: ${response.result?.address}`);
    });
  }
});
```

### 2. 网络检测 ✅ 正确

```typescript
// 当前实现
const response = await getNetwork();
if (response?.type === 'response' && response.result?.network) {
  return mapNetworkType(response.result.network);
}
```

**文档返回格式**:
```typescript
result: {
  chain: string;    // "XRPL"
  network: string;  // "Mainnet" | "Testnet" | "Devnet"
  websocket: string;
}
```

### 3. 交易提交 ⚠️ 可优化

```typescript
// 当前实现 - Raw Transaction Method
const response = await submitTransaction({ transaction: transaction as any });
```

**优化建议 - 使用 Helper Method**:
```typescript
// 对于 Payment
const response = await sendPayment({
  amount: "1000000",  // drops
  destination: "rXXX...",
  destinationTag: 123,
  memos: [{ memo: { memoData: "..." } }],
});
```

---

## 发现的问题

### 问题 1: 响应类型检查不完整

**当前代码**:
```typescript
if (response?.type !== 'response' || !response.result?.hash) {
  throw new Error('Transaction failed or was rejected');
}
```

**问题**: `type === "reject"` 表示用户拒绝，应该有不同的错误提示。

**修复**:
```typescript
if (response?.type === 'reject') {
  throw new Error('rejected');  // 用户拒绝
}
if (response?.type !== 'response' || !response.result?.hash) {
  throw new Error('Transaction failed');  // 其他错误
}
```

### 问题 2: 签名方法返回值问题

**当前代码**:
```typescript
const response = await signTransaction({ transaction: transaction as any });
return { signedTx: response.result.signature, txJson: transaction };
```

**问题**: `signTransaction` 返回的不是 `signature`，而是 `txBlob`（签名后的交易 blob）。

**需要验证**: 检查 `@gemwallet/api` 的实际返回格式。

### 问题 3: Helper Methods vs Raw Methods

**当前**: 使用 Raw Transaction Methods（统一格式）

**优点**:
- 代码统一，所有钱包使用相同交易格式
- 支持所有交易类型

**缺点**:
- 需要自己构建完整交易
- 不利用 Gemwallet 的简化 API

**建议**: 保持当前架构，但优化响应处理。

---

## 优化建议

### 1. 优化错误处理（推荐实施）

```typescript
async function signAndSubmitGemwallet(transaction: object): Promise<{ hash: string }> {
  const response = await submitTransaction({ transaction: transaction as any });
  
  // 区分用户拒绝和其他错误
  if (response?.type === 'reject') {
    throw new Error('rejected');
  }
  
  if (response?.type !== 'response') {
    throw new Error('Transaction failed');
  }
  
  if (!response.result?.hash) {
    throw new Error('No transaction hash returned');
  }
  
  return { hash: response.result.hash };
}
```

### 2. 使用 Helper Methods（可选重构）

如果需要重构，可以为 Gemwallet 单独使用 Helper Methods：

```typescript
// Payment 页面
async function sendPaymentGemwallet(params: {
  amount: string;
  destination: string;
  destinationTag?: number;
  memos?: Array<{ memo: { memoData?: string } }>;
}): Promise<{ hash: string }> {
  const response = await sendPayment(params);
  
  if (response?.type === 'reject') {
    throw new Error('rejected');
  }
  
  return { hash: response.result!.hash };
}
```

---

## TODOs

- [ ] 1. 优化错误处理 - 区分 `reject` 和其他错误
- [ ] 2. 验证 `signTransaction` 返回值格式
- [ ] 3. 考虑是否需要切换到 Helper Methods
