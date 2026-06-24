// ============================================================================
// LETTER ARRIVAL (Aug 2026) — the "✦ A letter has arrived" moment.
// ----------------------------------------------------------------------------
// When a NEW letter is delivered, instead of slamming the parchment reader open
// we first show a soft, luxurious announcement: a line of script + a wax-sealed
// envelope that floats up and gently bobs. After ~2s (or a tap) it hands off to
// the reader, which opens the letter. Archive re-reads skip this (they have
// their own envelope-open). Pure code, no art.
//
// Exposes window.PPLetterArrival.announce(charId, onDone). letter.js present()
// calls it for fresh first/milestone deliveries.
// ============================================================================
(function () {
  'use strict';

  function sfx(name) { try { if (typeof sounds !== 'undefined' && sounds && typeof sounds[name] === 'function') sounds[name](); } catch (_) {} }

  function inject() {
    if (document.getElementById('pp-arrival-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-arrival-styles';
    s.textContent = `
      #pp-letter-arrival {
        position: fixed; inset: 0; z-index: 9600;
        background: radial-gradient(ellipse at center, rgba(20,8,26,0.82), rgba(0,0,0,0.93));
        display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 360ms ease; cursor: pointer;
      }
      #pp-letter-arrival.show { opacity: 1; }
      #pp-letter-arrival.leaving { opacity: 0; }
      #pp-letter-arrival .pa-inner { display: flex; flex-direction: column; align-items: center; gap: 22px; }
      #pp-letter-arrival .pa-label {
        font-family: 'Cormorant Garamond','EB Garamond',serif; font-style: italic; font-size: 21px;
        letter-spacing: 0.08em; color: rgba(244,228,190,0.96); text-shadow: 0 2px 10px rgba(0,0,0,0.6);
        transform: translateY(10px); opacity: 0; transition: transform 600ms ease, opacity 600ms ease;
      }
      #pp-letter-arrival.show .pa-label { transform: translateY(0); opacity: 1; }
      #pp-letter-arrival .pa-env {
        position: relative; width: 134px; height: 94px; perspective: 700px;
        transform: translateY(36px) scale(0.9); opacity: 0;
        transition: transform 720ms cubic-bezier(0.16,1,0.3,1), opacity 520ms ease;
        filter: drop-shadow(0 16px 30px rgba(0,0,0,0.55));
      }
      #pp-letter-arrival.show .pa-env { transform: translateY(0) scale(1); opacity: 1; animation: pa-bob 3.4s ease-in-out 0.7s infinite; }
      @keyframes pa-bob { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-6px) scale(1); } }
      #pp-letter-arrival .pa-card { position: absolute; inset: 0; border-radius: 6px; background: linear-gradient(180deg,#f7ecd1,#e3cfa2); box-shadow: inset 0 0 28px rgba(120,70,20,0.16); }
      #pp-letter-arrival .pa-flap { position: absolute; left: 0; right: 0; top: 0; height: 49px; background: linear-gradient(180deg,#efe0bd,#ddc69b); clip-path: polygon(0 0,100% 0,50% 100%); border-bottom: 1px solid rgba(120,70,20,0.18); }
      #pp-letter-arrival .pa-seal {
        position: absolute; left: 50%; top: 47px; transform: translate(-50%,-50%); width: 30px; height: 30px; border-radius: 50%;
        background: radial-gradient(circle at 38% 32%, #d4504a, #7a1818); box-shadow: 0 3px 8px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.35);
        display: flex; align-items: center; justify-content: center; color: #f7ecd1;
        font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 14px; line-height: 1;
      }
      #pp-letter-arrival .pa-hint {
        font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 12px;
        color: rgba(232,200,220,0.55); opacity: 0; transition: opacity 500ms ease 0.7s;
      }
      #pp-letter-arrival.show .pa-hint { opacity: 0.6; animation: pa-hint 2.2s ease-in-out 1.2s infinite; }
      @keyframes pa-hint { 0%,100% { opacity: 0.35; } 50% { opacity: 0.7; } }
    `;
    document.head.appendChild(s);
  }

  function announce(charId, onDone) {
    inject();
    const initial = String(charId || '?').charAt(0).toUpperCase() || '✦';
    const old = document.getElementById('pp-letter-arrival');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    const ov = document.createElement('div');
    ov.id = 'pp-letter-arrival';
    ov.innerHTML =
      '<div class="pa-inner">' +
        '<div class="pa-label">✦ A letter has arrived.</div>' +
        '<div class="pa-env"><div class="pa-card"></div><div class="pa-flap"></div><div class="pa-seal">' + initial + '</div></div>' +
        '<div class="pa-hint">tap to open</div>' +
      '</div>';
    document.body.appendChild(ov);

    let done = false;
    const handoffToReader = () => {
      if (done) return; done = true;
      sfx('swoosh');
      try { onDone && onDone(); } catch (_) {}     // hand off to the reader (crossfade)
      ov.classList.add('leaving');
      setTimeout(() => { if (ov && ov.parentNode) ov.parentNode.removeChild(ov); }, 400);
    };

    sfx('chime');
    requestAnimationFrame(() => ov.classList.add('show'));
    ov.addEventListener('click', handoffToReader);
    setTimeout(handoffToReader, 2000); // auto-open if the player just watches

    // Safety: if rAF never fires (e.g. a backgrounded tab froze the reveal),
    // still hand off so the letter is never lost.
    setTimeout(() => { if (!done) handoffToReader(); }, 2600);
  }

  window.PPLetterArrival = { announce: announce };
})();
