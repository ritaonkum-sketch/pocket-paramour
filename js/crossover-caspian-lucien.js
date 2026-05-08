/* crossover-caspian-lucien.js."The Library"
 * --------------------------------------------------------------------------
 * Registers window. MSCrossCaspianLucien.
 *
 * Caspian and Lucien have known each other for twenty years. Caspian
 * has been summoning Lucien to court since they were both teenagers.
 * Lucien has refused most of those summonses and Caspian has secretly
 * loved him for it.
 *
 * Tonight.because the player is being hunted by Aenor. Caspian
 * does the unprecedented: he climbs Lucien's tower instead of
 * summoning Lucien to the palace. They are no longer the prince and
 * the scholar. They are two old half-friends sharing intelligence
 * about a queen and a Weaver.
 *
 * Triggers: Caspian bond >= 35, Lucien bond >= 35, both met, on
 * Caspian or Lucien, game idle, not yet seen.
 */

(function () {
  'use strict';

  const FLAG_ROUTE   = 'pp_main_story_enabled';
  const FLAG_SEEN    = 'pp_cross_caspian_lucien_seen';
  const FLAG_C_MET   = 'pp_ms_encounter_caspian_seen';
  const FLAG_L_MET   = 'pp_ms_encounter_lucien_seen';
  const AFF_KEYS_C   = ['pp_affection_caspian', 'caspian_affection'];
  const AFF_KEYS_L   = ['pp_affection_lucien', 'lucien_affection'];
  const MIN_AFF      = 35;
  const POLL_MS      = 25000;

  const C_POSE  = 'assets/caspian/body/casual1.png';
  const C_ALT   = 'assets/caspian/body/casual2.png';
  const L_POSE  = 'assets/lucien/body/casual1.png';
  const L_ALT   = 'assets/lucien/body/amused.png';
  const BG_SRC  = 'assets/bg-lucien-evening.png';

  let _rootEl = null;

  function el(tag, css, text) { const e = document.createElement(tag); if (css) e.style.cssText = css; if (text) e.textContent = text; return e; }
  function wait(ms) { return window.PPTapWait ? window.PPTapWait(_rootEl, ms) : new Promise(r => setTimeout(r, ms)); }
  function type(elRef, text, cps) {
    if (window.PPTypeStage) return window.PPTypeStage(elRef, text, cps);
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
      'background:#0a0815', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #1a1428 0%, #050310 80%)',
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

    const c = makeChar('rgba(230,160,210,0.35)');
    const l = makeChar('rgba(200,170,240,0.35)');
    charRow.appendChild(c.wrap);
    charRow.appendChild(l.wrap);
    root.appendChild(charRow);

    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(12,8,22,0.92)', 'backdrop-filter:blur(6px)',
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

    return { root, c, l, dialogue, line, speaker };
  }

  function say(n, name, text, cps) { if (window.PPApplyBubbleStyle) { window.PPApplyBubbleStyle(n, name); } else { n.speaker.textContent = name; } return type(n.line, text, cps || 22); }

  async function play(onDone) {
    if (_rootEl) { try { onDone && onDone(); } catch (_) {} return; }
    const n = build();
    _rootEl = n.root;
    document.body.appendChild(n.root);

    n.c.img.src = C_POSE;
    n.l.img.src = L_POSE;

    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(500);
    n.l.wrap.style.opacity = '1';
    n.l.wrap.style.transform = 'translateY(0) scale(1)';
    await wait(800);
    n.c.wrap.style.opacity = '1';
    n.c.wrap.style.transform = 'translateY(0) scale(1)';
    await wait(700);

    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      n.speaker.textContent = 'LUCIEN\u2019S TOWER, EVENING, NO SUMMONS';
      await type(n.line, 'Caspian climbed the stairs himself. He has not climbed these stairs since he was sixteen and Lucien was nineteen and they were both furious about something neither of them remembers anymore. The wards on the lintel bow out of reflex. The Crown is climbing toward them.', 22);
      await wait(3600);

      // Lucien sees who it is, surprised
      n.l.img.src = L_ALT;
      await say(n, 'LUCIEN', '*Sets the pen down with deliberate care, turns the page facedown*. \u2026Your Highness. Climbing my stairs. Either I have been promoted. Or you have been demoted. I am unwilling to ask which.', 22);
      await wait(3800);

      // Caspian, dry, exhausted
      n.c.img.src = C_ALT;
      await say(n, 'CASPIAN', 'Neither, scholar. I am visiting on behalf of someone we both work for now. *Small, exhausted smile*. You will not believe who.', 22);
      await wait(3200);

      // Lucien, dry
      await say(n, 'LUCIEN', 'I will absolutely believe who. *Gestures toward the desk with his pen*. Sit. The brandy in the third drawer is still good. I have been saving it for a reason I did not know yet.', 22);
      await wait(3600);

      // Setting the table.their easy old shorthand
      await type(n.line, '*Caspian sits. Lucien retrieves the brandy and two glasses. He is not in a hurry. The wards on the door re-tighten themselves behind the prince. They have known to do this for two decades.*', 22);
      await wait(3000);

      // Caspian.the actual reason for the visit
      await say(n, 'CASPIAN', 'My grandmother is awake. You knew. You wrote me a letter that did not arrive at the palace. The seal was broken before it crossed the gate. You suspected she was reading my mail. You were right.', 22);
      await wait(3800);

      // Lucien
      await say(n, 'LUCIEN', '*Pours*. I have been suspecting that for nine years. The mail problem is the smallest problem. The Weaver is the largest one. My grandmother (sorry, YOUR grandmother) is hunting her.', 22);
      await wait(3400);

      // Caspian, hand on his temple
      await say(n, 'CASPIAN', 'I know. She has been climbing your tower as well as mine, hasn\u2019t she. Last week. Asked you about your writing.', 22);
      await wait(2800);

      await say(n, 'LUCIEN', '*Small bow*. You are very well-informed for a man whose mail is being read. Yes. She came. I lied. She knew.', 22);
      await wait(3000);

      // Caspian, suddenly real
      await say(n, 'CASPIAN', 'Lucien. I am not here as the Crown tonight. I am here as the boy you used to argue with about the geometry of the seal. The Weaver is mine. The Weaver is yours. Apparently the Weaver is also Alistair\u2019s and Elian\u2019s and Lyra\u2019s and a Nocthera prince\u2019s and the construct in the mirror\u2019s. I have been counting. We are seven, all told, deep into protecting one Weaver. We need a strategy.', 22);
      await wait(4400);

      // Lucien.the dry warmth, the old friendship
      await say(n, 'LUCIEN', '*The smallest smile, almost not there*. You used to be terrible at strategy. You were always trying to charm your way through it. Has that changed?', 22);
      await wait(3200);

      // Caspian.self-aware, tired
      await say(n, 'CASPIAN', '*Smiles back, also small*. I am still trying to charm my way through it. But not WITH her. I do not charm her. I do not know how. So apparently I have one strategy left. Bring brandy to a tower and ask the smartest man in the kingdom for help.', 22);
      await wait(3800);

      // Lucien.the old softness lands
      n.l.img.src = L_POSE;
      await say(n, 'LUCIEN', '*Looks at him properly for the first time in fifteen years*. \u2026You have grown up, Caspian. I am sorry I missed it. I was up here. Writing.', 22);
      await wait(3400);

      // Caspian.a single soft beat
      await say(n, 'CASPIAN', 'I read every paper you published. The good ones and the bad ones. The footnotes more than once. Do not act surprised, scholar. I am not as charming as I look but I am also not as stupid as the court says.', 22);
      await wait(3800);

      // Lucien.caught off guard, recovers with grace
      await say(n, 'LUCIEN', '*Ink-stained hand around the brandy glass*. \u2026I am surprised. I will pretend not to be. *Small bow*. Your Highness.', 22);
      await wait(2800);

      // The actual strategy
      n.c.img.src = C_POSE;
      await say(n, 'CASPIAN', 'Here is what I propose. You take the records. The history. The publishing. The truth. I take the politics. The court. The face. The lie that buys time. Alistair takes the gate. Elian takes the woods. Lyra takes the coast. The Weaver gets to live a life inside our four directions.', 22);
      await wait(4400);

      // Lucien.catches the omission
      await say(n, 'LUCIEN', 'You have not assigned the prince of Nocthera a direction.', 22);
      await wait(2200);

      // Caspian, dry
      await say(n, 'CASPIAN', 'No. He has assigned himself one. Down. He takes the seal. The leak. The thing my grandmother spent six centuries pretending was not there. We do not need to give him an order. He is already on duty.', 22);
      await wait(3800);

      // Lucien, dry warmth
      await say(n, 'LUCIEN', 'Five men, one woman, one ghost-prince. *Lifts the glass*. To being inconvenient enough to outlive your grandmother.', 22);
      await wait(2800);

      await say(n, 'CASPIAN', '*Lifts his*. To being inconvenient. And to forgiving each other for the years we wasted being polite about it.', 22);
      await wait(3000);

      // The closer.a real moment between them
      await say(n, 'LUCIEN', '*Sets the glass down, looks at him*. \u2026Caspian. If she comes for you first, send the boy to me. The Captain. He will get up the tower in seven minutes. I will know what to do.', 22);
      await wait(3800);

      await say(n, 'CASPIAN', '*Nods once*. If she comes for you first. The same. Send the staff. I will see it from the balcony.\u2026I always see what is on your tower from the balcony, scholar. I have for years.', 22);
      await wait(4000);

      // Lucien.the smallest exhale
      await say(n, 'LUCIEN', '*So quietly the wards lean to hear*. I have always known that, Your Highness.', 22);
      await wait(2800);

      // Closing narration
      n.speaker.textContent = '';
      await type(n.line, 'They drink the rest of the brandy slowly. Twenty years of guarded politeness, set down on the desk between them next to the page Lucien turned facedown. The Weaver does not know any of this is happening tonight. She does not need to. Her court is just quietly getting larger.', 22);
      await wait(4200);

      n.root.style.opacity = '0';
      await wait(700);
      lsSet(FLAG_SEEN, '1');

    } catch (e) {
      console.warn('[crossover-caspian-lucien] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }
  function alreadySeen()  { return lsGet(FLAG_SEEN) === '1'; }
  function metC()         { return lsGet(FLAG_C_MET) === '1' || lsGet('pp_met_caspian') === '1'; }
  function metL()         { return lsGet(FLAG_L_MET) === '1' || lsGet('pp_met_lucien') === '1'; }

  function isGameIdle() {
    const g = window._game;
    if (!g) return false;
    const who = g.selectedCharacter || g.characterId;
    if (who !== 'caspian' && who !== 'lucien') return false;
    if (g.sceneActive || g.characterLeft) return false;
    const block = document.querySelector([
      '#ms-encounter-root', '#mscard-root', '#tp-root', '#chp-page',
      '#mg-overlay', '#mon-bundle-back', '#settings-overlay:not(.hidden)',
      '#cinematic-overlay.visible', '#event-overlay:not(.hidden)',
      '#gift-panel:not(.hidden)', '#training-panel:not(.hidden)',
      '#story-overlay:not(.hidden)',
      '#world-intro:not(.hidden)', '#main-story-page:not(.hidden)'
    ].join(','));
    return !block;
  }

  function shouldFire() {
    if (!routeEnabled() || alreadySeen()) return false;
    if (!metC() || !metL()) return false;
    if (getAff(AFF_KEYS_C) < MIN_AFF || getAff(AFF_KEYS_L) < MIN_AFF) return false;
    return isGameIdle();
  }

  let _firing = false;
  function tick() { if (_firing || !shouldFire()) return; _firing = true; play(() => { _firing = false; }); }
  function boot() { setTimeout(() => { tick(); setInterval(tick, POLL_MS); }, 27000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window. MSCrossCaspianLucien = {
    play,
    force() { lsSet(FLAG_SEEN, ''); _firing = false; tick(); },
    reset() { try { localStorage.removeItem(FLAG_SEEN); } catch (_) {} },
    seenKey: FLAG_SEEN
  };
})();
