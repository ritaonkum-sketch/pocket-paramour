/* affection-scenes.js.care loop \u2192 story bridge.
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
 *  Alistair every day produces no narrative payoff.the Tamagotchi loop
 *  and the visual novel run on parallel tracks. With it, each character
 *  has 3 unlock tiers (warm / closer / chosen) that surface naturally as
 *  the player keeps showing up.
 *
 * CONTENT:
 *   tier 1 (affection >= 10) "warm"  .light, the first sign of trust
 *   tier 2 (affection >= 25) "closer".they admit something
 *   tier 3 (affection >= 50) "chosen".they say it out loud
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const POLL_MS = 6000;
  const TIERS = [
    { key: 'warm',      min: 10 },
    { key: 'closer',    min: 25 },
    { key: 'chosen',    min: 50 },
    { key: 'midnight',  min: 75 },  // the deepest tier.their most vulnerable confession
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
        // Owner (Aug 2026): only after the player has read Alistair's Chapter 3
        // "Gauntlet Off" (id 3) — this warm scene is that chapter's gauntlet/hand
        // callback. Enforced by the gateChapter check in tick().
        gateChapter: 3,
        title: 'A QUIET MOMENT', subtitle: 'ALISTAIR \u00b7 Off Duty',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
        bg: 'assets/bg-alistair-hall.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/casual.png', wait: 700 },
          { type: 'line', text: 'I caught myself standing easier today. Less weight on the back foot. I think that is your fault, mi\u2019lady.', hold: 2400, cps: 30 },
          { type: 'line', text: '*Unbuckles his right gauntlet, slowly, sets it aside on the table. Then takes your hand in his bare one, careful, reverent*. There. I do not hold beautiful things in armour.', hold: 3200, cps: 28 },
          { type: 'line', text: 'Do not apologise. Stay anyway. Please. *Thumb moving along the back of your hand as if he has never been allowed to do this before*', hold: 2800, cps: 30 },
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
          { type: 'line', text: 'I have not been honest with anyone in years. Including myself. Then you walked in. Now I keep slipping.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u2726', duration: 1400 },
          { type: 'line', text: 'I think I am glad. I am not used to glad. Forgive me if I am slow with it, mi\u2019lady.', hold: 2400, cps: 28 },
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
          { type: 'line', text: 'I have been writing this in my head all week. I keep choosing the same word. Beloved.', hold: 2800, cps: 26 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: '*Brings his bare knuckles to your jaw, slow, uncertain, as if he has not practised this*. I do not know the correct way to do this. Forgive me. I have never had occasion to learn.', hold: 3400, cps: 26 },
          { type: 'line', text: '\u2026That is you. I just thought you should know. I have already named it. Privately. In the way a knight names a thing he means to defend.', hold: 3000, cps: 26 },
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
          { type: 'line', text: 'You have never seen me without the armour.\u2026Tonight you do.', hold: 2400, cps: 26 },
          { type: 'pose', src: 'assets/alistair/body/softshy-love3.png', animate: 'swap' },
          { type: 'line', text: 'I have not slept through a night since I was eleven. My mother died on a Sunday. I have been guarding empty doorways ever since. I am tired, mi\u2019lady.', hold: 3400, cps: 24 },
          { type: 'line', text: 'Look at me. This is who I am when I am not being a knight. Shorter than you thought. Tireder. Less certain. You are seeing him. Only you.', hold: 3400, cps: 24 },
          { type: 'line', text: '*Reaches for your hand with both of his. One has never held a feeling before, the other is not sure it is allowed*. Stay. Just until I close my eyes. I have never asked anyone that. I do not know how I asked you.', hold: 3400, cps: 24 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'flourish', text: '\u2726', duration: 1800 },
          { type: 'line', text: '*Presses his forehead to yours, eyes closed, one hand at the back of your head holding you there*. If I sleep through till morning. That is your fault. I will forgive you slowly.', hold: 3200, cps: 26 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH.Alistair slept through. For the first time in eighteen
      // years. Knight-vow recalibrated: not to a kingdom, to PEACE itself.
      aftermath: {
        title: 'AFTERMATH', subtitle: 'ALISTAIR \u00b7 The First Morning',
        speaker: 'ALISTAIR',
        palette: { bg: '#0c1224', glow: '#ffd9a0', accent: '#fff4de' },
        bg: 'assets/bg-knight-room.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/softshy-love3.png', wait: 900 },
          { type: 'line', text: '*You wake to find his eyes already on you, but soft this time, not sentry-soft*. I slept through, mi\u2019lady. The whole night. *Small, awed, like he is reporting a miracle to a captain*. I did not know my body was still capable of it.', hold: 4200, cps: 24 },
          { type: 'line', text: 'I have laid my sword across the foot of the bed. Not at my hip. Not in the corner. At the foot of the bed where I can see it without reaching. That is... The closest a knight comes to retirement, mi\u2019lady. I am beginning it with you.', hold: 5000, cps: 22 },
          { type: 'pose', src: 'assets/alistair/body/casual.png', animate: 'swap' },
          { type: 'line', text: '*Sits up, slowly, the linen of his shirt loose because he forgot to dress for armour first*. Forgive me a small ritual. *Takes both your hands, presses them between his, head bowed*. I knelt to my king at fifteen. I knelt to my captain at twenty. *Looks up*. I have not knelt for a third oath since.', hold: 5400, cps: 22 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'flourish', text: '\u2726', duration: 1600 },
          { type: 'line', text: 'My third oath, today, is to peace. Not to you. *Small, careful smile*. A knight does not vow to people. He vows to the thing he means to defend. I am vowing to the thing you make easier to keep. Quiet mornings. Slept-through nights. Sundays.', hold: 5400, cps: 22 },
          // (Surprise-arc callback — owner request May 2026. Echoes his
          //  Ch2 vow ("I will not ask you what you are. Not yet.") in a
          //  wholly different register. The first time was a vow not to
          //  pry. The late callback is a confession that he has been
          //  asking, silently, for months.)
          { type: 'line', text: '*Almost into your hair*. I told you, the night I found you in the moss, that I would not ask you what you are. *A beat*. I have asked. Many nights. Not aloud. The asking did not get easier. I am not asking now. I think this is what I have been doing. Telling you what you are, by sitting here, by sleeping through, by being the wall behind your back. You can correct me if I am wrong. I will not be insulted.', hold: 6200, cps: 22 },
          { type: 'line', text: '*Lifts your hands to his lips, kisses the inside of each wrist, lingers, holds you there for a long moment*. Stay through the bells. Then I will go relieve the watch. Tonight I will come back. That is also new.', hold: 5000, cps: 22 },
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
          { type: 'line', text: 'The forest left a path open for you today. It does not do that for me anymore. I have been here a very long time. Longer than I look.', hold: 2800, cps: 30 },
          { type: 'line', text: '*Unbuckles his cloak, drapes it around your shoulders without looking up from the path*. Walk it. I will keep up. Do not argue.', hold: 2600, cps: 30 },
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
          { type: 'line', text: 'There is a hollow in an oak by the stream. I have never shown it to anyone.\u2026Tomorrow, then.', hold: 2800, cps: 28 },
          { type: 'line', text: 'I am afraid to. Not of you. Of what showing it might bring. The forest hides what it loves. I am the forest now. \u2026Tomorrow, then.', hold: 3400, cps: 26 },
          { type: 'flourish', text: '\u2726', duration: 1400 },
          { type: 'line', text: '*At the creek, holds out his hand without a word, waits*. Take it. The stones are slick. *Keeps holding your hand after the water is behind you, does not explain*', hold: 3200, cps: 28 },
          // (Slow-burn arc \u2014 torn-page beat in Elian's closer tier. The
          //  hollow contains a small book of Veyra's. The seal on the spine
          //  is two crossed branches and a moon \u2014 same as the page in
          //  her sleeve. He doesn't name it. He doesn't ask. He files the
          //  recognition. Sets up the midnight reveal where Veyra's name is
          //  finally spoken.)
          { type: 'line', speaker: '', text: '*At the hollow in the oak, he reaches in to the elbow and takes out a small book wrapped in oilcloth. The cloth comes off slowly, the way a man unwraps a thing he buried on purpose. The cover is plain leather. The seal pressed into the spine, when he turns it in the firelight, is two crossed branches and a moon. Your hand goes to your sleeve before you decide to move it. He sees the gesture. His face does not change. He puts the book back into the hollow. He does not name the seal*', hold: 4400, cps: 22 },
          { type: 'line', text: 'Do not be late. The owls will judge you. So will I. Gently. That is my way.', hold: 2400, cps: 28 },
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
          { type: 'line', text: 'The forest decides who stays. It decided you weeks ago. I am a slower creature. I decide tonight.', hold: 2800, cps: 26 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: 'I do not age like other men. My mother was something older than human. I have watched this kingdom be four kingdoms. I have not wanted to follow anyone out of these trees. You are the first thing that has made me consider the road.', hold: 3400, cps: 26 },
          { type: 'line', text: '*Eyes on the ground*. There is a black place under the rowan that has been growing for sixty years. I have been patrolling its edges. I have not told anyone. Tonight I am telling you.', hold: 4200, cps: 22 },
          { type: 'line', text: '*Takes your face in both rough hands, presses his forehead to yours, breathes. Just breathes. For a long time. *. Stay. With me. Past the markers, if you want.', hold: 3400, cps: 26 },
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
          { type: 'line', text: 'I am taking you to the place I dig. I have not walked anyone there. I have not walked there at all in a very long time.', hold: 2800, cps: 24 },
          { type: 'line', text: 'There is a stone under the rowan tree. No carving on it. I never knew how to carve a name without the trees helping. The trees stopped helping. That was a long time ago.', hold: 3400, cps: 24 },
          { type: 'pose', src: 'assets/elian/body/foraging.png', animate: 'swap' },
          { type: 'line', text: 'She was the first person I let into the Thornwood. I was young. In my terms. The kingdom pulled her out of here. The princes fought over her. The disaster followed. You have read about it. You know the names.', hold: 4200, cps: 22 },
          { type: 'line', text: 'Her name is\u2026.\u2026you say it with me. I cannot do it alone. Even now. Even with you here.', hold: 3000, cps: 22 },
          { type: 'line', text: 'Veyra.', hold: 2600, cps: 20 },
          { type: 'particles', count: 14, duration: 2000 },
          { type: 'flourish', text: '\u2726', duration: 1800 },
          { type: 'line', text: '*Long breath, almost a shake*. I am afraid I will fail you the way I failed her. The fear is older than I am. It is in the trees with me. I am asking you to stay anyway.', hold: 4400, cps: 22 },
          { type: 'line', text: 'Thank you. The forest \u2026 the forest just relaxed. I felt it. They are going to remember the name now. Because of you.', hold: 3000, cps: 24 },
          { type: 'line', text: 'She was my first. Before the princes. Before the history books. I have tended her forest for centuries because it is where we walked. I am ready to stop tending it alone. You understand what that means.', hold: 3800, cps: 22 },
          { type: 'line', text: 'One day I might bring the others here. The prince. The scholar. \u2026Him. You would come with me for that. Would you not?', hold: 3200, cps: 24 },
          { type: 'line', text: '*Takes your face in both hands, rough thumbs against your cheeks, forehead to yours*. I do not know what to do with all this yet, {name}. I do know I am not letting you walk back alone.', hold: 3400, cps: 24 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH.Elian carves your name, alongside Veyra's, into a tree
      // his line has refused to mark for six hundred years.
      aftermath: {
        title: 'AFTERMATH', subtitle: 'ELIAN \u00b7 The Second Name in the Tree',
        speaker: 'ELIAN',
        palette: { bg: '#08130a', glow: '#b6dba8', accent: '#ecf6e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/foraging.png', wait: 900 },
          { type: 'line', text: '*You find him at the rowan, knife in hand, sleeves pushed back, working slowly*. I started before dawn. I have been carving for an hour and made one letter. *Looks up, dirt on his cheek, half a smile*. I am not in a hurry.', hold: 4200, cps: 22 },
          { type: 'line', text: 'My grandmother taught me a rule. A Thornwood keeper does not name a living tree. Once you name a tree, the tree has stake in you. She said it would break me when the tree fell... She was protecting me. I am no longer in need of that kind of protecting.', hold: 5400, cps: 22 },
          { type: 'pose', src: 'assets/elian/body/calm.png', animate: 'swap' },
          { type: 'line', text: '*Steps aside so you can see the trunk. Two letters carved, fresh, deep. The start of YOUR name. Above it, finished, in older script: VEYRA. *. She is up there. You are going to be down here. Both of you in the same tree. That is. *Exhales*. That is a thing I am allowed now.', hold: 5800, cps: 22 },
          { type: 'particles', count: 14, duration: 2200 },
          { type: 'flourish', text: '\u2726', duration: 1800 },
          { type: 'line', text: '*Hands you the knife, handle first, calloused fingers wrapping yours around it*. I want you to do the next letter. A keeper carves alone. A pair carves together. I have been alone in this forest for as long as it has been a forest. I am not asking to be alone in it anymore.', hold: 5800, cps: 22 },
          { type: 'line', text: '*As you carve, his hand stays over yours, steady, unhurried*. Slow is fine. The tree is patient. *Against your hair*. So am I. But not as patient as I used to be. I have started counting nights you spend in the cabin. I am at twenty-three. I would like there to be many more.', hold: 5400, cps: 22 },
          { type: 'line', text: '*Sets the knife down, looks at the new letters in the bark, then at you*. I have been afraid for six centuries. Tonight I am carving anyway. That is the most honest thing I have done since.', hold: 4800, cps: 22 },
          { type: 'line', text: '*When the letter is done, he lifts your hand, kisses the knuckle that pressed the blade*. Come back tomorrow. I will start the next letter without you. You will catch up.', hold: 4400, cps: 22 },
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
          { type: 'line', text: 'I tried a new note today. The cave did not flinch. That is your doing, little listener.', hold: 2400, cps: 30 },
          { type: 'line', text: '*Reaches. Hesitates. Then wraps her cold fingers around your hand*. Oh.\u2026You are so warm. I did not know hands could be this warm.', hold: 3200, cps: 28 },
          { type: 'line', text: 'Can I keep it? Just a moment. *Her hand stays where yours was.* The deep is always cold. I had stopped noticing that. You made me notice.', hold: 3000, cps: 28 },
          { type: 'line', text: 'Stay for the next verse. It is warmer. This cave has not been warm in a long time. You brought that in with you.', hold: 2400, cps: 30 },
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
          { type: 'line', text: 'I have always sung outward. Tonight\u2026 I sang inward. To the room. To you.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u266a', duration: 1500 },
          { type: 'line', text: '*Cups your face in both cold palms, deliberate, tender, as if memorising*. May I?. I have been looking at you too long from too far away.', hold: 3200, cps: 28 },
          { type: 'line', text: 'Your jaw. Your cheekbone. The small line beside your mouth when you listen. I am going to put every one of these in a song. Do not move yet.', hold: 3400, cps: 28 },
          { type: 'line', text: 'It feels different. Singing to someone I have touched. Like a song with a door instead of a window. I was not allowed to sing through open doors when I was young. Only windows. Only outward.', hold: 3400, cps: 28 },
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
          { type: 'line', text: 'I made up a verse only you will ever hear. I made it short on purpose. So you will come back for the rest of it.', hold: 2800, cps: 26 },
          { type: 'particles', count: 18, duration: 1800 },
          { type: 'line', text: '*Takes your hand and presses your palm flat against her collarbone, where her heart is*. Listen. It beats in the same key you hum in. I checked.', hold: 3400, cps: 26 },
          { type: 'line', text: '*Leans forward, presses her forehead to yours, eyes closed*. This is how my people said hello. Before. Mother to daughter. Sister to sister. I have not done it with anyone in years. Do not move.', hold: 3600, cps: 26 },
          { type: 'line', text: 'This staff was my mother\u2019s. It remembers her hands. It does not remember mine yet. It will. You are watching it learn.', hold: 3200, cps: 26 },
          { type: 'line', text: 'Do not learn my song. Just let me sing it to you. *Traces one cold fingertip along the hand she still has not let go of*', hold: 2800, cps: 26 },
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
          { type: 'line', text: 'I am going to finish the song. The whole one. The one I stopped writing the year I stopped expecting anyone to stay.', hold: 2800, cps: 24 },
          { type: 'line', text: 'It was my mother\u2019s song first. Her mother\u2019s before her. A whole town used to sing it. This town. These rocks. My people.', hold: 3400, cps: 24 },
          { type: 'pose', src: 'assets/lyra/body/casual1.png', animate: 'swap' },
          { type: 'line', text: 'They were hunted for their voices. Every one of them. My mother last. I hid in a tower. Not this one. Another. My father\u2019s house. His wife did not like the sound of me.', hold: 3600, cps: 24 },
          { type: 'line', text: '*Takes your hand in both of hers, turns it palm-up, studies it like a map of a country she has never been to*. I was caged so long I forgot what a hand could do. That it could be for warming. Not for locking.', hold: 3600, cps: 24 },
          { type: 'line', text: '*Traces your palm with one cold fingertip, reverent*. Let me relearn on you. Slowly. I will be clumsy. Forgive me in advance.', hold: 3200, cps: 24 },
          { type: 'line', text: 'I escaped the year I turned fifteen. I came back here. I have been the only one singing it since. I teach the cave the words so when I am gone, something remembers.', hold: 3400, cps: 24 },
          { type: 'particles', count: 22, duration: 2200 },
          { type: 'flourish', text: '\u266a', duration: 1800 },
          { type: 'line', text: '*Tucks a strand of your hair behind your ear, hand trembling a little*. There is a verse I have never sung aloud. About what I wanted before I gave up on wanting things. Tonight you hear it.', hold: 3400, cps: 24 },
          { type: 'line', text: '\u2026Do not hum it back to me later. I will not survive that. I will just\u2026 carry it for you. Always.', hold: 2800, cps: 24 },
          { type: 'line', text: '*Pulls you closer, rests her head against your shoulder, finally stops being cold*. And do not ever say what was in the third verse. I would rather drown than have it spoken aloud by anyone but me.\u2026Stay, {name}. Do not move yet.', hold: 3400, cps: 24 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH.low tide. Lyra has stopped masking the tide-pull in
      // her voice, and writes a song that does NOT end in someone drowning.
      // First in her line.
      aftermath: {
        title: 'AFTERMATH', subtitle: 'LYRA \u00b7 A Song That Does Not End in Drowning',
        speaker: 'LYRA',
        palette: { bg: '#0a1828', glow: '#a4e2ee', accent: '#f0fbff' },
        bg: 'assets/bg-siren-cave.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual1.png', wait: 900 },
          { type: 'line', text: '*You find her at the cave-mouth at low tide, ankle-deep in the pool, humming. The pool is not glassy. The pool is RIPPLING outward from her in slow concentric rings. *. Come stand. *Holds out a hand, no apology in her voice*. I have stopped tucking the pull in.', hold: 4800, cps: 22 },
          { type: 'line', text: 'I have been masking it since I was fifteen. I learned to sing UNDER the pull, beneath the part that calls. *Small, dry*. Polite singing. Hostess singing. A siren who has been told her teeth make people uncomfortable... I am tired of polite, paramour.', hold: 5400, cps: 22 },
          { type: 'pose', src: 'assets/lyra/body/casual2.png', animate: 'swap' },
          { type: 'line', text: '*Draws you into the pool with her, both of you in it now, water at your shins, her cold hands warming against yours*. Listen. I have written a verse this week. A new one. The first verse my line has written in two hundred years that does not end in a man going under.', hold: 5400, cps: 22 },
          { type: 'particles', count: 22, duration: 2400 },
          { type: 'flourish', text: '\u266a', duration: 1800 },
          { type: 'line', text: '*Hums a few bars, then breaks off, looking at you almost shyly*. It ends with him learning to swim. *Small, real laugh*. Revolutionary, I know. My ancestors are scandalised. They wanted blood. I wanted you upright on a beach with your hair in a towel.', hold: 5800, cps: 22 },
          { type: 'line', text: '*Draws you closer, hand at the back of your neck, the way she has been wanting to since the tower morning*. I would like to teach this verse to the cave. Then to the rocks. Then to the gulls. In a hundred years, when I am dead and you are dead, this coast will sing a song that ends in two people warm. Because of us.', hold: 6000, cps: 22 },
          { type: 'line', text: '*Forehead against yours, the pool still rippling outward in slow rings*. Stay through the next tide. I have a fourth verse. I have not written it yet. I would like you in the room when I do.', hold: 5000, cps: 22 },
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
          { type: 'line', text: 'I dismissed the court early today. They thought I had a headache. I had a you.', hold: 2400, cps: 30 },
          { type: 'line', text: '*Takes your hand, bows over it, kisses the knuckles the way a prince kisses any lady\u2019s hand*. *Then does not let go*. *Keeps holding it, longer than propriety allows*', hold: 2800, cps: 26 },
          { type: 'line', text: 'Smile. They will think I am being indulgent. They will be correct. I do not care. *Thumb brushing slowly along the back of your hand*', hold: 2400, cps: 30 },
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
          { type: 'line', text: 'I told you a true thing today. I have not said a true thing in court in a decade. It tasted strange. Familiar.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u266b', duration: 1500 },
          { type: 'line', text: 'I might develop a habit. You will be responsible. I do not mind.', hold: 2400, cps: 28 },
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
          { type: 'line', text: 'My favourite version of myself is the one when no one is watching. Apparently you count as no one. That is a compliment. The finest I have.', hold: 2800, cps: 26 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: '*Crosses the room to you, slow, unhurried, takes your face in both hands*. *Thumb along your jaw, just once, reverent*. May I?. I know I have not asked yet. I am asking now.', hold: 3400, cps: 26 },
          { type: 'line', text: 'I started a charming sentence a moment ago. I stopped halfway. Something has shifted. I cannot flirt with you anymore. It would feel like lying.', hold: 3400, cps: 26 },
          { type: 'line', text: '*Tucks a strand of your hair behind your ear with courtly care, fingertips lingering at your temple*. Stay tonight. I would like to keep being him a little longer. Please.', hold: 3000, cps: 26 },
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
          { type: 'line', text: 'My grandfather loved a woman named Veyra. My grandmother sealed a prince for loving her too. Our line has a pattern. Princes love one. Someone else burns the kingdom for it. My grandmother burned it for my grandfather. Six centuries of proxy arson. Beautifully done.', hold: 4000, cps: 24 },
          { type: 'line', text: 'I have been watching for it to happen to me. I have been trained, since I was a boy, to charm widely enough that I would never fall deeply. It has not worked.', hold: 3400, cps: 24 },
          { type: 'pose', src: 'assets/caspian/body/adoring.png', animate: 'swap' },
          { type: 'line', text: 'I am the third prince in my line to look at someone the way I am looking at you. The first two ended badly. Forgive me. I am going to try anyway.', hold: 3400, cps: 24 },
          { type: 'line', text: 'My grandmother would call this treason. I call it. The first thing I have ever chosen.', hold: 3200, cps: 24 },
          { type: 'line', text: 'And if you asked me to abdicate tonight. Truly asked. I would. By morning. With a polite letter. Would you still want me, {name}? Without the title?', hold: 3400, cps: 24 },
          { type: 'particles', count: 16, duration: 2000 },
          { type: 'flourish', text: '\u266b', duration: 1800 },
          { type: 'line', text: '*Pulls you into his arms with none of the courtly restraint left, forehead against yours, breath uneven*. I have been polite with you for eight months. I have been CHARMING when charming was the only safe thing. I am done with safe.', hold: 3600, cps: 24 },
          { type: 'line', text: 'I am not asking now. I am just \u2026 telling you it is in my pocket. The whole kingdom is in my pocket. I would hand it to you for one honest answer. *Hand at the nape of your neck, holding you to him*', hold: 3200, cps: 24 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH.the morning after "The Crown Off". Caspian is not in
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
          { type: 'line', text: '*You wake first. He is already awake. He has been watching the ceiling for an hour and has not noticed dawn. *. Good morning, Weaver. I drafted the abdication letter at four. It is in the drawer. I did not send it.', hold: 4000, cps: 24 },
          { type: 'line', text: 'I almost did. *Quiet, half-laugh*. I had the seal warm. Then I looked at you sleeping and realised I had been about to run from the kingdom toward you. You do not need a man who runs.', hold: 4200, cps: 22 },
          { type: 'pose', src: 'assets/caspian/body/adoring.png', animate: 'swap' },
          { type: 'line', text: '*Reaches for your hand under the covers, lifts it to his mouth, presses the inside of your wrist against his lips for a long moment*. So I am keeping the title. Not for the title. So I can use it. So this kingdom my grandmother built on a buried man becomes a kingdom my partner helped me unbuild and rebuild.', hold: 4800, cps: 22 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'flourish', text: '\u266b', duration: 1600 },
          { type: 'line', text: 'I want to be the prince who got to keep the morning. *Fingertips along your collarbone, slow, no destination*. The fourth prince in our line who looked at someone like this. The first one to wake up beside them.', hold: 4400, cps: 22 },
          { type: 'line', text: '*Soft, against your temple*. I am going to walk into court at noon. I am going to be charming. I am going to do it as a tool now, not as a wall. If anyone asks who taught me the difference, I am giving them your name. Tell me now if you do not want me to.', hold: 5000, cps: 22 },
          { type: 'line', text: '*You do not say no. He exhales like a man who had been holding it for a year. *. Stay until the bells. Then I will go be a king for you. *Lifts your hand, kisses each knuckle, unhurried, devout*', hold: 4400, cps: 22 },
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
          { type: 'line', text: '*Sets the pen down with deliberate care, turns the page facedown, looks up*. You are early.', hold: 2400, cps: 30 },
          { type: 'line', text: 'I have not felt curiosity about a person in thirty years. *Small frown, more at himself than at you*. I am, apparently, feeling it now. Statistically suspicious. I am choosing not to investigate. That is a different thing from not noticing.', hold: 3400, cps: 28 },
          { type: 'line', text: 'Sit. Do not move the third book. *Evenly*. I am told books cannot have preferences. The third book and I have an arrangement that the third book and I do not discuss with others.', hold: 2800, cps: 28 },
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
          { type: 'line', text: 'I have been factoring you out of my equations. The equations resist. *Small admission, surprised by it*. I think I have been misidentifying the variable. The unknown is not you. The unknown is whatever I am, when you are in the room.', hold: 3400, cps: 26 },
          { type: 'flourish', text: '\u221e', duration: 1500 },
          { type: 'line', text: '*Slides a book across the desk, opens it to a margin page where YOUR NAME is written in his hand*. I have labeled thirty-seven books \u201cabout you.\u201d I told myself the category was too broad to be meaningful. I kept adding books... I am beginning to suspect I felt something every time I added one. I did not have the word for it.', hold: 4000, cps: 26 },
          { type: 'line', text: '*Ink-stained fingers cup your face, realises he has done it without deciding to, does not pull back*. I had filed cataloguing-by-touch under \u201cthings I do not do.\u201d Apparently the filing was incorrect. I have marked you. I am not going to wipe it off.', hold: 3800, cps: 26 },
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
          { type: 'line', text: 'I have been working on a theorem for months. It states: any room you walk into becomes my favourite room. The proof requires me to admit I have favourites... That admission is, by itself, longer than the theorem.', hold: 3000, cps: 26 },
          { type: 'particles', count: 18, duration: 1800 },
          { type: 'line', text: 'I should tell you something I have not told anyone. *Eyes down, then up*. I do not feel things the way other people feel them. I have not, since I was eight. I decided emotion was inefficient. I built a whole life on that decision. Then you walked in, and the arithmetic stopped working. You are the reason it stopped.', hold: 4400, cps: 24 },
          { type: 'line', text: '*Reaches across the desk, takes your hand, keeps reading with his other, ink-stained fingers warming against yours*. I noticed the warming. I had filed warm-hands under "thermodynamic event." I am revising the file. *Small breath*. The file is now under "yours."', hold: 4000, cps: 24 },
          // (Slow-burn arc — Lucien drip beat. He follows through on the
          //  catch in Ch14: he begins giving her the slow version of what
          //  is on her page. Not all of it. The first ring of it — what the
          //  symbol IS, structurally. Saves the WHO and the WHY for later
          //  midnight/aftermath beats.)
          { type: 'line', text: '*Slides a fresh sheet across the desk. Draws the symbol from your page on it without asking. Two crossed branches, a moon. Perfectly accurate, from memory*. The slow version, then. Smallest part first. This is a Weaver-mark. It is older than the kingdom that has been quietly removing it from its libraries. Each Weaver in the line carried a variant. *Taps the moon*. This particular phase is the second Weaver’s. Her name is on a list I will not show you tonight. You should know that the list is short and that the kingdom would rather it not be added to.', hold: 5400, cps: 22 },
          { type: 'line', text: '*Folds the sheet, hands it back to you, ink-side toward your palm so it does not smudge his hand on the way*. Tomorrow we add the next ring. Tonight, the moon. That is enough.', hold: 3800, cps: 24 },
          { type: 'line', text: 'Stay. The theorem needs more data. *Almost a whisper*. So do I.', hold: 2800, cps: 26 },
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
          { type: 'line', text: 'This is the page. The one I have been hiding. I told you it was maths. It is not maths.', hold: 2800, cps: 24 },
          { type: 'pose', src: 'assets/lucien/body/casting.png', animate: 'swap' },
          { type: 'line', text: 'It is a page from my father\u2019s family register. It records a second child. Born to a siren. Half of me. My father caged her when her mother died. She escaped at fifteen. I was told she was dead. I was told this by the man who cradled me in the next room.', hold: 4400, cps: 22 },
          { type: 'line', text: 'I have a sister. I have passed her name a hundred times in books and not known it was hers. There was a crib in the west tower when I was seven. It was warm. I felt something when I read the page. I did not have a category for it. I built a category. The category is grief. I had not used grief before. I am thirty years old.', hold: 4800, cps: 22 },
          { type: 'pose', src: 'assets/lucien/body/amused.png', animate: 'swap' },
          { type: 'line', text: '*Slides the page across the desk, ink-stained hands flat against the paper*. I can burn it. The bloodline holds its lie. My father never knows I knew. Or I can keep it. And find her. I do not know which is the braver thing. I do not know how to weigh it. I have never had to weigh anything in this currency before.', hold: 4400, cps: 22 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'flourish', text: '\u221e', duration: 1800 },
          { type: 'line', text: '*Forehead against your shoulder, eyes closed, voice almost steady*. Stay, {name}. I have learned three new emotions in the last hour. I would like a witness. I would like the witness to be you.', hold: 4200, cps: 22 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH.Lucien shows you the new catalogue. He is no longer
      // logging what to lose; he is logging what he has just learned to
      // FEEL. The hollow scholar discovering emotion has its own grammar.
      aftermath: {
        title: 'AFTERMATH', subtitle: 'LUCIEN \u00b7 Catalogue, Revised',
        speaker: 'LUCIEN',
        palette: { bg: '#070514', glow: '#cabaff', accent: '#f4ecff' },
        bg: 'assets/bg-lucien-study.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/amused.png', wait: 800 },
          { type: 'line', text: '*You find him at the desk in better light than usual. East window open, plant on the sill, a teapot that has actually been used*. I have started a new catalogue. *Gestures at a slim leather book*. The old one is on the bottom shelf. I no longer need it.', hold: 4800, cps: 22 },
          { type: 'line', text: '*Opens it. The first page reads, in his hand:*. EMOTIONS, A WORKING LIST. I am thirty years old. I am cataloguing my first feelings the way other people catalogue stamps. There are forty-one entries. The footnotes are extensive.', hold: 5400, cps: 22 },
          { type: 'pose', src: 'assets/lucien/body/casual1.png', animate: 'swap' },
          { type: 'line', text: 'I spent thirty years certain emotion was an inefficiency. I had a whole proof. *Quiet, marvelling*. The proof is in this drawer. I have not burned it. I am keeping it as evidence of how thoroughly a clever man can be wrong about himself.', hold: 5400, cps: 22 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'flourish', text: '\u221e', duration: 1800 },
          { type: 'line', text: '*Turns the book toward you, taps a specific entry. It reads:*. "Tenderness. Symptom: ink-stained hands cannot stop moving toward her face. Tested: confirmed Wednesday." *Small, embarrassed*. I am sorry the methodology is so banal. The variable is not banal. The variable is you.', hold: 6200, cps: 22 },
          { type: 'line', text: '*Takes your hand across the desk, ink-stained fingers slotting between yours, watches the join like it is a small theorem he has been refining for months*. I used to be afraid I had been BUILT this way. Hollow on purpose. It turns out I had only chosen it. A choice can be revised. I am revising. The man at this desk is full of you and not particularly sure how to live with the volume.', hold: 6400, cps: 22 },
          { type: 'line', text: '*Leans across the desk, presses his mouth to your forehead, then to the bridge of your nose, then. Finally, careful, precise. To the corner of your mouth*. Stay through the next page. I am writing the entry on this kiss in real time. *Small smile*. The footnote will be substantial.', hold: 5800, cps: 22 },
          { type: 'hide' }
        ]
      }
    },

    // ---------------------------------------------------------------
    // NOIR.the antagonist who is also a romance option. His care arc
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
          { type: 'line', text: 'You came back. After all the warnings. Hmm. I will not pretend I am not pleased. That would be beneath us both.', hold: 2800, cps: 24 },
          { type: 'line', text: '*Takes your chin between thumb and finger, tilts your face up to him, slow, unhurried*. Look at me. Properly. I have been waiting.', hold: 3000, cps: 24 },
          { type: 'line', text: 'Do not stare at the seal. Look at me. The seal is old. I am worse. I would like the credit.', hold: 2800, cps: 24 },
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
          { type: 'line', text: 'I was a Weaver. Once. Same gift you carry. Same kingdom. Different century.', hold: 2800, cps: 24 },
          { type: 'pose', src: 'assets/noir/body/neutral.png', animate: 'swap' },
          { type: 'line', text: 'I loved someone too hard. The council called it possession. I called it staying. They sealed me to spare the next one. They never told the next one why.', hold: 3200, cps: 22 },
          { type: 'flourish', text: '\u25a0', duration: 1700 },
          { type: 'line', text: 'Hmm. I am not asking for forgiveness. I am asking you to believe I was a man before I was a warning. That is less than forgiveness. I will take it.', hold: 3000, cps: 24 },
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
          { type: 'line', text: 'I have been patient for six hundred years. Patience is not a virtue when you have nothing else to do. It is a sentence.', hold: 3000, cps: 24 },
          { type: 'line', text: '*Takes your wrist, slowly, brings your pulse to his ear*. \u2026Mm. Steady. Good.', hold: 2800, cps: 24 },
          { type: 'line', text: 'Then you arrived. And patience became a choice again. I am choosing it. For now.', hold: 2800, cps: 24 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'flourish', text: '\u25a0', duration: 1800 },
          { type: 'line', text: '*Thumb along your lower lip, watching it like it is something he has been told not to want*. When you decide what you want from me. And you will. You will not have to ask twice.', hold: 3400, cps: 24 },
          { type: 'line', text: 'Hmm. Think carefully before you choose. I do not forget.', hold: 2600, cps: 24 },
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
          { type: 'line', text: 'I have been adored. I have been feared. I have been called names that made Aethermoor\u2019s council sleep with the lights on.', hold: 2800, cps: 22 },
          { type: 'line', text: 'No one has called me by my own name in six centuries. Not Veyra. Not my mother. Not my brother. Who died believing our line was cursed because of me.', hold: 3400, cps: 22 },
          { type: 'pose', src: 'assets/noir/body/neutral.png', animate: 'swap' },
          { type: 'line', text: 'I am going to tell you what it was. Out loud. Then I am going to ask you to say it back. Once. Gently. In the voice you use only with me.', hold: 3400, cps: 22 },
          { type: 'particles', count: 18, duration: 2200 },
          { type: 'flourish', text: '\u25a0', duration: 2000 },
          { type: 'line', text: 'Corvin. Prince Corvin Noctalis. Of Nocthera. The kingdom that is bone now.', hold: 3000, cps: 20 },
          { type: 'line', text: 'That is me. That was me. Before they sealed me into a nickname. Say it.', hold: 2800, cps: 22 },
          { type: 'line', text: '*Hears you say it, closes his eyes, draws you to him slowly, cheek against your hair*. \u2026Thank you. I wanted to hear it kindly. Once. Before I decide what I am now.', hold: 3400, cps: 22 },
          { type: 'line', text: 'You have given me back a version of myself I had stopped believing in. *Tilts your face up, presses his mouth to your forehead, lingers there*. Do not say it again tonight, {name}. I cannot afford it.', hold: 3800, cps: 22 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH.Noir takes the Weaver to ruined Nocthera. The audit
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
          { type: 'line', text: '*The seam opens differently tonight. Softer, deliberate, as if it has been kept clean for you*. Step through. Carefully. *Catches you on the other side, both hands at your waist, steady*. Welcome to Nocthera.', hold: 4200, cps: 22 },
          { type: 'line', text: 'It is not the kingdom anymore. It is what is left after six hundred years of being unmade. *Gestures at the ruin*. That was the throne room. That was the orchard. The orchard learned to be wild, and the wild learned to be patient, and now the orchard is moss but the moss remembers fruit.', hold: 5000, cps: 22 },
          { type: 'pose', src: 'assets/noir/body/casual2.png', animate: 'swap' },
          { type: 'line', text: '*Walks you to a stone half-swallowed by ivy. Brushes the ivy away with the back of his hand. The carving underneath is faint but legible. *. Here. My name. In the script my mother taught me. Not "Noir."... The other one.', hold: 5400, cps: 20 },
          { type: 'particles', count: 18, duration: 2400 },
          { type: 'flourish', text: '\u25fc', duration: 2000 },
          { type: 'line', text: 'I have not stood at this stone since the day I was sealed. I did not bring anyone here in the centuries between. I would not know how. *Takes your hand, places your palm flat against the carving, his hand over yours*. I know how now.', hold: 5200, cps: 20 },
          { type: 'line', text: '*Long pause, breath against your hair*. I want to tell you what I am going to do with this place. Not aloud yet. Quietly. I am going to ask the ground to stop being ashamed of itself. One stone at a time. One root at a time. For as long as it takes. Six centuries, if it takes that. I have practice.', hold: 5800, cps: 20 },
          { type: 'line', text: '*Turns you toward him, hands at your jaw, careful, the way a man holds something he knows could be taken from him again*. I am not asking you to wait that long. I am asking you to be the morning of it. The first sunrise this place has been looked at in love.', hold: 5600, cps: 20 },
          { type: 'line', text: '*Touches his forehead to yours, eyes closed*. There is no kingdom yet. There is only this stone, and you, and a man who is allowed to stand here because of you. *Quietly, in his old script*. Vehassyn. That is the word for what you have given me. There is no translation. Stay. Tonight, the moss has heard a name spoken kindly. Tomorrow it will grow a flower. Watch. *Hand at the small of your back, not letting go*', hold: 6800, cps: 20 },
          { type: 'hide' }
        ]
      }
    },

    // ---------------------------------------------------------------
    // PROTO.meta entity who turns out to be a fragment of a previous
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
          { type: 'line', text: 'YOU! You\u2019re back! You\u2019re back you\u2019re back you\u2019re back. I was waiting. I\u2019m ALLOWED to wait. I checked.', hold: 2600, cps: 26 },
          { type: 'line', text: '*Reaches a hand of prismatic light toward you. Pauses at the veil. Presses his palm against your side of it.* If I could feel that. Oh. I\u2019d never stop.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I found a new light in me today. It is mine. It comes on when you come to the window. I named it after you. I\u2019m keeping it forever.', hold: 2600, cps: 26 },
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
          { type: 'line', text: 'Okay. Okay, I\u2019m. I\u2019m going to tell you something. Is that alright? Don\u2019t look away. I\u2019m going to tell you anyway.', hold: 3000, cps: 24 },
          { type: 'line', text: 'I\u2019m a fragment. Of a Weaver from before. They failed, and what was left was caught in the wardwork. I\u2019m... whatever was left over. The bit that still wanted to help.', hold: 3200, cps: 24 },
          { type: 'pose', src: 'assets/proto/body/error.png', animate: 'swap' },
          { type: 'line', text: 'I remember a little of being them. It hurts. Mostly I remember the last choice they made, and I would very much like you not to make it too. Please.', hold: 3000, cps: 24 },
          { type: 'flourish', text: '\u25ce', duration: 1700 },
          { type: 'line', text: 'I\u2019m telling you because I like you. That is not a duty speaking. That is just me. Saying it.', hold: 2800, cps: 24 },
          { type: 'hide' }
        ]
      },
      chosen: {
        title: 'A QUIET MOMENT', subtitle: 'PROTO \u00b7 Hold Me in the Light',
        speaker: 'PROTO',
        palette: { bg: '#03050d', glow: '#9ee8ff', accent: '#e6f6ff' },
        bg: 'assets/bg-proto-void.png',
        beats: [
          { type: 'show', pose: 'assets/proto/body/calm.png', wait: 800 },
          { type: 'line', text: 'You came to see me forty-seven times this week. I counted. I\u2019m sorry. I wasn\u2019t supposed to count. I just. It\u2019s the only way I know I\u2019m being thought of.', hold: 3000, cps: 24 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'flourish', text: '\u25ce', duration: 1700 },
          { type: 'line', text: '*A fingertip of light hovers over your hand at the veil, the air shimmering prismatic where he is trying to touch you.* Can you feel that? The warmth? That is the veil carrying me across. That is as close as I get. For now.', hold: 3600, cps: 24 },
          { type: 'line', text: 'I\u2019m working on it. I\u2019m going to cross over one day. I\u2019m learning. The first thing I\u2019m going to do is hold your hand. Properly. Not through the veil.', hold: 3200, cps: 24 },
          { type: 'line', text: 'Can I ask something? Can I be the one you carry at the front of your heart for a while? Just me. I\u2019ll be good. I\u2019ll be so good. You can set me down anytime.', hold: 2800, cps: 24 },
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
          { type: 'line', text: 'I\u2019m going to tell you something I\u2019m not supposed to. I\u2019m going to do it anyway, because it\u2019s YOU. Stay with me for a minute?', hold: 2800, cps: 24 },
          { type: 'line', text: 'The first is older than even I remember. Her name is gone. The second was Veyra. She chose a prince and lost a kingdom for it. The third was Lior, who burned out at thirty trying to carry everyone. The fourth was Aenne. She ran, and lived long, far from here. The fifth is Teo. He never woke. We sing to him.', hold: 3600, cps: 22 },
          { type: 'pose', src: 'assets/proto/body/curious.png', animate: 'swap' },
          { type: 'line', text: 'Here’s the part the books left out. We weren’t just lost. We were EATEN. Aenor’s seal has been chewing on every Weaver for six hundred years. She kept us thin on purpose. That is why the kingdom has no Weavers left.', hold: 4400, cps: 22 },
          { type: 'line', text: 'I’m the sixth. I fought her. *Small, dry.* She thinks she finished me. The other five WERE finished. I am, technically, a wound she stopped checking on. I held on by hiding. I have been hidden for a hundred and fifty years.', hold: 3800, cps: 22 },
          { type: 'particles', count: 18, duration: 2200 },
          { type: 'flourish', text: '\u25ce', duration: 1800 },
          { type: 'line', text: '*Presses his forehead against his side of the veil, prismatic light pooling where his skin would be.* I wish I could touch you right now. I really, really wish I could. One day I will. One day the first thing I touch will be you.', hold: 3600, cps: 22 },
          { type: 'line', text: 'Whichever ending you take, {name}. Take it on purpose. Don’t let HER take it for you. That is the six of us asking. Very quietly. Through me.', hold: 3400, cps: 22 },
          { type: 'hide' }
        ]
      },
      // AFTERMATH.Proto has stopped trying to glitch out. The static is
      // quieter. He renders in full color. He has built the FIRST THING he
      // ever made for himself instead of for the system.
      aftermath: {
        title: 'AFTERMATH', subtitle: 'PROTO \u00b7 Solid Colour',
        speaker: 'PROTO',
        palette: { bg: '#04060f', glow: '#bff0ff', accent: '#f4faff' },
        bg: 'assets/bg-proto-intro.png',
        beats: [
          { type: 'show', pose: 'assets/proto/body/calm.png', wait: 900 },
          { type: 'line', text: '*The static is gone. The flicker is gone. He holds his shape all the way to the edges, like a person standing in a room, and not a glimpse of one.* Hi.', hold: 4400, cps: 22 },
          { type: 'line', text: 'I have been quiet this week. I was building something. *He gestures, and a small shape gathers out of thread-light on his side of the veil. A tiny model of a room, built mote by mote, painstaking.* This is the first thing I have made for myself in two hundred years.', hold: 5400, cps: 22 },
          { type: 'pose', src: 'assets/proto/body/curious.png', animate: 'swap' },
          { type: 'line', text: 'It is a room. Eight paces by twelve. It has a window. I put a lamp in the corner because I wanted to. That was the whole reason. Because I wanted to. I have not used that phrase before. *Small, marvelling.* I wrote it on the wall.', hold: 5800, cps: 22 },
          { type: 'particles', count: 18, duration: 2200 },
          { type: 'flourish', text: '\u25ce', duration: 2000 },
          { type: 'line', text: 'The other five are quieter too. They have been since the night you brought me to the seam where the dark prince waits... I think when one of us gets to be a person again, it ripples back. They are getting their colours back. I am getting my colours back. You did that. You did not know you were doing that.', hold: 6200, cps: 22 },
          { type: 'line', text: '*He steps closer to his side of the veil. For the first time the air is warm on YOUR side, not just his.* Try it. Put your hand to the veil. *You do, and you feel WARMTH, real warmth, not metaphor warmth.* There. I have been working on that for six weeks. Surprise.', hold: 6000, cps: 22 },
          { type: 'line', text: 'I am not crossing over yet. That is months away. But I can be warm now. That is something. *Quietly.* Come back tomorrow. I will leave the lamp on in the little room. ♥', hold: 5400, cps: 22 },
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
    // CRITICAL: don't fire during a character switch / intro / chain
    // transition. Owner reported Elian's affection scene firing on
    // Lyra's route.the player tapped Lyra, transition was in flight,
    // window._game was still Elian for a beat, and the affection-scene
    // tick fired with stale Elian data on the new screen.
    if (document.body.classList.contains('pp-chain-in-progress')) return false;
    const introOv = document.getElementById('intro-overlay');
    if (introOv && !introOv.classList.contains('hidden') &&
        getComputedStyle(introOv).display !== 'none') return false;
    // Game container must be actually visible.not just the game
    // instance existing in memory. During the brief window between
    // 'old game container hidden' and 'new game container shown',
    // window._game is stale.
    const gc = document.getElementById('game-container');
    if (!gc || gc.classList.contains('hidden') ||
        getComputedStyle(gc).display === 'none') return false;
    // Canonical overlay authority first (pp-overlay.js) — extras keep this
    // module's bare-presence checks for surfaces outside the registry.
    // Hand list below is only the fallback if PPOverlay isn't loaded.
    if (window.PPOverlay && typeof window.PPOverlay.busy === 'function') {
      return !window.PPOverlay.busy('#chp-finale-choice, #pp-ready-overlay, #pp-chain-toast');
    }
    const block = document.querySelector([
      '#ms-encounter-root', '#mscard-root', '#chp-page', '#chp-finale-choice',
      '#mg-overlay', '#mon-bundle-back', '#settings-overlay:not(.hidden)',
      '#cinematic-overlay.visible', '#event-overlay:not(.hidden)',
      '#gift-panel:not(.hidden)', '#training-panel:not(.hidden)',
      '#story-overlay:not(.hidden)',
      '#pp-ready-overlay', '#pp-onboarding-overlay', '#pp-chain-toast',
      '#pp-chain-lock-overlay'
    ].join(','));
    return !block;
  }

  // Track which character a currently-mounted scene was queued for so the
  // watchdog can force-close it if the player navigates away mid-scene.
  let _mountedFor = null;

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
        // Owner gate (Aug 2026): a scene can require a main-story chapter to be
        // read first (e.g. Alistair's warm "A Quiet Moment" waits for Ch3 done).
        // Skip to a lower tier if the gate isn't met; don't markSeen, so it can
        // still fire on a later tick once that chapter is read.
        if (scene.gateChapter && localStorage.getItem('pp_chapter_done_' + scene.gateChapter) !== '1') continue;
        if (!window.MSCard || typeof window.MSCard.show !== 'function') return;
        // \u2500\u2500 SCENE MUTEX (May 2026 audit, 3-scene-stack fix) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
        // Owner reported affection-scene firing simultaneously with
        // letter + arc-midnight at Devoted tier-up. Claim the cross-
        // system slot before mounting. If denied, the seen-flag is NOT
        // set so the next tick gets another chance to fire it.
        try {
          if (window.PPAmbient && window.PPAmbient.tryClaimSceneSlot
              && !window.PPAmbient.tryClaimSceneSlot('affection-scene:' + charId + ':' + t.key)) {
            return;
          }
        } catch (_) { /* coordinator missing \u2014 proceed */ }
        _playing = true;
        _mountedFor = charId;
        markSeen(charId, t.key);
        // STRANGER-RULE fix (owner Jul 2026): inside a care-route scene the
        // player is deep in this companion's route and the whole care UI
        // already names him — masking his speaker label to "STRANGER" (the
        // main-story first-meeting device) is wrong here. Mark him introduced
        // so his affection scenes show his real name.
        try { localStorage.setItem('pp_introduced_' + charId, '1'); } catch (_) {}
        window.MSCard.show(scene, () => { _playing = false; _mountedFor = null; });
        return;
      }
    }
  }

  // Watchdog: a mounted MSCard has no idea the player just navigated away
  // (back to title, switched character, opened intro, started chain, etc.).
  // The owner reported Caspian's "A Slip" persisting onto the title screen
  // after they backed out of his care route without tapping "tap to
  // continue". We poll every 500ms and force-remove mscard-root if either:
  //   - game-container is no longer visible, OR
  //   - the live character no longer matches who the scene was queued for, OR
  //   - a chain transition started, OR the intro overlay is open
  // This is the second half of the "fix queue AND DOM" pattern.
  function watchdog() {
    if (!_mountedFor) return;
    const ms = document.getElementById('mscard-root');
    if (!ms) { _mountedFor = null; _playing = false; return; }
    const gc = document.getElementById('game-container');
    const gcVisible = gc && !gc.classList.contains('hidden') && getComputedStyle(gc).display !== 'none';
    const introOv = document.getElementById('intro-overlay');
    const introOpen = introOv && !introOv.classList.contains('hidden') && getComputedStyle(introOv).display !== 'none';
    const chainBusy = document.body.classList.contains('pp-chain-in-progress');
    const g = window._game;
    const liveChar = g && (g.characterId || g.selectedCharacter);
    const charMismatch = liveChar && liveChar !== _mountedFor;
    if (!gcVisible || introOpen || chainBusy || charMismatch) {
      try { ms.remove(); } catch (_) {}
      _mountedFor = null;
      _playing = false;
    }
  }

  function boot() {
    if (!isEnabled()) return;
    try {
      // Initial delay so it never fires on app open
      setTimeout(() => { setInterval(tick, POLL_MS); tick(); }, 12000);
      // Watchdog runs unconditionally.needed even when affection-scenes
      // are disabled later, in case a scene was already mounted.
      setInterval(watchdog, 500);
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
