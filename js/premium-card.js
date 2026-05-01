/* premium-card.js — Love-and-Deepspace style animated story-card engine.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Registers window.MSCard with { show, register, playSample }.
 *  - Feature-flagged on pp_main_story_enabled (or a dev can call
 *    MSCard.show() directly which bypasses the flag — useful for testing).
 *  - Does not touch game state. Cards are render-only.
 *  - On any error the overlay tears down and onDone fires — player never stuck.
 *
 * CARD DATA SHAPE:
 *  {
 *    id: 'lyra_first_song',
 *    title: 'MEMORY',
 *    subtitle: '01 \u00b7 The Song Was For You',
 *    speaker: 'LYRA',
 *    palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
 *    bg: 'assets/bg-siren-cave.png',
 *    beats: [
 *      { type: 'show',       pose: 'assets/lyra/body/casual1.png', wait: 600 },
 *      { type: 'line',       text: 'You came back.', hold: 1800, cps: 32 },
 *      { type: 'pose',       src: 'assets/lyra/body/casual2.png', animate: 'swap' },
 *      { type: 'line',       text: 'Listen. This one\u2019s for you.', hold: 1800, cps: 32 },
 *      { type: 'zoom',       amount: 1.12, duration: 2400 },
 *      { type: 'particles',  count: 28, duration: 2400 },
 *      { type: 'hold',       ms: 1200 },
 *      { type: 'flourish',   text: '\u266a' },
 *      { type: 'line',       text: 'Don\u2019t tell anyone. It was just for you.', hold: 2400, cps: 30 },
 *      { type: 'hide' }
 *    ]
 *  }
 */
