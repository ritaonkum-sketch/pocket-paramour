// ============================================================
//  UI FEEL — Tier 1 layout polish
//  Self-contained. No modifications to game.js required.
//  Adds:
//    - Top-bar hamburger toggle (collapses trophy/gallery/music/settings)
//    - Lowest-stat pulse on action buttons (urgent-need cue)
//    - Mood caption already in DOM, styling-only
// ============================================================

(function () {
    'use strict';

    function init() {
        wireTopbarMenu();
        startLowestStatPoller();
        startTopbarOverlayReaper();
    }

    // ── Top-bar overlay reaper (self-healing invariant) ────────
    // The cinematic-overlay's .visible class drives a body:has() rule
    // in style.css that hides the topbar, day-progress, and other
    // home-screen chrome. There are 20+ scene-end paths in game.js,
    // and any path that sets sceneActive=false WITHOUT also clearing
    // the overlay class leaves the topbar hidden indefinitely.
    //
    // Reproducer that surfaced this (May 2026 audit): an idle-life
    // adaptive-thoughts beat fired during state-poke testing, ended
    // normally, but its cleanup didn't reach the cinematic-overlay
    // class — topbar stayed gone until the next reload.
    //
    // Defensive fix: every 1.5s, if sceneActive is false but the
    // overlay still carries .visible (or its substate classes), force
    // it back to hidden. This is a safety net, not a substitute for
    // proper per-path cleanup, but it prevents the player from ever
    // being stranded in a no-topbar state.
    //
    // The fix has had to be applied TWICE per-overlay before generalizing:
    // #cinematic-overlay (task #59 — .hidden + .visible stamped together)
    // and #intro-overlay (task #67 — .visible left on after the fade while
    // computed display went none). Per-overlay patching is whack-a-mole, so
    // this reaper enforces ONE invariant centrally for EVERY overlay in the
    // topbar-hide rule (style.css ~848):
    //
    //   if an overlay carries an "open" class but its COMPUTED display is
    //   'none', it is not actually on screen → strip the open class.
    //
    // Reality = computed display, so a stale class can never fool it, and the
    // correction is a visual no-op (the element is already display:none) that
    // only fixes the body:has() rule. Covers every current + future
    // class-toggled overlay. The roots are ALSO hardened at source (e.g.
    // intro.js start() normalizes stale state) — this is the safety net.
    function startTopbarOverlayReaper() {
        // open === '.visible'   → close via -.visible +.hidden
        const VISIBLE_OVERLAYS   = ['intro-overlay', 'cinematic-overlay'];
        // open === ':not(.hidden)' → close via +.hidden
        const NOTHIDDEN_OVERLAYS = ['story-overlay', 'gallery-overlay', 'letter-overlay',
            'settings-overlay', 'event-overlay', 'gift-panel', 'training-panel', 'date-overlay'];
        // open === '.show'      → close via -.show
        const SHOW_OVERLAYS      = ['pp-ready-overlay', 'pp-chain-toast'];

        const co = document.getElementById('cinematic-overlay');
        let stuckSince = 0;
        const STUCK_MS = 1500;

        // An overlay is a "ghost" if it is not actually painted. computed
        // display:none is the unambiguous signal — a presenting overlay is
        // never display:none — so acting on it is always safe.
        const isGhost = (el) => {
            try { return getComputedStyle(el).display === 'none'; } catch (_) { return false; }
        };

        setInterval(() => {
            let healed = false;

            VISIBLE_OVERLAYS.forEach((id) => {
                const el = document.getElementById(id);
                if (!el) return;
                const openByClass = el.classList.contains('visible') ||
                                    el.classList.contains('char-visible') ||
                                    el.classList.contains('dialogue-visible');
                if (openByClass && isGhost(el)) {
                    el.classList.remove('visible', 'char-visible', 'dialogue-visible');
                    el.classList.add('hidden');
                    // wipe any inline fade leftovers (opacity/transition/display)
                    el.style.opacity = '';
                    el.style.transition = '';
                    el.style.display = '';
                    healed = true;
                }
            });
            NOTHIDDEN_OVERLAYS.forEach((id) => {
                const el = document.getElementById(id);
                if (el && !el.classList.contains('hidden') && isGhost(el)) {
                    el.classList.add('hidden');
                    healed = true;
                }
            });
            SHOW_OVERLAYS.forEach((id) => {
                const el = document.getElementById(id);
                if (el && el.classList.contains('show') && isGhost(el)) {
                    el.classList.remove('show');
                    healed = true;
                }
            });
            if (healed) {
                try { console.warn('[ui-feel] topbar overlay-reaper: cleared a stale open-class (self-heal)'); } catch (_) {}
            }

            // ── cinematic-overlay "scene ended but still painted" net ──
            // The reaper above only fires on display:none. The OTHER way the
            // cinematic strands the top bar is staying genuinely painted
            // (.visible, display NOT none) after sceneActive flips false. Only
            // the cinematic exposes sceneActive, so this stays cinematic-specific
            // and keeps its grace period before force-hiding.
            if (!co) return;
            const g = window._game;
            if (!g) { stuckSince = 0; return; }
            const stillPainted = (co.classList.contains('visible') ||
                                  co.classList.contains('char-visible') ||
                                  co.classList.contains('dialogue-visible')) &&
                                 !isGhost(co);
            if (!stillPainted) { stuckSince = 0; return; }
            if (g.sceneActive) { stuckSince = 0; return; }
            if (stuckSince === 0) { stuckSince = Date.now(); return; }
            if (Date.now() - stuckSince >= STUCK_MS) {
                co.classList.remove('visible', 'char-visible', 'dialogue-visible',
                                    'stage-warm', 'stage-cool', 'stage-tense', 'stage-romantic');
                co.classList.add('hidden');
                stuckSince = 0;
                try { console.warn('[ui-feel] cinematic-overlay watchdog: cleared stuck visible class'); } catch (_) {}
            }
        }, 500);
    }

    // ── 1. Top-bar collapse / expand ───────────────────────────
    function wireTopbarMenu() {
        const menuBtn = document.getElementById('topbar-menu-btn');
        const display = document.getElementById('affection-display');
        if (!menuBtn || !display) return;
        // Start collapsed.
        display.classList.add('topbar-collapsed');

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            display.classList.toggle('topbar-collapsed');
            menuBtn.classList.toggle('open');
        });

        // Tap outside the topbar to collapse.
        document.addEventListener('click', (e) => {
            if (display.classList.contains('topbar-collapsed')) return;
            if (display.contains(e.target)) return;
            display.classList.add('topbar-collapsed');
            menuBtn.classList.remove('open');
        });

        // When any collapsible button is clicked, collapse the menu after.
        document.querySelectorAll('.topbar-collapsible').forEach((btn) => {
            btn.addEventListener('click', () => {
                setTimeout(() => {
                    display.classList.add('topbar-collapsed');
                    menuBtn.classList.remove('open');
                }, 80);
            });
        });
    }

    // ── 2. Lowest-stat pulse poller ────────────────────────────
    // Watches hunger/clean/bond and adds .urgent-need to the
    // matching action button. Updates every 1.2s. Only one button
    // pulses at a time. The threshold is 60 — anything below is
    // "needs attention." If all three are above 60, no pulse.
    function startLowestStatPoller() {
        const map = {
            hunger: 'btn-feed',
            clean:  'btn-wash',
            bond:   'btn-talk',  // bond rises from talk + gift; pick talk as primary
        };
        const URGENT_BELOW = 60;

        function pollOnce() {
            const g = window._game;
            if (!g) return;
            // Don't pulse during scenes / cinematics / sleep
            if (g.sceneActive || g.characterLeft) {
                clearAllUrgent();
                return;
            }
            const stats = {
                hunger: g.hunger || 0,
                clean:  g.clean  || 0,
                bond:   g.bond   || 0,
            };
            // Find the minimum stat that's also below the threshold.
            let lowest = null, lowestVal = URGENT_BELOW + 1;
            for (const k of Object.keys(stats)) {
                if (stats[k] < lowestVal) { lowest = k; lowestVal = stats[k]; }
            }
            clearAllUrgent();
            if (lowest && stats[lowest] < URGENT_BELOW) {
                const btn = document.getElementById(map[lowest]);
                if (btn) btn.classList.add('urgent-need');
            }
        }
        function clearAllUrgent() {
            Object.values(map).forEach((id) => {
                const btn = document.getElementById(id);
                if (btn) btn.classList.remove('urgent-need');
            });
        }

        // pollOnce paints the 'urgent-need' class on the lowest-stat button.
        // Gated on PPAmbient.tickAllowed() so it skips when the tab is hidden
        // or a scene is up — the urgent ring isn't visible in either case.
        function pollTick() {
            try {
                if (window.PPAmbient && typeof window.PPAmbient.tickAllowed === 'function'
                    && !window.PPAmbient.tickAllowed()) return;
            } catch (_) { /* coordinator missing — fall through */ }
            pollOnce();
        }
        setInterval(pollTick, 1200);
        // Run once shortly after game loads
        setTimeout(pollOnce, 800);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
