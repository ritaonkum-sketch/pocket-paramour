// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS — Post-launch event collection, batched remote delivery,
//             and local self-improvement loop.
//
// SETUP:
//   Set ANALYTICS_ENDPOINT to your POST endpoint to enable remote collection.
//   Leave null to keep all data local (localStorage only).
//
// READ LOCAL DATA (DevTools console):
//   JSON.parse(localStorage.getItem('pl_events'))
//
// STABLE PLAYER ID (anonymous, never PII):
//   localStorage.getItem('pl_pid')
// ═══════════════════════════════════════════════════════════════════════════

const ANALYTICS_ENDPOINT = null;   // ← set to your POST URL when ready
const EVENT_LOG_KEY       = 'pl_events';
const MAX_LOG_SIZE        = 600;    // entries before rotation
const FLUSH_DELAY_MS      = 3000;   // batch window before sending

class Analytics {

    // ── Emit ────────────────────────────────────────────────────────────────
    // Call from anywhere: Analytics.emit('session_start', { storyDay: 2, ... })
    static emit(eventName, data = {}) {
        const entry = { e: eventName, ts: Date.now(), ...data };

        // 1. Write to local log (always — offline-safe, zero deps)
        try {
            const raw = localStorage.getItem(EVENT_LOG_KEY);
            const log = raw ? JSON.parse(raw) : [];
            log.push(entry);
            if (log.length > MAX_LOG_SIZE) log.splice(0, log.length - MAX_LOG_SIZE);
            localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(log));
        } catch (_) { /* storage full — skip silently */ }

