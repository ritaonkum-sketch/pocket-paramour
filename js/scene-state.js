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
        // Nothing visible — default to title (boot state)
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
        // Also catch any unexpected body-class toggles that might
        // override us — re-detect on next macrotask.
        var bodyObs = new MutationObserver(function () {
            // Only re-detect if a screen-class is missing or duplicated,
            // not on every body class change (would loop with our own
            // setter). Cheap guard:
            var classes = document.body.className;
            var screenClassCount = 0;
            SCREENS.forEach(function (s) {
                if (classes.indexOf(CLASS_PREFIX + s.name) >= 0) screenClassCount++;
            });
            if (screenClassCount !== 1) detect();
        });
        bodyObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    function boot() {
        wireObservers();
        detect();
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
