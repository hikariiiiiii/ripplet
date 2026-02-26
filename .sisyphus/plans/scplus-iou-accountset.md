# SC+ IOU Scheme - Add AccountSet Step

## TL;DR

> **Quick Summary**: Add AccountSet as the first step in SC+ Labs IOU Scheme workflow, enabling issuers to configure their account before issuing tokens.
>
> **Deliverables**:
> - Updated IOU Scheme with 5 steps (was 4)
> - i18n translations for new step "配置发行方 / Configure Issuer"
> - AccountSetForm integrated as Step 1
>
> **Estimated Effort**: Quick (~15 min)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: i18n → IOUScheme.tsx

---

## Context

### Original Request
User learned from XRPL official documentation that AccountSet is technically optional but practically essential for IOU issuance. The SC+ Labs IOU Scheme should add AccountSet as the first step before TrustSet.

### Interview Summary
**Key Discussions**:
- **Form approach**: Use existing AccountSetForm directly (no modifications needed)
- **TransferRate/TickSize**: Excluded - fees are burned (not collected), TickSize only affects DEX
- **Step naming**: "配置发行方" / "Configure Issuer"
- **Test strategy**: None required

**Research Findings**:
- `defaultRipple` flag is CRITICAL for IOU issuers (already in AccountSetForm)
- TransferRate fees are burned, not collected by issuer - excluded from scope
- TickSize only affects DEX trading - excluded from scope
- Existing AccountSetForm has all necessary fields for SC+ use case

### Metis Review
**Identified Gaps** (addressed):
- TransferRate purpose clarification → Excluded (fees burned, not collected)
- TickSize relevance → Excluded (DEX only, not peer-to-peer)
- Scope locked to: Add step using existing form, update translations

---

## Work Objectives

### Core Objective
Add AccountSet as Step 1 in IOU Scheme, allowing issuers to configure their account settings (domain, flags) before setting up trust lines and issuing tokens.

### Concrete Deliverables
- `src/i18n/locales/zh.json` - Updated step names (step0-4)
- `src/i18n/locales/en.json` - Updated step names (step0-4)
- `src/pages/scplus/IOUScheme.tsx` - AccountSet integrated as first step

### Definition of Done
- [ ] IOU Scheme wizard shows 5 steps
- [ ] Step 1 is "配置发行方 / Configure Issuer" with AccountSetForm
- [ ] All 5 steps display correct Chinese and English names
- [ ] Wizard navigation works correctly

### Must Have
- AccountSet as Step 1 (index 0)
- Use existing AccountSetForm component
- Bilingual translations

### Must NOT Have (Guardrails)
- NO changes to AccountSetForm itself
- NO TransferRate or TickSize additions (excluded)
- NO changes to other schemes (MPT, NFT, Credentials)
- NO test infrastructure changes

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (unit tests), YES (E2E Playwright)
- **Automated tests**: None
- **Agent-Executed QA**: YES (Playwright browser verification)

### QA Policy
Each task includes agent-executed QA scenarios using Playwright.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - i18n updates):
├── Task 1: Update zh.json step translations [quick]
└── Task 2: Update en.json step translations [quick]

Wave 2 (After Wave 1 - page update):
└── Task 3: Update IOUScheme.tsx with AccountSet step [quick]

