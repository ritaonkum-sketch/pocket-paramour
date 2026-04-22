/* encounter-alistair.js — the new interaction-first "meet-cute" for Alistair.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Registers window.MSEncounterAlistair.
 *  - Only runs when main-story.js calls play() — which only happens when
 *    `pp_main_story_enabled === '1'` and the player has no saves yet.
 *  - Renders in its own full-screen overlay. No global CSS bleed.
 *  - If anything fails, calls the onDone callback so the player is never stuck.
 *
 * DESIGN (per the plan):
 *   Beat 1 (0–3s):   "...You shouldn't be here."   [no input needed — auto advance]
 *   Beat 2 (tap):    Player taps the character → he reacts
 *   Beat 3:          "...You're really going to stay, aren't you?"
 *   Beat 4:          Unlock ONE action — a "Talk" prompt appears
 *   Beat 5:          First micro-choice (2 options) — sets a tiny flavor flag
 *   Beat 6:          Fade out → caller resumes normal Start flow
 */
(function () {
  'use strict';

  const BODY_SRC = 'assets/alistair/body/casual.png';
  const FACE_SRC = 'assets/alistair/face/cautious.png';
  const BG_SRC   = 'assets/bg/castle.png';

  let _rootEl = null;

  function el(tag, css, text) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text) e.textContent = text;
    return e;
  }

  function buildRoot() {
    const root = el('div', [
      'position:fixed', 'inset:0', 'z-index:10000',
      'background:#05060d', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    // Background (optional — falls back to gradient if missing)
    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #1a1030 0%, #05060d 75%)',
      'background-size:cover', 'background-position:center',
      'opacity:0', 'transition:opacity 800ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => {
      bg.style.backgroundImage = `url(${BG_SRC})`;
      bg.style.opacity = '0.55';
    };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    // Character wrapper — tappable
    const charWrap = el('div', [
      'position:relative', 'margin-bottom:26vh',
      'width:62%', 'max-width:300px', 'aspect-ratio:3/5',
      'display:flex', 'align-items:flex-end', 'justify-content:center',
      'cursor:pointer', 'opacity:0', 'transform:translateY(20px) scale(0.97)',
      'transition:opacity 700ms ease, transform 900ms cubic-bezier(.2,.8,.2,1)',
      '-webkit-tap-highlight-color:transparent'
    ].join(';'));
    charWrap.id = 'ms-char-wrap';

    const charImg = el('img', [
      'width:100%', 'height:100%', 'object-fit:contain',
      'filter:drop-shadow(0 10px 30px rgba(0,0,0,0.6))',
      'pointer-events:none', 'user-select:none'
    ].join(';'));
    charImg.src = BODY_SRC;
    charImg.alt = 'Alistair';
    charImg.id = 'ms-char-img';
    // If body sprite 404s or is a placeholder, show a soft silhouette instead of breaking.
    const fallback = () => {
      charImg.style.opacity = '0';
      charWrap.style.background = 'radial-gradient(ellipse at center bottom, #6b5b95 0%, transparent 65%)';
      charWrap.style.minHeight = '55vh';
    };
    charImg.onerror = fallback;
    charImg.onload = () => {
      if (charImg.naturalWidth < 50 || charImg.naturalHeight < 50) fallback();
    };
    charWrap.appendChild(charImg);
    root.appendChild(charWrap);

    // Dialogue panel
    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(10,6,22,0.85)', 'backdrop-filter:blur(6px)',
      'color:#f4e6ff', 'font-size:17px', 'line-height:1.45',
      'box-shadow:0 6px 24px rgba(0,0,0,0.55)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 500ms ease, transform 500ms ease',
      'font-family:inherit'
    ].join(';'));
    dialogue.id = 'ms-dialogue';

    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.65;margin-bottom:6px;', 'ALISTAIR');
    const line = el('div', 'min-height:44px;', '');
    line.id = 'ms-dialogue-line';
    const hint = el('div', 'margin-top:10px;font-size:12px;opacity:0.55;font-style:italic;', '');
    hint.id = 'ms-dialogue-hint';

    dialogue.appendChild(speaker);
    dialogue.appendChild(line);
    dialogue.appendChild(hint);
    root.appendChild(dialogue);

    // Tap instruction floating near character (shown on beat 2)
    const tapHint = el('div', [
      'position:absolute', 'left:50%', 'top:24%', 'transform:translateX(-50%)',
      'padding:6px 14px', 'border-radius:20px',
      'background:rgba(255,255,255,0.08)', 'color:#f4e6ff',
      'font-size:12px', 'letter-spacing:1px',
      'opacity:0', 'transition:opacity 400ms ease', 'pointer-events:none', 'display:none'
    ].join(';'), 'tap him');
    tapHint.id = 'ms-tap-hint';
    root.appendChild(tapHint);

    // Choice row (shown on beat 5)
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

  function type(el, text, cps) {
    return new Promise((resolve) => {
      el.textContent = '';
      const speed = Math.max(14, Math.round(1000 / (cps || 34)));
      let i = 0;
      const step = () => {
        if (i < text.length) { el.textContent += text[i++]; setTimeout(step, speed); }
        else resolve();
      };
      step();
    });
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  function showHint(el, txt) {
    el.textContent = txt;
    el.style.opacity = '0.85';
  }
  function hideHint(el) { el.style.opacity = '0'; el.textContent = ''; }

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

  function reactionPulse(imgEl) {
    imgEl.animate(
      [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(-6px) scale(1.02)' },
        { transform: 'translateY(0) scale(1)' }
      ],
      { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' }
    );
  }

  function showChoice(choiceRow, dialogue, options) {
    return new Promise((resolve) => {
      // Hide dialogue's text area, show choice buttons over the same zone.
      dialogue.style.opacity = '0';
      setTimeout(() => {
        choiceRow.innerHTML = '';
        options.forEach((opt) => {
          const btn = el('button', [
            'padding:14px 18px', 'border-radius:20px',
            'border:1px solid rgba(246,165,192,0.35)',
            'background:linear-gradient(180deg,rgba(38,24,56,0.94),rgba(22,14,34,0.94))',
            'color:#f4e6ff', 'font-size:15px', 'font-weight:500', 'line-height:1.4',
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
    const nodes = buildRoot();
    _rootEl = nodes.root;
    document.body.appendChild(nodes.root);

    // Fade in overlay and character
    requestAnimationFrame(() => { nodes.root.style.opacity = '1'; });
    await wait(280);
    nodes.charWrap.style.opacity = '1';
    nodes.charWrap.style.transform = 'translateY(0) scale(1)';
    await wait(600);
    nodes.dialogue.style.opacity = '1';
    nodes.dialogue.style.transform = 'translateY(0)';

    try {
      // Beat 1 — he speaks first, no input
      await type(nodes.line, '\u2026You shouldn\u2019t be here.', 28);
      await wait(1800);

      // Beat 2 — invite tap
      showHint(nodes.tapHint, 'tap him');
      showHint(nodes.hint, '');
      nodes.hint.textContent = '(tap the character)';
      nodes.hint.style.opacity = '0.75';
      await waitForTap(nodes.charWrap);
      hideHint(nodes.tapHint);
      nodes.hint.textContent = '';
      nodes.hint.style.opacity = '0';
      reactionPulse(nodes.charImg);
      await wait(300);

      // Beat 3 — he softens
      await type(nodes.line, '\u2026You\u2019re really going to stay, aren\u2019t you?', 30);
      await wait(1600);

      // Beat 4 — unlock ONE action: Talk
      nodes.hint.textContent = 'one action unlocked \u2014 tap to talk';
      nodes.hint.style.opacity = '0.75';
      await waitForTap(nodes.dialogue);
      hideHint(nodes.hint);
      reactionPulse(nodes.charImg);

      // Beat 5 — first micro-choice
      await type(nodes.line, 'Why are you still here?', 34);
      await wait(400);
      const pick = await showChoice(nodes.choiceRow, nodes.dialogue, [
        { id: 'stay',  text: 'I got lost. I think I was meant to find you.' },
        { id: 'quiet', text: '\u2026I don\u2019t know. I just didn\u2019t want to leave.' }
      ]);

      // Save flavor flag (tiny, non-breaking)
      try { localStorage.setItem('pp_ms_alistair_first_choice', pick.id); } catch (_) {}

      // Response
      nodes.dialogue.style.opacity = '1';
      if (pick.id === 'stay') {
        await type(nodes.line, 'Then I\u2019ll keep watch until you find your way. Or I do.', 30);
      } else {
        await type(nodes.line, 'Then stay. Quietly, if you must. I don\u2019t mind the company.', 30);
      }
      await wait(2000);

      // Beat 6 — fade out cleanly
      nodes.root.style.opacity = '0';
      await wait(520);
    } catch (e) {
      // Never leave the player stuck
      console.warn('[encounter-alistair] aborted:', e);
    } finally {
      try { nodes.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  window.MSEncounterAlistair = { play };
})();
