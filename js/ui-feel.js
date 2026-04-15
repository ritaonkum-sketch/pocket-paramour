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

        setInterval(pollOnce, 1200);
        // Run once shortly after game loads
        setTimeout(pollOnce, 800);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
