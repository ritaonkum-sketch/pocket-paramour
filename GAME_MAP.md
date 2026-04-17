# Pocket Paramour — GAME_MAP.md

One-stop reference to everything in the game. Ctrl+F friendly.

> All file paths below are relative to the project root `C:\Users\user\Desktop\New project!\Pocket-Paramour\` unless shown as absolute.

---

## 1. Character Overview Table

| Char | Title (in-game role) | Archetype / Basic Personality | Art Status | Unlock | Special Mechanics | Background |
|---|---|---|---|---|---|---|
| **Alistair** | *The Loyal Knight* / Captain of the Guard | Shy, earnest knight | **Full art** (28 body + 19 face sprites) | Default / always unlocked | Oath vs feeling arc; Peak-Arc forks (`alistairPhase`: distant / conflicted / unstable; `alistairPeakChoice`: duty / stay / reflect) | `bg-knight-room.png` |
| **Lyra** | *The Resonant Siren* / Voice of the Caves | Shy half-siren | **Full art** (69 body + 12 face sprites — richest set) | Default | Volatile emotional engine; siren stage gates (`sirenStageLines`: affection → resonant → unstable → monster); Lucien half-brother arc; Whale Arc; 3/7-day dayloop; Lucien-competition scenes | `bg-siren-cave.png` |
| **Caspian** | *The Gentle Prince* / Crown Prince | Gentle royal (shy/clingy/tsundere = gentle/devoted/possessive) | **Full art** (12 body + 8 face sprites) | Default | Comfort-loop trap (`comfortLevel` 0–100); `caspianPhase`: warm → devoted → possessive → released; court-etiquette training meter | `bg-caspian-palace.png` *(MISSING on disk — falls back to bedroom/day/night)* |
| **Elian** | *The Rogue Druid* / Warden of Thornwood | Stoic druid (stoic/protective/blunt) | **Full art** (11 body + 7 face sprites) | Default | `elianPhase`: assessing → testing → bonded → scorched; decisivenessScore (0-100) + foragingScore; "fewest words" bond style | `bg-elian-forest.png` |
| **Lucien** | *The Grand Mage* / Scholar of the Tower | Analytical mage (analytical/curious/obsessive) | **Full art** (51 body + 19 face sprites) | Default | `lucienPhase`: cold → curious → fascinated → obsessed → vulnerable; puzzle-based training (`puzzlesMastered`, `researchNotes`, `realityStability` 0-100); Lyra-sister subplot; reality-fracture corruption path | `bg-lucien-study.png` |
| **Proto** | *The Glitch* / Anomaly in the Wards | Curious AI (curious/chaotic/calculating) | **Full art** (10 body + 9 face sprites) | LOCKED — player must have switched characters 3+ times (`meta.characterSwitchCount >= 3`) | `protoPhase`: detected → aware → breaking → broken; `systemCommandsRun`, `protoGlitchIntensity` (0-100); meta-aware (sees save file, dev notes, other characters) | `bg-proto-void.png` |
| **Noir** | *The Corruptor* / Sealed Beneath | Seductive shadow (seductive/possessive/destructive) | **Full art** (10 body + 9 face sprites) | LOCKED — any ending seen OR any character save has `corruption > 50` | `noirPhase`: tempting → corrupting → consuming → merged; `noirCorruptionGlobal` — spreads to other characters cross-save | `bg-noir-void.png` |

Selector in `js/character.js` → `selectCharacter(id)` returns the correct `CHARACTER_*` object.

---

## 2. Per-Character Deep Dive

### 2.1 ALISTAIR — `js/character.js` (lines 3–843)

**Body sprites — `assets/alistair/body/` (28 files):**
`armor1.png, armor2.png, armor3.png, armor5.png, casual1.png, casual2.png, casual3.png, crossarms.png, cross-arms.png, default.png, fighting.png, fighting1.png, fighting2.png, gentle.png, happy.png, happy2.png, happy3.png, neutral.png, sad.png, sad1.png, sad2.png, sad3.png, sad-deep.png, shirtless.png, shirtless1.png, shirtless2.png, shirtless3.png, talk.png`

**Face sprites — `assets/alistair/face/` (19 files):**
`angry.png, angry2.png, annoyed.png, annoyed2.png, cheeky.png, crying.png, crying2.png, gentle.png, gentle2.png, happy.png, happy2.png, love.png, neutral.png, neutral2.png, sad.png, sad2.png, shy.png, sleeping.png, wink.png`

**Outfits (object):**
| Key | Name | Body |
|---|---|---|
| default | Knight Armor | `neutral.png` |
| casual1 | Red Tunic | `casual1.png` |
| casual2 | Leather Armor | `casual2.png` |
| shirtless | Off Duty | `shirtless.png` |
| corrupted | Dark Knight | `fighting2.png` |

**emotionToBody:**
- happy → happy, happy2, happy3, armor1
- love → happy2, gentle, armor2
- neutral → neutral, default, armor3, armor5
- gentle → gentle, neutral, armor2
- sad → sad1, sad2, sad
- crying → sad-deep, sad3
- angry → crossarms, fighting2
- furious → fighting1, fighting2, fighting
- shy → neutral, gentle, armor2
- wink → happy3, happy2
- sleeping → neutral, gentle
- corrupted → fighting2, crossarms, fighting1
- left → sad-deep, sad3

**actionToBody:**
- feed → happy, happy2, armor1
- wash → happy3, gentle, armor2
- gift → happy2, happy, armor1
- train → fighting, fighting1, fighting2
- talk → talk, neutral, gentle

**Personalities (`personalities`):** shy / clingy / tsundere — each with arrays for `talk/feed/wash/gift/train` (~10–15 lines each per personality, five actions = ~45 lines per personality × 3 = ~135+ personality lines).

**Story arc (phases):** `alistairPhase` ∈ {null, 'distant', 'conflicted', 'unstable'} and `alistairPeakChoice` ∈ {null, 'duty', 'stay', 'reflect'}.

**Key scenes in game.js (`_playAlistair*`):**
| Function | Line | Purpose |
|---|---|---|
| `_playAlistairScene1_Oath` | 7412 | Day-1 entry: the oath |
| `_playAlistairScene2_Cracks` | 7454 | Day-2: cracks in discipline |
| `_playAlistairScene3_MorningWatch` | 7485 | Day-3 morning watch |
| `_playAlistairScene4_Confession` | 7520 | Confession attempt |
| `_playAlistairScene5_TheLine` | 7583 | "The Line" moment |
| `_playAlistairPeakScene` | 7658 | Peak choice (duty / stay / reflect) |
| `_playAlistairDutyScene` | 9497 | Duty pull scene |
| `_playAlistairCorruptionScene` | 7935 | Corruption scene |
| `_playAlistairDutyEnding` | 7792 | Ending: he returns to king |
| `_playAlistairConflictedEnding` | 7838 | Ending: torn |
| `_playAlistairReflectEnding` | 7884 | Ending: reflective |
| `_playAlistairTrueBondEnding` | 7968 | True bond ending |
| `_playAlistairNeglectEnding` | 8039 | Neglected / lost ending |

---

### 2.2 LYRA — `js/character.js` (lines 846–1760, `CHARACTER_LYRA_FULL`)
(There is also a smaller legacy `CHARACTER_LYRA` object in `js/character-lyra.js` — **not selected by `selectCharacter`**; the code uses `CHARACTER_LYRA_FULL`.)

**Body sprites — `assets/lyra/body/` (69 files):**
`angry.png, bored1.png, bored2.png, casual1.png, casual2.png, corrupt1.png, corrupt2.png, corrupt3.png, depressed.png, dirty1.png, dirty2.png, eating1-4.png, eyes-closed.png, falllove2.png, falllove3.png, happy.png, hungry1.png, hungry2.png, kiss1-3.png, love.png, mermaid1-4.png, neutral.png, neutral1.png, pose2.png, pose3.png, pose4.png, power.png, power1-5.png, queen.png, sad.png, sad3.png, sad4.png, shy.png, shy1-3.png, shyhug1-2.png, sing1-4.png, singing.png, siren.png, sleepy1-2.png, splash1-3.png, starving1-2.png, verydirty1-2.png, wave.png, wave2.png, wavehappy.png, yawn1-2.png`

**Face sprites — `assets/lyra/face/` (12):**
`angry.png, happy.png, love.png, neutral.png, sad.png, shy.png, sleeping.png, sleepy.png, tired.png, wink.png, wink-love.png, yawn.png`

**Outfits (array):**
| id | name | body |
|---|---|---|
| siren | Siren Dress | neutral |
| casual1 | Ocean Breeze | casual1 |
| casual2 | Shore Walk | casual2 |
| queen | Siren Queen | queen |
| power | Resonance | power |

**emotionToBody:** happy → [happy, wave, wave2, wavehappy, shy1-3, shyhug1-2]; love → [love, falllove2, falllove3]; neutral → [neutral, pose2-4]; sad → [sad, sad3]; crying → [depressed, sad4]; angry/furious → [angry]; shy → [shy1-3, shyhug1-2]; wink → happy waves; corrupted → [corrupt1-3, depressed]; left → [depressed].

**actionToBody:** feed → [happy, eating1-4]; wash → [splash1-3, happy]; gift → [shy1-3, shyhug1-2, kiss1-3, falllove2-3]; train → [singing, power]; talk → [shy1-3, shyhug1-2, kiss1-3, falllove2-3]; sing → [singing, power].

**Personalities:** shy / clingy / tsundere (plus affection/corruption/neglected/unsettled/unstable state pools — very rich).

**Story arc:**
- Vertical-slice 3-day arc → Day-4-7 volatile loop → peak scenes (`_playPeakScene`, `_playHesitateFollowUp`, `_playFractureRecovery`, `_playLucienColdResolution`, `_playLyraClosingScene`)
- `sirenStageLines` thresholds: affection → resonant → unstable → monster
- **Lucien arc** (`lucienArc`): hint (aff ≥ 35) → pain (corruption milestone) → reveal (corr ≥ 66 or aff ≥ 70). Idle `lucienLines` surface after hint.
- **Whale Arc** (`whaleScore` ≥ 55 activates) — 4 parallel premium stages in `_playWhaleArcEntry`, `_playWhaleStage1..4`
- Personality path vectors: dependent / defensive / detached (soft > 60 / hard > 80)
- Meta system (`metaLevel` 0–5)

**Key scenes (on top of shared scene system):** `_playScene1_Entry..8_Climax`, `_playScene_Day4..7_Loop`, `_playDay3EndingA..C`, `_playTensionConfession`, `_playEmotionalDrift`, `_playFirstRupture`, `_playJealousyScene`, `_playReunionScene`, `_playPrivateMomentScene`, `_playAlmostConfessionScene`, `_playLucienScene`, `_playLucienInterruption`, `_playLucienCompetitionEvent`, `_playLucienConfrontation`.

---

### 2.3 CASPIAN — `js/character-caspian.js` (622 lines)

**Body sprites (`assets/caspian/body/` — 12):** `adoring.png, casual1.png, casual2.png, dancing.png, formal.png, gentle.png, hurt.png, melancholy.png, neutral.png, possessive.png, reading.png, tender.png`

**Face sprites (8):** `adoring.png, gentle.png, hurt.png, melancholy.png, neutral.png, possessive.png, sleeping.png, tender.png`

**Outfits:**
| default | Royal Attire | neutral |
| casual1 | Evening Silk | casual1 |
| casual2 | Garden Linen | casual2 |
| formal | Crown Prince | formal |
| corrupted | Possessive | possessive |

**emotionToBody:** happy → [gentle, adoring]; love → [adoring, tender]; neutral → [neutral, reading, formal]; sad → [melancholy, hurt]; angry → [hurt]; shy → [tender, gentle]; corrupted → [possessive]; sleeping → [reading].

**actionToBody:** feed → [gentle, neutral]; wash → [neutral, gentle]; gift → [adoring, tender]; train → [dancing, reading]; talk → [neutral, gentle, tender].

**Personalities:** shy (gentle) / clingy (devoted) / tsundere (possessive).

**Training:** Dance / Diplomacy / Poetry.

**Story arc (`caspianPhase`):** warm → devoted → possessive → released. **Comfort loop trap** via `comfortLevel` (0–100) — too much comfort triggers possessive/cage fork.

**Key scenes:** `_playCaspianWarmth` (8666), `_playCaspianDependency` (8694), `_playCaspianChoice` (8725), `_playCaspianComfortLoop` (8768), `_playCaspianGentleRelease` (8790), `_playCaspianUndecided` (8833).

---

### 2.4 ELIAN — `js/character-elian.js` (492 lines)

**Body sprites (`assets/elian/body/` — 11):** `calm.png, casual1.png, casual2.png, foraging.png, guarded.png, meditating.png, neutral.png, stern.png, tracking.png, warm.png, weathered.png`

**Face sprites (7):** `calm.png, guarded.png, neutral.png, sleeping.png, stern.png, warm.png, weathered.png`

**Outfits:** default=Forest Garb, casual1=Trail Worn, casual2=Camp Rest, formal=Elder's Robes, corrupted=Withered.

**emotionToBody:** happy → [calm, warm]; love → [warm]; neutral → [neutral, foraging]; sad → [weathered]; angry → [stern]; shy → [guarded]; corrupted → [stern]; sleeping → [calm].

**actionToBody:** feed → [calm, neutral]; wash → [neutral]; gift → [guarded, warm]; train → [foraging, tracking, meditating]; talk → [neutral, calm].

**Personalities:** shy (stoic) / clingy (protective) / tsundere (blunt).

**Training:** Herbs / Tracking / Meditation.

**Story arc (`elianPhase`):** assessing → testing → bonded → scorched. Decisiveness is scored.

**Key scenes:** `_playElianAssessment` (8215), `_playElianTest` (8232), `_playElianBond` (8251), `_playElianPeak` (8272), `_playElianClearing` (8298), `_playElianScorched` (8313), `_playElianRedemption` (8327), `_playElianTime` (8337), `_playElianAbandon` (8346).

---

### 2.5 LUCIEN — `js/character-lucien.js` (765 lines)

**Body sprites (`assets/lucien/body/` — 51):** see sprite list in §1 — full set including `corrupt1/2`, `glitch`, `obsessed`, `fascinated`, `vulnerable`, `casting`, `power1-4`, `splash1-5`, `shy1-3`, `eating1-4`, `starving1`, etc.

**Face sprites (19):** amused, blink, cheeky, cold, curious, distant, fascinated, gentle, love, neutral, obsessed, shy, sleeping, sleeping2, sleepy, tired, vulnerable, wink, yawn.

**Outfits:** default=Scholar Robes, casual1=Midnight Study, casual2=Tower Walk, formal=Grand Mage, corrupted=Fractured.

**emotionToBody:** happy → [amused, fascinated, gentle]; love → [fascinated, shy1-2]; neutral → [neutral, thinking, reading, bored1]; sad → [distant, vulnerable, hungry1]; angry → [cold, fighting1]; shy → [vulnerable, shy1-3]; corrupted → [obsessed, corrupt1-2]; sleeping → [sleepy1-2].

**actionToBody:** feed → [eating1-4]; wash → [splash1-4]; gift → [fascinated, curious, pleased, thanks]; train → [thinking, casting, power1]; talk → [talk, neutral, gentle, curious].

**Personalities:** shy (analytical) / clingy (curious→devoted) / tsundere (obsessive).

**Training:** Logic / Arcane / Memory (puzzle-based — feeds `puzzlesMastered`, `researchNotes`, `realityStability`).

**Story arc (`lucienPhase`):** cold → curious → fascinated → obsessed → vulnerable. Also: Lyra-sister reveal subplot, reality fracture corruption path, "human answer" love path.

**Key scenes:** `_playLucienObservation` (8864), `_playLucienMarginNotes` (8903), `_playLucienSister` (8946), `_playLucienFascination` (8993), `_playLucienConfession` (9035), `_playLucienPeak` (9122), `_playLucienRedemptionBeat` (9229), `_playLucienFractureBeat` (9247), `_playLucienVulnerableBeat` (9284), `_playLucienTimeBeat` (9330), `_playLucienAbandonBeat` (9348), `_playLucienColdResolution` (5446), `_playLucienScene` (3340), `_playLucienInterruption` (4139), `_playLucienCompetitionEvent` (4247), `_playLucienConfrontation` (5100).

---

### 2.6 PROTO — `js/character-proto.js` (657 lines)

**Body sprites (10):** `calm.png, casual1.png, casual2.png, curious.png, error.png, glitched.png, neutral.png, processing.png, scanning.png, unstable.png`

**Face sprites (9):** `calm.png, curious.png, error.png, glitched.png, neutral.png, processing.png, scanning.png, sleeping.png, unstable.png`

**Outfits:** default=Default Shell, casual1=Low Process, casual2=Debug Mode, formal=Compiled, corrupted=Stack Overflow.

**emotionToBody:** happy → [calm, curious]; love → [curious, calm]; neutral → [neutral, scanning, processing]; sad → [processing, glitched]; angry → [error, unstable]; shy → [scanning, calm]; corrupted → [unstable, glitched]; sleeping → [calm].

**actionToBody:** feed → [calm, neutral]; wash → [glitched, neutral]; gift → [curious, scanning]; train → [scanning, processing, unstable]; talk → [neutral, curious, scanning].

**Personalities:** shy (curious) / clingy (chaotic) / tsundere (calculating).

**Training:** Inspect / Modify / Override (increments `systemCommandsRun`).

**Story arc (`protoPhase`):** detected → aware → breaking → broken. Meta-aware (sees player save file, other character names, developer comments).

**Key scenes:** `_playProtoDetection` (8364), `_playProtoAwareness` (8383), `_playProtoBreaking` (8404), `_playProtoPeak` (8426), `_playProtoSystemBreak` (8447), `_playProtoContained` (8466), `_playProtoChoice` (8477).

---

### 2.7 NOIR — `js/character-noir.js` (668 lines)

**Body sprites (10):** `casual1.png, casual2.png, consuming.png, cruel.png, dominant.png, neutral.png, seductive.png, shadow.png, vulnerable.png, whisper.png`

**Face sprites (9):** `consuming.png, cruel.png, dominant.png, neutral.png, seductive.png, shadow.png, sleeping.png, vulnerable.png, whisper.png`

**Outfits:** default=Voidweave, casual1=Midnight Silk, casual2=Unraveled, formal=Obsidian Court, corrupted=Ascended.

**emotionToBody:** happy → [seductive, consuming]; love → [consuming, seductive]; neutral → [neutral, shadow]; sad → [shadow, vulnerable]; angry → [cruel, dominant]; shy → [whisper, vulnerable]; corrupted → [dominant, consuming]; sleeping → [shadow].

**actionToBody:** feed → [neutral, seductive]; wash → [neutral]; gift → [consuming, dominant]; train → [seductive, dominant, shadow]; talk → [neutral, whisper, seductive].

**Personalities:** shy (seductive) / clingy (possessive) / tsundere (destructive).

**Training:** Temptation / Domination / Dissolution.

**Story arc (`noirPhase`):** tempting → corrupting → consuming → merged. `noirCorruptionGlobal` spreads across the player's entire save universe.

**Key scenes:** `_playNoirTemptation` (8500), `_playNoirCorruption` (8519), `_playNoirConsuming` (8537), `_playNoirPeak` (8557), `_playNoirMerge` (8585), `_playNoirRedemption` (8602), `_playNoirLove` (8618), `_playNoirReject` (8634).

---

## 3. Story Structure Map

### 3.1 Soul Weaver Meta-Narrative (7 Memory Fragments)
Defined in `js/game.js:90-98`. Each character unlocks a fragment when affection level reaches 3 (`_checkMemoryFragment()` at line 8124).

| # | Character | Fragment Title | Fragment Text |
|---|---|---|---|
| 1 | alistair | **The Shield** | "A feeling of duty. Protecting someone. The weight of armor that wasn't yours." |
| 2 | lyra | **The Song** | "A melody surfaces... someone with ocean eyes taught it to you." |
| 3 | lucien | **The Pattern** | "Equations flash behind your eyes. You understood magic once." |
| 4 | caspian | **The Crown** | "A throne room. Not this one. You stood beside someone important." |
| 5 | elian | **The Root** | "Soil between your fingers. You healed a place once, not a person." |
| 6 | proto | **The Code** | "Your summoning wasn't random. Selection criteria: capacity for connection." |
| 7 | noir | **The Loss** | "A face in shadow. Someone who loved the last Soul Weaver." |

First unlock triggers `soulWeaverRevealed = true` and a cinematic containing the line **"You are a Soul Weaver."** (game.js:8153). All 7 unlocked → ending cinematic branch at line 8174.

### 3.2 Kingdom of Aethermoor Lore
World-intro beats (game.js:10099-10106), plays once, gated by `localStorage.pp_world_intro_seen`:
1. "The Kingdom of Aethermoor is dying."
2. "Its magic was sustained by bonds between its people. Those bonds are breaking."
3. "The last Soul Weaver is gone."
4. "In desperation, the kingdom's magic reached across worlds and found you."
5. "You arrived through the portal with no memory. Only an instinct to connect."
6. "Where you walk, the magic returns. Where you care, the Fading retreats."
7. "They found you. Now they won't let go."

**The Fading** = world-decay mechanic — the flavour name for corruption/decay spreading; tied to each character's bond. No explicit single kingdom-health meter; kingdom health is implied through per-character corruption levels plus `noirCorruptionGlobal`.

### 3.3 Storyday Progression (global `storyDay`)
| Day | Event | Scene |
|---|---|---|
| 1 | Warm welcome, intro scene | `_playScene1_Entry`, per-character intros in `intro.js` |
| 2 | Subtle "I notice you" | `_playScene2_Awareness` |
| 3 | First tension / Lucien interrupts / Day-3 ending branches | `_playScene3_Soften`, `_playScene4_Vulnerability`, `_playDay3EndingA/B/C` |
| 4 | False stability | `_playScene_Day4` |
| 5 | Subtle distance | `_playScene_Day5` |
| 6 | Jealousy spike | `_playScene_Day6_JealousySpike` |
| 7+ | Confrontation loop — can repeat | `_playScene_Day7_Loop` |

Surprises, crossovers, and dates all gate on `storyDay` (surprises require day ≥ 2, crossovers day ≥ 3, etc.).

### 3.4 Per-Character Arc Summaries
- **Alistair:** duty vs love → peak choice (duty/stay/reflect) → 5 endings.
- **Lyra:** shy waves → siren power → corruption spiral OR safe harbour; Lucien half-sibling reveal unlocks mid-arc.
- **Caspian:** warmth → devoted → possessive → choice (gentle-release vs golden-cage).
- **Elian:** assessing → testing → bonded → scorched. No big cinematics — payoffs in stillness.
- **Lucien:** cold → curious → fascinated → obsessed → vulnerable. Parallel reality-fracture corruption path.
- **Proto:** detected → aware → breaking → broken. Meta-aware ending (he can see the save file).
- **Noir:** tempting → corrupting → consuming → merged. Corruption leaks globally. Redemption possible.

---

## 4. Events Inventory — `js/events.js` (1524 lines, `RANDOM_EVENTS`)

**Total events: 78**

| Character | Count |
|---|---|
| Universal (no `character:` key) | 2 (`storm`, possibly `flower_field`) — see note |
| Alistair | 12 |
| Lyra | 12 |
| Lucien | 10 |
| Proto | 10 |
| Noir | 10 |
| Elian | 10 |
| Caspian | 10 |

Note: Early-section events (ids 1–14) without an explicit `character:` field typically default to Alistair context at runtime (his name string-interps via `${CHARACTER.name}`), though a handful (`storm`, etc.) are cross-character.

**Full event-id list (grouped):**

**Universal / early alistair-side:** `stray_cat`, `storm`, `nightmare`, `cooking`, `love_letter`, `training_ground`, `stargazing`, `festival`, `rain`, `wounded`, `gift_from_village`, `jealousy`, `birthday`, `flower_field`, `dark_whispers`, `broken_mirror` — first 16 events (some have `character:"alistair"` set, others don't).

**Lyra:** `beached_dolphin, tidal_wave, moonlit_singing, pearl_discovery, siren_call, shell_necklace, ocean_nightmare, coral_garden, dark_water, lyra_cooking, lyra_rival_siren, lyra_birthday`

**Lucien:** `lucien_experiment_gone_wrong, lucien_old_letter, lucien_rare_book, lucien_nightmare, lucien_lyra_memory, lucien_familiar, lucien_eclipse, lucien_cooking_disaster, lucien_ward_breach, lucien_stargazing`

**Proto:** `proto_data_corruption, proto_pattern_recognition, proto_memory_leak, proto_system_message, proto_render_glitch, proto_save_file, proto_other_characters, proto_timestamp, proto_developer_note, proto_void_walk`

**Noir:** `noir_shadow_whisper, noir_midnight_temptation, noir_dark_mirror, noir_others_weakness, noir_corruption_spread, noir_jealousy, noir_vulnerability, noir_power_gift, noir_confession, noir_final_form`

**Elian:** `elian_herb_gathering, elian_wolf_encounter, elian_campfire, elian_wounded_animal, elian_storm_shelter, elian_carved_token, elian_sunrise_watch, elian_old_campsite, elian_moonlit_pond, elian_teaching_moment`

**Caspian:** `caspian_royal_garden, caspian_midnight_tea, caspian_dance_lesson, caspian_old_portrait, caspian_crown_weight, caspian_poetry_fire, caspian_locked_wing, caspian_visiting_diplomat, caspian_servants_whisper, caspian_rain_courtyard`

**Gates:** every event has `minAffection` (0–5) and optional `character:`, some have `timeOfDay` or `minCorruption`. Most Proto/Noir events are gated by affection ≥ 2 and corruption conditions (grep inside `events.js` for per-event details).

---

## 5. Achievements Inventory — `js/achievements.js` (672 lines)

**Total: 82 achievements** (counted from `id:` occurrences).

**Early game:** first_meal, first_words, first_gift, squeaky_clean, sword_practice.

**Dedication:** caretaker (10 feed), master_chef (50), chatterbox (25 talk), soulmates (100), generous (25 gifts), knight_trainer (25 train), blade_master (50).

**Affection milestones:** familiar (lvl 1), close_bond (2), deep_affection (3), true_love (4), max_bond (100 bond).

**Personality:** shy_knight, clingy_knight, tsundere_knight.

**Time-of-day:** night_owl (after 11 PM), early_bird (before 7 AM).

**Grind:** dedicated_100, dedicated_500.

**Corruption path:** corruption_taste (25%), corruption_deep (75%), savior (revive after left).

**Misc general:** fashion (outfit change), full_stats (all 90+), all_actions (each 5×), pure_heart (max affection + 0 corruption).

**Lyra-specific (10):** lyra_cracked, lyra_attached, lyra_post_lucien, lyra_defied_lucien, lyra_cracked_under, lyra_loop_survived, lyra_second_loop, lyra_player_wins, lyra_tension_peak, lyra_sang_together.

**Alistair-specific (3):** alistair_arc_complete, alistair_true_bond, alistair_neglect.

**Lucien-specific (13):** lucien_first_puzzle, lucien_puzzle_adept, lucien_puzzle_master, lucien_research_notes, lucien_deep_research, lucien_observation, lucien_margin_notes, lucien_sister_revealed, lucien_fascinated, lucien_human_answer, lucien_fracture, lucien_reality_stable, lucien_night_owl, lucien_all_puzzles.

**Proto (5 — all secret):** proto_discovered, proto_commands, proto_aware, proto_edge, proto_glitch.

**Noir (6 — mostly secret):** noir_unlocked, noir_shadow_arts, noir_corruption_high, noir_vulnerable, noir_consumed, noir_redeemed.

**Elian (5 — mostly secret):** elian_first_forage, elian_survivalist, elian_decisive, elian_trust, elian_silent_bond.

**Caspian (6):** caspian_first_waltz, caspian_court_poet, caspian_royal_guest, caspian_comfort_trap, caspian_gentle_release, caspian_devoted.

Each has a `check: (g) => ...` predicate. Many are `secret: true` (Proto/Noir/Elian mostly).

---

## 6. Gallery / Cards Inventory — `js/gallery.js` (940 lines)

**Total: 62 cards.**

| Prefix | Count |
|---|---|
| Lyra | 22 |
| Lucien | 10 |
| Caspian | 8 |
| Alistair | 6 (+ 4 older single-word ids below) |
| Elian | 6 |
| Alistair misc (loyal-knight, silver-bulwark, battle-ready, golden-guardian, quiet-evening, heart-unveiled, true-form, first-meeting) | 8 (Alistair-themed w/o prefix) |
| devoted-caretaker / streak-flame | 2 generic milestones |

**Rarity breakdown (by `rarity:`):** common / uncommon / rare / legendary / **premium** (14 premium cards — paid).

**Premium cards (need purchase + art):**
- `alistair-private-moment` "Behind Closed Doors"
- `alistair-oath-broken` "The Oath Bent"
- `alistair-dawn` "First Light"
- `lyra-private-song` "The Song No One Hears"
- `lyra-siren-form` "True Form"
- `lyra-moonlit` "Moonlit Surface"
- `lucien-confession-premium` "The Failed Equation"
- `lucien-midnight-study` "3 AM in the Tower"
- `caspian-private` "Behind Palace Doors"
- `caspian-moonlight` "Moonlit Balcony"
- plus 4 more scattered

**Notable card images currently use existing body sprites as placeholders** (e.g. `lyra-lucien-resolved` uses `lyra/body/power.png`). The 8 files in `assets/gallery/` (`card-armor2/3/4.png, card-bedroom.png, card-bedroom2.png, card-fullbody.png, card-knight.png, card-portrait.png`) are a starter set — mostly Alistair-themed.

**Unlock types:** `unlock.type` = "scene" (condition text), "stat" (threshold), or "achievement". Full condition strings are in gallery.js at each card.

---

## 7. Cinematic Scenes Map

Located in `js/game.js`. Engine entry point: `_playScene(beats, onComplete)` at line 2665. Every cinematic is a list of `beat` objects (line / choice / particle / fade / show / hide / stage).

| Scene function | Line | Context |
|---|---|---|
| `_playStage2Scene` | 3028 | Siren stage 2 transition (Lyra) |
| `_playStage3Scene` | 3057 | Siren stage 3 transition (Lyra) |
| `_playCorruptedEnding` | 3101 | Lyra corruption ending |
| `_playRedemptionBreakthrough` | 3170 | Lyra redemption scene |
| `_playTrueBondEnding` | 3223 | Lyra true-bond ending |
| `_playLostEnding` | 3291 | Character-left / lost ending (Lyra) |
| `_playLucienScene` | 3340 | Lucien confrontation w/ Lyra |
| `_showDailyReturnLine` | 3549 | Daily return line (generic) |
| `_showAlistairDailyReturnLine` | 3631 | Alistair daily return |
| `_showLastLine` | 3747 | Final line (pre-departure) |
| `_playLucienInterruption` | 4139 | Lucien mid-session interrupt |
| `_playLucienCompetitionEvent` | 4247 | Lucien competition event |
| `_playScene1_Entry` | 4488 | Day-1 entry scene |
| `_playScene2_Awareness` | 4522 | Day-2 awareness |
| `_playScene_Day4` | 4546 | Day-4 false stability |
| `_playScene_Day5` | 4625 | Day-5 distance |
| `_playScene_Day6_JealousySpike` | 4688 | Day-6 jealousy spike |
| `_playScene_Day7_Loop` | 4772 | Day-7 loop / reset |
| `_playPeakScene` | 4865 | Lyra peak |
| `_playLucienConfrontation` | 5100 | Lucien confrontation extended |
| `_playLyraClosingScene` | 5209 | Lyra closing |
| `_playHesitateFollowUp` | 5290 | Hesitate branch |
| `_playFractureRecovery` | 5364 | Fracture recovery branch |
| `_playLucienColdResolution` | 5446 | Lucien cold resolution |
| `_playScene2_Reaction` / `3_Soften` / `4_Vulnerability` / `6_Dependency` / `7_Conflict` / `8_Climax` | 5519–5662 | Vertical-slice 3-day beat scenes |
| `_playDay3EndingA/B/C` | 5712, 5742, 5764 | Day-3 branching endings |
| `_playTensionConfession` | 6261 | Premium teaser |
| `_playEmotionalDrift` | 6383 | Repeatable drift scene (24h cooldown) |
| `_playFirstRupture` | 6503 | Suffocation peak |
| `_playWhaleArcEntry` | 6644 | Whale arc entry |
| `_playWhaleStage1` / `2` / `3` / `4` | 6687, 6776, 6865, 6957 | Whale premium stages |
| `playJealousyScene` | 7056 | Jealousy scene |
| `playReunionScene` | 7098 | Reunion (time-away gated) |
| `playPrivateMomentScene` | 7138 | Private moment |
| `playAlmostConfessionScene` | 7184 | "Almost confession" |
| `_playAlistair*` scenes | 7412–8101 | Alistair arc (see §2.1) |
| `_playElian*` scenes | 8215–8346 | Elian arc (see §2.4) |
| `_playProto*` scenes | 8364–8477 | Proto arc (see §2.6) |
| `_playNoir*` scenes | 8500–8644 | Noir arc (see §2.7) |
| `_playCaspian*` scenes | 8666–8833 | Caspian arc (see §2.3) |
| `_playLucien*` scenes | 8864–9373 | Lucien arc (see §2.5) |
| `_playAlistairDutyScene` | 9497 | Alistair duty pull |
| Memory Fragment cinematic | 8124–8200 | Soul Weaver reveal on each fragment unlock (`_checkMemoryFragment`) |

A rough total: **~85 discrete `_playScene` call sites** across game.js; approximate beat counts per scene range 4–25.

---

## 8. Endings Map

Persisted in `meta.endingsSeen` (localStorage `pocketLoveMeta`). Triggers `endingPlayed` state on the active save.

| Character | Ending Key | Trigger / Function |
|---|---|---|
| Alistair | `alistairDuty` | `_playAlistairDutyEnding` 7792 |
| Alistair | `alistairConflicted` | `_playAlistairConflictedEnding` 7838 |
| Alistair | `alistairReflect` | `_playAlistairReflectEnding` 7884 |
| Alistair | `alistairTrueBond` | `_playAlistairTrueBondEnding` 7968 |
| Alistair | `alistairNeglect` | `_playAlistairNeglectEnding` 8039 (character leaves) |
| Lyra | `trueBond` | `_playTrueBondEnding` 3223 |
| Lyra | `lost` | `_playLostEnding` 3291 |
| Lyra | `corrupted` | `_playCorruptedEnding` 3101 |
| Lyra | `redemption` | `_playRedemptionBreakthrough` 3170 |
| Elian | `elianClearing` | `_playElianClearing` 8298 (bond) |
| Elian | `elianScorched` | `_playElianScorched` 8313 (corruption) |
| Elian | `elianAbandoned` | `_playElianAbandon` 8346 |
| Proto | `protoBreak` | `_playProtoSystemBreak` 8447 |
| Proto | `protoBeyond` | `_playProtoChoice` 8477 (beyond edge) |
| Proto | `protoContained` | `_playProtoContained` 8466 |
| Noir | `noirMerge` | `_playNoirMerge` 8585 |
| Noir | `noirRedemption` | `_playNoirRedemption` 8602 |
| Noir | `noirLove` | `_playNoirLove` 8618 |
| Noir | `noirRejected` | `_playNoirReject` 8634 |
| Caspian | `caspianRelease` | `_playCaspianGentleRelease` 8790 |
| Caspian | `caspianCage` | via `_playCaspianComfortLoop` 8768 |
| Caspian | `caspianDevoted` | `_playCaspianChoice` 8725 |
| Lucien | `lucienFracture` | `_playLucienFractureBeat` 9247 (reality broken) |
| Lucien | `lucienVulnerable` | `_playLucienVulnerableBeat` 9284 ("human answer") |
| Lucien | `lucienAbandoned` | `_playLucienAbandonBeat` 9348 |

**Shared personality-path endings (Lyra):** `path_ending_dependent / defensive / detached` — based on the `lyraPersonality` vector.

**Soul Weaver ending:** triggered when all 7 fragments unlocked (game.js:8174) — shared meta ending across saves.

---

## 9. Date Locations Map — `js/dates.js` (1220 lines)

**21 locations, 3 per character.**

| # | id | Character | minAff / minDay | Scene description |
|---|---|---|---|---|
| 1 | `alistair_courtyard` | alistair | 2 / 2 | Castle Courtyard — walk the sun-warmed stones. |
| 2 | `alistair_training` | alistair | 3 / 4 | Training Grounds — he teaches you the sword. |
| 3 | `alistair_ramparts` | alistair | 5 / 6 | Sunset Ramparts — where the sky burns gold. |
| 4 | `lyra_tidepools` | lyra | 2 / 2 | Tide Pools — glowing pools that remember the moon. |
| 5 | `lyra_moonlit_shore` | lyra | 3 / 4 | Moonlit Shore — silver sand under a pale moon. |
| 6 | `lyra_grotto` | lyra | 5 / 6 | Underwater Grotto — her secret place beneath the waves. |
| 7 | `lucien_library` | lucien | 2 / 2 | Tower Library — dusty tomes and old ink. |
| 8 | `lucien_stargazing` | lucien | 3 / 4 | Stargazing Balcony — silver and indigo. |
| 9 | `lucien_leyline` | lucien | 5 / 6 | Ley Line Nexus — where raw magic hums beneath your feet. |
| 10 | `caspian_garden` | caspian | 2 / 2 | Palace Garden — roses climbing the walls. |
| 11 | `caspian_gallery` | caspian | 3 / 4 | Royal Gallery — portraits of kings who came before. |
| 12 | `caspian_passage` | caspian | 5 / 6 | Secret Passage — a hidden path away from everything. |
| 13 | `elian_clearing` | elian | 2 / 2 | Forest Clearing — dappled light through ancient canopy. |
| 14 | `elian_waterfall` | elian | 3 / 4 | Hidden Waterfall — mist and stone, deep in the wood. |
| 15 | `elian_grove` | elian | 5 / 6 | Ancient Grove — sacred trees older than the kingdom. |
| 16 | `proto_debug` | proto | 2 / 2 | Debug Room — glitchy abstract digital space. |
| 17 | `proto_archive` | proto | 3 / 4 | Memory Archive — where shared memories are stored. |
| 18 | `proto_core` | proto | 5 / 6 | Core Chamber — Proto's innermost code laid bare. |
| 19 | `noir_shadow_garden` | noir | 2 / 2 | Shadow Garden — flowers that bloom in darkness. |
| 20 | `noir_mirror_hall` | noir | 3 / 4 | Mirror Hall — reflections of what could have been. |
| 21 | `noir_seal` | noir | 5 / 6 | The Seal — where darkness is bound; where truth lives. |

Each location provides a `beats` sequence, bond/affection `effects` payload, a `bgGradient` (no image required — gradient fallback), and a `memoryKey`. Locations use gradient backgrounds, NOT image files — so no missing bg assets here.

---

## 10. Backgrounds Inventory — `assets/bg-*.png`

**All 29 background files on disk:**

| File | Used by |
|---|---|
| `bg-knight-room.png` | Alistair default (`CHARACTER.background`) |
| `bg-caspian-bedroom.png` | Caspian night (time-of-day swap in game.js 10306, ui.js 150) |
| `bg-caspian-day.png` | Caspian day |
| `bg-caspian-intro.png` | Caspian intro.js cutscene |
| `bg-caspian-night.png` | Caspian evening |
| `bg-elian-forest.png` | Elian default |
| `bg-elian-intro.png` | Elian intro.js |
| `bg-lucien-bedroom.png` | Lucien late-night time-of-day |
| `bg-lucien-evening.png` | Lucien evening |
| `bg-lucien-intro.png` | Lucien intro.js |
| `bg-lucien-night.png` | Lucien day (name inverted — `day < 18` → night.png — see ui.js:156) |
| `bg-lucien-study.png` | Lucien default |
| `bg-lyra-bond1.png` to `bond4.png` | Lyra staged bond backgrounds (progression — check ui.js:2405+) |
| `bg-lyra-cliff.png` / `bg-lyra-cliff-power.png` | Lyra peak / power scenes (ui.js:2479, 2535) |
| `bg-lyra-day.png` / `evening.png` / `night.png` | Lyra time-of-day |
| `bg-lyra-intro.png` | Lyra intro.js |
| `bg-lyra-ocean.png` | Lyra ocean scene (ui.js:2405) |
| `bg-noir-intro.png` | Noir intro |
| `bg-noir-void.png` | Noir default |
| `bg-proto-intro.png` | Proto intro |
| `bg-proto-void.png` | Proto default |
| `bg-siren-cave.png` | Legacy Lyra (CHARACTER_LYRA.background — unused after LYRA_FULL switch) |
| `bg-world.png` | Possibly world-intro splash |

**REFERENCED BUT MISSING ON DISK:**
- `assets/bg-caspian-palace.png` — set as Caspian's default background (character-caspian.js:145), but file does not exist. In practice the time-of-day swap system overrides it before display, so Caspian never shows a broken image, but the declared path is broken.

**No Alistair time-of-day variants** — Alistair only has `bg-knight-room.png`. Time-of-day logic only swaps for Lyra / Lucien / Caspian.

---

## 11. Touch / Talk Choices / Surprises / Crossovers Inventory

| System | File | Per-character counts | Total |
|---|---|---|---|
| **Touch** (3 zones: head/face/hand) | `js/touch.js` | 3 zones × 7 chars = 21 zone-sets; each with multiple reactions | 21 zone definitions |
| **Talk-choices** (branching responses) | `js/talk-choices.js` | 8 per char × 7 chars | **56 scenarios** |
| **Surprises** (unprompted idle moments) | `js/surprises.js` | 5 per char × 7 chars | **35 surprises** |
| **Crossovers** (rival character appearances) | `js/crossovers.js` | Alistair 2, Lyra 1, Caspian 1, Elian 2, Lucien 2, Proto 1, Noir 1 | **10 crossovers** |

### Talk-choice scenario IDs (`js/talk-choices.js`)

**Alistair (8):** `alistair_patrol_talk, alistair_duty_conflict`, + 6 more (see file).

**Per character, 8 scenarios each:** alistair_*, lyra_*, caspian_*, elian_*, lucien_*, proto_*, noir_*. Triggered via 30% chance on talk action (`CHOICE_CHANCE = 0.30`).

### Surprises (5/char): idle-triggered — 25s idle threshold, 25% chance, 8h cooldown, `storyDay ≥ 2` and affection ≥ 1 gates.

### Crossovers: 90s poll, 20s idle, 15% chance, 7-day cooldown; requires `storyDay ≥ 3` and affection ≥ 2. Visitors appear from other characters the player has saved data for.

### Touch zones: head (always), face (gated by `affectionLevel ≥ 3`), hand (gated by `affectionLevel ≥ 3`). 8s cooldown.

---

## 12. Asset Status Summary

### ✅ Fully arted characters (body + face sprites present)
All 7 — **no 1×1 placeholders detected** in body/face directories. Sprite counts:

| Char | Body sprites | Face sprites | Select portrait | Chibi | Extras |
|---|---|---|---|---|---|
| Alistair | 28 | 19 | ✓ | — | — |
| Lyra | **69** | 12 | ✓ | ✓ chibi.png | bg-ruins.png |
| Caspian | 12 | 8 | ✓ | — | — |
| Elian | 11 | 7 | ✓ | — | — |
| Lucien | 51 | 19 | ✓ | — | — |
| Proto | 10 | 9 | ✓ | ✓ chibi.png | — |
| Noir | 10 | 9 | ✓ | ✓ chibi.png | — |

### 🔴 Missing / needed
- **`assets/bg-caspian-palace.png`** — referenced in character-caspian.js:145 but **file absent**. Harmless because TOD swap overrides, but the declared default is broken.
- **Premium card art** — 14 `rarity: "premium"` cards in gallery.js currently reuse existing body sprites as placeholders. Proper CG art needed for:
  - `alistair-private-moment`, `alistair-oath-broken`, `alistair-dawn`
  - `lyra-private-song`, `lyra-siren-form`, `lyra-moonlit`
  - `lucien-confession-premium`, `lucien-midnight-study`
  - `caspian-private`, `caspian-moonlight`
  - + ~4 more premium cards embedded throughout gallery.js
- **Date backgrounds** — all 21 dates use CSS `bgGradient` strings (no image files expected). Optional enhancement: supply real backgrounds.
- **Standalone BG art for Alistair time-of-day** — currently only `bg-knight-room.png`; could add day/night variants for parity with Lyra/Lucien/Caspian.

### Standalone face-emotion PNGs in `assets/` (shared / emoji-style)
`angry-soft-1/2.png, angry-super-1/2.png, cheeky-shy.png, eyes-close.png, neutral-1/2.png, sad-1/2/3.png, sad-tears-1/2.png, smile-1/2.png, smile-closed-1/2.png, smile-shy.png, wink.png, wink-heart.png` — 17 small generic face reactions, likely used for cross-character emotion pops.

### Audio inventory — `assets/audio/` (35 files)

**BGM (5 tracks):**
- `bgm-calm.mp3`, `bgm-night.mp3`, `bgm-tense.mp3`, `bgm-corrupted.mp3`, `bgm-romantic.mp3` (mood-driven; switched by bgm.js)

**SFX (~30):** achievement, blip, breathe, card-flip, card-sparkle, chime, clash, crystal-resonance, dark-drone, digital-static, electric-surge, fanfare, fireplace-crackle, forest-crickets, gift-chime, heartbeat, legendary-fanfare, magic-hit, mermaid-hum, munch, notification, ocean-wave, pop, rarity-chime, scene-dramatic, scene-grand, siren-hum, splash, swoosh, thud.

### Gallery `assets/gallery/` (8 starter cards)
`card-armor2/3/4.png, card-bedroom.png, card-bedroom2.png, card-fullbody.png, card-knight.png, card-portrait.png` — all Alistair-themed. No per-character gallery images for the other 6 yet; they reuse body-sprite paths.

---

## 13. Understanding the Flow

### 13.1 Screen progression (`index.html` + `game.js:10087+`)
1. **Title screen** (`#title-screen`) — tap Start.
2. **World intro** (`#world-intro`) — plays ONCE, 7 beats about Aethermoor / Soul Weaver. Gated by `localStorage.pp_world_intro_seen`.
3. **Character select** (`#select-screen`) — grid of 7 cards. Proto/Noir cards are `select-card-locked` silhouettes until unlock conditions met (see §1). Clicking a locked card just pops sound, no action. Save indicators (❤️) show on cards with existing save.
4. **Loading screen** (`#loading-screen`) — per-character portrait + rotating tips.
5. **Per-character intro scene** (`js/intro.js` — `INTRO_SCENES[charId]`) — first launch of that character only, stored as `seenIntro_<charId>`.
6. **Name input** (inside game container) — player types name, saved as `playerName`.
7. **Main game** (`#game-container`) — stats bar (Hunger/Clean/Bond), corruption indicator (when active), time-of-day overlay, action buttons, character sprite, tap zones, etc.

