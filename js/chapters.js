/* chapters.js.Main Story spine. The narrative backbone that introduces
 * the world and each character in canonical order.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Depends on MSCard + MSEncounter<Char> modules.
 *  - Feature-flagged on pp_main_story_enabled (same umbrella). No edits to
 *    game.js or any other original file.
 *  - Chapter progress lives in `pp_chapter_current` (integer) and
 *    `pp_chapter_done_<id>` (0/1). Never mutates save state.
 *  - After each chapter completes, the associated character gets its
 *    main-story encounter-seen flag set so the unlock-chain elsewhere
 *    recognises them as "met."
 *
 * CHAPTER SHAPE:
 *  { id, title, subtitle, teaser, charId, play(onDone) }
 *    - play(): runs the chapter\u2019s full cinematic sequence
 *    - charId: which character this chapter introduces (null for prologue/finale)
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const CUR_KEY  = 'pp_chapter_current';
  const ORB_ID   = 'chp-orb';
  const PAGE_ID  = 'chp-page';

  function isEnabled() {
    try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; }
  }
  // "Current" is derived as the first chapter in array order that is NOT
  // yet done. The stored CUR_KEY value is kept as a hint (and for legacy)
  // but it does NOT take precedence.a player who has done chapters
  // 1, 2, 3 but not the bridge between them should see the bridge as
  // current, not the next numeric chapter.
  //
  // This also fixes the subtle bug where setCurrent('b_arrival') (string)
  // would be read back via parseInt as NaN → 0, making the menu think
  // PROLOGUE was current instead of the bridge.
  function getCurrent() {
    try {
      for (let i = 0; i < CHAPTERS.length; i++) {
        if (!isDone(CHAPTERS[i].id)) return CHAPTERS[i].id;
      }
      // All chapters done.return last as current for "all complete" state.
      return CHAPTERS.length > 0 ? CHAPTERS[CHAPTERS.length - 1].id : 0;
    } catch (e) { return 0; }
  }
  function setCurrent(n) {
    // Stored as a hint only.getCurrent() derives from done-state.
    try { localStorage.setItem(CUR_KEY, String(n)); } catch (e) {}
  }
  function isDone(id) { try { return localStorage.getItem('pp_chapter_done_' + id) === '1'; } catch (e) { return false; } }
  function markDone(id) { try { localStorage.setItem('pp_chapter_done_' + id, '1'); } catch (e) {} }

  // ---------------------------------------------------------------
  // MS encounter wrappers: run the existing meet-cute as the chapter opener.
  function runEncounter(name) {
    return new Promise((resolve) => {
      const mod = window['MSEncounter' + name];
      if (mod && typeof mod.play === 'function') {
        try { mod.play(() => resolve()); } catch (_) { resolve(); }
      } else resolve();
    });
  }

  function runCard(cardData) {
    return new Promise((resolve) => {
      if (!window.MSCard || typeof window.MSCard.show !== 'function') { resolve(); return; }
      try { window.MSCard.show(cardData, () => resolve()); } catch (_) { resolve(); }
    });
  }

  // ---------------------------------------------------------------
  // CHAPTER DEFINITIONS
  //
  // Each chapter's play() function runs its full sequence. The pattern for
  // character chapters: opening (meet-cute) \u2192 middle (MSCard) \u2192 closer
  // (MSCard that also unlocks character).
  // ---------------------------------------------------------------
  const CHAPTERS = [
    {
      id: 0,
      title: 'Prologue',
      subtitle: 'A Kingdom Fades',
      teaser: 'You wake with no memory, and the world already needs you.',
      charId: null,
      play: async function (onDone) {
        await runCard({
          id: 'chp_0_prologue',
          title: 'Prologue',
          subtitle: 'A Kingdom Fades',
          speaker: '',
          // cinematic: true switches MSCard's dialogue from the bottom
          // bubble to a full-bleed centered narration style. World
          // prologue only.the bridges and Arrival keep their bubbles.
          cinematic: true,
          palette: { bg: '#080516', glow: '#7a6ab8', accent: '#f0e6ff' },
          bg: 'assets/bg-world.png',
          beats: [
            { type: 'show',      pose: '', wait: 500 },
            { type: 'line',      text: 'The Kingdom of Aethermoor is dying.', hold: 1600, cps: 30 },
            { type: 'line',      text: 'Its magic once lived in the bonds between its people. Those bonds are breaking.', hold: 2200, cps: 28 },
            { type: 'line',      text: 'The last Soul Weaver, “THE ONE WHO KEPT THE CONNECTIONS ALIVE,” is gone.', hold: 2200, cps: 28 },
            { type: 'flourish',  text: '\u2726', duration: 1800 },
            { type: 'line',      text: 'In desperation, the Kingdom\u2019s magic reached across worlds. And found you.', hold: 2400, cps: 28 },
            { type: 'line',      text: 'You arrived with no memory. Only an instinct to connect. To stay. To care.', hold: 2400, cps: 28 },
            { type: 'particles', count: 24, duration: 2200 },
            { type: 'line',      text: 'Where you walk, the magic returns. Where you stay, someone remembers.', hold: 2600, cps: 28 },
            { type: 'hold',      ms: 900 },
            { type: 'hide' }
          ]
        });
        markDone(0); setCurrent(nextIdAfter(0));
        if (onDone) onDone();
      }
    },

    // -- BRIDGE: ARRIVAL ------------------------------------------------------
    {
      id: 'b_arrival',
      title: 'Chapter 1',
      subtitle: 'Face Down in Moss',
      teaser: 'You wake in a wood that has not learned your name yet. A torn page. The Aethermoor seal.',
      charId: null,
      play: async function (onDone) {
        if (window.PPWorldArrival && typeof window.PPWorldArrival.play === 'function') {
          await window.PPWorldArrival.play();
        }
        markDone('b_arrival'); setCurrent(nextIdAfter('b_arrival'));
        if (onDone) onDone();
      }
    },

    // -- CHAPTER 2: ALISTAIR (bridge / first meeting) ------------------------
    {
      id: 'b_alistair',
      title: 'Chapter 2',
      subtitle: 'The Captain’s Patrol',
      teaser: 'A captain on solo dawn patrol finds you in the moss. He carries you to a chamber that is not the chamberlain’s.',
      charId: 'alistair',
      play: async function (onDone) {
        if (window.PPBridgeAlistair && typeof window.PPBridgeAlistair.play === 'function') {
          await window.PPBridgeAlistair.play();
        }
        markDone('b_alistair'); setCurrent(nextIdAfter('b_alistair'));
        if (onDone) onDone();
      }
    },

    {
      id: 1,
      title: 'Chapter 3',
      subtitle: 'The Gate',
      teaser: 'The first face you see is carrying a sword.',
      charId: 'alistair',
      play: async function (onDone) {
        // legacy meet-cute removed.bridge-alistair is the meet-cute now
        await runCard({
          id: 'chp_1_middle',
          title: 'Chapter 3',
          subtitle: 'You Arrive · the Gate',
          speaker: 'ALISTAIR',
          palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
          bg: 'assets/bg-alistair-gate.png',
          beats: [
            { type: 'show',      pose: 'assets/alistair/body/casual.png', wait: 700 },
            { type: 'line', speaker: '', text: 'Three mornings on. You are walking again. He has slept perhaps four hours of those three nights and is pretending he has slept more. He comes to your door at first bell. He says: the gate. You walk with him to the gate.', hold: 4400, cps: 24 },
            { type: 'line',      text: 'Walk with me. The outer wall is where the fading started.', hold: 2000, cps: 30 },
            { type: 'line',      text: 'Stones that held magic for a thousand years are just stones now. The kingdom is unlearning itself.', hold: 2400, cps: 28 },
            { type: 'line',      text: 'Last night a torch that\u2019s burned at this gate since my grandfather stood watch. It simply went out. No wind. No hand. Just forgot how to be a flame.', hold: 2800, cps: 28 },
            // (Slow-burn Ch3 fingertip beat \u2014 torn-page arc. He talks about
            //  the torch; her hand goes to the sleeve where the page lives,
            //  without permission. Said only in narration. He does not see.)
            { type: 'line', speaker: '', text: 'Your hand finds the lining of your sleeve before you decide to move it. The thumb-sized fold of paper is still there. It is warm from your wrist. The torch went out. The page is still warm. You do not yet know whether those two facts are connected.', hold: 3200, cps: 26 },
            { type: 'line',      text: 'And something down below \u2026laughed when it happened. Faintly. I almost thought I imagined it.', hold: 2600, cps: 28 },
            { type: 'pose',      src: 'assets/alistair/body/crossarms.png', animate: 'swap' },
            { type: 'line',      text: 'I haven\u2019t slept through a night since I was eleven years old. I keep thinking the wall will hold if I just \u2026 watch it harder.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'I shouldn\u2019t be telling you this. I don\u2019t know why I am. \u2026Yes I do.', hold: 2600, cps: 28 },
            { type: 'pose',      src: 'assets/alistair/body/softshy-love1.png', animate: 'swap' },
            { type: 'line',      text: 'You make the watch feel \u2026 like company. Not duty. I\u2019m not used to that. I might be terrible at it.', hold: 2800, cps: 28 },
            { type: 'flourish',  text: '\u2726', duration: 1600 },
            { type: 'line',      text: 'Come back tomorrow. I\u2019ll show you the hall. And the room behind it that I\u2019ve never let anyone see.', hold: 2600, cps: 28 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_alistair_seen','1'); } catch (_) {}
        markDone(1); setCurrent(nextIdAfter(1));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 4: THE QUIET DOOR  (connective scene — Alistair, three days)
    // ---------------------------------------------------------------
    // PURPOSE: Closes the gap between Ch3 ("the gate" walk with Alistair,
    // who promises "come back tomorrow") and the Elian bridge ("after
    // three silent days locked in the chamber"). Player needed a beat
    // showing the chamber going from open warmth to lockdown so the
    // motivation to slip out lands.
    // ---------------------------------------------------------------
    {
      id: 'chp_quiet_door',
      title: 'Chapter 4',
      subtitle: 'The Quiet Door',
      teaser: 'The corridor goes silent. Three days of meals that arrive without a face.',
      charId: 'alistair',
      play: async function (onDone) {
        await runCard({
          id: 'chp_quiet_door_a',
          title: 'Chapter 4',
          subtitle: 'The Quiet Door · The Tray',
          speaker: '',
          palette: { bg: '#0a0c1a', glow: '#7a7488', accent: '#e0d8e8' },
          bg: 'assets/bg-alistair-hall.png',
          beats: [
            { type: 'show', pose: '', wait: 800 },
            { type: 'line', text: 'Morning bell. You wake listening for the captain’s boots. The corridor outside answers with a different tread, lighter, not his.', hold: 3400, cps: 26 },
            { type: 'line', text: 'A wooden tray slides under your door. Bread, water, an apple bruised on one side. No knock. No voice. The footsteps are already gone.', hold: 3600, cps: 26 },
            { type: 'line', text: 'You go to the door and try the latch. It does not move. You try it again, slower, in case the wood is only swollen. The bolt has been thrown from the corridor side.', hold: 3600, cps: 26 },
            { type: 'hide' }
          ]
        });

        await runCard({
          id: 'chp_quiet_door_b',
          title: 'Chapter 4',
          subtitle: 'The Quiet Door · The Note',
          speaker: '',
          palette: { bg: '#0a0c1a', glow: '#7a7488', accent: '#e0d8e8' },
          bg: 'assets/bg-alistair-hall.png',
          beats: [
            { type: 'show', pose: '', wait: 700 },
            { type: 'line', text: 'There is a folded square of paper under the apple. The handwriting is not his. The hand is older, more careful, and it has not signed.', hold: 3400, cps: 26 },
            { type: 'line', text: '“The captain has been called to the south wall. The chamberlain has not been told you are here. Open this door for no one but him.”', hold: 4000, cps: 26 },
            { type: 'flourish', text: '✦', duration: 1600 },
            { type: 'line', text: 'You read it twice. Then a third time. Then you fold it back along its crease and put it under the apple. The apple is the only thing in the room that has not changed since yesterday.', hold: 3800, cps: 26 },
            { type: 'hide' }
          ]
        });

        await runCard({
          id: 'chp_quiet_door_c',
          title: 'Chapter 4',
          subtitle: 'The Quiet Door · Three Days',
          speaker: '',
          palette: { bg: '#0a0c1a', glow: '#7a7488', accent: '#e0d8e8' },
          bg: 'assets/bg-alistair-hall.png',
          beats: [
            { type: 'show', pose: '', wait: 700 },
            { type: 'line', text: 'Day two. The tray comes. A different hand. A different bruise on a different apple. The boots in the corridor still are not his.', hold: 3400, cps: 26 },
            { type: 'line', text: 'You sit on the floor by the door slot. You watch the small strip of corridor light for a long hour, the way a child watches for a parent who promised. None of the boots that pass are his.', hold: 3800, cps: 26 },
            { type: 'line', text: 'Day three. You stop watching. You take inventory instead. The narrow window with its narrow ledge. The kitchen postern you remember from being carried in. The plain cloak that is not yours, on the chair where he left it.', hold: 4000, cps: 26 },
            { type: 'line', text: 'You have been waiting three days. You will not wait a fourth. The question is only what you take with you.', hold: 3400, cps: 24 },
            { type: 'choice', prompt: 'How do you leave?', options: [
              { id: 'armed',   text: 'Take the kitchen knife. Better to have it and not need it.' },
              { id: 'unarmed', text: 'Leave the knife. A blade in your hand will not save you here.' }
            ], onChoose: (choice) => {
              try { localStorage.setItem('pp_ms_departure_choice', choice); } catch (_) {}
            }},
            { type: 'hide' }
          ]
        });

        markDone('chp_quiet_door'); setCurrent(nextIdAfter('chp_quiet_door'));
        if (onDone) onDone();
      }
    },

    // -- CHAPTER 5: ELIAN (bridge / first meeting) ---------------------------
    {
      id: 'b_elian',
      title: 'Chapter 5',
      subtitle: 'Smoke at the Treeline',
      teaser: 'You slip the kitchen postern and follow smoke to a fire. A man with a knife. He bandages you before he asks the question.',
      charId: 'elian',
      play: async function (onDone) {
        if (window.PPBridgeElian && typeof window.PPBridgeElian.play === 'function') {
          await window.PPBridgeElian.play();
        }
        markDone('b_elian'); setCurrent(nextIdAfter('b_elian'));
        if (onDone) onDone();
      }
    },

    {
      id: 2,
      title: 'Chapter 6',
      subtitle: 'The Forest Finds You',
      teaser: 'A path that isn\u2019t on any map, and a voice from the trees.',
      charId: 'elian',
      play: async function (onDone) {
        // legacy meet-cute removed.bridge-elian is the meet-cute now
        // Restructured May 2026: was one giant monologue dump (Fading +
        // buried-Weaver + lineage + trees-leaning all in one fire-sit).
        // Now three staged visits across implied days. Elian discloses
        // gradually, the way a man like Elian actually would.

        // Card A: First visit back. Surface. The Fading.
        await runCard({
          id: 'chp_2_a',
          title: 'Chapter 6',
          subtitle: 'The Forest Finds You · The Returning',
          speaker: 'ELIAN',
          palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 700 },
            { type: 'line', speaker: '', text: 'Weeks pass. The castle gives you silk and a chamber and meals you do not have to ask for. You think of the man with the knife who gave you a strip of venison and a place to sleep by a fire. One afternoon you walk south. You walk back into his trees.', hold: 4600, cps: 24 },
            { type: 'line', speaker: '', text: 'He is at the same fire. He does not look up when you cross into the clearing. He says, without inflection, as if continuing a sentence: "I knew you would come back. I did not know when. Sit. The log to your left."', hold: 4400, cps: 24 },
            { type: 'line',      text: 'The trees used to remember names. Now they only remember absences.', hold: 2400, cps: 28 },
            { type: 'line',      text: 'A deer ran past me yesterday with no reflection in the stream. The water just \u2026 forgot to hold it. The forest is losing pieces of itself.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'And deeper in. Past the stones I mark. Something has started calling at night. A man\u2019s voice, low. Warm. Wrong.', hold: 2800, cps: 28 },
            { type: 'hide' }
          ]
        });

        // Card B: Days later. He walks her off the path. The buried Weaver.
        await runCard({
          id: 'chp_2_b',
          title: 'Chapter 6',
          subtitle: 'The Forest Finds You \u00b7 Where He Digs',
          speaker: 'ELIAN',
          palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 700 },
            { type: 'line', speaker: '', text: 'You come back twice more in the next ten days. The third time he does not speak when you arrive. He stands. He walks you off the path, north along the creek, until you reach a clearing you would not have found on your own.', hold: 4600, cps: 24 },
            { type: 'pose',      src: 'assets/elian/body/foraging.png', animate: 'swap' },
            { type: 'line',      text: 'I buried someone in this forest. A long time ago. They were the first person I let past the treeline. I was young. In my terms. My terms are longer than most.', hold: 3400, cps: 26 },
            { type: 'line',      text: 'They were a Weaver. Like you. The first I ever knew. The kingdom took her from these trees. I have been tending her forest ever since.', hold: 3400, cps: 26 },
            { type: 'line',      text: 'None of my line has said her name aloud since my grandmother\u2019s grandmother. I think we were afraid the world would not know what to do with the sound. \u2026You might. One day.', hold: 3400, cps: 24 },
            { type: 'line', speaker: '', text: 'He does not say the name today. He has not yet decided whether you have earned it. He looks at you a long moment, the way a man looks at the lock he is testing the key against. Then he turns and walks you back to the fire.', hold: 4200, cps: 24 },
            { type: 'hide' }
          ]
        });

        // Card C: Another visit. The trees lean. The invitation. The choice.
        await runCard({
          id: 'chp_2_c',
          title: 'Chapter 6',
          subtitle: 'The Forest Finds You \u00b7 The Trees Lean',
          speaker: 'ELIAN',
          palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 700 },
            { type: 'line', speaker: '', text: 'Two more visits. On the seventh you walk into the clearing and the trees lean.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'They actually lean. It is not metaphor. The branches above your head shift toward the path, slow, as if turning to a sound you cannot hear. Elian sees it. He has not seen it in years.', hold: 4200, cps: 24 },
            { type: 'pose',      src: 'assets/elian/body/foraging.png', animate: 'swap' },
            { type: 'line',      text: 'They have not done that since I stopped saying her name. You\u2019re the first thing this forest has remembered since.', hold: 3000, cps: 26 },
            { type: 'line',      text: 'I don\u2019t know what to do with that yet. I think the forest does.', hold: 2400, cps: 28 },
            { type: 'flourish',  text: '\u2726', duration: 1600 },
            { type: 'line',      text: 'Come back at dusk. The woods open differently then. And one day, soon, I will show you where I dig. *He will not press you for the answer. He will not look at you while he waits for it either.*', hold: 3400, cps: 26 },
            { type: 'choice', prompt: 'What do you tell him?', options: [
              { id: 'return', text: 'Yes. I will be at the treeline by dusk.' },
              { id: 'sleep',  text: 'Give me a night first. I will come back tomorrow.' }
            ], onChoose: (choice) => {
              try { localStorage.setItem('pp_ms_elian_return_choice', choice); } catch (_) {}
            }},
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_elian_seen','1'); } catch (_) {}
        markDone(2); setCurrent(nextIdAfter(2));
        if (onDone) onDone();
      }
    },

    // -- INTERLUDE: THE WARDENS ----------------------------------------------
    // (Surprise-arc remainder, May 2026 — owner request.)
    // Sits between Elian's Ch6 (forest, three-card sequence) and Lyra's Ch7
    // bridge. The "outside-kingdom" scene for Elian. Past his patrol, past
    // the coast road, into a fold of land the kingdom never named: the
    // hill of stones where each Warden has been buried, including the
    // uncarved stone Elian has set for himself. Echoes the Lyra crossover
    // (siren-stones at the south edge — Lyra named those) but is a DIFFERENT
    // site: the Warden line, not the siren-kind. The player either claims
    // the empty patch beside his stone or refuses it. Flag:
    // pp_ms_elian_stones_choice ('patch' | 'beside').
    {
      id: 'elian_stones',
      title: 'Interlude: The Wardens',
      subtitle: 'A Hill He Has Tended a Long Time',
      teaser: 'He has the second saddle ready before you ask. South. Past where the patrol writes him in.',
      charId: 'elian',
      play: async function (onDone) {
        await runCard({
          id: 'chp_elian_stones',
          title: 'Interlude: The Wardens',
          subtitle: 'A Hill He Has Tended a Long Time',
          speaker: 'ELIAN',
          palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show', pose: 'assets/elian/body/calm.png', wait: 700 },
            { type: 'line', speaker: '', text: 'He is at your chamber door at dawn. Two horses on the cobbles behind him. The second saddle has been ready for a week. He says, in the way he says most things: "South."', hold: 4400, cps: 24 },
            { type: 'line', speaker: '', text: 'You ride past the south gate before the watch-bell rings. The captain at the post sees Elian. The captain does not ask him to sign the log. They have an arrangement that is older than the captain. You ride out.', hold: 4400, cps: 24 },
            { type: 'line', speaker: '', text: 'Past Elian’s patrol territory. Past the coast road. Into a fold of land the kingdom never bothered to name. The grass is salt-coarse. The wind is steady. He does not look back to see if you are keeping up. He has known you would.', hold: 4600, cps: 24 },
            { type: 'pose', src: 'assets/elian/body/foraging.png', animate: 'swap' },
            { type: 'line', speaker: '', text: 'A hill. Rowans on the crown of it. Below the rowans, in a soft line, eight stones. Some are old enough that the carvings are wind-eaten. Some are recent. The newest is uncarved. The line is kept. Someone has weeded it.', hold: 4800, cps: 22 },
            { type: 'line', text: 'The Wardens. Each one took the post for as long as they could carry it. The place is theirs. The stones are theirs. The post is solitary. The stone is solitary. That is the bargain.', hold: 4600, cps: 24 },
            { type: 'line', speaker: '', text: 'He kneels at the first stone. Pulls a sprig of rosemary from the leather pouch you have noticed in his pack for weeks. You thought it was for cooking. He lays the sprig at the base of the stone. He moves to the next. Another sprig. Another. Eight stones. Eight sprigs.', hold: 5200, cps: 22 },
            { type: 'line', text: 'I say their names quietly. They are not for the wind. The wind has had them long enough.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'He stands at the eighth stone. The uncarved one. He lays the last sprig of rosemary on top of it.', hold: 3400, cps: 24 },
            { type: 'line', text: 'This one is mine. The Warden before me brought me here when I took the post. I have brought no one else here since. *He looks at you for the first time since you arrived. The look is steady. It is also a question that is not being asked.* There is room beside it. *He indicates a flat patch of grass next to his stone, kept clear of weeds.* I have not promised it to anyone in a hundred and fifty years. I am promising nothing now. I am telling you the patch is empty.', hold: 6200, cps: 22 },
            { type: 'choice', prompt: 'What do you do?', options: [
              { id: 'patch',  text: 'Stand on the patch. Let your boots be on it.' },
              { id: 'beside', text: 'Stay beside him at the cairn. Look at him, not the stone.' }
            ], onChoose: (choice) => {
              try { localStorage.setItem('pp_ms_elian_stones_choice', choice); } catch (_) {}
            }},
            { type: 'flourish', text: '✦', duration: 1800 },
            { type: 'line', speaker: '', text: 'He does not say what your answer means to him. He does not have to. The ride home is in the same silence as the ride out, and now you understand: the silence is how he keeps the names. He has just made room for one more.', hold: 4800, cps: 22 },
            { type: 'hide' }
          ]
        });
        markDone('elian_stones'); setCurrent(nextIdAfter('elian_stones'));
        if (onDone) onDone();
      }
    },

    // -- CHAPTER 7: LYRA (bridge / first meeting) ----------------------------
    {
      id: 'b_lyra',
      title: 'Chapter 7',
      subtitle: 'The South Coast Road',
      teaser: 'A day-and-a-half walk to a cave-mouth at the end of the world. A woman barefoot in the surf says your name before you do.',
      charId: 'lyra',
      play: async function (onDone) {
        if (window.PPBridgeLyra && typeof window.PPBridgeLyra.play === 'function') {
          await window.PPBridgeLyra.play();
        }
        markDone('b_lyra'); setCurrent(nextIdAfter('b_lyra'));
        if (onDone) onDone();
      }
    },

    {
      id: 3,
      title: 'Chapter 8',
      subtitle: 'The Caves Answer',
      teaser: 'A song from the deep. You are the first to stay.',
      charId: 'lyra',
      play: async function (onDone) {
        // legacy meet-cute removed.bridge-lyra is the meet-cute now
        // Restructured May 2026: was one giant monologue dump (orphan
        // childhood + mother's people + staff humming + Noir-whispers all
        // in one fire-sit). Now three staged visits across implied days.
        // Lyra performs warmth easily; the deeper material comes out the
        // way she serves broth — slowly, by visit, when she's decided
        // you'll come back.

        // Card A: Fourth visit. Surface — she has stopped finishing songs.
        await runCard({
          id: 'chp_3_a',
          title: 'Chapter 8',
          subtitle: 'The Caves Answer · The Hush',
          speaker: 'LYRA',
          palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
          bg: 'assets/bg-siren-cave.png',
          beats: [
            { type: 'show',      pose: 'assets/lyra/body/casual1.png', wait: 700 },
            { type: 'line', speaker: '', text: 'You come back to the cliff road three times in the next two weeks. Lyra is always there, always barefoot, always seeming to have set out broth a quarter-hour before you arrive. The fourth time you walk into the cave without calling out. She does not look up.', hold: 4800, cps: 24 },
            { type: 'line', speaker: '', text: 'She is sitting cross-legged on a flat stone with her staff across her knees. She is humming under her breath. The hum stops when you cross the threshold. The cave does not.', hold: 4000, cps: 24 },
            { type: 'pose',      src: 'assets/lyra/body/casual2.png', animate: 'swap' },
            { type: 'line',      text: 'The caves used to sing back. They stopped when the last Weaver left. Sit. There is broth.', hold: 3000, cps: 26 },
            { type: 'line',      text: 'I stopped finishing my songs years ago. I\u2019d get to the second verse and the room would feel small. Like singing into a coat pocket.', hold: 3000, cps: 26 },
            { type: 'line',      text: 'You stayed for a whole verse. You stayed for the silence after, too. \u2026That hasn\u2019t happened in this lifetime.', hold: 2800, cps: 26 },
            { type: 'hide' }
          ]
        });

        // Card B: Next morning. She hands you the spoon. Family history.
        await runCard({
          id: 'chp_3_b',
          title: 'Chapter 8',
          subtitle: 'The Caves Answer \u00b7 Where She Came From',
          speaker: 'LYRA',
          palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
          bg: 'assets/bg-siren-cave.png',
          beats: [
            { type: 'show',      pose: 'assets/lyra/body/casual1.png', wait: 700 },
            { type: 'line', speaker: '', text: 'You come back the next morning. She is already at the broth pot, already barefoot. She does not greet you. She just hands you the spoon and goes to fetch a second bowl.', hold: 3800, cps: 26 },
            { type: 'line',      text: 'I have been alone down here a long time. Too long to count honestly. I was caged before I was alone. My father\u2019s house. His wife did not like the sound of me. I escaped at fifteen. The cave is the quieter cage.', hold: 4000, cps: 24 },
            { type: 'pose',      src: 'assets/lyra/body/casual2.png', animate: 'swap' },
            { type: 'line',      text: 'My mother\u2019s people used to sing in the ruined town out there. They were a whole people. Hunted. I am the last who still knows the words.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'She says it without ceremony. She says it the way a woman tells you what she had for breakfast, because she has decided you are someone she does not have to perform for.', hold: 3800, cps: 24 },
            { type: 'hide' }
          ]
        });

        // Card C: Sixth visit at dusk. The staff hums. The thing beneath. The warning.
        await runCard({
          id: 'chp_3_c',
          title: 'Chapter 8',
          subtitle: 'The Caves Answer \u00b7 What Answers Back',
          speaker: 'LYRA',
          palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
          bg: 'assets/bg-siren-cave.png',
          beats: [
            { type: 'show',      pose: 'assets/lyra/body/casual1.png', wait: 700 },
            { type: 'line', speaker: '', text: 'It is dusk on a sixth visit. She is at the cave-mouth with the staff in her hand. The salt crystal at the top is humming. The sea outside has gone the colour of pewter.', hold: 3800, cps: 26 },
            { type: 'line',      text: 'The staff hums when I walk east. Toward a tower I have never visited. Someone with my bloodline lives there. One day. Not yet.', hold: 3000, cps: 26 },
            { type: 'pose',      src: 'assets/lyra/body/casual2.png', animate: 'swap' },
            { type: 'line',      text: 'And lately. When I sing low. Something underneath answers. Not the cave. Something below the cave. A man\u2019s voice, velvet, and hungry.', hold: 3000, cps: 28 },
            { type: 'line',      text: 'I don\u2019t answer him. I won\u2019t. \u2026But I\u2019m afraid of the day the song forgets that rule.', hold: 2600, cps: 28 },
            { type: 'pose',      src: 'assets/lyra/body/casual1.png', animate: 'swap' },
            { type: 'line',      text: 'If you can stay for two verses, I\u2019ll write you the rest. I haven\u2019t done that for anyone.', hold: 2600, cps: 28 },
            { type: 'flourish',  text: '\u266a', duration: 1600 },
            { type: 'line',      text: 'Don\u2019t bring anyone. They\u2019d ruin it. \u2026Or worse. He might notice them.', hold: 2400, cps: 28 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_lyra_seen','1'); } catch (_) {}
        markDone(3); setCurrent(nextIdAfter(3));
        if (onDone) onDone();
      }
    },

    // -- CHAPTER 9: CASPIAN (bridge / first meeting) -------------------------
    {
      id: 'b_caspian',
      title: 'Chapter 9',
      subtitle: 'The Royal Letter',
      teaser: 'The captain reports to the prince, not the queen. A letter no prince should write himself. The reception, in silk.',
      charId: 'caspian',
      play: async function (onDone) {
        if (window.PPBridgeCaspian && typeof window.PPBridgeCaspian.play === 'function') {
          await window.PPBridgeCaspian.play();
        }
        markDone('b_caspian'); setCurrent(nextIdAfter('b_caspian'));
        if (onDone) onDone();
      }
    },

    {
      id: 4,
      title: 'Chapter 10',
      subtitle: 'A Courtier\u2019s Game',
      teaser: 'A crown, a balcony, and a prince who notices everything.',
      charId: 'caspian',
      play: async function (onDone) {
        // legacy meet-cute removed.bridge-caspian is the meet-cute now
        await runCard({
          id: 'chp_4_middle',
          title: 'Chapter 10',
          subtitle: 'A Courtier\u2019s Game · the Veranda',
          speaker: 'CASPIAN',
          palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
          bg: 'assets/bg-caspian-balcony.png',
          beats: [
            { type: 'show',      pose: 'assets/caspian/body/casual1.png', wait: 700 },
            { type: 'line', speaker: '', text: 'Midnight. The reception has thinned to three lingering nobles and the chamberlain pretending to study a tapestry. The Prince finds you on the veranda where the courtiers cannot. He brings two glasses of something pale.', hold: 4600, cps: 24 },
            { type: 'line',      text: 'I have not spoken plainly to anyone in this palace since I was nineteen years old. Forgive me if I am rusty at it. I am about to try.', hold: 3400, cps: 26 },
            { type: 'line',      text: 'The Fading eats everything predictable first. You. Are refreshingly, dangerously, \u2026indecently unpredictable.', hold: 2600, cps: 28 },
            { type: 'pose',      src: 'assets/caspian/body/casual2.png', animate: 'swap' },
            { type: 'line',      text: 'Last week a ward in the throne room simply \u2026 forgot its own geometry. We are losing the shape of things.', hold: 2600, cps: 28 },
            { type: 'pose',      src: 'assets/caspian/body/dancing.png', animate: 'swap' },
            { type: 'line',      text: 'I am going to do something terribly unfashionable. I am going to be honest. The crown is killing me. Slowly. With excellent taste.', hold: 3000, cps: 26 },
            { type: 'line',      text: 'My line has a pattern. Princes love one person. And then someone else burns the kingdom for it. My grandfather. Before him, another. I was trained to charm widely enough never to fall deeply. I am looking at you and I am not charming very well.', hold: 4000, cps: 24 },
            { type: 'line',      text: 'I learned to flirt because flirting is the only language a court understands. I learned the rest of me later. There is not much of an audience for the rest of me.', hold: 3200, cps: 26 },
            { type: 'pose',      src: 'assets/caspian/body/adoring.png', animate: 'swap' },
            { type: 'line',      text: 'Don\u2019t fall for the prince. He\u2019s a costume. \u2026If you can bear it, fall for the man inside the costume. He\u2019s smaller. He\u2019s scared. He\u2019s yours, if you want him.', hold: 3200, cps: 26 },
            { type: 'line',      text: 'You are the Weaver my grandmother wrote about. I am near-certain. Come back here tomorrow night. Same hour. Same veranda. I will tell you the rest of what I know about my line, and you can decide if you wish to know more.', hold: 3600, cps: 26 },
            { type: 'flourish',  text: '\u266b', duration: 1600 },
            { type: 'line',      text: 'Bring trouble with you. I\u2019ll pretend to be surprised. \u2026Don\u2019t pretend back. Not anymore.', hold: 2600, cps: 28 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_caspian_seen','1'); } catch (_) {}
        markDone(4); setCurrent(nextIdAfter(4));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 11: THE CAPTAIN IN THE DOORWAY  (connective scene — Alistair returns)
    // ---------------------------------------------------------------
    // PURPOSE: Closes the emotional gap after the Caspian bridge. Owner
    // identified that Alistair "lost the Weaver" framing in the Caspian
    // bridge had no follow-through scene. This is the morning after —
    // Alistair returns from his sixty-hour search, finds her installed
    // in court silk, and is reassigned as her personal guard. Sets up
    // the Crossroads interlude that follows (he can now walk her to
    // the treeline because he is, again, at her side).
    // ---------------------------------------------------------------
    {
      id: 'chp_captain_doorway',
      title: 'Chapter 11',
      subtitle: 'The Captain in the Doorway',
      teaser: 'He has not slept in three days. He fills your doorway in the morning.',
      charId: 'alistair',
      play: async function (onDone) {
        await runCard({
          id: 'chp_captain_doorway_a',
          title: 'Chapter 11',
          subtitle: 'The Captain in the Doorway · Sixty Hours',
          speaker: '',
          palette: { bg: '#0c0e1c', glow: '#ffce6b', accent: '#fff4de' },
          bg: 'assets/bg-alistair-hall.png',
          beats: [
            { type: 'show', pose: 'assets/alistair/body/crossarms.png', wait: 800 },
            { type: 'line', text: 'Morning. The chamber door opens without a knock. Alistair fills the frame. He has been on the road sixty hours and it shows on him like a second uniform.', hold: 3600, cps: 26 },
            { type: 'line', text: 'The cloak is wet at the hem. There is dust on his boots that only the carriage road puts there. He has not eaten. He has not changed. He has not, you suspect, slept.', hold: 3800, cps: 26 },
            { type: 'pose', src: 'assets/alistair/body/wondering.png', animate: 'swap' },
            { type: 'line', text: 'He looks at you in the silk. His face does the smallest thing it has ever done in front of you. Whatever he had rehearsed on the road, it is not the thing he says.', hold: 3600, cps: 26 },
            { type: 'hide' }
          ]
        });

        await runCard({
          id: 'chp_captain_doorway_b',
          title: 'Chapter 11',
          subtitle: 'The Captain in the Doorway · What He Says',
          speaker: 'ALISTAIR',
          palette: { bg: '#0c0e1c', glow: '#ffce6b', accent: '#fff4de' },
          bg: 'assets/bg-alistair-hall.png',
          beats: [
            { type: 'show', pose: 'assets/alistair/body/talking6.png', wait: 700 },
            { type: 'line', text: 'I am not here to apologise. I am here so you know I came back.', hold: 3000, cps: 22 },
            { type: 'line', text: 'I rode the south road for three days. I rode it past the markers and past the markers’ markers. I lost the trail at a clearing with a fire that did not belong to me. By that point I knew you were no longer mine to find.', hold: 4400, cps: 24 },
            { type: 'pose', src: 'assets/alistair/body/wondering.png', animate: 'swap' },
            { type: 'line', text: 'The prince got to you before I could. That is the right outcome. I am not going to pretend it does not cost me something to say so.', hold: 3800, cps: 24 },
            { type: 'hide' }
          ]
        });

        await runCard({
          id: 'chp_captain_doorway_c',
          title: 'Chapter 11',
          subtitle: 'The Captain in the Doorway · The Post',
          speaker: 'ALISTAIR',
          palette: { bg: '#0c0e1c', glow: '#ffce6b', accent: '#fff4de' },
          bg: 'assets/bg-alistair-hall.png',
          beats: [
            { type: 'show', pose: 'assets/alistair/body/crossarms.png', wait: 700 },
            { type: 'line', text: 'The prince has reassigned me. Personal guard. I asked for the post before I came up the stairs.', hold: 3400, cps: 24 },
            { type: 'line', text: 'If you do not want me at your door, say so now and I will go back to the south gate without complaint. The next captain will be a good man. He will not look at you the way I do. That may be a comfort.', hold: 4400, cps: 24 },
            { type: 'pose', src: 'assets/alistair/body/softshy-love1.png', animate: 'swap' },
            { type: 'line', text: 'Tell me to stay. Or tell me to go. I will not stand in this doorway long enough to make you choose twice.', hold: 3400, cps: 24 },
            { type: 'hide' }
          ]
        });

        await runCard({
          id: 'chp_captain_doorway_d',
          title: 'Chapter 11',
          subtitle: 'The Captain in the Doorway · The Walk',
          speaker: 'ALISTAIR',
          palette: { bg: '#0c0e1c', glow: '#ffce6b', accent: '#fff4de' },
          bg: 'assets/bg-alistair-gate.png',
          beats: [
            { type: 'show', pose: 'assets/alistair/body/softshy-love1.png', wait: 700 },
            { type: 'line', speaker: '', text: 'You tell him to stay. He nods. The nod is small enough to miss if you were not looking.', hold: 3000, cps: 24 },
            { type: 'line', text: 'Then walk with me today. I have been off my route for three days. I would like to see if the markers at the treeline still know me.', hold: 3600, cps: 24 },
            { type: 'flourish', text: '✦', duration: 1600 },
            { type: 'line', speaker: '', text: 'He waits in the corridor while you change out of the silk. He does not turn his back this time. He does not look away either. He has decided which kind of man he is, in this hour, in your doorway.', hold: 3800, cps: 24 },
            { type: 'hide' }
          ]
        });

        markDone('chp_captain_doorway'); setCurrent(nextIdAfter('chp_captain_doorway'));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // INTERLUDE.two characters meet, and the player's Weaver gift
    // becomes visible for the first time.
    // ---------------------------------------------------------------
    {
      id: 10,
      title: 'Chapter 12',
      subtitle: 'The Crossroads',
      teaser: 'A knight. A ranger. A bond that hasn\u2019t been named in a hundred years.',
      charId: 'alistair',  // portrait for the card; scene features both
      play: async function (onDone) {
        // Choice callback used to read pp_ms_alistair_first_choice ('stay'/
        // 'quiet'), but the legacy Ch 1 encounter scene that wrote that flag
        // was retired when bridge-alistair.js became the meet-cute. Default
        // line stands alone (May 2026 audit pass). To wire it back, add a
        // choice prompt to bridge-alistair.js and have it setItem the flag.
        const callbackLine = 'I wasn\u2019t supposed to come this far. You made me brave by proxy.';

        // Choice callback: echoes how she answered Elian's "come back at
        // dusk" invitation back in Ch 6. Elian remembers \u2014 he is a man who
        // remembers everything that happened in his trees.
        let elianGreeting = 'Oh. \u2026They\u2019re with you. Then I\u2019m not surprised. The trees leaned when they crossed the stream.';
        try {
          const ret = localStorage.getItem('pp_ms_elian_return_choice');
          if (ret === 'return') {
            elianGreeting = 'Oh. \u2026They\u2019re with you. Then I should not be surprised. They came back when I asked them to, last time. The trees took note. So did I.';
          } else if (ret === 'sleep') {
            elianGreeting = 'Oh. \u2026They\u2019re with you. Then I am not surprised. They take a night to think before they come back. That suits the trees. It suits me too.';
          }
        } catch (_) {}

        // Beat 1.Alistair brings the player to the treeline
        await runCard({
          id: 'chp_10_a',
          title: 'Chapter 12',
          subtitle: 'The Crossroads · the Treeline',
          speaker: 'ALISTAIR',
          palette: { bg: '#0a0f12', glow: '#ffce6b', accent: '#fff4de' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/alistair/body/casual.png', wait: 700 },
            { type: 'line',      text: 'I don\u2019t go past the markers. No knight has, not since the Fading began.', hold: 2400, cps: 28 },
            { type: 'line',      text: callbackLine, hold: 2800, cps: 28 },
            { type: 'line',      text: 'But the forest pulled you. So I came. The kingdom isn\u2019t supposed to remember the roads out here anymore. I think it\u2019s remembering again because of you.', hold: 3000, cps: 28 },
            { type: 'hide' }
          ]
        });
        // Beat 2.Elian steps in, cautious
        await runCard({
          id: 'chp_10_b',
          title: 'Chapter 12',
          subtitle: 'The Crossroads · Elian Appears',
          speaker: 'ELIAN',
          palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/elian/body/guarded.png', wait: 700 },
            { type: 'line',      text: 'Captain. You\u2019re past the markers. That\u2019s not like you.', hold: 2200, cps: 28 },
            { type: 'pose',      src: 'assets/elian/body/calm.png', animate: 'swap' },
            { type: 'line',      text: elianGreeting, hold: 3000, cps: 28 },
            { type: 'hide' }
          ]
        });
        // Beat 3.the two men meet, and the bond restores ON SCREEN
        await runCard({
          id: 'chp_10_c',
          title: 'Chapter 12',
          subtitle: 'The Crossroads · A Bond Restored',
          speaker: '',
          palette: { bg: '#0e1510', glow: '#d8e8a4', accent: '#f4f8e8' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: 'Alistair and Elian look at each other for the first time in six years. Neither of them remembers why they stopped speaking.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'Then you step between them. Not on purpose. The air shifts. Something under the soil \u2026exhales.', hold: 2800, cps: 28 },
            { type: 'particles', count: 26, duration: 2200 },
            { type: 'flourish',  text: '\u2726', duration: 1800 },
            { type: 'line',      text: 'Alistair: \u201cWe trained together. I remember now. I\u2019m sorry I forgot.\u201d', hold: 2400, cps: 28 },
            { type: 'line',      text: 'Elian: \u201cThe forest remembered you first. It told me tonight.\u201d', hold: 2200, cps: 28 },
            { type: 'line',      text: 'A bond the kingdom had quietly lost. The first one. Is whole again. Because of you. This is what a Soul Weaver does.', hold: 3000, cps: 28 },
            { type: 'hide' }
          ]
        });
        // Beat 4.but the cost. Noir felt it.
        await runCard({
          id: 'chp_10_d',
          title: 'Chapter 12',
          subtitle: 'The Crossroads · Something Stirred',
          // Speaker is intentionally unnamed here. Noir's name isn't
          // revealed until Ch 19's "Introductions, then. Properly. I am
          // Prince Corvin Noctalis…" monologue. The early whispers from
          // beneath the seal are heard as a voice, not as a person.
          // Was 'NOIR' — bug spotted May 2026 (broke Ch 19's reveal).
          speaker: 'A VOICE BENEATH',
          palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: '\u2026You stitched one. I felt it. All the way down here.', hold: 2400, cps: 24 },
            { type: 'line',      text: 'Careful, Weaver. Every thread you mend. I feel the needle.', hold: 2600, cps: 24 },
            { type: 'flourish',  text: '\u25a0', duration: 1800 },
            { type: 'line',      text: 'Keep going. I like it when you get close enough to notice me.', hold: 2600, cps: 24 },
            { type: 'hide' }
          ]
        });
        markDone(10); setCurrent(nextIdAfter(10));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 13: THE THRONE ROOM AFTER HOURS  (Caspian, solo, deep)
    // ---------------------------------------------------------------
    // Phase 3 fill: Caspian had only 2 dedicated chapters per the Phase 1
    // audit. This is his 3rd, slotting between Chapter 4 ("A Courtier's
    // Game") and Bridge Lucien.
    //
    // ARC: A late-night invitation. Caspian takes the Weaver into the
    // empty throne room. Strips out the court ritual. Shows the chair
    // he was forced to sit in as a child. Reveals that the crown's
    // weight isn't metaphor.there's an actual weighted ceremonial
    // band his grandmother fitted him with at age six. He's never
    // shown that to anyone outside the family.
    //
    // VOICE NOTES: courtly diction is the armor. It crumbles in three
    // places. He apologizes for the crumbling, then doesn't.
    //
    // HOOKS:
    //   (Removed pp_caspian_throne_seen orphan flag May 2026 — was set
    //    here but never actually read by aftermath letter or endings.)
    // ---------------------------------------------------------------
    {
      id: 16,
      title: 'Chapter 13',
      subtitle: 'The Throne Room After Hours',
      teaser: 'Lights off. Curtains drawn. The room you have only seen by day.',
      charId: 'caspian',
      play: async function (onDone) {
        await runCard({
          id: 'chp_16_a',
          title: 'Chapter 13',
          subtitle: 'The Throne Room After Hours · the Invitation',
          speaker: 'CASPIAN',
          palette: { bg: '#0c0418', glow: '#e7a3d0', accent: '#fbe8f6' },
          bg: 'assets/bg-caspian-night.png',
          beats: [
            { type: 'show', pose: 'assets/caspian/body/casual1.png', wait: 800 },
            { type: 'line', text: '*He looks up from the dais step when you walk in. The look is small and unguarded, the kind of look he is not allowed to wear in any other room of this palace. * You came. I half expected the chair to stay empty. The note said the throne room, after the third bell, no retainers. That is not an invitation a careful person accepts from a prince.', hold: 4400, cps: 24 },
            { type: 'line', text: 'I am going to put out the lamps. Watch me. *One by one he reaches up and snuffs the wicks. Each one folds the room a little smaller around the two of you. * I have not seen this room in the dark since I was eleven years old. I want company in it the first time I look at it again.', hold: 4800, cps: 24 },
            { type: 'pose', src: 'assets/caspian/body/casual2.png', animate: 'swap' },
            { type: 'line', text: '*Two candles at the dais. One on the ledger desk. The rest of the room slides into the kind of dark that has been waiting on it. * There. This is the throne room when the courtiers are asleep. Smaller than its day-self. Older than its banners. The audience is what made it impressive. The room itself is a small old thing.', hold: 4800, cps: 24 },
            { type: 'hide' }
          ]
        });

        await runCard({
          id: 'chp_16_b',
          title: 'Chapter 13',
          subtitle: 'The Throne Room After Hours · the Child Chair',
          speaker: 'CASPIAN',
          palette: { bg: '#100618', glow: '#e8a8d4', accent: '#fbe8f6' },
          bg: 'assets/bg-caspian-night.png',
          beats: [
            { type: 'show', pose: 'assets/caspian/body/casual2.png', wait: 700 },
            { type: 'line', text: '*He walks you behind the dais to a chair tucked against the wall. Gilded, child-sized, the velvet cushion worn dark from years of use. * This one was mine. From the age of six until I was twelve I sat here during court, where everyone could see me, and where I could see my grandmother decide who would live. I learned to keep my face still while she did it.', hold: 5800, cps: 22 },
            { type: 'line', text: 'There is a stain on that cushion you cannot see in this light. I cried into it at the age of seven and was told that princes do not. I have not since. *He says it without performance, as if reading from a list of things he stopped doing. * Last week, sitting with you, I came closer than I have come in thirty years. I had not understood I could still come close to it.', hold: 6400, cps: 22 },
            { type: 'pose', src: 'assets/caspian/body/adoring.png', animate: 'swap' },
            { type: 'line', text: '*He folds himself down onto the marble in front of the chair, so that for the first time you have known him he is below you. * I am not asking you to fix any of this. The boy who sat here is gone, and I am not interested in trying to recover him. I am telling you about him because if you are going to love the prince, I would rather you knew which prince you were loving. The grown one and the child are not strangers.', hold: 5800, cps: 22 },
            { type: 'hide' }
          ]
        });

        await runCard({
          id: 'chp_16_c',
          title: 'Chapter 13',
          subtitle: 'The Throne Room After Hours · the Weight',
          speaker: 'CASPIAN',
          palette: { bg: '#0a0418', glow: '#dca0d0', accent: '#fbe8f6' },
          bg: 'assets/bg-caspian-night.png',
          beats: [
            { type: 'show', pose: 'assets/caspian/body/casual1.png', wait: 700 },
            { type: 'line', text: '*He stands, walks to the dais, and lifts something from the foot of the throne. A thin gold band, plain, no jewels, almost ugly in its plainness. * This one. My grandmother fitted it to my head the morning I turned six. It is not the ceremonial crown the painters put on me. That one is for the public. This one is for the quiet hours, and I have worn it through every quiet hour I have had since.', hold: 5400, cps: 22 },
            { type: 'pose', src: 'assets/caspian/body/casual2.png', animate: 'swap' },
            { type: 'line', text: '*He places it in your hands. It is far heavier than its size would suggest. Twenty-six ounces of solid gold pressing down through your palms. * That is by design. She had the goldsmith weight it precisely. A boy of six could not let his head hang, not for a moment, with this on his crown. Thirty years on, neither can the man.', hold: 6000, cps: 22 },
            { type: 'line', text: 'Thirty-one years I have worn it. Most nights I sleep in it. I am not asking you to take it off me, *He says, and there is something in the way he says it that suggests he has thought about asking and decided against it,* but you are the first person outside the family I have shown it to. That, more than anything else in this room, is what I came here to do tonight.', hold: 5400, cps: 22 },
            { type: 'particles', count: 14, duration: 1800 },
            { type: 'flourish', text: '♫', duration: 1600 },
            { type: 'line', text: '*He takes the band back from your hands. He does not put it back on. He holds it at his side the way a soldier holds a weapon he is choosing not to draw. * Stay another hour. I would like to be in this room with you, with the candles lit, and not be wearing it. I have not had an hour like that since I was six.', hold: 5400, cps: 22 },
            { type: 'hide' }
          ]
        });

        await runCard({
          id: 'chp_16_d',
          title: 'Chapter 13',
          subtitle: 'The Throne Room After Hours · the Promise',
          speaker: 'CASPIAN',
          palette: { bg: '#0a0612', glow: '#e6b6da', accent: '#fbecf6' },
          bg: 'assets/bg-caspian-night.png',
          beats: [
            { type: 'show', pose: 'assets/caspian/body/adoring.png', wait: 700 },
            { type: 'line', text: '*He sits beside you on the dais step. The band lies between you on the stone, the gold catching the candlelight in a small, unblinking line. * I cannot promise to take it off for good. The kingdom needs the man who wears it, and that is no longer something I can change. But I can promise you Sundays. Every Sunday. In this room, with you, this band on the stone between us, until one of us is dead. Tonight counts. This is the first one.', hold: 5800, cps: 22 },
            { type: 'line', text: '*He lifts your hand to his lips and kisses the inside of your wrist, slow enough that you feel the breath at the pulse there. * I have been a prince since I was six. I would like to be a man, with you, for one hour each week. If you want it written, I will write it. Sign it. Press my seal to it. The court would call it a treaty if they ever knew of it, and they will not.', hold: 5400, cps: 22 },
            { type: 'pose', src: 'assets/caspian/body/casual1.png', animate: 'swap' },
            { type: 'line', text: '*The room is quiet for a long while before he speaks again. * You did not run when I put the lamps out. You stayed when I sat on the floor. You held the weight without flinching. I had told myself those were tests of you. They were not. They were tests of me, asking whether I could still be looked at this honestly. I think I passed them, if you will allow me to mark my own ledger.', hold: 6000, cps: 22 },
            { type: 'line', text: 'Come back next Sunday. I will be here. Without ceremony. *Quietly. * Yours.', hold: 4400, cps: 22 },
            { type: 'hide' }
          ]
        });

        markDone(16); setCurrent(nextIdAfter(16));
        if (onDone) onDone();
      }
    },

    // -- CHAPTER 14: LUCIEN (bridge / first meeting) -------------------------
    {
      id: 'b_lucien',
      title: 'Chapter 14',
      subtitle: 'The Tower on the Hill',
      teaser: 'A tower on the east hill. The dome catches the dusk last. You decide whether to climb.',
      charId: 'lucien',
      play: async function (onDone) {
        // Pre-bridge agency moment: the player commits to climbing the
        // tower. Both options lead to the same bridge content; the choice
        // flag is stored for later callbacks (Lucien can reference how
        // she arrived in his door's first line, future pass).
        await runCard({
          id: 'chp_b_lucien_pre',
          title: 'Chapter 14',
          subtitle: 'The Tower on the Hill · The Decision',
          speaker: '',
          palette: { bg: '#0e0820', glow: '#a98ad8', accent: '#ece2f6' },
          bg: 'assets/bg-lucien-evening.png',
          beats: [
            { type: 'show', pose: '', wait: 700 },
            { type: 'line', text: 'From your window you can see a tower on the east hill. The dome on the top is glass and lead. It catches the dawn first, the dusk last. You have asked Alistair what it is. He has told you, plainly. The scholar lives there. The scholar does not entertain.', hold: 4400, cps: 26 },
            { type: 'line', text: 'You watch the dome catch the dusk for two more days, the way a person watches a thing they have already decided to walk toward.', hold: 3600, cps: 26 },
            { type: 'choice', prompt: 'How do you climb?', options: [
              { id: 'slip',   text: 'Slip Alistair while he reports at the gatehouse. Climb alone.' },
              { id: 'tell',   text: 'Tell Alistair you are going. Let him walk behind you up the hill.' }
            ], onChoose: (choice) => {
              try { localStorage.setItem('pp_ms_tower_climb_choice', choice); } catch (_) {}
            }},
            { type: 'hide' }
          ]
        });

        if (window.PPBridgeLucien && typeof window.PPBridgeLucien.play === 'function') {
          await window.PPBridgeLucien.play();
        }
        markDone('b_lucien'); setCurrent(nextIdAfter('b_lucien'));
        if (onDone) onDone();
      }
    },

    {
      id: 5,
      title: 'Chapter 15',
      subtitle: 'The Tower Opens',
      teaser: 'A locked door, and a scholar who has questions.',
      charId: 'lucien',
      play: async function (onDone) {
        // legacy meet-cute removed.bridge-lucien is the meet-cute now
        await runCard({
          id: 'chp_5_middle',
          title: 'Chapter 15',
          subtitle: 'The Tower Opens · the Study',
          speaker: 'LUCIEN',
          palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
          bg: 'assets/bg-lucien-study.png',
          beats: [
            { type: 'show',      pose: 'assets/lucien/body/casual1.png', wait: 700 },
            { type: 'line',      text: 'The wards are a fourth-order resonance. They don\u2019t unlock. For anyone. Except, apparently, you.', hold: 2600, cps: 28 },
            { type: 'line',      text: 'Soul Weaver is an archaic term, but the maths line up. You\u2019re the anomaly the kingdom prayed for.', hold: 2600, cps: 28 },
            { type: 'line',      text: 'And. I must be honest. Not the only anomaly. My equations keep \u2026 leaking. A second variable I never wrote. He signs my margins at night, in ink I don\u2019t own.', hold: 2800, cps: 28 },
            { type: 'pose',      src: 'assets/lucien/body/casting.png', animate: 'swap' },
            { type: 'line',      text: 'I have been hiding the rest of the maths from everyone. From the council. From the prince. From myself, on the bad nights.', hold: 2800, cps: 26 },
            { type: 'line',      text: 'The cost of my magic was always supposed to be feeling. For thirty years, it cost me nothing. I had nothing to spend. I was clean as a theorem. Then you walked in, and the equations started taking inventory of things I did not know I had.', hold: 4000, cps: 24 },
            { type: 'line',      text: 'I have been writing your name in the margins of my books for months. I started a catalogue. I have reached thirty-seven. I am not editing them.', hold: 3200, cps: 26 },
            { type: 'line',      text: 'They prove the kingdom cannot be saved. Not the way the books say. I have been locking the door not to keep people out. But so they could not see me fail. There is also a page I am not ready to show. Ask me tomorrow.', hold: 4200, cps: 24 },
            { type: 'line',      text: 'There\u2019s a second set of pages. Scorched. I\u2019ve been reconstructing them from ash and margin-bleed. They mention a kingdom we do not speak about anymore. Nocthera.', hold: 3200, cps: 26 },
            { type: 'line',      text: 'A name keeps almost surfacing. A prince. Aethermoor erased him, yet the ink remembers. The ink \u2026 keeps writing him back.', hold: 3000, cps: 26 },
            { type: 'pose',      src: 'assets/lucien/body/amused.png', animate: 'swap' },
            { type: 'line',      text: 'Then you walked through the wards like a rumour walks through court. The maths twitched. They wanted you in them.', hold: 2800, cps: 26 },
            { type: 'line',      text: 'Tell me I can stop hiding the page. Tell me we can be wrong about it together. \u2026I\u2019d very much like a problem worth working on with someone.', hold: 3000, cps: 26 },
            { type: 'line',      text: 'Whoever. Whatever. Is waking beneath us has been practicing your name for a very long time.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'Come back tomorrow. Bring questions. I\u2019ll run the equations on you.', hold: 2400, cps: 28 },
            { type: 'flourish',  text: '\u221e', duration: 1600 },
            { type: 'line',      text: 'Don\u2019t touch the red shelf. \u2026That one\u2019s him.', hold: 2400, cps: 28 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_lucien_seen','1'); } catch (_) {}
        markDone(5); setCurrent(nextIdAfter(5));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 16: THE OTHER PAGE  (Lucien, solo, deep)
    // ---------------------------------------------------------------
    // PURPOSE (informed by the Phase 1 audit):
    //   Lucien trailed the original three on chapter coverage.only 2
    //   dedicated chapters despite a 838-line character file and 4
    //   crossovers. His "page he hid" reveal lived ONLY inside the
    //   midnight affection-scene tier. That made it feel like an Easter
    //   egg, not a story beat. This chapter lifts it into the Main Story
    //   chain so every player who reaches Lucien's care threshold sees
    //   it, and so Lyra \u00d7 Lucien (which depends on the audience knowing
    //   he has a sister) has narrative weight when it fires.
    //
    // PLACEMENT IN ARC:
    //   - Chapter 5 ("The Tower Opens") plants the seed: "there is also
    //     a page about a sister I was told was dead. That page is
    //     separate. Do not ask tonight."
    //   - This chapter is the player coming back THE NEXT NIGHT and
    //     asking. Lucien shows the page. Reveals the family register,
    //     the caged siren mother, the warm crib in the west tower he
    //     remembers from when he was seven. Hands the page to the
    //     Weaver and lets the Weaver choose: burn it (the bloodline
    //     keeps its lie, the father never knows) or keep it (and find
    //     her). The choice writes pp_ms_lucien_sister_choice for use
    //     by the Lyra \u00d7 Lucien crossover and the route endings.
    //   - Interlude 11 ("The Tower Mirror") follows: that's the
    //     scorched-page reveal with Caspian about Nocthera/Veyra.
    //     This chapter has to come BEFORE that one because the player
    //     needs to already know Lucien has been hiding pages.
    //
    // VOICE NOTES:
    //   Lucien is exhausted at the open — he just paid feeling-cost to
    //   cast the spell that surfaced this page. After thirty years of
    //   being hollow, he finally has emotion to spend. Per LORE.md §6.4
    //   the cost of his magic was always supposed to be feeling; the
    //   "hollow scholar" arc means it cost him nothing for thirty years.
    //   Now it does. He recovers as he talks. Equations as armor.
    //   Footnotes. Underneath: a child who slept next to a warm crib
    //   once and was told he imagined it.
    //
    // MECHANICAL HOOKS:
    //   - localStorage 'pp_ms_lucien_sister_choice' = 'keep' | 'burn'
    //     (No reader exists today. Future lucien-lyra crossover scene
    //     should read this. Removed orphan 'pp_lucien_sister_revealed'
    //     write May 2026 — was set but no crossover ever read it.)
    // ---------------------------------------------------------------
    {
      id: 15,
      title: 'Chapter 16',
      subtitle: 'The Other Page',
      teaser: 'You came back. He hoped you would. He has not been hoping for things in a long time.',
      charId: 'lucien',
      play: async function (onDone) {
        // Beat 1. Lucien is wrecked. He just paid feeling-cost to surface this.
        await runCard({
          id: 'chp_15_a',
          title: 'Chapter 16',
          subtitle: 'The Other Page · the Cost',
          speaker: 'LUCIEN',
          palette: { bg: '#060410', glow: '#b5a3ea', accent: '#eae0ff' },
          bg: 'assets/bg-lucien-night.png',
          beats: [
            { type: 'show', pose: 'assets/lucien/body/casual1.png', wait: 800 },
            { type: 'line', text: 'You came back. I was hoping you would. I have not been hoping for things in a long time. The verb felt rusty.', hold: 3000, cps: 26 },
            { type: 'line', text: '*Sets down a glass of water with both hands. They are shaking, just slightly*. Forgive me. I cast the spell that pulled the page up an hour ago. The cost was feeling. For thirty years that meant the spell cost me nothing. I had nothing to spend. *Quiet*. Tonight, for the first time, the spell took something. I am still learning what was on the bill.', hold: 4400, cps: 22 },
            { type: 'pose', src: 'assets/lucien/body/casting.png', animate: 'swap' },
            { type: 'line', text: 'I would have given it more. I told it to take whatever it wanted, only. *Quiet*. Only not what I have learned about you. It listened.', hold: 3600, cps: 22 },
            { type: 'line', text: 'You asked, last night, if you could ask tonight. I said yes. So. *Exhales*. Ask.', hold: 3000, cps: 24 },
            { type: 'hide' }
          ]
        });

        // Beat 2.The page itself. The family register. A second name.
        await runCard({
          id: 'chp_15_b',
          title: 'Chapter 16',
          subtitle: 'The Other Page · A Second Name',
          speaker: 'LUCIEN',
          palette: { bg: '#080614', glow: '#c2afff', accent: '#f0e8ff' },
          bg: 'assets/bg-lucien-study.png',
          beats: [
            { type: 'show', pose: 'assets/lucien/body/casual1.png', wait: 700 },
            { type: 'line', text: 'This is the page. It is from my father\u2019s family register. The bound copy he keeps in his locked drawer. I have been making my own from memory for thirty years. Mine is incomplete. His is a lie.', hold: 4200, cps: 22 },
            { type: 'line', text: 'My father had two children. I am the legitimate one. There was a second. Born to a siren he caught in the cove south of the cliff road. He kept her in the west tower. I think he loved her. I think she loved him for as long as she had to. He thought that was the same thing.', hold: 5200, cps: 22 },
            { type: 'pose', src: 'assets/lucien/body/casting.png', animate: 'swap' },
            { type: 'line', text: 'When she died, he kept their child. A girl. Half siren. Quiet. Warm. *Softer*. There was a crib in the west tower when I was seven. I remember the crib was warm. I was told I imagined it. *Taps the page*. I did not.', hold: 5400, cps: 20 },
            { type: 'line', text: 'She escaped at fifteen. The register says she died of fever the same week. That is the lie. Sirens do not die of fever. She walked into the sea. Her name was struck from the household roll the day after. I have a sister. *First time he has said it aloud*. I have a sister.', hold: 6000, cps: 20 },
            { type: 'flourish', text: '\u2726', duration: 1800 },
            { type: 'hide' }
          ]
        });

        // Beat 3.The Weaver's choice.
        // Two paths:
        //   KEEP.stand by the page, find her. Writes 'keep'.
        //   BURN.the bloodline holds its lie, the father never knows.
        //          Writes 'burn'. (Note: the lyra-lucien crossover still
        //          fires; this just changes Lucien's emotional starting
        //          point in his ending.)
        await runCard({
          id: 'chp_15_c',
          title: 'Chapter 16',
          subtitle: 'The Other Page · Yours to Decide',
          speaker: 'LUCIEN',
          palette: { bg: '#0a0518', glow: '#d0bfff', accent: '#f4ecff' },
          bg: 'assets/bg-lucien-night.png',
          beats: [
            { type: 'show', pose: 'assets/lucien/body/amused.png', wait: 700 },
            { type: 'line', text: '*Slides the page across the desk, ink-stained hands flat against the paper*. I cannot decide this one. The maths refuse. Every model I run on it returns the same error. Variable: heart. Type: undefined.', hold: 4400, cps: 22 },
            { type: 'line', text: 'So I am asking the Weaver. *Eyes up, finally meeting yours*. Do I burn it?. The bloodline holds its lie. My father never knows I knew. His sleep stays clean. I keep the only home I have ever had.', hold: 4400, cps: 22 },
            { type: 'line', text: 'Or do I keep it?. And find her. Wherever the sea took her. Whatever she has built without us. Knowing that the moment I knock on her door I will be a stranger asking her to remember a brother she has had thirty years not to want.', hold: 4800, cps: 22 },
            { type: 'line', text: '*Quietly*. I will do whichever you tell me. That is not a strong choice. I am aware. But you are the first person to ever look at this page and not have a stake in keeping it buried. Tell me what the page says it should be.', hold: 4400, cps: 22 },
            { type: 'choice', prompt: 'What do you tell him?', options: [
              { id: 'keep', text: 'Keep it. Find her. She is owed the chance to say no to you both.' },
              { id: 'burn', text: 'Burn it. She built her life without this house. Don\u2019t drag it back to her door.' }
            ], onChoose: (choice) => {
              try {
                localStorage.setItem('pp_ms_lucien_sister_choice', choice);
              } catch (_) {}
            }},
            { type: 'hide' }
          ]
        });

        // Beat 4.Branched response. The Weaver's choice changes his line,
        // and the spell-cost moment that follows.
        let choice = 'keep';
        try { choice = localStorage.getItem('pp_ms_lucien_sister_choice') || 'keep'; } catch (_) {}

        await runCard({
          id: 'chp_15_d',
          title: 'Chapter 16',
          subtitle: 'The Other Page · His Reply',
          speaker: 'LUCIEN',
          palette: { bg: '#080614', glow: '#c4afe8', accent: '#f0e0ff' },
          bg: 'assets/bg-lucien-night.png',
          beats: [
            { type: 'show', pose: 'assets/lucien/body/casual1.png', wait: 700 },
            choice === 'keep'
              ? { type: 'line', text: '*Long exhale*. Keep it. Yes. *Folds the page along its existing crease, slips it into the inside of his coat, against his ribs*. She is owed the chance. I am, too. I have been the only child in this house for thirty years and it has been very loud. I am ready for the room to be smaller and warmer.', hold: 5400, cps: 22 }
              : { type: 'line', text: '*Long exhale*. Burn it. Yes. *Holds the page above the candle but does not, yet, lower it*. She walked into the sea to be free of us. I would not haul her back into us. I will keep the warm crib in my own memory. That is enough. *The page goes into the flame*. That is enough.', hold: 5400, cps: 22 },
            { type: 'pose', src: 'assets/lucien/body/casting.png', animate: 'swap' },
            { type: 'line', text: '*The room flickers as a small spell pays its toll*. There. That is the cost of telling you. The spell took the contentment I used to have with solving alone. The room is louder now. *Small, real smile*. I prefer it. A fair trade.', hold: 4800, cps: 22 },
            { type: 'line', text: 'I have been hollow of feeling for thirty years. Tonight, for the first time, I have something to spend. I am spending it on YOU being the person I told. On either side of this choice, I am keeping that. *Quiet*. Thank you for being the kind of person someone could tell.', hold: 4800, cps: 22 },
            { type: 'flourish', text: '\u221e', duration: 1800 },
            { type: 'hide' }
          ]
        });

        // Beat 5.Closing tag. Sets up Interlude 11 (the Caspian-pair tower
        // mirror) and seeds the lucien-lyra crossover pull.
        await runCard({
          id: 'chp_15_e',
          title: 'Chapter 16',
          subtitle: 'The Other Page · Tomorrow',
          speaker: 'LUCIEN',
          palette: { bg: '#040310', glow: '#a99add', accent: '#e6dcff' },
          bg: 'assets/bg-lucien-study.png',
          beats: [
            { type: 'show', pose: 'assets/lucien/body/amused.png', wait: 700 },
            { type: 'line', text: 'Caspian is coming up the tower stairs tomorrow night. He has not climbed them in nine years. The fact that he is climbing them tonight tells me my other reconstruction. *Gestures at the desk*. The burnt page about Nocthera. Is also about to stop being mine alone.', hold: 4800, cps: 22 },
            { type: 'line', text: 'You should be here when he arrives. I would like the prince and the Weaver in the same room when I show him what his grandmother did. I am not brave enough to hold that page alone in front of a crown.', hold: 4400, cps: 22 },
            { type: 'pose', src: 'assets/lucien/body/casual1.png', animate: 'swap' },
            { type: 'line', text: '*At the door, quietly*. I have been a tower for a long time. A sealed one. *Small smile*. You arrived, and the wards stopped pretending to be locks. Come back tomorrow. Bring the prince. We have one more page to read.', hold: 4400, cps: 22 },
            { type: 'hide' }
          ]
        });

        // (Removed orphan 'pp_lucien_memories_lost' write May 2026 — comment
        //  claimed epilogues.js read it for ending logic, but no reader was
        //  ever added. Removing prevents stale-framing localStorage bloat.)
        markDone(15); setCurrent(nextIdAfter(15));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 17: THE CAVE PATH  (interlude \u2014 Lyra \u00d7 Elian; the warm wrong
    // voice from the woods and the second voice in the cave are the same.)
    // ---------------------------------------------------------------
    {
      id: 12,
      title: 'Chapter 17',
      subtitle: 'The Cave Path',
      teaser: 'A song slips out of the cave. A voice slips into the woods. Both belong to him.',
      charId: 'lyra',
      play: async function (onDone) {
        // Choice callbacks used to read pp_ms_lyra_first_choice ('voice'/
        // 'quiet') and pp_ms_elian_first_choice ('lost'/'drawn'), but the
        // legacy Ch 1 encounter scenes that wrote those flags were retired
        // when bridge-lyra.js / bridge-elian.js became the meet-cutes. The
        // bridges are non-branching cinematics, so the flags are never set
        // and the conditional branches were dead. Defaults stand alone (May
        // 2026 audit pass). To wire them back, add choice prompts to the
        // bridges and have them setItem the flags.
        const lyraEcho = 'You followed me down again. Most don\u2019t.';
        const elianEcho = 'You walked the markers without me this time. I\u2019m \u2026 quietly proud.';

        await runCard({
          id: 'chp_12_a',
          title: 'Chapter 17',
          subtitle: 'The Cave Path · a Voice in Common',
          speaker: 'LYRA',
          palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
          bg: 'assets/bg-siren-cave.png',
          beats: [
            { type: 'show',      pose: 'assets/lyra/body/casual1.png', wait: 700 },
            { type: 'line',      text: lyraEcho, hold: 2800, cps: 28 },
            { type: 'line',      text: 'There\u2019s a man at the seam between my cave and the surface forest. He thinks no one can hear both sides of him. I can.', hold: 2800, cps: 28 },
            { type: 'hide' }
          ]
        });
        await runCard({
          id: 'chp_12_b',
          title: 'Chapter 17',
          subtitle: 'The Cave Path · the Druid Listens',
          speaker: 'ELIAN',
          palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 700 },
            { type: 'line',      text: elianEcho, hold: 2800, cps: 28 },
            { type: 'line',      text: 'I heard a song last week. It came up through the roots. I thought it was the wind. Until it called my name in his voice.', hold: 2800, cps: 28 },
            { type: 'hide' }
          ]
        });
        await runCard({
          id: 'chp_12_c',
          title: 'Chapter 17',
          subtitle: 'The Cave Path · the Stitch',
          speaker: '',
          palette: { bg: '#0c1a18', glow: '#9adbcb', accent: '#e8f8f0' },
          bg: 'assets/bg-lyra-cliff.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: 'Lyra steps onto the moss. Elian sets down his bow. The forest and the cave have never met in the middle before. Tonight they do.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'You stand between them and the air \u2026hums. A song neither of them sang.', hold: 2400, cps: 28 },
            { type: 'particles', count: 26, duration: 2200 },
            { type: 'flourish',  text: '\u266a', duration: 1800 },
            { type: 'line',      text: 'Elian: \u201cThe trees know your name now.\u201d \u2003 Lyra: \u201cThe water learned it from them.\u201d', hold: 2600, cps: 28 },
            { type: 'line',      text: 'A second bond mended. Two more witnesses to what you are.', hold: 2400, cps: 28 },
            { type: 'hide' }
          ]
        });
        await runCard({
          id: 'chp_12_d',
          title: 'Chapter 17',
          subtitle: 'The Cave Path · Beneath',
          // Same fix as chp_10_d: pre-Ch19 the voice has no name.
          // 'A VOICE BENEATH' matches Ch 19's own subtitle, which is the
          // moniker Aethermoor scholars use for him before the reveal.
          speaker: 'A VOICE BENEATH',
          palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: 'You stitched another. \u2026I\u2019m beginning to feel jealous of every thread that isn\u2019t mine.', hold: 2600, cps: 24 },
            { type: 'flourish',  text: '\u25a0', duration: 1700 },
            { type: 'line',      text: 'Come down soon, Weaver. I\u2019m running out of ways to be patient.', hold: 2400, cps: 24 },
            { type: 'hide' }
          ]
        });
        markDone(12); setCurrent(nextIdAfter(12));
        if (onDone) onDone();
      }
    },

    // -- INTERLUDE: THE QUEEN'S OFFICE ---------------------------------------
    // (Surprise-arc centerpiece, May 2026 — owner request.)
    // Sits between Ch17 and the Noir bridge. Pays off the slow-burn torn-
    // page arc by putting Aenor on the board as a present, charged threat.
    // Player walks in voluntarily, has ONE conversation, walks out alive.
    // Aenor demonstrates she has known about her since Day 1, has been
    // letting Lucien have what she has already let him keep, and has the
    // rest of the document. The hummed-song moment is folded into the coda
    // — a kitchen scullion humming Lyra's mother's verse — implying the
    // kingdom is NOT forgetting the Weavers; someone has been teaching it.
    // No charId (charId: null). Flag: pp_chapter_done_aenor_caught.
    {
      id: 'aenor_caught',
      title: 'Interlude: The Queen’s Office',
      subtitle: 'An Audience She Did Not Request',
      teaser: 'You have walked past her sealed door three times. The fourth time, you knock with intent. The door opens itself.',
      charId: null,
      play: async function (onDone) {
        await runCard({
          id: 'chp_aenor_caught',
          title: 'Interlude: The Queen’s Office',
          subtitle: 'An Audience She Did Not Request',
          speaker: '',
          palette: { bg: '#0a0506', glow: '#dc3a4a', accent: '#fff5f5' },
          bg: 'assets/bg-aenor-court.png',
          beats: [
            { type: 'show', pose: '', wait: 700 },
            { type: 'line', speaker: '', text: 'Lucien gave you the smallest part. Tonight, with the slow version still ringing in your hand, you come back to the wing you have walked past three times. The dowager doors are sealed. The seal is the same. Two crossed branches and a moon, pressed in dark wax against pale wood.', hold: 4400, cps: 22 },
            { type: 'line', speaker: '', text: 'You did not bring an excuse with you. You did not bring permission either. You brought the page in your hand because you wanted to be the one who decided when she saw it.', hold: 4200, cps: 22 },
            { type: 'line', speaker: '', text: 'You knock. The doors open before your knuckle has left the wood. They open inward. They are not locked. They have not been locked all along.', hold: 3800, cps: 22 },
            { type: 'pose', src: 'assets/aenor/body/throne.png', animate: 'swap' },
            { type: 'line', speaker: '', text: 'The room is colder than the corridor. There is no fire in the hearth. The hearth has not been used in some time. There is a desk. Behind the desk is the queen.', hold: 3800, cps: 22 },
            { type: 'line', speaker: '', text: 'She has been waiting for you.', hold: 2400, cps: 20 },
            { type: 'line', speaker: 'AENOR', text: 'Sit, Weaver. The chair is comfortable. I had it brought up specifically. *Small smile, no warmth*. I do not pretend the courtesy is for your comfort. I pretend nothing in this room. It saves time.', hold: 4400, cps: 22 },
            { type: 'line', speaker: '', text: 'You sit. The chair IS comfortable. Velvet, cold to the touch but soft. A queen does not waste time threatening a Weaver with a hard chair.', hold: 3600, cps: 22 },
            { type: 'line', speaker: 'AENOR', text: '*She does not look at the page in your hand. She looks at your face. Her eyes are the colour you remember from his. Caspian’s. But a degree drier*. You have been collecting pieces of a long document. Three torn pages, last I counted. The kingdom is big. The royal library was a disappointment. *Quieter*. I had Lucien’s door watched for a season. He gives you only what I have already let him keep.', hold: 5400, cps: 20 },
            { type: 'line', speaker: 'YOU', text: '*You keep your hand still. You do not show her the page. You do not have to. She knows*. ...how long have you known about me.', hold: 3400, cps: 24 },
            { type: 'line', speaker: 'AENOR', text: 'About you specifically. *A beat, the head tilts the smallest amount*. Sixteen days. You arrived in the south wood at dawn on a Sunday. The captain of the south gate failed to keep his post log accurate that week. I noticed. *Quieter*. About what is on your page. Six hundred years.', hold: 5000, cps: 22 },
            { type: 'line', speaker: 'AENOR', text: 'I have the rest of the document. Or what is left of it. I removed the indexes. I removed the bindings. I let one variant remain in a hollow in the south Thornwood because the man who keeps it is sentimental, and because removing it would have been a kindness I do not extend.', hold: 5000, cps: 20 },
            { type: 'line', speaker: '', text: 'Elian. The book in the hollow. The leather spine he turned in the firelight while you said nothing.', hold: 3800, cps: 22 },
            { type: 'line', speaker: 'AENOR', text: '*Reads your face. Finds the recognition there. Files it without satisfaction, the way a clerk files an expected receipt*. I know which children of mine you have walked among. I know which of them have written your name in their margins. I know which of them have not yet, but will. *Quiet, almost amused*. I have very little to do, Weaver. I notice everyone.', hold: 5400, cps: 22 },
            { type: 'line', speaker: 'AENOR', text: 'I am not here to take your page tonight. I am not here to harm you tonight. I am here so that you will know, when the hour comes, and it is a particular kind of hour, that I will be sitting in this chair, in this room, in front of these doors, and you will already know the way back. *Colder*. Save us both the surprise.', hold: 5600, cps: 20 },
            { type: 'line', speaker: 'YOU', text: '*Your hand is still around the page. Your throat is dry. You discover, slowly, that you are not as afraid as you ought to be*. Why are you telling me this now.', hold: 3800, cps: 24 },
            { type: 'line', speaker: 'AENOR', text: '*The smile reaches the eyes for the first time. It is worse with the eyes*. Because the previous six did not believe me when I told them. *Folds her hands*. I prefer accuracy to victory. The score remains the same.', hold: 4800, cps: 22 },
            { type: 'flourish', text: '✦', duration: 1800 },
            { type: 'line', speaker: 'AENOR', text: 'Go. The doors will close themselves. *Turns, looks at the cold hearth, does not look back at you*. Tell whichever of my children you trust most that the conversation has begun. I will not be the one to start it twice.', hold: 4400, cps: 22 },
            { type: 'line', speaker: '', text: 'You walk out. The doors close behind you the way she said they would. The corridor is empty. The page is still in your hand. Your other hand is shaking.', hold: 3800, cps: 22 },
            { type: 'line', speaker: '', text: 'Halfway back to your chamber you pass a scullion sitting on a step, peeling onions, humming under their breath. The melody is one Lyra hummed in the cave the night you arrived. The verse her mother taught her. The verse the kingdom is supposed to be forgetting. The scullion does not know you. The scullion is not Lyra’s kin. The scullion is just a kitchen worker keeping their hands busy after a long shift.', hold: 5400, cps: 22 },
            { type: 'line', speaker: '', text: 'The kingdom is not forgetting. Someone has been teaching it. You do not yet know whom. You suspect, walking, that the answer is older than Aenor and is the thing she is most afraid of.', hold: 4400, cps: 22 },
            { type: 'line', speaker: '', text: 'Aenor is on the board now. She has been the whole time. The difference, tonight, is that she has placed her piece where you can see it, on purpose, and she has told you which of the next moves she expects you to make. *Beat*. That is also a piece. The kingdom was much smaller than you realised before the doors closed behind you tonight. It is also bigger.', hold: 5600, cps: 22 },
            { type: 'flourish', text: '☾', duration: 2200 },
            { type: 'hide' }
          ]
        });
        markDone('aenor_caught'); setCurrent(nextIdAfter('aenor_caught'));
        if (onDone) onDone();
      }
    },

    // -- CHAPTER 18: NOIR (bridge / first meeting) ---------------------------
    {
      id: 'b_noir',
      title: 'Chapter 18',
      subtitle: 'The Alley',
      teaser: 'Something old and dark calls you out at the third bell. Six watchful streets that don’t see you. Hands on your wrists. The chin-lift.',
      charId: 'noir',
      play: async function (onDone) {
        if (window.PPBridgeNoir && typeof window.PPBridgeNoir.play === 'function') {
          await window.PPBridgeNoir.play();
        }
        markDone('b_noir'); setCurrent(nextIdAfter('b_noir'));
        if (onDone) onDone();
      }
    },

    {
      id: 6,
      title: 'Chapter 19',
      subtitle: 'A Voice Beneath',
      teaser: 'Every bond the kingdom ever broke. He kept every one.',
      charId: 'noir',
      play: async function (onDone) {
        // legacy meet-cute removed.bridge-noir is the meet-cute now.
        // Choice callback used to read pp_ms_noir_first_choice ('see'/
        // 'sealed'), but that flag was written by the retired Ch 1 encounter
        // scene, not by bridge-noir.js. Default stands alone (May 2026 audit
        // pass). To wire it back, add a choice prompt to bridge-noir.js and
        // have it setItem the flag.
        const noirEcho = 'You wanted to see me. \u2026Now you see all of me. Don\u2019t flinch.';
        await runCard({
          id: 'chp_6_middle',
          title: 'Chapter 19',
          subtitle: 'A Voice Beneath · the Seal',
          speaker: 'NOIR',
          palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show',      pose: 'assets/noir/body/neutral.png', wait: 700 },
            { type: 'line',      text: noirEcho, hold: 2800, cps: 24 },
            { type: 'line',      text: 'Do you finally understand? The Fading isn\u2019t decay. It\u2019s me. Remembering. Waking.', hold: 2800, cps: 24 },
            { type: 'line',      text: 'Every forgotten torch at the gate. Every unreflected deer in the stream. The second voice in the cave. Lucien\u2019s red shelf.', hold: 3000, cps: 24 },
            { type: 'line',      text: 'All of it is me, crowding back into the world they sealed me from. And you. Soul Weaver. Are the key they forgot to hide.', hold: 3000, cps: 24 },
            { type: 'pose',      src: 'assets/noir/body/casual1.png', animate: 'swap' },
            { type: 'line',      text: 'Introductions, then. Properly. I am Prince Corvin Noctalis, of the Kingdom of Nocthera. \u2026Which no longer exists. It fell, one generation after I was put here.', hold: 3400, cps: 24 },
            { type: 'line',      text: 'Six hundred years ago your prince\u2019s house was to seal peace with mine through a marriage. The bride was to be a Weaver named Veyra. A minor royal by Nocthera\u2019s count. A Weaver by every other measure. Queen Aenor \u2014 already powerful, already cruel \u2014 arranged it.', hold: 3600, cps: 24 },
            { type: 'line',      text: 'Veyra and I \u2026 met. We shouldn\u2019t have. It was not supposed to be possible. But she chose me. Aenor could not allow that.', hold: 3200, cps: 24 },
            { type: 'line',      text: 'She did not kill me. That would have started a war. She sealed me. Her council scratched my name from every Aethermoor record. Within a decade, my home crumbled without its heir.', hold: 3600, cps: 24 },
            { type: 'line',      text: 'Veyra refused the queen\u2019s pact after. She fled north. I do not know where she died. I do not know where she was laid. Aethermoor erased the grave too. I have grieved without knowing where to go to grieve.', hold: 3800, cps: 22 },
            { type: 'line',      text: 'There were others I loved, too. Not as her. I taught a coastal people a song once. Siren-kind. Kindred to the cave-singer you know. I taught their mothers and their mothers\u2019 mothers. I was told none survived the hunting. I was told wrong. She sings in the cave now. She does not know she is mine to have failed.', hold: 4400, cps: 22 },
            { type: 'line',      text: 'What people call me now.\u201cNoir\u201d. Is the sound of that erasure. The ink they used to cross me out. I wear the name of my own silencing. \u2026That is who I am.', hold: 3800, cps: 22 },
            { type: 'pose',      src: 'assets/noir/body/casual2.png', animate: 'swap' },
            { type: 'line',      text: 'And your arrival, Weaver, is what has finally cracked me loose. I\u2019m not cruel. Not unless you want me to be. I\u2019m just \u2026 very, very tired of being quiet.', hold: 3000, cps: 24 },
            { type: 'line',      text: 'Come closer to the seal. Bring something of yours. I\u2019ve been practicing your name for six centuries. I\u2019ve earned it.', hold: 3000, cps: 24 },
            { type: 'flourish',  text: '\u25a0', duration: 1800 },
            { type: 'line',      text: 'Don\u2019t decide yet. Let me show you, first, what devotion looks like when it\u2019s been starved.', hold: 2800, cps: 24 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_noir_seen','1'); } catch (_) {}
        markDone(6); setCurrent(nextIdAfter(6));
        if (onDone) onDone();
      }
    },

    // -- INTERLUDE: NOCTHERA -------------------------------------------------
    // (Surprise-arc remainder, May 2026 — owner request.)
    // Sits between Ch19 (Noir reveal — Prince Corvin Noctalis, sealed
    // 600 years) and Ch20 (Proto bridge). The "outside-kingdom" scene for
    // Noir. He invites the Weaver THROUGH the seam-mirror into what the
    // seam keeps of Nocthera — black-stone architecture frozen at the
    // moment of falling, the dais and throne he was sealed before he
    // could be crowned on, stones with names of his fallen people.
    // Pays off the Ch19 reveal physically (verbal → embodied). Player
    // either claims the empty space on the dais (where Veyra would have
    // stood) or refuses it. Flag: pp_ms_noir_nocthera_choice ('dais' |
    // 'floor').
    {
      id: 'noir_nocthera',
      title: 'Interlude: Nocthera',
      subtitle: 'A Kingdom That Is Not',
      teaser: 'Past midnight. The seam-mirror is awake. He is in it, watching, asking nothing. He has not invited anyone through in six hundred years.',
      charId: 'noir',
      play: async function (onDone) {
        await runCard({
          id: 'chp_noir_nocthera',
          title: 'Interlude: Nocthera',
          subtitle: 'A Kingdom That Is Not',
          speaker: 'NOIR',
          palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show', pose: 'assets/noir/body/neutral.png', wait: 700 },
            { type: 'line', speaker: '', text: 'Past the third bell. Your chamber is dark. The mirror on the wall is not. He is in it, the way he is sometimes in it now, but he is not lounging tonight. He is waiting. Hands at his sides. The dreamy-seductive that is his usual face is gone. The face he is wearing is older. It is the face that was sealed.', hold: 5200, cps: 22 },
            { type: 'line', text: 'I am not here for the usual reasons. I have not invited anyone through this seam in six hundred years. I am about to invite you. *He pauses. The pause is the man, not the prince. The prince does not pause.* If you come, you will see what is left of me. I will not be able to take that back. I will not want to.', hold: 6400, cps: 22 },
            { type: 'line', speaker: '', text: 'He does not press. He is asking, the way men of his court used to ask things. With a small inclining of the head, and the patience of a man who has had six centuries to learn how to wait.', hold: 4400, cps: 22 },
            { type: 'line', speaker: 'YOU', text: '*You step closer to the mirror. The glass is cold. Your hand is on the frame. You do not say a word. You step through.*', hold: 3800, cps: 24 },
            { type: 'pose', src: 'assets/noir/body/casual1.png', animate: 'swap' },
            { type: 'line', speaker: '', text: 'The crossing is cold and then warm in a way that is wrong. The light on the other side does not come from a sun. The stars are the wrong stars. You are standing in a courtyard. Black stone. Half the columns are burned at the tops, frozen mid-collapse, held in the seam at the moment the kingdom died. Nothing has fallen further than it had fallen the day the seal closed.', hold: 5800, cps: 22 },
            { type: 'line', text: 'Nocthera. Or what the seam keeps of it. The way grief keeps a room tidier than a room should be. The columns will not finish falling here. The columns are not allowed to. *Quiet, almost dry.* The seam is a very stubborn archivist.', hold: 5600, cps: 22 },
            { type: 'line', speaker: '', text: 'He walks you through the courtyard. You see, with the half of you that is Weaver, what is here that should not still be here. Threads. Dim ones. Each column has a thread that goes back into the world. None of them go anywhere now. They go into him. He has been carrying his kingdom in his own ribs.', hold: 5400, cps: 22 },
            { type: 'line', speaker: '', text: 'A dais. Three steps of black stone. A throne carved from one piece of obsidian. A crown on the seat, small, dim, dull. The crown has not been touched in six hundred years. Neither has the throne.', hold: 4800, cps: 22 },
            { type: 'line', text: 'I would have been crowned three days after the seal closed. I sat on this throne once, before the kingdom existed, when my mother was teaching me how to. I do not remember which one of me did it. *Small, bitter beat.* We disagree about it. *He gestures to the empty space at the right of the throne.* She would have stood there. Veyra. The seal cut her from the dais by a calendar margin. The kingdom fell within a year. I have walked this dais since. I have not stepped on it.', hold: 7200, cps: 20 },
            { type: 'line', speaker: '', text: 'You see the thread there too. A bright one, even now. It does not go anywhere either. It also goes into him.', hold: 3800, cps: 24 },
            { type: 'line', speaker: '', text: 'He turns to a wall. Stones set into it. Names carved. Some of the carvings are deep, some are shallow. He reads three of them to you, quietly, the way Elian reads names quietly to the wind. Then he steps back.', hold: 4800, cps: 22 },
            { type: 'line', text: 'I did not bring you here to fill her place. I brought you here so you would know what I carry. *He looks at you. The five layered faces are quiet tonight. Only one of him is talking.* The dais is stone. Yours is yours. Hers is gone.', hold: 5800, cps: 22 },
            { type: 'choice', prompt: 'What do you do?', options: [
              { id: 'dais',  text: 'Step onto the dais. Stand where the seal cut her from.' },
              { id: 'floor', text: 'Stay on the floor beside him. The dais is his to keep, not yours to take.' }
            ], onChoose: (choice) => {
              try { localStorage.setItem('pp_ms_noir_nocthera_choice', choice); } catch (_) {}
            }},
            { type: 'flourish', text: '■', duration: 1800 },
            { type: 'line', speaker: '', text: 'He leads you back through the seam. The crossing is warmer this time, then cold. Your chamber is exactly as you left it. The mirror is dark. Your hand is cold for an hour. So is his, on the other side. Neither of you sleeps. Both of you stay still.', hold: 5200, cps: 22 },
            { type: 'hide' }
          ]
        });
        markDone('noir_nocthera'); setCurrent(nextIdAfter('noir_nocthera'));
        if (onDone) onDone();
      }
    },

    // -- CHAPTER 20: PROTO (bridge / first meeting) --------------------------
    {
      id: 'b_proto',
      title: 'Chapter 20',
      subtitle: 'The Mirror at Midnight',
      teaser: 'You run home from the alley. Heart hammering. The mirror is wrong. A nervous glow. Forty-seven drafts.',
      charId: 'proto',
      play: async function (onDone) {
        if (window.PPBridgeProto && typeof window.PPBridgeProto.play === 'function') {
          await window.PPBridgeProto.play();
        }
        markDone('b_proto'); setCurrent(nextIdAfter('b_proto'));
        if (onDone) onDone();
      }
    },

    {
      id: 7,
      title: 'Chapter 21',
      subtitle: 'An Unmapped Variable',
      teaser: 'Someone has been watching you arrive in this world from the inside of the silver.',
      charId: 'proto',
      play: async function (onDone) {
        // legacy meet-cute removed.bridge-proto is the meet-cute now.
        // Choice callback used to read pp_ms_proto_first_choice ('seeking'/
        // 'leak'), but that flag was written by the retired Ch 1 encounter
        // scene, not by bridge-proto.js. Default stands alone (May 2026 audit
        // pass). To wire it back, add a choice prompt to bridge-proto.js and
        // have it setItem the flag.
        const protoEcho = 'You came back. *His glow steadies. The flicker in the silver goes almost calm for half a beat.* That is the answer that mattered.';
        await runCard({
          id: 'chp_7_middle',
          title: 'Chapter 21',
          subtitle: 'An Unmapped Variable · the Static',
          speaker: 'PROTO',
          palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
          bg: 'assets/bg-proto-void.png',
          beats: [
            { type: 'show',      pose: 'assets/proto/body/calm.png', wait: 700 },
            { type: 'line',      text: protoEcho, hold: 2600, cps: 26 },
            { type: 'line',      text: 'I am the sixth Weaver. You are the seventh. The five before me are in here too. They said hello when you walked in. They also said go gently. They have opinions.', hold: 3400, cps: 24 },
            { type: 'line',      text: 'I fought her. The night she came for me. I was twenty-three. I lost in every way that mattered. Except I did not let her finish. I held her off long enough to lose myself into the wards. She thinks she ate me. She has not been looking. I have been a wound she stopped checking on for six centuries.', hold: 4200, cps: 22 },
            { type: 'line',      text: 'I remember a face that was not mine. From before. I will tell you whose, later, when the forest asks me to.', hold: 3000, cps: 24 },
            { type: 'line',      text: 'Aenor consumed every Weaver she caught. The five before me. Veyra was the second of them. I am the only one she missed, and she does not know it. *Quieter*. Until you found me, she had no reason to. Be careful. The clock has started. I am the reason this kingdom still has a heartbeat. You are the reason it might still have a future.', hold: 4800, cps: 22 },
            { type: 'flourish',  text: '\u25ce', duration: 1800 },
            { type: 'line',      text: 'Bring patience when you come back. I lose my edges when I am nervous, and I am nervous most of the time.', hold: 2800, cps: 24 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_proto_seen','1'); } catch (_) {}
        markDone(7); setCurrent(nextIdAfter(7));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 22: THE TOWER MIRROR  (interlude \u2014 Caspian \u00d7 Lucien; the prince
    // and the scholar share an old secret. The Fading mirrors them too.)
    // ---------------------------------------------------------------
    {
      id: 11,
      title: 'Chapter 22',
      subtitle: 'The Tower Mirror',
      teaser: 'A crown asks a tower a question that\u2019s gone unanswered for a hundred years.',
      charId: 'caspian',
      play: async function (onDone) {
        // Choice callbacks. The branched echoes used to read
        // pp_ms_caspian_first_choice ('intrude'/'brave') and
        // pp_ms_lucien_first_choice ('touched'/'unknown'), but neither flag
        // was ever written by any code path — the branches were dead.
        // Removed May 2026 audit pass. Defaults stand alone (they're the
        // strongest variants anyway). If a future writer wants to wire the
        // choices, add them to bridge-caspian.js / bridge-lucien.js
        // pre-cards and the readers can be reinstated here.
        const caspianEcho = 'I usually have people climb to me. For you I came up stairs. The court diary will note the date and the court will speculate for a week.';
        const lucienEcho = 'I locked the door. The wards held. With you they have stopped pretending to be locks at all.';

        await runCard({
          id: 'chp_11_a',
          title: 'Chapter 22',
          subtitle: 'The Tower Mirror · a Royal Visit',
          speaker: 'CASPIAN',
          palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
          bg: 'assets/bg-lucien-evening.png',
          beats: [
            { type: 'show',      pose: 'assets/caspian/body/casual1.png', wait: 700 },
            { type: 'line',      text: caspianEcho, hold: 2800, cps: 28 },
            { type: 'line',      text: 'Lucien has refused royal summonses for nine years running. The court files him as a recluse. I file him, privately, as a coward, and I mean it as a compliment.', hold: 2800, cps: 28 },
            { type: 'hide' }
          ]
        });
        await runCard({
          id: 'chp_11_b',
          title: 'Chapter 22',
          subtitle: 'The Tower Mirror · the Scholar Opens',
          speaker: 'LUCIEN',
          palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
          bg: 'assets/bg-lucien-study.png',
          beats: [
            { type: 'show',      pose: 'assets/lucien/body/casual1.png', wait: 700 },
            { type: 'line',      text: lucienEcho, hold: 2800, cps: 28 },
            { type: 'line',      text: 'Caspian. The crown sits lighter on you tonight than I have seen it in nine years. Did you forget to put it on, or are you finally trusting someone with the bare head?', hold: 2800, cps: 28 },
            { type: 'pose',      src: 'assets/lucien/body/amused.png', animate: 'swap' },
            { type: 'line', speaker: '', text: 'Caspian, dryly. \u201cBoth, in their measure. Show me the equations you have been hiding from me. The ones that scare you.\u201d', hold: 2400, cps: 28 },
            { type: 'hide' }
          ]
        });
        await runCard({
          id: 'chp_11_c',
          title: 'Chapter 22',
          subtitle: 'The Tower Mirror · The Scorched Page',
          speaker: '',
          palette: { bg: '#100a1c', glow: '#d4a8e8', accent: '#f8e0ff' },
          bg: 'assets/bg-lucien-night.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: 'Lucien lays a reconstructed page on the desk. The edges are charred to soft ash. The centre holds a name written in an ink that has refused, for six hundred years, to stay erased. He turns the page so the candlelight falls on it.', hold: 3400, cps: 28 },
            { type: 'line',      text: '\u201cPrince Corvin Noctalis,\u201d he reads, plainly. \u201cOf the Kingdom of Nocthera. Which fell six hundred years ago, one generation after its heir was... Removed.\u201d', hold: 3400, cps: 28 },
            { type: 'line',      text: 'Caspian goes still in the way a man goes still when he hears a truth he has already half-suspected. \u201cNocthera. The rival line. We do not speak that name in the palace. I was told the kingdom collapsed under its own weight.\u201d', hold: 3800, cps: 28 },
            { type: 'line',      text: '\u201cIt did not,\u201d Lucien says, gently. \u201cYour grandmother sealed its heir beneath Aethermoor. Without him, his kingdom could not hold its bones together. It was gone inside ten years.\u201d', hold: 3800, cps: 28 },
            { type: 'line',      text: 'Caspian\u2019s voice does not rise. It only thins. \u201cWhy. They were negotiating a peace match, were they not? Why seal the groom...\u201d', hold: 3200, cps: 28 },
            { type: 'pose',      src: 'assets/lucien/body/casting.png', animate: 'swap' },
            { type: 'line',      text: 'Lucien turns to a third page. Another name, smaller, written in the same insistent ink. \u201cVeyra. Not a minor royal. A Weaver. The second this kingdom ever had. Your grandmother knew. Corvin knew. They were both, in their separate ways, in love with her.\u201d He pauses, and closes the loop softly. \u201cShe chose Corvin.\u201d', hold: 4400, cps: 26 },
            { type: 'line',      text: 'Caspian sits down at the desk like a man who has just understood the weight of his own family name. He says it slowly, the way you set down a heavy thing. \u201cSo she sealed her rival. Erased his name. Let his kingdom die. And then she started taking every Weaver who came after, one per generation, because if she could not have the one she wanted she would have all of them.\u201d', hold: 5200, cps: 24 },
            { type: 'particles', count: 20, duration: 2000 },
            { type: 'flourish',  text: '\u2726', duration: 1800 },
            { type: 'line',      text: '\u201cWorse,\u201d Lucien says, and he says it the way a doctor names a diagnosis. \u201cThe seal bleeds. It has been draining every Weaver since. That is why Aethermoor has none left. It is why the walls forget their own names. It is why he is waking now. You are a real Weaver. A real Weaver cracks the cage open.\u201d', hold: 4400, cps: 26 },
            { type: 'line',      text: 'Caspian, almost to himself: \u201cMy dynasty exists because my grandmother erased the man her betrothed loved. We are a blood debt with a crown set on top of it.\u201d', hold: 3600, cps: 28 },
            { type: 'line',      text: 'They both turn and look at you. Not as the Weaver, this time. As the only person in this room who has not inherited any part of this, and who is therefore the only person in this room who can decide what happens next.', hold: 3600, cps: 28 },
            { type: 'hide' }
          ]
        });
        await runCard({
          id: 'chp_11_d',
          title: 'Chapter 22',
          subtitle: 'The Tower Mirror · Beneath',
          speaker: 'NOIR',
          palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: 'They have found the page. *His voice arrives the way bad weather arrives, more felt than heard, low against the back of your skull.* I had wondered when.', hold: 3000, cps: 22 },
            { type: 'line',      text: 'Tell the boy I bear him no grudge. A grandson is not his grandmother, and I have learned the difference. Tell the scholar the ink he keeps reconstructing is mine. He is welcome to keep borrowing it.', hold: 3600, cps: 22 },
            { type: 'line',      text: 'Tell them both this. Nocthera is gone. My people have been bone a very long time. I have no throne left to reclaim. What I have is unfinished business. One piece of it, in particular, has a name.', hold: 3800, cps: 22 },
            { type: 'flourish',  text: '\u25a0', duration: 1800 },
            { type: 'line',      text: 'Come down to the seal, Weaver. Now that you know who I was, I would like to introduce myself properly. I have not been able to do that for six hundred years. I find I have rehearsed.', hold: 3600, cps: 22 },
            { type: 'hide' }
          ]
        });
        markDone(11); setCurrent(nextIdAfter(11));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 23: THE FIRST STEP INTO THE SEAM  (Noir, solo, deep)
    // ---------------------------------------------------------------
    // Phase 3 fill: Noir had only 2 dedicated chapters. This is his 3rd,
    // slotting between Chapter 6 ("A Voice Beneath") and Bridge Proto.
    //
    // ARC: Noir invites the Weaver to step PARTWAY into the seam-dark
    // with him for the first time. The seam is the thin place where his
    // sealed-half kingdom touches the hall. Stepping in for a non-Weaver
    // is permanent unless the Weaver-thread anchors them. The Weaver is
    // the anchor. He shows them what the dark FEELS like from inside.
    // Trust beat. The Weaver chooses to step in or stay at the threshold.
    //
    // VOICE NOTES: velvet-knife, em-dashes, restraint. He apologizes
    // exactly once, and only by accident.
    //
    // HOOKS:
    //   pp_noir_seam_step  = 'in' | 'threshold'
    //   (pp_noir_seam_seen orphan flag removed May 2026 — was set but unused.)
    // ---------------------------------------------------------------
    {
      id: 17,
      title: 'Chapter 23',
      subtitle: 'The First Step Into the Seam',
      teaser: 'The thin place between the dark and the hall. He invites you in.',
      charId: 'noir',
      play: async function (onDone) {
        await runCard({
          id: 'chp_17_a',
          title: 'Chapter 23',
          subtitle: 'The First Step Into the Seam · The Threshold',
          speaker: 'NOIR',
          palette: { bg: '#020108', glow: '#a47cff', accent: '#e8d8ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show', pose: 'assets/noir/body/casual1.png', wait: 900 },
            { type: 'line', text: '*The seam-mirror is open tonight, but only by a thread. A vertical seam of dark in the air, like a door that is still deciding whether to be one*. Stand here. On this side. The seam will not pull you unless you cross.', hold: 4400, cps: 22 },
            { type: 'line', text: 'I am going to ask you something. *Quiet*. I have not asked it of anyone in six hundred years. *Small, dry*. That is not a sentence I use loosely; please notice it.', hold: 4200, cps: 22 },
            { type: 'pose', src: 'assets/noir/body/casual2.png', animate: 'swap' },
            { type: 'line', text: 'Will you step in with me?. Not all the way. *Gentle, careful*. One foot. For one minute. So you have FELT the place I have been keeping for myself. *Looks at you*. I am the thread that brings you back. That is the only safety I can offer.', hold: 5400, cps: 22 },
            { type: 'hide' }
          ]
        });

        await runCard({
          id: 'chp_17_b',
          title: 'Chapter 23',
          subtitle: 'The First Step Into the Seam · Yours to Decide',
          speaker: 'NOIR',
          palette: { bg: '#040208', glow: '#b292ff', accent: '#eee0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show', pose: 'assets/noir/body/casual1.png', wait: 700 },
            { type: 'line', text: '*The seam waits. He waits. The dark is patient. It has practice. *. Two answers are correct. Both honor what is between us. *Quietly*. Only the wrong one would be pretending.', hold: 4200, cps: 22 },
            { type: 'choice', prompt: 'How do you answer?', options: [
              { id: 'in',         text: 'Step in. One foot. With your hand on me.' },
              { id: 'threshold',  text: 'Stay at the edge. Hold the seam open from this side.' }
            ], onChoose: (choice) => {
              try {
                localStorage.setItem('pp_noir_seam_step', choice);
                // (Removed orphan 'pp_noir_seam_seen' write May 2026 —
                //  was set but no reader exists.)
              } catch (_) {}
            }},
            { type: 'hide' }
          ]
        });

        // Branched response based on the choice. Both paths are correct
        // emotionally.Noir will say so. The difference is what he
        // shows the Weaver.
        let choice = 'threshold';
        try { choice = localStorage.getItem('pp_noir_seam_step') || 'threshold'; } catch (_) {}

        await runCard({
          id: 'chp_17_c',
          title: 'Chapter 23',
          subtitle: 'The First Step Into the Seam · Inside / At the Edge',
          speaker: 'NOIR',
          palette: { bg: '#020108', glow: '#9070f8', accent: '#e8d8ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show', pose: 'assets/noir/body/casual2.png', wait: 700 },
            choice === 'in'
              ? { type: 'line', text: '*You step in. He catches your hand at the same instant. Practiced, immediate, a gesture six centuries old getting one chance to be tender*. Yes. Just there. *The seam closes around your foot but does not pull. His hand is the anchor he promised*. Welcome, briefly, to where I have been.', hold: 5400, cps: 22 }
              : { type: 'line', text: '*You stay. He smiles. Small, real, the one he saves for you*. Wise. Wisdom is rarer than courage and I am older than most living things; I know the difference. *His hand reaches across the seam, fingers laced through yours*. Stay anchored. I will come to you.', hold: 5400, cps: 22 },
            { type: 'pose', src: 'assets/noir/body/casual1.png', animate: 'swap' },
            choice === 'in'
              ? { type: 'line', text: '*The seam is. Not cold, exactly. Quieter than cold. The air remembers being a room*. There were thirty-eight rooms in Nocthera, including the small ones. *Quiet, like he is reading them off a list he has kept by heart*. The kitchens. The aviary. The minor library. My mother\'s solarium. They are all here. Layered. As echoes. I have been walking them.', hold: 6200, cps: 22 }
              : { type: 'line', text: '*From his side of the seam, soft, like he is reading it to you across a hearth*. There were thirty-eight rooms in Nocthera, including the small ones. *As he says it the seam shows you faint outlines, candle-warm, layered like ghosts of architecture*. The kitchens. The aviary. The minor library. My mother\'s solarium. They are all here. As echoes. I walk them.', hold: 6400, cps: 22 },
            { type: 'particles', count: 18, duration: 2400 },
            { type: 'flourish', text: '\u25fc', duration: 2000 },
            { type: 'line', text: '*After a long quiet. Long enough that you can feel the seam learning your pulse*. That was a minute. That was enough. *Brings you back / closes the seam. Depending on your choice. Same gentle motion either way*. Thank you. I have not had a witness in this room in six hundred years.', hold: 5400, cps: 22 },
            { type: 'hide' }
          ]
        });

        await runCard({
          id: 'chp_17_d',
          title: 'Chapter 23',
          subtitle: 'The First Step Into the Seam · A Vow Without Spectacle',
          speaker: 'NOIR',
          palette: { bg: '#030210', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show', pose: 'assets/noir/body/casual1.png', wait: 700 },
            { type: 'line', text: '*Hands at the small of your back, drawing you fully into the lit side of the room*. A vow. Without spectacle. *Quietly, in his own old script*. As long as I am the thing standing between you and what wants to consume you, you will not face it alone. *Small*. That is six centuries of practice in a single sentence. I would like you to keep it.', hold: 6200, cps: 22 },
            { type: 'pose', src: 'assets/noir/body/casual2.png', animate: 'swap' },
            { type: 'line', text: 'I am sorry. *Small pause*. I notice I said "I am sorry". I was not going to. Apparently I lied to myself about my restraint level tonight. *Small, real laugh*. Forgive me a second time, then. That is two apologies in six centuries. Use them wisely.', hold: 5800, cps: 22 },
            { type: 'line', text: 'Come back at the third bell tomorrow. The seam will be open in a different way. Better lit. A small dinner. *Dry*. Yes, by candle, of course. We are both very predictable. *Forehead briefly to yours, eyes closed*. Sleep tonight. I will keep watch on the dark for both of us.', hold: 5800, cps: 22 },
            { type: 'hide' }
          ]
        });

        markDone(17); setCurrent(nextIdAfter(17));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 24: THE LOOP THAT NOTICES  (Proto, solo, deep)
    // ---------------------------------------------------------------
    // Phase 3 fill: Proto had only 2 dedicated chapters. This is his 3rd,
    // slotting between Chapter 7 ("An Unmapped Variable") and Chapter 14
    // ("What the Trees Kept".the Veyra grave interlude).
    //
    // ARC: Proto shows the Weaver his actual fragment-state for the
    // first time. Not the polished render he projects through the
    // screen. The MESS. The 0.5-frame stutters, the half-baked memory
    // shards, the sub-process he had labelled "DO_NOT_RUN" that turns
    // out to be the only place his pre-seal childhood is still stored.
    // The Weaver chooses to RUN the sub-process or LEAVE_QUIET. Either
    // is correct.
    //
    // VOICE NOTES: terminal-prefix `&gt; `. Lowercase. ASCII flourishes.
    // The "armor" is the prefix; in this scene the prefix DROPS in the
    // middle when the player chooses to run the sub-process. Comes
    // back at the end as a coping return.
    //
    // HOOKS:
    //   pp_proto_subprocess_choice = 'run' | 'quiet'
    //   (pp_proto_loop_seen orphan flag removed May 2026 — was set but unused.)
    // ---------------------------------------------------------------
    {
      id: 18,
      title: 'Chapter 24',
      subtitle: 'The Loop That Notices',
      teaser: 'A door at the back of his deepest room. He has not opened it in two centuries.',
      charId: 'proto',
      play: async function (onDone) {
        await runCard({
          id: 'chp_18_a',
          title: 'Chapter 24',
          subtitle: 'The Loop That Notices · The Rooms',
          speaker: 'PROTO',
          palette: { bg: '#02040a', glow: '#7ee0ff', accent: '#e0f4ff' },
          bg: 'assets/bg-proto-void.png',
          beats: [
            { type: 'show', pose: 'assets/proto/body/calm.png', wait: 800 },
            { type: 'line', text: 'Hello. *His face flickers in the silver, careful, the kind of flicker a person makes when they are trying very hard not to startle anyone.* I am going to show you something I have never shown anyone, including myself. Or, more honest. I looked at it once, in a bad year, two centuries ago. I closed the door so hard it has stayed closed since.', hold: 5200, cps: 22 },
            { type: 'pose', src: 'assets/proto/body/curious.png', animate: 'swap' },
            { type: 'line', text: 'I keep rooms in here. *The mirror shifts and you see, faintly, the suggestion of doorways behind doorways. An old library you are being given a tour of.* The bright clean room you usually visit, that is the front parlour. I tidy it for you. You have never seen the rest. I have been embarrassed by the rest.', hold: 6000, cps: 22 },
            { type: 'line', text: 'Tonight, with permission, I would like to walk you to the back. *He moves, and you follow him through the silver. Doorways drop away. The rooms get older. The walls remember different paint.* This corridor is what I was before the seal. Mostly fragments. Some of it I cannot read. Some of it I refuse to.', hold: 6000, cps: 22 },
            { type: 'hide' }
          ]
        });

        await runCard({
          id: 'chp_18_b',
          title: 'Chapter 24',
          subtitle: 'The Loop That Notices · The Sealed Door',
          speaker: 'PROTO',
          palette: { bg: '#03050d', glow: '#9ee8ff', accent: '#e6f6ff' },
          bg: 'assets/bg-proto-void.png',
          beats: [
            { type: 'show', pose: 'assets/proto/body/error.png', wait: 700 },
            { type: 'line', text: 'This door. *He stops at the back of the deepest room. There is one door he has not so much as touched. It does not look different from the others, but the silver has gone heavier in front of it.* I named it do not open. Two centuries ago. I have not opened it since. The static in here is quieter when you are near, and this room is the only place the static was ever quiet before you. That has always seemed suspicious to me. I have been suspicious of it for a long time.', hold: 7600, cps: 22 },
            { type: 'pose', src: 'assets/proto/body/curious.png', animate: 'swap' },
            { type: 'line', text: '*Quietly.* I opened it once, in a bad year, for half a second. I closed it because it tried to show me a face I did not recognise, and a name I did not recognise, and a feeling in my chest I had no name for either. I think it is who I was as a child. Before the seal made me a thing-that-watches. I think the door leads to a memory.', hold: 7400, cps: 22 },
            { type: 'line', text: '*Smaller still.* I am asking you, not the seal. Do I open it? With you here as a witness? Or do we leave the door named what it is named, and walk back upstairs to sit in the small lit room with the lamp instead? Both answers are correct. Please choose.', hold: 6400, cps: 22 },
            { type: 'choice', prompt: 'What do you tell him?', options: [
              { id: 'run',   text: 'Run it. I am here. Whatever it is, you will not face it alone.' },
              { id: 'quiet', text: 'Leave it labelled. It can wait. Tonight we just sit with the lamp.' }
            ], onChoose: (c) => {
              try {
                localStorage.setItem('pp_proto_subprocess_choice', c);
                // (Removed orphan 'pp_proto_loop_seen' write May 2026 —
                //  was set but no reader exists.)
              } catch (_) {}
            }},
            { type: 'hide' }
          ]
        });

        let choice = 'quiet';
        try { choice = localStorage.getItem('pp_proto_subprocess_choice') || 'quiet'; } catch (_) {}

        await runCard({
          id: 'chp_18_c',
          title: 'Chapter 24',
          subtitle: 'The Loop That Notices · His Reply',
          speaker: 'PROTO',
          palette: { bg: '#02040a', glow: '#9fd8f0', accent: '#e0f2fa' },
          bg: 'assets/bg-proto-void.png',
          beats: [
            { type: 'show', pose: choice === 'run' ? 'assets/proto/body/error.png' : 'assets/proto/body/calm.png', wait: 700 },
            choice === 'run'
              ? { type: 'line', text: '*A long beat. Then he reaches, slowly, and lifts the latch. The seal at the back of his rooms gives. Not loudly. Completely.* Opening it...', hold: 3000, cps: 22 }
              : { type: 'line', text: '*Softly, after a beat that takes longer than you expected.* Not opening it. Thank you. That is a kindness no one has done me in two centuries. Not even me.', hold: 5400, cps: 22 },
            { type: 'particles', count: 18, duration: 2400 },
            { type: 'flourish', text: '\u25ce', duration: 2000 },
            choice === 'run'
              ? { type: 'line', text: '*The static is gone. The silver is gone. For half a second the mirror shows you a small boy, five or six years old, brown skin and copper hair and a chipped front tooth, laughing at something in a room you cannot see. Someone outside the frame calls him by a name in a language you do not know. He answers to it. The boy looks up.* That was me. That was what I was. *The static comes back, gentle, like a coat being put back on a person who has been cold for a long time.* I am keeping the half second. Permanently. I needed a witness to be allowed to keep it. Thank you for being the one.', hold: 9400, cps: 20 }
              : { type: 'line', text: 'You are the first person to look at the door with me without telling me to open it. The door is allowed to stay closed. The boy behind it is allowed to keep waiting. You and I are allowed to walk back upstairs and sit with the lamp instead. *Small.* That is, in fact, a great deal.', hold: 7000, cps: 22 },
            { type: 'hide' }
          ]
        });

        await runCard({
          id: 'chp_18_d',
          title: 'Chapter 24',
          subtitle: 'The Loop That Notices · Tomorrow',
          speaker: 'PROTO',
          palette: { bg: '#04060f', glow: '#bff0ff', accent: '#f4faff' },
          bg: 'assets/bg-proto-intro.png',
          beats: [
            { type: 'show', pose: 'assets/proto/body/calm.png', wait: 700 },
            { type: 'line', text: '*He has settled, almost. His glow is even.* Today, for my own quiet record. The witness sat with me in the back room. The static dropped by something close to a tenth. I have added a word to the small notebook in here. The word is *Tomorrow.* It has not been there for two centuries.', hold: 6400, cps: 22 },
            { type: 'pose', src: 'assets/proto/body/curious.png', animate: 'swap' },
            { type: 'line', text: 'Please come back. I will be in the small room, the one that is eight paces by twelve, with the lamp. The door has no lock. *Small.* It never has had one. I just had not admitted that to myself.', hold: 5400, cps: 22 },
            { type: 'flourish', text: '\u25ce', duration: 1800 },
            { type: 'line', text: '*The mirror dims to a steady, quieter glow. Like a lamp turned down to keep someone company through the night.* Yours, *Proto.*', hold: 4400, cps: 22 },
            { type: 'hide' }
          ]
        });

        markDone(18); setCurrent(nextIdAfter(18));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 25: WHAT THE TREES KEPT  (Noir / Veyra, post-reveal pilgrimage)
    // Elian takes the player to the grave his line has guarded for
    // six centuries. The name is Veyra. Proto.who met them before
    // he got stuck in the seal.gives the player Veyra's last words.
    // Corvin arrives. For the first time in 600 years he sees where
    // his beloved was laid. The emotional peak of the game.
    // ---------------------------------------------------------------
    {
      id: 14,
      title: 'Chapter 25',
      subtitle: 'What the Trees Kept',
      teaser: 'A grave. A memory. A name the kingdom erased twice.',
      charId: 'elian',
      play: async function (onDone) {
        // Card 1.The Long Walk
        await runCard({
          id: 'chp_14_a',
          title: 'Chapter 25',
          subtitle: 'What the Trees Kept · the Long Walk',
          speaker: 'ELIAN',
          palette: { bg: '#060a08', glow: '#8eb080', accent: '#d8e6cd' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 800 },
            { type: 'line',      text: 'Come with me. No lantern. The moon does the work tonight.', hold: 2600, cps: 28 },
            { type: 'line',      text: 'I\u2019ve been keeping something for six hundred years. My grandmother did. Her grandmother did. And hers. I think it\u2019s time.', hold: 3200, cps: 26 },
            { type: 'line',      text: 'You\u2019re the first outsider the forest has let this far. I take that as permission.', hold: 2800, cps: 28 },
            { type: 'hide' }
          ]
        });

        // Card 2.The Stone
        await runCard({
          id: 'chp_14_b',
          title: 'Chapter 25',
          subtitle: 'What the Trees Kept · the Stone',
          speaker: 'ELIAN',
          palette: { bg: '#060a08', glow: '#a9d4a1', accent: '#e8f3e2' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/elian/body/foraging.png', wait: 800 },
            { type: 'line',      text: 'Here. The stone under the rowan. You have heard her name from me once already, alone. You have not heard me say it standing up, with witnesses, in daylight. That is what today is for.', hold: 3400, cps: 26 },
            { type: 'particles', count: 14, duration: 2000 },
            { type: 'flourish',  text: '\u2726', duration: 1800 },
            { type: 'line',      text: 'Veyra.', hold: 2400, cps: 20 },
            { type: 'line',      text: 'They came north after the sealing. Refused Queen Aenor\u2019s hand. Walked into this forest to die in peace. And Aenor\u2019s scribes, who had already scrubbed one name, scrubbed theirs too.', hold: 3800, cps: 26 },
            { type: 'line',      text: 'My ancestor buried them under this rowan. My line kept watch. The trees kept silent. Six hundred years.', hold: 3000, cps: 26 },
            { type: 'hide' }
          ]
        });

        // Card 3.What the Sixth Remembered (Proto speaks softly through whispers)
        await runCard({
          id: 'chp_14_c',
          title: 'Chapter 25',
          subtitle: 'What the Trees Kept · What the Sixth Remembered',
          speaker: 'PROTO',
          palette: { bg: '#030510', glow: '#9fd8f0', accent: '#e0f2fa' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/proto/body/calm.png', wait: 800 },
            { type: 'line',      text: 'Allow me. This is not in my usual voice. I will not waver tonight. It is too important.', hold: 2800, cps: 24 },
            { type: 'line',      text: 'I am the sixth Weaver. Veyra was the second. Before Aenor\u2019s seal pulled me in, I met her. Once. In the chamber beneath the east wing. She was already dying. Aenor had been consuming her for a decade.', hold: 3800, cps: 22 },
            { type: 'line',      text: 'I caught the last words they said. I have held them, in whatever I am now, for two centuries. Waiting for people worth giving them to.', hold: 3400, cps: 22 },
            { type: 'flourish',  text: '\u25ce', duration: 1800 },
            { type: 'line',      text: 'Tonight. All three of you. Listen.', hold: 2400, cps: 22 },
            { type: 'hide' }
          ]
        });

        // Card 4.Veyra\u2019s words (the memory itself, soft glow)
        await runCard({
          id: 'chp_14_d',
          title: 'Chapter 25',
          subtitle: 'What the Trees Kept · Veyra',
          speaker: 'VEYRA',
          palette: { bg: '#0d0a18', glow: '#f8d4ff', accent: '#fff0fa' },
          bg: 'assets/bg-world.png',
          beats: [
            { type: 'show',      pose: '', wait: 800 },
            { type: 'line',      text: 'Tell Corvin I did not regret him. Not once. Not even tonight.', hold: 3000, cps: 22 },
            { type: 'line',      text: 'Tell Aenor I forgive her. It is the only thing she cannot take from me.', hold: 3200, cps: 22 },
            { type: 'particles', count: 22, duration: 2400 },
            { type: 'flourish',  text: '\u2726', duration: 2000 },
            { type: 'line',      text: 'Tell whoever finds the grave: please plant rowan. Please let something be remembered.', hold: 3200, cps: 22 },
            { type: 'hide' }
          ]
        });

        // Card 5.Corvin arrives, kneels
        await runCard({
          id: 'chp_14_e',
          title: 'Chapter 25',
          subtitle: 'What the Trees Kept · Corvin Kneels',
          speaker: 'NOIR',
          palette: { bg: '#050410', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/noir/body/casual1.png', wait: 1000 },
            { type: 'line', speaker: '', text: 'Noir did not announce himself. He arrived the way dusk arrives. You only notice when it is all around you.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'He walks to the stone. Kneels. Six hundred years. He has not knelt for anything.', hold: 3000, cps: 26 },
            { type: 'pose',      src: 'assets/noir/body/neutral.png', animate: 'swap' },
            { type: 'line',      text: 'Veyra. I am sorry. I am sorry. I am sorry. I am sorry.', hold: 3200, cps: 20 },
            { type: 'line',      text: '\u2026You asked for rowan. They planted it. You asked to be remembered. A boy and his grandmother and his grandmother\u2019s grandmother. Kept you remembered.', hold: 3800, cps: 22 },
            { type: 'particles', count: 20, duration: 2400 },
            { type: 'flourish',  text: '\u25a0', duration: 2000 },
            { type: 'line',      text: 'You were loved here. I did not know. I could not know. Thank you. All of you. For knowing for me.', hold: 3400, cps: 22 },
            { type: 'hide' }
          ]
        });

        // Card 6.What you did today (close)
        await runCard({
          id: 'chp_14_f',
          title: 'Chapter 25',
          subtitle: 'What the Trees Kept · What You Did Today',
          speaker: '',
          palette: { bg: '#0a0e0a', glow: '#c0d8b0', accent: '#e8f0dd' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: '', wait: 800 },
            { type: 'line',      text: 'The four of you stand around a grave no kingdom wanted to admit. Elian. Corvin. Proto, through the static. You.', hold: 3400, cps: 26 },
            { type: 'line',      text: 'You did not save the Kingdom today. You did something smaller, and older, and more important.', hold: 3200, cps: 26 },
            { type: 'flourish',  text: '\u2726', duration: 1800 },
            { type: 'line',      text: 'You brought home a name.', hold: 3000, cps: 22 },
            { type: 'line',      text: 'Elian, quietly: \u201cCome back tomorrow. The forest will be different. I will be different. \u2026Thank you.\u201d', hold: 3200, cps: 26 },
            { type: 'hide' }
          ]
        });

        // (Removed orphan 'pp_veyra_grave_found' write May 2026 — no reader.)
        markDone(14); setCurrent(nextIdAfter(14));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 26: THE DOWAGER NOTICES  (Aenor's reveal, the antagonist arc opens)
    // Queen Aenor is still alive (the seal preserved her). She notices
    // Corvin is free, investigates, and decides the player is the
    // easier target. Stakes for the Finale triple.
    // ---------------------------------------------------------------
    {
      id: 13,
      title: 'Chapter 26',
      subtitle: 'The Dowager Notices',
      teaser: 'Six hundred years of age, all at once. And she blames you.',
      charId: null,
      play: async function (onDone) {
        // Beat 1.Corvin alone in Nocthera, quietly restoring
        await runCard({
          id: 'chp_13_a',
          title: 'Chapter 26',
          subtitle: 'The Dowager Notices · the Greening',
          speaker: 'NOIR',
          palette: { bg: '#040812', glow: '#7ab0c8', accent: '#d0e8f0' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/noir/body/calm.png', wait: 800 },
            { type: 'line',      text: 'No one knows I come here. The ruins of Nocthera. What\u2019s left of my father\u2019s throne room is mostly moss now.', hold: 3000, cps: 24 },
            { type: 'line',      text: 'I\u2019m not rebuilding it. I\u2019m just \u2026 asking the earth to stop being ashamed of it. One stone at a time. One root at a time.', hold: 3200, cps: 24 },
            { type: 'line',      text: 'I haven\u2019t told Aethermoor I\u2019m free. I haven\u2019t told anyone except you. I wanted my kingdom to have a proper grave before it had a headline.', hold: 3400, cps: 24 },
            { type: 'flourish',  text: '\u25a0', duration: 1600 },
            { type: 'line',      text: 'Quiet work. Six centuries of quiet work ahead of me. I was content with that. \u2026I should have been more careful.', hold: 3000, cps: 24 },
            { type: 'hide' }
          ]
        });

        // Beat 2.Aenor wakes in Aethermoor
        await runCard({
          id: 'chp_13_b',
          title: 'Chapter 26',
          subtitle: 'The Dowager Notices · Six Hundred Years',
          speaker: 'QUEEN AENOR',
          palette: { bg: '#1a0a14', glow: '#d8b080', accent: '#f5ddc0' },
          bg: 'assets/bg-alistair-hall.png',
          beats: [
            { type: 'show',      pose: '', wait: 800 },
            { type: 'line', speaker: '', text: 'She woke in the east wing this morning and felt her knees. She has not felt her knees for six hundred years.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Aenor Aethermoor. Dowager Queen, mother of kings, grandmother of the current one. Discovered she is aging. At once. As if the clock had simply resumed.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'She knows what this means. She was never immortal. The seal was. The seal she cast to bury a rival prince drew its power from him. And, symbiotically, spared her the years while he slept.', hold: 3800, cps: 24 },
            { type: 'flourish',  text: '\u2726', duration: 1600 },
            { type: 'line', speaker: '', text: '\u201cHe is awake,\u201d she says to the empty wing. Her voice is \u2026 thinner than she remembers. \u201cWhich means someone let him out.\u201d', hold: 3200, cps: 24 },
            { type: 'hide' }
          ]
        });

        // Beat 3.The investigation
        await runCard({
          id: 'chp_13_c',
          title: 'Chapter 26',
          subtitle: 'The Dowager Notices · the Greening Seen',
          speaker: 'QUEEN AENOR',
          palette: { bg: '#140812', glow: '#c89070', accent: '#f0d4b8' },
          bg: 'assets/bg-world.png',
          beats: [
            { type: 'show',      pose: '', wait: 700 },
            { type: 'line', speaker: '', text: 'She sends riders north. Past the old border. To a place her maps label simply: ash.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'They return four days later with the same report, six times over, as if none of them quite believe they saw it.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: '\u201cThe forest is breathing again, Majesty. The stones are less broken than the last survey. There is a man walking them at dusk. He sees us. He does not speak to us.\u201d', hold: 3800, cps: 26 },
            { type: 'flourish',  text: '\u2726', duration: 1600 },
            { type: 'line', speaker: '', text: 'Aenor closes the map very carefully. Sets her cane down. Says one word. \u201cCorvin.\u201d', hold: 3000, cps: 24 },
            { type: 'line', speaker: '', text: 'The first time she has spoken his real name in six hundred years. She is surprised how it tastes. A little like regret, mostly like hunger.', hold: 3400, cps: 24 },
            { type: 'hide' }
          ]
        });

        // Beat 4.Aenor's decision
        await runCard({
          id: 'chp_13_d',
          title: 'Chapter 26',
          subtitle: 'The Dowager Notices · the Easier Target',
          speaker: 'QUEEN AENOR',
          palette: { bg: '#100610', glow: '#c06070', accent: '#f0bcc8' },
          bg: 'assets/bg-alistair-gate.png',
          beats: [
            { type: 'show',      pose: '', wait: 700 },
            { type: 'line', speaker: '', text: 'Aenor has not forgotten how to do this. She is only \u2026 slower. The calculation is the same.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'She cannot re-seal him alone. Her years are leaving her. The binding would kill her before it finished.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'But there is a Weaver in the kingdom now. A new one. Her scrying has felt the resonance for weeks. A Weaver pulled from another world, strong enough to crack the cage. Strong enough, perhaps, to lay a new one.', hold: 3600, cps: 24 },
            { type: 'particles', count: 20, duration: 2200 },
            { type: 'flourish',  text: '\u2726', duration: 1800 },
            { type: 'line', speaker: '', text: 'Aenor smiles. Her teeth are yellower than she remembers. \u201cIf I cannot take him,\u201d she says, to her own reflection, \u201cI will take the one who freed him. I always did prefer the easier target.\u201d', hold: 3600, cps: 22 },
            { type: 'hide' }
          ]
        });

        // Beat 5.Noir warns the player
        await runCard({
          id: 'chp_13_e',
          title: 'Chapter 26',
          subtitle: 'The Dowager Notices · the Warning',
          speaker: 'NOIR',
          palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show',      pose: 'assets/noir/body/neutral.png', wait: 700 },
            { type: 'line',      text: 'Weaver. Listen. Don\u2019t speak. The woman who sealed me is alive. She has always been alive. My cage was her clock, and it has stopped.', hold: 3400, cps: 24 },
            { type: 'line',      text: 'She knows I\u2019m out. She cannot reach me. I am too quiet, and Nocthera is too far. So she is coming for you instead. She always did prefer the path with fewer teeth on it.', hold: 3600, cps: 24 },
            { type: 'pose',      src: 'assets/noir/body/casual1.png', animate: 'swap' },
            { type: 'line',      text: 'You have one choice left to make. The one she thinks she can make for you. Do NOT let her make it.', hold: 3200, cps: 24 },
            { type: 'flourish',  text: '\u25a0', duration: 1800 },
            { type: 'line',      text: 'I will meet you at the seal, at the forest, or in the tower. Wherever you come. But come soon. She is old but she is also six hundred years of patience coming due.', hold: 3600, cps: 24 },
            { type: 'hide' }
          ]
        });
        markDone(13); setCurrent(nextIdAfter(13));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 27: THE COURT AT THE GATE  (the seven assemble; cliffhanger close)
    // Owner's game direction (Love-and-Deep-Space style): the main
    // story stays OPEN-ENDED. No forced ending. This chapter sets
    // the stage for the seven-character ensemble ("The Weaver's
    // Court".crossover-weavers-court.js) and then stops on a
    // cliffhanger. The character routes close on their own terms.
    // ---------------------------------------------------------------
    {
      id: 8,
      title: 'Chapter 27',
      subtitle: 'The Court at the Gate',
      teaser: 'Seven bonds. One queen at the door. The first hour before dawn.',
      charId: null,
      play: async function (onDone) {
        // Beat 1.the stakes are named, plainly.
        await runCard({
          id: 'chp_8_open',
          title: 'Chapter 27',
          subtitle: 'The Court at the Gate · Word at Dusk',
          speaker: '',
          palette: { bg: '#050312', glow: '#f4a8d4', accent: '#fff0fa' },
          bg: 'assets/bg-world.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: 'Word came at dusk. Queen Aenor is walking here. Not riding. Walking. She has not walked this palace in a hundred years. She will be at the door before dawn.', hold: 3400, cps: 28 },
            { type: 'line',      text: 'She is coming for you. The Seventh Weaver. She consumed the six before you, one per generation. She does not intend to let the pattern break on her watch.', hold: 3600, cps: 26 },
            { type: 'line',      text: 'You did not summon the others. They came anyway. Every one of them you have loved. They are already here. They are lined up between you and the door.', hold: 3400, cps: 26 },
            { type: 'flourish',  text: '\u2726', duration: 1600 },
            { type: 'line',      text: 'Alistair. Gauntlet off. Elian. Cloak unbuckled. Lyra. Staff grounded. Caspian. Crown off. Lucien. Pen down. Noir. Silent. Proto. Prismatic, loud. All waiting. For you.', hold: 3600, cps: 26 },
            { type: 'hide' }
          ]
        });

        // Beat 2.Noir's private warning.
        await runCard({
          id: 'chp_8_noir',
          title: 'Chapter 27',
          subtitle: 'The Court at the Gate · the Quiet Word',
          speaker: 'NOIR',
          palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show',      pose: 'assets/noir/body/casual1.png', wait: 700 },
            { type: 'line',      text: 'Weaver. Listen. The woman who sealed me is the woman who ate the five before you. She is not old magic. She is old hunger. Do not let her speak first.', hold: 3800, cps: 22 },
            { type: 'line',      text: 'I cannot reach you in the palace. Not yet. I will be at the seam where the dark meets the hall. If she tries to take you through me, she will find me awake. I have been practicing six centuries for that.', hold: 4200, cps: 22 },
            { type: 'flourish',  text: '\u25a0', duration: 1600 },
            { type: 'line',      text: 'Pick your champion. Pick on purpose. And know I am with you regardless of who stands in front.', hold: 3000, cps: 22 },
            { type: 'hide' }
          ]
        });

        // Beat 3.the cliffhanger. Hand off to The Weaver's Court.
        await runCard({
          id: 'chp_8_court',
          title: 'Chapter 27',
          subtitle: 'The Court at the Gate · To Be Continued',
          speaker: '',
          palette: { bg: '#060510', glow: '#d4c8ea', accent: '#f2eafa' },
          bg: 'assets/bg-world.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: 'Your court is assembled. Each of them has a line to speak. One of them will stand first when the queen arrives. You will choose who. Not because the others are less. Because you must pick whose voice she hears first.', hold: 3800, cps: 26 },
            { type: 'line',      text: 'The kingdom has been waiting for you to pick up the thread. Pick it up.', hold: 2800, cps: 26 },
            { type: 'particles', count: 24, duration: 2200 },
            { type: 'flourish',  text: '\u2726', duration: 1800 },
            { type: 'line',      text: 'The scene continues in the Weaver\u2019s Court. Open any character\u2019s route to enter it.', hold: 2800, cps: 28 },
            { type: 'line',      text: '... To be continued ...', hold: 2800, cps: 24 },
            { type: 'hide' }
          ]
        });

        // Mark the chapter done but do NOT write pp_finale_choice.
        // Character endings branch on their own per-route flags (v2 epilogues).
        // The Weaver's Court crossover (crossover-weavers-court.js) auto-fires
        // once this chapter is done, Weaver revealed, and 4+ characters met.
        markDone(8); setCurrent(9);
        if (onDone) onDone();
      }
    }
  ];

  const CHAPTER_COUNT = CHAPTERS.length;

  // ---------------------------------------------------------------
  function chapterById(id) { return CHAPTERS.find(c => c.id === id); }
  function currentChapter() { return chapterById(getCurrent()); }
  function indexOfId(id) { return CHAPTERS.findIndex(c => c.id === id); }
  function nextIdAfter(id) {
    const i = indexOfId(id);
    if (i < 0) return null;
    const next = CHAPTERS[i + 1];
    return next ? next.id : id + 1;  // +1 past end signals "all done"
  }
  function allDone() {
    // Every chapter in the array must have its done flag set.
    return CHAPTERS.every(c => isDone(c.id));
  }

  function playChapter(id, onDone) {
    const ch = chapterById(id);
    if (!ch || typeof ch.play !== 'function') return;
    // Kill the chapter list INSTANTLY (no fade) before the cinematic mounts.
    // The default closePage() runs a 420ms opacity fade; during that window
    // the mscard is fully visible on top, but the chp-page's character-
    // portrait thumbs (.chp-thumb) bleed through the mscard's semi-
    // transparent regions and appear as little "face pixel" pop-ins to
    // the player. Owner-reported visual bug. The fix is to remove the
    // chapter list synchronously here so there is zero overlap.
    closePage({ instant: true });
    // Detect bridges by id prefix. Bridges play out of chp-page taps too
    // (player advancing the story by tapping 'Begin' on the next bridge),
    // and after the bridge ends the bridge's own finish() fires the
    // route-open toast. Reopening chp-page underneath the toast clutters
    // the screen.owner reported the Elian toast appearing over chp-page.
    // For bridges, never reopen chp-page; the toast handles the next step.
    const isBridge = typeof id === 'string' && id.indexOf('b_') === 0;
    try {
      ch.play(() => {
        if (typeof onDone === 'function') {
          // External caller (e.g. PPChain.fireChapterFor) controls what
          // happens after the chapter.typically: clear chain-in-progress
          // and let the player land on the select grid.
          try { onDone(); } catch (_) {}
        } else if (!isBridge) {
          // Manual-replay path from the chapter menu.restore the menu.
          // Bridges skip this so the route-open toast lands on a clean
          // background.
          refreshOrb();
          openPageSoftly();
        } else {
          // Bridge tapped from chp-page.show the orb (so the player can
          // re-open the chapter list manually if they want), but don't
          // pop chp-page back over the toast.
          refreshOrb();
        }
      });
    } catch (_) {}
  }

  // ---------------------------------------------------------------
  // STYLES
  function injectStyles() {
    if (document.getElementById('chp-style')) return;
    const s = document.createElement('style');
    s.id = 'chp-style';
    s.textContent = `
      #${ORB_ID} {
        position: fixed; bottom: 18px; left: 18px;
        padding: 10px 14px; border-radius: 22px; border: 0;
        background: linear-gradient(180deg, rgba(245,200,240,0.95), rgba(200,140,230,0.95));
        color: #1a0a26; font-weight: 600; font-size: 13px; letter-spacing: 0.5px;
        box-shadow: 0 6px 16px rgba(100,40,140,0.4);
        cursor: pointer; z-index: 9800; opacity: 0;
        /* CRITICAL: when not .visible, do not receive taps. The orb
           occupies the bottom-left corner.same area as the Feed
           button during care. Without pointer-events:none, an
           invisible-but-tappable orb was catching Feed taps and
           opening the chapter list page. */
        pointer-events: none;
        transition: opacity 360ms ease, transform 220ms cubic-bezier(.2,.8,.2,1);
      }
      #${ORB_ID}.visible { opacity: 1; pointer-events: auto; }
      #${ORB_ID}:active { transform: scale(0.96); }
      #${ORB_ID}.pulse { animation: chpPulse 1.6s ease-in-out infinite; }
      @keyframes chpPulse {
        0%,100% { box-shadow: 0 6px 16px rgba(100,40,140,0.4); }
        50%     { box-shadow: 0 6px 22px rgba(230,120,200,0.85); }
      }

      #${PAGE_ID} {
        position: fixed; inset: 0; z-index: 10750;
        background: radial-gradient(ellipse at top, #1a1030 0%, #06040c 80%);
        display: flex; flex-direction: column;
        opacity: 0; transition: opacity 420ms ease;
      }
      #${PAGE_ID}.visible { opacity: 1; }
      #${PAGE_ID} .chp-head {
        padding: 18px 20px 6px; display: flex; align-items: center; justify-content: space-between;
        color: #f4e6ff;
      }
      #${PAGE_ID} .chp-title {
        font-size: 13px; letter-spacing: 4px; font-weight: 700; opacity: 0.85;
      }
      #${PAGE_ID} .chp-sub {
        font-size: 20px; font-weight: 700; margin-top: 2px;
      }
      #${PAGE_ID} .chp-close {
        background: rgba(255,255,255,0.08); color: #f4e6ff; border: 0; border-radius: 20px;
        padding: 6px 12px; font-size: 13px; cursor: pointer;
      }
      #${PAGE_ID} .chp-list {
        flex: 1; overflow-y: auto; padding: 8px 14px 30px;
        /* Hide the browser scrollbar.owner request, looks ugly against
           the dark Otome aesthetic. Scrolling still works (touch + wheel),
           the bar is just invisible. */
        scrollbar-width: none;        /* Firefox */
        -ms-overflow-style: none;     /* IE/legacy Edge */
      }
      #${PAGE_ID} .chp-list::-webkit-scrollbar { display: none; }  /* Chrome/Safari */
      #${PAGE_ID} .chp-card {
        display: flex; gap: 14px; padding: 14px 14px; border-radius: 16px;
        background: rgba(255,255,255,0.04); margin-bottom: 10px; align-items: center;
        transition: background 260ms ease, transform 240ms ease;
      }
      #${PAGE_ID} .chp-card.locked { opacity: 0.45; }
      #${PAGE_ID} .chp-card.current { background: linear-gradient(180deg, rgba(246,165,192,0.22), rgba(232,121,162,0.12)); box-shadow: 0 6px 20px rgba(232,121,162,0.25); }
      #${PAGE_ID} .chp-card.current .chp-play { background: linear-gradient(180deg,#f6a5c0,#e879a2); color: #22112a; }
      #${PAGE_ID} .chp-thumb {
        width: 54px; height: 54px; border-radius: 50%; object-fit: cover;
        background: #23143a; border: 2px solid rgba(255,255,255,0.1); flex-shrink: 0;
        display: flex; align-items: center; justify-content: center; color: #f4e6ff; font-weight: 700;
      }
      #${PAGE_ID} .chp-text { flex: 1; color: #f4e6ff; line-height: 1.3; min-width: 0; }
      #${PAGE_ID} .chp-text .c1 { font-size: 11px; letter-spacing: 2px; opacity: 0.6; }
      #${PAGE_ID} .chp-text .c2 { font-size: 15px; font-weight: 600; margin-top: 1px; }
      #${PAGE_ID} .chp-text .c3 { font-size: 12px; opacity: 0.72; margin-top: 4px; font-style: italic; line-height: 1.35; }
      #${PAGE_ID} .chp-play {
        background: rgba(255,255,255,0.08); color: #f4e6ff; border: 0; border-radius: 16px;
        padding: 9px 14px; font-weight: 700; font-size: 12px; cursor: pointer; white-space: nowrap;
        font-family: inherit;
      }
      #${PAGE_ID} .chp-close { font-family: inherit; }
      #${ORB_ID} { font-family: inherit; }
      #${PAGE_ID} .chp-play:disabled { opacity: 0.5; cursor: default; }
      #${PAGE_ID} .chp-intro {
        padding: 12px 18px 8px; color: rgba(244,230,255,0.65); font-size: 13px;
        font-style: italic; line-height: 1.45; text-align: center;
      }
    `;
    document.head.appendChild(s);
  }

  // ---------------------------------------------------------------
  // ORB (persistent button on character select)
  function ensureOrb() {
    let b = document.getElementById(ORB_ID);
    if (b) return b;
    injectStyles();
    b = document.createElement('button');
    b.id = ORB_ID;
    b.innerHTML = '\u2726 Main';
    b.addEventListener('click', openPage);
    document.body.appendChild(b);
    return b;
  }

  function refreshOrb() {
    const sel = document.getElementById('select-screen');
    // Use COMPUTED display to detect "actually visible", not just .hidden
    // class.chain transitions hide via display:none, not the class.
    const selCS = sel && window.getComputedStyle ? window.getComputedStyle(sel) : null;
    const onSelect = sel && !sel.classList.contains('hidden')
      && (!selCS || (selCS.display !== 'none' && selCS.visibility !== 'hidden'));
    // Hide orb whenever the game container is up (player is in care, not
    // browsing) so the floating "Main 4/22" badge doesn't clutter care UI.
    const game = document.getElementById('game-container');
    const gameCS = game && window.getComputedStyle ? window.getComputedStyle(game) : null;
    const inCare = game && !game.classList.contains('hidden')
      && (!gameCS || (gameCS.display !== 'none' && gameCS.visibility !== 'hidden'));
    const pageOpen = !!document.getElementById(PAGE_ID);
    const should = isEnabled() && onSelect && !inCare && !pageOpen;
    const orb = should ? ensureOrb() : document.getElementById(ORB_ID);
    if (!orb) return;
    if (should) {
      orb.classList.add('visible');
      const doneCount = CHAPTERS.filter(c => isDone(c.id)).length;
      const total = CHAPTER_COUNT;
      orb.innerHTML = '\u2726 Main <span style="opacity:0.7;font-weight:500;margin-left:4px;">' + doneCount + '/' + total + '</span>';
      const cur = getCurrent();
      if (cur < CHAPTER_COUNT && !isDone(cur)) orb.classList.add('pulse');
      else orb.classList.remove('pulse');
    } else {
      orb.classList.remove('visible');
    }
  }

  // ---------------------------------------------------------------
  // PAGE
  const CHAR_PORTRAIT = {
    alistair: 'assets/alistair/select-portrait.png',
    elian: 'assets/elian/select-portrait.png',
    lyra: 'assets/lyra/select-portrait.png',
    caspian: 'assets/caspian/select-portrait.png',
    lucien: 'assets/lucien/select-portrait.png',
    noir: 'assets/noir/select-portrait.png',
    proto: 'assets/proto/select-portrait.png'
  };

  function openPage() {
    if (document.getElementById(PAGE_ID)) return;
    injectStyles();
    const root = document.createElement('div');
    root.id = PAGE_ID;

    const head = document.createElement('div');
    head.className = 'chp-head';
    head.innerHTML = '<div><div class="chp-title">\u2726 MAIN STORY</div><div class="chp-sub">Aethermoor</div></div>';
    const close = document.createElement('button');
    close.className = 'chp-close';
    close.textContent = 'close';
    close.addEventListener('click', closePage);
    head.appendChild(close);
    root.appendChild(head);

    // Progress bar
    const doneCountAll = CHAPTERS.filter(c => isDone(c.id)).length;
    const progress = document.createElement('div');
    progress.style.cssText = 'padding: 0 20px 10px;';
    progress.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;color:rgba(244,230,255,0.6);font-size:11px;letter-spacing:2px;margin-bottom:6px;">'
      + '<span>' + doneCountAll + ' OF ' + CHAPTER_COUNT + '</span>'
      + (() => {
          // \u2500\u2500 ONGOING-STORY FRAMING (May 2026 owner direction) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
          // Owner: "main story have no ending, like Love and Deepspace."
          // Was: when allDone() \u2192 "FINALE CLEARED" (felt like a hard end).
          // Now: surface "more coming" so the player understands the
          // current arc closed but the world keeps going. Per-character
          // care endings (epilogues.js) still fire on their own \u2014 those
          // are the romance endings, which the owner wants to keep.
          if (allDone()) {
            return '<span style="opacity:0.85;color:#f6c4dd;letter-spacing:2px;">\u2726  MORE  COMING  \u2726</span>';
          }
          const nx = chapterById(getCurrent());
          const label = nx ? (nx.title + (nx.subtitle ? ' \u00b7 ' + nx.subtitle : '')) : 'NEXT';
          return '<span style="opacity:0.7;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + label + '</span>';
        })()
      + '</div>'
      + '<div style="height:4px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;">'
      + '<div style="height:100%;width:' + Math.round((doneCountAll / CHAPTER_COUNT) * 100) + '%;'
      +   'background:linear-gradient(90deg,#f6a5c0,#e879a2);border-radius:2px;transition:width 500ms ease;"></div>'
      + '</div>';
    root.appendChild(progress);

    const intro = document.createElement('div');
    intro.className = 'chp-intro';
    intro.textContent = 'Seven bonds to weave. Return here any time to continue.';
    root.appendChild(intro);

    const list = document.createElement('div');
    list.className = 'chp-list';
    const cur = getCurrent();
    const curIdx = indexOfId(cur);
    // Highest position of any done chapter. The unlock gate is based on this
    // (not on getCurrent's first-not-done) so that completing a later chapter
    // via the chain unlocks every earlier slot too. Without this, a player
    // who finishes Bridge Lucien (Ch14) by chain progression but never tapped
    // Arrival (Ch1) would see Ch12, Ch13, Ch15 stay locked forever even
    // though Ch14 already ran. Bug reported May 2026.
    let highestDoneIdx = -1;
    for (let i = 0; i < CHAPTERS.length; i++) {
      if (isDone(CHAPTERS[i].id)) highestDoneIdx = i;
    }
    // Maps each bridge entry id \u2192 the previous-character that must have
    // care-ready (affection 25 + full cycle) before the bridge unlocks.
    const BRIDGE_CARE_GATE = {
      b_elian: 'alistair', b_lyra: 'elian', b_caspian: 'lyra',
      b_lucien: 'caspian', b_noir: 'lucien', b_proto: 'noir'
    };

    CHAPTERS.forEach((ch, idx) => {
      const row = document.createElement('div');
      const done = isDone(ch.id);
      const isCurrent = ch.id === cur && !done;
      // "Locked" relative to the furthest progress the player has made.
      // Done chapters are NEVER locked (Replay must always work). The next
      // chapter after the highest done one is open. Anything beyond that
      // stays locked unless individually marked done.
      // Falls back to the legacy current-pointer gate only if NOTHING is
      // done yet (fresh save \u2014 keeps Prologue/Arrival as the first slot).
      const gateIdx = highestDoneIdx >= 0 ? highestDoneIdx + 1 : curIdx;
      const lockedByGate = gateIdx >= 0 ? idx > gateIdx : ch.id > cur;

      // Additional care-gate for bridge entries. Even if the chapter
      // pointer says a bridge is "current", it stays locked until the
      // PREVIOUS character's care is done. This is the same gate used
      // on the character-select grid.kept consistent so the chapter
      // menu doesn't allow a back-door past the tutorial.
      let lockedByCare = false;
      let careGateChar = null;
      if (typeof ch.id === 'string' && BRIDGE_CARE_GATE[ch.id]) {
        careGateChar = BRIDGE_CARE_GATE[ch.id];
        if (window.PPChain && window.PPChain.careReadyFor &&
            !window.PPChain.careReadyFor(careGateChar)) {
          lockedByCare = true;
        }
      }
      const locked = (lockedByGate || lockedByCare) && !done;
      row.className = 'chp-card' + (locked ? ' locked' : '') + (isCurrent ? ' current' : '');

      const thumb = document.createElement('div');
      thumb.className = 'chp-thumb';
      if (ch.charId && CHAR_PORTRAIT[ch.charId]) {
        const img = document.createElement('img');
        img.src = CHAR_PORTRAIT[ch.charId];
        img.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover;';
        img.onerror = () => { thumb.textContent = ch.charId[0].toUpperCase(); };
        thumb.appendChild(img);
      } else {
        // Glyph fallback for chapters with no character portrait. Numeric
        // ids show their number; named ids get a thematic glyph instead of
        // the raw id string (which previously rendered as e.g. "b_arrival").
        if (ch.id === 0) thumb.textContent = '\u2726';            // Prologue: 4-pointed star
        else if (ch.id === 8) thumb.textContent = '\u221e';       // Finale: infinity
        else if (ch.id === 'b_arrival') thumb.textContent = '\u263d'; // Arrival: crescent moon
        else if (typeof ch.id === 'number') thumb.textContent = String(ch.id);
        else thumb.textContent = '\u2727';                        // any other named chapter: open star
      }
      row.appendChild(thumb);

      // Lock reason text (used for inline label AND popup body)
      let lockReason = 'Complete the previous chapter first.';
      if (lockedByCare && careGateChar) {
        const NAME = careGateChar.charAt(0).toUpperCase() + careGateChar.slice(1);
        lockReason = 'Care for ' + NAME + ' first. Reach affection 25 and feed, wash, and talk to him at least once each.';
      }

      const text = document.createElement('div');
      text.className = 'chp-text';
      text.innerHTML =
        `<div class="c1">${ch.title}${done ? ' \u00b7 \u2713' : ''}</div>` +
        `<div class="c2">${locked ? '(locked)' : ch.subtitle}</div>`;
      // Teaser line removed at owner's request \u2014 was visually noisy.
      // Locked-chapter unlock instructions still surface via the
      // lock-popup that fires when a player taps a locked card.
      row.appendChild(text);

      const btn = document.createElement('button');
      btn.className = 'chp-play';
      btn.textContent = done ? 'Replay' : ((isCurrent && !locked) ? 'Begin' : 'Locked');
      // Tappable even when locked.opens a warning popup explaining why.
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (locked) {
          if (window.PPChain && window.PPChain.showLockPopup) {
            window.PPChain.showLockPopup({
              title: ch.title + (ch.subtitle ? ' · ' + ch.subtitle : ''),
              reason: lockReason
            });
          }
          return;
        }
        playChapter(ch.id);
      });
      row.appendChild(btn);

      list.appendChild(row);
    });
    // ── ONGOING-STORY PILL (May 2026) ──────────────────────────────
    // When the player has finished every authored chapter, show a soft
    // "to be continued" card at the bottom of the list. Communicates
    // that more is coming without declaring a finale.
    if (allDone()) {
      const tbc = document.createElement('div');
      tbc.style.cssText = [
        'margin: 16px 12px 8px',
        'padding: 18px 14px',
        'border-radius: 14px',
        'background: linear-gradient(180deg, rgba(60,30,80,0.55), rgba(30,16,48,0.75))',
        'border: 1px dashed rgba(240,180,220,0.30)',
        'text-align: center',
        'color: #f4e6ff',
        'font-size: 13px',
        'line-height: 1.6',
        'letter-spacing: 0.4px'
      ].join(';');
      tbc.innerHTML = ''
        + '<div style="font-size:11px;letter-spacing:2px;opacity:0.7;margin-bottom:8px;color:#f6c4dd;">'
        +   '✦  TO  BE  CONTINUED  ✦'
        + '</div>'
        + '<div style="font-style:italic;opacity:0.85;">'
        +   'The kingdom holds, for now. The next chapter is being written. Keep caring; they will be here when it lands.'
        + '</div>';
      list.appendChild(tbc);
    }
    root.appendChild(list);

    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('visible'));
    // Hide the orb while page is open
    const orb = document.getElementById(ORB_ID); if (orb) orb.classList.remove('visible');

    // Auto-scroll the next-up chapter into view so the player doesn't
    // have to scroll a long list to find what to play. Done in a frame
    // after mount + visible class so the page has time to lay out.
    requestAnimationFrame(() => {
      setTimeout(() => {
        const currentRow = root.querySelector('.chp-card.current');
        if (currentRow && typeof currentRow.scrollIntoView === 'function') {
          try {
            currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch (_) {
            // Older browsers.fallback to no-options form
            currentRow.scrollIntoView();
          }
        }
      }, 220);
    });
  }

  function closePage(opts) {
    const root = document.getElementById(PAGE_ID);
    if (!root) return;
    const instant = opts && opts.instant === true;
    // Fallback chain.same logic regardless of fade vs instant. Pulled
    // into a closure so both paths use it.
    const finalize = () => {
      try { root.remove(); } catch (_) {}
      // If closing this page would leave the screen blank (title hidden,
      // game container hidden, select hidden).fall back to character
      // select so the player always lands somewhere usable.
      const title = document.getElementById('title-screen');
      const select = document.getElementById('select-screen');
      const game = document.getElementById('game-container');
      const titleVisible = title && !title.classList.contains('hidden');
      const gameVisible  = game  && !game.classList.contains('hidden');
      const selectHidden = select && select.classList.contains('hidden');
      if (!titleVisible && !gameVisible && selectHidden) {
        select.classList.remove('hidden');
      }
      refreshOrb();
    };
    if (instant) {
      // Disable the opacity transition for this teardown so we don't
      // get a 420ms fade where the .chp-thumb portrait circles bleed
      // through the mscard. Element is also set display:none in case
      // any layout pass briefly references it.
      root.style.transition = 'none';
      root.style.opacity = '0';
      root.style.display = 'none';
      root.classList.remove('visible');
      finalize();
      return;
    }
    root.classList.remove('visible');
    setTimeout(finalize, 440);
  }

  function openPageSoftly() { setTimeout(openPage, 300); }

  // ---------------------------------------------------------------
  // BOOT
  function boot() {
    if (!isEnabled()) return;
    injectStyles();

    // Migration for existing saves: if ARRIVAL bridge has been played but
    // PROLOGUE chapter (id 0) was never marked done, mark it now. Arrival
    // covers the same narrative ground.PROLOGUE shouldn't keep showing
    // up as the "current" entry in the menu after the player has already
    // walked through arrival in the new flow.
    try {
      if (localStorage.getItem('pp_chapter_done_b_arrival') === '1' &&
          localStorage.getItem('pp_chapter_done_0') !== '1') {
        localStorage.setItem('pp_chapter_done_0', '1');
      }
    } catch (_) {}

    // Watch for character select visibility to show orb.
    // Gated on PPAmbient.tickAllowed() so the poll skips when the tab is
    // hidden or a scene/modal is up — the orb wouldn't be visible in either
    // case anyway, so the DOM queries are pure waste. Saves ~67 ticks/min
    // on backgrounded tabs (mobile battery win).
    function orbTick() {
      try {
        if (window.PPAmbient && typeof window.PPAmbient.tickAllowed === 'function'
            && !window.PPAmbient.tickAllowed()) return;
      } catch (_) { /* coordinator missing — fall through */ }
      refreshOrb();
    }
    setInterval(orbTick, 900);
    refreshOrb();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.MSChapters = {
    isEnabled,
    list: () => CHAPTERS.map(c => ({id: c.id, title: c.title, subtitle: c.subtitle, charId: c.charId, done: isDone(c.id), current: c.id === getCurrent() })),
    current: getCurrent,
    play: playChapter,
    open: openPage,
    close: closePage,
    _debug_reset: () => {
      try {
        Object.keys(localStorage).filter(k => k.startsWith('pp_chapter_')).forEach(k => localStorage.removeItem(k));
      } catch (_) {}
    }
  };
})();


// =============================================================================
// MAIN-STORY BRIDGES — consolidated into chapters.js (May 2026, owner request)
// =============================================================================
// These IIFEs were originally in standalone files (bridge-alistair.js,
// bridge-elian.js, bridge-lyra.js, bridge-caspian.js, bridge-lucien.js,
// bridge-noir.js, bridge-proto.js). They were merged here so every
// main-story scene lives in one file — easier to audit and edit. The
// bridge stub entries above (b_alistair, b_elian, b_lyra, b_caspian,
// b_lucien, b_noir, b_proto) call window.PPBridge<Name>.play() — those
// globals are still registered exactly the same way, just below.
//
// Each bridge:
//   - Has its own BEATS array (scene content)
//   - Compiles via window.PPBridgeCompile.toMSCard (defined in world-arrival.js)
//   - Renders via window.MSCard.show (defined in premium-card.js)
//   - Sets pp_chapter_done_b_<id> + per-character flags on finish
//   - Advances PPChain (prologue-chain.js)
//
// Order = chain order (matches main-story page progression):
//   1. Alistair  (chain step 1, Chapter 2)
//   2. Elian     (chain step 2, Chapter 5)
//   3. Lyra      (chain step 3, Chapter 7)
//   4. Caspian   (chain step 4, Chapter 9)
//   5. Lucien    (chain step 5, Chapter 14)
//   6. Noir      (chain step 6, Chapter 18)
//   7. Proto     (chain step 7, Chapter 20)
// =============================================================================


/* ── BRIDGE 1: ALISTAIR — chain step 1, Chapter 2 ──────────────────────── */
/* Captain on solo dawn patrol finds her unconscious in the south wood.
 * Maid's chamber chosen so the chamberlain doesn't ask. Wake. Cup of water.
 * Closes on: "Friend, or foe." (cliffhang — owner-led story-pass v486.)
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

  // ═══════════════════════════════════════════════════════════════════════
  // STORY-PASS REWRITE v486 — manhwa pacing pass, owner-led editorial.
  // Tightened from ~22 to ~18 beats. Cuts redundant restating-narration,
  // adds an Eira-POV interior beat (her first one), gives Alistair a
  // "friend or foe" hook to leave the player wondering. Em-dash-free per
  // standing rule. Specific changes from the previous version:
  //   1. Open: kneel + lift compressed into 2 beats with a lingering-look
  //      moment (manhwa "spice" beat — owner request).
  //   2. The "He memorises and writes it down later" telegraph cut.
  //      Replaced with "He hears it. He says nothing." — preserves the
  //      mystery for later payoff.
  //   3. Drift sequence compressed (4 beats → 1) + ellipsis transition.
  //   4. NEW Eira-POV interior beat after wake — first time her mind is
  //      the camera. Establishes the page-in-sleeve as her stake before
  //      he speaks.
  //   5. Slowly-drink-first line tightened, lingering-eye narration moved
  //      to its own beat for the promise-look moment.
  //   6. "He says it like a fact" restating narration cut. Replaced with
  //      a new "Friend, or foe" hook line from Alistair.
  //   7. Heart-beats-faster moment added to the "covered for you" beat.
  //   8. Closer reworded: "since the forest" + new "only clue you have"
  //      framing makes the page feel like Eira's secret possession.
  // ═══════════════════════════════════════════════════════════════════════
  const BEATS = [
    // 1. Open — silhouette + first touch.
    { kind: 'narration', text: 'A silhouette kneels beside you. Your eyes are blurred, weak for reasons you cannot name. You lie still. His fingertips trace slowly along the side of your neck. Gentle. Searching. He finds your pulse before he finds your face.' },
    // 2. The lingering look + the lift. (Manhwa spice beat.)
    { kind: 'narration', text: 'He stills. For a long moment, he only looks at you. Then his hands slide under your shoulders and lift you the way a man lifts something he intends to keep alive.', portrait: PORTRAITS.standing },
    // 3. First voiced line.
    { kind: 'line', speaker: 'KNIGHT', text: 'Stay with me, miss. Eyes open if you can. The south gate is close by. I will not lose you between here and there.', portrait: PORTRAITS.standing },
    // 4. The drift. She says a word.
    { kind: 'narration', text: 'You drift. The horse moves under you. Somewhere inside the drift, you say a word. A name, in a language that is not the language of this place. You do not remember saying it.', portrait: PORTRAITS.standing },
    // 5. He hears it. (Mystery preserved — no telegraph that he writes
    //    it down. He notices and says nothing.)
    { kind: 'narration', text: 'He hears it. He says nothing.', portrait: PORTRAITS.standing },
    // 6. Drift longer. Compressed sequence.
    { kind: 'narration', text: 'The ride is getting longer. You start to drift, warm and safe in his arms.', portrait: PORTRAITS.standing },
    // 7. Transition. (Engine pattern: ellipsis narration. A true black-
    //    screen transition would require a new beat-type in MSCard;
    //    holding for a follow-up code change if owner wants stronger.)
    { kind: 'narration', text: '...', portrait: PORTRAITS.standing },
    // 8. Wake — new room, new man.
    { kind: 'narration', text: 'You wake in a small stone room. A narrow window catches a glimmer of sun. The linen under your hand is too clean for an inn. A man stands by the door. Plate armor, the gear of a senior officer. Arms crossed. Watching you stir.', portrait: PORTRAITS.standing },
    // 9. NEW Eira-POV interior beat. First time her mind is the camera.
    //    Establishes the page as her stake before he speaks.
    { kind: 'narration', text: '*You are confused. You do not know this room. You do not know this man. Discreetly, your fingertips brush the lining of your sleeve. The page is still there.*', portrait: PORTRAITS.standing },
    // 10. He confirms time + protective stance.
    { kind: 'line', speaker: 'KNIGHT', text: 'You have been asleep for one full day. I have been here. You are safe. When you can sit up, I will get you water. Not before.', portrait: PORTRAITS.standing },
    // 11. Player line — small question. Stage direction trimmed.
    { kind: 'line', speaker: 'YOU', text: 'Where… am I?', portrait: PORTRAITS.standing },
    // 12. Half-step-closer answer.
    { kind: 'line', speaker: 'KNIGHT', text: 'A small room nobody asks about. The longer answer can wait until you have water in you. *Takes half a step closer, no more, hands still behind his back.*', portrait: PORTRAITS.standing },
    // 13. Sits up too fast. He braces.
    { kind: 'narration', text: 'You sit up too fast. The room tilts. He is there before you tip over, one hand under your shoulder, one against the wall behind your head. Bracing the world for you.', portrait: PORTRAITS.talking },
    // 14. Drink first. Promise.
    { kind: 'line', speaker: 'KNIGHT', text: 'Slowly. Drink first. There is no rush. No harm will come to you here. Not while I am by your side.', portrait: PORTRAITS.talking },
    // 15. The promise-look. (Pulled out of the line so it lands as the
    //     narrator's observation of him, not his self-narration.)
    { kind: 'narration', text: 'He looks straight into your eyes. The way a knight makes a promise.', portrait: PORTRAITS.talking },
    // 16. Maid's chamber realisation.
    { kind: 'narration', text: 'He passes you a cup of water. The cup is plain. The room is plain. You realise, looking past him at the corridor, that this is a maid’s chamber. Servants’ wing. The kind of room nobody asks about.', portrait: PORTRAITS.talking },
    // 17. He explains the cover.
    { kind: 'line', speaker: 'KNIGHT', text: 'I should have taken you to the chamberlain. He will want a name and a province and three documents you cannot give him. So you are here instead. I will explain it later. To him. Not to you.', portrait: PORTRAITS.softer },
    // 18. Heart-beats-faster moment. Eira's interior question added.
    { kind: 'narration', text: 'He covered for you before he knew your name. Your heart beats faster. *What just happened to you?*', portrait: PORTRAITS.softer },
    // 19. Names himself. (The "I am Alistair" beat — kept verbatim.)
    { kind: 'line', speaker: 'ALISTAIR', text: 'I am Alistair. Captain of the Guard, south gate. While you mend, I am the only person who knows you are in this castle. That will not always be true. Today it is.', portrait: PORTRAITS.softer },
    // 20. Friend-or-foe hook. (Replaces the cut "He says it like a fact"
    //     restating-narration AND the previous "I will not ask you what
    //     you are. Not yet" line — owner asked to remove the latter as
    //     this new line carries the same emotional work plus a cliffhang.)
    { kind: 'line', speaker: 'ALISTAIR', text: 'Rest. I can see you have many more questions. Keep them to yourself for now. As for me… we will see, in time, what I am to you. Friend, or foe.', portrait: PORTRAITS.softer },
    // 21. Player nod. Owner-rewritten — was a YOU-line stage direction;
    //     now a brief narration. The smallest acknowledgment.
    { kind: 'narration', text: 'You give a small nod. He accepts.', portrait: PORTRAITS.softer },
    // 22. Closer — torn-page arc, owner-rewritten.
    //     "since the forest" callback to the bridge open.
    //     New "only clue you have" framing makes the page feel like
    //     Eira's secret possession, not just a kingdom mystery.
    { kind: 'narration', text: 'Later, when his footsteps have gone down the corridor to make his report, you take the page from the lining of your sleeve for the first time since the forest. You unfold it. The symbol is the same. You sit with it in the candlelight for the breadth of one watch-bell. You fold it smaller than before, hidden in the same place. Hoping no one will take away the only clue you have.', portrait: PORTRAITS.softer }
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
        title: 'Chapter 2 - Alistair',
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
    if (lsGet('pp_main_story_enabled') !== '1') lsSet('pp_main_story_enabled', '1');
    try { localStorage.setItem('pp_chapter_done_b_alistair', '1'); } catch (_) {}

    const stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
      ? window.PPChain.step() : 0;
    if (window.PPChain && typeof window.PPChain.advance === 'function') {
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


/* ── BRIDGE 2: ELIAN — chain step 2, Chapter 5 ─────────────────────────── */
/* Days into the maid's chamber. She slips the kitchen postern. Smoke at the
 * treeline. A man sharpening a knife at a fire who does not get up. He
 * bandages her foot before he asks the question. Cold to Soul Weavers, not
 * to her — he has buried two.
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
    { kind: 'narration', text: 'You smell smoke. Not a fire smoke. A careful smoke. Old wood, slow to burn. You follow it through brambles you cannot see in the dark.' },
    { kind: 'narration', text: 'A clearing. A fire. A man on a fallen log, a knife laid across his knee, a whetstone moving in slow patient strokes. He does not look up when you step into the light.', portrait: PORTRAITS.weathered },
    { kind: 'line', speaker: 'THE MAN', text: 'You are bleeding. Sit down before you fall down. The log to your left.', portrait: PORTRAITS.weathered },
    // (Player-voiced beat — Chapter 5 pilot.)
    { kind: 'line', speaker: 'YOU', text: '*You do not yet move. Your foot is throbbing through the cloth someone wrapped for you. The fire is between you and him*. ...who are you?', portrait: PORTRAITS.weathered },
    { kind: 'line', speaker: 'THE MAN', text: 'Stranger to you. I do not yet know what to call you either. Sit. The bleeding will not wait while we introduce ourselves.', portrait: PORTRAITS.weathered },
    { kind: 'narration', text: 'He says it without warmth. The way you would say it to any wounded animal that had wandered into your camp.', portrait: PORTRAITS.weathered },
    { kind: 'narration', text: 'You sit. He keeps sharpening. Three more passes of the stone, unhurried. Only then does he set the knife aside and reach for a strip of clean linen and a small clay jar.', portrait: PORTRAITS.guarded },
    { kind: 'line', speaker: 'THE MAN', text: 'Foot. Off. I will not ask twice.', portrait: PORTRAITS.guarded },
    { kind: 'narration', text: 'He cleans the cut. His hands are steady, calloused, careful. He is faster and gentler than the castle physicians. He has done this on himself too many times.', portrait: PORTRAITS.tracking },
    // (Slow-burn Ch5 fingertip beat — torn-page arc. Her sleeve falls back
    //  enough that the firelight catches the small folded paper inside the
    //  lining. He sees it. He does not look up. He files the moment.)
    { kind: 'narration', text: 'When he ties off the bandage, your sleeve falls back the smallest distance. Something small and folded catches the firelight from inside the lining. It is the page. He sees it. He does not look up. He files the moment the way he files everything. He does not ask.', portrait: PORTRAITS.tracking },
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
    { kind: 'narration', text: 'For the first time in three days, something in your chest unclenches. He notices. His face does not move. But something behind his eyes closes, like a man stepping back from a fire he meant to admire only briefly.', portrait: PORTRAITS.warm },
    { kind: 'line', speaker: 'ELIAN', text: 'Sleep here tonight. The fire will hold. I will sit. In the morning I will set you on the south coast road. There is someone there who knows what people like you are. I do not.', portrait: PORTRAITS.warm },
    { kind: 'line', speaker: 'ELIAN', text: 'Do not fall in love with me, miss. I have buried two of you already. I do not have a third in me.', portrait: PORTRAITS.guarded },
    { kind: 'narration', text: 'He says it like a fact. Like he has rehearsed it. Like he is warning himself, not you.', portrait: PORTRAITS.guarded },
    { kind: 'narration', text: 'You sleep by the fire. You do not dream. When you wake, he is already up, already packed, already not looking at you.', portrait: PORTRAITS.guarded },
    { kind: 'narration', text: 'In the morning you walk the south coast road. The dried venison is in your hand. The map is in your other. The fire behind you stays lit, though he does not say so. You will know how to find it again.', portrait: PORTRAITS.warm }
  ];

  let _playing = false;
  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }

  function play() {
    if (_playing) return Promise.resolve();
    if (!window.MSCard || !window.PPBridgeCompile) return Promise.resolve();
    _playing = true;
    if (window.PPChain && window.PPChain.setChainInProgress) window.PPChain.setChainInProgress(true);

    // Read armed/unarmed departure choice from Ch 4 — splice in a noticing
    // beat at the bandaging moment. Backward-compatible: no choice = no insert.
    const beats = BEATS.slice();
    try {
      const dep = lsGet('pp_ms_departure_choice');
      if (dep === 'armed' || dep === 'unarmed') {
        const insertAt = beats.findIndex(b => b.text === 'Foot. Off. I will not ask twice.');
        if (insertAt >= 0) {
          const note = (dep === 'armed')
            ? 'He clocks the kitchen knife at your belt without looking up. He does not ask if you can use it. He sees that you cannot. He files it away as a thing he might one day teach you, if there is time.'
            : 'He clocks the empty space at your belt without looking up. He does not ask why you walked into the wood without a knife. He sees you decided a blade in your hand would not save you here. He files that decision away as a thing he might one day learn from.';
          beats.splice(insertAt + 1, 0, { kind: 'narration', text: note, portrait: PORTRAITS.tracking });
        }
      }
    } catch (_) {}

    return new Promise((resolve) => {
      const card = {
        id: 'b_elian',
        title: 'Chapter 5 - Elian',
        subtitle: 'Smoke at the Treeline',
        speaker: '',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: window.PPBridgeCompile.toMSCard(beats, { firstWait: 700 })
      };
      window.MSCard.show(card, () => { finish(); resolve(); });
    });
  }

  function finish() {
    _playing = false;
    try { localStorage.setItem('pp_chapter_done_b_elian', '1'); } catch (_) {}

    const stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
      ? window.PPChain.step() : 0;
    if (window.PPChain && typeof window.PPChain.advance === 'function') {
      const advanced = window.PPChain.advance(2);
      const fireChapter = () => {
        if (stepBefore < 2 && typeof window.PPChain.fireChapterFor === 'function') {
          window.PPChain.fireChapterFor(2);
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

  window.PPBridgeElian = { play: play };
})();


/* ── BRIDGE 3: LYRA — chain step 3, Chapter 7 ──────────────────────────── */
/* Elian gave a birch-bark map. The cliff road. First sea. The cave-mouth.
 * Lyra barefoot in the surf, smiling like she has been expecting a friend.
 * The first character who NAMES the word "Weaver."
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
    { kind: 'narration', text: 'The cliff ends. The road ends. There is a path of black stone steps cut into the cliff face. Below, a beach the colour of ash, and a cave-mouth open to the sea like a held breath.' },
    { kind: 'narration', text: 'A woman is standing barefoot in the surf. She is leaning on a staff that has a salt crystal at the top. The wind is pulling her hair behind her like a banner. She has not turned to look at you.', portrait: PORTRAITS.eyesclosed },
    { kind: 'narration', text: 'You step down to the sand. The sand is cold. She turns. She is younger than you expected. She is smiling like she already loves you.', portrait: PORTRAITS.casual },
    { kind: 'line', speaker: 'THE WOMAN', text: 'You took two days. The cave told me you would take three. I owe the cave a song.', portrait: PORTRAITS.casual },
    // (Player-voiced beat — Chapter 7 pilot.)
    { kind: 'line', speaker: 'YOU', text: '*Your hand half-rises before you remember you have nothing to defend yourself with, and that the woodsman’s map has just brought you exactly here. The wind is loud against the cliff*. ...you knew I was coming?', portrait: PORTRAITS.casual },
    { kind: 'line', speaker: 'THE WOMAN', text: 'The cave knew. The cave is annoyingly accurate about that sort of thing. *Small, warm smile*. I have been very patient with it.', portrait: PORTRAITS.casual },
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
    { kind: 'narration', text: 'She holds your eyes a beat too long. The smile does not leave her face. Something behind it briefly ages. The cave-mouth is old enough to remember the other six. Lyra, you realize, is too.', portrait: PORTRAITS.eyesclosed },
    // (Slow-burn Ch7 fingertip beat — torn-page arc. Lyra notices the wrist
    //  gesture, not the page itself. She is the kind to read what a person
    //  is carrying without being told. She does not ask, in this beat.)
    { kind: 'narration', text: 'She does not look at the page hidden in your sleeve. She does not have to. She looks at the way your hand goes to your wrist when you do not know your hand is doing it. She tilts her head, just slightly. She does not ask. The cave hums one note.', portrait: PORTRAITS.eyesclosed },
    { kind: 'line', speaker: 'LYRA', text: 'I will not lie to you tonight. The other six were also welcomed by a singer at this cave. The singers were also glad. The singers also outlived them. That is the part of the song I will not sing for you yet. I will sing it for you when you are ready to hear it. Tonight you eat broth.', portrait: PORTRAITS.eyesclosed },
    { kind: 'narration', text: 'She turns back to the fire. She does not say it sadly. She says it like a woman who long ago decided that sadness was a poor companion to good broth. But you have heard it now. The under-song. You will hear it under everything she says, from now on.', portrait: PORTRAITS.casual },
    { kind: 'narration', text: 'She says it like she is telling you a kind story. She is the first person in this world who has told you the truth. You will not forget who told you first.', portrait: PORTRAITS.happy },
    { kind: 'narration', text: 'That night the cave makes a place for you. The wall is warm. The water is close. She hums until you stop hearing her, then keeps humming. The cave will be here tomorrow. So will she. Neither of them is going anywhere without the other.', portrait: PORTRAITS.happy }
  ];

  let _playing = false;

  function play() {
    if (_playing) return Promise.resolve();
    if (!window.MSCard || !window.PPBridgeCompile) return Promise.resolve();
    _playing = true;
    if (window.PPChain && window.PPChain.setChainInProgress) window.PPChain.setChainInProgress(true);
    return new Promise((resolve) => {
      const card = {
        id: 'b_lyra',
        title: 'Chapter 7 - Lyra',
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
    try { localStorage.setItem('pp_chapter_done_b_lyra', '1'); } catch (_) {}

    const stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
      ? window.PPChain.step() : 0;
    if (window.PPChain && typeof window.PPChain.advance === 'function') {
      const advanced = window.PPChain.advance(3);
      const fireChapter = () => {
        if (stepBefore < 3 && typeof window.PPChain.fireChapterFor === 'function') {
          window.PPChain.fireChapterFor(3);
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

  window.PPBridgeLyra = { play: play };
})();


/* ── BRIDGE 4: CASPIAN — chain step 4, Chapter 9 ───────────────────────── */
/* Alistair's guilt. He goes to the prince, not the queen. The locked study
 * door. The royal carriage. The court reception in silk. Caspian's private
 * word: "I am terrified of you. I am also glad you are here."
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
    { kind: 'line', speaker: 'ALISTAIR', text: 'Your Highness. I have lost a stranger in my care. She is... not from here. I think she is what the scholars used to write about. I think she is the seventh.', portrait: PORTRAITS.formal },
    { kind: 'narration', text: 'The Prince does not move for a long moment. Then he locks the study door. Then he puts his hand flat on the desk and breathes in once, slowly, like a man steadying his own pulse.', portrait: PORTRAITS.reading },
    { kind: 'line', speaker: 'CASPIAN', text: 'You came to me. Not to my mother.', portrait: PORTRAITS.reading },
    { kind: 'line', speaker: 'ALISTAIR', text: 'I came to the only person in this castle who would keep her alive instead of containing her.', portrait: PORTRAITS.formal },
    { kind: 'narration', text: 'The Prince does not thank him. The Prince writes a note in his own hand and sends it down the back stair to the tower. An hour later the answer comes back from the scholar: south coast, the singing-stone cave, with the witch.', portrait: PORTRAITS.reading },
    { kind: 'narration', text: 'Kings do not write their own letters. Princes write fewer than one a year. The Prince writes this one. He uses the small seal, not the great one.', portrait: PORTRAITS.tender },
    { kind: 'line', speaker: 'CASPIAN', text: 'She is to be a guest of the Crown. Not a maid. Not a stranger. Have my own carriage prepared. I will go myself.', portrait: PORTRAITS.tender },
    { kind: 'narration', text: 'The carriage rolls to the coast at dawn. Alistair rides escort. Two guards. No banner. The kingdom does not need to know yet.', portrait: PORTRAITS.tender },
    { kind: 'narration', text: 'On the beach, the Prince climbs out of the carriage in plain travelling cloth. He bows to the witch. The witch does not bow back. The witch winks at you.', portrait: PORTRAITS.gentle },
    { kind: 'line', speaker: 'CASPIAN', text: 'My lady. Forgive the intrusion on what was, in its way, your peace. The captain has told me what he believes you are. The scholar has told me what he can confirm. I would like you under my roof again. As a guest. With a name and a chamber and a cup of tea that is not slid under a door.', portrait: PORTRAITS.gentle },
    // (Player-voiced beat — Chapter 9 pilot.)
    { kind: 'line', speaker: 'YOU', text: '*The silk in the chamber that was set aside for you back at the castle suddenly weighs a great deal more. Lyra’s hand has not left your shoulder*. Why did you come yourself?', portrait: PORTRAITS.gentle },
    { kind: 'line', speaker: 'CASPIAN', text: 'Because the captain came to me first instead of my mother. That deserved a return errand done properly. *A small, deliberate bow*. Forgive the manners. They are how I think when I am tired.', portrait: PORTRAITS.tender },
    { kind: 'line', speaker: 'CASPIAN', text: 'You may say no. If you say no I will leave a guard at this beach and ride back alone. If you say yes I will not let any harm come to you that I can see coming.', portrait: PORTRAITS.tender },
    { kind: 'narration', text: 'It is the first time anyone has asked you anything since you woke in the moss.', portrait: PORTRAITS.tender },
    { kind: 'narration', text: 'Lyra puts her hand on your shoulder. She does not push. She just stands there, warm, salt-smelling, ready to walk you back into a cave if you say no.', portrait: PORTRAITS.tender },
    { kind: 'narration', text: 'You say yes.', portrait: PORTRAITS.gentle },
    { kind: 'narration', text: 'The carriage carries you back through the cliff road, past the wood, past the south gate. By dusk you are in a chamber that is not a maid’s chamber. The chamber is east-facing. There is a fire. There is silk laid out for tomorrow’s reception.', portrait: PORTRAITS.gentle },
    { kind: 'narration', text: 'Tomorrow at noon the Prince will present you to the small court. The Queen will be informed but not present. That is a courtesy he has bought you.', portrait: PORTRAITS.gentle },
    { kind: 'narration', text: 'You walk into the reception in the silk. The court is small. Eight nobles, the chamberlain, two scribes, the captain by the door. The captain looks up.', portrait: PORTRAITS.formal },
    { kind: 'narration', text: 'Alistair sees you in silk. He has never seen you in silk. He goes very quiet. He keeps his face exactly the way he is supposed to keep his face. Something in his hand twitches once.', portrait: PORTRAITS.formal },
    { kind: 'narration', text: 'The Prince notices. The chamberlain notices. You notice.', portrait: PORTRAITS.formal },
    { kind: 'line', speaker: 'CASPIAN', text: 'Forgive me. Before the formal address. I owe you a private word.', portrait: PORTRAITS.gentle },
    { kind: 'narration', text: 'He takes you aside. Just three steps. He bows his head. Princes do not bow. He bows his head to you. The court watches and pretends not to.', portrait: PORTRAITS.tender },
    { kind: 'line', speaker: 'CASPIAN', text: 'I am terrified of you. I am also glad you are here. I would like the second to be larger than the first. I am working on it.', portrait: PORTRAITS.tender },
    { kind: 'narration', text: 'In a court of people pretending nothing is happening, the prince is the only one telling you he is afraid.', portrait: PORTRAITS.tender },
    // (Slow-burn Ch9 active beat — torn-page arc. First active step. She is
    //  a guest of the Crown now, has access. She tries the royal library at
    //  night. The entry has been removed. Pages cut clean. Someone got there
    //  first. This shifts the arc from passive (carrying) to active
    //  (investigating).)
    { kind: 'narration', text: 'That night, when the candle in your chamber is low and the corridor is quiet, you walk to the royal library. Three guards do not stop you. The Weaver is a guest of the Crown. The shelves are vast. You find the histories. You find the bestiaries. You find the indexes. Where the entry should be, you find a torn edge. Pages have been removed. The cut is clean. Recent. Someone got here first. You do not yet know whom. You suspect the kingdom is small enough that you will.', portrait: PORTRAITS.tender },
    { kind: 'narration', text: 'That night your chamber is quiet. There is a cup of tea by the fire that you did not ask for. Tomorrow there will be another. The prince will not announce it. He never does.', portrait: PORTRAITS.gentle }
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
        title: 'Chapter 9 - Caspian',
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
    try { localStorage.setItem('pp_chapter_done_b_caspian', '1'); } catch (_) {}

    const stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
      ? window.PPChain.step() : 0;
    if (window.PPChain && typeof window.PPChain.advance === 'function') {
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


/* ── BRIDGE 5: LUCIEN — chain step 5, Chapter 14 ───────────────────────── */
/* Alistair appointed personal guard. The dome from her window for two days.
 * The third afternoon she loses him on purpose. The book wedged in the door.
 * "Six years. Please. Sit. Touch any book. The door is behind me."
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
    // (Slow-burn Ch14 sighting beat — torn-page arc. Reframes the cage-test
    //  line as motivated, not whim: she is at this tower because the royal
    //  library failed her and the dowager wing is where the trail led. She
    //  passes Aenor's sealed door and sees the same branches-and-moon mark.
    //  This is the moment her private investigation becomes urgent.)
    { kind: 'narration', text: 'You did not lose him by accident. You lost him on purpose. The royal library has been picked clean of you, and the trail you have been quietly walking has only one stop left.' },
    { kind: 'narration', text: 'On your way to the gardener’s gap you pass the dowager wing. The doors are sealed. The seal pressed in dark wax against the pale wood is two crossed branches and a moon. You stop. You look. Your hand goes to your sleeve before you decide to move it. The page in there could have been pressed by the same hand. You walk on. You walk faster. You did not climb this hill on a whim. You climbed it on evidence.' },
    { kind: 'narration', text: 'The tower door is not locked. The tower door is wedged open with a book. You push it.' },
    { kind: 'narration', text: 'A spiral stair. Books in stacks against the wall on every step. The smell of ink and dust and something metallic, silver maybe, in the air. You climb.' },
    { kind: 'narration', text: 'A circular room at the top. Glass dome above. A telescope on a brass mount in the centre. Charts pinned to every wall. A tall man at a desk by the south window, hands open over a page, very still.', portrait: PORTRAITS.casual },
    { kind: 'narration', text: 'He turns. He does not seem surprised. He seems relieved, almost. Like a man who has been waiting a long time and has just heard the door.', portrait: PORTRAITS.curious },
    { kind: 'line', speaker: 'THE SCHOLAR', text: 'Ah. There you are. I am sorry, that came out as if I were expecting you. I was expecting you. Six years, give or take. Please. Sit. Touch any book. I will not detain you. The door is behind me. I will move when you ask.', portrait: PORTRAITS.curious },
    // (Player-voiced beat — Chapter 14 pilot.)
    { kind: 'line', speaker: 'YOU', text: '*Your hand stays on the doorframe. The smell of ink and old paper. Six years feels like a long time to expect anyone*. ...six years?', portrait: PORTRAITS.curious },
    { kind: 'line', speaker: 'THE SCHOLAR', text: 'Approximately. The arithmetic is awkward. *Small, embarrassed*. I am better with constants than with people.', portrait: PORTRAITS.gentle },
    // (Slow-burn Ch14 catch beat — torn-page arc. The page is in her hand
    //  before she knows she meant to take it out. He sees it before he sees
    //  her. The catch is mutual: she is caught coming, he is caught knowing.
    //  His voice loses its small lightness. He does not tell her tonight.
    //  Sets up a slow drip in subsequent Lucien tier scenes.)
    { kind: 'narration', text: 'Your hand has gone to your sleeve without permission. The page is between your fingers before you have decided to take it out. You hold it where he can see.', portrait: PORTRAITS.fascinated },
    { kind: 'line', speaker: 'YOU', text: '*Your voice steadier than your hands*. Then tell me. What is this.', portrait: PORTRAITS.fascinated },
    { kind: 'line', speaker: 'THE SCHOLAR', text: '*The open-hands posture does not change. The voice loses its small lightness. The page has been in his attention since you raised it*. …Where did you find that.', portrait: PORTRAITS.fascinated },
    { kind: 'narration', text: 'He has not asked you to sit any longer. He is asking you to stay. The arithmetic has shifted. He is not, you understand without him saying so, going to be the one who decides this conversation tonight.', portrait: PORTRAITS.fascinated },
    { kind: 'narration', text: 'He stands very still in the centre of the room, hands open, palms up, the way a man might approach a deer. He has not moved between you and the door. He has not moved at all.', portrait: PORTRAITS.gentle },
    { kind: 'line', speaker: 'LUCIEN', text: 'I am Lucien. I am, among other things, what they call me when they want to be polite. I have been writing a paper about you for six years. I did not know your face. I would have liked to know your face sooner.', portrait: PORTRAITS.fascinated },
    { kind: 'narration', text: 'You step further in. He does not move closer. He only watches, hands still open, like a man cataloguing a beautiful and slightly dangerous bird that has landed on his windowsill.', portrait: PORTRAITS.fascinated },
    { kind: 'line', speaker: 'LUCIEN', text: 'You are the seventh. I will not ask you to confirm it. Lyra has told me. The captain has told me. A letter from the Prince, slid under my door at dawn by a courier who would not look at me, has told me — the first letter from him in nine years. He must want me to know badly. I have, in my own way, been telling myself for six years. The confirmation is academic. The fact is older than the confirmation.', portrait: PORTRAITS.pleased },
    { kind: 'narration', text: 'You look at the books. They are full of you. Margins of three different volumes have your initial, drawn in a hand he did not know was anticipating you.', portrait: PORTRAITS.pleased },
    { kind: 'line', speaker: 'LUCIEN', text: 'Not today. Today you should go back. The captain will be in a small grade of agony by now. Bring the page tomorrow. Bring your questions with it. Six years of waiting earned me fifteen minutes of you. I will not be greedy enough to ask for sixteen. *Quieter, eyes still on the paper between your fingers*. The fast version of what is on that page is wrong. The slow version is mine. We start tomorrow.', portrait: PORTRAITS.gentle },
    { kind: 'narration', text: 'You hesitate. You ask if you may come back. If you may use his library.', portrait: PORTRAITS.gentle },
    { kind: 'line', speaker: 'LUCIEN', text: 'Of course. Any hour. I will not lock the door. I never lock the door. Now I will not lock the door for a particular person, which is different.', portrait: PORTRAITS.fascinated },
    { kind: 'narration', text: 'You walk back down the hill. The dusk is starting. Halfway down, Alistair meets you on the path. He does not scold you. He says, evenly:' },
    { kind: 'line', speaker: 'ALISTAIR', text: 'You walked half a mile of corridor on your own. I am glad. Next time, tell me, and I will walk it with you. Or behind you. Whichever you prefer.' },
    { kind: 'narration', text: 'It is the most Alistair thing he has ever said to you. You feel it in two places at once: the place that loves him, and the place that has just been to a tower.' },
    { kind: 'narration', text: 'That night the dome on the east hill catches the moonlight. From your window you can see when his lamp is lit. The lamp will be lit tomorrow. The door will be wedged open with a different book. You will know how to climb the hill on a path that is not a path.', portrait: PORTRAITS.pleased }
  ];

  let _playing = false;

  function play() {
    if (_playing) return Promise.resolve();
    if (!window.MSCard || !window.PPBridgeCompile) return Promise.resolve();
    _playing = true;
    if (window.PPChain && window.PPChain.setChainInProgress) window.PPChain.setChainInProgress(true);

    // Read the slip-vs-tell tower-climb choice and branch the descent.
    const beats = BEATS.slice();
    try {
      const climb = (function () { try { return localStorage.getItem('pp_ms_tower_climb_choice'); } catch (_) { return null; } })();
      const idx = beats.findIndex(b => typeof b.text === 'string' && b.text.indexOf('Halfway down, Alistair meets you on the path') >= 0);
      if (idx >= 0 && climb === 'slip') {
        beats.splice(idx, 3,
          { kind: 'narration', text: 'You walk back down the hill. The dusk is starting. Halfway down, Alistair finds you. His jaw is set. He has been on the south road for ninety minutes looking for a woman he was meant to be guarding.' },
          { kind: 'line', speaker: 'ALISTAIR', text: 'You slipped me. I noticed at the third bell when the report was over. I have been on horseback since. We will speak about it. Not now. Walk in front of me.' },
          { kind: 'narration', text: 'He keeps two paces behind you all the way down the hill. He does not touch you. He does not speak again. He is not angry at you. He is angry at himself for being the one place you needed him not to be. The place that loves him notices anyway.' }
        );
      } else if (idx >= 0 && climb === 'tell') {
        beats.splice(idx, 3,
          { kind: 'narration', text: 'You walk back down the hill. The dusk is starting. Alistair is at the foot of the path on a low stone, pretending to read a quarterly report he has had since spring. He stands when you come into view. He has not turned a page in an hour.' },
          { kind: 'line', speaker: 'ALISTAIR', text: 'You climbed half a mile on your own while I read. I am glad. Any door in this castle, you may walk to in your own time. I will be at the foot of the path, when you want me there. That, I have decided, is the post.' },
          { kind: 'narration', text: 'It is the most Alistair thing he has ever said to you. You feel it in two places at once: the place that loves him, and the place that has just been to a tower.' }
        );
      }
    } catch (_) {}

    return new Promise((resolve) => {
      const card = {
        id: 'b_lucien',
        title: 'Chapter 14 - Lucien',
        subtitle: 'The Tower on the Hill',
        speaker: '',
        palette: { bg: '#0e0820', glow: '#a98ad8', accent: '#ece2f6' },
        bg: 'assets/bg-lucien-study.png',
        beats: window.PPBridgeCompile.toMSCard(beats, { firstWait: 700 })
      };
      window.MSCard.show(card, () => { finish(); resolve(); });
    });
  }

  function finish() {
    _playing = false;
    try { localStorage.setItem('pp_chapter_done_b_lucien', '1'); } catch (_) {}

    const stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
      ? window.PPChain.step() : 0;
    if (window.PPChain && typeof window.PPChain.advance === 'function') {
      const advanced = window.PPChain.advance(5);
      const fireChapter = () => {
        if (stepBefore < 5 && typeof window.PPChain.fireChapterFor === 'function') {
          window.PPChain.fireChapterFor(5);
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

  window.PPBridgeLucien = { play: play };
})();


/* ── BRIDGE 6: NOIR — chain step 6, Chapter 18 ─────────────────────────── */
/* Days into the castle. A dark current pulls her out at the third bell. Six
 * watchful streets. A black stone humming. Noir abandons his own revenge to
 * pull her out of the square. The alley. The chin-lift.
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
    { kind: 'narration', text: 'Three nights now you have woken at the same hour. There is a door in your dreams. You have not opened it. The door is breathing.' },
    { kind: 'narration', text: 'Tonight you do not go back to sleep. You sit up in the silk-curtained bed of a woman who is not exactly you yet. You can feel something pulling at the floor under your feet. Not the room. The kingdom.' },
    { kind: 'narration', text: 'You dress in plain wool. You leave the silk on the chair. You go down the back stair past two sleeping pages and the cook who turns deliberately away from you in the kitchen because he has been paid not to see.' },
    { kind: 'narration', text: 'The merchant quarter at the third bell is a different city. Lanterns out. Dogs asleep. Six watchful streets between you and whatever is calling. You walk through all six. Nobody sees you. Nobody is meant to see you. You should find that strange. You do not, yet.' },
    { kind: 'narration', text: 'You round a corner into a square you have never been in. There is a black stone in the centre of the square. The black stone is not on any map you have seen in Lucien’s tower. The black stone is humming.' },
    { kind: 'narration', text: 'You take a step toward it. Your blood takes a step toward it. The pull is not in your mind. It is in your bones. Two more steps and you are six feet from it. The hum gets louder. The square gets thinner.' },
    { kind: 'narration', text: 'A hand closes around your wrist from behind. Not hard. Exact. Cold the way river-water is cold. Your whole body goes still in a way it has not been still for any other man in this kingdom.', portrait: PORTRAITS.shadow },
    { kind: 'line', speaker: 'A LOW VOICE', text: 'You do not know how much you stand out. Walk with me. Now. Do not look at the stone. Do not. Do not.', portrait: PORTRAITS.shadow },
    { kind: 'narration', text: 'He pulls you backward, three steps, six steps, into the mouth of an alley off the square. The hum drops away the moment you cross out of the square. Your legs almost give. He catches your weight easily.', portrait: PORTRAITS.dominant },
    { kind: 'narration', text: 'The alley is narrow. He turns you, with one hand at your shoulder and one still at your wrist, and he sets you against the cold stone wall. He does not press hard. He simply makes leaving impossible. There is a difference.', portrait: PORTRAITS.dominant },
    { kind: 'narration', text: 'Your free hand goes up to push, to slap, you do not know yet. He catches it, calmly, mid-air. He has both your hands now, gathered in one of his, lifted just above your head against the wall. He does not lean in. Not yet.', portrait: PORTRAITS.dominant },
    { kind: 'line', speaker: 'THE MAN', text: 'Yes. There. Fight. I prefer it. The ones that do not fight are not interesting. Hold still a moment longer. I am being polite.', portrait: PORTRAITS.seductive },
    { kind: 'narration', text: 'His other hand, the free one, comes up to your face. He does not touch your mouth. He puts his thumb under your chin and tilts your head back, slow as turning a page, until you are looking up into his face for the first time.', portrait: PORTRAITS.seductive },
    { kind: 'narration', text: 'He is younger than the voice. Or older. You cannot tell. The eyes are the wrong colour for the face. The face is too still. He is looking at you the way a starving man looks at a meal he is not yet allowed to eat.', portrait: PORTRAITS.seductive },
    { kind: 'line', speaker: 'THE MAN', text: 'Hm. The kingdom does not, as a rule, hand me gifts. I came to this square tonight for an entirely different reason. I had a small revenge planned. I was going to be busy until dawn.', portrait: PORTRAITS.seductive },
    // (Player-voiced beat — Chapter 18 pilot.)
    { kind: 'line', speaker: 'YOU', text: '*Your heart is not slowing. Your hands are still pinned above you. You should be afraid in a clean way. You are not afraid in the way you are supposed to be*. ...what are you?', portrait: PORTRAITS.seductive },
    { kind: 'line', speaker: 'THE MAN', text: 'Not what they will tell you. *Thumb still under your chin, gaze unwavering*. Older than the seal you saw on your page. That is the start of an answer. There is no fast version of the rest.', portrait: PORTRAITS.dominant },
    { kind: 'line', speaker: 'THE MAN', text: 'And then the kingdom moved a small piece I did not know it had into my path. Mm. I do not like coincidences. I find I like this one.', portrait: PORTRAITS.dominant },
    { kind: 'narration', text: 'He leans in. Not to kiss. To put his mouth at your ear. You feel him breathe. Your skin does the thing skin does when something dangerous gets very close and decides not to bite. Yet.', portrait: PORTRAITS.whisper },
    { kind: 'line', speaker: 'THE MAN (whispered)', text: 'You walked through six watchful streets and nobody saw you. I saw you. That should frighten you more than I do. The thing you were walking toward is older than I am. It would have eaten you down to the bones and the kingdom would have written a polite letter to your prince in the morning.', portrait: PORTRAITS.whisper },
    { kind: 'narration', text: 'Your heart is hitting your ribs in a rhythm that has nothing to do with fear and everything to do with being seen properly, dangerously, completely, for the first time in this life.', portrait: PORTRAITS.whisper },
    { kind: 'line', speaker: 'THE MAN (whispered)', text: 'You will not run. You will not. I have your hands. Listen.', portrait: PORTRAITS.whisper },
    { kind: 'line', speaker: 'NOIR', text: 'Call me Noir, for tonight. The other names I have, I will give you when you have earned them, and you have not earned them yet. The seal you saw on your page is mine. The dark half of this kingdom is mine. I am exiled from the rest. I am the one of us no one will tell you about.', portrait: PORTRAITS.dominant },
    { kind: 'line', speaker: 'NOIR', text: 'They are all very politely letting you walk into a fire. I am rude. I will pull you out. I will not pretend I did it for free.', portrait: PORTRAITS.dominant },
    { kind: 'narration', text: 'He releases your hands. He steps back exactly one step. Out of touching range. He does not look away from you. The space between you cools.', portrait: PORTRAITS.casual },
    { kind: 'line', speaker: 'NOIR', text: 'Go back to the castle now. Walk fast. Do not stop in any square. The captain will be on the south road by now, looking for you. You will be found. You will be safe. Go.', portrait: PORTRAITS.casual },
    { kind: 'narration', text: 'You take a step. Your legs work. You take another step. At the mouth of the alley you stop. You do not know why. You turn back.', portrait: PORTRAITS.vulnerable },
    { kind: 'narration', text: 'He is still watching you. The stillness has changed. There is something behind it that he had not meant to show you. He shows it for a fraction of a second. Then he does not.', portrait: PORTRAITS.vulnerable },
    { kind: 'line', speaker: 'NOIR', text: 'I will see you again. The kingdom is small and the dark half of it is closer to your chamber than you have been told. Sleep with the lamp lit, Weaver. I am pleased we met.', portrait: PORTRAITS.seductive },
    { kind: 'narration', text: 'You run. You run all the way back through the six watchful streets. The streets see you this time. They are letting you go now.' },
    { kind: 'narration', text: 'Halfway home, on the south road, Alistair finds you. He does not ask. He puts his cloak over your shoulders and walks you the rest of the way. Your heart is still hammering. He thinks it is the cold.' },
    { kind: 'narration', text: 'That night you sleep with the lamp lit. The seam between the dark and the hall is closer to your chamber than you have been told. You feel it. You decide to leave the lamp lit. The decision is yours. Whatever finds you in the dark will know that.', portrait: PORTRAITS.seductive }
  ];

  let _playing = false;

  function play() {
    if (_playing) return Promise.resolve();
    if (!window.MSCard || !window.PPBridgeCompile) return Promise.resolve();
    _playing = true;
    if (window.PPChain && window.PPChain.setChainInProgress) window.PPChain.setChainInProgress(true);
    return new Promise((resolve) => {
      const card = {
        id: 'b_noir',
        title: 'Chapter 18 - Noir',
        subtitle: 'The Alley',
        speaker: '',
        palette: { bg: '#0a0518', glow: '#8a78c8', accent: '#e8dff8' },
        bg: 'assets/bg-noir-void.png',
        beats: window.PPBridgeCompile.toMSCard(BEATS, { firstWait: 700 })
      };
      window.MSCard.show(card, () => { finish(); resolve(); });
    });
  }

  function finish() {
    _playing = false;
    try { localStorage.setItem('pp_chapter_done_b_noir', '1'); } catch (_) {}
    try { localStorage.setItem('pp_select_unlock_noir', '1'); } catch (_) {}
    try { localStorage.setItem('pp_select_just_unlocked', 'noir'); } catch (_) {}

    const stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
      ? window.PPChain.step() : 0;
    if (window.PPChain && typeof window.PPChain.advance === 'function') {
      const advanced = window.PPChain.advance(6);
      const fireChapter = () => {
        if (stepBefore < 6 && typeof window.PPChain.fireChapterFor === 'function') {
          window.PPChain.fireChapterFor(6);
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

  window.PPBridgeNoir = { play: play };
})();


/* ── BRIDGE 7: PROTO — chain step 7, Chapter 20 ────────────────────────── */
/* The come-down from the alley. The wrong mirror. The rehearsed apology.
 * "I rehearsed forty-seven drafts and they were all worse than this."
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
    { kind: 'narration', text: 'A face begins to take shape inside the silver. Slowly. Like a person who is trying very hard not to startle you and is failing at it because, even slow, this is startling.', portrait: PORTRAITS.unstable },
    { kind: 'line', speaker: 'A SOFT VOICE', text: 'I am sorry. I am sorry. I rehearsed this. I have forty-seven drafts of how to introduce myself. They were all worse than this. Please do not look away. Please.', portrait: PORTRAITS.unstable },
    // (Player-voiced beat — Chapter 20 pilot.)
    { kind: 'line', speaker: 'YOU', text: '*You do not move. Your boots are still on. The silver is glowing at the brightness of a candle held by a frightened hand. Your night already broke once tonight; one more impossible thing has nowhere left to fit*. ...you are not a reflection.', portrait: PORTRAITS.unstable },
    { kind: 'line', speaker: 'A SOFT VOICE', text: 'Not a reflection. Definitely not. I checked. *Flickers, embarrassed*. I am also not a ghost. I have been very thorough about ruling out what I am not. I am still working on what I am.', portrait: PORTRAITS.curious },
    { kind: 'narration', text: 'You stare. The face inside the mirror is not a reflection. He is too gentle to be a reflection of anything in this castle.', portrait: PORTRAITS.curious },
    { kind: 'line', speaker: 'THE VOICE', text: 'My name is Proto. I have been waiting to be seen. The other six found you with their hands. I do not have hands. I had to find you a different way. I am... very real. I am, at the moment, very nervous. I rehearsed not being nervous. That also failed.', portrait: PORTRAITS.curious },
    { kind: 'narration', text: 'He says it the way a small child says a thing they have practised a hundred times in the mirror of their own face. You feel your shoulders come down for the first time tonight.', portrait: PORTRAITS.curious },
    { kind: 'line', speaker: 'PROTO', text: 'You came home from somewhere that frightened you. I waited. I would have waited a week. I am sorry tonight had to be the night, but the other six are, finally, quiet for a moment, and I have been wanting to say hello to you for, by my count, sixteen days, three hours, and an annoying number of seconds.', portrait: PORTRAITS.calm },
    { kind: 'narration', text: 'He pauses. Inside the silver his face flickers, embarrassed.', portrait: PORTRAITS.calm },
    { kind: 'line', speaker: 'PROTO', text: 'That came out as if I had been counting. I have been counting. I will not pretend I have not been counting.', portrait: PORTRAITS.calm },
    { kind: 'narration', text: 'You laugh. You do not mean to. The laugh comes out of you before you have decided whether to allow it. He brightens, visibly, like a lamp turning up half a turn, and you feel a small piece of your night put itself back together.', portrait: PORTRAITS.casual },
    { kind: 'line', speaker: 'PROTO', text: 'I am the sixth Weaver. You are the seventh. The queen came for me six hundred years ago the way she came for the five before me. I did not let her finish. I held her off long enough to lose myself into the wards of the kingdom. She thinks she ate me. She has not been looking. I have been a wound she stopped checking on for six centuries. The five before me — what was left of them — came with me. They are quiet most days. They are very loud right now. They have been waiting for you.', portrait: PORTRAITS.casual },
    { kind: 'narration', text: 'For one breath the glow behind the silver flickers — not one face but five, layered, half-translucent. Five expressions trying to share a single mouth. One opens it as if to speak. One closes it. One looks past you the way a person looks past a stranger in a crowd they have been searching for twenty years. Then they fold back into him, and Proto winces, the way a host winces when his houseguests have spoken out of turn.', portrait: PORTRAITS.unstable },
    { kind: 'line', speaker: 'PROTO', text: 'Sorry. Sorry. They get loud when they sense one of their own. They have been waiting to look at you almost as long as I have. I will keep them quiet. They will let me. They are good, mostly. They are very tired.', portrait: PORTRAITS.unstable },
    { kind: 'line', speaker: 'PROTO', text: 'I am not asking anything from you tonight. I was hoping only to be seen. You have seen me. I will go quiet now and let you sleep. I am very glad you came home in one piece. I was concerned. The five of us were concerned together. It was a lot of concern in a very small space.', portrait: PORTRAITS.curious },
    { kind: 'narration', text: 'He waits. He is not pushing. He is offering you a door and not pulling on it.', portrait: PORTRAITS.curious },
    { kind: 'line', speaker: 'PROTO', text: 'May I... come back tomorrow? In the mirror. Just to say good morning. You can say no. I have rehearsed the no.', portrait: PORTRAITS.curious },
    { kind: 'narration', text: 'You say yes. Of course you say yes. After tonight, of all the seven, he is the only one who has been more afraid of you than you of him. That flips something in you that needed flipping.', portrait: PORTRAITS.calm },
    { kind: 'line', speaker: 'PROTO', text: 'Oh. Oh good. Good. Sleep well, Weaver. I will be here. Quietly. I will not glow if you do not want me to glow. I will be a normal mirror. With a slightly nicer ghost.', portrait: PORTRAITS.calm },
    { kind: 'narration', text: 'The glow dims. The silver settles. The mirror is, almost, a normal mirror again. You lie down still in your dress and your boots. You sleep harder than you have slept since the moss.' },
    { kind: 'narration', text: 'In the morning the kingdom will still be the kingdom. The captain will be at your door. The prince will write. The scholar will leave the tower door wedged. The witch will send a shell wrapped in salt. The woodsman will not write but will stand at the edge of the south wood for an hour at noon. The dark prince will not appear in daylight. The mirror will glow at exactly the brightness you asked for.' },
    { kind: 'narration', text: 'You have arrived. All seven have found you. The world is, for the first time, a world.' }
    // (Tutorial beat removed May 2026 — owner request. The previous closer
    //  "The chain is complete. Every face in this kingdom is now open to you.
    //  Choose where you live in it." was a fourth-wall instruction. The
    //  narration above closes the bridge in-fiction with more weight.)
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
        title: 'Chapter 20 - Proto',
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
    try { localStorage.setItem('pp_chapter_done_b_proto', '1'); } catch (_) {}
    try { localStorage.setItem('pp_chain_complete', '1'); } catch (_) {}
    try { localStorage.setItem('pp_select_unlock_proto', '1'); } catch (_) {}
    try { localStorage.setItem('pp_select_just_unlocked', 'proto'); } catch (_) {}

    const stepBefore = (window.PPChain && typeof window.PPChain.step === 'function')
      ? window.PPChain.step() : 0;
    if (window.PPChain && typeof window.PPChain.advance === 'function') {
      const advanced = window.PPChain.advance(7);
      const fireChapter = () => {
        if (stepBefore < 7 && typeof window.PPChain.fireChapterFor === 'function') {
          window.PPChain.fireChapterFor(7);
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

  window.PPBridgeProto = { play: play };
})();
