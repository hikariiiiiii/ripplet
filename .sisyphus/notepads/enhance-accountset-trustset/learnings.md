# Learnings: AccountSet & TrustSet Enhancement

## Task 1: AccountSet Builder Update (2026-02-27)

### Completed Changes
- Added 11 new flags to `ACCOUNT_FLAGS` constant (now 16 total)
- Added 4 new fields to `AccountSetParams` interface
- Updated `buildAccountSet` with field handling and validation

### All AccountSet Flags (16 total)
| Flag | Value | Description |
|------|-------|-------------|
| asfRequireDestTag | 1 | Require destination tag |
| asfRequireAuth | 2 | Require authorization for IOUs |
| asfDisallowXRP | 3 | Disallow XRP from strangers |
| asfDisableMaster | 4 | Disable master key |
| asfAccountTxnID | 5 | Track recent transaction ID |
| asfNoFreeze | 6 | Permanently disable freezing (IRREVERSIBLE) |
| asfGlobalFreeze | 7 | Freeze all trust lines |
| asfDefaultRipple | 8 | Enable rippling by default |
| asfDepositAuth | 9 | Block payments from unauthorized |
| asfAuthorizedNFTokenMinter | 10 | Allow NFT minter |
| asfDisallowIncomingNFTokenOffer | 12 | Block incoming NFT offers |
| asfDisallowIncomingCheck | 13 | Block incoming checks |
| asfDisallowIncomingPayChan | 14 | Block incoming payment channels |
| asfDisallowIncomingTrustline | 15 | Block incoming trust lines |
| asfAllowTrustLineClawback | 16 | Allow token clawback (IRREVERSIBLE) |

### New Fields Added
- `EmailHash`: 128-bit hex string (32 chars)
- `MessageKey`: 33 bytes hex string or empty
- `NFTokenMinter`: Account address
- `TickSize`: 0 or 3-15

### Validation Rules
- **TransferRate**: Must be 0 (no fee) or 1000000000-2000000000 (0%-100% fee)
- **TickSize**: Must be 0 (clear) or between 3-15
- **EmailHash**: Must be 32 hex characters (128-bit)
- **SetFlag/ClearFlag**: Cannot be the same value

### Important Notes
- asfNoFreeze (6) and asfAllowTrustLineClawback (16) are IRREVERSIBLE
- Note: asfAllowTrustLineLocking is NOT included (not enabled yet)
- TransferRate of 0 is a special value meaning "no fee"


## Task 2: TrustSet Builder Update (2026-02-27)

### Completed Changes
- Added 6 new flags to `TRUST_SET_FLAGS` constant (now 7 total)
- All flags use hex values (not decimal like AccountSet)

### All TrustSet Flags (7 total)
| Flag | Hex Value | Description |
|------|-----------|-------------|
| tfSetfAuth | 0x00010000 | Authorize holder (IRREVERSIBLE) |
| tfSetNoRipple | 0x00020000 | Enable NoRipple |
| tfClearNoRipple | 0x00040000 | Disable NoRipple |
| tfSetFreeze | 0x00100000 | Enable Freeze (issuer only) |
| tfClearFreeze | 0x00200000 | Disable Freeze (issuer only) |
| tfSetDeepFreeze | 0x00400000 | Enable DeepFreeze (requires Freeze first) |
| tfClearDeepFreeze | 0x00800000 | Disable DeepFreeze |

### Mutual Exclusion Pairs
- tfSetNoRipple ↔ tfClearNoRipple
- tfSetFreeze ↔ tfClearFreeze
- tfSetDeepFreeze ↔ tfClearDeepFreeze

## Task 4: TrustSetForm Enhancement (2026-02-27)

### Completed Changes
- Added Checkbox component (`src/components/ui/checkbox.tsx`) using Radix
- Added Collapsible component (`src/components/ui/collapsible.tsx`) using Radix
- Enhanced TrustSetForm with 7 flags UI
- Smart mutual exclusion for set/clear flag pairs
- Collapsible "Advanced Options" section with QualityIn/QualityOut
- Amber warning box appears when any Freeze flag is checked

