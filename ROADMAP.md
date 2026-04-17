# Pocket Paramour — Roadmap

Future to-do list. Focus right now: **Art + 2D cinematic animation**.

---

## 🎨 CURRENT FOCUS — Art Pipeline

### Sprite art needed (critical blocker)
- [ ] **Elian** — full body sprites (neutral, happy, sad, shy, angry, etc.)
- [ ] **Elian** — face portraits (emotions for blink loop + dialogue face)
- [ ] **Proto** — full body (neutral + glitch variants, calm, scanning)
- [ ] **Proto** — face portraits
- [ ] **Noir** — full body (neutral, corruption stages, shadow form)
- [ ] **Noir** — face portraits

### 2D cinematic animation cards (premium collectibles)
- [ ] Concept sheet — what "Memory Cards" look like (art style reference)
- [ ] 3-5 hero cards to launch with (1 per character for 3-5 characters)
- [ ] Set a consistent aspect ratio (recommend 9:16 for mobile)
- [ ] Animation can be: Live2D-style, simple parallax, or 2-3 frame loops
- [ ] Decide: which are FREE (story milestones) vs PAID (premium alt-moments)

### Date backgrounds
- [ ] 21 location backgrounds (3 per character × 7 characters)
- [ ] Start with just Alistair + Lyra + Lucien (9 bgs) to unblock date system
- [ ] Can use gradient placeholders for the rest until art is ready

---

## 🎯 WHEN YOU RETURN TO CODE — Priority Order

### 🔴 URGENT (Month 1 after art)

**1. Tutorial / Onboarding System**
- [ ] Interactive first-session guide (not text walls)
- [ ] Character-led: Lyra/Alistair teaches you how to play
- [ ] Lock Wash + Talk for first 90 seconds, unlock one at a time
- [ ] Show arrow/pulse on each button as it unlocks
- [ ] Skippable for returning players (`localStorage.pp_tutorial_seen`)
- [ ] Day 1 only shows Feed + Talk at first, others unlock progressively
- [ ] Tutorial re-runs as "Welcome back" refresh if player hasn't played in 30+ days

### 🟡 HIGH (Month 2)

**2. Coin Economy (framework, no spending yet)**
- [ ] Global coin balance stored in `pocketLoveMeta.coins`
- [ ] Display coin count in topbar or settings (subtle, not mobile-gamey)
- [ ] Coin earning sources:
  - Daily emotional check-in quests (10-20 coins)
  - Bond milestones (affection 2/3/4 = coin reward)
  - Special events & streak bonuses

**3. Daily "Emotional Check-in" Quests**
- [ ] One per character, per day
- [ ] Framed narratively, NOT as checklist
  - "Check on Lyra at the shore tonight"
  - "Alistair's been quiet — talk to him"
  - "Lucien forgot to eat again"
