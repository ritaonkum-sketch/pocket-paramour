/* bridge-noir.js — chain step 6: the dark pull, the alley, the chin-lift
 * ============================================================================
 *   Days into the castle. Days into the careful courtesies. The Lady Weaver
 *   has a chamber, a guard, a tower she may visit. She is being kept the way
 *   one keeps something rare and breakable.
 *
 *   But somewhere outside the castle there is a real pull. A dark current
 *   under the kingdom that knows what she is. It calls. Quietly at first,
 *   then less quietly. The maps in Lucien's tower flicker when she walks
 *   past. Her dreams have a door in them she has not opened.
 *
 *   Tonight she sneaks out. Down the back stair, past the kitchen, through
 *   a sleeping merchant quarter she has never seen. She is being pulled
 *   somewhere — a square, a corner, a thing under the city.
 *
 *   Noir is not there for her. He is in the city tonight on his own
 *   business — old business — investigating something he believes will
 *   give him leverage on the woman who exiled him six hundred years ago.
 *
 *   He sees her. He sees what she is walking toward. And whatever revenge
 *   he had been pursuing tonight — abandons it. Pure chance. Pure mercy
 *   he did not know was in him.
 *
 *   What follows is not a rescue. It is a hunter pulling a doe out of a
 *   trap, and being honest with the doe about what he is.
 *
 *   On finish: PPChain.advance(6) — Noir unlocks with a toast.
 * ============================================================================
 */

