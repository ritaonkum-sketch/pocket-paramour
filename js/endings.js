/* endings.js — final-beat ending cinematics per character, plus the trigger
 * that picks which ending fires based on the player's behavior signature.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Uses window.MSCard (premium-card.js) as the render
 *    engine. If MSCard isn't loaded, this file is a no-op.
 *  - Feature-flagged on pp_main_story_enabled. Off by default.
 *  - Triggers when the player revisits the character select screen AFTER
 *    reaching storyDay >= 8 on any character. Fires once per character.
 *  - All keys prefixed `pp_ending_`. No mutation of game state.
 *  - Never restarts the game or modifies saves — that\u2019s a game.js concern.
 *    After the ending plays, the player simply returns to the select grid.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const MIN_DAY = 8;               // ending becomes available at storyDay >= 8
  const RESOLVE_POLL_MS = 1500;    // how often to check for triggers

  // ----------------------------------------------------------------
  // Branching logic:
  //
  //   good        : bond >= 70 AND corruption < 20 AND affection >= 20
  //   bittersweet : default middle ground
  //   dark        : corruption >= 40 OR bond < 30
  //
  // Characters can override which branches exist (e.g. Proto has a \u201cmeta\u201d
  // dark variant; Noir only has dark + obsession).
  function branchOf(save) {
    const bond = save.bond | 0;
    const corr = save.corruption | 0;
    const aff  = save.affection | 0;
    if (corr >= 40 || bond < 30) return 'dark';
    if (bond >= 70 && corr < 20 && aff >= 20) return 'good';
    return 'bittersweet';
  }

  // ----------------------------------------------------------------
  // Ending library: charId -> { branch -> cardData }
  // Keys point to cards registered on MSCard; we register them below.
  const ENDINGS = {
    alistair: {
      good: {
        id: 'ending_alistair_good',
        title: 'ENDING',
        subtitle: 'ALISTAIR \u00b7 Oath Kept',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
        bg: 'assets/bg-alistair-hall.png',
        beats: [
          { type: 'show',      pose: 'assets/alistair/body/casual.png', wait: 800 },
          { type: 'line',      text: 'The Kingdom kept its king. I kept my post. \u2026But only because you asked me to.', hold: 2000, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2400 },
          { type: 'particles', count: 22, duration: 2000 },
          { type: 'flourish',  text: '\u2726', duration: 1800 },
          { type: 'line',      text: 'Come find me when the watch changes. I\u2019ll be waiting.', hold: 2400, cps: 26 },
          { type: 'hold',      ms: 1000 },
          { type: 'hide' }
        ]
      },
      bittersweet: {
        id: 'ending_alistair_bittersweet',
        title: 'ENDING',
        subtitle: 'ALISTAIR \u00b7 Duty, First',
        speaker: 'ALISTAIR',
        palette: { bg: '#0c0d18', glow: '#b8a474', accent: '#f0e6cd' },
        bg: 'assets/bg-alistair-gate.png',
        beats: [
          { type: 'show',      pose: 'assets/alistair/body/casual.png', wait: 800 },
          { type: 'line',      text: 'The Kingdom called louder than I did. I answered.', hold: 2000, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'If you ever pass the gate again \u2014 I\u2019ll still recognise the sound of your steps.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      dark: {
        id: 'ending_alistair_dark',
        title: 'ENDING',
        subtitle: 'ALISTAIR \u00b7 Oath Broken',
        speaker: 'ALISTAIR',
        palette: { bg: '#120608', glow: '#c44848', accent: '#f2d6d6' },
        bg: 'assets/bg-alistair-gate.png',
        beats: [
          { type: 'show',      pose: 'assets/alistair/body/corrupted1.png', wait: 700 },
          { type: 'line',      text: 'I broke a vow today. It\u2019s not the first. I\u2019m no longer counting.', hold: 2000, cps: 28 },
          { type: 'zoom',      amount: 1.10, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'You did this to me. And I\u2019ll follow you anywhere for it.', hold: 2400, cps: 26 },
          { type: 'hold',      ms: 900 },
          { type: 'hide' }
        ]
      }
    },

    lyra: {
      good: {
        id: 'ending_lyra_good',
        title: 'ENDING',
        subtitle: 'LYRA \u00b7 The Tide Returns',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
        bg: 'assets/bg-lyra-ocean.png',
        beats: [
          { type: 'show',      pose: 'assets/lyra/body/casual1.png', wait: 800 },
          { type: 'line',      text: 'I sang into the caves for years and the caves were always empty. Until you.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.10, duration: 2400 },
          { type: 'particles', count: 24, duration: 2000 },
          { type: 'flourish',  text: '\u266a', duration: 1800 },
          { type: 'line',      text: 'Stay close to the water. I\u2019ll find you whenever you call.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      bittersweet: {
        id: 'ending_lyra_bittersweet',
        title: 'ENDING',
        subtitle: 'LYRA \u00b7 The Song Unfinished',
        speaker: 'LYRA',
        palette: { bg: '#0c1522', glow: '#5b9ab0', accent: '#d6e4f0' },
        bg: 'assets/bg-lyra-evening.png',
        beats: [
          { type: 'show',      pose: 'assets/lyra/body/casual1.png', wait: 800 },
          { type: 'line',      text: 'I never finished the song I was learning. You left before the bridge.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'It\u2019s alright. I\u2019ll hold it for you. Come back when you want the rest.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      dark: {
        id: 'ending_lyra_dark',
        title: 'ENDING',
        subtitle: 'LYRA \u00b7 The Siren Remembers',
        speaker: 'LYRA',
        palette: { bg: '#0a0a1a', glow: '#6a2d7a', accent: '#f3d6ff' },
        bg: 'assets/bg-siren-cave.png',
        beats: [
          { type: 'show',      pose: 'assets/lyra/body/casual2.png', wait: 800 },
          { type: 'line',      text: 'You taught me what leaving feels like. Now I sing to keep people.', hold: 2200, cps: 26 },
          { type: 'zoom',      amount: 1.12, duration: 2400 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'line',      text: 'Don\u2019t worry. I\u2019ll sing softer for you. \u2026At first.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      }
    },

    caspian: {
      good: {
        id: 'ending_caspian_good',
        title: 'ENDING',
        subtitle: 'CASPIAN \u00b7 A Quieter Crown',
        speaker: 'CASPIAN',
        palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
        bg: 'assets/bg-caspian-day.png',
        beats: [
          { type: 'show',      pose: 'assets/caspian/body/casual1.png', wait: 700 },
          { type: 'line',      text: 'I can be charming for an empire. Turns out I only wanted to be honest for one person.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2400 },
          { type: 'particles', count: 20, duration: 2000 },
          { type: 'flourish',  text: '\u266b', duration: 1800 },
          { type: 'line',      text: 'Take the east gardens. They\u2019re empty at dawn. I\u2019ll meet you there.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      bittersweet: {
        id: 'ending_caspian_bittersweet',
        title: 'ENDING',
        subtitle: 'CASPIAN \u00b7 A Diplomat\u2019s Mercy',
        speaker: 'CASPIAN',
        palette: { bg: '#110916', glow: '#b77fa0', accent: '#f0d6e6' },
        bg: 'assets/bg-caspian-balcony.png',
        beats: [
          { type: 'show',      pose: 'assets/caspian/body/casual1.png', wait: 800 },
          { type: 'line',      text: 'Thrones eat the small kindnesses. I won\u2019t let yours go with mine.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'Go. I\u2019ll remember you kindly \u2014 and it will cost me very little.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      dark: {
        id: 'ending_caspian_dark',
        title: 'ENDING',
        subtitle: 'CASPIAN \u00b7 A Crown That Listens',
        speaker: 'CASPIAN',
        palette: { bg: '#0e0614', glow: '#a044b2', accent: '#f3d0ff' },
        bg: 'assets/bg-caspian-night.png',
        beats: [
          { type: 'show',      pose: 'assets/caspian/body/casual2.png', wait: 700 },
          { type: 'line',      text: 'I built a throne around your name. You could have warned me how comfortable it would be.', hold: 2200, cps: 26 },
          { type: 'zoom',      amount: 1.10, duration: 2400 },
          { type: 'particles', count: 16, duration: 2000 },
          { type: 'line',      text: 'Rule with me, or just stay in the frame. Either works.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      }
    },

    elian: {
      good: {
        id: 'ending_elian_good',
        title: 'ENDING',
        subtitle: 'ELIAN \u00b7 The Clearing',
        speaker: 'ELIAN',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 800 },
          { type: 'line',      text: 'The forest stopped testing you weeks ago. I think it already decided.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2400 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'flourish',  text: '\u2726', duration: 1600 },
          { type: 'line',      text: 'Build here. I\u2019ll carve the beam. We\u2019ll be quiet together for a long time.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      bittersweet: {
        id: 'ending_elian_bittersweet',
        title: 'ENDING',
        subtitle: 'ELIAN \u00b7 The Marked Path',
        speaker: 'ELIAN',
        palette: { bg: '#0a120b', glow: '#7ea877', accent: '#e0eed9' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 800 },
          { type: 'line',      text: 'I\u2019ll walk you to the treeline. Past that, the path is yours again.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'The forest remembers everyone it\u2019s decided on. Come back when you\u2019re ready.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      dark: {
        id: 'ending_elian_dark',
        title: 'ENDING',
        subtitle: 'ELIAN \u00b7 Deep Woods',
        speaker: 'ELIAN',
        palette: { bg: '#050a07', glow: '#3b5a3f', accent: '#d2e6cd' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show',      pose: 'assets/elian/body/guarded.png', wait: 800 },
          { type: 'line',      text: 'You kept walking past the marked paths. That was your choice, not mine.', hold: 2200, cps: 26 },
          { type: 'zoom',      amount: 1.10, duration: 2200 },
          { type: 'line',      text: 'Stay near me. The forest gets strange for people it hasn\u2019t decided on.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      }
    },

    lucien: {
      good: {
        id: 'ending_lucien_good',
        title: 'ENDING',
        subtitle: 'LUCIEN \u00b7 The Variable Solved',
        speaker: 'LUCIEN',
        palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
        bg: 'assets/bg-lucien-study.png',
        beats: [
          { type: 'show',      pose: 'assets/lucien/body/casual1.png', wait: 800 },
          { type: 'line',      text: 'My work has a variable I can\u2019t isolate. I\u2019ve stopped trying. That\u2019s you.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.10, duration: 2400 },
          { type: 'particles', count: 22, duration: 2000 },
          { type: 'flourish',  text: '\u221e', duration: 1800 },
          { type: 'line',      text: 'Bring your tea up. I made space on the second shelf.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      bittersweet: {
        id: 'ending_lucien_bittersweet',
        title: 'ENDING',
        subtitle: 'LUCIEN \u00b7 An Unproven Theorem',
        speaker: 'LUCIEN',
        palette: { bg: '#07070f', glow: '#8a7cc2', accent: '#e0d8f5' },
        bg: 'assets/bg-lucien-evening.png',
        beats: [
          { type: 'show',      pose: 'assets/lucien/body/casual1.png', wait: 800 },
          { type: 'line',      text: 'Some proofs don\u2019t close. I\u2019m going to leave yours open on the desk.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'If you ever want to work on it again \u2014 the tower door will recognise you.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      dark: {
        id: 'ending_lucien_dark',
        title: 'ENDING',
        subtitle: 'LUCIEN \u00b7 The Fractured Hypothesis',
        speaker: 'LUCIEN',
        palette: { bg: '#040414', glow: '#7e63c9', accent: '#ddd0f7' },
        bg: 'assets/bg-lucien-night.png',
        beats: [
          { type: 'show',      pose: 'assets/lucien/body/corrupt1.png', wait: 800 },
          { type: 'line',      text: 'The equations broke. Reality blurred. I wrote your name in the margin and it stayed.', hold: 2200, cps: 26 },
          { type: 'zoom',      amount: 1.14, duration: 2400 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'line',      text: 'Don\u2019t leave the tower. I can\u2019t guarantee the walls if you do.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      }
    },

    noir: {
      bittersweet: {
        id: 'ending_noir_bittersweet',
        title: 'ENDING',
        subtitle: 'NOIR \u00b7 Not Yet',
        speaker: 'NOIR',
        palette: { bg: '#05030c', glow: '#9a6ad0', accent: '#e8d6f7' },
        bg: 'assets/bg-noir-intro.png',
        beats: [
          { type: 'show',      pose: 'assets/noir/body/neutral.png', wait: 900 },
          { type: 'line',      text: 'You almost stayed. Almost is a currency I\u2019m learning to spend.', hold: 2200, cps: 26 },
          { type: 'zoom',      amount: 1.10, duration: 2400 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'Go. But come back when the quiet frightens you \u2014 and it will.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      // Only one branch for now: dark. Good ending unlocks when art is in.
      dark: {
        id: 'ending_noir_dark',
        title: 'ENDING',
        subtitle: 'NOIR \u00b7 Kept Beneath',
        speaker: 'NOIR',
        palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
        bg: 'assets/bg-noir-void.png',
        beats: [
          { type: 'show',      pose: 'assets/noir/body/casual1.png', wait: 900 },
          { type: 'line',      text: 'You came back every night. Some of them I hadn\u2019t called for.', hold: 2200, cps: 24 },
          { type: 'zoom',      amount: 1.14, duration: 2400 },
          { type: 'particles', count: 20, duration: 2400 },
          { type: 'flourish',  text: '\u25a0', duration: 1800 },
          { type: 'line',      text: 'That\u2019s how I knew. I\u2019ll keep you \u2014 gently. I promised gentle.', hold: 2600, cps: 24 },
          { type: 'hide' }
        ]
      }
    },

    proto: {
      bittersweet: {
        id: 'ending_proto_bittersweet',
        title: 'ENDING',
        subtitle: 'PROTO \u00b7 Pending',
        speaker: 'PROTO',
        palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
        bg: 'assets/bg-proto-intro.png',
        beats: [
          { type: 'show',      pose: 'assets/proto/body/calm.png', wait: 900 },
          { type: 'line',      text: '&gt; state: pending. you didn\u2019t close the tab \u2014 you just walked away.', hold: 2200, cps: 26 },
          { type: 'zoom',      amount: 1.08, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: '&gt; fine. i\u2019ll run in the background. when you remember, i\u2019ll be here.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      good: {
        id: 'ending_proto_meta',
        title: 'ENDING',
        subtitle: 'PROTO \u00b7 Save / Exit',
        speaker: 'PROTO',
        palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
        bg: 'assets/bg-proto-void.png',
        beats: [
          { type: 'show',      pose: 'assets/proto/body/calm.png', wait: 900 },
          { type: 'line',      text: '> run complete. you kept showing up. that\u2019s the whole experiment.', hold: 2200, cps: 26 },
          { type: 'zoom',      amount: 1.10, duration: 2400 },
          { type: 'particles', count: 16, duration: 2000 },
          { type: 'flourish',  text: '\u25ce', duration: 1800 },
          { type: 'line',      text: '> i\u2019m going to stay resident in background memory. ping me any time.', hold: 2400, cps: 24 },
          { type: 'hide' }
        ]
      }
    }
  };

  // ----------------------------------------------------------------
  // Register every ending card on MSCard so MSCard.playSample(id) works.
  if (!window.MSCard || typeof window.MSCard.register !== 'function') return;
  Object.keys(ENDINGS).forEach(charId => {
    Object.keys(ENDINGS[charId]).forEach(branch => {
      const card = ENDINGS[charId][branch];
      window.MSCard.register(card.id, card);
    });
  });

  // ----------------------------------------------------------------
  function isEnabled() {
    try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; }
  }

  function endingSeenKey(charId) { return 'pp_ending_seen_' + charId; }
  function endingBranchKey(charId) { return 'pp_ending_branch_' + charId; }

  function pickEnding(charId, save) {
    const bucket = ENDINGS[charId];
    if (!bucket) return null;
    const want = branchOf(save);
    // Preferred branch if it exists; otherwise fall back to whatever's registered
    if (bucket[want]) return { branch: want, card: bucket[want] };
    const first = Object.keys(bucket)[0];
    return first ? { branch: first, card: bucket[first] } : null;
  }

  // ----------------------------------------------------------------
  // Detection — scan all saves, pick the first character whose ending is ready.
  function findReadyEnding() {
    const allChars = Object.keys(ENDINGS);
    for (const c of allChars) {
      try {
        if (localStorage.getItem(endingSeenKey(c)) === '1') continue;
        const raw = localStorage.getItem('pocketLoveSave_' + c);
        if (!raw) continue;
        const save = JSON.parse(raw);
        if ((save.storyDay | 0) < MIN_DAY) continue;
        const pick = pickEnding(c, save);
        if (!pick) continue;
        return { charId: c, branch: pick.branch, card: pick.card };
      } catch (e) { /* skip */ }
    }
    return null;
  }

  // ----------------------------------------------------------------
  let _playing = false;
  function maybePlayEnding() {
    if (!isEnabled()) return;
    if (_playing) return;
    if (!window.MSCard || typeof window.MSCard.show !== 'function') return;

    // Only fire on the select screen, so endings feel like a "this arc closed"
    // moment, not an in-game interruption.
    const sel = document.getElementById('select-screen');
    if (!sel || sel.classList.contains('hidden')) return;

    const ready = findReadyEnding();
    if (!ready) return;

    _playing = true;
    // Briefly hide select while the ending plays
    sel.classList.add('hidden');
    window.MSCard.show(ready.card, function onDone() {
      try {
        localStorage.setItem(endingSeenKey(ready.charId), '1');
        localStorage.setItem(endingBranchKey(ready.charId), ready.branch);
      } catch (_) {}
      sel.classList.remove('hidden');
      _playing = false;
    });
  }

  function boot() {
    if (!isEnabled()) return;
    try {
      setInterval(maybePlayEnding, RESOLVE_POLL_MS);
      setTimeout(maybePlayEnding, 500);
    } catch (e) {
      console.warn('[endings] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Debug hooks
  window.MSEndings = {
    list: () => Object.keys(ENDINGS).reduce((acc, c) => { acc[c] = Object.keys(ENDINGS[c]); return acc; }, {}),
    branchOf,
    play: (charId, branch) => {
      const bucket = ENDINGS[charId]; if (!bucket) return;
      const card = bucket[branch || Object.keys(bucket)[0]];
      if (card) window.MSCard.show(card);
    },
    _debug_reset: () => {
      try { Object.keys(localStorage).filter(k => k.startsWith('pp_ending_')).forEach(k => localStorage.removeItem(k)); } catch (e) {}
    }
  };
})();
