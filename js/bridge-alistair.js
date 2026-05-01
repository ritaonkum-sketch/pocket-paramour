/* bridge-alistair.js — chain step 1: rescue, secret, maid's chamber, meet-cute
 * ============================================================================
 *   The Captain on solo dawn patrol finds her unconscious in the south wood.
 *   Carries her back. The murmured name in a language he does not recognise
 *   (he memorises it). The maid's chamber chosen so the chamberlain doesn't
 *   need to ask. The full-day standing watch. The wake. The cup of water.
 *   "I will not ask you what you are. Not yet. You do not know either, do you, miss."
 *
 *   RENDERS VIA MSCard — same engine as every main-story chapter. Bridge
 *   BEATS get translated by window.PPBridgeCompile.toMSCard().
 *
 *   On finish: PPChain.advance(1) — Alistair is met, others stay LOCKED until
 *   tutorial gate (affection 25 + full care cycle).
 * ============================================================================
 */

(function () {
  'use strict';

  const FLAG_PLAYED = 'pp_bridge_alistair_played';
  const PORTRAITS = {
    standing: 'assets/alistair/body/crossarms.png',
    talking:  'assets/alistair/body/talking6.png',
    softer:   'assets/alistair/body/wondering.png'
  };

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  const BEATS = [
    { kind: 'narration', text: 'A man’s shadow falls across you. Hooves stop. Boots in moss. He kneels — exact, not gentle, not rough.' },
    { kind: 'narration', text: 'You feel his hand at your wrist. Checking the pulse. Then under your shoulders. He lifts you the way one lifts a wounded thing they intend to keep alive.', portrait: PORTRAITS.standing },
    { kind: 'line', speaker: 'CAPTAIN', text: 'Stay with me, miss. Eyes open if you can. Twenty minutes to the south gate. I will not lose you between here and there.', portrait: PORTRAITS.standing },
    { kind: 'narration', text: 'You drift. The horse moves under you. Somewhere inside the drift, you say a word — a name, in a language that is not the language of this place. You do not remember saying it.', portrait: PORTRAITS.standing },
    { kind: 'narration', text: 'He hears it. He memorises it without telling you. He will write it on a slip of paper later and not show it to anyone yet.', portrait: PORTRAITS.standing },
    { kind: 'narration', text: 'You wake to the sound of a door not opening. Stone walls. A small window. A bed that smells of linen too clean for an inn.', portrait: PORTRAITS.standing },
    { kind: 'narration', text: 'A man is standing inside the door, hands behind his back, sword at his hip but the hand nowhere near the hilt. He has not sat down. He has not looked away.', portrait: PORTRAITS.standing },
    { kind: 'line', speaker: 'ALISTAIR', text: 'You have been asleep for one full day. I have been here. You are safe. When you can sit up, I will get you water. Not before.', portrait: PORTRAITS.standing },
    { kind: 'narration', text: 'You sit up too fast. The room tilts. He is there before you tip over — one hand under your shoulder, one against the wall behind your head. Bracing the world for you.', portrait: PORTRAITS.talking },
    { kind: 'line', speaker: 'ALISTAIR', text: 'Slowly. Slowly. There is no audience. No one is waiting for you to be brave. Drink first, then talk.', portrait: PORTRAITS.talking },
    { kind: 'narration', text: 'He passes you a cup of water. The cup is plain. The room is plain. You realise, looking past him at the corridor, that this is a maid’s chamber. Servants’ wing. The kind of room nobody asks about.', portrait: PORTRAITS.talking },
    { kind: 'line', speaker: 'ALISTAIR', text: 'I should have taken you to the chamberlain. He will want a name and a province and three documents you cannot give him. So you are here instead. I will explain it later. To him. Not to you.', portrait: PORTRAITS.softer },
    { kind: 'narration', text: 'He covered for you. Before he knew your name. You feel that land somewhere behind your ribs.', portrait: PORTRAITS.softer },
    { kind: 'line', speaker: 'ALISTAIR', text: 'I am Alistair. Captain of the Guard, south gate. While you mend, I am the only person who knows you are in this castle. That will not always be true. Today it is.', portrait: PORTRAITS.softer },
    { kind: 'line', speaker: 'ALISTAIR', text: 'I will not ask you what you are. Not yet. You do not know either, do you, miss.', portrait: PORTRAITS.softer },
    { kind: 'narration', text: 'He says it like a fact, not a question. Like something he has already decided and is telling you so you do not have to decide it alone.', portrait: PORTRAITS.softer },
    { kind: 'tutorial', text: 'Care for him, Weaver. Bring him water, mend the seam in his cloak, eat with him at the captain’s table. He does not ask. You will know what to do.', portrait: PORTRAITS.softer }
  ];

  let _playing = false;

  function play() {
    if (_playing) return Promise.resolve();
    if (!window.MSCard || typeof window.MSCard.show !== 'function') return Promise.resolve();
    if (!window.PPBridgeCompile) return Promise.resolve();
    _playing = true;
    if (window.PPChain && window.PPChain.setChainInProgress) window.PPChain.setChainInProgress(true);
    return new Promise((resolve) => {
      const card = {
        id: 'b_alistair',
        title: 'BRIDGE — ALISTAIR',
        subtitle: 'The Captain’s Patrol',
        speaker: '',
        palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
        bg: 'assets/bg-alistair-gate.png',
        beats: window.PPBridgeCompile.toMSCard(BEATS, { firstWait: 700 })
      };
      window.MSCard.show(card, () => { finish(); resolve(); });
    });
  }

  function finish() {
    _playing = false;
    lsSet(FLAG_PLAYED, '1');
    // NOTE: previously we set `pp_intro_alistair = 1` here so the OLD
    // per-character intro (intro.js) wouldn't fire on top of the bridge.
    // That had a side-effect of also suppressing the NAME PROMPT (which
    // lives in intro.js) — players ended up in the care loop with no
    // name entered and every {name} dialogue token resolving to empty.
    // Now intro.js's Alistair scene has been rewritten to fit the
    // post-bridge timeline (he already met you, you slept a day in the
    // maid's chamber, this is the morning after) AND the name prompt
    // is its climax. Letting it fire is the intended flow.
    if (lsGet('pp_main_story_enabled') !== '1') lsSet('pp_main_story_enabled', '1');
    try { localStorage.setItem('pp_chapter_done_b_alistair', '1'); } catch (_) {}

    const stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
      ? window.PPChain.step() : 0;
    if (window.PPChain && typeof window.PPChain.advance === 'function') {
      // advance() now returns a Promise that resolves AFTER the route-open
      // card has been tapped by the player. Chapter must wait — otherwise
      // the chapter card buries the route announcement. (Old behaviour:
      // toast and chapter both fired synchronously; user only saw the
      // toast for ~1s before the chapter covered it.)
      const advanced = window.PPChain.advance(1);
      const fireChapter = () => {
        if (stepBefore < 1 && typeof window.PPChain.fireChapterFor === 'function') {
          window.PPChain.fireChapterFor(1);
        } else if (window.PPChain.setChainInProgress) {
          window.PPChain.setChainInProgress(false);
        }
      };
      if (advanced && typeof advanced.then === 'function') {
        advanced.then(fireChapter, fireChapter);
      } else {
        fireChapter();
      }
    } else {
      lsSet('pp_chain_step', '1');
      lsSet('pp_met_alistair', '1');
      lsSet('pp_ms_encounter_alistair_seen', '1');
    }
  }

  window.PPBridgeAlistair = { play: play };
})();
