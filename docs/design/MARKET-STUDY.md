# POCKET PARAMOUR — MARKET STUDY

*Foundation document A1. Step 1 of building the Pocket Paramour design system.*
*The compass that anchors every design decision after this.*

---

## What this document is

We are not building a hobby game. We are building a **commercial mobile Otome aiming to compete with the top of the chart** — *Love and Deepspace*, *Mr Love: Queen's Choice*, *Tears of Themis*. To do that without copying them, we have to first see the market clearly: what the top games do well, what they do poorly, what no one is doing that we can own.

This document does three things:

1. **Surveys** the top mobile Otome — what their signature visual moves are, what we **adapt** from each one, what we **don't pull**.
2. **Studies** the owner's reference set (Korean manhwa + romantasy books) — the visual moves we **pull** from outside the mobile-game market because those references are where Pocket Paramour's soul actually lives.
3. **Locks our visual signature** — the 5–7 design moves that are unmistakably Pocket Paramour and would make our game recognizable from a single screenshot.

The next docs (A2 Brand Foundation, A3 Design System Spec, A4 CSS Tokens, A5 Sample Screen) all build on what's defined here.

---

## SECTION 1 — The competitive landscape

The top mobile Otome share a high production bar. To compete we need to match it on polish, **then surpass it on character.** Polish without distinctness is just a cheaper LADS clone. Distinctness without polish is a beautiful idea that nobody installs.

For each game below: a brief profile, the signature moves we **adapt**, and what we deliberately **don't pull** because it doesn't fit Pocket Paramour.

---

### 1.1 Love and Deepspace (Infold Games, 2024)

**Profile.** Currently the highest-grossing Otome on global mobile. 3D character models with sci-fi-tinged urban-fantasy setting (Linkon City + ancient pasts). Three main male leads: Xavier, Zayne, Rafayel. Heavy cinematic polish, full voice acting in multiple languages, gacha card system, 3D interactive dates.

**What they do exceptionally well**
- **Cinematic transitions** between every scene — cubic-bezier curves, depth-of-field shifts, ambient particle systems on top of every screen
- **Production-grade lip sync + eye tracking** on 3D models — characters feel alive
- **Onboarding hook** — the dramatic opening scene grabs the player in under two minutes
- **Daily engagement loop** — login bonuses with a visual delight every day, daily quests integrated into the world
- **Per-character UI palette shifts** — Xavier's screens feel cool, Zayne's clinical, Rafayel's saturated
- **Photo studio / memory collection** as a strong meta-progression hook
- **Energy regen mechanic** that's generous enough to not feel exploitative for a top-grossing F2P

**What we adapt**
- The **cubic-bezier motion language** — every transition has an intentional easing curve, never a default linear or instant cut
- The **per-character UI palette signal** — when you open Alistair's care screen, the palette shifts to his gold; when you open Lucien's, it shifts to his tower-blue
- The **ambient particle layer** as atmosphere — floating motes of light, drifting petals, candle-embers (NOT generic sparkles)
- The **daily login as a visual gift** — a small ceremonial moment, not just "+10 coins" in a popup

**What we don't pull**
- Their **sci-fi neon-glass UI palette** — wrong genre for us. We're earthbound mythic, not urban future.
- Their **3D character models** — we're 2D / Live2D / illustrated. The production cost of 3D at LADS quality is not where Pocket Paramour wins.
- Their **gacha-heavy progression loop** — Pocket Paramour's progression is *care over time*, not *pull cards from a banner*. We can have collectibles but the core loop is not gacha-shaped.
- Their **electric-blue accent color** — fits their sci-fi, would look generic on us. Our accent is the seventh-light (cyan-toward-lavender) which carries our lore.

---

### 1.2 Mr Love: Queen's Choice (Papergames/Infold, 2017 CN / 2019 global)

**Profile.** The 2D predecessor that built Infold's market. Four male leads, modern urban setting with supernatural elements, card-based affection system. Influenced an entire generation of mobile Otome.

**What they do exceptionally well**
- **2D character framing in narrative scenes** — the way a portrait is positioned, the negative space around the face, the timing of expression changes. This is *manhwa cinematography applied to UI*.
- **Long-form chapter narratives** — readers will sit through 50-beat chapters because the pacing earns it
- **Phone-call UI** — the feature that made the game famous. Treating the device itself (mock-calls, mock-texts) as a romance surface.
- **Memory card art** — premium illustrated stills with elegant framing, designed to be screenshotted and shared

