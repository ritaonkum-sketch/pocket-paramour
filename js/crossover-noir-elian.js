/* crossover-noir-elian.js — "The Two Who Loved Her"
 * --------------------------------------------------------------------------
 * Registers window.MSCrossNoirElian.
 *
 * WHAT THIS SCENE DOES:
 *   Six hundred years ago, both of these men loved Veyra. One was a young
 *   Warden. The other was a young prince of Nocthera. She died. The Warden
 *   tended her forest. The prince was sealed under Aethermoor's stones.
 *   Neither has seen the other since.
 *
 *   Now Noir is free and Elian has been reminded he is allowed to want a
 *   life again. The player brings them together at Veyra's grave. No
 *   swords. No declarations. Two men remembering a woman differently \u2014
 *   finally able to stand in the same forest.
 *
 *   This is NOT reconciliation in the forgiveness sense. Neither man
 *   owes the other anything. Both loved her; both lost her. What happens
 *   here is closer to \u2014 mutual recognition. They can now exist in the
 *   same kingdom without the stone weight of unfinished history.
 *
 *   The player bears witness. No choice. This scene belongs to them.
 *
 * TRIGGER CONDITIONS:
 *   - Main-story route enabled
 *   - Noir met (Chapter 6 done OR encounter flag)
 *   - Elian bond >= 40 (so he has at least hinted at Veyra)
 *   - Player is currently on Elian OR Noir
 *   - Game is idle
 *   - pp_cross_noir_elian_seen != '1'
 *
 * FLAGS WRITTEN:
 *   - pp_cross_noir_elian_seen = '1'
 *
 * VOICE DIRECTION:
 *   Noir \u2014 Cavill-Geralt, stripped of seduction. This is Corvin in full
 *   plain dignity. The dreamy-seductive voice would be an insult at this
 *   grave. Short, plain, heavy.
 *   Elian \u2014 Jamie Fraser at his deepest. Six centuries of grief held in
 *   measured words. He speaks first \u2014 he has been waiting longest.
 *   Both men use each other's OLD names. Noir calls Elian by his rank
 *   from before ("Warden"). Elian uses Noir's real name ("Corvin").
 *   That is its own declaration of respect.
 */

