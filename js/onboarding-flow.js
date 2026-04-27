/* onboarding-flow.js \u2014 the first ten minutes guided tour
 * ============================================================================
 * WHY THIS EXISTS:
 *   A fresh player who installs Pocket Paramour will hit two parallel modes
 *   (Tamagotchi care loop + Main Story route), seven characters with no
 *   guidance on who to pick, and ambiguous goals. They might tap around for
 *   ten minutes, never realise they are a Weaver, never open the Main Story,
 *   and uninstall.
 *
 *   This module fills that hole with a soft, four-card guided tour. It runs
 *   ONCE, only for fresh players, and writes pp_onboarding_complete = '1'
 *   so it never replays.
 *
 * WHEN IT FIRES:
 *   - First time the character-select grid is visible AND
 *   - pp_onboarding_complete is not '1' AND
 *   - World intro has played (pp_world_intro_seen = '1' OR title is dismissed) AND
 *   - 800ms have passed since the select screen rendered (so it does not
 *     compete with the world intro)
 *
 *   It also auto-disables once the player picks a character \u2014 no point
 *   replaying it after they have made their first choice.
 *
 * WHAT IT DOES:
 *   Four lightweight cards in sequence (player taps to advance):
 *     1. "You are the Seventh Soul Weaver." (the identity reveal)
 *     2. "Your bonds are the kingdom's magic." (the mechanic)
 *     3. "Care for one, every day. Open the Main Story when you are ready."
 *        (the two-mode explainer)
 *     4. "Choose anyone. They will all notice you." (permission to start)
 *
 *   Each card is a soft overlay, not blocking. The player can dismiss with
 *   a "skip the tour" link in the corner.
 *
 * SAFETY CONTRACT:
 *   Additive. No edits to other files. Self-disables once flag is set.
 *   Never runs if pp_dev_panel = '1' (don't get in the dev's way).
 * ============================================================================
 */

