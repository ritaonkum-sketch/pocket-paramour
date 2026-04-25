POCKET PARAMOUR — ARCHITECTURE
==============================

This is the system map. It explains what the game is, what lives where,
and how a new scene/feature gets added without breaking anything.

Audience: the owner (non-coder) and any future dev/Claude session that
needs to find their way around.

--------------------------------------------------------------------------
1. WHAT THE GAME IS (ONE PARAGRAPH)
--------------------------------------------------------------------------

Pocket Paramour is a mobile-web Otome game built as a Progressive Web
App. The player is the Seventh Soul Weaver — a rare magical being whose
bonds with the seven love interests fuel the kingdom's wards. The game
runs in two parallel modes: (a) a Tamagotchi-style care loop where the
player nurtures one chosen character, and (b) an opt-in "Main Story"
route with 14 cinematic chapters, 7 meet-cutes, turning points,
crossover scenes, and per-route endings. The main story stays
open-ended (Love-and-Deep-Space live-service model); character routes
are where the emotional payoff lands.

--------------------------------------------------------------------------
2. FILE TAXONOMY — 74 JS FILES, ORGANIZED
--------------------------------------------------------------------------

### Core engine (6)
game.js            — main game loop, state, stat decay
ui.js              — UI rendering for the care loop
dialogue.js        — dialogue box / talk system
character.js       — CHARACTER_ALISTAIR (inline) + CHARACTER_LYRA_FULL (inline)
intro.js           — first-play intro (world-intro sequence)
remote-config.js   — live tuning via config.json

### Character data (6 separate files; Alistair lives inline in character.js)
character-caspian.js   — CHARACTER_CASPIAN + voice-direction + family curse lore
character-elian.js     — CHARACTER_ELIAN + voice-direction + fae/Veyra/Lyra-people lore
character-lucien.js    — CHARACTER_LUCIEN + voice-direction + memory-cost/sister lore
character-lyra.js      — CHARACTER_LYRA + voice-direction + half-siren/brother lore
character-noir.js      — CHARACTER_NOIR + voice-direction (Cavill-Geralt) + seal lore
character-proto.js     — CHARACTER_PROTO + voice-direction (Golden Retriever)

Each file has a multi-line header comment block: primary voice
reference, secondary reference, signature skinship, and three-part
lore wound. **Read these first** when writing any new content for
that character.

### Main-story spine (4)
main-story.js              — overall route orchestrator, stage gating
main-story-integration.js  — cohesion layer (suppresses duplicate intros, etc.)
main-story-toggle.js       — opt-in on/off chip + auto-enable for fresh players
chapters.js                — the 14 main-story chapters (0–8, 10–14)

### Meet-cutes / encounters (8)
encounter-{alistair,caspian,elian,lucien,lyra,noir,proto}.js
encounter-elian-rescue.js  — "The Thornwood Attack" Weaver-naming scene (bond ≥ 25)

### Auto-firing scene modules (10)
affection-scenes.js   — 4 tiers × 7 chars = 28 bond-threshold scenes
turning-points.js     — 7 irreversible mid-arc choices (one per character)
epilogues.js          — per-route endings (v2 architecture, no main-finale needed)
adaptive-thoughts.js  — Thompson-sampled character thoughts
cross-char.js         — jealousy reactions
noir-whispers.js      — Noir's post-Ch6 asides about other characters
early-whispers.js     — pre-Ch6 unattributed atmosphere
daily-purpose.js      — once-per-day banner
surprises.js          — misc surprise events
events.js             — game events layer

### Crossover scenes (7 + 1 registry)
crossovers.js                      — original crossover registry (legacy)
crossover-lyra-lucien.js           — "The Staffs" (siblings revealed)
crossover-noir-elian.js            — "The Two Who Loved Her" (Veyra grave)
crossover-noir-lyra.js             — "The Song" (melody recognition)
crossover-caspian-noir.js          — "The Mirror Princes"
crossover-elian-lyra.js            — "The Debt" (siren-kind markers)
crossover-lucien-aenor.js          — "The Tower" (Aenor confronts Lucien)
crossover-weavers-court.js         — ensemble climax + champion choice

