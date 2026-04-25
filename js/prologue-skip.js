/* prologue-skip.js — replay-friendly "skip prologue?" prompt
 * ============================================================================
 *   On a fresh save, the chain is mandatory — that's what gives the world
 *   its first-time emotional weight. On REPLAY saves the player should not
 *   be punished. This module:
 *
 *     1. Detects "this is a returning player" by checking whether
 *        pp_arrival_played has ever been true on this device.
 *     2. On a save where the chain is at step 0 but pp_arrival_played was
 *        previously set (i.e. they reset / opened a new save), it surfaces
 *        a one-time "Skip prologue?" overlay.
 *     3. If they choose Skip, sets pp_chain_skipped = '1' and unlocks the
 *        full character grid. Marks pp_chain_step = 7.
 *     4. If they choose No, the chain plays normally.
 *
 *   Also exposes window.PPChainSkip.show() so the dev panel can offer the
 *   prompt at any time (useful for testers).
 *
 * SAFETY CONTRACT:
 *   Additive. Does not fire if pp_main_story_enabled is off (no chain to
 *   skip yet). Idempotent — pp_chain_skip_prompt_seen flag prevents repeats.
 * ============================================================================
 */

(function () {
  'use strict';

  const FLAG_ARRIVED_EVER = 'pp_arrival_played';
  const FLAG_PROMPT_SEEN  = 'pp_chain_skip_prompt_seen';

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  function shouldOffer() {
    if (lsGet(FLAG_PROMPT_SEEN) === '1') return false;
    if (lsGet('pp_main_story_enabled') !== '1') return false;
    if (lsGet('pp_chain_skipped') === '1') return false;
    if (lsGet('pp_chain_complete') === '1') return false;
    const stepN = parseInt(lsGet('pp_chain_step') || '0', 10) || 0;
    if (stepN > 0) return false;            // already mid-chain — don't interrupt
    // Returning-player heuristic: arrival played in past OR any character
    // already met (suggests a previous save existed on this device).
    const everArrived = lsGet(FLAG_ARRIVED_EVER) === '1';
    const anyMet = ['alistair','elian','lyra','caspian','lucien','noir','proto']
      .some(c => lsGet('pp_met_' + c) === '1' || (parseInt(lsGet('pp_affection_' + c) || '0', 10) || 0) > 0);
    return everArrived || anyMet;
  }

  function injectStyles() {
    if (document.getElementById('pp-skip-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-skip-styles';
    s.textContent = `
      #pp-skip-overlay {
        position:fixed; inset:0; z-index:10500;
        background:rgba(8,5,18,0.86);
        backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
        display:flex; align-items:center; justify-content:center;
        opacity:0; transition:opacity 320ms ease;
      }
      #pp-skip-overlay.show { opacity:1; }
      #pp-skip-card {
        width:88%; max-width:440px;
        background:linear-gradient(180deg, #1a1230 0%, #0d081e 100%);
        border:1px solid rgba(190,150,235,0.36);
        border-radius:18px;
        padding:26px 24px;
        color:#ece2f6; text-align:center;
        box-shadow:0 18px 44px rgba(0,0,0,0.65), 0 0 26px rgba(180,140,220,0.20) inset;
      }
      #pp-skip-card h3 {
        margin:0 0 12px; font-size:18px; letter-spacing:0.6px;
        color:#ffd8ec;
      }
      #pp-skip-card p {
        margin:0 0 18px; font-size:13.5px; line-height:1.5;
        color:#c8b9e0; font-style:italic;
      }
      #pp-skip-card .pp-skip-btns {
        display:flex; gap:10px; justify-content:center;
      }
      #pp-skip-card button {
        padding:11px 18px; border-radius:12px;
        font-size:14px; font-weight:600; cursor:pointer;
        border:1px solid rgba(255,255,255,0.18);
        font-family:inherit;
      }
      #pp-skip-card .pp-skip-no {
        background:linear-gradient(180deg, #6a4ec0, #4d3796);
        color:#fff;
      }
      #pp-skip-card .pp-skip-yes {
        background:rgba(40,28,68,0.78); color:#d8c8f5;
      }
      #pp-skip-card button:hover { transform:translateY(-1px); }
    `;
    document.head.appendChild(s);
  }

  let _root = null;

  function show() {
    if (_root) return;
    injectStyles();
    _root = document.createElement('div');
    _root.id = 'pp-skip-overlay';
    _root.innerHTML = `
      <div id="pp-skip-card">
        <h3>\u2728 Welcome back.</h3>
        <p>You have walked this kingdom before. Would you like to play the threaded prologue again, or skip straight to the seven faces you already know?</p>
        <div class="pp-skip-btns">
          <button class="pp-skip-no" data-act="no">Play the prologue</button>
          <button class="pp-skip-yes" data-act="yes">Skip to the grid</button>
        </div>
      </div>
    `;
    document.body.appendChild(_root);
    // eslint-disable-next-line no-unused-expressions
    _root.offsetHeight;
    _root.classList.add('show');
    _root.addEventListener('click', (e) => {
      const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
      if (act === 'yes') choose(true);
      else if (act === 'no') choose(false);
    });
  }

  function choose(skip) {
    lsSet(FLAG_PROMPT_SEEN, '1');
    if (skip) {
      lsSet('pp_chain_skipped', '1');
      lsSet('pp_chain_step', '7');
      lsSet('pp_chain_complete', '1');
      // Mark every character as met so downstream systems light up
      ['alistair','elian','lyra','caspian','lucien','noir','proto'].forEach(c => {
        lsSet('pp_met_' + c, '1');
      });
      if (window.PPChain && typeof window.PPChain.refreshGrid === 'function') {
        window.PPChain.refreshGrid();
      }
    }
    close();
  }

  function close() {
    if (!_root) return;
    _root.classList.remove('show');
    setTimeout(() => {
      if (_root && _root.parentNode) _root.parentNode.removeChild(_root);
      _root = null;
    }, 360);
  }

  function maybeOffer() {
    if (!shouldOffer()) return;
    show();
  }

  function boot() {
    setTimeout(maybeOffer, 1800);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.PPChainSkip = {
    show, close,
    reset() {
      try { localStorage.removeItem(FLAG_PROMPT_SEEN); } catch (_) {}
    }
  };
})();
