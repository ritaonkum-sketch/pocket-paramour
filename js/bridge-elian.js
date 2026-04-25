/* bridge-elian.js — chain step 2: the slip, the smoke, the cold appraisal
 * ============================================================================
 *   Days have passed in the maid's chamber. The castle is too still. No one
 *   will tell you where you are or what you are. At night you slip through
 *   the kitchen postern and run into the woods to look for the place you
 *   first woke — hoping the ground will tell you something.
 *
 *   You get lost deeper than the south wood. You follow smoke. A man with a
 *   knife sits sharpening it slowly. He doesn't get up. He doesn't reach
 *   for you. He looks at you the way one looks at a wounded animal one has
 *   seen a hundred times. He bandages your foot before he asks the question.
 *
 *   The question: "What are you."
 *
 *   He is cold to Soul Weavers, not to you. He has lost two before. Falling
 *   for you is going to cost him every wall he's built. That is the route.
 *
 *   On finish: PPChain.advance(2) — Elian unlocks with a toast.
 * ============================================================================
 */

(function () {
  'use strict';

  const PORTRAITS = {
    weathered: 'assets/elian/body/weathered.png',
    guarded:   'assets/elian/body/guarded.png',
    tracking:  'assets/elian/body/tracking.png',
    calm:      'assets/elian/body/calm.png',
    warm:      'assets/elian/body/warm.png'
  };

  const BEATS = [
    { kind: 'narration',
      text: 'The chamber is too still. The castle answers no questions. Three days of meals slid under the door by people who will not look at you.',
      portrait: null },

    { kind: 'narration',
      text: 'Tonight you slip the latch. The kitchen postern is unguarded after the third bell. You take a kitchen knife you cannot fight with and a cloak that is not yours.',
      portrait: null },

    { kind: 'narration',
      text: 'You walk south. You walk past the gate-line. You walk until the lights of the castle are the size of a coin behind you. You are looking for the place you first woke. You think the ground will know.',
      portrait: null },

    { kind: 'narration',
      text: 'The wood gets older. The trees get bigger. You realise, slowly, that you are not where you meant to be. Your foot is bleeding through the bandage someone wrapped for you.',
      portrait: null },

    { kind: 'narration',
      text: 'You smell smoke. Not a fire smoke — a careful smoke. Old wood, slow to burn. You follow it through brambles you cannot see in the dark.',
      portrait: null },

    { kind: 'narration',
      text: 'A clearing. A fire. A man sitting on a fallen log, a knife laid across his knee, a whetstone moving in slow patient strokes. He does not look up when you step into the light.',
      portrait: PORTRAITS.weathered },

    { kind: 'line', speaker: 'THE MAN',
      text: 'You are bleeding. Sit down before you fall down. The log to your left.',
      portrait: PORTRAITS.weathered },

    { kind: 'narration',
      text: 'He says it without warmth. The way you would say it to any wounded animal that had wandered into your camp.',
      portrait: PORTRAITS.weathered },

    { kind: 'narration',
      text: 'You sit. He keeps sharpening. Three more passes of the stone, unhurried. Only then does he set the knife aside and reach for a strip of clean linen and a small clay jar.',
      portrait: PORTRAITS.guarded },

    { kind: 'line', speaker: 'THE MAN',
      text: 'Foot. Off. I will not ask twice.',
      portrait: PORTRAITS.guarded },

    { kind: 'narration',
      text: 'He cleans the cut. His hands are steady, calloused, careful. He is faster and gentler than the castle physicians. He has done this on himself too many times.',
      portrait: PORTRAITS.tracking },

    { kind: 'line', speaker: 'THE MAN',
      text: 'You are a long way from the captain\u2019s gate, miss.',
      portrait: PORTRAITS.tracking },

    { kind: 'narration',
      text: 'You go very still. He knows about Alistair. The kingdom is small.',
      portrait: PORTRAITS.tracking },

    { kind: 'line', speaker: 'THE MAN',
      text: 'I am not going to take you back. He will be hunting for you in three hours when the watch turns. I will not make that easy.',
      portrait: PORTRAITS.tracking },

    { kind: 'narration',
      text: 'He ties off the bandage. He puts his hand briefly on your ankle to steady it as he works. Then he takes his hand away. He does not let it linger.',
      portrait: PORTRAITS.calm },

    { kind: 'line', speaker: 'THE MAN',
      text: 'My name is Elian. I keep the south Thornwood. I do not keep castles.',
      portrait: PORTRAITS.calm },

    { kind: 'narration',
      text: 'He hands you a strip of dried venison. You eat. He watches the way you eat. The way you flinch at the salt. The way you do not know to dust the bark off first.',
      portrait: PORTRAITS.calm },

    { kind: 'line', speaker: 'ELIAN',
      text: 'Eat slower. You are not hungry the way someone who lives here is hungry. You are hungry the way someone newly here is hungry. That is interesting.',
      portrait: PORTRAITS.calm },

    { kind: 'narration',
      text: 'He says interesting the way another man might say dangerous.',
      portrait: PORTRAITS.calm },

    { kind: 'line', speaker: 'ELIAN',
      text: 'Now I will ask you what the captain has not asked you, because he is too kind to. What are you.',
      portrait: PORTRAITS.tracking },

    { kind: 'narration',
      text: 'You do not have an answer. He sees that. He does not look away. He lets you not have an answer for a long time.',
      portrait: PORTRAITS.tracking },

    { kind: 'line', speaker: 'ELIAN',
      text: 'I do not know what you are. But I can see you do not either. That is more honest than anything anyone in that castle has said to you. So we will start there.',
      portrait: PORTRAITS.warm },

    { kind: 'narration',
      text: 'For the first time in three days, something in your chest unclenches. He notices. His face does not move. But something behind his eyes — closes, like a man stepping back from a fire he meant to admire only briefly.',
      portrait: PORTRAITS.warm },

    { kind: 'line', speaker: 'ELIAN',
      text: 'Sleep here tonight. The fire will hold. I will sit. In the morning I will set you on the south coast road. There is someone there who knows what people like you are. I do not.',
      portrait: PORTRAITS.warm },

    { kind: 'line', speaker: 'ELIAN',
      text: 'Do not fall in love with me, miss. I have buried two of you already. I do not have a third in me.',
      portrait: PORTRAITS.guarded },

    { kind: 'narration',
      text: 'He says it like a fact. Like he has rehearsed it. Like he is warning himself, not you.',
      portrait: PORTRAITS.guarded },

    { kind: 'narration',
      text: 'You sleep by the fire. You do not dream. When you wake, he is already up, already packed, already not looking at you.',
      portrait: null },

    { kind: 'tutorial',
      text: 'A new face is open to you. Elian\u2019s route is unlocked. Care for him — slowly, patiently. He will not let you in fast. That is the point.',
      cta: 'Continue' }
  ];

  let _root = null;

  async function play() {
    if (_root) return;
    _root = document.createElement('div');
    _root.className = 'pp-bridge-root';
    _root.innerHTML = `
      <div class="pp-bridge-bg" style="background:radial-gradient(ellipse at 50% 65%, #1a2418 0%, #06080a 80%);"></div>
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

  async function runBeats() {
    const portraitEl = _root.querySelector('.pp-bridge-portrait');
    const dir = _root.querySelector('.pp-bridge-direction');
    const lineEl = _root.querySelector('.pp-bridge-line');
    const cta = _root.querySelector('.pp-bridge-cta');

    for (const beat of BEATS) {
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
        await wait(200);
        lineEl.style.display = 'none';
        dir.classList.remove('show');
        await wait(240);
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
    _root.classList.remove('show');
    setTimeout(() => {
      if (_root && _root.parentNode) _root.parentNode.removeChild(_root);
      _root = null;
      if (window.PPChain && typeof window.PPChain.advance === 'function') {
        window.PPChain.advance(2);
      }
      // Stash a flag the Lyra bridge will look for ("Elian gave you a map.")
      try { localStorage.setItem('pp_bridge_elian_gave_map', '1'); } catch (_) {}
    }, 700);
  }

  window.PPBridgeElian = { play };
})();