### UI Implementation Pattern
```tsx
// Flag state with smart mutex
const handleFlagChange = (flagKey, checked) => {
  setFlags(prev => {
    const newFlags = { ...prev, [flagKey]: checked }
    // Smart mutex: set/clear pairs
    if (flagKey === 'setNoRipple' && checked) newFlags.clearNoRipple = false
    if (flagKey === 'clearNoRipple' && checked) newFlags.setNoRipple = false
    return newFlags
  })
}
```

### Flag Combination Logic
```tsx
// Combine flags using bitwise OR
let flagsValue = 0
if (flags.setAuth) flagsValue |= TRUST_SET_FLAGS.tfSetfAuth
// ... more flags
transaction.Flags = flagsValue || undefined  // omit if 0
```

### i18n Keys Used (Task 5 will add translations)
- trustset.flags.setAuth / .authIrreversible
- trustset.flags.noRipple / .setNoRipple / .clearNoRipple
- trustset.flags.freeze / .setFreeze / .clearFreeze
- trustset.flags.deepFreeze / .setDeepFreeze / .clearDeepFreeze
- trustset.advancedOptions / .qualityIn / .qualityOut / .qualityInHint / .qualityOutHint
- trustset.freezeWarningTitle / .freezeWarning

## Task 3: AccountSetForm Refactor (2026-02-27)

### Completed Changes
- Created `src/components/ui/radio-group.tsx` using Radix UI primitives
- Refactored AccountSetForm.tsx to support all 15 flags in 6 groups
- Implemented three-state radio buttons: unchanged/set/clear
- Added red warning boxes for irreversible flags (asfNoFreeze, asfAllowTrustLineClawback)
- Added 4 new fields: EmailHash, MessageKey, NFTokenMinter, TickSize
- Kept existing fields: Domain, TransferRate

### Flag Groups (6 groups, 15 flags total)
1. **Basic Settings** (基础设置): DefaultRipple, RequireAuth, RequireDestTag, DisallowXRP
2. **Security Settings** (安全设置): DisableMaster, AccountTxnID, DepositAuth
3. **Irreversible Operations** (不可逆操作): NoFreeze, AllowTrustLineClawback [RED WARNING]
4. **Global Control** (全局控制): GlobalFreeze
5. **NFT Related** (NFT相关): AuthorizedNFTokenMinter
6. **Disallow Incoming** (DisallowIncoming组): NFTokenOffer, Check, PayChan, Trustline

### Implementation Details
- Three-state radio: Only ONE flag can be "set" or "clear" at a time (XRPL limitation)
- When user selects "set" or "clear" for one flag, all others reset to "unchanged"
- Irreversible flags have red background and warning box in their group
- New fields use i18n keys even if not yet in translation files (Task 5 handles that)

### New i18n Keys Used (need translations in Task 5)
- `accountset.flagGroups.*` - group titles
- `accountset.flags.*` - all 15 flag labels and tooltips
- `accountset.flagState.*` - unchanged/set/clear radio labels
- `accountset.fields.*` - field labels, placeholders, hints
- `accountset.irreversibleWarning` - warning title
- `accountset.irreversibleWarningDesc` - warning description
- `accountset.flagsHint` - instruction text
- `accountset.fieldsTitle` - fields section title

### Dependencies Added
- `@radix-ui/react-radio-group` - for radio button component


## Task 5: i18n Translations Update (2026-02-27)

### Completed Changes
- Added all AccountSet translation keys to both zh.json and en.json
- Added all TrustSet translation keys to both zh.json and en.json
- All new keys follow existing naming conventions (dot notation)

### AccountSet Keys Added (zh.json & en.json)

