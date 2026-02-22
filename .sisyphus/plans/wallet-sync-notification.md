# Wallet Auto-Sync with Notification

## TL;DR

> **Quick Summary**: 实现钱包网络/账户切换时的自动同步和弹框提示功能
> 
> **Deliverables**: 
> - 修复 Crossmark 使用 session 获取状态
> - 修复 Gemwallet 网络检测
> - 完善事件监听
> - 添加 Toast 弹框提示
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: NO - sequential
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4

---

## Context

### Original Request
用户希望实现：钱包切换网络/账户后，自动同步到应用设置，同时弹框提示用户已切换。

### Interview Summary
**Key Discussions**:
- 当前代码已经监听钱包事件，但实现有问题
- Crossmark 应该用 `sdk.session` 而不是调用方法
- Gemwallet 有 `getNetwork()` API，当前代码错误地返回 `null`
- 需要添加 Toast 提示用户切换发生

**Research Findings**:
- **Crossmark SDK**: `sdk.session.address`, `sdk.session.network.type`, `sdk.sync.isConnected()`
- **Gemwallet SDK**: `getAddress().result.address`, `getNetwork().result.network`
- Crossmark 事件: `network-change`, `user-change`, `signout`
- Gemwallet 事件: `EVENT_NETWORK_CHANGED`, `EVENT_WALLET_CHANGED`, `EVENT_LOGOUT`

### Current Problems

| 钱包 | 地址检测 | 网络检测 | 问题 |
|------|---------|---------|------|
| Crossmark | ❌ 用 `getAddress()` | ❌ 用 `getNetwork()` | 应该用 `session` |
| Gemwallet | ❌ 返回 `null` | ❌ 返回 `null` | 有 API 但未使用 |

---

## Work Objectives

### Core Objective
完善钱包状态检测和事件监听，实现自动同步 + Toast 提示。

### Concrete Deliverables
- `src/lib/wallets/index.ts` - 修复状态检测函数
- `src/hooks/useWalletEvents.ts` - 完善事件监听和 Toast 提示
- `src/types/index.ts` - 更新 Window 类型声明（如需要）

### Definition of Done
- [ ] Crossmark 使用 `session` 获取地址和网络
- [ ] Gemwallet 使用 `getNetwork()` 和 `getAddress()` API
- [ ] 钱包切换网络时自动同步 + Toast 提示
- [ ] 钱包切换账户时自动同步 + Toast 提示
- [ ] 钱包登出时断开连接 + Toast 提示
- [ ] Build 通过

### Must Have
- 自动同步到 store
- Toast 弹框提示

### Must NOT Have (Guardrails)
- 不修改 Toast 组件样式
- 不修改其他无关代码
- 不添加不必要的依赖

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None
- **Agent-Executed QA**: Manual testing in dev server

### QA Policy
手动测试：
1. 连接 Crossmark/Gemwallet
2. 在钱包扩展中切换网络
3. 验证应用网络自动同步 + Toast 显示
4. 在钱包扩展中切换账户
5. 验证应用地址自动同步 + Toast 显示
6. 在钱包扩展中登出
7. 验证应用断开连接 + Toast 显示

---

## Execution Strategy

### Sequential Steps

```
Step 1: Update Window type declarations
├── Add session type for Crossmark
├── Add getNetwork type for Gemwallet
└── Add getAddress type for Gemwallet

Step 2: Fix wallet state detection (lib/wallets/index.ts)
├── Fix detectWalletNetwork for Crossmark (use session)
├── Fix detectWalletNetwork for Gemwallet (use getNetwork)
├── Fix getWalletAddress for Crossmark (use session)
└── Fix getWalletAddress for Gemwallet (use getAddress)

Step 3: Update useWalletEvents hook
├── Fix Crossmark event handlers
├── Fix Gemwallet event handlers
├── Add Toast notifications for network change
├── Add Toast notifications for account change
└── Add Toast notifications for logout

Step 4: Build and verify
└── npm run build
```

---

## TODOs

