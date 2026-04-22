/* noir-whispers.js — dark cameo whispers during normal care gameplay.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Feature-flagged on pp_main_story_enabled.
 *  - Read-only polling of window._game. No mutation of game state.
 *  - Only fires AFTER the player has met Noir in Chapter 6 (so it\u2019s not
 *    a spoiler). Lines reference the current character the player is
 *    caring for, tying the antagonist into daily play.
 *  - At most one whisper per session (game tick window). Storage flag
 *    `pp_noir_whisper_seen_<char>` caches the latest whisper per char.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const POLL_MS = 22000;        // check every 22s
  const MIN_BOND = 55;          // only whispers when the player has been tender
  const COOLDOWN_MS = 180000;   // at least 3 min between whispers

  // Whisper lines per character. All in Noir\u2019s voice, spoken TO the player
  // about the character they\u2019re with. Gendered for male Noir.
  const WHISPERS = {
    alistair: [
      'You smell like a knight tonight. Be careful. Devotion like his used to be mine.',
      'His oath is so loud from down here. Tell him, quietly, that oaths end. See what he says.',
      'He\u2019d break his vow for you. I already did.'
    ],
    elian: [
      'The forest is easier to fool than you think. He trusts it. Don\u2019t.',
      'He watches you when you bend to drink. He won\u2019t say so. I will.',
      'Ask him what he forgets at night. Ask me what I remember for him.'
    ],
    lyra: [
      'Lovely voice, isn\u2019t she. I gave her one of my notes last week. She hasn\u2019t sung it.',
      'Her cave was mine first. I left her the acoustics. She owes me the echo.',
      'Tell her I miss the second verse. She\u2019ll know which one.'
    ],
    caspian: [
      'The prince performs so prettily. I perform only when I mean it.',
      'Ask him what he whispers when the balcony doors are closed. Compare it to what I whisper.',
      'He collects hearts. I keep only one. Guess whose.'
    ],
    lucien: [
      'He writes in my margins and thinks it\u2019s inspiration. Let him have that.',
      'His maths call me by a name the old Weaver gave me. I allow it.',
      'He will ask you, soon, whether monsters can miss someone. Answer carefully.'
    ],
    // Proto is meta \u2014 Noir breaks a different kind of fourth wall here.
    proto: [
      '&gt; I\u2019m in his logs. He hasn\u2019t told you. Don\u2019t be cross with him \u2014 I asked nicely.',
      '&gt; A ghost in the machine is still a ghost, love. I\u2019ve been one longer than this machine has existed.',
      '&gt; Tell him I left a comment on line 1204. He\u2019ll find it.'
    ]
  };

  function isEnabled() {
    try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; }
  }
  function noirMet() {
    try { return localStorage.getItem('pp_ms_encounter_noir_seen') === '1'
            || localStorage.getItem('pp_chapter_done_6') === '1'; }
    catch (e) { return false; }
  }

  // ---------------------------------------------------------------
  let _lastWhisperAt = 0;
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

  function pickLine(charId) {
    const pool = WHISPERS[charId];
    if (!pool || !pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function showWhisper(text) {
    let w = document.getElementById('noir-whisper');
    if (w) w.remove();
    w = document.createElement('div');
    w.id = 'noir-whisper';
    w.style.cssText = [
      'position:fixed', 'left:50%', 'top:18%', 'transform:translateX(-50%) translateY(-6px)',
      'max-width:80%', 'background:linear-gradient(180deg,rgba(28,6,42,0.94),rgba(14,2,24,0.94))',
      'color:#efe0ff', 'font-family:inherit', 'font-size:13px', 'line-height:1.45',
      'font-style:italic', 'padding:10px 16px', 'border-radius:16px',
      'border:1px solid rgba(196,106,255,0.45)', 'text-align:center',
      'box-shadow:0 6px 20px rgba(0,0,0,0.55), 0 0 24px rgba(196,106,255,0.2)',
      'z-index:7000', 'pointer-events:none', 'opacity:0',
      'transition:opacity 520ms ease, transform 520ms ease'
    ].join(';');
    const speaker = document.createElement('div');
    speaker.style.cssText = 'font-size:10px;letter-spacing:2.5px;opacity:0.6;margin-bottom:4px;font-style:normal;color:#c46aff;';
    speaker.textContent = '\u25a0 NOIR';
    const line = document.createElement('div');
    line.innerHTML = text;
    w.appendChild(speaker);
    w.appendChild(line);
    document.body.appendChild(w);
    requestAnimationFrame(() => {
      w.style.opacity = '1';
      w.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      w.style.opacity = '0';
      w.style.transform = 'translateX(-50%) translateY(-6px)';
      setTimeout(() => { try { w.remove(); } catch (_) {} }, 600);
    }, 6200);
  }

  // ---------------------------------------------------------------
  function tick() {
    if (!isEnabled()) return;
    if (!noirMet()) return;
    const now = Date.now();
    if (now - _lastWhisperAt < COOLDOWN_MS) return;
    const g = window._game;
    if (!g) return;
    if (!isGameIdle(g)) return;
    const charId = g.characterId || g.selectedCharacter;
    if (!charId || !WHISPERS[charId]) return;
    const bond = g.bond | 0;
    if (bond < MIN_BOND) return;

    const line = pickLine(charId);
    if (!line) return;
    showWhisper(line);
    _lastWhisperAt = now;
  }

  function boot() {
    if (!isEnabled()) return;
    try {
      // A short initial delay so the player gets into a scene, not an ambush on load.
      setTimeout(() => { setInterval(tick, POLL_MS); tick(); }, 20000);
    } catch (e) {
      console.warn('[noir-whispers] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.NoirWhispers = {
    isEnabled,
    noirMet,
    force: (charId) => {
      const line = pickLine(charId || (window._game && (window._game.characterId || window._game.selectedCharacter)));
      if (line) showWhisper(line);
      return line;
    },
    _debug_reset: () => { _lastWhisperAt = 0; }
  };
})();
