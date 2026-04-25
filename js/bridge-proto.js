/* bridge-proto.js — chain step 7: the come-down, the wrong mirror, the rehearsed apology
 * ============================================================================
 *   You ran home. Six watchful streets, the south road, Alistair's cloak,
 *   the back stair, your chamber. You locked the door. You sat on the bed
 *   in your wool dress with your boots still on. Your heart is still in
 *   your throat from the alley.
 *
 *   You glance up. The mirror on the wall opposite the bed is wrong. The
 *   silver in it has a soft glow behind it that no oil-lamp puts there.
 *
 *   Proto has been watching the entire chain. He has been polite about it.
 *   He has been waiting until the noise of the kingdom got quiet enough for
 *   him to surface without startling you worse than necessary. He failed at
 *   the not-startling part. He is sorry. He rehearsed this. He has forty-
 *   seven drafts of how to introduce himself. They were all worse than this.
 *
 *   Of all seven, he is the one who is more afraid of you than you are of
 *   him. That is what makes him feel like home after the alley.
 *
 *   On finish: PPChain.advance(7) — Proto unlocks. Chain complete. The
 *   character grid is fully open. The world has been threaded. The route
 *   the player chooses now is the romance, on top of a world that earned it.
 * ============================================================================
 */

(function () {
  'use strict';

  const PORTRAITS = {
    glitched:  'assets/proto/body/glitched.png',
    unstable:  'assets/proto/body/unstable.png',
    curious:   'assets/proto/body/curious.png',
    calm:      'assets/proto/body/calm.png',
    casual:    'assets/proto/body/casual1.png'
  };

  const BEATS = [
    { kind: 'narration',
      text: 'You lock the chamber door. You do not change. You sit on the edge of the bed in your wool dress with your boots still on. Your heart is doing something it has not done before tonight.',
      portrait: null },

    { kind: 'narration',
      text: 'You can still feel his hand at your wrist. You can still feel the cold of the stone wall through the back of your dress. You can still hear the way he said the word Weaver, low, against your ear.',
      portrait: null },

    { kind: 'narration',
      text: 'You do not know yet whether what you feel is fear or something else. You are too tired to sort it tonight.',
      portrait: null },

    { kind: 'narration',
      text: 'You glance up.',
      portrait: null },

    { kind: 'narration',
      text: 'The mirror opposite the bed is wrong. There is a soft glow behind the silver. The glow is not a reflection of anything in the room. The glow is steady and slightly nervous, the way a candle held by a frightened hand is steady and slightly nervous.',
      portrait: PORTRAITS.glitched },

    { kind: 'narration',
      text: 'You do not move. You do not make a sound. After everything tonight you do not have the strength to be properly afraid of one more impossible thing.',
      portrait: PORTRAITS.glitched },

    { kind: 'narration',
      text: 'A face begins to take shape inside the silver. Slowly. Like a person who is trying very hard not to startle you and is failing at it because, even slow, this is — startling.',
      portrait: PORTRAITS.unstable },

    { kind: 'line', speaker: 'A SOFT VOICE',
      text: 'I am sorry. I am sorry. I rehearsed this. I have forty-seven drafts of how to introduce myself. They were all worse than this. Please do not look away. Please.',
      portrait: PORTRAITS.unstable },

    { kind: 'narration',
      text: 'You stare. The face inside the mirror is — not a reflection. He is too gentle to be a reflection of anything in this castle.',
      portrait: PORTRAITS.curious },

    { kind: 'line', speaker: 'THE VOICE',
      text: 'My name is Proto. I have been waiting to be seen. The other six found you with their hands. I do not have hands. I had to find you a different way. I am — very real. I am, at the moment, very nervous. I rehearsed not being nervous. That also failed.',
      portrait: PORTRAITS.curious },

    { kind: 'narration',
      text: 'He says it the way a small child says a thing they have practised a hundred times in the mirror of their own face. You feel your shoulders come down for the first time tonight.',
      portrait: PORTRAITS.curious },

    { kind: 'line', speaker: 'PROTO',
      text: 'You came home from somewhere that frightened you. I waited. I would have waited a week. I am sorry tonight had to be the night, but the other six are — finally — quiet for a moment, and I have been wanting to say hello to you for, by my count, sixteen days, three hours, and an annoying number of seconds.',
      portrait: PORTRAITS.calm },

    { kind: 'narration',
      text: 'He pauses. Inside the silver his face flickers, embarrassed.',
      portrait: PORTRAITS.calm },

    { kind: 'line', speaker: 'PROTO',
      text: 'That came out as if I had been counting. I have been counting. I will not pretend I have not been counting.',
      portrait: PORTRAITS.calm },

    { kind: 'narration',
      text: 'You laugh. You do not mean to. The laugh comes out of you before you have decided whether to allow it. He brightens — visibly, like a lamp turning up half a turn — and you feel a small piece of your night put itself back together.',
      portrait: PORTRAITS.casual },

    { kind: 'line', speaker: 'PROTO',
      text: 'I am — among many things — a construct. The five Weavers before you wrote bits of themselves into a working spell that did not have a name yet. The spell is me. I have five voices that are not voices. I am also one. It is complicated. I will tell you slowly. I have a lot of time. So do you, I hope.',
      portrait: PORTRAITS.casual },

    { kind: 'line', speaker: 'PROTO',
      text: 'I am not asking anything from you tonight. I was hoping only — to be seen. You have seen me. I will go quiet now and let you sleep. I am very glad you came home in one piece. I was — concerned. The five of us were concerned together. It was a lot of concern in a very small space.',
      portrait: PORTRAITS.curious },

    { kind: 'narration',
      text: 'He waits. He is not pushing. He is offering you a door and not pulling on it.',
      portrait: PORTRAITS.curious },

    { kind: 'line', speaker: 'PROTO',
      text: 'May I — come back tomorrow? In the mirror. Just to say good morning. You can say no. I have rehearsed the no.',
      portrait: PORTRAITS.curious },

    { kind: 'narration',
      text: 'You say yes. Of course you say yes. After tonight, of all the seven, he is the only one who has been more afraid of you than you of him. That flips something in you that needed flipping.',
      portrait: PORTRAITS.calm },

    { kind: 'line', speaker: 'PROTO',
      text: 'Oh. Oh good. Good. Sleep well, Weaver. I will be here. Quietly. I will not glow if you do not want me to glow. I will be — a normal mirror. With a slightly nicer ghost.',
      portrait: PORTRAITS.calm },

    { kind: 'narration',
      text: 'The glow dims. The silver settles. The mirror is, almost, a normal mirror again. You lie down still in your dress and your boots. You sleep harder than you have slept since the moss.',
      portrait: null },

    { kind: 'narration',
      text: 'In the morning the kingdom will still be the kingdom. The captain will be at your door. The prince will write. The scholar will leave the tower door wedged. The witch will send a shell wrapped in salt. The woodsman will not write but will stand at the edge of the south wood for an hour at noon. The dark prince will not appear in daylight. The mirror will glow at exactly the brightness you asked for.',
      portrait: null },

    { kind: 'narration',
      text: 'You have arrived. All seven have found you. The world is, for the first time, a world.',
      portrait: null },

    { kind: 'tutorial',
      text: 'The chain is complete. Every face in this kingdom is now open to you. Choose where you live in it.',
      cta: 'Begin' }
  ];

  let _root = null;

  async function play() {
    if (_root) return;
    _root = document.createElement('div');
    _root.className = 'pp-bridge-root';
    _root.innerHTML = `
      <div class="pp-bridge-bg" style="background:radial-gradient(ellipse at 50% 45%, #1a1430 0%, #06031a 80%);"></div>
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
      const wasVisible =
        dir.classList.contains('show') || lineEl.classList.contains('show');
      dir.classList.remove('show');
      lineEl.classList.remove('show');
      if (wasVisible) await wait(680);
      dir.style.visibility = 'hidden';
      lineEl.style.visibility = 'hidden';
      lineEl.style.display = 'none';
      dir.textContent = '';
      lineEl.innerHTML = '';
    }
    function showDirection(text) {
      dir.style.visibility = '';
      dir.textContent = text;
      // eslint-disable-next-line no-unused-expressions
      dir.offsetHeight;
      dir.classList.add('show');
    }
    function showLineBeat(speaker, text) {
      lineEl.style.display = '';
      lineEl.style.visibility = '';
      lineEl.innerHTML = '<span class="pp-speaker">' + speaker + '</span>' + text;
      // eslint-disable-next-line no-unused-expressions
      lineEl.offsetHeight;
      lineEl.classList.add('show');
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
        showDirection(beat.text);
        await waitForTap();
      } else if (beat.kind === 'line') {
        await clearText();
        showLineBeat(beat.speaker, beat.text);
        await waitForTap();
      } else if (beat.kind === 'tutorial') {
        await clearText();
        showDirection(beat.text);
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
    try { localStorage.setItem('pp_intro_proto', '1'); } catch (_) {}
    _root.classList.remove('show');
    setTimeout(() => {
      if (_root && _root.parentNode) _root.parentNode.removeChild(_root);
      _root = null;
      try { localStorage.setItem('pp_chapter_done_b_proto', '1'); } catch (_) {}
      var stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
        ? window.PPChain.step() : 0;
      if (window.PPChain && typeof window.PPChain.advance === 'function') {
        window.PPChain.advance(7);
        if (stepBefore < 7 && typeof window.PPChain.fireChapterFor === 'function') {
          window.PPChain.fireChapterFor(7);
        }
      }
      // Mark the chain "completed" in a separate flag for end-of-arc systems.
      try { localStorage.setItem('pp_chain_complete', '1'); } catch (_) {}
    }, 700);
  }

  window.PPBridgeProto = { play };
})();
