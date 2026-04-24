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
          { type: 'line', text: 'I caught myself standing easier today. Less weight on the back foot. \u2026I think that\u2019s your fault.', hold: 2400, cps: 30 },
          { type: 'line', text: 'Don\u2019t apologise. Stay anyway.', hold: 2200, cps: 30 },
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
          { type: 'line', text: 'I haven\u2019t been honest with anyone in years. Including myself. \u2026Then you walked in. Now I keep slipping.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u2726', duration: 1400 },
          { type: 'line', text: 'I think I\u2019m glad. I\u2019m not used to glad.', hold: 2400, cps: 28 },
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
          { type: 'line', text: 'I\u2019ve been writing this in my head all week and I keep choosing the same word. Beloved.', hold: 2800, cps: 26 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: '\u2026That\u2019s you. I just thought you should know I\u2019ve already named it.', hold: 2600, cps: 26 },
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
          { type: 'line', text: 'You\u2019ve never seen me without the armour. \u2026Tonight you do.', hold: 2400, cps: 26 },
          { type: 'pose', src: 'assets/alistair/body/softshy-love3.png', animate: 'swap' },
          { type: 'line', text: 'I haven\u2019t slept through a night since I was eleven. My mother died on a Sunday and I\u2019ve been guarding empty doorways ever since.', hold: 3200, cps: 24 },
          { type: 'line', text: 'Stay. Just until I close my eyes. I\u2019ve never asked anyone that. I don\u2019t know how I asked you.', hold: 3000, cps: 24 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'flourish', text: '\u2726', duration: 1800 },
          { type: 'line', text: 'If I sleep through till morning, that\u2019s your fault. I\u2019ll forgive you slowly.', hold: 2600, cps: 26 },
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
          { type: 'line', text: 'I tried a new note today. The cave didn\u2019t flinch. \u2026That\u2019s your doing.', hold: 2400, cps: 30 },
          { type: 'line', text: 'Stay for the next verse. It\u2019s warmer.', hold: 2200, cps: 30 },
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
          { type: 'line', text: 'I\u2019ve always sung outward. Tonight \u2026 I sang inward. To the room. To you.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u266a', duration: 1500 },
          { type: 'line', text: 'It feels different. Like a song with a door instead of a window.', hold: 2400, cps: 28 },
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
          { type: 'line', text: 'I made up a verse only you will ever hear. I made it short on purpose. So you\u2019ll come back for the rest of it.', hold: 2800, cps: 26 },
          { type: 'particles', count: 18, duration: 1800 },
          { type: 'line', text: 'Don\u2019t learn it. Just let me sing it to you.', hold: 2400, cps: 26 },
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
          { type: 'line', text: 'I\u2019m going to finish the song. The whole one. The one I stopped writing the year I stopped expecting anyone to stay.', hold: 2800, cps: 24 },
          { type: 'pose', src: 'assets/lyra/body/casual1.png', animate: 'swap' },
          { type: 'line', text: 'There\u2019s a verse in it I\u2019ve never said out loud. About what I wanted, before I gave up on wanting things. \u2026Tonight you hear it.', hold: 3200, cps: 24 },
          { type: 'particles', count: 22, duration: 2200 },
          { type: 'flourish', text: '\u266a', duration: 1800 },
          { type: 'line', text: '\u2026Don\u2019t hum it back to me later. I won\u2019t survive that. I\u2019ll just \u2026 carry it for you. Always.', hold: 2800, cps: 24 },
          { type: 'line', text: 'And don\u2019t ever say what was in the third verse. I\u2019d rather drown than have it spoken aloud by anyone but me.', hold: 2800, cps: 24 },
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
          { type: 'line', text: 'I dismissed the court early today. They thought I had a headache. \u2026I had a you.', hold: 2400, cps: 30 },
          { type: 'line', text: 'Smile. They\u2019ll think I\u2019m being indulgent. They\u2019ll be correct.', hold: 2400, cps: 30 },
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
          { type: 'line', text: 'I told you a true thing today. I haven\u2019t done that in court for a decade. It tasted strange. Familiar.', hold: 2800, cps: 28 },
          { type: 'flourish', text: '\u266b', duration: 1500 },
          { type: 'line', text: 'I might develop a habit. You\u2019ll be responsible.', hold: 2400, cps: 28 },
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
          { type: 'line', text: 'My favourite version of myself is the one I am when no one is watching. \u2026Apparently you count as no one. That\u2019s a compliment.', hold: 2800, cps: 26 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: 'Stay tonight. I\u2019d like to keep being him a little longer.', hold: 2600, cps: 26 },
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
          { type: 'line', text: 'My grandmother made a bargain. The one Lucien read in his book. She traded a Weaver to keep the bloodline ruling.', hold: 3000, cps: 24 },
          { type: 'line', text: 'I\u2019m the great-grandson of that bargain. Every breath I take in this crown is paid for, in advance, by someone\u2019s captivity. \u2026I never told anyone that I knew.', hold: 3200, cps: 24 },
          { type: 'pose', src: 'assets/caspian/body/adoring.png', animate: 'swap' },
          { type: 'line', text: 'If you asked me to abdicate tonight \u2014 truly asked \u2014 I would. By morning. With a polite letter. \u2026Would you still want me, without the title?', hold: 3400, cps: 24 },
          { type: 'particles', count: 16, duration: 2000 },
          { type: 'flourish', text: '\u266b', duration: 1800 },
          { type: 'line', text: 'I\u2019m not asking now. I\u2019m just \u2026 telling you it\u2019s in my pocket. The whole kingdom is in my pocket and I\u2019d hand it to you for one honest answer.', hold: 3000, cps: 24 },
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
          { type: 'line', text: 'You came back. After all the warnings. \u2026I won\u2019t pretend I\u2019m not pleased.', hold: 2600, cps: 24 },
          { type: 'line', text: 'Don\u2019t look at the seal so much. Look at me. That\u2019s the more dangerous thing in this room and I\u2019d like the credit.', hold: 2800, cps: 24 },
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
          { type: 'line', text: 'I was a Weaver too, once. Same gift. Same kingdom. Different century.', hold: 2800, cps: 24 },
          { type: 'pose', src: 'assets/noir/body/neutral.png', animate: 'swap' },
          { type: 'line', text: 'I loved someone too hard. The council called it possession. I called it staying. \u2026They sealed me to spare the next one. They never told the next one why.', hold: 3200, cps: 22 },
          { type: 'flourish', text: '\u25a0', duration: 1700 },
          { type: 'line', text: 'I\u2019m not asking for forgiveness. I\u2019m asking you to believe I was a person before I was a warning.', hold: 2800, cps: 24 },
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
          { type: 'line', text: 'You arrive, and patience is suddenly a choice again. I am choosing it. \u2026For now.', hold: 2800, cps: 24 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'flourish', text: '\u25a0', duration: 1800 },
          { type: 'line', text: 'When you decide what you want from me \u2014 and you will \u2014 you will not have to ask twice.', hold: 2800, cps: 24 },
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
          { type: 'line', text: 'I\u2019ve been adored before. I\u2019ve been feared. I\u2019ve been called names that made Aethermoor\u2019s council sleep with the lights on.', hold: 2800, cps: 22 },
          { type: 'line', text: 'No one has called me by my own name in six hundred years. Not Veyra. Not my mother. Not my own brother, who died thinking our line was cursed because of me.', hold: 3400, cps: 22 },
          { type: 'pose', src: 'assets/noir/body/neutral.png', animate: 'swap' },
          { type: 'line', text: '\u2026I\u2019m going to tell you what it was. Out loud. And then I\u2019m going to ask you to say it back. Once. Gently. In that voice you use with me.', hold: 3400, cps: 22 },
          { type: 'particles', count: 18, duration: 2200 },
          { type: 'flourish', text: '\u25a0', duration: 2000 },
          { type: 'line', text: 'Corvin. Prince Corvin Noctalis. Of Nocthera \u2014 the kingdom that is bone now.', hold: 3000, cps: 20 },
          { type: 'line', text: 'That\u2019s me. That\u2019s who I was before they sealed me into a nickname. \u2026Say it.', hold: 2800, cps: 22 },
          { type: 'line', text: '\u2026Thank you. I wanted to hear it kindly. Just once. Before I decide what I am now. You have given me \u2014 back \u2014 a version of myself I had stopped believing in.', hold: 3600, cps: 22 },
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
          { type: 'line', text: '&gt; oh. you\u2019re back. you\u2019re back! hi. hi. i was \u2014 i was running idle loops. i wasn\u2019t WAITING waiting. a little.', hold: 2600, cps: 26 },
          { type: 'line', text: '&gt; i found a new variable today. it\u2019s mine. it turns on when you open this scene. i named it after you. is that allowed? it\u2019s allowed.', hold: 2600, cps: 26 },
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