### 13.2 Character switching
- "Switch Character" button reloads to select screen.
- Each character has its own save: `pocketLoveSave_<charId>` (JSON blob — entire game state including emotion engine, phases, scene library, memoryFragments, choiceMemory, eventFlags, whale arc state).
- Cross-character meta save: `pocketLoveMeta` — contains `characterSwitchCount`, `endingsSeen` (object), `hasPlayedBefore`, per-character completion flags (`elianCompleted`, `protoCompleted`, etc.), `lastPlayedCharacter`, `fragmentsUnlocked`, `soulWeaverRevealed`.
- Memory fragments and Soul Weaver reveal state are persisted to meta so progress carries across characters (fragments unlocked by any character stay unlocked).

### 13.3 Save system (localStorage keys)
| Key | Contents |
|---|---|
| `pocketLoveSave_alistair` | Full save JSON for Alistair |
| `pocketLoveSave_lyra` | Full save for Lyra |
| `pocketLoveSave_caspian` | Full save for Caspian |
| `pocketLoveSave_elian` | Full save for Elian |
| `pocketLoveSave_lucien` | Full save for Lucien |
| `pocketLoveSave_proto` | Full save for Proto |
| `pocketLoveSave_noir` | Full save for Noir |
| `pocketLoveMeta` | Cross-save meta: endingsSeen, fragmentsUnlocked, switchCount, etc. |
| `pp_world_intro_seen` | `"1"` once world intro watched |
| `pl_session_meta` | `{date, count}` daily session counter |
| `pp_seen_choices_session` | Talk-choice scenarios seen this session |
| `pl_events` | Rolling event log (analytics) |
| `pp_last_surprise_time` | Timestamp for surprise cooldown |
| `pocketlove_sfx_vol` / `pocketlove_bgm_vol` | Audio volumes |
| `seenIntro_<charId>` | Per-character intro-seen flag |

