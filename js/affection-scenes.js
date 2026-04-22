/* affection-scenes.js — care loop \u2192 story bridge.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Feature-flagged on pp_main_story_enabled.
 *  - Read-only polling of window._game (affection field).
 *  - Triggers ONE short character-specific scene per affection threshold,
 *    once per character. Stored in `pp_aff_<char>_<tier>` so re-care does
 *    not retrigger.
 *  - Uses MSCard so visuals match all other story moments.
 *
 * WHY:
 *  Daily care should feed the story. Without this bridge, hand-feeding
 *  Alistair every day produces no narrative payoff \u2014 the Tamagotchi loop
 *  and the visual novel run on parallel tracks. With it, each character
 *  has 3 unlock tiers (warm / closer / chosen) that surface naturally as
 *  the player keeps showing up.
 *
 * CONTENT:
 *   tier 1 (affection >= 10) "warm"   \u2014 light, the first sign of trust
 *   tier 2 (affection >= 25) "closer" \u2014 they admit something
 *   tier 3 (affection >= 50) "chosen" \u2014 they say it out loud
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const POLL_MS = 6000;
  const TIERS = [
    { key: 'warm',   min: 10 },
    { key: 'closer', min: 25 },
    { key: 'chosen', min: 50 }
  ];

  function isEnabled() { try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; } }
  function seenKey(charId, tier) { return 'pp_aff_' + charId + '_' + tier; }
  function isSeen(charId, tier) { try { return localStorage.getItem(seenKey(charId, tier)) === '1'; } catch (e) { return true; } }
  function markSeen(charId, tier) { try { localStorage.setItem(seenKey(charId, tier), '1'); } catch (e) {} }

  // ---------------------------------------------------------------
  // Scene library. Each character gets 3 tiers. Lines are short \u2014
  // these are care-loop bridges, not full chapters.
  const SCENES = {
    alistair: {
      warm: {
        title: 'A QUIET MOMENT', subtitle: 'ALISTAIR \u00b7 Off Duty',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
        bg: 'assets/bg-alistair-hall.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/casual.png', wait: 700 },
          { type: 'line', text: 'I caught myself standing easier today. Less weight on the back foot. \u2026I think that\u2019s your fault.', hold: 2400, cps: 30 },
          { type: 'line', text: 'Don\u2019t apologise. Stay anyway.', hold: 2200, cps: 30 },
          { type: 'hide' }
        ]
      },
      closer: {
        title: 'A QUIET MOMENT', subtitle: 'ALISTAIR \u00b7 An Honest Hour',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
        bg: 'assets/bg-knight-room.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/casual.png', wait: 700 },
          { type: 'line', text: 'I haven\u2019t been honest with anyone in years. Including myself. \u2026Then you walked in. Now I keep slipping.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u2726', duration: 1400 },
          { type: 'line', text: 'I think I\u2019m glad. I\u2019m not used to glad.', hold: 2400, cps: 28 },
          { type: 'hide' }
        ]
      },
      chosen: {
        title: 'A QUIET MOMENT', subtitle: 'ALISTAIR \u00b7 The Word',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
        bg: 'assets/bg-alistair-hall.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/smile.png', wait: 700 },
          { type: 'line', text: 'I\u2019ve been writing this in my head all week and I keep choosing the same word. Beloved.', hold: 2800, cps: 26 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: '\u2026That\u2019s you. I just thought you should know I\u2019ve already named it.', hold: 2600, cps: 26 },
          { type: 'hide' }
        ]
      }
    },
    elian: {
      warm: {
        title: 'A QUIET MOMENT', subtitle: 'ELIAN \u00b7 The Path',
        speaker: 'ELIAN',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/calm.png', wait: 700 },
          { type: 'line', text: 'The forest left a path open for you today. It doesn\u2019t do that for me anymore.', hold: 2400, cps: 30 },
          { type: 'line', text: 'Walk it. I\u2019ll keep up.', hold: 2200, cps: 30 },
          { type: 'hide' }
        ]
      },
      closer: {
        title: 'A QUIET MOMENT', subtitle: 'ELIAN \u00b7 The Hollow',
        speaker: 'ELIAN',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/calm.png', wait: 700 },
          { type: 'line', text: 'There\u2019s a hollow in an oak by the stream. I\u2019ve never shown it to anyone. \u2026Tomorrow, then.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u2726', duration: 1400 },
          { type: 'line', text: 'Don\u2019t be late. The owls will judge you.', hold: 2200, cps: 28 },
          { type: 'hide' }
        ]
      },
      chosen: {
        title: 'A QUIET MOMENT', subtitle: 'ELIAN \u00b7 The Choosing',
        speaker: 'ELIAN',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/calm.png', wait: 700 },
          { type: 'line', text: 'The forest decides who stays. It decided you weeks ago. I\u2019m a slower creature. I decide tonight.', hold: 2800, cps: 26 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: 'Stay. With me. Past the markers, if you want.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      }
    },
    lyra: {
      warm: {
        title: 'A QUIET MOMENT', subtitle: 'LYRA \u00b7 Between Verses',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
        bg: 'assets/bg-siren-cave.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual1.png', wait: 700 },
          { type: 'line', text: 'I tried a new note today. The cave didn\u2019t flinch. \u2026That\u2019s your doing.', hold: 2400, cps: 30 },
          { type: 'line', text: 'Stay for the next verse. It\u2019s warmer.', hold: 2200, cps: 30 },
          { type: 'hide' }
        ]
      },
      closer: {
        title: 'A QUIET MOMENT', subtitle: 'LYRA \u00b7 A Song for One',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
        bg: 'assets/bg-lyra-cliff.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual2.png', wait: 700 },
          { type: 'line', text: 'I\u2019ve always sung outward. Tonight \u2026 I sang inward. To the room. To you.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u266a', duration: 1500 },
          { type: 'line', text: 'It feels different. Like a song with a door instead of a window.', hold: 2400, cps: 28 },
          { type: 'hide' }
        ]
      },
      chosen: {
        title: 'A QUIET MOMENT', subtitle: 'LYRA \u00b7 The Promise',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
        bg: 'assets/bg-lyra-ocean.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual1.png', wait: 700 },
          { type: 'line', text: 'I made up a verse only you will ever hear. I made it short on purpose. So you\u2019ll come back for the rest of it.', hold: 2800, cps: 26 },
          { type: 'particles', count: 18, duration: 1800 },
          { type: 'line', text: 'Don\u2019t learn it. Just let me sing it to you.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      }
    },
    caspian: {
      warm: {
        title: 'A QUIET MOMENT', subtitle: 'CASPIAN \u00b7 An Aside',
        speaker: 'CASPIAN',
        palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
        bg: 'assets/bg-caspian-balcony.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/casual1.png', wait: 700 },
          { type: 'line', text: 'I dismissed the court early today. They thought I had a headache. \u2026I had a you.', hold: 2400, cps: 30 },
          { type: 'line', text: 'Smile. They\u2019ll think I\u2019m being indulgent. They\u2019ll be correct.', hold: 2400, cps: 30 },
          { type: 'hide' }
        ]
      },
      closer: {
        title: 'A QUIET MOMENT', subtitle: 'CASPIAN \u00b7 A Slip',
        speaker: 'CASPIAN',
        palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
        bg: 'assets/bg-caspian-bedroom.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/casual2.png', wait: 700 },
          { type: 'line', text: 'I told you a true thing today. I haven\u2019t done that in court for a decade. It tasted strange. Familiar.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u266b', duration: 1500 },
          { type: 'line', text: 'I might develop a habit. You\u2019ll be responsible.', hold: 2400, cps: 28 },
          { type: 'hide' }
        ]
      },
      chosen: {
        title: 'A QUIET MOMENT', subtitle: 'CASPIAN \u00b7 Without the Performance',
        speaker: 'CASPIAN',
        palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
        bg: 'assets/bg-caspian-night.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/adoring.png', wait: 700 },
          { type: 'line', text: 'My favourite version of myself is the one I am when no one is watching. \u2026Apparently you count as no one. That\u2019s a compliment.', hold: 2800, cps: 26 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: 'Stay tonight. I\u2019d like to keep being him a little longer.', hold: 2600, cps: 26 },
          { type: 'hide' }
        ]
      }
    },
    lucien: {
      warm: {
        title: 'A QUIET MOMENT', subtitle: 'LUCIEN \u00b7 A Small Anomaly',
        speaker: 'LUCIEN',
        palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
        bg: 'assets/bg-lucien-study.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/casual1.png', wait: 700 },
          { type: 'line', text: 'My focus has improved by 14% on days you visit. Statistically suspicious. I\u2019m not investigating.', hold: 2400, cps: 30 },
          { type: 'line', text: 'Sit. Don\u2019t move the third book. The third book has feelings.', hold: 2400, cps: 30 },
          { type: 'hide' }
        ]
      },
      closer: {
        title: 'A QUIET MOMENT', subtitle: 'LUCIEN \u00b7 An Annotation',
        speaker: 'LUCIEN',
        palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
        bg: 'assets/bg-lucien-evening.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/amused.png', wait: 700 },
          { type: 'line', text: 'I keep trying to factor you out of my equations. The equations resist. They prefer you in.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u221e', duration: 1500 },
          { type: 'line', text: 'I\u2019ve started annotating proofs with your initials in the margin. The tower will gossip.', hold: 2600, cps: 28 },
          { type: 'hide' }
        ]
      },
      chosen: {
        title: 'A QUIET MOMENT', subtitle: 'LUCIEN \u00b7 The Theorem',
        speaker: 'LUCIEN',
        palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
        bg: 'assets/bg-lucien-bedroom.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/casual1.png', wait: 700 },
          { type: 'line', text: 'I\u2019ve been working on a theorem for months. It states: any room you walk into becomes my favourite room. The proof is cheating but I don\u2019t care.', hold: 2800, cps: 26 },
          { type: 'particles', count: 18, duration: 1800 },
          { type: 'line', text: 'Stay. The theorem needs more data.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      }
    }
  };

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

  function tick() {
    if (!isEnabled()) return;
    if (_playing) return;
    const g = window._game;
    if (!g) return;
    if (!isGameIdle(g)) return;
    const charId = g.characterId || g.selectedCharacter;
    if (!charId || !SCENES[charId]) return;
    const aff = (g.affection != null ? g.affection : (g.affectionLevel ? g.affectionLevel * 25 : 0)) | 0;

    // Find the highest tier they qualify for that they haven\u2019t seen.
    for (let i = TIERS.length - 1; i >= 0; i--) {
      const t = TIERS[i];
      if (aff >= t.min && !isSeen(charId, t.key)) {
        const scene = SCENES[charId][t.key];
        if (!scene) return;
        if (!window.MSCard || typeof window.MSCard.show !== 'function') return;
        _playing = true;
        markSeen(charId, t.key);
        window.MSCard.show(scene, () => { _playing = false; });
        return;
      }
    }
  }

  function boot() {
    if (!isEnabled()) return;
    try {
      // Initial delay so it never fires on app open
      setTimeout(() => { setInterval(tick, POLL_MS); tick(); }, 12000);
    } catch (e) {
      console.warn('[affection-scenes] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.AffectionScenes = {
    isEnabled,
    list: () => SCENES,
    force: (charId, tier) => {
      const c = charId || (window._game && (window._game.characterId || window._game.selectedCharacter));
      if (!c || !SCENES[c]) return null;
      const t = tier || 'warm';
      const scene = SCENES[c] && SCENES[c][t];
      if (!scene || !window.MSCard) return null;
      window.MSCard.show(scene);
      return scene.subtitle;
    },
    _debug_reset: () => {
      try { Object.keys(localStorage).filter(k => k.startsWith('pp_aff_')).forEach(k => localStorage.removeItem(k)); } catch (_) {}
    }
  };
})();
