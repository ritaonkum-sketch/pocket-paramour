/* crossover-caspian-lucien.js \u2014 "The Library"
 * --------------------------------------------------------------------------
 * Registers window.MSCrossCaspianLucien.
 *
 * Caspian and Lucien have known each other for twenty years. Caspian
 * has been summoning Lucien to court since they were both teenagers.
 * Lucien has refused most of those summonses and Caspian has secretly
 * loved him for it.
 *
 * Tonight \u2014 because the player is being hunted by Aenor \u2014 Caspian
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

  function say(n, name, text, cps) { n.speaker.textContent = name; return type(n.line, text, cps || 22); }

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
      n.speaker.textContent = '\u2014 LUCIEN\u2019S TOWER, EVENING, NO SUMMONS \u2014';
      await type(n.line, 'Caspian climbed the stairs himself. \u2014 He has not climbed these stairs since he was sixteen and Lucien was nineteen and they were both furious about something neither of them remembers anymore. \u2014 The wards on the lintel bow out of reflex. \u2014 The Crown is climbing toward them.', 22);
      await wait(3600);

      // Lucien sees who it is, surprised
      n.l.img.src = L_ALT;
      await say(n, 'LUCIEN', '*sets the pen down with deliberate care, turns the page facedown* \u2014 \u2026Your Highness. \u2014 Climbing my stairs. \u2014 Either I have been promoted. Or you have been demoted. \u2014 I am unwilling to ask which.', 22);
      await wait(3800);

      // Caspian, dry, exhausted
      n.c.img.src = C_ALT;
      await say(n, 'CASPIAN', 'Neither, scholar. \u2014 I am visiting on behalf of someone we both work for now. \u2014 *small, exhausted smile* \u2014 You will not believe who.', 22);
      await wait(3200);

      // Lucien, dry
      await say(n, 'LUCIEN', 'I will absolutely believe who. \u2014 *gestures toward the desk with his pen* \u2014 Sit. \u2014 The brandy in the third drawer is still good. \u2014 I have been saving it for a reason I did not know yet.', 22);
      await wait(3600);

      // Setting the table \u2014 their easy old shorthand
      await type(n.line, '*Caspian sits. Lucien retrieves the brandy and two glasses. He is not in a hurry. The wards on the door re-tighten themselves behind the prince. They have known to do this for two decades.*', 22);
      await wait(3000);

      // Caspian \u2014 the actual reason for the visit
      await say(n, 'CASPIAN', 'My grandmother is awake. \u2014 You knew. \u2014 You wrote me a letter that did not arrive at the palace. The seal was broken before it crossed the gate. \u2014 You suspected she was reading my mail. \u2014 You were right.', 22);
      await wait(3800);

      // Lucien
      await say(n, 'LUCIEN', '*pours* \u2014 I have been suspecting that for nine years. \u2014 The mail problem is the smallest problem. \u2014 The Weaver is the largest one. \u2014 My grandmother \u2014 sorry, YOUR grandmother \u2014 is hunting her.', 22);
      await wait(3400);

      // Caspian, hand on his temple
      await say(n, 'CASPIAN', 'I know. \u2014 She has been climbing your tower as well as mine, hasn\u2019t she. \u2014 Last week. \u2014 Asked you about your writing.', 22);
      await wait(2800);

      await say(n, 'LUCIEN', '*small bow* \u2014 You are very well-informed for a man whose mail is being read. \u2014 Yes. She came. I lied. She knew.', 22);
      await wait(3000);

      // Caspian, suddenly real
      await say(n, 'CASPIAN', 'Lucien. \u2014 I am not here as the Crown tonight. \u2014 I am here as the boy you used to argue with about the geometry of the seal. \u2014 The Weaver is mine. \u2014 The Weaver is yours. \u2014 Apparently the Weaver is also Alistair\u2019s and Elian\u2019s and Lyra\u2019s and a Nocthera prince\u2019s. \u2014 I have been counting. We are seven men deep into protecting one woman. \u2014 We need a strategy.', 22);
      await wait(4400);

      // Lucien \u2014 the dry warmth, the old friendship
      await say(n, 'LUCIEN', '*the smallest smile, almost not there* \u2014 You used to be terrible at strategy. \u2014 You were always trying to charm your way through it. \u2014 Has that changed?', 22);
      await wait(3200);

      // Caspian \u2014 self-aware, tired
      await say(n, 'CASPIAN', '*smiles back, also small* \u2014 I am still trying to charm my way through it. \u2014 But not WITH her. \u2014 I do not charm her. I do not know how. \u2014 So apparently I have one strategy left. \u2014 Bring brandy to a tower and ask the smartest man in the kingdom for help.', 22);
      await wait(3800);

      // Lucien \u2014 the old softness lands
      n.l.img.src = L_POSE;
      await say(n, 'LUCIEN', '*looks at him properly for the first time in fifteen years* \u2014 \u2026You have grown up, Caspian. \u2014 I am sorry I missed it. \u2014 I was up here. Writing.', 22);
      await wait(3400);

      // Caspian \u2014 a single soft beat
      await say(n, 'CASPIAN', 'I read every paper you published. \u2014 The good ones and the bad ones. \u2014 The footnotes more than once. \u2014 Do not act surprised, scholar. I am not as charming as I look but I am also not as stupid as the court says.', 22);
      await wait(3800);

      // Lucien \u2014 caught off guard, recovers with grace
      await say(n, 'LUCIEN', '*ink-stained hand around the brandy glass* \u2014 \u2026I am surprised. \u2014 I will pretend not to be. \u2014 *small bow* \u2014 Your Highness.', 22);
      await wait(2800);

      // The actual strategy
      n.c.img.src = C_POSE;
      await say(n, 'CASPIAN', 'Here is what I propose. \u2014 You take the records. The history. The publishing. The truth. \u2014 I take the politics. The court. The face. The lie that buys time. \u2014 Alistair takes the gate. \u2014 Elian takes the woods. \u2014 Lyra takes the coast. \u2014 The Weaver gets to live a life inside our four directions.', 22);
      await wait(4400);

      // Lucien \u2014 catches the omission
      await say(n, 'LUCIEN', 'You have not assigned the prince of Nocthera a direction.', 22);
      await wait(2200);

      // Caspian, dry
      await say(n, 'CASPIAN', 'No. \u2014 He has assigned himself one. \u2014 Down. \u2014 He takes the seal. The leak. The thing my grandmother spent six centuries pretending was not there. \u2014 We do not need to give him an order. He is already on duty.', 22);
      await wait(3800);

      // Lucien, dry warmth
      await say(n, 'LUCIEN', 'Five men, one woman, one ghost-prince. \u2014 *lifts the glass* \u2014 To being inconvenient enough to outlive your grandmother.', 22);
      await wait(2800);

      await say(n, 'CASPIAN', '*lifts his* \u2014 To being inconvenient. \u2014 And to forgiving each other for the years we wasted being polite about it.', 22);
      await wait(3000);

      // The closer \u2014 a real moment between them
      await say(n, 'LUCIEN', '*sets the glass down, looks at him* \u2014 \u2026Caspian. If she comes for you first \u2014 send the boy to me. \u2014 The Captain. \u2014 He will get up the tower in seven minutes. \u2014 I will know what to do.', 22);
      await wait(3800);

      await say(n, 'CASPIAN', '*nods once* \u2014 If she comes for you first \u2014 the same. \u2014 Send the staff. \u2014 I will see it from the balcony. \u2014 \u2026I always see what is on your tower from the balcony, scholar. \u2014 I have for years.', 22);
      await wait(4000);

      // Lucien \u2014 the smallest exhale
      await say(n, 'LUCIEN', '*so quietly the wards lean to hear* \u2014 I have always known that, Your Highness.', 22);
      await wait(2800);

      // Closing narration
      n.speaker.textContent = '';
      await type(n.line, 'They drink the rest of the brandy slowly. \u2014 Twenty years of guarded politeness, set down on the desk between them next to the page Lucien turned facedown. \u2014 The Weaver does not know any of this is happening tonight. \u2014 She does not need to. \u2014 Her court is just quietly getting larger.', 22);
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
      '#dress-panel:not(.hidden)', '#story-overlay:not(.hidden)',
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

  window.MSCrossCaspianLucien = {
    play,
    force() { lsSet(FLAG_SEEN, ''); _firing = false; tick(); },
    reset() { try { localStorage.removeItem(FLAG_SEEN); } catch (_) {} },
    seenKey: FLAG_SEEN
  };
})();
