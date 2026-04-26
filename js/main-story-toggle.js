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
  // Confirmation dialog before toggling — explains what changes.
  function injectConfirmStyles() {
    if (document.getElementById('mst-confirm-styles')) return;
    const s = document.createElement('style');
    s.id = 'mst-confirm-styles';
    s.textContent = `
      #mst-confirm-overlay {
        position:fixed; inset:0; z-index:11500;
        background:rgba(8,5,18,0.84);
        backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
        display:flex; align-items:center; justify-content:center;
        opacity:0; pointer-events:none;
        transition:opacity 280ms ease;
        padding:18px;
      }
      #mst-confirm-overlay.show { opacity:1; pointer-events:auto; }
      #mst-confirm-card {
        width:100%; max-width:420px;
        background:linear-gradient(180deg, #1c1235 0%, #0e0820 100%);
        border:1px solid rgba(200,170,240,0.40);
        border-radius:18px;
        padding:22px 22px 18px;
        color:#ece2f6; text-align:left;
        box-shadow:0 18px 44px rgba(0,0,0,0.65), 0 0 26px rgba(180,140,220,0.22) inset;
        transform:scale(0.94);
        transition:transform 280ms cubic-bezier(.2,.8,.2,1);
      }
      #mst-confirm-overlay.show #mst-confirm-card { transform:scale(1); }
      #mst-confirm-card h3 {
        margin:0 0 12px; font-size:16px; letter-spacing:0.5px;
        color:#ffd8ec; text-align:center; font-weight:700;
      }
      #mst-confirm-card .body {
        font-size:13px; line-height:1.55; color:#d8cfe6;
        margin-bottom:16px;
      }
      #mst-confirm-card .body p { margin:0 0 8px; }
      #mst-confirm-card .body .heads-up {
        background:rgba(255,200,150,0.08);
        border:1px solid rgba(255,200,150,0.25);
        border-radius:10px; padding:10px 12px;
        font-size:12px; line-height:1.5;
        color:#ffe0b8; font-style:italic; margin-top:10px;
      }
      #mst-confirm-card .btns {
        display:flex; gap:10px; justify-content:center; margin-top:6px;
      }
      #mst-confirm-card .btns button {
        flex:1; padding:11px 14px; border-radius:12px;
        font-size:13.5px; font-weight:600; cursor:pointer;
        border:1px solid rgba(255,255,255,0.18);
        font-family:inherit;
      }
      #mst-confirm-card .btns .cancel {
        background:rgba(40,28,68,0.78); color:#d8c8f5;
      }
      #mst-confirm-card .btns .confirm {
        background:linear-gradient(180deg,#f6a5c0,#e879a2);
        color:#22112a;
      }
      #mst-confirm-card .btns button:active { transform:translateY(1px); }
    `;
    document.head.appendChild(s);
  }

  function showConfirmDialog(turningOn, onConfirm) {
    injectConfirmStyles();
    const existing = document.getElementById('mst-confirm-overlay');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    const overlay = document.createElement('div');
    overlay.id = 'mst-confirm-overlay';

    const title = turningOn ? '✨ Turn ON Main Story Route?' : 'Turn OFF Main Story Route?';
    const body = turningOn
      ? '<p>This unlocks the full Aethermoor experience on top of the Tamagotchi care loop:</p>' +
        '<p>• Threaded prologue chain (arrival → 7 character bridges)<br>' +
        '• Main story chapters with cinematic dialogue cards<br>' +
        '• Meet-cutes for each character<br>' +
        '• Aenor villain arc, turning points, multi-character crossovers<br>' +
        '• Endings, memory cards, the Weaver’s Court</p>' +
        '<div class="heads-up">If you have already played the prologue chain on this device, it will <b>not</b> replay. New scenes will trigger naturally as you play.</div>'
      : '<p>Turning this off will:</p>' +
        '<p>• Hide all chapter cards and bridge scenes<br>' +
        '• Disable the prologue chain and locked-character grid<br>' +
        '• Suppress Aenor presence, multi-romance bubbles, and care-Weaver thread lines<br>' +
        '• Stop new letter triggers</p>' +
        '<p>You will keep the pure Tamagotchi care loop — feed, clean, talk, train, gift — with no narrative interruptions.</p>' +
        '<div class="heads-up">Your progress is <b>not lost</b>. You can turn it back on any time and pick up where you left off.</div>';

    const confirmLabel = turningOn ? 'Turn On' : 'Turn Off';

    overlay.innerHTML = '' +
      '<div id="mst-confirm-card">' +
        '<h3>' + title + '</h3>' +
        '<div class="body">' + body + '</div>' +
        '<div class="btns">' +
          '<button class="cancel" data-act="cancel">Cancel</button>' +
          '<button class="confirm" data-act="confirm">' + confirmLabel + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    // eslint-disable-next-line no-unused-expressions
    overlay.offsetHeight;
    overlay.classList.add('show');

    function close() {
      overlay.classList.remove('show');
      setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 320);
    }
    overlay.addEventListener('click', (e) => {
      const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
      if (act === 'cancel') { close(); }
      else if (act === 'confirm') { close(); try { onConfirm && onConfirm(); } catch (_) {} }
      else if (e.target === overlay) { close(); }
    });
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
      const turningOn = !on();
      showConfirmDialog(turningOn, () => {
        setOn(turningOn);
        markDecided();
        paint();
        // Reload so orchestrator / gates / observers rehydrate from the new state
        setTimeout(() => location.reload(), 200);
      });
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
