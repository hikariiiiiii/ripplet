# XRPL Documentation Links Feature

## TL;DR

> **Quick Summary**: 在所有交易功能页面添加XRPL官方文档链接，包括交易类型API文档和按类别分类的概念页面链接，帮助用户在POC和学习阶段快速跳转查看官方文档。
>
> **Deliverables**:
> - 修改后的 TransactionPageWrapper 组件（支持文档链接）
> - XRPL文档URL映射工具函数
> - 35个页面更新（31个交易页面 + 4个SC+ Labs）
> - i18n翻译更新（中/英）
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: URL验证 → 工具函数 → Wrapper组件 → 页面更新 → QA

---

## Context

### Original Request
用户希望在Ripplet DApp的上链功能页面添加XRPL官方文档链接，当前是POC和学习阶段，方便用户跳转查看官方文档。

### Interview Summary
**Key Discussions**:
- 链接位置：标题下方（在TransactionPageWrapper中实现）
- 链接形式：简洁文字链接
- 链接类型：交易类型API文档 + 按类别分类的概念链接
- 测试策略：无单元测试，仅Agent QA验证

**Research Findings**:
- XRPL交易类型文档URL模式：`https://xrpl.org/docs/references/protocol/transactions/types/{type.toLowerCase()}`
- 概念页面需要按类别单独映射（NFT、MPT、IOU等各有不同路径）
- TransactionPageWrapper是所有交易页面的通用包装组件

### Metis Review
**Identified Gaps** (addressed):
- URL模式验证：添加前置验证任务
- 概念页面映射：需要创建显式映射表
- SC+ Labs链接：链接到底层XRPL技术概念（MPT→MPT概念，NFT→NFT概念）
- 安全属性：必须添加 `target="_blank"` 和 `rel="noopener noreferrer"`
- 暗色模式：使用现有文字颜色类确保兼容

---

## Work Objectives

### Core Objective
在所有已实现的交易功能页面添加XRPL官方文档链接，提供两种链接：
1. 交易类型API文档链接（每个交易类型对应一个）
2. 概念页面链接（按交易类别分类）

### Concrete Deliverables
- `src/lib/xrpl/docUrls.ts` - URL映射工具函数
- `src/components/transaction/TransactionPageWrapper.tsx` - 添加docUrl/conceptUrl支持
- 37个交易页面更新（传递文档URL属性）
- `src/i18n/locales/zh.json` - 中文翻译
- `src/i18n/locales/en.json` - 英文翻译

### Definition of Done
- [ ] 所有已实现交易页面显示文档链接
- [ ] 链接点击后在新标签页打开正确URL
- [ ] 中英文切换正确显示链接文本
- [ ] 无控制台错误，构建成功

### Must Have
- 每个交易页面显示API文档链接
- 按类别显示概念链接（MPT、NFT、IOU、Credential、Payment、Account）
- 链接在新标签页打开
- 安全属性（noopener noreferrer）
- i18n支持

### Must NOT Have (Guardrails)
- 不添加未实现交易类型的链接（planned类型）
- 不修改现有交易表单逻辑或验证
- 不添加新的npm依赖
- 不添加链接验证/爬虫系统
- 不添加tooltips或解释性弹窗
- 不添加点击追踪/分析

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: N/A (no unit tests)
- **Automated tests**: None
- **Framework**: N/A
- **Agent QA**: Playwright验证链接存在且可点击

### QA Policy
Each task includes agent-executed QA scenarios using Playwright:
- Navigate to transaction pages
- Verify link elements exist
- Verify link attributes (href, target, rel)
- Verify link text changes with language switch

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — URL验证与映射):
├── Task 1: 验证XRPL文档URL模式 [quick]
└── Task 2: 创建概念页面URL映射表 [quick]

Wave 2 (After Wave 1 — 核心组件):
├── Task 3: 创建URL工具函数 [quick]
├── Task 4: 更新TransactionPageWrapper [visual-engineering]
└── Task 5: 添加i18n翻译 [quick]

