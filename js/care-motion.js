// ============================================================================
// CARE MOTION (Jul 2026) — Tier-2 idle presentation pilot.
// ----------------------------------------------------------------------------
// For characters with a generated idle loop (Higgsfield seedance, start frame
// = end frame so the loop is seamless), the care screen's calm idle is a
// LIVING SCENE: the character breathing, weight settling, cape drifting,
// candlelight moving — a true motion clip of his own room + art.
//
// CONTRACT:
//  - PILOT: Alistair only (CLIPS map). No clip → module is inert for that
//    character; the Tier-1 living-motion sprite idle is always the fallback.
//  - The clip is the IDLE presentation only. Any action, scene, overlay or
//    pose flourish fades the video out fast and hands back to the sprite;
//    it returns after the same calm-grace living-state uses. A sword swing
//    should snap; a video should never sit on top of gameplay.
//  - Sits at z-index 1 inside #game-container: above the room background,
//    below every UI layer. While active, body gets .pp-care-motion-active
//    which hides ONLY the sprite stack (#character-fullbody + #pp-care-amb).
//  - Inherits the living-state vitality filter (starving = dim, adored =
//    warm) so the clip obeys the same tamagotchi truth as the sprite.
//  - Muted, playsinline, loop; paused when tab hidden; disabled under
//    prefers-reduced-motion. Kill switch: pp_care_motion_off = '1'.
// ============================================================================
(function () {
    'use strict';

    var CLIPS = {
        alistair: 'assets/motion/care-alistair-idle.mp4'
    };

    var CALM_DELAY_MS = 6000;    // must be calm this long before the clip fades in
    var FADE_IN_MS = 650;
    var FADE_OUT_MS = 220;

    var video = null;
    var activeChar = null;
    var calmSince = 0;
    var lastBusyAt = Date.now();
    var failed = {};             // charId → true when the clip 404s / errors

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function off() {
        if (lsGet('pp_care_motion_off') === '1') return true;
        try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true; } catch (_) {}
        return false;
    }
    function getGame() { return window._game; }

    function injectStyles() {
        if (document.getElementById('pp-care-motion-styles')) return;
        var s = document.createElement('style');
        s.id = 'pp-care-motion-styles';
        s.textContent = [
            '#pp-care-motion-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;',
            'z-index:1;opacity:0;pointer-events:none;transition:opacity ' + FADE_IN_MS + 'ms ease;}',
            '#pp-care-motion-video.show{opacity:1;}',
            '#pp-care-motion-video.hiding{transition:opacity ' + FADE_OUT_MS + 'ms ease;opacity:0;}',
            // hide only the sprite stack while the living scene plays
            'body.pp-care-motion-active #character-fullbody,',
            'body.pp-care-motion-active #pp-care-amb{visibility:hidden;}',
            // the clip obeys the same vitality truth as the sprite
            '#game-container[data-pp-vitality="starving"] #pp-care-motion-video{filter:brightness(.92) saturate(.76);}',
            '#game-container[data-pp-vitality="hungry"] #pp-care-motion-video{filter:brightness(.96) saturate(.88);}',
            '#game-container[data-pp-vitality="unkempt"] #pp-care-motion-video{filter:brightness(.95) saturate(.72) sepia(.08);}',
            '#game-container[data-pp-vitality="weary"] #pp-care-motion-video{filter:brightness(.94) saturate(.9);}',
            '#game-container[data-pp-vitality="lonely"] #pp-care-motion-video{filter:brightness(.93) saturate(.82);}',
            '#game-container[data-pp-vitality="warm"] #pp-care-motion-video{filter:brightness(1.02) saturate(1.04);}',
            '#game-container[data-pp-vitality="adored"] #pp-care-motion-video{filter:brightness(1.03) saturate(1.08);}'
        ].join('\n');
        document.head.appendChild(s);
    }

    function calmNow(g) {
        if (!g) return false;
        if (g.sceneActive || g.characterLeft) return false;
        if (!document.body.classList.contains('pp-screen-care')) return false;
        if (document.body.classList.contains('pp-overlay-active')) return false;
        if (window.PPOverlay && window.PPOverlay.anyOpen && window.PPOverlay.anyOpen()) return false;
        if (window.IdleLife && window.IdleLife.isPosing && window.IdleLife.isPosing()) return false;
        return true;
    }

    function ensureVideo(charId) {
        var gc = document.getElementById('game-container');
        if (!gc) return null;
        if (video && activeChar === charId) return video;
        removeVideo();
        video = document.createElement('video');
        video.id = 'pp-care-motion-video';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('aria-hidden', 'true');
        video.preload = 'auto';
        video.src = CLIPS[charId];
        video.addEventListener('error', function () {
            failed[charId] = true;
            hide(true);
        });
        activeChar = charId;
        // first child after the background paints under every UI sibling
        gc.insertBefore(video, gc.firstChild);
        return video;
    }

    function removeVideo() {
        if (video) { try { video.pause(); video.remove(); } catch (_) {} }
        video = null;
        activeChar = null;
        document.body.classList.remove('pp-care-motion-active');
    }

    function show(charId) {
        var v = ensureVideo(charId);
        if (!v) return;
        var p = v.play();
        if (p && p.catch) p.catch(function () { failed[charId] = true; hide(true); });
        v.classList.remove('hiding');
        // reflow so the fade-in transition applies from opacity 0
        void v.offsetWidth;
        v.classList.add('show');
        document.body.classList.add('pp-care-motion-active');
    }

    function hide(instant) {
        document.body.classList.remove('pp-care-motion-active');
        if (!video) return;
        if (instant) { removeVideo(); return; }
        var v = video;
        v.classList.add('hiding');
        v.classList.remove('show');
        setTimeout(function () {
            if (v === video && !v.classList.contains('show')) { try { v.pause(); } catch (_) {} }
        }, FADE_OUT_MS + 60);
    }

    function tick() {
        var g = getGame();
        if (off() || !g) { hide(true); return; }
        var charId = g.selectedCharacter;
        if (!CLIPS[charId] || failed[charId]) { hide(true); return; }
        if (document.hidden) { if (video) try { video.pause(); } catch (_) {} return; }

        if (!calmNow(g)) {
            lastBusyAt = Date.now();
            if (video && video.classList.contains('show')) hide(false);
            return;
        }
        // calm — wait out the grace, then breathe the scene in
        if (Date.now() - lastBusyAt < CALM_DELAY_MS) return;
        if (!video || !video.classList.contains('show') || activeChar !== charId) show(charId);
        else if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function(){}); }
    }

    function init() {
        injectStyles();
        // any care action = busy immediately (the sprite must respond, not the film)
        document.querySelectorAll('.action-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                lastBusyAt = Date.now();
                hide(false);
            }, true);
        });
        document.addEventListener('visibilitychange', function () {
            if (document.hidden && video) { try { video.pause(); } catch (_) {} }
        });
        setInterval(tick, 1500);
    }

    var poll = setInterval(function () {
        if (window._game && window._game.tickInterval) {
            clearInterval(poll);
            init();
        }
    }, 500);
})();
