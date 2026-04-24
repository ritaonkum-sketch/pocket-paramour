/* crossover-lucien-aenor.js — "The Tower"
 * --------------------------------------------------------------------------
 * Registers window.MSCrossLucienAenor.
 *
 * Queen Aenor comes uninvited to Lucien's tower. She heard he has been
 * writing. She knows exactly what. The whole scene is a chess match
 * between the scholar and the sealer.
 *
 * Lucien lies, precisely. Aenor smiles, ancient and cold. She presses on
 * his sister. She presses on the Weaver. He deflects. She leaves
 * unsatisfied \u2014 but not defeated. She will be back.
 *
 * This is the first on-screen Aenor scene. Use her sparingly.
 *
 * Triggers: Chapter 13 done (she has arrived), Lucien bond >= 40, on
 * Lucien, game idle, not yet seen.
 */

(function () {
  'use strict';

  const FLAG_ROUTE    = 'pp_main_story_enabled';
  const FLAG_SEEN     = 'pp_cross_lucien_aenor_seen';
  const FLAG_CH13     = 'pp_chapter_done_13';
  const FLAG_LUC_MET  = 'pp_ms_encounter_lucien_seen';
  const AFF_KEYS_L    = ['pp_affection_lucien', 'lucien_affection'];
  const MIN_AFF       = 40;
  const POLL_MS       = 25000;

  const LUC_POSE   = 'assets/lucien/body/casual1.png';
  const LUC_ALT    = 'assets/lucien/body/casting.png';
  const BG_SRC     = 'assets/bg-lucien-night.png';

  let _rootEl = null;

  function el(tag, css, text) { const e = document.createElement(tag); if (css) e.style.cssText = css; if (text) e.textContent = text; return e; }
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function type(elRef, text, cps) {
    return new Promise((resolve) => {
      elRef.textContent = '';
      const speed = Math.max(14, Math.round(1000 / (cps || 22)));
      let i = 0;
      const step = () => { if (i < text.length) { elRef.textContent += text[i++]; setTimeout(step, speed); } else resolve(); };
      step();
    });
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  function getAff(keys) { for (const k of keys) { const v = lsGet(k); if (v != null) return parseInt(v, 10) || 0; } return 0; }

  function build() {
    const root = el('div', [
      'position:fixed', 'inset:0', 'z-index:10000',
      'background:#050410', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #0c0a1f 0%, #020108 80%)',
      'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => { bg.style.backgroundImage = `url(${BG_SRC})`; bg.style.opacity = '0.40'; };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    // Aenor presence \u2014 an unsettling pale glow at the top of the scene
    if (!document.getElementById('ms-keyframes-aenor')) {
      const kf = document.createElement('style');
      kf.id = 'ms-keyframes-aenor';
      kf.textContent = `
        @keyframes aenorPresence {
          0%,100% { opacity: 0.3; }
          50%     { opacity: 0.6; }
        }
      `;
      document.head.appendChild(kf);
    }
    const aenorAura = el('div', [
      'position:absolute', 'left:50%', 'top:28%', 'transform:translate(-50%,-50%)',
      'width:36vmin', 'height:36vmin', 'border-radius:50%', 'pointer-events:none',
      'background:radial-gradient(circle, rgba(210,210,230,0.35) 0%, transparent 70%)',
      'opacity:0', 'animation:aenorPresence 4s ease-in-out infinite'
    ].join(';'));
    root.appendChild(aenorAura);

    const charWrap = el('div', [
      'position:relative', 'margin-bottom:26vh',
      'width:62%', 'max-width:300px', 'aspect-ratio:3/5',
      'display:flex', 'align-items:flex-end', 'justify-content:center',
      'opacity:0', 'transform:translateY(20px) scale(0.97)',
      'transition:opacity 900ms ease, transform 900ms cubic-bezier(.2,.8,.2,1)'
    ].join(';'));
    const charImg = el('img', [
      'width:100%', 'height:100%', 'object-fit:contain',
      'filter:drop-shadow(0 10px 30px rgba(180,160,230,0.35))',
      'pointer-events:none', 'user-select:none'
    ].join(';'));
    charImg.onerror = () => { charImg.style.opacity = '0'; };
    charWrap.appendChild(charImg);
    root.appendChild(charWrap);

    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(8,6,18,0.92)', 'backdrop-filter:blur(6px)',
      'color:#e6e0f0', 'font-size:17px', 'line-height:1.5',
      'box-shadow:0 6px 24px rgba(0,0,0,0.65)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 600ms ease, transform 600ms ease',
      'font-family:inherit'
    ].join(';'));
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.75;margin-bottom:6px;', '');
    const line = el('div', 'min-height:44px;', '');
    dialogue.appendChild(speaker);
    dialogue.appendChild(line);
    root.appendChild(dialogue);

    return { root, charWrap, charImg, dialogue, line, speaker, aenorAura };
  }

  function say(n, name, text, cps) { n.speaker.textContent = name; return type(n.line, text, cps || 22); }

  async function play(onDone) {
    if (_rootEl) { try { onDone && onDone(); } catch (_) {} return; }
    const n = build();
    _rootEl = n.root;
    document.body.appendChild(n.root);

    n.charImg.src = LUC_POSE;

    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(500);
    n.charWrap.style.opacity = '1';
    n.charWrap.style.transform = 'translateY(0) scale(1)';
    await wait(600);
    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      n.speaker.textContent = '\u2014 LUCIEN\u2019S TOWER, AFTER MIDNIGHT \u2014';
      await type(n.line, 'A knock at the door. \u2014 Not a visitor he invited. \u2014 Not one he could refuse. \u2014 The wards on the lintel \u2026 bow.', 22);
      await wait(2600);

      n.aenorAura.style.opacity = '1';
      await wait(700);

      await type(n.line, '*Queen Aenor enters. Gracious. Ancient. Terrifying in a way that is entirely decorous. Lucien sets down his pen with the same deliberate care he uses when the Weaver walks in. This is not the same gesture.*', 22);
      await wait(3400);

      // BEAT 1: her opening
      await say(n, 'AENOR', '*warm as old silver* \u2014 My dear. \u2014 I hear you have been writing.', 22);
      await wait(2200);

      // BEAT 2: Lucien lies
      n.charImg.src = LUC_ALT;
      await say(n, 'LUCIEN', 'Only equations, Your Grace. \u2014 Nothing worth the journey up the stairs.', 22);
      await wait(2400);

      // BEAT 3: she smiles. she knows.
      await say(n, 'AENOR', '*the smile* \u2014 Equations. \u2014 The ink on your fingers is darker than equations usually require. \u2014 You have been writing prose. \u2014 About a woman, perhaps.', 22);
      await wait(3400);

      // BEAT 4: Lucien deflects precisely
      await say(n, 'LUCIEN', 'My marginalia, Your Grace. \u2014 A private habit. \u2014 Nothing of import.', 22);
      await wait(2400);

      // BEAT 5: the first strike \u2014 she brings up the sister
      await say(n, 'AENOR', '*examining a bookshelf, not looking at him* \u2014 Your father had a daughter once. \u2014 A difficult creature. \u2014 She was, of course, not part of the Dynasty register. \u2014 Which is a shame. A sister would soften you. \u2014 Such a solitary young man.', 22);
      await wait(3800);

      // BEAT 6: Lucien \u2014 interior shatters, exterior holds
      await say(n, 'LUCIEN', '*not a muscle moves* \u2014 I am not familiar with the reference, Your Grace. \u2014 The register is the register.', 22);
      await wait(2800);

      await say(n, 'AENOR', '*turns, still smiling, eyes like cold water* \u2014 Quite. \u2014 The register is the register. \u2014 Let us keep it that way.', 22);
      await wait(2800);

      // BEAT 7: the second strike \u2014 she brings up the Weaver
      await say(n, 'AENOR', 'There is a new \u2026 person at court. \u2014 A Weaver. \u2014 I am told the young men have been noticing her. \u2014 You especially. \u2014 I had hoped you might be more \u2026 academic about it.', 22);
      await wait(3600);

      // BEAT 8: Lucien draws his line
      await say(n, 'LUCIEN', 'I am a scholar, Your Grace. \u2014 I serve the truth. \u2014 The truth at this hour is that the kingdom is safer with the Weaver protected. \u2014 That is the direction of my research. \u2014 I will not be apologetic about it.', 22);
      await wait(3800);

      // BEAT 9: she weighs him
      await say(n, 'AENOR', '*a long quiet moment* \u2014 You are your father\u2019s son. \u2014 Also your grandmother\u2019s. \u2014 She was stubborn, too. \u2014 She died early. \u2014 *polite, devastating* \u2014 Do be careful, my dear.', 22);
      await wait(3800);

      // BEAT 10: she leaves
      await say(n, 'AENOR', '*turns toward the door, pauses, glances at the page still facedown on his desk* \u2014 I will be back. \u2014 I should like to read your \u2026 equations. \u2014 When they are finished.', 22);
      await wait(3200);

      // BEAT 11: the door. Silence.
      n.aenorAura.style.transition = 'opacity 1200ms ease';
      n.aenorAura.style.opacity = '0';
      await type(n.line, '*She leaves. The wards on the lintel stand up again. Lucien does not move for a long time. Then he locks the door. Then he writes you a note he will not send.*', 22);
      await wait(3200);

      // BEAT 12: the unsent note, read aloud
      n.charImg.src = LUC_POSE;
      await say(n, 'LUCIEN', '*quiet, to the page, to you across the kingdom* \u2014 She will come for you. \u2014 She knows what you are. She suspects what I am to you. \u2014 Do not come to my tower for a week. \u2014 Use the Warden\u2019s path. \u2014 Tell no one. \u2014 I am with you. \u2014 Always. \u2014 I will not send this.', 22);
      await wait(4000);

      await say(n, 'LUCIEN', '*folds the note, puts it in the drawer with the others* \u2014 One day, if I survive her, I will show you the drawer. \u2014 Until then. \u2014 Be careful, my heart. \u2014 My grandmother died early too.', 22);
      await wait(3800);

      n.root.style.opacity = '0';
      await wait(700);
      lsSet(FLAG_SEEN, '1');
    } catch (e) {
      console.warn('[crossover-lucien-aenor] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }
  function alreadySeen()  { return lsGet(FLAG_SEEN)  === '1'; }
  function aenorArrived() { return lsGet(FLAG_CH13) === '1'; }
  function metLucien()    { return lsGet(FLAG_LUC_MET) === '1' || lsGet('pp_met_lucien') === '1'; }

  function isGameIdle() {
    const g = window._game;
    if (!g) return false;
    const who = g.selectedCharacter || g.characterId;
    if (who !== 'lucien') return false;
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
    if (!routeEnabled() || alreadySeen()) return false;
    if (!aenorArrived() || !metLucien()) return false;
    if (getAff(AFF_KEYS_L) < MIN_AFF) return false;
    return isGameIdle();
  }

  let _firing = false;
  function tick() { if (_firing || !shouldFire()) return; _firing = true; play(() => { _firing = false; }); }
  function boot() { setTimeout(() => { tick(); setInterval(tick, POLL_MS); }, 26000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.MSCrossLucienAenor = {
    play, force() { lsSet(FLAG_SEEN, ''); _firing = false; tick(); },
    reset() { try { localStorage.removeItem(FLAG_SEEN); } catch (_) {} }, seenKey: FLAG_SEEN
  };
})();
