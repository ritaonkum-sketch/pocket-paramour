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
    const v = lsGet('pp_affection_' + char);
    if (v != null) return parseInt(v, 10) || 0;
    const v2 = lsGet(char + '_affection');
    return v2 != null ? (parseInt(v2, 10) || 0) : 0;
  }

  function getCycle() {
    try {
      const raw = lsGet(ALI_CYCLE_KEY);
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
  function setCycle(c) { try { lsSet(ALI_CYCLE_KEY, JSON.stringify(c)); } catch (_) {} }

  function recordCare(action) {
    const c = getCycle();
    if (!(action in c)) return;
    if (c[action] === 1) return; // idempotent
    c[action] = 1;
    setCycle(c);
    refreshUnlockReadyToast();
  }

  function tutorialReady() {
    if (step() < 1) return false;       // must have done Alistair bridge first
    if (affOf('alistair') < 25) return false;
    const c = getCycle();
    return !!(c.feed && c.clean && c.talk && c.train);
  }

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
        pointer-events:none;
        opacity:0.62;
      }
      .select-card.pp-chain-locked::after {
        content: attr(data-pp-lock-text);
        position:absolute; left:50%; top:50%;
        transform:translate(-50%, -50%);
        color:#e8dff8; font-size:11.5px; font-style:italic;
        background:rgba(10,6,22,0.78);
        border:1px solid rgba(180,150,230,0.30);
        border-radius:10px;
        padding:6px 10px; max-width:90%;
        text-align:center; pointer-events:none;
      }

      #pp-chain-toast {
        position:fixed; left:50%; bottom:120px;
        transform:translateX(-50%) translateY(14px);
        padding:14px 22px; max-width:88vw;
        background:linear-gradient(180deg, rgba(36,22,60,0.95), rgba(20,10,38,0.92));
        border:1px solid rgba(200,170,240,0.45);
        border-radius:16px;
        color:#f3ebff; font-size:14px; line-height:1.45;
        text-align:center;
        box-shadow:0 12px 36px rgba(0,0,0,0.7), 0 0 22px rgba(180,140,230,0.30) inset;
        opacity:0; pointer-events:auto;
        z-index:9700;
        cursor:pointer; user-select:none;
        transition:opacity 480ms ease, transform 480ms ease;
      }
      #pp-chain-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
      #pp-chain-toast .pp-chain-toast-title {
        font-weight:700; letter-spacing:0.5px; color:#ffd8ec;
        margin-bottom:6px; font-size:13px;
      }
      #pp-chain-toast .pp-chain-toast-cta {
        margin-top:8px; font-size:12px; color:#c8b2e8;
      }
    `;
    document.head.appendChild(s);
  }

  // Returns true if this character should currently be locked from selection.
  function isLocked(char) {
    if (isSkipped()) return false;
    const s = step();
    // step 0: nothing met, but arrival hasn't played — everything locked
    if (s === 0) return true;
    // step 1: only alistair has been met. others locked until tutorial done.
    if (s === 1) return char !== 'alistair';
    // beyond: each step unlocks the next character
    const order = ['alistair','elian','lyra','caspian','lucien','noir','proto'];
    const idx = order.indexOf(char);
    if (idx < 0) return false;
    return idx >= s; // unlocked when s > idx
  }

  function lockText(char) {
    const s = step();
    if (s === 0) return 'You have not arrived yet.';
    if (s === 1 && char !== 'alistair') {
      if (tutorialReady()) return '\u2728 Ready. Slip out tonight.';
      return 'Care for Alistair first.';
    }
    const order = ['alistair','elian','lyra','caspian','lucien','noir','proto'];
    const idx = order.indexOf(char);
    if (idx < 0) return '';
    if (idx === s) {
      // The next-up character — show the bridge tagline as a hint
      return STEPS[idx + 1]?.tagline || 'Your path will lead you here.';
    }
    return 'Your path has not led here yet.';
  }

  function refreshGrid() {
    injectStyles();
    document.querySelectorAll('.select-card[data-character]').forEach(card => {
      const char = card.getAttribute('data-character');
      if (!char) return;
      // Respect existing locks (proto/noir use select-card-locked already for
      // legacy reasons; we add our own class so we never clobber the original).
      if (isLocked(char)) {
        card.classList.add('pp-chain-locked');
        card.setAttribute('data-pp-lock-text', lockText(char));
      } else {
        card.classList.remove('pp-chain-locked');
        card.removeAttribute('data-pp-lock-text');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Unlock toast
  // ---------------------------------------------------------------------------
  let _toastTimer = null;
  function toast(title, line, cta) {
    injectStyles();
    let el = document.getElementById('pp-chain-toast');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    el = document.createElement('div');
    el.id = 'pp-chain-toast';
    el.innerHTML = `
      <div class="pp-chain-toast-title">${title || ''}</div>
      <div>${line || ''}</div>
      ${cta ? `<div class="pp-chain-toast-cta">${cta}</div>` : ''}
    `;
    document.body.appendChild(el);
    // eslint-disable-next-line no-unused-expressions
    el.offsetHeight;
    el.classList.add('show');
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(close, 7200);
    function close() {
      el.classList.remove('show');
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 520);
    }
    el.addEventListener('click', close, { once: true });
    el.addEventListener('touchstart', close, { once: true, passive: true });
  }

  // Re-checked whenever care state changes — surfaces "ready to slip out" hint.
  let _readyToastShown = false;
  function refreshUnlockReadyToast() {
    if (_readyToastShown) return;
    if (step() !== 1) return;
    if (!tutorialReady()) return;
    _readyToastShown = true;
    toast(
      '\u2728 You feel restless tonight.',
      'The castle is too still. The south postern would not be hard to slip past.',
      'Tap Elian on the character grid to play the bridge.'
    );
    refreshGrid();
  }

  // ---------------------------------------------------------------------------
  // Advance — called by bridge files when they finish
  // ---------------------------------------------------------------------------
  function advance(toStep) {
    const target = (toStep | 0);
    if (target <= step()) { refreshGrid(); return; }
    setStepRaw(target);
    refreshGrid();
    const meta = STEPS[target];
    if (meta && meta.char) {
      // Mark met for downstream systems (phone-ui, multi-romance, etc.)
      lsSet('pp_met_' + meta.char, '1');
      lsSet('pp_ms_encounter_' + meta.char + '_seen', '1');
    }
    // Toast the unlock
    if (meta && meta.char) {
      toast(
        '\u2728 ' + meta.name + "'s route is open.",
        meta.tagline || '',
        ''
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Care-action hook for tutorial cycle
  // ---------------------------------------------------------------------------
  function classifyClick(target) {
    if (!target || !target.closest) return null;
    const sels = [
      ['feed',  '.feed-btn, [data-action="feed"], #feed-btn, #btn-feed'],
      ['clean', '.clean-btn, .wash-btn, [data-action="clean"], #clean-btn, #wash-btn'],
      ['talk',  '.talk-btn, [data-action="talk"], #talk-btn, #btn-talk, .chat-btn'],
      ['train', '.train-btn, [data-action="train"], #train-btn, .exercise-btn']
    ];
    for (const [k, sel] of sels) if (target.closest(sel)) return k;
    return null;
  }
  function onCareClick(e) {
    if (step() !== 1) return; // only matters during the tutorial gate
    const action = classifyClick(e.target);
    if (!action) return;
    // Only count if the active character is alistair
    let active = null;
    try {
      const g = window._game;
      if (g && (g.selectedCharacter || g.characterId)) active = g.selectedCharacter || g.characterId;
    } catch (_) {}
    if (!active) active = lsGet('pp_current_character');
    if (active !== 'alistair') return;
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

  // Hook the select-screen card clicks. If the player taps a card whose
  // char matches the current "next-up" step, fire the bridge first.
  function onSelectCardClick(e) {
    if (isSkipped()) return;
    const card = e.target && e.target.closest && e.target.closest('.select-card[data-character]');
    if (!card) return;
    const char = card.getAttribute('data-character');
    const order = ['alistair','elian','lyra','caspian','lucien','noir','proto'];
    const idx = order.indexOf(char);
    if (idx < 0) return;
    const s = step();

    // Locked entirely (not next-up)? swallow the click.
    if (idx > s) {
      e.preventDefault(); e.stopPropagation();
      // Friendly hint
      const meta = STEPS[idx + 1];
      toast('Not yet.', meta?.tagline || 'Your path has not led here yet.');
      return;
    }
    // Next-up? if the bridge for this char hasn't played, play it first.
    if (idx === s) {
      // For Elian: gate behind tutorial completion
      if (char === 'elian' && !tutorialReady()) {
        e.preventDefault(); e.stopPropagation();
        toast('Care for Alistair first.',
              'Reach his affection 25 and complete one full care cycle (feed, clean, talk, train).');
        return;
      }
      const launcher = bridgeLauncherFor(char);
      if (launcher) {
        e.preventDefault(); e.stopPropagation();
        launcher();
        return;
      }
    }
    // Already-unlocked: let the normal click proceed.
  }

  // ---------------------------------------------------------------------------
  // Boot — also kicks the arrival scene on a fresh save once the route is on
  // ---------------------------------------------------------------------------
  function tryArrival() {
    if (isSkipped()) return;
    if (step() !== 0) return;
    if (!routeOn()) return; // wait for player to enable main-story
    if (window.PPWorldArrival && typeof window.PPWorldArrival.play === 'function') {
      window.PPWorldArrival.play();
    }
  }

  function boot() {
    injectStyles();
    refreshGrid();
    document.addEventListener('click', onSelectCardClick, true);
    document.addEventListener('click', onCareClick, true);
    document.addEventListener('touchend', onCareClick, true);
    // Re-check grid periodically (the select-screen DOM may render after boot)
    setInterval(refreshGrid, 4000);
    // Try arrival scene once route flag flips on
    setInterval(tryArrival, 3000);
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
    cycle: getCycle,
    recordCare,
    toast,
    refreshGrid,
    reset() {
      try {
        localStorage.removeItem(STEP_KEY);
        localStorage.removeItem(SKIPPED_KEY);
        localStorage.removeItem(ALI_CYCLE_KEY);
      } catch (_) {}
      _readyToastShown = false;
      refreshGrid();
    }
  };
})();
