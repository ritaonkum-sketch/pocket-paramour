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

    // ── DISABLED (owner request, Jul 2026) ───────────────────────────────
    // The mysterious "voice in the wall" / unattributed-whisper feature is
    // REMOVED from every character's care route. It read as an intrusion on
    // the calm care screen. Kept as an inert no-op (rather than deleted) so it
    // can be revived later if wanted — nothing below runs: no styles, no
    // timers, no listeners, and #ew-whisper is never created. This was the
    // ONLY live source of that whisper (the referenced "noir-whispers.js"
    // sibling was never built), so no other file needs to change.
    window.EarlyWhispers = { force: function () {}, reset: function () {}, isOff: function () { return true; } };
    return;

    // ---- original implementation retained below, permanently inert ----

    // Pool of unattributed whispers. Ordered so the first ones are curious,
    // later ones grow more specific — mirroring the player's investment curve.
    // Jun 2026 — owner asked for attribution so the player isn't left
    // guessing where the voice came from. The "from" field is small italic
    // label rendered below each line. Most lines stay anonymous ("a voice
    // in the wall", "something listening") to preserve the mystery; later
    // lines start to hint at the source. Noir's identity is revealed in
    // Chapter 6 — after that, early-whispers self-disables and Noir's
    // own whisper system takes over.
    const LINES = [
        { text: "You weren’t supposed to make it this far.",                                from: "a voice in the wall" },
        { text: "Careful. Something is listening.",                                          from: "a voice you don’t recognise" },
        { text: "Keep going. I find you interesting.",                                       from: "someone, somewhere" },
        { text: "Don’t tell anyone about this feeling yet.",                                  from: "a voice in the wall" },
        { text: "Someone has been watching you sleep.",                                       from: "a voice you don’t recognise" },
        { text: "The wind tastes different tonight. Did you notice?",                         from: "the wind, almost" },
        { text: "You’re the first thing in a long time worth remembering.",                   from: "someone older than the kingdom" },
        { text: "Turn around. Slowly. No. I’m joking. Not yet.",                              from: "someone behind the door" },
        { text: "Every choice you make, a bell rings somewhere far away.",                    from: "someone older than the kingdom" },
        { text: "If you stop now, I will have to find you.",                                  from: "someone behind the door" },
        { text: "Whoever you love, love them honestly. It matters more than you think.",      from: "the dark, gentler than expected" },
        { text: "A door that was closed for a hundred years just creaked open.",              from: "the dark, gentler than expected" }
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
        // Jun 2026 — canonical scene-state gate. The whisper is a
        // care-loop atmospheric effect; it must never fire outside the
        // care scene. PPScene.get() is the single source of truth set
        // by scene-state.js. The legacy DOM checks below are kept as
        // belt-and-braces for the title→care transition window where
        // PPScene may briefly be null.
        if (window.PPScene && typeof window.PPScene.get === 'function') {
            if (window.PPScene.get() !== 'care') return true;
        }
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
            #ew-whisper .ew-line {
                font-size: 14px; line-height: 1.4;
            }
            #ew-whisper .ew-from {
                position: relative;
                margin-top: 8px;
                padding-top: 6px;
                font-size: 10px;
                font-style: italic;
                font-weight: 400;
                letter-spacing: 0.4px;
                color: rgba(243, 216, 255, 0.62);
                text-shadow: none;
            }
            /* Quiet rose-gold hairline above the attribution.
               Replaces the em-dash prefix per brand voice rule. */
            #ew-whisper .ew-from::before {
                content: '';
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 28px;
                height: 1px;
                background: linear-gradient(90deg,
                    transparent, rgba(212, 168, 91, 0.5), transparent);
            }
            /* No "tap to dismiss" label — owner direction Jun 2026.
               The whisper reads as a presence, not a UI element. The
               cursor:pointer + the shimmer animation already signal
               interactivity; an explicit label breaks the mood. */
        `;
        document.head.appendChild(s);
    }

    function pickLine() {
        let idx = parseInt(localStorage.getItem(STORAGE_IDX) || '0', 10);
        if (isNaN(idx) || idx < 0) idx = 0;
        const entry = LINES[idx % LINES.length];
        localStorage.setItem(STORAGE_IDX, String(idx + 1));
        return entry;
    }

    let showing = false;

    function showWhisper(entry) {
        if (showing) return;
        showing = true;
        injectStyles();

        const el = document.createElement('div');
        el.id = 'ew-whisper';
        // Jun 2026 — owner asked for attribution. Each whisper now
        // shows a small italic line below the text so the player isn't
        // guessing where the voice came from. No em-dash prefix per
        // brand voice rule (em-dashes read AI-generated); italic +
        // smaller + lower-opacity styling carries the attribution feel
        // on its own, plus a CSS pseudo-hairline as a quiet separator.
        const lineEl = document.createElement('div');
        lineEl.className = 'ew-line';
        lineEl.textContent = entry.text || entry;  // tolerate raw strings (legacy callers)
        const fromEl = document.createElement('div');
        fromEl.className = 'ew-from';
        fromEl.textContent = entry.from || 'a voice';
        el.appendChild(lineEl);
        el.appendChild(fromEl);
        document.body.appendChild(el);

        // force reflow then animate in
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight;
        el.classList.add('ew-show');

        // Jun 2026 — owner asked for the whisper to PERSIST until the
        // player taps it. No auto-close timer. The tap handler below
        // still wires click/touchstart for dismissal.

        function close() {
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