Save payload serialized from `game.js:9689-9707` includes: all stats (hunger/clean/bond/affection/corruption), emotion engine (trust/obsession/fear), all phase trackers (alistairPhase/lyraPersonality/caspianPhase/etc.), scene library, choice memory, whale arc state, memory fragments, outfit, streak.

---

## Quick reference — file locations

| Concern | File |
|---|---|
| Core engine / tick loop / scene player | `js/game.js` |
| Alistair definition + shared selector | `js/character.js` |
| Lyra definition (active) | `js/character.js` (`CHARACTER_LYRA_FULL`, line 846+) |
| Legacy Lyra (unused) | `js/character-lyra.js` |
| Caspian | `js/character-caspian.js` |
| Elian | `js/character-elian.js` |
| Lucien | `js/character-lucien.js` |
| Proto | `js/character-proto.js` |
| Noir | `js/character-noir.js` |
| Random events | `js/events.js` |
| Achievements | `js/achievements.js` |
| Gallery / cards | `js/gallery.js` |
| Dates (21 locations) | `js/dates.js` |
| Per-character intro cutscenes | `js/intro.js` |
| Touch zones | `js/touch.js` |
| Talk choices | `js/talk-choices.js` |
| Surprises | `js/surprises.js` |
| Crossovers | `js/crossovers.js` |
| Dialogue pool router | `js/dialogue.js` |
| Greetings | `js/greetings.js` |
| Idle life / letter | `js/idle-life.js`, `js/letter.js` |
| Puzzles (Lucien) | `js/puzzles.js` |
| UI / stage rendering | `js/ui.js` |
| Sounds (SFX) | `js/sounds.js` |
| BGM | `js/bgm.js` |
| Analytics | `js/analytics.js` |
| First-session UX | `js/first-session.js` |
| Payments stub | `js/payments.js` |
| A/B bandit | `js/bandit.js` |
| Daily rewards | `js/daily-rewards.js` |
| Day progress | `js/day-progress.js` |
| Remote config | `js/remote-config.js` |
| Button locks | `js/button-locks.js` |
| Action feedback | `js/action-feedback.js` |
| UI feel polish | `js/ui-feel.js` |

Total JS: **~31,000 lines across 35 files**.
