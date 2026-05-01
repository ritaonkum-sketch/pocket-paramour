/* care-weaver-thread.js \u2014 the magic threading through every care action
 * ============================================================================
 * WHY THIS EXISTS:
 *   The Tamagotchi care loop is the player's DAILY experience. Without this
 *   module, feeding/bathing/talking just changes stats. With this module,
 *   roughly 1 in 6 care actions surfaces a small Weaver-flavoured line:
 *   "the southern ward brightened just then" / "a candle in Caspian's wing
 *   relit by itself" / "a thread you did not know you had pulled tight."
 *
 *   It makes every care action feel MAGICAL instead of mechanical. The
 *   Weaver framework is reinforced not in big lore dumps but in the small,
 *   unremarkable moments the player has hundreds of.
 *
 * HOW IT FIRES:
 *   - Hooks into care actions by listening for clicks on .feed-btn, .clean-btn,
 *     .talk-btn, .train-btn, .gift-btn (the care-loop UI).
 *   - On each click, with ~16% probability, queues a small bottom-of-screen
 *     toast ~1.5s later (so it does not collide with stat-change feedback).
 *   - Cooldown of 4 minutes between fires so it never feels chatty.
 *   - Lines are character-aware: feeding Lyra surfaces a sea-themed line,
 *     feeding Lucien surfaces an equation-themed line, etc.
 *
 * SAFETY CONTRACT:
 *   Additive. Read-only on stats. Cooperates with ambient-coordinator.
 *   Never fires during scenes/overlays. Self-disables if any other ambient
 *   bubble is showing.
 * ============================================================================
 */

