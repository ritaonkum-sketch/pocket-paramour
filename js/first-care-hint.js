// ============================================================================
// FIRST-CARE HINT (Jun 2026, rewrite)
// ----------------------------------------------------------------------------
// First-time-player navigation flow. After Chapter 1 ends, the player is
// walked step-by-step from chapter-list back to Chronicle and into Alistair's
// care loop. Each step waits for the player's tap before advancing — no
// timing assumptions, no missed beats.
//
// FLOW (owner-specified June 2026):
//   1. Ch1 ends, openPageSoftly() reopens the chapter list (chp-page)
//   2. armNow() fires after a short settle
//   3. MODAL POPUP appears: "Care Route Open" + [Acknowledge] button
//   4. Player taps Acknowledge — modal dismisses
//   5. ‹ back arrow on chp-page STARTS pulsing
//   6. Player taps ‹ — chp-page closes, Chronicle visible
//   7. CARE button on Chronicle STARTS pulsing
//   8. Player taps CARE — flag cleared, all pulses stop, care begins
//
// All gated by the one-shot localStorage flag pp_first_care_hint_pending,
// which chapters.js Ch1 done handler arms via PPFirstCareHint.armNow().
// Care-tap clears the flag; the player never sees this flow again.
//
// SCOPE
// Only fires for Ch1 (Alistair's first chapter). Other characters' care
// routes don't need this scaffolding — Alistair is the first-time
// onboarding moment specifically.
// ============================================================================
(function () {
    'use strict';

    var FLAG          = 'pp_first_care_hint_pending';
    var MODAL_ID      = 'pp-first-care-modal';
    var STYLES_ID     = 'pp-first-care-hint-styles';
    var PULSE_CLASS   = 'pp-hint-pulse';

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
            // ── Modal backdrop + panel ──────────────────────────────
            '#' + MODAL_ID + '-backdrop {' +
            '  position: fixed; inset: 0; z-index: 13500;' +
            '  background: radial-gradient(ellipse at center,' +
            '    rgba(11, 4, 16, 0.74) 0%, rgba(11, 4, 16, 0.92) 80%);' +
            '  display: flex; align-items: center; justify-content: center;' +
            '  padding: 24px;' +
            '  opacity: 0; transition: opacity 280ms cubic-bezier(0.22, 1, 0.36, 1);' +
            '}' +
            '#' + MODAL_ID + '-backdrop.show { opacity: 1; }' +
            '#' + MODAL_ID + ' {' +
            '  width: 100%; max-width: 340px;' +
            '  background: linear-gradient(180deg,' +
            '    rgba(43, 17, 51, 0.97) 0%, rgba(21, 8, 26, 0.97) 100%);' +
            '  border: 1px solid rgba(212, 168, 91, 0.45);' +
            '  border-radius: 16px;' +
            '  padding: 22px 22px 18px;' +
            '  box-shadow:' +
            '    inset 0 1px 0 rgba(212, 168, 91, 0.22),' +
            '    0 18px 48px -14px rgba(0, 0, 0, 0.85),' +
            '    0 0 56px rgba(232, 76, 140, 0.35);' +
            '  transform: translateY(8px) scale(0.96);' +
            '  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);' +
            '  text-align: center;' +
            '}' +
            '#' + MODAL_ID + '-backdrop.show #' + MODAL_ID + ' {' +
            '  transform: translateY(0) scale(1);' +
            '}' +
            '#' + MODAL_ID + '-eyebrow {' +
            '  font-family: "Quicksand", "Inter", sans-serif;' +
            '  font-size: 9px; letter-spacing: 0.22em; font-weight: 600;' +
            '  color: rgba(232, 168, 91, 0.85); text-transform: uppercase;' +
            '  margin: 0 0 8px;' +
            '}' +
            '#' + MODAL_ID + '-title {' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic;' +
            '  font-size: 22px; font-weight: 500;' +
            '  color: rgba(244, 235, 220, 0.97);' +
            '  margin: 0 0 12px;' +
            '}' +
            '#' + MODAL_ID + '-body {' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic;' +
            '  font-size: 14px; line-height: 1.5;' +
            '  color: rgba(232, 200, 220, 0.82);' +
            '  margin: 0 0 18px;' +
            '}' +
            '#' + MODAL_ID + '-ack {' +
            '  display: inline-block; min-width: 120px;' +
            '  background: linear-gradient(180deg,' +
            '    rgba(232, 76, 140, 0.85) 0%, rgba(122, 18, 36, 0.95) 100%);' +
            '  border: 1px solid rgba(232, 168, 91, 0.55);' +
            '  border-radius: 10px;' +
            '  padding: 10px 28px;' +
            '  color: rgba(244, 235, 220, 0.98);' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic;' +
            '  font-size: 14px; letter-spacing: 0.04em;' +
            '  cursor: pointer;' +
            '  box-shadow: 0 4px 16px -4px rgba(232, 76, 140, 0.5);' +
            '  transition: transform 140ms ease;' +
            '}' +
            '#' + MODAL_ID + '-ack:active { transform: scale(0.96); }' +

            // ── Pulse keyframes ─────────────────────────────────────
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

    // ── Modal popup (Step 1) ──────────────────────────────────────
    // Returns a Promise that resolves when the player taps Acknowledge.
    function showModal() {
        return new Promise(function (resolve) {
            injectStyles();
            // Don't double-mount
            if (document.getElementById(MODAL_ID + '-backdrop')) {
                resolve();
                return;
            }
            var bd = document.createElement('div');
            bd.id = MODAL_ID + '-backdrop';
            bd.innerHTML =
                '<div id="' + MODAL_ID + '" role="dialog" aria-modal="true">' +
                '  <div id="' + MODAL_ID + '-eyebrow">Care Route Open</div>' +
                '  <h2 id="' + MODAL_ID + '-title">A door has opened.</h2>' +
                '  <p id="' + MODAL_ID + '-body">Alistair’s care route is yours to walk now. Tap below, then return to the Chronicle to begin.</p>' +
                '  <button id="' + MODAL_ID + '-ack" type="button">Meet him</button>' +
                '</div>';
            document.body.appendChild(bd);

            function close() {
                bd.classList.remove('show');
                setTimeout(function () { if (bd.parentNode) bd.parentNode.removeChild(bd); }, 320);
                resolve();
            }
            bd.querySelector('#' + MODAL_ID + '-ack').addEventListener('click', close);

            // Force layout commit, then trigger fade-in
            void bd.offsetHeight;
            bd.classList.add('show');
        });
    }

    function dismissModal() {
        var bd = document.getElementById(MODAL_ID + '-backdrop');
        if (!bd) return;
        bd.classList.remove('show');
        setTimeout(function () { if (bd.parentNode) bd.parentNode.removeChild(bd); }, 320);
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

    // ── State machine ───────────────────────────────────────────────
    // Tracks where in the sequence we are so the right affordance is
    // active at each step. Stored in localStorage so a refresh mid-flow
    // doesn't lose the position.
    var STEP_KEY = 'pp_first_care_hint_step';
    var STEP_MODAL    = 'modal';     // showing the modal
    var STEP_CHP_BACK = 'chp-back';  // modal acknowledged, ‹ pulsing
    var STEP_CARE     = 'care';      // on Chronicle, CARE pulsing

    function setStep(s) { lsSet(STEP_KEY, s); }
    function getStep() { return lsGet(STEP_KEY); }

    // ── Care-tap terminates the entire flow ─────────────────────────
    function wireCareTapClear() {
        document.addEventListener('click', function (e) {
            if (!isPending()) return;
            var btn = e.target && e.target.closest && e.target.closest('.cc-action-care');
            if (!btn) return;
            lsDel(FLAG);
            lsDel(STEP_KEY);
            unpulseCareBtn();
            unpulseChpBack();
            dismissModal();
        }, true);
    }

    // ── chp-back tap advances to step CARE ─────────────────────────
    // When the player taps the pulsing ‹ on chp-page, advance to the
    // CARE step so the CARE button starts pulsing on Chronicle.
    function wireChpBackTap() {
        document.addEventListener('click', function (e) {
            if (!isPending()) return;
            if (getStep() !== STEP_CHP_BACK) return;
            var btn = e.target && e.target.closest && e.target.closest('#chp-page .chp-close');
            if (!btn) return;
            unpulseChpBack();
            setStep(STEP_CARE);
            // Pulse the CARE button after the chp-page fade-out so the
            // animation lands cleanly on a visible Chronicle.
            setTimeout(function () {
                if (!isPending()) return;
                pulseCareBtn();
            }, 500);
        }, true);
    }

    // ── Scene-state reactions ───────────────────────────────────────
    // When the player lands on the Chronicle while in the CARE step,
    // make sure the CARE pulse is on (covers case where the scene
    // change beat the chp-back tap handler).
    function onSceneChange(scene) {
        if (!isPending()) return;
        if (scene === 'select' && getStep() === STEP_CARE) {
            setTimeout(function () {
                if (!isPending()) return;
                pulseCareBtn();
            }, 400);
        }
    }

    // ── Chp-page mount observer ────────────────────────────────────
    // When chp-page remounts after Ch1 (openPageSoftly's 300ms delay)
    // AND we're already past the modal step, re-apply the ‹ pulse.
    // Covers the case where the player refreshed mid-flow.
    function watchChpPage() {
        if (typeof MutationObserver !== 'function') return;
        var chp = document.getElementById('chp-page');
        if (!chp) return;
        var obs = new MutationObserver(function () {
            if (!isPending()) return;
            if (getStep() === STEP_CHP_BACK) pulseChpBack();
        });
        obs.observe(chp, { childList: true, subtree: false });
    }

    // ── armNow(): the public entry point chapters.js calls ─────────
    // Starts the sequence: modal → on acknowledge → ‹ pulse.
    function armNow() {
        lsSet(FLAG, '1');
        setStep(STEP_MODAL);
        // Let chp-page finish its 300ms openPageSoftly remount + a buffer
        // so the modal lands cleanly on a settled background.
        setTimeout(function () {
            if (!isPending()) return;
            showModal().then(function () {
                // Step 1 done. Player tapped "Got it".
                if (!isPending()) return;
                // Aug 2026 — the modal says "return to the Chronicle to
                // begin", so DO it for them instead of pulsing the ‹ back
                // arrow and making them find their own way. Close the
                // chapter list, jump to the CARE step, and pulse the CARE
                // button once the Chronicle settles. (The old chp-back
                // pulse step is kept wired as a fallback for refresh-mid-
                // flow, but the happy path no longer needs a manual tap.)
                setStep(STEP_CARE);
                try {
                    if (window.MSChapters && typeof window.MSChapters.close === 'function') {
                        window.MSChapters.close();
                    }
                } catch (_) {}
                setTimeout(function () {
                    if (!isPending()) return;
                    pulseCareBtn();
                }, 650);
            });
        }, 700);
    }

    // ── Boot ────────────────────────────────────────────────────────
    function boot() {
        injectStyles();
        wireCareTapClear();
        wireChpBackTap();
        watchChpPage();
        // If the flag is set at load (player refreshed mid-flow), pick
        // up where they left off based on the saved step.
        if (isPending()) {
            var step = getStep();
            if (step === STEP_MODAL || !step) {
                // Treat any orphan flag without a step as "needs modal"
                setStep(STEP_MODAL);
                setTimeout(function () {
                    if (!isPending()) return;
                    showModal().then(function () {
                        if (!isPending()) return;
                        setStep(STEP_CHP_BACK);
                        pulseChpBack();
                    });
                }, 500);
            } else if (step === STEP_CHP_BACK) {
                setTimeout(pulseChpBack, 500);
            } else if (step === STEP_CARE) {
                setTimeout(pulseCareBtn, 500);
            }
        }
        document.addEventListener('pp:scene-change', function (e) {
            try { onSceneChange(e.detail && e.detail.scene); } catch (_) {}
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    // Public API for chapters.js + dev tooling
    window.PPFirstCareHint = {
        isPending: isPending,
        // Force-arm (testing only)
        arm:    function () { lsSet(FLAG, '1'); setStep(STEP_MODAL); },
        // The real entry point: called by chapters.js Ch1 done handler
        armNow: armNow,
        // Force-clear without needing a care-tap
        clear:  function () {
            lsDel(FLAG); lsDel(STEP_KEY);
            unpulseCareBtn(); unpulseChpBack(); dismissModal();
        },
        _flag:  FLAG,
        _step:  STEP_KEY
    };
})();
