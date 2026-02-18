# Ripplet DApp Development Plan

## TL;DR

> **Quick Summary**: Build a React-based XRPL transaction DApp with wallet connection (Crossmark, Gemwallet, Xaman) and core transaction support (Payment, TrustSet, AccountSet).
>
> **Deliverables**:
> - Wallet connection UI with all 3 wallets working
> - Network switcher (Mainnet/Testnet)
> - Payment transaction form with memos support
> - TrustSet transaction form
> - AccountSet transaction form
> - Chinese/English language toggle
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Wallet Integration → Transaction Builders → Transaction UI → Integration

---

## Context

### Original Request
Build Ripplet - an XRPL DApp for transaction signing and management, supporting all 85 XRPL transaction types with Phase 1 focus on core transactions.

### Interview Summary
**Key Discussions**:
- **UI Design**: Self-designed, modern DApp style using shadcn/ui
- **Feature Priority**: Core first - wallet connection + Payment + TrustSet + AccountSet
- **Test Strategy**: Manual testing only, Agent QA scenarios for verification
- **Responsive**: Desktop-first only
- **Deployment**: Local development only
- **i18n**: Chinese/English bilingual, default English

**Research Findings**:
- `xrpl-wallet-connect` library supports all 3 wallets (Xaman needs API Key)
- Existing code: WalletConnect UI, Zustand store, types are ready
- Crossmark/Gemwallet have basic implementations
- Transaction building/signing is completely missing

### Metis Review
**Identified Gaps** (addressed):
- **xrpl-wallet-connect verification**: CONFIRMED - supports all 3 wallets
- **Network configuration**: Use existing mainnet/testnet from types
- **Transaction fields**: Defined in task specifications
- **Edge cases**: Basic handling in Phase 1, advanced deferred

---

## Work Objectives

### Core Objective
Build a functional XRPL DApp that allows users to connect their wallet and submit core transaction types (Payment, TrustSet, AccountSet) with proper error handling and bilingual UI.

### Concrete Deliverables
- `src/lib/wallets/` - Enhanced wallet integration with xrpl-wallet-connect
- `src/lib/xrpl/transactions/` - Transaction builders for Payment, TrustSet, AccountSet
- `src/components/transaction/` - Transaction form components
- `src/pages/` - Page components with routing
- `src/hooks/useTransaction.ts` - Transaction submission hook
- `src/i18n/` - Internationalization setup

### Definition of Done
- [ ] User can connect wallet (Crossmark, Gemwallet, or Xaman)
- [ ] User can switch between Mainnet and Testnet
- [ ] User can submit Payment transaction with destination, amount, optional memo
- [ ] User can submit TrustSet transaction to create trust line
- [ ] User can submit AccountSet transaction to modify account flags
- [ ] All forms show success/error feedback
- [ ] UI language can be toggled between English and Chinese

### Must Have
- Wallet connection for all 3 wallets (Crossmark, Gemwallet, Xaman)
- Network switcher (Mainnet/Testnet)
- Payment, TrustSet, AccountSet transaction forms
- Basic error display with transaction hash on success
- Chinese/English language toggle

### Must NOT Have (Guardrails - Phase 1)
- ❌ Backend server or API routes
- ❌ Transaction history viewing/storage
- ❌ Real-time ledger subscriptions (WebSocket)
- ❌ Multi-sig transaction UI
- ❌ Batch transaction submission
- ❌ Mobile-responsive layouts
- ❌ Other 82 transaction types (deferred to Phase 2)
- ❌ Analytics or tracking integration

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO (no test framework configured)
- **Automated tests**: None (manual testing with Agent QA)
- **Framework**: None

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **TUI/CLI**: Use interactive_bash (tmux)
- **API/Backend**: Use Bash (curl)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation + infrastructure):
├── Task 1: Install xrpl-wallet-connect + env setup [quick]
├── Task 2: i18n setup (react-i18next) [quick]
├── Task 3: React Router setup with pages structure [quick]
├── Task 4: Layout component with header/sidebar [visual-engineering]
└── Task 5: Toast notification system setup [quick]

