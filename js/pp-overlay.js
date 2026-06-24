// ============================================================
//  PP-OVERLAY — overlay coordination helper
//  ────────────────────────────────────────────────────────────
//  Background: by May 2026 the codebase had ~17 overlay systems
//  (gallery, letter, settings, gift, training, event, cinematic,
//   chapter, mscard, intro, etc.) each implementing its own
//  show/hide / z-index / topbar-bleed-fix. The result was
//  recurring "topbar leaks through overlay" bugs every time a
//  new overlay was added — fixed only by manually editing the
//  long :has() selector list in style.css.
//
//  This helper provides ONE convention any overlay can opt into:
//
//      PPOverlay.show('my-overlay-id')   // mark up
//      PPOverlay.hide('my-overlay-id')   // mark down
//
//  When at least one overlay is "up", body.pp-overlay-active
//  is set, which the topbar-hide and select-screen-hide CSS
//  rules already match. Counter is reference-counted so
//  concurrent overlays don't fight (close one → other still
//  marks the body until ALL are hidden).
//
//  This is a non-breaking adoption: existing overlays keep
//  working via the legacy explicit-id selectors. New overlays
//  should use this helper, and over time we migrate the legacy
//  ones to this convention and drop the explicit list.
// ============================================================

(function () {
    'use strict';

    // Stack of currently-shown overlay ids. Use a stack (not a counter)
    // so a buggy double-hide doesn't drop the body class while another
    // overlay is still up. Idempotent on duplicate show.
    const _stack = new Set();
    const BODY_CLASS = 'pp-overlay-active';

    // ── Canonical overlay registry (Jun 2026 — SINGLE SOURCE OF TRUTH) ────
    // Historically "is an overlay open?" was answered by THREE lists that
    // drifted apart — the :has() enumeration in style.css, this file's
    // watchdog, and per-module selector strings — which is the root cause of
    // the recurring "topbar/chip bleeds through an overlay" bugs. (They HAD
    // drifted: the watchdog suppressed #date-overlay / #tp-root but the CSS
    // did not, so those scenes could bleed.) Now there is ONE list. The
    // chip-hiding CSS is GENERATED from it, and the watchdog reads it too. To
    // make a new overlay hide the floating care chips, add its selector HERE
    // and nowhere else.
    //
    // Each selector matches ONLY while that overlay is genuinely open:
    // class-toggled overlays use :not(.hidden)/.visible/.show; containers left
    // mounted-but-empty after a scene use :not(:empty).
    const OVERLAY_SELECTORS = [
        '#gallery-overlay:not(.hidden)',
        '#letter-overlay:not(.hidden)',
        '#settings-overlay:not(.hidden)',
        '#event-overlay:not(.hidden)',
        '#gift-panel:not(.hidden)',
        '#training-panel:not(.hidden)',
        '#date-overlay:not(.hidden)',
        '#story-overlay:not(.hidden)',
        '#cinematic-overlay.visible',
        '#intro-overlay.visible',
        '#pp-ready-overlay.show',
        '#pp-chain-toast.show',
        '#chp-page:not(:empty)',
        '#mscard-root:not(:empty)',
        '#ms-encounter-root:not(:empty)',
        '#tp-root:not(:empty)',
        // The Letters ARCHIVE page (NOT #letter-overlay, which is a single
        // letter being read). It was missing here AND from the coordinator's
        // beat-gate, so an ambient beat fired on top of the open archive.
        '#pp-letters-overlay.show',
        // The Heart Threads "Bonds & Rewards" economy panel (economy.js).
        '#pp-economy-overlay.show',
        // The "TODAY" / Daily page (today-hub.js #pp-today-overlay). It calls
        // PPOverlay.show('today-hub') so body.pp-overlay-active is set, but it was
        // missing from THIS list — so anyOpen() couldn't see it and an auto-firing
        // story card (alistair-arc "THE FAILURE") bled over the Daily page.
        '#pp-today-overlay.show'
    ];
    // Floating care-screen chips that must hide while any overlay is up.
    const HIDDEN_CHIPS = ['#pp-care-progress', '#dp-banner', '#pp-letters-btn', '#chp-orb',
        // The care-target / "NEXT route" chip stays MOUNTED on the care screen
        // (care-target-chip.js no longer unmounts it for overlays); CSS hides it
        // instantly whenever any registered overlay is open and reveals it again
        // on close — no flash on other pages, no reappear-lag on return.
        '#pp-care-target-chip'];

    // Generate + inject the per-overlay :has() chip-hide CSS from the list
    // above, ONCE. This replaces the long hand-maintained :has() enumeration
    // that used to live in style.css (now reduced to the static class-based
    // fallback rules). The class triggers (pp-overlay-active /
    // pp-chain-in-progress) stay in the stylesheet so chip-hiding still works
    // even if this injection ever fails.
    function injectChipHideCSS() {
        try {
            if (document.getElementById('pp-overlay-chip-hide')) return;
            const sels = [];
            OVERLAY_SELECTORS.forEach(function (s) {
                HIDDEN_CHIPS.forEach(function (chip) { sels.push('body:has(' + s + ') ' + chip); });
            });
            const style = document.createElement('style');
            style.id = 'pp-overlay-chip-hide';
            style.textContent = sels.join(',\n') + ' { display: none !important; }';
            (document.head || document.documentElement).appendChild(style);
        } catch (_) { /* injection failed — static CSS fallback still covers the common cases */ }
    }
    injectChipHideCSS();

    // ── Care-content bleed guard (Jun 2026) ──────────────────────────────
    // The ambient / auto care-content overlays (small-moments, idle thoughts,
    // whispers, scheduled-moment cards, the Living Bond anchor, care chips)
    // gate on "are we on the care screen?" — but the Main Story page (#chp-page)
    // and other story surfaces open AS AN OVERLAY while body.pp-screen-care is
    // still set, so that content rendered ON TOP of the Main Story (owner bug:
    // "Elian's care content bled onto the Main Story page — every care route
    // must not bleed here"). This hides ALL of it whenever a covering story /
    // page surface is open — one rule, every route. (Player-initiated care
    // panels like gift/training are deliberately NOT in this list.)
    var CARE_CONTENT_SELECTORS = [
        '#pp-sm-root', '#pp-sched-root', '#pp-invite-anchor',
        '#cc-bubble', '#noir-whisper', '#ew-whisper', '#adaptive-thought',
        '#pp-aenor-bubble', '#pp-multirom-bubble', '#pp-care-thread-toast',
        '.pp-idle-thought', '#pp-care-target-chip', '#pp-memory-pill', '#pp-letter-notify',
        '#pp-letters-overlay', '#pp-letter-arrival', '#pp-env-overlay'
    ];
    // The care SCREEN itself (not an ambient overlay) — its base art + HUD also
    // bleeds through the gap BETWEEN chapters (cinematic unmounted, list not yet
    // remounted) while body.pp-screen-care is still set. Hidden under the same
    // conditions as care content.
    var CARE_SURFACE_SELECTORS = ['#game-container'];
    var COVERING_SURFACES = [
        '#chp-page:not(:empty)', '#main-story-page:not(.hidden)',
        '#story-overlay:not(.hidden)', '#mscard-root:not(:empty)',
        '#ms-encounter-root:not(:empty)', '#tp-root:not(:empty)',
        '#cinematic-overlay.visible'
    ];
    function injectCareBleedGuardCSS() {
        try {
            if (document.getElementById('pp-care-bleed-guard')) return;
            var sels = [];
            CARE_CONTENT_SELECTORS.forEach(function (care) {
                COVERING_SURFACES.forEach(function (surf) {
                    sels.push('body:has(' + surf + ') ' + care);
                });
                // Also hide care content for the WHOLE chapter lifecycle —
                // including the between-chapter SEAM, when the cinematic has
                // unmounted and the list hasn't remounted yet, so no covering
                // surface is in the DOM but body.pp-chapter-active is still set.
                sels.push('body.pp-chapter-active ' + care);
            });
            // The care SCREEN itself (base art + HUD, #game-container) bleeds in
            // that same seam while body.pp-screen-care stays set. Key it ONLY on
            // pp-chapter-active — the same signal select.css already trusts to
            // hide #select-screen, reliably set across the chapter lifecycle and
            // cleared when the list remounts (or via the 1.2s safety net).
            // Deliberately NOT keyed on :has(#chp-page): a lingering chp-page
            // would then wrongly hide the care screen after returning to care.
            CARE_SURFACE_SELECTORS.forEach(function (surf) {
                sels.push('body.pp-chapter-active ' + surf);
            });
            var style = document.createElement('style');
            style.id = 'pp-care-bleed-guard';
            style.textContent = sels.join(',\n') + ' { display: none !important; }';
            (document.head || document.documentElement).appendChild(style);
        } catch (_) { /* :has() unsupported or DOM not ready — trigger guards still apply */ }
    }
    injectCareBleedGuardCSS();

    function _refresh() {
        try {
            if (_stack.size > 0) {
                document.body.classList.add(BODY_CLASS);
            } else {
                document.body.classList.remove(BODY_CLASS);
            }
        } catch (_) { /* DOM not ready — caller can retry */ }
    }

    function show(id) {
        if (!id) return;
        _stack.add(id);
        _refresh();
    }

    function hide(id) {
        if (!id) return;
        _stack.delete(id);
        _refresh();
    }

    // Force-clear the stack. Useful for save-reset / dev panel /
    // catastrophic recovery. Should NOT be needed in normal play.
    function clear() {
        _stack.clear();
        _refresh();
    }

    // Read-only: which overlays the helper currently thinks are up.
    // Useful for dev panel / debugging the "topbar still hidden"
    // class of bugs.
    function active() {
        return Array.from(_stack);
    }

    // Watchdog: every 2 seconds, if the body class is set but the
    // stack is empty, clear the body class. Defensive — covers the
    // case where someone added the class manually (legacy code
    // path) and forgot to remove it.
    setInterval(function () {
        try {
            const hasClass = document.body.classList.contains(BODY_CLASS);
            if (hasClass && _stack.size === 0) {
                // Don't clear if a legacy overlay is still up — check
                // the same overlay-presence conditions style.css uses.
                const legacyUp = OVERLAY_SELECTORS.some(function (s) { return document.querySelector(s); })
                    || document.body.classList.contains('pp-chain-in-progress');
                if (!legacyUp) {
                    document.body.classList.remove(BODY_CLASS);
                    try { console.warn('[pp-overlay] watchdog cleared stale pp-overlay-active class'); } catch (_) {}
                }
            }
        } catch (_) { /* swallow */ }
    }, 2000);

    window.PPOverlay = {
        show, hide, clear, active,
        // Exposed so other modules can stop maintaining their own copies of
        // "is an overlay open" — use PPOverlay.anyOpen() / .selectors instead.
        selectors: OVERLAY_SELECTORS,
        anyOpen: function () { return OVERLAY_SELECTORS.some(function (s) { return document.querySelector(s); }); }
    };

    // ============================================================
    //  PPTapWait — shared "wait for player tap" helper
    //  ────────────────────────────────────────────────────────────
    //  The 12 crossover scenes (and the elian rescue encounter) all
    //  used a custom `function wait(ms)` that just `setTimeout`'d for
    //  the given delay — pure auto-advance. Owner reported scenes
    //  blowing past players who can't read fast (May 2026).
    //
    //  This helper replaces the timer-based wait with a tap gate:
    //    - shows a soft "tap to continue" hint on the scene root
    //    - resolves on click/touchstart of the root element
    //    - the `ms` arg is now the SAFETY-TIMEOUT (15s default) —
    //      if a player is somehow stuck (touch event lost, etc.),
    //      the scene still progresses eventually
    //
    //  Crossover wait() functions delegate here when this is loaded.
    //  Falls back to original timer if rootEl is missing.
    // ============================================================
    window.PPTapWait = function (rootEl, fallbackMs) {
        const SAFETY_MS = Math.max(8000, (fallbackMs | 0) * 4);  // very generous
        return new Promise(function (resolve) {
            if (!rootEl) {
                setTimeout(resolve, fallbackMs || 1200);
                return;
            }
            let done = false;
            let hintEl = null;
            let timer = null;
            const finish = function () {
                if (done) return;
                done = true;
                try { rootEl.removeEventListener('click', onTap); } catch (_) {}
                try { rootEl.removeEventListener('touchstart', onTap); } catch (_) {}
                if (timer) clearTimeout(timer);
                if (hintEl && hintEl.parentNode) hintEl.parentNode.removeChild(hintEl);
                resolve();
            };
            const onTap = function () { finish(); };
            // Soft "tap to continue" hint, fades in 300ms after typing finishes
            try {
                hintEl = document.createElement('div');
                hintEl.className = 'pp-tap-hint';
                hintEl.textContent = 'tap to continue';
                hintEl.style.cssText = [
                    'position:absolute',
                    'bottom:12px',
                    'right:18px',
                    'color:rgba(255,255,255,0.45)',
                    'font-size:11px',
                    'letter-spacing:1px',
                    'font-style:italic',
                    'pointer-events:none',
                    'z-index:10001',
                    'opacity:0',
                    'transition:opacity 600ms ease 250ms'
                ].join(';');
                rootEl.appendChild(hintEl);
                requestAnimationFrame(function () { hintEl.style.opacity = '1'; });
            } catch (_) {}
            rootEl.addEventListener('click', onTap, { once: true });
            rootEl.addEventListener('touchstart', onTap, { once: true, passive: true });
            // Safety: if the scene gets orphaned somehow, eventually advance.
            timer = setTimeout(finish, SAFETY_MS);
        });
    };
})();
