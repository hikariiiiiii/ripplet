# Learnings - MPT Metadata Editor

## [2026-02-27] Session Start
- XLS-89 uses compressed keys (t, n, d, i, ac, as, in, us, ai) for 1024 byte limit
- Byte limit applies to hex-encoded output, not raw JSON
- xrpl.js provides `encodeMPTokenMetadata()`, `decodeMPTokenMetadata()`, `validateMPTokenMetadata()`
- Use native `<select>` with Tailwind styling (no shadcn/ui Select)

- Created Textarea component following Input pattern with same dark theme styling (white focus ring, border-input, bg-secondary/30)
## [2026-02-27] Metadata Templates Created
- Created `src/lib/xrpl/metadata-templates.ts` with 6 preset templates
- Interface `MetadataTemplate` follows XLS-89 compressed key format
- Each template includes realistic sample data for `us` (uris) and `ai` (additional_info)
- Templates cover: stablecoin, treasury, real_estate, wrapped, gaming, defi
- Helper function `getTemplateById()` for template lookup

## [2026-02-27] Metadata Utils Created
- Created `src/lib/xrpl/metadata-utils.ts` with TypeScript types and utility functions
- xrpl.js `encodeMPTokenMetadata()` requires `MPTokenMetadata` type with required fields (ticker, name, icon, asset_class, issuer_name)
- Created custom `MPTMetadata` interface with ALL optional fields for form flexibility
- Key conversion functions: `longToShortKeys()`, `shortToLongKeys()` for XLS-89 format
- Encoding: `encodeMetadata()` wraps xrpl.js encoder with `as any` cast for flexibility
- Decoding: `decodeMetadata()` wraps xrpl.js decoder and returns our custom interface
- Size validation: `validateMetadataSize()` returns `{ valid, bytes }` where bytes = hex.length / 2
- Constants exported: `ASSET_CLASSES`, `ASSET_SUBCLASSES`, `URI_CATEGORIES`, `MAX_METADATA_BYTES`
- Helper functions: `requiresSubclass()`, `getSubclasses()` for form logic

## [2026-02-27] MPTMetadataModal Component Created
- Created `src/components/transaction/MPTMetadataModal.tsx` with form mode only
- Uses native `<select>` elements with Tailwind styling (not shadcn/ui Select)
- `asset_class` field: onChange converts empty string to `undefined` to match MPTMetadata type
- `asset_subclass` field: only shows when `asset_class === 'rwa'`, also handles empty string -> undefined
- URIs dynamic list: min 1 entry, add/remove with Plus/Trash2 icons
- Each URI entry has: uri (input), category (select), title (input)
- Form data stored in useState with MPTMetadata type, all fields optional
- Modal uses Dialog pattern from WalletSelectModal with DialogHeader, DialogTitle, DialogDescription
- additional_info textarea uses font-mono for JSON formatting
- All text uses i18n with fallback defaultValue for development

## [2026-02-27] JSON Mode & Templates Added to MPTMetadataModal
- Added JSON mode toggle with Form/JSON buttons using FileText/Code icons
- JSON mode uses LONG keys (ticker, name, desc) for readability, NOT short keys (t, n, d)
- Mode switch handlers: `handleSwitchToJson()` converts formData to JSON, `handleSwitchToForm()` parses JSON back
- Malformed JSON shows toast error and doesn't switch modes (catch block handles parse error)
- Template dropdown loads all 6 templates from METADATA_TEMPLATES
- Template application shows confirmation overlay if form has existing data (hasFormData check)
- `applyTemplate()` converts short keys from template to long keys for form
- Size validation uses `validateMetadataSize()` from metadata-utils.ts, returns { valid, bytes }
- Size warning banner shows green (valid) or amber (exceeded) with byte count
- Apply button disabled when `!sizeValidation.valid`
- Required field validation on Apply: checks ticker and name, shows toast if missing
- Apply outputs plain JSON string (NOT hex-encoded), parent component handles hex encoding
- Template confirmation uses absolute positioned overlay with backdrop-blur
- All new text uses i18n with defaultValue for development

## [2026-02-27] Modal Integration with MPTokenIssuanceCreateForm
- Added `metadataModalOpen` state with `useState(false)`
- Wrapped metadata Input and new Edit button in `flex gap-2` container
- Input gets `className="flex-1"` to take remaining space
- Edit button gets `className="shrink-0"` to prevent shrinking
- Modal receives `initialMetadata={watch('metadata') || ''}` for current value
- Modal's `onMetadataChange` uses `setValue('metadata', json)` to update form
- Return statement wrapped in `<>...</>` Fragment since form + modal are siblings
- Reactive preview updates automatically because `metadata` is already in useEffect dependencies
- Existing manual JSON editing in Input field preserved as fallback

## [2026-02-27] i18n Translations Added
- Added `mpt.metadata` namespace to both zh.json and en.json with 53 keys
- Keys cover: title, description, form fields (ticker, name, desc, icon), asset classification, URIs, JSON mode, templates, validation messages
- Added extra keys used by component but not in original task spec: template, invalidJsonDesc, requiredFieldsDesc, sizeExceeded, sizeExceededDesc, overwriteTitle, overwriteDesc, overwrite
- All text in MPTMetadataModal.tsx now uses `t('mpt.metadata.*')` with fallback defaultValue
- Both JSON files validated successfully
