# Ripplet UI/UX Design System

**Design Philosophy**: Developer-first XRPL toolkit with modern Web3 aesthetics

---

## 🎯 Design Principles

### 1. Developer-First
- **High information density** - Show more data, less fluff
- **Keyboard shortcuts** - Power user efficiency
- **Terminal-inspired** - Dark theme, monospace for addresses
- **Error clarity** - Clear error states with copyable error codes

### 2. Web3 Native
- **Chain awareness** - Visual indicators for network states
- **Transaction transparency** - Every transaction is inspectable
- **Address-centric** - Addresses are first-class citizens
- **Gas awareness** - Fee estimation always visible

### 3. XRPL Identity
- **Water ripple effects** - Subtle wave animations
- **Droplet motifs** - Icons and loading states
- **Green accent** - XRPL brand color (#23A15B)
- **Ledger rhythm** - Block height as visual heartbeat

---

## 🎨 Color System

### Primary Palette

```
/* XRPL Brand Inspired */
--xrpl-green: #23A15B
--xrpl-green-light: #34D399
--xrpl-green-dark: #059669

/* Base Dark Theme */
--bg-primary: #0D0D12
--bg-secondary: #15151F
--bg-tertiary: #1E1E2A
--bg-elevated: #252532

/* Surfaces */
--surface-card: rgba(30, 30, 42, 0.8)
--surface-overlay: rgba(13, 13, 18, 0.95)
--surface-glass: rgba(30, 30, 42, 0.6)

/* Text */
--text-primary: #F8FAFC
--text-secondary: #94A3B8
--text-tertiary: #64748B
--text-muted: #475569

/* Semantic */
--success: #22C55E
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6

/* Accent Gradients */
--gradient-primary: linear-gradient(135deg, #23A15B 0%, #34D399 100%)
--gradient-glow: linear-gradient(180deg, rgba(35, 161, 91, 0.15) 0%, transparent 100%)
```

### Network Colors

```
--mainnet: #22C55E    /* Green */
--testnet: #F59E0B    /* Amber */
--devnet: #8B5CF6     /* Purple */
```

---

## 🔤 Typography

### Font Stack

```css
/* Primary - UI */
--font-sans: 'Inter', -apple-system, sans-serif;

/* Monospace - Addresses/Hashes */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Display - Headlines */
--font-display: 'Space Grotesk', var(--font-sans);
```

### Type Scale

| Name | Size | Weight | Use |
|------|------|--------|-----|
| Display | 32px | 700 | Page titles |
| H1 | 24px | 600 | Section headers |
| H2 | 20px | 600 | Card titles |
| H3 | 16px | 600 | Subsections |
| Body | 14px | 400 | Default text |
| Small | 13px | 400 | Labels, hints |
| Mono | 13px | 400 | Addresses, hashes |
| Micro | 12px | 500 | Tags, badges |

---

## 📐 Layout System

### Grid

```
/* 12-column grid */
--grid-columns: 12;
--grid-gutter: 24px;
--grid-margin: 32px;

/* Sidebar */
--sidebar-width: 260px;
--sidebar-collapsed: 64px;

/* Header */
--header-height: 64px;
```

### Spacing Scale

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

---

## 🧩 Component Design

### 1. Header

**Design Features:**
- Glassmorphism effect with backdrop blur
- Network status pill with pulse animation
- Wallet address truncation with copy button
- Transaction count badge

```
┌─────────────────────────────────────────────────────────────────┐
│ ◉ Ripplet              [Mainnet ▾]  [EN ▾]  │ 0x7a3d...f29c │
│                                            │ 📋 Copy  💰 12  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Sidebar

**Design Features:**
- Icon + label navigation
- Active state with XRPL green glow
- Collapsible for more screen space
- Transaction type categorization

```
┌─────────────────┐
│ ◉ Dashboard     │ ← Active (green glow)
│                 │
│ TRANSACTIONS    │ ← Section label
│ → Payment       │
│ → TrustSet      │
│ → AccountSet    │
│                 │
│ ADVANCED        │
│ → NFT           │
│ → MPT           │
│ → AMM           │
│                 │
└─────────────────┘
```

### 3. Transaction Form Card

**Design Features:**
- Glass card with subtle border
- Field grouping with dividers
- Real-time validation feedback
- Gas estimate always visible
- Build/Sign/Submit workflow

```
┌─────────────────────────────────────────────────────────┐
│ 💸 Payment Transaction                         [Testnet]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Destination Address *                                   │
│ ┌─────────────────────────────────────────────────┐    │
│ │ rN7n7otQDd6FczFgLdlqtyMVrn3EgXoQT           ✕ │    │
│ └─────────────────────────────────────────────────┘    │
│ ✓ Valid XRPL address                                    │
│                                                         │
│ Amount *                                    [XRP ▾]    │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 100.00                                          │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ Advanced Options                                    [▼] │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ 💧 Fee: ~0.00001 XRP  │  ⚡ Build Transaction        │
└─────────────────────────────────────────────────────────┘
```

### 4. Transaction Result

**Design Features:**
- Success: Green glow + ripple animation
- Error: Red accent + error code copyable
- Hash with explorer link
- Transaction details collapsible

```
SUCCESS STATE:
┌─────────────────────────────────────────────────────────┐
│                   ✓                                    │
│            Transaction Successful                      │
│                                                         │
│    Hash: 4A3F...8B2C  [📋] [🔍 Explorer]              │
│                                                         │
│    ┌─ Transaction Details ──────────────────────┐     │
│    │ Type: Payment                               │     │
│    │ From: rN7n...oQT                            │     │
│    │ To: rDest...xYZ                             │     │
│    │ Amount: 100 XRP                             │     │
│    │ Fee: 0.00001 XRP                            │     │
│    │ Ledger: 89,234,567                          │     │
│    └─────────────────────────────────────────────┘     │
│                                                         │
│              [ New Transaction ]                        │
└─────────────────────────────────────────────────────────┘
```

### 5. Wallet Connect Modal

**Design Features:**
- QR code for Xaman
- Extension status indicators
- Installed/Not installed states

```
┌─────────────────────────────────────────────────────────┐
│              Connect Your Wallet                        │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   ⬡        │  │    💎       │  │    📱       │    │
│  │  Crossmark  │  │  Gemwallet  │  │    Xaman    │    │
│  │   ✓ Ready   │  │   ✓ Ready   │  │  QR Code   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│  Last connected: Crossmark                              │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Visual Effects

### 1. Background Pattern

```css
/* Subtle grid pattern */
.bg-grid {
  background-image: 
    linear-gradient(rgba(35, 161, 91, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(35, 161, 91, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

### 2. Glow Effects

```css
/* XRPL green glow */
.glow-green {
  box-shadow: 
    0 0 20px rgba(35, 161, 91, 0.3),
    0 0 40px rgba(35, 161, 91, 0.1);
}

/* Card hover glow */
.card-hover:hover {
  box-shadow: 
    0 0 0 1px rgba(35, 161, 91, 0.2),
    0 4px 24px rgba(0, 0, 0, 0.3);
}
```

### 3. Ripple Animation

```css
/* Loading ripple */
@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.ripple-loader::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--xrpl-green);
  animation: ripple 1.5s ease-out infinite;
}
```

---

## 📱 Responsive Breakpoints

```
--breakpoint-sm: 640px   /* Mobile landscape */
--breakpoint-md: 768px   /* Tablet */
--breakpoint-lg: 1024px  /* Desktop */
--breakpoint-xl: 1280px  /* Large desktop */
--breakpoint-2xl: 1536px /* Ultra-wide */
```

---

## 🎭 Animation System

### Transitions

```css
--transition-fast: 150ms ease
--transition-normal: 200ms ease
--transition-slow: 300ms ease
--transition-bounce: 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Micro-interactions

