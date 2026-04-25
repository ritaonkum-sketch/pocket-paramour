/* bridge-alistair.js — chain step 1: rescue, secret, maid's chamber, meet-cute
 * ============================================================================
 *   The Captain on solo dawn patrol finds her unconscious in the south wood.
 *   He carries her back. While she's half-conscious she murmurs a name in a
 *   language he doesn't recognise — he memorises it without telling her.
 *   He puts her in the maid's chamber in the south wing because that is the
 *   only chamber a captain can put a stranger in without explaining himself
 *   to the chamberlain. He stands watch by the door for a full day.
 *
 *   Meet-cute: she wakes. He's there. He calls her "miss" because he doesn't
 *   have her name yet. He covered for her before he knew her name.
 *
 *   On finish: PPChain.advance(1) — Alistair is met, others stay LOCKED until
 *   tutorial gate (affection 25 + full care cycle).
 *
 *   Reuses the .pp-bridge-* visual idiom from world-arrival.js. Falls back to
 *   gradient backgrounds if portrait assets are missing.
 * ============================================================================
 */

(function () {
  'use strict';

  const FLAG_PLAYED = 'pp_bridge_alistair_played';
  const PORTRAITS = {
    standing: 'assets/alistair/body/crossarms.png',
    talking:  'assets/alistair/body/talking6.png',
    softer:   'assets/alistair/body/wondering.png'
  };

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  // Beats: { kind: 'narration' | 'line' | 'tutorial', ... }
  // 'narration' = italic stage direction (top of card)
  // 'line'      = spoken dialogue (the bubble)
  // 'tutorial'  = the soft tutorial nudge at the end
  const BEATS = [
    { kind: 'narration',
      text: 'A man\u2019s shadow falls across you. Hooves stop. Boots in moss. He kneels — exact, not gentle, not rough.',
      portrait: null },

    { kind: 'narration',
      text: 'You feel his hand at your wrist. Checking the pulse. Then under your shoulders. He lifts you the way one lifts a wounded thing they intend to keep alive.',
      portrait: PORTRAITS.standing },

    { kind: 'line', speaker: 'CAPTAIN',
      text: 'Stay with me, miss. Eyes open if you can. Twenty minutes to the south gate. I will not lose you between here and there.',
      portrait: PORTRAITS.standing },

    { kind: 'narration',
      text: 'You drift. The horse moves under you. Somewhere inside the drift, you say a word — a name, in a language that is not the language of this place. You do not remember saying it.',
      portrait: PORTRAITS.standing },

    { kind: 'narration',
      text: 'He hears it. He memorises it without telling you. He will write it on a slip of paper later and not show it to anyone yet.',
      portrait: PORTRAITS.standing },

    { kind: 'narration',
      text: 'You wake to the sound of a door not opening. Stone walls. A small window. A bed that smells of linen too clean for an inn.',
      portrait: null },

    { kind: 'narration',
      text: 'A man is standing inside the door, hands behind his back, sword at his hip but the hand nowhere near the hilt. He has not sat down. He has not looked away.',
      portrait: PORTRAITS.standing },

    { kind: 'line', speaker: 'ALISTAIR',
      text: 'You have been asleep for one full day. I have been here. You are safe. When you can sit up, I will get you water. Not before.',
      portrait: PORTRAITS.standing },

    { kind: 'narration',
      text: 'You sit up too fast. The room tilts. He is there before you tip over — one hand under your shoulder, one against the wall behind your head. Bracing the world for you.',
      portrait: PORTRAITS.talking },

    { kind: 'line', speaker: 'ALISTAIR',
      text: 'Slowly. Slowly. There is no audience. No one is waiting for you to be brave. Drink first, then talk.',
      portrait: PORTRAITS.talking },

    { kind: 'narration',
      text: 'He passes you a cup of water. The cup is plain. The room is plain. You realise, looking past him at the corridor, that this is a maid\u2019s chamber. Servants\u2019 wing. The kind of room nobody asks about.',
      portrait: PORTRAITS.talking },

    { kind: 'line', speaker: 'ALISTAIR',
      text: 'I should have taken you to the chamberlain. He will want a name and a province and three documents you cannot give him. So you are here instead. I will explain it later. To him. Not to you.',
      portrait: PORTRAITS.softer },

    { kind: 'narration',
      text: 'He covered for you. Before he knew your name. You feel that land somewhere behind your ribs.',
      portrait: PORTRAITS.softer },

    { kind: 'line', speaker: 'ALISTAIR',
      text: 'I am Alistair. Captain of the Guard, south gate. While you mend, I am the only person who knows you are in this castle. That will not always be true. Today it is.',
      portrait: PORTRAITS.softer },

    { kind: 'line', speaker: 'ALISTAIR',
      text: 'I will not ask you what you are. Not yet. You do not know either, do you, miss.',
      portrait: PORTRAITS.softer },

    { kind: 'narration',
      text: 'He says it like a fact, not a question. Like something he has already decided and is telling you so you do not have to decide it alone.',
      portrait: PORTRAITS.softer },

    // Tutorial nudge — the soft handover to the care loop
    { kind: 'tutorial',
      text: 'Care for him, Weaver. Bring him water, mend the seam in his cloak, eat with him at the captain\u2019s table. He does not ask. You will know what to do.',
      cta: 'Begin caring for Alistair' }
  ];

  let _root = null;

  async function play() {
    if (_root) return;
    if (!window.PPWorldArrival) {
      // styles are injected by world-arrival.js; ensure they exist
      const ev = new Event('DOMContentLoaded');
      document.dispatchEvent(ev);
    }
    ensureStyles();
    _root = document.createElement('div');
    _root.className = 'pp-bridge-root';
    _root.innerHTML = `
      <div class="pp-bridge-bg" style="background:radial-gradient(ellipse at 50% 60%, #1d1733 0%, #0a0816 80%);"></div>
      <div class="pp-bridge-vignette"></div>
      <button class="pp-bridge-skip" data-skip>Skip ›</button>
      <div class="pp-bridge-stage">
        <img class="pp-bridge-portrait" alt="" style="display:none;" />
        <div class="pp-bridge-direction"></div>
        <div class="pp-bridge-line" style="display:none;"></div>
        <button class="pp-bridge-cta" style="display:none;">Continue</button>
      </div>
    `;
    document.body.appendChild(_root);
    _root.querySelector('[data-skip]').addEventListener('click', skip);
    // eslint-disable-next-line no-unused-expressions
    _root.offsetHeight;
    _root.classList.add('show');
    await runBeats();
  }

  function ensureStyles() {
    // world-arrival.js injects #pp-bridge-styles. If it has not run yet
    // (e.g. on a save where chain step is already 0 but arrival was skipped),
    // inline a minimal set so we are not dependent on load order.
    if (document.getElementById('pp-bridge-styles')) return;
    const link = document.createElement('script');
    link.src = 'js/world-arrival.js';
    document.head.appendChild(link);
  }

  async function runBeats() {
    const portraitEl = _root.querySelector('.pp-bridge-portrait');
    const dir        = _root.querySelector('.pp-bridge-direction');
    const lineEl     = _root.querySelector('.pp-bridge-line');
    const cta        = _root.querySelector('.pp-bridge-cta');

    for (const beat of BEATS) {
      // Update portrait if changed
      if (beat.portrait) {
        if (portraitEl.getAttribute('src') !== beat.portrait) {
          portraitEl.classList.remove('show');
          await wait(220);
          portraitEl.src = beat.portrait;
          portraitEl.style.display = '';
          // eslint-disable-next-line no-unused-expressions
          portraitEl.offsetHeight;
          portraitEl.classList.add('show');
        }
      }

      if (beat.kind === 'narration') {
        lineEl.classList.remove('show');
        await wait(220);
        lineEl.style.display = 'none';
        dir.classList.remove('show');
        await wait(260);
        dir.textContent = beat.text;
        dir.classList.add('show');
        await waitForTap(3700);
      } else if (beat.kind === 'line') {
        dir.classList.remove('show');
        await wait(180);
        lineEl.style.display = '';
        lineEl.innerHTML = `<span class="pp-speaker">${beat.speaker}</span>${beat.text}`;
        // eslint-disable-next-line no-unused-expressions
        lineEl.offsetHeight;
        lineEl.classList.add('show');
        await waitForTap(4500);
      } else if (beat.kind === 'tutorial') {
        // Final beat — show direction + CTA together, then hand off
        lineEl.classList.remove('show');
        await wait(200);
        lineEl.style.display = 'none';
        dir.textContent = beat.text;
        dir.classList.add('show');
        cta.style.display = '';
        cta.textContent = beat.cta;
        // eslint-disable-next-line no-unused-expressions
        cta.offsetHeight;
        cta.classList.add('show');
        await new Promise((res) => cta.addEventListener('click', res, { once: true }));
        finish();
        return;
      }
    }
    finish();
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function waitForTap(autoMs) {
    return new Promise((resolve) => {
      let done = false;
      const handler = (e) => {
        if (e.target.closest && e.target.closest('.pp-bridge-cta, [data-skip]')) return;
        if (done) return; done = true; cleanup(); resolve();
      };
      _root.addEventListener('click', handler, true);
      const t = setTimeout(() => { if (done) return; done = true; cleanup(); resolve(); }, autoMs);
      function cleanup() { clearTimeout(t); _root.removeEventListener('click', handler, true); }
    });
  }

  function skip() { finish(); }

  function finish() {
    if (!_root) return;
    lsSet(FLAG_PLAYED, '1');
    // Ensure main-story flag is on so downstream systems honour the chain
    if (lsGet('pp_main_story_enabled') !== '1') lsSet('pp_main_story_enabled', '1');
    _root.classList.remove('show');
    setTimeout(() => {
      if (_root && _root.parentNode) _root.parentNode.removeChild(_root);
      _root = null;
      // Advance the chain. PPChain handles the unlock toast and grid refresh.
      if (window.PPChain && typeof window.PPChain.advance === 'function') {
        window.PPChain.advance(1);
      } else {
        // Fallback: set state directly so we never strand the player.
        lsSet('pp_chain_step', '1');
        lsSet('pp_met_alistair', '1');
        lsSet('pp_ms_encounter_alistair_seen', '1');
      }
      // Auto-route the player to Alistair's tamagotchi care for the tutorial.
      try {
        if (typeof window.selectCharacter === 'function') window.selectCharacter('alistair');
        // Try to jump to play screen if game.js exposes a hook; otherwise the
        // player can pick him from the (now-locked-except-alistair) grid.
        const playBtn = document.querySelector('.select-card[data-character="alistair"]');
        if (playBtn) setTimeout(() => playBtn.click(), 300);
      } catch (_) {}
    }, 700);
  }

  window.PPBridgeAlistair = { play };
})();
