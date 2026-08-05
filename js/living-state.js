// ============================================================================
// LIVING STATE — engine of the Living Lover system (data: js/living-pools.js).
// ----------------------------------------------------------------------------
// Pillar 1 · He wears his heart: the care screen's RESTING pose + a filter-only
//            vitality treatment continuously reflect his real condition.
// Pillar 2 · He has a today: once per care session (per 6h window) he shares a
//            mood about HIS day, deterministic per calendar day.
// Pillar 3 · He wants you back: when needy and you linger, he asks for care in
//            his own voice and the matching button breathes.
// Pillar 5 · He remembers us: echoes of your chapter choices and shared
//            memories surface in the idle stream.
// Pillar 6 · (removed) "the mend" tier-up toast — retired at owner request;
//            it served no player purpose. Inert mend: pools remain in
//            living-pools.js but are no longer read.
// (Pillar 4 · the deepening care ritual lives in dialogue.js getDialogue,
//            reading careTiers from PP_LIVING_POOLS.)
//
// DESIGN CONTRACT (unchanged from the v990 slice):
//  - One owner for the resting pose; asserts baseline only when the care
//    screen is calm (no scene / overlay / idle-life flourish / post-action
//    grace). idle-life flourishes consult flourishPoolFor() and revert onto
//    our baseline naturally.
//  - transform belongs to care-ambiance. Vitality = FILTER + animation-
//    duration only. Bubbles reuse the .pp-idle-thought look and dedupe guard.
//  - Need trumps romance. Kill switch: pp_living_state_off = '1'.
// ============================================================================
(function () {
    'use strict';

    var TICK_MS = 6000;
    var ROTATE_MS = 34000;
    var ACTION_GRACE_MS = 9000;
    var REQUEST_IDLE_MS = 25000;      // player must linger before he asks
    var REQUEST_COOLDOWN_MS = 240000; // one ask per 4 min
    var MEMORY_GAP_MS = 210000;       // memories surface at most every ~3.5 min
    var MOOD_DELAY_MS = 14000;        // mood arrives after the greeting settles

    var lastActionAt = 0;
    var lastActivityAt = Date.now();
    var lastRequestAt = 0;
    var lastMemoryAt = 0;
    var lastRotateAt = 0;
    var baselineIdx = 0;
    var currentCondition = 'steady';
    var forced = null;
    var wasOnCare = false;
    var moodTimer = null;
    var seenMemories = {};

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
    function off() { return lsGet('pp_living_state_off') === '1'; }
    function getGame() { return window._game; }
    function pools() { return window.PP_LIVING_POOLS || {}; }
    function charPools(charId) { return pools()[charId] || null; }

    // ── Condition brain (need trumps romance) ───────────────────────────
    function computeCondition(g) {
        if (forced) return forced;
        if (!g) return 'steady';
        if (g.characterLeft) return 'steady';
        if ((g.corruption || 0) >= 50) return 'steady';
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

    // ── Styles: vitality treatment + request pulse + mend toast ─────────
    function injectStyles() {
        if (document.getElementById('pp-living-state-styles')) return;
        var s = document.createElement('style');
        s.id = 'pp-living-state-styles';
        s.textContent = [
            '#game-container[data-pp-vitality] #character-body-img{transition:filter 1600ms ease;}',
            // NEGLECT MUST BE VISIBLE (Aug 2026 playtest). These were ~5-8%
            // shifts — invisible on a phone — so the tamagotchi guilt loop, the
            // single strongest reason players come back to a care game, never
            // engaged: he looked identical whether adored or starving. Deepened
            // so the FIRST glance on opening the app tells you how he has been.
            // Still a colour-grade, never a broken-looking sprite: he dims and
            // goes cold, he does not get disfigured.
            '#game-container[data-pp-vitality="starving"] #character-body-img{filter:brightness(.78) saturate(.42) contrast(.94);}',
            '#game-container[data-pp-vitality="starving"] #character-fullbody{animation-duration:7.6s;}',
            '#game-container[data-pp-vitality="hungry"] #character-body-img{filter:brightness(.90) saturate(.72);}',
            '#game-container[data-pp-vitality="unkempt"] #character-body-img{filter:brightness(.84) saturate(.50) sepia(.16);}',
            '#game-container[data-pp-vitality="weary"] #character-body-img{filter:brightness(.90) saturate(.84);}',
            '#game-container[data-pp-vitality="weary"] #character-fullbody{animation-duration:6.2s;}',
            '#game-container[data-pp-vitality="lonely"] #character-body-img{filter:brightness(.82) saturate(.58) hue-rotate(-6deg);}',
            '#game-container[data-pp-vitality="warm"] #character-body-img{filter:brightness(1.02) saturate(1.04);}',
            '#game-container[data-pp-vitality="adored"] #character-body-img{filter:brightness(1.03) saturate(1.08);}',
            '#game-container[data-pp-vitality="adored"] #character-fullbody{animation-duration:4.2s;}',
            // ── the ask: the matching care button breathes, three times ──
            '.pp-care-pulse{animation:ppls-ask 1.3s ease-in-out 3;}',
            '@keyframes ppls-ask{0%,100%{box-shadow:0 0 0 0 rgba(240,190,120,0);}50%{box-shadow:0 0 14px 3px rgba(240,190,120,.55);}}',
            '@media (prefers-reduced-motion: reduce){.pp-care-pulse{animation:none;box-shadow:0 0 10px 2px rgba(240,190,120,.4);}}'
            // Pillar 6 "the mend" toast + kingdom-bar shimmer removed (owner: no player value).
        ].join('\n');
        document.head.appendChild(s);
    }

    // ── Shared bubble (same look + dedupe class as idle-life thoughts) ──
    function bubbleBusy() {
        return !!document.querySelector('#ew-whisper, .pp-idle-thought, .noir-whisper, .pp-aenor-bubble, .pp-multirom-bubble, .adaptive-thought, #pp-care-thread-toast');
    }
    function ensureBubbleStyles() {
        if (document.getElementById('pp-idle-thought-styles') || document.getElementById('pp-ls-bubble-styles')) return;
        var s = document.createElement('style');
        s.id = 'pp-ls-bubble-styles';
        s.textContent = '.pp-idle-thought{position:fixed;top:68px;left:50%;transform:translateX(-50%) translateY(-10px);max-width:86vw;padding:9px 16px;font-family:inherit;font-style:italic;font-size:13px;line-height:1.4;color:#f0e8ff;background:linear-gradient(180deg, rgba(14,10,30,.82), rgba(26,18,44,.70));border:1px solid rgba(180,160,220,.30);border-radius:14px;box-shadow:0 8px 22px rgba(0,0,0,.40);text-align:center;opacity:0;pointer-events:none;z-index:8800;transition:opacity 480ms ease, transform 480ms ease;}.pp-idle-thought.show{opacity:.96;transform:translateX(-50%) translateY(0);}';
        document.head.appendChild(s);
    }
    function showBubble(text, holdMs) {
        if (!text || bubbleBusy()) return false;
        ensureBubbleStyles();
        var node = document.createElement('div');
        node.className = 'pp-idle-thought';
        node.textContent = text;
        document.body.appendChild(node);
        requestAnimationFrame(function () { node.classList.add('show'); });
        setTimeout(function () {
            node.classList.remove('show');
            setTimeout(function () { try { node.remove(); } catch (_) {} }, 500);
        }, holdMs || 5600);
        return true;
    }

    // ── Guards ──────────────────────────────────────────────────────────
    function onCalmCare(g) {
        if (off() || !g) return false;
        if (g.sceneActive || g.characterLeft) return false;
        if (!document.body.classList.contains('pp-screen-care')) return false;
        if (document.body.classList.contains('pp-overlay-active')) return false;
        if (window.PPOverlay && window.PPOverlay.anyOpen && window.PPOverlay.anyOpen()) return false;
        return true;
    }
    function canAssert(g) {
        if (!onCalmCare(g)) return false;
        if (window.IdleLife && window.IdleLife.isPosing && window.IdleLife.isPosing()) return false;
        if (Date.now() - lastActionAt < ACTION_GRACE_MS) return false;
        return true;
    }

    // ── Pose swap — gapless (owner Jul 2026) ────────────────────────────
    // The old opacity fade-out/in left the sprite BLANK for ~160ms between
    // poses. Fixed by PRE-DECODING the next PNG and only swapping once it is
    // ready, so the old pose holds until the new one can paint the same
    // frame — no blank, no fade, no pop. Shared with idle-life via
    // window.PPSoftSwap.
    function softSwap(img, src) {
        if (!img || !src) return;
        if (img.getAttribute('src') === src) return;
        try {
            var pre = new Image();
            pre.onload = function () { try { if (img && document.contains(img)) img.src = src; } catch (_) {} };
            pre.onerror = function () { try { img.src = src; } catch (_) {} };
            pre.src = src;
            if (pre.complete && pre.naturalWidth) img.src = src;   // already cached → instant
        } catch (_) {
            img.src = src;
        }
    }
    window.PPSoftSwap = softSwap;

    // ── Sprite resolution (bodySprites key → fallback to real filename) ─
    function resolve(charId, entry) {
        if (typeof CHARACTER === 'undefined' || !CHARACTER) return null;
        var body = (CHARACTER.bodySprites && CHARACTER.bodySprites[entry.body]) ||
                   ('assets/' + charId + '/body/' + entry.body + '.png');
        var face = entry.face && CHARACTER.faceSprites && CHARACTER.faceSprites[entry.face];
        if (Array.isArray(face)) face = face[0];
        return { body: body, face: face || null };
    }

    // ── Pillar 1: baseline assertion ────────────────────────────────────
    function applyBaseline(g) {
        if (!g) return;
        var charId = g.selectedCharacter;
        var cp = charPools(charId);
        var container = document.getElementById('game-container');

        var cond = computeCondition(g);
        var changed = cond !== currentCondition;
        currentCondition = cond;

        if (container) {
            if (cond === 'steady' || off()) container.removeAttribute('data-pp-vitality');
            else container.setAttribute('data-pp-vitality', cond);
        }

        if (!cp || !cp.conditions || !cp.conditions[cond]) return;
        if (!canAssert(g)) return;

        var pool = cp.conditions[cond].baseline;
        if (!pool || !pool.length) return;

        var now = Date.now();
        if (changed) { baselineIdx = 0; lastRotateAt = now; }
        else if (now - lastRotateAt > ROTATE_MS) { baselineIdx = (baselineIdx + 1) % pool.length; lastRotateAt = now; }

        var target = resolve(charId, pool[baselineIdx % pool.length]);
        if (!target) return;

        var bodyImg = document.getElementById('character-body-img');
        var faceImg = document.getElementById('character-face-img');
        if (!bodyImg) return;
        softSwap(bodyImg, target.body);
        if (target.face && faceImg && faceImg.getAttribute('src') !== target.face) faceImg.src = target.face;
    }

    // ── Pillar 2: his today ─────────────────────────────────────────────
    function dayHash(str) {
        var h = 0;
        for (var i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
        return Math.abs(h);
    }
    function moodWindowKey() {
        var d = new Date();
        return d.toDateString() + '-' + Math.floor(d.getHours() / 6);
    }
    function maybeShowMood(g) {
        if (!onCalmCare(g)) return;
        var charId = g.selectedCharacter;
        var cp = charPools(charId);
        if (!cp || !cp.moods || !cp.moods.length) return;
        var winKey = moodWindowKey();
        if (lsGet('pp_mood_shown_' + charId) === winKey) return;
        var mood = cp.moods[dayHash(charId + new Date().toDateString()) % cp.moods.length];
        if (showBubble(mood.text, 6400)) lsSet('pp_mood_shown_' + charId, winKey);
    }
    function onCareEnter(g) {
        clearTimeout(moodTimer);
        moodTimer = setTimeout(function () { maybeShowMood(getGame()); }, MOOD_DELAY_MS);
    }

    // ── Pillar 3: he asks ───────────────────────────────────────────────
    function maybeRequest(g) {
        if (!onCalmCare(g)) return;
        var cp = charPools(g.selectedCharacter);
        if (!cp || !cp.requests) return;
        var req = cp.requests[currentCondition];
        if (!req) return;
        var now = Date.now();
        if (now - lastActivityAt < REQUEST_IDLE_MS) return;
        if (now - lastRequestAt < REQUEST_COOLDOWN_MS) return;
        if (!showBubble(req.line, 6200)) return;
        lastRequestAt = now;
        var btn = req.btn && document.getElementById(req.btn);
        if (btn) {
            btn.classList.remove('pp-care-pulse');
            void btn.offsetWidth;
            btn.classList.add('pp-care-pulse');
            setTimeout(function () { btn.classList.remove('pp-care-pulse'); }, 4200);
        }
    }

    // ── Pillar 5: he remembers ──────────────────────────────────────────
    function maybeMemory(g) {
        if (!onCalmCare(g)) return;
        var cp = charPools(g.selectedCharacter);
        if (!cp || !cp.memories || !cp.memories.length) return;
        var now = Date.now();
        if (now - lastMemoryAt < MEMORY_GAP_MS) return;
        if (Math.random() > 0.3) { lastMemoryAt = now - (MEMORY_GAP_MS - 45000); return; }
        var eligible = [];
        for (var i = 0; i < cp.memories.length; i++) {
            var m = cp.memories[i];
            try {
                if (!seenMemories[m.text] && m.when && m.when(g, lsGet)) eligible.push(m);
            } catch (_) {}
        }
        if (!eligible.length) { lastMemoryAt = now; return; }
        var pick = eligible[Math.floor(Math.random() * eligible.length)];
        if (showBubble(pick.text, 6600)) {
            seenMemories[pick.text] = 1;   // once per session — memories should feel rare
            lastMemoryAt = now;
        }
    }

    // ── Pillar 6 "the mend" removed (owner: the "✦ the weave mends ✦"
    //    tier-up toast served no player purpose). Trigger, render, CSS, and
    //    public hooks all gone; the inert mend: pools in living-pools.js are
    //    now unused. ──────────────────────────────────────────────────────

    // ── Public API ──────────────────────────────────────────────────────
    window.PPLivingState = {
        condition: function () { return currentCondition; },
        flourishPoolFor: function (charId) {
            if (off()) return null;
            var cp = charPools(charId);
            if (!cp || !cp.conditions) return null;
            var set = cp.conditions[currentCondition];
            return (set && set.flourishes && set.flourishes.length) ? set.flourishes : null;
        },
        refresh: function () { applyBaseline(getGame()); },
        _force: function (cond) { forced = cond || null; lastActionAt = 0; applyBaseline(getGame()); },
        _testMood: function () { lsSet('pp_mood_shown_' + (getGame() || {}).selectedCharacter, ''); maybeShowMood(getGame()); },
        _testRequest: function () { lastActivityAt = 0; lastRequestAt = 0; maybeRequest(getGame()); }
    };

    // ── Wiring ──────────────────────────────────────────────────────────
    function tick() {
        var g = getGame();
        var onCare = document.body.classList.contains('pp-screen-care');
        if (onCare && !wasOnCare) onCareEnter(g);
        wasOnCare = onCare;
        applyBaseline(g);
        maybeRequest(g);
        maybeMemory(g);
    }
    function init() {
        injectStyles();
        document.querySelectorAll('.action-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                lastActionAt = Date.now();
                lastActivityAt = Date.now();
            }, true);
        });
        document.addEventListener('pointerdown', function () { lastActivityAt = Date.now(); }, true);
        setInterval(tick, TICK_MS);
        setTimeout(function () { tick(); }, 4000);
    }

    var poll = setInterval(function () {
        if (window._game && window._game.tickInterval) {
            clearInterval(poll);
            init();
        }
    }, 500);
})();
