// ============================================================================
// CH6 UNLOCK CELEBRATION (Jun 2026)
// ----------------------------------------------------------------------------
// Fires ONCE when the player completes both Ch6 gate milestones (Bond Level 3
// + balanced care). Without this, the player would never know Chapter 6 just
// opened — the chip would silently flip both checks and they'd have to
// notice on their own. This celebrates the moment.
//
// THE THREE BEATS
//   1. Soft chime + brand-aligned modal: "The smoke at the treeline waits."
//   2. CTA buttons: Read now / Later
//   3. The care-target chip transforms to a "READY" state (handled in
//      care-target-chip.js by reading state.opened); tapping it opens
//      chapters directly.
//
// One-shot via pp_alistair_ch6_unlock_celebrated. After dismissal, the
// player can re-enter Chapter 6 any time from the chapter list — the
// celebration only fires the once.
// ============================================================================
(function () {
    'use strict';

    // Aug 2026 — GENERALIZED from Ch6-only to the whole care-route ladder.
    // The rich "a door opens" celebration now fires for EVERY handoff
    // (Alistair→Elian→…→Noir→Proto) the moment that rung is truly ready:
    // the previous character's care target AND the linear story gate both
    // met (PPRouteGates.careLadderProgress(prev).ready). One-shot per
    // handoff via pp_ladder_celebrated_<nextChar>.
    var BACKDROP   = 'pp-ch6-unlock-backdrop';
    var STYLES_ID  = 'pp-ch6-unlock-styles';
    var LEGACY_ELIAN_FLAG = 'pp_alistair_ch6_unlock_celebrated';

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* swallow */ } }

    function activeChar() {
        var g = window._game;
        return (g && (g.characterId || g.selectedCharacter)) || lsGet('pp_cc_active_companion') || null;
    }
    function isCelebrated(nextChar) {
        if (!nextChar) return false;
        if (lsGet('pp_ladder_celebrated_' + nextChar) === '1') return true;
        // Migration: honour the old Alistair→Elian one-shot key.
        if (nextChar === 'elian' && lsGet(LEGACY_ELIAN_FLAG) === '1') return true;
        return false;
    }
    function markCelebrated(nextChar) {
        lsSet('pp_ladder_celebrated_' + nextChar, '1');
        if (nextChar === 'elian') lsSet(LEGACY_ELIAN_FLAG, '1');
    }

    // Progress for the character currently being cared for → the next rung.
    // null = end of chain (proto) or route-gates not loaded yet.
    // Every ladder rung's PREVIOUS character (each one's care target + gateway
    // chapter unlocks the NEXT route). Order matters: we announce the earliest
    // pending rung first.
    var LADDER_PREVS = ['alistair', 'elian', 'lyra', 'caspian', 'lucien', 'noir'];

    // When the current celebration became visible. A backdrop-tap arriving
    // within MIN_VISIBLE_MS of showing is ignored (don't latch "seen" from a
    // stray tap during a screen transition flash) — this is how the Caspian
    // latch got set without the player ever seeing the popup.
    var _shownAt = 0;
    var MIN_VISIBLE_MS = 900;

    function progFor(prev) {
        var rg = window.PPRouteGates;
        if (!rg || typeof rg.careLadderProgress !== 'function') return null;
        try { return rg.careLadderProgress(prev); } catch (_) { return null; }
    }

    // The chapter that opens by CARING for the newly-unlocked character — their
    // first care-gated chapter right after their intro. Elian → Ch7, Caspian →
    // Ch15. null when the next chapter isn't gated on that character (Lyra /
    // Lucien / Noir / the care-only Proto rung), so the popup omits the line.
    function careUnlocksChapter(charId, gatewayCh) {
        try {
            var gates = window.PPRouteGates && window.PPRouteGates._gates;
            if (!gates || !gatewayCh || !charId) return null;
            var nxt = gatewayCh + 1;
            return (gates[nxt] && gates[nxt].charId === charId) ? nxt : null;
        } catch (_) { return null; }
    }

    // The handoff to announce. CRITICAL FIX (Jun 2026): a route opens from the
    // PREVIOUS character's progress — their care target PLUS reading the gateway
    // chapter in the Main Story — which is INDEPENDENT of who you're actively
    // caring for. The old version only checked careLadderProgress(activeChar()),
    // so a route that opened by reading a Main Story chapter while caring for
    // someone else was NEVER announced: Caspian opened via Lyra's read-through
    // of Ch13 while Alistair was the active companion, so the "Caspian's route
    // is open" popup never fired. Now we scan EVERY rung and return the first
    // that is genuinely ready and not yet celebrated, so Caspian / Lucien / Noir
    // each get their announcement the moment their gateway chapter opens,
    // regardless of the active companion. The active companion's own rung is
    // checked first so it still lands on their care screen when that's the cue.
    function currentProg() {
        var active = activeChar();
        var order = LADDER_PREVS.slice();
        var ai = order.indexOf(active);
        if (ai > 0) { order.splice(ai, 1); order.unshift(active); }
        for (var i = 0; i < order.length; i++) {
            var prog = progFor(order[i]);
            if (prog && prog.ready && prog.nextChar && !isCelebrated(prog.nextChar)) return prog;
        }
        return null;
    }

    function isMounted() { return !!document.getElementById(BACKDROP); }

    // ── Eligibility ────────────────────────────────────────────────
    function shouldFire() {
        if (isMounted()) return false;
        var prog = currentProg();
        if (!prog) return false;                        // end of chain / not loaded
        // ready = the NEXT rung is truly unlockable: care target AND the
        // linear story gate (read through the gateway chapter). This is the
        // stacked-gates model — celebrating only when the chapter/route is
        // ACTUALLY available, so the CTA never points at a locked page.
        if (!prog.ready) return false;
        if (isCelebrated(prog.nextChar)) return false;  // one-shot per handoff
        // WHERE the moment may land. Originally care ONLY — which is exactly
        // why a route unlocked by finishing a Main Story chapter went
        // un-announced there and only popped LATER on the care screen.
        //
        // CRITICAL FIX (Jun 2026): the Main Story chapter list (#chp-page) is
        // where the player finishes the gateway chapter (e.g. Ch5) and expects
        // "<Next>'s route is open" — but chp-page OVERLAYS whatever screen is
        // underneath, so the body class there is NOT reliably pp-screen-select.
        // Owner playtest: finished Ch5 on the Main Story page (body was actually
        // pp-screen-title under the chapter list), Ch6 opened, and NO popup
        // fired because the old check required pp-screen-care/select. So gate on
        // the chapter list being PRESENT (#chp-page), not the screen behind it.
        // The shared one-shot latch (pp_ladder_celebrated_<char>) still fires it
        // exactly ONCE wherever the player first sees it.
        //
        // TITLE-SCREEN LEAK (Aug 2026 playtest): this used to accept the bare
        // EXISTENCE of #chp-page. That element stays in the DOM (empty/hidden)
        // once the chapter list has been opened even once, so after finishing
        // Ch1 and relaunching, "A door has opened" mounted on top of the TITLE
        // screen, covering START — and its button could only dismiss, never
        // navigate. Require the chapter list to be genuinely VISIBLE.
        var _chp = document.getElementById('chp-page');
        var _chpOpen = !!(_chp && _chp.children.length &&
                          _chp.offsetWidth > 0 && _chp.offsetHeight > 0 &&
                          getComputedStyle(_chp).visibility !== 'hidden');
        var onCalm = document.body.classList.contains('pp-screen-care') ||
                     document.body.classList.contains('pp-screen-select') ||
                     _chpOpen;
        if (!onCalm) return false;
        // Hard stop: never announce over the title screen. The chapter list can
        // legitimately render while body is pp-screen-title (it overlays it),
        // which is why the visible-list test above is the discriminator.
        if (!_chpOpen && document.body.classList.contains('pp-screen-title')) return false;
        // Never pop DURING a chapter read — body.pp-chapter-active flags an
        // in-progress chapter (set in chapters.js); it clears the moment the
        // chapter ends, which is exactly when we want to announce. Then defer
        // over any active scene card / cinematic / other modal. (The calm
        // chapter LIST is now an allowed surface, so #chp-page is not a blocker.)
        if (document.body.classList.contains('pp-chapter-active')) return false;
        // Canonical overlay authority (pp-overlay.js) + this module's
        // celebration backdrops; hand list is only the fallback.
        //
        // MUST exclude '#chp-page:not(:empty)' from the union: the chapter
        // LIST is this module's allowed surface (see onCalm above), but it is
        // also a registered overlay — plain busy() is therefore ALWAYS true
        // there, which silently re-broke the "announce on the Main Story
        // page" fix (caught in playtest, Jul 2026: Ch6 unlocked after Ch5,
        // ready=true, uncelebrated, yet shouldFire=false on the open list).
        if (window.PPOverlay && typeof window.PPOverlay.busyExcluding === 'function') {
            return !window.PPOverlay.busyExcluding('#chp-page:not(:empty)',
                '#pp-aci-backdrop, #pp-first-care-modal-backdrop, #pp-ms-gate-backdrop, #pp-soul-frag-overlay');
        }
        if (window.PPOverlay && typeof window.PPOverlay.busy === 'function') {
            return !window.PPOverlay.busy(
                '#pp-aci-backdrop, #pp-first-care-modal-backdrop, #pp-ms-gate-backdrop, #pp-soul-frag-overlay');
        }
        if (document.querySelector(
            '#mscard-root:not(:empty),' +
            '#intro-overlay.visible, #cinematic-overlay.visible,' +
            '#tp-root:not(:empty), #ms-encounter-root:not(:empty),' +
            '#story-overlay:not(.hidden), #event-overlay:not(.hidden),' +
            '#date-overlay:not(.hidden), #gift-panel:not(.hidden),' +
            '#training-panel:not(.hidden), #pp-aci-backdrop,' +
            '#pp-first-care-modal-backdrop, #pp-ms-gate-backdrop,' +
            '#pp-soul-frag-overlay'
        )) return false;
        return true;
    }

    // ── Styles ──────────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById(STYLES_ID)) return;
        var s = document.createElement('style');
        s.id = STYLES_ID;
        s.textContent = `
            #${BACKDROP} {
                position: fixed; inset: 0;
                z-index: 14400;
                background: radial-gradient(ellipse at center,
                    rgba(11, 4, 16, 0.86) 0%,
                    rgba(11, 4, 16, 0.97) 80%);
                display: flex; align-items: center; justify-content: center;
                padding: 22px;
                opacity: 0;
                transition: opacity 380ms cubic-bezier(0.22, 1, 0.36, 1);
                overflow: hidden;
            }
            #${BACKDROP}.show { opacity: 1; }

            .pp-ch6-card {
                position: relative;
                width: 100%; max-width: 360px;
                background: linear-gradient(180deg,
                    rgba(43, 17, 51, 0.97) 0%,
                    rgba(21, 8, 26, 0.97) 100%);
                border: 1px solid rgba(212, 168, 91, 0.55);
                border-radius: 18px;
                padding: 28px 24px 18px;
                box-shadow:
                    inset 0 1px 0 rgba(212, 168, 91, 0.28),
                    0 28px 64px -18px rgba(0, 0, 0, 0.88),
                    0 0 84px rgba(232, 168, 91, 0.42);
                transform: translateY(16px) scale(0.92);
                transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
                text-align: center;
                overflow: visible;
            }
            #${BACKDROP}.show .pp-ch6-card {
                transform: translateY(0) scale(1);
            }
            .pp-ch6-card::before {
                content: '';
                position: absolute;
                top: 0; left: 50%; transform: translateX(-50%);
                width: 70%; height: 1px;
                background: linear-gradient(90deg,
                    transparent, rgba(232, 168, 91, 0.75), transparent);
            }

            /* Floating particles around the card */
            .pp-ch6-particle {
                position: absolute;
                width: 4px; height: 4px;
                border-radius: 50%;
                background: radial-gradient(circle, #F2D690 0%, transparent 70%);
                pointer-events: none;
                opacity: 0;
                animation: pp-ch6-float 3.6s ease-in-out infinite;
                box-shadow: 0 0 8px rgba(232, 168, 91, 0.85);
            }
            @keyframes pp-ch6-float {
                0% { opacity: 0; transform: translate(var(--x0), var(--y0)) scale(0.6); }
                30%, 70% { opacity: 0.85; }
                100% { opacity: 0; transform: translate(var(--x1), var(--y1)) scale(1.1); }
            }

            .pp-ch6-eyebrow {
                font-family: Quicksand, Inter, sans-serif;
                font-size: 10px; letter-spacing: 0.26em; font-weight: 600;
                color: rgba(232, 168, 91, 0.92);
                text-transform: uppercase;
                margin: 0 0 8px;
            }
            .pp-ch6-title {
                font-family: 'Cormorant Garamond', serif;
                font-style: italic;
                font-size: 24px; font-weight: 500;
                color: rgba(244, 235, 220, 0.98);
                line-height: 1.18;
                margin: 0 0 12px;
                text-shadow: 0 0 18px rgba(232, 168, 91, 0.32);
            }
            .pp-ch6-body {
                font-family: 'Cormorant Garamond', serif;
                font-style: italic;
                font-size: 14px; line-height: 1.55;
                color: rgba(232, 200, 220, 0.88);
                margin: 0 0 18px;
            }

            /* Chapter callout — the prize they earned */
            .pp-ch6-chapter-card {
                position: relative;
                background: linear-gradient(180deg,
                    rgba(60, 30, 80, 0.65),
                    rgba(36, 18, 52, 0.85));
                border: 1px solid rgba(212, 168, 91, 0.55);
                border-radius: 12px;
                padding: 14px 18px;
                margin: 0 0 16px;
                box-shadow: 0 0 24px rgba(232, 76, 140, 0.22) inset;
            }
            .pp-ch6-chapter-card::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 12px;
                background: linear-gradient(135deg,
                    rgba(232, 168, 91, 0.12) 0%,
                    transparent 60%);
                pointer-events: none;
            }
            .pp-ch6-chapter-num {
                font-family: Quicksand, Inter, sans-serif;
                font-size: 9px; letter-spacing: 0.22em; font-weight: 600;
                color: rgba(232, 168, 91, 0.85);
                text-transform: uppercase;
                margin: 0 0 4px;
            }
            .pp-ch6-chapter-title {
                font-family: 'Cormorant Garamond', serif;
                font-style: italic;
                font-size: 17px;
                color: rgba(244, 235, 220, 0.96);
                margin: 0 0 4px;
            }
            .pp-ch6-chapter-char {
                font-family: 'Cormorant Garamond', serif;
                font-style: italic;
                font-size: 12px;
                color: rgba(212, 168, 91, 0.78);
            }

            .pp-ch6-buttons {
                display: flex; gap: 10px; justify-content: center;
            }
            .pp-ch6-btn {
                font-family: 'Cormorant Garamond', serif;
                font-style: italic;
                font-size: 14px; letter-spacing: 0.04em;
                padding: 11px 24px;
                border-radius: 11px;
                cursor: pointer;
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
                min-height: 44px; min-width: 96px;
                border: 1px solid rgba(212, 168, 91, 0.45);
                color: rgba(244, 235, 220, 0.96);
                transition: transform 140ms ease, background 220ms ease;
            }
            .pp-ch6-btn.secondary {
                background: linear-gradient(180deg,
                    rgba(60, 40, 20, 0.45),
                    rgba(40, 28, 14, 0.6));
            }
            .pp-ch6-btn.primary {
                background: linear-gradient(180deg,
                    rgba(232, 76, 140, 0.88) 0%,
                    rgba(122, 18, 36, 0.96) 100%);
                border-color: rgba(232, 168, 91, 0.7);
                box-shadow: 0 8px 22px -6px rgba(232, 76, 140, 0.7);
            }
            .pp-ch6-btn:active { transform: scale(0.96); }
        `;
        document.head.appendChild(s);
    }

    // ── Particle spawn — drifts 12 specks of rose-gold ──────────────
    function spawnParticles(card) {
        for (var i = 0; i < 12; i++) {
            var p = document.createElement('span');
            p.className = 'pp-ch6-particle';
            // Random origin around card centre, drift outward
            var ox = -10 + Math.random() * 20;
            var oy = -10 + Math.random() * 20;
            var dx = -80 + Math.random() * 160;
            var dy = -120 + Math.random() * 60;
            p.style.left = '50%';
            p.style.top  = '40%';
            p.style.setProperty('--x0', ox + 'px');
            p.style.setProperty('--y0', oy + 'px');
            p.style.setProperty('--x1', dx + 'px');
            p.style.setProperty('--y1', dy + 'px');
            p.style.animationDelay = (Math.random() * 1.4) + 's';
            card.appendChild(p);
        }
    }

    // ── Audio cue ───────────────────────────────────────────────────
    function playChime() {
        try {
            // Prefer fanfare (the existing achievement sound); fall back
            // to chime if not available; both ship via the sounds module.
            if (window.sounds) {
                if (typeof window.sounds.fanfare === 'function') {
                    window.sounds.fanfare();
                    return;
                }
                if (typeof window.sounds.chime === 'function') {
                    window.sounds.chime();
                }
            }
        } catch (_) { /* sound is optional */ }
    }

    // ── Mount + dismiss ────────────────────────────────────────────
    function mount() {
        if (isMounted()) return;
        var prog = currentProg();
        if (!prog) return;
        injectStyles();

        var nextName = prog.nextName || 'A new soul';
        var nextRole = prog.nextRole || '';
        var gateway  = prog.gatewayChapter;
        var nextChar = prog.nextChar;

        // A gateway chapter → "Read now" (opens the chapter list). No gateway
        // (the care-only rung, e.g. → Proto) → "Care for <Name>" (switches
        // the active companion). Content is built from careLadderProgress so
        // every handoff gets the same rich treatment.
        // Owner redesign (Jul 2026): the unlock is a new CARE ROUTE, so the
        // popup invites the player to go MEET them now, or stay with the story.
        // The callout names who just opened (their role sells the "go see them"
        // choice); the buttons carry the two paths.
        var chapterCardHtml =
            '<div class="pp-ch6-chapter-card">' +
            '<div class="pp-ch6-chapter-num">Care route now open</div>' +
            '<div class="pp-ch6-chapter-title">' + nextName + '</div>' +
            (nextRole ? '<div class="pp-ch6-chapter-char">' + nextRole + '</div>' : '') +
            '</div>';
        // Owner (Jul 2026): single call-to-action — go CARE for the newly opened
        // companion (the "stay with the story" choice was removed; a backdrop tap
        // still dismisses). Where the very next chapter is gated by caring for
        // them (Elian → Ch7, Caspian → Ch15), say so — it teaches the care→story
        // loop. (Other rungs whose next chapter isn't care-gated omit the line.)
        var unlockCh = careUnlocksChapter(nextChar, gateway);
        var bodyText;
        if (unlockCh) {
            bodyText = 'The bond you wove has held, and ' + nextName + '’s door is open to you now. Care for ' + nextName + ' to deepen your bond and unlock Chapter ' + unlockCh + '.';
        } else if (gateway) {
            bodyText = 'The bond you wove has held, and ' + nextName + '’s door is open to you now. Go to ' + nextName + ' and begin.';
        } else {
            bodyText = 'The bond you wove has held, and ' + nextName + '’s door is open to you now. Go to ' + nextName + ' whenever you are ready.';
        }
        var primaryLabel = 'Care for ' + nextName;

        var bd = document.createElement('div');
        bd.id = BACKDROP;
        bd.setAttribute('role', 'dialog');
        bd.setAttribute('aria-modal', 'true');
        bd.setAttribute('aria-label', nextName + ' unlocked');
        bd.innerHTML =
            '<div class="pp-ch6-card">' +
            '<div class="pp-ch6-eyebrow">A door opens</div>' +
            '<h2 class="pp-ch6-title">' + nextName + ' draws near.</h2>' +
            '<p class="pp-ch6-body">' + bodyText + '</p>' +
            chapterCardHtml +
            '<div class="pp-ch6-buttons">' +
            '<button type="button" class="pp-ch6-btn primary pp-ch6-now">' + primaryLabel + '</button>' +
            '</div>' +
            '</div>';
        document.body.appendChild(bd);

        var card = bd.querySelector('.pp-ch6-card');
        spawnParticles(card);

        // Latch ONLY when the player actually engages (Jun 2026 fix). Latching
        // at mount-time meant that if the modal flashed during a screen
        // transition — or got tapped through without registering — it marked
        // itself "seen" and never appeared again, so the player got NO "route
        // is open" popup at all (exactly what happened with Lyra). Now the latch
        // is set on interaction (a button OR a tap outside the card), so the
        // celebration keeps re-appearing on a calm screen until it is truly seen.
        // MIN_VISIBLE_MS guard on the BUTTONS too (not just the backdrop). The
        // celebration fires on the calm chapter-list screen, exactly where the
        // player is tapping "Begin" to read the next chapter — so a tap meant
        // for the chapter landed on "Read now"/"Later" and latched the popup
        // "seen" + dismissed it in the same gesture, before the player ever
        // registered it. (That's how Lucien's AND Noir's latched unseen.)
        // Ignore taps until the popup has been visible long enough to read.
        bd.querySelector('.pp-ch6-now').addEventListener('click', function () {
            if ((Date.now() - _shownAt) < MIN_VISIBLE_MS) return;
            markCelebrated(nextChar);
            goToCare(nextChar);   // straight into the new companion's care (owner choice, Jul 2026)
        });
        bd.addEventListener('click', function (e) {
            // Ignore stray taps in the first moment after showing — a tap that
            // arrives during a screen-transition flash must NOT silently latch
            // this as "seen" (that's how Caspian's latch got set without the
            // player ever seeing the popup). Require a real look first.
            if (e.target === bd && (Date.now() - _shownAt) > MIN_VISIBLE_MS) {
                markCelebrated(nextChar); dismiss();
            }
        });

        playChime();
        void bd.offsetHeight; // force reflow
        bd.classList.add('show');
        _shownAt = Date.now();
    }

    // Owner redesign (Jul 2026): the primary CTA takes the player STRAIGHT into
    // the newly opened companion's care screen, from wherever the popup fired.
    //   - on another companion's care screen → _switchToSelect (clean care exit)
    //   - on the Main Story list / Chronicle   → close the list, show the hub
    // Then make the new character active and route in via the SAME path the
    // Chronicle CARE button uses (a tagged click on their thread card), retrying
    // briefly while the hub settles. If routing can't complete it degrades
    // gracefully to the Chronicle with the new character active — still one tap
    // from their care, never a dead end.
    function goToCare(nextChar) {
        dismiss();
        setTimeout(function () {
            try {
                if (document.body.classList.contains('pp-screen-care') &&
                    window._game && typeof window._game._switchToSelect === 'function') {
                    try { window._game._switchToSelect(); } catch (_) {}
                } else {
                    if (document.getElementById('chp-page') && window.MSChapters &&
                        typeof window.MSChapters.close === 'function') {
                        try { window.MSChapters.close(); } catch (_) {}
                    }
                    var sel = document.getElementById('select-screen');
                    if (sel && sel.classList.contains('hidden')) {
                        sel.classList.remove('hidden');
                        sel.style.opacity = ''; sel.style.visibility = '';
                    }
                    if (typeof window._refreshUnlockedCards === 'function') {
                        try { window._refreshUnlockedCards(); } catch (_) {}
                    }
                }
                if (typeof window.setActive === 'function') {
                    try { window.setActive(nextChar); } catch (_) {}
                }
                _enterCareWhenReady(nextChar, 0);
            } catch (_) {}
        }, 420);
    }

    // Poll for the Chronicle's thread card, then route into care exactly the way
    // the CARE button does (bypass flag + click). Gives up after ~3.6s, leaving
    // the player on the hub with the new character active.
    function _enterCareWhenReady(nextChar, tries) {
        try {
            var sel  = document.getElementById('select-screen');
            var seen = sel && !sel.classList.contains('hidden');
            var card = document.querySelector('.cc-thread-card[data-character="' + nextChar + '"]');
            var locked = card && (card.classList.contains('cc-thread-locked') ||
                                  card.classList.contains('ms-locked') ||
                                  card.classList.contains('select-card-locked'));
            if (seen && card && !locked) {
                card.__ccCareBypass = true;
                card.click();
                return;
            }
        } catch (_) {}
        if (tries < 24) setTimeout(function () { _enterCareWhenReady(nextChar, tries + 1); }, 150);
    }

    function dismiss() {
        var bd = document.getElementById(BACKDROP);
        if (!bd) return;
        bd.classList.remove('show');
        setTimeout(function () { if (bd.parentNode) bd.parentNode.removeChild(bd); }, 380);
    }

    // ── Boot + poll ────────────────────────────────────────────────
    // The poll runs for the whole session — each handoff latches
    // independently, so we never stop globally. shouldFire() returns false
    // once the current rung's celebration is seen and turns true again at
    // the next rung.
    var _pollTimer = null;
    function startPoll() {
        if (_pollTimer) return;
        _pollTimer = setInterval(function () {
            if (shouldFire()) mount();
        }, 2000);
    }
    function stopPoll() {
        if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
    }

    function tryFireSoon(delay) {
        setTimeout(function () { if (shouldFire()) mount(); }, delay);
    }

    // Self-heal STALE celebration latches (Jun 2026). A
    // pp_ladder_celebrated_<char> latch is only valid while that character's
    // care route is actually open. If the latch is set but the route is NOT
    // open, the latch is stale — the most common cause is a ladder GATEWAY
    // being moved to a LATER chapter (e.g. Caspian's intro Ch11 → Ch14),
    // which re-locks a route whose celebration had already fired under the
    // old gateway. A stale latch does double damage: it hides the
    // care-target progress chip (handoffCelebrated() → chip retires) AND it
    // suppresses the real celebration when the route legitimately re-opens
    // (shouldFire() → isCelebrated() short-circuits). Clearing it on boot
    // re-arms both. Safe because careRouteOpen only flips false→true once in
    // normal play (its milestones are sticky); the only way it's true→false
    // is a config change like the one above, where re-announcing is correct.
    function healStaleLatches() {
        var rg = window.PPRouteGates;
        if (!rg || typeof rg.careRouteOpen !== 'function') return;
        ['elian', 'lyra', 'caspian', 'lucien', 'noir', 'proto'].forEach(function (c) {
            try {
                if (lsGet('pp_ladder_celebrated_' + c) === '1' && !rg.careRouteOpen(c)) {
                    localStorage.removeItem('pp_ladder_celebrated_' + c);
                    if (c === 'elian') localStorage.removeItem(LEGACY_ELIAN_FLAG);
                }
            } catch (_) {}
        });
    }

    function boot() {
        healStaleLatches();
        // Initial check (covers hard-refresh while already on care)
        if (document.readyState === 'complete') tryFireSoon(800);
        else window.addEventListener('load', function () { tryFireSoon(800); }, { once: true });

        startPoll();

        // React to scene changes — the player landing on care is our cue
        // to re-check. setTimeout so the chip + care visuals settle first.
        document.addEventListener('pp:scene-change', function (e) {
            var scene = e && e.detail && e.detail.scene;
            // Re-check on landing on care OR the Main Story area (select) — the
            // latter so a route unlocked by finishing a chapter is announced
            // right there, promptly, not only later on care. (Owner, Jun 2026.)
            if (scene === 'care' || scene === 'select') tryFireSoon(1500);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    // Public surface for dev tooling
    window.PPCh6Unlock = {
        show:         mount,
        tryShow:      function () { try { if (shouldFire()) mount(); } catch (_) {} },
        shouldFire:   shouldFire,     // exposed for verification/debug
        dismiss:      dismiss,
        isCelebrated: isCelebrated,   // (nextChar) → bool
        reset:        function (nextChar) {
            try {
                if (nextChar) { localStorage.removeItem('pp_ladder_celebrated_' + nextChar); return; }
                ['elian', 'lyra', 'caspian', 'lucien', 'noir', 'proto'].forEach(function (c) {
                    localStorage.removeItem('pp_ladder_celebrated_' + c);
                });
                localStorage.removeItem(LEGACY_ELIAN_FLAG);
            } catch (_) {}
        }
    };
})();
