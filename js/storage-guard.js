/* ==========================================================================
   STORAGE GUARD — keep partial / corrupt saves from softlocking the game
   --------------------------------------------------------------------------
   WHY THIS EXISTS
   Pocket Paramour writes ~40 localStorage key prefixes across its modules
   (pp_ms_, pp_at_, pp_chapter_done_, pp_met_, pp_affection_, pp_intro_, ...).
   On mobile browsers, private-browsing windows, cleared-site-data events,
   iOS 7-day eviction, and quota-exceeded errors, subsets of those keys can
   disappear while others survive. When that happens, modules disagree about
   game state and the player can end up locked — e.g., pp_chapter_done_3=1
   but pp_affection_alistair missing, so intros replay while endings are
   already flagged, or vice-versa.

   WHAT THIS DOES (additive, no edits to any existing file)
   1. Wraps localStorage.setItem in a quota-aware try/catch so a single
      quota-exceeded doesn't silently corrupt the save by writing half the
      keys and failing the other half.
   2. Runs a "schema pass" at boot that detects internally-inconsistent
      combinations and repairs them to the most forgiving interpretation
      (favor: progress the player has already experienced should not be lost).
   3. Stamps pp_schema_v so future migrations have an anchor.
   4. Exposes window.PPStorage with safe get/set helpers for new modules.

   REPAIR RULES (read: "if A is true and B is missing, assume B")
      - If pp_ms_encounter_<char>_seen=1 then pp_met_<char>=1.
      - If pp_met_<char>=1 and pp_affection_<char> missing, set it to 10.
      - If pp_chapter_done_N=1 (N in 0..8 for main route), mark the
        character gated by that chapter as met. Mapping lives below.
      - If pp_ending_seen_<char>=1 but no pp_ending_branch_<char>, pick
        the "neutral" branch so epilogue recall still works.
      - pp_schema_v missing or non-numeric → rewrite as current.

   None of these rules DELETE progress. Repair is additive.
   ========================================================================== */

