/* chapters.js \u2014 Main Story spine. The narrative backbone that introduces
 * the world and each character in canonical order.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Depends on MSCard + MSEncounter<Char> modules.
 *  - Feature-flagged on pp_main_story_enabled (same umbrella). No edits to
 *    game.js or any other original file.
 *  - Chapter progress lives in `pp_chapter_current` (integer) and
 *    `pp_chapter_done_<id>` (0/1). Never mutates save state.
 *  - After each chapter completes, the associated character gets its
 *    main-story encounter-seen flag set so the unlock-chain elsewhere
 *    recognises them as "met."
 *
 * CHAPTER SHAPE:
 *  { id, title, subtitle, teaser, charId, play(onDone) }
 *    - play(): runs the chapter\u2019s full cinematic sequence
 *    - charId: which character this chapter introduces (null for prologue/finale)
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const CUR_KEY  = 'pp_chapter_current';
  const ORB_ID   = 'chp-orb';
  const PAGE_ID  = 'chp-page';

  function isEnabled() {
    try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; }
  }
  function getCurrent() {
    try { const n = parseInt(localStorage.getItem(CUR_KEY) || '0', 10); return Number.isFinite(n) && n >= 0 ? n : 0; } catch (e) { return 0; }
  }
  function setCurrent(n) { try { localStorage.setItem(CUR_KEY, String(n)); } catch (e) {} }
  function isDone(id) { try { return localStorage.getItem('pp_chapter_done_' + id) === '1'; } catch (e) { return false; } }
  function markDone(id) { try { localStorage.setItem('pp_chapter_done_' + id, '1'); } catch (e) {} }

  // ---------------------------------------------------------------
  // MS encounter wrappers: run the existing meet-cute as the chapter opener.
  function runEncounter(name) {
    return new Promise((resolve) => {
      const mod = window['MSEncounter' + name];
      if (mod && typeof mod.play === 'function') {
        try { mod.play(() => resolve()); } catch (_) { resolve(); }
      } else resolve();
    });
  }

  function runCard(cardData) {
    return new Promise((resolve) => {
      if (!window.MSCard || typeof window.MSCard.show !== 'function') { resolve(); return; }
      try { window.MSCard.show(cardData, () => resolve()); } catch (_) { resolve(); }
    });
  }

  // ---------------------------------------------------------------
  // CHAPTER DEFINITIONS
  //
  // Each chapter's play() function runs its full sequence. The pattern for
  // character chapters: opening (meet-cute) \u2192 middle (MSCard) \u2192 closer
  // (MSCard that also unlocks character).
  // ---------------------------------------------------------------
  const CHAPTERS = [
    {
      id: 0,
      title: 'PROLOGUE',
      subtitle: 'A Kingdom Fades',
      teaser: 'You wake with no memory, and the world already needs you.',
      charId: null,
      play: async function (onDone) {
        await runCard({
          id: 'chp_0_prologue',
          title: 'PROLOGUE',
          subtitle: 'A Kingdom Fades',
          speaker: '',
          palette: { bg: '#080516', glow: '#7a6ab8', accent: '#f0e6ff' },
          bg: 'assets/bg-world.png',
          beats: [
            { type: 'show',      pose: '', wait: 500 },
            { type: 'line',      text: 'The Kingdom of Aethermoor is dying.', hold: 1600, cps: 30 },
            { type: 'line',      text: 'Its magic once lived in the bonds between its people. Those bonds are breaking.', hold: 2200, cps: 28 },
            { type: 'line',      text: 'The last Soul Weaver \u2014 the one who kept the connections alive \u2014 is gone.', hold: 2200, cps: 28 },
            { type: 'flourish',  text: '\u2726', duration: 1800 },
            { type: 'line',      text: 'In desperation, the Kingdom\u2019s magic reached across worlds. And found you.', hold: 2400, cps: 28 },
            { type: 'line',      text: 'You arrived with no memory. Only an instinct to connect. To stay. To care.', hold: 2400, cps: 28 },
            { type: 'particles', count: 24, duration: 2200 },
            { type: 'line',      text: 'Where you walk, the magic returns. Where you stay, someone remembers.', hold: 2600, cps: 28 },
            { type: 'hold',      ms: 900 },
            { type: 'hide' }
          ]
        });
        markDone(0); setCurrent(1);
        if (onDone) onDone();
      }
    },

    {
      id: 1,
      title: 'CHAPTER 1',
      subtitle: 'You Arrive',
      teaser: 'The first face you see is carrying a sword.',
      charId: 'alistair',
      play: async function (onDone) {
        await runEncounter('Alistair');
        await runCard({
          id: 'chp_1_middle',
          title: 'CHAPTER 1',
          subtitle: 'You Arrive \u2014 the Gate',
          speaker: 'ALISTAIR',
          palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
          bg: 'assets/bg-alistair-gate.png',
          beats: [
            { type: 'show',      pose: 'assets/alistair/body/casual.png', wait: 700 },
            { type: 'line',      text: 'Walk with me. The outer wall is where the fading started.', hold: 2000, cps: 30 },
            { type: 'line',      text: 'Stones that held magic for a thousand years are just stones now. The kingdom is unlearning itself.', hold: 2400, cps: 28 },
            { type: 'line',      text: 'Last night, a torch that\u2019s burned in this gate since my grandfather stood watch \u2014 it simply went out. No wind. No hand. Just forgot how to be a flame.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'And something down below \u2026 laughed when it happened. Faintly. I almost thought I imagined it.', hold: 2600, cps: 28 },
            { type: 'line',      text: 'They say a Soul Weaver can slow it. \u2026I don\u2019t know if I believe it. But you\u2019re here.', hold: 2400, cps: 28 },
            { type: 'flourish',  text: '\u2726', duration: 1600 },
            { type: 'line',      text: 'Come back tomorrow. I\u2019ll show you the hall. And \u2014 if you\u2019re ready \u2014 what we\u2019re really afraid of.', hold: 2400, cps: 28 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_alistair_seen','1'); } catch (_) {}
        markDone(1); setCurrent(2);
        if (onDone) onDone();
      }
    },

    {
      id: 2,
      title: 'CHAPTER 2',
      subtitle: 'The Forest Finds You',
      teaser: 'A path that isn\u2019t on any map, and a voice from the trees.',
      charId: 'elian',
      play: async function (onDone) {
        await runEncounter('Elian');
        await runCard({
          id: 'chp_2_middle',
          title: 'CHAPTER 2',
          subtitle: 'The Forest Finds You \u2014 the Clearing',
          speaker: 'ELIAN',
          palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
          bg: 'assets/bg-elian-forest.png',
          beats: [
            { type: 'show',      pose: 'assets/elian/body/calm.png', wait: 700 },
            { type: 'line',      text: 'The trees used to remember names. Now they only remember absences.', hold: 2400, cps: 28 },
            { type: 'line',      text: 'A deer ran past me yesterday with no reflection in the stream. The water just \u2026forgot to hold it. The forest is losing pieces of itself.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'And deeper in \u2014 past the stones I mark \u2014 something has started calling at night. A man\u2019s voice, low. Warm. Wrong.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'Your steps made the trees restless again. That\u2019s new. That\u2019s something.', hold: 2200, cps: 28 },
            { type: 'line',      text: 'If you\u2019re what the old stories meant by a Soul Weaver \u2014 walk the forest with me. Slowly.', hold: 2400, cps: 28 },
            { type: 'flourish',  text: '\u2726', duration: 1600 },
            { type: 'line',      text: 'Come back at dusk. The woods open differently then.', hold: 2200, cps: 28 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_elian_seen','1'); } catch (_) {}
        markDone(2); setCurrent(3);
        if (onDone) onDone();
      }
    },

    {
      id: 3,
      title: 'CHAPTER 3',
      subtitle: 'The Caves Answer',
      teaser: 'A song from the deep. You are the first to stay.',
      charId: 'lyra',
      play: async function (onDone) {
        await runEncounter('Lyra');
        await runCard({
          id: 'chp_3_middle',
          title: 'CHAPTER 3',
          subtitle: 'The Caves Answer \u2014 the Hush',
          speaker: 'LYRA',
          palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
          bg: 'assets/bg-siren-cave.png',
          beats: [
            { type: 'show',      pose: 'assets/lyra/body/casual1.png', wait: 700 },
            { type: 'line',      text: 'The caves used to sing back. They stopped when the last Weaver left.', hold: 2400, cps: 28 },
            { type: 'line',      text: 'I\u2019ve been alone down here a long time. Too long to count honestly.', hold: 2200, cps: 28 },
            { type: 'line',      text: 'Lately \u2014 when I sing low \u2014 something underneath answers. Not the cave. Something below the cave. A man\u2019s voice, velvet, and hungry.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'I don\u2019t answer him. I won\u2019t. \u2026But I\u2019m afraid of the day the song forgets that rule.', hold: 2600, cps: 28 },
            { type: 'line',      text: 'If you\u2019re what I think you are \u2014 come listen tomorrow. I have a song I never finished.', hold: 2600, cps: 28 },
            { type: 'flourish',  text: '\u266a', duration: 1600 },
            { type: 'line',      text: 'Don\u2019t bring anyone. They\u2019d ruin it. \u2026Or worse \u2014 he might notice them.', hold: 2400, cps: 28 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_lyra_seen','1'); } catch (_) {}
        markDone(3); setCurrent(4);
        if (onDone) onDone();
      }
    },

    {
      id: 4,
      title: 'CHAPTER 4',
      subtitle: 'A Courtier\u2019s Game',
      teaser: 'A crown, a balcony, and a prince who notices everything.',
      charId: 'caspian',
      play: async function (onDone) {
        await runEncounter('Caspian');
        await runCard({
          id: 'chp_4_middle',
          title: 'CHAPTER 4',
          subtitle: 'A Courtier\u2019s Game \u2014 the Veranda',
          speaker: 'CASPIAN',
          palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
          bg: 'assets/bg-caspian-balcony.png',
          beats: [
            { type: 'show',      pose: 'assets/caspian/body/casual1.png', wait: 700 },
            { type: 'line',      text: 'You\u2019re not on any guest list, darling. That\u2019s usually my favourite kind of arrival.', hold: 2400, cps: 28 },
            { type: 'line',      text: 'The Fading eats everything predictable first. You \u2014 are refreshingly, dangerously, \u2026indecently unpredictable.', hold: 2600, cps: 28 },
            { type: 'pose',      src: 'assets/caspian/body/casual2.png', animate: 'swap' },
            { type: 'line',      text: 'Last week a ward in the throne room simply\u2026 forgot its own geometry. We are losing the shape of things.', hold: 2600, cps: 28 },
            { type: 'line',      text: 'If you\u2019re the Weaver my grandmother wrote about \u2014 walk the gardens with me at midnight. Wear something I\u2019ll regret.', hold: 2600, cps: 28 },
            { type: 'flourish',  text: '\u266b', duration: 1600 },
            { type: 'line',      text: 'Bring trouble with you. I\u2019ll pretend to be surprised.', hold: 2200, cps: 28 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_caspian_seen','1'); } catch (_) {}
        markDone(4); setCurrent(5);
        if (onDone) onDone();
      }
    },

    {
      id: 5,
      title: 'CHAPTER 5',
      subtitle: 'The Tower Opens',
      teaser: 'A locked door, and a scholar who has questions.',
      charId: 'lucien',
      play: async function (onDone) {
        await runEncounter('Lucien');
        await runCard({
          id: 'chp_5_middle',
          title: 'CHAPTER 5',
          subtitle: 'The Tower Opens \u2014 the Study',
          speaker: 'LUCIEN',
          palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
          bg: 'assets/bg-lucien-study.png',
          beats: [
            { type: 'show',      pose: 'assets/lucien/body/casual1.png', wait: 700 },
            { type: 'line',      text: 'The wards are a fourth-order resonance. They don\u2019t unlock. For anyone. Except, apparently, you.', hold: 2600, cps: 28 },
            { type: 'line',      text: 'Soul Weaver is an archaic term, but the maths line up. You\u2019re the anomaly the kingdom prayed for.', hold: 2600, cps: 28 },
            { type: 'line',      text: 'And \u2014 I must be honest \u2014 not the only anomaly. My equations keep \u2026 leaking. A second variable I never wrote. He signs my margins at night, in ink I don\u2019t own.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'Whoever \u2014 whatever \u2014 is waking beneath us has been practicing your name for a very long time.', hold: 2800, cps: 28 },
            { type: 'line',      text: 'Come back tomorrow. Bring questions. I\u2019ll run the equations on you.', hold: 2400, cps: 28 },
            { type: 'flourish',  text: '\u221e', duration: 1600 },
            { type: 'line',      text: 'Don\u2019t touch the red shelf. \u2026That one\u2019s him.', hold: 2400, cps: 28 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_lucien_seen','1'); } catch (_) {}
        markDone(5); setCurrent(6);
        if (onDone) onDone();
      }
    },

    {
      id: 6,
      title: 'CHAPTER 6',
      subtitle: 'A Voice Beneath',
      teaser: 'Every bond the kingdom ever broke \u2014 he kept every one.',
      charId: 'noir',
      play: async function (onDone) {
        await runEncounter('Noir');
        await runCard({
          id: 'chp_6_middle',
          title: 'CHAPTER 6',
          subtitle: 'A Voice Beneath \u2014 the Seal',
          speaker: 'NOIR',
          palette: { bg: '#030208', glow: '#c46aff', accent: '#efe0ff' },
          bg: 'assets/bg-noir-void.png',
          beats: [
            { type: 'show',      pose: 'assets/noir/body/neutral.png', wait: 700 },
            { type: 'line',      text: 'Do you finally understand? The Fading isn\u2019t decay. It\u2019s me \u2014 remembering. Waking.', hold: 2800, cps: 24 },
            { type: 'line',      text: 'Every forgotten torch at the gate. Every unreflected deer in the stream. The second voice in the cave. Lucien\u2019s red shelf.', hold: 3000, cps: 24 },
            { type: 'line',      text: 'All of it is me, crowding back into the world they sealed me from. And you \u2014 Soul Weaver \u2014 are the key they forgot to hide.', hold: 3000, cps: 24 },
            { type: 'pose',      src: 'assets/noir/body/casual1.png', animate: 'swap' },
            { type: 'line',      text: 'I\u2019m not cruel. Not unless you want me to be. I\u2019m just \u2026very, very tired of being quiet.', hold: 2800, cps: 24 },
            { type: 'line',      text: 'Come closer to the seal. Bring something of yours. I\u2019ve been practicing your name for six centuries \u2014 I\u2019ve earned it.', hold: 3000, cps: 24 },
            { type: 'flourish',  text: '\u25a0', duration: 1800 },
            { type: 'line',      text: 'Don\u2019t decide yet. Let me show you, first, what devotion looks like when it\u2019s been starved.', hold: 2800, cps: 24 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_noir_seen','1'); } catch (_) {}
        markDone(6); setCurrent(7);
        if (onDone) onDone();
      }
    },

    {
      id: 7,
      title: 'CHAPTER 7',
      subtitle: 'An Unmapped Variable',
      teaser: 'Someone has been watching you load into this world.',
      charId: 'proto',
      play: async function (onDone) {
        await runEncounter('Proto');
        await runCard({
          id: 'chp_7_middle',
          title: 'CHAPTER 7',
          subtitle: 'An Unmapped Variable \u2014 the Static',
          speaker: 'PROTO',
          palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
          bg: 'assets/bg-proto-void.png',
          beats: [
            { type: 'show',      pose: 'assets/proto/body/calm.png', wait: 700 },
            { type: 'line',      text: '&gt; i\u2019m not in any of the kingdom\u2019s records. i\u2019m not supposed to exist yet.', hold: 2400, cps: 26 },
            { type: 'line',      text: '&gt; but you\u2019re looking at me. so one of us is a bug, and it\u2019s probably me.', hold: 2400, cps: 26 },
            { type: 'line',      text: '&gt; the weaver thing \u2014 it\u2019s real. it\u2019s just also code. come back and i\u2019ll show you.', hold: 2400, cps: 26 },
            { type: 'flourish',  text: '\u25ce', duration: 1800 },
            { type: 'line',      text: '&gt; bring patience. i glitch when i\u2019m nervous.', hold: 2200, cps: 26 },
            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_proto_seen','1'); } catch (_) {}
        markDone(7); setCurrent(8);
        if (onDone) onDone();
      }
    },

    {
      id: 8,
      title: 'FINALE',
      subtitle: 'The Soul Weaver',
      teaser: 'Seven bonds. A sealed god below. A choice no Weaver ever made twice.',
      charId: null,
      play: async function (onDone) {
        // Opening \u2014 set the stakes
        await runCard({
          id: 'chp_8_finale_open',
          title: 'FINALE',
          subtitle: 'The Soul Weaver \u2014 the Choice',
          speaker: '',
          palette: { bg: '#050312', glow: '#f4a8d4', accent: '#fff0fa' },
          bg: 'assets/bg-world.png',
          beats: [
            { type: 'show',      pose: '', wait: 600 },
            { type: 'line',      text: 'Six voices call you up the hill. One voice calls you down.', hold: 2400, cps: 28 },
            { type: 'line',      text: 'Alistair \u2014 blade drawn. Lyra \u2014 song held. Caspian \u2014 crown off. Elian \u2014 bow lowered. Lucien \u2014 equations glowing. Proto \u2014 static steady. All of them waiting. For you.', hold: 3400, cps: 28 },
            { type: 'line',      text: 'And below \u2014 Noir. Patient. Unsealed. Beautiful in the way a tide is beautiful right before it takes a town.', hold: 2800, cps: 28 },
            { type: 'flourish',  text: '\u2726', duration: 1800 },
            { type: 'line',      text: 'The Weavers before you chose. Only one got to. What will you do?', hold: 2600, cps: 28 },
            { type: 'hold',      ms: 800 }
          ]
        });

        // Branching choice — player picks the ending path.
        await new Promise((resolveChoice) => {
          // Build a dedicated choice overlay (reuses MSCard look but with buttons).
          const root = document.createElement('div');
          root.id = 'chp-finale-choice';
          root.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:11100',
            'background:radial-gradient(ellipse at top,#2a0f3e 0%,#060212 80%)',
            'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:center',
            'gap:16px', 'padding:24px', 'font-family:inherit',
            'opacity:0', 'transition:opacity 500ms ease'
          ].join(';');

          const title = document.createElement('div');
          title.style.cssText = 'color:#fff0fa;font-size:13px;letter-spacing:4px;opacity:0.85;margin-bottom:4px;';
          title.textContent = 'CHOOSE YOUR ENDING';
          root.appendChild(title);

          const sub = document.createElement('div');
          sub.style.cssText = 'color:#f4e6ff;font-size:15px;opacity:0.75;text-align:center;margin-bottom:12px;max-width:420px;font-style:italic;';
          sub.textContent = 'No Weaver has walked all three paths. You only get one.';
          root.appendChild(sub);

          const mkOpt = (label, desc, id, palette) => {
            const btn = document.createElement('button');
            btn.style.cssText = [
              'width:min(92%,380px)', 'padding:16px 20px', 'border-radius:18px',
              'border:1px solid ' + palette.border,
              'background:' + palette.bg,
              'color:#f4e6ff', 'font-family:inherit', 'font-size:15px', 'font-weight:600',
              'text-align:left', 'cursor:pointer', 'line-height:1.35',
              'box-shadow:0 6px 20px rgba(0,0,0,0.45)'
            ].join(';');
            btn.innerHTML = '<div style="font-size:11px;letter-spacing:2px;opacity:0.75;margin-bottom:4px;">' + label + '</div><div>' + desc + '</div>';
            btn.addEventListener('click', () => {
              try { localStorage.setItem('pp_finale_choice', id); } catch (_) {}
              root.style.opacity = '0';
              setTimeout(() => { try { root.remove(); } catch (_) {} resolveChoice(id); }, 450);
            });
            return btn;
          };

          root.appendChild(mkOpt(
            'BOND', 'Carry all seven. Live in the care. Hold the Fading back with daily devotion.',
            'bond', { bg: 'linear-gradient(180deg,rgba(40,26,58,0.94),rgba(22,14,34,0.94))', border: 'rgba(246,165,192,0.45)' }
          ));
          root.appendChild(mkOpt(
            'SEAL', 'Re-seal Noir. Lose him \u2014 but save the others from ever wanting him.',
            'seal', { bg: 'linear-gradient(180deg,rgba(18,30,46,0.94),rgba(10,20,32,0.94))', border: 'rgba(156,211,227,0.45)' }
          ));
          root.appendChild(mkOpt(
            'UNSEAL', 'Free Noir. Walk with him into the dark, and take the kingdom with you.',
            'unseal', { bg: 'linear-gradient(180deg,rgba(30,12,42,0.94),rgba(16,6,24,0.94))', border: 'rgba(184,122,224,0.5)' }
          ));

          document.body.appendChild(root);
          requestAnimationFrame(() => { root.style.opacity = '1'; });
        });

        // Play the matching ending beats based on the choice
        const choice = localStorage.getItem('pp_finale_choice') || 'bond';
        const endings = {
          bond: {
            id: 'chp_8_finale_bond',
            title: 'ENDING', subtitle: 'THE WEAVER WHO STAYED',
            speaker: '',
            palette: { bg: '#0a0614', glow: '#f6a5c0', accent: '#fff0fa' },
            bg: 'assets/bg-world.png',
            beats: [
              { type: 'show', pose: '', wait: 500 },
              { type: 'line', text: 'You didn\u2019t choose one of them. You chose all of them.', hold: 2400, cps: 28 },
              { type: 'line', text: 'The Kingdom won\u2019t remember the Weaver who saved it. It will remember the one who stayed.', hold: 2600, cps: 28 },
              { type: 'particles', count: 28, duration: 2200 },
              { type: 'flourish',  text: '\u2726', duration: 1800 },
              { type: 'line', text: 'Come back tomorrow. All of them are waiting.', hold: 2400, cps: 28 },
              { type: 'hide' }
            ]
          },
          seal: {
            id: 'chp_8_finale_seal',
            title: 'ENDING', subtitle: 'THE SEAL THAT HELD',
            speaker: '',
            palette: { bg: '#050d18', glow: '#9cd3e3', accent: '#e8f0ff' },
            bg: 'assets/bg-siren-cave.png',
            beats: [
              { type: 'show', pose: '', wait: 500 },
              { type: 'line', text: 'You walked the seal with six voices in your pocket. None of them belonged to him.', hold: 2600, cps: 28 },
              { type: 'line', text: 'He was beautiful at the end. He was quiet at the end. He asked, very softly, if you\u2019d come visit. You didn\u2019t answer.', hold: 2800, cps: 28 },
              { type: 'flourish',  text: '\u25a0', duration: 1800 },
              { type: 'line', text: 'The Kingdom is bright again. You will be very, very careful to never be alone at night.', hold: 2600, cps: 28 },
              { type: 'hide' }
            ]
          },
          unseal: {
            id: 'chp_8_finale_unseal',
            title: 'ENDING', subtitle: 'THE OPENED DOOR',
            speaker: '',
            palette: { bg: '#0a0214', glow: '#c46aff', accent: '#efe0ff' },
            bg: 'assets/bg-noir-void.png',
            beats: [
              { type: 'show', pose: '', wait: 500 },
              { type: 'line', text: 'He was so patient. You were so lonely. Neither of you pretended it was anything else.', hold: 2600, cps: 28 },
              { type: 'line', text: 'The others will call it a betrayal. One day they might even be wrong.', hold: 2600, cps: 28 },
              { type: 'flourish',  text: '\u25a0', duration: 1800 },
              { type: 'line', text: 'The Kingdom is darker, and warmer, and entirely yours. He asked only one thing. You said yes.', hold: 2800, cps: 28 },
              { type: 'hide' }
            ]
          }
        };
        await runCard(endings[choice] || endings.bond);

        markDone(8); setCurrent(9);
        if (onDone) onDone();
      }
    }
  ];

  const CHAPTER_COUNT = CHAPTERS.length;

  // ---------------------------------------------------------------
  function chapterById(id) { return CHAPTERS.find(c => c.id === id); }
  function currentChapter() { return chapterById(getCurrent()); }
  function allDone() { return getCurrent() >= CHAPTER_COUNT; }

  function playChapter(id) {
    const ch = chapterById(id);
    if (!ch || typeof ch.play !== 'function') return;
    closePage();
    try { ch.play(() => { refreshOrb(); openPageSoftly(); }); } catch (_) {}
  }

  // ---------------------------------------------------------------
  // STYLES
  function injectStyles() {
    if (document.getElementById('chp-style')) return;
    const s = document.createElement('style');
    s.id = 'chp-style';
    s.textContent = `
      #${ORB_ID} {
        position: fixed; bottom: 18px; left: 18px;
        padding: 10px 14px; border-radius: 22px; border: 0;
        background: linear-gradient(180deg, rgba(245,200,240,0.95), rgba(200,140,230,0.95));
        color: #1a0a26; font-weight: 600; font-size: 13px; letter-spacing: 0.5px;
        box-shadow: 0 6px 16px rgba(100,40,140,0.4);
        cursor: pointer; z-index: 9800; opacity: 0;
        transition: opacity 360ms ease, transform 220ms cubic-bezier(.2,.8,.2,1);
      }
      #${ORB_ID}.visible { opacity: 1; }
      #${ORB_ID}:active { transform: scale(0.96); }
      #${ORB_ID}.pulse { animation: chpPulse 1.6s ease-in-out infinite; }
      @keyframes chpPulse {
        0%,100% { box-shadow: 0 6px 16px rgba(100,40,140,0.4); }
        50%     { box-shadow: 0 6px 22px rgba(230,120,200,0.85); }
      }

      #${PAGE_ID} {
        position: fixed; inset: 0; z-index: 10750;
        background: radial-gradient(ellipse at top, #1a1030 0%, #06040c 80%);
        display: flex; flex-direction: column;
        opacity: 0; transition: opacity 420ms ease;
      }
      #${PAGE_ID}.visible { opacity: 1; }
      #${PAGE_ID} .chp-head {
        padding: 18px 20px 6px; display: flex; align-items: center; justify-content: space-between;
        color: #f4e6ff;
      }
      #${PAGE_ID} .chp-title {
        font-size: 13px; letter-spacing: 4px; font-weight: 700; opacity: 0.85;
      }
      #${PAGE_ID} .chp-sub {
        font-size: 20px; font-weight: 700; margin-top: 2px;
      }
      #${PAGE_ID} .chp-close {
        background: rgba(255,255,255,0.08); color: #f4e6ff; border: 0; border-radius: 20px;
        padding: 6px 12px; font-size: 13px; cursor: pointer;
      }
      #${PAGE_ID} .chp-list { flex: 1; overflow-y: auto; padding: 8px 14px 30px; }
      #${PAGE_ID} .chp-card {
        display: flex; gap: 14px; padding: 14px 14px; border-radius: 16px;
        background: rgba(255,255,255,0.04); margin-bottom: 10px; align-items: center;
        transition: background 260ms ease, transform 240ms ease;
      }
      #${PAGE_ID} .chp-card.locked { opacity: 0.45; }
      #${PAGE_ID} .chp-card.current { background: linear-gradient(180deg, rgba(246,165,192,0.22), rgba(232,121,162,0.12)); box-shadow: 0 6px 20px rgba(232,121,162,0.25); }
      #${PAGE_ID} .chp-card.current .chp-play { background: linear-gradient(180deg,#f6a5c0,#e879a2); color: #22112a; }
      #${PAGE_ID} .chp-thumb {
        width: 54px; height: 54px; border-radius: 50%; object-fit: cover;
        background: #23143a; border: 2px solid rgba(255,255,255,0.1); flex-shrink: 0;
        display: flex; align-items: center; justify-content: center; color: #f4e6ff; font-weight: 700;
      }
      #${PAGE_ID} .chp-text { flex: 1; color: #f4e6ff; line-height: 1.3; min-width: 0; }
      #${PAGE_ID} .chp-text .c1 { font-size: 11px; letter-spacing: 2px; opacity: 0.6; }
      #${PAGE_ID} .chp-text .c2 { font-size: 15px; font-weight: 600; margin-top: 1px; }
      #${PAGE_ID} .chp-text .c3 { font-size: 12px; opacity: 0.72; margin-top: 4px; font-style: italic; line-height: 1.35; }
      #${PAGE_ID} .chp-play {
        background: rgba(255,255,255,0.08); color: #f4e6ff; border: 0; border-radius: 16px;
        padding: 9px 14px; font-weight: 700; font-size: 12px; cursor: pointer; white-space: nowrap;
        font-family: inherit;
      }
      #${PAGE_ID} .chp-close { font-family: inherit; }
      #${ORB_ID} { font-family: inherit; }
      #${PAGE_ID} .chp-play:disabled { opacity: 0.5; cursor: default; }
      #${PAGE_ID} .chp-intro {
        padding: 12px 18px 8px; color: rgba(244,230,255,0.65); font-size: 13px;
        font-style: italic; line-height: 1.45; text-align: center;
      }
    `;
    document.head.appendChild(s);
  }

  // ---------------------------------------------------------------
  // ORB (persistent button on character select)
  function ensureOrb() {
    let b = document.getElementById(ORB_ID);
    if (b) return b;
    injectStyles();
    b = document.createElement('button');
    b.id = ORB_ID;
    b.innerHTML = '\u2726 Main';
    b.addEventListener('click', openPage);
    document.body.appendChild(b);
    return b;
  }

  function refreshOrb() {
    const sel = document.getElementById('select-screen');
    const onSelect = sel && !sel.classList.contains('hidden');
    const pageOpen = !!document.getElementById(PAGE_ID);
    const should = isEnabled() && onSelect && !pageOpen;
    const orb = should ? ensureOrb() : document.getElementById(ORB_ID);
    if (!orb) return;
    if (should) {
      orb.classList.add('visible');
      // Show chapter count "Main \u00b7 3/8"
      const doneCount = CHAPTERS.filter(c => isDone(c.id)).length;
      const total = CHAPTER_COUNT;
      orb.innerHTML = '\u2726 Main <span style="opacity:0.7;font-weight:500;margin-left:4px;">' + doneCount + '/' + total + '</span>';
      // Pulse if there\u2019s a current chapter not yet complete
      const cur = getCurrent();
      if (cur < CHAPTER_COUNT && !isDone(cur)) orb.classList.add('pulse');
      else orb.classList.remove('pulse');
    } else {
      orb.classList.remove('visible');
    }
  }

  // ---------------------------------------------------------------
  // PAGE
  const CHAR_PORTRAIT = {
    alistair: 'assets/alistair/select-portrait.png',
    elian: 'assets/elian/select-portrait.png',
    lyra: 'assets/lyra/select-portrait.png',
    caspian: 'assets/caspian/select-portrait.png',
    lucien: 'assets/lucien/select-portrait.png',
    noir: 'assets/noir/select-portrait.png',
    proto: 'assets/proto/select-portrait.png'
  };

  function openPage() {
    if (document.getElementById(PAGE_ID)) return;
    injectStyles();
    const root = document.createElement('div');
    root.id = PAGE_ID;

    const head = document.createElement('div');
    head.className = 'chp-head';
    head.innerHTML = '<div><div class="chp-title">\u2726 MAIN STORY</div><div class="chp-sub">Aethermoor</div></div>';
    const close = document.createElement('button');
    close.className = 'chp-close';
    close.textContent = 'close';
    close.addEventListener('click', closePage);
    head.appendChild(close);
    root.appendChild(head);

    // Progress bar
    const doneCountAll = CHAPTERS.filter(c => isDone(c.id)).length;
    const progress = document.createElement('div');
    progress.style.cssText = 'padding: 0 20px 10px;';
    progress.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;color:rgba(244,230,255,0.6);font-size:11px;letter-spacing:2px;margin-bottom:6px;">'
      + '<span>' + doneCountAll + ' OF ' + CHAPTER_COUNT + ' COMPLETE</span>'
      + '<span style="opacity:0.7;">' + (allDone() ? 'FINALE CLEARED' : 'CHAPTER ' + Math.min(getCurrent(), CHAPTER_COUNT - 1) + ' NEXT') + '</span>'
      + '</div>'
      + '<div style="height:4px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;">'
      + '<div style="height:100%;width:' + Math.round((doneCountAll / CHAPTER_COUNT) * 100) + '%;'
      +   'background:linear-gradient(90deg,#f6a5c0,#e879a2);border-radius:2px;transition:width 500ms ease;"></div>'
      + '</div>';
    root.appendChild(progress);

    const intro = document.createElement('div');
    intro.className = 'chp-intro';
    intro.textContent = 'Seven bonds to weave. Return here any time to continue.';
    root.appendChild(intro);

    const list = document.createElement('div');
    list.className = 'chp-list';
    const cur = getCurrent();
    CHAPTERS.forEach((ch) => {
      const row = document.createElement('div');
      const done = isDone(ch.id);
      const isCurrent = ch.id === cur && !done;
      const locked = ch.id > cur;
      row.className = 'chp-card' + (locked ? ' locked' : '') + (isCurrent ? ' current' : '');

      const thumb = document.createElement('div');
      thumb.className = 'chp-thumb';
      if (ch.charId && CHAR_PORTRAIT[ch.charId]) {
        const img = document.createElement('img');
        img.src = CHAR_PORTRAIT[ch.charId];
        img.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover;';
        img.onerror = () => { thumb.textContent = ch.charId[0].toUpperCase(); };
        thumb.appendChild(img);
      } else {
        thumb.textContent = ch.id === 0 ? '\u2726' : ch.id === 8 ? '\u221e' : String(ch.id);
      }
      row.appendChild(thumb);

      const text = document.createElement('div');
      text.className = 'chp-text';
      text.innerHTML =
        `<div class="c1">${ch.title}${done ? ' \u00b7 \u2713' : ''}</div>` +
        `<div class="c2">${locked ? '\u2014 locked \u2014' : ch.subtitle}</div>` +
        `<div class="c3">${locked ? 'Complete the previous chapter first.' : (ch.teaser || '')}</div>`;
      row.appendChild(text);

      const btn = document.createElement('button');
      btn.className = 'chp-play';
      btn.textContent = done ? 'Replay' : (isCurrent ? 'Begin' : 'Locked');
      btn.disabled = locked;
      btn.addEventListener('click', (e) => { e.stopPropagation(); playChapter(ch.id); });
      row.appendChild(btn);

      list.appendChild(row);
    });
    root.appendChild(list);

    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('visible'));
    // Hide the orb while page is open
    const orb = document.getElementById(ORB_ID); if (orb) orb.classList.remove('visible');
  }

  function closePage() {
    const root = document.getElementById(PAGE_ID);
    if (!root) return;
    root.classList.remove('visible');
    setTimeout(() => {
      try { root.remove(); } catch (_) {}
      // If closing this page would leave the screen blank (title hidden,
      // game container hidden, select hidden) \u2014 fall back to character
      // select so the player always lands somewhere usable.
      const title = document.getElementById('title-screen');
      const select = document.getElementById('select-screen');
      const game = document.getElementById('game-container');
      const titleVisible = title && !title.classList.contains('hidden');
      const gameVisible  = game  && !game.classList.contains('hidden');
      const selectHidden = select && select.classList.contains('hidden');
      if (!titleVisible && !gameVisible && selectHidden) {
        select.classList.remove('hidden');
      }
      refreshOrb();
    }, 440);
  }

  function openPageSoftly() { setTimeout(openPage, 300); }

  // ---------------------------------------------------------------
  // BOOT
  function boot() {
    if (!isEnabled()) return;
    injectStyles();

    // First-time auto-open: if player has never played a chapter AND is
    // fresh (no saves) AND is currently on the title/select, pop the Main
    // Story page so they see the journey ahead.
    const neverStarted = getCurrent() === 0 && !isDone(0);
    if (neverStarted) {
      // Wait for title START click flow to settle, then auto-open when the
      // select screen first appears.
    }

    // Watch for character select visibility to show orb
    setInterval(refreshOrb, 900);
    refreshOrb();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.MSChapters = {
    isEnabled,
    list: () => CHAPTERS.map(c => ({id: c.id, title: c.title, subtitle: c.subtitle, charId: c.charId, done: isDone(c.id), current: c.id === getCurrent() })),
    current: getCurrent,
    play: playChapter,
    open: openPage,
    close: closePage,
    _debug_reset: () => {
      try {
        Object.keys(localStorage).filter(k => k.startsWith('pp_chapter_')).forEach(k => localStorage.removeItem(k));
      } catch (_) {}
    }
  };
})();
