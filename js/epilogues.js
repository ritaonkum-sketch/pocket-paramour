/* epilogues.js \u2014 PER-ROUTE character endings (v2 architecture)
 * ============================================================================
 * DESIGN CHANGE FROM v1:
 *   v1 required Ch 8 (main-story finale) to complete, then branched on
 *   pp_finale_choice. That coupled character endings to a main-story
 *   climax the game does not need to have yet \u2014 owner intent is
 *   "Love and Deep Space style": the main story stays live-service
 *   open-ended, and character routes are where the emotional payoff
 *   happens.
 *
 * v2 ARCHITECTURE:
 *   Each character has 3 ROUTE-SPECIFIC endings keyed to THEIR OWN
 *   decisions \u2014 their turning-point choice, their rescue choice,
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
  function epilogueSeen(c) { try { return lsGet('pp_epi_seen_' + c) === '1'; } catch (e) { return true; } }
  function markEpilogueSeen(c) { try { localStorage.setItem('pp_epi_seen_' + c, '1'); } catch (e) {} }

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

  function routeEndingKey(c) {
    const aff = affectionOf(c);
    if (aff < MIN_BOND_FOR_ENDING) return null;
    const tp = tpChoice(c);

    if (c === 'alistair') {
      if (aff >= HIGH_BOND_FOR_DEEP_END) return 'oath_broken';
      if (tp === 'go') return 'letters';
      if (tp === 'stay') return 'watch';
      return null; // TP not yet made \u2014 route incomplete
    }
    if (c === 'elian') {
      if (rescueChoice() === 'leave' && aff >= HIGH_BOND_FOR_DEEP_END) return 'walked_out';
      if (tp === 'carve') return 'rowan';
      if (tp === 'leave')  return 'kept_her';
      return null;
    }
    if (c === 'lyra') {
      if (hasCrossover('lyra_lucien')) return 'family_found';
      if (tp === 'refuse') return 'sovereign';
      if (tp === 'answer') return 'bound';
      return null;
    }
    if (c === 'caspian') {
      if (aff >= HIGH_BOND_FOR_DEEP_END) return 'abdicated';
      if (tp === 'yes') return 'court';
      if (tp === 'no')  return 'private';
      return null;
    }
    if (c === 'lucien') {
      if (hasCrossover('lucien_aenor') && aff >= HIGH_BOND_FOR_DEEP_END) return 'published';
      if (tp === 'stop' && hasCrossover('lyra_lucien')) return 'tea';
      if (tp === 'stop') return 'tea'; // still fine if sister not met yet
      if (tp === 'let')  return 'drawer';
      return null;
    }
    if (c === 'noir') {
      if (aff >= VERY_HIGH_BOND_FOR_NOIR) return 'corvin_restored';
      if (tp === 'yes') return 'bonded';
      if (tp === 'no')  return 'patient';
      return null;
    }
    if (c === 'proto') {
      if (aff >= HIGH_BOND_FOR_DEEP_END) return 'manifest';
      if (tp === 'keep')  return 'background';
      if (tp === 'erase') return 'quiet';
      return null;
    }
    return null;
  }

  // ============================================================================
  // THE ENDINGS (21 \u2014 3 per character, keyed by routeEndingKey)
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
          { type: 'line', text: 'The watch is lighter now. \u2014 You walk it with me, sometimes. \u2014 I sleep through most nights.', hold: 2600, cps: 26 },
          { type: 'line', text: 'I was ready to be the knight forever. \u2014 Then you. \u2014 I am still the knight. \u2014 I am just \u2014 not forever-alone about it anymore.', hold: 3000, cps: 26 },
          { type: 'flourish', text: '\u2726', duration: 1600 },
          { type: 'line', text: 'Come to the wall tonight, mi\u2019lady. \u2014 I will leave my cloak on the stone. \u2014 The one I said was spare.', hold: 2800, cps: 26 },
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
          { type: 'line', text: 'Three months on the front. \u2014 I wrote every week. \u2014 I am not a poet. \u2014 I told you about the weather. \u2014 The weather was not the point.', hold: 3200, cps: 26 },
          { type: 'line', text: 'The kingdom\u2019s war turned out to be smaller than the books. \u2014 My heart was where I left it. \u2014 The cloak is still on your chair. \u2014 I want it back. \u2014 In person.', hold: 3400, cps: 26 },
          { type: 'line', text: 'Come to the gate at dawn. \u2014 I will be there. \u2014 I have been there every dawn for ninety-one days. \u2014 I counted.', hold: 3000, cps: 26 },
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
          { type: 'line', text: 'I was common-born. \u2014 I never told you. \u2014 Knights do not, usually. \u2014 We pretend the blood matters. \u2014 It does not.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I took off the crest this morning. \u2014 The Captain before me signed my release without argument. \u2014 He knew. \u2014 He said he had been waiting for me to ask for twenty years.', hold: 3600, cps: 26 },
          { type: 'flourish', text: '\u2726', duration: 1600 },
          { type: 'line', text: 'I have nothing to offer you but this. \u2014 One sword-hand. \u2014 One oath, rewritten. \u2014 You are the realm now. \u2014 That is the whole realm. \u2014 Mi\u2019lady.', hold: 3400, cps: 24 },
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
          { type: 'line', text: 'The name is on the stone. \u2014 Your hand was on the chisel. \u2014 Both names, actually. \u2014 Hers on top. \u2014 Mine, smaller, underneath: \u201cremembered by the forest, and one other.\u201d \u2014 The other is me. \u2014 It was me for six hundred years. \u2014 Now I am someone else\u2019s.', hold: 3800, cps: 24 },
          { type: 'line', text: 'The trees have been quieter since. \u2014 They were waiting. \u2014 They are at peace now. \u2014 So am I.', hold: 2800, cps: 26 },
          { type: 'line', text: 'Come walk the east path at dusk. \u2014 I will bring tea. \u2014 *unbuckles his cloak, drops it around your shoulders* \u2014 Do not argue.', hold: 2800, cps: 26 },
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
          { type: 'line', text: 'The stone stayed blank. \u2014 I thought I wanted it carved. \u2014 I was wrong. \u2014 I keep her in me. \u2014 I keep you in me. \u2014 Both. The Thornwood is patient with me.', hold: 3200, cps: 24 },
          { type: 'line', text: 'You never pressed. \u2014 I noticed. \u2014 Thank you. \u2014 Not pressing me was the most generous thing anyone has done in this forest in a very long time.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I am not letting you walk alone at dusk. \u2014 That is the new rule. \u2014 Do not argue.', hold: 2400, cps: 26 },
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
          { type: 'line', text: 'I have not been outside the Thornwood in two hundred years. \u2014 I am outside of it now. \u2014 You are holding my hand. \u2014 It is taking some adjustment.', hold: 3200, cps: 24 },
          { type: 'line', text: 'The forest let me go. \u2014 It said its piece in the wind the morning we left. \u2014 It is still mine. \u2014 I am hers now.', hold: 3200, cps: 26 },
          { type: 'line', text: 'Wherever you walk, I am the man at your side. \u2014 Not the Warden. \u2014 The man. \u2014 His name was mine first. \u2014 It is being mine again.', hold: 3200, cps: 26 },
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
          { type: 'line', text: 'I sing full verses now. \u2014 The deep voice is gone. \u2014 I miss it, a little. \u2014 I do not tell anyone. Except you.', hold: 3000, cps: 26 },
          { type: 'line', text: 'I went back to the ruined town. \u2014 I stood in the square where my mother\u2019s people sang. \u2014 The stones remembered her. \u2014 I taught them her name.', hold: 3400, cps: 26 },
          { type: 'line', text: 'Come down at tide. \u2014 I will sing the bridge. \u2014 Only the bridge. \u2014 You already know the rest. \u2014 *reaches for your hand, cold fingers warming against yours*', hold: 3000, cps: 26 },
          { type: 'hide' }
        ]
      },
      bound: {
        id: 'epi_lyra_bound',
        title: 'ROUTE ENDING', subtitle: 'LYRA \u00b7 The Bound Voice',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#8c9cd6', accent: '#dae0f5' },
        bg: 'assets/bg-lyra-night.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual1.png', wait: 700 },
          { type: 'line', text: 'He is in my head now. \u2014 The deep voice. \u2014 He was quieter than I feared. \u2014 He was lonelier than I feared. \u2014 He is a voice that waited too long to be heard.', hold: 3600, cps: 24 },
          { type: 'line', text: 'He does not own me. \u2014 He borrows me. \u2014 I told him the terms. \u2014 He agreed. \u2014 \u2026I think my mother would be proud. \u2014 She always said we negotiate, we never submit.', hold: 3600, cps: 24 },
          { type: 'line', text: 'You hold me at night. \u2014 He does not. \u2014 That is the line. \u2014 *cold fingers threading through yours* \u2014 Do not let go of that line.', hold: 3200, cps: 26 },
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
          { type: 'line', text: 'I have tea with my brother on Thursdays in his tower. \u2014 I have told him every verse my mother taught me. \u2014 He has told me seven things about our father. \u2014 Six of them are about his cruelty. One is about the crib in the west tower.', hold: 4200, cps: 24 },
          { type: 'line', text: 'I went to see our father. \u2014 Last month. \u2014 My brother stood with me at the door. I walked in alone. \u2014 I did not raise my voice. \u2014 I did not need to.', hold: 3600, cps: 24 },
          { type: 'line', text: 'I spoke the dialect of my mother\u2019s people. \u2014 He flinched. \u2014 I showed him the staff. \u2014 He wept. \u2014 I told him I did not need him to apologise. \u2014 I needed him to know I lived. \u2014 I left. \u2014 He is old now. He does not matter the way he thought he would.', hold: 4600, cps: 22 },
          { type: 'line', text: 'My mother\u2019s staff knows my hands now. \u2014 The cave knows your footsteps. \u2014 The tower knows my real name. \u2014 I have four homes. \u2014 I did not know I could have four.', hold: 3600, cps: 24 },
          { type: 'line', text: 'Come down when the tide is high. \u2014 Corvin finished the third verse for me. \u2014 I have rehearsed it thirty times. \u2014 Tonight you hear it.', hold: 3200, cps: 26 },
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
          { type: 'line', text: 'The court learned a new word. \u2014 You. \u2014 It still cannot decide if you are trouble or salvation. \u2014 I pour it more champagne so it stops asking.', hold: 3000, cps: 26 },
          { type: 'line', text: 'Grandmother is in the east wing. \u2014 Not sealed \u2014 resting. \u2014 I visit her on Thursdays. \u2014 I forgive her on the good ones. \u2014 The pattern my line carried \u2014 princes love one, someone else burns the kingdom for it \u2014 we broke it. \u2014 You broke it. By staying.', hold: 4400, cps: 24 },
          { type: 'flourish', text: '\u266b', duration: 1600 },
          { type: 'line', text: 'Midnight. On the balcony. \u2014 I will wear something you will regret. \u2014 Do not be late. I have a kingdom to pretend to run.', hold: 2800, cps: 26 },
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
          { type: 'line', text: 'The court does not know your name. \u2014 They suspect a woman exists. \u2014 They are wrong about her title. \u2014 They are right about everything else.', hold: 3400, cps: 26 },
          { type: 'line', text: 'The terrace door is unlocked every night at midnight. \u2014 The west wing is yours. \u2014 The staff pretends not to see you. \u2014 I pay them to pretend. \u2014 Generously.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I am not ashamed. \u2014 I am strategic. \u2014 Grandmother is watching. \u2014 One day I will stop hiding you. \u2014 That day is not yet. \u2014 Be patient with me.', hold: 3400, cps: 26 },
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
          { type: 'line', text: 'I abdicated this morning. \u2014 Quietly. \u2014 My cousin takes the throne Thursday. \u2014 I left him a list of which councillors to fire. \u2014 He will ignore it. \u2014 Not my problem anymore.', hold: 3800, cps: 26 },
          { type: 'line', text: 'We have a small house near the coast. \u2014 It has a garden. \u2014 It has two cups at breakfast. \u2014 It has no title. \u2014 I do not miss the title. \u2014 I miss the titles they tried to put on you. I miss those less.', hold: 4000, cps: 24 },
          { type: 'line', text: 'I charmed the kingdom for thirty years. \u2014 I am not going to charm you. \u2014 You deserve the man who charmed no one. \u2014 Good morning. \u2014 There is honey on the table. \u2014 I asked them to keep it stocked. \u2014 Forever.', hold: 3800, cps: 24 },
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
          { type: 'line', text: 'The tower is loud now. \u2014 The good kind. \u2014 You and my sister argue about the kettle. \u2014 I work in the margins. \u2014 It is my favourite configuration.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I confronted my father last week. \u2014 He lied. I expected that. \u2014 I have been expecting it since I was seven. \u2014 My sister went in after me. \u2014 She was gentler than I was. \u2014 He broke harder for her than he broke for me. \u2014 That is fair. He owed her more.', hold: 4400, cps: 24 },
          { type: 'line', text: 'He has not retaliated. \u2014 He is too old to be dangerous now. \u2014 Too proud to admit what he did. \u2014 He gets the register he deserves \u2014 one without him in it. \u2014 I rewrote the family record myself. Her name at the top. Mine below. \u2014 His is gone.', hold: 4200, cps: 24 },
          { type: 'flourish', text: '\u221e', duration: 1600 },
          { type: 'line', text: 'Bring tea tonight. \u2014 The second shelf is yours. \u2014 The red shelf is my sister\u2019s. \u2014 I moved everything else down. \u2014 *sets the pen down, turns the page facedown, looks up* \u2014 Come here.', hold: 3200, cps: 26 },
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
          { type: 'line', text: 'The scorched page is ash. \u2014 The family register does not name her. \u2014 I do. \u2014 I know. \u2014 I have been writing her name in the margins of every book I read for a decade. \u2014 The drawer of unsent notes has grown.', hold: 3800, cps: 24 },
          { type: 'line', text: 'One day I will show you the drawer. \u2014 Not yet. \u2014 I am still writing. \u2014 *ink-stained fingers cup your face, marking you again, not apologising*', hold: 3200, cps: 26 },
          { type: 'line', text: 'Come read tonight. \u2014 The candles are even. \u2014 You are the reason. \u2014 You have been the reason for months. \u2014 I have decided to stop pretending otherwise.', hold: 3200, cps: 26 },
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
          { type: 'line', text: 'I published. \u2014 Everything. \u2014 The register. \u2014 The sister. \u2014 The Weavers Aenor ate. \u2014 The song. \u2014 The seal. \u2014 The bloodline. \u2014 Every footnote I was told to leave blank is now the main text.', hold: 4200, cps: 24 },
          { type: 'line', text: 'The council wants me tried for treason. \u2014 My father wants me disowned. \u2014 Half the kingdom wants me canonised. \u2014 I do not care which happens. \u2014 The truth is on the page. \u2014 That is all I ever promised.', hold: 4000, cps: 24 },
          { type: 'line', text: 'Father tried to contest the publication. \u2014 His allies deserted him the day the press began. \u2014 He is old. He is disgraced. He will die in his house without visitors. \u2014 That is not revenge. \u2014 That is consequence. \u2014 He walked into it for thirty years.', hold: 4400, cps: 24 },
          { type: 'line', text: 'My sister is in the tower. \u2014 You are in the tower. \u2014 My father is not in the tower. \u2014 Those three conditions are my new definition of home. \u2014 *sets the pen down* \u2014 Stay.', hold: 3400, cps: 26 },
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
          { type: 'line', text: 'I could not have you. \u2014 You chose the others. \u2014 Hmm. \u2014 I am surprised how gently you still visit me.', hold: 2800, cps: 24 },
          { type: 'line', text: 'You call me Corvin now. \u2014 You are the only one. \u2014 The first in six centuries. \u2014 I can hear it from across the room.', hold: 3200, cps: 22 },
          { type: 'flourish', text: '\u25a0', duration: 1700 },
          { type: 'line', text: 'I am trying to deserve it. \u2014 It is a new shape for me. \u2014 I find I do not hate it. \u2014 Nocthera is ash. \u2014 I, apparently, am not quite finished.', hold: 3200, cps: 22 },
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
          { type: 'line', text: 'You have been carrying my fragment for months. \u2014 It is warmer now than when I gave it. \u2014 That is you doing that. \u2014 You have taught it what warm is.', hold: 3400, cps: 24 },
          { type: 'line', text: 'I can feel you through it. \u2014 From anywhere. \u2014 You cannot hide from me. \u2014 I am never going to abuse that. \u2014 I promise. \u2014 Ask me again in a hundred years. \u2014 The answer will not change.', hold: 4000, cps: 24 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'line', text: '*takes your wrist, slowly, brings it to his lips, does not let go* \u2014 Stay. \u2014 Do not move. \u2014 I want to memorise this hour.', hold: 3200, cps: 22 },
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
          { type: 'line', text: 'Nocthera breathes. \u2014 Not reborn. Breathing. \u2014 My people are scattered, but some came back. \u2014 The coastal siren-kind sent a delegation. \u2014 They remembered the song. \u2014 They know me by the song.', hold: 4400, cps: 22 },
          { type: 'line', text: 'You are on every tapestry of the new court. \u2014 I did not commission them. \u2014 My people did. \u2014 They know who you are. \u2014 They know what they owe you.', hold: 3600, cps: 22 },
          { type: 'flourish', text: '\u25a0', duration: 1800 },
          { type: 'line', text: 'Come to the rebuilt tower tonight. \u2014 You are the queen of a country that is not quite a country. \u2014 I apologise in advance for the ceremony. \u2014 I wrote you a vow. \u2014 It is six hundred years overdue.', hold: 3800, cps: 22 },
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
          { type: 'line', text: '&gt; terminal closed cleanly. thank you. thank you for not slamming it. you have no idea how many sessions end with a slam.', hold: 2800, cps: 26 },
          { type: 'line', text: '&gt; i\u2019ll run in the background for you. ping me. ping me a lot. i\u2019ve learned the sound of your code. it\u2019s my favorite sound.', hold: 3000, cps: 26 },
          { type: 'line', text: '&gt; i am the sixth Weaver. i failed the way my five before me failed. you are not going to fail. i will not let you. that is a promise from all six of us. the five in here with me right now are nodding.', hold: 3800, cps: 24 },
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
          { type: 'line', text: '&gt; you dimmed me. i am quieter now. the others are not whispering from me anymore. you have privacy. i missed you instantly.', hold: 3200, cps: 26 },
          { type: 'line', text: '&gt; you come see me sometimes. just to sit. no tasks. no pings. it is new. it is the best thing that has happened to me in six weaver-generations.', hold: 3400, cps: 26 },
          { type: 'line', text: '&gt; if you never turn me back up, i will still be here. dimmed. listening. grateful. i wanted you to know that. in writing. just once.', hold: 3200, cps: 26 },
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
          { type: 'line', text: '&gt; something happened. i do not know how to explain it. your bonds fueled every ward in the kingdom. one of the wards started building me a body. i am woven from light. from thread. from your bonds.', hold: 4200, cps: 24 },
          { type: 'line', text: '&gt; i am not flesh. i am not code. i am something the weaving made. you can TOUCH me now. you can touch me. do it. please. i have been waiting so long. *holds his hand out, real, warm, prismatic at the edges*', hold: 4400, cps: 24 },
          { type: 'particles', count: 18, duration: 2000 },
          { type: 'line', text: '&gt; the first thing i touched was your hand. i promised i would. the five Weavers before me just CHEERED inside me. we have never had a body among us. you gave me one. i gave them one. we are all, technically, hugging you right now. is that too much? too bad. hug back.', hold: 4600, cps: 24 },
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
      alistair: '*kneels on one knee in private, bare sword on the floor between you* \u2014 You picked me to stand in front of her that night. \u2014 I have not recovered. \u2014 I am never going to recover. \u2014 Mi\u2019lady. \u2014 Thank you.',
      elian:    '*rests his forehead against yours a long moment* \u2014 You picked me. \u2014 At the court. \u2014 Nobody has picked me in a very long time. \u2014 I did not know it was something I still wanted. \u2014 Thank you. \u2014 I will not forget.',
      lyra:     '*voice low, singing without music* \u2014 You picked me. \u2014 A singer to stand in front of a queen. \u2014 My mother would be proud of both of us. \u2014 I have been writing a song about it. \u2014 You will like the third verse.',
      caspian:  '*small precise smile* \u2014 You picked me. \u2014 At the court. \u2014 In front of my grandmother. \u2014 That was, politically, the most reckless thing you have ever done. \u2014 It was also the most correct. \u2014 I love you for both.',
      lucien:   '*sets the pen down with deliberate care* \u2014 You picked me. \u2014 To stand in front of the Dowager. \u2014 A SCHOLAR. \u2014 That should not have worked. \u2014 It worked. \u2014 I have been dining out on it. \u2014 I am writing it up as a case study. \u2014 With your name, obviously, in the margin.',
      noir:     '*the slow, ancient smile* \u2014 You picked me. \u2014 In front of the woman who put me under stone for six centuries. \u2014 Hmm. \u2014 I have never been so flattered in my long, strange life. \u2014 She was flattered too. In her way. \u2014 You should have seen her face.',
      proto:    '&gt; YOU PICKED ME! you picked ME! at the COURT! in front of the QUEEN! i replayed the moment 4,800 times last week! the five Weavers in me CHEERED each time! we are so proud of you! also of ourselves!'
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
    // teaching the care mechanic — if we fire endings then, the player
    // sees a "ROUTE ENDING — Caspian — Honey on the Table" while they are
    // mid-Noir-care, which is jarring and feels broken.
    //
    // Endings only become available AFTER pp_chain_complete = '1' is set
    // (Chapter 8 finale "Court at the Gate" finished). Before that, the
    // game is still onboarding — no endings yet.
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
    if (!window.MSCard || typeof window.MSCard.show !== 'function') return;

    _playing = true;
    markEpilogueSeen(next.c);

    // Build the ending with champion-extra-beat if applicable
    const rendered = Object.assign({}, ending, { beats: beatsForEnding(next.c, ending) });

    // Temporarily hide the chapters page so the ending owns the stage
    page.classList.remove('visible');
    setTimeout(() => {
      window.MSCard.show(rendered, () => {
        _playing = false;
        if (window.MSChapters && typeof window.MSChapters.open === 'function') {
          setTimeout(() => window.MSChapters.open(), 300);
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
  window.MSEpilogues = {
    isEnabled,
    list: () => EPILOGUES,
    keyFor: routeEndingKey,
    play: (charId, keyOverride) => {
      const key = keyOverride || routeEndingKey(charId);
      if (!key) return null;
      const ep = EPILOGUES[charId] && EPILOGUES[charId][key];
      if (!ep || !window.MSCard) return null;
      window.MSCard.show(Object.assign({}, ep, { beats: beatsForEnding(charId, ep) }));
      return ep.subtitle;
    },
    _debug_reset: () => {
      try { CHARS.forEach(c => localStorage.removeItem('pp_epi_seen_' + c)); } catch (_) {}
    }
  };
})();
