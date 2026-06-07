# POCKET PARAMOUR — DESIGN SYSTEM SPEC

*Foundation document A3. Translates the brand into concrete design tokens.*
*Every value here becomes a real CSS variable in A4.*

---

## What this document is

A3 is the **technical spec** for Pocket Paramour's visual system. Every typography size, color hex, spacing increment, easing curve, and component pattern is named, valued, and justified here. Once A4 implements these as CSS tokens, every screen we build pulls from this spec — no more one-off magic numbers, no more per-screen drift, no more inconsistency.

**A3 is opinionated.** Specific fonts, specific hex codes, specific timings. If something here doesn't fit on review, we change it in A3 and A4 follows — never the other way around. The spec is the source of truth.

---

## SECTION 1 — Typography

### 1.1 Font stack (loaded, not system-fallback)

We load three real typefaces. No system defaults except as last-resort fallback. All are free via Google Fonts (zero licensing cost).

| Role | Font | Why |
|---|---|---|
| **Display** | **Cinzel** | Classical Roman caps. Used sparingly — chapter title cards, hero "PROLOGUE", section breaks. Reads regal, mythic, manuscript-inscription. |
| **Headline & Body** | **Cormorant Garamond** | Elegant transitional serif with strong italic. Designed for book interiors. Used for chapter dialogue, narration, headlines, modal text. The workhorse. |
| **UI label** | **Inter** | Modern variable sans-serif. Used ONLY for utility text — button labels, settings rows, timestamps, tooltips. Never for in-world content. |

**CSS fallback chain (font-family declarations):**

```css
--font-display: 'Cinzel', 'Trajan Pro', 'Times New Roman', serif;
--font-serif:   'Cormorant Garamond', 'EB Garamond', 'Garamond', 'Georgia', serif;
--font-sans:    'Inter', 'Helvetica Neue', 'Arial', sans-serif;
```

**Loading strategy.** Use `<link rel="preload" as="font">` on critical weights, `font-display: swap` so text renders immediately. Load only the weights we use (not full families).

**Weights we load:**
- Cinzel: 400, 600
- Cormorant Garamond: 300, 400, 400-italic, 500, 600
- Inter: 400, 500, 600

### 1.2 Type scale (modular)

Standard major-third scale (1.25 ratio), anchored at 16px body. Values:

| Token | Size | Use |
|---|---|---|
| `--text-xs` | 12px | utility labels, version, timestamps |
| `--text-sm` | 14px | UI button labels, settings rows |
| `--text-base` | 16px | UI body, chapter card subtitles |
| `--text-md` | 18px | in-world body dialogue (slightly larger than UI body for reading comfort) |
| `--text-lg` | 22px | section headlines, chapter card titles |
| `--text-xl` | 28px | modal headlines |
| `--text-2xl` | 36px | screen titles |
| `--text-3xl` | 48px | chapter title (in card) |
| `--text-4xl` | 64px | hero title card "PROLOGUE" |

### 1.3 Line-height & letter-spacing

| Token | Value | Use |
|---|---|---|
| `--lh-tight` | 1.15 | Display caps (Cinzel) — wide letter-spacing makes tight line-height read |
| `--lh-snug` | 1.35 | Headlines |
| `--lh-base` | 1.55 | Body reading (the comfortable default) |
| `--lh-loose` | 1.75 | Long-form chapter narration (reads as breath) |

| Token | Value | Use |
|---|---|---|
| `--ls-tight` | -0.01em | Body serif (defaults for Cormorant) |
| `--ls-base` | 0 | Default |
| `--ls-wide` | 0.08em | UI section labels, character role text |
| `--ls-wider` | 0.18em | Display caps — "PROLOGUE", "MAIN STORY" |
| `--ls-widest` | 0.32em | Hero title card display caps |

### 1.4 Type combinations (curated pairings)

These are the locked combinations. Designers don't mix-and-match outside these.

| Pattern name | Display + Body | Use |
|---|---|---|
| **Manuscript Hero** | Cinzel 4xl widest + Cormorant italic xl | Title cards, prologue openings |
| **Chapter Card** | Cinzel 3xl wider + Cormorant 500 md | Chapter list rows |
| **In-World Body** | Cormorant 400 md base | All chapter dialogue and narration |
| **Modal Headline** | Cormorant 600 xl snug + Cormorant 400 md base | Modals, settings panels |
| **UI Row** | Inter 500 sm + Inter 400 sm | Settings, toggles, utility |
| **Section Label** | Cinzel 600 sm wider | "MAIN STORY", "GALLERY", "SETTINGS" headers |

