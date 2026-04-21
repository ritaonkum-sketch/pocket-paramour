/* encounter-lucien.js — the tower library meet-cute. Scholar / curious tone.
 * Registers window.MSEncounterLucien. */
(function () {
  'use strict';

  const BODY_SRC  = 'assets/lucien/body/casual1.png';
  const BODY_LOOK = 'assets/lucien/body/amused.png';
  const BG_SRC    = 'assets/bg-lucien-study.png';

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
      'background:#060610', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #1a1430 0%, #05040d 80%)',
      'background-size:cover', 'background-position:center',
      'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => { bg.style.backgroundImage = `url(${BG_SRC})`; bg.style.opacity = '0.55'; };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    // Floating dust motes suggesting an old, still room
    if (!document.getElementById('ms-keyframes-lucien')) {
      const kf = document.createElement('style');
      kf.id = 'ms-keyframes-lucien';
      kf.textContent = `@keyframes msDrift { 0% { transform: translateY(0); opacity: 0.3; } 50% { opacity: 0.65; } 100% { transform: translateY(-30vh); opacity: 0; } }`;
      document.head.appendChild(kf);
    }
    const motes = el('div', 'position:absolute;inset:0;pointer-events:none;');
    for (let i = 0; i < 8; i++) {
      const m = el('div', [
        'position:absolute',
        `left:${10 + Math.random() * 80}%`,
        `top:${50 + Math.random() * 40}%`,
        'width:3px', 'height:3px', 'border-radius:50%',
        'background:rgba(220,200,255,0.65)',
        `animation: msDrift ${8 + Math.random() * 6}s linear ${Math.random() * 5}s infinite`
      ].join(';'));
      motes.appendChild(m);
    }
    root.appendChild(motes);

    const charWrap = el('div', [
      'position:relative', 'margin-bottom:26vh',
      'width:62%', 'max-width:300px', 'aspect-ratio:3/5',
      'display:flex', 'align-items:flex-end', 'justify-content:center',
      'cursor:pointer', 'opacity:0', 'transform:translateY(20px) scale(0.97)',
      'transition:opacity 900ms ease, transform 1100ms cubic-bezier(.2,.8,.2,1)',
      '-webkit-tap-highlight-color:transparent'
    ].join(';'));
    charWrap.id = 'ms-char-wrap';
    const charImg = el('img', [
      'width:100%', 'height:100%', 'object-fit:contain',
      'filter:drop-shadow(0 10px 30px rgba(0,0,0,0.65))',
      'pointer-events:none', 'user-select:none'
    ].join(';'));
    charImg.src = BODY_SRC;
    charImg.alt = 'Lucien';
    charImg.id = 'ms-char-img';
    const fallback = () => {
      charImg.style.opacity = '0';
      charWrap.style.background = 'radial-gradient(ellipse at center bottom, #6a5db8 0%, transparent 65%)';
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
      'background:rgba(10,8,22,0.88)', 'backdrop-filter:blur(6px)',
      'color:#eae0ff', 'font-size:17px', 'line-height:1.45',
      'box-shadow:0 6px 24px rgba(0,0,0,0.55)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 500ms ease, transform 500ms ease'
    ].join(';'));
    dialogue.id = 'ms-dialogue';
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.65;margin-bottom:6px;', 'LUCIEN');
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
      'position:absolute', 'left:50%', 'top:24%', 'transform:translateX(-50%)',
      'padding:6px 14px', 'border-radius:20px',
      'background:rgba(255,255,255,0.08)', 'color:#eae0ff',
      'font-size:12px', 'letter-spacing:1px', 'opacity:0',
      'transition:opacity 400ms ease', 'pointer-events:none', 'display:none'
    ].join(';'), 'step closer');
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

    return { root, charWrap, charImg, dialogue, line, hint, tapHint, choiceRow };
  }

  function showChoice(choiceRow, dialogue, options) {
    return new Promise((resolve) => {
      dialogue.style.opacity = '0';
      setTimeout(() => {
        choiceRow.innerHTML = '';
        options.forEach((opt) => {
          const btn = el('button', [
            'padding:14px 18px', 'border-radius:22px', 'border:0',
            'background:linear-gradient(180deg,#b5a3ea,#7e63c9)',
            'color:#0f0a26', 'font-size:15px', 'font-weight:600',
            'box-shadow:0 4px 14px rgba(126,99,201,0.4)',
            'cursor:pointer', 'text-align:left', 'font-family:inherit'
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
    n.charWrap.style.opacity = '1';
    n.charWrap.style.transform = 'translateY(0) scale(1)';
    await wait(600);
    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      // Beat 1 — he hasn\u2019t looked up from his work yet
      await type(n.line, 'The door was locked. I locked it myself.', 28);
      await wait(1600);

      // Beat 2 — tap to step closer
      n.tapHint.style.opacity = '0.85';
      n.hint.textContent = '(tap to step closer)';
      n.hint.style.opacity = '0.75';
      await waitForTap(n.charWrap);
      n.tapHint.style.opacity = '0';
      n.hint.textContent = '';
      n.hint.style.opacity = '0';

      await wait(180);
      n.charImg.src = BODY_LOOK;
      n.charImg.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }],
        { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
      await wait(320);

      // Beat 3 — he looks up, curious
      await type(n.line, '\u2026And yet. Here you are. Interesting.', 26);
      await wait(1400);

      // Beat 4 — unlock one answer
      n.hint.textContent = 'one answer unlocked \u2014 tap to speak';
      n.hint.style.opacity = '0.75';
      await waitForTap(n.dialogue);
      n.hint.style.opacity = '0';
      n.hint.textContent = '';

      // Beat 5 — choice
      await type(n.line, 'How did you get past the wards?', 34);
      await wait(300);
      const pick = await showChoice(n.choiceRow, n.dialogue, [
        { id: 'touched',  text: 'The door \u2026opened when I touched it.' },
        { id: 'unknown',  text: '\u2026I don\u2019t know. I just ended up here.' }
      ]);
      try { localStorage.setItem('pp_ms_lucien_first_choice', pick.id); } catch (_) {}

      n.dialogue.style.opacity = '1';
      if (pick.id === 'touched') {
        await type(n.line, 'That shouldn\u2019t be possible. Which means you\u2019re worth observing. Sit. Don\u2019t touch anything else.', 28);
      } else {
        await type(n.line, 'A stray variable, then. My favorite kind. Stay. I have questions.', 28);
      }
      await wait(2200);

      n.root.style.opacity = '0';
      await wait(520);
    } catch (e) {
      console.warn('[encounter-lucien] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  window.MSEncounterLucien = { play, seenKey: 'pp_ms_encounter_lucien_seen' };
})();
