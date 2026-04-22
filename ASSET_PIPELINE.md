# Pocket Paramour · Asset Pipeline

This document is for you — the game owner — so you know **exactly where to
drop each asset type** as you produce art, voice, and animation over time.
The engine is already wired to pick them up automatically.

---

## 1. Character sprites (static)

### Base body sprites
Path: `assets/<character>/body/<pose>.png`

Examples already in use:
- `assets/alistair/body/casual.png` — main neutral pose
- `assets/alistair/body/softshy-love1.png` — vulnerable pose
- `assets/alistair/body/smile.png` — happy pose

Sprites are referenced by **pose name** in chapter / encounter / affection
scene beats:

```js
{ type: 'pose', src: 'assets/alistair/body/smile.png', animate: 'swap' }
```

Drop a new pose file → reference it by filename → it appears in the game.

### Face overlays (optional)
Path: `assets/<character>/face/<emotion>.png`

Used by the existing game (not the main story route). Transparent backgrounds,
framed to overlay on body sprites.

### Select-screen portrait
Path: `assets/<character>/select-portrait.png`

Used by the Main Story page chapter thumbnails and character-select grid.

---

## 2. Breathing animation (automatic)

You don't need to do anything. The engine applies a gentle breathing loop
(scale + translate) to every visible character sprite in:

- Encounter overlays (`#ms-char-img`)
- Premium cards (`#mscard-char`)
- Main game screen (if you wire an `#character-image` or `#char-body` id)

Per-character tempo lives in [js/production-polish.js](js/production-polish.js)
as `CHAR_META`. Tweak to taste. Defaults:

| Character | Breath cycle | Scale intensity |
|---|---|---|
| Alistair | 4.2s | 1.5% |
| Elian    | 5.2s | 1.2% (slower, forest-calm) |
| Lyra     | 5.8s | 1.4% (haunting, still) |
| Caspian  | 4.0s | 1.6% (performative) |
| Lucien   | 4.8s | 1.3% |
| Noir     | 6.4s | 0.9% (predator-still, uncanny) |
| Proto    | 3.2s | 1.0% (glitchy, fast) |

Respects `prefers-reduced-motion: reduce`.

---

## 3. Eye-blink overlay (optional but cheap AAA win)

### What to produce
One transparent PNG per character, same framing as the body sprites, with
**eyes closed only** (everything else fully transparent). The engine will
overlay it briefly every 4-14 seconds over any body sprite.

Path: `assets/<character>/face/blink.png`

### How it works
- Engine probes the file on page load for each character.
- If it exists → blink overlay activates, randomised interval per character.
- If missing → silent no-op. No errors.

### Per-character blink cadence
- Caspian, Alistair, Proto — frequent (4-7s)
- Elian, Lyra, Lucien — normal (5-10s)
- Noir — rare (8-14s), feels predator-still

You can test a single character by producing just ONE blink.png — the others
stay untouched.

---

## 4. Voice lines (full voice pipeline, optional)

### What to produce
Per line of dialogue you want voiced, one audio file.

Path: `assets/voice/<character>_<scene-id>_<line-id>.mp3`

Recommended format: **mp3** or **ogg**, mono, 128 kbps. 1-5 second clips.

### How to wire a voice line
In any chapter beat in [js/chapters.js](js/chapters.js), [js/affection-scenes.js](js/affection-scenes.js),
or any encounter file, add a `voice` field:

```js
{
  type: 'line',
  text: 'Walk with me. The outer wall is where the fading started.',
  voice: 'assets/voice/alistair_ch1_open_01.mp3',
  hold: 2000,
  cps: 30
}
```

When the line starts typing → audio auto-plays at 85% volume → stops if the
card closes or the scene ends.

### Missing file = silent
If the mp3 doesn't exist, the line plays typed-only. The game never errors.
Ship with voice lines missing, add them one at a time.

### Naming convention suggestion
```
assets/voice/
  alistair/
    ch1_open_01.mp3     # "Walk with me. The outer wall..."
    ch1_open_02.mp3     # "Stones that held magic..."
    midnight_01.mp3     # "You've never seen me without the armour."
  lyra/
    ch3_open_01.mp3
    ...
```

Use whatever folder structure you like. The engine just reads the string you
put in `voice: '...'`. Flat or nested — both work.

---

## 5. Backgrounds

Path: `assets/bg-<name>.png`

Already in use:
- `bg-world.png` · kingdom overview
- `bg-alistair-gate.png`, `bg-alistair-hall.png`
- `bg-elian-forest.png`, `bg-elian-intro.png`
- `bg-lyra-cliff.png`, `bg-lyra-ocean.png`, `bg-siren-cave.png`
- `bg-caspian-balcony.png`, `bg-caspian-bedroom.png`, `bg-caspian-night.png`, `bg-caspian-day.png`, `bg-caspian-intro.png`
- `bg-lucien-study.png`, `bg-lucien-evening.png`, `bg-lucien-night.png`, `bg-lucien-bedroom.png`
- `bg-noir-intro.png`, `bg-noir-void.png`
- `bg-proto-intro.png`, `bg-proto-void.png`

Drop additional backgrounds with any filename. Reference in beats:

```js
{ type: 'show', bg: 'assets/bg-new-scene.png', pose: '...' }
```

Parallax-ready: the engine already applies a slow scale transform on `#mscard-bg`
during zoom beats. When you produce multi-layer backgrounds (distant/middle/near),
a small engine patch unlocks true parallax. Ping me when you have layered bg art.

---

## 6. Music + ambient loops

### What the game has
- Existing `sounds.js` plays one-shot SFX from `assets/audio/*.mp3`
- Existing `bgm.js` handles background music

### What you'll want to produce
- Character themes: 1-2 minute looping tracks per character
  `assets/audio/theme-<character>.mp3`
- Scene themes: tense, romantic, dark — 3-5 tracks shared across scenes
- Encounter stings: 3-5 second musical cues on reveals

Wire-up is a small engine patch when you're ready — we'll plug them into
chapter palette configs.

---

## 7. Live2D / Spine / 2D animation (future)

When you're ready for breathing 2D animated characters:

### Option A — Live2D (industry standard for Otome)
1. Rig each character sprite in Live2D Cubism (you or a Fiverr freelancer)
2. Export as `.moc3` + `.model3.json` + texture atlas
3. Drop in `assets/<character>/live2d/`
4. Tell me — I'll swap out the static-sprite container for a Live2D
   widget (one-file change, no game-logic impact)

### Option B — Spine animation
Same pipeline, different tool. Spine's JSON format is also well-supported in
browsers. The engine swap is the same scope.

### Option C — Sprite-frame animation (cheapest)
Drop a sequence `assets/<character>/body/idle_01.png`, `idle_02.png`, ...
`idle_12.png`. I'll write a 12-frame loop animator. Great for subtle breathing
+ hair sway without a Live2D rig.

**All three options are one engine patch each.** The content pipeline doesn't
change. Your chapter beats stay text-driven.

---

## 8. The upgrade philosophy

1. **Ship the game today** with the static sprites + placeholder silhouettes
   you already have. Real players give real feedback.
2. **Add voice lines one character at a time.** Record Alistair first — his
   arc is the most polished. Ship. Then record Lyra. Ship.
3. **Add Live2D one character at a time.** Alistair first. Then Lyra. Each
   upgrade immediately visible to returning players (SW cache bump auto-reloads).
4. **Track what players repeat.** Memory cards they replay the most, endings
   they keep hitting — those are the lines to voice first.

Every asset you produce plugs into the existing engine. No re-code. No
re-architecture. The game grows with your art budget.
