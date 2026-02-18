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

## XRPL Transaction Types (85 Total)

### Core Transactions
- Account: AccountSet, AccountDelete, SetRegularKey, SignerListSet, TicketCreate
- Payment: Payment, Check*, PaymentChannel*, DepositPreauth
- Token: TrustSet, Clawback

### DEX & AMM
- DEX: OfferCreate, OfferCancel
- AMM: AMMCreate, AMMDeposit/Withdraw, AMMBid/Vote, AMMDelete, AMMClawback

### NFT & MPT
- NFT: NFTokenMint/Burn/CreateOffer/AcceptOffer/CancelOffer, NFTokenModify
- MPT: MPTokenIssuanceCreate/Set/Destroy, MPTokenAuthorize

### New Features (2024-2025)
- Credential: CredentialCreate/Accept/Delete
- Vault: VaultCreate/Set/Delete, VaultDeposit/Withdraw/Clawback
- Lending: LoanBroker*, Loan*
- DID: DIDSet, DIDDelete
- Oracle: OracleSet, OracleDelete
- Cross-chain: XChain*
- Permission: PermissionedDomain*, DelegateSet

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