Wave 3 (After Wave 2 — 页面更新):
├── Task 6: 更新MPT类交易页面 (10个) [quick]
├── Task 7: 更新NFT类交易页面 (5个) [quick]
├── Task 8: 更新IOU/Token类交易页面 (7个) [quick]
├── Task 9: 更新XRP Payment类交易页面 (4个) [quick]
├── Task 10: 更新Account类交易页面 (2个) [quick]
├── Task 11: 更新Credential类交易页面 (3个) [quick]
└── Task 12: 更新SC+ Labs页面 (4个scheme) [quick]

Wave 4 (After Wave 3 — 集成验证):
├── Task 13: 构建与Lint验证 [quick]
└── Task 14: Playwright集成QA [quick]

Wave FINAL (After ALL tasks — 独立审核):
├── Task F1: 计划合规审计 (oracle)
├── Task F2: 代码质量审查 (unspecified-high)
├── Task F3: 实际手动QA (unspecified-high)
└── Task F4: 范围保真检查 (deep)

Critical Path: Task 1 → Task 3 → Task 4 → Task 6-12 → Task 13-14 → F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 7 (Wave 3)
```

### Dependency Matrix

- **1**: — — 3, 1
- **2**: — — 3, 1
- **3**: 1, 2 — 4, 1
- **4**: 3, 5 — 6-12, 1
- **5**: — — 4, 1
- **6-12**: 4 — 13, 1
- **13**: 6-12 — 14, 1
- **14**: 13 — F1-F4, 1

### Agent Dispatch Summary

- **Wave 1**: **2** — T1 → `quick`, T2 → `quick`
- **Wave 2**: **3** — T3 → `quick`, T4 → `visual-engineering`, T5 → `quick`
- **Wave 3**: **7** — T6-T12 → `quick`
- **Wave 4**: **2** — T13 → `quick`, T14 → `quick`
- **FINAL**: **4** — F1 → `oracle`, F2-F4 → `unspecified-high`/`deep`

---

## TODOs

- [ ] 1. 验证XRPL文档URL模式

  **What to do**:
  - 使用浏览器访问XRPL官方文档，验证URL模式
  - 测试5个交易类型：Payment, NFTokenMint, MPTokenIssuanceCreate, TrustSet, CredentialCreate
  - 验证URL格式：`https://xrpl.org/docs/references/protocol/transactions/types/{type.toLowerCase()}`
  - 记录任何不符合模式的例外情况

  **Must NOT do**:
  - 不要假设所有URL都符合模式，必须实际验证

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的URL验证任务
  - **Skills**: [`dev-browser`]
    - `dev-browser`: 需要浏览器访问验证URL

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - XRPL Transaction Types Index: `https://xrpl.org/docs/references/protocol/transactions/types`
  - 已实现交易类型列表: `AGENTS.md` (MPT 10个, NFT 5个, IOU 7个, XRP 4个, Account 2个, Credential 3个)

  **Acceptance Criteria**:
  - [ ] 5个交易类型URL验证通过
  - [ ] 任何例外情况已记录

  **QA Scenarios**:
  ```
  Scenario: URL模式验证
    Tool: dev-browser (Playwright)
    Steps:
      1. Navigate to https://xrpl.org/docs/references/protocol/transactions/types/payment
      2. Verify page loads successfully (status 200)
      3. Repeat for: nftokenmint, mptokenissuancecreate, trustset, credentialcreate
    Expected Result: All 5 URLs return valid pages
    Evidence: .sisyphus/evidence/task-01-url-verification.txt
  ```

  **Commit**: NO

