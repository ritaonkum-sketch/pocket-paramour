/* main-story-toggle.js — makes the main-story route discoverable in-game.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Reads/writes only `pp_main_story_enabled` and
 *    `pp_main_story_first_boot_seen`.
 *  - No mutation of game state, no edits to other files.
 *
 * WHAT IT DOES:
 *  1. On the very first boot (no character saves, no prior toggle decision),
 *     auto-enables the main-story route so the player experiences it.
 *  2. Injects a toggle row into the existing #settings-content panel:
 *        "Main Story Route"  [ On / Off ]
 *     Toggling it flips `pp_main_story_enabled` and reloads so the
 *     orchestrator rehydrates cleanly.
 *  3. Shows a small one-time chip on the title screen offering the choice,
 *     only if the player has existing saves AND no toggle decision yet.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const DECISION_KEY = 'pp_main_story_decision';  // '1' = made a deliberate choice

  function on()     { try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (_) { return false; } }
  function setOn(v) { try { v ? localStorage.setItem(FLAG_KEY,'1') : localStorage.removeItem(FLAG_KEY); } catch (_) {} }
  function markDecided() { try { localStorage.setItem(DECISION_KEY,'1'); } catch (_) {} }
  function decided() { try { return localStorage.getItem(DECISION_KEY) === '1'; } catch (_) { return false; } }

  function hasAnySave() {
    try {
      const chars = ['alistair','elian','lyra','caspian','lucien','noir','proto'];
      for (const c of chars) if (localStorage.getItem('pocketLoveSave_' + c)) return true;
    } catch (_) {}
    return false;
  }

  // ---------------------------------------------------------------
  // 1) Auto-enable for first-ever boot
  function autoEnableIfFresh() {
    if (decided()) return;
    if (hasAnySave()) return;  // returning players go through the chip
    setOn(true);
    markDecided();
  }

  // ---------------------------------------------------------------
  // 2) Inject toggle into settings panel
  function injectSettingsToggle() {
    const panel = document.getElementById('settings-content');
    if (!panel) return;
    if (document.getElementById('mst-row')) return;

    const row = document.createElement('div');
    row.id = 'mst-row';
    row.style.cssText = [
      'margin:14px 0', 'padding:12px 14px', 'border-radius:14px',
      'background:rgba(255,255,255,0.04)',
      'display:flex', 'align-items:center', 'justify-content:space-between',
      'gap:12px', 'color:#f4e6ff', 'font-size:14px', 'line-height:1.3'
    ].join(';');

    const label = document.createElement('div');
    label.innerHTML = '<div style="font-weight:600;">\u2726 Main Story Route</div>'
                    + '<div style="font-size:11px;opacity:0.6;margin-top:2px;">Meet-cutes, daily purpose, endings, memory cards</div>';
    row.appendChild(label);

    const btn = document.createElement('button');
    btn.style.cssText = [
      'padding:8px 14px', 'border-radius:16px', 'border:0',
      'font-size:12px', 'font-weight:700', 'cursor:pointer', 'min-width:72px', 'font-family:inherit'
    ].join(';');

    const paint = () => {
      const isOn = on();
      btn.textContent = isOn ? 'On' : 'Off';
      btn.style.background = isOn
        ? 'linear-gradient(180deg,#f6a5c0,#e879a2)'
        : 'rgba(255,255,255,0.1)';
      btn.style.color = isOn ? '#22112a' : '#f4e6ff';
    };
    paint();

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setOn(!on());
      markDecided();
      paint();
      // Reload so orchestrator / gates / observers rehydrate from the new state
      setTimeout(() => location.reload(), 200);
    });
    row.appendChild(btn);

    // Insert near the top of settings-content so it's easy to find
    const first = panel.firstElementChild;
    if (first) panel.insertBefore(row, first); else panel.appendChild(row);
  }

  // Watch for the settings panel being created/opened — game.js builds it lazily.
  function watchSettings() {
    injectSettingsToggle();  // in case it's already there
    const mo = new MutationObserver(() => injectSettingsToggle());
    mo.observe(document.body, { childList: true, subtree: true });
  }

  // ---------------------------------------------------------------
  // 3) First-time chip for returning players (has saves, hasn't decided yet)
  function maybeShowFirstTimeChip() {
    if (decided()) return;
    if (!hasAnySave()) return;  // fresh players already auto-enabled

    const title = document.getElementById('title-screen');
    if (!title || title.classList.contains('hidden')) return;

    if (document.getElementById('mst-first-chip')) return;

    const chip = document.createElement('div');
    chip.id = 'mst-first-chip';
    chip.style.cssText = [
      'position:fixed', 'left:50%', 'bottom:5%', 'transform:translateX(-50%) translateY(10px)',
      'width:min(92%, 340px)', 'background:rgba(14,8,24,0.94)', 'color:#f4e6ff',
      'padding:14px 18px', 'border-radius:18px',
      'box-shadow:0 8px 30px rgba(0,0,0,0.55)', 'backdrop-filter:blur(6px)',
      'z-index:10050', 'opacity:0', 'transition:opacity 400ms ease, transform 400ms ease',
      'display:flex', 'flex-direction:column', 'gap:12px', 'align-items:stretch',
      'text-align:center', 'font-size:13px', 'line-height:1.4'
    ].join(';');

    const intro = document.createElement('div');
    intro.innerHTML = '<div style="font-weight:600;letter-spacing:1px;margin-bottom:2px;">\u2726 NEW \u2014 MAIN STORY ROUTE</div>'
                    + '<div style="opacity:0.75;font-style:italic;">Meet each character first. Daily purpose. Real endings.</div>';
    chip.appendChild(intro);

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:10px;justify-content:stretch;';
    const mk = (text, primary, onClick) => {
      const b = document.createElement('button');
      b.textContent = text;
      b.style.cssText = [
        'flex:1', 'padding:12px 16px', 'border-radius:16px', 'border:0',
        'font-size:14px', 'font-weight:700', 'cursor:pointer', 'white-space:nowrap', 'font-family:inherit',
        primary
          ? 'background:linear-gradient(180deg,#f6a5c0,#e879a2);color:#22112a;box-shadow:0 4px 10px rgba(232,121,162,0.35);'
          : 'background:rgba(255,255,255,0.08);color:#f4e6ff;'
      ].join(';');
      b.addEventListener('click', onClick);
      return b;
    };
    const accept = mk('Try Main Story', true, () => { setOn(true); markDecided(); location.reload(); });
    const decline = mk('Classic', false, () => { setOn(false); markDecided(); hideChip(); });
    row.appendChild(accept);
    row.appendChild(decline);
    chip.appendChild(row);

    document.body.appendChild(chip);
    requestAnimationFrame(() => {
      chip.style.opacity = '1';
      chip.style.transform = 'translateX(-50%) translateY(0)';
    });

    function hideChip() {
      chip.style.opacity = '0';
      chip.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => { try { chip.remove(); } catch (_) {} }, 420);
    }
  }

  // ---------------------------------------------------------------
  // Run auto-enable SYNCHRONOUSLY at script parse so main-story.js\u2019 boot
  // (which fires on DOMContentLoaded) sees the correct flag state.
  try { autoEnableIfFresh(); } catch (_) {}

  function boot() {
    try {
      watchSettings();
      // Defer chip a moment so the title-screen fade-in settles
      setTimeout(maybeShowFirstTimeChip, 1200);
    } catch (e) {
      console.warn('[main-story-toggle] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.MainStoryToggle = {
    on, setOn,
    _debug_resetDecision: () => { try { localStorage.removeItem(DECISION_KEY); } catch (_) {} }
  };
})();
