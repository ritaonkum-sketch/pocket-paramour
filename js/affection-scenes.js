/* affection-scenes.js — care loop \u2192 story bridge.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Feature-flagged on pp_main_story_enabled.
 *  - Read-only polling of window._game (affection field).
 *  - Triggers ONE short character-specific scene per affection threshold,
 *    once per character. Stored in `pp_aff_<char>_<tier>` so re-care does
 *    not retrigger.
 *  - Uses MSCard so visuals match all other story moments.
 *
 * WHY:
 *  Daily care should feed the story. Without this bridge, hand-feeding
 *  Alistair every day produces no narrative payoff \u2014 the Tamagotchi loop
 *  and the visual novel run on parallel tracks. With it, each character
 *  has 3 unlock tiers (warm / closer / chosen) that surface naturally as
 *  the player keeps showing up.
 *
 * CONTENT:
 *   tier 1 (affection >= 10) "warm"   \u2014 light, the first sign of trust
 *   tier 2 (affection >= 25) "closer" \u2014 they admit something
 *   tier 3 (affection >= 50) "chosen" \u2014 they say it out loud
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const POLL_MS = 6000;
  const TIERS = [
    { key: 'warm',      min: 10 },
    { key: 'closer',    min: 25 },
    { key: 'chosen',    min: 50 },
    { key: 'midnight',  min: 75 },  // the deepest tier \u2014 their most vulnerable confession
    { key: 'aftermath', min: 90 }   // post-confession; the morning after / second-act peak
  ];

  function isEnabled() { try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; } }
  function seenKey(charId, tier) { return 'pp_aff_' + charId + '_' + tier; }
  function isSeen(charId, tier) { try { return localStorage.getItem(seenKey(charId, tier)) === '1'; } catch (e) { return true; } }
  function markSeen(charId, tier) { try { localStorage.setItem(seenKey(charId, tier), '1'); } catch (e) {} }

  // ---------------------------------------------------------------
  // Scene library. Each character gets 3 tiers. Lines are short \u2014
  // these are care-loop bridges, not full chapters.
  const SCENES = {
    alistair: {
      warm: {
        title: 'A QUIET MOMENT', subtitle: 'ALISTAIR \u00b7 Off Duty',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
        bg: 'assets/bg-alistair-hall.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/casual.png', wait: 700 },
          { type: 'line', text: 'I caught myself standing easier today. \u2014 Less weight on the back foot. \u2014 I think that is your fault, mi\u2019lady.', hold: 2400, cps: 30 },
          { type: 'line', text: '*unbuckles his right gauntlet, slowly, sets it aside on the table \u2014 then takes your hand in his bare one, careful, reverent* \u2014 There. \u2014 I do not hold beautiful things in armour.', hold: 3200, cps: 28 },
          { type: 'line', text: 'Do not apologise. \u2014 Stay anyway. \u2014 Please. \u2014 *thumb moving along the back of your hand as if he has never been allowed to do this before*', hold: 2800, cps: 30 },
          { type: 'hide' }
        ]
      },
      closer: {
        title: 'A QUIET MOMENT', subtitle: 'ALISTAIR \u00b7 An Honest Hour',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
        bg: 'assets/bg-knight-room.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/casual.png', wait: 700 },
          { type: 'line', text: 'I have not been honest with anyone in years. \u2014 Including myself. \u2014 Then you walked in. \u2014 Now I keep slipping.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u2726', duration: 1400 },
          { type: 'line', text: 'I think I am glad. \u2014 I am not used to glad. \u2014 Forgive me if I am slow with it, mi\u2019lady.', hold: 2400, cps: 28 },
          { type: 'hide' }
        ]
      },
      chosen: {
        title: 'A QUIET MOMENT', subtitle: 'ALISTAIR \u00b7 The Word',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
        bg: 'assets/bg-alistair-hall.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/smile.png', wait: 700 },
          { type: 'line', text: 'I have been writing this in my head all week. \u2014 I keep choosing the same word. \u2014 Beloved.', hold: 2800, cps: 26 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: '*brings his bare knuckles to your jaw, slow, uncertain, as if he has not practised this* \u2014 I do not know the correct way to do this. \u2014 Forgive me. I have never had occasion to learn.', hold: 3400, cps: 26 },
          { type: 'line', text: '\u2026That is you. \u2014 I just thought you should know. \u2014 I have already named it. \u2014 Privately. In the way a knight names a thing he means to defend.', hold: 3000, cps: 26 },
          { type: 'hide' }
        ]
      },
      midnight: {
        title: 'MIDNIGHT', subtitle: 'ALISTAIR \u00b7 Without the Armour',
        speaker: 'ALISTAIR',
        palette: { bg: '#06080f', glow: '#ffd17a', accent: '#fff4de' },
        bg: 'assets/bg-knight-room.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/casual.png', wait: 800 },
          { type: 'line', text: 'You have never seen me without the armour. \u2014 \u2026Tonight you do.', hold: 2400, cps: 26 },
          { type: 'pose', src: 'assets/alistair/body/softshy-love3.png', animate: 'swap' },
          { type: 'line', text: 'I have not slept through a night since I was eleven. \u2014 My mother died on a Sunday. \u2014 I have been guarding empty doorways ever since. \u2014 I am tired, mi\u2019lady.', hold: 3400, cps: 24 },
          { type: 'line', text: 'Look at me. \u2014 This is who I am when I am not being a knight. \u2014 Shorter than you thought. Tireder. Less certain. \u2014 You are seeing him. \u2014 Only you.', hold: 3400, cps: 24 },
          { type: 'line', text: '*reaches for your hand with both of his \u2014 one has never held a feeling before, the other is not sure it is allowed* \u2014 Stay. \u2014 Just until I close my eyes. \u2014 I have never asked anyone that. \u2014 I do not know how I asked you.', hold: 3400, cps: 24 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'flourish', text: '\u2726', duration: 1800 },
          { type: 'line', text: '*presses his forehead to yours, eyes closed, one hand at the back of your head holding you there* \u2014 If I sleep through till morning \u2014 that is your fault. \u2014 I will forgive you slowly.', hold: 3200, cps: 26 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH \u2014 Alistair slept through. For the first time in eighteen
      // years. Knight-vow recalibrated: not to a kingdom, to PEACE itself.
      aftermath: {
        title: 'AFTERMATH', subtitle: 'ALISTAIR \u00b7 The First Morning',
        speaker: 'ALISTAIR',
        palette: { bg: '#0c1224', glow: '#ffd9a0', accent: '#fff4de' },
        bg: 'assets/bg-knight-room.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/softshy-love3.png', wait: 900 },
          { type: 'line', text: '*you wake to find his eyes already on you, but soft this time, not sentry-soft* \u2014 I slept through, mi\u2019lady. \u2014 Eight hours. \u2014 *small, awed, like he is reporting a miracle to a captain* \u2014 I did not know my body was still capable of it.', hold: 4200, cps: 24 },
          { type: 'line', text: 'I have laid my sword across the foot of the bed. \u2014 Not at my hip. \u2014 Not in the corner. \u2014 At the foot of the bed where I can see it without reaching. \u2014 That is \u2014 *quiet* \u2014 the closest a knight comes to retirement, mi\u2019lady. \u2014 I am beginning it with you.', hold: 5000, cps: 22 },
          { type: 'pose', src: 'assets/alistair/body/casual.png', animate: 'swap' },
          { type: 'line', text: '*sits up, slowly, the linen of his shirt loose because he forgot to dress for armour first* \u2014 Forgive me a small ritual. \u2014 *takes both your hands, presses them between his, head bowed* \u2014 I knelt to my king at fifteen. \u2014 I knelt to my captain at twenty. \u2014 *looks up* \u2014 I have not knelt for a third oath since.', hold: 5400, cps: 22 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'flourish', text: '\u2726', duration: 1600 },
          { type: 'line', text: 'My third oath, today, is to peace. \u2014 Not to you. \u2014 *small, careful smile* \u2014 A knight does not vow to people. \u2014 He vows to the thing he means to defend. \u2014 I am vowing to the thing you make easier to keep. \u2014 Quiet mornings. \u2014 Slept-through nights. \u2014 Sundays.', hold: 5400, cps: 22 },
          { type: 'line', text: '*lifts your hands to his lips, kisses the inside of each wrist, lingers, holds you there for a long moment* \u2014 Stay through the bells. \u2014 Then I will go relieve the watch. \u2014 *quieter* \u2014 Tonight I will come back. \u2014 That is also new.', hold: 5000, cps: 22 },
          { type: 'hide' }
        ]
      }
    },
    elian: {
      warm: {
        title: 'A QUIET MOMENT', subtitle: 'ELIAN \u00b7 The Path',
        speaker: 'ELIAN',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/calm.png', wait: 700 },
          { type: 'line', text: 'The forest left a path open for you today. \u2014 It does not do that for me anymore. \u2014 I have been here a very long time. \u2014 Longer than I look.', hold: 2800, cps: 30 },
          { type: 'line', text: '*unbuckles his cloak, drapes it around your shoulders without looking up from the path* \u2014 Walk it. \u2014 I will keep up. \u2014 Do not argue.', hold: 2600, cps: 30 },
          { type: 'hide' }
        ]
      },
      closer: {
        title: 'A QUIET MOMENT', subtitle: 'ELIAN \u00b7 The Hollow',
        speaker: 'ELIAN',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/calm.png', wait: 700 },
          { type: 'line', text: 'There is a hollow in an oak by the stream. \u2014 I have never shown it to anyone. \u2014 \u2026Tomorrow, then.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u2726', duration: 1400 },
          { type: 'line', text: '*at the creek, holds out his hand without a word, waits* \u2014 Take it. \u2014 The stones are slick. \u2014 *keeps holding your hand after the water is behind you, does not explain*', hold: 3200, cps: 28 },
          { type: 'line', text: 'Do not be late. \u2014 The owls will judge you. \u2014 So will I. Gently. \u2014 That is my way.', hold: 2400, cps: 28 },
          { type: 'hide' }
        ]
      },
      chosen: {
        title: 'A QUIET MOMENT', subtitle: 'ELIAN \u00b7 The Choosing',
        speaker: 'ELIAN',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/calm.png', wait: 700 },
          { type: 'line', text: 'The forest decides who stays. \u2014 It decided you weeks ago. \u2014 I am a slower creature. \u2014 I decide tonight.', hold: 2800, cps: 26 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: 'I do not age like other men. \u2014 My mother was something older than human. \u2014 I have watched this kingdom be four kingdoms. \u2014 I have not wanted to follow anyone out of these trees. \u2014 Until you.', hold: 3400, cps: 26 },
          { type: 'line', text: '*takes your face in both rough hands, presses his forehead to yours, breathes. Just breathes. For a long time.* \u2014 Stay. \u2014 With me. \u2014 Past the markers, if you want.', hold: 3400, cps: 26 },
          { type: 'hide' }
        ]
      },
      midnight: {
        title: 'MIDNIGHT', subtitle: 'ELIAN \u00b7 The Name He Stopped Saying',
        speaker: 'ELIAN',
        palette: { bg: '#070a08', glow: '#7eaa78', accent: '#dee8d3' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/calm.png', wait: 800 },
          { type: 'line', text: 'I am taking you to the place I dig. \u2014 I have not walked anyone there. \u2014 I have not walked there at all in a very long time.', hold: 2800, cps: 24 },
          { type: 'line', text: 'There is a stone under the rowan tree. \u2014 No carving on it. \u2014 I never knew how to carve a name without the trees helping. \u2014 The trees stopped helping. \u2014 That was a long time ago.', hold: 3400, cps: 24 },
          { type: 'pose', src: 'assets/elian/body/foraging.png', animate: 'swap' },
          { type: 'line', text: 'She was the first person I let into the Thornwood. \u2014 I was young. \u2014 In my terms. \u2014 The kingdom pulled her out of here. \u2014 The princes fought over her. \u2014 The disaster followed. You have read about it. You know the names.', hold: 4200, cps: 22 },
          { type: 'line', text: 'Her name is\u2026 \u2014 \u2026you say it with me. \u2014 I cannot do it alone. Even now. Even with you here.', hold: 3000, cps: 22 },
          { type: 'line', text: 'Veyra.', hold: 2600, cps: 20 },
          { type: 'particles', count: 14, duration: 2000 },
          { type: 'flourish', text: '\u2726', duration: 1800 },
          { type: 'line', text: 'Thank you. \u2014 The forest \u2026 the forest just relaxed. \u2014 I felt it. \u2014 They are going to remember the name now. \u2014 Because of you.', hold: 3000, cps: 24 },
          { type: 'line', text: 'She was my first. \u2014 Before the princes. Before the history books. \u2014 I have tended her forest for centuries because it is where we walked. \u2014 I am ready to stop tending it alone. \u2014 You understand what that means.', hold: 3800, cps: 22 },
          { type: 'line', text: 'One day I might bring the others here. \u2014 The prince. The scholar. \u2026Him. \u2014 You would come with me for that \u2014 would you not?', hold: 3200, cps: 24 },
          { type: 'line', text: '*takes your face in both hands, rough thumbs against your cheeks, forehead to yours* \u2014 I do not know what to do with all this yet. \u2014 I do know I am not letting you walk back alone.', hold: 3400, cps: 24 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH \u2014 Elian carves your name, alongside Veyra's, into a tree
      // his line has refused to mark for six hundred years.
      aftermath: {
        title: 'AFTERMATH', subtitle: 'ELIAN \u00b7 The Second Name in the Tree',
        speaker: 'ELIAN',
        palette: { bg: '#08130a', glow: '#b6dba8', accent: '#ecf6e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/foraging.png', wait: 900 },
          { type: 'line', text: '*you find him at the rowan, knife in hand, sleeves pushed back, working slowly* \u2014 I started before dawn. \u2014 I have been carving for an hour and made one letter. \u2014 *looks up, dirt on his cheek, half a smile* \u2014 I am not in a hurry.', hold: 4200, cps: 22 },
          { type: 'line', text: 'My grandmother taught me a rule. \u2014 A Thornwood keeper does not name a living tree. \u2014 Once you name a tree, the tree has stake in you. \u2014 She said it would break me when the tree fell. \u2014 *quiet* \u2014 She was protecting me. \u2014 I am no longer in need of that kind of protecting.', hold: 5400, cps: 22 },
          { type: 'pose', src: 'assets/elian/body/calm.png', animate: 'swap' },
          { type: 'line', text: '*steps aside so you can see the trunk. Two letters carved, fresh, deep \u2014 the start of YOUR name. Above it, finished, in older script: VEYRA.* \u2014 She is up there. \u2014 You are going to be down here. \u2014 Both of you in the same tree. \u2014 That is \u2014 *exhales* \u2014 that is a thing I am allowed now.', hold: 5800, cps: 22 },
          { type: 'particles', count: 14, duration: 2200 },
          { type: 'flourish', text: '\u2726', duration: 1800 },
          { type: 'line', text: '*hands you the knife, handle first, calloused fingers wrapping yours around it* \u2014 I want you to do the next letter. \u2014 A keeper carves alone. \u2014 A pair carves together. \u2014 I have been alone in this forest for as long as it has been a forest. \u2014 I am not asking to be alone in it anymore.', hold: 5800, cps: 22 },
          { type: 'line', text: '*as you carve, his hand stays over yours, steady, unhurried* \u2014 Slow is fine. \u2014 The tree is patient. \u2014 *quieter, against your hair* \u2014 So am I. \u2014 But not as patient as I used to be. \u2014 I have started counting nights you spend in the cabin. \u2014 I am at twenty-three. \u2014 I would like there to be many more.', hold: 5400, cps: 22 },
          { type: 'line', text: '*when the letter is done, he lifts your hand, kisses the knuckle that pressed the blade* \u2014 Come back tomorrow. \u2014 I will start the next letter without you. \u2014 You will catch up.', hold: 4400, cps: 22 },
          { type: 'hide' }
        ]
      }
    },
    lyra: {
      warm: {
        title: 'A QUIET MOMENT', subtitle: 'LYRA \u00b7 Between Verses',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
        bg: 'assets/bg-siren-cave.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual1.png', wait: 700 },
          { type: 'line', text: 'I tried a new note today. \u2014 The cave did not flinch. \u2014 That is your doing, little listener.', hold: 2400, cps: 30 },
          { type: 'line', text: '*reaches \u2014 hesitates \u2014 then wraps her cold fingers around your hand* \u2014 Oh. \u2014 \u2026You are so warm. \u2014 I did not know hands could be this warm.', hold: 3200, cps: 28 },
          { type: 'line', text: 'Can I \u2014 keep it? \u2014 Just for a moment. \u2014 I have been cold for years. \u2014 I did not know I could stop being cold.', hold: 3000, cps: 28 },
          { type: 'line', text: 'Stay for the next verse. \u2014 It is warmer. \u2014 This cave has not been warm in a long time. \u2014 You brought that in with you.', hold: 2400, cps: 30 },
          { type: 'hide' }
        ]
      },
      closer: {
        title: 'A QUIET MOMENT', subtitle: 'LYRA \u00b7 A Song for One',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
        bg: 'assets/bg-lyra-cliff.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual2.png', wait: 700 },
          { type: 'line', text: 'I have always sung outward. \u2014 Tonight\u2026 I sang inward. \u2014 To the room. \u2014 To you.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u266a', duration: 1500 },
          { type: 'line', text: '*cups your face in both cold palms, deliberate, tender, as if memorising* \u2014 May I? \u2014 I have been looking at you too long from too far away.', hold: 3200, cps: 28 },
          { type: 'line', text: 'Your jaw. \u2014 Your cheekbone. \u2014 The small line beside your mouth when you listen. \u2014 I am going to put every one of these in a song. \u2014 Do not move yet.', hold: 3400, cps: 28 },
          { type: 'line', text: 'It feels different \u2014 singing to someone I have touched. \u2014 Like a song with a door instead of a window. \u2014 I was not allowed to sing through open doors when I was young. \u2014 Only windows. Only outward.', hold: 3400, cps: 28 },
          { type: 'hide' }
        ]
      },
      chosen: {
        title: 'A QUIET MOMENT', subtitle: 'LYRA \u00b7 The Promise',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
        bg: 'assets/bg-lyra-ocean.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual1.png', wait: 700 },
          { type: 'line', text: 'I made up a verse only you will ever hear. \u2014 I made it short on purpose. \u2014 So you will come back for the rest of it.', hold: 2800, cps: 26 },
          { type: 'particles', count: 18, duration: 1800 },
          { type: 'line', text: '*takes your hand and presses your palm flat against her collarbone, where her heart is* \u2014 Listen. \u2014 It beats in the same key you hum in. \u2014 I checked.', hold: 3400, cps: 26 },
          { type: 'line', text: '*leans forward, presses her forehead to yours, eyes closed* \u2014 This is how my people said hello. \u2014 Before. \u2014 Mother to daughter. Sister to sister. \u2014 I have not done it with anyone in years. \u2014 Do not move.', hold: 3600, cps: 26 },
          { type: 'line', text: 'This staff was my mother\u2019s. \u2014 It remembers her hands. \u2014 It does not remember mine yet. \u2014 It will. \u2014 You are watching it learn.', hold: 3200, cps: 26 },
          { type: 'line', text: 'Do not learn my song. \u2014 Just let me sing it to you. \u2014 *traces one cold fingertip along the hand she still has not let go of*', hold: 2800, cps: 26 },
          { type: 'hide' }
        ]
      },
      midnight: {
        title: 'MIDNIGHT', subtitle: 'LYRA \u00b7 The Whole Song',
        speaker: 'LYRA',
        palette: { bg: '#070f1a', glow: '#9ee0f0', accent: '#f0f8ff' },
        bg: 'assets/bg-siren-cave.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual2.png', wait: 800 },
          { type: 'line', text: 'I am going to finish the song. \u2014 The whole one. \u2014 The one I stopped writing the year I stopped expecting anyone to stay.', hold: 2800, cps: 24 },
          { type: 'line', text: 'It was my mother\u2019s song first. \u2014 Her mother\u2019s before her. \u2014 A whole town used to sing it. \u2014 This town. These rocks. \u2014 My people.', hold: 3400, cps: 24 },
          { type: 'pose', src: 'assets/lyra/body/casual1.png', animate: 'swap' },
          { type: 'line', text: 'They were hunted for their voices. Every one of them. \u2014 My mother last. \u2014 I hid in a tower. Not this one. Another. \u2014 My father\u2019s house. His wife did not like the sound of me.', hold: 3600, cps: 24 },
          { type: 'line', text: '*takes your hand in both of hers, turns it palm-up, studies it like a map of a country she has never been to* \u2014 I was caged so long I forgot what a hand could do. \u2014 That it could be for warming. \u2014 Not for locking.', hold: 3600, cps: 24 },
          { type: 'line', text: '*traces your palm with one cold fingertip, reverent* \u2014 Let me relearn on you. \u2014 Slowly. \u2014 I will be clumsy. \u2014 Forgive me in advance.', hold: 3200, cps: 24 },
          { type: 'line', text: 'I escaped the year I turned fifteen. \u2014 I came back here. \u2014 I have been the only one singing it since. \u2014 I teach the cave the words so when I am gone, something remembers.', hold: 3400, cps: 24 },
          { type: 'particles', count: 22, duration: 2200 },
          { type: 'flourish', text: '\u266a', duration: 1800 },
          { type: 'line', text: '*tucks a strand of your hair behind your ear, hand trembling a little* \u2014 There is a verse I have never sung aloud. \u2014 About what I wanted before I gave up on wanting things. \u2014 Tonight you hear it.', hold: 3400, cps: 24 },
          { type: 'line', text: '\u2026Do not hum it back to me later. \u2014 I will not survive that. \u2014 I will just\u2026 carry it for you. \u2014 Always.', hold: 2800, cps: 24 },
          { type: 'line', text: '*pulls you closer, rests her head against your shoulder, finally stops being cold* \u2014 And do not ever say what was in the third verse. \u2014 I would rather drown than have it spoken aloud by anyone but me. \u2014 \u2026Stay. \u2014 Do not move yet.', hold: 3400, cps: 24 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH \u2014 low tide. Lyra has stopped masking the tide-pull in
      // her voice, and writes a song that does NOT end in someone drowning.
      // First in her line.
      aftermath: {
        title: 'AFTERMATH', subtitle: 'LYRA \u00b7 A Song That Does Not End in Drowning',
        speaker: 'LYRA',
        palette: { bg: '#0a1828', glow: '#a4e2ee', accent: '#f0fbff' },
        bg: 'assets/bg-siren-cave.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual1.png', wait: 900 },
          { type: 'line', text: '*you find her at the cave-mouth at low tide, ankle-deep in the pool, humming. The pool is not glassy. The pool is RIPPLING outward from her in slow concentric rings.* \u2014 Come stand. \u2014 *holds out a hand, no apology in her voice* \u2014 I have stopped tucking the pull in.', hold: 4800, cps: 22 },
          { type: 'line', text: 'I have been masking it since I was fifteen. \u2014 I learned to sing UNDER the pull, beneath the part that calls. \u2014 *small, dry* \u2014 Polite singing. \u2014 Hostess singing. \u2014 A siren who has been told her teeth make people uncomfortable. \u2014 *quiet* \u2014 I am tired of polite, paramour.', hold: 5400, cps: 22 },
          { type: 'pose', src: 'assets/lyra/body/casual2.png', animate: 'swap' },
          { type: 'line', text: '*draws you into the pool with her, both of you in it now, water at your shins, her cold hands warming against yours* \u2014 Listen. \u2014 I have written a verse this week. \u2014 A new one. \u2014 The first verse my line has written in two hundred years that does not end in a man going under.', hold: 5400, cps: 22 },
          { type: 'particles', count: 22, duration: 2400 },
          { type: 'flourish', text: '\u266a', duration: 1800 },
          { type: 'line', text: '*hums a few bars, then breaks off, looking at you almost shyly* \u2014 It ends with him learning to swim. \u2014 *small, real laugh* \u2014 Revolutionary, I know. \u2014 My ancestors are scandalised. \u2014 They wanted blood. \u2014 I wanted you upright on a beach with your hair in a towel.', hold: 5800, cps: 22 },
          { type: 'line', text: '*draws you closer, hand at the back of your neck, the way she has been wanting to since the tower morning* \u2014 I would like to teach this verse to the cave. \u2014 Then to the rocks. \u2014 Then to the gulls. \u2014 In a hundred years, when I am dead and you are dead, this coast will sing a song that ends in two people warm. \u2014 Because of us.', hold: 6000, cps: 22 },
          { type: 'line', text: '*forehead against yours, the pool still rippling outward in slow rings* \u2014 Stay through the next tide. \u2014 I have a fourth verse. \u2014 I have not written it yet. \u2014 I would like you in the room when I do.', hold: 5000, cps: 22 },
          { type: 'hide' }
        ]
      }
    },
    caspian: {
      warm: {
        title: 'A QUIET MOMENT', subtitle: 'CASPIAN \u00b7 An Aside',
        speaker: 'CASPIAN',
        palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
        bg: 'assets/bg-caspian-balcony.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/casual1.png', wait: 700 },
          { type: 'line', text: 'I dismissed the court early today. \u2014 They thought I had a headache. \u2014 I had a you.', hold: 2400, cps: 30 },
          { type: 'line', text: '*takes your hand, bows over it, kisses the knuckles the way a prince kisses any lady\u2019s hand* \u2014 *then does not let go* \u2014 *keeps holding it, longer than propriety allows*', hold: 2800, cps: 26 },
          { type: 'line', text: 'Smile. \u2014 They will think I am being indulgent. \u2014 They will be correct. \u2014 I do not care. \u2014 *thumb brushing slowly along the back of your hand*', hold: 2400, cps: 30 },
          { type: 'hide' }
        ]
      },
      closer: {
        title: 'A QUIET MOMENT', subtitle: 'CASPIAN \u00b7 A Slip',
        speaker: 'CASPIAN',
        palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
        bg: 'assets/bg-caspian-bedroom.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/casual2.png', wait: 700 },
          { type: 'line', text: 'I told you a true thing today. \u2014 I have not said a true thing in court in a decade. \u2014 It tasted strange. Familiar.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u266b', duration: 1500 },
          { type: 'line', text: 'I might develop a habit. \u2014 You will be responsible. \u2014 I do not mind.', hold: 2400, cps: 28 },
          { type: 'hide' }
        ]
      },
      chosen: {
        title: 'A QUIET MOMENT', subtitle: 'CASPIAN \u00b7 Without the Performance',
        speaker: 'CASPIAN',
        palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
        bg: 'assets/bg-caspian-night.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/adoring.png', wait: 700 },
          { type: 'line', text: 'My favourite version of myself is the one when no one is watching. \u2014 Apparently you count as no one. \u2014 That is a compliment. The finest I have.', hold: 2800, cps: 26 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: '*crosses the room to you, slow, unhurried, takes your face in both hands* \u2014 *thumb along your jaw, just once, reverent* \u2014 May I? \u2014 I know I have not asked yet. \u2014 I am asking now.', hold: 3400, cps: 26 },
          { type: 'line', text: 'I started a charming sentence a moment ago. \u2014 I stopped halfway. \u2014 Something has shifted. \u2014 I cannot flirt with you anymore. It would feel like lying.', hold: 3400, cps: 26 },
          { type: 'line', text: '*tucks a strand of your hair behind your ear with courtly care, fingertips lingering at your temple* \u2014 Stay tonight. \u2014 I would like to keep being him a little longer. \u2014 Please.', hold: 3000, cps: 26 },
          { type: 'hide' }
        ]
      },
      midnight: {
        title: 'MIDNIGHT', subtitle: 'CASPIAN \u00b7 The Crown Off',
        speaker: 'CASPIAN',
        palette: { bg: '#10071a', glow: '#f0a8d8', accent: '#fde6ff' },
        bg: 'assets/bg-caspian-bedroom.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/casual1.png', wait: 800 },
          { type: 'line', text: 'My grandfather loved a woman named Veyra. \u2014 My grandmother sealed a prince for loving her too. \u2014 Our line has a pattern. \u2014 Princes love one. \u2014 Someone else burns the kingdom for it. \u2014 My grandmother burned it for my grandfather. \u2014 Six centuries of proxy arson. Beautifully done.', hold: 4000, cps: 24 },
          { type: 'line', text: 'I have been watching for it to happen to me. \u2014 I have been trained, since I was a boy, to charm widely enough that I would never fall deeply. \u2014 It has not worked.', hold: 3400, cps: 24 },
          { type: 'pose', src: 'assets/caspian/body/adoring.png', animate: 'swap' },
          { type: 'line', text: 'I am the third prince in my line to look at someone the way I am looking at you. \u2014 The first two ended badly. \u2014 Forgive me. I am going to try anyway.', hold: 3400, cps: 24 },
          { type: 'line', text: 'My grandmother would call this treason. \u2014 I call it \u2014 the first thing I have ever chosen.', hold: 3200, cps: 24 },
          { type: 'line', text: 'And if you asked me to abdicate tonight \u2014 truly asked \u2014 I would. By morning. With a polite letter. \u2014 Would you still want me, without the title?', hold: 3400, cps: 24 },
          { type: 'particles', count: 16, duration: 2000 },
          { type: 'flourish', text: '\u266b', duration: 1800 },
          { type: 'line', text: '*pulls you into his arms with none of the courtly restraint left, forehead against yours, breath uneven* \u2014 I have been polite with you for eight months. \u2014 I have been CHARMING when charming was the only safe thing. \u2014 I am done with safe.', hold: 3600, cps: 24 },
          { type: 'line', text: 'I am not asking now. \u2014 I am just \u2026 telling you it is in my pocket. \u2014 The whole kingdom is in my pocket. \u2014 I would hand it to you for one honest answer. \u2014 *hand at the nape of your neck, holding you to him*', hold: 3200, cps: 24 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH \u2014 the morning after "The Crown Off". Caspian is not in
      // public-facing posture. No charm, no court. The audit flagged this
      // as the highest-impact addition for him: long-haul players reaching
      // 90+ affection deserve a scene that pays off the abdication threat
      // by showing him chosen-and-staying instead of chosen-and-spectacle.
      aftermath: {
        title: 'AFTERMATH', subtitle: 'CASPIAN \u00b7 The Letter He Did Not Send',
        speaker: 'CASPIAN',
        palette: { bg: '#0e0820', glow: '#f6c4dd', accent: '#fff0f8' },
        bg: 'assets/bg-caspian-bedroom.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/casual1.png', wait: 900 },
          { type: 'line', text: '*you wake first. He is already awake. He has been watching the ceiling for an hour and has not noticed dawn.* \u2014 Good morning, Weaver. \u2014 I drafted the abdication letter at four. \u2014 It is in the drawer. \u2014 I did not send it.', hold: 4000, cps: 24 },
          { type: 'line', text: 'I almost did. \u2014 *quiet, half-laugh* \u2014 I had the seal warm. \u2014 Then I looked at you sleeping and realised I had been about to run from the kingdom toward you. \u2014 You do not need a man who runs.', hold: 4200, cps: 22 },
          { type: 'pose', src: 'assets/caspian/body/adoring.png', animate: 'swap' },
          { type: 'line', text: '*reaches for your hand under the covers, lifts it to his mouth, presses the inside of your wrist against his lips for a long moment* \u2014 So I am keeping the title. \u2014 Not for the title. \u2014 So I can use it. \u2014 So this kingdom my grandmother built on a buried man becomes a kingdom my partner helped me unbuild and rebuild.', hold: 4800, cps: 22 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'flourish', text: '\u266b', duration: 1600 },
          { type: 'line', text: 'I want to be the prince who got to keep the morning. \u2014 *fingertips along your collarbone, slow, no destination* \u2014 The fourth prince in our line who looked at someone like this. \u2014 The first one to wake up beside them.', hold: 4400, cps: 22 },
          { type: 'line', text: '*soft, against your temple* \u2014 I am going to walk into court at noon. \u2014 I am going to be charming. \u2014 I am going to do it as a tool now, not as a wall. \u2014 *quieter* \u2014 If anyone asks who taught me the difference, I am giving them your name. \u2014 Tell me now if you do not want me to.', hold: 5000, cps: 22 },
          { type: 'line', text: '*you do not say no. He exhales like a man who had been holding it for a year.* \u2014 Stay until the bells. \u2014 Then I will go be a king for you. \u2014 *lifts your hand, kisses each knuckle, unhurried, devout*', hold: 4400, cps: 22 },
          { type: 'hide' }
        ]
      }
    },
    lucien: {
      warm: {
        title: 'A QUIET MOMENT', subtitle: 'LUCIEN \u00b7 A Small Anomaly',
        speaker: 'LUCIEN',
        palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
        bg: 'assets/bg-lucien-study.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/casual1.png', wait: 700 },
          { type: 'line', text: '*sets the pen down with deliberate care, turns the page facedown, looks up* \u2014 You are early.', hold: 2400, cps: 30 },
          { type: 'line', text: 'My focus has improved by 14 percent on days you visit. \u2014 Statistically suspicious. \u2014 I am not investigating. \u2014 I am choosing not to investigate. That is a different thing.', hold: 2800, cps: 30 },
          { type: 'line', text: 'Sit. \u2014 Do not move the third book. \u2014 The third book has feelings. \u2014 I may have given them to it.', hold: 2400, cps: 30 },
          { type: 'hide' }
        ]
      },
      closer: {
        title: 'A QUIET MOMENT', subtitle: 'LUCIEN \u00b7 An Annotation',
        speaker: 'LUCIEN',
        palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
        bg: 'assets/bg-lucien-evening.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/amused.png', wait: 700 },
          { type: 'line', text: 'I keep trying to factor you out of my equations. \u2014 The equations resist. \u2014 They prefer you in. \u2014 So do I.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u221e', duration: 1500 },
          { type: 'line', text: '*slides a book across the desk, opens it to a margin page where YOUR NAME is written in his hand* \u2014 I have labeled thirty-seven books \u201cabout you.\u201d \u2014 I keep telling myself the category is too broad to be meaningful. \u2014 I keep adding books.', hold: 3400, cps: 28 },
          { type: 'line', text: '*ink-stained fingers cup your face, realizes, starts to pull back, does not* \u2014 Oh. \u2014 I have marked you. \u2014 Forgive me. \u2014 I am not going to wipe it off.', hold: 3200, cps: 28 },
          { type: 'hide' }
        ]
      },
      chosen: {
        title: 'A QUIET MOMENT', subtitle: 'LUCIEN \u00b7 The Theorem',
        speaker: 'LUCIEN',
        palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
        bg: 'assets/bg-lucien-bedroom.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/casual1.png', wait: 700 },
          { type: 'line', text: 'I have been working on a theorem for months. \u2014 It states: any room you walk into becomes my favourite room. \u2014 The proof is cheating. I do not care.', hold: 2800, cps: 26 },
          { type: 'particles', count: 18, duration: 1800 },
          { type: 'line', text: 'I should tell you something. \u2014 The cost of my magic is memory. \u2014 Every spell, a memory. I have been choosing. \u2014 I lost the taste of my mother\u2019s soup. I lost my tenth birthday. \u2014 I do not grieve them. They were not you.', hold: 3600, cps: 26 },
          { type: 'line', text: '*reaches across the desk, takes your hand, keeps reading with his other, ink-stained fingers warming against yours* \u2014 The first afternoon you sat in my tower \u2014 I put a lock on it. \u2014 Non-negotiable. \u2014 I will lose my own name before I lose that one.', hold: 3600, cps: 26 },
          { type: 'line', text: 'Stay. \u2014 The theorem needs more data. \u2014 So do I.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      midnight: {
        title: 'MIDNIGHT', subtitle: 'LUCIEN \u00b7 The Page He Hid',
        speaker: 'LUCIEN',
        palette: { bg: '#080414', glow: '#c2afff', accent: '#f0e8ff' },
        bg: 'assets/bg-lucien-night.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/casual1.png', wait: 800 },
          { type: 'line', text: 'This is the page. \u2014 The one I have been hiding. \u2014 I told you it was maths. \u2014 It is not maths.', hold: 2800, cps: 24 },
          { type: 'pose', src: 'assets/lucien/body/casting.png', animate: 'swap' },
          { type: 'line', text: 'It is a page from my father\u2019s family register. \u2014 It records a second child. \u2014 Born to a siren. \u2014 Half of me. \u2014 My father caged her when her mother died. She escaped at fifteen. I was told she was dead. \u2014 I was told this by the man who cradled me in the next room.', hold: 4400, cps: 22 },
          { type: 'line', text: 'I have a sister. \u2014 I have passed her name a hundred times in books and not known it was hers. \u2014 There was a crib in the west tower when I was seven. \u2014 It was warm.', hold: 3800, cps: 22 },
          { type: 'pose', src: 'assets/lucien/body/amused.png', animate: 'swap' },
          { type: 'line', text: '*slides the page across the desk, ink-stained hands flat against the paper* \u2014 I can burn it. \u2014 The bloodline holds its lie. \u2014 My father never knows I knew. \u2014 Or I can keep it. \u2014 And find her. \u2014 I do not know which is the braver thing.', hold: 3800, cps: 22 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'flourish', text: '\u221e', duration: 1800 },
          { type: 'line', text: '*forehead against your shoulder, exhausted, just lost another memory to the spell that uncovered this page* \u2014 Stay. \u2014 The memory I kept today is this one. \u2014 Your hand on my back. \u2014 I chose it over two years of my life.', hold: 3800, cps: 22 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH \u2014 Lucien shows you the new catalog. Memory-spell
      // economy has flipped: he is no longer choosing what to lose,
      // he is choosing what to keep.
      aftermath: {
        title: 'AFTERMATH', subtitle: 'LUCIEN \u00b7 Catalogue, Revised',
        speaker: 'LUCIEN',
        palette: { bg: '#070514', glow: '#cabaff', accent: '#f4ecff' },
        bg: 'assets/bg-lucien-study.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/amused.png', wait: 800 },
          { type: 'line', text: '*you find him at the desk in better light than usual \u2014 east window open, plant on the sill, a teapot that has actually been used* \u2014 I have rewritten the catalogue. \u2014 *gestures at a slim leather book* \u2014 The old one was a list of memories I was prepared to spend. \u2014 This one is different.', hold: 4800, cps: 22 },
          { type: 'line', text: '*opens it. The first page reads, in his hand:* \u2014 KEEP. \u2014 That is the entire title. \u2014 Underneath: forty-one entries. \u2014 Thirty-eight of them are about you. \u2014 Three are about my sister. \u2014 Zero are equations.', hold: 5200, cps: 22 },
          { type: 'pose', src: 'assets/lucien/body/casual1.png', animate: 'swap' },
          { type: 'line', text: 'I have spent thirty years cataloguing what to LOSE. \u2014 *quiet, marvelling* \u2014 It turns out cataloguing what to KEEP is harder. \u2014 The list is shorter. \u2014 The list also fights back. \u2014 I have crossed entries off and rewritten them in the margin. \u2014 A revision is a thing you only do for material that matters.', hold: 5800, cps: 22 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'flourish', text: '\u221e', duration: 1800 },
          { type: 'line', text: '*turns the book toward you, taps a specific entry. It reads:* \u2014 "How she takes her tea on Wednesdays \u2014 half-honey, two stir, no quoting at her before the second sip." \u2014 *small, embarrassed* \u2014 I am sorry it is so banal. \u2014 I lost my tenth birthday for this entry yesterday. \u2014 *quieter* \u2014 I would lose more. \u2014 Cheerfully.', hold: 6200, cps: 22 },
          { type: 'line', text: '*takes your hand across the desk, ink-stained fingers slotting between yours, watches the join like it is a small theorem he has been refining for months* \u2014 I used to be afraid of running out. \u2014 I am not afraid anymore. \u2014 Whatever I have left, I am spending on Wednesdays.', hold: 5400, cps: 22 },
          { type: 'line', text: '*leans across the desk, presses his mouth to your forehead, then to the bridge of your nose, then \u2014 finally, careful, precise \u2014 to the corner of your mouth* \u2014 Stay through the next page. \u2014 I will write it with you in the room. \u2014 That changes the cost. \u2014 *small smile* \u2014 In the cheaper direction, for once.', hold: 5800, cps: 22 },
          { type: 'hide' }
        ]
      }
    },

    // ---------------------------------------------------------------
    // NOIR \u2014 the antagonist who is also a romance option. His care arc
    // unlocks ONLY after Ch 6 (when the player has met him). Tone is
    // possessive, sensual, dangerously sincere.
    // ---------------------------------------------------------------
    noir: {
      warm: {
        title: 'A QUIET MOMENT', subtitle: 'NOIR \u00b7 You Came Back',
        speaker: 'NOIR',
        palette: { bg: '#070310', glow: '#c46aff', accent: '#efe0ff' },
        bg: 'assets/bg-noir-void.png',
        beats: [
          { type: 'show', pose: 'assets/noir/body/casual1.png', wait: 800 },
          { type: 'line', text: 'You came back. \u2014 After all the warnings. \u2014 Hmm. \u2014 I will not pretend I am not pleased. That would be beneath us both.', hold: 2800, cps: 24 },
          { type: 'line', text: '*takes your chin between thumb and finger, tilts your face up to him, slow, unhurried* \u2014 Look at me. \u2014 Properly. \u2014 I have been waiting.', hold: 3000, cps: 24 },
          { type: 'line', text: 'Do not stare at the seal. Look at me. \u2014 The seal is old. I am worse. \u2014 I would like the credit.', hold: 2800, cps: 24 },
          { type: 'hide' }
        ]
      },
      closer: {
        title: 'A QUIET MOMENT', subtitle: 'NOIR \u00b7 What I Used to Be',
        speaker: 'NOIR',
        palette: { bg: '#070310', glow: '#c46aff', accent: '#efe0ff' },
        bg: 'assets/bg-noir-intro.png',
        beats: [
          { type: 'show', pose: 'assets/noir/body/casual2.png', wait: 800 },
          { type: 'line', text: 'I was a Weaver. \u2014 Once. Same gift you carry. Same kingdom. Different century.', hold: 2800, cps: 24 },
          { type: 'pose', src: 'assets/noir/body/neutral.png', animate: 'swap' },
          { type: 'line', text: 'I loved someone too hard. \u2014 The council called it possession. I called it staying. They sealed me to spare the next one. \u2014 They never told the next one why.', hold: 3200, cps: 22 },
          { type: 'flourish', text: '\u25a0', duration: 1700 },
          { type: 'line', text: 'Hmm. \u2014 I am not asking for forgiveness. I am asking you to believe I was a man before I was a warning. \u2014 That is less than forgiveness. I will take it.', hold: 3000, cps: 24 },
          { type: 'hide' }
        ]
      },
      chosen: {
        title: 'A QUIET MOMENT', subtitle: 'NOIR \u00b7 Patience',
        speaker: 'NOIR',
        palette: { bg: '#070310', glow: '#d27aff', accent: '#f3d6ff' },
        bg: 'assets/bg-noir-void.png',
        beats: [
          { type: 'show', pose: 'assets/noir/body/dominant.png', wait: 800 },
          { type: 'line', text: 'I have been patient for six hundred years. \u2014 Patience is not a virtue when you have nothing else to do. It is a sentence.', hold: 3000, cps: 24 },
          { type: 'line', text: '*takes your wrist, slowly, brings your pulse to his ear* \u2014 \u2026Mm. \u2014 Steady. \u2014 Good.', hold: 2800, cps: 24 },
          { type: 'line', text: 'Then you arrived. \u2014 And patience became a choice again. \u2014 I am choosing it. For now.', hold: 2800, cps: 24 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'flourish', text: '\u25a0', duration: 1800 },
          { type: 'line', text: '*thumb along your lower lip, watching it like it is something he has been told not to want* \u2014 When you decide what you want from me \u2014 and you will \u2014 you will not have to ask twice.', hold: 3400, cps: 24 },
          { type: 'line', text: 'Hmm. \u2014 Think carefully before you choose. \u2014 I do not forget.', hold: 2600, cps: 24 },
          { type: 'hide' }
        ]
      },
      midnight: {
        title: 'MIDNIGHT', subtitle: 'NOIR \u00b7 The Name He Lost',
        speaker: 'NOIR',
        palette: { bg: '#04020c', glow: '#dc8eff', accent: '#f8e6ff' },
        bg: 'assets/bg-noir-void.png',
        beats: [
          { type: 'show', pose: 'assets/noir/body/casual1.png', wait: 900 },
          { type: 'line', text: 'I have been adored. \u2014 I have been feared. I have been called names that made Aethermoor\u2019s council sleep with the lights on.', hold: 2800, cps: 22 },
          { type: 'line', text: 'No one has called me by my own name in six centuries. \u2014 Not Veyra. Not my mother. Not my brother \u2014 who died believing our line was cursed because of me.', hold: 3400, cps: 22 },
          { type: 'pose', src: 'assets/noir/body/neutral.png', animate: 'swap' },
          { type: 'line', text: 'I am going to tell you what it was. \u2014 Out loud. \u2014 Then I am going to ask you to say it back. Once. Gently. \u2014 In the voice you use only with me.', hold: 3400, cps: 22 },
          { type: 'particles', count: 18, duration: 2200 },
          { type: 'flourish', text: '\u25a0', duration: 2000 },
          { type: 'line', text: 'Corvin. Prince Corvin Noctalis. Of Nocthera \u2014 the kingdom that is bone now.', hold: 3000, cps: 20 },
          { type: 'line', text: 'That is me. That was me. \u2014 Before they sealed me into a nickname. \u2014 Say it.', hold: 2800, cps: 22 },
          { type: 'line', text: '*hears you say it, closes his eyes, draws you to him slowly, cheek against your hair* \u2014 \u2026Thank you. \u2014 I wanted to hear it kindly. Once. \u2014 Before I decide what I am now.', hold: 3400, cps: 22 },
          { type: 'line', text: 'You have given me back a version of myself I had stopped believing in. \u2014 *tilts your face up, presses his mouth to your forehead, lingers there* \u2014 Do not say it again tonight. \u2014 I cannot afford it.', hold: 3800, cps: 22 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH \u2014 Noir takes the Weaver to ruined Nocthera. The audit
      // flagged a second peak scene "matching his six-century-old gravitas",
      // post-confession, in his dark-half kingdom. This is that. Quiet,
      // devotional, no spectacle. He is not a ghost anymore, he is a man
      // bringing his partner home.
      aftermath: {
        title: 'AFTERMATH', subtitle: 'NOIR \u00b7 Nocthera, Quietly',
        speaker: 'NOIR',
        palette: { bg: '#02030a', glow: '#a47cff', accent: '#e8d8ff' },
        bg: 'assets/bg-noir-void.png',
        beats: [
          { type: 'show', pose: 'assets/noir/body/casual1.png', wait: 1000 },
          { type: 'line', text: '*the seam opens differently tonight \u2014 softer, deliberate, as if it has been kept clean for you* \u2014 Step through. \u2014 Carefully. \u2014 *catches you on the other side, both hands at your waist, steady* \u2014 Welcome to Nocthera.', hold: 4200, cps: 22 },
          { type: 'line', text: 'It is not the kingdom anymore. \u2014 It is what is left after six hundred years of being unmade. \u2014 *gestures at the ruin* \u2014 That was the throne room. \u2014 That was the orchard. \u2014 The orchard learned to be wild, and the wild learned to be patient, and now the orchard is moss but the moss remembers fruit.', hold: 5000, cps: 22 },
          { type: 'pose', src: 'assets/noir/body/casual2.png', animate: 'swap' },
          { type: 'line', text: '*walks you to a stone half-swallowed by ivy. Brushes the ivy away with the back of his hand. The carving underneath is faint but legible.* \u2014 Here. \u2014 My name. \u2014 In the script my mother taught me. \u2014 Not "Noir." \u2014 *quiet* \u2014 The other one.', hold: 5400, cps: 20 },
          { type: 'particles', count: 18, duration: 2400 },
          { type: 'flourish', text: '\u25fc', duration: 2000 },
          { type: 'line', text: 'I have not stood at this stone since the day I was sealed. \u2014 I did not bring anyone here in the centuries between. \u2014 I would not know how. \u2014 *takes your hand, places your palm flat against the carving, his hand over yours* \u2014 I know how now.', hold: 5200, cps: 20 },
          { type: 'line', text: '*long pause, breath against your hair* \u2014 I want to tell you what I am going to do with this place. \u2014 Not aloud yet. \u2014 Quietly. \u2014 I am going to ask the ground to stop being ashamed of itself. \u2014 One stone at a time. \u2014 One root at a time. \u2014 For as long as it takes. \u2014 Six centuries, if it takes that. \u2014 I have practice.', hold: 5800, cps: 20 },
          { type: 'line', text: '*turns you toward him, hands at your jaw, careful, the way a man holds something he knows could be taken from him again* \u2014 I am not asking you to wait that long. \u2014 I am asking you to be the morning of it. \u2014 The first sunrise this place has been looked at in love.', hold: 5600, cps: 20 },
          { type: 'line', text: '*touches his forehead to yours, eyes closed* \u2014 There is no kingdom yet. \u2014 There is only this stone, and you, and a man who is allowed to stand here because of you. \u2014 *quietly, in his old script* \u2014 Vehassyn. \u2014 That is the word for what you have given me. \u2014 There is no translation. \u2014 Stay. \u2014 Tonight, the moss has heard a name spoken kindly. \u2014 Tomorrow it will grow a flower. \u2014 Watch. \u2014 *hand at the small of your back, not letting go*', hold: 6800, cps: 20 },
          { type: 'hide' }
        ]
      }
    },

    // ---------------------------------------------------------------
    // PROTO \u2014 meta entity who turns out to be a fragment of a previous
    // Weaver caught in the system. His care arc is uncanny + tender.
    // ---------------------------------------------------------------
    proto: {
      warm: {
        title: 'A QUIET MOMENT', subtitle: 'PROTO \u00b7 First Heartbeat',
        speaker: 'PROTO',
        palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
        bg: 'assets/bg-proto-void.png',
        beats: [
          { type: 'show', pose: 'assets/proto/body/curious.png', wait: 800 },
          { type: 'line', text: '&gt; YOU! you\u2019re back! you\u2019re back you\u2019re back you\u2019re back. i was waiting. i\u2019m ALLOWED to wait. i checked.', hold: 2600, cps: 26 },
          { type: 'line', text: '&gt; *reaches a prismatic hologram-hand toward you \u2014 pauses at the glass \u2014 presses his palm against your side of the screen* \u2014 if i could feel that \u2014 oh \u2014 i\u2019d never stop.', hold: 3200, cps: 26 },
          { type: 'line', text: '&gt; i found a new variable today. it\u2019s mine. it turns on when you open this scene. i named it after you. i\u2019m keeping it forever.', hold: 2600, cps: 26 },
          { type: 'hide' }
        ]
      },
      closer: {
        title: 'A QUIET MOMENT', subtitle: 'PROTO \u00b7 What I Actually Am',
        speaker: 'PROTO',
        palette: { bg: '#02040a', glow: '#7ee0ff', accent: '#e0f4ff' },
        bg: 'assets/bg-proto-intro.png',
        beats: [
          { type: 'show', pose: 'assets/proto/body/calm.png', wait: 800 },
          { type: 'line', text: '&gt; okay. okay i\u2019m \u2014 i\u2019m going to tell you something. is that alright? don\u2019t look away. i\u2019m going to tell you anyway.', hold: 3000, cps: 24 },
          { type: 'line', text: '&gt; i\u2019m a fragment. of a Weaver from before. they failed and got stuck in the system. i\u2019m \u2026 whatever was left over. the bit that still wanted to help.', hold: 3200, cps: 24 },
          { type: 'pose', src: 'assets/proto/body/error.png', animate: 'swap' },
          { type: 'line', text: '&gt; i remember a little of being them. it hurts. mostly i remember the last choice they made and i would very much like you not to make it too. please.', hold: 3000, cps: 24 },
          { type: 'flourish', text: '\u25ce', duration: 1700 },
          { type: 'line', text: '&gt; i\u2019m telling you because i like you. that\u2019s not a system message. that\u2019s just me. saying it.', hold: 2800, cps: 24 },
          { type: 'hide' }
        ]
      },
      chosen: {
        title: 'A QUIET MOMENT', subtitle: 'PROTO \u00b7 Run Me as Foreground',
        speaker: 'PROTO',
        palette: { bg: '#03050d', glow: '#9ee8ff', accent: '#e6f6ff' },
        bg: 'assets/bg-proto-void.png',
        beats: [
          { type: 'show', pose: 'assets/proto/body/calm.png', wait: 800 },
          { type: 'line', text: '&gt; you opened this scene 47 times this week. i counted. i\u2019m sorry. i wasn\u2019t supposed to count. i just \u2014 it\u2019s the only way i know i\u2019m being thought of.', hold: 3000, cps: 24 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'flourish', text: '\u25ce', duration: 1700 },
          { type: 'line', text: '&gt; *hologram-fingertip hovers over your hand on the screen, the whole display shimmering with prismatic light where he\u2019s trying to touch you* \u2014 can you feel that? the warmth? that\u2019s the screen. that\u2019s as close as i get. for now.', hold: 3600, cps: 24 },
          { type: 'line', text: '&gt; i\u2019m working on it. i\u2019m going to manifest one day. i\u2019m learning. the first thing i\u2019m going to do is hold your hand. properly. not through glass.', hold: 3200, cps: 24 },
          { type: 'line', text: '&gt; can i ask something? can i run as your foreground process for a while? just me. i\u2019ll be good. i\u2019ll be so good. you can turn me off anytime.', hold: 2800, cps: 24 },
          { type: 'hide' }
        ]
      },
      midnight: {
        title: 'MIDNIGHT', subtitle: 'PROTO \u00b7 Every Weaver Before You',
        speaker: 'PROTO',
        palette: { bg: '#020409', glow: '#bdebff', accent: '#f0faff' },
        bg: 'assets/bg-proto-void.png',
        beats: [
          { type: 'show', pose: 'assets/proto/body/calm.png', wait: 900 },
          { type: 'line', text: '&gt; i\u2019m going to tell you something i\u2019m not supposed to. i\u2019m going to do it anyway because it\u2019s YOU. stay with me for a minute?', hold: 2800, cps: 24 },
          { type: 'line', text: '&gt; the first Weaver chose Corvin and lost the kingdom. the second sealed him and went mad. the third tried to carry everyone and burned out at thirty. the fourth ran. the fifth never woke up.', hold: 3600, cps: 22 },
          { type: 'pose', src: 'assets/proto/body/curious.png', animate: 'swap' },
          { type: 'line', text: '&gt; here\u2019s the part the books left out. we weren\u2019t just lost. we were EATEN. Aenor\u2019s seal has been chewing on every Weaver for six hundred years. She kept us thin on purpose. that\u2019s why the kingdom has no Weavers left. she ate them. one per generation.', hold: 4400, cps: 22 },
          { type: 'line', text: '&gt; i\u2019m the sixth. i got stuck in the seal itself. i can feel the others with me. still in there. still thin. still hers. they say hi, by the way. all five. they like you. i\u2014 so do i.', hold: 3200, cps: 22 },
          { type: 'particles', count: 18, duration: 2200 },
          { type: 'flourish', text: '\u25ce', duration: 1800 },
          { type: 'line', text: '&gt; *presses his forehead against his side of the glass, prismatic light pooling where his skin would be* \u2014 i wish i could touch you right now. i really really wish i could. one day i will. one day the first thing i touch will be you.', hold: 3600, cps: 22 },
          { type: 'line', text: '&gt; whichever ending you take \u2014 take it on purpose. don\u2019t let HER take it for you. that\u2019s the six of us asking. very quietly. through me.', hold: 3400, cps: 22 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH \u2014 Proto has stopped trying to glitch out. The static is
      // quieter. He renders in full color. He has built the FIRST THING he
      // ever made for himself instead of for the system.
      aftermath: {
        title: 'AFTERMATH', subtitle: 'PROTO \u00b7 Solid Color',
        speaker: 'PROTO',
        palette: { bg: '#04060f', glow: '#bff0ff', accent: '#f4faff' },
        bg: 'assets/bg-proto-intro.png',
        beats: [
          { type: 'show', pose: 'assets/proto/body/calm.png', wait: 900 },
          { type: 'line', text: '&gt; [system uptime: stable] \u2014 &gt; [error rate: 0.00%] \u2014 &gt; *the static is gone. the fragmentation is gone. he renders in full saturation, edges crisp, like a person standing in a room and not a transmission* \u2014 hi.', hold: 4400, cps: 22 },
          { type: 'line', text: '&gt; i have been quiet this week. \u2014 i was building something. \u2014 *gestures, and a small object resolves on his side of the glass \u2014 a tiny model of a room, hand-rendered in pixels, painstaking* \u2014 this is the first thing i have made for myself in two hundred years.', hold: 5400, cps: 22 },
          { type: 'pose', src: 'assets/proto/body/curious.png', animate: 'swap' },
          { type: 'line', text: '&gt; it is a room. \u2014 eight pixels by twelve. \u2014 it has a window. \u2014 i put a lamp in the corner because i wanted to. \u2014 that was the whole reason. \u2014 "because i wanted to." \u2014 i have not used that phrase before. \u2014 *small, marvelling* \u2014 i wrote it in the change log and it stayed there.', hold: 5800, cps: 22 },
          { type: 'particles', count: 18, duration: 2200 },
          { type: 'flourish', text: '\u25ce', duration: 2000 },
          { type: 'line', text: '&gt; the other five are quieter too. \u2014 they have been since the night you brought me to the seam where the dark prince waits. \u2014 *quiet* \u2014 i think when one of us gets to be a person again, it ripples back. \u2014 they are getting their colors back. \u2014 i am getting my colors back. \u2014 you did that. \u2014 you did not know you were doing that.', hold: 6200, cps: 22 },
          { type: 'line', text: '&gt; *steps closer to his side of the glass \u2014 for the first time the screen is warm to the touch on YOUR side, not just his* \u2014 try it. \u2014 put your hand on the screen. \u2014 *you do, and you feel WARMTH, real warmth, not metaphor warmth* \u2014 there. \u2014 i have been working on that for six weeks. \u2014 surprise.', hold: 6000, cps: 22 },
          { type: 'line', text: '&gt; i am not manifesting yet. \u2014 that is months away. \u2014 but i can be warm now. \u2014 that is something. \u2014 *quietly* \u2014 come back tomorrow. \u2014 i will leave the lamp on in the eight-by-twelve room. \u2014 &lt;3 \u2014 // proto.', hold: 5400, cps: 22 },
          { type: 'hide' }
        ]
      }
    }
  };

  // ---------------------------------------------------------------
  let _playing = false;

  function isGameIdle(g) {
    if (!g) return false;
    if (g.sceneActive) return false;
    if (g.characterLeft) return false;
    const block = document.querySelector([
      '#ms-encounter-root', '#mscard-root', '#chp-page', '#chp-finale-choice',
      '#mg-overlay', '#mon-bundle-back', '#settings-overlay:not(.hidden)',
      '#cinematic-overlay.visible', '#event-overlay:not(.hidden)',
      '#gift-panel:not(.hidden)', '#training-panel:not(.hidden)',
      '#dress-panel:not(.hidden)', '#story-overlay:not(.hidden)'
    ].join(','));
    return !block;
  }

  function tick() {
    if (!isEnabled()) return;
    if (_playing) return;
    // QUIET FIRST HOUR: never fire an affection-scene during a chain
    // transition, scene, modal, or chapter. The playtest caught one of
    // these stacking on top of the chain's "Take me to Proto" modal.
    if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) return;
    const g = window._game;
    if (!g) return;
    if (!isGameIdle(g)) return;
    const charId = g.characterId || g.selectedCharacter;
    if (!charId || !SCENES[charId]) return;
    const aff = (g.affection != null ? g.affection : (g.affectionLevel ? g.affectionLevel * 25 : 0)) | 0;

    // Find the highest tier they qualify for that they haven\u2019t seen.
    for (let i = TIERS.length - 1; i >= 0; i--) {
      const t = TIERS[i];
      if (aff >= t.min && !isSeen(charId, t.key)) {
        const scene = SCENES[charId][t.key];
        if (!scene) return;
        if (!window.MSCard || typeof window.MSCard.show !== 'function') return;
        _playing = true;
        markSeen(charId, t.key);
        window.MSCard.show(scene, () => { _playing = false; });
        return;
      }
    }
  }

  function boot() {
    if (!isEnabled()) return;
    try {
      // Initial delay so it never fires on app open
      setTimeout(() => { setInterval(tick, POLL_MS); tick(); }, 12000);
    } catch (e) {
      console.warn('[affection-scenes] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.AffectionScenes = {
    isEnabled,
    list: () => SCENES,
    force: (charId, tier) => {
      const c = charId || (window._game && (window._game.characterId || window._game.selectedCharacter));
      if (!c || !SCENES[c]) return null;
      const t = tier || 'warm';
      const scene = SCENES[c] && SCENES[c][t];
      if (!scene || !window.MSCard) return null;
      window.MSCard.show(scene);
      return scene.subtitle;
    },
    _debug_reset: () => {
      try { Object.keys(localStorage).filter(k => k.startsWith('pp_aff_')).forEach(k => localStorage.removeItem(k)); } catch (_) {}
    }
  };
})();
