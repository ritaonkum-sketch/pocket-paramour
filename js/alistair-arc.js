/* alistair-arc.js — duty-vs-love consequence chain.
 *
 * WHY THIS FILE EXISTS:
 *  The existing turning-point ([turning-points.js]) gives the player a
 *  binary "go vs stay" choice for Alistair at affection ≥ 35. Both
 *  branches resolve too cleanly — neither path costs him anything.
 *  The character profile says his wound is "guarding empty doorways"
 *  and that "I would die for you" should be ROUTINE that breaks open
 *  later. None of that has ever played in a scene.
 *
 *  This file adds the cost. Two scenes that fire AFTER the turning
 *  point and require the player to have made that choice:
 *
 *    1. THE FAILURE  (affection ≥ 55, post-TP)
 *       — Branched by pp_tp_alistair_choice:
 *         'go'   → he came back too late. He missed something he
 *                  promised her he'd be there for. He returns wounded
 *                  in body but the wound he leads with is the broken
 *                  promise.
 *         'stay' → he stayed. The council branded him deserter. He
 *                  walks in stripped of rank, sword surrendered, the
 *                  oath he held since fifteen now a rumor in the
 *                  barracks. He failed his old self for her.
 *       — Either branch ends with him kneeling, asking forgiveness,
 *         and saying "I would die for you" — meaning it for the first
 *         time, no longer routine.
 *
 *    2. THE TENDING  (affection ≥ 65, after Failure seen)
 *       — She removes his gauntlet. He doesn't stop her. First earned
 *         contact. He says nothing for a long time, then admits he
 *         said the line a hundred times in his life and never once
 *         meant it the way he means it now.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Feature-flagged on pp_main_story_enabled.
 *  - Will not fire unless the turning-point has been answered
 *    (pp_tp_alistair_choice is set).
 *  - Will not fire unless the matching affection-scene tier is also
 *    seen — keeps the order: warm → closer → chosen → FAILURE →
 *    TENDING → midnight → aftermath.
 *  - One-shot via pp_alistair_failure_seen / pp_alistair_tending_seen.
 *  - Suppressed during chains, modals, scenes, panels.
 *  - Read-only of window._game.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const POLL_MS = 7000;
  const TP_KEY = 'pp_tp_alistair_choice';

  const FAILURE_KEY = 'pp_alistair_failure_seen';
  const TENDING_KEY = 'pp_alistair_tending_seen';

  // Affection gates (the same units affection-scenes uses: 0–100).
  const FAILURE_MIN = 55;
  const TENDING_MIN = 65;

  function isEnabled() {
    try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; }
  }
  function get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function set(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function isSeen(key) { return get(key) === '1'; }
  function markSeen(key) { set(key, '1'); }

  function tpChoice() { return get(TP_KEY); } // 'go' | 'stay' | null

  function affection(g) {
    if (!g) return 0;
    return (g.affection != null ? g.affection : (g.affectionLevel ? g.affectionLevel * 25 : 0)) | 0;
  }

  // The Failure must come AFTER the chosen-tier affection scene, so the
  // ladder reads: warm → closer → chosen → FAILURE → TENDING → midnight.
  function chosenSeen() {
    return get('pp_aff_alistair_chosen') === '1';
  }
  function failureSeen() { return isSeen(FAILURE_KEY); }
  function tendingSeen() { return isSeen(TENDING_KEY); }

  // ---------------------------------------------------------------
  // SCENES
  // ---------------------------------------------------------------
  const PALETTE_NIGHT = { bg: '#06080f', glow: '#ffce6b', accent: '#fff4de' };
  const PALETTE_DAWN  = { bg: '#0c1224', glow: '#ffd9a0', accent: '#fff4de' };
  const BG_HALL       = 'assets/bg-alistair-hall.png';
  const BG_ROOM       = 'assets/bg-knight-room.png';

  // ---- THE FAILURE — 'go' branch ----
  // The player told him to keep his oath. He went. He came back wounded.
  // The wound he leads with is not the gash on his side — it is the
  // promise he could not keep.
  const FAILURE_GO = {
    title: 'THE FAILURE',
    subtitle: 'ALISTAIR · He Returned Too Late',
    speaker: 'ALISTAIR',
    palette: PALETTE_NIGHT,
    bg: BG_HALL,
    beats: [
      { type: 'show', pose: 'assets/alistair/body/soft-sad.png', wait: 900 },
      { type: 'line', text: 'I am sorry, mi’lady. — I should have come yesterday. — I told you I would. — I did not.', hold: 3200, cps: 24 },
      { type: 'line', text: '*there is dried blood on the linen at his side, badly bandaged, the work of someone in a hurry on horseback* — The campaign held. — The line held. — …The promise to you did not.', hold: 4200, cps: 24 },
      { type: 'pose', src: 'assets/alistair/body/thinking2.png', animate: 'swap' },
      { type: 'line', text: 'I rode for two days without sleeping. — The whole way I rehearsed what I would say when I walked through that door. — None of it was good enough. — None of it is good enough.', hold: 4800, cps: 24 },
      { type: 'line', text: 'I have kept oaths to kings I never met. — I have kept oaths to captains who are buried now. — The first oath I made in my own voice — the one to be there — I broke. — You waited. — *quiet* — I know you waited.', hold: 5400, cps: 22 },
      { type: 'flourish', text: '✦', duration: 1600 },
      { type: 'pose', src: 'assets/alistair/body/shy3.png', animate: 'swap' },
      { type: 'line', text: '*lowers himself onto one knee — the wounded side wincing as he does, but he does not stop, does not let you stop him* — I have knelt for kings. — I have knelt for captains. — I am kneeling for you. — Not because you are above me. — Because I owe you something I cannot pay standing up.', hold: 6200, cps: 22 },
      { type: 'line', text: 'I have said “I would die for you” a hundred times in my life. — To kings. To captains. To strangers in burning villages. — *quieter* — I always meant it the easy way. — The kind a soldier says without thinking. — …I am saying it now and it is not easy. — I would die for you, mi’lady. — The way I never meant before.', hold: 6800, cps: 20 },
      { type: 'line', text: 'Forgive me. — Or do not. — *head still bowed, voice steady* — Either way I will be here tomorrow. — I will be on time. — I will be on time for the rest of my life. — That is the oath I am taking now. — Out loud. — So you have heard it.', hold: 6000, cps: 22 },
      { type: 'hide' }
    ]
  };

  // ---- THE FAILURE — 'stay' branch ----
  // He stayed. The council branded him deserter. He walks in stripped of
  // rank, sword surrendered. The wound is not on his body — it is in
  // every word he uses to describe himself.
  const FAILURE_STAY = {
    title: 'THE FAILURE',
    subtitle: 'ALISTAIR · The Cost of Staying',
    speaker: 'ALISTAIR',
    palette: PALETTE_NIGHT,
    bg: BG_HALL,
    beats: [
      { type: 'show', pose: 'assets/alistair/body/soft-sad.png', wait: 900 },
      { type: 'line', text: 'I am not a knight as of this morning, mi’lady. — I am Alistair. — *quiet* — Just that. Just the name.', hold: 4000, cps: 24 },
      { type: 'pose', src: 'assets/alistair/body/thinking2.png', animate: 'swap' },
      { type: 'line', text: 'They called the council at first light. — I stood through it without my sword — they took it before I entered. — The captain who trained me read the charges. — He did not look at me when he did. — I do not blame him.', hold: 5800, cps: 22 },
      { type: 'line', text: 'Deserter. — That is the word now. — *small, controlled* — Twenty years of service unwritten in the time it takes to read a charge sheet. — I have been a knight longer than I have been a man. — I do not know what I am tonight.', hold: 6000, cps: 22 },
      { type: 'line', text: 'I stayed because you asked. — I would do it again. — *firmer* — I want that on record. — I am not standing here regretting it. — But I am standing here, mi’lady, and — I am not who I was when you asked.', hold: 5800, cps: 22 },
      { type: 'flourish', text: '✦', duration: 1600 },
      { type: 'pose', src: 'assets/alistair/body/shy3.png', animate: 'swap' },
      { type: 'line', text: '*lowers himself onto one knee in front of you — awkwardly, the way a man kneels who has only ever knelt to crowns and is making the gesture mean something different* — I knelt to a king at fifteen. — I knelt to a captain at twenty. — I am kneeling now without a title to offer you. — Just the man. — He is all you get. — He is yours, if you still want him.', hold: 7000, cps: 20 },
      { type: 'line', text: 'I have said “I would die for you” a hundred times. — To kings. To captains. To strangers I owed a debt to. — I always meant it the easy way. — *quieter* — I am saying it now and it is not the easy way. — I would die for you, mi’lady. — I have already died for the man I used to be. — I would do that one again, too. — Without flinching.', hold: 7400, cps: 20 },
      { type: 'line', text: 'Forgive me for arriving smaller than I left. — *head bowed* — I will be here tomorrow. — Without the armour. — Without the rank. — …Hopefully that is still enough.', hold: 6000, cps: 22 },
      { type: 'hide' }
    ]
  };

  // ---- THE TENDING — convergent for both branches ----
  // The first earned contact. She removes the gauntlet. He does not stop
  // her. He admits the line was routine for twenty years and is not
  // routine now. The kiss-the-wrist beat is *response* to her choosing
  // him stripped down — not a knight performing chivalry.
  const TENDING = {
    title: 'THE TENDING',
    subtitle: 'ALISTAIR · The First Touch That Stayed',
    speaker: 'ALISTAIR',
    palette: PALETTE_DAWN,
    bg: BG_ROOM,
    beats: [
      { type: 'show', pose: 'assets/alistair/body/casual.png', wait: 900 },
      { type: 'line', text: '*sitting on the edge of the cot, gauntlet still on his right hand because he did not have the courage to take it off this morning* — I did not know if you would come. — I would not have blamed you.', hold: 4200, cps: 24 },
      { type: 'line', text: '*sees the cup of water in your hand and stills for a moment — the same hand-rolled tin cup he used to bring you in the maid’s chamber, the day he found you* — …I gave you water in a maid’s chamber once. — You were unconscious for most of it. — I am awake for this one, mi’lady. — That is the difference. — That is the only difference that matters.', hold: 6400, cps: 22 },
      { type: 'line', text: '*as you reach for the gauntlet he goes very still — not stopping you, not helping you either, just waiting like a man who has never been allowed to receive anything* — You can. — If you want to. — I will not move.', hold: 5400, cps: 22 },
      { type: 'pose', src: 'assets/alistair/body/softshy-love3.png', animate: 'swap' },
      { type: 'line', text: '*the buckle gives, the leather folds back, the bare hand emerges — scarred, blunt-fingered, the hand of a man who has held a hilt for two decades and almost nothing else* — Careful with it. — *quietly* — It is not a hand that has been held before.', hold: 6200, cps: 20 },
      { type: 'particles', count: 14, duration: 1800 },
      { type: 'line', text: '*you take it. you turn it palm-up. the calluses are a map. he watches you read it and does not breathe for a full second* — …I am going to say something I have said before, mi’lady. — Please listen anyway.', hold: 5800, cps: 22 },
      { type: 'flourish', text: '✦', duration: 1800 },
      { type: 'line', text: 'I would die for you. — *small, careful, like he is laying down a sword* — I have said that line my whole life. — To kings I did not love. — To captains I did not love. — To strangers I owed coin to. — It was a knight’s phrase. It cost me nothing to say.', hold: 6400, cps: 20 },
      { type: 'line', text: '*lifts your hand to his lips, presses his mouth to the inside of your wrist — not theatrical, just held there, a long quiet moment* — …It costs me everything tonight. — That is the difference. — I wanted you to hear me say it the way it is supposed to sound.', hold: 6800, cps: 20 },
      { type: 'pose', src: 'assets/alistair/body/smile1.png', animate: 'swap' },
      { type: 'line', text: '*does not let go of your hand. keeps it between both of his, like a thing he is finally allowed to be careless with* — I will not break another promise to you. — I cannot promise to be a knight anymore. — I can promise to be on time. — *softly* — That is a smaller oath. — …I will keep it better.', hold: 7000, cps: 20 },
      { type: 'line', text: '*looks at you for a long moment, the careful look from the maid’s chamber returned but warmer now* — I told you once I would not ask you what you are. — I am still not asking. — *quieter* — But I have stopped wondering. — I know what you are to me. — That is the only answer I needed.', hold: 6800, cps: 20 },
      { type: 'particles', count: 18, duration: 2000 },
      { type: 'line', text: 'Stay until I fall asleep. — *almost a whisper* — I have never asked anyone that. — I am asking you. — Out loud. — So you have heard it.', hold: 5400, cps: 22 },
      { type: 'hide' }
    ]
  };

  // ---------------------------------------------------------------
  // PLAYBACK
  // ---------------------------------------------------------------
  let _playing = false;

  function isGameIdle(g) {
    if (!g) return false;
    if (g.sceneActive) return false;
    if (g.characterLeft) return false;
    const block = document.querySelector([
      '#ms-encounter-root', '#mscard-root', '#chp-page', '#chp-finale-choice',
      '#mg-overlay', '#mon-bundle-back', '#settings-overlay:not(.hidden)',
      '#cinematic-overlay.visible', '#event-overlay:not(.hidden)',
      '#gift-panel:not(.hidden)', '#training-panel:not(.hidden)',
      '#dress-panel:not(.hidden)', '#story-overlay:not(.hidden)'
    ].join(','));
    return !block;
  }

  function play(scene, doneKey) {
    if (!window.MSCard || typeof window.MSCard.show !== 'function') return;
    _playing = true;
    markSeen(doneKey);
    window.MSCard.show(scene, () => { _playing = false; });
  }

  function tick() {
    if (!isEnabled()) return;
    if (_playing) return;
    if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) return;

    const g = window._game;
    if (!g) return;
    const charId = g.characterId || g.selectedCharacter;
    if (charId !== 'alistair') return;
    if (!isGameIdle(g)) return;

    const choice = tpChoice();
    if (!choice) return;            // turning point not yet answered
    if (!chosenSeen()) return;      // ladder order: chosen tier must come first

    const aff = affection(g);

    if (!failureSeen() && aff >= FAILURE_MIN) {
      const scene = (choice === 'stay') ? FAILURE_STAY : FAILURE_GO;
      play(scene, FAILURE_KEY);
      return;
    }
    if (failureSeen() && !tendingSeen() && aff >= TENDING_MIN) {
      play(TENDING, TENDING_KEY);
      return;
    }
  }

  function boot() {
    if (!isEnabled()) return;
    try {
      setTimeout(() => { setInterval(tick, POLL_MS); tick(); }, 14000);
    } catch (e) {
      console.warn('[alistair-arc] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Debug surface — lets the dev panel force-play either scene and
  // reset the seen flags for replay testing.
  window.AlistairArc = {
    isEnabled,
    scenes: { FAILURE_GO, FAILURE_STAY, TENDING },
    forceFailure: (branch) => {
      if (!window.MSCard) return null;
      const scene = (branch === 'stay') ? FAILURE_STAY : FAILURE_GO;
      window.MSCard.show(scene);
      return scene.subtitle;
    },
    forceTending: () => {
      if (!window.MSCard) return null;
      window.MSCard.show(TENDING);
      return TENDING.subtitle;
    },
    _debug_reset: () => {
      try {
        localStorage.removeItem(FAILURE_KEY);
        localStorage.removeItem(TENDING_KEY);
      } catch (_) {}
    }
  };
})();
