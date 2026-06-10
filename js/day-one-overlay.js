// ============================================================================
// DAY ONE OVERLAY (Jun 2026 — First 10 Min audit Sprint 2, item #9)
// ----------------------------------------------------------------------------
// Brief cinematic title-card that fades in on the FIRST care-screen entry per
// character. Sets the emotional register before the player touches anything:
//   ┌─────────────────────────────┐
//   │                             │
//   │           DAY 1             │   ← Quicksand caps, rose-gold
//   │        ─────✦─────          │
//   │  A morning you remember.    │   ← Cormorant italic, brand cream
//   │                             │
//   └─────────────────────────────┘
// Auto-dismisses after ~2.4s. One-shot per character via
// `pp_day_one_overlay_seen_<char>` localStorage flag.
//
// Purely additive — listens for the care screen via the existing scene-state
// authority (body.pp-screen-care) and inserts a single overlay element on
// demand. No DOM in index.html, no CSS in style.css.
// ============================================================================
(function () {
    'use strict';

    var SUBTITLE_BY_CHAR = {
        alistair: 'A morning he has been waiting for.',
        elian:    'The forest is quieter for you.',
        lyra:     'The tide came in singing your name.',
        caspian:  'The crown sleeps in. So does he.',
        lucien:   'A page he has been afraid to write.',
        noir:     'Six hundred years of waiting end on this morning.',
        proto:    'A pattern in the static, holding steady.'
    };

    var _shown = false;

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

    function currentChar() {
        try {
            return (window._game && window._game.selectedCharacter)
                || lsGet('selectedCharacter')
                || 'alistair';
        } catch (_) { return 'alistair'; }
    }

    function injectStyles() {
        if (document.getElementById('pp-day-one-styles')) return;
        var s = document.createElement('style');
        s.id = 'pp-day-one-styles';
        s.textContent =
          '#pp-day-one-overlay {' +
            'position: fixed; inset: 0; z-index: 11700;' +
            'display: flex; flex-direction: column;' +
            'align-items: center; justify-content: center;' +
            'pointer-events: none; opacity: 0;' +
            'background: radial-gradient(ellipse at 50% 50%,' +
              ' rgba(11, 4, 16, 0.62) 0%,' +
              ' rgba(11, 4, 16, 0.25) 70%,' +
              ' transparent 100%);' +
            'transition: opacity 700ms cubic-bezier(0.4, 0, 0.2, 1);' +
            'backdrop-filter: blur(2px);' +
            '-webkit-backdrop-filter: blur(2px);' +
          '}' +
          '#pp-day-one-overlay.show { opacity: 1; }' +
          '#pp-day-one-label {' +
            "font-family: 'Quicksand', 'Inter', sans-serif;" +
            'font-size: 12px; font-weight: 700;' +
            'letter-spacing: 0.42em; text-transform: uppercase;' +
            'color: rgba(232, 200, 138, 0.85);' +
            'text-shadow: 0 1px 6px rgba(0, 0, 0, 0.75);' +
            'margin-bottom: 18px;' +
            'transform: translateY(8px);' +
            'transition: transform 900ms cubic-bezier(0.34, 1.56, 0.64, 1) 200ms;' +
          '}' +
          '#pp-day-one-overlay.show #pp-day-one-label { transform: translateY(0); }' +
          '#pp-day-one-title {' +
            "font-family: 'Cormorant Garamond', 'EB Garamond', serif;" +
            'font-style: italic; font-weight: 500; font-size: 40px;' +
            'letter-spacing: 0.04em;' +
            'background: linear-gradient(160deg, #F4DDA8 0%, #D4A85B 50%, #B7842F 100%);' +
            '-webkit-background-clip: text; background-clip: text;' +
            '-webkit-text-fill-color: transparent;' +
            'filter: drop-shadow(0 0 16px rgba(232, 168, 91, 0.30));' +
            'margin-bottom: 14px;' +
            'transform: translateY(8px);' +
            'transition: transform 900ms cubic-bezier(0.34, 1.56, 0.64, 1) 320ms;' +
          '}' +
          '#pp-day-one-overlay.show #pp-day-one-title { transform: translateY(0); }' +
          '#pp-day-one-divider {' +
            'display: flex; align-items: center; gap: 14px;' +
            'margin-bottom: 18px;' +
            'opacity: 0;' +
            'transition: opacity 500ms ease 540ms;' +
          '}' +
          '#pp-day-one-overlay.show #pp-day-one-divider { opacity: 1; }' +
          '#pp-day-one-divider::before, #pp-day-one-divider::after {' +
            'content: ""; width: 48px; height: 1px;' +
            'background: linear-gradient(90deg,' +
              ' transparent 0%, rgba(232, 200, 138, 0.6) 50%, transparent 100%);' +
          '}' +
          '#pp-day-one-divider span {' +
            'color: rgba(232, 200, 138, 0.85); font-size: 12px;' +
          '}' +
          '#pp-day-one-subtitle {' +
            "font-family: 'Cormorant Garamond', 'EB Garamond', serif;" +
            'font-style: italic; font-weight: 400; font-size: 17px;' +
            'color: rgba(244, 235, 220, 0.92);' +
            'text-shadow: 0 1px 5px rgba(0, 0, 0, 0.55);' +
            'opacity: 0;' +
            'transition: opacity 700ms ease 700ms;' +
            'text-align: center; padding: 0 24px;' +
          '}' +
          '#pp-day-one-overlay.show #pp-day-one-subtitle { opacity: 1; }';
        document.head.appendChild(s);
    }

    function build(subtitle) {
        injectStyles();
        var ov = document.createElement('div');
        ov.id = 'pp-day-one-overlay';
        ov.innerHTML =
          '<div id="pp-day-one-label">Day 1</div>' +
          '<div id="pp-day-one-title">A new beginning</div>' +
          '<div id="pp-day-one-divider"><span>✦</span></div>' +
          '<div id="pp-day-one-subtitle">' + subtitle + '</div>';
        document.body.appendChild(ov);
        // Force reflow then add .show so the transition fires
        void ov.offsetWidth;
        ov.classList.add('show');
        // Auto-dismiss after 2.4s
        setTimeout(function () {
            ov.classList.remove('show');
            setTimeout(function () {
                if (ov.parentNode) ov.parentNode.removeChild(ov);
            }, 750);
        }, 2400);
    }

    function maybeShow() {
        if (_shown) return;
        if (document.body.classList.contains('pp-screen-care') === false) return;
        var ch = currentChar();
        if (!ch) return;
        var flagKey = 'pp_day_one_overlay_seen_' + ch;
        if (lsGet(flagKey) === '1') return;
        // Don't fire while a cutscene / cinematic is up (intro, MSCard, etc.)
        var blockers = ['intro-overlay', 'mscard-root', 'cinematic-overlay'];
        for (var i = 0; i < blockers.length; i++) {
            var el = document.getElementById(blockers[i]);
            if (el) {
                var cs = window.getComputedStyle(el);
                var visible = el.offsetWidth > 0 && el.offsetHeight > 0 &&
                              cs.display !== 'none' && cs.visibility !== 'hidden';
                if (visible) return; // try again next scene-change
            }
        }
        _shown = true;
        lsSet(flagKey, '1');
        var subtitle = SUBTITLE_BY_CHAR[ch] || 'A morning that is yours.';
        // Brief delay so the care screen settles before the title-card lands.
        setTimeout(function () { build(subtitle); }, 650);
    }

    // Listen for scene changes via the existing scene-state event.
    document.addEventListener('pp:scene-change', function (e) {
        if (e && e.detail && e.detail.scene !== 'care') {
            // Reset the per-instance guard when leaving care so a fresh
            // care entry on a DIFFERENT character can still fire (the
            // localStorage flag is per-character anyway).
            _shown = false;
            return;
        }
        maybeShow();
    });
    // Also try on initial load in case care is already the current scene.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', maybeShow);
    } else {
        setTimeout(maybeShow, 100);
    }

    window.PPDayOneOverlay = {
        // Manual replay for debugging / dev panel
        show: function () {
            _shown = false;
            try { localStorage.removeItem('pp_day_one_overlay_seen_' + currentChar()); } catch (_) {}
            maybeShow();
        }
    };
})();
