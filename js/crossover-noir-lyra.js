/* crossover-noir-lyra.js — "The Song"
 * --------------------------------------------------------------------------
 * Registers window.MSCrossNoirLyra.
 *
 * WHAT THIS SCENE DOES:
 *   Lyra hums. Noir hears it. He taught the melody to her mother's people
 *   six hundred years ago, before the seal, when Nocthera was alive and
 *   the siren-kind were many. He thought they were all lost. Lyra is the
 *   last one who still knows the song. She does not know who he is.
 *
 *   This scene is the MELODY RECOGNITION. It is tender. It is the moment
 *   Noir drops every mask he has \u2014 no seduction, no chin-lift, no
 *   "Hmm." He is Prince Corvin Noctalis, who loved a vanished people,
 *   hearing his own old song hummed back at him by their last daughter.
 *
 *   Then he teaches Lyra the second verse. The one her mother never
 *   learned \u2014 the hunters came first. Lyra is the first person in 600
 *   years to hear it. She will carry it from now on.
 *
 *   Pays off:
 *   - Existing lore: "Her cave was mine first. I left her the acoustics."
 *   - Noir's new whisper (post voice-pass): "I taught her mother's people
 *     a song, once. \u2014 I do not think she knows that. \u2014 Do not tell her.
 *     Yet."
 *   - Lyra's unseal epilogue: "He said he had taught a young siren a
 *     song, six hundred years ago. I hummed it back."
 *
 * TRIGGER CONDITIONS:
 *   - Main-story route enabled
 *   - Noir met (Chapter 6 done OR encounter seen)
 *   - Lyra bond >= 35
 *   - Player is currently on Lyra OR Noir
 *   - Game is idle
 *   - pp_cross_noir_lyra_seen != '1'
 *
 * FLAGS WRITTEN:
 *   - pp_cross_noir_lyra_seen = '1'
 *
 * VOICE DIRECTION:
 *   Noir \u2014 no seduction tonight. No "Mm." as punctuation. The mask is
 *   OFF. He is gentler than any scene he has ever been in. Six hundred
 *   years of held grief come out as near-whispers. He treats her with
 *   the same reverence one gives a relic \u2014 because she is one. The last
 *   of a people he knew.
 *   Lyra \u2014 shifts from sovereign-siren to girl-who-just-found-someone-
 *   who-knew-her-mother's-kind. The staff stops humming. The cave
 *   stops echoing. She listens with her whole body.
 *
 *   This scene is QUIET. Long pauses. The player is witness.
 */