- [ ] 1. Update Window type declarations in useWalletEvents.ts

  **What to do**:
  - Update Crossmark Window type to include `session` property
  - Update Gemwallet Window type to include `getNetwork()` method
  
  **File**: `src/hooks/useWalletEvents.ts`
  
  **New types for Crossmark**:
  ```typescript
  crossmark?: {
    sdk?: {
      session?: {
        address?: string;
        network?: {
          type: string;
          protocol: string;
          wss: string;
          rpc: string;
        };
      };
      sync?: {
        isConnected: () => boolean;
      };
      on?: (event: string, callback: (data: unknown) => void) => void;
      off?: (event: string, callback: (data: unknown) => void) => void;
    };
  };
  ```
  
  **New types for Gemwallet**:
  ```typescript
  gemwallet?: {
    getNetwork?: () => Promise<{
      type: 'response' | 'reject';
      result?: {
        chain: string;
        network: string;
        websocket: string;
      };
    }>;
    getAddress?: () => Promise<{
      type: 'response' | 'reject';
      result?: {
        address: string;
      };
    }>;
    on?: (event: string, callback: (data: unknown) => void) => void;
    off?: (event: string, callback: (data: unknown) => void) => void;
  };
  ```

  **Acceptance Criteria**:
  - [ ] TypeScript types compile without errors
  - [ ] Build passes

  **Commit**: NO

---

- [ ] 2. Fix wallet state detection in lib/wallets/index.ts

  **What to do**:
  - Rewrite `detectWalletNetwork()` function
  - Rewrite `getWalletAddress()` function
  
  **File**: `src/lib/wallets/index.ts`
  
  **New detectWalletNetwork implementation**:
  ```typescript
  async function detectWalletNetwork(type: WalletType): Promise<string | null> {
    try {
      if (type === 'crossmark') {
        const session = window.crossmark?.sdk?.session;
        if (session?.network?.type) {
          return mapNetworkType(session.network.type);
        }
      }
      if (type === 'gemwallet' && window.gemwallet?.getNetwork) {
        const response = await window.gemwallet.getNetwork();
        if (response?.type === 'response' && response.result?.network) {
          return mapNetworkType(response.result.network);
        }
      }
    } catch (e) {
      console.warn('Failed to detect wallet network:', e);
    }
    return null;
  }
  ```
  
  **New getWalletAddress implementation**:
  ```typescript
  async function getWalletAddress(type: WalletType): Promise<string | null> {
    try {
      if (type === 'crossmark') {
        const session = window.crossmark?.sdk?.session;
        return session?.address || null;
      }
      if (type === 'gemwallet' && window.gemwallet?.getAddress) {
        const response = await window.gemwallet.getAddress();
        if (response?.type === 'response' && response.result?.address) {
          return response.result.address;
        }
      }
    } catch (e) {
      console.warn('Failed to get wallet address:', e);
    }
    return null;
  }
  ```

  **Acceptance Criteria**:
  - [ ] Build passes
  - [ ] Crossmark detection works
  - [ ] Gemwallet detection works

  **Commit**: NO

---

- [ ] 3. Update useWalletEvents hook with Toast notifications

  **What to do**:
  - Import `useToast` from shadcn/ui
  - Add Toast notifications for network change
  - Add Toast notifications for account change
  - Add Toast notifications for logout
  - Update event handlers to use correct data format
  
  **File**: `src/hooks/useWalletEvents.ts`
  
  **Key changes**:
  1. Import toast hook:
  ```typescript
  import { useToast } from '@/hooks/use-toast';
  ```
  
  2. Add toast hook in component:
  ```typescript
  const { toast } = useToast();
  ```
  
  3. Update Crossmark network change handler:
  ```typescript
  callbacksRef.current.networkChange = (data: unknown) => {
    const networkData = data as { type?: string };
    if (networkData?.type) {
      const newNetwork = mapNetworkType(networkData.type);
      setNetwork(newNetwork);
      toast({
        title: t('toast.networkChanged'),
        description: t('toast.networkChangedDesc', { network: newNetwork }),
      });
    }
  };
  ```
  
  4. Update Crossmark user change handler:
  ```typescript
  callbacksRef.current.userChange = async (_data: unknown) => {
    const session = window.crossmark?.sdk?.session;
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
  };
  ```
  
  5. Add Gemwallet event handlers:
  ```typescript
  if (walletType === 'gemwallet' && window.gemwallet) {
    const gem = window.gemwallet;

    callbacksRef.current.networkChange = (data: unknown) => {
      const payload = data as { result?: { network?: { name?: string } } };
      const networkName = payload.result?.network?.name;
      if (networkName) {
        const newNetwork = mapNetworkType(networkName);
        setNetwork(newNetwork);
        toast({
          title: t('toast.networkChanged'),
          description: t('toast.networkChangedDesc', { network: newNetwork }),
        });
      }
    };

    callbacksRef.current.accountChange = (data: unknown) => {
      const payload = data as { result?: { wallet?: { publicAddress?: string } } };
      const address = payload.result?.wallet?.publicAddress;
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
    };

    gem?.on?.('EVENT_NETWORK_CHANGED', callbacksRef.current.networkChange);
    gem?.on?.('EVENT_WALLET_CHANGED', callbacksRef.current.accountChange);
    gem?.on?.('EVENT_LOGOUT', () => {
      disconnect();
      toast({
        title: t('toast.walletDisconnected'),
        description: t('toast.walletDisconnectedDesc'),
        variant: 'destructive',
      });
    });

    return () => {
      gem?.off?.('EVENT_NETWORK_CHANGED', callbacksRef.current.networkChange);
      gem?.off?.('EVENT_WALLET_CHANGED', callbacksRef.current.accountChange);
    };
  }
  ```

  **Acceptance Criteria**:
  - [ ] Build passes
  - [ ] Toast shows on network change
  - [ ] Toast shows on account change
  - [ ] Toast shows on logout

  **Commit**: NO