        // 2. Queue for remote batch (only if endpoint configured)
        if (ANALYTICS_ENDPOINT) {
            Analytics._queue.push(entry);
            Analytics._scheduleFlush();
        }
    }

    // ── Remote delivery ─────────────────────────────────────────────────────
    static _queue     = [];
    static _flushTimer = null;

    static _scheduleFlush() {
        if (Analytics._flushTimer) return;
        Analytics._flushTimer = setTimeout(() => {
            Analytics._flush();
            Analytics._flushTimer = null;
        }, FLUSH_DELAY_MS);
    }

    static _flush() {
        if (!Analytics._queue.length || !ANALYTICS_ENDPOINT) return;
        const batch = Analytics._queue.splice(0); // drain atomically
        try {
            const ok = navigator.sendBeacon(
                ANALYTICS_ENDPOINT,
                JSON.stringify({ pid: Analytics.pid(), batch })
            );
            if (!ok) Analytics._queue.unshift(...batch); // requeue if beacon refused
        } catch (_) {
            Analytics._queue.unshift(...batch);
        }
    }

    // ── Stable anonymous player ID ──────────────────────────────────────────
    static pid() {
        try {
            let id = localStorage.getItem('pl_pid');
            if (!id) {
                id = Math.random().toString(36).slice(2) + Date.now().toString(36);
                localStorage.setItem('pl_pid', id);
            }
            return id;
        } catch (_) { return 'anon'; }
    }

    // ════════════════════════════════════════════════════════════════════════
    // LOCAL ANALYSIS — self-improving loop (no server required)
    // These run client-side using stored events.
    // Called from game.js _adaptFromLocalData() at session start.
    // ════════════════════════════════════════════════════════════════════════

    // Conversion rate per (scene × variant) pair.
    // Returns: { 'emotional_drift_A': 0.12, 'tension_confession_B': 0.21, ... }
    static getConversionRates() {
        try {
            const log = Analytics._readLog();
            const buckets = {};
            for (const entry of log) {
                if (entry.e !== 'premium_gate_shown' && entry.e !== 'premium_converted') continue;
                const key = (entry.scene || '?') + '_' + (entry.variant || 'none');
                if (!buckets[key]) buckets[key] = { shown: 0, converted: 0 };
                if (entry.e === 'premium_gate_shown') buckets[key].shown++;
                if (entry.e === 'premium_converted')  buckets[key].converted++;
            }
            const rates = {};
            for (const [key, { shown, converted }] of Object.entries(buckets)) {
                rates[key] = shown >= 1 ? +(converted / shown).toFixed(3) : null;
            }
            return rates;
        } catch (_) { return {}; }
    }

    // Average decision time (ms) per scene — fast < 2 s means wrong moment,
    // slow > 8 s means confusing copy or low tension.
    static getAvgDecisionTimes() {
        try {
            const log = Analytics._readLog();
            const buckets = {};
            for (const entry of log) {
                if (entry.e !== 'premium_converted' && entry.e !== 'premium_abandoned') continue;
                if (!entry.decisionTime) continue;
                const key = entry.scene || '?';
                if (!buckets[key]) buckets[key] = [];
                buckets[key].push(entry.decisionTime);
            }
            const avgs = {};
            for (const [key, times] of Object.entries(buckets)) {
                avgs[key] = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
            }
            return avgs;
        } catch (_) { return {}; }
    }

    // Day-N retention signal: count of unique calendar days with a session_start.
    static getRetentionDays() {
        try {
            const log = Analytics._readLog();
            const days = new Set();
            for (const entry of log) {
                if (entry.e === 'session_start') {
                    days.add(new Date(entry.ts).toDateString());
                }
            }
            return days.size;
        } catch (_) { return 0; }
    }

    // Returns which A/B variant has a meaningfully higher conversion rate
    // for a given scene (needs ≥ minSamples shown events per variant).
    // Returns: 'A' | 'B' | null (null = insufficient data or tied)
    static getBetterVariant(scene, minSamples = 20) {
        try {
            const log = Analytics._readLog();
            const counts = { A: { shown: 0, converted: 0 }, B: { shown: 0, converted: 0 } };
            for (const entry of log) {
                if (entry.scene !== scene) continue;
                const v = entry.variant;
                if (v !== 'A' && v !== 'B') continue;
                if (entry.e === 'premium_gate_shown') counts[v].shown++;
                if (entry.e === 'premium_converted')  counts[v].converted++;
            }
            if (counts.A.shown < minSamples || counts.B.shown < minSamples) return null;
            const rA = counts.A.converted / counts.A.shown;
            const rB = counts.B.converted / counts.B.shown;
            const delta = Math.abs(rA - rB);
            if (delta < 0.05) return null; // within 5% — not significant
            return rA > rB ? 'A' : 'B';
        } catch (_) { return null; }
    }

    // Churn risk signal: returns true if player hasn't had a session_start
    // for more than thresholdHours (default 48 h).
    static isChurnRisk(thresholdHours = 48) {
        try {
            const log = Analytics._readLog();
            let lastSession = 0;
            for (const entry of log) {
                if (entry.e === 'session_start' && entry.ts > lastSession) {
                    lastSession = entry.ts;
                }
            }
            if (!lastSession) return false;
            return (Date.now() - lastSession) > thresholdHours * 3600000;
        } catch (_) { return false; }
    }

    // ════════════════════════════════════════════════════════════════════════
    // DIAGNOSE — 7-day triage framework mapped to your actual data.
    //
    // Call in DevTools console any time:   Analytics.diagnose()
    //
    // Returns:
    //   { CRITICAL: [...], IMPORTANT: [...], INFO: [...], metrics: {...} }
    //
    // CRITICAL = fix same day | IMPORTANT = fix this week | INFO = healthy / FYI
    // ════════════════════════════════════════════════════════════════════════
    static diagnose() {
        const log = Analytics._readLog();
        if (!log.length) {
            return { CRITICAL: ['No events logged yet — play a session first.'], IMPORTANT: [], INFO: [], metrics: {} };
        }

        // ── Session metrics ────────────────────────────────────────────────
        const sessionEvents = log.filter(e => e.e === 'session_start');
        const sessionsByDay = {};
        for (const s of sessionEvents) {
            const day = new Date(s.ts).toDateString();
            sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
        }
        const days          = Object.keys(sessionsByDay).sort();
        const uniqueDays    = days.length;
        const totalSessions = sessionEvents.length;

        // Average session duration (from session_end events)
        const endEvents  = log.filter(e => e.e === 'session_end' && e.duration > 0);
        const avgDurMs   = endEvents.length
            ? endEvents.reduce((s, e) => s + e.duration, 0) / endEvents.length : null;

        // ── Monetisation metrics ───────────────────────────────────────────
        let gatesShown = 0, converted = 0, totalDT = 0, dtCount = 0;
        for (const e of log) {
            if (e.e === 'premium_gate_shown') gatesShown++;
            if (e.e === 'premium_converted') {
                converted++;
                if (e.decisionTime > 0 && e.decisionTime < 60000) {
                    totalDT += e.decisionTime;
                    dtCount++;
                }
            }
        }
        const FPR = gatesShown  >= 1 ? converted / gatesShown : null;
        const DT  = dtCount     >= 1 ? totalDT   / dtCount    : null;

        // Second purchase: players who converted 2+ times (unique scene_id)
        const scenesBought = new Set(log.filter(e => e.e === 'premium_converted').map(e => e.scene));
        const SPR = scenesBought.size >= 2; // at least 2 distinct scenes purchased

        // ── Micro-dissonance & meta health ─────────────────────────────────
        const microEvents  = log.filter(e => e.e === 'micro_dissonance_triggered').length;
        const ruptureSeen  = log.some(e => e.e === 'scene_triggered' && e.scene === 'first_rupture');
        const returnAfterR = log.filter(e => e.e === 'session_start').length > 1 && ruptureSeen;

        // ── Auto-tune snapshot (most recent) ──────────────────────────────
        const lastTune = [...log].reverse().find(e => e.e === 'auto_tune_snapshot');

        // ══════════════════════════════════════════════════════════════════
        // TRIAGE RULES
        // ══════════════════════════════════════════════════════════════════
        const CRITICAL  = [];
        const IMPORTANT = [];
        const INFO      = [];

        // ── Day 1 retention ────────────────────────────────────────────────
        if (totalSessions >= 2 && uniqueDays < 2) {
            CRITICAL.push(
                'D1 RETENTION: Player never returned on a second calendar day.\n' +
                '  Fix: Strengthen first 3 intro lines. Ensure "You\'ll come back… right?" fires on session end.\n' +
                '  Check: Time to first reaction <15 s. Remove any UI friction before first interaction.'
            );
        } else if (uniqueDays >= 2 && uniqueDays < 4) {
            IMPORTANT.push(`D3 RETENTION: ${uniqueDays} days active — below D3 target (≥4 days).\n  Fix: Is Day 2–3 tension building? Check scene2_awareness triggered. Consider earlier emotional_drift.`);
        } else if (uniqueDays >= 4) {
            INFO.push(`RETENTION: ✓ ${uniqueDays} unique days active.`);
        }

        // ── Session duration ───────────────────────────────────────────────
        if (avgDurMs !== null) {
            const avgDurMin = (avgDurMs / 60000).toFixed(1);
            if (avgDurMs < 60000) {
                CRITICAL.push(
                    `SESSION DURATION: ${avgDurMin} min avg — critically short.\n` +
                    '  Fix: Onboarding broken. Player sees no hook. Cut to first micro-dissonance faster.'
                );
            } else if (avgDurMs < 120000) {
                IMPORTANT.push(`SESSION DURATION: ${avgDurMin} min avg — below 2-min target.\n  Fix: Pacing too slow or no escalation. Add Day 1 curiosity event.`);
            } else {
                INFO.push(`SESSION DURATION: ✓ ${avgDurMin} min avg.`);
            }
        }

        // ── First purchase rate ────────────────────────────────────────────
        if (gatesShown >= 5 && FPR !== null) {
            const fprPct = (FPR * 100).toFixed(1);
            if (FPR < 0.01) {
                CRITICAL.push(
                    `FPR: ${fprPct}% — gate not converting at all (${converted}/${gatesShown}).\n` +
                    '  Fix: No tension before gate. Set config.json preChoiceTensionBoost: 0.08.\n' +
                    '  Check: Is premium label personal? "Stay with her" > "Unlock Scene".'
                );
            } else if (FPR < 0.03) {
                IMPORTANT.push(`FPR: ${fprPct}% — below 3% target.\n  Fix: Increase preChoiceTensionBoost (try 0.05). Delay choice appearance by 300ms.`);
            } else if (FPR > 0.15) {
                IMPORTANT.push(`FPR: ${fprPct}% — very high. Check D3 retention.\n  If retention dropping: reduce mismatchMultiplier, add softer post-premium recovery.`);
            } else {
                INFO.push(`FPR: ✓ ${fprPct}% (${converted} conversions from ${gatesShown} gates).`);
            }
        } else if (gatesShown < 5) {
            INFO.push(`FPR: Not enough gates shown yet (${gatesShown}). Gates appear Day 3+.`);
        }

        // ── Second purchase ────────────────────────────────────────────────
        if (converted >= 1 && !SPR) {
            IMPORTANT.push(
                'SPR: No second purchase yet (only 1 scene bought).\n' +
                '  Fix: Ensure whale arc entry fires. Check: purchasedCount >= 2 AND returnedAfterRupture.'
            );
        } else if (SPR) {
            INFO.push('SPR: ✓ Player has purchased 2+ distinct scenes.');
        }

        // ── Decision timing ────────────────────────────────────────────────
        if (DT !== null) {
            const dtSec = (DT / 1000).toFixed(1);
            if (DT < 2000) {
                CRITICAL.push(
                    `DT: ${dtSec}s avg — too fast. Gate feels trivial.\n` +
                    '  Fix: Set config.json preChoiceTensionBoost: -0.03, pauseScale: 1.05.\n' +
                    '  The emotional weight before the gate is too light or too obvious.'
                );
            } else if (DT > 8000) {
                IMPORTANT.push(
                    `DT: ${dtSec}s avg — too slow. Player is confused or disengaged.\n` +
                    '  Fix: Sharpen the line just before the gate. Increase tension 2–3 exchanges earlier.'
                );
            } else {
                INFO.push(`DT: ✓ ${dtSec}s avg — in sweet spot (3–6s).`);
            }
        }

        // ── Emotional system health ────────────────────────────────────────
        if (!ruptureSeen && uniqueDays >= 6) {
            IMPORTANT.push('RUPTURE: First rupture not seen after 6+ days. Check first_rupture trigger conditions (obs >90, fear 25–44, tensionStage ≥1).');
        }
        if (microEvents === 0 && totalSessions >= 3) {
            IMPORTANT.push('MICRO-DISSONANCE: Never fired. Check microDissonanceRate in config.json (default 0.15). Must reach obs>90 to trigger.');
        }

        // ── Auto-tune state ────────────────────────────────────────────────
        if (lastTune && lastTune.tune) {
            const t = lastTune.tune;
            INFO.push(`AUTO-TUNE (last session): preChoiceTension=${t.preChoiceTensionBoost} | mismatch=${t.mismatchBaseChance} | pauseScale=${t.pauseScale} | microDis=${t.microDissonanceRate}`);
        }

        // ── Noise filter (what to ignore right now) ────────────────────────
        if (CRITICAL.length === 0 && IMPORTANT.length === 0) {
            INFO.push('No critical or important issues detected. Focus: maintain FPR, grow SPR, watch D7 retention.');
        }
        INFO.push('IGNORE NOW: feature requests, UI colour tweaks, adding new characters, clarifying how systems work. Fix emotion first.');

        return {
            CRITICAL,
            IMPORTANT,
            INFO,
            metrics: {
                totalSessions,
                uniqueDays,
                avgSessionMin: avgDurMs ? +((avgDurMs / 60000).toFixed(1)) : 'n/a',
                gatesShown,
                converted,
                FPR:      FPR  !== null ? +(FPR  * 100).toFixed(1) + '%' : 'n/a',
                avgDT_ms: DT   !== null ? Math.round(DT)                  : 'n/a',
                SPR:      SPR ? 'yes' : 'no',
                ruptureSeen,
                microEvents
            }
        };
    }

    // ── Helpers ─────────────────────────────────────────────────────────────
    static _readLog() {
        try {
            return JSON.parse(localStorage.getItem(EVENT_LOG_KEY) || '[]');
        } catch (_) { return []; }
    }
}

// Flush remaining queue when player backgrounds or closes the app
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') Analytics._flush();
});
window.addEventListener('pagehide', () => Analytics._flush());
