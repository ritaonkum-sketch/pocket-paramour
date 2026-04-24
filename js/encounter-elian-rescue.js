/* encounter-elian-rescue.js — "The Thornwood Attack"
 * --------------------------------------------------------------------------
 * Registers window.MSEncounterElianRescue.
 *
 * WHAT THIS SCENE DOES (and why it exists):
 *   Elian's route has been contemplative \u2014 walks, tea, silence. Beautiful,
 *   but missing the physical-danger / rescue-fantasy beat that Otome routes
 *   need. This scene delivers that, AND it is the dramatic moment where the
 *   player's identity as a WEAVER is named out loud for the first time.
 *
 *   Lore served:
 *   - The player is the seventh Weaver. They bond with many; their bonds
 *     fuel the kingdom's wards.
 *   - Aenor and her proxies hunt Weavers. Dark corruption has been creeping
 *     into the Thornwood. It targets Weaver-energy specifically.
 *   - Elian has seen a Weaver hunted before. His first love, Veyra, was one.
 *     He failed her. He will not fail the player.
 *
 * TRIGGER CONDITIONS (all must be true to auto-fire):
 *   - Main-story route is enabled (pp_main_story_enabled = '1')
 *   - Player has met Elian (pp_met_elian = '1' or pp_ms_encounter_elian_seen)
 *   - Elian is currently selected (game.selectedCharacter === 'elian')
 *   - Elian affection >= 25 (bond threshold)
 *   - This scene has NOT been seen yet (pp_elian_rescue_seen != '1')
 *   - Game is idle (no other overlay, scene, or panel is open)
 *
 * FLAGS WRITTEN:
 *   - pp_elian_rescue_seen = '1'            (never replays)
 *   - pp_elian_rescue_choice = 'stay'|'leave' (branches future dialogue)
 *   - pp_weaver_revealed = '1'              (gates future Weaver-aware lines)
 *
 * VOICE DIRECTION (this scene, specifically):
 *   Elian is in action mode here \u2014 which is rare. His usual Heughan/Fraser
 *   low-warm cadence gets sharper. Shorter sentences. The kindness stays,
 *   but under pressure. When he names the Weaver word out loud, let the
 *   line BREATHE. That is the moment that changes the whole game.
 *
 * SAFETY CONTRACT:
 *   Additive. Self-contained overlay. Poll loop backs off during any other
 *   scene. No mutation of other modules. Never runs if the flag is set.
 */

