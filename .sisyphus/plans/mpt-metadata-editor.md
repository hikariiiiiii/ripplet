# MPT Metadata Editor Component

## TL;DR

> **Quick Summary**: Create a structured metadata editor modal for MPT creation form following XLS-89 specification, with form+JSON dual mode, preset templates, and dynamic URI list.
> 
> **Deliverables**:
> - New `MPTMetadataModal` component with form/JSON dual mode
> - New `Textarea` UI component
> - Preset template selection for common token types
> - Dynamic URI list with add/remove functionality
> - i18n support (中文/English)
> - Integration with existing MPTokenIssuanceCreateForm
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 3 → Task 5 → Task 6

---

## Context

### Original Request
Extend the MPT creation form with metadata functionality. The user wants a modal dialog where users can:
1. See different metadata field options
2. Select from preset templates
3. Get validation for RWA subclass fields
4. Edit JSON examples and customize content

### Interview Summary
**Key Discussions**:
- **Editor Mode**: Form + JSON dual mode with toggle switch
- **additional_info**: JSON editor textarea (freeform)
- **uris**: Dynamic form list with add/remove buttons
- **Trigger**: Button next to existing metadata input field
- **Templates**: Preset templates for stablecoin, treasury, real estate, etc.
- **Output**: JSON string (hex encoding handled by xrpl.js)
- **Testing**: Agent QA scenarios only

**Research Findings**:
- XLS-89 uses compressed keys (t, n, d, i, ac, as, in, us, ai) for 1024 byte limit
- Byte limit applies to **hex-encoded output**, not raw JSON
- xrpl.js provides `encodeMPTokenMetadata()`, `decodeMPTokenMetadata()`, `validateMPTokenMetadata()`
- Dynamic add/remove pattern exists in `NFTokenCancelOfferForm.tsx`
- Dialog pattern exists in `WalletSelectModal.tsx`
- No Textarea component exists yet - needs to be created

### Metis Review
**Identified Gaps** (addressed):
- **Byte limit validation**: Must validate `encodeMPTokenMetadata()` output, not raw JSON length
- **Existing metadata parsing**: Modal should parse existing metadata with `decodeMPTokenMetadata()` on open
- **Empty optional fields**: Should be omitted from output JSON for cleanliness
- **Template overwrite**: Should prompt user before overwriting existing form data
- **Select component**: Use native `<select>` with Tailwind styling (no shadcn/ui Select)

---

## Work Objectives

### Core Objective
Create a user-friendly metadata editor that:
1. Guides users through XLS-89 compliant metadata creation
2. Provides presets for common token types
3. Validates input and warns about size limits
4. Allows advanced users to edit raw JSON

### Concrete Deliverables
- `src/components/transaction/MPTMetadataModal.tsx` - Modal component
- `src/components/ui/textarea.tsx` - Textarea UI component
- `src/lib/xrpl/metadata-templates.ts` - Preset templates data
- Updated `src/components/transaction/MPTokenIssuanceCreateForm.tsx`
- Updated i18n files (`zh.json`, `en.json`)

### Definition of Done
- [ ] Modal opens from button in MPT form
- [ ] All XLS-89 fields editable in form mode
- [ ] JSON mode toggle works with bidirectional sync
- [ ] Template selection populates form fields
- [ ] RWA subclass validation works (conditional required)
- [ ] URI dynamic list add/remove works
- [ ] Size warning shows when encoded > 1024 bytes
- [ ] i18n works in both languages
- [ ] Output is valid JSON string

### Must Have
- Form mode with all XLS-89 fields
- JSON mode with bidirectional sync
- Preset templates (at least 4 types)
- RWA subclass conditional validation
- Dynamic URI list
- Byte size warning
- i18n support

### Must NOT Have (Guardrails)
- NO modification to transaction submission logic
- NO shadcn/ui Select component (use native select)
- NO hex encoding in modal (handled by xrpl.js)
- NO unit tests (Agent QA only)
- NO features beyond the 4 discussed areas

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (no test framework configured)
- **Automated tests**: None
- **Framework**: N/A
- **Agent-Executed QA**: YES - all scenarios below

### QA Policy
Every task includes agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **Form Validation**: Use Playwright — Fill fields, check validation messages

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - parallel):
├── Task 1: Create Textarea component [quick]
├── Task 2: Create metadata templates file [quick]
└── Task 3: Create metadata types and utilities [quick]

