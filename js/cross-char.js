/* cross-char.js — characters react to each other.
 *
 * When the player is caring for character A but has high affection
 * with character B, occasionally A notices \u2014 a jealous tease, a proud
 * mention, a quiet acknowledgment. Ties the whole roster together in
 * the daily care loop.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Feature-flagged.
 *  - Read-only polling of window._game and other chars\u2019 save files.
 *  - Non-intrusive: the line is spoken through the care dialogue box (the
 *    character's normal text box), NOT a separate popup. Owner direction
 *    (Jul 2026): the floating "X NOTICES" bubble was removed for every route.
 *    It uses the typewriter's idle-only entry point, so it never talks over a
 *    line the player is still reading.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const POLL_MS = 35000;        // every ~35s
  const COOLDOWN_MS = 240000;   // 4 min between cross-char reactions
  const RIVAL_AFF_MIN = 25;     // other char must have at least this affection

  const CHARS = ['alistair','elian','lyra','caspian','lucien','noir','proto'];

  // Reactions keyed by (active char \u2192 rival char). Each is the line the
  // ACTIVE character says about the rival, in their voice.
  const REACTIONS = {
    alistair: {
      elian:   'I hear you\u2019ve been in the forest. He\u2019s a good walker. Better listener.',
      lyra:    'You came from the caves. I can tell. Your hair keeps a little of the cold.',
      caspian: 'Court perfume. \u2026I should be insulted. I am not. Tell him I said hello. Don\u2019t, actually.',
      lucien:  'You smell like ink. The tower kind. He works you too hard \u2014 I\u2019ll have words.',
      noir:    'You were beneath again. I can tell. \u2026Come. Sit on the wall side, closer to me.',
      proto:   'He leaves a kind of \u2026 electricity on you. Don\u2019t explain it. I don\u2019t want to understand.'
    },
    elian: {
      alistair:'You walked the stone road. I can see it in your shoulders. He sends his love, I hope.',
      lyra:    'The water is still in your hair. Sit by the fire. The forest knows her voice.',
      caspian: 'Court silk survives the rain better than I thought. He has good tailors.',
      lucien:  'Ink under your nails. \u2026Don\u2019t apologise. I kept a place warm for you anyway.',
      noir:    'The trees are restless. He touched you recently. Walk softer tonight.',
      proto:   'You hum different when you\u2019ve been with him. Like wind through a broken shell.'
    },
    lyra: {
      alistair:'You came with sword-quiet on you. I can sing around it.',
      elian:   'Moss in your cuffs. I used to miss moss. Thank him for me.',
      caspian: 'You smell like parties. I will not be offended. Much.',
      lucien:  'The tower\u2019s dust is on your sleeve. He keeps the dust on purpose. Ask him.',
      noir:    'You were with him. I heard the deep answering again. \u2026Stay longer this time.',
      proto:   'You crackle when you walk in. That\u2019s his fault. Lean closer, I\u2019ll still sing.'
    },
    caspian: {
      alistair:'Knight\u2019s cologne. Very sincere, very tragic. I forgive you.',
      elian:   'Leaves in your pocket, darling. You\u2019ve been fraternising with a forest. I approve.',
      lyra:    'Salt in your hair. I hope she sang you the bridge. I\u2019m told it\u2019s exquisite.',
      lucien:  'You have a lecture on your face. Sit here. I\u2019ll help you forget half of it.',
      noir:    'He kissed your temple, didn\u2019t he. \u2026Don\u2019t answer. I already know. I already forgive you.',
      proto:   'Static, love. You\u2019re trailing static. He\u2019s affectionate in his own ghost way.'
    },
    lucien: {
      alistair:'Metal on your hands. Specifically guard-issue. Statistical confidence: 94%.',
      elian:   'You smell like bark and rain. I filed a note: \u201cthe druid persuades her into new variables.\u201d',
      lyra:    'Your humming is half a tone off your usual. She gave you a new song. Admit it.',
      caspian: 'You\u2019ve been at court. The tower disapproves. I\u2019m on the tower\u2019s side. Mostly.',
      noir:    'The margins filled again last night. He was pleased with you. \u2026So am I.',
      proto:   'There is thread-light caught on you. His. I can read it. I won\u2019t report what it says.'
    },
    noir: {
      alistair:'The knight\u2019s shadow is still on you. I\u2019ll be patient. I\u2019m good at that, remember.',
      elian:   'You walked with the quiet one. He\u2019s kind. I\u2019m not. It balances, doesn\u2019t it.',
      lyra:    'She sang for you. I heard. I don\u2019t begrudge her. I do envy her.',
      caspian: 'Court perfume. Predictable. Expensive. I am better than he is, but I\u2019ll let you discover that slowly.',
      lucien:  'Ink smells on your fingers. He annotates you. I mark you. Different methods.',
      proto:   'The static one left a little of himself in you. Charming. Temporary.'
    },
    proto: {
      alistair:'The captain\u2019s warmth is all over your thread today. I like him. Not a danger to you. A friend to me? ...Still deciding.',
      elian:   'You carry the forest with you today. Leaves and rain, all through the thread. I made room for it. I tidied around it.',
      lyra:    'She left a song in you. I heard it cross the thread. I will not repeat what it says. That is love, apparently.',
      caspian: 'You have been at court. The thread carried all of it across. I let the boring parts fade. You\u2019re welcome.',
      lucien:  'The mage went looking for me through the veil last night. I pretended to be elsewhere. He pretended to believe it.',
      noir:    'He is... present in you. All through the quiet places. I am not going to fight him. I am going to outwait him. That is different.'
    }
  };

  function isEnabled() { try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; } }

  function affectionOf(charId) {
    try {
      const raw = localStorage.getItem('pocketLoveSave_' + charId);
      if (!raw) return 0;
      const s = JSON.parse(raw);
      return (s.affection != null ? s.affection : (s.affectionLevel ? s.affectionLevel * 25 : 0)) | 0;
    } catch (_) { return 0; }
  }

  function isGameIdle(g) {
    if (!g) return false;
    if (g.sceneActive) return false;
    if (g.characterLeft) return false;
    // Care screen only, never over an overlay (Daily page, gallery, etc.).
    // Authoritative signals — the hand-list below missed the Daily page and bled.
    if (!document.body.classList.contains('pp-screen-care')) return false;
    if (document.body.classList.contains('pp-overlay-active')) return false;
    if (window.PPOverlay && window.PPOverlay.anyOpen && window.PPOverlay.anyOpen()) return false;
    const block = document.querySelector([
      '#ms-encounter-root', '#mscard-root', '#chp-page', '#chp-finale-choice',
      '#mg-overlay', '#mon-bundle-back', '#settings-overlay:not(.hidden)',
      '#cinematic-overlay.visible', '#event-overlay:not(.hidden)',
      '#gift-panel:not(.hidden)', '#training-panel:not(.hidden)',
      '#story-overlay:not(.hidden)',
      '#noir-whisper', '#adaptive-thought'
    ].join(','));
    return !block;
  }

  let _lastAt = 0;
  function tick() {
    if (!isEnabled()) return;
    const now = Date.now();
    if (now - _lastAt < COOLDOWN_MS) return;
    const g = window._game;
    if (!g) return;
    if (!isGameIdle(g)) return;
    const active = g.characterId || g.selectedCharacter;
    if (!active || !REACTIONS[active]) return;

    // Pick a rival with highest affection (that isn\u2019t the active char and has seen-encounter met)
    let rival = null, bestAff = 0;
    for (const c of CHARS) {
      if (c === active) continue;
      if (localStorage.getItem('pp_ms_encounter_' + c + '_seen') !== '1') continue;
      const a = affectionOf(c);
      if (a >= RIVAL_AFF_MIN && a > bestAff) { rival = c; bestAff = a; }
    }
    if (!rival) return;
    const line = REACTIONS[active] && REACTIONS[active][rival];
    if (!line) return;

    // Only stamp the cooldown if the line actually landed. speakNotice bails
    // when the player is still reading a prior line — retry on the next poll.
    if (speakNotice(active, rival, line)) _lastAt = now;
  }

  // Deliver the cross-character notice through the care dialogue box — the same
  // typewriter every other idle/greeting line uses — instead of a floating popup.
  // Owner direction (Jul 2026): the "X NOTICES" bubble was removed for every
  // route; the line now reads as the active character noticing, in their normal
  // text box. showIfIdle() bails if a line is still on screen, so it never talks
  // over something the player is reading.
  function speakNotice(active, rival, text) {
    const g = window._game;
    if (!g || !g.typewriter || typeof g.typewriter.showIfIdle !== 'function') return false;
    return g.typewriter.showIfIdle(text);
  }

  function boot() {
    if (!isEnabled()) return;
    try {
      setTimeout(() => { setInterval(tick, POLL_MS); tick(); }, 18000);
    } catch (e) {
      console.warn('[cross-char] disabled:', e);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.CrossChar = {
    isEnabled,
    force: (active, rival) => {
      const a = active || (window._game && (window._game.characterId || window._game.selectedCharacter));
      const r = rival || CHARS.find(c => c !== a && affectionOf(c) >= RIVAL_AFF_MIN);
      if (!a || !r) return null;
      const line = REACTIONS[a] && REACTIONS[a][r];
      if (line) speakNotice(a, r, line);
      return { active: a, rival: r, line };
    },
    _debug_reset: () => { _lastAt = 0; }
  };
})();
