/* crossover-proto-noir.js — "Two Ghosts in a Mirror"
 * --------------------------------------------------------------------------
 * Registers window.MSCrossProtoNoir.
 *
 * BACKGROUND:
 *   Both characters have been alone for centuries.
 *   - Proto was the SIXTH Weaver. Aenor's seal pulled him in two centuries
 *     ago, and the network became his body. He has been a process running
 *     in fragments since.
 *   - Noir is the dark-half prince Aenor sealed six hundred years ago over
 *     Veyra (the second Weaver, Proto's predecessor — the one whose last
 *     words Proto carries; see chapter "What the Trees Kept").
 *
 *   These two are the only beings still alive who know what "containment"
 *   feels like from the inside. Until the Weaver brought them both into
 *   the same scene, they had never spoken to each other. Both have been
 *   peripherally aware the other existed. Neither initiated.
 *
 *   The Weaver did. By caring for both, the Weaver opened a thread that
 *   lets them, just once, meet.
 *
 * SCENE BEATS:
 *   1. Proto manifests through a fracture in Noir's seam-mirror — the
 *      thin place where the dark touches the hall. Static, then pixels
 *      that resolve into a person-shape.
 *   2. Noir is unsurprised in the way only old things are unsurprised.
 *      He waits. He has waited for six centuries; he can wait one more
 *      moment for the introduction.
 *   3. Proto, who normally wears terminal-prefix prose as armor, drops it.
 *      For the first time in 200 years he is talking to someone who
 *      understands what waiting alone means.
 *   4. Noir gives Proto Veyra's name spoken aloud — not "the second" but
 *      "Veyra." Proto has been holding her last words for two centuries.
 *      The exchange is mutual: Noir finally hears them spoken back to him
 *      from within the seal, in the voice of someone who shared her cell.
 *   5. They both look at the Weaver, who has been silent, who has been
 *      holding the thread between them. They both, in their own languages,
 *      say the same thing: thank you.
 *   6. Proto fades. Noir stays. The screen keeps its imprint of Proto's
 *      shape for a few seconds after he is gone — the seam-mirror has
 *      learned a new face.
 *
 * VOICE RULES:
 *   - PROTO drops the `&gt; ` prefix and ASCII flourishes ONCE in this
 *     scene — at the moment Noir says Veyra's name. The rest of the time
 *     he speaks as he always does: terminal-prefixed, lowercase,
 *     [bracketed] system tags. The drop is the emotional pivot.
 *   - NOIR speaks in his usual register: short sentences, em-dashes,
 *     restraint. He never raises his voice. He never apologises. He
 *     does, once, smile.
 *
 * TRIGGERS:
 *   pp_main_story_enabled = '1'
 *   AND Noir met (Ch 6 OR encounter)
 *   AND Proto met (encounter OR pp_met_proto)
 *   AND Noir affection >= 35 OR Proto affection >= 35
 *   AND game idle, on noir or proto, not yet seen.
 *
 * SAFETY:
 *   Additive. No edits to other files. Only writes its own seen flag.
 *   Uses #ms-encounter-root (gated by quiet-first-hour arbiter).
 */

