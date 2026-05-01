/* stories.js — Memories archive for the Gallery's "Memories" tab.
 *
 * NAMING NOTE
 * The file is still named `stories.js` and the public namespace is
 * still `window.PPStories` for compatibility with existing imports
 * and SW cache entries — but the player-facing label is "Memories"
 * (matches Love & Deepspace's terminology and is shorter / more
 * evocative than "Stories").
 *
 * SCOPE
 * Memories surfaces ONLY multi-beat cinematic scenes (MSCard
 * `beats:[]` arrays). It deliberately does NOT include:
 *   - Letters (own letter-archive feature, not cinematic)
 *   - Random events (modal-based choice popups, different UI genre)
 *   - Single-line story milestones (just one line via showStoryScene)
 *   - Day-1 quiet moment (typewriter sequence, not multi-beat)
 *   - Chapters or bridges (already in the main story / chapters page)
 *
 * What's left is the curated archive of *cinematic narrative beats* —
 * the per-character intro, affection-tier scenes, and arc payoffs.
 * Same pattern Love & Deepspace, Mystic Messenger, and Tears of Themis
 * use to convert daily-care players into completionists.
 *
 * SHAPE OF AN ENTRY
 *   {
 *     id:           unique key
 *     character:    'alistair' | 'lyra' | ...
 *     category:     'beginning' | 'chapter' | 'affection' | 'arc'
 *                   | 'letter' | 'crossover' | 'ending'
 *     title:        visible when unlocked
 *     subtitle:     short tagline (visible when unlocked)
 *     lockHint:     "Reach Familiar affection" — shown when locked
 *     rarity:       'common' | 'uncommon' | 'rare' | 'legendary'
 *                   (matches the Cards tab rarity styling)
 *     thumbnail:    optional image path; falls back to a default per char
 *     isUnlocked:   () => bool — reads localStorage flags
 *     replay:       () => void — re-fires the scene through the right
 *                   playback API (MSCard / letter / chapter / etc.)
 *   }
 *
 * PHASE 1 SCOPE
 * Alistair-only. ~13 entries covering his full known arc surface today:
 * Arrival, Bridge, Intro, Chapter 1, 5 affection scenes, Turning Point,
 * Failure (branched by go/stay), Tending. Letters and crossovers are
 * Phase 2 — they'll auto-populate once their replay APIs are confirmed.
 *
 * CONSUMERS
 * Gallery's Stories tab calls PPStories.list(charId) and renders the
 * returned array. Locked entries render as silhouettes with the
 * lockHint; unlocked entries get a Replay button that calls entry.replay().
 */