Wave 2 (Core Component - sequential):
├── Task 4: Create MPTMetadataModal - form mode [visual-engineering]
├── Task 5: Create MPTMetadataModal - JSON mode [visual-engineering]
└── Task 6: Create MPTMetadataModal - templates & validation [visual-engineering]

Wave 3 (Integration - sequential):
├── Task 7: Integrate modal with MPT form [quick]
└── Task 8: Add i18n translations [quick]

Wave FINAL (Verification):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: Task 1/2/3 → Task 4 → Task 5 → Task 6 → Task 7
Parallel Speedup: ~40% faster than sequential
Max Concurrent: 3 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | — | 4, 5 |
| 2 | — | 4, 6 |
| 3 | — | 4, 5, 6, 7 |
| 4 | 1, 2, 3 | 5, 6 |
| 5 | 1, 3, 4 | 6 |
| 6 | 2, 3, 4, 5 | 7 |
| 7 | 3, 6 | 8 |
| 8 | 7 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 3 tasks → `quick` (all foundation work)
- **Wave 2**: 3 tasks → `visual-engineering` (UI component creation)
- **Wave 3**: 2 tasks → `quick` (integration work)
- **Wave FINAL**: 4 tasks → `oracle`, `unspecified-high`, `unspecified-high`, `deep`

---

## TODOs

- [x] 1. **Create Textarea UI Component**

  **What to do**:
  - Create `src/components/ui/textarea.tsx` following the Input component pattern
  - Use `<textarea>` element with Tailwind styling
  - Support `className`, `rows`, `disabled`, `placeholder` props
  - Match the dark theme styling (bg-background, border-border, focus ring)
  - Export as forwardRef component

  **Must NOT do**:
  - Do NOT add react-hook-form integration (keep it pure UI)
  - Do NOT add complex features like auto-resize (keep it simple)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple UI component, follows existing Input pattern
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: None

  **References**:
  - `src/components/ui/input.tsx` - Use this as template for styling pattern
  - `src/components/ui/button.tsx` - Reference for forwardRef pattern

  **Acceptance Criteria**:
  - [ ] File created at `src/components/ui/textarea.tsx`
  - [ ] Component accepts `rows`, `className`, `placeholder`, `disabled` props
  - [ ] Styling matches dark theme (white focus ring, border-border)
  - [ ] TypeScript types are correct

  **QA Scenarios**:
  ```
  Scenario: Textarea renders with correct styling
    Tool: Playwright
    Steps:
      1. Create a test page importing Textarea
      2. Render <Textarea placeholder="Test" rows={4} />
      3. Verify element exists with correct attributes
    Expected Result: Textarea visible with placeholder text
    Evidence: .sisyphus/evidence/task-1-textarea-render.png
  ```

  **Commit**: NO (group with Tasks 2-3)

- [x] 2. **Create Metadata Templates File**

  **What to do**:
  - Create `src/lib/xrpl/metadata-templates.ts`
  - Define TypeScript interface for template
  - Create 6 preset templates:
    1. Stablecoin (rwa/stablecoin)
    2. Treasury (rwa/treasury)
    3. Real Estate (rwa/real_estate)
    4. Wrapped Token (wrapped)
    5. Gaming Token (gaming)
    6. DeFi Token (defi)
  - Each template includes: t, n, d, i, ac, as (if RWA), in, sample us, sample ai

  **Must NOT do**:
  - Do NOT add Meme token template (not priority)
  - Do NOT add validation logic (separate task)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Data file creation, no complex logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 4, 6
  - **Blocked By**: None

  **References**:
  - XRPL docs: https://xrpl.org/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens - Example JSON structures
  - Draft file `.sisyphus/drafts/mpt-metadata-editor.md` - Template definitions

  **Acceptance Criteria**:
  - [ ] File created at `src/lib/xrpl/metadata-templates.ts`
  - [ ] TypeScript interface `MetadataTemplate` defined
  - [ ] 6 templates exported with correct XLS-89 keys
  - [ ] Each template has unique name and icon placeholder

  **QA Scenarios**:
  ```
  Scenario: Templates file exports correctly
      Tool: Bash (node)
      Steps:
        1. Run `node -e "import('./src/lib/xrpl/metadata-templates.ts').then(m => console.log(Object.keys(m)))"`
      Expected Result: Exports STABLECOIN_TEMPLATE, TREASURY_TEMPLATE, etc.
      Evidence: .sisyphus/evidence/task-2-templates-export.txt
  ```

  **Commit**: NO (group with Tasks 1, 3)

