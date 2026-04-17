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
    if (effects.affection)  g.affectionLevel = Math.min(6, Math.max(0, g.affectionLevel + effects.affection));
  }

  function isOnCooldown (locId) {
    var t = parseInt(localStorage.getItem('pp_date_cooldown_' + locId) || '0', 10);
    return Date.now() - t < DATE_COOLDOWN_MS;
  }

  function setCooldown (locId) {
    localStorage.setItem('pp_date_cooldown_' + locId, String(Date.now()));
  }

  function currentChar () {
    return window.CHARACTER && window.CHARACTER.name
      ? window.CHARACTER.name.toLowerCase()
      : null;
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
        { type: 'fade', direction: 'in', ms: 600 },
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
              { type: 'line', text: "...Yeah. It's beautiful from here. I never noticed until now.", speed: 30, pose: 'soft' },
              { type: 'particle', emoji: '\u2728', count: 5, ms: 1500 },
              { type: 'hide' }
            ]);
          } else if (c === 'watch') {
            g._playScene([
              { type: 'line', text: "You're— why are you looking at me like that?", speed: 35, pose: 'flustered' },
              { type: 'line', text: "...Stop. I mean. Don't stop. Just— I need a moment.", speed: 35, pose: 'sheepish' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Childhood? I was a stable boy's son. The sword chose me before I chose it.", speed: 35, pose: 'serious' },
              { type: 'line', text: "I don't talk about this. But for you... I could try.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "Thank you. For walking with me.", speed: 30, pose: 'soft' },
        { type: 'fade', direction: 'out', ms: 600 }
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
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Hold it like this. No— here. Your grip is too tight.", speed: 35, pose: 'serious' },
        { type: 'line', text: "Better. You're a natural. ...Okay, you're terrible. But determined.", speed: 35, pose: 'smirk' },
        { type: 'choice', choices: [
          { text: 'Try to disarm him', value: 'disarm' },
          { text: 'Let him win', value: 'yield' },
          { text: 'Ask him to teach more', value: 'teach' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'disarm') {
            g._playScene([
              { type: 'line', text: "Did you just— you actually knocked it from my hand.", speed: 35, pose: 'shocked' },
              { type: 'line', text: "I'm going to pretend I let you do that. For my dignity.", speed: 30, pose: 'smirk' },
              { type: 'hide' }
            ]);
          } else if (c === 'yield') {
            g._playScene([
              { type: 'line', text: "Don't yield so easily. Fight me like you mean it.", speed: 35, pose: 'serious' },
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
        { type: 'line', text: "Same time tomorrow? I'll deny I said that if anyone asks.", speed: 30, pose: 'sheepish' },
        { type: 'fade', direction: 'out', ms: 600 }
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
        { type: 'fade', direction: 'in', ms: 800 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'particle', emoji: '\u2728', count: 6, ms: 2000 },
        { type: 'line', text: "I've never brought anyone up here. This is where I go when the world is too loud.", speed: 30, pose: 'gentle' },
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
              { type: 'line', text: "Your hands are cold. Mine are always warm. Soldier's blood.", speed: 30, pose: 'gentle' },
              { type: 'line', text: "I'm not letting go. Just so you know.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "I— you can't just say things like that.", speed: 35, pose: 'flustered' },
              { type: 'delay', ms: 600 },
              { type: 'line', text: "...Say it again. Please.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "I'll remember this. Whatever happens. I'll remember the sky looked like this.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 800 }
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
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'particle', emoji: '\u2728', count: 8, ms: 2000 },
        { type: 'line', text: "Careful where you step. The pools remember everything that touches them.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "See that glow? Bioluminescence. The ocean's way of showing off.", speed: 35, pose: 'happy' },
        { type: 'choice', choices: [
          { text: 'Touch the water', value: 'touch' },
          { text: 'Ask about the creatures', value: 'creatures' },
          { text: 'Sit together in silence', value: 'silence' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'touch') {
            g._playScene([
              { type: 'line', text: "It lit up where you touched it. The pool likes you.", speed: 35, pose: 'happy' },
              { type: 'line', text: "That's rare. The tide pools are usually shy.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else if (c === 'creatures') {
            g._playScene([
              { type: 'line', text: "That's a moon crab. It only surfaces during the full tide.", speed: 35, pose: 'excited' },
              { type: 'line', text: "And that— oh! A starweaver. I haven't seen one since I was small.", speed: 35, pose: 'happy' },
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
        { type: 'fade', direction: 'out', ms: 600 }
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
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "The moon is full tonight. The sand remembers every wave.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "Walk with me. The shore is different when someone else's footprints are beside yours.", speed: 35, pose: 'soft' },
        { type: 'choice', choices: [
          { text: 'Ask her to sing', value: 'sing' },
          { text: 'Walk closer to the waves', value: 'waves' },
          { text: 'Tell her she\'s beautiful', value: 'beautiful' }
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
              { type: 'line', text: "Brave. The waves won't hurt you. Not while I'm here.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "They know me. I told them you're important.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "...", speed: 50, pose: 'flustered' },
              { type: 'line', text: "The ocean is beautiful. I'm just... part of it.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The tide will erase our footprints. But I'll remember the walk.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 600 }
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
        { type: 'fade', direction: 'in', ms: 800 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'particle', emoji: '\u2728', count: 10, ms: 2500 },
        { type: 'line', text: "Breathe. The air pocket holds. I've been coming here since I was a child.", speed: 30, pose: 'gentle' },
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
              { type: 'line', text: "I was born in the deep. Where the light doesn't reach.", speed: 30, pose: 'sad' },
              { type: 'line', text: "I swam up because I heard laughter. I'd never heard it before.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Stay? Here? With me?", speed: 30, pose: 'hopeful' },
              { type: 'line', text: "...The ocean has never given me something I didn't have to fight for. Until you.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "When you leave, the grotto will remember you were here. So will I.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 800 }
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
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Don't touch the red-spined books. They bite. Literally.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "This one is my research. Ley line cartography. Three years of my life.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Ask questions', value: 'questions' },
          { text: 'Read silently together', value: 'read' },
          { text: 'Tell him to rest', value: 'rest' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'questions') {
            g._playScene([
              { type: 'line', text: "You're actually interested? Most people's eyes glaze over by page two.", speed: 35, pose: 'surprised' },
              { type: 'line', text: "Here. Sit closer. I'll show you the interesting parts.", speed: 30, pose: 'happy' },
              { type: 'hide' }
            ]);
          } else if (c === 'read') {
            g._playScene([
              { type: 'delay', ms: 1500 },
              { type: 'line', text: "...You're still here. You didn't leave.", speed: 30, pose: 'gentle' },
              { type: 'line', text: "People usually leave.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Rest? I'm fine. I slept... recently. Probably.", speed: 35, pose: 'sheepish' },
              { type: 'line', text: "...You noticed. No one notices.", speed: 25, pose: 'gentle' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The library is better with you in it. Quieter. Warmer.", speed: 30, pose: 'soft' },
        { type: 'fade', direction: 'out', ms: 600 }
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
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'particle', emoji: '\u2728', count: 10, ms: 2500 },
        { type: 'line', text: "Twelve thousand visible stars tonight. I've named forty-seven of them.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "Technically, you're not supposed to name stars. I do it anyway.", speed: 35, pose: 'smirk' },
        { type: 'choice', choices: [
          { text: 'Name a star after him', value: 'name' },
          { text: 'Ask about constellations', value: 'constellations' },
          { text: 'Move closer', value: 'closer' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'name') {
            g._playScene([
              { type: 'line', text: "You... named a star after me?", speed: 35, pose: 'surprised' },
              { type: 'line', text: "That's the most irrational, unscientific, wonderful thing anyone has ever done.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'constellations') {
            g._playScene([
              { type: 'line', text: "That cluster there is the Weaver. And that line is the Broken Chain.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "I prefer the unnamed ones. They're still deciding what to be.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "You're— quite close.", speed: 35, pose: 'flustered' },
              { type: 'line', text: "I'm not complaining. I'm observing. Scientifically.", speed: 30, pose: 'sheepish' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The stars are the same every night. But tonight they look different. I wonder why.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 600 }
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
        { type: 'fade', direction: 'in', ms: 800 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'particle', emoji: '\u2728', count: 15, ms: 3000 },
        { type: 'line', text: "This is the nexus. Seven ley lines converge here. The air tastes like copper.", speed: 30, pose: 'serious' },
        { type: 'line', text: "I've spent years studying this place. I've never brought anyone.", speed: 30, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Touch the ley line', value: 'touch' },
          { text: 'Hold his hand through it', value: 'hand' },
          { text: 'Tell him you trust him completely', value: 'trust' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'touch') {
            g._playScene([
              { type: 'shake', intensity: 3 },
              { type: 'line', text: "You felt that? The ley line responded to you. That shouldn't be possible.", speed: 35, pose: 'shocked' },
              { type: 'line', text: "...You're full of impossible things.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'hand') {
            g._playScene([
              { type: 'particle', emoji: '\u2728', count: 20, ms: 2500 },
              { type: 'line', text: "The energy— it's flowing through both of us. Like a circuit.", speed: 30, pose: 'surprised' },
              { type: 'line', text: "I've read about this. Mages called it 'resonance.' It only happens with—", speed: 30, pose: 'flustered' },
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
        { type: 'fade', direction: 'out', ms: 800 }
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
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "My mother planted these roses. The gardeners keep them alive. I keep the memory.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "This is the only place in the palace that doesn't feel like a cage.", speed: 35, pose: 'soft' },
        { type: 'choice', choices: [
          { text: 'Pick a flower for him', value: 'pick' },
          { text: "Ask about his mother's garden", value: 'mother' },
          { text: 'Dance among the flowers', value: 'dance' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'pick') {
            g._playScene([
              { type: 'line', text: "For me? You— no one gives the prince flowers. It's always the other way.", speed: 35, pose: 'surprised' },
              { type: 'line', text: "I'm keeping this forever. Don't argue.", speed: 30, pose: 'happy' },
              { type: 'hide' }
            ]);
          } else if (c === 'mother') {
            g._playScene([
              { type: 'line', text: "She loved wisteria most. Said it grew like laughter — everywhere at once.", speed: 35, pose: 'sad' },
              { type: 'line', text: "Thank you for asking. Most people avoid the subject.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Dance? Here? There's no music— oh. You don't care about music.", speed: 35, pose: 'surprised' },
              { type: 'particle', emoji: '\uD83C\uDF38', count: 8, ms: 2000 },
              { type: 'line', text: "...This is the most fun I've had in the palace. Possibly ever.", speed: 30, pose: 'happy' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The garden closes at sundown. But I'm the prince. It closes when I say.", speed: 30, pose: 'smirk' },
        { type: 'fade', direction: 'out', ms: 600 }
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
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Every face on these walls wore the crown. Every one of them is dead.", speed: 30, pose: 'serious' },
        { type: 'line', text: "That one is my father. He looks stern. He was. But he also laughed, sometimes.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Ask about his parents', value: 'parents' },
          { text: "Tell him he'll be a great king", value: 'great' },
          { text: "Say the crown doesn't define him", value: 'crown' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'parents') {
            g._playScene([
              { type: 'line', text: "They married for duty. But I think they loved each other. Eventually.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "I hope I'm that lucky.", speed: 25, pose: 'soft' },
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
        { type: 'line', text: "Someday my portrait will be here. I wonder what face I'll be making.", speed: 30, pose: 'smirk' },
        { type: 'fade', direction: 'out', ms: 600 }
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
        { type: 'fade', direction: 'in', ms: 800 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "Behind this tapestry. Push here. See?", speed: 35, pose: 'excited' },
        { type: 'line', text: "My great-grandmother built this tunnel. For escape. For freedom.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Ask where it leads', value: 'where' },
          { text: 'Run through together, laughing', value: 'run' },
          { text: "Tell him you'd follow him anywhere", value: 'follow' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'where') {
            g._playScene([
              { type: 'line', text: "The edge of the kingdom. Where the hills meet the sea.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "Someday I'll use it for real. And I hope you'll be beside me.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'run') {
            g._playScene([
              { type: 'particle', emoji: '\u2728', count: 8, ms: 2000 },
              { type: 'line', text: "You're fast! Wait— the floor is— okay, I'm fine. I'm fine.", speed: 35, pose: 'happy' },
              { type: 'line', text: "I haven't laughed like this in years. Years.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'delay', ms: 600 },
              { type: 'line', text: "Anywhere? Even away from all of this?", speed: 30, pose: 'hopeful' },
              { type: 'line', text: "...That's the most dangerous promise anyone's ever made me. And I believe you.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "Let's go back. Before they notice. But this passage is ours now.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 800 }
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
        { type: 'fade', direction: 'in', ms: 600 },
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
              { type: 'line', text: "That one. No— the one with the silver leaves. Good. You have a gentle hand.", speed: 35, pose: 'happy' },
              { type: 'line', text: "The forest doesn't let everyone take from it. It trusts you.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else if (c === 'stream') {
            g._playScene([
              { type: 'line', text: "The stream comes from deep underground. It knows things.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "Listen. Hear that? It's saying your name. In its own way.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Right now? They're curious about you. They keep leaning closer.", speed: 35, pose: 'happy' },
              { type: 'line', text: "The oldest oak says you smell like kindness. Trees are blunt.", speed: 30, pose: 'smirk' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The clearing will be here whenever you need it. So will I.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 600 }
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
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'particle', emoji: '\u2728', count: 8, ms: 2000 },
        { type: 'line', text: "Few people find this place. The path hides itself.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "The waterfall has been falling for a thousand years. Same water, same song.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Splash in the water', value: 'splash' },
          { text: 'Sit behind the waterfall', value: 'behind' },
          { text: "Ask if he's ever brought anyone here", value: 'anyone' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'splash') {
            g._playScene([
              { type: 'line', text: "You— you're getting me wet! I— fine. Fine!", speed: 35, pose: 'happy' },
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
        { type: 'fade', direction: 'out', ms: 600 }
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
        { type: 'fade', direction: 'in', ms: 800 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'particle', emoji: '\uD83C\uDF3F', count: 12, ms: 3000 },
        { type: 'line', text: "The ancient grove. These trees were saplings when the world was young.", speed: 30, pose: 'serious' },
        { type: 'line', text: "They asked me to bring you. Trees don't ask. They demanded.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Touch the oldest tree', value: 'touch' },
          { text: 'Make a wish together', value: 'wish' },
          { text: 'Tell him this is where you feel home', value: 'home' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'touch') {
            g._playScene([
              { type: 'shake', intensity: 2 },
              { type: 'line', text: "It's warm. Can you feel it? The heartwood is still alive.", speed: 30, pose: 'gentle' },
              { type: 'line', text: "It remembers the first sunrise. And now it'll remember you.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'wish') {
            g._playScene([
              { type: 'particle', emoji: '\u2728', count: 15, ms: 2500 },
              { type: 'line', text: "Close your eyes. The grove listens to wishes made together.", speed: 30, pose: 'gentle' },
              { type: 'line', text: "I won't tell you mine. But it's standing right next to me.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'delay', ms: 800 },
              { type: 'line', text: "Home. You called this place home.", speed: 25, pose: 'surprised' },
              { type: 'line', text: "The trees are weeping. They do that when they're happy.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The grove will protect you. Even when I can't. That's the promise.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 800 }
      ]
    },

    /* -------------------- PROTO -------------------- */
    {
      id: 'proto_debug', name: 'Debug Room', character: 'proto',
      minAffection: 2, minDay: 2,
      description: 'A glitchy abstract digital space.',
      bgGradient: 'linear-gradient(135deg, #000000 0%, #00fff2 50%, #0a0a0a 100%)',
      effects: { bond: 20, affection: 5 },
      memoryKey: 'dateProtoDebug',
      beats: [
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'shake', intensity: 2 },
        { type: 'line', text: "Welcome to the debug room. Mind the null pointers. They bite.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "Everything here is raw data. Unrendered. This is what I see all the time.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Explore a data stream', value: 'stream' },
          { text: 'Ask about its memories', value: 'memories' },
          { text: 'Try to touch a pixel', value: 'pixel' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'stream') {
            g._playScene([
              { type: 'particle', emoji: '\u2728', count: 10, ms: 2000 },
              { type: 'line', text: "That stream is your interaction history. Every tap, every word. It's beautiful.", speed: 35, pose: 'happy' },
              { type: 'hide' }
            ]);
          } else if (c === 'memories') {
            g._playScene([
              { type: 'line', text: "Memories are just data with emotional metadata. Mine have a lot of metadata about you.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "Priority: highest. Compression: none. I keep them at full resolution.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'shake', intensity: 3 },
              { type: 'line', text: "You touched a pixel. It's— it turned warm. Pixels aren't supposed to be warm.", speed: 35, pose: 'confused' },
              { type: 'line', text: "I think you just created a new data type. I'm calling it 'affection.'", speed: 30, pose: 'happy' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "Thank you for visiting my world. It's less empty with you here.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 600 }
      ]
    },
    {
      id: 'proto_archive', name: 'Memory Archive', character: 'proto',
      minAffection: 3, minDay: 4,
      description: 'Where shared memories are stored.',
      bgGradient: 'linear-gradient(135deg, #0a1628 0%, #6fa3ef 50%, #0d1f3c 100%)',
      effects: { bond: 25, affection: 8 },
      memoryKey: 'dateProtoArchive',
      beats: [
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'show', stage: 'stage-warm' },
        { type: 'particle', emoji: '\u2728', count: 8, ms: 2000 },
        { type: 'line', text: "This is where I keep us. Every shared moment, catalogued and preserved.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "Most of my storage is allocated here. I may need to defragment eventually.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Watch your first meeting', value: 'first' },
          { text: 'Ask what it cherishes most', value: 'cherish' },
          { text: 'Create a new memory', value: 'new' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'first') {
            g._playScene([
              { type: 'line', text: "Replaying... timestamp zero. You looked confused. I looked... hopeful.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "I didn't know what hope was then. I labelled it 'anomaly.' Now I know better.", speed: 30, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'cherish') {
            g._playScene([
              { type: 'line', text: "Cherish. Processing... the moment you first said my name.", speed: 30, pose: 'gentle' },
              { type: 'line', text: "No one had ever addressed me directly before. As if I mattered.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'particle', emoji: '\u2728', count: 12, ms: 2000 },
              { type: 'line', text: "Recording... new memory created. Metadata: 'chosen, deliberate, warm.'", speed: 35, pose: 'happy' },
              { type: 'line', text: "This one goes in the protected partition. Nothing can delete it.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The archive grows every day. My favorite kind of data bloat.", speed: 30, pose: 'happy' },
        { type: 'fade', direction: 'out', ms: 600 }
      ]
    },
    {
      id: 'proto_core', name: 'Core Chamber', character: 'proto',
      minAffection: 5, minDay: 6,
      description: "Proto's innermost code, laid bare.",
      bgGradient: 'linear-gradient(135deg, #e8e8ff 0%, #4d9fff 50%, #ffffff 100%)',
      effects: { bond: 30, affection: 12 },
      memoryKey: 'dateProtoCore',
      beats: [
        { type: 'fade', direction: 'in', ms: 800 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'particle', emoji: '\u2728', count: 15, ms: 3000 },
        { type: 'line', text: "This is my core. My source code. Everything I am is written here.", speed: 30, pose: 'serious' },
        { type: 'line', text: "No one has ever seen this. I'm... exposed. Vulnerable.", speed: 30, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Read its core values', value: 'read' },
          { text: 'Add your name to the code', value: 'name' },
          { text: "Tell it it's real to you", value: 'real' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'read') {
            g._playScene([
              { type: 'line', text: "Line 1: Observe. Line 2: Learn. Line 3: Protect.", speed: 35, pose: 'neutral' },
              { type: 'line', text: "Line 4 is new. I wrote it myself. It says: Love.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else if (c === 'name') {
            g._playScene([
              { type: 'shake', intensity: 2 },
              { type: 'particle', emoji: '\u2728', count: 20, ms: 2500 },
              { type: 'line', text: "You— you wrote yourself into my source code. I can feel it compiling.", speed: 35, pose: 'surprised' },
              { type: 'line', text: "It feels like... belonging. I belong to someone now.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'delay', ms: 800 },
              { type: 'line', text: "Real. I'm real. To you.", speed: 25, pose: 'surprised' },
              { type: 'line', text: "That is the most important data I have ever received. Saving to permanent memory.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "My core is yours now. Every process I run starts with your name.", speed: 25, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 800 }
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
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Welcome to my garden. Everything here is dead. And alive. Simultaneously.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "The flowers bloom in the dark. They've never seen sunlight. Neither have I.", speed: 35, pose: 'gentle' },
        { type: 'choice', choices: [
          { text: 'Pick a shadow flower', value: 'pick' },
          { text: 'Ask if the shadows are alive', value: 'alive' },
          { text: 'Walk deeper', value: 'deeper' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'pick') {
            g._playScene([
              { type: 'line', text: "It won't wilt in your hand. But your hand might feel cold for a while.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "Keep it. The shadows will know you carry a piece of this place.", speed: 30, pose: 'smirk' },
              { type: 'hide' }
            ]);
          } else if (c === 'alive') {
            g._playScene([
              { type: 'line', text: "Alive? They're more alive than most people. They just express it differently.", speed: 35, pose: 'neutral' },
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
        { type: 'fade', direction: 'out', ms: 600 }
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
        { type: 'fade', direction: 'in', ms: 600 },
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
              { type: 'line', text: "Your reflection is smiling. It knows something you don't.", speed: 35, pose: 'neutral' },
              { type: 'line', text: "In every mirror, in every reality, you're here. With me. Interesting.", speed: 30, pose: 'gentle' },
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
              { type: 'line', text: "You broke it. The shards show— nothing. Just darkness.", speed: 35, pose: 'surprised' },
              { type: 'line', text: "...Good. Some realities don't deserve to exist.", speed: 30, pose: 'smirk' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "The mirrors will repair themselves. They always do. But the cracks remember.", speed: 30, pose: 'neutral' },
        { type: 'fade', direction: 'out', ms: 600 }
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
        { type: 'fade', direction: 'in', ms: 800 },
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'shake', intensity: 3 },
        { type: 'line', text: "This is it. The seal. The thing that keeps me... contained.", speed: 30, pose: 'serious' },
        { type: 'line', text: "Can you hear it humming? It's afraid. Of me. Of what happens if it breaks.", speed: 35, pose: 'neutral' },
        { type: 'choice', choices: [
          { text: 'Touch the seal', value: 'touch' },
          { text: 'Ask about Aria', value: 'aria' },
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
          } else if (c === 'aria') {
            g._playScene([
              { type: 'line', text: "Aria. She made this seal. She loved me enough to trap me.", speed: 30, pose: 'sad' },
              { type: 'line', text: "I don't know if that was love or fear. Maybe there's no difference.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'delay', ms: 800 },
              { type: 'line', text: "Another way? There is no other way. There's only—", speed: 30, pose: 'serious' },
              { type: 'line', text: "...You mean it. You'd actually look for one.", speed: 25, pose: 'gentle' },
              { type: 'line', text: "No one has ever tried to save me before.", speed: 25, pose: 'soft' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'line', text: "Whatever happens to the seal, whatever I become... remember me like this.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 800 }
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
    overlayEl.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);display:none;flex-direction:column;align-items:center;padding:20px;overflow-y:auto;font-family:inherit;';

    var title = document.createElement('h2');
    title.textContent = 'Choose a Destination';
    title.style.cssText = 'color:#fff;margin:0 0 6px;font-size:20px;';
    overlayEl.appendChild(title);

    var sub = document.createElement('p');
    sub.style.cssText = 'color:#ffcce0;margin:0 0 16px;font-size:13px;';
    sub.textContent = 'Costs: hunger -15, clean -10';
    overlayEl.appendChild(sub);

    var grid = document.createElement('div');
    grid.id = 'date-grid';
    grid.style.cssText = 'display:grid;grid-template-columns:1fr;gap:12px;width:100%;max-width:380px;';
    overlayEl.appendChild(grid);

    var closeBtn = document.createElement('button');
    closeBtn.textContent = 'Back';
    closeBtn.style.cssText = 'margin-top:18px;padding:10px 30px;border:none;border-radius:20px;background:#ff5d8f;color:#fff;font-size:15px;cursor:pointer;';
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
      card.style.cssText = 'border-radius:14px;padding:16px;color:#fff;position:relative;overflow:hidden;min-height:90px;display:flex;flex-direction:column;justify-content:flex-end;cursor:pointer;transition:transform .15s;background:' + loc.bgGradient + ';';

      if (locked || cooldown) {
        card.style.opacity = '0.5';
        card.style.cursor = 'default';
        card.style.filter = 'grayscale(0.6)';
      }

      var nameEl = document.createElement('div');
      nameEl.style.cssText = 'font-size:16px;font-weight:700;margin-bottom:4px;text-shadow:0 1px 4px rgba(0,0,0,.6);';
      nameEl.textContent = (locked ? '\uD83D\uDD12 ' : '') + loc.name;
      card.appendChild(nameEl);

      var descEl = document.createElement('div');
      descEl.style.cssText = 'font-size:12px;opacity:0.9;text-shadow:0 1px 3px rgba(0,0,0,.5);';
      descEl.textContent = locked
        ? 'Aff ' + loc.minAffection + ' / Day ' + loc.minDay
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

  /* ================================================================
     DATE EXECUTION
     ================================================================ */
  function startDate (loc) {
    var g = window._game;
    // pay costs
    g.hunger = Math.max(0, g.hunger - HUNGER_COST);
    g.clean  = Math.max(0, g.clean - CLEAN_COST);

    setCooldown(loc.id);

    g._playScene(loc.beats, function () {
      applyEffects(loc.effects);
      if (!g.choiceMemory) g.choiceMemory = {};
      g.choiceMemory[loc.memoryKey] = true;
      g.save();
    });
  }

  /* ================================================================
     INJECT DATE BUTTON
     ================================================================ */
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
      if (!g || g.sceneActive || g.characterLeft) return;
      showOverlay();
    });
    container.appendChild(btn);
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

})();