1. **Button press**: Scale down to 0.98
2. **Card hover**: Subtle lift + glow
3. **Input focus**: Border glow pulse
4. **Success state**: Ripple expand from center
5. **Error shake**: Horizontal shake on error

---

## 📋 Design Tokens (CSS Variables)

```css
:root {
  /* Brand */
  --xrpl-green: #23A15B;
  
  /* Backgrounds */
  --bg-primary: #0D0D12;
  --bg-secondary: #15151F;
  --bg-tertiary: #1E1E2A;
  
  /* Text */
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-tertiary: #64748B;
  
  /* Borders */
  --border-default: rgba(148, 163, 184, 0.1);
  --border-focus: rgba(35, 161, 91, 0.5);
  
  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(35, 161, 91, 0.2);
}
```

---

## 🖼️ Page Layout Wireframes

### Dashboard / Home

```
┌────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
├──────────┬─────────────────────────────────────────────────────────┤
│          │                                                          │
│ SIDEBAR  │  ┌─────────────────────────────────────────────────┐   │
│          │  │  Welcome, Developer                              │   │
│ ◉ Home   │  │  rN7n7otQDd6FczFgLdlqtyMVrn3EgXoQT    [📋]   │   │
│          │  │  Network: Mainnet  │  Balance: 1,234 XRP       │   │
│ TRANSACT │  └─────────────────────────────────────────────────┘   │
│ → Payment│                                                         │
│ → Trust  │  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ → Account│  │ Payment  │ │ TrustSet │ │ Account  │               │
│          │  │ 1,234    │ │    5     │ │    3     │               │
│ ADVANCED │  │ transactions│ lines  │ │  flags   │               │
│ → NFT    │  └──────────┘ └──────────┘ └──────────┘               │
│ → MPT    │                                                         │
│          │  ┌─────────────────────────────────────────────────┐   │
│          │  │ Recent Transactions                        [All →]│   │
│          │  ├─────────────────────────────────────────────────┤   │
│          │  │ Payment  │ 100 XRP │ rDest... │ 2 min ago  ✓    │   │
│          │  │ TrustSet │ USD     │ rIssuer..│ 1 hr ago   ✓    │   │
│          │  └─────────────────────────────────────────────────┘   │
└──────────┴─────────────────────────────────────────────────────────┘
```

