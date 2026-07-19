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

  // ── Per-character pose centring ─────────────────────────────────────────
  // Some character pose art is drawn off-centre inside its own canvas. Elian's
  // full-body poses sit ~6-7% left of the canvas midline (his cloak flares to
  // one side), and object-fit:contain centres the CANVAS, not the figure — so
  // he reads as off-centre in EVERY MSCard scene. Nudge the figure back to
  // centre, the same correction the care screen already applies to his sprite.
  // Keyed by a substring of the pose path; anyone not listed gets 0 (no change,
  // so other characters are untouched). Applied to the char WRAP via a CSS var
  // (`--char-shift`) — NOT the <img>, because the img runs the infinite ppBreath
  // animation, and a CSS animation always overrides an inline transform. The
  // wrap has no animation, so its transform is a safe place for the nudge.
  const POSE_SHIFT_X = [{ match: '/elian/', pct: 6.5 }];
  function poseShiftPct(src) {
    if (!src) return 0;
    for (const r of POSE_SHIFT_X) { if (src.indexOf(r.match) >= 0) return r.pct; }
    return 0;
  }
  function applyCharPose(n, src) {
    n.charImg.src = src;
    n._charShiftPct = poseShiftPct(src);
    if (n.charWrap) n.charWrap.style.setProperty('--char-shift', (n._charShiftPct || 0) + '%');
  }
  // Aug 2026 — clean early-exit support (for the chapter player's "‹" back
  // button). abort() sets _aborted; the beat loop checks it and breaks,
  // running the normal finally{} teardown exactly once (root removed,
  // _activeRoot cleared, onDone fired). _wakeSkip resolves the in-flight
  // beat's tap-to-skip race so the exit is near-instant, not after the
  // current beat's natural hold. Purely additive — no effect unless
  // abort() is called, so other MSCard consumers are untouched.
  let _aborted = false;
  let _wakeSkip = null;
  // When abort(true) is used (the chapter "‹" back button), the card tears
  // down WITHOUT firing onDone — so the chapter's `await runCard()` never
  // resolves and its completion logic (markDone, bond reward, setCurrent,
  // ceremonies) is skipped. Exiting a chapter must never count as finishing
  // it. The engine itself is still left clean for the next show().
  let _suppressOnDone = false;

  // ─────────────────────────────────────────────────────────────────
  // STRANGER RULE (Jun 2026)
  //
  // Narrative principle: the player should not see a character's name
  // until that character introduces themselves in dialogue. Before that,
  // the speaker label reads "STRANGER".
  //
  // How it works:
  //   1. KNOWN_CHARACTERS lists the 7 protagonist IDs.
  //   2. resolveSpeakerForDisplay(speaker, beat) is called from the
  //      'line' branch. It first checks beat.introduces — if present,
  //      it flips a sticky localStorage flag (pp_introduced_<id>=1)
  //      BEFORE rendering, so the line that contains the introduction
  //      itself reads as the real name ("ALISTAIR: I'm Alistair…").
  //   3. It then maps speaker → lowercased ID. If that ID is in
  //      KNOWN_CHARACTERS and the introduced flag isn't set, return
  //      "STRANGER". Otherwise return the original speaker untouched.
  //
  // Things that PASS THROUGH unchanged (never replaced with Stranger):
  //   - Empty speaker (narration mode handles itself)
  //   - 'YOU' (the player)
  //   - Soul Weaver / The Innkeeper / any non-protagonist label
  //   - A character whose pp_introduced_<id> flag is already set
  // ─────────────────────────────────────────────────────────────────
  const KNOWN_CHARACTERS = new Set([
    'alistair', 'lyra', 'caspian', 'lucien', 'elian', 'noir', 'proto'
  ]);

  function isIntroduced(charId) {
    try { return localStorage.getItem('pp_introduced_' + charId) === '1'; }
    catch (_) { return false; }
  }

  function markIntroduced(charId) {
    try { localStorage.setItem('pp_introduced_' + charId, '1'); } catch (_) {}
  }

  function speakerToCharId(speaker) {
    if (!speaker || typeof speaker !== 'string') return null;
    // Strip punctuation, lowercase, take first word — "ALISTAIR" → "alistair",
    // "Lucien," → "lucien", "ALISTAIR (low)" → "alistair"
    const id = String(speaker).toLowerCase().split(/\s+/)[0].replace(/[^a-z]/g, '');
    return id || null;
  }

  function resolveSpeakerForDisplay(speaker, beat) {
    // (a) If this beat IS the introduction, flip the flag first so the
    //     line shows the real name on the same beat it's introduced.
    if (beat && beat.introduces && typeof beat.introduces === 'string') {
      markIntroduced(beat.introduces);
    }
    // (b) Empty / falsy → narration. Pass through (the narration branch
    //     hides the speaker label entirely).
    if (!speaker) return speaker;
    // (c) Map → charId. If it's not one of the 7 protagonists, pass
    //     through (narrator names, player 'YOU', random NPCs).
    const charId = speakerToCharId(speaker);
    if (!charId || !KNOWN_CHARACTERS.has(charId)) return speaker;
    // (d) Known character — show "STRANGER" until introduced.
    return isIntroduced(charId) ? speaker : 'STRANGER';
  }

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
      /* Stage-direction styling: text wrapped in *Asterisks* in beat
         strings is narration (he turns / she sets the cup down), not
         spoken dialogue. Render it italic and dimmed so the player can
         tell at a glance which parts the character is saying out loud
         versus which parts are described action. The asterisks
         themselves are stripped — only the styling carries the cue. */
      .mscard-stage { font-style: italic; opacity: 0.62; }
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
    if (card.bg && /\.(mp4|webm)(\?|$)/i.test(card.bg)) {
      // Motion-CG background (Jul 2026): a video file in card.bg mounts a
      // muted looping <video> instead of a background-image. Opt-in purely
      // by file extension — image cards behave exactly as before.
      setBgVideo(bg, card.bg);
    } else if (card.bg) {
      const img = new Image();
      img.onload = () => {
        // A 150-byte / 1×1 placeholder loads OK (onload fires, NOT onerror) but
        // renders blank. Treat it as a miss and keep the themed palette gradient
        // rather than laying an empty image over the scene.
        if (img.naturalWidth <= 4 || img.naturalHeight <= 4) { bg.style.opacity = '1'; return; }
        bg.style.backgroundImage = `url(${card.bg})`;
        bg.style.opacity = '0.6';
      };
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
      'opacity:0', 'transform:translateX(var(--char-shift,0%)) translateY(18px) scale(0.97)',
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

    // Dialogue bottom panel — bubble. Narration vs spoken-dialogue bubble
    // styles are swapped at line-beat time (see line-handler below). Owner
    // feedback May 2026: narration bubble made MORE transparent so the
    // player can read at a glance whether someone is speaking or describing.
    const dialogue = el('div', [
      'position:absolute', 'left:6%', 'right:6%', 'bottom:6%',
      'padding:16px 20px', 'border-radius:18px',
      'background:rgba(10,6,22,0.78)', 'backdrop-filter:blur(6px)',
      `color:${pal.accent || '#f4e6ff'}`, 'font-size:17px', 'line-height:1.45',
      'box-shadow:0 6px 28px rgba(0,0,0,0.55)', 'min-height:64px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 500ms ease, transform 500ms ease, background-color 380ms ease, box-shadow 380ms ease',
      'pointer-events:none'
    ].join(';'));
    dialogue.id = 'mscard-dialogue';
    const speaker = el('div', 'font-size:11px;letter-spacing:2px;opacity:0.65;margin-bottom:6px;transition:opacity 220ms ease, color 220ms ease, border-color 220ms ease;', card.speaker || '');
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

  // ---------------------------------------------------------------
  // Motion-CG helper (Jul 2026): mount/clear a looping video inside the
  // #mscard-bg layer. url=null clears back to the palette gradient.
  // Autoplay is safe: muted + playsinline, and cards only open from a
  // user tap. On any error the palette gradient stays — same graceful
  // fallback contract as the image path above.
  function setBgVideo(bg, url) {
    const old = bg.querySelector('video');
    if (old) { try { old.pause(); } catch (_) {} old.remove(); }
    if (!url) {
      bg.style.backgroundImage = '';
      bg.style.opacity = '1';
      return;
    }
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.autoplay = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    v.src = url;
    bg.style.backgroundImage = '';
    bg.style.opacity = '0';
    v.addEventListener('canplay', () => { bg.style.opacity = '0.85'; }, { once: true });
    v.addEventListener('error', () => { v.remove(); bg.style.opacity = '1'; }, { once: true });
    bg.appendChild(v);
    try { const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {}
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
  // VN CONTROL BAR (Jul 2026 playtest fix) — Exit / Auto / History on
  // every card, Skip only when the card is a REPLAY (card._skippable,
  // set by chapters.js runCard for already-completed chapters — the
  // owner's rule: no skipping a chapter the player hasn't read once).
  // All buttons stopPropagation so control taps never advance beats.
  const AUTO_KEY = 'pp_vn_auto';
  function buildVNControls(n, card, hooks) {
    const mk = (label, title) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.title = title;
      b.style.cssText = [
        'pointer-events:auto', 'min-width:34px', 'height:30px', 'padding:0 10px',
        'border-radius:999px', 'border:1px solid rgba(232,200,138,0.4)',
        'background:rgba(10,6,22,0.62)', 'color:rgba(244,235,220,0.88)',
        'font-family:Quicksand,Inter,sans-serif', 'font-size:11px', 'font-weight:600',
        'letter-spacing:0.08em', 'cursor:pointer', 'backdrop-filter:blur(4px)',
        '-webkit-backdrop-filter:blur(4px)'
      ].join(';');
      const eat = (e) => { e.stopPropagation(); };
      b.addEventListener('touchstart', eat, { passive: true });
      return b;
    };

    // Exit — top-left
    const exitBtn = mk('✕', 'Leave this scene');
    exitBtn.style.position = 'absolute';
    exitBtn.style.top = 'calc(10px + env(safe-area-inset-top, 0px))';
    exitBtn.style.left = '10px';
    exitBtn.style.zIndex = '30';
    exitBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // inline two-tap confirm: first tap arms, second leaves.
      if (!exitBtn._armed) {
        exitBtn._armed = true;
        exitBtn.textContent = 'Leave?';
        exitBtn.style.background = 'linear-gradient(180deg,#9A2F4E,#7A1224)';
        setTimeout(() => {
          if (!exitBtn._armed) return;
          exitBtn._armed = false;
          exitBtn.textContent = '✕';
          exitBtn.style.background = 'rgba(10,6,22,0.62)';
        }, 3200);
        return;
      }
      hooks.onExit();
    });
    n.root.appendChild(exitBtn);

    // Right-side cluster: [SKIP] [AUTO] [LOG]
    const bar = document.createElement('div');
    bar.style.cssText = [
      'position:absolute', 'top:calc(10px + env(safe-area-inset-top, 0px))', 'right:10px',
      'display:flex', 'gap:6px', 'z-index:30', 'pointer-events:none'
    ].join(';');

    let skipBtn = null;
    if (card._skippable) {
      skipBtn = mk('⏩', 'Fast-forward (already read)');
      skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const on = hooks.toggleSkip();
        skipBtn.style.background = on ? 'linear-gradient(180deg,#8E1E33,#5A0E1F)' : 'rgba(10,6,22,0.62)';
        skipBtn.style.color = on ? '#FFEFF5' : 'rgba(244,235,220,0.88)';
      });
      bar.appendChild(skipBtn);
    }

    const autoBtn = mk('A', 'Auto-advance lines');
    // Compact circle instead of the wide "AUTO" pill (owner: "just put letter
    // A and make it in smaller circle"). Same 30px height as its neighbours so
    // the control row stays aligned; border-radius:999px + square = circle.
    autoBtn.style.minWidth = '30px';
    autoBtn.style.width = '30px';
    autoBtn.style.padding = '0';
    autoBtn.style.fontSize = '13px';
    autoBtn.style.fontWeight = '700';
    autoBtn.style.display = 'inline-flex';
    autoBtn.style.alignItems = 'center';
    autoBtn.style.justifyContent = 'center';
    const paintAuto = () => {
      const on = localStorage.getItem(AUTO_KEY) === '1';
      autoBtn.style.background = on ? 'linear-gradient(180deg,#C46A8D,#7A2B4D)' : 'rgba(10,6,22,0.62)';
      autoBtn.style.color = on ? '#FFF6FA' : 'rgba(244,235,220,0.88)';
    };
    autoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const on = localStorage.getItem(AUTO_KEY) === '1';
      try { localStorage.setItem(AUTO_KEY, on ? '0' : '1'); } catch (_) {}
      paintAuto();
      hooks.onAutoToggle();
    });
    paintAuto();
    bar.appendChild(autoBtn);

    const logBtn = mk('📜', 'Story so far');
    logBtn.addEventListener('click', (e) => { e.stopPropagation(); openLog(); });
    bar.appendChild(logBtn);
    n.root.appendChild(bar);

    // History overlay — scrollable backlog of every line shown this card.
    function openLog() {
      let ov = n.root.querySelector('.mscard-log');
      if (ov) { ov.remove(); return; }   // toggle
      ov = document.createElement('div');
      ov.className = 'mscard-log';
      ov.style.cssText = [
        'position:absolute', 'inset:0', 'z-index:40',
        'background:rgba(5,3,12,0.92)', 'backdrop-filter:blur(6px)',
        '-webkit-backdrop-filter:blur(6px)',
        'display:flex', 'flex-direction:column', 'padding:52px 18px 20px'
      ].join(';');
      const title = document.createElement('div');
      title.textContent = 'THE STORY SO FAR';
      title.style.cssText = 'font-family:Quicksand,Inter,sans-serif;font-size:11px;letter-spacing:0.3em;color:rgba(232,200,138,0.8);text-align:center;margin-bottom:14px;';
      ov.appendChild(title);
      const list = document.createElement('div');
      list.style.cssText = 'flex:1;overflow-y:auto;scrollbar-width:none;-ms-overflow-style:none;padding:0 4px;';
      const sheet = document.createElement('style');
      sheet.textContent = '.mscard-log ::-webkit-scrollbar{display:none;}';
      ov.appendChild(sheet);
      hooks.history().forEach((h) => {
        const row = document.createElement('div');
        row.style.cssText = 'margin-bottom:12px;font-family:"Cormorant Garamond",serif;font-size:15px;line-height:1.5;color:rgba(232,200,220,0.9);';
        const clean = String(h.t || '').replace(/\*/g, '');
        row.innerHTML = h.s
          ? '<div style="font-size:10px;letter-spacing:0.18em;color:rgba(232,200,138,0.75);font-family:Quicksand,sans-serif;margin-bottom:2px;">' + h.s + '</div>' + clean
          : '<em style="opacity:0.8;">' + clean + '</em>';
        list.appendChild(row);
      });
      ov.appendChild(list);
      const closeRow = document.createElement('div');
      closeRow.textContent = 'tap to close';
      closeRow.style.cssText = 'text-align:center;font-family:Quicksand,sans-serif;font-size:10px;letter-spacing:0.2em;color:rgba(244,235,220,0.4);margin-top:10px;';
      ov.appendChild(closeRow);
      ov.addEventListener('click', (e) => { e.stopPropagation(); ov.remove(); });
      ov.addEventListener('touchstart', (e) => { e.stopPropagation(); }, { passive: true });
      n.root.appendChild(ov);
      list.scrollTop = list.scrollHeight;
    }

    return {
      isAuto: () => localStorage.getItem(AUTO_KEY) === '1',
      teardown: () => { try { exitBtn.remove(); bar.remove(); } catch (_) {} }
    };
  }

  // ---------------------------------------------------------------
  async function show(card, onDone) {
    if (_activeRoot) { try { onDone && onDone(); } catch (_) {} return; }
    if (!card || !Array.isArray(card.beats)) {
      console.warn('[premium-card] invalid card data');
      try { onDone && onDone(); } catch (_) {}
      return;
    }

    // STRANGER RULE — Reset any introduction this card itself contains
    // so the discovery moment re-plays on every replay. Cross-chapter
    // flags stay sticky (e.g. replaying Ch3 does NOT regress Alistair
    // back to STRANGER because Ch3 doesn't contain an `introduces:`
    // beat for him).
    try {
      const cleared = new Set();
      for (const b of card.beats) {
        if (b && b.introduces && typeof b.introduces === 'string' && !cleared.has(b.introduces)) {
          localStorage.removeItem('pp_introduced_' + b.introduces);
          cleared.add(b.introduces);
        }
      }
    } catch (_) {}

    const pal = card.palette || {};
    const n = buildShell(card);
    _activeRoot = n.root;
    _aborted = false;
    _suppressOnDone = false;
    document.body.appendChild(n.root);

    // ── VN controls state (Jul 2026) ──
    let _skipFast = false;          // replay fast-forward latch
    const _history = [];            // every line shown this card, for the 📜 log
    // ── Choice memory (Jul 2026 — chapter agency pass) ──
    // A choice beat with `key` stores its picked option id here; a later
    // line beat with `variants: {key, map}` renders the text for the
    // player's pick. Card-scoped: replays re-ask.
    const _choices = {};
    const vn = buildVNControls(n, card, {
      onExit: () => {
        // Silent abort: never counts as completing the card. If this card
        // is a chapter, land the player back on the chapter menu.
        const isChapter = /^chp_/.test(String(card.id || ''));
        abort(true);
        setTimeout(() => {
          try { document.body.classList.remove('pp-chapter-active'); } catch (_) {}
          if (isChapter && window.MSChapters && typeof window.MSChapters.open === 'function') {
            try { window.MSChapters.open(); } catch (_) {}
          }
        }, 120);
      },
      toggleSkip: () => { _skipFast = !_skipFast; if (_skipFast && _wakeSkip) _wakeSkip(); return _skipFast; },
      onAutoToggle: () => { if (localStorage.getItem(AUTO_KEY) === '1' && _wakeSkip) _wakeSkip(); },
      history: () => _history
    });

    // Tap-to-skip: each beat gets a fresh "skip" promise that resolves the
    // moment the player taps anywhere on the card. Beats that use waitS()
    // or typeToS() race against it, so taps feel like "advance now."
    let skipResolve = null;
    let skipPromise = new Promise(res => { skipResolve = res; });
    const resetSkip = () => { skipPromise = new Promise(res => { skipResolve = res; }); };
    const onSkip = () => { if (skipResolve) { const r = skipResolve; skipResolve = null; r(); } };
    n.root.addEventListener('click', onSkip);
    n.root.addEventListener('touchstart', onSkip, { passive: true });
    _wakeSkip = onSkip; // lets abort() resolve the current beat's skip race

    // Race helpers: returns immediately when either the timer or a tap
    // fires. After each beat we reset the skip promise so the next tap
    // can fire again.
    const waitS = async (ms) => {
      if (_aborted) return;
      // Replay fast-forward: collapse every hold to a blink.
      await Promise.race([wait(_skipFast ? Math.min(ms || 0, 60) : ms), skipPromise]);
      resetSkip();
    };
    const typeToS = async (target, text, cps) => {
      // {name} substitution — MSCard beats with {name} tokens (chapters.js,
      // affection-scenes.js midnight scenes) need the player's name swapped
      // in. PPApplyName lives in dialogue.js and is a no-op without the token.
      if (text && window.PPApplyName) text = window.PPApplyName(text);

      // Stage-direction parsing (May 2026 owner feedback): scenes felt
      // monologue-y because *Asterisk-wrapped* narration rendered identical
      // to spoken dialogue. Now: split the text on asterisks into segments,
      // each marked italic or regular. Italic segments render in <em> with
      // the .mscard-stage class (dimmed + italic). Asterisks are stripped.
      // Unbalanced asterisks (one without a closing pair) gracefully fall
      // back to regular styling so malformed beats don't quietly italicise
      // everything to end-of-line.
      const segments = [];
      {
        let buf = '';
        let inItalic = false;
        const txt = text || '';
        for (let k = 0; k < txt.length; k++) {
          if (txt[k] === '*') {
            if (buf) segments.push({ italic: inItalic, text: buf });
            buf = '';
            inItalic = !inItalic;
          } else {
            buf += txt[k];
          }
        }
        if (buf) segments.push({ italic: inItalic, text: buf });
        // If we ended in italic mode the asterisks were unbalanced — convert
        // the trailing segment back to regular so the rest of the line does
        // not silently italicise.
        if (inItalic && segments.length > 0) {
          segments[segments.length - 1].italic = false;
        }
      }

      target.innerHTML = '';
      const spans = segments.map(seg => {
        const tag = seg.italic ? 'em' : 'span';
        const elNode = document.createElement(tag);
        if (seg.italic) elNode.className = 'mscard-stage';
        target.appendChild(elNode);
        return elNode;
      });
      const totalLen = segments.reduce((sum, s) => sum + s.text.length, 0);
      const fillAll = () => {
        for (let s = 0; s < segments.length; s++) spans[s].textContent = segments[s].text;
      };
      // Edge case: text is empty (or only asterisks). Nothing to type.
      if (totalLen === 0) { fillAll(); resetSkip(); return; }
      // Replay fast-forward: no typewriter, the full line lands at once.
      if (_skipFast) { fillAll(); resetSkip(); return; }

      const speed = Math.max(14, Math.round(1000 / (cps || 32)));
      let i = 0;
      let cancelled = false;
      const tick = new Promise(resolve => {
        const step = () => {
          if (cancelled) { fillAll(); resolve(); return; }
          if (i < totalLen) {
            // Map global char index `i` to the right segment + offset.
            let remaining = i;
            for (let s = 0; s < segments.length; s++) {
              if (remaining < segments[s].text.length) {
                spans[s].textContent = segments[s].text.substring(0, remaining + 1);
                break;
              }
              remaining -= segments[s].text.length;
            }
            i++;
            setTimeout(step, speed);
          } else {
            resolve();
          }
        };
        step();
      });
      // If tap fires while typing, instantly complete the text.
      const raced = skipPromise.then(() => { cancelled = true; fillAll(); });
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
        if (_aborted) break;
        switch (beat.type) {
          case 'show': {
            if (beat.pose) {
              applyCharPose(n, beat.pose);
              n.charWrap.style.opacity = '1';
              n.charWrap.style.transform = 'translateX(var(--char-shift,0%)) translateY(0) scale(1)';
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
            // Cinematic full-bleed dialogue (no bubble, centered text)
            // is opt-in via card.cinematic = true. Only the world
            // prologue chapter ('A Kingdom Fades') uses it. Bridges,
            // Arrival, and other narration beats keep the standard
            // bubble look they always had.
            if (card.cinematic) {
              n.dialogue.style.background = 'transparent';
              n.dialogue.style.backdropFilter = 'none';
              n.dialogue.style.boxShadow = 'none';
              n.dialogue.style.padding = '0 8%';
              n.dialogue.style.borderRadius = '0';
              n.dialogue.style.fontSize = '20px';
              n.dialogue.style.lineHeight = '1.5';
              n.dialogue.style.textAlign = 'center';
              n.dialogue.style.left = '0';
              n.dialogue.style.right = '0';
              n.dialogue.style.top = '50%';
              n.dialogue.style.bottom = 'auto';
              n.dialogue.style.transform = 'translateY(-50%)';
            }
            await waitS(beat.wait || 600);
            n.dialogue.style.opacity = '1';
            if (!card.cinematic) {
              n.dialogue.style.transform = 'translateY(0)';
            }
            break;
          }
          case 'bg': {
            // Motion-CG background swap mid-card (Jul 2026). Opt-in:
            //   { type:'bg', url:'assets/motion/x.mp4' }  → looping video scene
            //   { type:'bg', url:'assets/x.png' }         → still image scene
            //   { type:'bg', url:null }                   → back to palette gradient
            // Cards that never use this beat are untouched.
            if (beat.url && /\.(mp4|webm)(\?|$)/i.test(beat.url)) {
              setBgVideo(n.bg, beat.url);
            } else if (beat.url) {
              setBgVideo(n.bg, null);
              n.bg.style.backgroundImage = `url(${beat.url})`;
              n.bg.style.opacity = '0.6';
            } else {
              setBgVideo(n.bg, null);
            }
            await waitS(beat.wait || 0);
            break;
          }
          case 'pose': {
            if (beat.src) {
              // Reset any prior fallback styling (left over from a 404 on
              // an earlier pose). Without this, once charFallback() fired
              // the image stays opacity:0 forever and the character is
              // invisible for the rest of the card. Bug spotted May 2026.
              n.charImg.style.opacity = '';
              const charWrap = n.charImg.parentNode;
              if (charWrap) {
                charWrap.style.background = '';
                charWrap.style.minHeight = '';
              }
              n.charImg.classList.remove('mscard-poseSwap');
              // trigger reflow so animation can restart
              void n.charImg.offsetWidth;
              applyCharPose(n, beat.src);
              if (beat.animate === 'swap') n.charImg.classList.add('mscard-poseSwap');
            }
            await waitS(beat.wait || 380);
            break;
          }
          case 'line': {
            // Per-beat audio cue (Jun 2026 — First 10 Min audit Sprint 3
            // item #8). Author can attach `sfx: 'chime'` or
            // `sfx: 'crystal-resonance'` to any line beat to drop a
            // single sound at the moment the line begins typing.
            //   - String → looks for window.sounds[name]() first, then
            //     falls back to playing assets/audio/<name>.mp3 directly
            //     via sounds._playFile() at a moderate volume.
            //   - Object → { name, volume } for finer control.
            // Wrapped in try so a bad cue can never block the beat.
            if (beat.sfx) {
              try {
                const _cue = (typeof beat.sfx === 'string')
                  ? { name: beat.sfx, volume: 0.55 }
                  : beat.sfx;
                if (_cue && _cue.name) {
                  if (window.sounds && typeof window.sounds[_cue.name] === 'function') {
                    window.sounds[_cue.name]();
                  } else if (window.sounds && typeof window.sounds._playFile === 'function') {
                    window.sounds._playFile('assets/audio/' + _cue.name + '.mp3', _cue.volume ?? 0.55);
                  } else {
                    const _au = new Audio('assets/audio/' + _cue.name + '.mp3');
                    _au.volume = _cue.volume ?? 0.55;
                    _au.play().catch(function () {});
                  }
                }
              } catch (_) {}
            }
            // Per-beat speaker override. Used by bridges that mix narration
            // and character speech in the same card. When beat.speaker is
            // explicitly an empty string, render in italic narration mode
            // with no speaker label. When non-empty, replace the speaker
            // label. When undefined, leave the card-level speaker intact.
            // Resolve which "speaker" to apply for this beat.
            //   - Bridges: each beat sets `speaker` explicitly (per-beat
            //     narration / dialogue switching).
            //   - Chapters: card-level `speaker` is set ONCE and most beats
            //     don't override. Beats inherit the card-level speaker
            //     unless they explicitly set `speaker: ''` to mark a
            //     narration beat. Without this fallback, chapter beats with
            //     no per-beat speaker would skip the styling block entirely
            //     and the bubble would stay in whatever mode the previous
            //     beat left it — wrong for chapters that mix one narration
            //     beat into a long dialogue scene.
            const rawResolvedSpeaker = (beat.speaker !== undefined)
              ? beat.speaker
              : (card.speaker || '');
            // STRANGER RULE — see header. If this beat introduces a
            // character, the flag flips here so the line itself reads
            // as the real name; subsequent beats inherit naturally.
            const resolvedSpeaker = resolveSpeakerForDisplay(rawResolvedSpeaker, beat);
            if (n.speaker) {
              if (resolvedSpeaker === '') {
                // ── NARRATION mode ──
                // Owner feedback May 2026: make narration visually distinct
                // from spoken dialogue. Bubble drops to ~30% opacity (so the
                // background scene reads through), no speaker label, italic
                // text. Player should know at a glance: nobody is talking,
                // this is description.
                //
                // (v501 defensive fix) Explicitly CLEAR speaker.textContent
                // when entering narration mode. Without this, a previous
                // dialogue beat's label (e.g. 'ALISTAIR') stays in the DOM
                // even though it's hidden via opacity:0 + height:0. Visually
                // fine in modern Chrome, but innerText audits surface it as
                // ghost text, and screen-readers / accessibility tools can
                // pick it up. Clearing the textContent keeps the DOM honest.
                n.speaker.textContent = '';
                n.speaker.style.opacity = '0';
                n.speaker.style.height = '0';
                n.speaker.style.marginBottom = '0';
                n.speaker.style.overflow = 'hidden';
                n.speaker.style.borderBottom = '';
                n.speaker.style.paddingBottom = '';
                n.speaker.style.display = '';
                n.line.style.fontStyle = 'italic';
                n.line.style.opacity = '0.92';
                n.dialogue.style.background = 'rgba(10,6,22,0.32)';
                n.dialogue.style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)';
                // Reset alignment when going to narration.
                n.dialogue.style.textAlign = 'left';
                n.line.style.textAlign = 'left';
              } else {
                // ── DIALOGUE mode ──
                // Speaker label gets a colored underline matching the card's
                // palette glow (per-character hue) and a brighter accent
                // color so it pops. Bubble goes opaque so the spoken line
                // reads as a panel, not an overlay. Player ('YOU') gets the
                // soft-pink hue from the global PPSpeakerHue table and the
                // speaker label aligns RIGHT (visual signal that the player
                // is speaking, not a character).
                const isPlayer = String(resolvedSpeaker).toLowerCase().split(/\s+/)[0].replace(/[^a-z]/g, '') === 'you';
                const playerHue = '#ffb6c1';
                const speakerColor = isPlayer
                    ? playerHue
                    : (pal.glow || pal.accent || '#f4e6ff');
                const underlineColor = isPlayer
                    ? playerHue
                    : (pal.glow || pal.accent || '#a98ad8');
                n.speaker.textContent = resolvedSpeaker;
                n.speaker.style.opacity = '1';
                n.speaker.style.height = '';
                n.speaker.style.marginBottom = '8px';
                n.speaker.style.overflow = '';
                n.speaker.style.color = speakerColor;
                n.speaker.style.borderBottom = '2px solid ' + underlineColor;
                n.speaker.style.paddingBottom = '4px';
                n.speaker.style.display = 'inline-block';
                n.line.style.fontStyle = 'normal';
                n.line.style.opacity = '1';
                n.dialogue.style.background = 'rgba(10,6,22,0.88)';
                n.dialogue.style.boxShadow = '0 6px 28px rgba(0,0,0,0.55)';
                n.dialogue.style.textAlign = isPlayer ? 'right' : 'left';
                n.line.style.textAlign = 'left';
              }
            }
            // Variant line (Jul 2026 chapter-agency pass): render the text
            // matching an earlier choice's picked id. Falls back to the
            // first map entry so a missing/aborted pick can never blank
            // the line.
            let beatText = beat.text || '';
            if (beat.variants && beat.variants.key && beat.variants.map) {
              const pick = _choices[beat.variants.key];
              beatText = beat.variants.map[pick]
                || beat.variants.map[Object.keys(beat.variants.map)[0]]
                || beatText;
            }
            // 📜 backlog — record every line as it is shown (Jul 2026).
            _history.push({ s: resolvedSpeaker || '', t: beatText });
            await typeToS(n.line, beatText, beat.cps || 32);
            // BULLETPROOF tap-to-advance. Don't reuse skipPromise — it can
            // be racing with stale state from the typewriter phase. Register
            // a brand-new one-shot tap listener and wait for it. The first
            // tap (during typing) completes the typewriter via the existing
            // skip system; this fresh listener requires ANOTHER, separate tap
            // before the next beat fires. No timer. No auto-advance ever.
            //
            // PLUS a MutationObserver watching for root removal — if
            // _switchToSelect (or any other code) yanks the card out of the
            // DOM mid-beat, the Promise must resolve so the for-loop exits
            // and the chapter's onDone fires. Without this, force-removed
            // cards leave the chapter half-played: markDone() never runs,
            // chain doesn't advance, save state is corrupt. Fixed May 2026.
            await new Promise((resolve) => {
              let done = false;
              let flagPoll = null;
              let autoTimer = null;
              const finish = () => {
                if (done) return;
                done = true;
                n.root.removeEventListener('click', tap);
                n.root.removeEventListener('touchstart', tap);
                if (removalObserver) try { removalObserver.disconnect(); } catch (_) {}
                if (flagPoll) clearInterval(flagPoll);
                if (autoTimer) clearTimeout(autoTimer);
                resolve();
              };
              const tap = (e) => {
                if (e && e.stopPropagation) e.stopPropagation();
                finish();
              };
              n.root.addEventListener('click', tap);
              n.root.addEventListener('touchstart', tap, { passive: true });
              // ── AUTO / SKIP advance (Jul 2026) ──
              // Skip (replay fast-forward): advance almost immediately.
              // Auto: advance after the beat's authored hold (floored so a
              // line is never yanked away unread). Both still yield to a
              // manual tap, and a mid-wait toggle is caught by the poll.
              const armTimers = () => {
                if (done) return;
                if (_skipFast) {
                  if (!autoTimer) autoTimer = setTimeout(finish, 90);
                } else if (vn.isAuto()) {
                  if (!autoTimer) autoTimer = setTimeout(finish, Math.max(1100, beat.hold || 2400));
                } else if (autoTimer) {
                  // mode toggled OFF mid-wait — cancel the pending advance
                  clearTimeout(autoTimer); autoTimer = null;
                }
              };
              armTimers();
              flagPoll = setInterval(armTimers, 200);
              // Watch the parent (or document.body) for our root being removed.
              let removalObserver = null;
              try {
                const parent = n.root.parentNode || document.body;
                removalObserver = new MutationObserver(() => {
                  if (!document.body.contains(n.root)) finish();
                });
                removalObserver.observe(parent, { childList: true });
              } catch (_) { /* MutationObserver missing — fall back to tap-only */ }
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
            const ftext = beat.text || '';
            n.flourish.textContent = (window.PPApplyName ? window.PPApplyName(ftext) : ftext);
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
            // A choice always interrupts fast-forward — the player decides,
            // never the skip latch (standard VN contract).
            _skipFast = false;
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
              'border:1px solid rgba(212,168,91,0.30)',
              'border-radius:18px',
              'box-shadow:0 12px 40px rgba(0,0,0,0.65), 0 0 22px rgba(212,168,91,0.14) inset',
              'backdrop-filter:blur(8px)',
              'opacity:0', 'transition:opacity 360ms ease, transform 360ms ease',
              'transform:translateY(-50%) scale(0.96)',
              'z-index:5'
            ].join(';');

            if (beat.prompt) {
              const promptEl = document.createElement('div');
              promptEl.style.cssText = [
                'font-size:11px', 'letter-spacing:2px',
                'color:rgba(212,168,91,0.85)', 'text-align:center',
                'margin-bottom:6px', 'text-transform:uppercase'
              ].join(';');
              promptEl.textContent = beat.prompt;
              choiceWrap.appendChild(promptEl);
            }

            const pickedId = await new Promise((resolve) => {
              opts.forEach((opt) => {
                const btn = document.createElement('button');
                btn.style.cssText = [
                  'padding:15px 17px',
                  'background:linear-gradient(180deg, rgba(212,168,91,0.12), rgba(212,168,91,0.04))',
                  'border:1px solid rgba(212,168,91,0.32)',
                  'color:#F4ECDC', 'font-family:inherit',
                  'font-size:15px', 'line-height:1.4',
                  'border-radius:14px', 'cursor:pointer',
                  'text-align:left',
                  'box-shadow:inset 0 1px 0 rgba(255,255,255,0.05)',
                  'transition:background 0.2s, border-color 0.2s, transform 0.1s'
                ].join(';');
                btn.textContent = opt.text;
                btn.addEventListener('mouseenter', () => {
                  btn.style.background = 'linear-gradient(180deg, rgba(212,168,91,0.24), rgba(212,168,91,0.10))';
                  btn.style.borderColor = 'rgba(212,168,91,0.65)';
                });
                btn.addEventListener('mouseleave', () => {
                  btn.style.background = 'linear-gradient(180deg, rgba(212,168,91,0.12), rgba(212,168,91,0.04))';
                  btn.style.borderColor = 'rgba(212,168,91,0.32)';
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

            // Remember the pick for later `variants` lines (Jul 2026).
            if (beat.key) _choices[beat.key] = pickedId;

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
      // Ensure we fade out even if the card didn't include a 'hide' beat.
      // On abort (back button) skip the 560ms fade so the exit is instant
      // and the card doesn't linger over the reopening chapter list.
      if (!_aborted && n.root.style.opacity !== '0') {
        n.root.style.pointerEvents = 'none';
        n.root.style.opacity = '0';
        await wait(560);
      }
    } catch (e) {
      console.warn('[premium-card] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      const suppressed = _suppressOnDone;
      _activeRoot = null;
      _aborted = false;
      _suppressOnDone = false;
      _wakeSkip = null;
      if (onDone && !suppressed) { try { onDone(); } catch (_) {} }
    }
  }

  // End the card that is currently playing. The beat loop breaks and the
  // finally{} teardown runs once (root removed, engine reset).
  //   abort()      → fires onDone (as if the card finished naturally)
  //   abort(true)  → SILENT: does NOT fire onDone. Used by the chapter
  //                  player's "‹" back button so exiting never counts as
  //                  completing the chapter. No-op when idle.
  function abort(silent) {
    if (!_activeRoot) return false;
    _aborted = true;
    _suppressOnDone = !!silent;
    const root = _activeRoot;
    // Wake a waitS/typeToS-based beat...
    try { if (_wakeSkip) _wakeSkip(); } catch (_) {}
    // ...and force the card out of the DOM. The 'line' beat parks the loop
    // on a tap-to-advance Promise that resolves ONLY on a tap inside the
    // card or on the root being removed (its MutationObserver). The back
    // button lives outside the card, so removal is what unblocks the loop —
    // it then hits `if (_aborted) break` and the finally{} teardown runs
    // (onDone suppressed when silent). Removing here also makes the exit
    // instant rather than waiting out the current beat's hold.
    try { if (root && root.parentNode) root.remove(); } catch (_) {}
    return true;
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

  window.MSCard = { show, register, playSample, abort, _registry: REGISTRY };
})();