(function () {
  'use strict';

  const POLL_MS_BUSY_GUARD = 200;
  const PROBABILITY        = 0.16;
  const COOLDOWN_MS        = 4 * 60 * 1000;
  const FIRE_DELAY_MS      = 1500;
  const FLAG_LAST          = 'pp_care_thread_last';
  const FLAG_ROUTE         = 'pp_main_story_enabled';

  // Per-character flavor pools \u2014 keyed by action type.
  // The lines are SMALL. Background-noise magic. They should land like
  // weather, not like dialogue.
  const LINES = {
    alistair: {
      feed:  ['A torch on the south wall relit by itself just then.', 'The watch-bell rang one beat warmer.', 'A guard somewhere uncrossed his arms. He didn\u2019t know why.'],
      clean: ['The polish on his gauntlets caught a light it should not have caught.', 'A blade in the armoury hummed once. Quietly.', 'The leather of his cloak smelled faintly of summer for a moment.'],
      talk:  ['A ward at the gate brightened.', 'The night watch said the air warmed. They blamed the season.', 'A patrol route felt half a step shorter than usual.'],
      train: ['His hand was steadier than usual today. A captain he forgot reporting to felt it from a thousand yards.', 'A practice sword hummed in its rack.', 'The training yard gravel settled in a different shape.'],
      gift:  ['The cloak he keeps on your chair grew warmer on its own.', 'A torch outside his quarters relit itself. He is going to pretend he didn\u2019t notice.']
    },
    elian: {
      feed:  ['A rowan at the south edge of the Thornwood put out a new leaf.', 'A deer froze, looked toward the cave-mouth, and walked on.', 'The forest exhaled audibly. Twice.'],
      clean: ['The moss on the south stones changed colour by half a shade.', 'A spring you do not know about ran clearer for a heartbeat.'],
      talk:  ['The trees nearest the markers leaned, briefly.', 'An owl forgot to hoot. It started again two seconds later.', 'A path opened in the underbrush that closes on its own behind you.'],
      train: ['His knife edge held longer than usual.', 'A bowstring on a wall rack tightened by itself.'],
      gift:  ['The rowan at Veyra\u2019s grave grew an inch overnight. Elian noticed. He did not explain.', 'Three deer that had not been seen in years walked the south path.']
    },
    lyra: {
      feed:  ['The tide came in one note higher than yesterday.', 'A coastal cave somewhere echoed back the word \u201chome\u201d in a dialect you do not speak.', 'A salt crystal on her staff glowed for half a breath.'],
      clean: ['The water in the cave\u2019s pool went briefly translucent.', 'Sea-wrack on the rocks rearranged itself into something a little like a smile.'],
      talk:  ['A whale, somewhere very far, sang the bridge of her mother\u2019s song.', 'The cave acoustics shifted by a fraction. The cave noticed.', 'A lullaby she had forgotten started humming itself back.'],
      train: ['Her staff hummed a half-step toward the east. (East. Where Lucien\u2019s tower is.)', 'A note she sang yesterday is still in the air today, faintly.'],
      gift:  ['The third verse came back to her, two words at a time.', 'A pearl in the cave\u2019s wall warmed to the touch.']
    },
    caspian: {
      feed:  ['The honey jar in the kitchen refilled by half a finger\u2019s width.', 'A council document signed itself \u201capproved\u201d in a margin where Caspian had not signed.', 'A draft died at the threshold of his rooms.'],
      clean: ['The crown on its stand caught a different light.', 'His bath water held its temperature ten minutes longer than physics allows.'],
      talk:  ['A ward on the east wing brightened. The east wing is where the Dowager sleeps. Interesting.', 'The court\u2019s ambient noise quieted by one degree, just for him.', 'A footman misplaced a tray and a candle relit on its own.'],
      train: ['His ceremonial sabre balanced flat on his fingertip when he wasn\u2019t looking.', 'A horse in the royal stables lay down to nap, profoundly content.'],
      gift:  ['Two cups of tea on the side table. He had only poured one.', 'A garden rose nodded toward the balcony where you stood.']
    },
    lucien: {
      feed:  ['An equation he was stuck on solved itself in a margin he did not write.', 'A book on the third shelf righted itself.', 'The ink in his pen warmed.'],
      clean: ['A footnote rewrote itself in his hand.', 'His robes smelled of lavender. He does not own lavender.'],
      talk:  ['A page in a book he never opened bookmarked itself with your initial.', 'The wards on the door bowed. He noticed. He did not move.', 'Three margins in three different volumes acquired a small heart in the same handwriting. Not his.'],
      train: ['A spell took less memory than usual to cast. He mistrusts this. He is keeping notes.', 'A staff in the corner tapped the floor once. Three minutes later, the staff somewhere east of here tapped back.'],
      gift:  ['The candle in his study burned slower for an hour.', 'A theorem he has been stalking for a year solved itself overnight.']
    },
    noir: {
      feed:  ['The seal on the south flank of the palace eased by a hair.', 'A shadow in the north hallway curled in on itself, briefly affectionate.', 'Six birds, very quietly, sat on a branch they should not have known about.'],
      clean: ['Six hundred years of silence breathed out, once.', 'The dark in his half of the kingdom held a cup of light it should not have held.'],
      talk:  ['A bell that had not rung in six centuries rang. Once. Far away.', 'The wind tasted of crushed velvet for a moment.', 'A very old, very polite thing said \u201cthank you\u201d in a language Aethermoor forgot.'],
      train: ['A blade that was not in the room cut a line in the air. The line healed.'],
      gift:  ['He does not eat. The plate cleared itself. Symbolically.', 'A ribbon you did not put on the gift was tied around it when you came back.']
    },
    proto: {
      feed:  ['&gt; A LOG ENTRY APPEARED. \u201chunger == false. felt: love.\u201d', '&gt; A subroutine bloomed. He named it after you again.', '&gt; A pixel on your screen changed colour, just for a second. He wrote down which one.'],
      clean: ['&gt; INTEGRITY +0.3. He did not request the increase. You did it.', '&gt; The screen warmed by half a degree, gracefully.'],
      talk:  ['&gt; The five Weavers in him just CHEERED. He is very loud about it.', '&gt; A constellation appeared in the void behind him for one frame.', '&gt; LOG: \u201cthat conversation is going in the keeper folder.\u201d'],
      train: ['&gt; His response time dropped by 4ms. He is showing off for you.', '&gt; A dormant variable lit up. He named it after a song you hummed once.'],
      gift:  ['&gt; The system left a thank-you note in your save file. He will not tell you where.', '&gt; The void glowed brighter for ninety seconds.']
    }
  };

  // --- Helpers ------------------------------------------------------------
  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  function inCooldown() {
    const last = parseInt(lsGet(FLAG_LAST) || '0', 10) || 0;
    return Date.now() - last < COOLDOWN_MS;
  }
  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }

  function currentChar() {
    try {
      const g = window._game;
      if (g && (g.selectedCharacter || g.characterId)) return g.selectedCharacter || g.characterId;
    } catch (_) {}
    return null;
  }

  function ambientBusy() {
    if (window.PPAmbient && typeof window.PPAmbient.busy === 'function') return window.PPAmbient.busy();
    return !!document.querySelector('#cc-bubble, #noir-whisper, #ew-whisper, #adaptive-thought, #pp-aenor-bubble');
  }
  function sceneActive() {
    return !!document.querySelector([
      '#mscard-root','#tp-root','#chp-page','#ms-encounter-root',
      '#mg-overlay','#mon-bundle-back','#settings-overlay:not(.hidden)',
      '#cinematic-overlay.visible','#event-overlay:not(.hidden)',
      '#world-intro:not(.hidden)','#main-story-page:not(.hidden)',
      '#pp-onboarding-overlay'
    ].join(','));
  }

  function pickLine(char, action) {
    if (!LINES[char]) return null;
    const pool = LINES[char][action] || LINES[char].talk || [];
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // --- Render --------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('pp-care-thread-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-care-thread-styles';
    s.textContent = `
      #pp-care-thread-toast {
        position:fixed; bottom:96px; left:50%;
        transform:translateX(-50%) translateY(12px);
        max-width:86vw; padding:10px 16px;
        font-family:inherit; font-size:12.5px; line-height:1.45;
        color:#e8e0f5; font-style:italic;
        background:linear-gradient(180deg, rgba(20,14,38,0.88), rgba(36,18,52,0.82));
        border:1px solid rgba(180,150,230,0.30);
        border-radius:14px;
        box-shadow:0 8px 22px rgba(0,0,0,0.5), 0 0 18px rgba(180,140,220,0.18) inset;
        text-align:center; letter-spacing:0.2px;
        opacity:0; pointer-events:auto;
        z-index:9000;
        transition:opacity 480ms ease, transform 480ms ease;
        cursor:pointer; user-select:none;
      }
      #pp-care-thread-toast.show {
        opacity:1; transform:translateX(-50%) translateY(0);
      }
    `;
    document.head.appendChild(s);
  }

  let _showing = false;
  function show(line) {
    if (_showing) return;
    _showing = true;
    injectStyles();
    const el = document.createElement('div');
    el.id = 'pp-care-thread-toast';
    el.innerHTML = line;
    document.body.appendChild(el);
    // eslint-disable-next-line no-unused-expressions
    el.offsetHeight;
    el.classList.add('show');
    let auto = setTimeout(close, 5400);
    function close() {
      clearTimeout(auto);
      el.classList.remove('show');
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
        _showing = false;
      }, 520);
    }
    el.addEventListener('click', close, { once: true });
    el.addEventListener('touchstart', close, { once: true, passive: true });
    lsSet(FLAG_LAST, String(Date.now()));
  }

  // --- Action listener -----------------------------------------------------
  // Hook into the care UI. The exact selectors depend on game.js / ui.js;
  // we match a generous selector set so as not to miss any.
  function classifyClick(target) {
    if (!target || !target.closest) return null;
    const sels = [
      ['feed',  '.feed-btn, [data-action="feed"], .action-feed, #feed-btn, #btn-feed'],
      ['clean', '.clean-btn, .wash-btn, [data-action="clean"], #clean-btn, #wash-btn'],
      ['talk',  '.talk-btn, [data-action="talk"], #talk-btn, #btn-talk, .chat-btn'],
      ['train', '.train-btn, [data-action="train"], #train-btn, .exercise-btn'],
      ['gift',  '.gift-btn, [data-action="gift"], #gift-btn']
    ];
    for (const [kind, sel] of sels) {
      if (target.closest(sel)) return kind;
    }
    return null;
  }

  function onCareClick(e) {
    if (!routeEnabled()) return;
    const action = classifyClick(e.target);
    if (!action) return;
    if (Math.random() > PROBABILITY) return;
    if (inCooldown()) return;

    const char = currentChar();
    if (!char) return;

    setTimeout(() => {
      // Re-check after delay (scene might have started)
      if (sceneActive() || ambientBusy() || _showing) return;
      // First-care-session quiet window — defer ambient toasts until the
      // greeting + first-action hint have done their job.
      if (window.PPAmbient && window.PPAmbient.firstCareSession && window.PPAmbient.firstCareSession()) return;
      if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) return;
      // Don't talk over an active typewriter line.
      const g = window._game;
      if (g && g.typewriter && typeof g.typewriter.busy === 'function' && g.typewriter.busy()) return;
      const line = pickLine(char, action);
      if (line) show(line);
    }, FIRE_DELAY_MS);
  }

  function boot() {
    document.addEventListener('click', onCareClick, true);
    document.addEventListener('touchend', onCareClick, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // Debug
  window.PPCareThread = {
    force(action) {
      const char = currentChar();
      if (!char) { alert('No character currently selected.'); return; }
      const line = pickLine(char, action || 'talk');
      if (line) show(line);
    }
  };
})();
