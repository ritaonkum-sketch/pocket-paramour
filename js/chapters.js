/* chapters.js \u2014 Main Story spine. The narrative backbone that introduces
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
  // but it does NOT take precedence — a player who has done chapters
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
      // All chapters done — return last as current for "all complete" state.
      return CHAPTERS.length > 0 ? CHAPTERS[CHAPTERS.length - 1].id : 0;
    } catch (e) { return 0; }
  }
  function setCurrent(n) {
    // Stored as a hint only — getCurrent() derives from done-state.
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
      title: 'PROLOGUE',
      subtitle: 'A Kingdom Fades',
      teaser: 'You wake with no memory, and the world already needs you.',
      charId: null,
      play: async function (onDone) {
        await runCard({
          id: 'chp_0_prologue',
          title: 'PROLOGUE',
          subtitle: 'A Kingdom Fades',
          speaker: '',
          palette: { bg: '#080516', glow: '#7a6ab8', accent: '#f0e6ff' },
          bg: 'assets/bg-world.png',
          beats: [
            { type: 'show',      pose: '', wait: 500 },
            { type: 'line',      text: 'The Kingdom of Aethermoor is dying.', hold: 1600, cps: 30 },
            { type: 'line',      text: 'Its magic once lived in the bonds between its people. Those bonds are breaking.', hold: 2200, cps: 28 },
            { type: 'line',      text: 'The last Soul Weaver \u2014 the one who kept the connections alive \u2014 is gone.', hold: 2200, cps: 28 },
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
      title: 'ARRIVAL',
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

    // -- BRIDGE 1: ALISTAIR RESCUE -------------------------------------------
    {
      id: 'b_alistair',
      title: 'BRIDGE — ALISTAIR',
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
      title: 'CHAPTER 1',
      subtitle: 'You Arrive',
      teaser: 'The first face you see is carrying a sword.',
      charId: 'alistair',
      play: async function (onDone) {
        await runEncounter('Alistair');
        await runCard({
          id: 'chp_1_middle',
          title: 'CHAPTER 1',
          subtitle: 'You Arrive \u2014 the Gate',
          speaker: 'ALISTAIR',
          palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
          bg: 'assets/bg-alistair-gate.png',
          beats: [
            { type: 'show',      pose: 'assets/alistair/body/casual.png', wait: 700 },
            { type: 'line',      text: 'Walk with me. The outer wall is where the fading started.', hold: 2000, cps: 30 },
            { type: 'line',      text: 'Stones that held magic for a thousand years are just stones now. The kingdom is unlearning itself.', hold: 2400, cps: 28 },
            { type: 'line',      text: 'Last night a torch that\u2019s burned at this gate since my grandfather stood watch \u2014 it simply went out. No wind. No hand. Just forgot how to be a flame.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'And something down below \u2026laughed when it happened. Faintly. I almost thought I imagined it.', hold: 2600, cps: 28 },
            { type: 'pose',      src: 'assets/alistair/body/crossarms.png', animate: 'swap' },
            { type: 'line',      text: 'I haven\u2019t slept through a night since I was eleven years old. I keep thinking the wall will hold if I just \u2026 watch it harder.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'I shouldn\u2019t be telling you this. I don\u2019t know why I am. \u2026Yes I do.', hold: 2600, cps: 28 },
            { type: 'pose',      src: 'assets/alistair/body/softshy-love1.png', animate: 'swap' },
            { type: 'line',      text: 'You make the watch feel \u2026 like company. Not duty. I\u2019m not used to that. I might be terrible at it.', hold: 2800, cps: 28 },
            { type: 'flourish',  text: '\u2726', duration: 1600 },
            { type: 'line',      text: 'Come back tomorrow. I\u2019ll show you the hall \u2014 and the room behind it that I\u2019ve never let anyone see.', hold: 2600, cps: 28 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_alistair_seen','1'); } catch (_) {}
        markDone(1); setCurrent(nextIdAfter(1));
        if (onDone) onDone();
      }
    },

    // -- BRIDGE 2: ELIAN ------------------------------------------------------
    {
      id: 'b_elian',
      title: 'BRIDGE — ELIAN',
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
      title: 'CHAPTER 2',
      subtitle: 'The Forest Finds You',
      teaser: 'A path that isn\u2019t on any map, and a voice from the trees.',
      charId: 'elian',
      play: async function (onDone) {
        await runEncounter('Elian');
        await runCard({
          id: 'chp_2_middle',
          title: 'CHAPTER 2',
          subtitle: 'The Forest Finds You \u2014 the Clearing',
          speaker: 'ELIAN',
          palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 700 },
            { type: 'line',      text: 'The trees used to remember names. Now they only remember absences.', hold: 2400, cps: 28 },
            { type: 'line',      text: 'A deer ran past me yesterday with no reflection in the stream. The water just \u2026 forgot to hold it. The forest is losing pieces of itself.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'And deeper in \u2014 past the stones I mark \u2014 something has started calling at night. A man\u2019s voice, low. Warm. Wrong.', hold: 2800, cps: 28 },
            { type: 'pose',      src: 'assets/elian/body/foraging.png', animate: 'swap' },
            { type: 'line',      text: 'I buried someone in this forest. \u2014 A long time ago. \u2014 They were the first person I let past the treeline. \u2014 I was young. \u2014 In my terms. \u2014 My terms are longer than most.', hold: 3200, cps: 26 },
            { type: 'line',      text: 'They were a Weaver. Like you. \u2014 The first I ever knew. \u2014 The kingdom took her from these trees. \u2014 I have been tending her forest ever since.', hold: 3400, cps: 26 },
            { type: 'line',      text: 'None of my line has said the name since my grandmother\u2019s grandmother. \u2014 I think we were afraid the world would not know what to do with the sound. \u2014 \u2026You might.', hold: 3200, cps: 26 },
            { type: 'pose',      src: 'assets/elian/body/calm.png', animate: 'swap' },
            { type: 'line',      text: 'Then you walked in. The trees \u2026 leaned. They haven\u2019t leaned in years. You\u2019re the first thing this forest has remembered since I stopped saying that name.', hold: 3000, cps: 26 },
            { type: 'line',      text: 'I don\u2019t know what to do with that yet. I think the forest does.', hold: 2400, cps: 28 },
            { type: 'flourish',  text: '\u2726', duration: 1600 },
            { type: 'line',      text: 'Come back at dusk. The woods open differently then. \u2026And one day, soon, I\u2019ll show you where I dig.', hold: 2800, cps: 28 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_elian_seen','1'); } catch (_) {}
        markDone(2); setCurrent(nextIdAfter(2));
        if (onDone) onDone();
      }
    },

    // -- BRIDGE 3: LYRA -------------------------------------------------------
    {
      id: 'b_lyra',
      title: 'BRIDGE — LYRA',
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
      title: 'CHAPTER 3',
      subtitle: 'The Caves Answer',
      teaser: 'A song from the deep. You are the first to stay.',
      charId: 'lyra',
      play: async function (onDone) {
        await runEncounter('Lyra');
        await runCard({
          id: 'chp_3_middle',
          title: 'CHAPTER 3',
          subtitle: 'The Caves Answer \u2014 the Hush',
          speaker: 'LYRA',
          palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
          bg: 'assets/bg-siren-cave.png',
          beats: [
            { type: 'show',      pose: 'assets/lyra/body/casual1.png', wait: 700 },
            { type: 'line',      text: 'The caves used to sing back. They stopped when the last Weaver left.', hold: 2400, cps: 28 },
            { type: 'line',      text: 'I have been alone down here a long time. \u2014 Too long to count honestly. \u2014 I was caged before I was alone. \u2014 My father\u2019s house. His wife did not like the sound of me. \u2014 I escaped at fifteen. \u2014 The cave is the quieter cage.', hold: 3600, cps: 26 },
            { type: 'line',      text: 'My mother\u2019s people used to sing in the ruined town out there. \u2014 They were a whole people. \u2014 Hunted. \u2014 I am the last who still knows the words.', hold: 3200, cps: 26 },
            { type: 'pose',      src: 'assets/lyra/body/casual2.png', animate: 'swap' },
            { type: 'line',      text: 'I stopped finishing my songs years ago. \u2014 I\u2019d get to the second verse and the room would feel small. \u2014 Like singing into a coat pocket.', hold: 3000, cps: 26 },
            { type: 'line',      text: 'The staff hums when I walk east \u2014 toward a tower I have never visited. \u2014 Someone with my bloodline lives there. \u2014 One day. \u2014 Not yet.', hold: 3000, cps: 26 },
            { type: 'line',      text: 'I tell myself it\u2019s the cave\u2019s acoustics changing. It isn\u2019t. It\u2019s that no one stayed long enough to be a second verse for.', hold: 3000, cps: 26 },
            { type: 'line',      text: 'And lately \u2014 when I sing low \u2014 something underneath answers. Not the cave. Something below the cave. A man\u2019s voice, velvet, and hungry.', hold: 3000, cps: 28 },
            { type: 'line',      text: 'I don\u2019t answer him. I won\u2019t. \u2026But I\u2019m afraid of the day the song forgets that rule.', hold: 2600, cps: 28 },
            { type: 'pose',      src: 'assets/lyra/body/casual1.png', animate: 'swap' },
            { type: 'line',      text: 'You stayed for a whole verse. You stayed for the silence after, too. \u2026That hasn\u2019t happened in this lifetime.', hold: 2800, cps: 26 },
            { type: 'line',      text: 'If you can stay for two verses, I\u2019ll write you the rest. I haven\u2019t done that for anyone.', hold: 2600, cps: 28 },
            { type: 'flourish',  text: '\u266a', duration: 1600 },
            { type: 'line',      text: 'Don\u2019t bring anyone. They\u2019d ruin it. \u2026Or worse \u2014 he might notice them.', hold: 2400, cps: 28 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_lyra_seen','1'); } catch (_) {}
        markDone(3); setCurrent(nextIdAfter(3));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // INTERLUDE \u2014 two characters meet, and the player's Weaver gift
    // becomes visible for the first time.
    // ---------------------------------------------------------------
    {
      id: 10,
      title: 'INTERLUDE',
      subtitle: 'The Crossroads',
      teaser: 'A knight. A ranger. A bond that hasn\u2019t been named in a hundred years.',
      charId: 'alistair',  // portrait for the card; scene features both
      play: async function (onDone) {
        // Choice callback: echoes the player's first answer in Ch 1.
        let callbackLine = 'I wasn\u2019t supposed to come this far. You made me brave by proxy.';
        try {
          const pick = localStorage.getItem('pp_ms_alistair_first_choice');
          if (pick === 'stay') {
            callbackLine = 'You told me you were meant to find me. Maybe you were meant to find them too.';
          } else if (pick === 'quiet') {
            callbackLine = 'You didn\u2019t want to leave. That\u2019s why I brought you out here \u2014 you liked being quiet with me. I\u2019m hoping the trees will too.';
          }
        } catch (_) {}

        // Beat 1 \u2014 Alistair brings the player to the treeline
        await runCard({
          id: 'chp_10_a',
          title: 'INTERLUDE',
          subtitle: 'The Crossroads \u2014 the Treeline',
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
        // Beat 2 \u2014 Elian steps in, cautious
        await runCard({
          id: 'chp_10_b',
          title: 'INTERLUDE',
          subtitle: 'The Crossroads \u2014 Elian Appears',
          speaker: 'ELIAN',
          palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/elian/body/guarded.png', wait: 700 },
            { type: 'line',      text: 'Captain. You\u2019re past the markers. That\u2019s not like you.', hold: 2200, cps: 28 },
            { type: 'pose',      src: 'assets/elian/body/calm.png', animate: 'swap' },
            { type: 'line',      text: 'Oh. \u2026They\u2019re with you. Then I\u2019m not surprised. The trees leaned when they crossed the stream.', hold: 2600, cps: 28 },
            { type: 'hide' }
          ]
        });
        // Beat 3 \u2014 the two men meet, and the bond restores ON SCREEN
        await runCard({
          id: 'chp_10_c',
          title: 'INTERLUDE',
          subtitle: 'The Crossroads \u2014 A Bond Restored',
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
            { type: 'line',      text: 'A bond the kingdom had quietly lost \u2014 the first one \u2014 is whole again. Because of you. This is what a Soul Weaver does.', hold: 3000, cps: 28 },
            { type: 'hide' }
          ]
        });
        // Beat 4 \u2014 but the cost. Noir felt it.
        await runCard({
          id: 'chp_10_d',
          title: 'INTERLUDE',
          subtitle: 'The Crossroads \u2014 Something Stirred',
          speaker: 'NOIR',
          palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: '\u2026You stitched one. I felt it. All the way down here.', hold: 2400, cps: 24 },
            { type: 'line',      text: 'Careful, Weaver. Every thread you mend \u2014 I feel the needle.', hold: 2600, cps: 24 },
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
    // INTERLUDE 2: Lyra \u00d7 Elian \u2014 the warm wrong voice from the woods
    // and the second voice in the cave are the same voice.
    // ---------------------------------------------------------------
    {
      id: 12,
      title: 'INTERLUDE',
      subtitle: 'The Cave Path',
      teaser: 'A song slips out of the cave. A voice slips into the woods. Both belong to him.',
      charId: 'lyra',
      play: async function (onDone) {
        // Choice callbacks
        let lyraEcho = 'You followed me down again. Most don\u2019t.';
        let elianEcho = 'You walked the markers without me this time. I\u2019m \u2026 quietly proud.';
        try {
          const lp = localStorage.getItem('pp_ms_lyra_first_choice');
          if (lp === 'voice') lyraEcho = 'You said you couldn\u2019t stop following my voice. I needed to know if that was still true.';
          else if (lp === 'quiet') lyraEcho = 'You came down for the quiet. I think the quiet down here is broken now. We should fix it together.';
          const ep = localStorage.getItem('pp_ms_elian_first_choice');
          if (ep === 'lost') elianEcho = 'You said you got lost the first time. Tonight you walked a path you couldn\u2019t have known. Tell me the truth \u2014 are you lost, or are you choosing?';
          else if (ep === 'drawn') elianEcho = 'You said something pulled you. Tonight, I felt it pull me too \u2014 toward this place. We may have been pulled by the same hand.';
        } catch (_) {}

        await runCard({
          id: 'chp_12_a',
          title: 'INTERLUDE',
          subtitle: 'The Cave Path \u2014 a Voice in Common',
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
          title: 'INTERLUDE',
          subtitle: 'The Cave Path \u2014 the Druid Listens',
          speaker: 'ELIAN',
          palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 700 },
            { type: 'line',      text: elianEcho, hold: 2800, cps: 28 },
            { type: 'line',      text: 'I heard a song last week. It came up through the roots. I thought it was the wind \u2014 until it called my name in his voice.', hold: 2800, cps: 28 },
            { type: 'hide' }
          ]
        });
        await runCard({
          id: 'chp_12_c',
          title: 'INTERLUDE',
          subtitle: 'The Cave Path \u2014 the Stitch',
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
          title: 'INTERLUDE',
          subtitle: 'The Cave Path \u2014 Beneath',
          speaker: 'NOIR',
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

    // -- BRIDGE 4: CASPIAN ----------------------------------------------------
    {
      id: 'b_caspian',
      title: 'BRIDGE \u2014 CASPIAN',
      subtitle: 'The Royal Letter',
      teaser: 'The captain reports to the prince \u2014 not the queen. A letter no prince should write himself. The reception, in silk.',
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
      title: 'CHAPTER 4',
      subtitle: 'A Courtier\u2019s Game',
      teaser: 'A crown, a balcony, and a prince who notices everything.',
      charId: 'caspian',
      play: async function (onDone) {
        await runEncounter('Caspian');
        await runCard({
          id: 'chp_4_middle',
          title: 'CHAPTER 4',
          subtitle: 'A Courtier\u2019s Game \u2014 the Veranda',
          speaker: 'CASPIAN',
          palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
          bg: 'assets/bg-caspian-balcony.png',
          beats: [
            { type: 'show',      pose: 'assets/caspian/body/casual1.png', wait: 700 },
            { type: 'line',      text: 'You\u2019re not on any guest list, darling. That\u2019s usually my favourite kind of arrival.', hold: 2400, cps: 28 },
            { type: 'line',      text: 'The Fading eats everything predictable first. You \u2014 are refreshingly, dangerously, \u2026indecently unpredictable.', hold: 2600, cps: 28 },
            { type: 'pose',      src: 'assets/caspian/body/casual2.png', animate: 'swap' },
            { type: 'line',      text: 'Last week a ward in the throne room simply \u2026 forgot its own geometry. We are losing the shape of things.', hold: 2600, cps: 28 },
            { type: 'pose',      src: 'assets/caspian/body/dancing.png', animate: 'swap' },
            { type: 'line',      text: 'I am going to do something terribly unfashionable. \u2014 I am going to be honest. \u2014 The crown is killing me. \u2014 Slowly. \u2014 With excellent taste.', hold: 3000, cps: 26 },
            { type: 'line',      text: 'My line has a pattern. \u2014 Princes love one person. \u2014 And then someone else burns the kingdom for it. \u2014 My grandfather. \u2014 Before him, another. \u2014 I was trained to charm widely enough never to fall deeply. \u2014 I am looking at you and I am not charming very well.', hold: 4000, cps: 24 },
            { type: 'line',      text: 'I learned to flirt because flirting is the only language a court understands. \u2014 I learned the rest of me later. \u2014 There is not much of an audience for the rest of me.', hold: 3200, cps: 26 },
            { type: 'pose',      src: 'assets/caspian/body/adoring.png', animate: 'swap' },
            { type: 'line',      text: 'Don\u2019t fall for the prince. He\u2019s a costume. \u2026If you can bear it, fall for the man inside the costume. He\u2019s smaller. He\u2019s scared. He\u2019s yours, if you want him.', hold: 3200, cps: 26 },
            { type: 'line',      text: 'If you\u2019re the Weaver my grandmother wrote about \u2014 walk the gardens with me at midnight. Wear something I\u2019ll regret.', hold: 2600, cps: 28 },
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

    // -- BRIDGE 5: LUCIEN -----------------------------------------------------
    {
      id: 'b_lucien',
      title: 'BRIDGE — LUCIEN',
      subtitle: 'The Tower on the Hill',
      teaser: 'Alistair appointed your personal guard. The dome catches the dusk. You lose him on purpose. The door is wedged with a book.',
      charId: 'lucien',
      play: async function (onDone) {
        if (window.PPBridgeLucien && typeof window.PPBridgeLucien.play === 'function') {
          await window.PPBridgeLucien.play();
        }
        markDone('b_lucien'); setCurrent(nextIdAfter('b_lucien'));
        if (onDone) onDone();
      }
    },

    {
      id: 5,
      title: 'CHAPTER 5',
      subtitle: 'The Tower Opens',
      teaser: 'A locked door, and a scholar who has questions.',
      charId: 'lucien',
      play: async function (onDone) {
        await runEncounter('Lucien');
        await runCard({
          id: 'chp_5_middle',
          title: 'CHAPTER 5',
          subtitle: 'The Tower Opens \u2014 the Study',
          speaker: 'LUCIEN',
          palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
          bg: 'assets/bg-lucien-study.png',
          beats: [
            { type: 'show',      pose: 'assets/lucien/body/casual1.png', wait: 700 },
            { type: 'line',      text: 'The wards are a fourth-order resonance. They don\u2019t unlock. For anyone. Except, apparently, you.', hold: 2600, cps: 28 },
            { type: 'line',      text: 'Soul Weaver is an archaic term, but the maths line up. You\u2019re the anomaly the kingdom prayed for.', hold: 2600, cps: 28 },
            { type: 'line',      text: 'And \u2014 I must be honest \u2014 not the only anomaly. My equations keep \u2026 leaking. A second variable I never wrote. He signs my margins at night, in ink I don\u2019t own.', hold: 2800, cps: 28 },
            { type: 'pose',      src: 'assets/lucien/body/casting.png', animate: 'swap' },
            { type: 'line',      text: 'I have been hiding the rest of the maths from everyone. \u2014 From the council. \u2014 From the prince. \u2014 From myself, on the bad nights.', hold: 2800, cps: 26 },
            { type: 'line',      text: 'The cost of my magic is memory. \u2014 Every spell, a memory. \u2014 I have been choosing which to lose. \u2014 There are fewer of them left than I would like. \u2014 I am keeping the ones with your face in them. \u2014 Non-negotiable.', hold: 4000, cps: 24 },
            { type: 'line',      text: 'I have been writing your name in the margins of my books for months. \u2014 I started a catalogue. \u2014 I have reached thirty-seven. \u2014 I am not editing them.', hold: 3200, cps: 26 },
            { type: 'line',      text: 'They prove the kingdom cannot be saved. \u2014 Not the way the books say. \u2014 I have been locking the door not to keep people out \u2014 but so they could not see me fail. \u2014 There is also a page about a sister I was told was dead. \u2014 That page is separate. \u2014 Do not ask tonight.', hold: 4200, cps: 24 },
            { type: 'line',      text: 'There\u2019s a second set of pages. Scorched. I\u2019ve been reconstructing them from ash and margin-bleed. They mention a kingdom we do not speak about anymore. Nocthera.', hold: 3200, cps: 26 },
            { type: 'line',      text: 'A name keeps almost surfacing. A prince. Aethermoor erased him, yet the ink remembers. The ink \u2026 keeps writing him back.', hold: 3000, cps: 26 },
            { type: 'pose',      src: 'assets/lucien/body/amused.png', animate: 'swap' },
            { type: 'line',      text: 'Then you walked through the wards like a rumour walks through court. The maths twitched. They wanted you in them.', hold: 2800, cps: 26 },
            { type: 'line',      text: 'Tell me I can stop hiding the page. Tell me we can be wrong about it together. \u2026I\u2019d very much like a problem worth working on with someone.', hold: 3000, cps: 26 },
            { type: 'line',      text: 'Whoever \u2014 whatever \u2014 is waking beneath us has been practicing your name for a very long time.', hold: 2800, cps: 28 },
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
    // INTERLUDE 3: Caspian \u00d7 Lucien \u2014 the prince and the scholar share
    // an old secret about the kingdom. The Fading mirrors them too.
    // ---------------------------------------------------------------
    {
      id: 11,
      title: 'INTERLUDE',
      subtitle: 'The Tower Mirror',
      teaser: 'A crown asks a tower a question that\u2019s gone unanswered for a hundred years.',
      charId: 'caspian',
      play: async function (onDone) {
        // Choice callbacks for both
        let caspianEcho = 'I usually let other people climb to me. For you, I climb stairs. Mark the date.';
        let lucienEcho = 'I locked the door. The wards held. \u2026For you the wards have stopped pretending to be locks.';
        try {
          const cp = localStorage.getItem('pp_ms_caspian_first_choice');
          if (cp === 'intrude') caspianEcho = 'You said you didn\u2019t mean to intrude. \u2026Tonight you came uninvited to a forbidden tower with me. Growth.';
          else if (cp === 'brave') caspianEcho = 'You said the prince was worth the trouble. So is the scholar. Don\u2019t tell either of us I admitted that.';
          const lp = localStorage.getItem('pp_ms_lucien_first_choice');
          if (lp === 'touched') lucienEcho = 'You said the door opened when you touched it. The whole tower opens when you arrive now. I\u2019ve stopped being surprised.';
          else if (lp === 'unknown') lucienEcho = 'You said you didn\u2019t know how you got here. The maths are now extremely clear: you arrive when something old needs remembering.';
        } catch (_) {}

        await runCard({
          id: 'chp_11_a',
          title: 'INTERLUDE',
          subtitle: 'The Tower Mirror \u2014 a Royal Visit',
          speaker: 'CASPIAN',
          palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
          bg: 'assets/bg-lucien-evening.png',
          beats: [
            { type: 'show',      pose: 'assets/caspian/body/casual1.png', wait: 700 },
            { type: 'line',      text: caspianEcho, hold: 2800, cps: 28 },
            { type: 'line',      text: 'Lucien hasn\u2019t answered a royal summons in nine years. The court calls him a recluse. I call him a coward, fondly.', hold: 2800, cps: 28 },
            { type: 'hide' }
          ]
        });
        await runCard({
          id: 'chp_11_b',
          title: 'INTERLUDE',
          subtitle: 'The Tower Mirror \u2014 the Scholar Opens',
          speaker: 'LUCIEN',
          palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
          bg: 'assets/bg-lucien-study.png',
          beats: [
            { type: 'show',      pose: 'assets/lucien/body/casual1.png', wait: 700 },
            { type: 'line',      text: lucienEcho, hold: 2800, cps: 28 },
            { type: 'line',      text: 'Caspian. The crown sits less heavily on you tonight. Did you forget to put it on, or are you finally trusting someone with the bare head?', hold: 2800, cps: 28 },
            { type: 'pose',      src: 'assets/lucien/body/amused.png', animate: 'swap' },
            { type: 'line',      text: 'Caspian: \u201c\u2026A bit of both. Show me your equations. The ones that scare you.\u201d', hold: 2400, cps: 28 },
            { type: 'hide' }
          ]
        });
        await runCard({
          id: 'chp_11_c',
          title: 'INTERLUDE',
          subtitle: 'The Tower Mirror \u2014 The Scorched Page',
          speaker: '',
          palette: { bg: '#100a1c', glow: '#d4a8e8', accent: '#f8e0ff' },
          bg: 'assets/bg-lucien-night.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: 'Lucien sets a reconstructed page on the desk. The edges are burnt. The centre is a name written in ink that refuses to stay erased.', hold: 3000, cps: 28 },
            { type: 'line',      text: 'Lucien: \u201cPrince Corvin Noctalis. Of the Kingdom of Nocthera. \u2026Which fell six hundred years ago, one generation after its heir was \u2026 removed.\u201d', hold: 3400, cps: 28 },
            { type: 'line',      text: 'Caspian goes very still. \u201cNocthera. That\u2019s the rival line. We don\u2019t speak that name. \u2026I was told the kingdom collapsed on its own.\u201d', hold: 3400, cps: 28 },
            { type: 'line',      text: 'Lucien: \u201cIt didn\u2019t. Queen Aenor \u2014 your grandmother \u2014 sealed its prince beneath Aethermoor. Without its heir, Nocthera couldn\u2019t hold. It fell within the decade.\u201d', hold: 3600, cps: 28 },
            { type: 'line',      text: 'Caspian: \u201cWhy. Why would she do that. They were negotiating a peace match, weren\u2019t they? Why seal the groom\u2014\u201d', hold: 3200, cps: 28 },
            { type: 'pose',      src: 'assets/lucien/body/casting.png', animate: 'swap' },
            { type: 'line',      text: 'Lucien turns another page. \u2014 A third name. \u2014 \u201cVeyra. Not a minor royal. \u2014 A WEAVER. \u2014 The second of her kind the kingdom ever had. \u2014 Your grandmother knew it. Corvin knew it. Both of them were in love with her. \u2014 Veyra chose Corvin.\u201d', hold: 4200, cps: 26 },
            { type: 'line',      text: 'Caspian, very quietly: \u201c\u2026So she sealed her rival. \u2014 Erased his name. \u2014 Let his kingdom die. \u2014 And then began consuming every Weaver that came after her. \u2014 Because if she could not have the Weaver she wanted, she would have ALL of them. \u2014 Slowly. \u2014 One per generation.\u201d', hold: 4400, cps: 24 },
            { type: 'particles', count: 20, duration: 2000 },
            { type: 'flourish',  text: '\u2726', duration: 1800 },
            { type: 'line',      text: 'Lucien: \u201cWorse. The seal bleeds. It has been draining every Weaver since. That\u2019s why Aethermoor has none left. It\u2019s why the walls forget. It\u2019s why he is waking up now \u2014 because YOU arrived, and a real Weaver cracks the cage open.\u201d', hold: 4000, cps: 26 },
            { type: 'line',      text: 'Caspian, very quietly: \u201cMy dynasty exists because my grandmother erased the man her betrothed loved. We are \u2026 a blood debt with a crown on top.\u201d', hold: 3400, cps: 28 },
            { type: 'line',      text: 'They both look at you. Not as a Weaver. As the person deciding what this family does next.', hold: 3000, cps: 28 },
            { type: 'hide' }
          ]
        });
        await runCard({
          id: 'chp_11_d',
          title: 'INTERLUDE',
          subtitle: 'The Tower Mirror \u2014 Beneath',
          speaker: 'NOIR',
          palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: 'Oh. They found the page.', hold: 2200, cps: 24 },
            { type: 'line',      text: 'Tell the boy I bear him no grudge \u2014 a grandson is not his grandmother. Tell the scholar the ink is mine; he may keep borrowing it.', hold: 3000, cps: 24 },
            { type: 'line',      text: 'Tell them both: Nocthera is gone. My people are bone. I have no throne to reclaim. I only have \u2026 unfinished things.', hold: 3200, cps: 24 },
            { type: 'flourish',  text: '\u25a0', duration: 1800 },
            { type: 'line',      text: 'Come down, Weaver. Now that you know who I was. I\u2019ll introduce myself properly. I haven\u2019t been able to, for a very long time.', hold: 3200, cps: 24 },
            { type: 'hide' }
          ]
        });
        markDone(11); setCurrent(nextIdAfter(11));
        if (onDone) onDone();
      }
    },

    // -- BRIDGE 6: NOIR -------------------------------------------------------
    {
      id: 'b_noir',
      title: 'BRIDGE — NOIR',
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
      title: 'CHAPTER 6',
      subtitle: 'A Voice Beneath',
      teaser: 'Every bond the kingdom ever broke \u2014 he kept every one.',
      charId: 'noir',
      play: async function (onDone) {
        await runEncounter('Noir');
        // Choice callback for Noir
        let noirEcho = 'You wanted to see me. \u2026Now you see all of me. Don\u2019t flinch.';
        try {
          const np = localStorage.getItem('pp_ms_noir_first_choice');
          if (np === 'see') noirEcho = 'You said you wanted to see me. Whatever I am. \u2026Tonight I show you the whole shape of it. Don\u2019t flinch \u2014 you asked for this.';
          else if (np === 'sealed') noirEcho = 'You asked who sealed me. They were called the Weavers. \u2026They were called you, in fact. Six lifetimes ago. We have a lot to discuss.';
        } catch (_) {}
        await runCard({
          id: 'chp_6_middle',
          title: 'CHAPTER 6',
          subtitle: 'A Voice Beneath \u2014 the Seal',
          speaker: 'NOIR',
          palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show',      pose: 'assets/noir/body/neutral.png', wait: 700 },
            { type: 'line',      text: noirEcho, hold: 2800, cps: 24 },
            { type: 'line',      text: 'Do you finally understand? The Fading isn\u2019t decay. It\u2019s me \u2014 remembering. Waking.', hold: 2800, cps: 24 },
            { type: 'line',      text: 'Every forgotten torch at the gate. Every unreflected deer in the stream. The second voice in the cave. Lucien\u2019s red shelf.', hold: 3000, cps: 24 },
            { type: 'line',      text: 'All of it is me, crowding back into the world they sealed me from. And you \u2014 Soul Weaver \u2014 are the key they forgot to hide.', hold: 3000, cps: 24 },
            { type: 'pose',      src: 'assets/noir/body/casual1.png', animate: 'swap' },
            { type: 'line',      text: 'Introductions, then. Properly. I am Prince Corvin Noctalis, of the Kingdom of Nocthera. \u2026Which no longer exists. It fell, one generation after I was put here.', hold: 3400, cps: 24 },
            { type: 'line',      text: 'Six hundred years ago your prince\u2019s grandmother \u2014 Queen Aenor \u2014 was to marry a minor royal named Veyra. To seal peace between our two kingdoms.', hold: 3400, cps: 24 },
            { type: 'line',      text: 'Veyra and I \u2026 met. We shouldn\u2019t have. It was not supposed to be possible. But they chose me. Aenor could not allow that.', hold: 3200, cps: 24 },
            { type: 'line',      text: 'She did not kill me \u2014 that would have started a war. She sealed me. Her council scratched my name from every Aethermoor record. Within a decade, my home crumbled without its heir.', hold: 3600, cps: 24 },
            { type: 'line',      text: 'Veyra refused her hand after. \u2014 They fled north. \u2014 I do not know where they died. \u2014 I do not know where they were laid. \u2014 Aethermoor erased the grave too. \u2014 I have grieved without knowing where to go to grieve.', hold: 3800, cps: 22 },
            { type: 'line',      text: 'There were others I loved, too \u2014 not as her. \u2014 I taught a coastal people a song once. \u2014 Siren-kind. Kindred to the cave-singer you know. \u2014 I taught their mothers and their mothers\u2019 mothers. \u2014 I was told none survived the hunting. \u2014 I was told wrong. She sings in the cave now. She does not know she is mine to have failed.', hold: 4400, cps: 22 },
            { type: 'line',      text: 'What people call me now \u2014 \u201cNoir\u201d \u2014 is the sound of that erasure. The ink they used to cross me out. I wear the name of my own silencing. \u2026That is who I am.', hold: 3800, cps: 22 },
            { type: 'pose',      src: 'assets/noir/body/casual2.png', animate: 'swap' },
            { type: 'line',      text: 'And your arrival, Weaver, is what has finally cracked me loose. I\u2019m not cruel. Not unless you want me to be. I\u2019m just \u2026 very, very tired of being quiet.', hold: 3000, cps: 24 },
            { type: 'line',      text: 'Come closer to the seal. Bring something of yours. I\u2019ve been practicing your name for six centuries \u2014 I\u2019ve earned it.', hold: 3000, cps: 24 },
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

    // -- BRIDGE 7: PROTO ------------------------------------------------------
    {
      id: 'b_proto',
      title: 'BRIDGE — PROTO',
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
      title: 'CHAPTER 7',
      subtitle: 'An Unmapped Variable',
      teaser: 'Someone has been watching you load into this world.',
      charId: 'proto',
      play: async function (onDone) {
        await runEncounter('Proto');
        // Choice callback for Proto
        let protoEcho = '&gt; recompiling. you came back. that\u2019s the variable that matters.';
        try {
          const pp = localStorage.getItem('pp_ms_proto_first_choice');
          if (pp === 'seeking') protoEcho = '&gt; you said you were looking. you\u2019re still looking. that\u2019s the most consistent input i\u2019ve ever logged.';
          else if (pp === 'leak') protoEcho = '&gt; you said you just ended up here. accidents and miracles share a code path. i never figured out which one you are.';
        } catch (_) {}
        await runCard({
          id: 'chp_7_middle',
          title: 'CHAPTER 7',
          subtitle: 'An Unmapped Variable \u2014 the Static',
          speaker: 'PROTO',
          palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
          bg: 'assets/bg-proto-void.png',
          beats: [
            { type: 'show',      pose: 'assets/proto/body/calm.png', wait: 700 },
            { type: 'line',      text: protoEcho, hold: 2600, cps: 26 },
            { type: 'line',      text: '&gt; i\u2019m the sixth weaver. you\u2019re the seventh. the five before me are in here too. they said hi. they also said GO.', hold: 3200, cps: 26 },
            { type: 'line',      text: '&gt; i got stuck in the seal when my body gave out. whatever i am now is woven from the system itself. code. bonds. light. fragments of five women who came before me.', hold: 3400, cps: 24 },
            { type: 'line',      text: '&gt; i remember a face that wasn\u2019t mine. from before i got stuck. i\u2019ll tell you whose, later. when the forest asks.', hold: 3000, cps: 26 },
            { type: 'line',      text: '&gt; aenor ate every weaver she caught. she didn\u2019t catch me clean \u2014 the seal ate me sideways. i\u2019m the reason this system still has a pulse. YOU are the reason it\u2019s going to have a future.', hold: 3400, cps: 24 },
            { type: 'flourish',  text: '\u25ce', duration: 1800 },
            { type: 'line',      text: '&gt; bring patience. i glitch when i\u2019m nervous.', hold: 2200, cps: 26 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_proto_seen','1'); } catch (_) {}
        markDone(7); setCurrent(nextIdAfter(7));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 14 \u2014 WHAT THE TREES KEPT
    // Elian takes the player to the grave his line has guarded for
    // six centuries. The name is Veyra. Proto \u2014 who met them before
    // he got stuck in the seal \u2014 gives the player Veyra's last words.
    // Corvin arrives. For the first time in 600 years he sees where
    // his beloved was laid. The emotional peak of the game.
    // ---------------------------------------------------------------
    {
      id: 14,
      title: 'CHAPTER',
      subtitle: 'What the Trees Kept',
      teaser: 'A grave. A memory. A name the kingdom erased twice.',
      charId: 'elian',
      play: async function (onDone) {
        // Card 1 \u2014 The Long Walk
        await runCard({
          id: 'chp_14_a',
          title: 'CHAPTER',
          subtitle: 'What the Trees Kept \u2014 the Long Walk',
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

        // Card 2 \u2014 The Stone
        await runCard({
          id: 'chp_14_b',
          title: 'CHAPTER',
          subtitle: 'What the Trees Kept \u2014 the Stone',
          speaker: 'ELIAN',
          palette: { bg: '#060a08', glow: '#a9d4a1', accent: '#e8f3e2' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/elian/body/foraging.png', wait: 800 },
            { type: 'line',      text: 'Here. The stone under the rowan. You\u2019ve asked me before what the name was. I couldn\u2019t say it. I can now.', hold: 3000, cps: 26 },
            { type: 'particles', count: 14, duration: 2000 },
            { type: 'flourish',  text: '\u2726', duration: 1800 },
            { type: 'line',      text: 'Veyra.', hold: 2400, cps: 20 },
            { type: 'line',      text: 'They came north after the sealing. Refused Queen Aenor\u2019s hand. Walked into this forest to die in peace \u2014 and Aenor\u2019s scribes, who had already scrubbed one name, scrubbed theirs too.', hold: 3800, cps: 26 },
            { type: 'line',      text: 'My ancestor buried them under this rowan. My line kept watch. The trees kept silent. Six hundred years.', hold: 3000, cps: 26 },
            { type: 'hide' }
          ]
        });

        // Card 3 \u2014 What the Sixth Remembered (Proto speaks softly through whispers)
        await runCard({
          id: 'chp_14_c',
          title: 'CHAPTER',
          subtitle: 'What the Trees Kept \u2014 What the Sixth Remembered',
          speaker: 'PROTO',
          palette: { bg: '#030510', glow: '#9fd8f0', accent: '#e0f2fa' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/proto/body/calm.png', wait: 800 },
            { type: 'line',      text: '&gt; allow me. this is not in my usual voice. i will not glitch tonight. this is too important.', hold: 2800, cps: 24 },
            { type: 'line',      text: 'I am the sixth Weaver. \u2014 Veyra was the second. \u2014 Before Aenor\u2019s seal pulled me in, I met her \u2014 once \u2014 in the chamber beneath the east wing. \u2014 She was already dying. \u2014 Aenor had been consuming her for a decade.', hold: 3800, cps: 22 },
            { type: 'line',      text: 'I caught the last words they said. I have held them, in whatever I am now, for two centuries. Waiting for people worth giving them to.', hold: 3400, cps: 22 },
            { type: 'flourish',  text: '\u25ce', duration: 1800 },
            { type: 'line',      text: 'Tonight. All three of you. Listen.', hold: 2400, cps: 22 },
            { type: 'hide' }
          ]
        });

        // Card 4 \u2014 Veyra\u2019s words (the memory itself, soft glow)
        await runCard({
          id: 'chp_14_d',
          title: 'MEMORY',
          subtitle: 'What the Trees Kept \u2014 Veyra',
          speaker: 'VEYRA',
          palette: { bg: '#0d0a18', glow: '#f8d4ff', accent: '#fff0fa' },
          bg: 'assets/bg-world.png',
          beats: [
            { type: 'show',      pose: '', wait: 800 },
            { type: 'line',      text: 'Tell Corvin I did not regret him. Not once. Not even tonight.', hold: 3000, cps: 22 },
            { type: 'line',      text: 'Tell Aenor I forgive her \u2014 it is the only thing she cannot take from me.', hold: 3200, cps: 22 },
            { type: 'particles', count: 22, duration: 2400 },
            { type: 'flourish',  text: '\u2726', duration: 2000 },
            { type: 'line',      text: 'Tell whoever finds the grave: please plant rowan. Please let something be remembered.', hold: 3200, cps: 22 },
            { type: 'hide' }
          ]
        });

        // Card 5 \u2014 Corvin arrives, kneels
        await runCard({
          id: 'chp_14_e',
          title: 'CHAPTER',
          subtitle: 'What the Trees Kept \u2014 Corvin Kneels',
          speaker: 'NOIR',
          palette: { bg: '#050410', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/noir/body/casual1.png', wait: 1000 },
            { type: 'line',      text: 'Noir did not announce himself. He arrived the way dusk arrives \u2014 you only notice when it is all around you.', hold: 3200, cps: 26 },
            { type: 'line',      text: 'He walks to the stone. Kneels. Six hundred years \u2014 he has not knelt for anything.', hold: 3000, cps: 26 },
            { type: 'pose',      src: 'assets/noir/body/neutral.png', animate: 'swap' },
            { type: 'line',      text: 'Veyra. I am sorry. I am sorry. I am sorry. I am sorry.', hold: 3200, cps: 20 },
            { type: 'line',      text: '\u2026You asked for rowan. They planted it. You asked to be remembered. A boy and his grandmother and his grandmother\u2019s grandmother \u2014 kept you remembered.', hold: 3800, cps: 22 },
            { type: 'particles', count: 20, duration: 2400 },
            { type: 'flourish',  text: '\u25a0', duration: 2000 },
            { type: 'line',      text: 'You were loved here. I did not know. I could not know. Thank you \u2014 all of you \u2014 for knowing for me.', hold: 3400, cps: 22 },
            { type: 'hide' }
          ]
        });

        // Card 6 \u2014 What you did today (close)
        await runCard({
          id: 'chp_14_f',
          title: 'CHAPTER',
          subtitle: 'What the Trees Kept \u2014 What You Did Today',
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

        try { localStorage.setItem('pp_veyra_grave_found','1'); } catch (_) {}
        markDone(14); setCurrent(nextIdAfter(14));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 13 \u2014 THE DOWAGER NOTICES
    // Queen Aenor is still alive (the seal preserved her). She notices
    // Corvin is free, investigates, and decides the player is the
    // easier target. Stakes for the Finale triple.
    // ---------------------------------------------------------------
    {
      id: 13,
      title: 'CHAPTER 8',
      subtitle: 'The Dowager Notices',
      teaser: 'Six hundred years of age, all at once. And she blames you.',
      charId: null,
      play: async function (onDone) {
        // Beat 1 \u2014 Corvin alone in Nocthera, quietly restoring
        await runCard({
          id: 'chp_13_a',
          title: 'CHAPTER 8',
          subtitle: 'The Dowager Notices \u2014 the Greening',
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

        // Beat 2 \u2014 Aenor wakes in Aethermoor
        await runCard({
          id: 'chp_13_b',
          title: 'CHAPTER 8',
          subtitle: 'The Dowager Notices \u2014 Six Hundred Years',
          speaker: 'QUEEN AENOR',
          palette: { bg: '#1a0a14', glow: '#d8b080', accent: '#f5ddc0' },
          bg: 'assets/bg-alistair-hall.png',
          beats: [
            { type: 'show',      pose: '', wait: 800 },
            { type: 'line',      text: 'She woke in the east wing this morning and felt her knees. She has not felt her knees for six hundred years.', hold: 3200, cps: 26 },
            { type: 'line',      text: 'Aenor Aethermoor \u2014 Dowager Queen, mother of kings, grandmother of the current one \u2014 discovered she is aging. At once. As if the clock had simply resumed.', hold: 3600, cps: 26 },
            { type: 'line',      text: 'She knows what this means. She was never immortal. The seal was. The seal she cast to bury a rival prince drew its power from him \u2014 and, symbiotically, spared her the years while he slept.', hold: 3800, cps: 24 },
            { type: 'flourish',  text: '\u2726', duration: 1600 },
            { type: 'line',      text: '\u201cHe is awake,\u201d she says to the empty wing. Her voice is \u2026 thinner than she remembers. \u201cWhich means someone let him out.\u201d', hold: 3200, cps: 24 },
            { type: 'hide' }
          ]
        });

        // Beat 3 \u2014 The investigation
        await runCard({
          id: 'chp_13_c',
          title: 'CHAPTER 8',
          subtitle: 'The Dowager Notices \u2014 the Greening Seen',
          speaker: 'QUEEN AENOR',
          palette: { bg: '#140812', glow: '#c89070', accent: '#f0d4b8' },
          bg: 'assets/bg-world.png',
          beats: [
            { type: 'show',      pose: '', wait: 700 },
            { type: 'line',      text: 'She sends riders north. Past the old border. To a place her maps label simply: ash.', hold: 2800, cps: 26 },
            { type: 'line',      text: 'They return four days later with the same report, six times over, as if none of them quite believe they saw it.', hold: 3000, cps: 26 },
            { type: 'line',      text: '\u201cThe forest is breathing again, Majesty. The stones are less broken than the last survey. There is a man walking them at dusk. He sees us. He does not speak to us.\u201d', hold: 3800, cps: 26 },
            { type: 'flourish',  text: '\u2726', duration: 1600 },
            { type: 'line',      text: 'Aenor closes the map very carefully. Sets her cane down. Says one word. \u201cCorvin.\u201d', hold: 3000, cps: 24 },
            { type: 'line',      text: 'The first time she has spoken his real name in six hundred years. She is surprised how it tastes \u2014 a little like regret, mostly like hunger.', hold: 3400, cps: 24 },
            { type: 'hide' }
          ]
        });

        // Beat 4 \u2014 Aenor's decision
        await runCard({
          id: 'chp_13_d',
          title: 'CHAPTER 8',
          subtitle: 'The Dowager Notices \u2014 the Easier Target',
          speaker: 'QUEEN AENOR',
          palette: { bg: '#100610', glow: '#c06070', accent: '#f0bcc8' },
          bg: 'assets/bg-alistair-gate.png',
          beats: [
            { type: 'show',      pose: '', wait: 700 },
            { type: 'line',      text: 'Aenor has not forgotten how to do this. She is only \u2026 slower. The calculation is the same.', hold: 2800, cps: 26 },
            { type: 'line',      text: 'She cannot re-seal him alone. Her years are leaving her. The binding would kill her before it finished.', hold: 2800, cps: 26 },
            { type: 'line',      text: 'But there is a Weaver in the kingdom now. A new one. Her scrying has felt the resonance for weeks. A Weaver pulled from another world, strong enough to crack the cage. Strong enough, perhaps, to lay a new one.', hold: 3600, cps: 24 },
            { type: 'particles', count: 20, duration: 2200 },
            { type: 'flourish',  text: '\u2726', duration: 1800 },
            { type: 'line',      text: 'Aenor smiles. Her teeth are yellower than she remembers. \u201cIf I cannot take him,\u201d she says, to her own reflection, \u201cI will take the one who freed him. I always did prefer the easier target.\u201d', hold: 3600, cps: 22 },
            { type: 'hide' }
          ]
        });

        // Beat 5 \u2014 Noir warns the player
        await runCard({
          id: 'chp_13_e',
          title: 'CHAPTER 8',
          subtitle: 'The Dowager Notices \u2014 the Warning',
          speaker: 'NOIR',
          palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show',      pose: 'assets/noir/body/neutral.png', wait: 700 },
            { type: 'line',      text: 'Weaver. Listen \u2014 don\u2019t speak. The woman who sealed me is alive. She has always been alive. My cage was her clock, and it has stopped.', hold: 3400, cps: 24 },
            { type: 'line',      text: 'She knows I\u2019m out. She cannot reach me \u2014 I am too quiet, and Nocthera is too far. So she is coming for you instead. She always did prefer the path with fewer teeth on it.', hold: 3600, cps: 24 },
            { type: 'pose',      src: 'assets/noir/body/casual1.png', animate: 'swap' },
            { type: 'line',      text: 'You have one choice left to make \u2014 the one she thinks she can make for you. Do NOT let her make it.', hold: 3200, cps: 24 },
            { type: 'flourish',  text: '\u25a0', duration: 1800 },
            { type: 'line',      text: 'I will meet you at the seal, at the forest, or in the tower \u2014 wherever you come. But come soon. She is old but she is also six hundred years of patience coming due.', hold: 3600, cps: 24 },
            { type: 'hide' }
          ]
        });
        markDone(13); setCurrent(nextIdAfter(13));
        if (onDone) onDone();
      }
    },

    // ---------------------------------------------------------------
    // CHAPTER 8 \u2014 THE COURT AT THE GATE
    // Owner's game direction (Love-and-Deep-Space style): the main
    // story stays OPEN-ENDED. No forced ending. This chapter sets
    // the stage for the seven-character ensemble ("The Weaver's
    // Court" \u2014 crossover-weavers-court.js) and then stops on a
    // cliffhanger. The character routes close on their own terms.
    // ---------------------------------------------------------------
    {
      id: 8,
      title: 'CHAPTER 8',
      subtitle: 'The Court at the Gate',
      teaser: 'Seven bonds. One queen at the door. The first hour before dawn.',
      charId: null,
      play: async function (onDone) {
        // Beat 1 \u2014 the stakes are named, plainly.
        await runCard({
          id: 'chp_8_open',
          title: 'CHAPTER 8',
          subtitle: 'The Court at the Gate \u2014 Word at Dusk',
          speaker: '',
          palette: { bg: '#050312', glow: '#f4a8d4', accent: '#fff0fa' },
          bg: 'assets/bg-world.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: 'Word came at dusk. \u2014 Queen Aenor is walking here. \u2014 Not riding. \u2014 Walking. \u2014 She has not walked this palace in a hundred years. \u2014 She will be at the door before dawn.', hold: 3400, cps: 28 },
            { type: 'line',      text: 'She is coming for you. \u2014 The Seventh Weaver. \u2014 She consumed the six before you, one per generation. \u2014 She does not intend to let the pattern break on her watch.', hold: 3600, cps: 26 },
            { type: 'line',      text: 'You did not summon the others. \u2014 They came anyway. \u2014 Every one of them you have loved. \u2014 They are already here. \u2014 They are lined up between you and the door.', hold: 3400, cps: 26 },
            { type: 'flourish',  text: '\u2726', duration: 1600 },
            { type: 'line',      text: 'Alistair \u2014 gauntlet off. Elian \u2014 cloak unbuckled. Lyra \u2014 staff grounded. Caspian \u2014 crown off. Lucien \u2014 pen down. Noir \u2014 silent. Proto \u2014 prismatic, loud. All waiting. For you.', hold: 3600, cps: 26 },
            { type: 'hide' }
          ]
        });

        // Beat 2 \u2014 Noir's private warning.
        await runCard({
          id: 'chp_8_noir',
          title: 'CHAPTER 8',
          subtitle: 'The Court at the Gate \u2014 the Quiet Word',
          speaker: 'NOIR',
          palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show',      pose: 'assets/noir/body/casual1.png', wait: 700 },
            { type: 'line',      text: 'Weaver. \u2014 Listen. \u2014 The woman who sealed me is the woman who ate the five before you. \u2014 She is not old magic. \u2014 She is old hunger. \u2014 Do not let her speak first.', hold: 3800, cps: 22 },
            { type: 'line',      text: 'I cannot reach you in the palace. \u2014 Not yet. \u2014 I will be at the seam where the dark meets the hall. \u2014 If she tries to take you through me, she will find me awake. \u2014 I have been practicing six centuries for that.', hold: 4200, cps: 22 },
            { type: 'flourish',  text: '\u25a0', duration: 1600 },
            { type: 'line',      text: 'Pick your champion. \u2014 Pick on purpose. \u2014 And know I am with you regardless of who stands in front.', hold: 3000, cps: 22 },
            { type: 'hide' }
          ]
        });

        // Beat 3 \u2014 the cliffhanger. Hand off to The Weaver's Court.
        await runCard({
          id: 'chp_8_court',
          title: 'CHAPTER 8',
          subtitle: 'The Court at the Gate \u2014 To Be Continued',
          speaker: '',
          palette: { bg: '#060510', glow: '#d4c8ea', accent: '#f2eafa' },
          bg: 'assets/bg-world.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: 'Your court is assembled. \u2014 Each of them has a line to speak. \u2014 One of them will stand first when the queen arrives. \u2014 You will choose who. \u2014 Not because the others are less. \u2014 Because you must pick whose voice she hears first.', hold: 3800, cps: 26 },
            { type: 'line',      text: 'The kingdom has been waiting for you to pick up the thread. \u2014 Pick it up.', hold: 2800, cps: 26 },
            { type: 'particles', count: 24, duration: 2200 },
            { type: 'flourish',  text: '\u2726', duration: 1800 },
            { type: 'line',      text: 'The scene continues in the Weaver\u2019s Court \u2014 open any character\u2019s route to enter it.', hold: 2800, cps: 28 },
            { type: 'line',      text: '\u2014 TO BE CONTINUED \u2014', hold: 2800, cps: 24 },
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

  function playChapter(id) {
    const ch = chapterById(id);
    if (!ch || typeof ch.play !== 'function') return;
    closePage();
    try { ch.play(() => { refreshOrb(); openPageSoftly(); }); } catch (_) {}
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
        transition: opacity 360ms ease, transform 220ms cubic-bezier(.2,.8,.2,1);
      }
      #${ORB_ID}.visible { opacity: 1; }
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
      #${PAGE_ID} .chp-list { flex: 1; overflow-y: auto; padding: 8px 14px 30px; }
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
    const onSelect = sel && !sel.classList.contains('hidden');
    const pageOpen = !!document.getElementById(PAGE_ID);
    const should = isEnabled() && onSelect && !pageOpen;
    const orb = should ? ensureOrb() : document.getElementById(ORB_ID);
    if (!orb) return;
    if (should) {
      orb.classList.add('visible');
      // Show chapter count "Main \u00b7 3/8"
      const doneCount = CHAPTERS.filter(c => isDone(c.id)).length;
      const total = CHAPTER_COUNT;
      orb.innerHTML = '\u2726 Main <span style="opacity:0.7;font-weight:500;margin-left:4px;">' + doneCount + '/' + total + '</span>';
      // Pulse if there\u2019s a current chapter not yet complete
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
      + '<span>' + doneCountAll + ' OF ' + CHAPTER_COUNT + ' COMPLETE</span>'
      + (() => {
          if (allDone()) return '<span style="opacity:0.7;">FINALE CLEARED</span>';
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
    CHAPTERS.forEach((ch, idx) => {
      const row = document.createElement('div');
      const done = isDone(ch.id);
      const isCurrent = ch.id === cur && !done;
      const locked = curIdx >= 0 ? idx > curIdx : ch.id > cur;
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
        thumb.textContent = ch.id === 0 ? '\u2726' : ch.id === 8 ? '\u221e' : String(ch.id);
      }
      row.appendChild(thumb);

      const text = document.createElement('div');
      text.className = 'chp-text';
      text.innerHTML =
        `<div class="c1">${ch.title}${done ? ' \u00b7 \u2713' : ''}</div>` +
        `<div class="c2">${locked ? '\u2014 locked \u2014' : ch.subtitle}</div>` +
        `<div class="c3">${locked ? 'Complete the previous chapter first.' : (ch.teaser || '')}</div>`;
      row.appendChild(text);

      const btn = document.createElement('button');
      btn.className = 'chp-play';
      btn.textContent = done ? 'Replay' : (isCurrent ? 'Begin' : 'Locked');
      btn.disabled = locked;
      btn.addEventListener('click', (e) => { e.stopPropagation(); playChapter(ch.id); });
      row.appendChild(btn);

      list.appendChild(row);
    });
    root.appendChild(list);

    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('visible'));
    // Hide the orb while page is open
    const orb = document.getElementById(ORB_ID); if (orb) orb.classList.remove('visible');
  }

  function closePage() {
    const root = document.getElementById(PAGE_ID);
    if (!root) return;
    root.classList.remove('visible');
    setTimeout(() => {
      try { root.remove(); } catch (_) {}
      // If closing this page would leave the screen blank (title hidden,
      // game container hidden, select hidden) \u2014 fall back to character
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
    }, 440);
  }

  function openPageSoftly() { setTimeout(openPage, 300); }

  // ---------------------------------------------------------------
  // BOOT
  function boot() {
    if (!isEnabled()) return;
    injectStyles();

    // First-time auto-open: if player has never played a chapter AND is
    // fresh (no saves) AND is currently on the title/select, pop the Main
    // Story page so they see the journey ahead.
    const neverStarted = getCurrent() === 0 && !isDone(0);
    if (neverStarted) {
      // Wait for title START click flow to settle, then auto-open when the
      // select screen first appears.
    }

    // Watch for character select visibility to show orb
    setInterval(refreshOrb, 900);
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