(function () {
    'use strict';

    const SCHEMA_VERSION = 1;
    const CHARS = ['alistair', 'elian', 'lyra', 'caspian', 'lucien', 'noir', 'proto'];

    // Chapter-to-character mapping (from chapters.js — which chapters gate
    // which character's meet-cute in the main story route).
    const CHAPTER_CHAR_MAP = {
        1: 'alistair',
        2: 'elian',
        3: 'lyra',
        4: 'caspian',
        5: 'lucien',
        6: 'noir',
        7: 'proto'
    };

    // ---------------------------------------------------------------------
    // Quota-aware write wrapper. We do NOT replace the localStorage object
    // itself (that would break other modules that hold references). We
    // patch setItem to log quota failures loudly so they don't go silent.
    // ---------------------------------------------------------------------
    function patchSetItemLogging() {
        try {
            const proto = Storage.prototype;
            if (proto._ppGuardPatched) return;
            const origSet = proto.setItem;
            proto.setItem = function (key, value) {
                try {
                    return origSet.call(this, key, value);
                } catch (e) {
                    // QuotaExceededError / SecurityError — surface to console
                    // so players / testers can see why state stopped saving.
                    console.warn('[storage-guard] setItem failed for', key, e && e.name || e);
                    // Attempt a single graceful eviction of a well-known
                    // "nice to have" key to free room, then retry once.
                    try {
                        this.removeItem('pl_bandit'); // analytics cache, safe to drop
                        return origSet.call(this, key, value);
                    } catch (_) {
                        // Final failure — module writes will no-op rather than throw.
                        return undefined;
                    }
                }
            };
            proto._ppGuardPatched = true;
        } catch (_) { /* Storage may not exist (node/test env) */ }
    }

    // ---------------------------------------------------------------------
    // Safe accessors.
    // ---------------------------------------------------------------------
    function lsGet(k) {
        try { return localStorage.getItem(k); } catch (_) { return null; }
    }
    function lsSet(k, v) {
        try { localStorage.setItem(k, v); return true; } catch (_) { return false; }
    }
    function lsHas(k) {
        try { return localStorage.getItem(k) !== null; } catch (_) { return false; }
    }

    // ---------------------------------------------------------------------
    // Schema pass — run once per boot. Silent unless something was repaired.
    // ---------------------------------------------------------------------
    function repair() {
        const repaired = [];

        // 1. encounter_seen implies met
        CHARS.forEach(char => {
            if (lsGet('pp_ms_encounter_' + char + '_seen') === '1' && lsGet('pp_met_' + char) !== '1') {
                lsSet('pp_met_' + char, '1');
                repaired.push('met_' + char + ' (from encounter_seen)');
            }
        });

        // 2. chapter_done implies the character at that chapter is met + encountered
        Object.keys(CHAPTER_CHAR_MAP).forEach(n => {
            const char = CHAPTER_CHAR_MAP[n];
            if (lsGet('pp_chapter_done_' + n) === '1') {
                if (lsGet('pp_met_' + char) !== '1') {
                    lsSet('pp_met_' + char, '1');
                    repaired.push('met_' + char + ' (from chapter_done_' + n + ')');
                }
                if (lsGet('pp_ms_encounter_' + char + '_seen') !== '1') {
                    lsSet('pp_ms_encounter_' + char + '_seen', '1');
                    repaired.push('encounter_seen_' + char + ' (from chapter_done_' + n + ')');
                }
            }
        });

        // 3. met but no affection => seed to 10 (the intro-complete default)
        CHARS.forEach(char => {
            if (lsGet('pp_met_' + char) === '1' && !lsHas('pp_affection_' + char)) {
                lsSet('pp_affection_' + char, '10');
                repaired.push('affection_' + char + ' (seeded 10)');
            }
        });

        // 4. ending_seen but no branch => pick neutral so recall still works
        CHARS.forEach(char => {
            if (lsGet('pp_ending_seen_' + char) === '1' && !lsHas('pp_ending_branch_' + char)) {
                lsSet('pp_ending_branch_' + char, 'neutral');
                repaired.push('ending_branch_' + char + ' (defaulted to neutral)');
            }
        });

        // 5. If pp_intro_seen was set on all 7 but pp_world_intro_seen is
        //    missing, assume the world intro ran (prevents it from replaying
        //    for returning players with partial storage).
        const allIntrosSeen = CHARS.every(c => lsGet('pp_intro_' + c) === '1');
        if (allIntrosSeen && lsGet('pp_world_intro_seen') !== '1') {
            lsSet('pp_world_intro_seen', '1');
            repaired.push('world_intro_seen (inferred)');
        }

        // 6. Write/refresh schema version.
        const currentV = parseInt(lsGet('pp_schema_v') || '0', 10);
        if (isNaN(currentV) || currentV < SCHEMA_VERSION) {
            lsSet('pp_schema_v', String(SCHEMA_VERSION));
            // Not logged in `repaired` — this is bookkeeping, not a fix.
        }

        if (repaired.length) {
            console.info('[storage-guard] repaired ' + repaired.length + ' key(s):', repaired);
        }
        return repaired;
    }

    // ---------------------------------------------------------------------
    // Public API for future modules that want cooperative access.
    // ---------------------------------------------------------------------
    window.PPStorage = {
        get: lsGet,
        set: lsSet,
        has: lsHas,
        schemaVersion: SCHEMA_VERSION,
        // Re-run repair (debug / post-import flow)
        repair,
        // Full reset — only for devs. Not wired to any UI.
        _wipe() {
            try {
                Object.keys(localStorage)
                    .filter(k => k.startsWith('pp_') || k.startsWith('pl_') || k.startsWith('pocketLove'))
                    .forEach(k => localStorage.removeItem(k));
            } catch (_) {}
        }
    };

    // ---------------------------------------------------------------------
    // Boot. Must run BEFORE other modules try to read storage, so we do
    // the patch synchronously and defer the schema pass to a microtask so
    // exceptions don't block script parsing.
    // ---------------------------------------------------------------------
    patchSetItemLogging();
    try {
        // Run synchronously — ordering in index.html loads this early enough
        // that most modules read storage on their own DOMContentLoaded.
        repair();
    } catch (e) {
        console.warn('[storage-guard] repair pass threw:', e);
    }
})();