- [ ] 2. 创建概念页面URL映射表

  **What to do**:
  - 研究XRPL概念文档结构
  - 为每个交易类别找到对应的概念页面URL
  - 类别映射：
    - MPT → Multi-Purpose Tokens 概念页
    - NFT → Non-Fungible Tokens 概念页
    - IOU/Token → Fungible Tokens / Issued Currencies 概念页
    - Credential → Credentials 概念页
    - Payment → Payment Types 概念页
    - Account → Account Management 概念页（如存在）
    - Escrow → Escrow 概念页
  - 记录完整的概念URL映射表

  **Must NOT do**:
  - 不要猜测URL，必须实际验证页面存在

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的URL研究任务
  - **Skills**: [`dev-browser`]
    - `dev-browser`: 需要浏览器访问验证概念页面

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - XRPL Concepts Index: `https://xrpl.org/docs/concepts`
  - XRPL Tokens Section: `https://xrpl.org/docs/concepts/tokens`

  **Acceptance Criteria**:
  - [ ] 6+类别概念URL已验证并记录
  - [ ] 对于没有独立概念页的类别，记录替代方案

  **QA Scenarios**:
  ```
  Scenario: 概念URL映射验证
    Tool: dev-browser (Playwright)
    Steps:
      1. Navigate to https://xrpl.org/docs/concepts
      2. Find and verify concept pages for: tokens/fungible-tokens, tokens/nftokens, tokens/mptokens
      3. Find concept pages for: credentials, payment-types/escrow
      4. Record all valid URLs
    Expected Result: Concept URLs for all categories identified
    Evidence: .sisyphus/evidence/task-02-concept-mapping.txt
  ```

  **Commit**: NO

- [ ] 3. 创建URL工具函数

  **What to do**:
  - 创建文件 `src/lib/xrpl/docUrls.ts`
  - 实现 `getXRPLTransactionDocUrl(transactionType: string): string` 函数
  - 创建 `XRPL_DOC_CONCEPTS` 常量映射表
  - 导出类型定义（可选）

  **工具函数示例**:
  ```typescript
  // 交易类型文档URL
  export function getXRPLTransactionDocUrl(transactionType: string): string {
    const baseUrl = 'https://xrpl.org/docs/references/protocol/transactions/types';
    return `${baseUrl}/${transactionType.toLowerCase()}`;
  }

  // 概念页面映射
  export const XRPL_DOC_CONCEPTS = {
    mpt: 'https://xrpl.org/docs/concepts/tokens/mptokens',
    nft: 'https://xrpl.org/docs/concepts/tokens/nftokens',
    iou: 'https://xrpl.org/docs/concepts/tokens/fungible-tokens',
    credential: 'https://xrpl.org/docs/concepts/decentralized-storage/credentials',
    payment: 'https://xrpl.org/docs/concepts/payment-types',
    escrow: 'https://xrpl.org/docs/concepts/payment-types/escrow',
    account: 'https://xrpl.org/docs/concepts/accounts',
    amm: 'https://xrpl.org/docs/concepts/tokens/decentralized-exchange',
  } as const;

  export type ConceptCategory = keyof typeof XRPL_DOC_CONCEPTS;
  ```

  **Must NOT do**:
  - 不要添加URL验证逻辑
  - 不要添加复杂的配置系统

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的工具函数创建
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Wave 1)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1, Task 2

  **References**:
  - 现有XRPL工具: `src/lib/xrpl/` 目录结构
  - Task 1验证的URL模式
  - Task 2创建的概念映射表

  **Acceptance Criteria**:
  - [ ] 文件创建成功
  - [ ] 函数和常量正确导出
  - [ ] TypeScript无类型错误

  **QA Scenarios**:
  ```
  Scenario: 工具函数测试
    Tool: Bash (node)
    Steps:
      1. Run: npx tsc --noEmit src/lib/xrpl/docUrls.ts
      2. Import and call: getXRPLTransactionDocUrl('Payment')
      3. Verify returns: 'https://xrpl.org/docs/references/protocol/transactions/types/payment'
    Expected Result: No TypeScript errors, function works correctly
    Evidence: .sisyphus/evidence/task-03-utils-test.txt
  ```

  **Commit**: NO

