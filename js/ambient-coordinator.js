/* ==========================================================================
   AMBIENT COORDINATOR — single source of truth for head-area text overlap
   --------------------------------------------------------------------------
   WHY THIS EXISTS
   Pocket Paramour has several ambient text systems that can appear near the
   character's head:
       #cc-bubble         — cross-char jealousy reaction
       #noir-whisper      — Noir's post-meet aside
       #ew-whisper        — unattributed early (pre-Noir-met) atmosphere
       #adaptive-thought  — Thompson-sampled character thought

   Each module tries to suppress itself when something else is showing, but
   race conditions produce visible stacking or flicker. This coordinator fixes
   that at the DOM level — a single MutationObserver that enforces:

       - Only ONE head-area bubble visible at a time.
       - Priority order: cc-bubble  >  noir-whisper  >  ew-whisper  >  adaptive-thought
       - A higher-priority arrival dismisses a lower-priority incumbent.
       - A lower-priority arrival is suppressed while a higher incumbent shows.

   Additive — no edits to any existing module. Suppressed elements are
   removed from the DOM immediately; the originating module's timers still
   run, but its rendering is void this round. Modules that re-attempt on a
   poll (whispers, adaptive-thoughts) naturally retry later.

   Also exposes window.PPAmbient for future modules to cooperate with the
   lock proactively: PPAmbient.busy(), PPAmbient.top(), PPAmbient.clear(id).
   ========================================================================== */