Wave 2 (After Wave 1 — wallet + XRPL core):
├── Task 6: Wallet integration refactor with xrpl-wallet-connect [unspecified-high]
├── Task 7: XRPL client hook enhancement [quick]
├── Task 8: Transaction builder base utilities [unspecified-high]
├── Task 9: Payment transaction builder [quick]
├── Task 10: TrustSet transaction builder [quick]
└── Task 11: AccountSet transaction builder [quick]

Wave 3 (After Wave 2 — UI components):
├── Task 12: Wallet connect modal enhancement [visual-engineering]
├── Task 13: Network switcher component [quick]
├── Task 14: Payment transaction form [visual-engineering]
├── Task 15: TrustSet transaction form [visual-engineering]
├── Task 16: AccountSet transaction form [visual-engineering]
├── Task 17: Transaction result display component [visual-engineering]
└── Task 18: Language toggle component [quick]

Wave 4 (After Wave 3 — integration):
├── Task 19: Dashboard/Home page [visual-engineering]
├── Task 20: Payment page integration [visual-engineering]
├── Task 21: TrustSet page integration [visual-engineering]
├── Task 22: AccountSet page integration [visual-engineering]
└── Task 23: End-to-end QA with Playwright [unspecified-high]

Critical Path: T1 → T6 → T8 → T9/T10/T11 → T14/T15/T16 → T20/T21/T22 → T23
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 6 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1-5 | — | 6, 12, 19-22 |
| 6 | 1 | 12, 19-22 |
| 7 | — | 8, 20-22 |
| 8 | 7 | 9, 10, 11 |
| 9 | 8 | 14, 20 |
| 10 | 8 | 15, 21 |
| 11 | 8 | 16, 22 |
| 12 | 6 | 19-22 |
| 13 | 2 | 19-22 |
| 14 | 9, 2 | 20 |
| 15 | 10, 2 | 21 |
| 16 | 11, 2 | 22 |
| 17 | 5 | 20-22 |
| 18 | 2 | 19-22 |
| 19 | 4, 12, 13, 18 | — |
| 20 | 6, 14, 17 | 23 |
| 21 | 6, 15, 17 | 23 |
| 22 | 6, 16, 17 | 23 |
| 23 | 20, 21, 22 | — |

### Agent Dispatch Summary

- **Wave 1**: 5 tasks — T1-T3, T5 → `quick`, T4 → `visual-engineering`
- **Wave 2**: 6 tasks — T6 → `unspecified-high`, T7, T9-T11 → `quick`, T8 → `unspecified-high`
- **Wave 3**: 7 tasks — T12, T14-T17 → `visual-engineering`, T13, T18 → `quick`
- **Wave 4**: 5 tasks — T19-T22 → `visual-engineering`, T23 → `unspecified-high`

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.

---

### Wave 1: Foundation & Infrastructure

- [x] 1. Install xrpl-wallet-connect + Environment Setup

  **What to do**:
  - Install `xrpl-wallet-connect` package via npm
  - Create `.env` file with Xaman API key placeholder
  - Update `.env.template` with required environment variables
  - Add VITE_ prefix for Vite compatibility

  **Must NOT do**:
  - Do not commit actual API keys
  - Do not install unnecessary additional wallet packages

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple package installation and config file creation
  - **Skills**: []
    - No special skills needed for npm install

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: Task 6 (wallet integration)
  - **Blocked By**: None

  **References**:
  - `package.json:1-47` - Current dependencies structure
  - https://github.com/Aaditya-T/xrpl-wallet-connect - Library documentation
  - `.env.template` pattern from xrpl-wallet-connect repo

  **Acceptance Criteria**:
  - [ ] `npm install xrpl-wallet-connect` runs successfully
  - [ ] `.env` file created with `VITE_XAMM_API_KEY=your_key_here`
  - [ ] `.env.template` updated with all required env vars
  - [ ] `npm run dev` still works after changes

  **QA Scenarios**:
  ```
  Scenario: Package installed correctly
    Tool: Bash
    Steps:
      1. Run `npm ls xrpl-wallet-connect`
    Expected Result: Package version displayed (e.g., "xrpl-wallet-connect@1.2.0")
    Evidence: .sisyphus/evidence/task-01-package-check.txt

  Scenario: Environment file exists
    Tool: Bash
    Steps:
      1. Run `test -f .env && echo "EXISTS" || echo "MISSING"`
    Expected Result: "EXISTS"
    Evidence: .sisyphus/evidence/task-01-env-check.txt
  ```

  **Commit**: YES (groups with T1-T5)
  - Message: `feat(core): setup project infrastructure`

