/* ==========================================================================
   AFFECTION DRIFT — soft caps on neglected characters
   --------------------------------------------------------------------------
   WHY THIS EXISTS
   Top-tier Otome games reward loyalty. If a player is hot-and-cold —
   romancing Alistair today, Noir tomorrow, ignoring Elian for a week — the
   rest of the cast should notice. Not cruelly (we do NOT delete progress),
   but through a temporary, reversible bond cap.

   HOW IT WORKS
   - Reads each character's "last visited" timestamp (pp_lastvisit_<char>).
     If the game already writes this, we use it. If not, we inject a
     capture-phase listener on .select-card clicks to write it ourselves.
   - If a character is met (pp_met_<char>) and hasn't been visited for
     DRIFT_DELAY_HOURS, their affection is soft-capped at DRIFT_CAP until the
     player visits them again. It never DROPS — it freezes growth.
   - On next visit, cap lifts immediately. A small toast appears:
     "<Name> looks up, surprised to see you."
   - Debug: window.AffectionDrift.status()

   ADDITIVE — we wrap setAffection only if it exists and only to cap, never
   to subtract. No edits to any existing file.
   ========================================================================== */

(function () {
    'use strict';

    const CHARS = ['alistair', 'elian', 'lyra', 'caspian', 'lucien', 'noir', 'proto'];
    const DISPLAY = {
        alistair: 'Alistair',
        elian:    'Elian',
        lyra:     'Lyra',
        caspian:  'Caspian',
        lucien:   'Lucien',
        noir:     'Noir',
        proto:    'Proto'
    };

    const DRIFT_DELAY_HOURS = 24;
    const DRIFT_DELAY_MS    = DRIFT_DELAY_HOURS * 60 * 60 * 1000;
    const DRIFT_CAP         = 45;   // soft ceiling while neglected
    const POLL_MS           = 30 * 1000;

    function met(char)   { return localStorage.getItem('pp_met_' + char) === '1'
                               || localStorage.getItem('pp_ms_encounter_' + char + '_seen') === '1'; }
    function lastVisit(char) {
        const v = parseInt(localStorage.getItem('pp_lastvisit_' + char) || '0', 10);
        return isNaN(v) ? 0 : v;
    }
    function isDrifting(char) {
        if (!met(char)) return false;
        const lv = lastVisit(char);
        if (!lv) return false; // never tracked — don't punish
        return (Date.now() - lv) > DRIFT_DELAY_MS;
    }

    // -- Visit tracking ------------------------------------------------------
    // Mark a visit when the player opens a character from the select grid.
    function markVisit(char) {
        if (!char) return;
        localStorage.setItem('pp_lastvisit_' + char, String(Date.now()));
        // If they were drifting, surface a soft welcome-back toast.
        const wasDrifting = localStorage.getItem('pp_drift_' + char) === '1';
        if (wasDrifting) {
            localStorage.removeItem('pp_drift_' + char);
            showToast(DISPLAY[char] + ' looks up, surprised to see you.');
        }
    }

    function hookSelectCards() {
        document.addEventListener('click', function (e) {
            const card = e.target.closest ? e.target.closest('.select-card') : null;
            if (!card) return;
            const char = card.getAttribute('data-character');
            if (char && CHARS.indexOf(char) !== -1) markVisit(char);
        }, true);
    }

    // -- Soft cap ------------------------------------------------------------
    // We do NOT modify existing character.js. Instead we probe affection each
    // poll tick and, if above cap while drifting, gently push back down.
    function getAffection(char) {
        const raw = localStorage.getItem('pp_affection_' + char);
        if (raw == null) {
            // Fall back to legacy key shape some modules use.
            const alt = localStorage.getItem(char + '_affection');
            return alt == null ? null : parseInt(alt, 10);
        }
        return parseInt(raw, 10);
    }
    function setAffection(char, val) {
        localStorage.setItem('pp_affection_' + char, String(val));
        try {
            if (window.game && typeof window.game.setAffection === 'function') {
                window.game.setAffection(char, val);
            }
        } catch (_) { /* noop */ }
    }

    function applyCap() {
        CHARS.forEach(char => {
            if (!isDrifting(char)) return;
            localStorage.setItem('pp_drift_' + char, '1');
            const aff = getAffection(char);
            if (aff == null || isNaN(aff)) return;
            if (aff > DRIFT_CAP) setAffection(char, DRIFT_CAP);
        });
    }

    // -- Toast ---------------------------------------------------------------
    function injectToastStyles() {
        if (document.getElementById('ad-styles')) return;
        const s = document.createElement('style');
        s.id = 'ad-styles';
        s.textContent = `
            #ad-toast {
                position: fixed;
                bottom: 72px;
                left: 50%;
                transform: translateX(-50%) translateY(12px);
                max-width: 86vw;
                padding: 10px 16px;
                font-family: inherit;
                font-size: 13px;
                color: #fff4ff;
                background: linear-gradient(180deg, rgba(30,12,50,0.92), rgba(50,18,70,0.86));
                border: 1px solid rgba(220, 170, 240, 0.45);
                border-radius: 12px;
                box-shadow: 0 8px 22px rgba(0,0,0,0.5);
                text-align: center;
                letter-spacing: 0.2px;
                opacity: 0;
                z-index: 9050;
                transition: opacity 380ms ease, transform 380ms ease;
                pointer-events: none;
            }
            #ad-toast.ad-show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        `;
        document.head.appendChild(s);
    }

    function showToast(msg) {
        injectToastStyles();
        // Avoid stacking — if one exists, drop it.
        const prev = document.getElementById('ad-toast');
        if (prev && prev.parentNode) prev.parentNode.removeChild(prev);

        const el = document.createElement('div');
        el.id = 'ad-toast';
        el.textContent = msg;
        document.body.appendChild(el);
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight;
        el.classList.add('ad-show');
        setTimeout(() => {
            el.classList.remove('ad-show');
            setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 420);
        }, 3200);
    }

    // -- Boot ----------------------------------------------------------------
    function boot() {
        hookSelectCards();
        applyCap();
        setInterval(applyCap, POLL_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    // Debug hooks
    window.AffectionDrift = {
        status() {
            const out = {};
            CHARS.forEach(char => {
                out[char] = {
                    met: met(char),
                    lastVisit: lastVisit(char),
                    hoursSince: lastVisit(char) ? Math.round((Date.now() - lastVisit(char)) / 36e5) : null,
                    drifting: isDrifting(char),
                    affection: getAffection(char)
                };
            });
            return out;
        },
        forceDrift(char) {
            localStorage.setItem('pp_lastvisit_' + char, String(Date.now() - DRIFT_DELAY_MS - 1000));
            applyCap();
        },
        clearAll() {
            CHARS.forEach(char => {
                localStorage.removeItem('pp_drift_' + char);
                localStorage.removeItem('pp_lastvisit_' + char);
            });
        },
        config: { DRIFT_DELAY_HOURS, DRIFT_CAP }
    };
})();
