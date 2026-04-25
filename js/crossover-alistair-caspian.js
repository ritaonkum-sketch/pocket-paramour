/* crossover-alistair-caspian.js \u2014 "The Captain and the Crown"
 * --------------------------------------------------------------------------
 * Registers window.MSCrossAlistairCaspian.
 *
 * Alistair has been Captain of the Guard since Caspian was sixteen. They
 * have never spoken about anything except security. Tonight Caspian asks
 * his captain a personal question. Alistair, common-born and trained
 * never to discuss royalty as people, struggles to answer.
 *
 * The scene's gravity: Alistair has spent his whole life serving Caspian's
 * crown. Now they're both serving the same person \u2014 the Weaver \u2014 and
 * Alistair has to decide whether his vow is to the throne or to her.
 *
 * Triggers: Alistair bond >= 35, Caspian met (encounter seen), on Alistair
 * or Caspian, game idle, not yet seen.
 */

(function () {
  'use strict';

  const FLAG_ROUTE   = 'pp_main_story_enabled';
  const FLAG_SEEN    = 'pp_cross_alistair_caspian_seen';
  const FLAG_AL_MET  = 'pp_ms_encounter_alistair_seen';
  const FLAG_CASP_MET= 'pp_ms_encounter_caspian_seen';
  const AFF_KEYS_A   = ['pp_affection_alistair', 'alistair_affection'];
  const MIN_AFF      = 35;
  const POLL_MS      = 25000;

  const AL_POSE   = 'assets/alistair/body/casual.png';
  const AL_ALT    = 'assets/alistair/body/softshy-love1.png';
  const CASP_POSE = 'assets/caspian/body/casual1.png';
  const CASP_ALT  = 'assets/caspian/body/casual2.png';
  const BG_SRC    = 'assets/bg-caspian-night.png';

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
      'background:#0a0815', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #1a1228 0%, #050310 80%)',
      'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => { bg.style.backgroundImage = `url(${BG_SRC})`; bg.style.opacity = '0.42'; };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    const charRow = el('div', [
      'position:relative', 'margin-bottom:24vh',
      'width:92%', 'max-width:720px', 'height:48vh',
      'display:flex', 'align-items:flex-end', 'justify-content:space-between', 'gap:6%'
    ].join(';'));

    function makeChar(shadow) {
      const wrap = el('div', [
        'position:relative', 'flex:1', 'height:100%',
        'display:flex', 'align-items:flex-end', 'justify-content:center',
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

    const al   = makeChar('rgba(255,210,140,0.35)');
    const casp = makeChar('rgba(230,160,210,0.35)');
    charRow.appendChild(al.wrap);
    charRow.appendChild(casp.wrap);
    root.appendChild(charRow);

    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(12,8,22,0.90)', 'backdrop-filter:blur(6px)',
      'color:#f0e4f2', 'font-size:17px', 'line-height:1.5',
      'box-shadow:0 6px 24px rgba(0,0,0,0.6)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 600ms ease, transform 600ms ease',
      'font-family:inherit'
    ].join(';'));
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.7;margin-bottom:6px;', '');
    const line = el('div', 'min-height:44px;', '');
    dialogue.appendChild(speaker); dialogue.appendChild(line);
    root.appendChild(dialogue);

    return { root, al, casp, dialogue, line, speaker };
  }

  function say(n, name, text, cps) { n.speaker.textContent = name; return type(n.line, text, cps || 22); }

  async function play(onDone) {
    if (_rootEl) { try { onDone && onDone(); } catch (_) {} return; }
    const n = build();
    _rootEl = n.root;
    document.body.appendChild(n.root);

    n.al.img.src   = AL_POSE;
    n.casp.img.src = CASP_POSE;

    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(500);
    n.casp.wrap.style.opacity = '1';
    n.casp.wrap.style.transform = 'translateY(0) scale(1)';
    await wait(800);
    n.al.wrap.style.opacity = '1';
    n.al.wrap.style.transform = 'translateY(0) scale(1)';
    await wait(700);

    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      // Setting + intro
      n.speaker.textContent = '\u2014 PALACE LIBRARY, MIDNIGHT, ONE LAMP \u2014';
      await type(n.line, 'Caspian asked his Captain to stay after the watch. \u2014 Alistair has not stayed late in this room since he was nineteen. \u2014 They have not spoken privately in eight years.', 22);
      await wait(2800);

      // Caspian opens \u2014 charm dropped, asking a real question
      await say(n, 'CASPIAN', '*sets down the carafe, no flourish* \u2014 I am going to ask you a question. \u2014 As Caspian. \u2014 Not as the Crown. \u2014 If that is permitted between us.', 22);
      await wait(3000);

      // Alistair tightens
      n.al.img.src = AL_ALT;
      await say(n, 'ALISTAIR', '*stiffens slightly* \u2014 Your Highness, the code does not have a section for that. \u2014 I will answer the question you put to me. \u2014 Use whichever name suits you.', 22);
      await wait(3000);

      // Caspian \u2014 dropping the title
      n.casp.img.src = CASP_ALT;
      await say(n, 'CASPIAN', '*small smile, tired* \u2014 Caspian. \u2014 Just for tonight. \u2014 \u2026Do you love her too.', 22);
      await wait(2400);

      // Beat \u2014 the silence
      await type(n.line, '*Alistair does not move. The lamp does not flicker. The library is suddenly very small.*', 22);
      await wait(2800);

      // Alistair, careful
      await say(n, 'ALISTAIR', '*low* \u2014 The code says a knight does not love what he is sworn to guard. \u2014 \u2026The code is older than this kingdom. \u2014 I have broken it. \u2014 Yes. I love her.', 22);
      await wait(3400);

      // Caspian, relieved \u2014 not betrayed
      await say(n, 'CASPIAN', '*lets out a breath he has been holding for months* \u2014 \u2026Good. \u2014 I would not want her loved by less than two of us. \u2014 I would not want this kingdom guarded by less than two of us, either.', 22);
      await wait(3400);

      // Alistair \u2014 confused, alert
      await say(n, 'ALISTAIR', 'Your Highness \u2014 Caspian. \u2014 The code does not have a section for THIS either. \u2014 Two men sworn to one woman is not a posting Aethermoor has ever issued.', 22);
      await wait(3200);

      // Caspian \u2014 the political move
      await say(n, 'CASPIAN', 'Then you and I write a new section. \u2014 You take the gate. I take the court. \u2014 You stand watch where she sleeps. I stand watch over her name. \u2014 Neither of us reaches for what the other has. \u2014 Both of us protect.', 22);
      await wait(3800);

      // Alistair \u2014 the careful question
      await say(n, 'ALISTAIR', '\u2026And if your grandmother orders me to deliver her to the dais? \u2014 Or arrests her? \u2014 Or has me reposted to the front line so the post is empty?', 22);
      await wait(3200);

      // Caspian \u2014 plain, no charm
      n.casp.img.src = CASP_POSE;
      await say(n, 'CASPIAN', 'Then I write the order that overrides hers. \u2014 In writing. \u2014 With my seal. \u2014 If it costs me the throne, it costs me the throne. \u2014 You are not standing at the gate alone in this. \u2014 That is the offer.', 22);
      await wait(3800);

      // Alistair \u2014 the oath
      n.al.img.src = AL_POSE;
      await say(n, 'ALISTAIR', '*quiet* \u2014 \u2026Your Highness. \u2014 I am your Captain still. \u2014 I will also stand at her gate. \u2014 If those two duties contradict, I will send for you before I act. \u2014 That is what I can promise.', 22);
      await wait(3400);

      // Caspian, accepting
      await say(n, 'CASPIAN', '*pours two glasses* \u2014 That is more than I expected. \u2014 Drink. \u2014 You have not had wine in this library since the year my mother died. \u2014 I remembered the vintage you liked.', 22);
      await wait(3400);

      // Alistair \u2014 the smallest crack of warmth
      await say(n, 'ALISTAIR', '*blinks once, looks at the cup* \u2014 \u2026Your Highness remembers the vintage I liked.', 22);
      await wait(2400);

      await say(n, 'CASPIAN', '*small* \u2014 Yes. \u2014 I have always remembered. \u2014 Do not tell anyone.', 22);
      await wait(2400);

      // Closer \u2014 the Weaver acknowledged
      await say(n, 'ALISTAIR', '*lifts the cup* \u2014 To her. \u2014 Mi\u2019lady Weaver. \u2014 Two posts. One realm.', 22);
      await wait(2800);

      await say(n, 'CASPIAN', '*lifts his* \u2014 Two posts. One realm. \u2014 \u2026May we both be too inconvenient to remove.', 22);
      await wait(2800);

      // Closing
      n.speaker.textContent = '';
      await type(n.line, 'They drink in silence. \u2014 The lamp holds steady. \u2014 The kingdom has just gained a private treaty between its captain and its crown. \u2014 The Dowager will sense it before the night is done. \u2014 Neither of these men is afraid of that.', 22);
      await wait(3600);

      n.root.style.opacity = '0';
      await wait(700);
      lsSet(FLAG_SEEN, '1');

    } catch (e) {
      console.warn('[crossover-alistair-caspian] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }
  function alreadySeen()  { return lsGet(FLAG_SEEN) === '1'; }
  function metAl()        { return lsGet(FLAG_AL_MET) === '1' || lsGet('pp_met_alistair') === '1'; }
  function metCasp()      { return lsGet(FLAG_CASP_MET) === '1' || lsGet('pp_met_caspian') === '1'; }

  function isGameIdle() {
    const g = window._game;
    if (!g) return false;
    const who = g.selectedCharacter || g.characterId;
    if (who !== 'alistair' && who !== 'caspian') return false;
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
    if (!metAl() || !metCasp()) return false;
    if (getAff(AFF_KEYS_A) < MIN_AFF) return false;
    return isGameIdle();
  }

  let _firing = false;
  function tick() { if (_firing || !shouldFire()) return; _firing = true; play(() => { _firing = false; }); }
  function boot() { setTimeout(() => { tick(); setInterval(tick, POLL_MS); }, 24000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.MSCrossAlistairCaspian = {
    play,
    force() { lsSet(FLAG_SEEN, ''); _firing = false; tick(); },
    reset() { try { localStorage.removeItem(FLAG_SEEN); } catch (_) {} },
    seenKey: FLAG_SEEN
  };
})();
