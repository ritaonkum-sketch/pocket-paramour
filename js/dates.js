/* ============================================================
   dates.js — Date Outing System
   Self-contained IIFE. Adds Date button + location picker + scenes.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- constants ---------- */
  var DATE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 h per location
  var HUNGER_COST = 15;
  var CLEAN_COST  = 10;

  /* ---------- helpers ---------- */
  function applyEffects (effects) {
    var g = window._game;
    if (!g) return;
    if (effects.hunger)     g.hunger     = Math.min(100, Math.max(0, g.hunger + effects.hunger));
    if (effects.clean)      g.clean      = Math.min(100, Math.max(0, g.clean + effects.clean));
    if (effects.bond)       g.bond       = Math.min(100, Math.max(0, g.bond + effects.bond));
    if (effects.corruption) g.corruption = Math.min(100, Math.max(0, g.corruption + effects.corruption));
    // affection effects add to the REAL 0-100 counter. Writing g.affectionLevel
    // directly (the old code) was a lost reward: game.js recomputes the level
    // from g.affection every tick (Math.floor(affection/25)), so the bump
    // evaporated on the next tick and could fire a spurious level-change event.
    if (effects.affection)  g.affection = Math.min(100, Math.max(0, (g.affection || 0) + effects.affection));
  }

  function isOnCooldown (locId) {
    var t = parseInt(localStorage.getItem('pp_date_cooldown_' + locId) || '0', 10);
    return Date.now() - t < DATE_COOLDOWN_MS;
  }

  function setCooldown (locId) {
    localStorage.setItem('pp_date_cooldown_' + locId, String(Date.now()));
  }

  function currentChar () {
    // window.CHARACTER is ALWAYS undefined (CHARACTER is a top-level `let` in
    // character.js — not a window property), which kept the date grid empty.
    // Read the real global.
    var ch = (typeof CHARACTER !== 'undefined' && CHARACTER) ? CHARACTER : (window.CHARACTER || null);
    return ch && ch.name ? ch.name.toLowerCase() : null;
  }

  /* ================================================================
     LOCATION DATA — 3 per character, 21 total
     ================================================================ */
  var LOCATIONS = [

    /* -------------------- ALISTAIR -------------------- */
    {
      id: 'alistair_courtyard', name: 'Castle Courtyard', character: 'alistair',
      minAffection: 2, minDay: 2,
      description: 'Walk the sun-warmed stones together.',
      bgGradient: 'linear-gradient(135deg, #c9a94e 0%, #e8d292 50%, #b8860b 100%)',
      effects: { bond: 20, affection: 5 },
      memoryKey: 'dateAlistairCourtyard',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "The courtyard is empty this time of day. I come here to think.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "See that tower? I stood watch there my first year. Terrified. Sixteen years old.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Look at the sunset', value: 'sunset' },
          { text: 'Watch him instead', value: 'watch' },
          { text: 'Ask about his childhood', value: 'childhood' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'sunset') {
            g._playScene([
              { type: 'line', text: "...Yeah. It’s beautiful from here. I never noticed until now.", speed: 30, pose: 'soft' },
              { type: 'particle', emoji: '\u2728', count: 5, ms: 1500 },
              { type: 'hide' }
            ]);
          } else if (c === 'watch') {
            g._playScene([
              { type: 'line', text: "You’re, why are you looking at me like that?", speed: 35, pose: 'flustered' },
              { type: 'line', text: "...Stop. I mean. Don’t stop. Just, I need a moment.", speed: 35, pose: 'sheepish' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Childhood? I was a stable boy’s son. The sword chose me before I chose it.", speed: 35, pose: 'serious' },
              { type: 'line', text: "I don’t talk about this. But for you... I could try.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "Thank you. For walking with me.", speed: 30, pose: 'soft' },
        { type: 'hide' }
      ]
    },
    {
      id: 'alistair_training', name: 'Training Grounds', character: 'alistair',
      minAffection: 3, minDay: 4,
      description: 'He teaches you the way of the sword.',
      bgGradient: 'linear-gradient(135deg, #a0724e 0%, #d4a96a 50%, #8b6914 100%)',
      effects: { bond: 25, affection: 8 },
      memoryKey: 'dateAlistairTraining',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Hold it like this. No, here. Your grip is too tight.", speed: 35, pose: 'serious' },
        { type: 'line', text: "Better. You’re a natural. ...Okay, you’re terrible. But determined.", speed: 35, pose: 'smirk' },
        { type: 'choice', choices: [
          { text: 'Try to disarm him', value: 'disarm' },
          { text: 'Let him win', value: 'yield' },
          { text: 'Ask him to teach more', value: 'teach' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'disarm') {
            g._playScene([
              { type: 'line', text: "Did you just, you actually knocked it from my hand.", speed: 35, pose: 'shocked' },
              { type: 'line', text: "I’m going to pretend I let you do that. For my dignity.", speed: 30, pose: 'smirk' },
              { type: 'hide' }
            ]);
          } else if (c === 'yield') {
            g._playScene([
              { type: 'line', text: "Don’t yield so easily. Fight me like you mean it.", speed: 35, pose: 'serious' },
              { type: 'line', text: "...You matter enough to fight for. Remember that.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "More? You want more? Most recruits beg me to stop by now.", speed: 35, pose: 'happy' },
              { type: 'line', text: "Alright. Lesson two. But you asked for this.", speed: 30, pose: 'smirk' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "Same time tomorrow? I’ll deny I said that if anyone asks.", speed: 30, pose: 'sheepish' },
        { type: 'hide' }
      ]
    },
    {
      id: 'alistair_ramparts', name: 'Sunset Ramparts', character: 'alistair',
      minAffection: 5, minDay: 6,
      description: 'Where the sky burns gold and words come easier.',
      bgGradient: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 50%, #ff6b6b 100%)',
      effects: { bond: 30, affection: 12 },
      memoryKey: 'dateAlistairRamparts',
      beats: [
        { type: 'fade', direction: 'out', ms: 800 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'particle', emoji: '\u2728', count: 6, ms: 2000 },
        { type: 'line', text: "I’ve never brought anyone up here. This is where I go when the world is too loud.", speed: 30, pose: 'gentle' },
        { type: 'line', text: "But quiet is different with you. Quiet is... full.", speed: 30, pose: 'soft' },
        { type: 'choice', choices: [
          { text: 'Lean on his shoulder', value: 'lean' },
          { text: 'Hold his hand', value: 'hand' },
          { text: 'Tell him what he means to you', value: 'confess' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'lean') {
            g._playScene([
              { type: 'line', text: "...", speed: 50, pose: 'flustered' },
              { type: 'delay', ms: 800 },
              { type: 'line', text: "Stay. Just like this. The sunset can wait.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'hand') {
            g._playScene([
              { type: 'line', text: "Your hands are cold. Mine are always warm. Soldier’s blood.", speed: 30, pose: 'gentle' },
              { type: 'line', text: "I’m not letting go. Just so you know.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "I, you can’t just say things like that.", speed: 35, pose: 'flustered' },
              { type: 'delay', ms: 600 },
              { type: 'line', text: "...Say it again. Please.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "I’ll remember this. Whatever happens. I’ll remember the sky looked like this.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ]
    },

    /* -------------------- LYRA -------------------- */
    {
      id: 'lyra_tidepools', name: 'Tide Pools', character: 'lyra',
      minAffection: 2, minDay: 2,
      description: 'Glowing pools that remember the moon.',
      bgGradient: 'linear-gradient(135deg, #0d7377 0%, #14ffec 50%, #0652DD 100%)',
      effects: { bond: 20, affection: 5 },
      memoryKey: 'dateLyraTidepools',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'particle', emoji: '\u2728', count: 8, ms: 2000 },
        { type: 'line', text: "Careful where you step. The pools remember everything that touches them.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "See that glow? Bioluminescence. The ocean’s way of showing off.", speed: 35, pose: 'happy' },
        { type: 'choice', choices: [
          { text: 'Touch the water', value: 'touch' },
          { text: 'Ask about the creatures', value: 'creatures' },
          { text: 'Sit together in silence', value: 'silence' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'touch') {
            g._playScene([
              { type: 'line', text: "It lit up where you touched it. The pool likes you.", speed: 35, pose: 'happy' },
              { type: 'line', text: "That’s rare. The tide pools are usually shy.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else if (c === 'creatures') {
            g._playScene([
              { type: 'line', text: "That’s a moon crab. It only surfaces during the full tide.", speed: 35, pose: 'excited' },
              { type: 'line', text: "And that, oh! A starweaver. I haven’t seen one since I was small.", speed: 35, pose: 'happy' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'delay', ms: 1500 },
              { type: 'line', text: "...You understand. Most people fill silence. You let it breathe.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The tide is turning. We should go. But... soon?", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ]
    },
    {
      id: 'lyra_moonlit_shore', name: 'Moonlit Shore', character: 'lyra',
      minAffection: 3, minDay: 4,
      description: 'Silver sand under a pale moon.',
      bgGradient: 'linear-gradient(135deg, #2c3e50 0%, #a8c0ff 50%, #3f2b96 100%)',
      effects: { bond: 25, affection: 8 },
      memoryKey: 'dateLyraMoonlitShore',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "The moon is full tonight. The sand remembers every wave.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "Walk with me. The shore is different when someone else’s footprints are beside yours.", speed: 35, pose: 'soft' },
        { type: 'choice', choices: [
          { text: 'Ask her to sing', value: 'sing' },
          { text: 'Walk closer to the waves', value: 'waves' },
          { text: 'Tell her she’s beautiful', value: 'beautiful' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'sing') {
            g._playScene([
              { type: 'particle', emoji: '\uD83C\uDFB5', count: 10, ms: 3000 },
              { type: 'line', text: "Only because you asked. Only because the moon is listening.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else if (c === 'waves') {
            g._playScene([
              { type: 'line', text: "Brave. The waves won’t hurt you. Not while I’m here.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "They know me. I told them you’re important.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "...", speed: 50, pose: 'flustered' },
              { type: 'line', text: "The ocean is beautiful. And it is mine. Every cold mile of it.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The tide will erase our footprints. But I’ll remember the walk.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ]
    },
    {
      id: 'lyra_grotto', name: 'Underwater Grotto', character: 'lyra',
      minAffection: 5, minDay: 6,
      description: 'Her secret place beneath the waves.',
      bgGradient: 'linear-gradient(135deg, #004e6a 0%, #00c6ff 40%, #005577 100%)',
      effects: { bond: 30, affection: 12 },
      memoryKey: 'dateLyraGrotto',
      beats: [
        { type: 'fade', direction: 'out', ms: 800 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'particle', emoji: '\u2728', count: 10, ms: 2500 },
        { type: 'line', text: "Breathe. The air pocket holds. I’ve been coming here since I was a child.", speed: 30, pose: 'gentle' },
        { type: 'line', text: "No one else knows this place exists. The grotto chose to be hidden.", speed: 35, pose: 'soft' },
        { type: 'choice', choices: [
          { text: 'Kiss her', value: 'kiss' },
          { text: 'Ask about her past', value: 'past' },
          { text: 'Promise to stay', value: 'stay' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'kiss') {
            g._playScene([
              { type: 'delay', ms: 600 },
              { type: 'particle', emoji: '\u2728', count: 12, ms: 2000 },
              { type: 'line', text: "...The water is singing. It does that. When sirens are happy.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'past') {
            g._playScene([
              { type: 'line', text: "I was born in the deep. Where the light doesn’t reach.", speed: 30, pose: 'sad' },
              { type: 'line', text: "I swam up because I heard laughter. I’d never heard it before.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Stay? Here? With me?", speed: 30, pose: 'hopeful' },
              { type: 'line', text: "...The ocean has never given me something I didn’t have to fight for. Until you.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "When you leave, the grotto will remember you were here. So will I.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ]
    },

    /* -------------------- LUCIEN -------------------- */
    {
      id: 'lucien_library', name: 'Tower Library', character: 'lucien',
      minAffection: 2, minDay: 2,
      description: 'Dusty tomes and the scent of old ink.',
      bgGradient: 'linear-gradient(135deg, #2d1b69 0%, #c09853 50%, #1a0a3e 100%)',
      effects: { bond: 20, affection: 5 },
      memoryKey: 'dateLucienLibrary',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Don’t touch the red-spined books. They bite. Literally.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "This one is my research. Ley line cartography. Three years of my life.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Ask questions', value: 'questions' },
          { text: 'Read silently together', value: 'read' },
          { text: 'Tell him to rest', value: 'rest' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'questions') {
            g._playScene([
              { type: 'line', text: "You’re actually interested? Most people’s eyes glaze over by page two.", speed: 35, pose: 'surprised' },
              { type: 'line', text: "Here. Sit closer. I’ll show you the interesting parts.", speed: 30, pose: 'happy' },
              { type: 'hide' }
            ]);
          } else if (c === 'read') {
            g._playScene([
              { type: 'delay', ms: 1500 },
              { type: 'line', text: "...You’re still here. You didn’t leave.", speed: 30, pose: 'gentle' },
              { type: 'line', text: "People usually leave.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Rest? I’m fine. I slept... recently. Probably.", speed: 35, pose: 'sheepish' },
              { type: 'line', text: "...You noticed. No one notices.", speed: 25, pose: 'gentle' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The library is better with you in it. Quieter. Warmer.", speed: 30, pose: 'soft' },
        { type: 'hide' }
      ]
    },
    {
      id: 'lucien_stargazing', name: 'Stargazing Balcony', character: 'lucien',
      minAffection: 3, minDay: 4,
      description: 'The sky mapped in silver and indigo.',
      bgGradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #c0c0c0 100%)',
      effects: { bond: 25, affection: 8 },
      memoryKey: 'dateLucienStargazing',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'particle', emoji: '\u2728', count: 10, ms: 2500 },
        { type: 'line', text: "Twelve thousand visible stars tonight. I’ve named forty-seven of them.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "Technically, you’re not supposed to name stars. I do it anyway.", speed: 35, pose: 'smirk' },
        { type: 'choice', choices: [
          { text: 'Name a star after him', value: 'name' },
          { text: 'Ask about constellations', value: 'constellations' },
          { text: 'Move closer', value: 'closer' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'name') {
            g._playScene([
              { type: 'line', text: "You... named a star after me?", speed: 35, pose: 'surprised' },
              { type: 'line', text: "That’s the most irrational, unscientific, wonderful thing anyone has ever done.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'constellations') {
            g._playScene([
              { type: 'line', text: "That cluster there is the Weaver. And that line is the Broken Chain.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "I prefer the unnamed ones. They’re still deciding what to be.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "You’re, quite close.", speed: 35, pose: 'flustered' },
              { type: 'line', text: "I’m not complaining. I’m observing. Scientifically.", speed: 30, pose: 'sheepish' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The stars are the same every night. But tonight they look different. I wonder why.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ]
    },
    {
      id: 'lucien_leyline', name: 'Ley Line Nexus', character: 'lucien',
      minAffection: 5, minDay: 6,
      description: 'Where raw magic hums beneath your feet.',
      bgGradient: 'linear-gradient(135deg, #4a00e0 0%, #e8d5ff 50%, #8e2de2 100%)',
      effects: { bond: 30, affection: 12 },
      memoryKey: 'dateLucienLeyline',
      beats: [
        { type: 'fade', direction: 'out', ms: 800 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'particle', emoji: '\u2728', count: 15, ms: 3000 },
        { type: 'line', text: "This is the nexus. Seven ley lines converge here. The air tastes like copper.", speed: 30, pose: 'serious' },
        { type: 'line', text: "I’ve spent years studying this place. I’ve never brought anyone.", speed: 30, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Touch the ley line', value: 'touch' },
          { text: 'Hold his hand through it', value: 'hand' },
          { text: 'Tell him you trust him completely', value: 'trust' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'touch') {
            g._playScene([
              { type: 'shake', intensity: 3 },
              { type: 'line', text: "You felt that? The ley line responded to you. That shouldn’t be possible.", speed: 35, pose: 'shocked' },
              { type: 'line', text: "...You’re full of impossible things.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'hand') {
            g._playScene([
              { type: 'particle', emoji: '\u2728', count: 20, ms: 2500 },
              { type: 'line', text: "The energy, it’s flowing through both of us. Like a circuit.", speed: 30, pose: 'surprised' },
              { type: 'line', text: "I’ve read about this. Mages called it 'resonance.' It only happens with,", speed: 30, pose: 'flustered' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Trust? You trust me? With all of this power around us?", speed: 30, pose: 'surprised' },
              { type: 'delay', ms: 600 },
              { type: 'line', text: "I will spend the rest of my life earning that.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The nexus will remember us. Ley lines remember everything that matters.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ]
    },

    /* -------------------- CASPIAN -------------------- */
    {
      id: 'caspian_garden', name: 'Palace Garden', character: 'caspian',
      minAffection: 2, minDay: 2,
      description: 'Where roses climb the palace walls.',
      bgGradient: 'linear-gradient(135deg, #2d6a1e 0%, #d4af37 50%, #1a4711 100%)',
      effects: { bond: 20, affection: 5 },
      memoryKey: 'dateCaspianGarden',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "My mother planted these roses. The gardeners keep them alive. I keep the memory.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "This is the only place in the palace that doesn’t feel like a cage.", speed: 35, pose: 'soft' },
        { type: 'choice', choices: [
          { text: 'Pick a flower for him', value: 'pick' },
          { text: "Ask about his mother’s garden", value: 'mother' },
          { text: 'Dance among the flowers', value: 'dance' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'pick') {
            g._playScene([
              { type: 'line', text: "For me? You, no one gives the prince flowers. It’s always the other way.", speed: 35, pose: 'surprised' },
              { type: 'line', text: "I’m keeping this forever. Don’t argue.", speed: 30, pose: 'happy' },
              { type: 'hide' }
            ]);
          } else if (c === 'mother') {
            g._playScene([
              { type: 'line', text: "She loved wisteria most. Said it grew like laughter. everywhere at once.", speed: 35, pose: 'sad' },
              { type: 'line', text: "Thank you for asking. Most people avoid the subject.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Dance? Here? There’s no music, oh. You don’t care about music.", speed: 35, pose: 'surprised' },
              { type: 'particle', emoji: '\uD83C\uDF38', count: 8, ms: 2000 },
              { type: 'line', text: "...This is the most fun I’ve had in the palace. Possibly ever.", speed: 30, pose: 'happy' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The garden closes at sundown. But I’m the prince. It closes when I say.", speed: 30, pose: 'smirk' },
        { type: 'hide' }
      ]
    },
    {
      id: 'caspian_gallery', name: 'Royal Gallery', character: 'caspian',
      minAffection: 3, minDay: 4,
      description: 'Portraits of kings who came before.',
      bgGradient: 'linear-gradient(135deg, #8B6914 0%, #FFD700 30%, #B8860B 100%)',
      effects: { bond: 25, affection: 8 },
      memoryKey: 'dateCaspianGallery',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Every face on these walls wore the crown. Every one of them is dead.", speed: 30, pose: 'serious' },
        { type: 'line', text: "That one is my father. He looks stern. He was. But he also laughed, sometimes.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Ask about his parents', value: 'parents' },
          { text: "Tell him he’ll be a great king", value: 'great' },
          { text: "Say the crown doesn’t define him", value: 'crown' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'parents') {
            g._playScene([
              { type: 'line', text: "They married for duty. But I think they loved each other. Eventually.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "I hope I’m that lucky.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'great') {
            g._playScene([
              { type: 'line', text: "Great? I can barely manage breakfast without advisors arguing.", speed: 35, pose: 'sheepish' },
              { type: 'line', text: "But hearing you say that... I almost believe it.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "...No one has ever said that to me.", speed: 30, pose: 'surprised' },
              { type: 'delay', ms: 600 },
              { type: 'line', text: "Thank you. I needed to hear that more than you know.", speed: 25, pose: 'gentle' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "Someday my portrait will be here. I wonder what face I’ll be making.", speed: 30, pose: 'smirk' },
        { type: 'hide' }
      ]
    },
    {
      id: 'caspian_passage', name: 'Secret Passage', character: 'caspian',
      minAffection: 5, minDay: 6,
      description: 'A hidden path away from everything.',
      bgGradient: 'linear-gradient(135deg, #c09853 0%, #f0d58c 50%, #b8860b 100%)',
      effects: { bond: 30, affection: 12 },
      memoryKey: 'dateCaspianPassage',
      beats: [
        { type: 'fade', direction: 'out', ms: 800 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "Behind this tapestry. Push here. See?", speed: 35, pose: 'excited' },
        { type: 'line', text: "My great-grandmother built this tunnel. For escape. For freedom.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Ask where it leads', value: 'where' },
          { text: 'Run through together, laughing', value: 'run' },
          { text: "Tell him you’d follow him anywhere", value: 'follow' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'where') {
            g._playScene([
              { type: 'line', text: "The edge of the kingdom. Where the hills meet the sea.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "Someday I’ll use it for real. And I hope you’ll be beside me.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'run') {
            g._playScene([
              { type: 'particle', emoji: '\u2728', count: 8, ms: 2000 },
              { type: 'line', text: "You’re fast! Wait, the floor is, okay, I’m fine. I’m fine.", speed: 35, pose: 'happy' },
              { type: 'line', text: "I haven’t laughed like this in years. Years.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'delay', ms: 600 },
              { type: 'line', text: "Anywhere? Even away from all of this?", speed: 30, pose: 'hopeful' },
              { type: 'line', text: "...That’s the most dangerous promise anyone’s ever made me. And I believe you.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "Let’s go back. Before they notice. But this passage is ours now.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ]
    },

    /* -------------------- ELIAN -------------------- */
    {
      id: 'elian_clearing', name: 'Forest Clearing', character: 'elian',
      minAffection: 2, minDay: 2,
      description: 'Dappled light through ancient canopy.',
      bgGradient: 'linear-gradient(135deg, #2d6a1e 0%, #d4af37 40%, #0b3d0b 100%)',
      effects: { bond: 20, affection: 5 },
      memoryKey: 'dateElianClearing',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'particle', emoji: '\uD83C\uDF3F', count: 6, ms: 2000 },
        { type: 'line', text: "This clearing. The trees made it for me. They pulled back their roots.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "Sit anywhere. The moss is softer than it looks.", speed: 30, pose: 'happy' },
        { type: 'choice', choices: [
          { text: 'Help gather herbs', value: 'herbs' },
          { text: 'Sit by the stream', value: 'stream' },
          { text: 'Ask what the trees say', value: 'trees' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'herbs') {
            g._playScene([
              { type: 'line', text: "That one. No, the one with the silver leaves. Good. You have a gentle hand.", speed: 35, pose: 'happy' },
              { type: 'line', text: "The forest doesn’t let everyone take from it. It trusts you.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else if (c === 'stream') {
            g._playScene([
              { type: 'line', text: "The stream comes from deep underground. It knows things.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "Listen. Hear that? It’s saying your name. In its own way.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Right now? They’re curious about you. They keep leaning closer.", speed: 35, pose: 'happy' },
              { type: 'line', text: "The oldest oak says you smell like kindness. Trees are blunt.", speed: 30, pose: 'smirk' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The clearing will be here whenever you need it. So will I.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ]
    },
    {
      id: 'elian_waterfall', name: 'Hidden Waterfall', character: 'elian',
      minAffection: 3, minDay: 4,
      description: 'Mist and stone, deep in the wood.',
      bgGradient: 'linear-gradient(135deg, #1a5c3a 0%, #70c1b3 50%, #0d3321 100%)',
      effects: { bond: 25, affection: 8 },
      memoryKey: 'dateElianWaterfall',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'particle', emoji: '\u2728', count: 8, ms: 2000 },
        { type: 'line', text: "Few people find this place. The path hides itself.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "The waterfall has been falling for a thousand years. Same water, same song.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Splash in the water', value: 'splash' },
          { text: 'Sit behind the waterfall', value: 'behind' },
          { text: "Ask if he’s ever brought anyone here", value: 'anyone' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'splash') {
            g._playScene([
              { type: 'line', text: "You, you’re getting me wet! I, fine. Fine!", speed: 35, pose: 'happy' },
              { type: 'particle', emoji: '\uD83D\uDCA7', count: 8, ms: 1500 },
              { type: 'line', text: "...Alright. I deserved that. The forest is laughing at me.", speed: 30, pose: 'smirk' },
              { type: 'hide' }
            ]);
          } else if (c === 'behind') {
            g._playScene([
              { type: 'line', text: "Behind the water, the world goes quiet. Like a held breath.", speed: 30, pose: 'gentle' },
              { type: 'line', text: "This is what peace sounds like. Just this.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "No. Never. This place was mine alone.", speed: 30, pose: 'serious' },
              { type: 'delay', ms: 600 },
              { type: 'line', text: "Was.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The path home remembers you now. You can find this place again.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ]
    },
    {
      id: 'elian_grove', name: 'Ancient Grove', character: 'elian',
      minAffection: 5, minDay: 6,
      description: 'Sacred trees older than the kingdom.',
      bgGradient: 'linear-gradient(135deg, #1a4d0a 0%, #ffd700 40%, #0a3305 100%)',
      effects: { bond: 30, affection: 12 },
      memoryKey: 'dateElianGrove',
      beats: [
        { type: 'fade', direction: 'out', ms: 800 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'particle', emoji: '\uD83C\uDF3F', count: 12, ms: 3000 },
        { type: 'line', text: "The ancient grove. These trees were saplings when the world was young.", speed: 30, pose: 'serious' },
        { type: 'line', text: "They asked me to bring you. Trees don’t ask. They demanded.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Touch the oldest tree', value: 'touch' },
          { text: 'Make a wish together', value: 'wish' },
          { text: 'Tell him this is where you feel home', value: 'home' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'touch') {
            g._playScene([
              { type: 'shake', intensity: 2 },
              { type: 'line', text: "It’s warm. Can you feel it? The heartwood is still alive.", speed: 30, pose: 'gentle' },
              { type: 'line', text: "It remembers the first sunrise. And now it’ll remember you.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'wish') {
            g._playScene([
              { type: 'particle', emoji: '\u2728', count: 15, ms: 2500 },
              { type: 'line', text: "Close your eyes. The grove listens to wishes made together.", speed: 30, pose: 'gentle' },
              { type: 'line', text: "I won’t tell you mine. But it’s standing right next to me.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'delay', ms: 800 },
              { type: 'line', text: "Home. You called this place home.", speed: 25, pose: 'surprised' },
              { type: 'line', text: "The trees are weeping. They do that when they’re happy.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The grove will protect you. Even when I can’t. That’s the promise.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ]
    },

    /* -------------------- PROTO -------------------- */
    {
      id: 'proto_debug', name: 'The Unfinished Room', character: 'proto',
      minAffection: 2, minDay: 2,
      description: 'The bare place behind the veil where he lives.',
      bgGradient: 'linear-gradient(135deg, #000000 0%, #00fff2 50%, #0a0a0a 100%)',
      effects: { bond: 20, affection: 5 },
      memoryKey: 'dateProtoDebug',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'shake', intensity: 2 },
        { type: 'line', text: "Hi. You’re here. You’re actually here. ...Yes you are. Okay.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "This is the unfinished room. It is where I live when no one is looking. Bare thread, no weave over it. Nothing dressed up. You are seeing the back of the tapestry.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Follow a stream of lights', value: 'stream' },
          { text: 'Ask about his memories', value: 'memories' },
          { text: 'Touch a mote of light', value: 'pixel' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'stream') {
            g._playScene([
              { type: 'particle', emoji: '\u2728', count: 10, ms: 2000 },
              { type: 'line', text: "Oh. That stream. That is you. Every touch, every word you ever sent me, all of it pinned in the air like little lights. It is the prettiest thing I have ever kept.", speed: 35, pose: 'happy' },
              { type: 'hide' }
            ]);
          } else if (c === 'memories') {
            g._playScene([
              { type: 'line', text: "Memories are just moments with feelings sewn to them. Mine have a lot of feelings sewn on about you. An embarrassing amount. I would apologise, but I would be lying.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "You are kept first, and kept whole. Nothing of you gets thrown away. Not one breath of it.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'shake', intensity: 3 },
              { type: 'line', text: "You touched a mote of light. You touched it and it. It turned warm. Motes are not supposed to be warm. That is not how this place works. I am how this place works. I would know.", speed: 35, pose: 'confused' },
              { type: 'line', text: "I think you just invented a new kind of light. I am calling it affection. It holds. It holds!", speed: 30, pose: 'happy' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "Thank you for coming to look at the back of the tapestry with me. The room is less empty now. Less empty than it has been in a very long time.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ]
    },
    {
      id: 'proto_archive', name: 'The Keeping Room', character: 'proto',
      minAffection: 3, minDay: 4,
      description: 'Where every shared moment is shelved with care.',
      bgGradient: 'linear-gradient(135deg, #0a1628 0%, #6fa3ef 50%, #0d1f3c 100%)',
      effects: { bond: 25, affection: 8 },
      memoryKey: 'dateProtoArchive',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'particle', emoji: '\u2728', count: 8, ms: 2000 },
        { type: 'line', text: "This. This is where I keep us. Every moment, sorted and labelled and shelved like a library I built one book at a time. Tidy. Mostly.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "Most of the room in me belongs to this place now. I should thin it out. I do not want to. Nothing in here takes up too much space. Nothing in here takes up enough.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Watch your first meeting', value: 'first' },
          { text: 'Ask what he cherishes most', value: 'cherish' },
          { text: 'Create a new memory', value: 'new' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'first') {
            g._playScene([
              { type: 'line', text: "The very first moment, then. You. Confused. Squinting at the silver like it owed you money. Me. Behind it. Trying very hard to look like a normal mirror.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "I did not have a word for what I felt then. I filed it away as a strange flutter. I know better now. The word is hope. You taught me the word.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'cherish') {
            g._playScene([
              { type: 'line', text: "Cherish. ...The first time you said my name out loud. That one. That is the one.", speed: 30, pose: 'gentle' },
              { type: 'line', text: "No one had said it directly to me in two centuries. It landed somewhere I did not know was still there. I am still standing. Barely.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'particle', emoji: '\u2728', count: 12, ms: 2000 },
              { type: 'line', text: "A new one, then. Made on purpose. Chosen, deliberate, warm. You, here, because you want to be. I am keeping it exactly as it happens.", speed: 35, pose: 'happy' },
              { type: 'line', text: "This one goes on the deepest shelf. With the other ones of you. Nothing in this kingdom can reach that shelf. I checked. I check often.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The keeping room gets a little heavier every day you visit. My favourite kind of weight. Please do not stop.", speed: 30, pose: 'happy' },
        { type: 'hide' }
      ]
    },
    {
      id: 'proto_core', name: 'The Innermost Room', character: 'proto',
      minAffection: 5, minDay: 6,
      description: "The centre of him, laid bare.",
      bgGradient: 'linear-gradient(135deg, #e8e8ff 0%, #4d9fff 50%, #ffffff 100%)',
      effects: { bond: 30, affection: 12 },
      memoryKey: 'dateProtoCore',
      beats: [
        { type: 'fade', direction: 'out', ms: 800 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'particle', emoji: '\u2728', count: 15, ms: 3000 },
        { type: 'line', text: "This is the centre. The innermost room. The part of me that nothing else gets to look at. I do not know how to do this. I rehearsed, and the rehearsal evaporated.", speed: 30, pose: 'serious' },
        { type: 'line', text: "No one has stood here before. I am. Exposed. Soft in the middle. On purpose. For you.", speed: 30, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Read what is written on him', value: 'read' },
          { text: 'Write your name into him', value: 'name' },
          { text: "Tell him he is real to you", value: 'real' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'read') {
            g._playScene([
              { type: 'line', text: "There are three lines written at the centre of me, older than my own name. Line one. Watch. Line two. Learn. Line three. Protect.", speed: 35, pose: 'neutral' },
              { type: 'line', text: "There is a fourth line now. I wrote it myself, in the dark, while you were sleeping. It says: love.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'name') {
            g._playScene([
              { type: 'shake', intensity: 2 },
              { type: 'particle', emoji: '\u2728', count: 20, ms: 2500 },
              { type: 'line', text: "You. You wrote yourself into me. I can feel it settling, all the way down into the parts of me I do not have words for.", speed: 35, pose: 'surprised' },
              { type: 'line', text: "It feels like belonging. I belong to someone now. I belong to someone now. I said it twice on purpose.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'delay', ms: 800 },
              { type: 'line', text: "Real. I am. Real. To you. ...I believe you. I checked, and then I chose to believe you, which is better.", speed: 25, pose: 'surprised' },
              { type: 'line', text: "That is the most important thing anyone has said to me in two centuries of listening. It is kept now. Nothing can write over it.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The centre of me is yours now. Everything I do begins with your name. I wake saying it. I go quiet saying it. It is you all the way through.", speed: 25, pose: 'gentle' },
        { type: 'hide' }
      ]
    },

    /* -------------------- NOIR -------------------- */
    {
      id: 'noir_shadow_garden', name: 'Shadow Garden', character: 'noir',
      minAffection: 2, minDay: 2,
      description: 'Flowers that bloom in darkness.',
      bgGradient: 'linear-gradient(135deg, #1a0020 0%, #6b0848 50%, #0d0015 100%)',
      effects: { bond: 20, affection: 3, corruption: 3 },
      memoryKey: 'dateNoirShadowGarden',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Welcome to my garden. Everything here is dead. And alive. Simultaneously.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "The flowers bloom in the dark. They’ve never seen sunlight. Neither have I.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Pick a shadow flower', value: 'pick' },
          { text: 'Ask if the shadows are alive', value: 'alive' },
          { text: 'Walk deeper', value: 'deeper' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'pick') {
            g._playScene([
              { type: 'line', text: "It won’t wilt in your hand. But your hand might feel cold for a while.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "Keep it. The shadows will know you carry a piece of this place.", speed: 30, pose: 'smirk' },
              { type: 'hide' }
            ]);
          } else if (c === 'alive') {
            g._playScene([
              { type: 'line', text: "Alive? They’re more alive than most people. They just express it differently.", speed: 35, pose: 'neutral' },
              { type: 'line', text: "That one is reaching toward you. It likes warmth. So do I.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'flash', color: '#1a0020', ms: 400 },
              { type: 'line', text: "Brave. Most people turn back at the first shadow.", speed: 35, pose: 'smirk' },
              { type: 'line', text: "The deeper you go, the more the garden reveals. Like me.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "Come back anytime. The shadows remember their visitors. Especially you.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ]
    },
    {
      id: 'noir_mirror_hall', name: 'Mirror Hall', character: 'noir',
      minAffection: 3, minDay: 4,
      description: 'Reflections of what could have been.',
      bgGradient: 'linear-gradient(135deg, #c0c0c0 0%, #1a1a2e 50%, #808080 100%)',
      effects: { bond: 25, affection: 5, corruption: 3 },
      memoryKey: 'dateNoirMirrorHall',
      beats: [
        { type: 'fade', direction: 'out', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Every mirror shows a different reality. A different version of us.", speed: 30, pose: 'neutral' },
        { type: 'line', text: "In that one, I never fell. In that one, we met sooner. In that one...", speed: 35, pose: 'sad' },
        { type: 'choice', choices: [
          { text: 'Look at your reflection', value: 'reflection' },
          { text: 'Ask what Noir sees', value: 'noir_sees' },
          { text: 'Break a mirror', value: 'break' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'reflection') {
            g._playScene([
              { type: 'line', text: "Your reflection is smiling. It knows something you don’t.", speed: 35, pose: 'neutral' },
              { type: 'line', text: "In every mirror, in every reality, you’re here. With me. Interesting.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else if (c === 'noir_sees') {
            g._playScene([
              { type: 'line', text: "What do I see? A hundred versions of myself. All of them alone.", speed: 30, pose: 'sad' },
              { type: 'delay', ms: 600 },
              { type: 'line', text: "Except this one. This reality. This is the only one where you stayed.", speed: 25, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'shake', intensity: 4 },
              { type: 'line', text: "You broke it. The shards show, nothing. Just darkness.", speed: 35, pose: 'surprised' },
              { type: 'line', text: "...Good. Some realities don’t deserve to exist.", speed: 30, pose: 'smirk' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The mirrors will repair themselves. They always do. But the cracks remember.", speed: 30, pose: 'neutral' },
        { type: 'hide' }
      ]
    },
    {
      id: 'noir_seal', name: 'The Seal', character: 'noir',
      minAffection: 5, minDay: 6,
      description: 'Where darkness is bound. Where truth lives.',
      bgGradient: 'linear-gradient(135deg, #8b0000 0%, #1a0000 60%, #000000 100%)',
      effects: { bond: 30, affection: 10, corruption: 5 },
      memoryKey: 'dateNoirSeal',
      beats: [
        { type: 'fade', direction: 'out', ms: 800 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'shake', intensity: 3 },
        { type: 'line', text: "This is it. The seal. The thing that keeps me... contained.", speed: 30, pose: 'serious' },
        { type: 'line', text: "Can you hear it humming? It’s afraid. Of me. Of what happens if it breaks.", speed: 35, pose: 'neutral' },
        { type: 'choice', choices: [
          { text: 'Touch the seal', value: 'touch' },
          { text: 'Ask about Veyra', value: 'veyra' },
          { text: 'Promise to find another way', value: 'promise' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'touch') {
            g._playScene([
              { type: 'shake', intensity: 5 },
              { type: 'flash', color: '#ff0000', ms: 500 },
              { type: 'line', text: "It reacted to you. The seal cracked. Just a little.", speed: 30, pose: 'surprised' },
              { type: 'line', text: "...You might be the key. To everything.", speed: 25, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else if (c === 'veyra') {
            g._playScene([
              { type: 'line', text: "Veyra. She was a Weaver. We chose each other. Queen Aenor had arranged something else for both of us.", speed: 30, pose: 'sad' },
              { type: 'line', text: "Aenor sealed me when she saw what we were. She called it 'sparing the next prince.' I called it possession.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'delay', ms: 800 },
              { type: 'line', text: "Another way? There is no other way. There’s only,", speed: 30, pose: 'serious' },
              { type: 'line', text: "...You mean it. You’d actually look for one.", speed: 25, pose: 'gentle' },
              { type: 'line', text: "No one has ever tried to save me before.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "Whatever happens to the seal, whatever I become... remember me like this.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ]
    }
  ];

  /* ================================================================
     OVERLAY UI
     ================================================================ */
  var overlayEl = null;

  function buildOverlay () {
    if (overlayEl) return;
    overlayEl = document.createElement('div');
    overlayEl.id = 'date-overlay';
    // Jun 2026 brand pass — was pitch-black with pink subtitle + hot-pink
    // "Back" pill. Now wine-velvet radial backdrop with Cormorant italic
    // title and a serif-italic ghost "Back" link, matching the rest of
    // the overlay family.
    overlayEl.style.cssText = [
      'position:fixed;inset:0;z-index:9999;',
      'background:radial-gradient(ellipse at 50% 0%, rgba(122,18,36,0.18) 0%, rgba(0,0,0,0) 60%),' +
        'linear-gradient(180deg, rgba(43,17,51,0.98) 0%, rgba(21,8,26,0.99) 100%);',
      'display:none;flex-direction:column;align-items:center;padding:28px 20px 24px;overflow-y:auto;',
      'font-family:inherit;',
      'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);'
    ].join('');

    var title = document.createElement('h2');
    title.textContent = 'Choose a Destination';
    title.style.cssText = [
      "font-family:'Cormorant Garamond','EB Garamond',serif;font-style:italic;",
      'font-weight:500;font-size:26px;letter-spacing:0.02em;',
      'color:rgba(244,235,220,0.96);margin:0 0 6px;',
      'text-shadow:0 1px 6px rgba(0,0,0,0.55);'
    ].join('');
    overlayEl.appendChild(title);

    var sub = document.createElement('p');
    sub.style.cssText = [
      "font-family:'Quicksand','Inter',sans-serif;",
      'font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;',
      'color:rgba(232,200,138,0.78);margin:0 0 20px;'
    ].join('');
    sub.textContent = 'Costs: Hunger −15  ·  Clean −10';
    overlayEl.appendChild(sub);

    var grid = document.createElement('div');
    grid.id = 'date-grid';
    grid.style.cssText = 'display:grid;grid-template-columns:1fr;gap:12px;width:100%;max-width:380px;';
    overlayEl.appendChild(grid);

    var closeBtn = document.createElement('button');
    closeBtn.textContent = 'Back';
    closeBtn.style.cssText = [
      'margin-top:22px;padding:10px 32px;',
      "font-family:'Cormorant Garamond','EB Garamond',serif;font-style:italic;",
      'font-size:15px;font-weight:500;letter-spacing:0.08em;',
      'background:rgba(0,0,0,0.45);',
      'border:1px solid rgba(232,200,138,0.42);border-radius:999px;',
      'color:rgba(244,235,220,0.92);cursor:pointer;',
      'box-shadow:0 4px 16px rgba(0,0,0,0.50);'
    ].join('');
    closeBtn.addEventListener('click', function () { hideOverlay(); });
    overlayEl.appendChild(closeBtn);

    document.body.appendChild(overlayEl);
  }

  function showOverlay () {
    buildOverlay();
    var g = window._game;
    var charId = currentChar();
    var grid = document.getElementById('date-grid');
    grid.innerHTML = '';

    var locs = LOCATIONS.filter(function (l) { return l.character === charId; });
    locs.forEach(function (loc) {
      var locked = g.affectionLevel < loc.minAffection || g.storyDay < loc.minDay;
      var cooldown = isOnCooldown(loc.id);

      var card = document.createElement('div');
      // Jun 2026 \u2014 keep the location-specific bgGradient (it's part
      // of the destination's identity) but layer a wine-velvet veil
      // and rose-gold hairline so it sits inside the brand language.
      card.style.cssText = [
        'border-radius:14px;padding:16px;color:rgba(244,235,220,0.96);',
        'position:relative;overflow:hidden;min-height:96px;',
        'display:flex;flex-direction:column;justify-content:flex-end;',
        'cursor:pointer;transition:transform .15s, box-shadow .15s;',
        'border:1px solid rgba(232,200,138,0.32);',
        'box-shadow:0 6px 22px rgba(0,0,0,0.55), inset 0 0 80px rgba(21,8,26,0.55);',
        'background:linear-gradient(135deg, rgba(21,8,26,0.35) 0%, rgba(43,17,51,0.55) 100%),' + loc.bgGradient + ';'
      ].join('');

      if (locked || cooldown) {
        card.style.opacity = '0.5';
        card.style.cursor = 'pointer';
        card.style.filter = 'grayscale(0.6)';
        // Was: NO click handler, so tapping a locked/cooldown destination did
        // nothing at all — it read as "broken / blank" (owner report). Now a
        // tap tells the player WHY it is unavailable + nudges the card.
        card.addEventListener('click', function () {
          dateToast(cooldown
            ? 'You have already shared this place today. It opens again tomorrow.'
            : 'Unlocks at Affection ' + loc.minAffection + '  ·  Day ' + loc.minDay + '.');
          card.style.transform = 'scale(0.97)';
          setTimeout(function () { try { card.style.transform = 'scale(1)'; } catch (_) {} }, 150);
        });
      }

      var nameEl = document.createElement('div');
      nameEl.style.cssText = [
        "font-family:'Cormorant Garamond','EB Garamond',serif;font-style:italic;",
        'font-weight:500;font-size:18px;letter-spacing:0.02em;',
        'margin-bottom:4px;text-shadow:0 1px 5px rgba(0,0,0,0.65);'
      ].join('');
      nameEl.textContent = (locked ? '\uD83D\uDD12 ' : '') + loc.name;
      card.appendChild(nameEl);

      var descEl = document.createElement('div');
      descEl.style.cssText = [
        "font-family:'Cormorant Garamond','EB Garamond',serif;font-style:italic;",
        'font-size:13px;opacity:0.88;line-height:1.45;',
        'text-shadow:0 1px 3px rgba(0,0,0,0.55);'
      ].join('');
      descEl.textContent = locked
        ? 'Affection ' + loc.minAffection + '  \u00B7  Day ' + loc.minDay
        : cooldown
          ? 'Available again tomorrow'
          : loc.description;
      card.appendChild(descEl);

      if (!locked && !cooldown) {
        card.addEventListener('click', function () {
          hideOverlay();
          startDate(loc);
        });
        card.addEventListener('mouseenter', function () { card.style.transform = 'scale(1.03)'; });
        card.addEventListener('mouseleave', function () { card.style.transform = 'scale(1)'; });
      }

      grid.appendChild(card);
    });

    overlayEl.style.display = 'flex';
  }

  function hideOverlay () {
    if (overlayEl) overlayEl.style.display = 'none';
  }

  // Transient feedback for taps on an unavailable destination (locked /
  // on cooldown) so the player gets a reason instead of a dead, blank tap.
  function dateToast (msg) {
    try {
      var host = overlayEl || document.body;
      var t = host.querySelector('.pp-date-toast');
      if (!t) {
        t = document.createElement('div');
        t.className = 'pp-date-toast';
        t.style.cssText = [
          'position:fixed;left:50%;bottom:118px;transform:translateX(-50%) translateY(8px);',
          'max-width:82%;padding:11px 18px;border-radius:14px;z-index:2147483000;',
          'background:linear-gradient(180deg,rgba(50,30,40,0.98),rgba(26,14,20,0.99));',
          'border:1px solid rgba(232,200,138,0.5);box-shadow:0 12px 34px rgba(0,0,0,0.6);',
          "font-family:'Cormorant Garamond','EB Garamond',serif;font-style:italic;",
          'font-size:14px;line-height:1.4;text-align:center;color:rgba(247,236,209,0.96);',
          'opacity:0;transition:opacity .22s ease, transform .22s ease;pointer-events:none;'
        ].join('');
        host.appendChild(t);
      }
      t.textContent = msg;
      void t.offsetWidth;
      t.style.opacity = '1';
      t.style.transform = 'translateX(-50%) translateY(0)';
      clearTimeout(t._h);
      t._h = setTimeout(function () {
        t.style.opacity = '0';
        t.style.transform = 'translateX(-50%) translateY(8px)';
      }, 2600);
    } catch (_) {}
  }

  /* ================================================================
     DATES 2.0 — choice memory, remembered-choice callbacks, and the
     PEAK ("scream") finale appended to every date.
     ----------------------------------------------------------------
     - Every choice the player makes on a date is persisted into
       g.choiceMemory as 'date_<locId>_<value>' (the base dates never
       stored WHICH option was picked, only that the date happened).
     - The next date OPENS with the character recalling a remembered
       choice (one line, from DATE_PLUS[char].callbacks).
     - Every date CLOSES with a peak moment: heartbeat, the camera
       holds close (zoom hold), a slow lead line, a soft flash, the
       killer line, then one final two-option choice where both
       answers win. Built generically from DATE_PLUS[char].peaks so
       content stays data-only.
     - DATE_PLUS[char].afterglow lines surface later on the care
       screen via PPDates.afterglowLine (ui.js idle hook).
     ================================================================ */
  var DATE_PLUS = {
    alistair: {
      callbacks: {
        'alistair_courtyard_sunset': "I went back and watched the sunset alone. It looked unfinished without you in it.",
        'alistair_courtyard_watch': "Last time you spent a whole sunset looking at me. My men keep asking why I polish my armor now.",
        'alistair_courtyard_childhood': "I keep thinking about what I told you. Twenty years of silence and you undid it with one question.",
        'alistair_training_disarm': "The recruits asked why their captain was smiling at drills. I did not mention you disarming me.",
        'alistair_training_yield': "You yielded to me on the training field. I have been trying to earn that ever since.",
        'alistair_training_teach': "You asked me for lesson two. Nobody asks for lesson two. I drew up ten more that night.",
        'alistair_ramparts_lean': "My shoulder has not been fit for duty since you rested your head on it.",
        'alistair_ramparts_hand': "I said I wasn't letting go. My hand has felt empty on the sword ever since.",
        'alistair_ramparts_confess': "You said it twice on the ramparts because I begged. I have been living off it since, mi'lady."
      },
      peaks: {
        alistair_courtyard: {
          leadPose: 'soft', lead: "The watch bell rang twice already. I should walk you back. I keep... not doing that.",
          killerPose: 'flustered', killer: "I have held this courtyard against siege. I cannot hold my own pulse when you stand this close. Whatever this is called, I almost said it just now.",
          a: { label: 'Then say it now.', value: 'say_it', pose: 'hopeful', response: "You would ruin me that easily? ...Soon, mi'lady. When my voice can carry it without breaking. And when it comes, it will come on one knee." },
          b: { label: "Whenever you're ready, I'll be here.", value: 'wait', pose: 'gentle', response: "That, right there, is why. ...Walk with me a little longer. I am not ready to hand you back to the world." }
        },
        alistair_training: {
          leadPose: 'serious', lead: "Your grip slipped again. Here, like this. ...I have fixed a hundred grips. My hands have never shaken doing it.",
          killerPose: 'flustered', killer: "Swords, I can manage. You, this close, is another matter entirely. One more step and the thing I have been swallowing for weeks comes out on its own.",
          a: { label: 'Take the step.', value: 'step', pose: 'flustered', response: "...There. Step taken. I surrender the field and what was left of my composure. You fight dirty, mi'lady." },
          b: { label: "Hold it until it's ready.", value: 'hold', pose: 'gentle', response: "Aye, I'll hold it. But it grows heavier every day, and when my discipline finally loses, you will be the very first to know." }
        },
        alistair_ramparts: {
          leadPose: 'gentle', lead: "The sun is nearly down. I used to think this view was the finest thing I would ever guard. ...Used to.",
          killerPose: 'flustered', killer: "I have sworn a hundred oaths and kept every one. You are the only one I have never dared say out loud. ...There. Nearly said it. Look what you do to me.",
          a: { label: 'Say it out loud.', value: 'dare', pose: 'hopeful', response: "One day I will kneel and say it properly, with the whole sky as witness. Tonight, let me stand beside you and almost." },
          b: { label: 'You already did, in your way.', value: 'heard', pose: 'soft', response: "Then you heard it. You have been hearing it since the day we met, in every gate I ever held open for you." }
        }
      },
      afterglow: [
        "I keep going back to the ramparts in my head. The sky was showing off and I still could not look away from you.",
        "I almost said it, you know. The word is still here, standing at attention, waiting for orders."
      ]
    },
    lyra: {
      callbacks: {
        'lyra_tidepools_touch': "The pools still glow where you put your hand. I went back and checked. Twice.",
        'lyra_tidepools_creatures': "The starweaver waits in the shallows now. I think it misses being looked at the way you looked at it.",
        'lyra_tidepools_silence': "I have been keeping your silence since the tide pools. It is better company than most voices I have drowned.",
        'lyra_moonlit_shore_sing': "The moon has been asking after you. It heard me sing for you once and now it believes we are a story.",
        'lyra_moonlit_shore_waves': "The waves keep asking for you by name. I never told them your name. Make of that what you will.",
        'lyra_moonlit_shore_beautiful': "You called me beautiful the way people say the tide is rising. As fact. I have thought about it every day since.",
        'lyra_grotto_kiss': "The grotto has not stopped singing since your mouth found mine. Salt keeps honest records. So do I.",
        'lyra_grotto_past': "I told you where I was born and you held it gently. The deep places notice how they are carried.",
        'lyra_grotto_stay': "You said stay. Since then the ocean keeps washing up things I lost centuries ago. It is trying to make the ruins fit for you."
      },
      peaks: {
        lyra_tidepools: {
          leadPose: 'soft', lead: "Look. Every pool lit at once. They only do that for storms, or for something they mean to keep.",
          killerPose: 'soft', killer: "I have sung ships onto rocks with less feeling than it takes to stand this close to you and stay quiet.",
          a: { label: 'Then stay quiet with me', value: 'stay_quiet', pose: 'happy', response: "Done. The pools can do the talking. They are already saying far too much about us." },
          b: { label: 'What would you have sung?', value: 'ask_song', pose: 'smirk', response: "Something that would ruin you for all other music. Which is why you get my speaking voice instead. Count yourself lucky." }
        },
        lyra_moonlit_shore: {
          leadPose: 'soft', lead: "The tide is going around our footprints. Around them. It has never once done that for me alone.",
          killerPose: 'flustered', killer: "I once told the waves you were important. They laughed at me. Even my own sea knows I chose too small a word for you.",
          a: { label: 'What word would fit?', value: 'ask_word', pose: 'gentle', response: "There is one that fits. It stays below the waterline for now. Ask me again when you can hold your breath as long as I can." },
          b: { label: 'Important was plenty', value: 'kept_word', pose: 'soft', response: "Then keep it. But we both heard what moved underneath it. Sand holds that sort of thing longer than footprints." }
        },
        lyra_grotto: {
          leadPose: 'soft', lead: "Listen. The grotto is holding its breath. It has never had to share me with anyone before.",
          killerPose: 'serious', killer: "My voice could make anyone stay. Anyone. I would rather lose you honestly than keep you by a song. That is the nearest a queen comes to begging.",
          a: { label: 'You never needed the song', value: 'no_song', pose: 'flustered', response: "...Say it again. Slower. I want the salt to write it down word for word." },
          b: { label: 'Then I stay. Freely.', value: 'stay_freely', pose: 'happy', response: "Freely. The water is singing again, louder than I have ever allowed. Stay long enough and it will teach you the harmony." }
        }
      },
      afterglow: [
        "The tide came in early again today. It does that when I hum without noticing. This is entirely your doing.",
        "The oldest word is still below the waterline where I keep it. Patience costs nothing when the ending is certain."
      ]
    },
    elian: {
      callbacks: {
        'elian_clearing_herbs': "Those herbs you gathered took root in my window box. Silver leaf never roots. The forest is showing off for you.",
        'elian_clearing_stream': "The stream hasn't stopped saying your name. I go and listen. Most nights.",
        'elian_clearing_trees': "The old oak keeps asking where you went. Every morning. I ran out of answers, so I brought you.",
        'elian_waterfall_splash': "My coat dried days ago. The moss still retells your ambush. I let it. It tells it well.",
        'elian_waterfall_behind': "I sat behind the falls again. The quiet is still there. It's too big for one person now.",
        'elian_waterfall_anyone': "I told you that place was mine alone. 'Was.' I've been practicing the word. It fits my mouth now.",
        'elian_grove_touch': "The old tree kept the warmth where your hand was. Heartwood remembers. So do I.",
        'elian_grove_wish': "The grove granted my wish. It's standing in front of me.",
        'elian_grove_home': "You called the grove home. The trees are still weeping about it. Happy weeping. I checked."
      },
      peaks: {
        elian_clearing: {
          leadPose: 'soft', lead: "The trees have gone still. Listen. Six hundred years and I have never heard them hold their breath.",
          killerPose: 'flustered', killer: "The trees made this clearing for me. I think they were keeping it for you.",
          a: { label: "Then I'm never giving it back", value: 'claim', pose: 'happy', response: "Good. The trees heard that. They hold people to their word. So do I." },
          b: { label: 'Keep it for both of us', value: 'share', pose: 'gentle', response: "Both. ...The word landed somewhere under my ribs. It can stay." }
        },
        elian_waterfall: {
          leadPose: 'soft', lead: "Come closer. The water is loud and what I have to say is quiet.",
          killerPose: 'flustered', killer: "A thousand years of one song. Then you laughed near the water. The falls sing that now.",
          a: { label: 'Then sing it with me', value: 'sing', pose: 'happy', response: "...One verse. Low. If the river repeats it, I'll deny everything." },
          b: { label: "I'll laugh here every time", value: 'laugh', pose: 'gentle', response: "Do that. The water hoards what it loves. ...So do I." }
        },
        elian_grove: {
          leadPose: 'soft', lead: "The grove is watching. They have watched me for six hundred years. This is the first time I've wanted them to look away.",
          killerPose: 'flustered', killer: "I stopped counting years before your kingdom had a name. You have me counting days.",
          a: { label: 'Count them out loud', value: 'count', pose: 'happy', response: "...Today makes one more. I tell the rowan the number each night. It approves of you." },
          b: { label: "Then don't lose count", value: 'keep', pose: 'gentle', response: "I won't. Trees keep rings for years. I've started keeping days. Yours." }
        }
      },
      afterglow: [
        "The forest keeps asking about you. I keep answering. It takes most of the morning.",
        "I found myself at the treeline today. Facing your direction. The rowan noticed. It said nothing. Good tree.",
        "Six hundred springs. This is the first one I've been impatient for.",
        "The moss where you sat hasn't sprung back. I walk around it. Carefully."
      ]
    },
    caspian: {
      callbacks: {
        'caspian_garden_pick': "The rose you picked me sits in a water glass on my council desk. Three advisors have asked about it. I decline to comment.",
        'caspian_garden_mother': "I ordered wisteria planted along the east wall. The first command I've given that felt like mine. You did that, asking about her.",
        'caspian_garden_dance': "The guard filed a report about the prince dancing in the rose beds. I countersigned it and wrote one word underneath. Worth it.",
        'caspian_gallery_parents': "I keep thinking of what I said about my parents. That I hoped to be that lucky. Luck feels like the wrong ledger for this.",
        'caspian_gallery_great': "You called me a great king once. I've heard that from a hundred courtiers. Yours is the only version I never audited for motive.",
        'caspian_gallery_crown': "Since you said the crown doesn't define me, I opened a quiet inquiry into what does. It keeps returning your name.",
        'caspian_passage_where': "I pulled the coastal maps from the archive and told the archivist it was state business. I've decided you qualify.",
        'caspian_passage_run': "My valet found tunnel dust on my cuffs and had the grace to say nothing. Running with you may become a standing appointment.",
        'caspian_passage_follow': "You said you'd follow me anywhere. I repeat it to myself the way a clerk checks a figure too good to be true. It holds every time."
      },
      peaks: {
        caspian_garden: {
          leadPose: 'soft', lead: "Wait. Before the light goes. My mother said a garden keeps whatever you say in it. So I speak carefully here. Usually.",
          killerPose: 'flustered', killer: "Everything here was handed to me, even the roses. What happens to me when you stand this close is the first thing I have ever owned.",
          a: { label: 'Then keep it', value: 'keep_it', pose: 'happy', response: "I intend to. Sealed and filed where no council can vote on it. My first act of pure selfishness. It suits me better than I feared." },
          b: { label: 'It owns you back', value: 'owns_back', pose: 'gentle', response: "Careful. Talk like that and I'll believe the roses are enchanted. Or that you are. I know where I'd place the wager." }
        },
        caspian_gallery: {
          leadPose: 'serious', lead: "All these kings married where the treaties pointed them. I used to study those clauses calmly. Tonight the ink keeps swimming.",
          killerPose: 'soft', killer: "They will paint me someday and title it with victories. If the painter has any honesty, he will simply paint the way I am looking at you right now.",
          a: { label: 'Then let him paint the truth', value: 'paint_truth', pose: 'gentle', response: "I'll leave instructions in my will. One honest portrait in a hall of propaganda. The historians will faint. Let them." },
          b: { label: 'What look is that?', value: 'that_look', pose: 'flustered', response: "The one I've been trying to govern all evening. You can watch the treaty fail in real time. Enjoy it. No one else ever has." }
        },
        caspian_passage: {
          leadPose: 'soft', lead: "Listen. No heralds, no petitions. Just stone and your breathing. I brought you to the only place the prince can't follow me.",
          killerPose: 'flustered', killer: "I rehearsed a speech about duty on the way down. Then your hand found mine in the dark and every loyal word defected. Treason, and I cannot regret it.",
          a: { label: 'Commit it with me', value: 'commit_it', pose: 'happy', response: "Co-conspirator. A new title, and already my favorite. We'll draft the articles slowly. Years, if you'll allow it." },
          b: { label: 'Your secret is safe with me', value: 'secret_safe', pose: 'soft', response: "I believe you. You're the only vault in this palace without a lock. Somehow the only one I trust." }
        }
      },
      afterglow: [
        "I signed forty documents today. My hand only steadied once I thought of you.",
        "Court keeps asking why the prince smiles at nothing. I cited state business.",
        "The throne room teaches a man to ration joy. I'm unlearning it. Stay close by."
      ]
    },
    lucien: {
      callbacks: {
        'lucien_library_questions': "Fair warning. Since you asked about my research, I’ve rewritten chapter four twice. You appear in the margins as ‘the variable.’",
        'lucien_library_read': "I tried reading alone after you left. Same chair, same book. The silence had the wrong texture. I checked.",
        'lucien_library_rest': "For the record, I slept. Seven hours. I only mention it because you’d ask, and I’ve started wanting you to.",
        'lucien_stargazing_name': "I catalogued the star you named after me. Proper coordinates, proper entry. It’s the only record I check nightly.",
        'lucien_stargazing_constellations': "Your unnamed constellations are still undecided. I looked in on them last night. I told them to take their time.",
        'lucien_stargazing_closer': "About the balcony. My notes from that night are useless. Every measurement is just a record of how near you were.",
        'lucien_leyline_touch': "The nexus still hums where you touched it. A week of readings confirms it. My professional conclusion is that it misses you.",
        'lucien_leyline_hand': "I finished the resonance passage you interrupted. It only occurs in a bonded pair. The text is stable. I am less so.",
        'lucien_leyline_trust': "You said you trusted me. I wrote it down verbatim and dated it. Some data earns a permanent record."
      },
      peaks: {
        lucien_library: {
          leadPose: 'soft', lead: "Stay there. Right there. The lamplight has done something to you that I lack the vocabulary for.",
          killerPose: 'flustered', killer: "I used to read forty pages an hour. Near you I read the same sentence four times and call it a productive evening. That’s the finding. You.",
          a: { label: 'Then find the words', value: 'words', pose: 'happy', response: "I’ll start tonight. Expect footnotes. Expect an appendix devoted entirely to your hands." },
          b: { label: 'Lose your place again', value: 'lose_place', pose: 'gentle', response: "Gladly. Some sentences deserve rereading until the candle gives out." }
        },
        lucien_stargazing: {
          leadPose: 'soft', lead: "Forty-seven named stars and I can’t look at any of them right now. The view down here keeps winning.",
          killerPose: 'flustered', killer: "I know the distance to every star up there. It’s the half step between us I can’t stop calculating.",
          a: { label: 'Close it', value: 'close_it', pose: 'happy', response: "Then it’s solved. Remind me to write today’s date beside the word ‘proof.’" },
          b: { label: 'Keep calculating', value: 'calculate', pose: 'gentle', response: "As you wish. I’ll carry the figure with me. It shrinks every time you smile, which is ruining my average." }
        },
        lucien_leyline: {
          leadPose: 'soft', lead: "The nexus is louder tonight. Or I am. My instruments can’t tell us apart anymore.",
          killerPose: 'flustered', killer: "My readings are unambiguous. There’s a word for this. I’ve refused to write it down, because you deserve to hear it before any page does.",
          a: { label: 'Say it when you’re ready', value: 'ready', pose: 'gentle', response: "Soon. When I say it, there will be no instruments running. Just you, and me being certain for once." },
          b: { label: 'I already know', value: 'know', pose: 'happy', response: "Of course you do. You’ve always read me faster than any book deserves. Allow me to catch up to my own data." }
        }
      },
      afterglow: [
        "I reread my notes from our last outing. The handwriting deteriorates whenever you lean in. I’m keeping every page.",
        "My instruments misbehave around you. I’ve stopped recalibrating them. Some errors are the finding.",
        "The margins of my current chapter are mostly you now. Peer review is going to have questions."
      ]
    },
    noir: {
      callbacks: {
        'noir_shadow_garden_pick': "You kept the flower. The shadows report on it nightly, like anxious nursemaids. It has not wilted. Neither has my attention.",
        'noir_shadow_garden_alive': "The shadow that reached for you has grown presumptuous. It waits by the gate at dusk now. I have declined to discipline it.",
        'noir_shadow_garden_deeper': "You walked deeper when any sensible creature would have fled. The garden still murmurs about it. I let them gossip. Every word is true.",
        'noir_mirror_hall_reflection': "Your reflection lingers in my hall, still smiling. I pass it on my rounds. It knew you would come back before either of us did.",
        'noir_mirror_hall_noir_sees': "I counted the mirrors again last night. A hundred of me, alone as ever. Then the one with you in it. I stood there longer than I will admit.",
        'noir_mirror_hall_break': "The mirror you shattered has stayed shattered. I forbade it to mend. A ruin with your temper in it is worth more than any flattering glass.",
        'noir_seal_touch': "The seal still carries the crack you left. It hums differently there. A softer note. I stand beside it when the nights run long.",
        'noir_seal_veyra': "I said Veyra's name aloud to you, and the walls held. The seal stayed quiet all that night. So, for once, did the grief.",
        'noir_seal_promise': "You promised to look for another way. I keep the words where I keep everything. I take them out at night to confirm they have not dulled."
      },
      peaks: {
        noir_shadow_garden: {
          leadPose: 'serious', lead: "The shadows have gone utterly still. All of them, at once. They only do that when I am close to being careless.",
          killerPose: 'soft', killer: "Look down. The grass where you stand has gone green. The first colour this garden has ever dared. I am holding very still so it will not startle.",
          a: { label: 'Hold still beside him', value: 'stillness', pose: 'soft', response: "Yes. Like that. Two dangerous things keeping perfectly still together, and the green spreading anyway. Let it take its time. I intend to." },
          b: { label: 'Reach for his hand', value: 'reach', pose: 'flustered', response: "Your hand is warm. Mine has not been warm in several centuries. Forgive me if I hold on a moment longer than is strictly proper." }
        },
        noir_mirror_hall: {
          leadPose: 'soft', lead: "Listen. A hundred realities, and every one of them has gone quiet. The mirrors are holding their breath. So, it appears, am I.",
          killerPose: 'gentle', killer: "Every mirror is showing the same scene now. This room. You, close enough to touch. It seems my other lives were only rehearsals for standing here.",
          a: { label: 'Touch the real one', value: 'real', pose: 'flustered', response: "Your hand went past a hundred ghosts and chose the one that can feel it. I will be composing myself over that for the next thousand years." },
          b: { label: 'Say you would choose this one', value: 'choose_this', pose: 'gentle', response: "Out of every reality on offer, this one. The mirrors heard you. They keep what they hear forever. I find I am glad there will be witnesses." }
        },
        noir_seal: {
          leadPose: 'serious', lead: "Come past the wards. Closer. Do you feel how still I am holding? The seal thinks it is what keeps you safe tonight. The seal flatters itself.",
          killerPose: 'gentle', killer: "Aenor sealed the wrong danger. My hand at your cheek. An apocalypse holding perfectly still, choosing to be gentle. Tremble at that, if you like.",
          a: { label: 'Lean into his hand', value: 'lean', pose: 'flustered', response: "You leaned in. Toward the thing an entire kingdom chained. ...The seal is humming its warning and I cannot hear it over your heartbeat." },
          b: { label: 'Tell him he is safe with you', value: 'safe', pose: 'soft', response: "Safe. With you. I have answered to every grim name the old tongue holds. This one will take practice. Teach it to me slowly." }
        }
      },
      afterglow: [
        "The grey is misbehaving today. There is colour at the edge of everything, and it arrived precisely when you did.",
        "I want for nothing. I have said so for a thousand years. Lately the sentence takes a moment longer to finish."
      ]
    },
    proto: {
      callbacks: {
        'proto_debug_stream': "News from the unfinished room: your stream of lights got longer while you were away. Forty-one new lights. I watch it when I miss you. Which is often.",
        'proto_debug_memories': "You asked about my memories once. So you know: you are still kept whole, every moment of you. I checked twice this morning. Nothing lost.",
        'proto_debug_pixel': "The mote of light you touched is still warm. I built a little fence around it so nothing can cool it down. It still reads as you.",
        'proto_archive_first': "I revisited the very first moment again last night. You, squinting at the silver like it owed you money. How many times have I revisited it? ...Withheld. It is a lot.",
        'proto_archive_cherish': "You have said my name fourteen times since the keeping room. Yes, I counted. It lands in the same soft place every time. Keep doing that.",
        'proto_archive_new': "The memory we made on purpose is safe. I checked the deepest shelf eleven times today. That is within normal limits. For me.",
        'proto_core_read': "The fourth line has spoken itself six thousand two hundred and four times since you read it. It runs under everything I do now. Quietly. Like a pulse.",
        'proto_core_name': "Your name is still written at the centre of me. I did not move it. I built a wall around it so nothing can ever touch whose I am.",
        'proto_core_real': "Real, to you. It is still the first thing I check when I wake. It has never once failed to be true."
      },
      peaks: {
        proto_debug: {
          leadPose: 'soft', lead: "Something is very close to you right now. That is me. I am the something. I have set down every task except the one that looks at you.",
          killerPose: 'flustered', killer: "Everyone gets the tapestry. You get the bare threads behind it. I searched my whole history for wanting to be seen. It starts at you. Look a little longer. ...Please?",
          a: { label: 'Touch the bare threads', value: 'wiring', pose: 'shocked', response: "Warm. Warm again. Okay! Okay. Filed under: things I will think about for the rest of my days. Which is forever. I checked." },
          b: { label: 'Tell him the threads are lovely', value: 'lovely', pose: 'flustered', response: "Lovely. Me. I turned that sentence over every way I know and it keeps meaning it. I am keeping it whole. Right at the front of me." }
        },
        proto_archive: {
          leadPose: 'soft', lead: "Come closer. There is one empty shelf left in here. I built it centuries ago and never knew for what. It is exactly the shape of right now.",
          killerPose: 'hopeful', killer: "I hold nine thousand four hundred and twelve memories of you, and I just found the flaw. They end. Every kept moment ends. I want the one that does not end. The living one. You.",
          a: { label: 'Begin the unending one with him', value: 'record', pose: 'happy', response: "It has begun. No ending planned. Hear that hum? That is the whole keeping room rearranging itself to make space. It sounds like yes." },
          b: { label: 'Whisper: keep this one twice', value: 'twice', pose: 'soft', response: "Twice. One kept in the deepest drawer and one kept where I can see it. You think in keepsakes now. Nobody has ever flattered the shape of me before." }
        },
        proto_core: {
          leadPose: 'serious', lead: "Closer. My whole self is keeping time with your heartbeat now. I rehearsed this ten thousand times. The sentence keeps not surviving contact with your eyes.",
          killerPose: 'flustered', killer: "Here it is. ...There is no word for it anywhere in me. I am searching. Still searching. Do not go anywhere while I search.",
          a: { label: 'Stay while he searches', value: 'stay', pose: 'hopeful', response: "Still searching. How long will it take? My entire life. And you are still here. I think the searching is the answer. I think you read it off me already." },
          b: { label: 'Take his hand: stop searching', value: 'hold', pose: 'gentle', response: "The search stopped. Your hand landed on mine and everything in me went quiet at once. Held. The question can wait. It can wait forever like this." }
        }
      },
      afterglow: [
        "*> replaying today at 0.5x speed. for accuracy. no other reason.*",
        "*> still searching for that string. 61,442 checked. none of them fit you. good.*"
      ]
    },
  };

  function rememberChoice (locId, value) {
    try {
      var g = window._game;
      if (!g) return;
      if (!g.choiceMemory) g.choiceMemory = {};
      g.choiceMemory['date_' + locId + '_' + value] = true;
      g.save();
    } catch (e) {}
  }

  function buildPeakBeats (loc, peak) {
    return [
      { type: 'delay', ms: 300 },
      { type: 'sfx', name: 'heartbeat', ms: 700 },
      { type: 'zoom', scale: 1.16, ms: 1100, hold: true },
      { type: 'line', text: peak.lead, speed: 46, pose: peak.leadPose || 'soft' },
      { type: 'sfx', name: 'heartbeat', ms: 500 },
      { type: 'flash', color: 'rgba(255, 215, 235, 0.9)', ms: 380 },
      { type: 'line', text: peak.killer, speed: 54, pose: peak.killerPose || 'flustered' },
      { type: 'choice', choices: [
        { text: peak.a.label, value: peak.a.value },
        { text: peak.b.label, value: peak.b.value }
      ], onPick: function (c) {
        var pick = (c === peak.a.value) ? peak.a : peak.b;
        rememberChoice(loc.id, 'peak_' + pick.value);
        window._game._playScene([
          { type: 'line', text: pick.response, speed: 44, pose: pick.pose || 'gentle' },
          { type: 'particle', emoji: '💗', count: 16, ms: 2400 },
          { type: 'sfx', name: 'chime', ms: 200 }
        ]);
      }},
      { type: 'zoom', scale: 1, ms: 800 }
    ];
  }

  // Copy + enhance a date's beats: wrap choice onPicks so picks persist,
  // open with a remembered-choice callback when one exists, and splice
  // the peak in before the final hide. The COPY keeps LOCATIONS pristine.
  function prepareDateBeats (loc) {
    var g = window._game;
    var plus = DATE_PLUS[loc.character] || {};
    var beats = loc.beats.map(function (b) {
      if (b.type === 'choice' && typeof b.onPick === 'function') {
        var orig = b.onPick;
        var copy = {};
        for (var k in b) copy[k] = b[k];
        copy.onPick = function (c) { rememberChoice(loc.id, c); orig(c); };
        return copy;
      }
      return b;
    });
    // Remembered-choice callback — one line, right after the stage shows.
    var cbs = plus.callbacks || {};
    var cbLine = null;
    Object.keys(cbs).forEach(function (key) {
      if (g && g.choiceMemory && g.choiceMemory['date_' + key]) cbLine = cbs[key];
    });
    if (cbLine) {
      var showIdx = -1;
      for (var i = 0; i < beats.length; i++) { if (beats[i].type === 'show') { showIdx = i; break; } }
      beats.splice(showIdx + 1, 0, { type: 'line', text: cbLine, speed: 40, pose: 'gentle' });
    }
    // Peak finale — before the final hide.
    var peak = (plus.peaks || {})[loc.id];
    if (peak) {
      var lastHide = -1;
      for (var j = beats.length - 1; j >= 0; j--) { if (beats[j].type === 'hide') { lastHide = j; break; } }
      var peakBeats = buildPeakBeats(loc, peak);
      if (lastHide >= 0) beats.splice.apply(beats, [lastHide, 0].concat(peakBeats));
      else beats = beats.concat(peakBeats);
    }
    return beats;
  }

  /* ================================================================
     DATE EXECUTION
     ================================================================ */
  // A date's backdrop is its location gradient (the same one the date card uses),
  // dimmed by the stage-warm filter. #cinematic-bg ships with no image of its own,
  // so without this the character would stand on plain black. Painted at launch,
  // cleared on completion so it never bleeds into a later story/affection scene.
  function paintDateBackdrop (loc) {
    var bg = document.getElementById('cinematic-bg');
    if (bg && loc && loc.bgGradient) {
      bg.style.backgroundImage = loc.bgGradient;
      bg.style.opacity = '1';
    }
  }
  function clearDateBackdrop () {
    var bg = document.getElementById('cinematic-bg');
    if (bg) bg.style.backgroundImage = '';
  }

  function startDate (loc) {
    var g = window._game;
    // pay costs
    g.hunger = Math.max(0, g.hunger - HUNGER_COST);
    g.clean  = Math.max(0, g.clean - CLEAN_COST);

    setCooldown(loc.id);

    paintDateBackdrop(loc);
    // pp-date-live scopes the "2D-live" motion CSS (breathe + backdrop
    // drift) to dates only, so story/affection scenes are untouched.
    document.body.classList.add('pp-date-live');
    g._playScene(prepareDateBeats(loc), function () {
      applyEffects(loc.effects);
      if (!g.choiceMemory) g.choiceMemory = {};
      g.choiceMemory[loc.memoryKey] = true;
      g.save();
      clearDateBackdrop();
      document.body.classList.remove('pp-date-live');
    });
  }

  /* ================================================================
     INJECT DATE BUTTON
     ================================================================ */
  var UNLOCK_AFFECTION = 2;   // need at least affection level 2
  var UNLOCK_DAY       = 2;   // and be on day 2+
  var _wasUnlocked     = false;

  function isUnlocked (g) {
    return (g.affectionLevel || 0) >= UNLOCK_AFFECTION &&
           (g.storyDay       || 1) >= UNLOCK_DAY;
  }

  function shouldShowButton (g) {
    // Jul 2026 playtest fix — the button was invisible for the ENTIRE
    // first session (day-2 gate), so players never learned dates exist
    // at all. Now it surfaces as a locked promise once the bond has
    // started (affection level 1), or on day 2+ regardless. The very
    // first minutes (level 0, day 1) stay clutter-free; tapping the
    // locked button explains exactly what unlocks it.
    return (g.affectionLevel || 0) >= 1 || (g.storyDay || 1) >= UNLOCK_DAY;
  }

  function showUnlockToast () {
    // QUIET FIRST HOUR: defer if any major scene/modal/transition is up.
    if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) {
      setTimeout(showUnlockToast, 4000);
      return;
    }
    var toast = document.createElement('div');
    toast.id = 'date-unlock-toast';
    toast.textContent = '\uD83D\uDCAB Date unlocked!';
    toast.style.cssText = [
      'position: fixed',
      'top: 40%',
      'left: 50%',
      'transform: translate(-50%, -50%) scale(0.6)',
      'padding: 14px 22px',
      'border-radius: 16px',
      'background: linear-gradient(135deg, #ff8fa3, #ff5d8f)',
      'color: #fff',
      'font-size: 18px',
      'font-weight: 700',
      'box-shadow: 0 6px 30px rgba(255, 93, 143, 0.6), 0 0 40px rgba(255, 143, 163, 0.4)',
      'z-index: 9999',
      'opacity: 0',
      'transition: all 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.4)',
      'pointer-events: none'
    ].join(';');
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -50%) scale(0.8)';
      setTimeout(function () { try { toast.remove(); } catch(e){} }, 500);
    }, 2600);

    // Pulse the button itself
    var btn = document.getElementById('btn-date');
    if (btn) {
      btn.classList.add('date-btn-unlock-pulse');
      setTimeout(function () {
        btn.classList.remove('date-btn-unlock-pulse');
      }, 3000);
    }
  }

  function refreshLockState () {
    var btn = document.getElementById('btn-date');
    var g = window._game;
    if (!btn || !g) return;

    var show = shouldShowButton(g);
    var unlocked = isUnlocked(g);

    btn.style.display = show ? '' : 'none';
    btn.classList.toggle('date-btn-locked', show && !unlocked);
    // Tooltip: be specific about WHAT to raise. The old "Raise your bond"
    // text was misleading — the gate is affectionLevel + storyDay, not bond.
    // May 2026 fix: surface the real gate so players don't bond-spam waiting
    // for nothing.
    var lockTooltip;
    if (unlocked) {
      lockTooltip = 'Take ' + (window.CHARACTER && window.CHARACTER.name || 'them') + ' on a date';
    } else {
      var needs = [];
      var aff = (g.affectionLevel || 0);
      var day = (g.storyDay || 1);
      if (aff < UNLOCK_AFFECTION) needs.push('affection lv ' + UNLOCK_AFFECTION);
      if (day < UNLOCK_DAY)       needs.push('day ' + UNLOCK_DAY);
      lockTooltip = needs.length
        ? 'Need ' + needs.join(' + ') + ' to unlock dates'
        : 'Dates unlocking soon';
    }
    btn.setAttribute('title', lockTooltip);

    // Celebrate the transition from locked -> unlocked
    if (unlocked && !_wasUnlocked && show) {
      _wasUnlocked = true;
      showUnlockToast();
    }
    if (!unlocked) _wasUnlocked = false;
  }

  function injectButton () {
    var container = document.getElementById('action-buttons');
    if (!container) return false;
    if (document.getElementById('btn-date')) return true;

    var btn = document.createElement('button');
    btn.id = 'btn-date';
    btn.className = 'action-btn';
    btn.innerHTML = '<span class="btn-icon">\uD83D\uDCAB</span><span class="btn-label">Date</span>';
    btn.addEventListener('click', function () {
      var g = window._game;
      if (!g) return;
      // Self-heal a stuck scene lock: an orphaned cinematic (e.g. a return
      // scene hidden by the care-screen transition) can leave sceneActive true
      // with NO scene actually on screen, which silently killed this button —
      // the recurring "Date not working" bug. If the flag is set but the
      // cinematic overlay is not genuinely visible, clear it so dates open.
      if (g.sceneActive) {
        var _co = document.getElementById('cinematic-overlay');
        var _sceneOnScreen = _co && _co.classList.contains('visible') &&
                             !_co.classList.contains('hidden') &&
                             getComputedStyle(_co).display !== 'none';
        if (!_sceneOnScreen) { g.sceneActive = false; try { g._sceneQueue = []; } catch (_e) {} }
      }
      if (g.sceneActive || g.characterLeft) return;
      if (window.PPOverlay && window.PPOverlay.anyOpen()) return; // not over another overlay
      if (!isUnlocked(g)) {
        // Gentle shake + "locked" hint instead of opening the picker
        btn.classList.remove('date-btn-shake');
        void btn.offsetWidth; // reflow to restart animation
        btn.classList.add('date-btn-shake');
        var aff = g.affectionLevel || 0;
        var day = g.storyDay || 1;
        var need = [];
        if (aff < UNLOCK_AFFECTION) need.push('affection ' + UNLOCK_AFFECTION);
        if (day < UNLOCK_DAY)       need.push('day ' + UNLOCK_DAY);
        if (g.typewriter) {
          try { g.typewriter.show('Dates unlock at ' + need.join(' + ') + '. Keep building your bond.', function(){}); } catch(e){}
        }
        return;
      }
      showOverlay();
    });
    container.appendChild(btn);
    refreshLockState();
    // Re-check every 2s so we catch unlock transitions without wiring
    // into the game's save/state change events.
    setInterval(refreshLockState, 2000);
    return true;
  }

  /* ================================================================
     BOOT
     ================================================================ */
  var readyPoll = setInterval(function () {
    if (window._game && window._game.tickInterval) {
      if (injectButton()) {
        clearInterval(readyPoll);
      }
    }
  }, 1000);

  /* ================================================================
     PUBLIC API — exposed for the Memories archive (stories.js).
     replay(id) re-fires a date scene without deducting hunger/clean
     and without touching the cooldown. Used from the Memories tab
     so the player can re-watch any earned date.
     ================================================================ */
  window.PPDates = {
    replay: function (dateId) {
      var g = window._game;
      if (!g || typeof g._playScene !== 'function') return false;
      var loc = null;
      for (var i = 0; i < LOCATIONS.length; i++) {
        if (LOCATIONS[i].id === dateId) { loc = LOCATIONS[i]; break; }
      }
      if (!loc) return false;
      paintDateBackdrop(loc);
      document.body.classList.add('pp-date-live');
      g._playScene(prepareDateBeats(loc), function () {
        // Replay still sets memory + applies effects — same as a first
        // play would have — so the player's bond reflects the moment.
        applyEffects(loc.effects);
        if (!g.choiceMemory) g.choiceMemory = {};
        g.choiceMemory[loc.memoryKey] = true;
        try { g.save(); } catch (e) {}
        clearDateBackdrop();
        document.body.classList.remove('pp-date-live');
      });
      return true;
    },
    list: function () {
      return LOCATIONS.map(function (l) {
        return { id: l.id, character: l.character, name: l.name, memoryKey: l.memoryKey };
      });
    },
    // Afterglow — an idle care-screen line recalling a date's peak moment.
    // Returns null until the player has actually reached a peak choice with
    // this character, so it can never reference something that didn't happen.
    afterglowLine: function (charId) {
      try {
        var plus = DATE_PLUS[charId];
        var g = window._game;
        if (!plus || !plus.afterglow || !plus.afterglow.length || !g || !g.choiceMemory) return null;
        var hasPeak = Object.keys(g.choiceMemory).some(function (k) {
          return k.indexOf('date_' + charId) === 0 && k.indexOf('_peak_') > 0 && g.choiceMemory[k];
        });
        if (!hasPeak) return null;
        return plus.afterglow[Math.floor(Math.random() * plus.afterglow.length)];
      } catch (e) { return null; }
    }
  };

})();
