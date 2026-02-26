# Learnings - Xaman & Ledger Wallet Integration

## Project Context
- React 18 + TypeScript + Vite
- UI: Tailwind CSS + shadcn/ui
- State: Zustand (persisted to localStorage)
- i18n: react-i18next (zh/en)

## Existing Wallet Architecture
- Adapter pattern in `src/lib/wallets/index.ts`
- Each wallet implements: `connect*()`, `signAndSubmit*()`, `sign*()`, `get*Network()`
- Unified API via type-switch pattern

## Xaman SDK Specifics
- Package: `xumm` (Browser SDK)
- Event-driven: must wrap in Promise for sync compatibility
- Key events: `ready`, `success`, `retrieved`, `logout`, `error`
- Transaction signing: `xumm.payload.createAndSubscribe(tx, callback)`

## Decisions
- QR Modal as separate component (XamanQrModal.tsx)
- Ledger UI placeholder only (no implementation)

## XamanQrModal Component (Created)
- Location: `src/components/wallet/XamanQrModal.tsx`
- Props: `isOpen`, `qrUrl`, `payloadUrl`, `onClose`
- Presentation-only component (no SDK calls inside)
- Mobile detection via navigator.userAgent
- Uses existing i18n keys: `wallet.scanQr`, `wallet.connecting`
- Matches WalletSelectModal styling patterns


## WalletConnect.tsx Xaman Integration (Task 8)
- Xaman connection requires special handling due to QR-based flow
- Created `handleXamanConnect()` separate from generic `handleConnect()`
- Flow: Open modal → create SignIn payload → show QR → subscribe → wait → update store
- Store update: `store.setAddress()`, `store.setWalletType('xaman')`, `store.setConnected(true)`
- Need Fragment `<>...</>` to wrap Dialog + XamanQrModal in return
- Exported `getXummInstance` from wallets/index.ts for component use
