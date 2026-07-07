// ============================================================================
// LIVING STATE (Jul 2026) — Pillar 1 of the Living Lover system:
// "He wears his heart — and his hunger."
// ----------------------------------------------------------------------------
// The care screen's resting body/face now REFLECT the character's real
// condition, continuously. Starving → he stands in his hungry art, a shade
// dimmer, breathing slower. Neglected → he droops into soft-sad. Adored and
// well-tended → he rests in warm, open poses. Feed him while he's starving
// and you SEE him come back to himself. This is the tamagotchi feedback loop
// the care screen was missing: the character is readable at a glance.
//
// DESIGN CONTRACT:
//  - One owner for the resting pose. This module asserts the BASELINE only:
//    on the care screen, no scene active, idle-life not mid-flourish, and
//    not within the post-action grace window (action art must play out).
//    idle-life's 15–40s flourishes still play on top — and consult
//    PPLivingState.flourishPoolFor() so the flourish MATCHES the condition —
//    then revert back to our baseline naturally (they restore whatever src
//    they found).
//  - Transform is owned by care-ambiance (breathe + weight-shift). We never
//    touch transform: the vitality treatment is FILTER + animation-duration
//    only, via [data-pp-vitality] on #game-container.
//  - Need trumps romance: starving wins over adored. A proper tamagotchi
//    guilt-trips you before it flirts with you.
//  - VERTICAL SLICE: Alistair only. Other characters return null everywhere
//    → their behavior is exactly as before. Roll-out = add pools per char.
//  - Feature-flag kill-switch: localStorage pp_living_state_off = '1'.
//  - All writes are sprite src + one data attribute. No game-state mutation.
// ============================================================================
(function () {
    'use strict';

    var TICK_MS = 6000;          // condition poll cadence
    var ROTATE_MS = 34000;       // rotate baseline pose within the pool
    var ACTION_GRACE_MS = 9000;  // let action/feed/wash art play before re-asserting
    var lastActionAt = 0;
    var lastRotateAt = 0;
    var baselineIdx = 0;
    var currentCondition = 'steady';
    var forced = null;           // dev/test override via PPLivingState._force()

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function off() { return lsGet('pp_living_state_off') === '1'; }
    function getGame() { return window._game; }

    // ── Condition brain ─────────────────────────────────────────────────
    // Priority: physical need > grooming > tiredness > loneliness > romance.
    function computeCondition(g) {
        if (forced) return forced;
        if (!g) return 'steady';
        if (g.characterLeft) return 'steady';                 // left-state art owns this
        if ((g.corruption || 0) >= 50) return 'steady';       // corruption visuals own this
        var hunger = g.hunger != null ? g.hunger : 100;
        var clean  = g.clean  != null ? g.clean  : 100;
        var bond   = g.bond   != null ? g.bond   : 100;
        var aff    = g.affectionLevel || 0;
        var hour   = new Date().getHours();

        if (hunger < 14) return 'starving';
        if (clean  < 22) return 'unkempt';
        if (hunger < 38) return 'hungry';
        if ((hour >= 23 || hour < 6) && bond > 25) return 'weary';
        if (bond < 28) return 'lonely';
        var tended = hunger >= 60 && clean >= 55 && bond >= 55;
        if (tended && aff >= 3) return 'adored';
        if (tended && aff >= 1) return 'warm';
        return 'steady';
    }

    // ── Alistair — the vertical slice ───────────────────────────────────
    // Voice rule: twenty years of discipline. He cannot ASK for care —
    // duty forbids it — so every need arrives as an understatement or a
    // report. The thought lines do the asking his mouth won't.
    // body/face values are CHARACTER sprite KEYS (resolved at apply time).
    var ALISTAIR = {
        starving: {
            baseline: [{ body: 'hungry1', face: 'sad' }, { body: 'hungry2', face: 'sad' }],
            flourishes: [
                { body: 'hungry2', face: 'sad', duration: 6000, thoughtChance: 0.75, thought: "Missed mess call again. It's nothing, mi'lady." },
                { body: 'hungry1', face: 'neutral', duration: 6000, thoughtChance: 0.75, thought: "A soldier eats when the duty allows. The duty has not allowed." },
                { body: 'soft-sad', face: 'sad', duration: 5000, thoughtChance: 0.6, thought: "The kitchens are far. The wall is close. The wall keeps winning." }
            ]
        },
        hungry: {
            baseline: [{ body: 'hungry1', face: 'neutral' }],
            flourishes: [
                { body: 'hungry2', face: 'neutral', duration: 5000, thoughtChance: 0.5, thought: "The kitchens will still be open later. ...Later, then." },
                { body: 'thinking1', face: 'neutral', duration: 5000, thoughtChance: 0.4, thought: "Rations at dawn. That was some time ago now." }
            ]
        },
        unkempt: {
            baseline: [{ body: 'wondering', face: 'neutral' }, { body: 'confuse', face: 'neutral' }],
            flourishes: [
                { body: 'confuse', face: 'neutral', duration: 5000, thoughtChance: 0.65, thought: "Still in yesterday's gambeson. Forgive the state of me." },
                { body: 'lookaround1', face: 'neutral', duration: 5000, thoughtChance: 0.5, thought: "Mud from the west gate. I meant to see to it before you came." }
            ]
        },
        weary: {
            baseline: [{ body: 'sleepy1', face: 'sad' }, { body: 'sleepy2', face: 'sad' }],
            flourishes: [
                { body: 'sleepy3', face: 'sad', duration: 6500, thoughtChance: 0.6, thought: "Third watch in a row. I have stood longer. ...Not gladly." },
                { body: 'sleepy2', face: 'gentle', duration: 6000, thoughtChance: 0.6, thought: "It is late, mi'lady. You should rest. I will keep the watch." }
            ]
        },
        lonely: {
            baseline: [{ body: 'soft-sad', face: 'sad' }, { body: 'thinking1', face: 'sad' }],
            flourishes: [
                { body: 'soft-sad', face: 'sad', duration: 6000, thoughtChance: 0.7, thought: "The post is fine. The quiet has been loud, lately." },
                { body: 'thinking2', face: 'sad', duration: 6000, thoughtChance: 0.7, thought: "I caught myself listening for your step on the stair." },
                { body: 'lookaround2', face: 'neutral', duration: 5000, thoughtChance: 0.5, thought: "Nothing to report. No one to report it to." }
            ]
        },
        warm: {
            baseline: [{ body: 'smile', face: 'gentle' }, { body: 'casual', face: 'gentle' }],
            flourishes: [
                { body: 'smile1', face: 'happy', duration: 5000, thoughtChance: 0.4, thought: "You came by. The day improves." },
                { body: 'laugh1', face: 'happy', duration: 4000, thoughtChance: 0.35, thought: "The watch is easier to stand, knowing you will pass this way." },
                { body: 'lookaround1', face: 'gentle', duration: 5000, thoughtChance: 0.3, thought: "All quiet. Good. More time to stand here with you." }
            ]
        },
        adored: {
            baseline: [{ body: 'softshy-love1', face: 'love' }, { body: 'fallinlove1', face: 'gentle' }, { body: 'smile1', face: 'love' }],
            flourishes: [
                { body: 'fallinlove2', face: 'love', duration: 5500, thoughtChance: 0.45, thought: "Twenty years of discipline. You undo it by walking in." },
                { body: 'softshy-love2', face: 'shy', duration: 5000, thoughtChance: 0.45, thought: "I used to guard the gate. Now I watch the stair." },
                { body: 'fallinlove3', face: 'love', duration: 5000, thoughtChance: 0.4, thought: "If the Captain could see himself now. ...He can. He does not mind." },
                { body: 'winks1', face: 'wink', duration: 4000, thoughtChance: 0.25 }
            ]
        }
        // 'steady' intentionally absent → default idle-life pool, untouched baseline.
    };

    var POOLS = { alistair: ALISTAIR };

    // ── Vitality treatment (filter + breathing tempo only; no transform) ─
    function injectStyles() {
        if (document.getElementById('pp-living-state-styles')) return;
        var s = document.createElement('style');
        s.id = 'pp-living-state-styles';
        s.textContent = [
            // smooth filter changes so state shifts read as a slow change of
            // light on him, not a snap
            '#game-container[data-pp-vitality] #character-body-img{transition:filter 1600ms ease;}',
            // unwell = dimmer, drained of colour; breath slows
            '#game-container[data-pp-vitality="starving"] #character-body-img{filter:brightness(.92) saturate(.76);}',
            '#game-container[data-pp-vitality="starving"] #character-fullbody{animation-duration:6.8s;}',
            '#game-container[data-pp-vitality="hungry"] #character-body-img{filter:brightness(.96) saturate(.88);}',
            '#game-container[data-pp-vitality="unkempt"] #character-body-img{filter:brightness(.95) saturate(.72) sepia(.08);}',
            '#game-container[data-pp-vitality="weary"] #character-body-img{filter:brightness(.94) saturate(.9);}',
            '#game-container[data-pp-vitality="weary"] #character-fullbody{animation-duration:6.2s;}',
            '#game-container[data-pp-vitality="lonely"] #character-body-img{filter:brightness(.93) saturate(.82);}',
            // loved and tended = a touch of warmth and life; breath quickens softly
            '#game-container[data-pp-vitality="warm"] #character-body-img{filter:brightness(1.02) saturate(1.04);}',
            '#game-container[data-pp-vitality="adored"] #character-body-img{filter:brightness(1.03) saturate(1.08);}',
            '#game-container[data-pp-vitality="adored"] #character-fullbody{animation-duration:4.2s;}'
        ].join('\n');
        document.head.appendChild(s);
    }

    // ── Guards ──────────────────────────────────────────────────────────
    function canAssert(g) {
        if (off() || !g) return false;
        if (g.sceneActive || g.characterLeft) return false;
        if (!document.body.classList.contains('pp-screen-care')) return false;
        if (document.body.classList.contains('pp-overlay-active')) return false;
        if (window.PPOverlay && window.PPOverlay.anyOpen && window.PPOverlay.anyOpen()) return false;
        if (window.IdleLife && window.IdleLife.isPosing && window.IdleLife.isPosing()) return false;
        if (Date.now() - lastActionAt < ACTION_GRACE_MS) return false;
        return true;
    }

    function resolve(entry) {
        if (typeof CHARACTER === 'undefined' || !CHARACTER) return null;
        var body = CHARACTER.bodySprites && CHARACTER.bodySprites[entry.body];
        var face = CHARACTER.faceSprites && CHARACTER.faceSprites[entry.face];
        if (Array.isArray(face)) face = face[0];
        if (!body) return null;
        return { body: body, face: face || null };
    }

    // ── Baseline assertion ──────────────────────────────────────────────
    function applyBaseline(g) {
        var charId = g.selectedCharacter;
        var pools = POOLS[charId];
        var container = document.getElementById('game-container');

        var cond = computeCondition(g);
        var changed = cond !== currentCondition;
        currentCondition = cond;

        // vitality attribute always tracks condition (cheap, css-only)
        if (container) {
            if (cond === 'steady') container.removeAttribute('data-pp-vitality');
            else container.setAttribute('data-pp-vitality', cond);
        }

        if (!pools || !pools[cond]) return;   // steady, or character not yet rolled out
        if (!canAssert(g)) return;

        var pool = pools[cond].baseline;
        if (!pool || !pool.length) return;

        var now = Date.now();
        if (changed) { baselineIdx = 0; lastRotateAt = now; }
        else if (now - lastRotateAt > ROTATE_MS) { baselineIdx = (baselineIdx + 1) % pool.length; lastRotateAt = now; }

        var target = resolve(pool[baselineIdx % pool.length]);
        if (!target) return;

        var bodyImg = document.getElementById('character-body-img');
        var faceImg = document.getElementById('character-face-img');
        if (!bodyImg) return;

        // only write when drifted — never churn the DOM every tick
        if (bodyImg.getAttribute('src') !== target.body) bodyImg.src = target.body;
        if (target.face && faceImg && faceImg.getAttribute('src') !== target.face) faceImg.src = target.face;
    }

    // ── Public API ──────────────────────────────────────────────────────
    window.PPLivingState = {
        condition: function () { return currentCondition; },
        // idle-life consults this so flourishes match the condition
        flourishPoolFor: function (charId) {
            if (off() || forced === null && !getGame()) return null;
            var pools = POOLS[charId];
            if (!pools) return null;
            var set = pools[currentCondition];
            return (set && set.flourishes && set.flourishes.length) ? set.flourishes : null;
        },
        refresh: function () { applyBaseline(getGame()); },
        _force: function (cond) { forced = cond || null; lastActionAt = 0; applyBaseline(getGame()); }
    };

    // ── Wiring ──────────────────────────────────────────────────────────
    function init() {
        injectStyles();
        // instant re-read shortly after any care action, so feeding a starving
        // knight visibly brings him back once the eating art finishes
        document.querySelectorAll('.action-btn').forEach(function (btn) {
            btn.addEventListener('click', function () { lastActionAt = Date.now(); }, true);
        });
        setInterval(function () { applyBaseline(getGame()); }, TICK_MS);
        // first assert soon after the care screen settles
        setTimeout(function () { applyBaseline(getGame()); }, 4000);
    }

    var poll = setInterval(function () {
        if (window._game && window._game.tickInterval) {
            clearInterval(poll);
            init();
        }
    }, 500);
})();
