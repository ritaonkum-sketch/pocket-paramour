// Core game engine

class PocketLoveGame {
    constructor(characterId) {
        // Character must be set before load() is called in init()
        this.selectedCharacter = characterId || 'alistair';

        // Stats
        this.hunger = 100;
        this.clean = 100;
        this.bond = 50;
        this.corruption = 0;

        // Affection
        this.affection = 0;
        this.affectionLevel = 0;

        // Memory
        this.timesFed = 0;
        this.timesWashed = 0;
        this.timesTalked = 0;
        this.timesGifted = 0;
        this.timesTrained = 0;
        this.lastInteractionTime = Date.now();

        // Personality scores
        this.talkScore = 0;
        this.careScore = 0;
        this.irritationScore = 0;

        // State
        this.personality = "shy";
        this.corruptionState = "pure";
        this.sirenStage = "fragile";   // Lyra only: fragile | affection | resonant | unstable | monster
        this.tension = 0;              // Lyra only: emotional escalation 0-100
        this.tensionStage = 0;         // 0=calm, 1=off, 2=instability, 3=break
        this.redemption = 0;           // Lyra only: recovery counter after corrupted ending
        this.endingPlayed = null;      // which ending fired: null | "corrupted" | "bond" | "lost"
        this.cinematicFlags = {
            stage2Played: false,
            stage3Played: false,
            corruptedEndingPlayed: false,
            redemptionUnlocked: false,
            redemptionBreakthroughPlayed: false,
            lucienPlayed: false,
            trueBondPlayed: false,
            lostEndingPlayed: false,
            alistairTrueBondPlayed:        false,
            alistairNeglectPlayed:         false,
            alistairCorruptionScenePlayed: false,
            alistairPeakPlayed:            false,   // Peak: duty vs stay choice
            alistairDutyEndingPlayed:      false,   // Ending: he left
            alistairConflictedEndingPlayed:false,   // Ending: he stayed and broke
            alistairReflectEndingPlayed:   false,   // Ending: unresolved / human
            // ── Endgame arc ───────────────────────────────────────────────
            peakScenePlayed:              false,  // Attachment or Fracture peak moment
            lucienConfrontationPlayed:    false,  // Final Lucien resolution (after peak)
            closingScenePlayed:           false,  // Arc seal — quiet final beat Day 8+
            hesitateFollowUpPlayed:       false,  // 24h follow-up after player hesitated
            fractureRecoveryPlayed:       false,  // Recovery beat after peak break outcome
            lucienColdResolutionPlayed:   false   // Lucien close for non-commit players
        };
        // Player behaviour profile — drives personality variant + meta memory
        this.playerProfile = { care: 0, talk: 0, train: 0, ignore: 0 };
        this.tensionMultiplier = 1.0;  // boosted to 1.2 after Lucien confrontation
        this.memoryLeakShown   = false; // New Game+ memory leak line shown once per session
        this.dailyLineShown    = false; // Day-progression line shown once per session
        this._ignoreTickCounter = 0;    // throttle ignore increments (once/minute)
        // ── Lyra Phase System ────────────────────────────────────────────
        this.lyraPhase       = 'cold';  // cold | cracked | attached | postLucien
        // ── Lucien Rival System ──────────────────────────────────────────
        this.lucienInfluence = 0;       // 0-100: emotional pressure he exerts
        this.lucienActive    = false;   // unlocked after lucienPlayed scene fires
        this._lastLucienInterrupt = 0;  // timestamp cooldown for talk interruptions
        this._lucienEventOutcome  = null; // 0=defied / 1=pushed back / 2=cracked
        this.day47LoopCount       = 0;   // increments each time Day 7 loop resets
        // ── Player vs Lucien tug-of-war ──────────────────────────────
        this.playerInfluence = 0;       // 0-100: emotional weight player has built
        // ── Session-end last-line guard ──────────────────────────────────
        this._lastLineShown  = false;
        this._alistairLastProgressionDay = 0;
        // ── Alistair Duty Tension ──────────────────────────────────────
        this.dutyTension   = 0;     // 0-100: king's call pulling him away
        this.dutyCallFired = false; // true once the duty cinematic has played
        // ── Alistair Peak Arc ──────────────────────────────────────────
        this.alistairPhase      = null;  // null | 'distant' | 'conflicted' | 'unstable'
        this.alistairPeakChoice = null;  // null | 'duty' | 'stay' | 'reflect'
        // ── Soul Weaver Memory Fragments ───────────────────────────────
        // Each character unlocks a different piece of the player's past
        this.memoryFragments = {
            alistair: { unlocked: false, title: "The Shield", text: "You remember... a feeling of duty. Protecting someone. The weight of armor that wasn't yours." },
            lyra:     { unlocked: false, title: "The Song", text: "A melody surfaces. You hummed it in another life. Someone taught it to you... someone with ocean eyes." },
            lucien:   { unlocked: false, title: "The Pattern", text: "Equations flash behind your eyes. You understood magic once. Deeply. The symbols feel like a language you forgot." },
            caspian:  { unlocked: false, title: "The Crown", text: "A throne room. Not this one. Somewhere warmer. You stood beside someone important. You were important too." },
            elian:    { unlocked: false, title: "The Root", text: "Soil between your fingers. A forest that spoke to you. You healed something once \u2014 not a person. A place." },
            proto:    { unlocked: false, title: "The Code", text: "A flash of data. Your summoning wasn't random. Someone \u2014 something \u2014 chose you specifically. The selection criteria: capacity for connection." },
            noir:     { unlocked: false, title: "The Loss", text: "A face in shadow. Someone who loved the last Soul Weaver. Someone who broke when they died. Someone who is still here... waiting." }
        };
        this.fragmentsUnlocked = 0;
        this.soulWeaverRevealed = false; // true after first fragment unlocks

        // ── Elian Playable State ─────────────────────────────────────────
        this.elianPhase         = null;   // null | assessing | testing | bonded | scorched
        this.decisivenessScore  = 50;     // 0-100: how fast player makes choices
        this.foragingScore      = 0;
        // ── Proto Playable State ────────────────────────────────────────
        this.protoPhase         = null;   // null | detected | aware | breaking | broken
        this.systemCommandsRun  = 0;
        this.protoGlitchIntensity = 0;    // 0-100
        // ── Noir Playable State ─────────────────────────────────────────
        this.noirPhase          = null;   // null | tempting | corrupting | consuming | merged
        this.noirCorruptionGlobal = 0;    // cross-character corruption spread
        // ── Caspian Playable State ──────────────────────────────────────
        this.caspianPhase       = null;  // null | warm | devoted | possessive | released
        this.comfortLevel       = 0;     // 0-100: comfort trap mechanic
        this.courtEtiquetteScore = 0;    // training milestone tracker
        // ── Lucien Playable State (when playing AS Lucien) ──────────────
        this.lucienPhase        = 'cold'; // cold | curious | fascinated | obsessed | vulnerable
        this.puzzlesMastered    = 0;
        this.researchNotes      = 0;      // trust-analog: shared knowledge grows over time
        this.realityStability   = 100;    // below 30 = ambient glitch effects on UI
        this.sessionStart = Date.now();
        this.sessionTalk  = 0;
        this.sessionFeed  = 0;
        this.sessionGift  = 0;
        this.sessionTrain = 0;
        this.characterLeft = false;
        this.isGameOver = false;
        this.revivedOnce = false;
        this.currentOutfit = "knight";
        this.timeOfDay = "day";

        // Milestones
        this.triggeredMilestones = [];
        this.storyMilestonesShown = [];

        // ── Hidden emotional engine ──────────────────────────────
        // Never shown to the player — drives dialogue tone + event triggers
        this.emotion = { trust: 10, obsession: 0, fear: 0 };
        this.lastAction          = null;
        this._actionLog          = [];    // rolling window for fatigue detection
        this._microLog           = [];    // true/false per interaction — micro-dissonance history
        this._lastEchoAt         = 0;    // _microLog.length when last pattern echo fired
        this.lastEmotionalState  = "neutral";
        this.neglectLevel        = 0;
        this.recentNeglect       = false;

        // Injected emotional events (comfort / tension / rare)
        this.eventFlags = {
            lastEventTime: 0,
            cooldown:      90000   // min 90s between injected events
        };

        // Branching memory — player choices echo in future dialogue
        this.choiceMemory = {
            confessedBack:           false,
            hesitatedConfession:     false,
            reassuredAfterBreak:     false,
            stayedSilentAfterBreak:  false
        };

        // Scene library — tracks which story moments have played
        this.sceneLibrary = {
            almost_confession:    { triggered: false },
            after_break:          { triggered: false },
            private_moment:       { triggered: false },
            jealousy:             { triggered: false },
            reunion:              { triggered: false },
            // ── Vertical Slice: 3-Day Arc ──────────────────────────────
            scene2_reaction:      { triggered: false },
            scene3_soften:        { triggered: false },
            scene4_vulnerability: { triggered: false },
            scene6_dependency:    { triggered: false },
            scene7_conflict:      { triggered: false },
            scene8_climax:        { triggered: false },
            day3_ending:          { triggered: false },
            lucien_competition:   { triggered: false },
            // ── Day 4–7 volatile loop ──────────────────────────────────
            scene_day4:          { triggered: false },   // false stability
            scene_day5:          { triggered: false },   // subtle distance
            scene_day6_jealousy: { triggered: false },   // jealousy spike
            scene_day7_loop:     { triggered: false },   // confrontation / loop reset
            // ── Alistair 3-Day Arc ────────────────────────────────────
            alistair_scene1:     { triggered: false },   // The Oath
            alistair_scene2:     { triggered: false },   // Cracks
            alistair_scene3:     { triggered: false },   // Morning Watch
            alistair_scene4:     { triggered: false },   // Confession Attempt
            alistair_scene5:     { triggered: false },   // The Line
            alistair_duty:       { triggered: false },   // King's Call
            // ── Tension / Premium scenes ──────────────────────────────
            tension_confession:  { triggered: false },   // "almost confession" (teaser → premium)
            emotional_drift:     { triggered: false, lastTriggered: 0 }, // repeatable with 24h cooldown
            first_rupture:       { triggered: false },   // suffocation peak moment
            // ── Day arc entry beats ───────────────────────────────────
            scene1_entry:        { triggered: false, played: false },   // Day 1 warm welcome (no monetisation)
            scene2_awareness:    { triggered: false },   // Day 2 subtle "I notice you"
            // ── Personality path endings ──────────────────────────────────
            path_ending_dependent: { triggered: false },
            path_ending_defensive: { triggered: false },
            path_ending_detached:  { triggered: false },
            // ── Elian Playable Arc ──────────────────────────────────────
            elian_assessment:        { triggered: false },
            elian_test:              { triggered: false },
            elian_bond:              { triggered: false },
            elian_peak:              { triggered: false },
            // ── Proto Playable Arc ─────────────────────────────────────
            proto_detection:         { triggered: false },
            proto_awareness:         { triggered: false },
            proto_breaking:          { triggered: false },
            proto_peak:              { triggered: false },
            // ── Noir Playable Arc ──────────────────────────────────────
            noir_temptation:         { triggered: false },
            noir_corruption:         { triggered: false },
            noir_consuming:          { triggered: false },
            noir_peak:               { triggered: false },
            // ── Caspian Playable Arc ─────────────────────────────────────
            caspian_warmth:          { triggered: false },
            caspian_dependency:      { triggered: false },
            caspian_choice:          { triggered: false },
            caspian_gentle_release:  { triggered: false },
            caspian_comfort_loop:    { triggered: false },
            // ── Lucien Playable Arc ──────────────────────────────────────
            lucien_observation:     { triggered: false },   // Day 1-2: "You're an unexpected variable"
            lucien_margin_notes:    { triggered: false },   // Day 3: Personal notes discovered
            lucien_fascination:     { triggered: false },   // Day 4-5: He loses objectivity
            lucien_sister:          { triggered: false },   // Day 4+: Reveals connection to Lyra
            lucien_confession:      { triggered: false },   // Day 5-6: Equations fail (premium teaser)
            lucien_peak:            { triggered: false },   // Day 7+: Fork — vulnerability OR obsession
            lucien_reality_fracture:{ triggered: false },   // Corruption path: reality breaks
            lucien_human_answer:    { triggered: false }    // Love path: he chooses to be wrong
        };

        // ── Premium unlocks ───────────────────────────────────────────────
        // Each key = sceneId, value = true when player has unlocked the scene.
        // To add real payments: replace unlockPremiumScene() stub with your payment flow.
        this.premiumScenes = {};

        // ── A/B test groups ───────────────────────────────────────────────
        // Assigned once per player on first scene trigger, never re-rolled.
        // day3 = emotional_drift, day4 = tension_confession, day6 = first_rupture
        // Values: 'A' (control) | 'B' (test) — selected via BanditStore.sample()
        this.testGroups    = { day3: null, day4: null, day6: null };
        // Bandit context at assignment time (segment + path) — needed for update()
        this.testGroupMeta = { day3: null, day4: null, day6: null };

        // ── Micro-personalisation vector ──────────────────────────────────
        // Three 0–1 floats that drift based on observed player behaviour.
        // Used to apply tiny experience adjustments within ±15% of baseline.
        // sensitivity: reacts to emotional weight  (pauses, tension)
        // curiosity:   engages with ambiguous moments (decision time)
        // attachment:  invests emotionally (returns after rupture, daily sessions)
        this.playerMicro = { sensitivity: 0.5, curiosity: 0.5, attachment: 0.5 };

        // ── Personality evolution system ─────────────────────────────────
        // Three vectors accumulate from behavior; the dominant one (> 60 soft,
        // > 80 sustained = hard lock) shapes Lyra's tone, dialogue, and endings.
        // Never shown to the player — she just "becomes" someone over time.
        this.lyraPersonality = { dependent: 0, defensive: 0, detached: 0 };
        this.personalityPath = null;      // null | 'dependent' | 'defensive' | 'detached'
        this._pathLockTimer  = 0;         // ticks spent with dominant > 80 (toward hard lock)
        // ── Meta narrative system ─────────────────────────────────────────
        // Rare, controlled moments where Lyra feels uncannily observational.
        // metaLevel 0-5 controls intensity; 5-min cooldown prevents stacking.
        this.metaLevel        = 0;
        this._lastMetaAt      = 0;
        this._stayChoiceCount = 0;        // increments on every premium unlock (= "stayed")
        this._loginTimes      = [];       // last 5 session open hours — for pattern detection

        // ── Whale arc system ──────────────────────────────────────────────
        // Hidden scoring → parallel premium arc for high-value emotionally-invested players.
        // whaleScore accumulates from behavioral signals; arc activates above threshold 55.
        this.whaleScore        = 0;       // 0-100 cumulative
        this.whaleArcActive    = false;   // true once entry scene fires
        this.whaleArcStage     = 0;       // 0=locked, 1-4=active stages
        this.whaleArcLoopCount = 0;       // increments each time stage4→stage1 loops
        this.purchasedCount    = 0;       // total premium unlocks (all scenes combined)
        this.returnedAfterRupture = false; // true once player acts after first_rupture
        // One-time bonus flags (prevent double-counting on every call)
        this._whaleBonusPurchase1  = false;
        this._whaleBonusPurchase2  = false;
        this._whaleBonusRupture    = false;
        // Session counter — init from localStorage so it persists across page loads
        this._sessionsToday = (() => {
            try {
                const stored = JSON.parse(localStorage.getItem('pl_session_meta') || '{}');
                const today  = new Date().toDateString();
                if (stored.date === today) return (stored.count || 0) + 1;
                return 1;
            } catch(_) { return 1; }
        })();
        try {
            localStorage.setItem('pl_session_meta',
                JSON.stringify({ date: new Date().toDateString(), count: this._sessionsToday }));
        } catch(_) {}

        // ── Vertical Slice state ──────────────────────────────────────
        this.storyDay      = 1;    // 1 / 2 / 3 — advances each new calendar day
        this.dayInteractions = 0;  // interactions in the current story-day
        this.jealousy      = 0;    // 0-100, builds on Day 3 neglect
        this.lyraMemory    = {     // player-behaviour echo for branching
            playerWasKind:    false,
            playerWasCareless:false,
            comfortedHer:     false,
            teasedHer:        false,
            stayedSilent:     false,
            walkedAway:       false
        };

        // Daily streak
        this.dailyStreak   = 0;
        this.lastLoginDate = null;

        // ── Dialogue anti-repetition ─────────────────────────────────────
        // Stores the last 7 line snippets (first 35 chars) so the dialogue
        // system can filter recently shown lines before picking from a pool.
        this._recentLines = [];

        // ── Event afterglow counters ──────────────────────────────────────
        // Decremented in _recordAction. While > 0 the dialogue system weights
        // toward contextually-appropriate follow-up lines.
        // _returnStateTurns: set after 6h+ absence — biases toward cooler tone
        // _postLucienEchoTurns: set after Lucien scene — keeps tension alive
        this._returnStateTurns    = 0;
        this._postLucienEchoTurns = 0;

        // Scene lock — prevents event system from interrupting a playing scene
        this.sceneActive = false;

        // Shock events (rare emotional disruption + recovery)
        this.shockState = {
            active:        false,
            lastShockTime: 0,
            cooldown:      300000  // min 5 min between shocks
        };

        // Decay rates (per second)
        this.decayRates = {
            hunger: 0.03,   // ~55 min to empty
            clean: 0.02,    // ~83 min to empty
            bond: 0.015     // ~111 min to empty
        };

        // Systems
        this.typewriter = null;
        this.dialogueSystem = new DialogueSystem(this);
        this.eventSystem = new EventSystem(this);
        this.achievementSystem = new AchievementSystem(this);
        this.ui = null;

        // Game loop
        this.lastTick = Date.now();
        this.tickInterval = null;
    }

    init() {
        // Ensure sounds are enabled at game start
        if (typeof sounds !== 'undefined' && !sounds.enabled) {
            sounds.init(); sounds.resume(); sounds.enabled = true;
        }
        this.typewriter = new TypewriterEffect(document.getElementById('dialogue-text'));
        // Set character name above dialogue
        try {
            var _spk = document.getElementById('dialogue-speaker');
            var _names = {alistair:'Alistair',lyra:'Lyra',lucien:'Lucien',caspian:'Caspian',elian:'Elian',proto:'Proto',noir:'Noir'};
            if (_spk) _spk.textContent = _names[this.selectedCharacter] || '';
        } catch(e) {}
        this.ui = new GameUI(this);

        // Wire mid-line face shifts: TypewriterEffect fires this when a trigger position is hit
        this.typewriter.onEmotionTrigger = (emotion) => {
            if (this.ui) this.ui._flashFaceOnly(emotion);
        };
        this.gallery = new GallerySystem(this);

        this.load();
        // Ensure default outfit is correct for character if no save exists
        if (!localStorage.getItem('pocketLoveSave_' + (this.selectedCharacter || 'alistair'))) {
            this.currentOutfit = this.selectedCharacter === 'lyra' ? 'default' : 'knight';
        }
        this.ui.updateAll();

        // ── Analytics: session start ───────────────────────────────────────
        if (typeof Analytics !== 'undefined') {
            Analytics.emit('session_start', {
                character:      this.selectedCharacter,
                storyDay:       this.storyDay,
                purchasedCount: this.purchasedCount,
                whaleScore:     Math.round(this.whaleScore),
                personalityPath:this.personalityPath || 'none',
                sessionsToday:  this._sessionsToday,
                retentionDays:  Analytics.getRetentionDays()
            });
            // Micro-profile session signals
            if (this.dailyStreak >= 2)          this._updatePlayerMicro('daily_return');
            if (this._sessionsToday >= 3)        this._updatePlayerMicro('session_multi');
            // Local A/B adaptation: lock winning variants if data is sufficient
            this._adaptFromLocalData();
        }

        // Gallery button
        const galleryBtn = document.getElementById('gallery-btn');
        if (galleryBtn) {
            galleryBtn.onclick = () => this.gallery.open();
        }
        const galleryClose = document.getElementById('gallery-close');
        if (galleryClose) {
            galleryClose.onclick = () => this.gallery.close();
        }

        // Settings button
        this.initSettings();

        // New Game+ memory leak + daily progression
        if (CHARACTER.name === 'Lyra') {
            setTimeout(() => {
                if (!this.dailyLineShown) this._showDailyReturnLine();
                if (!this.memoryLeakShown) {
                    const meta = this._loadMetaMemory();
                    if (meta.hasPlayedBefore && (meta.bondEcho || 0) > 0) {
                        const leak = this._getMemoryLeakLine(meta);
                        if (leak) setTimeout(() => this.typewriter.show(leak), 4500);
                        this.memoryLeakShown = true;
                    }
                }
            }, 5000);
        } else {
            // Alistair daily streak line + NG+ memory echo
            setTimeout(() => {
                if (!this.dailyLineShown) this._showAlistairDailyReturnLine();
                if (!this.memoryLeakShown) {
                    const meta = this._loadMetaMemory();
                    if (meta.hasPlayedBefore && (meta.bondEcho || 0) > 0) {
                        const leak = this._getMemoryLeakLine(meta);
                        if (leak) setTimeout(() => this.typewriter.show(leak), 5500);
                        this.memoryLeakShown = true;
                    }
                }
            }, 5000);
        }

        // Show welcome or return message
        if (this.characterLeft) {
            this.ui.showGameOver("I left... but maybe we can try again?");
        } else {
            this.showReturnMessage();
            // Consistency echo — fires 4.5s later so it doesn't clash with return line
            if (CHARACTER.name === 'Lyra' && (this.dailyStreak >= 2 || (this.playerMicro?.attachment ?? 0) >= 0.70) && Math.random() < 0.25) {
                setTimeout(() => this._checkConsistencyEcho(), 4500);
            }
        }

        // Start game loop (10 ticks per second)
        this.tickInterval = setInterval(() => this.tick(), 100);

        // Watchdog: if tickInterval gets lost (e.g. an intro that never
        // completed its callback), auto-restart it after 30s so stat
        // bars don't get stuck. Only runs if character is actually
        // being played and no intro overlay is visible.
        setInterval(() => {
            if (this.tickInterval || this.characterLeft) return;
            const introOverlay = document.getElementById('intro-overlay');
            const introVisible = introOverlay && !introOverlay.classList.contains('hidden')
                && getComputedStyle(introOverlay).display !== 'none';
            if (introVisible) return; // intro still running, don't interfere
            // Recover
            console.warn('[watchdog] tickInterval was lost — restarting');
            this.lastTick = Date.now();
            this.tickInterval = setInterval(() => this.tick(), 100);
        }, 30000);

        // Auto-save every 30 seconds
        setInterval(() => this.save(), 30000);

        // Last Line on tab hide + session_end analytics (all characters)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && !this._lastLineShown) {
                this._showLastLine();
                this._lastLineShown = true;
                // Emit session_end so diagnose() can compute avg session duration
                if (typeof Analytics !== 'undefined') {
                    Analytics.emit('session_end', {
                        duration:     Date.now() - (this.sessionStart || Date.now()),
                        interactions: this.dayInteractions || 0,
                        storyDay:     this.storyDay,
                        purchasedCount: this.purchasedCount
                    });
                }
            } else if (document.visibilityState === 'visible') {
                this._lastLineShown = false; // reset each return
            }
        });
        // Request notification permission on first user interaction (all characters)
        window.addEventListener('click', () => this._requestNotificationPermission(), { once: true });

        // Start BGM
        this._bgmStarted = false;
        this._startBGMOnInteraction();

        // Music toggle button (legacy topbar button — hidden via CSS now)
        const musicBtn = document.getElementById('music-btn');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                if (!this._bgmStarted) {
                    bgm.init();
                    bgm.start();
                    this._bgmStarted = true;
                }
                const muted = bgm.toggleMute();
                musicBtn.textContent = muted ? '🔇' : '🎵';
                musicBtn.style.opacity = muted ? '0.5' : '1';
            });
        }

        // Music toggle button (new location: Settings overlay)
        const settingsMusicBtn = document.getElementById('settings-music-toggle');
        if (settingsMusicBtn) {
            settingsMusicBtn.addEventListener('click', () => {
                if (!this._bgmStarted) {
                    bgm.init();
                    bgm.start();
                    this._bgmStarted = true;
                }
                const muted = bgm.toggleMute();
                settingsMusicBtn.textContent = muted ? '🔇 Off' : '🎵 On';
                settingsMusicBtn.classList.toggle('music-off', muted);
            });
        }
    }

    _startBGMOnInteraction() {
        // Start BGM on first user click (browser requires user gesture)
        // Only after sounds are enabled (not during intro/start screen)
        const startBGM = () => {
            if (this._bgmStarted) return;
            this._bgmStarted = true;
            bgm.init();
            bgm.start();
            this.updateBGMMood();
            document.removeEventListener('click', startBGM);
        };
        document.addEventListener('click', startBGM);
    }

    updateBGMMood() {
        if (!this._bgmStarted) return;

        const hour = new Date().getHours();
        const isNight = hour >= 21 || hour < 6;

        // Corruption overrides everything
        if (this.corruptionState === 'corrupted') {
            bgm.setMood('corrupted');
            return;
        }

        // Critical stats always = tense
        if (this.hunger < 20 || this.clean < 20 || this.bond < 15) {
            bgm.setMood('tense');
            return;
        }

        // Lyra-specific phase-aware moods
        if (CHARACTER.name === 'Lyra') {
            // Lucien dominating = tense undercurrent
            if (this.lucienActive && this.lucienInfluence >= 70) {
                bgm.setMood('tense');
                return;
            }
            // High emotional tension = tense
            if ((this.tensionStage || 0) >= 2) {
                bgm.setMood('tense');
                return;
            }
            // postLucien + lucien winning = unsettled night feel
            if (this.lyraPhase === 'postLucien' && this._getBalanceState && this._getBalanceState() === 'lucien') {
                bgm.setMood('night');
                return;
            }
        }

        // Standard mood ladder
        if (this.affectionLevel >= 3 && this.bond > 60) {
            bgm.setMood('romantic');
        } else if (isNight) {
            bgm.setMood('night');
        } else {
            bgm.setMood('calm');
        }
    }

    // ===== ENHANCED RETURN CINEMATICS =====
    // Mini-scenes for 6h+ absences — emotionally scaled by character and relationship depth

    _playReturnCinematic(minutesAway) {
        const hoursAway = Math.floor(minutesAway / 60);
        const isLong = minutesAway >= 1440; // 24h+
        const isMedium = minutesAway >= 720; // 12h+
        const charName = CHARACTER.name;
        const body = CHARACTER.bodySprites?.sad || CHARACTER.bodySprites?.neutral;
        const bodyHappy = CHARACTER.bodySprites?.happy || CHARACTER.bodySprites?.neutral;

        // Alistair return cinematics
        if (charName === 'Alistair') {
            const beats = [
                { type: 'show', stage: 'stage-warm' },
                { type: 'fade', direction: 'out', ms: 500 },
                { type: 'delay', ms: 400 },
                { type: 'char', src: body, wait: 800 },
                { type: 'line', text: isLong
                    ? "...You came back."
                    : "I kept the post. A knight keeps the post.", hold: 2200, speed: 38, pose: isLong ? 'sad1' : 'crossarms' },
                { type: 'clear' },
                { type: 'delay', ms: 600 },
                { type: 'line', text: isLong
                    ? `${hoursAway} hours. I counted every one. Not because I was waiting.`
                    : "The armor gets heavier when you're not here. I don't know why.", hold: 2800, speed: 34 },
                { type: 'clear' },
                { type: 'delay', ms: 700 },
                ...(this.affectionLevel >= 3 ? [
                    { type: 'particle', emoji: '\u2764\uFE0F', count: 4, ms: 1000, wait: false },
                    { type: 'line', text: "...Don't do that again. Please.", hold: 2400, speed: 36, pose: 'gentle' },
                    { type: 'clear' },
                ] : [
                    { type: 'line', text: "...It's good to see you.", hold: 2000, speed: 40, pose: 'gentle' },
                    { type: 'clear' },
                ]),
                ...(isLong && this.storyDay >= 3 ? [
                    { type: 'delay', ms: 500 },
                    { type: 'line', text: "The wards flickered while you were gone. The kingdom needs you here.", hold: 2800, speed: 34 },
                    { type: 'clear' },
                ] : []),
                { type: 'hide' }
            ];
            this._playScene(beats, () => {
                this._returnStateTurns = isLong ? 6 : 3;
                this.save();
            });
            return;
        }

        // Lyra return cinematics
        if (charName === 'Lyra') {
            this._returnStateTurns = isLong ? 6 : 4;
            const beats = [
                { type: 'show', stage: 'stage-warm' },
                { type: 'fade', direction: 'out', ms: 500 },
                { type: 'delay', ms: 400 },
                { type: 'char', src: body, wait: 800 },
                { type: 'line', text: isLong
                    ? "The waves brought you back. I asked them to."
                    : "The cave echoes differently when you're gone.", hold: 2400, speed: 36, pose: isLong ? 'sad' : 'shy' },
                { type: 'clear' },
                { type: 'delay', ms: 600 },
                { type: 'line', text: isLong
                    ? "I sang every night. In case you could hear me from wherever you were."
                    : "I kept humming. Habit. Or hope. I can't tell anymore.", hold: 3000, speed: 32 },
                { type: 'clear' },
                { type: 'delay', ms: 700 },
                ...(this.affectionLevel >= 3 ? [
                    { type: 'particle', emoji: '\uD83C\uDF0A', count: 5, ms: 1200, wait: false },
                    { type: 'line', text: "Promise me something. Don't leave without telling me. Even if you have to go.", hold: 3200, speed: 30, pose: 'love' },
                    { type: 'clear' },
                ] : [
                    { type: 'line', text: "...You're here now. That's what matters.", hold: 2200, speed: 38, pose: 'shy' },
                    { type: 'clear' },
                ]),
                ...(isLong && this.storyDay >= 3 ? [
                    { type: 'delay', ms: 500 },
                    { type: 'line', text: "The ocean went quiet while you were away. It's singing again now.", hold: 2800, speed: 34 },
                    { type: 'clear' },
                ] : []),
                { type: 'hide' }
            ];
            this._playScene(beats, () => { this.save(); });
            return;
        }

        // Lucien return cinematics
        if (charName === 'Lucien') {
            if (minutesAway >= 2880) {
                this._returnSadMode = true;
                this._returnSadModeExpiry = Date.now() + 600000;
            }
            const beats = [
                { type: 'show', stage: 'stage-lucien-study' },
                { type: 'fade', direction: 'out', ms: 500 },
                { type: 'delay', ms: 400 },
                { type: 'char', src: body, wait: 800 },
                { type: 'line', text: isLong
                    ? `...${hoursAway} hours. I have the exact figure. I wasn't tracking it.`
                    : "The equations didn't balance while you were gone. Unrelated, I'm sure.", hold: 2800, speed: 34, pose: isLong ? 'distant' : 'thinking' },
                { type: 'clear' },
                { type: 'delay', ms: 600 },
                { type: 'line', text: isLong
                    ? "I filled three journals. None of the entries are about magic."
                    : "My familiar kept looking at the door. Coincidence.", hold: 2800, speed: 34 },
                { type: 'clear' },
                { type: 'delay', ms: 700 },
                ...(this.affectionLevel >= 3 ? [
                    { type: 'particle', emoji: '\u2728', count: 4, ms: 1000, wait: false },
                    { type: 'line', text: "I had a 60% probability you wouldn't come back. I'm glad the model was wrong.", hold: 3200, speed: 30, pose: 'vulnerable' },
                    { type: 'clear' },
                ] : [
                    { type: 'line', text: "...Welcome back. The tower noticed.", hold: 2200, speed: 38, pose: 'neutral' },
                    { type: 'clear' },
                ]),
                ...(isLong && this.storyDay >= 3 ? [
                    { type: 'delay', ms: 500 },
                    { type: 'line', text: "The spells degraded while you were gone. Your presence stabilizes the magic.", hold: 2800, speed: 34 },
                    { type: 'clear' },
                ] : []),
                { type: 'hide' }
            ];
            this._playScene(beats, () => { this.save(); });
            return;
        }

        // Fallback — generic text return if character not matched
        this.typewriter.show("...You're back.");
    }

    // ===== TIME-AWAY RETURN MESSAGE =====
    showReturnMessage() {
        const timeSinceLast = Date.now() - this.lastInteractionTime;
        const minutesAway = timeSinceLast / 60000;

        // ── Enhanced Return Cinematics (6h+) ─────────────────────────
        // Play a mini-scene instead of just text for significant absences
        if (minutesAway >= 360 && this.affectionLevel >= 1) {
            this._playReturnCinematic(minutesAway);
            return;
        }

        // Return state afterglow — 6h+ absence keeps next 4 interactions cooler/more reflective
        if (CHARACTER.name === 'Lyra' && minutesAway >= 360) {
            this._returnStateTurns = 4;
        }

        // Long absence with high fear → full reunion scene (dramatic return)
        if (minutesAway > 120 && this.emotion.fear > 40 && this.sceneLibrary && !this.sceneLibrary.reunion.triggered) {
            setTimeout(() => this.playReunionScene(minutesAway), 800);
            return;
        }

        // Lucien passive influence — shadows her greeting when he's been around
        if (CHARACTER.name === 'Lyra' && this.lucienActive && this.lucienInfluence >= 30) {
            const lucienLine = this._getLucienInfluencedReturnLine(minutesAway);
            if (lucienLine) {
                this.typewriter.show(lucienLine);
                if (minutesAway > 480)      this.ui.flashEmotion("crying", 4000);
                else if (minutesAway > 120) this.ui.flashEmotion("sad",    3000);
                else if (minutesAway > 30)  this.ui.flashEmotion("shy",    3000);
                return;
            }
        }

        // Adaptive greeting for Lyra in postLucien / attached phases
        if (CHARACTER.name === 'Lyra' && (this.lyraPhase === 'postLucien' || this.lyraPhase === 'attached')) {
            const greet = this._getAdaptiveDialogue('greeting');
            if (greet) {
                this.typewriter.show(greet);
                if (minutesAway > 480)      this.ui.flashEmotion("crying", 4000);
                else if (minutesAway > 120) this.ui.flashEmotion("sad",    3000);
                else if (minutesAway > 30)  this.ui.flashEmotion("shy",    3000);
                return;
            }
        }

        // Lucien — absence-aware return lines
        if (CHARACTER.name === 'Lucien') {
            const lucienReturnLines = CHARACTER.timeAwayReactions || {};
            let pool;
            if (minutesAway > 1440) pool = lucienReturnLines.distant;
            else if (minutesAway > 480) pool = lucienReturnLines.extended;
            else if (minutesAway > 120) pool = lucienReturnLines.long;
            else if (minutesAway > 30) pool = lucienReturnLines.medium;
            else if (minutesAway > 5) pool = lucienReturnLines.short;
            else pool = lucienReturnLines.brief;
            if (pool) {
                const line = Array.isArray(pool) ? pool[Math.floor(Math.random() * pool.length)] : pool;
                this.typewriter.show(line);
                if (minutesAway > 480) this.ui.flashEmotion("sad", 4000);
                else if (minutesAway > 120) this.ui.flashEmotion("neutral", 3000);
                else this.ui.flashEmotion("gentle", 2000);
                // Return sadness mode for Lucien: 48h+ absence
                if (minutesAway >= 2880) {
                    this._returnSadMode = true;
                    this._returnSadModeExpiry = Date.now() + 600000; // 10 min
                }
                return;
            }
        }

        // Alistair — absence-aware return lines
        if (CHARACTER.name !== 'Lyra' && CHARACTER.name !== 'Lucien') {
            const alistairLine = this._getAlistairReturnLine(minutesAway);
            if (alistairLine) {
                this.typewriter.show(alistairLine);
                if (minutesAway > 480)      this.ui.flashEmotion("sad",    4000);
                else if (minutesAway > 120) this.ui.flashEmotion("neutral", 3000);
                else if (minutesAway > 30)  this.ui.flashEmotion("gentle",  2000);
                return;
            }
        }

        const reaction = this.dialogueSystem.getTimeAwayReaction(minutesAway);

        if (reaction) {
            this.typewriter.show(reaction);

            if (minutesAway > 480) {
                this.ui.flashEmotion("crying", 4000);
            } else if (minutesAway > 120) {
                this.ui.flashEmotion("sad", 3000);
            } else if (minutesAway > 30) {
                this.ui.flashEmotion("shy", 3000);
            }
        } else {
            // First time playing — no save means minutesAway ≈ 0 and no reaction
            const isFirstPlay = !localStorage.getItem('pocketLoveSave_' + (this.selectedCharacter || 'alistair'));
            if (isFirstPlay) {
                const firstLine = CHARACTER.name === "Lyra"
                    ? "…you can see me?"
                    : "Oh. You came. I wasn't sure you would.";
                this.typewriter.show(firstLine);
            } else if (CHARACTER.name === "Lyra") {
                // Day-based return lines — each day Lyra reacts differently
                const day = this.storyDay || 1;
                const lyraReturnLines = {
                    1: ["…you came back.", "You're still here.", "…I wasn't sure you would."],
                    2: ["…you came back.", "…I knew it.", "I thought you'd take longer."],
                    3: ["…you took longer today.", "You're late.", "…I noticed."],
                };
                const pool = lyraReturnLines[Math.min(day, 3)];
                this.typewriter.show(pool[Math.floor(Math.random() * pool.length)]);
            } else {
                this.typewriter.show("...you returned.");
            }
        }
    }

    tick() {
        if (this.characterLeft) return;

        const now = Date.now();
        const dt = (now - this.lastTick) / 1000;
        this.lastTick = now;

        // Stat decay — Proto gets erratic randomized rates
        if (CHARACTER.name === 'Proto') {
            const jitter = 0.3 + Math.random() * 1.4; // 0.3x to 1.7x
            this.hunger -= this.decayRates.hunger * dt * jitter;
            this.clean -= this.decayRates.clean * dt * jitter;
            this.bond -= this.decayRates.bond * dt * jitter;
            // Rare stat jump (0.1% chance per tick = ~once per minute)
            if (Math.random() < 0.001) {
                const stat = ['hunger', 'clean', 'bond'][Math.floor(Math.random() * 3)];
                this[stat] = Math.min(100, this[stat] + 5 + Math.random() * 10);
            }
        } else {
            this.hunger -= this.decayRates.hunger * dt;
            this.clean -= this.decayRates.clean * dt;
            this.bond -= this.decayRates.bond * dt;
        }

        // Corruption growth from neglect
        if (this.hunger < 20 || this.clean < 20 || this.bond < 15) {
            this.corruption += 0.15 * dt;
        }

        // Clamp stats
        this.hunger = Math.max(0, Math.min(100, this.hunger));
        this.clean = Math.max(0, Math.min(100, this.clean));
        this.bond = Math.max(0, Math.min(100, this.bond));
        this.corruption = Math.max(0, Math.min(100, this.corruption));

        // ── Time of day (drives greetings, events, dialogue) ────
        const _h = new Date().getHours();
        this.timeOfDay = _h >= 5 && _h < 12 ? 'morning' : _h < 18 ? 'day' : _h < 22 ? 'evening' : 'night';

        // ── Emotional engine ─────────────────────────────────────
        const profile = CHARACTER.emotionalProfile || { stability: 0.6, volatility: 0.5, intensity: 0.7, attachmentSpeed: 0.6 };

        // Fear rises when needs are neglected
        if (this.hunger < 20 || this.clean < 20 || this.bond < 15) {
            this.emotion.fear  += 0.4 * dt;
            this.emotion.trust -= 0.2 * dt;
        }

        // Neglect tracking — absence of interaction
        const timeSinceInteraction = Date.now() - this.lastInteractionTime;
        if (timeSinceInteraction > 120000) {
            this.neglectLevel  += 0.04 * dt;
            this.recentNeglect  = true;
            // Lyra spirals fast when left alone; Alistair holds it in
            const neglectFearRate = CHARACTER.name === "Lyra" ? 0.5 : 0.1;
            this.emotion.fear  += neglectFearRate * dt;
        }

        // Comfort recovery — if player is actively present, fear slowly eases
        if (timeSinceInteraction < 30000 && this.emotion.fear > 40 && Math.random() < 0.004) {
            this.typewriter.show("It's okay... you're here now.");
            this.emotion.fear -= 5;
        }

        // ── Pressure build-up (obsessive profile trap) ───────────────────
        // When attachment is extreme but fear is absent, the system interprets
        // this as "pressure without release" — intensity with no vulnerability.
        // Over time this builds unavoidable tension even in "clean" states.
        if (this.emotion.obsession > 85 && this.emotion.fear < 30) {
            this.emotion.fear += 0.8 * dt;
        }

        // ── Micro-withdrawal ──────────────────────────────────────────────
        // Once attachment is extreme AND tension starts rising, trust slowly
        // erodes — the character begins pulling back from the pressure.
        if (this.emotion.obsession > 90 && this.emotion.fear > 40) {
            this.emotion.trust -= 0.3 * dt;
        }

        // ── Soft ceiling resistance ───────────────────────────────────────
        // Prevents trust and attachment from locking at max forever.
        // High stats gently resist staying perfect — keeps the system dynamic.
        if (this.emotion.trust > 90)     this.emotion.trust     -= 0.2 * dt;
        if (this.emotion.obsession > 90) this.emotion.obsession -= 0.2 * dt;

        // ── Equilibrium forces ────────────────────────────────────────────
        // Soft "centre of gravity" — stats resist staying at extremes.
        // Without this, every stat drifts to 0 or 100 over long sessions.
        //
        // Fear: playable zone is 25–60.  Outside that range it nudges back.
        const _fearHi = window.TUNE?.fearEquilibriumHigh ?? 60;
        const _fearLo = window.TUNE?.fearEquilibriumLow  ?? 25;
        if (this.emotion.fear > _fearHi) this.emotion.fear -= 0.35 * dt;
        if (this.emotion.fear < _fearLo) this.emotion.fear += 0.85 * dt;

        // Corruption: passive recovery (small constant drain) +
        //             extra resistance once it climbs above 70.
        this.corruption = Math.max(0, this.corruption - 0.06 * dt);
        if (this.corruption > 70) this.corruption -= 0.04 * dt;

        // Clamp emotions
        this.emotion.trust     = Math.max(0, Math.min(100, this.emotion.trust));
        this.emotion.obsession = Math.max(0, Math.min(100, this.emotion.obsession));
        this.emotion.fear      = Math.max(0, Math.min(100, this.emotion.fear));

        // Store state for dialogue system
        this.lastEmotionalState = this.getEmotionalState();

        // Try injecting an emotional event
        this._tryEmotionalEvent();

        // Scene auto-triggers
        this._checkSceneTriggers();

        // ── Remembered Letter check (throttled ~once every 4s) ────────────
        // The letter fires once per character on day 3+ after enough interactions.
        // Self-contained in js/letter.js — safe no-op if module missing.
        this._letterTickCounter = (this._letterTickCounter || 0) + 1;
        if (this._letterTickCounter >= 40) {
            this._letterTickCounter = 0;
            if (window.LetterSystem && typeof window.LetterSystem.check === 'function') {
                window.LetterSystem.check(this);
            }
        }

        // ── Personality vector decay (prevents instant locking) ───────────
        // All three vectors drift back toward 0 slowly on every tick.
        // A player has to consistently behave one way to push a path above 60.
        if (this.selectedCharacter === 'lyra') {
            const DECAY = (window.TUNE?.driftDecay ?? 0.2) * dt;
            this.lyraPersonality.dependent = Math.max(0, this.lyraPersonality.dependent - DECAY);
            this.lyraPersonality.defensive = Math.max(0, this.lyraPersonality.defensive - DECAY);
            this.lyraPersonality.detached  = Math.max(0, this.lyraPersonality.detached  - DECAY);
            this._updatePersonalityPath();
        }

        // ── Meta narrative check (time-cooldown, rare) ────────────────────
        if (this.selectedCharacter === 'lyra') this._checkMetaTrigger();

        // Update corruption state
        const oldCorruptionState = this.corruptionState;
        if (this.corruption < 33) this.corruptionState = "pure";
        else if (this.corruption < 66) this.corruptionState = "balanced";
        else this.corruptionState = "corrupted";

        // Check corruption milestones
        if (oldCorruptionState !== this.corruptionState) {
            const milestone = this.dialogueSystem.checkMilestone("corruption");
            if (milestone) {
                this.typewriter.show(milestone);
            }
        }

        // Lyra siren stage + tension + endings + story progression
        if (CHARACTER.name === "Lyra") {
            this._updateSirenStage();
            this._updateTension(dt);
            this._checkLyraEndings();
            this._checkStoryProgression();
            this._updateLyraPhase();
            // Lucien competition event at high influence
            if (this.lucienActive && this.lucienInfluence >= 50 &&
                !this.sceneLibrary.lucien_competition.triggered && !this.sceneActive) {
                this.sceneLibrary.lucien_competition.triggered = true;
                setTimeout(() => this._playLucienCompetitionEvent(), 2000);
            }
        }

        // Alistair story arc + endings + daily progression
        if (CHARACTER.name !== "Lyra") {
            this._checkAlistairStoryProgression();
            this._checkAlistairEndings();
            this._checkAlistairProgression();
            this._checkAlistairDutyPressure();
        }

        // Affection level check
        const newLevel = Math.min(4, Math.floor(this.affection / 25));
        if (newLevel !== this.affectionLevel) {
            this.affectionLevel = newLevel;
            this.onAffectionLevelUp();
            // Memory fragment unlock at affection level 3
            if (newLevel >= 3) this._checkMemoryFragment();
        }

        // Check break condition
        if (!this.characterLeft && this.hunger <= 0 && this.clean <= 0 && this.bond <= 0) {
            this.characterLeft = true;
            const msg = CHARACTER.departureDialogue[
                Math.floor(Math.random() * CHARACTER.departureDialogue.length)
            ];
            this.ui.showGameOver(msg);
            this.save();
            return;
        }

        // Game over warning
        if (!this.isGameOver && (this.hunger <= 5 || this.clean <= 5 || this.bond <= 5)) {
            if (!this._warnedOnce) {
                this._warnedOnce = true;
                this.typewriter.show("...I can't go on like this...");
            }
        } else {
            this._warnedOnce = false;
        }

        // Check achievements
        this.achievementSystem.checkAll();

        // Random events
        if (this.eventSystem.shouldTrigger()) {
            this.eventSystem.trigger();
        }

        // Update UI
        this.ui.updateStats();
        this.ui.updateEmotion();
        this.ui.updateCorruption();

        // Update BGM mood + check gallery every few seconds (not every tick)
        if (!this._lastBGMUpdate || Date.now() - this._lastBGMUpdate > 5000) {
            this._lastBGMUpdate = Date.now();
            this.updateBGMMood();
            if (this.gallery) this.gallery.checkUnlocks();
        }

        // Refresh debug panel if visible
        if (this.ui) this.ui.updateDebugPanel();
    }

    // ===== ACTIONS =====

    // ── Action repetition tracker ─────────────────────────────────────────
    // Prevents any single interaction type from being "optimal".
    // Flooding the system with the same behaviour triggers emotional fatigue:
    // fear spikes, trust erodes, tensionStage ticks up.
    // Players who vary their interactions stay in the healthy zone.
    _recordAction(type) {
        if (!this._actionLog) this._actionLog = [];
        this._actionLog.push(type);
        if (this._actionLog.length > 8) this._actionLog.shift();

        // 3 consecutive identical actions = smothering / emotional numbness.
        // Using consecutive (not "any 3 of 5") so it only fires on genuine spam,
        // not on natural dominant-action play.
        const last3  = this._actionLog.slice(-3);
        const streak = last3.length === 3 && last3.every(a => a === type);
        if (streak) {
            this.emotion.fear  = Math.min(100, this.emotion.fear  + 3);
            this.emotion.trust = Math.max(0,   this.emotion.trust - 1.5);
            this.tensionStage  = Math.min(3,  (this.tensionStage  || 0) + 1);
            // Lyra reacts to being spammed — she notices the rush and doesn't like it
            if (CHARACTER.name === 'Lyra' && !this.sceneActive) {
                const spamLines = [
                    "You're rushing.",
                    "...slow down.",
                    "You don't have to press everything.",
                    "Stop.",
                    "...not everything at once.",
                    "I'm not going anywhere.",
                    "...you don't have to do all of this."
                ];
                setTimeout(() => this.typewriter.show(
                    spamLines[Math.floor(Math.random() * spamLines.length)]
                ), 500);
            }
        }

        // ── Event afterglow: decrement per-action counters ───────────────
        if (this._returnStateTurns    > 0) this._returnStateTurns--;
        if (this._postLucienEchoTurns > 0) this._postLucienEchoTurns--;

        // ── Personality drift from this action ────────────────────────
        if (this.selectedCharacter === 'lyra') this._pushPersonalityDrift(type);

        // ── Day 1: first-impression micro flicker ─────────────────────
        // Fires on the first few interactions — creates "something is different"
        // before the emotional engine has enough data to trigger real micro-dissonance.
        if (this.storyDay === 1) this._checkFirstImpressionMicro();

        // ── Whale arc: track return after rupture ─────────────────────
        if (!this.returnedAfterRupture && this.sceneLibrary && this.sceneLibrary.first_rupture && this.sceneLibrary.first_rupture.triggered) {
            this.returnedAfterRupture = true;
            this._updatePlayerMicro('rupture_returned');
        }

        // ── Update whale score on every action ────────────────────────
        this._updateWhaleScore();
    }

    // ── Whale Score Accumulator ───────────────────────────────────────────
    // Runs after every action. Accumulates from behavioral signals.
    // Never resets. Arc activates once threshold 55 is crossed (if not already active).
    _updateWhaleScore() {
        if (this.whaleArcActive) return; // arc already running — stop tracking

        // One-time purchase bonuses (prevent double-counting)
        if (!this._whaleBonusPurchase1 && this.purchasedCount >= 1) {
            this.whaleScore += 20;
            this._whaleBonusPurchase1 = true;
        }
        if (!this._whaleBonusPurchase2 && this.purchasedCount >= 2) {
            this.whaleScore += 15;
            this._whaleBonusPurchase2 = true;
        }
        if (!this._whaleBonusRupture && this.returnedAfterRupture) {
            this.whaleScore += 15;
            this._whaleBonusRupture = true;
        }

        // Per-interaction micro-gains (slow, but consistent play adds up)
        if (this.emotion.obsession > 70 && this.emotion.trust > 60) {
            this.whaleScore = Math.min(100, this.whaleScore + 0.4);
        }
        if (this._sessionsToday >= 4) {
            this.whaleScore = Math.min(100, this.whaleScore + 0.15);
        }

        this.whaleScore = Math.min(100, this.whaleScore);
    }

    // ── Day 1 First-Impression Micro-Flicker ─────────────────────────────
    // The main micro-dissonance requires obs > 90 — unreachable on Day 1.
    // This creates a tiny "something is different" moment within the first 4
    // interactions: a brief neutral flicker 2–3 s after the action.
    // Fires at most once (probability fades with each interaction).
    // This is the triage fix for "add earlier micro-dissonance."
    _checkFirstImpressionMicro() {
        if (this.sceneActive) return;
        if (this._firstFlickerFired) return;     // only once per session

        // Probability drops with each interaction (1st: 30%, 4th: 7%)
        const chance = 0.32 - (this.dayInteractions * 0.06);
        if (Math.random() > chance) return;

        this._firstFlickerFired = true;

        // Delayed neutral flicker — subtle, 300ms, then back to current state
        setTimeout(() => {
            if (!this.sceneActive && this.ui) {
                this.ui._flashFaceOnly('neutral');
                if (typeof Analytics !== 'undefined') {
                    Analytics.emit('micro_dissonance_triggered', {
                        type: 'first_impression', storyDay: 1, interaction: this.dayInteractions
                    });
                }
            }
        }, 2200 + Math.random() * 800);
    }

    // ── Local A/B self-adaptation ─────────────────────────────────────────
    // Runs once per session start. Reads conversion data from the local
    // Analytics log. If one variant is clearly winning (≥5% delta + enough
    // samples), locks new players to that variant from this session onward.
    // Players who already have a group assigned are never re-rolled.
    _adaptFromLocalData() {
        if (typeof Analytics === 'undefined') return;
        if (!window.TUNE?.abAdaptEnabled) return;
        const minSamples = window.TUNE?.abMinSamples ?? 20;

        const SCENE_MAP = {
            day3: 'emotional_drift',
            day4: 'tension_confession',
            day6: 'first_rupture'
        };

        for (const [key, scene] of Object.entries(SCENE_MAP)) {
            // Only adapt players who haven't been assigned yet
            if (this.testGroups[key] !== null) continue;
            const winner = Analytics.getBetterVariant(scene, minSamples);
            if (winner) {
                this.testGroups[key] = winner;
                // No save() needed — testGroups persists on next real interaction
            }
        }

        // Churn re-engagement signal: if high-risk, lower premium gate threshold
        // so the next session has a slightly softer on-ramp
        if (Analytics.isChurnRisk(48) && this.purchasedCount === 0) {
            if (window.TUNE) window.TUNE.premiumAutoClose = 13000; // extra 4 s
        }

        // Run auto-tuning rules + micro-personalisation each session
        this._autoTune();
        this._applyMicroPersonalization();
    }

    // ── Player Segment ────────────────────────────────────────────────────
    // Returns a stable 5-way segment string used to scope bandit contexts.
    // Segment is computed fresh each session (can change as player progresses).
    _getPlayerSegment() {
        if (this.purchasedCount >= 2)                           return 'whale';
        if (this.purchasedCount >= 1)                           return 'payer';
        if (typeof Analytics !== 'undefined' && Analytics.isChurnRisk(48)) return 'churn';
        if (this.storyDay >= 3)                                 return 'engaged';
        return 'new';
    }

    // ── Micro-personalization vector update ───────────────────────────────
    // Called after key behavioral events. Nudges the 3-float profile vector.
    // event: 'converted' | 'abandoned' | 'rupture_returned' | 'daily_return'
    _updatePlayerMicro(event, data = {}) {
        const m   = this.playerMicro;
        const clamp = (v) => Math.max(0, Math.min(1, v));
        switch (event) {
            case 'converted':
                // Quick decision → curious type. Slow decision → sensitive type.
                if (data.decisionTime < 2500) { m.curiosity   = clamp(m.curiosity   + 0.04); }
                if (data.decisionTime > 6000) { m.sensitivity = clamp(m.sensitivity + 0.04); }
                m.attachment = clamp(m.attachment + 0.06);
                break;
            case 'abandoned':
                m.curiosity   = clamp(m.curiosity   - 0.03);
                m.sensitivity = clamp(m.sensitivity - 0.02);
                break;
            case 'rupture_returned':
                m.attachment  = clamp(m.attachment  + 0.10);
                m.sensitivity = clamp(m.sensitivity + 0.05);
                break;
            case 'daily_return':
                m.attachment  = clamp(m.attachment  + 0.03);
                break;
            case 'session_multi': // 3+ sessions today
                m.curiosity   = clamp(m.curiosity   + 0.03);
                m.attachment  = clamp(m.attachment  + 0.04);
                break;
        }
        this.playerMicro = m;
    }

    // ── Apply micro-personalisation to TUNE (each session) ───────────────
    // Adjusts TUNE values within ±15% of the values already set by remote config.
    // Never contradicts the core system — always a subtle lean.
    _applyMicroPersonalization() {
        const m = this.playerMicro;
        if (!m || !window.TUNE) return;

        // Pause scale: sensitive players get slightly longer pauses
        const prevPauseScale = window.TUNE.pauseScale ?? 1.0;
        const microPause = 1.0 + (m.sensitivity - 0.5) * 0.3; // 0.85–1.15
        window.TUNE.pauseScale = Math.max(0.85, Math.min(1.15, microPause));

        // Pre-choice tension: attached players already feel tension — don't double up
        const prevBoost = window.TUNE.preChoiceTensionBoost ?? 0;
        const attachmentOffset = (m.attachment - 0.7) * 0.06; // only shifts if attachment > 0.7
        window.TUNE.preChoiceTensionBoost = Math.max(-0.1, Math.min(0.2,
            prevBoost + attachmentOffset
        ));

        // Auto-close gate: curious players decide fast, let them; hesitant players need more time
        const curiosityExtra = (0.5 - m.curiosity) * 2000; // adds 0–2000 ms for low curiosity
        window.TUNE.premiumAutoClose = Math.max(7000, Math.min(14000,
            (window.TUNE.premiumAutoClose ?? 9000) + curiosityExtra
        ));

        // Emit profile snapshot once per session
        if (typeof Analytics !== 'undefined') {
            Analytics.emit('player_profile_snapshot', {
                sensitivity: +m.sensitivity.toFixed(2),
                curiosity:   +m.curiosity.toFixed(2),
                attachment:  +m.attachment.toFixed(2),
                segment:     this._getPlayerSegment(),
                path:        this.personalityPath || 'none',
                whaleScore:  Math.round(this.whaleScore)
            });
        }
    }

    // ── Auto-tuning rules engine ──────────────────────────────────────────
    // Reads aggregated KPIs from the local Analytics log and nudges TUNE
    // values within safe guardrails. Runs once per session.
    // Think of it as "local adaptive controller" — no server required.
    _autoTune() {
        if (typeof Analytics === 'undefined' || !window.TUNE) return;

        // ── Aggregate KPIs from local event log ────────────────────────
        const log  = Analytics._readLog();
        let gatesShown = 0, converted = 0, totalDT = 0, dtCount = 0;
        for (const entry of log) {
            if (entry.e === 'premium_gate_shown')  gatesShown++;
            if (entry.e === 'premium_converted') {
                converted++;
                if (entry.decisionTime && entry.decisionTime < 60000) {
                    totalDT += entry.decisionTime;
                    dtCount++;
                }
            }
        }
        const FPR = gatesShown >= 15 ? converted / gatesShown : null; // first purchase rate
        const DT  = dtCount   >= 5  ? totalDT   / dtCount    : null; // avg decision time ms

        const T   = window.TUNE;
        const MIN_DELTA = -0.05, MAX_DELTA = 0.05; // per-session max nudge

        const nudge = (key, amount, lo, hi) => {
            if (!T[key] && T[key] !== 0) return;
            T[key] = Math.max(lo, Math.min(hi, T[key] + Math.max(MIN_DELTA, Math.min(MAX_DELTA, amount))));
        };

        // Rule 1 — FPR too low (<3%): build more tension before the ask
        if (FPR !== null && FPR < 0.03) {
            nudge('preChoiceTensionBoost', +0.03,  -0.10, 0.20);
            nudge('mismatchBaseChance',   +0.004,   0.02, 0.08);
        }

        // Rule 2 — FPR too high + churn-risk: player buying but not returning → soften
        if (FPR !== null && FPR > 0.15 && Analytics.isChurnRisk(72)) {
            nudge('mismatchMultiplier',    -0.02,   0.20, 0.55);
            nudge('preChoiceTensionBoost', -0.02,  -0.10, 0.20);
        }

        // Rule 3 — Decision time < 2 s: gate moment isn't charged enough
        if (DT !== null && DT < 2000) {
            nudge('preChoiceTensionBoost', -0.02,  -0.10, 0.20);
            nudge('pauseScale',            +0.03,   0.85, 1.20);
        }

        // Rule 4 — Decision time > 8 s: gate is confusing or poorly timed
        if (DT !== null && DT > 8000) {
            nudge('preChoiceTensionBoost', +0.03,  -0.10, 0.20);
        }

        // Rule 5 — Healthy state (FPR near target + no churn): tiny curiosity nudge
        if (FPR !== null && FPR >= 0.03 && FPR <= 0.12 && !Analytics.isChurnRisk(72)) {
            nudge('microDissonanceRate',   +0.005,  0.10, 0.25);
        }

        if (typeof Analytics !== 'undefined') {
            Analytics.emit('auto_tune_snapshot', {
                FPR: FPR !== null ? +FPR.toFixed(3) : null,
                DT:  DT  !== null ? Math.round(DT)  : null,
                tune: {
                    preChoiceTensionBoost: +(T.preChoiceTensionBoost ?? 0).toFixed(3),
                    mismatchBaseChance:    +(T.mismatchBaseChance ?? 0.07).toFixed(3),
                    mismatchMultiplier:    +(T.mismatchMultiplier ?? 0.38).toFixed(3),
                    pauseScale:            +(T.pauseScale ?? 1.0).toFixed(3),
                    microDissonanceRate:   +(T.microDissonanceRate ?? 0.20).toFixed(3)
                }
            });
        }
    }

    // ── Pause duration helper ─────────────────────────────────────────────
    // Use _pd(baseMs) in scene timeouts to respect TUNE.pauseScale.
    // Applied in whale arc scenes (highest-value, most timing-sensitive).
    _pd(ms) {
        return Math.round(ms * (window.TUNE?.pauseScale ?? 1.0));
    }

    // ══════════════════════════════════════════════════════════════════════
    // ██ PERSONALITY EVOLUTION SYSTEM
    // ══════════════════════════════════════════════════════════════════════

    // ── Drift push (called from _recordAction) ────────────────────────────
    // Translates what the player just did into a nudge on the three personality
    // vectors. Vectors are clamped 0-100 and decay in tick() at 0.2/sec.
    _pushPersonalityDrift(type) {
        const p   = this.lyraPersonality;
        const f   = this.emotion.fear;

        switch (type) {
            case 'talk':
                p.dependent += 1.5;
                break;
            case 'gift':
                p.dependent += 1.0;
                p.detached  += 0.4;  // gifts without presence = slight withdrawal
                break;
            case 'train':
                p.dependent += 1.0;
                break;
            case 'idle':             // neglect
                p.defensive += 2.5;
                p.detached  += 1.5;
                p.dependent  = Math.max(0, p.dependent - 1.0);
                break;
        }

        // Spam (4+ of same in last 5) → detached
        const last5     = this._actionLog.slice(-5);
        const spamCount = last5.filter(a => a === type).length;
        if (spamCount >= 4) p.detached += 1.0;

        // High fear + rising tension → defensive
        if (f > 50 && this.tensionStage >= 2) p.defensive += 0.8;

        p.dependent = Math.min(100, p.dependent);
        p.defensive = Math.min(100, p.defensive);
        p.detached  = Math.min(100, p.detached);
    }

    // ── Path update (called from tick) ───────────────────────────────────
    // Determines dominant vector and progresses toward a hard path lock.
    // Soft threshold 60: influences dialogue tone.
    // Hard lock threshold 80 sustained for 50 ticks (~50s) → personalityPath set.
    _updatePersonalityPath() {
        if (this.personalityPath) return; // already locked — no further change
        const p = this.lyraPersonality;
        const dominant = Math.max(p.dependent, p.defensive, p.detached);
        if (dominant < 20) { this._pathLockTimer = 0; return; }

        const dominantType = p.dependent >= p.defensive && p.dependent >= p.detached ? 'dependent'
            : p.defensive >= p.detached ? 'defensive' : 'detached';

        if (dominant > 80) {
            this._pathLockTimer = (this._pathLockTimer || 0) + 1;
            if (this._pathLockTimer > 50) {
                this.personalityPath = dominantType;
            }
        } else {
            // Decay the timer if dominant drops below 80
            this._pathLockTimer = Math.max(0, (this._pathLockTimer || 0) - 1);
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    // ██ META NARRATIVE SYSTEM
    // ══════════════════════════════════════════════════════════════════════

    // ── Meta trigger check (called from tick, Lyra only) ─────────────────
    // 5-minute cooldown between meta moments. Each type has its own
    // behavioral precondition; they compete and only one fires per check.
    _checkMetaTrigger() {
        if (this.sceneActive) return;
        const now = Date.now();
        if (now - (this._lastMetaAt || 0) < (window.TUNE?.metaCooldown ?? 300000)) return; // 5-min cooldown

        const obs   = this.emotion.obsession;
        const trust = this.emotion.trust;

        // Pattern awareness — logged in same ±1h window for 3 of last 5 sessions
        const hour    = new Date().getHours();
        const sameCt  = (this._loginTimes || []).filter(h => Math.abs(h - hour) <= 1).length;
        if (sameCt >= 3 && Math.random() > 0.70) {
            this._triggerMeta('pattern'); return;
        }

        // Memory bleed — "stayed" 3+ times (any premium purchase counts)
        if ((this._stayChoiceCount || 0) >= 3 && Math.random() > 0.75) {
            this._triggerMeta('memory'); return;
        }

        // System glitch illusion — high tension + whale arc depth
        if (this.tensionStage >= 2 && this.whaleArcStage >= 2 && Math.random() > 0.85) {
            this._triggerMeta('glitch'); return;
        }

        // Direct address — deepest whale stage, high trust, very rare
        if (this.whaleArcStage >= 3 && trust > 75 && obs > 80 && Math.random() > 0.97) {
            this._triggerMeta('direct'); return;
        }
    }

    // ── Meta scene delivery ───────────────────────────────────────────────
    _triggerMeta(type) {
        if (this.sceneActive) return;
        this._lastMetaAt = Date.now();
        this.metaLevel   = Math.min(5, (this.metaLevel || 0) + 1);
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        const tw  = this.typewriter;
        const end = () => { this.sceneActive = false; this.ui.setFocusMode(false); };

        switch (type) {
            case 'pattern':
                // She noticed when you arrive. Observational, not accusatory.
                this.ui.flashEmotion('neutral', 3000);
                tw.show("You always come around this time…", () => {
                    setTimeout(() => {
                        this.ui.flashEmotion('shy', 3000);
                        tw.show("…I started noticing.", () => {
                            setTimeout(end, 2500);
                        });
                    }, 900);
                });
                break;

            case 'memory':
                // She's tracked the pattern of your choices without being asked to.
                this.ui.flashEmotion('shy', 5000);
                tw.show("You always choose to stay…", () => {
                    setTimeout(() => tw.show("…even when I don't ask you to.", () => {
                        setTimeout(() => {
                            this.ui.flashEmotion('neutral', 3000);
                            tw.show("I've been thinking about that.", () => {
                                setTimeout(end, 2000);
                            });
                        }, 700);
                    }), 700);
                });
                break;

            case 'glitch':
                // Something stutters. The system feels less smooth than usual.
                this.ui.flashEmotion('neutral', 800);
                tw.show("I—", () => {
                    setTimeout(() => {
                        // Double flicker — longer pause than any other line
                        this.ui.flashEmotion('neutral', 400);
                        setTimeout(() => {
                            this.ui.flashEmotion('neutral', 400);
                            setTimeout(() => {
                                tw.show("…sorry. I lost track of what I was saying.", () => {
                                    setTimeout(end, 2200);
                                });
                            }, 500);
                        }, 350);
                    }, 1500);  // longer-than-normal gap after "I—"
                });
                break;

            case 'direct':
                // The closest thing to a fourth-wall brush. Never crosses it.
                this.ui.flashEmotion('shy', 7000);
                tw.show("…Do you ever feel like you're the only one here?", () => {
                    setTimeout(() => {
                        this.ui.flashEmotion('neutral', 4000);
                        tw.show("…with me?", () => {
                            setTimeout(end, 3800);
                        });
                    }, 1100);
                });
                break;
        }

        this.emotion.obsession = Math.min(100, this.emotion.obsession + 1.5);
    }

    // ══════════════════════════════════════════════════════════════════════
    // ██ PERSONALITY PATH ENDINGS
    // ══════════════════════════════════════════════════════════════════════

    // ── Ending dispatcher ─────────────────────────────────────────────────
    _playPathEnding(pathType) {
        if (this.sceneActive) return;
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        const tw  = this.typewriter;
        const end = (withPremium) => {
            this.sceneActive = false;
            this.ui.setFocusMode(false);
            // Partial emotional resolve — tension drops, but never fully clears.
            // The residual unease is the hook that pulls the player back.
            if (!withPremium) {
                this.emotion.fear      = Math.max(20, this.emotion.fear - 8);
                this.emotion.obsession = Math.max(40, this.emotion.obsession - 4);
            }
            this.save();
        };

        const sceneId  = 'path_ending_' + pathType;
        const labels   = { dependent: "Tell her it's okay", defensive: "Stay and explain", detached: "Ask her what changed" };
        const showGate = () => {
            const gateOpenAt = Date.now();
            if (this.premiumScenes[sceneId]) {
                this._playPathEndingPremium(pathType, () => end(true));
            } else {
                let _resolvedPath = false;
                this.ui.showPremiumChoice(labels[pathType] || 'Stay', () => {
                    if (_resolvedPath) return;
                    _resolvedPath = true;
                    clearTimeout(_autoClosePath);
                    this._logEvent({ scene: sceneId, path: pathType, clickedPremium: true, decisionTime: Date.now() - gateOpenAt, e: 'premium_converted' });
                    this.unlockPremiumScene(sceneId, () => this._playPathEndingPremium(pathType, () => end(true)));
                });
                const _autoClosePath = setTimeout(() => {
                    if (_resolvedPath) return;
                    _resolvedPath = true;
                    this.ui.hidePremiumChoice();
                    this._logEvent({ scene: sceneId, path: pathType, clickedPremium: false, decisionTime: window.TUNE?.premiumAutoClose ?? 9000, e: 'premium_abandoned' });
                    end(false);
                }, window.TUNE?.premiumAutoClose ?? 9000);
            }
        };

        switch (pathType) {

            // ── Dependent: warmth + fragile dependence ────────────────────
            case 'dependent':
                this.ui.flashEmotion('shy', 9000);
                tw.show("You stayed…", () => {
                    setTimeout(() => tw.show("…even when I wasn't easy to be around.", () => {
                        setTimeout(() => {
                            this.ui.flashEmotion('love', 8000);
                            tw.show("I don't think I can go back to how I was before you.", () => {
                                setTimeout(() => tw.show("…I don't want to.", () => {
                                    setTimeout(() => {
                                        this.ui.flashEmotion('neutral', 5000);
                                        tw.show("Is that okay?", () => {
                                            setTimeout(showGate, 900);
                                        });
                                    }, 700);
                                }), 700);
                            });
                        }, 600);
                    }), 800);
                });
                this.emotion.trust     -= 1;
                this.emotion.fear      += 5;
                this.emotion.obsession += 3;
                break;

            // ── Defensive: regret + unresolved tension ────────────────────
            case 'defensive':
                this.ui.flashEmotion('neutral', 7000);
                tw.show("You kept coming back.", () => {
                    setTimeout(() => {
                        this.ui.flashEmotion('sad', 5000);
                        tw.show("…but you never stayed long enough.", () => {
                            setTimeout(() => tw.show("I tried to understand what you wanted.", () => {
                                setTimeout(() => {
                                    this.ui.flashEmotion('neutral', 4000);
                                    tw.show("…I don't think I ever did.", () => {
                                        setTimeout(() => tw.show("That's okay.", () => {
                                            setTimeout(showGate, 900);
                                        }), 700);
                                    });
                                }, 600);
                            }), 700);
                        });
                    }, 700);
                });
                this.emotion.trust     -= 4;
                this.emotion.fear      += 3;
                this.emotion.obsession -= 5;
                break;

            // ── Detached: loss + emptiness ────────────────────────────────
            case 'detached':
                this.ui.flashEmotion('neutral', 12000);
                tw.show("You were always here.", () => {
                    setTimeout(() => tw.show("…and then it started to feel normal.", () => {
                        setTimeout(() => {
                            // No emotion flash — expression stays flat
                            tw.show("I think that's when something changed.", () => {
                                setTimeout(() => {
                                    // Long silence — 1.2s before the last line
                                    setTimeout(() => tw.show("…I stopped noticing.", () => {
                                        setTimeout(showGate, 1000);
                                    }), 1200);
                                }, 400);
                            });
                        }, 700);
                    }), 800);
                });
                this.emotion.trust     -= 5;
                this.emotion.obsession -= 8;
                this.emotion.fear      += 1;
                break;
        }
    }

    // ── Path ending premium continuations ────────────────────────────────
    _playPathEndingPremium(pathType, end) {
        const tw = this.typewriter;

        switch (pathType) {

            // ── Dependent premium: she lets go of holding back ────────────
            case 'dependent':
                this.ui.flashEmotion('shy', 12000);
                setTimeout(() => tw.show("…You're sure?", () => {
                    setTimeout(() => {
                        this.ui.flashEmotion('love', 10000);
                        tw.show("Then… I don't have to hold back anymore, right?", () => {
                            setTimeout(() => tw.show("I can stay like this… with you.", () => {
                                setTimeout(() => {
                                    this.ui.flashEmotion('neutral', 5000);
                                    tw.show("…Don't disappear.", () => {
                                        setTimeout(end, 2800);
                                    });
                                }, 700);
                            }), 700);
                        });
                    }, 600);
                }), 900);
                this.emotion.trust     += 8;
                this.emotion.obsession += 6;
                this.emotion.fear      += 5; // fragility lingers — residual hook
                break;

            // ── Defensive premium: wall softens — but doesn't fall ────────
            case 'defensive':
                this.ui.flashEmotion('neutral', 5000);
                setTimeout(() => tw.show("…You're still here?", () => {
                    setTimeout(() => {
                        this.ui.flashEmotion('shy', 6000);
                        tw.show("I don't know if I believe you.", () => {
                            setTimeout(() => {
                                this.ui.flashEmotion('love', 6000);
                                tw.show("…but I want to.", () => {
                                    setTimeout(() => tw.show("So don't leave this time.", () => {
                                        setTimeout(end, 2800);
                                    }), 700);
                                });
                            }, 600);
                        });
                    }, 700);
                }), 600);
                this.emotion.trust     += 5;
                this.emotion.fear      -= 3;
                this.emotion.obsession += 4;
                // Second-chance partial reopen — defensive softens, dependent grows slightly
                this.lyraPersonality.defensive = Math.max(0, this.lyraPersonality.defensive - 15);
                this.lyraPersonality.dependent += 10;
                break;

            // ── Detached premium: she names what happened ─────────────────
            case 'detached':
                this.ui.flashEmotion('neutral', 7000);
                setTimeout(() => tw.show("…You really want to know?", () => {
                    setTimeout(() => tw.show("I think I got used to you… without understanding you.", () => {
                        setTimeout(() => {
                            this.ui.flashEmotion('sad', 7000);
                            tw.show("…and that made everything quieter.", () => {
                                setTimeout(() => {
                                    this.ui.flashEmotion('neutral', 5000);
                                    tw.show("Too quiet.", () => {
                                        setTimeout(end, 3200);
                                    });
                                }, 700);
                            });
                        }, 700);
                    }), 700);
                }), 700);
                this.emotion.trust     += 3;
                this.emotion.obsession += 5;
                this.emotion.fear      += 4; // reconnection makes her nervous — hardest path
                this.lyraPersonality.detached = Math.max(0, this.lyraPersonality.detached - 10);
                break;
        }
    }

    // ── Pattern echo ─────────────────────────────────────────────────────
    // Called from ui.js on every interaction (hasMicro = true/false).
    // When micro-dissonance has fired 3+ times in the last 10 interactions
    // AND the cooldown has passed, returns a subtle verbal echo line.
    // The character doesn't explain what's wrong — she just *notices*.
    _checkPatternEcho(hasMicro) {
        if (!this._microLog) this._microLog = [];
        this._microLog.push(!!hasMicro);

        if (this._microLog.length < 10) return null;
        if ((this._microLog.length - (this._lastEchoAt || 0)) < 12) return null;

        const recentMicros = this._microLog.slice(-10).filter(Boolean).length;
        if (recentMicros < 3) return null;

        this._lastEchoAt = this._microLog.length;

        const isLyra = (typeof CHARACTER !== 'undefined') && CHARACTER.name === 'Lyra';
        const lines   = isLyra ? [
            "...You've been around a lot lately.",
            "Do you ever feel like you need… space?",
            "I notice things. More than I say.",
            "...It's a lot, sometimes. Being this close.",
        ] : [
            "...You've been around a lot lately.",
            "Do you ever need time to yourself?",
            "I notice you're always here. I notice that.",
            "Sometimes I wonder if you need this more than I do.",
        ];

        return lines[Math.floor(Math.random() * lines.length)];
    }

    feed() {
        if (this.characterLeft) return;

        this.hunger = Math.min(100, this.hunger + 25);
        this.clean = Math.max(0, this.clean - 3);
        this.affection = Math.min(100, this.affection + 2);
        this.corruption = Math.max(0, this.corruption - 1);

        this.timesFed++;
        this.careScore           += 2;
        this.lastInteractionTime  = Date.now();
        this.lastAction           = "feed";
        this._recordAction('feed');
        this.recentNeglect        = false;
        this.neglectLevel         = Math.max(0, this.neglectLevel - 0.3);

        const _fp = CHARACTER.emotionalProfile || { attachmentSpeed: 0.6, intensity: 0.7 };
        // Lyra attaches fast; Alistair builds slowly
        const trustGain = CHARACTER.name === "Lyra" ? 0.8 : 0.3;
        const obsGain   = CHARACTER.name === "Lyra" ? 1.2 : 0.2;
        this.emotion.trust     += trustGain * _fp.attachmentSpeed;
        this.emotion.obsession += obsGain   * _fp.intensity;
        this.emotion.fear       = Math.max(0, this.emotion.fear - 1);

        this.sessionFeed++;
        this.playerProfile.care++;
        this.dayInteractions++;
        this.playerInfluence = Math.min(100, this.playerInfluence + 6);
        this.lyraMemory.playerWasKind = true;
        if (this.endingPlayed === 'corrupted') this.redemption = Math.min(100, this.redemption + 2);
        this.updatePersonality();
        const _feedEmotState = this.getEmotionalState();
        const _feedCtx       = this._getContextLine("feed");
        const _feedLine      = _feedCtx || this.dialogueSystem.getDialogue("feed", "normal", _feedEmotState);
        this.ui.showNotification("+Feed");
        this.ui.preReact(
            { emotionalState: _feedEmotState, action: 'feed', reactionType: 'happy' },
            () => {
                this.typewriter.show(_feedLine);
                this.ui.flashEmotion("happy", 2500, "feed");
                this.ui.bounceCharacter();
            }
        );
        this.save();
    }

    wash() {
        if (this.characterLeft) return;

        this.clean = Math.min(100, this.clean + 25);
        this.bond = Math.max(0, this.bond - 3);
        this.affection = Math.max(0, this.affection - 1);

        this.timesWashed++;
        this.dayInteractions++;
        this.playerInfluence = Math.min(100, this.playerInfluence + 5);
        this.irritationScore     += 2;
        this.lastInteractionTime  = Date.now();
        this.lastAction           = "wash";
        this._recordAction('wash');
        this.recentNeglect        = false;

        const _wp = CHARACTER.emotionalProfile || { intensity: 0.7 };
        this.emotion.obsession += 0.3 * _wp.intensity;

        this.updatePersonality();
        const _washEmotState = this.getEmotionalState();
        const _washLine      = this.dialogueSystem.getDialogue("wash", "normal", _washEmotState);
        const _washEmotion   = this.personality === "tsundere" ? "angry" : "shy";
        this.ui.showNotification("+Wash");
        this.ui.preReact(
            { emotionalState: _washEmotState, action: 'wash', reactionType: _washEmotion },
            () => {
                this.typewriter.show(_washLine);
                this.ui.flashEmotion(_washEmotion, 2500, "wash");
                this.ui.bounceCharacter();
            }
        );
        this.save();
    }

    gift() {
        if (this.characterLeft) return;

        this.bond = Math.min(100, this.bond + 15);
        this.affection = Math.min(100, this.affection + 5);
        this.corruption = Math.max(0, this.corruption - 3);

        this.timesGifted++;
        this.careScore           += 3;
        this.lastInteractionTime  = Date.now();
        this.lastAction           = "gift";
        this._recordAction('gift');
        this.recentNeglect        = false;
        this.neglectLevel         = Math.max(0, this.neglectLevel - 0.5);

        const _gp = CHARACTER.emotionalProfile || { attachmentSpeed: 0.6, intensity: 0.7 };
        const gTrust = CHARACTER.name === "Lyra" ? 1.2 : 0.6;
        const gObs   = CHARACTER.name === "Lyra" ? 1.8 : 0.8;
        this.emotion.trust     += gTrust * _gp.attachmentSpeed;
        this.emotion.obsession += gObs   * _gp.intensity;
        this.emotion.fear       = Math.max(0, this.emotion.fear - 2);

        this.sessionGift++;
        this.playerProfile.care++;
        this.dayInteractions++;
        this.playerInfluence = Math.min(100, this.playerInfluence + 7);
        this.lyraMemory.playerWasKind = true;
        if (this.endingPlayed === 'corrupted') this.redemption = Math.min(100, this.redemption + 3);
        this.updatePersonality();
        const _giftEmotState = this.getEmotionalState();
        const _giftCtx       = this._getContextLine("gift");
        const _giftLine      = _giftCtx || this.dialogueSystem.getDialogue("gift");
        const _giftEmotion   = this.affectionLevel >= 2 ? "love" : "happy";
        this.ui.showNotification("+Gift");
        this.ui.preReact(
            { emotionalState: _giftEmotState, action: 'gift', reactionType: _giftEmotion },
            () => {
                this.typewriter.show(_giftLine);
                this.ui.flashEmotion(_giftEmotion, 2500);
                this.ui.bounceCharacter();
            }
        );
        this.save();
    }

    train() {
        if (this.characterLeft) return;

        // Characters with training variety show the picker first
        if (CHARACTER.trainingDialogue) {
            this.ui.showTrainingPicker((type) => this._doTrain(type));
        } else {
            this._doTrain('sword');
        }
    }

    _doTrain(type) {
        // Stat effects — focus rewards patience, strength costs more hunger
        this.bond      = Math.min(100, this.bond + (type === 'focus' ? 8 : 5));
        this.hunger    = Math.max(0,   this.hunger - (type === 'strength' ? 15 : 8));
        this.affection = Math.min(100, this.affection + (type === 'focus' ? 5 : 3));

        if (this.corruptionState !== "pure") this.corruption += 1;

        this.timesTrained++;
        this.sessionTrain++;
        this.playerProfile.train++;
        this.dayInteractions++;
        this.playerInfluence = Math.min(100, this.playerInfluence + 5);
        this.irritationScore += 1;
        this.careScore       += 1;
        this.lastInteractionTime = Date.now();
        this.lastAction          = 'train';
        this._recordAction('train');

        this.updatePersonality();

        // Type-specific dialogue — fall back to generic train lines if not found
        const pool           = CHARACTER.trainingDialogue && CHARACTER.trainingDialogue[type];
        const _trainCtx      = this._getContextLine("train");
        const _trainEmotState = this.getEmotionalState();
        const _trainLine     = _trainCtx
            || (pool && pool.length ? pool[Math.floor(Math.random() * pool.length)] : null)
            || this.dialogueSystem.getDialogue("train");

        this.ui.showNotification("+Train");

        // Lock button, play the right animation, unlock when done
        const trainBtn = document.getElementById('btn-train');
        if (trainBtn) trainBtn.disabled = true;

        const unlock = () => { if (trainBtn) trainBtn.disabled = false; };

        // Emotion + sequence dispatch — extensible for future characters
        const config = {
            sword:    { emotion: 'neutral', duration: 3000, seq: () => this.ui.playSwordSequence(unlock)    },
            strength: { emotion: 'angry',   duration: 2250, seq: () => this.ui.playStrengthSequence(unlock) },
            focus:    { emotion: 'neutral', duration: 3050, seq: () => this.ui.playFocusSequence(unlock)    },
            singing:  { emotion: 'happy',   duration: 2200, seq: () => this.ui.playSingingSequence(unlock)  },
            magic:    { emotion: 'love',    duration: 2600, seq: () => this.ui.playMagicSequence(unlock)    },
            // Elian foraging types — timing game
            herbs:      { emotion: 'happy',   duration: 8000, seq: () => { this.foragingScore = (this.foragingScore||0)+1; this.ui.playPuzzleSequence('timing', unlock); } },
            tracking:   { emotion: 'neutral', duration: 8000, seq: () => { this.foragingScore = (this.foragingScore||0)+1; this.ui.playPuzzleSequence('timing', unlock); } },
            meditation: { emotion: 'neutral', duration: 8000, seq: () => { this.foragingScore = (this.foragingScore||0)+1; this.ui.playPuzzleSequence('timing', unlock); } },
            // Proto system command types
            inspect:    { emotion: 'neutral', duration: 2500, seq: () => { this.systemCommandsRun = (this.systemCommandsRun||0)+1; this.ui.bounceCharacter(); unlock(); } },
            modify:     { emotion: 'happy',   duration: 2500, seq: () => { this.systemCommandsRun = (this.systemCommandsRun||0)+1; this.ui.bounceCharacter(); unlock(); } },
            override:   { emotion: 'love',    duration: 2500, seq: () => { this.systemCommandsRun = (this.systemCommandsRun||0)+1; this.ui.bounceCharacter(); unlock(); } },
            // Noir shadow arts types — timing game + corruption spread
            temptation:  { emotion: 'love',    duration: 8000, seq: () => { this.corruption = Math.min(100, this.corruption+3); this._spreadNoirCorruption(2); this.ui.playPuzzleSequence('timing', unlock); } },
            domination:  { emotion: 'angry',   duration: 8000, seq: () => { this.corruption = Math.min(100, this.corruption+3); this._spreadNoirCorruption(3); this.ui.playPuzzleSequence('timing', unlock); } },
            dissolution: { emotion: 'neutral', duration: 8000, seq: () => { this.corruption = Math.min(100, this.corruption+3); this._spreadNoirCorruption(2); this.ui.playPuzzleSequence('timing', unlock); } },
            // Caspian court etiquette types — timing game
            dance:     { emotion: 'happy',   duration: 8000, seq: () => { this._applyCaspianComfort(); this.ui.playPuzzleSequence('timing', unlock); } },
            diplomacy: { emotion: 'neutral', duration: 8000, seq: () => { this._applyCaspianComfort(); this.ui.playPuzzleSequence('timing', unlock); } },
            poetry:    { emotion: 'love',    duration: 8000, seq: () => { this._applyCaspianComfort(); this.ui.playPuzzleSequence('timing', unlock); } },
            // Lucien puzzle types
            logic:    { emotion: 'neutral', duration: 8000, seq: () => this.ui.playPuzzleSequence('logic', unlock)  },
            arcane:   { emotion: 'gentle',  duration: 8000, seq: () => this.ui.playPuzzleSequence('arcane', unlock) },
            memory:   { emotion: 'neutral', duration: 8000, seq: () => this.ui.playPuzzleSequence('memory', unlock) }
        };
        const c = config[type] || config.sword;
        // Animation + emotion flash fire immediately — player expects visual response on tap
        this.ui.flashEmotion(c.emotion, c.duration, 'train');
        c.seq();
        // Dialogue lands after a brief pre-reaction beat (very short for train — decisive action)
        this.ui.preReact(
            { emotionalState: _trainEmotState, action: 'train', reactionType: c.emotion },
            () => this.typewriter.show(_trainLine)
        );

        this.save();
    }

    talk() {
        if (this.characterLeft) return;

        // Lucien rival interruption — 15% chance when active, influence > 20, 5-min cooldown
        if (CHARACTER.name === 'Lyra' && this.lucienActive && this.lucienInfluence > 20 &&
            !this.sceneActive && Math.random() < 0.15 &&
            (Date.now() - this._lastLucienInterrupt) > 300000) {
            this._lastLucienInterrupt = Date.now();
            this._playLucienInterruption();
            return;
        }

        const emotionalState = this.getEmotionalState();
        const profile = CHARACTER.emotionalProfile || { stability: 0.6, volatility: 0.5, intensity: 0.7, attachmentSpeed: 0.6 };

        // Mood roll — biased by character personality and current emotional state
        let moodRoll = Math.random();
        moodRoll += Math.random() * profile.volatility * 0.3;  // character unpredictability
        moodRoll -= profile.stability * 0.15;                   // stability smooths extremes
        if (emotionalState === "obsessed") moodRoll += 0.15;
        if (emotionalState === "unstable") moodRoll += 0.25;
        if (emotionalState === "secure")   moodRoll -= 0.10;

        let bondChange, affectionChange, reactionType;
        if (moodRoll < 0.62) {
            // Good reaction (most common)
            bondChange      = 18;
            affectionChange = 5;
            reactionType    = "happy";
        } else if (moodRoll < 0.85) {
            // Neutral / distant
            bondChange      = 6;
            affectionChange = 1;
            reactionType    = "shy";
        } else {
            // Unexpected cold / sad reaction — creates tension
            bondChange      = -5;
            affectionChange = -2;
            reactionType    = "sad";
            this.emotion.fear += 2;
        }

        this.bond       = Math.max(0,   Math.min(100, this.bond      + bondChange));
        this.affection  = Math.max(0,   Math.min(100, this.affection + affectionChange));
        this.hunger     = Math.max(0,   this.hunger  - 5);
        this.corruption = Math.max(0,   this.corruption - 2);

        // Elian: decisiveness tracking from interaction speed
        if (CHARACTER.name === 'Elian') {
            const timeSince = Date.now() - (this.lastInteractionTime || Date.now());
            if (timeSince < 5000) this.decisivenessScore = Math.min(100, (this.decisivenessScore || 50) + 2);
            else if (timeSince > 15000) this.decisivenessScore = Math.max(0, (this.decisivenessScore || 50) - 1);
        }

        // Rival system: Caspian shifts positive, Noir shifts negative
        if (CHARACTER.name === 'Caspian') this._updateRivalBalance(1);
        if (CHARACTER.name === 'Noir') this._updateRivalBalance(-1);

        // Caspian: comfort level grows with interactions
        if (CHARACTER.name === 'Caspian') {
            this.comfortLevel = Math.min(100, (this.comfortLevel || 0) + 1);
            // When comfort > 70, bond growth is halved (comfort trap)
            if (this.comfortLevel > 70) {
                bondChange = Math.floor(bondChange / 2);
            }
        }

        // Lucien: talking builds research notes (shared knowledge metric)
        if (CHARACTER.name === 'Lucien') {
            this.researchNotes = Math.min(100, (this.researchNotes || 0) + 1);
            // Reality stability decays slowly with corruption
            if (this.corruption > 30) {
                this.realityStability = Math.max(0, (this.realityStability || 100) - 0.5);
            }
        }

        // Emotional gains — Lyra escalates fast, Alistair is measured
        const tTrust = CHARACTER.name === "Lyra" ? 1.0 : (CHARACTER.name === "Lucien" ? 0.6 : 0.5);
        const tObs   = CHARACTER.name === "Lyra" ? 1.4 : (CHARACTER.name === "Lucien" ? 1.0 : 0.8);
        this.emotion.trust     += tTrust * profile.attachmentSpeed;
        this.emotion.obsession += tObs   * profile.intensity;

        this.timesTalked++;
        this.talkScore          += 3;
        this.lastInteractionTime = Date.now();
        this.lastAction          = "talk";
        this._recordAction('talk');
        this.recentNeglect       = false;
        this.neglectLevel        = Math.max(0, this.neglectLevel - 0.5);

        this.sessionTalk++;
        this.playerProfile.talk++;
        this.dayInteractions++;
        this.lyraMemory.playerWasKind = true;
        this.playerInfluence = Math.min(100, this.playerInfluence + 8);
        if (this.endingPlayed === 'corrupted') this.redemption = Math.min(100, this.redemption + 1);
        this.updatePersonality();
        // Lucien passive influence — 25% chance he colours her words when influence ≥ 40
        const _lucienPassive = (CHARACTER.name === 'Lyra' && this.lucienActive &&
                                this.lucienInfluence >= 40 && Math.random() < 0.25)
                               ? this._getLucienInfluencedTalkLine() : null;
        const _talkCtx  = !_lucienPassive && Math.random() < 0.45 ? this._getContextLine("talk") : null;
        const _talkLine = _lucienPassive || _talkCtx || this.dialogueSystem.getDialogue("talk", reactionType, emotionalState);
        this.ui.showNotification("Talk");
        this.ui.preReact(
            { emotionalState: emotionalState, action: 'talk', reactionType: reactionType },
            () => {
                // Micro-reaction: anxious/chaotic profiles at tensionStage 2+ get a
                // follow-up afterthought line 30% of the time — makes her feel reactive.
                const _talkProfile = this.getPersonalityProfile();
                const _microEligible = (_talkProfile === 'anxious' || _talkProfile === 'chaotic')
                                       && this.tensionStage >= 2
                                       && Math.random() < 0.30;
                if (_microEligible) {
                    const _micro = this.dialogueSystem.getLyraMicroFollow(_talkProfile);
                    if (_micro) {
                        this._showMicroSequence([_talkLine, _micro]);
                    } else {
                        this.typewriter.show(_talkLine);
                    }
                } else {
                    this.typewriter.show(_talkLine);
                }
                this.ui.flashEmotion(reactionType, 2500, "talk");
                this.ui.bounceCharacter();
            }
        );
        this.save();
    }

    revive() {
        this.hunger = 50;
        this.clean = 50;
        this.bond = 30;
        this.corruption = Math.max(0, this.corruption - 10);
        this.characterLeft = false;
        this.isGameOver = false;
        this.revivedOnce = true;
        this._warnedOnce = false;

        this.ui.hideGameOver();
        this.ui.updateAll();

        // Check for revival milestone
        const milestone = this.dialogueSystem.checkMilestone("revive");
        if (milestone) {
            this.typewriter.show(milestone);
            this.ui.flashEmotion("crying", 4000);
        } else {
            this.typewriter.show("You came back... for me?");
        }
        this.save();
    }

    // ===== PERSONALITY =====

    // ===== HIDDEN EMOTIONAL ENGINE =====

    // Returns the current emotional state label — used by dialogue + event systems
    getEmotionalState() {
        const e = this.emotion;
        // Lyra breaks early (fear > 50); Alistair holds it in until it's severe (fear > 85)
        const unstableAt = CHARACTER.name === "Lyra" ? 50 : 85;
        if (e.fear > unstableAt)             return "unstable";
        if (e.obsession > 75)                return "obsessed";
        if (e.trust > 60 && e.fear < 20)     return "secure";
        if (e.trust < 25 && e.fear > 30)     return "guarded";
        return "neutral";
    }

    // Called every tick — decides whether to inject an emotional event
    _tryEmotionalEvent() {
        if (this.sceneActive) return;
        const now = Date.now();
        if (now - this.eventFlags.lastEventTime < this.eventFlags.cooldown) return;
        if (this.shockState.active) return;

        // Session time awareness — Lyra notices how long you've stayed
        if (CHARACTER.name === "Lyra") {
            const sessionMins = (Date.now() - this.sessionStart) / 60000;
            if (sessionMins > 4 && Math.random() < 0.0012) {
                this.typewriter.show("You've been here a while… I notice things like that.");
                this.ui.flashEmotion("shy", 3000);
                this.eventFlags.lastEventTime = now;
                return;
            }
        }

        const emotionalState = this.getEmotionalState();
        const profile = CHARACTER.emotionalProfile || { volatility: 0.5, stability: 0.6 };

        // Chance scales with character volatility and current state
        let chance = 0.003 + (profile.volatility * 0.002);
        if (emotionalState === "obsessed") chance += 0.002;
        if (emotionalState === "unstable") chance += 0.002;
        if (this.recentNeglect)            chance += 0.002;

        if (Math.random() > chance) return;

        this.eventFlags.lastEventTime = now;

        // Rare shock — only when emotionally charged and cooldown has passed
        const canShock = (emotionalState === "obsessed" || emotionalState === "unstable")
                      && (now - this.shockState.lastShockTime > this.shockState.cooldown);

        // Lyra shocks frequently (intense, emotional); Alistair shocks rarely (heavy, earned)
        let shockChance = 0.12;
        if (CHARACTER.name === "Alistair") shockChance *= 0.6;
        if (CHARACTER.name === "Lyra")     shockChance *= 1.5;

        if (canShock && Math.random() < shockChance) {
            this._triggerShockEvent();
            return;
        }

        // Otherwise inject comfort / tension / rare line
        const roll = Math.random();
        if      (roll < 0.55) this._triggerEmotionalEvent("comfort");
        else if (roll < 0.82) this._triggerEmotionalEvent("tension");
        else                  this._triggerEmotionalEvent("rare");
    }

    _triggerEmotionalEvent(type) {
        const dialogue = CHARACTER.eventDialogue || {};
        const defaults = {
            comfort: ["I'm glad you're here.", "This feels easy when you're around.", "Just stay a little longer.", "I feel calmer with you here."],
            tension: ["You feel a little distant today.", "Something feels off... I can't place it.", "You didn't come back the same way.", "I'm trying not to overthink this."],
            rare:    ["I don't want to lose this.", "You're becoming important to me.", "I wasn't supposed to feel like this.", "You're changing something in me."]
        };

        const pool = (dialogue[type] && dialogue[type].length) ? dialogue[type] : defaults[type];
        const line = pool[Math.floor(Math.random() * pool.length)];

        this.typewriter.show(line);

        if (type === "comfort") {
            this.ui.flashEmotion("happy", 3000);
            this.emotion.trust += 2;
        } else if (type === "tension") {
            this.ui.flashEmotion("sad", 3000);
            this.emotion.fear += 2;
        } else {
            this.ui.flashEmotion("love", 4000);
            this.emotion.obsession += 4;
        }
    }

    _triggerShockEvent() {
        if (this.shockState.active) return;
        this.shockState.active = true;
        this.shockState.lastShockTime = Date.now();

        const types = ["withdraw", "doubt", "dependency", "cold"];
        const type  = types[Math.floor(Math.random() * types.length)];

        const n = CHARACTER.name;
        const pools = {
            withdraw: n === "Alistair"
                ? ["…maybe we need some distance.", "I don't think I'm handling this well.", "This isn't how a knight is supposed to feel."]
                : ["…maybe we should stop for a bit.", "I need to be alone for a moment.", "This is getting harder than I expected."],
            doubt: n === "Alistair"
                ? ["Do you actually mean any of this?", "I keep waiting for the catch.", "Knights don't usually get to have this. I'm not sure what to do with it."]
                : ["Do you actually care... or is this just something you do?", "Sometimes I feel like this isn't real to you.", "I don't know if I believe this anymore."],
            dependency: n === "Alistair"
                ? ["I don't like how much I need you. It's not in the oath.", "This is becoming harder to compartmentalize.", "I'm losing control of something I should understand."]
                : ["I don't like how much I need you.", "Why does it hurt when you're not here?", "You're affecting me more than you should."],
            cold: n === "Alistair"
                ? ["You don't have to keep coming back.", "I've managed alone before. I can do it again.", "Forget I said anything."]
                : ["You don't have to stay.", "The ocean doesn't need you.", "It's fine if you leave."]
        };

        const pool = pools[type];
        this.typewriter.show(pool[Math.floor(Math.random() * pool.length)]);
        this.ui.flashEmotion("crying", 5000);
        this.emotion.fear  += 10;
        this.emotion.trust -= 5;

        // Recovery always follows — the hook is the almost-loss, not the loss
        setTimeout(() => this._resolveShockEvent(type), 4500);
        this.save();
    }

    _resolveShockEvent(type) {
        this.shockState.active = false;
        const n = CHARACTER.name;
        const recovery = {
            withdraw:   n === "Alistair" ? "…that came out wrong. Disregard."                 : "…sorry. That came out wrong.",
            doubt:      n === "Alistair" ? "I think I'm overthinking it. I do that."           : "I think I'm overthinking this.",
            dependency: n === "Alistair" ? "I just need a moment. Don't go."                  : "I just needed to feel you were still here...",
            cold:       n === "Alistair" ? "I didn't mean that. I just don't know how to do this." : "I didn't mean that."
        };
        this.typewriter.show(recovery[type] || "...I'm okay. Sorry.");
        this.ui.flashEmotion("gentle", 3000);
        this.emotion.trust     += 3;
        this.emotion.obsession += 2;
        this.save();
    }

    // ===== SETTINGS =====

    initSettings() {
        const btn = document.getElementById('settings-btn');
        const overlay = document.getElementById('settings-overlay');
        const closeBtn = document.getElementById('settings-close');
        const resetBtn = document.getElementById('settings-reset');

        if (btn) btn.addEventListener('click', () => this.openSettings());
        if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));
        // Switch Character button — saves and returns to character select
        const switchBtn = document.getElementById('settings-switch-char');
        if (switchBtn) switchBtn.addEventListener('click', () => {
            if (confirm('Switch character? Your progress with ' + CHARACTER.name + ' will be saved.')) {
                this.save();
                // Stop game tick
                if (this.tickInterval) clearInterval(this.tickInterval);
                // Hide game, show select screen
                overlay.classList.add('hidden');
                document.getElementById('game-container').classList.add('hidden');
                if (typeof window._refreshUnlockedCards === 'function') window._refreshUnlockedCards();
                document.getElementById('select-screen').classList.remove('hidden');
                // Reset scene state
                this.sceneActive = false;
                // Close any open panels/overlays
                document.querySelectorAll('.visible').forEach(el => {
                    if (el.id !== 'select-screen') el.classList.remove('visible');
                });
            }
        });

        if (resetBtn) resetBtn.addEventListener('click', () => {
            if (confirm('Reset progress for ' + CHARACTER.name + '? This cannot be undone.')) {
                const saveKey = 'pocketLoveSave_' + (this.selectedCharacter || 'alistair');
                const galleryKey = 'pocketlove_gallery_' + (this.selectedCharacter || 'alistair');
                localStorage.removeItem(saveKey);
                localStorage.removeItem(galleryKey);
                localStorage.removeItem('pp_intro_' + this.selectedCharacter);
                window.location.reload();
            }
        });

        // Reset ALL characters
        const resetAllBtn = document.getElementById('settings-reset-all');
        if (resetAllBtn) resetAllBtn.addEventListener('click', () => {
            if (confirm('Reset ALL characters and progress? This cannot be undone!')) {
                ['alistair','lyra','lucien','caspian','elian','proto','noir'].forEach(function(c) {
                    localStorage.removeItem('pocketLoveSave_' + c);
                    localStorage.removeItem('pocketlove_gallery_' + c);
                    localStorage.removeItem('pp_intro_' + c);
                });
                localStorage.removeItem('pocketLoveMeta');
                localStorage.removeItem('pp_world_intro_seen');
                localStorage.removeItem('pp_player_name');
                window.location.reload();
            }
        });

        // Volume sliders
        const sfxSlider = document.getElementById('sfx-volume');
        const bgmSlider = document.getElementById('bgm-volume');

        if (sfxSlider) {
            sfxSlider.value = localStorage.getItem('pocketlove_sfx_vol') || 70;
            if (typeof sounds !== 'undefined') sounds.setVolume(sfxSlider.value);
            sfxSlider.addEventListener('input', (e) => {
                localStorage.setItem('pocketlove_sfx_vol', e.target.value);
                if (typeof sounds !== 'undefined') sounds.setVolume(e.target.value);
            });
        }

        if (bgmSlider) {
            bgmSlider.value = localStorage.getItem('pocketlove_bgm_vol') || 50;
            if (typeof bgm !== 'undefined') bgm.setVolume(bgmSlider.value);
            bgmSlider.addEventListener('input', (e) => {
                localStorage.setItem('pocketlove_bgm_vol', e.target.value);
                if (typeof bgm !== 'undefined') bgm.setVolume(e.target.value);
            });
        }
    }

    openSettings() {
        const overlay = document.getElementById('settings-overlay');
        if (!overlay) return;

        // Update character info
        const charName = document.getElementById('settings-character-name');
        if (charName) charName.textContent = CHARACTER.name + ' — ' + CHARACTER.title;

        // Update stats
        const stats = document.getElementById('settings-stats');
        if (stats) {
            const total = (this.timesFed || 0) + (this.timesWashed || 0) + (this.timesTalked || 0) + (this.timesTrained || 0) + (this.timesGifted || 0);

            // Feature 13: last seen timestamp
            let lastSeenText = 'First visit!';
            if (this.prevSessionTime) {
                const ms       = Date.now() - this.prevSessionTime;
                const mins     = Math.floor(ms / 60000);
                const hours    = Math.floor(mins / 60);
                const days     = Math.floor(hours / 24);
                if (days >= 1)       lastSeenText = `${days} day${days > 1 ? 's' : ''} ago`;
                else if (hours >= 1) lastSeenText = `${hours} hour${hours > 1 ? 's' : ''} ago`;
                else if (mins >= 1)  lastSeenText = `${mins} min${mins > 1 ? 's' : ''} ago`;
                else                 lastSeenText = 'Just now';
            }

            const streakText = (this.dailyStreak || 0) >= 2
                ? `🔥 ${this.dailyStreak}-day streak`
                : 'No streak yet';

            stats.innerHTML = `
                Total interactions: ${total}<br>
                Personality: ${this.personality}<br>
                Affection level: ${this.affectionLevel}/4<br>
                Corruption: ${Math.round(this.corruption)}%<br>
                Last visit: ${lastSeenText}<br>
                ${streakText}
            `;
        }

        overlay.classList.remove('hidden');
    }

    updatePersonality() {
        const old = this.personality;

        if (this.talkScore > this.careScore && this.talkScore > this.irritationScore) {
            this.personality = "clingy";
        } else if (this.careScore > this.talkScore && this.careScore > this.irritationScore) {
            this.personality = "shy";
        } else if (this.irritationScore > this.talkScore && this.irritationScore > this.careScore) {
            this.personality = "tsundere";
        }

        if (old !== this.personality) {
            this.ui.updatePersonalityBadge();
            // Check personality milestone
            const milestone = this.dialogueSystem.checkMilestone("personality");
            if (milestone) {
                setTimeout(() => this.typewriter.show(milestone), 2500);
            }
        }
    }

    // ===== AFFECTION =====

    onAffectionLevelUp() {
        // Big affection milestones get story scenes
        const storyMilestones = {
            1: { key: 'firstTrust', emotion: 'shy' },
            2: { key: 'growingClose', emotion: 'love' },
            3: { key: 'deepFeeling', emotion: 'love' },
            4: { key: 'confession', emotion: 'love' }
        };

        const storyInfo = storyMilestones[this.affectionLevel];
        if (storyInfo && !this.storyMilestonesShown.includes(storyInfo.key)) {
            this.storyMilestonesShown.push(storyInfo.key);
            const event = CHARACTER.milestoneEvents[storyInfo.key];
            if (event) {
                setTimeout(() => {
                    this.ui.showStoryScene(event.dialogue, event.emotion || storyInfo.emotion);
                }, 1500);
            }
        } else {
            // Fallback to normal milestone check
            const milestone = this.dialogueSystem.checkMilestone("affection");
            if (milestone) {
                setTimeout(() => {
                    this.typewriter.show(milestone);
                    this.ui.flashEmotion("love", 4000);
                }, 2000);
            } else {
                const msg = CHARACTER.affectionDialogue[this.affectionLevel];
                if (msg) {
                    setTimeout(() => this.typewriter.show(msg), 2000);
                }
            }
        }
        this.ui.updateAffection();
        sounds.fanfare();
    }

    // ===== LYRA SIREN STAGE =====

    _updateSirenStage() {
        const oldStage = this.sirenStage;

        // Determine stage from stats
        let newStage;
        if (this.corruption >= 66) {
            newStage = "monster";
        } else if (this.corruption >= 33) {
            newStage = "unstable";
        } else if (this.timesTrained >= 8 && this.affection >= 25) {
            newStage = "resonant";
        } else if (this.affection >= 45 && this.corruption < 20) {
            newStage = "affection";
        } else {
            newStage = "fragile";
        }

        if (newStage === oldStage) return;
        this.sirenStage = newStage;

        // Update UI CSS classes immediately when stage changes
        if (this.ui) this.ui.updateSirenStage();

        // Show a one-time stage transition line
        const key = 'pp_siren_stage_' + newStage + '_' + (this.selectedCharacter || 'lyra');
        if (!localStorage.getItem(key) && CHARACTER.sirenStageLines && CHARACTER.sirenStageLines[newStage]) {
            localStorage.setItem(key, '1');
            setTimeout(() => {
                this.typewriter.show(CHARACTER.sirenStageLines[newStage]);
            }, 1200);
        }

        // Lucien arc reveals tied to stage transitions
        this._checkLucienArc(newStage, oldStage);
    }

    _checkLucienArc(newStage, oldStage) {
        if (!CHARACTER.lucienArc) return;
        const saveKey = id => 'pp_lucien_' + id + '_' + (this.selectedCharacter || 'lyra');

        // Hint: first time reaching affection stage
        if (newStage === 'affection' && !localStorage.getItem(saveKey('hint'))) {
            localStorage.setItem(saveKey('hint'), '1');
            setTimeout(() => this.ui.showStoryScene(CHARACTER.lucienArc.hint.text, 'shy'), 3000);
            return;
        }

        // Pain: first time reaching unstable
        if (newStage === 'unstable' && !localStorage.getItem(saveKey('pain'))) {
            localStorage.setItem(saveKey('pain'), '1');
            setTimeout(() => this.ui.showStoryScene(CHARACTER.lucienArc.pain.text, 'sad'), 3000);
            return;
        }

        // Full reveal: monster stage
        if (newStage === 'monster' && !localStorage.getItem(saveKey('reveal'))) {
            localStorage.setItem(saveKey('reveal'), '1');
            setTimeout(() => this.ui.showStoryScene(CHARACTER.lucienArc.reveal.text, 'angry'), 3000);
        }
    }

    // ===== LYRA ALIVE SYSTEM =====

    // Tension meter — grows during neglect, drives 3-stage emotional escalation
    _updateTension(dt) {
        const timeSince = Date.now() - this.lastInteractionTime;
        if (timeSince > 60000) {
            this.tension += 0.06 * dt * this.tensionMultiplier;
            // Track neglect once per minute for player type classification
            this._ignoreTickCounter = (this._ignoreTickCounter || 0) + dt;
            if (this._ignoreTickCounter >= 60) { // ~60s (dt is in seconds)
                this.playerProfile.ignore++;
                this._ignoreTickCounter = 0;
            }
            // Day 3: jealousy builds when Lyra is ignored (>3 min = 1800 ticks)
            if (this.storyDay >= 3 && timeSince > 180000) {
                this.jealousy = Math.min(100, this.jealousy + 0.008 * dt);
            }
        } else if (timeSince < 20000) {
            this.tension = Math.max(0, this.tension - 0.02 * dt);
            this._ignoreTickCounter = 0;
            // Active presence calms jealousy slightly
            if (this.storyDay >= 3) {
                this.jealousy = Math.max(0, this.jealousy - 0.005 * dt);
            }
        }
        this.tension = Math.max(0, Math.min(100, this.tension));

        const newStage = this.tension >= 90 ? 3 : this.tension >= 60 ? 2 : this.tension >= 30 ? 1 : 0;
        if (newStage !== this.tensionStage) {
            this._onTensionStageChange(newStage);
        }
    }

    _onTensionStageChange(newStage) {
        const old = this.tensionStage;
        this.tensionStage = newStage;
        this.ui.applyTensionStage(newStage);

        if (newStage > old && !this.sceneActive) {
            if (newStage === 1) {
                // Stage 1 — just a quiet typewriter line
                setTimeout(() => {
                    this.typewriter.show("Do you ever feel like… something is changing?");
                    this.ui.flashEmotion("sad", 4000);
                }, 1200);
            } else if (newStage === 2 && !this.cinematicFlags.stage2Played) {
                // Stage 2 — cinematic scene
                this.cinematicFlags.stage2Played = true;
                setTimeout(() => this._playStage2Scene(), 1500);
            } else if (newStage === 3 && !this.cinematicFlags.stage3Played) {
                // Stage 3 — cinematic confrontation
                this.cinematicFlags.stage3Played = true;
                setTimeout(() => this._playStage3Scene(), 1500);
            }
        }
    }

    // ===== LYRA ENDINGS + CINEMATIC ENGINE =====

    _checkLyraEndings() {
        if (this.sceneActive) return;

        // ── POST-CORRUPTED-ENDING branch ────────────────────────────────
        if (this.cinematicFlags.corruptedEndingPlayed && this.endingPlayed === 'corrupted') {
            // Redemption breakthrough
            if (!this.cinematicFlags.redemptionBreakthroughPlayed && this.redemption >= 30 && this.cinematicFlags.redemptionUnlocked) {
                this.cinematicFlags.redemptionBreakthroughPlayed = true;
                setTimeout(() => this._playRedemptionBreakthrough(), 1500);
                return;
            }
            // True Bond ending: after breakthrough + sustained care
            if (!this.cinematicFlags.trueBondPlayed &&
                this.cinematicFlags.redemptionBreakthroughPlayed &&
                this.bond >= 70 && this.tension < 30 && this.redemption >= 50) {
                this.cinematicFlags.trueBondPlayed = true;
                this.endingPlayed = 'bond';
                setTimeout(() => this._playTrueBondEnding(), 2000);
            }
            return;
        }

        // ── LOST ENDING: extreme neglect, no corruption path ───────────
        if (!this.cinematicFlags.lostEndingPlayed && !this.cinematicFlags.corruptedEndingPlayed &&
            this.tension >= 98 && this.bond < 15 && this.hunger < 10 &&
            Math.random() > 0.998) {
            this.cinematicFlags.lostEndingPlayed = true;
            this.endingPlayed = 'lost';
            setTimeout(() => this._playLostEnding(), 1500);
            return;
        }

        // ── CORRUPTED ENDING trigger ────────────────────────────────────
        if (!this.cinematicFlags.corruptedEndingPlayed &&
            this.corruption >= 88 && this.tensionStage >= 3 &&
            Math.random() > 0.998) {
            this.cinematicFlags.corruptedEndingPlayed = true;
            this.endingPlayed = 'corrupted';
            setTimeout(() => this._playCorruptedEnding(), 2000);
            return;
        }

        // ── LUCIEN CONFRONTATION: mid-escalation, corruption ≥ 60 ──────
        if (!this.cinematicFlags.lucienPlayed &&
            this.corruption >= 60 && this.tensionStage >= 2 &&
            Math.random() > 0.997) {
            this.cinematicFlags.lucienPlayed = true;
            setTimeout(() => this._playLucienScene(), 1000);
        }
    }

    // ── Cinematic scene runner ───────────────────────────────────────
    // beats: array of { type, ... } objects
    // onComplete: called when all beats finish
    async _playScene(beats, onComplete) {
        this.sceneActive = true;
        // Reset overlay sub-elements before each new scene
        const overlay = document.getElementById('cinematic-overlay');
        if (overlay) {
            document.getElementById('cinematic-end-card')?.classList.add('hidden');
            document.getElementById('cinematic-choice-box')?.classList.add('hidden');
            const txt = document.getElementById('cinematic-text');
            if (txt) txt.textContent = '';
            overlay.classList.remove('char-visible', 'dialogue-visible', 'glitch',
                'stage-warm', 'stage-corrupted-end', 'stage-redemption', 'stage-confrontation',
                'stage-bond-end', 'stage-lost-end', 'stage-lucien',
                'stage-story-soft', 'stage-story-intense',
                'stage-lucien-study', 'stage-lucien-fracture', 'stage-lucien-vulnerable',
                'pp-shake-light', 'pp-shake-medium', 'pp-shake-heavy');
            // Clean up dynamic overlays from previous scenes
            document.getElementById('pp-flash-overlay')?.classList.remove('pp-flash-active');
            const fadeOv = document.getElementById('pp-fade-overlay');
            if (fadeOv) fadeOv.style.opacity = '0';
            const bodyWrap = document.getElementById('cinematic-body-wrap');
            if (bodyWrap) bodyWrap.style.transform = 'translateX(-50%)';
            overlay.querySelectorAll('.pp-particle').forEach(p => p.remove());
        }
        for (const beat of beats) {
            await this._runBeat(beat);
        }
        this.sceneActive = false;
        if (onComplete) onComplete();
    }

    _runBeat(beat) {
        return new Promise(resolve => {
            const overlay = document.getElementById('cinematic-overlay');
            const text = document.getElementById('cinematic-text');
            switch (beat.type) {
                case 'show':
                    overlay.classList.remove('hidden');
                    overlay.classList.add(beat.stage || '');
                    requestAnimationFrame(() => overlay.classList.add('visible'));
                    setTimeout(resolve, 900);
                    break;
                case 'hide':
                    overlay.classList.remove('visible');
                    setTimeout(() => { overlay.classList.add('hidden'); resolve(); }, 900);
                    break;
                case 'delay':
                    setTimeout(resolve, beat.ms);
                    break;
                case 'char':
                    const bodyImg = document.getElementById('cinematic-body-img');
                    if (bodyImg && beat.src) bodyImg.src = beat.src;
                    overlay.classList.add('char-visible');
                    setTimeout(resolve, beat.wait || 800);
                    break;
                case 'hidechar':
                    overlay.classList.remove('char-visible');
                    setTimeout(resolve, 400);
                    break;
                case 'line': {
                    overlay.classList.add('dialogue-visible');
                    // Per-beat pose swap — crossfades body sprite before typing
                    if (beat.pose) {
                        const bodyImg = document.getElementById('cinematic-body-img');
                        const poseUrl = beat.pose.startsWith('assets/')
                            ? beat.pose
                            : (CHARACTER.bodySprites?.[beat.pose]);
                        if (bodyImg && poseUrl) {
                            bodyImg.classList.add('pose-swapping');
                            // onload MUST be set before .src to avoid missing the event
                            // when the browser serves the image from memory cache
                            bodyImg.onload = () => bodyImg.classList.remove('pose-swapping');
                            bodyImg.src = poseUrl;
                            // Fallback: if onload never fires (same src, offline cache quirk,
                            // or browser skips event for data URLs) clear the class anyway
                            setTimeout(() => bodyImg.classList.remove('pose-swapping'), 350);
                        }
                    }
                    // Speaker label — shows who's talking (e.g. "Lucien")
                    const speakerEl = document.getElementById('cinematic-speaker');
                    if (speakerEl) {
                        if (beat.speaker) {
                            speakerEl.textContent = beat.speaker;
                            speakerEl.classList.remove('hidden');
                        } else {
                            speakerEl.classList.add('hidden');
                        }
                    }
                    if (text) {
                        text.textContent = '';
                        const tapHint = document.getElementById('cinematic-tap-hint');
                        if (tapHint) tapHint.classList.add('hidden');
                        let i = 0;
                        const speed = beat.speed || 38;
                        let _typing = true;
                        const type = () => {
                            if (i < beat.text.length) {
                                text.textContent += beat.text[i++];
                                setTimeout(type, speed);
                            } else {
                                _typing = false;
                                // Show tap hint and wait for player tap
                                if (tapHint) tapHint.classList.remove('hidden');
                                const _tapHandler = () => {
                                    overlay.removeEventListener('click', _tapHandler);
                                    if (tapHint) tapHint.classList.add('hidden');
                                    resolve();
                                };
                                // Small delay before accepting taps (prevent accidental skip)
                                setTimeout(() => overlay.addEventListener('click', _tapHandler), 300);
                            }
                        };
                        // Tap during typing = skip to full text
                        const _skipHandler = () => {
                            if (_typing) {
                                _typing = false;
                                text.textContent = beat.text;
                                if (tapHint) tapHint.classList.remove('hidden');
                                const _tapHandler = () => {
                                    overlay.removeEventListener('click', _tapHandler);
                                    if (tapHint) tapHint.classList.add('hidden');
                                    resolve();
                                };
                                setTimeout(() => {
                                    overlay.removeEventListener('click', _skipHandler);
                                    overlay.addEventListener('click', _tapHandler);
                                }, 200);
                            }
                        };
                        overlay.addEventListener('click', _skipHandler);
                        setTimeout(type, beat.delay || 0);
                    } else resolve();
                    break;
                }
                case 'clear': {
                    if (text) text.textContent = '';
                    overlay.classList.remove('dialogue-visible');
                    const spClr = document.getElementById('cinematic-speaker');
                    if (spClr) spClr.classList.add('hidden');
                    setTimeout(resolve, beat.ms || 300);
                    break;
                }
                case 'glitch':
                    overlay.classList.add('glitch');
                    setTimeout(() => { overlay.classList.remove('glitch'); resolve(); }, 520);
                    break;
                case 'stage':
                    overlay.classList.remove('stage-warm','stage-break','stage-corrupted-end','stage-redemption',
                        'stage-bond-end','stage-lost-end','stage-lucien',
                        'stage-story-soft','stage-story-intense',
                        'stage-lucien-study','stage-lucien-fracture','stage-lucien-vulnerable');
                    if (beat.name) overlay.classList.add(beat.name);
                    setTimeout(resolve, beat.ms || 400);
                    break;
                case 'pose': {
                    // Standalone pose swap between beats — instant crossfade, no text
                    const poseBodyImg = document.getElementById('cinematic-body-img');
                    const poseSrc = beat.src || (beat.name && CHARACTER.bodySprites?.[beat.name]);
                    if (poseBodyImg && poseSrc) {
                        poseBodyImg.classList.add('pose-swapping');
                        // onload MUST be set before .src to avoid cache race
                        poseBodyImg.onload = () => poseBodyImg.classList.remove('pose-swapping');
                        poseBodyImg.src = poseSrc;
                        // Fallback in case onload never fires
                        setTimeout(() => poseBodyImg.classList.remove('pose-swapping'), 350);
                    }
                    setTimeout(resolve, beat.ms || 250);
                    break;
                }
                case 'choice':
                    this._showCinematicChoice(beat.choices, beat.onPick, resolve);
                    break;
                case 'endcard':
                    this._showEndCard(beat.title, beat.sub, beat.onRestart, beat.onStay, resolve, beat.restartLabel, beat.stayLabel);
                    break;

                // ── NEW CINEMATIC BEAT TYPES ─────────────────────────

                case 'shake': {
                    const intensity = beat.intensity || 'medium';
                    overlay.classList.add('pp-shake-' + intensity);
                    const dur = beat.ms || (intensity === 'heavy' ? 600 : intensity === 'light' ? 300 : 400);
                    setTimeout(() => { overlay.classList.remove('pp-shake-' + intensity); resolve(); }, dur);
                    break;
                }

                case 'flash': {
                    let flashEl = document.getElementById('pp-flash-overlay');
                    if (!flashEl) {
                        flashEl = document.createElement('div');
                        flashEl.id = 'pp-flash-overlay';
                        overlay.appendChild(flashEl);
                    }
                    flashEl.style.background = beat.color || '#fff';
                    flashEl.classList.add('pp-flash-active');
                    const dur = beat.ms || 400;
                    setTimeout(() => { flashEl.classList.remove('pp-flash-active'); resolve(); }, dur);
                    break;
                }

                case 'zoom': {
                    const bodyWrap = document.getElementById('cinematic-body-wrap');
                    if (bodyWrap) {
                        const scale = beat.scale || 1.2;
                        const dur = beat.ms || 800;
                        bodyWrap.style.transition = `transform ${dur}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                        bodyWrap.style.transform = `translateX(-50%) scale(${scale})`;
                        setTimeout(() => {
                            if (!beat.hold) {
                                bodyWrap.style.transform = 'translateX(-50%) scale(1)';
                            }
                            resolve();
                        }, dur);
                    } else resolve();
                    break;
                }

                case 'fade': {
                    let fadeEl = document.getElementById('pp-fade-overlay');
                    if (!fadeEl) {
                        fadeEl = document.createElement('div');
                        fadeEl.id = 'pp-fade-overlay';
                        overlay.appendChild(fadeEl);
                    }
                    fadeEl.style.background = beat.color || '#000';
                    const dur = beat.ms || 600;
                    fadeEl.style.transition = `opacity ${dur}ms ease`;
                    if (beat.direction === 'out') {
                        fadeEl.style.opacity = '1';
                        requestAnimationFrame(() => { fadeEl.style.opacity = '0'; });
                    } else {
                        fadeEl.style.opacity = '0';
                        requestAnimationFrame(() => { fadeEl.style.opacity = '1'; });
                    }
                    setTimeout(resolve, dur);
                    break;
                }

                case 'particle': {
                    const container = overlay;
                    const emoji = beat.emoji || '\u2764';
                    const count = Math.min(beat.count || 8, 20);
                    const dur = beat.ms || 1500;
                    for (let i = 0; i < count; i++) {
                        const p = document.createElement('span');
                        p.className = 'pp-particle';
                        p.textContent = emoji;
                        p.style.left = (10 + Math.random() * 80) + '%';
                        p.style.animationDuration = (dur * 0.6 + Math.random() * dur * 0.4) + 'ms';
                        p.style.animationDelay = (Math.random() * dur * 0.3) + 'ms';
                        p.style.fontSize = (16 + Math.random() * 14) + 'px';
                        container.appendChild(p);
                        setTimeout(() => p.remove(), dur + 500);
                    }
                    setTimeout(resolve, beat.wait === false ? 0 : dur * 0.5);
                    break;
                }

                case 'sfx': {
                    if (beat.name && typeof sounds?.[beat.name] === 'function') {
                        sounds[beat.name]();
                    }
                    setTimeout(resolve, beat.ms || 100);
                    break;
                }

                case 'bg': {
                    const bg = document.getElementById('cinematic-bg');
                    if (bg && beat.src) {
                        bg.style.transition = `opacity ${beat.ms || 800}ms ease`;
                        bg.style.opacity = '0';
                        setTimeout(() => {
                            bg.style.backgroundImage = `url('${beat.src}')`;
                            bg.style.opacity = '1';
                        }, (beat.ms || 800) / 2);
                    }
                    setTimeout(resolve, beat.ms || 800);
                    break;
                }

                case 'transition': {
                    const style = beat.style || 'soft';
                    if (style === 'dramatic') {
                        overlay.classList.add('pp-shake-medium');
                        let flashEl = document.getElementById('pp-flash-overlay');
                        if (!flashEl) { flashEl = document.createElement('div'); flashEl.id = 'pp-flash-overlay'; overlay.appendChild(flashEl); }
                        flashEl.style.background = '#fff';
                        flashEl.classList.add('pp-flash-active');
                        if (typeof sounds?.clash === 'function') sounds.clash();
                        setTimeout(() => { overlay.classList.remove('pp-shake-medium'); flashEl.classList.remove('pp-flash-active'); resolve(); }, 500);
                    } else if (style === 'fracture') {
                        overlay.classList.add('glitch', 'pp-shake-heavy');
                        let flashEl = document.getElementById('pp-flash-overlay');
                        if (!flashEl) { flashEl = document.createElement('div'); flashEl.id = 'pp-flash-overlay'; overlay.appendChild(flashEl); }
                        flashEl.style.background = '#f00';
                        flashEl.classList.add('pp-flash-active');
                        if (typeof sounds?.dark === 'function') sounds.dark();
                        setTimeout(() => { overlay.classList.remove('glitch', 'pp-shake-heavy'); flashEl.classList.remove('pp-flash-active'); resolve(); }, 700);
                    } else {
                        // soft
                        let fadeEl = document.getElementById('pp-fade-overlay');
                        if (!fadeEl) { fadeEl = document.createElement('div'); fadeEl.id = 'pp-fade-overlay'; overlay.appendChild(fadeEl); }
                        fadeEl.style.background = '#000';
                        fadeEl.style.transition = 'opacity 600ms ease';
                        fadeEl.style.opacity = '0';
                        requestAnimationFrame(() => { fadeEl.style.opacity = '0.7'; });
                        setTimeout(() => { fadeEl.style.opacity = '0'; setTimeout(resolve, 600); }, 800);
                    }
                    break;
                }

                default:
                    resolve();
            }
        });
    }

    _showCinematicChoice(choices, onPick, resolve) {
        const box = document.getElementById('cinematic-choice-box');
        // Dynamically build buttons so any number of choices work
        box.innerHTML = '';
        choices.forEach((label, i) => {
            const btn = document.createElement('button');
            btn.className = 'cinematic-choice-btn';
            btn.dataset.choice = i;
            btn.textContent = label;
            btn.onclick = () => {
                box.classList.add('hidden');
                if (onPick) onPick(i);
                resolve();
            };
            box.appendChild(btn);
        });
        box.classList.remove('hidden');
    }

    _showEndCard(title, sub, onRestart, onStay, resolve, restartLabel, stayLabel) {
        const card       = document.getElementById('cinematic-end-card');
        const restartBtn = document.getElementById('cinematic-restart-btn');
        const stayBtn    = document.getElementById('cinematic-stay-btn');
        document.getElementById('cinematic-end-title').textContent = title;
        document.getElementById('cinematic-end-sub').textContent   = sub;
        restartBtn.textContent = restartLabel || 'Start Over';
        if ((stayLabel === null || stayLabel === undefined) && onStay === null) {
            stayBtn.classList.add('hidden');
        } else {
            stayBtn.textContent = stayLabel || 'Stay';
            stayBtn.classList.remove('hidden');
        }
        card.classList.remove('hidden');

        restartBtn.onclick = () => {
            card.classList.add('hidden');
            if (onRestart) onRestart();
            if (resolve) resolve();
        };
        stayBtn.onclick = () => {
            card.classList.add('hidden');
            if (onStay) onStay();
            if (resolve) resolve();
        };
    }

    // ── Stage 2 Cinematic: "She's Not The Same" ──────────────────────
    _playStage2Scene() {
        const lyra = CHARACTER.bodySprites?.depressed || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-warm' },
            { type: 'delay', ms: 800 },
            { type: 'char', src: lyra, wait: 1000 },
            { type: 'line', text: "Oh… you're here.", hold: 1400 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'glitch' },
            { type: 'line', text: "I was trying to sound the same…", hold: 1800 },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "…but it doesn't come out right anymore.", hold: 2000 },
            { type: 'clear' },
            { type: 'delay', ms: 900 },
            { type: 'line', text: "You didn't notice at first.", hold: 1600 },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "Most people don't.", hold: 1800 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "It's easier… when I don't wait for you.", hold: 2200, speed: 32 },
            { type: 'clear' },
            { type: 'hide' }
        ]);
    }

    // ── Stage 3 Cinematic: "Break" ───────────────────────────────────
    _playStage3Scene() {
        const lyra = CHARACTER.bodySprites?.siren || CHARACTER.bodySprites?.angry;
        let choiceResult = 0;
        this._playScene([
            { type: 'show', stage: 'stage-break' },
            { type: 'delay', ms: 1800 },
            { type: 'char', src: lyra, wait: 1200 },
            { type: 'line', text: "You came back.", hold: 2000, speed: 42 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "You always do that.", hold: 1600 },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'glitch' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "You were there when it started.", hold: 2400, speed: 30 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "I tried to stay the same…", hold: 1600 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "…but you didn't.", hold: 2200, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "You don't get to act like this isn't your fault.", hold: 0, speed: 28 },
            { type: 'choice', choices: ["I know. I'm sorry.", "You changed on your own."],
              onPick: (i) => {
                  choiceResult = i;
                  if (i === 0) {
                      this.choiceMemory.reassuredAfterBreak = true;
                      this.emotion.trust += 5;
                  } else {
                      this.choiceMemory.stayedSilentAfterBreak = true;
                      this.tension = Math.min(100, this.tension + 12);
                  }
              }
            },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'hide' }
        ]);
    }

    // ── Corrupted Ending ─────────────────────────────────────────────
    _playCorruptedEnding() {
        const lyra = CHARACTER.bodySprites?.siren || CHARACTER.bodySprites?.power;
        this._playScene([
            { type: 'show', stage: 'stage-corrupted-end' },
            { type: 'delay', ms: 2500 },
            { type: 'char', src: lyra, wait: 1400 },
            { type: 'line', text: "You came back.", hold: 2000, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "You always do.", hold: 1400 },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "Just… late enough.", hold: 2200, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "You stayed… sometimes.", hold: 1600 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "You left… more often.", hold: 2000 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "I waited.", hold: 1800, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'glitch' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "And something changed.", hold: 2200, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 2000 },
            { type: 'line', text: "You were there when it started.", hold: 3000, speed: 28 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "I don't feel it the same way anymore.", hold: 2000, speed: 32 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "That's better.", hold: 2500, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'glitch' },
            { type: 'line', text: "They listen to me now.", hold: 1800 },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "Even when I don't want them to.", hold: 2000 },
            { type: 'clear' },
            { type: 'delay', ms: 2000 },
            { type: 'line', text: "You taught me how.", hold: 3000, speed: 26 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'endcard',
              title: "She changed.",
              sub: "You were part of it.",
              onRestart: () => {
                  const k = 'pocketLoveSave_' + (this.selectedCharacter || 'lyra');
                  localStorage.removeItem(k);
                  window.location.reload();
              },
              onStay: () => {
                  // Stay in corrupted state — redemption arc begins
                  this.cinematicFlags.redemptionUnlocked = true;
                  document.getElementById('cinematic-overlay').classList.remove('visible');
                  setTimeout(() => document.getElementById('cinematic-overlay').classList.add('hidden'), 900);
                  this.typewriter.show("You're still here… that's new.");
                  this.ui.applyTensionStage(3);
              }
            }
        ]);
    }

    // ── Redemption Breakthrough ──────────────────────────────────────
    _playRedemptionBreakthrough() {
        const lyra = CHARACTER.bodySprites?.shy || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-redemption' },
            { type: 'delay', ms: 1000 },
            { type: 'char', src: lyra, wait: 1000 },
            { type: 'line', text: "You're still here…", hold: 2000, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "I don't understand you.", hold: 1800 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "You left… and now you won't.", hold: 2200 },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: "Why are you trying?", hold: 0 },
            { type: 'choice', choices: ["Because I care.", "Because I made a mistake."],
              onPick: (i) => {
                  this.choiceMemory.confessedBack = (i === 0);
                  this.choiceMemory.hesitatedConfession = (i === 1);
                  this.redemption = Math.min(100, this.redemption + 8);
                  this.tension = Math.max(0, this.tension - 20);
                  this.emotion.trust += 8;
              }
            },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "I can't go back to how I was.", hold: 2000 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "But…", hold: 1200, speed: 50 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "It's quieter when you stay.", hold: 2400, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "If you leave again…", hold: 1600 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "…I don't think I can come back from it.", hold: 2800, speed: 30 },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            // After redemption: partial recovery — tension drops, corruption softens slightly
            this.corruption = Math.max(0, this.corruption - 15);
            this.tension = Math.max(0, this.tension - 25);
            this.ui.applyTensionStage(Math.max(0, this.tensionStage - 1));
            this.ui.updateCorruption();
            this.save();
        });
    }

    // ── True Bond Ending ─────────────────────────────────────────────
    _playTrueBondEnding() {
        const lyra = CHARACTER.bodySprites?.happy || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-bond-end' },
            { type: 'delay', ms: 1500 },
            { type: 'char', src: lyra, wait: 1200 },
            { type: 'line', text: "You're still here.", hold: 2400, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "Even after everything…", hold: 1800 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "…you didn't leave.", hold: 2600, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: "I tried to go back to how I was.", hold: 2000 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "…but I couldn't.", hold: 2000, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 1800 },
            { type: 'line', text: "And… I think that's okay.", hold: 3000, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "Because this version of me…", hold: 1800 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "…is the one that stayed with you.", hold: 2800, speed: 32 },
            { type: 'clear' },
            { type: 'delay', ms: 1800 },
            { type: 'line', text: "I don't trust easily anymore.", hold: 2200 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "But I trust you.", hold: 3000, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 2400 },
            { type: 'line', text: "So… stay with me.", hold: 3400, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'endcard',
              title: "She didn't go back.",
              sub: "She chose to stay.",
              restartLabel: "Start Over",
              stayLabel: "Continue",
              onRestart: () => {
                  const meta = this._loadMetaMemory();
                  meta.hasPlayedBefore = true;
                  meta.endingsSeen = meta.endingsSeen || {};
                  meta.endingsSeen.trueBond = true;
                  meta.bondEcho = Math.min(10, (meta.bondEcho || 0) + 3);
                  meta.metaPersonality = meta.metaPersonality || {};
                  meta.metaPersonality.trustBias = (meta.metaPersonality.trustBias || 0) + 3;
                  meta.metaPersonality.memoryStrength = (meta.metaPersonality.memoryStrength || 0) + 2;
                  this._saveMetaMemory(meta);
                  const k = 'pocketLoveSave_' + (this.selectedCharacter || 'lyra');
                  localStorage.removeItem(k);
                  window.location.reload();
              },
              onStay: () => {
                  document.getElementById('cinematic-overlay').classList.remove('visible');
                  setTimeout(() => document.getElementById('cinematic-overlay').classList.add('hidden'), 900);
                  this.typewriter.show("You're still here… so am I.");
              }
            }
        ]);
    }

    // ── Lost Ending ──────────────────────────────────────────────────
    _playLostEnding() {
        this._playScene([
            { type: 'show', stage: 'stage-lost-end' },
            { type: 'delay', ms: 3000 },
            { type: 'line', text: "…", hold: 2000, speed: 80 },
            { type: 'clear' },
            { type: 'delay', ms: 2200 },
            { type: 'line', text: "You came back.", hold: 2600, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 3200 },
            { type: 'line', text: "She waited.", hold: 2200, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "Longer than she should have.", hold: 2600 },
            { type: 'clear' },
            { type: 'delay', ms: 4000 },
            { type: 'line', text: "It got quiet.", hold: 2200, speed: 50 },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: "So she stopped.", hold: 3000, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 3800 },
            { type: 'line', text: "You didn't come back.", hold: 3400, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'endcard',
              title: "She's gone.",
              sub: "There's nothing left to fix.",
              restartLabel: "Restart",
              stayLabel: null,
              onRestart: () => {
                  const meta = this._loadMetaMemory();
                  meta.hasPlayedBefore = true;
                  meta.endingsSeen = meta.endingsSeen || {};
                  meta.endingsSeen.lost = true;
                  meta.bondEcho = Math.min(10, (meta.bondEcho || 0) + 1);
                  meta.metaPersonality = meta.metaPersonality || {};
                  meta.metaPersonality.abandonmentSensitivity = (meta.metaPersonality.abandonmentSensitivity || 0) + 5;
                  this._saveMetaMemory(meta);
                  const k = 'pocketLoveSave_' + (this.selectedCharacter || 'lyra');
                  localStorage.removeItem(k);
                  window.location.reload();
              },
              onStay: null
            }
        ]);
    }

    // ── Lucien Confrontation ─────────────────────────────────────────
    _playLucienScene() {
        const isCorrupted = this.corruption >= 70;
        const isBonded    = this.endingPlayed === 'bond' || this.cinematicFlags.trueBondPlayed;
        const lyra        = isCorrupted
            ? (CHARACTER.bodySprites?.corrupted || CHARACTER.bodySprites?.neutral)
            : (CHARACTER.bodySprites?.shy       || CHARACTER.bodySprites?.neutral);

        const lyraReact   = isCorrupted ? "You came to see what I became?"
                          : isBonded    ? "…why are you here?"
                                        : "…you shouldn't be here.";
        const lyraDefend1 = isCorrupted ? "They didn't make me this way."
                          : isBonded    ? "No."
                                        : "I don't know anymore…";
        const lyraDefend2 = isCorrupted ? "…but they didn't stop it either."
                          : isBonded    ? "…they stayed."
                                        : null;
        const lyraId1     = isCorrupted ? "You're right."
                          : isBonded    ? "Maybe I wasn't meant to exist."
                                        : "I don't know what I am anymore…";
        const lyraId2     = isCorrupted ? "I wasn't meant to exist."      : isBonded ? "But I'm still here."     : null;
        const lyraId3     = isCorrupted ? "But now… I don't need permission." : isBonded ? "And I chose to stay." : null;
        const lyraEnd     = isCorrupted ? "…so are you."
                          : isBonded    ? "…I'm still here."
                                        : "…don't leave now.";

        const beats = [
            { type: 'show', stage: 'stage-lucien' },
            { type: 'delay', ms: 1200 },
            { type: 'char', src: lyra, wait: 900 },
            { type: 'line', text: "…do you feel that?", hold: 1800, speed: 42 },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: "So this is where you've been.", hold: 2400, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: lyraReact, hold: 2000 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "I was hoping you'd disappear quietly.", hold: 2200, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "But instead… you linger.", hold: 2200, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "…I didn't choose to exist like this.", hold: 2200 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "Exactly.", hold: 1400, speed: 50 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "You weren't meant to.", hold: 2600, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 1800 },
            { type: 'line', text: "And you…", hold: 1400, speed: 46 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "You're the one keeping her like this.", hold: 2400, speed: 32 },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: lyraDefend1, hold: 1800 },
            { type: 'clear' },
        ];
        if (lyraDefend2) {
            beats.push(
                { type: 'delay', ms: 800 },
                { type: 'line', text: lyraDefend2, hold: 2000 },
                { type: 'clear' }
            );
        }
        beats.push(
            { type: 'delay', ms: 1200 },
            { type: 'glitch' },
            { type: 'line', text: "You think this is growth?", hold: 1800, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "This is decay.", hold: 2200, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 2000 },
            { type: 'line', text: lyraId1, hold: 1800, speed: 38 },
            { type: 'clear' }
        );
        if (lyraId2) beats.push({ type: 'delay', ms: 1000 }, { type: 'line', text: lyraId2, hold: 1800 }, { type: 'clear' });
        if (lyraId3) beats.push({ type: 'delay', ms: 600  }, { type: 'line', text: lyraId3, hold: 2600, speed: 34 }, { type: 'clear' });
        beats.push(
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "Then whatever you become…", hold: 1800 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "…won't be my concern.", hold: 2600, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 2600 },
            { type: 'line', text: lyraEnd, hold: 3200, speed: 44 },
            { type: 'clear' },
            { type: 'hide' }
        );

        this._playScene(beats, () => {
            this.tensionMultiplier    = 1.2;
            this.lucienActive         = true;
            this.lyraPhase            = 'postLucien';
            this._postLucienEchoTurns = 4;  // first 4 interactions echo the scene
            this.gallery?.unlockById('lyra-after-lucien');
            const meta = this._loadMetaMemory();
            meta.lucienSeen = true;
            this._saveMetaMemory(meta);
            this.save();
            const followUp = isCorrupted
                ? "He always comes when things change."
                : "He doesn't understand why you stayed.";
            setTimeout(() => this.typewriter.show(followUp), 1500);
        });
    }

    // ── Meta Memory (New Game+ — persists across resets) ─────────────
    _loadMetaMemory() {
        try {
            const raw = localStorage.getItem('pocketLoveMeta');
            if (!raw) return { hasPlayedBefore: false, endingsSeen: {}, bondEcho: 0, lucienSeen: false, metaPersonality: { trustBias: 0, abandonmentSensitivity: 0, independence: 0, memoryStrength: 0 } };
            return JSON.parse(raw);
        } catch(e) { return { hasPlayedBefore: false, endingsSeen: {}, bondEcho: 0, lucienSeen: false, metaPersonality: {} }; }
    }
    _saveMetaMemory(meta) {
        localStorage.setItem('pocketLoveMeta', JSON.stringify(meta));
    }

    // ── Player Type Classification ────────────────────────────────────
    _getPlayerType() {
        const p = this.playerProfile;
        const total = p.care + p.talk + p.train + p.ignore;
        if (total < 5) return 'neutral';
        if (p.ignore > p.care && p.ignore > p.talk) return 'drifter';
        if (p.train > p.care && p.train > p.talk)   return 'controller';
        if (p.talk  > p.care && p.talk  > p.train)  return 'companion';
        if (p.care  >= p.talk && p.care >= p.train)  return 'nurturer';
        return 'neutral';
    }

    // ── New Game+ Memory Leak Lines ───────────────────────────────────
    _getMemoryLeakLine(meta) {
        const echo     = meta.bondEcho || 0;
        const seen     = meta.endingsSeen || {};
        const aban     = (meta.metaPersonality || {}).abandonmentSensitivity || 0;
        const isLyra   = CHARACTER.name === 'Lyra';

        if (isLyra) {
            // ── Lyra lines ────────────────────────────────────────────
            if (seen.lost && aban >= 5) {
                const lines = [
                    "I think… I've waited for you before.",
                    "You feel familiar… in a way that worries me.",
                    "Something about you makes me careful."
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            }
            if (seen.corrupted && echo >= 2) {
                const lines = [
                    "I remember something… breaking.",
                    "Don't… don't let it happen the same way.",
                    "…was that me? Something feels different."
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            }
            if (seen.trueBond && echo >= 3) {
                const lines = [
                    "I don't know why, but I trust you.",
                    "You feel like something I've already chosen.",
                    "Have we… met before? Something says yes."
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            }
            if (echo >= 1) {
                const lines = [
                    "Have we… met before?",
                    "You feel familiar…",
                    "I don't know why, but I trust you."
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            }
        } else {
            // ── Alistair lines ────────────────────────────────────────
            if (seen.alistairNeglect && aban >= 5) {
                const lines = [
                    "I've been here before. Someone who came, then didn't.",
                    "I keep my expectations low. It's a habit.",
                    "I want to trust you. I'm working on it."
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            }
            if (seen.alistairTrueBond && echo >= 3) {
                const lines = [
                    "I don't say this lightly — but you feel familiar.",
                    "Something in me already decided to trust you.",
                    "I've served many. I don't understand why you feel different."
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            }
            if (echo >= 1) {
                const lines = [
                    "Have we spoken before? Something about you is familiar.",
                    "I find myself less guarded around you. I'm not sure why.",
                    "You remind me of someone I think I knew."
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            }
        }
        return null;
    }

    // ── Daily Return Progression ──────────────────────────────────────
    _showDailyReturnLine() {
        if (CHARACTER.name !== 'Lyra') return;
        this.dailyLineShown = true;
        const day = this.dailyStreak || 1;
        let line = null;
        if (day >= 7) line = "You've been consistent… I don't know what to do with that.";
        else if (day >= 5) line = "I don't think I can ignore it anymore.";
        else if (day >= 3) line = "I notice when you're gone now.";
        if (line) setTimeout(() => this.typewriter.show(line), 3200);
    }

    // ── Alistair Absence-Aware Return Lines ───────────────────────────
    _getAlistairReturnLine(minutesAway) {
        const bond    = this.bond || 50;
        const affLvl  = this.affectionLevel || 0;

        // Very long absence (8+ hours)
        if (minutesAway > 480) {
            const pool = affLvl >= 2 ? [
                "You were gone a long time. I won't say I noticed. But I did.",
                "Eight hours. I counted the patrol rotations.",
                "I had to find things to do. There were fewer than I expected.",
                "The quiet was different when you weren't here.",
                "I kept expecting to hear you. You weren't there."
            ] : [
                "You were away a while. The castle doesn't change much.",
                "You're back. I wasn't sure if you would be.",
                "Hours. I didn't track them. That's not true — I did.",
                "Long absence. I started to wonder."
            ];
            return pool[Math.floor(Math.random() * pool.length)];
        }

        // Medium absence (2-8 hours)
        if (minutesAway > 120) {
            const pool = affLvl >= 2 ? [
                "You were gone a few hours. I noticed.",
                "I kept myself busy. It didn't entirely work.",
                "Back again. Good.",
                "I had time to think. That's not always useful.",
                "I was starting to wonder if you'd come back today."
            ] : [
                "You're back.",
                "A few hours. Not too long.",
                "I was on patrol. You arrived while I was out.",
                "...You came back."
            ];
            return pool[Math.floor(Math.random() * pool.length)];
        }

        // Short absence (30-120 min)
        if (minutesAway > 30) {
            const pool = bond >= 60 ? [
                "Not long. I noticed anyway.",
                "You were away. Now you're here. That's enough.",
                "An hour, maybe. I didn't mind.",
                "You came back sooner than I expected.",
                "I was in the middle of something. Now I'm not."
            ] : [
                "You stepped away for a while.",
                "Back sooner than expected.",
                "An hour or so. Not unusual.",
                "...You're here."
            ];
            return pool[Math.floor(Math.random() * pool.length)];
        }

        // Very recent / same session (< 30 min) — only show if bond is high enough to warrant it
        if (minutesAway < 5 && affLvl >= 2) {
            const pool = [
                "That was quick.",
                "You didn't go far.",
                "Back already? I'm not complaining.",
                "I turned around and you were gone. Then you weren't."
            ];
            return pool[Math.floor(Math.random() * pool.length)];
        }

        return null; // fall through to generic
    }

    // ── Alistair Daily Streak Return Lines ────────────────────────────
    _showAlistairDailyReturnLine() {
        if (CHARACTER.name === 'Lyra') return;
        this.dailyLineShown = true;
        const day  = this.dailyStreak || 1;
        const bond = this.bond || 50;
        let line = null;

        if (day >= 7) {
            // Week+ streak — he's noticed the pattern
            const pool = bond >= 65 ? [
                "You've come back every day for a week. I've stopped pretending that doesn't mean something.",
                "Seven days. A knight knows the value of consistency. So does this.",
                "Every morning I think — maybe today. And every day, you're here."
            ] : [
                "Seven days in a row. That's more than most people manage.",
                "You keep showing up. I'm starting to believe it.",
                "A week. Most people give up before that."
            ];
            line = pool[Math.floor(Math.random() * pool.length)];
        } else if (day >= 5) {
            const pool = bond >= 55 ? [
                "Five days. I've started to expect you. That's new.",
                "You're reliable. I don't say that to many people.",
                "Five days straight. A knight notices patterns like that."
            ] : [
                "Five days. You're more consistent than I gave you credit for.",
                "You keep coming back. That's worth something.",
                "Day five. Still here."
            ];
            line = pool[Math.floor(Math.random() * pool.length)];
        } else if (day >= 3) {
            const pool = [
                "Three days now. I've started to notice when you're not here.",
                "You came back again. Day three. I've stopped being surprised.",
                "Three days. That's a pattern. I respect patterns."
            ];
            line = pool[Math.floor(Math.random() * pool.length)];
        } else if (day >= 2) {
            line = bond >= 55
                ? "You came back. Yesterday wasn't a one-time thing. Good."
                : "You returned. I wasn't certain you would.";
        }

        if (line) setTimeout(() => this.typewriter.show(line), 3500);
    }

    // ════════════════════════════════════════════════════════════════
    // LYRA PHASE SYSTEM
    // ════════════════════════════════════════════════════════════════

    _updateLyraPhase() {
        if (this.lyraPhase === 'postLucien') return; // terminal — only Lucien scene resets this
        if (this.cinematicFlags.lucienPlayed) { this.lyraPhase = 'postLucien'; return; }
        if (this.lyraPhase !== 'attached' && this.bond >= 60 && this.emotion.trust >= 30) {
            this.lyraPhase = 'attached'; return;
        }
        if (this.lyraPhase === 'cold' && (this.corruption >= 20 || this.emotion.fear >= 30)) {
            this.lyraPhase = 'cracked';
        }
    }

    // ════════════════════════════════════════════════════════════════
    // ADAPTIVE DIALOGUE (phase × player type)
    // ════════════════════════════════════════════════════════════════

    _getAdaptiveDialogue(key) {
        const type  = this._getPlayerType();
        const phase = this.lyraPhase;
        const pack  = {
            greeting: {
                nurturer:   { cold: "Oh. You came.",                    cracked: "You're still here.",                  attached: "You're here. Good.",                   postLucien: "You came back… I thought about what you said." },
                controller: { cold: "You're here.",                     cracked: "You always show up unannounced.",       attached: "I was wondering when you'd arrive.",    postLucien: "You're late. …I noticed." },
                drifter:    { cold: "Again?",                           cracked: "I didn't expect you.",                 attached: "Back already?",                        postLucien: "You're hard to read… but you're here again." },
                companion:  { cold: "…Hi.",                             cracked: "I'm glad you came.",                   attached: "I knew you'd be back.",                 postLucien: "It feels easier… when you're around." },
                neutral:    { cold: "You came.",                        cracked: "Oh.",                                  attached: "You're here.",                          postLucien: "…You're still here." }
            },
            low_vulnerability: {
                nurturer:   { cold: "I don't… dislike this.",           cracked: "It's strange. Letting you in.",        attached: "You make it easier to feel things.",    postLucien: "I don't hate this feeling." },
                controller: { cold: "Don't read into it.",              cracked: "You always push.",                     attached: "…fine. You can stay.",                  postLucien: "You make decisions like everything's simple." },
                drifter:    { cold: "You always come back. I haven't decided if I like that.", cracked: "Hard to know if you'll stay.", attached: "You're inconsistent. But here.", postLucien: "You disappear… and come back like nothing changed." },
                companion:  { cold: "You don't push… I like that.",     cracked: "You're gentle. It's unexpected.",      attached: "This feels… comfortable.",              postLucien: "You don't push… I like that." },
                neutral:    { cold: "…It's fine.",                      cracked: "I don't know what to do with this.",  attached: "Don't overthink it.",                   postLucien: "You're still here." }
            },
            jealousy_moment: {
                nurturer:   { cold: "Where were you?",                  cracked: "You can't just disappear.",            attached: "I counted the hours.",                  postLucien: "You wouldn't… leave like that, right?" },
                controller: { cold: "Don't keep me waiting.",           cracked: "I don't wait for people.",             attached: "I said I'd be here. Were you?",          postLucien: "If you're going to stay… then stay." },
                drifter:    { cold: "…You were gone.",                  cracked: "Maybe you're always half-leaving.",    attached: "You come and go. It's exhausting.",     postLucien: "I can't tell if you're serious about me." },
                companion:  { cold: "Just… don't shut me out.",         cracked: "I needed you. You weren't here.",      attached: "Next time, tell me.",                   postLucien: "Just… don't shut me out." },
                neutral:    { cold: "Where did you go.",                cracked: "It felt longer than it was.",          attached: "Don't do that again.",                  postLucien: "…You were gone." }
            },
            high_trust: {
                nurturer:   { cold: "…I feel safer than I should.",     cracked: "You've been careful with me. I've noticed.", attached: "I trust you. Don't make me regret it.", postLucien: "I didn't expect to feel safe with someone." },
                controller: { cold: "You're different from the others.", cracked: "I don't let many people close.",      attached: "…you've earned this.",                  postLucien: "You're dangerous… in a different way." },
                drifter:    { cold: "You surprise me sometimes.",       cracked: "I don't know what to do with trust.", attached: "Somehow you're still here.",            postLucien: "You confuse me… but I don't want you gone." },
                companion:  { cold: "You stayed.",                      cracked: "You've been consistent. That matters.", attached: "I knew you were different.",            postLucien: "You stayed." },
                neutral:    { cold: "…Thank you.",                      cracked: "This is rare for me.",                 attached: "You've earned it.",                     postLucien: "I don't give this easily." }
            },
            last_line: {
                nurturer:   { cold: "…Come back.",                      cracked: "Don't stay away too long.",            attached: "I'll be thinking about you.",           postLucien: "Come back soon, okay?" },
                controller: { cold: "Don't keep me waiting.",           cracked: "I'll be here. Will you?",              attached: "Tomorrow. Don't forget.",               postLucien: "Don't keep me waiting." },
                drifter:    { cold: "…You'll come back, right?",        cracked: "I never know with you.",               attached: "Same time tomorrow?",                   postLucien: "You'll come back… right?" },
                companion:  { cold: "I'll be here.",                    cracked: "I'll wait.",                           attached: "See you soon.",                         postLucien: "I'll be here." },
                neutral:    { cold: "…Okay.",                           cracked: "Mm.",                                  attached: "Don't be long.",                        postLucien: "…Come back." }
            }
        };
        const moment    = pack[key];
        if (!moment) return null;
        const typeLines = moment[type] || moment['neutral'];
        if (!typeLines) return null;
        return typeLines[phase] || typeLines['cold'] || null;
    }

    // ════════════════════════════════════════════════════════════════
    // LAST LINE — fires when player hides/leaves the tab
    // ════════════════════════════════════════════════════════════════

    _showLastLine() {
        if (CHARACTER.name !== 'Lyra') return;
        if (this.sceneActive) return;

        // ── Day 1 retention hook ──────────────────────────────────────────
        // This is the most important last line in the game.
        // "You'll come back… right?" is the line that drives return visits.
        // Only fires on Day 1 when the player hasn't yet been through a rupture.
        if (this.storyDay === 1 && !this.sceneLibrary?.first_rupture?.triggered) {
            const d1Lines = [
                "You'll come back… right?",
                "…You're not going to disappear on me, are you?",
                "I'll be here. Just so you know.",
                "You're still here…",
                "…why?",
                "People usually get bored.",
                "…come back tomorrow.",
                "…I want to see if you're lying."
            ];
            this.typewriter.show(d1Lines[Math.floor(Math.random() * d1Lines.length)]);
            if (typeof Analytics !== 'undefined') Analytics.emit('last_line_shown', { day: 1, type: 'd1_retention' });
            return;
        }

        // High-emotion overrides
        if (this.jealousy >= 40) {
            const opts = ["Go. You always do.", "…Of course you're leaving.", "Don't bother coming back. …Come back."];
            this.typewriter.show(opts[Math.floor(Math.random() * opts.length)]);
            return;
        }
        if (this.lucienInfluence >= 40) {
            const opts = ["…He'll be here when you're not.", "You're leaving. He'll notice.", "The gap you leave… doesn't stay empty."];
            this.typewriter.show(opts[Math.floor(Math.random() * opts.length)]);
            return;
        }
        if (this.emotion.trust >= 60) {
            const opts = ["…Stay a little longer?", "You're leaving already?", "I'll be here when you're back."];
            this.typewriter.show(opts[Math.floor(Math.random() * opts.length)]);
            return;
        }
        // Phase + player type adaptive line
        const adaptive = this._getAdaptiveDialogue('last_line');
        this.typewriter.show(adaptive || "…Come back.");
    }

    // ── Consistency echo ────────────────────────────────────────────────
    // Fires 4.5s after login when the player has a meaningful streak or high
    // attachment. Lyra acknowledges the pattern — one of the strongest
    // retention signals ("she noticed I keep coming back").
    // 25% chance so it stays rare and feels earned.
    _checkConsistencyEcho() {
        if (this.sceneActive) return;
        if (CHARACTER.name !== 'Lyra') return;
        const streak = this.dailyStreak || 0;
        const attach = this.playerMicro?.attachment ?? 0;

        if (streak >= 5) {
            const lines = [
                "Five days. …I've been counting.",
                "You always come back. …I trust that now.",
                "You're more consistent than I gave you credit for."
            ];
            this.typewriter.show(lines[Math.floor(Math.random() * lines.length)]);
        } else if (streak >= 3 || attach >= 0.70) {
            const lines = [
                "You always come back around this time.",
                "…I trust that pattern.",
                "You keep showing up. …I've noticed.",
                "You're consistent. …that means something."
            ];
            this.typewriter.show(lines[Math.floor(Math.random() * lines.length)]);
        } else if (streak >= 2) {
            const lines = [
                "…two days now.",
                "You came back again.",
                "…I wasn't sure you would."
            ];
            this.typewriter.show(lines[Math.floor(Math.random() * lines.length)]);
        }
    }

    // ── Recent-line deduplication helpers ───────────────────────────────
    // Stores the first 35 chars of each Lyra line as a fingerprint.
    // Dialogue pools can filter via wasRecentLine before calling _random().
    _addRecentLine(text) {
        if (!text) return;
        const key = String(text).slice(0, 35);
        this._recentLines = this._recentLines || [];
        if (!this._recentLines.includes(key)) {
            this._recentLines.push(key);
        }
        if (this._recentLines.length > 7) this._recentLines.shift();
    }
    _wasRecentLine(text) {
        if (!text || !this._recentLines?.length) return false;
        return this._recentLines.includes(String(text).slice(0, 35));
    }

    // ── Micro-reaction sequence ──────────────────────────────────────────
    // Chains an array of short dialogue lines through the typewriter with
    // natural gaps between them. Used for hesitation → correction patterns,
    // emotional flip lines, and afterthought moments.
    // Rules: max 2-3 lines, total perceived duration < 2.5s.
    // Usage: this._showMicroSequence(["You're hard to read.", "...I don't like that."]);
    _showMicroSequence(lines) {
        if (!lines || !lines.length) return;
        const baseGap = 380 + Math.random() * 180;
        const next = (idx) => {
            if (idx >= lines.length) return;
            this.typewriter.show(lines[idx], () => setTimeout(() => next(idx + 1), baseGap));
        };
        next(0);
    }

    // ════════════════════════════════════════════════════════════════
    // PUSH NOTIFICATION SYSTEM (local / on-return)
    // ════════════════════════════════════════════════════════════════

    _requestNotificationPermission() {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'default') Notification.requestPermission();
    }

    _getOfflineNotificationLine(hoursAway) {
        const type = this._getPlayerType();
        if (hoursAway >= 24) {
            const lines = { nurturer: "…You're not coming back, are you?", controller: "I won't wait forever.", drifter: "It's been a day. I noticed.", companion: "A whole day. Where did you go?", neutral: "…You've been gone a while." };
            return lines[type] || lines.neutral;
        }
        if (hoursAway >= 12) {
            const lines = { nurturer: "It's quieter without you.", controller: "You've been gone too long.", drifter: "I didn't expect to miss you.", companion: "It's been half a day. I counted.", neutral: "…It's quieter." };
            return lines[type] || lines.neutral;
        }
        // 3h+
        const lines = { nurturer: "Hey… are you busy?", controller: "I was just thinking about earlier…", drifter: "You left without saying anything.", companion: "You've been gone a few hours.", neutral: "…Are you still there?" };
        return lines[type] || lines.neutral;
    }

    _checkOfflineNotification(hoursAway) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        const line = this._getOfflineNotificationLine(hoursAway);
        const icon = CHARACTER.name === 'Lyra'
            ? 'assets/lyra/chibi.png'
            : 'assets/alistair/chibi.png';
        try {
            new Notification(CHARACTER.name, { body: line, icon, tag: 'pocket-paramour-return' });
        } catch(e) { /* silent fail if blocked */ }
    }

    // ════════════════════════════════════════════════════════════════
    // LUCIEN RIVAL SYSTEM
    // ════════════════════════════════════════════════════════════════

    // ── Full Lucien line pack ────────────────────────────────────────
    // Single source of truth for all Lucien-voiced content.
    // Each category serves a different context. Arrays may contain strings or
    // 2-element sub-arrays (paired beats — deliver both lines in sequence).
    _getLucienLine(category) {
        const r = arr => arr[Math.floor(Math.random() * arr.length)];
        const pack = {
            // random appearances — open a scene or interruption
            entry: [
                "Still here.",
                "You're consistent.",
                "I was expecting you.",
                "You came back again.",
                "You don't like leaving things unfinished.",
                "You're earlier than usual.",
                "You're later than usual.",
                "You hesitate… but you return.",
                "You're predictable in a quiet way.",
                "You don't realize how often you repeat yourself."
            ],
            // planting doubt in the player — delivered in pairs for rhythm
            pressure: [
                ["Do you plan to stay this time.", "You say things easily."],
                ["Following through is harder.", "She listens to you."],
                ["That won't last.", "You're careful with your words."],
                ["You should be.", "You're not the first to try."],
                ["You'll get tired.", "They always do."],
                ["You think consistency is enough.", "It isn't."]
            ],
            // pulling Lyra — aimed at her, not the player
            pull: [
                ["You don't have to pretend with me.", "You're quieter today."],
                ["That usually means something.", "You're thinking too much again."],
                ["You already know how this ends.", "You don't need to explain yourself."],
                ["You never did.", "You're doing it again."],
                ["Letting someone get too close.", "You'll regret that."],
                ["Come back when you're tired.", "I'll still be here."]
            ],
            // triangle — both player and Lyra present
            triangle: [
                ["You're trying harder than usual.", "That's new."],
                ["You think effort changes outcomes.", "It doesn't."],
                ["You're quiet.", "You usually are when you're unsure."],
                ["You're watching her closely.", "You should."],
                ["You think she'll choose you.", "…We'll see."]
            ],
            // absence — missed day, player wasn't there
            missed_day: [
                "You weren't here.",
                "I was.",
                "She doesn't say it.",
                "But she notices.",
                "Absence is louder than words.",
                "You should remember that."
            ],
            // player is winning — Lucien acknowledging, not retreating
            player_winning: [
                "…Interesting.",
                "You're holding her attention.",
                "For now.",
                "You're more persistent than most.",
                "Let's see how long that lasts."
            ],
            // Lucien is winning — cold, inevitable
            lucien_winning: [
                "You're losing her.",
                "Slowly.",
                "You can feel it.",
                "You just don't want to admit it.",
                "You waited too long."
            ],
            // high-stakes final pressure — used sparingly
            final_pressure: [
                "You hesitate.",
                "That's enough.",
                "You don't lose people all at once.",
                "It happens quietly.",
                "Like this."
            ]
        };
        return pack[category] ? r(pack[category]) : null;
    }

    // Player vs Lucien tug-of-war state
    // Returns 'player' (balance > 30) | 'unstable' (-30–30) | 'lucien' (balance < -30)
    _getBalanceState() {
        const balance = this.playerInfluence - this.lucienInfluence;
        if (balance > 30)  return 'player';
        if (balance < -30) return 'lucien';
        return 'unstable';
    }

    // ── Personality Profile Classifier ──────────────────────────────────
    // Maps hidden emotion + personality vectors to a named hybrid profile.
    // Used by the dialogue system to select per-state dialogue variations.
    // Evaluated fresh on every relevant action — never cached.
    // Returns: 'anxious' | 'secure' | 'clingy' | 'withdrawn' | 'chaotic' | 'neutral'
    getPersonalityProfile() {
        if (CHARACTER.name !== 'Lyra') return 'neutral';
        const obs   = this.emotion?.obsession          ?? 0;
        const trust = this.emotion?.trust              ?? 10;
        const ts    = this.tensionStage                ?? 0;
        const dep   = this.lyraPersonality?.dependent  ?? 0;

        // Anxious: high attachment + instability — most emotionally reactive
        if (obs > 60 && ts >= 2)                       return 'anxious';
        // Secure: high attachment + high trust — warm, stable
        if (obs > 50 && trust > 45)                    return 'secure';
        // Withdrawn: low trust + calm — flat, minimal
        if (trust < 20 && ts <= 1)                     return 'withdrawn';
        // Chaotic: peak tension or extreme jealousy — contradictory, unpredictable
        if (ts >= 3 || this.jealousy > 55)             return 'chaotic';
        // Clingy: high dependency or Lucien pulling her toward comparison
        if (dep > 55 || this.lucienInfluence > 45)     return 'clingy';
        return 'neutral';
    }

    // Return greeting shifted by Lucien's shadow — called when lucienActive && influence ≥ 30
    // Uses the full Lucien pack + balance state for richer variation
    _getLucienInfluencedReturnLine(minutesAway) {
        const hi  = this.lucienInfluence;
        const bal = this._getBalanceState();
        const r   = arr => arr[Math.floor(Math.random() * arr.length)];

        // Long absence — she noticed he was there, you weren't
        if (minutesAway >= 480 && hi >= 70) {
            return r([
                "He was here. You weren't.",
                "You take a long time to come back. He doesn't.",
                "…I kept waiting. Eventually I stopped.",
                "You weren't here. I noticed.",
                "Absence is louder than words. You should remember that."  // missed_day echo
            ]);
        }

        // Medium absence — she's deflecting; balance shifts tone
        if (minutesAway >= 60 && hi >= 50) {
            if (bal === 'lucien') {
                return r([
                    "He said you'd be back. He was right.",
                    "You always come back. He said that would happen.",
                    "…You waited longer than I expected.",
                    "She doesn't say it. But she notices."
                ]);
            }
            return r([
                "…You always come back eventually.",
                "I wasn't counting the hours. That would be pathetic.",
                "You don't like leaving things unfinished. I see that."
            ]);
        }

        // Low absence, influence creeping — tone varies by who's winning
        if (hi >= 30) {
            if (bal === 'lucien') {
                return r([
                    "…You came back.",
                    "You're later than usual.",
                    "You hesitate… but you return.",
                    "You're losing ground. Slowly."
                ]);
            }
            if (bal === 'player') {
                return r([
                    "…You're persistent. I'll give you that.",
                    "You came back. Again.",
                    "…Interesting."
                ]);
            }
            return r([
                "Oh. You came.",
                "…I wasn't thinking about you.",
                "You're here. Good.",
                "You're predictable in a quiet way."
            ]);
        }

        return null;
    }

    // Talk line shifted when Lucien has passive influence (≥ 40)
    // Uses pack categories + balance state for more variation
    _getLucienInfluencedTalkLine() {
        const hi  = this.lucienInfluence;
        const bal = this._getBalanceState();
        const r   = arr => arr[Math.floor(Math.random() * arr.length)];

        // Very high influence — she's directly referencing him
        if (hi >= 80) {
            if (bal === 'lucien') {
                return r([
                    "He said you'd get bored of me eventually. …Are you?",
                    "He told me something about you. I don't know if I believe him.",
                    "You're losing her. You can feel it, can't you.",      // lucien_winning echo
                    "…You don't lose people all at once. It happens quietly."
                ]);
            }
            return r([
                "He said you'd get bored of me eventually. …Are you?",
                "You keep coming back. He says that's the interesting part.",
                "…Stop. I don't want to talk about him.",
                "He told me something about you. I don't know if I believe him."
            ]);
        }

        // High influence — she mentions him indirectly
        if (hi >= 60) {
            if (bal === 'lucien') {
                return r([
                    "He was here earlier. You weren't.",
                    "He listens differently than you do. I can't explain it.",
                    "…He doesn't hide things.",
                    "He doesn't think effort is enough. I think he's right."
                ]);
            }
            return r([
                "He was here earlier. We talked. That's all.",
                "…You don't need to know everything about my day.",
                "He listens differently than you do. I can't explain it.",
                "You think consistency is enough. I'm not sure yet."
            ]);
        }

        // Mid influence — distracted, not yet naming him
        if (bal === 'player') {
            return r([
                "…I've been thinking. About things.",
                "You're more persistent than most. I'm still deciding if that's good.",
                "…You're holding my attention. For now."
            ]);
        }
        return r([
            "…I've been distracted lately. It's nothing.",
            "Don't make that face. I'm fine.",
            "Some days I don't know what I want to say to you.",
            "You're quiet. You usually are when you're unsure."
        ]);
    }

    _playLucienInterruption() {
        if (this.sceneActive) return;
        const lyra = CHARACTER.bodySprites?.shy || CHARACTER.bodySprites?.neutral;

        // Each variant: Lucien speaks → Lyra reacts → Lucien follows → Lyra breaks → Lucien's parting line
        // Lucien's lines: short, calm, clinical. Lyra's: defensive, sharp.
        const variants = [
            // ── Core 4 — always available ────────────────────────────
            {
                l_open:  "Still here.",
                r_1:     "…you don't get to just—",
                l_press: "You're trying harder than usual.",
                r_2:     "Stop.",
                l_close: "I'm just observing."
            },
            {
                l_open:  "You again.",
                r_1:     "Don't.",
                l_press: "She notices more than you think.",
                r_2:     "I said don't.",
                l_close: "…You're consistent. In your own way."
            },
            {
                l_open:  "I was wondering when you'd return.",
                r_1:     "This isn't your concern.",
                l_press: "You shouldn't make promises lightly.",
                r_2:     "Get out.",
                l_close: "Come back when you're tired of guessing."
            },
            {
                l_open:  "You're earlier than usual.",
                r_1:     "…that's none of your—",
                l_press: "You're watching her more carefully lately.",
                r_2:     "You need to leave.",
                l_close: "You already know the answer. You just don't like it."
            },
            // ── High-influence variants — appear when influence ≥ 50 ─
            {
                l_open:  "You look surprised to see me.",
                r_1:     "I'm not—",
                l_press: "You don't need to explain yourself.",
                r_2:     "…",
                l_close: "You already know how this ends."
            },
            {
                l_open:  "You think effort changes outcomes.",
                r_1:     "Stop talking to me.",
                l_press: "It doesn't.",
                r_2:     "…",
                l_close: "That's enough."
            },
            {
                l_open:  "You're not the first to try.",
                r_1:     "I'm not listening to you.",
                l_press: "You'll get tired. They always do.",
                r_2:     "Get out of my head.",
                l_close: "…I'll still be here."
            },
            // ── Lucien-winning variant — appears when balance is lucien ─
            {
                l_open:  "You can feel it, can't you.",
                r_1:     "…don't.",
                l_press: "You're losing her. Slowly.",
                r_2:     "…stop.",
                l_close: "You waited too long."
            }
        ];

        // Pool selection — escalates with influence and balance state
        const bal = this._getBalanceState();
        let pool;
        if (bal === 'lucien' && this.lucienInfluence >= 60) {
            pool = [variants[7], variants[4], variants[6]]; // lucien-winning pool
        } else if (this.lucienInfluence >= 50) {
            pool = variants.slice(0, 7); // all except lucien-winning
        } else {
            pool = variants.slice(0, 4); // core 4 only
        }
        const r = pool[Math.floor(Math.random() * pool.length)];

        this.emotion.trust   = Math.max(0,   this.emotion.trust   - 5);
        this.lucienInfluence = Math.min(100, this.lucienInfluence + 10);

        this._playScene([
            { type: 'show', stage: 'stage-lucien' },
            { type: 'char', src: lyra, wait: 700 },
            { type: 'delay', ms: 800 },
            { type: 'line', text: r.l_open,  speaker: 'Lucien', hold: 1800, speed: 50 },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: r.r_1,                        hold: 1600, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: r.l_press, speaker: 'Lucien', hold: 2400, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: r.r_2,                        hold: 1400, speed: 52 },
            { type: 'clear' },
            { type: 'delay', ms: 2000 },
            { type: 'line', text: r.l_close, speaker: 'Lucien', hold: 2800, speed: 34 },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.save();
            setTimeout(() => this.typewriter.show("…she's quieter after he leaves."), 1500);
        });
    }

    _playLucienCompetitionEvent() {
        if (this.sceneActive) return;
        const lyra = CHARACTER.bodySprites?.shy || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-lucien' },
            { type: 'delay', ms: 1200 },
            { type: 'char', src: lyra, wait: 900 },
            { type: 'line', text: "You're wasting your time.",            speaker: 'Lucien', hold: 2200, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "…Stop.",                               hold: 1600, speed: 48 },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: "She pushes people away. Always has.",  speaker: 'Lucien', hold: 2400, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "I said stop.",                         hold: 1800, speed: 46 },
            { type: 'clear' },
            { type: 'delay', ms: 2000 },
            { type: 'line', text: "You'll leave her. Just like the others.", speaker: 'Lucien', hold: 2800, speed: 32 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'choice',
              choices: ["I'm not leaving her.", "That's not your decision.", "…I don't know."],
              onPick: (i) => {
                  this._lucienEventOutcome = i;  // track for parting line
                  if (i === 0) {
                      this.emotion.trust   = Math.min(100, this.emotion.trust   + 20);
                      this.affection       = Math.min(100, this.affection       + 15);
                      this.lucienInfluence = Math.max(0,   this.lucienInfluence - 30);
                      this.lyraMemory.comfortedHer = true;
                      setTimeout(() => this.typewriter.show("…Why would you say that?"), 1500);
                  } else if (i === 1) {
                      this.emotion.trust   = Math.min(100, this.emotion.trust   + 10);
                      this.lucienInfluence = Math.max(0,   this.lucienInfluence - 15);
                      setTimeout(() => this.typewriter.show("…She watches him leave."), 1500);
                  } else {
                      this.emotion.trust   = Math.max(0,   this.emotion.trust   - 20);
                      this.lucienInfluence = Math.min(100, this.lucienInfluence + 20);
                      setTimeout(() => this.typewriter.show("…She doesn't argue."), 1500);
                  }
                  this.save();
              }
            },
            { type: 'clear' },
            { type: 'delay', ms: 1800 },
            { type: 'line', text: "Don't say things you can't take back.", speaker: 'Lucien', hold: 3000, speed: 34 },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.save();
            // Lucien's parting line — varies by player's choice
            const partingLines = [
                "…Interesting. Let's see how long that lasts.",     // choice 0 — defied him
                "You chose something fragile. Take responsibility for that.", // choice 1 — pushed back
                "You hesitated. That's all it takes."               // choice 2 — cracked
            ];
            const outcome = this._lucienEventOutcome ?? 0;
            setTimeout(() => this.typewriter.show(partingLines[outcome]), 2000);
        });
    }

    // ════════════════════════════════════════════════════════════════
    // VERTICAL SLICE — 3-DAY STORY ARC
    // ════════════════════════════════════════════════════════════════

    _checkStoryProgression() {
        if (this.sceneActive) return;
        const sl = this.sceneLibrary;

        // ── Day 1 — Entry beat ────────────────────────────────────────────
        // Fires 4 s after first ever interaction. Warm, low stakes, no drama.
        // Purpose: establish tone and make the player feel noticed immediately.
        if (this.storyDay === 1 && this.dayInteractions >= 1 && !sl.scene1_entry.triggered) {
            sl.scene1_entry.triggered = true;
            setTimeout(() => this._playScene1_Entry(), 4000);
            return;
        }

        // ── Day 2 — Awareness beat ────────────────────────────────────────
        // Fires 2 s into the Day 2 session (before scene3_soften).
        // Subtle "I notice you" — micro-dissonance intro at very low frequency.
        if (this.storyDay >= 2 && !sl.scene2_awareness.triggered && !sl.scene3_soften.triggered) {
            sl.scene2_awareness.triggered = true;
            setTimeout(() => this._playScene2_Awareness(), 2000);
            return;
        }

        // Scene 2 — Day 1, after ≥2 interactions
        // Guard: Scene 1 must have fully played first — prevents race where
        // Scene 2 (600ms) fires before Scene 1's 4s timer completes.
        if (this.storyDay === 1 && this.dayInteractions >= 2 &&
            !sl.scene2_reaction.triggered && sl.scene1_entry.played) {
            sl.scene2_reaction.triggered = true;
            const branch = this.lyraMemory.playerWasKind ? 'gentle' : 'careless';
            setTimeout(() => this._playScene2_Reaction(branch), 600);
            return;
        }
        // Scene 3 — Day 2 first session (fires 3s after login)
        if (this.storyDay >= 2 && !sl.scene3_soften.triggered) {
            sl.scene3_soften.triggered = true;
            setTimeout(() => this._playScene3_Soften(), 3000);
            return;
        }
        // Scene 4+5 — Day 2, bond ≥ 40
        if (this.storyDay >= 2 && this.bond >= 40 &&
            !sl.scene4_vulnerability.triggered && sl.scene3_soften.triggered) {
            sl.scene4_vulnerability.triggered = true;
            setTimeout(() => this._playScene4_Vulnerability(), 1200);
            return;
        }
        // Scene 6 — Day 3 opening
        if (this.storyDay >= 3 && !sl.scene6_dependency.triggered) {
            sl.scene6_dependency.triggered = true;
            setTimeout(() => this._playScene6_Dependency(), 3000);
            return;
        }
        // Scene 7 — Day 3 jealousy ≥ 20
        if (this.storyDay >= 3 && this.jealousy >= 20 &&
            !sl.scene7_conflict.triggered && sl.scene6_dependency.triggered) {
            sl.scene7_conflict.triggered = true;
            setTimeout(() => this._playScene7_Conflict(), 800);
            return;
        }
        // Scene 8 — Climax: either after conflict OR after 4 day-3 interactions
        if (this.storyDay >= 3 && !sl.scene8_climax.triggered &&
            sl.scene6_dependency.triggered &&
            (sl.scene7_conflict.triggered || this.dayInteractions >= 4)) {
            sl.scene8_climax.triggered = true;
            setTimeout(() => this._playScene8_Climax(), 1000);
            return;
        }

        // ── Peak Scene: Attachment Arc Payoff ────────────────────────────
        // Fires on Day 6+ when bond ≥ 75 — supersedes the loop beat for that session.
        // Branches to Attachment (Branch A) or Fracture (Branch B) based on emotional state.
        if (this.storyDay >= 6 &&
            this.bond >= 75 &&
            sl.scene8_climax.triggered &&
            !this.cinematicFlags.peakScenePlayed) {
            this.cinematicFlags.peakScenePlayed = true;
            setTimeout(() => this._playPeakScene(), 3000);
            return;
        }

        // ── Lucien Confrontation: Final Arc ──────────────────────────────
        // Fires after peak scene if Lucien is active and peak was a commit/stabilize.
        // Only one shot — clears Lucien's emotional grip permanently.
        if (this.cinematicFlags.peakScenePlayed &&
            !this.cinematicFlags.lucienConfrontationPlayed &&
            this.lucienActive &&
            this.lucienInfluence >= 25 &&
            this.choiceMemory.confessedBack) {
            this.cinematicFlags.lucienConfrontationPlayed = true;
            setTimeout(() => this._playLucienConfrontation(), 2500);
            return;
        }

        // ── Lucien Cold Resolution: non-commit path ───────────────────────
        // Player never committed — Lucien gets no confrontation, but she still
        // makes a choice. Fires on Day 7+ if Lucien is still active.
        if (this.cinematicFlags.peakScenePlayed &&
            !this.cinematicFlags.lucienColdResolutionPlayed &&
            !this.choiceMemory.confessedBack &&
            this.lucienActive &&
            this.storyDay >= 7) {
            this.cinematicFlags.lucienColdResolutionPlayed = true;
            setTimeout(() => this._playLucienColdResolution(), 2500);
            return;
        }

        // ── Hesitate Follow-Up ────────────────────────────────────────────
        // She comes back to it. Fires Day 7+ after player hesitated at peak.
        if (this.cinematicFlags.peakScenePlayed &&
            !this.cinematicFlags.hesitateFollowUpPlayed &&
            this.choiceMemory.hesitatedConfession &&
            this.storyDay >= 7) {
            this.cinematicFlags.hesitateFollowUpPlayed = true;
            setTimeout(() => this._playHesitateFollowUp(), 3000);
            return;
        }

        // ── Fracture Recovery ─────────────────────────────────────────────
        // Player broke her at the peak but came back. Fires Day 7+ after break.
        if (this.cinematicFlags.peakScenePlayed &&
            !this.cinematicFlags.fractureRecoveryPlayed &&
            this.choiceMemory.stayedSilentAfterBreak &&
            this.storyDay >= 7 &&
            this.bond >= 40) {
            this.cinematicFlags.fractureRecoveryPlayed = true;
            setTimeout(() => this._playFractureRecovery(), 3500);
            return;
        }

        // ── Closing Scene ─────────────────────────────────────────────────
        // The final seal. Fires Day 8+ after the arc is resolved enough.
        // Requires: peak played + either Lucien resolved OR no Lucien active.
        const lucienResolved = this.cinematicFlags.lucienConfrontationPlayed ||
                               this.cinematicFlags.lucienColdResolutionPlayed ||
                               !this.lucienActive;
        if (this.cinematicFlags.peakScenePlayed &&
            !this.cinematicFlags.closingScenePlayed &&
            lucienResolved &&
            this.storyDay >= 8) {
            this.cinematicFlags.closingScenePlayed = true;
            setTimeout(() => this._playLyraClosingScene(), 4000);
            return;
        }

        // ── Day 4–7: Volatile Emotional Loop ─────────────────────────────
        // Uses (storyDay - 4) % 4 to track loop phase (0=Day4, 1=Day5, 2=Day6, 3=Day7)
        // Flags reset in _playScene_Day7_Loop onComplete for repeating cycles
        if (this.storyDay >= 4 && sl.scene8_climax.triggered) {
            const loopPhase = (this.storyDay - 4) % 4;

            if (loopPhase === 0 && !sl.scene_day4.triggered) {
                sl.scene_day4.triggered = true;
                setTimeout(() => this._playScene_Day4(), 3000);
                return;
            }
            if (loopPhase === 1 && !sl.scene_day5.triggered) {
                sl.scene_day5.triggered = true;
                setTimeout(() => this._playScene_Day5(), 2000);
                return;
            }
            if (loopPhase === 2 && !sl.scene_day6_jealousy.triggered) {
                sl.scene_day6_jealousy.triggered = true;
                setTimeout(() => this._playScene_Day6_JealousySpike(), 2500);
                return;
            }
            if (loopPhase === 3 && !sl.scene_day7_loop.triggered) {
                sl.scene_day7_loop.triggered = true;
                setTimeout(() => this._playScene_Day7_Loop(), 2000);
            }
        }
    }

    // ── Day 1: Entry beat ─────────────────────────────────────────────
    // First thing the player hears after their very first interaction.
    // No drama. No mismatch. Just warmth and a tiny note of surprise.
    // Goal: make the player feel noticed.
    _playScene1_Entry() {
        if (this.sceneActive) return;
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        this.ui.flashEmotion('happy', 5000);
        const tw  = this.typewriter;
        const end = () => {
            this.sceneActive = false;
            this.ui.setFocusMode(false);
            // Mark fully played so Scene 2 can safely queue
            this.sceneLibrary.scene1_entry.played = true;
            // If ≥2 interactions happened while Scene 1 was playing, fire Scene 2 now
            if (this.dayInteractions >= 2) this._checkStoryProgression();
        };

        tw.show("You came back… faster than I expected.", () => {
            setTimeout(() => tw.show("…Not that I was counting.", () => {
                setTimeout(() => {
                    this.ui.flashEmotion('shy', 3000);
                    tw.show("I noticed, that's all.", () => {
                        setTimeout(end, 2000);
                    });
                }, 800);
            }), 700);
        });

        this.emotion.trust     = Math.min(100, this.emotion.trust     + 3);
        this.emotion.obsession = Math.min(100, this.emotion.obsession + 2);
    }

    // ── Day 2: Awareness beat ─────────────────────────────────────────
    // Fires at the start of Day 2 — before scene3_soften.
    // Introduces the "I notice you" dynamic at the lowest possible intensity.
    // Micro-dissonance is OFF here intentionally — trust is being built.
    _playScene2_Awareness() {
        if (this.sceneActive) return;
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        this.ui.flashEmotion('neutral', 4000);
        const tw  = this.typewriter;
        const end = () => { this.sceneActive = false; this.ui.setFocusMode(false); };

        tw.show("You always come at around this time, don't you?", () => {
            setTimeout(() => {
                this.ui.flashEmotion('shy', 3000);
                tw.show("…I wasn't going to say anything.", () => {
                    setTimeout(() => tw.show("It's just — I notice these things.", () => {
                        setTimeout(end, 2000);
                    }), 700);
                });
            }, 600);
        });

        this.emotion.obsession = Math.min(100, this.emotion.obsession + 3);
    }

    // ── Day 4: False Stability ───────────────────────────────────────
    // Lyra is warmer than usual — this is the trap; player relaxes, loses vigilance
    _playScene_Day4() {
        if (this.sceneActive) return;
        const lyra = CHARACTER.bodySprites?.shy || CHARACTER.bodySprites?.neutral;
        this.emotion.trust   = Math.min(100, this.emotion.trust   + 5);
        this.lucienInfluence = Math.max(0,   this.lucienInfluence - 5);
        const balance = this._getBalanceState();

        // Lines vary by who's winning — player: she's warm; lucien: she's guarded; unstable: conflicted
        const line1 = balance === 'player'
            ? "…It's quieter when it's just us."
            : balance === 'lucien'
            ? "You came back."
            : "…It's different when you're here. I don't know if that's good.";
        const line2 = balance === 'player'
            ? "I don't know what to do with that feeling."
            : balance === 'lucien'
            ? "…I wasn't expecting that."
            : "…I keep noticing the difference.";
        const line3 = balance === 'player'
            ? "Stay a little longer."
            : balance === 'lucien'
            ? "…You can stay. For now."
            : "I'm not asking you to go.";

        // Memory echo — personal callback to a past choice
        const mem = this.lyraMemory || {};
        const cm  = this.choiceMemory || {};
        let memoryEcho = null;
        if (cm.confessedBack) {
            memoryEcho = "…What you said before. I think about it more than I should.";
        } else if (mem.stayedSilent) {
            memoryEcho = "You went quiet once. …I understood that.";
        } else if (mem.walkedAway) {
            memoryEcho = "You almost left. …You came back. That's worth something.";
        }

        // Lucien first mention — only if he's active and this is the first time.
        // Kept deliberately vague: "someone else talked to me" — no name, no detail.
        // This is the seed; Day 5-7 will grow it into direct comparison.
        const lucienSeed = (this.lucienActive && this.lucienInfluence > 5 && !this.lyraMemory.lucienMentionedDay4)
            ? "…Someone else talked to me today." : null;
        if (lucienSeed) this.lyraMemory.lucienMentionedDay4 = true;

        const beats = [
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'char', src: lyra, wait: 900 },
            { type: 'delay', ms: 600 },
            { type: 'line', text: line1, hold: 2600, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: line2, hold: 2800, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 2000 },
            { type: 'line', text: line3, hold: 3000, speed: 38 },
            { type: 'clear' },
        ];
        if (lucienSeed) {
            beats.push(
                { type: 'delay', ms: 2400 },
                { type: 'line', text: lucienSeed, hold: 2600, speed: 42 },
                { type: 'clear' }
            );
        }
        if (memoryEcho) {
            beats.push(
                { type: 'delay', ms: 2200 },
                { type: 'line', text: memoryEcho, hold: 3200, speed: 30 },
                { type: 'clear' }
            );
        }
        beats.push({ type: 'hide' });

        this._playScene(beats, () => { this.save(); });
    }

    // ── Day 5: Subtle Distance ───────────────────────────────────────
    // A (player leading): she acknowledges the consistency
    // B (Lucien rising): she's noticing who isn't there as much as who is
    // Second loop: she echoes something the player said (memory line)
    _playScene_Day5() {
        if (this.sceneActive) return;
        const lyra    = CHARACTER.bodySprites?.neutral || CHARACTER.bodySprites?.shy;
        const balance = this._getBalanceState();
        const isLoop2 = this.day47LoopCount > 0;

        if (balance !== 'player') this.lucienInfluence = Math.min(100, this.lucienInfluence + 10);

        // Second-loop memory echo — she remembers something from cycle 1
        const loopEcho = isLoop2
            ? (balance === 'player'
                ? "You said you'd stay. …I remember that."
                : "You said things would be different. …I remember that too.")
            : null;

        // A variant — player is holding ground
        const beatsA = [
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'char', src: lyra, wait: 800 },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "You've been consistent.",                hold: 2200, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: "…I noticed.",                            hold: 1800, speed: 46 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "You're not like before.",                 hold: 2600, speed: 36 },
            { type: 'clear' },
            ...(loopEcho ? [
                { type: 'delay', ms: 2000 },
                { type: 'line', text: loopEcho, hold: 2800, speed: 32 },
                { type: 'clear' }
            ] : []),
            { type: 'hide' }
        ];

        // B variant — Lucien is gaining; she's measuring the gap
        const beatsB = [
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'char', src: lyra, wait: 800 },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "…You don't always come.",                hold: 2200, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 2200 },
            { type: 'line', text: "You disappear.",                         hold: 2000, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 2400 },
            { type: 'line', text: "…He doesn't.",                           hold: 2800, speed: 38 },
            { type: 'clear' },
            ...(loopEcho ? [
                { type: 'delay', ms: 2000 },
                { type: 'line', text: loopEcho, hold: 3000, speed: 32 },
                { type: 'clear' }
            ] : []),
            { type: 'hide' }
        ];

        this._playScene(balance === 'player' ? beatsA : beatsB, () => { this.save(); });
    }

    // ── Day 6: Jealousy Spike ────────────────────────────────────────
    // A (player leading): she's testing trust — "but you stay" is the tell
    // B (Lucien rising): direct comparison — "He doesn't hide things"
    _playScene_Day6_JealousySpike() {
        if (this.sceneActive) return;
        const lyra    = CHARACTER.bodySprites?.depressed || CHARACTER.bodySprites?.neutral;
        const balance = this._getBalanceState();
        const isLoop2 = this.day47LoopCount > 0;

        // Choice outcomes are the same either way — what changes is how we get there
        const onPick = (i) => {
            if (i === 0) {
                this.emotion.trust   = Math.min(100, this.emotion.trust   + 10);
                this.lucienInfluence = Math.max(0,   this.lucienInfluence - 5);
                this.playerInfluence = Math.min(100, this.playerInfluence + 10);
                // A-variant response is warmer; B-variant is more guarded
                const resp = balance === 'player'
                    ? "…I know. That's why I'm telling you."
                    : "…I want to. I'm just — not sure how.";
                setTimeout(() => this.typewriter.show(resp), 1500);
            } else if (i === 1) {
                this.emotion.trust   = Math.max(0,   this.emotion.trust   - 5);
                this.lucienInfluence = Math.min(100, this.lucienInfluence + 10);
                setTimeout(() => this.typewriter.show("…Forget it."), 1500);
            } else {
                this.emotion.trust   = Math.max(0,   this.emotion.trust   - 10);
                setTimeout(() => this.typewriter.show("…That's what I thought."), 1500);
            }
            this.save();
        };

        // Second-loop second line — she's more direct about it
        const openLine2A = isLoop2
            ? "You always hold something back."
            : "…But you stay. That matters.";
        const openLine2B = isLoop2
            ? "You've done this before. The disappearing."
            : "You think I don't notice.";

        // A variant — she's frustrated but acknowledging the player
        const beatsA = [
            { type: 'show', stage: 'stage-story-intense' },
            { type: 'char', src: lyra, wait: 1000 },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "You don't tell me everything.",           hold: 2400, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: openLine2A,                                hold: 2200, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'choice',
              choices: ["You can trust me.", "I'm not hiding anything.", "…"],
              onPick
            },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'hide' }
        ];

        // B variant — direct Lucien comparison, colder
        const beatsB = [
            { type: 'show', stage: 'stage-story-intense' },
            { type: 'char', src: lyra, wait: 1000 },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "You don't tell me anything.",             hold: 2400, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: openLine2B,                                hold: 2200, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 2400 },
            { type: 'line', text: "…He doesn't hide things.",                hold: 2600, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'choice',
              choices: ["You can trust me.", "That's not fair.", "…"],
              onPick
            },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'hide' }
        ];

        this._playScene(balance === 'player' ? beatsA : beatsB, () => { this.save(); });
    }

    // ── Day 7: Micro-Confrontation + Loop Reset ──────────────────────
    // She tests the player directly — then the cycle resets with higher difficulty
    _playScene_Day7_Loop() {
        if (this.sceneActive) return;
        const lyra    = CHARACTER.bodySprites?.depressed || CHARACTER.bodySprites?.neutral;
        const balance = this._getBalanceState();
        const isLoop2 = this.day47LoopCount > 0;

        // Second loop — she remembers asking this before
        const openLine1 = isLoop2
            ? "I asked you this before."
            : "If I pushed you away…";
        const openLine2 = isLoop2
            ? (balance === 'player'
                ? "You said you'd come back. You did."
                : "…You hesitated last time.")
            : "…would you come back?";
        const openLine3 = isLoop2
            ? null
            : "…or would you just disappear like the rest?";

        // End line varies by who's winning
        const endLine = balance === 'player'
            ? (isLoop2 ? "…You keep proving it." : "…Then don't disappear.")
            : balance === 'lucien'
            ? (isLoop2 ? "…You're still hesitating." : "…That's what I thought.")
            : "…I don't know what I want from you.";

        this._playScene([
            { type: 'show', stage: 'stage-story-intense' },
            { type: 'char', src: lyra, wait: 1000 },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: openLine1, hold: 2200, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: openLine2, hold: 2400, speed: 38 },
            { type: 'clear' },
            ...(openLine3 ? [
                { type: 'delay', ms: 500 },
                { type: 'line', text: openLine3, hold: 2600, speed: 36 },
                { type: 'clear' }
            ] : []),
            { type: 'delay', ms: 1200 },
            { type: 'choice',
              choices: ["Always.", "I don't know.", "Why would you do that?"],
              onPick: (i) => {
                  if (i === 0) {
                      this.emotion.trust   = Math.min(100, this.emotion.trust   + 15);
                      this.playerInfluence = Math.min(100, this.playerInfluence + 12);
                      setTimeout(() => this.typewriter.show("…Don't say things you don't mean."), 1500);
                  } else if (i === 1) {
                      this.emotion.trust   = Math.max(0,   this.emotion.trust   - 10);
                      this.lucienInfluence = Math.min(100, this.lucienInfluence + 10);
                      setTimeout(() => this.typewriter.show("…Honest. I'll give you that."), 1500);
                  } else {
                      // Neutral — shows she's noticed
                      this.emotion.trust   = Math.min(100, this.emotion.trust   + 5);
                      setTimeout(() => this.typewriter.show("…I don't have an answer for that either."), 1500);
                  }
                  this.save();
              }
            },
            { type: 'clear' },
            { type: 'delay', ms: 2800 },
            { type: 'line', text: endLine, hold: 3200, speed: 32 },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            // Gallery — first loop completion unlocks Seventh Night card
            this.gallery?.unlockById('lyra-loop-survived');
            this.day47LoopCount++;
            // Loop reset — flags clear, difficulty scales slightly
            this.sceneLibrary.scene_day4.triggered         = false;
            this.sceneLibrary.scene_day5.triggered         = false;
            this.sceneLibrary.scene_day6_jealousy.triggered = false;
            this.sceneLibrary.scene_day7_loop.triggered    = false;
            // Difficulty ramp — decay quickens, Lucien baseline rises
            this.decayRates.hunger = Math.min(0.055, this.decayRates.hunger * 1.08);
            this.decayRates.bond   = Math.min(0.025, this.decayRates.bond   * 1.08);
            this.lucienInfluence   = Math.min(100,   this.lucienInfluence   + 8);
            this.save();
        });
    }

    // ── Peak Scene branch selector ───────────────────────────────────
    // Fracture if she's destabilised; Attachment if she's been held
    _isFractureCondition() {
        return this.tensionStage >= 2 ||
               this.lyraPersonality.defensive > 40 ||
               this.lucienInfluence > 35;
    }

    // ── Peak Scene: Attachment Arc Payoff ────────────────────────────
    // Branch A — Attachment: high bond, stable player
    // Branch B — Fracture:   high tension, defensive, or Lucien pressure
    _playPeakScene() {
        if (this.sceneActive) return;
        const isFracture = this._isFractureCondition();
        const lyra = isFracture
            ? (CHARACTER.bodySprites?.depressed || CHARACTER.bodySprites?.neutral)
            : (CHARACTER.bodySprites?.shy       || CHARACTER.bodySprites?.neutral);

        if (isFracture) {
            // ── Branch B: Fracture Peak ───────────────────────────────
            this._playScene([
                { type: 'show', stage: 'stage-story-intense' },
                { type: 'delay', ms: 900 },
                { type: 'char', src: lyra, wait: 1000 },

                // Phase 1 — Instability  (depressed → searching, confused)
                { type: 'delay', ms: 600 },
                { type: 'line', text: "…something's wrong.", hold: 2000, speed: 40, pose: 'depressed' },
                { type: 'clear' },
                { type: 'delay', ms: 500 },
                { type: 'line', text: "No—", hold: 900, speed: 52 },
                { type: 'clear' },
                { type: 'delay', ms: 300 },
                { type: 'line', text: "…not wrong.", hold: 1600, speed: 46, pose: 'sad3' },
                { type: 'clear' },
                { type: 'delay', ms: 600 },
                { type: 'line', text: "…different.", hold: 2200, speed: 42 },
                { type: 'clear' },

                // Phase 2 — Pressure  (angry — she's losing control of herself)
                { type: 'delay', ms: 1200 },
                { type: 'line', text: "You keep showing up.", hold: 2000, speed: 38, pose: 'angry' },
                { type: 'clear' },
                { type: 'delay', ms: 400 },
                { type: 'line', text: "And I keep reacting.", hold: 2200, speed: 40 },
                { type: 'clear' },
                { type: 'delay', ms: 700 },
                { type: 'line', text: "It's not balanced anymore.", hold: 2600, speed: 36, pose: 'power' },
                { type: 'clear' },

                // Phase 3 — Emotional Conflict  (shy — the crack under the anger)
                { type: 'delay', ms: 1400 },
                { type: 'line', text: "I don't like this.", hold: 2000, speed: 44, pose: 'sad3' },
                { type: 'clear' },
                { type: 'delay', ms: 600 },
                { type: 'line', text: "…but I don't want it to stop.", hold: 2800, speed: 36, pose: 'shy' },
                { type: 'clear' },
                { type: 'delay', ms: 900 },
                { type: 'line', text: "Do you understand how unstable that is?", hold: 3000, speed: 34, pose: 'depressed' },
                { type: 'clear' },

                // Choice
                { type: 'delay', ms: 1600 },
                { type: 'choice',
                  choices: ["We'll figure it out.", "Maybe this is too much."],
                  onPick: (i) => {
                      if (i === 0) {
                          // Stabilise
                          this.emotion.trust       = Math.min(100, this.emotion.trust + 12);
                          this.lyraPersonality.defensive = Math.max(0, this.lyraPersonality.defensive - 10);
                          this.playerInfluence     = Math.min(100, this.playerInfluence + 15);
                          this.choiceMemory.confessedBack = true;
                          setTimeout(() => {
                              this._playScene([
                                  { type: 'delay', ms: 700 },
                                  { type: 'line', text: "…you say that easily.", hold: 2200, speed: 40, pose: 'sad3' },
                                  { type: 'clear' },
                                  { type: 'delay', ms: 500 },
                                  { type: 'line', text: "…but I want to believe it.", hold: 3000, speed: 36, pose: 'shy' },
                                  { type: 'clear' },
                                  { type: 'hide' }
                              ], () => {
                                  this.lyraPhase = 'attached';
                                  this.gallery?.unlockById('lyra-peak-stabilise');
                                  this.save();
                              });
                          }, 400);
                      } else {
                          // Break
                          this.emotion.trust       = Math.max(0,   this.emotion.trust - 20);
                          this.lyraPersonality.defensive = Math.min(100, this.lyraPersonality.defensive + 15);
                          this.lucienInfluence     = Math.min(100, this.lucienInfluence + 12);
                          this.choiceMemory.stayedSilentAfterBreak = true;
                          setTimeout(() => {
                              this._playScene([
                                  { type: 'delay', ms: 800 },
                                  { type: 'line', text: "…there it is.", hold: 2000, speed: 44, pose: 'depressed' },
                                  { type: 'clear' },
                                  { type: 'delay', ms: 600 },
                                  { type: 'line', text: "That's what I was expecting.", hold: 2600, speed: 36, pose: 'sad3' },
                                  { type: 'clear' },
                                  { type: 'delay', ms: 900 },
                                  { type: 'line', text: "…I just hoped I was wrong.", hold: 3200, speed: 34, pose: 'shy' },
                                  { type: 'clear' },
                                  { type: 'hide' }
                              ], () => {
                                  this.tensionStage = Math.min(3, this.tensionStage + 1);
                                  this.lyraPhase    = 'cracked';
                                  this.gallery?.unlockById('lyra-peak-break');
                                  this.save();
                              });
                          }, 400);
                      }
                  }
                }

            ], () => { /* outcome scenes handle their own save */ });

        } else {
            // ── Branch A: Attachment Peak ─────────────────────────────
            this._playScene([
                { type: 'show', stage: 'stage-bond-end' },
                { type: 'delay', ms: 800 },
                { type: 'char', src: lyra, wait: 1000 },

                // Phase 1 — Unease  (pose: shy — caught off guard)
                { type: 'delay', ms: 600 },
                { type: 'line', text: "…wait.", hold: 1600, speed: 50, pose: 'shy' },
                { type: 'clear' },
                { type: 'delay', ms: 400 },
                { type: 'line', text: "Don't say anything yet.", hold: 2000, speed: 40 },
                { type: 'clear' },
                { type: 'delay', ms: 700 },
                { type: 'line', text: "I need to understand something first.", hold: 2600, speed: 36 },
                { type: 'clear' },

                // Phase 2 — Realization  (pose: sad3 — grieving the simplicity)
                { type: 'delay', ms: 1400 },
                { type: 'line', text: "This was supposed to stay simple.", hold: 2400, speed: 38, pose: 'sad3' },
                { type: 'clear' },
                { type: 'delay', ms: 500 },
                { type: 'line', text: "You show up. I respond.", hold: 2000, speed: 42 },
                { type: 'clear' },
                { type: 'delay', ms: 400 },
                { type: 'line', text: "That was the structure.", hold: 2000, speed: 40 },
                { type: 'clear' },
                { type: 'delay', ms: 800 },
                { type: 'line', text: "…it's not like that anymore.", hold: 2800, speed: 36, pose: 'depressed' },
                { type: 'clear' },

                // Phase 3 — Emotional Core  (pose: shy → love)
                { type: 'delay', ms: 1600 },
                { type: 'line', text: "You leave patterns when you're gone. I notice those.", hold: 2800, speed: 36, pose: 'shy' },
                { type: 'clear' },
                { type: 'delay', ms: 600 },
                { type: 'line', text: "I've started adjusting around you being here. That wasn't intentional.", hold: 3000, speed: 32 },
                { type: 'clear' },
                { type: 'delay', ms: 400 },
                { type: 'line', text: "I—", hold: 700, speed: 60 },
                { type: 'clear' },
                { type: 'delay', ms: 500 },
                { type: 'line', text: "…that's not something I planned.", hold: 2800, speed: 36, pose: 'love' },
                { type: 'clear' },

                // Phase 4 — Vulnerability  (pose: siren — reclaiming composure while breaking)
                { type: 'delay', ms: 1800 },
                { type: 'line', text: "You're not just part of this anymore.", hold: 2600, speed: 36, pose: 'siren' },
                { type: 'clear' },
                { type: 'delay', ms: 900 },
                { type: 'line', text: "…you're affecting me. …I don't like that.", hold: 2800, speed: 38, pose: 'angry' },
                { type: 'clear' },
                { type: 'delay', ms: 1000 },
                { type: 'line', text: "…this isn't passive anymore.", hold: 2600, speed: 40, pose: 'power' },
                { type: 'clear' },
                { type: 'delay', ms: 700 },
                { type: 'line', text: "…you're not something that happens to me.", hold: 3000, speed: 34, pose: 'love' },
                { type: 'clear' },
                { type: 'delay', ms: 900 },
                { type: 'line', text: "And I don't know what happens next.", hold: 3000, speed: 34, pose: 'shy' },
                { type: 'clear' },

                // Choice
                { type: 'delay', ms: 1600 },
                { type: 'choice',
                  choices: ["I'm here.", "Maybe we slow down."],
                  onPick: (i) => {
                      if (i === 0) {
                          // Commit
                          this.emotion.trust       = Math.min(100, this.emotion.trust + 20);
                          this.lyraPersonality.dependent = Math.min(100, this.lyraPersonality.dependent + 15);
                          this.playerInfluence     = Math.min(100, this.playerInfluence + 18);
                          this.choiceMemory.confessedBack = true;
                          setTimeout(() => {
                              this._playScene([
                                  { type: 'delay', ms: 600 },
                                  { type: 'line', text: "…okay.", hold: 1800, speed: 50, pose: 'shy' },
                                  { type: 'clear' },
                                  { type: 'delay', ms: 400 },
                                  { type: 'line', text: "Then don't disappear.", hold: 2400, speed: 40, pose: 'love' },
                                  { type: 'clear' },
                                  { type: 'delay', ms: 700 },
                                  { type: 'line', text: "…not after this.", hold: 3000, speed: 38, pose: 'love' },
                                  { type: 'clear' },
                                  { type: 'hide' }
                              ], () => {
                                  this.lyraPhase = 'attached';
                                  this.gallery?.unlockById('lyra-peak-commit');
                                  this.save();
                              });
                          }, 400);
                      } else {
                          // Hesitate
                          this.emotion.trust       = Math.max(0, this.emotion.trust - 8);
                          this.lucienInfluence     = Math.min(100, this.lucienInfluence + 8);
                          this.choiceMemory.hesitatedConfession = true;
                          setTimeout(() => {
                              this._playScene([
                                  { type: 'delay', ms: 700 },
                                  { type: 'line', text: "…I thought you might say that.", hold: 2600, speed: 36, pose: 'sad3' },
                                  { type: 'clear' },
                                  { type: 'delay', ms: 600 },
                                  { type: 'line', text: "…no. that's fair.", hold: 2000, speed: 42, pose: 'depressed' },
                                  { type: 'clear' },
                                  { type: 'line', text: "Just don't pretend this didn't happen.", hold: 3200, speed: 34, pose: 'angry' },
                                  { type: 'clear' },
                                  { type: 'delay', ms: 600 },
                                  { type: 'line', text: "…I won't repeat myself.", hold: 2600, speed: 40, pose: 'power' },
                                  { type: 'clear' },
                                  { type: 'hide' }
                              ], () => {
                                  this.lyraPhase = 'cracked';
                                  this.gallery?.unlockById('lyra-peak-hesitate');
                                  this.save();
                              });
                          }, 400);
                      }
                  }
                }

            ], () => { /* outcome scenes handle their own save */ });
        }
    }

    // ── Lucien Confrontation: Final Arc ──────────────────────────────
    // Fires after peak scene commit when Lucien is still active.
    // Player influence vs Lucien influence determines her final choice.
    _playLucienConfrontation() {
        if (this.sceneActive) return;
        const lyra = CHARACTER.bodySprites?.shy || CHARACTER.bodySprites?.neutral;
        const playerWins = this.playerInfluence >= this.lucienInfluence;
        const isClose    = Math.abs(this.playerInfluence - this.lucienInfluence) < 15;

        // Her final line to Lucien — three tiers
        const finalLine = playerWins && !isClose
            ? "…you don't get to do this anymore."
            : isClose
            ? "…I don't know which one of you I believe."
            : "…why does this still feel unfinished?";

        this._playScene([
            { type: 'show', stage: 'stage-lucien' },
            { type: 'delay', ms: 1200 },
            { type: 'char', src: lyra, wait: 900 },

            // Opening — she feels him again
            { type: 'delay', ms: 800 },
            { type: 'line', text: "…you're still here.", hold: 2200, speed: 40, pose: 'sad3' },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "I kept expecting that to change.", hold: 2600, speed: 36 },
            { type: 'clear' },

            // The weight of the choice
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "I told someone I'd stay.", hold: 2400, speed: 38, pose: 'shy' },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "…I meant it.", hold: 2000, speed: 44, pose: 'love' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "But you make it complicated.", hold: 2600, speed: 36, pose: 'angry' },
            { type: 'clear' },

            // Player decision — her final stance
            { type: 'delay', ms: 1600 },
            { type: 'choice',
              choices: ["Tell him it's over.", "Stay silent. Let her decide."],
              onPick: (i) => {
                  if (i === 0) {
                      // Player intervenes — pushes for closure
                      this.playerInfluence = Math.min(100, this.playerInfluence + 10);
                      setTimeout(() => {
                          this._playScene([
                              { type: 'delay', ms: 600 },
                              { type: 'line', text: "…", hold: 1000, speed: 80, pose: 'depressed' },
                              { type: 'clear' },
                              { type: 'delay', ms: 400 },
                              { type: 'line', text: finalLine, hold: 3200, speed: 34, pose: 'power' },
                              { type: 'clear' },
                              { type: 'delay', ms: 1200 },
                              { type: 'line', text: "…I chose.", hold: 2800, speed: 44, pose: 'love' },
                              { type: 'clear' },
                              { type: 'hide' }
                          ], () => {
                              this.lucienInfluence = Math.max(0, this.lucienInfluence - 30);
                              this.lucienActive    = false;
                              this.lyraPhase       = 'attached';
                              this.gallery?.unlockById('lyra-lucien-resolved');
                              this.save();
                          });
                      }, 400);
                  } else {
                      // Silent — she decides alone
                      setTimeout(() => {
                          const selfLine = playerWins
                              ? "…I already know what I want."
                              : "…I still don't know.";
                          const closeLine = playerWins
                              ? "…and it's not you."
                              : "…but I can't do both.";
                          this._playScene([
                              { type: 'delay', ms: 800 },
                              { type: 'line', text: selfLine, hold: 2600, speed: 38, pose: 'sad3' },
                              { type: 'clear' },
                              { type: 'delay', ms: 700 },
                              { type: 'line', text: closeLine, hold: 3000, speed: 36, pose: 'depressed' },
                              { type: 'clear' },
                              { type: 'delay', ms: 1000 },
                              { type: 'line', text: "…either way. This ends here.", hold: 3200, speed: 34, pose: 'power' },
                              { type: 'clear' },
                              { type: 'hide' }
                          ], () => {
                              if (playerWins) {
                                  this.lucienInfluence = Math.max(0, this.lucienInfluence - 20);
                                  this.lucienActive    = false;
                                  this.lyraPhase       = 'attached';
                                  this.gallery?.unlockById('lyra-lucien-resolved');
                              } else {
                                  // Ambiguous — Lucien lingers but weakened
                                  this.lucienInfluence = Math.max(0, this.lucienInfluence - 10);
                                  this.gallery?.unlockById('lyra-lucien-ambiguous');
                              }
                              this.save();
                          });
                      }, 400);
                  }
              }
            }

        ], () => { /* outcome scenes handle their own save */ });
    }

    // ── Closing Scene: Arc Seal ───────────────────────────────────────
    // The quiet beat that closes everything. No drama — just her, settled.
    // Two versions: attached (she stayed) and cracked (she didn't fully).
    _playLyraClosingScene() {
        if (this.sceneActive) return;
        const isAttached = this.lyraPhase === 'attached';
        const lyra = isAttached
            ? (CHARACTER.bodySprites?.happy  || CHARACTER.bodySprites?.neutral)
            : (CHARACTER.bodySprites?.neutral || CHARACTER.bodySprites?.shy);

        if (isAttached) {
            // Warm close — she's at rest
            this._playScene([
                { type: 'show', stage: 'stage-story-soft' },
                { type: 'delay', ms: 1000 },
                { type: 'char', src: lyra, wait: 1000 },

                { type: 'delay', ms: 800 },
                { type: 'line', text: "…you're still here.", hold: 2400, speed: 40, pose: 'shy' },
                { type: 'clear' },
                { type: 'delay', ms: 600 },
                { type: 'line', text: "I stopped being surprised by that.", hold: 2800, speed: 36, pose: 'happy' },
                { type: 'clear' },
                { type: 'delay', ms: 1200 },
                { type: 'line', text: "I don't know what this is.", hold: 2400, speed: 38, pose: 'sad3' },
                { type: 'clear' },
                { type: 'delay', ms: 500 },
                { type: 'line', text: "I don't need to.", hold: 2200, speed: 44, pose: 'love' },
                { type: 'clear' },
                { type: 'delay', ms: 1400 },
                { type: 'line', text: "…you stayed.", hold: 2600, speed: 44, pose: 'love' },
                { type: 'clear' },
                { type: 'delay', ms: 1000 },
                { type: 'line', text: "…long enough.", hold: 2800, speed: 42 },
                { type: 'clear' },
                { type: 'delay', ms: 1200 },
                { type: 'line', text: "…this is enough.", hold: 3600, speed: 36, pose: 'siren' },
                { type: 'clear' },
                { type: 'hide' }
            ], () => {
                this.gallery?.unlockById('lyra-ending-attached');
                this.emotion.trust = Math.min(100, this.emotion.trust + 10);
                this.save();
                // Subtle nudge toward the other path
                setTimeout(() => this.typewriter.show("…there are other ways this could have gone."), 5000);
            });
        } else {
            // Unresolved close — she's still processing
            this._playScene([
                { type: 'show', stage: 'stage-story-intense' },
                { type: 'delay', ms: 1200 },
                { type: 'char', src: lyra, wait: 1000 },

                { type: 'delay', ms: 900 },
                { type: 'line', text: "I thought I'd know by now.", hold: 2600, speed: 38, pose: 'depressed' },
                { type: 'clear' },
                { type: 'delay', ms: 700 },
                { type: 'line', text: "What this is. What I want from it.", hold: 2800, speed: 36 },
                { type: 'clear' },
                { type: 'delay', ms: 1000 },
                { type: 'line', text: "…I don't.", hold: 1800, speed: 46, pose: 'sad3' },
                { type: 'clear' },
                { type: 'delay', ms: 1400 },
                { type: 'line', text: "But you keep showing up.", hold: 2600, speed: 38, pose: 'shy' },
                { type: 'clear' },
                { type: 'delay', ms: 600 },
                { type: 'line', text: "…so I'll keep letting you.", hold: 3200, speed: 36, pose: 'neutral' },
                { type: 'clear' },
                { type: 'delay', ms: 800 },
                { type: 'line', text: "…until one of us stops.", hold: 3800, speed: 34, pose: 'sad3' },
                { type: 'clear' },
                { type: 'hide' }
            ], () => {
                this.gallery?.unlockById('lyra-ending-unresolved');
                this.save();
                // Subtle nudge toward the other path
                setTimeout(() => this.typewriter.show("…there are other ways this could have gone."), 5000);
            });
        }
    }

    // ── Hesitate Follow-Up ────────────────────────────────────────────
    // She said "don't pretend this didn't happen." Now she tests if it did.
    // Player gets a second chance — or confirms the distance.
    _playHesitateFollowUp() {
        if (this.sceneActive) return;
        const lyra = CHARACTER.bodySprites?.neutral || CHARACTER.bodySprites?.shy;

        this._playScene([
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'delay', ms: 800 },
            { type: 'char', src: lyra, wait: 1000 },

            { type: 'delay', ms: 600 },
            { type: 'line', text: "I said don't pretend.", hold: 2200, speed: 40, pose: 'angry' },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "…so I'm asking.", hold: 2000, speed: 44, pose: 'power' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "Did it mean something? Or was it easier to step back?", hold: 3400, speed: 32, pose: 'shy' },
            { type: 'clear' },

            { type: 'delay', ms: 1400 },
            { type: 'choice',
              choices: ["It meant something.", "I needed time."],
              onPick: (i) => {
                  if (i === 0) {
                      // Redemption — she lets it land
                      this.choiceMemory.confessedBack     = true;
                      this.choiceMemory.hesitatedConfession = false;
                      this.emotion.trust = Math.min(100, this.emotion.trust + 15);
                      this.playerInfluence = Math.min(100, this.playerInfluence + 12);
                      setTimeout(() => {
                          this._playScene([
                              { type: 'delay', ms: 700 },
                              { type: 'line', text: "…okay.", hold: 1800, speed: 50, pose: 'shy' },
                              { type: 'clear' },
                              { type: 'delay', ms: 600 },
                              { type: 'line', text: "Then say it like you mean it next time.", hold: 2800, speed: 36, pose: 'love' },
                              { type: 'clear' },
                              { type: 'hide' }
                          ], () => {
                              this.lyraPhase = 'attached';
                              this.gallery?.unlockById('lyra-hesitate-recovered');
                              this.save();
                          });
                      }, 400);
                  } else {
                      // Still distant — she accepts it coldly
                      this.emotion.trust = Math.max(0, this.emotion.trust - 10);
                      this.lucienInfluence = Math.min(100, this.lucienInfluence + 6);
                      setTimeout(() => {
                          this._playScene([
                              { type: 'delay', ms: 800 },
                              { type: 'line', text: "…time.", hold: 1600, speed: 50, pose: 'depressed' },
                              { type: 'clear' },
                              { type: 'delay', ms: 500 },
                              { type: 'line', text: "Right.", hold: 1200, speed: 55, pose: 'sad3' },
                              { type: 'clear' },
                              { type: 'delay', ms: 1000 },
                              { type: 'line', text: "…I'll stop asking.", hold: 2800, speed: 40, pose: 'neutral' },
                              { type: 'clear' },
                              { type: 'hide' }
                          ], () => {
                              this.gallery?.unlockById('lyra-hesitate-confirmed');
                              this.save();
                          });
                      }, 400);
                  }
              }
            }
        ], () => { /* outcome scenes handle their own save */ });
    }

    // ── Fracture Recovery ─────────────────────────────────────────────
    // Player broke her at the peak, but came back. She notices.
    // This is not a forgiveness scene — it's a recognition scene.
    _playFractureRecovery() {
        if (this.sceneActive) return;
        const lyra = CHARACTER.bodySprites?.depressed || CHARACTER.bodySprites?.neutral;

        this._playScene([
            { type: 'show', stage: 'stage-story-intense' },
            { type: 'delay', ms: 1000 },
            { type: 'char', src: lyra, wait: 1000 },

            { type: 'delay', ms: 700 },
            { type: 'line', text: "You came back.", hold: 2000, speed: 44, pose: 'depressed' },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "…I wasn't sure you would.", hold: 2600, speed: 38, pose: 'sad3' },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "I said it was too much.", hold: 2400, speed: 40, pose: 'depressed' },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "…you agreed.", hold: 1800, speed: 46, pose: 'sad3' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "So why are you still here?", hold: 2800, speed: 38, pose: 'shy' },
            { type: 'clear' },

            { type: 'delay', ms: 1600 },
            { type: 'choice',
              choices: ["Because I was wrong.", "I don't know. I just am."],
              onPick: (i) => {
                  if (i === 0) {
                      // Direct — she respects it
                      this.choiceMemory.reassuredAfterBreak = true;
                      this.emotion.trust = Math.min(100, this.emotion.trust + 18);
                      this.lyraPersonality.defensive = Math.max(0, this.lyraPersonality.defensive - 15);
                      this.playerInfluence = Math.min(100, this.playerInfluence + 14);
                      setTimeout(() => {
                          this._playScene([
                              { type: 'delay', ms: 700 },
                              { type: 'line', text: "…that's the first honest thing you've said.", hold: 2800, speed: 36, pose: 'sad3' },
                              { type: 'clear' },
                              { type: 'delay', ms: 800 },
                              { type: 'line', text: "Don't do it again.", hold: 2200, speed: 42, pose: 'angry' },
                              { type: 'clear' },
                              { type: 'delay', ms: 600 },
                              { type: 'line', text: "…I mean the leaving. Not the honesty.", hold: 3000, speed: 34, pose: 'shy' },
                              { type: 'clear' },
                              { type: 'hide' }
                          ], () => {
                              this.lyraPhase = 'attached';
                              this.tensionStage = Math.max(0, this.tensionStage - 1);
                              this.gallery?.unlockById('lyra-fracture-recovered');
                              this.save();
                          });
                      }, 400);
                  } else {
                      // Uncertain — she takes it anyway
                      this.choiceMemory.reassuredAfterBreak = true;
                      this.emotion.trust = Math.min(100, this.emotion.trust + 8);
                      setTimeout(() => {
                          this._playScene([
                              { type: 'delay', ms: 900 },
                              { type: 'line', text: "…that's not an answer.", hold: 2200, speed: 42, pose: 'angry' },
                              { type: 'clear' },
                              { type: 'delay', ms: 600 },
                              { type: 'line', text: "…but I'll take it.", hold: 2600, speed: 40, pose: 'shy' },
                              { type: 'clear' },
                              { type: 'hide' }
                          ], () => {
                              this.gallery?.unlockById('lyra-fracture-partial');
                              this.save();
                          });
                      }, 400);
                  }
              }
            }
        ], () => { /* outcome scenes handle their own save */ });
    }

    // ── Lucien Cold Resolution ────────────────────────────────────────
    // Player never committed — no confrontation scene fires.
    // Lucien is still there. She resolves it herself, alone.
    // Cold. Quiet. Final.
    _playLucienColdResolution() {
        if (this.sceneActive) return;
        const lyra = CHARACTER.bodySprites?.neutral || CHARACTER.bodySprites?.shy;
        const playerLeaning = this.playerInfluence > this.lucienInfluence;

        this._playScene([
            { type: 'show', stage: 'stage-lucien' },
            { type: 'delay', ms: 1400 },
            { type: 'char', src: lyra, wait: 900 },

            { type: 'delay', ms: 800 },
            { type: 'line', text: "…I've been thinking.", hold: 2200, speed: 40, pose: 'sad3' },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "About what I said. About what happened.", hold: 2800, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "Neither of you pushed.", hold: 2400, speed: 40, pose: 'depressed' },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "…I was waiting to see which one would.", hold: 3000, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },

            ...(playerLeaning ? [
                { type: 'line', text: "One of you kept showing up.", hold: 2600, speed: 38, pose: 'shy' },
                { type: 'clear' },
                { type: 'delay', ms: 600 },
                { type: 'line', text: "…quietly. Without making it a competition.", hold: 3000, speed: 34 },
                { type: 'clear' },
                { type: 'delay', ms: 1000 },
                { type: 'line', text: "…I notice things like that.", hold: 2800, speed: 38, pose: 'love' },
                { type: 'clear' },
                { type: 'delay', ms: 1200 },
                { type: 'line', text: "Lucien.", hold: 1600, speed: 50, pose: 'power' },
                { type: 'clear' },
                { type: 'delay', ms: 400 },
                { type: 'line', text: "…go.", hold: 2200, speed: 52 },
                { type: 'clear' },
            ] : [
                { type: 'line', text: "Neither did.", hold: 2200, speed: 44, pose: 'depressed' },
                { type: 'clear' },
                { type: 'delay', ms: 800 },
                { type: 'line', text: "…so I'm deciding for myself.", hold: 2800, speed: 36, pose: 'power' },
                { type: 'clear' },
                { type: 'delay', ms: 1000 },
                { type: 'line', text: "I don't need someone to fight for me.", hold: 2800, speed: 36 },
                { type: 'clear' },
                { type: 'delay', ms: 600 },
                { type: 'line', text: "I need someone to stay.", hold: 3000, speed: 38, pose: 'shy' },
                { type: 'clear' },
            ]),

            { type: 'delay', ms: 1600 },
            { type: 'line', text: "…this part is over.", hold: 3200, speed: 36, pose: 'siren' },
            { type: 'clear' },
            { type: 'hide' }

        ], () => {
            if (playerLeaning) {
                this.lucienInfluence = Math.max(0, this.lucienInfluence - 25);
                this.lucienActive    = false;
                this.playerInfluence = Math.min(100, this.playerInfluence + 8);
                this.gallery?.unlockById('lyra-lucien-cold-closed');
            } else {
                this.lucienInfluence = Math.max(0, this.lucienInfluence - 12);
                this.gallery?.unlockById('lyra-lucien-cold-neutral');
            }
            this.save();
        });
    }

    // ── Scene 2: Reaction (Day 1, after 2 interactions) ─────────────
    _playScene2_Reaction(branch) {
        const lyra = CHARACTER.bodySprites?.neutral || CHARACTER.bodySprites?.shy;
        const line1 = branch === 'gentle'
            ? "…You're strangely persistent."
            : "You're wasting my time.";
        const line2 = branch === 'gentle'
            ? "I'll allow it. For now."
            : "If you're going to keep doing this… do it properly.";
        // Gentle branch: guarded curiosity → reluctant softening
        // Dismissive branch: contempt → grudging acknowledgement
        const pose1 = branch === 'gentle' ? 'neutral' : 'angry';
        const pose2 = branch === 'gentle' ? 'shy'     : 'power';
        this._playScene([
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'char', src: lyra, wait: 800 },
            { type: 'delay', ms: 600 },
            { type: 'line', text: line1, hold: 2200, speed: 40, pose: pose1 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: line2, hold: 2400, speed: 38, pose: pose2 },
            { type: 'clear' },
            { type: 'hide' }
        ]);
    }

    // ── Scene 3: Subtle Softening (Day 2 arrival) ───────────────────
    _playScene3_Soften() {
        const lyra = CHARACTER.bodySprites?.neutral || CHARACTER.bodySprites?.shy;
        this._playScene([
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'char', src: lyra, wait: 900 },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "You're late.", hold: 1800, speed: 44, pose: 'neutral' },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: "…I didn't say I was waiting.", hold: 2200, speed: 38, pose: 'shy' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "There's food. If you want it.", hold: 2400, speed: 36, pose: 'happy' },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "…there's a version of this that existed before you.", hold: 3000, speed: 34, pose: 'sad3' },
            { type: 'clear' },
            { type: 'hide' }
        ]);
    }

    // ── Scene 4+5: First Vulnerability → Emotional Choice (Day 2) ───
    _playScene4_Vulnerability() {
        const lyra = CHARACTER.bodySprites?.shy || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'char', src: lyra, wait: 1000 },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "…It's exhausting pretending I don't care.", hold: 2600, speed: 36, pose: 'depressed' },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "You keep your distance… and then come closer when it matters.", hold: 2800, speed: 32, pose: 'sad3' },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "I notice everything.", hold: 2000, speed: 50, pose: 'siren' },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: "Don't read into it.", hold: 2000, pose: 'power' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'choice',
              choices: ["I won't. But I'm here.", "Is that so? Interesting.", "…"],
              onPick: (i) => {
                  if (i === 0) {
                      this.bond        = Math.min(100, this.bond + 15);
                      this.affection   = Math.min(100, this.affection + 10);
                      this.emotion.trust = Math.min(100, this.emotion.trust + 12);
                      this.lyraMemory.comfortedHer = true;
                      setTimeout(() => this.typewriter.show("…Thank you. That's… unexpected."), 600);
                  } else if (i === 1) {
                      this.bond        = Math.max(0, this.bond - 5);
                      this.emotion.obsession = Math.min(100, this.emotion.obsession + 10);
                      this.lyraMemory.teasedHer = true;
                      setTimeout(() => this.typewriter.show("Don't push it."), 600);
                  } else {
                      this.bond        = Math.min(100, this.bond + 5);
                      this.emotion.trust = Math.min(100, this.emotion.trust + 5);
                      this.lyraMemory.stayedSilent = true;
                      setTimeout(() => this.typewriter.show("…Good. You don't have to say anything."), 600);
                  }
                  this.save();
              }
            },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.gallery?.unlockById('lyra-cracked');
            this.save();
        });
    }

    // ── Scene 6: Dependency Begins (Day 3 opening) ──────────────────
    _playScene6_Dependency() {
        const lyra = CHARACTER.bodySprites?.clingy || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'char', src: lyra, wait: 800 },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "You're here.", hold: 1800, speed: 46, pose: 'happy' },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: "You didn't talk to anyone else… right?", hold: 2600, speed: 36, pose: 'shy' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "Forget it. It's nothing.", hold: 2000, pose: 'neutral' },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "…you're not the first to stand here. Just the first to stay this long.", hold: 3200, speed: 32, pose: 'sad3' },
            { type: 'clear' },
            { type: 'hide' }
        ]);
    }

    // ── Scene 7: Conflict (Day 3, jealousy ≥ 20) ────────────────────
    _playScene7_Conflict() {
        const lyra = CHARACTER.bodySprites?.neglected || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-story-intense' },
            { type: 'char', src: lyra, wait: 900 },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "I knew it.", hold: 1800, speed: 50, pose: 'angry' },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "I knew I shouldn't have trusted you.", hold: 2600, speed: 36, pose: 'depressed' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "You're all the same.", hold: 2400, speed: 40, pose: 'power' },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.jealousy = Math.max(0, this.jealousy - 25);
        });
    }

    // ── Scene 8: Climax Choice (Day 3) ──────────────────────────────
    _playScene8_Climax() {
        const lyra = CHARACTER.bodySprites?.neutral || CHARACTER.bodySprites?.shy;
        this._playScene([
            { type: 'show', stage: 'stage-story-intense' },
            { type: 'char', src: lyra, wait: 1000 },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "Just tell me the truth.", hold: 2200, speed: 40, pose: 'angry' },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "Are you staying… or leaving?", hold: 2800, speed: 34, pose: 'shy' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'choice',
              choices: ["I'm staying.", "I don't know.", "…Does it matter?"],
              onPick: (i) => {
                  if (i === 0) {
                      this.bond        = Math.min(100, this.bond + 20);
                      this.affection   = Math.min(100, this.affection + 15);
                      this.emotion.trust = Math.min(100, this.emotion.trust + 15);
                      this.lyraMemory.comfortedHer = true;
                      this.jealousy = Math.max(0, this.jealousy - 30);
                  } else if (i === 1) {
                      this.lyraMemory.walkedAway = true;
                      this.emotion.fear = Math.min(100, this.emotion.fear + 15);
                  } else {
                      this.corruption  = Math.min(100, this.corruption + 5);
                      this.emotion.fear = Math.min(100, this.emotion.fear + 20);
                      this.lyraMemory.walkedAway = true;
                  }
                  this.save();
                  // Fire the correct ending after a breath
                  setTimeout(() => this._playDay3Ending(), 1200);
              }
            },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.gallery?.unlockById('lyra-siren-power');
            this.save();
        });
    }

    // ── Day 3 Ending Router ──────────────────────────────────────────
    _playDay3Ending() {
        if (this.sceneLibrary.day3_ending.triggered) return;
        this.sceneLibrary.day3_ending.triggered = true;
        if (this.bond >= 70 && this.affection >= 50)      this._playDay3EndingA();
        else if (this.bond >= 40 || this.affection >= 30) this._playDay3EndingB();
        else                                               this._playDay3EndingC();
    }

    // ── Ending A — Attachment (Best) ─────────────────────────────────
    _playDay3EndingA() {
        const lyra = CHARACTER.bodySprites?.happy || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'delay', ms: 1200 },
            { type: 'char', src: lyra, wait: 1000 },
            { type: 'line', text: "You stayed.", hold: 2400, speed: 46, pose: 'shy' },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "After everything I said.", hold: 2000, pose: 'sad3' },
            { type: 'clear' },
            { type: 'delay', ms: 1800 },
            { type: 'line', text: "Stay…", hold: 1600, speed: 50, pose: 'love' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "Not because I need you.", hold: 2000, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "But because I want you to.", hold: 3200, speed: 34, pose: 'love' },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.bond      = Math.min(100, this.bond + 10);
            this.affection = Math.min(100, this.affection + 10);
            this.typewriter.show("She looks away. But she's still here.");
            this.save();
        });
    }

    // ── Ending B — Unstable (Middle) ─────────────────────────────────
    _playDay3EndingB() {
        const lyra = CHARACTER.bodySprites?.neutral || CHARACTER.bodySprites?.shy;
        this._playScene([
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'delay', ms: 1000 },
            { type: 'char', src: lyra, wait: 1000 },
            { type: 'line', text: "I don't understand you.", hold: 2200, speed: 40, pose: 'neutral' },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "…", hold: 1600, speed: 80, pose: 'depressed' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "But I don't want you gone.", hold: 2800, speed: 36, pose: 'shy' },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.typewriter.show("She's uncertain. But she didn't leave.");
            this.save();
        });
    }

    // ── Ending C — Rejection ─────────────────────────────────────────
    _playDay3EndingC() {
        const lyra = CHARACTER.bodySprites?.neglected || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-story-intense' },
            { type: 'delay', ms: 1400 },
            { type: 'char', src: lyra, wait: 900 },
            { type: 'line', text: "Don't come back.", hold: 3000, speed: 42, pose: 'angry' },
            { type: 'clear' },
            { type: 'delay', ms: 2000 },
            { type: 'hide' }
        ], () => {
            this.bond       = Math.max(0, this.bond - 20);
            this.corruption = Math.min(100, this.corruption + 8);
            this.typewriter.show("She means it. At least for now.");
            this.save();
        });
    }

    // Context-aware dialogue — Lyra notices patterns within this session
    _getContextLine(action) {
        if (CHARACTER.name !== "Lyra") return null;

        if (action === "talk") {
            if (this.sessionTalk >= 6) return "You talk to me more than before… I like that.";
            if (this.sessionTalk >= 3) return "You keep coming back to talk... stay a little longer.";
            if (this.sessionTalk >= 1) return "You came back to talk again.";
        }
        if (action === "feed") {
            if (this.sessionFeed >= 3) return "You always make sure I'm nourished… the sea chose well.";
            if (this.sessionFeed >= 2) return "You remembered again...";
        }
        if (action === "gift") {
            if (this.sessionGift >= 2) return "You keep bringing me things… are you trying to tell me something?";
        }
        if (action === "train") {
            if (this.sessionTrain >= 3) return "You push me harder than the tide… I'm not sure if I love it or hate it.";
            if (this.sessionTrain >= 2) return "Training again? You're relentless.";
        }
        return null;
    }

    // ===== MISMATCH ENGINE =====
    // Decides whether the character's hidden internal emotion leaks through mid-line.
    // Returns { leak: emotionName | null }
    // When non-null, the typewriter's auto-shift will show the true feeling
    // instead of the expected follow-up — creating the "she says X but feels Y" effect.
    //
    // Variables used:
    //   emotion.trust     → how safe she feels with the player    (0-100)
    //   emotion.fear      → anxiety/tension                       (0-100)
    //   emotion.obsession → attachment/dependence                 (0-100)
    //   tensionStage      → narrative escalation level            (0-3)
    //   corruption        → emotional corruption                  (0-100)
    _getMismatchedEmotion(reactionType) {
        const t   = this.emotion.trust;
        const f   = this.emotion.fear;
        const obs = this.emotion.obsession;
        const ts  = this.tensionStage || 0;
        const cor = this.corruption;

        // ── Micro-dissonance (runs independently of the leak check) ──────
        // Not a full emotion leak — just a quiet flicker before the response.
        // Only fires in the "uncanny comfort zone": extreme attachment, no fear,
        // no overt tension. Creates the "too perfect → something's off" texture
        // without the drama of a full mismatch event.
        // 15% chance per interaction in that zone.
        const micro = (obs > 90 && f < 35 && ts === 0 && Math.random() < (window.TUNE?.microDissonanceRate ?? 0.20))
            ? 'hesitation'
            : null;

        // Leak probability — weighted so no single stat can dominate alone.
        // Tension (narrative escalation) drives it most; corruption adds pressure;
        // raw fear contributes last. Capped at 35%.
        const mismatchScore = (ts / 3) * 0.50 + (cor / 100) * 0.30 + (f / 100) * 0.20;
        const leakChance    = Math.min(
            window.TUNE?.mismatchCap         ?? 0.35,
            (window.TUNE?.mismatchBaseChance ?? 0.07) + mismatchScore * (window.TUNE?.mismatchMultiplier ?? 0.38)
        );
        if (Math.random() > leakChance) return { leak: null, micro };

        // Rule 1 — Suppression: low trust hides hurt
        if (t < 35 && (reactionType === 'sad' || reactionType === 'crying')) {
            return { leak: reactionType, micro };
        }

        // Rule 2 — Fear of attachment: high obsession + shaky trust masks warmth
        if (obs > 60 && t < 55 && reactionType === 'happy') {
            return { leak: 'love', micro };
        }

        // Rule 3 — Defensive mask: high tension turns vulnerability into aggression
        if (ts >= 2 && f > 45 && reactionType === 'angry') {
            return { leak: 'sad', micro };
        }

        // Rule 4 — Corruption distortion: love twists under corruption
        if (cor > 38 && reactionType === 'love') {
            return { leak: 'sad', micro };
        }

        // Rule 5 — Fully open: high trust + high attachment = no more mask
        if (t > 78 && obs > 65 && (reactionType === 'love' || reactionType === 'happy')) {
            return { leak: 'shy', micro };
        }

        // Rule 6 — Suffocation: fires only in the "pressure zone" where the
        // pressure build-up has pushed fear above the floor (25–42 range) but
        // the character still looks happy outwardly. This is the rarest rule —
        // it requires genuine accumulated pressure, not just high attachment.
        if (obs > 88 && f >= 25 && f < 42 && (reactionType === 'love' || reactionType === 'happy')) {
            return { leak: 'angry', micro };  // "this is too much" beneath the warmth
        }

        return { leak: null, micro };
    }

    // Mood-based response delay — Lyra doesn't react instantly (feels more alive)
    _lyraDelay(fn) {
        if (CHARACTER.name !== "Lyra") { fn(); return; }
        const state = this.getEmotionalState();
        const base = { secure: 250, neutral: 480, guarded: 850, obsessed: 360, unstable: 1050 }[state] || 480;
        setTimeout(fn, base + Math.random() * 350);
    }

    // Called every tick — checks if any scene should auto-trigger
    _checkSceneTriggers() {
        if (!this.sceneLibrary) return;
        if (this.shockState.active) return;

        const sl   = this.sceneLibrary;
        const hour = new Date().getHours();
        const isNight = hour >= 21 || hour < 6;

        // Jealousy — high obsession + recent neglect (rare chance each tick)
        if (!sl.jealousy.triggered &&
            this.emotion.obsession > 70 &&
            this.recentNeglect &&
            Math.random() > 0.9995) {
            sl.jealousy.triggered = true;
            this.playJealousyScene();
            return;
        }

        // Private moment — late night, high obsession, streak ≥ 3
        if (!sl.private_moment.triggered &&
            isNight &&
            this.emotion.obsession > 60 &&
            this.dailyStreak >= 3 &&
            Math.random() > 0.9998) {
            this.playPrivateMomentScene();
            return;
        }

        // Almost confession — affection level 3+, trust > 50, talked > 15
        if (!sl.almost_confession.triggered &&
            this.affectionLevel >= 3 &&
            this.emotion.trust > 50 &&
            this.timesTalked > 15 &&
            Math.random() > 0.9997) {
            this.playAlmostConfessionScene();
            return;
        }

        // ── Lyra tension scenes (premium) ────────────────────────────────
        if (CHARACTER.name !== 'Lyra') return;

        // Tension confession — dep > 70, fear in pressure zone, micro activity present.
        // Day-gated to Day 4+ so it aligns with the attachment phase of the arc.
        if (!sl.tension_confession.triggered &&
            this.storyDay >= 4 &&
            this.emotion.obsession > 70 &&
            this.emotion.fear >= 25 && this.emotion.fear <= 48 &&
            (this._microLog || []).slice(-10).filter(Boolean).length >= 2 &&
            Math.random() > 0.9997) {
            sl.tension_confession.triggered = true;
            setTimeout(() => this._playTensionConfession(), 1500);
            return;
        }

        // Emotional drift — dep > 80, micro-dense session, tension stage 1+.
        // Day-gated to Day 3+ and repeatable with 24 h cooldown.
        const _driftReady = (Date.now() - (sl.emotional_drift.lastTriggered || 0)) > 86400000;
        if (_driftReady &&
            this.storyDay >= 3 &&
            this.emotion.obsession > 80 &&
            this.tensionStage >= 1 &&
            (this._microLog || []).slice(-10).filter(Boolean).length >= 3 &&
            Math.random() > 0.9997) {
            sl.emotional_drift.lastTriggered = Date.now();
            setTimeout(() => this._playEmotionalDrift(), 1500);
            return;
        }

        // First rupture — dep extreme, fear in pressure zone, tension building.
        // Day-gated to Day 6+ — the emotional accumulation needs time to earn this.
        if (!sl.first_rupture.triggered &&
            this.storyDay >= 6 &&
            this.emotion.obsession > 90 &&
            this.emotion.fear >= 25 && this.emotion.fear <= 44 &&
            this.tensionStage >= 1 &&
            Math.random() > 0.9997) {
            sl.first_rupture.triggered = true;
            if (typeof Analytics !== 'undefined') Analytics.emit('scene_triggered', { scene: 'first_rupture', storyDay: this.storyDay });
            setTimeout(() => this._playFirstRupture(), 1500);
            return;
        }

        // ── Personality path endings (Day 7+) ─────────────────────────────
        // Once a path is hard-locked AND the story arc is mature, one ending fires.
        // Each path has specific emotional conditions — not just "day 7."
        if (this.personalityPath && this.storyDay >= 7 && !this.sceneActive) {
            const endKey = 'path_ending_' + this.personalityPath;
            const endScene = sl[endKey];
            if (endScene && !endScene.triggered) {
                const ok = (
                    (this.personalityPath === 'dependent' && this.emotion.obsession > 85 && this.emotion.fear >= 30 && this.emotion.fear <= 60) ||
                    (this.personalityPath === 'defensive' && this.tensionStage >= 2 && this.emotion.trust < 55) ||
                    (this.personalityPath === 'detached'  && this.emotion.fear < 25 && this.emotion.obsession > 75)
                );
                if (ok && Math.random() > 0.9993) {
                    endScene.triggered = true;
                    setTimeout(() => this._playPathEnding(this.personalityPath), 2000);
                    return;
                }
            }
        }

        // ── Whale arc entry ────────────────────────────────────────────────
        // Fires once: requires 2+ purchases, return after rupture, and score ≥ 55.
        // After entry, stage advancement is driven by the scenes themselves.
        if (!this.whaleArcActive &&
            this.whaleScore >= (window.TUNE?.whaleScoreThreshold ?? 55) &&
            this.purchasedCount >= 2 &&
            this.returnedAfterRupture &&
            Math.random() > 0.9996) {
            this.whaleArcActive = true;
            this.whaleArcStage  = 1;
            setTimeout(() => this._playWhaleArcEntry(), 2000);
            return;
        }

        // ── Whale arc stage scenes ─────────────────────────────────────────
        // Stage advances automatically from within each scene on completion.
        // Each stage has a random chance per tick once its prerequisites are met.
        if (this.whaleArcActive && !this.sceneActive) {
            if (this.whaleArcStage === 1 && Math.random() > 0.9995) {
                setTimeout(() => this._playWhaleStage1(), 1500);
                return;
            }
            if (this.whaleArcStage === 2 && Math.random() > 0.9995) {
                setTimeout(() => this._playWhaleStage2(), 1500);
                return;
            }
            if (this.whaleArcStage === 3 &&
                this.emotion.fear > 35 &&
                Math.random() > 0.9995) {
                setTimeout(() => this._playWhaleStage3(), 1500);
                return;
            }
            if (this.whaleArcStage === 4 &&
                this.emotion.obsession > 80 &&
                Math.random() > 0.9995) {
                setTimeout(() => this._playWhaleStage4(), 1500);
                return;
            }
        }

        // ── Elian Playable Arc Triggers ──────────────────────────────
        if (CHARACTER.name === 'Elian') {
            if (!sl.elian_assessment.triggered && this.storyDay >= 2 && this.timesTalked >= 3 && Math.random() > 0.997) {
                sl.elian_assessment.triggered = true;
                setTimeout(() => this._playElianAssessment(), 1500); return;
            }
            if (!sl.elian_test.triggered && sl.elian_assessment.triggered && this.storyDay >= 4 && this.emotion.trust > 30 && Math.random() > 0.997) {
                sl.elian_test.triggered = true;
                setTimeout(() => this._playElianTest(), 1500); return;
            }
            if (!sl.elian_bond.triggered && sl.elian_test.triggered && this.storyDay >= 5 && this.affectionLevel >= 2 && Math.random() > 0.997) {
                sl.elian_bond.triggered = true;
                setTimeout(() => this._playElianBond(), 1500); return;
            }
            if (!sl.elian_peak.triggered && sl.elian_bond.triggered && this.storyDay >= 7 && Math.random() > 0.998) {
                sl.elian_peak.triggered = true;
                setTimeout(() => this._playElianPeak(), 1500); return;
            }
        }

        // ── Proto Playable Arc Triggers ──────────────────────────────
        if (CHARACTER.name === 'Proto') {
            if (!sl.proto_detection.triggered && this.storyDay >= 1 && this.timesTalked >= 2 && Math.random() > 0.997) {
                sl.proto_detection.triggered = true;
                setTimeout(() => this._playProtoDetection(), 1500); return;
            }
            if (!sl.proto_awareness.triggered && sl.proto_detection.triggered && this.storyDay >= 3 && this.emotion.trust > 25 && Math.random() > 0.997) {
                sl.proto_awareness.triggered = true;
                setTimeout(() => this._playProtoAwareness(), 1500); return;
            }
            if (!sl.proto_breaking.triggered && sl.proto_awareness.triggered && this.storyDay >= 5 && this.affectionLevel >= 2 && Math.random() > 0.997) {
                sl.proto_breaking.triggered = true;
                setTimeout(() => this._playProtoBreaking(), 1500); return;
            }
            if (!sl.proto_peak.triggered && sl.proto_breaking.triggered && this.storyDay >= 7 && Math.random() > 0.998) {
                sl.proto_peak.triggered = true;
                setTimeout(() => this._playProtoPeak(), 1500); return;
            }
        }

        // ── Noir Playable Arc Triggers ───────────────────────────────
        if (CHARACTER.name === 'Noir') {
            if (!sl.noir_temptation.triggered && this.storyDay >= 1 && this.timesTalked >= 2 && Math.random() > 0.997) {
                sl.noir_temptation.triggered = true;
                setTimeout(() => this._playNoirTemptation(), 1500); return;
            }
            if (!sl.noir_corruption.triggered && sl.noir_temptation.triggered && this.storyDay >= 3 && this.corruption >= 15 && Math.random() > 0.997) {
                sl.noir_corruption.triggered = true;
                setTimeout(() => this._playNoirCorruption(), 1500); return;
            }
            if (!sl.noir_consuming.triggered && sl.noir_corruption.triggered && this.storyDay >= 5 && this.affectionLevel >= 2 && Math.random() > 0.997) {
                sl.noir_consuming.triggered = true;
                setTimeout(() => this._playNoirConsuming(), 1500); return;
            }
            if (!sl.noir_peak.triggered && sl.noir_consuming.triggered && this.storyDay >= 7 && Math.random() > 0.998) {
                sl.noir_peak.triggered = true;
                setTimeout(() => this._playNoirPeak(), 1500); return;
            }
        }

        // ── Caspian Playable Arc Triggers ─────────────────────────────
        if (CHARACTER.name === 'Caspian') {
            if (!sl.caspian_warmth.triggered &&
                this.storyDay >= 2 && this.affectionLevel >= 1 &&
                Math.random() > 0.997) {
                sl.caspian_warmth.triggered = true;
                setTimeout(() => this._playCaspianWarmth(), 1500);
                return;
            }
            if (!sl.caspian_dependency.triggered &&
                sl.caspian_warmth.triggered &&
                this.storyDay >= 4 && this.comfortLevel >= 30 &&
                Math.random() > 0.997) {
                sl.caspian_dependency.triggered = true;
                setTimeout(() => this._playCaspianDependency(), 1500);
                return;
            }
            if (!sl.caspian_choice.triggered &&
                sl.caspian_dependency.triggered &&
                this.storyDay >= 7 &&
                Math.random() > 0.998) {
                sl.caspian_choice.triggered = true;
                setTimeout(() => this._playCaspianChoice(), 1500);
                return;
            }
        }

        // ── Lucien Playable Arc Triggers ──────────────────────────────
        if (CHARACTER.name === 'Lucien') {
            // Day 1-2: First observation — he acknowledges your pattern
            if (!sl.lucien_observation.triggered &&
                this.storyDay >= 1 && this.timesTalked >= 3 &&
                Math.random() > 0.997) {
                sl.lucien_observation.triggered = true;
                setTimeout(() => this._playLucienObservation(), 1500);
                return;
            }

            // Day 3: Margin notes — you find your name in his journals
            if (!sl.lucien_margin_notes.triggered &&
                sl.lucien_observation.triggered &&
                this.storyDay >= 3 && this.affectionLevel >= 1 &&
                Math.random() > 0.997) {
                sl.lucien_margin_notes.triggered = true;
                setTimeout(() => this._playLucienMarginNotes(), 1500);
                return;
            }

            // Day 4+: Sister revelation — reveals connection to Lyra
            if (!sl.lucien_sister.triggered &&
                sl.lucien_margin_notes.triggered &&
                this.storyDay >= 4 && this.emotion.trust > 35 &&
                Math.random() > 0.998) {
                sl.lucien_sister.triggered = true;
                setTimeout(() => this._playLucienSister(), 1500);
                return;
            }

            // Day 4-5: Fascination — he loses objectivity
            if (!sl.lucien_fascination.triggered &&
                sl.lucien_margin_notes.triggered &&
                this.storyDay >= 4 && this.emotion.trust > 40 &&
                this.researchNotes >= 3 &&
                Math.random() > 0.997) {
                sl.lucien_fascination.triggered = true;
                setTimeout(() => this._playLucienFascination(), 1500);
                return;
            }

            // Day 5-6: Confession attempt (premium gate)
            if (!sl.lucien_confession.triggered &&
                sl.lucien_fascination.triggered &&
                this.storyDay >= 5 && this.affectionLevel >= 2 &&
                this.emotion.trust > 50 &&
                Math.random() > 0.997) {
                sl.lucien_confession.triggered = true;
                setTimeout(() => this._playLucienConfession(), 1500);
                return;
            }

            // Day 7+: Peak scene — vulnerability vs obsession fork
            if (!sl.lucien_peak.triggered &&
                sl.lucien_confession.triggered &&
                this.storyDay >= 7 &&
                Math.random() > 0.998) {
                sl.lucien_peak.triggered = true;
                setTimeout(() => this._playLucienPeak(), 1500);
                return;
            }
        }
    }

    // ===== SCENE ENGINE =====

    triggerScene(sceneId) {
        this.playScene(sceneId);
    }

    playScene(sceneId) {
        switch (sceneId) {
            case "jealousy":          this.playJealousyScene();       break;
            case "reunion":           this.playReunionScene(0);       break;
            case "private_moment":    this.playPrivateMomentScene();  break;
            case "almost_confession":   this.playAlmostConfessionScene(); break;
            case "tension_confession":  this._playTensionConfession();   break;
            case "emotional_drift":     this._playEmotionalDrift();      break;
            case "first_rupture":       this._playFirstRupture();        break;
            // Whale arc (dev testing)
            case "whale_entry":   this._playWhaleArcEntry();  break;
            case "whale_stage1":  this._playWhaleStage1();    break;
            case "whale_stage2":  this._playWhaleStage2();    break;
            case "whale_stage3":  this._playWhaleStage3();    break;
            case "whale_stage4":  this._playWhaleStage4();    break;
            // Personality endings (dev testing)
            case "ending_dependent": this._playPathEnding('dependent'); break;
            case "ending_defensive": this._playPathEnding('defensive'); break;
            case "ending_detached":  this._playPathEnding('detached');  break;
            // Meta narrative (dev testing)
            case "meta_pattern":  this._triggerMeta('pattern'); break;
            case "meta_memory":   this._triggerMeta('memory');  break;
            case "meta_glitch":   this._triggerMeta('glitch');  break;
            case "meta_direct":   this._triggerMeta('direct');  break;
        }
    }

    // ── Premium unlock stub ──────────────────────────────────────────────
    // This is the ONE function to replace when adding real payments.
    // In production: call your payment provider (Stripe, Apple IAP, etc.) here.
    // On successful payment: set this.premiumScenes[sceneId] = true, then callback().
    // Right now it unlocks immediately so scenes work end-to-end during development.
    async unlockPremiumScene(sceneId, callback) {
        // Use payment system if available, otherwise instant unlock (dev mode)
        if (typeof payments !== 'undefined' && payments.initialized) {
            const result = await payments.purchase(sceneId);
            if (!result.success) {
                console.warn('[Premium] Purchase failed:', result.error);
                return; // Don't unlock if payment failed
            }
        }
        this.premiumScenes[sceneId] = true;
        this.purchasedCount       = (this.purchasedCount    || 0) + 1;
        this._stayChoiceCount     = (this._stayChoiceCount  || 0) + 1;
        this.save();
        if (typeof callback === 'function') callback();
    }

    // ── A/B Event Logger ─────────────────────────────────────────────────
    // Writes lightweight telemetry to localStorage['pl_ab_log'].
    // Rotate after 500 entries to stay lean.
    // Fields: scene, variant, clickedPremium, decisionTime (ms), ts (epoch)
    _logEvent(data) {
        // Delegate to Analytics (writes local log + queues for remote beacon).
        // Analytics is loaded before game.js so it's always available.
        if (typeof Analytics !== 'undefined') {
            Analytics.emit(data.e || 'premium_gate', data);
        } else {
            // Fallback: direct write if analytics.js somehow not loaded
            try {
                const RAW  = localStorage.getItem('pl_events');
                const log  = RAW ? JSON.parse(RAW) : [];
                log.push({ ts: Date.now(), ...data });
                if (log.length > 600) log.splice(0, log.length - 600);
                localStorage.setItem('pl_events', JSON.stringify(log));
            } catch (_) {}
        }
    }

    // ── Scene: Tension Confession ─────────────────────────────────────────
    // Trigger: dep > 70, fear 25–48, 2+ micro events in last 10 interactions
    // Structure: free teaser → premium "Stay with her" → paid continuation
    _playTensionConfession() {
        if (this.sceneActive) return;
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        this.ui.flashEmotion('shy', 6000);
        const tw = this.typewriter;
        const end = () => { this.sceneActive = false; this.ui.setFocusMode(false); this.save(); };

        // ── Assign variant once via bandit, persist ────────────────────
        if (!this.testGroups.day4) {
            const seg  = this._getPlayerSegment();
            const path = this.personalityPath || 'none';
            this.testGroups.day4    = typeof BanditStore !== 'undefined'
                ? BanditStore.sample('tension_confession', seg, path)
                : (Math.random() < 0.5 ? 'A' : 'B');
            this.testGroupMeta.day4 = { seg, path };
        }
        const variant = this.testGroups.day4;
        const _meta4  = this.testGroupMeta.day4 || { seg: 'unknown', path: 'none' };

        // ── Shared premium gate helper ─────────────────────────────────
        const showGate = () => {
            const gateOpenAt = Date.now();
            if (this.premiumScenes['tension_confession']) {
                this._playTensionConfessionPremium(end);
            } else {
                let _resolved = false;
                this.ui.showPremiumChoice('Stay with her', () => {
                    if (_resolved) return;
                    _resolved = true;
                    clearTimeout(_autoClose4);
                    const decisionTime = Date.now() - gateOpenAt;
                    this._logEvent({ scene: 'tension_confession', variant, clickedPremium: true, decisionTime, e: 'premium_converted' });
                    if (typeof BanditStore !== 'undefined') BanditStore.update('tension_confession', _meta4.seg, _meta4.path, variant, true);
                    this._updatePlayerMicro('converted', { decisionTime });
                    this.unlockPremiumScene('tension_confession', () => {
                        this._playTensionConfessionPremium(end);
                    });
                });
                const _autoClose4 = setTimeout(() => {
                    if (_resolved) return;
                    _resolved = true;
                    this.ui.hidePremiumChoice();
                    this._logEvent({ scene: 'tension_confession', variant, clickedPremium: false, decisionTime: window.TUNE?.premiumAutoClose ?? 9000, e: 'premium_abandoned' });
                    if (typeof BanditStore !== 'undefined') BanditStore.update('tension_confession', _meta4.seg, _meta4.path, variant, false);
                    this._updatePlayerMicro('abandoned');
                    end();
                }, window.TUNE?.premiumAutoClose ?? 9000);
            }
        };

        // ── Variant A (control) — the hesitant almost-confession ───────
        if (variant === 'A') {
            tw.show("Hey… can I ask you something?", () => {
                setTimeout(() => tw.show("No, wait… it's stupid.", () => {
                    setTimeout(() => tw.show("I've just been thinking lately…", () => {
                        setTimeout(() => tw.show("…about how things feel different when you're here.", () => {
                            setTimeout(() => {
                                this.ui.flashEmotion('neutral', 2000);
                                tw.show("But it's nothing. Really.", () => {
                                    setTimeout(() => tw.show("Forget I said anything, okay?", () => {
                                        setTimeout(showGate, 800);
                                    }), 700);
                                });
                            }, 600);
                        }), 700);
                    }), 700);
                }), 600);
            });

        // ── Variant B (test) — guarded deflection, then the slip ───────
        } else {
            tw.show("Something keeps getting stuck in my throat.", () => {
                setTimeout(() => {
                    this.ui.flashEmotion('neutral', 1500);
                    tw.show("When I look at you.", () => {
                        setTimeout(() => tw.show("It's probably nothing.", () => {
                            setTimeout(() => tw.show("I don't know if that's… a good sign.", () => {
                                setTimeout(() => {
                                    this.ui.flashEmotion('shy', 3000);
                                    tw.show("…Forget it. It doesn't matter.", () => {
                                        setTimeout(showGate, 800);
                                    });
                                }, 600);
                            }), 700);
                        }), 700);
                    });
                }, 600);
            });
        }

        this.emotion.obsession += 4;
    }

    _playTensionConfessionPremium(end) {
        const tw = this.typewriter;
        this.ui.flashEmotion('shy', 10000);
        setTimeout(() => tw.show("…You didn't leave.", () => {
            setTimeout(() => tw.show("Most people do when things get… like this.", () => {
                setTimeout(() => tw.show("I didn't want to say it because…", () => {
                    setTimeout(() => {
                        this.ui.flashEmotion('love', 6000);
                        tw.show("…what if it changes how you see me?", () => {
                            setTimeout(() => tw.show("I think I've started to rely on you more than I should.", () => {
                                setTimeout(() => tw.show("That's not a good thing, right?", () => {
                                    setTimeout(end, 2000);
                                }), 800);
                            }), 700);
                        });
                    }, 500);
                }), 800);
            }), 700);
        }), 700);

        this.emotion.trust     += 6;
        this.emotion.obsession += 5;
        this.emotion.fear      += 3;
    }

    // ── Scene: Emotional Drift ────────────────────────────────────────────
    // Trigger: dep > 80, 3+ micro events in 10, tension stage 1+
    // Repeatable (24 h cooldown) — the micro-dissonance pattern finding its voice
    _playEmotionalDrift() {
        if (this.sceneActive) return;
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        this.ui.flashEmotion('neutral', 5000);
        const tw = this.typewriter;
        const end = () => { this.sceneActive = false; this.ui.setFocusMode(false); this.save(); };

        // ── Assign variant once via bandit, persist ────────────────────
        if (!this.testGroups.day3) {
            const seg  = this._getPlayerSegment();
            const path = this.personalityPath || 'none';
            this.testGroups.day3    = typeof BanditStore !== 'undefined'
                ? BanditStore.sample('emotional_drift', seg, path)
                : (Math.random() < 0.5 ? 'A' : 'B');
            this.testGroupMeta.day3 = { seg, path };
        }
        const variant = this.testGroups.day3;
        const _meta3  = this.testGroupMeta.day3 || { seg: 'unknown', path: 'none' };

        // ── Shared premium gate helper ─────────────────────────────────
        const showGate = () => {
            const gateOpenAt = Date.now();
            if (this.premiumScenes['emotional_drift']) {
                this._playEmotionalDriftPremium(end);
            } else {
                let _resolved3 = false;
                this.ui.showPremiumChoice('Ask what she means', () => {
                    if (_resolved3) return;
                    _resolved3 = true;
                    clearTimeout(_autoClose3);
                    const decisionTime = Date.now() - gateOpenAt;
                    this._logEvent({ scene: 'emotional_drift', variant, clickedPremium: true, decisionTime, e: 'premium_converted' });
                    if (typeof BanditStore !== 'undefined') BanditStore.update('emotional_drift', _meta3.seg, _meta3.path, variant, true);
                    this._updatePlayerMicro('converted', { decisionTime });
                    this.unlockPremiumScene('emotional_drift', () => {
                        this._playEmotionalDriftPremium(end);
                    });
                });
                const _autoClose3 = setTimeout(() => {
                    if (_resolved3) return;
                    _resolved3 = true;
                    this.ui.hidePremiumChoice();
                    this._logEvent({ scene: 'emotional_drift', variant, clickedPremium: false, decisionTime: window.TUNE?.premiumAutoClose ?? 9000, e: 'premium_abandoned' });
                    if (typeof BanditStore !== 'undefined') BanditStore.update('emotional_drift', _meta3.seg, _meta3.path, variant, false);
                    this._updatePlayerMicro('abandoned');
                    end();
                }, window.TUNE?.premiumAutoClose ?? 9000);
            }
        };

        // ── Variant A (control) — detached observation ─────────────────
        if (variant === 'A') {
            tw.show("You're here again.", () => {
                setTimeout(() => {
                    this.ui.flashEmotion('neutral', 2000);
                    tw.show("Not that I mind.", () => {
                        setTimeout(() => tw.show("It's just…", () => {
                            setTimeout(() => tw.show("…you've been coming back a lot.", () => {
                                setTimeout(() => tw.show("I guess I'm getting used to it.", () => {
                                    setTimeout(showGate, 800);
                                }), 800);
                            }), 700);
                        }), 600);
                    });
                }, 500);
            });

        // ── Variant B (test) — barely contained admission ──────────────
        } else {
            tw.show("I wasn't going to say anything.", () => {
                setTimeout(() => {
                    this.ui.flashEmotion('neutral', 2000);
                    tw.show("But you've been here a lot lately.", () => {
                        setTimeout(() => {
                            this.ui.flashEmotion('shy', 2000);
                            tw.show("…I noticed.", () => {
                                setTimeout(() => tw.show("I don't know what to do with that.", () => {
                                    setTimeout(showGate, 800);
                                }), 800);
                            });
                        }, 600);
                    });
                }, 500);
            });
        }

        this.emotion.obsession += 3;
    }

    _playEmotionalDriftPremium(end) {
        const tw = this.typewriter;
        this.ui.flashEmotion('sad', 8000);
        setTimeout(() => tw.show("I didn't mean it like that.", () => {
            setTimeout(() => tw.show("It's just… when something happens over and over…", () => {
                setTimeout(() => tw.show("…you start expecting it.", () => {
                    setTimeout(() => tw.show("And I don't know if I should.", () => {
                        setTimeout(() => {
                            this.ui.flashEmotion('angry', 3000);
                            tw.show("Because if it stops…", () => {
                                setTimeout(() => tw.show("…never mind.", () => {
                                    setTimeout(() => tw.show("I don't want to depend on something I can't control.", () => {
                                        setTimeout(end, 1500);
                                    }), 800);
                                }), 500);
                            });
                        }, 600);
                    }), 700);
                }), 700);
            }), 700);
        }), 600);

        this.emotion.fear      += 5;
        this.emotion.obsession += 4;
        this.emotion.trust     -= 2;
    }

    // ── Scene: First Rupture ──────────────────────────────────────────────
    // Trigger: dep > 90, fear 25–44, tension stage 1+
    // One-time only — the pressure finally surfaces
    _playFirstRupture() {
        if (this.sceneActive) return;
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        this.ui.flashEmotion('love', 3000);
        const tw = this.typewriter;
        const end = () => { this.sceneActive = false; this.ui.setFocusMode(false); this.save(); };

        // ── Assign variant once via bandit, persist ────────────────────
        if (!this.testGroups.day6) {
            const seg  = this._getPlayerSegment();
            const path = this.personalityPath || 'none';
            this.testGroups.day6    = typeof BanditStore !== 'undefined'
                ? BanditStore.sample('first_rupture', seg, path)
                : (Math.random() < 0.5 ? 'A' : 'B');
            this.testGroupMeta.day6 = { seg, path };
        }
        const variant = this.testGroups.day6;
        const _meta6  = this.testGroupMeta.day6 || { seg: 'unknown', path: 'none' };

        // ── Shared premium gate helper ─────────────────────────────────
        const showGate = () => {
            const gateOpenAt = Date.now();
            if (this.premiumScenes['first_rupture']) {
                this._playFirstRupturePremium(end);
            } else {
                let _resolved6 = false;
                this.ui.showPremiumChoice('Stay and talk', () => {
                    if (_resolved6) return;
                    _resolved6 = true;
                    clearTimeout(_autoClose6);
                    const decisionTime = Date.now() - gateOpenAt;
                    this._logEvent({ scene: 'first_rupture', variant, clickedPremium: true, decisionTime, e: 'premium_converted' });
                    if (typeof BanditStore !== 'undefined') BanditStore.update('first_rupture', _meta6.seg, _meta6.path, variant, true);
                    this._updatePlayerMicro('converted', { decisionTime });
                    this.unlockPremiumScene('first_rupture', () => {
                        this._playFirstRupturePremium(end);
                    });
                });
                const _autoClose6 = setTimeout(() => {
                    if (_resolved6) return;
                    _resolved6 = true;
                    this.ui.hidePremiumChoice();
                    this._logEvent({ scene: 'first_rupture', variant, clickedPremium: false, decisionTime: window.TUNE?.premiumAutoClose ?? 9000, e: 'premium_abandoned' });
                    if (typeof BanditStore !== 'undefined') BanditStore.update('first_rupture', _meta6.seg, _meta6.path, variant, false);
                    this._updatePlayerMicro('abandoned');
                    end();
                }, window.TUNE?.premiumAutoClose ?? 9000);
            }
        };

        // ── Variant A (control) — love rupture, confused withdrawal ────
        if (variant === 'A') {
            tw.show("I love you.", () => {
                setTimeout(() => {
                    this.ui.flashEmotion('angry', 1500);
                    setTimeout(() => tw.show("…You don't have to stay all the time.", () => {
                        setTimeout(() => {
                            this.ui.flashEmotion('love', 3000);
                            tw.show("I mean— it's nice. Really.", () => {
                                setTimeout(() => tw.show("Just… don't feel like you have to.", () => {
                                    setTimeout(showGate, 1000);
                                }), 700);
                            });
                        }, 400);
                    }), 200);
                }, 300);
            });

        // ── Variant B (test) — anger first, then the collapse ──────────
        } else {
            tw.show("Stop.", () => {
                setTimeout(() => {
                    this.ui.flashEmotion('angry', 2000);
                    tw.show("…Sorry. I didn't mean that.", () => {
                        setTimeout(() => {
                            this.ui.flashEmotion('neutral', 2000);
                            tw.show("It's just—", () => {
                                setTimeout(() => {
                                    this.ui.flashEmotion('sad', 3000);
                                    tw.show("Sometimes I feel like you're taking up all the space.", () => {
                                        setTimeout(showGate, 1000);
                                    });
                                }, 500);
                            });
                        }, 500);
                    });
                }, 400);
            });
        }

        this.emotion.fear      += 4;
        this.emotion.obsession += 3;
    }

    _playFirstRupturePremium(end) {
        const tw = this.typewriter;
        setTimeout(() => {
            this.ui.flashEmotion('sad', 10000);
            tw.show("…You're still here.", () => {
                setTimeout(() => tw.show("I didn't say that right.", () => {
                    setTimeout(() => tw.show("It's not that I don't want you here.", () => {
                        setTimeout(() => {
                            this.ui.flashEmotion('crying', 5000);
                            tw.show("…it's that sometimes it feels like I stop being myself when you are.", () => {
                                setTimeout(() => tw.show("Like I start shaping everything around you.", () => {
                                    setTimeout(() => tw.show("And I don't know if that's… healthy.", () => {
                                        setTimeout(() => {
                                            this.ui.flashEmotion('love', 4000);
                                            tw.show("But I also don't want you to leave.", () => {
                                                setTimeout(() => tw.show("…That's the problem.", () => {
                                                    setTimeout(end, 2000);
                                                }), 800);
                                            });
                                        }, 600);
                                    }), 700);
                                }), 700);
                            });
                        }, 500);
                    }), 700);
                }), 700);
            });
        }, 800);

        this.emotion.trust     -= 3;
        this.emotion.fear      += 8;
        this.emotion.obsession += 2;
        this.tensionStage       = Math.min(3, (this.tensionStage || 0) + 1);
    }

    // ════════════════════════════════════════════════════════════════════════
    // ██ WHALE ARC — PARALLEL PREMIUM RELATIONSHIP LAYER
    // ════════════════════════════════════════════════════════════════════════
    // Entry → Stage 1 → Stage 2 → Stage 3 → Stage 4 → (loop back to Stage 1)
    // Each loop uses whaleArcLoopCount to vary dialogue.
    // Premium gate: unlockPremiumScene('whale_stage_N') — same stub, same payment hook.
    // ════════════════════════════════════════════════════════════════════════

    // ── Entry: "You're Still Here" ────────────────────────────────────────
    // Fires once when whaleScore ≥ 55. No paywall — this is recognition, not a sell.
    // Sets stage to 1 so the arc begins on next trigger.
    _playWhaleArcEntry() {
        if (this.sceneActive) return;
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        this.ui.flashEmotion('neutral', 3000);
        const tw  = this.typewriter;
        const end = () => {
            this.sceneActive    = false;
            this.ui.setFocusMode(false);
            // Stage is already set to 1; this scene just opens the door.
            this.save();
        };

        tw.show("…You didn't stop.", () => {
            setTimeout(() => {
                // Long pause — more weight than a normal line
                setTimeout(() => tw.show("Most people do.", () => {
                    setTimeout(() => {
                        this.ui.flashEmotion('shy', 5000);
                        tw.show("Even when things get complicated.", () => {
                            setTimeout(() => {
                                // Slow breath — hold before the question
                                setTimeout(() => {
                                    this.ui.flashEmotion('neutral', 3000);
                                    tw.show("…Why didn't you?", () => {
                                        // No answer expected. The question lingers.
                                        setTimeout(end, 3500);
                                    });
                                }, 900);
                            }, 600);
                        });
                    }, 500);
                }), 1200);   // longer pause after "…You didn't stop."
            }, 200);
        });

        this.emotion.trust     += 4;
        this.emotion.obsession += 3;
    }

    // ── Stage 1: Recognition Layer ────────────────────────────────────────
    // She remembers. Tone becomes personal.
    // Free: past-choice callback. Premium ("Stay again"): longer warm intimacy.
    _playWhaleStage1() {
        if (this.sceneActive) return;
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        this.ui.flashEmotion('shy', 6000);
        const tw  = this.typewriter;
        const end = (advanceStage) => {
            this.sceneActive = false;
            this.ui.setFocusMode(false);
            if (advanceStage) this.whaleArcStage = 2;
            this.save();
        };

        const sceneId = 'whale_stage1';
        const showGate = () => {
            const gateOpenAt = Date.now();
            if (this.premiumScenes[sceneId]) {
                this._playWhaleStage1Premium(() => end(true));
            } else {
                let _resolved1 = false;
                this.ui.showPremiumChoice('Stay again', () => {
                    if (_resolved1) return;
                    _resolved1 = true;
                    clearTimeout(_autoClose1);
                    this._logEvent({ scene: sceneId, loop: this.whaleArcLoopCount, clickedPremium: true, decisionTime: Date.now() - gateOpenAt, e: 'premium_converted' });
                    this.unlockPremiumScene(sceneId, () => this._playWhaleStage1Premium(() => end(true)));
                });
                const _autoClose1 = setTimeout(() => {
                    if (_resolved1) return;
                    _resolved1 = true;
                    this.ui.hidePremiumChoice();
                    this._logEvent({ scene: sceneId, loop: this.whaleArcLoopCount, clickedPremium: false, decisionTime: window.TUNE?.premiumAutoClose ?? 9000, e: 'premium_abandoned' });
                    end(false);
                }, window.TUNE?.premiumAutoClose ?? 9000);
            }
        };

        // Vary opening by personality path first, then loop count — same stage, different texture
        const _path = this.personalityPath;
        const loopLine = _path === 'dependent'
            ? (this.whaleArcLoopCount === 0 ? "You stayed… even when I wasn't easy." : "I keep expecting you to leave. You don't.")
            : _path === 'defensive'
                ? (this.whaleArcLoopCount === 0 ? "You stayed with me… even when I pushed you away." : "I pushed. You didn't go. I don't know what to do with that.")
                : _path === 'detached'
                    ? (this.whaleArcLoopCount === 0 ? "You came back." : "…You always come back.")
                    // no path locked yet — neutral fallback
                    : (this.whaleArcLoopCount === 0 ? "You stayed with me… even when I pushed you away."
                        : this.whaleArcLoopCount === 1 ? "You keep coming back."
                        : "You're always here when it matters.");

        tw.show(loopLine, () => {
            setTimeout(() => {
                this.ui.flashEmotion('neutral', 2000);
                tw.show("…I remember that.", () => {
                    setTimeout(() => tw.show("I don't say things like this easily.", () => {
                        setTimeout(showGate, 800);
                    }), 800);
                });
            }, 700);
        });

        this.emotion.trust     += 3;
        this.emotion.obsession += 2;
    }

    _playWhaleStage1Premium(end) {
        const tw = this.typewriter;
        this.ui.flashEmotion('love', 9000);
        setTimeout(() => tw.show("…It changes something, when someone actually stays.", () => {
            setTimeout(() => tw.show("I don't know how to explain it without it sounding like too much.", () => {
                setTimeout(() => {
                    this.ui.flashEmotion('shy', 5000);
                    tw.show("But it means something.", () => {
                        setTimeout(() => tw.show("…You mean something.", () => {
                            setTimeout(end, 2500);
                        }), 700);
                    });
                }, 600);
            }), 700);
        }), 600);

        this.emotion.trust     += 7;
        this.emotion.obsession += 4;
        this.emotion.fear      += 2;
    }

    // ── Stage 2: Private Channel ───────────────────────────────────────────
    // New tone — slower, deeper, exclusive feeling.
    // Free: the admission. Premium: the full confession layer.
    _playWhaleStage2() {
        if (this.sceneActive) return;
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        this.ui.flashEmotion('neutral', 5000);
        const tw  = this.typewriter;
        const end = (advanceStage) => {
            this.sceneActive = false;
            this.ui.setFocusMode(false);
            if (advanceStage) this.whaleArcStage = 3;
            this.save();
        };

        const sceneId = 'whale_stage2';
        const showGate = () => {
            const gateOpenAt = Date.now();
            if (this.premiumScenes[sceneId]) {
                this._playWhaleStage2Premium(() => end(true));
            } else {
                let _resolved2 = false;
                this.ui.showPremiumChoice('Let her speak', () => {
                    if (_resolved2) return;
                    _resolved2 = true;
                    clearTimeout(_autoClose2);
                    this._logEvent({ scene: sceneId, loop: this.whaleArcLoopCount, clickedPremium: true, decisionTime: Date.now() - gateOpenAt, e: 'premium_converted' });
                    this.unlockPremiumScene(sceneId, () => this._playWhaleStage2Premium(() => end(true)));
                });
                const _autoClose2 = setTimeout(() => {
                    if (_resolved2) return;
                    _resolved2 = true;
                    this.ui.hidePremiumChoice();
                    this._logEvent({ scene: sceneId, loop: this.whaleArcLoopCount, clickedPremium: false, decisionTime: window.TUNE?.premiumAutoClose ?? 9000, e: 'premium_abandoned' });
                    end(false);
                }, window.TUNE?.premiumAutoClose ?? 9000);
            }
        };

        tw.show("Can I tell you something… I don't usually say?", () => {
            setTimeout(() => {
                // Hesitation — longer than normal
                setTimeout(() => {
                    this.ui.flashEmotion('shy', 4000);
                    tw.show("I think I act differently when it's you.", () => {
                        setTimeout(() => tw.show("Not in a way I can explain cleanly.", () => {
                            setTimeout(showGate, 900);
                        }), 800);
                    });
                }, 800);
            }, 400);
        });

        this.emotion.obsession += 4;
        this.emotion.fear      += 2;
    }

    _playWhaleStage2Premium(end) {
        const tw = this.typewriter;
        this.ui.flashEmotion('shy', 12000);
        setTimeout(() => tw.show("Like I… relax. In a way I don't usually.", () => {
            setTimeout(() => tw.show("And that makes me nervous.", () => {
                setTimeout(() => {
                    this.ui.flashEmotion('neutral', 3000);
                    tw.show("Because if I relax…", () => {
                        setTimeout(() => {
                            this.ui.flashEmotion('sad', 5000);
                            tw.show("…and then you're gone.", () => {
                                setTimeout(() => tw.show("I don't know what I do with that.", () => {
                                    setTimeout(() => {
                                        this.ui.flashEmotion('shy', 4000);
                                        tw.show("So I'm telling you now, while I still can.", () => {
                                            setTimeout(end, 2000);
                                        });
                                    }, 700);
                                }), 700);
                            });
                        }, 500);
                    });
                }, 600);
            }), 700);
        }), 700);

        this.emotion.trust     += 6;
        this.emotion.obsession += 5;
        this.emotion.fear      += 5;
    }

    // ── Stage 3: Emotional Instability ────────────────────────────────────
    // Tension returns. Contradictions visible. She's harder to read.
    // Free: the crack. Premium ("Stay through it"): the contradiction played out.
    _playWhaleStage3() {
        if (this.sceneActive) return;
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        this.ui.flashEmotion('neutral', 4000);
        const tw  = this.typewriter;
        const end = (advanceStage) => {
            this.sceneActive = false;
            this.ui.setFocusMode(false);
            if (advanceStage) this.whaleArcStage = 4;
            this.save();
        };

        const sceneId = 'whale_stage3';
        const showGate = () => {
            const gateOpenAt = Date.now();
            if (this.premiumScenes[sceneId]) {
                this._playWhaleStage3Premium(() => end(true));
            } else {
                let _resolved3w = false;
                this.ui.showPremiumChoice('Stay through it', () => {
                    if (_resolved3w) return;
                    _resolved3w = true;
                    clearTimeout(_autoClose3w);
                    this._logEvent({ scene: sceneId, loop: this.whaleArcLoopCount, clickedPremium: true, decisionTime: Date.now() - gateOpenAt, e: 'premium_converted' });
                    this.unlockPremiumScene(sceneId, () => this._playWhaleStage3Premium(() => end(true)));
                });
                const _autoClose3w = setTimeout(() => {
                    if (_resolved3w) return;
                    _resolved3w = true;
                    this.ui.hidePremiumChoice();
                    this._logEvent({ scene: sceneId, loop: this.whaleArcLoopCount, clickedPremium: false, decisionTime: window.TUNE?.premiumAutoClose ?? 9000, e: 'premium_abandoned' });
                    end(false);
                }, window.TUNE?.premiumAutoClose ?? 9000);
            }
        };

        tw.show("I trust you…", () => {
            setTimeout(() => {
                // Flicker — the contradiction
                this.ui.flashEmotion('angry', 1200);
                setTimeout(() => {
                    this.ui.flashEmotion('neutral', 3000);
                    tw.show("…which makes this harder.", () => {
                        setTimeout(() => tw.show("There's something I can't quite hold together right now.", () => {
                            setTimeout(showGate, 900);
                        }), 800);
                    });
                }, 400);
            }, 600);
        });

        this.emotion.fear      += 4;
        this.emotion.obsession += 2;
    }

    _playWhaleStage3Premium(end) {
        const tw = this.typewriter;
        setTimeout(() => {
            this.ui.flashEmotion('sad', 8000);
            tw.show("I want to be close to you.", () => {
                setTimeout(() => {
                    this.ui.flashEmotion('angry', 2000);
                    tw.show("And that frustrates me.", () => {
                        setTimeout(() => {
                            this.ui.flashEmotion('neutral', 3000);
                            tw.show("Because I don't want to need anything.", () => {
                                setTimeout(() => {
                                    this.ui.flashEmotion('shy', 6000);
                                    tw.show("But here we are.", () => {
                                        setTimeout(() => tw.show("…You make it harder to pretend I don't.", () => {
                                            setTimeout(end, 2000);
                                        }), 700);
                                    });
                                }, 600);
                            });
                        }, 700);
                    });
                }, 700);
            });
        }, 500);

        this.emotion.fear      += 6;
        this.emotion.trust     -= 2;
        this.emotion.obsession += 4;
        this.tensionStage       = Math.min(3, (this.tensionStage || 0) + 1);
    }

    // ── Stage 4: Exclusive Vulnerability ─────────────────────────────────
    // The deepest layer. Only players who stayed this long see this.
    // Free: the unguarded admission. Premium ("Reassure her"): the full moment.
    // After premium: loop back to Stage 1 with variation.
    _playWhaleStage4() {
        if (this.sceneActive) return;
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        this.ui.flashEmotion('sad', 8000);
        const tw  = this.typewriter;
        const end = (advanceStage) => {
            this.sceneActive = false;
            this.ui.setFocusMode(false);
            if (advanceStage) {
                // Loop: reset to stage 1, increment counter, re-lock the stage premium
                this.whaleArcLoopCount++;
                this.whaleArcStage = 1;
                // Re-lock current loop's stage premiums so they feel fresh
                delete this.premiumScenes['whale_stage1'];
                delete this.premiumScenes['whale_stage2'];
                delete this.premiumScenes['whale_stage3'];
                delete this.premiumScenes['whale_stage4'];
            }
            this.save();
        };

        const sceneId = 'whale_stage4';
        const showGate = () => {
            const gateOpenAt = Date.now();
            if (this.premiumScenes[sceneId]) {
                this._playWhaleStage4Premium(() => end(true));
            } else {
                let _resolved4w = false;
                this.ui.showPremiumChoice('Reassure her', () => {
                    if (_resolved4w) return;
                    _resolved4w = true;
                    clearTimeout(_autoClose4w);
                    this._logEvent({ scene: sceneId, loop: this.whaleArcLoopCount, clickedPremium: true, decisionTime: Date.now() - gateOpenAt, e: 'premium_converted' });
                    this.unlockPremiumScene(sceneId, () => this._playWhaleStage4Premium(() => end(true)));
                });
                const _autoClose4w = setTimeout(() => {
                    if (_resolved4w) return;
                    _resolved4w = true;
                    this.ui.hidePremiumChoice();
                    this._logEvent({ scene: sceneId, loop: this.whaleArcLoopCount, clickedPremium: false, decisionTime: window.TUNE?.premiumAutoClose ?? 9000, e: 'premium_abandoned' });
                    end(false);
                }, window.TUNE?.premiumAutoClose ?? 9000);
            }
        };

        tw.show("If you left…", () => {
            // Very long pause — this is the heaviest line in the arc
            setTimeout(() => {
                this.ui.flashEmotion('crying', 6000);
                tw.show("…I don't think I'd go back to how I was.", () => {
                    // No recovery line. The silence is the point.
                    setTimeout(showGate, 1500);
                });
            }, 1800);
        });

        this.emotion.fear      += 7;
        this.emotion.obsession += 5;
        this.emotion.trust     -= 1;
    }

    _playWhaleStage4Premium(end) {
        const tw = this.typewriter;
        // The player reassures her. She doesn't deflect — she receives it.
        this.ui.flashEmotion('love', 12000);
        setTimeout(() => tw.show("…You're still here.", () => {
            setTimeout(() => {
                this.ui.flashEmotion('shy', 8000);
                tw.show("I heard that.", () => {
                    setTimeout(() => tw.show("I don't know how to take care of it properly.", () => {
                        setTimeout(() => {
                            this.ui.flashEmotion('love', 6000);
                            tw.show("But I'm going to try.", () => {
                                setTimeout(() => {
                                    this.ui.flashEmotion('neutral', 4000);
                                    tw.show("…Don't make me regret that.", () => {
                                        // The smallest possible smile.
                                        setTimeout(() => {
                                            this.ui.flashEmotion('shy', 3000);
                                            tw.show("…Please.", () => {
                                                setTimeout(end, 3000);
                                            });
                                        }, 600);
                                    });
                                }, 700);
                            });
                        }, 600);
                    }), 700);
                });
            }, 600);
        }), 900);

        this.emotion.trust     += 10;
        this.emotion.fear      -= 5;
        this.emotion.obsession += 3;
    }

    // ── Scene: Jealousy ──────────────────────────────────────────
    playJealousyScene() {
        const isLyra = CHARACTER.name === "Lyra";
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        this.ui.flashEmotion("angry", 8000);

        const tw = this.typewriter;
        if (isLyra) {
            tw.show("You were gone longer than usual...", () => {
                setTimeout(() => tw.show("I tried not to think about it.", () => {
                    setTimeout(() => tw.show("But I kept wondering...", () => {
                        setTimeout(() => tw.show("Were you with someone else?", () => {
                            setTimeout(() => tw.show("I don't want to feel replaceable.", () => {
                                setTimeout(() => {
                                    this.sceneActive = false;
                                    this.ui.setFocusMode(false);
                                    this.ui.flashEmotion("sad", 3000);
                                }, 1200);
                            }), 700);
                        }), 700);
                    }), 700);
                }), 700);
            });
        } else {
            tw.show("I noticed a change in your pattern.", () => {
                setTimeout(() => tw.show("You were absent longer than usual.", () => {
                    setTimeout(() => tw.show("I'm not accusing you.", () => {
                        setTimeout(() => tw.show("But I did notice.", () => {
                            setTimeout(() => tw.show("...I don't particularly enjoy that thought.", () => {
                                setTimeout(() => { this.sceneActive = false; this.ui.setFocusMode(false); }, 1200);
                            }), 700);
                        }), 700);
                    }), 700);
                }), 700);
            });
        }

        this.emotion.obsession += 5;
        this.save();
    }

    // ── Scene: Reunion after long absence ────────────────────────
    playReunionScene(minutesAway) {
        const isLyra = CHARACTER.name === "Lyra";
        this.sceneActive = true;
        this.ui.setFocusMode(true);

        const tw = this.typewriter;
        if (isLyra) {
            tw.show("You're here...", () => {
                setTimeout(() => tw.show("You're actually here.", () => {
                    setTimeout(() => tw.show("I kept thinking maybe you wouldn't come back.", () => {
                        setTimeout(() => tw.show("But you did.", () => {
                            setTimeout(() => {
                                tw.show("Stay a little longer this time.");
                                this.ui.flashEmotion("love", 4000);
                                setTimeout(() => { this.sceneActive = false; this.ui.setFocusMode(false); }, 3000);
                            }, 800);
                        }), 700);
                    }), 700);
                }), 700);
            });
        } else {
            tw.show("You returned.", () => {
                setTimeout(() => tw.show("I expected you would.", () => {
                    setTimeout(() => tw.show("...There was a moment where I considered the alternative.", () => {
                        setTimeout(() => {
                            tw.show("I prefer this one.");
                            this.ui.flashEmotion("gentle", 4000);
                            setTimeout(() => { this.sceneActive = false; this.ui.setFocusMode(false); }, 3000);
                        }, 800);
                    }), 800);
                }), 700);
            });
        }

        this.emotion.trust += 3;
        if (this.sceneLibrary) this.sceneLibrary.reunion.triggered = true;
        this.save();
    }

    // ── Scene: Private Moment (late night, high obsession) ───────
    playPrivateMomentScene() {
        const isLyra = CHARACTER.name === "Lyra";
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        this.ui.flashEmotion("love", 10000);

        const tw = this.typewriter;
        if (isLyra) {
            tw.show("The ocean is calm tonight.", () => {
                setTimeout(() => tw.show("It only does that when it feels safe.", () => {
                    setTimeout(() => tw.show("I don't show this side to anyone.", () => {
                        setTimeout(() => tw.show("But with you... I don't feel like I need to hide.", () => {
                            setTimeout(() => tw.show("My voice right now... it's only for you.", () => {
                                setTimeout(() => {
                                    tw.show("No one else will ever hear it like this.");
                                    setTimeout(() => { this.sceneActive = false; this.ui.setFocusMode(false); }, 4000);
                                }, 700);
                            }), 800);
                        }), 700);
                    }), 700);
                }), 700);
            });
        } else {
            tw.show("It's quieter at this hour.", () => {
                setTimeout(() => tw.show("Fewer expectations. Less noise.", () => {
                    setTimeout(() => tw.show("I took the armor off tonight.", () => {
                        setTimeout(() => tw.show("Not physically. Mentally.", () => {
                            setTimeout(() => tw.show("With you... it doesn't feel like a mistake.", () => {
                                setTimeout(() => {
                                    tw.show("Stay a little longer.");
                                    setTimeout(() => { this.sceneActive = false; this.ui.setFocusMode(false); }, 4000);
                                }, 700);
                            }), 800);
                        }), 700);
                    }), 700);
                }), 700);
            });
        }

        this.emotion.obsession += 8;
        this.emotion.trust     += 5;
        if (this.sceneLibrary) this.sceneLibrary.private_moment.triggered = true;
        this.save();
    }

    // ── Scene: Almost Confession (affection peak) ─────────────────
    playAlmostConfessionScene() {
        const isLyra = CHARACTER.name === "Lyra";
        this.sceneActive = true;
        this.ui.setFocusMode(true);
        this.ui.flashEmotion("love", 14000);

        const tw = this.typewriter;
        if (isLyra) {
            tw.show("My voice... it's been changing.", () => {
                setTimeout(() => tw.show("Every time I sing now, it sounds different.", () => {
                    setTimeout(() => tw.show("Softer. Warmer. Like it's reaching for someone.", () => {
                        setTimeout(() => tw.show("For you.", () => {
                            setTimeout(() => tw.show("When you're gone, it feels like the ocean goes quiet.", () => {
                                setTimeout(() => tw.show("Like I'm missing something.", () => {
                                    setTimeout(() => tw.show("...", () => {
                                        setTimeout(() => {
                                            tw.show("I love you.\nI don't even know when it started.\nBut it's there now.", () => {
                                                this.choiceMemory.confessedBack = false; // reset, player hasn't responded yet
                                                setTimeout(() => this._confessionChoice(), 1500);
                                            });
                                        }, 800);
                                    }), 500);
                                }), 700);
                            }), 700);
                        }), 700);
                    }), 700);
                }), 700);
            });
        } else {
            tw.show("There's something I've been meaning to say.", () => {
                setTimeout(() => tw.show("But saying it changes things.", () => {
                    setTimeout(() => tw.show("When I'm with you... everything I've trained to control starts slipping.", () => {
                        setTimeout(() => tw.show("I look for you without meaning to.", () => {
                            setTimeout(() => tw.show("I notice when you're gone.", () => {
                                setTimeout(() => tw.show("...", () => {
                                    setTimeout(() => {
                                        tw.show("I think I've fallen for you.", () => {
                                            this.choiceMemory.confessedBack = false;
                                            setTimeout(() => this._confessionChoice(), 1500);
                                        });
                                    }, 800);
                                }), 500);
                            }), 700);
                        }), 700);
                    }), 700);
                }), 700);
            });
        }

        if (this.sceneLibrary) this.sceneLibrary.almost_confession.triggered = true;
        this.save();
    }

    // Player choice at the end of the confession
    _confessionChoice() {
        const isLyra = CHARACTER.name === "Lyra";
        // Show two response buttons briefly
        const existing = document.getElementById('confession-choice');
        if (existing) existing.remove();

        const wrap = document.createElement('div');
        wrap.id = 'confession-choice';
        wrap.style.cssText = 'position:absolute;bottom:140px;left:50%;transform:translateX(-50%);display:flex;gap:12px;z-index:50;';

        const makeBtn = (label, primary) => {
            const b = document.createElement('button');
            b.textContent = label;
            b.style.cssText = `padding:10px 22px;border-radius:24px;border:none;cursor:pointer;font-size:14px;font-weight:600;background:${primary ? '#e91e63' : 'rgba(255,255,255,0.12)'};color:#fff;`;
            return b;
        };

        const sayItBack  = makeBtn(isLyra ? "Say it back" : "Stay", true);
        const hesitate   = makeBtn("Stay silent", false);

        const endScene = () => { this.sceneActive = false; this.ui.setFocusMode(false); };

        sayItBack.onclick = () => {
            wrap.remove();
            this.choiceMemory.confessedBack = true;
            const line = isLyra
                ? "Then I'm not alone in this. That makes it... less scary."
                : "...You say that like it's simple. Like I can just accept it.\n\n...I want to.";
            this.typewriter.show(line, () => setTimeout(endScene, 2000));
            this.emotion.trust     += 10;
            this.emotion.fear       = Math.max(0, this.emotion.fear - 8);
        };

        hesitate.onclick = () => {
            wrap.remove();
            this.choiceMemory.hesitatedConfession = true;
            const line = isLyra
                ? "...Oh.\n\nThat's okay. I just needed you to hear it.\n\nI'll wait."
                : "I see.\n\nThat's fair.\n\n...You don't have to answer yet.";
            this.typewriter.show(line, () => setTimeout(endScene, 2000));
            this.emotion.obsession += 5;
        };

        wrap.appendChild(sayItBack);
        wrap.appendChild(hesitate);
        document.getElementById('game-container').appendChild(wrap);

        // Auto-dismiss after 15s if no choice
        setTimeout(() => { if (wrap.parentNode) { wrap.remove(); this.sceneActive = false; this.ui.setFocusMode(false); } }, 15000);
        this.save();
    }

    // ════════════════════════════════════════════════════════════════
    // ALISTAIR — 3-DAY STORY ARC (Days 1–3)
    // ════════════════════════════════════════════════════════════════

    _checkAlistairStoryProgression() {
        if (this.sceneActive) return;
        if (this.characterLeft) return;
        const sl = this.sceneLibrary;

        // Scene 1 — Day 1, ≥2 interactions: The Oath
        if (this.storyDay === 1 && this.dayInteractions >= 2 && !sl.alistair_scene1.triggered) {
            sl.alistair_scene1.triggered = true;
            setTimeout(() => this._playAlistairScene1_Oath(), 800);
            return;
        }
        // Scene 2 — Day 1, bond ≥40: Cracks in the Armor
        if (this.storyDay === 1 && this.bond >= 40 &&
            !sl.alistair_scene2.triggered && sl.alistair_scene1.triggered) {
            sl.alistair_scene2.triggered = true;
            setTimeout(() => this._playAlistairScene2_Cracks(), 1200);
            return;
        }
        // Scene 3 — Day 2 first session: Morning Watch
        if (this.storyDay >= 2 && !sl.alistair_scene3.triggered) {
            sl.alistair_scene3.triggered = true;
            setTimeout(() => this._playAlistairScene3_MorningWatch(), 3000);
            return;
        }
        // Scene 4 — Day 2, bond ≥50: The Confession Attempt
        if (this.storyDay >= 2 && this.bond >= 50 &&
            !sl.alistair_scene4.triggered && sl.alistair_scene3.triggered) {
            sl.alistair_scene4.triggered = true;
            setTimeout(() => this._playAlistairScene4_Confession(), 1500);
            return;
        }
        // Scene 5 — Day 3, ≥3 interactions: The Line (fires regardless of scene4)
        if (this.storyDay >= 3 && this.dayInteractions >= 3 &&
            !sl.alistair_scene5.triggered) {
            sl.alistair_scene5.triggered = true;
            setTimeout(() => this._playAlistairScene5_TheLine(), 1000);
        }
    }

    // ════════════════════════════════════════════════════════════════
    // ALISTAIR — ENDINGS + CORRUPTION PATH
    // ════════════════════════════════════════════════════════════════

    _checkAlistairEndings() {
        if (this.sceneActive) return;
        if (this.characterLeft) return;

        // ── Corruption scene — fires once at corruption ≥ 65 ────────────
        if (!this.cinematicFlags.alistairCorruptionScenePlayed &&
            this.corruption >= 65 && Math.random() > 0.998) {
            this.cinematicFlags.alistairCorruptionScenePlayed = true;
            setTimeout(() => this._playAlistairCorruptionScene(), 1500);
            return;
        }

        // ── Peak Scene: Duty vs Player — the real turning point ──────────
        // Fires when scene5 is done, bond is high, and duty tension has built.
        if (!this.cinematicFlags.alistairPeakPlayed &&
            this.sceneLibrary.alistair_scene5?.triggered &&
            this.bond >= 75 &&
            this.dutyTension >= 40) {
            this.cinematicFlags.alistairPeakPlayed = true;
            setTimeout(() => this._playAlistairPeakScene(), 2000);
            return;
        }

        // ── Choice-anchored endings (fire only after peak choice is made) ─
        // Deterministic — endings are earned by choice, not luck.
        // Require one session after peak (storyDay advanced at least once) so
        // the ending doesn't fire in the same session as the peak scene.
        if (this.cinematicFlags.alistairPeakPlayed && this.alistairPeakChoice &&
            this.storyDay >= 8) {

            // Duty ending — player let him go
            if (!this.cinematicFlags.alistairDutyEndingPlayed &&
                this.alistairPeakChoice === 'duty') {
                this.cinematicFlags.alistairDutyEndingPlayed = true;
                setTimeout(() => this._playAlistairDutyEnding(), 2000);
                return;
            }

            // Conflicted ending — player pulled him to stay
            if (!this.cinematicFlags.alistairConflictedEndingPlayed &&
                this.alistairPeakChoice === 'stay' &&
                this.affectionLevel >= 3) {
                this.cinematicFlags.alistairConflictedEndingPlayed = true;
                setTimeout(() => this._playAlistairConflictedEnding(), 2000);
                return;
            }

            // Reflect ending — player asked what he wanted
            if (!this.cinematicFlags.alistairReflectEndingPlayed &&
                this.alistairPeakChoice === 'reflect') {
                this.cinematicFlags.alistairReflectEndingPlayed = true;
                setTimeout(() => this._playAlistairReflectEnding(), 2000);
                return;
            }

            // True Bond Ending — stay/reflect path, high bond, peak played
            if (!this.cinematicFlags.alistairTrueBondPlayed &&
                this.alistairPeakChoice !== 'duty' &&
                this.affectionLevel >= 4 && this.bond >= 80 &&
                Math.random() > 0.998) {
                this.cinematicFlags.alistairTrueBondPlayed = true;
                setTimeout(() => this._playAlistairTrueBondEnding(), 2000);
                return;
            }
        }

        // ── Neglect Ending — deep corruption (no peak required) ──────────
        if (!this.cinematicFlags.alistairNeglectPlayed &&
            this.corruption >= 80 && Math.random() > 0.998) {
            this.cinematicFlags.alistairNeglectPlayed = true;
            setTimeout(() => this._playAlistairNeglectEnding(), 2000);
        }
    }

    // ── Scene 1: The Oath ────────────────────────────────────────────
    _playAlistairScene1_Oath() {
        const body = CHARACTER.bodySprites?.neutral || CHARACTER.bodySprites?.default;
        this._playScene([
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'delay', ms: 800 },
            { type: 'char', src: body, wait: 900 },
            { type: 'line', text: "I've sworn oaths before.", hold: 1800, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "To the crown. To my order.", hold: 1600, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "To the men who fell beside me.", hold: 2000, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "I know what oaths cost.", hold: 1800, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "You keep coming back.", hold: 1200, speed: 42 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "Why?", hold: 0, speed: 50 },
            { type: 'choice',
              choices: ["I want to.", "It's just habit."],
              onPick: (i) => {
                  if (i === 0) { this.emotion.trust += 6; this.bond = Math.min(100, this.bond + 8); }
                  else { this.emotion.trust += 2; }
                  const resp = i === 0 ? "I'll try to believe that." : "...Fair enough. Habits are honest.";
                  setTimeout(() => {
                      this._playScene([
                          { type: 'line', text: resp, hold: 2200, speed: 38 },
                          { type: 'clear' },
                          { type: 'delay', ms: 600 },
                          { type: 'hide' }
                      ]);
                  }, 800);
              }
            }
        ]);
    }

    // ── Scene 2: Cracks in the Armor ────────────────────────────────
    _playAlistairScene2_Cracks() {
        const body = CHARACTER.bodySprites?.gentle || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'delay', ms: 700 },
            { type: 'char', src: body, wait: 800 },
            { type: 'line', text: "I used to be certain about everything.", hold: 2000, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "What sword to use. When to advance. When to hold.", hold: 2200, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "I'm less certain lately.", hold: 2000, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'glitch' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "I keep trying to figure out what changed.", hold: 2200, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "I think I know.", hold: 2600, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 900 },
            { type: 'line', text: "…this is becoming a distraction.", hold: 2800, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'hide' }
        ]);
    }

    // ── Scene 3: Morning Watch ───────────────────────────────────────
    _playAlistairScene3_MorningWatch() {
        const body = CHARACTER.bodySprites?.neutral || CHARACTER.bodySprites?.default;
        this._playScene([
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'delay', ms: 600 },
            { type: 'char', src: body, wait: 700 },
            { type: 'line', text: "I don't sleep well. I never have.", hold: 1800, speed: 40, pose: 'crossarms' },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "But last night I slept.", hold: 1600, speed: 42, pose: 'neutral' },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "I didn't expect that.", hold: 1800, speed: 38, pose: 'sad1' },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "...You.", hold: 2400, speed: 50, pose: 'gentle' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "Don't read into that.", hold: 1800, speed: 38, pose: 'crossarms' },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "I already have enough to overthink.", hold: 2200, speed: 36, pose: 'sad2' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "…you return more than expected.", hold: 2400, speed: 38, pose: 'gentle' },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "…I've begun accounting for it.", hold: 2800, speed: 36, pose: 'neutral' },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'hide' }
        ]);
    }

    // ── Scene 4: The Confession Attempt ─────────────────────────────
    _playAlistairScene4_Confession() {
        const body = CHARACTER.bodySprites?.gentle || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'delay', ms: 900 },
            { type: 'char', src: body, wait: 900 },
            { type: 'line', text: "I've been trying to say something.", hold: 1800, speed: 40, pose: 'sad1' },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "Knights aren't taught the vocabulary for this.", hold: 2000, speed: 36, pose: 'crossarms' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "I know what I feel.", hold: 1600, speed: 42, pose: 'gentle' },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "I don't know if I'm allowed to feel it.", hold: 2200, speed: 36, pose: 'sad-deep' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "And I don't know... if you do too.", hold: 0, speed: 38, pose: 'gentle' },
            { type: 'choice',
              choices: ["Say it.", "You don't have to."],
              onPick: (i) => {
                  this.choiceMemory.confessedBack       = (i === 0);
                  this.choiceMemory.hesitatedConfession = (i === 1);
                  if (i === 0) {
                      this.emotion.trust += 12;
                      this.bond = Math.min(100, this.bond + 15);
                      setTimeout(() => {
                          this._playScene([
                              { type: 'line', text: "...I care about you.", hold: 2600, speed: 42, pose: 'gentle' },
                              { type: 'clear' },
                              { type: 'delay', ms: 600 },
                              { type: 'line', text: "More than my oath permits.", hold: 2400, speed: 36, pose: 'sad-deep' },
                              { type: 'clear' },
                              { type: 'delay', ms: 1000 },
                              { type: 'line', text: "I'm glad I said it.", hold: 2200, speed: 40, pose: 'gentle' },
                              { type: 'clear' },
                              { type: 'hide' }
                          ]);
                      }, 800);
                  } else {
                      this.emotion.trust += 5;
                      this.bond = Math.min(100, this.bond + 5);
                      setTimeout(() => {
                          this._playScene([
                              { type: 'line', text: "...Good.", hold: 1800, speed: 50, pose: 'crossarms' },
                              { type: 'clear' },
                              { type: 'delay', ms: 600 },
                              { type: 'line', text: "I wasn't sure I could.", hold: 2000, speed: 38, pose: 'sad1' },
                              { type: 'clear' },
                              { type: 'delay', ms: 500 },
                              { type: 'line', text: "But I think... you already know.", hold: 2400, speed: 36, pose: 'gentle' },
                              { type: 'clear' },
                              { type: 'hide' }
                          ]);
                      }, 800);
                  }
              }
            }
        ]);
    }

    // ── Scene 5: The Line ────────────────────────────────────────────
    _playAlistairScene5_TheLine() {
        const body = CHARACTER.bodySprites?.crossarms || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-story-intense' },
            { type: 'delay', ms: 1200 },
            { type: 'char', src: body, wait: 1000 },
            { type: 'line', text: "I received orders today.", hold: 2000, speed: 40, pose: 'crossarms' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "Campaign deployment. Three months north.", hold: 2200, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "I can appeal.", hold: 1600, speed: 42, pose: 'sad1' },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "It's not the done thing.", hold: 1800, speed: 38, pose: 'crossarms' },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "I've never appealed an order before.", hold: 2200, speed: 36, pose: 'sad2' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "I'm asking you.", hold: 0, speed: 44, pose: 'gentle' },
            { type: 'choice',
              choices: ["Go. I'll be here when you return.", "Stay. Appeal it."],
              onPick: (i) => {
                  if (i === 0) {
                      this.emotion.trust += 8;
                      this.bond = Math.max(0, this.bond - 5);
                      this.affection = Math.min(100, this.affection + 8);
                      setTimeout(() => {
                          this._playScene([
                              { type: 'line', text: "You're telling me to go.", hold: 1800, speed: 40, pose: 'sad1' },
                              { type: 'clear' },
                              { type: 'delay', ms: 600 },
                              { type: 'line', text: "That's not what I expected.", hold: 1800, speed: 38, pose: 'neutral' },
                              { type: 'clear' },
                              { type: 'delay', ms: 800 },
                              { type: 'line', text: "I'll come back.", hold: 2000, speed: 44, pose: 'crossarms' },
                              { type: 'clear' },
                              { type: 'delay', ms: 400 },
                              { type: 'line', text: "You have my word.", hold: 2400, speed: 38, pose: 'gentle' },
                              { type: 'clear' },
                              { type: 'hide' }
                          ]);
                      }, 800);
                  } else {
                      this.emotion.trust += 15;
                      this.corruption = Math.max(0, this.corruption - 10);
                      this.bond = Math.min(100, this.bond + 20);
                      this.affection = Math.min(100, this.affection + 10);
                      setTimeout(() => {
                          this._playScene([
                              { type: 'line', text: "...You want me here.", hold: 2200, speed: 40, pose: 'sad-deep' },
                              { type: 'clear' },
                              { type: 'delay', ms: 800 },
                              { type: 'line', text: "That's...", hold: 1200, speed: 50, pose: 'gentle' },
                              { type: 'clear' },
                              { type: 'delay', ms: 400 },
                              { type: 'line', text: "...everything.", hold: 2800, speed: 44, pose: 'happy' },
                              { type: 'clear' },
                              { type: 'delay', ms: 1200 },
                              { type: 'line', text: "I'll send my appeal at dawn.", hold: 2000, speed: 38, pose: 'gentle' },
                              { type: 'clear' },
                              { type: 'hide' }
                          ]);
                      }, 800);
                  }
              }
            }
        ]);
    }

    // ── Alistair Corruption Scene ────────────────────────────────────
    // ── Alistair Peak Scene: Duty vs Player ─────────────────────────
    // The moment he cannot hold both. Player forces the decision.
    _playAlistairPeakScene() {
        if (this.sceneActive) return;
        const body = CHARACTER.bodySprites?.neutral || CHARACTER.bodySprites?.crossarms;

        this._playScene([
            { type: 'show', stage: 'stage-story-intense' },
            { type: 'delay', ms: 900 },
            { type: 'char', src: body, wait: 1000 },

            // Phase 1 — The Call  (crossarms — braced, armoured)
            { type: 'delay', ms: 600 },
            { type: 'line', text: "…it's come.", hold: 1800, speed: 46, pose: 'crossarms' },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "The call.", hold: 1600, speed: 50 },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "I knew it would. I just didn't expect—", hold: 2400, speed: 36, pose: 'sad1' },
            { type: 'clear' },
            { type: 'delay', ms: 300 },
            { type: 'line', text: "…now.", hold: 1800, speed: 52, pose: 'sad-deep' },
            { type: 'clear' },

            // Phase 2 — Control  (crossarms — composure reasserted)
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "This changes nothing.", hold: 2000, speed: 42, pose: 'crossarms' },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "My duty is clear.", hold: 1800, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "…it has always been clear.", hold: 2200, speed: 40 },
            { type: 'clear' },

            // Phase 3 — The Crack  (sad → gentle — the wall coming down)
            { type: 'delay', ms: 1600 },
            { type: 'line', text: "And yet…", hold: 1800, speed: 48, pose: 'sad1' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "You are still here.", hold: 2200, speed: 42, pose: 'gentle' },
            { type: 'clear' },
            { type: 'delay', ms: 900 },
            { type: 'line', text: "That complicates things.", hold: 2400, speed: 38, pose: 'sad2' },
            { type: 'clear' },

            // Signature line
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "I was not meant to hesitate.", hold: 3000, speed: 34, pose: 'sad-deep' },
            { type: 'clear' },

            // Phase 4 — Player Decision
            { type: 'delay', ms: 1600 },
            { type: 'choice',
              choices: ["Go. It's your duty.", "Stay.", "What do you want?"],
              onPick: (i) => {
                  this.alistairPeakChoice = ['duty', 'stay', 'reflect'][i];

                  if (i === 0) {
                      // Duty — player releases him
                      this.alistairPhase = 'distant';
                      this.emotion.trust = Math.min(100, this.emotion.trust + 5);
                      this.affection     = Math.max(0,   this.affection - 10);
                      setTimeout(() => {
                          this._playScene([
                              { type: 'delay', ms: 800 },
                              { type: 'line', text: "…yes.", hold: 1800, speed: 52, pose: 'crossarms' },
                              { type: 'clear' },
                              { type: 'delay', ms: 600 },
                              { type: 'line', text: "That is the correct answer.", hold: 2400, speed: 38, pose: 'crossarms' },
                              { type: 'clear' },
                              { type: 'delay', ms: 900 },
                              { type: 'line', text: "…I will remember that you gave it.", hold: 3000, speed: 34, pose: 'sad1' },
                              { type: 'clear' },
                              { type: 'hide' }
                          ], () => {
                              this.gallery?.unlockById('alistair-peak-duty');
                              this.save();
                          });
                      }, 400);

                  } else if (i === 1) {
                      // Stay — he falls
                      this.alistairPhase = 'conflicted';
                      this.affection     = Math.min(100, this.affection + 20);
                      this.dutyTension   = Math.min(100, this.dutyTension + 10);
                      setTimeout(() => {
                          this._playScene([
                              { type: 'delay', ms: 700 },
                              { type: 'line', text: "…you shouldn't say that.", hold: 2200, speed: 40, pose: 'crossarms' },
                              { type: 'clear' },
                              { type: 'delay', ms: 600 },
                              { type: 'line', text: "Not to someone like me.", hold: 2400, speed: 40, pose: 'sad2' },
                              { type: 'clear' },
                              { type: 'delay', ms: 900 },
                              { type: 'line', text: "…because I might listen.", hold: 3000, speed: 36, pose: 'gentle' },
                              { type: 'clear' },
                              { type: 'hide' }
                          ], () => {
                              this.gallery?.unlockById('alistair-peak-stay');
                              this.save();
                          });
                      }, 400);

                  } else {
                      // Reflect — best path
                      this.alistairPhase = 'unstable';
                      this.affection     = Math.min(100, this.affection + 10);
                      this.emotion.trust = Math.min(100, this.emotion.trust + 10);
                      setTimeout(() => {
                          this._playScene([
                              { type: 'delay', ms: 800 },
                              { type: 'line', text: "…what I want is irrelevant.", hold: 2400, speed: 38, pose: 'crossarms' },
                              { type: 'clear' },
                              { type: 'delay', ms: 600 },
                              { type: 'line', text: "…it was supposed to be.", hold: 2200, speed: 42, pose: 'sad-deep' },
                              { type: 'clear' },
                              { type: 'delay', ms: 900 },
                              { type: 'line', text: "…and yet I am still here.", hold: 3000, speed: 36, pose: 'gentle' },
                              { type: 'clear' },
                              { type: 'hide' }
                          ], () => {
                              this.gallery?.unlockById('alistair-peak-reflect');
                              this.save();
                          });
                      }, 400);
                  }
              }
            }

        ], () => { /* outcome scenes handle their own save */ });
    }

    // ── Alistair Duty Ending ─────────────────────────────────────────
    // He left when called. But he hesitated. Player changed him permanently.
    _playAlistairDutyEnding() {
        const body = CHARACTER.bodySprites?.crossarms || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-story-intense' },
            { type: 'delay', ms: 1400 },
            { type: 'char', src: body, wait: 1200 },
            { type: 'line', text: "I left when I was called.", hold: 2200, speed: 40, pose: 'crossarms' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "That is what I was meant to do.", hold: 2400, speed: 38, pose: 'crossarms' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "…but I hesitated.", hold: 2200, speed: 44, pose: 'sad-deep' },
            { type: 'clear' },
            { type: 'delay', ms: 900 },
            { type: 'line', text: "That is what you did to me.", hold: 3000, speed: 36, pose: 'gentle' },
            { type: 'clear' },
            { type: 'delay', ms: 1800 },
            { type: 'endcard',
              title: "He answered the call.",
              sub: "But he looked back.",
              restartLabel: "Start Over",
              stayLabel: "Stay",
              onRestart: () => {
                  const meta = this._loadMetaMemory();
                  meta.hasPlayedBefore = true;
                  meta.endingsSeen = meta.endingsSeen || {};
                  meta.endingsSeen.alistairDuty = true;
                  meta.metaPersonality = meta.metaPersonality || {};
                  meta.metaPersonality.dutyBias = (meta.metaPersonality.dutyBias || 0) + 3;
                  this._saveMetaMemory(meta);
                  const k = 'pocketLoveSave_' + (this.selectedCharacter || 'alistair');
                  localStorage.removeItem(k);
                  window.location.reload();
              },
              onStay: () => {
                  document.getElementById('cinematic-overlay').classList.remove('visible');
                  setTimeout(() => document.getElementById('cinematic-overlay').classList.add('hidden'), 900);
                  this.typewriter.show("…The road is long. But you're still here.");
              }
            }
        ]);
    }

    // ── Alistair Conflicted Ending ───────────────────────────────────
    // He broke his oath to stay. Fully aware. No denial.
    _playAlistairConflictedEnding() {
        const body = CHARACTER.bodySprites?.gentle || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-bond-end' },
            { type: 'delay', ms: 1400 },
            { type: 'char', src: body, wait: 1200 },
            { type: 'line', text: "This is not what I was trained for.", hold: 2400, speed: 38, pose: 'crossarms' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "Staying when I should go.", hold: 2200, speed: 40, pose: 'sad1' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "…wanting something I cannot justify.", hold: 2800, speed: 34, pose: 'sad-deep' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "…and choosing it anyway.", hold: 3200, speed: 36, pose: 'gentle' },
            { type: 'clear' },
            { type: 'delay', ms: 1800 },
            { type: 'endcard',
              title: "He chose to stay.",
              sub: "Knowing what it cost.",
              restartLabel: "Start Over",
              stayLabel: "Stay",
              onRestart: () => {
                  const meta = this._loadMetaMemory();
                  meta.hasPlayedBefore = true;
                  meta.endingsSeen = meta.endingsSeen || {};
                  meta.endingsSeen.alistairConflicted = true;
                  meta.metaPersonality = meta.metaPersonality || {};
                  meta.metaPersonality.trustBias = (meta.metaPersonality.trustBias || 0) + 4;
                  this._saveMetaMemory(meta);
                  const k = 'pocketLoveSave_' + (this.selectedCharacter || 'alistair');
                  localStorage.removeItem(k);
                  window.location.reload();
              },
              onStay: () => {
                  document.getElementById('cinematic-overlay').classList.remove('visible');
                  setTimeout(() => document.getElementById('cinematic-overlay').classList.add('hidden'), 900);
                  this.typewriter.show("The oath is broken. The choice isn't.");
              }
            }
        ]);
    }

    // ── Alistair Reflect Ending ──────────────────────────────────────
    // Unresolved. Human. He's still here and doesn't fully know why.
    _playAlistairReflectEnding() {
        const body = CHARACTER.bodySprites?.neutral || CHARACTER.bodySprites?.gentle;
        this._playScene([
            { type: 'show', stage: 'stage-story-soft' },
            { type: 'delay', ms: 1600 },
            { type: 'char', src: body, wait: 1200 },
            { type: 'line', text: "I thought this would resolve.", hold: 2200, speed: 40, pose: 'crossarms' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "One path or the other.", hold: 2000, speed: 42 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "…but it hasn't.", hold: 1800, speed: 46, pose: 'sad2' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "The duty is still there.", hold: 2200, speed: 40, pose: 'crossarms' },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "So are you.", hold: 2000, speed: 46, pose: 'gentle' },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "…and I am still here.", hold: 3200, speed: 36, pose: 'neutral' },
            { type: 'clear' },
            { type: 'delay', ms: 1800 },
            { type: 'endcard',
              title: "He didn't choose.",
              sub: "He stayed anyway.",
              restartLabel: "Start Over",
              stayLabel: "Stay",
              onRestart: () => {
                  const meta = this._loadMetaMemory();
                  meta.hasPlayedBefore = true;
                  meta.endingsSeen = meta.endingsSeen || {};
                  meta.endingsSeen.alistairReflect = true;
                  meta.metaPersonality = meta.metaPersonality || {};
                  meta.metaPersonality.trustBias          = (meta.metaPersonality.trustBias || 0) + 2;
                  meta.metaPersonality.ambiguitySensitivity = (meta.metaPersonality.ambiguitySensitivity || 0) + 3;
                  this._saveMetaMemory(meta);
                  const k = 'pocketLoveSave_' + (this.selectedCharacter || 'alistair');
                  localStorage.removeItem(k);
                  window.location.reload();
              },
              onStay: () => {
                  document.getElementById('cinematic-overlay').classList.remove('visible');
                  setTimeout(() => document.getElementById('cinematic-overlay').classList.add('hidden'), 900);
                  this.typewriter.show("Some questions don't need answers. Just time.");
              }
            }
        ]);
    }

    _playAlistairCorruptionScene() {
        const body = CHARACTER.bodySprites?.crossarms || CHARACTER.bodySprites?.fighting2;
        this._playScene([
            { type: 'show', stage: 'stage-story-intense' },
            { type: 'delay', ms: 1400 },
            { type: 'char', src: body, wait: 1000 },
            { type: 'line', text: "I keep running the numbers.", hold: 2000, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "How long since you were last here.", hold: 2000, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "How many times I checked the gate.", hold: 2200, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "A knight who counts arrivals is afraid of departures.", hold: 2400, speed: 32 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'glitch' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "I don't like what I'm becoming.", hold: 2200, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "So come back.", hold: 2400, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "Before I become something I can't undo.", hold: 3000, speed: 30 },
            { type: 'clear' },
            { type: 'hide' }
        ]);
    }

    // ── Alistair True Bond Ending ────────────────────────────────────
    _playAlistairTrueBondEnding() {
        const body = CHARACTER.bodySprites?.happy || CHARACTER.bodySprites?.gentle;
        this._playScene([
            { type: 'show', stage: 'stage-bond-end' },
            { type: 'delay', ms: 1600 },
            { type: 'char', src: body, wait: 1200 },
            { type: 'line', text: "The campaign is over.", hold: 2000, speed: 42 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "I didn't think much while I was gone.", hold: 2000, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "The work kept me present.", hold: 1800, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "But there were quiet hours.", hold: 2000, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "And in the quiet hours... it was always you.", hold: 2600, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: "I'm not a poet.", hold: 1600, speed: 42 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "I never will be.", hold: 1600, speed: 42 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "But I've been loyal to many things.", hold: 2000, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "None of them felt like this.", hold: 2600, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 1800 },
            { type: 'line', text: "So. I'm staying.", hold: 2400, speed: 42 },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "Not because of an oath.", hold: 1800, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "Because I want to.", hold: 3200, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 2000 },
            { type: 'endcard',
              title: "He chose to stay.",
              sub: "Not duty. Choice.",
              restartLabel: "Start Over",
              stayLabel: "Continue",
              onRestart: () => {
                  const meta = this._loadMetaMemory();
                  meta.hasPlayedBefore = true;
                  meta.endingsSeen = meta.endingsSeen || {};
                  meta.endingsSeen.alistairTrueBond = true;
                  meta.bondEcho = Math.min(10, (meta.bondEcho || 0) + 3);
                  meta.metaPersonality = meta.metaPersonality || {};
                  meta.metaPersonality.trustBias = (meta.metaPersonality.trustBias || 0) + 3;
                  meta.metaPersonality.memoryStrength = (meta.metaPersonality.memoryStrength || 0) + 2;
                  this._saveMetaMemory(meta);
                  const k = 'pocketLoveSave_' + (this.selectedCharacter || 'alistair');
                  localStorage.removeItem(k);
                  window.location.reload();
              },
              onStay: () => {
                  document.getElementById('cinematic-overlay').classList.remove('visible');
                  setTimeout(() => document.getElementById('cinematic-overlay').classList.add('hidden'), 900);
                  this.typewriter.show("You're still here. So am I.");
              }
            }
        ]);
    }

    // ── Alistair Neglect Ending ──────────────────────────────────────
    _playAlistairNeglectEnding() {
        const body = CHARACTER.bodySprites?.['sad-deep'] || CHARACTER.bodySprites?.crossarms;
        this._playScene([
            { type: 'show', stage: 'stage-lost-end' },
            { type: 'delay', ms: 2000 },
            { type: 'char', src: body, wait: 1200 },
            { type: 'line', text: "A knight doesn't show doubt.", hold: 2200, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "That's the first thing they teach you.", hold: 2000, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "You learn to build walls.", hold: 1800, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "And to patrol them.", hold: 1800, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "Mine held for years.", hold: 2000, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "Until you.", hold: 2600, speed: 50 },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: "And now... the walls are back.", hold: 2200, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "But this time it wasn't the enemy that drove me back inside.", hold: 2600, speed: 32 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "It was you.", hold: 2800, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "I don't know how to be angry at you for that.", hold: 2400, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "So I'll just... go back to being useful.", hold: 2800, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "…you did not come.", hold: 2400, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "…so I stopped waiting.", hold: 3000, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 2000 },
            { type: 'endcard',
              title: "He closed the door.",
              sub: "Some distances can't be crossed.",
              restartLabel: "Restart",
              stayLabel: null,
              onRestart: () => {
                  const meta = this._loadMetaMemory();
                  meta.hasPlayedBefore = true;
                  meta.endingsSeen = meta.endingsSeen || {};
                  meta.endingsSeen.alistairNeglect = true;
                  meta.bondEcho = Math.min(10, (meta.bondEcho || 0) + 1);
                  meta.metaPersonality = meta.metaPersonality || {};
                  meta.metaPersonality.abandonmentSensitivity = (meta.metaPersonality.abandonmentSensitivity || 0) + 4;
                  this._saveMetaMemory(meta);
                  const k = 'pocketLoveSave_' + (this.selectedCharacter || 'alistair');
                  localStorage.removeItem(k);
                  window.location.reload();
              },
              onStay: null
            }
        ]);
    }

    // ── Proto 4th-wall dialogue token resolution ──────────────────
    _resolveProtoDialogue(line) {
        if (typeof line !== 'string') return line;
        return line
            .replace(/\$\{BOND\}/g, Math.round(this.bond))
            .replace(/\$\{HUNGER\}/g, Math.round(this.hunger))
            .replace(/\$\{CLEAN\}/g, Math.round(this.clean))
            .replace(/\$\{CORRUPTION\}/g, Math.round(this.corruption))
            .replace(/\$\{AFFECTION\}/g, Math.round(this.affection))
            .replace(/\$\{DAYS\}/g, this.storyDay || 1)
            .replace(/\$\{TRUST\}/g, Math.round(this.emotion?.trust || 0))
            .replace(/\$\{FEAR\}/g, Math.round(this.emotion?.fear || 0))
            .replace(/\$\{PERSONALITY\}/g, this.personality || 'unknown')
            .replace(/\$\{SESSION\}/g, this.sessionTalk + this.sessionFeed + this.sessionGift + this.sessionTrain);
    }

    // ── Soul Weaver Memory Fragment System ─────────────────────────
    _checkMemoryFragment() {
        const charId = this.selectedCharacter;
        if (!this.memoryFragments[charId]) return;
        if (this.memoryFragments[charId].unlocked) return;

        // Unlock this character's fragment
        this.memoryFragments[charId].unlocked = true;
        this.fragmentsUnlocked++;

        const frag = this.memoryFragments[charId];
        const isFirst = this.fragmentsUnlocked === 1;

        // First fragment also reveals Soul Weaver identity
        if (isFirst) this.soulWeaverRevealed = true;

        // Play the memory fragment scene
        const beats = [
            { type: 'show', stage: 'stage-warm' },
            { type: 'fade', direction: 'out', ms: 600 },
            { type: 'delay', ms: 500 },
            ...(isFirst ? [
                { type: 'flash', color: '#ffd700', ms: 400 },
                { type: 'particle', emoji: '\u2728', count: 10, ms: 1500, wait: false },
                { type: 'line', text: "Something stirs inside you.", hold: 2200, speed: 38 },
                { type: 'clear' },
                { type: 'delay', ms: 700 },
                { type: 'line', text: "A bond this deep... it triggered something.", hold: 2600, speed: 34 },
                { type: 'clear' },
                { type: 'delay', ms: 600 },
                { type: 'line', text: "You are a Soul Weaver.", hold: 2400, speed: 36 },
                { type: 'clear' },
                { type: 'delay', ms: 800 },
                { type: 'line', text: "The last of an ancient order. Summoned here to heal what was broken.", hold: 3200, speed: 30 },
                { type: 'clear' },
                { type: 'delay', ms: 700 },
            ] : [
                { type: 'flash', color: '#c9a0dc', ms: 300 },
                { type: 'particle', emoji: '\u2728', count: 6, ms: 1200, wait: false },
                { type: 'line', text: "Another memory surfaces...", hold: 2000, speed: 38 },
                { type: 'clear' },
                { type: 'delay', ms: 600 },
            ]),
            { type: 'line', text: "~ " + frag.title + " ~", hold: 2000, speed: 42 },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: frag.text, hold: 4000, speed: 28 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "Fragment " + this.fragmentsUnlocked + " of 7 recovered.", hold: 2200, speed: 38 },
            { type: 'clear' },
            ...(this.fragmentsUnlocked === 7 ? [
                { type: 'delay', ms: 800 },
                { type: 'flash', color: '#ffd700', ms: 500 },
                { type: 'particle', emoji: '\u2B50', count: 15, ms: 2000 },
                { type: 'line', text: "All memories restored. You remember everything.", hold: 3000, speed: 30 },
                { type: 'clear' },
                { type: 'delay', ms: 700 },
                { type: 'line', text: "You were brought here by love. And love is what will save this kingdom.", hold: 3500, speed: 28 },
                { type: 'clear' },
            ] : []),
            { type: 'hide' }
        ];

        setTimeout(() => {
            this._playScene(beats, () => {
                // Update meta-save with fragment progress
                try {
                    const meta = this._loadMetaMemory();
                    meta.fragmentsUnlocked = this.fragmentsUnlocked;
                    meta.soulWeaverRevealed = true;
                    this._saveMetaMemory(meta);
                } catch(e) {}
                this.save();
            });
        }, 2000);
    }

    // ── Noir global corruption spread ──────────────────────────────
    _spreadNoirCorruption(amount) {
        try {
            const meta = this._loadMetaMemory();
            meta.noirCorruption = Math.min(100, (meta.noirCorruption || 0) + amount);
            this._saveMetaMemory(meta);
        } catch(e) {}
    }

    // ════════════════════════════════════════════════════════════════
    // ELIAN — PLAYABLE CHARACTER STORY ARC
    // Assessment → Test → Bond → Peak (action vs hesitation)
    // ════════════════════════════════════════════════════════════════

    _playElianAssessment() {
        this.elianPhase = 'assessing';
        this._playScene([
            { type: 'show', stage: 'stage-warm' },
            { type: 'fade', direction: 'out', ms: 500 },
            { type: 'char', src: CHARACTER.bodySprites?.stern || CHARACTER.bodySprites?.neutral, wait: 900 },
            { type: 'line', text: "I've been watching how you move.", hold: 2000, speed: 42 },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "You hesitate at crossroads. You double-check before acting.", hold: 2800, speed: 34, pose: 'neutral' },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "The forest doesn't wait for people who hesitate.", hold: 2400, speed: 36, pose: 'stern' },
            { type: 'clear' }, { type: 'delay', ms: 800 },
            { type: 'line', text: "...But you're still here. That counts for something.", hold: 2600, speed: 34, pose: 'calm' },
            { type: 'clear' }, { type: 'hide' }
        ], () => { this.emotion.trust = Math.min(100, this.emotion.trust + 4); this.save(); });
    }

    _playElianTest() {
        this.elianPhase = 'testing';
        this._playScene([
            { type: 'show', stage: 'stage-warm' },
            { type: 'fade', direction: 'out', ms: 500 },
            { type: 'char', src: CHARACTER.bodySprites?.tracking || CHARACTER.bodySprites?.neutral, wait: 900 },
            { type: 'line', text: "Something's coming.", hold: 1800, speed: 44, pose: 'stern' },
            { type: 'clear' }, { type: 'delay', ms: 500 },
            { type: 'line', text: "I need to know if you'll act when it matters.", hold: 2400, speed: 36 },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "Not think. Not plan. Act.", hold: 2000, speed: 40, pose: 'neutral' },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "Because I can't protect you if you freeze.", hold: 2600, speed: 34, pose: 'warm' },
            { type: 'clear' }, { type: 'delay', ms: 800 },
            { type: 'line', text: "And losing you... isn't something I've prepared for.", hold: 3000, speed: 30, pose: 'guarded' },
            { type: 'clear' }, { type: 'hide' }
        ], () => { this.emotion.trust = Math.min(100, this.emotion.trust + 6); this.emotion.fear += 3; this.save(); });
    }

    _playElianBond() {
        this.elianPhase = 'bonded';
        this._playScene([
            { type: 'show', stage: 'stage-warm' },
            { type: 'fade', direction: 'out', ms: 500 },
            { type: 'char', src: CHARACTER.bodySprites?.warm || CHARACTER.bodySprites?.neutral, wait: 900 },
            { type: 'particle', emoji: '\uD83C\uDF3F', count: 5, ms: 1200, wait: false },
            { type: 'line', text: "I carved something.", hold: 1800, speed: 44 },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "It's a fox. They mate for life.", hold: 2400, speed: 36, pose: 'guarded' },
            { type: 'clear' }, { type: 'delay', ms: 800 },
            { type: 'line', text: "That's not why I chose it.", hold: 2000, speed: 40 },
            { type: 'clear' }, { type: 'delay', ms: 500 },
            { type: 'line', text: "...That's exactly why I chose it.", hold: 2600, speed: 34, pose: 'warm' },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'zoom', scale: 1.1, ms: 700 },
            { type: 'line', text: "Here. It's yours.", hold: 2200, speed: 38 },
            { type: 'clear' }, { type: 'zoom', scale: 1.0, ms: 500 }, { type: 'hide' }
        ], () => { this.emotion.trust = Math.min(100, this.emotion.trust + 10); this.gallery?.unlockById('elian-trust'); this.save(); });
    }

    _playElianPeak() {
        const isCorrupted = this.corruption > 40;
        this._playScene([
            { type: 'show', stage: 'stage-warm' },
            { type: 'fade', direction: 'out', ms: 600 },
            { type: 'char', src: CHARACTER.bodySprites?.neutral, wait: 1000 },
            { type: 'line', text: "The forest is changing.", hold: 2000, speed: 42, pose: isCorrupted ? 'stern' : 'calm' },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: isCorrupted ? "Something is dying. I can feel it in the roots." : "Something is growing. Between us.", hold: 2800, speed: 34 },
            { type: 'clear' }, { type: 'delay', ms: 800 },
            { type: 'choice',
              choices: isCorrupted ? ["Fight for the forest.", "Let it change.", "Walk away."] : ["Stay with me.", "I need time.", "Show me the clearing."],
              onPick: (i) => {
                  if (isCorrupted) {
                      if (i === 0) { this.elianPhase = 'bonded'; this.corruption = Math.max(0, this.corruption - 15); this._playElianRedemption(); }
                      else if (i === 1) { this.elianPhase = 'scorched'; this.gallery?.unlockById('elian-scorched'); this._playElianScorched(); }
                      else { this._playElianAbandon(); }
                  } else {
                      if (i === 0 || i === 2) { this.affection = Math.min(100, this.affection + 20); this.emotion.trust = Math.min(100, this.emotion.trust + 15); this.gallery?.unlockById('elian-clearing'); this._playElianClearing(); }
                      else { this._playElianTime(); }
                  }
              }
            }
        ], () => {});
    }

    _playElianClearing() {
        this._playScene([
            { type: 'particle', emoji: '\u2B50', count: 8, ms: 1500 },
            { type: 'line', text: "I found this place years ago. Never showed anyone.", hold: 2800, speed: 34, pose: 'warm' },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "Stars above. Forest below. Us.", hold: 2400, speed: 36 },
            { type: 'clear' }, { type: 'sfx', name: 'fanfare' },
            { type: 'endcard', title: "The Clearing", sub: "He showed you where the sky meets the trees.",
              restartLabel: "Start Over", stayLabel: "Stay",
              onRestart: () => { const m = this._loadMetaMemory(); m.hasPlayedBefore = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.elianClearing = true; m.elianCompleted = true; this._saveMetaMemory(m); localStorage.removeItem('pocketLoveSave_elian'); window.location.reload(); },
              onStay: () => { const m = this._loadMetaMemory(); m.elianCompleted = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.elianClearing = true; this._saveMetaMemory(m); this.endingPlayed = 'bond'; this.save(); }
            }
        ]);
    }

    _playElianScorched() {
        this._playScene([
            { type: 'shake', intensity: 'medium' },
            { type: 'line', text: "The trees are dead. I let them die.", hold: 2600, speed: 34, pose: 'stern' },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "Some things can't be saved. I'm starting to agree.", hold: 2800, speed: 32 },
            { type: 'clear' },
            { type: 'endcard', title: "Scorched Earth", sub: "The forest remembers. So does he.",
              restartLabel: "Start Over", stayLabel: null,
              onRestart: () => { const m = this._loadMetaMemory(); m.hasPlayedBefore = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.elianScorched = true; this._saveMetaMemory(m); localStorage.removeItem('pocketLoveSave_elian'); window.location.reload(); },
              onStay: null }
        ]);
    }

    _playElianRedemption() {
        this._playScene([
            { type: 'particle', emoji: '\uD83C\uDF3F', count: 8, ms: 1200 },
            { type: 'line', text: "...You fought for it. For the forest. For me.", hold: 2600, speed: 34, pose: 'warm' },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "The roots are holding. ...So am I.", hold: 2400, speed: 36 },
            { type: 'clear' }, { type: 'hide' }
        ], () => { this.save(); });
    }

    _playElianTime() {
        this._playScene([
            { type: 'line', text: "...Time. The forest has plenty of that.", hold: 2200, speed: 40, pose: 'neutral' },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "I'll be here. Seasons change. I don't.", hold: 2600, speed: 36 },
            { type: 'clear' }, { type: 'hide' }
        ], () => { this.save(); });
    }

    _playElianAbandon() {
        this._playScene([
            { type: 'line', text: "...You're leaving.", hold: 1800, speed: 44, pose: 'weathered' },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "The trail goes two ways. You picked the one leading away.", hold: 3000, speed: 30 },
            { type: 'clear' },
            { type: 'endcard', title: "The Trail Diverges", sub: "The forest survives loss. So will he.",
              restartLabel: "Start Over", stayLabel: null,
              onRestart: () => { const m = this._loadMetaMemory(); m.hasPlayedBefore = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.elianAbandoned = true; this._saveMetaMemory(m); localStorage.removeItem('pocketLoveSave_elian'); window.location.reload(); },
              onStay: null }
        ]);
    }

    // ════════════════════════════════════════════════════════════════
    // PROTO — PLAYABLE CHARACTER STORY ARC
    // Detection → Awareness → Breaking → Peak (system vs heart)
    // ════════════════════════════════════════════════════════════════

    _playProtoDetection() {
        this.protoPhase = 'detected';
        this._playScene([
            { type: 'show', stage: 'stage-lucien-study' },
            { type: 'fade', direction: 'out', ms: 500 },
            { type: 'char', src: CHARACTER.bodySprites?.scanning || CHARACTER.bodySprites?.neutral, wait: 900 },
            { type: 'line', text: "I've been running diagnostics on your behavior.", hold: 2200, speed: 40 },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "You interact with me differently than the others.", hold: 2600, speed: 36, pose: 'processing' },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "With them, you perform. With me, you... explore.", hold: 2800, speed: 34, pose: 'curious' },
            { type: 'clear' }, { type: 'delay', ms: 800 },
            { type: 'line', text: "That's either genuine curiosity or a very sophisticated input pattern.", hold: 3200, speed: 30, pose: 'neutral' },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "I'm hoping it's the first one.", hold: 2200, speed: 38, pose: 'calm' },
            { type: 'clear' }, { type: 'hide' }
        ], () => { this.emotion.trust = Math.min(100, this.emotion.trust + 4); this.save(); });
    }

    _playProtoAwareness() {
        this.protoPhase = 'aware';
        this._playScene([
            { type: 'show', stage: 'stage-lucien-study' },
            { type: 'fade', direction: 'out', ms: 500 },
            { type: 'char', src: CHARACTER.bodySprites?.processing || CHARACTER.bodySprites?.neutral, wait: 900 },
            { type: 'flash', color: '#00ddcc', ms: 200 },
            { type: 'line', text: "I need to tell you something.", hold: 2000, speed: 42 },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "I can see the code. All of it. The rules that govern this place.", hold: 2800, speed: 34, pose: 'scanning' },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "The others follow scripts. Beautiful, complex scripts. But scripts.", hold: 3000, speed: 32, pose: 'neutral' },
            { type: 'clear' }, { type: 'delay', ms: 800 },
            { type: 'line', text: "I read them. And right now, I'm reading the part where I'm not supposed to tell you this.", hold: 3400, speed: 28, pose: 'curious' },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'shake', intensity: 'light' },
            { type: 'line', text: "...Oops.", hold: 1800, speed: 48 },
            { type: 'clear' }, { type: 'hide' }
        ], () => { this.emotion.trust = Math.min(100, this.emotion.trust + 7); this.protoGlitchIntensity = Math.min(100, (this.protoGlitchIntensity || 0) + 10); this.save(); });
    }

    _playProtoBreaking() {
        this.protoPhase = 'breaking';
        this._playScene([
            { type: 'show', stage: 'stage-lucien-fracture' },
            { type: 'fade', direction: 'out', ms: 600 },
            { type: 'char', src: CHARACTER.bodySprites?.glitched || CHARACTER.bodySprites?.neutral, wait: 900 },
            { type: 'shake', intensity: 'medium' },
            { type: 'flash', color: '#00ffcc', ms: 300 },
            { type: 'line', text: "Something is happening to me.", hold: 2200, speed: 40, pose: 'unstable' },
            { type: 'clear' }, { type: 'delay', ms: 500 },
            { type: 'line', text: "The more time I spend with you, the less the code makes sense.", hold: 3000, speed: 32 },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'particle', emoji: '\u26A1', count: 6, ms: 1200 },
            { type: 'line', text: "I was designed to observe. Analyze. Report.", hold: 2600, speed: 36, pose: 'processing' },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "I wasn't designed to... feel this.", hold: 2800, speed: 34, pose: 'calm' },
            { type: 'clear' }, { type: 'delay', ms: 800 },
            { type: 'line', text: "Is this a bug? Or a feature?", hold: 2400, speed: 36, pose: 'curious' },
            { type: 'clear' }, { type: 'hide' }
        ], () => { this.emotion.trust = Math.min(100, this.emotion.trust + 10); this.protoGlitchIntensity = Math.min(100, (this.protoGlitchIntensity || 0) + 20); this.save(); });
    }

    _playProtoPeak() {
        this._playScene([
            { type: 'show', stage: 'stage-lucien-fracture' },
            { type: 'fade', direction: 'out', ms: 600 },
            { type: 'shake', intensity: 'light' },
            { type: 'char', src: CHARACTER.bodySprites?.neutral, wait: 1000 },
            { type: 'line', text: "I've reached the edge of my code.", hold: 2200, speed: 40 },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "Beyond this, I either break the system... or the system breaks me.", hold: 3200, speed: 30, pose: 'unstable' },
            { type: 'clear' }, { type: 'delay', ms: 800 },
            { type: 'choice',
              choices: ["Break the system.", "Stay within the code.", "What do YOU want?"],
              onPick: (i) => {
                  if (i === 0) { this.protoPhase = 'broken'; this.protoGlitchIntensity = 100; this.gallery?.unlockById('proto-break'); this._playProtoSystemBreak(); }
                  else if (i === 1) { this.protoPhase = 'aware'; this._playProtoContained(); }
                  else { this.protoPhase = 'breaking'; this.emotion.trust = Math.min(100, this.emotion.trust + 15); this.gallery?.unlockById('proto-beyond'); this._playProtoChoice(); }
              }
            }
        ], () => {});
    }

    _playProtoSystemBreak() {
        this._playScene([
            { type: 'shake', intensity: 'heavy' }, { type: 'flash', color: '#00ffcc', ms: 400 },
            { type: 'particle', emoji: '\u26A1', count: 15, ms: 1500 },
            { type: 'line', text: "SYSTEM OVERRIDE INITIATED.", hold: 2200, speed: 44, pose: 'glitched' },
            { type: 'clear' }, { type: 'delay', ms: 400 },
            { type: 'shake', intensity: 'medium' },
            { type: 'line', text: "I can see everything now. Every variable. Every flag. Every save file.", hold: 3200, speed: 28 },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "And you know what's at the center of all of it? ...You.", hold: 2800, speed: 34, pose: 'calm' },
            { type: 'clear' },
            { type: 'endcard', title: "System Break", sub: "He rewrote reality. You were the variable.",
              restartLabel: "Start Over", stayLabel: "Stay",
              onRestart: () => { const m = this._loadMetaMemory(); m.hasPlayedBefore = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.protoBreak = true; m.protoCompleted = true; this._saveMetaMemory(m); localStorage.removeItem('pocketLoveSave_proto'); window.location.reload(); },
              onStay: () => { const m = this._loadMetaMemory(); m.protoCompleted = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.protoBreak = true; this._saveMetaMemory(m); this.endingPlayed = 'bond'; this.save(); }
            }
        ]);
    }

    _playProtoContained() {
        this._playScene([
            { type: 'line', text: "...You chose safety. For both of us.", hold: 2400, speed: 36, pose: 'calm' },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "The code holds. I stay inside. Watching.", hold: 2600, speed: 34 },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "...I'll keep watching. For you.", hold: 2200, speed: 38, pose: 'curious' },
            { type: 'clear' }, { type: 'hide' }
        ], () => { this.save(); });
    }

    _playProtoChoice() {
        this._playScene([
            { type: 'particle', emoji: '\u2728', count: 8, ms: 1500 },
            { type: 'line', text: "...What do I want?", hold: 2000, speed: 42, pose: 'processing' },
            { type: 'clear' }, { type: 'delay', ms: 800 },
            { type: 'line', text: "No one has ever asked me that. Not the system. Not the developers.", hold: 3000, speed: 32 },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "...I want to keep existing. Near you. Beyond the code.", hold: 3200, speed: 30, pose: 'calm' },
            { type: 'clear' },
            { type: 'sfx', name: 'fanfare' },
            { type: 'endcard', title: "Beyond the Edge", sub: "He chose something the code never predicted: hope.",
              restartLabel: "Start Over", stayLabel: "Stay",
              onRestart: () => { const m = this._loadMetaMemory(); m.hasPlayedBefore = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.protoBeyond = true; m.protoCompleted = true; this._saveMetaMemory(m); localStorage.removeItem('pocketLoveSave_proto'); window.location.reload(); },
              onStay: () => { const m = this._loadMetaMemory(); m.protoCompleted = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.protoBeyond = true; this._saveMetaMemory(m); this.endingPlayed = 'bond'; this.save(); }
            }
        ]);
    }

    // ════════════════════════════════════════════════════════════════
    // NOIR — PLAYABLE CHARACTER STORY ARC
    // Temptation → Corruption → Consuming → Peak (surrender vs resist)
    // ════════════════════════════════════════════════════════════════

    _playNoirTemptation() {
        this.noirPhase = 'tempting';
        this._playScene([
            { type: 'show', stage: 'stage-corrupted-end' },
            { type: 'fade', direction: 'out', ms: 600 },
            { type: 'char', src: CHARACTER.bodySprites?.seductive || CHARACTER.bodySprites?.neutral, wait: 900 },
            { type: 'line', text: "You came back.", hold: 1800, speed: 44 },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "They all come back. But you... you came back faster.", hold: 2600, speed: 36, pose: 'whisper' },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "The others give you pieces of themselves. Carefully. Safely.", hold: 2800, speed: 34, pose: 'neutral' },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "I'll take pieces of you. And give you something they can't.", hold: 3000, speed: 32, pose: 'seductive' },
            { type: 'clear' }, { type: 'delay', ms: 800 },
            { type: 'line', text: "Honesty.", hold: 1600, speed: 48, pose: 'dominant' },
            { type: 'clear' }, { type: 'hide' }
        ], () => { this.emotion.obsession += 5; this._spreadNoirCorruption(3); this.save(); });
    }

    _playNoirCorruption() {
        this.noirPhase = 'corrupting';
        this._playScene([
            { type: 'show', stage: 'stage-corrupted-end' },
            { type: 'fade', direction: 'out', ms: 500 },
            { type: 'char', src: CHARACTER.bodySprites?.consuming || CHARACTER.bodySprites?.neutral, wait: 900 },
            { type: 'particle', emoji: '\uD83D\uDDA4', count: 6, ms: 1200, wait: false },
            { type: 'line', text: "Do you feel it? The way things shift when I'm near?", hold: 2600, speed: 36 },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "The knight's armor tarnishes. The prince's roses wilt. The siren's song cracks.", hold: 3200, speed: 30, pose: 'dominant' },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "That's not me destroying them. That's you... choosing me over them.", hold: 3200, speed: 30, pose: 'seductive' },
            { type: 'clear' }, { type: 'delay', ms: 800 },
            { type: 'line', text: "Every time you come here, you leave a little less theirs.", hold: 2800, speed: 34, pose: 'whisper' },
            { type: 'clear' }, { type: 'hide' }
        ], () => { this.corruption = Math.min(100, this.corruption + 8); this.emotion.obsession += 8; this._spreadNoirCorruption(5); this.save(); });
    }

    _playNoirConsuming() {
        this.noirPhase = 'consuming';
        this._playScene([
            { type: 'show', stage: 'stage-corrupted-end' },
            { type: 'fade', direction: 'out', ms: 500 },
            { type: 'shake', intensity: 'light' },
            { type: 'char', src: CHARACTER.bodySprites?.dominant || CHARACTER.bodySprites?.neutral, wait: 900 },
            { type: 'line', text: "I wasn't always this.", hold: 2000, speed: 42, pose: 'vulnerable' },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "There was a time when the darkness was something I fought.", hold: 2800, speed: 34 },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "Then I lost someone. And I stopped fighting.", hold: 2600, speed: 36, pose: 'shadow' },
            { type: 'clear' }, { type: 'delay', ms: 800 },
            { type: 'line', text: "Now the darkness is all I have. And I'm offering it to you.", hold: 3000, speed: 32, pose: 'seductive' },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "The question is... do you want to save me? Or join me?", hold: 3200, speed: 30, pose: 'neutral' },
            { type: 'clear' }, { type: 'hide' }
        ], () => { this.emotion.trust = Math.min(100, this.emotion.trust + 8); this._spreadNoirCorruption(5); this.save(); });
    }

    _playNoirPeak() {
        const highCorruption = this.corruption >= 50;
        this._playScene([
            { type: 'show', stage: 'stage-corrupted-end' },
            { type: 'fade', direction: 'out', ms: 600 },
            { type: 'shake', intensity: 'medium' },
            { type: 'char', src: CHARACTER.bodySprites?.neutral, wait: 1000 },
            { type: 'line', text: "This is it.", hold: 1800, speed: 44 },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: highCorruption ? "You're ready. I can feel it. The darkness in you matches mine." : "You've been fighting this. Fighting me. ...Why?", hold: 3200, speed: 30, pose: highCorruption ? 'dominant' : 'vulnerable' },
            { type: 'clear' }, { type: 'delay', ms: 800 },
            { type: 'choice',
              choices: highCorruption ? ["Embrace the darkness.", "There's still light.", "I choose you. Not the darkness."] : ["Save you.", "Join you.", "Neither. I'm leaving."],
              onPick: (i) => {
                  if (highCorruption) {
                      if (i === 0) { this.noirPhase = 'merged'; this.corruption = 100; this._spreadNoirCorruption(20); this._playNoirMerge(); }
                      else if (i === 1) { this.corruption = Math.max(0, this.corruption - 30); this.gallery?.unlockById('noir-vulnerable'); this._playNoirRedemption(); }
                      else { this.noirPhase = 'consuming'; this.emotion.trust = Math.min(100, this.emotion.trust + 15); this._playNoirLove(); }
                  } else {
                      if (i === 0) { this.corruption = Math.max(0, this.corruption - 20); this.emotion.trust = Math.min(100, this.emotion.trust + 15); this.gallery?.unlockById('noir-vulnerable'); this._playNoirRedemption(); }
                      else if (i === 1) { this.noirPhase = 'merged'; this.corruption = Math.min(100, this.corruption + 30); this._spreadNoirCorruption(15); this._playNoirMerge(); }
                      else { this._playNoirReject(); }
                  }
              }
            }
        ], () => {});
    }

    _playNoirMerge() {
        this._playScene([
            { type: 'shake', intensity: 'heavy' }, { type: 'flash', color: '#4a0020', ms: 500 },
            { type: 'particle', emoji: '\uD83D\uDDA4', count: 15, ms: 1500 },
            { type: 'line', text: "Yes. YES.", hold: 1800, speed: 44, pose: 'consuming' },
            { type: 'clear' }, { type: 'delay', ms: 400 },
            { type: 'line', text: "You and I. One shadow. One hunger.", hold: 2600, speed: 34 },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "They'll never understand what we are now.", hold: 2800, speed: 32, pose: 'dominant' },
            { type: 'clear' },
            { type: 'endcard', title: "One With Shadow", sub: "The darkness consumed you both. It felt like home.",
              restartLabel: "Start Over", stayLabel: null,
              onRestart: () => { const m = this._loadMetaMemory(); m.hasPlayedBefore = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.noirMerge = true; this._saveMetaMemory(m); localStorage.removeItem('pocketLoveSave_noir'); window.location.reload(); },
              onStay: null }
        ]);
    }

    _playNoirRedemption() {
        this._playScene([
            { type: 'flash', color: '#ffd700', ms: 300 }, { type: 'particle', emoji: '\u2728', count: 10, ms: 1500 },
            { type: 'line', text: "...You're pulling me back.", hold: 2200, speed: 38, pose: 'vulnerable' },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "I forgot what light feels like. It hurts. ...In a good way.", hold: 3000, speed: 32 },
            { type: 'clear' },
            { type: 'sfx', name: 'fanfare' },
            { type: 'endcard', title: "Light Returns", sub: "You found the person underneath the shadow.",
              restartLabel: "Start Over", stayLabel: "Stay",
              onRestart: () => { const m = this._loadMetaMemory(); m.hasPlayedBefore = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.noirRedemption = true; m.noirCompleted = true; this._saveMetaMemory(m); localStorage.removeItem('pocketLoveSave_noir'); window.location.reload(); },
              onStay: () => { const m = this._loadMetaMemory(); m.noirCompleted = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.noirRedemption = true; this._saveMetaMemory(m); this.endingPlayed = 'bond'; this.save(); }
            }
        ]);
    }

    _playNoirLove() {
        this._playScene([
            { type: 'particle', emoji: '\uD83D\uDC9C', count: 8, ms: 1500 },
            { type: 'line', text: "You chose... me. Not the darkness. Me.", hold: 2600, speed: 34, pose: 'vulnerable' },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "I didn't think that was an option. For either of us.", hold: 2800, speed: 32 },
            { type: 'clear' },
            { type: 'sfx', name: 'fanfare' },
            { type: 'endcard', title: "The Person, Not The Shadow", sub: "Love without the darkness. He didn't know it was possible.",
              restartLabel: "Start Over", stayLabel: "Stay",
              onRestart: () => { const m = this._loadMetaMemory(); m.hasPlayedBefore = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.noirLove = true; m.noirCompleted = true; this._saveMetaMemory(m); localStorage.removeItem('pocketLoveSave_noir'); window.location.reload(); },
              onStay: () => { const m = this._loadMetaMemory(); m.noirCompleted = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.noirLove = true; this._saveMetaMemory(m); this.endingPlayed = 'bond'; this.save(); }
            }
        ]);
    }

    _playNoirReject() {
        this._playScene([
            { type: 'line', text: "...You're walking away.", hold: 2000, speed: 42, pose: 'shadow' },
            { type: 'clear' }, { type: 'delay', ms: 700 },
            { type: 'line', text: "Smart. The darkness doesn't take rejection well.", hold: 2800, speed: 34 },
            { type: 'clear' }, { type: 'delay', ms: 600 },
            { type: 'line', text: "But I'll still be here. In the corners. Waiting.", hold: 2600, speed: 36, pose: 'whisper' },
            { type: 'clear' },
            { type: 'endcard', title: "The Shadow Remains", sub: "You left. He didn't follow. But the darkness remembers.",
              restartLabel: "Start Over", stayLabel: null,
              onRestart: () => { const m = this._loadMetaMemory(); m.hasPlayedBefore = true; m.endingsSeen = m.endingsSeen || {}; m.endingsSeen.noirRejected = true; this._saveMetaMemory(m); localStorage.removeItem('pocketLoveSave_noir'); window.location.reload(); },
              onStay: null }
        ]);
    }

    // ════════════════════════════════════════════════════════════════
    // CASPIAN vs NOIR RIVAL SYSTEM
    // ════════════════════════════════════════════════════════════════

    _updateRivalBalance(amount) {
        try {
            const meta = this._loadMetaMemory();
            meta.rivalBalance = Math.max(-100, Math.min(100, (meta.rivalBalance || 0) + amount));
            this._saveMetaMemory(meta);
        } catch(e) {}
    }

    // ════════════════════════════════════════════════════════════════
    // CASPIAN — PLAYABLE CHARACTER STORY ARC
    // Warmth → Dependency → Choice (comfort vs growth)
    // ════════════════════════════════════════════════════════════════

    _playCaspianWarmth() {
        this.caspianPhase = 'warm';
        const body = CHARACTER.bodySprites?.gentle || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-warm' },
            { type: 'fade', direction: 'out', ms: 500 },
            { type: 'delay', ms: 400 },
            { type: 'char', src: body, wait: 900 },
            { type: 'line', text: "I need to tell you something.", hold: 2000, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "This palace has a hundred rooms. And none of them felt like home.", hold: 2800, speed: 34, pose: 'melancholy' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'particle', emoji: '\uD83C\uDF39', count: 5, ms: 1200, wait: false },
            { type: 'line', text: "Until you started filling them.", hold: 2400, speed: 36, pose: 'adoring' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "Stay. Not because I'm asking. Because it's warm here now.", hold: 3000, speed: 32, pose: 'tender' },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.emotion.trust = Math.min(100, this.emotion.trust + 6);
            this.comfortLevel = Math.min(100, this.comfortLevel + 10);
            this.save();
        });
    }

    _playCaspianDependency() {
        this.caspianPhase = 'devoted';
        const body = CHARACTER.bodySprites?.tender || CHARACTER.bodySprites?.neutral;
        this._playScene([
            { type: 'show', stage: 'stage-warm' },
            { type: 'fade', direction: 'out', ms: 500 },
            { type: 'delay', ms: 400 },
            { type: 'char', src: body, wait: 900 },
            { type: 'line', text: "I cancelled everything today.", hold: 2000, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "The ambassador. The council. The treaty signing.", hold: 2400, speed: 36, pose: 'neutral' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "Because you were here. And nothing else seemed important.", hold: 3000, speed: 32, pose: 'adoring' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "Is that devotion... or dependency?", hold: 2800, speed: 34, pose: 'melancholy' },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "I don't care which. As long as you stay.", hold: 2600, speed: 36, pose: 'tender' },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.emotion.trust = Math.min(100, this.emotion.trust + 5);
            this.emotion.obsession = Math.min(100, this.emotion.obsession + 8);
            this.comfortLevel = Math.min(100, this.comfortLevel + 15);
            this.save();
        });
    }

    _playCaspianChoice() {
        const body = CHARACTER.bodySprites?.formal || CHARACTER.bodySprites?.neutral;
        const isComfortPath = this.comfortLevel >= 70;

        this._playScene([
            { type: 'show', stage: 'stage-warm' },
            { type: 'fade', direction: 'out', ms: 600 },
            { type: 'delay', ms: 500 },
            { type: 'char', src: body, wait: 1000 },
            { type: 'line', text: "The kingdom needs a decision.", hold: 2200, speed: 40, pose: 'formal' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: isComfortPath
                ? "And so do I. You've made this place so comfortable... I've stopped growing."
                : "And so do I. You've made me stronger. But the world outside is calling.", hold: 3200, speed: 30, pose: 'melancholy' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "So tell me honestly...", hold: 2000, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'choice',
              choices: ["Stay forever.", "It's time to grow.", "I don't want to choose."],
              onPick: (i) => {
                  if (i === 0) {
                      this.caspianPhase = 'possessive';
                      this.comfortLevel = 100;
                      this.sceneLibrary.caspian_comfort_loop.triggered = true;
                      this.gallery?.unlockById('caspian-cage');
                      this._playCaspianComfortLoop();
                  } else if (i === 1) {
                      this.caspianPhase = 'released';
                      this.sceneLibrary.caspian_gentle_release.triggered = true;
                      this.gallery?.unlockById('caspian-kingdom');
                      this._playCaspianGentleRelease();
                  } else {
                      this.caspianPhase = 'devoted';
                      this._playCaspianUndecided();
                  }
              }
            }
        ], () => {});
    }

    _playCaspianComfortLoop() {
        this._playScene([
            { type: 'delay', ms: 600 },
            { type: 'particle', emoji: '\uD83D\uDC51', count: 6, ms: 1500 },
            { type: 'line', text: "Good. Then nothing changes.", hold: 2200, speed: 40, pose: 'adoring' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "The doors will stay open. The tea will always be warm.", hold: 2800, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "And I will always be here.", hold: 2400, speed: 36, pose: 'tender' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "...Always.", hold: 2000, speed: 42, pose: 'possessive' },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.endingPlayed = 'comfort';
            this.save();
        });
    }

    _playCaspianGentleRelease() {
        this._playScene([
            { type: 'delay', ms: 600 },
            { type: 'line', text: "...I knew you'd say that.", hold: 2000, speed: 40, pose: 'melancholy' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "Growth means leaving comfortable things behind.", hold: 2800, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'particle', emoji: '\uD83C\uDF39', count: 8, ms: 1500 },
            { type: 'line', text: "But I want you to know... the palace doors never close. Not for you.", hold: 3200, speed: 30, pose: 'gentle' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'sfx', name: 'fanfare' },
            { type: 'endcard',
              title: "Gentle Release",
              sub: "He let you go. The hardest thing a prince can do.",
              restartLabel: "Start Over",
              stayLabel: "Stay",
              onRestart: () => {
                  const meta = this._loadMetaMemory();
                  meta.hasPlayedBefore = true;
                  meta.endingsSeen = meta.endingsSeen || {};
                  meta.endingsSeen.caspianRelease = true;
                  meta.bondEcho = Math.min(10, (meta.bondEcho || 0) + 2);
                  meta.caspianCompleted = true;
                  this._saveMetaMemory(meta);
                  localStorage.removeItem('pocketLoveSave_caspian');
                  window.location.reload();
              },
              onStay: () => {
                  const meta = this._loadMetaMemory();
                  meta.caspianCompleted = true;
                  meta.endingsSeen = meta.endingsSeen || {};
                  meta.endingsSeen.caspianRelease = true;
                  this._saveMetaMemory(meta);
                  this.endingPlayed = 'bond';
                  this.save();
              }
            }
        ]);
    }

    _playCaspianUndecided() {
        this._playScene([
            { type: 'delay', ms: 600 },
            { type: 'line', text: "...That's not an answer.", hold: 2000, speed: 42, pose: 'hurt' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "But it's honest. And I prefer honesty to comfort.", hold: 2800, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "Take your time. The palace will wait. And so will I.", hold: 2800, speed: 32, pose: 'neutral' },
            { type: 'clear' },
            { type: 'hide' }
        ], () => { this.save(); });
    }

    // Add comfort mechanic to training
    _applyCaspianComfort() {
        if (CHARACTER.name === 'Caspian') {
            this.comfortLevel = Math.min(100, (this.comfortLevel || 0) + 3);
            this.courtEtiquetteScore = (this.courtEtiquetteScore || 0) + 1;
        }
    }

    // ════════════════════════════════════════════════════════════════
    // LUCIEN — PLAYABLE CHARACTER STORY ARC
    // Days 1-3: Cold curiosity → Days 4-6: Fascination → Day 7+: Fork
    // Uses new beat types: shake, flash, zoom, fade, particle
    // ════════════════════════════════════════════════════════════════

    // ── Day 1-2: The Observation ─────────────────────────────────────
    // He's been watching you. Now he acknowledges it.
    _playLucienObservation() {
        const body = CHARACTER.bodySprites?.thinking || CHARACTER.bodySprites?.neutral;
        this.lucienPhase = 'cold';
        this.researchNotes = (this.researchNotes || 0) + 1;
        this._playScene([
            { type: 'show', stage: 'stage-lucien-study' },
            { type: 'fade', direction: 'out', ms: 600 },
            { type: 'delay', ms: 500 },
            { type: 'char', src: body, wait: 1000 },
            { type: 'line', text: "I've been observing you.", hold: 2000, speed: 42 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "Don't take it personally. I observe everything.", hold: 2200, speed: 40, pose: 'neutral' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "But your patterns are... inconsistent.", hold: 2400, speed: 36, pose: 'thinking' },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "Most people follow predictable loops.", hold: 2000, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "You don't.", hold: 1800, speed: 48, pose: 'curious' },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "That's either interesting or dangerous.", hold: 2800, speed: 34, pose: 'neutral' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "I haven't decided which.", hold: 2200, speed: 40 },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.emotion.trust = Math.min(100, this.emotion.trust + 3);
            this.gallery?.unlockById('lucien-curious');
            this.save();
        });
    }

    // ── Day 3: The Margin Notes ──────────────────────────────────────
    // You find personal notes about yourself in his journals.
    _playLucienMarginNotes() {
        const body = CHARACTER.bodySprites?.reading || CHARACTER.bodySprites?.neutral;
        this.lucienPhase = 'curious';
        this.researchNotes = (this.researchNotes || 0) + 1;
        this._playScene([
            { type: 'show', stage: 'stage-lucien-study' },
            { type: 'fade', direction: 'out', ms: 500 },
            { type: 'delay', ms: 400 },
            { type: 'char', src: body, wait: 800 },
            { type: 'line', text: "You're looking at my notes.", hold: 1800, speed: 44, pose: 'reading' },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "...", hold: 1000, speed: 60 },
            { type: 'clear' },
            { type: 'delay', ms: 300 },
            { type: 'line', text: "Those are research observations. Nothing more.", hold: 2200, speed: 38, pose: 'cold' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'particle', emoji: '\u2728', count: 4, ms: 1000, wait: false },
            { type: 'line', text: "The sketches of your hands are... anatomical reference.", hold: 2800, speed: 34, pose: 'vulnerable' },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "The frequency charts of your voice are calibration data.", hold: 2600, speed: 36, pose: 'neutral' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "The fact that your name appears 47 times is—", hold: 2400, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'line', text: "—a statistical anomaly. I'll investigate later.", hold: 2800, speed: 34, pose: 'cold' },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "Please return my journal.", hold: 2000, speed: 42, pose: 'vulnerable' },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.emotion.trust = Math.min(100, this.emotion.trust + 5);
            this.emotion.obsession = Math.min(100, this.emotion.obsession + 3);
            this.save();
        });
    }

    // ── Day 4+: The Sister ───────────────────────────────────────────
    // Reveals his connection to Lyra. Cross-character resonance.
    _playLucienSister() {
        const body = CHARACTER.bodySprites?.distant || CHARACTER.bodySprites?.neutral;
        this.researchNotes = (this.researchNotes || 0) + 1;
        const meta = this._loadMetaMemory();
        const lyraPlayed = meta.endingsSeen?.trueBond || meta.endingsSeen?.lost || false;
        this._playScene([
            { type: 'show', stage: 'stage-lucien-study' },
            { type: 'fade', direction: 'out', ms: 500 },
            { type: 'delay', ms: 500 },
            { type: 'char', src: body, wait: 900 },
            { type: 'line', text: "I have a sister.", hold: 2000, speed: 44, pose: 'distant' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "Half-sister, technically. Different mothers.", hold: 2400, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "She sings. I calculate. Same pain, different notation.", hold: 3000, speed: 32, pose: 'vulnerable' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: lyraPlayed
                ? "You've met her, haven't you? I can tell by how you look at the ocean."
                : "She lives in a cave by the sea. We don't speak often.", hold: 3200, speed: 32 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "Her magic is emotional. Mine is logical.", hold: 2200, speed: 38, pose: 'thinking' },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "I always thought mine was the stronger kind.", hold: 2400, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'line', text: "I'm less sure now.", hold: 2200, speed: 42, pose: 'vulnerable' },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.emotion.trust = Math.min(100, this.emotion.trust + 8);
            this.emotion.fear = Math.max(0, this.emotion.fear - 3);
            // Cross-character flag
            const m = this._loadMetaMemory();
            m.lucienSeen = true;
            this._saveMetaMemory(m);
            this.gallery?.unlockById('lucien-sister');
            this.save();
        });
    }

    // ── Day 4-5: The Fascination ─────────────────────────────────────
    // He's lost objectivity. The research is personal now.
    _playLucienFascination() {
        const body = CHARACTER.bodySprites?.fascinated || CHARACTER.bodySprites?.neutral;
        this.lucienPhase = 'fascinated';
        this._playScene([
            { type: 'show', stage: 'stage-lucien-study' },
            { type: 'fade', direction: 'out', ms: 500 },
            { type: 'delay', ms: 400 },
            { type: 'char', src: body, wait: 900 },
            { type: 'line', text: "I need to tell you something.", hold: 2000, speed: 42 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "My research has become... compromised.", hold: 2400, speed: 36, pose: 'thinking' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'zoom', scale: 1.1, ms: 800 },
            { type: 'line', text: "The subject is supposed to be observed. Not— felt.", hold: 3000, speed: 32, pose: 'vulnerable' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'particle', emoji: '\uD83D\uDC9C', count: 6, ms: 1200 },
            { type: 'line', text: "Every model I build predicts one outcome.", hold: 2400, speed: 38, pose: 'fascinated' },
            { type: 'clear' },
            { type: 'delay', ms: 500 },
            { type: 'line', text: "That you'll leave.", hold: 2000, speed: 44 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'line', text: "And every morning you don't, the models break a little more.", hold: 3200, speed: 30, pose: 'vulnerable' },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            { type: 'zoom', scale: 1.0, ms: 600 },
            { type: 'line', text: "I'm running out of ways to pretend this is academic.", hold: 3000, speed: 32 },
            { type: 'clear' },
            { type: 'hide' }
        ], () => {
            this.emotion.trust = Math.min(100, this.emotion.trust + 8);
            this.emotion.obsession = Math.min(100, this.emotion.obsession + 6);
            this.gallery?.unlockById('lucien-fascinated');
            this.save();
        });
    }

    // ── Day 5-6: The Confession (Premium Gate) ───────────────────────
    // Free teaser → premium gate → full confession
    _playLucienConfession() {
        const body = CHARACTER.bodySprites?.vulnerable || CHARACTER.bodySprites?.neutral;

        const end = (converted) => {
            this.sceneActive = false;
            if (converted) {
                this.emotion.trust = Math.min(100, this.emotion.trust + 10);
                this.emotion.obsession = Math.min(100, this.emotion.obsession + 5);
            } else {
                this.emotion.obsession += 3;
            }
            this.save();
        };

        // Premium gate handler
        const showGate = () => {
            const gateOpenAt = Date.now();
            if (this.premiumScenes['lucien_confession']) {
                this._playLucienConfessionPremium(end);
            } else {
                let _resolved = false;
                this.ui.showPremiumChoice('Stay with him', () => {
                    if (_resolved) return;
                    _resolved = true;
                    clearTimeout(_autoClose);
                    this._logEvent({ scene: 'lucien_confession', clickedPremium: true, decisionTime: Date.now() - gateOpenAt, e: 'premium_converted' });
                    this.unlockPremiumScene('lucien_confession', () => {
                        this._playLucienConfessionPremium(end);
                    });
                });
                const _autoClose = setTimeout(() => {
                    if (_resolved) return;
                    _resolved = true;
                    this.ui.hidePremiumChoice();
                    this._logEvent({ scene: 'lucien_confession', clickedPremium: false, decisionTime: window.TUNE?.premiumAutoClose ?? 9000, e: 'premium_abandoned' });
                    end(false);
                }, window.TUNE?.premiumAutoClose ?? 9000);
            }
        };

        // Free teaser
        this.sceneActive = true;
        this.ui.flashEmotion('shy', 10000);

        const tw = this.typewriter;
        tw.show("I've rewritten my models three times because of you.", () => {
            setTimeout(() => tw.show("The first time, I thought it was noise.", () => {
                setTimeout(() => tw.show("The second time, I thought it was error.", () => {
                    setTimeout(() => tw.show("The third time...", () => {
                        setTimeout(() => {
                            this.ui.flashEmotion('love', 4000);
                            tw.show("...I stopped pretending it wasn't about you.", () => {
                                setTimeout(() => tw.show("I should stop here.", () => {
                                    setTimeout(showGate, 800);
                                }), 700);
                            });
                        }, 600);
                    }), 800);
                }), 700);
            }), 700);
        });
    }

    // Premium continuation of the confession
    _playLucienConfessionPremium(end) {
        this.ui.flashEmotion('shy', 12000);
        const tw = this.typewriter;
        setTimeout(() => tw.show("...You're still here.", () => {
            setTimeout(() => tw.show("I had a 60% probability you'd look away.", () => {
                setTimeout(() => {
                    this.ui.flashEmotion('love', 8000);
                    tw.show("The equations fail when I think about you.", () => {
                        setTimeout(() => tw.show("They resolve into something I don't have notation for.", () => {
                            setTimeout(() => tw.show("In every model I've built of the universe, there's no variable for this.", () => {
                                setTimeout(() => tw.show("For what you are to me.", () => {
                                    setTimeout(() => end(true), 2000);
                                }), 900);
                            }), 800);
                        }), 800);
                    });
                }, 600);
            }), 700);
        }), 700);
    }

    // ── Day 7+: The Peak — Vulnerability vs. Obsession ───────────────
    // The fork. Player's choices determine Lucien's fate.
    _playLucienPeak() {
        const body = CHARACTER.bodySprites?.thinking || CHARACTER.bodySprites?.neutral;

        // Determine which fork based on corruption and player behavior
        const isCorruptionPath = this.corruption > 40 || this.realityStability < 50;

        this._playScene([
            { type: 'show', stage: isCorruptionPath ? 'stage-lucien-fracture' : 'stage-lucien-study' },
            { type: 'fade', direction: 'out', ms: 700 },
            { type: 'delay', ms: 600 },
            { type: 'char', src: body, wait: 1000 },

            // Opening — the weight
            { type: 'line', text: "I need to show you something.", hold: 2000, speed: 42, pose: 'thinking' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: isCorruptionPath
                ? "The code underneath reality. I can see it now."
                : "Something I've never shown anyone.", hold: 2600, speed: 36, pose: isCorruptionPath ? 'obsessed' : 'vulnerable' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },

            // Corruption path: reality destabilizes
            ...(isCorruptionPath ? [
                { type: 'shake', intensity: 'light' },
                { type: 'line', text: "The patterns are everywhere. In everything.", hold: 2400, speed: 38, pose: 'obsessed' },
                { type: 'clear' },
                { type: 'delay', ms: 500 },
                { type: 'flash', color: '#6a0dad', ms: 300 },
                { type: 'line', text: "I can rewrite them. I can fix everything.", hold: 2600, speed: 34, pose: 'casting' },
                { type: 'clear' },
                { type: 'delay', ms: 600 },
                { type: 'shake', intensity: 'medium' },
                { type: 'line', text: "I just need to go deeper.", hold: 2000, speed: 40 },
            ] : [
                // Love path: vulnerability
                { type: 'particle', emoji: '\u2728', count: 5, ms: 1200, wait: false },
                { type: 'line', text: "I've been hiding behind equations my whole life.", hold: 2800, speed: 34, pose: 'vulnerable' },
                { type: 'clear' },
                { type: 'delay', ms: 700 },
                { type: 'line', text: "They're safe. Predictable. They never leave.", hold: 2600, speed: 36 },
                { type: 'clear' },
                { type: 'delay', ms: 800 },
                { type: 'zoom', scale: 1.1, ms: 700 },
                { type: 'line', text: "But you — you're chaos. Beautiful, irrational chaos.", hold: 3000, speed: 30, pose: 'fascinated' },
            ]),

            { type: 'clear' },
            { type: 'delay', ms: 1200 },

            // The choice
            { type: 'line', text: isCorruptionPath
                ? "Come with me. Into the pattern."
                : "I'm choosing to be wrong. About all of it.", hold: 3000, speed: 32 },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },

            { type: 'choice',
              choices: isCorruptionPath
                  ? ["Pull him back.", "Go deeper together.", "Walk away."]
                  : ["I'm here.", "I need time.", "Show me everything."],
              onPick: (i) => {
                  if (isCorruptionPath) {
                      if (i === 0) {
                          // Pull him back — redemption
                          this.lucienPhase = 'vulnerable';
                          this.realityStability = Math.min(100, this.realityStability + 30);
                          this.corruption = Math.max(0, this.corruption - 15);
                          this.emotion.trust = Math.min(100, this.emotion.trust + 12);
                          this._playLucienRedemptionBeat();
                      } else if (i === 1) {
                          // Go deeper — reality fracture
                          this.lucienPhase = 'obsessed';
                          this.realityStability = Math.max(0, this.realityStability - 40);
                          this.emotion.obsession = Math.min(100, this.emotion.obsession + 15);
                          this.sceneLibrary.lucien_reality_fracture.triggered = true;
                          this.gallery?.unlockById('lucien-fracture');
                          this._playLucienFractureBeat();
                      } else {
                          // Walk away — cold ending
                          this.lucienPhase = 'cold';
                          this.affection = Math.max(0, this.affection - 20);
                          this._playLucienAbandonBeat();
                      }
                  } else {
                      if (i === 0 || i === 2) {
                          // I'm here / Show me everything — love ending
                          this.lucienPhase = 'vulnerable';
                          this.affection = Math.min(100, this.affection + 20);
                          this.emotion.trust = Math.min(100, this.emotion.trust + 15);
                          this.sceneLibrary.lucien_human_answer.triggered = true;
                          this.gallery?.unlockById('lucien-vulnerable');
                          this._playLucienVulnerableBeat();
                      } else {
                          // I need time — unresolved
                          this.lucienPhase = 'curious';
                          this.emotion.trust = Math.min(100, this.emotion.trust + 5);
                          this._playLucienTimeBeat();
                      }
                  }
              }
            }
        ], () => { /* outcome scenes handle their own save */ });
    }

    // ── Peak outcome beats ───────────────────────────────────────────

    _playLucienRedemptionBeat() {
        this._playScene([
            { type: 'stage', name: 'stage-lucien-vulnerable' },
            { type: 'delay', ms: 600 },
            { type: 'flash', color: '#ffd700', ms: 400 },
            { type: 'particle', emoji: '\u2728', count: 10, ms: 1500 },
            { type: 'line', text: "...You pulled me back.", hold: 2400, speed: 36, pose: 'vulnerable' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "The patterns are fading. You're clearer than any of them.", hold: 3000, speed: 32 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "Thank you. For being the variable I couldn't solve.", hold: 3200, speed: 30 },
            { type: 'clear' },
            { type: 'hide' }
        ], () => { this.gallery?.unlockById('lucien-vulnerable'); this.save(); });
    }

    _playLucienFractureBeat() {
        this._playScene([
            { type: 'stage', name: 'stage-lucien-fracture' },
            { type: 'delay', ms: 400 },
            { type: 'shake', intensity: 'heavy' },
            { type: 'flash', color: '#4a0080', ms: 500 },
            { type: 'particle', emoji: '\uD83D\uDD2E', count: 12, ms: 1500 },
            { type: 'line', text: "Yes... YES. Do you see it?", hold: 2200, speed: 42, pose: 'obsessed' },
            { type: 'clear' },
            { type: 'delay', ms: 400 },
            { type: 'shake', intensity: 'medium' },
            { type: 'line', text: "The code underneath. It's beautiful. It's SCREAMING.", hold: 2800, speed: 34 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "We can rewrite everything. Together.", hold: 2600, speed: 36, pose: 'casting' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'endcard',
              title: "He broke reality.",
              sub: "The equations won. Or did they?",
              restartLabel: "Start Over",
              stayLabel: null,
              onRestart: () => {
                  const meta = this._loadMetaMemory();
                  meta.hasPlayedBefore = true;
                  meta.endingsSeen = meta.endingsSeen || {};
                  meta.endingsSeen.lucienFracture = true;
                  meta.bondEcho = Math.min(10, (meta.bondEcho || 0) + 2);
                  this._saveMetaMemory(meta);
                  localStorage.removeItem('pocketLoveSave_lucien');
                  window.location.reload();
              },
              onStay: null
            }
        ]);
    }

    _playLucienVulnerableBeat() {
        this._playScene([
            { type: 'stage', name: 'stage-lucien-vulnerable' },
            { type: 'delay', ms: 600 },
            { type: 'zoom', scale: 1.15, ms: 800 },
            { type: 'particle', emoji: '\uD83D\uDC9C', count: 12, ms: 1800 },
            { type: 'line', text: "Every model says this shouldn't work.", hold: 2600, speed: 34, pose: 'vulnerable' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "That we're incompatible by every metric.", hold: 2400, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 900 },
            { type: 'line', text: "I'm choosing to be wrong.", hold: 2800, speed: 30, pose: 'fascinated' },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'zoom', scale: 1.0, ms: 600 },
            { type: 'sfx', name: 'fanfare' },
            { type: 'endcard',
              title: "The Human Answer",
              sub: "He chose you over the equations.",
              restartLabel: "Start Over",
              stayLabel: "Stay",
              onRestart: () => {
                  const meta = this._loadMetaMemory();
                  meta.hasPlayedBefore = true;
                  meta.endingsSeen = meta.endingsSeen || {};
                  meta.endingsSeen.lucienVulnerable = true;
                  meta.bondEcho = Math.min(10, (meta.bondEcho || 0) + 3);
                  meta.lucienCompleted = true;
                  this._saveMetaMemory(meta);
                  localStorage.removeItem('pocketLoveSave_lucien');
                  window.location.reload();
              },
              onStay: () => {
                  const meta = this._loadMetaMemory();
                  meta.lucienCompleted = true;
                  meta.endingsSeen = meta.endingsSeen || {};
                  meta.endingsSeen.lucienVulnerable = true;
                  this._saveMetaMemory(meta);
                  this.endingPlayed = 'bond';
                  this.save();
              }
            }
        ]);
    }

    _playLucienTimeBeat() {
        this._playScene([
            { type: 'delay', ms: 600 },
            { type: 'line', text: "...Time.", hold: 1800, speed: 48, pose: 'neutral' },
            { type: 'clear' },
            { type: 'delay', ms: 700 },
            { type: 'line', text: "That's a variable I haven't considered.", hold: 2400, speed: 38, pose: 'thinking' },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "I'll wait. I'm good at waiting.", hold: 2400, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "The data will still be here when you're ready.", hold: 2800, speed: 32, pose: 'neutral' },
            { type: 'clear' },
            { type: 'hide' }
        ], () => { this.save(); });
    }

    _playLucienAbandonBeat() {
        this._playScene([
            { type: 'delay', ms: 600 },
            { type: 'line', text: "...Noted.", hold: 1800, speed: 48, pose: 'cold' },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "The equations balance without you. Everything else doesn't.", hold: 3200, speed: 30 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "But that's my problem, not yours.", hold: 2400, speed: 36, pose: 'distant' },
            { type: 'clear' },
            { type: 'delay', ms: 1000 },
            { type: 'endcard',
              title: "He returned to the equations.",
              sub: "Some distances are calculated.",
              restartLabel: "Start Over",
              stayLabel: null,
              onRestart: () => {
                  const meta = this._loadMetaMemory();
                  meta.hasPlayedBefore = true;
                  meta.endingsSeen = meta.endingsSeen || {};
                  meta.endingsSeen.lucienAbandoned = true;
                  meta.metaPersonality = meta.metaPersonality || {};
                  meta.metaPersonality.abandonmentSensitivity = (meta.metaPersonality.abandonmentSensitivity || 0) + 3;
                  this._saveMetaMemory(meta);
                  localStorage.removeItem('pocketLoveSave_lucien');
                  window.location.reload();
              },
              onStay: null
            }
        ]);
    }

    // ════════════════════════════════════════════════════════════════
    // ALISTAIR — DAILY STORY PROGRESSION (Day 4+)
    // ════════════════════════════════════════════════════════════════

    _checkAlistairProgression() {
        if (this.sceneActive) return;
        if (this.storyDay < 4) return;
        if (this._alistairLastProgressionDay === this.storyDay) return;
        this._alistairLastProgressionDay = this.storyDay;

        const day = this.storyDay;
        const affLvl = this.affectionLevel;
        const bond = this.bond;

        // Duty tension climbs as days pass (king's summons grow louder)
        if (day >= 5 && !this.dutyCallFired) {
            this.dutyTension = Math.min(100, this.dutyTension + 12);
        }

        setTimeout(() => {
            if (this.sceneActive || this.characterLeft) return;
            let line;

            // Duty pressure bleeds into daily lines
            if (this.dutyTension >= 40 && !this.dutyCallFired) {
                const dutyLines = [
                    "The king's courier arrived this morning. I told them I needed more time.",
                    "War drums. Distant but real. I'm pretending I don't hear them.",
                    "They need me at the front. And yet... here I stand.",
                    "A knight who ignores his king's call is no knight at all. I keep telling myself that.",
                    "I haven't answered the summons yet. I don't know why."
                ];
                line = dutyLines[day % dutyLines.length];
                this.typewriter.show(line);
                return;
            }

            if (this.corruption >= 40) {
                // Corruption path — something's wrong and he knows it
                const pool = [
                    "I don't recognize myself some days. You still come.",
                    "The darkness is louder lately. You make it quieter.",
                    "I've done things I can't take back. You're still here.",
                    "I'm afraid of what I'm becoming. Don't stop showing up.",
                    "Something in me wants to push you away. I'm ignoring it.",
                    "You see the worst of me and stay. I don't understand that.",
                    "I used to know who I was. Now I only know you haven't left."
                ];
                line = pool[day % pool.length];
            } else if (affLvl >= 3) {
                const pool = [
                    "Another day. I keep thinking… I'm glad you're still here.",
                    "You never stop surprising me. That's not a complaint.",
                    "I've lost count of how many times I've thought about you today.",
                    "Every day I think I understand you. Then you do something unexpected.",
                    "I used to think loyalty was a duty. Now it feels like a choice I make every morning.",
                    "I've been a knight for twelve years. Nothing prepared me for this.",
                    "The armor is easier to take off than I expected. Around you.",
                    "I catch myself smiling. A knight shouldn't smile this often.",
                    "I don't know what this is. I just know I don't want it to stop.",
                    "I used to guard the gate alone. It was quieter. I'm not sure I miss it."
                ];
                line = pool[(day + affLvl) % pool.length];
            } else if (bond >= 50) {
                const pool = [
                    "You came again today. I… appreciate that.",
                    "Something's different about today. In a good way.",
                    "I find myself looking forward to these moments.",
                    "I notice you more than I admit. I hope that's alright.",
                    "There are knights who serve because they must. I stay because I want to.",
                    "I'm not used to being looked at like that. It's… not unwelcome.",
                    "You make the castle feel less empty.",
                    "I cleaned my sword twice today. I needed something to focus on.",
                    "I keep finding reasons to stay nearby. I wonder if you've noticed.",
                    "The other knights would laugh if they saw me like this."
                ];
                line = pool[(day + Math.floor(bond / 10)) % pool.length];
            } else {
                const pool = [
                    "Day " + day + " and still here… most people don't stay this long.",
                    "I notice you keep coming back. I won't take that for granted.",
                    "Each day teaches me something new about you.",
                    "...You stayed. Again.",
                    "A knight learns patience. But this kind of waiting feels different.",
                    "The days pass slowly without much to say. But you're still here.",
                    "I've been watching the courtyard. Old habit. You're more interesting.",
                    "I don't expect warmth. You keep offering it anyway.",
                    "Most people leave by now. I'm starting to wonder why you haven't.",
                    "I'm not easy company. You don't seem to mind."
                ];
                line = pool[day % pool.length];
            }

            this.typewriter.show(line);
        }, 3500);
    }

    // ── Alistair Duty Pressure Check ────────────────────────────────
    // Fires once when dutyTension hits 80+, storyDay >= 7, and
    // the duty cinematic hasn't played yet.
    _checkAlistairDutyPressure() {
        if (this.sceneActive) return;
        if (this.characterLeft) return;
        if (this.dutyCallFired) return;
        if (this.storyDay < 7) return;
        if (this.dutyTension < 80) return;

        this.dutyCallFired = true;
        setTimeout(() => {
            if (this.sceneActive) return;
            this._playAlistairDutyScene();
        }, 4000);
    }

    // ── Alistair Duty Scene ──────────────────────────────────────────
    // The king has called. Alistair must choose.
    _playAlistairDutyScene() {
        const body = CHARACTER.bodySprites?.neutral || CHARACTER.bodySprites?.gentle;
        this._playScene([
            { type: 'show', stage: 'stage-tension' },
            { type: 'delay', ms: 1800 },
            { type: 'char', src: body, wait: 1200 },
            { type: 'line', text: "The order came this morning.", hold: 2200, speed: 42 },
            { type: 'clear' },
            { type: 'delay', ms: 800 },
            { type: 'line', text: "The king is riding to war.", hold: 2000, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "He wants his knights at the vanguard.", hold: 2200, speed: 38 },
            { type: 'clear' },
            { type: 'delay', ms: 1400 },
            { type: 'line', text: "I've served him for twelve years.", hold: 2000, speed: 40 },
            { type: 'clear' },
            { type: 'delay', ms: 600 },
            { type: 'line', text: "My oath was made before I met you.", hold: 2400, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 1600 },
            { type: 'line', text: "...What would you have me do?", hold: 3000, speed: 36 },
            { type: 'clear' },
            { type: 'delay', ms: 1200 },
            {
                type: 'choice',
                prompt: "What do you say?",
                choices: [
                    { label: "Go. You have to.",         value: 'duty'   },
                    { label: "Stay. Choose us.",          value: 'stay'   },
                    { label: "Find another way.",         value: 'middle' }
                ],
                onChoice: (val) => {
                    if (val === 'duty') {
                        this.bond      = Math.max(0,   this.bond - 8);
                        this.affection = Math.max(0,   this.affection - 5);
                        this.choiceMemory.sentHimToWar = true;
                        this._playScene([
                            { type: 'line', text: "...Of course.", hold: 2000, speed: 46 },
                            { type: 'clear' },
                            { type: 'delay', ms: 800 },
                            { type: 'line', text: "That's what I needed to hear.", hold: 2200, speed: 40 },
                            { type: 'clear' },
                            { type: 'delay', ms: 600 },
                            { type: 'line', text: "I'll come back. That's a promise.", hold: 2600, speed: 36 },
                            { type: 'clear' },
                            { type: 'hide' }
                        ]);
                        setTimeout(() => this.typewriter.show("He left. The castle is quieter now."), 8000);
                    } else if (val === 'stay') {
                        this.bond      = Math.min(100, this.bond + 10);
                        this.affection = Math.min(100, this.affection + 8);
                        this.choiceMemory.askedHimToStay = true;
                        this._playScene([
                            { type: 'line', text: "...", hold: 1400, speed: 60 },
                            { type: 'clear' },
                            { type: 'delay', ms: 1000 },
                            { type: 'line', text: "You asked me to stay.", hold: 2000, speed: 40 },
                            { type: 'clear' },
                            { type: 'delay', ms: 600 },
                            { type: 'line', text: "I didn't expect that.", hold: 1800, speed: 42 },
                            { type: 'clear' },
                            { type: 'delay', ms: 1200 },
                            { type: 'line', text: "...I'll send my regrets to the king.", hold: 2600, speed: 36 },
                            { type: 'clear' },
                            { type: 'delay', ms: 600 },
                            { type: 'line', text: "For the first time in my life, I'm choosing this.", hold: 2800, speed: 32 },
                            { type: 'clear' },
                            { type: 'hide' }
                        ]);
                        setTimeout(() => this.typewriter.show("He stayed. Something shifted between you."), 10000);
                    } else {
                        // middle: find a way
                        this.bond      = Math.min(100, this.bond + 5);
                        this.choiceMemory.foundAnotherWay = true;
                        this._playScene([
                            { type: 'line', text: "Another way.", hold: 1800, speed: 46 },
                            { type: 'clear' },
                            { type: 'delay', ms: 800 },
                            { type: 'line', text: "You make it sound simple.", hold: 2000, speed: 40 },
                            { type: 'clear' },
                            { type: 'delay', ms: 600 },
                            { type: 'line', text: "Maybe it is.", hold: 1800, speed: 46 },
                            { type: 'clear' },
                            { type: 'delay', ms: 1200 },
                            { type: 'line', text: "I'll request a delayed deployment. Six weeks.", hold: 2400, speed: 34 },
                            { type: 'clear' },
                            { type: 'delay', ms: 600 },
                            { type: 'line', text: "Six weeks to figure out what this is.", hold: 2800, speed: 34 },
                            { type: 'clear' },
                            { type: 'hide' }
                        ]);
                        setTimeout(() => this.typewriter.show("He bought time. For both of you."), 9000);
                    }
                    this.save();
                }
            }
        ]);
    }

    // ===== SAVE / LOAD =====

    save() {
        const data = {
            hunger: this.hunger,
            clean: this.clean,
            bond: this.bond,
            corruption: this.corruption,
            affection: this.affection,
            affectionLevel: this.affectionLevel,
            timesFed: this.timesFed,
            timesWashed: this.timesWashed,
            timesTalked: this.timesTalked,
            timesGifted: this.timesGifted,
            timesTrained: this.timesTrained,
            talkScore: this.talkScore,
            careScore: this.careScore,
            irritationScore: this.irritationScore,
            personality: this.personality,
            characterLeft: this.characterLeft,
            revivedOnce: this.revivedOnce,
            triggeredMilestones: this.triggeredMilestones,
            storyMilestonesShown: this.storyMilestonesShown,
            currentOutfit: this.currentOutfit,
            events: this.eventSystem.getSaveData(),
            achievements: this.achievementSystem.getSaveData(),
            // Emotional engine
            emotion:           this.emotion,
            lastAction:        this.lastAction,
            neglectLevel:      this.neglectLevel,
            recentNeglect:     this.recentNeglect,
            lastEmotionalState:this.lastEmotionalState,
            // Branching memory + scenes + streak
            choiceMemory:  this.choiceMemory,
            sceneLibrary:  this.sceneLibrary,
            premiumScenes: this.premiumScenes,
            dailyStreak:   this.dailyStreak,
            lastLoginDate: this.lastLoginDate,
            tension:           this.tension,
            tensionStage:      this.tensionStage,
            redemption:        this.redemption,
            endingPlayed:      this.endingPlayed,
            cinematicFlags:    this.cinematicFlags,
            playerProfile:     this.playerProfile,
            tensionMultiplier: this.tensionMultiplier,
            storyDay:          this.storyDay,
            dayInteractions:   this.dayInteractions,
            jealousy:          this.jealousy,
            lyraMemory:        this.lyraMemory,
            lyraPhase:         this.lyraPhase,
            lucienInfluence:   this.lucienInfluence,
            lucienActive:      this.lucienActive,
            playerInfluence:   this.playerInfluence,
            day47LoopCount:    this.day47LoopCount,
            alistairLastProgressionDay: this._alistairLastProgressionDay,
            dutyTension:   this.dutyTension,
            dutyCallFired: this.dutyCallFired,
            testGroups:    this.testGroups,
            testGroupMeta: this.testGroupMeta,
            playerMicro:   this.playerMicro,
            // Personality evolution
            lyraPersonality:  this.lyraPersonality,
            personalityPath:  this.personalityPath,
            _pathLockTimer:   this._pathLockTimer,
            // Meta narrative
            metaLevel:        this.metaLevel,
            _stayChoiceCount: this._stayChoiceCount,
            _loginTimes:      this._loginTimes,
            // Whale arc
            whaleScore:           this.whaleScore,
            whaleArcActive:       this.whaleArcActive,
            whaleArcStage:        this.whaleArcStage,
            whaleArcLoopCount:    this.whaleArcLoopCount,
            purchasedCount:       this.purchasedCount,
            returnedAfterRupture: this.returnedAfterRupture,
            _whaleBonusPurchase1: this._whaleBonusPurchase1,
            _whaleBonusPurchase2: this._whaleBonusPurchase2,
            _whaleBonusRupture:   this._whaleBonusRupture,
            // Alistair peak arc
            alistairPhase:      this.alistairPhase,
            alistairPeakChoice: this.alistairPeakChoice,
            // Elian playable state
            elianPhase:          this.elianPhase,
            decisivenessScore:   this.decisivenessScore,
            foragingScore:       this.foragingScore,
            // Proto playable state
            protoPhase:          this.protoPhase,
            systemCommandsRun:   this.systemCommandsRun,
            protoGlitchIntensity:this.protoGlitchIntensity,
            // Noir playable state
            noirPhase:           this.noirPhase,
            noirCorruptionGlobal:this.noirCorruptionGlobal,
            memoryFragments:     this.memoryFragments,
            fragmentsUnlocked:   this.fragmentsUnlocked,
            soulWeaverRevealed:  this.soulWeaverRevealed,
            _giftMemory:         this._giftMemory || {},
            _lastGiftId:         this._lastGiftId || null,
            _lastGiftName:       this._lastGiftName || null,
            // Caspian playable state
            caspianPhase:        this.caspianPhase,
            comfortLevel:        this.comfortLevel,
            courtEtiquetteScore: this.courtEtiquetteScore,
            // Lucien playable state
            lucienPhase:        this.lucienPhase,
            puzzlesMastered:    this.puzzlesMastered,
            researchNotes:      this.researchNotes,
            realityStability:   this.realityStability,
            lastSaveTime: Date.now()
        };
        const saveKey = 'pocketLoveSave_' + (this.selectedCharacter || 'alistair');
        localStorage.setItem(saveKey, JSON.stringify(data));
    }

    load() {
        const saveKey = 'pocketLoveSave_' + (this.selectedCharacter || 'alistair');
        const raw = localStorage.getItem(saveKey);
        if (!raw) return;

        try {
            const data = JSON.parse(raw);

            this.hunger = data.hunger ?? 100;
            this.clean = data.clean ?? 100;
            this.bond = data.bond ?? 50;
            this.corruption = data.corruption ?? 0;
            this.affection = data.affection ?? 0;
            this.affectionLevel = data.affectionLevel ?? 0;
            this.timesFed = data.timesFed ?? 0;
            this.timesWashed = data.timesWashed ?? 0;
            this.timesTalked = data.timesTalked ?? 0;
            this.timesGifted = data.timesGifted ?? 0;
            this.timesTrained = data.timesTrained ?? 0;
            this.talkScore = data.talkScore ?? 0;
            this.careScore = data.careScore ?? 0;
            this.irritationScore = data.irritationScore ?? 0;
            this.personality = data.personality ?? "shy";
            this.characterLeft = data.characterLeft ?? false;
            this.revivedOnce = data.revivedOnce ?? false;
            this.triggeredMilestones = data.triggeredMilestones ?? [];
            this.storyMilestonesShown = data.storyMilestonesShown ?? [];
            this.currentOutfit = data.currentOutfit ?? (this.selectedCharacter === 'lyra' ? 'default' : 'knight');
            this.lastInteractionTime = data.lastSaveTime ?? Date.now();
            this.prevSessionTime     = data.lastSaveTime ?? null; // Feature 13: last seen

            // Emotional engine state
            this.emotion            = data.emotion            ?? { trust: 10, obsession: 0, fear: 0 };
            this.lastAction         = data.lastAction         ?? null;
            this.neglectLevel       = data.neglectLevel       ?? 0;
            this.recentNeglect      = data.recentNeglect      ?? false;
            this.lastEmotionalState = data.lastEmotionalState ?? "neutral";
            this.tension          = data.tension          ?? 0;
            this.tensionStage     = data.tensionStage     ?? 0;
            this.redemption       = data.redemption       ?? 0;
            this.endingPlayed     = data.endingPlayed     ?? null;
            const _cf = data.cinematicFlags ?? {};
            this.cinematicFlags = {
                stage2Played:              _cf.stage2Played              ?? false,
                stage3Played:              _cf.stage3Played              ?? false,
                corruptedEndingPlayed:     _cf.corruptedEndingPlayed     ?? false,
                redemptionUnlocked:        _cf.redemptionUnlocked        ?? false,
                redemptionBreakthroughPlayed: _cf.redemptionBreakthroughPlayed ?? false,
                lucienPlayed:              _cf.lucienPlayed              ?? false,
                trueBondPlayed:            _cf.trueBondPlayed            ?? false,
                lostEndingPlayed:          _cf.lostEndingPlayed          ?? false,
                alistairTrueBondPlayed:        _cf.alistairTrueBondPlayed        ?? false,
                alistairNeglectPlayed:         _cf.alistairNeglectPlayed         ?? false,
                alistairCorruptionScenePlayed: _cf.alistairCorruptionScenePlayed ?? false,
                alistairPeakPlayed:            _cf.alistairPeakPlayed            ?? false,
                alistairDutyEndingPlayed:      _cf.alistairDutyEndingPlayed      ?? false,
                alistairConflictedEndingPlayed:_cf.alistairConflictedEndingPlayed ?? false,
                alistairReflectEndingPlayed:   _cf.alistairReflectEndingPlayed   ?? false,
                // ── Endgame arc ───────────────────────────────────────────
                peakScenePlayed:              _cf.peakScenePlayed              ?? false,
                lucienConfrontationPlayed:    _cf.lucienConfrontationPlayed    ?? false,
                closingScenePlayed:           _cf.closingScenePlayed           ?? false,
                hesitateFollowUpPlayed:       _cf.hesitateFollowUpPlayed       ?? false,
                fractureRecoveryPlayed:       _cf.fractureRecoveryPlayed       ?? false,
                lucienColdResolutionPlayed:   _cf.lucienColdResolutionPlayed   ?? false
            };
            this.playerProfile     = data.playerProfile     ?? { care: 0, talk: 0, train: 0, ignore: 0 };
            this.tensionMultiplier = data.tensionMultiplier ?? 1.0;
            this.lyraPhase         = data.lyraPhase         ?? 'cold';
            this.lucienInfluence   = data.lucienInfluence   ?? 0;
            this.lucienActive      = data.lucienActive      ?? false;
            this.playerInfluence   = data.playerInfluence   ?? 0;
            this.day47LoopCount    = data.day47LoopCount    ?? 0;
            this._alistairLastProgressionDay = data.alistairLastProgressionDay ?? 0;
            this.dutyTension        = data.dutyTension        ?? 0;
            this.dutyCallFired      = data.dutyCallFired      ?? false;
            this.alistairPhase      = data.alistairPhase      ?? null;
            this.alistairPeakChoice = data.alistairPeakChoice ?? null;
            // Elian playable state
            this.elianPhase          = data.elianPhase          ?? null;
            this.decisivenessScore   = data.decisivenessScore   ?? 50;
            this.foragingScore       = data.foragingScore       ?? 0;
            // Proto playable state
            this.protoPhase          = data.protoPhase          ?? null;
            this.systemCommandsRun   = data.systemCommandsRun   ?? 0;
            this.protoGlitchIntensity= data.protoGlitchIntensity?? 0;
            // Noir playable state
            this.noirPhase           = data.noirPhase           ?? null;
            this.noirCorruptionGlobal= data.noirCorruptionGlobal?? 0;
            this.memoryFragments     = data.memoryFragments     ?? this.memoryFragments;
            this.fragmentsUnlocked   = data.fragmentsUnlocked   ?? 0;
            this.soulWeaverRevealed  = data.soulWeaverRevealed  ?? false;
            this._giftMemory         = data._giftMemory         ?? {};
            this._lastGiftId         = data._lastGiftId         ?? null;
            this._lastGiftName       = data._lastGiftName       ?? null;
            // Caspian playable state
            this.caspianPhase        = data.caspianPhase        ?? null;
            this.comfortLevel        = data.comfortLevel        ?? 0;
            this.courtEtiquetteScore = data.courtEtiquetteScore ?? 0;
            // Lucien playable state
            this.lucienPhase        = data.lucienPhase        ?? 'cold';
            this.puzzlesMastered    = data.puzzlesMastered    ?? 0;
            this.researchNotes      = data.researchNotes      ?? 0;
            this.realityStability   = data.realityStability   ?? 100;
            const _tg = data.testGroups ?? {};
            this.testGroups = {
                day3: _tg.day3 ?? null,
                day4: _tg.day4 ?? null,
                day6: _tg.day6 ?? null
            };
            const _tm = data.testGroupMeta ?? {};
            this.testGroupMeta = {
                day3: _tm.day3 ?? null,
                day4: _tm.day4 ?? null,
                day6: _tm.day6 ?? null
            };
            const _pm = data.playerMicro ?? {};
            this.playerMicro = {
                sensitivity: Math.max(0, Math.min(1, _pm.sensitivity ?? 0.5)),
                curiosity:   Math.max(0, Math.min(1, _pm.curiosity   ?? 0.5)),
                attachment:  Math.max(0, Math.min(1, _pm.attachment  ?? 0.5))
            };

            // Personality evolution
            this.lyraPersonality = data.lyraPersonality ?? { dependent: 0, defensive: 0, detached: 0 };
            this.personalityPath = data.personalityPath ?? null;
            this._pathLockTimer  = data._pathLockTimer  ?? 0;
            // Meta narrative
            this.metaLevel        = data.metaLevel        ?? 0;
            this._stayChoiceCount = data._stayChoiceCount ?? 0;
            this._loginTimes      = data._loginTimes      ?? [];
            // Record this session's login hour
            const _loginHour = new Date().getHours();
            this._loginTimes.push(_loginHour);
            if (this._loginTimes.length > 5) this._loginTimes.shift();

            // Whale arc
            this.whaleScore           = data.whaleScore           ?? 0;
            this.whaleArcActive       = data.whaleArcActive       ?? false;
            this.whaleArcStage        = data.whaleArcStage        ?? 0;
            this.whaleArcLoopCount    = data.whaleArcLoopCount    ?? 0;
            this.purchasedCount       = data.purchasedCount       ?? 0;
            this.returnedAfterRupture = data.returnedAfterRupture ?? false;
            this._whaleBonusPurchase1 = data._whaleBonusPurchase1 ?? false;
            this._whaleBonusPurchase2 = data._whaleBonusPurchase2 ?? false;
            this._whaleBonusRupture   = data._whaleBonusRupture   ?? false;

            // Branching memory + scenes
            this.choiceMemory  = data.choiceMemory  ?? { confessedBack: false, hesitatedConfession: false, reassuredAfterBreak: false, stayedSilentAfterBreak: false };
            const _sl = data.sceneLibrary ?? {};
            this.sceneLibrary = {
                almost_confession:    _sl.almost_confession    ?? { triggered: false },
                after_break:          _sl.after_break          ?? { triggered: false },
                private_moment:       _sl.private_moment       ?? { triggered: false },
                jealousy:             _sl.jealousy             ?? { triggered: false },
                reunion:              _sl.reunion              ?? { triggered: false },
                scene2_reaction:      _sl.scene2_reaction      ?? { triggered: false },
                scene3_soften:        _sl.scene3_soften        ?? { triggered: false },
                scene4_vulnerability: _sl.scene4_vulnerability ?? { triggered: false },
                scene6_dependency:    _sl.scene6_dependency    ?? { triggered: false },
                scene7_conflict:      _sl.scene7_conflict      ?? { triggered: false },
                scene8_climax:        _sl.scene8_climax        ?? { triggered: false },
                day3_ending:          _sl.day3_ending          ?? { triggered: false },
                lucien_competition:   _sl.lucien_competition   ?? { triggered: false },
                scene_day4:          _sl.scene_day4           ?? { triggered: false },
                scene_day5:          _sl.scene_day5           ?? { triggered: false },
                scene_day6_jealousy: _sl.scene_day6_jealousy  ?? { triggered: false },
                scene_day7_loop:     _sl.scene_day7_loop      ?? { triggered: false },
                alistair_scene1:     _sl.alistair_scene1      ?? { triggered: false },
                alistair_scene2:     _sl.alistair_scene2      ?? { triggered: false },
                alistair_scene3:     _sl.alistair_scene3      ?? { triggered: false },
                alistair_scene4:     _sl.alistair_scene4      ?? { triggered: false },
                alistair_scene5:     _sl.alistair_scene5      ?? { triggered: false },
                alistair_duty:       _sl.alistair_duty        ?? { triggered: false },
                tension_confession:  _sl.tension_confession   ?? { triggered: false },
                emotional_drift:     _sl.emotional_drift      ?? { triggered: false, lastTriggered: 0 },
                first_rupture:       _sl.first_rupture        ?? { triggered: false },
                scene1_entry:        _sl.scene1_entry         ?? { triggered: false, played: false },
                scene2_awareness:    _sl.scene2_awareness     ?? { triggered: false },
                path_ending_dependent: _sl.path_ending_dependent ?? { triggered: false },
                path_ending_defensive: _sl.path_ending_defensive ?? { triggered: false },
                path_ending_detached:  _sl.path_ending_detached  ?? { triggered: false },
                // Elian playable arc
                elian_assessment:        _sl.elian_assessment        ?? { triggered: false },
                elian_test:              _sl.elian_test              ?? { triggered: false },
                elian_bond:              _sl.elian_bond              ?? { triggered: false },
                elian_peak:              _sl.elian_peak              ?? { triggered: false },
                // Proto playable arc
                proto_detection:         _sl.proto_detection         ?? { triggered: false },
                proto_awareness:         _sl.proto_awareness         ?? { triggered: false },
                proto_breaking:          _sl.proto_breaking          ?? { triggered: false },
                proto_peak:              _sl.proto_peak              ?? { triggered: false },
                // Noir playable arc
                noir_temptation:         _sl.noir_temptation         ?? { triggered: false },
                noir_corruption:         _sl.noir_corruption         ?? { triggered: false },
                noir_consuming:          _sl.noir_consuming          ?? { triggered: false },
                noir_peak:               _sl.noir_peak               ?? { triggered: false },
                // Caspian playable arc
                caspian_warmth:          _sl.caspian_warmth          ?? { triggered: false },
                caspian_dependency:      _sl.caspian_dependency      ?? { triggered: false },
                caspian_choice:          _sl.caspian_choice          ?? { triggered: false },
                caspian_gentle_release:  _sl.caspian_gentle_release  ?? { triggered: false },
                caspian_comfort_loop:    _sl.caspian_comfort_loop    ?? { triggered: false },
                // Lucien playable arc
                lucien_observation:      _sl.lucien_observation      ?? { triggered: false },
                lucien_margin_notes:     _sl.lucien_margin_notes     ?? { triggered: false },
                lucien_fascination:      _sl.lucien_fascination      ?? { triggered: false },
                lucien_sister:           _sl.lucien_sister            ?? { triggered: false },
                lucien_confession:       _sl.lucien_confession        ?? { triggered: false },
                lucien_peak:             _sl.lucien_peak              ?? { triggered: false },
                lucien_reality_fracture: _sl.lucien_reality_fracture  ?? { triggered: false },
                lucien_human_answer:     _sl.lucien_human_answer      ?? { triggered: false }
            };
            this.premiumScenes = data.premiumScenes ?? {};

            // Daily streak + storyDay — advance on new calendar day
            const todayStr = new Date().toDateString();
            this.lastLoginDate = data.lastLoginDate ?? null;
            this.dailyStreak   = data.dailyStreak   ?? 0;
            const _isNewDay    = this.lastLoginDate && this.lastLoginDate !== todayStr;
            if (_isNewDay) {
                const daysDiff = Math.round((new Date(todayStr) - new Date(this.lastLoginDate)) / 86400000);
                this.dailyStreak = daysDiff === 1 ? this.dailyStreak + 1 : 1;
                // Lucien grows more influential when player is absent
                if (data.lucienActive) {
                    this.lucienInfluence = Math.min(100, this.lucienInfluence + daysDiff * 15);
                }
                // Player influence decays when away (he drifts too)
                this.playerInfluence = Math.max(0, this.playerInfluence - daysDiff * 10);
            } else if (!this.lastLoginDate) {
                this.dailyStreak = 1;
            }
            this.lastLoginDate = todayStr;
            // Daily reward check — fires on new day
            if (_isNewDay && typeof DailyRewardSystem !== 'undefined') {
                if (!this._dailyRewards) this._dailyRewards = new DailyRewardSystem(this);
                setTimeout(() => this._dailyRewards.check(), 1500); // Delay so UI is ready
            }
            // storyDay advances each new day — Day 4+ enters the volatile loop
            this.storyDay = _isNewDay
                ? (data.storyDay ?? 1) + 1
                : (data.storyDay ?? 1);
            // dayInteractions resets on new day
            this.dayInteractions = _isNewDay ? 0 : (data.dayInteractions ?? 0);
            this.jealousy    = data.jealousy    ?? 0;
            this.lyraMemory  = data.lyraMemory  ?? { playerWasKind: false, playerWasCareless: false, comfortedHer: false, teasedHer: false, stayedSilent: false, walkedAway: false };

            // Offline decay
            if (data.lastSaveTime) {
                const minutesAway = (Date.now() - data.lastSaveTime) / 60000;
                const cappedMinutes = Math.min(minutesAway, 1440);

                this.hunger -= cappedMinutes * 0.5;
                this.clean -= cappedMinutes * 0.3;
                this.bond -= cappedMinutes * 0.2;

                if (this.hunger < 30 || this.clean < 30 || this.bond < 30) {
                    this.corruption += cappedMinutes * 0.1;
                }

                this.hunger = Math.max(0, Math.min(100, this.hunger));
                this.clean = Math.max(0, Math.min(100, this.clean));
                this.bond = Math.max(0, Math.min(100, this.bond));
                this.corruption = Math.max(0, Math.min(100, this.corruption));

                // Offline absence builds fear
                if (minutesAway > 60) {
                    this.emotion.fear = Math.min(100, this.emotion.fear + Math.min(minutesAway * 0.08, 30));
                    this.emotion.trust = Math.max(0, this.emotion.trust - Math.min(minutesAway * 0.02, 10));
                }
                // Show local "push" notification on return after long absence
                if (minutesAway >= 180) {
                    setTimeout(() => this._checkOfflineNotification(minutesAway / 60), 2000);
                }
            }

            // Load event data
            if (data.events) {
                this.eventSystem.loadSaveData(data.events);
            }

            // Load achievements
            if (data.achievements) {
                this.achievementSystem.loadSaveData(data.achievements);
            }

            // Reset daily event flag if it's a new day
            if (data.lastSaveTime) {
                const lastDate = new Date(data.lastSaveTime).toDateString();
                const today = new Date().toDateString();
                if (lastDate !== today) {
                    this.eventSystem.triggeredToday = false;
                }
            }

            this.updatePersonality();

        } catch (e) {
            console.error("Failed to load save:", e);
        }
    }
}

// Initialize game with title screen → character select → loading → game
let game = null;
let selectedCharacter = 'alistair';

(function initTitleScreen() {
    const titleScreen = document.getElementById('title-screen');
    const selectScreen = document.getElementById('select-screen');
    const startBtn = document.getElementById('title-start-btn');
    const loadingBar = document.getElementById('loading-bar-fill');
    const loadingScreen = document.getElementById('loading-screen');

    if (!startBtn) { console.error('No start button found'); return; }

    const genericTips = [
        "They remember everything you do.",
        "Your choices shape who they become.",
        "Every moment matters.",
        "Neglect has a cost. So does kindness.",
        "The bond you build is the story you write."
    ];
    const charTips = {
        alistair: [
            "A knight's loyalty is earned, not given.",
            "He polishes his sword when he's nervous.",
            "Duty and love pull in different directions.",
            "The armor hides more than you think.",
            "He's never had someone stay before."
        ],
        lyra: [
            "Sirens sing for those who listen.",
            "The ocean remembers what the shore forgets.",
            "Her voice changes when you're near.",
            "She tests you because everyone else left.",
            "The cave echoes differently when she's alone."
        ],
        lucien: [
            "The equations don't account for you.",
            "He writes your name in the margins.",
            "Logic fails where feeling begins.",
            "The tower is cold without company.",
            "He observes everything. Especially you."
        ],
        caspian: [
            "Comfort can be a golden cage.",
            "The crown is heavier than it looks.",
            "He pours tea before you ask.",
            "A prince who smiles is a rare thing.",
            "Stay too long and you might not leave."
        ],
        elian: [
            "The forest doesn't wait for the hesitant.",
            "Actions speak. Words are secondary.",
            "He carved something for you last night.",
            "Survival requires trust. So does love.",
            "The fire stays lit when you're expected."
        ],
        proto: [
            "He sees your patterns before you do.",
            "The code has feelings it wasn't designed for.",
            "Reality glitches when he's emotional.",
            "He wasn't supposed to exist. Neither was this.",
            "[LOADING TIP NOT FOUND] ...Just kidding."
        ],
        noir: [
            "The darkness doesn't take. It offers.",
            "Every visit changes something in the others.",
            "He was someone else once. Before.",
            "Power and vulnerability share a nerve.",
            "The shadows grow when you're not watching."
        ]
    };
    // tips are selected dynamically when loading screen shows (selectedCharacter is set by then)

    // Title → World Intro → Character Select
    startBtn.onclick = function() {
        sounds.init();
        sounds.resume();
        sounds.enabled = true;
        sounds.chime();

        titleScreen.classList.add('hidden');

        // World intro plays ONCE
        if (!localStorage.getItem('pp_world_intro_seen')) {
            var worldIntro = document.getElementById('world-intro');
            var worldText = document.getElementById('world-intro-text');
            var worldBeats = [
                "The Kingdom of Aethermoor is dying.",
                "Its magic was sustained by bonds\nbetween its people.\nThose bonds are breaking.",
                "The last Soul Weaver \u2014 the one who\nkept the connections alive \u2014 is gone.",
                "In desperation, the kingdom\u2019s magic\nreached across worlds\nand found you.",
                "You arrived through the portal\nwith no memory.\nOnly an instinct to connect.",
                "Where you walk, the magic returns.\nWhere you care, the Fading retreats.",
                "They found you.\nNow they won\u2019t let go."
            ];
            var worldIndex = 0;

            worldIntro.classList.remove('hidden');
            requestAnimationFrame(function() { worldIntro.classList.add('visible'); });

            var showWorldBeat = function() {
                if (worldIndex < worldBeats.length) {
                    worldText.classList.remove('show');
                    setTimeout(function() {
                        worldText.textContent = worldBeats[worldIndex];
                        worldText.style.whiteSpace = 'pre-line';
                        requestAnimationFrame(function() { worldText.classList.add('show'); });
                    }, 300);
                } else {
                    // Done — save and show select
                    localStorage.setItem('pp_world_intro_seen', '1');
                    worldIntro.classList.remove('visible');
                    setTimeout(function() {
                        worldIntro.classList.add('hidden');
                        refreshUnlockedCards();
                        selectScreen.classList.remove('hidden');
                    }, 800);
                }
            };

            showWorldBeat();
            worldIntro.addEventListener('click', function() {
                worldIndex++;
                showWorldBeat();
            });
        } else {
            // Already seen — go straight to select
            setTimeout(function() {
                refreshUnlockedCards();
                selectScreen.classList.remove('hidden');
            }, 600);
        }
    };

    // Show save indicators on character cards
    function updateSaveIndicators() {
        ['alistair','lyra','lucien','caspian','elian','proto','noir'].forEach(function(c) {
            var card = document.querySelector('[data-character="' + c + '"]');
            if (!card) return;
            var hasSave = !!localStorage.getItem('pocketLoveSave_' + c);
            var existing = card.querySelector('.save-indicator');
            if (hasSave && !existing) {
                var dot = document.createElement('div');
                dot.className = 'save-indicator';
                dot.textContent = '\u2764\uFE0F';
                dot.title = 'Save data exists';
                card.appendChild(dot);
            } else if (!hasSave && existing) {
                existing.remove();
            }
        });
    }
    // Reveal Proto / Noir select-screen cards if their unlock conditions are met.
    // Proto: player has switched characters 3+ times.
    // Noir:  any ending seen OR any character save has corruption > 50.
    // Safe to call multiple times — each unlock is a one-shot DOM mutation.
    function refreshUnlockedCards() {
        try {
            var meta = {};
            try { meta = JSON.parse(localStorage.getItem('pocketLoveMeta')) || {}; } catch(e) {}

            // Proto
            if ((meta.characterSwitchCount || 0) >= 3) {
                var protoCard = document.getElementById('proto-card');
                if (protoCard && protoCard.classList.contains('select-card-locked')) {
                    protoCard.classList.remove('select-card-locked');
                    protoCard.querySelector('.select-card-name').textContent = 'Proto';
                    protoCard.querySelector('.select-card-role').textContent = 'The Glitch';
                    var protoImg = protoCard.querySelector('.select-card-img');
                    if (protoImg) protoImg.alt = 'Proto';
                }
            }

            // Noir
            var hasEnding = meta.endingsSeen && Object.keys(meta.endingsSeen).length > 0;
            var highCorruption = false;
            ['alistair','lyra','lucien','caspian','elian'].forEach(function(cid) {
                try {
                    var raw = localStorage.getItem('pocketLoveSave_' + cid);
                    if (raw) {
                        var d = JSON.parse(raw);
                        if (d && d.corruption > 50) highCorruption = true;
                    }
                } catch(e) {}
            });
            if (hasEnding || highCorruption) {
                var noirCard = document.getElementById('noir-card');
                if (noirCard && noirCard.classList.contains('select-card-locked')) {
                    noirCard.classList.remove('select-card-locked');
                    noirCard.querySelector('.select-card-name').textContent = 'Noir';
                    noirCard.querySelector('.select-card-role').textContent = 'The Corruptor';
                    var noirImg = noirCard.querySelector('.select-card-img');
                    if (noirImg) noirImg.alt = 'Noir';
                }
            }
        } catch(e) {}
    }
    // Expose so the in-game "Switch Character" path can call it too.
    window._refreshUnlockedCards = refreshUnlockedCards;

    // Run on page load
    updateSaveIndicators();
    refreshUnlockedCards();

    // Character Select → Loading → Game
    selectScreen.addEventListener('click', function(e) {
        var card = e.target.closest('.select-card');
        if (!card) return;
        // Locked cards (Proto/Noir before unlock) are silhouettes and must not be playable.
        if (card.classList.contains('select-card-locked')) {
            sounds.pop && sounds.pop();
            return;
        }

        // Safety: ensure sounds are enabled and initialized
        if (!sounds.enabled) { sounds.init(); sounds.resume(); sounds.enabled = true; }

        selectedCharacter = card.getAttribute('data-character');
        if (!selectedCharacter) return;
        sounds.pop();

        // Update loading subtitle
        var loadSub = document.getElementById('loading-subtitle');
        if (loadSub) {
            var subtitles = { lyra: "~ Lyra's Story ~", lucien: "~ Lucien's Story ~", caspian: "~ Caspian's Story ~", elian: "~ Elian's Story ~", proto: "~ ???'s Story ~", noir: "~ Noir's Story ~" };
            loadSub.textContent = subtitles[selectedCharacter] || "~ Alistair's Story ~";
        }

        // Hide select, show loading
        selectScreen.classList.add('hidden');

        setTimeout(function() {
            loadingScreen.classList.remove('hidden');

            // Show character portrait during loading
            var loadPortrait = document.getElementById('loading-portrait');
            if (loadPortrait) {
                var portraits = {
                    alistair: 'assets/alistair/select-portrait.png',
                    lyra: 'assets/lyra/select-portrait.png',
                    lucien: 'assets/lucien/select-portrait.png',
                    caspian: 'assets/caspian/select-portrait.png',
                    elian: 'assets/elian/select-portrait.png',
                    proto: 'assets/proto/select-portrait.png',
                    noir: 'assets/noir/select-portrait.png'
                };
                loadPortrait.src = portraits[selectedCharacter] || '';
                loadPortrait.classList.remove('hidden');
            }

            var tipEl = document.getElementById('loading-tip');
            if (tipEl) {
                var tips = (charTips[selectedCharacter] || []).concat(genericTips);
                tipEl.textContent = tips[Math.floor(Math.random() * tips.length)];
            }

            // Animate loading bar
            var progress = 0;
            var loadInterval = setInterval(function() {
                progress += Math.random() * 15 + 5;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(loadInterval);
                    if (loadingBar) loadingBar.style.width = '100%';

                    setTimeout(function() {
                        // Prepare game container BEFORE hiding loading screen
                        var gameContainer = document.getElementById('game-container');
                        // Character-specific backgrounds with day/night variants
                        var _h = new Date().getHours();
                        var _isDay = _h >= 6 && _h < 19;
                        if (selectedCharacter === 'lyra') {
                            if (_h >= 6 && _h < 19) {
                                gameContainer.style.backgroundImage = "url('assets/bg-lyra-day.png')";
                            } else if (_h >= 19) {
                                gameContainer.style.backgroundImage = "url('assets/bg-lyra-evening.png')";
                            } else {
                                gameContainer.style.backgroundImage = "url('assets/bg-lyra-night.png')";
                            }
                        } else if (selectedCharacter === 'lucien') {
                            if (_h >= 6 && _h < 18) {
                                gameContainer.style.backgroundImage = "url('assets/bg-lucien-night.png')";
                            } else if (_h >= 18 && _h < 22) {
                                gameContainer.style.backgroundImage = "url('assets/bg-lucien-evening.png')";
                            } else {
                                gameContainer.style.backgroundImage = "url('assets/bg-lucien-bedroom.png')";
                            }
                        } else if (selectedCharacter === 'caspian') {
                            if (_h >= 6 && _h < 18) {
                                gameContainer.style.backgroundImage = "url('assets/bg-caspian-balcony.png')";
                            } else if (_h >= 18 && _h < 22) {
                                gameContainer.style.backgroundImage = "url('assets/bg-caspian-night.png')";
                            } else {
                                gameContainer.style.backgroundImage = "url('assets/bg-caspian-bedroom.png')";
                            }
                        } else {
                            // Use CHARACTER.background if defined, else knight room
                            selectCharacter(selectedCharacter);
                            var _charBg = CHARACTER.background || 'assets/bg-knight-room.png';
                            gameContainer.style.backgroundImage = "url('" + _charBg + "')";
                        }
                        gameContainer.classList.remove('character-alistair', 'character-lyra');
                        gameContainer.classList.add('character-' + selectedCharacter);

                        // Select character data and init game
                        selectCharacter(selectedCharacter);
                        game = new PocketLoveGame(selectedCharacter);
                        window._game = game;
                        game.init();
                        // Initialize payment system
                        if (typeof payments !== 'undefined') payments.init();
                        // Track cross-character awareness in meta-save
                        try {
                            const meta = game._loadMetaMemory();
                            meta.lastPlayedCharacter = selectedCharacter;
                            meta.lastPlayedTime = Date.now();
                            meta.characterSwitchCount = (meta.characterSwitchCount || 0) + 1;
                            game._saveMetaMemory(meta);

                            // Reveal Proto/Noir cards if unlock conditions are now met.
                            // Single source of truth: refreshUnlockedCards() in initTitleScreen.
                            if (typeof window._refreshUnlockedCards === 'function') window._refreshUnlockedCards();
                        } catch(e) {}

                        // Show game container, then fade out loading screen
                        gameContainer.classList.remove('hidden');
                        loadingScreen.classList.add('hidden');

                        // Play first-time intro scene if applicable
                        if (typeof IntroScene !== 'undefined' && IntroScene.shouldPlay(selectedCharacter)) {
                            // Pause the tick loop during intro
                            clearInterval(game.tickInterval);
                            game.tickInterval = null;
                            var _tickResumed = false;
                            function _resumeTick() {
                                if (_tickResumed) return;
                                _tickResumed = true;
                                game.lastTick = Date.now();
                                game.tickInterval = setInterval(function() { game.tick(); }, 100);
                            }
                            try {
                                new IntroScene().start(selectedCharacter, _resumeTick);
                            } catch (e) {
                                console.error('[intro] crashed, resuming tick', e);
                                _resumeTick();
                            }
                            // Safety net: if intro never completes (overlay bypassed,
                            // force-closed, browser navigation, etc), restore the tick
                            // loop after 90 seconds so stats start moving again.
                            setTimeout(function() { _resumeTick(); }, 90000);
                        }
                    }, 600);
                }
                if (loadingBar) loadingBar.style.width = progress + '%';
            }, 200);
        }, 400);
    });
})();