---

- [ ] 4. Add i18n translations for toast messages

  **What to do**:
  - Add toast message translations to en.json and zh.json
  
  **Files**: `src/i18n/locales/en.json`, `src/i18n/locales/zh.json`
  
  **English translations**:
  ```json
  "toast": {
    "networkChanged": "Network Changed",
    "networkChangedDesc": "Wallet network switched to {{network}}",
    "accountChanged": "Account Changed",
    "accountChangedDesc": "Wallet account has been switched",
    "walletDisconnected": "Wallet Disconnected",
    "walletDisconnectedDesc": "Your wallet has been disconnected"
  }
  ```
  
  **Chinese translations**:
  ```json
  "toast": {
    "networkChanged": "网络已切换",
    "networkChangedDesc": "钱包网络已切换至 {{network}}",
    "accountChanged": "账户已切换",
    "accountChangedDesc": "钱包账户已切换",
    "walletDisconnected": "钱包已断开",
    "walletDisconnectedDesc": "您的钱包已断开连接"
  }
  ```

  **Acceptance Criteria**:
  - [ ] English translations added
  - [ ] Chinese translations added

  **Commit**: NO

---

- [ ] 5. Update checkWalletConnection function

  **What to do**:
  - Update the function to use correct APIs for both wallets
  
  **File**: `src/hooks/useWalletEvents.ts`
  
  **New implementation**:
  ```typescript
  export async function checkWalletConnection(walletType: string): Promise<boolean> {
    try {
      if (walletType === 'crossmark') {
        const session = window.crossmark?.sdk?.session;
        const isConnected = window.crossmark?.sdk?.sync?.isConnected?.();
        return isConnected && !!session?.address;
      }
      if (walletType === 'gemwallet' && window.gemwallet?.getAddress) {
        const response = await window.gemwallet.getAddress();
        return response?.type === 'response' && !!response.result?.address;
      }
    } catch (e) {
      console.warn('Wallet connection check failed:', e);
    }
    return false;
  }
  ```

  **Acceptance Criteria**:
  - [ ] Build passes

  **Commit**: NO

---

- [ ] 6. Build and verify

  **What to do**:
  - Run `npm run build`
  - Fix any TypeScript errors
  
  **Acceptance Criteria**:
  - [ ] Build passes with no errors
  - [ ] No new warnings

  **Commit**: YES
  - Message: `feat: wallet auto-sync with toast notification`
  - Files: `src/lib/wallets/index.ts`, `src/hooks/useWalletEvents.ts`, `src/i18n/locales/en.json`, `src/i18n/locales/zh.json`

---

## Final Verification Wave

- [ ] F1. **Manual QA** - Test in dev server
  - Connect Crossmark → Switch network → Verify sync + toast
  - Connect Crossmark → Switch account → Verify sync + toast
  - Connect Crossmark → Logout → Verify disconnect + toast
  - Connect Gemwallet → Switch network → Verify sync + toast
  - Connect Gemwallet → Switch account → Verify sync + toast
  - Connect Gemwallet → Logout → Verify disconnect + toast

- [ ] F2. **Build Verification**
  - Run `npm run build` → PASS

---

## Commit Strategy

- **Single commit**: `feat: wallet auto-sync with toast notification`
  - `src/lib/wallets/index.ts` - Fix state detection
  - `src/hooks/useWalletEvents.ts` - Add toast notifications
  - `src/i18n/locales/en.json` - Add toast translations
  - `src/i18n/locales/zh.json` - Add toast translations

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: Build successful
```

### Final Checklist
- [ ] Crossmark uses `session` for state detection
- [ ] Gemwallet uses `getNetwork()` and `getAddress()`
- [ ] Network change triggers auto-sync + toast
- [ ] Account change triggers auto-sync + toast
- [ ] Logout triggers disconnect + toast
- [ ] Build passes