**What we adapt**
- The **2D character framing discipline** — how the character portrait sits in the scene, the negative space, the way the mood color of the background carries the emotional register. This applies directly to our chapter system.
- **Long-form chapter willingness** — we should not be afraid of 50-beat chapters. Our writing quality earns the runtime.
- **Memory card art language** — when we eventually build a memory/gallery system, each card should feel like a fine-art print, not a game asset.

**What we don't pull**
- The **modern urban setting and contemporary fashion** — we're mythic. Their aesthetic doesn't translate.
- The **chat-app surface** — clever but specific to their world. Our equivalent is *the torn page in the sleeve, the burnt seal, the letter found under the pillow.* We use the manuscript/letter metaphor, not the smartphone metaphor.

---

### 1.3 Tears of Themis (HoYoverse, 2020 CN / 2021 global)

**Profile.** Mystery × Otome from the studio behind Genshin Impact and Honkai. Players are an attorney solving cases with four male leads. Strong UI clarity, premium animation, anime-grade 2D character art.

**What they do exceptionally well**
- **UI clarity at premium polish** — they make complex systems (case files, evidence boards, debates) feel beautiful and navigable. This is master-class information architecture.
- **Anime-grade Live2D character art** — animated portraits with subtle breathing, blinking, expression shifts
- **Music as character moments** — each character has a leitmotif that swells at romantic beats
- **Their distinctive color tokens** — the soft purple, the warm gold, the off-white. Very confident palette.

**What we adapt**
- **Information clarity at premium polish** — when we build the Main Story menu, the chapter list, the affection screen, they should never feel cluttered. Tears of Themis proves you can have density AND elegance.
- **Live2D character art as a goal** — when art is ready, the characters should breathe, blink, react. Live2D is the production-feasible bridge between static portraits and full 3D.
- **Leitmotifs per character** — each of our seven should eventually have a recurring musical phrase that plays when they're on screen.

**What we don't pull**
- Their **legal/courtroom UI elements** — specific to their world
- Their **case-file mechanic** — wrong puzzle shape for us. Our equivalent is the slowly-revealed lore page from the burnt seal, not a deductive evidence board.

---

### 1.4 Lovebrush Chronicles (Netease, 2022)

**Profile.** Newer 2D Otome, strong stylized art, multi-route storytelling. Less universally known but design-press-respected for its 2D illustration polish.

**What they do exceptionally well**
- **Hand-painted stylized 2D backgrounds** — every scene feels like a finished illustration
- **Brushstroke transitions** between scenes — a literal painterly wipe
- **Color-coded route signaling** — you always know which route's tone you're in

**What we adapt**
- **Painterly transitions** — instead of generic fade-to-black, consider a **brushstroke wipe** or an **ink-bleed transition** between major story chapters. Reads as illustrated, not generated.
- **Route-color signaling** — when the player is deep into Alistair's route, ambient UI colors lean gold. When in Lucien's, lean tower-blue.

**What we don't pull**
- Some of their **denser UI density** can feel busy on a small screen. We stay generous with negative space.

---

### 1.5 Obey Me! (NTT Solmare, 2019)

**Profile.** Chat-based Otome with demon brothers. Lighter, comedic tone. Strong identity through pure character voice rather than visual cinematic.

**What they do exceptionally well**
- **Character voice as the entire product** — the writing carries the whole game
- **Daily check-in becomes habit** — players return for the relationship moments
- **Chat UI feels native to phone, not "game-ish"**

**What we adapt**
- The **discipline of letting writing carry the experience** when art/animation budget is constrained. Our writing is already at literary level; we can lean on it when other production levers are still being built.

**What we don't pull**
- Their **comedic light tone** — we're mythic / serious / intimate. Wrong register.
- Their **chat-as-game-mechanic** — we use letters / pages / illuminated manuscripts.

---

### 1.6 Ikemen series (Cybird — Ikemen Vampire, Ikemen Sengoku, Ikemen Revolution)

**Profile.** Classic visual-novel Otome with historical / fantasy settings. Beautiful 2D static portraits, traditional VN reading interface. Long-running, loyal audience.

