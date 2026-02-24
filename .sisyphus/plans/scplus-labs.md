# SC+ Labs - 供应链金融凭证POC实现计划

## TL;DR

> **Quick Summary**: 为Ripplet DApp添加"SC+ Labs"父菜单，包含5个子页面（1概述+4方案），使用多步骤向导展示SC+供应链金融凭证在XRPL上的4种技术实现方案。
> 
> **Deliverables**:
> - SC+ Labs 菜单（5项：Overview, MPT, IOU, NFT, Credentials）
> - 1个概述页面（方案对比表）
> - 4个方案页面（多步骤向导）
> - 多步骤向导组件
> - i18n翻译（中英双语）
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 6 waves
> **Critical Path**: i18n → Sidebar → Wizard Component → Scheme Pages

---

## Context

### Original Request
用户需要在现有Ripplet DApp菜单后附加"SC+ Labs"父菜单，SC+是供应链金融Web3品牌。父菜单下有5个菜单（1概述+4方案），用于解释和POC SC+凭证在XRPL的4种实践方案。需要复用现有Ripplet DApp的方法和组件。

### Interview Summary
**Key Discussions**:
- 页面结构: 单页多步骤向导
- 概述页面: 需要，包含4种方案对比表格
- 说明内容: 完整说明（定位、特点、流程图、适用场景）
- 国际化: 复用现有策略（中英双语）
- 测试: 无单元测试，使用Agent-Executed QA

**Research Findings**:
- TransactionPageWrapper提供钱包连接、交易提交、结果显示
- 所有需要的表单组件已存在，接口一致
- 无向导基础设施，需从零构建
- 无状态持久化（刷新=重置，MVP可接受）

### Metis Review
**Identified Gaps** (addressed):
- 状态持久化策略: MVP阶段接受状态丢失 → 需在UI提示用户
- ErrorBoundary: MVP阶段跳过，复用现有错误处理
- 多角色处理: 手动输入地址，不自动检测
- 网络支持: Testnet优先（MVP）

---

## Work Objectives

### Core Objective
实现SC+ Labs功能模块，展示SC+供应链金融凭证在XRPL上的4种技术方案，通过多步骤向导引导用户完成完整的凭证生命周期（发行→转让→兑付）。

### Concrete Deliverables
- `src/i18n/locales/zh.json` - 中文翻译
- `src/i18n/locales/en.json` - 英文翻译
- `src/components/layout/Sidebar.tsx` - 新增SC+ Labs菜单
- `src/App.tsx` - 新增5个路由
- `src/components/scplus/` - SC+专用组件目录
- `src/pages/scplus/` - SC+页面目录

### Definition of Done
- [ ] 菜单可见且可点击
- [ ] 5个页面均可访问
- [ ] 概述页面显示4种方案对比表
- [ ] 每个方案页面包含完整说明和多步骤向导
- [ ] 向导可切换步骤
- [ ] 表单可提交（连接钱包后）
- [ ] 中英文切换正常

### Must Have
- SC+ Labs父菜单
- 5个子菜单（Overview + 4 Schemes）
- 多步骤向导组件
- 方案说明与流程图
- 复用现有交易表单组件

### Must NOT Have (Guardrails)
- **不添加后端API** - 纯前端POC
- **不添加状态持久化** - MVP接受刷新重置
- **不添加ErrorBoundary** - 复用现有错误处理
- **不添加单元测试** - 使用Agent QA
- **不模拟完整业务场景** - 仅展示技术流程
- **不添加localStorage** - 保持简洁

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None
- **Framework**: N/A
- **Agent-Executed QA**: ALWAYS (mandatory for all tasks)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **Library/Module**: Use Bash (bun/node REPL) — Import, call functions, compare output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - 5 parallel tasks):
├── Task 1: i18n translations [quick]
├── Task 2: Sidebar navigation [quick]
├── Task 3: App routes [quick]
├── Task 4: SchemeWizard component [visual-engineering]
└── Task 5: SCPlusOverview page [visual-engineering]

