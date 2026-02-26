# AGENTS.md - Development Guidelines for Ripplet

## Project Overview

Ripplet is a React-based DApp for XRPL (XRP Ledger) transaction signing and management. It supports all XRPL transaction types including the latest features like MPT, Credentials, AMM, and Lending Protocol.

**SC+ Labs**: Ripplet also includes experimental implementations for SC+ (Supply Chain Finance) credential schemes, demonstrating 4 different technical approaches to tokenizing supply chain invoices on XRPL.

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **XRPL SDK**: xrpl.js 4.6.0
- **Wallet Support**: Xaman, Crossmark, Gemwallet
- **i18n**: react-i18next (中文/English support)

## Project Structure

```
Ripplet/
├── src/
│   ├── components/        # UI components
│   │   ├── wallet/        # Wallet connection components
│   │   ├── transaction/   # Transaction form components
│   │   ├── common/        # Shared components
│   │   ├── scplus/        # SC+ Labs wizard components
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── i18n/              # Internationalization
│   │   └── locales/       # Translation files (zh.json, en.json)
│   ├── lib/               # Core libraries
│   │   ├── xrpl/          # XRPL utilities
│   │   │   └── transactions/  # Transaction type builders
│   │   └── wallets/       # Wallet adapters
│   ├── pages/             # Page components
│   │   └── scplus/        # SC+ Labs scheme pages
│   ├── stores/            # Zustand stores
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── scplus/                # SC+ documentation
└── package.json
```

## Build Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## XRPL Transaction Types (40 Total)

### Implementation Status

| Category | Total | Done | Progress |
|----------|-------|------|----------|
| MPT | 10 | 10 | 100% |
| NFT | 6 | 5 | 83.3% |
| IOU/Token | 8 | 7 | 87.5% |
| XRP Payment | 8 | 4 | 50% |
| Account | 5 | 2 | 40% |
| Credential | 3 | 3 | 100% |
| **Total** | **40** | **31** | **77.5%** |

### MPT (10 types) ✅
All implemented:
- MPTokenIssuanceCreate ✅
- MPTokenIssuanceSet ✅
- MPTokenIssuanceDestroy ✅
- MPTokenAuthorize ✅
- MPTTransfer ✅
- MPTLock ✅
- MPTClawback ✅
- MPTEscrowCreate ✅
- MPTEscrowFinish ✅
- MPTEscrowCancel ✅

### NFT (6 types)
- NFTokenMint ✅
- NFTokenBurn ✅
- NFTokenCreateOffer ✅
- NFTokenAcceptOffer ✅
- NFTokenCancelOffer ✅
- NFTokenModify *(planned)*

### IOU/Token (8 types)
- TrustSet ✅
- IOUPayment ✅
- OfferCreate ✅
- OfferCancel ✅
- IOUEscrowCreate ✅
- IOUEscrowFinish ✅
- IOUEscrowCancel ✅
- Clawback *(planned)*

### XRP Payment (8 types)
- Payment ✅
- EscrowCreate ✅
- EscrowFinish ✅
- EscrowCancel ✅
- CheckCreate *(planned)*
- CheckCash *(planned)*
- CheckCancel *(planned)*
- DepositPreauth *(planned)*

### Account (5 types)
- AccountSet ✅
- AccountDelete ✅
- SetRegularKey *(planned)*
- SignerListSet *(planned)*
- TicketCreate *(planned)*

### Credential (3 types) ✅
All implemented:
- CredentialCreate ✅
- CredentialAccept ✅
- CredentialDelete ✅

### Planned Features (Not Yet Implemented)

| Category | Types |
|----------|-------|
| DID | DIDSet, DIDDelete |
| Oracle | OracleSet, OracleDelete |
| Permission | PermissionedDomainSet, PermissionedDomainDelete, DelegateSet |
| Vault | VaultCreate, VaultSet, VaultDelete, VaultDeposit, VaultWithdraw, VaultClawback |
| AMM | AMMCreate, AMMDeposit, AMMWithdraw, AMMBid, AMMVote, AMMDelete, AMMClawback |
| Lending | LoanBrokerSet, LoanBrokerDelete, LoanSet, LoanManage, LoanPay, LoanDelete, LoanBrokerCoverDeposit, LoanBrokerCoverWithdraw, LoanBrokerClawback |
| Cross-chain | XChainCreateBridge, XChainModifyBridge, XChainCreateClaimID, XChainCommit, XChainClaim, XChainAccountCreateCommit |

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

