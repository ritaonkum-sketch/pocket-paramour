// ============================================================================
// TODAY HUB — Love-and-Deepspace-style daily lobby panel
// ----------------------------------------------------------------------------
// Pocket Paramour's daily loop existed but wasn't surfaced. The player landed
// on the select screen and had to remember which character needed care, where
// a letter was waiting, what daily reward was claimable, and what story beat
// might be ready. The information was all there — just buried.
//
// This hub puts it in one panel on the select screen. Three rows max:
//   1. Most-urgent character (lowest stats among existing saves)
//   2. Letters waiting (any unread or unreplied letters)
//   3. Daily reward claim status (if available)
//
// Each row is tappable. Tapping #1 selects that character. Tapping #2 opens
// the letters archive. Tapping #3 opens the daily reward modal (or just
// dismisses if already-claimed today).
//
// SAFETY: read-only. The hub doesn't mutate game state. It reads localStorage
// + asks PPLetters / DailyRewards for status. Tap actions delegate to the
// existing systems.
// ============================================================================

(function () {
    'use strict';

    const CHARS = ['alistair','lyra','caspian','lucien','elian','noir','proto'];
    const CHAR_NAMES = {
        alistair: 'Alistair', lyra: 'Lyra', caspian: 'Caspian',
        lucien: 'Lucien', elian: 'Elian', noir: 'Noir', proto: 'Proto'
    };
    // Only show urgency rows for characters the player has actually MET.
    function hasMet(c) {
        try {
            return !!(localStorage.getItem('pp_chapter_done_b_' + c)
                   || localStorage.getItem('pocketLoveSave_' + c));
        } catch (_) { return false; }
    }

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }

    // ── DATA SOURCES ─────────────────────────────────────────────────────

    // Returns { charId, urgencyText } for the character with the lowest min
    // stat across all played saves. If no character is below 60 on anything,
    // returns null (nothing urgent — hub omits this row).
    function mostUrgentCharacter() {
        let worst = null;
        for (const c of CHARS) {
            if (!hasMet(c)) continue;
            const raw = lsGet('pocketLoveSave_' + c);
            if (!raw) continue;
            try {
                const d = JSON.parse(raw);
                const minStat = Math.min(d.hunger || 100, d.clean || 100, d.bond || 100);
                if (minStat >= 60) continue;
                if (!worst || minStat < worst.minStat) {
                    let need;
                    if (d.hunger === minStat) need = 'hungry';
                    else if (d.clean === minStat) need = 'unwashed';
                    else need = 'lonely';
                    worst = { charId: c, minStat, need };
                }
            } catch (_) {}
        }
        if (!worst) return null;
        const verb = worst.need === 'lonely' ? 'wants company'
                   : worst.need === 'hungry' ? 'is hungry'
                   : 'needs a wash';
        return { charId: worst.charId, urgencyText: `${CHAR_NAMES[worst.charId]} ${verb}.` };
    }

    // Returns { count, hasReply } if any unread or unreplied letters exist.
    // Uses LetterSystem.hasAttention() if available.
    function lettersWaiting() {
        try {
            if (!window.LetterSystem || typeof window.LetterSystem.list !== 'function') return null;
            const list = window.LetterSystem.list();
            // Only FIRST letters can be replied to (they carry a `replied` flag).
            // Milestone letters are one-way keepsakes with no reply mechanism, so
            // they must NOT count as "waiting for a reply" (owner: "there are no
            // letters to reply" — 3 one-way Alistair letters were being counted).
            const unreplied = list.filter(l => l.kind === 'first' && !l.replied);
            if (unreplied.length === 0) return null;
            const first = unreplied[0];
            return {
                count: unreplied.length,
                fromChar: first.char ? CHAR_NAMES[first.char] : 'Someone',
                title: first.title || 'A letter'
            };
        } catch (_) { return null; }
    }

    // ── PENDING SCHEDULED INVITATION ─────────────────────────────────────
    // Reads the scheduled-moments.js state. Returns the active invitation if
    // one exists and hasn't been arrived/missed yet. Time-formatted hint
    // depends on how close the window is — anticipation language scales:
    //   • > 30 min away  → "in 2h 14m"
    //   • ≤ 30 min away  → "in 18 minutes — soon"
    //   • inside window  → "WAITING NOW — go to him"  (urgent)
    //   • after window   → null  (miss scene fires on visit anyway)
    function pendingInvitation() {
        try {
            const raw = lsGet('pp_sched_pending');
            if (!raw) return null;
            const p = JSON.parse(raw);
            if (!p || !p.charId || !p.targetTime) return null;
            // Don't surface invitations that have already fired.
            if (p.status === 'firing-arrive' || p.status === 'firing-miss') return null;
            const now = Date.now();
            const ms = p.targetTime - now;
            const windowMs = 30 * 60 * 1000;  // matches scheduled-moments WINDOW_MIN
            // Window already passed without arrival — let the miss scene
            // handle it on the next visit. Don't show in TODAY hub.
            if (ms < -windowMs) return null;
            const charName = CHAR_NAMES[p.charId] || 'Someone';
            let timeText, urgent = false;
            if (ms <= 0 && ms >= -windowMs) {
                timeText = 'Waiting now';
                urgent = true;
            } else if (ms < 30 * 60 * 1000) {
                const mins = Math.max(1, Math.round(ms / 60000));
                timeText = `In ${mins} minute${mins === 1 ? '' : 's'} — soon`;
                urgent = true;
            } else {
                const totalMins = Math.round(ms / 60000);
                const h = Math.floor(totalMins / 60);
                const m = totalMins % 60;
                timeText = h > 0 ? `In ${h}h ${m}m` : `In ${m}m`;
            }
            return { charId: p.charId, charName, timeText, urgent, targetTime: p.targetTime, invId: p.invId };
        } catch (_) { return null; }
    }

    // ── NOTIFICATION OPT-IN ──────────────────────────────────────────────
    // Player can grant browser notification permission so scheduled
    // invitations buzz their phone when the window opens. v1 fires only
    // while the app tab is open (no backend push) — but that's still a
    // real ritual hook for players who keep the PWA installed.
    const NOTIF_FLAG = 'pp_notif_enabled';
    const NOTIF_DENIED_FLAG = 'pp_notif_denied';
    function notifPermission() {
        try { return Notification.permission; } catch (_) { return 'unsupported'; }
    }
    function notifEnabled() {
        return notifPermission() === 'granted' && lsGet(NOTIF_FLAG) === '1';
    }
    function notifShouldOffer() {
        // Offer the opt-in if: API exists, permission is "default" (never asked),
        // player hasn't already declined, AND there's a pending invitation
        // (so the offer feels relevant, not a cold ask).
        if (notifPermission() === 'unsupported') return false;
        if (notifPermission() !== 'default') return false;
        if (lsGet(NOTIF_DENIED_FLAG) === '1') return false;
        if (!pendingInvitation()) return false;
        return true;
    }
    async function notifAskPermission() {
        try {
            const result = await Notification.requestPermission();
            if (result === 'granted') {
                try { localStorage.setItem(NOTIF_FLAG, '1'); } catch (_) {}
                // Schedule any currently-pending invitation immediately
                scheduleNotificationForPending();
                refresh();
            } else {
                try { localStorage.setItem(NOTIF_DENIED_FLAG, '1'); } catch (_) {}
                refresh();
            }
        } catch (_) {}
    }

    // ── NOTIFICATION SCHEDULING ──────────────────────────────────────────
    // For each pending invitation, schedule a setTimeout to fire a browser
    // notification at the target time. The setTimeout only survives while
    // the tab is open — true background push would need a server. For v1
    // this still buzzes the player when the window opens IF they have the
    // app in any open tab. Tracked per-invId so we don't double-schedule.
    const _scheduledTimers = {};  // invId → timeoutId
    function scheduleNotificationForPending() {
        if (!notifEnabled()) return;
        const inv = pendingInvitation();
        if (!inv || !inv.invId) return;
        // Already scheduled this one
        if (_scheduledTimers[inv.invId]) return;
        const ms = inv.targetTime - Date.now();
        if (ms <= 0) return;  // already past — nothing to schedule
        if (ms > 6 * 60 * 60 * 1000) return;  // > 6 hours: timer too long for a tab; skip
        _scheduledTimers[inv.invId] = setTimeout(() => {
            try {
                const reg = navigator.serviceWorker && navigator.serviceWorker.ready;
                const body = `${inv.charName} is waiting for you.`;
                const opts = {
                    body,
                    icon: 'assets/icon-192.png',
                    badge: 'assets/icon-192.png',
                    tag: 'pp-sched-' + inv.invId,
                    silent: false
                };
                if (reg && reg.then) {
                    reg.then(r => r.showNotification(`${inv.charName} is waiting`, opts)).catch(() => {
                        try { new Notification(`${inv.charName} is waiting`, opts); } catch (_) {}
                    });
                } else {
                    new Notification(`${inv.charName} is waiting`, opts);
                }
            } catch (_) {}
            delete _scheduledTimers[inv.invId];
        }, ms);
    }

    // Daily reward status: { available: bool, label: string }
    function dailyRewardStatus() {
        try {
            const claimedKey = 'pp_dr_claimed_' + new Date().toISOString().slice(0,10);
            if (localStorage.getItem(claimedKey) === '1') return null;
            // Streak from existing daily-rewards system if present
            const streakRaw = lsGet('pp_dr_streak');
            const streak = streakRaw ? parseInt(streakRaw, 10) || 0 : 0;
            return {
                available: true,
                label: streak > 0 ? `Day ${streak + 1} reward ready` : "Today's reward ready"
            };
        } catch (_) { return null; }
    }

    // ── UI ───────────────────────────────────────────────────────────────
    // Architecture (rev May 2026, owner feedback): the inline panel covered
    // half the character cards. L&D's pattern is a small icon button with a
    // glow notification, opening the panel on tap. So we now have:
    //   #pp-today-btn      — small floating icon button on select screen,
    //                         glows when rows have content, hidden otherwise
    //   #pp-today-overlay  — backdrop overlay shown when button tapped
    //   #pp-today-hub      — panel inside overlay (the same rows as before)
    // The character grid stays unobstructed.

    function injectStyles() {
        if (document.getElementById('pp-today-styles')) return;
        const s = document.createElement('style');
        s.id = 'pp-today-styles';
        s.textContent = `
            /* Floating button — bottom-left of select screen, stacked above
               the crossover threads chip. Owner-requested position (May 2026)
               so it lives in the same visual zone as the other two chips
               (Main story, threads ready) instead of competing with the
               title in the top-right.
               Always visible while on select screen + any character met.
               Glows softly when there's at least one row of pending content. */
            #pp-today-btn {
                position: fixed; left: 14px; bottom: 116px;
                width: 44px; height: 44px;
                border-radius: 50%;
                background: linear-gradient(180deg, rgba(60,30,80,0.85), rgba(30,16,48,0.95));
                border: 1px solid rgba(200,170,240,0.45);
                color: #f4e6ff;
                font-size: 18px; line-height: 1;
                cursor: pointer; user-select: none;
                display: flex; align-items: center; justify-content: center;
                z-index: 9700;
                box-shadow: 0 4px 14px rgba(0,0,0,0.45);
                opacity: 0; pointer-events: none;
                transform: scale(0.85);
                transition: opacity 380ms ease,
                            transform 380ms cubic-bezier(0.2,0.9,0.3,1.4),
                            box-shadow 380ms ease;
            }
            #pp-today-btn.show {
                opacity: 1; pointer-events: auto; transform: scale(1);
            }
            #pp-today-btn:active { transform: scale(0.94); }
            /* Hide the floating TODAY button when ANY overlay is up
               (own modal, letter, gallery, settings, scenes, etc.).
               Without this, the button leaks ON TOP of overlays it should
               step aside for. The body.pp-overlay-active class is set by
               PPOverlay.show()/hide() in pp-overlay.js. */
            body.pp-overlay-active #pp-today-btn {
                opacity: 0 !important;
                pointer-events: none !important;
            }
            /* Glow pulse — when at least one row of content is pending.
               Soft pink-purple glow. Reads as "something for you here." */
            #pp-today-btn.glow {
                animation: pp-today-btn-glow 2.4s ease-in-out infinite;
                border-color: rgba(240,180,220,0.7);
            }
            @keyframes pp-today-btn-glow {
                0%, 100% { box-shadow: 0 4px 14px rgba(0,0,0,0.45),
                                       0 0 0 0 rgba(240,180,220,0.55); }
                50%      { box-shadow: 0 4px 14px rgba(0,0,0,0.45),
                                       0 0 0 8px rgba(240,180,220,0); }
            }
            /* Tiny notification dot — extra signal when row count > 1.
               Small pink dot at the upper-right of the button. */
            #pp-today-btn .pp-today-dot {
                position: absolute; top: -2px; right: -2px;
                min-width: 16px; height: 16px; padding: 0 4px;
                border-radius: 9px;
                background: linear-gradient(180deg,#f06aaa,#c84a8a);
                color: #fff;
                font-size: 9px; font-weight: 700;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 1px 4px rgba(0,0,0,0.45);
            }
            #pp-today-btn .pp-today-dot.hidden { display: none; }

            /* Modal overlay — shown when button is tapped. */
            #pp-today-overlay {
                position: fixed; inset: 0; z-index: 9650;
                background: rgba(8,4,16,0.78);
                backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
                display: flex; align-items: flex-end; justify-content: center;
                opacity: 0; pointer-events: none;
                transition: opacity 280ms ease;
            }
            #pp-today-overlay.show { opacity: 1; pointer-events: auto; }
            #pp-today-hub {
                width: 100%; max-width: 460px;
                max-height: 86vh; overflow-y: auto;
                scrollbar-width: none; -ms-overflow-style: none; /* owner: no visible scrollbar */
                background: linear-gradient(180deg, #2a1840 0%, #110820 100%);
                border-top-left-radius: 22px; border-top-right-radius: 22px;
                border: 1px solid rgba(200,170,240,0.30);
                padding: 14px 14px 26px;
                color: #f4e6ff;
                font-family: inherit; font-size: 13px;
                box-shadow: 0 -10px 40px rgba(0,0,0,0.65);
                transform: translateY(40px);
                transition: transform 320ms cubic-bezier(0.2,0.9,0.3,1.2);
            }
            #pp-today-hub::-webkit-scrollbar { width: 0; height: 0; display: none; }
            /* Heart Threads wallet line above the embedded economy sections */
            .pp-today-threads-wallet {
                display: flex; align-items: center; gap: 6px;
                margin: 0 4px 8px; font-weight: 700; font-size: 14px; color: #F4E4B8;
            }
            .pp-today-threads-wallet .ico { font-size: 15px; }
            .pp-today-threads-wallet .lbl { font-weight: 600; opacity: 0.85; font-size: 12px; }
            #pp-today-overlay.show #pp-today-hub {
                transform: translateY(0);
            }
            #pp-today-close {
                width: 100%; margin-top: 10px;
                background: rgba(255,255,255,0.06); color: #d8c8f0;
                border: 0; border-radius: 12px; padding: 10px;
                font-size: 13px; cursor: pointer;
                font-family: inherit;
            }
            #pp-today-close:active { background: rgba(255,255,255,0.10); }
            .pp-today-title {
                font-size: 10px; letter-spacing: 1.8px; font-weight: 600;
                color: #c8b8e8; opacity: 0.7;
                margin: 0 0 6px 4px; text-transform: uppercase;
            }
            .pp-today-row {
                display: flex; align-items: center; gap: 10px;
                padding: 8px 10px; margin: 2px 0;
                background: rgba(255,255,255,0.04);
                border-radius: 10px;
                cursor: pointer;
                transition: background 200ms ease, transform 160ms ease;
            }
            .pp-today-row:hover, .pp-today-row:active {
                background: rgba(180,140,220,0.18);
                transform: scale(0.99);
            }
            .pp-today-icon {
                font-size: 16px; line-height: 1;
                flex-shrink: 0;
            }
            .pp-today-text {
                flex: 1; font-size: 13px; line-height: 1.3;
                color: #f4e6ff;
            }
            .pp-today-text .sub {
                font-size: 10px; opacity: 0.55; letter-spacing: 0.6px;
                margin-top: 2px;
            }
            .pp-today-empty {
                padding: 10px; text-align: center;
                color: #c8b8e8; opacity: 0.6;
                font-size: 12px; font-style: italic;
            }
            /* Urgent invitation row — pulls attention with a soft warm glow.
               Used when a scheduled-moment window is open NOW or within
               30 minutes. The pulse is gentle enough not to feel anxious
               but warm enough to read as "they're really there waiting." */
            .pp-today-row.pp-today-urgent {
                background: linear-gradient(180deg, rgba(220,150,200,0.18), rgba(180,110,170,0.10));
                border: 1px solid rgba(240,180,220,0.38);
                animation: pp-today-urgent-pulse 2.4s ease-in-out infinite;
            }
            .pp-today-row.pp-today-urgent .pp-today-text { color: #fff0fa; }
            .pp-today-row.pp-today-urgent .sub {
                color: #f6c4dd; opacity: 0.95; letter-spacing: 0.8px;
            }
            @keyframes pp-today-urgent-pulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(240,180,220,0); }
                50%      { box-shadow: 0 0 0 4px rgba(240,180,220,0.18); }
            }
            /* Notification opt-in offer row — quieter than the rest, reads
               as a soft suggestion rather than a CTA. */
            .pp-today-row.pp-today-notif-offer {
                background: rgba(255,255,255,0.025);
                border: 1px dashed rgba(200,170,240,0.22);
            }
            .pp-today-row.pp-today-notif-offer .pp-today-text {
                color: #d8c8f0; font-style: italic;
            }
            @media (max-width: 380px) {
                #pp-today-hub { bottom: 80px; padding: 8px 10px; }
                .pp-today-row { padding: 6px 8px; }
                .pp-today-text { font-size: 12px; }
            }
        `;
        document.head.appendChild(s);
    }

    // ── Element factories ───────────────────────────────────────────────
    let _btn = null;
    let _overlay = null;
    let _hub = null;
    let _dot = null;

    // Floating ✰ button DELETED Jun 2026 per owner direction.
    // The daily-task hub is now reached via the bottom-nav DAILY tab
    // (see index.html wireBottomNav → window.PPTodayHub.open()).
    // ensureButton() returns null; refresh() guards on null below.
    function ensureButton() {
        return null;
    }

    function ensureOverlay() {
        if (_overlay) return _overlay;
        injectStyles();
        _overlay = document.createElement('div');
        _overlay.id = 'pp-today-overlay';
        _hub = document.createElement('div');
        _hub.id = 'pp-today-hub';
        _overlay.appendChild(_hub);
        document.body.appendChild(_overlay);
        // Tap backdrop to close
        _overlay.addEventListener('click', (e) => {
            if (e.target === _overlay) closeOverlay();
        });
        return _overlay;
    }

    function openOverlay() {
        ensureOverlay();
        renderHubContents();
        requestAnimationFrame(() => _overlay.classList.add('show'));
        // Hook into the global overlay system so all other floating chips
        // (TODAY button, crossover threads chip, Main story chip) hide
        // while this panel is up. CSS rule below targets body class.
        try {
            if (window.PPOverlay && typeof window.PPOverlay.show === 'function') {
                window.PPOverlay.show('today-hub');
            }
        } catch (_) {}
    }
    function closeOverlay() {
        if (!_overlay) return;
        _overlay.classList.remove('show');
        try {
            if (window.PPOverlay && typeof window.PPOverlay.hide === 'function') {
                window.PPOverlay.hide('today-hub');
            }
        } catch (_) {}
    }

    function buildRow(icon, text, sub, onClick) {
        const row = document.createElement('div');
        row.className = 'pp-today-row';
        const i = document.createElement('span');
        i.className = 'pp-today-icon';
        i.textContent = icon;
        const t = document.createElement('div');
        t.className = 'pp-today-text';
        const main = document.createElement('div');
        main.textContent = text;
        t.appendChild(main);
        if (sub) {
            const s = document.createElement('div');
            s.className = 'sub';
            s.textContent = sub;
            t.appendChild(s);
        }
        row.appendChild(i);
        row.appendChild(t);
        if (onClick) row.addEventListener('click', onClick);
        return row;
    }

    // ── Content data: how many rows would render? ────────────────────────
    // Used to (a) decide if the floating button glows and (b) populate the
    // notification dot. Stays in sync with renderHubContents() below.
    function pendingRowCount() {
        let n = 0;
        if (pendingInvitation()) n++;
        if (mostUrgentCharacter()) n++;
        if (lettersWaiting()) n++;
        const reward = dailyRewardStatus();
        if (reward && reward.available) n++;
        // notif-offer row also counts toward "something to do"
        if (notifShouldOffer()) n++;
        return n;
    }

    // ── Lightweight refresh: just the floating button ────────────────────
    // Runs every 4s on poll. Decides:
    //   - is the button visible at all (only on select screen + char met)?
    //   - is the glow on (any pending row)?
    //   - what's the dot count?
    // Actual row rendering happens lazily in renderHubContents() when the
    // overlay opens — no point computing rows that aren't displayed.
    function refresh() {
        // Floating button is deleted (Jun 2026). Skip all button-state
        // updates. Only re-render the overlay contents if it's open
        // (so DAILY-tab-opened panels still update live with timers).
        if (_overlay && _overlay.classList.contains('show')) {
            renderHubContents();
        }
    }

    // ── Heavy render: build all the rows inside the overlay panel ────────
    function renderHubContents() {
        ensureOverlay();
        // Preserve scroll across the 4s live re-render (the panel scrolls now
        // that the Heart Threads economy is embedded below).
        var _savedScroll = _hub.scrollTop || 0;
        // Build content
        _hub.innerHTML = '';
        const title = document.createElement('div');
        title.className = 'pp-today-title';
        title.textContent = 'Today';
        _hub.appendChild(title);

        let rowCount = 0;
        const hub = _hub;

        // Row 0 (top): pending scheduled invitation — anticipation hook
        const invitation = pendingInvitation();
        if (invitation) {
            const row = buildRow(
                invitation.urgent ? '⏳' : '🌙',
                `${invitation.charName} is waiting for you`,
                invitation.timeText,
                () => {
                    closeOverlay();
                    const card = document.querySelector(`[data-character="${invitation.charId}"]`);
                    if (card) card.click();
                }
            );
            // Subtle highlight when the window is open NOW or imminent
            if (invitation.urgent) row.classList.add('pp-today-urgent');
            hub.appendChild(row);
            rowCount++;
            // Schedule the browser notification if opted-in
            scheduleNotificationForPending();
        }

        // Row 1: most-urgent character
        const urgent = mostUrgentCharacter();
        if (urgent) {
            hub.appendChild(buildRow(
                '❤️',
                urgent.urgencyText,
                'Tap to visit',
                () => {
                    closeOverlay();
                    // Navigate to that character's care screen
                    const card = document.querySelector(`[data-character="${urgent.charId}"]`);
                    if (card) card.click();
                }
            ));
            rowCount++;
        }

        // Row 2: letters waiting
        const letters = lettersWaiting();
        if (letters) {
            hub.appendChild(buildRow(
                '✉️',
                letters.count > 1
                    ? `${letters.count} letters waiting for a reply`
                    : `A letter from ${letters.fromChar}`,
                letters.count === 1 ? letters.title : 'Tap to read',
                () => {
                    closeOverlay();
                    // Go straight to the letters archive via its own API (reliable
                    // from any screen); fall back to the floating button if needed.
                    try {
                        if (window.PPLettersArchive && typeof window.PPLettersArchive.open === 'function') {
                            window.PPLettersArchive.open();
                        } else {
                            const btn = document.getElementById('pp-letters-btn');
                            if (btn) btn.click();
                        }
                    } catch (_) {}
                }
            ));
            rowCount++;
        }

        // (Removed) "Today's reward ready" shortcut row — it pointed at the old
        // DailyRewards module and was redundant + confusing now that the actual
        // claimable rewards (check-in, daily/weekly tasks, chapter, event) live
        // in the Heart Threads economy sections embedded right below. Owner:
        // "today's reward can be removed — it serves no purpose."

        // Row 4 (last): notification opt-in offer — only when relevant.
        // Shown only if a pending invitation exists AND the player hasn't
        // been asked yet AND hasn't declined. Once granted, the row never
        // appears again. The relevance gate (pending invitation) makes the
        // ask feel earned, not nagging.
        if (notifShouldOffer()) {
            const row = buildRow(
                '🔔',
                'Let them reach for you',
                'Allow a quiet alert when the moment comes',
                () => { notifAskPermission(); }
            );
            row.classList.add('pp-today-notif-offer');
            hub.appendChild(row);
            rowCount++;
        }

        // Quiet empty-state for the SHORTCUT rows — only when there's also no
        // Heart Threads economy to show below (otherwise the page is full).
        if (rowCount === 0 && !(window.PPCurrency && window.PPCurrency.renderInto)) {
            const empty = document.createElement('div');
            empty.className = 'pp-today-row';
            empty.style.justifyContent = 'center';
            empty.style.opacity = '0.7';
            empty.innerHTML = '<div class="pp-today-text" style="text-align:center;font-style:italic;">All caught up. Spend time with someone.</div>';
            hub.appendChild(empty);
        }

        // ── Bonds & Rewards — the Heart Threads economy lives here so the Daily
        // tab is the single home for daily tasks; claiming them earns 🧵. The
        // economy module renders its own check-in / daily / weekly sections. ──
        try {
            if (window.PPCurrency && typeof window.PPCurrency.renderInto === 'function') {
                const thTitle = document.createElement('div');
                thTitle.className = 'pp-today-title';
                thTitle.style.marginTop = '14px';
                thTitle.textContent = 'Bonds & Rewards';
                hub.appendChild(thTitle);
                const wallet = document.createElement('div');
                wallet.className = 'pp-today-threads-wallet';
                wallet.innerHTML = '<span class="ico">' + (window.PPCurrency.icon || '🧵') + '</span> <b class="ht-wallet-amt">' + window.PPCurrency.get() + '</b> <span class="lbl">' + (window.PPCurrency.name || 'Heart Threads') + '</span>';
                hub.appendChild(wallet);
                const threads = document.createElement('div');
                threads.className = 'pp-today-threads';
                hub.appendChild(threads);
                window.PPCurrency.renderInto(threads);
            }
        } catch (_) {}

        // Close button — always present, anchors the panel
        const close = document.createElement('button');
        close.id = 'pp-today-close';
        close.textContent = 'Close';
        close.addEventListener('click', closeOverlay);
        hub.appendChild(close);

        // restore scroll (refresh() rebuilds this panel every 4s while open)
        try { _hub.scrollTop = _savedScroll; } catch (_) {}
    }

    function boot() {
        ensureButton();
        // Refresh every 4s while visible (cheap; only reads localStorage)
        setInterval(refresh, 4000);
        // Initial settle
        setTimeout(refresh, 1500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    window.PPTodayHub = {
        refresh: refresh,
        open: openOverlay,
        close: closeOverlay,
        pendingRowCount: pendingRowCount,
        // Introspection helpers
        pendingInvitation: pendingInvitation,
        notifEnabled: notifEnabled,
        notifPermission: notifPermission,
        askNotifPermission: notifAskPermission,
        scheduleNotificationForPending: scheduleNotificationForPending
    };
})();