---

## SECTION 2 — Color tokens

### 2.1 Mode A — Candlelit (light mode)

Used for: care interactions, intimate dialogue, hopeful moments, dawn scenes, the heroine's interior beats.

| Token | Hex | Role |
|---|---|---|
| `--c-bg-page` | `#F5EDD8` | Page background — warm parchment cream |
| `--c-bg-surface` | `#FDF7E9` | Card / panel surface — ivory |
| `--c-bg-elevated` | `#FFFCF2` | Elevated modal — palest cream |
| `--c-bg-recessed` | `#EAE0C7` | Sunken / inactive surface |
| `--c-ink-body` | `#3B2A1F` | Body text — warm ink-brown |
| `--c-ink-emphasis` | `#1F140B` | Emphasis text — near-black coffee |
| `--c-ink-mute` | `#8C7A66` | Muted / secondary text — warm grey |
| `--c-accent-gold` | `#B8923E` | Antique gold — primary brand accent |
| `--c-accent-gold-soft` | `#D4B26E` | Lightened gold — for backgrounds, highlights |
| `--c-accent-dawn` | `#E8B7B5` | Dawn-pink — romance moments |
| `--c-accent-seventh` | `#9CC4E8` | Seventh-light cyan (the brand glow) |
| `--c-accent-seventh-shift` | `#B4A8E5` | Seventh-light shifted toward lavender |
| `--c-line-fine` | `rgba(184,146,62,0.35)` | Gold filigree thin rule |
| `--c-line-rule` | `rgba(59,42,31,0.18)` | Body divider rule |

### 2.2 Mode B — Velvet Hour (dark mode)

Used for: Aenor scenes, wound-creatures, Noir's chamber, chase sequences, nighttime escape, threat reveals.

| Token | Hex | Role |
|---|---|---|
| `--c-bg-page` | `#15081A` | Page background — deep aubergine-black |
| `--c-bg-surface` | `#1F0D26` | Card / panel surface — black velvet |
| `--c-bg-elevated` | `#2B1133` | Elevated modal — wine-dark |
| `--c-bg-recessed` | `#0B040E` | Sunken / inactive — near-black void |
| `--c-ink-body` | `#F4ECDC` | Body text — ivory |
| `--c-ink-emphasis` | `#FFFFFF` | Emphasis — bone-white |
| `--c-ink-mute` | `#9B8FA8` | Muted — dusty violet |
| `--c-accent-gold` | `#D4A85B` | Gilded gold — primary brand accent |
| `--c-accent-gold-deep` | `#8C6E2C` | Darker gold for backgrounds |
| `--c-accent-blood` | `#7A1224` | Blood-wine for danger |
| `--c-accent-silver` | `#C6BFB1` | Sharp silver / blade-shine |
| `--c-accent-seventh` | `#7BB4DC` | Seventh-light cyan (brand glow) |
| `--c-accent-seventh-shift` | `#9C8FD4` | Seventh-light shifted toward lavender |
| `--c-line-fine` | `rgba(212,168,91,0.4)` | Gilded thin rule |
| `--c-line-rule` | `rgba(244,236,220,0.12)` | Body divider rule |

### 2.3 Per-character color signatures

Each character has a triplet: `primary` / `highlight` / `depth`. These tint the UI when the player is on that character's screen (subtle ambient color shift).

| Character | Primary | Highlight | Depth |
|---|---|---|---|
| **Alistair** | `#C4933F` (captain-gold) | `#FFEED0` (dawn-cream) | `#6B4F1F` (deep-gilt) |
| **Elian** | `#2F4A36` (forest-deep) | `#E6E0CB` (antler-cream) | `#101B14` (woodsmoke) |
| **Lyra** | `#84A6B8` (sea-silver) | `#F2EFEA` (pearl) | `#1F3946` (ocean-deep) |
| **Caspian** | `#2A4978` (royal-sapphire) | `#E2DED1` (palace-marble) | `#101C32` (deep-night-blue) |
| **Lucien** | `#3D335E` (blue-violet) | `#E8C97E` (starlight-gold) | `#160F2A` (tower-deep) |
| **Noir** | `#0E0710` (black-velvet) | `#F1E9D8` (bone-white) | `#1A1421` (sealed-silver-back) |
| **Proto** | `#3FB8B1` (static-cyan) | `#D8D2DE` (mirror-silver) | `#3F3656` (five-faces-violet) |
| **Heroine** | `#9CC4E8` (seventh-light) | `#FFE9DE` (candle-warm) | `#7C5F8F` (deep-bond) |
| **Aenor** | `#5C0E1F` (wine-blood) | `#D4A85B` (dying-gold) | `#1A0610` (royal-aubergine-deep) |