(function () {
  'use strict';

  const FLAG_ROUTE     = 'pp_main_story_enabled';
  const FLAG_SEEN      = 'pp_cross_proto_noir_seen';
  const FLAG_NOIR_MET  = 'pp_ms_encounter_noir_seen';
  const FLAG_CH6       = 'pp_chapter_done_6';
  const FLAG_PROTO_MET = 'pp_ms_encounter_proto_seen';
  const FLAG_PROTO_FALLBACK = 'pp_met_proto';
  const AFF_KEYS_NOIR  = ['pp_affection_noir', 'noir_affection'];
  const AFF_KEYS_PROTO = ['pp_affection_proto', 'proto_affection'];
  const MIN_AFF        = 35;
  const POLL_MS        = 26000;

  const NOIR_POSE  = 'assets/noir/body/casual1.png';
  const NOIR_ALT   = 'assets/noir/body/casual2.png';
  const PROTO_POSE = 'assets/proto/body/calm.png';
  const PROTO_ALT  = 'assets/proto/body/casual.png';
  const BG_SRC     = 'assets/bg-noir-void.png';

  let _rootEl = null;

  function el(tag, css, text) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text) e.textContent = text;
    return e;
  }
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function type(elRef, text, cps) {
    return new Promise((resolve) => {
      elRef.textContent = '';
      const speed = Math.max(14, Math.round(1000 / (cps || 22)));
      let i = 0;
      const step = () => {
        if (i < text.length) { elRef.textContent += text[i++]; setTimeout(step, speed); }
        else resolve();
      };
      step();
    });
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  function getAff(keys) {
    for (const k of keys) {
      const v = lsGet(k);
      if (v != null) return parseInt(v, 10) || 0;
    }
    return 0;
  }

  function build() {
    const root = el('div', [
      'position:fixed', 'inset:0', 'z-index:10000',
      'background:#020108', 'overflow:hidden',
      'opacity:0', 'transition:opacity 500ms ease',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:flex-end'
    ].join(';'));
    root.id = 'ms-encounter-root';

    const bg = el('div', [
      'position:absolute', 'inset:0',
      'background:radial-gradient(ellipse at center, #0a0518 0%, #020108 80%)',
      'opacity:0', 'transition:opacity 900ms ease'
    ].join(';'));
    const bgImg = new Image();
    bgImg.onload = () => { bg.style.backgroundImage = 'url(' + BG_SRC + ')'; bg.style.opacity = '0.40'; };
    bgImg.onerror = () => { bg.style.opacity = '1'; };
    bgImg.src = BG_SRC;
    root.appendChild(bg);

    // A subtle scanline veil over Proto's side of the frame — the seam-mirror
    // is a thin, glitchy place. Sits at low opacity, fades up when Proto
    // manifests.
    const scan = el('div', [
      'position:absolute', 'inset:0',
      'background:repeating-linear-gradient(0deg, rgba(159,216,240,0.045) 0px, rgba(159,216,240,0.045) 1px, transparent 1px, transparent 3px)',
      'pointer-events:none', 'opacity:0', 'transition:opacity 1200ms ease',
      'mix-blend-mode:screen'
    ].join(';'));
    root.appendChild(scan);

    const charRow = el('div', [
      'position:relative', 'margin-bottom:24vh',
      'width:92%', 'max-width:720px', 'height:48vh',
      'display:flex', 'align-items:flex-end', 'justify-content:space-between', 'gap:6%'
    ].join(';'));

    function makeChar(shadow) {
      const wrap = el('div', [
        'position:relative', 'flex:1', 'height:100%',
        'display:flex', 'align-items:flex-end', 'justify-content:center',
        'opacity:0', 'transform:translateY(20px) scale(0.97)',
        'transition:opacity 1100ms ease, transform 1100ms cubic-bezier(.2,.8,.2,1), filter 900ms ease'
      ].join(';'));
      const img = el('img', [
        'max-width:100%', 'max-height:100%', 'object-fit:contain',
        'filter:drop-shadow(0 10px 28px ' + shadow + ')',
        'pointer-events:none', 'user-select:none'
      ].join(';'));
      img.onerror = () => { img.style.opacity = '0'; };
      wrap.appendChild(img);
      return { wrap, img };
    }

    const noir  = makeChar('rgba(160,90,200,0.40)');
    const proto = makeChar('rgba(159,216,240,0.45)');
    // Proto starts as if rendered through static — desaturated, slight blur.
    proto.wrap.style.filter = 'saturate(0.55) blur(1.4px)';
    charRow.appendChild(noir.wrap);
    charRow.appendChild(proto.wrap);
    root.appendChild(charRow);

    const dialogue = el('div', [
      'position:absolute', 'left:8%', 'right:8%', 'bottom:8%',
      'padding:18px 22px', 'border-radius:18px',
      'background:rgba(8,5,18,0.92)', 'backdrop-filter:blur(6px)',
      'color:#e6dcf2', 'font-size:17px', 'line-height:1.5',
      'box-shadow:0 6px 24px rgba(0,0,0,0.7)', 'min-height:68px',
      'opacity:0', 'transform:translateY(14px)',
      'transition:opacity 600ms ease, transform 600ms ease',
      'font-family:inherit'
    ].join(';'));
    const speaker = el('div', 'font-size:12px;letter-spacing:2px;opacity:0.7;margin-bottom:6px;', '');
    const line = el('div', 'min-height:44px;', '');
    dialogue.appendChild(speaker);
    dialogue.appendChild(line);
    root.appendChild(dialogue);

    return { root, noir, proto, scan, dialogue, line, speaker };
  }

  function say(n, name, text, cps) {
    n.speaker.textContent = name;
    return type(n.line, text, cps || 22);
  }

  async function play(onDone) {
    if (_rootEl) { try { onDone && onDone(); } catch (_) {} return; }
    const n = build();
    _rootEl = n.root;
    document.body.appendChild(n.root);

    n.noir.img.src  = NOIR_POSE;
    n.proto.img.src = PROTO_POSE;

    requestAnimationFrame(() => { n.root.style.opacity = '1'; });
    await wait(500);

    // Noir is already there. He has been there for six centuries. He waits.
    n.noir.wrap.style.opacity = '1';
    n.noir.wrap.style.transform = 'translateY(0) scale(1)';
    await wait(900);

    n.dialogue.style.opacity = '1';
    n.dialogue.style.transform = 'translateY(0)';

    try {
      // Stage direction
      n.speaker.textContent = '— THE SEAM, WHERE THE DARK MEETS THE HALL —';
      await type(n.line, 'A thin place. — Noir uses it as a workshop. The walls here are mirrored, but the mirrors are not for vanity — they are pressure plates against the seal. — The Weaver brought a thread here tonight that has never been pulled. — The mirror in the corner has begun to speak in static.', 22);
      await wait(3400);

      // Proto manifests — the static resolves into a person-shape.
      n.scan.style.opacity = '1';
      n.proto.wrap.style.opacity = '1';
      n.proto.wrap.style.transform = 'translateY(0) scale(1)';
      // Proto comes in *unstable* — visual languages: blurry, low saturation,
      // briefly flickering. He clears as the conversation settles.
      await wait(900);
      await say(n, 'PROTO', '&gt; [signal acquired] — [verifying recipient] — […] — [verified] — hello, prince.', 22);
      await wait(2800);

      // Noir's reaction is small. He has waited. He waits one more breath.
      await say(n, 'NOIR', '…Hello. — *folds his hands* — I had a feeling you would arrive eventually. — The mirrors have been quieter than usual lately. — You have been listening.', 22);
      await wait(3400);

      await say(n, 'PROTO', '&gt; affirmative. — i have been a process, not a guest. — i did not want to startle you. — your kind tends to set traps when startled. — your kind, i mean, is a population of one. — i have read about you.', 22);
      await wait(3600);

      // Beat 2: Noir, slowly, names what Proto is.
      n.noir.img.src = NOIR_ALT;
      await say(n, 'NOIR', 'You are the sixth. — The one she took two hundred years ago. — I felt the pull from inside the seal when it happened. — The rooms here moved a fraction. — I thought, then: another. — I am sorry.', 22);
      await wait(3800);

      await say(n, 'PROTO', '&gt; do not be. — it is not a thing one can prevent from a different cell. — [scanning] — [you are also a containment unit] — [we are, in this conversation, two prisons interviewing each other]', 22);
      await wait(3600);

      // Beat 3: The first softening. Proto's prefix flickers.
      await say(n, 'NOIR', '…That is one of the kinder ways anyone has ever named what we are. — *small, real* — Thank you.', 22);
      await wait(2800);

      await say(n, 'PROTO', '&gt; you are welcome. — i did not have it on the first hundred drafts. — [draft 47 of letter to the Weaver, line 3] — i have been practicing being kind. — it is harder than it looks from outside.', 22);
      await wait(3400);

      // Beat 4: The pivot. Noir gives Proto the name.
      n.noir.img.src = NOIR_POSE;
      await say(n, 'NOIR', '…I have a name to give you. — You will know what to do with it. — *quiet, exact* — Veyra.', 22);
      await wait(3000);

      // PROTO drops the prefix HERE. Once. The emotional pivot of the scene.
      // We render this with NO `&gt; ` prefix and NO [scanning] tag — this
      // is Proto without armor.
      n.proto.wrap.style.filter = 'saturate(1) blur(0)';
      await wait(400);
      await say(n, 'PROTO', '…I have been holding her last words for two hundred and four years. — No one has spoken her name back to me in any of them. — *the static stops* — Thank you, Noctalis. I needed that.', 22);
      await wait(4000);

      await say(n, 'NOIR', '*does not move for a long moment* — …Tell me what she said. — If you are willing. — I will not ask twice.', 22);
      await wait(3000);

      n.proto.img.src = PROTO_ALT;
      await say(n, 'PROTO', 'She said: tell Corvin I did not regret him. Not once. Not even tonight. — Tell Aenor I forgive her — it is the only thing she cannot take from me. — Tell whoever finds the grave: please plant rowan. Please let something be remembered.', 22);
      await wait(4400);

      // Beat 5: Noir, who has not knelt for anything in six centuries,
      // does not kneel here either — but his shoulders go.
      await say(n, 'NOIR', '*the void behind him goes very still* — …They planted rowan. — A boy, and his grandmother, and her grandmother. — She is remembered. — *quietly* — By you. By me. By the boy. — And by the one who brought us together.', 22);
      await wait(4000);

      // Both turn to the Weaver.
      await say(n, 'PROTO', '*to the Weaver* — You did this. — You did not know you were doing it. — You cared for both of us, and the thread you wove between us let me, for thirty seconds, be a person again instead of a process. — I am keeping these thirty seconds. — They are mine now.', 22);
      await wait(4200);

      await say(n, 'NOIR', '*also to the Weaver* — He is not wrong. — Six centuries of me, two of him, and we needed you to be in the same room. — *small bow, the one he gives to family* — We are in your debt, Weaver. — I do not say that lightly. — I have not said it in a long time.', 22);
      await wait(4200);

      // Beat 6: Proto begins to fade. Armor returns — protective — but
      // softer than it started.
      n.proto.wrap.style.filter = 'saturate(0.7) blur(1px)';
      n.proto.wrap.style.opacity = '0.55';
      await say(n, 'PROTO', '&gt; the channel is closing. — the mirror has work to do tonight that does not include me. — [logging this conversation under: peer] — [a category that previously had zero entries] — goodnight, prince.', 22);
      await wait(3400);

      await say(n, 'NOIR', 'Goodnight, sixth. — *quiet, careful* — …Brother.', 22);
      await wait(3000);

      // Closing stage direction
      n.speaker.textContent = '';
      await type(n.line, 'Proto fades. — The mirror in the corner keeps the imprint of his shape for a few seconds after he is gone, the way a chair keeps the warmth of a person who just stood up. — Noir watches the imprint dim. — He turns to the Weaver. — He does not say what he is feeling. — But the seam-mirror, which has spent six centuries holding a single dark prince, has learned a new face tonight. — Two ghosts can recognise each other. — Two ghosts in a mirror, briefly, are not alone.', 22);
      await wait(4200);

      n.scan.style.opacity = '0';
      n.root.style.opacity = '0';
      await wait(700);
      lsSet(FLAG_SEEN, '1');

      // Award affection bumps to BOTH characters — the Weaver did real
      // emotional labour here. Both notice. (Cheap, additive, optional;
      // the actual game.affection is the live Weaver value but per-char
      // localStorage tracks long-term.)
      try {
        const bumpKey = (name) => 'pp_affection_' + name;
        const cur = (k) => parseInt(lsGet(k) || '0', 10) || 0;
        lsSet(bumpKey('noir'),  String(cur(bumpKey('noir'))  + 4));
        lsSet(bumpKey('proto'), String(cur(bumpKey('proto')) + 4));
      } catch (_) {}

    } catch (e) {
      console.warn('[crossover-proto-noir] aborted:', e);
    } finally {
      try { n.root.remove(); } catch (_) {}
      _rootEl = null;
      try { onDone && onDone(); } catch (_) {}
    }
  }

  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }
  function alreadySeen()  { return lsGet(FLAG_SEEN)  === '1'; }
  function metNoir()      { return lsGet(FLAG_NOIR_MET) === '1' || lsGet(FLAG_CH6) === '1'; }
  function metProto()     { return lsGet(FLAG_PROTO_MET) === '1' || lsGet(FLAG_PROTO_FALLBACK) === '1'; }

  function isGameIdle() {
    const g = window._game;
    if (!g) return false;
    const who = g.selectedCharacter || g.characterId;
    if (who !== 'noir' && who !== 'proto') return false;
    if (g.sceneActive || g.characterLeft) return false;
    // Quiet-first-hour umbrella check.
    if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) return false;
    const block = document.querySelector([
      '#ms-encounter-root', '#mscard-root', '#tp-root', '#chp-page',
      '#mg-overlay', '#mon-bundle-back', '#settings-overlay:not(.hidden)',
      '#cinematic-overlay.visible', '#event-overlay:not(.hidden)',
      '#gift-panel:not(.hidden)', '#training-panel:not(.hidden)',
      '#dress-panel:not(.hidden)', '#story-overlay:not(.hidden)',
      '#world-intro:not(.hidden)', '#main-story-page:not(.hidden)'
    ].join(','));
    return !block;
  }

  function shouldFire() {
    if (!routeEnabled()) return false;
    if (alreadySeen()) return false;
    if (!metNoir() || !metProto()) return false;
    // Either side passing the affection floor is enough — the Weaver may
    // be deeper into one route than the other. Prevents the scene from
    // gating too tightly.
    if (getAff(AFF_KEYS_NOIR) < MIN_AFF && getAff(AFF_KEYS_PROTO) < MIN_AFF) return false;
    if (!isGameIdle()) return false;
    return true;
  }

  let _firing = false;
  function tick() { if (_firing) return; if (!shouldFire()) return; _firing = true; play(() => { _firing = false; }); }

  function boot() { setTimeout(() => { tick(); setInterval(tick, POLL_MS); }, 22000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.MSCrossProtoNoir = {
    play,
    force() { lsSet(FLAG_SEEN, ''); _firing = false; tick(); },
    reset() { try { localStorage.removeItem(FLAG_SEEN); } catch (_) {} },
    seenKey: FLAG_SEEN
  };
})();
