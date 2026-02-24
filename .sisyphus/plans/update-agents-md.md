# Update AGENTS.md Documentation

## TL;DR

> **Quick Summary**: Update AGENTS.md to reflect current code status including SC+ Labs module and accurate transaction type implementation progress.
> 
> **Deliverables**:
> - Updated Project Overview with SC+ Labs description
> - Updated Project Structure with scplus directories
> - Reorganized Transaction Types table with accurate counts
> - New SC+ Labs section with brief overview
> - Updated Tech Stack with i18n
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - single file modification
> **Critical Path**: Read → Edit sections → Verify

---

## Context

### Original Request
Update AGENTS.md to reflect current code status, including the new SC+ Labs module and accurate transaction type implementation progress.

### Interview Summary
**Key Discussions**:
- Transaction categorization: User chose to **reorganize** categories to match actual implementation
- Unimplemented types: **Keep** as "not implemented" entries
- SC+ Labs depth: **Brief overview** (2-3 sentences + 4 schemes + file reference)
- Color pattern: **No** new UI guideline needed

**Research Findings**:
- 31 transaction forms exist in src/components/transaction/
- SC+ Labs fully implemented: 5 pages, 1 wizard component, routes, i18n
- Current AGENTS.md shows outdated progress (3 done / 4.5% vs actual 31/40)

### Metis Review
**Identified Gaps** (addressed):
- Need to reorganize transaction categories, not just update numbers
- Keep planned-but-not-implemented types visible
- Limit SC+ Labs to brief overview

---

## Work Objectives

### Core Objective
Synchronize AGENTS.md documentation with current codebase reality.

### Concrete Deliverables
- Updated AGENTS.md file at project root

### Definition of Done
- [ ] `grep -c "SC+ Labs" AGENTS.md` returns >= 2
- [ ] `grep -c "scplus" AGENTS.md` returns >= 2
- [ ] Transaction count in progress table matches file count (31)
- [ ] All existing guidelines sections preserved

### Must Have
- Updated Project Overview with SC+ Labs mention
- Updated Project Structure including scplus directories
- Reorganized Transaction Types table with accurate counts
- Brief SC+ Labs section (overview + 4 schemes)
- i18n in Tech Stack

### Must NOT Have (Guardrails)
- No changes to README.md
- No changes to code files
- No new UI guideline sections
- No restructuring of code style sections
- No removal of planned transaction types

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (documentation task)
- **Automated tests**: None
- **Framework**: N/A

### QA Policy
Agent-executed verification via Bash commands.

---

## Execution Strategy

### Sequential Execution
Single file modification - no parallelism possible.

```
Step 1: Read current AGENTS.md
Step 2: Edit Project Overview section
Step 3: Edit Project Structure section
Step 4: Edit Tech Stack section
Step 5: Replace Transaction Types section
Step 6: Add SC+ Labs section
Step 7: Verify all changes
```

Critical Path: Read → Edit → Verify

---

## TODOs

- [ ] 1. Update Project Overview Section

  **What to do**:
  - Add SC+ Labs description to Project Overview
  - Mention: "SC+ Labs: Experimental implementations for SC+ (Supply Chain Finance) credential schemes, demonstrating 4 approaches to tokenizing supply chain invoices on XRPL."

  **Must NOT do**:
  - Do not remove existing project description
  - Do not add detailed SC+ explanation here

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: None (can start immediately)

  **References**:
  - `AGENTS.md:3-5` - Current Project Overview section

  **Acceptance Criteria**:
  - [ ] SC+ Labs mentioned in Project Overview

  **QA Scenarios**:
  ```
  Scenario: Verify SC+ Labs in Overview
    Tool: Bash (grep)
    Steps: grep -c "SC+ Labs" AGENTS.md
    Expected Result: Count >= 1
    Evidence: .sisyphus/evidence/task-1-overview.txt
  ```

  **Commit**: NO (group with other changes)

---

- [ ] 2. Update Tech Stack Section

  **What to do**:
  - Add i18n support to Tech Stack list
  - Add line: `- **i18n**: react-i18next (中文/English support)`

  **Must NOT do**:
  - Do not reorder existing tech stack items

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Task 1

  **References**:
  - `AGENTS.md:9-14` - Current Tech Stack section

  **Acceptance Criteria**:
  - [ ] i18n line added to Tech Stack

  **QA Scenarios**:
  ```
  Scenario: Verify i18n in Tech Stack
    Tool: Bash (grep)
    Steps: grep -c "i18n" AGENTS.md
    Expected Result: Count >= 1
    Evidence: .sisyphus/evidence/task-2-i18n.txt
  ```

  **Commit**: NO (group with other changes)

---

- [ ] 3. Update Project Structure Section

  **What to do**:
  - Add `src/pages/scplus/` directory to structure diagram
  - Add `src/components/scplus/` directory to structure diagram
  - Add `src/i18n/` and `src/i18n/locales/` directories
  - Add `scplus/` documentation directory at root level

  **Must NOT do**:
  - Do not restructure existing entries

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Task 2

  **References**:
  - `AGENTS.md:16-38` - Current Project Structure section

  **Acceptance Criteria**:
  - [ ] `src/pages/scplus/` in structure
  - [ ] `src/i18n/` in structure

  **QA Scenarios**:
  ```
  Scenario: Verify scplus in structure
    Tool: Bash (grep)
    Steps: grep -c "scplus" AGENTS.md
    Expected Result: Count >= 2
    Evidence: .sisyphus/evidence/task-3-structure.txt
  ```

  **Commit**: NO (group with other changes)