Critical Path: Task 1/2 → Task 3
Parallel Speedup: 2x (i18n files in parallel)
Max Concurrent: 2
```

### Dependency Matrix

- **1-2**: — → 3
- **3**: 1, 2 —

### Agent Dispatch Summary

- **Wave 1**: **2** quick agents — zh.json, en.json
- **Wave 2**: **1** quick agent — IOUScheme.tsx

---

## TODOs

- [ ] 1. Update Chinese translations (zh.json)

  **What to do**:
  - Add `scplus.iouScheme.step0: "配置发行方"`
  - Rename `step1` → `"设置信任线"` (was "设置信任线")
  - Rename `step2` → `"发行凭证"` (was "发行凭证")
  - Rename `step3` → `"转账"` (was "转账")
  - Rename `step4` → `"赎回"` (was "赎回")

  **Must NOT do**:
  - Don't modify other scheme translations
  - Don't change the existing step text, just the numbering

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple JSON key-value update
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `src/i18n/locales/zh.json:547-557` - Current IOU Scheme step definitions

  **Acceptance Criteria**:
  - [ ] `scplus.iouScheme.step0` exists with value "配置发行方"
  - [ ] Steps step1-step4 have correct values

  **QA Scenarios**:
  ```
  Scenario: Verify Chinese translations exist
    Tool: Bash (grep)
    Steps:
      1. grep -c '"step0":.*配置发行方' src/i18n/locales/zh.json
      2. grep -c '"step1":.*设置信任线' src/i18n/locales/zh.json
    Expected Result: Both grep commands return 1
    Evidence: .sisyphus/evidence/task-1-zh-translations.txt
  ```

  **Commit**: NO (groups with Task 3)

---

- [ ] 2. Update English translations (en.json)

  **What to do**:
  - Add `scplus.iouScheme.step0: "Configure Issuer"`
  - Rename `step1` → `"Setup Trustline"` (was "Setup Trustline")
  - Rename `step2` → `"Issue Credential"` (was "Issue Credential")
  - Rename `step3` → `"Transfer"` (was "Transfer")
  - Rename `step4` → `"Redemption"` (was "Redemption")

  **Must NOT do**:
  - Don't modify other scheme translations
  - Don't change the existing step text, just the numbering

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple JSON key-value update
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `src/i18n/locales/en.json:547-557` - Current IOU Scheme step definitions

  **Acceptance Criteria**:
  - [ ] `scplus.iouScheme.step0` exists with value "Configure Issuer"
  - [ ] Steps step1-step4 have correct values

  **QA Scenarios**:
  ```
  Scenario: Verify English translations exist
    Tool: Bash (grep)
    Steps:
      1. grep -c '"step0":.*Configure Issuer' src/i18n/locales/en.json
      2. grep -c '"step1":.*Setup Trustline' src/i18n/locales/en.json
    Expected Result: Both grep commands return 1
    Evidence: .sisyphus/evidence/task-2-en-translations.txt
  ```

  **Commit**: NO (groups with Task 3)

---

- [ ] 3. Update IOUScheme.tsx with AccountSet step

  **What to do**:
  1. Add import: `import { AccountSetForm } from '@/components/transaction/AccountSetForm';`
  2. Update steps array to include step0:
     ```typescript
     const steps = [
       { key: 'accountset', title: t('scplus.iouScheme.step0') },
       { key: 'trustline', title: t('scplus.iouScheme.step1') },
       { key: 'issue', title: t('scplus.iouScheme.step2') },
       { key: 'transfer', title: t('scplus.iouScheme.step3') },
       { key: 'redeem', title: t('scplus.iouScheme.step4') },
     ];
     ```
  3. Add case 0 in renderCurrentStep():
     ```typescript
     case 0:
       return (
         <AccountSetForm
           account={account}
           onSubmit={(tx) => handleSubmit(tx)}
           isSubmitting={viewState === 'submitting'}
           isConnected={isConnected}
           onConnectWallet={handleConnectWallet}
         />
       );
     ```
  4. Update existing case indexes: 0→1, 1→2, 2→3, 3→4

  **Must NOT do**:
  - Don't modify other scheme pages
  - Don't change AccountSetForm component
  - Don't add TransferRate or TickSize fields

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple component integration, pattern already exists
  - **Skills**: []
    - No special skills needed, pattern follows existing code

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after i18n)
  - **Blocks**: None
  - **Blocked By**: Task 1, Task 2

  **References**:
  - `src/pages/scplus/IOUScheme.tsx:80-85` - Current steps array definition
  - `src/pages/scplus/IOUScheme.tsx:87-135` - renderCurrentStep() function
  - `src/pages/scplus/MPTScheme.tsx:96-106` - Example of AccountSetForm-like usage pattern
  - `src/components/transaction/AccountSetForm.tsx:60-66` - Form props interface

  **Acceptance Criteria**:
  - [ ] AccountSetForm imported correctly
  - [ ] steps array has 5 items with correct keys and translation keys
  - [ ] renderCurrentStep case 0 renders AccountSetForm
  - [ ] Existing cases updated to correct indexes (1-4)

  **QA Scenarios**:
  ```
  Scenario: Verify AccountSetForm integration in IOU Scheme
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running at localhost:5173
    Steps:
      1. Navigate to http://localhost:5173/scplus/iou
      2. Wait for page to load
      3. Assert step counter shows "步骤 1 / 5"
      4. Assert first step title contains "配置发行方" or "Configure Issuer"
      5. Assert AccountSetForm elements visible (Domain input, flag switches)
      6. Click "下一步" button
      7. Assert step counter shows "步骤 2 / 5"
    Expected Result: All assertions pass, wizard navigates correctly
    Failure Indicators: Step counter wrong, form not visible, navigation fails
    Evidence: .sisyphus/evidence/task-3-iou-scheme-wizard.png

  Scenario: Verify AccountSetForm submission works
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, wallet NOT connected
    Steps:
      1. Navigate to http://localhost:5173/scplus/iou
      2. Find submit button
      3. Assert button shows "Connect Wallet" (wallet not connected)
    Expected Result: Button correctly shows connection prompt
    Evidence: .sisyphus/evidence/task-3-wallet-button.png
  ```

  **Evidence to Capture**:
  - [ ] Screenshot showing 5-step wizard with "Configure Issuer" as first step
  - [ ] Screenshot showing AccountSetForm rendered correctly
  - [ ] Screenshot showing wallet connect button state

  **Commit**: YES
  - Message: `feat(scplus): add AccountSet as first step in IOU Scheme`
  - Files: `src/pages/scplus/IOUScheme.tsx`, `src/i18n/locales/zh.json`, `src/i18n/locales/en.json`
  - Pre-commit: `npm run lint`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Verify all 3 tasks completed, check evidence files exist, confirm no scope creep.

- [ ] F2. **Code Quality Review** — `quick`
  Run `npm run lint`, verify no TypeScript errors.

- [ ] F3. **Real Manual QA** — `quick` (+ `playwright` skill)
  Execute QA scenarios from Task 3, capture screenshots.

- [ ] F4. **Scope Fidelity Check** — `quick`
  Verify only IOUScheme.tsx and i18n files modified.

---

## Commit Strategy

- **1**: `feat(scplus): add AccountSet as first step in IOU Scheme` — IOUScheme.tsx, zh.json, en.json — npm run lint

---

## Success Criteria

### Verification Commands
```bash
# Check step count in IOUScheme.tsx
grep -c "key:" src/pages/scplus/IOUScheme.tsx | grep -q "5" && echo "PASS" || echo "FAIL"

# Check translations exist
grep -q "step0.*配置发行方" src/i18n/locales/zh.json && echo "PASS" || echo "FAIL"
grep -q "step0.*Configure Issuer" src/i18n/locales/en.json && echo "PASS" || echo "FAIL"

# Lint passes
npm run lint
```

### Final Checklist
- [ ] IOU Scheme has 5 steps
- [ ] Step 1 is "配置发行方 / Configure Issuer"
- [ ] AccountSetForm renders correctly
- [ ] All translations in place
- [ ] Lint passes
- [ ] Evidence captured
