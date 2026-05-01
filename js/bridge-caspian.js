/* bridge-caspian.js — chain step 4: guilt, royal letter, silk
 * ============================================================================
 *   Alistair's guilt. He goes to the prince, not the queen. The locked
 *   study door. The small seal on a letter no prince should write himself.
 *   The carriage to the coast. Caspian bows to the witch — kings do not
 *   bow. The court reception in silk. Alistair sees her and goes very
 *   quiet. Caspian's private word: "I am terrified of you. I am also glad
 *   you are here."
 *
 *   RENDERS VIA MSCard.
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
    { kind: 'narration', text: 'Three nights ago, the captain of the south gate did something he has never done in twelve years of service. He failed to keep someone in his care safe.' },
    { kind: 'narration', text: 'He has not slept since. He has been on horseback or on foot for sixty hours. He has not told the chamberlain. He has not told the Queen.' },
    { kind: 'narration', text: 'He climbs to the Crown Prince’s study at the third bell. He has never climbed these stairs. He climbs them tonight.', portrait: PORTRAITS.formal },
    { kind: 'line', speaker: 'ALISTAIR', text: 'Your Highness. I have lost a stranger in my care. She is — not from here. I think she is what the scholars used to write about. I think she is the seventh.', portrait: PORTRAITS.formal },
    { kind: 'narration', text: 'The Prince does not move for a long moment. Then he locks the study door. Then he puts his hand flat on the desk and breathes in once, slowly, like a man steadying his own pulse.', portrait: PORTRAITS.reading },
    { kind: 'line', speaker: 'CASPIAN', text: 'You came to me. Not to my mother.', portrait: PORTRAITS.reading },
    { kind: 'line', speaker: 'ALISTAIR', text: 'I came to the only person in this castle who would keep her alive instead of containing her.', portrait: PORTRAITS.formal },
    { kind: 'narration', text: 'The Prince does not thank him. The Prince writes a note in his own hand and sends it down the back stair to the tower. An hour later the answer comes back from the scholar: south coast, the singing-stone cave, with the witch.', portrait: PORTRAITS.reading },
    { kind: 'narration', text: 'Kings do not write their own letters. Princes write fewer than one a year. The Prince writes this one. He uses the small seal, not the great one.', portrait: PORTRAITS.tender },
    { kind: 'line', speaker: 'CASPIAN', text: 'She is to be a guest of the Crown. Not a maid. Not a stranger. Have my own carriage prepared. I will go myself.', portrait: PORTRAITS.tender },
    { kind: 'narration', text: 'The carriage rolls to the coast at dawn. Alistair rides escort. Two guards. No banner. The kingdom does not need to know yet.', portrait: PORTRAITS.tender },
    { kind: 'narration', text: 'On the beach, the Prince climbs out of the carriage in plain travelling cloth. He bows to the witch. The witch does not bow back. The witch winks at you.', portrait: PORTRAITS.gentle },
    { kind: 'line', speaker: 'CASPIAN', text: 'My lady. Forgive the intrusion on what was — your peace. The captain has told me what he believes you are. The scholar has told me what he can confirm. I would like you under my roof again. As a guest. With a name and a chamber and a cup of tea that is not slid under a door.', portrait: PORTRAITS.gentle },
    { kind: 'line', speaker: 'CASPIAN', text: 'You may say no. If you say no I will leave a guard at this beach and ride back alone. If you say yes I will not let any harm come to you that I can see coming.', portrait: PORTRAITS.tender },
    { kind: 'narration', text: 'It is the first time anyone has asked you anything since you woke in the moss.', portrait: PORTRAITS.tender },
    { kind: 'narration', text: 'Lyra puts her hand on your shoulder. She does not push. She just stands there, warm, salt-smelling, ready to walk you back into a cave if you say no.', portrait: PORTRAITS.tender },
    { kind: 'narration', text: 'You say yes.', portrait: PORTRAITS.gentle },
    { kind: 'narration', text: 'The carriage carries you back through the cliff road, past the wood, past the south gate. By dusk you are in a chamber that is not a maid’s chamber. The chamber is east-facing. There is a fire. There is silk laid out for tomorrow’s reception.', portrait: PORTRAITS.gentle },
    { kind: 'narration', text: 'Tomorrow at noon the Prince will present you to the small court. The Queen will be informed but not present. That is a courtesy he has bought you.', portrait: PORTRAITS.gentle },
    { kind: 'narration', text: 'You walk into the reception in the silk. The court is small — eight nobles, the chamberlain, two scribes, the captain by the door. The captain looks up.', portrait: PORTRAITS.formal },
    { kind: 'narration', text: 'Alistair sees you in silk. He has never seen you in silk. He goes very quiet. He keeps his face exactly the way he is supposed to keep his face. Something in his hand twitches once.', portrait: PORTRAITS.formal },
    { kind: 'narration', text: 'The Prince notices. The chamberlain notices. You notice.', portrait: PORTRAITS.formal },
    { kind: 'line', speaker: 'CASPIAN', text: 'Forgive me. Before the formal address. I owe you a private word.', portrait: PORTRAITS.gentle },
    { kind: 'narration', text: 'He takes you aside. Just three steps. He bows his head. Princes do not bow. He bows his head to you. The court watches and pretends not to.', portrait: PORTRAITS.tender },
    { kind: 'line', speaker: 'CASPIAN', text: 'I am terrified of you. I am also glad you are here. I would like the second to be larger than the first. I am working on it.', portrait: PORTRAITS.tender },
    { kind: 'narration', text: 'In a court of people pretending nothing is happening, the prince is the only one telling you he is afraid.', portrait: PORTRAITS.tender },
    { kind: 'tutorial', text: 'A new face is open to you. Caspian’s route is unlocked. He will be careful with you. He has been careful all his life.', portrait: PORTRAITS.gentle }
  ];

  let _playing = false;

  function play() {
    if (_playing) return Promise.resolve();
    if (!window.MSCard || !window.PPBridgeCompile) return Promise.resolve();
    _playing = true;
    if (window.PPChain && window.PPChain.setChainInProgress) window.PPChain.setChainInProgress(true);
    return new Promise((resolve) => {
      const card = {
        id: 'b_caspian',
        title: 'BRIDGE — CASPIAN',
        subtitle: 'The Royal Letter',
        speaker: '',
        palette: { bg: '#1a0e2a', glow: '#c8a050', accent: '#f4e6ff' },
        bg: 'assets/bg-caspian-day.png',
        beats: window.PPBridgeCompile.toMSCard(BEATS, { firstWait: 700 })
      };
      window.MSCard.show(card, () => { finish(); resolve(); });
    });
  }

  function finish() {
    _playing = false;
    try { localStorage.setItem('pp_intro_caspian', '1'); } catch (_) {}
    try { localStorage.setItem('pp_chapter_done_b_caspian', '1'); } catch (_) {}

    const stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
      ? window.PPChain.step() : 0;
    if (window.PPChain && typeof window.PPChain.advance === 'function') {
      // Wait for the route-open toast to be tapped before firing the next
      // chapter — otherwise the chapter buries it. (Same fix as bridge-alistair.)
      const advanced = window.PPChain.advance(4);
      const fireChapter = () => {
        if (stepBefore < 4 && typeof window.PPChain.fireChapterFor === 'function') {
          window.PPChain.fireChapterFor(4);
        } else if (window.PPChain.setChainInProgress) {
          window.PPChain.setChainInProgress(false);
        }
      };
      if (advanced && typeof advanced.then === 'function') {
        advanced.then(fireChapter, fireChapter);
      } else {
        fireChapter();
      }
    }
  }

  window.PPBridgeCaspian = { play: play };
})();
