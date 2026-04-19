// ═══════════════════════════════════════════════════════════════════════════
// REMOTE CONFIG — Live tuning without an app update.
//
// Game reads from window.TUNE instead of hardcoded constants.
// On boot this fetches /config.json (or REMOTE_CONFIG_URL if set).
// If the fetch fails (offline, no file), values fall back to DEFAULTS.
//
// TO TUNE LIVE:
//   1. Edit /config.json on your server.
//   2. Players get the new values on their next session start.
//   No code push needed.
//
// TO ADD A NEW TUNABLE:
//   1. Add it to TUNE_DEFAULTS with a safe value.
//   2. Add it to config.json.
//   3. Read it in game code as: (window.TUNE?.myKey ?? defaultValue)
// ═══════════════════════════════════════════════════════════════════════════

const REMOTE_CONFIG_URL = null;   // ← set to your config CDN URL when ready
                                   //   null = uses /config.json (local file)

// ── Defaults ────────────────────────────────────────────────────────────────
// These are the ground-truth values. Remote config can only OVERRIDE them,
// never inject unknown keys (security: prevents config injection attacks).
const TUNE_DEFAULTS = {

    // ── Emotional engine ────────────────────────────────────────────────
    fearEquilibriumLow:     25,     // fear nudges up when below this
    fearEquilibriumHigh:    60,     // fear nudges down when above this

    // ── Personality drift ───────────────────────────────────────────────
    driftDecay:             0.2,    // personality vector decay per second

    // ── Mismatch / micro-dissonance ─────────────────────────────────────
    mismatchBaseChance:     0.07,   // floor probability of emotional leak
    mismatchMultiplier:     0.38,   // score → leak probability scale
    mismatchCap:            0.35,   // maximum leak probability per interaction
    microDissonanceRate:    0.20,   // per-interaction chance of micro-dissonance flicker

    // ── Premium gate ────────────────────────────────────────────────────
    premiumAutoClose:       9000,   // ms before gate auto-closes (no choice)
    preChoiceTensionBoost:  0.0,    // fear nudge (× 12) applied just before the gate
    pauseScale:             1.0,    // multiplier applied to all scene pause timings
    reassuranceWeight:      1.0,    // scale factor for recovery comfort lines
    ruptureFrequency:       0.18,   // reserved: future first-rupture cooldown scaling

    // ── Whale arc ───────────────────────────────────────────────────────
    whaleScoreThreshold:    55,     // minimum score to enter whale arc

    // ── Meta narrative ──────────────────────────────────────────────────
    metaCooldown:           300000, // ms between meta narrative triggers (5 min)

    // ── A/B self-adaptation ─────────────────────────────────────────────
    abAdaptEnabled:         true,   // allow client-side A/B auto-locking
    abMinSamples:           20,     // events required before adapting a variant
};

// Expose globally — game.js reads window.TUNE.xxx
window.TUNE = { ...TUNE_DEFAULTS };

// ── Loader ──────────────────────────────────────────────────────────────────
async function loadRemoteConfig() {
    const url = REMOTE_CONFIG_URL || '/config.json';
    try {
        const res = await fetch(url, {
            cache: 'no-store',          // always get the freshest version
            signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined
        });
        if (!res.ok) return;
        const remote = await res.json();

        // Whitelist merge: only apply keys that exist in DEFAULTS
        // Prevents a compromised config file from injecting arbitrary properties
        let patched = 0;
        for (const key of Object.keys(TUNE_DEFAULTS)) {
            if (remote[key] !== undefined && typeof remote[key] === typeof TUNE_DEFAULTS[key]) {
                window.TUNE[key] = remote[key];
                patched++;
            }
        }
        // debug log removed — gate behind ?debug=1 if needed
        if (patched > 0 && /[?&]debug=1\b/.test(location.search)) {
            console.log(`[config] Applied ${patched} remote tune value(s).`);
        }
    } catch (_) {
        // Offline, timeout, or no config file — silently stay on defaults
    }
}

loadRemoteConfig();
