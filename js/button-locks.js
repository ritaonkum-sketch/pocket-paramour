// ============================================================
//  BUTTON LOCKS — Progression gates for action buttons
//  Gift + Train are locked until affection level 1, making the
//  early game feel like a getting-to-know-you phase. Players
//  can only Feed / Wash / Talk at first; Gift and Train unlock
//  once trust starts building.
//
//  Date has its own dedicated lock system in dates.js.
// ============================================================

(function () {
    'use strict';

    // Minimum affection level required to unlock each action
    const LOCKS = {
        'btn-gift':  { minAffection: 1, label: 'Gifts',   hint: 'Build more trust before giving gifts.' },
        'btn-train': { minAffection: 1, label: 'Training', hint: 'Training together requires more trust first.' }
    };

    // Track which buttons have already shown their unlock toast
    const unlockedOnce = {};

    function applyLock(btnId, config) {
        const btn = document.getElementById(btnId);
        const g = window._game;
        if (!btn || !g) return;

        const locked = (g.affectionLevel || 0) < config.minAffection;

        btn.classList.toggle('action-btn-locked', locked);
        btn.setAttribute('title', locked ? config.hint : '');

        // First-time unlock: celebrate
        if (!locked && !unlockedOnce[btnId] && (g.timesFed || 0) + (g.timesWashed || 0) + (g.timesTalked || 0) > 0) {
            unlockedOnce[btnId] = true;
            showUnlockToast(config.label, btn);
        }
        if (locked) unlockedOnce[btnId] = false;
    }

    function showUnlockToast(label, btn) {
        const toast = document.createElement('div');
        toast.className = 'action-unlock-toast';
        toast.textContent = '✨ ' + label + ' unlocked!';
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('visible'));
        // Tap to dismiss (owner rule); the long fallback only clears it if ignored.
        let done = false;
        const close = () => {
            if (done) return; done = true;
            toast.classList.remove('visible');
            setTimeout(() => { try { toast.remove(); } catch (e) {} }, 500);
        };
        toast.style.cursor = 'pointer';
        toast.addEventListener('click', close);
        setTimeout(close, 8000);

        // Pulse the button itself
        btn.classList.add('action-btn-unlock-pulse');
        setTimeout(() => btn.classList.remove('action-btn-unlock-pulse'), 2400);
    }

    function interceptClicks() {
        Object.keys(LOCKS).forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (!btn) return;
            // Capture-phase listener so we fire before the existing game handler
            btn.addEventListener('click', function (e) {
                const g = window._game;
                if (!g) return;
                const cfg = LOCKS[btnId];
                if ((g.affectionLevel || 0) < cfg.minAffection) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    // Shake
                    btn.classList.remove('action-btn-shake');
                    void btn.offsetWidth;
                    btn.classList.add('action-btn-shake');
                    // Hint via typewriter
                    if (g.typewriter) {
                        try { g.typewriter.show(cfg.hint, function () {}); } catch (err) {}
                    }
                }
            }, true);
        });
    }

    function refresh() {
        Object.keys(LOCKS).forEach(btnId => applyLock(btnId, LOCKS[btnId]));
    }

    // ── Boot ─────────────────────────────────────────────────────
    // refresh() reapplies lock state to game buttons. Gated on
    // PPAmbient.tickAllowed() so it skips when the tab is hidden or a
    // scene/modal is up — buttons aren't interactable in either case.
    function refreshTick() {
        try {
            if (window.PPAmbient && typeof window.PPAmbient.tickAllowed === 'function'
                && !window.PPAmbient.tickAllowed()) return;
        } catch (_) { /* coordinator missing — fall through */ }
        refresh();
    }
    const poll = setInterval(() => {
        if (window._game && window._game.tickInterval) {
            clearInterval(poll);
            interceptClicks();
            refresh();
            setInterval(refreshTick, 2000);
        }
    }, 500);

})();
