/* dev-panel.js \u2014 playtest + debug control surface
 * ============================================================================
 * WHAT THIS IS:
 *   A hidden overlay for the owner (and any tester) to navigate the game's
 *   content mesh quickly. Without this, verifying that every scene fires
 *   correctly would take hours per route. With this, any scene can be
 *   triggered on demand.
 *
 * HOW TO OPEN (three options):
 *   1. URL param: append ?dev=1 to the game URL.
 *   2. localStorage flag: set pp_dev_panel = '1' once. Persists.
 *   3. Triple-tap the TOP-RIGHT corner (mobile-friendly, hidden).
 *
 * WHAT IT DOES:
 *   - Overview: main-story chapter progression, Weaver state, champion.
 *   - Characters: per-character affection slider, TP choice, met/midnight
 *     flags, force-ending button.
 *   - Scenes: one-click force-fire for EVERY auto-firing scene in the game
 *     (meet-cutes, turning points, crossovers, the Weaver's Court, endings).
 *   - Storage: raw localStorage dump + reset.
 *
 * SAFETY CONTRACT:
 *   Purely additive. Does not modify any existing module. Only reads and
 *   writes localStorage flags, and calls existing modules' public force()
 *   methods. Hidden from normal players behind the activation gate.
 *
 *   CRITICAL: this panel is a testing tool. It writes flags that normal
 *   play would earn over hours. Do not leave pp_dev_panel = '1' in a
 *   production build shipped to real users. payments-guard.js refuses
 *   purchases when production is detected, but dev-panel writes do not
 *   trigger that guard.
 * ============================================================================
 */