## Code Style Guidelines

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `WalletConnect`, `PaymentForm` |
| Hooks | camelCase with use prefix | `useWallet`, `useXRPL` |
| Functions | camelCase | `connectWallet`, `buildTransaction` |
| Variables | camelCase | `walletAddress`, `transactionHash` |
| Constants | SCREAMING_SNAKE_CASE | `NETWORKS`, `TRANSACTION_TYPES` |
| Files (components) | PascalCase | `WalletConnect.tsx` |
| Files (utils/hooks) | camelCase | `useWallet.ts`, `utils.ts` |

### Import Organization

```typescript
// 1. React imports
import { useState, useEffect } from 'react'

// 2. Third-party libraries
import { Client } from 'xrpl'
import { useStore } from 'zustand'

// 3. Internal imports (use @ alias)
import { Button } from '@/components/ui/button'
import { useWallet } from '@/lib/wallets'
import type { Transaction } from '@/types'
```

### Formatting Rules

- **Indentation**: 2 spaces
- **Line length**: 100 characters maximum
- **Quotes**: Single quotes for strings, double for JSX
- **Semicolons**: Required
- **Trailing commas**: ES5 compatible (no trailing commas in function parameters)

## Internationalization (i18n) Guidelines

Ripplet supports Chinese and English using react-i18next. All user-facing text MUST be internationalized.

### File Locations

| File | Purpose |
|------|---------|
| `src/i18n/index.ts` | i18n configuration |
| `src/i18n/locales/zh.json` | Chinese translations |
| `src/i18n/locales/en.json` | English translations |

### Development Rules

1. **NO hardcoded text in components** - All visible text must use `t()` function
2. **Add new keys to BOTH language files** - When adding text, update both `zh.json` and `en.json`
3. **Use nested keys for organization** - Group related translations by feature/module

### Usage Pattern

```typescript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('module.title')}</h1>
      <p>{t('module.description')}</p>
      <button>{t('common.submit')}</button>
    </div>
  );
}
```

### Key Naming Convention

| Category | Pattern | Example |
|----------|---------|---------|
| Common | `common.*` | `common.submit`, `common.cancel`, `common.loading` |
| Navigation | `nav.*` | `nav.payment`, `nav.nft` |
| Feature modules | `moduleName.*` | `payment.amount`, `nft.mint` |
| Form labels | `form.*` | `form.amount`, `form.destination` |
| Error messages | `error.*` | `error.invalidAddress`, `error.insufficientBalance` |
| Wallet | `wallet.*` | `wallet.connect`, `wallet.disconnect` |

### Adding New Translations

When adding a new feature or page:

1. **Add keys to `zh.json`:**
```json
{
  "newFeature": {
    "title": "新功能标题",
    "description": "功能描述",
    "action": "执行操作"
  }
}
```

2. **Add matching keys to `en.json`:**
```json
{
  "newFeature": {
    "title": "New Feature Title",
    "description": "Feature description",
    "action": "Execute Action"
  }
}
```

### Checklist for New Components

- [ ] All text content uses `t()` function
- [ ] Keys added to both `zh.json` and `en.json`
- [ ] Keys follow naming convention (lowercase, dot notation)
- [ ] No hardcoded strings in JSX
- [ ] Placeholder text and validation messages are also internationalized

## Component Guidelines

### Functional Components

```typescript
interface Props {
  title: string
  onSubmit: (data: FormData) => void
}

export function MyComponent({ title, onSubmit }: Props) {
  const [value, setValue] = useState('')
  
  return (
    <div className="p-4">
      {/* content */}
    </div>
  )
}
```

### Custom Hooks

```typescript
export function useMyHook(param: string) {
  const [state, setState] = useState(null)
  
  useEffect(() => {
    // effect logic
  }, [param])
  
  return { state, setState }
}
```

## Git Commit Guidelines

Use conventional commit format:
- `feat: add payment transaction support`
- `fix: resolve wallet connection issue`
- `refactor: extract transaction builder logic`
- `test: add tests for useXRPL hook`
- `docs: update transaction type documentation`

## Testing

