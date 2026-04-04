/**
 * POCKET PARAMOUR — Balance Simulation
 * ─────────────────────────────────────
 * Dev tool only. NOT included in the game.
 *
 * HOW TO USE:
 *   1. Open the game in Chrome
 *   2. Open DevTools Console (F12)
 *   3. Paste this file's contents and press Enter
 *   4. Run: sim.runAllProfiles()
 *      Or single profile: sim.runProfile('caregiver', 2000)
 *
 * WHAT TO LOOK FOR:
 *   - Mismatch rate: target 10–25% per profile
 *   - Final stats should not be maxed or floored
 *   - "Sweet spot" should be YES for caregiver and roleplayer
 *   - Avoidant should create tension (not silence)
 *   - Gifter should NOT have the best stats — that breaks economy
 */

// ── Player archetypes ───────────────────────────────────────────────────
const PROFILES = {
    caregiver:  { talk: 0.50, gift: 0.25, idle: 0.15, train: 0.10 },
    gifter:     { talk: 0.15, gift: 0.60, idle: 0.15, train: 0.10 },
    avoidant:   { talk: 0.15, gift: 0.05, idle: 0.65, train: 0.15 },
    obsessive:  { talk: 0.40, gift: 0.20, idle: 0.05, train: 0.35 },
    roleplayer: { talk: 0.60, gift: 0.15, idle: 0.15, train: 0.10 }
};

class Simulation {
    constructor() {
        this.reset();
    }

    reset() {
        // Mirror game.js hidden stats
        this.state = {
            trust:     50,
            fear:      10,
            obsession: 20,
            tensionStage: 0,
            corruption:   0
        };
        this.mismatchCount  = 0;
        this.totalSteps     = 0;
        this.sweetSpotTicks = 0;
        this.logs           = [];
        this._actionLog     = [];   // for fatigue detection
    }

    clamp(v) { return Math.max(0, Math.min(100, v)); }
    rand(min, max) { return (Math.random() * (max - min)) + min; }

    getActionByProfile(profile) {
        let roll = Math.random(), cum = 0;
        for (const action in profile) {
            cum += profile[action];
            if (roll < cum) return action;
        }
        return 'talk';
    }

    // Mirror game.js action effects on hidden stats
    applyAction(action) {
        let { trust, fear, obsession, tensionStage, corruption } = this.state;

        switch (action) {
            case 'talk':
                trust     += 2;
                obsession += 1;
                fear      -= 1.5;
                break;
            case 'gift':
                trust     += 1;
                obsession += 3;     // gifts build dependence faster than trust
                fear      -= 1;
                break;
            case 'train':
                trust     += 1.5;
                fear      -= 0.5;
                break;
            case 'idle':            // neglect
                trust     -= 1;
                obsession -= 1.5;
                fear      += 4;
                corruption += 0.18; // reduced from 0.3 — matches game.js fix
                break;
        }

        // Small randomness — centred at 0 so fear has no upward bias
        trust     += this.rand(-0.8, 0.8);
        fear      += this.rand(-0.5, 0.5);   // FIX: was rand(0,1.2) — caused runaway drift
        obsession += this.rand(-0.4, 0.4);

        // ── Pressure build-up ──────────────────────────────────────────────
        if (obsession > 85 && fear < 30) fear += 0.8;

        // ── Micro-withdrawal ───────────────────────────────────────────────
        if (obsession > 90 && fear > 40) trust -= 0.3;

        // ── Soft ceiling resistance ────────────────────────────────────────
        if (trust > 90)     trust     -= 0.2;
        if (obsession > 90) obsession -= 0.2;

        // ── Equilibrium forces (mirror of game.js tick) ───────────────────
        if (fear > 60) fear -= 0.35;
        if (fear < 25) fear += 0.85;

        // Corruption: passive decay + extra resistance above 70
        corruption = Math.max(0, corruption - 0.08);
        if (corruption > 70) corruption -= 0.04;

        // ── Action fatigue (mirror of _recordAction) ─────────────────────
        this._actionLog.push(action);
        if (this._actionLog.length > 8) this._actionLog.shift();
        const last3  = this._actionLog.slice(-3);
        const streak = last3.length === 3 && last3.every(a => a === action);
        if (streak) {
            fear  += 3;
            trust -= 1.5;
            tensionStage = Math.min(3, tensionStage + 1);
        }

        // Tension stage derivation (mirrors game.js logic)
        const newTS = fear > 80 ? 3 : fear > 55 ? 2 : fear > 30 ? 1 : 0;

        this.state.trust        = this.clamp(trust);
        this.state.fear         = this.clamp(fear);
        this.state.obsession    = this.clamp(obsession);
        this.state.tensionStage = newTS;
        this.state.corruption   = this.clamp(corruption);
    }