---

- [ ] 4. Replace Transaction Types Section

  **What to do**:
  - Replace entire "XRPL Transaction Types" section with reorganized table
  - New categorization:
    - **MPT (10 types)**: All 10 implemented ✅
    - **NFT (6 types)**: 5 implemented, NFTokenModify pending
    - **IOU/Token (8 types)**: 7 implemented, Clawback pending
    - **XRP Payment (8 types)**: 4 implemented, Check*/DepositPreauth pending
    - **Account (5 types)**: 2 implemented, SetRegularKey/SignerListSet/TicketCreate pending
    - **Credential (3 types)**: All 3 implemented ✅
  - Progress: 31/40 (77.5%)

  **Must NOT do**:
  - Do not remove planned transaction types
  - Do not add new categories (AMM, Lending)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Task 3

  **References**:
  - `AGENTS.md:50-106` - Current Transaction Types section
  - `.sisyphus/drafts/update-agents-md.md` - Research findings with counts

  **Acceptance Criteria**:
  - [ ] Transaction count shows 31 done
  - [ ] Progress shows 77.5%

  **QA Scenarios**:
  ```
  Scenario: Verify transaction counts
    Tool: Bash (grep)
    Steps: grep "31" AGENTS.md; grep "77.5%" AGENTS.md
    Expected Result: Both counts present
    Evidence: .sisyphus/evidence/task-4-transactions.txt
  ```

  **Commit**: NO (group with other changes)

---

- [ ] 5. Add SC+ Labs Section

  **What to do**:
  - Add new section "## SC+ Labs" after Transaction Types section
  - Include: brief overview + 4 credential schemes table + file references

  **Content to add**:
  ```markdown
  ## SC+ Labs

  SC+ Labs provides experimental implementations for SC+ (Supply Chain Finance) credential schemes on XRPL. It demonstrates 4 different technical approaches to tokenize supply chain invoices.

  ### Credential Schemes

  | Scheme | Description | Steps |
  |--------|-------------|-------|
  | **MPT** | Multi-Purpose Token, Ripple RWA direction | 6 |
  | **IOU** | Trust Line Token, fast and flexible | 4 |
  | **NFT** | Non-Fungible Token, one-invoice-one-token | 4 |
  | **Credentials** | Non-token proof, maximum compliance | 3 |

  ### Implementation

  - Pages: `src/pages/scplus/` (5 pages)
  - Components: `src/components/scplus/SchemeWizard.tsx`
  - Documentation: `scplus/` folder
  ```

  **Must NOT do**:
  - Do not add detailed workflow for each scheme
  - Do not add new UI guidelines

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Task 4

  **References**:
  - `src/pages/scplus/` - SC+ Labs pages
  - `src/i18n/locales/zh.json:512-582` - SC+ translations

  **Acceptance Criteria**:
  - [ ] SC+ Labs section exists
  - [ ] 4 schemes listed in table

  **QA Scenarios**:
  ```
  Scenario: Verify SC+ Labs section
    Tool: Bash (grep)
    Steps: grep -c "SC+ Labs" AGENTS.md; grep -c "Credential Schemes" AGENTS.md
    Expected Result: SC+ Labs >= 2, Credential Schemes >= 1
    Evidence: .sisyphus/evidence/task-5-scplus.txt
  ```

  **Commit**: NO (group with other changes)

---

- [ ] 6. Final Commit

  **What to do**:
  - Review all changes in AGENTS.md
  - Commit with message: `docs: update AGENTS.md with SC+ Labs and accurate transaction progress`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Task 5

  **Acceptance Criteria**:
  - [ ] Git status shows AGENTS.md committed

  **Commit**: YES
  - Message: `docs: update AGENTS.md with SC+ Labs and accurate transaction progress`
  - Files: `AGENTS.md`

---

## Final Verification Wave

- [ ] F1. **Content Verification** — `quick`
  Run verification commands:
  - `grep -c "SC+ Labs" AGENTS.md` >= 2
  - `grep -c "scplus" AGENTS.md` >= 2
  - `grep -c "i18n" AGENTS.md` >= 1
  - Manually verify transaction count is 31
  Output: `SC+ Labs [PASS/FAIL] | scplus [PASS/FAIL] | i18n [PASS/FAIL] | Count [PASS/FAIL] | VERDICT`

- [ ] F2. **Structure Preservation** — `quick`
  Verify existing sections preserved:
  - Code Style Guidelines exists
  - Component Guidelines exists
  - Transaction Form UI Guidelines exists
  - Wallet Support table exists
  Output: `All sections preserved [YES/NO] | VERDICT`

---

## Commit Strategy

- **Commit**: YES
  - Message: `docs: update AGENTS.md with SC+ Labs and accurate transaction progress`
  - Files: `AGENTS.md`
  - Pre-commit: None required

---

## Success Criteria

### Verification Commands
```bash
grep -c "SC+ Labs" AGENTS.md  # Expected: >= 2
grep -c "scplus" AGENTS.md    # Expected: >= 2
grep -c "i18n" AGENTS.md      # Expected: >= 1
```

### Final Checklist
- [ ] SC+ Labs section exists
- [ ] scplus directories in project structure
- [ ] i18n in Tech Stack
- [ ] Transaction count accurate (31 implemented)
- [ ] All existing sections preserved
