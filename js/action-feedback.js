// ============================================================
//  ACTION FEEDBACK (Tier 2)
//  Makes the character the protagonist of each action tap.
//  - Floating "+N stat" rises from the character's body (not button)
//  - Character body pulses in response (CSS class, no new art)
//  - Stat bar briefly flashes
//  Fully additive — doesn't modify game.js, ui.js, or existing particles.
// ============================================================

(function () {
    'use strict';

    // Map each action button to the stats we expect to change.
    // Note: talk/gift/train all push bond; wash pushes clean; feed pushes hunger.
    const BTN_STATS = {
        'btn-feed':  { stat: 'hunger', label: 'Hunger', color: '#ff8a5b', emoji: '🍎' },
        'btn-wash':  { stat: 'clean',  label: 'Clean',  color: '#4fc3f7', emoji: '💧' },
        'btn-gift':  { stat: 'bond',   label: 'Bond',   color: '#ff5d8f', emoji: '🎁' },
        'btn-train': { stat: 'bond',   label: 'Bond',   color: '#d4a5ff', emoji: '✨' },
        'btn-talk':  { stat: 'bond',   label: 'Bond',   color: '#ff5d8f', emoji: '💬' },
    };

    function getGame() { return window._game; }

    // Snapshot the relevant stats from the live game object.
    function snapshot() {
        const g = getGame();
        if (!g) return null;
        return {
            hunger: g.hunger || 0,
            clean:  g.clean  || 0,
            bond:   g.bond   || 0,
        };
    }

    // Spawn a floating "+N Stat" element at the character's body center.
    function spawnFloatingStat(delta, label, color) {
        const container = document.getElementById('character-area');
        const body = document.getElementById('character-fullbody');
        if (!container || !body) return;

        const bodyRect = body.getBoundingClientRect();
        const areaRect = container.getBoundingClientRect();

        // Center horizontally on body, start at ~40% down (chest height)
        const x = (bodyRect.left - areaRect.left) + bodyRect.width / 2;
        const y = (bodyRect.top - areaRect.top) + bodyRect.height * 0.40;

        const el = document.createElement('div');
        el.className = 'pp-stat-float';
        el.textContent = '+' + Math.round(delta) + ' ' + label;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.color = color;
        el.style.textShadow = '0 0 8px ' + color + ', 0 2px 6px rgba(0,0,0,0.8)';
        container.appendChild(el);

        // Remove after animation completes.
        setTimeout(() => { el.remove(); }, 1600);
    }

    // Add a transient reaction class to the character body for a pulse.
    function pulseCharacter() {
        const area = document.getElementById('character-area');
        if (!area) return;
        area.classList.remove('action-reacting');
        // Force reflow so animation restarts if tapped rapidly.
        void area.offsetWidth;
        area.classList.add('action-reacting');
        setTimeout(() => area.classList.remove('action-reacting'), 650);
    }

    // Briefly highlight the stat bar that changed.
    function flashStatBar(statKey) {
        const bar = document.getElementById(statKey + '-bar');
        if (!bar) return;
        bar.classList.remove('pp-stat-flash');
        void bar.offsetWidth;
        bar.classList.add('pp-stat-flash');
        setTimeout(() => bar.classList.remove('pp-stat-flash'), 800);
    }

    // Hook into the action buttons. We attach in the CAPTURE phase so our
    // snapshot runs before the existing UI click handler, and we read deltas
    // after a short delay so game.feed()/wash()/etc. can finish mutating state.
    function hook() {
        Object.keys(BTN_STATS).forEach((btnId) => {
            const btn = document.getElementById(btnId);
            if (!btn) return;
            btn.addEventListener('click', () => {
                const before = snapshot();
                if (!before) return;

                // Pulse the character immediately — doesn't wait for stats.
                pulseCharacter();

                // Gift button opens a panel; actual stat change happens later
                // when user picks a gift. Skip the delta check for gift.
                if (btnId === 'btn-gift') return;

                // Wait a beat for the game logic to apply.
                setTimeout(() => {
                    const after = snapshot();
                    if (!after) return;
                    // Find which stat moved the most (positively).
                    const deltas = {
                        hunger: after.hunger - before.hunger,
                        clean:  after.clean  - before.clean,
                        bond:   after.bond   - before.bond,
                    };
                    // Prefer the expected stat for this button if it moved.
                    const expectedKey = BTN_STATS[btnId].stat;
                    let chosen = expectedKey;
                    if (deltas[expectedKey] < 0.5) {
                        // Fall back to whichever stat moved most.
                        let maxDelta = 0;
                        for (const k of Object.keys(deltas)) {
                            if (deltas[k] > maxDelta) { maxDelta = deltas[k]; chosen = k; }
                        }
                    }
                    const delta = deltas[chosen];
                    if (delta < 0.5) return; // Nothing meaningful happened.
                    // Floating "+N Stat" text DISABLED per design call —
                    // it was redundant with the stat-bar fill animation +
                    // the character's dialogue reaction line. Two systems
                    // showing the same data felt cluttered. Bar flash and
                    // character pulse remain (those are subtle and helpful).
                    // spawnFloatingStat(delta, labelForStat(chosen), BTN_STATS[btnId].color);
                    flashStatBar(chosen);
                }, 180);
            }, true); // capture phase so we run before existing handlers
        });
    }

    function labelForStat(key) {
        return { hunger: 'Hunger', clean: 'Clean', bond: 'Bond' }[key] || key;
    }

    function init() {
        // Wait until action buttons exist in the DOM. They may be hidden
        // initially (title screen) but are in the HTML from the start.
        if (document.getElementById('btn-feed')) { hook(); return; }
        // Defensive retry in case of late DOM
        setTimeout(init, 200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
