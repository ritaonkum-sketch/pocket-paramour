/* chapters.js.Main Story spine. The narrative backbone that introduces
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
 *    - play(): runs the chapter’s full cinematic sequence
 *    - charId: which character this chapter introduces (null for prologue/finale)
 *
 * NOTE (June 2026 — owner cleanup):
 *  - All bridge entries (b_arrival, b_alistair, b_elian, b_lyra, b_caspian,
 *    b_lucien, b_noir, b_proto) and all middle/side-chapter entries have
 *    been removed. The CHAPTERS array now contains only Prologue (id: 0)
 *    and Chapter 3 / "Gauntlet Off" (id: 1). New main-story content will
 *    be added by appending new entries to the CHAPTERS array below.
 *  - The 7 PPBridge<Name> IIFEs that lived at the bottom of this file
 *    (post line 2975) have also been removed. PPBridgeCompile (defined in
 *    world-arrival.js) is still available if future bridges want it.
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
  // "Current" is derived as the first chapter in array order that is NOT
  // yet done. The stored CUR_KEY value is kept as a hint (and for legacy)
  // but it does NOT take precedence.a player who has done chapters
  // 1, 2, 3 but not the bridge between them should see the bridge as
  // current, not the next numeric chapter.
  //
  // This also fixes the subtle bug where setCurrent('b_arrival') (string)
  // would be read back via parseInt as NaN → 0, making the menu think
  // PROLOGUE was current instead of the bridge.
  function getCurrent() {
    try {
      for (let i = 0; i < CHAPTERS.length; i++) {
        if (!isDone(CHAPTERS[i].id)) return CHAPTERS[i].id;
      }
      // All chapters done.return last as current for "all complete" state.
      return CHAPTERS.length > 0 ? CHAPTERS[CHAPTERS.length - 1].id : 0;
    } catch (e) { return 0; }
  }
  function setCurrent(n) {
    // Stored as a hint only.getCurrent() derives from done-state.
    try { localStorage.setItem(CUR_KEY, String(n)); } catch (e) {}
  }
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
  // character chapters: opening (meet-cute) → middle (MSCard) → closer
  // (MSCard that also unlocks character).
  // ---------------------------------------------------------------
  const CHAPTERS = [
    {
      id: 0,
      title: 'Prologue',
      subtitle: 'A Kingdom Fades',
      teaser: 'You wake with no memory, and the world already needs you.',
      charId: null,
      // The Prologue plays through the world-intro overlay (defined in
      // game.js as window.PPWorldIntro) instead of MSCard. Same visual
      // shape as first-launch — clean sans-serif, no speech bubble, the
      // worldBeats prayer with tap-to-continue. Single source of truth
      // for the prayer lives in game.js.
      //
      // Replay-from-menu plays the same plain world-intro overlay as
      // first-launch — same look the player approved (no bubble, clean
      // sans-serif fade-in, the worldBeats prayer). Single source of
      // truth lives in game.js (window.PPWorldIntro).
      play: async function (onDone) {
        // Mark done OPTIMISTICALLY at start (FIX for "prologue replays
        // every Start"). If the player closes the browser, refreshes, or
        // taps away before tapping through all world-intro beats, we
        // still consider the Prologue seen — so it doesn't auto-fire
        // again on next Start. They can manually Replay from the Main
        // Story menu if they want to re-watch.
        markDone(0); setCurrent(nextIdAfter(0));
        if (window.PPWorldIntro && typeof window.PPWorldIntro.play === 'function') {
          await new Promise(function (resolve) {
            // showBack:true — replays from the Main Story menu get
            // the ‹ back arrow so the player can return mid-prologue.
            // First-launch path (game.js startBtn flow) calls play()
            // WITHOUT this flag, so the prologue stays mandatory.
            window.PPWorldIntro.play(resolve, { showBack: true });
          });
        }
        if (onDone) onDone();
      }
    },

    // ═════════════════════════════════════════════════════════════════════
    // CHAPTER 1 — THE PAGE IN THE MOSS
    // Owner-approved PDF conversion (Pocket_Paramour_Ch1-8 V3.pdf). 108 beats.
    // ═════════════════════════════════════════════════════════════════════
    {
      id: 1,
      title: 'Chapter 1',
      subtitle: 'The Page in the Moss',
      teaser: 'You wake in moss with no memory. A burnt page in your hand. Something is in the trees with you.',
      charId: 'alistair',
      play: async function (onDone) {
        await runCard({
          id: 'chp_1_full',
          title: 'Chapter 1',
          subtitle: 'The Page in the Moss',
          speaker: 'ALISTAIR',
          palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
          bg: null,
          beats: [
            { type: 'show', pose: '', wait: 700 },

            // ─── Section 1 · Waking in the moss ───────────────────────────
            { type: 'line', speaker: '', text: '*krkkk.*', hold: 1500, cps: 28 },
            { type: 'line', speaker: '', text: 'The sound again. Harder this time. Wood under strain.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: '*krkkkkk.*', hold: 1500, cps: 28 },
            { type: 'line', speaker: '', text: 'Your eyes open.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Moss against your cheek. Wet bark. Rainwater. Your cloak soaked through.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'You do not remember falling.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Copper at the back of your tongue. Old and faint. Like biting a coin in a dream.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'Your fingers are numb. Your back is cold. You are alive. You know that much.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'A leaf caught at your temple.', hold: 2000, cps: 26 },
            { type: 'line', speaker: '', text: 'You do not remember the place before this place.', hold: 2600, cps: 26 },

            // ─── Section 2 · The torn page ────────────────────────────────
            { type: 'line', speaker: '', text: 'Close on your hand. There is a torn page in it.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'The seal is unfamiliar. Two crossed branches beneath a moon. Burned edge. Silver ink.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'Your fingers know the shape. You do not know why.', hold: 2800, cps: 26 },

            // ─── Section 3 · The horns ────────────────────────────────────
            { type: 'line', speaker: '', text: 'Somewhere through the trees.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: '*horn. once.*', hold: 1400, cps: 28 },
            { type: 'line', speaker: '', text: '*horn. twice.*', hold: 1400, cps: 28 },
            { type: 'line', speaker: '', text: 'Patrol horns. The kind that mean a kingdom is awake and watching.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: '...a kingdom.', hold: 1800, cps: 26 },
            { type: 'line', speaker: '', text: 'You move before you understand why.', hold: 2200, cps: 26 },
            { type: 'line', speaker: '', text: 'Your hand folds the page along the burned edge, slipping it into the tear inside your sleeve. The lining accepts it too easily. Like it has hidden this before.', hold: 4400, cps: 24 },
            { type: 'line', speaker: '', text: 'You do not know whose seal you carry. You would rather be the one to find out.', hold: 3200, cps: 26 },

            // ─── Section 4 · Standing ────────────────────────────────────
            { type: 'line', speaker: '', text: 'You stand.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'The world tilts. Your ankle folds under you. You hit one knee, then both hands, breath leaving hard through your teeth.', hold: 4000, cps: 26 },
            { type: 'line', speaker: '', text: '*krk.*', hold: 1400, cps: 28 },
            { type: 'line', speaker: '', text: 'Something moving through the underbrush. Not animal movement. Something heavier.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: '...something is in here with you.', hold: 2400, cps: 26 },

            // ─── Section 5 · The wound-creature ──────────────────────────
            { type: 'line', speaker: '', text: 'Leaves shifting. A shape behind them.', hold: 2200, cps: 26 },
            { type: 'line', speaker: '', text: 'It steps forward.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Too many legs. Joints bending a fraction too late. A mouth split sideways across its skull. Black ribbons leaking from between its teeth like smoke escaping a wound.', hold: 4800, cps: 24 },
            { type: 'line', speaker: '', text: '...run.', hold: 1600, cps: 26 },

            // ─── Section 6 · The chase ───────────────────────────────────
            { type: 'line', speaker: '', text: 'You run.', hold: 1400, cps: 28 },
            { type: 'line', speaker: '', text: 'Moss under bare feet. Wet roots. Bark tearing your palms when you catch yourself. Behind you, the smell of copper and char. Not animal. Not rot. Something worse.', hold: 4800, cps: 24 },
            { type: 'line', speaker: '', text: 'Your ankle will not hold. You go down. Up again. Down again. You keep moving.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'The dragging sound behind you gets closer. Not footsteps. Dragging. Wet. Fast.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Your lungs burn. Your vision pales at the edges.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'You stop hearing your own breathing. You hear only the thing behind you.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You stumble. Your hand catches the lining of your sleeve. The page.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'You do not know your own name. You know to save this.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'You glance back.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'The creature is already at the clearing’s edge. Closer than it should be.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: '...you are not going to make it.', hold: 2400, cps: 26 },

            // ─── Section 7 · The fall ────────────────────────────────────
            { type: 'line', speaker: '', text: 'Your foot catches a root. You hit the moss hard. The air leaves your chest.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'The creature breaks through the treeline.', hold: 2200, cps: 26 },
            { type: 'line', speaker: '', text: 'You roll onto your back and throw an arm over your face.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: '*(small)* Not yet. Whoever I am. Not yet.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'Your eyes squeeze shut.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: '*SHNK.*', hold: 1400, cps: 28 },
            { type: 'line', speaker: '', text: 'Wet impact. Sharp. Close.', hold: 2000, cps: 26 },
            { type: 'line', speaker: '', text: 'Then silence.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'The blow never comes.', hold: 2000, cps: 28 },

            // ─── Section 8 · The rescuer ─────────────────────────────────
            { type: 'line', speaker: '', text: 'For a moment there is only your pulse. Too loud. Wrongly loud.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Slowly, you realise you are still alive.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Your eyes open halfway. The canopy above you shifts strangely. Not wind. Something else.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Your trembling hand lowers from your face. The cold has finally reached you. The fear has burned itself out.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'A man stands over the fallen creature. Rain-dark cloak. Sword lowered at his side.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Black smoke rises from the body at his feet. Not soot-black. Absence-black. It curls toward the trees in thin ribbons. Like it wants to go home.', hold: 4400, cps: 24 },
            { type: 'line', speaker: '', text: 'The man watches the smoke instead of you. One hand raised slightly between it and your body. Prepared.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'The smoke thins. Vanishes into the canopy. The creature beneath it collapses inward. Ash-coloured. Ancient. As if death only just remembered it.', hold: 4200, cps: 24 },
            { type: 'line', speaker: '', text: '*(fading)* ...the danger is over.', hold: 2200, cps: 26 },
            { type: 'line', speaker: '', text: 'Your eyes close. Darkness rushes up fast.', hold: 2200, cps: 28 },

            // ─── Section 9 · The kneel ───────────────────────────────────
            { type: 'line', speaker: '', text: 'Boots through moss. Coming closer now.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'A voice. Sharp with sudden fear. Not the voice of a man speaking to a stranger. The voice of a man who thinks he may already be too late.', hold: 4200, cps: 24 },
            { type: 'line', speaker: '', text: 'You cannot answer him. Your body feels far away. Only the wet moss beneath you still feels real.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Plate armour against earth. He kneels.', hold: 2200, cps: 26 },
            { type: 'line', speaker: '', text: 'Dark blond hair damp with rain. Green eyes. A scar at the jaw. Then darkness pulls again.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'He says something. You lose the words.', hold: 2200, cps: 26 },

            // ─── Section 10 · The pulse ──────────────────────────────────
            { type: 'line', speaker: '', text: 'His fingers at your throat. Careful. Searching. Battlefield hands. Hands that already know where death hides.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'His thumb presses lightly beneath your jaw.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'He finds the pulse.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'His eyes close. Just once. The breath he lets out sounds almost painful.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'His hand stays where it is.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'He looks at the place beneath his thumb. Like he has forgotten what he was checking for.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'You do not see this. He is alone with the pulse of a stranger beneath his hand. He should let go. He does not.', hold: 4000, cps: 24 },

            // ─── Section 11 · Horns recall him ───────────────────────────
            { type: 'line', speaker: '', text: '*horn. once.*', hold: 1400, cps: 28 },
            { type: 'line', speaker: '', text: '*horn. twice.*', hold: 1400, cps: 28 },
            { type: 'line', speaker: '', text: 'He hears it this time. Slowly, he withdraws his hand.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'He looks at his own fingers once before the captain settles back over him like armour.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'He leans down.', hold: 1600, cps: 28 },

            // ─── Section 12 · "There you are." ───────────────────────────
            { type: 'line', text: '*(low)* Mi’lady. Can you hear me? Open your eyes if you can.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Through water. Through distance. You hear him.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Your lashes move. Once. Then again.', hold: 2000, cps: 26 },
            { type: 'line', speaker: '', text: 'His face resolves above yours. Close enough to count rainwater caught in his lashes.', hold: 3200, cps: 26 },
            { type: 'line', text: '*(quiet, relieved)* There you are.', hold: 2200, cps: 26 },
            { type: 'line', speaker: '', text: 'Your throat works around a voice that barely exists.', hold: 2600, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '...you don’t know me.', hold: 2400, cps: 28 },
            { type: 'line', text: 'No, mi’lady.', hold: 1800, cps: 28 },
            { type: 'line', text: 'I know I am supposed to.', hold: 2600, cps: 28 },

            // ─── Section 13 · The cloak, the lift ────────────────────────
            { type: 'line', speaker: '', text: 'He wipes the sword clean on dead grass. Sheathes it. Every motion deliberate. Then he removes his cloak and lays it across your lap before touching you again.', hold: 4400, cps: 24 },
            // Introduction beat — flips the STRANGER → ALISTAIR label
            // for this line and all subsequent ones (see Stranger Rule
            // in premium-card.js). Before this beat fires, the speaker
            // chip reads STRANGER.
            { type: 'line', introduces: 'alistair', text: 'I’m Alistair. Captain of the dawn patrol. I’m going to lift you. Tell me if anything pulls wrong.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'He waits for permission. You nod.', hold: 2200, cps: 26 },
            // Lift moment — one of Ch1's emotional peaks. Crystal-resonance
            // cue drops a single soft harp-like note as the line begins
            // typing. Sprint 3 audit item #8.
            { type: 'line', speaker: '', sfx: { name: 'crystal-resonance', volume: 0.42 }, text: 'He lifts you carefully against his chest. Like someone long accustomed to carrying wounded people.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Over his shoulder you glimpse the creature. Already collapsing into grey ash. The earth beneath it stained black.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'That is not a wolf. That is not anything.', hold: 2400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'What was it?', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'He carries you past the body without looking back.', hold: 2600, cps: 26 },
            { type: 'line', text: 'A wound, mi’lady.', hold: 2200, cps: 28 },

            // ─── Section 14 · The horse ──────────────────────────────────
            { type: 'line', speaker: '', text: 'At the treeline waits a horse, reins looped over a low branch. It lifts its head as he approaches. Calm.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'He settles you against the saddle and swings up behind you. One arm braced around your ribs as he gathers the reins.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'You are suddenly aware of his warmth. You have not been warm since waking.', hold: 3000, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '...where are you taking me?', hold: 2400, cps: 28 },
            { type: 'line', speaker: '', text: 'His voice close behind your ear. Steady.', hold: 2200, cps: 26 },
            { type: 'line', text: 'Somewhere safe.', hold: 2000, cps: 28 },

            // ─── Section 15 · You decide to trust him ────────────────────
            { type: 'line', speaker: '', text: 'You do not know him. You do not know your own name. You have no shoes. You have a torn page hidden in your sleeve.', hold: 4200, cps: 24 },
            { type: 'line', speaker: '', text: 'You also have a swordsman between you and the forest. A steady horse beneath you. The memory of his fingers against your pulse.', hold: 4200, cps: 24 },
            { type: 'line', speaker: '', text: 'You decide to trust him. Only for now.', hold: 2400, cps: 26 },

            // ─── Section 16 · The castle ─────────────────────────────────
            { type: 'line', speaker: '', text: 'The horse moves into a smooth canter. The trees thin. Mist lifting with the dawn.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Far beyond the hills rises a castle of pale stone. High walls. Towering banners. A kingdom large enough to swallow you whole.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: '...that is a kingdom.', hold: 2000, cps: 26 },
            { type: 'line', speaker: '', text: 'Your head dips forward. You catch yourself. Then drift again.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'Behind you, Alistair’s arm tightens slightly so you do not slip.', hold: 2800, cps: 26 },
            { type: 'line', text: '*(quiet)* Easy, mi’lady. I have you.', hold: 2400, cps: 26 },

            // ─── Section 17 · Safe place ─────────────────────────────────
            { type: 'line', speaker: '', text: 'Your cheek settles against the open space between gorget and collar. Warm linen. Warm skin beneath it. The steady pulse in his throat.', hold: 4400, cps: 24 },
            { type: 'line', speaker: '', text: 'You do not realise what you have done. Your body simply went to the warmest place it could find.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'His breathing changes. Only once. He does not move away.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'The pulse beneath your cheek. Steady. Grounding.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'He found yours. You found his.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Your eyes close.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: '*(fading)* ...safe place.', hold: 2200, cps: 26 },

            // ─── Section 18 · Final wide shot ────────────────────────────
            { type: 'line', speaker: '', text: 'The horse disappearing down the road. The castle waiting ahead. The forest behind them watching in silence.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'It does not follow.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'It does not look away either.', hold: 2200, cps: 28 },

            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_alistair_seen','1'); } catch (_) {}
        // Trigger the unlock-celebration ceremony on the Chronicle's
        // Alistair card. applyCeremony in game.js reads this one-shot
        // flag on the next select-screen render — gold glow + NEWLY
        // OPEN badge for 8 seconds, then auto-dismiss. Mirrors the
        // existing Proto/Noir bridge-unlock ceremony pattern.
        try { localStorage.setItem('pp_select_just_unlocked', 'alistair'); } catch (_) {}
        markDone(1); setCurrent(nextIdAfter(1));
        if (onDone) onDone();
      }
    },

    // ═════════════════════════════════════════════════════════════════════
    // CHAPTER 2 — THE CHAMBER NOT THE CHAMBERLAIN'S
    // Owner-approved PDF conversion (June 2026). 115 beats.
    // Setting: Alistair's chamber, candle-lit, post-rescue. The captain
    // tends to MC instead of delivering her to the chamberlain (and through
    // them, the queen). She wakes wearing his shirt, ankle bandaged. He
    // gives her the healing draught he has carried for four years.
    // ═════════════════════════════════════════════════════════════════════
    {
      id: 2,
      title: 'Chapter 2',
      subtitle: 'The Chamber Not The Chamberlain’s',
      teaser: 'Eleven hours in his bed. A captain who hides you from the queen. A healing draught he has carried for four years.',
      charId: 'alistair',
      play: async function (onDone) {
        await runCard({
          id: 'chp_2_full',
          title: 'Chapter 2',
          subtitle: 'The Chamber Not The Chamberlain’s',
          speaker: 'ALISTAIR',
          palette: { bg: '#180c14', glow: '#ffd07a', accent: '#fff0d6' },
          bg: null,
          beats: [
            { type: 'show', pose: '', wait: 700 },

            // ─── Section 1 · The chamber ─────────────────────────────────
            { type: 'line', speaker: '', text: 'A small stone room. One candle burning low.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'A bowl of water. Clean cloth folded beside it. One narrow bed.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You are in the bed. Your ankle wrapped. Hair brushed away from your face.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'You are wearing a shirt far too large for you. Clearly his.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Alistair sits in the corner on a wooden stool. Armour removed from the waist up. Plain linen undershirt.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'Old scars crossing both forearms beneath fresh bandages.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'You wake slowly. Do not move. Watch him before he notices.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'He is sharpening a knife. Slow strokes. Steady hands.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'His mouth is caught somewhere between worry and a smile. Like a man unused to either.', hold: 3600, cps: 26 },

            // ─── Section 2 · He notices ──────────────────────────────────
            { type: 'line', speaker: '', text: 'He notices you watching.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'He freezes. Sets the knife down. Then adjusts it again more carefully, as though the first attempt was too loud.', hold: 4000, cps: 24 },
            { type: 'line', text: 'Mi’lady.', hold: 2000, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'Hi.', hold: 1800, cps: 28 },
            { type: 'line', text: '...hi.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'He looks momentarily stranded inside his own body.', hold: 2600, cps: 26 },
            { type: 'line', text: 'You slept eleven hours. That is good. You should drink. I will...', hold: 3000, cps: 26 },

            // ─── Section 3 · The cup of water ────────────────────────────
            { type: 'line', speaker: '', text: 'He stands too quickly. The stool tips backward. He catches it before it hits the floor.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'Straightens it. Pretends none of that happened.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'He crosses to the table, pours water, returns. Holds the cup out. Then realises you cannot sit upright properly.', hold: 4200, cps: 24 },
            { type: 'line', speaker: '', text: 'One arm slips carefully behind your shoulders. Helping you up.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'His hand against your back is enormous. Very careful. Like he thinks people break easily.', hold: 3600, cps: 26 },
            { type: 'line', text: '*(under his breath)* Easy.', hold: 2200, cps: 26 },
            { type: 'line', speaker: '', text: 'You drink. He watches the floor between your feet instead of your mouth.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Colour rising slowly into his neck.', hold: 2400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'You’re nervous.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'He sets the cup beside the bed.', hold: 2000, cps: 28 },
            { type: 'line', text: 'Yes, mi’lady.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'You laugh softly. Tired enough that it surprises both of you.', hold: 3000, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'Why?', hold: 1600, cps: 28 },
            { type: 'line', text: 'I have not had a woman in my chamber before, mi’lady.', hold: 3000, cps: 26 },
            { type: 'line', text: 'Wounded or otherwise. I am trying to do this correctly.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'You stare at him.', hold: 1800, cps: 28 },
            { type: 'line', text: 'The tending of wounds, I mean. Not...', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'He stops speaking. His ears have gone red.', hold: 2600, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'There is etiquette for this?', hold: 2400, cps: 26 },
            { type: 'line', text: 'Boil the water. Burn the cloth after. Do not sit on the bed.', hold: 3000, cps: 26 },
            { type: 'line', text: 'And if she wakes, do not loom.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'He is absolutely looming. He realises. Retreats two full steps.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Sits back down immediately. The stool is too small for him.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'He looks like a knight trying unsuccessfully to disguise himself as furniture.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'You cover your mouth to hide another smile.', hold: 2400, cps: 26 },

            // ─── Section 4 · His shirt ───────────────────────────────────
            { type: 'line', speaker: '', text: 'Close on your hand resting against the blanket.', hold: 2200, cps: 26 },
            { type: 'line', speaker: '', text: 'Your fingers have curled around the hem of the shirt you are wearing. His shirt.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'You had not realised you were holding onto it.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'You do not let go.', hold: 2000, cps: 28 },

            // ─── Section 5 · Recognition ─────────────────────────────────
            { type: 'line', speaker: 'YOU', text: 'Your name is Alistair.', hold: 2200, cps: 26 },
            { type: 'line', text: 'Yes.', hold: 1600, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'Captain of the dawn patrol.', hold: 2200, cps: 26 },
            { type: 'line', text: 'Yes, mi’lady.', hold: 2200, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'And instead of taking me to the chamberlain, you hid me in your room.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'His eyes lower briefly to his hands.', hold: 2400, cps: 26 },
            { type: 'line', text: 'I did.', hold: 1600, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'Why?', hold: 1600, cps: 28 },

            // ─── Section 6 · The queen ───────────────────────────────────
            { type: 'line', speaker: '', text: 'Silence. He picks up the knife. Sets it back down.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Adjusts the folded cloth beside him. His hands need work so they do not reach toward you.', hold: 3800, cps: 24 },
            { type: 'line', text: '*(quiet)* Because the chamberlain reports to the queen.', hold: 3000, cps: 26 },
            { type: 'line', text: 'And I did not want the queen to know about you yet.', hold: 3000, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '...the queen.', hold: 2000, cps: 28 },
            { type: 'line', text: 'Six hundred years old, mi’lady.', hold: 2600, cps: 26 },
            { type: 'line', text: 'She notices new things.', hold: 2400, cps: 28 },

            // ─── Section 7 · The soup ────────────────────────────────────
            { type: 'line', speaker: '', text: 'Your stomach growls. Loud in the quiet room.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'You freeze. Mortified.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Alistair stands immediately. The stool nearly topples again. He catches it. Again.', hold: 3600, cps: 26 },
            { type: 'line', text: 'Eleven hours. Of course. I should have thought of that sooner.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'He crouches beside a small chest at the foot of his cot.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Lifts out a clay bowl wrapped in cloth and a small dark vial. He carries both carefully. Like breakables.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'Steam rises as he unwraps the bowl. Broth. Onion. A little thyme.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'The smell of something made for wounded people.', hold: 2800, cps: 26 },
            { type: 'line', text: 'Cook prepares it for the patrol after difficult nights.', hold: 3000, cps: 26 },
            { type: 'line', text: 'I thought it might be easiest on you.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'You stare at the bowl.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'You have been awake less than fifteen minutes.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'Someone you do not know made certain there would be warm soup waiting beside your bed.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'Your eyes sting unexpectedly. You blink once. Hard.', hold: 3000, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(quiet)* Thank you.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'He hands you the spoon. Watches carefully to make sure your hand is steady enough to hold it.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'For half a second, his fingers twitch like he almost intends to feed you himself.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'He catches the impulse. Sits back instead.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'You eat slowly. The first spoonful almost hurts. The second is easier.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'He keeps watching the floor. Very deliberately not watching your mouth.', hold: 3200, cps: 26 },

            // ─── Section 8 · For now ─────────────────────────────────────
            { type: 'line', speaker: '', text: 'The small room. Steam curling from the bowl. Rain tapping softly at the narrow window.', hold: 3800, cps: 24 },
            { type: 'line', speaker: '', text: 'The captain sitting too rigidly on a stool much too small for him.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Far above this room, somewhere in the keep, the queen remains unaware.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'For now.', hold: 2000, cps: 28 },

            // ─── Section 9 · The vial ────────────────────────────────────
            { type: 'line', speaker: '', text: 'The dark vial turning slowly between Alistair’s fingers.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'He sets it carefully beside your hand. Withdraws his own too quickly.', hold: 3200, cps: 26 },
            { type: 'line', text: 'There is also this.', hold: 2000, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'What is it?', hold: 1800, cps: 28 },
            { type: 'line', text: 'Healing draught. Captain’s allotment.', hold: 2400, cps: 26 },
            { type: 'line', text: 'One each from the apothecary for serious wounds.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'You look at the vial. Then back at him.', hold: 2400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'This belongs to you.', hold: 2200, cps: 26 },
            { type: 'line', text: 'Yes, mi’lady.', hold: 2200, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'And you’re giving it away.', hold: 2400, cps: 26 },
            { type: 'line', text: 'Yes, mi’lady.', hold: 2200, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'Alistair...', hold: 1800, cps: 28 },
            { type: 'line', text: '*(quickly)* I have never used it.', hold: 2400, cps: 26 },
            { type: 'line', text: 'Four years. I have not had the need.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'He says it plainly. The way another man might quietly confess he no longer expects kindness.', hold: 4000, cps: 24 },
            { type: 'line', speaker: 'YOU', text: 'You have not had the need?', hold: 2400, cps: 26 },
            { type: 'line', text: 'Wounds heal if you leave them alone long enough.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'That may be the saddest thing I have heard, mi’lord.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'A small sound escapes him. Almost laughter. Almost disbelief.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Then his eyes lower again.', hold: 2000, cps: 28 },
            { type: 'line', text: 'Then please drink it, mi’lady.', hold: 2400, cps: 26 },
            { type: 'line', text: 'So it was not wasted carrying it all this time.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'You said please again.', hold: 2200, cps: 28 },
            { type: 'line', text: 'Yes, mi’lady.', hold: 2200, cps: 28 },

            // ─── Section 10 · Drinking the draught ───────────────────────
            { type: 'line', speaker: '', text: 'He uncorks the vial. The liquid inside glows soft gold in the candlelight.', hold: 3400, cps: 26 },
            { type: 'line', text: '*(quieter)* It will mend the split in your lip.', hold: 2600, cps: 26 },
            { type: 'line', text: 'And the cut at your brow before it scars.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Your fingers rise automatically to your forehead. You had not known there was a cut there.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'He notices the motion. Looks away immediately.', hold: 2800, cps: 26 },
            { type: 'line', text: 'It tastes faintly of honey.', hold: 2200, cps: 26 },
            { type: 'line', speaker: '', text: 'You take the vial. Your fingers brush. This time he does not pull back.', hold: 3400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'You should keep it.', hold: 2200, cps: 26 },
            { type: 'line', text: 'Mi’lady.', hold: 1800, cps: 28 },
            { type: 'line', text: 'I have spent four years carrying this in case someone needed it more than I did.', hold: 3800, cps: 26 },
            { type: 'line', text: 'Please do not become the eighth person to refuse it.', hold: 3000, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '...the eighth.', hold: 2000, cps: 28 },
            { type: 'line', text: 'I have tried.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'You stare at him. Then close your eyes and drink.', hold: 3000, cps: 26 },

            // ─── Section 11 · The warmth ─────────────────────────────────
            { type: 'line', speaker: '', text: 'Warmth moves through you. Not heat. Something gentler.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Like a hand resting carefully over a cold place inside your chest.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'The ache in your ankle eases. The split in your lip seals shut.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'The cut at your brow vanishes.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'You exhale softly.', hold: 1800, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '...oh.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'The corner of his mouth lifts. Barely.', hold: 2400, cps: 26 },
            { type: 'line', text: 'Yes, mi’lady.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'You hand the empty vial back.', hold: 2200, cps: 26 },
            { type: 'line', speaker: '', text: 'He turns it once between his fingers. Studying the emptiness like something finally released.', hold: 3800, cps: 24 },

            // ─── Section 12 · The page in your sleeve ────────────────────
            { type: 'line', speaker: 'YOU', text: 'Alistair.', hold: 1800, cps: 28 },
            { type: 'line', text: 'Mi’lady.', hold: 1800, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'There is a piece of paper hidden in my sleeve.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'His eyes shift immediately to your wrist. He does not ask to see it.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Long silence.', hold: 1800, cps: 28 },
            { type: 'line', text: '*(low)* Then we leave it there for now.', hold: 2800, cps: 26 },

            // ─── Section 13 · Final shot ─────────────────────────────────
            { type: 'line', speaker: '', text: 'His hand resting deliberately against his own knee instead of reaching toward yours.', hold: 3800, cps: 24 },
            { type: 'line', speaker: '', text: 'The empty vial in his other hand. The half-finished soup between you.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Outside the narrow window, the castle towers over the night.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Watching.', hold: 2000, cps: 28 },

            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_alistair_seen','1'); } catch (_) {}
        markDone(2); setCurrent(nextIdAfter(2));
        if (onDone) onDone();
      }
    },

    // ═════════════════════════════════════════════════════════════════════
    // CHAPTER 3 — GAUNTLET OFF
    // Owner-approved PDF conversion (June 2026). ~70 beats.
    // Setting: morning castle corridor. Alistair walks MC (cane, healing
    // ankle) through the hall. Servants stare. They pass the slashed
    // portrait of the queen who must not be named. He shows her the
    // postern beyond the kitchen — escape route. Footsteps approach. He
    // catches her wrist. Unbuckles the gauntlet. "I do not hold beautiful
    // things in armour, mi'lady." Then armours back up and walks her home.
    // ═════════════════════════════════════════════════════════════════════
    {
      id: 3,
      title: 'Chapter 3',
      subtitle: 'Gauntlet Off',
      teaser: 'A corridor too narrow. A portrait too silent. A gauntlet unbuckled before he touches you.',
      charId: 'alistair',
      play: async function (onDone) {
        await runCard({
          id: 'chp_3_full',
          title: 'Chapter 3',
          subtitle: 'Gauntlet Off',
          speaker: 'ALISTAIR',
          palette: { bg: '#1f1620', glow: '#ffd88a', accent: '#fff4de' },
          bg: null,
          beats: [
            { type: 'show', pose: '', wait: 700 },

            // ─── Section 1 · The walk ─────────────────────────────────────
            { type: 'line', speaker: '', text: 'A stone corridor. Late morning light through narrow windows.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Three steps ahead of you, Alistair walks with one hand resting near his sword.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'You walk beside him with a cane you are pretending not to need.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Servants pass. Eyes lowering quickly when they notice you.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Their second look always lands on him.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'Alistair glances back. Notices your expression.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'He slows immediately until you are walking beside him instead of behind.', hold: 3200, cps: 26 },
            { type: 'line', text: 'They are not staring at you, mi’lady.', hold: 2600, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'They absolutely are.', hold: 2000, cps: 28 },
            { type: 'line', text: 'They are staring at me.', hold: 2200, cps: 28 },
            { type: 'line', text: 'I have never walked a woman through this corridor before.', hold: 3000, cps: 26 },

            // ─── Section 2 · Stable boy to captain ───────────────────────
            { type: 'line', speaker: 'YOU', text: 'You have been captain how long?', hold: 2400, cps: 26 },
            { type: 'line', text: 'Four years.', hold: 1800, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'And before that?', hold: 1800, cps: 28 },
            { type: 'line', text: 'I cleaned stables.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'You glance sideways at him.', hold: 2000, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'You went from stable boy to captain?', hold: 2600, cps: 26 },
            { type: 'line', text: 'In four years.', hold: 2000, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'How?', hold: 1400, cps: 28 },
            { type: 'line', speaker: '', text: 'He shrugs once. Not modest. Just uncomfortable being looked at too closely.', hold: 3400, cps: 26 },
            { type: 'line', text: 'Most men leave the gate when something comes out of the trees.', hold: 3000, cps: 26 },
            { type: 'line', text: 'I have a habit of staying.', hold: 2400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'That sounds less like bravery and more like poor judgment.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'The corner of his mouth shifts. Barely.', hold: 2400, cps: 26 },
            { type: 'line', text: 'Possibly, mi’lady. But the kingdom promotes survivors.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You study him more carefully after that.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Not handsome first. Dangerous first.', hold: 2600, cps: 26 },

            // ─── Section 3 · Sunlight, shield ────────────────────────────
            { type: 'line', speaker: '', text: 'You turn the corner. Sunlight cuts across the corridor. You wince.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Instantly, Alistair shifts between you and the light. Without thinking.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'You notice.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'He notices you noticing. Colour rises down the side of his neck.', hold: 3200, cps: 26 },

            // ─── Section 4 · The portrait ────────────────────────────────
            { type: 'line', speaker: '', text: 'You stop before a portrait.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'Tall. Old. The painted face slashed through. Fresh flowers beneath it.', hold: 3400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'Who was she?', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'Something closes quietly behind Alistair’s expression. Not cold. Locked.', hold: 3400, cps: 26 },
            { type: 'line', text: 'We do not name her in this hall.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'Someone still brings flowers.', hold: 2400, cps: 26 },
            { type: 'line', text: 'Yes.', hold: 1600, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'You.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'Silence. He does not answer.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'You let the silence stand.', hold: 2200, cps: 28 },

            // ─── Section 5 · The kitchen door · the postern ──────────────
            { type: 'line', speaker: '', text: 'Another corridor. Smaller. Quieter.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Alistair stops before a plain wooden door. Unlocks it.', hold: 2800, cps: 26 },
            { type: 'line', text: 'The kitchens are beyond this hall.', hold: 2400, cps: 26 },
            { type: 'line', text: 'If you knock twice and give Cook my name, she will feed you without questions.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'He hesitates.', hold: 1800, cps: 28 },
            { type: 'line', text: 'There is also a postern beyond the pantry. Servants use it. No guards.', hold: 3600, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'Why are you telling me this?', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'He keeps his eyes on the latch instead of your face.', hold: 2800, cps: 26 },
            { type: 'line', text: 'In case you need it.', hold: 2200, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'Need it for what?', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'He does not answer.', hold: 2000, cps: 28 },

            // ─── Section 6 · The catch ───────────────────────────────────
            { type: 'line', speaker: '', text: 'Footsteps echo from around the corridor corner.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'You instinctively step backward. Your ankle gives.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Alistair catches your wrist immediately. Warm hand. Firm grip.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You collide lightly against his chest. Too close.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'He goes completely still.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'His eyes lock on yours. Neither of you breathes.', hold: 2800, cps: 26 },

            // ─── Section 7 · The gauntlet ────────────────────────────────
            { type: 'line', speaker: '', text: 'Slowly, his other hand rises toward the gauntlet on his right wrist.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'He unbuckles it. Lets it fall.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: '*clk.*', hold: 1400, cps: 28 },
            { type: 'line', speaker: '', text: 'Metal against stone. Sharp in the silence.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'His bare hand replaces the armoured one at your arm.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Fingers wrapping carefully around your elbow. Warm skin instead of steel.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Close on your hand gripping the cane. The knuckles white.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Your body is gripping the cane because it very much wants to reach for him instead.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'You tighten your grip harder.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'Alistair’s thumb shifts once against your sleeve. The smallest movement.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Like he almost forgot himself.', hold: 2400, cps: 26 },
            { type: 'line', text: '*(quiet)* I do not hold beautiful things in armour, mi’lady.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'Silence. The corridor suddenly feels far too narrow.', hold: 2800, cps: 26 },

            // ─── Section 8 · The pull back ───────────────────────────────
            { type: 'line', speaker: '', text: 'The approaching footsteps fade down another hall. Neither of you noticed them leave.', hold: 3600, cps: 24 },
            { type: 'line', speaker: '', text: 'He still has not let go.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'Then he seems to realise it. Very carefully, he releases your arm.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'He bends to retrieve the gauntlet. Buckles it back into place with steady hands.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Only the slight tremor in his fingers betrays him.', hold: 2800, cps: 26 },
            { type: 'line', text: 'I will walk you back now, mi’lady.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'He does not look at you when he says it.', hold: 2400, cps: 26 },

            // ─── Section 9 · Final shot ──────────────────────────────────
            { type: 'line', speaker: '', text: 'The kitchen door standing half-open. Warm light spilling through.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'The smell of fresh bread drifting into the corridor.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Alistair beside you again. Armoured once more.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Trying very hard to become only a captain.', hold: 2800, cps: 26 },

            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_alistair_seen','1'); } catch (_) {}
        markDone(3); setCurrent(nextIdAfter(3));
        if (onDone) onDone();
      }
    },

    // ═════════════════════════════════════════════════════════════════════
    // CHAPTER 4 — THE QUIET DOOR
    // Owner-approved PDF conversion (June 2026). ~55 beats.
    // Setting: MC's room. Three days alone. Two trays. Two notes from
    // unknown hands. MC takes Alistair's cloak from the chair and wears
    // it. At the chapter's end Alistair is heard climbing toward the door.
    // Mood: quiet, watchful, intimate. The castle has been watching her.
    // ═════════════════════════════════════════════════════════════════════
    {
      id: 4,
      title: 'Chapter 4',
      subtitle: 'The Quiet Door',
      teaser: 'Three days alone. Two notes in unknown hands. You are not as hidden as he thinks.',
      charId: 'alistair',
      play: async function (onDone) {
        await runCard({
          id: 'chp_4_full',
          title: 'Chapter 4',
          subtitle: 'The Quiet Door',
          speaker: 'ALISTAIR',
          palette: { bg: '#0f0e1e', glow: '#86a0c8', accent: '#dde2ed' },
          bg: null,
          beats: [
            { type: 'show', pose: '', wait: 700 },

            // ─── Section 1 · Day one ─────────────────────────────────────
            { type: 'line', speaker: '', text: 'Your room. Rain against the window. Your injured ankle resting on a stool.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'A tray sits beside the door. Bread. Soft cheese. Tea gone cold.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Day one. Tray. No captain.', hold: 2400, cps: 26 },

            // ─── Section 2 · Day two · the first note ────────────────────
            { type: 'line', speaker: '', text: 'Same room. Different light. Another tray.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'Day two. Still no captain.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Evening. A folded note rests atop the tray. Handwriting you do not recognise.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: '*(note)* The captain has been called to the south wall. Open this door for no one but him.', hold: 4400, cps: 24 },
            { type: 'line', speaker: '', text: 'You stare at the note.', hold: 2000, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* Someone in this castle knows I am here. And it is not him.', hold: 3600, cps: 26 },

            // ─── Section 3 · The thought spiral ──────────────────────────
            { type: 'line', speaker: '', text: 'You fold the note once. Then again. Then smooth it flat against your knee.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Rain-streaked window. Your reflection faint in the dark glass.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You study your own face like it belongs to someone else.', hold: 3000, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* Why does it matter that he has not come.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Your eyes close.', hold: 1800, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* You have known him three days. You know his name. You know the shape of his hands.', hold: 4200, cps: 24 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* You do not know your own.', hold: 2800, cps: 26 },

            // ─── Section 4 · Night at the door ───────────────────────────
            { type: 'line', speaker: '', text: 'Night. You sit on the floor beside the door now. Back resting against the wood. Listening.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'Footsteps pass in the corridor. One after another. None stop.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'You pick up the small kitchen knife left with the tray.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Turn it once in your hand. Set it down again.', hold: 2600, cps: 26 },

            // ─── Section 5 · The cloak ───────────────────────────────────
            { type: 'line', speaker: '', text: 'Your eyes drift toward the chair. Toward his cloak folded over the back.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'You pick it up.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'You are not going to admit you hold it. You hold it anyway.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Day three.', hold: 1800, cps: 28 },

            // ─── Section 6 · The second note ─────────────────────────────
            { type: 'line', speaker: '', text: 'Morning light. Another tray. Another note. Smaller handwriting this time. Different hand.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: '*(note)* He has not slept. He will come tonight. Wait.', hold: 3800, cps: 24 },
            { type: 'line', speaker: '', text: 'You stare.', hold: 1600, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '*(whispered)* Who are you?', hold: 2400, cps: 26 },

            // ─── Section 7 · Opening the door ────────────────────────────
            { type: 'line', speaker: '', text: 'You stand. Cross to the door. Open it carefully.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'The corridor outside stands empty.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Far down the hall, the candles flicker as though someone has just passed beneath them.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'Or as though the air itself moved a moment ago and is still settling.', hold: 3400, cps: 26 },

            // ─── Section 8 · The page ────────────────────────────────────
            { type: 'line', speaker: '', text: 'Close on your hand.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Without thinking, your fingers have gone to the hidden seam inside your sleeve.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'The page is still there.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'Your fingertips remain pressed there a moment too long.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* If a stranger can find me here. Someone else can too.', hold: 3400, cps: 26 },

            // ─── Section 9 · Latch the door · two notes ──────────────────
            { type: 'line', speaker: '', text: 'Close on your face. His cloak around your shoulders. Your hand still at your sleeve.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'The corridor outside remains empty.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'You close the door. Latch it. Lean your forehead against the wood for one breath.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'Close on the two notes side by side on the desk.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Two different hands. Neither yours. Neither his.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'The castle has been watching you for three days.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(small)* Whoever is leaving these. They have known I am here since the morning he carried me in.', hold: 4200, cps: 24 },

            // ─── Section 10 · Reflection ─────────────────────────────────
            { type: 'line', speaker: '', text: 'Close on your reflection in the dark glass again. The cloak. The page-hand. The face.', hold: 3800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* You are not as hidden as he thinks.', hold: 3000, cps: 26 },

            // ─── Section 11 · He is climbing ─────────────────────────────
            { type: 'line', speaker: '', text: 'Three floors below. Heavy footsteps climbing stone stairs. Slow. Measured.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'The walk of a man carrying exhaustion like armour.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'You stand. The cloak remains around your shoulders. You do not take it off.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'The empty corridor stretching toward darkness. Rain tapping softly at the windows.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'The two notes on the desk in two different hands.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'And somewhere below, Alistair climbing toward your door.', hold: 3000, cps: 26 },

            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_alistair_seen','1'); } catch (_) {}
        markDone(4); setCurrent(nextIdAfter(4));
        if (onDone) onDone();
      }
    },

    // ═════════════════════════════════════════════════════════════════════
    // CHAPTER 5 — SIXTY HOURS
    // Owner-approved PDF conversion (June 2026). ~75 beats.
    // Setting: MC's room, late night, rain ending. Alistair arrives after
    // 60 hours awake. She cleans his cut. He confesses he has not slept
    // properly since age 11 (his mother died). She tells him to lie down.
    // He sleeps deep on the stone floor for the first time in 12 years.
    // She stands watch. The forest begins calling her through the window.
    // She refuses to answer. He sleeps tonight.
    // ═════════════════════════════════════════════════════════════════════
    {
      id: 5,
      title: 'Chapter 5',
      subtitle: 'Sixty Hours',
      teaser: 'Sixty hours since he last sat down. The first sleep in twelve years. The forest calls. You do not answer.',
      charId: 'alistair',
      play: async function (onDone) {
        await runCard({
          id: 'chp_5_full',
          title: 'Chapter 5',
          subtitle: 'Sixty Hours',
          speaker: 'ALISTAIR',
          palette: { bg: '#180c14', glow: '#ffd07a', accent: '#fff0d6' },
          bg: null,
          beats: [
            { type: 'show', pose: '', wait: 700 },

            // ─── Section 1 · He arrives ──────────────────────────────────
            { type: 'line', speaker: '', text: 'Your door.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'Three slow knocks. Then one. His.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'You open the door.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Alistair fills the doorway. Rain still clinging to his hair. A fresh cut high across his cheekbone.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'Exhaustion carved deep into the lines around his mouth.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'He looks held together by discipline alone.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'Then he sees you.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Something in his face loosens. Not breaking. Releasing.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Like a rope finally allowed to slacken.', hold: 2400, cps: 26 },
            { type: 'line', text: '*(rough)* Mi’lady.', hold: 2200, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'Come in.', hold: 1800, cps: 28 },

            // ─── Section 2 · He sees the cloak ───────────────────────────
            { type: 'line', speaker: '', text: 'He steps inside. Stops immediately beyond the threshold.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'His eyes land on the cloak around your shoulders. His cloak.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Something unreadable moves across his face. He looks away from it almost at once.', hold: 3600, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'Sit down.', hold: 1800, cps: 28 },
            { type: 'line', text: 'I should not, mi’lady.', hold: 2200, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'Sit down.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'He obeys. Rigidly upright at the edge of the chair.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Like a man afraid sleep may drag him under if he relaxes too much.', hold: 3200, cps: 26 },

            // ─── Section 3 · Cleaning the cut ────────────────────────────
            { type: 'line', speaker: '', text: 'You wet a cloth in the basin. Cross the room toward him.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'Tilt your head.', hold: 1800, cps: 28 },
            { type: 'line', text: 'Mi’lady, that is not necess...', hold: 2200, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'Alistair.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'He stops speaking. Tilts his head.', hold: 2200, cps: 26 },
            { type: 'line', speaker: '', text: 'You clean the cut carefully. His eyes close.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Close. Your hand remains at his cheekbone slightly longer than needed.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'You feel the rough scrape of stubble beneath your fingertips. The heat of his skin.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'His breathing has gone uneven.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'Yours is not much better.', hold: 2200, cps: 28 },

            // ─── Section 4 · Sixty hours ─────────────────────────────────
            { type: 'line', text: '*(very quiet)* Sixty hours.', hold: 2400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'What?', hold: 1400, cps: 28 },
            { type: 'line', text: 'Since I last sat down.', hold: 2200, cps: 28 },
            { type: 'line', text: 'That is the answer to the question you were about to ask.', hold: 3000, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'Why?', hold: 1400, cps: 28 },
            { type: 'line', speaker: '', text: 'His eyes open. Heavy with exhaustion.', hold: 2400, cps: 26 },
            { type: 'line', text: 'Three more wounds opened along the south wall.', hold: 2800, cps: 26 },
            { type: 'line', text: 'The eastern wood is rotting inward. We patched what we could. Nothing crossed through.', hold: 3800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'Wounds.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'He studies you for a moment. Too tired to soften the truth.', hold: 3000, cps: 26 },
            { type: 'line', text: 'Places where the world thins. Things leak through.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'Like the thing in the forest.', hold: 2400, cps: 26 },
            { type: 'line', text: 'Yes.', hold: 1600, cps: 28 },

            // ─── Section 5 · Why no word ─────────────────────────────────
            { type: 'line', speaker: '', text: 'Rain taps softly against the window.', hold: 2400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'Why did you not send word?', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'His gaze lowers to his hands. The old bandages around his forearms. The rain-dark fabric at his wrists.', hold: 4200, cps: 24 },
            { type: 'line', text: '*(low)* I did not want you waiting for me if I failed to come back.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'Silence.', hold: 1600, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'That may be the worst thing you have said so far.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'The ghost of a tired smile. Gone quickly.', hold: 2400, cps: 26 },
            { type: 'line', text: 'Sorry, mi’lady.', hold: 2000, cps: 28 },

            // ─── Section 6 · When did you last sleep ─────────────────────
            { type: 'line', speaker: '', text: 'You set the cloth aside. Sit slowly across from him.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'How long has it been since you slept through a night?', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'He considers lying. Then decides against it.', hold: 2600, cps: 26 },
            { type: 'line', text: 'I was eleven the last time.', hold: 2400, cps: 26 },
            { type: 'line', text: 'My mother died on a Sunday. I have not slept properly since.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'You stare at him. He says it without drama. Without self-pity.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'As if exhaustion has simply become another piece of armour he wears.', hold: 3400, cps: 26 },

            // ─── Section 7 · Lie down ────────────────────────────────────
            { type: 'line', speaker: 'YOU', text: 'Lie down.', hold: 1800, cps: 28 },
            { type: 'line', text: 'Mi’lady...', hold: 1600, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'On the bed or the floor. I do not care which. Lie down.', hold: 3200, cps: 26 },
            { type: 'line', text: 'That would be improper.', hold: 2200, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'You hid me in your chamber instead of turning me over to the queen.', hold: 3400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'I think we passed improper days ago.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'A rough sound escapes him. A tired laugh. The first real one you have heard.', hold: 3600, cps: 26 },
            { type: 'line', text: 'You remembered that.', hold: 2200, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'Every word.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'He lowers himself carefully onto the floor beside the bed. One arm folded over his eyes.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'Within moments, his breathing changes.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'Deep sleep. Sudden as collapse.', hold: 2400, cps: 26 },

            // ─── Section 8 · You stay watch ──────────────────────────────
            { type: 'line', speaker: '', text: 'You remain seated near the door. His cloak around your shoulders. Watching him.', hold: 3400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* I do not know my own name.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* But I know I will not let anyone through that door tonight.', hold: 3400, cps: 26 },

            // ─── Section 9 · Watching him sleep ──────────────────────────
            { type: 'line', speaker: '', text: 'Close on Alistair sleeping. The hard line usually held in his mouth has vanished.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'The rain still drying in his hair. One hand open loosely against the stone floor.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Not a fist anymore.', hold: 2000, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* He looks younger asleep.', hold: 2400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* Not softer. Just less defended.', hold: 2800, cps: 26 },

            // ─── Section 10 · Counting breaths ───────────────────────────
            { type: 'line', speaker: '', text: 'You count the rise and fall of his chest without meaning to.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'One. Two. Three. Long pause. Four.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Somewhere around the fortieth breath, you realise why you are counting.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'You are afraid one of them will stop.', hold: 2800, cps: 26 },

            // ─── Section 11 · He stayed awake for me ─────────────────────
            { type: 'line', speaker: '', text: 'Close on your hand resting against the edge of his cloak around your shoulders.', hold: 3400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* He stayed awake three days. For me.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Your eyes drift over him again.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'The captain who walks into wounds in the world with a sword in his hand.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'The man who chose to sleep in the same room as you without hesitation.', hold: 3400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* He trusts me.', hold: 2200, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* ...I am not sure he should.', hold: 2800, cps: 26 },

            // ─── Section 12 · The pull ───────────────────────────────────
            { type: 'line', speaker: '', text: 'Time passes quietly. The candle burns lower. The rain stops. Alistair does not move once.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'Close on your face. Something has begun pulling at the edge of your attention.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Not a sound. Not a voice. A direction.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Like a thread tightening somewhere deep inside your chest.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Closer. Your eyes drift toward the window. Toward the dark beyond the glass.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'The forest is out there. Far off. Calling.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(small)* ...what is this.', hold: 2400, cps: 26 },

            // ─── Section 13 · Resisting ──────────────────────────────────
            { type: 'line', speaker: '', text: 'You stand. Slowly. Test your ankle. It holds.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'Three steps toward the window. The pull sharpens.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'You stop.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'Close on Alistair on the floor. Still deep in sleep.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'The first night in twelve years his body has been allowed to rest.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'He is here because you told him to be.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'Closer on his open hand against the stone. Not a fist anymore.', hold: 3000, cps: 26 },

            // ─── Section 14 · No ─────────────────────────────────────────
            { type: 'line', speaker: '', text: 'Closest on your face.', hold: 2000, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '*(small)* No.', hold: 1800, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* Whatever this is. Whatever is calling.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(faint)* He sleeps tonight.', hold: 2600, cps: 26 },

            // ─── Section 15 · Holding the cloak ──────────────────────────
            { type: 'line', speaker: '', text: 'You sit back down by the door. The cloak around your shoulders. Back against the wood.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'The pull continues. You do not answer it.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'Close on your hand. It has drifted, without your permission, to rest near the edge of his cloak at your shoulder.', hold: 4200, cps: 24 },
            { type: 'line', speaker: '', text: 'Your fingers stay there.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'Closer. You hold the cloak the way you might hold a hand.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You are not going to admit it. You hold it anyway.', hold: 2800, cps: 26 },

            // ─── Section 16 · Final shot ─────────────────────────────────
            { type: 'line', speaker: '', text: 'The pull continues. Patient. Steady.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'The forest will still be there when he wakes.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Candlelight low. Alistair asleep on the stone floor.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You sitting near the door, his cloak around your shoulders, your back to the wood. Watching.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'Beyond the window, somewhere far out past the castle walls, the forest breathes in the dark.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'It can wait.', hold: 2200, cps: 28 },

            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_alistair_seen','1'); } catch (_) {}
        markDone(5); setCurrent(nextIdAfter(5));
        if (onDone) onDone();
      }
    },

    // ═════════════════════════════════════════════════════════════════════
    // CHAPTER 6 — SMOKE AT THE TREELINE
    // Owner-approved PDF conversion (June 2026). ~95 beats.
    // FIRST APPEARANCE OF ELIAN. The pull pulls MC into Thornwood at night.
    // A second wound-creature (the antlered one) attacks. Elian drops it
    // with two arrows. He notices everything: the cloak, the bruising,
    // the hidden page. Names her a "Weaver" and disappears before Alistair
    // arrives. Speaker default switches to ELIAN. Sets pp_ms_encounter_
    // elian_seen flag so character-grid + chain systems know the meet-cute
    // has fired. charId set to 'elian' so the chapter card shows his
    // portrait and forest-green left-border tint.
    // ═════════════════════════════════════════════════════════════════════
    {
      id: 6,
      title: 'Chapter 6',
      subtitle: 'Smoke at the Treeline',
      teaser: 'Smoke at the treeline. A bow you did not expect. He calls you Weaver and vanishes before Alistair finds you.',
      charId: 'elian',
      play: async function (onDone) {
        await runCard({
          id: 'chp_6_full',
          title: 'Chapter 6',
          subtitle: 'Smoke at the Treeline',
          speaker: 'ELIAN',
          palette: { bg: '#0a1410', glow: '#8aaa90', accent: '#cce0d0' },
          bg: null,
          beats: [
            { type: 'show', pose: '', wait: 700 },

            // ─── Section 1 · Morning aftermath ───────────────────────────
            { type: 'line', speaker: '', text: 'The next night.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'The room is empty of him now.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'Alistair woke at dawn, drank water without sitting, kissed the back of your hand briefly without meaning to, and left for his post on the south wall before you could decide whether he had done it or you had imagined it.', hold: 6000, cps: 22 },
            { type: 'line', speaker: '', text: 'Now it is dark again. He has not returned.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'You sit by the window. The cloak around your shoulders. The page warm in your sleeve.', hold: 3600, cps: 26 },

            // ─── Section 2 · The pull tightens ───────────────────────────
            { type: 'line', speaker: '', text: 'Moonlight over the outer courtyard. Cold stone silvered pale.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Your hand rests against the glass. The pull beneath your ribs tightening slowly.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Somewhere beyond the castle grounds: forest. Dark. Waiting.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You should stay inside.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'Alistair is on patrol. The door he showed you is two corridors away.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'You take one step toward the bed instead.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'The pull tightens sharply.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'Your breath catches. Not pain. Recognition.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Like something far away realising you have finally turned toward it.', hold: 3400, cps: 26 },

            // ─── Section 3 · Walking out ─────────────────────────────────
            { type: 'line', speaker: '', text: 'Close on your fingers against the window glass. A faint tremor running through them.', hold: 3400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* What are you.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'No answer. Only the feeling. Steady. Patient.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Your feet move before the decision fully forms.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'Narrow servant stairs. Moonlight through slitted windows. The castle sleeping around you.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'You walk carefully. Every instinct whispering this is dangerous.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You continue anyway.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'The postern door. Unlocked. The same door Alistair showed you.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Your hand hesitates on the latch.', hold: 2200, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* He told me this in case I needed it.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* I do not think this is what he meant.', hold: 2800, cps: 26 },

            // ─── Section 4 · Into the trees ──────────────────────────────
            { type: 'line', speaker: '', text: 'The door opens. Cold night air rushes in. Wet earth. Pine. Smoke.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'The forest beyond the castle wall. Black against the silver sky.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'The pull settles immediately. Satisfied. Like a thread finally drawn taut.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'You step into the trees.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'Branches overhead. Moonlight fractured through leaves. The castle fading behind you.', hold: 3600, cps: 26 },

            // ─── Section 5 · Wrong silence ───────────────────────────────
            { type: 'line', speaker: '', text: 'You realise something slowly.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'The forest sounds different tonight.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'No insects. No owls. Nothing.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'Silence thickens.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'Then. Smoke.', hold: 2000, cps: 28 },

            // ─── Section 6 · The smoke ───────────────────────────────────
            { type: 'line', speaker: '', text: 'Thin grey ribbons winding between the trees ahead. Not campfire smoke. Too cold. Too slow.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'Your pulse stumbles. You know this smoke.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'The creature in the moss. Black ribbons leaking from its mouth.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'The smoke ahead twists sharply. Like it smelled you.', hold: 3000, cps: 26 },

            // ─── Section 7 · The creature ────────────────────────────────
            { type: 'line', speaker: '', text: 'You step backward instinctively. A branch cracks beneath your heel.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Silence. Then movement. Fast.', hold: 2400, cps: 28 },
            { type: 'line', speaker: '', text: 'Something large bursts through the trees. Not the same creature. Different.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'Longer limbs. Antlers warped sideways through its skull. Eyes white and blind.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'Its jaw hanging slightly open as though the bones no longer fit together correctly.', hold: 3800, cps: 24 },
            { type: 'line', speaker: '', text: 'It moves wrong. Not animal speed. Something faster.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Jerking. Stopping. Then suddenly too close.', hold: 2800, cps: 26 },

            // ─── Section 8 · The chase ───────────────────────────────────
            { type: 'line', speaker: '', text: 'You run.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'Branches tearing at your sleeves. Your ankle protesting immediately.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Behind you: wet dragging sounds. Heavy breathing. Branches splintering.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'You nearly fall. Catch yourself against a tree.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'The hidden page presses hard against your wrist. Burning.', hold: 3000, cps: 26 },

            // ─── Section 9 · The scream · the arrow ──────────────────────
            { type: 'line', speaker: '', text: 'The creature screams.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'Not loud. Worse. Human.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'You freeze. Only for a second. The creature lunges.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: '*THNK.*', hold: 1400, cps: 28 },
            { type: 'line', speaker: '', text: 'An arrow through the creature’s throat.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Momentum carries it sideways. It crashes through dead brush. Thrashing.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Another arrow. Straight through the eye. Silence.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Smoke leaks slowly from the body. Curling upward through the trees.', hold: 3200, cps: 26 },

            // ─── Section 10 · Behind you ─────────────────────────────────
            { type: 'line', speaker: '', text: 'You stare. Breathing too fast.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'Then you realise someone is standing behind you. Very close.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You turn.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'A man in dark green leathers. Bow lowered. A hood shadowing most of his face.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'One streak of silver threaded through black hair.', hold: 2800, cps: 26 },

            // ─── Section 11 · First exchange ─────────────────────────────
            { type: 'line', speaker: '', text: 'His eyes move over you quickly. Not lingering. Assessing.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Then to the castle visible through the distant trees. Then back to you.', hold: 3200, cps: 26 },
            { type: 'line', text: 'You should not be here.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'His voice is calm. Too calm. Like the forest belongs to him and you have entered it incorrectly.', hold: 4000, cps: 24 },
            { type: 'line', speaker: 'YOU', text: 'I could say the same thing to you.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'A beat. One corner of his mouth shifts very slightly.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Not amusement. Recognition of audacity.', hold: 2600, cps: 26 },
            { type: 'line', text: 'You walked into Thornwood alone at night.', hold: 2800, cps: 26 },
            { type: 'line', text: 'I do not think you are in a position to criticise anyone’s decisions.', hold: 3400, cps: 26 },

            // ─── Section 12 · The body ───────────────────────────────────
            { type: 'line', speaker: '', text: 'The dead creature behind him collapses inward. Smoke slipping from the wounds.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Elian watches the smoke carefully. Hand already reaching for another arrow. Prepared for it to rise again.', hold: 4200, cps: 24 },
            { type: 'line', speaker: '', text: 'It does not. Slowly, he lowers the bow.', hold: 2800, cps: 26 },

            // ─── Section 13 · He notices everything ──────────────────────
            { type: 'line', speaker: '', text: 'Close. His gaze returns to you. This time slower. More focused.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Noticing: the borrowed cloak.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'The bruising at your wrist.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'The mud on your hem.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'The hidden tension in your stance.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'His eyes stop at your sleeve. Exactly where the page rests hidden.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Something unreadable passes across his face. Gone quickly.', hold: 2800, cps: 26 },

            // ─── Section 14 · Hungry ─────────────────────────────────────
            { type: 'line', speaker: 'YOU', text: 'What was that thing?', hold: 2200, cps: 28 },
            { type: 'line', text: 'Hungry.', hold: 2000, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'That is not an answer.', hold: 2200, cps: 26 },
            { type: 'line', text: 'It is the only one that matters tonight.', hold: 2800, cps: 26 },

            // ─── Section 15 · Smoke spreading ────────────────────────────
            { type: 'line', speaker: '', text: 'He crouches beside the body. Touches the blackened edge of one antler.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'His fingers come away dusted grey.', hold: 2400, cps: 26 },
            { type: 'line', text: 'The smoke is spreading farther south.', hold: 2800, cps: 26 },
            { type: 'line', text: 'That is new.', hold: 2000, cps: 28 },

            // ─── Section 16 · Your captain ───────────────────────────────
            { type: 'line', speaker: '', text: 'He rises. Looks toward the trees beyond you. Toward the direction of the castle.', hold: 3600, cps: 26 },
            { type: 'line', text: 'Your captain will notice you are gone soon.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'You know him?', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Silence.', hold: 1800, cps: 28 },
            { type: 'line', text: 'Everyone in Thornwood knows the man who keeps walking into wounds and surviving them.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'Your chest tightens unexpectedly.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'Elian notices. His gaze sharpens slightly.', hold: 2600, cps: 26 },

            // ─── Section 17 · The horn ───────────────────────────────────
            { type: 'line', speaker: '', text: 'A distant horn. Faint through the trees.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Once. Then again.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Alistair.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'You turn instinctively toward the sound.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'When you look back, Elian is already several steps deeper into the trees.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Moving silently. Not retreating. Melting back into the forest.', hold: 3000, cps: 26 },

            // ─── Section 18 · Wait ───────────────────────────────────────
            { type: 'line', speaker: 'YOU', text: 'Wait.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'He stops. Does not turn around.', hold: 2400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'Who are you?', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'Long silence. Wind moving softly through branches overhead.', hold: 3000, cps: 26 },
            { type: 'line', text: 'Someone trying very hard not to bury another Weaver.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Your breath catches.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'He disappears into the dark before you can speak again.', hold: 2800, cps: 26 },

            // ─── Section 19 · Final shot ─────────────────────────────────
            { type: 'line', speaker: '', text: 'You standing alone among the trees.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Alistair’s horn echoing through the forest.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'And smoke still curling upward from the dead thing at your feet.', hold: 3400, cps: 26 },

            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_elian_seen','1'); } catch (_) {}
        try { localStorage.setItem('pp_met_elian','1'); } catch (_) {}
        // Stranger Rule (Jun 2026): Elian never speaks the line "I'm
        // Elian" — his name reaches the player through narration in
        // Ch6. So we flip the introduced flag when Ch6 completes, as
        // his speaker label stays STRANGER throughout his own chapter
        // (correct — the player learns it from narrator beats), then
        // reads ELIAN from Ch7 onwards. See premium-card.js.
        try { localStorage.setItem('pp_introduced_elian','1'); } catch (_) {}
        markDone(6); setCurrent(nextIdAfter(6));
        if (onDone) onDone();
      }
    },

    // ═════════════════════════════════════════════════════════════════════
    // CHAPTER 7 — THE WARDEN
    // Owner-approved PDF conversion (June 2026). ~140 beats.
    // Elian carries MC to his hidden hut. Herbs put her to sleep. She wakes
    // to find him on the floor. Bandage-change scene. The forest-sick
    // reveal. The ruin / one-survivor lead. Multi-day stay. Tension between
    // them established: kind and cold. Closes with the captain/warden
    // contrast and "...recognition becoming attachment."
    // ═════════════════════════════════════════════════════════════════════
    {
      id: 7,
      title: 'Chapter 7',
      subtitle: 'The Warden',
      teaser: 'His back. His bed. His herbs. The forest is sick, and somewhere east there is one survivor who might know your name.',
      charId: 'elian',
      play: async function (onDone) {
        await runCard({
          id: 'chp_7_full',
          title: 'Chapter 7',
          subtitle: 'The Warden',
          speaker: 'ELIAN',
          palette: { bg: '#161812', glow: '#c2a575', accent: '#dde0d0' },
          bg: null,
          beats: [
            { type: 'show', pose: '', wait: 700 },

            // ─── Section 1 · Agreed to go ────────────────────────────────
            { type: 'line', speaker: '', text: 'You agreed to go with him.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'You do not know why exactly.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'Perhaps because he seems to know a lot. Perhaps because you have a clue now.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'A new lead. The kind of lead you do not turn from when you have nothing else.', hold: 3600, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* A man steps out of a forest with a bow and no surprise on his face.', hold: 3600, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* That is not a coincidence.', hold: 2400, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* That is something to follow.', hold: 2400, cps: 28 },

            // ─── Section 2 · The leg gives ───────────────────────────────
            { type: 'line', speaker: '', text: 'You take three steps. Your leg gives. You catch yourself on his arm.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'He waits. He does not catch you. He lets you find the ground again.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Then, only then, when it is clear the leg will not carry you, he sighs.', hold: 3400, cps: 26 },
            { type: 'line', text: '*(quiet)* Get on.', hold: 2000, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '...what.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'He has turned. Crouched. Offered his back.', hold: 2600, cps: 26 },
            { type: 'line', text: 'Get on, mi’lady. You will not walk this on your own.', hold: 3000, cps: 26 },
            { type: 'line', text: 'And I am not carrying you in my arms. You would not let me, and I would not be quick if I did.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'You hesitate.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Then you climb on his back. Your arms around his shoulders.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Your bandaged ankle held loose at his hip. He stands like you weigh nothing.', hold: 3400, cps: 26 },

            // ─── Section 3 · The walk ────────────────────────────────────
            { type: 'line', speaker: '', text: 'The walk is long.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'You expect a fire camp, the way men in stories camp. Instead he moves like a man going home.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'He smells of woodsmoke. Crushed pine. Cold cloth. Something green and old you cannot name.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'The smell is steady. It is the same smell every breath.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* ...his earthy scent steadies me.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* I did not realise I needed steadying.', hold: 2800, cps: 26 },

            // ─── Section 4 · The hut ─────────────────────────────────────
            { type: 'line', speaker: '', text: 'The trees thin. Then they thicken again, on purpose, the way a curtain is drawn.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'He has walked you through a fold in the wood.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'The hut sits in a hollow you would not have seen from twenty paces away.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Stone foundation. Wooden walls dark with age. A roof half buried in moss. A single window.', hold: 3800, cps: 26 },
            { type: 'line', text: 'We are here.', hold: 2000, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '*(quiet)* ...where.', hold: 1800, cps: 28 },
            { type: 'line', text: 'As you can see, it is a small hut. But it is the best place to hide and rest.', hold: 3400, cps: 26 },

            // ─── Section 5 · Setting her down ────────────────────────────
            { type: 'line', speaker: '', text: 'He pushes the door open with one hand. Carries you in.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'Sets you down gently on a wooden chair by the fire-pit.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Crouches so his eyes are level with yours for a moment. Looks at you.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Then he stands and turns back to the room.', hold: 2400, cps: 26 },
            { type: 'line', text: '*(mild)* The hearth. The water barrel is by the door. Dried meat in the rafter. The bed is...', hold: 3800, cps: 24 },
            { type: 'line', speaker: '', text: 'He keeps speaking. You can see his mouth moving. You cannot hear him.', hold: 3200, cps: 26 },

            // ─── Section 6 · Blood loss ──────────────────────────────────
            { type: 'line', speaker: '', text: 'Close on your hand. It has gone cold.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'The blood loss is hitting you now that the running is over.', hold: 3000, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* ...a stranger is telling me where the food is.', hold: 3000, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* A stranger has put me on a chair and is telling me where his food is.', hold: 3600, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* I do not know my own name. He does not know my name. He is telling me where the food is anyway.', hold: 4400, cps: 24 },

            // ─── Section 7 · The drink ───────────────────────────────────
            { type: 'line', speaker: '', text: 'He notices.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'He stops mid-sentence. Crouches again.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Takes a clay cup from a low shelf, fills it from a small pot already at the edge of the fire-pit, holds it out.', hold: 4400, cps: 24 },
            { type: 'line', text: 'Drink this. It is herbs I collected and brewed myself.', hold: 3000, cps: 26 },
            { type: 'line', text: 'It will ease your pain and help you sleep through the night.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'You take the cup.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'It is warm. The water is dark green.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'It smells of pine and bitter root and something faintly sweet underneath.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You drink. You do not ask what is in it.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'You do not have the strength to be careful.', hold: 2400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(quiet)* Thank you.', hold: 2000, cps: 28 },

            // ─── Section 8 · His bed ─────────────────────────────────────
            { type: 'line', speaker: '', text: 'He nods once. Looks away.', hold: 2000, cps: 28 },
            { type: 'line', text: 'Drink. And rest. Sleep on my bed.', hold: 2600, cps: 26 },
            { type: 'line', text: 'I am going to freshen up. I am in a state after the long walk.', hold: 3200, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '...but where are you going to sleep.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'He has already turned away. He answers without looking back.', hold: 2800, cps: 26 },
            { type: 'line', text: 'Do not worry about me. Sleep.', hold: 2400, cps: 26 },

            // ─── Section 9 · The bed ─────────────────────────────────────
            { type: 'line', speaker: '', text: 'The bed is a low wooden frame, a wool mattress, a single blanket the colour of moss.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'It smells like he does.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'You lie down.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'You meant to stay awake long enough to be cautious. You meant to keep a hand near your sleeve.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'The herbs take you before you have made the second decision.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Black.', hold: 1600, cps: 28 },

            // ─── Section 10 · Morning ────────────────────────────────────
            { type: 'line', speaker: '', text: 'Some hours pass.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Morning.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'Light through the single window. Pale gold. The hut is warm. There is no fire now, only embers.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'You open your eyes. You do not move yet.', hold: 2600, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* ...I slept.', hold: 1800, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* I slept all the way through.', hold: 2400, cps: 26 },

            // ─── Section 11 · Slept without fear ─────────────────────────
            { type: 'line', speaker: '', text: 'You sit up slowly. The pain in the ankle is there but small. The herbs worked.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'Whatever was in that cup was not ordinary.', hold: 2600, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* I was supposed to be afraid.', hold: 2400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* That was the plan. That was the careful thing.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* I forgot to be afraid. I just slept.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'You sit with that for a moment. The strangeness of it.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'The strangeness of having stopped being afraid in a stranger’s bed, in a stranger’s hut, in a wood that the stranger said is sick.', hold: 4400, cps: 24 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* What is wrong with me.', hold: 2400, cps: 26 },

            // ─── Section 12 · Hut by daylight ────────────────────────────
            { type: 'line', speaker: '', text: 'You stand. Test the leg. It holds, if you do not push it.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You limp toward the door, taking in the hut by daylight.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'A small table. A shelf of clay jars.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Drying herbs hung from a low beam, in bunches you do not know the names of.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'A wash-basin on a stand. A single wooden cup turned upside down.', hold: 3000, cps: 26 },

            // ─── Section 13 · Him on the floor ───────────────────────────
            { type: 'line', speaker: '', text: 'And by the cold hearth, on the floor.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'Him.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'Asleep on his side. A folded blanket under his head, no pillow.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'A fresh linen shirt, undone at the collar. The shirt has shifted in his sleep.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'His arm is bared from shoulder to wrist.', hold: 2600, cps: 26 },

            // ─── Section 14 · His scars ──────────────────────────────────
            { type: 'line', speaker: '', text: 'Closer. The muscles on his arm are more than you expected. Long. Quiet.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'The kind of strength you build by carrying weight no one knows you carry.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'Closest on the inside of his wrist where the sleeve has slipped back.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Pale scars. Thin. Old. Almost root-like.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'The kind of marks a forest might leave on a man who has belonged to it too long.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'You stare a little too long.', hold: 2200, cps: 28 },

            // ─── Section 15 · He speaks ──────────────────────────────────
            { type: 'line', speaker: '', text: 'His eyes are still closed when he speaks.', hold: 2400, cps: 26 },
            { type: 'line', text: '*(low)* How long are you going to stand there, watching me, mi’lady.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: '*...!*', hold: 1400, cps: 28 },
            { type: 'line', speaker: '', text: 'You flinch. Your face turns bright red. You step back so fast you hit the table.', hold: 3400, cps: 26 },

            // ─── Section 16 · He sits up ─────────────────────────────────
            { type: 'line', speaker: '', text: 'He sits up. Slowly. Pushes the hair off his face. Looks at you.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'There is no smirk. Just a faint, faint dryness at the corner of his mouth, gone almost before you see it.', hold: 4000, cps: 24 },
            { type: 'line', text: 'You are still limping.', hold: 2200, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '...I am sorry.', hold: 1800, cps: 28 },
            { type: 'line', text: 'For what.', hold: 1600, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '...for staring.', hold: 1800, cps: 28 },

            // ─── Section 17 · Bandaging ──────────────────────────────────
            { type: 'line', speaker: '', text: 'He stands. He is taller in the small hut than he was in the wood. The room is half his.', hold: 3800, cps: 26 },
            { type: 'line', text: 'Sit on the chair. I need to change the bandage.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'You sit. He kneels in front of you.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'He moves the same way he did last night. Practiced. Calm.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Like he has done this for many people.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'He unwraps the linen. The wound is cleaner than yesterday. The edges have started to close.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'He wets a fresh cloth in a small bowl. Begins to clean around it.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'His hands are large. They are gentle with you.', hold: 2600, cps: 26 },

            // ─── Section 18 · The almost-touch ───────────────────────────
            { type: 'line', speaker: '', text: 'You watch him work. You have so many questions.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'You are not sure where to start. You are not sure he will answer any of them.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Close on your free hand. It has drifted, without your permission, from the arm of the chair toward the back of his neck where the dark hair falls.', hold: 4800, cps: 22 },
            { type: 'line', speaker: '', text: 'You did not give it permission to move. It moves anyway.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Closer. You catch it a hand’s width from his nape.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Hold it suspended there for half a breath.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Set it carefully back on the arm of the chair.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'He has not looked up. He cannot have seen.', hold: 2600, cps: 26 },

            // ─── Section 19 · What is wrong with the forest ──────────────
            { type: 'line', speaker: '', text: 'He has not looked up. He keeps wrapping.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'The silence between you is the kind that has weight.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'You break it anyway.', hold: 2000, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '...what is wrong with the forest.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'His hands do not stop. There is the smallest pause, almost not a pause. Then he keeps wrapping.', hold: 3800, cps: 24 },
            { type: 'line', speaker: '', text: 'He does not answer for a long beat. Long enough that you think he might not answer at all.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'Then.', hold: 1400, cps: 28 },
            { type: 'line', text: '*(quiet)* You are asking the right question first, mi’lady.', hold: 3000, cps: 26 },
            { type: 'line', text: 'Most people ask the wrong one.', hold: 2400, cps: 26 },
            { type: 'line', text: 'The forest is sick.', hold: 2000, cps: 28 },
            { type: 'line', text: 'It is losing pieces of itself.', hold: 2400, cps: 28 },

            // ─── Section 20 · The deer ───────────────────────────────────
            { type: 'line', speaker: '', text: 'He ties off the new wrap. Does not let go of your ankle yet. Looks at it instead of at you.', hold: 3800, cps: 26 },
            { type: 'line', text: 'A deer ran past me yesterday with no reflection in the stream.', hold: 3200, cps: 26 },
            { type: 'line', text: 'The water just forgot to hold it.', hold: 2400, cps: 26 },
            { type: 'line', text: 'And deeper in, past the stones I mark, something has started calling at night.', hold: 3800, cps: 26 },
            { type: 'line', text: '*(lower)* The dark is taking the world piece by piece, mi’lady.', hold: 3400, cps: 26 },

            // ─── Section 21 · I feel it ──────────────────────────────────
            { type: 'line', speaker: '', text: 'You swallow.', hold: 1800, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '*(quiet)* ...I feel it.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'He looks up.', hold: 1800, cps: 28 },
            { type: 'line', speaker: 'YOU', text: 'Something is pulling me. Like it needs me.', hold: 2800, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'But I do not understand. What am I. Who am I.', hold: 3200, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'I am so lost.', hold: 2200, cps: 28 },

            // ─── Section 22 · Some pulls ─────────────────────────────────
            { type: 'line', speaker: '', text: 'He does not answer for a while.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'He sets your foot down. He stands. He goes to the shelf and pours water from a jug into the small green pot at the hearth.', hold: 4400, cps: 24 },
            { type: 'line', speaker: '', text: 'Sets it on the embers to warm.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'With his back to you, he speaks.', hold: 2400, cps: 26 },
            { type: 'line', text: 'Some pulls are not safe to follow alone.', hold: 2800, cps: 26 },
            { type: 'line', text: 'That is why I will not let you walk these trees by yourself.', hold: 3200, cps: 26 },

            // ─── Section 23 · The captain did not tell you ───────────────
            { type: 'line', speaker: '', text: 'He turns. Looks at you. Long beat. He is deciding something.', hold: 3200, cps: 26 },
            { type: 'line', text: '*(quieter)* You are searching for an answer, aren’t you, mi’lady.', hold: 3400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: 'Yes.', hold: 1600, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '...do you know the answer.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'He does not look away from you.', hold: 2200, cps: 28 },
            { type: 'line', text: 'So the captain did not tell you.', hold: 2600, cps: 26 },
            { type: 'line', text: '*(almost to himself)* That is strange of him. He should have reported this by now.', hold: 3600, cps: 26 },

            // ─── Section 24 · The ruin · one survivor ────────────────────
            { type: 'line', speaker: '', text: 'He sets the cup down on the table between you. Carefully.', hold: 2800, cps: 26 },
            { type: 'line', text: 'I am not the right person to tell you, mi’lady.', hold: 3000, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(quiet)* ...then who.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'He sits, finally, across from you. Forearms on his knees.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'He chooses his words the way a man chooses footing on wet stone.', hold: 3200, cps: 26 },
            { type: 'line', text: 'Deep in the ancient ruin. East of here. Past the rotting wood, past the markers.', hold: 3800, cps: 26 },
            { type: 'line', text: 'There was a people there once. They were wiped out.', hold: 2800, cps: 26 },
            { type: 'line', text: 'Long before your great-great-grandmother was a thought.', hold: 3000, cps: 26 },
            { type: 'line', text: 'One of them survived. Only one.', hold: 2600, cps: 26 },
            { type: 'line', text: 'That person might have an answer for you. They will know what I will not say.', hold: 3600, cps: 26 },

            // ─── Section 25 · Relief ─────────────────────────────────────
            { type: 'line', speaker: '', text: 'Close on your face.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'For the first time since you have memories, something in your chest unclenches.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'Not joy. Not exactly.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'The opposite of the cold weight you have been carrying since you woke in the moss.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'A relief. The relief of having, at last, a direction that is not just a pull.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'He notices.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'His face does not move. But something behind his eyes closes, the way a man steps back from a fire he meant to admire only briefly.', hold: 4600, cps: 22 },
            { type: 'line', speaker: '', text: 'He looks at the cup on the table instead of at you.', hold: 2800, cps: 26 },

            // ─── Section 26 · Will you help me ───────────────────────────
            { type: 'line', speaker: 'YOU', text: '*(quiet)* Will you help me.', hold: 2200, cps: 28 },
            { type: 'line', text: 'Not yet.', hold: 1800, cps: 28 },
            { type: 'line', text: 'You are still weak. You would not last the walk in the state you are in.', hold: 3400, cps: 26 },
            { type: 'line', text: 'The wood between here and the ruin is the worst of it.', hold: 3000, cps: 26 },
            { type: 'line', text: 'The pull would have you again before nightfall.', hold: 2800, cps: 26 },
            { type: 'line', text: '*(lower)* You are safe here. No one will find this hut.', hold: 3000, cps: 26 },
            { type: 'line', text: 'Not the captain. Not the things that hunt you. Heal first.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'He looks up. Steady.', hold: 2000, cps: 28 },
            { type: 'line', text: 'Then I will walk you to the ruin, mi’lady. When you are ready. Not before.', hold: 3600, cps: 26 },

            // ─── Section 27 · Eye contact · breaks first ─────────────────
            { type: 'line', speaker: '', text: 'You hold his eyes for a moment. He breaks first. He looks at the cup on the table instead.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'He stands. Takes a folded cloth from a low shelf. Crosses to a basin in the back of the room.', hold: 3600, cps: 26 },
            { type: 'line', text: '*(without turning)* The water barrel is by the door. The screen at the back is for washing.', hold: 3800, cps: 26 },
            { type: 'line', text: 'The jars on the upper shelf are for cooking. The jars on the lower shelf are medicine.', hold: 3600, cps: 26 },
            { type: 'line', text: 'Do not move them. The order matters.', hold: 2600, cps: 26 },

            // ─── Section 28 · Watching him from behind ───────────────────
            { type: 'line', speaker: '', text: 'You sit with the warmth of the cup in your hands. Watching him from behind.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'You catch yourself admiring him.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'He notices.', hold: 1600, cps: 28 },
            { type: 'line', speaker: '', text: 'He ignores it.', hold: 1800, cps: 28 },

            // ─── Section 29 · More days ──────────────────────────────────
            { type: 'line', speaker: '', text: 'More days.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Your foot is healing under the potion he keeps brewing.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'The hut becomes familiar. The chair he set you on. The cup he refilled. The floor where he slept.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'He has not slept anywhere else. He has not asked to.', hold: 2800, cps: 26 },

            // ─── Section 30 · Kind and cold ──────────────────────────────
            { type: 'line', speaker: '', text: 'He is kind to you. He is also somewhere else.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'There is a tension you cannot explain between you and him. Kind and cold at the same time.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'Something must have happened to him. You do not know what. You do not ask.', hold: 3400, cps: 26 },

            // ─── Section 31 · His routine ────────────────────────────────
            { type: 'line', speaker: '', text: 'He goes out at first light.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'He comes back at midday with herbs in a satchel and his bow across his back.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'He brings you water. He does not touch your hand when he passes the cup.', hold: 3400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* The captain looked at me like he was afraid I would shatter.', hold: 3400, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* The warden looks at me like he is afraid I will catch.', hold: 3200, cps: 26 },

            // ─── Section 32 · Recognition becoming attachment ────────────
            { type: 'line', speaker: '', text: 'He is waiting for something. You can feel it.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'You cannot tell whether he is waiting for you to be well, or waiting for you to be ready, or waiting for himself to be ready.', hold: 4400, cps: 24 },
            { type: 'line', speaker: '', text: 'Closer on his profile by the firelight when he thinks you are not looking.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'Not softness. Something more dangerous.', hold: 2600, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(very small)* ...recognition becoming attachment.', hold: 3000, cps: 26 },
            { type: 'line', speaker: 'YOU', text: '*(thought)* ...he does not want to feel it. He feels it anyway.', hold: 3400, cps: 26 },

            // ─── Section 33 · Final ──────────────────────────────────────
            { type: 'line', speaker: '', text: 'End on the small hut at dusk. Smoke from the chimney. A single window lit warm.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'The wood around it, quiet for now.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Both of you inside, not speaking.', hold: 2600, cps: 28 },

            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_elian_seen','1'); } catch (_) {}
        try { localStorage.setItem('pp_met_elian','1'); } catch (_) {}
        markDone(7); setCurrent(nextIdAfter(7));
        if (onDone) onDone();
      }
    },

    // ═════════════════════════════════════════════════════════════════════
    // CHAPTER 8 — TWO STONES BY THE CREEK
    // Owner-approved PDF conversion (June 2026). ~90 beats.
    // Elian takes MC to a clearing in the wood. Two graves. Both Weavers
    // he loved. Both taken by the kingdom. "I will not bury a third."
    // The forest recognised her before he did. He has not allowed
    // himself a third want. He has given her the word "Weaver" without
    // its meaning. Emotional centerpiece of the early Elian arc.
    // ═════════════════════════════════════════════════════════════════════
    {
      id: 8,
      title: 'Chapter 8',
      subtitle: 'Two Stones by the Creek',
      teaser: 'Two stones by the creek. He buried two Weavers in this clearing. He will not bury a third.',
      charId: 'elian',
      play: async function (onDone) {
        await runCard({
          id: 'chp_8_full',
          title: 'Chapter 8',
          subtitle: 'Two Stones by the Creek',
          speaker: 'ELIAN',
          palette: { bg: '#121a14', glow: '#b0c2a5', accent: '#e0e5d8' },
          bg: null,
          beats: [
            { type: 'show', pose: '', wait: 700 },

            // ─── Section 1 · More days · the hut becomes home ────────────
            { type: 'line', speaker: '', text: 'More days.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'The hut has stopped feeling like a stranger’s home.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'The chair has become your chair. The cup has become your cup.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'The blanket the colour of moss has the shape of your shoulders pressed into it.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'He has not stopped sleeping on the floor.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'You have stopped offering him the bed.', hold: 2400, cps: 26 },

            // ─── Section 2 · His small habits ────────────────────────────
            { type: 'line', speaker: '', text: 'You learn his small habits without meaning to.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'He boils the kettle twice before he pours, the second time for the herbs.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'He sharpens his knife in the doorway, not inside, because the shavings fall into the moss and feed it.', hold: 4200, cps: 24 },
            { type: 'line', speaker: '', text: 'He whistles a single phrase under his breath when he thinks you are asleep, the same five notes, and stops the second you stir.', hold: 4800, cps: 22 },
            { type: 'line', speaker: '', text: 'You learn the phrase. You do not hum it back.', hold: 2800, cps: 26 },

            // ─── Section 3 · He is careful ───────────────────────────────
            { type: 'line', speaker: '', text: 'He cooks for you in the mornings.', hold: 2200, cps: 28 },
            { type: 'line', speaker: '', text: 'He sets the bowl on the table and steps back before you reach for it, as if his hand might brush yours by accident if he is not careful.', hold: 5000, cps: 22 },
            { type: 'line', speaker: '', text: 'He is very careful.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'You watch him be careful.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'You stop being able to tell whether you want him to be less careful, or whether you want him to stop watching you long enough that you can be careful too.', hold: 5400, cps: 22 },

            // ─── Section 4 · The fourth morning ──────────────────────────
            { type: 'line', speaker: '', text: 'On the fourth morning, he wraps the fresh bandage and stands. He says nothing.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'He opens the door of the hut and waits for you to follow.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'You follow.', hold: 1800, cps: 28 },

            // ─── Section 5 · To the clearing ─────────────────────────────
            { type: 'line', speaker: '', text: 'He walks you off the path. North, along the creek.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'The water is cold and clean. The bank is moss.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'He does not talk. You do not ask.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'After a long walk, the trees open into a small clearing you would not have found on your own.', hold: 3800, cps: 26 },

            // ─── Section 6 · Two stones ──────────────────────────────────
            { type: 'line', speaker: '', text: 'Two stones.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Set into the moss. Old. Weather-worn. Side by side, but not touching.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'The grass between them is greener than the grass around them.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You stop at the edge of the clearing.', hold: 2200, cps: 28 },

            // ─── Section 7 · He kneels between them ──────────────────────
            { type: 'line', speaker: '', text: 'He walks to the stones. Crouches.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'Lays the palm of his hand flat on the first one. Then the second.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'He does this without ceremony, the way a man checks a sleeping child’s breathing.', hold: 3800, cps: 24 },
            { type: 'line', speaker: '', text: 'He stays kneeling between them for a long moment.', hold: 2800, cps: 26 },

            // ─── Section 8 · He apologises to them ───────────────────────
            { type: 'line', speaker: '', text: 'Then he speaks. To the stones, not to you.', hold: 2800, cps: 26 },
            { type: 'line', text: '*(very quiet)* I am sorry I have brought someone. It has been a long time.', hold: 3800, cps: 24 },

            // ─── Section 9 · They were Weavers ───────────────────────────
            { type: 'line', speaker: '', text: 'He stands. He does not turn to you yet.', hold: 2400, cps: 26 },
            { type: 'line', text: 'I buried them in this forest. A long time ago.', hold: 3000, cps: 26 },
            { type: 'line', text: 'They were the only people I have ever let past my treeline.', hold: 3200, cps: 26 },
            { type: 'line', text: 'They were Weavers. Both of them.', hold: 2800, cps: 26 },
            { type: 'line', text: 'The kingdom took them from these trees.', hold: 2600, cps: 26 },
            { type: 'line', text: 'I have been tending what was left ever since.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'You take half a step closer.', hold: 2200, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '*(quiet)* ...Weavers.', hold: 2400, cps: 26 },

            // ─── Section 10 · The page ───────────────────────────────────
            { type: 'line', speaker: '', text: 'Close on your hand.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Without deciding to, it has gone to the lining of your sleeve. To the page.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'You catch the movement before he can see it. You make yourself put your hand down.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'You are not fast enough.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'He saw.', hold: 1800, cps: 28 },

            // ─── Section 11 · He does not speak about it ─────────────────
            { type: 'line', speaker: '', text: 'He does not say anything about the page.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'He looks at the stones again, not at you.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'He has not turned the word Weaver into an explanation.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'He has put it down between you like an object on a table.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'You are meant to pick it up yourself, or not.', hold: 2800, cps: 26 },

            // ─── Section 12 · Both of them ───────────────────────────────
            { type: 'line', speaker: 'YOU', text: '...both of them.', hold: 2000, cps: 28 },
            { type: 'line', text: 'Yes, mi’lady.', hold: 2000, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '*(quieter)* ...you loved them.', hold: 2600, cps: 26 },

            // ─── Section 13 · He doesn't answer for a long time ──────────
            { type: 'line', speaker: '', text: 'He does not answer for a long time.', hold: 2400, cps: 26 },
            { type: 'line', speaker: '', text: 'When he speaks his voice is the same as it has been. Quiet. Level. Just a little further away.', hold: 4200, cps: 24 },
            { type: 'line', text: 'Yes.', hold: 1600, cps: 28 },
            { type: 'line', speaker: 'YOU', text: '...both.', hold: 1600, cps: 28 },
            { type: 'line', text: 'Not at the same time. The years between were long.', hold: 3000, cps: 26 },

            // ─── Section 14 · The first ──────────────────────────────────
            { type: 'line', text: 'The first I knew when I was younger than I look.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'He looks at the first stone. His face does something he does not let you see.', hold: 3600, cps: 26 },
            { type: 'line', text: '*(quieter)* I did not know what she was when I loved her.', hold: 3200, cps: 26 },
            { type: 'line', text: 'We were a long time together before the kingdom found her.', hold: 3200, cps: 26 },
            { type: 'line', text: 'I learned what she was the night they took her.', hold: 3000, cps: 26 },
            { type: 'line', text: 'I went to bring her back. I was not fast enough.', hold: 2800, cps: 26 },
            { type: 'line', text: 'I buried her here because she had loved this part of the wood.', hold: 3200, cps: 26 },

            // ─── Section 15 · The second ─────────────────────────────────
            { type: 'line', text: 'The second came many years later.', hold: 2600, cps: 26 },
            { type: 'line', text: 'I had decided I would not. I had stopped letting anyone past the trees.', hold: 3400, cps: 26 },
            { type: 'line', text: 'She walked through them anyway. She did not ask my permission.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'A breath that is almost a laugh, gone before it lands.', hold: 2800, cps: 26 },
            { type: 'line', text: 'I knew, by then. I told her, the first night.', hold: 2800, cps: 26 },
            { type: 'line', text: 'I thought, if she knew, I might be quick enough this time.', hold: 3200, cps: 26 },
            { type: 'line', text: '*(very quiet)* They took her in five years instead of ten.', hold: 3200, cps: 26 },
            { type: 'line', text: 'Because I knew. Because I had warned her. Because I tried.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'He looks at the second stone.', hold: 2200, cps: 28 },
            { type: 'line', text: 'I was not quick enough either time.', hold: 2800, cps: 26 },

            // ─── Section 16 · I will not bury a third ────────────────────
            { type: 'line', speaker: '', text: 'He turns to you, finally.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'His green eyes are wet, and unembarrassed about it, and very tired.', hold: 3400, cps: 26 },
            { type: 'line', text: 'That is the answer to the question you have not asked yet, mi’lady. About the cold.', hold: 4000, cps: 24 },
            { type: 'line', text: 'I have buried two of you in this clearing.', hold: 2800, cps: 26 },
            { type: 'line', text: 'I will not bury a third.', hold: 3200, cps: 26 },

            // ─── Section 17 · Grief that becomes yours ───────────────────
            { type: 'line', speaker: '', text: 'Close on your hand at your side. It has gone cold. Not from the wind. The cold is older than the wind.', hold: 4400, cps: 24 },
            { type: 'line', speaker: '', text: 'Closer on your face.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'Your own throat has done the thing throats do before tears, only the tears are not yours.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'Something has moved in you that you do not have a name for.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'It is not what you felt in the moss for the captain. It is older.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'It is the body’s recognition of grief that is not yours but has, somehow, also become yours.', hold: 4200, cps: 24 },

            // ─── Section 18 · You hold it ────────────────────────────────
            { type: 'line', speaker: '', text: 'You do not let it show on your face. You hold it inside the way he is holding his.', hold: 3600, cps: 26 },
            { type: 'line', speaker: '', text: 'Long silence.', hold: 1800, cps: 28 },
            { type: 'line', speaker: '', text: 'You do not move toward him. You do not move away.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'You understand, suddenly and completely, why he has been making his hands do other things every time you came near him.', hold: 4400, cps: 24 },

            // ─── Section 19 · You are afraid of me ───────────────────────
            { type: 'line', speaker: 'YOU', text: '*(very quiet)* ...you are afraid of me.', hold: 2800, cps: 26 },
            { type: 'line', text: 'I am afraid for you, mi’lady. That is different.', hold: 3000, cps: 26 },
            { type: 'line', text: 'But yes. I am also afraid of myself, where you are concerned.', hold: 3400, cps: 26 },
            { type: 'line', text: 'I have not allowed myself a third want.', hold: 2800, cps: 26 },
            { type: 'line', text: 'I would prefer not to begin now.', hold: 2800, cps: 26 },

            // ─── Section 20 · She does not ask ───────────────────────────
            { type: 'line', speaker: '', text: 'You want to ask him what a Weaver is. You can feel the question rising in your throat.', hold: 3800, cps: 26 },
            { type: 'line', speaker: '', text: 'You also know, looking at him standing between his two stones, that he will not answer that question today.', hold: 4200, cps: 24 },
            { type: 'line', speaker: '', text: 'He has given you the word. He has not given you the meaning.', hold: 3200, cps: 26 },
            { type: 'line', speaker: '', text: 'The meaning would cost him a vow he has been keeping for centuries.', hold: 3400, cps: 26 },
            { type: 'line', speaker: '', text: 'You do not ask.', hold: 2000, cps: 28 },

            // ─── Section 21 · The forest recognised you ──────────────────
            { type: 'line', speaker: '', text: 'But Elian speaks again. Quieter than before. Looking at the second stone, not at you.', hold: 3800, cps: 26 },
            { type: 'line', text: '*(very quiet)* The forest recognised you before I did, mi’lady.', hold: 3600, cps: 26 },
            { type: 'line', text: 'That should concern you more than it does.', hold: 3200, cps: 26 },

            // ─── Section 22 · Final ──────────────────────────────────────
            { type: 'line', speaker: '', text: 'You stand together at the edge of the clearing.', hold: 2600, cps: 26 },
            { type: 'line', speaker: '', text: 'The wind moves through the leaves. The greener grass between the two stones bends and rises again.', hold: 4000, cps: 24 },
            { type: 'line', speaker: '', text: 'End on the two stones.', hold: 2000, cps: 28 },
            { type: 'line', speaker: '', text: 'His hand, lowered, brushing the bark of a tree.', hold: 2800, cps: 26 },
            { type: 'line', speaker: '', text: 'Your hand, lowered, brushing the lining of your sleeve.', hold: 3000, cps: 26 },
            { type: 'line', speaker: '', text: 'Both of you holding something the other has seen and not spoken of.', hold: 3600, cps: 26 },

            { type: 'hide' }
          ]
        });
        try { localStorage.setItem('pp_ms_encounter_elian_seen','1'); } catch (_) {}
        try { localStorage.setItem('pp_met_elian','1'); } catch (_) {}
        markDone(8); setCurrent(nextIdAfter(8));
        if (onDone) onDone();
      }
    }

    // ── CHAPTER 9 onward will be appended here.
    // ────────────────────────────────────────────────────────────────────
  ];

  const CHAPTER_COUNT = CHAPTERS.length;

  // ---------------------------------------------------------------
  function chapterById(id) { return CHAPTERS.find(c => c.id === id); }
  function currentChapter() { return chapterById(getCurrent()); }
  function indexOfId(id) { return CHAPTERS.findIndex(c => c.id === id); }
  function nextIdAfter(id) {
    const i = indexOfId(id);
    if (i < 0) return null;
    const next = CHAPTERS[i + 1];
    return next ? next.id : id + 1;  // +1 past end signals "all done"
  }
  function allDone() {
    // Every chapter in the array must have its done flag set.
    return CHAPTERS.every(c => isDone(c.id));
  }

  function playChapter(id, onDone) {
    const ch = chapterById(id);
    if (!ch || typeof ch.play !== 'function') return;
    // Kill the chapter list INSTANTLY (no fade) before the cinematic mounts.
    // The default closePage() runs a 420ms opacity fade; during that window
    // the mscard is fully visible on top, but the chp-page's character-
    // portrait thumbs (.chp-thumb) bleed through the mscard's semi-
    // transparent regions and appear as little "face pixel" pop-ins to
    // the player. Owner-reported visual bug. The fix is to remove the
    // chapter list synchronously here so there is zero overlap.
    closePage({ instant: true });
    // Detect bridges by id prefix. Bridges play out of chp-page taps too
    // (player advancing the story by tapping 'Begin' on the next bridge),
    // and after the bridge ends the bridge's own finish() fires the
    // route-open toast. Reopening chp-page underneath the toast clutters
    // the screen.owner reported the Elian toast appearing over chp-page.
    // For bridges, never reopen chp-page; the toast handles the next step.
    const isBridge = typeof id === 'string' && id.indexOf('b_') === 0;
    try {
      ch.play(() => {
        if (typeof onDone === 'function') {
          // External caller (e.g. PPChain.fireChapterFor) controls what
          // happens after the chapter.typically: clear chain-in-progress
          // and let the player land on the select grid.
          try { onDone(); } catch (_) {}
        } else if (!isBridge) {
          // Manual-replay path from the chapter menu.restore the menu.
          // Bridges skip this so the route-open toast lands on a clean
          // background.
          refreshOrb();
          openPageSoftly();
        } else {
          // Bridge tapped from chp-page.show the orb (so the player can
          // re-open the chapter list manually if they want), but don't
          // pop chp-page back over the toast.
          refreshOrb();
        }
      });
    } catch (_) {}
  }

  // ---------------------------------------------------------------
  // STYLES
  function injectStyles() {
    if (document.getElementById('chp-style')) return;
    const s = document.createElement('style');
    s.id = 'chp-style';
    // ─────────────────────────────────────────────────────────────────────
    // A5 IMPLEMENTATION — Main Story chapter list rebuilt with design tokens
    // (docs/design/DESIGN-SYSTEM.md). Premium parchment aesthetic, Cinzel
    // section labels, Cormorant Garamond body, gold filigree accents,
    // per-character left-border tint. Mode-aware via :root tokens.
    // ─────────────────────────────────────────────────────────────────────
    s.textContent = `
      /* ──────────────────────── ORB (floating Main Story button) ──────────────────────── */
      /* Moved to TOP-RIGHT (more discoverable) + made bigger (48px+ tap target,
         more prominent gold gradient, clear text label). */
      #${ORB_ID} {
        position: fixed;
        top: calc(18px + env(safe-area-inset-top, 0));
        right: 18px;
        min-height: 44px;
        padding: var(--s-3) var(--s-5);
        background: linear-gradient(180deg, var(--c-accent-gold), var(--c-accent-gold-soft));
        color: var(--c-bg-page);
        border: 1.5px solid var(--c-accent-gold);
        border-radius: var(--r-pill);
        font-family: var(--font-sans);
        font-weight: 700;
        font-size: var(--text-sm);
        letter-spacing: var(--ls-wider);
        text-transform: uppercase;
        cursor: pointer;
        z-index: var(--z-sticky);
        opacity: 0;
        pointer-events: none;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.28),
          0 6px 22px -4px rgba(184,146,62,0.65),
          0 0 32px rgba(184,146,62,0.20);
        transition: opacity var(--dur-base) var(--ease-tender),
                    transform var(--dur-quick) var(--ease-tender);
      }
      #${ORB_ID}.visible { opacity: 1; pointer-events: auto; }
      #${ORB_ID}:hover   { transform: translateY(-2px); }
      #${ORB_ID}:active  { transform: scale(0.96); }
      #${ORB_ID}.pulse   { animation: chpOrbPulse 2s var(--ease-tender) infinite; }
      @keyframes chpOrbPulse {
        0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), 0 6px 22px -4px rgba(184,146,62,0.65), 0 0 32px rgba(184,146,62,0.20); }
        50%      { box-shadow: inset 0 1px 0 rgba(255,255,255,0.34), 0 10px 32px -2px rgba(184,146,62,0.90), 0 0 56px rgba(184,146,62,0.40); }
      }

      /* ──────────────────────── PAGE ──────────────────────── */
      #${PAGE_ID} {
        position: fixed;
        inset: 0;
        z-index: var(--z-modal);
        display: flex;
        flex-direction: column;
        background-color: var(--c-bg-page);
        background-image:
          radial-gradient(ellipse at top, rgba(184,146,62,0.12) 0%, transparent 55%),
          linear-gradient(180deg, var(--c-bg-page) 0%, var(--c-bg-recessed) 100%);
        padding-top: env(safe-area-inset-top, 0);
        padding-bottom: env(safe-area-inset-bottom, 0);
        opacity: 0;
        transition: opacity var(--dur-slow) var(--ease-tender);
      }
      #${PAGE_ID}.visible { opacity: 1; }

      /* ──────────────────────── HEADER ──────────────────────── */
      #${PAGE_ID} .chp-head {
        padding: var(--s-5) var(--s-5) var(--s-3);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--s-3);
        border-bottom: 1px solid var(--c-line-fine);
      }
      #${PAGE_ID} .chp-title {
        font-family: var(--font-sans);
        font-weight: 500;
        font-size: var(--text-xs);
        letter-spacing: var(--ls-wider);
        text-transform: uppercase;
        color: var(--c-accent-gold);
        margin-bottom: var(--s-1);
      }
      #${PAGE_ID} .chp-sub {
        font-family: var(--font-sans);
        font-weight: 600;
        font-size: var(--text-xl);
        line-height: var(--lh-snug);
        letter-spacing: var(--ls-tight);
        color: var(--c-ink-emphasis);
      }
      #${PAGE_ID} .chp-close {
        /* Back-arrow icon button (replaces the old "close" pill).
           Square, centered, larger glyph for clear back affordance. */
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        min-height: 44px;
        padding: 0;
        background: transparent;
        color: var(--c-ink-mute);
        border: 1px solid var(--c-line-fine);
        border-radius: 50%;
        font-family: var(--font-serif);
        font-weight: 400;
        font-size: 22px;
        line-height: 1;
        text-transform: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all var(--dur-quick) var(--ease-tender);
      }
      #${PAGE_ID} .chp-close:hover {
        color: var(--c-ink-body);
        border-color: var(--c-accent-gold);
        transform: translateX(-2px);
      }
      #${PAGE_ID} .chp-close:active {
        transform: scale(0.94);
      }

      /* ──────────────────────── PROGRESS ──────────────────────── */
      #${PAGE_ID} .chp-progress {
        padding: var(--s-4) var(--s-5) var(--s-3);
      }
      #${PAGE_ID} .chp-progress-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: var(--s-3);
        margin-bottom: var(--s-2);
        font-family: var(--font-sans);
        font-weight: 500;
        font-size: var(--text-xs);
        letter-spacing: var(--ls-wider);
        text-transform: uppercase;
        color: var(--c-ink-mute);
      }
      #${PAGE_ID} .chp-progress-next {
        font-family: var(--font-sans);
        font-weight: 400;
        font-size: var(--text-sm);
        letter-spacing: var(--ls-base);
        text-transform: none;
        color: var(--c-accent-gold);
        max-width: 60%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #${PAGE_ID} .chp-progress-bar-bg {
        height: 2px;
        background: var(--c-line-rule);
        border-radius: 1px;
        overflow: hidden;
      }
      #${PAGE_ID} .chp-progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--c-accent-gold-soft), var(--c-accent-gold));
        transition: width var(--dur-slow) var(--ease-tender);
      }

      /* ──────────────────────── INTRO ──────────────────────── */
      #${PAGE_ID} .chp-intro {
        padding: var(--s-3) var(--s-6) var(--s-4);
        font-family: var(--font-sans);
        font-weight: 400;
        font-size: var(--text-sm);
        line-height: var(--lh-base);
        text-align: center;
        color: var(--c-ink-mute);
      }

      /* ──────────────────────── LIST ──────────────────────── */
      #${PAGE_ID} .chp-list {
        flex: 1;
        overflow-y: auto;
        padding: var(--s-2) var(--s-4) var(--s-7);
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      #${PAGE_ID} .chp-list::-webkit-scrollbar { display: none; }

      /* ──────────────────────── CARD ──────────────────────── */
      /* Velvet Hour mode: dark wine-velvet surface with subtle gold-glow
         sheen across the top. Replaces the parchment-cream gradient. */
      #${PAGE_ID} .chp-card {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--s-4);
        padding: var(--s-4) var(--s-5);
        margin-bottom: var(--s-3);
        background-color: var(--c-bg-surface);
        background-image: linear-gradient(165deg, rgba(43,17,51,0.0) 0%, rgba(122,18,36,0.18) 100%);
        border: 1px solid var(--c-line-fine);
        border-radius: var(--r-md);
        cursor: pointer;
        box-shadow:
          inset 0 1px 0 rgba(212,168,91,0.08),
          0 8px 24px -10px rgba(0,0,0,0.6);
        transition: transform var(--dur-base) var(--ease-tender),
                    box-shadow var(--dur-base) var(--ease-tender),
                    border-color var(--dur-base) var(--ease-tender);
      }

      /* Gold filigree corner accent (top-right) */
      #${PAGE_ID} .chp-card::before {
        content: '';
        position: absolute;
        top: 6px; right: 6px;
        width: 22px; height: 22px;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23B8923E' stroke-width='1' opacity='0.55'><path d='M2 2 L18 2 Q22 2 22 6 L22 22' stroke-linecap='round'/><circle cx='4' cy='4' r='0.8' fill='%23B8923E' stroke='none'/></svg>");
        background-repeat: no-repeat;
        pointer-events: none;
        opacity: 0.7;
      }

      #${PAGE_ID} .chp-card:not(.locked):hover {
        transform: translateY(-2px);
        border-color: var(--c-accent-gold);
        box-shadow:
          inset 0 1px 0 rgba(212,168,91,0.12),
          0 14px 40px -10px rgba(0,0,0,0.8),
          0 0 0 1px rgba(212,168,91,0.28);
      }

      /* Card thumb (portrait or glyph) */
      #${PAGE_ID} .chp-thumb {
        flex-shrink: 0;
        width: 56px; height: 56px;
        border-radius: 50%;
        border: 1.5px solid var(--c-accent-gold);
        background: var(--c-bg-elevated);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--c-accent-gold);
        font-family: var(--font-sans);
        font-weight: 600;
        font-size: var(--text-lg);
        overflow: hidden;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.4),
          0 2px 8px rgba(184,146,62,0.18);
      }
      #${PAGE_ID} .chp-thumb img {
        width: 100%; height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      /* Card text */
      #${PAGE_ID} .chp-text {
        flex: 1;
        min-width: 0;
        color: var(--c-ink-body);
      }
      #${PAGE_ID} .chp-text .c1 {
        font-family: var(--font-sans);
        font-weight: 500;
        font-size: var(--text-xs);
        letter-spacing: var(--ls-wider);
        text-transform: uppercase;
        color: var(--c-accent-gold);
        margin-bottom: var(--s-1);
      }
      #${PAGE_ID} .chp-text .c2 {
        font-family: var(--font-sans);
        font-weight: 600;
        font-size: var(--text-lg);
        line-height: var(--lh-snug);
        letter-spacing: var(--ls-tight);
        color: var(--c-ink-emphasis);
      }
      #${PAGE_ID} .chp-text .c3 {
        font-family: var(--font-sans);
        font-weight: 400;
        font-size: var(--text-sm);
        line-height: var(--lh-base);
        color: var(--c-ink-mute);
        margin-top: var(--s-1);
      }

      /* Card button (Begin / Replay / Locked) */
      #${PAGE_ID} .chp-play {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: var(--s-2) var(--s-5);
        background: linear-gradient(180deg, var(--c-accent-gold), var(--c-accent-gold-soft));
        color: var(--c-bg-page);
        border: 1px solid var(--c-accent-gold);
        border-radius: var(--r-md);
        font-family: var(--font-sans);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: var(--ls-wider);
        text-transform: uppercase;
        white-space: nowrap;
        cursor: pointer;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.20),
          0 4px 10px -4px rgba(184,146,62,0.4);
        transition: all var(--dur-quick) var(--ease-tender);
      }
      #${PAGE_ID} .chp-play:hover {
        transform: translateY(-1px);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.24),
          0 6px 14px -4px rgba(184,146,62,0.55);
      }
      #${PAGE_ID} .chp-play:active { transform: translateY(0); box-shadow: inset 0 1px 2px rgba(0,0,0,0.15); }

      /* Current chapter (next to play). soft gold-glow elevation */
      #${PAGE_ID} .chp-card.current {
        border-color: var(--c-accent-gold);
        background-image: linear-gradient(165deg, rgba(212,168,91,0.10) 0%, rgba(122,18,36,0.25) 100%);
        box-shadow:
          inset 0 1px 0 rgba(212,168,91,0.18),
          0 14px 40px -10px rgba(184,146,62,0.35),
          0 0 0 1px rgba(212,168,91,0.40);
      }

      /* Locked chapter */
      #${PAGE_ID} .chp-card.locked { opacity: 0.45; cursor: default; }
      #${PAGE_ID} .chp-card.locked::before { opacity: 0.3; }
      #${PAGE_ID} .chp-card.locked .chp-thumb { border-color: var(--c-ink-mute); color: var(--c-ink-mute); }
      #${PAGE_ID} .chp-card.locked .chp-text .c1 { color: var(--c-ink-mute); }
      #${PAGE_ID} .chp-card.locked .chp-play {
        background: transparent;
        color: var(--c-ink-mute);
        border-color: var(--c-line-fine);
        box-shadow: none;
      }
      #${PAGE_ID} .chp-card.locked .chp-play:hover { transform: none; box-shadow: none; }

      /* Per-character left-border tint */
      #${PAGE_ID} .chp-card.char-alistair { border-left: 3px solid #C4933F; }
      #${PAGE_ID} .chp-card.char-elian    { border-left: 3px solid #2F4A36; }
      #${PAGE_ID} .chp-card.char-lyra     { border-left: 3px solid #84A6B8; }
      #${PAGE_ID} .chp-card.char-caspian  { border-left: 3px solid #2A4978; }
      #${PAGE_ID} .chp-card.char-lucien   { border-left: 3px solid #3D335E; }
      #${PAGE_ID} .chp-card.char-noir     { border-left: 3px solid #0E0710; }
      #${PAGE_ID} .chp-card.char-proto    { border-left: 3px solid #3FB8B1; }

      /* ──────────────────────── TO BE CONTINUED CARD ──────────────────────── */
      #${PAGE_ID} .chp-tbc {
        margin: var(--s-4) var(--s-3) var(--s-3);
        padding: var(--s-5) var(--s-4);
        border: 1px dashed var(--c-line-fine);
        border-radius: var(--r-lg);
        background: linear-gradient(180deg, transparent, rgba(184,146,62,0.08));
        text-align: center;
      }
      #${PAGE_ID} .chp-tbc-title {
        font-family: var(--font-sans);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: var(--ls-widest);
        text-transform: uppercase;
        color: var(--c-accent-gold);
        margin-bottom: var(--s-2);
      }
      #${PAGE_ID} .chp-tbc-body {
        font-family: var(--font-sans);
        font-weight: 400;
        font-size: var(--text-sm);
        line-height: var(--lh-base);
        color: var(--c-ink-mute);
      }
    `;
    document.head.appendChild(s);
  }

  // ---------------------------------------------------------------
  // ORB — DELETED Jun 2026 per owner direction.
  // The floating "✦ MAIN x/y" gold pill is superseded by the
  // "CONTINUE STORY" card on the Companion Chronicle. The orb is no
  // longer rendered. ensureOrb() returns null; refreshOrb() handles
  // null gracefully (early return on line "if (!orb) return;").
  function ensureOrb() {
    return null;
  }

  function refreshOrb() {
    const sel = document.getElementById('select-screen');
    // Use COMPUTED display to detect "actually visible", not just .hidden
    // class.chain transitions hide via display:none, not the class.
    const selCS = sel && window.getComputedStyle ? window.getComputedStyle(sel) : null;
    const onSelect = sel && !sel.classList.contains('hidden')
      && (!selCS || (selCS.display !== 'none' && selCS.visibility !== 'hidden'));
    // Hide orb whenever the game container is up (player is in care, not
    // browsing) so the floating "Main 4/22" badge doesn't clutter care UI.
    const game = document.getElementById('game-container');
    const gameCS = game && window.getComputedStyle ? window.getComputedStyle(game) : null;
    const inCare = game && !game.classList.contains('hidden')
      && (!gameCS || (gameCS.display !== 'none' && gameCS.visibility !== 'hidden'));
    const pageOpen = !!document.getElementById(PAGE_ID);
    // ── Bleed guards (Jun 2026) ────────────────────────────────────
    // The orb must NEVER appear during the title→select cinematic
    // transition, while the title screen is still up, or during the
    // world-intro sequence. Without these guards, refreshOrb()'s 900ms
    // interval can fire mid-transition and the gold pill flashes
    // through the black overlay.
    const inTransition = document.body.classList.contains('cinematic-transition');
    const title = document.getElementById('title-screen');
    const titleVisible = title && !title.classList.contains('hidden');
    const intro = document.getElementById('world-intro');
    const introVisible = intro && !intro.classList.contains('hidden');
    const should = isEnabled() && onSelect && !inCare && !pageOpen
      && !inTransition && !titleVisible && !introVisible;
    const orb = should ? ensureOrb() : document.getElementById(ORB_ID);
    if (!orb) return;
    if (should) {
      orb.classList.add('visible');
      const doneCount = CHAPTERS.filter(c => isDone(c.id)).length;
      const total = CHAPTER_COUNT;
      orb.innerHTML = '✦ Main <span style="opacity:0.7;font-weight:500;margin-left:4px;">' + doneCount + '/' + total + '</span>';
      const cur = getCurrent();
      if (cur < CHAPTER_COUNT && !isDone(cur)) orb.classList.add('pulse');
      else orb.classList.remove('pulse');
    } else {
      orb.classList.remove('visible');
    }
    // Keep the inline Main Story button's count badge in sync too.
    refreshInlineMainStoryCount();
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
    // Set Velvet Hour theme so all design tokens flip to dark-mode values
    // (dark aubergine bg + gold accents + light text). Matches the title
    // screen's gothic-romantasy direction.
    root.setAttribute('data-theme', 'velvet');

    const head = document.createElement('div');
    head.className = 'chp-head';
    // Back arrow first (left), then title block (right).
    const close = document.createElement('button');
    close.className = 'chp-close';
    close.setAttribute('aria-label', 'Back');
    close.setAttribute('title', 'Back');
    close.textContent = '‹';
    close.addEventListener('click', closePage);
    head.appendChild(close);
    const titleBlock = document.createElement('div');
    titleBlock.innerHTML = '<div class="chp-title">✦ MAIN STORY</div><div class="chp-sub">Aethermoor</div>';
    head.appendChild(titleBlock);
    root.appendChild(head);

    // Progress section (token-based — see injectStyles)
    const doneCountAll = CHAPTERS.filter(c => isDone(c.id)).length;
    const progress = document.createElement('div');
    progress.className = 'chp-progress';
    progress.innerHTML =
      '<div class="chp-progress-row">'
      + '<span>' + doneCountAll + ' OF ' + CHAPTER_COUNT + '</span>'
      + (() => {
          // ── ONGOING-STORY FRAMING (May 2026 owner direction) ─────────
          // Owner: "main story have no ending, like Love and Deepspace."
          // Was: when allDone() → "FINALE CLEARED" (felt like a hard end).
          // Now: surface "more coming" so the player understands the
          // current arc closed but the world keeps going. Per-character
          // care endings (epilogues.js) still fire on their own — those
          // are the romance endings, which the owner wants to keep.
          if (allDone()) {
            return '<span class="chp-progress-next">✦ More coming ✦</span>';
          }
          const nx = chapterById(getCurrent());
          const label = nx ? (nx.title + (nx.subtitle ? ' · ' + nx.subtitle : '')) : 'Next';
          return '<span class="chp-progress-next">' + label + '</span>';
        })()
      + '</div>'
      + '<div class="chp-progress-bar-bg">'
      + '<div class="chp-progress-bar-fill" style="width:' + Math.round((doneCountAll / CHAPTER_COUNT) * 100) + '%;"></div>'
      + '</div>';
    root.appendChild(progress);

    const intro = document.createElement('div');
    intro.className = 'chp-intro';
    intro.textContent = 'Seven bonds to weave. Return here any time to continue.';
    root.appendChild(intro);

    const list = document.createElement('div');
    list.className = 'chp-list';
    const cur = getCurrent();
    const curIdx = indexOfId(cur);
    // Highest position of any done chapter. The unlock gate is based on this
    // (not on getCurrent's first-not-done) so that completing a later chapter
    // via the chain unlocks every earlier slot too. Without this, a player
    // who finishes Bridge Lucien (Ch14) by chain progression but never tapped
    // Arrival (Ch1) would see Ch12, Ch13, Ch15 stay locked forever even
    // though Ch14 already ran. Bug reported May 2026.
    let highestDoneIdx = -1;
    for (let i = 0; i < CHAPTERS.length; i++) {
      if (isDone(CHAPTERS[i].id)) highestDoneIdx = i;
    }
    // Maps each bridge entry id → the previous-character that must have
    // care-ready (affection 25 + full cycle) before the bridge unlocks.
    const BRIDGE_CARE_GATE = {
      b_elian: 'alistair', b_lyra: 'elian', b_caspian: 'lyra',
      b_lucien: 'caspian', b_noir: 'lucien', b_proto: 'noir'
    };

    CHAPTERS.forEach((ch, idx) => {
      const row = document.createElement('div');
      const done = isDone(ch.id);
      const isCurrent = ch.id === cur && !done;
      // "Locked" relative to the furthest progress the player has made.
      // Done chapters are NEVER locked (Replay must always work). The next
      // chapter after the highest done one is open. Anything beyond that
      // stays locked unless individually marked done.
      // Falls back to the legacy current-pointer gate only if NOTHING is
      // done yet (fresh save — keeps Prologue/Arrival as the first slot).
      const gateIdx = highestDoneIdx >= 0 ? highestDoneIdx + 1 : curIdx;
      const lockedByGate = gateIdx >= 0 ? idx > gateIdx : ch.id > cur;

      // Additional care-gate for bridge entries. Even if the chapter
      // pointer says a bridge is "current", it stays locked until the
      // PREVIOUS character's care is done. This is the same gate used
      // on the character-select grid.kept consistent so the chapter
      // menu doesn't allow a back-door past the tutorial.
      let lockedByCare = false;
      let careGateChar = null;
      if (typeof ch.id === 'string' && BRIDGE_CARE_GATE[ch.id]) {
        careGateChar = BRIDGE_CARE_GATE[ch.id];
        if (window.PPChain && window.PPChain.careReadyFor &&
            !window.PPChain.careReadyFor(careGateChar)) {
          lockedByCare = true;
        }
      }
      const locked = (lockedByGate || lockedByCare) && !done;
      // Per-character left-border tint via .char-<id> class (design-tokens A4)
      const charClass = ch.charId ? ' char-' + ch.charId : '';
      row.className = 'chp-card' + (locked ? ' locked' : '') + (isCurrent ? ' current' : '') + charClass;

      const thumb = document.createElement('div');
      thumb.className = 'chp-thumb';
      if (ch.charId && CHAR_PORTRAIT[ch.charId]) {
        const img = document.createElement('img');
        img.src = CHAR_PORTRAIT[ch.charId];
        img.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover;';
        img.onerror = () => { thumb.textContent = ch.charId[0].toUpperCase(); };
        thumb.appendChild(img);
      } else {
        // Glyph fallback for chapters with no character portrait. Numeric
        // ids show their number; named ids get a thematic glyph instead of
        // the raw id string (which previously rendered as e.g. "b_arrival").
        if (ch.id === 0) thumb.textContent = '✦';            // Prologue: 4-pointed star
        else if (ch.id === 8) thumb.textContent = '∞';       // Finale: infinity
        else if (ch.id === 'b_arrival') thumb.textContent = '☽'; // Arrival: crescent moon
        else if (typeof ch.id === 'number') thumb.textContent = String(ch.id);
        else thumb.textContent = '✧';                        // any other named chapter: open star
      }
      row.appendChild(thumb);

      // Lock reason text (used for inline label AND popup body)
      let lockReason = 'Complete the previous chapter first.';
      if (lockedByCare && careGateChar) {
        const NAME = careGateChar.charAt(0).toUpperCase() + careGateChar.slice(1);
        lockReason = 'Care for ' + NAME + ' first. Reach affection 25 and feed, wash, and talk to him at least once each.';
      }

      const text = document.createElement('div');
      text.className = 'chp-text';
      text.innerHTML =
        `<div class="c1">${ch.title}${done ? ' · ✓' : ''}</div>` +
        `<div class="c2">${locked ? '(locked)' : ch.subtitle}</div>`;
      // Teaser line removed at owner's request — was visually noisy.
      // Locked-chapter unlock instructions still surface via the
      // lock-popup that fires when a player taps a locked card.
      row.appendChild(text);

      const btn = document.createElement('button');
      btn.className = 'chp-play';
      btn.textContent = done ? 'Replay' : ((isCurrent && !locked) ? 'Begin' : 'Locked');
      // Tappable even when locked.opens a warning popup explaining why.
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (locked) {
          if (window.PPChain && window.PPChain.showLockPopup) {
            window.PPChain.showLockPopup({
              title: ch.title + (ch.subtitle ? ' · ' + ch.subtitle : ''),
              reason: lockReason
            });
          }
          return;
        }
        playChapter(ch.id);
      });
      row.appendChild(btn);

      list.appendChild(row);
    });
    // ── ONGOING-STORY PILL (May 2026) ──────────────────────────────
    // When the player has finished every authored chapter, show a soft
    // "to be continued" card at the bottom of the list. Communicates
    // that more is coming without declaring a finale.
    if (allDone()) {
      const tbc = document.createElement('div');
      tbc.className = 'chp-tbc';
      tbc.innerHTML = ''
        + '<div class="chp-tbc-title">✦  To  Be  Continued  ✦</div>'
        + '<div class="chp-tbc-body">'
        +   'The kingdom holds, for now. The next chapter is being written. Keep caring; they will be here when it lands.'
        + '</div>';
      list.appendChild(tbc);
    }
    root.appendChild(list);

    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('visible'));
    // Hide the orb while page is open
    const orb = document.getElementById(ORB_ID); if (orb) orb.classList.remove('visible');

    // Auto-scroll the next-up chapter into view so the player doesn't
    // have to scroll a long list to find what to play. Done in a frame
    // after mount + visible class so the page has time to lay out.
    requestAnimationFrame(() => {
      setTimeout(() => {
        const currentRow = root.querySelector('.chp-card.current');
        if (currentRow && typeof currentRow.scrollIntoView === 'function') {
          try {
            currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch (_) {
            // Older browsers.fallback to no-options form
            currentRow.scrollIntoView();
          }
        }
      }, 220);
    });
  }

  function closePage(opts) {
    const root = document.getElementById(PAGE_ID);
    if (!root) return;
    const instant = opts && opts.instant === true;
    // Fallback chain.same logic regardless of fade vs instant. Pulled
    // into a closure so both paths use it.
    const finalize = () => {
      try { root.remove(); } catch (_) {}
      // If closing this page would leave the screen blank (title hidden,
      // game container hidden, select hidden).fall back to character
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
    };
    if (instant) {
      // Disable the opacity transition for this teardown so we don't
      // get a 420ms fade where the .chp-thumb portrait circles bleed
      // through the mscard. Element is also set display:none in case
      // any layout pass briefly references it.
      root.style.transition = 'none';
      root.style.opacity = '0';
      root.style.display = 'none';
      root.classList.remove('visible');
      finalize();
      return;
    }
    root.classList.remove('visible');
    setTimeout(finalize, 440);
  }

  function openPageSoftly() { setTimeout(openPage, 300); }

  // ---------------------------------------------------------------
  // INLINE MAIN STORY BUTTON — wires up the static button in index.html
  // (#select-main-story-btn) to open the chapter menu + keeps its count
  // badge in sync with the actual chapter progress.
  function wireInlineMainStoryBtn() {
    var btn = document.getElementById('select-main-story-btn');
    if (!btn || btn.__wired) return;
    btn.__wired = true;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (window.MSChapters && typeof window.MSChapters.open === 'function') {
        window.MSChapters.open();
      }
    });
  }
  function refreshInlineMainStoryCount() {
    var countEl = document.getElementById('select-main-story-count');
    if (!countEl) return;
    var doneCount = CHAPTERS.filter(function (c) { return isDone(c.id); }).length;
    countEl.textContent = doneCount + ' / ' + CHAPTER_COUNT;
  }

  // ---------------------------------------------------------------
  // BOOT
  function boot() {
    if (!isEnabled()) return;
    injectStyles();
    wireInlineMainStoryBtn();
    refreshInlineMainStoryCount();

    // Migration for existing saves: if ARRIVAL bridge has been played but
    // PROLOGUE chapter (id 0) was never marked done, mark it now. Arrival
    // covers the same narrative ground.PROLOGUE shouldn't keep showing
    // up as the "current" entry in the menu after the player has already
    // walked through arrival in the new flow.
    try {
      if (localStorage.getItem('pp_chapter_done_b_arrival') === '1' &&
          localStorage.getItem('pp_chapter_done_0') !== '1') {
        localStorage.setItem('pp_chapter_done_0', '1');
      }
    } catch (_) {}

    // Watch for character select visibility to show orb.
    // (Gate removed v487 — owner reported the Main Story chip disappeared
    //  from the select screen. v484 added #select-screen to HARD_BLOCKERS
    //  to stop the chain-ready popup firing pre-game, which made
    //  PPAmbient.tickAllowed() false on select. The orb tick was gated
    //  on tickAllowed for backgrounded-tab battery savings, but that
    //  also stopped it firing while the player was on select — exactly
    //  when the orb SHOULD show. The orb's own refreshOrb() already has
    //  the right visibility check; we just need to call it. Use
    //  document.hidden directly for the backgrounded-tab optimization
    //  instead of routing through PPAmbient.)
    function orbTick() {
      if (document.hidden) return; // backgrounded tab — skip
      refreshOrb();
    }
    setInterval(orbTick, 900);
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