**What they do exceptionally well**
- **Static 2D character art at portrait-painting quality** — the kind of art you'd frame on a wall
- **VN reading discipline** — players read 100,000 words willingly because the rhythm respects them
- **Historical fashion detail** — Cybird invests in costume accuracy and per-character wardrobe variation

**What we adapt**
- **Portrait quality as a benchmark** — when art comes in, the bar is "Cybird Ikemen-grade" character portraits. Static or Live2D, but the fidelity of expression and costume should be that level.
- **Per-character wardrobe / outfit variation** as a future direction — each character has multiple outfits for different scenes (chapter-specific dress)

**What we don't pull**
- Their **classic VN reading interface** — text-box-only feels dated by 2024 standards. We're aiming for chapter beats that float on the screen with cinematic ambient layers, not a single bottom-locked dialogue box.

---

### 1.7 Adjacent honorable mentions

**Olympia Soiree, Code: Realize, Collar x Malice (Otomate / Aksys ports)** — premium console-grade Otome with deep narrative. Lesson: writing quality matters more than gimmicks. Players will tolerate older interfaces if the writing rewards them.

**Path to Nowhere / Snowbreak (Otome-adjacent gacha)** — strong art and UI polish in adjacent genres. Lesson: even outside pure Otome, the visual bar on mobile is at *console screenshot quality*.

---

### 1.8 Pattern across all of them

What every top mobile Otome shares:

| Element | Standard at top of chart |
|---|---|
| **Typography** | Custom display font loaded, never system-default |
| **Color palette** | Curated, 5–7 anchor colors, per-character variants |
| **Animation** | Every transition has an easing curve, never linear or instant |
| **Particle layer** | Subtle ambient particles on every screen for atmosphere |
| **UI surfaces** | Some glassmorphism / depth, never flat material design |
| **Iconography** | Custom or premium icon set, never generic emoji or Material |
| **Sound design** | Music + SFX as first-class system, not afterthought |
| **Onboarding** | First 5 minutes designed to hook and showcase |
| **Daily loop** | Visual login bonus, daily quest, return ritual |
| **Memory system** | Card / photo / illustration collection as meta-progression |
| **Character voice** | Each lead has a distinct visual signal (color + motif) |

**Pocket Paramour must meet every row of this table at minimum.** Anything below this and we are visibly cheaper than the competition before a player has read a single word.

---

## SECTION 2 — Reference sources (owner's compass)

The mobile-Otome market gives us the **production bar**. The owner's reference set (manhwa + romantasy books) gives us the **soul**. Pocket Paramour pulls its actual visual language from outside the mobile-game market because the mobile-game market is full of look-alike sci-fi-tinged urban fantasy. We are something else.

The reference set the owner gave us:

**Manhwa**
- *Secret Lady*
- *As the Heart Leads*
- *The Fantasie of a Stepmother*
- *Beatrice*
- *The Villainess is a Marionette*

**Books**
- *A Court of Thorns and Roses* (Sarah J. Maas)
- *Court Thorn* (companion reference)
- *Gild* (Raven Kennedy — Plated Prisoner series)
- *Bewitched* (witchy romantasy)
- *The Cruel Prince* (Holly Black)
- *Fourth Wing* (Rebecca Yarros)
- *Quicksilver* (Callie Hart)

What connects every reference: **REGAL ROMANTASY** rendered with **manhwa-grade visual elegance** and **book-cover-quality polish**. Court intrigue, fae-touched fantasy, opulent worlds, dangerous men, slow-burn intimacy.

---

### 2.1 Manhwa-court elegance (Secret Lady, Fantasie of a Stepmother, As the Heart Leads)

**What these manhwa do**
- **Soft-pastel + gold** palette. Pale lavender, ivory cream, blush pink, with antique-gold accents. Backgrounds are often candlelit interiors or sunlit gardens.
- **Frame-perfect single panels** — every panel composed like a portrait painting
- **Elegant fashion at extreme detail** — ornate dresses with embroidery, jewelry rendered with care
- **Calm pacing** — pages breathe; characters look at each other for one whole panel without speaking