---

- [x] 2. i18n Setup (react-i18next)

  **What to do**:
  - Install `react-i18next` and `i18next` packages
  - Create `src/i18n/index.ts` with i18n configuration
  - Create `src/i18n/locales/en.json` with English translations
  - Create `src/i18n/locales/zh.json` with Chinese translations
  - Initialize i18n in `src/main.tsx`
  - Add initial translations for: wallet, network, common UI labels

  **Must NOT do**:
  - Do not add translations for unimplemented features
  - Do not use complex i18n features (plurals, interpolation) yet

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard library setup with config files
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5)
  - **Blocks**: Task 13, 14, 15, 16, 18
  - **Blocked By**: None

  **References**:
  - `src/main.tsx` - Entry point for i18n initialization
  - react-i18next official docs for setup pattern

  **Acceptance Criteria**:
  - [ ] i18n packages installed
  - [ ] `src/i18n/index.ts` created with proper config
  - [ ] `src/i18n/locales/en.json` with base translations
  - [ ] `src/i18n/locales/zh.json` with base translations
  - [ ] i18n initialized in main.tsx
  - [ ] `useTranslation` hook works in components

  **QA Scenarios**:
  ```
  Scenario: i18n hook available
    Tool: Bash
    Steps:
      1. Run `grep -r "useTranslation" src/` to verify import pattern
    Expected Result: Pattern found in i18n/index.ts
    Evidence: .sisyphus/evidence/task-02-i18n-check.txt
  ```

  **Commit**: YES (groups with T1-T5)

---

- [x] 3. React Router Setup with Pages Structure

  **What to do**:
  - Create page components directory structure:
    - `src/pages/Home.tsx`
    - `src/pages/Payment.tsx`
    - `src/pages/TrustSet.tsx`
    - `src/pages/AccountSet.tsx`
  - Update `src/App.tsx` with React Router configuration
  - Add routes: `/`, `/payment`, `/trustset`, `/accountset`
  - Create placeholder components for each page

  **Must NOT do**:
  - Do not add complex routing logic (guards, redirects)
  - Do not implement page content yet (just placeholders)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard React Router setup with basic file creation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5)
  - **Blocks**: Task 19-22 (page integration)
  - **Blocked By**: None

  **References**:
  - `src/App.tsx` - Main app component to add router
  - `package.json` - react-router-dom already installed (v6.22.0)

  **Acceptance Criteria**:
  - [ ] All page files created with placeholder content
  - [ ] Router configured in App.tsx with all routes
  - [ ] Navigation to each route works (shows placeholder)

  **QA Scenarios**:
  ```
  Scenario: Routes accessible
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:5173/
      2. Navigate to http://localhost:5173/payment
      3. Navigate to http://localhost:5173/trustset
      4. Navigate to http://localhost:5173/accountset
    Expected Result: Each route loads without 404 error
    Evidence: .sisyphus/evidence/task-03-routes-check.png
  ```

  **Commit**: YES (groups with T1-T5)

---

