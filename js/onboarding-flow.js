/* onboarding-flow.js.the first ten minutes guided tour
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
 *   It also auto-disables once the player picks a character.no point
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
 * ============================================================================
 */

(function () {
  'use strict';

  const FLAG_DONE     = 'pp_onboarding_complete';
  const FLAG_INTRO    = 'pp_world_intro_seen';
  const POLL_MS       = 1500;
  const FIRST_DELAY_MS = 1500;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  function shouldFire() {
    if (lsGet(FLAG_DONE) === '1') return false;
    // TIMING: fires after Bridge Alistair + Chapter 1 are done, when the
    // player first lands back on the select grid. The auto-chain pushes
    // straight from world intro → Arrival → Bridge Alistair → Chapter 1
    // without ever pausing on the blank select grid.so the old "step
    // must be 0" gate meant onboarding never fired in normal play. The
    // new gate allows step 1 (Alistair done) but bails at step 2+ (player
    // has met a second character.onboarding moment has passed).
    try {
      const step = parseInt(lsGet('pp_chain_step') || '0', 10);
      if (step >= 2) { lsSet(FLAG_DONE, '1'); return false; }
    } catch (_) {}
    try {
      // Chapter 2+ done means the player has met a second character —
      // past onboarding territory.
      for (let i = 2; i <= 8; i++) {
        if (lsGet('pp_chapter_done_' + i) === '1') { lsSet(FLAG_DONE, '1'); return false; }
      }
      // Any bridge OTHER than Alistair done means same. Bridge Alistair
      // happens automatically right after Arrival, so it being done is
      // expected by the time we want to fire onboarding.
      const bridges = ['elian','lyra','caspian','lucien','noir','proto'];
      for (const b of bridges) {
        if (lsGet('pp_chapter_done_b_' + b) === '1') { lsSet(FLAG_DONE, '1'); return false; }
      }
    } catch (_) {}
    // Don't compete with any active chain transition.
    if (document.body.classList.contains('pp-chain-in-progress')) return false;
    // Jul 2026 playtest fix — the tour was racing the care-entry
    // transition (select still technically visible, game-container not
    // yet un-hidden) and mounting ON TOP of the in-fiction character
    // intro. Never fire mid-transition, never fire once the player is
    // in (or heading into) care, and always defer to the other two
    // tutorial surfaces (character intro + care guide).
    if (document.body.classList.contains('cinematic-transition')) return false;
    if (document.body.classList.contains('pp-screen-care')) return false;
    if (document.querySelector('#intro-overlay.visible')) return false;
    if (document.getElementById('pp-aci-backdrop')) return false;
    // Don't compete with any open scene/overlay.
    if (document.querySelector('#mscard-root')) return false;
    if (document.querySelector('#letter-overlay:not(.hidden)')) return false;
    if (document.querySelector('#ms-encounter-root')) return false;
    if (document.querySelector('#chp-page')) return false;
    // CRITICAL: don't fire if the player is already in the care game
    // (game-container visible). Onboarding is "BEFORE YOU PICK".once they
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
  // Rewritten May 2026 (owner request): the previous Card 1 spoiled the
  // entire main-story arc by naming the player as "the Seventh Weaver" and
  // saying "six came before you. None survived" before the player had
  // earned any of those reveals through gameplay (Lyra Ch7 "Weaver" naming,
  // Lucien Ch14 catch, Proto midnight, Aenor interlude). The slow-burn
  // torn-page arc requires the player to NOT know yet. New onboarding is
  // gameplay-mechanics-only with atmospheric hooks, no lore reveals.
  const CARDS = [
    {
      eyebrow: 'WELCOME',
      title: 'Seven hearts are waiting.',
      body: [
        'They will remember everything you do.',
        'A gift is noticed. A silence is noticed twice.',
        'They arrive one by one. How you meet them sets the tone.'
      ]
    },
    {
      eyebrow: 'YOUR POWER',
      title: 'Your bonds are the kingdom\u2019s magic.',
      body: [
        'Every connection you form lights a ward in the kingdom.',
        'You can love many. That is not a flaw. It is the gift.',
        'Each of the seven below is a different colour of thread in your weave.'
      ]
    },
    {
      eyebrow: 'HOW TO PLAY',
      title: 'Two ways to spend time here.',
      body: [
        'Care for them every day. Feed, wash, talk, listen.',
        'When you are ready for the bigger story, tap STORY in the bottom menu.',
        'Both modes run together. Take your time. They notice everything.'
      ]
    },
    {
      // No eyebrow on the last card. "BEGIN" here just echoed the BEGIN
      // button six lines below it; the title carries the card instead.
      title: 'Start your story.',
      body: [
        'Read the first chapter to meet Alistair. His care route opens the moment that chapter ends.',
        'Care for him until your bond is earned. Each bond you build opens the next chapter, and the next character walks in through it.',
        'The story unfolds one heart at a time. Take it slow.'
      ]
    }
  ];

  // Jul 2026 playtest fix — the BEGIN card is progress-aware. A player
  // who already finished Chapter 1 was being told to "read the first
  // chapter to meet Alistair" right after meeting him. Swap card 4's
  // copy once Ch1 is done.
  function cardFor(idx) {
    const c = CARDS[idx];
    if (idx === CARDS.length - 1 && lsGet('pp_chapter_done_1') === '1') {
      return {
        title: 'You’ve already met him.',
        body: [
          'Alistair’s door is open. Care for him daily. Feed, wash, talk, listen.',
          'Your bond with him opens Chapter 6, and Elian’s thread walks in through it.',
          'The story unfolds one heart at a time. Take it slow.'
        ]
      };
    }
    return c;
  }

  // --- Build / show --------------------------------------------------------
  let _running = false;
  let _idx = 0;
  let _root = null;

  function injectStyles() {
    if (document.getElementById('pp-onboarding-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-onboarding-styles';
    // Restyled Jun 2026 to match Pocket Paramour brand:
    //   - Cormorant Garamond italic for story register (title + body)
    //   - Quicksand uppercase for UI labels (WELCOME, SKIP)
    //   - Wine-velvet card bg + rose-gold thin border (matches title)
    //   - Continue button uses START-button magenta-wine gradient
    //   - Magenta active dot with soft glow
    s.textContent = `
      #pp-onboarding-overlay {
        position:fixed; inset:0; z-index:9700;
        background:radial-gradient(ellipse at center, rgba(43, 17, 51, 0.70) 0%, rgba(5, 0, 10, 0.95) 80%);
        backdrop-filter:blur(8px);
        -webkit-backdrop-filter:blur(8px);
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        padding:24px;
        opacity:0; transition:opacity 600ms ease;
        color:rgba(244, 235, 220, 0.92);
      }

      /* Wax seal above the card. The source art is on a BLACK background
         rather than transparent, so screen blending drops the black out
         against the dark overlay and leaves only the seal and its glow.
         (No backticks in here — this block lives inside a JS template
         literal and a stray backtick terminates the whole file.) */
      #pp-onboarding-seal {
        width:min(46vw, 172px);
        height:auto;
        margin-bottom:-6px;
        mix-blend-mode:screen;
        pointer-events:none;
        filter:drop-shadow(0 6px 26px rgba(122, 18, 36, 0.5));
        opacity:0; transform:translateY(14px) scale(0.96);
        transition:opacity 700ms ease 120ms, transform 700ms cubic-bezier(.2,.8,.2,1) 120ms;
      }
      #pp-onboarding-overlay.show #pp-onboarding-seal {
        opacity:1; transform:translateY(0) scale(1);
      }
      @media (max-height: 700px) {
        #pp-onboarding-seal { width:min(34vw, 120px); margin-bottom:-10px; }
      }
      #pp-onboarding-overlay.show { opacity:1; }
      #pp-onboarding-overlay:not(.show) { pointer-events:none; }
      #pp-onboarding-card {
        max-width:420px; width:100%;
        /* Dark velvet card with subtle wine glow within */
        background:
          radial-gradient(ellipse at 50% 0%, rgba(122, 18, 36, 0.25) 0%, rgba(0,0,0,0) 60%),
          linear-gradient(180deg, rgba(43, 17, 51, 0.96), rgba(21, 8, 26, 0.98));
        /* Rose-gold thin border */
        border:1px solid rgba(232, 200, 138, 0.32);
        border-radius:22px; padding:32px 28px;
        box-shadow:
          0 20px 50px rgba(0, 0, 0, 0.65),
          0 0 70px rgba(122, 18, 36, 0.22);
        text-align:center;
        transform:translateY(20px) scale(0.98);
        transition:transform 600ms cubic-bezier(.2,.8,.2,1);
      }
      #pp-onboarding-overlay.show #pp-onboarding-card {
        transform:translateY(0) scale(1);
      }

      /* Eyebrow label ("WELCOME") — UI register */
      /* Owner note: "make WELCOME bigger and more welcoming." It was a 10.5px
         hairline label with wide tracking — technically tidy, emotionally cold
         for the first word a new player reads. Now larger, warmer (full gold),
         with the tracking eased off so it reads as a greeting rather than a
         form heading, and a soft glow so it feels lit rather than printed. */
      .pp-on-eyebrow {
        font-family:'Quicksand','Inter','Segoe UI',sans-serif;
        font-weight:600;
        font-size:15px; letter-spacing:2.2px;
        text-transform:uppercase;
        color:#F4DDA8;
        text-shadow:0 0 14px rgba(232, 200, 138, 0.45);
        margin-bottom:16px;
      }

      /* Title ("Seven hearts are waiting.") — STORY register */
      .pp-on-title {
        font-family:'Cormorant Garamond','EB Garamond','Garamond','Georgia',serif;
        font-style:italic;
        font-weight:400;
        font-size:26px; line-height:1.3;
        letter-spacing:0.01em;
        color:rgba(244, 235, 220, 0.96);
        margin-bottom:16px;
        text-shadow:0 1px 8px rgba(0, 0, 0, 0.5);
      }

      /* Final card ("Start your story.") — it lost its eyebrow, so the
         title is now the first thing on the card and carries it alone.
         Bigger, lit from within, with a slow breath on the glow so it
         reads as the moment the tour hands the player the door. */
      .pp-on-title.is-finale {
        font-size:36px;
        line-height:1.2;
        margin-top:6px;
        margin-bottom:22px;
        color:#FFF4E2;
        text-shadow:
          0 0 18px rgba(232, 200, 138, 0.55),
          0 0 42px rgba(214, 59, 122, 0.35),
          0 2px 10px rgba(0, 0, 0, 0.55);
        animation:ppOnTitleGlow 4.2s ease-in-out infinite;
      }
      @keyframes ppOnTitleGlow {
        0%, 100% {
          text-shadow:
            0 0 18px rgba(232, 200, 138, 0.55),
            0 0 42px rgba(214, 59, 122, 0.35),
            0 2px 10px rgba(0, 0, 0, 0.55);
        }
        50% {
          text-shadow:
            0 0 26px rgba(244, 221, 168, 0.80),
            0 0 60px rgba(214, 59, 122, 0.50),
            0 2px 10px rgba(0, 0, 0, 0.55);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .pp-on-title.is-finale { animation:none; }
      }
      @media (max-height: 700px) {
        .pp-on-title.is-finale { font-size:31px; margin-bottom:18px; }
      }

      /* Body lines — same literary register */
      .pp-on-body {
        font-family:'Cormorant Garamond','EB Garamond','Garamond','Georgia',serif;
        font-style:italic;
        font-size:15.5px; line-height:1.55;
        color:rgba(232, 200, 220, 0.85);
      }
      .pp-on-body p { margin:8px 0; }

      /* Action row */
      .pp-on-actions {
        margin-top:24px; display:flex; align-items:center; justify-content:space-between;
      }

      /* Skip — small UI text */
      .pp-on-skip {
        font-family:'Quicksand','Inter',sans-serif;
        font-weight:500;
        font-size:10.5px; letter-spacing:1.6px;
        text-transform:uppercase;
        color:rgba(244, 235, 220, 0.50);
        background:none; border:0; padding:6px 4px;
        cursor:pointer;
        transition:color 280ms ease;
      }
      .pp-on-skip:hover { color:rgba(244, 235, 220, 0.90); }

      /* Continue — premium magenta-wine pill matching START button */
      .pp-on-next {
        background:linear-gradient(180deg,
          #C46A8D 0%,
          #9A4567 38%,
          #7A2B4D 70%,
          #5A1A36 100%);
        color:#FFF6FA;
        font-family:'Cormorant Garamond','EB Garamond',serif;
        font-weight:500;
        font-size:14px;
        letter-spacing:0.18em;
        text-transform:uppercase;
        text-shadow:
          0 1px 0 rgba(74, 10, 26, 0.55),
          0 2px 6px rgba(0, 0, 0, 0.40);
        border:1px solid rgba(232, 200, 138, 0.65);
        border-radius:999px;
        padding:10px 26px;
        cursor:pointer;
        box-shadow:
          inset 0 1px 0 rgba(255, 230, 240, 0.40),
          inset 0 -2px 6px rgba(74, 10, 26, 0.50),
          inset 0 0 0 1px rgba(232, 200, 138, 0.20),
          0 6px 20px -2px rgba(74, 10, 26, 0.70),
          0 0 36px rgba(154, 69, 103, 0.30);
        transition:transform 200ms ease, box-shadow 200ms ease;
      }
      .pp-on-next:hover {
        transform:scale(1.03);
        box-shadow:
          inset 0 1px 0 rgba(255, 230, 240, 0.45),
          inset 0 -2px 6px rgba(74, 10, 26, 0.50),
          inset 0 0 0 1px rgba(232, 200, 138, 0.40),
          0 8px 26px -2px rgba(74, 10, 26, 0.80),
          0 0 50px rgba(214, 59, 122, 0.45);
      }
      .pp-on-next:active { transform:scale(0.97); }

      /* Progress dots — magenta active with soft halo */
      .pp-on-dots {
        margin-top:18px; display:flex; gap:7px; justify-content:center;
      }
      .pp-on-dot {
        width:6px; height:6px; border-radius:50%;
        background:rgba(232, 200, 138, 0.22);
        transition:background 280ms ease, box-shadow 280ms ease;
      }
      .pp-on-dot.active {
        background:rgba(232, 76, 140, 0.95);
        box-shadow:0 0 8px rgba(232, 76, 140, 0.55);
      }
    `;
    document.head.appendChild(s);
  }

  function renderCard(idx) {
    if (!_root) return;
    const card = _root.querySelector('#pp-onboarding-card');
    if (!card) return;
    const c = cardFor(idx);
    card.innerHTML = '';
    if (c.eyebrow) {
      const eb = document.createElement('div'); eb.className = 'pp-on-eyebrow';
      eb.textContent = c.eyebrow; card.appendChild(eb);
    }
    const t = document.createElement('div');
    t.className = 'pp-on-title' + (idx === CARDS.length - 1 ? ' is-finale' : '');
    t.textContent = c.title; card.appendChild(t);
    const b = document.createElement('div'); b.className = 'pp-on-body';
    c.body.forEach(line => { const p = document.createElement('p'); p.textContent = line; b.appendChild(p); });
    card.appendChild(b);

    const actions = document.createElement('div'); actions.className = 'pp-on-actions';
    // Card 1 has no previous, so it shows "Skip the tour" instead.
    // Cards 2.N show "Previous" so the player can re-read an earlier card.
    const left = document.createElement('button'); left.className = 'pp-on-skip';
    if (idx === 0) {
      left.textContent = 'Skip the tour';
      left.addEventListener('click', complete);
    } else {
      left.textContent = 'Previous';
      left.addEventListener('click', () => { _idx--; renderCard(_idx); });
    }
    actions.appendChild(left);

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
    // Re-verify at mount time — the poll's answer can be seconds stale
    // and the screen may have transitioned since (the exact race that
    // stacked the tour on top of the character intro).
    if (!shouldFire()) return;
    _running = true;
    injectStyles();

    _root = document.createElement('div');
    _root.id = 'pp-onboarding-overlay';
    // The wax seal sits above the card, in the empty space over it, so the
    // tour opens with the game's own mark rather than a bare panel.
    const seal = document.createElement('img');
    seal.id = 'pp-onboarding-seal';
    seal.src = 'assets/ui/tour-seal.png';
    seal.alt = '';
    _root.appendChild(seal);
    const card = document.createElement('div');
    card.id = 'pp-onboarding-card';
    _root.appendChild(card);
    document.body.appendChild(_root);

    // Hide the Main Story orb (the floating ✦ Main 4/26 chip) while the
    // tour is up.the player should focus on the tour, not on whether
    // to tap the orb. Restored in complete().
    const orb = document.getElementById('chp-orb');
    if (orb) orb.style.display = 'none';

    requestAnimationFrame(() => _root.classList.add('show'));
    _idx = 0;
    renderCard(0);
  }

  function complete() {
    lsSet(FLAG_DONE, '1');
    // Restore the Main Story orb that was hidden when the tour opened.
    const orb = document.getElementById('chp-orb');
    if (orb) orb.style.display = '';
    // Tap-hint: name the specific character to highlight (Alistair —
    // player needs to tap his card to enter care). prologue-chain.js's
    // refreshGrid reads pp_tap_hint_target and applies .pp-tap-hint
    // to that character's card. Cleared on any select-card tap.
    try { localStorage.setItem('pp_tap_hint_target', 'alistair'); } catch (_) {}
    if (window.PPChain && typeof window.PPChain.refreshGrid === 'function') {
      try { window.PPChain.refreshGrid(); } catch (_) {}
    }
    if (_root) {
      _root.classList.remove('show');
      setTimeout(() => { try { _root.remove(); } catch (_) {} _root = null; }, 600);
    }
    _running = false;
  }

  // Listen for first character-card click.mark complete (in case they
  // skipped via the link or just dove in).
  function watchSelectGrid() {
    document.addEventListener('click', (e) => {
      const card = e.target && e.target.closest && e.target.closest('.select-card');
      if (card) lsSet(FLAG_DONE, '1');
      // Jul 2026 — heading into care via the hero CARE button also ends
      // the "before you pick" window; without this the tour lay in wait
      // and ambushed the player mid-care-session.
      const careBtn = e.target && e.target.closest && e.target.closest('.cc-action-care');
      if (careBtn && lsGet('pp_chapter_done_1') === '1') lsSet(FLAG_DONE, '1');
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
