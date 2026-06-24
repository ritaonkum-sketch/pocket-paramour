// ============================================================================
// MAIN-STORY GATE (Jun 2026)
// ----------------------------------------------------------------------------
// Rebuilds the "care → unlock → next chapter → care → unlock" loop that
// prologue-chain.js / world-arrival.js used to provide before the June
// clean-slate. Scoped to the FIRST link only — Alistair care unlocks
// Chapter 6 (Elian's first appearance). After Ch6 plays, Elian's care
// route opens via the existing chapters.js done-handler path.
//
// THE TWO MILESTONES (Alistair → Ch6)
//   1. Bond Level >= 3            (cumulative affection >= 20)
//   2. Balanced care once         (hunger + clean + bond all > 50
//                                  simultaneously — latched once true)
//
// Jun 2026 — owner removed the "trust earned" / "A moment he names you
// Weaver" milestone: Alistair never uses the word "Weaver" in his
// voice register, so the in-care talk hook that fired the line was
// out-of-voice. markTrust() and the KEY_TRUST localStorage key are
// kept as no-ops so any in-flight save with the latch set still loads
// cleanly. game.js's talk-handler hook was removed (no longer wired).
//
// Both milestones tracked via localStorage. The gate is "open" only when
// both return true. Once open, it stays open even if stats drop again
// (player has earned the reveal).
//
// PUBLIC API
//   window.PPMSGate.evaluateCh6()   → {locked, milestones[], opened}
//   window.PPMSGate.checkBalanced() → call after stat change; latches
//                                     pp_alistair_balanced_care if hit
//   window.PPMSGate.markTrust()     → kept as no-op (was wired to a
//                                     removed talk-beat; keep the
//                                     export so older builds don't
//                                     throw if they call it)
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

    // Jun 2026 — owner playtest: chip said "0 / 20 affection" even
    // though the player had been actively caring for Alistair. Root
    // cause: pp_affection_<char> is only written by the letter
    // system (letter.js) and affection-drift.js soft-cap. The in-care
    // affection gains (Feed +2, Wash +2, Gift +5, Train +5, Talk +N)
    // live in _game.affection and never sync to localStorage. The
    // gate was reading the stale localStorage value.
    //
    // Fix: prefer the live _game.affection value when the active
    // companion is the char being asked about. Fall back to
    // localStorage for off-character reads (e.g. checking Alistair's
    // bond while playing Lyra) so the legacy letter/drift writes
    // remain valid.
    function affectionFor(charId) {
        try {
            var g = window._game;
            if (g && typeof g.affection === 'number') {
                var live = (g.selectedCharacter || g.characterId);
                if (live === charId) return Math.max(0, g.affection);
            }
        } catch (_) { /* fall through */ }
        var raw = parseInt(lsGet('pp_affection_' + charId) || '0', 10) || 0;
        return raw < 0 ? 0 : raw;
    }

    // Mirror of index.html's bondLevel() so the gate works without
    // having to reach into select-screen scope.
    function bondLevelFor(charId) {
        var raw = affectionFor(charId);
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

    // ── Stat watcher: latches pp_<char>_balanced_care once all three
    // care stats exceed 50 at the same time, for WHICHEVER character is
    // the active care session.
    //
    // Aug 2026 — generalized from Alistair-only. The care-route LADDER
    // (route-gates.js) uses "Bond Level 3 + balanced care" as every
    // character's unlock target, so the balanced-care latch must work
    // for all 7, not just Alistair. We write the per-character key
    // pp_<char>_balanced_care; for Alistair that is exactly the legacy
    // KEY_BALANCED, so evaluateCh6() keeps reading the same flag.
    //
    // Called: once on load, on a 4s poll while a game is active, and
    // exposed for external explicit calls.
    function checkBalanced() {
        var g = (typeof window !== 'undefined') ? window._game : null;
        if (!g) return false;
        var ch = g.characterId || g.selectedCharacter;
        if (!ch) return false;
        var key = 'pp_' + ch + '_balanced_care';
        if (lsGet(key) === '1') return true; // already latched for this char
        var h = g.hunger, c = g.clean, b = g.bond;
        if (typeof h !== 'number' || typeof c !== 'number' || typeof b !== 'number') {
            return false;
        }
        if (h > 50 && c > 50 && b > 50) {
            lsSet(key, '1');
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
    //
    // Jun 2026 — two-milestone gate now (trust beat removed). The
    // bond3 milestone exposes both a textual progress and a 0-1
    // `pct` field so the UI can render a visual bar. The threshold
    // for Bond Level 3 is 20 cumulative affection (see bondLevelFor).
    function evaluateCh6() {
        var m1 = hasBondLevel3();
        var m2 = hasBalancedCare();
        // Aug 2026 — third milestone: the linear story gate. Ch6 needs BOTH
        // the care target AND Alistair's chapters read through Ch5 (see the
        // stacked-gates model in chapters.js). Owner playtest: with only the
        // two care milestones shown, finishing them looked "complete" but no
        // "Elian's route opens" popup fired (Ch5 wasn't read) — the
        // requirement was invisible. Surfacing it as a visible task removes
        // the confusion. NOTE: opened/locked deliberately stay care-only so
        // the existing Ch6 gate logic in chapters.js is untouched; the
        // chip + celebration already AND this with pp_chapter_done_5.
        var m3 = lsGet('pp_chapter_done_5') === '1';
        var readCount = 0;
        ['2', '3', '4', '5'].forEach(function (n) {
            if (lsGet('pp_chapter_done_' + n) === '1') readCount++;
        });
        var bl = bondLevelFor('alistair');
        // Jun 2026 — read via affectionFor() so the progress reflects
        // live in-game gains (Feed/Wash/Gift/Train/Talk) instead of
        // the stale localStorage key that only the letter system
        // writes to.
        var rawAff = affectionFor('alistair');
        var BOND3_THRESHOLD = 20;
        var bondPct = m1 ? 1 : Math.max(0, Math.min(1, rawAff / BOND3_THRESHOLD));
        return {
            opened: m1 && m2,
            locked: !(m1 && m2),
            milestones: [
                {
                    key: 'bond3',
                    label: 'Bond Level 3 with Alistair',
                    progress: m1
                        ? 'Reached'
                        : (rawAff + ' / ' + BOND3_THRESHOLD + ' affection'),
                    pct: bondPct,
                    done: m1
                },
                {
                    key: 'balanced',
                    label: 'Care for him in balance (every stat above 50)',
                    progress: m2 ? 'Once' : 'Not yet',
                    pct: m2 ? 1 : 0,
                    done: m2
                },
                {
                    key: 'sequence',
                    label: 'Read his story through Chapter 5',
                    progress: m3 ? 'Reached' : (readCount + ' / 4 chapters'),
                    pct: m3 ? 1 : (readCount / 4),
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
            // Jun 2026 — visual progress bar for milestones with a
            // gradual numeric progression (currently only the bond3
            // milestone). Binary milestones get pct: 0 or 1 and the
            // bar still renders for visual consistency.
            '.pp-ms-gate-bar {' +
            '  margin-top: 6px;' +
            '  width: 100%; height: 4px;' +
            '  background: rgba(15, 8, 26, 0.85);' +
            '  border: 1px solid rgba(212, 168, 91, 0.18);' +
            '  border-radius: 999px;' +
            '  overflow: hidden;' +
            '}' +
            '.pp-ms-gate-bar-fill {' +
            '  display: block; height: 100%;' +
            '  background: linear-gradient(90deg, #B8923E 0%, #F2D690 100%);' +
            '  border-radius: 999px;' +
            '  transition: width 280ms ease;' +
            '  box-shadow: 0 0 6px rgba(232, 168, 91, 0.55);' +
            '}' +
            '.pp-ms-gate-row.is-done .pp-ms-gate-bar-fill {' +
            '  background: linear-gradient(90deg, #F2D690 0%, #FFE9B8 100%);' +
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
            '  <p id="pp-ms-gate-hint">Two threads still to walk before the smoke at the treeline finds you.</p>' +
            '  <div id="pp-ms-gate-list"></div>' +
            '  <button id="pp-ms-gate-close" type="button">close</button>' +
            '</div>';
        document.body.appendChild(bd);

        var list = bd.querySelector('#pp-ms-gate-list');
        state.milestones.forEach(function (m) {
            var row = document.createElement('div');
            row.className = 'pp-ms-gate-row' + (m.done ? ' is-done' : '');
            var pct = (typeof m.pct === 'number') ? Math.round(m.pct * 100) : (m.done ? 100 : 0);
            row.innerHTML =
                '<span class="pp-ms-gate-check">' + (m.done ? '✓' : '') + '</span>' +
                '<span class="pp-ms-gate-text">' +
                '  <div class="pp-ms-gate-label">' + m.label + '</div>' +
                '  <div class="pp-ms-gate-progress">' + m.progress + '</div>' +
                '  <div class="pp-ms-gate-bar"><span class="pp-ms-gate-bar-fill" style="width:' + pct + '%"></span></div>' +
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
