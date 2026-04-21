/* memory-gallery.js — viewer for unlocked memory cards + endings.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Depends on window.MSCard. If MSCard isn't loaded, no-op.
 *  - Feature-flagged on pp_main_story_enabled. Off by default.
 *  - Reads per-card / per-ending seen flags. No mutation of game state.
 *  - Renders a small floating button on the character-select screen that
 *    opens a full-screen gallery overlay. Gallery has its own z-index and
 *    doesn\u2019t fight the existing in-game gallery (different ids).
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const POLL_MS = 1500;
  const BTN_ID = 'mg-button';
  const OVERLAY_ID = 'mg-overlay';

  const CHAR_PRETTY = {
    alistair: 'Alistair', elian: 'Elian', lyra: 'Lyra',
    caspian: 'Caspian', lucien: 'Lucien', noir: 'Noir', proto: 'Proto'
  };

  const CHAR_PORTRAIT = {
    alistair: 'assets/alistair/select-portrait.png',
    elian: 'assets/elian/select-portrait.png',
    lyra: 'assets/lyra/select-portrait.png',
    caspian: 'assets/caspian/select-portrait.png',
    lucien: 'assets/lucien/select-portrait.png',
    noir: 'assets/noir/select-portrait.png',
    proto: 'assets/proto/select-portrait.png'
  };

  // ---------------------------------------------------------------
  function isEnabled() {
    try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; }
  }

  // Walk the MSCard registry and split into memory cards vs endings.
  function catalog() {
    const reg = (window.MSCard && window.MSCard._registry) || {};
    const memories = [];
    const endings = [];
    Object.keys(reg).forEach(id => {
      const card = reg[id];
      const isEnding = id.startsWith('ending_');
      const speaker = (card.speaker || '').toLowerCase();
      const charId = speaker && CHAR_PRETTY[speaker] ? speaker : guessChar(id);
      const entry = { id, card, charId };
      (isEnding ? endings : memories).push(entry);
    });
    return { memories, endings };
  }

  function guessChar(id) {
    const chars = Object.keys(CHAR_PRETTY);
    for (const c of chars) if (id.includes(c)) return c;
    return 'unknown';
  }

  function isCardSeen(id, isEnding) {
    try {
      if (isEnding) {
        // ending_<char>_<branch> — seen only if that *specific* branch played.
        const m = id.match(/^ending_([a-z]+)_(.+)$/);
        if (!m) return false;
        const charId = m[1], branch = m[2];
        if (localStorage.getItem('pp_ending_seen_' + charId) !== '1') return false;
        return localStorage.getItem('pp_ending_branch_' + charId) === branch;
      }
      return localStorage.getItem('pp_card_seen_' + id) === '1';
    } catch (e) { return false; }
  }

  function anyUnlocked() {
    const { memories, endings } = catalog();
    return memories.some(e => isCardSeen(e.id, false)) || endings.some(e => isCardSeen(e.id, true));
  }

  // ---------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('mg-style')) return;
    const s = document.createElement('style');
    s.id = 'mg-style';
    s.textContent = `
      #${BTN_ID}, #${OVERLAY_ID} button { font-family: inherit; }
      #${BTN_ID} {
        position: fixed; bottom: 18px; right: 18px;
        padding: 10px 14px; border-radius: 22px; border: 0;
        background: linear-gradient(180deg, rgba(245,200,240,0.95), rgba(200,140,230,0.95));
        color: #1a0a26; font-weight: 600; font-size: 13px; letter-spacing: 0.5px;
        box-shadow: 0 6px 16px rgba(100,40,140,0.4);
        cursor: pointer; z-index: 9800; opacity: 0;
        transition: opacity 360ms ease, transform 260ms cubic-bezier(.2,.8,.2,1);
      }
      #${BTN_ID}.visible { opacity: 1; }
      #${BTN_ID}:active { transform: scale(0.96); }
      #${OVERLAY_ID} { position: fixed; inset: 0; z-index: 10700; background: rgba(6,3,14,0.92); backdrop-filter: blur(6px); display: flex; flex-direction: column; opacity: 0; transition: opacity 420ms ease; }
      #${OVERLAY_ID}.visible { opacity: 1; }
      #${OVERLAY_ID} .mg-head { padding: 16px 18px 6px; color: #f4e6ff; display: flex; align-items: center; justify-content: space-between; }
      #${OVERLAY_ID} .mg-title { font-size: 18px; font-weight: 700; letter-spacing: 2px; }
      #${OVERLAY_ID} .mg-close { background: rgba(255,255,255,0.08); color: #f4e6ff; border: 0; border-radius: 20px; padding: 6px 12px; font-size: 13px; cursor: pointer; }
      #${OVERLAY_ID} .mg-tabs { display: flex; gap: 8px; padding: 0 18px 10px; }
      #${OVERLAY_ID} .mg-tab { flex: 1; padding: 10px; border-radius: 14px; background: rgba(255,255,255,0.06); color: #f4e6ff; text-align: center; font-size: 13px; cursor: pointer; border: 0; font-weight: 600; }
      #${OVERLAY_ID} .mg-tab.active { background: linear-gradient(180deg,#f6a5c0,#e879a2); color: #22112a; }
      #${OVERLAY_ID} .mg-list { flex: 1; overflow-y: auto; padding: 8px 14px 22px; }
      #${OVERLAY_ID} .mg-char-block { margin-bottom: 18px; }
      #${OVERLAY_ID} .mg-char-name { font-size: 12px; letter-spacing: 2px; color: rgba(244,230,255,0.65); margin: 6px 2px 8px; text-transform: uppercase; }
      #${OVERLAY_ID} .mg-row { display: flex; gap: 10px; background: rgba(255,255,255,0.05); border-radius: 14px; padding: 10px; align-items: center; margin-bottom: 8px; }
      #${OVERLAY_ID} .mg-row.locked { opacity: 0.45; }
      #${OVERLAY_ID} .mg-thumb { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; background: #1a1030; border: 2px solid rgba(255,255,255,0.1); flex-shrink: 0; }
      #${OVERLAY_ID} .mg-text { flex: 1; color: #f4e6ff; line-height: 1.3; min-width: 0; }
      #${OVERLAY_ID} .mg-text .t1 { font-weight: 600; font-size: 14px; }
      #${OVERLAY_ID} .mg-text .t2 { font-size: 11px; opacity: 0.6; letter-spacing: 1.4px; text-transform: uppercase; margin-top: 2px; }
      #${OVERLAY_ID} .mg-play { background: linear-gradient(180deg,#f6a5c0,#e879a2); color: #22112a; border: 0; border-radius: 16px; padding: 8px 14px; font-weight: 600; font-size: 12px; cursor: pointer; }
      #${OVERLAY_ID} .mg-play:disabled { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.45); cursor: default; }
      #${OVERLAY_ID} .mg-empty { text-align: center; padding: 40px 20px; color: rgba(244,230,255,0.55); font-style: italic; font-size: 13px; }
    `;
    document.head.appendChild(s);
  }

  // ---------------------------------------------------------------
  function ensureButton() {
    let b = document.getElementById(BTN_ID);
    if (b) return b;
    b = document.createElement('button');
    b.id = BTN_ID;
    b.textContent = '\u2726 Memories';
    b.addEventListener('click', openGallery);
    document.body.appendChild(b);
    return b;
  }

  function maybeShowButton() {
    const sel = document.getElementById('select-screen');
    const b = document.getElementById(BTN_ID);
    const onSelect = sel && !sel.classList.contains('hidden');
    const overlayOpen = !!document.getElementById(OVERLAY_ID);
    const shouldShow = isEnabled() && onSelect && anyUnlocked() && !overlayOpen;
    if (shouldShow) {
      const btn = b || ensureButton();
      btn.classList.add('visible');
    } else if (b) {
      b.classList.remove('visible');
    }
  }

  // ---------------------------------------------------------------
  function renderRow(entry, isEnding) {
    const { id, card, charId } = entry;
    const seen = isCardSeen(id, isEnding);
    const row = document.createElement('div');
    row.className = 'mg-row' + (seen ? '' : ' locked');

    const thumb = document.createElement('img');
    thumb.className = 'mg-thumb';
    thumb.src = CHAR_PORTRAIT[charId] || '';
    thumb.onerror = () => { thumb.style.background = '#332050'; thumb.removeAttribute('src'); };
    row.appendChild(thumb);

    const text = document.createElement('div');
    text.className = 'mg-text';
    const t1 = document.createElement('div');
    t1.className = 't1';
    t1.textContent = seen ? (card.subtitle || card.title || id) : '\u2014 locked \u2014';
    const t2 = document.createElement('div');
    t2.className = 't2';
    t2.textContent = isEnding ? 'ENDING' : 'MEMORY';
    text.appendChild(t1);
    text.appendChild(t2);
    row.appendChild(text);

    const btn = document.createElement('button');
    btn.className = 'mg-play';
    btn.textContent = seen ? 'Replay' : 'Locked';
    btn.disabled = !seen;
    if (seen) {
      btn.addEventListener('click', () => {
        closeGallery();
        setTimeout(() => {
          try { window.MSCard.playSample(id); } catch (_) {}
        }, 380);
      });
    }
    row.appendChild(btn);
    return row;
  }

  function groupByChar(entries) {
    const grouped = {};
    entries.forEach(e => {
      const key = e.charId || 'unknown';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(e);
    });
    return grouped;
  }

  function renderList(listEl, entries, isEnding) {
    listEl.innerHTML = '';
    const unlocked = entries.filter(e => isCardSeen(e.id, isEnding));
    if (!unlocked.length) {
      const empty = document.createElement('div');
      empty.className = 'mg-empty';
      empty.textContent = isEnding
        ? 'No endings yet. Reach day 8 with any character.'
        : 'No memories yet. Keep playing \u2014 they\u2019ll surface naturally.';
      listEl.appendChild(empty);
      return;
    }
    const grouped = groupByChar(entries);
    Object.keys(CHAR_PRETTY).forEach(charId => {
      const list = grouped[charId];
      if (!list) return;
      const hasAnySeen = list.some(e => isCardSeen(e.id, isEnding));
      if (!hasAnySeen) return;  // don't show character blocks with zero unlocks
      const block = document.createElement('div');
      block.className = 'mg-char-block';
      const name = document.createElement('div');
      name.className = 'mg-char-name';
      name.textContent = CHAR_PRETTY[charId];
      block.appendChild(name);
      list.forEach(e => block.appendChild(renderRow(e, isEnding)));
      listEl.appendChild(block);
    });
  }

  // ---------------------------------------------------------------
  function openGallery() {
    if (document.getElementById(OVERLAY_ID)) return;
    const { memories, endings } = catalog();

    const root = document.createElement('div');
    root.id = OVERLAY_ID;

    const head = document.createElement('div');
    head.className = 'mg-head';
    head.innerHTML = '<div class="mg-title">\u2726 MEMORIES</div>';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mg-close';
    closeBtn.textContent = 'close';
    closeBtn.addEventListener('click', closeGallery);
    head.appendChild(closeBtn);
    root.appendChild(head);

    const tabs = document.createElement('div');
    tabs.className = 'mg-tabs';
    const tabMem = document.createElement('button');
    tabMem.className = 'mg-tab active';
    tabMem.textContent = 'Memory Cards';
    const tabEnd = document.createElement('button');
    tabEnd.className = 'mg-tab';
    tabEnd.textContent = 'Endings';
    tabs.appendChild(tabMem);
    tabs.appendChild(tabEnd);
    root.appendChild(tabs);

    const list = document.createElement('div');
    list.className = 'mg-list';
    root.appendChild(list);

    const showTab = (which) => {
      tabMem.classList.toggle('active', which === 'mem');
      tabEnd.classList.toggle('active', which === 'end');
      renderList(list, which === 'mem' ? memories : endings, which === 'end');
    };
    tabMem.addEventListener('click', () => showTab('mem'));
    tabEnd.addEventListener('click', () => showTab('end'));
    showTab('mem');

    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('visible'));
  }

  function closeGallery() {
    const root = document.getElementById(OVERLAY_ID);
    if (!root) return;
    root.classList.remove('visible');
    setTimeout(() => { try { root.remove(); } catch (_) {} }, 440);
  }

  // ---------------------------------------------------------------
  function boot() {
    if (!window.MSCard) return;
    injectStyles();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setInterval(maybeShowButton, POLL_MS));
    } else {
      setInterval(maybeShowButton, POLL_MS);
    }
    setTimeout(maybeShowButton, 500);
  }

  boot();

  window.MSGallery = {
    open: openGallery,
    close: closeGallery,
    catalog,
    anyUnlocked
  };
})();