(function () {
    'use strict';

    // Priority descending — index 0 is highest priority.
    // Each entry: { id: DOM id, name: short label for logs }
    const BUBBLES = [
        { id: 'cc-bubble',        name: 'cross-char' },
        { id: 'noir-whisper',     name: 'noir-whisper' },
        { id: 'ew-whisper',       name: 'early-whisper' },
        { id: 'adaptive-thought', name: 'adaptive-thought' }
    ];

    function rankOf(id) {
        for (let i = 0; i < BUBBLES.length; i++) if (BUBBLES[i].id === id) return i;
        return -1;
    }

    function currentlyVisible() {
        // Returns the highest-priority visible bubble's entry, or null.
        for (const b of BUBBLES) {
            const el = document.getElementById(b.id);
            if (el && isVisible(el)) return { ...b, el };
        }
        return null;
    }

    function isVisible(el) {
        if (!el || !el.isConnected) return false;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        // Many modules fade in by toggling a class; we treat a 0-opacity element
        // that IS in the DOM and transitioning as "about to show" — count it.
        return true;
    }

    function dismiss(el) {
        if (!el || !el.parentNode) return;
        // Try to let whatever animation the module is running finish gracefully.
        el.classList.remove('show', 'ew-show', 'ad-show'); // common class names
        el.style.transition = 'opacity 240ms ease';
        el.style.opacity = '0';
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 260);
    }

    let enforcing = false;
    function enforce() {
        // Guard against re-entry from our own DOM mutations.
        if (enforcing) return;
        enforcing = true;
        try {
            // Collect all visible bubbles with their ranks.
            const present = [];
            for (const b of BUBBLES) {
                const el = document.getElementById(b.id);
                if (el && isVisible(el)) present.push({ ...b, el, rank: rankOf(b.id) });
            }
            if (present.length <= 1) return;

            // Keep only the highest-priority (lowest rank number).
            present.sort((a, b) => a.rank - b.rank);
            const keep = present[0];
            for (let i = 1; i < present.length; i++) {
                // Never touch the "kept" element. Dismiss everything below it.
                dismiss(present[i].el);
            }
            // Optional: uncomment for debugging.
            // console.info('[ambient-coordinator] kept', keep.name, '— dismissed', present.slice(1).map(p=>p.name).join(','));
        } finally {
            // Release on next tick so our own removals aren't re-processed.
            setTimeout(() => { enforcing = false; }, 0);
        }
    }

    // --- Observer ------------------------------------------------------------
    // Watches the whole body subtree for added nodes. Cheap: we only react
    // when a known-id element appears.
    function startObserver() {
        const obs = new MutationObserver(mutations => {
            let relevant = false;
            for (const m of mutations) {
                if (m.type !== 'childList') continue;
                for (const n of m.addedNodes) {
                    if (n.nodeType !== 1) continue;
                    if (n.id && rankOf(n.id) !== -1) { relevant = true; break; }
                    // A module might insert a wrapper that contains the target.
                    if (n.querySelector) {
                        for (const b of BUBBLES) {
                            if (n.querySelector('#' + b.id)) { relevant = true; break; }
                        }
                    }
                    if (relevant) break;
                }
                if (relevant) break;
            }
            if (relevant) enforce();
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    // ========================================================================
    // QUIET FIRST HOUR — global popup arbiter
    // ------------------------------------------------------------------------
    // The "first hour" of play stacks several systems that each poll on their
    // own timers (affection-drift, daily-purpose banner, aenor-presence,
    // multi-romance, turning-points, monetization, daily-rewards, dates,
    // achievements, payments-guard, affection-scenes, surprises). Each one
    // checks "is the game busy?" with its own custom logic — none of them
    // know about each other. Result: in playtest we saw a Noir affection-
    // scene stack on top of the Take-me-to-Proto modal during the prologue
    // care-loop. To a fresh player that reads as "the game is broken".
    //
    // SOLUTION: one centralized predicate. PPAmbient.firstHourBusy() returns
    // true if ANY of the major scene/chain blockers are present. Every
    // popup-spawning module calls it at the top of their polling tick and
    // bails if true. Modules that already gate themselves (like the chain's
    // own ready modal) keep their own logic — this is purely additive.
    // ========================================================================

    // Selectors that should suppress *all* ambient/secondary popups.
    // Order: chain transitions first (most fragile), then scene overlays,
    // then modals. Any one of these matching means "the player is in a
    // moment that should not be interrupted".
    const HARD_BLOCKERS = [
        // Active chain transition (bridge → chapter, etc.) — body-class flag.
        // Checked separately below so we don't waste a query.
        '#mscard-root',                    // any scene card playing (bridges, chapters, endings, affection scenes)
        '#ms-encounter-root',              // crossover / encounter scenes
        '#chp-page',                       // main story chapter list overlay
        '#letter-overlay:not(.hidden)',    // open letter
        '#pp-onboarding-overlay',          // onboarding tour
        '#pp-ready-overlay',               // chain "Take me to X" modal
        '#pp-chain-lock-overlay',          // chain "locked" popup
        '#mst-confirm-overlay',            // main-story toggle confirm
        '#world-intro:not(.hidden)',       // initial world intro
        '#cinematic-overlay.visible',      // cinematic overlay
        '#event-overlay:not(.hidden)',     // event overlay
        '#story-overlay:not(.hidden)',     // story overlay
        '#daily-reward-overlay:not(.hidden)', // daily reward modal
        '#tp-root',                        // turning-point card (when shown)
        '#talk-choice-overlay:not(.hidden)' // talk choice modal
    ];

    function firstHourBusy() {
        try {
            if (document.body && document.body.classList.contains('pp-chain-in-progress')) return true;
            for (const sel of HARD_BLOCKERS) {
                if (document.querySelector(sel)) return true;
            }
            return false;
        } catch (_) { return false; }
    }

    // ────────────────────────────────────────────────────────────────────────
    // FIRST CARE SESSION GATE
    // ────────────────────────────────────────────────────────────────────────
    // Returns true during the early minutes of a fresh save's first care-loop
    // visit — used by polling modules (adaptive-thoughts, whispers, aenor,
    // care-weaver-thread, multi-romance, day-progress, etc.) to back off so
    // the greeting + first-action hint can land cleanly without bubbles
    // stacking on top.
    //
    // Ends at the FIRST of:
    //   - 5 minutes of wall-clock since the care page first opened, OR
    //   - 6 player interactions logged on _game (feed/wash/talk/gift/train)
    //
    // The TIMESTAMP is set the first time _game becomes available with a
    // selected character — a fresh save in the care loop. Persisted in
    // localStorage so it survives accidental reloads during the session
    // (player tapping refresh by mistake shouldn't reset their quiet window).
    const FIRST_CARE_KEY = 'pp_first_care_session_start';
    const FIRST_CARE_DURATION_MS = 5 * 60 * 1000;  // 5 minutes
    const FIRST_CARE_INTERACTION_CAP = 6;

    function _firstCareStart() {
        let raw = null;
        try { raw = localStorage.getItem(FIRST_CARE_KEY); } catch (_) {}
        if (raw) return parseInt(raw, 10) || 0;
        return 0;
    }
    function _stampFirstCareStartIfNeeded() {
        if (_firstCareStart()) return;
        const g = window._game;
        if (!g || !(g.selectedCharacter || g.characterId)) return;
        try { localStorage.setItem(FIRST_CARE_KEY, String(Date.now())); } catch (_) {}
    }
    function _interactionCount() {
        const g = window._game;
        if (!g) return 0;
        return (g.timesFed || 0) + (g.timesWashed || 0) + (g.timesTalked || 0)
             + (g.timesGifted || 0) + (g.timesTrained || 0);
    }
    function firstCareSession() {
        // Stamp on first call once _game is ready.
        _stampFirstCareStartIfNeeded();
        const start = _firstCareStart();
        if (!start) return false;
        if (Date.now() - start > FIRST_CARE_DURATION_MS) return false;
        if (_interactionCount() >= FIRST_CARE_INTERACTION_CAP) return false;
        return true;
    }

    // Defensive scrub — if any of the registered ambient bubbles is in the DOM
    // while a hard blocker is up, remove it. Runs cheaply on a 1.5s interval.
    // This catches the case where a module mounted its bubble *just before*
    // a chain transition started (race window). Without this, the bubble would
    // sit on top of the cinematic.
    // pp-chain-toast is intentionally NOT in this list. It IS the chain-
    // transition UI (the "X's route is open" card), so it should remain
    // visible while the chain is in progress, not be scrubbed by the
    // first-hour-busy guard.
    const SCRUB_IDS = [
        'cc-bubble', 'noir-whisper', 'ew-whisper', 'adaptive-thought',
        'pp-aenor-bubble', 'pp-multirom-bubble', 'pp-care-thread-toast',
        'ad-toast', 'date-unlock-toast', 'mon-chip', 'pg-notice'
    ];
    // Class-based popups (achievement notifications, etc.) — same scrub logic.
    const SCRUB_CLASSES = ['.achievement-popup'];
    function scrubDuringBlocker() {
        // Scrub during a hard blocker (chain transition, scene, modal) OR
        // during the first care session. Both states need to be quiet.
        if (!firstHourBusy() && !firstCareSession()) return;
        for (const id of SCRUB_IDS) {
            const el = document.getElementById(id);
            if (el) {
                try { dismiss(el); } catch (_) {}
            }
        }
        for (const sel of SCRUB_CLASSES) {
            const els = document.querySelectorAll(sel);
            els.forEach(el => { try { dismiss(el); } catch (_) {} });
        }
    }

    // --- Public API ----------------------------------------------------------
    window.PPAmbient = {
        // Is any ambient bubble currently showing? Future modules should
        // check this before rendering and back off if true.
        busy() { return !!currentlyVisible(); },
        // ALL-systems busy check: scenes, chain transitions, modals.
        // This is what most polling modules should call before mounting.
        firstHourBusy,
        // First-care-session gate. True during the first 5 minutes / first
        // 6 interactions of a fresh save's care loop. Polling modules
        // (adaptive-thoughts, whispers, aenor, care-weaver-thread,
        // multi-romance, day-progress) should back off when this is true
        // so the greeting and first-action hint can land without competition.
        firstCareSession,
        // Convenience: returns true if the player is in the prologue chain
        // (chain step 1..6, not yet completed). Several systems should defer
        // their "look how cool we are" popups until prologue is done.
        inPrologue() {
            try {
                const step = parseInt(localStorage.getItem('pp_chain_step') || '0', 10);
                const done = localStorage.getItem('pp_chain_complete') === '1';
                return !done && step >= 0 && step < 7;
            } catch (_) { return false; }
        },
        // Which bubble is on top?
        top() {
            const cur = currentlyVisible();
            return cur ? cur.name : null;
        },
        // Force-clear a specific bubble by id.
        clear(id) {
            const el = document.getElementById(id);
            if (el) dismiss(el);
        },
        // Re-run enforcement manually (e.g., after a race).
        enforce,
        // Rank introspection.
        rank: rankOf,
        priority: BUBBLES.map(b => b.name)
    };

    // --- Boot ----------------------------------------------------------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserver, { once: true });
    } else {
        startObserver();
    }

    // INSTANT SCRUB on blocker arrival.
    // The 1.5s setInterval is a backstop, but a popup that mounts in the same
    // tick as a hard blocker would still be visible for ~1.5s. To kill that
    // window, watch the DOM and scrub the moment a blocker appears.
    const BLOCKER_IDS_FAST = new Set([
        'mscard-root','ms-encounter-root','chp-page','pp-ready-overlay',
        'pp-onboarding-overlay','pp-chain-lock-overlay','mst-confirm-overlay',
        'world-intro','cinematic-overlay','event-overlay','story-overlay',
        'daily-reward-overlay','tp-root','talk-choice-overlay','letter-overlay'
    ]);
    function startBlockerObserver() {
        const obs = new MutationObserver(mutations => {
            for (const m of mutations) {
                if (m.type !== 'childList') continue;
                for (const n of m.addedNodes) {
                    if (n.nodeType !== 1) continue;
                    if (n.id && BLOCKER_IDS_FAST.has(n.id)) { scrubDuringBlocker(); return; }
                    // Some blockers nest under a wrapper (rare but cheap to check).
                    if (n.querySelector) {
                        for (const id of BLOCKER_IDS_FAST) {
                            if (n.querySelector('#' + id)) { scrubDuringBlocker(); return; }
                        }
                    }
                }
                // class-based mounts (cinematic-overlay.visible, etc.) — check
                // attribute mutations on body class as well.
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    if (firstHourBusy()) { scrubDuringBlocker(); return; }
                }
            }
        });
        obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startBlockerObserver, { once: true });
    } else {
        startBlockerObserver();
    }

    // Scrub sweep — cheap, defensive, runs forever as a backstop.
    setInterval(scrubDuringBlocker, 1500);

    // ========================================================================
    // VISIBILITY-AWARE TICK COORDINATOR
    // ------------------------------------------------------------------------
    // The Production audit flagged 42+ uncoordinated `setInterval` calls
    // across the codebase (affection-drift, aenor-presence, multi-romance,
    // adaptive-thoughts, daily-purpose, dates, monetization, idle-life, etc.)
    // running constantly even when the browser tab is hidden. On a low-end
    // Android, that compounds to noticeable battery drain + stuttering when
    // the player switches back to the tab.
    //
    // We don't refactor every poll today (would touch 12+ files). Instead we
    // expose `PPAmbient.tickAllowed()` — a SINGLE check that any polling
    // module can call to decide whether to bail this tick. It returns:
    //   - false if the document is hidden (player switched tab / locked phone)
    //   - false if firstHourBusy() (a scene/modal is up)
    //   - true otherwise
    //
    // Modules that adopt this gate (their next-update opportunity) get free
    // pause-when-backgrounded behaviour. Modules that don't: still work, just
    // less efficient.
    //
    // ALSO: when the tab regains visibility, we fire a one-shot
    // `pp:tick-resume` CustomEvent so any module that wants to refresh state
    // (e.g. re-apply affection drift catch-up) can subscribe.
    // ========================================================================
    let _wasHidden = false;
    function tickAllowed() {
        try {
            if (document.hidden || document.visibilityState === 'hidden') return false;
        } catch (_) {}
        return !firstHourBusy();
    }
    document.addEventListener('visibilitychange', () => {
        const hidden = document.hidden || document.visibilityState === 'hidden';
        if (_wasHidden && !hidden) {
            // Returning to foreground — broadcast for catch-up logic.
            try { document.dispatchEvent(new CustomEvent('pp:tick-resume', { detail: { hiddenSince: Date.now() } })); } catch (_) {}
        }
        _wasHidden = hidden;
    });

    // Expose on the public API.
    if (window.PPAmbient) {
        window.PPAmbient.tickAllowed = tickAllowed;
        window.PPAmbient.isHidden = () => {
            try { return !!(document.hidden || document.visibilityState === 'hidden'); } catch (_) { return false; }
        };
    }
})();
