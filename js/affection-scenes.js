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
    { key: 'warm',     min: 10 },
    { key: 'closer',   min: 25 },
    { key: 'chosen',   min: 50 },
    { key: 'midnight', min: 75 }   // the deepest tier \u2014 their most vulnerable confession
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
          { type: 'line', text: 'The forest left a path open for you today. It doesn\u2019t do that for me anymore.', hold: 2400, cps: 30 },
          { type: 'line', text: 'Walk it. I\u2019ll keep up.', hold: 2200, cps: 30 },
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
          { type: 'line', text: 'There\u2019s a hollow in an oak by the stream. I\u2019ve never shown it to anyone. \u2026Tomorrow, then.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u2726', duration: 1400 },
          { type: 'line', text: 'Don\u2019t be late. The owls will judge you.', hold: 2200, cps: 28 },
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
          { type: 'line', text: 'The forest decides who stays. It decided you weeks ago. I\u2019m a slower creature. I decide tonight.', hold: 2800, cps: 26 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: 'Stay. With me. Past the markers, if you want.', hold: 2400, cps: 26 },
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
          { type: 'line', text: 'I\u2019m taking you to the place I dig. I haven\u2019t walked anyone there. \u2026I haven\u2019t walked there alone in three years.', hold: 2800, cps: 24 },
          { type: 'line', text: 'There\u2019s a stone under the rowan tree. No carving on it. I never knew how to carve a name without the trees helping. They stopped helping after.', hold: 3200, cps: 24 },
          { type: 'pose', src: 'assets/elian/body/foraging.png', animate: 'swap' },
          { type: 'line', text: 'Their name is \u2026 \u2026you say it with me. I can\u2019t do it alone, even now. Even with you here.', hold: 3000, cps: 22 },
          { type: 'line', text: 'Veyra.', hold: 2600, cps: 20 },
          { type: 'particles', count: 14, duration: 2000 },
          { type: 'flourish', text: '\u2726', duration: 1800 },
          { type: 'line', text: 'Thank you. The forest \u2026 the forest just relaxed. I felt it. They\u2019re going to remember the name now. Because of you.', hold: 3000, cps: 24 },
          { type: 'line', text: 'One day I might bring the others here. The prince. The scholar. \u2026Him. You\u2019d come with me for that \u2014 wouldn\u2019t you?', hold: 3200, cps: 24 },
          { type: 'line', text: 'I don\u2019t know what to do with all this yet. I do know I\u2019m not letting you walk back alone.', hold: 2600, cps: 26 },
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
          { type: 'line', text: 'My grandfather loved a woman named Veyra. \u2014 My grandmother sealed a prince for loving her too. \u2014 Our line has a pattern. One love apiece. It tends to burn the kingdom.', hold: 3400, cps: 24 },
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
          { type: 'line', text: 'My focus has improved by 14% on days you visit. Statistically suspicious. I\u2019m not investigating.', hold: 2400, cps: 30 },
          { type: 'line', text: 'Sit. Don\u2019t move the third book. The third book has feelings.', hold: 2400, cps: 30 },
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
          { type: 'line', text: 'I keep trying to factor you out of my equations. The equations resist. They prefer you in.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u221e', duration: 1500 },
          { type: 'line', text: 'I\u2019ve started annotating proofs with your initials in the margin. The tower will gossip.', hold: 2600, cps: 28 },
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
          { type: 'line', text: 'I\u2019ve been working on a theorem for months. It states: any room you walk into becomes my favourite room. The proof is cheating but I don\u2019t care.', hold: 2800, cps: 26 },
          { type: 'particles', count: 18, duration: 1800 },
          { type: 'line', text: 'Stay. The theorem needs more data.', hold: 2400, cps: 26 },
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
          { type: 'line', text: 'This is the page. The one I\u2019ve been hiding. The maths that prove the kingdom can\u2019t be saved by any model the books have.', hold: 3000, cps: 24 },
          { type: 'pose', src: 'assets/lucien/body/casting.png', animate: 'swap' },
          { type: 'line', text: 'Disprove it. Take a pencil. Tear the proof apart. \u2026I\u2019ve tried for two years. I can\u2019t. I\u2019d like to be wrong with you.', hold: 3200, cps: 24 },
          { type: 'pose', src: 'assets/lucien/body/amused.png', animate: 'swap' },
          { type: 'line', text: '\u2026You can\u2019t either, can you. Good. Then we have a real problem. And a real partnership.', hold: 2800, cps: 24 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'flourish', text: '\u221e', duration: 1800 },
          { type: 'line', text: 'I\u2019m going to try a model the books don\u2019t have. With your variable in it from the first line. \u2026I should warn you. The model is called \u201cwe.\u201d', hold: 3000, cps: 24 },
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
