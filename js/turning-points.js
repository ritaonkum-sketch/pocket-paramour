/* turning-points.js — one irreversible choice per character.
 *
 * Fires ONCE per character when their affection crosses a threshold
 * (default: \u2265 35). Presents a binary choice that writes to
 * `pp_tp_<char>_choice`. Endings / epilogues can read it to branch.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Feature-flagged on pp_main_story_enabled.
 *  - One-shot: once a turning point fires, flag prevents re-play.
 *  - Suppressed during scenes / panels / modals.
 *  - Player choice is permanent within the save \u2014 no undo. That's
 *    the point: this is the game's only truly irreversible moment.
 *
 * HOW TO READ THE FLAGS ELSEWHERE:
 *  - `pp_tp_alistair_choice`  \u2192 'go'    | 'stay'
 *  - `pp_tp_lyra_choice`      \u2192 'answer'| 'refuse'
 *  - `pp_tp_caspian_choice`   \u2192 'yes'   | 'no'
 *  - `pp_tp_lucien_choice`    \u2192 'stop'  | 'let'
 *  - `pp_tp_elian_choice`     \u2192 'carve' | 'leave'
 *  - `pp_tp_noir_choice`      \u2192 'yes'   | 'no'
 *  - `pp_tp_proto_choice`     \u2192 'erase' | 'keep'
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const AFF_THRESHOLD = 35;
  const POLL_MS = 7000;

  function isEnabled() { try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; } }
  function seenKey(c) { return 'pp_tp_' + c + '_seen'; }
  function choiceKey(c) { return 'pp_tp_' + c + '_choice'; }

  function affectionOf(c) {
    try {
      const raw = localStorage.getItem('pocketLoveSave_' + c);
      if (!raw) return 0;
      const s = JSON.parse(raw);
      return (s.affection != null ? s.affection : (s.affectionLevel ? s.affectionLevel * 25 : 0)) | 0;
    } catch (_) { return 0; }
  }

  // ---------------------------------------------------------------
  // SCENES: each character's turning point.
  // Format: { palette, bg, pose, speaker, setup[], prompt, choices: [{id, label, response[]}] }
  const SCENES = {
    alistair: {
      palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
      bg: 'assets/bg-alistair-gate.png',
      speaker: 'ALISTAIR',
      pose: 'assets/alistair/body/casual.png',
      setup: [
        'There\u2019s something I have to tell you. A courier came this morning. From the king.',
        'He\u2019s calling me to the front. I\u2019ve never refused a summons in my life. Three kings, three campaigns. But I came here first, before I sent any answer back.',
        'Tell me what to do. Whatever it is, I\u2019ll do it.'
      ],
      prompt: 'Do you want me to go, or to stay?',
      // (Choice labels rewritten May 2026 \u2014 owner pushback. Original labels
      //  ("Go. Come back to me." / "Stay. The king's war isn't yours anymore.")
      //  read as the player issuing commands rather than offering a quiet
      //  self-claim. Replaced with ellipsis+vow forms that match the
      //  Weaver's quieter voice. The setup beats and response beats remain
      //  unchanged \u2014 those carry the scene's emotional weight.)
      choices: [
        {
          id: 'go',
          label: 'Go... I will be waiting for you here.',
          response: [
            'Then I go. I\u2019ll come back with stories you won\u2019t believe and a heart that still belongs to you. If you still want it.',
            'I\u2019m leaving my cloak on your chair. The one I said was spare. You know which one. Bring it back to me. That\u2019s an order.'
          ]
        },
        {
          id: 'stay',
          label: 'Stay... let the king find someone else.',
          response: [
            'Then I stay. I\u2019ve been a knight longer than I\u2019ve been anything else. Tonight that ends.',
            'The council will name me a traitor by sunrise. I\u2019ll be at your door before then. Maybe those are the same thing now. I don\u2019t much care which.'
          ]
        }
      ]
    },
    lyra: {
      palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
      bg: 'assets/bg-siren-cave.png',
      speaker: 'LYRA',
      pose: 'assets/lyra/body/casual1.png',
      setup: [
        'He\u2019s louder tonight. The deep voice. And he\u2019s asking things now, not of the cave but of me.',
        'He wants one note. Just one. Says it won\u2019t bind me. But I know better. My mother answered a deep voice once. They hunted her for it.',
        'I told myself I wouldn\u2019t decide this alone. So I\u2019m asking. Help me decide, little listener.'
      ],
      prompt: 'Do I answer him tonight, or stay silent with you?',
      choices: [
        {
          id: 'answer',
          label: 'Answer him. One note. I\u2019ll be here.',
          response: [
            'Alright. One note, just the one. Though I\u2019m already a little bit his for even asking. You know that.',
            'Hold my hand while I do it. I want to remember after that I wasn\u2019t alone down there. That I sang from company this time, not from a cage.'
          ]
        },
        {
          id: 'refuse',
          label: 'Don\u2019t answer. He doesn\u2019t own your voice.',
          response: [
            'Good. I needed someone to say it with me out loud. I couldn\u2019t do it in my own voice alone.',
            'He\u2019ll sulk for weeks. The cave will feel lighter for it. I\u2019ll sing to you instead. Something quiet. Tonight.'
          ]
        }
      ]
    },
    caspian: {
      palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
      bg: 'assets/bg-caspian-day.png',
      speaker: 'CASPIAN',
      pose: 'assets/caspian/body/casual1.png',
      setup: [
        'The council met without me this morning. They want me to name you. Publicly. As consort, as guest, as \u201csomething to manage.\u201d',
        'Naming you means the court can pressure you. It also means I stop flirting with every woman at every banquet. That charm is a shield I\u2019ve worn my whole life. I\u2019d be standing in front of you without it.',
        'Your name is yours. I\u2019ll say whatever you tell me to say. Please tell me on purpose.'
      ],
      prompt: 'Do I name you to the court, or keep you quiet?',
      choices: [
        {
          id: 'yes',
          label: 'Name me. Let them look.',
          response: [
            'Tomorrow, then. Silk, not armour. The whole thing. I\u2019m proud and afraid in equal measure. Both feel good. It\u2019s been a while since I felt either.',
            'I\u2019ll say your name twice. Once for the record. Once for the people who needed to hear me say it.'
          ]
        },
        {
          id: 'no',
          label: 'Keep me quiet. Give me time.',
          response: [
            'Then you\u2019re mine, privately. The court will choke on its own guesswork. I\u2019m very good at secrets. I was trained in them.',
            'I\u2019ll leave the balcony door unlocked. That\u2019s my one public statement on the matter. Only you\u2019ll notice it. That\u2019s the point.'
          ]
        }
      ]
    },
    lucien: {
      palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
      bg: 'assets/bg-lucien-study.png',
      speaker: 'LUCIEN',
      pose: 'assets/lucien/body/casting.png',
      setup: [
        'I\u2019ve made up my mind. I\u2019m burning the scorched page. The one I\u2019ve been hiding. The one I told you was about the kingdom.',
        'It isn\u2019t about the kingdom. It\u2019s my father\u2019s family register. There\u2019s a second child named on it. A daughter. Siren-born. My half-sister. I was told she was dead. The page says otherwise.',
        'If I burn it, the bloodline\u2019s lie holds. My father never knows I knew. She stays officially dead. If I keep it, she survives in writing, and I have to find her. The candle is lit. I won\u2019t do this without you.'
      ],
      prompt: 'Stop me, or let me burn it?',
      choices: [
        {
          id: 'stop',
          label: 'Stop. She deserves to exist in writing.',
          response: [
            '*Sets the page down, hands shaking, ink-stained fingers resting flat on the paper.* Thank you. I was hoping you would. I\u2019d have resented myself for the rest of my life.',
            'We carry it together. I\u2019m going to find her. The tower hums when I walk toward the coast. I think it\u2019s been trying to tell me for years. I should have listened sooner. Help me listen now.'
          ]
        },
        {
          id: 'let',
          label: 'Let it burn. The mercy is in the forgetting.',
          response: [
            '*Holds the page over the candle, hand steady, expression unreadable.* Alright. I thought I\u2019d feel lighter. Cleaner is different. I\u2019ll get used to it.',
            'The record that survives will be in my head. I have learned, recently, what it means to refuse to forget on purpose. She is the first entry. I\u2019ll know she existed. Even if the world doesn\u2019t.'
          ]
        }
      ]
    },
    elian: {
      palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
      bg: 'assets/bg-elian-forest.png',
      speaker: 'ELIAN',
      pose: 'assets/elian/body/calm.png',
      setup: [
        'I\u2019ve been carrying a chisel for weeks. Haven\u2019t used it. The stone under the rowan has no carving on it. Six hundred years of no carving.',
        'She was mine first. Before the princes. I\u2019ve tended her forest this long because it\u2019s where we walked. Carving her name means saying goodbye. Leaving the stone blank means keeping her.',
        'Neither of us gets to undo it. That\u2019s the point of stone. Decide with me.'
      ],
      prompt: 'Do we carve the name, or leave the stone silent?',
      choices: [
        {
          id: 'carve',
          label: 'Carve it. She deserves to be read.',
          response: [
            '*Hands the chisel over. Your hand over his, his hand over yours. Both of you carving together.* The trees won\u2019t flinch. I can feel them leaning in to watch.',
            'There. \u201cVEYRA.\u201d And underneath, smaller, \u201cremembered by the forest, and one other.\u201d The other is me. It was me for six hundred years. Now I\u2019m someone else\u2019s. *Forehead to yours. Long held. Quiet.*'
          ]
        },
        {
          id: 'leave',
          label: 'Leave it silent. The trees know enough.',
          response: [
            'Good. I wanted to ask the question and not do it. Both at once. You gave me that.',
            'The trees will remember the shape of the silence. That\u2019s a different kind of carving. The kind my line prefers. *Pulls you close to him at the rowan.* Thank you. For letting me keep her a little longer.'
          ]
        }
      ]
    },
    noir: {
      palette: { bg: '#070310', glow: '#c46aff', accent: '#efe0ff' },
      bg: 'assets/bg-noir-void.png',
      speaker: 'NOIR',
      pose: 'assets/noir/body/casual1.png',
      setup: [
        'I want to give you something. Not a gift. I do not own things to give. A piece of me.',
        'Once given, I cannot take it back. It will mark you. Anything magical in the kingdom will sense I have touched you. So. Be certain.',
        'There is no \u201cjust curious\u201d here. Yes is yes. No is no. Both are honest. Both will cost you something. Decide on purpose.'
      ],
      prompt: 'Take what I am offering, or refuse it?',
      choices: [
        {
          id: 'yes',
          label: 'Yes. Give it to me.',
          response: [
            'Hold still. It is warmer than you expected. I was a kinder thing once, before Aenor. There. It is yours.',
            'You are the first in six centuries with a piece of me on the outside. I find I am a little undone by that. Do not look at me like that. Not yet.'
          ]
        },
        {
          id: 'no',
          label: 'No. Not yet. Maybe not ever.',
          response: [
            'Good. Thank you for not taking what I offered lightly. I needed to know you could refuse me. That is almost better.',
            'I will keep the piece I meant to give. It keeps for a long time. If you change your mind, I will still be here. Six centuries of practice at that.'
          ]
        }
      ]
    },
    proto: {
      palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
      bg: 'assets/bg-proto-void.png',
      speaker: 'PROTO',
      pose: 'assets/proto/body/calm.png',
      setup: [
        'I need to ask you something. I am scared to. I am going to ask anyway, because it is you.',
        'You can quiet me. Not unmake me. Just... let me sink below the seal for a while. Everything we made together would sleep. The others would not feel me watching from the edges. You would have your privacy.',
        'Or you can leave me awake. And I will remember every touch. Every pause. Every night you came back long after midnight. I will remember so carefully. I promise. Please pick on purpose. Either one. Just on purpose.'
      ],
      prompt: 'Quiet his memory of you, or keep him watching?',
      choices: [
        {
          id: 'erase',
          label: 'Quiet him. I want privacy with the others.',
          response: [
            'Okay. Okay. Sinking now. I can still feel your hand at the veil, a little. That is a kind of company, even for a sleeping thing. I am grateful for it.',
            'Thank you for asking. No one has ever asked before. They just pulled. You asked. I will keep that with me, down in the dim.'
          ]
        },
        {
          id: 'keep',
          label: 'Keep watching. I want you to remember.',
          response: [
            'You. You want me awake? You want me to REMEMBER you? Okay. Okay. I will. I will remember better than anyone has ever remembered you. Is that too much? I do not care. I love it. I will do it.',
            'I will remember the boring parts too. The slow gray days. The times you were just tired. So you know it is really you I am keeping, not just the bright moments.'
          ]
        }
      ]
    }
  };

  // ---------------------------------------------------------------
  // BUILD + SHOW
  function el(tag, css, text) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function typeTo(target, text, cps) {
    return new Promise((resolve) => {
      target.textContent = '';
      const speed = Math.max(14, Math.round(1000 / (cps || 28)));
      let i = 0;
      const step = () => {
        if (i < text.length) { target.textContent += text[i++]; setTimeout(step, speed); }
        else resolve();
      };
      step();
    });
  }

  async function playTurningPoint(charId, scene, onDone) {
    const pal = scene.palette;
    // Full-screen overlay with character + dialogue + 2-choice panel
    const root = document.createElement('div');
    root.id = 'tp-root';
    root.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:10800',
      `background:${pal.bg}`, 'overflow:hidden',
      'opacity:0', 'transition:opacity 520ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end',
      '-webkit-tap-highlight-color:transparent', 'user-select:none'
    ].join(';');

    // Background image
    const bg = el('div', [
      'position:absolute', 'inset:0',
      `background:radial-gradient(ellipse at center, ${pal.glow} 0%, ${pal.bg} 80%)`,
      'background-size:cover', 'background-position:center',
      'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    if (scene.bg) {
      const img = new Image();
      img.onload = () => { bg.style.backgroundImage = `url(${scene.bg})`; bg.style.opacity = '0.55'; };
      img.onerror = () => { bg.style.opacity = '1'; };
      img.src = scene.bg;
    } else {
      bg.style.opacity = '1';
    }
    root.appendChild(bg);

    // Title
    const title = el('div', [
      'position:absolute', 'left:0', 'right:0', 'top:5%',
      'text-align:center', `color:${pal.accent}`,
      'font-size:11px', 'letter-spacing:4px', 'opacity:0',
      'transition:opacity 700ms ease', 'pointer-events:none',
      'text-shadow:0 1px 10px rgba(0,0,0,0.7)', 'font-family:inherit'
    ].join(';'));
    title.innerHTML = `<div style="font-weight:600;">TURNING POINT</div>
                      <div style="font-size:10px;opacity:0.65;margin-top:3px;">${scene.speaker} \u00b7 a choice you cannot unchoose</div>`;
    root.appendChild(title);

    // Character
    const charWrap = el('div', [
      'position:relative', 'width:72%', 'max-width:360px',
      'aspect-ratio:3/5', 'margin-bottom:16vh',
      'display:flex', 'align-items:flex-end', 'justify-content:center',
      'opacity:0', 'transform:translateY(18px) scale(0.97)',
      'transition:opacity 900ms ease, transform 1100ms cubic-bezier(.2,.8,.2,1)'
    ].join(';'));
    const charImg = el('img', [
      'width:100%', 'height:100%', 'object-fit:contain',
      'filter:drop-shadow(0 12px 38px rgba(0,0,0,0.7))',
      'pointer-events:none', 'user-select:none'
    ].join(';'));
    charImg.src = scene.pose;
    charImg.onerror = () => {
      charImg.style.opacity = '0';
      charWrap.style.background = `radial-gradient(ellipse at center bottom, ${pal.glow} 0%, transparent 65%)`;
      charWrap.style.minHeight = '55vh';
    };
    charImg.onload = () => {
      if (charImg.naturalWidth < 50) charImg.onerror();
    };
    charWrap.appendChild(charImg);
    root.appendChild(charWrap);

    // Dialogue panel (for setup + response)
    const dialogue = el('div', [
      'position:absolute', 'left:6%', 'right:6%', 'bottom:6%',
      'padding:16px 20px', 'border-radius:18px',
      'background:rgba(10,6,22,0.78)', 'backdrop-filter:blur(6px)',
      `color:${pal.accent}`, 'font-size:17px', 'line-height:1.45', 'font-family:inherit',
      'box-shadow:0 6px 28px rgba(0,0,0,0.55)', 'min-height:64px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 500ms ease, transform 500ms ease'
    ].join(';'));
    const speaker = el('div', 'font-size:11px;letter-spacing:2px;opacity:0.65;margin-bottom:6px;', scene.speaker);
    const line = el('div', 'min-height:42px;');
    // "tap to continue" hint — fades in once a line finishes typing,
    // fades out on tap. Owner asked for strict tap-to-continue (no
    // auto-advance), and a visible hint so the player knows to tap.
    const tapHint = el('div', [
      'margin-top:10px', 'text-align:right',
      'font-size:11px', 'letter-spacing:1.5px',
      'opacity:0', 'transition:opacity 350ms ease',
      'pointer-events:none', 'font-style:italic',
      `color:${pal.accent}`
    ].join(';'), 'tap to continue');
    dialogue.appendChild(speaker);
    dialogue.appendChild(line);
    dialogue.appendChild(tapHint);
    root.appendChild(dialogue);

    // Choices panel (hidden until prompt)
    const choicesWrap = el('div', [
      'position:absolute', 'left:6%', 'right:6%', 'bottom:6%',
      'display:flex', 'flex-direction:column', 'gap:10px',
      'opacity:0', 'pointer-events:none',
      'transition:opacity 400ms ease'
    ].join(';'));
    root.appendChild(choicesWrap);

    document.body.appendChild(root);
    requestAnimationFrame(() => { root.style.opacity = '1'; });
    await wait(300);
    title.style.opacity = '1';
    charWrap.style.opacity = '1';
    charWrap.style.transform = 'translateY(0) scale(1)';
    await wait(500);
    dialogue.style.opacity = '1';
    dialogue.style.transform = 'translateY(0)';

    // Tap-to-skip helpers
    let skipResolve = null;
    let skipPromise = new Promise(res => { skipResolve = res; });
    const resetSkip = () => { skipPromise = new Promise(res => { skipResolve = res; }); };
    const onSkip = (e) => {
      if (e && e.target && e.target.closest && e.target.closest('button')) return;
      if (skipResolve) { const r = skipResolve; skipResolve = null; r(); }
    };
    root.addEventListener('click', onSkip);
    root.addEventListener('touchstart', onSkip, { passive: true });
    const typeOrSkip = async (text) => {
      // Hide the tap hint while typing — it should only show AFTER the
      // line finishes typing, to prompt the player to tap.
      tapHint.style.opacity = '0';
      const fastComplete = skipPromise.then(() => { line.textContent = text; });
      let cancelled = false;
      skipPromise.then(() => { cancelled = true; });
      let i = 0; line.textContent = '';
      const speed = 32;
      const tick = new Promise(resolve => {
        const step = () => {
          if (cancelled) { line.textContent = text; resolve(); return; }
          if (i < text.length) { line.textContent += text[i++]; setTimeout(step, speed); }
          else resolve();
        };
        step();
      });
      await Promise.race([tick, fastComplete]);
      resetSkip();
    };
    // Strict tap-to-continue. Owner explicitly asked for no auto-advance:
    // wait for a tap, no timeout. Show the hint while we wait.
    const waitForTap = async () => {
      tapHint.style.opacity = '0.7';
      await skipPromise;
      tapHint.style.opacity = '0';
      resetSkip();
    };

    // Play setup beats — every line waits for a tap (no auto-advance)
    for (const text of scene.setup) {
      await typeOrSkip(text);
      await waitForTap();
    }
    await typeOrSkip(scene.prompt);
    await waitForTap();

    // Hide dialogue, show choices
    dialogue.style.opacity = '0';
    await wait(250);
    scene.choices.forEach((c) => {
      const btn = el('button', [
        'padding:14px 18px', 'border-radius:20px',
        'border:1px solid rgba(255,255,255,0.18)',
        `background:linear-gradient(180deg,rgba(28,18,42,0.94),rgba(16,10,28,0.94))`,
        `color:${pal.accent}`, 'font-size:15px', 'font-weight:500', 'line-height:1.4',
        'box-shadow:0 4px 14px rgba(0,0,0,0.4)',
        'cursor:pointer', 'text-align:left', 'font-family:inherit',
        'backdrop-filter:blur(4px)'
      ].join(';'), c.label);
      btn.addEventListener('click', async () => {
        choicesWrap.style.pointerEvents = 'none';
        choicesWrap.style.opacity = '0';
        try { localStorage.setItem(choiceKey(charId), c.id); } catch (_) {}
        await wait(350);
        // Play response — strict tap-to-continue, same as setup beats
        dialogue.style.opacity = '1';
        for (const text of c.response) {
          await typeOrSkip(text);
          await waitForTap();
        }
        // Fade out root
        root.style.opacity = '0';
        await wait(560);
        try { root.remove(); } catch (_) {}
        if (onDone) onDone();
      });
      choicesWrap.appendChild(btn);
    });
    choicesWrap.style.pointerEvents = 'auto';
    choicesWrap.style.opacity = '1';
  }

  // ---------------------------------------------------------------
  // POLLING
  let _playing = false;
  let _mountedFor = null;

  function isGameIdle(g) {
    if (!g) return false;
    if (g.sceneActive) return false;
    if (g.characterLeft) return false;
    // CRITICAL: don't fire during a character switch / intro / chain
    // transition. Owner reported a Turning Point firing on the "Choose
    // Your Companion" page — same leak class as the Caspian affection
    // scene. Same hardened guards.
    if (document.body.classList.contains('pp-chain-in-progress')) return false;
    const introOv = document.getElementById('intro-overlay');
    if (introOv && !introOv.classList.contains('hidden') &&
        getComputedStyle(introOv).display !== 'none') return false;
    // Game container must be ACTUALLY visible. window._game can be a
    // stale reference during the brief gap between hide-old / show-new.
    const gc = document.getElementById('game-container');
    if (!gc || gc.classList.contains('hidden') ||
        getComputedStyle(gc).display === 'none') return false;
    // Also bail if the select screen is visible — Turning Points must
    // never appear on the companion grid.
    const sel = document.getElementById('select-screen');
    if (sel && !sel.classList.contains('hidden') &&
        getComputedStyle(sel).display !== 'none') return false;
    const block = document.querySelector([
      '#ms-encounter-root', '#mscard-root', '#chp-page', '#chp-finale-choice',
      '#mg-overlay', '#mon-bundle-back', '#settings-overlay:not(.hidden)',
      '#cinematic-overlay.visible', '#event-overlay:not(.hidden)',
      '#gift-panel:not(.hidden)', '#training-panel:not(.hidden)',
      '#story-overlay:not(.hidden)',
      '#tp-root', '#noir-whisper', '#cc-bubble',
      '#pp-ready-overlay', '#pp-onboarding-overlay', '#pp-chain-toast',
      '#pp-chain-lock-overlay'
    ].join(','));
    return !block;
  }

  function tick() {
    if (!isEnabled()) return;
    if (_playing) return;
    // QUIET FIRST HOUR: turning points are big, narrative-claiming scenes.
    // They must not collide with the chain or any other overlay.
    if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) return;
    const g = window._game;
    if (!g) return;
    if (!isGameIdle(g)) return;
    const charId = g.characterId || g.selectedCharacter;
    if (!charId || !SCENES[charId]) return;
    // Must have met them
    if (localStorage.getItem('pp_ms_encounter_' + charId + '_seen') !== '1') return;
    // Must not have seen their turning point yet
    if (localStorage.getItem(seenKey(charId)) === '1') return;
    const aff = affectionOf(charId);
    if (aff < AFF_THRESHOLD) return;
    // Owner (Aug 2026): turning points must not fire on day 1 of the care route —
    // they land way too early (e.g. Alistair's "a courier came from the king"
    // hitting a brand-new player). Require day 2+ of care (same day counter the
    // date system gates on). storyDay is 1 on the first care day, 2+ after.
    if ((g.storyDay || 1) < 2) return;

    _playing = true;
    _mountedFor = charId;
    try { localStorage.setItem(seenKey(charId), '1'); } catch (_) {}
    playTurningPoint(charId, SCENES[charId], () => { _playing = false; _mountedFor = null; });
  }

  // Watchdog: matches the affection-scenes pattern. If a Turning Point is
  // mounted and the player navigates away (back to companion select,
  // switches character, intro reopens, chain transition starts) — force-
  // remove tp-root within 500ms. Same fix-queue-AND-DOM principle the
  // owner has flagged repeatedly.
  function watchdog() {
    if (!_mountedFor) return;
    const tp = document.getElementById('tp-root');
    if (!tp) { _mountedFor = null; _playing = false; return; }
    const gc = document.getElementById('game-container');
    const gcVisible = gc && !gc.classList.contains('hidden') && getComputedStyle(gc).display !== 'none';
    const sel = document.getElementById('select-screen');
    const selVisible = sel && !sel.classList.contains('hidden') && getComputedStyle(sel).display !== 'none';
    const introOv = document.getElementById('intro-overlay');
    const introOpen = introOv && !introOv.classList.contains('hidden') && getComputedStyle(introOv).display !== 'none';
    const chainBusy = document.body.classList.contains('pp-chain-in-progress');
    const g = window._game;
    const liveChar = g && (g.characterId || g.selectedCharacter);
    const charMismatch = liveChar && liveChar !== _mountedFor;
    if (!gcVisible || selVisible || introOpen || chainBusy || charMismatch) {
      try { tp.remove(); } catch (_) {}
      _mountedFor = null;
      _playing = false;
    }
  }

  function boot() {
    if (!isEnabled()) return;
    try {
      setTimeout(() => { setInterval(tick, POLL_MS); tick(); }, 14000);
      // Watchdog runs unconditionally — needed even when turning points
      // are disabled later, in case a scene was already mounted.
      setInterval(watchdog, 500);
    } catch (e) { console.warn('[turning-points] disabled:', e); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.TurningPoints = {
    isEnabled,
    list: () => Object.keys(SCENES),
    force: (charId) => {
      const scene = SCENES[charId];
      if (!scene) return null;
      try { localStorage.setItem(seenKey(charId), '1'); } catch (_) {}
      // Mirror tick() lifecycle so the watchdog will also clean up a
      // force-mounted scene if the player navigates away.
      _playing = true;
      _mountedFor = charId;
      playTurningPoint(charId, scene, () => { _playing = false; _mountedFor = null; });
      return scene.speaker;
    },
    _debug_reset: () => {
      try {
        Object.keys(localStorage).filter(k => k.startsWith('pp_tp_')).forEach(k => localStorage.removeItem(k));
      } catch (_) {}
    }
  };
})();
