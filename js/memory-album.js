// ============================================================================
// MEMORY ALBUM — the hunger layer (Jun 2026)
// ----------------------------------------------------------------------------
// The collection ENGINE already exists (gallery.js): a rich per-character
// catalog with rarities, a checkUnlocks() that runs every care tick, story
// choices that unlockById(), and a gacha-quality reveal. What it lacked was
// the ADDICTION PSYCHOLOGY — the album was a screen you had to go find, so its
// incompleteness was never felt during play, and completing a character's set
// gave no payoff.
//
// This module is purely additive and reads the existing GallerySystem
// (window._game.gallery). It adds two things:
//
//   1. A persistent "Memories" progress affordance on the CARE screen,
//      mirroring the care-target chip on the opposite (left) edge:
//         ✦ MEMORIES   8 / 14   [▱▱▱▰▰▰▰▰]   "next: Reach Affection level"
//      Always-visible incompleteness = the pull to keep showing up. Tap opens
//      the gallery to whoever you're caring for.
//
//   2. A per-character ALBUM-COMPLETE celebration + permanent gold seal — the
//      covet-to-complete payoff. Latched once per character so it fires exactly
//      when the last memory lands, never repeats.
//
// SAFETY CONTRACT
//   - Feature-flagged on pp_main_story_enabled. Read-only on the gallery's
//     unlockedCards Set + cardsForChar() (the SAME source the album tabs use,
//     so our numbers always match what the player sees).
//   - Care-screen only; CSS bleed-guard hides it everywhere else. Mirrors the
//     care-target-chip lifecycle (scene-change mount/unmount + settle delay).
// ============================================================================
(function () {
    'use strict';

    var FLAG_KEY  = 'pp_main_story_enabled';
    var PILL_ID   = 'pp-memory-pill';
    var TOAST_ID  = 'pp-album-complete';
    var STYLES_ID = 'pp-memory-styles';
    var CARE_SETTLE_MS = 900;

    // Owner direction (Jun 2026): the care/idle screen is already busy (topbar,
    // TODAY banner, care-target chip, dialogue, stats, action bar) — the
    // persistent "Memories x/y" progress pill made it feel overcrowded. So the
    // care-screen pill is OFF. The collection itself is untouched (gallery
    // access, the per-character album-complete celebration, and the
    // album-seeding fix all still work) — only the always-on idle-screen
    // affordance is removed. Flip this to re-enable, or relocate the surfacing
    // somewhere less crowded (Chronicle, a gallery-button badge, etc.).
    var SHOW_CARE_PILL = false;

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
    function isEnabled() { return lsGet(FLAG_KEY) === '1'; }

    function activeChar() {
        var g = window._game;
        return (g && (g.characterId || g.selectedCharacter)) || lsGet('pp_cc_active_companion') || null;
    }

    // ── Read the existing album for the active character ───────────────
    // Computed EXACTLY as gallery.js renderTabs() does (cardsForChar filtered
    // by the unlockedCards Set) so the count here is identical to the count
    // the player sees inside the album. next = first still-locked memory, used
    // for the teaser line.
    function albumProgress(charId) {
        var g = window._game;
        if (!charId || !g || !g.gallery || typeof g.gallery.cardsForChar !== 'function') return null;
        try {
            var cards = g.gallery.cardsForChar(charId);
            if (!cards || !cards.length) return null;
            var set = g.gallery.unlockedCards;
            var unlocked = 0, next = null;
            cards.forEach(function (c) {
                if (set && set.has(c.id)) { unlocked++; }
                else if (!next) { next = c; }
            });
            return {
                total: cards.length,
                unlocked: unlocked,
                pct: cards.length ? unlocked / cards.length : 0,
                complete: unlocked >= cards.length,
                next: next
            };
        } catch (_) { return null; }
    }

    // A short, non-spoilery teaser for the next locked memory. The catalog's
    // unlock.condition strings are already written to be player-facing hints.
    function nextHint(p) {
        if (!p) return '';
        var left = p.total - p.unlocked;
        if (left <= 0) return '';
        if (left === 1) return 'one memory from complete';
        var cond = p.next && p.next.unlock && p.next.unlock.condition;
        return cond ? ('next · ' + cond.toLowerCase()) : (left + ' memories to find');
    }

    // ── Styles (one-shot) ──────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById(STYLES_ID)) return;
        var s = document.createElement('style');
        s.id = STYLES_ID;
        s.textContent =
            '#' + PILL_ID + ' {' +
            '  position: fixed; left: 10px; top: 130px; z-index: 9450;' +
            '  width: 116px; padding: 8px 10px 9px;' +
            '  background: linear-gradient(180deg, rgba(43,17,51,0.92) 0%, rgba(21,8,26,0.92) 100%);' +
            '  border: 1px solid rgba(212,168,91,0.36); border-radius: 12px;' +
            '  box-shadow: inset 0 1px 0 rgba(212,168,91,0.16), 0 10px 26px -10px rgba(0,0,0,0.7), 0 0 18px rgba(232,76,140,0.14);' +
            '  cursor: pointer; font-family: "Quicksand","Inter",sans-serif;' +
            '  opacity: 0; transform: translateX(-8px);' +
            '  transition: opacity 280ms ease, transform 280ms ease;' +
            '  -webkit-tap-highlight-color: transparent;' +
            '}' +
            '#' + PILL_ID + '.show { opacity: 1; transform: translateX(0); }' +
            '#' + PILL_ID + ' .pp-mem-top { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; }' +
            '#' + PILL_ID + ' .pp-mem-eyebrow {' +
            '  font-size: 7px; letter-spacing: 0.16em; font-weight: 600;' +
            '  color: rgba(232,168,91,0.85); text-transform: uppercase;' +
            '}' +
            '#' + PILL_ID + ' .pp-mem-count {' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic;' +
            '  font-size: 14px; line-height: 1; color: rgba(244,235,220,0.96);' +
            '}' +
            '#' + PILL_ID + ' .pp-mem-count b { font-style: normal; color: #F2D690; font-weight: 600; }' +
            '#' + PILL_ID + ' .pp-mem-bar {' +
            '  margin-top: 6px; width: 100%; height: 3px; border-radius: 999px;' +
            '  background: rgba(15,8,26,0.85); border: 1px solid rgba(212,168,91,0.18); overflow: hidden;' +
            '}' +
            '#' + PILL_ID + ' .pp-mem-fill {' +
            '  display: block; height: 100%; width: 0%;' +
            '  background: linear-gradient(90deg, #B8923E 0%, #F2D690 100%);' +
            '  border-radius: 999px; box-shadow: 0 0 5px rgba(232,168,91,0.55);' +
            '  transition: width 420ms cubic-bezier(0.22,1,0.36,1);' +
            '}' +
            '#' + PILL_ID + ' .pp-mem-hint {' +
            '  margin-top: 5px; font-size: 8px; letter-spacing: 0.04em; line-height: 1.25;' +
            '  color: rgba(244,235,220,0.55); font-style: italic;' +
            '}' +
            // COMPLETE state — gold seal, gentle pulse
            '#' + PILL_ID + '.is-complete {' +
            '  background: linear-gradient(180deg, rgba(122,18,36,0.85) 0%, rgba(76,14,34,0.95) 100%);' +
            '  border-color: rgba(232,168,91,0.85);' +
            '  box-shadow: inset 0 1px 0 rgba(212,168,91,0.4), 0 10px 26px -10px rgba(0,0,0,0.7), 0 0 22px rgba(232,76,140,0.45);' +
            '}' +
            '#' + PILL_ID + '.is-complete .pp-mem-count b { color: #FFE9B8; }' +
            '#' + PILL_ID + '.is-complete .pp-mem-fill { background: linear-gradient(90deg, #F2D690 0%, #FFE9B8 100%); }' +

            // Album-complete celebration toast
            '#' + TOAST_ID + ' {' +
            '  position: fixed; left: 50%; top: 26%; transform: translateX(-50%) translateY(-8px);' +
            '  z-index: 14200; max-width: 86%; padding: 16px 22px 18px;' +
            '  background: linear-gradient(180deg, rgba(43,17,51,0.97) 0%, rgba(21,8,26,0.98) 100%);' +
            '  border: 1px solid rgba(232,168,91,0.7); border-radius: 18px; text-align: center;' +
            '  box-shadow: inset 0 1px 0 rgba(212,168,91,0.3), 0 24px 60px -16px rgba(0,0,0,0.85), 0 0 64px rgba(232,168,91,0.4);' +
            '  opacity: 0; transition: opacity 420ms ease, transform 420ms ease;' +
            '  font-family: "Quicksand","Inter",sans-serif; cursor: pointer;' +
            '}' +
            '#' + TOAST_ID + '.show { opacity: 1; transform: translateX(-50%) translateY(0); }' +
            '#' + TOAST_ID + ' .pp-ac-seal {' +
            '  font-size: 30px; line-height: 1; margin-bottom: 8px;' +
            '  filter: drop-shadow(0 0 12px rgba(232,168,91,0.7));' +
            '}' +
            '#' + TOAST_ID + ' .pp-ac-eyebrow {' +
            '  font-size: 9px; letter-spacing: 0.26em; font-weight: 600; text-transform: uppercase;' +
            '  color: rgba(232,168,91,0.9); margin-bottom: 6px;' +
            '}' +
            '#' + TOAST_ID + ' .pp-ac-title {' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 19px;' +
            '  color: #fff5e6; margin-bottom: 6px; text-shadow: 0 0 12px rgba(232,168,91,0.5);' +
            '}' +
            '#' + TOAST_ID + ' .pp-ac-sub {' +
            '  font-family: "Cormorant Garamond", serif; font-size: 12.5px; line-height: 1.4;' +
            '  color: rgba(244,235,220,0.82);' +
            '}' +
            '#' + TOAST_ID + ' .pp-ac-tap {' +
            '  margin-top: 12px; font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase;' +
            '  color: rgba(232,168,91,0.7); animation: ppAcTapPulse 1.8s ease-in-out infinite;' +
            '}' +
            '@keyframes ppAcTapPulse { 0%,100% { opacity: 0.35 } 50% { opacity: 0.8 } }' +
            // Bleed guard — never show off the care screen, even if a teardown
            // loses a race during a transition (the body class is the authority).
            'body:not(.pp-screen-care) #' + PILL_ID + ' { display: none !important; }';
        document.head.appendChild(s);
    }

    // ── Pill build / refresh / remove ──────────────────────────────────
    function suitorName(charId) {
        try {
            var s = window.PPRouteGates && window.PPRouteGates._suitors && window.PPRouteGates._suitors[charId];
            if (s && s.name) return s.name;
        } catch (_) {}
        return charId ? (charId.charAt(0).toUpperCase() + charId.slice(1)) : '';
    }

    function buildPill() {
        injectStyles();
        var el = document.createElement('div');
        el.id = PILL_ID;
        el.innerHTML =
            '<div class="pp-mem-top">' +
            '  <span class="pp-mem-eyebrow">✦ Memories</span>' +
            '  <span class="pp-mem-count"></span>' +
            '</div>' +
            '<div class="pp-mem-bar"><span class="pp-mem-fill"></span></div>' +
            '<div class="pp-mem-hint"></div>';
        el.addEventListener('click', function () {
            try {
                var g = window._game;
                if (g && g.gallery && typeof g.gallery.open === 'function') {
                    // Open the album to the character we're caring for.
                    g.gallery._activeTab = activeChar() || g.gallery._activeTab || 'all';
                    g.gallery.open();
                }
            } catch (_) {}
        });
        document.body.appendChild(el);
        void el.offsetHeight;
        el.classList.add('show');
        return el;
    }

    function refreshPill(p) {
        var el = document.getElementById(PILL_ID);
        if (!el || !p) return;
        el.setAttribute('data-charid', activeChar() || '');
        var count = el.querySelector('.pp-mem-count');
        var fill  = el.querySelector('.pp-mem-fill');
        var hint  = el.querySelector('.pp-mem-hint');
        if (count) count.innerHTML = '<b>' + p.unlocked + '</b> / ' + p.total;
        if (fill)  fill.style.width = Math.round(p.pct * 100) + '%';
        if (hint)  hint.textContent = p.complete ? 'every memory, kept ✦' : nextHint(p);
        el.classList.toggle('is-complete', !!p.complete);
    }

    function removePill() {
        var el = document.getElementById(PILL_ID);
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    // ── Per-character album-complete celebration ───────────────────────
    function completeKey(charId) { return 'pp_album_complete_' + charId; }

    function maybeCelebrateComplete(charId, p) {
        if (!charId || !p || !p.complete) return;
        if (lsGet(completeKey(charId)) === '1') return;     // one-shot per char
        lsSet(completeKey(charId), '1');
        showCompleteToast(charId);
    }

    function showCompleteToast(charId) {
        injectStyles();
        var prev = document.getElementById(TOAST_ID);
        if (prev) prev.remove();
        var name = suitorName(charId);
        var el = document.createElement('div');
        el.id = TOAST_ID;
        el.innerHTML =
            '<div class="pp-ac-seal">✦</div>' +
            '<div class="pp-ac-eyebrow">Album Complete</div>' +
            '<div class="pp-ac-title">' + name + '’s Memories</div>' +
            '<div class="pp-ac-sub">Every moment you shared, kept and yours to return to.</div>' +
            '<div class="pp-ac-tap">tap to continue</div>';
        document.body.appendChild(el);
        try {
            if (typeof sounds !== 'undefined' && sounds.enabled) {
                if (typeof sounds.rarityChime === 'function') sounds.rarityChime('legendary');
                else if (typeof sounds.fanfare === 'function') sounds.fanfare();
            }
        } catch (_) {}
        void el.offsetHeight;
        el.classList.add('show');
        var done = false;
        function close() {
            if (done) return; done = true;
            el.classList.remove('show');
            setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 460);
        }
        // Wait for the player's tap (owner rule) — a once-per-character payoff
        // never auto-dismisses on a timer.
        el.addEventListener('click', close);
    }

    // ── Eligibility + lifecycle (mirrors care-target-chip) ─────────────
    function storySceneActive() {
        // The whole chapter lifecycle (incl. the between-chapter seam, when no
        // overlay is mounted but body.pp-chapter-active is still set) counts as
        // "a story scene is up" — so the pill never bleeds into the Main Story.
        if (document.body.classList.contains('pp-chapter-active')) return true;
        return !!document.querySelector(
            '#mscard-root:not(:empty), #ms-encounter-root:not(:empty),' +
            '#chp-page:not(.hidden):not(:empty), #tp-root:not(:empty),' +
            '#cinematic-overlay.visible, #intro-overlay.visible,' +
            '#story-overlay:not(.hidden), #event-overlay:not(.hidden),' +
            '#date-overlay:not(.hidden), #gift-panel:not(.hidden),' +
            '#training-panel:not(.hidden), #gallery-overlay:not(.hidden),' +
            '#card-reveal-overlay.visible, #settings-overlay:not(.hidden),' +
            '#pp-day-one-overlay'
        );
    }

    function shouldShow() {
        if (!document.body.classList.contains('pp-screen-care')) return false;
        if (storySceneActive()) return false;
        return !!albumProgress(activeChar());
    }

    var _careEnteredAt = 0;

    function update() {
        if (!isEnabled()) { removePill(); return; }
        var charId = activeChar();
        var p = albumProgress(charId);

        // Always evaluate completion, even off-screen — the last memory may land
        // from a story choice while the pill isn't mounted. (This still runs
        // even with the care-screen pill disabled.)
        if (p) maybeCelebrateComplete(charId, p);

        // Care-screen pill disabled (owner: it overcrowded the idle screen).
        // Keep any stray pill torn down; completion celebration above still runs.
        if (!SHOW_CARE_PILL) { removePill(); return; }

        if (shouldShow() && p) {
            if (_careEnteredAt && Date.now() - _careEnteredAt < CARE_SETTLE_MS) {
                var ex = document.getElementById(PILL_ID);
                if (ex && ex.getAttribute('data-charid') === charId) refreshPill(p);
                return;
            }
            var pill = document.getElementById(PILL_ID);
            if (pill && pill.getAttribute('data-charid') !== (charId || '')) { removePill(); pill = null; }
            if (!pill) buildPill();
            refreshPill(p);
        } else {
            removePill();
        }
    }

    // ── Boot ───────────────────────────────────────────────────────────
    function boot() {
        if (!isEnabled()) return;
        update();
        setInterval(update, 3000);
        document.addEventListener('pp:scene-change', function (e) {
            var scene = e && e.detail && e.detail.scene;
            if (scene && scene !== 'care') { removePill(); _careEnteredAt = 0; }
            else { _careEnteredAt = Date.now(); setTimeout(update, CARE_SETTLE_MS + 30); }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    // Dev/verification surface
    window.PPMemoryAlbum = {
        update: update,
        progress: albumProgress,
        _shouldShow: shouldShow,
        _celebrate: showCompleteToast
    };
})();
