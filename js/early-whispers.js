/* ==========================================================================
   EARLY WHISPERS — unattributed Noir atmosphere, pre-meet (Ch 1–5)
   --------------------------------------------------------------------------
   WHY THIS EXISTS
   A top verdict for the game was: Noir should feel PRESENT before he is met.
   The player must sense a second gravity pulling at the story — someone
   watching, amused, patient. By the time Chapter 6 arrives and Noir finally
   speaks, the player should whisper "I KNEW it."

   WHAT THIS DOES
   - Fires subtle italic captions at the TOP of the screen (not speech bubbles,
     not attributed to any character).
   - Runs only BEFORE Ch 6 completes (pp_chapter_done_6 absent). After Noir is
     met, this module silently disables itself — his real voice takes over via
     noir-whispers.js.
   - ~8–12 min cooldown, never more than ~2 per session.
   - Tap-to-dismiss.
   - Suppressed during any scene/modal/panel to avoid collision.

   ADDITIVE — reads only. Writes pp_ew_last (timestamp) and pp_ew_idx (cursor).
   No edits to any existing file.
   ========================================================================== */

(function () {
    'use strict';

    // Pool of unattributed whispers. Ordered so the first ones are curious,
    // later ones grow more specific — mirroring the player's investment curve.
    const LINES = [
        "You weren't supposed to make it this far.",
        "Careful. Something is listening.",
        "Keep going. I find you interesting.",
        "Don't tell anyone about this feeling yet.",
        "Someone has been watching you sleep.",
        "The wind tastes different tonight. Did you notice?",
        "You're the first thing in a long time worth remembering.",
        "Turn around. Slowly. — No. I'm joking. Not yet.",
        "Every choice you make, a bell rings somewhere far away.",
        "If you stop now, I will have to find you.",
        "Whoever you love, love them honestly. It matters more than you think.",
        "A door that was closed for a hundred years just creaked open."
    ];

    const STORAGE_LAST = 'pp_ew_last';
    const STORAGE_IDX  = 'pp_ew_idx';
    const MIN_COOLDOWN_MS = 8 * 60 * 1000;   // 8 minutes
    const JITTER_MS       = 4 * 60 * 1000;   // +0–4 min
    const POLL_MS         = 13 * 1000;       // probe every 13s
    const FIRST_DELAY_MS  = 45 * 1000;       // grace period after session start

    // Disable once Noir is met — his real voice takes over.
    function noirMet() {
        return localStorage.getItem('pp_chapter_done_6') === '1'
            || localStorage.getItem('pp_ms_encounter_noir_seen') === '1';
    }

    // Do nothing until the player has actually engaged the game at all.
    function playerStarted() {
        return localStorage.getItem('pp_world_intro_seen') === '1'
            || document.getElementById('game-container')?.classList.contains('active')
            || !document.getElementById('title-screen')
            || document.getElementById('title-screen')?.classList.contains('hidden');
    }

    // Suppress whenever any overlay/scene/modal is up.
    function sceneActive() {
        if (document.getElementById('mscard-root')) return true;
        if (document.getElementById('tp-root')) return true;
        if (document.querySelector('.pp-modal, .overlay, .paywall, .puzzle-overlay, .dialogue-overlay, .encounter-overlay')) return true;
        if (document.body.classList.contains('scene-active')) return true;
        // Intro / world-intro running?
        const wi = document.getElementById('world-intro');
        if (wi && !wi.classList.contains('hidden')) return true;
        const ms = document.getElementById('main-story-page');
        if (ms && !ms.classList.contains('hidden')) return true;
        return false;
    }

    function nextCooldownMs() {
        return MIN_COOLDOWN_MS + Math.floor(Math.random() * JITTER_MS);
    }

    function injectStyles() {
        if (document.getElementById('ew-styles')) return;
        const s = document.createElement('style');
        s.id = 'ew-styles';
        s.textContent = `
            #ew-whisper {
                position: fixed;
                top: 68px;
                left: 50%;
                transform: translateX(-50%) translateY(-10px);
                max-width: 86vw;
                padding: 10px 18px;
                font-family: inherit;
                font-style: italic;
                font-size: 14px;
                line-height: 1.4;
                color: #f3d8ff;
                background: linear-gradient(180deg, rgba(20,6,35,0.82), rgba(40,10,55,0.70));
                border: 1px solid rgba(190, 120, 220, 0.35);
                border-radius: 14px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.45), 0 0 18px rgba(180, 90, 220, 0.22) inset;
                text-align: center;
                letter-spacing: 0.3px;
                text-shadow: 0 0 8px rgba(210, 140, 240, 0.35);
                opacity: 0;
                pointer-events: auto;
                z-index: 9000;
                transition: opacity 520ms ease, transform 520ms ease;
                cursor: pointer;
                user-select: none;
            }
            #ew-whisper.ew-show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            #ew-whisper::before {
                content: '';
                position: absolute;
                inset: -1px;
                border-radius: 14px;
                background: linear-gradient(90deg, transparent, rgba(200,130,240,0.25), transparent);
                pointer-events: none;
                opacity: 0.6;
                animation: ewShimmer 3.2s ease-in-out infinite;
            }
            @keyframes ewShimmer {
                0%, 100% { opacity: 0.25; }
                50%      { opacity: 0.6; }
            }
        `;
        document.head.appendChild(s);
    }

    function pickLine() {
        let idx = parseInt(localStorage.getItem(STORAGE_IDX) || '0', 10);
        if (isNaN(idx) || idx < 0) idx = 0;
        const line = LINES[idx % LINES.length];
        localStorage.setItem(STORAGE_IDX, String(idx + 1));
        return line;
    }

    let showing = false;

    function showWhisper(line) {
        if (showing) return;
        showing = true;
        injectStyles();

        const el = document.createElement('div');
        el.id = 'ew-whisper';
        el.textContent = line;
        document.body.appendChild(el);

        // force reflow then animate in
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight;
        el.classList.add('ew-show');

        let autoCloseId = setTimeout(close, 6200);

        function close() {
            clearTimeout(autoCloseId);
            el.classList.remove('ew-show');
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
                showing = false;
            }, 560);
        }

        el.addEventListener('click', close, { once: true });
        el.addEventListener('touchstart', close, { once: true, passive: true });

        localStorage.setItem(STORAGE_LAST, String(Date.now()));
    }

    function tick() {
        if (noirMet())       return; // permanently off
        if (!playerStarted()) return;
        if (sceneActive())    return;
        if (showing)          return;
        // First-care-session quiet window — let the greeting + first-action
        // hint own the screen before atmospheric whispers start layering in.
        if (window.PPAmbient && window.PPAmbient.firstCareSession && window.PPAmbient.firstCareSession()) return;
        if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) return;
        // Don't talk over an active typewriter line.
        const g = window._game;
        if (g && g.typewriter && typeof g.typewriter.busy === 'function' && g.typewriter.busy()) return;

        const last = parseInt(localStorage.getItem(STORAGE_LAST) || '0', 10);
        const now  = Date.now();
        if (now - last < nextCooldownMs()) return;

        showWhisper(pickLine());
    }

    // Boot after a grace period so we never step on a prologue/intro.
    function boot() {
        setTimeout(function loop() {
            tick();
            if (!noirMet()) setTimeout(loop, POLL_MS);
        }, FIRST_DELAY_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    // Debug: force-fire on demand.
    window.EarlyWhispers = {
        force() { showWhisper(pickLine()); },
        reset() {
            localStorage.removeItem(STORAGE_LAST);
            localStorage.removeItem(STORAGE_IDX);
        },
        isOff() { return noirMet(); }
    };
})();