(function () {
  'use strict';

  // --- Config ---------------------------------------------------------------
  const FLAG_ROUTE    = 'pp_main_story_enabled';
  const FLAG_SEEN     = 'pp_cross_noir_elian_seen';
  const FLAG_NOIR_MET = 'pp_ms_encounter_noir_seen';
  const FLAG_CH6      = 'pp_chapter_done_6';
  const FLAG_ELIAN_MET= 'pp_ms_encounter_elian_seen';
  const AFF_KEYS_E    = ['pp_affection_elian', 'elian_affection'];
  const MIN_AFF       = 40;
  const POLL_MS       = 25000;

  // --- Assets ---------------------------------------------------------------
  const ELIAN_POSE    = 'assets/elian/body/calm.png';
  const ELIAN_ALT     = 'assets/elian/body/foraging.png';
  const NOIR_POSE     = 'assets/noir/body/neutral.png';
  const NOIR_ALT      = 'assets/noir/body/casual1.png';
  const BG_SRC        = 'assets/bg-elian-forest.png';

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
      'background:#050806', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #13201a 0%, #04060a 80%)',
      'background-size:cover', 'background-position:center',
      'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => { bg.style.backgroundImage = `url(${BG_SRC})`; bg.style.opacity = '0.38'; };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    // The rowan \u2014 a small tree-glow between them where the grave stone lies
    const rowan = el('div', [
      'position:absolute', 'left:50%', 'top:45%', 'transform:translate(-50%,-50%)',
      'width:30vmin', 'height:2px', 'border-radius:2px', 'pointer-events:none',
      'background:linear-gradient(90deg, transparent, rgba(230,210,170,0.3), transparent)',
      'opacity:0', 'transition:opacity 1200ms ease'
    ].join(';'));
    root.appendChild(rowan);

    // Two sprites side by side
    const charRow = el('div', [
      'position:relative', 'margin-bottom:24vh',
      'width:92%', 'max-width:720px', 'height:48vh',
      'display:flex', 'flex-direction:row', 'align-items:flex-end', 'justify-content:space-between',
      'gap:6%'
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
      img.onerror = () => {
        img.style.opacity = '0';
      };
      wrap.appendChild(img);
      return { wrap, img };
    }

    const elian = makeChar('rgba(140,190,140,0.35)');
    const noir  = makeChar('rgba(160,90,200,0.35)');
    charRow.appendChild(elian.wrap);
    charRow.appendChild(noir.wrap);
    root.appendChild(charRow);

    // Dialogue panel
    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(8,14,10,0.90)', 'backdrop-filter:blur(6px)',
      'color:#e2e8dc', 'font-size:17px', 'line-height:1.5',
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

    return { root, elian, noir, dialogue, line, speaker, rowan };
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

    n.elian.img.src = ELIAN_POSE;
    n.noir.img.src  = NOIR_POSE;

    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(500);

    // Elian is already there. Has been.
    n.elian.wrap.style.opacity = '1';
    n.elian.wrap.style.transform = 'translateY(0) scale(1)';
    await wait(700);

    // Rowan glows faintly between them
    n.rowan.style.opacity = '0.7';

    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      // ---- BEAT 1: narration. The grave. The rowan. ----------------
      n.speaker.textContent = '\u2014 UNDER THE ROWAN, DEEP THORNWOOD, WHERE THE STONE LIES \u2014';
      await type(n.line, 'Elian is here. \u2014 He has been here for six hundred years. \u2014 The stone under the rowan has no carving. \u2014 That may change tonight. \u2014 That is not what has changed tonight.', 22);
      await wait(2800);

      await type(n.line, 'Something is walking into the Thornwood from the south. \u2014 It has not walked these trees since the last kingdom ended. \u2014 Elian hears the footfall before he sees the man. \u2014 He does not move. \u2014 He waits.', 22);
      await wait(2800);

      // ---- BEAT 2: Noir arrives ------------------------------------
      n.noir.wrap.style.opacity = '1';
      n.noir.wrap.style.transform = 'translateY(0) scale(1)';
      await wait(1000);

      await type(n.line, '*Noir crosses the treeline. Elian does not draw. Noir does not strike. Neither speaks for a long time. The rowan between them, unmoving. Six hundred years compress into the space between two silhouettes.*', 22);
      await wait(3600);

      // ---- BEAT 3: Elian speaks first. He has been waiting longer. --
      await say(n, 'ELIAN', 'Corvin.', 20);
      await wait(1800);

      // ---- BEAT 4: Noir uses Elian's old rank ----------------------
      await say(n, 'NOIR', 'Warden. \u2014 \u2026You have gone grey at the temples. \u2014 Good. \u2014 The rest of you looks the same.', 22);
      await wait(3000);

      // ---- BEAT 5: Elian, dry, holding centuries in a grunt -------
      n.elian.img.src = ELIAN_ALT;
      await say(n, 'ELIAN', 'You were younger when I saw you last. \u2014 You are younger now. \u2014 Six hundred years under stone. \u2014 It did not suit you.', 22);
      await wait(3000);

      await say(n, 'NOIR', '\u2026No. \u2014 It did not.', 22);
      await wait(2200);

      // ---- BEAT 6: Elian names the reason they are here ------------
      await say(n, 'ELIAN', 'She is under this rowan. \u2014 I have been tending the soil. \u2014 I did not bury her deep. \u2014 I could not bear to.', 22);
      await wait(3000);

      n.noir.img.src = NOIR_ALT;
      await say(n, 'NOIR', '\u2026Thank you. \u2014 For tending her. \u2014 I was \u2026 not where I should have been.', 22);
      await wait(2800);

      // ---- BEAT 7: Elian, with the dry warmth of a man who has had time
      //      to forgive very slowly ------------------------------------
      await say(n, 'ELIAN', 'You were under my grandmother\u2019s stone. \u2014 You were where the kingdom put you. \u2014 She would not blame you. \u2014 I have had six hundred years to work out who to blame. \u2014 It is not you.', 22);
      await wait(3600);

      await say(n, 'NOIR', '*closes his eyes, a long breath* \u2014 That is \u2026 more kindness than I expected. \u2014 I will accept it. \u2014 I have not been offered kindness by one of you in some time.', 22);
      await wait(3200);

      // ---- BEAT 8: the memory move \u2014 they remember her differently -
      await say(n, 'ELIAN', 'She liked the east path at dusk. \u2014 She would not eat the red berries. She said they were for the foxes.', 22);
      await wait(2600);

      await say(n, 'NOIR', 'She hated carnations. \u2014 I never understood why. \u2014 I brought them to her once. \u2014 She laughed for ten minutes. \u2014 I stopped bringing them.', 22);
      await wait(3000);

      await say(n, 'ELIAN', '\u2026That is the same laugh I remember.', 20);
      await wait(2200);

      await say(n, 'NOIR', 'It is the same woman. \u2014 We both knew the same woman. \u2014 There is a strange comfort in that.', 22);
      await wait(2800);

      // ---- BEAT 9: the quiet laugh. Neither smiles widely. Something
      //      settles. -----------------------------------------------
      n.elian.img.src = ELIAN_POSE;
      n.noir.img.src  = NOIR_POSE;
      await type(n.line, '*Elian does not laugh. He exhales through his nose, which is his laugh. Noir lets something like a smile move across his mouth and away. The rowan between them does not shake. Something six hundred years old unlocks.*', 22);
      await wait(3200);

      // ---- BEAT 10: the future move ------------------------------
      await say(n, 'ELIAN', 'The Weaver is with me now. \u2014 The new one. \u2014 I will not lose this one. \u2014 I need you to know that.', 22);
      await wait(2800);

      await say(n, 'NOIR', 'Good. \u2014 I also will not lose this one. \u2014 That may be complicated between us one day. \u2014 Tonight it is not. \u2014 Tonight we are men who loved the same woman, and we can stand under her rowan. \u2014 That is enough.', 22);
      await wait(3600);

      // ---- BEAT 11: the acknowledgment of the player as witness ---
      await say(n, 'ELIAN', '*looks at you, briefly* \u2014 You brought us here. \u2014 Thank you. \u2014 Neither of us could have done this alone. \u2014 You carry that name differently than she did. \u2014 But you carry it.', 22);
      await wait(3200);

      await say(n, 'NOIR', '*a small bow, gracious, ancient* \u2014 Weaver. \u2014 Thank you for the hour. \u2014 And for the forgiveness neither of us could ask for.', 22);
      await wait(3000);

      // ---- Closing -----------------------------------------------
      n.speaker.textContent = '';
      await type(n.line, 'Elian does not walk with Noir back to the south. \u2014 Noir does not stay. \u2014 One stays with the rowan. \u2014 One walks into the dark again, quieter than he arrived. \u2014 The forest exhales.', 22);
      await wait(3200);

      n.rowan.style.opacity = '0';
      n.root.style.opacity = '0';
      await wait(700);

      lsSet(FLAG_SEEN, '1');

    } catch (e) {
      console.warn('[crossover-noir-elian] aborted:', e);
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
  function metElian()     { return lsGet(FLAG_ELIAN_MET) === '1' || lsGet('pp_met_elian') === '1'; }

  function isGameIdle() {
    const g = window._game;
    if (!g) return false;
    const who = g.selectedCharacter || g.characterId;
    if (who !== 'elian' && who !== 'noir') return false;
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
    if (!metElian()) return false;
    if (getAff(AFF_KEYS_E) < MIN_AFF) return false;
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
    }, 20000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.MSCrossNoirElian = {
    play,
    force() { lsSet(FLAG_SEEN, ''); _firing = false; tick(); },
    reset() { try { localStorage.removeItem(FLAG_SEEN); } catch (_) {} },
    seenKey: FLAG_SEEN
  };
})();
