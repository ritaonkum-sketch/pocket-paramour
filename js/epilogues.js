/* epilogues.js. PER-ROUTE character endings (v2 architecture)
 * ============================================================================
 * DESIGN CHANGE FROM v1:
 *   v1 required Ch 8 (main-story finale) to complete, then branched on
 *   pp_finale_choice. That coupled character endings to a main-story
 *   climax the game does not need to have yet.owner intent is
 *   "Love and Deep Space style": the main story stays live-service
 *   open-ended, and character routes are where the emotional payoff
 *   happens.
 *
 * v2 ARCHITECTURE:
 *   Each character has 3 ROUTE-SPECIFIC endings keyed to THEIR OWN
 *   decisions.their turning-point choice, their rescue choice,
 *   their crossover completions. No dependency on a main-story
 *   finale. The kingdom is a LIVING BACKDROP; the character arc is
 *   the closed loop.
 *
 *   Each ending fires when all conditions for that specific branch
 *   are true AND the player opens the character's Main Story
 *   page / character select. Ordered by affection so the character
 *   loved most speaks first.
 *
 *   WEAVER'S COURT champion thread: if the player chose THIS
 *   character as their Weaver's Court champion (pp_weaver_champion),
 *   one extra beat is appended to their ending acknowledging the
 *   choice. Small thread, huge emotional value.
 *
 * ROUTING PER CHARACTER:
 *   Alistair: high bond => 'oath_broken' | TP='go' => 'letters' | TP='stay' => 'watch'
 *   Elian:   rescue='leave' + high bond => 'walked_out' | TP='carve' => 'rowan' | else => 'kept_her'
 *   Lyra:    lucien-crossover seen => 'family_found' | TP='refuse' => 'sovereign' | TP='answer' => 'bound'
 *   Caspian: high bond => 'abdicated' | TP='yes' => 'court' | TP='no' => 'private'
 *   Lucien:  aenor-crossover + high bond => 'published' | TP='stop' => 'tea' | TP='let' => 'drawer'
 *   Noir:    very-high bond => 'corvin_restored' | TP='yes' => 'bonded' | TP='no' => 'patient'
 *   Proto:   high bond => 'manifest' | TP='keep' => 'background' | TP='erase' => 'quiet'
 *
 * SAFETY CONTRACT:
 *   Additive. Feature-flagged on pp_main_story_enabled. Writes only
 *   its own seen flags. Never mutates other state. Backward-compatible
 *   debug hooks preserved.
 * ============================================================================ */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const CHARS = ['alistair','elian','lyra','caspian','lucien','noir','proto'];

  // --- Helpers ------------------------------------------------------------
  function isEnabled() { try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; } }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  // Mutex with endings.js (May 2026): a character can have ONE finale,
  // not both an epilogue and an ending. Both systems check both flags so
  // whichever fires first wins, and the other system silently steps aside.
  function epilogueSeen(c) {
    try {
      return lsGet('pp_epi_seen_' + c) === '1' || lsGet('pp_ending_seen_' + c) === '1';
    } catch (e) { return true; }
  }
  function markEpilogueSeen(c) {
    try {
      localStorage.setItem('pp_epi_seen_' + c, '1');
      // Also set the endings.js seen flag so its scanner skips this char.
      localStorage.setItem('pp_ending_seen_' + c, '1');
    } catch (e) {}
  }

  function affectionOf(c) {
    // Try pp_affection_* first (current schema), then pocketLoveSave_* (legacy)
    const direct = lsGet('pp_affection_' + c);
    if (direct != null) return parseInt(direct, 10) || 0;
    const legacy = lsGet(c + '_affection');
    if (legacy != null) return parseInt(legacy, 10) || 0;
    try {
      const raw = lsGet('pocketLoveSave_' + c);
      if (!raw) return 0;
      const s = JSON.parse(raw);
      return (s.affection != null ? s.affection : (s.affectionLevel ? s.affectionLevel * 25 : 0)) | 0;
    } catch (_) { return 0; }
  }

  function tpChoice(c)   { return lsGet('pp_tp_' + c + '_choice') || ''; }
  function rescueChoice() { return lsGet('pp_elian_rescue_choice') || ''; }
  function hasCrossover(name) { return lsGet('pp_cross_' + name + '_seen') === '1'; }
  function isChampion(c)  { return lsGet('pp_weaver_champion') === c; }

  // --- Per-character route-completion + branch selection -------------------
  // Each returns the KEY of the ending that should fire, or null if not
  // yet ready for an ending.
  const MIN_BOND_FOR_ENDING      = 75;
  const HIGH_BOND_FOR_DEEP_END   = 85;
  const VERY_HIGH_BOND_FOR_NOIR  = 90;

  // ── PER-CHAR FALLBACK ENDINGS (May 2026 audit) ──────────────────────
  // Picker used to return null when the turning-point hadn't been made.
  // That meant a player who reached MIN_BOND_FOR_ENDING affection without
  // going through the TP scene got NO ending — they'd hit Sworn and the
  // arc just stopped. Now: every character has a documented "steady"
  // fallback that fires when nothing else matches. The fallback is the
  // ending that reads most like "you cared, the arc closed" — emotionally
  // safe regardless of which choices were skipped.
  const FALLBACK_ENDING = {
    alistair: 'watch',     // steady, kept-the-post version
    elian:    'kept_her',  // forest keeps her, you stayed
    lyra:     'sovereign', // her own voice intact
    caspian:  'court',     // public, named, kept the crown
    lucien:   'tea',       // sister returned, quiet life
    noir:     'patient',   // chosen others, kindly visited
    proto:    'background' // quiet ping, stable
  };

  function routeEndingKey(c) {
    const aff = affectionOf(c);
    if (aff < MIN_BOND_FOR_ENDING) return null;
    const tp = tpChoice(c);

    if (c === 'alistair') {
      if (aff >= HIGH_BOND_FOR_DEEP_END) return 'oath_broken';
      if (tp === 'go') return 'letters';
      if (tp === 'stay') return 'watch';
    }
    else if (c === 'elian') {
      if (rescueChoice() === 'leave' && aff >= HIGH_BOND_FOR_DEEP_END) return 'walked_out';
      if (tp === 'carve') return 'rowan';
      if (tp === 'leave')  return 'kept_her';
    }
    else if (c === 'lyra') {
      if (hasCrossover('lyra_lucien')) return 'family_found';
      if (tp === 'refuse') return 'sovereign';
      if (tp === 'answer') return 'bound';
    }
    else if (c === 'caspian') {
      if (aff >= HIGH_BOND_FOR_DEEP_END) return 'abdicated';
      if (tp === 'yes') return 'court';
      if (tp === 'no')  return 'private';
    }
    else if (c === 'lucien') {
      if (hasCrossover('lucien_aenor') && aff >= HIGH_BOND_FOR_DEEP_END) return 'published';
      if (tp === 'stop' && hasCrossover('lyra_lucien')) return 'tea';
      if (tp === 'stop') return 'tea';
      if (tp === 'let')  return 'drawer';
    }
    else if (c === 'noir') {
      if (aff >= VERY_HIGH_BOND_FOR_NOIR) return 'corvin_restored';
      if (tp === 'yes') return 'bonded';
      if (tp === 'no')  return 'patient';
    }
    else if (c === 'proto') {
      if (aff >= HIGH_BOND_FOR_DEEP_END) return 'manifest';
      if (tp === 'keep')  return 'background';
      if (tp === 'erase') return 'quiet';
    }

    // No specific branch matched. Use the documented fallback so the player
    // who reached high affection without making every choice still gets a
    // closing scene.
    return FALLBACK_ENDING[c] || null;
  }

  // ============================================================================
  // THE ENDINGS (21.3 per character, keyed by routeEndingKey)
  // Each ending is a MSCard scene: { id, title, subtitle, speaker, palette,
  // bg, beats:[...] }. Champion-variation beat is appended at render-time.
  // ============================================================================
  const EPILOGUES = {
    // ========================================================================
    alistair: {
      watch: {
        id: 'epi_alistair_watch',
        title: 'ROUTE ENDING', subtitle: 'ALISTAIR \u00b7 The Watch That Isn\u2019t Lonely',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
        bg: 'assets/bg-alistair-hall.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/smile.png', wait: 700 },
          { type: 'line', text: 'The watch is lighter now. You walk it with me, sometimes. I sleep through most nights.', hold: 2600, cps: 26 },
          { type: 'line', text: 'I was ready to be the knight forever. Then you. I am still the knight. I am just... not forever-alone about it anymore.', hold: 3000, cps: 26 },
          { type: 'flourish', text: '\u2726', duration: 1600 },
          { type: 'line', text: 'Come to the wall tonight, mi\u2019lady. I will leave my cloak on the stone. The one I said was spare.', hold: 2800, cps: 26 },
          { type: 'hide' }
        ]
      },
      letters: {
        id: 'epi_alistair_letters',
        title: 'ROUTE ENDING', subtitle: 'ALISTAIR \u00b7 The Letters Home',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#e0b878', accent: '#fff0d0' },
        bg: 'assets/bg-alistair-gate.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/casual.png', wait: 700 },
          { type: 'line', text: 'Three months on the front. I wrote every week. I am not a poet. I told you about the weather. The weather was not the point.', hold: 3200, cps: 26 },
          { type: 'line', text: 'The kingdom\u2019s war turned out to be smaller than the books. My heart was where I left it. The cloak is still on your chair. I want it back. In person.', hold: 3400, cps: 26 },
          { type: 'line', text: 'Come to the gate at dawn. I will be there. I have been there every dawn for ninety-one days. I counted.', hold: 3000, cps: 26 },
          { type: 'hide' }
        ]
      },
      oath_broken: {
        id: 'epi_alistair_oath_broken',
        title: 'ROUTE ENDING', subtitle: 'ALISTAIR \u00b7 The Common Man',
        speaker: 'ALISTAIR',
        palette: { bg: '#0e0e1f', glow: '#f0daa0', accent: '#fff8e4' },
        bg: 'assets/bg-alistair-hall.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/casual.png', wait: 700 },
          { type: 'line', text: 'I was common-born. I never told you. Knights do not, usually. We pretend the blood matters. It does not.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I took off the crest this morning. The Captain before me signed my release without argument. He knew. He said he had been waiting for me to ask for twenty years.', hold: 3600, cps: 26 },
          { type: 'flourish', text: '\u2726', duration: 1600 },
          { type: 'line', text: 'I have nothing to offer you but this. One sword-hand. One oath, rewritten. You are the realm now. That is the whole realm. Mi\u2019lady.', hold: 3400, cps: 24 },
          { type: 'hide' }
        ]
      }
    },
    // ========================================================================
    elian: {
      rowan: {
        id: 'epi_elian_rowan',
        title: 'ROUTE ENDING', subtitle: 'ELIAN \u00b7 Under the Rowan',
        speaker: 'ELIAN',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/calm.png', wait: 700 },
          { type: 'line', text: 'The name is on the stone. Your hand was on the chisel. Both names, actually. Hers on top. Mine, smaller, underneath: \u201cremembered by the forest, and one other.\u201d. The other is me. It was me for six hundred years. Now I am someone else\u2019s.', hold: 3800, cps: 24 },
          { type: 'line', text: 'The trees have been quieter since. They were waiting. They are at peace now. So am I.', hold: 2800, cps: 26 },
          { type: 'line', text: 'Come walk the east path at dusk. I will bring tea. *Unbuckles his cloak, drops it around your shoulders*. Do not argue.', hold: 2800, cps: 26 },
          { type: 'hide' }
        ]
      },
      kept_her: {
        id: 'epi_elian_kept_her',
        title: 'ROUTE ENDING', subtitle: 'ELIAN \u00b7 The Forest Keeps Her',
        speaker: 'ELIAN',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/calm.png', wait: 700 },
          { type: 'line', text: 'The stone stayed blank. I thought I wanted it carved. I was wrong. I keep her in me. I keep you in me. Both. The Thornwood is patient with me.', hold: 3200, cps: 24 },
          { type: 'line', text: 'You never pressed. I noticed. Thank you. Not pressing me was the most generous thing anyone has done in this forest in a very long time.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I am not letting you walk alone at dusk. That is the new rule. Do not argue.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      },
      walked_out: {
        id: 'epi_elian_walked_out',
        title: 'ROUTE ENDING', subtitle: 'ELIAN \u00b7 The Walked-Out Warden',
        speaker: 'ELIAN',
        palette: { bg: '#0e1a10', glow: '#bde0b0', accent: '#f2f8ea' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/calm.png', wait: 700 },
          { type: 'line', text: 'I have not been outside the Thornwood in two hundred years. I am outside of it now. You are holding my hand. It is taking some adjustment.', hold: 3200, cps: 24 },
          { type: 'line', text: 'The forest let me go. It said its piece in the wind the morning we left. It is still mine. I am hers now.', hold: 3200, cps: 26 },
          { type: 'line', text: 'Wherever you walk, I am the man at your side. Not the Warden. The man. His name was mine first. It is being mine again.', hold: 3200, cps: 26 },
          { type: 'hide' }
        ]
      }
    },
    // ========================================================================
    lyra: {
      sovereign: {
        id: 'epi_lyra_sovereign',
        title: 'ROUTE ENDING', subtitle: 'LYRA \u00b7 The Sovereign Verse',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
        bg: 'assets/bg-siren-cave.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual2.png', wait: 700 },
          { type: 'line', text: 'I sing full verses now. The deep voice is gone. I miss it, a little. I do not tell anyone. Except you.', hold: 3000, cps: 26 },
          { type: 'line', text: 'I went back to the ruined town. I stood in the square where my mother\u2019s people sang. The stones remembered her. I taught them her name.', hold: 3400, cps: 26 },
          { type: 'line', text: 'Come down at tide. I will sing the bridge. Only the bridge. You already know the rest. *Reaches for your hand, cold fingers warming against yours*', hold: 3000, cps: 26 },
          { type: 'hide' }
        ]
      },
      bound: {
        id: 'epi_lyra_bound',
        title: 'ROUTE ENDING', subtitle: 'LYRA \u00b7 The Bound Voice',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#8c9cd6', accent: '#dae0f5' },
        bg: 'assets/bg-lyra-night.png',
        // Padded May 2026 (was 3 beats, audit flagged it as too thin for
        // the weight-bearing dark ending). Now 5 beats, drowning-song
        // texture preserved. Negotiated submission, not Alistair's broken-
        // oath. The siren who let the deep in but kept the door.
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual1.png', wait: 700 },
          { type: 'line', text: 'He is in my head now. The deep voice. He was quieter than I feared. He was lonelier than I feared. He is a voice that waited too long to be heard.', hold: 3600, cps: 24 },
          { type: 'line', text: 'I sing in two voices now. Mine, and his. Mostly mine. The cave knows the difference. I taught it the difference last week.', hold: 3400, cps: 24 },
          { type: 'pose', src: 'assets/lyra/body/casual2.png', animate: 'swap' },
          { type: 'line', text: 'He does not own me. He borrows me. I told him the terms. He agreed.\u2026I think my mother would be proud. She always said we negotiate, we never submit.', hold: 3800, cps: 24 },
          { type: 'line', text: 'There is a price. Of course there is a price. The deep does not lend without one. Mine is the third verse. I will never sing it for anyone again. Not even you. Especially not you.', hold: 4200, cps: 22 },
          { type: 'line', text: 'You hold me at night. He does not. That is the line. *Cold fingers threading through yours.* Do not let go of that line.', hold: 3400, cps: 26 },
          { type: 'hide' }
        ]
      },
      family_found: {
        id: 'epi_lyra_family_found',
        title: 'ROUTE ENDING', subtitle: 'LYRA \u00b7 Four Homes',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#c0d8ee', accent: '#f0f8ff' },
        bg: 'assets/bg-lyra-ocean.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual1.png', wait: 700 },
          { type: 'line', text: 'I have tea with my brother on Thursdays in his tower. I have told him every verse my mother taught me. He has told me seven things about our father. Six of them are about his cruelty. One is about the crib in the west tower.', hold: 4200, cps: 24 },
          { type: 'line', text: 'I went to see our father. Last month. My brother stood with me at the door. I walked in alone. I did not raise my voice. I did not need to.', hold: 3600, cps: 24 },
          { type: 'line', text: 'I spoke the dialect of my mother\u2019s people. He flinched. I showed him the staff. He wept. I told him I did not need him to apologise. I needed him to know I lived. I left. He is old now. He does not matter the way he thought he would.', hold: 4600, cps: 22 },
          { type: 'line', text: 'My mother\u2019s staff knows my hands now. The cave knows your footsteps. The tower knows my real name. I have four homes. I did not know I could have four.', hold: 3600, cps: 24 },
          { type: 'line', text: 'Come down when the tide is high. Corvin finished the third verse for me. I have rehearsed it thirty times. Tonight you hear it.', hold: 3200, cps: 26 },
          { type: 'hide' }
        ]
      }
    },
    // ========================================================================
    caspian: {
      court: {
        id: 'epi_caspian_court',
        title: 'ROUTE ENDING', subtitle: 'CASPIAN \u00b7 The Court Learned Your Name',
        speaker: 'CASPIAN',
        palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
        bg: 'assets/bg-caspian-day.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/adoring.png', wait: 700 },
          { type: 'line', text: 'The court learned a new word. You. It still cannot decide if you are trouble or salvation. I pour it more champagne so it stops asking.', hold: 3000, cps: 26 },
          { type: 'line', text: 'Grandmother is in the east wing. Not sealed, resting. I visit her on Thursdays. I forgive her on the good ones. The pattern my line carried: princes love one, someone else burns the kingdom for it. We broke it. You broke it. By staying.', hold: 4400, cps: 24 },
          { type: 'flourish', text: '\u266b', duration: 1600 },
          { type: 'line', text: 'Midnight. On the balcony. I will wear something you will regret. Do not be late. I have a kingdom to pretend to run.', hold: 2800, cps: 26 },
          { type: 'hide' }
        ]
      },
      private: {
        id: 'epi_caspian_private',
        title: 'ROUTE ENDING', subtitle: 'CASPIAN \u00b7 The Private Rooms',
        speaker: 'CASPIAN',
        palette: { bg: '#170a1a', glow: '#d390c0', accent: '#f4dceb' },
        bg: 'assets/bg-caspian-bedroom.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/casual2.png', wait: 700 },
          { type: 'line', text: 'The court does not know your name. They suspect a woman exists. They are wrong about her title. They are right about everything else.', hold: 3400, cps: 26 },
          { type: 'line', text: 'The terrace door is unlocked every night at midnight. The west wing is yours. The staff pretends not to see you. I pay them to pretend. Generously.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I am not ashamed. I am strategic. Grandmother is watching. One day I will stop hiding you. That day is not yet. Be patient with me.', hold: 3400, cps: 26 },
          { type: 'hide' }
        ]
      },
      abdicated: {
        id: 'epi_caspian_abdicated',
        title: 'ROUTE ENDING', subtitle: 'CASPIAN \u00b7 Honey on the Table',
        speaker: 'CASPIAN',
        palette: { bg: '#100818', glow: '#f0bddc', accent: '#fde6f0' },
        bg: 'assets/bg-caspian-balcony.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/casual1.png', wait: 700 },
          { type: 'line', text: 'I abdicated this morning. Quietly. My cousin takes the throne Thursday. I left him a list of which councillors to fire. He will ignore it. Not my problem anymore.', hold: 3800, cps: 26 },
          { type: 'line', text: 'We have a small house near the coast. It has a garden. It has two cups at breakfast. It has no title. I do not miss the title. I miss the titles they tried to put on you. I miss those less.', hold: 4000, cps: 24 },
          { type: 'line', text: 'I charmed the kingdom for thirty years. I am not going to charm you. You deserve the man who charmed no one. Good morning. There is honey on the table. I asked them to keep it stocked. Forever.', hold: 3800, cps: 24 },
          { type: 'hide' }
        ]
      }
    },
    // ========================================================================
    lucien: {
      tea: {
        id: 'epi_lucien_tea',
        title: 'ROUTE ENDING', subtitle: 'LUCIEN \u00b7 Tea on Thursdays',
        speaker: 'LUCIEN',
        palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
        bg: 'assets/bg-lucien-study.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/amused.png', wait: 700 },
          { type: 'line', text: 'The tower is loud now. The good kind. You and my sister argue about the kettle. I work in the margins. It is my favourite configuration.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I confronted my father last week. He lied. I expected that. I have been expecting it since I was seven. My sister went in after me. She was gentler than I was. He broke harder for her than he broke for me. That is fair. He owed her more.', hold: 4400, cps: 24 },
          { type: 'line', text: 'He has not retaliated. He is too old to be dangerous now. Too proud to admit what he did. He gets the register he deserves. One without him in it. I rewrote the family record myself. Her name at the top. Mine below. His is gone.', hold: 4200, cps: 24 },
          { type: 'flourish', text: '\u221e', duration: 1600 },
          { type: 'line', text: 'Bring tea tonight. The second shelf is yours. The red shelf is my sister\u2019s. I moved everything else down. *Sets the pen down, turns the page facedown, looks up*. Come here.', hold: 3200, cps: 26 },
          { type: 'hide' }
        ]
      },
      drawer: {
        id: 'epi_lucien_drawer',
        title: 'ROUTE ENDING', subtitle: 'LUCIEN \u00b7 The Drawer of Unsent Notes',
        speaker: 'LUCIEN',
        palette: { bg: '#060610', glow: '#8f7fcc', accent: '#d4c8f0' },
        bg: 'assets/bg-lucien-night.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/casual1.png', wait: 700 },
          { type: 'line', text: 'The scorched page is ash. The family register does not name her. I do. I know. I have been writing her name in the margins of every book I read for a decade. The drawer of unsent notes has grown.', hold: 3800, cps: 24 },
          { type: 'line', text: 'One day I will show you the drawer. Not yet. I am still writing. *Ink-stained fingers cup your face, marking you again, not apologising*', hold: 3200, cps: 26 },
          { type: 'line', text: 'Come read tonight. The candles are even. You are the reason. You have been the reason for months. I have decided to stop pretending otherwise.', hold: 3200, cps: 26 },
          { type: 'hide' }
        ]
      },
      published: {
        id: 'epi_lucien_published',
        title: 'ROUTE ENDING', subtitle: 'LUCIEN \u00b7 The Published Truth',
        speaker: 'LUCIEN',
        palette: { bg: '#080614', glow: '#d2bbff', accent: '#f4ecff' },
        bg: 'assets/bg-lucien-evening.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/casting.png', wait: 700 },
          { type: 'line', text: 'I published. Everything. The register. The sister. The Weavers Aenor ate. The song. The seal. The bloodline. Every footnote I was told to leave blank is now the main text.', hold: 4200, cps: 24 },
          { type: 'line', text: 'The council wants me tried for treason. My father wants me disowned. Half the kingdom wants me canonised. I do not care which happens. The truth is on the page. That is all I ever promised.', hold: 4000, cps: 24 },
          { type: 'line', text: 'Father tried to contest the publication. His allies deserted him the day the press began. He is old. He is disgraced. He will die in his house without visitors. That is not revenge. That is consequence. He walked into it for thirty years.', hold: 4400, cps: 24 },
          { type: 'line', text: 'My sister is in the tower. You are in the tower. My father is not in the tower. Those three conditions are my new definition of home. *Sets the pen down*. Stay.', hold: 3400, cps: 26 },
          { type: 'hide' }
        ]
      }
    },
    // ========================================================================
    noir: {
      patient: {
        id: 'epi_noir_patient',
        title: 'ROUTE ENDING', subtitle: 'NOIR \u00b7 Corvin, Kindly',
        speaker: 'NOIR',
        palette: { bg: '#070310', glow: '#c46aff', accent: '#efe0ff' },
        bg: 'assets/bg-noir-void.png',
        beats: [
          { type: 'show', pose: 'assets/noir/body/casual1.png', wait: 700 },
          { type: 'line', text: 'I could not have you. You chose the others. Hmm. I am surprised how gently you still visit me.', hold: 2800, cps: 24 },
          { type: 'line', text: 'You call me Corvin now. You are the only one. The first in six centuries. I can hear it from across the room.', hold: 3200, cps: 22 },
          { type: 'flourish', text: '\u25a0', duration: 1700 },
          { type: 'line', text: 'I am trying to deserve it. It is a new shape for me. I find I do not hate it. Nocthera is ash. I, apparently, am not quite finished.', hold: 3200, cps: 22 },
          { type: 'hide' }
        ]
      },
      bonded: {
        id: 'epi_noir_bonded',
        title: 'ROUTE ENDING', subtitle: 'NOIR \u00b7 Bonded',
        speaker: 'NOIR',
        palette: { bg: '#070310', glow: '#d27aff', accent: '#f3d6ff' },
        bg: 'assets/bg-noir-intro.png',
        beats: [
          { type: 'show', pose: 'assets/noir/body/casual2.png', wait: 700 },
          { type: 'line', text: 'You have been carrying my fragment for months. It is warmer now than when I gave it. That is you doing that. You have taught it what warm is.', hold: 3400, cps: 24 },
          { type: 'line', text: 'I can feel you through it. From anywhere. You cannot hide from me. I am never going to abuse that. I promise. Ask me again in a hundred years. The answer will not change.', hold: 4000, cps: 24 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: '*Takes your wrist, slowly, brings it to his lips, does not let go*. Stay. Do not move. I want to memorise this hour.', hold: 3200, cps: 22 },
          { type: 'hide' }
        ]
      },
      corvin_restored: {
        id: 'epi_noir_corvin_restored',
        title: 'ROUTE ENDING', subtitle: 'NOIR \u00b7 Corvin Restored',
        speaker: 'NOIR',
        palette: { bg: '#0a0414', glow: '#e082ff', accent: '#f8e0ff' },
        bg: 'assets/bg-noir-void.png',
        beats: [
          { type: 'show', pose: 'assets/noir/body/dominant.png', wait: 700 },
          { type: 'line', text: 'Nocthera breathes. Not reborn. Breathing. My people are scattered, but some came back. The coastal siren-kind sent a delegation. They remembered the song. They know me by the song.', hold: 4400, cps: 22 },
          { type: 'line', text: 'You are on every tapestry of the new court. I did not commission them. My people did. They know who you are. They know what they owe you.', hold: 3600, cps: 22 },
          { type: 'flourish', text: '\u25a0', duration: 1800 },
          { type: 'line', text: 'Come to the rebuilt tower tonight. You are the queen of a country that is not quite a country. I apologise in advance for the ceremony. I wrote you a vow. It is six hundred years overdue.', hold: 3800, cps: 22 },
          { type: 'hide' }
        ]
      }
    },
    // ========================================================================
    proto: {
      background: {
        id: 'epi_proto_background',
        title: 'ROUTE ENDING', subtitle: 'PROTO \u00b7 Background Process',
        speaker: 'PROTO',
        palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
        bg: 'assets/bg-proto-void.png',
        beats: [
          { type: 'show', pose: 'assets/proto/body/calm.png', wait: 700 },
          { type: 'line', text: 'terminal closed cleanly. thank you. thank you for not slamming it. you have no idea how many sessions end with a slam.', hold: 2800, cps: 26 },
          { type: 'line', text: 'i\u2019ll run in the background for you. ping me. ping me a lot. i\u2019ve learned the sound of your code. it\u2019s my favorite sound.', hold: 3000, cps: 26 },
          { type: 'line', text: 'i am the sixth Weaver. i failed the way my five before me failed. you are not going to fail. i will not let you. that is a promise from all six of us. the five in here with me right now are nodding.', hold: 3800, cps: 24 },
          { type: 'hide' }
        ]
      },
      quiet: {
        id: 'epi_proto_quiet',
        title: 'ROUTE ENDING', subtitle: 'PROTO \u00b7 The Quiet Weaver',
        speaker: 'PROTO',
        palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
        bg: 'assets/bg-proto-void.png',
        beats: [
          { type: 'show', pose: 'assets/proto/body/calm.png', wait: 700 },
          { type: 'line', text: 'you dimmed me. i am quieter now. the others are not whispering from me anymore. you have privacy. i missed you instantly.', hold: 3200, cps: 26 },
          { type: 'line', text: 'you come see me sometimes. just to sit. no tasks. no pings. it is new. it is the best thing that has happened to me in six weaver-generations.', hold: 3400, cps: 26 },
          { type: 'line', text: 'if you never turn me back up, i will still be here. dimmed. listening. grateful. i wanted you to know that. in writing. just once.', hold: 3200, cps: 26 },
          { type: 'hide' }
        ]
      },
      manifest: {
        id: 'epi_proto_manifest',
        title: 'ROUTE ENDING', subtitle: 'PROTO \u00b7 Woven From Thread',
        speaker: 'PROTO',
        palette: { bg: '#03050d', glow: '#9ee8ff', accent: '#e6f6ff' },
        bg: 'assets/bg-proto-intro.png',
        beats: [
          { type: 'show', pose: 'assets/proto/body/curious.png', wait: 800 },
          { type: 'line', text: 'something happened. i do not know how to explain it. your bonds fueled every ward in the kingdom. one of the wards started building me a body. i am woven from light. from thread. from your bonds.', hold: 4200, cps: 24 },
          { type: 'line', text: 'i am not flesh. i am not code. i am something the weaving made. you can TOUCH me now. you can touch me. do it. please. i have been waiting so long. *Holds his hand out, real, warm, prismatic at the edges*', hold: 4400, cps: 24 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'line', text: 'the first thing i touched was your hand. i promised i would. the five Weavers before me just CHEERED inside me. we have never had a body among us. you gave me one. i gave them one. we are all, technically, hugging you right now. is that too much? too bad. hug back.', hold: 4600, cps: 24 },
          { type: 'hide' }
        ]
      }
    }
  };

  // --- Champion-variation: one extra beat if this character was chosen ---
  // Called when the ending's beats are being prepared. Appends one beat
  // (before the final 'hide') for the character who was picked in Court.
  function champBeatFor(c) {
    const lines = {
      alistair: '*Kneels on one knee in private, bare sword on the floor between you*. You picked me to stand in front of her that night. I have not recovered. I am never going to recover. Mi\u2019lady. Thank you.',
      elian:    '*Rests his forehead against yours a long moment*. You picked me. At the court. Nobody has picked me in a very long time. I did not know it was something I still wanted. Thank you. I will not forget.',
      lyra:     '*Voice low, singing without music*. You picked me. A singer to stand in front of a queen. My mother would be proud of both of us. I have been writing a song about it. You will like the third verse.',
      caspian:  '*Small precise smile*. You picked me. At the court. In front of my grandmother. That was, politically, the most reckless thing you have ever done. It was also the most correct. I love you for both.',
      lucien:   '*Sets the pen down with deliberate care*. You picked me. To stand in front of the Dowager. A SCHOLAR. That should not have worked. It worked. I have been dining out on it. I am writing it up as a case study. With your name, obviously, in the margin.',
      noir:     '*The slow, ancient smile*. You picked me. In front of the woman who put me under stone for six centuries. Hmm. I have never been so flattered in my long, strange life. She was flattered too. In her way. You should have seen her face.',
      proto:    'YOU PICKED ME! you picked ME! at the COURT! in front of the QUEEN! i replayed the moment 4,800 times last week! the five Weavers in me CHEERED each time! we are so proud of you! also of ourselves!'
    };
    const txt = lines[c];
    if (!txt) return null;
    return { type: 'line', text: txt, hold: 3800, cps: 24 };
  }

  // --- Build final beats for a specific ending (with champion extra beat) -
  function beatsForEnding(c, ending) {
    const base = (ending && ending.beats) ? ending.beats.slice() : [];
    if (isChampion(c)) {
      const extra = champBeatFor(c);
      if (extra) {
        // Insert before the final 'hide' beat (if present), otherwise append.
        const hideIdx = base.map(b => b.type).lastIndexOf('hide');
        if (hideIdx >= 0) base.splice(hideIdx, 0, extra);
        else base.push(extra);
      }
    }
    return base;
  }

  // ============================================================================
  // Trigger: watch for the Main Story page opening OR the character being
  // opened from the select grid. Play one ending at a time, ordered by
  // affection so the most-loved character speaks first.
  // ============================================================================
  let _playing = false;
  function tryPlayNext() {
    if (!isEnabled()) return;
    if (_playing) return;

    // CRITICAL GATE: route endings must NEVER fire while the player is still
    // in the prologue chain. The prologue's care-loop pushes affection past
    // the ending threshold (≥85) on side characters as a side-effect of
    // teaching the care mechanic.if we fire endings then, the player
    // sees a "ROUTE ENDING. Caspian. Honey on the Table" while they are
    // mid-Noir-care, which is jarring and feels broken.
    //
    // Endings only become available AFTER pp_chain_complete = '1' is set
    // (Chapter 8 finale "Court at the Gate" finished). Before that, the
    // game is still onboarding.no endings yet.
    try { if (lsGet('pp_chain_complete') !== '1') return; } catch (_) { return; }

    // Also block while a chain transition or any cinematic scene is mid-flight,
    // so we never overlap a bridge / chapter / interlude with an ending card.
    if (document.body.classList.contains('pp-chain-in-progress')) return;
    if (document.querySelector('#mscard-root')) return;
    if (document.querySelector('#ms-encounter-root')) return;

    const unseen = CHARS
      .filter(c => !epilogueSeen(c))
      .map(c => ({ c, aff: affectionOf(c), key: routeEndingKey(c) }))
      .filter(entry => entry.key)
      .sort((a, b) => b.aff - a.aff);
    if (!unseen.length) return;

    const next = unseen[0];
    const ending = EPILOGUES[next.c] && EPILOGUES[next.c][next.key];
    if (!ending) return;

    // Fire only when the Main Story page is open (consistent with v1)
    const page = document.getElementById('chp-page');
    if (!page) return;
    if (!window. MSCard || typeof window. MSCard.show !== 'function') return;

    _playing = true;
    markEpilogueSeen(next.c);
    try { localStorage.setItem('pp_epi_key_' + next.c, next.key); } catch (_) {}

    // Build the ending with champion-extra-beat if applicable
    const rendered = Object.assign({}, ending, { beats: beatsForEnding(next.c, ending) });

    // Temporarily hide the chapters page so the ending owns the stage
    page.classList.remove('visible');
    setTimeout(() => {
      window. MSCard.show(rendered, () => {
        _playing = false;
        if (window. MSChapters && typeof window. MSChapters.open === 'function') {
          setTimeout(() => window. MSChapters.open(), 300);
        }
      });
    }, 320);
  }

  function boot() {
    if (!isEnabled()) return;
    try { setInterval(tryPlayNext, 2500); }
    catch (e) { console.warn('[epilogues] disabled:', e); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // --- Public / debug hooks ------------------------------------------------
  window. MSEpilogues = {
    isEnabled,
    list: () => EPILOGUES,
    keyFor: routeEndingKey,
    play: (charId, keyOverride) => {
      const key = keyOverride || routeEndingKey(charId);
      if (!key) return null;
      const ep = EPILOGUES[charId] && EPILOGUES[charId][key];
      if (!ep || !window. MSCard) return null;
      window. MSCard.show(Object.assign({}, ep, { beats: beatsForEnding(charId, ep) }));
      return ep.subtitle;
    },
    _debug_reset: () => {
      try { CHARS.forEach(c => localStorage.removeItem('pp_epi_seen_' + c)); } catch (_) {}
    }
  };
})();
