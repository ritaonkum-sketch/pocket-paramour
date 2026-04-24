/* crossover-lyra-lucien.js — "The Staffs"
 * --------------------------------------------------------------------------
 * Registers window.MSCrossLyraLucien.
 *
 * WHAT THIS SCENE DOES:
 *   The first half-siblings reveal. Lyra and Lucien meet. They share a
 *   father neither wanted them to share. Their bloodline-paired staffs
 *   hum in resonance the instant they see each other. Neither knew.
 *
 *   This scene pays off hints planted across both routes:
 *   - Lucien's midnight scene: "There was a crib in the west tower
 *     when I was seven. It was warm."
 *   - Lucien's bond epilogue: "I found her. We have tea on Thursdays."
 *   - Lyra's bond epilogue: "There is a man in a tower I have never
 *     visited. Bloodline like mine. The staff hummed when his name
 *     was said yesterday."
 *   - Noir's new whisper about Lucien: "Ask him about his sister. He
 *     has one. He does not know I know."
 *
 * TRIGGER CONDITIONS:
 *   - Main-story route is enabled
 *   - Lyra and Lucien both met (encounter flags OR met flags)
 *   - Lyra and Lucien both bonded enough to have opened their chosen
 *     affection scene (affection >= 40 each) \u2014 this is the bond floor
 *     for a reveal this intimate
 *   - The player is currently with EITHER Lyra OR Lucien
 *   - Game is idle (no other overlay, scene, panel, chapter open)
 *   - This scene has not been seen yet (pp_cross_lyra_lucien_seen != '1')
 *
 * FLAGS WRITTEN:
 *   - pp_cross_lyra_lucien_seen = '1'  (never replays)
 *   - pp_cross_lyra_lucien_choice = 'reconcile' | 'wait'
 *
 * VOICE DIRECTION FOR THIS SCENE:
 *   Lucien \u2014 Cumberbatch-Sherlock precision cracking under real emotion.
 *     The scholar in him names the phenomenon before the brother in him
 *     admits what it means.
 *   Lyra \u2014 Florence-Welch half-sung grief softened by discovery.
 *     Her line goes up at the end of every sentence because she is
 *     learning a sister in real time.
 *   Both are HESITANT. Neither rushes. The scene is about two people who
 *   have lived alone deciding whether to have family now.
 *
 *   The staffs resonating is the supernatural cue. Everything else is
 *   human. Keep it quiet. Long held pauses. The player says nothing \u2014
 *   they bear witness.
 *
 * SAFETY CONTRACT:
 *   Self-contained overlay. Additive. Poll loop backs off during other
 *   scenes. Never runs if flag is set.
 */

