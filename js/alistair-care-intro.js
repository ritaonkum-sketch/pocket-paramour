// ============================================================================
// ALISTAIR CARE INTRO (Jun 2026)
// ----------------------------------------------------------------------------
// First-time-player welcome carousel for Alistair's care route. Fires once,
// the first time the player enters care after finishing Chapter 1, and
// walks them through:
//
//   Panel 1 — Tend to him.            (the five care actions)
//   Panel 2 — Listen for his bond.    (bond tiers + how to read his state)
//   Panel 3 — What lies ahead.        (the Chapter 6 + Elian goal, live
//                                      milestones from PPMSGate)
//
// Gated by localStorage pp_alistair_care_intro_seen (one-shot). The
// carousel is dismissible by reaching the third panel and tapping Begin,
// or by the skip link in the corner. Defers while the first-care-hint
// flow is pending so we never pile up overlays.
//
// SCOPE — Alistair only. Other companions don't get a welcome carousel
// because by the time the player reaches them they've already learned
// the loop on Alistair. The brand-aligned style + SVG icons + dot
// navigation + swipe support are all worth the file size HERE because
// this is the player's first impression of the care loop.
// ============================================================================
(function () {
    'use strict';

    var FLAG        = 'pp_alistair_care_intro_seen';
    var BACKDROP_ID = 'pp-aci-backdrop';
    var CARD_ID     = 'pp-aci-card';
    var STYLES_ID   = 'pp-aci-styles';

    var _panelIndex  = 0;
    var _swipeStart  = null;

    // Mount state is derived from DOM presence, NOT from a flag. Owner
    // ran into this: removing the backdrop directly (e.g. by another
    // system or a teardown sweep) without going through dismiss() left
    // the module thinking it was still mounted, so subsequent show()
    // calls silently bailed. DOM is the source of truth.
    function isMounted() { return !!document.getElementById(BACKDROP_ID); }

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* swallow */ } }
    function isSeen() { return lsGet(FLAG) === '1'; }

    function activeChar() {
        var g = window._game;
        return (g && (g.characterId || g.selectedCharacter))
            || lsGet('pp_cc_active_companion')
            || null;
    }

    function ch1Done() { return lsGet('pp_chapter_done_1') === '1'; }

    // ── SVG icon paths (lifted from index.html so the welcome card
    //    shows the SAME action glyphs the player will see at the bottom
    //    of the screen — keeps recognition fast). ────────────────────
    function svg(paths) {
        return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" ' +
               'stroke="currentColor" stroke-width="1.6" ' +
               'stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">' +
               paths + '</svg>';
    }
    var ICONS = {
        feed:  svg('<path d="M6 4h12l-1.5 8a4.5 4.5 0 0 1-9 0z"/>' +
                   '<path d="M12 16v4"/><path d="M9 20h6"/>'),
        wash:  svg('<path d="M12 3c-3.5 4-7 8-7 12.5A7 7 0 0 0 12 22a7 7 0 0 0 7-6.5C19 11 15.5 7 12 3z"/>'),
        gift:  svg('<rect x="3.5" y="9" width="17" height="11" rx="1.2"/>' +
                   '<path d="M3.5 13h17"/><path d="M12 9v11"/>' +
                   '<path d="M8 9a2.5 2.5 0 1 1 4-2.5 2.5 2.5 0 1 1 4 2.5"/>'),
        train: svg('<path d="M12 2v15"/><path d="M7.5 17h9"/>' +
                   '<path d="M10.5 17v3.5"/><path d="M13.5 17v3.5"/>' +
                   '<circle cx="12" cy="21.5" r="1.2"/>'),
        talk:  svg('<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 4v-4H6a2 2 0 0 1-2-2z"/>' +
                   '<path d="M12 13l-2.2-2.1a1.5 1.5 0 1 1 2.2-2 1.5 1.5 0 1 1 2.2 2z" fill="currentColor" stroke="none" opacity="0.85"/>')
    };

    // ── Panel content ──────────────────────────────────────────────
    function actionsList() {
        function row(icon, label, desc) {
            return '<div class="pp-aci-action-row">' +
                '<span class="pp-aci-action-icon">' + icon + '</span>' +
                '<span class="pp-aci-action-text">' +
                '<span class="pp-aci-action-label">' + label + '</span>' +
                '<span class="pp-aci-action-desc">' + desc + '</span>' +
                '</span>' +
                '</div>';
        }
        return '<div class="pp-aci-actions">' +
            row(ICONS.feed,  'Feed',  'Tends his hunger.') +
            row(ICONS.wash,  'Wash',  'Keeps him steady and clean.') +
            row(ICONS.gift,  'Gift',  'A small thing he will remember.') +
            row(ICONS.train, 'Train', 'The form he was raised in.') +
            row(ICONS.talk,  'Talk',  'A word at a time. He listens.') +
            '</div>';
    }

    function tierBar() {
        function chip(label, active) {
            return '<span class="pp-aci-tier-chip' + (active ? ' active' : '') + '">' + label + '</span>';
        }
        var arrow = '<span class="pp-aci-tier-arrow">›</span>';
        return '<div class="pp-aci-tier-row">' +
            chip('Stranger',  false) + arrow +
            chip('Acquainted', true)  + arrow +
            chip('Trusted',    false) + arrow +
            chip('Close',      false) +
            '</div>' +
            '<div class="pp-aci-tier-caption">' +
            'Bond Level rises as you tend him. The heart on his card tracks it.' +
            '</div>';
    }

    function milestonePreview() {
        var state = null;
        try { if (window.PPMSGate) state = window.PPMSGate.evaluateCh6(); } catch (_) {}
        if (!state) {
            // Defensive fallback if PPMSGate hasn't loaded yet
            state = { milestones: [
                { key: 'bond3',    label: 'Bond Level 3 with Alistair',
                  progress: '0 / 20 affection', pct: 0, done: false },
                { key: 'balanced', label: 'Care for him in balance',
                  progress: 'Not yet', pct: 0, done: false }
            ] };
        }
        var rows = state.milestones.map(function (m) {
            var pct = Math.round((m.pct || (m.done ? 1 : 0)) * 100);
            return '<div class="pp-aci-ms-row' + (m.done ? ' is-done' : '') + '">' +
                '<span class="pp-aci-ms-check">' + (m.done ? '✓' : '') + '</span>' +
                '<span class="pp-aci-ms-text">' +
                '<div class="pp-aci-ms-label">' + m.label + '</div>' +
                '<div class="pp-aci-ms-prog">' + m.progress + '</div>' +
                '<div class="pp-aci-ms-bar">' +
                '<span class="pp-aci-ms-bar-fill" style="width:' + pct + '%"></span>' +
                '</div>' +
                '</span>' +
                '</div>';
        }).join('');
        return '<div class="pp-aci-ms-list">' + rows + '</div>';
    }

    var PANELS = [
        {
            eyebrow: 'Tend to him',
            title:   'A knight asks for nothing.',
            body:    'Five quiet ways to meet him. Use the row across the bottom of his screen.',
            content: actionsList,
            footer:  null
        },
        {
            eyebrow: 'Listen for his bond',
            title:   'Every act tends a thread.',
            body:    'His hunger, his calm, his bond: the three bars under his portrait. Keep them in balance and he will let you closer.',
            content: tierBar,
            footer:  null
        },
        {
            eyebrow: 'What lies ahead',
            title:   'Two threads to walk.',
            body:    'Reach Bond Level 3 and care for him in balance. When both are true, Chapter 6 opens, and Elian’s thread with it.',
            content: milestonePreview,
            footer:  'Walk those threads, and the smoke at the treeline finds you.'
        }
    ];

    // ── Eligibility ────────────────────────────────────────────────
    function shouldShow() {
        if (isSeen()) return false;
        if (!document.body.classList.contains('pp-screen-care')) return false;
        if (activeChar() !== 'alistair') return false;
        if (!ch1Done()) return false;
        // Defer while first-care-hint is walking the player through the
        // chp-back / CARE pulse sequence — they'd pile up.
        if (window.PPFirstCareHint && window.PPFirstCareHint.isPending
            && window.PPFirstCareHint.isPending()) return false;
        // Defer over any story / chapter / cinematic / intro overlay.
        // Jul 2026: also defer to the onboarding tour and the card-reveal
        // popup — the playtest caught this guide stacked under BOTH (four
        // overlays deep). One tutorial at a time.
        if (document.querySelector(
            '#mscard-root:not(:empty), #chp-page:not(.hidden):not(:empty),' +
            '#intro-overlay.visible, #cinematic-overlay.visible,' +
            '#tp-root:not(:empty), #ms-encounter-root:not(:empty),' +
            '#story-overlay:not(.hidden), #event-overlay:not(.hidden),' +
            '#date-overlay:not(.hidden), #gift-panel:not(.hidden),' +
            '#training-panel:not(.hidden),' +
            '#pp-onboarding-overlay.show, #card-reveal-overlay:not(.hidden),' +
            '#pp-today-overlay.show'
        )) return false;
        if (document.body.classList.contains('cinematic-transition')) return false;
        return true;
    }

    // ── Styles ─────────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById(STYLES_ID)) return;
        var s = document.createElement('style');
        s.id = STYLES_ID;
        s.textContent = `
            #${BACKDROP_ID} {
                position: fixed; inset: 0;
                z-index: 14200;
                background: radial-gradient(ellipse at center,
                    rgba(11, 4, 16, 0.86) 0%,
                    rgba(11, 4, 16, 0.97) 80%);
                display: flex; align-items: center; justify-content: center;
                padding: 18px;
                opacity: 0;
                transition: opacity 320ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            #${BACKDROP_ID}.show { opacity: 1; }

            #${CARD_ID} {
                width: 100%; max-width: 380px;
                background: linear-gradient(180deg,
                    rgba(43, 17, 51, 0.97) 0%,
                    rgba(21, 8, 26, 0.97) 100%);
                border: 1px solid rgba(212, 168, 91, 0.45);
                border-radius: 18px;
                padding: 26px 22px 18px;
                box-shadow:
                    inset 0 1px 0 rgba(212, 168, 91, 0.22),
                    0 24px 56px -18px rgba(0, 0, 0, 0.88),
                    0 0 64px rgba(232, 76, 140, 0.32);
                transform: translateY(12px) scale(0.94);
                transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
                position: relative;
                overflow: hidden;
            }
            #${BACKDROP_ID}.show #${CARD_ID} {
                transform: translateY(0) scale(1);
            }
            #${CARD_ID}::before {
                content: '';
                position: absolute;
                top: 0; left: 50%; transform: translateX(-50%);
                width: 64%; height: 1px;
                background: linear-gradient(90deg,
                    transparent, rgba(232, 168, 91, 0.55), transparent);
            }

            .pp-aci-skip {
                position: absolute;
                top: 10px; right: 12px;
                font-family: Quicksand, Inter, sans-serif;
                font-size: 9px; letter-spacing: 0.18em; font-weight: 600;
                color: rgba(232, 168, 91, 0.55);
                text-transform: uppercase;
                cursor: pointer;
                background: none; border: none; padding: 6px 8px;
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
                transition: color 200ms ease;
            }
            .pp-aci-skip:hover, .pp-aci-skip:active {
                color: rgba(232, 168, 91, 0.95);
            }

            /* Panel slot — the ACTIVE panel takes natural flow height
               (position: relative), inactive panels overlay behind it
               (position: absolute, inset: 0, opacity 0). This means
               the stage auto-sizes to the active panel — no fixed
               min-height that the content can overflow past, no
               overlap between the panel and the dots/buttons below.
               Owner playtest Jun 2026 caught a TALK row being eaten
               by the Next button because min-height: 322px was less
               than the actual panel content (~360px). */
            .pp-aci-stage {
                position: relative;
            }
            .pp-aci-panel {
                opacity: 0;
                transform: translateY(6px);
                transition: opacity 320ms cubic-bezier(0.22, 1, 0.36, 1),
                            transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
                pointer-events: none;
                position: absolute;
                top: 0; left: 0; right: 0;
            }
            .pp-aci-panel.active {
                opacity: 1;
                transform: translateY(0);
                pointer-events: auto;
                position: relative;
            }

            .pp-aci-eyebrow {
                font-family: Quicksand, Inter, sans-serif;
                font-size: 10px; letter-spacing: 0.24em; font-weight: 600;
                color: rgba(232, 168, 91, 0.88);
                text-transform: uppercase;
                text-align: center;
                margin: 0 0 7px;
            }
            .pp-aci-title {
                font-family: 'Cormorant Garamond', serif;
                font-style: italic;
                font-size: 22px; font-weight: 500;
                color: rgba(244, 235, 220, 0.98);
                text-align: center;
                margin: 0 0 10px;
                line-height: 1.18;
            }
            .pp-aci-body {
                font-family: 'Cormorant Garamond', serif;
                font-style: italic;
                font-size: 13.5px; line-height: 1.55;
                color: rgba(232, 200, 220, 0.88);
                text-align: center;
                margin: 0 0 14px;
            }
            .pp-aci-content { margin: 0 0 12px; }
            .pp-aci-footer {
                font-family: 'Cormorant Garamond', serif;
                font-style: italic;
                font-size: 12px;
                color: rgba(212, 168, 91, 0.72);
                text-align: center;
                margin: 6px 0 0;
            }

            /* Action rows — five care moves */
            .pp-aci-actions {
                display: flex; flex-direction: column;
                gap: 5px;
            }
            .pp-aci-action-row {
                display: flex; align-items: center; gap: 11px;
                padding: 7px 12px;
                background: rgba(15, 8, 26, 0.55);
                border: 1px solid rgba(212, 168, 91, 0.16);
                border-radius: 10px;
            }
            .pp-aci-action-icon {
                flex: 0 0 22px;
                width: 22px; height: 22px;
                display: flex; align-items: center; justify-content: center;
                color: rgba(232, 168, 91, 0.88);
            }
            .pp-aci-action-text {
                display: flex; flex-direction: column;
                gap: 0;
            }
            .pp-aci-action-label {
                font-family: Quicksand, Inter, sans-serif;
                font-size: 11px; letter-spacing: 0.10em; font-weight: 600;
                color: rgba(244, 235, 220, 0.94);
                text-transform: uppercase;
            }
            .pp-aci-action-desc {
                font-family: 'Cormorant Garamond', serif;
                font-style: italic;
                font-size: 12px; line-height: 1.3;
                color: rgba(232, 200, 220, 0.72);
            }

            /* Tier row — Stranger → Acquainted → Trusted → Close */
            .pp-aci-tier-row {
                display: flex; align-items: center; justify-content: center;
                gap: 4px; flex-wrap: wrap;
                margin: 0 0 14px;
            }
            .pp-aci-tier-chip {
                font-family: Quicksand, Inter, sans-serif;
                font-size: 9px; letter-spacing: 0.14em; font-weight: 600;
                color: rgba(232, 200, 220, 0.58);
                text-transform: uppercase;
                padding: 5px 9px;
                border-radius: 999px;
                border: 1px solid rgba(212, 168, 91, 0.22);
                background: rgba(15, 8, 26, 0.45);
            }
            .pp-aci-tier-chip.active {
                color: rgba(244, 235, 220, 0.96);
                background: linear-gradient(180deg,
                    rgba(122, 18, 36, 0.75) 0%,
                    rgba(76, 14, 34, 0.92) 100%);
                border-color: rgba(212, 168, 91, 0.55);
                box-shadow: 0 0 14px rgba(232, 76, 140, 0.40);
            }
            .pp-aci-tier-arrow {
                color: rgba(212, 168, 91, 0.50);
                font-size: 14px;
                line-height: 1;
            }
            .pp-aci-tier-caption {
                font-family: 'Cormorant Garamond', serif;
                font-style: italic;
                font-size: 12.5px; line-height: 1.5;
                color: rgba(232, 200, 220, 0.78);
                text-align: center;
                padding: 0 6px;
            }

            /* Milestone preview (Panel 3) */
            .pp-aci-ms-list {
                display: flex; flex-direction: column; gap: 6px;
            }
            .pp-aci-ms-row {
                display: flex; align-items: flex-start; gap: 10px;
                padding: 9px 12px;
                background: rgba(15, 8, 26, 0.55);
                border: 1px solid rgba(212, 168, 91, 0.16);
                border-radius: 10px;
            }
            .pp-aci-ms-row.is-done {
                border-color: rgba(212, 168, 91, 0.45);
                background: linear-gradient(180deg,
                    rgba(43, 28, 56, 0.7) 0%,
                    rgba(21, 8, 26, 0.7) 100%);
            }
            .pp-aci-ms-check {
                flex: 0 0 16px; width: 16px; height: 16px;
                border-radius: 50%;
                border: 1.5px solid rgba(212, 168, 91, 0.42);
                display: flex; align-items: center; justify-content: center;
                color: rgba(244, 235, 220, 0.5);
                font-size: 9px; line-height: 1;
                margin-top: 2px;
            }
            .pp-aci-ms-row.is-done .pp-aci-ms-check {
                border-color: #D4A85B;
                background: radial-gradient(circle at 32% 32%, #F2D690, #B8923E);
                color: #2B1133;
            }
            .pp-aci-ms-text { flex: 1 1 auto; }
            .pp-aci-ms-label {
                font-family: 'Cormorant Garamond', serif;
                font-size: 12.5px; line-height: 1.3;
                color: rgba(244, 235, 220, 0.92);
            }
            .pp-aci-ms-prog {
                font-family: Quicksand, Inter, sans-serif;
                font-size: 9px; letter-spacing: 0.08em;
                color: rgba(232, 168, 91, 0.74);
                margin-top: 3px;
            }
            .pp-aci-ms-bar {
                margin-top: 5px;
                width: 100%; height: 3px;
                background: rgba(15, 8, 26, 0.85);
                border: 1px solid rgba(212, 168, 91, 0.18);
                border-radius: 999px;
                overflow: hidden;
            }
            .pp-aci-ms-bar-fill {
                display: block; height: 100%;
                background: linear-gradient(90deg, #B8923E 0%, #F2D690 100%);
                box-shadow: 0 0 5px rgba(232, 168, 91, 0.55);
                transition: width 280ms ease;
            }
            .pp-aci-ms-row.is-done .pp-aci-ms-bar-fill {
                background: linear-gradient(90deg, #F2D690 0%, #FFE9B8 100%);
            }

            /* Dot pagination */
            .pp-aci-dots {
                display: flex; justify-content: center; gap: 7px;
                margin: 14px 0 12px;
            }
            .pp-aci-dot {
                width: 6px; height: 6px;
                border-radius: 50%;
                background: rgba(212, 168, 91, 0.22);
                transition: width 280ms ease, background 280ms ease,
                            box-shadow 280ms ease, border-radius 280ms ease;
                cursor: pointer;
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
            }
            .pp-aci-dot.active {
                width: 18px; border-radius: 3px;
                background: linear-gradient(90deg, #B8923E, #F2D690);
                box-shadow: 0 0 8px rgba(232, 168, 91, 0.65);
            }

            /* Buttons */
            .pp-aci-buttons {
                display: flex; gap: 8px; justify-content: center;
            }
            .pp-aci-btn {
                font-family: 'Cormorant Garamond', serif;
                font-style: italic;
                font-size: 14px; letter-spacing: 0.04em;
                padding: 10px 28px;
                border-radius: 11px;
                cursor: pointer;
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
                min-height: 44px; min-width: 96px;
                transition: transform 140ms ease, background 220ms ease;
                border: 1px solid rgba(212, 168, 91, 0.42);
                color: rgba(244, 235, 220, 0.96);
            }
            .pp-aci-btn.secondary {
                background: linear-gradient(180deg,
                    rgba(60, 40, 20, 0.45),
                    rgba(40, 28, 14, 0.6));
            }
            .pp-aci-btn.primary {
                background: linear-gradient(180deg,
                    rgba(232, 76, 140, 0.85) 0%,
                    rgba(122, 18, 36, 0.96) 100%);
                border-color: rgba(212, 168, 91, 0.6);
                box-shadow: 0 8px 22px -6px rgba(232, 76, 140, 0.65);
            }
            .pp-aci-btn:active { transform: scale(0.96); }
            .pp-aci-btn.hidden { visibility: hidden; pointer-events: none; }
        `;
        document.head.appendChild(s);
    }

    // ── Mount + render ─────────────────────────────────────────────
    function mount() {
        if (isMounted()) return;
        injectStyles();
        _panelIndex = 0;

        var bd = document.createElement('div');
        bd.id = BACKDROP_ID;
        bd.setAttribute('role', 'dialog');
        bd.setAttribute('aria-modal', 'true');
        bd.setAttribute('aria-label', 'Care Route Welcome');

        var panelsHtml = PANELS.map(function (p, i) {
            return '<div class="pp-aci-panel' + (i === 0 ? ' active' : '') + '" data-i="' + i + '">' +
                '<div class="pp-aci-eyebrow">' + p.eyebrow + '</div>' +
                '<h2 class="pp-aci-title">' + p.title + '</h2>' +
                '<p class="pp-aci-body">' + p.body + '</p>' +
                '<div class="pp-aci-content">' + p.content() + '</div>' +
                (p.footer ? '<p class="pp-aci-footer">' + p.footer + '</p>' : '') +
                '</div>';
        }).join('');

        var dotsHtml = PANELS.map(function (_, i) {
            return '<span class="pp-aci-dot' + (i === 0 ? ' active' : '') +
                   '" data-i="' + i + '" role="button" aria-label="Panel ' + (i + 1) + '"></span>';
        }).join('');

        bd.innerHTML =
            '<div id="' + CARD_ID + '">' +
            '<button type="button" class="pp-aci-skip" aria-label="Skip intro">Skip</button>' +
            '<div class="pp-aci-stage">' + panelsHtml + '</div>' +
            '<div class="pp-aci-dots">' + dotsHtml + '</div>' +
            '<div class="pp-aci-buttons">' +
            '<button type="button" class="pp-aci-btn secondary pp-aci-back hidden">Back</button>' +
            '<button type="button" class="pp-aci-btn primary pp-aci-next">Next</button>' +
            '</div>' +
            '</div>';

        document.body.appendChild(bd);

        var card    = bd.querySelector('#' + CARD_ID);
        var skipBtn = bd.querySelector('.pp-aci-skip');
        var backBtn = bd.querySelector('.pp-aci-back');
        var nextBtn = bd.querySelector('.pp-aci-next');

        skipBtn.addEventListener('click', dismiss);
        backBtn.addEventListener('click', function () { goToPanel(_panelIndex - 1); });
        nextBtn.addEventListener('click', function () { goToPanel(_panelIndex + 1); });

        Array.from(bd.querySelectorAll('.pp-aci-dot')).forEach(function (dot) {
            dot.addEventListener('click', function () {
                var i = parseInt(dot.getAttribute('data-i'), 10);
                if (!isNaN(i)) goToPanel(i);
            });
        });

        // Swipe — left = next, right = back. Pointer events cover
        // both mouse + touch on every modern browser.
        card.addEventListener('pointerdown', function (e) {
            _swipeStart = { x: e.clientX, y: e.clientY };
        });
        function swipeEnd(e) {
            if (!_swipeStart) return;
            var dx = e.clientX - _swipeStart.x;
            var dy = e.clientY - _swipeStart.y;
            _swipeStart = null;
            if (Math.abs(dx) < 48 || Math.abs(dy) > Math.abs(dx)) return;
            if (dx < 0) goToPanel(_panelIndex + 1);
            else        goToPanel(_panelIndex - 1);
        }
        card.addEventListener('pointerup', swipeEnd);
        card.addEventListener('pointercancel', function () { _swipeStart = null; });

        void bd.offsetHeight; // force layout, then fade in
        bd.classList.add('show');
    }

    function goToPanel(i) {
        if (i < 0) return; // can't go before first
        if (i >= PANELS.length) { dismiss(); return; } // tapped Begin on last
        if (i === _panelIndex) return;
        _panelIndex = i;
        var bd = document.getElementById(BACKDROP_ID);
        if (!bd) return;
        Array.from(bd.querySelectorAll('.pp-aci-panel')).forEach(function (p, idx) {
            p.classList.toggle('active', idx === i);
        });
        Array.from(bd.querySelectorAll('.pp-aci-dot')).forEach(function (p, idx) {
            p.classList.toggle('active', idx === i);
        });
        var backBtn = bd.querySelector('.pp-aci-back');
        var nextBtn = bd.querySelector('.pp-aci-next');
        if (backBtn) backBtn.classList.toggle('hidden', i === 0);
        if (nextBtn) nextBtn.textContent = i === PANELS.length - 1 ? 'Begin' : 'Next';
    }

    function dismiss() {
        lsSet(FLAG, '1');
        var bd = document.getElementById(BACKDROP_ID);
        if (!bd) return;
        bd.classList.remove('show');
        setTimeout(function () {
            if (bd.parentNode) bd.parentNode.removeChild(bd);
        }, 360);
    }

    // ── Boot ───────────────────────────────────────────────────────
    // Jun 2026 — owner playtest revealed the autonomous trigger missed
    // the case where Alistair's intro cinematic is mid-play when
    // pp:scene-change → 'care' fires. The 800ms setTimeout's second
    // shouldShow() check correctly bails (intro-overlay.visible), but
    // there was no retry — so once the intro cleared, the carousel
    // never tried again. Added a poll while on care + unseen so the
    // carousel waits patiently for every blocker to clear, then fires.
    function tryShow() {
        if (isMounted() || isSeen()) {
            stopPoll();
            return;
        }
        // 800ms grace lets the CARE pulse fully clear + the care
        // screen settle. If shouldShow goes false during the grace
        // (e.g. the intro cinematic hasn't finished yet), the poll
        // below catches the next opportunity.
        setTimeout(function () {
            if (isMounted() || isSeen()) {
                stopPoll();
                return;
            }
            if (shouldShow()) {
                stopPoll();
                mount();
            }
        }, 800);
    }

    var _pollTimer = null;
    function startPoll() {
        if (_pollTimer) return;
        _pollTimer = setInterval(function () {
            // Stop polling once seen / mounted / not on care anymore
            if (isSeen() || isMounted()) { stopPoll(); return; }
            if (!document.body.classList.contains('pp-screen-care')) return;
            tryShow();
        }, 2000);
    }
    function stopPoll() {
        if (!_pollTimer) return;
        clearInterval(_pollTimer);
        _pollTimer = null;
    }

    function boot() {
        // Initial check (covers hard-refresh while already on care)
        if (document.readyState === 'complete') tryShow();
        else window.addEventListener('load', tryShow, { once: true });

        // React to scene changes — the player tapping CARE from
        // Chronicle fires a pp:scene-change event with detail.scene =
        // 'care' (see scene-state.js). On entry to care, fire tryShow
        // AND start the patient retry poll so we catch the post-intro
        // moment.
        document.addEventListener('pp:scene-change', function (e) {
            var scene = e && e.detail && e.detail.scene;
            if (scene === 'care') {
                tryShow();
                startPoll();
            } else {
                // Leaving care — stop polling
                stopPoll();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    // Public surface — dev tooling + future hooks
    window.PPAlistairCareIntro = {
        show:    mount,
        dismiss: dismiss,
        isSeen:  isSeen,
        reset:   function () { try { localStorage.removeItem(FLAG); } catch (_) {} },
        _flag:   FLAG
    };
})();