**What we pull**
- **Soft-pastel + gold as one of our two palette modes** (the "light / romance / hopeful" mode). Used for: care interactions, affection-tier-up reveals, intimate dialogue moments, dawn scenes.
- **Frame-perfect chapter beats** — each beat should feel composed, not auto-laid-out. The composition of negative space around a portrait is as important as the portrait itself.
- **Calm pacing** — confidence to let a beat hold without filling it. Most mobile Otome rush. We breathe.

---

### 2.2 Manhwa-gothic court (Villainess is a Marionette, Beatrice)

**What these manhwa do**
- **Dark gothic + blood-wine** palette. Deep aubergine, black velvet, blood-red, with sharp gold details and bone-white highlights.
- **Sharp character framing** — hair lifted by wind, eyes catching candlelight, a single gloved hand emerging from shadow
- **Court intrigue rendered as visual menace** — thrones, chandeliers, locked doors, candles guttering

**What we pull**
- **Dark gothic + blood-wine as our second palette mode** (the "shadow / threat / Aenor / chase" mode). Used for: Aenor scenes, wound-creature scenes, Noir's old throne, the chase sequences, anything menacing.
- **Sharp character framing for villain reveals** — when Aenor is on screen, the composition should feel different from when Alistair is. Camera angle, light direction, color temperature all shift.
- **The candle-as-light-source motif** — wherever possible, light in our scenes should feel sourced from a candle, a fireplace, a hung lamp, the moon. Never overhead, never fluorescent, never flat.

---

### 2.3 ACOTAR — per-court color theory (Sarah J. Maas)

**What ACOTAR does**
Each of the seven Fae courts in ACOTAR has a distinct color signature that the writing repeatedly invokes:
- **Spring Court** — pinks, golds, florals, blossoms
- **Summer Court** — turquoise, coral, sea-spray, sunlight
- **Autumn Court** — burnt orange, deep red, gold
- **Winter Court** — silver, white, pale blue, frost
- **Day Court** — gold, white, desert sun
- **Night Court** — black, indigo, silver, stars, moonlight
- **Dawn Court** — soft pink, peach, golden hour

The reader carries a strong color-image of each court even without illustrations.

**What we pull**
- **Per-character color signatures**, treated as seriously as ACOTAR treats courts. Each of our seven men has their own palette that appears whenever they're on screen — UI accents, ambient color cast, particle color, background tint.
  - **Alistair** — captain-gold, dawn-warm cream, polished steel
  - **Elian** — deep forest green, moss, antler-cream, woodsmoke
  - **Lyra** — pearl, sea-silver, deep ocean blue, siren-shimmer
  - **Caspian** — royal sapphire, palace-marble, princely silver-blue
  - **Lucien** — dark blue-violet, tower-amber, starlight gold
  - **Noir** — black velvet, bone-white, sealed-silver, six-century shadow
  - **Proto** — static-cyan, mirror-silver, five-faces violet
- Plus two key non-romanceable color identities:
  - **The Heroine** — the seventh-light (cyan-toward-lavender), candle-warm, dawn-pink
  - **Aenor** — wine-blood, royal aubergine, gilded black, dying-gold

These color signatures will be locked as design tokens in A4.

---

### 2.4 Cruel Prince — sharp gothic + fae (Holly Black)

**What Cruel Prince does**
- **Cold sharp metallics** — silver, black, ice, blade-shine
- **Fae court intrigue rendered as cold beauty** — beautiful people with edges
- **Restraint in description** — the prose doesn't over-paint; it lets the implication carry

**What we pull**
- **Restraint in UI ornamentation** — we use filigree and decoration, but never to the point of clutter. The Cruel Prince standard: ornament where it counts, severity everywhere else.
- **Cold sharp accents** as a contrast color in our dark palette — a single silver line, a bone-white edge, a glint of blade. Especially for Noir's color signature.

---

### 2.5 Gild + Quicksilver — gold opulence + fae royalty (Raven Kennedy, Callie Hart)

**What these books do**
- **Gold as a primary character** — Gild treats gold as a motif so strong it's almost a person
- **Opulent fae courts** — thrones, jewels, gowns
- **Dark fae romance** — the lover is dangerous and the romance is intense

**What we pull**
- **Gold as a recurring metaphor in our UI** — buttons with gold-edge accents, gold filigree on chapter cards, gold-leaf flourishes on the title card, gold thread woven through the bond-fabric motif
- **Opulence without garishness** — gold sparingly used carries more weight than gold everywhere