- [x] 3. **Create Metadata Types and Utilities**

  **What to do**:
  - Create `src/lib/xrpl/metadata-utils.ts`
  - Define TypeScript interfaces:
    - `MPTMetadata` - Full metadata object with long keys (ticker, name, etc.)
    - `MPTMetadataEncoded` - Encoded version with short keys (t, n, etc.)
    - `UriEntry` - URI object {u, c, t}
  - Create utility functions:
    - `encodeMetadata(meta: MPTMetadata): string` - Use xrpl.js `encodeMPTokenMetadata`
    - `decodeMetadata(hex: string): MPTMetadata` - Use xrpl.js `decodeMPTokenMetadata`
    - `validateMetadataSize(meta: MPTMetadata): { valid: boolean, bytes: number }` - Check encoded size ≤ 1024
    - `longToShortKeys(meta: MPTMetadata): MPTMetadataEncoded` - Convert field names
    - `shortToLongKeys(meta: MPTMetadataEncoded): MPTMetadata` - Reverse conversion
  - Export asset class constants: `ASSET_CLASSES`, `ASSET_SUBCLASSES`, `URI_CATEGORIES`

  **Must NOT do**:
  - Do NOT add form validation (that's in modal component)
  - Do NOT duplicate xrpl.js functionality (wrap it)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Type definitions and simple utility functions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 4, 5, 6, 7
  - **Blocked By**: None

  **References**:
  - `src/lib/xrpl/transactions/mpt.ts` - Reference for xrpl.js imports
  - xrpl.js docs: `encodeMPTokenMetadata`, `decodeMPTokenMetadata`, `validateMPTokenMetadata`

  **Acceptance Criteria**:
  - [ ] File created at `src/lib/xrpl/metadata-utils.ts`
  - [ ] All TypeScript interfaces defined with correct types
  - [ ] `encodeMetadata` uses xrpl.js and returns hex string
  - [ ] `validateMetadataSize` returns byte count (hex.length / 2)
  - [ ] Constants exported: `ASSET_CLASSES` array, `ASSET_SUBCLASSES` object

  **QA Scenarios**:
  ```
  Scenario: Encode/decode roundtrip works
      Tool: Bash (node)
      Steps:
        1. Create test script importing encodeMetadata, decodeMetadata
        2. Encode sample metadata, verify hex output
        3. Decode hex, verify matches original
      Expected Result: Roundtrip preserves data
      Evidence: .sisyphus/evidence/task-3-encode-decode.txt
  ```

  **Commit**: NO (group with Tasks 1-2 as single commit)

---

- [x] 4. **Create MPTMetadataModal - Form Mode**

  **What to do**:
  - Create `src/components/transaction/MPTMetadataModal.tsx`
  - Implement Dialog component with open/onOpenChange props
  - Add form mode with fields:
    - ticker (Input, uppercase validation, max 6 chars)
    - name (Input)
    - desc (Textarea)
    - icon (Input, URL)
    - asset_class (native select dropdown)
    - asset_subclass (native select, conditional - shown only when asset_class=rwa)
    - issuer_name (Input)
    - uris (dynamic list with add/remove, each with uri/category/title)
    - additional_info (Textarea, JSON editor)
  - Use native <select> elements with Tailwind styling
  - State management: formData object with all fields

  **Must NOT do**:
  - Do NOT use shadcn/ui Select (not installed)
  - Do NOT implement JSON mode (Task 5)
  - Do NOT implement templates (Task 6)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex UI component with multiple form fields
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Tasks 1-3)
  - **Blocks**: Tasks 5, 6
  - **Blocked By**: Tasks 1, 2, 3

  **References**:
  - `src/components/wallet/WalletSelectModal.tsx` - Dialog pattern
  - `src/components/transaction/NFTokenCancelOfferForm.tsx` - Dynamic add/remove pattern
  - `src/components/transaction/MPTokenIssuanceCreateForm.tsx` - Form styling reference
  - `src/components/ui/dialog.tsx` - Dialog components

  **Acceptance Criteria**:
  - [ ] Modal opens and closes via open/onOpenChange
  - [ ] All form fields render correctly
  - [ ] asset_subclass only shows when asset_class=rwa
  - [ ] URIs dynamic list add/remove works (min 1)
  - [ ] Form data stored in state

  **QA Scenarios**:
  ```
  Scenario: Form mode renders all fields
    Tool: Playwright
    Steps:
      1. Navigate to MPT creation page
      2. Click "Edit Metadata" button
      3. Verify modal opens with all form fields
      4. Fill ticker="TEST", name="Test Token"
      5. Verify fields show entered values
    Expected Result: All fields visible and editable
    Evidence: .sisyphus/evidence/task-4-form-render.png

  Scenario: RWA subclass conditional display
    Tool: Playwright
    Steps:
      1. Open metadata modal
      2. Select asset_class="memes"
      3. Verify asset_subclass NOT visible
      4. Select asset_class="rwa"
      5. Verify asset_subclass dropdown appears
    Expected Result: Subclass only shows for RWA
    Evidence: .sisyphus/evidence/task-4-rwa-conditional.png

  Scenario: URIs dynamic list
    Tool: Playwright
    Steps:
      1. Open metadata modal
      2. Verify 1 URI entry exists by default
      3. Click "Add URI" button
      4. Verify 2 URI entries exist
      5. Click delete on first entry
      6. Verify 1 URI entry remains
      7. Click delete again
      8. Verify 1 URI entry still exists (minimum)
    Expected Result: Add/remove works, minimum 1 enforced
    Evidence: .sisyphus/evidence/task-4-uris-dynamic.png
  ```

  **Commit**: NO (group with Tasks 5-6)

