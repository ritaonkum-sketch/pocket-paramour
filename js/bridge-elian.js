/* bridge-elian.js — chain step 2: the slip, the smoke, the cold appraisal
 * ============================================================================
 *   Days into the maid's chamber. The castle is too still. Tonight she slips
 *   the kitchen postern. Follows smoke. Finds a man sharpening a knife at a
 *   fire who does not get up. He bandages her foot before he asks the
 *   question. He is cold to Soul Weavers, not to her — he has buried two.
 *
 *   RENDERS VIA MSCard.
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
    { kind: 'narration', text: 'The chamber is too still. The castle answers no questions. Three days of meals slid under the door by people who will not look at you.' },
    { kind: 'narration', text: 'Tonight you slip the latch. The kitchen postern is unguarded after the third bell. You take a kitchen knife you cannot fight with and a cloak that is not yours.' },
    { kind: 'narration', text: 'You walk south. Past the gate-line. Past the lights of the castle until they are the size of a coin behind you. You are looking for the place you first woke. You think the ground will know.' },
    { kind: 'narration', text: 'The wood gets older. The trees get bigger. You realise, slowly, that you are not where you meant to be. Your foot is bleeding through the bandage someone wrapped for you.' },
    { kind: 'narration', text: 'You smell smoke. Not a fire smoke — a careful smoke. Old wood, slow to burn. You follow it through brambles you cannot see in the dark.' },
    { kind: 'narration', text: 'A clearing. A fire. A man on a fallen log, a knife laid across his knee, a whetstone moving in slow patient strokes. He does not look up when you step into the light.', portrait: PORTRAITS.weathered },
    { kind: 'line', speaker: 'THE MAN', text: 'You are bleeding. Sit down before you fall down. The log to your left.', portrait: PORTRAITS.weathered },
    { kind: 'narration', text: 'He says it without warmth. The way you would say it to any wounded animal that had wandered into your camp.', portrait: PORTRAITS.weathered },
    { kind: 'narration', text: 'You sit. He keeps sharpening. Three more passes of the stone, unhurried. Only then does he set the knife aside and reach for a strip of clean linen and a small clay jar.', portrait: PORTRAITS.guarded },
    { kind: 'line', speaker: 'THE MAN', text: 'Foot. Off. I will not ask twice.', portrait: PORTRAITS.guarded },
    { kind: 'narration', text: 'He cleans the cut. His hands are steady, calloused, careful. He is faster and gentler than the castle physicians. He has done this on himself too many times.', portrait: PORTRAITS.tracking },
    { kind: 'line', speaker: 'THE MAN', text: 'You are a long way from the captain’s gate, miss.', portrait: PORTRAITS.tracking },
    { kind: 'narration', text: 'You go very still. He knows about Alistair. The kingdom is small.', portrait: PORTRAITS.tracking },
    { kind: 'line', speaker: 'THE MAN', text: 'I am not going to take you back. He will be hunting for you in three hours when the watch turns. I will not make that easy.', portrait: PORTRAITS.tracking },
    { kind: 'narration', text: 'He ties off the bandage. He puts his hand briefly on your ankle to steady it as he works. Then he takes his hand away. He does not let it linger.', portrait: PORTRAITS.calm },
    { kind: 'line', speaker: 'ELIAN', text: 'My name is Elian. I keep the south Thornwood. I do not keep castles.', portrait: PORTRAITS.calm },
    { kind: 'narration', text: 'He hands you a strip of dried venison. You eat. He watches the way you eat. The way you flinch at the salt. The way you do not know to dust the bark off first.', portrait: PORTRAITS.calm },
    { kind: 'line', speaker: 'ELIAN', text: 'Eat slower. You are not hungry the way someone who lives here is hungry. You are hungry the way someone newly here is hungry. That is interesting.', portrait: PORTRAITS.calm },
    { kind: 'narration', text: 'He says interesting the way another man might say dangerous.', portrait: PORTRAITS.calm },
    { kind: 'line', speaker: 'ELIAN', text: 'Now I will ask you what the captain has not asked you, because he is too kind to. What are you.', portrait: PORTRAITS.tracking },
    { kind: 'narration', text: 'You do not have an answer. He sees that. He does not look away. He lets you not have an answer for a long time.', portrait: PORTRAITS.tracking },
    { kind: 'line', speaker: 'ELIAN', text: 'I do not know what you are. But I can see you do not either. That is more honest than anything anyone in that castle has said to you. So we will start there.', portrait: PORTRAITS.warm },
    { kind: 'narration', text: 'For the first time in three days, something in your chest unclenches. He notices. His face does not move. But something behind his eyes — closes, like a man stepping back from a fire he meant to admire only briefly.', portrait: PORTRAITS.warm },
    { kind: 'line', speaker: 'ELIAN', text: 'Sleep here tonight. The fire will hold. I will sit. In the morning I will set you on the south coast road. There is someone there who knows what people like you are. I do not.', portrait: PORTRAITS.warm },
    { kind: 'line', speaker: 'ELIAN', text: 'Do not fall in love with me, miss. I have buried two of you already. I do not have a third in me.', portrait: PORTRAITS.guarded },
    { kind: 'narration', text: 'He says it like a fact. Like he has rehearsed it. Like he is warning himself, not you.', portrait: PORTRAITS.guarded },
    { kind: 'narration', text: 'You sleep by the fire. You do not dream. When you wake, he is already up, already packed, already not looking at you.', portrait: PORTRAITS.guarded },
    { kind: 'tutorial', text: 'A new face is open to you. Elian’s route is unlocked. Care for him — slowly, patiently. He will not let you in fast. That is the point.', portrait: PORTRAITS.warm }
  ];

  let _playing = false;
  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }

  function play() {
    if (_playing) return Promise.resolve();
    if (!window.MSCard || !window.PPBridgeCompile) return Promise.resolve();
    _playing = true;
    if (window.PPChain && window.PPChain.setChainInProgress) window.PPChain.setChainInProgress(true);
    return new Promise((resolve) => {
      const card = {
        id: 'b_elian',
        title: 'BRIDGE — ELIAN',
        subtitle: 'Smoke at the Treeline',
        speaker: '',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: window.PPBridgeCompile.toMSCard(BEATS, { firstWait: 700 })
      };
      window.MSCard.show(card, () => { finish(); resolve(); });
    });
  }

  function finish() {
    _playing = false;
    try { localStorage.setItem('pp_intro_elian', '1'); } catch (_) {}
    try { localStorage.setItem('pp_chapter_done_b_elian', '1'); } catch (_) {}
    try { localStorage.setItem('pp_bridge_elian_gave_map', '1'); } catch (_) {}

    const stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
      ? window.PPChain.step() : 0;
    if (window.PPChain && typeof window.PPChain.advance === 'function') {
      window.PPChain.advance(2);
      if (stepBefore < 2 && typeof window.PPChain.fireChapterFor === 'function') {
        window.PPChain.fireChapterFor(2);
      } else if (window.PPChain.setChainInProgress) {
        window.PPChain.setChainInProgress(false);
      }
    }
  }

  window.PPBridgeElian = { play: play };
})();