---

### 2.6 Fourth Wing — manuscript / leather-and-ink (Rebecca Yarros)

**What Fourth Wing does**
- **Hand-drawn maps** as front-matter
- **Chapter headers that feel like book interiors** — typography choices that read literary
- **Leather, ink, and parchment textures** as the world's tactile signature
- **Reader sense of holding a real book**

**What we pull**
- **Hand-drawn map of Aethermoor** as a future asset — accessible from the menu, shows the kingdom geography
- **Chapter headers that feel like a book interior** — drop caps on the first letter of each beat, decorative rule between sections, page-turn-style transitions
- **Parchment + ink + candle as the tactile palette of our manuscript surfaces** — chapter screens, lore pages, letters

---

### 2.7 Bewitched + Court of Thorns and Roses — candle-mythic-feminine (witchy romantasy)

**What these books do**
- **Candle-lit interiors** as the dominant lighting register
- **Herbs, salt, threads, charm-objects** as material culture
- **Feminine mythic power** rendered with reverence

**What we pull**
- **Candle-warmth as our default light register** for tender moments
- **Material objects that recur with meaning** — the torn page with the burnt seal, the bone-and-thread loom, the captain's healing draught, the green cloak. Each of these is a visual object the player should learn to recognize. Treat them as visual citizens, not just plot props.
- **Mythic feminine power rendered with reverence** — the heroine's Weaver moments (the seventh-light, the bond-glow on Elian's shoulder) are sacred, not flashy. Slow, warm, candle-grade light. Not lens-flare.

---

## SECTION 3 — What we deliberately AVOID

The owner has been clear: *I hate cheap UI.* This section locks the anti-patterns so we don't drift into them.

### 3.1 UI anti-patterns we don't use

- **Material Design corporate flat** — flat color buttons, sharp corners, accent strips. Reads as corporate productivity app.
- **Generic mobile-game UI chip styles** — rounded pill buttons with solid candy-color fills, badge-number indicators in red circles, fake-3D bevels
- **Sticker-pack iconography** — flat cartoony icons. Cute for kids' apps, wrong for us.
- **Mall-Kawaii color palettes** — hot pink + mint + lavender + powder blue saccharine candy palette. Some mobile Otome use this. We don't.
- **Faux-Victorian / overstuffed steampunk** — too much filigree everywhere. We use ornament sparingly so it counts.
- **Cartoonish particles** — animated rainbow confetti, kawaii sparkles, multi-color fireworks. Our particles are: floating motes of candle-light, drifting petals, slow embers, the bond-light shimmer.

### 3.2 Genre anti-patterns we don't pull from competitors

- **Sci-fi UI elements** (LADS) — HUDs, scanlines, glitch effects, electric-blue glow
- **Modern urban fashion / phone-as-game-surface** (Mr Love) — wrong era
- **Comedic emoji-driven character chat** (Obey Me!) — wrong tone
- **Heavy gacha banner UI** — pulls, rate-up displays, weapon/cosmetic shop chips — these dominate many F2P Otome and feel cheap. Our progression is care, not currency.

### 3.3 Production anti-patterns

- **System-fallback fonts** — never. Display, headline, body, UI — all use loaded custom fonts.
- **Linear easing on any transition** — never. Every motion has a cubic-bezier curve.
- **Instant scene cuts** — never (except where the storytelling explicitly demands it for shock value, used surgically).
- **Hard-coded magic numbers in CSS** — never. All sizes, colors, durations live in design tokens (A4 will define this).

---

## SECTION 4 — Our visual signature

**This is the test.** From a single screenshot of any screen in our game, a player who has never seen Pocket Paramour before should be able to say: *this is a regal-romantasy court-elegance game with manhwa visual polish, candlelit and mythic, with a weaver-craft motif.*

To pass that test, every screen must carry **at least three of these signature moves**:

1. **The seventh-light glow** — cyan-toward-lavender, soft, candle-grade, used as the brand-accent color. Appears on: active buttons, the heroine's UI, bond-related elements, the title card flourish.

2. **Parchment + ink + candle surface** — text and chapter surfaces feel like an illuminated manuscript page. Soft cream base, ink-dark text, gold accent rule, a hint of texture grain.