### Ship-readiness guards (3)
ambient-coordinator.js   — DOM-level mutex for head-area text overlap
payments-guard.js        — blocks mock-payment unlocks in production
storage-guard.js         — patches setItem + runs partial-save repair on boot

### UX polish (10+)
ui-feel.js, production-polish.js, action-feedback.js, first-session.js,
idle-life.js, day-progress.js, greetings.js, touch.js, talk-choices.js,
letter.js, button-locks.js

### Monetization (3)
payments.js, revenuecat-bridge.js, monetization.js

### Audio (3)
sounds.js, bgm.js, sound-design.js

### Gallery / collection (2)
gallery.js, memory-gallery.js, cards-library.js, premium-card.js

### Misc (5)
achievements.js, bandit.js (Thompson sampling), dates.js, crossovers.js
(legacy), analytics.js, affection-drift.js, endings.js, puzzles.js

### Dev tooling (1)
dev-panel.js    — hidden debug overlay, activated by ?dev=1 URL param

--------------------------------------------------------------------------
3. SCRIPT LOAD ORDER (from index.html)
--------------------------------------------------------------------------

Correct order matters because later scripts depend on earlier ones.

  1. storage-guard.js       — must run FIRST (repairs partial saves)
  2. remote-config.js       — live tuning
  3. analytics.js, bandit.js
  4. dialogue.js, character.js
  5. character-*.js (6 files)
  6. puzzles.js, sounds.js, bgm.js, payments.js, daily-rewards.js, gallery.js
  7. intro.js
  8. game.js                — depends on character + dialogue
  9. ui.js                  — depends on game
  10. UX layer (letter, ui-feel, day-progress, etc.)
  11. encounter-*.js (8 files) + main-story.js
  12. daily-purpose, premium-card, cards-library, adaptive-thoughts, endings
  13. monetization, memory-gallery, sound-design, revenuecat-bridge
  14. main-story-toggle, main-story-integration
  15. chapters.js, noir-whispers, affection-scenes, production-polish
  16. cross-char, epilogues
  17. turning-points, early-whispers, affection-drift
  18. crossover-*.js (7 files)
  19. ambient-coordinator.js   — must run AFTER ambient modules
  20. payments-guard.js
  21. dev-panel.js             — last

--------------------------------------------------------------------------
4. localStorage KEY SCHEMA
--------------------------------------------------------------------------

All keys are prefixed `pp_` (Pocket Paramour) or the legacy
`pocketLoveSave_` / `<char>_affection`.

### Route / world flags
pp_main_story_enabled      — '1' when main-story route is active
pp_main_story_decision     — intro decision (opt-in chip state)
pp_world_intro_seen        — '1' after world intro played
pp_weaver_revealed         — '1' after Elian rescue scene
pp_weaver_champion         — 'alistair'|'elian'|'lyra'|'caspian'|'lucien'|'noir'|'proto'
pp_chapter_current         — integer, current main-story chapter
pp_chapter_done_<N>        — '1' per completed chapter (N = 0–14)

### Per-character flags (for each of the 7)
pp_met_<char>                         — '1' once met in any mode
pp_ms_encounter_<char>_seen           — '1' after main-story meet-cute
pp_intro_<char>                       — '1' after care-loop intro played
pp_affection_<char>                   — int 0–100
<char>_affection                      — legacy mirror of above
pp_scene_seen_<char>_<tier>           — warm/closer/chosen/midnight
pp_tp_<char>_choice                   — turning-point branch choice
pp_tp_<char>_seen                     — '1' after TP scene
pp_epi_seen_<char>                    — '1' after a route ending plays

### Elian-specific
pp_elian_rescue_seen                  — '1' after Thornwood Attack
pp_elian_rescue_choice                — 'stay' | 'leave'

