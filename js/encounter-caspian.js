/* encounter-caspian.js — the balcony meet-cute. Flirty / charming tone.
 * Registers window.MSEncounterCaspian. */
(function () {
  'use strict';

  const BODY_SRC  = 'assets/caspian/body/casual1.png';
  const BODY_STEP = 'assets/caspian/body/casual2.png';
  const BG_SRC    = 'assets/bg-caspian-night.png';

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
      'background:#120618', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #2a1340 0%, #0a0414 80%)',
      'background-size:cover', 'background-position:center',
      'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => { bg.style.backgroundImage = `url(${BG_SRC})`; bg.style.opacity = '0.6'; };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    // Soft warm haze — candles / distant ballroom glow
    const haze = el('div', [
      'position:absolute', 'left:0', 'right:0', 'bottom:0', 'height:40%',
      'background:linear-gradient(180deg, transparent, rgba(210,140,60,0.10) 60%, rgba(210,140,60,0.18))',
      'pointer-events:none'
    ].join(';'));
    root.appendChild(haze);

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
    charImg.alt = 'Caspian';
    charImg.id = 'ms-char-img';
    const fallback = () => {
      charImg.style.opacity = '0';
      charWrap.style.background = 'radial-gradient(ellipse at center bottom, #8e3f8e 0%, transparent 65%)';
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
      'background:rgba(18,8,22,0.88)', 'backdrop-filter:blur(6px)',
      'color:#f8e9ff', 'font-size:17px', 'line-height:1.45',
      'box-shadow:0 6px 24px rgba(0,0,0,0.55)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 500ms ease, transform 500ms ease'
    ].join(';'));
    dialogue.id = 'ms-dialogue';
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.65;margin-bottom:6px;', 'CASPIAN');
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
      'background:rgba(255,255,255,0.08)', 'color:#f8e9ff',
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
            'background:linear-gradient(180deg,#e5a3d4,#b75fa9)',
            'color:#1d0a1e', 'font-size:15px', 'font-weight:600',
            'box-shadow:0 4px 14px rgba(183,95,169,0.4)',
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
    await wait(280);
    n.charWrap.style.opacity = '1';
    n.charWrap.style.transform = 'translateY(0) scale(1)';
    await wait(600);
    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      // Beat 1 — he spots the player, amused
      await type(n.line, 'Well. Someone wandered in who isn\u2019t on the guest list.', 30);
      await wait(1600);

      // Beat 2 — invite tap
      n.tapHint.style.opacity = '0.85';
      n.hint.textContent = '(tap to step closer)';
      n.hint.style.opacity = '0.75';
      await waitForTap(n.charWrap);
      n.tapHint.style.opacity = '0';
      n.hint.textContent = '';
      n.hint.style.opacity = '0';
      n.charImg.src = BODY_STEP;
      n.charImg.animate(
        [{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-4px) scale(1.02)' }, { transform: 'translateY(0) scale(1)' }],
        { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
      await wait(300);

      // Beat 3 — he turns up the charm
      await type(n.line, 'Either you\u2019re lost, or you\u2019re brave. I find both \u2026entertaining.', 30);
      await wait(1400);

      // Beat 4 — unlock one answer
      n.hint.textContent = 'one reply unlocked \u2014 tap to answer';
      n.hint.style.opacity = '0.75';
      await waitForTap(n.dialogue);
      n.hint.style.opacity = '0';
      n.hint.textContent = '';

      // Beat 5 — choice
      await type(n.line, 'So \u2014 which are you, really?', 34);
      await wait(300);
      const pick = await showChoice(n.choiceRow, n.dialogue, [
        { id: 'intrude', text: 'Lost. I didn\u2019t mean to intrude.' },
        { id: 'brave',   text: 'I heard the prince was worth the trouble.' }
      ]);
      try { localStorage.setItem('pp_ms_caspian_first_choice', pick.id); } catch (_) {}

      n.dialogue.style.opacity = '1';
      if (pick.id === 'intrude') {
        await type(n.line, 'Mm. A shame. I was about to be very disappointed if it was anything else.', 30);
      } else {
        await type(n.line, 'Flattery. My favorite language. \u2026You\u2019re already dangerous.', 30);
      }
      await wait(2000);

      n.root.style.opacity = '0';
      await wait(520);
    } catch (e) {
      console.warn('[encounter-caspian] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  window.MSEncounterCaspian = { play, seenKey: 'pp_ms_encounter_caspian_seen' };
})();
