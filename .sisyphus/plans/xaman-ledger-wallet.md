# Xaman & Ledger Wallet Integration

## TL;DR

> **Quick Summary**: 集成 Xaman 钱包完整功能（连接、签名、交易），并添加 Ledger 钱包 UI 预告占位。
> 
> **Deliverables**:
> - Xaman 适配器实现（connect, signAndSubmit, sign, disconnect）
> - Xaman QR Code 显示模态框组件
> - Ledger UI 占位（图标 + "Coming Soon" 按钮）
> - 国际化文本（中/英）
> - 类型定义更新
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: 依赖安装 → Xaman适配器 → QR组件 → UI集成 → i18n

---

## Context

### Original Request
用户要求实现 Xaman 钱包的完整集成，并预告 Ledger 硬件钱包支持。

### Interview Summary
**Key Discussions**:
- **SDK 选择**: 使用 `xumm` Browser SDK（只需 API Key，前端安全）
- **API Key**: 用户已有，配置到 `VITE_XUMM_API_KEY`
- **连接方式**: 显示 QR Code 模态框（桌面端），移动端支持 Deeplink
- **Ledger 范围**: 仅 UI 占位，显示 "Coming Soon" 按钮
- **测试**: 无需自动化测试

**Research Findings**:
- **架构不匹配**: 现有 `connectWallet()` 期望同步返回地址，但 Xaman SDK 是事件驱动。需用 Promise 包装事件。
- **QR 显示**: 创建独立的 `XamanQrModal` 组件（比修改现有 WalletSelectModal 更清晰）
- **SDK 事件**: `ready`, `success`, `retrieved`, `logout`, `error` - 需要正确处理

### Metis Review
**Identified Gaps** (addressed):
- **架构适配**: Xaman 事件驱动需包装为 Promise 以匹配现有接口
- **QR 组件位置**: 创建独立 XamanQrModal 组件
- **边缘情况**: QR 过期、用户取消、会话过期需处理

---

## Work Objectives

### Core Objective
1. 实现 Xaman 钱包的完整适配器，遵循现有钱包架构模式
2. 添加 Ledger 钱包 UI 预告，为后续实现做准备

### Concrete Deliverables
- `src/lib/wallets/index.ts` - 添加 Xaman 适配器函数
- `src/components/wallet/XamanQrModal.tsx` - QR Code 显示组件
- `src/components/wallet/WalletSelectModal.tsx` - 更新钱包选项
- `src/types/index.ts` - 添加 'ledger' 类型
- `src/i18n/locales/zh.json` 和 `en.json` - 添加国际化文本
- `public/ledger.svg` - Ledger 图标

### Definition of Done
- [ ] Xaman 钱包可连接（显示 QR、扫描后获取地址）
- [ ] Xaman 可签名交易（创建 payload、返回 hash）
- [ ] Xaman 可断开连接
- [ ] Ledger 显示为 "Coming Soon"
- [ ] 所有文本支持中英文

### Must Have
- Xaman 完整功能实现
- QR Code 模态框显示
- Ledger UI 占位
- 国际化

### Must NOT Have (Guardrails)
- **不要**重构现有钱包适配器模式
- **不要**添加 Ledger 实际实现（仅 UI 占位）
- **不要**添加交易验证逻辑
- **不要**修改 Crossmark/Gemwallet 实现
- **不要**创建 "有用的" 抽象层或接口

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO（项目无测试框架）
- **Automated tests**: None
- **Framework**: N/A
- **Agent-Executed QA**: ALWAYS（所有任务必须有 QA 场景）

### QA Policy
每个任务包含 Agent-Executed QA 场景：
- **UI 验证**: Playwright 打开浏览器、导航、验证元素存在
- **代码验证**: Bash (grep) 验证代码结构
- **功能验证**: 手动测试步骤（Xaman 需要真实手机扫描）

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - 可并行):
├── Task 1: 安装 xumm SDK 依赖 [quick]
├── Task 2: 添加 Ledger 类型定义 [quick]
├── Task 3: 添加国际化文本 [quick]
└── Task 4: 添加 Ledger 图标 [quick]

