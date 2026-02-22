# Fix Wallet Installation Detection

## TL;DR

> **Quick Summary**: 使用官方 SDK API 检测钱包是否安装
> 
> **Deliverables**: 
> - Crossmark 使用 `sdk.async.detect()` 替代 `window.crossmark`
> - Gemwallet 使用 `isInstalled()` 直接导入
> 
> **Estimated Effort**: Quick

---

## Problem

当前 Crossmark 安装检测使用 `window.crossmark.sdk.isInstalled()`，这不是官方推荐的方式。

## Solution

根据 Crossmark 官方文档：

**推荐方式**:
```typescript
import sdk from '@crossmarkio/sdk';

// 异步检测（推荐，更可靠）
const isInstalled = await sdk.async.detect(3000); // 3秒超时
```

**Gemwallet**:
```typescript
import { isInstalled } from '@gemwallet/api';

const result = await isInstalled();
const isInstalled = result?.result?.isInstalled === true;
```

---

## TODOs

- [ ] 1. Update WalletSelectModal.tsx

  **File**: `src/components/wallet/WalletSelectModal.tsx`
  
  **Changes**:
  
  1. 添加导入：
  ```typescript
  import sdk from '@crossmarkio/sdk';
  import { isInstalled as gemIsInstalled } from '@gemwallet/api';
  ```
  
  2. 修改检测逻辑：
  ```typescript
  // Check if wallet is installed before attempting to connect
  let isInstalled = false;
  if (wallet.type === 'crossmark') {
    try {
      isInstalled = await (sdk as any).async?.detect?.(3000) ?? false;
    } catch {
      isInstalled = false;
    }
  } else if (wallet.type === 'gemwallet') {
    try {
      const result = await gemIsInstalled();
      isInstalled = result?.result?.isInstalled === true;
    } catch {
      isInstalled = false;
    }
  }
  ```

- [ ] 2. Build and test