```bash
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

## Supported Wallets

| Wallet | Type | Connection Method |
|--------|------|-------------------|
| Crossmark | Browser Extension | window.crossmark |
| Gemwallet | Browser Extension | window.gemwallet |
| Xaman | Mobile App | Xaman SDK (requires setup) |
## Transaction Form UI Guidelines

### Button Layout

All transaction forms MUST follow this button layout pattern:

```
[Preview Button (optional)] [Submit Button (flex-1)]
```

- **Preview Button** (optional, left side): Use `variant="outline"`, Eye/EyeOff icon, for complex forms
- **Submit Button** (right side, takes remaining space): Changes based on connection state

### Submit Button States

The submit button MUST have three states:

1. **Loading State** (`isSubmitting === true`):
   ```tsx
   <>
     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
     {t('common.loading')}
   </>
   ```

2. **Connected State** (`isConnected === true`):
   ```tsx
   <>
     <Wallet className="w-4 h-4 mr-2" />
     Sign & Send
   </>
   ```

3. **Disconnected State** (`isConnected === false`):
   ```tsx
   <>
     <Wallet className="w-4 h-4 mr-2" />
     {t('wallet.connect')}
   </>
   ```

**IMPORTANT**: The "Connect Wallet" button MUST NOT validate the form. Only the "Sign & Send" button validates.

### Validation Order

Submit handlers MUST follow this exact order:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // 1. Connection check FIRST (no validation)
  if (!isConnected && onConnectWallet) {
    onConnectWallet()
    return
  }

  // 2. Form validation SECOND
  if (!validateForm()) return

  // 3. Build and submit transaction LAST
  const transaction = buildTransaction(...)
  await onSubmit(transaction)
}
```

### Destructive Actions

For destructive actions (delete, destroy, cancel, burn), do NOT use `variant="destructive"` on the button.

Instead, use a **warning box** inside the form:

```tsx
<div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
  <div className="flex items-start gap-3">
    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
    <div className="space-y-1">
      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
        {t('xxx.warningTitle')}
      </p>
      <ul className="text-sm text-amber-600/80 dark:text-amber-400/80 space-y-1 list-disc list-inside">
        <li>{t('xxx.warning1')}</li>
        <li>{t('xxx.warning2')}</li>
      </ul>
    </div>
  </div>
</div>
```

The submit button should use the standard green gradient style.

### Form Component Props

All form components MUST accept these props:

```typescript
interface XxxFormProps {
  account: string
  onSubmit: (transaction: TransactionType) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean      // Required for wallet state
  onConnectWallet?: () => void  // Required for wallet connection
}
```

### Input Focus Style

All input fields use white focus highlight (defined in base Input component):
- `hover:border-white/20` (hover state)
- `focus-visible:ring-white/20`
- `focus-visible:border-white/40`

Do NOT override with other colors unless absolutely necessary.

### Standard Submit Button Style

```tsx
<Button
  type="submit"
  disabled={isSubmitting}
  className="flex-1 btn-glow bg-gradient-to-r from-xrpl-green to-xrpl-green-light hover:from-xrpl-green-light hover:to-xrpl-green text-background font-semibold"
>
  {/* button content */}
</Button>
```

## Wallet Connection Guidelines

### No Navigation After Connection

**CRITICAL**: When a user connects their wallet on ANY page (transaction pages, SC+ Labs, etc.), the application MUST stay on the current page. DO NOT navigate to home or any other page after successful wallet connection.

**Why**: Users often connect their wallet while filling out a transaction form. Navigating away would lose their form data and disrupt their workflow.

**Implementation**:

```typescript
// ❌ WRONG - Navigating after connection
try {
  await connect(wallet.type);
  onOpenChange(false);
  navigate('/');  // NEVER do this!
} catch (err) {
  // error handling
}

// ✅ CORRECT - Stay on current page
try {
  await connect(wallet.type);
  onOpenChange(false);  // Just close the modal, stay on page
} catch (err) {
  // error handling
}
```

**Files affected**:
- `src/components/wallet/WalletSelectModal.tsx`
- Any component that handles wallet connection callbacks

**This rule exists because this bug has occurred multiple times. Do NOT reintroduce navigation after wallet connection.**

## JSON Preview Reactivity Guidelines

**CRITICAL**: All transaction forms with JSON preview MUST update the preview reactively when form values change.

### The Bug Pattern (DO NOT DO THIS)

The most common regression is **incomplete useEffect dependencies**:

```typescript
// ❌ WRONG - Missing form fields in dependency array
const watchedFields = watch();

useEffect(() => {
  if (!showPreview) return;
  // ... build transaction ...
  // eslint-disable-next-line react-hooks/exhaustive-deps  <-- NEVER add this!
}, [showPreview, account]);  // <-- MISSING watchedFields!
```

This causes the JSON preview to **not update** when form values change because React doesn't know to re-run the effect.

### Correct Patterns

There are **three acceptable patterns** for reactive JSON preview:

#### Pattern A: useState with formData (Recommended for complex validation)

Use when you need custom validation logic or complex form state.

