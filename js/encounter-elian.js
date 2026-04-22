/* encounter-elian.js — forest meet-cute. Registers window.MSEncounterElian.
 *
 * SAFETY: same contract as encounter-alistair.js. Called only when main-story
 * advances to stage 2 and the encounter hasn't been seen. Self-contained overlay.
 */
(function () {
  'use strict';

  const BODY_SRC = 'assets/elian/body/guarded.png';
  const BODY_SOFT = 'assets/elian/body/calm.png';
  const BG_SRC   = 'assets/bg-elian-forest.png';

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
      const speed = Math.max(14, Math.round(1000 / (cps || 34)));
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
      'background:#06100a', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #1a2e1c 0%, #050b06 75%)',
      'background-size:cover', 'background-position:center',
      'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => { bg.style.backgroundImage = `url(${BG_SRC})`; bg.style.opacity = '0.60'; };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    // Rustle overlay — subtle moving shadows
    const rustle = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(1200px 400px at 20% 30%, rgba(40,80,40,0.25), transparent 60%)',
      'pointer-events:none', 'animation:msRustle 6s ease-in-out infinite'
    ].join(';'));
    root.appendChild(rustle);

    const charWrap = el('div', [
      'position:relative', 'margin-bottom:26vh',
      'width:62%', 'max-width:300px', 'aspect-ratio:3/5',
      'display:flex', 'align-items:flex-end', 'justify-content:center',
      'cursor:pointer', 'opacity:0', 'transform:translateY(20px) scale(0.97)',
      'transition:opacity 800ms ease, transform 1000ms cubic-bezier(.2,.8,.2,1)',
      '-webkit-tap-highlight-color:transparent'
    ].join(';'));
    charWrap.id = 'ms-char-wrap';
    const charImg = el('img', [
      'width:100%', 'height:100%', 'object-fit:contain',
      'filter:drop-shadow(0 10px 30px rgba(0,0,0,0.6))',
      'pointer-events:none', 'user-select:none'
    ].join(';'));
    charImg.src = BODY_SRC;
    charImg.alt = 'Elian';
    charImg.id = 'ms-char-img';
    const fallback = () => {
      charImg.style.opacity = '0';
      charWrap.style.background = 'radial-gradient(ellipse at center bottom, #4d6b4b 0%, transparent 65%)';
      charWrap.style.minHeight = '55vh';
    };
    charImg.onerror = fallback;
    charImg.onload = () => {
      // Placeholder images sometimes load successfully at 1x1 — treat as missing art.
      if (charImg.naturalWidth < 50 || charImg.naturalHeight < 50) fallback();
    };
    charWrap.appendChild(charImg);
    root.appendChild(charWrap);

    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(8,16,10,0.88)', 'backdrop-filter:blur(6px)',
      'color:#e8f3e2', 'font-size:17px', 'line-height:1.45',
      'box-shadow:0 6px 24px rgba(0,0,0,0.55)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 500ms ease, transform 500ms ease'
    ].join(';'));
    dialogue.id = 'ms-dialogue';
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.65;margin-bottom:6px;', 'ELIAN');
    const line = el('div', 'min-height:44px;', '');
    line.id = 'ms-dialogue-line';
    const hint = el('div', 'margin-top:10px;font-size:12px;opacity:0.55;font-style:italic;', '');
    hint.id = 'ms-dialogue-hint';
    dialogue.appendChild(speaker);
    dialogue.appendChild(line);
    dialogue.appendChild(hint);
    root.appendChild(dialogue);

    const tapHint = el('div', [
      'position:absolute', 'left:50%', 'top:24%', 'transform:translateX(-50%)',
      'padding:6px 14px', 'border-radius:20px',
      'background:rgba(255,255,255,0.08)', 'color:#e8f3e2',
      'font-size:12px', 'letter-spacing:1px', 'opacity:0',
      'transition:opacity 400ms ease', 'pointer-events:none', 'display:none'
    ].join(';'), 'part the branches');
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

    // Keyframes once
    if (!document.getElementById('ms-keyframes')) {
      const kf = document.createElement('style');
      kf.id = 'ms-keyframes';
      kf.textContent = `@keyframes msRustle { 0%,100% { transform: translateX(0); opacity: 0.5; } 50% { transform: translateX(18px); opacity: 0.8; } }`;
      document.head.appendChild(kf);
    }

    return { root, charWrap, charImg, dialogue, line, hint, tapHint, choiceRow };
  }

  function showChoice(choiceRow, dialogue, options) {
    return new Promise((resolve) => {
      dialogue.style.opacity = '0';
      setTimeout(() => {
        choiceRow.innerHTML = '';
        options.forEach((opt) => {
          const btn = el('button', [
            'padding:14px 18px', 'border-radius:20px',
            'border:1px solid rgba(169,212,161,0.35)',
            'background:linear-gradient(180deg,rgba(28,40,30,0.94),rgba(14,24,16,0.94))',
            'color:#e8f3e2', 'font-size:15px', 'font-weight:500', 'line-height:1.4',
            'box-shadow:0 4px 14px rgba(0,0,0,0.4)',
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
    await wait(300);
    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      // Beat 1 — a voice, no body yet
      await type(n.line, 'Stay where you are. The forest doesn\u2019t like strangers.', 28);
      await wait(1400);

      // Beat 2 — invite tap to "part the branches"
      n.tapHint.style.opacity = '0.85';
      n.hint.textContent = '(tap to part the branches)';
      n.hint.style.opacity = '0.75';

      // Beat 2b — on tap, reveal him
      n.charWrap.style.opacity = '1';
      n.charWrap.style.transform = 'translateY(0) scale(1)';
      await waitForTap(n.charWrap);
      n.tapHint.style.opacity = '0';
      n.hint.textContent = '';
      n.hint.style.opacity = '0';
      n.charImg.animate(
        [{ transform: 'translateY(6px) scale(0.98)' }, { transform: 'translateY(0) scale(1)' }],
        { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );

      // Swap to softer pose after reveal
      await wait(180);
      n.charImg.src = BODY_SOFT;
      await wait(400);

      // Beat 3 — he lowers his guard a notch
      await type(n.line, 'Hm. You\u2019re not one of them. And you\u2019re not from around here.', 30);
      await wait(1400);

      // Beat 4 — prompt for one action
      n.hint.textContent = 'one question unlocked \u2014 tap to speak';
      n.hint.style.opacity = '0.75';
      await waitForTap(n.dialogue);
      n.hint.style.opacity = '0';
      n.hint.textContent = '';

      // Beat 5 — choice
      await type(n.line, 'What brings you this far into the trees?', 34);
      await wait(300);
      const pick = await showChoice(n.choiceRow, n.dialogue, [
        { id: 'lost',    text: 'I was lost. The path just kept going.' },
        { id: 'drawn',   text: 'Something pulled me here. I don\u2019t know what.' }
      ]);
      try { localStorage.setItem('pp_ms_elian_first_choice', pick.id); } catch (_) {}

      n.dialogue.style.opacity = '1';
      if (pick.id === 'lost') {
        await type(n.line, 'Then I\u2019ll walk you back to something you recognize. Eventually.', 30);
      } else {
        await type(n.line, 'The forest does that sometimes. It picks people. Quietly.', 30);
      }
      await wait(1800);

      n.root.style.opacity = '0';
      await wait(520);
    } catch (e) {
      console.warn('[encounter-elian] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  window.MSEncounterElian = { play, seenKey: 'pp_ms_encounter_elian_seen' };
})();
