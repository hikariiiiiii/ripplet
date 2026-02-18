# Ripplet DApp Learnings

## 2026-02-19: XRPL Client Hook Pattern

### xrpl.js Client Lifecycle
- Client uses WebSocket connections
- Always disconnect before creating new client to avoid connection leaks
- Use `useCallback` for connect/disconnect functions to stabilize useEffect dependencies

### Zustand Store Integration
- Subscribe to `networkInfo` from store for reactive network changes
- Network URLs come from `NETWORKS` constant in types

### Hook Return Pattern
```typescript
interface UseXRPLReturn {
  client: Client | null
  getClient: () => Client  // Throws if not connected
  connecting: boolean
  connected: boolean
  error: Error | null
  reconnect: () => Promise<void>
}
```

### Key Insight
Empty catch blocks need comments explaining why errors are ignored (e.g., cleanup operations).

## 2026-02-19: xrpl-wallet-connect Library Integration

### Library API
- `XRPLWalletConnect` class with methods: `selectWallet()`, `signIn()`, `signAndSubmit()`, `sign()`, `logout()`
- `WalletType` enum: `GemWallet`, `Crossmark`, `Xaman`
- `SignInResult`: `{ wallet, address }`
- `SignAndSubmitResult`: `{ hash, result }`

### Type Mapping Pattern
- Project uses string literal types: `'xaman' | 'crossmark' | 'gemwallet'`
- Library uses enum: `WalletType.Xaman`, `WalletType.Crossmark`, `WalletType.GemWallet`
- Map between them with a `Record<WalletType, LibWalletType>` object

### Singleton Pattern with Lazy Initialization
```typescript
let instance: XRPLWalletConnect | null = null;
function getInstance(): XRPLWalletConnect {
  if (!instance) {
    instance = new XRPLWalletConnect({ xamanApiKey: env.VITE_XAMM_API_KEY });
  }
  return instance;
}
```

### Error Handling Pattern
- Map library errors to user-friendly messages
- Check error message patterns with `.includes()`
- Provide specific messages for: missing extension, rejected requests, network errors

### Environment Variables
- Vite uses `import.meta.env.VITE_*` prefix
- Xaman API key: `VITE_XAMM_API_KEY` (from Xumm Developer Portal)

## 2026-02-19: Transaction Builder Base Utilities

### xrpl.js Transaction Types
- Use `SubmittableTransaction` instead of `Transaction` for functions that submit
- `Transaction` is a union of all transaction types including non-submittable ones
- `SubmittableTransaction` is the subset that can be submitted to the ledger

### Client Methods
- `client.autofill(tx)` - fills Sequence, Fee, LastLedgerSequence
- `client.submitAndWait(tx, opts)` - signs and submits, waits for validation
- Both require connected client (check with `client.isConnected()`)

### Error Code Categories
- `tel*` - Local errors (failed before reaching ledger)
- `ter*` - Remote errors (failed on ledger, may retry)
- `tef*` - Fatal errors (permanently failed)
- `tec*` - Claim errors (succeeded in processing but failed)
- `tesSUCCESS` - Success code

### Transaction Result Handling
- `TxResponse<SubmittableTransaction>` is the return type from submitAndWait
- `result.result.meta` can be string or object with TransactionResult
- Check with `typeof meta === 'object' && 'TransactionResult' in meta`

### Memo Encoding
- XRPL memos must be hex-encoded
- Use `Buffer.from(data).toString('hex')` for encoding

## 2026-02-19: Payment Transaction Builder

### xrpl.js Address Validation
- Use `isValidClassicAddress` from xrpl package for address validation
- NOT `validate.isValidAddress` - the `validate` function is for transaction validation only

### XRP Amount Handling
- XRP amounts in transactions are always in drops (1 XRP = 1,000,000 drops)
- Use `BigInt` for large number handling to avoid precision issues
- XRP supports max 6 decimal places

### IOU Amount Structure
```typescript
interface IOUAmount {
  currency: string  // Currency code (3-char or 40-char hex)
  issuer: string    // Valid XRPL address
  value: string     // Decimal amount as string
}
```

### Payment Transaction Fields
- Required: Account, Destination, Amount
- Optional: DestinationTag (uint32), InvoiceID (64-char hex), Memos
- NOT implemented: Paths (cross-currency), tfPartialPayment flag

### Export Naming Conflicts
- When multiple modules export same function name, use alias in index.ts
- Example: `isValidXRPLAddress as isValidPaymentAddress`

## 2026-02-19: Payment Page Integration

### View State Pattern
- Use a union type for view states: `'form' | 'submitting' | 'result'`
- Single state variable instead of multiple booleans
- Clear state transitions: form → submitting → result

### Wallet Connection Check
- Check both `connected` and `address` from useWallet hook
- Show friendly "connect wallet" UI when not connected
- Don't render the form until wallet is connected

### Transaction Flow
1. PaymentForm builds the transaction (calls buildPayment internally)
2. Page receives the built transaction in onSubmit callback
3. Call signAndSubmit from useWallet hook
4. Display TransactionResultDisplay with result

### useWallet Hook Enhancement
- Added `network` and `networkInfo` to the return object
- These were in the store but not exposed by the hook
- Needed for TransactionResultDisplay to generate correct explorer URL

### i18n Keys for Payment Page
- `payment.title`, `payment.subtitle` - page header
- `payment.connectWalletTitle`, `payment.connectWalletDescription` - connect prompt
- All form labels and validation messages already existed