### 2.4 Semantic colors (mode-independent)

| Token | Light hex | Dark hex | Role |
|---|---|---|---|
| `--c-success` | `#5A8C5F` | `#7AAC7F` | confirmations, positive states |
| `--c-warning` | `#C68A3A` | `#E0A856` | warnings, attention needed |
| `--c-danger` | `#9C2E3B` | `#C44A57` | destructive actions, errors |
| `--c-info` | `#5B7F9E` | `#7BA0BE` | informational toasts |

---

## SECTION 3 — Spacing system

A consistent 4px-base scale. Used for padding, margin, gap. Named tokens prevent magic numbers.

| Token | Value | Common use |
|---|---|---|
| `--s-0` | `0` | reset |
| `--s-1` | `4px` | tightest spacing, icon gap |
| `--s-2` | `8px` | tight (button padding-y) |
| `--s-3` | `12px` | small (input padding) |
| `--s-4` | `16px` | base unit, default gap |
| `--s-5` | `24px` | comfortable section gap |
| `--s-6` | `32px` | section breathing |
| `--s-7` | `48px` | major section separation |
| `--s-8` | `64px` | screen-level breathing |
| `--s-9` | `96px` | hero spacing |
| `--s-10` | `128px` | maximum vertical break |

**Rule:** all padding/margin/gap values in CSS use these tokens. No raw `padding: 13px`. If a value isn't in the scale, the scale needs a new token, not the CSS a magic number.

---

## SECTION 4 — Border radii

Subtle rounded corners. Manuscript-soft, not chip-rounded.

| Token | Value | Use |
|---|---|---|
| `--r-none` | `0` | sharp manuscript edges (chapter cards default) |
| `--r-sm` | `4px` | tight rounding (inputs) |
| `--r-md` | `8px` | standard (modals, panels) |
| `--r-lg` | `14px` | larger surfaces (story cards) |
| `--r-pill` | `9999px` | pill buttons (used sparingly) |

**Default rule:** prefer `--r-none` or `--r-md`. Avoid `--r-pill` except for tag-style chips. We are not Material Design.

---

## SECTION 5 — Surface treatments

How surfaces feel — not just color, but texture and elevation.

### 5.1 Parchment surface (Candlelit mode default)

```css
background: var(--c-bg-surface);
background-image:
  /* subtle paper grain */
  url('data:image/svg+xml;...noise overlay 4% opacity...'),
  /* warm gradient sheen */
  linear-gradient(165deg, rgba(255,247,229,0) 0%, rgba(255,247,229,0.6) 100%);
border: 1px solid var(--c-line-fine);
border-radius: var(--r-md);
box-shadow:
  0 1px 0 rgba(0,0,0,0.04),
  0 12px 32px -16px rgba(59,42,31,0.18);
```

### 5.2 Velvet surface (Velvet Hour mode default)

```css
background: var(--c-bg-surface);
background-image:
  /* subtle weave texture */
  url('data:image/svg+xml;...weave noise 6% opacity...'),
  /* deep gradient */
  linear-gradient(165deg, rgba(43,17,51,0.4) 0%, rgba(15,8,26,0.8) 100%);
border: 1px solid var(--c-line-fine);
border-radius: var(--r-md);
box-shadow:
  inset 0 1px 0 rgba(212,168,91,0.08),
  0 16px 40px -16px rgba(0,0,0,0.6);
```

### 5.3 Glassmorphism (used sparingly — modals and floating overlays only)

```css
background: rgba(31, 13, 38, 0.72);  /* Velvet Hour version */
backdrop-filter: blur(20px) saturate(140%);
border: 1px solid rgba(212, 168, 91, 0.18);
border-radius: var(--r-lg);
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.06),
  0 24px 60px -20px rgba(0,0,0,0.7);
```

