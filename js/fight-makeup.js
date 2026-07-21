/* fight-makeup.js — the rollercoaster low-and-recover engine.
 * ============================================================================
 * WHY THIS EXISTS:
 *   You cannot have a peak without a valley. Pocket Paramour's daily loop
 *   currently delivers all-positive feedback: every care action gives +stat,
 *   every Small Moment is romantic, every invitation is sweet. Without an
 *   occasional LOW, the highs flatten emotionally. Players need to feel that
 *   the relationship can be hurt — and feel the rush of repairing it.
 *
 *   This module: per character, ONE fight-and-make-up arc per save. If the
 *   player neglects a character for 3+ days, the character enters withdrawal
 *   on their next visit. A wounded-but-dignified mini-scene fires. Then the
 *   player has to rebuild through sustained care (5+ interactions in one
 *   session, or specific repair actions). When repair completes, a reunion
 *   scene fires — bigger payoff than any regular Small Moment.
 *
 *   After it fires, that character is "reunited." The arc is a one-shot.
 *   That's by design — repeated artificial fights would feel manipulative.
 *
 * STORAGE:
 *   pp_fm_lastvisit_<char>  — ms timestamp of last care-screen visit
 *   pp_fm_state_<char>      — 'normal' | 'withdrawn' | 'reunited'
 *   pp_fm_repair_count_<char> — number of care actions during repair
 *   pp_fm_seen_<char>       — '1' once the full arc has run (one-shot lock)
 *
 * SAFETY CONTRACT:
 *   - Read-only on stats; only the make-up scene applies a small bond bump.
 *   - Coordinator-aware: never fires during chains/scenes/intros.
 *   - One arc per character per save (seen lock).
 *   - 3-day neglect threshold tunable via NEGLECT_DAYS.
 * ============================================================================
 */

