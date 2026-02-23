# AGENTS.md - Development Guidelines for Ripplet

## Project Overview

Ripplet is a React-based DApp for XRPL (XRP Ledger) transaction signing and management. It supports all XRPL transaction types including the latest features like MPT, Credentials, AMM, and Lending Protocol.

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **XRPL SDK**: xrpl.js 4.6.0
- **Wallet Support**: Xaman, Crossmark, Gemwallet

## Project Structure

```
Ripplet/
├── src/
│   ├── components/        # UI components
│   │   ├── wallet/        # Wallet connection components
│   │   ├── transaction/   # Transaction form components
│   │   ├── common/        # Shared components
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core libraries
│   │   ├── xrpl/          # XRPL transaction builders
│   │   └── wallets/       # Wallet adapters
│   ├── pages/             # Page components
│   ├── stores/            # Zustand stores
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
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

## XRPL Transaction Types (67+ Total)

### 🔴 High Priority (29 types)

#### 1. Account (5 types)
- AccountSet ✅ | AccountDelete | SetRegularKey | SignerListSet | TicketCreate

#### 2. Payment (8 types)
- Payment ✅ | CheckCreate | CheckCash | CheckCancel | PaymentChannelCreate | PaymentChannelFund | PaymentChannelClaim | DepositPreauth

#### 3. Token/IOU (4 types)
- TrustSet ✅ | Clawback | OfferCreate ✅ | OfferCancel ✅ | IOU Payment | IOU EscrowCreate | IOU EscrowFinish

#### 4. NFT (6 types)
- NFTokenMint | NFTokenBurn | NFTokenCreateOffer | NFTokenAcceptOffer | NFTokenCancelOffer | NFTokenModify

#### 5. MPT (4 types)
- MPTokenIssuanceCreate ✅ | MPTokenIssuanceSet ✅ | MPTokenIssuanceDestroy ✅ | MPTokenAuthorize ✅ | MPT Transfer | MPT Lock/Freeze | MPT Clawback | MPT Escrow

#### 6. Credential (3 types)
- CredentialCreate | CredentialAccept | CredentialDelete

### 🟡 Medium Priority (13 types)

#### 7. DID (2 types)
- DIDSet | DIDDelete

#### 8. Oracle (2 types)
- OracleSet | OracleDelete

#### 9. Permission (3 types)
- PermissionedDomainSet | PermissionedDomainDelete | DelegateSet

#### 10. Vault (6 types)
- VaultCreate | VaultSet | VaultDelete | VaultDeposit | VaultWithdraw | VaultClawback

### 🟢 Low Priority (25+ types)

#### 11. AMM (7 types)
- AMMCreate | AMMDeposit | AMMWithdraw | AMMBid | AMMVote | AMMDelete | AMMClawback

#### 12. Lending (~10 types)
- LoanBrokerSet | LoanBrokerDelete | LoanSet | LoanManage | LoanPay | LoanDelete | LoanBrokerCoverDeposit | LoanBrokerCoverWithdraw | LoanBrokerClawback

#### 13. Cross-chain (6 types)
- XChainCreateBridge | XChainModifyBridge | XChainCreateClaimID | XChainCommit | XChainClaim | XChainAccountCreateCommit

#### 14. Other
- EnableAmendment | SetFee | UNLModify

### Implementation Progress
| Priority | Total | Done | Progress |
|----------|-------|------|----------|
| 🔴 High | 29 | 3 | 10.3% |
| 🟡 Medium | 13 | 0 | 0% |
| 🟢 Low | 25+ | 0 | 0% |
| **Total** | **67+** | **3** | **4.5%** |

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