**Glassmorphism rule:** ONE surface per screen at most. Overuse reads as Material Design. Used only for hero modals, floating notification banners, or the affection-tier-up reveal moment.

### 5.4 Decorative elements

**Gold filigree corner:** small SVG corner flourish placed on chapter cards. Sits in opposite corners. ~24px square. Color `var(--c-line-fine)`.

**Decorative rule:** thin gradient line for section dividers. Width 96px or 100%. Height 1px.
```css
background: linear-gradient(90deg, transparent, var(--c-accent-gold), transparent);
```

**Drop cap:** first letter of chapter opening paragraph. Cormorant 600, 4× line-height, float-left, 8px right margin.

---

## SECTION 6 — Motion system

### 6.1 Easing curves (named cubic-beziers)

| Token | Curve | Personality |
|---|---|---|
| `--ease-tender` | `cubic-bezier(0.32, 0.04, 0.18, 1)` | Default — graceful settling, soft arrival |
| `--ease-ceremonial` | `cubic-bezier(0.45, 0.05, 0.15, 1)` | Dignified, like a page turning |
| `--ease-threat` | `cubic-bezier(0.7, 0, 0.84, 0)` | Sharp acceleration — snap |
| `--ease-grief` | `cubic-bezier(0, 0, 0.18, 1)` | Slow deceleration — held breath |
| `--ease-bloom` | `cubic-bezier(0.16, 1, 0.3, 1)` | Soft bloom outward, candle catching |

### 6.2 Duration tokens

| Token | ms | Use |
|---|---|---|
| `--dur-instant` | `100` | tap feedback, micro-state shifts |
| `--dur-quick` | `200` | button hover, small reveals |
| `--dur-base` | `400` | standard transition |
| `--dur-slow` | `700` | beat fade-in, sub-modal opening |
| `--dur-dramatic` | `1200` | hero reveals, chapter title card |
| `--dur-ceremonial` | `1800` | the prayer beats, the prologue title card |

### 6.3 Motion profiles (chapter-mood-adaptive)

Each chapter declares a `mood` field. The system applies that profile to all transitions within the chapter.

| Profile | Easing | Default duration | Beat hold | Used for |
|---|---|---|---|---|
| **Tender** | `--ease-tender` | `--dur-slow` (700ms) | 2.5-3s | care interactions, intimate dialogue |
| **Ceremonial** | `--ease-ceremonial` | `--dur-dramatic` (1200ms) | 3-4s | prologues, mythic moments, prayer beats |
| **Threat** | `--ease-threat` | `--dur-quick` (200ms) | 1.5-2s | Aenor scenes, danger reveals |
| **Chase** | `--ease-threat` | `--dur-instant` (100ms) | 1-1.5s | escape sequences, rapid tension |
| **Grief** | `--ease-grief` | `--dur-ceremonial` (1800ms) | 4-5s | graves, losses, confessions |

**Default profile when no mood is declared:** Tender.

### 6.4 Reduced motion support

Respect `prefers-reduced-motion`. When set, all durations cap at `--dur-instant` (100ms) and all easing becomes linear. The system still works; the animation just becomes near-instant. **Never break the experience for accessibility.**

---

## SECTION 7 — Component patterns

### 7.1 Buttons

Three base variants. Each has hover, active, and disabled states.

#### Primary (the "do the important thing" button)

```css
.btn-primary {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  letter-spacing: var(--ls-wider);
  text-transform: uppercase;
  padding: var(--s-3) var(--s-6);
  background: linear-gradient(180deg, var(--c-accent-gold), var(--c-accent-gold-deep));
  color: var(--c-bg-page);
  border: 1px solid var(--c-accent-gold);
  border-radius: var(--r-md);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.18),
    0 4px 12px -4px rgba(184,146,62,0.4);
  transition: all var(--dur-quick) var(--ease-tender);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    0 8px 18px -6px rgba(184,146,62,0.55);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow:
    inset 0 1px 2px rgba(0,0,0,0.15);
}
```

#### Secondary (parchment ghost)

```css
.btn-secondary {
  background: transparent;
  color: var(--c-ink-body);
  border: 1px solid var(--c-line-fine);
  /* ... else identical to primary structure ... */
}
```

