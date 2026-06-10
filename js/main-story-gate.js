// ============================================================================
// MAIN-STORY GATE (Jun 2026)
// ----------------------------------------------------------------------------
// Rebuilds the "care → unlock → next chapter → care → unlock" loop that
// prologue-chain.js / world-arrival.js used to provide before the June
// clean-slate. Scoped to the FIRST link only — Alistair care unlocks
// Chapter 6 (Elian's first appearance). After Ch6 plays, Elian's care
// route opens via the existing chapters.js done-handler path.
//
// THE THREE MILESTONES (Alistair → Ch6)
//   1. Bond Level >= 3            (cumulative affection >= 20)
//   2. Balanced care once         (hunger + clean + bond all > 50
//                                  simultaneously — latched once true)
//   3. Trust earned beat          (special talk-line fired by the
//                                  in-care talk handler — see
//                                  character.js / game.js hook)
//
// All three are tracked via localStorage. The gate is "open" only when
// every milestone returns true. Once open, it stays open even if stats
// drop again (player has earned the reveal).
//
// PUBLIC API
//   window.PPMSGate.evaluateCh6()   → {locked, milestones[], opened}
//   window.PPMSGate.checkBalanced() → call after stat change; latches
//                                     pp_alistair_balanced_care if hit
//   window.PPMSGate.markTrust()     → call from the talk handler when
//                                     the trust-earned beat fires
// ============================================================================
(function () {
    'use strict';

    var KEY_BALANCED = 'pp_alistair_balanced_care';
    var KEY_TRUST    = 'pp_alistair_trust_earned';
    var KEY_AFFECT   = 'pp_affection_alistair';

    function lsGet(k) {
        try { return localStorage.getItem(k); } catch (_) { return null; }
    }
    function lsSet(k, v) {
        try { localStorage.setItem(k, v); } catch (_) { /* swallow */ }
    }

    // Mirror of index.html's bondLevel() so the gate works without
    // having to reach into select-screen scope.
    function bondLevelFor(charId) {
        var raw = parseInt(lsGet('pp_affection_' + charId) || '0', 10) || 0;
        if (raw < 0) raw = 0;
        if (raw === 0)  return 0;
        if (raw < 10)   return 1;
        if (raw < 20)   return 2;
        if (raw < 35)   return 3;
        if (raw < 55)   return 4;
        if (raw < 80)   return 5;
        if (raw < 110)  return 6;
        if (raw < 150)  return 7;
        if (raw < 200)  return 8;
        return 9;
    }

    // ── Milestone evaluators ────────────────────────────────────────
    function hasBondLevel3() {
        return bondLevelFor('alistair') >= 3;
    }
    function hasBalancedCare() {
        return lsGet(KEY_BALANCED) === '1';
    }
    function hasTrustEarned() {
        return lsGet(KEY_TRUST) === '1';
    }

    // ── Stat watcher: latches pp_alistair_balanced_care once all
    // three care stats exceed 50 at the same time. Reads from the
    // live game instance if one is mounted and is playing Alistair.
    // Called: once on script load (in case stats are already balanced
    // from a prior session), then on a 4s poll while game is active,
    // and also exposed for external explicit calls. ────────────────
    function checkBalanced() {
        if (hasBalancedCare()) return true; // already latched
        var g = (typeof window !== 'undefined') ? window._game : null;
        if (!g) return false;
        if (g.characterId !== 'alistair' && g.selectedCharacter !== 'alistair') {
            return false;
        }
        var h = g.hunger, c = g.clean, b = g.bond;
        if (typeof h !== 'number' || typeof c !== 'number' || typeof b !== 'number') {
            return false;
        }
        if (h > 50 && c > 50 && b > 50) {
            lsSet(KEY_BALANCED, '1');
            return true;
        }
        return false;
    }

    // Mark the "trust earned" narrative beat as seen. Called by the
    // in-care talk handler when its conditions fire (bondLevel >= 3
    // AND total cumulative talks >= 7).
    function markTrust() {
        lsSet(KEY_TRUST, '1');
    }

    // ── Main evaluator ──────────────────────────────────────────────
    // Returns the full gate state for Ch6. UI reads this to render
    // the checklist popup and to decide if Ch6 button shows Locked
    // vs Begin.
    function evaluateCh6() {
        var m1 = hasBondLevel3();
        var m2 = hasBalancedCare();
        var m3 = hasTrustEarned();
        var bl = bondLevelFor('alistair');
        return {
            opened: m1 && m2 && m3,
            locked: !(m1 && m2 && m3),
            milestones: [
                {
                    key: 'bond3',
                    label: 'Bond Level 3 with Alistair',
                    progress: bl + ' / 3',
                    done: m1
                },
                {
                    key: 'balanced',
                    label: 'Care for him in balance (every stat above 50)',
                    progress: m2 ? 'Once' : 'Not yet',
                    done: m2
                },
                {
                    key: 'trust',
                    label: 'A moment he names you Weaver',
                    progress: m3 ? 'Heard' : 'Not yet',
                    done: m3
                }
            ]
        };
    }

    // ── Boot: light-touch poller while in care so we don't miss the
    // moment all three stats cross 50. 4-second interval is cheap
    // (just three number reads) and idle-pauses naturally since the
    // game instance is null outside care. ──────────────────────────
    function boot() {
        try { checkBalanced(); } catch (_) {}
        setInterval(function () {
            try { checkBalanced(); } catch (_) {}
        }, 4000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    // ── Checklist popup ──────────────────────────────────────────────
    // Replaces the generic "Locked" message when the player taps Ch6
    // before earning it. Shows each milestone with current status so
    // the player knows what to work toward. Brand-aligned: wine-velvet
    // panel, rose-gold hairline, Cormorant italic. Self-contained
    // styles injected on first call so this file is drop-in.
    function injectChecklistStyles() {
        if (document.getElementById('pp-ms-gate-styles')) return;
        var s = document.createElement('style');
        s.id = 'pp-ms-gate-styles';
        s.textContent =
            '#pp-ms-gate-backdrop {' +
            '  position: fixed; inset: 0; z-index: 13000;' +
            '  background: radial-gradient(ellipse at center,' +
            '    rgba(11, 4, 16, 0.78) 0%, rgba(11, 4, 16, 0.92) 80%);' +
            '  display: flex; align-items: center; justify-content: center;' +
            '  padding: 24px;' +
            '  opacity: 0; transition: opacity 260ms cubic-bezier(0.22, 1, 0.36, 1);' +
            '}' +
            '#pp-ms-gate-backdrop.show { opacity: 1; }' +
            '#pp-ms-gate-panel {' +
            '  width: 100%; max-width: 360px;' +
            '  background: linear-gradient(180deg,' +
            '    rgba(43, 17, 51, 0.96) 0%, rgba(21, 8, 26, 0.96) 100%);' +
            '  border: 1px solid rgba(212, 168, 91, 0.32);' +
            '  border-radius: 16px;' +
            '  padding: 22px 22px 20px;' +
            '  box-shadow:' +
            '    inset 0 1px 0 rgba(212, 168, 91, 0.18),' +
            '    0 16px 48px -16px rgba(0, 0, 0, 0.8),' +
            '    0 0 48px rgba(122, 18, 36, 0.25);' +
            '  transform: translateY(8px) scale(0.97);' +
            '  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);' +
            '}' +
            '#pp-ms-gate-backdrop.show #pp-ms-gate-panel {' +
            '  transform: translateY(0) scale(1);' +
            '}' +
            '#pp-ms-gate-eyebrow {' +
            '  font-family: "Quicksand", "Inter", sans-serif;' +
            '  font-size: 9px; letter-spacing: 0.22em; font-weight: 600;' +
            '  color: rgba(232, 168, 91, 0.75); text-transform: uppercase;' +
            '  text-align: center; margin: 0 0 6px;' +
            '}' +
            '#pp-ms-gate-title {' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic;' +
            '  font-size: 18px; font-weight: 500;' +
            '  color: rgba(244, 235, 220, 0.96);' +
            '  text-align: center; margin: 0 0 14px;' +
            '}' +
            '#pp-ms-gate-hint {' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic;' +
            '  font-size: 13px; line-height: 1.5;' +
            '  color: rgba(232, 200, 220, 0.78);' +
            '  text-align: center; margin: 0 0 16px;' +
            '}' +
            '.pp-ms-gate-row {' +
            '  display: flex; align-items: flex-start; gap: 10px;' +
            '  padding: 10px 12px; margin-bottom: 6px;' +
            '  background: rgba(15, 8, 26, 0.55);' +
            '  border: 1px solid rgba(212, 168, 91, 0.14);' +
            '  border-radius: 10px;' +
            '}' +
            '.pp-ms-gate-row.is-done {' +
            '  border-color: rgba(212, 168, 91, 0.45);' +
            '  background: linear-gradient(180deg,' +
            '    rgba(43, 28, 56, 0.7) 0%, rgba(21, 8, 26, 0.7) 100%);' +
            '}' +
            '.pp-ms-gate-check {' +
            '  flex: 0 0 18px; width: 18px; height: 18px;' +
            '  border-radius: 50%;' +
            '  border: 1.5px solid rgba(212, 168, 91, 0.4);' +
            '  display: flex; align-items: center; justify-content: center;' +
            '  color: rgba(244, 235, 220, 0.5);' +
            '  font-size: 10px; line-height: 1;' +
            '  margin-top: 2px;' +
            '}' +
            '.pp-ms-gate-row.is-done .pp-ms-gate-check {' +
            '  border-color: #D4A85B;' +
            '  background: radial-gradient(circle at 32% 32%, #F2D690, #B8923E);' +
            '  color: #2B1133;' +
            '}' +
            '.pp-ms-gate-text { flex: 1 1 auto; }' +
            '.pp-ms-gate-label {' +
            '  font-family: "Cormorant Garamond", serif;' +
            '  font-size: 13px; line-height: 1.35;' +
            '  color: rgba(244, 235, 220, 0.92);' +
            '}' +
            '.pp-ms-gate-progress {' +
            '  font-family: "Quicksand", "Inter", sans-serif;' +
            '  font-size: 10px; letter-spacing: 0.08em;' +
            '  color: rgba(232, 168, 91, 0.72);' +
            '  margin-top: 3px;' +
            '}' +
            '#pp-ms-gate-close {' +
            '  display: block; margin: 16px auto 0;' +
            '  background: linear-gradient(180deg, rgba(122, 18, 36, 0.65), rgba(76, 14, 34, 0.85));' +
            '  border: 1px solid rgba(212, 168, 91, 0.4);' +
            '  color: rgba(244, 235, 220, 0.96);' +
            '  padding: 9px 28px; border-radius: 10px;' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic;' +
            '  font-size: 13px; letter-spacing: 0.04em;' +
            '  cursor: pointer;' +
            '}' +
            '#pp-ms-gate-close:active { transform: scale(0.96); }';
        document.head.appendChild(s);
    }

    function showCh6Checklist(opts) {
        opts = opts || {};
        injectChecklistStyles();
        var state = evaluateCh6();

        var existing = document.getElementById('pp-ms-gate-backdrop');
        if (existing) existing.remove();

        var bd = document.createElement('div');
        bd.id = 'pp-ms-gate-backdrop';
        bd.innerHTML =
            '<div id="pp-ms-gate-panel" role="dialog" aria-modal="true">' +
            '  <div id="pp-ms-gate-eyebrow">Locked</div>' +
            '  <h3 id="pp-ms-gate-title">' + (opts.title || 'Chapter 6') + '</h3>' +
            '  <p id="pp-ms-gate-hint">Three threads still to walk before the smoke at the treeline finds you.</p>' +
            '  <div id="pp-ms-gate-list"></div>' +
            '  <button id="pp-ms-gate-close" type="button">close</button>' +
            '</div>';
        document.body.appendChild(bd);

        var list = bd.querySelector('#pp-ms-gate-list');
        state.milestones.forEach(function (m) {
            var row = document.createElement('div');
            row.className = 'pp-ms-gate-row' + (m.done ? ' is-done' : '');
            row.innerHTML =
                '<span class="pp-ms-gate-check">' + (m.done ? '✓' : '') + '</span>' +
                '<span class="pp-ms-gate-text">' +
                '  <div class="pp-ms-gate-label">' + m.label + '</div>' +
                '  <div class="pp-ms-gate-progress">' + m.progress + '</div>' +
                '</span>';
            list.appendChild(row);
        });

        function close() {
            bd.classList.remove('show');
            setTimeout(function () { if (bd.parentNode) bd.parentNode.removeChild(bd); }, 280);
        }
        bd.querySelector('#pp-ms-gate-close').addEventListener('click', close);
        bd.addEventListener('click', function (e) {
            if (e.target === bd) close();
        });

        // Force layout, then show — gives the fade-in transition something to interpolate
        void bd.offsetHeight;
        bd.classList.add('show');
    }

    window.PPMSGate = {
        evaluateCh6:       evaluateCh6,
        checkBalanced:     checkBalanced,
        markTrust:         markTrust,
        showCh6Checklist:  showCh6Checklist,
        // Exposed for debugging / dev-tooling
        _bondLevelFor:     bondLevelFor
    };
})();