### Crossover flags
pp_cross_<pair>_seen                  — '1' after that crossover played
pp_cross_lyra_lucien_choice           — 'reconcile' | 'wait' (in that one scene)

### System flags
pp_schema_v                           — storage schema version (currently 1)
pp_dev_payments                       — '1' = per-device dev escape for payments
pp_dev_panel                          — '1' = dev-panel active
pp_rc_public_key                      — RevenueCat public key
pp_purchases                          — JSON object of purchased productIds
pp_drift_<char>                       — '1' while char is neglected (drift cap)
pp_lastvisit_<char>                   — timestamp ms of last visit

### Storage-guard self-repairs (automatic, on boot)
If `pp_chapter_done_N = '1'` then ensure met + encounter_seen for the
character gated by N. If met but no affection, seed to 10. If
ending-seen but no branch, default to 'neutral'. Etc.

--------------------------------------------------------------------------
5. SCENE-FIRING PATTERNS
--------------------------------------------------------------------------

Most auto-firing scenes use this pattern:

  (1) An IIFE wrapper runs at script parse.
  (2) A boot() fn schedules a setInterval poll (e.g. every 20–30s).
  (3) Each tick calls shouldFire(): checks feature flag + seen flag +
      affection/bond thresholds + game idle (no other overlay showing) +
      whether the player is on the right character's screen.
  (4) If conditions pass, flag is marked seen, the scene plays.
  (5) The scene's overlay is a full-screen DOM element built fresh each
      time and removed afterward. No persistent DOM.

15+ modules do this. Each has its own poll loop. This is NOT ideal
(battery/perf) but it IS simple, isolation-safe, and has no shared
state beyond localStorage. Refactoring them into a single coordinator
would be a major surgery — see "Future Work" below.

