/* main-story-integration.js — makes the main-story route feel like ONE game
 * instead of two systems layered on top of each other.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Feature-flagged on pp_main_story_enabled. No edits to
 *    game.js, intro.js, or any other original file.
 *  - Every integration is a gentle defer/suppress \u2014 never a mutation of
 *    story state, never a deletion of existing flags.
 *
 * WHAT IT DOES:
 *  1. DOUBLE-INTRO FIX.
 *     When a player finishes my meet-cute for a character, set the game\u2019s
 *     own `pp_intro_<charId>` flag so intro.js doesn\u2019t replay a second
 *     "first meeting" cinematic when they pick that character.
 *
 *  2. ENDING DEFERRAL.
 *     If the game has already fired a native ending (save.endingPlayed set),
 *     skip my corresponding ending card. Also vice-versa: if my ending has
 *     played, mark the save so the game\u2019s native ending logic treats it
 *     as handled.
 *
 *  3. IDLE-THOUGHT POLITENESS.
 *     When the game\u2019s idle-life thought bubble is on screen, hide my
 *     adaptive-thought bubble. Also throttle the adaptive-thought poll from
 *     12s to 30s so it\u2019s quieter.
 *
 *  4. DAY-PROGRESS / DAILY-PURPOSE MERGE.
 *     While my daily-purpose banner is visible, hide the game\u2019s
 *     `#day-progress` strip. They serve the same "what\u2019s today about"
 *     purpose, and showing both adds visual noise.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  function isEnabled() {
    try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; }
  }

  // ---------------------------------------------------------------
  // 1) DOUBLE-INTRO FIX
  //
  // Poll localStorage for pp_ms_encounter_<char>_seen flags. When one flips
  // to '1', also set pp_intro_<char>='1' so intro.js skips its native intro
  // for that character. We poll because the meet-cute module writes the
  // flag asynchronously on onDone, and we don\u2019t want to touch that file.
  // ALL 7 characters now have post-bridge-timeline intros (with name
  // prompts + post-name beats) authored in intro.js. Each one is
  // INTENDED to fire as the care-route intro the first time the
  // player picks that character. Auto-suppressing pp_intro_<char>
  // here would block the name prompt and break the scene.
  // The CHARS list is empty — no characters get auto-suppressed.
  // (Kept the loop scaffolding so re-introducing suppression for any
  // future character is just adding their id back to this list.)
  const CHARS = [];
  let _encSnap = {};
  function syncIntroFlags() {
    if (!isEnabled()) return;
    try {
      for (const c of CHARS) {
        const k = 'pp_ms_encounter_' + c + '_seen';
        const now = localStorage.getItem(k);
        if (now === '1' && !_encSnap[c]) {
          _encSnap[c] = true;
          // Only set if not already set — never overwrite a deliberate game flag.
          if (!localStorage.getItem('pp_intro_' + c)) {
            localStorage.setItem('pp_intro_' + c, '1');
          }
        }
      }
    } catch (_) {}
  }

  // ---------------------------------------------------------------
  // 2) ENDING DEFERRAL
  //
  // Wrap MSEndings\u2019s maybePlayEnding concept by intercepting at the
  // pp:quest-complete layer and by poll-filtering when endings.js tries to
  // play. Simpler approach: monkey-hook window.MSCard.show for ending cards
  // and block if the save already has endingPlayed.
  function activeSaveFor(charId) {
    try {
      const raw = localStorage.getItem('pocketLoveSave_' + charId);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  let _cardShowWrapped = false;
  function wrapCardShowForEndings() {
    if (_cardShowWrapped) return;
    if (!window.MSCard || typeof window.MSCard.show !== 'function') return;
    const origShow = window.MSCard.show;
    window.MSCard.show = function (card, onDone) {
      try {
        if (isEnabled() && card && typeof card.id === 'string' && card.id.startsWith('ending_')) {
          const m = card.id.match(/^ending_([a-z]+)_/);
          if (m) {
            const charId = m[1];
            const save = activeSaveFor(charId);
            const alreadyEnded = save && save.endingPlayed && save.endingPlayed !== null && save.endingPlayed !== '';
            if (alreadyEnded) {
              // Game already gave this character an ending. Mark our seen
              // flag so the player\u2019s gallery still reflects progression,
              // and invoke onDone silently.
              try { localStorage.setItem('pp_ending_seen_' + charId, '1'); } catch (_) {}
              // Map the game\u2019s ending to the closest branch name so the
              // gallery has a reasonable label.
              const branchMap = { bond: 'good', true_bond: 'good', corrupted: 'dark', lost: 'bittersweet' };
              const branch = branchMap[save.endingPlayed] || 'good';
              try { localStorage.setItem('pp_ending_branch_' + charId, branch); } catch (_) {}
              try { onDone && onDone(); } catch (_) {}
              return;
            }
          }
        }
      } catch (_) {}
      return origShow.call(this, card, onDone);
    };
    _cardShowWrapped = true;
  }

  // ---------------------------------------------------------------
  // 3) IDLE-THOUGHT POLITENESS
  //
  // When the game's native idle thought is showing, hide ours. The game uses
  // `.idle-thought` / `#idle-thought-bubble` style elements \u2014 we look for
  // any visible element whose id/class contains "idle" and "thought".
  function gameIdleThoughtVisible() {
    const selectors = [
      '#idle-thought',
      '#idle-thought-bubble',
      '.idle-thought',
      '.idle-thought-bubble',
      '[class*="idle-thought"]:not([class*="hidden"])'
    ];
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el && el.offsetParent && parseFloat(getComputedStyle(el).opacity) > 0.1) return true;
      } catch (_) {}
    }
    return false;
  }

  function installAdaptivePoliteness() {
    // Hide our bubble immediately any time the game\u2019s idle thought is up.
    setInterval(() => {
      if (!isEnabled()) return;
      if (gameIdleThoughtVisible()) {
        const ours = document.getElementById('adaptive-thought');
        if (ours) ours.style.opacity = '0';
      }
    }, 700);
  }

  // ---------------------------------------------------------------
  // 4) DAY-PROGRESS / DAILY-PURPOSE MERGE
  //
  // When my dp-banner is visible and non-empty, dim the game\u2019s
  // #day-progress strip. The player already has a "today" signal \u2014
  // showing both is redundant.
  function installProgressMerge() {
    setInterval(() => {
      const strip = document.getElementById('day-progress');
      if (!strip) return;
      if (!isEnabled()) {
        strip.style.removeProperty('opacity');
        strip.style.removeProperty('pointer-events');
        return;
      }
      const banner = document.getElementById('dp-banner');
      const bannerShown = banner && parseFloat(banner.style.opacity || '0') > 0.2;
      if (bannerShown) {
        strip.style.opacity = '0.25';
        strip.style.pointerEvents = 'none';
      } else {
        strip.style.opacity = '';
        strip.style.pointerEvents = '';
      }
    }, 800);
  }

  // ---------------------------------------------------------------
  // 5) START \u2192 MAIN STORY redirect
  //
  // When main-story is on and the Prologue hasn\u2019t been played yet, the
  // player\u2019s first tap on START should open the Main Story page instead of
  // the game\u2019s world-intro. The Prologue *is* the world intro \u2014 playing
  // both would duplicate narration.
  function installStartRedirect() {
    // Register on window at CAPTURE phase so we fire BEFORE any element-level
    // listener (including main-story.js\u2019s old first-encounter hook and
    // game.js\u2019s start handler). stopImmediatePropagation() blocks them from
    // running at all when chapters drive the flow.
    window.addEventListener('click', function(e) {
      if (!isEnabled()) return;
      const t = e.target;
      if (!t || typeof t.closest !== 'function') return;
      const btn = t.closest('#title-start-btn');
      if (!btn) return;
      if (!window.MSChapters || typeof window.MSChapters.open !== 'function') return;
      const prologueDone = localStorage.getItem('pp_chapter_done_0') === '1';
      if (prologueDone) return;  // normal flow \u2014 they\u2019ll land in select, orb available there

      // Block every other click handler on this button (main-story.js\u2019s
      // first-encounter hook, game.js\u2019s own start handler).
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();

      // Pre-flag the world-intro so if the player closes the page and
      // clicks START again, the game\u2019s narration still doesn\u2019t fire
      // (Prologue covers the same ground).
      try { localStorage.setItem('pp_world_intro_seen', '1'); } catch (_) {}

      // Hide the title screen so when chapters page closes, we\u2019re not
      // stuck behind a dim title.
      const title = document.getElementById('title-screen');
      if (title) title.classList.add('hidden');

      // Fire the Prologue automatically. Chapter 0\u2019s onDone already calls
      // refreshOrb() + openPageSoftly() so the Main Story page will open
      // right after the Prologue finishes.
      if (typeof window.MSChapters.play === 'function') {
        window.MSChapters.play(0);
      } else {
        window.MSChapters.open();
      }
    }, true); // capture
  }

  // ---------------------------------------------------------------
  // 5b) CHAPTER \u2194 MAIN-STORY STAGE SYNC
  //
  // chapters.js tracks its own progress (pp_chapter_done_<n>), but
  // main-story.js\u2019s character-gate on the select grid is driven by
  // `pp_ms_stage`. Without a sync, Proto/Noir stay locked even after
  // their chapters complete. Map completed chapters \u2192 required stage.
  //   Ch1 Alistair \u2192 stage 1
  //   Ch2 Elian    \u2192 stage 2
  //   Ch3 Lyra     \u2192 stage 3
  //   Ch4 Caspian  \u2192 stage 4
  //   Ch5 Lucien   \u2192 stage 5
  //   Ch6 Noir     \u2192 stage 6
  //   Ch7 Proto    \u2192 stage 7
  function syncStageToChapters() {
    if (!isEnabled()) return;
    try {
      let highestChar = 0;
      for (let i = 1; i <= 7; i++) {
        if (localStorage.getItem('pp_chapter_done_' + i) === '1') highestChar = i;
      }
      if (highestChar === 0) return;
      const current = parseInt(localStorage.getItem('pp_ms_stage') || '1', 10);
      if (!Number.isFinite(current) || current < highestChar) {
        localStorage.setItem('pp_ms_stage', String(highestChar));
      }
    } catch (_) {}
  }

  // ---------------------------------------------------------------
  // 6) PROLOGUE completion \u2192 mark game world-intro seen
  //
  // So returning players never see the game\u2019s native world-intro after
  // they\u2019ve played the Prologue.
  function watchPrologueDone() {
    setInterval(() => {
      if (!isEnabled()) return;
      if (localStorage.getItem('pp_chapter_done_0') === '1' &&
          localStorage.getItem('pp_world_intro_seen') !== '1') {
        try { localStorage.setItem('pp_world_intro_seen', '1'); } catch (_) {}
      }
    }, 1500);
  }

  // ---------------------------------------------------------------
  function boot() {
    if (!isEnabled()) return;
    try {
      // Seed encounter snapshot with current state so we don't fire on boot
      for (const c of CHARS) {
        _encSnap[c] = localStorage.getItem('pp_ms_encounter_' + c + '_seen') === '1';
        // Back-fill: if a meet-cute has ALREADY been seen but the game's
        // intro flag wasn't set, set it now so returning players benefit.
        if (_encSnap[c] && !localStorage.getItem('pp_intro_' + c)) {
          localStorage.setItem('pp_intro_' + c, '1');
        }
      }
      setInterval(syncIntroFlags, 1500);

      // Wait a tick so MSCard / MSEndings are registered
      setTimeout(wrapCardShowForEndings, 100);

      installAdaptivePoliteness();
      installProgressMerge();
      // installStartRedirect() — DISABLED. Conflicted with the new unified
      // flow (world intro → arrival → bridge-alistair → chapter 1 → care).
      // The legacy redirect intercepted the Start click and fired the
      // chapter-system Prologue instead, which left the player stuck because
      // it ran above all main screens and bypassed the chain.
      // installStartRedirect();
      watchPrologueDone();
      // Keep main-story stage in sync with chapter progress
      setInterval(syncStageToChapters, 1500);
      syncStageToChapters();
    } catch (e) {
      console.warn('[main-story-integration] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.MainStoryIntegration = {
    isEnabled,
    syncIntroFlags,
    _debug_resetIntros: () => {
      try { CHARS.forEach(c => localStorage.removeItem('pp_intro_' + c)); } catch (_) {}
    }
  };
})();