(function () {
  'use strict';

  const CHARS = ['alistair','elian','lyra','caspian','lucien','noir','proto'];
  const PRETTY = {
    alistair: 'Alistair', elian: 'Elian', lyra: 'Lyra',
    caspian: 'Caspian', lucien: 'Lucien', noir: 'Noir', proto: 'Proto'
  };

  // --- Storage helpers ------------------------------------------------------
  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (_) {} }

  // --- Activation gate ------------------------------------------------------
  function shouldActivate() {
    try {
      const url = new URL(location.href);
      if (url.searchParams.get('dev') === '1') {
        lsSet('pp_dev_panel', '1');
        return true;
      }
    } catch (_) {}
    return lsGet('pp_dev_panel') === '1';
  }

  // Triple-tap top-right activator (for mobile without URL params)
  function installTripleTapActivator() {
    let taps = 0, last = 0;
    document.addEventListener('click', (e) => {
      const w = window.innerWidth, h = window.innerHeight;
      if (e.clientX < w - 80 || e.clientY > 80) { taps = 0; return; }
      const now = Date.now();
      if (now - last > 800) taps = 0;
      last = now;
      taps++;
      if (taps >= 3) {
        taps = 0;
        lsSet('pp_dev_panel', '1');
        location.reload();
      }
    }, true);
  }

  // --- Scene registry -------------------------------------------------------
  // Each entry: { id, label, category, force: fn, seenFlag?, conditions?() }
  const SCENES = [
    // Main story chapters \u2014 handled via MSChapters
    ...[0,1,2,3,4,5,6,7,8,10,11,12,13,14].map(id => ({
      id: 'chapter_' + id,
      label: 'Chapter ' + id,
      category: 'chapters',
      seenFlag: 'pp_chapter_done_' + id,
      force: () => window.MSChapters && window.MSChapters.playChapter && window.MSChapters.playChapter(id)
    })),

    // Encounters (meet-cutes)
    { id: 'enc_alistair', label: 'Meet: Alistair',  category: 'encounters', seenFlag: 'pp_ms_encounter_alistair_seen', force: () => window.MSEncounterAlistair && window.MSEncounterAlistair.play && window.MSEncounterAlistair.play() },
    { id: 'enc_elian',    label: 'Meet: Elian',     category: 'encounters', seenFlag: 'pp_ms_encounter_elian_seen',    force: () => window.MSEncounterElian    && window.MSEncounterElian.play    && window.MSEncounterElian.play() },
    { id: 'enc_lyra',     label: 'Meet: Lyra',      category: 'encounters', seenFlag: 'pp_ms_encounter_lyra_seen',     force: () => window.MSEncounterLyra     && window.MSEncounterLyra.play     && window.MSEncounterLyra.play() },
    { id: 'enc_caspian',  label: 'Meet: Caspian',   category: 'encounters', seenFlag: 'pp_ms_encounter_caspian_seen',  force: () => window.MSEncounterCaspian  && window.MSEncounterCaspian.play  && window.MSEncounterCaspian.play() },
    { id: 'enc_lucien',   label: 'Meet: Lucien',    category: 'encounters', seenFlag: 'pp_ms_encounter_lucien_seen',   force: () => window.MSEncounterLucien   && window.MSEncounterLucien.play   && window.MSEncounterLucien.play() },
    { id: 'enc_noir',     label: 'Meet: Noir',      category: 'encounters', seenFlag: 'pp_ms_encounter_noir_seen',     force: () => window.MSEncounterNoir     && window.MSEncounterNoir.play     && window.MSEncounterNoir.play() },
    { id: 'enc_proto',    label: 'Meet: Proto',     category: 'encounters', seenFlag: 'pp_ms_encounter_proto_seen',    force: () => window.MSEncounterProto    && window.MSEncounterProto.play    && window.MSEncounterProto.play() },
    { id: 'enc_rescue',   label: 'Thornwood Rescue (Elian)', category: 'encounters', seenFlag: 'pp_elian_rescue_seen',
      force: () => window.MSEncounterElianRescue && window.MSEncounterElianRescue.force && window.MSEncounterElianRescue.force() },

    // Crossovers
    { id: 'cross_lyra_lucien',   label: 'The Staffs (Lyra \u00d7 Lucien)',    category: 'crossovers', seenFlag: 'pp_cross_lyra_lucien_seen',
      force: () => window.MSCrossLyraLucien && window.MSCrossLyraLucien.force && window.MSCrossLyraLucien.force() },
    { id: 'cross_noir_elian',    label: 'The Two Who Loved Her (Noir \u00d7 Elian)', category: 'crossovers', seenFlag: 'pp_cross_noir_elian_seen',
      force: () => window.MSCrossNoirElian && window.MSCrossNoirElian.force && window.MSCrossNoirElian.force() },
    { id: 'cross_noir_lyra',     label: 'The Song (Noir \u00d7 Lyra)',         category: 'crossovers', seenFlag: 'pp_cross_noir_lyra_seen',
      force: () => window.MSCrossNoirLyra && window.MSCrossNoirLyra.force && window.MSCrossNoirLyra.force() },
    { id: 'cross_caspian_noir',  label: 'The Mirror Princes (Caspian \u00d7 Noir)', category: 'crossovers', seenFlag: 'pp_cross_caspian_noir_seen',
      force: () => window.MSCrossCaspianNoir && window.MSCrossCaspianNoir.force && window.MSCrossCaspianNoir.force() },
    { id: 'cross_elian_lyra',    label: 'The Debt (Elian \u00d7 Lyra)',        category: 'crossovers', seenFlag: 'pp_cross_elian_lyra_seen',
      force: () => window.MSCrossElianLyra && window.MSCrossElianLyra.force && window.MSCrossElianLyra.force() },
    { id: 'cross_lucien_aenor',  label: 'The Tower (Lucien \u00d7 Aenor)',     category: 'crossovers', seenFlag: 'pp_cross_lucien_aenor_seen',
      force: () => window.MSCrossLucienAenor && window.MSCrossLucienAenor.force && window.MSCrossLucienAenor.force() },
    { id: 'cross_weavers_court', label: "The Weaver's Court (ensemble)", category: 'crossovers', seenFlag: 'pp_cross_weavers_court_seen',
      force: () => window.MSCrossWeaversCourt && window.MSCrossWeaversCourt.force && window.MSCrossWeaversCourt.force() },

    // Endings (route-specific \u2014 per character, fires the computed ending)
    ...CHARS.map(c => ({
      id: 'end_' + c,
      label: 'Ending: ' + PRETTY[c] + ' (auto-pick by route flags)',
      category: 'endings',
      seenFlag: 'pp_epi_seen_' + c,
      force: () => window.MSEpilogues && window.MSEpilogues.play && window.MSEpilogues.play(c)
    })),

    // Turning points
    ...CHARS.map(c => ({
      id: 'tp_' + c,
      label: 'Turning Point: ' + PRETTY[c],
      category: 'turningpoints',
      seenFlag: 'pp_tp_' + c + '_seen',
      force: () => window.TurningPoints && window.TurningPoints.force && window.TurningPoints.force(c)
    }))
  ];

  const CATEGORY_LABELS = {
    chapters: 'Main Story Chapters',
    encounters: 'Meet-cutes + Rescue',
    turningpoints: 'Turning Points',
    crossovers: 'Crossover Scenes',
    endings: 'Route Endings'
  };

  // --- Affection helpers ----------------------------------------------------
  function getAffection(c) {
    const v = lsGet('pp_affection_' + c);
    if (v != null) return parseInt(v, 10) || 0;
    const alt = lsGet(c + '_affection');
    return alt == null ? 0 : (parseInt(alt, 10) || 0);
  }
  function setAffection(c, n) {
    lsSet('pp_affection_' + c, String(n));
    lsSet(c + '_affection', String(n));
  }

  function getTP(c)  { return lsGet('pp_tp_' + c + '_choice') || ''; }
  function setTP(c, v) { if (v) lsSet('pp_tp_' + c + '_choice', v); else lsDel('pp_tp_' + c + '_choice'); }

  // Per-character turning point options
  const TP_OPTIONS = {
    alistair: [{ id: 'go', label: 'go' }, { id: 'stay', label: 'stay' }],
    elian:    [{ id: 'carve', label: 'carve' }, { id: 'leave', label: 'leave' }],
    lyra:     [{ id: 'answer', label: 'answer' }, { id: 'refuse', label: 'refuse' }],
    caspian:  [{ id: 'yes', label: 'yes' }, { id: 'no', label: 'no' }],
    lucien:   [{ id: 'stop', label: 'stop' }, { id: 'let', label: 'let burn' }],
    noir:     [{ id: 'yes', label: 'yes' }, { id: 'no', label: 'no' }],
    proto:    [{ id: 'erase', label: 'erase' }, { id: 'keep', label: 'keep' }]
  };

  // --- UI ------------------------------------------------------------------
  let _root = null;
  let _tabId = 'overview';

  function injectStyles() {
    if (document.getElementById('pp-dev-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-dev-styles';
    s.textContent = `
      #pp-dev-fab {
        position:fixed; bottom:16px; right:16px; z-index:99990;
        width:44px; height:44px; border-radius:50%;
        background:linear-gradient(180deg,#2a1f3f,#110a1e);
        color:#e8d8ff; font-family:monospace; font-weight:700;
        font-size:14px; border:1px solid rgba(200,170,255,0.4);
        cursor:pointer; display:flex; align-items:center; justify-content:center;
        box-shadow:0 4px 16px rgba(0,0,0,0.5);
        opacity:0.8; transition:opacity 180ms, transform 180ms;
      }
      #pp-dev-fab:hover { opacity:1; transform:scale(1.06); }
      #pp-dev-overlay {
        position:fixed; inset:0; z-index:99995;
        background:rgba(8,4,16,0.94); backdrop-filter:blur(4px);
        display:none; flex-direction:column;
        font-family:system-ui,-apple-system,sans-serif;
        color:#e8e0f2;
      }
      #pp-dev-overlay.open { display:flex; }
      #pp-dev-header {
        padding:12px 16px; display:flex; align-items:center; gap:12px;
        border-bottom:1px solid rgba(200,170,240,0.15);
        background:rgba(20,14,34,0.8);
      }
      #pp-dev-header h2 {
        font-size:15px; letter-spacing:2px; margin:0; font-weight:600;
        color:#e8d8ff;
      }
      #pp-dev-header .spacer { flex:1; }
      #pp-dev-header button {
        background:rgba(255,255,255,0.08); color:#e8d8ff;
        border:0; border-radius:14px; padding:6px 12px;
        font-size:12px; cursor:pointer;
      }
      #pp-dev-tabs {
        display:flex; gap:4px; padding:8px 16px;
        background:rgba(12,8,22,0.9);
        border-bottom:1px solid rgba(200,170,240,0.1);
      }
      #pp-dev-tabs button {
        background:rgba(255,255,255,0.04); color:#c8b8d8;
        border:0; border-radius:14px; padding:8px 16px;
        font-size:13px; cursor:pointer; transition:background 180ms;
      }
      #pp-dev-tabs button.active {
        background:linear-gradient(180deg,#5b3f8a,#3a2660);
        color:#fff;
      }
      #pp-dev-body {
        flex:1; overflow-y:auto; padding:16px;
      }
      .pp-dev-section {
        margin-bottom:20px; background:rgba(255,255,255,0.03);
        border-radius:12px; padding:14px;
      }
      .pp-dev-section h3 {
        font-size:13px; letter-spacing:2px; margin:0 0 10px 0;
        color:#d8c8f0; font-weight:600; text-transform:uppercase;
      }
      .pp-dev-row {
        display:flex; align-items:center; gap:10px;
        padding:6px 0; font-size:13px;
      }
      .pp-dev-row .label { flex:1; color:#d8d0e8; }
      .pp-dev-row .status {
        font-size:11px; padding:2px 8px; border-radius:10px;
        letter-spacing:1px; font-weight:600;
      }
      .pp-dev-row .status.seen     { background:rgba(120,200,140,0.25); color:#a8e8c0; }
      .pp-dev-row .status.unseen   { background:rgba(200,200,200,0.12); color:#b8b0d0; }
      .pp-dev-row button {
        background:linear-gradient(180deg,#4a2f6a,#2a1746);
        color:#fff; border:0; border-radius:10px;
        padding:5px 10px; font-size:12px; cursor:pointer;
      }
      .pp-dev-row button.ghost {
        background:rgba(255,255,255,0.06); color:#c0b0d8;
      }
      .pp-dev-row button.danger {
        background:linear-gradient(180deg,#6a2b2b,#40141b);
      }
      .pp-dev-char-card {
        background:rgba(255,255,255,0.04); border-radius:12px;
        padding:12px; margin-bottom:10px;
        border:1px solid rgba(200,170,240,0.08);
      }
      .pp-dev-char-card .char-name {
        font-weight:700; font-size:14px; color:#e8d8ff;
        margin-bottom:6px; letter-spacing:1px;
      }
      .pp-dev-char-card .affection {
        display:flex; align-items:center; gap:10px; margin:6px 0;
      }
      .pp-dev-char-card input[type=range] {
        flex:1; accent-color:#a87fd8;
      }
      .pp-dev-char-card .aff-val {
        min-width:36px; text-align:right; font-family:monospace;
        color:#d8c8f0; font-size:13px;
      }
      .pp-dev-char-card .tp-row {
        display:flex; gap:4px; margin-top:6px;
      }
      .pp-dev-char-card .tp-row button {
        flex:1; padding:5px 8px; font-size:11px;
        border-radius:8px; border:0; cursor:pointer;
        background:rgba(255,255,255,0.05); color:#c0b0d8;
      }
      .pp-dev-char-card .tp-row button.active {
        background:linear-gradient(180deg,#5b3f8a,#3a2660); color:#fff;
      }
      .pp-dev-char-card .actions {
        display:flex; gap:6px; margin-top:8px;
      }
      .pp-dev-char-card .actions button {
        flex:1; font-size:11px;
      }
      #pp-dev-storage {
        font-family:monospace; font-size:11px;
        background:rgba(0,0,0,0.35); padding:10px;
        border-radius:8px; white-space:pre-wrap;
        max-height:50vh; overflow-y:auto; color:#c8c0d8;
      }
    `;
    document.head.appendChild(s);
  }

  // FAB (floating action button) \u2014 visible always when panel is active
  function buildFab() {
    if (document.getElementById('pp-dev-fab')) return;
    const fab = document.createElement('button');
    fab.id = 'pp-dev-fab';
    fab.textContent = 'DEV';
    fab.title = 'Open dev panel';
    fab.addEventListener('click', openPanel);
    document.body.appendChild(fab);
  }

  function buildOverlay() {
    if (_root) return _root;
    const root = document.createElement('div');
    root.id = 'pp-dev-overlay';

    const header = document.createElement('div');
    header.id = 'pp-dev-header';
    const title = document.createElement('h2'); title.textContent = 'POCKET PARAMOUR \u00b7 DEV PANEL';
    const spacer = document.createElement('div'); spacer.className = 'spacer';
    const closeBtn = document.createElement('button'); closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', closePanel);
    const disableBtn = document.createElement('button'); disableBtn.textContent = 'Disable';
    disableBtn.title = 'Turn off the dev panel entirely';
    disableBtn.addEventListener('click', () => {
      if (!confirm('Disable the dev panel? You will need to re-add ?dev=1 to the URL to get it back.')) return;
      lsDel('pp_dev_panel');
      location.reload();
    });
    header.appendChild(title); header.appendChild(spacer);
    header.appendChild(disableBtn); header.appendChild(closeBtn);

    const tabs = document.createElement('div');
    tabs.id = 'pp-dev-tabs';
    [['overview','Overview'],['characters','Characters'],['scenes','Scenes'],['storage','Storage']].forEach(([id, label]) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.dataset.tab = id;
      btn.addEventListener('click', () => { _tabId = id; renderBody(); updateTabs(); });
      tabs.appendChild(btn);
    });

    const body = document.createElement('div');
    body.id = 'pp-dev-body';

    root.appendChild(header); root.appendChild(tabs); root.appendChild(body);
    document.body.appendChild(root);
    _root = root;
    return root;
  }

  function updateTabs() {
    if (!_root) return;
    const tabs = _root.querySelector('#pp-dev-tabs');
    if (!tabs) return;
    [...tabs.children].forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === _tabId);
    });
  }

  // --- Tab renderers --------------------------------------------------------
  function renderBody() {
    if (!_root) return;
    const body = _root.querySelector('#pp-dev-body');
    body.innerHTML = '';
    if (_tabId === 'overview')   return renderOverview(body);
    if (_tabId === 'characters') return renderCharacters(body);
    if (_tabId === 'scenes')     return renderScenes(body);
    if (_tabId === 'storage')    return renderStorage(body);
  }

  function renderOverview(body) {
    // Main story enabled toggle
    const routeEnabled = lsGet('pp_main_story_enabled') === '1';
    const weaverRevealed = lsGet('pp_weaver_revealed') === '1';
    const champion = lsGet('pp_weaver_champion') || '';
    const currentCh = lsGet('pp_chapter_current') || '0';

    const sec = document.createElement('div'); sec.className = 'pp-dev-section';
    sec.innerHTML = '<h3>World State</h3>';
    body.appendChild(sec);

    sec.appendChild(row('Main-story route enabled', routeEnabled ? 'seen' : 'unseen', routeEnabled ? 'YES' : 'NO',
      { label: routeEnabled ? 'Disable' : 'Enable', cls: routeEnabled ? 'danger' : '',
        onClick: () => { lsSet('pp_main_story_enabled', routeEnabled ? '' : '1'); renderBody(); } }));

    sec.appendChild(row('Weaver identity revealed', weaverRevealed ? 'seen' : 'unseen', weaverRevealed ? 'REVEALED' : 'HIDDEN',
      { label: weaverRevealed ? 'Hide' : 'Reveal', cls: '',
        onClick: () => { lsSet('pp_weaver_revealed', weaverRevealed ? '' : '1'); renderBody(); } }));

    sec.appendChild(row("Weaver's Court champion", champion ? 'seen' : 'unseen', champion || 'NONE',
      { label: 'Clear', cls: 'ghost', onClick: () => { lsDel('pp_weaver_champion'); renderBody(); } }));

    // Chapters mini-list
    const chSec = document.createElement('div'); chSec.className = 'pp-dev-section';
    chSec.innerHTML = '<h3>Main Story Chapter Progress (current: ' + currentCh + ')</h3>';
    body.appendChild(chSec);
    [0,1,2,3,4,5,6,7,8,10,11,12,13,14].forEach(id => {
      const done = lsGet('pp_chapter_done_' + id) === '1';
      const r = row('Chapter ' + id, done ? 'seen' : 'unseen', done ? 'DONE' : 'pending',
        { label: done ? 'Un-mark' : 'Mark done',
          cls: done ? 'ghost' : '',
          onClick: () => { if (done) lsDel('pp_chapter_done_' + id); else lsSet('pp_chapter_done_' + id, '1'); renderBody(); } });
      chSec.appendChild(r);
    });

    // Quick resets
    const reset = document.createElement('div'); reset.className = 'pp-dev-section';
    reset.innerHTML = '<h3>Quick Resets</h3>';
    body.appendChild(reset);
    reset.appendChild(row('Reset all chapter progress', '', '',
      { label: 'Reset chapters', cls: 'danger',
        onClick: () => { [0,1,2,3,4,5,6,7,8,10,11,12,13,14].forEach(id => lsDel('pp_chapter_done_' + id)); lsSet('pp_chapter_current', '0'); renderBody(); }
      }));
    reset.appendChild(row('Reset all seen scenes (keep affection)', '', '',
      { label: 'Reset scene-seen', cls: 'danger',
        onClick: () => {
          SCENES.forEach(s => { if (s.seenFlag) lsDel(s.seenFlag); });
          CHARS.forEach(c => { lsDel('pp_epi_seen_' + c); });
          renderBody();
        }
      }));
    reset.appendChild(row('Full wipe (dangerous!)', '', '',
      { label: 'Wipe everything', cls: 'danger',
        onClick: () => {
          if (!confirm('Wipe ALL localStorage keys? This is irreversible. The dev panel will also turn off \u2014 re-add ?dev=1 to come back.')) return;
          try { Object.keys(localStorage).forEach(k => localStorage.removeItem(k)); } catch (_) {}
          location.reload();
        }
      }));
  }

  function renderCharacters(body) {
    const intro = document.createElement('div');
    intro.className = 'pp-dev-section';
    intro.innerHTML = '<h3>Per-Character Controls</h3><p style="font-size:12px;opacity:0.65;margin:0 0 8px 0;">Affection slider writes both <code>pp_affection_&lt;char&gt;</code> and <code>&lt;char&gt;_affection</code>. Turning-point choices unlock endings.</p>';
    body.appendChild(intro);

    CHARS.forEach(c => {
      const aff = getAffection(c);
      const tp  = getTP(c);
      const met = lsGet('pp_ms_encounter_' + c + '_seen') === '1' || lsGet('pp_met_' + c) === '1';
      const epiSeen = lsGet('pp_epi_seen_' + c) === '1';
      const endingKey = (window.MSEpilogues && window.MSEpilogues.keyFor) ? window.MSEpilogues.keyFor(c) : null;

      const card = document.createElement('div');
      card.className = 'pp-dev-char-card';

      const name = document.createElement('div');
      name.className = 'char-name';
      name.textContent = PRETTY[c].toUpperCase()
        + '  \u2014  ' + (met ? 'met' : 'not met')
        + (endingKey ? '  \u2014  ending: ' + endingKey : '')
        + (epiSeen ? '  (epi seen)' : '');
      card.appendChild(name);

      // Affection slider
      const affWrap = document.createElement('div'); affWrap.className = 'affection';
      const lbl = document.createElement('span'); lbl.textContent = 'Affection'; lbl.style.color = '#c0b0d8'; lbl.style.fontSize = '12px';
      const slider = document.createElement('input'); slider.type = 'range'; slider.min = '0'; slider.max = '100'; slider.value = String(aff);
      const val = document.createElement('span'); val.className = 'aff-val'; val.textContent = String(aff);
      slider.addEventListener('input', () => { val.textContent = slider.value; setAffection(c, parseInt(slider.value,10) || 0); });
      affWrap.appendChild(lbl); affWrap.appendChild(slider); affWrap.appendChild(val);
      card.appendChild(affWrap);

      // Quick-set affection buttons
      const quickAff = document.createElement('div'); quickAff.className = 'tp-row';
      [10, 25, 50, 75, 85, 90, 100].forEach(v => {
        const b = document.createElement('button');
        b.textContent = String(v);
        b.addEventListener('click', () => { slider.value = String(v); val.textContent = String(v); setAffection(c, v); });
        quickAff.appendChild(b);
      });
      card.appendChild(quickAff);

      // TP choice row
      const tpRow = document.createElement('div'); tpRow.className = 'tp-row';
      const tpLabel = document.createElement('span'); tpLabel.textContent = 'TP:'; tpLabel.style.color = '#c0b0d8'; tpLabel.style.fontSize = '11px'; tpLabel.style.padding = '5px 4px';
      tpRow.appendChild(tpLabel);
      (TP_OPTIONS[c] || []).forEach(opt => {
        const b = document.createElement('button');
        b.textContent = opt.label;
        if (tp === opt.id) b.classList.add('active');
        b.addEventListener('click', () => { setTP(c, opt.id); renderBody(); });
        tpRow.appendChild(b);
      });
      const clear = document.createElement('button'); clear.textContent = 'clear';
      clear.addEventListener('click', () => { setTP(c, ''); renderBody(); });
      tpRow.appendChild(clear);
      card.appendChild(tpRow);

      // Actions row
      const act = document.createElement('div'); act.className = 'actions';
      const mk = (label, fn, cls) => {
        const b = document.createElement('button');
        b.textContent = label;
        if (cls) b.classList.add(cls);
        b.addEventListener('click', fn);
        return b;
      };
      act.appendChild(mk('Force meet', () => {
        const cap = c.charAt(0).toUpperCase() + c.slice(1);
        const mod = window['MSEncounter' + cap];
        if (mod && mod.play) mod.play();
      }));
      act.appendChild(mk('Mark met', () => {
        lsSet('pp_met_' + c, '1');
        lsSet('pp_ms_encounter_' + c + '_seen', '1');
        renderBody();
      }, 'ghost'));
      act.appendChild(mk('Play ending', () => {
        if (window.MSEpilogues && window.MSEpilogues.play) window.MSEpilogues.play(c);
      }));
      act.appendChild(mk('Reset epi-seen', () => { lsDel('pp_epi_seen_' + c); renderBody(); }, 'ghost'));
      card.appendChild(act);

      // Champion toggle
      const champ = lsGet('pp_weaver_champion') === c;
      const champRow = document.createElement('div'); champRow.className = 'actions'; champRow.style.marginTop = '6px';
      champRow.appendChild(mk(champ ? 'Champion: YES (clear)' : 'Make champion',
        () => { if (champ) lsDel('pp_weaver_champion'); else lsSet('pp_weaver_champion', c); renderBody(); },
        champ ? '' : 'ghost'));
      card.appendChild(champRow);

      body.appendChild(card);
    });
  }

  function renderScenes(body) {
    const intro = document.createElement('div');
    intro.className = 'pp-dev-section';
    intro.innerHTML = '<h3>Scene Registry</h3><p style="font-size:12px;opacity:0.65;margin:0 0 8px 0;">Every auto-firing scene in the game. Click <b>Fire</b> to trigger immediately. Click <b>Reset seen</b> so the scene can re-fire.</p>';
    body.appendChild(intro);

    const categories = ['chapters','encounters','turningpoints','crossovers','endings'];
    categories.forEach(cat => {
      const sec = document.createElement('div'); sec.className = 'pp-dev-section';
      sec.innerHTML = '<h3>' + (CATEGORY_LABELS[cat] || cat) + '</h3>';
      body.appendChild(sec);

      SCENES.filter(s => s.category === cat).forEach(s => {
        const seen = s.seenFlag && lsGet(s.seenFlag) === '1';
        const r = row(s.label, seen ? 'seen' : 'unseen', seen ? 'seen' : 'unseen',
          { label: 'Fire',
            onClick: () => {
              try { s.force && s.force(); } catch (e) { alert('Fire failed: ' + (e.message || e)); }
            }
          }
        );
        if (s.seenFlag) {
          const reset = document.createElement('button');
          reset.className = 'ghost';
          reset.textContent = 'Reset seen';
          reset.style.marginLeft = '6px';
          reset.addEventListener('click', () => { lsDel(s.seenFlag); renderBody(); });
          r.appendChild(reset);
        }
        sec.appendChild(r);
      });
    });
  }

  function renderStorage(body) {
    const sec = document.createElement('div'); sec.className = 'pp-dev-section';
    sec.innerHTML = '<h3>localStorage Dump</h3>';
    body.appendChild(sec);
    const pre = document.createElement('div');
    pre.id = 'pp-dev-storage';
    const dump = {};
    try { Object.keys(localStorage).sort().forEach(k => { dump[k] = localStorage.getItem(k); }); } catch (_) {}
    pre.textContent = JSON.stringify(dump, null, 2);
    sec.appendChild(pre);

    const copy = document.createElement('button');
    copy.textContent = 'Copy to clipboard';
    copy.style.cssText = 'background:linear-gradient(180deg,#4a2f6a,#2a1746);color:#fff;border:0;border-radius:10px;padding:8px 14px;font-size:12px;cursor:pointer;margin-top:8px;';
    copy.addEventListener('click', () => {
      try { navigator.clipboard.writeText(pre.textContent); copy.textContent = 'Copied!'; setTimeout(() => copy.textContent = 'Copy to clipboard', 1200); } catch (_) {}
    });
    sec.appendChild(copy);
  }

  // --- Row helper ----------------------------------------------------------
  function row(labelText, statusCls, statusText, btnCfg) {
    const r = document.createElement('div'); r.className = 'pp-dev-row';
    const l = document.createElement('div'); l.className = 'label'; l.textContent = labelText;
    r.appendChild(l);
    if (statusText) {
      const s = document.createElement('span');
      s.className = 'status ' + (statusCls || '');
      s.textContent = statusText;
      r.appendChild(s);
    }
    if (btnCfg) {
      const b = document.createElement('button');
      b.textContent = btnCfg.label;
      if (btnCfg.cls) b.classList.add(btnCfg.cls);
      b.addEventListener('click', btnCfg.onClick);
      r.appendChild(b);
    }
    return r;
  }

  // --- Open / Close --------------------------------------------------------
  function openPanel() {
    buildOverlay();
    _root.classList.add('open');
    updateTabs();
    renderBody();
  }
  function closePanel() {
    if (_root) _root.classList.remove('open');
  }

  // --- Boot ---------------------------------------------------------------
  function boot() {
    installTripleTapActivator();
    if (!shouldActivate()) return;
    injectStyles();
    buildFab();
    // Public API
    window.PPDev = {
      open: openPanel,
      close: closePanel,
      scenes: SCENES,
      fire: (id) => { const s = SCENES.find(x => x.id === id); if (s && s.force) s.force(); },
      setAffection, getAffection, setTP, getTP,
      disable: () => { lsDel('pp_dev_panel'); location.reload(); }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