(function () {
  'use strict';

  const FLAG_DONE     = 'pp_onboarding_complete';
  const FLAG_DEV      = 'pp_dev_panel';
  const FLAG_INTRO    = 'pp_world_intro_seen';
  const POLL_MS       = 1500;
  const FIRST_DELAY_MS = 1500;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  function shouldFire() {
    if (lsGet(FLAG_DONE) === '1') return false;
    if (lsGet(FLAG_DEV) === '1') return false;
    // Don't compete with any active chain transition.
    if (document.body.classList.contains('pp-chain-in-progress')) return false;
    // Don't compete with any open scene/overlay.
    if (document.querySelector('#mscard-root')) return false;
    if (document.querySelector('#letter-overlay:not(.hidden)')) return false;
    if (document.querySelector('#ms-encounter-root')) return false;
    if (document.querySelector('#chp-page')) return false;
    // CRITICAL: don't fire if the player is already in the care game
    // (game-container visible). Onboarding is "BEFORE YOU PICK" — once they
    // have picked a character and started caring, this card is irrelevant
    // and feels like an interruption.
    const game = document.getElementById('game-container');
    if (game && !game.classList.contains('hidden')) {
      const gcs = window.getComputedStyle ? window.getComputedStyle(game) : null;
      if (!gcs || (gcs.display !== 'none' && gcs.visibility !== 'hidden')) {
        return false;
      }
    }
    // Only show on the select screen
    const grid = document.getElementById('select-screen');
    if (!grid || grid.classList.contains('hidden')) return false;
    // Verify select-screen is actually visible (not just present in DOM).
    const cs = window.getComputedStyle ? window.getComputedStyle(grid) : null;
    if (cs && (cs.visibility === 'hidden' || cs.display === 'none')) return false;
    // Don't compete with the title screen
    const title = document.getElementById('title-screen');
    if (title && !title.classList.contains('hidden')) return false;
    return true;
  }

  // --- Card content --------------------------------------------------------
  const CARDS = [
    {
      eyebrow: '\u2014 BEFORE YOU PICK \u2014',
      title: 'You are the Seventh Weaver.',
      body: [
        'A soul who arrived in Aethermoor without memory.',
        'Your gift is rare. Six of your kind came before you.',
        'None survived. The kingdom has been waiting for you.'
      ]
    },
    {
      eyebrow: '\u2014 YOUR POWER \u2014',
      title: 'Your bonds are the kingdom\u2019s magic.',
      body: [
        'Every connection you form lights a ward in the kingdom.',
        'You can love many. That is not a flaw. It is the gift.',
        'Each of the seven below is a different colour of thread in your weave.'
      ]
    },
    {
      eyebrow: '\u2014 HOW TO PLAY \u2014',
      title: 'Two ways to spend time here.',
      body: [
        'Pick anyone and care for them daily. Feed, talk, listen.',
        'When you are ready for the bigger story, open the Main Story (pink chip, lower-left).',
        'Both unlock together. Take it slow. They notice everything.'
      ]
    },
    {
      eyebrow: '\u2014 BEGIN \u2014',
      title: 'Choose anyone. They have all been waiting.',
      body: [
        'You can come back to the others later.',
        'No wrong answer here. Only thread.'
      ]
    }
  ];

  // --- Build / show --------------------------------------------------------
  let _running = false;
  let _idx = 0;
  let _root = null;

  function injectStyles() {
    if (document.getElementById('pp-onboarding-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-onboarding-styles';
    s.textContent = `
      #pp-onboarding-overlay {
        position:fixed; inset:0; z-index:9700;
        background:radial-gradient(ellipse at center, rgba(20,12,38,0.92) 0%, rgba(6,4,14,0.96) 80%);
        backdrop-filter:blur(6px);
        display:flex; align-items:center; justify-content:center;
        padding:24px;
        opacity:0; transition:opacity 600ms ease;
        font-family:inherit; color:#f0e4ff;
      }
      #pp-onboarding-overlay.show { opacity:1; }
      #pp-onboarding-overlay:not(.show) { pointer-events:none; }
      #pp-onboarding-card {
        max-width:420px; width:100%;
        background:linear-gradient(180deg, rgba(38,24,68,0.95), rgba(20,12,40,0.95));
        border:1px solid rgba(200,170,255,0.25);
        border-radius:22px; padding:28px 24px;
        box-shadow:0 20px 50px rgba(0,0,0,0.55);
        text-align:center;
        transform:translateY(20px) scale(0.98);
        transition:transform 600ms cubic-bezier(.2,.8,.2,1);
      }
      #pp-onboarding-overlay.show #pp-onboarding-card {
        transform:translateY(0) scale(1);
      }
      .pp-on-eyebrow {
        font-size:11px; letter-spacing:3px; opacity:0.65;
        margin-bottom:10px;
      }
      .pp-on-title {
        font-size:22px; font-weight:700; line-height:1.3;
        margin-bottom:14px; color:#fbeeff;
      }
      .pp-on-body {
        font-size:14px; line-height:1.5; color:#dac8ec;
      }
      .pp-on-body p { margin:6px 0; }
      .pp-on-actions {
        margin-top:22px; display:flex; align-items:center; justify-content:space-between;
      }
      .pp-on-skip {
        font-size:12px; color:#9988ba; cursor:pointer; opacity:0.7;
        background:none; border:0; padding:0;
      }
      .pp-on-skip:hover { opacity:1; }
      .pp-on-next {
        background:linear-gradient(180deg,#7b5fb0,#5b3f8a);
        color:#fff; font-size:14px; font-weight:600;
        border:0; border-radius:14px;
        padding:10px 24px; cursor:pointer;
        box-shadow:0 4px 14px rgba(120,80,200,0.4);
      }
      .pp-on-dots {
        margin-top:14px; display:flex; gap:6px; justify-content:center;
      }
      .pp-on-dot {
        width:6px; height:6px; border-radius:50%;
        background:rgba(200,180,240,0.25);
        transition:background 280ms ease;
      }
      .pp-on-dot.active { background:#d8c0ff; }
    `;
    document.head.appendChild(s);
  }

  function renderCard(idx) {
    if (!_root) return;
    const card = _root.querySelector('#pp-onboarding-card');
    if (!card) return;
    const c = CARDS[idx];
    card.innerHTML = '';
    if (c.eyebrow) {
      const eb = document.createElement('div'); eb.className = 'pp-on-eyebrow';
      eb.textContent = c.eyebrow; card.appendChild(eb);
    }
    const t = document.createElement('div'); t.className = 'pp-on-title';
    t.textContent = c.title; card.appendChild(t);
    const b = document.createElement('div'); b.className = 'pp-on-body';
    c.body.forEach(line => { const p = document.createElement('p'); p.textContent = line; b.appendChild(p); });
    card.appendChild(b);

    const actions = document.createElement('div'); actions.className = 'pp-on-actions';
    const skip = document.createElement('button'); skip.className = 'pp-on-skip';
    skip.textContent = 'Skip the tour';
    skip.addEventListener('click', complete);
    actions.appendChild(skip);

    const next = document.createElement('button'); next.className = 'pp-on-next';
    next.textContent = idx === CARDS.length - 1 ? 'Begin' : 'Continue';
    next.addEventListener('click', () => {
      if (idx === CARDS.length - 1) complete();
      else { _idx++; renderCard(_idx); }
    });
    actions.appendChild(next);
    card.appendChild(actions);

    const dots = document.createElement('div'); dots.className = 'pp-on-dots';
    for (let i = 0; i < CARDS.length; i++) {
      const d = document.createElement('div'); d.className = 'pp-on-dot' + (i === idx ? ' active' : '');
      dots.appendChild(d);
    }
    card.appendChild(dots);
  }

  function show() {
    if (_running) return;
    _running = true;
    injectStyles();

    _root = document.createElement('div');
    _root.id = 'pp-onboarding-overlay';
    const card = document.createElement('div');
    card.id = 'pp-onboarding-card';
    _root.appendChild(card);
    document.body.appendChild(_root);

    requestAnimationFrame(() => _root.classList.add('show'));
    _idx = 0;
    renderCard(0);
  }

  function complete() {
    lsSet(FLAG_DONE, '1');
    if (_root) {
      _root.classList.remove('show');
      setTimeout(() => { try { _root.remove(); } catch (_) {} _root = null; }, 600);
    }
    _running = false;
  }

  // Listen for first character-card click \u2014 mark complete (in case they
  // skipped via the link or just dove in).
  function watchSelectGrid() {
    document.addEventListener('click', (e) => {
      const card = e.target && e.target.closest && e.target.closest('.select-card');
      if (card) lsSet(FLAG_DONE, '1');
    }, true);
  }

  // --- Boot ----------------------------------------------------------------
  function boot() {
    watchSelectGrid();
    setTimeout(() => {
      const tick = () => {
        if (lsGet(FLAG_DONE) === '1') return;
        if (shouldFire()) { show(); return; }
        setTimeout(tick, POLL_MS);
      };
      tick();
    }, FIRST_DELAY_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // Debug
  window.PPOnboarding = {
    show, complete,
    reset: () => { try { localStorage.removeItem(FLAG_DONE); } catch (_) {} },
    isComplete: () => lsGet(FLAG_DONE) === '1'
  };
})();