(function () {
  'use strict';

  const REGISTRY = {};
  let _activeRoot = null;

  // ---------------------------------------------------------------
  function el(tag, css, text) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function typeTo(target, text, cps) {
    return new Promise((resolve) => {
      target.textContent = '';
      const speed = Math.max(14, Math.round(1000 / (cps || 32)));
      let i = 0;
      const step = () => {
        if (i < text.length) { target.textContent += text[i++]; setTimeout(step, speed); }
        else resolve();
      };
      step();
    });
  }

  // Inject keyframes once
  function injectCSS() {
    if (document.getElementById('mscard-css')) return;
    const s = document.createElement('style');
    s.id = 'mscard-css';
    s.textContent = `
      @keyframes mscardFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes mscardFadeOut { from { opacity: 1; } to { opacity: 0; } }
      @keyframes mscardParticle {
        0% { transform: translateY(0) scale(0.6); opacity: 0; }
        20% { opacity: 0.85; }
        100% { transform: translateY(-45vh) scale(1.1); opacity: 0; }
      }
      @keyframes mscardFlourish {
        0% { opacity: 0; transform: translate(-50%,-50%) scale(0.6); letter-spacing: 0.0em; }
        35% { opacity: 1; transform: translate(-50%,-50%) scale(1); letter-spacing: 0.4em; }
        80% { opacity: 1; transform: translate(-50%,-50%) scale(1); letter-spacing: 0.4em; }
        100% { opacity: 0; transform: translate(-50%,-50%) scale(1.05); letter-spacing: 0.6em; }
      }
      @keyframes mscardTitlePulse {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 1; }
      }
      @keyframes mscardTapPulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.85; }
      }
      .mscard-poseSwap { animation: mscardPoseSwap 620ms cubic-bezier(.2,.8,.2,1); }
      @keyframes mscardPoseSwap {
        0% { transform: scale(0.99) translateY(2px); opacity: 0.75; filter: blur(2px); }
        100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
      }
    `;
    document.head.appendChild(s);
  }

  // ---------------------------------------------------------------
  function buildShell(card) {
    injectCSS();
    const pal = card.palette || {};
    const root = el('div', [
      'position:fixed', 'inset:0', 'z-index:11000',
      `background:${pal.bg || '#05060d'}`, 'overflow:hidden',
      'opacity:0', 'transition:opacity 520ms ease',
      'display:flex', 'align-items:center', 'justify-content:center',
      '-webkit-tap-highlight-color:transparent', 'user-select:none'
    ].join(';'));
    root.id = 'mscard-root';

    // Background image (with palette gradient fallback)
    const bg = el('div', [
      'position:absolute', 'inset:0',
      `background:radial-gradient(ellipse at center, ${pal.glow || '#2a1a55'} 0%, ${pal.bg || '#05060d'} 80%)`,
      'background-size:cover', 'background-position:center',
      'opacity:0', 'transition:opacity 900ms ease, transform 8000ms ease'
    ].join(';'));
    bg.id = 'mscard-bg';
    if (card.bg) {
      const img = new Image();
      img.onload = () => { bg.style.backgroundImage = `url(${card.bg})`; bg.style.opacity = '0.6'; };
      img.onerror = () => { bg.style.opacity = '1'; };
      img.src = card.bg;
    } else {
      bg.style.opacity = '1';
    }
    root.appendChild(bg);

    // Glow ring — the spotlight halo behind the character. Starts
    // hidden so prologue narration beats (no pose) don't show it as
    // an orphan circle. Faded in by the `show` beat when a pose is
    // actually present.
    const glow = el('div', [
      'position:absolute', 'left:50%', 'top:45%', 'transform:translate(-50%,-50%)',
      'width:80vmin', 'height:80vmin', 'border-radius:50%',
      `box-shadow: inset 0 0 120px 40px ${pal.glow || '#3a2568'}, 0 0 140px 20px rgba(0,0,0,0.45)`,
      'pointer-events:none', 'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    glow.id = 'mscard-glow';
    root.appendChild(glow);

    // Character
    const charWrap = el('div', [
      'position:relative', 'width:78%', 'max-width:380px',
      'aspect-ratio:3/5', 'margin-bottom:14vh',
      'display:flex', 'align-items:flex-end', 'justify-content:center',
      'opacity:0', 'transform:translateY(18px) scale(0.97)',
      'transition:opacity 900ms ease, transform 1100ms cubic-bezier(.2,.8,.2,1), filter 1200ms ease'
    ].join(';'));
    charWrap.id = 'mscard-char-wrap';
    const charImg = el('img', [
      'width:100%', 'height:100%', 'object-fit:contain',
      'filter:drop-shadow(0 12px 38px rgba(0,0,0,0.7))',
      'pointer-events:none', 'user-select:none', 'transition:transform 2400ms ease'
    ].join(';'));
    charImg.id = 'mscard-char';
    const charFallback = () => {
      charImg.style.opacity = '0';
      charWrap.style.background = `radial-gradient(ellipse at center bottom, ${pal.glow || '#6a5db8'} 0%, transparent 65%)`;
      charWrap.style.minHeight = '55vh';
    };
    charImg.onerror = charFallback;
    charImg.onload = () => {
      if (charImg.naturalWidth < 50 || charImg.naturalHeight < 50) charFallback();
    };
    charWrap.appendChild(charImg);
    root.appendChild(charWrap);

    // Top title strip (appears at start, again on flourish)
    const titleStrip = el('div', [
      'position:absolute', 'left:0', 'right:0', 'top:4.5%',
      'text-align:center', 'color:' + (pal.accent || '#f4e6ff'),
      'font-size:11px', 'letter-spacing:4px', 'opacity:0',
      'transition:opacity 700ms ease', 'pointer-events:none',
      'text-shadow:0 1px 10px rgba(0,0,0,0.7)'
    ].join(';'));
    titleStrip.id = 'mscard-titlestrip';
    titleStrip.innerHTML =
      `<div style="font-weight:600;">${(card.title || 'MEMORY')}</div>` +
      `<div style="font-size:10px;opacity:0.6;margin-top:3px;">${(card.subtitle || '')}</div>`;
    root.appendChild(titleStrip);

    // Dialogue bottom panel
    const dialogue = el('div', [
      'position:absolute', 'left:6%', 'right:6%', 'bottom:6%',
      'padding:16px 20px', 'border-radius:18px',
      'background:rgba(10,6,22,0.78)', 'backdrop-filter:blur(6px)',
      `color:${pal.accent || '#f4e6ff'}`, 'font-size:17px', 'line-height:1.45',
      'box-shadow:0 6px 28px rgba(0,0,0,0.55)', 'min-height:64px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 500ms ease, transform 500ms ease',
      'pointer-events:none'
    ].join(';'));
    dialogue.id = 'mscard-dialogue';
    const speaker = el('div', 'font-size:11px;letter-spacing:2px;opacity:0.65;margin-bottom:6px;transition:opacity 220ms ease;', card.speaker || '');
    speaker.id = 'mscard-speaker';
    const line = el('div', 'min-height:42px;transition:font-style 220ms ease, opacity 220ms ease;', '');
    line.id = 'mscard-line';
    dialogue.appendChild(speaker);
    dialogue.appendChild(line);
    root.appendChild(dialogue);

    // Particles container
    const particles = el('div', 'position:absolute;inset:0;pointer-events:none;');
    particles.id = 'mscard-particles';
    root.appendChild(particles);

    // Flourish layer
    const flourish = el('div', [
      'position:absolute', 'left:50%', 'top:50%', 'transform:translate(-50%,-50%)',
      'font-size:42px', 'color:' + (pal.accent || '#f4e6ff'),
      'text-shadow:0 2px 18px rgba(0,0,0,0.7)',
      'opacity:0', 'pointer-events:none', 'font-weight:300'
    ].join(';'));
    flourish.id = 'mscard-flourish';
    root.appendChild(flourish);

    // Tap-to-advance hint (pulses softly so player notices they can tap)
    const tapHint = el('div', [
      'position:absolute', 'right:14px', 'bottom:14px',
      'color:' + (pal.accent || '#f4e6ff'), 'font-size:11px',
      'letter-spacing:2px', 'opacity:0.55', 'pointer-events:none',
      'animation: mscardTapPulse 1.8s ease-in-out infinite'
    ].join(';'), 'tap to continue');
    tapHint.id = 'mscard-taphint';
    root.appendChild(tapHint);

    return { root, bg, charWrap, charImg, dialogue, line, speaker, titleStrip, particles, flourish, glow };
  }

  function spawnParticles(container, count, pal) {
    for (let i = 0; i < count; i++) {
      const p = el('div', [
        'position:absolute',
        `left:${Math.random() * 100}%`,
        `top:${55 + Math.random() * 35}%`,
        'width:5px', 'height:5px', 'border-radius:50%',
        `background:${pal?.glow || '#e0c8ff'}`,
        `box-shadow:0 0 8px ${pal?.glow || '#e0c8ff'}`,
        `animation:mscardParticle ${1800 + Math.random() * 1800}ms ease-out ${Math.random() * 400}ms forwards`
      ].join(';'));
      container.appendChild(p);
    }
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

  // ---------------------------------------------------------------
  async function show(card, onDone) {
    if (_activeRoot) { try { onDone && onDone(); } catch (_) {} return; }
    if (!card || !Array.isArray(card.beats)) {
      console.warn('[premium-card] invalid card data');
      try { onDone && onDone(); } catch (_) {}
      return;
    }

    const pal = card.palette || {};
    const n = buildShell(card);
    _activeRoot = n.root;
    document.body.appendChild(n.root);

    // Tap-to-skip: each beat gets a fresh "skip" promise that resolves the
    // moment the player taps anywhere on the card. Beats that use waitS()
    // or typeToS() race against it, so taps feel like "advance now."
    let skipResolve = null;
    let skipPromise = new Promise(res => { skipResolve = res; });
    const resetSkip = () => { skipPromise = new Promise(res => { skipResolve = res; }); };
    const onSkip = () => { if (skipResolve) { const r = skipResolve; skipResolve = null; r(); } };
    n.root.addEventListener('click', onSkip);
    n.root.addEventListener('touchstart', onSkip, { passive: true });

    // Race helpers: returns immediately when either the timer or a tap
    // fires. After each beat we reset the skip promise so the next tap
    // can fire again.
    const waitS = async (ms) => {
      await Promise.race([wait(ms), skipPromise]);
      resetSkip();
    };
    const typeToS = async (target, text, cps) => {
      target.textContent = '';
      const speed = Math.max(14, Math.round(1000 / (cps || 32)));
      let i = 0;
      let cancelled = false;
      const tick = new Promise(resolve => {
        const step = () => {
          if (cancelled) { target.textContent = text; resolve(); return; }
          if (i < text.length) { target.textContent += text[i++]; setTimeout(step, speed); }
          else resolve();
        };
        step();
      });
      // If tap fires while typing, instantly complete the text.
      const raced = skipPromise.then(() => { cancelled = true; target.textContent = text; });
      await Promise.race([tick, raced]);
      resetSkip();
    };

    // Fade in overlay + title strip
    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(320);
    n.titleStrip.style.opacity = '1';
    await wait(400);

    try {
      for (const beat of card.beats) {
        switch (beat.type) {
          case 'show': {
            if (beat.pose) {
              n.charImg.src = beat.pose;
              n.charWrap.style.opacity = '1';
              n.charWrap.style.transform = 'translateY(0) scale(1)';
              if (n.glow) n.glow.style.opacity = '0.55';
            } else {
              // Pose-less beat (e.g. prologue narration before any
              // character is on stage). Hide the wrap AND the glow
              // halo — without a character behind it, the halo just
              // looks like an orphan circle over the bg.
              n.charImg.removeAttribute('src');
              n.charWrap.style.opacity = '0';
              n.charWrap.style.background = 'transparent';
              n.charWrap.style.minHeight = '';
              if (n.glow) n.glow.style.opacity = '0';
            }
            await waitS(beat.wait || 600);
            n.dialogue.style.opacity = '1';
            n.dialogue.style.transform = 'translateY(0)';
            break;
          }
          case 'pose': {
            if (beat.src) {
              n.charImg.classList.remove('mscard-poseSwap');
              // trigger reflow so animation can restart
              void n.charImg.offsetWidth;
              n.charImg.src = beat.src;
              if (beat.animate === 'swap') n.charImg.classList.add('mscard-poseSwap');
            }
            await waitS(beat.wait || 380);
            break;
          }
          case 'line': {
            // Per-beat speaker override. Used by bridges that mix narration
            // and character speech in the same card. When beat.speaker is
            // explicitly an empty string, render in italic narration mode
            // with no speaker label. When non-empty, replace the speaker
            // label. When undefined, leave the card-level speaker intact.
            if (beat.speaker !== undefined && n.speaker) {
              if (beat.speaker === '') {
                n.speaker.style.opacity = '0';
                n.speaker.style.height = '0';
                n.speaker.style.marginBottom = '0';
                n.speaker.style.overflow = 'hidden';
                n.line.style.fontStyle = 'italic';
                n.line.style.opacity = '0.92';
              } else {
                n.speaker.textContent = beat.speaker;
                n.speaker.style.opacity = '0.65';
                n.speaker.style.height = '';
                n.speaker.style.marginBottom = '6px';
                n.speaker.style.overflow = '';
                n.line.style.fontStyle = 'normal';
                n.line.style.opacity = '1';
              }
            }
            await typeToS(n.line, beat.text || '', beat.cps || 32);
            // BULLETPROOF tap-to-advance. Don't reuse skipPromise — it can
            // be racing with stale state from the typewriter phase. Register
            // a brand-new one-shot tap listener and wait for it. The first
            // tap (during typing) completes the typewriter via the existing
            // skip system; this fresh listener requires ANOTHER, separate tap
            // before the next beat fires. No timer. No auto-advance ever.
            await new Promise((resolve) => {
              const tap = (e) => {
                if (e && e.stopPropagation) e.stopPropagation();
                n.root.removeEventListener('click', tap);
                n.root.removeEventListener('touchstart', tap);
                resolve();
              };
              n.root.addEventListener('click', tap);
              n.root.addEventListener('touchstart', tap, { passive: true });
            });
            resetSkip();
            break;
          }
          case 'zoom': {
            const amt = beat.amount || 1.1;
            n.charImg.style.transform = `scale(${amt})`;
            n.bg.style.transform = `scale(${1 + (amt - 1) * 0.3})`;
            await waitS(beat.duration || 1800);
            break;
          }
          case 'particles': {
            spawnParticles(n.particles, beat.count || 20, pal);
            await waitS(beat.duration || 1400);
            break;
          }
          case 'flourish': {
            n.flourish.textContent = beat.text || '';
            n.flourish.style.animation = 'mscardFlourish 1600ms ease-out forwards';
            await waitS(beat.duration || 1700);
            n.flourish.style.animation = '';
            n.flourish.textContent = '';
            break;
          }
          case 'hold': {
            await waitS(beat.ms || 1000);
            break;
          }
          case 'tap': {
            // Explicit wait for user
            await waitForTap(n.root);
            break;
          }
          case 'hide': {
            n.root.style.pointerEvents = 'none';
            n.root.style.opacity = '0';
            await wait(560);
            break;
          }
          case 'choice': {
            // Renders a centered choice card with N tappable options.
            // Beat shape:
            //   { type: 'choice',
            //     prompt: 'What do you tell him?',
            //     options: [ { id: 'keep', text: '...' }, ... ],
            //     onChoose: (id) => { ... }   // called with the picked id
            //   }
            //
            // The Phase 2 "Other Page" Lucien chapter is the first place
            // this beat type is used in-line in the chain. Earlier chapters
            // captured choices in their bridges/encounters; bringing the
            // choice into a chapter beat itself lets us keep all the
            // narrative weight (and the localStorage hook) inside one
            // authored block.
            const opts = Array.isArray(beat.options) ? beat.options : [];
            if (!opts.length) break;
            // Hide the dialogue line briefly so the choice card has the stage.
            const prevDialogueOpacity = n.dialogue.style.opacity;
            n.dialogue.style.transition = 'opacity 280ms ease';
            n.dialogue.style.opacity = '0.25';

            const choiceWrap = document.createElement('div');
            choiceWrap.id = 'mscard-choice';
            choiceWrap.style.cssText = [
              'position:absolute', 'left:6%', 'right:6%', 'top:50%',
              'transform:translateY(-50%)',
              'display:flex', 'flex-direction:column', 'gap:10px',
              'padding:18px 18px 16px',
              'background:rgba(10,6,22,0.94)',
              'border:1px solid rgba(200,170,240,0.30)',
              'border-radius:18px',
              'box-shadow:0 12px 40px rgba(0,0,0,0.65), 0 0 22px rgba(180,140,220,0.18) inset',
              'backdrop-filter:blur(8px)',
              'opacity:0', 'transition:opacity 360ms ease, transform 360ms ease',
              'transform:translateY(-50%) scale(0.96)',
              'z-index:5'
            ].join(';');

            if (beat.prompt) {
              const promptEl = document.createElement('div');
              promptEl.style.cssText = [
                'font-size:11px', 'letter-spacing:2px',
                'color:rgba(244,230,255,0.7)', 'text-align:center',
                'margin-bottom:6px', 'text-transform:uppercase'
              ].join(';');
              promptEl.textContent = beat.prompt;
              choiceWrap.appendChild(promptEl);
            }

            const pickedId = await new Promise((resolve) => {
              opts.forEach((opt) => {
                const btn = document.createElement('button');
                btn.style.cssText = [
                  'padding:13px 16px',
                  'background:linear-gradient(180deg, rgba(50,32,80,0.95), rgba(34,22,60,0.95))',
                  'border:1px solid rgba(200,170,240,0.32)',
                  'color:#f4e6ff', 'font-family:inherit',
                  'font-size:14px', 'line-height:1.45',
                  'border-radius:14px', 'cursor:pointer',
                  'text-align:left',
                  'transition:background 0.18s, border-color 0.18s, transform 0.12s'
                ].join(';');
                btn.textContent = opt.text;
                btn.addEventListener('mouseenter', () => {
                  btn.style.background = 'linear-gradient(180deg, rgba(80,52,130,0.95), rgba(60,38,100,0.95))';
                  btn.style.borderColor = 'rgba(220,190,255,0.5)';
                });
                btn.addEventListener('mouseleave', () => {
                  btn.style.background = 'linear-gradient(180deg, rgba(50,32,80,0.95), rgba(34,22,60,0.95))';
                  btn.style.borderColor = 'rgba(200,170,240,0.32)';
                });
                btn.addEventListener('click', (e) => {
                  if (e && e.stopPropagation) e.stopPropagation();
                  resolve(opt.id);
                });
                btn.addEventListener('touchstart', (e) => {
                  if (e && e.stopPropagation) e.stopPropagation();
                }, { passive: true });
                choiceWrap.appendChild(btn);
              });
              n.root.appendChild(choiceWrap);
              // eslint-disable-next-line no-unused-expressions
              choiceWrap.offsetHeight;
              choiceWrap.style.opacity = '1';
              choiceWrap.style.transform = 'translateY(-50%) scale(1)';
            });

            // Fade out the choice card cleanly.
            choiceWrap.style.opacity = '0';
            choiceWrap.style.transform = 'translateY(-50%) scale(0.96)';
            await wait(360);
            try { choiceWrap.remove(); } catch (_) {}

            // Restore dialogue layer for any subsequent beats.
            n.dialogue.style.opacity = prevDialogueOpacity || '1';

            // Fire the onChoose hook with the selected id. Wrapped in
            // try/catch so a faulty hook doesn't kill the card.
            if (typeof beat.onChoose === 'function') {
              try { beat.onChoose(pickedId); } catch (e) { console.warn('[mscard] onChoose threw:', e); }
            }
            break;
          }
          default:
            break;
        }
      }
      // Ensure we fade out even if the card didn't include a 'hide' beat
      if (n.root.style.opacity !== '0') {
        n.root.style.pointerEvents = 'none';
        n.root.style.opacity = '0';
        await wait(560);
      }
    } catch (e) {
      console.warn('[premium-card] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _activeRoot = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  // ---------------------------------------------------------------
  // Sample card: Lyra · The Song Was For You
  REGISTRY['lyra_first_song'] = {
    id: 'lyra_first_song',
    title: 'MEMORY',
    subtitle: '01 \u00b7 The Song Was For You',
    speaker: 'LYRA',
    palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
    bg: 'assets/bg-siren-cave.png',
    beats: [
      { type: 'show',      pose: 'assets/lyra/body/casual1.png', wait: 700 },
      { type: 'line',      text: 'You came back.', hold: 1400, cps: 28 },
      { type: 'pose',      src: 'assets/lyra/body/casual2.png', animate: 'swap' },
      { type: 'line',      text: 'Listen. This one\u2019s for you.', hold: 1600, cps: 30 },
      { type: 'zoom',      amount: 1.12, duration: 2400 },
      { type: 'particles', count: 28, duration: 2000 },
      { type: 'flourish',  text: '\u266a', duration: 1600 },
      { type: 'line',      text: 'Don\u2019t tell anyone. It was just for you.', hold: 2400, cps: 28 },
      { type: 'hold',      ms: 800 },
      { type: 'hide' }
    ]
  };

  function register(id, card) { if (id && card) REGISTRY[id] = card; }
  function playSample(id, onDone) {
    const c = REGISTRY[id];
    if (!c) { console.warn('[premium-card] unknown card', id); if (onDone) onDone(); return; }
    show(c, onDone);
  }

  window.MSCard = { show, register, playSample, _registry: REGISTRY };
})();