### Transaction Page

```
┌────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
├──────────┬─────────────────────────────────────────────────────────┤
│          │                                                          │
│ SIDEBAR  │  Payment Transaction                                    │
│          │  ─────────────────────────────────────────────────       │
│ ◉ Home   │                                                          │
│          │  ┌─────────────────────────────────────────────────┐   │
│ TRANSACT │  │                                                 │   │
│ ● Payment│  │  Destination Address *                          │   │
│ → Trust  │  │  ┌───────────────────────────────────────────┐  │   │
│ → Account│  │  │ r...                                      │  │   │
│          │  │  └───────────────────────────────────────────┘  │   │
│ ADVANCED │  │                                                 │   │
│ → NFT    │  │  Amount *                            [XRP ▾]   │   │
│ → MPT    │  │  ┌───────────────────────────────────────────┐  │   │
│          │  │  │                                           │  │   │
│          │  │  └───────────────────────────────────────────┘  │   │
│          │  │                                                 │   │
│          │  │  Destination Tag (optional)                     │   │
│          │  │  ┌───────────────────────────────────────────┐  │   │
│          │  │  │                                           │  │   │
│          │  │  └───────────────────────────────────────────┘  │   │
│          │  │                                                 │   │
│          │  │  ─────────────────────────────────────────────  │   │
│          │  │  💧 Network Fee: ~0.00001 XRP                   │   │
│          │  │                                                 │   │
│          │  │  ┌───────────────────────────────────────────┐  │   │
│          │  │  │         ⚡ Build & Sign Transaction        │  │   │
│          │  │  └───────────────────────────────────────────┘  │   │
│          │  │                                                 │   │
│          │  └─────────────────────────────────────────────────┘   │
│          │                                                          │
└──────────┴─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Priority

### Phase 1: Core Styling
1. Update color tokens in `index.css`
2. Add XRPL brand variables
3. Update header component
4. Update sidebar component

### Phase 2: Components
5. Design transaction form card
6. Design result display
7. Design wallet modal

### Phase 3: Polish
8. Add animations
9. Add micro-interactions
10. Add dark/light mode toggle

---

## 📚 Reference Inspirations

| App | What to Learn |
|-----|---------------|
| **Etherscan** | Data density, address display |
| **Uniswap** | Modern Web3 aesthetics |
| **Rainbow** | Playful but professional |
| **XRPL Explorer** | XRPL brand consistency |
| **Viem** | Developer-focused simplicity |

---

*Design System created for Ripplet - XRPL Developer Toolkit*
