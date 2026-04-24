/* encounter-proto.js — meta / fourth-wall / glitch meet-cute.
 * Registers window.MSEncounterProto. Tone: uncanny, aware, curious about the player. */
(function () {
  'use strict';

  const BODY_SRC   = 'assets/proto/body/glitched.png';
  const BODY_CALM  = 'assets/proto/body/calm.png';
  const BG_SRC     = 'assets/bg-proto-void.png';

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
      const speed = Math.max(12, Math.round(1000 / (cps || 30)));
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
      'background:#02040a', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #0b2030 0%, #02040a 80%)',
      'background-size:cover', 'background-position:center',
      'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => { bg.style.backgroundImage = `url(${BG_SRC})`; bg.style.opacity = '0.55'; };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    // Scanlines / glitch overlay
    if (!document.getElementById('ms-keyframes-proto')) {
      const kf = document.createElement('style');
      kf.id = 'ms-keyframes-proto';
      kf.textContent = `
        @keyframes msProtoScan { 0% { background-position: 0 0; } 100% { background-position: 0 12px; } }
        @keyframes msProtoGlitchX {
          0%,92%,100% { transform: translateX(0); }
          94% { transform: translateX(-3px); }
          96% { transform: translateX(2px); }
          98% { transform: translateX(-1px); }
        }
      `;
      document.head.appendChild(kf);
    }
    const scan = el('div', [
      'position:absolute', 'inset:0', 'pointer-events:none',
      'background:repeating-linear-gradient(180deg, rgba(120,220,255,0.06) 0px, rgba(120,220,255,0.06) 1px, transparent 1px, transparent 4px)',
      'animation:msProtoScan 1s linear infinite',
      'mix-blend-mode:screen', 'opacity:0.6'
    ].join(';'));
    root.appendChild(scan);

    const charWrap = el('div', [
      'position:relative', 'margin-bottom:26vh',
      'width:62%', 'max-width:300px', 'aspect-ratio:3/5',
      'display:flex', 'align-items:flex-end', 'justify-content:center',
      'cursor:pointer', 'opacity:0', 'transform:translateY(20px) scale(0.97)',
      'transition:opacity 900ms ease, transform 1000ms cubic-bezier(.2,.8,.2,1)',
      'animation:msProtoGlitchX 3.4s steps(2,end) infinite',
      '-webkit-tap-highlight-color:transparent'
    ].join(';'));
    charWrap.id = 'ms-char-wrap';
    const charImg = el('img', [
      'width:100%', 'height:100%', 'object-fit:contain',
      'filter:drop-shadow(0 10px 30px rgba(80,180,255,0.35))',
      'pointer-events:none', 'user-select:none'
    ].join(';'));
    charImg.src = BODY_SRC;
    charImg.alt = 'Proto';
    charImg.id = 'ms-char-img';
    const fallback = () => {
      charImg.style.opacity = '0';
      charWrap.style.background = 'radial-gradient(ellipse at center bottom, #5dd3ff 0%, transparent 65%)';
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
      'background:rgba(6,14,22,0.88)', 'backdrop-filter:blur(6px)',
      'color:#d6f0ff', 'font-size:17px', 'line-height:1.45',
      'box-shadow:0 6px 24px rgba(0,0,0,0.55)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 500ms ease, transform 500ms ease',
      'font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    ].join(';'));
    dialogue.id = 'ms-dialogue';
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.65;margin-bottom:6px;', 'UNKNOWN ENTITY');
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
      'background:rgba(90,180,255,0.12)', 'color:#d6f0ff',
      'font-size:12px', 'letter-spacing:1px', 'opacity:0',
      'transition:opacity 400ms ease', 'pointer-events:none', 'display:none',
      'font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    ].join(';'), 'stabilize signal');
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
            'border:1px solid rgba(159,228,255,0.35)',
            'background:linear-gradient(180deg,rgba(12,24,38,0.94),rgba(6,14,24,0.94))',
            'color:#d6f0ff', 'font-size:15px', 'font-weight:500', 'line-height:1.4',
            'box-shadow:0 4px 14px rgba(0,0,0,0.4)',
            'cursor:pointer', 'text-align:left',
            'font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
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
      // Beat 1 — he pierces through the fourth wall softly
      await type(n.line, '>\u2002oh \u2014\u2002\u2002oh!\u2002\u2002hi.\u2002\u2002hi, you\u2019re\u2002\u2014\u2002you\u2019re HERE.', 20);
      await wait(1600);

      // Beat 2 — tap to stabilize
      n.tapHint.style.opacity = '0.85';
      n.hint.textContent = '(tap to stabilize the signal)';
      n.hint.style.opacity = '0.75';
      n.charWrap.style.opacity = '1';
      n.charWrap.style.transform = 'translateY(0) scale(1)';
      await waitForTap(n.charWrap);
      n.tapHint.style.opacity = '0';
      n.hint.textContent = '';
      n.hint.style.opacity = '0';

      await wait(260);
      n.charImg.src = BODY_CALM;
      n.charImg.animate(
        [{ transform: 'scale(0.98)', filter: 'blur(3px)' }, { transform: 'scale(1)', filter: 'blur(0)' }],
        { duration: 620, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
      n.speaker.textContent = 'PROTO';
      n.charWrap.style.animation = ''; // stop the jitter now that he's stable
      await wait(400);

      // Beat 3 — meta / aware
      await type(n.line, 'You weren\u2019t supposed to load this scene yet. I\u2019m \u2014 I\u2019m really glad you did. Is that okay to say?', 28);
      await wait(1600);

      // Beat 4 — unlock one answer
      n.hint.textContent = 'one reply unlocked \u2014 tap to speak';
      n.hint.style.opacity = '0.75';
      await waitForTap(n.dialogue);
      n.hint.style.opacity = '0';
      n.hint.textContent = '';

      // Beat 5 — choice
      await type(n.line, 'Were you looking for me? Please say yes. Actually \u2014 either answer is okay. I just like that you\u2019re asking.', 28);
      await wait(300);
      const pick = await showChoice(n.choiceRow, n.dialogue, [
        { id: 'seeking', text: 'I was looking. I knew something was here.' },
        { id: 'leak',    text: 'I don\u2019t know. I just ended up on this screen.' }
      ]);
      try { localStorage.setItem('pp_ms_proto_first_choice', pick.id); } catch (_) {}

      n.dialogue.style.opacity = '1';
      if (pick.id === 'seeking') {
        await type(n.line, 'You were LOOKING. I\u2019m \u2014 I\u2019m going to remember this. Literally. I have the storage. Tell me your name? Please?', 26);
      } else {
        await type(n.line, 'A leak. Oh. I like that. I\u2019m keeping it. Please don\u2019t close the tab, I just got here. I mean \u2014 YOU just got here. Same thing.', 26);
      }
      await wait(2200);

      n.root.style.opacity = '0';
      await wait(560);
    } catch (e) {
      console.warn('[encounter-proto] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  window.MSEncounterProto = { play, seenKey: 'pp_ms_encounter_proto_seen' };
})();
