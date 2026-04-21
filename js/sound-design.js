/* sound-design.js — audio flourishes tied to the main-story UI moments.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Uses window.sounds if present; otherwise no-op.
 *  - Feature-flagged on pp_main_story_enabled. Off by default.
 *  - All triggers are observer-based. Never calls into game state.
 *  - sounds module is silent until START unlocks audio, so running before
 *    that is safe \u2014 the _playFile calls will be no-ops.
 *
 * WHAT IT DOES:
 *  - MutationObserver on document.body watches for the *appearance* of key
 *    overlay containers and plays a matching sound the moment they arrive:
 *      #ms-encounter-root  -> chime    (meet-cute reveal)
 *      #mscard-root        -> chime    (memory / ending card reveal)
 *      #mg-overlay         -> swoosh   (gallery opens)
 *      #mon-bundle-back    -> pop      (bundle modal opens)
 *      #mon-chip           -> blip     (chip prompt)
 *  - Taps inside an encounter overlay trigger a subtle `pop`.
 *  - MSCard flourish beats (text appears in #mscard-flourish) trigger a
 *    `blip` so the typographic flourish feels like a musical accent.
 *  - Ending cards get a distinct `breathe` intro + `fanfare` (good) /
 *    `thud` (dark) / `chime` (bittersweet) at the flourish beat.
 *  - Daily-purpose completions already play chime from inside that module;
 *    this file does not duplicate it.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';

  function isEnabled() {
    try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; }
  }

  // Resolve the sounds object. sounds.js declares `const sounds = new SoundSystem()`
  // at script scope. That binding is shared across classic scripts on the page
  // via the lexical global environment, but NOT attached to window. So we
  // reference `sounds` directly and catch any ReferenceError.
  function resolveSounds() {
    if (typeof window !== 'undefined' && window.sounds) return window.sounds;
    try { return typeof sounds !== 'undefined' ? sounds : null; } catch (_) { return null; }
  }

  function play(name, vol) {
    try {
      const s = resolveSounds();
      if (!s || !s.enabled) return;
      if (typeof s[name] === 'function') {
        s[name]();
      } else if (typeof s._playFile === 'function') {
        s._playFile('assets/audio/' + name + '.mp3', vol || 0.6);
      }
    } catch (_) {}
  }

  // Derive a sound for an ending flourish based on id pattern.
  function soundForEndingFlourish(cardId) {
    if (!cardId) return 'blip';
    if (cardId.endsWith('_good') || cardId === 'ending_proto_meta') return 'fanfare';
    if (cardId.endsWith('_bittersweet')) return 'chime';
    if (cardId.endsWith('_dark')) return 'thud';
    return 'blip';
  }

  // ---------------------------------------------------------------
  // Track currently-playing MSCard so we can decide which sound the flourish
  // beat should use. We infer id from the subtitle shown in the title strip.
  let _activeCardId = null;
  function rememberActiveCardFromDOM() {
    // Scan the MSCard registry and see which subtitle matches the title strip.
    const strip = document.getElementById('mscard-titlestrip');
    if (!strip) { _activeCardId = null; return; }
    const txt = strip.textContent || '';
    const reg = (window.MSCard && window.MSCard._registry) || {};
    for (const id of Object.keys(reg)) {
      const c = reg[id];
      // Title strip format is TITLE + subtitle text (no separator), so
      // substring match on a unique-ish subtitle is good enough.
      if (c.subtitle && txt.indexOf(c.subtitle) >= 0) {
        _activeCardId = id;
        return;
      }
    }
  }

  // ---------------------------------------------------------------
  // Observers
  function observeNewOverlays() {
    const handledNodes = new WeakSet();

    const handleNode = (node) => {
      if (!node || node.nodeType !== 1) return;
      if (handledNodes.has(node)) return;
      handledNodes.add(node);

      const id = node.id || '';
      if (id === 'ms-encounter-root') {
        play('chime');
        // tap-pop inside the encounter character wrap
        setTimeout(() => {
          const wrap = document.getElementById('ms-char-wrap');
          if (wrap && !wrap._sdBound) {
            wrap._sdBound = true;
            wrap.addEventListener('click', () => play('pop'), true);
          }
          // choice buttons get a soft blip
          const choiceRow = document.getElementById('ms-choices');
          if (choiceRow && !choiceRow._sdBound) {
            choiceRow._sdBound = true;
            choiceRow.addEventListener('click', (e) => {
              if (e.target && e.target.tagName === 'BUTTON') play('blip');
            }, true);
          }
        }, 120);
      } else if (id === 'mscard-root') {
        rememberActiveCardFromDOM();
        // If it's an ending, the intro is `breathe` rather than `chime` for gravitas.
        const isEnding = _activeCardId && _activeCardId.startsWith('ending_');
        play(isEnding ? 'breathe' : 'chime');
        // Watch the flourish element for text changes to trigger the accent.
        const flourish = document.getElementById('mscard-flourish');
        if (flourish && !flourish._sdObs) {
          flourish._sdObs = new MutationObserver(() => {
            if ((flourish.textContent || '').trim().length > 0) {
              if (isEnding) {
                play(soundForEndingFlourish(_activeCardId));
              } else {
                play('blip');
              }
            }
          });
          flourish._sdObs.observe(flourish, { childList: true, characterData: true, subtree: true });
        }
      } else if (id === 'mg-overlay') {
        play('swoosh');
      } else if (id === 'mon-bundle-back') {
        play('pop');
      } else if (id === 'mon-chip') {
        play('blip');
      }
    };

    const mo = new MutationObserver((records) => {
      for (const rec of records) {
        rec.addedNodes.forEach(handleNode);
      }
    });
    mo.observe(document.body, { childList: true });
  }

  // ---------------------------------------------------------------
  function boot() {
    if (!isEnabled()) return;
    try {
      observeNewOverlays();
    } catch (e) {
      console.warn('[sound-design] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.MSSoundDesign = { isEnabled, play };
})();
