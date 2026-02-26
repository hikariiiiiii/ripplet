# Issues - Xaman & Ledger Wallet Integration

## 2026-02-26: XamanQrModal Import Deferred
- **Issue**: Task requested adding `XamanQrModal` import to WalletSelectModal.tsx
- **Problem**: TypeScript strict mode fails build on unused imports (TS6133)
- **Resolution**: Import deferred until Xaman connection logic is implemented
- **Action needed**: Add import when implementing Xaman QR flow in handleConnect()
