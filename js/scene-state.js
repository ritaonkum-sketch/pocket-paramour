// ============================================================================
// SCENE-STATE AUTHORITY (Jun 2026)
// ----------------------------------------------------------------------------
// One place that owns "which screen is the player on?"
//
// THE PROBLEM IT SOLVES
// Game has ~30 floating UI widgets (whisper bubbles, daily chips, care
// progress, ambient thoughts, etc.) that live at position:fixed on
// <body>. Most are care-page-only but historically each had its own
// hand-rolled visibility guard or no guard at all — so widgets bled
// onto title / loading / select screens during transitions and
// background ticks.
//
// HOW IT WORKS
// <body> always carries exactly one of:
//   body.pp-screen-title
//   body.pp-screen-loading
//   body.pp-screen-world-intro
//   body.pp-screen-select
//   body.pp-screen-care
//
// CSS rules in title.css use body.pp-screen-care to gate every
// floating care-widget. Default = hidden. The scene class is the
// single source of truth.
//
// AUTO-DETECTION via MutationObserver
// Rather than asking every screen-swap site in game.js to call us,
// we watch the .hidden class on the five top-level screen
// containers. Any toggle triggers a re-detect. This means new
// transition paths added later get correct scene-state for free.
//
// PUBLIC API
//   window.PPScene.set(name)  — manually force a scene (rarely needed)
//   window.PPScene.get()      — read the active scene name
// ============================================================================
(function () {
    'use strict';

    // Ordered by precedence — first match wins. Overlays beat
    // base screens: world-intro and loading are full-screen
    // overlays that can sit on top of select or care, so they take
    // priority. Otherwise the body class would stay on the screen
    // underneath and CSS gates wouldn't fire correctly during
    // prologue replays from the chronicle.
    var SCREENS = [
        { name: 'world-intro', id: 'world-intro' },   // overlay — beats anything beneath
        { name: 'loading',     id: 'loading-screen' },// overlay — beats anything beneath
        { name: 'title',       id: 'title-screen' },  // boot screen — beats care/select
        { name: 'care',        id: 'game-container' },
        { name: 'select',      id: 'select-screen' }
    ];

    var CLASS_PREFIX = 'pp-screen-';
    var CURRENT = null;

    // ── Setter ──────────────────────────────────────────────────────
    function setActiveScreen(name) {
        if (name === CURRENT) return;
        var body = document.body;
        if (!body) return;
        SCREENS.forEach(function (s) {
            body.classList.toggle(CLASS_PREFIX + s.name, s.name === name);
        });
        CURRENT = name;

        // ── Hard cleanup of transient care-only bubbles when leaving
        // care. Without this, an in-flight whisper / thought bubble
        // could linger as an orphan DOM node on the select screen.
        // CSS hides it via body.pp-screen-X selectors, but the DOM
        // node staying around can cause stale-state bugs when the
        // player returns to care. Remove them outright.
        if (name !== 'care') {
            var transientIds = [
                'ew-whisper', 'noir-whisper', 'cc-bubble',
                'adaptive-thought', 'pp-multirom-bubble',
                'pp-aenor-bubble', 'pp-care-thread-toast',
                'date-unlock-toast', 'ad-toast', 'ms-locked-hint'
            ];
            transientIds.forEach(function (id) {
                var el = document.getElementById(id);
                if (el && el.parentNode) {
                    try { el.parentNode.removeChild(el); } catch (_) {}
                }
            });
            // Any number of these may exist
            document.querySelectorAll('.pp-idle-thought').forEach(function (el) {
                if (el.parentNode) {
                    try { el.parentNode.removeChild(el); } catch (_) {}
                }
            });
        }

        // Optional: fire a custom event so other scripts can react
        try {
            document.dispatchEvent(new CustomEvent('pp:scene-change', {
                detail: { scene: name }
            }));
        } catch (_) {}
    }

    function getActiveScreen() { return CURRENT; }

    // ── Detection — walk screens in precedence order ────────────────
    function detect() {
        for (var i = 0; i < SCREENS.length; i++) {
            var s = SCREENS[i];
            var el = document.getElementById(s.id);
            if (!el) continue;
            // .hidden class is the standard hide convention across the app
            if (el.classList.contains('hidden')) continue;
            // Computed display matters too — some screens hide via display
            // chains rather than the .hidden class
            var cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
            if (cs && (cs.display === 'none' || cs.visibility === 'hidden')) continue;
            return setActiveScreen(s.name);
        }
        // Nothing visible via the base screens. Before defaulting to 'title',
        // check whether an OVERLAY is currently covering the base screen (the
        // Daily page, gallery, settings, a scene card, a date, etc.). Those set
        // body.pp-overlay-active (or register with PPOverlay), and their CSS
        // hides #select-screen / #game-container while they are up — so detect()
        // sees nothing and would wrongly conclude 'title'. That flip to
        // pp-screen-title reveals the empty title screen underneath, and when the
        // overlay closes the base screen never comes back: the "black screen
        // after the Daily page / dates glitch" bug. The underlying scene has NOT
        // changed while an overlay is up, so preserve it; the overlay's own close
        // re-reveals the base screen and re-fires detect() correctly.
        var overlayUp = document.body.classList.contains('pp-overlay-active') ||
            (window.PPOverlay && typeof window.PPOverlay.anyOpen === 'function' && window.PPOverlay.anyOpen());
        if (overlayUp && CURRENT) return;
        // Jul 2026 playtest fix — mid-play transitions (care → select, overlay
        // teardown races) can leave a 1-tick window where NOTHING is visible
        // and no overlay is registered. Flipping to 'title' there is always
        // wrong once the player is past boot: it desyncs every pp-screen-*
        // CSS gate and contributed to the black-screen deadlock. Hold the
        // last known scene instead; the next real screen change re-detects.
        if (CURRENT === 'care' || CURRENT === 'select') return;
        // Truly nothing visible (boot / hard transition) — default to title.
        setActiveScreen('title');
    }

    // ── Observe class changes on each screen container ──────────────
    function wireObservers() {
        if (typeof MutationObserver !== 'function') return;
        SCREENS.forEach(function (s) {
            var el = document.getElementById(s.id);
            if (!el) return;
            var obs = new MutationObserver(detect);
            obs.observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
        });
        // Also re-detect on ANY body-class change. Transient guard classes
        // (cinematic-transition, pp-chapter-active, pp-overlay-active, …)
        // change which screen is actually visible WITHOUT toggling a screen
        // container's own class — so watching the containers alone misses
        // them. The old guard only re-detected when the screen-class count
        // was off, which left the scene stale after, e.g., cinematic-
        // transition cleared on the title→select hand-off (the screen was
        // hidden when detect last ran, so it had defaulted to 'title' and
        // never re-checked). Aug 2026: this surfaced once the bleed fix made
        // #select-screen hide INSTANTLY under those guards instead of
        // lingering visible for 0.8s, which detect() had been relying on.
        // Re-entrancy guard: our own setActiveScreen() toggles body classes;
        // it no-ops when the scene is unchanged, and _detecting suppresses
        // the self-induced mutation, so there is no loop.
        var _detecting = false;
        var bodyObs = new MutationObserver(function () {
            if (_detecting) return;
            _detecting = true;
            try { detect(); } finally { _detecting = false; }
        });
        bodyObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    function boot() {
        wireObservers();
        detect();
        // Safety-net re-detect. Several guards hide/reveal the base screens
        // through computed style or element add/remove — e.g. the onboarding
        // overlay (body:has(#pp-onboarding-overlay)) and chapter overlays —
        // which MutationObservers on the screen containers can't see. When
        // such a guard clears, nothing fires detect(), so the scene label
        // could otherwise stay stale (e.g. stuck on 'title' after the title
        // cinematic + onboarding, which suppressed the announce popup and the
        // first-care hint). A cheap 1s tick keeps it correct no matter how a
        // guard clears. detect() no-ops when the scene is unchanged.
        try { setInterval(detect, 1000); } catch (_) {}
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    window.PPScene = {
        set: setActiveScreen,
        get: getActiveScreen,
        // For debugging / testing
        _screens: SCREENS.map(function (s) { return s.name; })
    };
})();
