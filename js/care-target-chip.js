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
//   - "NEXT" eyebrow
//   - The REWARD the player is working toward — "Elian" (caring for
//     Alistair to his target opens Elian's care route via Ch6). Aug 2026:
//     renamed from "Ch. 6" so the goal reads as a person, not a number.
//   - Two mini orbs, one per milestone (Bond 3 / Balanced care),
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

    // Aug 2026 — GENERALIZED to the whole ladder. The chip now shows on
    // ANY character's care screen, pointing at the NEXT rung, driven by
    // PPRouteGates.careLadderProgress(activeChar). prog() is the live data;
    // handoffCelebrated() mirrors ch6-unlock-celebration's per-handoff latch
    // so the chip retires once that rung's "a door opens" moment is seen.
    function prog() {
        var rg = window.PPRouteGates;
        if (!rg || typeof rg.careLadderProgress !== 'function') return null;
        try { return rg.careLadderProgress(activeChar()); } catch (_) { return null; }
    }
    function handoffCelebrated(nextChar) {
        if (!nextChar) return false;
        if (lsGet('pp_ladder_celebrated_' + nextChar) === '1') return true;
        if (nextChar === 'elian' && lsGet('pp_alistair_ch6_unlock_celebrated') === '1') return true;
        return false;
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
            // Jun 2026 — READY state when the gate has opened (both
            // milestones done). The chip transforms into a rose-gold
            // glowing "Begin Ch.6" treatment, replacing the muted
            // wine-velvet "Next Ch.6" look. Tapping the chip in this
            // state opens the chapter list directly instead of the
            // checklist popup (handled in togglePopup).
            '#' + CHIP_ID + '.is-ready {' +
            '  background: linear-gradient(180deg,' +
            '    rgba(122, 18, 36, 0.85) 0%, rgba(76, 14, 34, 0.95) 100%);' +
            '  border-color: rgba(232, 168, 91, 0.85);' +
            '  box-shadow:' +
            '    inset 0 1px 0 rgba(212, 168, 91, 0.4),' +
            '    0 10px 26px -10px rgba(0, 0, 0, 0.7),' +
            '    0 0 22px rgba(232, 76, 140, 0.55);' +
            '  animation: pp-ct-ready-pulse 2.4s ease-in-out infinite;' +
            '}' +
            '@keyframes pp-ct-ready-pulse {' +
            '  0%, 100% { box-shadow:' +
            '    inset 0 1px 0 rgba(212, 168, 91, 0.4),' +
            '    0 10px 26px -10px rgba(0, 0, 0, 0.7),' +
            '    0 0 22px rgba(232, 76, 140, 0.55); }' +
            '  50% { box-shadow:' +
            '    inset 0 1px 0 rgba(212, 168, 91, 0.6),' +
            '    0 10px 26px -10px rgba(0, 0, 0, 0.7),' +
            '    0 0 32px rgba(232, 76, 140, 0.85); }' +
            '}' +
            '#' + CHIP_ID + '.is-ready .pp-ct-eyebrow {' +
            '  color: rgba(244, 220, 168, 0.96);' +
            '}' +
            '#' + CHIP_ID + '.is-ready .pp-ct-target {' +
            '  color: rgba(255, 245, 230, 1);' +
            '  text-shadow: 0 0 10px rgba(232, 168, 91, 0.6);' +
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
            '}' +
            // Jun 2026 — visual progress bar for milestones with gradual
            // progression. The bond3 milestone exposes pct = affection /
            // 20 from PPMSGate.evaluateCh6(). Binary milestones get 0 or
            // 1 and the bar still renders for layout consistency.
            '#' + POPUP_ID + ' .pp-ctp-bar {' +
            '  margin-top: 5px;' +
            '  width: 100%; height: 3px;' +
            '  background: rgba(15, 8, 26, 0.85);' +
            '  border: 1px solid rgba(212, 168, 91, 0.18);' +
            '  border-radius: 999px;' +
            '  overflow: hidden;' +
            '}' +
            '#' + POPUP_ID + ' .pp-ctp-bar-fill {' +
            '  display: block; height: 100%;' +
            '  background: linear-gradient(90deg, #B8923E 0%, #F2D690 100%);' +
            '  border-radius: 999px;' +
            '  transition: width 280ms ease;' +
            '  box-shadow: 0 0 5px rgba(232, 168, 91, 0.55);' +
            '}' +
            '#' + POPUP_ID + ' .pp-ctp-row.done .pp-ctp-bar-fill {' +
            '  background: linear-gradient(90deg, #F2D690 0%, #FFE9B8 100%);' +
            '}' +
            // The "Read the story…" row doubles as a shortcut INTO the chapter
            // list — tap it to jump straight to the story and go complete the
            // read-through requirement. Pointer cursor + a gently pulsing ›
            // chevron advertise that it is tappable.
            '#' + POPUP_ID + ' .pp-ctp-row-go { cursor: pointer; transition: border-color 160ms ease, background 160ms ease; }' +
            '#' + POPUP_ID + ' .pp-ctp-row-go:hover, #' + POPUP_ID + ' .pp-ctp-row-go:active {' +
            '  border-color: rgba(232, 168, 91, 0.5); background: rgba(40, 22, 54, 0.7);' +
            '}' +
            '#' + POPUP_ID + ' .pp-ctp-go-chev {' +
            '  flex: 0 0 auto; align-self: center;' +
            '  font-family: "Cormorant Garamond", serif; font-size: 20px; line-height: 1;' +
            '  color: rgba(232, 168, 91, 0.8); margin-left: 2px;' +
            '  animation: ppCtpChev 1.6s ease-in-out infinite;' +
            '}' +
            '@keyframes ppCtpChev { 0%,100% { transform: translateX(0); opacity: 0.7; } 50% { transform: translateX(3px); opacity: 1; } }' +
            // Jun 2026 — belt-and-braces bleed-through guard. Even if the
            // JS teardown loses a race during a scene transition, CSS
            // hides the chip + popup whenever the player isn't on the
            // care screen. The body class is the scene authority
            // (scene-state.js), so this rule is the single source of truth.
            'body:not(.pp-screen-care) #' + CHIP_ID + ',' +
            'body:not(.pp-screen-care) #' + POPUP_ID + ' {' +
            '  display: none !important;' +
            '}';
        document.head.appendChild(s);
    }

    // ── Chip render ────────────────────────────────────────────────
    var _popupOpen = false;
    function buildChip(p) {
        injectStyles();
        var el = document.createElement('div');
        el.id = CHIP_ID;
        // Orbs built from the live milestone set (2 for a care-only rung
        // like →Proto, 3 when there's a gateway chapter). data-charid lets
        // update() rebuild the chip when the player switches companion.
        el.setAttribute('data-charid', p.charId);
        var orbs = p.milestones.map(function (m) {
            return '<span class="pp-ct-orb" data-key="' + m.key + '"></span>';
        }).join('');
        el.innerHTML =
            '<span class="pp-ct-eyebrow">Next</span>' +
            '<span class="pp-ct-target">' + p.nextName + '</span>' +
            '<div class="pp-ct-orbs">' + orbs + '</div>';
        el.addEventListener('click', togglePopup);
        document.body.appendChild(el);
        void el.offsetHeight;
        el.classList.add('show');
        return el;
    }

    function refreshChip(p) {
        var el = document.getElementById(CHIP_ID);
        if (!el || !p) return;
        p.milestones.forEach(function (m) {
            var orb = el.querySelector('.pp-ct-orb[data-key="' + m.key + '"]');
            if (orb) orb.classList.toggle('done', m.done);
        });
        // "ready" = the next rung is truly unlockable (care target AND the
        // linear story step). careLadderProgress.ready already ANDs both, so
        // the chip only flips to the "Meet <Name> ✦" CTA when the chapter /
        // route is actually available — it never points at a locked page.
        var ready = !!p.ready;
        el.classList.toggle('is-ready', ready);
        var eyebrow = el.querySelector('.pp-ct-eyebrow');
        var target  = el.querySelector('.pp-ct-target');
        if (eyebrow) eyebrow.textContent = ready ? 'Meet' : 'Next';
        if (target)  target.innerHTML    = ready ? (p.nextName + ' ✦') : p.nextName;
        // In-place popup refresh (no re-mount → no flicker on the poll tick).
        if (_popupOpen) refreshPopupInPlace(p);
    }

    function removeChip() {
        // Jun 2026 — owner reported the chip bleeding through during
        // care → Chronicle transitions. The 280ms opacity transition
        // meant the chip stayed visible briefly while the scene swapped.
        // Detach immediately on scene change; the player never sees a
        // ghost of the chip on the wrong screen.
        var el = document.getElementById(CHIP_ID);
        if (el && el.parentNode) el.parentNode.removeChild(el);
        // Jun 2026 — also tear down the popup synchronously and cancel
        // any in-flight close timer. The previous code called
        // closePopup() which scheduled a 260ms detach — meaning the
        // popup would linger on the wrong screen for a quarter second.
        // Now we cut everything immediately + reset all state.
        if (_popupCloseTimer) { clearTimeout(_popupCloseTimer); _popupCloseTimer = null; }
        _popupOpen = false;
        document.removeEventListener('click', closePopupOnOutside, true);
        var pop = document.getElementById(POPUP_ID);
        if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
    }

    // ── Popup (expanded checklist) ─────────────────────────────────
    // _popupCloseTimer holds the in-flight 260ms detach. Tracked at
    // module scope so a re-open can cancel it and reuse the existing
    // DOM node — preventing the "two popups exist for a moment" race
    // where closePopup's setTimeout fires after a fresh openPopup.
    var _popupCloseTimer = null;

    function togglePopup(e) {
        e.stopPropagation();
        // When the next rung is READY, the chip is a direct-jump CTA:
        // open the gateway chapter list, or (care-only rung → Proto) switch
        // to the newly opened companion. Only jumps when truly ready, so it
        // never sends the player to a locked page. Otherwise → checklist.
        try {
            var p = prog();
            if (p && p.ready) {
                closePopup();
                if (p.gatewayChapter) {
                    if (window.MSChapters && typeof window.MSChapters.open === 'function') {
                        window.MSChapters.open();
                    }
                } else {
                    try { if (typeof window.setActive === 'function') window.setActive(p.nextChar); } catch (_) {}
                }
                return;
            }
        } catch (_) { /* fall through to popup */ }
        if (_popupOpen) { closePopup(); return; }
        openPopup();
    }
    function openPopup() {
        var p = prog();
        if (!p) return;
        // Jun 2026 — if the popup is mid-close (showing the fade-out
        // transition), cancel the detach timer and reuse the existing
        // node. Without this, a fast double-tap closed then re-opened
        // the popup but the old detach timer would still fire 260ms
        // later and yank the freshly-reopened popup out of the DOM.
        if (_popupCloseTimer) { clearTimeout(_popupCloseTimer); _popupCloseTimer = null; }
        var existing = document.getElementById(POPUP_ID);
        if (existing) {
            // Mid-close: just refresh content and re-show it
            refreshPopupInPlace(p);
            existing.classList.add('show');
        } else {
            renderPopup(p);
        }
        _popupOpen = true;
        // Dismiss on outside-tap (delayed so the chip's own tap doesn't
        // immediately match the outside check).
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
        if (_popupCloseTimer) clearTimeout(_popupCloseTimer);
        _popupCloseTimer = setTimeout(function () {
            if (pop.parentNode) pop.parentNode.removeChild(pop);
            _popupCloseTimer = null;
        }, 260);
    }
    function renderPopup(p) {
        var existing = document.getElementById(POPUP_ID);
        if (existing) existing.remove();
        var pop = document.createElement('div');
        pop.id = POPUP_ID;
        var rows = p.milestones.map(function (m) {
            // data-key lets refreshPopupInPlace find each row without
            // re-rendering the popup — that re-render was the source of
            // the "popup flickers every 3 seconds" bug (the chip poll).
            var pct = (typeof m.pct === 'number') ? Math.round(m.pct * 100) : (m.done ? 100 : 0);
            // The read-through step ('sequence') doubles as a shortcut into the
            // chapter list — tappable, with a chevron, while it's still pending.
            var isGo = (m.key === 'sequence' && !!p.gatewayChapter);
            return '<div class="pp-ctp-row' + (m.done ? ' done' : '') + (isGo ? ' pp-ctp-row-go' : '') + '" data-key="' + m.key + '"' + (isGo ? ' role="button" tabindex="0"' : '') + '>' +
                '<span class="pp-ctp-check">' + (m.done ? '✓' : '') + '</span>' +
                '<span style="flex:1 1 auto;">' +
                '  <div class="pp-ctp-label">' + m.label + '</div>' +
                '  <div class="pp-ctp-prog">' + m.progress + '</div>' +
                '  <div class="pp-ctp-bar"><span class="pp-ctp-bar-fill" style="width:' + pct + '%"></span></div>' +
                '</span>' +
                (isGo && !m.done ? '<span class="pp-ctp-go-chev" aria-hidden="true">›</span>' : '') +
                '</div>';
        }).join('');
        pop.innerHTML =
            '<div class="pp-ctp-eyebrow">Next Route</div>' +
            '<div class="pp-ctp-title">' + p.nextName + '’s route opens</div>' +
            rows;
        document.body.appendChild(pop);
        // Wire the "Read the story…" row → open the chapter list so the player
        // can jump straight to reading and go complete the requirement. Same
        // jump the ready-CTA chip uses (togglePopup → MSChapters.open).
        try {
            var _goRow = pop.querySelector('.pp-ctp-row-go[data-key="sequence"]');
            if (_goRow) {
                _goRow.addEventListener('click', function (ev) {
                    ev.stopPropagation();
                    closePopup();
                    if (window.MSChapters && typeof window.MSChapters.open === 'function') {
                        window.MSChapters.open();
                    }
                });
            }
        } catch (_) {}
        void pop.offsetHeight;
        pop.classList.add('show');
    }
    // Update an already-mounted popup in place. No destroy + recreate,
    // so no fade-in flicker every poll tick. Called by refreshChip()
    // while _popupOpen is true.
    function refreshPopupInPlace(state) {
        var pop = document.getElementById(POPUP_ID);
        if (!pop) return;
        state.milestones.forEach(function (m) {
            var row = pop.querySelector('.pp-ctp-row[data-key="' + m.key + '"]');
            if (!row) return;
            row.classList.toggle('done', m.done);
            var check = row.querySelector('.pp-ctp-check');
            if (check) check.textContent = m.done ? '✓' : '';
            var prog = row.querySelector('.pp-ctp-prog');
            if (prog) prog.textContent = m.progress;
            var bar = row.querySelector('.pp-ctp-bar-fill');
            if (bar) {
                var pct = (typeof m.pct === 'number') ? Math.round(m.pct * 100) : (m.done ? 100 : 0);
                bar.style.width = pct + '%';
            }
        });
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
        // Canonical overlay authority (pp-overlay.js) — every surface this
        // hand list enumerated is in the shared registry now; the list is
        // only the fallback if PPOverlay isn't loaded.
        if (window.PPOverlay && typeof window.PPOverlay.busy === 'function') {
            return window.PPOverlay.busy();
        }
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
        // Aug 2026 — generic: show on ANY character's care screen that has a
        // pending next rung. prog() is null at the end of the chain (Proto)
        // or before route-gates loads.
        var p = prog();
        if (!p) return false;
        // A care-screen BEAT (small-moment / scheduled invitation / fight–makeup)
        // or the day-one overlay genuinely REPLACES the care UI → retire the chip.
        // Full-screen OVERLAYS (settings / gallery / letters / a chapter) are
        // deliberately NOT a reason to unmount: CSS hides the chip while they're
        // open and reveals it again instantly on close (the chip-hide + care-bleed
        // guards, both generated from PPOverlay's single overlay list). Removing +
        // re-mounting it for every overlay is what made it flash on other pages
        // for ~1s and then disappear/reappear 1–2s late on return to care.
        if (document.querySelector('#pp-sm-root:not(:empty), #pp-sched-root:not(:empty), #pp-fm-root:not(:empty), #pp-day-one-overlay')) return false;
        // Retire once this handoff's "a door opens" celebration has been
        // seen — the chip has done its job; the player can reach the next
        // character from the Chronicle / Story tab any time. Guard with
        // p.ready: only retire when the rung is ACTUALLY unlocked AND its
        // celebration acknowledged. A latch left set while the rung is still
        // locked (e.g. a gateway chapter moved later, re-locking a route
        // whose celebration already fired) must NOT hide the progress chip —
        // the player is still working toward it and needs the milestones.
        if (p.ready && handoffCelebrated(p.nextChar)) return false;
        return true;
    }

    // Jun 2026 — owner playtest: chip bled during Chronicle → care
    // transition. Root cause: TWO mount paths bypassed the scene-change
    // delay — the boot() initial call and the 3s setInterval poll. If
    // EITHER ran while body had just flipped to pp-screen-care (during
    // a transition), the chip mounted immediately. Now we track the
    // moment the player enters care and refuse to mount within the
    // first 900ms — long enough for the visual transition to complete.
    var _careEnteredAt = 0;
    var _wasOnCare = false;
    var CARE_SETTLE_MS = 900;

    function update() {
        var onCare = document.body.classList.contains('pp-screen-care');
        _wasOnCare = onCare;

        if (shouldShow()) {
            var p = prog();
            if (!p) { removeChip(); return; }
            // Block mount during the first CARE_SETTLE_MS of care entry —
            // the loading-screen → game-container transition can still
            // be visible and we don't want the chip popping in over it.
            if (_careEnteredAt && Date.now() - _careEnteredAt < CARE_SETTLE_MS) {
                var ex = document.getElementById(CHIP_ID);
                if (ex && ex.getAttribute('data-charid') === p.charId) refreshChip(p);
                return;
            }
            var chip = document.getElementById(CHIP_ID);
            // Rebuild when the player switched companion — the orbs + name
            // belong to a different character now.
            if (chip && chip.getAttribute('data-charid') !== p.charId) { removeChip(); chip = null; }
            if (!chip) buildChip(p);
            refreshChip(p);
        } else {
            removeChip();
        }
    }

    // ── Boot: scene + poll ─────────────────────────────────────────
    function boot() {
        update();
        // 3s poll for live milestone progress + scene transitions
        setInterval(update, 3000);
        // Jun 2026 — leave-care path tears down IMMEDIATELY (no fade
        // out — caused the chip to ghost onto Chronicle).
        // Owner playtest Jun 2026: chip was also "bleeding" during the
        // Chronicle → care transition. Root cause: the previous 200ms
        // mount delay wasn't long enough to cover the loading-screen
        // progress + game-container reveal that happens between the
        // CARE tap and the care screen being fully rendered. Bumping
        // the arrival delay to 900ms catches the typical transition.
        // Combined with the chip's 280ms fade-in (CSS), the chip starts
        // to appear at ~900ms and is fully visible at ~1180ms — by
        // which point the care screen has finished settling.
        document.addEventListener('pp:scene-change', function (e) {
            var scene = e && e.detail && e.detail.scene;
            if (scene && scene !== 'care') {
                removeChip();
                _careEnteredAt = 0; // reset so next entry re-stamps
            } else {
                // Stamp the entry timestamp HERE — at the moment the
                // scene actually changed, not later when update happens
                // to be polled. update()'s settle guard reads this to
                // suppress mounts during the visual transition window.
                _careEnteredAt = Date.now();
                // One-shot to fire update right after settle completes
                // so the chip appears at ~CARE_SETTLE_MS instead of
                // waiting up to 3s for the next poll tick.
                setTimeout(update, CARE_SETTLE_MS + 30);
            }
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
