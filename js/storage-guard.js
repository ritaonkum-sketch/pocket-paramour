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

    // v2 (Aug 2026): one-shot migration of the old "seed met chars to
    // affection 10" default → 0, now that affection gates the route.
    // v3 (Aug 2026): repair saves corrupted by the WRONG CHAPTER_CHAR_MAP
    //                below. See the block comment on that map.
    const SCHEMA_VERSION = 3;
    const CHARS = ['alistair', 'elian', 'lyra', 'caspian', 'lucien', 'noir', 'proto'];

    // Chapter-to-character mapping — the FIRST chapter that introduces each
    // character in the main story route.
    //
    // ⚠ THIS WAS WRONG AND IT WAS THE "CHARACTER BLEED" BUG (fixed Aug 2026).
    // The old map was a naive chapter-N-is-the-Nth-character guess:
    //     1 alistair, 2 elian, 3 lyra, 4 caspian, 5 lucien, 6 noir, 7 proto
    // Six of those seven were wrong. Chapters 1-5 are ALL Alistair and 6-9
    // are ALL Elian, so a player who simply read the story to Chapter 7 —
    // which is everyone — had rule 2 below stamp pp_met_ AND
    // pp_ms_encounter_<char>_seen for ALL SEVEN characters, including Proto,
    // who has no chapter at all and is a late-game reveal.
    //
    // Everything keyed on "met" then activated for total strangers: the
    // Chronicle grid, affection-drift, cross-char.js, turning-points.js,
    // early-whispers, aenor-presence and PPMultiRomance's rival list. And
    // because the guard re-ran every boot, clearing the keys by hand did not
    // stick.
    //
    // Derived from chapters.js charId fields; keep in sync if a route's
    // opening chapter ever moves. Characters with NO gating chapter (Proto)
    // are deliberately absent — they must never be auto-met.
    const CHAPTER_CHAR_MAP = {
        1:  'alistair',
        6:  'elian',
        10: 'lyra',
        11: 'caspian',
        17: 'lucien',
        20: 'noir'
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

        // 1. encounter_seen implies met.
        // Jul 2026 playtest fix — pp_met_ stores a DATE STRING (game.js
        // days-together system), not a boolean. The old `!== '1'` check
        // clobbered valid dates back to '1' on EVERY boot, which made
        // new Date('1') parse to ~2001 and fired the hundred-days
        // anniversary at first meeting. Only backfill when the key is
        // truly absent, and stamp today's date.
        CHARS.forEach(char => {
            if (lsGet('pp_ms_encounter_' + char + '_seen') === '1' && !lsGet('pp_met_' + char)) {
                lsSet('pp_met_' + char, new Date().toDateString());
                repaired.push('met_' + char + ' (from encounter_seen)');
            }
        });

        // 2. chapter_done implies the character at that chapter is met + encountered
        Object.keys(CHAPTER_CHAR_MAP).forEach(n => {
            const char = CHAPTER_CHAR_MAP[n];
            if (lsGet('pp_chapter_done_' + n) === '1') {
                // Date-string convention — see rule 1's Jul 2026 note.
                if (!lsGet('pp_met_' + char)) {
                    lsSet('pp_met_' + char, new Date().toDateString());
                    repaired.push('met_' + char + ' (from chapter_done_' + n + ')');
                }
                if (lsGet('pp_ms_encounter_' + char + '_seen') !== '1') {
                    lsSet('pp_ms_encounter_' + char + '_seen', '1');
                    repaired.push('encounter_seen_' + char + ' (from chapter_done_' + n + ')');
                }
            }
        });

        // 3. met but no affection => seed to 0 (met-but-not-yet-romanced).
        //    Aug 2026 FIX: this used to seed 10. That was correct when
        //    affection was only a recall/display value. It is now the
        //    ROUTE-GATE currency (route-gates.js gates each chapter on the
        //    suitor's bond level, and bond level 2 = affection 10). Seeding
        //    10 on "met" handed every character bond level 2 for free the
        //    instant they were met — via an encounter, a chapter that
        //    introduces them, or tapping "Care for X" — which silently
        //    unlocked their first 1-2 chapters with ZERO actual care. A
        //    first-time player could read Ch10 (Lyra) / Ch11 (Caspian)
        //    without ever tending them. Seed 0 instead: "met" means you
        //    have crossed paths in the story, NOT that you have begun the
        //    romance. The chapters stay locked until the player genuinely
        //    cares. (Readers all fall back to 0 for an absent key, so this
        //    only matters where a key gets written; we still write '0' to
        //    preserve the met-character-has-an-affection-key invariant.)
        //    Aug 2026: this tested `=== '1'`, but rule 1 above writes
        //    pp_met_ as a DATE STRING, so the check never matched a normally
        //    met character and the invariant it exists to keep was never
        //    actually enforced. Presence test instead.
        CHARS.forEach(char => {
            if (lsHas('pp_met_' + char) && !lsHas('pp_affection_' + char)) {
                lsSet('pp_affection_' + char, '0');
                repaired.push('affection_' + char + ' (seeded 0)');
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

        // 5c. ONE-SHOT MIGRATION (schema → v2). Existing saves already
        //     carry the old "met => affection 10" seed (step 3 used to
        //     write 10; the !lsHas guard means the new seed-0 won't
        //     overwrite it). That stale 10 = bond level 2 still grants
        //     free route-gate progression on returning saves. Reset any
        //     met-but-uncared character that is STILL sitting on the exact
        //     old seed value back to 0. "Genuinely cared for" is detected
        //     by the presence of a per-character care save
        //     (pocketLoveSave_<char>) — if that exists the player has run
        //     the care loop, so we never touch their earned affection,
        //     even if it happens to read 10. Runs once (gated below).
        const _priorSchema = parseInt(lsGet('pp_schema_v') || '0', 10) || 0;
        if (_priorSchema < 2) {
            CHARS.forEach(char => {
                const aff = lsGet('pp_affection_' + char);
                const caredFor = lsHas('pocketLoveSave_' + char);
                if (aff === '10' && !caredFor) {
                    lsSet('pp_affection_' + char, '0');
                    repaired.push('affection_' + char + ' (migrated stale seed 10→0)');
                }
            });
        }

        // 5d. ONE-SHOT MIGRATION (schema → v3). Un-does the character bleed
        //     caused by the old wrong CHAPTER_CHAR_MAP (see its comment).
        //     Saves in the wild have pp_met_ / pp_ms_encounter_<char>_seen
        //     stamped for characters the player has never actually met, which
        //     lit them up across the Chronicle, drift, cross-char, whispers
        //     and the rival list.
        //
        //     CONSERVATIVE BY DESIGN — this is the one rule in this file that
        //     removes keys, so it only fires when EVERY signal says the meet
        //     never happened:
        //       - the character's real gating chapter is not done
        //       - affection is absent or 0
        //       - no manual route unlock
        //       - never introduced (chapter `introduces` beat / being selected)
        //       - no per-character care save
        //     Any one of those means the player genuinely knows them, and we
        //     leave the save completely alone.
        if (_priorSchema < 3) {
            const gateOf = {};
            Object.keys(CHAPTER_CHAR_MAP).forEach(n => { gateOf[CHAPTER_CHAR_MAP[n]] = n; });
            CHARS.forEach(char => {
                const gate = gateOf[char];                       // undefined for Proto
                const chapterDone = gate && lsGet('pp_chapter_done_' + gate) === '1';
                const aff = parseInt(lsGet('pp_affection_' + char) || '0', 10) || 0;
                const genuine = chapterDone
                    || aff > 0
                    || lsGet('pp_select_unlock_' + char) === '1'
                    || lsGet('pp_introduced_' + char) === '1'
                    || lsHas('pocketLoveSave_' + char);
                if (genuine) return;
                let cleared = false;
                if (lsHas('pp_met_' + char)) {
                    try { localStorage.removeItem('pp_met_' + char); cleared = true; } catch (_) {}
                }
                if (lsGet('pp_ms_encounter_' + char + '_seen') === '1') {
                    try { localStorage.removeItem('pp_ms_encounter_' + char + '_seen'); cleared = true; } catch (_) {}
                }
                if (cleared) repaired.push('un-met ' + char + ' (bad chapter map, never actually met)');
            });
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
