# Fix Wallet Event Listeners

## TL;DR

> **Quick Summary**: 修复钱包事件监听器，使 Crossmark 和 Gemwallet 切换账户/网络时能正确更新 UI 和显示 Toast 提示
> 
> **Deliverables**: 
> - 修复 Crossmark 事件回调数据格式
> - 修复 Gemwallet 事件回调数据格式
> - 添加调试日志以便排查问题
> - 优化 useEffect 依赖项
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - sequential

---

## Context

### Original Request
用户反馈钱包切换 Account 和网络时，右上角的网络与钱包地址没有更新，也没有弹框提醒。

### Research Findings

根据官方文档：

**Crossmark**:
- `'network-change'` 事件回调数据: `{ type: 'main'|'test', protocol, wss, rpc }` ✅ 当前正确
- `'user-change'` 事件回调数据: `{ username, type, slug, developer }` - 不是地址
- 切换账户后应该从 `sdk.session.address` 获取新地址
- 可能存在时序问题，需要延迟获取 session

**Gemwallet**:
- `EVENT_NETWORK_CHANGED` 回调数据: `{ network: { name, server, description } }`
- `EVENT_WALLET_CHANGED` 回调数据: `{ wallet: { publicAddress } }`
- 当前代码错误地使用 `payload.result?.network?.name`，应该是 `result?.network?.name`

### Current Problems

| 钱包 | 问题 | 解决方案 |
|------|------|---------|
| Crossmark | `user-change` 回调后 session 可能未更新 | 添加 setTimeout 延迟获取 |
| Gemwallet | 回调数据格式错误 | 移除 `.result` 嵌套 |
| 通用 | 缺少调试日志 | 添加 console.log |
| 通用 | useEffect 依赖项包含 toast | 移除 toast 依赖 |

---

## Work Objectives

### Core Objective
修复事件监听器，使钱包切换时正确更新 UI 和显示 Toast。

### Concrete Deliverables
- `src/hooks/useWalletEvents.ts` - 修复事件监听逻辑

### Definition of Done
- [ ] Crossmark 切换网络时更新 UI + Toast
- [ ] Crossmark 切换账户时更新地址 + Toast
- [ ] Gemwallet 切换网络时更新 UI + Toast
- [ ] Gemwallet 切换账户时更新地址 + Toast
- [ ] Build 通过

---

## TODOs

- [ ] 1. Fix useWalletEvents.ts

  **What to do**:
  1. 修复 Crossmark `userChange` 回调 - 添加 setTimeout 延迟获取 session
  2. 修复 Gemwallet 回调数据格式 - 移除 `.result` 嵌套
  3. 添加调试日志 (console.log)
  4. 优化 useEffect 依赖项 - 移除 `t` 和 `toast`
  
  **File**: `src/hooks/useWalletEvents.ts`
  
  **Key changes**:
  
  Crossmark userChange 修复:
  ```typescript
  callbacksRef.current.userChange = () => {
    console.log('[Crossmark] user-change event triggered');
    setTimeout(() => {
      const session = window.crossmark?.sdk?.session;
      console.log('[Crossmark] session after user-change:', session);
      if (session?.address) {
        setAddress(session.address);
        toast({ title: t('toast.accountChanged'), ... });
      } else {
        disconnect();
        toast({ title: t('toast.walletDisconnected'), ... });
      }
    }, 100);
  };
  ```
  
  Gemwallet 回调数据格式修复:
  ```typescript
  // 错误 (当前)
  const payload = data as { result?: { network?: { name?: string } } };
  const networkName = payload.result?.network?.name;
  
  // 正确
  const result = data as { network?: { name?: string } };
  const networkName = result?.network?.name;
  ```
  
  useEffect 依赖项优化:
  ```typescript
  // 错误 (当前)
  }, [connected, walletType, setAddress, setNetwork, disconnect, t, toast]);
  
  // 正确
  }, [connected, walletType, setAddress, setNetwork, disconnect]);
  ```
  
  **Acceptance Criteria**:
  - [ ] Build 通过
  - [ ] 控制台显示调试日志

  **Commit**: YES
  - Message: `fix: wallet event listeners for Crossmark and Gemwallet`
  - Files: `src/hooks/useWalletEvents.ts`

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: Build successful
```

### Manual Testing
1. 连接 Crossmark
2. 在 Crossmark 中切换网络 → 检查 UI 更新 + Toast
3. 在 Crossmark 中切换账户 → 检查地址更新 + Toast
4. 连接 Gemwallet
5. 在 Gemwallet 中切换网络 → 检查 UI 更新 + Toast
6. 在 Gemwallet 中切换账户 → 检查地址更新 + Toast