- [ ] 4. 更新TransactionPageWrapper组件

  **What to do**:
  - 修改 `src/components/transaction/TransactionPageWrapper.tsx`
  - 添加 `docUrl?: string` 和 `conceptUrl?: string` 可选属性
  - 在标题区域下方添加文档链接区域
  - 添加ExternalLink图标导入
  - 添加i18n支持

  **组件修改示例**:
  ```typescript
  interface TransactionPageWrapperProps {
    // ... existing props
    docUrl?: string;      // 交易类型API文档URL
    conceptUrl?: string;  // 概念页面URL
  }

  // 在标题区域后添加（约line 121后）:
  {(docUrl || conceptUrl) && (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      {docUrl && (
        <a
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t('transaction.apiDocs')}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-50" />
        </a>
      )}
      {conceptUrl && (
        <a
          href={conceptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{t('transaction.conceptDocs')}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-50" />
        </a>
      )}
    </div>
  )}
  ```

  **Must NOT do**:
  - 不要修改现有表单逻辑
  - 不要添加tooltips
  - 不要破坏向后兼容性（无docUrl时不显示链接）

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI组件修改，需要考虑视觉效果和响应式
  - **Skills**: [`frontend-ui-ux`, `vercel-react-best-practices`]
    - `frontend-ui-ux`: UI设计和用户体验
    - `vercel-react-best-practices`: React最佳实践

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 5)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 6-12
  - **Blocked By**: Task 3

  **References**:
  - 现有组件: `src/components/transaction/TransactionPageWrapper.tsx:1-167`
  - 外部链接模式: `src/components/layout/Sidebar.tsx:148-155`
  - 图标库: lucide-react (ExternalLink, BookOpen, Lightbulb)

  **Acceptance Criteria**:
  - [ ] docUrl和conceptUrl属性添加成功
  - [ ] 链接正确显示在标题下方
  - [ ] 向后兼容（无属性时不显示）
  - [ ] 链接有正确的安全属性

  **QA Scenarios**:
  ```
  Scenario: 组件渲染测试
    Tool: Playwright
    Steps:
      1. Navigate to Payment page (with docUrl)
      2. Verify link section exists below title
      3. Verify link has target="_blank" and rel="noopener noreferrer"
      4. Click link, verify new tab opens to xrpl.org
    Expected Result: Links render correctly with security attributes
    Evidence: .sisyphus/evidence/task-04-wrapper-test.png

  Scenario: 向后兼容测试
    Tool: Playwright
    Steps:
      1. Navigate to Home page (no docUrl)
      2. Verify no link section rendered
      3. No console errors
    Expected Result: No links shown, no errors
    Evidence: .sisyphus/evidence/task-04-backward-compat.png
  ```

  **Commit**: NO

- [ ] 5. 添加i18n翻译

  **What to do**:
  - 更新 `src/i18n/locales/zh.json`
  - 更新 `src/i18n/locales/en.json`
  - 添加文档链接相关翻译key

  **翻译Key示例**:
  ```json
  // zh.json
  "transaction": {
    "apiDocs": "API 文档",
    "conceptDocs": "概念说明"
  }

  // en.json
  "transaction": {
    "apiDocs": "API Docs",
    "conceptDocs": "Concept Guide"
  }
  ```

  **Must NOT do**:
  - 不要删除或修改现有翻译key
  - 不要添加非必要的翻译

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的JSON文件更新
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 4)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 4 (需要翻译key)
  - **Blocked By**: None

  **References**:
  - 中文翻译: `src/i18n/locales/zh.json:1-100+`
  - 英文翻译: `src/i18n/locales/en.json:1-100+`

  **Acceptance Criteria**:
  - [ ] zh.json包含新的transaction.apiDocs和transaction.conceptDocs
  - [ ] en.json包含对应的英文翻译
  - [ ] JSON格式正确

  **QA Scenarios**:
  ```
  Scenario: 翻译完整性检查
    Tool: Bash
    Steps:
      1. Run: cat src/i18n/locales/zh.json | grep -A2 '"transaction"'
      2. Run: cat src/i18n/locales/en.json | grep -A2 '"transaction"'
      3. Verify both files have apiDocs and conceptDocs keys
    Expected Result: Both files contain identical key structures
    Evidence: .sisyphus/evidence/task-05-i18n-check.txt
  ```

  **Commit**: NO

