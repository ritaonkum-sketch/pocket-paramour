/* bridge-lyra.js — chain step 3: the south coast journey, the cave-mouth, the named stranger
 * ============================================================================
 *   Elian gave you a birch-bark map and a strip of his own dried venison and
 *   a flask of spring water. The map ends at "the singing stones." He said:
 *   "She'll find you before the stones do."
 *
 *   You walk south for a day and a half along the south coast road. The wind
 *   changes. The air gets salt. You see the sea for the first time in this
 *   life — that you can remember.
 *
 *   You round a headland. There is a cave-mouth in the cliff. There is a
 *   woman barefoot in the surf, hair full of sea-light, smiling like she has
 *   been expecting a friend.
 *
 *   She is the first person who NAMES the word "Weaver."
 *
 *   On finish: PPChain.advance(3) — Lyra unlocks with a toast.
 * ============================================================================
 */

(function () {
  'use strict';

  const PORTRAITS = {
    casual:    'assets/lyra/body/casual1.png',
    happy:     'assets/lyra/body/happy.png',
    falllove:  'assets/lyra/body/falllove2.png',
    eyesclosed:'assets/lyra/body/eyes-closed.png'
  };

  const BEATS = [
    { kind: 'narration',
      text: 'In the morning Elian hands you three things: a birch-bark map, a flask, a strip of dried venison. He does not look at you while he hands them over.',
      portrait: null },

    { kind: 'line', speaker: 'ELIAN',
      text: 'Walk south. The road follows the cliff. When the cliff ends, the road ends. There is a cave there. There is a witch there. She will find you before the stones do.',
      portrait: null },

    { kind: 'line', speaker: 'ELIAN',
      text: 'Do not look back at the wood. I am not coming with you. Walk.',
      portrait: null },

    { kind: 'narration',
      text: 'You walk. The wood thins. The light gets thinner. The trees get smaller. The smell of moss gives way to a smell you have not had a name for: salt.',
      portrait: null },

    { kind: 'narration',
      text: 'By midday you are walking the cliff road. The land falls away on your left into a colour you cannot believe is a colour. The sea. You stop. You sit down on the road. You stare for a long time.',
      portrait: null },

    { kind: 'narration',
      text: 'A gull screams overhead. You do not flinch. You do not know why you do not flinch.',
      portrait: null },

    { kind: 'narration',
      text: 'You walk again. The light goes amber. The wind goes salt-and-iron. You eat the last of the venison. The flask is empty.',
      portrait: null },

    { kind: 'narration',
      text: 'The cliff ends. The road ends. There is a path of black stone steps cut into the cliff face. Below — a beach the colour of ash, and a cave-mouth open to the sea like a held breath.',
      portrait: null },

    { kind: 'narration',
      text: 'A woman is standing barefoot in the surf. She is leaning on a staff that has a salt crystal at the top. The wind is pulling her hair behind her like a banner. She has not turned to look at you.',
      portrait: PORTRAITS.eyesclosed },

    { kind: 'narration',
      text: 'You step down to the sand. The sand is cold. She turns. She is younger than you expected. She is smiling like she already loves you.',
      portrait: PORTRAITS.casual },

    { kind: 'line', speaker: 'THE WOMAN',
      text: 'You took two days. The cave told me you would take three. I owe the cave a song.',
      portrait: PORTRAITS.casual },

    { kind: 'narration',
      text: 'Her voice has a low note in it that the cliff catches and gives back. You feel it in your sternum.',
      portrait: PORTRAITS.casual },

    { kind: 'line', speaker: 'THE WOMAN',
      text: 'I am Lyra. I sing for a living. The sea pays me in answers. You are an answer the sea has been singing for two nights now and I did not know what I was singing.',
      portrait: PORTRAITS.happy },

    { kind: 'narration',
      text: 'She walks out of the surf. She does not dry her feet. She comes close enough that you smell salt and rosemary on her skin. She tilts her head and looks at you for a long time, openly, the way someone looks at a thing they have only seen in books.',
      portrait: PORTRAITS.happy },

    { kind: 'line', speaker: 'LYRA',
      text: 'I know your name. Or part of it. Weaver.',
      portrait: PORTRAITS.happy },

    { kind: 'narration',
      text: 'The word lands in you like a stone in a deep pool. The pool has been waiting for the stone.',
      portrait: PORTRAITS.happy },

    { kind: 'line', speaker: 'LYRA',
      text: 'Yes. There. You felt it. You are the seventh. The cave told me. The cave does not lie. The cave is, at worst, dramatic.',
      portrait: PORTRAITS.falllove },

    { kind: 'narration',
      text: 'She takes your hand. Her hand is wet and cold and steady. She walks you up to the cave-mouth. The cave is warmer than the air. The cave smells of clean water and old stone and something faintly like a song you almost know.',
      portrait: PORTRAITS.falllove },

    { kind: 'line', speaker: 'LYRA',
      text: 'Sit. Eat. You are exhausted and the cave is going to be very loud about it if I do not feed you. There is broth on the fire. The broth is good. I made it for you.',
      portrait: PORTRAITS.falllove },

    { kind: 'narration',
      text: 'She made it for you. She knew you were coming. You sit. The broth is good.',
      portrait: PORTRAITS.casual },

    { kind: 'line', speaker: 'LYRA',
      text: 'I am going to tell you what you are. Not all of it. The cave will be jealous if I tell you all of it on the first night. But enough.',
      portrait: PORTRAITS.casual },

    { kind: 'line', speaker: 'LYRA',
      text: 'You are a Soul Weaver. There have been six. They are all dead. You are the seventh. We have been waiting a long time. I am very glad it is you.',
      portrait: PORTRAITS.happy },

    { kind: 'narration',
      text: 'She says it like she is telling you a kind story. She is the first person in this world who has told you the truth. You will not forget who told you first.',
      portrait: PORTRAITS.happy },

    { kind: 'tutorial',
      text: 'A new face is open to you. Lyra\u2019s route is unlocked. She loves loudly and easily — but the song under the song is older than she lets on.',
      cta: 'Continue' }
  ];

  let _root = null;

  async function play() {
    if (_root) return;
    _root = document.createElement('div');
    _root.className = 'pp-bridge-root';
    _root.innerHTML = `
      <div class="pp-bridge-bg" style="background:radial-gradient(ellipse at 50% 70%, #14283a 0%, #060c14 80%);"></div>
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
    if (!_root.querySelector('.pp-bridge-tap-hint')) {
      const hint = document.createElement('div');
      hint.className = 'pp-bridge-tap-hint';
      hint.textContent = 'tap to continue \u203A';
      _root.appendChild(hint);
    }
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

    async function clearText() {
      let changed = false;
      if (dir.classList.contains('show'))    { dir.classList.remove('show');    changed = true; }
      if (lineEl.classList.contains('show')) { lineEl.classList.remove('show'); changed = true; }
      if (changed) await wait(660);
    }

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
        await clearText();
        dir.textContent = beat.text;
        // eslint-disable-next-line no-unused-expressions
        dir.offsetHeight;
        dir.classList.add('show');
        await waitForTap();
      } else if (beat.kind === 'line') {
        await clearText();
        lineEl.innerHTML = `<span class="pp-speaker">${beat.speaker}</span>${beat.text}`;
        // eslint-disable-next-line no-unused-expressions
        lineEl.offsetHeight;
        lineEl.classList.add('show');
        await waitForTap();
      } else if (beat.kind === 'tutorial') {
        await clearText();
        dir.textContent = beat.text;
        // eslint-disable-next-line no-unused-expressions
        dir.offsetHeight;
        dir.classList.add('show');
        _root.classList.add('cta-mode');
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
  function waitForTap() {
    return new Promise((resolve) => {
      let done = false;
      const handler = (e) => {
        if (e.target.closest && e.target.closest('.pp-bridge-cta, [data-skip]')) return;
        if (done) return; done = true; cleanup(); resolve();
      };
      _root.addEventListener('click', handler, true);
      function cleanup() { _root.removeEventListener('click', handler, true); }
    });
  }

  function skip() { finish(); }

  function finish() {
    if (!_root) return;
    try { localStorage.setItem('pp_intro_lyra', '1'); } catch (_) {}
    _root.classList.remove('show');
    setTimeout(() => {
      if (_root && _root.parentNode) _root.parentNode.removeChild(_root);
      _root = null;
      try { localStorage.setItem('pp_chapter_done_b_lyra', '1'); } catch (_) {}
      var stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
        ? window.PPChain.step() : 0;
      if (window.PPChain && typeof window.PPChain.advance === 'function') {
        window.PPChain.advance(3);
        if (stepBefore < 3 && typeof window.PPChain.fireChapterFor === 'function') {
          window.PPChain.fireChapterFor(3);
        }
      }
    }, 700);
  }

  window.PPBridgeLyra = { play };
})();
