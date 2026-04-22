/* production-polish.js — AAA-feel upgrades: breathing, eye-blinks, voice hooks.
 *
 * GOAL:
 *  Turn static sprites into "alive" sprites without replacing any art.
 *  When you (the owner) later produce real animation frames, Live2D rigs,
 *  or voice recordings, the engine is already wired to use them.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Feature-flagged on pp_main_story_enabled.
 *  - Never mutates game state.
 *  - Respects prefers-reduced-motion (disables breathing + blink).
 *  - Silent no-op when assets are missing \u2014 the page keeps working.
 *
 * ==============================================================
 * THREE FOUNDATIONS
 * ==============================================================
 *
 * 1) BREATHING ANIMATION
 *    - Auto-applies a subtle scale/translate loop to character images
 *      in encounter overlays, premium cards, main game sprite.
 *    - Per-character tempo via CHAR_META (calm chars breathe slower).
 *    - You do nothing \u2014 breathing activates on every sprite that
 *      appears in the right containers.
 *
 * 2) EYE-BLINK OVERLAY
 *    - Optional. If `assets/<char>/face/blink.png` exists, the engine
 *      overlays a closed-eye image briefly every 4\u20138s on top of any
 *      body sprite.
 *    - Your pipeline: create `blink.png` per character with the same
 *      framing as the body sprite, transparent background, eyes closed.
 *      Drop it in the folder \u2014 blink starts automatically.
 *
 * 3) VOICE LINE HOOKS
 *    - MSCard.show already accepts a `voice` field on each beat.
 *      This module monkey-wraps show() to auto-play the audio when
 *      the line begins typing.
 *    - Your pipeline: record a line, save as `assets/voice/<char>_<id>.mp3`,
 *      add `voice: 'assets/voice/alistair_ch1_open.mp3'` to the beat.
 *      No other code changes.
 *    - Missing file = silent no-op. Safe to ship before voices exist.
 *
 * ==============================================================
 * UPGRADE PATH TO LIVE2D / SPINE / FULL ANIMATION
 * ==============================================================
 *
 *  When you\u2019re ready for full animated characters, replace the
 *  per-character sprite logic with your Live2D widget. The rest of the
 *  game doesn\u2019t care \u2014 it just asks for "show character at pose X."
 *  The container element `ms-char-img` / `mscard-char` is where a
 *  Live2D canvas would live. We\u2019ll do that module-swap in a future pass.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  function isEnabled() { try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; } }

  const reducedMotion = (() => {
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (_) { return false; }
  })();

  // ---------------------------------------------------------------
  // Per-character animation metadata. Tweak tempo / intensity to match
  // personality \u2014 calm chars breathe slower and smaller, the antagonist
  // barely breathes at all (feels uncanny).
  const CHAR_META = {
    alistair: { breathS: 4.2, breathScale: 0.015, blinkMin: 4, blinkMax: 7 },
    elian:    { breathS: 5.2, breathScale: 0.012, blinkMin: 5, blinkMax: 9 },
    lyra:     { breathS: 5.8, breathScale: 0.014, blinkMin: 6, blinkMax: 10 },
    caspian:  { breathS: 4.0, breathScale: 0.016, blinkMin: 4, blinkMax: 6 },
    lucien:   { breathS: 4.8, breathScale: 0.013, blinkMin: 5, blinkMax: 9 },
    noir:     { breathS: 6.4, breathScale: 0.009, blinkMin: 8, blinkMax: 14 }, // predator-still
    proto:    { breathS: 3.2, breathScale: 0.010, blinkMin: 3, blinkMax: 5 }    // glitchy, fast
  };
  const DEFAULT_META = { breathS: 5.0, breathScale: 0.013, blinkMin: 5, blinkMax: 8 };

  function metaFor(imgEl) {
    const src = (imgEl && imgEl.src) || '';
    for (const c of Object.keys(CHAR_META)) {
      if (src.indexOf('/' + c + '/') !== -1) return Object.assign({ id: c }, CHAR_META[c]);
    }
    return Object.assign({ id: null }, DEFAULT_META);
  }

  // ---------------------------------------------------------------
  // INJECTED STYLES
  function injectStyles() {
    if (document.getElementById('prodpolish-css')) return;
    const s = document.createElement('style');
    s.id = 'prodpolish-css';
    s.textContent = `
      @keyframes ppBreath {
        0%,100% { transform: translateY(0) scale(1); }
        50%     { transform: translateY(-2px) scale(var(--pp-breath-scale, 1.013)); }
      }
      .pp-breath {
        animation: ppBreath var(--pp-breath-s, 5s) ease-in-out infinite;
        transform-origin: 50% 85%;
        will-change: transform;
      }
      @keyframes ppBlinkFlash {
        0%,100% { opacity: 0; }
        40%,55% { opacity: 1; }
      }
      .pp-blink-overlay {
        position: absolute; inset: 0;
        pointer-events: none;
        opacity: 0;
        transition: opacity 80ms ease-out;
      }
      .pp-blink-overlay.flash { opacity: 1; }
      @media (prefers-reduced-motion: reduce) {
        .pp-breath { animation: none; }
      }
    `;
    document.head.appendChild(s);
  }

  // ---------------------------------------------------------------
  // BREATHING: observe the DOM, apply .pp-breath to any character-image
  // element we recognize. Idempotent \u2014 safe to re-apply.
  const BREATH_SELECTORS = [
    '#ms-char-img',       // meet-cute encounter
    '#mscard-char',       // premium card
    '#character-image',   // main game (if that\u2019s the id)
    '#char-body'          // alt main game
  ];

  function applyBreath(el) {
    if (!el || el.classList.contains('pp-breath')) return;
    if (reducedMotion) return;
    const m = metaFor(el);
    el.style.setProperty('--pp-breath-s', m.breathS + 's');
    el.style.setProperty('--pp-breath-scale', (1 + m.breathScale).toFixed(4));
    el.classList.add('pp-breath');
  }

  function scanAndAnimate() {
    BREATH_SELECTORS.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) applyBreath(el);
    });
  }

  function watchBreathing() {
    scanAndAnimate();
    const mo = new MutationObserver(() => scanAndAnimate());
    mo.observe(document.body, { childList: true, subtree: true });
  }

  // ---------------------------------------------------------------
  // EYE BLINKS: for each breathing character image, overlay a blink
  // sprite (face/blink.png) that briefly pulses to 1.
  // If the file doesn\u2019t exist, we silently fail and never retry.
  const _blinkTracked = new WeakMap();

  function setupBlinkOverlay(imgEl) {
    if (reducedMotion) return;
    if (_blinkTracked.has(imgEl)) return;
    const m = metaFor(imgEl);
    if (!m.id) return;
    const blinkSrc = 'assets/' + m.id + '/face/blink.png';

    // Probe file once
    const probe = new Image();
    probe.onload = () => {
      // Only install if the parent still exists and is a character wrap
      const wrap = imgEl.parentElement;
      if (!wrap) return;
      if (wrap.querySelector('.pp-blink-overlay')) { _blinkTracked.set(imgEl, true); return; }
      // Make parent position:relative if it isn\u2019t
      const posNow = getComputedStyle(wrap).position;
      if (posNow === 'static') wrap.style.position = 'relative';

      const layer = document.createElement('img');
      layer.className = 'pp-blink-overlay';
      layer.src = blinkSrc;
      layer.style.width = '100%';
      layer.style.height = '100%';
      layer.style.objectFit = 'contain';
      wrap.appendChild(layer);
      _blinkTracked.set(imgEl, true);

      const scheduleBlink = () => {
        const delay = (m.blinkMin + Math.random() * (m.blinkMax - m.blinkMin)) * 1000;
        setTimeout(() => {
          if (!document.body.contains(layer)) return;
          layer.classList.add('flash');
          setTimeout(() => { layer.classList.remove('flash'); scheduleBlink(); }, 160);
        }, delay);
      };
      scheduleBlink();
    };
    probe.onerror = () => { _blinkTracked.set(imgEl, true); /* give up silently */ };
    probe.src = blinkSrc;
  }

  function watchBlinks() {
    if (reducedMotion) return;
    setInterval(() => {
      BREATH_SELECTORS.forEach((sel) => {
        const el = document.querySelector(sel);
        if (el) setupBlinkOverlay(el);
      });
    }, 1200);
  }

  // ---------------------------------------------------------------
  // VOICE HOOKS: wrap MSCard.show so that any beat with `voice: '...'`
  // plays the audio when the line starts typing.
  //
  // Author pattern:
  //   { type: 'line', text: '\u2026', voice: 'assets/voice/alistair_ch1_open.mp3', ... }
  function installVoiceHook() {
    if (!window.MSCard || typeof window.MSCard.show !== 'function') return;
    if (window.MSCard._voiceHooked) return;
    const origShow = window.MSCard.show;

    // We can\u2019t easily intercept beat execution without forking the engine.
    // Instead we patch the API: callers can set `voice` on the beat, and we
    // schedule audio when the line text first appears in #mscard-line via
    // mutation observer. Lightweight + engine-agnostic.
    let audioEl = null;
    const voicePlay = (path) => {
      try {
        if (audioEl) { audioEl.pause(); audioEl = null; }
        audioEl = new Audio(path);
        audioEl.volume = 0.85;
        audioEl.play().catch(() => {});
      } catch (_) {}
    };
    const voiceStop = () => { try { if (audioEl) { audioEl.pause(); audioEl = null; } } catch (_) {} };

    // Mutation observer on the mscard-line text node \u2014 fires on every beat.
    const observeLine = () => {
      const line = document.getElementById('mscard-line');
      if (!line || line._ppVoiceObserved) return;
      line._ppVoiceObserved = true;
      // We track which beat is "current" by stashing it on the root when
      // show() runs. Simple: whenever the line\u2019s text length transitions
      // from 0 to >0 we read root._ppCurrentBeat.voice and play it.
      let wasEmpty = true;
      const mo = new MutationObserver(() => {
        const hasText = (line.textContent || '').length > 0;
        if (wasEmpty && hasText) {
          const root = document.getElementById('mscard-root');
          const beat = root && root._ppCurrentBeat;
          if (beat && beat.voice) voicePlay(beat.voice);
        }
        wasEmpty = !hasText;
      });
      mo.observe(line, { childList: true, characterData: true, subtree: true });
    };

    // Wrap show() to stash the current beat per call. Because the engine
    // runs beats sequentially we can\u2019t know which is "now" from outside \u2014
    // but we CAN intercept the beats array and stash each as it starts.
    window.MSCard.show = function (card, onDone) {
      try {
        if (card && Array.isArray(card.beats)) {
          // Clone beats and wrap type:'line' with a side-effect that stashes.
          card = Object.assign({}, card, {
            beats: card.beats.map((b) => {
              if (b && b.type === 'line' && b.voice) {
                // We attach a marker the observer can read.
                return Object.assign({}, b, { _ppHasVoice: true });
              }
              return b;
            })
          });
        }
      } catch (_) {}
      const ret = origShow.call(this, card, function wrappedDone() {
        voiceStop();
        try { onDone && onDone(); } catch (_) {}
      });

      // After the root is in DOM, start observing + maintain current beat.
      setTimeout(() => {
        observeLine();
        const root = document.getElementById('mscard-root');
        if (!root) return;
        if (card && Array.isArray(card.beats)) {
          let idx = 0;
          root._ppBeats = card.beats;
          // We can\u2019t see the engine\u2019s internal beat index, so we use the
          // mutation-observer trick above: the NEXT line-appearance is
          // associated with the NEXT line-beat in order. We maintain a
          // pointer and advance each time a new line starts.
          const line = document.getElementById('mscard-line');
          if (line) {
            let wasEmpty = true;
            const mo = new MutationObserver(() => {
              const hasText = (line.textContent || '').length > 0;
              if (wasEmpty && hasText) {
                // advance pointer to next line-type beat
                while (idx < card.beats.length && card.beats[idx].type !== 'line') idx++;
                if (idx < card.beats.length) {
                  root._ppCurrentBeat = card.beats[idx];
                  idx++;
                }
              }
              wasEmpty = !hasText;
            });
            mo.observe(line, { childList: true, characterData: true, subtree: true });
            root._ppVoiceMO = mo;
          }
        }
      }, 40);

      return ret;
    };
    window.MSCard._voiceHooked = true;
  }

  // ---------------------------------------------------------------
  function boot() {
    if (!isEnabled()) return;
    try {
      injectStyles();
      watchBreathing();
      watchBlinks();
      // Wait a tick so MSCard loads first
      setTimeout(installVoiceHook, 300);
    } catch (e) {
      console.warn('[production-polish] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.ProductionPolish = {
    isEnabled,
    reducedMotion: () => reducedMotion,
    charMeta: CHAR_META,
    forceBreath: () => scanAndAnimate(),
    forceBlink: (charId) => {
      const overlay = document.querySelector('.pp-blink-overlay');
      if (overlay) { overlay.classList.add('flash'); setTimeout(() => overlay.classList.remove('flash'), 160); }
    },
    playVoice: (path) => { try { new Audio(path).play().catch(()=>{}); } catch(_) {} }
  };
})();
