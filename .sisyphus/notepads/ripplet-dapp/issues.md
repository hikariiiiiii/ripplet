# Ripplet DApp Issues

## 2026-02-19: E2E Testing Findings

### Issue 1: Default Network is Mainnet
- **Severity**: Low
- **Description**: The default network is set to 'mainnet' in the wallet store, which could lead to users accidentally transacting on mainnet.
- **Recommendation**: Consider defaulting to 'testnet' for safety, or add a prominent warning when on mainnet.
- **Location**: `src/stores/wallet.ts` line 25

### Issue 2: No Wallet Connection Modal
- **Severity**: Medium
- **Description**: Clicking "Connect Wallet" button in header doesn't show a modal - it appears to require wallet extension integration.
- **Recommendation**: Add a modal showing available wallet options (Xaman, Crossmark, Gemwallet) when no extension is detected.
- **Location**: `src/components/layout/Header.tsx`

### Issue 3: Inconsistent Page Titles
- **Severity**: Low
- **Description**: When wallet is not connected, pages show "Connect Your Wallet" heading instead of the page title (e.g., "Payment", "Trust Set").
- **Recommendation**: Consider showing both the page title and the wallet connection prompt for better UX.
- **Location**: All transaction pages (Payment.tsx, TrustSet.tsx, AccountSet.tsx)

### Issue 4: Sidebar Labels Don't Match Page Titles
- **Severity**: Low
- **Description**: Sidebar shows "TrustSet" and "AccountSet" without spaces, but page titles are "Trust Set" and "Account Settings".
- **Recommendation**: Make sidebar labels consistent with page titles for better UX.
- **Location**: `src/components/layout/Sidebar.tsx`

### Test Coverage Notes
- All 10 E2E tests pass successfully
- Tests cover: home page, navigation, language toggle, network switcher, wallet connect button, all form pages, sidebar active state, responsive layout
- Wallet connection tests are limited since they require browser extensions