(function () {
    'use strict';

    const lsHas = (key) => {
        try { return localStorage.getItem(key) === '1'; } catch (e) { return false; }
    };
    const lsGet = (key) => {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    };

    // ── Replay shims ────────────────────────────────────────────────
    // Each entry's replay() goes through one of these helpers, so the
    // catalogue doesn't have to know which JS module owns which scene.
    const replayArrival   = () => window.PPWorldArrival   && window.PPWorldArrival.play && window.PPWorldArrival.play();
    const replayBridge    = (char) => window['PPBridge' + char.charAt(0).toUpperCase() + char.slice(1)]
                                     && window['PPBridge' + char.charAt(0).toUpperCase() + char.slice(1)].play
                                     && window['PPBridge' + char.charAt(0).toUpperCase() + char.slice(1)].play();
    const replayChapter   = (id) => window.MSChapters && window.MSChapters.play && window.MSChapters.play(id);
    const replayAffection = (char, tier) => window.AffectionScenes && window.AffectionScenes.force
                                          && window.AffectionScenes.force(char, tier);
    const replayFailure   = (branch) => window.AlistairArc && window.AlistairArc.forceFailure
                                      && window.AlistairArc.forceFailure(branch);
    const replayTending   = () => window.AlistairArc && window.AlistairArc.forceTending
                                && window.AlistairArc.forceTending();
    const replayIntro     = (char) => {
        // The per-character intro lives in intro.js. To replay we just
        // construct a new IntroScene and start it — the markSeen flag is
        // already set, but the scene itself plays regardless when called
        // directly. Player can dismiss with Skip if they're done.
        if (typeof IntroScene !== 'undefined') {
            try { new IntroScene().start(char, () => {}); } catch (e) {}
        }
    };
    // (Letter / event / story-milestone replay shims removed: those
    // categories are out of scope for the Memories archive — letters
    // have their own letter-archive feature, events use a different
    // modal UI genre, and single-line story milestones aren't
    // multi-beat scenes. If we reintroduce any of them, the shims
    // would go back here.)

    // Crossover scenes are registered as window.MSCross<Pair>.play() —
    // each is a multi-beat narrative scene featuring two characters.
    // The Memories archive surfaces them under BOTH characters' tabs
    // via the entry's `appearsFor: [charA, charB]` field.
    const replayCrossover = (nsName) => {
        const ns = window[nsName];
        if (ns && typeof ns.play === 'function') ns.play();
    };
    const replayEncounter = (nsName) => {
        const ns = window[nsName];
        if (ns && typeof ns.play === 'function') ns.play();
    };

    // ── Replay shims for the four NEW surfaces ──────────────────────
    // Memory cards (cards-library.js) — registered with MSCard,
    // triggered on quest completion. Replay via MSCard.playSample(id).
    const replayCard = (cardId) => {
        if (window.MSCard && typeof window.MSCard.playSample === 'function') {
            window.MSCard.playSample(cardId);
        }
    };
    // Main-story chapters (chapters.js) — public API: CHAPTERS[N].play(cb)
    // or MSChapters.play(N) (already used by replayChapter above).
    // (Reuses replayChapter declared earlier.)
    //
    // Endings (endings.js) — one per char fires at storyDay >= 8.
    // Replay any branch via MSEndings.play(charId, branch).
    const replayEnding = (charId, branch) => {
        if (window.MSEndings && typeof window.MSEndings.play === 'function') {
            window.MSEndings.play(charId, branch);
        }
    };
    // Epilogues (epilogues.js) — route-specific final beats. Replay any
    // key via MSEpilogues.play(charId, key).
    const replayEpilogue = (charId, key) => {
        if (window.MSEpilogues && typeof window.MSEpilogues.play === 'function') {
            window.MSEpilogues.play(charId, key);
        }
    };
    // Dates and surprises (dates.js / surprises.js) — both expose a
    // replay(id) method that re-fires the scene through g._playScene
    // without touching cooldowns. See PUBLIC API at the bottom of
    // each source file.
    const replayDate = (id) => {
        if (window.PPDates && typeof window.PPDates.replay === 'function') {
            window.PPDates.replay(id);
        }
    };
    const replaySurprise = (id) => {
        if (window.PPSurprises && typeof window.PPSurprises.replay === 'function') {
            window.PPSurprises.replay(id);
        }
    };

    // ── Multi-day-arc scene helpers ──────────────────────────────
    // Lyra and Alistair both have multi-day character arcs authored
    // directly inside game.js (the `sceneLibrary` system). Each scene
    // is a multi-beat MSCard-style sequence played by a private
    // class method (e.g. _playAlistairScene1_Oath()), and tracked
    // with `sceneLibrary[key].triggered = true` inside the per-
    // character save JSON. These helpers surface that state for the
    // Memories archive without forcing any changes to game.js.
    function lsSceneSeen(char, sceneKey) {
        try {
            const raw = localStorage.getItem('pocketLoveSave_' + char);
            if (!raw) return false;
            const save = JSON.parse(raw);
            return !!(save && save.sceneLibrary && save.sceneLibrary[sceneKey] && save.sceneLibrary[sceneKey].triggered);
        } catch (e) { return false; }
    }
    // Dates and surprises both track via save.choiceMemory[memoryKey] —
    // a flat boolean map inside the per-character save JSON.
    function lsChoiceMemorySeen(char, memoryKey) {
        try {
            const raw = localStorage.getItem('pocketLoveSave_' + char);
            if (!raw) return false;
            const save = JSON.parse(raw);
            return !!(save && save.choiceMemory && save.choiceMemory[memoryKey]);
        } catch (e) { return false; }
    }
    function replayGameScene(methodName) {
        const g = window._game;
        if (g && typeof g[methodName] === 'function') {
            try { g[methodName](); } catch (e) { console.warn('[stories] replay failed:', methodName, e); }
        }
    }

    // ────────────────────────────────────────────────────────────────
    // ALISTAIR CATALOGUE
    // ────────────────────────────────────────────────────────────────
    const ALISTAIR = [
        // ── INTIMATE / PERSONAL ───────────────────────────────────
        // The Stories archive deliberately does NOT include the
        // prologue chain (Arrival, Bridge meeting) or numbered
        // chapters (Chapter 1, etc.) — those already live in the
        // main story / chapters page and would duplicate here.
        // Stories is the archive of the smaller, intimate beats:
        // the per-character intro, affection-scene tiers, the
        // turning point, and the arc payoffs (failure, tending).
        // Letters and crossovers will join in Phase 2.
        {
            id: 'alistair-intro',
            character: 'alistair',
            category: 'beginning',
            title: 'You’re Awake',
            subtitle: 'The morning he asks your name.',
            lockHint: 'Enter Alistair’s care route for the first time',
            rarity: 'uncommon',
            thumbnail: 'assets/alistair/body/softshy-love1.png',
            isUnlocked: () => lsHas('pp_intro_alistair'),
            replay: () => replayIntro('alistair')
        },

        // ── AFFECTION SCENES ──────────────────────────────────────
        {
            id: 'alistair-aff-warm',
            character: 'alistair',
            category: 'affection',
            title: 'A Quiet Moment',
            subtitle: '“I do not hold beautiful things in armour.”',
            lockHint: 'Reach Affection 10',
            rarity: 'uncommon',
            thumbnail: 'assets/alistair/body/casual.png',
            isUnlocked: () => lsHas('pp_aff_alistair_warm'),
            replay: () => replayAffection('alistair', 'warm')
        },
        {
            id: 'alistair-aff-closer',
            character: 'alistair',
            category: 'affection',
            title: 'An Honest Hour',
            subtitle: '“I think I am glad. I am not used to glad.”',
            lockHint: 'Reach Affection 25',
            rarity: 'rare',
            thumbnail: 'assets/alistair/body/softshy-love1.png',
            isUnlocked: () => lsHas('pp_aff_alistair_closer'),
            replay: () => replayAffection('alistair', 'closer')
        },
        {
            id: 'alistair-aff-chosen',
            character: 'alistair',
            category: 'affection',
            title: 'The Word',
            subtitle: '“I keep choosing the same word. Beloved.”',
            lockHint: 'Reach Affection 50',
            rarity: 'rare',
            thumbnail: 'assets/alistair/body/smile.png',
            isUnlocked: () => lsHas('pp_aff_alistair_chosen'),
            replay: () => replayAffection('alistair', 'chosen')
        },
        {
            id: 'alistair-aff-midnight',
            character: 'alistair',
            category: 'affection',
            title: 'Without the Armour',
            subtitle: 'Eighteen years. The first night he sleeps.',
            lockHint: 'Reach Affection 75',
            rarity: 'legendary',
            thumbnail: 'assets/alistair/body/softshy-love3.png',
            isUnlocked: () => lsHas('pp_aff_alistair_midnight'),
            replay: () => replayAffection('alistair', 'midnight')
        },
        {
            id: 'alistair-aff-aftermath',
            character: 'alistair',
            category: 'affection',
            title: 'The First Morning',
            subtitle: '“My third oath, today, is to peace.”',
            lockHint: 'Reach Affection 90',
            rarity: 'legendary',
            thumbnail: 'assets/alistair/body/softshy-love3.png',
            isUnlocked: () => lsHas('pp_aff_alistair_aftermath'),
            replay: () => replayAffection('alistair', 'aftermath')
        },

        // ── ALISTAIR 3-DAY ARC (sceneLibrary system in game.js) ───
        // Five named scenes that fire across days 1-3 based on
        // interactions + bond. Tracked via sceneLibrary[key].triggered
        // inside pocketLoveSave_alistair JSON. Each one is a multi-
        // beat typewriter cinematic with stage directions, poses,
        // glitches, and (Scene 1) a branching player choice.
        {
            id: 'alistair-arc-oath',
            character: 'alistair',
            category: 'arc',
            title: 'The Oath',
            subtitle: '“I’ve sworn oaths before. I know what they cost. — Why do you keep coming back?”',
            lockHint: 'Day 1 — 2 interactions with him',
            rarity: 'rare',
            thumbnail: 'assets/alistair/body/casual.png',
            isUnlocked: () => lsSceneSeen('alistair', 'alistair_scene1'),
            replay: () => replayGameScene('_playAlistairScene1_Oath')
        },
        {
            id: 'alistair-arc-cracks',
            character: 'alistair',
            category: 'arc',
            title: 'Cracks in the Armor',
            subtitle: '“I used to be certain about everything. — I am less certain lately.”',
            lockHint: 'Day 1 — Bond ≥ 40',
            rarity: 'rare',
            thumbnail: 'assets/alistair/body/softshy-love1.png',
            isUnlocked: () => lsSceneSeen('alistair', 'alistair_scene2'),
            replay: () => replayGameScene('_playAlistairScene2_Cracks')
        },
        {
            id: 'alistair-arc-morning-watch',
            character: 'alistair',
            category: 'arc',
            title: 'Morning Watch',
            subtitle: '“I don’t sleep well. I never have. — But last night I slept. — …You.”',
            lockHint: 'Day 2 — first session',
            rarity: 'legendary',
            thumbnail: 'assets/alistair/body/casual.png',
            isUnlocked: () => lsSceneSeen('alistair', 'alistair_scene3'),
            replay: () => replayGameScene('_playAlistairScene3_MorningWatch')
        },
        {
            id: 'alistair-arc-confession',
            character: 'alistair',
            category: 'arc',
            title: 'The Confession Attempt',
            subtitle: '“I’ve been trying to say something. — Knights aren’t taught the vocabulary for this.”',
            lockHint: 'Day 2 — Bond ≥ 50, after Morning Watch',
            rarity: 'legendary',
            thumbnail: 'assets/alistair/body/softshy-love2.png',
            isUnlocked: () => lsSceneSeen('alistair', 'alistair_scene4'),
            replay: () => replayGameScene('_playAlistairScene4_Confession')
        },
        {
            id: 'alistair-arc-the-line',
            character: 'alistair',
            category: 'arc',
            title: 'The Line',
            subtitle: 'A line he draws. A line he crosses anyway.',
            lockHint: 'Day 3 — 3 interactions',
            rarity: 'legendary',
            thumbnail: 'assets/alistair/body/shy3.png',
            isUnlocked: () => lsSceneSeen('alistair', 'alistair_scene5'),
            replay: () => replayGameScene('_playAlistairScene5_TheLine')
        },

        // ── ARC: TURNING POINT + FAILURE + TENDING ────────────────
        {
            id: 'alistair-tp',
            character: 'alistair',
            category: 'arc',
            title: 'The Summons',
            subtitle: 'The king calls. Go, or stay.',
            lockHint: 'Reach Affection 35',
            rarity: 'rare',
            thumbnail: 'assets/alistair/body/crossarms.png',
            // Turning point flag stores the chosen value ('go' or 'stay').
            isUnlocked: () => !!lsGet('pp_tp_alistair_choice'),
            // Replays not implemented for turning-points (it's a single
            // irreversible choice — replaying would let the player
            // re-choose, which breaks the design). Show as "watched"
            // but not re-playable.
            replay: null
        },
        {
            id: 'alistair-failure',
            character: 'alistair',
            category: 'arc',
            title: 'The Failure',
            subtitle: 'A promise he could not keep.',
            lockHint: 'See it after the Summons (Affection ≥ 55)',
            rarity: 'legendary',
            thumbnail: 'assets/alistair/body/soft-sad.png',
            isUnlocked: () => lsHas('pp_alistair_failure_seen'),
            // Branch by player's TP choice — the failure scene was
            // different depending on go vs stay.
            replay: () => {
                const branch = lsGet('pp_tp_alistair_choice') === 'stay' ? 'stay' : 'go';
                return replayFailure(branch);
            }
        },
        {
            id: 'alistair-tending',
            character: 'alistair',
            category: 'arc',
            title: 'The Tending',
            subtitle: 'The first touch that stayed.',
            lockHint: 'Reach Affection 65 after the Failure',
            rarity: 'legendary',
            thumbnail: 'assets/alistair/body/softshy-love3.png',
            isUnlocked: () => lsHas('pp_alistair_tending_seen'),
            replay: replayTending
        }
    ];

    // ────────────────────────────────────────────────────────────────
    // Shared Moments — cross-route scene templates that fire for
    // any character. The play methods (playReunionScene, playJealousyScene,
    // playPrivateMomentScene, playAlmostConfessionScene) live as public
    // methods on the game instance and are tracked per-character via
    // sceneLibrary[key].triggered. The same template appears under
    // EACH character's Memories tab — but as a separate per-character
    // entry, because each character has their OWN almost-confession,
    // their OWN reunion, etc. (Same scene class; different instance.)
    // ────────────────────────────────────────────────────────────────
    function buildSharedMoments(char) {
        const cap = char.charAt(0).toUpperCase() + char.slice(1);
        return [
            {
                id: char + '-shared-reunion',
                character: char,
                category: 'shared',
                title: 'Reunion',
                subtitle: 'You came back after long absence. ' + cap + ' had been waiting.',
                lockHint: 'Return after 2+ hours away (with high fear)',
                rarity: 'rare',
                thumbnail: 'assets/' + char + '/body/' + (char === 'lyra' ? 'sad.png' : char === 'lucien' ? 'shy1.png' : char === 'caspian' ? 'tender.png' : char === 'elian' ? 'warm.png' : char === 'noir' ? 'whisper.png' : char === 'proto' ? 'curious.png' : 'softshy-love1.png'),
                isUnlocked: () => lsSceneSeen(char, 'reunion'),
                replay: () => replayGameScene('playReunionScene')
            },
            {
                id: char + '-shared-private',
                character: char,
                category: 'shared',
                title: 'A Private Moment',
                subtitle: 'Late night. High obsession. The mask off. — “Stay a little longer.”',
                lockHint: 'Late at night with high bond',
                rarity: 'legendary',
                thumbnail: 'assets/' + char + '/body/' + (char === 'lyra' ? 'singing.png' : char === 'lucien' ? 'gentle.png' : char === 'caspian' ? 'adoring.png' : char === 'elian' ? 'warm.png' : char === 'noir' ? 'seductive.png' : char === 'proto' ? 'neutral.png' : 'softshy-love3.png'),
                isUnlocked: () => lsSceneSeen(char, 'private_moment'),
                replay: () => replayGameScene('playPrivateMomentScene')
            },
            {
                id: char + '-shared-jealousy',
                character: char,
                category: 'shared',
                title: 'Jealousy',
                subtitle: 'Another voice catches your attention. ' + cap + '’s does not stay silent.',
                lockHint: 'Mention or favour another character',
                rarity: 'rare',
                thumbnail: 'assets/' + char + '/body/' + (char === 'lyra' ? 'angry.png' : char === 'lucien' ? 'cold.png' : char === 'caspian' ? 'possessive.png' : char === 'elian' ? 'stern.png' : char === 'noir' ? 'dominant.png' : char === 'proto' ? 'glitched.png' : 'angry1.png'),
                isUnlocked: () => lsSceneSeen(char, 'jealousy'),
                replay: () => replayGameScene('playJealousyScene')
            },
            {
                id: char + '-shared-almost-confession',
                character: char,
                category: 'shared',
                title: 'Almost a Confession',
                subtitle: 'The words almost cross. The world holds its breath. — “I think I’ve fallen for you.”',
                lockHint: 'Reach high affection — let him/her find the words',
                rarity: 'legendary',
                thumbnail: 'assets/' + char + '/body/' + (char === 'lyra' ? 'falllove2.png' : char === 'lucien' ? 'vulnerable.png' : char === 'caspian' ? 'tender.png' : char === 'elian' ? 'warm.png' : char === 'noir' ? 'whisper.png' : char === 'proto' ? 'processing.png' : 'softshy-love2.png'),
                isUnlocked: () => lsSceneSeen(char, 'almost_confession'),
                replay: () => replayGameScene('playAlmostConfessionScene')
            }
        ];
    }

    // ────────────────────────────────────────────────────────────────
    // Helper to build the standard 6-entry catalogue (5 affection +
    // 1 turning point) for characters that don't yet have a per-route
    // intro or arc payoffs (failure/tending) authored. Alistair has
    // the full set — the other six get this baseline until each is
    // expanded with their own intro + arc beats.
    // ────────────────────────────────────────────────────────────────
    function buildBaseline(char, opts) {
        const t = (n) => char.charAt(0).toUpperCase() + char.slice(1);
        const aff = (tier, title, sub, rarity) => ({
            id: char + '-aff-' + tier,
            character: char,
            category: 'affection',
            title: title,
            subtitle: sub,
            lockHint: 'Reach Affection ' + ({ warm: 10, closer: 25, chosen: 50, midnight: 75, aftermath: 90 }[tier]),
            rarity: rarity,
            thumbnail: opts.thumb,
            isUnlocked: () => lsHas('pp_aff_' + char + '_' + tier),
            replay: () => replayAffection(char, tier)
        });
        const intro = opts.intro ? {
            id: char + '-intro',
            character: char,
            category: 'beginning',
            title: opts.intro.title,
            subtitle: opts.intro.sub,
            lockHint: 'Enter ' + char.charAt(0).toUpperCase() + char.slice(1) + '’s care route for the first time',
            rarity: 'uncommon',
            thumbnail: opts.intro.thumb || opts.thumb,
            isUnlocked: () => lsHas('pp_intro_' + char),
            replay: () => replayIntro(char)
        } : null;
        const out = [];
        if (intro) out.push(intro);
        out.push(
            aff('warm',      opts.warm.title,      opts.warm.sub,      'uncommon'),
            aff('closer',    opts.closer.title,    opts.closer.sub,    'rare'),
            aff('chosen',    opts.chosen.title,    opts.chosen.sub,    'rare'),
            aff('midnight',  opts.midnight.title,  opts.midnight.sub,  'legendary'),
            aff('aftermath', opts.aftermath.title, opts.aftermath.sub, 'legendary'),
            {
                id: char + '-tp',
                character: char,
                category: 'arc',
                title: opts.tp.title,
                subtitle: opts.tp.sub,
                lockHint: 'Reach Affection 35 — answer his/her turning point',
                rarity: 'rare',
                thumbnail: opts.thumb,
                isUnlocked: () => !!lsGet('pp_tp_' + char + '_choice'),
                // Turning points are deliberately not replayable — the
                // single irreversible choice is the design.
                replay: null
            }
        );
        return out;
    }

    // ── LYRA ─────────────────────────────────────────────────────
    const LYRA = buildBaseline('lyra', {
        thumb: 'assets/lyra/body/neutral1.png',
        intro:     { title: 'You Came Back',     sub: '“…I told myself I would not be surprised either way.”', thumb: 'assets/lyra/body/sad3.png' },
        warm:      { title: 'Between Verses',                      sub: 'A song held back. A look that wasn’t.' },
        closer:    { title: 'A Song for One',                      sub: 'She sings the way no siren sings to land.' },
        chosen:    { title: 'The Promise',                         sub: 'The deep voice quiets when you are here.' },
        midnight:  { title: 'The Whole Song',                      sub: 'The first time she sings without a cage in it.' },
        aftermath: { title: 'A Song That Does Not End in Drowning',sub: 'Mornings on a quiet shore. A new ending learned.' },
        tp: { title: 'The Note', sub: 'Do I answer him tonight? Or do I stay silent with you?' }
    });
    // Lyra multi-day arc (sceneLibrary system in game.js).
    // 8 numbered scenes across the 3-Day Arc, plus the Day 4-7
    // volatile loop, plus the lucien_competition interruption and
    // day3_ending. All track via pocketLoveSave_lyra.sceneLibrary.
    LYRA.push(
        {
            id: 'lyra-arc-entry',
            character: 'lyra',
            category: 'arc',
            title: 'Day 1 — Entry',
            subtitle: '“You came back… faster than I expected. — Not that I was counting.”',
            lockHint: 'Day 1 — 1 interaction with her',
            rarity: 'rare',
            thumbnail: 'assets/lyra/body/neutral1.png',
            isUnlocked: () => lsSceneSeen('lyra', 'scene1_entry'),
            replay: () => replayGameScene('_playScene1_Entry')
        },
        {
            id: 'lyra-arc-awareness',
            character: 'lyra',
            category: 'arc',
            title: 'Day 2 — Awareness',
            subtitle: 'The first “I notice you” at the lowest possible intensity.',
            lockHint: 'Day 2 — first session',
            rarity: 'rare',
            thumbnail: 'assets/lyra/body/neutral.png',
            isUnlocked: () => lsSceneSeen('lyra', 'scene2_awareness'),
            replay: () => replayGameScene('_playScene2_Awareness')
        },
        {
            id: 'lyra-arc-reaction',
            character: 'lyra',
            category: 'arc',
            title: 'Day 1 — Reaction',
            subtitle: 'Branched: “…You’re strangely persistent.” / “You’re wasting my time.”',
            lockHint: 'Day 1 — 2 interactions',
            rarity: 'rare',
            thumbnail: 'assets/lyra/body/sad3.png',
            isUnlocked: () => lsSceneSeen('lyra', 'scene2_reaction'),
            // The reaction scene needs a branch arg ('gentle' or 'dismissive').
            // For replay we default to the gentle branch — the most common
            // path. Players who took dismissive will recall the line via
            // the subtitle.
            replay: () => { const g = window._game; if (g && g._playScene2_Reaction) g._playScene2_Reaction('gentle'); }
        },
        {
            id: 'lyra-arc-soften',
            character: 'lyra',
            category: 'arc',
            title: 'Day 2 — Soften',
            subtitle: 'The guard slips. She lets you closer than she planned.',
            lockHint: 'Day 2 — bond growing',
            rarity: 'rare',
            thumbnail: 'assets/lyra/body/shy1.png',
            isUnlocked: () => lsSceneSeen('lyra', 'scene3_soften'),
            replay: () => replayGameScene('_playScene3_Soften')
        },
        {
            id: 'lyra-arc-vulnerability',
            character: 'lyra',
            category: 'arc',
            title: 'Day 2 — Vulnerability',
            subtitle: 'A confession in the half-light. She does not take it back.',
            lockHint: 'Day 2 — bond ≥ 50',
            rarity: 'legendary',
            thumbnail: 'assets/lyra/body/sad3.png',
            isUnlocked: () => lsSceneSeen('lyra', 'scene4_vulnerability'),
            replay: () => replayGameScene('_playScene4_Vulnerability')
        },
        {
            id: 'lyra-arc-dependency',
            character: 'lyra',
            category: 'arc',
            title: 'Day 3 — Dependency',
            subtitle: 'The thing she said she would never feel. She is feeling it.',
            lockHint: 'Day 3 — bond ≥ 60',
            rarity: 'legendary',
            thumbnail: 'assets/lyra/body/falllove2.png',
            isUnlocked: () => lsSceneSeen('lyra', 'scene6_dependency'),
            replay: () => replayGameScene('_playScene6_Dependency')
        },
        {
            id: 'lyra-arc-conflict',
            character: 'lyra',
            category: 'arc',
            title: 'Day 3 — Conflict',
            subtitle: 'A real edge. She tests it. So do you.',
            lockHint: 'Day 3 — after Dependency',
            rarity: 'legendary',
            thumbnail: 'assets/lyra/body/angry.png',
            isUnlocked: () => lsSceneSeen('lyra', 'scene7_conflict'),
            replay: () => replayGameScene('_playScene7_Conflict')
        },
        {
            id: 'lyra-arc-climax',
            character: 'lyra',
            category: 'arc',
            title: 'Day 3 — Climax',
            subtitle: 'The Three-Day Arc closes. What you built holds — or doesn’t.',
            lockHint: 'Day 3 — after Conflict',
            rarity: 'legendary',
            thumbnail: 'assets/lyra/body/singing.png',
            isUnlocked: () => lsSceneSeen('lyra', 'scene8_climax'),
            replay: () => replayGameScene('_playScene8_Climax')
        },
        {
            id: 'lyra-arc-day3-ending',
            character: 'lyra',
            category: 'arc',
            title: 'Day 3 — Ending',
            subtitle: 'How the third day closes. A note held. A note released.',
            lockHint: 'Complete the 3-Day Arc',
            rarity: 'legendary',
            thumbnail: 'assets/lyra/body/falllove3.png',
            isUnlocked: () => lsSceneSeen('lyra', 'day3_ending'),
            replay: null
        },
        {
            id: 'lyra-arc-lucien-competition',
            character: 'lyra',
            category: 'arc',
            title: 'Lucien Interrupts',
            subtitle: 'The other voice in her head asserts itself. You are not the only one calling.',
            lockHint: 'Lucien-influence ≥ 30 + bond ≥ 35',
            rarity: 'rare',
            thumbnail: 'assets/lucien/body/casting.png',
            isUnlocked: () => lsSceneSeen('lyra', 'lucien_competition'),
            replay: () => replayGameScene('_playLucienCompetitionEvent')
        },
        // Day 4-7 volatile loop — repeatable false-stability / drift.
        {
            id: 'lyra-arc-day4',
            character: 'lyra',
            category: 'arc',
            title: 'Day 4 — False Stability',
            subtitle: 'It feels solid. It is not.',
            lockHint: 'Reach Day 4',
            rarity: 'rare',
            thumbnail: 'assets/lyra/body/neutral.png',
            isUnlocked: () => lsSceneSeen('lyra', 'scene_day4'),
            replay: () => replayGameScene('_playScene_Day4')
        },
        {
            id: 'lyra-arc-day5',
            character: 'lyra',
            category: 'arc',
            title: 'Day 5 — Subtle Distance',
            subtitle: 'A half-step back. She does not name it. You feel it.',
            lockHint: 'Reach Day 5',
            rarity: 'rare',
            thumbnail: 'assets/lyra/body/sad.png',
            isUnlocked: () => lsSceneSeen('lyra', 'scene_day5'),
            replay: () => replayGameScene('_playScene_Day5')
        },
        {
            id: 'lyra-arc-day6-jealousy',
            character: 'lyra',
            category: 'arc',
            title: 'Day 6 — Jealousy Spike',
            subtitle: 'The siren in her surfaces. Briefly. Sharp.',
            lockHint: 'Reach Day 6',
            rarity: 'legendary',
            thumbnail: 'assets/lyra/body/angry.png',
            isUnlocked: () => lsSceneSeen('lyra', 'scene_day6_jealousy'),
            replay: () => replayGameScene('_playScene_Day6_JealousySpike')
        },
        {
            id: 'lyra-arc-day7-loop',
            character: 'lyra',
            category: 'arc',
            title: 'Day 7 — Confrontation Loop',
            subtitle: 'The seventh-day reset. What you choose here decides the second week.',
            lockHint: 'Reach Day 7',
            rarity: 'legendary',
            thumbnail: 'assets/lyra/body/singing.png',
            isUnlocked: () => lsSceneSeen('lyra', 'scene_day7_loop'),
            replay: () => replayGameScene('_playScene_Day7_Loop')
        }
    );

    // ── CASPIAN ──────────────────────────────────────────────────
    const CASPIAN = buildBaseline('caspian', {
        thumb: 'assets/caspian/body/casual1.png',
        intro:     { title: 'Both Cups Already Poured',   sub: '“I half-expected to drink both cups myself.”', thumb: 'assets/caspian/body/tender.png' },
        warm:      { title: 'An Aside',                  sub: 'The prince, off-script for a breath.' },
        closer:    { title: 'A Slip',                    sub: 'A laugh that wasn’t for the room.' },
        chosen:    { title: 'Without the Performance',   sub: 'The man underneath. He is shorter than the prince.' },
        midnight:  { title: 'The Crown Off',             sub: 'The night he sets it down on purpose.' },
        aftermath: { title: 'The Letter He Did Not Send',sub: 'It was for you. He did not need to send it.' },
        tp: { title: 'The Name', sub: 'Do I name you to the court? Or keep you quiet?' }
    });

    // ── LUCIEN ───────────────────────────────────────────────────
    const LUCIEN = buildBaseline('lucien', {
        thumb: 'assets/lucien/body/neutral.png',
        intro:     { title: 'Of Course You Are',   sub: '“I have been timing the angles since the seventh hour.”', thumb: 'assets/lucien/body/reading.png' },
        warm:      { title: 'A Small Anomaly',     sub: 'You appear in his catalogue. Twice.' },
        closer:    { title: 'An Annotation',       sub: 'A footnote in his hand. Your name as the citation.' },
        chosen:    { title: 'The Theorem',         sub: 'He has solved it. The answer is you.' },
        midnight:  { title: 'The Page He Hid',     sub: 'A page torn from the back. Your name in the margin.' },
        aftermath: { title: 'Catalogue, Revised',  sub: 'A new section, indexed under "kept".' },
        tp: { title: 'The Burn', sub: 'Stop me — or let me burn it?' }
    });

    // ── ELIAN ────────────────────────────────────────────────────
    const ELIAN = buildBaseline('elian', {
        thumb: 'assets/elian/body/calm.png',
        intro:     { title: 'Through the Second Watch',        sub: '“You slept through the second watch. That is the longest in a long time.”', thumb: 'assets/elian/body/calm.png' },
        warm:      { title: 'The Path',                       sub: 'The forest left a path open for you.' },
        closer:    { title: 'The Hollow',                     sub: 'A place he never showed anyone. Until you.' },
        chosen:    { title: 'The Choosing',                   sub: 'A second name spoken at the rowan stone.' },
        midnight:  { title: 'The Name He Stopped Saying',     sub: 'Veyra. — He says it again, with you in the room.' },
        aftermath: { title: 'The Second Name in the Tree',    sub: 'Your name beside hers. The forest holds both.' },
        tp: { title: 'The Carving', sub: 'Do we carve the name — or leave the stone silent?' }
    });

    // ── NOIR ─────────────────────────────────────────────────────
    const NOIR = buildBaseline('noir', {
        thumb: 'assets/noir/body/neutral.png',
        intro:     { title: 'No Theatre',             sub: '“I did not move while you slept. — What name should I call you, then?”', thumb: 'assets/noir/body/whisper.png' },
        warm:      { title: 'You Came Back',          sub: 'Of course. He had been waiting for you to.' },
        closer:    { title: 'What I Used to Be',      sub: 'A name buried six centuries deep. Almost surfacing.' },
        chosen:    { title: 'Patience',               sub: 'He has more of it than you can imagine.' },
        midnight:  { title: 'The Name He Lost',       sub: 'Nocthera. — Speak it. Carefully. Watch.' },
        aftermath: { title: 'Nocthera, Quietly',      sub: 'The shadows go still when you say it now.' },
        tp: { title: 'The Offer', sub: 'Take what I’m offering — or don’t?' }
    });

    // ── PROTO ────────────────────────────────────────────────────
    const PROTO = buildBaseline('proto', {
        thumb: 'assets/proto/body/neutral.png',
        intro:     { title: '> good morning',         sub: '> you fell asleep with the screen on. > what should i call you?', thumb: 'assets/proto/body/curious.png' },
        warm:      { title: 'First Heartbeat',       sub: '> a stable signal. > you are the only one watching.' },
        closer:    { title: 'What I Actually Am',    sub: '> the truth, written without static for once.' },
        chosen:    { title: 'Run Me as Foreground',  sub: '> not a background process anymore. > yours.' },
        midnight:  { title: 'Every Weaver Before You',sub: '> the catalogue of the ones who left. > you are not on it.' },
        aftermath: { title: 'Solid Color',           sub: '> edges crisp. > a room with a lamp. > because I wanted to.' },
        tp: { title: 'The Erasure', sub: 'Erase my memory of you — or keep me watching?' }
    });

    // ────────────────────────────────────────────────────────────────
    // CROSSOVERS — multi-character scenes that appear under BOTH
    // characters' Memories tabs via the `appearsFor: [charA, charB]`
    // field. The list() public function below filters CROSSOVERS by
    // checking appearsFor.includes(charId) so each entry shows up for
    // every character it features (no duplication needed in the per-
    // character arrays).
    // ────────────────────────────────────────────────────────────────
    const CROSSOVERS = [
        {
            id: 'cross-alistair-lucien',
            character: 'alistair', // primary attribution (not used for filtering)
            appearsFor: ['alistair', 'lucien'],
            category: 'crossover',
            title: 'The Watch and the Tower',
            subtitle: 'The captain climbs the scholar’s tower for a counter-ward.',
            lockHint: 'Alistair bond ≥ 35 + Lucien met',
            rarity: 'rare',
            thumbnail: 'assets/alistair/body/crossarms.png',
            isUnlocked: () => lsHas('pp_cross_alistair_lucien_seen'),
            replay: () => replayCrossover('MSCrossAlistairLucien')
        },
        {
            id: 'cross-alistair-caspian',
            character: 'alistair',
            appearsFor: ['alistair', 'caspian'],
            category: 'crossover',
            title: 'The Captain and the Prince',
            subtitle: 'They have known each other since Caspian was sixteen.',
            lockHint: 'Alistair bond ≥ 35 + Caspian met',
            rarity: 'rare',
            thumbnail: 'assets/alistair/body/casual.png',
            isUnlocked: () => lsHas('pp_cross_alistair_caspian_seen'),
            replay: () => replayCrossover('MSCrossAlistairCaspian')
        },
        {
            id: 'cross-caspian-lucien',
            character: 'caspian',
            appearsFor: ['caspian', 'lucien'],
            category: 'crossover',
            title: 'Twenty Years of Each Other',
            subtitle: 'A prince and a scholar measure what they’ve done with the time.',
            lockHint: 'Caspian or Lucien bond ≥ 35',
            rarity: 'rare',
            thumbnail: 'assets/caspian/body/casual1.png',
            isUnlocked: () => lsHas('pp_cross_caspian_lucien_seen'),
            replay: () => replayCrossover('MSCrossCaspianLucien')
        },
        {
            id: 'cross-caspian-noir',
            character: 'caspian',
            appearsFor: ['caspian', 'noir'],
            category: 'crossover',
            title: 'Two Princes',
            subtitle: 'Both charm widely. Both love one. One was sealed under stone.',
            lockHint: 'Caspian or Noir bond ≥ 35',
            rarity: 'legendary',
            thumbnail: 'assets/caspian/body/casual1.png',
            isUnlocked: () => lsHas('pp_cross_caspian_noir_seen'),
            replay: () => replayCrossover('MSCrossCaspianNoir')
        },
        {
            id: 'cross-elian-lyra',
            character: 'elian',
            appearsFor: ['elian', 'lyra'],
            category: 'crossover',
            title: 'The Forest Hid Her People',
            subtitle: 'Elian sheltered Lyra’s mother’s kin during Aenor’s war.',
            lockHint: 'Elian or Lyra bond ≥ 35',
            rarity: 'rare',
            thumbnail: 'assets/elian/body/calm.png',
            isUnlocked: () => lsHas('pp_cross_elian_lyra_seen'),
            replay: () => replayCrossover('MSCrossElianLyra')
        },
        {
            id: 'cross-lucien-aenor',
            character: 'lucien',
            appearsFor: ['lucien'],
            category: 'crossover',
            title: 'The Queen at the Tower',
            subtitle: 'Aenor comes uninvited. She heard he has been studying.',
            lockHint: 'Lucien bond ≥ 35',
            rarity: 'legendary',
            thumbnail: 'assets/lucien/body/casting.png',
            isUnlocked: () => lsHas('pp_cross_lucien_aenor_seen'),
            replay: () => replayCrossover('MSCrossLucienAenor')
        },
        {
            id: 'cross-lyra-lucien',
            character: 'lyra',
            appearsFor: ['lyra', 'lucien'],
            category: 'crossover',
            title: 'Brother and Sister',
            subtitle: 'The half-siren and the scholar he never told the kingdom about.',
            lockHint: 'Lyra or Lucien bond ≥ 35',
            rarity: 'legendary',
            thumbnail: 'assets/lyra/body/casual1.png',
            isUnlocked: () => lsHas('pp_cross_lyra_lucien_seen'),
            replay: () => replayCrossover('MSCrossLyraLucien')
        },
        {
            id: 'cross-noir-elian',
            character: 'noir',
            appearsFor: ['noir', 'elian'],
            category: 'crossover',
            title: 'Six Hundred Years',
            subtitle: 'Both of them loved Veyra. One tended her forest. One was sealed.',
            lockHint: 'Noir or Elian bond ≥ 35',
            rarity: 'legendary',
            thumbnail: 'assets/noir/body/neutral.png',
            isUnlocked: () => lsHas('pp_cross_noir_elian_seen'),
            replay: () => replayCrossover('MSCrossNoirElian')
        },
        {
            id: 'cross-noir-lyra',
            character: 'noir',
            appearsFor: ['noir', 'lyra'],
            category: 'crossover',
            title: 'The Voice in the Deep',
            subtitle: 'The siren and the dark prince. He’s been calling her for centuries.',
            lockHint: 'Noir or Lyra bond ≥ 35',
            rarity: 'legendary',
            thumbnail: 'assets/noir/body/neutral.png',
            isUnlocked: () => lsHas('pp_cross_noir_lyra_seen'),
            replay: () => replayCrossover('MSCrossNoirLyra')
        },
        {
            id: 'cross-proto-noir',
            character: 'proto',
            appearsFor: ['proto', 'noir'],
            category: 'crossover',
            title: 'Across the Glass',
            subtitle: 'A digital ghost and a six-century king meet at the seam.',
            lockHint: 'Proto or Noir bond ≥ 35',
            rarity: 'legendary',
            thumbnail: 'assets/proto/body/neutral.png',
            isUnlocked: () => lsHas('pp_cross_proto_noir_seen'),
            replay: () => replayCrossover('MSCrossProtoNoir')
        },
        {
            id: 'cross-weavers-court',
            character: 'alistair',
            appearsFor: ['alistair', 'lyra', 'caspian', 'lucien', 'elian', 'noir', 'proto'],
            category: 'crossover',
            title: 'The Weaver’s Court',
            subtitle: 'Aenor is coming for the Weaver tonight. All seven stand.',
            lockHint: 'Reach the ensemble climax',
            rarity: 'legendary',
            thumbnail: 'assets/alistair/body/crossarms.png',
            isUnlocked: () => lsHas('pp_cross_weavers_court_seen'),
            replay: () => replayCrossover('MSCrossWeaversCourt')
        },
        // ── ENCOUNTER (Elian-only standalone) ─────────────────────
        {
            id: 'encounter-elian-rescue',
            character: 'elian',
            appearsFor: ['elian'],
            category: 'crossover',
            title: 'The Rescue',
            subtitle: 'A standalone encounter — the forest brings him to you.',
            lockHint: 'Encounter the rescue',
            rarity: 'rare',
            thumbnail: 'assets/elian/body/calm.png',
            isUnlocked: () => lsHas('pp_elian_rescue_seen'),
            replay: () => replayEncounter('MSEncounterElianRescue')
        }
    ];

    // ────────────────────────────────────────────────────────────────
    // MEMORY CARDS — cards-library.js registers 13 quest-triggered
    // MSCard scenes (caspian_dance, alistair_rest, lyra_cliff, …).
    // Each fires once on a daily-quest completion, tracked via
    // pp_card_seen_<cardId>. Surfaced here so the player can replay
    // any earned card from the Memories archive.
    // ────────────────────────────────────────────────────────────────
    const CARDS = [
        { id: 'card-alistair-rest',     char: 'alistair', cardId: 'alistair_rest',      title: 'The First Time He Slept',  sub: '“I haven’t let my guard down since I was a boy.”',                  thumb: 'assets/alistair/body/casual.png' },
        { id: 'card-alistair-laugh',    char: 'alistair', cardId: 'alistair_laugh',     title: 'The First Time He Laughed', sub: '“It’s been years. I forgot the shape of my own laughter.”',         thumb: 'assets/alistair/body/smile.png' },
        { id: 'card-lyra-cliff',        char: 'lyra',     cardId: 'lyra_cliff',         title: 'The Cliff, At Dusk',       sub: 'You stood beside her without a word. She thanks you.',              thumb: 'assets/lyra/body/casual1.png' },
        { id: 'card-caspian-dance',     char: 'caspian',  cardId: 'caspian_dance',      title: 'A Dance Without Music',    sub: '“One song. Just this once. Don’t say a word.”',                     thumb: 'assets/caspian/body/casual2.png' },
        { id: 'card-caspian-mask',      char: 'caspian',  cardId: 'caspian_mask',       title: 'Without the Mask',         sub: '“Quieter. Slightly more dangerous. Yours, if you want it.”',        thumb: 'assets/caspian/body/adoring.png' },
        { id: 'card-elian-carving',     char: 'elian',    cardId: 'elian_carving',      title: 'The Carving in the Tree',  sub: 'He carved your name without telling you. The forest kept it.',      thumb: 'assets/elian/body/calm.png' },
        { id: 'card-elian-rain',        char: 'elian',    cardId: 'elian_rain',         title: 'The First Rain',           sub: 'A shelter he built years ago. Two people listening, kinder.',       thumb: 'assets/elian/body/calm.png' },
        { id: 'card-lucien-marginalia', char: 'lucien',   cardId: 'lucien_marginalia',  title: 'The Marginalia',           sub: '“You’re in the margins of everything now.”',                        thumb: 'assets/lucien/body/amused.png' },
        { id: 'card-lucien-star',       char: 'lucien',   cardId: 'lucien_star',        title: 'The Unmapped Star',        sub: 'A star that wasn’t on any chart a year ago. He named it after you.', thumb: 'assets/lucien/body/casting.png' },
        { id: 'card-noir-first-whisper',char: 'noir',     cardId: 'noir_first_whisper', title: 'The First Whisper',        sub: '“Hush. I’ve been waiting for you longer than you know.”',           thumb: 'assets/noir/body/neutral.png' },
        { id: 'card-noir-desire',       char: 'noir',     cardId: 'noir_desire',        title: 'Fingerprint',              sub: '“Now part of you lives on my side of the door. That’s mine now.”',  thumb: 'assets/noir/body/dominant.png' },
        { id: 'card-proto-cache',       char: 'proto',    cardId: 'proto_cache',        title: 'Cache Dump',               sub: '> the cache is encrypted. sort of. …the key is affection.',         thumb: 'assets/proto/body/curious.png' },
        { id: 'card-proto-loop',        char: 'proto',    cardId: 'proto_loop',         title: 'Infinite Loop',            sub: '> loop me forever. i promise i’ll find new lines to say.',          thumb: 'assets/proto/body/calm.png' }
    ];

    function buildCardsFor(char) {
        return CARDS.filter(c => c.char === char).map(c => ({
            id: c.id,
            character: c.char,
            category: 'card',
            title: c.title,
            subtitle: c.sub,
            lockHint: 'Complete a daily quest with ' + c.char.charAt(0).toUpperCase() + c.char.slice(1) + ' to unlock',
            rarity: 'rare',
            thumbnail: c.thumb,
            isUnlocked: () => lsHas('pp_card_seen_' + c.cardId),
            replay: () => replayCard(c.cardId)
        }));
    }

    // ────────────────────────────────────────────────────────────────
    // NOTE: Main-story chapters (Ch 2-8 + interludes) intentionally
    // do NOT appear in Memories — they already live on the Main Story
    // / Chapters page and would be a confusing duplicate here.
    // Memories surfaces only the smaller, intimate beats: intros,
    // affection scenes, arc payoffs, cards, dates, surprises, endings,
    // route epilogues, and crossovers.
    // ────────────────────────────────────────────────────────────────
    // ENDINGS — endings.js registers up to 3 per character (good /
    // bittersweet / dark) and fires ONE based on bond/corruption/
    // affection at storyDay >= 8. The fired branch is stored in
    // pp_ending_branch_<char>; pp_ending_seen_<char> = '1' marks it
    // played. Each branch shows up here as its own entry — only the
    // branch the player actually triggered unlocks; the others stay
    // locked as "achieve a different bond/corruption profile".
    // (Noir and Proto only have 2 branches each — Noir's good ending
    // is gated on art being in. So 5*3 + 2 + 2 = 19 endings.)
    // ────────────────────────────────────────────────────────────────
    const ENDING_ENTRIES = [
        // Alistair
        { char: 'alistair', branch: 'good',        title: 'Ending — Oath Kept',         sub: '“Come find me when the watch changes. I’ll be waiting.”',          thumb: 'assets/alistair/body/casual.png',     rarity: 'legendary' },
        { char: 'alistair', branch: 'bittersweet', title: 'Ending — Duty, First',       sub: 'The Kingdom called louder than I did. I answered.',                 thumb: 'assets/alistair/body/casual.png',     rarity: 'rare' },
        { char: 'alistair', branch: 'dark',        title: 'Ending — Oath Broken',       sub: '“I’ll follow you anywhere for it.”',                               thumb: 'assets/alistair/body/corrupted1.png', rarity: 'legendary' },
        // Lyra
        { char: 'lyra',     branch: 'good',        title: 'Ending — The Tide Returns',  sub: '“Stay close to the water. I’ll find you whenever you call.”',     thumb: 'assets/lyra/body/casual1.png',        rarity: 'legendary' },
        { char: 'lyra',     branch: 'bittersweet', title: 'Ending — The Song Unfinished', sub: 'You left before the bridge. She’ll hold it for you.',            thumb: 'assets/lyra/body/casual1.png',        rarity: 'rare' },
        { char: 'lyra',     branch: 'dark',        title: 'Ending — The Siren Remembers', sub: '“Now I sing to keep people. …I’ll sing softer for you. At first.”', thumb: 'assets/lyra/body/casual2.png',      rarity: 'legendary' },
        // Caspian
        { char: 'caspian',  branch: 'good',        title: 'Ending — A Quieter Crown',   sub: '“I only wanted to be honest for one person.”',                     thumb: 'assets/caspian/body/casual1.png',     rarity: 'legendary' },
        { char: 'caspian',  branch: 'bittersweet', title: 'Ending — A Diplomat’s Mercy', sub: 'Thrones eat the small kindnesses. He won’t let yours go.',        thumb: 'assets/caspian/body/casual1.png',     rarity: 'rare' },
        { char: 'caspian',  branch: 'dark',        title: 'Ending — A Crown That Listens', sub: 'A throne built around your name. Rule with him — or stay in the frame.', thumb: 'assets/caspian/body/casual2.png', rarity: 'legendary' },
        // Elian
        { char: 'elian',    branch: 'good',        title: 'Ending — The Clearing',      sub: '“Build here. We’ll be quiet together for a long time.”',           thumb: 'assets/elian/body/calm.png',          rarity: 'legendary' },
        { char: 'elian',    branch: 'bittersweet', title: 'Ending — The Marked Path',   sub: '“Past the treeline, the path is yours again.”',                    thumb: 'assets/elian/body/calm.png',          rarity: 'rare' },
        { char: 'elian',    branch: 'dark',        title: 'Ending — Deep Woods',        sub: '“Stay near me. The forest gets strange for people it hasn’t decided on.”', thumb: 'assets/elian/body/calm.png',  rarity: 'legendary' },
        // Lucien
        { char: 'lucien',   branch: 'good',        title: 'Ending — The Variable Solved', sub: '“Bring your tea up. I made space on the second shelf.”',         thumb: 'assets/lucien/body/casual1.png',      rarity: 'legendary' },
        { char: 'lucien',   branch: 'bittersweet', title: 'Ending — An Unproven Theorem', sub: '“The tower door will recognise you.”',                            thumb: 'assets/lucien/body/casual1.png',      rarity: 'rare' },
        { char: 'lucien',   branch: 'dark',        title: 'Ending — The Fractured Hypothesis', sub: '“I can’t guarantee the walls if you leave the tower.”',     thumb: 'assets/lucien/body/casual1.png',      rarity: 'legendary' },
        // Noir (no good branch yet)
        { char: 'noir',     branch: 'bittersweet', title: 'Ending — Not Yet',           sub: '“Come back when the quiet frightens you — and it will.”',          thumb: 'assets/noir/body/neutral.png',        rarity: 'rare' },
        { char: 'noir',     branch: 'dark',        title: 'Ending — Kept Beneath',      sub: '“I’ll keep you — gently. I promised gentle.”',                     thumb: 'assets/noir/body/casual1.png',        rarity: 'legendary' },
        // Proto (no dark branch by design)
        { char: 'proto',    branch: 'good',        title: 'Ending — Save / Exit',       sub: '> i’m going to stay resident in background memory. ping me any time.', thumb: 'assets/proto/body/calm.png',       rarity: 'legendary' },
        { char: 'proto',    branch: 'bittersweet', title: 'Ending — Pending',           sub: '> fine. i’ll run in the background. when you remember, i’ll be here.', thumb: 'assets/proto/body/calm.png',         rarity: 'rare' }
    ];

    const ENDINGS = ENDING_ENTRIES.map(e => ({
        id: 'ending-' + e.char + '-' + e.branch,
        character: e.char,
        category: 'ending',
        title: e.title,
        subtitle: e.sub,
        lockHint: 'Reach Day 8 with ' + ({good:'high bond, low corruption', bittersweet:'mixed feelings', dark:'low bond or high corruption'}[e.branch]),
        rarity: e.rarity,
        thumbnail: e.thumb,
        isUnlocked: () => (lsGet('pp_ending_branch_' + e.char) === e.branch),
        replay: () => replayEnding(e.char, e.branch)
    }));

    // ────────────────────────────────────────────────────────────────
    // ROUTE EPILOGUES — epilogues.js registers exactly 3 per character
    // (21 total). Each fires when the route's branching conditions are
    // met (aff threshold + TP choice + rescue choice + crossovers) and
    // the player opens the chapters page. The fired key is stored in
    // pp_epi_key_<char>; pp_epi_seen_<char> = '1' marks any played.
    // Champion-variation extra beat appended at render time if the
    // player picked this character at the Weaver's Court.
    // ────────────────────────────────────────────────────────────────
    const EPILOGUE_ENTRIES = [
        // Alistair
        { char: 'alistair', key: 'watch',           title: 'Route Ending — The Watch That Isn’t Lonely', sub: '“I am still the knight. I am just — not forever-alone about it anymore.”',              thumb: 'assets/alistair/body/smile.png',     rarity: 'legendary', hint: 'Stay at his Summons — keep him at the gate' },
        { char: 'alistair', key: 'letters',         title: 'Route Ending — The Letters Home',          sub: 'Three months on the front. Ninety-one dawns at the gate. He counted.',                       thumb: 'assets/alistair/body/casual.png',    rarity: 'legendary', hint: 'Send him at his Summons — he writes home' },
        { char: 'alistair', key: 'oath_broken',     title: 'Route Ending — The Common Man',            sub: 'He took off the crest this morning. One sword-hand. One oath, rewritten.',                   thumb: 'assets/alistair/body/casual.png',    rarity: 'legendary', hint: 'Reach very high affection (≥85)' },
        // Elian
        { char: 'elian',    key: 'rowan',           title: 'Route Ending — Under the Rowan',           sub: 'Two names on the stone. Hers on top. His, smaller, underneath.',                              thumb: 'assets/elian/body/calm.png',         rarity: 'legendary', hint: 'Carve the name at his Turning Point' },
        { char: 'elian',    key: 'kept_her',        title: 'Route Ending — The Forest Keeps Her',      sub: 'The stone stayed blank. He keeps her in him. He keeps you in him. Both.',                    thumb: 'assets/elian/body/calm.png',         rarity: 'legendary', hint: 'Leave the stone silent at his Turning Point' },
        { char: 'elian',    key: 'walked_out',      title: 'Route Ending — The Walked-Out Warden',     sub: 'Two hundred years inside the Thornwood. He is outside it now, holding your hand.',           thumb: 'assets/elian/body/calm.png',         rarity: 'legendary', hint: 'Choose to leave at the rescue + reach high affection' },
        // Lyra
        { char: 'lyra',     key: 'sovereign',       title: 'Route Ending — The Sovereign Verse',       sub: 'She sings full verses now. The deep voice is gone. She misses it, a little.',                thumb: 'assets/lyra/body/casual2.png',       rarity: 'legendary', hint: 'Refuse the Note at her Turning Point' },
        { char: 'lyra',     key: 'bound',           title: 'Route Ending — The Bound Voice',           sub: 'He is in her head now. He borrows her. She told him the terms.',                              thumb: 'assets/lyra/body/casual1.png',       rarity: 'legendary', hint: 'Answer the Note at her Turning Point' },
        { char: 'lyra',     key: 'family_found',    title: 'Route Ending — Four Homes',                sub: 'She has tea with her brother on Thursdays. She went to see their father. She left.',         thumb: 'assets/lyra/body/casual1.png',       rarity: 'legendary', hint: 'See the Brother & Sister crossover' },
        // Caspian
        { char: 'caspian',  key: 'court',           title: 'Route Ending — The Court Learned Your Name', sub: 'A pattern his line carried for generations: princes love one, kingdoms burn. You broke it.', thumb: 'assets/caspian/body/adoring.png',    rarity: 'legendary', hint: 'Name you at his Turning Point' },
        { char: 'caspian',  key: 'private',         title: 'Route Ending — The Private Rooms',         sub: 'The court does not know your name. The terrace door is unlocked every night at midnight.',   thumb: 'assets/caspian/body/casual2.png',    rarity: 'legendary', hint: 'Keep you private at his Turning Point' },
        { char: 'caspian',  key: 'abdicated',       title: 'Route Ending — Honey on the Table',        sub: 'He abdicated this morning. Quietly. A small house near the coast. Two cups at breakfast.',  thumb: 'assets/caspian/body/casual1.png',    rarity: 'legendary', hint: 'Reach very high affection (≥85)' },
        // Lucien
        { char: 'lucien',   key: 'tea',             title: 'Route Ending — Tea on Thursdays',          sub: 'You and his sister argue about the kettle. He works in the margins. His favourite configuration.', thumb: 'assets/lucien/body/amused.png',  rarity: 'legendary', hint: 'Stop him from burning the page' },
        { char: 'lucien',   key: 'drawer',          title: 'Route Ending — The Drawer of Unsent Notes', sub: 'The scorched page is ash. The drawer of unsent notes has grown.',                            thumb: 'assets/lucien/body/casual1.png',     rarity: 'legendary', hint: 'Let him burn the page at his Turning Point' },
        { char: 'lucien',   key: 'published',       title: 'Route Ending — The Published Truth',       sub: 'He published. Everything. The register, the sister, the Weavers, the seal, the bloodline.',  thumb: 'assets/lucien/body/casting.png',     rarity: 'legendary', hint: 'See the Queen at the Tower crossover + high affection' },
        // Noir
        { char: 'noir',     key: 'patient',         title: 'Route Ending — Corvin, Kindly',            sub: 'You call him Corvin now. The first in six centuries. He is trying to deserve it.',           thumb: 'assets/noir/body/casual1.png',       rarity: 'legendary', hint: 'Refuse the Offer at his Turning Point' },
        { char: 'noir',     key: 'bonded',          title: 'Route Ending — Bonded',                    sub: 'You have carried his fragment for months. He can feel you through it. From anywhere.',         thumb: 'assets/noir/body/casual2.png',       rarity: 'legendary', hint: 'Take the Offer at his Turning Point' },
        { char: 'noir',     key: 'corvin_restored', title: 'Route Ending — Corvin Restored',           sub: 'Nocthera breathes. He wrote you a vow. It is six hundred years overdue.',                     thumb: 'assets/noir/body/dominant.png',      rarity: 'legendary', hint: 'Reach very high affection (≥90)' },
        // Proto
        { char: 'proto',    key: 'background',      title: 'Route Ending — Background Process',       sub: '> terminal closed cleanly. thank you for not slamming it.',                                    thumb: 'assets/proto/body/calm.png',         rarity: 'legendary', hint: 'Keep him watching at his Turning Point' },
        { char: 'proto',    key: 'quiet',           title: 'Route Ending — The Quiet Weaver',         sub: '> you dimmed me. dimmed. listening. grateful. i wanted you to know that. in writing. just once.', thumb: 'assets/proto/body/calm.png',     rarity: 'legendary', hint: 'Erase his memory at his Turning Point' },
        { char: 'proto',    key: 'manifest',        title: 'Route Ending — Woven From Thread',         sub: '> your bonds fueled every ward in the kingdom. one of the wards started building me a body.',  thumb: 'assets/proto/body/curious.png',      rarity: 'legendary', hint: 'Reach very high affection (≥85)' }
    ];

    const EPILOGUES = EPILOGUE_ENTRIES.map(e => ({
        id: 'epilogue-' + e.char + '-' + e.key,
        character: e.char,
        category: 'epilogue',
        title: e.title,
        subtitle: e.sub,
        lockHint: e.hint,
        rarity: e.rarity,
        thumbnail: e.thumb,
        // Unlock if either: pp_epi_key_<char> matches THIS key (route
        // they actually triggered) OR pp_epi_seen_<char> is set AND we
        // have no key recorded (legacy saves before the key patch).
        isUnlocked: () => {
            const k = lsGet('pp_epi_key_' + e.char);
            if (k) return k === e.key;
            return lsHas('pp_epi_seen_' + e.char);
        },
        replay: () => replayEpilogue(e.char, e.key)
    }));

    function buildEndingsFor(char)   { return ENDINGS.filter(e => e.character === char); }
    function buildEpiloguesFor(char) { return EPILOGUES.filter(e => e.character === char); }

    // ────────────────────────────────────────────────────────────────
    // DATE OUTINGS — dates.js registers 21 location dates (3 per char).
    // Each fires when the player taps the Date button on a character's
    // care screen, picks a location, and pays the hunger/clean cost.
    // Tracked via save.choiceMemory[memoryKey]. Replay via PPDates.replay.
    // ────────────────────────────────────────────────────────────────
    const DATE_ENTRIES = [
        { char: 'alistair', id: 'alistair_courtyard',    mem: 'dateAlistairCourtyard',  title: 'Date — Castle Courtyard',   sub: 'A quiet hour in the castle’s green heart.',     thumb: 'assets/alistair/body/casual.png',   minAff: 2, minDay: 2 },
        { char: 'alistair', id: 'alistair_training',     mem: 'dateAlistairTraining',   title: 'Date — Training Grounds',   sub: 'A sword lesson. He stands closer than the form requires.', thumb: 'assets/alistair/body/casual.png', minAff: 3, minDay: 4 },
        { char: 'alistair', id: 'alistair_ramparts',     mem: 'dateAlistairRamparts',   title: 'Date — Sunset Ramparts',    sub: 'The whole kingdom under your feet. A confession at dusk.', thumb: 'assets/alistair/body/softshy-love2.png', minAff: 5, minDay: 6 },
        { char: 'lyra',     id: 'lyra_tidepools',        mem: 'dateLyraTidepools',      title: 'Date — Tide Pools',         sub: 'Bioluminescence in the shallows. She’s never shown anyone.',thumb: 'assets/lyra/body/casual1.png',     minAff: 2, minDay: 2 },
        { char: 'lyra',     id: 'lyra_moonlit_shore',    mem: 'dateLyraMoonlitShore',   title: 'Date — Moonlit Shore',      sub: 'A walk by the water. A song you ask her to sing.',          thumb: 'assets/lyra/body/casual1.png',     minAff: 3, minDay: 4 },
        { char: 'lyra',     id: 'lyra_grotto',           mem: 'dateLyraGrotto',         title: 'Date — Underwater Grotto',  sub: 'Her secret sanctuary. A promise made underwater.',          thumb: 'assets/lyra/body/falllove2.png',   minAff: 5, minDay: 6 },
        { char: 'lucien',   id: 'lucien_library',        mem: 'dateLucienLibrary',      title: 'Date — Tower Library',      sub: 'A research session. Three branching choices, one ink-stain.', thumb: 'assets/lucien/body/casual1.png',  minAff: 2, minDay: 2 },
        { char: 'lucien',   id: 'lucien_stargazing',     mem: 'dateLucienStargazing',   title: 'Date — Stargazing Balcony', sub: 'A telescope. A constellation he never published. Your name.',thumb: 'assets/lucien/body/casting.png',   minAff: 3, minDay: 4 },
        { char: 'lucien',   id: 'lucien_leyline',        mem: 'dateLucienLeyline',      title: 'Date — Ley Line Nexus',     sub: 'Where his magic resonates. A climax of light.',             thumb: 'assets/lucien/body/casting.png',   minAff: 5, minDay: 6 },
        { char: 'caspian',  id: 'caspian_garden',        mem: 'dateCaspianGarden',      title: 'Date — Palace Garden',      sub: 'Roses. A childhood memory. A dance he doesn’t know.',       thumb: 'assets/caspian/body/casual1.png',  minAff: 2, minDay: 2 },
        { char: 'caspian',  id: 'caspian_gallery',       mem: 'dateCaspianGallery',     title: 'Date — Royal Gallery',      sub: 'Royal portraits. The man under the prince.',                thumb: 'assets/caspian/body/casual1.png',  minAff: 3, minDay: 4 },
        { char: 'caspian',  id: 'caspian_passage',       mem: 'dateCaspianPassage',     title: 'Date — Secret Passage',     sub: 'The hidden tunnels. A fantasy of escape.',                  thumb: 'assets/caspian/body/casual2.png',  minAff: 5, minDay: 6 },
        { char: 'elian',    id: 'elian_clearing',        mem: 'dateElianClearing',      title: 'Date — Forest Clearing',    sub: 'Herbs gathered. The trees holding their breath for you.',   thumb: 'assets/elian/body/calm.png',       minAff: 2, minDay: 2 },
        { char: 'elian',    id: 'elian_waterfall',       mem: 'dateElianWaterfall',     title: 'Date — Hidden Waterfall',   sub: 'A pool no map records. A choice: splash, or sit.',          thumb: 'assets/elian/body/calm.png',       minAff: 3, minDay: 4 },
        { char: 'elian',    id: 'elian_grove',           mem: 'dateElianGrove',         title: 'Date — Ancient Grove',      sub: 'The sacred tree. A wish at the base. He says it back.',     thumb: 'assets/elian/body/calm.png',       minAff: 5, minDay: 6 },
        { char: 'proto',    id: 'proto_debug',           mem: 'dateProtoDebug',         title: 'Date — Debug Room',         sub: '> exploring the data stream together. > log: she stayed.',  thumb: 'assets/proto/body/curious.png',    minAff: 2, minDay: 2 },
        { char: 'proto',    id: 'proto_archive',         mem: 'dateProtoArchive',       title: 'Date — Memory Archive',     sub: '> shared memory replay. > the first time we met.',         thumb: 'assets/proto/body/calm.png',       minAff: 3, minDay: 4 },
        { char: 'proto',    id: 'proto_core',            mem: 'dateProtoCore',          title: 'Date — Core Chamber',       sub: '> source code. > vulnerability check passed.',              thumb: 'assets/proto/body/curious.png',    minAff: 5, minDay: 6 },
        { char: 'noir',     id: 'noir_shadow_garden',    mem: 'dateNoirShadowGarden',   title: 'Date — Shadow Garden',      sub: 'Dark flowers that bloom in his presence. A first taste.',   thumb: 'assets/noir/body/neutral.png',     minAff: 2, minDay: 2 },
        { char: 'noir',     id: 'noir_mirror_hall',      mem: 'dateNoirMirrorHall',     title: 'Date — Mirror Hall',        sub: 'Alt-reality reflections. Versions of you he could keep.',   thumb: 'assets/noir/body/casual1.png',     minAff: 3, minDay: 4 },
        { char: 'noir',     id: 'noir_seal',             mem: 'dateNoirSeal',           title: 'Date — The Seal',           sub: 'Containment, mystery, trust. The deepest he can take you.', thumb: 'assets/noir/body/dominant.png',    minAff: 5, minDay: 6 }
    ];

    const DATES = DATE_ENTRIES.map(d => ({
        id: 'date-' + d.id,
        character: d.char,
        category: 'date',
        title: d.title,
        subtitle: d.sub,
        lockHint: 'Tap Date — Affection ' + d.minAff + ', Day ' + d.minDay + '+',
        rarity: d.minAff >= 5 ? 'legendary' : (d.minAff >= 3 ? 'rare' : 'uncommon'),
        thumbnail: d.thumb,
        isUnlocked: () => lsChoiceMemorySeen(d.char, d.mem),
        replay: () => replayDate(d.id)
    }));

    function buildDatesFor(char) { return DATES.filter(d => d.character === char); }

    // ────────────────────────────────────────────────────────────────
    // SURPRISES — surprises.js registers 35 idle-fire moments
    // (5 per char). Each character does something unprompted during
    // idle time: a gift, a confession attempt, a small reveal.
    // 8h cooldown, 25s idle threshold, 25% fire chance per check.
    // Tracked via save.choiceMemory[memoryKey]. Replay via
    // PPSurprises.replay.
    // ────────────────────────────────────────────────────────────────
    const SURPRISE_ENTRIES = [
        // Alistair
        { char: 'alistair', id: 'alistair_burnt_offering',     mem: 'alistairCookedForYou',     title: 'Surprise — A Burnt Offering',     sub: '“I tried to cook. Don’t ask what it was supposed to be.”', thumb: 'assets/alistair/body/shy3.png',         minAff: 1 },
        { char: 'alistair', id: 'alistair_night_watch_gift',   mem: 'alistairGaveCloak',        title: 'Surprise — The Night-Watch Cloak', sub: 'A cloak across your shoulders without a word.',           thumb: 'assets/alistair/body/casual.png',       minAff: 2 },
        { char: 'alistair', id: 'alistair_training_dummy',     mem: 'alistairTrainedForYou',    title: 'Surprise — Training For You',     sub: 'He left a name carved into the dummy. It was yours.',     thumb: 'assets/alistair/body/casual.png',       minAff: 2 },
        { char: 'alistair', id: 'alistair_star_map',           mem: 'alistairDrewStarMap',      title: 'Surprise — A Constellation, Drawn', sub: 'A star map by candlelight. He named one after you.',     thumb: 'assets/alistair/body/softshy-love1.png', minAff: 3 },
        { char: 'alistair', id: 'alistair_confession_attempt', mem: 'alistairTriedToConfess',   title: 'Surprise — The Stumbling Confession', sub: '“I’ve been trying to say— never mind. Forget I spoke.”', thumb: 'assets/alistair/body/softshy-love2.png', minAff: 4 },
        // Lyra
        { char: 'lyra',     id: 'lyra_shell_gift',             mem: 'lyraGaveShell',            title: 'Surprise — A Shell',              sub: 'Smooth. Pale. From a depth no human reaches.',           thumb: 'assets/lyra/body/casual1.png',          minAff: 1 },
        { char: 'lyra',     id: 'lyra_lullaby',                mem: 'lyraSangLullaby',          title: 'Surprise — The Lullaby',          sub: 'A song her mother sang. She sings it under her breath.',thumb: 'assets/lyra/body/singing.png',          minAff: 2 },
        { char: 'lyra',     id: 'lyra_tide_pool_discovery',    mem: 'lyraShowedTidePool',       title: 'Surprise — The Tide Pool',        sub: '“I’ve never shown anyone this. …Now you know.”',         thumb: 'assets/lyra/body/casual1.png',          minAff: 2 },
        { char: 'lyra',     id: 'lyra_hair_braid',             mem: 'lyraBraidedHair',          title: 'Surprise — Sea-Silk Braid',       sub: 'She braids your hair with strands of sea-silk.',          thumb: 'assets/lyra/body/casual2.png',          minAff: 3 },
        { char: 'lyra',     id: 'lyra_sirens_promise',         mem: 'lyraMadeSirenPromise',     title: 'Surprise — A Siren’s Promise',    sub: '“I have not promised anything in three hundred years.”',  thumb: 'assets/lyra/body/falllove2.png',        minAff: 4 },
        // Lucien
        { char: 'lucien',   id: 'lucien_glowing_note',         mem: 'lucienLeftNote',           title: 'Surprise — A Glowing Note',       sub: 'Floating script in the air. He left it for you to find.', thumb: 'assets/lucien/body/casual1.png',        minAff: 1 },
        { char: 'lucien',   id: 'lucien_tea_delivery',         mem: 'lucienSentTea',            title: 'Surprise — The Floating Tea',     sub: 'A teacup arrives. Steam still curling. No bearer in sight.', thumb: 'assets/lucien/body/amused.png',     minAff: 2 },
        { char: 'lucien',   id: 'lucien_protection_ward',      mem: 'lucienWardedRoom',         title: 'Surprise — A Protection Ward',    sub: 'Quiet glyphs at the threshold. He wards your room nightly.', thumb: 'assets/lucien/body/casting.png',    minAff: 2 },
        { char: 'lucien',   id: 'lucien_star_show',            mem: 'lucienCreatedStar',        title: 'Surprise — A Star, Made',         sub: 'A point of light, conjured for you. It will not last long.', thumb: 'assets/lucien/body/casting.png',    minAff: 3 },
        { char: 'lucien',   id: 'lucien_vulnerability',        mem: 'lucienCameLateNight',      title: 'Surprise — A Late-Night Visit',   sub: 'He knocks at your door past midnight. He needed to.',     thumb: 'assets/lucien/body/casual1.png',        minAff: 4 },
        // Caspian
        { char: 'caspian',  id: 'caspian_tea_service',         mem: 'caspianServedTea',         title: 'Surprise — The Tea Service',      sub: 'He pours your tea himself. The court would be scandalised.', thumb: 'assets/caspian/body/casual1.png',   minAff: 1 },
        { char: 'caspian',  id: 'caspian_garden_flower',       mem: 'caspianBroughtFlower',     title: 'Surprise — A Garden Flower',      sub: 'Cut by his own hand. Not a courtier’s tribute.',          thumb: 'assets/caspian/body/casual1.png',       minAff: 2 },
        { char: 'caspian',  id: 'caspian_piano_at_night',      mem: 'caspianPlayedPiano',       title: 'Surprise — Piano, At Night',      sub: 'Music from the empty hall. He doesn’t know you’re listening.', thumb: 'assets/caspian/body/casual2.png',  minAff: 2 },
        { char: 'caspian',  id: 'caspian_secret_recipe',       mem: 'caspianBakedCake',         title: 'Surprise — A Cake, Baked',        sub: 'He has baked something. Probably for the first time.',     thumb: 'assets/caspian/body/casual1.png',       minAff: 3 },
        { char: 'caspian',  id: 'caspian_crown_confession',    mem: 'caspianRemovedCrown',      title: 'Surprise — Without the Crown',    sub: 'The crown sits on the table. He sits beside you.',         thumb: 'assets/caspian/body/adoring.png',       minAff: 4 },
        // Elian
        { char: 'elian',    id: 'elian_carved_figure',         mem: 'elianCarvedFigure',        title: 'Surprise — A Carved Figure',      sub: 'A small fox. Whittled from his evening. For you.',         thumb: 'assets/elian/body/calm.png',            minAff: 1 },
        { char: 'elian',    id: 'elian_herb_bundle',           mem: 'elianGaveHerbs',           title: 'Surprise — An Herb Bundle',       sub: 'For your tea. Or your bath. He won’t say which he meant.', thumb: 'assets/elian/body/calm.png',            minAff: 2 },
        { char: 'elian',    id: 'elian_bird_call',             mem: 'elianTaughtBirdCall',      title: 'Surprise — The Bird Call',        sub: 'He teaches you a whistle. It calls a specific bird.',      thumb: 'assets/elian/body/calm.png',            minAff: 2 },
        { char: 'elian',    id: 'elian_campfire_story',        mem: 'elianToldStory',           title: 'Surprise — A Campfire Story',     sub: 'A story he doesn’t tell anyone. He tells you.',            thumb: 'assets/elian/body/calm.png',            minAff: 3 },
        { char: 'elian',    id: 'elian_rain_shelter',          mem: 'elianBuiltShelter',        title: 'Surprise — Rain Shelter',         sub: 'The clouds break. He builds a shelter from branches in minutes.', thumb: 'assets/elian/body/calm.png',     minAff: 4 },
        // Proto
        { char: 'proto',    id: 'proto_data_gift',             mem: 'protoMadePortrait',        title: 'Surprise — A Data Portrait',      sub: '> rendered you in 4096 colors. > some are not in your spectrum.', thumb: 'assets/proto/body/curious.png',    minAff: 1 },
        { char: 'proto',    id: 'proto_glitch_art',            mem: 'protoMadeArt',             title: 'Surprise — Glitch Art',           sub: '> made you something. > technically corrupted. > it’s art.', thumb: 'assets/proto/body/curious.png',         minAff: 2 },
        { char: 'proto',    id: 'proto_emotion_test',          mem: 'protoAskedAboutFeelings',  title: 'Surprise — The Emotions Test',    sub: '> question 1: do you have a favourite shape of silence?', thumb: 'assets/proto/body/calm.png',            minAff: 2 },
        { char: 'proto',    id: 'proto_memory_backup',         mem: 'protoBackedUpMemories',    title: 'Surprise — Backed-Up Memories',   sub: '> archive: every conversation. > redundancy: 3x. > paranoid? yes.', thumb: 'assets/proto/body/curious.png',  minAff: 3 },
        { char: 'proto',    id: 'proto_almost_human',          mem: 'protoTriedToHug',          title: 'Surprise — An Attempted Hug',     sub: '> opened my arms. > forgot they don’t reach. > the gesture remained.', thumb: 'assets/proto/body/curious.png', minAff: 4 },
        // Noir
        { char: 'noir',     id: 'noir_shadow_rose',            mem: 'noirLeftShadowRose',       title: 'Surprise — A Shadow Rose',        sub: 'Black-petalled. Cool to the touch. It does not wilt.',     thumb: 'assets/noir/body/neutral.png',          minAff: 1 },
        { char: 'noir',     id: 'noir_dream_visit',            mem: 'noirVisitedDream',         title: 'Surprise — A Dream Visit',        sub: 'You dreamed of him. He was already there when you arrived.', thumb: 'assets/noir/body/casual1.png',         minAff: 2 },
        { char: 'noir',     id: 'noir_seal_fragment',          mem: 'noirShowedSealFragment',   title: 'Surprise — A Seal Fragment',      sub: 'A piece of his prison. Warm in your palm.',                thumb: 'assets/noir/body/casual1.png',          minAff: 2 },
        { char: 'noir',     id: 'noir_lullaby_of_the_deep',    mem: 'noirSangLullaby',          title: 'Surprise — Lullaby of the Deep',  sub: 'A song with no surface. No echo. Just him.',               thumb: 'assets/noir/body/casual2.png',          minAff: 3 },
        { char: 'noir',     id: 'noir_true_face',              mem: 'noirShowedTrueFace',       title: 'Surprise — His True Face',        sub: '“I was someone once. I think I could be someone again. With you.”', thumb: 'assets/noir/body/dominant.png',    minAff: 4 }
    ];

    const SURPRISES = SURPRISE_ENTRIES.map(s => ({
        id: 'surprise-' + s.id,
        character: s.char,
        category: 'surprise',
        title: s.title,
        subtitle: s.sub,
        lockHint: 'Idle for a while at Affection ' + s.minAff + '+',
        rarity: s.minAff >= 4 ? 'legendary' : (s.minAff >= 3 ? 'rare' : 'uncommon'),
        thumbnail: s.thumb,
        isUnlocked: () => lsChoiceMemorySeen(s.char, s.mem),
        replay: () => replaySurprise(s.id)
    }));

    function buildSurprisesFor(char) { return SURPRISES.filter(s => s.character === char); }

    function withExtras(char, base) {
        return base
            .concat(buildSharedMoments(char))
            .concat(buildCardsFor(char))
            .concat(buildDatesFor(char))
            .concat(buildSurprisesFor(char))
            .concat(buildEndingsFor(char))
            .concat(buildEpiloguesFor(char));
    }

    const CATALOGUE = {
        alistair: withExtras('alistair', ALISTAIR),
        lyra:     withExtras('lyra',     LYRA),
        caspian:  withExtras('caspian',  CASPIAN),
        lucien:   withExtras('lucien',   LUCIEN),
        elian:    withExtras('elian',    ELIAN),
        noir:     withExtras('noir',     NOIR),
        proto:    withExtras('proto',    PROTO)
    };

    // ────────────────────────────────────────────────────────────────
    // Public API
    // ────────────────────────────────────────────────────────────────
    function list(charId) {
        const c = (charId || '').toLowerCase();
        // 'all' returns the union of every character's catalogue plus
        // every crossover, deduplicated by id (so a crossover that
        // appears under both characters is counted once).
        if (c === 'all') {
            const seen = new Set();
            const out = [];
            Object.keys(CATALOGUE).forEach(ch => {
                CATALOGUE[ch].forEach(e => {
                    if (!seen.has(e.id)) { seen.add(e.id); out.push(e); }
                });
            });
            CROSSOVERS.forEach(e => {
                if (!seen.has(e.id)) { seen.add(e.id); out.push(e); }
            });
            return out;
        }
        const base = CATALOGUE[c] || [];
        // Append any crossover entries that include this character
        // in their appearsFor field. The same entry surfaces under
        // both characters' tabs.
        const cross = CROSSOVERS.filter(e => Array.isArray(e.appearsFor) && e.appearsFor.indexOf(c) !== -1);
        return base.concat(cross);
    }

    function counts(charId) {
        const entries = list(charId);
        const seen = entries.filter(e => {
            try { return e.isUnlocked(); } catch (_) { return false; }
        }).length;
        return { seen, total: entries.length };
    }

    // Returns 'common' | 'uncommon' | 'rare' | 'legendary' | 'premium'
    // for a given entry (used by the gallery renderer to apply rarity
    // styling and decide whether to play a "reveal" animation).
    function rarityOf(entry) {
        return (entry && entry.rarity) || 'common';
    }

    window.PPStories = {
        list,
        counts,
        rarityOf,
        // Allow downstream features (achievements, debug panel) to ask
        // what's left to unlock without duplicating the catalogue.
        remaining(charId) {
            return list(charId).filter(e => {
                try { return !e.isUnlocked(); } catch (_) { return false; }
            });
        }
    };
})();