- [ ] 6. 更新MPT类交易页面 (10个)

  **What to do**:
  - 为10个MPT交易页面添加docUrl和conceptUrl属性
  - 使用 `getXRPLTransactionDocUrl()` 生成API文档URL
  - 使用 `XRPL_DOC_CONCEPTS.mpt` 作为概念URL

  **页面列表**:
  - `src/pages/MPTokenIssuanceCreate.tsx` → docUrl: mptokenissuancecreate
  - `src/pages/MPTokenIssuanceSet.tsx` → docUrl: mptokenissuanceset
  - `src/pages/MPTokenIssuanceDestroy.tsx` → docUrl: mptokenissuancedestroy
  - `src/pages/MPTokenAuthorize.tsx` → docUrl: mptokenauthorize
  - `src/pages/MPTTransfer.tsx` → docUrl: mpttransfer
  - `src/pages/MPTLock.tsx` → docUrl: mptlock
  - `src/pages/MPTClawback.tsx` → docUrl: mptclawback
  - `src/pages/MPTEscrowCreate.tsx` → docUrl: mptescrowcreate
  - `src/pages/MPTEscrowFinish.tsx` → docUrl: mptescrowfinish
  - `src/pages/MPTEscrowCancel.tsx` → docUrl: mptescrowcancel

  **Must NOT do**:
  - 不要修改表单组件逻辑
  - 不要添加额外的props

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的属性添加，重复性高
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7-12)
  - **Blocks**: Task 13
  - **Blocked By**: Task 4

  **References**:
  - URL工具函数: `src/lib/xrpl/docUrls.ts`
  - TransactionPageWrapper用法: `src/pages/Payment.tsx`

  **Acceptance Criteria**:
  - [ ] 10个MPT页面都有docUrl和conceptUrl
  - [ ] 构建无错误

  **QA Scenarios**:
  ```
  Scenario: MPT页面链接检查
    Tool: Bash
    Steps:
      1. Run: grep -l "docUrl" src/pages/MP*.tsx | wc -l
      2. Verify count = 10
    Expected Result: All 10 MPT pages have docUrl
    Evidence: .sisyphus/evidence/task-06-mpt-pages.txt
  ```

  **Commit**: NO

- [ ] 7. 更新NFT类交易页面 (5个)

  **What to do**:
  - 为5个NFT交易页面添加docUrl和conceptUrl属性
  - conceptUrl: `XRPL_DOC_CONCEPTS.nft`

  **页面列表**:
  - `src/pages/NFTokenMint.tsx` → docUrl: nftokenmint
  - `src/pages/NFTokenBurn.tsx` → docUrl: nftokenburn
  - `src/pages/NFTokenCreateOffer.tsx` → docUrl: nftokencreateoffer
  - `src/pages/NFTokenAcceptOffer.tsx` → docUrl: nftokenacceptoffer
  - `src/pages/NFTokenCancelOffer.tsx` → docUrl: nftokencanceloffer

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 13
  - **Blocked By**: Task 4

  **QA Scenarios**:
  ```
  Scenario: NFT页面链接检查
    Tool: Bash
    Steps:
      1. Run: grep -l "docUrl" src/pages/NFToken*.tsx | wc -l
      2. Verify count = 5
    Expected Result: All 5 NFT pages have docUrl
    Evidence: .sisyphus/evidence/task-07-nft-pages.txt
  ```

  **Commit**: NO

- [ ] 8. 更新IOU/Token类交易页面 (7个)

  **What to do**:
  - 为7个IOU/Token交易页面添加docUrl和conceptUrl属性
  - conceptUrl: `XRPL_DOC_CONCEPTS.iou`

  **页面列表**:
  - `src/pages/TrustSet.tsx` → docUrl: trustset
  - `src/pages/IOUPayment.tsx` → docUrl: payment (使用通用payment)
  - `src/pages/OfferCreate.tsx` → docUrl: offercreate
  - `src/pages/OfferCancel.tsx` → docUrl: offercancel
  - `src/pages/IOUEscrowCreate.tsx` → docUrl: escrowcreate, conceptUrl: escrow
  - `src/pages/IOUEscrowFinish.tsx` → docUrl: escrowfinish, conceptUrl: escrow
  - `src/pages/IOUEscrowCancel.tsx` → docUrl: escrowcancel, conceptUrl: escrow

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 13
  - **Blocked By**: Task 4

  **QA Scenarios**:
  ```
  Scenario: IOU页面链接检查
    Tool: Bash
    Steps:
      1. Run: grep -l "docUrl" src/pages/TrustSet.tsx src/pages/IOU*.tsx src/pages/Offer*.tsx | wc -l
      2. Verify count = 7
    Expected Result: All 7 IOU pages have docUrl
    Evidence: .sisyphus/evidence/task-08-iou-pages.txt
  ```

  **Commit**: NO

