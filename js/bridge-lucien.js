/* bridge-lucien.js — chain step 5: the appointed guard, the slip, the tower
 * ============================================================================
 *   Alistair appointed personal guard ("I asked for this post"). The dome
 *   from her window for two days. The third afternoon she loses him on
 *   purpose. The footpath up the east hill. The book wedged in the door.
 *   "Six years. Please. Sit. Touch any book. The door is behind me. I will
 *   move when you ask."
 *
 *   RENDERS VIA MSCard.
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
    { kind: 'narration', text: 'The morning after the reception, a council notice goes up: Captain Alistair, formerly south gate, is now personal guard to the Lady Weaver. The court reads it, raises an eyebrow, and says nothing.' },
    { kind: 'narration', text: 'Alistair finds you in the east garden with the news already known. He bows. Captains bow rarely. Personal guards bow always.' },
    { kind: 'line', speaker: 'ALISTAIR', text: 'I asked for this post. I did not want anyone else standing at your door. I wanted to tell you privately so you understand it was a choice, not an order.' },
    { kind: 'narration', text: 'For two days he walks behind you everywhere. He shows you the gardens. The library. The kitchens. The chapel. Not the Queen’s wing. Never the Queen’s wing.' },
    { kind: 'narration', text: 'From your window you can see a tower on the east hill. The dome on top is glass and lead. It catches the dawn first and the dusk last. You ask. He says: the scholar’s tower. The scholar does not entertain.' },
    { kind: 'narration', text: 'You watch the dome catch the dawn for two more days.' },
    { kind: 'narration', text: 'On the third afternoon, while Alistair is making his report at the gatehouse, you slip past two scribes and a cook who pretend not to see, cross the inner courtyard, find the gap in the east wall the gardener uses, and walk up the hill on a footpath that is not a path.' },
    { kind: 'narration', text: 'You did not lose him by accident. You lost him on purpose. You are the kind of woman who tests her cage.' },
    { kind: 'narration', text: 'The tower door is not locked. The tower door is wedged open with a book. You push it.' },
    { kind: 'narration', text: 'A spiral stair. Books in stacks against the wall on every step. The smell of ink and dust and something metallic — silver, maybe, in the air. You climb.' },
    { kind: 'narration', text: 'A circular room at the top. Glass dome above. A telescope on a brass mount in the centre. Charts pinned to every wall. A tall man at a desk by the south window, hands open over a page, very still.', portrait: PORTRAITS.casual },
    { kind: 'narration', text: 'He turns. He does not seem surprised. He seems — relieved, almost. Like a man who has been waiting a long time and has just heard the door.', portrait: PORTRAITS.curious },
    { kind: 'line', speaker: 'THE SCHOLAR', text: 'Ah. There you are. I am sorry, that came out as if I were expecting you. I was expecting you. Six years, give or take. Please. Sit. Touch any book. I will not detain you. The door is behind me. I will move when you ask.', portrait: PORTRAITS.curious },
    { kind: 'narration', text: 'He stands very still in the centre of the room, hands open, palms up, the way a man might approach a deer. He has not moved between you and the door. He has not moved at all.', portrait: PORTRAITS.gentle },
    { kind: 'line', speaker: 'LUCIEN', text: 'I am Lucien. I am — among other things — what they call me when they want to be polite. I have been writing a paper about you for six years. I did not know your face. I would have liked to know your face sooner.', portrait: PORTRAITS.fascinated },
    { kind: 'narration', text: 'You step further in. He does not move closer. He only watches, hands still open, like a man cataloguing a beautiful and slightly dangerous bird that has landed on his windowsill.', portrait: PORTRAITS.fascinated },
    { kind: 'line', speaker: 'LUCIEN', text: 'You are the seventh. I will not ask you to confirm it. Lyra has told me. The captain has told me. The Prince has told me. I have, in my own way, been telling myself for six years. The confirmation is — academic. The fact is older than the confirmation.', portrait: PORTRAITS.pleased },
    { kind: 'narration', text: 'You look at the books. They are full of you. Margins of three different volumes have your initial, drawn in a hand he did not know was anticipating you.', portrait: PORTRAITS.pleased },
    { kind: 'line', speaker: 'LUCIEN', text: 'Not today. Today is — today you should go back. The captain will be in a small grade of agony by now. I will not keep you longer than fifteen minutes. I have waited six years. Fifteen more minutes is — restraint.', portrait: PORTRAITS.gentle },
    { kind: 'narration', text: 'You hesitate. You ask if you may come back. If you may use his library.', portrait: PORTRAITS.gentle },
    { kind: 'line', speaker: 'LUCIEN', text: 'Of course. Any hour. I will not lock the door. I never lock the door. Now I will not lock the door for a particular person, which is — different.', portrait: PORTRAITS.fascinated },
    { kind: 'narration', text: 'You walk back down the hill. The dusk is starting. Halfway down, Alistair meets you on the path. He does not scold you. He says, evenly:' },
    { kind: 'line', speaker: 'ALISTAIR', text: 'You walked half a mile of corridor on your own. I am glad. Next time, tell me, and I will walk it with you. Or behind you. Whichever you prefer.' },
    { kind: 'narration', text: 'It is the most Alistair thing he has ever said to you. You feel it in two places at once: the place that loves him, and the place that has just been to a tower.' },
    { kind: 'tutorial', text: 'A new face is open to you. Lucien’s route is unlocked. He will treat you like a concept he loves — which, paradoxically, will make you feel like a person.', portrait: PORTRAITS.pleased }
  ];

  let _playing = false;

  function play() {
    if (_playing) return Promise.resolve();
    if (!window.MSCard || !window.PPBridgeCompile) return Promise.resolve();
    _playing = true;
    if (window.PPChain && window.PPChain.setChainInProgress) window.PPChain.setChainInProgress(true);
    return new Promise((resolve) => {
      const card = {
        id: 'b_lucien',
        title: 'BRIDGE — LUCIEN',
        subtitle: 'The Tower on the Hill',
        speaker: '',
        palette: { bg: '#0e0820', glow: '#a98ad8', accent: '#ece2f6' },
        bg: 'assets/bg-lucien-study.png',
        beats: window.PPBridgeCompile.toMSCard(BEATS, { firstWait: 700 })
      };
      window.MSCard.show(card, () => { finish(); resolve(); });
    });
  }

  function finish() {
    _playing = false;
    try { localStorage.setItem('pp_intro_lucien', '1'); } catch (_) {}
    try { localStorage.setItem('pp_chapter_done_b_lucien', '1'); } catch (_) {}

    const stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
      ? window.PPChain.step() : 0;
    if (window.PPChain && typeof window.PPChain.advance === 'function') {
      window.PPChain.advance(5);
      if (stepBefore < 5 && typeof window.PPChain.fireChapterFor === 'function') {
        window.PPChain.fireChapterFor(5);
      } else if (window.PPChain.setChainInProgress) {
        window.PPChain.setChainInProgress(false);
      }
    }
  }

  window.PPBridgeLucien = { play: play };
})();
