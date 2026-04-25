/* aenor-presence.js \u2014 ambient dread, before the queen ever appears
 * ============================================================================
 * WHY THIS EXISTS:
 *   Aenor is the antagonist. She had three named scenes (Ch 11 Tower Mirror,
 *   Ch 13 Dowager, Lucien-Aenor crossover). For a main villain, that is thin.
 *   Real terror needs AMBIENT presence \u2014 the way Sauron is felt in the Shire
 *   long before he is ever seen.
 *
 *   This module surfaces 1\u20132 quiet "she is watching" lines per session in
 *   the player's daily care loop. Pre-Ch 6 (before Noir is met): nothing.
 *   Post-Ch 6: rare, small. Post-Ch 13 (Aenor has actively arrived): more
 *   frequent and more direct.
 *
 *   The lines never break the fourth wall, never name her directly until
 *   late, never block gameplay. They are GHOST LINES \u2014 the kind of thing
 *   you'd notice on a second playthrough and realise was a warning.
 *
 * SAFETY CONTRACT:
 *   Additive. Cooperates with the ambient-coordinator (waits for clear DOM
 *   slot). Never fires during scenes/overlays/intros. Self-disables if
 *   any other ambient bubble is already showing.
 * ============================================================================
 */

(function () {
  'use strict';

  const FLAG_ROUTE   = 'pp_main_story_enabled';
  const FLAG_CH6     = 'pp_chapter_done_6';
  const FLAG_CH13    = 'pp_chapter_done_13';
  const FLAG_LAST    = 'pp_aenor_presence_last';
  const POLL_MS      = 30 * 1000;          // probe every 30s
  const COOLDOWN_MS  = 8 * 60 * 1000;      // at least 8 min between fires
  const FIRST_DELAY_MS = 90 * 1000;        // grace period at session start

  // Tier 1: post-Ch6, pre-Ch13. Subtle. Could be wind. Could be paranoia.
  const TIER1 = [
    'A draft moves through the room. The candle flinches. There was no door open.',
    'You feel watched for a moment. Not unkindly. Not warmly either. Then it passes.',
    'A clock somewhere outside the building ticks one beat off. You almost ask the character if they heard it.',
    'The character\u2019s gaze drifts past you, briefly. They look at something behind you. Then they look back. They do not mention it.',
    'A shadow on the wall is the wrong shape for a moment. You blink. It is a normal shadow again.',
    'The room is one degree colder than it was. The character does not seem to notice. You do.',
    'A bird outside the window does not sing. It just sits there. Watching.'
  ];

  // Tier 2: post-Ch13. Aenor is actively walking. The pretence drops.
  const TIER2 = [
    'The tea has gone cold faster than tea normally goes cold. The character notices this time. They do not say anything.',
    'A servant passed in the corridor, paused, and walked the wrong way. The corridor leads nowhere now.',
    'You feel the dowager think about you. Briefly. The way you might think of a name you are about to write down.',
    'The candle flame leans toward the door, away from any draft, for three full seconds. Then it forgets it was doing that.',
    'A raven landed on the windowsill. It did not knock against the glass. It just looked. Then it left.',
    'Your reflection is half a heartbeat behind you in the glass. Then it catches up. Then you stop looking.',
    'Somewhere in the east wing, an old woman sets her cane down with very deliberate care. You do not know how you know.'
  ];

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }
  function noirMet() { return lsGet(FLAG_CH6) === '1' || lsGet('pp_ms_encounter_noir_seen') === '1'; }
  function aenorArrived() { return lsGet(FLAG_CH13) === '1'; }

  function ambientBusy() {
    if (window.PPAmbient && typeof window.PPAmbient.busy === 'function') {
      return window.PPAmbient.busy();
    }
    return !!document.querySelector('#cc-bubble, #noir-whisper, #ew-whisper, #adaptive-thought');
  }

  function sceneActive() {
    return !!document.querySelector([
      '#mscard-root','#tp-root','#chp-page','#ms-encounter-root',
      '#mg-overlay','#mon-bundle-back','#settings-overlay:not(.hidden)',
      '#cinematic-overlay.visible','#event-overlay:not(.hidden)',
      '#gift-panel:not(.hidden)','#training-panel:not(.hidden)',
      '#dress-panel:not(.hidden)','#story-overlay:not(.hidden)',
      '#world-intro:not(.hidden)','#main-story-page:not(.hidden)',
      '#pp-onboarding-overlay'
    ].join(','));
  }

  function inCooldown() {
    const last = parseInt(lsGet(FLAG_LAST) || '0', 10) || 0;
    return Date.now() - last < COOLDOWN_MS;
  }

  function pickLine() {
    const pool = aenorArrived() ? TIER2 : TIER1;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // --- Render --------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('pp-aenor-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-aenor-styles';
    s.textContent = `
      #pp-aenor-bubble {
        position:fixed; top:80px; left:50%;
        transform:translateX(-50%) translateY(-12px);
        max-width:86vw; padding:11px 18px;
        font-family:inherit; font-size:13px; line-height:1.45;
        color:#e8d2cc; font-style:italic;
        background:linear-gradient(180deg, rgba(28,16,14,0.88), rgba(48,18,22,0.78));
        border:1px solid rgba(190,80,80,0.30);
        border-radius:14px;
        box-shadow:0 8px 24px rgba(0,0,0,0.55), 0 0 18px rgba(180,40,60,0.18) inset;
        text-align:center; letter-spacing:0.3px;
        opacity:0; pointer-events:auto;
        z-index:9000;
        transition:opacity 540ms ease, transform 540ms ease;
        cursor:pointer; user-select:none;
      }
      #pp-aenor-bubble.show {
        opacity:1; transform:translateX(-50%) translateY(0);
      }
    `;
    document.head.appendChild(s);
  }

  let _showing = false;
  function show(line) {
    if (_showing) return;
    _showing = true;
    injectStyles();

    const el = document.createElement('div');
    el.id = 'pp-aenor-bubble';
    el.textContent = line;
    document.body.appendChild(el);

    // eslint-disable-next-line no-unused-expressions
    el.offsetHeight;
    el.classList.add('show');

    let auto = setTimeout(close, 6800);
    function close() {
      clearTimeout(auto);
      el.classList.remove('show');
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
        _showing = false;
      }, 580);
    }
    el.addEventListener('click', close, { once: true });
    el.addEventListener('touchstart', close, { once: true, passive: true });

    lsSet(FLAG_LAST, String(Date.now()));
  }

  // --- Boot ----------------------------------------------------------------
  function tick() {
    if (!routeEnabled()) return;
    if (!noirMet()) return; // pre-Ch6: silent
    if (_showing) return;
    if (sceneActive()) return;
    if (ambientBusy()) return;
    if (inCooldown()) return;
    show(pickLine());
  }

  function boot() {
    setTimeout(() => {
      tick();
      setInterval(tick, POLL_MS);
    }, FIRST_DELAY_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // Debug
  window.PPAenorPresence = {
    force() { show(pickLine()); },
    reset() { try { localStorage.removeItem(FLAG_LAST); } catch (_) {} }
  };
})();