Wave 2 (MPT Scheme - depends: Wave 1):
├── Task 6: MPT Scheme page (6-step wizard) [unspecified-high]

Wave 3 (IOU Scheme - depends: Wave 1):
├── Task 7: IOU Scheme page (4-step wizard) [unspecified-high]

Wave 4 (NFT Scheme - depends: Wave 1):
├── Task 8: NFT Scheme page (4-step wizard) [unspecified-high]

Wave 5 (Credentials Scheme - depends: Wave 1):
├── Task 9: Credentials Scheme page (3-step wizard) [unspecified-high]

Wave FINAL (Verification - 4 parallel agents):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high + playwright)
└── Task F4: Scope fidelity check (deep)

Critical Path: Task 1-3 → Task 4-5 → Task 6-9 → F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 5 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1-3 | — | 4-9 |
| 4-5 | 1-3 | 6-9 |
| 6-9 | 4-5 | F1-F4 |
| F1-F4 | 6-9 | — |

### Agent Dispatch Summary

- **Wave 1**: 5 tasks — T1-T3 → `quick`, T4-T5 → `visual-engineering`
- **Wave 2-5**: 4 tasks — T6-T9 → `unspecified-high`
- **Wave FINAL**: 4 tasks — F1 → `oracle`, F2-F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

> Implementation + QA = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.

---

- [x] 1. **i18n Translations** [Wave 1 - Foundation]

  **What to do**:
  Add SC+ Labs menu and page translations to both `zh.json` and `en.json`.
  
  **Translation Keys to Add**:
  ```json
  {
    "scplus": {
      "title": "SC+ Labs",
      "overview": "Overview",
      "mpt": "MPT Scheme",
      "iou": "IOU Scheme",
      "nft": "NFT Scheme",
      "credentials": "Credentials Scheme",
      "overview": {
        "title": "SC+ Credential Implementation Schemes",
        "subtitle": "Four technical approaches for supply chain finance on XRPL",
        "comparison": "Scheme Comparison",
        "scheme": "Scheme",
        "positioning": "Positioning",
        "features": "Key Features",
        "bestFor": "Best For"
      },
      "mptScheme": {
        "title": "MPT (Multi-Purpose Token) Scheme",
        "subtitle": "Ripple's RWA strategic direction with native metadata",
        "step1": "Define Credential",
        "step2": "KYC (Optional)",
        "step3": "Authorize Holders",
        "step4": "Issue Credential",
        "step5": "Transfer",
        "step6": "Redemption"
      },
      "iouScheme": {
        "title": "IOU (Trustline Token) Scheme",
        "subtitle": "Fast and flexible, leveraging mature ecosystem",
        "step1": "Setup Trustline",
        "step2": "Issue Credential",
        "step3": "Transfer",
        "step4": "Redemption"
      },
      "nftScheme": {
        "title": "NFT (Non-Fungible Token) Scheme",
        "subtitle": "Perfect fit for one-invoice-one-credential model",
        "step1": "Mint NFT",
        "step2": "Create Offer",
        "step3": "Accept Offer",
        "step4": "Burn (Redemption)"
      },
      "credentialsScheme": {
        "title": "Credentials Scheme",
        "subtitle": "Maximum compliance as non-token attestation",
        "step1": "Issue Credential",
        "step2": "Transfer (Re-issue)",
        "step3": "Delete (Redemption)"
      },
      "wizard": {
        "step": "Step",
        "next": "Next",
        "prev": "Previous",
        "complete": "Complete",
        "refreshWarning": "Refreshing the page will reset your progress"
      }
    }
  }
  ```

  **Must NOT do**:
  - Do not modify existing translation keys
  - Do not add translations for transaction forms (already exist)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple JSON file modifications
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: Tasks 4-9 (need translations)
  - **Blocked By**: None

  **References**:
  - `src/i18n/locales/zh.json:1-56` - Existing nav structure
  - `src/i18n/locales/en.json:1-56` - English counterpart

  **Acceptance Criteria**:
  - [ ] zh.json contains all scplus.* keys
  - [ ] en.json contains all scplus.* keys
  - [ ] No duplicate keys
  - [ ] JSON is valid (parseable)

  **QA Scenarios**:
  ```
  Scenario: Verify i18n keys exist
    Tool: Bash
    Steps:
      1. cd /Volumes/WD\ SN5000\ 1TB/CODELIFE/Opencode\ Workspace/Ripplet
      2. node -e "const zh = require('./src/i18n/locales/zh.json'); console.log(zh.scplus ? 'PASS' : 'FAIL')"
      3. node -e "const en = require('./src/i18n/locales/en.json'); console.log(en.scplus ? 'PASS' : 'FAIL')"
    Expected Result: Both output "PASS"
    Evidence: .sisyphus/evidence/task-01-i18n-keys.txt
  ```

  **Commit**: NO (group with Wave 1)

