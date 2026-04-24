/* crossover-elian-lyra.js — "The Debt"
 * --------------------------------------------------------------------------
 * Registers window.MSCrossElianLyra.
 *
 * Elian hid some of Lyra's mother's people in the Thornwood during Aenor's
 * purge. He could not save them all. For a hundred and fifty years he has
 * tended their markers at the south edge \u2014 simple stones, no names,
 * because he did not know them. Lyra is the last daughter of the women he
 * could not hide. Tonight he brings her to the stones. She names them.
 *
 * This is not forgiveness. It is acknowledgement of a debt. He does not
 * ask. She does not grant. But the markers finally get names.
 *
 * Triggers: Elian bond >= 45, Lyra bond >= 35, both met, on either one,
 * game idle, not yet seen. (Ideally: pp_elian_rescue_seen done first \u2014
 * that scene named her as a Weaver. This one names her as the last
 * daughter of the siren-kind.)
 */

(function () {
  'use strict';

  const FLAG_ROUTE    = 'pp_main_story_enabled';
  const FLAG_SEEN     = 'pp_cross_elian_lyra_seen';
  const FLAG_ELIAN_MET= 'pp_ms_encounter_elian_seen';
  const FLAG_LYRA_MET = 'pp_ms_encounter_lyra_seen';
  const AFF_KEYS_E    = ['pp_affection_elian', 'elian_affection'];
  const AFF_KEYS_L    = ['pp_affection_lyra', 'lyra_affection'];
  const MIN_AFF_E     = 45;
  const MIN_AFF_L     = 35;
  const POLL_MS       = 25000;

  const ELIAN_POSE  = 'assets/elian/body/calm.png';
  const ELIAN_ALT   = 'assets/elian/body/foraging.png';
  const LYRA_POSE   = 'assets/lyra/body/casual1.png';
  const LYRA_ALT    = 'assets/lyra/body/casual2.png';
  const BG_SRC      = 'assets/bg-elian-forest.png';

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
      'background:#060a08', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #0e1a16 0%, #04060a 80%)',
      'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => { bg.style.backgroundImage = `url(${BG_SRC})`; bg.style.opacity = '0.42'; };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    // The marker stones \u2014 a soft row of faint points at the base of the scene
    const stones = el('div', [
      'position:absolute', 'left:50%', 'top:55%', 'transform:translate(-50%,-50%)',
      'width:40vmin', 'height:12vmin', 'pointer-events:none',
      'background:radial-gradient(ellipse, rgba(200,200,190,0.22) 0%, transparent 70%)',
      'opacity:0', 'transition:opacity 1400ms ease'
    ].join(';'));
    root.appendChild(stones);

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

    const elian = makeChar('rgba(140,190,140,0.35)');
    const lyra  = makeChar('rgba(120,210,230,0.35)');
    charRow.appendChild(elian.wrap);
    charRow.appendChild(lyra.wrap);
    root.appendChild(charRow);

    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(8,14,10,0.90)', 'backdrop-filter:blur(6px)',
      'color:#e2e8dc', 'font-size:17px', 'line-height:1.5',
      'box-shadow:0 6px 24px rgba(0,0,0,0.6)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 600ms ease, transform 600ms ease',
      'font-family:inherit'
    ].join(';'));
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.7;margin-bottom:6px;', '');
    const line = el('div', 'min-height:44px;', '');
    dialogue.appendChild(speaker);
    dialogue.appendChild(line);
    root.appendChild(dialogue);

    return { root, elian, lyra, dialogue, line, speaker, stones };
  }

  function say(n, name, text, cps) { n.speaker.textContent = name; return type(n.line, text, cps || 22); }

  async function play(onDone) {
    if (_rootEl) { try { onDone && onDone(); } catch (_) {} return; }
    const n = build();
    _rootEl = n.root;
    document.body.appendChild(n.root);

    n.elian.img.src = ELIAN_POSE;
    n.lyra.img.src  = LYRA_POSE;

    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(500);
    n.elian.wrap.style.opacity = '1';
    n.elian.wrap.style.transform = 'translateY(0) scale(1)';
    n.lyra.wrap.style.opacity = '1';
    n.lyra.wrap.style.transform = 'translateY(0) scale(1)';
    await wait(900);
    n.stones.style.opacity = '1';

    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      n.speaker.textContent = '\u2014 THORNWOOD, SOUTH EDGE, WHERE FOREST MEETS THE OLD RUINED TOWN \u2014';
      await type(n.line, 'Elian has brought Lyra here. \u2014 He has been silent the whole walk. \u2014 She did not ask where. \u2014 She followed. \u2014 Now he has stopped. \u2014 There are stones at her feet. \u2014 Simple markers. \u2014 No names.', 22);
      await wait(3000);

      await say(n, 'LYRA', '*looks down, staff tightening in her hand* \u2014 These are \u2026 these are graves.', 22);
      await wait(2400);

      await say(n, 'ELIAN', 'Yes. \u2014 Some of them.', 22);
      await wait(2000);

      // BEAT: the confession
      n.elian.img.src = ELIAN_ALT;
      await say(n, 'ELIAN', 'A hundred and fifty years ago, during the hunting \u2014 some of your mother\u2019s kind fled here. \u2014 I was young. \u2014 The Warden before me had just died. \u2014 I hid as many as I could. \u2014 I could not hide all of them.', 22);
      await wait(3800);

      await say(n, 'ELIAN', 'These are the ones I could not save. \u2014 I have tended the stones since. \u2014 I did not know their names. \u2014 I have been waiting for someone who would know them. \u2014 \u2026You know them. Do you not.', 22);
      await wait(3600);

      // BEAT: Lyra, processing
      n.lyra.img.src = LYRA_ALT;
      await type(n.line, '*She does not speak for a long time. The forest does not speak either. Elian does not look at her. He gives her the space to feel it without an audience.*', 22);
      await wait(3200);

      await say(n, 'LYRA', '*small, steady* \u2014 I know their names. \u2014 My mother taught me. \u2014 Every one. \u2014 She made me memorise them so someone would remember. \u2014 She did not tell me someone else was already remembering them. \u2014 Just nameless.', 22);
      await wait(3800);

      // BEAT: Elian holds out a stone
      await say(n, 'ELIAN', '*bends, picks up a small flat river-stone from the pile at his feet, offers it to her on an open palm* \u2014 Take it. \u2014 Tell me. \u2014 I have been listening for them for a hundred and fifty years. \u2014 Let me finally hear.', 22);
      await wait(3800);

      // BEAT: Lyra kneels. She sings the name-song.
      await type(n.line, '*Lyra takes the stone. Kneels at the first marker. Begins to sing, softly \u2014 not a melody, a naming. The names of her mother\u2019s people, one to each stone. The forest listens. Elian listens. The player listens. Some of the names are long. Some are a single syllable. Each is a person.*', 22);
      await wait(4400);

      // BEAT: Elian stays standing behind her. Does not intrude.
      await type(n.line, '*When she is done, the names are in the air and in the stones and in him. He does not speak. He stands behind her with a hand at the back of her head, not holding, just \u2014 present.*', 22);
      await wait(3400);

      // BEAT: Lyra, not forgiveness but acknowledgement
      await say(n, 'LYRA', '*rises, still facing the stones* \u2014 I do not forgive you. \u2014 I do not have to. \u2014 You do not need it. \u2014 *turns, looks at him* \u2014 You kept them. \u2014 For a hundred and fifty years you kept them. \u2014 That is more than I could have done. \u2014 Thank you.', 22);
      await wait(4200);

      await say(n, 'ELIAN', '*low, even* \u2014 Thank YOU. \u2014 They have been asking for a daughter for a long time. \u2014 They got one.', 22);
      await wait(3000);

      // BEAT: the small promise
      await say(n, 'LYRA', 'Will you carve the names now? \u2014 I will tell you which goes where. \u2014 I do not want them nameless anymore.', 22);
      await wait(3000);

      await say(n, 'ELIAN', 'Yes. \u2014 Tomorrow. \u2014 *unbuckles his cloak, drapes it around her without looking up* \u2014 Tonight you rest. \u2014 The names will still be there in the morning. \u2014 I will be there in the morning. \u2014 That is what this post is for.', 22);
      await wait(3600);

      // Closing
      n.speaker.textContent = '';
      await type(n.line, 'You stand behind them both. \u2014 The Weaver. \u2014 The one whose bonds light wards. \u2014 Something in the south edge of the forest just got heavier and lighter at the same time. \u2014 A debt acknowledged is not a debt paid. \u2014 But it is no longer a debt hidden.', 22);
      await wait(3600);

      n.root.style.opacity = '0';
      await wait(700);
      lsSet(FLAG_SEEN, '1');
    } catch (e) {
      console.warn('[crossover-elian-lyra] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }
  function alreadySeen()  { return lsGet(FLAG_SEEN)  === '1'; }
  function metElian()     { return lsGet(FLAG_ELIAN_MET) === '1' || lsGet('pp_met_elian') === '1'; }
  function metLyra()      { return lsGet(FLAG_LYRA_MET) === '1' || lsGet('pp_met_lyra') === '1'; }

  function isGameIdle() {
    const g = window._game;
    if (!g) return false;
    const who = g.selectedCharacter || g.characterId;
    if (who !== 'elian' && who !== 'lyra') return false;
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
    if (!metElian() || !metLyra()) return false;
    if (getAff(AFF_KEYS_E) < MIN_AFF_E || getAff(AFF_KEYS_L) < MIN_AFF_L) return false;
    return isGameIdle();
  }

  let _firing = false;
  function tick() { if (_firing || !shouldFire()) return; _firing = true; play(() => { _firing = false; }); }
  function boot() { setTimeout(() => { tick(); setInterval(tick, POLL_MS); }, 24000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.MSCrossElianLyra = {
    play, force() { lsSet(FLAG_SEEN, ''); _firing = false; tick(); },
    reset() { try { localStorage.removeItem(FLAG_SEEN); } catch (_) {} }, seenKey: FLAG_SEEN
  };
})();
