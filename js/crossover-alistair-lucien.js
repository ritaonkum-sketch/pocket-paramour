/* crossover-alistair-lucien.js \u2014 "The Watch and the Tower"
 * --------------------------------------------------------------------------
 * Registers window.MSCrossAlistairLucien.
 *
 * Alistair has been sleeping by the player's door. Wards have started
 * sounding wrong on the south wall. Tonight he climbs Lucien's tower for
 * the first time in his career to ask a scholar he has never spoken to
 * for a favour: a counter-ward, drawn fast.
 *
 * The scene is the captain and the scholar discovering they are both
 * standing watch. Different rooms. Same gate.
 *
 * Triggers: Alistair bond >= 35, Lucien met (encounter seen), on Alistair
 * or Lucien, game idle, not yet seen.
 */

(function () {
  'use strict';

  const FLAG_ROUTE   = 'pp_main_story_enabled';
  const FLAG_SEEN    = 'pp_cross_alistair_lucien_seen';
  const FLAG_AL_MET  = 'pp_ms_encounter_alistair_seen';
  const FLAG_LUC_MET = 'pp_ms_encounter_lucien_seen';
  const AFF_KEYS_A   = ['pp_affection_alistair', 'alistair_affection'];
  const MIN_AFF      = 35;
  const POLL_MS      = 25000;

  const AL_POSE   = 'assets/alistair/body/casual.png';
  const AL_ALT    = 'assets/alistair/body/crossarms.png';
  const LUC_POSE  = 'assets/lucien/body/casual1.png';
  const LUC_ALT   = 'assets/lucien/body/casting.png';
  const BG_SRC    = 'assets/bg-lucien-night.png';

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
      'background:#06051a', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #0e0c25 0%, #02020a 80%)',
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

    const al  = makeChar('rgba(255,210,140,0.35)');
    const luc = makeChar('rgba(200,170,240,0.35)');
    charRow.appendChild(al.wrap);
    charRow.appendChild(luc.wrap);
    root.appendChild(charRow);

    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(10,8,22,0.92)', 'backdrop-filter:blur(6px)',
      'color:#e8e0f2', 'font-size:17px', 'line-height:1.5',
      'box-shadow:0 6px 24px rgba(0,0,0,0.6)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 600ms ease, transform 600ms ease',
      'font-family:inherit'
    ].join(';'));
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.7;margin-bottom:6px;', '');
    const line = el('div', 'min-height:44px;', '');
    dialogue.appendChild(speaker); dialogue.appendChild(line);
    root.appendChild(dialogue);

    return { root, al, luc, dialogue, line, speaker };
  }

  function say(n, name, text, cps) { n.speaker.textContent = name; return type(n.line, text, cps || 22); }

  async function play(onDone) {
    if (_rootEl) { try { onDone && onDone(); } catch (_) {} return; }
    const n = build();
    _rootEl = n.root;
    document.body.appendChild(n.root);

    n.al.img.src  = AL_POSE;
    n.luc.img.src = LUC_POSE;

    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(500);
    n.luc.wrap.style.opacity = '1';
    n.luc.wrap.style.transform = 'translateY(0) scale(1)';
    await wait(700);
    n.al.wrap.style.opacity = '1';
    n.al.wrap.style.transform = 'translateY(0) scale(1)';
    await wait(700);

    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      // Setup
      n.speaker.textContent = '\u2014 LUCIEN\u2019S TOWER, 2 A.M., FIRST TIME ALISTAIR HAS CLIMBED THE STAIRS \u2014';
      await type(n.line, 'Alistair has knocked on the tower door. \u2014 Alistair does not knock on tower doors. \u2014 Lucien sets the pen down with deliberate care, turns the page facedown, and lets him in.', 22);
      await wait(3000);

      // Lucien opens
      await say(n, 'LUCIEN', '*small bow* \u2014 Captain. \u2014 You are nine years late. \u2014 Tea?', 22);
      await wait(2400);

      // Alistair, formal but tired
      n.al.img.src = AL_ALT;
      await say(n, 'ALISTAIR', '*remains standing* \u2014 No, sir. \u2014 \u2026Yes. \u2014 Forgive the hour. The wards on the south wall have been sounding wrong for three nights.', 22);
      await wait(3000);

      // Lucien, alert
      n.luc.img.src = LUC_ALT;
      await say(n, 'LUCIEN', 'I know. \u2014 They are not breaking. \u2014 They are being LISTENED TO. \u2014 Different problem. \u2014 Worse one. \u2014 You came up here for a counter-ward.', 22);
      await wait(3400);

      // Alistair, surprised
      await say(n, 'ALISTAIR', '\u2026I came up here for a counter-ward.', 22);
      await wait(2000);

      // Lucien, dryly amused
      await say(n, 'LUCIEN', '*small smile* \u2014 Good. \u2014 The brave man does not climb my stairs at 2 a.m. for tea. \u2014 He climbs them for parchment.', 22);
      await wait(2800);

      // Lucien lays out a sheet
      await type(n.line, '*Lucien crosses to the desk, slides a fresh sheet free, dips a pen. The wards on the lintel hum politely. The room smells of old paper and lavender.*', 22);
      await wait(3000);

      // Lucien works \u2014 the recognition
      await say(n, 'LUCIEN', '*as he writes* \u2014 You sleep by her door. \u2014 The watchhouse has been talking. \u2014 I do not gossip. \u2014 I file. \u2014 You sleep by her door.', 22);
      await wait(3400);

      // Alistair, the smallest crack
      n.al.img.src = AL_POSE;
      await say(n, 'ALISTAIR', '*low* \u2014 \u2026I do.', 22);
      await wait(1800);

      await say(n, 'LUCIEN', 'I write her name in the margins of my books. \u2014 The wards on this tower bow to her. \u2014 We are doing the same job. \u2014 Different rooms. \u2014 Same gate.', 22);
      await wait(3600);

      // Alistair, quiet
      await say(n, 'ALISTAIR', '*looks at him, properly, for the first time in their acquaintance* \u2014 \u2026Yes, sir.', 22);
      await wait(2200);

      // The exchange of currency
      await say(n, 'LUCIEN', '*finishes the parchment, hands it over with ink-stained fingers* \u2014 Take this. \u2014 Burn it on the threshold of her door. \u2014 The wards will hold for two weeks. \u2014 Then climb the stairs again. \u2014 I will be awake.', 22);
      await wait(3800);

      // Alistair takes it carefully, like the relic it is
      await say(n, 'ALISTAIR', '*takes the parchment with both hands* \u2014 Thank you, scholar. \u2014 \u2026I owe you. \u2014 The Guard owes you.', 22);
      await wait(2800);

      await say(n, 'LUCIEN', '*shakes his head, soft* \u2014 No. \u2014 SHE owes me. \u2014 You and I are not in the column of people she owes anything to. \u2014 We are in the column of people who owe HER. \u2014 Pleasant company, that column. Highly recommend.', 22);
      await wait(3800);

      // Alistair, almost a smile
      await say(n, 'ALISTAIR', '*the smallest exhale that is almost a laugh* \u2014 \u2026Then I will see you in two weeks, sir.', 22);
      await wait(2400);

      await say(n, 'LUCIEN', '*sets the pen down again, looks up, real* \u2014 Captain. \u2014 If I send for you in less than two weeks \u2014 come fast. \u2014 The wards on this tower do not sound wrong yet. \u2014 But if they do.', 22);
      await wait(3400);

      await say(n, 'ALISTAIR', 'I will be at this door in seven minutes from anywhere in the palace. \u2014 You have my word. Mi\u2019lord scholar.', 22);
      await wait(3000);

      // Closer
      await say(n, 'LUCIEN', '\u2026I have not been called \u201cmi\u2019lord\u201d by my own surname in a decade. \u2014 *small* \u2014 Thank you. \u2014 Now go burn the parchment before the south wall hears us caring about her.', 22);
      await wait(3400);

      // Closing narration
      n.speaker.textContent = '';
      await type(n.line, 'Alistair leaves with the parchment held flat against his chest, the way one carries something that just became holy. \u2014 Lucien picks up the pen again. \u2014 Two more men in the realm are now openly guarding the same door. \u2014 The Dowager will sense it. \u2014 So will Noir, somewhere underneath. \u2014 Neither of these two is afraid of either of them tonight.', 22);
      await wait(4400);

      n.root.style.opacity = '0';
      await wait(700);
      lsSet(FLAG_SEEN, '1');

    } catch (e) {
      console.warn('[crossover-alistair-lucien] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }
  function alreadySeen()  { return lsGet(FLAG_SEEN) === '1'; }
  function metAl()        { return lsGet(FLAG_AL_MET) === '1' || lsGet('pp_met_alistair') === '1'; }
  function metLuc()       { return lsGet(FLAG_LUC_MET) === '1' || lsGet('pp_met_lucien') === '1'; }

  function isGameIdle() {
    const g = window._game;
    if (!g) return false;
    const who = g.selectedCharacter || g.characterId;
    if (who !== 'alistair' && who !== 'lucien') return false;
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
    if (!metAl() || !metLuc()) return false;
    if (getAff(AFF_KEYS_A) < MIN_AFF) return false;
    return isGameIdle();
  }

  let _firing = false;
  function tick() { if (_firing || !shouldFire()) return; _firing = true; play(() => { _firing = false; }); }
  function boot() { setTimeout(() => { tick(); setInterval(tick, POLL_MS); }, 26000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.MSCrossAlistairLucien = {
    play,
    force() { lsSet(FLAG_SEEN, ''); _firing = false; tick(); },
    reset() { try { localStorage.removeItem(FLAG_SEEN); } catch (_) {} },
    seenKey: FLAG_SEEN
  };
})();