- [x] 2. **Sidebar Navigation** [Wave 1 - Foundation]

  **What to do**:
  Add SC+ Labs navigation section to Sidebar.tsx, placed after existing sections.

  **Implementation**:
  1. Import new icons: `FlaskConical` (for SC+ Labs), `Table`, `Box`, `Link2`, `Layers`, `BadgeCheck`
  2. Add new NavSection to `navSections` array:
  ```typescript
  {
    titleKey: 'scplus.title',
    items: [
      { to: '/scplus/overview', icon: Table, labelKey: 'scplus.overview' },
      { to: '/scplus/mpt', icon: Box, labelKey: 'scplus.mpt' },
      { to: '/scplus/iou', icon: Link2, labelKey: 'scplus.iou' },
      { to: '/scplus/nft', icon: Layers, labelKey: 'scplus.nft' },
      { to: '/scplus/credentials', icon: BadgeCheck, labelKey: 'scplus.credentials' },
    ],
  }
  ```

  **Must NOT do**:
  - Do not modify existing navigation sections
  - Do not add comingSoon flags to SC+ items

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple array modification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5)
  - **Blocks**: Tasks 6-9 (need navigation)
  - **Blocked By**: Task 1 (needs translation keys)

  **References**:
  - `src/components/layout/Sidebar.tsx:50-134` - Existing navSections structure
  - `src/components/layout/Sidebar.tsx:3-31` - Icon imports

  **Acceptance Criteria**:
  - [ ] New NavSection added to navSections array
  - [ ] 5 menu items with correct routes
  - [ ] Uses i18n keys from Task 1
  - [ ] TypeScript compiles without errors

  **QA Scenarios**:
  ```
  Scenario: Verify sidebar section exists
    Tool: Bash
    Steps:
      1. grep -q "scplus.title" src/components/layout/Sidebar.tsx && echo "PASS" || echo "FAIL"
      2. grep -q "/scplus/overview" src/components/layout/Sidebar.tsx && echo "PASS" || echo "FAIL"
    Expected Result: Both output "PASS"
    Evidence: .sisyphus/evidence/task-02-sidebar.txt
  ```

  **Commit**: NO (group with Wave 1)

