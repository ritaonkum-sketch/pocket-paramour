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
 *  - Non-intrusive: appears as a soft caption above the character,
 *    auto-dismiss after a few seconds.
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
      proto:   'He left code in your console. I can read it. I won\u2019t report it.'
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
      alistair:'&gt; his signal is strong today. i like him. categorise as threat = false. categorise as ally = pending.',
      elian:   '&gt; forest-traffic detected in your packets. scheduled a maintenance window around it.',
      lyra:    '&gt; she wrote a line in your buffer. i read it. i will not report its contents. that is love, apparently.',
      caspian: '&gt; court data in your cache. i deleted the boring bits. you\u2019re welcome.',
      lucien:  '&gt; he cross-referenced me last night. i pretended to be busy. he pretended to believe it.',
      noir:    '&gt; he\u2019s \u2026 present in your logs. i am not going to fight him. i am going to outwait him. that\u2019s different.'
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
    const block = document.querySelector([
      '#ms-encounter-root', '#mscard-root', '#chp-page', '#chp-finale-choice',
      '#mg-overlay', '#mon-bundle-back', '#settings-overlay:not(.hidden)',
      '#cinematic-overlay.visible', '#event-overlay:not(.hidden)',
      '#gift-panel:not(.hidden)', '#training-panel:not(.hidden)',
      '#dress-panel:not(.hidden)', '#story-overlay:not(.hidden)',
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

    showBubble(active, rival, line);
    _lastAt = now;
  }

  function showBubble(active, rival, text) {
    const prev = document.getElementById('cc-bubble'); if (prev) prev.remove();
    const b = document.createElement('div');
    b.id = 'cc-bubble';
    b.style.cssText = [
      'position:fixed', 'left:50%', 'top:22%', 'transform:translateX(-50%) translateY(-6px)',
      'max-width:80%', 'background:linear-gradient(180deg,rgba(18,12,32,0.94),rgba(10,6,22,0.94))',
      'color:#f4e6ff', 'font-family:inherit', 'font-size:13px', 'line-height:1.4',
      'padding:10px 16px', 'border-radius:16px',
      'border:1px solid rgba(255,255,255,0.12)', 'text-align:center',
      'box-shadow:0 6px 20px rgba(0,0,0,0.55)',
      'z-index:6800', 'pointer-events:none', 'opacity:0', 'font-style:italic',
      'transition:opacity 500ms ease, transform 500ms ease'
    ].join(';');
    const speaker = document.createElement('div');
    speaker.style.cssText = 'font-size:10px;letter-spacing:2.5px;opacity:0.55;margin-bottom:4px;font-style:normal;';
    speaker.textContent = '\u2726 ' + active.toUpperCase() + ' NOTICES';
    const line = document.createElement('div');
    line.innerHTML = text;
    b.appendChild(speaker);
    b.appendChild(line);
    document.body.appendChild(b);
    requestAnimationFrame(() => { b.style.opacity = '1'; b.style.transform = 'translateX(-50%) translateY(0)'; });
    setTimeout(() => {
      b.style.opacity = '0';
      setTimeout(() => { try { b.remove(); } catch (_) {} }, 520);
    }, 6000);
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
      if (line) showBubble(a, r, line);
      return { active: a, rival: r, line };
    },
    _debug_reset: () => { _lastAt = 0; }
  };
})();
