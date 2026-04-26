/* world-arrival.js — the prologue chain's opening scene
 * ============================================================================
 *   The Weaver wakes face-down in moss. South Thornwood. No memory of how.
 *   Cloak soaked. A torn page in her hand with the Aethermoor seal she has
 *   never seen before.
 *
 *   Plays once on a fresh save. Hands off to bridge-alistair on completion.
 *
 *   RENDERS VIA MSCard (premium-card.js) — the same engine that runs every
 *   main-story chapter. This guarantees identical layout: fixed character
 *   anchored at the bottom, dialogue panel pinned at the bottom of the
 *   screen, typewriter text, glow ring, title strip. No more custom bridge
 *   UI; no more layout shifts; no more text overlap.
 *
 *   Also exposes window.PPBridgeCompile.toMSCard(srcBeats) — the helper
 *   each bridge file uses to translate its writer-friendly BEATS array
 *   into MSCard's beat format. Single source of truth, used by all 8
 *   bridges.
 * ============================================================================
 */

(function () {
  'use strict';

  const FLAG_PLAYED = 'pp_arrival_played';

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  // ---------------------------------------------------------------------------
  // BEATS → MSCard compiler
  //
  // Bridge BEATS use a writer-friendly shape:
  //   { kind: 'narration', text, portrait? }     // unspoken, italic
  //   { kind: 'line', speaker, text, portrait? } // character speech
  //   { kind: 'tutorial', text }                 // closing nudge
  //
  // MSCard expects:
  //   { type: 'show', pose, wait }                // first beat — fade in
  //   { type: 'pose', src, animate }              // swap character pose
  //   { type: 'line', speaker, text, hold, cps }  // typewriter
  //   { type: 'hide' }                            // fade out
  //
  // The compiler walks the BEATS array, injecting `show`/`pose` beats when
  // the portrait changes, and a final `hide`. Narration becomes a `line`
  // beat with empty speaker (MSCard renders these in italic, no label).
  // ---------------------------------------------------------------------------
  function toMSCard(srcBeats, opts) {
    opts = opts || {};
    const out = [];
    let lastPortrait = null;
    let first = true;

    for (let i = 0; i < srcBeats.length; i++) {
      const b = srcBeats[i];
      const portrait = b.portrait || null;

      // Pose handling
      if (first) {
        out.push({ type: 'show', pose: portrait || (opts.fallbackPose || ''), wait: opts.firstWait || 600 });
        first = false;
        lastPortrait = portrait;
      } else if (portrait && portrait !== lastPortrait) {
        out.push({ type: 'pose', src: portrait, animate: 'swap' });
        lastPortrait = portrait;
      }

      // Line content
      let speaker = '';
      let hold = 1100;
      let cps  = 30;
      if (b.kind === 'line') {
        speaker = b.speaker || '';
        hold = 1400;
        cps = 28;
      } else if (b.kind === 'tutorial') {
        speaker = '';
        hold = 1900;
        cps = 26;
      }
      out.push({ type: 'line', speaker: speaker, text: b.text, hold: hold, cps: cps });
    }

    out.push({ type: 'hide' });
    return out;
  }

  // Public helper for the 7 bridge files to use.
  window.PPBridgeCompile = { toMSCard: toMSCard };

  // ---------------------------------------------------------------------------
  // Arrival itself
  // ---------------------------------------------------------------------------
  const BEATS = [
    { kind: 'narration', text: 'You wake face-down in moss. The smell is wet bark and last night’s rain. Your cloak is soaked through.' },
    { kind: 'narration', text: 'You do not remember falling. You do not remember choosing this place. You do not remember the place before this place.' },
    { kind: 'narration', text: 'There is a torn page in your hand. The seal on it is unfamiliar. Two crossed branches and a moon. Your fingers know the shape. You do not know why.' },
    { kind: 'narration', text: 'Somewhere through the trees, far off, a horn sounds twice. Patrol. The kind of horn that means a kingdom is awake and watching.' },
    { kind: 'narration', text: 'You try to stand. The world tilts. The moss tilts with you. You go down again, slowly, the way a candle goes out.' },
    { kind: 'narration', text: 'Hooves. Slow ones. A man’s footsteps. A voice — calm, exact, low — saying a word you do not catch.' },
    { kind: 'line', speaker: 'A MAN’S VOICE', text: '— alright. You are alright. Do not move. I have you.' }
  ];

  let _playing = false;
  let _resolveDone = null;

  function play() {
    if (_playing) return Promise.resolve();
    if (!window.MSCard || typeof window.MSCard.show !== 'function') {
      console.warn('[arrival] MSCard not available; skipping arrival scene.');
      return Promise.resolve();
    }
    _playing = true;
    return new Promise((resolve) => {
      _resolveDone = resolve;
      const card = {
        id: 'b_arrival',
        title: 'ARRIVAL',
        subtitle: 'Face Down in Moss',
        speaker: '',
        palette: { bg: '#06030f', glow: '#3a4860', accent: '#d8cfe6' },
        bg: null,
        beats: toMSCard(BEATS, { firstWait: 700 })
      };
      window.MSCard.show(card, () => { finish(); });
    });
  }

  function finish() {
    if (!_playing) return;
    _playing = false;
    lsSet(FLAG_PLAYED, '1');
    // Mark in chapter menu that this scene has been seen, and move the menu's
    // "current" pointer to b_alistair.
    try {
      lsSet('pp_chapter_done_b_arrival', '1');
      // Auto-mark PROLOGUE (legacy chapter id 0) done — arrival covers the
      // same narrative ground ("you woke with no memory") so PROLOGUE
      // shouldn't re-prompt as the next "current" entry in the menu.
      lsSet('pp_chapter_done_0', '1');
      lsSet('pp_current_chapter', 'b_alistair');
    } catch (_) {}

    // Auto-handoff to bridge-alistair ONLY on first playthrough. Replays
    // from the chapter menu (when the chain is past step 0) play standalone.
    setTimeout(() => {
      const stepNow = (window.PPChain && typeof window.PPChain.step === 'function')
        ? window.PPChain.step() : 0;
      if (stepNow === 0 && window.PPBridgeAlistair &&
          typeof window.PPBridgeAlistair.play === 'function') {
        window.PPBridgeAlistair.play();
      }
      if (_resolveDone) { _resolveDone(); _resolveDone = null; }
    }, 400);
  }

  window.PPWorldArrival = { play: play };
})();