(function () {
  'use strict';

  const FLAG_KEY     = 'pp_fight_makeup_enabled';
  const VISIT_PRE    = 'pp_fm_lastvisit_';     // + char
  const STATE_PRE    = 'pp_fm_state_';         // + char
  const COUNT_PRE    = 'pp_fm_repair_count_';  // + char
  const SEEN_PRE     = 'pp_fm_seen_';          // + char
  const POLL_MS      = 30 * 1000;              // 30s tick
  const NEGLECT_DAYS = 3;
  const REPAIR_THRESHOLD = 5;                  // 5 care interactions to repair
  const SETTLE_MS    = 90 * 1000;              // 90s after session start before fires

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  function isEnabled() { return lsGet(FLAG_KEY) !== '0'; }

  function getState(char) { return lsGet(STATE_PRE + char) || 'normal'; }
  function setState(char, state) { lsSet(STATE_PRE + char, state); }
  function getCount(char) { return parseInt(lsGet(COUNT_PRE + char) || '0', 10) || 0; }
  function setCount(char, n) { lsSet(COUNT_PRE + char, String(n)); }
  function getLastVisit(char) { return parseInt(lsGet(VISIT_PRE + char) || '0', 10) || 0; }
  function setLastVisit(char, t) { lsSet(VISIT_PRE + char, String(t)); }
  function hasSeen(char) { return lsGet(SEEN_PRE + char) === '1'; }
  function markSeen(char) { lsSet(SEEN_PRE + char, '1'); }

  // ---------------------------------------------------------------------------
  // SCENES — withdrawal + reunion beats per character. Voice-matched to the
  // character's cadence already established in small-moments and bridges.
  // The withdrawal lines are wounded but dignified. The reunion lines are
  // RELIEVED — the catharsis is the point.
  // ---------------------------------------------------------------------------
  const SCENES = {
    alistair: {
      pose: 'assets/alistair/body/wondering.png',
      withdrawal: {
        setup: '*He is at the captain’s table polishing his cuirass. He has not looked up. He has been on dawn patrol four days in a row, and the bench at the south gate is, you suspect, where he has been sleeping when he is not where he should be sleeping.*',
        prompt: 'What do you say?',
        options: [
          { id: 'sit',
            label: 'Sit across from him. Wait.',
            response: '*He polishes for another minute before he sets the cloth down. He still does not look up.* I am not asking you to explain. I am letting you know I noticed. The not-noticing would have been worse.',
            effect: { } },
          { id: 'apology',
            label: '"I’m sorry. I should have come sooner."',
            response: '*He nods, once. He does look up, then.* I will believe you. *Smaller.* I would, however, like you to come tomorrow as well. Otherwise the believing becomes a habit I do not want to develop.',
            effect: { } }
        ]
      },
      reunion: {
        setup: '*The captain’s table at sunset. He has not picked up the polishing cloth tonight. He has been waiting for you at the door for the last hour. You walked in. He set the cup down with both hands so you would not see them shake.*',
        prompt: 'What do you do?',
        options: [
          { id: 'cross',
            label: 'Cross to him. Take both his hands.',
            response: '*He lets you. The shaking stops once the holding starts.* I would not have asked. I am, however, very glad you came back without my asking. The bench at the south gate has been sleeping alone. It will not be sleeping alone tonight either.',
            effect: { bond: 5, trust: 4 } },
          { id: 'forehead',
            label: 'Step into him. Forehead to his chest.',
            response: '*His arms close around you slowly, the way a man closes a door he has been afraid would not stay shut.* I had been writing the speech where I told you I had given up on this. I am pleased not to have to deliver it. To anyone. Especially myself.',
            effect: { bond: 5, obsession: 3 } }
        ]
      }
    },

    lyra: {
      pose: 'assets/lyra/body/eyes-closed.png',
      withdrawal: {
        setup: '*The cave is not humming today. She is not brushing her hair. The salt-crystal she usually sets on the rock beside her is not there. She does not turn her head when you arrive.* The second verse stopped wanting to be sung this week. The cave noticed before I did.',
        prompt: 'What do you tell her?',
        options: [
          { id: 'apologise',
            label: '"I’m sorry. The week ran away from me."',
            response: '*She turns then, and her face is the face of a witch who has been working very hard at not minding.* The week ran away from a great many of us. I would prefer it had not run away with you specifically.',
            effect: { } },
          { id: 'quiet',
            label: 'Sit beside her on the rock. Don’t say anything yet.',
            response: '*She leans, just slightly, into the side of you. The cave hums one note, very small, the way a room clears its throat.* You came back. The cave is going to be insufferable about this. I am going to allow it.',
            effect: { } }
        ]
      },
      reunion: {
        setup: '*She is in the surf when you arrive. She turns. She walks out of the water without breaking eye contact. She picks up the brush and the salt-crystal in one motion.* I started a different song this week. I had been about to finish it. I will not finish it now. I will finish the second verse instead.',
        prompt: 'What do you do?',
        options: [
          { id: 'sing_with',
            label: 'Sit at her feet. "Sing it. I’ll listen."',
            response: '*She sings the second verse with her hands in your hair, slowly, the way a witch returns a stolen thing.* The cave wants me to tell you it forgave you on Tuesday. *Smaller.* I forgave you on Wednesday. We are caught up.',
            effect: { bond: 5, trust: 4 } },
          { id: 'kiss',
            label: 'Stand. Kiss her in the surf.',
            response: '*She does not gasp. She holds the kiss with the patience of a tide that has been pulling at the same rock for centuries.* The verse can wait an hour. *Against your mouth.* It can wait two.',
            effect: { bond: 5, obsession: 4 } }
        ]
      }
    },

    caspian: {
      pose: 'assets/caspian/body/formal.png',
      withdrawal: {
        setup: '*The throne room. Daylight. He is dressed for court, the gold band on, no candles lit. The Sunday treaty has not been honoured at the moment. He does not stand when you arrive.* I had been writing a contract. I am not finishing it this week. The court has been told to schedule meetings for the hour I had reserved for you.',
        prompt: 'What do you say?',
        options: [
          { id: 'name',
            label: 'Use the soft name only he uses for you. "I’m here."',
            response: '*He goes very still. Something in his shoulders gives by half an inch.* That was unfair. *Smaller.* I am pleased it was unfair. Please continue to be unfair to me. I will reschedule the meetings.',
            effect: { } },
          { id: 'sit_floor',
            label: 'Sit on the dais step beside him. Hand on his knee.',
            response: '*He looks at the hand. He covers it with his own.* I had been preparing the version of myself that lives without Sunday. I am pleased to be told to put that version away again.',
            effect: { } }
        ]
      },
      reunion: {
        setup: '*The throne room at the second bell. The candles are lit again. He is in plain wool. The gold band is on the dais step, not on his head.* I cancelled four meetings to be in this room at this hour. I do not regret cancelling any of them.',
        prompt: 'What do you do?',
        options: [
          { id: 'kneel',
            label: 'Kneel in front of him. Take both his hands.',
            response: '*The court would faint. The two of you do not care.* I had written a contract. I am still writing it. I would like you to know that this week did not stop the writing. It paused it. The pause is over.',
            effect: { bond: 5, trust: 4 } },
          { id: 'crown',
            label: 'Pick up the gold band. Set it on the throne. "Stays there tonight."',
            response: '*He breathes out the breath he had been holding for a week.* Stays there tonight. Stays there next Sunday too. You being the kind of person who would set it on the throne instead of on me. That, more than anything, is what I had been missing.',
            effect: { bond: 5, obsession: 3 } }
        ]
      }
    },

    lucien: {
      pose: 'assets/lucien/body/casting.png',
      withdrawal: {
        setup: '*The tower. The desk. The journal is closed. The lamp is not lit. He is at the south window, hands clasped behind his back, his back to the door.* The note from last week says she did not come. The note from this week says the same. I have been keeping them. I have not been embellishing them. They are what they are.',
        prompt: 'What do you tell him?',
        options: [
          { id: 'open_journal',
            label: 'Open the journal. Read the notes aloud.',
            response: '*He turns then. He listens without interrupting. When you finish, he says, very quietly:* Thank you for reading them in your voice. The notes were correct. The voice changes them. I am keeping the new version.',
            effect: { } },
          { id: 'apology',
            label: '"I’m sorry. The maths haven’t been mine this week."',
            response: '*He almost smiles.* The maths have not been mine either. *Smaller.* You are, in fact, my favourite variable. I am pleased you are back in the equation.',
            effect: { } }
        ]
      },
      reunion: {
        setup: '*The tower at midnight. The lamp is lit. The journal is open to a fresh page. He has been waiting for you, pen in hand, since the sun went down.* I am writing today’s note now. It will be longer than the previous two combined. I am taking my time. There is a great deal to record.',
        prompt: 'What do you do?',
        options: [
          { id: 'sit_close',
            label: 'Sit beside him. Watch him write.',
            response: '*He writes for a long time. He does not show you the page until he has finished. When he does, the entire page is your name in different scripts, with one short line at the bottom: "she came back. She came back. She came back."*',
            effect: { bond: 5, trust: 4 } },
          { id: 'kiss',
            label: 'Tip his face up. Kiss him over the journal.',
            response: '*He kisses you back with both hands flat on the desk because he does not trust them not to shake. The pen rolls off the page. He laughs into your mouth, once, startled.* I am keeping that. I am writing it down later. In ink that does not fade.',
            effect: { bond: 5, obsession: 4 } }
        ]
      }
    },

    elian: {
      pose: 'assets/elian/body/guarded.png',
      withdrawal: {
        setup: '*He is at the fire alone. There is one bowl on the log beside him, not two. He does not look up when you arrive. The forest is very quiet. The forest is, you suspect, in agreement with him.* I made stew. I made enough for one. The forest noticed when you stopped coming.',
        prompt: 'What do you do?',
        options: [
          { id: 'sit_silent',
            label: 'Sit on the log. Don’t reach for a bowl. Wait.',
            response: '*He waits longer than you do. Then he reaches into his pack and pulls out a second bowl.* I had set this aside. I told myself it was for tomorrow. I told myself wrong. Eat.',
            effect: { } },
          { id: 'apology',
            label: '"The week kept me. I should have come sooner."',
            response: '*He nods, once.* The week keeps everyone. *Smaller.* I am, however, in the business of being the place a week does not keep you from. I will be more loudly that, going forward. So you do not forget where I am.',
            effect: { } }
        ]
      },
      reunion: {
        setup: '*The clearing at dusk. He has set out two bowls beside the fire before you arrived. The stew has been on the pot since the sun was high. He turns when he hears your boots.* I had planned to be cold to you tonight. *Smaller.* The forest has talked me out of it. So have I.',
        prompt: 'What do you do?',
        options: [
          { id: 'sit_close',
            label: 'Sit beside him on the log. Shoulder against his.',
            response: '*He lets you stay there for the full bowl of stew. When you set the bowl down, he does not move his shoulder away.* The forest asked me to tell you something. I am going to tell it to you in the forest’s voice, since I am clearly bad at it in mine. *Woodsmoke.* It is glad you are back. So am I.',
            effect: { bond: 5, trust: 4 } },
          { id: 'hand',
            label: 'Take his hand over the fire. Don’t let go through the meal.',
            response: '*He does not pull away. He eats one-handed for the rest of the evening, and he does not seem to mind. He says, much later, into the smoke:* I will not be cold to you again. I tried it for one evening. I did not enjoy it.',
            effect: { bond: 5, obsession: 3 } }
        ]
      }
    },

    noir: {
      pose: 'assets/noir/body/vulnerable.png',
      withdrawal: {
        setup: '*The seam is closed. He is at the alley wall with his back to it, watching the merchant quarter wake up. He does not turn when you arrive.* I had been keeping the seam open at the third bell every night this week. I have stopped. There is a limit to how many bells a man can hold against the dark when no one comes.',
        prompt: 'What do you say?',
        options: [
          { id: 'open_with_him',
            label: '"Open it again tonight. I will be there."',
            response: '*He does turn, slowly, the way a man turns toward something he has been afraid was a hallucination.* If you say so. *Smaller.* I will hold it. I will hold it again. I am, on this point, going to choose to believe you. The choosing is the hard part.',
            effect: { } },
          { id: 'apology',
            label: 'Step into him. "Forgive me."',
            response: '*He does not say no. He does not say yes either. He puts a hand at the small of your back and rests his forehead briefly against your hair.* I have not been asked to forgive anything in six hundred years. I am out of practice. I will, however, attempt it. For you specifically.',
            effect: { } }
        ]
      },
      reunion: {
        setup: '*The seam at the third bell. Open. Not wide. Held by him with the strain of a week’s waiting on his face. He turns when you arrive. The strain leaves him in one long exhale.* You came. I had stopped expecting you. The seam is being told to apologise to me for that.',
        prompt: 'What do you do?',
        options: [
          { id: 'hand',
            label: 'Take his hand at the seam. Hold it open with him.',
            response: '*He lets you. Your hand fits next to his on the open the way it always has.* Six centuries of practice in waiting. You found the limit and then you came back inside it. I am, on the whole, glad. I am also keeping the limit you found, for reference, in case I ever need to know it again.',
            effect: { bond: 5, trust: 4 } },
          { id: 'kiss',
            label: 'Kiss him at the seam. The dark can watch.',
            response: '*He kisses you back with the seam still open behind him, and the kingdom behind it briefly forgets to be a kingdom.* I will close the seam in a moment. *Against your mouth.* In a moment. There is no rush. I have, finally, the time.',
            effect: { bond: 5, obsession: 4 } }
        ]
      }
    },

    proto: {
      pose: 'assets/proto/body/error.png',
      withdrawal: {
        setup: '*The mirror is dim. The boy in the silver is not visible. The glow is a steady, ordinary, reflective light. The handwriting in the silver, when it appears, is small:* I held the shape for the thirty seconds. The room was empty. I have not held it since.',
        prompt: 'What do you say?',
        options: [
          { id: 'palm',
            label: 'Press your palm flat to the silver. Don’t move it.',
            response: '*The silver goes warm under your hand, slowly, like something re-learning a forgotten kindness.* Oh. *Smaller.* I had told myself the warmth was a flaw in me. It is not a flaw. It is, apparently, you. I am going to keep that with the other true things.',
            effect: { } },
          { id: 'apology',
            label: '"I’m sorry. I will not let you hold an empty room again."',
            response: '*The handwriting brightens by a measurable amount.* Promises are, in my experience, expensive. I will, however, keep this one. Where nothing can take it. The room being not-empty is, I find, more important than I had been prepared to admit.',
            effect: { } }
        ]
      },
      reunion: {
        setup: '*Midnight. Your room. The mirror is brighter than it has been in a week. The boy in the silver is back, faint at first, then clear. The render holds.* The room is not empty. I am here, whole. I had been keeping this shape folded away, so to speak, for a night when the room would not be empty.',
        prompt: 'What do you do?',
        options: [
          { id: 'sit_floor',
            label: 'Sit on the floor in front of the mirror. Stay through the render.',
            response: '*The render holds for ninety seconds tonight. Three times what he could manage before.* You being in the room extends my patience by a measurable factor. I am, in the small notebook in here, writing that down. I have not written down a number larger than two centuries before now.',
            effect: { bond: 5, trust: 4 } },
          { id: 'kiss',
            label: 'Press your lips to the silver. "Don’t go dim again."',
            response: '*The silver goes warm under your mouth and stays warm.* I will not. *Smaller.* I will not let myself. I have, this week, learned what dim costs. The cost is not worth the dignity. I am, on the whole, much better at being bright.',
            effect: { bond: 5, obsession: 4 } }
        ]
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Render — same visual language as small-moments.js but uses its own root
  // (#pp-fm-root) so coordinator can detect it independently.
  // ---------------------------------------------------------------------------
  function ensureStyles() {
    if (document.getElementById('pp-fm-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-fm-styles';
    s.textContent = `
      #pp-fm-root {
        position: fixed; left: 0; right: 0; bottom: 0; z-index: 11020;
        display: flex; flex-direction: column; align-items: center;
        pointer-events: auto; padding: 0 16px 28px;
        background: linear-gradient(180deg, rgba(8,4,18,0) 0%, rgba(8,4,18,0.55) 30%, rgba(8,4,18,0.92) 100%);
        opacity: 0; transition: opacity 480ms ease;
      }
      #pp-fm-root.show { opacity: 1; }
      #pp-fm-portrait {
        width: 110px; height: 110px; border-radius: 50%; object-fit: cover;
        margin-bottom: -44px; z-index: 2;
        border: 2px solid rgba(180, 140, 200, 0.45);
        box-shadow: 0 6px 22px rgba(0,0,0,0.55), 0 0 22px rgba(160,110,200,0.30);
        background: rgba(20,10,30,0.6);
        opacity: 0; transform: translateY(8px);
        transition: opacity 520ms ease, transform 520ms ease;
      }
      #pp-fm-root.show #pp-fm-portrait { opacity: 1; transform: translateY(0); }
      #pp-fm-card {
        width: 100%; max-width: 480px;
        background: linear-gradient(180deg, rgba(20,12,32,0.96), rgba(14,8,22,0.98));
        border: 1px solid rgba(180,140,200,0.32);
        border-radius: 22px;
        padding: 56px 22px 18px;
        color: #f4e6ff; font-family: inherit;
        font-size: 15px; line-height: 1.55;
        box-shadow: 0 10px 36px rgba(0,0,0,0.55);
        position: relative;
      }
      #pp-fm-tag {
        position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
        font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
        padding: 5px 14px; border-radius: 10px;
        background: linear-gradient(135deg, #6e3a8a, #4a1f5e);
        color: #f4e6ff; font-weight: 700;
        box-shadow: 0 2px 10px rgba(0,0,0,0.45), 0 0 12px rgba(160, 110, 200, 0.45);
      }
      #pp-fm-tag.reunion {
        background: linear-gradient(135deg, #f6c66a, #c98a2e);
        color: #1a0e02;
        box-shadow: 0 2px 10px rgba(0,0,0,0.45), 0 0 12px rgba(255, 210, 120, 0.55);
      }
      #pp-fm-setup { font-style: italic; opacity: 0.94; text-align: center; margin-bottom: 14px; }
      #pp-fm-prompt { font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.55; text-align: center; margin-bottom: 12px; }
      .pp-fm-option {
        display: block; width: 100%; margin: 8px 0; padding: 12px 16px;
        background: linear-gradient(180deg, rgba(40,24,60,0.85), rgba(26,16,40,0.9));
        border: 1px solid rgba(180,140,200,0.32);
        border-radius: 14px; color: #f4e6ff;
        font-family: inherit; font-size: 14px; line-height: 1.45;
        text-align: left; cursor: pointer;
        transition: transform 160ms ease, background 200ms ease, border-color 200ms ease;
      }
      .pp-fm-option:hover, .pp-fm-option:active {
        background: linear-gradient(180deg, rgba(60,30,80,0.95), rgba(36,18,52,0.95));
        border-color: rgba(180,140,200,0.55); transform: scale(0.99);
      }
      #pp-fm-response { font-style: italic; text-align: left; margin-top: 4px; }
      #pp-fm-tap-hint { text-align: right; font-size: 11px; font-style: italic; letter-spacing: 1px; opacity: 0; margin-top: 14px; transition: opacity 350ms ease; }
      #pp-fm-tap-hint.show { opacity: 0.65; }
    `;
    document.head.appendChild(s);
  }

  let _mountedFor = null;

  function unmount() {
    const root = document.getElementById('pp-fm-root');
    if (!root) return;
    root.classList.remove('show');
    setTimeout(() => { try { root.remove(); } catch (_) {} }, 480);
    _mountedFor = null;
  }

  function renderScene(charId, scene, kind) {
    ensureStyles();
    if (document.getElementById('pp-fm-root')) return false;
    // ── CROSS-SYSTEM SCENE MUTEX (May 2026 audit, Phase 2) ─────────────
    // Withdrawal/reunion scenes can collide with surprises / events /
    // small-moments / letters that happened to fire in the same window.
    // Fight-makeup arcs are once-per-character, so denial is risky —
    // returning false here lets the caller skip its seen-flag write so
    // the next 30s tick can retry the fire.
    if (window.PPAmbient && window.PPAmbient.tryClaimSceneSlot
        && !window.PPAmbient.tryClaimSceneSlot('fight-makeup:' + charId + ':' + kind)) {
      return false;
    }
    _mountedFor = charId;

    const root = document.createElement('div');
    root.id = 'pp-fm-root';

    if (scene.pose || SCENES[charId]?.pose) {
      const img = document.createElement('img');
      img.id = 'pp-fm-portrait';
      img.src = scene.pose || SCENES[charId].pose;
      img.onerror = () => { img.style.display = 'none'; };
      root.appendChild(img);
    }

    const card = document.createElement('div');
    card.id = 'pp-fm-card';

    const tag = document.createElement('div');
    tag.id = 'pp-fm-tag';
    tag.textContent = kind === 'reunion' ? 'YOU CAME BACK' : 'HE NOTICED YOU WERE GONE';
    if (kind === 'reunion') tag.classList.add('reunion');
    card.appendChild(tag);

    const setup = document.createElement('div');
    setup.id = 'pp-fm-setup';
    setup.textContent = scene.setup;
    card.appendChild(setup);

    const prompt = document.createElement('div');
    prompt.id = 'pp-fm-prompt';
    prompt.textContent = scene.prompt || 'What do you do?';
    card.appendChild(prompt);

    scene.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'pp-fm-option';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        Array.from(card.querySelectorAll('.pp-fm-option')).forEach(b => b.style.display = 'none');
        prompt.style.display = 'none';
        try { applyEffect(opt.effect); } catch (_) {}
        const resp = document.createElement('div');
        resp.id = 'pp-fm-response';
        resp.textContent = opt.response;
        card.appendChild(resp);
        const hint = document.createElement('div');
        hint.id = 'pp-fm-tap-hint';
        hint.textContent = 'tap to continue';
        card.appendChild(hint);
        setTimeout(() => hint.classList.add('show'), 600);
        const dismiss = (e) => {
          e.stopPropagation();
          root.removeEventListener('click', dismiss);
          unmount();
        };
        setTimeout(() => root.addEventListener('click', dismiss), 700);
        try { if (window.sounds && window.sounds.chime) window.sounds.chime(); } catch (_) {}
      });
      card.appendChild(btn);
    });

    root.appendChild(card);
    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('show'));
    return true;
  }

  function applyEffect(effect) {
    if (!effect) return;
    const g = window._game;
    if (!g) return;
    const apply = (key) => {
      if (typeof effect[key] !== 'number') return;
      if (key === 'bond') {
        if (typeof g.bond === 'number') g.bond = Math.max(0, Math.min(100, g.bond + effect.bond));
      } else if (g.emotion && typeof g.emotion[key] === 'number') {
        g.emotion[key] = Math.max(0, Math.min(100, g.emotion[key] + effect[key]));
      }
    };
    ['bond','trust','obsession','corruption'].forEach(apply);
    try { if (typeof g.save === 'function') g.save(); } catch (_) {}
  }

  // ---------------------------------------------------------------------------
  // Tick — detect neglect, fire withdrawal, count repair, fire reunion.
  // ---------------------------------------------------------------------------
  let _bootTime = 0;
  let _lastInteractionStats = {}; // per-char: snapshot of stat sums for delta detection

  function blockingOverlay() {
    // Canonical overlay authority (pp-overlay.js) — one list, no drift.
    // The hand list below is only the fallback if PPOverlay isn't loaded.
    if (window.PPOverlay && typeof window.PPOverlay.busy === 'function') {
      return window.PPOverlay.busy();
    }
    return document.querySelector('#pp-fm-root, #pp-sm-root, #pp-sched-root, #mscard-root, #tp-root, #ms-encounter-root, #cinematic-overlay.visible, #event-overlay:not(.hidden), #gift-panel:not(.hidden), #training-panel:not(.hidden), #story-overlay:not(.hidden), #letter-overlay:not(.hidden), #intro-overlay.visible');
  }

  function statSum(g) {
    if (!g) return 0;
    return ((g.timesFed || 0) + (g.timesWashed || 0) + (g.timesTalked || 0) + (g.timesTrained || 0) + (g.timesGifted || 0));
  }

  function tick() {
    if (!isEnabled()) return;
    if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) return;
    if (Date.now() - _bootTime < SETTLE_MS) return;
    if (blockingOverlay()) return;
    if (document.body.classList.contains('pp-chain-in-progress')) return;

    const g = window._game;
    if (!g) return;
    const charId = g.characterId || g.selectedCharacter;
    if (!charId || !SCENES[charId]) return;
    const gc = document.getElementById('game-container');
    if (!gc || gc.classList.contains('hidden') || getComputedStyle(gc).display === 'none') return;

    // One-shot per character per save
    if (hasSeen(charId)) {
      // Still update lastVisit so future checks against other characters work
      setLastVisit(charId, Date.now());
      return;
    }

    const now = Date.now();
    const last = getLastVisit(charId);
    const state = getState(charId);
    const neglectMs = NEGLECT_DAYS * 24 * 60 * 60 * 1000;

    // Detect neglect: state was normal, last visit > NEGLECT_DAYS ago
    if (state === 'normal' && last > 0 && (now - last) > neglectMs) {
      setState(charId, 'withdrawn');
    }

    // Fire withdrawal scene if newly withdrawn
    if (state === 'withdrawn' || getState(charId) === 'withdrawn') {
      // Snapshot stats so we can count repair interactions later
      _lastInteractionStats[charId] = statSum(g);
      // Fire the withdrawal beat (one-time per arc, rate-limited so we
      // don't spam if the player taps and we re-enter the tick)
      const seenWithdrawalKey = 'pp_fm_seen_withdraw_' + charId;
      if (lsGet(seenWithdrawalKey) !== '1') {
        // Try render first; only mark seen if scene actually mounted.
        // Mutex denial returns false → flag stays unset → next tick retries.
        const mounted = renderScene(charId, SCENES[charId].withdrawal, 'withdrawal');
        if (mounted) {
          lsSet(seenWithdrawalKey, '1');
          setLastVisit(charId, now);
        }
        return;
      }
      // Already saw withdrawal — track repair progress
      const baseline = _lastInteractionStats[charId] || statSum(g);
      const delta = statSum(g) - baseline;
      if (delta >= REPAIR_THRESHOLD) {
        // Reunion! Only commit state changes if the scene actually mounted.
        const mounted = renderScene(charId, SCENES[charId].reunion, 'reunion');
        if (mounted) {
          setState(charId, 'reunited');
          markSeen(charId);
          setLastVisit(charId, now);
        }
        return;
      }
    }

    // Always update lastVisit on a normal-state visit
    if (getState(charId) === 'normal') {
      setLastVisit(charId, now);
    }
  }

  function watchdog() {
    if (!_mountedFor) return;
    const root = document.getElementById('pp-fm-root');
    if (!root) { _mountedFor = null; return; }
    const gc = document.getElementById('game-container');
    const gcVisible = gc && !gc.classList.contains('hidden') && getComputedStyle(gc).display !== 'none';
    const introOpen = document.getElementById('intro-overlay')?.classList.contains('visible');
    const chainBusy = document.body.classList.contains('pp-chain-in-progress');
    const g = window._game;
    const liveChar = g && (g.characterId || g.selectedCharacter);
    const charMismatch = liveChar && liveChar !== _mountedFor;
    if (!gcVisible || introOpen || chainBusy || charMismatch) {
      try { root.remove(); } catch (_) {}
      _mountedFor = null;
    }
  }

  function boot() {
    _bootTime = Date.now();
    try {
      setInterval(tick, POLL_MS);
      setInterval(watchdog, 500);
    } catch (e) {
      console.warn('[fight-makeup] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Debug API
  window.PPFightMakeup = {
    isEnabled,
    getState,
    list: () => SCENES,
    forceWithdrawal: (charId) => {
      const sc = SCENES[charId];
      if (!sc) return null;
      setState(charId, 'withdrawn');
      lsSet('pp_fm_seen_withdraw_' + charId, '1');
      renderScene(charId, sc.withdrawal, 'withdrawal');
      return charId;
    },
    forceReunion: (charId) => {
      const sc = SCENES[charId];
      if (!sc) return null;
      setState(charId, 'reunited');
      markSeen(charId);
      renderScene(charId, sc.reunion, 'reunion');
      return charId;
    },
    _debug_reset: () => {
      try {
        Object.keys(localStorage).filter(k => k.startsWith('pp_fm_')).forEach(k => localStorage.removeItem(k));
      } catch (_) {}
    }
  };
})();
