/* world-arrival.js — the prologue chain's opening scene
 * ============================================================================
 *   The Weaver wakes face-down in moss. South Thornwood. No memory of how.
 *   Cloak soaked. A torn page in her hand with the Aethermoor seal she has
 *   never seen before.
 *
 *   This scene plays once, on a fresh save where pp_chain_step = 0 and
 *   pp_chain_skipped is not set. It ends by calling the Alistair bridge so
 *   the rescue follows immediately while the player is still in the moment.
 * ============================================================================
 */

(function () {
  'use strict';

  const FLAG_PLAYED = 'pp_arrival_played';

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  function injectStyles() {
    if (document.getElementById('pp-bridge-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-bridge-styles';
    s.textContent = `
      .pp-bridge-root {
        position:fixed; inset:0; z-index:10200;
        background:#06030f; color:#ece2f6;
        display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        opacity:0; transition:opacity 700ms ease;
        font-family:inherit;
        overflow:hidden;
      }
      .pp-bridge-root.show { opacity:1; }
      .pp-bridge-bg {
        position:absolute; inset:0;
        background-position:center; background-size:cover;
        opacity:0; transition:opacity 1100ms ease;
      }
      .pp-bridge-root.show .pp-bridge-bg { opacity:0.55; }
      .pp-bridge-vignette {
        position:absolute; inset:0;
        background:radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.85) 100%);
        pointer-events:none;
      }
      .pp-bridge-stage {
        position:relative; z-index:2;
        width:92%; max-width:560px;
        display:flex; flex-direction:column;
        align-items:center; gap:18px;
        padding:24px 18px;
      }
      .pp-bridge-portrait {
        width:240px; max-width:64vw; height:auto;
        opacity:0; transform:translateY(14px) scale(0.97);
        transition:opacity 900ms ease, transform 900ms cubic-bezier(.2,.8,.2,1);
        filter: drop-shadow(0 12px 24px rgba(0,0,0,0.55));
      }
      .pp-bridge-portrait.show { opacity:1; transform:translateY(0) scale(1); }
      .pp-bridge-direction {
        font-size:13.5px; line-height:1.55; color:#c8b9e0;
        font-style:italic; text-align:center;
        max-width:96%;
        opacity:0; transition:opacity 600ms ease;
      }
      .pp-bridge-direction.show { opacity:1; }
      .pp-bridge-line {
        font-size:15.5px; line-height:1.5; color:#fff8ff;
        text-align:center; font-weight:500;
        background:linear-gradient(180deg, rgba(28,18,52,0.85), rgba(18,10,38,0.78));
        border:1px solid rgba(190,150,235,0.30);
        border-radius:14px;
        padding:12px 16px;
        max-width:96%;
        opacity:0; transition:opacity 540ms ease;
        box-shadow:0 8px 22px rgba(0,0,0,0.5), 0 0 16px rgba(180,140,220,0.18) inset;
      }
      .pp-bridge-line.show { opacity:1; }
      .pp-bridge-line .pp-speaker {
        display:block; font-size:11.5px; letter-spacing:1.5px;
        color:#ffd8ec; font-weight:700; margin-bottom:6px; opacity:0.9;
      }
      .pp-bridge-cta {
        margin-top:10px;
        background:linear-gradient(180deg, #6a4ec0, #4d3796);
        color:#fff; border:1px solid rgba(255,255,255,0.18);
        border-radius:12px; padding:10px 20px;
        font-size:14px; font-weight:600;
        cursor:pointer; user-select:none;
        opacity:0; transition:opacity 520ms ease, transform 220ms ease;
        box-shadow:0 6px 16px rgba(0,0,0,0.45);
      }
      .pp-bridge-cta.show { opacity:1; }
      .pp-bridge-cta:hover { transform:translateY(-1px); }
      .pp-bridge-skip {
        position:absolute; top:14px; right:18px; z-index:3;
        font-size:11.5px; color:#a89bc4; opacity:0.6;
        cursor:pointer; user-select:none;
        background:transparent; border:none; padding:6px 10px;
      }
      .pp-bridge-skip:hover { opacity:1; }
      .pp-bridge-tap-hint {
        position:absolute; bottom:18px; right:22px; z-index:3;
        font-size:11.5px; color:#c8b9e0; opacity:0;
        letter-spacing:1.4px; pointer-events:none;
        font-style:italic;
        transition:opacity 600ms ease;
        animation: pp-bridge-pulse 1.6s ease-in-out infinite;
      }
      .pp-bridge-root.show .pp-bridge-tap-hint { opacity:0.55; }
      .pp-bridge-root.cta-mode .pp-bridge-tap-hint { display:none; }
      @keyframes pp-bridge-pulse {
        0%, 100% { transform: translateX(0); }
        50%      { transform: translateX(4px); }
      }
      @keyframes pp-bridge-rain {
        from { background-position: 0 0; }
        to   { background-position: 80px 200px; }
      }
      .pp-bridge-rain-overlay {
        position:absolute; inset:0; pointer-events:none;
        background:
          repeating-linear-gradient(120deg,
            rgba(180,200,230,0.05) 0,
            rgba(180,200,230,0.05) 1px,
            transparent 1px,
            transparent 5px);
        animation: pp-bridge-rain 1.4s linear infinite;
        opacity:0.5;
      }
    `;
    document.head.appendChild(s);
  }

  // The arrival's beats. Background gradient simulates dripping moss + dawn.
  const BEATS = [
    {
      direction: 'You wake face-down in moss. The smell is wet bark and last night\u2019s rain. Your cloak is soaked through.',
      portrait: null
    },
    {
      direction: 'You do not remember falling. You do not remember choosing this place. You do not remember the place before this place.',
      portrait: null
    },
    {
      direction: 'There is a torn page in your hand. The seal on it is unfamiliar. Two crossed branches and a moon. Your fingers know the shape. You do not know why.',
      portrait: null
    },
    {
      direction: 'Somewhere through the trees, far off, a horn sounds twice. Patrol. The kind of horn that means a kingdom is awake and watching.',
      portrait: null
    },
    {
      direction: 'You try to stand. The world tilts. The moss tilts with you. You go down again, slowly, the way a candle goes out.',
      portrait: null
    },
    {
      direction: 'Hooves. Slow ones. A man\u2019s footsteps. A voice — calm, exact, low — saying a word you do not catch.',
      portrait: null
    }
  ];

  let _root = null;
  let _resolveDone = null;

  async function play(opts) {
    if (_root) return; // one at a time
    injectStyles();
    return new Promise((resolve) => {
      _resolveDone = resolve;
      _root = document.createElement('div');
      _root.className = 'pp-bridge-root';
      _root.innerHTML = `
        <div class="pp-bridge-bg" style="background:radial-gradient(ellipse at 60% 40%, #1a2230 0%, #06080f 80%);"></div>
        <div class="pp-bridge-rain-overlay"></div>
        <div class="pp-bridge-vignette"></div>
        <button class="pp-bridge-skip" data-skip>Skip ›</button>
        <div class="pp-bridge-stage">
          <div class="pp-bridge-direction"></div>
          <div class="pp-bridge-line" style="display:none;"></div>
          <button class="pp-bridge-cta" style="display:none;">Continue</button>
        </div>
        <div class="pp-bridge-tap-hint">tap to continue \u203A</div>
      `;
      document.body.appendChild(_root);
      _root.querySelector('[data-skip]').addEventListener('click', skip);
      // eslint-disable-next-line no-unused-expressions
      _root.offsetHeight;
      _root.classList.add('show');
      runBeats();
    });
  }

  async function runBeats() {
    const dir = _root.querySelector('.pp-bridge-direction');
    for (const b of BEATS) {
      dir.classList.remove('show');
      await wait(380);
      dir.textContent = b.direction;
      dir.classList.add('show');
      await waitForTap();
    }
    // Final hand-off: a short bit of dialogue from the man, then continue.
    showLine('A MAN\u2019S VOICE',
      "\u2014 alright. You are alright. Do not move. I have you.");
    await waitForTap();
    _root.classList.add('cta-mode');
    showCTA('Continue');
  }

  function showLine(speaker, text) {
    const line = _root.querySelector('.pp-bridge-line');
    line.style.display = '';
    line.innerHTML = `<span class="pp-speaker">${speaker}</span>${text}`;
    // eslint-disable-next-line no-unused-expressions
    line.offsetHeight;
    line.classList.add('show');
  }
  function showCTA(label) {
    const cta = _root.querySelector('.pp-bridge-cta');
    cta.style.display = '';
    cta.textContent = label;
    // eslint-disable-next-line no-unused-expressions
    cta.offsetHeight;
    cta.classList.add('show');
    cta.addEventListener('click', finish, { once: true });
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  // Tap-only — no auto-advance. Slow readers can take their time.
  function waitForTap() {
    return new Promise((resolve) => {
      let done = false;
      const handler = (e) => {
        if (e.target.closest && e.target.closest('.pp-bridge-cta, [data-skip]')) return;
        if (done) return; done = true; cleanup(); resolve();
      };
      _root.addEventListener('click', handler, true);
      function cleanup() { _root.removeEventListener('click', handler, true); }
    });
  }

  function skip() { finish(); }
  function finish() {
    if (!_root) return;
    lsSet(FLAG_PLAYED, '1');
    // NOTE: we no longer set pp_world_intro_seen here. The unified flow is:
    //   1. Old world intro (game.js, "Kingdom of Aethermoor is dying...")
    //   2. Arrival (this scene)
    //   3. Bridge 1 (Alistair) etc.
    // The old world intro sets pp_world_intro_seen itself when it finishes,
    // BEFORE arrival fires. Arrival doesn't suppress it.
    _root.classList.remove('show');
    setTimeout(() => {
      if (_root && _root.parentNode) _root.parentNode.removeChild(_root);
      _root = null;
      // Hand off to Alistair bridge immediately.
      if (window.PPBridgeAlistair && typeof window.PPBridgeAlistair.play === 'function') {
        window.PPBridgeAlistair.play();
      }
      if (_resolveDone) { _resolveDone(); _resolveDone = null; }
    }, 700);
  }

  window.PPWorldArrival = { play };
})();