- [x] 4. Layout Component with Header/Sidebar

  **What to do**:
  - Create `src/components/layout/Layout.tsx` with responsive layout
  - Create `src/components/layout/Header.tsx` with:
    - Logo/app name
    - Network switcher placeholder
    - Language toggle placeholder
    - Wallet connection status placeholder
  - Create `src/components/layout/Sidebar.tsx` with navigation links
  - Use Tailwind CSS for styling (modern DApp style)
  - Integrate Layout into App.tsx

  **Must NOT do**:
  - Do not implement functional wallet/network components yet
  - Do not add mobile-responsive design

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component design and styling required
  - **Skills**: [`frontend-ui-ux`]
    - Need good UI/UX sense for modern DApp styling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5)
  - **Blocks**: Task 19-22 (page integration)
  - **Blocked By**: None

  **References**:
  - `src/components/ui/` - Existing shadcn/ui components
  - `src/index.css` - Tailwind base styles
  - Modern DApp examples: Uniswap, Aave for inspiration

  **Acceptance Criteria**:
  - [ ] Layout component wraps all pages
  - [ ] Header shows logo and placeholder elements
  - [ ] Sidebar shows navigation links to all pages
  - [ ] Layout uses Tailwind CSS classes
  - [ ] Dark theme compatible

  **QA Scenarios**:
  ```
  Scenario: Layout renders correctly
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:5173/
      2. Check header contains "Ripplet" logo/text
      3. Check sidebar contains navigation links
    Expected Result: Header and sidebar visible with correct elements
    Evidence: .sisyphus/evidence/task-04-layout-check.png
  ```

  **Commit**: YES (groups with T1-T5)

---

- [x] 5. Toast Notification System Setup

  **What to do**:
  - Verify `@radix-ui/react-toast` is installed (already in package.json)
  - Create `src/components/ui/toast.tsx` using shadcn/ui pattern
  - Create `src/components/ui/toaster.tsx` Toaster component
  - Create `src/hooks/useToast.ts` hook for toast management
  - Add Toaster to Layout component
  - Test toast functionality with demo button

  **Must NOT do**:
  - Do not create custom toast system from scratch
  - Do not add toast for unimplemented features

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard shadcn/ui component setup
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4)
  - **Blocks**: Task 17, 20-22 (transaction result display)
  - **Blocked By**: None

  **References**:
  - `src/components/ui/` - Existing shadcn/ui components pattern
  - `package.json:27` - @radix-ui/react-toast already installed

  **Acceptance Criteria**:
  - [ ] Toast component created following shadcn/ui pattern
  - [ ] useToast hook created and working
  - [ ] Toaster added to Layout
  - [ ] Test shows toast on button click

  **Commit**: YES (groups with T1-T5)

---

### Wave 2: Wallet Integration & XRPL Core

- [x] 6. Wallet Integration Refactor with xrpl-wallet-connect

  **What to do**:
  - Refactor `src/lib/wallets/index.ts` to use `xrpl-wallet-connect` library
  - Update wallet connection logic for all 3 wallets:
    - Crossmark: Use unified library API
    - Gemwallet: Use unified library API
    - Xaman: Implement Xaman SDK with Payload mechanism (requires API key)
  - Add proper TypeScript types for wallet responses
  - Handle connection errors with user-friendly messages
  - Update `src/stores/wallet.ts` if needed for new wallet API

  **Must NOT do**:
  - Do not break existing Crossmark/Gemwallet implementations if possible
  - Do not hardcode API keys

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex wallet integration with multiple providers
  - **Skills**: []
    - Standard React/TypeScript work, no special UI needs

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10, 11)
  - **Blocks**: Task 12, 19-22
  - **Blocked By**: Task 1

  **References**:
  - `src/lib/wallets/index.ts:1-109` - Current wallet implementation
  - `src/stores/wallet.ts:1-40` - Wallet state management
  - `src/types/index.ts:33` - WalletType definition
  - https://github.com/Aaditya-T/xrpl-wallet-connect - Library usage examples

  **Acceptance Criteria**:
  - [ ] All 3 wallet types connect successfully
  - [ ] Connection errors display user-friendly messages
  - [ ] Wallet address stored in Zustand store
  - [ ] TypeScript compilation passes

  **QA Scenarios**:
  ```
  Scenario: Crossmark wallet connects
    Tool: Playwright
    Preconditions: Crossmark extension installed and unlocked
    Steps:
      1. Click "Connect Wallet" button
      2. Select "Crossmark" option
      3. Approve connection in wallet
    Expected Result: Address displayed in header
    Evidence: .sisyphus/evidence/task-06-crossmark-connect.png

  Scenario: Xaman wallet connects
    Tool: Playwright
    Preconditions: Xaman app installed, valid API key configured
    Steps:
      1. Click "Connect Wallet" button
      2. Select "Xaman" option
      3. Scan QR code with Xaman app
      4. Approve connection
    Expected Result: Address displayed in header
    Evidence: .sisyphus/evidence/task-06-xaman-connect.png

  Scenario: Wallet not installed error
    Tool: Playwright
    Preconditions: No wallet extensions installed
    Steps:
      1. Click "Connect Wallet" button
      2. Select "Crossmark" option
    Expected Result: Error message "Crossmark extension not found"
    Evidence: .sisyphus/evidence/task-06-wallet-error.png
  ```

  **Commit**: YES (groups with T6-T7)
  - Message: `feat(wallet): integrate xrpl-wallet-connect`