#### Ghost (text-only, lowest emphasis)

```css
.btn-ghost {
  background: transparent;
  color: var(--c-ink-mute);
  border: none;
  /* underline on hover, no fill */
}
```

**Tap target rule:** all interactive elements at least 44×44pt actual hit area (use padding or `::before` invisible expansion if visual is smaller).

### 7.2 Cards

#### Chapter card (Main Story menu row)

- Parchment surface (Section 5.1)
- 80px tall, full-width
- Gold filigree corner SVG (top-right + bottom-left)
- Layout: 56px circular character portrait (or chapter glyph) on left, two-line text center (Cinzel section-label + Cormorant snug headline), Cinzel sm button on right
- Hover: subtle gold border glow, no scale
- Locked state: 40% opacity + small lock icon overlay

#### Character card (select screen)

- Larger card, 280-340px wide on mobile portrait
- Full-bleed character portrait
- Bottom 25%: gradient veil with character name in Cinzel + role in Cormorant italic
- Per-character color tint applied (Section 2.3)
- Locked: silhouette + question mark glyph

#### Memory / scene card (gallery, future)

- 1:1.4 portrait ratio
- Full illustration
- Bottom strip with date + scene name
- Gold filigree border 1px

### 7.3 Modals & overlays

- Use glassmorphism surface (Section 5.3)
- Backdrop: full-screen `rgba(15,8,26,0.7)` (dark) or `rgba(59,42,31,0.5)` (light)
- Enter animation: backdrop fades over 400ms, modal scales from 0.96 to 1.0 over 600ms with `--ease-bloom`
- Exit: reverse

### 7.4 Toast / notification

- Top-positioned, 16px from safe-area top
- Slides down on enter with `--ease-bloom`, holds 3s, slides up on exit
- Gold accent left border for info, blood-red for danger
- Inter sm typography, parchment or velvet surface depending on mode

### 7.5 Input fields

- Underline-only style (no full border box)
- Cormorant md italic placeholder
- Gold underline on focus, animated from left
- 56px tall (comfortable mobile tap)

### 7.6 Tap hint (the "tap to continue" pulse)

- Cinzel xs widest letter-spacing
- Color: `var(--c-ink-mute)`
- Pulse animation: opacity 0.4 → 0.9 → 0.4 over 1.8s with `--ease-tender`, infinite

---

## SECTION 8 — Iconography

Custom icon set: line-style, 1.5px stroke, rounded ends, drawn at 24px on a 24px grid.

**Recommended icon library to start with:** Phosphor Icons (Regular weight) — open source, line-style, 1.5px native, matches our register. Override individual icons with custom ones as needed for in-world (loom, seventh-light glyph, the two-branches-under-moon seal).

**Sizes:**
- `--icon-sm` = 16px (inline body)
- `--icon-md` = 20px (UI labels)
- `--icon-lg` = 24px (buttons, prominent)
- `--icon-xl` = 32px (hero icons in modals)

**Color:** inherit text color. Pure white or pure black NEVER — always use `var(--c-ink-*)`.

---

## SECTION 9 — Particle systems

Subtle ambient layers. Each screen can declare which particle profile is active.

### 9.1 Profiles

