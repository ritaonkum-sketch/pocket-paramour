/* letters-archive.js — the letter button + the LETTERS keepsake archive
 * ============================================================================
 *   A floating button (in the topbar collapsible group) that opens a
 *   "correspondence chamber" — NOT a messenger inbox. Premium keepsake feel:
 *
 *     ARCHIVE → a drawer per character (portrait in a gold frame, ✦ NAME, a
 *               teasing line from their latest letter, a count + "N waiting").
 *               A locked ✦ ??? drawer hints at letters not yet written.
 *     THREAD  → tap a drawer → that character's letters as sealed PARCHMENT
 *               cards (wax-seal signet, title, teaser). No chat bubbles.
 *     OPEN    → tap a letter → an ENVELOPE animation (wax cracks, flap lifts)
 *               → the full parchment reading view (letter.js).
 *
 *   Atmosphere: candle glow + soft drifting motes behind the panel (mobile-
 *   restrained). Phase 1 of the owner's "emotional system, not an inbox" vision
 *   (Aug 2026). Categories / favorite-archive / per-character ink = Phase 1b.
 *
 *   SAFETY CONTRACT: read-only on game state, never blocks gameplay, hidden
 *   until first letter is seen, fully optional UI surface.
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
  const ALL_CHARS = ['alistair','elian','lyra','caspian','lucien','noir','proto'];

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function sfx(name) { try { if (typeof sounds !== 'undefined' && sounds && typeof sounds[name] === 'function') sounds[name](); } catch (_) {} }

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('pp-letters-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-letters-styles';
    s.textContent = `
      #pp-letters-btn {
        position: relative; background: transparent; border: 0; padding: 0;
        color: inherit; font-size: 16px; cursor: pointer;
        transition: transform 0.18s ease; user-select: none; -webkit-tap-highlight-color: transparent;
      }
      #pp-letters-btn:active { transform: scale(0.92); }
      #pp-letters-btn.pp-letters-pulse { animation: pp-letters-pulse 1.8s ease-in-out infinite; }
      @keyframes pp-letters-pulse {
        0%,100% { box-shadow: 0 4px 10px rgba(0,0,0,0.45), 0 0 0 0 rgba(240,200,140,0.45); }
        50%     { box-shadow: 0 4px 14px rgba(0,0,0,0.55), 0 0 0 6px rgba(240,200,140,0.0); }
      }
      #pp-letters-btn .pp-letters-dot {
        position: absolute; top: -3px; right: -3px;
        background: linear-gradient(180deg, #6E1733 0%, #4C0E22 100%);
        border: 1px solid rgba(232,200,138,0.55); color: rgba(244,235,220,0.97);
        font-family: 'Quicksand','Inter',sans-serif; font-size: 9px; font-weight: 700;
        min-width: 14px; height: 14px; padding: 0 4px; border-radius: 999px;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 1px 4px rgba(0,0,0,0.55), 0 0 8px rgba(232,168,91,0.30);
      }
      #pp-letters-btn .pp-letters-dot.hidden { display: none; }

      /* Overlay + panel */
      #pp-letters-overlay {
        position: fixed; inset: 0; z-index: 9500;
        background: radial-gradient(ellipse at 50% 100%, rgba(60,40,22,0.22) 0%, rgba(0,0,0,0) 60%), rgba(10, 7, 4, 0.82);
        backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        display: flex; align-items: flex-end; justify-content: center;
        opacity: 0; pointer-events: none; transition: opacity 280ms ease;
      }
      #pp-letters-overlay.show { opacity: 1; pointer-events: auto; }
      #pp-letters-panel {
        position: relative; width: 100%; max-width: 460px; height: 86vh;
        background:
          radial-gradient(ellipse at 50% 0%, rgba(255,198,120,0.10) 0%, rgba(0,0,0,0) 55%),
          linear-gradient(180deg, rgba(42,30,18,0.66) 0%, rgba(26,17,9,0.80) 100%),
          url('assets/letters-desk.jpg');
        background-size: cover, cover, cover;
        background-position: center top;
        background-repeat: no-repeat;
        border-top-left-radius: 22px; border-top-right-radius: 22px;
        border: 1px solid rgba(232,200,138,0.40); border-bottom: none;
        box-shadow: 0 -10px 40px rgba(0,0,0,0.65), 0 0 28px rgba(232,168,91,0.12);
        display: flex; flex-direction: column; overflow: hidden;
        color: rgba(244,235,220,0.96);
        transform: translateY(20px); transition: transform 320ms ease;
      }
      #pp-letters-overlay.show #pp-letters-panel { transform: translateY(0); }

      /* Candlelit atmosphere (behind content) */
      .pp-lt-atmo { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
      .pp-lt-atmo .glow {
        position: absolute; left: 50%; top: -50px; width: 320px; height: 220px; transform: translateX(-50%);
        background: radial-gradient(ellipse at center, rgba(255,196,110,0.16), rgba(255,170,70,0.05) 50%, transparent 72%);
        filter: blur(16px);
      }
      .pp-lt-mote {
        position: absolute; width: 4px; height: 4px; border-radius: 50%;
        background: radial-gradient(circle, rgba(255,238,200,0.55), rgba(255,238,200,0));
        animation: pp-lt-drift 15s ease-in-out infinite;
      }
      .pp-lt-mote.m1 { left: 18%; top: 72%; animation-duration: 13s; }
      .pp-lt-mote.m2 { left: 72%; top: 82%; animation-duration: 17s; animation-delay: 3s; }
      .pp-lt-mote.m3 { left: 44%; top: 90%; animation-duration: 15s; animation-delay: 6s; }
      .pp-lt-mote.m4 { left: 85%; top: 66%; animation-duration: 19s; animation-delay: 1.5s; }
      @keyframes pp-lt-drift {
        0% { transform: translateY(0) scale(1); opacity: 0; }
        15% { opacity: 0.8; } 85% { opacity: 0.5; }
        100% { transform: translateY(-170px) scale(1.3); opacity: 0; }
      }

      /* Header (back ‹ … title+subtitle … ✕) */
      .pp-letters-header {
        position: relative; z-index: 1;
        display: flex; align-items: center; justify-content: center;
        padding: 18px 18px 14px; border-bottom: 1px solid rgba(232,200,138,0.20);
      }
      .pp-letters-header .htitle { display: flex; flex-direction: column; align-items: center; gap: 2px; max-width: 70%; }
      .pp-letters-header .title {
        font-family: 'Cormorant Garamond','EB Garamond',serif; font-style: italic; font-weight: 500;
        font-size: 23px; letter-spacing: 0.06em; color: rgba(244,235,220,0.96);
        text-shadow: 0 1px 6px rgba(0,0,0,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
      }
      .pp-letters-header .sub {
        font-family: 'Cormorant Garamond','EB Garamond',serif; font-style: italic;
        font-size: 11.5px; letter-spacing: 0.04em; color: rgba(232,200,220,0.55); white-space: nowrap;
      }
      .pp-letters-header .back, .pp-letters-header .close {
        position: absolute; top: 16px; cursor: pointer; width: 30px; height: 30px;
        display: inline-flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.42); border: 1px solid rgba(232,200,138,0.30);
        border-radius: 50%; line-height: 1; color: rgba(244,235,220,0.85); font-family: 'Cormorant Garamond', serif;
      }
      .pp-letters-header .back { left: 14px; font-size: 20px; }
      .pp-letters-header .close { right: 16px; font-size: 15px; }
      .pp-letters-header .back:hover, .pp-letters-header .close:hover { color: #FFF6FA; border-color: rgba(232,200,138,0.6); }

      .pp-letters-body { position: relative; z-index: 1; flex: 1; overflow-y: auto; padding: 14px 14px 28px; }
      .pp-letters-empty {
        text-align: center; padding: 80px 24px; color: rgba(232,200,220,0.62);
        font-family: 'Cormorant Garamond','EB Garamond',serif; font-style: italic; font-size: 16px; line-height: 1.7;
      }

      /* ── ARCHIVE — a velvet drawer per character ─────────────── */
      .pp-lt-drawer {
        display: flex; align-items: center; gap: 13px; padding: 14px 14px; margin: 0 2px 12px; cursor: pointer;
        background: linear-gradient(180deg, rgba(56,38,20,0.60), rgba(38,25,12,0.70));
        border: 1px solid rgba(232,200,138,0.30); border-radius: 14px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,220,170,0.06);
        transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
      }
      .pp-lt-drawer:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(0,0,0,0.5); border-color: rgba(232,200,138,0.5); }
      .pp-lt-drawer .frame {
        width: 54px; height: 54px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
        background: rgba(11,4,16,0.6); border: 2px solid rgba(232,200,138,0.55); box-shadow: 0 0 12px rgba(232,168,91,0.20);
      }
      .pp-lt-drawer .frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .pp-lt-drawer .meta { flex: 1; min-width: 0; }
      .pp-lt-drawer .dname {
        font-family: 'Cormorant Garamond','EB Garamond',serif; font-style: italic; font-weight: 500;
        font-size: 18px; color: #f0d9a6; letter-spacing: 0.03em;
      }
      .pp-lt-drawer .dteaser {
        font-family: 'Cormorant Garamond','EB Garamond',serif; font-style: italic; font-size: 13.5px;
        color: rgba(244,235,220,0.78); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .pp-lt-drawer .dcount {
        font-family: 'Quicksand','Inter',sans-serif; font-size: 9.5px; letter-spacing: 1.4px;
        text-transform: uppercase; color: rgba(232,200,138,0.6); margin-top: 6px;
      }
      .pp-lt-drawer .dcount .new { color: #ffd98a; }
      .pp-lt-drawer .dchev {
        flex-shrink: 0; align-self: center; font-family: 'Cormorant Garamond', serif;
        font-size: 26px; line-height: 1; color: rgba(232,200,138,0.55); padding-left: 2px;
      }
      .pp-lt-drawer.locked .dchev { display: none; }
      .pp-lt-drawer.locked { cursor: default; opacity: 0.72; }
      .pp-lt-drawer.locked .frame {
        display: flex; align-items: center; justify-content: center;
        border-color: rgba(200,200,210,0.28); color: rgba(232,200,138,0.45);
        font-family: 'Cormorant Garamond', serif; font-size: 22px; background: rgba(20,12,26,0.6);
      }
      .pp-lt-drawer.locked .dname { color: rgba(220,210,225,0.6); }

      /* ── THREAD — sealed parchment letter cards ──────────────── */
      .pp-letter-card {
        position: relative; cursor: pointer;
        background: linear-gradient(180deg, #f7ecd1 0%, #ead8ad 100%); color: #2b1a08;
        border-radius: 7px; padding: 15px 16px 13px; margin: 0 2px 14px;
        box-shadow: 0 7px 20px rgba(0,0,0,0.42); transition: transform 0.16s ease, box-shadow 0.16s ease;
      }
      .pp-letter-card:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(0,0,0,0.5); }
      .pp-letter-card::before {
        content: ''; position: absolute; inset: 0; border-radius: 7px; pointer-events: none;
        background: radial-gradient(circle at 12% 18%, rgba(130,80,20,0.10) 0%, transparent 42%),
                    radial-gradient(circle at 88% 84%, rgba(130,80,20,0.08) 0%, transparent 46%);
      }
      .pp-letter-card.needs-reply { box-shadow: 0 8px 22px rgba(0,0,0,0.45), 0 0 18px rgba(232,168,91,0.24); }
      .pp-letter-card.opened { filter: saturate(0.97); }
      .pp-letter-card .seal {
        position: absolute; top: -11px; right: 16px; width: 30px; height: 30px; border-radius: 50%;
        background: radial-gradient(circle at 38% 32%, #d4504a 0%, #7a1818 78%);
        box-shadow: 0 3px 8px rgba(0,0,0,0.45), inset 0 -2px 5px rgba(0,0,0,0.35);
        display: flex; align-items: center; justify-content: center; color: #f7ecd1;
        font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 14px; line-height: 1;
      }
      .pp-letter-card.opened .seal { background: radial-gradient(circle at 38% 32%, #9a4a47 0%, #5a1414 80%); opacity: 0.55; }
      .pp-letter-card.opened .seal::after {
        content: ''; position: absolute; left: 50%; top: 3px; width: 1.5px; height: 24px;
        background: rgba(40,8,8,0.55); transform: translateX(-50%) rotate(9deg);
      }
      .pp-letter-card .ttl {
        font-family: 'Cormorant Garamond','EB Garamond',serif; font-style: italic; font-weight: 500;
        font-size: 17px; color: #3b220a; padding-right: 36px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .pp-letter-card .exc {
        font-family: 'Cormorant Garamond','EB Garamond',serif; font-style: italic; font-size: 13px;
        color: #6b4a26; margin-top: 4px; line-height: 1.45; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .pp-letter-card .foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 11px; }
      .pp-letter-card .when { font-family: 'Quicksand',sans-serif; font-size: 9px; letter-spacing: 0.5px; color: #8a6a44; }
      .pp-letter-chip {
        font-family: 'Quicksand','Inter',sans-serif; font-size: 9.5px; font-weight: 700;
        letter-spacing: 1.4px; text-transform: uppercase; padding: 3px 11px; border-radius: 999px; border: 1px solid transparent;
      }
      .pp-letter-chip.reply { color: #6b4410; background: linear-gradient(180deg, rgba(244,221,168,0.65) 0%, rgba(212,168,91,0.34) 100%); border-color: rgba(190,140,60,0.55); }
      .pp-letter-chip.replied { color: #4a6b2e; background: rgba(120,160,90,0.14); border-color: rgba(120,160,90,0.34); }
      .pp-letter-chip.read { color: #8a6a44; background: rgba(120,80,30,0.07); border-color: rgba(120,80,30,0.20); }
      .pp-letter-chip.tier { color: #7a5410; background: linear-gradient(160deg, rgba(244,221,168,0.6) 0%, rgba(212,168,91,0.30) 100%); border-color: rgba(190,150,70,0.55); letter-spacing: 1.6px; }

      /* ── ENVELOPE opening animation ──────────────────────────── */
      #pp-env-overlay {
        position: fixed; inset: 0; z-index: 9600;
        background: radial-gradient(ellipse at center, rgba(20,8,26,0.86), rgba(0,0,0,0.94));
        display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 240ms ease;
      }
      #pp-env-overlay.show { opacity: 1; }
      .pp-env { position: relative; width: 240px; height: 168px; perspective: 900px; transform: scale(0.82); opacity: 0; transition: transform 420ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease; }
      #pp-env-overlay.show .pp-env { transform: scale(1); opacity: 1; }
      .pp-env.opening { transform: scale(1.4); opacity: 0; transition: transform 640ms ease, opacity 640ms ease; }
      .pp-env .env-card {
        position: absolute; inset: 0; border-radius: 8px;
        background: linear-gradient(180deg, #f7ecd1, #e3cfa2);
        box-shadow: 0 24px 60px rgba(0,0,0,0.6), inset 0 0 44px rgba(120,70,20,0.16);
      }
      .pp-env .env-flap {
        position: absolute; left: 0; right: 0; top: 0; height: 86px; transform-origin: top; transition: transform 520ms ease;
        background: linear-gradient(180deg, #efe0bd, #ddc69b);
        clip-path: polygon(0 0, 100% 0, 50% 100%); border-bottom: 1px solid rgba(120,70,20,0.18);
      }
      .pp-env.opening .env-flap { transform: rotateX(-162deg); }
      .pp-env .env-seal { position: absolute; left: 50%; top: 66px; transform: translate(-50%,-50%); width: 46px; height: 46px; z-index: 3; }
      .pp-env .env-seal .h { position: absolute; top: 0; width: 23px; height: 46px; overflow: hidden; transition: transform 380ms ease, opacity 380ms ease; }
      .pp-env .env-seal .h.l { left: 0; } .pp-env .env-seal .h.r { right: 0; }
      .pp-env .env-seal .h::before {
        content: ''; position: absolute; top: 0; width: 46px; height: 46px; border-radius: 50%;
        background: radial-gradient(circle at 38% 32%, #d4504a, #7a1818); box-shadow: inset 0 -3px 6px rgba(0,0,0,0.4);
      }
      .pp-env .env-seal .h.l::before { left: 0; } .pp-env .env-seal .h.r::before { right: 0; }
      .pp-env .env-seal .initial {
        position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 4;
        color: #f7ecd1; font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 20px; transition: opacity 200ms ease;
      }
      .pp-env.opening .env-seal .h.l { transform: translateX(-16px) rotate(-32deg); opacity: 0; }
      .pp-env.opening .env-seal .h.r { transform: translateX(16px) rotate(32deg); opacity: 0; }
      .pp-env.opening .env-seal .initial { opacity: 0; }
      .pp-env .env-hint {
        position: absolute; left: 0; right: 0; bottom: -34px; text-align: center;
        font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 12px; color: rgba(232,200,220,0.5);
      }

      /* "A letter waits" notification chip — the visible care-screen cue. */
      #pp-letter-notify {
        position: fixed; left: 50%; top: 62px; z-index: 9400;
        display: none; align-items: center; gap: 9px;
        padding: 7px 15px 7px 8px; border-radius: 999px;
        background: linear-gradient(180deg, rgba(58,30,40,0.95), rgba(38,18,26,0.96));
        border: 1px solid rgba(232,200,138,0.5);
        box-shadow: 0 6px 18px rgba(0,0,0,0.5), 0 0 14px rgba(232,168,91,0.22);
        cursor: pointer; opacity: 0; transform: translateX(-50%) translateY(-8px);
        transition: opacity 300ms ease, transform 300ms ease;
      }
      #pp-letter-notify.show { display: flex; opacity: 1; transform: translateX(-50%) translateY(0); animation: pp-ln-pulse 2.6s ease-in-out infinite; }
      @keyframes pp-ln-pulse {
        0%,100% { box-shadow: 0 6px 18px rgba(0,0,0,0.5), 0 0 12px rgba(232,168,91,0.16); }
        50%     { box-shadow: 0 6px 20px rgba(0,0,0,0.55), 0 0 22px rgba(232,168,91,0.42); }
      }
      #pp-letter-notify .pln-seal {
        width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
        background: radial-gradient(circle at 38% 32%, #d4504a, #7a1818);
        box-shadow: inset 0 -2px 4px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
        color: #f7ecd1; font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 12px; line-height: 1;
      }
      #pp-letter-notify .pln-txt {
        font-family: 'Cormorant Garamond','EB Garamond',serif; font-style: italic;
        font-size: 14px; color: rgba(244,228,190,0.97); white-space: nowrap;
      }

      /* Bleed guard — these letter surfaces are CARE-ONLY. If a screen change
         happens while one is open, never let it paint over another screen. */
      body:not(.pp-screen-care) #pp-letters-overlay,
      body:not(.pp-screen-care) #pp-letter-arrival,
      body:not(.pp-screen-care) #pp-letter-notify,
      body:not(.pp-screen-care) #pp-env-overlay { display: none !important; }
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
    _btn.className = 'topbar-collapsible';
    _btn.innerHTML = '\u{1F4DC}<span class="pp-letters-dot hidden">!</span>';
    _btn.addEventListener('click', openArchive);
    const display = document.getElementById('affection-display');
    const settingsBtn = document.getElementById('settings-btn');
    const menuBtn = document.getElementById('topbar-menu-btn');
    if (display && settingsBtn) display.insertBefore(_btn, settingsBtn);
    else if (display && menuBtn) display.insertBefore(_btn, menuBtn);
    else document.body.appendChild(_btn);
    return _btn;
  }

  function anyLetterSeen() {
    for (const c of ALL_CHARS) {
      if (lsGet('pp_letter_seen_' + c)) return true;
      if (lsGet('pp_letter_response_seen_' + c)) return true;
    }
    return false;
  }

  function isReallyVisible(el) {
    if (!el) return false;
    if (el.classList && el.classList.contains('hidden')) return false;
    const rect = el.getBoundingClientRect();
    if (!rect || (rect.width <= 0 && rect.height <= 0)) return false;
    const cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
    if (cs && (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0')) return false;
    return true;
  }

  function isGameVisibleAndIdle() {
    const game = document.getElementById('game-container');
    if (!isReallyVisible(game)) return false;
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
    const bridgeRoot = document.querySelector('.pp-bridge-root');
    if (bridgeRoot && isReallyVisible(bridgeRoot)) return false;
    return true;
  }

  // "A letter waits" notification chip — the actual visible cue, since the
  // topbar letters button collapses behind the ☰ menu and its pulse is unseen.
  let _notify = null;
  function ensureNotify() {
    if (_notify) return _notify;
    injectStyles();
    _notify = document.createElement('div');
    _notify.id = 'pp-letter-notify';
    _notify.innerHTML = '<span class="pln-seal">✦</span><span class="pln-txt">A letter waits</span>';
    _notify.addEventListener('click', function () { openArchive(); });
    document.body.appendChild(_notify);
    return _notify;
  }
  function attentionChar() {
    try {
      if (!(window.LetterSystem && window.LetterSystem.getReply)) return null;
      for (const c of Object.keys(CHAR_NAME)) {
        if (lsGet('pp_letter_seen_' + c) && !window.LetterSystem.getReply(c)) return c;
      }
    } catch (_) {}
    return null;
  }

  function refresh() {
    ensureButton();
    ensureNotify();
    if (!isGameVisibleAndIdle()) { _btn.style.display = 'none'; _notify.classList.remove('show'); return; }
    _btn.style.display = 'flex';
    const dot = _btn.querySelector('.pp-letters-dot');
    const attention = window.LetterSystem && window.LetterSystem.hasAttention && window.LetterSystem.hasAttention();
    const hasAny = anyLetterSeen();
    if (attention) { dot.classList.remove('hidden'); _btn.classList.add('pp-letters-pulse'); _btn.style.opacity = '1'; }
    else { dot.classList.add('hidden'); _btn.classList.remove('pp-letters-pulse'); _btn.style.opacity = hasAny ? '1' : '0.55'; }
    // The visible notification: shown when a letter is unanswered + the archive
    // isn't already open.
    const archiveOpen = _overlay && _overlay.classList.contains('show');
    if (attention && !archiveOpen) {
      const ac = attentionChar();
      _notify.querySelector('.pln-txt').textContent = ac ? ('A letter from ' + (CHAR_NAME[ac] || ac)) : 'A letter waits';
      _notify.querySelector('.pln-seal').textContent = ac ? (CHAR_NAME[ac] || ac).charAt(0).toUpperCase() : '✦';
      _notify.classList.add('show');
    } else {
      _notify.classList.remove('show');
    }
  }

  // ---------------------------------------------------------------------------
  // Overlay
  // ---------------------------------------------------------------------------
  let _overlay = null;
  function buildOverlay() {
    if (_overlay) return _overlay;
    injectStyles();
    _overlay = document.createElement('div');
    _overlay.id = 'pp-letters-overlay';
    _overlay.innerHTML = '' +
      '<div id="pp-letters-panel">' +
        '<div class="pp-lt-atmo"><span class="glow"></span>' +
          '<span class="pp-lt-mote m1"></span><span class="pp-lt-mote m2"></span>' +
          '<span class="pp-lt-mote m3"></span><span class="pp-lt-mote m4"></span></div>' +
        '<div class="pp-letters-header">' +
          '<span class="back" data-act="back" style="display:none;">‹</span>' +
          '<div class="htitle"><span class="title">Letters</span><span class="sub">Words that found their way to you.</span></div>' +
          '<span class="close" data-act="close">✕</span>' +
        '</div>' +
        '<div class="pp-letters-body"></div>' +
      '</div>';
    _overlay.addEventListener('click', (e) => {
      if (e.target === _overlay) { closeArchive(); return; }
      const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
      if (act === 'close') closeArchive();
      else if (act === 'back') renderArchive();
    });
    document.body.appendChild(_overlay);
    return _overlay;
  }

  function openArchive() { buildOverlay(); renderArchive(); _overlay.classList.add('show'); }
  function closeArchive() { if (!_overlay) return; _overlay.classList.remove('show'); refresh(); }

  function setHeader(title, sub, showBack) {
    if (!_overlay) return;
    const t = _overlay.querySelector('.pp-letters-header .title');
    const su = _overlay.querySelector('.pp-letters-header .sub');
    const b = _overlay.querySelector('.pp-letters-header .back');
    if (t) t.textContent = title;
    if (su) su.textContent = sub || '';
    if (b) b.style.display = showBack ? 'inline-flex' : 'none';
  }

  // ---------------------------------------------------------------------------
  // ARCHIVE — a drawer per character
  // ---------------------------------------------------------------------------
  function renderArchive() {
    const body = _overlay.querySelector('.pp-letters-body');
    setHeader('Letters', 'Words that found their way to you.', false);
    const items = (window.LetterSystem && window.LetterSystem.list) ? window.LetterSystem.list() : [];
    if (!items.length) {
      body.innerHTML = '<div class="pp-letters-empty">No letters yet.<br>Care for someone long enough, and they will write.</div>';
      return;
    }
    const groups = {};
    items.forEach(it => { (groups[it.char] = groups[it.char] || []).push(it); });
    const chars = Object.keys(groups).sort((a, b) =>
      Math.max.apply(null, groups[b].map(i => i.seenAt || 0)) -
      Math.max.apply(null, groups[a].map(i => i.seenAt || 0)));

    // Single companion → open their letters directly. Most players care for one
    // companion at a time, so the drawer index is pure friction: they tap
    // "Letters", see a lone drawer, and don't realise they must tap it AGAIN to
    // reach the letters — which reads as "I can't re-read my letters". With
    // exactly one character we skip the index and show the thread; the ✕ closes
    // it (the back arrow is hidden via isRoot, since there's no index to return to).
    if (chars.length === 1) { renderThread(chars[0], true); return; }

    body.innerHTML = ''; body.scrollTop = 0;
    chars.forEach(charId => {
      const letters = groups[charId].slice().sort((a, b) => (b.seenAt || 0) - (a.seenAt || 0));
      const latest = letters[0];
      const owed = letters.filter(l => l.kind === 'first' && !l.replied).length;
      const portrait = CHAR_PORTRAIT[charId] || '';
      const name = CHAR_NAME[charId] || charId;
      const teaser = letterExcerpt(latest) || latest.title || 'A letter.';

      const d = document.createElement('div');
      d.className = 'pp-lt-drawer';
      d.innerHTML =
        '<div class="frame">' + (portrait ? '<img src="' + portrait + '" alt="">' : '') + '</div>' +
        '<div class="meta">' +
          '<div class="dname">✦ ' + escapeHTML(name) + '</div>' +
          '<div class="dteaser">“' + escapeHTML(teaser) + '”</div>' +
          '<div class="dcount">' + letters.length + (letters.length === 1 ? ' letter' : ' letters') +
            (owed ? ' · <span class="new">' + owed + ' waiting</span>' : '') + '</div>' +
        '</div>' +
        '<div class="dchev" aria-hidden="true">›</div>';
      d.addEventListener('click', () => renderThread(charId));
      body.appendChild(d);
    });

    if (chars.length < ALL_CHARS.length) {
      const lk = document.createElement('div');
      lk.className = 'pp-lt-drawer locked';
      lk.innerHTML =
        '<div class="frame">✦</div>' +
        '<div class="meta">' +
          '<div class="dname">✦ ???</div>' +
          '<div class="dteaser">A letter not yet written.</div>' +
          '<div class="dcount">Sealed</div>' +
        '</div>';
      body.appendChild(lk);
    }
  }

  // ---------------------------------------------------------------------------
  // THREAD — one character's letters as sealed parchment cards
  // ---------------------------------------------------------------------------
  function renderThread(charId, isRoot) {
    const body = _overlay.querySelector('.pp-letters-body');
    const name = CHAR_NAME[charId] || charId;
    const all = (window.LetterSystem && window.LetterSystem.list) ? window.LetterSystem.list() : [];
    const letters = all.filter(i => i.char === charId).sort((a, b) => (b.seenAt || 0) - (a.seenAt || 0)); // newest first
    // Show the back arrow only when we came from the drawer index. When the
    // thread IS the root (single-companion auto-open), there's nothing to go
    // back to, so we hide it and let ✕ close the archive.
    setHeader(name, letters.length + (letters.length === 1 ? ' letter' : ' letters'), !isRoot);

    body.innerHTML = ''; body.scrollTop = 0;
    letters.forEach(item => {
      const needsReply = (item.kind === 'first' && !item.replied);
      const initial = (CHAR_NAME[charId] || charId).charAt(0).toUpperCase();
      let chip;
      if (needsReply)                                 chip = '<span class="pp-letter-chip reply">Reply ›</span>';
      else if (item.kind === 'milestone')             chip = '<span class="pp-letter-chip tier">' + escapeHTML(item.tier || 'milestone') + '</span>';
      else if (item.kind === 'first' && item.replied) chip = '<span class="pp-letter-chip replied">Replied</span>';
      else                                            chip = '<span class="pp-letter-chip read">Read</span>';
      const exc = letterExcerpt(item) || (needsReply ? 'A letter waits for your reply.' : 'Tap to re-read.');

      const card = document.createElement('div');
      card.className = 'pp-letter-card ' + (needsReply ? 'needs-reply' : 'opened');
      card.innerHTML =
        '<div class="seal">' + escapeHTML(initial) + '</div>' +
        '<div class="ttl">' + escapeHTML(item.title) + '</div>' +
        '<div class="exc">' + escapeHTML(exc) + '</div>' +
        '<div class="foot">' + chip + '<span class="when">' + relTime(item.seenAt) + '</span></div>';
      card.addEventListener('click', () => {
        try { playEnvelopeOpen(item, () => openLetter(item)); }
        catch (_) { openLetter(item); }
      });
      body.appendChild(card);
    });
  }

  function openLetter(item) {
    try { window.LetterSystem.showStored(item.char, item.kind, item.tier); } catch (_) {}
    closeArchive();
  }

  // ---------------------------------------------------------------------------
  // Envelope opening — wax cracks, flap lifts, then the parchment reader opens
  // ---------------------------------------------------------------------------
  function playEnvelopeOpen(item, onDone) {
    const initial = (CHAR_NAME[item.char] || item.char || '?').charAt(0).toUpperCase();
    const old = document.getElementById('pp-env-overlay');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    const ov = document.createElement('div');
    ov.id = 'pp-env-overlay';
    ov.innerHTML =
      '<div class="pp-env">' +
        '<div class="env-card"></div>' +
        '<div class="env-flap"></div>' +
        '<div class="env-seal"><div class="h l"></div><div class="h r"></div><div class="initial">' + escapeHTML(initial) + '</div></div>' +
        '<div class="env-hint">tap to open</div>' +
      '</div>';
    document.body.appendChild(ov);
    const env = ov.querySelector('.pp-env');

    let done = false;
    const finish = () => {
      if (done) return; done = true;
      ov.classList.remove('show');
      try { onDone && onDone(); } catch (_) {}
      setTimeout(() => { if (ov && ov.parentNode) ov.parentNode.removeChild(ov); }, 300);
    };

    sfx('cardFlip');
    requestAnimationFrame(() => ov.classList.add('show'));
    // tap anywhere to skip straight to the letter
    ov.addEventListener('click', () => { env.classList.add('opening'); sfx('swoosh'); setTimeout(finish, 200); });
    // auto sequence: crack + lift, then open the parchment
    setTimeout(() => { if (!done) { env.classList.add('opening'); sfx('swoosh'); } }, 620);
    setTimeout(() => finish(), 1320);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function letterExcerpt(item) {
    if (!item) return null;
    try {
      const key = (item.kind === 'milestone' && item.tier)
        ? 'pp_letter_milestone_' + item.tier + '_' + item.char
        : 'pp_letter_seen_' + item.char;
      const rec = JSON.parse(lsGet(key) || 'null');
      const first = rec && rec.paragraphs && rec.paragraphs[0];
      if (!first) return null;
      let str = String(first).replace(/\s+/g, ' ').trim();
      if (str.length > 92) str = str.slice(0, 90).replace(/[\s,.;:—-]+\S*$/, '') + '…';
      return str;
    } catch (_) { return null; }
  }

  function relTime(ts) {
    if (!ts) return '';
    const d = Date.now() - ts;
    if (d < 0) return '';
    const m = 60000, h = 3600000, day = 86400000;
    if (d < m) return 'just now';
    if (d < h) return Math.floor(d / m) + 'm';
    if (d < day) return Math.floor(d / h) + 'h';
    if (d < 7 * day) return Math.floor(d / day) + 'd';
    return Math.floor(d / (7 * day)) + 'w';
  }

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  let _refreshScheduled = false;
  function refreshDebounced() {
    if (_refreshScheduled) return;
    _refreshScheduled = true;
    setTimeout(() => { _refreshScheduled = false; refresh(); }, 80);
  }
  function quietTick() {
    try {
      if (window.PPAmbient && typeof window.PPAmbient.tickAllowed === 'function' && !window.PPAmbient.tickAllowed()) return;
    } catch (_) {}
    refresh();
  }
  function boot() {
    refresh();
    setInterval(quietTick, 3000);
    document.addEventListener('click', refreshDebounced, true);
    document.addEventListener('visibilitychange', refreshDebounced);
    // Bleed guard — the instant the player leaves the care screen, close the
    // archive (clear .show so it cannot re-appear on return) and tear down any
    // transient arrival/envelope overlay, so nothing bleeds onto the next screen.
    try {
      const mo = new MutationObserver(() => {
        if (document.body.classList.contains('pp-screen-care')) return;
        if (_overlay && _overlay.classList.contains('show')) _overlay.classList.remove('show');
        ['pp-letter-arrival', 'pp-env-overlay'].forEach(id => {
          const e = document.getElementById(id);
          if (e && e.parentNode) e.parentNode.removeChild(e);
        });
      });
      mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    } catch (_) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.PPLettersArchive = { open: openArchive, close: closeArchive, refresh: refresh };
})();