---

- [x] 7. XRPL Client Hook Enhancement

  **What to do**:
  - Review and enhance `src/hooks/useXRPL.ts`
  - Ensure XRPL client connects to correct network
  - Add proper reconnection logic on network change
  - Add client state (connecting, connected, error)
  - Export client for transaction submission
  - Handle client lifecycle (connect on mount, disconnect on unmount)

  **Must NOT do**:
  - Do not create multiple client instances
  - Do not add WebSocket subscriptions (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Hook enhancement, standard React patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 8, 9, 10, 11)
  - **Blocks**: Task 8
  - **Blocked By**: None

  **References**:
  - `src/hooks/useXRPL.ts` - Existing hook (needs review)
  - `src/types/index.ts:5-25` - Network configuration
  - `src/stores/wallet.ts:25-26` - Network state

  **Acceptance Criteria**:
  - [ ] Client connects on component mount
  - [ ] Client reconnects on network change
  - [ ] Client state exposed (connecting, connected, error)
  - [ ] Client disconnects on unmount
  - [ ] No memory leaks

  **QA Scenarios**:
  ```
  Scenario: Client connects to network
    Tool: Playwright
    Steps:
      1. Open browser console
      2. Navigate to app
      3. Check for WebSocket connection to xrplcluster.com
    Expected Result: WebSocket connected, no errors in console
    Evidence: .sisyphus/evidence/task-07-client-connect.png

  Scenario: Network switch reconnects client
    Tool: Playwright
    Steps:
      1. Connect to Mainnet
      2. Switch to Testnet
      3. Check WebSocket URL changed
    Expected Result: Client reconnects to testnet URL
    Evidence: .sisyphus/evidence/task-07-network-switch.png
  ```

  **Commit**: YES (groups with T6-T7)

---

- [x] 8. Transaction Builder Base Utilities

  **What to do**:
  - Create `src/lib/xrpl/transactions/index.ts` for exports
  - Create `src/lib/xrpl/transactions/types.ts` with transaction types
  - Create `src/lib/xrpl/transactions/builder.ts` with base utilities:
    - `prepareTransaction()` - autofill, sequence, fee
    - `submitTransaction()` - sign, submit, wait
    - `handleTransactionResult()` - parse result, return success/error
  - Add error handling for XRPL errors (tel, ter codes)
  - Export types for Payment, TrustSet, AccountSet

  **Must NOT do**:
  - Do not implement specific transaction types yet
  - Do not add retry logic (basic error handling only)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core XRPL logic, needs careful implementation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 9, 10, 11)
  - **Blocks**: Task 9, 10, 11
  - **Blocked By**: Task 7

  **References**:
  - `xrpl` package documentation - autofill, submitAndWait
  - XRPL transaction format docs
  - https://xrpl.org/transaction-common-fields.html

  **Acceptance Criteria**:
  - [ ] Transaction types defined
  - [ ] prepareTransaction() uses autofill()
  - [ ] submitTransaction() uses submitAndWait()
  - [ ] Error codes properly categorized
  - [ ] TypeScript types complete

  **QA Scenarios**:
  ```
  Scenario: Builder functions exported
    Tool: Bash
    Steps:
      1. Run `grep -r "prepareTransaction\|submitTransaction" src/lib/xrpl/transactions/`
    Expected Result: Functions defined and exported
    Evidence: .sisyphus/evidence/task-08-builder-check.txt
  ```

  **Commit**: YES (groups with T8-T11)
  - Message: `feat(xrpl): add transaction builders`

