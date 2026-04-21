/* daily-purpose.js — a small "today's focus" goal system.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. No mutation of game state. Reads window._game only.
 *  - Feature-flagged: requires localStorage.pp_main_story_enabled === '1'.
 *    Off by default; a no-op when off.
 *  - All storage keys prefixed `pp_dp_`. No collisions with existing game state.
 *  - If anything throws, the module silently disables itself.
 *
 * HOW IT WORKS:
 *  - Polls window._game every 1s. If there's an active character, looks up
 *    the quest for their current storyDay.
 *  - Shows a small banner top-center reading "TODAY \u00b7 <objective>".
 *  - Checks completion conditions against game state (stats, interactions, etc.).
 *  - On completion: banner gold-pulses, plays a chime, and flags the save so
 *    the same quest doesn't re-pop later that day.
 *  - Completion state cached per character+day. Resets naturally when storyDay
 *    advances.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const BANNER_ID = 'dp-banner';
  const POLL_MS = 1000;

  // Quest definitions, one per story day. Completion signatures are pure
  // read-only probes against snapshots of the game instance.
  //
  // `detect(game, snap)` returns true when complete. `snap` is the per-visit
  // baseline we capture when the quest first becomes active — lets us check
  // deltas like "Talk 3 more times today" without mutating game state.
  const QUESTS = [
    { // Day 1
      id: 'd1',
      label: 'Spend a moment \u2014 one Talk.',
      baseline: (g) => ({ talkScore: g.talkScore || 0 }),
      detect:   (g, s) => (g.talkScore || 0) > s.talkScore,
    },
    { // Day 2
      id: 'd2',
      label: 'Feed them once \u2014 they\u2019re watching.',
      baseline: (g) => ({ timesFed: g.timesFed || 0 }),
      detect:   (g, s) => (g.timesFed || 0) > s.timesFed,
    },
    { // Day 3
      id: 'd3',
      label: 'Keep every stat above 40 today.',
      baseline: () => ({}),
      detect:   (g) => (g.hunger|0) > 40 && (g.clean|0) > 40 && (g.bond|0) > 40,
    },
    { // Day 4
      id: 'd4',
      label: 'Talk three times. Let them feel heard.',
      baseline: (g) => ({ talkScore: g.talkScore || 0 }),
      detect:   (g, s) => (g.talkScore || 0) >= s.talkScore + 3,
    },
    { // Day 5
      id: 'd5',
      label: 'Bond above 60 today.',
      baseline: () => ({}),
      detect:   (g) => (g.bond|0) >= 60,
    },
    { // Day 6
      id: 'd6',
      label: 'A full round \u2014 Feed, Wash, and Talk.',
      baseline: (g) => ({ fed: g.timesFed || 0, washed: g.timesWashed || 0, talked: g.talkScore || 0 }),
      detect:   (g, s) => (g.timesFed || 0) > s.fed && (g.timesWashed || 0) > s.washed && (g.talkScore || 0) > s.talked,
    },
    { // Day 7
      id: 'd7',
      label: 'Give them a gift \u2014 make it count.',
      baseline: (g) => ({ gifted: g.totalGifts || g.giftCount || 0 }),
      detect:   (g, s) => ((g.totalGifts || g.giftCount || 0) > s.gifted),
    },
  ];

  function isEnabled() {
    try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; }
  }

  function questFor(day) {
    const i = Math.max(1, Math.min(QUESTS.length, day|0)) - 1;
    return QUESTS[i];
  }

  // Per-character+day completion flag
  function doneKey(charId, day) { return `pp_dp_done_${charId}_d${day}`; }
  function baseKey(charId, day) { return `pp_dp_base_${charId}_d${day}`; }

  function loadBase(charId, day) {
    try {
      const raw = localStorage.getItem(baseKey(charId, day));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function saveBase(charId, day, snap) {
    try { localStorage.setItem(baseKey(charId, day), JSON.stringify(snap)); } catch (e) {}
  }
  function isDone(charId, day) {
    try { return localStorage.getItem(doneKey(charId, day)) === '1'; } catch (e) { return false; }
  }
  function markDone(charId, day) {
    try { localStorage.setItem(doneKey(charId, day), '1'); } catch (e) {}
  }

  // ---------------------------------------------------------------
  // DOM
  function ensureBanner() {
    let b = document.getElementById(BANNER_ID);
    if (b) return b;
    b = document.createElement('div');
    b.id = BANNER_ID;
    b.style.cssText = [
      // Sit below the game topbar so STRANGER→/day dots aren't obscured.
      'position:fixed', 'left:50%', 'top:52px', 'transform:translateX(-50%) translateY(-8px)',
      'max-width:72%', 'padding:6px 12px', 'border-radius:14px',
      'background:rgba(16,12,28,0.82)', 'color:#f4e6ff',
      'font-size:12px', 'letter-spacing:0.5px', 'line-height:1.35',
      'box-shadow:0 4px 14px rgba(0,0,0,0.4)', 'backdrop-filter:blur(6px)',
      'z-index:80', 'opacity:0', 'pointer-events:none', 'text-align:center',
      'transition:opacity 400ms ease, transform 400ms ease, background 500ms ease'
    ].join(';');
    b.innerHTML = '<span style="font-weight:600;opacity:0.6;letter-spacing:1.5px;font-size:10px;">TODAY</span>'
                + '<span style="opacity:0.4;margin:0 6px;">\u00b7</span>'
                + '<span id="dp-banner-text"></span>';
    document.body.appendChild(b);
    return b;
  }

  function setBanner(text) {
    const b = ensureBanner();
    const t = b.querySelector('#dp-banner-text');
    if (t) t.textContent = text;
    b.style.opacity = '1';
    b.style.transform = 'translateX(-50%) translateY(0)';
  }

  function hideBanner() {
    const b = document.getElementById(BANNER_ID);
    if (!b) return;
    b.style.opacity = '0';
    b.style.transform = 'translateX(-50%) translateY(-8px)';
  }

  function pulseComplete(finalText) {
    const b = document.getElementById(BANNER_ID);
    if (!b) return;
    const t = b.querySelector('#dp-banner-text');
    if (t) t.textContent = finalText || '\u2728 complete';
    b.style.background = 'linear-gradient(180deg, rgba(250,220,120,0.92), rgba(230,180,80,0.85))';
    b.style.color = '#201510';
    b.style.boxShadow = '0 6px 22px rgba(240,200,90,0.35)';
    // Small sparkle bounce
    b.animate(
      [
        { transform: 'translateX(-50%) translateY(0) scale(1)' },
        { transform: 'translateX(-50%) translateY(-2px) scale(1.04)' },
        { transform: 'translateX(-50%) translateY(0) scale(1)' }
      ],
      { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)' }
    );
    // Fade out after a beat
    setTimeout(() => {
      b.style.opacity = '0';
    }, 2400);
  }

  function softChime() {
    try {
      // Prefer existing sound module if available; fall back silently.
      if (window.sounds && typeof window.sounds.chime === 'function') window.sounds.chime();
    } catch (e) {}
  }

  // ---------------------------------------------------------------
  // Polling
  let _lastDay = 0;
  let _lastChar = '';
  function tick() {
    if (!isEnabled()) { hideBanner(); return; }
    const g = window._game;
    if (!g || !(g.characterId || g.selectedCharacter)) { hideBanner(); return; }

    const charId = g.characterId || g.selectedCharacter;
    const day = g.storyDay | 0;
    if (day < 1) { hideBanner(); return; }

    const quest = questFor(day);
    if (!quest) { hideBanner(); return; }

    // Day or character changed — refresh banner & baseline if needed
    if (day !== _lastDay || charId !== _lastChar) {
      _lastDay = day;
      _lastChar = charId;
    }

    if (isDone(charId, day)) { hideBanner(); return; }

    // First sight of this quest — capture baseline snapshot
    let base = loadBase(charId, day);
    if (!base) {
      try { base = quest.baseline(g); } catch (e) { base = {}; }
      saveBase(charId, day, base);
    }

    setBanner(quest.label);

    // Check completion
    let done = false;
    try { done = !!quest.detect(g, base); } catch (e) { done = false; }
    if (done) {
      markDone(charId, day);
      pulseComplete('\u2728 well done');
      softChime();
      // Dispatch a global event so other modules (e.g. premium cards) can
      // react without tight coupling.
      try {
        document.dispatchEvent(new CustomEvent('pp:quest-complete', {
          detail: { charId: charId, day: day, questId: quest.id }
        }));
      } catch (_) {}
    }
  }

  // ---------------------------------------------------------------
  function boot() {
    if (!isEnabled()) return;
    try {
      // Periodic tick — 1s is plenty; negligible cost.
      setInterval(tick, POLL_MS);
      // Also run once soon after load so the banner appears as fast as possible.
      setTimeout(tick, 400);
    } catch (e) {
      console.warn('[daily-purpose] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Debug hooks
  window.DailyPurpose = {
    isEnabled,
    currentQuest: () => {
      const g = window._game; if (!g) return null;
      return questFor(g.storyDay | 0);
    },
    _debug_reset: () => {
      try {
        Object.keys(localStorage).filter(k => k.startsWith('pp_dp_')).forEach(k => localStorage.removeItem(k));
      } catch (e) {}
    }
  };
})();
