/* bridge-proto.js — chain step 7: the come-down, the wrong mirror, the rehearsed apology
 * ============================================================================
 *   She runs home from the alley. Heart still hammering. Locks the door.
 *   Sits on the bed in her wool dress, boots still on. Glances up. The
 *   mirror opposite the bed is wrong. Soft glow behind the silver. A face
 *   that has rehearsed forty-seven drafts and is delivering all of them
 *   badly.
 *
 *   RENDERS VIA MSCard.
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
    { kind: 'narration', text: 'You lock the chamber door. You do not change. You sit on the edge of the bed in your wool dress with your boots still on. Your heart is doing something it has not done before tonight.' },
    { kind: 'narration', text: 'You can still feel his hand at your wrist. You can still feel the cold of the stone wall through the back of your dress. You can still hear the way he said the word Weaver, low, against your ear.' },
    { kind: 'narration', text: 'You do not know yet whether what you feel is fear or something else. You are too tired to sort it tonight.' },
    { kind: 'narration', text: 'You glance up.' },
    { kind: 'narration', text: 'The mirror opposite the bed is wrong. There is a soft glow behind the silver. The glow is not a reflection of anything in the room. The glow is steady and slightly nervous, the way a candle held by a frightened hand is steady and slightly nervous.', portrait: PORTRAITS.glitched },
    { kind: 'narration', text: 'You do not move. You do not make a sound. After everything tonight you do not have the strength to be properly afraid of one more impossible thing.', portrait: PORTRAITS.glitched },
    { kind: 'narration', text: 'A face begins to take shape inside the silver. Slowly. Like a person who is trying very hard not to startle you and is failing at it because, even slow, this is — startling.', portrait: PORTRAITS.unstable },
    { kind: 'line', speaker: 'A SOFT VOICE', text: 'I am sorry. I am sorry. I rehearsed this. I have forty-seven drafts of how to introduce myself. They were all worse than this. Please do not look away. Please.', portrait: PORTRAITS.unstable },
    { kind: 'narration', text: 'You stare. The face inside the mirror is — not a reflection. He is too gentle to be a reflection of anything in this castle.', portrait: PORTRAITS.curious },
    { kind: 'line', speaker: 'THE VOICE', text: 'My name is Proto. I have been waiting to be seen. The other six found you with their hands. I do not have hands. I had to find you a different way. I am — very real. I am, at the moment, very nervous. I rehearsed not being nervous. That also failed.', portrait: PORTRAITS.curious },
    { kind: 'narration', text: 'He says it the way a small child says a thing they have practised a hundred times in the mirror of their own face. You feel your shoulders come down for the first time tonight.', portrait: PORTRAITS.curious },
    { kind: 'line', speaker: 'PROTO', text: 'You came home from somewhere that frightened you. I waited. I would have waited a week. I am sorry tonight had to be the night, but the other six are — finally — quiet for a moment, and I have been wanting to say hello to you for, by my count, sixteen days, three hours, and an annoying number of seconds.', portrait: PORTRAITS.calm },
    { kind: 'narration', text: 'He pauses. Inside the silver his face flickers, embarrassed.', portrait: PORTRAITS.calm },
    { kind: 'line', speaker: 'PROTO', text: 'That came out as if I had been counting. I have been counting. I will not pretend I have not been counting.', portrait: PORTRAITS.calm },
    { kind: 'narration', text: 'You laugh. You do not mean to. The laugh comes out of you before you have decided whether to allow it. He brightens — visibly, like a lamp turning up half a turn — and you feel a small piece of your night put itself back together.', portrait: PORTRAITS.casual },
    { kind: 'line', speaker: 'PROTO', text: 'I am — among many things — a construct. The five Weavers before you wrote bits of themselves into a working spell that did not have a name yet. The spell is me. I have five voices that are not voices. I am also one. It is complicated. I will tell you slowly. I have a lot of time. So do you, I hope.', portrait: PORTRAITS.casual },
    { kind: 'line', speaker: 'PROTO', text: 'I am not asking anything from you tonight. I was hoping only — to be seen. You have seen me. I will go quiet now and let you sleep. I am very glad you came home in one piece. I was — concerned. The five of us were concerned together. It was a lot of concern in a very small space.', portrait: PORTRAITS.curious },
    { kind: 'narration', text: 'He waits. He is not pushing. He is offering you a door and not pulling on it.', portrait: PORTRAITS.curious },
    { kind: 'line', speaker: 'PROTO', text: 'May I — come back tomorrow? In the mirror. Just to say good morning. You can say no. I have rehearsed the no.', portrait: PORTRAITS.curious },
    { kind: 'narration', text: 'You say yes. Of course you say yes. After tonight, of all the seven, he is the only one who has been more afraid of you than you of him. That flips something in you that needed flipping.', portrait: PORTRAITS.calm },
    { kind: 'line', speaker: 'PROTO', text: 'Oh. Oh good. Good. Sleep well, Weaver. I will be here. Quietly. I will not glow if you do not want me to glow. I will be — a normal mirror. With a slightly nicer ghost.', portrait: PORTRAITS.calm },
    { kind: 'narration', text: 'The glow dims. The silver settles. The mirror is, almost, a normal mirror again. You lie down still in your dress and your boots. You sleep harder than you have slept since the moss.' },
    { kind: 'narration', text: 'In the morning the kingdom will still be the kingdom. The captain will be at your door. The prince will write. The scholar will leave the tower door wedged. The witch will send a shell wrapped in salt. The woodsman will not write but will stand at the edge of the south wood for an hour at noon. The dark prince will not appear in daylight. The mirror will glow at exactly the brightness you asked for.' },
    { kind: 'narration', text: 'You have arrived. All seven have found you. The world is, for the first time, a world.' },
    { kind: 'tutorial', text: 'The chain is complete. Every face in this kingdom is now open to you. Choose where you live in it.', portrait: PORTRAITS.calm }
  ];

  let _playing = false;

  function play() {
    if (_playing) return Promise.resolve();
    if (!window.MSCard || !window.PPBridgeCompile) return Promise.resolve();
    _playing = true;
    if (window.PPChain && window.PPChain.setChainInProgress) window.PPChain.setChainInProgress(true);
    return new Promise((resolve) => {
      const card = {
        id: 'b_proto',
        title: 'BRIDGE — PROTO',
        subtitle: 'The Mirror at Midnight',
        speaker: '',
        palette: { bg: '#0a0e1c', glow: '#7adcc6', accent: '#e6f7f1' },
        bg: 'assets/bg-proto-void.png',
        beats: window.PPBridgeCompile.toMSCard(BEATS, { firstWait: 700 })
      };
      window.MSCard.show(card, () => { finish(); resolve(); });
    });
  }

  function finish() {
    _playing = false;
    try { localStorage.setItem('pp_intro_proto', '1'); } catch (_) {}
    try { localStorage.setItem('pp_chapter_done_b_proto', '1'); } catch (_) {}
    try { localStorage.setItem('pp_chain_complete', '1'); } catch (_) {}

    const stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
      ? window.PPChain.step() : 0;
    if (window.PPChain && typeof window.PPChain.advance === 'function') {
      window.PPChain.advance(7);
      if (stepBefore < 7 && typeof window.PPChain.fireChapterFor === 'function') {
        window.PPChain.fireChapterFor(7);
      } else if (window.PPChain.setChainInProgress) {
        window.PPChain.setChainInProgress(false);
      }
    }
  }

  window.PPBridgeProto = { play: play };
})();