- [ ] 9. 更新XRP Payment类交易页面 (4个)

  **What to do**:
  - 为4个XRP Payment交易页面添加docUrl和conceptUrl属性
  - conceptUrl: `XRPL_DOC_CONCEPTS.payment` (Escrow类使用 escrow)

  **页面列表**:
  - `src/pages/Payment.tsx` → docUrl: payment, conceptUrl: payment
  - `src/pages/EscrowCreate.tsx` → docUrl: escrowcreate, conceptUrl: escrow
  - `src/pages/EscrowFinish.tsx` → docUrl: escrowfinish, conceptUrl: escrow
  - `src/pages/EscrowCancel.tsx` → docUrl: escrowcancel, conceptUrl: escrow

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 13
  - **Blocked By**: Task 4

  **QA Scenarios**:
  ```
  Scenario: XRP Payment页面链接检查
    Tool: Bash
    Steps:
      1. Run: grep -l "docUrl" src/pages/Payment.tsx src/pages/Escrow*.tsx | wc -l
      2. Verify count = 4
    Expected Result: All 4 XRP Payment pages have docUrl
    Evidence: .sisyphus/evidence/task-09-xrp-pages.txt
  ```

  **Commit**: NO

- [ ] 10. 更新Account类交易页面 (2个)

  **What to do**:
  - 为2个Account交易页面添加docUrl和conceptUrl属性
  - conceptUrl: `XRPL_DOC_CONCEPTS.account`

  **页面列表**:
  - `src/pages/AccountSet.tsx` → docUrl: accountset
  - `src/pages/AccountDelete.tsx` → docUrl: accountdelete

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 13
  - **Blocked By**: Task 4

  **QA Scenarios**:
  ```
  Scenario: Account页面链接检查
    Tool: Bash
    Steps:
      1. Run: grep -l "docUrl" src/pages/Account*.tsx | wc -l
      2. Verify count = 2
    Expected Result: All 2 Account pages have docUrl
    Evidence: .sisyphus/evidence/task-10-account-pages.txt
  ```

  **Commit**: NO

- [ ] 11. 更新Credential类交易页面 (3个)

  **What to do**:
  - 为3个Credential交易页面添加docUrl和conceptUrl属性
  - conceptUrl: `XRPL_DOC_CONCEPTS.credential`

  **页面列表**:
  - `src/pages/CredentialCreate.tsx` → docUrl: credentialcreate
  - `src/pages/CredentialAccept.tsx` → docUrl: credentialaccept
  - `src/pages/CredentialDelete.tsx` → docUrl: credentialdelete

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 13
  - **Blocked By**: Task 4

  **QA Scenarios**:
  ```
  Scenario: Credential页面链接检查
    Tool: Bash
    Steps:
      1. Run: grep -l "docUrl" src/pages/Credential*.tsx | wc -l
      2. Verify count = 3
    Expected Result: All 3 Credential pages have docUrl
    Evidence: .sisyphus/evidence/task-11-credential-pages.txt
  ```

  **Commit**: NO