### Ambient-coordinator special case
Four modules render text near the character's head
(#adaptive-thought, #cc-bubble, #noir-whisper, #ew-whisper). The
ambient-coordinator uses a MutationObserver to enforce a priority
mutex — only one visible at a time. Modules don't coordinate directly.

--------------------------------------------------------------------------
6. THE WEAVER FRAMEWORK (LORE → CODE)
--------------------------------------------------------------------------

Canon:
  - The player is the 7th Soul Weaver in ~600 years.
  - Each bond with a love interest lights a ward in the kingdom.
  - Queen Aenor consumed the six prior Weavers (one per generation).
  - Proto is the 6th — trapped in the seal, not consumed cleanly.
  - Veyra was the 2nd Weaver — loved by Elian, then Corvin, then
    Aenor's betrothed. Aenor consumed her. This is the wound.

Code hooks:
  - pp_weaver_revealed flag gates the "you are a Weaver" dialogue
    lines that are distributed across event.rare/happyLines per
    character. Most fire naturally at high bond.
  - The Elian rescue scene sets pp_weaver_revealed = '1' as its
    canonical naming moment.
  - Proto's midnight scene names the six prior Weavers.
  - The Weaver's Court crossover writes pp_weaver_champion — that
    flag is the doorway to any future final-battle scene.

--------------------------------------------------------------------------
7. HOW TO ADD A NEW SCENE (COOKBOOK)
--------------------------------------------------------------------------

### Case A: a new affection beat for one character
Edit affection-scenes.js — find that character's warm/closer/chosen/
midnight entry and add a new `beats` entry. Reload. Fires at
appropriate bond threshold.

### Case B: a new crossover scene between two characters
Copy one of the crossover-*.js files as a template. Edit:
  - FLAG_SEEN (new unique pp_cross_<pair>_seen key)
  - trigger conditions (metX, metY, bond thresholds)
  - play() beat sequence
  - register it in dev-panel.js SCENES array
  - register it in index.html <script> tag
  - add to sw.js CORE_ASSETS manifest
  - bump CACHE_NAME in sw.js

### Case C: a new main-story chapter
Edit chapters.js CHAPTERS array. Use existing chapters as templates.
Each chapter is `{ id, title, subtitle, teaser, charId, play() }`.
The runEncounter() and runCard() helpers are already provided.

### Case D: a new ending variant for a character
Edit epilogues.js — add a new key to EPILOGUES[character]. Then
update routeEndingKey() for that character so it returns the new
key when appropriate conditions match. No other changes needed.

--------------------------------------------------------------------------
8. DEV PANEL (dev-panel.js)
--------------------------------------------------------------------------

To activate: append `?dev=1` to the game URL, OR triple-tap the
top-right corner of the screen.

### What it gives you
  - Overview tab: world flags + chapter progress
  - Characters tab: per-character affection sliders, TP choice
    buttons, force-meet, force-ending, champion toggle
  - Scenes tab: force-fire button for every auto-firing scene
  - Storage tab: raw localStorage dump + copy-to-clipboard

### How to disable
Click the "Disable" button in the header, OR run
`window.PPDev.disable()` in the console, OR delete the
`pp_dev_panel` localStorage key and reload.

### Public API
  window.PPDev.open()     — open the panel
  window.PPDev.close()    — close the panel
  window.PPDev.fire(id)   — fire a scene by id (see SCENES array)
  window.PPDev.setAffection(char, value)
  window.PPDev.setTP(char, choice)
  window.PPDev.disable()  — turn off the panel

--------------------------------------------------------------------------
9. SHIP-READINESS CHECKLIST
--------------------------------------------------------------------------

Before publishing a build to real users:

  [ ] Remove `?dev=1` from any default URL
  [ ] Delete `pp_dev_panel` from any demo save
  [ ] Verify `window.PP_PRODUCTION = true` OR hostname is NOT localhost
  [ ] Confirm payments-guard is active (check `PPPaymentsGuard.active`)
  [ ] Test on Android WebView for backdrop-filter degradation
  [ ] Bump SW CACHE_NAME on every new release
  [ ] Verify SW CORE_ASSETS includes every <script> in index.html

--------------------------------------------------------------------------
10. FUTURE WORK / KNOWN DEBT
--------------------------------------------------------------------------

### High-value, low-risk
  - [ ] Playtest one full route end-to-end (use dev panel to speed up)
  - [ ] Art direction pass: consistent style across all 7 characters
  - [ ] Voice-line recording pass (when ready): use the voice-direction
        headers in each character file as the casting brief

### High-value, medium-risk
  - [ ] Consolidate 15+ poll loops into a single scene-coordinator
        that accepts registrations (ambient-coordinator pattern,
        expanded). Would reduce battery drain on mobile and make
        scene-order debugging easier.
  - [ ] Migrate CHARACTER_ALISTAIR out of character.js into
        character-alistair.js for consistency with the other six.
  - [ ] CHARACTER_LYRA_FULL (in character.js) vs CHARACTER_LYRA
        (in character-lyra.js) — collision risk. Pick one.

### Medium-value, medium-risk
  - [ ] Write the actual final Aenor battle (currently ends on
        cliffhanger at the Weaver's Court). Use pp_weaver_champion
        to branch.
  - [ ] Art direction specifics: each character's select-portrait,
        body sprites per mood, scene backgrounds referenced by
        affection-scenes/crossovers.

### Low-value, low-risk (quality-of-life)
  - [ ] crossovers.js (legacy) appears to overlap with the new
        crossover-*.js files. Audit whether it's still needed.
  - [ ] endings.js (legacy pre-v2 epilogues) likely unused now.
        Audit and remove if safe.

--------------------------------------------------------------------------
CREDITS
--------------------------------------------------------------------------

Owner / creative director: the repo owner.
Writing, architecture, voice passes: collaborative with Claude across
multiple long sessions. The voice-direction headers at the top of each
character file are the canonical casting/writing briefs for all future
content.

Last updated: 2026-04-25.
