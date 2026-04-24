/* crossover-caspian-noir.js — "The Mirror Princes"
 * --------------------------------------------------------------------------
 * Registers window.MSCrossCaspianNoir.
 *
 * Both princes. Both charm widely. Both love one. Caspian's grandmother
 * sealed Noir six centuries ago over the same woman who tangled their
 * bloodlines. They are mirrors \u2014 one light, one dark \u2014 and they have
 * never been in a room together until the player brought them there.
 *
 * This scene is about two men recognising each other as the same animal,
 * separated by six hundred years and politics. No swords. No duel. Tea.
 * Then a vow: neither will hurt the Weaver, and both will coordinate.
 *
 * Triggers: Caspian bond >= 40, Noir met (Ch 6 OR encounter), on Caspian
 * or Noir, game idle, not yet seen.
 */

(function () {
  'use strict';

  const FLAG_ROUTE   = 'pp_main_story_enabled';
  const FLAG_SEEN    = 'pp_cross_caspian_noir_seen';
  const FLAG_NOIR_MET= 'pp_ms_encounter_noir_seen';
  const FLAG_CH6     = 'pp_chapter_done_6';
  const FLAG_CASP_MET= 'pp_ms_encounter_caspian_seen';
  const AFF_KEYS_C   = ['pp_affection_caspian', 'caspian_affection'];
  const MIN_AFF      = 40;
  const POLL_MS      = 25000;

  const CASP_POSE   = 'assets/caspian/body/casual1.png';
  const CASP_ALT    = 'assets/caspian/body/casual2.png';
  const NOIR_POSE   = 'assets/noir/body/casual1.png';
  const NOIR_ALT    = 'assets/noir/body/casual2.png';
  const BG_SRC      = 'assets/bg-caspian-night.png';

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
      const speed = Math.max(14, Math.round(1000 / (cps || 22)));
      let i = 0;
      const step = () => {
        if (i < text.length) { elRef.textContent += text[i++]; setTimeout(step, speed); }
        else resolve();
      };
      step();
    });
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  function getAff(keys) {
    for (const k of keys) {
      const v = lsGet(k);
      if (v != null) return parseInt(v, 10) || 0;
    }
    return 0;
  }

  function build() {
    const root = el('div', [
      'position:fixed', 'inset:0', 'z-index:10000',
      'background:#0a0812', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #1c1128 0%, #050308 80%)',
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

    const caspian = makeChar('rgba(230,160,210,0.35)');
    const noir    = makeChar('rgba(160,90,200,0.35)');
    charRow.appendChild(caspian.wrap);
    charRow.appendChild(noir.wrap);
    root.appendChild(charRow);

    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(12,8,22,0.90)', 'backdrop-filter:blur(6px)',
      'color:#f0e4f2', 'font-size:17px', 'line-height:1.5',
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

    return { root, caspian, noir, dialogue, line, speaker };
  }

  function say(n, name, text, cps) {
    n.speaker.textContent = name;
    return type(n.line, text, cps || 22);
  }

  async function play(onDone) {
    if (_rootEl) { try { onDone && onDone(); } catch (_) {} return; }
    const n = build();
    _rootEl = n.root;
    document.body.appendChild(n.root);

    n.caspian.img.src = CASP_POSE;
    n.noir.img.src    = NOIR_POSE;

    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(500);
    n.caspian.wrap.style.opacity = '1';
    n.caspian.wrap.style.transform = 'translateY(0) scale(1)';
    await wait(700);

    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      n.speaker.textContent = '\u2014 PALACE TERRACE, MIDNIGHT, TEA FOR THREE \u2014';
      await type(n.line, 'Caspian has invited Noir to the palace. \u2014 Privately. Through a door no courier knows about. \u2014 The Weaver brought them both there. \u2014 Neither man has seen the other in six hundred years. One of them was under stone for most of it.', 22);
      await wait(2800);

      n.noir.wrap.style.opacity = '1';
      n.noir.wrap.style.transform = 'translateY(0) scale(1)';
      await wait(900);

      await type(n.line, '*Noir enters through the terrace door \u2014 not the main one. Of course not. Caspian is already seated. Tea has been steeped. There is a third cup, untouched, for the Weaver.*', 22);
      await wait(3200);

      // BEAT 1: Caspian speaks first. He is the host.
      await say(n, 'CASPIAN', '*rises, inclines his head, the precise half-bow one gives family one has never met* \u2014 Prince Noctalis. \u2014 I hope the terrace door was \u2026 adequate.', 22);
      await wait(2800);

      await say(n, 'NOIR', '*mirrors the bow, slower, older* \u2014 It was. \u2014 Crown Prince. \u2014 \u2026You look like your grandfather. \u2014 The good half of him.', 22);
      await wait(3000);

      // BEAT 2: The recognition \u2014 both men see the other is wearing the charm
      n.caspian.img.src = CASP_ALT;
      n.noir.img.src    = NOIR_ALT;
      await say(n, 'CASPIAN', '*small, exact smile \u2014 drops it* \u2014 You have been charming me. \u2014 For forty seconds. \u2014 It is very well done. \u2014 I recognise the technique. \u2014 My grandmother drilled it into me before I could read.', 22);
      await wait(3600);

      await say(n, 'NOIR', '*a low laugh, the first real one in six centuries* \u2014 And you have been charming me. \u2014 For the same forty seconds. \u2014 Better than I expected. \u2014 Our family has kept the trick.', 22);
      await wait(3400);

      // BEAT 3: Caspian drops it first
      await say(n, 'CASPIAN', 'I would rather not charm you tonight, cousin. \u2014 It would feel like lying to kin.', 22);
      await wait(2800);

      await say(n, 'NOIR', '\u2026You too. \u2014 Let us be the other thing we are. \u2014 Tired.', 22);
      await wait(2600);

      // BEAT 4: The tangled family line, named
      await say(n, 'CASPIAN', 'My grandfather loved the same woman you loved. \u2014 My grandmother sealed you over it. \u2014 The tangle that made me prince made you a ghost. \u2014 I have inherited the charm. I have inherited the lore. \u2014 I have not inherited her cruelty. \u2014 I hope.', 22);
      await wait(4000);

      await say(n, 'NOIR', '*looks at him a long time* \u2014 You have not. \u2014 I have been in the seal long enough to tell the difference. \u2014 The cruelty was hers. \u2014 The charm was ours, she only sharpened it into a knife. \u2014 You still have it as a door.', 22);
      await wait(3800);

      // BEAT 5: The vow \u2014 coordinate to protect the Weaver
      await say(n, 'CASPIAN', 'The Weaver is both of ours. \u2014 I do not mean romantically. \u2014 I mean politically. \u2014 My grandmother is hunting her. \u2014 Your kind, our kind, have both been hunted by her. \u2014 I would like to coordinate.', 22);
      await wait(3600);

      await say(n, 'NOIR', '\u2026I will accept. \u2014 You take the day. I take the night. \u2014 You take the court. I take the seal-work that still leaks. \u2014 We do not let this one go the way Veyra went. \u2014 Agreed?', 22);
      await wait(3600);

      await say(n, 'CASPIAN', 'Agreed. \u2014 *lifts his cup* \u2014 To not repeating our family\u2019s mistakes.', 22);
      await wait(2400);

      await say(n, 'NOIR', '*lifts his* \u2014 To repeating only the good parts of them. \u2014 The love. None of the rest.', 22);
      await wait(2800);

      // BEAT 6: The player acknowledged
      await say(n, 'CASPIAN', '*sets his cup down, turns to the Weaver* \u2014 You are the first person in six generations to be loved by both halves of this family at once. \u2014 We intend to do it right. \u2014 Do not argue.', 22);
      await wait(3400);

      await say(n, 'NOIR', '*the small ancient smile returns* \u2014 Hmm. \u2014 He sounds like me. \u2014 I like him. \u2014 Reluctantly.', 22);
      await wait(2800);

      // Closing
      n.speaker.textContent = '';
      await type(n.line, 'Noir leaves through the window. \u2014 Of course. \u2014 Caspian watches him go. \u2014 The Weaver watches Caspian watch him go. \u2014 Caspian turns, pours her more tea, does not comment. \u2014 Something six hundred years broken just became something that can be put back.', 22);
      await wait(3400);

      n.root.style.opacity = '0';
      await wait(700);
      lsSet(FLAG_SEEN, '1');

    } catch (e) {
      console.warn('[crossover-caspian-noir] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }
  function alreadySeen()  { return lsGet(FLAG_SEEN)  === '1'; }
  function metNoir()      { return lsGet(FLAG_NOIR_MET) === '1' || lsGet(FLAG_CH6) === '1'; }
  function metCasp()      { return lsGet(FLAG_CASP_MET) === '1' || lsGet('pp_met_caspian') === '1'; }

  function isGameIdle() {
    const g = window._game;
    if (!g) return false;
    const who = g.selectedCharacter || g.characterId;
    if (who !== 'caspian' && who !== 'noir') return false;
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
    if (!routeEnabled()) return false;
    if (alreadySeen()) return false;
    if (!metNoir() || !metCasp()) return false;
    if (getAff(AFF_KEYS_C) < MIN_AFF) return false;
    if (!isGameIdle()) return false;
    return true;
  }

  let _firing = false;
  function tick() { if (_firing) return; if (!shouldFire()) return; _firing = true; play(() => { _firing = false; }); }

  function boot() { setTimeout(() => { tick(); setInterval(tick, POLL_MS); }, 22000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.MSCrossCaspianNoir = {
    play, force() { lsSet(FLAG_SEEN, ''); _firing = false; tick(); },
    reset() { try { localStorage.removeItem(FLAG_SEEN); } catch (_) {} }, seenKey: FLAG_SEEN
  };
})();