- [ ] 5. **Create MPTMetadataModal - JSON Mode**

  **What to do**:
  - Add JSON mode toggle to MPTMetadataModal
  - Implement JSON editor textarea showing stringified metadata
  - Implement bidirectional sync:
    - Form → JSON: Convert formData to JSON with long keys
    - JSON → Form: Parse JSON, convert short keys to long keys, update formData
  - Add JSON validation on parse
  - Show error toast if JSON is malformed
  - Preserve mode selection in state

  **Must NOT do**:
  - Do NOT add templates (Task 6)
  - Do NOT validate size (Task 6)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex state management and JSON handling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Task 4)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 1, 3, 4

  **References**:
  - `src/lib/xrpl/metadata-utils.ts` - longToShortKeys, shortToLongKeys
  - Task 4 implementation - Form state structure

  **Acceptance Criteria**:
  - [ ] Toggle button switches between Form/JSON mode
  - [ ] Form data syncs to JSON textarea when toggling to JSON
  - [ ] JSON changes sync back to form when toggling to Form
  - [ ] Malformed JSON shows error, doesn't crash
  - [ ] JSON uses long keys (ticker, name) not short (t, n)

  **QA Scenarios**:
  ```
  Scenario: Form to JSON sync
    Tool: Playwright
    Steps:
      1. Open modal, fill ticker="TEST", name="Test Token"
      2. Switch to JSON mode
      3. Verify JSON textarea shows {"ticker":"TEST","name":"Test Token"...}
    Expected Result: JSON reflects form data with long keys
    Evidence: .sisyphus/evidence/task-5-form-to-json.png

  Scenario: JSON to Form sync
    Tool: Playwright
    Steps:
      1. Open modal, switch to JSON mode
      2. Edit JSON: {"ticker":"MOD","name":"Modified"}
      3. Switch to Form mode
      4. Verify ticker field shows "MOD", name shows "Modified"
    Expected Result: Form reflects JSON changes
    Evidence: .sisyphus/evidence/task-5-json-to-form.png

  Scenario: Malformed JSON handling
    Tool: Playwright
    Steps:
      1. Open modal, switch to JSON mode
      2. Enter invalid JSON: {"ticker":"TEST
t
      3. Try to switch to Form mode
      4. Verify error toast appears
      5. Verify form data unchanged
    Expected Result: Error shown, no crash, data preserved
    Evidence: .sisyphus/evidence/task-5-invalid-json.png
  ```

  **Commit**: NO (group with Tasks 4, 6)