**Flags (15 flags, 30 keys with tooltips):**
- `accountset.flags.defaultRipple` / `.defaultRippleTooltip`
- `accountset.flags.requireAuth` / `.requireAuthTooltip`
- `accountset.flags.requireDestTag` / `.requireDestTagTooltip`
- `accountset.flags.disallowXRP` / `.disallowXRPTooltip`
- `accountset.flags.disableMaster` / `.disableMasterTooltip`
- `accountset.flags.accountTxnID` / `.accountTxnIDTooltip`
- `accountset.flags.depositAuth` / `.depositAuthTooltip`
- `accountset.flags.authorizedNFTokenMinter` / `.authorizedNFTokenMinterTooltip`
- `accountset.flags.noFreeze` / `.noFreezeTooltip`
- `accountset.flags.globalFreeze` / `.globalFreezeTooltip`
- `accountset.flags.disallowIncomingNFTokenOffer` / `.disallowIncomingNFTokenOfferTooltip`
- `accountset.flags.disallowIncomingCheck` / `.disallowIncomingCheckTooltip`
- `accountset.flags.disallowIncomingPayChan` / `.disallowIncomingPayChanTooltip`
- `accountset.flags.disallowIncomingTrustline` / `.disallowIncomingTrustlineTooltip`
- `accountset.flags.allowTrustLineClawback` / `.allowTrustLineClawbackTooltip`

**Flag Groups (6 keys):**
- `accountset.flagGroups.basic` / `.security` / `.irreversible` / `.globalControl` / `.nft` / `.disallowIncoming`

**Flag States (3 keys):**
- `accountset.flagStates.unchanged` / `.set` / `.clear`

**Fields (18 keys total):**
- `accountset.fields.domain` / `.domainPlaceholder` / `.domainHint`
- `accountset.fields.transferRate` / `.transferRatePlaceholder` / `.transferRateHint`
- `accountset.fields.emailHash` / `.emailHashPlaceholder` / `.emailHashHint`
- `accountset.fields.messageKey` / `.messageKeyPlaceholder` / `.messageKeyHint`
- `accountset.fields.nfTokenMinter` / `.nfTokenMinterPlaceholder` / `.nfTokenMinterHint`
- `accountset.fields.tickSize` / `.tickSizePlaceholder` / `.tickSizeHint`

**Warning:**
- `accountset.irreversibleWarning`

### TrustSet Keys Added (zh.json & en.json)

**Flags (7 flags, 14 keys with tooltips):**
- `trustset.flags.setAuth` / `.setAuthTooltip`
- `trustset.flags.setNoRipple` / `.setNoRippleTooltip`
- `trustset.flags.clearNoRipple` / `.clearNoRippleTooltip`
- `trustset.flags.setFreeze` / `.setFreezeTooltip`
- `trustset.flags.clearFreeze` / `.clearFreezeTooltip`
- `trustset.flags.setDeepFreeze` / `.setDeepFreezeTooltip`
- `trustset.flags.clearDeepFreeze` / `.clearDeepFreezeTooltip`

**Advanced Options (6 keys):**
- `trustset.advancedOptions`
- `trustset.qualityIn` / `.qualityInPlaceholder` / `.qualityInHint`
- `trustset.qualityOut` / `.qualityOutPlaceholder` / `.qualityOutHint`

**Warnings (2 keys):**
- `trustset.freezeWarning`
- `trustset.authIrreversible`

### Naming Conventions Used
- Flag labels: `module.flags.flagName` (e.g., `accountset.flags.defaultRipple`)
- Flag tooltips: `module.flags.flagNameTooltip`
- Field labels: `module.fields.fieldName`
- Field placeholders: `module.fields.fieldNamePlaceholder`
- Field hints: `module.fields.fieldNameHint`
- Group labels: `module.flagGroups.groupKey`
- State labels: `module.flagStates.stateKey`

### Validation
- Both JSON files pass `JSON.parse()` validation
- Key structure matches existing patterns in the codebase