- [ ] 12. 更新SC+ Labs页面 (4个scheme)

  **What to do**:
  - 为4个SC+ Labs scheme页面添加文档链接
  - SC+是实验性功能，链接到底层XRPL技术概念
  - MPT Scheme → conceptUrl: mpt
  - IOU Scheme → conceptUrl: iou
  - NFT Scheme → conceptUrl: nft
  - Credentials Scheme → conceptUrl: credential

  **页面列表**:
  - `src/pages/scplus/MPTScheme.tsx`
  - `src/pages/scplus/IOUScheme.tsx`
  - `src/pages/scplus/NFTScheme.tsx`
  - `src/pages/scplus/CredentialsScheme.tsx`

  **注意**: SC+页面可能不使用TransactionPageWrapper，需要检查并适配

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 13
  - **Blocked By**: Task 4

  **QA Scenarios**:
  ```
  Scenario: SC+ Labs页面检查
    Tool: Bash
    Steps:
      1. Check if SC+ pages use TransactionPageWrapper
      2. If yes, verify docUrl/conceptUrl added
      3. If no, document alternative approach needed
    Expected Result: SC+ pages have appropriate doc links
    Evidence: .sisyphus/evidence/task-12-scplus-pages.txt
  ```

  **Commit**: NO

- [ ] 13. 构建与Lint验证

  **What to do**:
  - 运行 `npm run build` 验证构建成功
  - 运行 `npm run lint` 验证无lint错误
  - 检查TypeScript类型错误

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的构建验证
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (after Wave 3)
  - **Blocks**: Task 14
  - **Blocked By**: Task 6-12

  **QA Scenarios**:
  ```
  Scenario: 构建验证
    Tool: Bash
    Steps:
      1. Run: npm run build
      2. Verify exit code = 0
      3. Run: npm run lint
      4. Verify exit code = 0
    Expected Result: Build and lint both pass
    Evidence: .sisyphus/evidence/task-13-build-lint.txt
  ```

  **Commit**: NO

- [ ] 14. Playwright集成QA

  **What to do**:
  - 使用Playwright打开应用
  - 验证5个不同类别页面的文档链接
  - 测试语言切换功能
  - 验证链接点击跳转正确

  **测试页面**:
  1. Payment (XRP)
  2. NFTokenMint (NFT)
  3. MPTokenIssuanceCreate (MPT)
  4. TrustSet (IOU)
  5. CredentialCreate (Credential)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Playwright自动化测试
  - **Skills**: [`playwright`]
    - `playwright`: 浏览器自动化测试

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4
  - **Blocks**: F1-F4
  - **Blocked By**: Task 13

  **QA Scenarios**:
  ```
  Scenario: 集成QA - Payment页面
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:5173/payment
      2. Verify "API Docs" link exists
      3. Verify "Concept Guide" link exists
      4. Click API Docs link, verify opens xrpl.org
      5. Switch language to Chinese
      6. Verify link text changes to "API 文档"
    Expected Result: All links work correctly in both languages
    Evidence: .sisyphus/evidence/task-14-qa-payment.png

  Scenario: 集成QA - 语言切换
    Tool: Playwright
    Steps:
      1. Navigate to any transaction page
      2. Click language toggle
      3. Verify link text updates
    Expected Result: Language switch updates link text
    Evidence: .sisyphus/evidence/task-14-qa-language.png
  ```

  **Commit**: NO

---

## Final Verification Wave (MANDATORY)

> 4 review agents run in PARALLEL. ALL must APPROVE.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Verify: All "Must Have" implemented, all "Must NOT Have" absent, evidence files exist.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build` + `npm run lint`. Check for console.log, unused imports, AI slop.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Navigate to 5 sample transaction pages, verify links exist, click to verify URL, test language switch.
  Output: `Links [N/N pass] | Language [PASS/FAIL] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  Verify no scope creep: no tooltips, no tracking, no planned type links, no form logic changes.
  Output: `Scope [COMPLIANT/VIOLATED] | Creep [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **Single Commit** after all tasks complete:
  - Message: `feat: add XRPL documentation links to transaction pages`
  - Files: All modified files
  - Pre-commit: `npm run lint`

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: Build successful
npm run lint   # Expected: No errors
```

### Final Checklist
- [ ] All "Must Have" present (6 items)
- [ ] All "Must NOT Have" absent (6 items)
- [ ] Build passes
- [ ] Lint passes
- [ ] Links work on 5+ sample pages
- [ ] Language switch updates link text