- [x] 3. **App Routes** [Wave 1 - Foundation]

  **What to do**:
  Add 5 new routes to App.tsx for SC+ Labs pages.

  **Implementation**:
  1. Create page component imports:
  ```typescript
  import SCPlusOverview from '@/pages/scplus/SCPlusOverview';
  import MPTScheme from '@/pages/scplus/MPTScheme';
  import IOUScheme from '@/pages/scplus/IOUScheme';
  import NFTScheme from '@/pages/scplus/NFTScheme';
  import CredentialsScheme from '@/pages/scplus/CredentialsScheme';
  ```
  2. Add routes inside the Layout Route:
  ```typescript
  <Route path="scplus/overview" element={<SCPlusOverview />} />
  <Route path="scplus/mpt" element={<MPTScheme />} />
  <Route path="scplus/iou" element={<IOUScheme />} />
  <Route path="scplus/nft" element={<NFTScheme />} />
  <Route path="scplus/credentials" element={<CredentialsScheme />} />
  ```

  **Must NOT do**:
  - Do not modify existing routes
  - Do not create page components in this task (placeholder imports are fine)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple route additions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5)
  - **Blocks**: Tasks 6-9 (need routes)
  - **Blocked By**: None

  **References**:
  - `src/App.tsx:47-82` - Existing route structure

  **Acceptance Criteria**:
  - [ ] 5 new routes added
  - [ ] TypeScript compiles (page components may be placeholders)
  - [ ] Routes match sidebar navigation

  **QA Scenarios**:
  ```
  Scenario: Verify routes exist
    Tool: Bash
    Steps:
      1. grep -q "scplus/overview" src/App.tsx && echo "PASS" || echo "FAIL"
      2. grep -c "scplus/" src/App.tsx | xargs -I {} test {} -ge 5 && echo "PASS" || echo "FAIL"
    Expected Result: Both output "PASS"
    Evidence: .sisyphus/evidence/task-03-routes.txt
  ```

  **Commit**: NO (group with Wave 1)

- [x] 4. **SchemeWizard Component** [Wave 1 - Foundation]

  **What to do**:
  Create a reusable multi-step wizard component for SC+ scheme pages.

  **Implementation**:
  Create `src/components/scplus/SchemeWizard.tsx`:
  ```typescript
  interface SchemeWizardProps {
    steps: { key: string; title: string; form: React.ReactNode }[];
    schemeType: 'mpt' | 'iou' | 'nft' | 'credentials';
  }
  
  export function SchemeWizard({ steps, schemeType }: SchemeWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    // ... step navigation UI
    // ... step indicator UI
    // ... refresh warning toast on mount
  }
  ```

  **Features**:
  - Step indicator (horizontal progress bar)
  - Previous/Next navigation buttons
  - Current step form rendering
  - Refresh warning toast on mount

  **Must NOT do**:
  - Do NOT add state persistence (localStorage/sessionStorage)
  - Do NOT add ErrorBoundary
  - Do NOT create page components (just the wizard)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with styling requirements
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5)
  - **Blocks**: Tasks 6-9
  - **Blocked By**: Task 1

  **References**:
  - `src/components/transaction/TransactionPageWrapper.tsx:92-166` - Layout patterns
  - `src/components/ui/button.tsx` - Button component

  **Acceptance Criteria**:
  - [ ] Component renders step indicator
  - [ ] Component renders navigation buttons
  - [ ] TypeScript compiles

  **QA Scenarios**:
  ```
  Scenario: Component renders correctly
    Tool: Playwright
    Steps:
      1. Create test page using SchemeWizard
      2. Verify step indicator visible
      3. Verify navigation buttons visible
    Expected Result: All elements visible
    Evidence: .sisyphus/evidence/task-04-wizard.png
  ```

  **Commit**: NO (group with Wave 1)

- [x] 5. **SCPlusOverview Page** [Wave 1 - Foundation]

  **What to do**:
  Create the overview page with 4-scheme comparison table.

  **Implementation**:
  Create `src/pages/scplus/SCPlusOverview.tsx`:
  - Header with title and subtitle
  - Comparison table: MPT, IOU, NFT, Credentials
  - Rows: Positioning, Key Features, Best For, Transaction Types
  - Links to each scheme page

  **Must NOT do**:
  - Do NOT add interactive filters
  - Do NOT add external links

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocked By**: Task 1

  **References**:
  - `src/pages/Home.tsx` - Page structure

  **Acceptance Criteria**:
  - [ ] Comparison table visible
  - [ ] 4 scheme columns present
  - [ ] Links work

  **QA Scenarios**:
  ```
  Scenario: Overview page renders
    Tool: Playwright
    Steps:
      1. Navigate to /scplus/overview
      2. Verify table visible
      3. Verify 4 columns
    Expected Result: Table with 4 columns
    Evidence: .sisyphus/evidence/task-05-overview.png
  ```

  **Commit**: NO (group with Wave 1)