- [ ] 6. **Create MPTMetadataModal - Templates & Validation**

  **What to do**:
  - Add template selection dropdown at top of modal
  - Implement template application:
    - Show confirmation dialog if form has data
    - Populate all fields from template
  - Add size validation:
    - Calculate encoded size using `encodeMetadata()`
    - Show warning if size > 1024 bytes
    - Block Apply button if size > 1024
  - Add field validation:
    - ticker: uppercase A-Z, digits 0-9, max 6 chars (warning only)
    - Required fields: ticker, name, icon, asset_class, issuer_name
  - Implement Apply/Cancel buttons:
    - Apply: Output JSON string via onMetadataChange callback
    - Cancel: Close without changes
  - Parse existing metadata on open using `decodeMetadata()`

  **Must NOT do**:
  - Do NOT modify parent form submission logic
  - Do NOT hex encode the output (parent handles that)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex validation and template logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Tasks 4, 5)
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 2, 3, 4, 5

  **References**:
  - `src/lib/xrpl/metadata-templates.ts` - Template data
  - `src/lib/xrpl/metadata-utils.ts` - encodeMetadata, validateMetadataSize
  - `src/components/ui/dialog.tsx` - Dialog for confirmation

  **Acceptance Criteria**:
  - [ ] Template dropdown shows all 6 templates
  - [ ] Template application fills all fields
  - [ ] Confirmation shown before overwriting existing data
  - [ ] Size warning shows when encoded > 1024 bytes
  - [ ] Apply button disabled when size > 1024
  - [ ] Required field validation shows errors
  - [ ] Apply outputs valid JSON string
  - [ ] Existing metadata parsed and shown on modal open

  **QA Scenarios**:
  ```
  Scenario: Template selection
    Tool: Playwright
    Steps:
      1. Open modal (empty form)
      2. Select "Stablecoin" template
      3. Verify fields populated: asset_class=rwa, asset_subclass=stablecoin
    Expected Result: Template data fills form
    Evidence: .sisyphus/evidence/task-6-template-select.png

  Scenario: Template overwrite confirmation
    Tool: Playwright
    Steps:
      1. Open modal, fill ticker="EXISTING"
      2. Select "Stablecoin" template
      3. Verify confirmation dialog appears
      4. Click "Yes, Replace"
      5. Verify form shows template data (ticker overwritten)
    Expected Result: Confirmation shown, data replaced on confirm
    Evidence: .sisyphus/evidence/task-6-template-confirm.png

  Scenario: Size warning
    Tool: Playwright
    Steps:
      1. Open modal, fill additional_info with very long text (2000+ chars)
      2. Verify warning banner appears
      3. Verify Apply button is disabled
    Expected Result: Warning shown, Apply blocked
    Evidence: .sisyphus/evidence/task-6-size-warning.png

  Scenario: Apply outputs JSON
    Tool: Playwright
    Steps:
      1. Open modal, fill required fields
      2. Click Apply
      3. Verify modal closes
      4. Verify parent form's metadata field contains valid JSON
    Expected Result: JSON string output to parent
    Evidence: .sisyphus/evidence/task-6-apply-output.png
  ```

  **Commit**: YES (with Tasks 4-5)
  - Message: `feat(mpt): add metadata editor modal component`
  - Files: `src/components/transaction/MPTMetadataModal.tsx`

---

- [x] 7. **Integrate Modal with MPT Form**

  **What to do**:
  - Update `MPTokenIssuanceCreateForm.tsx`:
    - Add "Edit" button next to metadata Input field
    - Add modal state (open/onOpenChange)
    - Add onMetadataChange callback to receive JSON from modal
    - Update metadata field value when modal applies changes
    - Pass existing metadata to modal when opening
  - Keep existing metadata Input as fallback (user can still type raw JSON)
  - Ensure reactive preview updates when metadata changes

  **Must NOT do**:
  - Do NOT remove existing metadata Input field
  - Do NOT modify transaction submission logic
  - Do NOT change the hex encoding behavior

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple integration work
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after Task 6)
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 3, 6

  **References**:
  - `src/components/transaction/MPTokenIssuanceCreateForm.tsx` - Existing form
  - `src/components/transaction/MPTMetadataModal.tsx` - New modal component

  **Acceptance Criteria**:
  - [ ] "Edit" button appears next to metadata field
  - [ ] Clicking button opens modal
  - [ ] Modal receives existing metadata (if any)
  - [ ] Applying modal updates metadata field
  - [ ] Reactive preview updates with new metadata
  - [ ] Manual JSON editing still works

  **QA Scenarios**:
  ```
  Scenario: Button opens modal
    Tool: Playwright
    Steps:
      1. Navigate to MPT creation page
      2. Expand Advanced Options
      3. Find metadata field
      4. Click "Edit" button next to it
      5. Verify modal opens
    Expected Result: Modal opens on button click
    Evidence: .sisyphus/evidence/task-7-button-opens-modal.png

  Scenario: Modal updates form field
    Tool: Playwright
    Steps:
      1. Open modal, fill required fields
      2. Click Apply
      3. Verify modal closes
      4. Verify metadata Input shows JSON string
    Expected Result: Form field updated with JSON
    Evidence: .sisyphus/evidence/task-7-modal-updates-form.png

  Scenario: Existing metadata loaded
    Tool: Playwright
    Steps:
      1. Type JSON in metadata field: {"t":"TEST","n":"Test"}
      2. Click Edit button
      3. Verify modal shows ticker="TEST", name="Test"
    Expected Result: Existing metadata parsed and shown
    Evidence: .sisyphus/evidence/task-7-existing-metadata.png
  ```

  **Commit**: YES
  - Message: `feat(mpt): integrate metadata modal with MPT form`
  - Files: `src/components/transaction/MPTokenIssuanceCreateForm.tsx`

