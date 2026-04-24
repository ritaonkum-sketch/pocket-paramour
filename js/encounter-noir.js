/* encounter-noir.js — obsession / sealed-beneath meet-cute.
 * Registers window.MSEncounterNoir.
 *
 * VOICE DIRECTION (for future VO / writing consistency):
 * Think Henry Cavill as Geralt of Rivia. Low register. Slow cadence.
 * Few words. Archaic/formal tone. "Hmm" as punctuation. Gothic melodrama
 * earned by 800 years under the seal. Every line should be readable
 * two ways: devoted, or playing. Never resolve that ambiguity on the
 * page — let the player carry it. Use dashes for held pauses. Never
 * exclamation points. Never labels his own feelings out loud. */
(function () {
  'use strict';

  const BODY_SRC  = 'assets/noir/body/neutral.png';
  const BODY_LEAN = 'assets/noir/body/casual1.png';
  const BG_SRC    = 'assets/bg-noir-void.png';

  let _rootEl = null;

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
      const speed = Math.max(14, Math.round(1000 / (cps || 28)));
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

  function build() {
    const root = el('div', [
      'position:fixed', 'inset:0', 'z-index:10000',
      'background:#030208', 'overflow:hidden',
      'opacity:0', 'transition:opacity 600ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #2a0e3a 0%, #03010a 80%)',
      'background-size:cover', 'background-position:center',
      'opacity:0', 'transition:opacity 1100ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => { bg.style.backgroundImage = `url(${BG_SRC})`; bg.style.opacity = '0.55'; };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    // Pulsing seal — suggests something caged that wants out
    if (!document.getElementById('ms-keyframes-noir')) {
      const kf = document.createElement('style');
      kf.id = 'ms-keyframes-noir';
      kf.textContent = `@keyframes msNoirPulse {
        0%,100% { box-shadow: inset 0 0 60px 20px rgba(196,106,255,0.22), 0 0 80px 10px rgba(196,106,255,0.15); opacity: 0.65; }
        50%     { box-shadow: inset 0 0 100px 30px rgba(196,106,255,0.35), 0 0 120px 20px rgba(196,106,255,0.28); opacity: 1; }
      }`;
      document.head.appendChild(kf);
    }
    const seal = el('div', [
      'position:absolute', 'left:50%', 'top:40%', 'transform:translate(-50%,-50%)',
      'width:70vmin', 'height:70vmin', 'border-radius:50%',
      'pointer-events:none', 'animation:msNoirPulse 3.6s ease-in-out infinite'
    ].join(';'));
    root.appendChild(seal);

    const charWrap = el('div', [
      'position:relative', 'margin-bottom:26vh',
      'width:62%', 'max-width:300px', 'aspect-ratio:3/5',
      'display:flex', 'align-items:flex-end', 'justify-content:center',
      'cursor:pointer', 'opacity:0', 'transform:translateY(20px) scale(0.97)',
      'transition:opacity 1100ms ease, transform 1300ms cubic-bezier(.2,.8,.2,1)',
      '-webkit-tap-highlight-color:transparent'
    ].join(';'));
    charWrap.id = 'ms-char-wrap';
    const charImg = el('img', [
      'width:100%', 'height:100%', 'object-fit:contain',
      'filter:drop-shadow(0 10px 34px rgba(196,106,255,0.35))',
      'pointer-events:none', 'user-select:none'
    ].join(';'));
    charImg.src = BODY_SRC;
    charImg.alt = 'Noir';
    charImg.id = 'ms-char-img';
    const fallback = () => {
      charImg.style.opacity = '0';
      charWrap.style.background = 'radial-gradient(ellipse at center bottom, #c46aff 0%, transparent 65%)';
      charWrap.style.minHeight = '55vh';
    };
    charImg.onerror = fallback;
    charImg.onload = () => {
      if (charImg.naturalWidth < 50 || charImg.naturalHeight < 50) fallback();
    };
    charWrap.appendChild(charImg);
    root.appendChild(charWrap);

    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(10,4,20,0.88)', 'backdrop-filter:blur(6px)',
      'color:#efe0ff', 'font-size:17px', 'line-height:1.45',
      'box-shadow:0 6px 24px rgba(0,0,0,0.6)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 600ms ease, transform 600ms ease'
    ].join(';'));
    dialogue.id = 'ms-dialogue';
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.65;margin-bottom:6px;', 'A VOICE · BENEATH');
    speaker.id = 'ms-dialogue-speaker';
    const line = el('div', 'min-height:44px;', '');
    line.id = 'ms-dialogue-line';
    const hint = el('div', 'margin-top:10px;font-size:12px;opacity:0.55;font-style:italic;', '');
    hint.id = 'ms-dialogue-hint';
    dialogue.appendChild(speaker);
    dialogue.appendChild(line);
    dialogue.appendChild(hint);
    root.appendChild(dialogue);

    const tapHint = el('div', [
      'position:absolute', 'left:50%', 'top:22%', 'transform:translateX(-50%)',
      'padding:6px 14px', 'border-radius:20px',
      'background:rgba(196,106,255,0.14)', 'color:#efe0ff',
      'font-size:12px', 'letter-spacing:1px', 'opacity:0',
      'transition:opacity 400ms ease', 'pointer-events:none', 'display:none'
    ].join(';'), 'press through');
    tapHint.id = 'ms-tap-hint';
    root.appendChild(tapHint);

    const choiceRow = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'display:flex', 'flex-direction:column', 'gap:10px',
      'opacity:0', 'pointer-events:none',
      'transition:opacity 400ms ease'
    ].join(';'));
    choiceRow.id = 'ms-choices';
    root.appendChild(choiceRow);

    return { root, charWrap, charImg, dialogue, line, hint, tapHint, speaker, choiceRow };
  }

  function showChoice(choiceRow, dialogue, options) {
    return new Promise((resolve) => {
      dialogue.style.opacity = '0';
      setTimeout(() => {
        choiceRow.innerHTML = '';
        options.forEach((opt) => {
          const btn = el('button', [
            'padding:14px 18px', 'border-radius:20px',
            'border:1px solid rgba(184,122,224,0.4)',
            'background:linear-gradient(180deg,rgba(30,12,42,0.94),rgba(16,6,24,0.94))',
            'color:#efe0ff', 'font-size:15px', 'font-weight:500', 'line-height:1.4',
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
      }, 300);
    });
  }

  async function play(onDone) {
    if (_rootEl) { try { onDone && onDone(); } catch (_) {} return; }
    const n = build();
    _rootEl = n.root;
    document.body.appendChild(n.root);

    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(400);
    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      // Beat 1 — voice only, from beneath the seal
      await type(n.line, 'You are not the first. \u2014 Hmm. \u2014 You might be the last.', 24);
      await wait(1800);

      // Beat 2 — tap to press through
      n.tapHint.style.opacity = '0.85';
      n.hint.textContent = '(press through the seal)';
      n.hint.style.opacity = '0.75';
      n.charWrap.style.opacity = '1';
      n.charWrap.style.transform = 'translateY(0) scale(1)';
      await waitForTap(n.charWrap);
      n.tapHint.style.opacity = '0';
      n.hint.textContent = '';
      n.hint.style.opacity = '0';

      await wait(260);
      n.charImg.src = BODY_LEAN;
      n.charImg.animate(
        [{ transform: 'scale(0.97)', filter: 'blur(4px)' }, { transform: 'scale(1)', filter: 'blur(0)' }],
        { duration: 680, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
      n.speaker.textContent = 'NOIR';
      await wait(400);

      // Beat 3 — he savors the reveal
      await type(n.line, 'There. \u2014 Let me look at you. Properly. \u2014 I have been hungry for that a long time.', 26);
      await wait(1800);

      // Beat 4 — unlock one answer
      n.hint.textContent = 'one answer unlocked \u2014 tap to speak';
      n.hint.style.opacity = '0.75';
      await waitForTap(n.dialogue);
      n.hint.style.opacity = '0';
      n.hint.textContent = '';

      // Beat 5 — choice
      await type(n.line, 'Why did you come? \u2014 Truthfully. I will know if you lie.', 28);
      await wait(300);
      const pick = await showChoice(n.choiceRow, n.dialogue, [
        { id: 'see',    text: 'I wanted to see you. Whatever you are.' },
        { id: 'sealed', text: '\u2026Who sealed you down here?' }
      ]);
      try { localStorage.setItem('pp_ms_noir_first_choice', pick.id); } catch (_) {}

      n.dialogue.style.opacity = '1';
      if (pick.id === 'see') {
        await type(n.line, 'Careful. \u2014 Looking at me is how it starts. They all said \u201cjust looking.\u201d They all stayed.', 26);
      } else {
        await type(n.line, 'A woman. She thought silence would save her. It did not. \u2014 And here you are. Instead of her. \u2014 Hmm. How poetic.', 26);
      }
      await wait(2200);

      n.root.style.opacity = '0';
      await wait(560);
    } catch (e) {
      console.warn('[encounter-noir] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  window.MSEncounterNoir = { play, seenKey: 'pp_ms_encounter_noir_seen' };
})();