(function () {
  'use strict';

  const PORTRAITS = {
    shadow:    'assets/noir/body/shadow.png',
    seductive: 'assets/noir/body/seductive.png',
    dominant:  'assets/noir/body/dominant.png',
    whisper:   'assets/noir/body/whisper.png',
    vulnerable:'assets/noir/body/vulnerable.png',
    casual:    'assets/noir/body/casual1.png'
  };

  const BEATS = [
    { kind: 'narration',
      text: 'Three nights now you have woken at the same hour. There is a door in your dreams. You have not opened it. The door is breathing.',
      portrait: null },

    { kind: 'narration',
      text: 'Tonight you do not go back to sleep. You sit up in the silk-curtained bed of a woman who is not exactly you yet. You can feel something pulling at the floor under your feet. Not the room. The kingdom.',
      portrait: null },

    { kind: 'narration',
      text: 'You dress in plain wool. You leave the silk on the chair. You go down the back stair past two sleeping pages and the cook who turns deliberately away from you in the kitchen because he has been paid not to see.',
      portrait: null },

    { kind: 'narration',
      text: 'The merchant quarter at the third bell is a different city. Lanterns out. Dogs asleep. Six watchful streets between you and whatever is calling. You walk through all six. Nobody sees you. Nobody is meant to see you. You should find that strange. You do not, yet.',
      portrait: null },

    { kind: 'narration',
      text: 'You round a corner into a square you have never been in. There is a black stone in the centre of the square. The black stone is not on any map you have seen in Lucien\u2019s tower. The black stone is humming.',
      portrait: null },

    { kind: 'narration',
      text: 'You take a step toward it. Your blood takes a step toward it. The pull is not in your mind. It is in your bones. Two more steps and you are six feet from it. The hum gets louder. The square gets — thinner.',
      portrait: null },

    { kind: 'narration',
      text: 'A hand closes around your wrist from behind. Not hard. Exact. Cold the way river-water is cold. Your whole body goes still in a way it has not been still for any other man in this kingdom.',
      portrait: PORTRAITS.shadow },

    { kind: 'line', speaker: 'A LOW VOICE',
      text: 'You do not know how much you stand out. Walk with me. Now. Do not look at the stone. Do not. Do not.',
      portrait: PORTRAITS.shadow },

    { kind: 'narration',
      text: 'He pulls you backward — three steps, six steps, into the mouth of an alley off the square. The hum drops away the moment you cross out of the square. Your legs almost give. He catches your weight easily.',
      portrait: PORTRAITS.dominant },

    { kind: 'narration',
      text: 'The alley is narrow. He turns you, with one hand at your shoulder and one still at your wrist, and he sets you against the cold stone wall. He does not press hard. He simply makes leaving impossible. There is a difference.',
      portrait: PORTRAITS.dominant },

    { kind: 'narration',
      text: 'Your free hand goes up — to push, to slap, you do not know yet. He catches it, calmly, mid-air. He has both your hands now, gathered in one of his, lifted just above your head against the wall. He does not lean in. Not yet.',
      portrait: PORTRAITS.dominant },

    { kind: 'line', speaker: 'THE MAN',
      text: 'Yes. There. Fight. I prefer it. The ones that do not fight are not interesting. Hold still a moment longer. I am being polite.',
      portrait: PORTRAITS.seductive },

    { kind: 'narration',
      text: 'His other hand — the free one — comes up to your face. He does not touch your mouth. He puts his thumb under your chin and tilts your head back, slow as turning a page, until you are looking up into his face for the first time.',
      portrait: PORTRAITS.seductive },

    { kind: 'narration',
      text: 'He is younger than the voice. Or older. You cannot tell. The eyes are the wrong colour for the face. The face is too still. He is looking at you the way a starving man looks at a meal he is not yet allowed to eat.',
      portrait: PORTRAITS.seductive },

    { kind: 'line', speaker: 'THE MAN',
      text: 'Interesting. Interesting creature we have here. I came to this square tonight for an entirely different reason. I had a small revenge planned. I was going to be busy until dawn.',
      portrait: PORTRAITS.seductive },

    { kind: 'line', speaker: 'THE MAN',
      text: 'And then the kingdom moved a small piece I did not know it had into my path. Mm. I do not like coincidences. I find I like this one.',
      portrait: PORTRAITS.dominant },

    { kind: 'narration',
      text: 'He leans in. Not to kiss. To put his mouth at your ear. You feel him breathe. Your skin does the thing skin does when something dangerous gets very close and decides not to bite — yet.',
      portrait: PORTRAITS.whisper },

    { kind: 'line', speaker: 'THE MAN (whispered)',
      text: 'You walked through six watchful streets and nobody saw you. I saw you. That should frighten you more than I do. The thing you were walking toward is older than I am. It would have eaten you down to the bones and the kingdom would have written a polite letter to your prince in the morning.',
      portrait: PORTRAITS.whisper },

    { kind: 'narration',
      text: 'Your heart is hitting your ribs in a rhythm that has nothing to do with fear and everything to do with being seen — properly, dangerously, completely — for the first time in this life.',
      portrait: PORTRAITS.whisper },

    { kind: 'line', speaker: 'THE MAN (whispered)',
      text: 'You will not run. You will not. I have your hands. Listen.',
      portrait: PORTRAITS.whisper },

    { kind: 'line', speaker: 'THE MAN',
      text: 'My name is what the priests carved into a wall when I was unwelcome. Noir. The seal you saw on your page is mine. The dark half of this kingdom is mine. I am exiled from the rest. I am the one of us no one will tell you about.',
      portrait: PORTRAITS.dominant },

    { kind: 'line', speaker: 'NOIR',
      text: 'They are all very politely letting you walk into a fire. I am rude. I will pull you out. I will not pretend I did it for free.',
      portrait: PORTRAITS.dominant },

    { kind: 'narration',
      text: 'He releases your hands. He steps back exactly one step. Out of touching range. He does not look away from you. The space between you cools.',
      portrait: PORTRAITS.casual },

    { kind: 'line', speaker: 'NOIR',
      text: 'Go back to the castle now. Walk fast. Do not stop in any square. The captain will be on the south road by now, looking for you. You will be found. You will be safe. Go.',
      portrait: PORTRAITS.casual },

    { kind: 'narration',
      text: 'You take a step. Your legs work. You take another step. At the mouth of the alley you stop. You do not know why. You turn back.',
      portrait: PORTRAITS.vulnerable },

    { kind: 'narration',
      text: 'He is still watching you. The stillness has changed. There is something behind it that he had not meant to show you. He shows it for a fraction of a second. Then he does not.',
      portrait: PORTRAITS.vulnerable },

    { kind: 'line', speaker: 'NOIR',
      text: 'I will see you again. The kingdom is small and the dark half of it is closer to your chamber than you have been told. Sleep with the lamp lit, Weaver. I am pleased we met.',
      portrait: PORTRAITS.seductive },

    { kind: 'narration',
      text: 'You run. You run all the way back through the six watchful streets. The streets see you this time. They are letting you go now.',
      portrait: null },

    { kind: 'narration',
      text: 'Halfway home, on the south road, Alistair finds you. He does not ask. He puts his cloak over your shoulders and walks you the rest of the way. Your heart is still hammering. He thinks it is the cold.',
      portrait: null },

    { kind: 'tutorial',
      text: 'A new face is open to you. Noir\u2019s route is unlocked. He is dangerous. He told you he was. That is, in its way, the kindest thing anyone in this kingdom has done for you.',
      cta: 'Continue' }
  ];

  let _root = null;

  async function play() {
    if (_root) return;
    _root = document.createElement('div');
    _root.className = 'pp-bridge-root';
    _root.innerHTML = `
      <div class="pp-bridge-bg" style="background:radial-gradient(ellipse at 50% 50%, #160a22 0%, #04020a 80%);"></div>
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
        await waitForTap();
      } else if (beat.kind === 'line') {
        dir.classList.remove('show');
        await wait(180);
        lineEl.style.display = '';
        lineEl.innerHTML = `<span class="pp-speaker">${beat.speaker}</span>${beat.text}`;
        // eslint-disable-next-line no-unused-expressions
        lineEl.offsetHeight;
        lineEl.classList.add('show');
        await waitForTap();
      } else if (beat.kind === 'tutorial') {
        lineEl.classList.remove('show');
        await wait(200);
        lineEl.style.display = 'none';
        dir.textContent = beat.text;
        dir.classList.add('show');
        _root.classList.add('cta-mode');
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
    try { localStorage.setItem('pp_intro_noir', '1'); } catch (_) {}
    _root.classList.remove('show');
    setTimeout(() => {
      if (_root && _root.parentNode) _root.parentNode.removeChild(_root);
      _root = null;
      if (window.PPChain && typeof window.PPChain.advance === 'function') {
        window.PPChain.advance(6);
        if (typeof window.PPChain.fireChapterFor === 'function') {
          window.PPChain.fireChapterFor(6);
        }
      }
      // Stash the chain-step flag the Proto bridge listens for ("just home from Noir").
      try {
        localStorage.setItem('pp_bridge_noir_just_finished', String(Date.now()));
      } catch (_) {}
    }, 700);
  }

  window.PPBridgeNoir = { play };
})();