| Profile | What | When |
|---|---|---|
| **None** | no particles | reading-heavy screens (chapter scenes don't need extra) |
| **Motes** | slow drifting warm motes, 3-6 visible at once | default ambient for most screens |
| **Petals** | occasional rose petal drift | romance moments, affection tier-up |
| **Bond-shimmer** | cyan-lavender soft pulse near important elements | when the heroine is using her gift |
| **Embers** | slow upward warm sparks | Aenor scenes, fire-related beats |
| **Mist** | low-saturation drifting fog | grief beats, the moss scene |

### 9.2 Implementation principles

- **Always behind content** (z-index between bg and content)
- **Always animated with `--ease-tender`** at slow durations (8-20s per particle lifecycle)
- **Always low opacity** (0.3-0.5 max)
- **Respect reduced motion** — if user prefers reduced motion, particles fade in but don't drift
- **GPU-accelerated** — use `transform` and `opacity` only, never `top`/`left`

---

## SECTION 10 — Z-index / layer system

Named z-index tokens. No magic numbers in CSS.

| Token | Value | Use |
|---|---|---|
| `--z-base` | `0` | content default |
| `--z-particles` | `5` | ambient particle layer (above bg, below content) |
| `--z-elevated` | `100` | cards lifted on hover/focus |
| `--z-sticky` | `500` | sticky headers, fixed nav |
| `--z-overlay` | `1000` | dimming backdrop |
| `--z-modal` | `1100` | modal surface |
| `--z-toast` | `2000` | toasts above modals |
| `--z-tooltip` | `3000` | tooltips above all |
| `--z-debug` | `9999` | dev debug panel only |

---

## SECTION 11 — Responsive / mobile constraints

### 11.1 Target breakpoints

Pocket Paramour is mobile-first portrait. Desktop is a courtesy.

| Breakpoint | Width | Use |
|---|---|---|
| `--bp-mobile` | up to 480px | primary target |
| `--bp-tablet` | 481-768px | tablet portrait |
| `--bp-desktop` | 769px+ | desktop courtesy mode (centered max-width container) |

### 11.2 Safe area

Account for notch and gesture bar:

```css
padding-top: env(safe-area-inset-top, 0);
padding-bottom: env(safe-area-inset-bottom, 0);
```

Hero areas (title screen, story scenes) get full-bleed; UI chrome (top bar, action buttons) respects safe area.

### 11.3 Touch target minimum

Every interactive element: **at least 44×44pt** (Apple HIG) or **48×48dp** (Material) — we use 48 to be safe.

### 11.4 Desktop courtesy

When viewport > 768px, content container caps at 480px wide and centers. The game still PLAYS like a phone. Optional ambient background fills the rest (the world-bg image, dimmed).

---

## SECTION 12 — Accessibility

| Requirement | Spec |
|---|---|
| **Color contrast** | WCAG AA — minimum 4.5:1 for body, 3:1 for large text. Check on both modes. |
| **Reduced motion** | All animations cap at 100ms when `prefers-reduced-motion: reduce`. Particles fade in but don't drift. |
| **Focus indicators** | Visible gold underline (light mode) or seventh-light glow (dark mode) on keyboard focus. Never `outline: none`. |
| **Text scaling** | Layout survives 200% browser font-scale. Use rem/em, not px, for body text. |
| **Color-only signaling** | NEVER convey state by color alone. Always add icon, text, or pattern. |

---

## SECTION 13 — How to use this system

### When designing a new screen

1. **Pick a mode** — Candlelit or Velvet Hour (Section 2)
2. **Apply per-character tint** if applicable (Section 2.3)
3. **Use typography pairings from Section 1.4** — don't invent new combos
4. **Use spacing tokens from Section 3** — no magic numbers
5. **Pick the appropriate surface (Section 5)** — parchment, velvet, or glassmorphism
6. **Pick a motion profile (Section 6.3)** if the screen has animations
7. **Pick a particle profile (Section 9.1)** for ambient atmosphere
8. **Test against the BRAND-FOUNDATION.md decision matrix** (Section 9 there)

### When updating

If a token needs to change, change it HERE first. Then update A4 CSS. Never patch CSS without updating the spec — the spec is the source of truth.

---

## SECTION 14 — Where this leads

A3 is complete. Next:

| Doc | What it produces | Status |
|---|---|---|
| **A4 — CSS Tokens Implementation** | Real `css/tokens.css` file with every token from A3 as a CSS custom property, plus utility classes, plus font loading | Next |
| **A5 — Sample Screen** | One real screen (chapter list or title) rebuilt at the new bar, as proof the system holds together. | After A4 |

After A5, we resume PDF Chapter 2-8 conversion with the design system baked in.

---

## Owner check before A4

Three quick checks before I implement the CSS tokens:

1. **Font choices** (Section 1.1) — **Cinzel** (display caps), **Cormorant Garamond** (body serif), **Inter** (UI labels). All free Google Fonts. OK to lock these, or do you want to consider alternatives?
2. **Color hex values** — I picked specific tones based on canon. Would you like to see them rendered as a swatch image first, or trust the spec and adjust in A5 once we see them live in a real screen?
3. **Five motion profiles** (Section 6.3) — Tender / Ceremonial / Threat / Chase / Grief. Right vocabulary? Right defaults? Anything you want me to add (e.g., a "Romance" profile separate from "Tender")?

Confirm or adjust, and I'll produce A4 (the actual CSS tokens file we'll build against).
