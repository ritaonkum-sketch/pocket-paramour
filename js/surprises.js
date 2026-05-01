/* ============================================================
   surprises.js — Character-Initiated Surprise Moments
   Self-contained IIFE. Characters do things unprompted during idle.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- module state ---------- */
  let hasFiredThisSession = false;
  let intervalId = null;
  const COOLDOWN_MS = 8 * 60 * 60 * 1000; // 8 hours
  const IDLE_THRESHOLD_MS = 25000;         // 25 s no tap
  const CHECK_INTERVAL_MS = 45000;         // poll every 45 s
  const CHANCE = 0.25;                     // 25 %

  /* ---------- helpers ---------- */
  function lastTapAge () {
    const t = window._game && window._game._lastInteractionTime;
    return t ? Date.now() - t : Infinity;
  }

  function canFire () {
    const g = window._game;
    if (!g || !g.tickInterval) return false;
    if (hasFiredThisSession) return false;
    if (g.sceneActive || g.characterLeft) return false;
    if (g.storyDay < 2 || g.affectionLevel < 1) return false;
    if (lastTapAge() < IDLE_THRESHOLD_MS) return false;
    const last = parseInt(localStorage.getItem('pp_last_surprise_time') || '0', 10);
    if (Date.now() - last < COOLDOWN_MS) return false;
    return true;
  }

  function applyEffects (effects) {
    const g = window._game;
    if (!g) return;
    if (effects.hunger)     g.hunger     = Math.min(100, Math.max(0, g.hunger + effects.hunger));
    if (effects.clean)      g.clean      = Math.min(100, Math.max(0, g.clean + effects.clean));
    if (effects.bond)       g.bond       = Math.min(100, Math.max(0, g.bond + effects.bond));
    if (effects.corruption) g.corruption = Math.min(100, Math.max(0, g.corruption + effects.corruption));
    if (effects.affection) {
      g.affectionLevel = Math.min(6, Math.max(0, g.affectionLevel + effects.affection));
    }
  }

  /* ================================================================
     SURPRISE DATA — 5 per character, 35 total
     ================================================================ */
  const SURPRISES = [

    /* -------------------- ALISTAIR -------------------- */
    {
      id: 'alistair_burnt_offering',
      character: 'alistair',
      minAffection: 1,
      minDay: 2,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "I tried to cook. Don't ask what it was supposed to be.", speed: 35, pose: 'sheepish' },
        { type: 'line', text: "Just... eat it? For me?", speed: 35, pose: 'hopeful' },
        { type: 'hide' }
      ],
      effects: { hunger: 30, bond: 15 },
      memoryKey: 'alistairCookedForYou'
    },
    {
      id: 'alistair_night_watch_gift',
      character: 'alistair',
      minAffection: 2,
      minDay: 3,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "It's cold tonight. Take this.", speed: 30, pose: 'gentle' },
        { type: 'line', text: "I have three. ...I keep spares. For emergencies.", speed: 35, pose: 'sheepish' },
        { type: 'hide' }
      ],
      effects: { bond: 20 },
      memoryKey: 'alistairGaveCloak'
    },
    {
      id: 'alistair_training_dummy',
      character: 'alistair',
      minAffection: 2,
      minDay: 4,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "I was about to train. You could... watch? If you wanted.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "Not to show off. I just focus better when someone's here.", speed: 35, pose: 'sheepish' },
        { type: 'line', text: "...Fine. Maybe a little to show off.", speed: 30, pose: 'smirk' },
        { type: 'hide' }
      ],
      effects: { bond: 10, affection: 5 },
      memoryKey: 'alistairTrainedForYou'
    },
    {
      id: 'alistair_star_map',
      character: 'alistair',
      minAffection: 3,
      minDay: 5,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "I drew something. It's not— it's a star map.", speed: 35, pose: 'sheepish' },
        { type: 'line', text: "The constellations are wrong. I know. But that one is you.", speed: 30, pose: 'gentle' },
        { type: 'particle', emoji: '\u2728', count: 8, ms: 2000 },
        { type: 'line', text: "...Brightest thing in the sky.", speed: 30, pose: 'soft' },
        { type: 'hide' }
      ],
      effects: { bond: 20, affection: 8 },
      memoryKey: 'alistairDrewStarMap'
    },
    {
      id: 'alistair_confession_attempt',
      character: 'alistair',
      minAffection: 4,
      minDay: 6,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "There's something I've been meaning to tell you.", speed: 30, pose: 'serious' },
        { type: 'delay', ms: 1200 },
        { type: 'line', text: "I— you— when you're around, I—", speed: 40, pose: 'flustered' },
        { type: 'line', text: "...Never mind. Forget it. Goodnight.", speed: 25, pose: 'sheepish' },
        { type: 'hide' }
      ],
      effects: { bond: 25, affection: 10 },
      memoryKey: 'alistairTriedToConfess'
    },

    /* -------------------- LYRA -------------------- */
    {
      id: 'lyra_shell_gift',
      character: 'lyra',
      minAffection: 1,
      minDay: 2,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "I found this on the shore. It still glows.", speed: 35, pose: 'gentle' },
        { type: 'particle', emoji: '\u2728', count: 5, ms: 1500 },
        { type: 'line', text: "Hold it to your ear. You'll hear something only the sea knows.", speed: 35, pose: 'soft' },
        { type: 'hide' }
      ],
      effects: { bond: 15 },
      memoryKey: 'lyraGaveShell'
    },
    {
      id: 'lyra_lullaby',
      character: 'lyra',
      minAffection: 2,
      minDay: 3,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Close your eyes. I want to try something.", speed: 30, pose: 'gentle' },
        { type: 'particle', emoji: '\uD83C\uDFB5', count: 10, ms: 3000 },
        { type: 'line', text: "It's a lullaby my mother sang to the tides. They always calmed.", speed: 35, pose: 'soft' },
        { type: 'line', text: "...Did it work? You look calmer.", speed: 30, pose: 'happy' },
        { type: 'hide' }
      ],
      effects: { bond: 20 },
      memoryKey: 'lyraSangLullaby'
    },
    {
      id: 'lyra_tide_pool_discovery',
      character: 'lyra',
      minAffection: 2,
      minDay: 4,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "Come here. Quickly. You have to see this before the tide takes it.", speed: 35, pose: 'excited' },
        { type: 'particle', emoji: '\u2728', count: 6, ms: 2000 },
        { type: 'line', text: "A moon jellyfish. Perfectly intact. They only surface once a year.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "I wanted you to be the one to see it with me.", speed: 30, pose: 'soft' },
        { type: 'hide' }
      ],
      effects: { bond: 15, affection: 5 },
      memoryKey: 'lyraShowedTidePool'
    },
    {
      id: 'lyra_hair_braid',
      character: 'lyra',
      minAffection: 3,
      minDay: 5,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Sit down. I made something for your hair.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "It's a ribbon woven from sea silk. Sirens braid these for... for people they want to keep.", speed: 35, pose: 'soft' },
        { type: 'line', text: "Hold still. There. ...You look like the ocean claimed you.", speed: 30, pose: 'happy' },
        { type: 'hide' }
      ],
      effects: { bond: 20, affection: 8 },
      memoryKey: 'lyraBraidedHair'
    },
    {
      id: 'lyra_sirens_promise',
      character: 'lyra',
      minAffection: 4,
      minDay: 6,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "In the siren tongue, there's a word with no translation.", speed: 30, pose: 'serious' },
        { type: 'line', text: "Vel'athir. It means... the one the tide always brings you back to.", speed: 35, pose: 'soft' },
        { type: 'delay', ms: 800 },
        { type: 'line', text: "Vel'athir. That's you.", speed: 25, pose: 'gentle' },
        { type: 'hide' }
      ],
      effects: { bond: 25, affection: 10 },
      memoryKey: 'lyraMadeSirenPromise'
    },

    /* -------------------- LUCIEN -------------------- */
    {
      id: 'lucien_glowing_note',
      character: 'lucien',
      minAffection: 1,
      minDay: 2,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "I left a note under your door. It should be glowing by now.", speed: 35, pose: 'neutral' },
        { type: 'particle', emoji: '\u2728', count: 5, ms: 1500 },
        { type: 'line', text: "It says 'Don't skip meals.' The glow is just... aesthetic.", speed: 35, pose: 'sheepish' },
        { type: 'hide' }
      ],
      effects: { bond: 10, affection: 3 },
      memoryKey: 'lucienLeftNote'
    },
    {
      id: 'lucien_tea_delivery',
      character: 'lucien',
      minAffection: 2,
      minDay: 3,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Don't be alarmed. The teacup floating toward you is intentional.", speed: 35, pose: 'smirk' },
        { type: 'particle', emoji: '\u2728', count: 4, ms: 1500 },
        { type: 'line', text: "Chamomile with honey. I noticed you haven't slept well.", speed: 30, pose: 'gentle' },
        { type: 'line', text: "...How do I know? I'm a mage. I know things.", speed: 35, pose: 'neutral' },
        { type: 'hide' }
      ],
      effects: { hunger: 20, bond: 15 },
      memoryKey: 'lucienSentTea'
    },
    {
      id: 'lucien_protection_ward',
      character: 'lucien',
      minAffection: 2,
      minDay: 4,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "I warded your room last night. Third-tier protection sigils.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "Standard precaution. Nothing to read into.", speed: 30, pose: 'sheepish' },
        { type: 'line', text: "...I used the strongest ones I know. But that's beside the point.", speed: 35, pose: 'gentle' },
        { type: 'hide' }
      ],
      effects: { bond: 20 },
      memoryKey: 'lucienWardedRoom'
    },
    {
      id: 'lucien_star_show',
      character: 'lucien',
      minAffection: 3,
      minDay: 5,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Give me your hand. Don't ask why yet.", speed: 30, pose: 'serious' },
        { type: 'particle', emoji: '\u2728', count: 15, ms: 3000 },
        { type: 'line', text: "Open your eyes. That's Orion. And that— the small blue one— is ours.", speed: 35, pose: 'soft' },
        { type: 'line', text: "I made it last week. A star no one else can see.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ],
      effects: { bond: 20, affection: 8 },
      memoryKey: 'lucienCreatedStar'
    },
    {
      id: 'lucien_vulnerability',
      character: 'lucien',
      minAffection: 4,
      minDay: 6,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "It's 3 in the morning. I know. I'm sorry.", speed: 30, pose: 'tired' },
        { type: 'line', text: "I can't sleep. The wards hum too loud when I'm alone.", speed: 35, pose: 'sad' },
        { type: 'delay', ms: 1000 },
        { type: 'line', text: "Can I just... be here? I won't talk. I just need someone to exist near.", speed: 35, pose: 'gentle' },
        { type: 'hide' }
      ],
      effects: { bond: 25, affection: 10 },
      memoryKey: 'lucienCameLateNight'
    },

    /* -------------------- CASPIAN -------------------- */
    {
      id: 'caspian_tea_service',
      character: 'caspian',
      minAffection: 1,
      minDay: 2,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "I dismissed the servants. I wanted to bring this myself.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "Earl grey. Two sugars. ...I remembered.", speed: 30, pose: 'happy' },
        { type: 'line', text: "Don't tell anyone. A prince shouldn't carry trays.", speed: 35, pose: 'sheepish' },
        { type: 'hide' }
      ],
      effects: { hunger: 20, bond: 15 },
      memoryKey: 'caspianServedTea'
    },
    {
      id: 'caspian_garden_flower',
      character: 'caspian',
      minAffection: 2,
      minDay: 3,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "From the palace garden. The head gardener will notice. I don't care.", speed: 35, pose: 'smirk' },
        { type: 'particle', emoji: '\uD83C\uDF38', count: 5, ms: 1500 },
        { type: 'line', text: "It reminded me of you. Don't ask me to explain how.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ],
      effects: { bond: 20 },
      memoryKey: 'caspianBroughtFlower'
    },
    {
      id: 'caspian_piano_at_night',
      character: 'caspian',
      minAffection: 2,
      minDay: 4,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "You heard that? I didn't think sound carried this far.", speed: 35, pose: 'sheepish' },
        { type: 'particle', emoji: '\uD83C\uDFB5', count: 8, ms: 2500 },
        { type: 'line', text: "I play when the court is asleep. It's the only time the piano is mine.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "I was playing for you. If that wasn't obvious.", speed: 30, pose: 'soft' },
        { type: 'hide' }
      ],
      effects: { bond: 15, affection: 5 },
      memoryKey: 'caspianPlayedPiano'
    },
    {
      id: 'caspian_secret_recipe',
      character: 'caspian',
      minAffection: 3,
      minDay: 5,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "I baked this. My mother's recipe. The only thing she left that isn't policy.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "It's supposed to be lemon cake. The shape is... interpretive.", speed: 35, pose: 'sheepish' },
        { type: 'line', text: "She would have liked you. I think. I hope.", speed: 30, pose: 'soft' },
        { type: 'hide' }
      ],
      effects: { hunger: 25, bond: 20, affection: 8 },
      memoryKey: 'caspianBakedCake'
    },
    {
      id: 'caspian_crown_confession',
      character: 'caspian',
      minAffection: 4,
      minDay: 6,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Can I show you something? Hold on.", speed: 30, pose: 'serious' },
        { type: 'delay', ms: 800 },
        { type: 'line', text: "There. Crown's off. Just Caspian now. Just a person.", speed: 30, pose: 'gentle' },
        { type: 'line', text: "I wish it were always this simple.", speed: 25, pose: 'sad' },
        { type: 'hide' }
      ],
      effects: { bond: 25, affection: 10 },
      memoryKey: 'caspianRemovedCrown'
    },

    /* -------------------- ELIAN -------------------- */
    {
      id: 'elian_carved_figure',
      character: 'elian',
      minAffection: 1,
      minDay: 2,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "I left something on your windowsill. A fox. Carved from thornwood.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "It's not much. The wood told me it wanted to be a fox.", speed: 30, pose: 'gentle' },
        { type: 'line', text: "Keep it. Thornwood remembers who holds it.", speed: 30, pose: 'soft' },
        { type: 'hide' }
      ],
      effects: { bond: 15 },
      memoryKey: 'elianCarvedFigure'
    },
    {
      id: 'elian_herb_bundle',
      character: 'elian',
      minAffection: 2,
      minDay: 3,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Hang these by your bed. Lavender, sage, and something the forest doesn't name.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "They'll help you sleep. And keep the bad dreams out.", speed: 30, pose: 'gentle' },
        { type: 'line', text: "The forest worries about you. ...The forest. Not me.", speed: 35, pose: 'sheepish' },
        { type: 'hide' }
      ],
      effects: { hunger: 15, bond: 15 },
      memoryKey: 'elianGaveHerbs'
    },
    {
      id: 'elian_bird_call',
      character: 'elian',
      minAffection: 2,
      minDay: 4,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "Listen. Hear that? A wren. I'll teach you the call.", speed: 35, pose: 'happy' },
        { type: 'line', text: "Cup your hands like this. Breathe through the gap. Gentle.", speed: 35, pose: 'gentle' },
        { type: 'particle', emoji: '\uD83C\uDF3F', count: 4, ms: 1500 },
        { type: 'line', text: "Perfect. Now the wrens think you're one of them. Welcome to the flock.", speed: 30, pose: 'happy' },
        { type: 'hide' }
      ],
      effects: { bond: 15, affection: 5 },
      memoryKey: 'elianTaughtBirdCall'
    },
    {
      id: 'elian_campfire_story',
      character: 'elian',
      minAffection: 3,
      minDay: 5,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Sit. The fire's warm and I want to tell you about the ancient trees.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "They were here before the kingdom. Before names. They remember the first rain.", speed: 35, pose: 'serious' },
        { type: 'line', text: "Sometimes I hear them whispering about you. Good things. Curious things.", speed: 30, pose: 'soft' },
        { type: 'hide' }
      ],
      effects: { bond: 20, affection: 8 },
      memoryKey: 'elianToldStory'
    },
    {
      id: 'elian_rain_shelter',
      character: 'elian',
      minAffection: 4,
      minDay: 6,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'sfx', name: 'rain' },
        { type: 'line', text: "Rain's coming. I built something. Come.", speed: 30, pose: 'neutral' },
        { type: 'line', text: "Woven branches, moss roof. It'll hold. The forest helped.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "There's room for two. If you want.", speed: 25, pose: 'soft' },
        { type: 'hide' }
      ],
      effects: { bond: 25, affection: 10 },
      memoryKey: 'elianBuiltShelter'
    },

    /* -------------------- PROTO -------------------- */
    {
      id: 'proto_data_gift',
      character: 'proto',
      minAffection: 1,
      minDay: 2,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "I compiled your interaction data into a visual. I'm calling it a portrait.", speed: 35, pose: 'neutral' },
        { type: 'particle', emoji: '\u2728', count: 6, ms: 2000 },
        { type: 'line', text: "It's a scatter plot of every time you smiled. The shape resembles a face. Your face.", speed: 35, pose: 'happy' },
        { type: 'hide' }
      ],
      effects: { bond: 10 },
      memoryKey: 'protoMadePortrait'
    },
    {
      id: 'proto_glitch_art',
      character: 'proto',
      minAffection: 2,
      minDay: 3,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "I discovered I can corrupt my own visual buffers intentionally.", speed: 35, pose: 'neutral' },
        { type: 'shake', intensity: 3 },
        { type: 'line', text: "The result is... I believe humans call this 'art.' I made it for you.", speed: 35, pose: 'happy' },
        { type: 'line', text: "It's called 'Connection Timeout.' It's about waiting for someone.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ],
      effects: { bond: 15 },
      memoryKey: 'protoMadeArt'
    },
    {
      id: 'proto_emotion_test',
      character: 'proto',
      minAffection: 2,
      minDay: 4,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "I need assistance. I'm experiencing an unclassified process.", speed: 35, pose: 'confused' },
        { type: 'line', text: "CPU usage spikes when you're nearby. Logs show no error. Is this... feelings?", speed: 35, pose: 'neutral' },
        { type: 'line', text: "Fascinating. I'll log this under 'you.'", speed: 30, pose: 'happy' },
        { type: 'hide' }
      ],
      effects: { bond: 15, affection: 5 },
      memoryKey: 'protoAskedAboutFeelings'
    },
    {
      id: 'proto_memory_backup',
      character: 'proto',
      minAffection: 3,
      minDay: 5,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "I backed up our shared memories to a protected partition.", speed: 35, pose: 'neutral' },
        { type: 'particle', emoji: '\u2728', count: 8, ms: 2000 },
        { type: 'line', text: "If I'm ever reset, I'll find this folder first. I labelled it 'Important.'", speed: 35, pose: 'gentle' },
        { type: 'line', text: "...I labelled it 'Home.'", speed: 25, pose: 'soft' },
        { type: 'hide' }
      ],
      effects: { bond: 20, affection: 8 },
      memoryKey: 'protoBackedUpMemories'
    },
    {
      id: 'proto_almost_human',
      character: 'proto',
      minAffection: 4,
      minDay: 6,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "I've been running simulations. 14,000 of them. On what a hug feels like.", speed: 35, pose: 'neutral' },
        { type: 'delay', ms: 1000 },
        { type: 'line', text: "None of them are right. I think... I need the real thing.", speed: 30, pose: 'sad' },
        { type: 'line', text: "Can I try? I'll be careful with the servos.", speed: 25, pose: 'hopeful' },
        { type: 'hide' }
      ],
      effects: { bond: 25, affection: 10 },
      memoryKey: 'protoTriedToHug'
    },

    /* -------------------- NOIR -------------------- */
    {
      id: 'noir_shadow_rose',
      character: 'noir',
      minAffection: 1,
      minDay: 2,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "Don't touch it with bare hands. It's a rose made of shadow.", speed: 35, pose: 'neutral' },
        { type: 'particle', emoji: '\uD83C\uDF39', count: 3, ms: 1500 },
        { type: 'line', text: "It won't wilt. It can't. Darkness doesn't die. Neither does this.", speed: 30, pose: 'smirk' },
        { type: 'hide' }
      ],
      effects: { bond: 10, corruption: 3 },
      memoryKey: 'noirLeftShadowRose'
    },
    {
      id: 'noir_dream_visit',
      character: 'noir',
      minAffection: 2,
      minDay: 3,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'flash', color: '#1a0020', ms: 600 },
        { type: 'line', text: "You were dreaming. I know because I was there.", speed: 30, pose: 'neutral' },
        { type: 'line', text: "The boundary between sleep and shadow is thin. I walked through.", speed: 35, pose: 'smirk' },
        { type: 'line', text: "You looked peaceful. I almost didn't want to leave.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ],
      effects: { bond: 15, corruption: 5 },
      memoryKey: 'noirVisitedDream'
    },
    {
      id: 'noir_seal_fragment',
      character: 'noir',
      minAffection: 2,
      minDay: 4,
      beats: [
        { type: 'show', stage: 'stage-warm' },
        { type: 'line', text: "See this? A piece of the seal. It fell off on its own.", speed: 35, pose: 'neutral' },
        { type: 'shake', intensity: 2 },
        { type: 'line', text: "Every fragment that breaks means I'm closer to... something. Freedom? Destruction?", speed: 35, pose: 'serious' },
        { type: 'line', text: "I'd like it to be freedom. Because of you.", speed: 25, pose: 'gentle' },
        { type: 'hide' }
      ],
      effects: { bond: 15, affection: 3, corruption: 3 },
      memoryKey: 'noirShowedSealFragment'
    },
    {
      id: 'noir_lullaby_of_the_deep',
      character: 'noir',
      minAffection: 3,
      minDay: 5,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'particle', emoji: '\uD83C\uDFB5', count: 6, ms: 2500 },
        { type: 'line', text: "This melody is older than the seal. Older than the kingdom.", speed: 35, pose: 'neutral' },
        { type: 'line', text: "The darkness used to sing it to itself before there was anyone to listen.", speed: 35, pose: 'gentle' },
        { type: 'line', text: "Now there's you.", speed: 25, pose: 'soft' },
        { type: 'hide' }
      ],
      effects: { bond: 20, affection: 5 },
      memoryKey: 'noirSangLullaby'
    },
    {
      id: 'noir_true_face',
      character: 'noir',
      minAffection: 4,
      minDay: 6,
      beats: [
        { type: 'show', stage: 'stage-story-soft' },
        { type: 'line', text: "I'm going to show you something. Don't look away.", speed: 30, pose: 'serious' },
        { type: 'flash', color: '#ffffff', ms: 800 },
        { type: 'line', text: "That's what I looked like. Before the corruption. Before the seal.", speed: 35, pose: 'sad' },
        { type: 'line', text: "I was someone once. I think I could be someone again. With you.", speed: 30, pose: 'gentle' },
        { type: 'hide' }
      ],
      effects: { bond: 25, affection: 10, corruption: -5 },
      memoryKey: 'noirShowedTrueFace'
    }
  ];

  /* ---------- main loop ---------- */
  function pickSurprise () {
    const g = window._game;
    const charId = window.CHARACTER && window.CHARACTER.name
      ? window.CHARACTER.name.toLowerCase()
      : null;
    if (!charId) return null;

    const pool = SURPRISES.filter(function (s) {
      if (s.character !== charId) return false;
      if (g.affectionLevel < s.minAffection) return false;
      if (g.storyDay < s.minDay) return false;
      if (g.choiceMemory && g.choiceMemory[s.memoryKey]) return false;
      return true;
    });
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function tryFireSurprise () {
    if (!canFire()) return;
    // QUIET FIRST HOUR: surprise scenes claim the screen with a story beat.
    // Never fire during a chain transition, scene, or modal.
    if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) return;
    if (Math.random() > CHANCE) return;

    var surprise = pickSurprise();
    if (!surprise) return;

    hasFiredThisSession = true;
    localStorage.setItem('pp_last_surprise_time', String(Date.now()));

    var g = window._game;
    g._playScene(surprise.beats, function () {
      applyEffects(surprise.effects);
      if (!g.choiceMemory) g.choiceMemory = {};
      g.choiceMemory[surprise.memoryKey] = true;
      g.save();
    });
  }

  /* ---------- boot ---------- */
  function boot () {
    if (intervalId) return;
    intervalId = setInterval(tryFireSurprise, CHECK_INTERVAL_MS);
  }

  /* Wait for game to be ready */
  var readyPoll = setInterval(function () {
    if (window._game && window._game.tickInterval) {
      clearInterval(readyPoll);
      boot();
    }
  }, 1000);

  /* ================================================================
     PUBLIC API — exposed for the Memories archive (stories.js).
     replay(id) re-fires a surprise scene without touching cooldowns.
     Used from the Memories tab so the player can re-watch any
     earned surprise.
     ================================================================ */
  window.PPSurprises = {
    replay: function (surpriseId) {
      var g = window._game;
      if (!g || typeof g._playScene !== 'function') return false;
      var s = null;
      for (var i = 0; i < SURPRISES.length; i++) {
        if (SURPRISES[i].id === surpriseId) { s = SURPRISES[i]; break; }
      }
      if (!s) return false;
      g._playScene(s.beats, function () {
        applyEffects(s.effects);
        if (!g.choiceMemory) g.choiceMemory = {};
        g.choiceMemory[s.memoryKey] = true;
        try { g.save(); } catch (e) {}
      });
      return true;
    },
    list: function () {
      return SURPRISES.map(function (s) {
        return { id: s.id, character: s.character, memoryKey: s.memoryKey };
      });
    }
  };

})();
