# Optimize Gemwallet Error Handling

## TL;DR

> **Quick Summary**: 优化 Gemwallet 错误处理，区分用户拒绝和其他错误
> 
> **Deliverables**: 
> - 优化 `signAndSubmitGemwallet` 错误处理
> - 优化 `signGemwallet` 错误处理
> - 保持使用 Raw Transaction Methods
> 
> **Estimated Effort**: Quick

---

## Problem

当前代码没有区分 `type: "reject"`（用户拒绝）和其他错误。

---

## Solution

### 更新 `signAndSubmitGemwallet`

```typescript
async function signAndSubmitGemwallet(transaction: object): Promise<{ hash: string }> {
  const response = await gemSubmitTransaction({ transaction: transaction as any });
  
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

### 更新 `signGemwallet`

```typescript
async function signGemwallet(transaction: object): Promise<{ signedTx: string; txJson: unknown }> {
  const response = await gemSignTransaction({ transaction: transaction as any });
  
  if (response?.type === 'reject') {
    throw new Error('rejected');
  }
  
  if (response?.type !== 'response') {
    throw new Error('Signing failed');
  }
  
  if (!response.result?.signature) {
    throw new Error('No signature returned');
  }
  
  return { signedTx: response.result.signature, txJson: transaction };
}
```

---

## TODOs

- [ ] 1. 更新 `signAndSubmitGemwallet` 错误处理
- [ ] 2. 更新 `signGemwallet` 错误处理
- [ ] 3. Build and test
