/* main-story.js — opt-in orchestrator for the "main story route"
 *
 * SAFETY CONTRACT:
 *  - Purely additive. No existing file is modified.
 *  - Feature-flagged. Off by default. Old saves are untouched.
 *  - Enable:  localStorage.setItem('pp_main_story_enabled','1'); location.reload();
 *  - Disable: localStorage.removeItem('pp_main_story_enabled'); location.reload();
 *  - All keys used here are prefixed `pp_ms_` so they cannot collide with game state.
 *  - If anything throws, the module silently disables itself and the original
 *    game flow is preserved.
 *
 * WHAT IT DOES WHEN ENABLED:
 *  - Gates the character select screen so only "unlocked" characters are tappable.
 *  - Drives a linear unlock order (Alistair → Elian → Lyra → Caspian → Lucien → Noir → Proto)
 *    — unlocks advance when the player reaches storyDay 3 with the prior character.
 *  - On a brand-new player (no existing saves), runs the interaction-first
 *    Alistair encounter from encounter-alistair.js before revealing the select grid.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const STAGE_KEY = 'pp_ms_stage';          // integer: how many chars are unlocked
  const ENCOUNTER_KEY = 'pp_ms_encounter_alistair_seen';

  // Unlock order. Matches the game's 7 characters.
  const UNLOCK_ORDER = ['alistair', 'elian', 'lyra', 'caspian', 'lucien', 'noir', 'proto'];

  // Day threshold on a prior character that unlocks the next one.
  const UNLOCK_AFTER_STORY_DAY = 3;

  // ---------------------------------------------------------------
  function isEnabled() {
    try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; }
  }

  function getStage() {
    try {
      const v = parseInt(localStorage.getItem(STAGE_KEY) || '1', 10);
      return Number.isFinite(v) && v >= 1 ? v : 1;
    } catch (e) { return 1; }
  }

  function setStage(n) {
    try { localStorage.setItem(STAGE_KEY, String(n)); } catch (e) {}
  }

  function unlockedSet() {
    const stage = getStage();
    return new Set(UNLOCK_ORDER.slice(0, stage));
  }

  function hasAnyExistingSave() {
    try {
      for (const c of UNLOCK_ORDER) {
        if (localStorage.getItem('pocketLoveSave_' + c)) return true;
      }
    } catch (e) {}
    return false;
  }

  function alistairEncounterSeen() {
    try { return localStorage.getItem(ENCOUNTER_KEY) === '1'; } catch (e) { return false; }
  }

  // ---------------------------------------------------------------
  // Apply the gate to the character select grid. Re-runs every time the
  // select screen becomes visible, because game.js has its own card refresh.
  function applyGateToSelectGrid() {
    const grid = document.getElementById('select-grid');
    if (!grid) return;
    const unlocked = unlockedSet();
    grid.querySelectorAll('.select-card').forEach((card) => {
      const id = card.getAttribute('data-character');
      if (!id) return;

      // Don't fight with existing silhouette logic for proto/noir if they're
      // already hidden/locked — only override for the main-story-locked ones.
      const msLocked = !unlocked.has(id);

      // We use our own class + attribute so we never clobber existing classes.
      card.classList.toggle('ms-locked', msLocked);
      card.setAttribute('data-ms-locked', msLocked ? '1' : '0');

      // When main-story has unlocked Proto or Noir, override the game's own
      // silhouette lock so the player can actually pick them. The game will
      // re-apply `.select-card-locked` on its own refresh cycle, so we just
      // keep yanking it back off — the MutationObserver + poll in
      // watchSelectScreen() brings us here repeatedly.
      if (!msLocked && (id === 'proto' || id === 'noir')) {
        if (card.classList.contains('select-card-locked')) {
          card.classList.remove('select-card-locked');
        }
      }

      // Keep the click-intercept idempotent.
      if (msLocked && !card._msClickBound) {
        card._msClickHandler = function (e) {
          if (card.getAttribute('data-ms-locked') === '1') {
            e.stopPropagation();
            e.preventDefault();
            showLockedHint(id);
          }
        };
        card.addEventListener('click', card._msClickHandler, true); // capture → runs first
        card._msClickBound = true;
      }
    });
  }

  // Small hint when a locked card is tapped.
  let _hintTimer = null;
  function showLockedHint(id) {
    let el = document.getElementById('ms-locked-hint');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ms-locked-hint';
      el.style.cssText = [
        'position:fixed', 'left:50%', 'bottom:12%', 'transform:translateX(-50%)',
        'background:rgba(20,10,35,0.92)', 'color:#f4e6ff', 'padding:12px 18px',
        'border-radius:22px', 'font-size:14px', 'z-index:9999',
        'box-shadow:0 4px 20px rgba(0,0,0,0.5)', 'opacity:0',
        'transition:opacity 260ms ease', 'pointer-events:none', 'max-width:78%',
        'text-align:center', 'line-height:1.4', 'font-style:italic'
      ].join(';');
      document.body.appendChild(el);
    }
    el.textContent = hintFor(id);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    clearTimeout(_hintTimer);
    _hintTimer = setTimeout(() => { el.style.opacity = '0'; }, 2400);
  }

  function hintFor(id) {
    const h = {
      elian:   'You haven\u2019t wandered into the forest yet.',
      lyra:    'The caves are still silent. Keep going.',
      caspian: 'The court hasn\u2019t noticed you. Not yet.',
      lucien:  'The tower is closed. For now.',
      noir:    'Something sealed. Not yet.',
      proto:   'The wards are stable. For now.'
    };
    return h[id] || 'Not yet.';
  }

  // ---------------------------------------------------------------
  // Registry of optional "meet-cute" encounters per character. Each encounter
  // module registers itself as window.MSEncounter<Name> with { play, seenKey }.
  // If a character has no encounter registered, unlock is silent.
  function encounterFor(id) {
    const key = 'MSEncounter' + id.charAt(0).toUpperCase() + id.slice(1);
    const mod = window[key];
    if (!mod || typeof mod.play !== 'function' || !mod.seenKey) return null;
    try { if (localStorage.getItem(mod.seenKey) === '1') return null; } catch (_) { return null; }
    return mod;
  }

  // ---------------------------------------------------------------
  // Advance the unlock stage if the current save is "mature enough".
  // Runs on character-select entry. Never demotes.
  // Returns the id of a newly-unlocked character (if any).
  function maybeAdvanceStage() {
    try {
      const stage = getStage();
      if (stage >= UNLOCK_ORDER.length) return null;
      const prior = UNLOCK_ORDER[stage - 1];
      const raw = localStorage.getItem('pocketLoveSave_' + prior);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const day = data && typeof data.storyDay === 'number' ? data.storyDay : 0;
      if (day >= UNLOCK_AFTER_STORY_DAY) {
        const newlyUnlocked = UNLOCK_ORDER[stage]; // the character that stage+1 grants
        setStage(stage + 1);
        return newlyUnlocked;
      }
    } catch (e) { /* noop */ }
    return null;
  }

  // ---------------------------------------------------------------
  // Inject minimal style for the gate. Scoped to our own class so nothing
  // else restyles.
  function injectStyles() {
    if (document.getElementById('ms-style')) return;
    const s = document.createElement('style');
    s.id = 'ms-style';
    s.textContent = `
      .select-card.ms-locked { filter: grayscale(0.85) brightness(0.55); cursor: default; position: relative; }
      .select-card.ms-locked::after {
        content: '\u2728';
        position: absolute; top: 8px; right: 10px;
        font-size: 14px; opacity: 0.7;
      }
      .select-card.ms-locked .select-card-name,
      .select-card.ms-locked .select-card-role { opacity: 0.4; }
    `;
    document.head.appendChild(s);
  }

  // ---------------------------------------------------------------
  // Watch the select screen; when it becomes visible, apply gate and
  // optionally play a "meet-cute" encounter for any newly-unlocked character.
  let _encounterPlaying = false;
  function watchSelectScreen() {
    const sel = document.getElementById('select-screen');
    if (!sel) return;
    const run = () => {
      if (sel.classList.contains('hidden')) return;
      if (_encounterPlaying) return;

      const newlyUnlocked = maybeAdvanceStage();
      if (newlyUnlocked) {
        const enc = encounterFor(newlyUnlocked);
        if (enc) {
          _encounterPlaying = true;
          // Briefly hide the select screen so the overlay has the stage to itself
          sel.classList.add('hidden');
          enc.play(function onDone() {
            try { localStorage.setItem(enc.seenKey, '1'); } catch (_) {}
            sel.classList.remove('hidden');
            _encounterPlaying = false;
            applyGateToSelectGrid();
          });
          return;
        }
      }
      applyGateToSelectGrid();
    };
    // Initial
    run();
    // Watch for class changes (show/hide)
    const mo = new MutationObserver(run);
    mo.observe(sel, { attributes: true, attributeFilter: ['class', 'style'] });
    // Poll as a cheap fallback in case game.js mutates children later
    setInterval(run, 1500);
  }

  // ---------------------------------------------------------------
  // First-time flow for brand-new players with the flag enabled.
  // If there are no saves yet and the Alistair encounter hasn't run,
  // hook the title's Start button to run our encounter before the world
  // intro. Encounter is in encounter-alistair.js (loaded separately).
  function maybeHookFirstEncounter() {
    if (hasAnyExistingSave()) return;    // don't disturb returning players
    if (alistairEncounterSeen()) return;
    if (typeof window.MSEncounterAlistair !== 'object') return; // module not loaded

    const startBtn = document.getElementById('title-start-btn');
    if (!startBtn) return;

    // We capture the click before game.js's handler runs. Our handler runs
    // the encounter, then lets the player continue into the normal flow.
    startBtn.addEventListener('click', function onceStart(e) {
      if (alistairEncounterSeen()) return; // belt-and-suspenders
      e.stopPropagation();
      e.preventDefault();
      startBtn.removeEventListener('click', onceStart, true);

      window.MSEncounterAlistair.play(function onDone() {
        try { localStorage.setItem(ENCOUNTER_KEY, '1'); } catch (_) {}
        // Set stage to 1 (Alistair unlocked) if not already set higher
        if (getStage() < 1) setStage(1);
        // Hand off to the normal Start flow
        startBtn.click();
      });
    }, true);
  }

  // ---------------------------------------------------------------
  function boot() {
    if (!isEnabled()) return; // strict no-op when disabled
    try {
      injectStyles();
      watchSelectScreen();
      // Wait a tick so encounter-alistair.js has time to register itself.
      setTimeout(maybeHookFirstEncounter, 50);
    } catch (e) {
      console.warn('[main-story] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Public hooks (read-only, debugging only)
  window.MainStory = {
    isEnabled,
    getStage,
    unlockedSet: () => Array.from(unlockedSet()),
    _debug_setStage: setStage,
    _debug_resetEncounter: function () { try { localStorage.removeItem(ENCOUNTER_KEY); } catch (_) {} },
  };
})();
