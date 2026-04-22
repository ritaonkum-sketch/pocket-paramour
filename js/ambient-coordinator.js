/* ==========================================================================
   AMBIENT COORDINATOR — single source of truth for head-area text overlap
   --------------------------------------------------------------------------
   WHY THIS EXISTS
   Pocket Paramour has several ambient text systems that can appear near the
   character's head:
       #cc-bubble         — cross-char jealousy reaction
       #noir-whisper      — Noir's post-meet aside
       #ew-whisper        — unattributed early (pre-Noir-met) atmosphere
       #adaptive-thought  — Thompson-sampled character thought

   Each module tries to suppress itself when something else is showing, but
   race conditions produce visible stacking or flicker. This coordinator fixes
   that at the DOM level — a single MutationObserver that enforces:

       - Only ONE head-area bubble visible at a time.
       - Priority order: cc-bubble  >  noir-whisper  >  ew-whisper  >  adaptive-thought
       - A higher-priority arrival dismisses a lower-priority incumbent.
       - A lower-priority arrival is suppressed while a higher incumbent shows.

   Additive — no edits to any existing module. Suppressed elements are
   removed from the DOM immediately; the originating module's timers still
   run, but its rendering is void this round. Modules that re-attempt on a
   poll (whispers, adaptive-thoughts) naturally retry later.

   Also exposes window.PPAmbient for future modules to cooperate with the
   lock proactively: PPAmbient.busy(), PPAmbient.top(), PPAmbient.clear(id).
   ========================================================================== */

(function () {
    'use strict';

    // Priority descending — index 0 is highest priority.
    // Each entry: { id: DOM id, name: short label for logs }
    const BUBBLES = [
        { id: 'cc-bubble',        name: 'cross-char' },
        { id: 'noir-whisper',     name: 'noir-whisper' },
        { id: 'ew-whisper',       name: 'early-whisper' },
        { id: 'adaptive-thought', name: 'adaptive-thought' }
    ];

    function rankOf(id) {
        for (let i = 0; i < BUBBLES.length; i++) if (BUBBLES[i].id === id) return i;
        return -1;
    }

    function currentlyVisible() {
        // Returns the highest-priority visible bubble's entry, or null.
        for (const b of BUBBLES) {
            const el = document.getElementById(b.id);
            if (el && isVisible(el)) return { ...b, el };
        }
        return null;
    }

    function isVisible(el) {
        if (!el || !el.isConnected) return false;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        // Many modules fade in by toggling a class; we treat a 0-opacity element
        // that IS in the DOM and transitioning as "about to show" — count it.
        return true;
    }

    function dismiss(el) {
        if (!el || !el.parentNode) return;
        // Try to let whatever animation the module is running finish gracefully.
        el.classList.remove('show', 'ew-show', 'ad-show'); // common class names
        el.style.transition = 'opacity 240ms ease';
        el.style.opacity = '0';
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 260);
    }

    let enforcing = false;
    function enforce() {
        // Guard against re-entry from our own DOM mutations.
        if (enforcing) return;
        enforcing = true;
        try {
            // Collect all visible bubbles with their ranks.
            const present = [];
            for (const b of BUBBLES) {
                const el = document.getElementById(b.id);
                if (el && isVisible(el)) present.push({ ...b, el, rank: rankOf(b.id) });
            }
            if (present.length <= 1) return;

            // Keep only the highest-priority (lowest rank number).
            present.sort((a, b) => a.rank - b.rank);
            const keep = present[0];
            for (let i = 1; i < present.length; i++) {
                // Never touch the "kept" element. Dismiss everything below it.
                dismiss(present[i].el);
            }
            // Optional: uncomment for debugging.
            // console.info('[ambient-coordinator] kept', keep.name, '— dismissed', present.slice(1).map(p=>p.name).join(','));
        } finally {
            // Release on next tick so our own removals aren't re-processed.
            setTimeout(() => { enforcing = false; }, 0);
        }
    }

    // --- Observer ------------------------------------------------------------
    // Watches the whole body subtree for added nodes. Cheap: we only react
    // when a known-id element appears.
    function startObserver() {
        const obs = new MutationObserver(mutations => {
            let relevant = false;
            for (const m of mutations) {
                if (m.type !== 'childList') continue;
                for (const n of m.addedNodes) {
                    if (n.nodeType !== 1) continue;
                    if (n.id && rankOf(n.id) !== -1) { relevant = true; break; }
                    // A module might insert a wrapper that contains the target.
                    if (n.querySelector) {
                        for (const b of BUBBLES) {
                            if (n.querySelector('#' + b.id)) { relevant = true; break; }
                        }
                    }
                    if (relevant) break;
                }
                if (relevant) break;
            }
            if (relevant) enforce();
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    // --- Public API ----------------------------------------------------------
    window.PPAmbient = {
        // Is any ambient bubble currently showing? Future modules should
        // check this before rendering and back off if true.
        busy() { return !!currentlyVisible(); },
        // Which one is on top?
        top() {
            const cur = currentlyVisible();
            return cur ? cur.name : null;
        },
        // Force-clear a specific bubble by id.
        clear(id) {
            const el = document.getElementById(id);
            if (el) dismiss(el);
        },
        // Re-run enforcement manually (e.g., after a race).
        enforce,
        // Rank introspection.
        rank: rankOf,
        priority: BUBBLES.map(b => b.name)
    };

    // --- Boot ----------------------------------------------------------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserver, { once: true });
    } else {
        startObserver();
    }
})();
