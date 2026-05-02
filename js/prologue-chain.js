/* prologue-chain.js — the connective tissue between meet-cutes
 * ============================================================================
 * WHY THIS EXISTS:
 *   Without this module the player "arrives in the world" and is shown a grid
 *   of seven characters. That is a menu, not a story. With this module, on a
 *   FRESH save the player walks one threaded prologue:
 *
 *     0 ARRIVAL   — wakes face-down in moss, torn page in hand
 *     1 ALISTAIR  — patrol rescue → maid's chamber → meet-cute → tutorial gate
 *     2 ELIAN     — slips out of castle → forest → "What are you"
 *     3 LYRA      — south-coast journey → cave-mouth → first to name "Weaver"
 *     4 CASPIAN   — Alistair guilt → royal letter → court reception
 *     5 LUCIEN    — appointed guard → slip → tower observatory
 *     6 NOIR      — dark pull → hunter-found-doe alley scene
 *     7 PROTO     — mirror at midnight after Noir, "I rehearsed this"
 *
 *   Each step is a SHORT scene (the bridge files: world-arrival.js,
 *   bridge-<char>.js) that ends by calling PPChain.advance(stepIdx).
 *   advance() persists progress, locks/unlocks the character grid, and
 *   surfaces a toast ("✦ Elian's route is open. He waits at the south fire.").
 *
 *   THE TUTORIAL GATE:
 *     After the Alistair bridge fires, the other six characters stay LOCKED
 *     on the select-screen until the player has:
 *       - reached Alistair affection ≥ 25, AND
 *       - completed a full care cycle (feed + clean + talk + train at least once).
 *     This forces the player to learn the Tamagotchi loop on one character
 *     before the world opens up. ~1–2 days of casual play.
 *
 *   REPLAYS:
 *     On a save where pp_chain_skipped = '1' the chain is bypassed entirely.
 *     The very-first session offers a "Skip prologue?" prompt so returning
 *     players are not punished, but a fresh save plays through.
 *
 * SAFETY CONTRACT:
 *   Read-only on stats. Never blocks gameplay outside its scenes. The only
 *   mutation outside the bridges is the grid-lock CSS class on .select-card
 *   nodes, which is idempotent. A user with the dev panel can jump steps via
 *   PPChain.setStep(n) and unlock everything via PPChain.skip().
 * ============================================================================
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Storage keys
  // ---------------------------------------------------------------------------
  const STEP_KEY      = 'pp_chain_step';            // 0..7
  const SKIPPED_KEY   = 'pp_chain_skipped';         // '1' = bypass entirely
  const ALI_CYCLE_KEY = 'pp_chain_alistair_cycle';  // JSON {feed,clean,talk,train}
  const ROUTE_FLAG    = 'pp_main_story_enabled';

  const STEPS = [
    /* 0 */ { key: 'arrival',  name: 'Arrival' },
    /* 1 */ { key: 'alistair', name: 'Alistair', char: 'alistair', tagline: "He keeps watch by your door." },
    /* 2 */ { key: 'elian',    name: 'Elian',    char: 'elian',    tagline: "He waits at the south fire." },
    /* 3 */ { key: 'lyra',     name: 'Lyra',     char: 'lyra',     tagline: "She is at the cave-mouth." },
    /* 4 */ { key: 'caspian',  name: 'Caspian',  char: 'caspian',  tagline: "The court has opened to you." },
    /* 5 */ { key: 'lucien',   name: 'Lucien',   char: 'lucien',   tagline: "The tower is open. Any hour." },
    /* 6 */ { key: 'noir',     name: 'Noir',     char: 'noir',     tagline: "He found you first." },
    /* 7 */ { key: 'proto',    name: 'Proto',    char: 'proto',    tagline: "He has been waiting to be seen." }
  ];

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  function step()      { return parseInt(lsGet(STEP_KEY) || '0', 10) || 0; }
  function setStepRaw(n) { lsSet(STEP_KEY, String(Math.max(0, Math.min(7, n | 0)))); }
  function isSkipped() { return lsGet(SKIPPED_KEY) === '1'; }
  function routeOn()   { return lsGet(ROUTE_FLAG) === '1'; }

  function affOf(char) {
    // PRIMARY: live in-memory value from the game instance, when the
    // queried char matches the currently selected character. game.js
    // tracks affection on `this.affection` and only persists it inside
    // a JSON save blob, never as a standalone pp_affection_<char> key —
    // so reading localStorage alone returns 0 even at affection 100.
    try {
      const g = window._game;
      if (g && (g.selectedCharacter === char) && typeof g.affection === 'number') {
        return Math.max(0, Math.min(100, g.affection));
      }
    } catch (_) {}
    // FALLBACK 1: explicit pp_affection_<char> key (used by chain code)
    const v = lsGet('pp_affection_' + char);
    if (v != null) return parseInt(v, 10) || 0;
    // FALLBACK 2: legacy <char>_affection key
    const v2 = lsGet(char + '_affection');
    if (v2 != null) return parseInt(v2, 10) || 0;
    // FALLBACK 3: parse the JSON save blob if game.js wrote one
    try {
      const blob = lsGet('pocket_love_save_' + char);
      if (blob) {
        const o = JSON.parse(blob);
        if (o && typeof o.affection === 'number') return o.affection;
      }
    } catch (_) {}
    return 0;
  }

  // Per-character care-cycle store: pp_chain_<char>_cycle = JSON {feed,clean,talk,train}
  // Tracked separately for each character so that EACH bridge gates behind the
  // previous character's care progress. Alistair's bridge gates Elian; Elian's
  // gates Lyra; etc.
  function getCycleFor(char) {
    try {
      const raw = lsGet('pp_chain_' + char + '_cycle');
      if (!raw) return { feed: 0, clean: 0, talk: 0, train: 0 };
      const o = JSON.parse(raw);
      return {
        feed:  o.feed  ? 1 : 0,
        clean: o.clean ? 1 : 0,
        talk:  o.talk  ? 1 : 0,
        train: o.train ? 1 : 0
      };
    } catch (_) { return { feed: 0, clean: 0, talk: 0, train: 0 }; }
  }
  function setCycleFor(char, c) {
    try { lsSet('pp_chain_' + char + '_cycle', JSON.stringify(c)); } catch (_) {}
  }

  // True when the named character has affection >=25 AND has had at least one
  // of each STARTING care action: feed, clean (wash), talk.
  // Train and Gift are intentionally excluded — they're locked behind
  // affection level 1 by button-locks.js, which means the player can't
  // even tap them until they've already reached the affection threshold.
  // Requiring them would be a circular gate.
  function careReadyFor(char) {
    if (!char) return false;
    if (affOf(char) < 25) return false;
    const c = getCycleFor(char);
    return !!(c.feed && c.clean && c.talk);
  }

  function activeChar() {
    try {
      const g = window._game;
      if (g && (g.selectedCharacter || g.characterId)) return g.selectedCharacter || g.characterId;
    } catch (_) {}
    return lsGet('pp_current_character') || null;
  }

  function recordCare(action) {
    const char = activeChar();
    if (!char) return;
    const c = getCycleFor(char);
    if (!(action in c)) return;
    if (c[action] === 1) {
      // Even if action was already recorded, refresh display so affection
      // bar reflects any new affection gained from this tap.
      refreshCareProgress();
      return;
    }
    c[action] = 1;
    setCycleFor(char, c);
    refreshCareProgress();
    refreshUnlockReadyToast();
  }

  // Back-compat alias used by older code paths.
  function tutorialReady() { return careReadyFor('alistair'); }

  function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  // ---------------------------------------------------------------------------
  // Character-grid locks
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('pp-chain-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-chain-styles';
    s.textContent = `
      .select-card.pp-chain-locked {
        position:relative;
        filter: grayscale(0.85) brightness(0.45) blur(0.5px);
        opacity:0.62;
        cursor:pointer;
      }
      /* Subtle lock badge in the corner — replaces the old text overlay. */
      .select-card.pp-chain-locked::before {
        content: '\u{1F512}';
        position:absolute; top:8px; right:8px;
        font-size:14px; opacity:0.9;
        background:rgba(10,6,22,0.78);
        border:1px solid rgba(180,150,230,0.40);
        width:24px; height:24px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        z-index:2; pointer-events:none;
        filter:none;
      }

      /* Lock-explanation popup — shown when a locked card is tapped. */
      #pp-chain-lock-overlay {
        position:fixed; inset:0; z-index:9800;
        background:rgba(8,5,18,0.78);
        backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
        display:flex; align-items:center; justify-content:center;
        opacity:0; pointer-events:none;
        transition:opacity 280ms ease;
      }
      #pp-chain-lock-overlay.show { opacity:1; pointer-events:auto; }
      #pp-chain-lock-card {
        width:88%; max-width:380px;
        background:linear-gradient(180deg, #1c1235 0%, #0e0820 100%);
        border:1px solid rgba(200,170,240,0.40);
        border-radius:18px;
        padding:24px 22px 18px;
        color:#ece2f6; text-align:center;
        box-shadow:0 18px 44px rgba(0,0,0,0.65), 0 0 26px rgba(180,140,220,0.22) inset;
        transform:scale(0.94);
        transition:transform 280ms cubic-bezier(.2,.8,.2,1);
      }
      #pp-chain-lock-overlay.show #pp-chain-lock-card { transform:scale(1); }
      #pp-chain-lock-card .lock-icon {
        font-size:28px; margin-bottom:8px; opacity:0.85;
      }
      #pp-chain-lock-card .lock-title {
        font-size:15px; font-weight:700; letter-spacing:0.6px;
        color:#ffd8ec; margin-bottom:8px;
      }
      #pp-chain-lock-card .lock-body {
        font-size:13.5px; line-height:1.5; color:#c8b9e0;
        font-style:italic; margin-bottom:18px;
      }
      #pp-chain-lock-card .lock-ok {
        background:linear-gradient(180deg, #6a4ec0, #4d3796);
        color:#fff; border:1px solid rgba(255,255,255,0.18);
        border-radius:12px; padding:10px 28px;
        font-size:14px; font-weight:600;
        cursor:pointer; user-select:none;
        font-family:inherit;
      }
      #pp-chain-lock-card .lock-ok:active { transform:translateY(1px); }

      /* While a chain transition is in flight, fully remove the select
         grid and game container from layout so the player doesn't see
         them flash between scenes AND so polling modules (onboarding,
         ambient triggers) can't detect them as "visible". */
      body.pp-chain-in-progress #select-screen,
      body.pp-chain-in-progress #game-container {
        display: none !important;
      }
      /* Also suppress the onboarding overlay during chain transitions. */
      body.pp-chain-in-progress #pp-onboarding-overlay {
        display: none !important;
      }
      /* Replace the default pink page background while chain is active.
         The body's normal gradient (pink → magenta in style.css) is the
         "candy" palette for the title/select screens; it doesn't fit
         dark-fantasy story moments. While the chain is in progress, the
         underlying body bg is exposed between MSCard scenes (when
         #game-container is display:none) — without this override the
         player sees a pink page flash between transitions. */
      body.pp-chain-in-progress {
        background: linear-gradient(180deg, #06080f 0%, #0a0c1a 50%, #06080f 100%) !important;
      }

      /* Care-progress indicator on the care screen — small floating chip
         that shows the player how close they are to unlocking the next
         character. Visible only during care, hidden during scenes. */
      /* Care-progress chip — fourth design iteration.
         History: was a tall block at top:96px (blocked face), then moved
         to bottom:168px (overlapped dialogue), then to top:102 as a
         single-line strip (still felt too close to character head).
         Now: same compact horizontal pill, anchored to BOTTOM in the
         clear band between the character's waist (~y=420) and the
         dialogue bubble top (y=454). Lower opacity background so the
         character's armor reads through faintly behind the strip. */
      #pp-care-progress {
        position: fixed; bottom: 272px; left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(180deg, rgba(14,18,36,0.78), rgba(6,8,15,0.74));
        border: 1px solid rgba(255,206,107,0.38);
        border-radius: 999px;
        padding: 4px 12px;
        color: #e8dec4; font-size: 10.5px; line-height: 1.3;
        letter-spacing: 0.3px;
        z-index: 30;
        box-shadow: 0 4px 12px rgba(0,0,0,0.55);
        opacity: 0; pointer-events: none;
        transition: opacity 320ms ease;
        max-width: 92vw;
        display: flex; align-items: center; gap: 8px;
        white-space: nowrap;
      }
      #pp-care-progress.show { opacity: 1; }
      #pp-care-progress .pp-cp-title {
        font-weight: 700; color: #ffce6b; letter-spacing: 0.4px;
        font-size: 10px;
        text-transform: uppercase;
        margin: 0;
      }
      /* Hide the bulky title and just show character names; the strip
         already implies "care progress" by its placement. */
      #pp-care-progress .pp-cp-aff {
        font-weight: 600; color: #fff4de;
      }
      #pp-care-progress .pp-cp-bar {
        margin: 0; height: 3px; min-width: 56px; max-width: 96px; flex: 1 1 60px;
        border-radius: 3px;
        background: rgba(255,255,255,0.12); overflow: hidden;
      }
      #pp-care-progress .pp-cp-fill {
        height: 100%; border-radius: 3px;
        background: linear-gradient(90deg, #ffce6b, #ffe5a8);
        transition: width 360ms ease;
      }
      #pp-care-progress .pp-cp-cycle {
        margin: 0; font-size: 10px; opacity: 0.85;
        color: #ffce6b;
      }

      /* "Ready to move on" modal — replaces the easy-to-miss toast.
         z-index 10800 puts it ABOVE chp-page (10750) so the chapter list
         can't bury it. Stays BELOW mscard-root (11000) so a playing scene
         still takes precedence (and refreshUnlockReadyToast already gates
         against mscard-root being open before mounting). */
      #pp-ready-overlay {
        position: fixed; inset: 0; z-index: 10800;
        background: rgba(8,5,18,0.82);
        backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none;
        transition: opacity 280ms ease;
        padding: 18px;
      }
      #pp-ready-overlay.show { opacity: 1; pointer-events: auto; }
      /* Ready card — repalette to match the chain-toast aesthetic
         (navy backdrop + warm gold accents). Was a purple/pink Otome
         palette; the route-open card and the failure scenes are now
         dark-fantasy and the ready modal needs to feel like the same
         world, not a candy popup. */
      #pp-ready-card {
        width: 100%; max-width: 420px;
        background: linear-gradient(180deg, #0e1224 0%, #06080f 100%);
        border: 1px solid #ffce6b;
        border-radius: 14px;
        padding: 26px 24px 22px;
        color: #fff4de; text-align: center;
        box-shadow:
          0 18px 60px rgba(0,0,0,0.78),
          0 0 38px #ffce6b inset,
          0 0 0 1px rgba(255,255,255,0.04);
        transform: scale(0.94);
        transition: transform 280ms cubic-bezier(.2,.8,.2,1);
      }
      #pp-ready-overlay.show #pp-ready-card { transform: scale(1); }
      #pp-ready-card .ready-icon { font-size: 32px; margin-bottom: 6px; color: #ffce6b; }
      #pp-ready-card .ready-title {
        font-size: 17px; font-weight: 700; letter-spacing: 1.2px;
        color: #ffce6b; margin-bottom: 12px;
        text-transform: uppercase;
      }
      #pp-ready-card .ready-body {
        font-size: 14px; line-height: 1.55; color: #e8dec4;
        font-style: italic; margin-bottom: 18px;
      }
      #pp-ready-card .ready-btns {
        display: flex; gap: 10px; justify-content: center;
      }
      #pp-ready-card .ready-btns button {
        flex: 1; padding: 12px 14px; border-radius: 10px;
        font-size: 13.5px; font-weight: 600; cursor: pointer;
        border: 1px solid rgba(255,206,107,0.4);
        font-family: inherit;
        letter-spacing: 0.5px;
      }
      #pp-ready-card .ready-stay {
        background: rgba(20,24,40,0.78); color: #e8dec4;
      }
      #pp-ready-card .ready-go {
        background: linear-gradient(180deg, #ffce6b, #d4a04a);
        color: #1a1208;
        border-color: #ffce6b;
      }
      #pp-ready-card .ready-btns button:active { transform: translateY(1px); }

      /* Route-open card. Centred, holds the screen, waits for tap.
         Palette is per-character — each character supplies their own
         bg / glow / accent via CSS custom properties set inline at
         render time. Defaults below match Alistair (navy + warm gold)
         since he's the first character and acts as the reference. */
      #pp-chain-toast {
        --pp-toast-bg-1: #0e1224;
        --pp-toast-bg-2: #06080f;
        --pp-toast-glow: #ffce6b;
        --pp-toast-accent: #fff4de;
        --pp-toast-ink: #e8dec4;
        position:fixed; left:50%; top:50%;
        transform:translate(-50%, calc(-50% + 14px)) scale(0.97);
        padding:22px 28px 20px; max-width:86vw; min-width:260px;
        background:linear-gradient(180deg, var(--pp-toast-bg-1), var(--pp-toast-bg-2));
        border:1px solid var(--pp-toast-glow);
        border-radius:14px;
        color:var(--pp-toast-ink); font-size:14px; line-height:1.5;
        text-align:center;
        box-shadow:
          0 18px 60px rgba(0,0,0,0.78),
          0 0 38px var(--pp-toast-glow) inset,
          0 0 0 1px rgba(255,255,255,0.04);
        opacity:0; pointer-events:none;
        /* z-index 10800 puts the route-open toast ABOVE chp-page (10750)
           so that if the player triggered the bridge from the main-story
           page (which stays mounted underneath the bridge cinematic),
           the toast doesn't get buried by chp-page when it appears.
           Stays BELOW mscard-root (11000) so playing scenes still take
           precedence. Matches pp-ready-overlay which had the same bug. */
        z-index:10800;
        cursor:pointer; user-select:none;
        transition:opacity 520ms ease, transform 520ms ease;
        font-family: inherit;
      }
      #pp-chain-toast.show {
        opacity:1;
        transform:translate(-50%, -50%) scale(1);
        pointer-events:auto;
      }
      #pp-chain-toast .pp-chain-toast-title {
        font-weight:700; letter-spacing:1.2px;
        color:var(--pp-toast-glow);
        margin-bottom:10px; font-size:12.5px;
        text-transform:uppercase;
      }
      #pp-chain-toast .pp-chain-toast-body {
        color:var(--pp-toast-accent); font-size:15px;
        font-weight:500; line-height:1.55;
      }
      #pp-chain-toast .pp-chain-toast-cta {
        margin-top:18px; font-size:11px;
        color:var(--pp-toast-glow); opacity:0.7;
        letter-spacing:1.4px; text-transform:uppercase;
      }
    `;
    document.head.appendChild(s);
  }

  const ORDER = ['alistair','elian','lyra','caspian','lucien','noir','proto'];

  // Returns true if this character should currently be locked from selection.
  // The "next-up" character (idx === step) is locked until the PREVIOUS
  // character's care has reached the gate (affection 25 + full cycle).
  function isLocked(char) {
    if (isSkipped()) return false;
    const s = step();
    if (s === 0) return true; // arrival hasn't played
    const idx = ORDER.indexOf(char);
    if (idx < 0) return false;
    if (idx < s) return false;        // already met & unlocked
    if (idx > s) return true;         // not next yet
    // idx === s — next-up. Locked until previous character's care is done.
    const prevChar = ORDER[s - 1];
    if (prevChar && !careReadyFor(prevChar)) return true;
    return false;                      // ready: tappable to fire the bridge
  }

  function lockText(char) {
    const s = step();
    if (s === 0) return 'You have not arrived yet.';
    const idx = ORDER.indexOf(char);
    if (idx < 0) return '';
    if (idx === s) {
      const prevChar = ORDER[s - 1];
      if (prevChar && !careReadyFor(prevChar)) {
        return 'Care for ' + capitalize(prevChar) + ' first.';
      }
      // Ready — would normally not be locked, but show tagline if it is
      return STEPS[idx + 1]?.tagline || 'Your path leads here next.';
    }
    return 'Your path has not led here yet.';
  }

  function refreshGrid() {
    injectStyles();
    document.querySelectorAll('.select-card[data-character]').forEach(card => {
      const char = card.getAttribute('data-character');
      if (!char) return;
      if (isLocked(char)) {
        card.classList.add('pp-chain-locked');
      } else {
        card.classList.remove('pp-chain-locked');
      }
      // Defensive: clear any stale pp-chain-next class from prior versions
      // (rolled back per owner — visual didn't work, broke story flow).
      card.classList.remove('pp-chain-next');
      // Always drop the legacy text-overlay attribute — replaced by popup.
      card.removeAttribute('data-pp-lock-text');
    });
    refreshCareProgress();
  }

  // ---------------------------------------------------------------------------
  // Care progress chip — visible during care, shows the player how close
  // they are to unlocking the next character. Big visible answer to "I do
  // not know when affection reaches 25."
  // ---------------------------------------------------------------------------
  function ensureCareProgress() {
    let el = document.getElementById('pp-care-progress');
    if (el) return el;
    injectStyles();
    el = document.createElement('div');
    el.id = 'pp-care-progress';
    el.innerHTML =
      '<div class="pp-cp-title"></div>' +
      '<div class="pp-cp-aff"></div>' +
      '<div class="pp-cp-bar"><div class="pp-cp-fill"></div></div>' +
      '<div class="pp-cp-cycle"></div>';
    document.body.appendChild(el);
    return el;
  }
  function refreshCareProgress() {
    const s = step();
    // Show only during care of a character whose care-gate matters
    // (i.e., they have a successor in the chain). After step 7, chain is
    // complete — no progress chip needed.
    if (s < 1 || s >= 7) {
      const ex = document.getElementById('pp-care-progress');
      if (ex) ex.classList.remove('show');
      return;
    }
    // Only show when the care-gating character is currently selected
    // AND game-container is visible.
    const gateChar = ORDER[s - 1];           // e.g., 'alistair' when s=1
    const nextChar = ORDER[s];               // e.g., 'elian'
    const active = activeChar();
    if (active !== gateChar) {
      const ex = document.getElementById('pp-care-progress');
      if (ex) ex.classList.remove('show');
      return;
    }
    const game = document.getElementById('game-container');
    const gameVisible = game && !game.classList.contains('hidden') &&
      window.getComputedStyle(game).display !== 'none';
    if (!gameVisible) {
      const ex = document.getElementById('pp-care-progress');
      if (ex) ex.classList.remove('show');
      return;
    }
    // Hide if any blocking scene/overlay is present
    const blocker = document.querySelector(
      '#mscard-root, #ms-encounter-root, #chp-page, #letter-overlay:not(.hidden), ' +
      '#cinematic-overlay.visible, #event-overlay:not(.hidden), #story-overlay:not(.hidden), ' +
      '#pp-ready-overlay, #pp-chain-lock-overlay, #pp-onboarding-overlay'
    );
    if (blocker) {
      const ex = document.getElementById('pp-care-progress');
      if (ex) ex.classList.remove('show');
      return;
    }

    // Gate already cleared? Hide the chip — it's no longer useful and just
    // adds visual noise. The player has done what they needed; let them
    // enjoy the care loop without a stale "do this!" reminder.
    if (careReadyFor(gateChar)) {
      const ex = document.getElementById('pp-care-progress');
      if (ex) ex.classList.remove('show');
      return;
    }

    const aff = affOf(gateChar);
    const cap = (s2) => s2.charAt(0).toUpperCase() + s2.slice(1);
    const pct = Math.min(100, Math.round((aff / 25) * 100));
    const cycle = getCycleFor(gateChar);
    // Only the 3 starting actions count toward the gate — Train/Gift are
    // locked until affection level 1 and would be a circular requirement.
    const cycleNames = ['feed','clean','talk'];
    const cycleDone = cycleNames.filter(n => cycle[n]).length;
    const labels = { feed: 'Feed', clean: 'Wash', talk: 'Talk' };
    const cycleStr = cycleNames.map(n => (cycle[n] ? '✓ ' : '◯ ') + labels[n]).join('   ');

    const el = ensureCareProgress();
    // Compact horizontal-strip layout. The full sentence "Care for X to
    // meet Y" doesn't fit in a single-line strip; the arrow + next-char
    // name is enough context, and the strip's placement implies care
    // progress by its location.
    el.querySelector('.pp-cp-title').textContent = '→ ' + cap(nextChar);
    el.querySelector('.pp-cp-aff').innerHTML = '<b>' + Math.min(aff, 25) + '/25</b>';
    el.querySelector('.pp-cp-fill').style.width = pct + '%';
    el.querySelector('.pp-cp-cycle').textContent = cycleStr + ' (' + cycleDone + '/3)';
    el.classList.add('show');
  }

  // ---------------------------------------------------------------------------
  // Lock-explanation popup. Used by both the character grid and the chapter
  // menu when a locked entry is tapped. Pass either a character name (for
  // the grid case — popup builds title + reason from chain state) OR a
  // {title, reason} options object (for chapter-menu use).
  // ---------------------------------------------------------------------------
  function showLockPopup(arg) {
    injectStyles();
    const existing = document.getElementById('pp-chain-lock-overlay');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    let title, reason;
    if (typeof arg === 'string') {
      // Character grid case: arg is a character id
      title = arg.charAt(0).toUpperCase() + arg.slice(1);
      reason = lockText(arg);
    } else if (arg && typeof arg === 'object') {
      title = arg.title || 'Locked';
      reason = arg.reason || '';
    } else {
      title = 'Locked';
      reason = '';
    }

    const overlay = document.createElement('div');
    overlay.id = 'pp-chain-lock-overlay';
    overlay.innerHTML = '' +
      '<div id="pp-chain-lock-card">' +
        '<div class="lock-icon">\u{1F512}</div>' +
        '<div class="lock-title">' + title + '</div>' +
        '<div class="lock-body">' + reason + '</div>' +
        '<button class="lock-ok" type="button">OK</button>' +
      '</div>';
    document.body.appendChild(overlay);
    // eslint-disable-next-line no-unused-expressions
    overlay.offsetHeight;
    overlay.classList.add('show');

    function close() {
      overlay.classList.remove('show');
      setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 320);
    }
    overlay.querySelector('.lock-ok').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  }

  // Body-class management for chain transitions. While this class is set,
  // CSS hides #select-screen and #game-container so the player doesn't see
  // them flicker between scenes (arrival → bridge → chapter has gaps).
  function setChainInProgress(on) {
    if (on) document.body.classList.add('pp-chain-in-progress');
    else    document.body.classList.remove('pp-chain-in-progress');
  }

  // ---------------------------------------------------------------------------
  // Unlock toast
  // ---------------------------------------------------------------------------
  // Per-character toast palettes — each one matches the character's
  // story-card palette so the route-open card feels native to that
  // character, not a generic system notification.
  const TOAST_PALETTES = {
    alistair: { bg1: '#0e1224', bg2: '#06080f', glow: '#ffce6b', accent: '#fff4de', ink: '#e8dec4' },
    elian:    { bg1: '#0e1a12', bg2: '#06100a', glow: '#a9d4a1', accent: '#e8f3e2', ink: '#cde2c5' },
    lyra:     { bg1: '#0a1622', bg2: '#04101c', glow: '#7fd3e3', accent: '#e8f0ff', ink: '#cfe2ec' },
    caspian:  { bg1: '#1a0d1d', bg2: '#0c0410', glow: '#e7a3d0', accent: '#f8e9ff', ink: '#ecd2e2' },
    lucien:   { bg1: '#16111e', bg2: '#08060e', glow: '#b29ce8', accent: '#ece2ff', ink: '#d6c8e8' },
    noir:     { bg1: '#0a0a12', bg2: '#040408', glow: '#9ab8d4', accent: '#dde6f2', ink: '#bcc8d8' },
    proto:    { bg1: '#08141a', bg2: '#020a10', glow: '#7fdaee', accent: '#dff5ff', ink: '#b4d6e2' }
  };

  let _toastResolve = null;
  function toast(title, line, opts) {
    opts = opts || {};
    injectStyles();
    let el = document.getElementById('pp-chain-toast');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    el = document.createElement('div');
    el.id = 'pp-chain-toast';

    // Apply per-character palette via CSS custom properties.
    const pal = (opts.char && TOAST_PALETTES[opts.char]) || TOAST_PALETTES.alistair;
    el.style.setProperty('--pp-toast-bg-1', pal.bg1);
    el.style.setProperty('--pp-toast-bg-2', pal.bg2);
    el.style.setProperty('--pp-toast-glow', pal.glow);
    el.style.setProperty('--pp-toast-accent', pal.accent);
    el.style.setProperty('--pp-toast-ink', pal.ink);

    const cta = opts.cta || 'tap to continue';
    el.innerHTML = ''
      + '<div class="pp-chain-toast-title">' + (title || '') + '</div>'
      + '<div class="pp-chain-toast-body">' + (line || '') + '</div>'
      + '<div class="pp-chain-toast-cta">' + cta + '</div>';
    document.body.appendChild(el);
    // eslint-disable-next-line no-unused-expressions
    el.offsetHeight;
    el.classList.add('show');

    return new Promise(function (resolve) {
      _toastResolve = resolve;
      function close() {
        el.classList.remove('show');
        setTimeout(function () {
          if (el.parentNode) el.parentNode.removeChild(el);
          if (_toastResolve === resolve) _toastResolve = null;
          resolve();
        }, 520);
      }
      el.addEventListener('click', close, { once: true });
      el.addEventListener('touchstart', close, { once: true, passive: true });
    });
  }

  // ---------------------------------------------------------------------------
  // "Ready to move on" modal — replaces the old toast. Modal because a toast
  // is too easy to miss (user reported this exact issue). Modal includes a
  // big action button that auto-routes the player to the select grid where
  // the next character is now tappable.
  // ---------------------------------------------------------------------------
  function showReadyModal(prevChar, nextChar) {
    injectStyles();
    const existing = document.getElementById('pp-ready-overlay');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    const NEXT = nextChar.charAt(0).toUpperCase() + nextChar.slice(1);
    const PREV = prevChar.charAt(0).toUpperCase() + prevChar.slice(1);
    const tagline = (STEPS.find(s => s.char === nextChar) || {}).tagline || '';

    const overlay = document.createElement('div');
    overlay.id = 'pp-ready-overlay';
    overlay.innerHTML = '' +
      '<div id="pp-ready-card">' +
        '<div class="ready-icon">✨</div>' +
        '<div class="ready-title">' + NEXT + ' is ready to meet you.</div>' +
        '<div class="ready-body">' +
          'You’ve cared for ' + PREV + ' enough that the kingdom notices. ' +
          (tagline || 'Your path opens to ' + NEXT + ' now.') +
        '</div>' +
        '<div class="ready-btns">' +
          '<button class="ready-stay" type="button">Stay with ' + PREV + '</button>' +
          '<button class="ready-go" type="button">Take me to ' + NEXT + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    // eslint-disable-next-line no-unused-expressions
    overlay.offsetHeight;
    overlay.classList.add('show');

    function close() {
      overlay.classList.remove('show');
      setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 320);
    }
    overlay.querySelector('.ready-stay').addEventListener('click', close);
    overlay.querySelector('.ready-go').addEventListener('click', () => {
      close();
      // Auto-route to the Main Story page so the player sees the chapter
      // list with the next bridge as "Begin". Hide game, prep select
      // grid as the backdrop so closing the chapter page lands them
      // somewhere usable.
      try {
        const game = document.getElementById('game-container');
        const select = document.getElementById('select-screen');
        if (game) game.classList.add('hidden');
        if (select) select.classList.remove('hidden');
        refreshGrid();
        // Open the chapter page after a tiny breath — the player just
        // tapped a button, give the modal-close animation a moment.
        setTimeout(() => {
          try {
            if (window.MSChapters && typeof window.MSChapters.open === 'function') {
              window.MSChapters.open();
            }
          } catch (_) {}
        }, 360);
      } catch (_) {}
    });
  }

  // Re-checked whenever care state changes — fires once per transition when
  // the previous character's care threshold flips ready.
  //
  // BUGFIX: previously used a single `_readyToastShown` boolean that got
  // stuck `true` if the modal was dismissed (Stay button) or wiped by a
  // racing overlay during a chain transition. That broke the Noir→Proto
  // hand-off in playtest. We now track which step last received a fired
  // modal AND scrub the marker against the live DOM so a wiped overlay
  // can re-fire on the same step.
  let _lastReadyModalStep = -1;
  function refreshUnlockReadyToast() {
    const s = step();
    if (s < 1 || s >= 7) return;
    // Already showing the modal? Nothing to do.
    if (document.getElementById('pp-ready-overlay')) return;
    // Already shown for THIS step? Don't pester the player again — they
    // either took the route or chose to stay. Step changes will reset this.
    if (_lastReadyModalStep === s) return;
    const prevChar = ORDER[s - 1];
    const nextChar = ORDER[s];
    if (!prevChar || !nextChar) return;
    if (!careReadyFor(prevChar)) return;
    // Don't compete with any active chain transition or open scene/overlay.
    if (document.body.classList.contains('pp-chain-in-progress')) return;
    if (document.querySelector('#mscard-root')) return;
    if (document.querySelector('#ms-encounter-root')) return;
    if (document.querySelector('#letter-overlay:not(.hidden)')) return;
    _lastReadyModalStep = s;
    // Show the prominent modal (with auto-route button) instead of a toast.
    showReadyModal(prevChar, nextChar);
    refreshGrid();
  }

  // ---------------------------------------------------------------------------
  // Advance — called by bridge files when they finish
  // ---------------------------------------------------------------------------
  function advance(toStep) {
    const target = (toStep | 0);
    if (target <= step()) { refreshGrid(); return Promise.resolve(); }
    setStepRaw(target);
    // Allow the next ready-to-move-on modal to fire after the next care threshold
    _lastReadyModalStep = -1;
    refreshGrid();
    // Sync the chapter-menu pointer so bridges show as completed and the
    // matching numbered chapter becomes "current" in the chapter list.
    try {
      const bridgeIds = { 1:'b_alistair', 2:'b_elian', 3:'b_lyra', 4:'b_caspian', 5:'b_lucien', 6:'b_noir', 7:'b_proto' };
      const bid = bridgeIds[target];
      if (bid) lsSet('pp_chapter_done_' + bid, '1');
      if (target >= 1 && target <= 7) lsSet('pp_current_chapter', String(target));
    } catch (_) {}
    const meta = STEPS[target];
    if (meta && meta.char) {
      // Mark met for downstream systems (multi-romance, letter, etc.)
      lsSet('pp_met_' + meta.char, '1');
      lsSet('pp_ms_encounter_' + meta.char + '_seen', '1');
    }
    // Route-open card. Holds the screen, waits for tap, palette matches
    // the character. Returns a Promise so the bridge can await it before
    // firing the next chapter.
    if (meta && meta.char) {
      return toast(
        meta.name + "'s route is open",
        meta.tagline || '',
        { char: meta.char }
      );
    }
    return Promise.resolve();
  }

  // ---------------------------------------------------------------------------
  // Care-action hook for tutorial cycle
  // ---------------------------------------------------------------------------
  function classifyClick(target) {
    if (!target || !target.closest) return null;
    const sels = [
      // Match BOTH naming conventions: actual game.js uses #btn-feed,
      // #btn-wash, #btn-talk, #btn-train, #btn-gift. Older code used
      // #feed-btn etc. Match both so we never miss a care action.
      ['feed',  '.feed-btn, [data-action="feed"], #feed-btn, #btn-feed'],
      ['clean', '.clean-btn, .wash-btn, [data-action="clean"], #clean-btn, #wash-btn, #btn-wash, #btn-clean'],
      ['talk',  '.talk-btn, [data-action="talk"], #talk-btn, #btn-talk, .chat-btn'],
      ['train', '.train-btn, [data-action="train"], #train-btn, #btn-train, .exercise-btn']
    ];
    for (const [k, sel] of sels) if (target.closest(sel)) return k;
    return null;
  }
  function onCareClick(e) {
    // Track care for ANY character. recordCare reads the active character and
    // updates that char's cycle. Each transition gates behind the matching
    // previous char.
    const action = classifyClick(e.target);
    if (!action) return;
    recordCare(action);
  }

  // ---------------------------------------------------------------------------
  // Bridge launcher — character cards at the next-up step open the bridge.
  // ---------------------------------------------------------------------------
  function bridgeLauncherFor(char) {
    const map = {
      alistair: 'PPBridgeAlistair',
      elian:    'PPBridgeElian',
      lyra:     'PPBridgeLyra',
      caspian:  'PPBridgeCaspian',
      lucien:   'PPBridgeLucien',
      noir:     'PPBridgeNoir',
      proto:    'PPBridgeProto'
    };
    const m = map[char];
    if (!m || !window[m] || typeof window[m].play !== 'function') return null;
    return window[m].play;
  }

  // Hook the select-screen card clicks. If the player taps a locked card,
  // show the lock-explanation popup. If next-up, fire the bridge.
  function onSelectCardClick(e) {
    if (isSkipped()) return;
    const card = e.target && e.target.closest && e.target.closest('.select-card[data-character]');
    if (!card) return;
    const char = card.getAttribute('data-character');
    const idx = ORDER.indexOf(char);
    if (idx < 0) return;
    const s = step();

    // Locked? Show the popup explaining why.
    if (isLocked(char)) {
      e.preventDefault(); e.stopPropagation();
      showLockPopup(char);
      return;
    }

    // Next-up and unlocked? Fire the bridge.
    if (idx === s) {
      const launcher = bridgeLauncherFor(char);
      if (launcher) {
        e.preventDefault(); e.stopPropagation();
        launcher();
        return;
      }
    }
    // idx < s — already met, click proceeds normally to game.
  }

  // ---------------------------------------------------------------------------
  // Boot — also kicks the arrival scene on a fresh save once the route is on
  // ---------------------------------------------------------------------------
  // Arrival is now ONLY fired via explicit hand-off from game.js after the
  // OLD world intro completes. There is NO polling, NO safety-net timer —
  // both caused arrival to fire on its own before the player tapped Start
  // on returning saves.
  let _arrivalAttempted = false;
  function tryArrival() {
    if (_arrivalAttempted) return;
    if (isSkipped()) { _arrivalAttempted = true; return; }
    if (step() !== 0) { _arrivalAttempted = true; return; }
    if (lsGet('pp_bridge_alistair_played') === '1') { _arrivalAttempted = true; return; }
    if (!routeOn()) return; // game.js shouldn't call us if route is off, but guard
    if (!(window.PPWorldArrival && typeof window.PPWorldArrival.play === 'function')) {
      // Module not loaded yet (race) — retry once after a short wait.
      setTimeout(() => {
        if (_arrivalAttempted) return;
        if (window.PPWorldArrival && typeof window.PPWorldArrival.play === 'function') {
          _arrivalAttempted = true;
          window.PPWorldArrival.play();
        }
      }, 800);
      return;
    }
    _arrivalAttempted = true;
    window.PPWorldArrival.play();
  }

  function boot() {
    injectStyles();
    // Auto-enable main story for fresh saves so the chain runs by default.
    // Players who explicitly set the toggle to '0' stay disabled.
    if (lsGet('pp_main_story_enabled') == null) lsSet('pp_main_story_enabled', '1');
    refreshGrid();
    document.addEventListener('click', onSelectCardClick, true);
    document.addEventListener('click', onCareClick, true);
    document.addEventListener('touchend', onCareClick, true);
    // Re-check grid + care progress periodically. Care progress reads live
    // game.affection — needs to refresh in real time, not every 4s, or the
    // player won't see their bar fill in response to taps. 1s is responsive
    // without being expensive.
    setInterval(refreshGrid, 1000);
    // Also poll the unlock-ready check in case affection crosses 25
    // through a non-care-tap path (scenes, gifts, idle effects). Without
    // this, the modal would only fire when the player taps a care button.
    setInterval(refreshUnlockReadyToast, 1500);
    // NO arrival auto-trigger here. game.js calls PPChain.tryArrival()
    // explicitly after the world intro finishes.
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  window.PPChain = {
    step, setStep(n) { setStepRaw(n); refreshGrid(); },
    advance,
    isSkipped, skip() { lsSet(SKIPPED_KEY, '1'); refreshGrid(); },
    unskip() { lsSet(SKIPPED_KEY, '0'); refreshGrid(); },
    canPlay(char) { return !isLocked(char); },
    tutorialReady,
    careReadyFor,
    cycleFor: getCycleFor,
    recordCare,
    tryArrival,                       // hooked by game.js after world intro
    setChainInProgress,               // bridges call this to hide select-grid
    showLockPopup,                    // chapters.js calls for locked rows
    // Bridges call this after they finish so the matching main-story
    // chapter fires automatically — completing the unified flow:
    //   bridge \u2192 chapter \u2192 care \u2192 next bridge.
    fireChapterFor(stepIdx) {
      // Maps prologue chain step → CHAPTERS array entry id.
      const map = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 };
      const id = map[stepIdx];
      if (id == null) {
        setChainInProgress(false);
        return;
      }
      // Small breath after the unlock toast so the player isn't slammed.
      // Pass an onDone callback so the chain-in-progress class clears
      // when the chapter card finishes (player lands on select grid clean).
      setTimeout(() => {
        try {
          if (window.MSChapters && typeof window.MSChapters.play === 'function') {
            window.MSChapters.play(id, function chainChapterDone() {
              setChainInProgress(false);
            });
          } else {
            setChainInProgress(false);
          }
        } catch (_) {
          setChainInProgress(false);
        }
      }, 1400);
    },
    toast,
    refreshGrid,
    reset() {
      try {
        localStorage.removeItem(STEP_KEY);
        localStorage.removeItem(SKIPPED_KEY);
        ORDER.forEach(c => localStorage.removeItem('pp_chain_' + c + '_cycle'));
      } catch (_) {}
      _readyToastShown = false;
      _arrivalAttempted = false;
      _arrivalRetries = 0;
      refreshGrid();
    }
  };
})();
