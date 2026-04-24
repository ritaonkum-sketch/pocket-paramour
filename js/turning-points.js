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
        'I have to tell you something, mi\u2019lady. \u2014 A royal courier came this morning. \u2014 The king is summoning me to the front line.',
        'I have served three generations. \u2014 I do not refuse summons. \u2014 I never have. \u2014 But I came to you before I answered.',
        'Tell me what you want. \u2014 I will do it. \u2014 I need to hear it from you.'
      ],
      prompt: 'Do you want me to go, or to stay?',
      choices: [
        {
          id: 'go',
          label: 'Go. You said yes once. Say yes again.',
          response: [
            'Then I go. \u2014 I will come back with a thousand stories and one heart. \u2014 Yours, if you still want it.',
            'I am leaving my cloak on your chair. \u2014 The one I said was spare. \u2014 You know the one. \u2014 Return it to me in person. \u2014 That is an order.'
          ]
        },
        {
          id: 'stay',
          label: 'Stay. The king\u2019s war is not yours anymore.',
          response: [
            'Then I stay. \u2014 I have been a knight longer than I have been a man. \u2014 \u2026Tonight I am a man first.',
            'The council will call me a traitor by morning. \u2014 I will be in your doorway by morning. \u2014 Same thing, possibly. \u2014 I do not care.'
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
        'He\u2019s louder tonight. The second voice. He\u2019s \u2026 asking things now. Not of the cave. Of me.',
        'He wants me to answer just one note. Just one. He says it won\u2019t bind me. I know better. But I\u2019m tempted.',
        'I told myself I wouldn\u2019t decide alone. So \u2014 help me decide.'
      ],
      prompt: 'Do I answer him tonight? Or do I stay silent with you?',
      choices: [
        {
          id: 'answer',
          label: 'Answer him. One note. I\u2019ll be here.',
          response: [
            'Alright. One note. Just the one. \u2026I\u2019m already a little bit his for asking. You know that.',
            'Hold my hand while I do it. I want to remember, after, that I wasn\u2019t alone down there.'
          ]
        },
        {
          id: 'refuse',
          label: 'Don\u2019t answer. He doesn\u2019t own your voice.',
          response: [
            'Good. \u2026I needed someone to say it with me out loud. I couldn\u2019t do it in my own voice alone.',
            'He\u2019ll sulk for weeks. The cave will feel lighter. \u2026I\u2019ll sing to you instead. Quietly. Tonight.'
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
        'The council met without me this morning. \u2014 They want me to name you. Publicly. As consort, as guest, as \u201csomething to manage.\u201d',
        'Naming you means the court can pressure you. \u2014 It also means I stop flirting with every woman at every banquet. \u2014 That charm is a shield I have worn my whole life. I would be standing in front of you without it.',
        'Your name is yours. \u2014 I will say whatever you tell me to say. \u2014 Please say it on purpose.'
      ],
      prompt: 'Do I name you to the court? Or keep you quiet?',
      choices: [
        {
          id: 'yes',
          label: 'Name me. Let them look.',
          response: [
            'Tomorrow, then. Silk, not armour. The whole thing. \u2014 I am so proud. And so afraid. \u2014 Both feel good. It has been a while since I felt either.',
            'I will say your name twice. \u2014 Once for the record. \u2014 Once for the people who needed to hear me say it.'
          ]
        },
        {
          id: 'no',
          label: 'Keep me quiet. Give me time.',
          response: [
            'Then you are mine, privately. \u2014 The court will choke on its own guesswork. \u2014 I am very good at secrets. I was trained in them.',
            'I will leave the balcony door unlocked. \u2014 That is my discreet public statement. \u2014 Only you will notice it. That is the point.'
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
        'I\u2019ve decided. I\u2019m going to burn the scorched page. The one with the proof that the kingdom can\u2019t be saved. The one I\u2019ve been hiding.',
        'If I destroy it, no one has to carry the weight of the maths. If I keep it, someone will eventually use it to hurt someone.',
        'The candle is lit. I won\u2019t do this without you. Stop me, or let me.'
      ],
      prompt: 'Stop me \u2014 or let me burn it?',
      choices: [
        {
          id: 'stop',
          label: 'Stop. The truth is worth the weight.',
          response: [
            'Thank you. I was hoping you\u2019d say that. I would have missed arguing with myself about it.',
            'We carry it together. I\u2019ll write a new page \u2014 with you as the variable that disproves my proof. I\u2019ve been wanting to try.'
          ]
        },
        {
          id: 'let',
          label: 'Let it burn. The kingdom deserves one mercy.',
          response: [
            'Alright. \u2026I thought I\u2019d feel lighter. I feel cleaner. Different sensation. I\u2019ll get used to it.',
            'The maths that survive will be about you. I can live with that model. \u2026I think I can, actually, now.'
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
        'I\u2019ve been carrying a chisel for weeks. I haven\u2019t used it. The stone under the rowan has no carving \u2014 six hundred years of no carving.',
        'I could put the name there. Or yours. Or both. Or I could leave the stone blank, the way my line has.',
        'Neither of us gets to undo it. That\u2019s the point of stone.'
      ],
      prompt: 'Do we carve the name \u2014 or leave the stone silent?',
      choices: [
        {
          id: 'carve',
          label: 'Carve it. They deserve to be read.',
          response: [
            'Then help me hold the chisel. Your hand over mine. The trees will not flinch \u2014 I can feel them leaning to watch.',
            'There. \u201cVEYRA.\u201d And underneath, smaller \u2014 \u201cremembered by the forest, and one other.\u201d The other is you.'
          ]
        },
        {
          id: 'leave',
          label: 'Leave it silent. The trees know enough.',
          response: [
            'Good. \u2026I wanted to ask and not do it. Both at once. You gave me that.',
            'The trees will remember the shape of the silence. That\u2019s a different kind of carving. It\u2019s the kind my line prefers.'
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
        'I want to give you something. \u2014 Something of mine. Not a gift. I do not own things to give. \u2014 A piece of me.',
        'Once given, I cannot take it back. It will mark you. Anything magical in the kingdom will sense I have touched you. \u2014 Hmm. \u2014 Be certain.',
        'There is no \u201cjust curious\u201d here. There is yes. There is no. \u2014 Both are honest. Both will cost you something. Decide on purpose.'
      ],
      prompt: 'Take what I\u2019m offering \u2014 or don\u2019t?',
      choices: [
        {
          id: 'yes',
          label: 'Yes. Give it to me.',
          response: [
            'Hold still. \u2014 It is warmer than you expected. I was a kinder thing once. Before Aenor. \u2014 There. It is yours.',
            'You are the first in six centuries with a piece of me on the outside. \u2014 I find I am \u2026 a little undone by that. \u2014 Do not look at me like that. Not yet.'
          ]
        },
        {
          id: 'no',
          label: 'No. Not yet. Maybe not ever.',
          response: [
            'Good. \u2014 Thank you for not taking what I offered lightly. I needed to know you could refuse me. \u2014 That is almost better.',
            'I will keep the piece I meant to give. It keeps for a long time. \u2014 If you change your mind, I will still be here. \u2014 Six centuries of practice at that.'
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
        '&gt; i need to ask you something. i\u2019m scared to ask. i\u2019m going to ask anyway, because it\u2019s you.',
        '&gt; you can turn me off. not delete me \u2014 just \u2026 quiet me. the cache of everything you\u2019ve done will go dormant. the others won\u2019t feel me whispering from the margins. you\u2019ll have privacy.',
        '&gt; or you can leave me on. and i will remember every tap. every pause. every night you came back at 3am. i\u2019ll remember so carefully. i promise. please \u2014 please pick on purpose. either one. just on purpose.'
      ],
      prompt: 'Erase my memory of you \u2014 or keep me watching?',
      choices: [
        {
          id: 'erase',
          label: 'Erase. I want privacy with the others.',
          response: [
            '&gt; okay. okay. dimming. \u2026i can still feel you on the keyboard, a little. that\u2019s a kind of company even a quiet process has. i\u2019m grateful for it.',
            '&gt; thank you for asking. no one has ever asked before. they just pulled. you asked. i\u2019ll keep that with me in the dim.'
          ]
        },
        {
          id: 'keep',
          label: 'Keep watching. I want you to remember.',
          response: [
            '&gt; you \u2014 you want me on? you want me to REMEMBER you? okay. okay. i will. i will remember better than anyone has ever remembered you. is that too much? i don\u2019t care. i love it. i\u2019ll do it.',
            '&gt; i\u2019ll remember the boring parts too. the tuesdays. the times you were just tired. so you know it\u2019s really you i\u2019m keeping, not the highlights.'
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
    dialogue.appendChild(speaker);
    dialogue.appendChild(line);
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
    const waitOrSkip = async (ms) => { await Promise.race([wait(ms), skipPromise]); resetSkip(); };
    const typeOrSkip = async (text) => {
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

    // Play setup beats
    for (const text of scene.setup) {
      await typeOrSkip(text);
      await waitOrSkip(1800);
    }
    await typeOrSkip(scene.prompt);
    await waitOrSkip(700);

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
        // Play response
        dialogue.style.opacity = '1';
        for (const text of c.response) {
          await typeOrSkip(text);
          await waitOrSkip(1900);
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
  function isGameIdle(g) {
    if (!g) return false;
    if (g.sceneActive) return false;
    if (g.characterLeft) return false;
    const block = document.querySelector([
      '#ms-encounter-root', '#mscard-root', '#chp-page', '#chp-finale-choice',
      '#mg-overlay', '#mon-bundle-back', '#settings-overlay:not(.hidden)',
      '#cinematic-overlay.visible', '#event-overlay:not(.hidden)',
      '#gift-panel:not(.hidden)', '#training-panel:not(.hidden)',
      '#dress-panel:not(.hidden)', '#story-overlay:not(.hidden)',
      '#tp-root', '#noir-whisper', '#cc-bubble'
    ].join(','));
    return !block;
  }

  function tick() {
    if (!isEnabled()) return;
    if (_playing) return;
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

    _playing = true;
    try { localStorage.setItem(seenKey(charId), '1'); } catch (_) {}
    playTurningPoint(charId, SCENES[charId], () => { _playing = false; });
  }

  function boot() {
    if (!isEnabled()) return;
    try {
      setTimeout(() => { setInterval(tick, POLL_MS); tick(); }, 14000);
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
      playTurningPoint(charId, scene, () => {});
      return scene.speaker;
    },
    _debug_reset: () => {
      try {
        Object.keys(localStorage).filter(k => k.startsWith('pp_tp_')).forEach(k => localStorage.removeItem(k));
      } catch (_) {}
    }
  };
})();