(function () {
  'use strict';

  // --- Config ---------------------------------------------------------------
  const FLAG_ROUTE       = 'pp_main_story_enabled';
  const FLAG_SEEN        = 'pp_elian_rescue_seen';
  const FLAG_CHOICE      = 'pp_elian_rescue_choice';
  const FLAG_WEAVER      = 'pp_weaver_revealed';
  const FLAG_ENC_SEEN    = 'pp_ms_encounter_elian_seen';
  const FLAG_MET         = 'pp_met_elian';
  const AFFECTION_KEYS   = ['pp_affection_elian', 'elian_affection'];
  const MIN_AFFECTION    = 25;
  const POLL_MS          = 20000; // 20s

  // --- Assets ---------------------------------------------------------------
  const BODY_CALM       = 'assets/elian/body/calm.png';
  const BODY_GUARDED    = 'assets/elian/body/guarded.png';
  const BODY_FORAGING   = 'assets/elian/body/foraging.png';
  const BG_SRC          = 'assets/bg-elian-forest.png';

  let _rootEl = null;

  // --- Tiny helpers ---------------------------------------------------------
  function el(tag, css, text) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text) e.textContent = text;
    return e;
  }
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function type(elRef, text, cps) {
    return new Promise((resolve) => {
      elRef.innerHTML = '';
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

  function getAffection() {
    for (const k of AFFECTION_KEYS) {
      const v = lsGet(k);
      if (v != null) return parseInt(v, 10) || 0;
    }
    return 0;
  }

  // --- DOM build ------------------------------------------------------------
  function build() {
    const root = el('div', [
      'position:fixed', 'inset:0', 'z-index:10000',
      'background:#060a08', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    // Background — forest, with a wrongness layer that pulses red-black during attack
    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #1a2a1f 0%, #05080a 80%)',
      'background-size:cover', 'background-position:center',
      'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => { bg.style.backgroundImage = `url(${BG_SRC})`; bg.style.opacity = '0.45'; };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    // The corruption-pulse overlay (red-black) — toggled during attack beats
    if (!document.getElementById('ms-keyframes-elian-rescue')) {
      const kf = document.createElement('style');
      kf.id = 'ms-keyframes-elian-rescue';
      kf.textContent = `
        @keyframes elianCorruption {
          0%,100% { opacity: 0; }
          50%     { opacity: 0.45; }
        }
        @keyframes elianFlare {
          0%   { opacity: 0; filter: blur(10px); transform: scale(0.6); }
          40%  { opacity: 0.9; filter: blur(0); transform: scale(1.15); }
          100% { opacity: 0; filter: blur(6px); transform: scale(1.25); }
        }
      `;
      document.head.appendChild(kf);
    }
    const corruption = el('div', [
      'position:absolute', 'inset:0', 'pointer-events:none',
      'background:radial-gradient(ellipse at 50% 40%, rgba(120,10,20,0.45) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)',
      'mix-blend-mode:multiply',
      'opacity:0'
    ].join(';'));
    corruption.id = 'elian-corruption';
    root.appendChild(corruption);

    // Weaver flare (gold, radiates from center when player's magic flares)
    const flare = el('div', [
      'position:absolute', 'left:50%', 'top:38%', 'transform:translate(-50%,-50%)',
      'width:80vmin', 'height:80vmin', 'border-radius:50%', 'pointer-events:none',
      'background:radial-gradient(circle, rgba(255,230,170,0.55) 0%, rgba(255,210,140,0.25) 35%, transparent 70%)',
      'opacity:0'
    ].join(';'));
    flare.id = 'elian-weaver-flare';
    root.appendChild(flare);

    // Character image (Elian, arrives mid-scene)
    const charWrap = el('div', [
      'position:relative', 'margin-bottom:26vh',
      'width:62%', 'max-width:300px', 'aspect-ratio:3/5',
      'display:flex', 'align-items:flex-end', 'justify-content:center',
      'opacity:0', 'transform:translateY(20px) scale(0.97)',
      'transition:opacity 800ms ease, transform 800ms cubic-bezier(.2,.8,.2,1)',
      '-webkit-tap-highlight-color:transparent'
    ].join(';'));
    charWrap.id = 'ms-char-wrap';
    const charImg = el('img', [
      'width:100%', 'height:100%', 'object-fit:contain',
      'filter:drop-shadow(0 10px 30px rgba(140,200,140,0.35))',
      'pointer-events:none', 'user-select:none'
    ].join(';'));
    charImg.alt = 'Elian';
    charImg.id = 'ms-char-img';
    const fallback = () => {
      charImg.style.opacity = '0';
      charWrap.style.background = 'radial-gradient(ellipse at center bottom, #8dbf82 0%, transparent 65%)';
      charWrap.style.minHeight = '55vh';
    };
    charImg.onerror = fallback;
    charImg.onload = () => {
      if (charImg.naturalWidth < 50 || charImg.naturalHeight < 50) fallback();
    };
    charWrap.appendChild(charImg);
    root.appendChild(charWrap);

    // Narration / dialogue panel
    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(8,16,12,0.88)', 'backdrop-filter:blur(6px)',
      'color:#e0ecd8', 'font-size:17px', 'line-height:1.45',
      'box-shadow:0 6px 24px rgba(0,0,0,0.6)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 500ms ease, transform 500ms ease',
      'font-family:inherit'
    ].join(';'));
    dialogue.id = 'ms-dialogue';
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.65;margin-bottom:6px;', '');
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

    return { root, charWrap, charImg, dialogue, line, hint, speaker, choiceRow, corruption, flare };
  }

  function showChoice(choiceRow, dialogue, options) {
    return new Promise((resolve) => {
      dialogue.style.opacity = '0';
      setTimeout(() => {
        choiceRow.innerHTML = '';
        options.forEach((opt) => {
          const btn = el('button', [
            'padding:14px 18px', 'border-radius:20px',
            'border:1px solid rgba(160,210,160,0.35)',
            'background:linear-gradient(180deg,rgba(20,36,26,0.94),rgba(10,18,14,0.94))',
            'color:#e6f0dd', 'font-size:15px', 'font-weight:500', 'line-height:1.4',
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

  // --- The scene ------------------------------------------------------------
  async function play(onDone) {
    if (_rootEl) { try { onDone && onDone(); } catch (_) {} return; }
    const n = build();
    _rootEl = n.root;
    document.body.appendChild(n.root);

    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(420);
    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      // -----------------------------------------------------------------
      // BEAT 1 — the wrong-forest
      // Player alone. The trees behave wrong. Narration, no speaker.
      // -----------------------------------------------------------------
      n.speaker.textContent = '\u2014 THORNWOOD, DEEP NORTH \u2014';
      await type(n.line, 'The path you were on is gone. \u2014 The trees have moved. \u2014 A stag stood still too long. \u2014 The undergrowth is too quiet. \u2014 Something is watching.', 24);
      await wait(2200);

      // -----------------------------------------------------------------
      // BEAT 2 — the corruption arrives
      // Red-black pulse washes over the scene. Something emerges.
      // -----------------------------------------------------------------
      n.corruption.style.animation = 'elianCorruption 2.4s ease-in-out infinite';
      n.corruption.style.opacity = '1';
      await wait(600);
      await type(n.line, 'It comes out of the undergrowth. \u2014 A wolf. \u2014 Or it was, once. \u2014 Its eyes are wrong. Its fur is blackened. \u2014 It does not growl. \u2014 It looks at you with something almost like grief.', 24);
      await wait(2600);

      // -----------------------------------------------------------------
      // BEAT 3 — the Weaver-flare (involuntary)
      // Gold light pulses from the player. The creature recognizes it and lunges.
      // -----------------------------------------------------------------
      n.flare.style.animation = 'elianFlare 1.6s ease-out';
      n.flare.style.opacity = '1';
      setTimeout(() => { n.flare.style.opacity = '0'; n.flare.style.animation = ''; }, 1400);
      await type(n.line, 'Something gold threads out from you. \u2014 Involuntary. \u2014 A flare you did not ask for. \u2014 The creature sees it. \u2014 It lunges.', 22);
      await wait(2000);

      // -----------------------------------------------------------------
      // BEAT 4 — Elian arrives
      // -----------------------------------------------------------------
      n.speaker.textContent = 'ELIAN';
      n.charImg.src = BODY_GUARDED;
      n.charWrap.style.opacity = '1';
      n.charWrap.style.transform = 'translateY(0) scale(1)';
      n.charWrap.style.animation = 'none';
      await wait(300);
      await type(n.line, '\u2014 Get DOWN.', 30);
      await wait(900);

      // Creature dispatched — a blade-stroke, then silence
      n.corruption.style.animation = 'none';
      n.corruption.style.transition = 'opacity 900ms ease';
      n.corruption.style.opacity = '0';
      await wait(700);

      // -----------------------------------------------------------------
      // BEAT 5 — the blessing (he is KIND to forest animals, even this one)
      // -----------------------------------------------------------------
      n.charImg.src = BODY_FORAGING;
      await wait(300);
      await type(n.line, '*kneels beside the fallen creature, says a few words in an older language, smooths its fur with a rough warm hand* \u2014 You were a deer once. \u2014 Before something ate you from the inside. \u2014 Rest now. \u2014 The trees remember you as you were.', 22);
      await wait(3200);

      // -----------------------------------------------------------------
      // BEAT 6 — he turns to the player, checks for wounds, recognizes what she is
      // -----------------------------------------------------------------
      n.charImg.src = BODY_CALM;
      await wait(300);
      await type(n.line, '*rises, crosses to you, rough hands cupping your face, turning it side to side, checking for wounds \u2014 then stills* \u2014 \u2026You are unhurt. \u2014 Good. \u2014 Hold still a moment. \u2014 I need to look at you. Properly. \u2014 I should have looked sooner.', 22);
      await wait(2800);

      // The big beat — he NAMES it.
      await type(n.line, 'You are a Weaver. \u2014 I knew when the ground changed under your foot at the treeline. \u2014 I did not want to be right.', 20);
      await wait(2400);

      await type(n.line, 'I have only known one other. \u2014 Her name was Veyra. \u2014 The same thing came for her. \u2014 I was young. \u2014 I was too new to the Warden\u2019s post. \u2014 I did not save her. \u2014 I have been walking her forest alone ever since.', 20);
      await wait(3400);

      await type(n.line, 'I will not fail again. \u2014 *presses his forehead to yours, one hand at the back of your head, rough and warm and steady* \u2014 You hear me. \u2014 Not this time.', 22);
      await wait(3000);

      // -----------------------------------------------------------------
      // BEAT 7 — the choice
      // -----------------------------------------------------------------
      n.hint.textContent = 'choose on purpose';
      n.hint.style.opacity = '0.75';
      await type(n.line, 'The forest is no longer safe for you. \u2014 Not while it smells you. \u2014 You have two options, mi\u2019lady Weaver. \u2014 Choose carefully.', 22);
      await wait(1200);
      n.hint.style.opacity = '0';

      const pick = await showChoice(n.choiceRow, n.dialogue, [
        { id: 'stay',  text: 'Stay with you. Let the Thornwood be my home.' },
        { id: 'leave', text: 'Walk me to the border. I should not pull you into this.' }
      ]);

      lsSet(FLAG_CHOICE, pick.id);

      n.dialogue.style.opacity = '1';
      n.dialogue.style.transform = 'translateY(0)';

      if (pick.id === 'stay') {
        await type(n.line, '*something settles in his face. A weight finally set down.* \u2014 Then stay. \u2014 Under my roof. Under my watch. \u2014 You do not leave the Thornwood without me. \u2014 That is my only rule.', 24);
        await wait(3000);
        await type(n.line, '*unbuckles his cloak, drapes it around your shoulders, keeps his hand at the nape of your neck after* \u2014 You smell like gold and rain. \u2014 That is how I will know it is you, every time you walk the path home.', 22);
        await wait(3200);
      } else {
        await type(n.line, '*closes his eyes briefly, opens them* \u2014 Then I walk you to the border. \u2014 Tonight. \u2014 I do not want to. \u2014 I will.', 24);
        await wait(2800);
        await type(n.line, '*cloak draped around your shoulders without looking up* \u2014 Take this. \u2014 Keep it. \u2014 When you need me, wear it. I will know. \u2014 The forest will tell me which direction.', 22);
        await wait(3200);
      }

      // -----------------------------------------------------------------
      // Final vow \u2014 regardless of choice
      // -----------------------------------------------------------------
      await type(n.line, 'It will come for you again. \u2014 I know its smell now. \u2014 I will be between it and you every time. \u2014 This is my post. \u2014 Do not argue.', 22);
      await wait(3200);

      // Fade out
      n.root.style.opacity = '0';
      await wait(600);

      // Write the flags
      lsSet(FLAG_SEEN, '1');
      lsSet(FLAG_WEAVER, '1');

    } catch (e) {
      console.warn('[encounter-elian-rescue] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  // --- Trigger conditions ---------------------------------------------------
  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }
  function alreadySeen()  { return lsGet(FLAG_SEEN)  === '1'; }
  function metElian()     { return lsGet(FLAG_MET) === '1' || lsGet(FLAG_ENC_SEEN) === '1'; }

  function isGameIdle() {
    const g = window._game;
    if (!g) return false;
    if (g.selectedCharacter !== 'elian' && g.characterId !== 'elian') return false;
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
    if (!metElian()) return false;
    if (getAffection() < MIN_AFFECTION) return false;
    if (!isGameIdle()) return false;
    return true;
  }

  // --- Boot + poll ----------------------------------------------------------
  let _firing = false;
  function tick() {
    if (_firing) return;
    if (!shouldFire()) return;
    _firing = true;
    play(() => { _firing = false; });
  }

  function boot() {
    // Start polling 15s after load to avoid interrupting other intros.
    setTimeout(() => {
      tick();
      setInterval(tick, POLL_MS);
    }, 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // Debug handle
  window.MSEncounterElianRescue = {
    play,
    force() { lsSet(FLAG_SEEN, ''); _firing = false; tick(); },
    reset() { try { localStorage.removeItem(FLAG_SEEN); localStorage.removeItem(FLAG_CHOICE); } catch (_) {} },
    seenKey: FLAG_SEEN
  };
})();
