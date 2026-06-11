// ============================================================================
// CARE TARGET CHIP (Jun 2026)
// ----------------------------------------------------------------------------
// Small persistent chip on the right edge of the care screen showing what the
// player is working toward in the main story. Owner pointed at the right side
// of the care screen during playtest and asked for "an achievement target so
// the player knows what's next" — this is the visible reminder that taking
// good care of Alistair will open Chapter 6.
//
// WHAT IT SHOWS
//   - "NEXT GATE" eyebrow
//   - Character target ("Chapter 6 · Elian")
//   - Three mini orbs, one per milestone (Bond 3 / Balanced care / Trust),
//     filled gold when done, hollow rose-velvet when not
//   - Tap → expands into a full checklist tooltip (same data PPMSGate's
//     standalone popup shows)
//
// SCOPE
//   - Only renders while the player is on care AND on Alistair AND the gate
//     is currently locked. After Ch6 unlocks, the chip self-removes.
//   - Other characters' care gates can extend this pattern by adding their
//     own PPMSGate.evaluate<Char>() entries; the chip routes by active char.
//
// Self-contained. Subscribes to pp:scene-change for mount/unmount and polls
// PPMSGate every 3s while visible to refresh milestone progress.
// ============================================================================
(function () {
    'use strict';

    var CHIP_ID    = 'pp-care-target-chip';
    var POPUP_ID   = 'pp-care-target-popup';
    var STYLES_ID  = 'pp-care-target-styles';

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function activeChar() {
        var g = window._game;
        return (g && (g.characterId || g.selectedCharacter)) || lsGet('pp_cc_active_companion') || null;
    }
    function ch6Done() {
        return lsGet('pp_chapter_done_6') === '1';
    }

    // ── Brand-aligned styles (one-shot inject) ──────────────────────
    function injectStyles() {
        if (document.getElementById(STYLES_ID)) return;
        var s = document.createElement('style');
        s.id = STYLES_ID;
        s.textContent =
            '#' + CHIP_ID + ' {' +
            '  position: fixed;' +
            '  right: 10px;' +
            '  top: 130px;' +
            '  z-index: 9450;' +
            '  width: 64px;' +
            '  padding: 8px 6px 10px;' +
            '  background: linear-gradient(180deg,' +
            '    rgba(43, 17, 51, 0.92) 0%, rgba(21, 8, 26, 0.92) 100%);' +
            '  border: 1px solid rgba(212, 168, 91, 0.36);' +
            '  border-radius: 12px;' +
            '  box-shadow:' +
            '    inset 0 1px 0 rgba(212, 168, 91, 0.16),' +
            '    0 10px 26px -10px rgba(0, 0, 0, 0.7),' +
            '    0 0 18px rgba(232, 76, 140, 0.18);' +
            '  cursor: pointer;' +
            '  font-family: "Quicksand", "Inter", sans-serif;' +
            '  opacity: 0;' +
            '  transform: translateX(8px);' +
            '  transition: opacity 280ms ease, transform 280ms ease;' +
            '  -webkit-tap-highlight-color: transparent;' +
            '}' +
            '#' + CHIP_ID + '.show { opacity: 1; transform: translateX(0); }' +
            '#' + CHIP_ID + ' .pp-ct-eyebrow {' +
            '  display: block;' +
            '  font-size: 7px; letter-spacing: 0.16em; font-weight: 600;' +
            '  color: rgba(232, 168, 91, 0.85); text-transform: uppercase;' +
            '  text-align: center;' +
            '  margin-bottom: 4px;' +
            '}' +
            '#' + CHIP_ID + ' .pp-ct-target {' +
            '  display: block;' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic;' +
            '  font-size: 12px; line-height: 1.1;' +
            '  color: rgba(244, 235, 220, 0.94);' +
            '  text-align: center;' +
            '  margin-bottom: 6px;' +
            '}' +
            '#' + CHIP_ID + ' .pp-ct-orbs {' +
            '  display: flex; justify-content: center; gap: 5px;' +
            '}' +
            '#' + CHIP_ID + ' .pp-ct-orb {' +
            '  width: 8px; height: 8px; border-radius: 50%;' +
            '  border: 1.2px solid rgba(212, 168, 91, 0.4);' +
            '  background: transparent;' +
            '  transition: background 200ms ease, box-shadow 200ms ease;' +
            '}' +
            '#' + CHIP_ID + ' .pp-ct-orb.done {' +
            '  background: radial-gradient(circle at 32% 32%, #F2D690, #B8923E);' +
            '  border-color: rgba(212, 168, 91, 0.9);' +
            '  box-shadow: 0 0 6px rgba(232, 168, 91, 0.6);' +
            '}' +

            // Tooltip popup expanded on tap
            '#' + POPUP_ID + ' {' +
            '  position: fixed;' +
            '  right: 80px;' +
            '  top: 130px;' +
            '  z-index: 9460;' +
            '  width: 260px;' +
            '  background: linear-gradient(180deg,' +
            '    rgba(43, 17, 51, 0.97) 0%, rgba(21, 8, 26, 0.97) 100%);' +
            '  border: 1px solid rgba(212, 168, 91, 0.45);' +
            '  border-radius: 14px;' +
            '  padding: 14px 14px 12px;' +
            '  box-shadow:' +
            '    inset 0 1px 0 rgba(212, 168, 91, 0.22),' +
            '    0 16px 36px -10px rgba(0, 0, 0, 0.85),' +
            '    0 0 32px rgba(232, 76, 140, 0.3);' +
            '  opacity: 0;' +
            '  transform: translateX(8px);' +
            '  transition: opacity 240ms ease, transform 240ms ease;' +
            '}' +
            '#' + POPUP_ID + '.show { opacity: 1; transform: translateX(0); }' +
            '#' + POPUP_ID + ' .pp-ctp-eyebrow {' +
            '  font-family: "Quicksand", "Inter", sans-serif;' +
            '  font-size: 8px; letter-spacing: 0.22em; font-weight: 600;' +
            '  color: rgba(232, 168, 91, 0.85); text-transform: uppercase;' +
            '  margin: 0 0 4px;' +
            '}' +
            '#' + POPUP_ID + ' .pp-ctp-title {' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic;' +
            '  font-size: 14px; font-weight: 500;' +
            '  color: rgba(244, 235, 220, 0.97);' +
            '  margin: 0 0 10px;' +
            '}' +
            '#' + POPUP_ID + ' .pp-ctp-row {' +
            '  display: flex; align-items: flex-start; gap: 8px;' +
            '  padding: 6px 8px; margin-bottom: 4px;' +
            '  background: rgba(15, 8, 26, 0.55);' +
            '  border: 1px solid rgba(212, 168, 91, 0.14);' +
            '  border-radius: 8px;' +
            '}' +
            '#' + POPUP_ID + ' .pp-ctp-row.done {' +
            '  border-color: rgba(212, 168, 91, 0.45);' +
            '}' +
            '#' + POPUP_ID + ' .pp-ctp-check {' +
            '  flex: 0 0 14px; width: 14px; height: 14px;' +
            '  border-radius: 50%;' +
            '  border: 1.2px solid rgba(212, 168, 91, 0.4);' +
            '  display: flex; align-items: center; justify-content: center;' +
            '  color: rgba(244, 235, 220, 0.5);' +
            '  font-size: 8px; line-height: 1;' +
            '  margin-top: 2px;' +
            '}' +
            '#' + POPUP_ID + ' .pp-ctp-row.done .pp-ctp-check {' +
            '  border-color: #D4A85B;' +
            '  background: radial-gradient(circle at 32% 32%, #F2D690, #B8923E);' +
            '  color: #2B1133;' +
            '}' +
            '#' + POPUP_ID + ' .pp-ctp-label {' +
            '  font-family: "Cormorant Garamond", serif;' +
            '  font-size: 11px; line-height: 1.3;' +
            '  color: rgba(244, 235, 220, 0.9);' +
            '}' +
            '#' + POPUP_ID + ' .pp-ctp-prog {' +
            '  font-family: "Quicksand", "Inter", sans-serif;' +
            '  font-size: 9px; letter-spacing: 0.06em;' +
            '  color: rgba(232, 168, 91, 0.7);' +
            '  margin-top: 2px;' +
            '}';
        document.head.appendChild(s);
    }

    // ── Chip render ────────────────────────────────────────────────
    var _popupOpen = false;
    function buildChip() {
        injectStyles();
        var el = document.createElement('div');
        el.id = CHIP_ID;
        el.innerHTML =
            '<span class="pp-ct-eyebrow">Next</span>' +
            '<span class="pp-ct-target">Ch.&nbsp;6</span>' +
            '<div class="pp-ct-orbs">' +
            '  <span class="pp-ct-orb" data-key="bond3"></span>' +
            '  <span class="pp-ct-orb" data-key="balanced"></span>' +
            '  <span class="pp-ct-orb" data-key="trust"></span>' +
            '</div>';
        el.addEventListener('click', togglePopup);
        document.body.appendChild(el);
        void el.offsetHeight;
        el.classList.add('show');
        return el;
    }

    function refreshChip() {
        var el = document.getElementById(CHIP_ID);
        if (!el || !window.PPMSGate || typeof window.PPMSGate.evaluateCh6 !== 'function') return;
        var state = window.PPMSGate.evaluateCh6();
        state.milestones.forEach(function (m) {
            var orb = el.querySelector('.pp-ct-orb[data-key="' + m.key + '"]');
            if (orb) orb.classList.toggle('done', m.done);
        });
        // Refresh popup if open
        if (_popupOpen) renderPopup(state);
    }

    function removeChip() {
        ['show', '_popupOpen'].forEach(function () {});
        var el = document.getElementById(CHIP_ID);
        if (el) {
            el.classList.remove('show');
            setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
        }
        closePopup();
    }

    // ── Popup (expanded checklist) ─────────────────────────────────
    function togglePopup(e) {
        e.stopPropagation();
        if (_popupOpen) { closePopup(); return; }
        openPopup();
    }
    function openPopup() {
        if (!window.PPMSGate) return;
        var state = window.PPMSGate.evaluateCh6();
        renderPopup(state);
        _popupOpen = true;
        // Dismiss on outside-tap
        setTimeout(function () {
            document.addEventListener('click', closePopupOnOutside, true);
        }, 100);
    }
    function closePopupOnOutside(e) {
        var pop = document.getElementById(POPUP_ID);
        if (!pop) { document.removeEventListener('click', closePopupOnOutside, true); return; }
        if (pop.contains(e.target)) return;
        // Jun 2026 — bug fix: if the tap is on the chip itself, leave it
        // to the chip's own toggle handler (which fires on the bubble
        // phase right after this). Closing here AND in togglePopup
        // would race and the toggle's "else openPopup" branch would
        // re-fire, making a re-tap look like it doesn't dismiss.
        var chip = document.getElementById(CHIP_ID);
        if (chip && chip.contains(e.target)) return;
        closePopup();
    }
    function closePopup() {
        document.removeEventListener('click', closePopupOnOutside, true);
        _popupOpen = false;
        var pop = document.getElementById(POPUP_ID);
        if (!pop) return;
        pop.classList.remove('show');
        setTimeout(function () { if (pop.parentNode) pop.parentNode.removeChild(pop); }, 260);
    }
    function renderPopup(state) {
        var existing = document.getElementById(POPUP_ID);
        if (existing) existing.remove();
        var pop = document.createElement('div');
        pop.id = POPUP_ID;
        var rows = state.milestones.map(function (m) {
            return '<div class="pp-ctp-row' + (m.done ? ' done' : '') + '">' +
                '<span class="pp-ctp-check">' + (m.done ? '✓' : '') + '</span>' +
                '<span>' +
                '  <div class="pp-ctp-label">' + m.label + '</div>' +
                '  <div class="pp-ctp-prog">' + m.progress + '</div>' +
                '</span>' +
                '</div>';
        }).join('');
        pop.innerHTML =
            '<div class="pp-ctp-eyebrow">Next Gate</div>' +
            '<div class="pp-ctp-title">Chapter 6 · Smoke at the Treeline</div>' +
            rows;
        document.body.appendChild(pop);
        void pop.offsetHeight;
        pop.classList.add('show');
    }

    // ── Eligibility check + mount/unmount ──────────────────────────
    // The chip is for the IDLE care loop only — the moment the player
    // is reading a chapter, an intro cinematic, a date, an event, or
    // any other full-screen story moment, the chip vanishes. It comes
    // back the instant the player is on the bare care screen again.
    function chapterOrIntroActive() {
        // Any of these = a story scene is on top of the care screen.
        // Owner reported the chip showing during Alistair's first
        // intro (#intro-overlay.visible). Gate it out of every story
        // moment, not just MSCard.
        return !!document.querySelector(
            '#mscard-root:not(:empty), ' +
            '#ms-encounter-root:not(:empty), ' +
            '#chp-page:not(.hidden):not(:empty), ' +
            '#tp-root:not(:empty), ' +
            '#cinematic-overlay.visible, ' +
            '#intro-overlay.visible, ' +
            '#story-overlay:not(.hidden), ' +
            '#event-overlay:not(.hidden), ' +
            '#date-overlay:not(.hidden), ' +
            '#pp-sm-root:not(:empty), ' +
            '#pp-sched-root:not(:empty), ' +
            '#pp-fm-root:not(:empty), ' +
            '#gift-panel:not(.hidden), ' +
            '#training-panel:not(.hidden), ' +
            '#gallery-overlay:not(.hidden), ' +
            '#letter-overlay:not(.hidden), ' +
            '#settings-overlay:not(.hidden), ' +
            '#pp-day-one-overlay'
        );
    }
    function shouldShow() {
        if (!document.body.classList.contains('pp-screen-care')) return false;
        if (activeChar() !== 'alistair') return false;
        if (ch6Done()) return false;
        if (!window.PPMSGate) return false;
        if (chapterOrIntroActive()) return false;
        return true;
    }

    function update() {
        if (shouldShow()) {
            if (!document.getElementById(CHIP_ID)) buildChip();
            refreshChip();
        } else {
            removeChip();
        }
    }

    // ── Boot: scene + poll ─────────────────────────────────────────
    function boot() {
        update();
        // 3s poll for live milestone progress + scene transitions
        setInterval(update, 3000);
        document.addEventListener('pp:scene-change', function () {
            setTimeout(update, 200);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    // Public surface for dev tooling
    window.PPCareTargetChip = {
        update: update,
        _shouldShow: shouldShow
    };
})();