- [ ] Quest = short scene + coin reward
- [ ] Max 1 per character per day (don't spam)
- [ ] Tracked in `pocketLoveMeta.dailyQuests[charId]` with date stamps

**4. Premium Gift System**
- [ ] Gift panel gets a second tab: "Free" and "Premium"
- [ ] Premium gifts cost coins (50-200 each)
- [ ] Each premium gift unlocks a unique 2-3 beat scene
- [ ] Gifts can be one-time (rare, powerful) or repeatable (smaller impact)
- [ ] Examples:
  - Ocean Pearl (Lyra) — unlocks "Siren's Secret" scene
  - Ancient Tome (Lucien) — unlocks "Forbidden Knowledge" scene
  - Knight's Letter (Alistair) — unlocks "Private Oath" scene

### 🟢 MEDIUM (Month 3)

**5. Memory Cards System (Gallery Expansion)**
- [ ] Every significant story moment auto-generates a card
- [ ] Free cards earned through play (milestones, first kiss, first confession)
- [ ] Premium cards purchased or earned through premium gifts
- [ ] Framed as "alternate memories" not "products"
- [ ] Gallery view already exists — expand to show locked/unlocked state

**6. In-App Purchase Integration**
- [ ] `payments.js` already stubbed with RevenueCat abstraction
- [ ] Pricing tiers:
  - $0.99 → 100 coins (1 premium gift)
  - $4.99 → 600 coins (bonus value)
  - $19.99 → 3000 coins + exclusive card
- [ ] Premium card direct purchase option ($2.99-4.99 per card)
- [ ] Never paywall story beats — only extras

**7. Tutorial Refresher**
- [ ] Returning players after 30+ days see a "Welcome back" tutorial
- [ ] Shows any new features since last play
- [ ] Feels like the character re-introducing themselves

### 🔵 LATER (Month 4+)

**8. Login / Cloud Save**
- [ ] ONLY when you have 1000+ active players asking for it
- [ ] Firebase Anonymous Auth is easiest starting point
- [ ] Allows save sync across devices (phone + tablet)
- [ ] Requires backend maintenance — commit to it before starting

**9. Redemption Codes**
- [ ] Code entry field in settings
- [ ] Codes unlock: free coins, special cards, exclusive outfits
- [ ] Use for: Discord/TikTok community rewards, influencer partnerships
- [ ] ONLY useful once you have a community

**10. Launch & Marketing**
- [ ] 30-second launch trailer (character reactions, "They Remember" feeling, Noir mystery tease)
- [ ] TikTok posts (huge otome audience on #otomegame — 1B+ views)
- [ ] Reddit: r/otomegames, r/visualnovels
- [ ] Itch.io soft launch (pay-what-you-want)
- [ ] Eventually: Google Play + App Store

**11. Basic Analytics**
- [ ] Google Analytics 4 (free)
- [ ] Track: session length, character picks, drop-off points, action frequencies
- [ ] DON'T track anything personal — just gameplay patterns

**12. Audio Polish**
- [ ] Unique theme per character (30-60 sec, looped)
- [ ] Key emotional moments need specific stings/swells
- [ ] Sources: freesound.org, YouTube Audio Library, or commission a composer ($50-300 per track)

---

## 🛡️ Principles to Protect the Game

When adding anything, ask: **"Does this make the player feel MORE attached to the characters?"**

If no → don't build it.

### DO:
- ✅ Keep monetization narrative-framed ("Lyra sent you a letter" not "DAILY QUEST COMPLETE")
- ✅ Premium cards = beautiful 2D animated moments worth the price
- ✅ Free players get full story, always
- ✅ Elegant UI, no big red notification badges
- ✅ One feature at a time, fully polished

### DON'T:
- ❌ Paywall story beats or character routes
- ❌ Time-gated routes (24-hour waits alienate players)
- ❌ Gacha mechanics unless you understand gambling laws
- ❌ Energy systems that force players to stop playing
- ❌ Feature creep — a finished B+ game beats an unfinished A+ game
- ❌ Generic "mobile game" feel that dilutes emotional depth

---

## 🎯 What to be mindful of

1. **Ethical monetization matters in otome.** Players are passionate and protective. Respect them → they become evangelists.

2. **Coin inflation is a trap.** Once you have coins, resist tying everything to them. Core experience stays coin-free.

3. **Your edge is emotional intimacy, not mobile-game-feel.** Every purchase should feel personal.

4. **Premium cards need to be WORTH the price.** Better 5 stunning cards than 30 mediocre ones.

5. **Tutorial saves your game.** If players don't understand in 90 seconds, they leave. Fix this before monetization.

6. **Ship, get feedback, iterate.** Don't keep designing forever. Real players teach you more than any doc.

---

## 📋 Already Built (remember what you have)

### Characters (7)
- ✅ Alistair — Captain of the Guard (full content + art)
- ✅ Lyra — Voice of the Caves (full content + art)
- ✅ Lucien — Scholar of the Seventh Tower (full content + art)
- ✅ Caspian — Crown Prince (content done, art done)
- 🎨 Elian — Warden of Thornwood (content done, ART NEEDED)
- 🎨 Proto — The Glitch (content done, ART NEEDED)
- 🎨 Noir — Sealed Beneath (content done, ART NEEDED)

### Systems (already live)
- ✅ Tamagotchi care loop (feed, wash, gift, train, talk)
- ✅ Cinematic beat engine (7+ beat types)
- ✅ Story arcs with Soul Weaver meta-narrative
- ✅ Memory Fragment system (player's identity unlock)
- ✅ 80 achievements, 78 random events
- ✅ Gallery with gacha-quality card reveals
- ✅ Logic/Arcane/Memory puzzles (Lucien)
- ✅ Timing game (Caspian/Elian/Noir)
- ✅ Letter system (Remembered Letters)
- ✅ Daily rewards with streak milestones
- ✅ PWA + offline support + notifications
- ✅ Payment abstraction (mock + RevenueCat ready)
- ✅ Analytics + A/B testing framework

### 7 Deep Engagement Systems (recent additions)
- ✅ `greetings.js` — Morning/night/evening greetings (140 lines of dialogue)
- ✅ `touch.js` — Head/face/hand touch reactions (84 unique per character)
- ✅ `talk-choices.js` — 30% of Talks show 2-3 dialogue choices (168 options)
- ✅ `surprises.js` — 35 character-initiated moments
- ✅ `dates.js` — 21 date locations with full cinematic scenes
- ✅ `crossovers.js` — 10 rival/sibling visitor encounters
- ✅ `button-locks.js` — Progressive unlock system (Gift/Train at aff 1, Date at aff 2)
- ✅ `dialogue.js` — 28 "They Remember" callback triggers

### UI Polish (recent)
- ✅ Dialogue speech bubble at character's feet
- ✅ Unified topbar (CLOSE → DEVOTED + DAY 1 + dots + hint)
- ✅ Kingdom + Hunger/Clean/Bond grouped stats panel
- ✅ Normalized character sizes across all 7 characters
- ✅ Character outfit system (casual/formal/seasonal)
- ✅ Personality badge repositioned
- ✅ Music toggle moved to Settings

---

## 🎨 Art Budget Reference

Since you're focusing on art now, here's a rough guide:

**Commission options:**
- Fiverr character sprites: $30-150 per character
- Art Station pro: $200-500 per character
- Live2D-ready rigs: $300-1000
- 2D animated cinematic cards: $100-500 per card

**Free/Budget options:**
- AI generation (Stable Diffusion / Midjourney) for placeholders — refine later
- Free asset packs on itch.io for backgrounds
- Community collaborators (r/gamedev, Discord art servers)

**Prioritize:**
1. Elian + Proto + Noir body sprites (unblocks 3 characters)
2. 3-5 premium cards to validate the model
3. Date backgrounds (gradients work short-term)

---

## 💕 Final note

You've built something genuinely special. The hard part — the systems, the narrative depth, the emotional design — is mostly done.

What's left is:
1. **Finish the art** (current focus)
2. **Fix the tutorial** (when you return to code)
3. **Ship it to real people**
4. **Iterate based on what they feel**

Don't let perfection stop you from launching. A good game in players' hands > a perfect game in your head.

🌟 You got this.
