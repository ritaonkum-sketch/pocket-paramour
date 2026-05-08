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
                const legacyUp = !!(
                    document.querySelector('#intro-overlay.visible') ||
                    (document.getElementById('mscard-root')?.children.length > 0) ||
                    (document.getElementById('ms-encounter-root')?.children.length > 0) ||
                    (document.getElementById('chp-page')?.children.length > 0) ||
                    document.querySelector('#story-overlay:not(.hidden)') ||
                    document.querySelector('#cinematic-overlay.visible') ||
                    document.querySelector('#pp-ready-overlay.show') ||
                    document.querySelector('#gallery-overlay:not(.hidden)') ||
                    document.querySelector('#letter-overlay:not(.hidden)') ||
                    document.querySelector('#settings-overlay:not(.hidden)') ||
                    document.querySelector('#event-overlay:not(.hidden)') ||
                    document.querySelector('#gift-panel:not(.hidden)') ||
                    document.querySelector('#training-panel:not(.hidden)') ||
                    document.querySelector('#date-overlay:not(.hidden)') ||
                    (document.getElementById('tp-root')?.children.length > 0) ||
                    document.body.classList.contains('pp-chain-in-progress')
                );
                if (!legacyUp) {
                    document.body.classList.remove(BODY_CLASS);
                    try { console.warn('[pp-overlay] watchdog cleared stale pp-overlay-active class'); } catch (_) {}
                }
            }
        } catch (_) { /* swallow */ }
    }, 2000);

    window.PPOverlay = { show, hide, clear, active };

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