(function () {
  'use strict';

  // --- Config ---------------------------------------------------------------
  const FLAG_ROUTE    = 'pp_main_story_enabled';
  const FLAG_SEEN     = 'pp_cross_noir_lyra_seen';
  const FLAG_NOIR_MET = 'pp_ms_encounter_noir_seen';
  const FLAG_CH6      = 'pp_chapter_done_6';
  const FLAG_LYRA_MET = 'pp_ms_encounter_lyra_seen';
  const AFF_KEYS_L    = ['pp_affection_lyra', 'lyra_affection'];
  const MIN_AFF       = 35;
  const POLL_MS       = 25000;

  // --- Assets ---------------------------------------------------------------
  const LYRA_POSE     = 'assets/lyra/body/casual1.png';
  const LYRA_ALT      = 'assets/lyra/body/casual2.png';
  const NOIR_POSE     = 'assets/noir/body/casual1.png';
  const NOIR_ALT      = 'assets/noir/body/neutral.png';
  const BG_SRC        = 'assets/bg-siren-cave.png';

  let _rootEl = null;

  // --- Helpers --------------------------------------------------------------
  function el(tag, css, text) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text) e.textContent = text;
    return e;
  }
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function type(elRef, text, cps) {
    return new Promise((resolve) => {
      elRef.textContent = '';
      const speed = Math.max(14, Math.round(1000 / (cps || 22)));
      let i = 0;
      const step = () => {
        if (i < text.length) { elRef.textContent += text[i++]; setTimeout(step, speed); }
        else resolve();
      };
      step();
    });
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  function getAff(keys) {
    for (const k of keys) {
      const v = lsGet(k);
      if (v != null) return parseInt(v, 10) || 0;
    }
    return 0;
  }

  // --- DOM build ------------------------------------------------------------
  function build() {
    const root = el('div', [
      'position:fixed', 'inset:0', 'z-index:10000',
      'background:#06060e', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #0f1a26 0%, #03040a 80%)',
      'background-size:cover', 'background-position:center',
      'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => { bg.style.backgroundImage = `url(${BG_SRC})`; bg.style.opacity = '0.45'; };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    // Melody ripples \u2014 subtle blue-purple waves, pulse when the song lands
    if (!document.getElementById('ms-keyframes-noir-lyra')) {
      const kf = document.createElement('style');
      kf.id = 'ms-keyframes-noir-lyra';
      kf.textContent = `
        @keyframes songRipple {
          0%   { transform: translate(-50%,-50%) scale(0.6); opacity: 0.6; }
          100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
        }
      `;
      document.head.appendChild(kf);
    }
    const ripple = el('div', [
      'position:absolute', 'left:50%', 'top:42%', 'transform:translate(-50%,-50%)',
      'width:22vmin', 'height:22vmin', 'border-radius:50%',
      'border:1.5px solid rgba(200,170,240,0.4)',
      'pointer-events:none', 'opacity:0'
    ].join(';'));
    root.appendChild(ripple);

    function pulseRipple() {
      ripple.style.animation = 'none';
      // reflow
      // eslint-disable-next-line no-unused-expressions
      ripple.offsetHeight;
      ripple.style.animation = 'songRipple 2.6s ease-out';
    }

    const charRow = el('div', [
      'position:relative', 'margin-bottom:24vh',
      'width:92%', 'max-width:720px', 'height:48vh',
      'display:flex', 'flex-direction:row', 'align-items:flex-end', 'justify-content:space-between',
      'gap:8%'
    ].join(';'));

    function makeChar(shadow) {
      const wrap = el('div', [
        'position:relative', 'flex:1',
        'height:100%', 'display:flex', 'align-items:flex-end', 'justify-content:center',
        'opacity:0', 'transform:translateY(20px) scale(0.97)',
        'transition:opacity 1100ms ease, transform 1100ms cubic-bezier(.2,.8,.2,1)'
      ].join(';'));
      const img = el('img', [
        'max-width:100%', 'max-height:100%', 'object-fit:contain',
        'filter:drop-shadow(0 10px 28px ' + shadow + ')',
        'pointer-events:none', 'user-select:none'
      ].join(';'));
      img.onerror = () => { img.style.opacity = '0'; };
      wrap.appendChild(img);
      return { wrap, img };
    }

    const lyra = makeChar('rgba(120,210,230,0.35)');
    const noir = makeChar('rgba(160,90,200,0.35)');
    charRow.appendChild(lyra.wrap);
    charRow.appendChild(noir.wrap);
    root.appendChild(charRow);

    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(10,12,24,0.90)', 'backdrop-filter:blur(6px)',
      'color:#e8e2f0', 'font-size:17px', 'line-height:1.5',
      'box-shadow:0 6px 24px rgba(0,0,0,0.6)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 600ms ease, transform 600ms ease',
      'font-family:inherit'
    ].join(';'));
    dialogue.id = 'ms-dialogue';
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.7;margin-bottom:6px;', '');
    speaker.id = 'ms-dialogue-speaker';
    const line = el('div', 'min-height:44px;', '');
    line.id = 'ms-dialogue-line';
    dialogue.appendChild(speaker);
    dialogue.appendChild(line);
    root.appendChild(dialogue);

    return { root, lyra, noir, dialogue, line, speaker, ripple, pulseRipple };
  }

  function say(n, name, text, cps) {
    n.speaker.textContent = name;
    return type(n.line, text, cps || 22);
  }

  // --- Scene ----------------------------------------------------------------
  async function play(onDone) {
    if (_rootEl) { try { onDone && onDone(); } catch (_) {} return; }
    const n = build();
    _rootEl = n.root;
    document.body.appendChild(n.root);

    n.lyra.img.src = LYRA_POSE;
    n.noir.img.src = NOIR_POSE;

    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(500);

    // Lyra alone first, humming
    n.lyra.wrap.style.opacity = '1';
    n.lyra.wrap.style.transform = 'translateY(0) scale(1)';
    await wait(700);

    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      // ---- BEAT 1: the cave. Lyra is humming. -----------------------
      n.speaker.textContent = '\u2014 LYRA\u2019S CAVE, LATE TIDE, NO MOON \u2014';
      await type(n.line, 'She is humming. \u2014 Her mother\u2019s song. \u2014 The third verse, which she never finishes, because it was the last verse her mother taught her before the hunters came.', 22);
      await wait(2800);
      n.pulseRipple();
      await wait(1600);

      await type(n.line, 'Something enters the cave mouth. \u2014 Quiet enough that the tide does not notice. \u2014 She does not notice. \u2014 He does not want her to notice yet. \u2014 He is listening.', 22);
      await wait(2800);

      // ---- BEAT 2: Noir, listening from the entrance ---------------
      n.noir.wrap.style.opacity = '1';
      n.noir.wrap.style.transform = 'translateY(0) scale(1)';
      await wait(900);

      await type(n.line, '*Noir stands at the cave mouth, perfectly still. The dreamy-seductive he usually wears is gone. His face is the face of a man hearing a voice he thought was buried six hundred years ago.*', 22);
      await wait(3200);
      n.pulseRipple();
      await wait(1200);

      // ---- BEAT 3: Lyra senses him, turns --------------------------
      n.lyra.img.src = LYRA_ALT;
      await type(n.line, '*She feels him. Stops mid-note. Turns. The melody cuts. His face is the face of someone who has just had a piece of himself returned.*', 22);
      await wait(2800);

      // ---- BEAT 4: Noir, plain and quiet ----------------------------
      await say(n, 'NOIR', 'Do not stop. \u2014 Please. \u2014 Finish the verse.', 22);
      await wait(2400);

      // ---- BEAT 5: Lyra, wary -------------------------------------
      await say(n, 'LYRA', 'Why.', 20);
      await wait(1800);

      // ---- BEAT 6: Noir, the reveal in two halves ------------------
      n.noir.img.src = NOIR_ALT;
      await say(n, 'NOIR', 'Because I taught it to your mother\u2019s people. \u2014 Before your mother was born. \u2014 Before her mother was born. \u2014 I thought all of you were gone. \u2014 You are not all gone.', 20);
      await wait(3800);

      // ---- BEAT 7: Lyra stops breathing -----------------------------
      await type(n.line, '*Lyra does not move. Her hand tightens on her mother\u2019s staff. She stares at him like a person watching a ghost walk out of a wall.*', 22);
      await wait(3000);

      // ---- BEAT 8: Lyra, small ---------------------------------------
      await say(n, 'LYRA', 'My mother taught me. \u2014 Before she died. \u2014 She said one man had given her people the song. \u2014 She said he was a prince. \u2014 She said he was sealed under stone.', 20);
      await wait(3400);

      // ---- BEAT 9: Noir confirms, quietly -----------------------------
      await say(n, 'NOIR', 'He was. \u2014 He is no longer. \u2014 He is standing in your cave. \u2014 He did not know there was anyone left to hear it.', 20);
      await wait(3000);

      // ---- BEAT 10: Lyra \u2014 a single word -------------------------
      await say(n, 'LYRA', 'Corvin.', 22);
      await wait(2200);

      // ---- BEAT 11: Noir closes his eyes ---------------------------
      await type(n.line, '*Noir closes his eyes. A very long pause. When he opens them, he has been crying silently.*', 22);
      await wait(3000);

      await say(n, 'NOIR', 'No one has said that name \u2026 properly \u2026 in six hundred years. \u2014 Except the new Weaver. \u2014 And now you. \u2014 \u2026Your mother\u2019s mouth taught yours to say it. \u2014 That is \u2014 \u2014', 22);
      await wait(3400);

      await say(n, 'NOIR', 'I am going to need a moment.', 22);
      await wait(2400);

      // ---- BEAT 12: Lyra approaches slowly -------------------------
      await type(n.line, '*Lyra steps toward him. Not quickly. Not afraid. She stops an arm\u2019s length away, staff grounded between them.*', 22);
      await wait(2800);

      // ---- BEAT 13: Lyra, the gift --------------------------------
      await say(n, 'LYRA', 'There is a third verse. \u2014 My mother taught me a version. \u2014 I think she learned it broken. \u2014 The hunters came before she finished learning.', 20);
      await wait(3400);

      // ---- BEAT 14: Noir \u2014 the teaching move ---------------------
      await say(n, 'NOIR', '*small, almost a smile* \u2014 I can finish it for you. \u2014 If you will let me.', 22);
      await wait(2800);

      n.pulseRipple();

      // ---- BEAT 15: the song completes ----------------------------
      await type(n.line, '*He hums the melody. She joins. The first verse is hers. The second is his. The third he sings alone \u2014 slowly, in a language the sea has not heard in six centuries. She listens with her whole body. When he stops, she does not speak for a long time.*', 22);
      await wait(4200);
      n.pulseRipple();
      await wait(1600);

      await say(n, 'LYRA', '*quiet, wrecked, steady* \u2014 That is the verse. \u2014 That is the one my mother was reaching for.', 20);
      await wait(2800);

      await say(n, 'NOIR', 'She got close. \u2014 Tell her, if the water carries. \u2014 She got close.', 22);
      await wait(3000);

      // ---- BEAT 16: Noir, the boundary -----------------------------
      await say(n, 'NOIR', 'I will not teach you more verses tonight. \u2014 You will need to sit with this one for a while. \u2014 I will come back, if you ask. \u2014 I will not come back, if you do not. \u2014 Either is honourable.', 22);
      await wait(3600);

      // ---- BEAT 17: Lyra, small but sovereign -----------------------
      await say(n, 'LYRA', '*small* \u2014 Come back. \u2014 My mother would have wanted to hear you finish it. \u2014 I am doing what she could not.', 22);
      await wait(3200);

      // ---- BEAT 18: the player as witness ----------------------------
      n.speaker.textContent = '';
      await type(n.line, '*Noir bows, ancient and gracious, to the player and then to Lyra. He steps back into the dark of the cave entrance. He is gone.*', 22);
      await wait(2600);

      await type(n.line, 'Lyra sits down where she stood. \u2014 She puts her hand on the cave floor. \u2014 Six hundred years of her mother\u2019s kind, and one voice who remembered them. \u2014 She holds it quietly. \u2014 You sit with her. \u2014 She does not let you go for a long time.', 22);
      await wait(3600);

      n.root.style.opacity = '0';
      await wait(700);

      lsSet(FLAG_SEEN, '1');

    } catch (e) {
      console.warn('[crossover-noir-lyra] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  // --- Trigger conditions ---------------------------------------------------
  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }
  function alreadySeen()  { return lsGet(FLAG_SEEN)  === '1'; }
  function metNoir()      { return lsGet(FLAG_NOIR_MET) === '1' || lsGet(FLAG_CH6) === '1'; }
  function metLyra()      { return lsGet(FLAG_LYRA_MET) === '1' || lsGet('pp_met_lyra') === '1'; }

  function isGameIdle() {
    const g = window._game;
    if (!g) return false;
    const who = g.selectedCharacter || g.characterId;
    if (who !== 'lyra' && who !== 'noir') return false;
    if (g.sceneActive || g.characterLeft) return false;
    const block = document.querySelector([
      '#ms-encounter-root', '#mscard-root', '#tp-root', '#chp-page',
      '#mg-overlay', '#mon-bundle-back', '#settings-overlay:not(.hidden)',
      '#cinematic-overlay.visible', '#event-overlay:not(.hidden)',
      '#gift-panel:not(.hidden)', '#training-panel:not(.hidden)',
      '#dress-panel:not(.hidden)', '#story-overlay:not(.hidden)',
      '#world-intro:not(.hidden)', '#main-story-page:not(.hidden)'
    ].join(','));
    return !block;
  }

  function shouldFire() {
    if (!routeEnabled()) return false;
    if (alreadySeen()) return false;
    if (!metNoir()) return false;
    if (!metLyra()) return false;
    if (getAff(AFF_KEYS_L) < MIN_AFF) return false;
    if (!isGameIdle()) return false;
    return true;
  }

  let _firing = false;
  function tick() {
    if (_firing) return;
    if (!shouldFire()) return;
    _firing = true;
    play(() => { _firing = false; });
  }

  function boot() {
    setTimeout(() => {
      tick();
      setInterval(tick, POLL_MS);
    }, 22000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.MSCrossNoirLyra = {
    play,
    force() { lsSet(FLAG_SEEN, ''); _firing = false; tick(); },
    reset() { try { localStorage.removeItem(FLAG_SEEN); } catch (_) {} },
    seenKey: FLAG_SEEN
  };
})();
