# Add Friendly Network Mismatch Dialog

## TL;DR

> **Quick Summary**: 网络不匹配时显示友好的弹窗引导用户切换网络，而不是 Transaction Failed
> 
> **Deliverables**: 
> - 创建 `NetworkMismatchDialog` 组件
> - 创建自定义错误类型 `WalletMismatchError`
> - 在交易页面处理这个错误
> 
> **Estimated Effort**: Medium

---

## Problem

当前网络不匹配时，错误显示为 "Transaction Failed"，不够友好。用户希望：
1. 显示一个友好的小弹窗
2. 提示当前钱包选择的网络
3. 引导用户去钱包里切换网络

---

## Solution

### 1. 创建自定义错误类型

**File**: `src/types/index.ts`

```typescript
export class WalletMismatchError extends Error {
  constructor(
    message: string,
    public type: 'account' | 'network',
    public current?: string,
    public expected?: string
  ) {
    super(message);
    this.name = 'WalletMismatchError';
  }
}
```

### 2. 创建 NetworkMismatchDialog 组件

**File**: `src/components/wallet/NetworkMismatchDialog.tsx`

```tsx
interface NetworkMismatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'account' | 'network';
  current?: string;
  expected?: string;
}
```

显示：
- 当前钱包网络/账户
- 应用需要的网络/账户
- 引导用户去钱包切换

### 3. 修改 signAndSubmit/sign

不抛出普通 Error，而是抛出 `WalletMismatchError`。

### 4. 在交易页面处理

```tsx
try {
  await signAndSubmit(transaction);
} catch (err) {
  if (err instanceof WalletMismatchError) {
    setShowMismatchDialog(true);
    setMismatchError(err);
  } else {
    // 其他错误
  }
}
```

---

## TODOs

- [ ] 1. Add WalletMismatchError to types/index.ts
- [ ] 2. Create NetworkMismatchDialog component
- [ ] 3. Update signAndSubmit/sign to throw WalletMismatchError
- [ ] 4. Update Payment.tsx to handle WalletMismatchError
- [ ] 5. Update TrustSet.tsx to handle WalletMismatchError
- [ ] 6. Update AccountSet.tsx to handle WalletMismatchError
- [ ] 7. Build and test
