/* crossover-weavers-court.js — "The Weaver's Court"
 * --------------------------------------------------------------------------
 * Registers window.MSCrossWeaversCourt.
 *
 * THE ENSEMBLE CLIMAX. Aenor is coming for the Weaver tonight. All seven
 * suitors are here. Each gets one line. The player chooses who stands in
 * front \u2014 who speaks for her when the queen arrives.
 *
 * Structure: instead of side-by-side sprites, the scene ROTATES through
 * each character one at a time. Each steps forward, speaks their line,
 * steps back. Then the player chooses.
 *
 * The chosen character's ID is written to pp_weaver_champion \u2014 this
 * flag can gate future cinematics, ending branches, and the Aenor
 * confrontation (when written). This scene is the doorway to the
 * final-act battle.
 *
 * TRIGGER CONDITIONS:
 *   - Main-story route enabled
 *   - Aenor has arrived (Chapter 13 done)
 *   - Weaver identity has been revealed (pp_weaver_revealed = '1')
 *   - At LEAST four of the seven characters are met (the court needs
 *     enough members to feel like a court)
 *   - Game is idle
 *   - pp_cross_weavers_court_seen != '1'
 *
 * FLAGS WRITTEN:
 *   - pp_cross_weavers_court_seen = '1' (never replays)
 *   - pp_weaver_champion = 'alistair'|'elian'|'lyra'|'caspian'|'lucien'|'noir'|'proto'
 *
 * VOICE DIRECTION FOR EACH:
 *   Every character is in their finest form here. Each delivers ONE
 *   LINE that distills their love for the Weaver. Not a speech. One
 *   line. The tightest one each voice has.
 *
 *   The player chooses who goes first into the dark. It is not about
 *   who "wins" the romance \u2014 it is about who the player trusts to
 *   speak for her at the moment the queen arrives.
 */

