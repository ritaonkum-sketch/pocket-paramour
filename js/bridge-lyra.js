/* bridge-lyra.js — chain step 3: the south coast journey, the cave-mouth, the named stranger
 * ============================================================================
 *   Elian gave you a birch-bark map, a flask, dried venison. The walk along
 *   the cliff road. First sight of the sea. The cave-mouth. Lyra barefoot
 *   in the surf, smiling like she has been expecting a friend. The first
 *   character who NAMES the word "Weaver."
 *
 *   RENDERS VIA MSCard.
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
    { kind: 'narration', text: 'In the morning Elian hands you three things: a birch-bark map, a flask, a strip of dried venison. He does not look at you while he hands them over.' },
    { kind: 'line', speaker: 'ELIAN', text: 'Walk south. The road follows the cliff. When the cliff ends, the road ends. There is a cave there. There is a witch there. She will find you before the stones do.' },
    { kind: 'line', speaker: 'ELIAN', text: 'Do not look back at the wood. I am not coming with you. Walk.' },
    { kind: 'narration', text: 'You walk. The wood thins. The light gets thinner. The trees get smaller. The smell of moss gives way to a smell you have not had a name for: salt.' },
    { kind: 'narration', text: 'By midday you are walking the cliff road. The land falls away on your left into a colour you cannot believe is a colour. The sea. You stop. You sit down on the road. You stare for a long time.' },
    { kind: 'narration', text: 'A gull screams overhead. You do not flinch. You do not know why you do not flinch.' },
    { kind: 'narration', text: 'You walk again. The light goes amber. The wind goes salt-and-iron. You eat the last of the venison. The flask is empty.' },
    { kind: 'narration', text: 'The cliff ends. The road ends. There is a path of black stone steps cut into the cliff face. Below — a beach the colour of ash, and a cave-mouth open to the sea like a held breath.' },
    { kind: 'narration', text: 'A woman is standing barefoot in the surf. She is leaning on a staff that has a salt crystal at the top. The wind is pulling her hair behind her like a banner. She has not turned to look at you.', portrait: PORTRAITS.eyesclosed },
    { kind: 'narration', text: 'You step down to the sand. The sand is cold. She turns. She is younger than you expected. She is smiling like she already loves you.', portrait: PORTRAITS.casual },
    { kind: 'line', speaker: 'THE WOMAN', text: 'You took two days. The cave told me you would take three. I owe the cave a song.', portrait: PORTRAITS.casual },
    { kind: 'narration', text: 'Her voice has a low note in it that the cliff catches and gives back. You feel it in your sternum.', portrait: PORTRAITS.casual },
    { kind: 'line', speaker: 'LYRA', text: 'I am Lyra. I sing for a living. The sea pays me in answers. You are an answer the sea has been singing for two nights now and I did not know what I was singing.', portrait: PORTRAITS.happy },
    { kind: 'narration', text: 'She walks out of the surf. She does not dry her feet. She comes close enough that you smell salt and rosemary on her skin. She tilts her head and looks at you for a long time, openly, the way someone looks at a thing they have only seen in books.', portrait: PORTRAITS.happy },
    { kind: 'line', speaker: 'LYRA', text: 'I know your name. Or part of it. Weaver.', portrait: PORTRAITS.happy },
    { kind: 'narration', text: 'The word lands in you like a stone in a deep pool. The pool has been waiting for the stone.', portrait: PORTRAITS.happy },
    { kind: 'line', speaker: 'LYRA', text: 'Yes. There. You felt it. You are the seventh. The cave told me. The cave does not lie. The cave is, at worst, dramatic.', portrait: PORTRAITS.falllove },
    { kind: 'narration', text: 'She takes your hand. Her hand is wet and cold and steady. She walks you up to the cave-mouth. The cave is warmer than the air. The cave smells of clean water and old stone and something faintly like a song you almost know.', portrait: PORTRAITS.falllove },
    { kind: 'line', speaker: 'LYRA', text: 'Sit. Eat. You are exhausted and the cave is going to be very loud about it if I do not feed you. There is broth on the fire. The broth is good. I made it for you.', portrait: PORTRAITS.falllove },
    { kind: 'narration', text: 'She made it for you. She knew you were coming. You sit. The broth is good.', portrait: PORTRAITS.casual },
    { kind: 'line', speaker: 'LYRA', text: 'I am going to tell you what you are. Not all of it. The cave will be jealous if I tell you all of it on the first night. But enough.', portrait: PORTRAITS.casual },
    { kind: 'line', speaker: 'LYRA', text: 'You are a Soul Weaver. There have been six. They are all dead. You are the seventh. We have been waiting a long time. I am very glad it is you.', portrait: PORTRAITS.happy },
    { kind: 'narration', text: 'She says it like she is telling you a kind story. She is the first person in this world who has told you the truth. You will not forget who told you first.', portrait: PORTRAITS.happy },
    { kind: 'tutorial', text: 'A new face is open to you. Lyra’s route is unlocked. She loves loudly and easily — but the song under the song is older than she lets on.', portrait: PORTRAITS.happy }
  ];

  let _playing = false;

  function play() {
    if (_playing) return Promise.resolve();
    if (!window.MSCard || !window.PPBridgeCompile) return Promise.resolve();
    _playing = true;
    return new Promise((resolve) => {
      const card = {
        id: 'b_lyra',
        title: 'BRIDGE — LYRA',
        subtitle: 'The South Coast Road',
        speaker: '',
        palette: { bg: '#06121f', glow: '#7fd3e3', accent: '#e8f0ff' },
        bg: 'assets/bg-lyra-cliff.png',
        beats: window.PPBridgeCompile.toMSCard(BEATS, { firstWait: 700 })
      };
      window.MSCard.show(card, () => { finish(); resolve(); });
    });
  }

  function finish() {
    _playing = false;
    try { localStorage.setItem('pp_intro_lyra', '1'); } catch (_) {}
    try { localStorage.setItem('pp_chapter_done_b_lyra', '1'); } catch (_) {}

    const stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
      ? window.PPChain.step() : 0;
    if (window.PPChain && typeof window.PPChain.advance === 'function') {
      window.PPChain.advance(3);
      if (stepBefore < 3 && typeof window.PPChain.fireChapterFor === 'function') {
        window.PPChain.fireChapterFor(3);
      }
    }
  }

  window.PPBridgeLyra = { play: play };
})();