---

- [x] 9. Payment Transaction Builder

  **What to do**:
  - Create `src/lib/xrpl/transactions/payment.ts`
  - Implement `buildPayment()` function with fields:
    - Account (required)
    - Destination (required)
    - Amount (required, supports XRP and IOU)
    - DestinationTag (optional)
    - Memos (optional, array of Memo objects)
    - InvoiceID (optional)
  - Add validation for:
    - Destination address format
    - Amount > 0
    - XRP amount precision (max 6 decimals)
  - Export PaymentTransaction type

  **Must NOT do**:
  - Do not implement cross-currency payments (Paths)
  - Do not implement partial payments (tfPartialPayment)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard transaction builder, well-documented API
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8, 10, 11)
  - **Blocks**: Task 14, 20
  - **Blocked By**: Task 8

  **References**:
  - `src/lib/xrpl/transactions/builder.ts` - Base utilities
  - https://xrpl.org/payment.html - Payment transaction docs
  - `xrpl` package types for Payment

  **Acceptance Criteria**:
  - [ ] buildPayment() creates valid Payment transaction
  - [ ] All optional fields supported
  - [ ] Address validation works
  - [ ] Amount validation works
  - [ ] Type exports correctly

  **QA Scenarios**:
  ```
  Scenario: Payment builder creates valid transaction
    Tool: Bash (node REPL)
    Steps:
      1. Import buildPayment
      2. Call with test data: { Account: "rTest...", Destination: "rDest...", Amount: "1000000" }
      3. Verify returned object has TransactionType: "Payment"
    Expected Result: Valid Payment transaction object
    Evidence: .sisyphus/evidence/task-09-payment-builder.txt
  ```

  **Commit**: YES (groups with T8-T11)

---

- [x] 10. TrustSet Transaction Builder

  **What to do**:
  - Create `src/lib/xrpl/transactions/trustset.ts`
  - Implement `buildTrustSet()` function with fields:
    - Account (required)
    - LimitAmount (required: currency, issuer, value)
    - QualityIn (optional)
    - QualityOut (optional)
  - Add validation for:
    - Currency code format (3-letter or hex)
    - Limit value >= 0
  - Handle special case: Limit = 0 deletes trust line
  - Export TrustSetTransaction type

  **Must NOT do**:
  - Do not implement rippling flags (tfSetNoRipple, etc.) yet
  - Do not implement Quality fields unless simple

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard transaction builder
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8, 9, 11)
  - **Blocks**: Task 15, 21
  - **Blocked By**: Task 8

  **References**:
  - `src/lib/xrpl/transactions/builder.ts` - Base utilities
  - https://xrpl.org/trustset.html - TrustSet transaction docs

  **Acceptance Criteria**:
  - [ ] buildTrustSet() creates valid TrustSet transaction
  - [ ] LimitAmount properly formatted
  - [ ] Currency validation works
  - [ ] Limit=0 case handled

  **QA Scenarios**:
  ```
  Scenario: TrustSet builder creates valid transaction
    Tool: Bash (node REPL)
    Steps:
      1. Import buildTrustSet
      2. Call with test data: { Account: "rTest...", LimitAmount: { currency: "USD", issuer: "rIssuer...", value: "1000" } }
      3. Verify returned object has TransactionType: "TrustSet"
    Expected Result: Valid TrustSet transaction object
    Evidence: .sisyphus/evidence/task-10-trustset-builder.txt
  ```

  **Commit**: YES (groups with T8-T11)

---

