/* letters-archive.js — the small 📜 letter button + the letter archive overlay
 * ============================================================================
 *   Adds a small floating button positioned just under the hamburger menu in
 *   the top-right corner. The button:
 *     - Appears only after the player has met at least one character.
 *     - Pulses softly when there is an unread letter OR a letter waiting
 *       for a reply (LetterSystem.hasAttention()).
 *     - On tap, opens the archive overlay listing every letter the player
 *       has received on this device.
 *
 *   The overlay groups letters by character, shows status (read / replied /
 *   response), and lets the player re-read any stored letter via
 *   LetterSystem.showStored().
 *
 *   SAFETY CONTRACT:
 *     Read-only on game state. Never blocks gameplay. Hidden until first
 *     letter is seen. Fully optional UI surface.
 * ============================================================================
 */

(function () {
  'use strict';

  const CHAR_NAME = {
    alistair: 'Alistair', caspian: 'Caspian', elian: 'Elian',
    lyra: 'Lyra', lucien: 'Lucien', noir: 'Noir', proto: 'Proto'
  };
  const CHAR_PORTRAIT = {
    alistair: 'assets/alistair/select-portrait.png',
    caspian:  'assets/caspian/select-portrait.png',
    elian:    'assets/elian/select-portrait.png',
    lyra:     'assets/lyra/select-portrait.png',
    lucien:   'assets/lucien/select-portrait.png',
    noir:     'assets/noir/select-portrait.png',
    proto:    'assets/proto/select-portrait.png'
  };

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('pp-letters-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-letters-styles';
    s.textContent = `
      /* Floating button — sits just under the hamburger (#topbar-menu-btn).
         Top offset accounts for the topbar height (~46px). */
      #pp-letters-btn {
        position: fixed;
        top: 56px; right: 12px;
        width: 32px; height: 32px;
        border-radius: 10px;
        background: linear-gradient(180deg, #3a2a1a 0%, #261810 100%);
        border: 1px solid rgba(220,180,120,0.45);
        color: #f0d8a0;
        font-size: 16px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; z-index: 8500;
        box-shadow: 0 4px 10px rgba(0,0,0,0.45),
                    0 0 0 0 rgba(240,200,140,0);
        transition: transform 0.18s ease, box-shadow 0.5s ease;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      #pp-letters-btn:active { transform: scale(0.96); }
      /* Pulse animation when there's something needing attention. */
      #pp-letters-btn.pp-letters-pulse {
        animation: pp-letters-pulse 1.8s ease-in-out infinite;
      }
      @keyframes pp-letters-pulse {
        0%, 100% { box-shadow: 0 4px 10px rgba(0,0,0,0.45),
                                0 0 0 0 rgba(240,200,140,0.45); }
        50%      { box-shadow: 0 4px 14px rgba(0,0,0,0.55),
                                0 0 0 6px rgba(240,200,140,0.0); }
      }
      /* Small badge in the corner showing unread/unreplied count. */
      #pp-letters-btn .pp-letters-dot {
        position: absolute; top: -3px; right: -3px;
        background: #e94f7c; color: #fff;
        font-size: 9px; font-weight: 700;
        min-width: 14px; height: 14px; padding: 0 4px;
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 1px 4px rgba(0,0,0,0.45);
      }
      #pp-letters-btn .pp-letters-dot.hidden { display: none; }

      /* Archive overlay */
      #pp-letters-overlay {
        position: fixed; inset: 0; z-index: 9500;
        background: rgba(20,12,4,0.80);
        backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
        display: flex; align-items: flex-end; justify-content: center;
        opacity: 0; pointer-events: none;
        transition: opacity 280ms ease;
      }
      #pp-letters-overlay.show { opacity: 1; pointer-events: auto; }
      #pp-letters-panel {
        width: 100%; max-width: 460px; height: 86vh;
        background: linear-gradient(180deg, #3a2818 0%, #1a1108 100%);
        border-top-left-radius: 22px; border-top-right-radius: 22px;
        border: 1px solid rgba(220,180,120,0.30);
        box-shadow: 0 -10px 40px rgba(0,0,0,0.65);
        display: flex; flex-direction: column; overflow: hidden;
        color: #f0d8a0;
        transform: translateY(20px);
        transition: transform 320ms ease;
      }
      #pp-letters-overlay.show #pp-letters-panel { transform: translateY(0); }

      .pp-letters-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 18px;
        border-bottom: 1px solid rgba(220,180,120,0.20);
      }
      .pp-letters-header .title {
        font-size: 14px; font-weight: 700; letter-spacing: 1.5px;
        color: #f7e6c0;
      }
      .pp-letters-header .close {
        cursor: pointer; padding: 4px 12px; opacity: 0.85;
        font-size: 18px;
      }

      .pp-letters-body {
        flex: 1; overflow-y: auto;
        padding: 8px 12px 30px;
      }
      .pp-letters-empty {
        text-align: center; padding: 80px 24px;
        color: rgba(240,216,160,0.55);
        font-style: italic; font-size: 13px;
        line-height: 1.6;
      }
      .pp-letters-row {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 10px;
        border-bottom: 1px solid rgba(220,180,120,0.10);
        cursor: pointer;
        border-radius: 10px;
        transition: background 0.15s ease;
      }
      .pp-letters-row:hover { background: rgba(220,180,120,0.07); }
      .pp-letters-row .avatar {
        width: 44px; height: 44px; border-radius: 50%;
        flex-shrink: 0;
        background: rgba(20,12,4,0.6);
        overflow: hidden;
        border: 1px solid rgba(220,180,120,0.30);
      }
      .pp-letters-row .avatar img {
        width: 100%; height: 100%; object-fit: cover;
        display: block;
      }
      .pp-letters-row .meta { flex: 1; min-width: 0; }
      .pp-letters-row .meta .name {
        font-size: 11.5px; letter-spacing: 1.2px;
        color: rgba(240,216,160,0.65); margin-bottom: 2px;
      }
      .pp-letters-row .meta .title {
        font-size: 14px; font-weight: 600; color: #f7e6c0;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .pp-letters-row .meta .preview {
        font-size: 11.5px; color: rgba(240,216,160,0.55);
        margin-top: 3px; font-style: italic;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .pp-letters-row .badge {
        font-size: 10.5px; font-weight: 600;
        padding: 4px 10px; border-radius: 10px;
        flex-shrink: 0;
      }
      .pp-letters-row .badge.unread {
        background: #e94f7c; color: #fff;
      }
      .pp-letters-row .badge.read {
        background: rgba(220,180,120,0.18); color: rgba(240,216,160,0.7);
      }
      .pp-letters-row .badge.replied {
        background: rgba(160,200,140,0.22); color: #cfe8b8;
      }
      .pp-letters-row .badge.response {
        background: rgba(200,160,240,0.22); color: #e2cdf7;
      }
    `;
    document.head.appendChild(s);
  }

  // ---------------------------------------------------------------------------
  // Floating button
  // ---------------------------------------------------------------------------
  let _btn = null;

  function ensureButton() {
    if (_btn) return _btn;
    injectStyles();
    _btn = document.createElement('div');
    _btn.id = 'pp-letters-btn';
    _btn.title = 'Letters';
    _btn.innerHTML = '\u{1F4DC}<span class="pp-letters-dot hidden">!</span>';
    _btn.addEventListener('click', openArchive);
    document.body.appendChild(_btn);
    return _btn;
  }

  function anyLetterSeen() {
    const chars = ['alistair','caspian','elian','lyra','lucien','noir','proto'];
    for (const c of chars) {
      if (lsGet('pp_letter_seen_' + c)) return true;
      if (lsGet('pp_letter_response_seen_' + c)) return true;
    }
    return false;
  }

  // Visibility rule: ONLY show the button while the player is actually in
  // the care-loop game screen, with no full-screen overlay/scene blocking
  // the view. Hides during title, world intro, bridges, chapter cards,
  // letter overlay itself, settings, loading, etc.
  function isGameVisibleAndIdle() {
    // 1. game-container must be visible
    const game = document.getElementById('game-container');
    if (!game) return false;
    // .hidden class OR display:none means hidden
    if (game.classList.contains('hidden')) return false;
    if (game.offsetParent === null) {
      const cs = window.getComputedStyle ? window.getComputedStyle(game) : null;
      if (!cs || cs.display === 'none' || cs.visibility === 'hidden') return false;
    }

    // 2. No blocking overlay or cinematic scene present
    const blockers = [
      '#title-screen:not(.hidden)',
      '#world-intro:not(.hidden)',
      '#loading-screen:not(.hidden)',
      '#select-screen:not(.hidden)',
      '#mscard-root',                              // bridges + chapter cards
      '#ms-encounter-root',                        // legacy meet-cutes
      '#chp-page',                                 // chapter list page
      '#tp-root',                                  // turning points
      '#mg-overlay',                               // memory gallery
      '#mon-bundle-back',                          // monetization
      '#settings-overlay:not(.hidden)',
      '#letter-overlay:not(.hidden)',              // don't show over a letter
      '#pp-letters-overlay',                       // archive overlay itself
      '#cinematic-overlay.visible',
      '#event-overlay:not(.hidden)',
      '#gift-panel:not(.hidden)',
      '#training-panel:not(.hidden)',
      '#dress-panel:not(.hidden)',
      '#story-overlay:not(.hidden)',
      '#main-story-page:not(.hidden)',
      '#pp-onboarding-overlay',
      '#pp-skip-overlay',
      '#mst-confirm-overlay',
      '.pp-bridge-root',                           // legacy bridge UI (if any)
      '#chp-page'
    ].join(',');
    if (document.querySelector(blockers)) return false;

    return true;
  }

  // Button is shown only on the game screen with no overlay blocking.
  // - Hidden everywhere else (title, intro, bridges, chapters, letters, etc.)
  // - Dimmed when there are no letters yet (still discoverable)
  // - Bright + pulse + dot when there's an unread letter or reply owed
  function refresh() {
    ensureButton();
    if (!isGameVisibleAndIdle()) {
      _btn.style.display = 'none';
      return;
    }
    _btn.style.display = 'flex';
    const dot = _btn.querySelector('.pp-letters-dot');
    const attention = window.LetterSystem && window.LetterSystem.hasAttention && window.LetterSystem.hasAttention();
    const hasAny = anyLetterSeen();

    if (attention) {
      dot.classList.remove('hidden');
      _btn.classList.add('pp-letters-pulse');
      _btn.style.opacity = '1';
    } else {
      dot.classList.add('hidden');
      _btn.classList.remove('pp-letters-pulse');
      _btn.style.opacity = hasAny ? '1' : '0.55';
    }
  }

  // ---------------------------------------------------------------------------
  // Archive overlay
  // ---------------------------------------------------------------------------
  let _overlay = null;
  function buildOverlay() {
    if (_overlay) return _overlay;
    injectStyles();
    _overlay = document.createElement('div');
    _overlay.id = 'pp-letters-overlay';
    _overlay.innerHTML = '' +
      '<div id="pp-letters-panel">' +
        '<div class="pp-letters-header">' +
          '<span style="width:28px;"></span>' +
          '<span class="title">\u{1F4DC} LETTERS</span>' +
          '<span class="close" data-act="close">✕</span>' +
        '</div>' +
        '<div class="pp-letters-body"></div>' +
      '</div>';
    _overlay.addEventListener('click', (e) => {
      if (e.target === _overlay) closeArchive();
      const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
      if (act === 'close') closeArchive();
    });
    document.body.appendChild(_overlay);
    return _overlay;
  }

  function openArchive() {
    buildOverlay();
    renderList();
    _overlay.classList.add('show');
  }
  function closeArchive() {
    if (!_overlay) return;
    _overlay.classList.remove('show');
    refresh();
  }

  function renderList() {
    const body = _overlay.querySelector('.pp-letters-body');
    const items = (window.LetterSystem && window.LetterSystem.list) ? window.LetterSystem.list() : [];
    if (!items.length) {
      body.innerHTML =
        '<div class="pp-letters-empty">' +
          'No letters yet.<br>' +
          'Care for someone long enough, and they will write.' +
        '</div>';
      return;
    }
    body.innerHTML = '';
    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'pp-letters-row';
      const portrait = CHAR_PORTRAIT[item.char] || '';
      const name = (CHAR_NAME[item.char] || item.char).toUpperCase();
      let badgeClass = 'read';
      let badgeText  = 'READ';
      if (item.kind === 'first') {
        if (!item.replied) { badgeClass = 'unread'; badgeText = 'REPLY →'; }
        else               { badgeClass = 'replied'; badgeText = '↩ REPLIED'; }
      } else if (item.kind === 'response') {
        badgeClass = 'response'; badgeText = '← REPLY';
      }
      const preview = item.kind === 'response'
        ? 'Their reply to your letter.'
        : (item.replied ? 'You wrote: ' + escapeHTML(item.reply.text) : 'Tap to read — then reply.');
      row.innerHTML =
        '<div class="avatar">' + (portrait ? '<img src="' + portrait + '" alt="">' : '') + '</div>' +
        '<div class="meta">' +
          '<div class="name">' + name + '</div>' +
          '<div class="title">' + escapeHTML(item.title) + '</div>' +
          '<div class="preview">' + preview + '</div>' +
        '</div>' +
        '<div class="badge ' + badgeClass + '">' + badgeText + '</div>';
      row.addEventListener('click', () => {
        // Re-open the letter via LetterSystem.showStored.
        try { window.LetterSystem.showStored(item.char, item.kind); } catch (_) {}
        closeArchive();
      });
      body.appendChild(row);
    });
  }

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------------------------------------------------------------------------
  // Boot — gentle polling only. The previous MutationObserver watched the
  // entire body subtree for every class/style change, which fired hundreds
  // of times per second during MSCard scenes (typewriter chars, particles,
  // pose swaps, etc.) and froze the game. A 900ms poll is plenty
  // responsive for show/hide transitions while costing almost nothing.
  // ---------------------------------------------------------------------------
  let _refreshScheduled = false;
  function refreshDebounced() {
    if (_refreshScheduled) return;
    _refreshScheduled = true;
    setTimeout(() => { _refreshScheduled = false; refresh(); }, 80);
  }

  function boot() {
    refresh();
    setInterval(refresh, 900);
    // Light listeners: refresh when the player taps anywhere (cheap, gives
    // us a near-immediate response when they navigate via taps), and when
    // the page becomes visible.
    document.addEventListener('click', refreshDebounced, true);
    document.addEventListener('visibilitychange', refreshDebounced);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  window.PPLettersArchive = {
    open: openArchive,
    close: closeArchive,
    refresh: refresh
  };
})();