(function () {
  'use strict';

  // --- Config ---------------------------------------------------------------
  const FLAG_ROUTE    = 'pp_main_story_enabled';
  const FLAG_SEEN     = 'pp_cross_lyra_lucien_seen';
  const FLAG_CHOICE   = 'pp_cross_lyra_lucien_choice';
  const FLAG_MET_L    = 'pp_met_lyra';
  const FLAG_MET_C    = 'pp_met_lucien';
  const FLAG_ENC_L    = 'pp_ms_encounter_lyra_seen';
  const FLAG_ENC_C    = 'pp_ms_encounter_lucien_seen';
  const AFF_KEYS_L    = ['pp_affection_lyra', 'lyra_affection'];
  const AFF_KEYS_C    = ['pp_affection_lucien', 'lucien_affection'];
  const MIN_AFF       = 40;
  const POLL_MS       = 25000;

  // --- Assets ---------------------------------------------------------------
  const LYRA_POSE     = 'assets/lyra/body/casual1.png';
  const LUCIEN_POSE   = 'assets/lucien/body/casual1.png';
  const LUCIEN_ALT    = 'assets/lucien/body/amused.png';
  const LYRA_ALT      = 'assets/lyra/body/casual2.png';
  const BG_SRC        = 'assets/bg-lyra-cliff.png'; // coast-edge neutral ground

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
      const speed = Math.max(14, Math.round(1000 / (cps || 26)));
      let i = 0;
      const step = () => {
        if (i < text.length) { elRef.textContent += text[i++]; setTimeout(step, speed); }
        else resolve();
      };
      step();
    });
  }
  function waitForTap(target) {
    return new Promise((resolve) => {
      const onTap = (e) => {
        e.stopPropagation();
        target.removeEventListener('click', onTap);
        target.removeEventListener('touchstart', onTap);
        resolve();
      };
      target.addEventListener('click', onTap);
      target.addEventListener('touchstart', onTap, { passive: true });
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

  // --- DOM build (two characters side-by-side) -----------------------------
  function build() {
    const root = el('div', [
      'position:fixed', 'inset:0', 'z-index:10000',
      'background:#080810', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    // Background
    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #1a1a2f 0%, #04040c 80%)',
      'background-size:cover', 'background-position:center',
      'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => { bg.style.backgroundImage = `url(${BG_SRC})`; bg.style.opacity = '0.40'; };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    // The resonance glow \u2014 gold-blue harmonic between the two characters
    if (!document.getElementById('ms-keyframes-lyra-lucien')) {
      const kf = document.createElement('style');
      kf.id = 'ms-keyframes-lyra-lucien';
      kf.textContent = `
        @keyframes staffResonate {
          0%,100% { opacity: 0.25; transform: translate(-50%,-50%) scale(0.9); }
          50%     { opacity: 0.7;  transform: translate(-50%,-50%) scale(1.1); }
        }
      `;
      document.head.appendChild(kf);
    }
    const resonance = el('div', [
      'position:absolute', 'left:50%', 'top:40%', 'transform:translate(-50%,-50%)',
      'width:50vmin', 'height:50vmin', 'border-radius:50%', 'pointer-events:none',
      'background:radial-gradient(circle, rgba(200,170,240,0.45) 0%, rgba(160,200,240,0.20) 40%, transparent 70%)',
      'opacity:0'
    ].join(';'));
    resonance.id = 'crossover-resonance';
    root.appendChild(resonance);

    // Two character sprites side by side
    const charRow = el('div', [
      'position:relative', 'margin-bottom:26vh',
      'width:92%', 'max-width:640px', 'height:48vh',
      'display:flex', 'flex-direction:row', 'align-items:flex-end', 'justify-content:space-between',
      'gap:4%'
    ].join(';'));

    function makeChar(side) {
      const wrap = el('div', [
        'position:relative', 'flex:1',
        'height:100%', 'display:flex', 'align-items:flex-end', 'justify-content:center',
        'opacity:0', 'transform:translateY(20px) scale(0.97)',
        'transition:opacity 900ms ease, transform 900ms cubic-bezier(.2,.8,.2,1)'
      ].join(';'));
      const img = el('img', [
        'max-width:100%', 'max-height:100%', 'object-fit:contain',
        'filter:drop-shadow(0 10px 28px rgba(120,100,200,0.35))',
        'pointer-events:none', 'user-select:none'
      ].join(';'));
      img.alt = side;
      img.onerror = () => {
        img.style.opacity = '0';
        wrap.style.background = 'radial-gradient(ellipse at center bottom, #8a7dbf 0%, transparent 65%)';
      };
      wrap.appendChild(img);
      return { wrap, img };
    }

    const lyra = makeChar('Lyra');
    const lucien = makeChar('Lucien');
    charRow.appendChild(lyra.wrap);
    charRow.appendChild(lucien.wrap);
    root.appendChild(charRow);

    // Dialogue panel
    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(12,10,22,0.88)', 'backdrop-filter:blur(6px)',
      'color:#e8e0f2', 'font-size:17px', 'line-height:1.45',
      'box-shadow:0 6px 24px rgba(0,0,0,0.55)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 500ms ease, transform 500ms ease',
      'font-family:inherit'
    ].join(';'));
    dialogue.id = 'ms-dialogue';
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.7;margin-bottom:6px;', '');
    speaker.id = 'ms-dialogue-speaker';
    const line = el('div', 'min-height:44px;', '');
    line.id = 'ms-dialogue-line';
    const hint = el('div', 'margin-top:10px;font-size:12px;opacity:0.55;font-style:italic;', '');
    hint.id = 'ms-dialogue-hint';
    dialogue.appendChild(speaker);
    dialogue.appendChild(line);
    dialogue.appendChild(hint);
    root.appendChild(dialogue);

    const choiceRow = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'display:flex', 'flex-direction:column', 'gap:10px',
      'opacity:0', 'pointer-events:none',
      'transition:opacity 400ms ease'
    ].join(';'));
    choiceRow.id = 'ms-choices';
    root.appendChild(choiceRow);

    return { root, lyra, lucien, dialogue, line, hint, speaker, choiceRow, resonance };
  }

  function showChoice(choiceRow, dialogue, options) {
    return new Promise((resolve) => {
      dialogue.style.opacity = '0';
      setTimeout(() => {
        choiceRow.innerHTML = '';
        options.forEach((opt) => {
          const btn = el('button', [
            'padding:14px 18px', 'border-radius:20px',
            'border:1px solid rgba(200,170,240,0.35)',
            'background:linear-gradient(180deg,rgba(24,20,42,0.94),rgba(12,10,22,0.94))',
            'color:#e8e0f2', 'font-size:15px', 'font-weight:500', 'line-height:1.4',
            'box-shadow:0 4px 14px rgba(0,0,0,0.45)',
            'cursor:pointer', 'text-align:left', 'font-family:inherit',
            'backdrop-filter:blur(4px)'
          ].join(';'), opt.text);
          btn.addEventListener('click', () => {
            choiceRow.style.pointerEvents = 'none';
            choiceRow.style.opacity = '0';
            resolve(opt);
          });
          choiceRow.appendChild(btn);
        });
        choiceRow.style.pointerEvents = 'auto';
        choiceRow.style.opacity = '1';
      }, 260);
    });
  }

  // --- Scene orchestration -------------------------------------------------
  function say(n, name, text, cps) {
    n.speaker.textContent = name;
    return type(n.line, text, cps || 24);
  }

  async function play(onDone) {
    if (_rootEl) { try { onDone && onDone(); } catch (_) {} return; }
    const n = build();
    _rootEl = n.root;
    document.body.appendChild(n.root);

    // Preload images
    n.lyra.img.src   = LYRA_POSE;
    n.lucien.img.src = LUCIEN_POSE;

    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(420);

    // Lyra appears first (left). Lucien walks in (right).
    n.lyra.wrap.style.opacity = '1';
    n.lyra.wrap.style.transform = 'translateY(0) scale(1)';
    await wait(900);

    n.lucien.wrap.style.opacity = '1';
    n.lucien.wrap.style.transform = 'translateY(0) scale(1)';
    await wait(800);

    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      // ---- BEAT 1: narration. The staffs begin to hum. ---------------
      n.speaker.textContent = '\u2014 AT THE EDGE OF THE THORNWOOD, WHERE FOREST MEETS COAST \u2014';
      await type(n.line, 'Lyra is here. \u2014 Lucien is here. \u2014 Neither of them expected the other. \u2014 You brought them here. \u2014 You did not know what you were doing.', 22);
      await wait(2800);

      // The resonance glow pulses on
      n.resonance.style.animation = 'staffResonate 3.2s ease-in-out infinite';
      n.resonance.style.opacity = '1';
      await wait(600);

      await type(n.line, 'Her staff hums first. \u2014 His answers, a beat late. \u2014 Two notes that were carved from the same wood six hundred years ago. \u2014 They have just remembered each other.', 22);
      await wait(2800);

      // ---- BEAT 2: first eye contact. Neither speaks. ---------------
      n.speaker.textContent = '';
      await type(n.line, '*Lyra looks up. Lucien looks at her. Neither moves for a long time.*', 22);
      await wait(2600);

      // ---- BEAT 3: Lucien \u2014 the scholar names it first -----------
      await say(n, 'LUCIEN', 'The staffs are resonating. \u2014 That is a Dynasty artefact behaviour. \u2014 It only happens when the carving wood is matched. \u2014 Same tree. Same season. \u2014 Same bloodline.', 22);
      await wait(3000);

      // ---- BEAT 4: Lyra \u2014 soft, learning ------------------------
      n.lucien.img.src = LUCIEN_ALT;
      await say(n, 'LYRA', 'My mother told me the staff was hers. \u2014 She never said where it came from. \u2014 I always thought it grew with her. \u2014 *her voice goes up at the end* \u2014 You are saying it did not?', 22);
      await wait(3200);

      // ---- BEAT 5: Lucien \u2014 the reveal, precise and trembling --
      await say(n, 'LUCIEN', 'It did not. \u2014 It was cut from a tree in my father\u2019s garden. \u2014 The same tree my staff came from. \u2014 *quiet* \u2014 My father had a second child. He never spoke of her. His wife \u2014 my mother \u2014 hated the sound of her. \u2014 I thought she was dead. \u2014 I was told she was dead.', 22);
      await wait(3800);

      // ---- BEAT 6: Lyra \u2014 putting it together slowly ------------
      n.lyra.img.src = LYRA_ALT;
      await say(n, 'LYRA', 'I was kept in a tower. \u2014 My father\u2019s house. \u2014 His wife did not like the sound of me. \u2014 I escaped when I was fifteen. \u2014 I thought he never had another child. \u2014 I thought I was the only thing of his he could not bear.', 22);
      await wait(3600);

      // ---- BEAT 7: Lucien \u2014 the math becomes a brother ---------
      await say(n, 'LUCIEN', 'You are \u2026 \u2014 *sets the pen down in his head, so to speak* \u2014 You are my sister. \u2014 I am so sorry. \u2014 I did not know. \u2014 If I had known I \u2014 \u2014 I do not know what I would have done. \u2014 But I would have tried.', 20);
      await wait(3600);

      // ---- BEAT 8: Lyra \u2014 the quiet disbelief ------------------
      await say(n, 'LYRA', 'I have been alone in a cave for half my life. \u2014 I sang a song my mother taught me. \u2014 I did not know it was also my brother\u2019s bloodline that hummed to it. \u2014 I have a brother. \u2014 *touches her own face as if checking she is here* \u2014 I have a brother.', 22);
      await wait(3600);

      // ---- BEAT 9: Lucien crosses the distance (staff held out) ----
      await type(n.line, '*Lucien crosses the space between them slowly, ink-stained hand extended, staff in the other. He stops an arm\u2019s length from her. He is shaking. He does not hide it.*', 22);
      await wait(3000);

      await say(n, 'LUCIEN', 'May I? \u2014 I have not had a sister in thirty years. \u2014 I do not know what to do with the hand. \u2014 *his voice cracks, just once* \u2014 Tell me how.', 20);
      await wait(3400);

      await say(n, 'LYRA', '*takes his hand, rough palm to rough palm, staffs touching between them, the resonance flaring brighter* \u2014 Like this. \u2014 \u2026Like this.', 22);
      await wait(3400);

      // ---- BEAT 10: the choice \u2014 player nudges what comes next ---
      n.speaker.textContent = '';
      n.hint.textContent = 'what do you witness for them?';
      n.hint.style.opacity = '0.75';
      await type(n.line, 'The staffs have stopped humming. \u2014 They are quiet now. \u2014 Matched at last. \u2014 The choice in front of these two is not yours. \u2014 But they are looking at you. \u2014 For a witness. \u2014 Tell them what you see.', 22);
      await wait(1200);
      n.hint.style.opacity = '0';

      const pick = await showChoice(n.choiceRow, n.dialogue, [
        { id: 'reconcile', text: 'Tell him to go to his father. Tell him what was done. She deserves a name.' },
        { id: 'wait',      text: 'Say nothing yet. Let them have this hour. The father can wait.' }
      ]);

      lsSet(FLAG_CHOICE, pick.id);

      n.dialogue.style.opacity = '1';
      n.dialogue.style.transform = 'translateY(0)';

      if (pick.id === 'reconcile') {
        await say(n, 'LUCIEN', '*nods slowly* \u2014 Then I will go. \u2014 Tomorrow. \u2014 My father will finally sit in front of the daughter he said was dead. \u2014 I do not know what he will do. \u2014 I know what I will do. \u2014 I will stand next to her. \u2014 *looks at Lyra* \u2014 Come with me, if you want. \u2014 You do not have to.', 22);
        await wait(3800);
        await say(n, 'LYRA', '*small, fierce* \u2014 I am coming. \u2014 I want him to see my face. \u2014 I have been practicing what I will say my whole life. \u2014 I did not know who I was practicing for, until now.', 22);
        await wait(3400);
      } else {
        await say(n, 'LUCIEN', '*breathes, a long exhale* \u2014 Thank you. \u2014 Not yet. \u2014 I have just found her. \u2014 I do not want to hand her to him before she has finished being mine.', 22);
        await wait(3600);
        await say(n, 'LYRA', '*quiet, almost singing* \u2014 Tea. \u2014 Thursdays. \u2014 In the tower. \u2014 You said you have one. I have never been in one I chose to enter. \u2014 I am choosing yours.', 22);
        await wait(3400);
      }

      // ---- Closing ----------------------------------------------------
      n.speaker.textContent = '';
      await type(n.line, 'The resonance fades. \u2014 Two staffs, quiet again. \u2014 Two people who have been alone, deciding whether to have family now. \u2014 You are the one who brought them here. \u2014 Something in the kingdom just got larger.', 22);
      await wait(3200);

      // Fade out
      n.resonance.style.animation = '';
      n.resonance.style.transition = 'opacity 900ms ease';
      n.resonance.style.opacity = '0';
      n.root.style.opacity = '0';
      await wait(700);

      // Flags
      lsSet(FLAG_SEEN, '1');

    } catch (e) {
      console.warn('[crossover-lyra-lucien] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  // --- Trigger conditions ---------------------------------------------------
  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }
  function alreadySeen()  { return lsGet(FLAG_SEEN)  === '1'; }
  function metLyra()      { return lsGet(FLAG_MET_L) === '1' || lsGet(FLAG_ENC_L) === '1'; }
  function metLucien()    { return lsGet(FLAG_MET_C) === '1' || lsGet(FLAG_ENC_C) === '1'; }

  function isGameIdle() {
    const g = window._game;
    if (!g) return false;
    const who = g.selectedCharacter || g.characterId;
    if (who !== 'lyra' && who !== 'lucien') return false;
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
    if (!metLyra()) return false;
    if (!metLucien()) return false;
    if (getAff(AFF_KEYS_L) < MIN_AFF) return false;
    if (getAff(AFF_KEYS_C) < MIN_AFF) return false;
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
    }, 18000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // Debug
  window.MSCrossLyraLucien = {
    play,
    force() { lsSet(FLAG_SEEN, ''); _firing = false; tick(); },
    reset() { try { localStorage.removeItem(FLAG_SEEN); localStorage.removeItem(FLAG_CHOICE); } catch (_) {} },
    seenKey: FLAG_SEEN
  };
})();