- [x] 11. AccountSet Transaction Builder

  **What to do**:
  - Create `src/lib/xrpl/transactions/accountset.ts`
  - Implement `buildAccountSet()` function with common fields:
    - Account (required)
    - SetFlag/ClearFlag (optional) - expose basic flags:
      - asfDefaultRipple (8)
      - asfRequireAuth (2)
      - asfDisallowXRP (3)
      - asfRequireDestTag (1)
    - Domain (optional)
    - TransferRate (optional)
  - Export AccountSetTransaction type
  - Document flag meanings for UI reference

  **Must NOT do**:
  - Do not expose all 10+ flags (keep it simple)
  - Do not implement EmailHash field

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard transaction builder
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8, 9, 10)
  - **Blocks**: Task 16, 22
  - **Blocked By**: Task 8

  **References**:
  - `src/lib/xrpl/transactions/builder.ts` - Base utilities
  - https://xrpl.org/accountset.html - AccountSet transaction docs
  - https://xrpl.org/accountroot.html#accountroot-flags - Flag definitions

  **Acceptance Criteria**:
  - [ ] buildAccountSet() creates valid AccountSet transaction
  - [ ] SetFlag/ClearFlag work correctly
  - [ ] Domain field supported
  - [ ] TransferRate validated (0-2000000000 range)

  **QA Scenarios**:
  ```
  Scenario: AccountSet builder creates valid transaction
    Tool: Bash (node REPL)
    Steps:
      1. Import buildAccountSet
      2. Call with test data: { Account: "rTest...", SetFlag: 8 }
      3. Verify returned object has TransactionType: "AccountSet"
    Expected Result: Valid AccountSet transaction object
    Evidence: .sisyphus/evidence/task-11-accountset-builder.txt
  ```

  **Commit**: YES (groups with T8-T11)

---

### Wave 3: UI Components

- [x] 12. Wallet Connect Modal Enhancement

  **What to do**:
  - Enhance `src/components/wallet/WalletConnect.tsx` for all 3 wallets
  - Add wallet selection modal with icons (Crossmark, Gemwallet, Xaman)
  - Show connection status (connecting, connected, error)
  - Display connected address with copy button
  - Add disconnect button
  - Style with Tailwind + shadcn/ui Dialog

  **Must NOT do**:
  - Do not add wallet detection logic (user selects)
  - Do not implement multi-wallet support

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13-18)
  - **Blocks**: Task 19-22
  - **Blocked By**: Task 6

  **Acceptance Criteria**:
  - [ ] Modal shows all 3 wallet options
  - [ ] Connection status displayed correctly
  - [ ] Address displayed with copy function
  - [ ] Disconnect button works

  **QA Scenarios**:
  ```
  Scenario: Wallet modal opens
    Tool: Playwright
    Steps:
      1. Click "Connect Wallet" button
      2. Verify modal shows Crossmark, Gemwallet, Xaman
    Expected Result: Modal visible with all wallet icons
    Evidence: .sisyphus/evidence/task-12-wallet-modal.png
  ```

  **Commit**: YES (groups with T12-T18)

---

- [x] 13. Network Switcher Component

  **What to do**:
  - Create `src/components/common/NetworkSwitcher.tsx`
  - Dropdown for Mainnet/Testnet selection
  - Display current network with colored badge
  - Update Zustand store on selection
  - Integrate into Header

  **Must NOT do**:
  - Do not add Devnet or custom networks

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocked By**: Task 2

  **Acceptance Criteria**:
  - [ ] Dropdown shows Mainnet/Testnet
  - [ ] Current network displayed
  - [ ] Selection updates store

  **Commit**: YES (groups with T12-T18)

---

- [x] 14. Payment Transaction Form

  **What to do**:
  - Create `src/components/transaction/PaymentForm.tsx`
  - Form fields: Destination, Amount, DestinationTag (optional), Memo (optional)
  - Validation with error messages
  - Submit button with loading state
  - Use react-hook-form

  **Must NOT do**:
  - Do not implement cross-currency path finding

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocked By**: Task 2, Task 9

  **Acceptance Criteria**:
  - [ ] All fields render
  - [ ] Validation works
  - [ ] Submit triggers transaction
  - [ ] i18n integrated

  **Commit**: YES (groups with T12-T18)

---

- [x] 15. TrustSet Transaction Form

  **What to do**:
  - Create `src/components/transaction/TrustSetForm.tsx`
  - Form fields: Currency code, Issuer address, Limit amount
  - Show info about limit=0 deletion

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Blocked By**: Task 2, Task 10

  **Commit**: YES (groups with T12-T18)