- [x] 8. **Add i18n Translations**

  **What to do**:
  - Add translations to `src/i18n/locales/zh.json`:
    - `metadataEditor.title` - "元数据编辑器"
    - `metadataEditor.description` - "配置 MPT 元数据"
    - `metadataEditor.formMode` - "表单模式"
    - `metadataEditor.jsonMode` - "JSON 模式"
    - `metadataEditor.selectTemplate` - "选择模板"
    - `metadataEditor.ticker` - "代币符号"
    - `metadataEditor.tickerHint` - "大写字母和数字，最多6位"
    - `metadataEditor.name` - "代币名称"
    - `metadataEditor.description` - "描述"
    - `metadataEditor.icon` - "图标 URL"
    - `metadataEditor.assetClass` - "资产类别"
    - `metadataEditor.assetSubclass` - "资产子类别"
    - `metadataEditor.issuerName` - "发行方名称"
    - `metadataEditor.uris` - "相关链接"
    - `metadataEditor.addUri` - "添加链接"
    - `metadataEditor.uri` - "链接"
    - `metadataEditor.uriCategory` - "类型"
    - `metadataEditor.uriTitle` - "标题"
    - `metadataEditor.additionalInfo` - "扩展信息 (JSON)"
    - `metadataEditor.apply` - "应用"
    - `metadataEditor.cancel` - "取消"
    - `metadataEditor.sizeWarning` - "元数据超过 1024 字节限制"
    - `metadataEditor.templateConfirm` - "确定要覆盖现有数据吗？"
    - `metadataEditor.invalidJson` - "JSON 格式无效"
    - `metadataEditor.editMetadata` - "编辑元数据"
  - Add same keys to `src/i18n/locales/en.json` with English text
  - Use translations in MPTMetadataModal and MPTokenIssuanceCreateForm

  **Must NOT do**:
  - Do NOT add translations outside metadataEditor namespace
  - Do NOT modify existing translation keys

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Data entry work
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after Task 7)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 7

  **References**:
  - `src/i18n/locales/zh.json` - Existing Chinese translations
  - `src/i18n/locales/en.json` - Existing English translations
  - `src/components/transaction/MPTMetadataModal.tsx` - Keys to translate

  **Acceptance Criteria**:
  - [ ] All keys added to zh.json
  - [ ] All keys added to en.json
  - [ ] Modal uses `t('metadataEditor.xxx')` pattern
  - [ ] Language switch works in modal

  **QA Scenarios**:
  ```
  Scenario: Chinese translations
    Tool: Playwright
    Steps:
      1. Set language to Chinese
      2. Open metadata modal
      3. Verify all labels in Chinese
    Expected Result: All text shows Chinese
    Evidence: .sisyphus/evidence/task-8-chinese-i18n.png

  Scenario: English translations
    Tool: Playwright
    Steps:
      1. Set language to English
      2. Open metadata modal
      3. Verify all labels in English
    Expected Result: All text shows English
    Evidence: .sisyphus/evidence/task-8-english-i18n.png
  ```

  **Commit**: YES
  - Message: `feat(i18n): add metadata editor translations`
  - Files: `src/i18n/locales/zh.json`, `src/i18n/locales/en.json`

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, unused imports.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task. Test cross-task integration. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **Task 1-3**: `feat(ui): add textarea component and metadata utilities`
- **Task 4-6**: `feat(mpt): add metadata editor modal component`
- **Task 7**: `feat(mpt): integrate metadata modal with MPT form`
- **Task 8**: `feat(i18n): add metadata editor translations`

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: Build successful, no errors
npm run lint   # Expected: No lint errors
```

### Final Checklist
- [x] All "Must Have" present (6 items)
- [x] All "Must NOT Have" absent (4 items)
- [x] Modal opens and closes correctly
- [x] Form mode edits all fields
- [x] JSON mode syncs with form
- [x] Templates populate fields
- [x] RWA subclass validation works
- [x] URI list add/remove works
- [x] Size warning displays correctly
- [x] i18n works in zh and en