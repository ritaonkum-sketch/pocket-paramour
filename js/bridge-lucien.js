/* bridge-lucien.js — chain step 5: the appointed guard, the slip, the tower
 * ============================================================================
 *   The morning after the court reception, the Crown Prince makes a quiet
 *   appointment: Captain Alistair, personal guard to the Lady Weaver. The
 *   captain says yes formally to the council. Privately to her, after, he
 *   says: "I asked for this post. I did not want anyone else standing at
 *   your door."
 *
 *   He shows her the castle. The Queen's wing she avoids, the gardens, the
 *   library, the observatory. She sees the dome from her window for two
 *   days before she finds an excuse. On the third afternoon she loses him
 *   on purpose. (She is the kind of woman who tests her cage.)
 *
 *   She crosses the inner courtyard, slips through a gap in the east wall,
 *   and walks up to a tower nobody warned her about. The door is open.
 *   The man inside has been writing about her for six years without knowing
 *   her face.
 *
 *   On finish: PPChain.advance(5) — Lucien unlocks with a toast.
 * ============================================================================
 */

(function () {
  'use strict';

  const PORTRAITS = {
    formal:    'assets/lucien/body/formal.png',
    casual:    'assets/lucien/body/casual1.png',
    curious:   'assets/lucien/body/curious.png',
    gentle:    'assets/lucien/body/gentle.png',
    fascinated:'assets/lucien/body/fascinated.png',
    pleased:   'assets/lucien/body/pleased.png'
  };

  const BEATS = [
    { kind: 'narration',
      text: 'The morning after the reception, a council notice goes up: Captain Alistair, formerly south gate, is now personal guard to the Lady Weaver. The court reads it, raises an eyebrow, and says nothing.',
      portrait: null },

    { kind: 'narration',
      text: 'Alistair finds you in the east garden with the news already known. He bows. Captains bow rarely. Personal guards bow always.',
      portrait: null },

    { kind: 'line', speaker: 'ALISTAIR',
      text: 'I asked for this post. I did not want anyone else standing at your door. I wanted to tell you privately so you understand it was a choice, not an order.',
      portrait: null },

    { kind: 'narration',
      text: 'For two days he walks behind you everywhere. He shows you the gardens. The library. The kitchens. The chapel. Not the Queen\u2019s wing. Never the Queen\u2019s wing.',
      portrait: null },

    { kind: 'narration',
      text: 'From your window you can see a tower on the east hill. The dome on top is glass and lead. It catches the dawn first and the dusk last. You ask. He says: the scholar\u2019s tower. The scholar does not entertain.',
      portrait: null },

    { kind: 'narration',
      text: 'You watch the dome catch the dawn for two more days.',
      portrait: null },

    { kind: 'narration',
      text: 'On the third afternoon, while Alistair is making his report at the gatehouse, you slip past two scribes and a cook who pretend not to see, cross the inner courtyard, find the gap in the east wall the gardener uses, and walk up the hill on a footpath that is not a path.',
      portrait: null },

    { kind: 'narration',
      text: 'You did not lose him by accident. You lost him on purpose. You are the kind of woman who tests her cage.',
      portrait: null },

    { kind: 'narration',
      text: 'The tower door is not locked. The tower door is wedged open with a book. You push it.',
      portrait: null },

    { kind: 'narration',
      text: 'A spiral stair. Books in stacks against the wall on every step. The smell of ink and dust and something metallic — silver, maybe, in the air. You climb.',
      portrait: null },

    { kind: 'narration',
      text: 'A circular room at the top. Glass dome above. A telescope on a brass mount in the centre. Charts pinned to every wall. A tall man at a desk by the south window, hands open over a page, very still.',
      portrait: PORTRAITS.casual },

    { kind: 'narration',
      text: 'He turns. He does not seem surprised. He seems — relieved, almost. Like a man who has been waiting a long time and has just heard the door.',
      portrait: PORTRAITS.curious },

    { kind: 'line', speaker: 'THE SCHOLAR',
      text: 'Ah. There you are. I am sorry, that came out as if I were expecting you. I was expecting you. Six years, give or take. Please. Sit. Touch any book. I will not detain you. The door is behind me. I will move when you ask.',
      portrait: PORTRAITS.curious },

    { kind: 'narration',
      text: 'He stands very still in the centre of the room, hands open, palms up, the way a man might approach a deer. He has not moved between you and the door. He has not moved at all.',
      portrait: PORTRAITS.gentle },

    { kind: 'line', speaker: 'THE SCHOLAR',
      text: 'I am Lucien. I am — among other things — what they call me when they want to be polite. I have been writing a paper about you for six years. I did not know your face. I would have liked to know your face sooner.',
      portrait: PORTRAITS.fascinated },

    { kind: 'narration',
      text: 'You step further in. He does not move closer. He only watches, hands still open, like a man cataloguing a beautiful and slightly dangerous bird that has landed on his windowsill.',
      portrait: PORTRAITS.fascinated },

    { kind: 'line', speaker: 'LUCIEN',
      text: 'You are the seventh. I will not ask you to confirm it. Lyra has told me. The captain has told me. The Prince has told me. I have, in my own way, been telling myself for six years. The confirmation is — academic. The fact is older than the confirmation.',
      portrait: PORTRAITS.pleased },

    { kind: 'narration',
      text: 'You look at the books. They are full of you. Margins of three different volumes have your initial, drawn in a hand he did not know was anticipating you.',
      portrait: PORTRAITS.pleased },

    { kind: 'line', speaker: 'LUCIEN',
      text: 'Not today. Today is — today you should go back. The captain will be in a small grade of agony by now. I will not keep you longer than fifteen minutes. I have waited six years. Fifteen more minutes is — restraint.',
      portrait: PORTRAITS.gentle },

    { kind: 'narration',
      text: 'You hesitate. You ask if you may come back. If you may use his library.',
      portrait: PORTRAITS.gentle },

    { kind: 'line', speaker: 'LUCIEN',
      text: 'Of course. Any hour. I will not lock the door. I never lock the door. Now I will not lock the door for a particular person, which is — different.',
      portrait: PORTRAITS.fascinated },

    { kind: 'narration',
      text: 'You walk back down the hill. The dusk is starting. Halfway down, Alistair meets you on the path. He does not scold you. He says, evenly:',
      portrait: null },

    { kind: 'line', speaker: 'ALISTAIR',
      text: 'You walked half a mile of corridor on your own. I am glad. Next time, tell me, and I will walk it with you. Or behind you. Whichever you prefer.',
      portrait: null },

    { kind: 'narration',
      text: 'It is the most Alistair thing he has ever said to you. You feel it in two places at once: the place that loves him, and the place that has just been to a tower.',
      portrait: null },

    { kind: 'tutorial',
      text: 'A new face is open to you. Lucien\u2019s route is unlocked. He will treat you like a concept he loves — which, paradoxically, will make you feel like a person.',
      cta: 'Continue' }
  ];

  let _root = null;

  async function play() {
    if (_root) return;
    _root = document.createElement('div');
    _root.className = 'pp-bridge-root';
    _root.innerHTML = `
      <div class="pp-bridge-bg" style="background:radial-gradient(ellipse at 50% 60%, #1f1842 0%, #0a0820 80%);"></div>
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
        window.PPChain.advance(5);
      }
    }, 700);
  }

  window.PPBridgeLucien = { play };
})();