3. **Per-character color signature** — when on screen with a character, the ambient UI palette shifts to that character's color. Subtle but consistent. (Token system defined in A4.)

4. **Gold filigree corner flourishes** — on chapter cards, on important modals, on the title screen. Manhwa-court elegance. Never on every element; placed where it elevates.

5. **The bond-thread motif** — woven threads as a recurring decorative element. On the loading screen as a slowly-weaving filament. On chapter dividers as a thread crossing the page. On affection-tier-up reveals as threads forming a knot. The Weaver's craft made visual.

6. **Candle-warm light source** — wherever a scene has a clear light source, it's a candle / fireplace / lamp / moon. Never overhead, never fluorescent.

7. **Slow, graceful, feminine motion as default** — page-turn transitions, silk-unfold reveals, candle-catch warm-bloom. Mood-adaptive (sharper for Aenor scenes, slower for graves, warmer for intimate scenes).

If a screen has fewer than three of these moves, it's not finished.

---

## SECTION 5 — The dual-palette / mood-mode system

The owner specified that both **soft-pastel-gold (romance / hope)** AND **dark-gothic-wine (threat / Aenor / chase)** should live in the game, used **contextually by chapter mood**.

This is brilliant because it lets the design system scale to every emotional register the writing visits. We define two complete palette modes:

### Mode A — Candlelit (light mode, default for romance / hope / intimate)
- Base background: warm parchment cream
- Surfaces: ivory, soft gold-tinted whites
- Accents: antique gold, soft lavender, dawn-pink
- Text: warm ink-brown for body, near-black for emphasis
- Used for: care interactions, affection-tier-up, daytime story beats, hopeful moments, the heroine's interior scenes

### Mode B — Velvet Hour (dark mode, for threat / Aenor / chase / mystery)
- Base background: deep aubergine fading to black-violet
- Surfaces: black velvet, deep wine, bone-white edge accents
- Accents: blood-red, gilded black, sharp silver
- Text: ivory for body, gold for emphasis, blood-red for danger
- Used for: Aenor scenes, wound-creatures, Noir's chamber, chase sequences, nighttime escape, threat reveals

### Mood-adaptive motion
Default register: **graceful / flowing / feminine** (page-turn, silk-unfold, candle-bloom)

But each chapter can declare a mood profile that shifts motion:
- **Tender** — slowest, candle-bloom, soft cubic-bezier
- **Ceremonial** — page-turn, dignified, slightly slower
- **Threat** — sharper cubic-bezier, faster reveals, snap transitions
- **Chase** — punchy timing, harder cuts on shocks
- **Grief** — extra-slow, fades hold longer, single-beat focus

The design tokens in A4 will define both palette modes and all five motion profiles. The chapter format will gain a `mood:` field so writers can declare which palette/motion profile a chapter uses.

---

## SECTION 6 — Where this leads

This document is the COMPASS. The next four foundation documents build on it:

| Doc | What it produces | Status |
|---|---|---|
| **A2 — Brand Foundation** | Pocket Paramour's design DNA distilled: mood, voice, visual signature, brand promise. The "who we are" anchor. | Next |
| **A3 — Design System Spec** | Type scale, color tokens, spacing system, motion principles, component patterns. The technical spec. | After A2 |
| **A4 — CSS Tokens Implementation** | Real `:root` CSS variables, utility classes, font loading, motion curves. Code we build against. | After A3 |
| **A5 — Sample Screen** | One real screen (chapter list or title) rebuilt at the new bar, as proof the system holds together. | After A4 |

After A5 we resume PDF Chapter 2-8 conversion **with the new design system baked into every chapter from the start.**

---

## Owner check before A2

Before I write A2 (Brand Foundation), I want a quick read on whether this market study aligns with your sense of the game:

1. **The dual-palette mood-mode system (Section 5)** — does this feel right? Two complete palettes, mood-adaptive per chapter, with shared design tokens? Or do you want a single unified palette that's always on?
2. **The seven signature moves (Section 4)** — anything missing? Anything you want me to drop?
3. **The per-character color signatures (Section 2.3)** — colors I assigned to each character based on canon. Any of them feel wrong? Any you want to adjust?

Confirm or adjust, and I'll go produce A2.