Wave 2 (Xaman Core - 顺序执行):
├── Task 5: 实现 Xaman 适配器 [deep]
├── Task 6: 创建 XamanQrModal 组件 [visual-engineering]
└── Task 7: 更新 WalletSelectModal [quick]

Wave 3 (Integration & Ledger UI - 可并行):
├── Task 8: 集成 Xaman 连接流程 [unspecified-high]
└── Task 9: 添加 Ledger UI 占位 [quick]

Critical Path: T1 → T5 → T6 → T7 → T8
Parallel Speedup: Wave 1 (4 tasks) + Wave 3 partial (T9)
```

### Dependency Matrix

- **1-4**: — — 5-9
- **5**: 1 — 6, 7, 8
- **6**: 5 — 7, 8
- **7**: 3, 6 — 8
- **8**: 5, 6, 7 — —
- **9**: 2, 3, 4 — —

### Agent Dispatch Summary

- **Wave 1**: **4 tasks** — T1→quick, T2→quick, T3→quick, T4→quick
- **Wave 2**: **3 tasks** — T5→deep, T6→visual-engineering, T7→quick
- **Wave 3**: **2 tasks** — T8→unspecified-high, T9→quick

---

## TODOs

### Wave 1: Foundation (并行执行)

- [ ] 1. 安装 Xaman SDK 依赖

  **What to do**:
  - 安装 `xumm` npm 包（Browser SDK）
  - 在 `.env` 添加 `VITE_XUMM_API_KEY` 占位符
  - 更新 `.env.example` 添加配置说明

  **Must NOT do**:
  - 不要安装 `@xumm/sdk`（那是后端 SDK）
  - 不要添加其他钱包相关依赖

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的依赖安装和配置
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `package.json` - 添加 xumm 依赖
  - `.env` - 添加 VITE_XUMM_API_KEY
  - `.env.example` - 添加配置说明

  **Acceptance Criteria**:
  - [ ] `npm install` 成功
  - [ ] `package.json` 包含 `xumm` 依赖
  - [ ] `.env.example` 包含 `VITE_XUMM_API_KEY=your-xaman-api-key-here`

  **QA Scenarios**:
  ```
  Scenario: 验证依赖安装
    Tool: Bash
    Steps:
      1. grep '"xumm"' package.json
    Expected Result: 找到 xumm 依赖条目
    Evidence: .sisyphus/evidence/task-1-deps.txt

  Scenario: 验证环境变量配置
    Tool: Bash
    Steps:
      1. grep 'VITE_XUMM_API_KEY' .env.example
    Expected Result: 找到配置说明
    Evidence: .sisyphus/evidence/task-1-env.txt
  ```

  **Commit**: YES
  - Message: `feat(wallet): add xumm sdk dependency`
  - Files: `package.json`, `package-lock.json`, `.env.example`

---

- [ ] 2. 添加 Ledger 类型定义

  **What to do**:
  - 在 `src/types/index.ts` 的 `WalletType` 添加 `'ledger'`
  - 当前类型: `'xaman' | 'crossmark' | 'gemwallet'`
  - 更新后: `'xaman' | 'crossmark' | 'gemwallet' | 'ledger'`

  **Must NOT do**:
  - 不要创建 Ledger 适配器函数
  - 不要添加 Ledger 相关接口

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单行类型修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - `src/types/index.ts:WalletType` - 类型定义位置

  **Acceptance Criteria**:
  - [ ] `WalletType` 包含 `'ledger'`
  - [ ] TypeScript 编译通过

  **QA Scenarios**:
  ```
  Scenario: 验证类型定义
    Tool: Bash
    Steps:
      1. grep "'ledger'" src/types/index.ts
    Expected Result: 找到 ledger 类型
    Evidence: .sisyphus/evidence/task-2-type.txt
  ```

  **Commit**: NO (groups with Task 4)

---

- [ ] 3. 添加国际化文本

  **What to do**:
  - 在 `src/i18n/locales/zh.json` 添加 Xaman 和 Ledger 相关文本
  - 在 `src/i18n/locales/en.json` 添加对应英文文本
  - 需要添加的 keys:
    - `wallet.xaman` - Xaman 名称
    - `wallet.ledger` - Ledger 名称
    - `wallet.scanQr` - 扫描 QR 提示
    - `wallet.connecting` - 连接中
    - `wallet.comingSoon` - 即将支持

  **Must NOT do**:
  - 不要添加其他钱包的文本
  - 不要修改现有文本结构

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的 JSON 文本添加
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 7, Task 9
  - **Blocked By**: None

  **References**:
  - `src/i18n/locales/zh.json` - 中文翻译文件
  - `src/i18n/locales/en.json` - 英文翻译文件

  **Acceptance Criteria**:
  - [ ] `zh.json` 包含 `wallet.xaman`, `wallet.ledger`, `wallet.scanQr`, `wallet.connecting`, `wallet.comingSoon`
  - [ ] `en.json` 包含对应英文文本

  **QA Scenarios**:
  ```
  Scenario: 验证中文文本
    Tool: Bash
    Steps:
      1. grep 'xaman' src/i18n/locales/zh.json
    Expected Result: 找到 Xaman 中文文本
    Evidence: .sisyphus/evidence/task-3-zh.txt

  Scenario: 验证英文文本
    Tool: Bash
    Steps:
      1. grep 'xaman' src/i18n/locales/en.json
    Expected Result: 找到 Xaman 英文文本
    Evidence: .sisyphus/evidence/task-3-en.txt
  ```

  **Commit**: NO (groups with Task 4)

---

- [ ] 4. 添加 Ledger 图标

  **What to do**:
  - 在 `public/` 目录添加 `ledger.svg` 图标文件
  - 图标应为 Ledger 官方 Logo（可从 brand.ledger.com 获取）
  - 在 `src/components/wallet/WalletSelectModal.tsx` 添加 `LedgerIcon` 组件

  **Must NOT do**:
  - 不要添加 Ledger 钱包选项到 WALLET_OPTIONS（Task 9 负责）
  - 不要创建 Ledger 相关逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的资源文件添加
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - `public/xaman.svg` - 参考 Xaman 图标格式
  - `src/components/wallet/WalletSelectModal.tsx:XamanIcon` - 参考图标组件实现

  **Acceptance Criteria**:
  - [ ] `public/ledger.svg` 文件存在
  - [ ] `LedgerIcon` 组件存在

  **QA Scenarios**:
  ```
  Scenario: 验证图标文件
    Tool: Bash
    Steps:
      1. ls public/ledger.svg
    Expected Result: 文件存在
    Evidence: .sisyphus/evidence/task-4-icon.txt
  ```

  **Commit**: YES
  - Message: `feat(wallet): add ledger icon and type definition`
  - Files: `public/ledger.svg`, `src/components/wallet/WalletSelectModal.tsx`, `src/types/index.ts`, `src/i18n/locales/zh.json`, `src/i18n/locales/en.json`
### Wave 2: Xaman Core (顺序执行)

- [ ] 5. 实现 Xaman 适配器

  **What to do**:
  - 在 `src/lib/wallets/index.ts` 实现 Xaman 适配器函数：
    - `connectXaman()` - 连接钱包，返回地址
    - `signAndSubmitXaman(transaction)` - 签名并提交交易
    - `signXaman(transaction)` - 仅签名（Xaman 默认 sign+submit）
    - `getXamanNetwork()` - 获取网络类型
    - `disconnectXaman()` - 断开连接
  - 创建 Xumm 单例实例
  - 在 `connectWallet()` 添加 xaman case
  - 在 `signAndSubmitTransaction()` 添加 xaman case
  - 在 `signTransaction()` 添加 xaman case

  **关键实现细节**:
  - Xaman SDK 是事件驱动，需要用 Promise 包装
  - `connectXaman()` 模式:
    ```typescript
    async function connectXaman(): Promise<string> {
      return new Promise((resolve, reject) => {
        xumm.on('success', async () => {
          const account = await xumm.user.account;
          if (account) resolve(account);
          else reject(new Error('No address received'));
        });
        xumm.on('error', (err) => reject(err));
        xumm.authorize();
      });
    }
    ```
  - `signAndSubmitXaman()` 使用 `xumm.payload.createAndSubscribe()`

  **Must NOT do**:
  - 不要重构现有钱包 API 模式
  - 不要创建额外的抽象接口
  - 不要修改 Crossmark/Gemwallet 实现

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 核心逻辑实现，需要理解现有架构和 Xaman SDK
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential)
  - **Blocks**: Task 6, 7, 8
  - **Blocked By**: Task 1

  **References**:
  - `src/lib/wallets/index.ts:connectCrossmark()` - 参考连接模式
  - `src/lib/wallets/index.ts:signAndSubmitCrossmark()` - 参考签名模式
  - Xaman SDK 文档: `xumm.payload.createAndSubscribe(tx, callback)`

  **Acceptance Criteria**:
  - [ ] `connectXaman()` 函数存在并返回 Promise<string>
  - [ ] `signAndSubmitXaman()` 函数存在并返回 `{ hash: string }`
  - [ ] `disconnectXaman()` 函数存在
  - [ ] `connectWallet('xaman')` 调用 `connectXaman()`
  - [ ] TypeScript 编译通过

  **QA Scenarios**:
  ```
  Scenario: 验证适配器函数存在
    Tool: Bash
    Steps:
      1. grep 'connectXaman' src/lib/wallets/index.ts
      2. grep 'signAndSubmitXaman' src/lib/wallets/index.ts
    Expected Result: 找到所有函数定义
    Evidence: .sisyphus/evidence/task-5-adapter.txt

  Scenario: 验证类型编译
    Tool: Bash
    Steps:
      1. npm run build 2>&1 | head -20
    Expected Result: 编译成功，无类型错误
    Evidence: .sisyphus/evidence/task-5-build.txt
  ```

  **Commit**: YES
  - Message: `feat(wallet): implement xaman wallet adapter`
  - Files: `src/lib/wallets/index.ts`

---

- [ ] 6. 创建 XamanQrModal 组件

  **What to do**:
  - 创建 `src/components/wallet/XamanQrModal.tsx`
  - 组件功能：
    - 显示 QR Code 图片（从 Xaman SDK 获取）
    - 显示 payload URL（用于移动端 Deeplink）
    - 显示加载状态
    - 显示取消按钮
  - Props 接口:
    ```typescript
    interface XamanQrModalProps {
      isOpen: boolean;
      qrUrl: string | null;       // QR Code 图片 URL
      payloadUrl: string | null;  // Deeplink URL
      onClose: () => void;
    }
    ```
  - 使用 shadcn/ui Dialog 组件
  - 移动端检测：自动跳转 Deeplink

  **Must NOT do**:
  - 不要在组件内调用 Xaman SDK（由父组件传入 URL）
  - 不要添加交易逻辑

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 组件开发，需要良好的用户体验设计
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Modal 组件设计

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Task 5)
  - **Blocks**: Task 7, 8
  - **Blocked By**: Task 5

  **References**:
  - `src/components/wallet/WalletSelectModal.tsx` - 参考 Modal 样式
  - `src/components/ui/dialog.tsx` - shadcn/ui Dialog 组件
  - Xaman SDK: `created.refs.qr_png` 获取 QR URL

  **Acceptance Criteria**:
  - [ ] `XamanQrModal.tsx` 文件存在
  - [ ] 组件接受 `isOpen`, `qrUrl`, `payloadUrl`, `onClose` props
  - [ ] 显示 QR Code 图片
  - [ ] 移动端显示 Deeplink 按钮

  **QA Scenarios**:
  ```
  Scenario: 验证组件文件存在
    Tool: Bash
    Steps:
      1. ls src/components/wallet/XamanQrModal.tsx
    Expected Result: 文件存在
    Evidence: .sisyphus/evidence/task-6-file.txt

  Scenario: 验证组件 Props
    Tool: Bash
    Steps:
      1. grep 'interface XamanQrModalProps' src/components/wallet/XamanQrModal.tsx
    Expected Result: 找到 Props 接口定义
    Evidence: .sisyphus/evidence/task-6-props.txt
  ```

  **Commit**: NO (groups with Task 7)

---

- [ ] 7. 更新 WalletSelectModal

  **What to do**:
  - 在 `src/components/wallet/WalletSelectModal.tsx` 更新 Xaman 配置：
    - 移除 `comingSoon: true`
  - 添加 `onConnectXaman` 回调处理
  - 集成 `XamanQrModal` 组件
  - 连接流程：
    1. 用户点击 Xaman 选项
    2. 调用 `onConnectWallet('xaman')`
    3. 父组件创建 payload，获取 QR URL
    4. 显示 `XamanQrModal`
    5. 用户扫描，SDK 触发 success 事件
    6. 关闭 Modal，更新连接状态

  **Must NOT do**:
  - 不要在 Modal 内直接调用 Xaman SDK
  - 不要修改其他钱包的逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的配置更新和组件集成
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Task 6)
  - **Blocks**: Task 8
  - **Blocked By**: Task 3, Task 6

  **References**:
  - `src/components/wallet/WalletSelectModal.tsx:WALLET_OPTIONS` - 钱包配置
  - `src/components/wallet/XamanQrModal.tsx` - QR Modal 组件

  **Acceptance Criteria**:
  - [ ] Xaman 的 `comingSoon` 为 `false` 或不存在
  - [ ] `XamanQrModal` 被正确导入和使用

  **QA Scenarios**:
  ```
  Scenario: 验证 Xaman 可选择
    Tool: Bash
    Steps:
      1. grep -A5 "type: 'xaman'" src/components/wallet/WalletSelectModal.tsx | grep -v "comingSoon: true"
    Expected Result: Xaman 配置中没有 comingSoon: true
    Evidence: .sisyphus/evidence/task-7-xaman-selectable.txt

  Scenario: 验证 QR Modal 导入
    Tool: Bash
    Steps:
      1. grep 'XamanQrModal' src/components/wallet/WalletSelectModal.tsx
    Expected Result: 找到组件导入/使用
    Evidence: .sisyphus/evidence/task-7-qr-import.txt
  ```

  **Commit**: YES
  - Message: `feat(wallet): add xaman qr modal and update wallet selection`
  - Files: `src/components/wallet/WalletSelectModal.tsx`, `src/components/wallet/XamanQrModal.tsx`

---

### Wave 3: Integration & Ledger UI (部分并行)

- [ ] 8. 集成 Xaman 连接流程

  **What to do**:
  - 在 `src/components/wallet/WalletConnect.tsx` 集成 Xaman 连接逻辑
  - 处理连接状态：
    - 点击 Xaman → 调用 `connectXaman()`
    - `connectXaman()` 内部：
      1. 调用 `xumm.payload.createAndSubscribe()` 创建连接 payload
      2. 返回 QR URL
      3. 显示 `XamanQrModal`
      4. 等待用户扫描
      5. SDK 触发 success → 返回地址
  - 更新 Zustand store: `setAddress`, `setConnected`, `setWalletType('xaman')`

  **边缘情况处理**:
  - 用户关闭 QR Modal → 取消连接
  - QR 过期 → 显示错误提示
  - 已有会话 → 直接恢复（`retrieved` 事件）

  **Must NOT do**:
  - 不要修改其他钱包的连接逻辑
  - 不要添加自动重连逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 集成逻辑较复杂，需要处理多种状态
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after Task 7)
  - **Blocks**: Final Verification
  - **Blocked By**: Task 5, Task 6, Task 7

  **References**:
  - `src/components/wallet/WalletConnect.tsx` - 主钱包组件
  - `src/stores/wallet.ts` - Zustand store
  - `src/lib/wallets/index.ts:connectXaman()` - 适配器函数

  **Acceptance Criteria**:
  - [ ] 点击 Xaman 选项触发连接流程
  - [ ] QR Modal 正确显示
  - [ ] 连接成功后地址显示在 UI
  - [ ] `npm run build` 编译通过

  **QA Scenarios**:
  ```
  Scenario: 验证编译成功
    Tool: Bash
    Steps:
      1. npm run build
    Expected Result: 编译成功，无错误
    Evidence: .sisyphus/evidence/task-8-build.txt

  Scenario: 手动测试 Xaman 连接
    Tool: Manual (需真实手机)
    Steps:
      1. 打开应用
      2. 点击连接钱包
      3. 选择 Xaman
      4. 扫描 QR Code
    Expected Result: 连接成功，地址显示
    Evidence: .sisyphus/evidence/task-8-manual-connection.txt
  ```

  **Commit**: YES
  - Message: `feat(wallet): integrate xaman connection flow`
  - Files: `src/components/wallet/WalletConnect.tsx`, `src/lib/wallets/index.ts`

---

- [ ] 9. 添加 Ledger UI 占位

  **What to do**:
  - 在 `src/components/wallet/WalletSelectModal.tsx` 的 `WALLET_OPTIONS` 添加 Ledger：
    ```typescript
    {
      type: 'ledger',
      name: t('wallet.ledger'),
      icon: LedgerIcon,
      comingSoon: true,  // 关键：标记为即将支持
    }
    ```
  - 确保 `LedgerIcon` 组件已导入（Task 4 完成）

  **Must NOT do**:
  - 不要创建 `connectLedger()` 函数
  - 不要添加 Ledger SDK 依赖
  - 不要实现任何 Ledger 功能逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的配置添加
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 8)
  - **Parallel Group**: Wave 3
  - **Blocks**: Final Verification
  - **Blocked By**: Task 2, Task 3, Task 4

  **References**:
  - `src/components/wallet/WalletSelectModal.tsx:WALLET_OPTIONS` - 钱包配置
  - `src/components/wallet/WalletSelectModal.tsx:LedgerIcon` - 图标组件

  **Acceptance Criteria**:
  - [ ] Ledger 选项在 WALLET_OPTIONS 中存在
  - [ ] `comingSoon: true` 已设置
  - [ ] Ledger 图标正确显示

  **QA Scenarios**:
  ```
  Scenario: 验证 Ledger 占位存在
    Tool: Bash
    Steps:
      1. grep -A5 "type: 'ledger'" src/components/wallet/WalletSelectModal.tsx | grep "comingSoon: true"
    Expected Result: 找到 Ledger 配置，且 comingSoon 为 true
    Evidence: .sisyphus/evidence/task-9-ledger-placeholder.txt

  Scenario: 验证 UI 显示
    Tool: Playwright
    Steps:
      1. 打开应用
      2. 点击连接钱包
      3. 验证 Ledger 选项显示
      4. 验证 "Coming Soon" 标签
    Expected Result: Ledger 选项可见，标记为即将支持
    Evidence: .sisyphus/evidence/task-9-ledger-ui.png
  ```

  **Commit**: YES
  - Message: `feat(wallet): add ledger ui placeholder`
  - Files: `src/components/wallet/WalletSelectModal.tsx`

---


- [ ] F1. **Plan Compliance Audit** — `oracle`
  验证所有 Must Have 实现，Must NOT Have 未实现。检查 Xaman 可连接/签名/断开，Ledger 仅 UI 占位。

- [ ] F2. **Code Quality Review** — `unspecified-high`
  运行 `npm run build` 验证编译通过。检查无 `as any`、console.log 等。

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill for UI)
  手动测试 Xaman 连接流程（需真实手机）。验证 Ledger 显示 "Coming Soon"。

- [ ] F4. **Scope Fidelity Check** — `deep`
  确认未超出范围：无 Ledger 实现、无抽象层、未修改现有钱包代码。

---

## Commit Strategy

- **Commit 1**: `feat(wallet): add xaman sdk dependency and ledger type`
- **Commit 2**: `feat(wallet): implement xaman wallet adapter`
- **Commit 3**: `feat(wallet): add xaman qr modal and update wallet selection`

---

## Success Criteria

### Verification Commands
```bash
# Xaman 不再是 coming soon
grep -q "type: 'xaman'" src/components/wallet/WalletSelectModal.tsx && ! grep -q "comingSoon: true.*xaman" src/components/wallet/WalletSelectModal.tsx

# Ledger 是 coming soon
grep -q "type: 'ledger'" src/components/wallet/WalletSelectModal.tsx && grep -q "comingSoon: true" src/components/wallet/WalletSelectModal.tsx

# WalletType 包含 ledger
grep -q "'ledger'" src/types/index.ts

# i18n 存在
grep -q "xaman" src/i18n/locales/zh.json && grep -q "xaman" src/i18n/locales/en.json
```

### Final Checklist
- [ ] Xaman 可选择（非 coming soon）
- [ ] Xaman QR 模态框可显示
- [ ] Xaman 可连接（扫描后获取地址）
- [ ] Xaman 可签名交易
- [ ] Ledger 显示为 coming soon
- [ ] WalletType 包含 'ledger'
- [ ] 中英文文本完整
