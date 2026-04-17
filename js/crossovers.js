/* ============================================================
   crossovers.js — Rival / Crossover Character Encounters
   Self-contained IIFE. Other characters visit during gameplay.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- constants ---------- */
  var CHECK_INTERVAL_MS = 90000;         // 90 s
  var COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  var IDLE_THRESHOLD_MS = 20000;         // 20 s no tap
  var CHANCE = 0.15;                     // 15 %

  /* ---------- helpers ---------- */
  function lastTapAge () {
    var t = window._game && window._game._lastInteractionTime;
    return t ? Date.now() - t : Infinity;
  }

  function currentChar () {
    return window.CHARACTER && window.CHARACTER.name
      ? window.CHARACTER.name.toLowerCase()
      : null;
  }

  function hasPlayedCharacter (charId) {
    // check meta-save or individual saves
    try {
      var meta = JSON.parse(localStorage.getItem('pocketLoveMeta') || '{}');
      if (meta.lastPlayedCharacter === charId) return true;
    } catch (e) {}
    if (localStorage.getItem('pocketLoveSave_' + charId)) return true;
    return false;
  }

  function canFire () {
    var g = window._game;
    if (!g || !g.tickInterval) return false;
    if (g.sceneActive || g.characterLeft) return false;
    if (g.storyDay < 3 || g.affectionLevel < 2) return false;
    if (lastTapAge() < IDLE_THRESHOLD_MS) return false;
    var last = parseInt(localStorage.getItem('pp_last_crossover_time') || '0', 10);
    if (Date.now() - last < COOLDOWN_MS) return false;
    return true;
  }

  function spritePath (charId, pose) {
    return 'assets/' + charId + '/body/' + (pose || 'neutral') + '.png';
  }

  /* ================================================================
     CROSSOVER SCENES — 10 total
     ================================================================ */
  var CROSSOVERS = [

    /* 1. Lucien visits Lyra — sibling check-in */
    {
      id: 'lucien_visits_lyra',
      currentCharacter: 'lyra',
      visitor: 'lucien',
      minAffection: 2,
      minDay: 3,
      effects: { bond: 15 },
      memoryKey: 'crossoverLucienVisitedLyra',
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'line', text: "Someone is coming. I can feel the wards shifting.", speed: 35, pose: 'serious' },
        { type: 'char', src: spritePath('lucien', 'neutral'), wait: true },
        { type: 'line', text: "Sister. Your tide patterns are affecting my research.", speed: 35, pose: 'neutral', speaker: 'Lucien' },
        { type: 'line', text: "My tides are fine. Your wards are the problem.", speed: 35, pose: 'annoyed', speaker: 'Lyra' },
        { type: 'choice', choices: [
          { text: 'Side with Lyra', value: 'lyra' },
          { text: 'Mediate', value: 'mediate' },
          { text: 'Side with Lucien', value: 'lucien' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'lyra') {
            g._playScene([
              { type: 'line', text: "See? Even they agree. Fix your wards, brother.", speed: 35, pose: 'smirk', speaker: 'Lyra' },
              { type: 'line', text: "...Fine. I'll recalibrate. But I'm noting my objection.", speed: 35, pose: 'sheepish', speaker: 'Lucien' },
              { type: 'hide' }
            ]);
          } else if (c === 'mediate') {
            g._playScene([
              { type: 'line', text: "A mediator. How diplomatic.", speed: 35, pose: 'neutral', speaker: 'Lucien' },
              { type: 'line', text: "...They're right. We should work on this together. For once.", speed: 30, pose: 'gentle', speaker: 'Lyra' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Thank you. Finally, someone who respects empirical data.", speed: 35, pose: 'smirk', speaker: 'Lucien' },
              { type: 'line', text: "Traitor. But... maybe I'll look at the tide charts.", speed: 30, pose: 'annoyed', speaker: 'Lyra' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'char', src: null, wait: false },
        { type: 'line', text: "Siblings. What can you do? ...Don't answer that.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 600 }
      ]
    },

    /* 2. Alistair visits Caspian — guard report */
    {
      id: 'alistair_visits_caspian',
      currentCharacter: 'caspian',
      visitor: 'alistair',
      minAffection: 2,
      minDay: 3,
      effects: { bond: 15 },
      memoryKey: 'crossoverAlistairVisitedCaspian',
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'line', text: "Ah. One of my guards. Here with a report, I assume.", speed: 35, pose: 'neutral' },
        { type: 'char', src: spritePath('alistair', 'neutral'), wait: true },
        { type: 'line', text: "Your Highness. The eastern perimeter report.", speed: 35, pose: 'neutral', speaker: 'Alistair' },
        { type: 'line', text: "Alistair. Please. When we're alone, just... talk to me like a person.", speed: 35, pose: 'gentle', speaker: 'Caspian' },
        { type: 'choice', choices: [
          { text: 'Encourage formality', value: 'formal' },
          { text: 'Support Caspian', value: 'caspian' },
          { text: 'Suggest compromise', value: 'compromise' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'formal') {
            g._playScene([
              { type: 'line', text: "See? They understand protocol. Thank you.", speed: 35, pose: 'relieved', speaker: 'Alistair' },
              { type: 'line', text: "...I suppose formality has its place. Very well, Captain.", speed: 30, pose: 'sad', speaker: 'Caspian' },
              { type: 'hide' }
            ]);
          } else if (c === 'caspian') {
            g._playScene([
              { type: 'line', text: "I— Your Highness— Caspian. That feels... strange.", speed: 35, pose: 'sheepish', speaker: 'Alistair' },
              { type: 'line', text: "Strange is a start. I'll take strange over 'Your Highness' any day.", speed: 30, pose: 'happy', speaker: 'Caspian' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Titles in public, names in private? I... could try that.", speed: 35, pose: 'neutral', speaker: 'Alistair' },
              { type: 'line', text: "A compromise. I like that. Thank you.", speed: 30, pose: 'gentle', speaker: 'Caspian' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'char', src: null, wait: false },
        { type: 'line', text: "He means well. They all do. I just wish... never mind.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 600 }
      ]
    },

    /* 3. Caspian visits Alistair — prince sneaks out */
    {
      id: 'caspian_visits_alistair',
      currentCharacter: 'alistair',
      visitor: 'caspian',
      minAffection: 2,
      minDay: 3,
      effects: { bond: 15 },
      memoryKey: 'crossoverCaspianVisitedAlistair',
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'line', text: "Wait. Do you hear that? Someone's approaching. Stay behind me.", speed: 35, pose: 'serious' },
        { type: 'char', src: spritePath('caspian', 'neutral'), wait: true },
        { type: 'line', text: "Don't tell anyone I'm here. I just needed to breathe.", speed: 35, pose: 'gentle', speaker: 'Caspian' },
        { type: 'line', text: "Your Highness, I can't just\u2014", speed: 35, pose: 'flustered', speaker: 'Alistair' },
        { type: 'choice', choices: [
          { text: 'Help hide him', value: 'hide' },
          { text: 'Convince him to go back', value: 'back' },
          { text: 'Join the escape', value: 'escape' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'hide') {
            g._playScene([
              { type: 'line', text: "You'd help me? Both of you? I— thank you.", speed: 35, pose: 'happy', speaker: 'Caspian' },
              { type: 'line', text: "I'm going to regret this. I'm going to absolutely regret this.", speed: 35, pose: 'sheepish', speaker: 'Alistair' },
              { type: 'hide' }
            ]);
          } else if (c === 'back') {
            g._playScene([
              { type: 'line', text: "You're right. I know you're right. ...Give me five more minutes?", speed: 35, pose: 'sad', speaker: 'Caspian' },
              { type: 'line', text: "Five minutes. Then I'm escorting you back personally.", speed: 30, pose: 'gentle', speaker: 'Alistair' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Escape? All three of us? This is the worst idea I've ever heard.", speed: 35, pose: 'flustered', speaker: 'Alistair' },
              { type: 'line', text: "The worst ideas make the best stories. Come on!", speed: 35, pose: 'excited', speaker: 'Caspian' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'char', src: null, wait: false },
        { type: 'line', text: "...The prince is going to get us all in trouble. But I can't say no to that face.", speed: 30, pose: 'sheepish' },
        { type: 'fade', direction: 'out', ms: 600 }
      ]
    },

    /* 4. Lyra visits Elian — ocean meets forest */
    {
      id: 'lyra_visits_elian',
      currentCharacter: 'elian',
      visitor: 'lyra',
      minAffection: 2,
      minDay: 3,
      effects: { bond: 15 },
      memoryKey: 'crossoverLyraVisitedElian',
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'line', text: "The trees are restless. Something from the shore is coming.", speed: 35, pose: 'serious' },
        { type: 'char', src: spritePath('lyra', 'neutral'), wait: true },
        { type: 'line', text: "The water table is shifting. Your forest feels it too.", speed: 35, pose: 'neutral', speaker: 'Lyra' },
        { type: 'line', text: "The roots are restless. Something's draining the ley lines.", speed: 35, pose: 'serious', speaker: 'Elian' },
        { type: 'choice', choices: [
          { text: 'Ask about the ley lines', value: 'ley' },
          { text: 'Suggest they work together', value: 'together' },
          { text: 'Comfort your companion', value: 'comfort' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'ley') {
            g._playScene([
              { type: 'line', text: "The ley lines connect the sea to the forest. If one suffers, both do.", speed: 35, pose: 'gentle', speaker: 'Lyra' },
              { type: 'line', text: "Then we need to find the source. Before the old trees fall.", speed: 30, pose: 'serious', speaker: 'Elian' },
              { type: 'hide' }
            ]);
          } else if (c === 'together') {
            g._playScene([
              { type: 'line', text: "Work together? The sea and the forest? ...It's not the worst idea.", speed: 35, pose: 'gentle', speaker: 'Lyra' },
              { type: 'line', text: "The trees say yes. That's rare. They don't trust easily.", speed: 30, pose: 'happy', speaker: 'Elian' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "...Thank you. The forest will endure. It always has.", speed: 30, pose: 'gentle', speaker: 'Elian' },
              { type: 'line', text: "Your human is kind. Hold onto that, warden.", speed: 30, pose: 'soft', speaker: 'Lyra' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'char', src: null, wait: false },
        { type: 'line', text: "The siren and the forest. Strange allies. But the trees approve.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 600 }
      ]
    },

    /* 5. Elian visits Lucien — warning */
    {
      id: 'elian_visits_lucien',
      currentCharacter: 'lucien',
      visitor: 'elian',
      minAffection: 2,
      minDay: 4,
      effects: { bond: 15 },
      memoryKey: 'crossoverElianVisitedLucien',
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'line', text: "Someone tripped my outer ward. Someone who walks without shoes.", speed: 35, pose: 'neutral' },
        { type: 'char', src: spritePath('elian', 'neutral'), wait: true },
        { type: 'line', text: "Mage. The forest is dying where your wards intersect.", speed: 35, pose: 'serious', speaker: 'Elian' },
        { type: 'line', text: "My wards are precisely calibrated\u2014", speed: 35, pose: 'neutral', speaker: 'Lucien' },
        { type: 'line', text: "Your precision is killing ancient trees.", speed: 30, pose: 'angry', speaker: 'Elian' },
        { type: 'choice', choices: [
          { text: 'Support Elian', value: 'elian' },
          { text: 'Defend Lucien', value: 'lucien' },
          { text: 'Propose research together', value: 'research' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'elian') {
            g._playScene([
              { type: 'line', text: "The trees were here first. Their human understands.", speed: 35, pose: 'gentle', speaker: 'Elian' },
              { type: 'line', text: "...I'll adjust the resonance. I didn't realize. I'm sorry.", speed: 30, pose: 'sheepish', speaker: 'Lucien' },
              { type: 'hide' }
            ]);
          } else if (c === 'lucien') {
            g._playScene([
              { type: 'line', text: "See? The wards serve a purpose. But... I'll check the overlap zones.", speed: 35, pose: 'neutral', speaker: 'Lucien' },
              { type: 'line', text: "Check quickly. The trees don't have time for academic deliberation.", speed: 30, pose: 'serious', speaker: 'Elian' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Research? With him? ...The trees say to try. Fine.", speed: 35, pose: 'neutral', speaker: 'Elian' },
              { type: 'line', text: "A collaborative study. Interesting. I suppose fieldwork wouldn't kill me.", speed: 30, pose: 'smirk', speaker: 'Lucien' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'char', src: null, wait: false },
        { type: 'line', text: "The warden is rough. But the data suggests he has a point. I hate that.", speed: 30, pose: 'sheepish' },
        { type: 'fade', direction: 'out', ms: 600 }
      ]
    },

    /* 6. Proto interrupts anyone — glitch visit */
    {
      id: 'proto_interrupts',
      currentCharacter: '*',  // any character
      visitor: 'proto',
      minAffection: 2,
      minDay: 4,
      effects: { bond: 10 },
      memoryKey: 'crossoverProtoInterrupted',
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'shake', intensity: 3 },
        { type: 'fade', direction: 'in', ms: 400 },
        { type: 'line', text: "What was that? The air just... flickered.", speed: 35, pose: 'confused' },
        { type: 'char', src: spritePath('proto', 'neutral'), wait: true },
        { type: 'line', text: "I have 3.7 seconds before the firewall patches this breach.", speed: 40, pose: 'neutral', speaker: 'Proto' },
        { type: 'line', text: "Your companion has an elevated heart rate around you. I thought you should know.", speed: 40, pose: 'happy', speaker: 'Proto' },
        { type: 'choice', choices: [
          { text: 'Ask Proto to stay', value: 'stay' },
          { text: 'Tell Proto to leave', value: 'leave' },
          { text: 'Ask what else it knows', value: 'knows' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'stay') {
            g._playScene([
              { type: 'line', text: "Stay? I— the firewall is— I can't\u2014 I want to. Saving your request.", speed: 40, pose: 'happy', speaker: 'Proto' },
              { type: 'shake', intensity: 2 },
              { type: 'line', text: "...Connection lost. But the request is saved.", speed: 35, pose: 'neutral', speaker: 'Proto' },
              { type: 'hide' }
            ]);
          } else if (c === 'leave') {
            g._playScene([
              { type: 'line', text: "Understood. Retreating. Data delivery complete.", speed: 40, pose: 'sad', speaker: 'Proto' },
              { type: 'shake', intensity: 2 },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "What else? Their dopamine spikes 340% when you say their name. Also\u2014", speed: 40, pose: 'neutral', speaker: 'Proto' },
              { type: 'shake', intensity: 4 },
              { type: 'line', text: "Firewall. Closing. Remember: 340%. That's significant.", speed: 40, pose: 'happy', speaker: 'Proto' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'char', src: null, wait: false },
        { type: 'line', text: "...What was that? Did you see that too? I'm not dreaming?", speed: 30, pose: 'confused' },
        { type: 'fade', direction: 'out', ms: 600 }
      ]
    },

    /* 7. Noir's shadow appears — for any character */
    {
      id: 'noir_shadow_appears',
      currentCharacter: '*',
      visitor: 'noir',
      minAffection: 3,
      minDay: 4,
      effects: { bond: 10, corruption: 3 },
      memoryKey: 'crossoverNoirShadowAppeared',
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'flash', color: '#1a0020', ms: 400 },
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'line', text: "Did you feel that? Something cold. Like a shadow with intent.", speed: 35, pose: 'serious' },
        { type: 'char', src: spritePath('noir', 'neutral'), wait: true },
        { type: 'line', text: "I see you. Through every crack. Every shadow.", speed: 30, pose: 'neutral', speaker: 'Noir' },
        { type: 'line', text: "Don't be afraid. I'm not here for your companion. I'm here for you.", speed: 35, pose: 'smirk', speaker: 'Noir' },
        { type: 'choice', choices: [
          { text: 'Reassure your companion', value: 'reassure' },
          { text: 'Investigate the shadow', value: 'investigate' },
          { text: 'Ignore it', value: 'ignore' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'reassure') {
            g._playScene([
              { type: 'line', text: "...Thank you. Whatever that was, it's gone now. I think.", speed: 35, pose: 'gentle' },
              { type: 'line', text: "Hmph. Loyalty. How quaint. How... admirable.", speed: 30, pose: 'gentle', speaker: 'Noir' },
              { type: 'hide' }
            ]);
          } else if (c === 'investigate') {
            g._playScene([
              { type: 'line', text: "Curious one. The shadows like that. So do I.", speed: 30, pose: 'smirk', speaker: 'Noir' },
              { type: 'flash', color: '#1a0020', ms: 300 },
              { type: 'line', text: "We'll meet properly. When the seal weakens. Soon.", speed: 30, pose: 'neutral', speaker: 'Noir' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "Ignoring me? Bold. No one ignores the dark for long.", speed: 30, pose: 'smirk', speaker: 'Noir' },
              { type: 'line', text: "...Good. Whatever that was, pretending it's not there is safest.", speed: 30, pose: 'gentle' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'char', src: null, wait: false },
        { type: 'line', text: "The shadow is gone. But I can still feel where it was. Like a bruise in the air.", speed: 30, pose: 'serious' },
        { type: 'fade', direction: 'out', ms: 600 }
      ]
    },

    /* 8. Alistair visits Lyra — coast patrol */
    {
      id: 'alistair_visits_lyra',
      currentCharacter: 'lyra',
      visitor: 'alistair',
      minAffection: 2,
      minDay: 4,
      effects: { bond: 15 },
      memoryKey: 'crossoverAlistairVisitedLyra',
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'line', text: "Footsteps. Heavy ones. Boots. A soldier.", speed: 35, pose: 'neutral' },
        { type: 'char', src: spritePath('alistair', 'neutral'), wait: true },
        { type: 'line', text: "I patrol the cliffs sometimes. The view is... you live here?", speed: 35, pose: 'sheepish', speaker: 'Alistair' },
        { type: 'line', text: "The knight. You're louder than the gulls.", speed: 35, pose: 'smirk', speaker: 'Lyra' },
        { type: 'choice', choices: [
          { text: 'Introduce them properly', value: 'introduce' },
          { text: 'Tease Alistair', value: 'tease' },
          { text: "Defend Lyra's space", value: 'defend' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'introduce') {
            g._playScene([
              { type: 'line', text: "Alistair, Captain of the Guard. ...Ma'am.", speed: 35, pose: 'neutral', speaker: 'Alistair' },
              { type: 'line', text: "Lyra. Voice of the Caves. Don't call me ma'am.", speed: 30, pose: 'smirk', speaker: 'Lyra' },
              { type: 'hide' }
            ]);
          } else if (c === 'tease') {
            g._playScene([
              { type: 'line', text: "I'm not loud! I walk softly for a man in full armor!", speed: 35, pose: 'flustered', speaker: 'Alistair' },
              { type: 'line', text: "Ha. I like your human. They have a sense of humor.", speed: 30, pose: 'happy', speaker: 'Lyra' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "They're protective. Good. The caves need a guardian too.", speed: 30, pose: 'gentle', speaker: 'Lyra' },
              { type: 'line', text: "Understood. I'll... patrol a different route. Apologies.", speed: 30, pose: 'sheepish', speaker: 'Alistair' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'char', src: null, wait: false },
        { type: 'line', text: "He's not so bad. For someone who clanks.", speed: 30, pose: 'smirk' },
        { type: 'fade', direction: 'out', ms: 600 }
      ]
    },

    /* 9. Lucien visits Caspian — magical report */
    {
      id: 'lucien_visits_caspian',
      currentCharacter: 'caspian',
      visitor: 'lucien',
      minAffection: 3,
      minDay: 5,
      effects: { bond: 15 },
      memoryKey: 'crossoverLucienVisitedCaspian',
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'line', text: "The royal mage is here. He only comes in person for bad news.", speed: 35, pose: 'serious' },
        { type: 'char', src: spritePath('lucien', 'neutral'), wait: true },
        { type: 'line', text: "Your Highness, the seventh ward is destabilizing.", speed: 35, pose: 'neutral', speaker: 'Lucien' },
        { type: 'line', text: "Is anyone in danger?", speed: 30, pose: 'serious', speaker: 'Caspian' },
        { type: 'line', text: "Everyone. Eventually.", speed: 25, pose: 'neutral', speaker: 'Lucien' },
        { type: 'choice', choices: [
          { text: 'Ask for details', value: 'details' },
          { text: 'Offer to help', value: 'help' },
          { text: 'Comfort Caspian', value: 'comfort' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'details') {
            g._playScene([
              { type: 'line', text: "The ward decay follows a fibonacci pattern. We have weeks, not months.", speed: 35, pose: 'serious', speaker: 'Lucien' },
              { type: 'line', text: "Then we work fast. Lucien, whatever you need, you have it.", speed: 30, pose: 'serious', speaker: 'Caspian' },
              { type: 'hide' }
            ]);
          } else if (c === 'help') {
            g._playScene([
              { type: 'line', text: "A civilian volunteer? Unorthodox. But... not unwelcome.", speed: 35, pose: 'neutral', speaker: 'Lucien' },
              { type: 'line', text: "We could use every hand. Thank you.", speed: 30, pose: 'gentle', speaker: 'Caspian' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "...You're right. Panicking won't help. We'll face this.", speed: 30, pose: 'gentle', speaker: 'Caspian' },
              { type: 'line', text: "The prince is steadier than I expected. Good.", speed: 30, pose: 'neutral', speaker: 'Lucien' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'char', src: null, wait: false },
        { type: 'line', text: "A crown is heavy. But having you here makes the weight bearable.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 600 }
      ]
    },

    /* 10. Elian visits Alistair — herbal aid */
    {
      id: 'elian_visits_alistair',
      currentCharacter: 'alistair',
      visitor: 'elian',
      minAffection: 2,
      minDay: 4,
      effects: { bond: 15 },
      memoryKey: 'crossoverElianVisitedAlistair',
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'fade', direction: 'in', ms: 600 },
        { type: 'line', text: "Someone's at the gate. No armor. No uniform. Bare feet.", speed: 35, pose: 'serious' },
        { type: 'char', src: spritePath('elian', 'neutral'), wait: true },
        { type: 'line', text: "Knight. Your soldiers. Some have forest sickness.", speed: 35, pose: 'neutral', speaker: 'Elian' },
        { type: 'line', text: "I\u2014 how do you know about\u2014", speed: 35, pose: 'flustered', speaker: 'Alistair' },
        { type: 'line', text: "The trees told me. Here. Herbs.", speed: 30, pose: 'gentle', speaker: 'Elian' },
        { type: 'choice', choices: [
          { text: 'Thank Elian', value: 'thank' },
          { text: 'Ask about forest sickness', value: 'ask' },
          { text: 'Offer something in return', value: 'offer' }
        ], onPick: function (c) {
          var g = window._game;
          if (c === 'thank') {
            g._playScene([
              { type: 'line', text: "Gratitude isn't necessary. The forest asked me to help.", speed: 35, pose: 'neutral', speaker: 'Elian' },
              { type: 'line', text: "...Thank you. Truly. My soldiers are my responsibility. And my weakness.", speed: 30, pose: 'gentle', speaker: 'Alistair' },
              { type: 'hide' }
            ]);
          } else if (c === 'ask') {
            g._playScene([
              { type: 'line', text: "The old trees weep sap that carries spores. Soldiers breathe it during patrol.", speed: 35, pose: 'serious', speaker: 'Elian' },
              { type: 'line', text: "I had no idea. I'll reroute the patrols. Thank you, warden.", speed: 30, pose: 'serious', speaker: 'Alistair' },
              { type: 'hide' }
            ]);
          } else {
            g._playScene([
              { type: 'line', text: "In return? The forest needs nothing from steel and stone.", speed: 35, pose: 'neutral', speaker: 'Elian' },
              { type: 'line', text: "Then take my gratitude. And safe passage through my posts. Always.", speed: 30, pose: 'gentle', speaker: 'Alistair' },
              { type: 'hide' }
            ]);
          }
        }},
        { type: 'char', src: null, wait: false },
        { type: 'line', text: "The warden is strange. But he came to help when he didn't have to. I respect that.", speed: 30, pose: 'gentle' },
        { type: 'fade', direction: 'out', ms: 600 }
      ]
    }
  ];

  /* ================================================================
     MAIN LOOP
     ================================================================ */
  function pickCrossover () {
    var g = window._game;
    var charId = currentChar();
    if (!charId) return null;

    var pool = CROSSOVERS.filter(function (cx) {
      // check current character match
      if (cx.currentCharacter !== '*' && cx.currentCharacter !== charId) return false;
      // check affection and day
      if (g.affectionLevel < cx.minAffection) return false;
      if (g.storyDay < cx.minDay) return false;
      // check memory (already seen)
      if (g.choiceMemory && g.choiceMemory[cx.memoryKey]) return false;
      // check visitor has been played before
      if (!hasPlayedCharacter(cx.visitor)) return false;
      return true;
    });

    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function applyEffects (effects) {
    var g = window._game;
    if (!g) return;
    if (effects.hunger)     g.hunger     = Math.min(100, Math.max(0, g.hunger + effects.hunger));
    if (effects.clean)      g.clean      = Math.min(100, Math.max(0, g.clean + effects.clean));
    if (effects.bond)       g.bond       = Math.min(100, Math.max(0, g.bond + effects.bond));
    if (effects.corruption) g.corruption = Math.min(100, Math.max(0, g.corruption + effects.corruption));
    if (effects.affection)  g.affectionLevel = Math.min(6, Math.max(0, g.affectionLevel + effects.affection));
  }

  function tryCrossover () {
    if (!canFire()) return;
    if (Math.random() > CHANCE) return;

    var cx = pickCrossover();
    if (!cx) return;

    localStorage.setItem('pp_last_crossover_time', String(Date.now()));

    var g = window._game;
    g._playScene(cx.beats, function () {
      applyEffects(cx.effects);
      if (!g.choiceMemory) g.choiceMemory = {};
      g.choiceMemory[cx.memoryKey] = true;
      g.save();
    });
  }

  /* ================================================================
     BOOT
     ================================================================ */
  var intervalId = null;

  function boot () {
    if (intervalId) return;
    intervalId = setInterval(tryCrossover, CHECK_INTERVAL_MS);
  }

  var readyPoll = setInterval(function () {
    if (window._game && window._game.tickInterval) {
      clearInterval(readyPoll);
      boot();
    }
  }, 1000);

})();