    // Mirror game.js _getMismatchedEmotion conditions
    checkMismatch() {
        const { trust: t, fear: f, obsession: obs, tensionStage: ts, corruption: cor } = this.state;
        // Weighted mismatch — matches updated game.js formula
        const mismatchScore = (ts / 3) * 0.50 + (cor / 100) * 0.30 + (f / 100) * 0.20;
        const leakChance    = Math.min(0.35, 0.04 + mismatchScore * 0.38);

        if (Math.random() > leakChance) return false;

        // At least one rule must trigger
        if (t < 35  && f > 30)              return true; // suppression
        if (obs > 60 && t < 55)             return true; // fear of attachment
        if (ts >= 2 && f > 45)             return true; // defensive mask
        if (cor > 38)                       return true; // corruption distortion
        if (t > 78  && obs > 65)            return true; // fragile honesty leak
        if (obs > 88 && f < 35 && ts > 0)  return true; // suffocation (rule 6)

        return false;
    }

    isSweetSpot() {
        const { trust: t, obsession: obs, fear: f } = this.state;
        return t >= 50 && t <= 80 &&
               obs >= 55 && obs <= 88 &&
               f >= 20 && f <= 65;
    }

    runProfile(profileName, steps = 1500) {
        this.reset();
        const profile = PROFILES[profileName];
        if (!profile) { console.error('Unknown profile:', profileName); return; }

        for (let i = 0; i < steps; i++) {
            this.totalSteps++;
            const action  = this.getActionByProfile(profile);
            this.applyAction(action);
            if (this.checkMismatch()) this.mismatchCount++;
            if (this.isSweetSpot())   this.sweetSpotTicks++;
        }

        this.report(profileName, steps);
    }

    report(profileName, steps) {
        const mismatchRate  = (this.mismatchCount / steps * 100).toFixed(1);
        const sweetSpotRate = (this.sweetSpotTicks / steps * 100).toFixed(1);
        const { trust, fear, obsession, tensionStage, corruption } = this.state;

        const mismatchOk  = +mismatchRate >= 10 && +mismatchRate <= 25;
        const sweetOk     = +sweetSpotRate >= 30;
        const trustOk     = trust >= 40 && trust <= 85;

        console.groupCollapsed(
            `%c${profileName.toUpperCase().padEnd(12)} ` +
            `mismatch:${mismatchRate.padStart(5)}%  sweet:${sweetSpotRate.padStart(5)}%  ` +
            `${mismatchOk && sweetOk ? '✅' : '⚠️'}`,
            `color:${mismatchOk ? '#00ff88' : '#ff8800'}; font-weight:bold`
        );
        console.log('Final state  → trust:', trust.toFixed(1), ' fear:', fear.toFixed(1),
                    ' obsession:', obsession.toFixed(1), ' tension stage:', tensionStage,
                    ' corruption:', corruption.toFixed(1));
        console.log('Mismatch rate:', mismatchRate + '%', mismatchOk ? '✅ (target 10–25%)' : '⚠️ adjust thresholds');
        console.log('Sweet spot   :', sweetSpotRate + '%', sweetOk   ? '✅ (target >30%)'   : '⚠️ too extreme');
        console.log('Trust health :', trustOk ? '✅' : '⚠️ drifted to extremes');

        if (!mismatchOk) {
            if (+mismatchRate < 10) console.warn('→ Too predictable. Raise fear growth on idle, or lower leakChance floor.');
            if (+mismatchRate > 25) console.warn('→ Too chaotic. Lower tensionStage multiplier or fear growth rate.');
        }
        if (!sweetOk) {
            console.warn('→ Stats drifting out of engagement zone. Check trust/obsession decay rates.');
        }
        console.groupEnd();
    }

    runAllProfiles(steps = 1500) {
        console.log('%cPOCKET PARAMOUR — Balance Simulation', 'font-size:14px; font-weight:bold; color:#ff69b4');
        console.log(`Running ${steps} steps per profile...\n`);
        for (const profile in PROFILES) {
            this.runProfile(profile, steps);
        }
        console.log('\nDone. Green = healthy. Orange = needs tuning.');
    }
}

const sim = new Simulation();
console.log('%cSimulation loaded. Run: sim.runAllProfiles()', 'color:#00ff88');