---

- [x] 16. AccountSet Transaction Form

  **What to do**:
  - Create `src/components/transaction/AccountSetForm.tsx`
  - Form fields: Flag checkboxes (DefaultRipple, RequireAuth, etc.), Domain
  - Show what each flag means

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Blocked By**: Task 2, Task 11

  **Commit**: YES (groups with T12-T18)

---

- [x] 17. Transaction Result Display Component

  **What to do**:
  - Create `src/components/transaction/TransactionResult.tsx`
  - Success: green checkmark, hash, explorer link
  - Error: red X, error message, retry button
  - Pending: loading spinner

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Blocked By**: Task 5

  **Commit**: YES (groups with T12-T18)

---

- [x] 18. Language Toggle Component

  **What to do**:
  - Create `src/components/common/LanguageToggle.tsx`
  - Toggle EN/ZH, persist to localStorage
  - Integrate into Header

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Blocked By**: Task 2

  **Commit**: YES (groups with T12-T18)
  - Message: `feat(ui): add transaction components`

---

### Wave 4: Page Integration & QA

- [x] 19. Dashboard/Home Page

  **What to do**:
  - Update `src/pages/Home.tsx`
  - Show wallet address, network, quick action cards
  - Welcome message for non-connected users

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Blocked By**: Task 4, Task 12, Task 13, Task 18

  **Commit**: YES (groups with T19-T22)

---

- [x] 20. Payment Page Integration

  **What to do**:
  - Update `src/pages/Payment.tsx`
  - Integrate PaymentForm, TransactionResult
  - Handle full transaction flow

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Blocked By**: Task 6, Task 14, Task 17

  **Commit**: YES (groups with T19-T22)

---

- [x] 21. TrustSet Page Integration

  **What to do**:
  - Update `src/pages/TrustSet.tsx`
  - Integrate TrustSetForm, TransactionResult

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Blocked By**: Task 6, Task 15, Task 17

  **Commit**: YES (groups with T19-T22)

---

- [x] 22. AccountSet Page Integration

  **What to do**:
  - Update `src/pages/AccountSet.tsx`
  - Integrate AccountSetForm, TransactionResult
  - Fetch current account flags

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Blocked By**: Task 6, Task 16, Task 17

  **Commit**: YES (groups with T19-T22)
  - Message: `feat(pages): integrate transaction pages`

---

- [x] 23. End-to-End QA with Playwright

  **What to do**:
  - Create Playwright test configuration
  - Write E2E tests for all critical flows
  - Capture evidence for all scenarios

  **Must NOT do**:
  - Do not test on mainnet (testnet only)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Blocked By**: Task 20, 21, 22

  **Commit**: YES
  - Message: `test: add e2e qa scenarios`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + lint + build. Review changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, unused imports.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task. Test cross-task integration. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 compliance. Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **T1-T5**: `feat(core): setup project infrastructure` — package.json, i18n, router
- **T6-T7**: `feat(wallet): integrate xrpl-wallet-connect` — wallet integration
- **T8-T11**: `feat(xrpl): add transaction builders` — transaction builders
- **T12-T18**: `feat(ui): add transaction components` — UI components
- **T19-T22**: `feat(pages): integrate transaction pages` — page integration
- **T23**: `test: add e2e qa scenarios` — QA verification

---

## Success Criteria

### Verification Commands
```bash
npm run build        # Expected: Build successful, no errors
npm run lint         # Expected: No linting errors
npm run dev          # Expected: Dev server starts on localhost:5173
```

### Final Checklist
- [ ] All 3 wallets connectable (Crossmark, Gemwallet, Xaman)
- [ ] Network switcher toggles between Mainnet/Testnet
- [ ] Payment form submits transaction successfully
- [ ] TrustSet form creates trust line successfully
- [ ] AccountSet form modifies account flags successfully
- [ ] All forms display error messages on failure
- [ ] Language toggle switches between EN/ZH
- [ ] Build passes without errors
