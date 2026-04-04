// ═══════════════════════════════════════════════════════════════════════════
// BANDIT — Thompson Sampling for dialogue variant optimisation.
//
// SCOPE: each bandit is keyed by (scene × player_segment × personality_path)
// This prevents cross-contamination — an obsessive player on day 6
// won't pollute the data for a new caregiver player on day 3.
//
// SUCCESS SIGNAL: premium_converted = true  |  premium_abandoned = false
//
// DATA (localStorage['pl_bandit']):
// {
//   "emotional_drift_engaged_none": { "A": { s:3, f:7 }, "B": { s:8, f:4 } }
// }
//
// READ (DevTools):  JSON.parse(localStorage.getItem('pl_bandit'))
// ═══════════════════════════════════════════════════════════════════════════

class BanditStore {

    static _KEY = 'pl_bandit';

    // ── Select ───────────────────────────────────────────────────────────────
    // Returns the best variant for this context via Thompson sampling.
    // Falls back to uniform random if BanditStore is unavailable.
    // variants: array of string IDs, e.g. ['A', 'B']
    static sample(scene, segment, path, variants = ['A', 'B']) {
        try {
            const ctx   = `${scene}_${segment}_${path}`;
            const store = BanditStore._read();
            const ctxData = store[ctx] || {};

            let best = null, bestScore = -1;
            for (const v of variants) {
                const { s = 1, f = 1 } = ctxData[v] || {};
                const score = BanditStore._sampleBeta(s, f);
                if (score > bestScore) { bestScore = score; best = v; }
            }
            return best || variants[Math.floor(Math.random() * variants.length)];
        } catch (_) {
            return variants[Math.floor(Math.random() * variants.length)];
        }
    }

    // ── Update ───────────────────────────────────────────────────────────────
    // Call after each gate outcome.
    // success: true = premium_converted, false = premium_abandoned
    static update(scene, segment, path, variant, success) {
        try {
            const ctx   = `${scene}_${segment}_${path}`;
            const store = BanditStore._read();
            if (!store[ctx])          store[ctx] = {};
            if (!store[ctx][variant]) store[ctx][variant] = { s: 1, f: 1 };
            if (success) store[ctx][variant].s++;
            else         store[ctx][variant].f++;
            // Rotate: cap each variant at 200 virtual samples to allow gradual drift
            const cap = 200;
            for (const v of Object.keys(store[ctx])) {
                const total = store[ctx][v].s + store[ctx][v].f;
                if (total > cap) {
                    const ratio = cap / total;
                    store[ctx][v].s = Math.max(1, Math.round(store[ctx][v].s * ratio));
                    store[ctx][v].f = Math.max(1, Math.round(store[ctx][v].f * ratio));
                }
            }
            BanditStore._write(store);
        } catch (_) {}
    }

    // ── Inspect (DevTools helper) ─────────────────────────────────────────────
    // Returns current win rates per context. Call in console: BanditStore.inspect()
    static inspect() {
        const store = BanditStore._read();
        const result = {};
        for (const [ctx, variants] of Object.entries(store)) {
            result[ctx] = {};
            for (const [v, { s, f }] of Object.entries(variants)) {
                result[ctx][v] = {
                    rate:    +((s - 1) / Math.max(1, s + f - 2)).toFixed(3),
                    samples: s + f - 2   // subtract priors
                };
            }
        }
        return result;
    }

    // ════════════════════════════════════════════════════════════════════════
    // Beta distribution sampler (Thompson Sampling core)
    // Uses Marsaglia-Tsang Gamma method — exact, no library needed.
    // ════════════════════════════════════════════════════════════════════════

    static _sampleBeta(a, b) {
        // Beta(a,b) = Gamma(a) / (Gamma(a) + Gamma(b))
        const ga = BanditStore._sampleGamma(Math.max(0.5, a));
        const gb = BanditStore._sampleGamma(Math.max(0.5, b));
        const sum = ga + gb;
        return sum > 0 ? ga / sum : 0.5;
    }

    static _sampleGamma(a) {
        if (a < 1) {
            // Berman's reduction: Gamma(a) = Gamma(a+1) * U^(1/a)
            return BanditStore._sampleGamma(1 + a) * Math.pow(Math.random(), 1 / a);
        }
        // Marsaglia-Tsang squeeze method (a ≥ 1)
        const d = a - 1 / 3;
        const c = 1 / Math.sqrt(9 * d);
        for (let i = 0; i < 200; i++) {
            let x, v;
            do {
                x = BanditStore._randNormal();
                v = 1 + c * x;
            } while (v <= 0);
            v = v * v * v;
            const u = Math.random();
            // Squeeze test (avoids log most of the time)
            if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
            if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
        }
        return d; // numerical fallback
    }

    static _randNormal() {
        // Box-Muller transform — avoid log(0)
        const u = Math.max(Number.EPSILON, Math.random());
        const v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    // ── Storage ──────────────────────────────────────────────────────────────
    static _read() {
        try {
            return JSON.parse(localStorage.getItem(BanditStore._KEY) || '{}');
        } catch (_) { return {}; }
    }

    static _write(data) {
        try {
            localStorage.setItem(BanditStore._KEY, JSON.stringify(data));
        } catch (_) {}
    }
}