---

### Wave 2-5: Scheme Pages (Parallel)

- [x] 6. **MPT Scheme Page** [Wave 2]

  **What to do**: Create MPT scheme page with 6-step wizard.

  **Steps**: Define Credential → KYC → Authorize → Issue → Transfer → Redemption

  **Forms**: MPTokenIssuanceCreateForm, CredentialCreateForm, MPTokenAuthorizeForm, PaymentForm, MPTTransferForm, MPTClawbackForm

  **Recommended Agent Profile**: `unspecified-high`, Skills: [`frontend-ui-ux`]

  **Parallelization**: Parallel with Tasks 7, 8, 9

  **QA**: Navigate to /scplus/mpt, verify 6 steps visible

  **Commit**: NO

- [x] 7. **IOU Scheme Page** [Wave 3]

  **What to do**: Create IOU scheme page with 4-step wizard.

  **Steps**: TrustSet → Issue → Transfer → Redemption

  **Forms**: TrustSetForm, IOUPaymentForm (x3)

  **Recommended Agent Profile**: `unspecified-high`, Skills: [`frontend-ui-ux`]

  **Parallelization**: Parallel with Tasks 6, 8, 9

  **QA**: Navigate to /scplus/iou, verify 4 steps visible

  **Commit**: NO

- [x] 8. **NFT Scheme Page** [Wave 4]

  **What to do**: Create NFT scheme page with 4-step wizard.

  **Steps**: Mint → CreateOffer → AcceptOffer → Burn

  **Forms**: NFTokenMintForm, NFTokenCreateOfferForm, NFTokenAcceptOfferForm, NFTokenBurnForm

  **Recommended Agent Profile**: `unspecified-high`, Skills: [`frontend-ui-ux`]

  **Parallelization**: Parallel with Tasks 6, 7, 9

  **QA**: Navigate to /scplus/nft, verify 4 steps visible

  **Commit**: NO

- [x] 9. **Credentials Scheme Page** [Wave 5]

  **What to do**: Create Credentials scheme page with 3-step wizard.

  **Steps**: Issue → Transfer (re-issue) → Delete

  **Forms**: CredentialCreateForm, CredentialAcceptForm, CredentialDeleteForm

  **Recommended Agent Profile**: `unspecified-high`, Skills: [`frontend-ui-ux`]

  **Parallelization**: Parallel with Tasks 6, 7, 8

  **QA**: Navigate to /scplus/credentials, verify 3 steps visible

  **Commit**: NO

---

## Final Verification Wave (MANDATORY)

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. Verify all "Must Have" implemented, all "Must NOT Have" absent. Check evidence files exist.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + `npm run lint`. Check for TypeScript errors, unused imports, console.log in prod.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Execute EVERY QA scenario from EVERY task. Test cross-page navigation. Test wallet connection flow.
  Output: `Scenarios [N/N pass] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  Verify no scope creep: no localStorage, no backend API, no ErrorBoundary, no unit tests.
  Output: `Scope [CLEAN/ISSUES] | VERDICT`

---

## Commit Strategy

Single commit after all tasks complete:
- `feat(scplus): add SC+ Labs menu with 4 credential scheme POC pages`

---

## Success Criteria

### Verification Commands
```bash
npm run dev  # Dev server starts without errors
npm run lint  # No lint errors
tsc --noEmit  # No TypeScript errors
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Menu navigation works
- [ ] All 5 pages render correctly
- [ ] Multi-step wizard functions
- [ ] i18n works (EN/ZH)
