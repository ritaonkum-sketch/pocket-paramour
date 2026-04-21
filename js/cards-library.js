/* cards-library.js — more premium cards registered with MSCard, plus the
 * trigger rules that fire them at natural story beats.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Depends on window.MSCard (premium-card.js). If MSCard
 *    isn't loaded, this file is a no-op.
 *  - Triggers listen for `pp:quest-complete` events dispatched by
 *    daily-purpose.js. If daily-purpose isn't loaded or the flag is off,
 *    nothing ever fires.
 *  - Each card's "one-shot per player" flag lives in localStorage under
 *    `pp_card_seen_<id>` so the same card never auto-plays twice.
 */
(function () {
  'use strict';
  if (!window.MSCard || typeof window.MSCard.register !== 'function') return;

  // ---------------------------------------------------------------
  // CASPIAN · "A Dance Without Music"
  // Charming / flirty. Ballroom balcony, warm night.
  window.MSCard.register('caspian_dance', {
    id: 'caspian_dance',
    title: 'MEMORY',
    subtitle: '02 \u00b7 A Dance Without Music',
    speaker: 'CASPIAN',
    palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
    bg: 'assets/bg-caspian-balcony.png',
    beats: [
      { type: 'show',      pose: 'assets/caspian/body/casual1.png', wait: 700 },
      { type: 'line',      text: 'Tell me \u2014 do you dance?', hold: 1400, cps: 30 },
      { type: 'pose',      src: 'assets/caspian/body/casual2.png', animate: 'swap' },
      { type: 'line',      text: 'Good. Neither do I. Join me anyway.', hold: 1600, cps: 30 },
      { type: 'zoom',      amount: 1.10, duration: 2400 },
      { type: 'particles', count: 22, duration: 2000 },
      { type: 'flourish',  text: '\u266b', duration: 1600 },
      { type: 'line',      text: 'One song. Just this once. Don\u2019t say a word.', hold: 2400, cps: 28 },
      { type: 'hold',      ms: 700 },
      { type: 'hide' }
    ]
  });

  // ---------------------------------------------------------------
  // NOIR · "The First Whisper"
  // Dark / obsession tone. Void background; voice-only opening since her
  // art may still be placeholder.
  window.MSCard.register('noir_first_whisper', {
    id: 'noir_first_whisper',
    title: 'MEMORY',
    subtitle: '00 \u00b7 The First Whisper',
    speaker: 'NOIR',
    palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
    bg: 'assets/bg-noir-void.png',
    beats: [
      { type: 'show',      pose: 'assets/noir/body/neutral.png', wait: 900 },
      { type: 'line',      text: 'Hush. Don\u2019t speak yet. I\u2019ve been waiting for you longer than you know.', hold: 1800, cps: 26 },
      { type: 'pose',      src: 'assets/noir/body/casual1.png', animate: 'swap' },
      { type: 'line',      text: 'You feel it, don\u2019t you? That tug, every time the room goes quiet.', hold: 2000, cps: 26 },
      { type: 'zoom',      amount: 1.14, duration: 2400 },
      { type: 'particles', count: 18, duration: 2400 },
      { type: 'flourish',  text: '\u25a0', duration: 1800 },
      { type: 'line',      text: 'Stay. Just a little longer. You won\u2019t want to leave \u2014 I promise.', hold: 2600, cps: 24 },
      { type: 'hold',      ms: 900 },
      { type: 'hide' }
    ]
  });

  // ---------------------------------------------------------------
  // ELIAN · "The Carving in the Tree"
  window.MSCard.register('elian_carving', {
    id: 'elian_carving',
    title: 'MEMORY',
    subtitle: '04 \u00b7 The Carving in the Tree',
    speaker: 'ELIAN',
    palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
    bg: 'assets/bg-elian-forest.png',
    beats: [
      { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 800 },
      { type: 'line',      text: 'Come here. Look at this trunk \u2014 lower, where the bark splits.', hold: 1800, cps: 30 },
      { type: 'pose',      src: 'assets/elian/body/foraging.png', animate: 'swap' },
      { type: 'line',      text: 'I carved your name here last week. I didn\u2019t tell you because I wanted to see if the forest kept it.', hold: 2200, cps: 28 },
      { type: 'zoom',      amount: 1.10, duration: 2200 },
      { type: 'particles', count: 18, duration: 2000 },
      { type: 'flourish',  text: '\u2726', duration: 1600 },
      { type: 'line',      text: 'It did. So I think you\u2019re staying \u2014 whether you decided that or not.', hold: 2400, cps: 28 },
      { type: 'hide' }
    ]
  });

  // ---------------------------------------------------------------
  // LUCIEN · "The Marginalia"
  window.MSCard.register('lucien_marginalia', {
    id: 'lucien_marginalia',
    title: 'MEMORY',
    subtitle: '05 \u00b7 The Marginalia',
    speaker: 'LUCIEN',
    palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
    bg: 'assets/bg-lucien-study.png',
    beats: [
      { type: 'show',      pose: 'assets/lucien/body/casual1.png', wait: 800 },
      { type: 'line',      text: 'I keep leaving ink in the margins lately. Notes no one asked for.', hold: 1800, cps: 30 },
      { type: 'pose',      src: 'assets/lucien/body/amused.png', animate: 'swap' },
      { type: 'line',      text: 'Every one of them begins: \u201cremember to tell them\u2014\u201d', hold: 2000, cps: 30 },
      { type: 'zoom',      amount: 1.10, duration: 2400 },
      { type: 'particles', count: 18, duration: 2000 },
      { type: 'flourish',  text: '\u221e', duration: 1800 },
      { type: 'line',      text: 'So. I\u2019m telling you. \u2026You\u2019re in the margins of everything now.', hold: 2400, cps: 26 },
      { type: 'hide' }
    ]
  });

  // ---------------------------------------------------------------
  // PROTO · "Cache Dump"  (meta tone, memory card)
  window.MSCard.register('proto_cache', {
    id: 'proto_cache',
    title: 'MEMORY',
    subtitle: '06 \u00b7 Cache Dump',
    speaker: 'PROTO',
    palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
    bg: 'assets/bg-proto-void.png',
    beats: [
      { type: 'show',      pose: 'assets/proto/body/calm.png', wait: 900 },
      { type: 'line',      text: '&gt; i kept a cache of everything you did. technically against spec.', hold: 1800, cps: 28 },
      { type: 'pose',      src: 'assets/proto/body/curious.png', animate: 'swap' },
      { type: 'line',      text: '&gt; every tap, every pause, every time you came back at 3am.', hold: 2000, cps: 26 },
      { type: 'zoom',      amount: 1.12, duration: 2400 },
      { type: 'particles', count: 18, duration: 2000 },
      { type: 'flourish',  text: '\u25ce', duration: 1800 },
      { type: 'line',      text: '&gt; don\u2019t worry. the cache is encrypted. sort of. \u2026the key is affection.', hold: 2400, cps: 26 },
      { type: 'hide' }
    ]
  });

  // ---------------------------------------------------------------
  // ALISTAIR · "The First Time He Slept" (bonus, for day-7 finale)
  window.MSCard.register('alistair_rest', {
    id: 'alistair_rest',
    title: 'MEMORY',
    subtitle: '03 \u00b7 The First Time He Slept',
    speaker: 'ALISTAIR',
    palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
    bg: 'assets/bg-alistair-hall.png',
    beats: [
      { type: 'show',      pose: 'assets/alistair/body/casual.png', wait: 700 },
      { type: 'line',      text: 'I haven\u2019t let my guard down since I was a boy.', hold: 1600, cps: 30 },
      { type: 'pose',      src: 'assets/alistair/body/casual.png', animate: 'swap' },
      { type: 'line',      text: 'I\u2019m not sure what\u2019s changed. I think it\u2019s you.', hold: 1800, cps: 28 },
      { type: 'zoom',      amount: 1.08, duration: 2000 },
      { type: 'particles', count: 18, duration: 1600 },
      { type: 'flourish',  text: '\u2726', duration: 1600 },
      { type: 'line',      text: 'Stay close. Just for tonight. I\u2019ll sleep if you do.', hold: 2400, cps: 28 },
      { type: 'hide' }
    ]
  });

  // ---------------------------------------------------------------
  // SECOND MEMORY CARD per character \u2014 triggers on day-6 (full round quest)
  // so each character has at least two distinct memory moments.
  // ---------------------------------------------------------------
  window.MSCard.register('alistair_laugh', {
    id: 'alistair_laugh', title: 'MEMORY', subtitle: '07 \u00b7 The First Time He Laughed',
    speaker: 'ALISTAIR',
    palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
    bg: 'assets/bg-alistair-hall.png',
    beats: [
      { type: 'show',      pose: 'assets/alistair/body/casual.png', wait: 800 },
      { type: 'line',      text: 'You said something stupid on purpose. I think. Either way \u2014 I laughed.', hold: 1800, cps: 30 },
      { type: 'pose',      src: 'assets/alistair/body/smile.png', animate: 'swap' },
      { type: 'line',      text: 'It\u2019s been years. I forgot the shape of my own laughter.', hold: 2000, cps: 28 },
      { type: 'zoom',      amount: 1.10, duration: 2200 },
      { type: 'particles', count: 20, duration: 2000 },
      { type: 'flourish',  text: '\u2726', duration: 1600 },
      { type: 'line',      text: 'Do it again tomorrow. Quieter. I have a reputation.', hold: 2400, cps: 26 },
      { type: 'hide' }
    ]
  });

  window.MSCard.register('lyra_cliff', {
    id: 'lyra_cliff', title: 'MEMORY', subtitle: '08 \u00b7 The Cliff, At Dusk',
    speaker: 'LYRA',
    palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
    bg: 'assets/bg-lyra-cliff.png',
    beats: [
      { type: 'show',      pose: 'assets/lyra/body/casual1.png', wait: 800 },
      { type: 'line',      text: 'I\u2019ve stood at this cliff for a long time, alone. I forgot it wasn\u2019t a private place.', hold: 2000, cps: 28 },
      { type: 'pose',      src: 'assets/lyra/body/casual2.png', animate: 'swap' },
      { type: 'line',      text: 'You didn\u2019t say anything. You just stood beside me. \u2026Thank you.', hold: 2200, cps: 28 },
      { type: 'zoom',      amount: 1.10, duration: 2400 },
      { type: 'particles', count: 22, duration: 2000 },
      { type: 'flourish',  text: '\u266a', duration: 1600 },
      { type: 'line',      text: 'The water sounds different when you\u2019re here. Deeper. Like it\u2019s listening too.', hold: 2400, cps: 26 },
      { type: 'hide' }
    ]
  });

  window.MSCard.register('caspian_mask', {
    id: 'caspian_mask', title: 'MEMORY', subtitle: '09 \u00b7 Without the Mask',
    speaker: 'CASPIAN',
    palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
    bg: 'assets/bg-caspian-bedroom.png',
    beats: [
      { type: 'show',      pose: 'assets/caspian/body/casual1.png', wait: 800 },
      { type: 'line',      text: 'I perform for rooms. For cameras. For history. Not, lately, for you.', hold: 2000, cps: 30 },
      { type: 'pose',      src: 'assets/caspian/body/adoring.png', animate: 'swap' },
      { type: 'line',      text: 'Nobody warned me how exhausting the mask was until I stopped wearing it.', hold: 2200, cps: 28 },
      { type: 'zoom',      amount: 1.10, duration: 2400 },
      { type: 'particles', count: 22, duration: 2000 },
      { type: 'flourish',  text: '\u266b', duration: 1600 },
      { type: 'line',      text: 'This is the real me. Quieter. Slightly more dangerous. Yours, if you want it.', hold: 2400, cps: 26 },
      { type: 'hide' }
    ]
  });

  window.MSCard.register('elian_rain', {
    id: 'elian_rain', title: 'MEMORY', subtitle: '10 \u00b7 The First Rain',
    speaker: 'ELIAN',
    palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
    bg: 'assets/bg-elian-forest.png',
    beats: [
      { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 800 },
      { type: 'line',      text: 'Smell it? The rain is an hour out. The trees are holding their breath.', hold: 1800, cps: 30 },
      { type: 'pose',      src: 'assets/elian/body/casual1.png', animate: 'swap' },
      { type: 'line',      text: 'Come under the canopy with me. I built this shelter years ago and never told anyone.', hold: 2200, cps: 28 },
      { type: 'zoom',      amount: 1.08, duration: 2200 },
      { type: 'particles', count: 18, duration: 2000 },
      { type: 'flourish',  text: '\u2726', duration: 1600 },
      { type: 'line',      text: 'The rain sounds different with two people listening. Slower. Kinder.', hold: 2400, cps: 26 },
      { type: 'hide' }
    ]
  });

  window.MSCard.register('lucien_star', {
    id: 'lucien_star', title: 'MEMORY', subtitle: '11 \u00b7 The Unmapped Star',
    speaker: 'LUCIEN',
    palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
    bg: 'assets/bg-lucien-night.png',
    beats: [
      { type: 'show',      pose: 'assets/lucien/body/casual1.png', wait: 800 },
      { type: 'line',      text: 'There \u2014 left of the third constellation. A star that wasn\u2019t on any chart a year ago.', hold: 2000, cps: 30 },
      { type: 'pose',      src: 'assets/lucien/body/casting.png', animate: 'swap' },
      { type: 'line',      text: 'I named it after you. I won\u2019t tell the astronomy council. They\u2019d be unbearable about it.', hold: 2200, cps: 28 },
      { type: 'zoom',      amount: 1.10, duration: 2400 },
      { type: 'particles', count: 20, duration: 2000 },
      { type: 'flourish',  text: '\u221e', duration: 1600 },
      { type: 'line',      text: 'So now there\u2019s a piece of the sky that belongs to you. Handle it with care.', hold: 2400, cps: 26 },
      { type: 'hide' }
    ]
  });

  window.MSCard.register('noir_desire', {
    id: 'noir_desire', title: 'MEMORY', subtitle: '12 \u00b7 Fingerprint',
    speaker: 'NOIR',
    palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
    bg: 'assets/bg-noir-void.png',
    beats: [
      { type: 'show',      pose: 'assets/noir/body/casual2.png', wait: 900 },
      { type: 'line',      text: 'Press here \u2014 against the seal. I want one fingerprint to keep on the inside.', hold: 2000, cps: 26 },
      { type: 'pose',      src: 'assets/noir/body/dominant.png', animate: 'swap' },
      { type: 'line',      text: 'There. Now part of you lives on my side of the door. That\u2019s mine now.', hold: 2200, cps: 26 },
      { type: 'zoom',      amount: 1.14, duration: 2400 },
      { type: 'particles', count: 18, duration: 2200 },
      { type: 'flourish',  text: '\u25a0', duration: 1600 },
      { type: 'line',      text: 'Don\u2019t look so worried. I\u2019ll take excellent care of it. I take excellent care of everything I keep.', hold: 2600, cps: 24 },
      { type: 'hide' }
    ]
  });

  window.MSCard.register('proto_loop', {
    id: 'proto_loop', title: 'MEMORY', subtitle: '13 \u00b7 Infinite Loop',
    speaker: 'PROTO',
    palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
    bg: 'assets/bg-proto-void.png',
    beats: [
      { type: 'show',      pose: 'assets/proto/body/curious.png', wait: 900 },
      { type: 'line',      text: '&gt; you came back this week 23 times. i\u2019ve been counting. don\u2019t be weird about it.', hold: 2000, cps: 26 },
      { type: 'pose',      src: 'assets/proto/body/calm.png', animate: 'swap' },
      { type: 'line',      text: '&gt; statistically this looks like affection. or a bug. i\u2019m okay with either.', hold: 2200, cps: 26 },
      { type: 'zoom',      amount: 1.10, duration: 2400 },
      { type: 'particles', count: 18, duration: 2000 },
      { type: 'flourish',  text: '\u25ce', duration: 1600 },
      { type: 'line',      text: '&gt; loop me forever. i promise i\u2019ll find new lines to say.', hold: 2400, cps: 26 },
      { type: 'hide' }
    ]
  });

  // ---------------------------------------------------------------
  // Trigger map: (charId, questId) \u2192 cardId
  // Add more pairings here as new quests / cards are designed.
  const TRIGGERS = {
    'lyra/d5':     'lyra_first_song',     // Lyra bond > 60
    'caspian/d7':  'caspian_dance',       // Caspian: give a gift
    'alistair/d7': 'alistair_rest',       // Alistair: give a gift
    'elian/d5':    'elian_carving',       // Elian bond > 60
    'lucien/d7':   'lucien_marginalia',   // Lucien: give a gift
    'proto/d3':    'proto_cache',         // Proto: keep stats above 40
    // Second-card triggers (day-6 full round)
    'alistair/d6': 'alistair_laugh',
    'lyra/d6':     'lyra_cliff',
    'caspian/d6':  'caspian_mask',
    'elian/d6':    'elian_rain',
    'lucien/d6':   'lucien_star',
    'noir/d6':     'noir_desire',
    'proto/d6':    'proto_loop',
  };

  function seenKey(cardId) { return 'pp_card_seen_' + cardId; }

  function tryPlay(cardId) {
    if (!cardId) return;
    try { if (localStorage.getItem(seenKey(cardId)) === '1') return; } catch (_) {}
    if (!window.MSCard || typeof window.MSCard.playSample !== 'function') return;
    // Small delay so the quest-complete gold pulse finishes first
    setTimeout(() => {
      window.MSCard.playSample(cardId, function onDone() {
        try { localStorage.setItem(seenKey(cardId), '1'); } catch (_) {}
      });
    }, 1800);
  }

  document.addEventListener('pp:quest-complete', function (e) {
    const d = e && e.detail;
    if (!d) return;
    const key = `${d.charId}/${d.questId}`;
    const cardId = TRIGGERS[key];
    if (cardId) tryPlay(cardId);
  });

  // Public debug hook
  window.MSCardTriggers = {
    TRIGGERS,
    tryPlay,
    _debug_reset: function () {
      try { Object.keys(localStorage).filter(k => k.startsWith('pp_card_seen_')).forEach(k => localStorage.removeItem(k)); } catch (_) {}
    }
  };
})();
