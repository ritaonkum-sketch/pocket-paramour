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
      /* Letters button — lives inside the topbar collapsible group.
         The .topbar-collapsible class drives the show/hide animation
         from the central topbar collapse system (ui-feel.js). Size
         matches the other 30px buttons. Owner asked May 2026 to drop
         the brown box background — icon-only now, like the trophy /
         gallery / settings buttons next to it. */
      #pp-letters-btn {
        position: relative;
        background: transparent;
        border: 0;
        padding: 0;
        color: inherit;
        font-size: 16px;
        cursor: pointer;
        transition: transform 0.18s ease;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      #pp-letters-btn:active { transform: scale(0.92); }
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
      /* Small badge in the corner showing unread/unreplied count.
         Jun 2026 brand pass — was hot-pink #e94f7c; now wine-velvet
         with a rose-gold hairline + soft gold halo. */
      #pp-letters-btn .pp-letters-dot {
        position: absolute; top: -3px; right: -3px;
        background: linear-gradient(180deg, #6E1733 0%, #4C0E22 100%);
        border: 1px solid rgba(232,200,138,0.55);
        color: rgba(244,235,220,0.97);
        font-family: 'Quicksand', 'Inter', sans-serif;
        font-size: 9px; font-weight: 700;
        min-width: 14px; height: 14px; padding: 0 4px;
        border-radius: 999px;
        display: flex; align-items: center; justify-content: center;
        box-shadow:
          0 1px 4px rgba(0,0,0,0.55),
          0 0 8px rgba(232,168,91,0.30);
      }
      #pp-letters-btn .pp-letters-dot.hidden { display: none; }

      /* Archive overlay — Jun 2026 brand pass.
         Was a brown-gold "leather/parchment" palette that clashed with
         the wine-velvet brand world. Now wine-velvet panel with
         rose-gold hairlines, Cormorant italic title, and brand-tinted
         badges (unread → brand magenta, replied → moss, response → lilac,
         milestone → rose-gold). */
      #pp-letters-overlay {
        position: fixed; inset: 0; z-index: 9500;
        background:
          radial-gradient(ellipse at 50% 100%, rgba(122,18,36,0.25) 0%, rgba(0,0,0,0) 60%),
          rgba(11, 4, 16, 0.82);
        backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        display: flex; align-items: flex-end; justify-content: center;
        opacity: 0; pointer-events: none;
        transition: opacity 280ms ease;
      }
      #pp-letters-overlay.show { opacity: 1; pointer-events: auto; }
      #pp-letters-panel {
        width: 100%; max-width: 460px; height: 86vh;
        background:
          radial-gradient(ellipse at 50% 0%, rgba(122,18,36,0.20) 0%, rgba(0,0,0,0) 55%),
          linear-gradient(180deg, rgba(43,17,51,0.98) 0%, rgba(21,8,26,0.99) 100%);
        border-top-left-radius: 22px; border-top-right-radius: 22px;
        border: 1px solid rgba(232,200,138,0.40);
        border-bottom: none;
        box-shadow:
          0 -10px 40px rgba(0,0,0,0.65),
          0 0 28px rgba(232,168,91,0.12);
        display: flex; flex-direction: column; overflow: hidden;
        color: rgba(244,235,220,0.96);
        transform: translateY(20px);
        transition: transform 320ms ease;
      }
      #pp-letters-overlay.show #pp-letters-panel { transform: translateY(0); }

      .pp-letters-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 18px 18px;
        border-bottom: 1px solid rgba(232,200,138,0.22);
      }
      .pp-letters-header .title {
        font-family: 'Cormorant Garamond', 'EB Garamond', serif;
        font-style: italic; font-weight: 500;
        font-size: 22px; letter-spacing: 0.04em;
        color: rgba(244,235,220,0.96);
        text-shadow: 0 1px 5px rgba(0,0,0,0.55);
        text-transform: none;
      }
      .pp-letters-header .close {
        cursor: pointer; padding: 0;
        width: 30px; height: 30px;
        display: inline-flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.45);
        border: 1px solid rgba(232,200,138,0.32);
        border-radius: 50%;
        font-family: 'Cormorant Garamond', 'EB Garamond', serif;
        font-size: 18px; line-height: 1;
        color: rgba(244,235,220,0.85); opacity: 1;
      }
      .pp-letters-header .close:hover { color: #FFF6FA; border-color: rgba(232,200,138,0.65); }

      .pp-letters-body {
        flex: 1; overflow-y: auto;
        padding: 8px 12px 30px;
      }
      .pp-letters-empty {
        text-align: center; padding: 80px 24px;
        color: rgba(232,200,220,0.62);
        font-family: 'Cormorant Garamond', 'EB Garamond', serif;
        font-style: italic; font-size: 15px;
        line-height: 1.6;
      }
      .pp-letters-row {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 10px;
        border-bottom: 1px solid rgba(232,200,138,0.10);
        cursor: pointer;
        border-radius: 10px;
        transition: background 0.15s ease;
      }
      .pp-letters-row:hover { background: rgba(232,200,138,0.07); }
      .pp-letters-row .avatar {
        width: 44px; height: 44px; border-radius: 50%;
        flex-shrink: 0;
        background: rgba(11,4,16,0.6);
        overflow: hidden;
        border: 1px solid rgba(232,200,138,0.35);
      }
      .pp-letters-row .avatar img {
        width: 100%; height: 100%; object-fit: cover;
        display: block;
      }
      .pp-letters-row .meta { flex: 1; min-width: 0; }
      .pp-letters-row .meta .name {
        font-family: 'Quicksand', 'Inter', sans-serif;
        font-size: 10px; font-weight: 600;
        letter-spacing: 1.5px; text-transform: uppercase;
        color: rgba(232,200,138,0.72); margin-bottom: 3px;
      }
      .pp-letters-row .meta .title {
        font-family: 'Cormorant Garamond', 'EB Garamond', serif;
        font-style: italic; font-weight: 500;
        font-size: 16px; color: rgba(244,235,220,0.96);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        text-shadow: 0 1px 3px rgba(0,0,0,0.55);
      }
      .pp-letters-row .meta .preview {
        font-family: 'Cormorant Garamond', 'EB Garamond', serif;
        font-style: italic; font-size: 12.5px;
        color: rgba(232,200,220,0.62);
        margin-top: 3px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .pp-letters-row .badge {
        font-family: 'Quicksand', 'Inter', sans-serif;
        font-size: 9.5px; font-weight: 700;
        letter-spacing: 1.2px; text-transform: uppercase;
        padding: 4px 10px; border-radius: 999px;
        flex-shrink: 0;
        border: 1px solid transparent;
      }
      .pp-letters-row .badge.unread {
        background: linear-gradient(180deg, #6E1733 0%, #4C0E22 100%);
        color: rgba(244,235,220,0.97);
        border-color: rgba(232,200,138,0.55);
        box-shadow: 0 0 12px rgba(232,168,91,0.20);
      }
      .pp-letters-row .badge.read {
        background: rgba(232,200,138,0.10);
        border-color: rgba(232,200,138,0.22);
        color: rgba(232,200,220,0.68);
      }
      .pp-letters-row .badge.replied {
        background: rgba(160,200,140,0.18);
        border-color: rgba(160,200,140,0.32);
        color: #cfe8b8;
      }
      .pp-letters-row .badge.response {
        background: rgba(200,160,240,0.18);
        border-color: rgba(200,160,240,0.32);
        color: #e2cdf7;
      }
      .pp-letters-row .badge.milestone {
        background: linear-gradient(160deg, rgba(244,221,168,0.25) 0%, rgba(212,168,91,0.15) 100%);
        border-color: rgba(232,200,138,0.55);
        color: #F4DDA8;
        letter-spacing: 1.6px;
      }

      /* Grouped layout — character-section header + indented rows. */
      .pp-letters-group-header {
        display: flex; align-items: center; gap: 10px;
        padding: 14px 16px 8px;
        margin-top: 4px;
        border-bottom: 1px solid rgba(232,200,138,0.10);
      }
      .pp-letters-group-portrait {
        width: 36px; height: 36px;
        border-radius: 50%; overflow: hidden;
        flex-shrink: 0;
        background: rgba(232,200,138,0.08);
        border: 1px solid rgba(232,200,138,0.28);
      }
      .pp-letters-group-portrait img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .pp-letters-group-meta { flex: 1; min-width: 0; }
      .pp-letters-group-name {
        font-family: 'Quicksand', 'Inter', sans-serif;
        font-size: 11px; letter-spacing: 2px; font-weight: 700;
        text-transform: uppercase;
        color: rgba(232,200,138,0.92);
      }
      .pp-letters-group-count {
        font-family: 'Cormorant Garamond', 'EB Garamond', serif;
        font-style: italic;
        font-size: 12px; color: rgba(232,200,220,0.62);
        margin-top: 2px;
      }
      /* When a row is grouped under a header, drop its own portrait
         and indent slightly so the visual hierarchy reads "section". */
      .pp-letters-row-grouped {
        padding-left: 56px;   /* aligns under the 36px portrait + 10px gap + 10px header pad */
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
    _btn = document.createElement('button');
    _btn.id = 'pp-letters-btn';
    _btn.title = 'Letters';
    _btn.className = 'topbar-collapsible'; // joins the topbar's collapse system
    _btn.innerHTML = '\u{1F4DC}<span class="pp-letters-dot hidden">!</span>';
    _btn.addEventListener('click', openArchive);
    // ── HOME-SCREEN MINIMALISM (May 2026) ───────────────────────────────
    // Was: floating fixed-position icon at top-right that overlapped the
    // character. Now: lives inside the topbar's collapsible group with
    // the other secondary buttons (trophy/gallery/music/companions/
    // settings), so the character has the screen and the button is
    // discoverable via the ☰ menu — same pattern as Love and Deepspace.
    // Jun 2026 — owner-specified topbar order: trophy / gallery /
    // letters / settings / menu. Insert before settings-btn so letters
    // lands between gallery and settings. Fall back to before menu if
    // settings is missing for some reason, then to body.
    const display = document.getElementById('affection-display');
    const settingsBtn = document.getElementById('settings-btn');
    const menuBtn = document.getElementById('topbar-menu-btn');
    if (display && settingsBtn) {
      display.insertBefore(_btn, settingsBtn);
    } else if (display && menuBtn) {
      display.insertBefore(_btn, menuBtn);
    } else {
      // Last-resort fallback: legacy floating placement if topbar isn't there yet.
      document.body.appendChild(_btn);
    }
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

  // True when the element is in the DOM AND actually has a non-zero
  // rendered bounding rect (rules out elements that are hidden via parent
  // display:none, visibility:hidden, opacity:0 + pointer-events:none, or
  // simply have zero width/height).
  function isReallyVisible(el) {
    if (!el) return false;
    if (el.classList && el.classList.contains('hidden')) return false;
    const rect = el.getBoundingClientRect();
    if (!rect || (rect.width <= 0 && rect.height <= 0)) return false;
    const cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
    if (cs && (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0')) return false;
    return true;
  }

  // Visibility rule: ONLY show the button while the player is actually in
  // the care-loop game screen, with no full-screen overlay/scene blocking
  // the view. Hides during title, world intro, bridges, chapter cards,
  // letter overlay itself, settings, loading, etc.
  function isGameVisibleAndIdle() {
    const game = document.getElementById('game-container');
    if (!isReallyVisible(game)) return false;

    // Each blocker is identified by id (or class for bridge legacy). We
    // confirm BOTH that it's present in DOM AND actually visible — many
    // overlay elements stay in the DOM after dismiss but with
    // display:none / .hidden / zero rect, and they should NOT block the
    // letter button.
    const ids = [
      'title-screen', 'world-intro', 'loading-screen', 'select-screen',
      'mscard-root', 'ms-encounter-root', 'chp-page', 'tp-root',
      'mg-overlay', 'mon-bundle-back', 'settings-overlay',
      'letter-overlay', 'pp-letters-overlay', 'cinematic-overlay',
      'event-overlay', 'gift-panel', 'training-panel',
      'story-overlay', 'main-story-page', 'pp-onboarding-overlay',
      'pp-skip-overlay', 'mst-confirm-overlay'
    ];
    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i]);
      if (el && isReallyVisible(el)) return false;
    }
    // Legacy bridge root (was a class, not an id)
    const bridgeRoot = document.querySelector('.pp-bridge-root');
    if (bridgeRoot && isReallyVisible(bridgeRoot)) return false;

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

    // ── GROUP BY CHARACTER ───────────────────────────────────────────────
    // The flat chronological list works fine at 2 letters per character but
    // breaks down at 5 (first + response + 3 milestones). With 7 characters
    // that's potentially 35+ items in one scrolling list — un-scannable.
    // Now grouped: per-character section, sorted by most-recent activity,
    // each section header shows portrait + name + count.
    const groups = {};
    for (const item of items) {
      if (!groups[item.char]) groups[item.char] = [];
      groups[item.char].push(item);
    }

    // Sort each character's letters newest-first; sort characters by their
    // most-recent letter timestamp.
    const charsSorted = Object.keys(groups).sort((a, b) => {
      const aMax = Math.max.apply(null, groups[a].map(i => i.seenAt || 0));
      const bMax = Math.max.apply(null, groups[b].map(i => i.seenAt || 0));
      return bMax - aMax;
    });

    charsSorted.forEach(charId => {
      const list = groups[charId].slice().sort((a, b) => (b.seenAt || 0) - (a.seenAt || 0));

      // Section header
      const header = document.createElement('div');
      header.className = 'pp-letters-group-header';
      const portrait = CHAR_PORTRAIT[charId] || '';
      const name = (CHAR_NAME[charId] || charId).toUpperCase();
      header.innerHTML =
        '<div class="pp-letters-group-portrait">' + (portrait ? '<img src="' + portrait + '" alt="">' : '') + '</div>' +
        '<div class="pp-letters-group-meta">' +
          '<div class="pp-letters-group-name">' + name + '</div>' +
          '<div class="pp-letters-group-count">' + list.length + (list.length === 1 ? ' letter' : ' letters') + '</div>' +
        '</div>';
      body.appendChild(header);

      // Rows
      list.forEach(item => {
        const row = document.createElement('div');
        row.className = 'pp-letters-row';
        let badgeClass = 'read';
        let badgeText  = 'READ';
        if (item.kind === 'first') {
          if (!item.replied) { badgeClass = 'unread'; badgeText = 'REPLY →'; }
          else               { badgeClass = 'replied'; badgeText = '↩ REPLIED'; }
        } else if (item.kind === 'response') {
          badgeClass = 'response'; badgeText = '← REPLY';
        } else if (item.kind === 'milestone') {
          // Milestone letters (chosen / midnight / aftermath) — small
          // tier-marker badge.
          badgeClass = 'milestone';
          badgeText = (item.tier || 'milestone').toUpperCase();
        }
        const preview = item.kind === 'response'
          ? 'Their reply to your letter.'
          : item.kind === 'milestone'
            ? 'Tap to re-read.'
            : (item.replied ? 'You wrote: ' + escapeHTML(item.reply.text) : 'Tap to read — then reply.');
        // Indent rows so they visually nest under the header.
        row.classList.add('pp-letters-row-grouped');
        row.innerHTML =
          '<div class="meta">' +
            '<div class="title">' + escapeHTML(item.title) + '</div>' +
            '<div class="preview">' + preview + '</div>' +
          '</div>' +
          '<div class="badge ' + badgeClass + '">' + badgeText + '</div>';
        row.addEventListener('click', () => {
          // Re-open the letter via LetterSystem.showStored.
          try { window.LetterSystem.showStored(item.char, item.kind, item.tier); } catch (_) {}
          closeArchive();
        });
        body.appendChild(row);
      });
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
  // pose swaps, etc.) and froze the game.
  //
  // We then ran a 900ms poll as a fallback. That was responsive but cost
  // ~67 ticks/min on mobile. May 2026 pass: slowed to 3000ms AND gated on
  // PPAmbient.tickAllowed() so the poll skips entirely when the tab is
  // hidden or a scene/modal is active. The click + visibilitychange
  // listeners still give near-instant response when the player interacts —
  // the interval is just a safety net for state changes that aren't tap-
  // driven, so 3s is plenty.
  // ---------------------------------------------------------------------------
  let _refreshScheduled = false;
  function refreshDebounced() {
    if (_refreshScheduled) return;
    _refreshScheduled = true;
    setTimeout(() => { _refreshScheduled = false; refresh(); }, 80);
  }

  function quietTick() {
    // Bail if the ambient coordinator says now isn't a good time
    // (tab hidden, or a scene is up — archive can't be visible then anyway).
    try {
      if (window.PPAmbient && typeof window.PPAmbient.tickAllowed === 'function'
          && !window.PPAmbient.tickAllowed()) return;
    } catch (_) { /* coordinator missing — fall through and refresh */ }
    refresh();
  }

  function boot() {
    refresh();
    setInterval(quietTick, 3000);
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
