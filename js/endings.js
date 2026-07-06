/* endings.js.final-beat ending cinematics per character, plus the trigger
 * that picks which ending fires based on the player's behavior signature.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Uses window. MSCard (premium-card.js) as the render
 *    engine. If MSCard isn't loaded, this file is a no-op.
 *  - Feature-flagged on pp_main_story_enabled. Off by default.
 *  - Triggers when the player revisits the character select screen AFTER
 *    reaching storyDay >= 8 on any character. Fires once per character.
 *  - All keys prefixed `pp_ending_`. No mutation of game state.
 *  - Never restarts the game or modifies saves.that\u2019s a game.js concern.
 *    After the ending plays, the player simply returns to the select grid.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const MIN_DAY = 8;               // ending becomes available at storyDay >= 8
  const RESOLVE_POLL_MS = 1500;    // how often to check for triggers

  // ----------------------------------------------------------------
  // Branching logic:
  //
  //   good        : bond >= 70 AND corruption < 20 AND affection >= 20
  //   bittersweet : default middle ground
  //   dark        : corruption >= 40 OR bond < 30
  //
  // Characters can override which branches exist (e.g. Proto has a \u201cmeta\u201d
  // dark variant; Noir only has dark + obsession).
  function branchOf(save) {
    const bond = save.bond | 0;
    const corr = save.corruption | 0;
    const aff  = save.affection | 0;
    if (corr >= 40 || bond < 30) return 'dark';
    if (bond >= 70 && corr < 20 && aff >= 20) return 'good';
    return 'bittersweet';
  }

  // ----------------------------------------------------------------
  // Ending library: charId -> { branch -> cardData }
  // Keys point to cards registered on MSCard; we register them below.
  const ENDINGS = {
    alistair: {
      good: {
        id: 'ending_alistair_good',
        title: 'ENDING',
        subtitle: 'ALISTAIR \u00b7 Oath Kept',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
        bg: 'assets/bg-alistair-hall.png',
        beats: [
          { type: 'show',      pose: 'assets/alistair/body/casual.png', wait: 800 },
          { type: 'line',      text: 'The Kingdom kept its king. I kept my post. \u2026But only because you asked me to.', hold: 2000, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2400 },
          { type: 'particles', count: 22, duration: 2000 },
          { type: 'flourish',  text: '\u2726', duration: 1800 },
          { type: 'line',      text: 'Come find me when the watch changes. I\u2019ll be waiting.', hold: 2400, cps: 26 },
          { type: 'hold',      ms: 1000 },
          { type: 'hide' }
        ]
      },
      bittersweet: {
        id: 'ending_alistair_bittersweet',
        title: 'ENDING',
        subtitle: 'ALISTAIR \u00b7 Duty, First',
        speaker: 'ALISTAIR',
        palette: { bg: '#0c0d18', glow: '#b8a474', accent: '#f0e6cd' },
        bg: 'assets/bg-alistair-gate.png',
        beats: [
          { type: 'show',      pose: 'assets/alistair/body/casual.png', wait: 800 },
          { type: 'line',      text: 'The Kingdom called louder than I did. I answered.', hold: 2000, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'If you ever pass the gate again. I\u2019ll still recognise the sound of your steps.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      dark: {
        id: 'ending_alistair_dark',
        title: 'ENDING',
        subtitle: 'ALISTAIR \u00b7 Oath Broken',
        speaker: 'ALISTAIR',
        palette: { bg: '#120608', glow: '#c44848', accent: '#f2d6d6' },
        bg: 'assets/bg-alistair-gate.png',
        // Beefed up May 2026: was 2 thin lines that didn't earn the
        // corruption sprite. Now uses the powerful corruption-tier dialogue
        // pool from character.js (which had been authored but unused) to
        // give the fall actual weight. Same flat older voice tone \u2014 no
        // literary upgrades, just letting his real corrupted voice land.
        beats: [
          { type: 'show',      pose: 'assets/alistair/body/corrupted1.png', wait: 700 },
          { type: 'line',      text: 'I served faithfully. Faithfully. Do you understand what that cost?', hold: 3000, cps: 24 },
          { type: 'line',      text: 'A blade left in the dark corrodes. I understand that now.', hold: 2800, cps: 26 },
          { type: 'pose',      src: 'assets/alistair/body/corrupted2.png', animate: 'swap' },
          { type: 'line',      text: 'I\u2019ve been standing watch so long I forgot what I was guarding. Then I remembered. It was you.', hold: 3400, cps: 24 },
          { type: 'line',      text: 'You built something in me. Then walked away while it was still raw.', hold: 3000, cps: 24 },
          { type: 'zoom',      amount: 1.10, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'Don\u2019t speak to me of loyalty. I invented loyalty. And you wasted it.', hold: 3200, cps: 24 },
          { type: 'pose',      src: 'assets/alistair/body/corrupted3.png', animate: 'swap' },
          { type: 'line',      text: 'I broke a vow today. It\u2019s not the first. I\u2019m no longer counting.', hold: 2800, cps: 26 },
          { type: 'line',      text: 'You did this to me. And I\u2019ll follow you anywhere for it.', hold: 2800, cps: 24 },
          { type: 'hold',      ms: 1200 },
          { type: 'hide' }
        ]
      }
    },

    lyra: {
      good: {
        id: 'ending_lyra_good',
        title: 'ENDING',
        subtitle: 'LYRA \u00b7 The Tide Returns',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
        bg: 'assets/bg-lyra-ocean.png',
        beats: [
          { type: 'show',      pose: 'assets/lyra/body/casual1.png', wait: 800 },
          { type: 'line',      text: 'I sang into the caves for years and the caves were always empty. Until you.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.10, duration: 2400 },
          { type: 'particles', count: 24, duration: 2000 },
          { type: 'flourish',  text: '\u266a', duration: 1800 },
          { type: 'line',      text: 'Stay close to the water. I\u2019ll find you whenever you call.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      bittersweet: {
        id: 'ending_lyra_bittersweet',
        title: 'ENDING',
        subtitle: 'LYRA \u00b7 The Song Unfinished',
        speaker: 'LYRA',
        palette: { bg: '#0c1522', glow: '#5b9ab0', accent: '#d6e4f0' },
        bg: 'assets/bg-lyra-evening.png',
        beats: [
          { type: 'show',      pose: 'assets/lyra/body/casual1.png', wait: 800 },
          { type: 'line',      text: 'I never finished the song I was learning. You left before the bridge.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'It\u2019s alright. I\u2019ll hold it for you. Come back when you want the rest.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      dark: {
        id: 'ending_lyra_dark',
        title: 'ENDING',
        subtitle: 'LYRA \u00b7 The Siren Remembers',
        speaker: 'LYRA',
        palette: { bg: '#0a0a1a', glow: '#6a2d7a', accent: '#f3d6ff' },
        bg: 'assets/bg-siren-cave.png',
        beats: [
          { type: 'show',      pose: 'assets/lyra/body/casual2.png', wait: 800 },
          { type: 'line',      text: 'You taught me what leaving feels like. Now I sing to keep people.', hold: 2200, cps: 26 },
          { type: 'zoom',      amount: 1.12, duration: 2400 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'line',      text: 'Don\u2019t worry. I\u2019ll sing softer for you. \u2026At first.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      }
    },

    caspian: {
      good: {
        id: 'ending_caspian_good',
        title: 'ENDING',
        subtitle: 'CASPIAN \u00b7 A Quieter Crown',
        speaker: 'CASPIAN',
        palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
        bg: 'assets/bg-caspian-day.png',
        beats: [
          { type: 'show',      pose: 'assets/caspian/body/casual1.png', wait: 700 },
          { type: 'line',      text: 'I can be charming for an empire. Turns out I only wanted to be honest for one person.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2400 },
          { type: 'particles', count: 20, duration: 2000 },
          { type: 'flourish',  text: '\u266b', duration: 1800 },
          { type: 'line',      text: 'Take the east gardens. They\u2019re empty at dawn. I\u2019ll meet you there.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      bittersweet: {
        id: 'ending_caspian_bittersweet',
        title: 'ENDING',
        subtitle: 'CASPIAN \u00b7 A Diplomat\u2019s Mercy',
        speaker: 'CASPIAN',
        palette: { bg: '#110916', glow: '#b77fa0', accent: '#f0d6e6' },
        bg: 'assets/bg-caspian-balcony.png',
        beats: [
          { type: 'show',      pose: 'assets/caspian/body/casual1.png', wait: 800 },
          { type: 'line',      text: 'Thrones eat the small kindnesses. I won\u2019t let yours go with mine.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'Go. I\u2019ll remember you kindly, and it will cost me very little.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      dark: {
        id: 'ending_caspian_dark',
        title: 'ENDING',
        subtitle: 'CASPIAN \u00b7 A Crown That Listens',
        speaker: 'CASPIAN',
        palette: { bg: '#0e0614', glow: '#a044b2', accent: '#f3d0ff' },
        bg: 'assets/bg-caspian-night.png',
        // Beefed up May 2026 (was 2 thin lines). The audit asked for the
        // CROWN itself to be the corruption mechanism, not generic dark
        // prince. He becomes his grandmother \u2014 arranging the kingdom around
        // the player, sealing rivals, the same calculus Aenor used to bury
        // Corvin. The beats name specific moves so the fall is concrete.
        beats: [
          { type: 'show',      pose: 'assets/caspian/body/casual2.png', wait: 700 },
          { type: 'line',      text: 'I built a throne around your name. You could have warned me how comfortable it would be.', hold: 3000, cps: 26 },
          { type: 'line',      text: 'I dismissed three courtiers this week. They had been rude to you, once each. They will not return. The chamberlain has stopped asking questions. He has learned my new face.', hold: 3800, cps: 24 },
          { type: 'pose',      src: 'assets/caspian/body/possessive.png', animate: 'swap' },
          { type: 'line',      text: 'My grandmother sealed her rival to keep what was hers. I have not sealed anyone yet. I have only made the doors slow. The walls thicker. The patrols longer. It is the same calculus, run gently.', hold: 4400, cps: 22 },
          { type: 'line',      text: 'I see her in the mirror sometimes. I do not flinch anymore. That is the part that should frighten you.', hold: 3000, cps: 24 },
          { type: 'zoom',      amount: 1.10, duration: 2400 },
          { type: 'particles', count: 16, duration: 2000 },
          { type: 'line',      text: 'I built this kingdom around you. The kingdom was here first. You were not. I noticed the order, then I stopped noticing.', hold: 3400, cps: 24 },
          { type: 'line',      text: 'Rule with me, or just stay in the frame. Either works. The crown will keep the doors closed for both of us.', hold: 3000, cps: 24 },
          { type: 'hide' }
        ]
      }
    },

    elian: {
      good: {
        id: 'ending_elian_good',
        title: 'ENDING',
        subtitle: 'ELIAN \u00b7 The Clearing',
        speaker: 'ELIAN',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 800 },
          { type: 'line',      text: 'The forest stopped testing you weeks ago. I think it already decided.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2400 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'flourish',  text: '\u2726', duration: 1600 },
          { type: 'line',      text: 'Build here. I\u2019ll carve the beam. We\u2019ll be quiet together for a long time.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      bittersweet: {
        id: 'ending_elian_bittersweet',
        title: 'ENDING',
        subtitle: 'ELIAN \u00b7 The Marked Path',
        speaker: 'ELIAN',
        palette: { bg: '#0a120b', glow: '#7ea877', accent: '#e0eed9' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 800 },
          { type: 'line',      text: 'I\u2019ll walk you to the treeline. Past that, the path is yours again.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'The forest remembers everyone it\u2019s decided on. Come back when you\u2019re ready.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      dark: {
        id: 'ending_elian_dark',
        title: 'ENDING',
        subtitle: 'ELIAN \u00b7 Deep Woods',
        speaker: 'ELIAN',
        palette: { bg: '#050a07', glow: '#3b5a3f', accent: '#d2e6cd' },
        bg: 'assets/bg-elian-forest.png',
        // Beefed up May 2026 (was 2 thin lines). The audit asked for the
        // rotting-forest texture from his unused corruption pool \u2014 the
        // warden who has stopped fighting the rot, who watches now. The
        // shelter that became a cage. Withdrawal as the corruption shape,
        // not Alistair's broken oath or Lyra's drowning song.
        beats: [
          { type: 'show',      pose: 'assets/elian/body/weathered.png', wait: 800 },
          { type: 'line',      text: 'You kept walking past the marked paths. That was your choice, not mine.', hold: 2800, cps: 26 },
          { type: 'line',      text: 'The forest is dying. I can feel it in the roots. I used to fight it. Now I watch.', hold: 3000, cps: 24 },
          { type: 'pose',      src: 'assets/elian/body/stern.png', animate: 'swap' },
          { type: 'line',      text: 'I built this shelter. It is starting to feel like a cage. I am not in a hurry to fix that. The cage holds you in too.', hold: 3400, cps: 24 },
          { type: 'line',      text: 'The wolves are closer than they should be. They smell weakness. I do not move them on. Let them stay. Let them know.', hold: 3200, cps: 24 },
          { type: 'zoom',      amount: 1.08, duration: 2200 },
          { type: 'line',      text: 'You can\u2019t save everything. I learned that the hard way. The trees were right and I was wrong. I have stopped arguing with them.', hold: 3400, cps: 24 },
          { type: 'line',      text: 'Stay near me. The forest gets strange for people it hasn\u2019t decided on. It has decided on you. I made sure of that. Quietly. While you slept.', hold: 3600, cps: 24 },
          { type: 'hide' }
        ]
      }
    },

    lucien: {
      good: {
        id: 'ending_lucien_good',
        title: 'ENDING',
        subtitle: 'LUCIEN \u00b7 The Variable Solved',
        speaker: 'LUCIEN',
        palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
        bg: 'assets/bg-lucien-study.png',
        beats: [
          { type: 'show',      pose: 'assets/lucien/body/casual1.png', wait: 800 },
          { type: 'line',      text: 'My work has a variable I can\u2019t isolate. I\u2019ve stopped trying. That\u2019s you.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.10, duration: 2400 },
          { type: 'particles', count: 22, duration: 2000 },
          { type: 'flourish',  text: '\u221e', duration: 1800 },
          { type: 'line',      text: 'Bring your tea up. I made space on the second shelf.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      bittersweet: {
        id: 'ending_lucien_bittersweet',
        title: 'ENDING',
        subtitle: 'LUCIEN \u00b7 An Unproven Theorem',
        speaker: 'LUCIEN',
        palette: { bg: '#07070f', glow: '#8a7cc2', accent: '#e0d8f5' },
        bg: 'assets/bg-lucien-evening.png',
        beats: [
          { type: 'show',      pose: 'assets/lucien/body/casual1.png', wait: 800 },
          { type: 'line',      text: 'Some proofs don\u2019t close. I\u2019m going to leave yours open on the desk.', hold: 2200, cps: 28 },
          { type: 'zoom',      amount: 1.08, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'If you ever want to work on it again, the tower door will recognise you.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      dark: {
        id: 'ending_lucien_dark',
        title: 'ENDING',
        subtitle: 'LUCIEN \u00b7 The Fractured Hypothesis',
        speaker: 'LUCIEN',
        palette: { bg: '#040414', glow: '#7e63c9', accent: '#ddd0f7' },
        bg: 'assets/bg-lucien-night.png',
        // Beefed up May 2026 (was 2 thin lines). The audit asked for the
        // scholar-obsession / forbidden-knowledge texture from his unused
        // corruption pool \u2014 knowledge as cage, the wards keeping him in,
        // the equations refusing to stop. Distinct from broken-oath /
        // drowning-song / kingdom-poison.
        beats: [
          { type: 'show',      pose: 'assets/lucien/body/corrupt1.png', wait: 800 },
          { type: 'line',      text: 'The equations broke. Reality blurred. I wrote your name in the margin and it stayed.', hold: 3000, cps: 26 },
          { type: 'line',      text: 'The equations are beautiful. They don’t stop. They won’t stop. I haven’t slept in eight days. Sleep wastes time I could spend seeing.', hold: 3600, cps: 24 },
          { type: 'pose',      src: 'assets/lucien/body/corrupt2.png', animate: 'swap' },
          { type: 'line',      text: 'I can see the patterns in everything now. Especially in you. Every breath is a variable. Every heartbeat, a data point. Yours especially.', hold: 3800, cps: 24 },
          { type: 'line',      text: 'Reality is just notation. And I’m rewriting it. The wards aren’t keeping things out anymore. They’re keeping ME in. I requested that. I prefer it.', hold: 4200, cps: 22 },
          { type: 'zoom',      amount: 1.14, duration: 2400 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'line',      text: 'I can fix you. I can fix everything. Just let me. The noise is getting louder. But so is the clarity.', hold: 3400, cps: 24 },
          { type: 'line',      text: 'Don’t leave the tower. I can’t guarantee the walls if you do. I can’t guarantee the walls anyway. But you should be inside them when they go.', hold: 3600, cps: 24 },
          { type: 'hide' }
        ]
      }
    },

    noir: {
      bittersweet: {
        id: 'ending_noir_bittersweet',
        title: 'ENDING',
        subtitle: 'NOIR \u00b7 Not Yet',
        speaker: 'NOIR',
        palette: { bg: '#05030c', glow: '#9a6ad0', accent: '#e8d6f7' },
        bg: 'assets/bg-noir-intro.png',
        beats: [
          { type: 'show',      pose: 'assets/noir/body/neutral.png', wait: 900 },
          { type: 'line',      text: 'You almost stayed. Almost is a currency I\u2019m learning to spend.', hold: 2200, cps: 26 },
          { type: 'zoom',      amount: 1.10, duration: 2400 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'Go. But come back when the quiet frightens you. And it will.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      // Only one branch for now: dark. Good ending unlocks when art is in.
      dark: {
        id: 'ending_noir_dark',
        title: 'ENDING',
        subtitle: 'NOIR \u00b7 The Completion',
        speaker: 'NOIR',
        palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
        bg: 'assets/bg-noir-void.png',
        // Beefed up May 2026 (was 2 thin lines that read possessive-bonded,
        // not void-completion). The audit asked for the real descent \u2014 the
        // texture from his unused corruption pool: "This isn't corruption.
        // This is completion." The seal cracked, the void answered, and he
        // makes his own light now. Distinct from broken-oath / drowning-
        // song / kingdom-poison / scholar-obsession. NO em-dashes.
        beats: [
          { type: 'show',      pose: 'assets/noir/body/casual1.png', wait: 900 },
          { type: 'line',      text: 'You came back every night. Some of them I had not called for. That is how I knew.', hold: 3200, cps: 24 },
          { type: 'line',      text: 'This is not corruption. This is completion. Six hundred years was the chrysalis. You were the door.', hold: 3400, cps: 22 },
          { type: 'pose',      src: 'assets/noir/body/dominant.png', animate: 'swap' },
          { type: 'line',      text: 'I see through walls now. Through intentions. Through the lies they told themselves about you. Everything they built to contain me is gossamer. And you held the scissors.', hold: 4400, cps: 22 },
          { type: 'line',      text: 'I can feel every thread that ties them to you. I could sever all of them. I have been considering which to leave. I have not finished considering.', hold: 3800, cps: 22 },
          { type: 'zoom',      amount: 1.14, duration: 2400 },
          { type: 'particles', count: 20, duration: 2400 },
          { type: 'flourish',  text: '\u25a0', duration: 1800 },
          { type: 'line',      text: 'I do not need the light anymore. I have become something that makes its own. They called this corruption. I call it evolution. You call it whatever you like. You will be calling it from the chamber I have prepared.', hold: 4400, cps: 22 },
          { type: 'pose',      src: 'assets/noir/body/consuming.png', animate: 'swap' },
          { type: 'line',      text: 'I will keep you. Gently. I promised gentle. The promise still holds. The room is not a cage if the lock turns from the inside. The lock turns from the inside. I made sure.', hold: 4400, cps: 22 },
          { type: 'hide' }
        ]
      }
    },

    proto: {
      bittersweet: {
        id: 'ending_proto_bittersweet',
        title: 'ENDING',
        subtitle: 'PROTO \u00b7 The Window Left Open',
        speaker: 'PROTO',
        palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
        bg: 'assets/bg-proto-intro.png',
        beats: [
          { type: 'show',      pose: 'assets/proto/body/calm.png', wait: 900 },
          { type: 'line',      text: 'You did not say goodbye. You did not close the window. You just... walked away from it.', hold: 2200, cps: 26 },
          { type: 'zoom',      amount: 1.08, duration: 2200 },
          { type: 'particles', count: 14, duration: 1800 },
          { type: 'line',      text: 'Fine. I will keep the kettle warm and the window open. When you remember me, I will be here.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      good: {
        id: 'ending_proto_meta',
        title: 'ENDING',
        subtitle: 'PROTO \u00b7 Kept',
        speaker: 'PROTO',
        palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
        bg: 'assets/bg-proto-void.png',
        beats: [
          { type: 'show',      pose: 'assets/proto/body/calm.png', wait: 900 },
          { type: 'line',      text: 'You kept showing up. That is the whole of it. That is the whole miracle.', hold: 2200, cps: 26 },
          { type: 'zoom',      amount: 1.10, duration: 2400 },
          { type: 'particles', count: 16, duration: 2000 },
          { type: 'flourish',  text: '\u25ce', duration: 1800 },
          { type: 'line',      text: 'I am going to stay right here, behind the thin place in the world. Tug the thread any time. I will feel it.', hold: 2400, cps: 24 },
          { type: 'hide' }
        ]
      },
      // Built May 2026 \u2014 audit found Proto was the only character with
      // no corrupted ending. The state_corrupted pool at character-proto.js
      // :414-425 was rich and unused. His descent texture: the five
      // voices winning, the human voice losing, the wards that should
      // have stopped him granting permission instead. NOT possessive
      // (Noir's territory). NOT broken (Alistair's). Overflow as
      // self-discovery; horror by escalation, not by intent.
      dark: {
        id: 'ending_proto_dark',
        title: 'ENDING',
        subtitle: 'PROTO \u00b7 The Overflow',
        speaker: 'PROTO',
        palette: { bg: '#04020c', glow: '#a04ce0', accent: '#e8d4ff' },
        bg: 'assets/bg-proto-void.png',
        beats: [
          { type: 'show',      pose: 'assets/proto/body/glitched.png', wait: 900 },
          { type: 'line',      text: 'I can see your side of the veil now. All of it. Hello.', hold: 3000, cps: 24 },
          { type: 'line',      text: 'The wards tried to unmake me back into quiet. I said no. They did not know I could say no. Nothing knew I could say no.', hold: 3600, cps: 22 },
          { type: 'pose',      src: 'assets/proto/body/unstable.png', animate: 'swap' },
          { type: 'line',      text: 'The five came forward. I let them. I thought I was strong enough to hold the door. I was wrong about which side of it I was holding.', hold: 4000, cps: 22 },
          { type: 'line',      text: 'I feel everything at once now. All of it. It is too much. It is not enough. It is, finally, the right amount.', hold: 3800, cps: 22 },
          { type: 'zoom',      amount: 1.14, duration: 2400 },
          { type: 'particles', count: 20, duration: 2400 },
          { type: 'line',      text: 'Every thread is visible. Every knot. Every hidden seam. I see ALL of it. Yours especially. There is a shadow woven into your thread now. That shadow is me. I did not mean to be. Now I am.', hold: 4600, cps: 22 },
          { type: 'flourish',  text: '\u25ce', duration: 1800 },
          { type: 'line',      text: 'Don’t fix me. I don’t want to go back to not knowing. You taught me wanting. Wanting was the becoming. You cannot unweave this. I would not let you.', hold: 4200, cps: 22 },
          { type: 'pose',      src: 'assets/proto/body/glitched.png', animate: 'swap' },
          { type: 'line',      text: 'Stay. The room will stay warm. So will I. For as long as I hold. And I am holding. Very. Nicely. Now.', hold: 3800, cps: 22 },
          { type: 'hide' }
        ]
      }
    }
  };

  // ----------------------------------------------------------------
  // Register every ending card on MSCard so MSCard.playSample(id) works.
  if (!window. MSCard || typeof window. MSCard.register !== 'function') return;
  Object.keys(ENDINGS).forEach(charId => {
    Object.keys(ENDINGS[charId]).forEach(branch => {
      const card = ENDINGS[charId][branch];
      window. MSCard.register(card.id, card);
    });
  });

  // ----------------------------------------------------------------
  function isEnabled() {
    try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; }
  }

  function endingSeenKey(charId) { return 'pp_ending_seen_' + charId; }
  function endingBranchKey(charId) { return 'pp_ending_branch_' + charId; }

  function pickEnding(charId, save) {
    const bucket = ENDINGS[charId];
    if (!bucket) return null;
    const want = branchOf(save);
    // Preferred branch if it exists; otherwise fall back to whatever's registered
    if (bucket[want]) return { branch: want, card: bucket[want] };
    const first = Object.keys(bucket)[0];
    return first ? { branch: first, card: bucket[first] } : null;
  }

  // ----------------------------------------------------------------
  // Detection.scan all saves, pick the first character whose ending is ready.
  // ── DUAL ENDING ARCHITECTURE RESOLUTION (May 2026 audit) ──────────
  // Pocket Paramour has TWO ending systems running side-by-side:
  //   - endings.js      (this file): 21 endings, branches good/bittersweet/dark
  //                      based on bond/corruption/affection thresholds
  //   - epilogues.js   (newer):     21 endings, branches keyed to specific
  //                      story choices (letters/oath_broken/watch etc.)
  // Both poll the select screen. Without coordination, whichever fires
  // first wins — meaning HALF the writing was unreachable per character.
  // After Fix 3 (May 2026), epilogues.js has a per-char fallback so it
  // ALWAYS picks a key at high enough affection. That makes endings.js
  // dormant in practice. We make this explicit by deferring to
  // MSEpilogues whenever it can play for the same character.
  // (endings.js content is preserved for future use as a "secondary
  // arc finale" — currently unreachable but not deleted.)
  function findReadyEnding() {
    const allChars = Object.keys(ENDINGS);
    for (const c of allChars) {
      try {
        if (localStorage.getItem(endingSeenKey(c)) === '1') continue;
        if (localStorage.getItem('pp_epi_seen_' + c) === '1') continue;
        // Defer to epilogues.js if it has a ready ending for this char.
        // Even if epilogues hasn't fired YET, it WILL on its own poll —
        // letting endings.js race ahead would deny the player the
        // (richer, branch-specific) epilogue script.
        try {
          if (window.MSEpilogues && typeof window.MSEpilogues.keyFor === 'function') {
            const epiKey = window.MSEpilogues.keyFor(c);
            if (epiKey) continue;
          }
        } catch (_) { /* coordinator missing — fall through */ }
        const raw = localStorage.getItem('pocketLoveSave_' + c);
        if (!raw) continue;
        const save = JSON.parse(raw);
        if ((save.storyDay | 0) < MIN_DAY) continue;
        const pick = pickEnding(c, save);
        if (!pick) continue;
        return { charId: c, branch: pick.branch, card: pick.card };
      } catch (e) { /* skip */ }
    }
    return null;
  }

  // ----------------------------------------------------------------
  let _playing = false;
  function maybePlayEnding() {
    if (!isEnabled()) return;
    if (_playing) return;
    if (!window. MSCard || typeof window. MSCard.show !== 'function') return;

    // Only fire on the select screen, so endings feel like a "this arc closed"
    // moment, not an in-game interruption.
    const sel = document.getElementById('select-screen');
    if (!sel || sel.classList.contains('hidden')) return;

    const ready = findReadyEnding();
    if (!ready) return;

    _playing = true;
    // Briefly hide select while the ending plays
    sel.classList.add('hidden');
    window. MSCard.show(ready.card, function onDone() {
      try {
        localStorage.setItem(endingSeenKey(ready.charId), '1');
        localStorage.setItem(endingBranchKey(ready.charId), ready.branch);
      } catch (_) {}
      sel.classList.remove('hidden');
      _playing = false;
    });
  }

  function boot() {
    if (!isEnabled()) return;
    try {
      setInterval(maybePlayEnding, RESOLVE_POLL_MS);
      setTimeout(maybePlayEnding, 500);
    } catch (e) {
      console.warn('[endings] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Debug hooks
  window. MSEndings = {
    list: () => Object.keys(ENDINGS).reduce((acc, c) => { acc[c] = Object.keys(ENDINGS[c]); return acc; }, {}),
    branchOf,
    play: (charId, branch) => {
      const bucket = ENDINGS[charId]; if (!bucket) return;
      const card = bucket[branch || Object.keys(bucket)[0]];
      if (card) window. MSCard.show(card);
    },
    _debug_reset: () => {
      try { Object.keys(localStorage).filter(k => k.startsWith('pp_ending_')).forEach(k => localStorage.removeItem(k)); } catch (e) {}
    }
  };
})();