(function () {
  'use strict';

  const FLAG_ROUTE    = 'pp_main_story_enabled';
  const FLAG_SEEN     = 'pp_cross_weavers_court_seen';
  const FLAG_CH13     = 'pp_chapter_done_13';
  const FLAG_WEAVER   = 'pp_weaver_revealed';
  const FLAG_CHAMPION = 'pp_weaver_champion';
  const POLL_MS       = 28000;

  // Each character: their sprite, their one line, their palette glow
  const COURT = [
    { id: 'alistair', name: 'ALISTAIR',
      pose: 'assets/alistair/body/casual.png',
      glow: 'rgba(255,210,140,0.35)',
      line: 'I have guarded this kingdom for my whole life. \u2014 Tonight I guard only you. \u2014 The oath is still the oath. \u2014 It just finally has a face.'
    },
    { id: 'elian', name: 'ELIAN',
      pose: 'assets/elian/body/calm.png',
      glow: 'rgba(140,190,140,0.35)',
      line: 'The Thornwood opens for you. \u2014 I open for you. \u2014 Whatever comes through that door, it will come through me first. \u2014 Do not argue.'
    },
    { id: 'lyra', name: 'LYRA',
      pose: 'assets/lyra/body/casual1.png',
      glow: 'rgba(120,210,230,0.35)',
      line: 'My mother taught me one true thing before she died. \u2014 \u201cProtect the Weaver.\u201d \u2014 I thought it was a story. \u2014 It was instructions. \u2014 I am ready to follow them.'
    },
    { id: 'caspian', name: 'CASPIAN',
      pose: 'assets/caspian/body/casual1.png',
      glow: 'rgba(230,160,210,0.35)',
      line: 'My grandmother raised me to do the right thing for Aethermoor. \u2014 I have spent the last year doing the right thing for YOU. \u2014 She would call it treason. \u2014 I call it the first thing I have ever chosen.'
    },
    { id: 'lucien', name: 'LUCIEN',
      pose: 'assets/lucien/body/casual1.png',
      glow: 'rgba(200,170,240,0.35)',
      line: 'I have been writing your name in the margins of every book for months. \u2014 The Dynasty has a lie for every truth. \u2014 I intend to publish a truth for every one of her lies. \u2014 I have started with yours.'
    },
    { id: 'noir', name: 'NOIR',
      pose: 'assets/noir/body/casual1.png',
      glow: 'rgba(160,90,200,0.35)',
      line: 'I have watched her eat five of your kind from inside the stone. \u2014 I could do nothing. \u2014 Tonight I am not inside the stone. \u2014 \u2026Mm. \u2014 She will find that inconvenient.'
    },
    { id: 'proto', name: 'PROTO',
      pose: 'assets/proto/body/calm.png',
      glow: 'rgba(100,200,240,0.35)',
      line: 'you\u2019re the seventh. i\u2019m the sixth. the five before me are all in here with me right now. they say hi. they say GO. they say weavers do not go quietly. i am going loud with you.'
    }
  ];

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

  function build() {
    const root = el('div', [
      'position:fixed', 'inset:0', 'z-index:10000',
      'background:#040408', 'overflow:hidden',
      'opacity:0', 'transition:opacity 600ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #1a1a2a 0%, #02020a 85%)'
    ].join(';'));
    root.appendChild(bg);

    // The queen's approaching presence \u2014 a pale horizon glow at the top
    if (!document.getElementById('ms-keyframes-court')) {
      const kf = document.createElement('style');
      kf.id = 'ms-keyframes-court';
      kf.textContent = `
        @keyframes courtApproach {
          0%,100% { opacity: 0.20; }
          50%     { opacity: 0.45; }
        }
        @keyframes courtFlareIn {
          0%   { opacity: 0; filter: blur(12px); transform: translateY(12px) scale(0.96); }
          100% { opacity: 1; filter: blur(0);    transform: translateY(0)   scale(1); }
        }
      `;
      document.head.appendChild(kf);
    }
    const horizon = el('div', [
      'position:absolute', 'left:0', 'right:0', 'top:0', 'height:12vh',
      'background:linear-gradient(180deg, rgba(220,220,240,0.35) 0%, transparent 100%)',
      'animation:courtApproach 5s ease-in-out infinite', 'pointer-events:none'
    ].join(';'));
    root.appendChild(horizon);

    // Single character slot \u2014 we rotate through the seven
    const charWrap = el('div', [
      'position:relative', 'margin-bottom:30vh',
      'width:50%', 'max-width:260px', 'aspect-ratio:3/5',
      'display:flex', 'align-items:flex-end', 'justify-content:center'
    ].join(';'));
    const charImg = el('img', [
      'width:100%', 'height:100%', 'object-fit:contain',
      'pointer-events:none', 'user-select:none',
      'opacity:0'
    ].join(';'));
    charImg.onerror = () => { charImg.style.opacity = '0'; };
    charWrap.appendChild(charImg);
    root.appendChild(charWrap);

    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(8,8,16,0.92)', 'backdrop-filter:blur(6px)',
      'color:#efe8f2', 'font-size:17px', 'line-height:1.5',
      'box-shadow:0 6px 24px rgba(0,0,0,0.65)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 500ms ease, transform 500ms ease',
      'font-family:inherit'
    ].join(';'));
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.8;margin-bottom:6px;', '');
    const line = el('div', 'min-height:44px;', '');
    const hint = el('div', 'margin-top:10px;font-size:12px;opacity:0.55;font-style:italic;', '');
    dialogue.appendChild(speaker);
    dialogue.appendChild(line);
    dialogue.appendChild(hint);
    root.appendChild(dialogue);

    const choiceRow = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'display:flex', 'flex-direction:column', 'gap:8px',
      'max-height:72vh', 'overflow-y:auto',
      'opacity:0', 'pointer-events:none',
      'transition:opacity 400ms ease'
    ].join(';'));
    root.appendChild(choiceRow);

    return { root, charWrap, charImg, dialogue, line, speaker, hint, choiceRow };
  }

  function showChoice(choiceRow, dialogue, options) {
    return new Promise((resolve) => {
      dialogue.style.opacity = '0';
      setTimeout(() => {
        choiceRow.innerHTML = '';
        options.forEach((opt) => {
          const btn = el('button', [
            'padding:12px 16px', 'border-radius:18px',
            'border:1px solid rgba(220,210,240,0.35)',
            'background:linear-gradient(180deg,rgba(18,14,32,0.94),rgba(8,6,18,0.94))',
            'color:#efe8f2', 'font-size:14px', 'font-weight:500', 'line-height:1.4',
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
      }, 260);
    });
  }

  async function presentCharacter(n, member) {
    // Swap sprite, animate in
    n.charImg.src = member.pose;
    n.charImg.style.filter = 'drop-shadow(0 10px 30px ' + member.glow + ')';
    n.charImg.style.animation = 'none';
    // reflow
    // eslint-disable-next-line no-unused-expressions
    n.charImg.offsetHeight;
    n.charImg.style.animation = 'courtFlareIn 700ms ease forwards';
    n.charImg.style.opacity = '1';

    n.speaker.textContent = member.name;
    await type(n.line, member.line, 24);
    await wait(2400);
  }

  function filterToMet(court) {
    // Only present characters the player has actually met.
    return court.filter(m => {
      return lsGet('pp_ms_encounter_' + m.id + '_seen') === '1'
          || lsGet('pp_met_' + m.id) === '1';
    });
  }

  async function play(onDone) {
    if (_rootEl) { try { onDone && onDone(); } catch (_) {} return; }
    const roster = filterToMet(COURT);
    if (roster.length < 4) {
      // Guard \u2014 this should never happen given trigger check, but safe.
      try { onDone && onDone(); } catch (_) {}
      return;
    }

    const n = build();
    _rootEl = n.root;
    document.body.appendChild(n.root);

    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(600);
    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      // ---- OPENING NARRATION --------------------------------------
      n.speaker.textContent = '\u2014 THE WEAVER\u2019S COURT, LAST HOUR BEFORE THE QUEEN ARRIVES \u2014';
      await type(n.line, 'Word came at dusk. \u2014 Queen Aenor is walking here. \u2014 She has not walked this palace in a hundred years. \u2014 She will be at the door before dawn. \u2014 She is coming for the Weaver.', 22);
      await wait(3200);

      await type(n.line, 'You did not summon them. \u2014 They came anyway. \u2014 Every one of them you have loved. \u2014 They are here. \u2014 Each has a line. \u2014 Then you will choose.', 22);
      await wait(3200);

      // ---- ONE LINE FROM EACH MET CHARACTER ------------------------
      for (const member of roster) {
        await presentCharacter(n, member);
      }

      // ---- THE CHOICE ---------------------------------------------
      n.charImg.style.animation = '';
      n.charImg.style.opacity = '0.4'; // dim while we choose

      n.speaker.textContent = '';
      await type(n.line, 'You have heard them. \u2014 The queen will be here before dawn. \u2014 One of them has to stand at the front when she arrives. \u2014 Not because the others are less. \u2014 Because you must choose whose voice she hears first. \u2014 Choose on purpose.', 22);
      await wait(2200);
      n.hint.textContent = 'who stands in front when she arrives?';
      n.hint.style.opacity = '0.75';

      const options = roster.map(m => ({ id: m.id, text: m.name.toLowerCase().replace(/^./, c => c.toUpperCase()) + ' \u2014 my champion.' }));
      const pick = await showChoice(n.choiceRow, n.dialogue, options);

      n.hint.style.opacity = '0';
      n.dialogue.style.opacity = '1';
      n.dialogue.style.transform = 'translateY(0)';

      lsSet(FLAG_CHAMPION, pick.id);
      const chosen = roster.find(m => m.id === pick.id);

      // ---- CLOSING ------------------------------------------------
      n.charImg.src = chosen.pose;
      n.charImg.style.filter = 'drop-shadow(0 10px 30px ' + chosen.glow + ')';
      n.charImg.style.opacity = '1';
      n.charImg.style.animation = 'courtFlareIn 700ms ease forwards';
      // reflow
      // eslint-disable-next-line no-unused-expressions
      n.charImg.offsetHeight;

      n.speaker.textContent = chosen.name;
      const chosenClosers = {
        alistair: '*nods once, slow, steady, unbuckles his gauntlet and offers you his bare hand* \u2014 Then I stand first. \u2014 I have stood in front of worse than a dowager. \u2014 Hmm. \u2014 I have not. \u2014 I will stand anyway.',
        elian:    '*unbuckles his cloak, drapes it around your shoulders, forehead to yours* \u2014 Then I stand first. \u2014 The Thornwood is with me. \u2014 So is every tree that ever remembered Veyra. \u2014 She has never faced that line.',
        lyra:     '*sets her mother\u2019s staff upright between you and the door, hums one note of the old song* \u2014 Then I stand first. \u2014 My mother taught me how to be heard by someone who does not want to hear. \u2014 I have been practicing all my life.',
        caspian:  '*a small, unterrified smile* \u2014 Then I stand first. \u2014 She raised me to obey her. \u2014 The last thing she expects is me using her own manners against her. \u2014 Let us find out how well I learned.',
        lucien:   '*sets the pen down with deliberate care, turns every page facedown on the desk, lifts the staff* \u2014 Then I stand first. \u2014 I have been collecting evidence against her for years. \u2014 Tonight I publish.',
        noir:     '*takes your chin between thumb and finger, tilts your face up, eye contact held* \u2014 Then I stand first. \u2014 She put me under a stone for loving a Weaver. \u2014 I have come back specifically to disappoint her.',
        proto:    'THEN I STAND FIRST! i\u2019ve been waiting six hundred years for permission! the five in here with me all said YES at the same time! we are SO loud right now!'
      };
      await type(n.line, chosenClosers[chosen.id] || 'Then I stand first. \u2014 For you.', 22);
      await wait(3600);

      // Final player-facing narration
      n.speaker.textContent = '';
      await type(n.line, 'The others step back. \u2014 Not away. \u2014 Behind your champion, in a line. \u2014 Every one of them between you and the door. \u2014 None of them flinching. \u2014 You are a Weaver. \u2014 This is your court. \u2014 She is coming. \u2014 So are you.', 22);
      await wait(3800);

      await type(n.line, 'TO BE CONTINUED. \u2014 The queen\u2019s knock is one room away. \u2014 Your seven are ready. \u2014 The kingdom has been waiting for you to pick up the thread. \u2014 Pick it up.', 22);
      await wait(3200);

      n.root.style.opacity = '0';
      await wait(900);
      lsSet(FLAG_SEEN, '1');

    } catch (e) {
      console.warn('[crossover-weavers-court] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  // --- Trigger ---
  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }
  function alreadySeen()  { return lsGet(FLAG_SEEN)  === '1'; }
  function aenorArrived() { return lsGet(FLAG_CH13) === '1'; }
  function weaverKnown()  { return lsGet(FLAG_WEAVER) === '1'; }

  function metCount() {
    let n = 0;
    for (const m of COURT) {
      if (lsGet('pp_ms_encounter_' + m.id + '_seen') === '1' || lsGet('pp_met_' + m.id) === '1') n++;
    }
    return n;
  }

  function isGameIdle() {
    const g = window._game;
    if (!g) return false;
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
    if (!aenorArrived() || !weaverKnown()) return false;
    if (metCount() < 4) return false;
    return isGameIdle();
  }

  let _firing = false;
  function tick() { if (_firing || !shouldFire()) return; _firing = true; play(() => { _firing = false; }); }
  function boot() { setTimeout(() => { tick(); setInterval(tick, POLL_MS); }, 28000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.MSCrossWeaversCourt = {
    play, force() { lsSet(FLAG_SEEN, ''); _firing = false; tick(); },
    reset() { try { localStorage.removeItem(FLAG_SEEN); localStorage.removeItem(FLAG_CHAMPION); } catch (_) {} },
    seenKey: FLAG_SEEN
  };
})();