```typescript
const [formData, setFormData] = useState<FormDataType>({
  field1: '',
  field2: '',
});
const [showPreview, setShowPreview] = useState(false);
const [transactionJson, setTransactionJson] = useState<TransactionType | null>(null);

// Auto-refresh when form changes and preview is open
useEffect(() => {
  if (!showPreview) return;
  if (!validateForm()) return;  // Custom validation

  try {
    const tx = buildTransaction({ Account: account, ...formData });
    setTransactionJson(tx);
  } catch {
    // Silent fail on auto-refresh
  }
}, [formData, showPreview, account]);  // ✅ formData triggers re-run
```

#### Pattern B: react-hook-form with individual watch() calls

Use when you have few fields and want granular control.

```typescript
const { register, watch, trigger } = useForm<FormDataType>();

// Watch each field individually
const field1 = watch('field1');
const field2 = watch('field2');

useEffect(() => {
  if (!showPreview) return;

  const validateAndBuild = async () => {
    const isValid = await trigger(['field1', 'field2']);
    if (!isValid) return;

    try {
      const tx = buildTransaction({ Account: account, field1, field2 });
      setTransactionJson(tx);
    } catch {
      // Silent fail
    }
  };

  validateAndBuild();
}, [field1, field2, showPreview, account, trigger]);  // ✅ Each field triggers re-run
```

#### Pattern C: react-hook-form with watchedFields object

Use when you have many fields and want concise code.

```typescript
const { register, watch, trigger } = useForm<FormDataType>();
const watchedFields = watch();  // Watch all fields

useEffect(() => {
  if (!showPreview) return;

  const validateAndBuild = async () => {
    const isValid = await trigger(['field1', 'field2']);
    if (!isValid) return;

    try {
      const tx = buildTransaction({
        Account: account,
        field1: watchedFields.field1,
        field2: watchedFields.field2,
      });
      setTransactionJson(tx);
    } catch {
      // Silent fail
    }
  };

  validateAndBuild();
}, [watchedFields, showPreview, account, trigger]);  // ✅ watchedFields triggers re-run
```

### Key Rules

1. **NEVER use `eslint-disable-next-line react-hooks/exhaustive-deps`** - If ESLint warns about missing deps, add them!
2. **Always include form state in dependencies** - `formData`, `watchedFields`, or individual `watch('field')` values
3. **Always include `showPreview`** - To only build when preview is visible
4. **Always include `account`** - Account is needed for transaction building
5. **Include `trigger` when using react-hook-form** - For validation function stability

### Files Affected

All 31 transaction form components in `src/components/transaction/`:

| Pattern | Forms |
|---------|-------|
| Pattern A (useState) | AccountSetForm, NFTokenMintForm, CredentialCreateForm, EscrowCreateForm, OfferCreateForm, etc. |
| Pattern B (individual watch) | PaymentForm, MPTEscrowCreateForm, MPTTransferForm |
| Pattern C (watchedFields) | TrustSetForm, MPTokenIssuanceSetForm, MPTokenAuthorizeForm, IOUPaymentForm, IOUEscrowCreateForm, etc. |

| Pattern | Forms |
| **Pattern B (individual watch)** | PaymentForm, MPTEscrowCreateForm, MPTTransferForm
| **Pattern C (watchedFields)** | TrustSetForm, MPTokenIssuanceSetForm, MPTokenAuthorizeForm, IOUPaymentForm, IOUEscrowCreateForm, etc. | Pattern D (useWatch - stable reference)
 | MPTokenIssuanceCreateForm (many fields + use `useWatch` for stable reference

### Important: Avoiding Infinite Loops with watch()

**WARNING**: Using `watch()` directly in useEffect dependencies can cause infinite loops!

```typescript
// ❌ DANGEROUS - watch() returns new object reference every render
const watchedFields = watch();

useEffect(() => {
  // ...
}, [watchedFields]);  // Infinite loop! watchedFields is always "new"
``

**Solution**: Use `useWatch` for stable object references:

```typescript
import { useForm, useWatch } from 'react-hook-form';

const { control } = useForm<FormDataType>();

// Use useWatch for stable reference - only re-renders when values actually change
const watchedFields = useWatch<FormDataType>({ control }) as FormDataType;

useEffect(() => {
  if (!showPreview) return;
  // ...
}, [watchedFields, showPreview, account, trigger, getValues]);  // ✅ Stable - no infinite loop
```

**This rule exists because this bug has occurred multiple times. NEVER bypass ESLint exhaustive-deps warnings with disable comments."
**This rule exists because this bug has occurred multiple times. NEVER bypass ESLint exhaustive-deps warnings with disable comments.**