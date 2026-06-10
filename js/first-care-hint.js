// ============================================================================
// FIRST-CARE HINT (Jun 2026)
// ----------------------------------------------------------------------------
// First-time-player navigation flow. After Chapter 1 ends, three things
// fire in sequence — guiding the new player from chapter-list back to
// Chronicle, then from Chronicle into Alistair's care loop:
//
//   1. Toast notification    — "Alistair's care route is open. Return
//                              to the Chronicle to begin."
//   2. Pulse on chp-close ‹  — the back arrow on the chapter list page,
//                              telling the player to leave the story
//                              menu and return to Chronicle.
//   3. Pulse on CARE button  — fires once the player lands on Chronicle.
//                              Cleared on first care-tap, never appears
//                              again for that player.
//
// All gated by the one-shot localStorage flag pp_first_care_hint_pending,
// which chapters.js sets when Ch1 done is recorded. Player-tap on CARE
// clears the flag — so even if the player ignores the hint and wanders
// off, it stays armed until they engage.
//
// SCOPE
// Only fires for the FIRST chapter (Alistair). Other characters'
// first-care moments can re-use the same flag pattern if/when they
// need the same scaffolding — for now, only Alistair has the gate.
//
// Self-contained: injects its own CSS, listens for scene-state changes
// via pp:scene-change, and gracefully no-ops if any wiring is missing.
// ============================================================================
(function () {
    'use strict';

    var FLAG = 'pp_first_care_hint_pending';
    var TOAST_ID = 'pp-first-care-toast';
    var STYLES_ID = 'pp-first-care-hint-styles';
    var PULSE_CLASS = 'pp-hint-pulse';

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
    function lsDel(k) { try { localStorage.removeItem(k); } catch (_) {} }

    function isPending() { return lsGet(FLAG) === '1'; }

    // ── Inject brand-aligned CSS once ───────────────────────────────
    function injectStyles() {
        if (document.getElementById(STYLES_ID)) return;
        var s = document.createElement('style');
        s.id = STYLES_ID;
        s.textContent =
            // Toast: small Cormorant chip slides in from top, fades out on tap
            '#' + TOAST_ID + ' {' +
            '  position: fixed;' +
            '  left: 50%; top: 70px;' +
            '  transform: translate(-50%, -12px);' +
            '  z-index: 12500;' +
            '  max-width: 320px; width: calc(100vw - 32px);' +
            '  padding: 12px 18px;' +
            '  background: linear-gradient(180deg, rgba(43, 17, 51, 0.96) 0%, rgba(21, 8, 26, 0.96) 100%);' +
            '  border: 1px solid rgba(212, 168, 91, 0.45);' +
            '  border-radius: 12px;' +
            '  box-shadow:' +
            '    inset 0 1px 0 rgba(212, 168, 91, 0.22),' +
            '    0 14px 36px -12px rgba(0, 0, 0, 0.8),' +
            '    0 0 32px rgba(122, 18, 36, 0.35);' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic;' +
            '  font-size: 14px; line-height: 1.42;' +
            '  color: rgba(244, 235, 220, 0.96);' +
            '  text-align: center;' +
            '  opacity: 0;' +
            '  transition: opacity 360ms cubic-bezier(0.22, 1, 0.36, 1),' +
            '              transform 360ms cubic-bezier(0.22, 1, 0.36, 1);' +
            '  cursor: pointer;' +
            '}' +
            '#' + TOAST_ID + '.show {' +
            '  opacity: 1; transform: translate(-50%, 0);' +
            '}' +
            '#' + TOAST_ID + ' .pp-fc-eyebrow {' +
            '  display: block;' +
            '  font-family: "Quicksand", "Inter", sans-serif; font-style: normal;' +
            '  font-size: 9px; font-weight: 600;' +
            '  letter-spacing: 0.22em; text-transform: uppercase;' +
            '  color: rgba(232, 168, 91, 0.85);' +
            '  margin-bottom: 4px;' +
            '}' +

            // Pulse-hint: rose-gold breathing glow on the targeted element.
            // Designed to read as "look here" without crowding the brand
            // palette — same gold as the active companion's wax-seal halo.
            '.' + PULSE_CLASS + ' {' +
            '  position: relative;' +
            '  animation: pp-hint-pulse 1.6s ease-in-out infinite;' +
            '}' +
            '@keyframes pp-hint-pulse {' +
            '  0%, 100% {' +
            '    box-shadow:' +
            '      0 0 0 0 rgba(232, 168, 91, 0.55),' +
            '      0 0 0 0 rgba(232, 76, 140, 0.0);' +
            '    filter: drop-shadow(0 0 6px rgba(232, 168, 91, 0.35));' +
            '  }' +
            '  50% {' +
            '    box-shadow:' +
            '      0 0 0 6px rgba(232, 168, 91, 0.0),' +
            '      0 0 18px 4px rgba(232, 76, 140, 0.45);' +
            '    filter: drop-shadow(0 0 14px rgba(232, 168, 91, 0.65));' +
            '  }' +
            '}' +
            // Soft inner pulse for the CARE pill (already has its own
            // bg gradient, so we use border-glow only — no inset shadow
            // that would muddy the existing wine-velvet panel).
            '.cc-action-care.' + PULSE_CLASS + ' {' +
            '  animation: pp-care-pulse 1.6s ease-in-out infinite;' +
            '}' +
            '@keyframes pp-care-pulse {' +
            '  0%, 100% {' +
            '    box-shadow:' +
            '      inset 0 1px 0 rgba(232, 168, 91, 0.22),' +
            '      0 0 0 0 rgba(232, 168, 91, 0.45),' +
            '      0 0 22px rgba(232, 76, 140, 0.45);' +
            '  }' +
            '  50% {' +
            '    box-shadow:' +
            '      inset 0 1px 0 rgba(232, 168, 91, 0.45),' +
            '      0 0 0 4px rgba(232, 168, 91, 0.18),' +
            '      0 0 36px rgba(232, 76, 140, 0.75);' +
            '  }' +
            '}';
        document.head.appendChild(s);
    }

    // ── Toast: shown once, dismissible on tap, auto-fades after 7s ──
    var _toastTimer = null;
    function showToast() {
        if (document.getElementById(TOAST_ID)) return;
        injectStyles();
        var el = document.createElement('div');
        el.id = TOAST_ID;
        el.innerHTML =
            '<span class="pp-fc-eyebrow">Care Route Open</span>' +
            'Alistair’s care route has opened. Return to the Chronicle to begin.';
        el.addEventListener('click', dismissToast);
        document.body.appendChild(el);
        // Force layout so the fade transition picks up
        void el.offsetHeight;
        el.classList.add('show');
        if (_toastTimer) clearTimeout(_toastTimer);
        _toastTimer = setTimeout(dismissToast, 7000);
    }
    function dismissToast() {
        var el = document.getElementById(TOAST_ID);
        if (!el) return;
        el.classList.remove('show');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
        if (_toastTimer) { clearTimeout(_toastTimer); _toastTimer = null; }
    }

    // ── Pulse management ────────────────────────────────────────────
    function pulseChpBack() {
        var btn = document.querySelector('#chp-page .chp-close');
        if (btn) btn.classList.add(PULSE_CLASS);
    }
    function unpulseChpBack() {
        var btn = document.querySelector('#chp-page .chp-close');
        if (btn) btn.classList.remove(PULSE_CLASS);
    }
    function pulseCareBtn() {
        var btn = document.querySelector('#select-screen .cc-action-care');
        if (btn) btn.classList.add(PULSE_CLASS);
    }
    function unpulseCareBtn() {
        var btn = document.querySelector('#select-screen .cc-action-care');
        if (btn) btn.classList.remove(PULSE_CLASS);
    }

    // ── Care-tap is the terminal event: clear flag, drop pulses ─────
    function wireCareTapClear() {
        // Bind once at script load. Listener stays armed forever; it
        // simply does nothing if the flag isn't pending.
        document.addEventListener('click', function (e) {
            if (!isPending()) return;
            var btn = e.target && e.target.closest && e.target.closest('.cc-action-care');
            if (!btn) return;
            lsDel(FLAG);
            unpulseCareBtn();
            dismissToast();
        }, true);
    }

    // ── Scene-state reactions ───────────────────────────────────────
    // chp-page mounting is signalled by chapters.js when its DOM appears.
    // We watch for it via MutationObserver as a backup. Select-screen
    // transitions emit pp:scene-change via scene-state.js.
    function onSceneChange(scene) {
        if (!isPending()) return;
        if (scene === 'select') {
            // Player has returned to Chronicle — pulse the CARE button
            // and show the toast if it hasn't been shown yet this session.
            // A tiny delay lets refreshActive() finish painting first so
            // the .cc-action-care selector resolves to the unlocked button.
            setTimeout(function () {
                pulseCareBtn();
                showToast();
            }, 350);
        } else {
            // Leaving Chronicle (entering care, chapter, etc.) — drop
            // the toast so it doesn't linger on the wrong screen. The
            // pulse will reappear automatically if the player wanders
            // back to Chronicle before tapping CARE.
            unpulseCareBtn();
            dismissToast();
        }
    }

    // chp-page back-arrow pulse: tag the moment the chp-close button
    // mounts. We use MutationObserver instead of polling so this is
    // cost-free when chp-page isn't in play.
    function watchChpPage() {
        if (typeof MutationObserver !== 'function') return;
        var chp = document.getElementById('chp-page');
        if (!chp) return;
        var obs = new MutationObserver(function () {
            if (!isPending()) return;
            // chp-page just gained content — pulse the back arrow if
            // it's there. Cheap idempotent re-tag.
            pulseChpBack();
        });
        obs.observe(chp, { childList: true, subtree: false });
    }

    function boot() {
        injectStyles();
        wireCareTapClear();
        watchChpPage();
        // If the flag is already set at load (player navigated away and
        // came back), apply the scene-appropriate hint immediately.
        if (isPending()) {
            var scene = window.PPScene && window.PPScene.get && window.PPScene.get();
            if (scene) onSceneChange(scene);
        }
        // Subscribe to scene changes via the scene-state authority.
        document.addEventListener('pp:scene-change', function (e) {
            try { onSceneChange(e.detail && e.detail.scene); } catch (_) {}
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    // Public surface for debugging / dev-tooling
    // armNow() is called explicitly by chapters.js when Ch1 finishes.
    // Why: Ch1 plays via MSCard ON TOP of the Chronicle — the underlying
    // scene-state never leaves 'select', so the pp:scene-change listener
    // never fires when the chapter ends. armNow() bridges that gap by
    // triggering the 'select' branch manually after a short delay (so
    // the MSCard close animation can finish and the CARE button can
    // refresh into its unlocked state).
    function armNow() {
        lsSet(FLAG, '1');
        setTimeout(function () {
            if (!isPending()) return;
            pulseCareBtn();
            showToast();
        }, 600);
    }

    window.PPFirstCareHint = {
        isPending: isPending,
        // Force-arm the hint, e.g. for testing
        arm:    function () { lsSet(FLAG, '1'); },
        // armNow: arm AND immediately fire the hint without waiting for
        // a scene-change event (used by Ch1 done handler)
        armNow: armNow,
        // Force-clear without needing a care-tap
        clear:  function () { lsDel(FLAG); unpulseCareBtn(); unpulseChpBack(); dismissToast(); },
        _flag:  FLAG
    };
})();
