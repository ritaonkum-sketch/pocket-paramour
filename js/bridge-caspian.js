/* bridge-caspian.js — chain step 4: the guilt, the royal letter, the silk
 * ============================================================================
 *   Alistair has been hunting for you since you slipped the postern. He is a
 *   captain. Captains do not lose strangers in their care. He blames himself.
 *
 *   He does what every fibre of his oath tells him not to do: instead of
 *   reporting "the southern stranger" to the Queen, he goes to the Crown
 *   Prince. Privately. Because Caspian is the only person in that castle who
 *   would protect a stranger instead of contain her.
 *
 *   Caspian listens. Caspian asks Lucien to scry. Lucien locates her at
 *   Lyra's cave. Caspian does something kings do not do: he writes the
 *   letter himself. Then he rides to the coast himself.
 *
 *   The letter brings you back as a guest of the Crown — not as a maid, not
 *   as a stranger. The court reception. Alistair sees you in silk and goes
 *   very quiet. The chamberlain notices. The prince notices. You notice.
 *
 *   On finish: PPChain.advance(4) — Caspian unlocks with a toast.
 * ============================================================================
 */

(function () {
  'use strict';

  const PORTRAITS = {
    formal:    'assets/caspian/body/formal.png',
    talking:   'assets/caspian/body/talking2.png',
    gentle:    'assets/caspian/body/gentle.png',
    tender:    'assets/caspian/body/tender.png',
    reading:   'assets/caspian/body/reading.png'
  };

  const BEATS = [
    { kind: 'narration',
      text: 'Three nights ago, the captain of the south gate did something he has never done in twelve years of service. He failed to keep someone in his care safe.',
      portrait: null },

    { kind: 'narration',
      text: 'He has not slept since. He has been on horseback or on foot for sixty hours. He has not told the chamberlain. He has not told the Queen.',
      portrait: null },

    { kind: 'narration',
      text: 'He climbs to the Crown Prince\u2019s study at the third bell. He has never climbed these stairs. He climbs them tonight.',
      portrait: PORTRAITS.formal },

    { kind: 'line', speaker: 'ALISTAIR',
      text: 'Your Highness. I have lost a stranger in my care. She is — not from here. I think she is what the scholars used to write about. I think she is the seventh.',
      portrait: PORTRAITS.formal },

    { kind: 'narration',
      text: 'The Prince does not move for a long moment. Then he locks the study door. Then he puts his hand flat on the desk and breathes in once, slowly, like a man steadying his own pulse.',
      portrait: PORTRAITS.reading },

    { kind: 'line', speaker: 'CASPIAN',
      text: 'You came to me. Not to my mother.',
      portrait: PORTRAITS.reading },

    { kind: 'line', speaker: 'ALISTAIR',
      text: 'I came to the only person in this castle who would keep her alive instead of containing her.',
      portrait: PORTRAITS.formal },

    { kind: 'narration',
      text: 'The Prince does not thank him. The Prince writes a note in his own hand and sends it down the back stair to the tower. An hour later the answer comes back from the scholar: south coast, the singing-stone cave, with the witch.',
      portrait: PORTRAITS.reading },

    { kind: 'narration',
      text: 'Kings do not write their own letters. Princes write fewer than one a year. The Prince writes this one. He uses the small seal, not the great one.',
      portrait: PORTRAITS.tender },

    { kind: 'line', speaker: 'CASPIAN',
      text: 'She is to be a guest of the Crown. Not a maid. Not a stranger. Have my own carriage prepared. I will go myself.',
      portrait: PORTRAITS.tender },

    { kind: 'narration',
      text: 'The carriage rolls to the coast at dawn. Alistair rides escort. Two guards. No banner. The kingdom does not need to know yet.',
      portrait: null },

    { kind: 'narration',
      text: 'On the beach, the Prince climbs out of the carriage in plain travelling cloth. He bows to the witch. The witch does not bow back. The witch winks at you.',
      portrait: PORTRAITS.gentle },

    { kind: 'line', speaker: 'CASPIAN',
      text: 'My lady. Forgive the intrusion on what was — your peace. The captain has told me what he believes you are. The scholar has told me what he can confirm. I would like you under my roof again. As a guest. With a name and a chamber and a cup of tea that is not slid under a door.',
      portrait: PORTRAITS.gentle },

    { kind: 'line', speaker: 'CASPIAN',
      text: 'You may say no. If you say no I will leave a guard at this beach and ride back alone. If you say yes I will not let any harm come to you that I can see coming.',
      portrait: PORTRAITS.tender },

    { kind: 'narration',
      text: 'It is the first time anyone has asked you anything since you woke in the moss.',
      portrait: PORTRAITS.tender },

    { kind: 'narration',
      text: 'Lyra puts her hand on your shoulder. She does not push. She just stands there, warm, salt-smelling, ready to walk you back into a cave if you say no.',
      portrait: PORTRAITS.tender },

    { kind: 'narration',
      text: 'You say yes.',
      portrait: PORTRAITS.gentle },

    { kind: 'narration',
      text: 'The carriage carries you back through the cliff road, past the wood, past the south gate. By dusk you are in a chamber that is not a maid\u2019s chamber. The chamber is east-facing. There is a fire. There is silk laid out for tomorrow\u2019s reception.',
      portrait: null },

    { kind: 'narration',
      text: 'Tomorrow at noon the Prince will present you to the small court. The Queen will be informed but not present. That is a courtesy he has bought you.',
      portrait: null },

    { kind: 'narration',
      text: 'You walk into the reception in the silk. The court is small — eight nobles, the chamberlain, two scribes, the captain by the door. The captain looks up.',
      portrait: PORTRAITS.formal },

    { kind: 'narration',
      text: 'Alistair sees you in silk. He has never seen you in silk. He goes very quiet. He keeps his face exactly the way he is supposed to keep his face. Something in his hand twitches once.',
      portrait: PORTRAITS.formal },

    { kind: 'narration',
      text: 'The Prince notices. The chamberlain notices. You notice.',
      portrait: PORTRAITS.formal },

    { kind: 'line', speaker: 'CASPIAN',
      text: 'Forgive me. Before the formal address. I owe you a private word.',
      portrait: PORTRAITS.gentle },

    { kind: 'narration',
      text: 'He takes you aside. Just three steps. He bows his head. Princes do not bow. He bows his head to you. The court watches and pretends not to.',
      portrait: PORTRAITS.tender },

    { kind: 'line', speaker: 'CASPIAN',
      text: 'I am terrified of you. I am also glad you are here. I would like the second to be larger than the first. I am working on it.',
      portrait: PORTRAITS.tender },

    { kind: 'narration',
      text: 'In a court of people pretending nothing is happening, the prince is the only one telling you he is afraid.',
      portrait: PORTRAITS.tender },

    { kind: 'tutorial',
      text: 'A new face is open to you. Caspian\u2019s route is unlocked. He will be careful with you. He has been careful all his life.',
      cta: 'Continue' }
  ];

  let _root = null;

  async function play() {
    if (_root) return;
    _root = document.createElement('div');
    _root.className = 'pp-bridge-root';
    _root.innerHTML = `
      <div class="pp-bridge-bg" style="background:radial-gradient(ellipse at 50% 55%, #1f1832 0%, #08071a 80%);"></div>
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
    try { localStorage.setItem('pp_intro_caspian', '1'); } catch (_) {}
    _root.classList.remove('show');
    setTimeout(() => {
      if (_root && _root.parentNode) _root.parentNode.removeChild(_root);
      _root = null;
      if (window.PPChain && typeof window.PPChain.advance === 'function') {
        window.PPChain.advance(4);
        if (typeof window.PPChain.fireChapterFor === 'function') {
          window.PPChain.fireChapterFor(4);
        }
      }
    }, 700);
  }

  window.PPBridgeCaspian = { play };
})();
