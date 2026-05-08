// Daily Reward System
// Check-in rewards, streak milestones, and engagement hooks

class DailyRewardSystem {
    constructor(game) {
        this.game = game;
    }

    // Check if a daily reward should be shown (called from game.load())
    check() {
        const today = new Date().toDateString();
        const lastLogin = this.game.lastLoginDate;
        if (lastLogin === today) return; // Already claimed today

        // QUIET FIRST HOUR: don't surprise the player with a daily-reward
        // modal mid-cinematic. Defer until the screen is calm — re-check
        // every 4s. The reward will land cleanly between scenes.
        if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) {
            setTimeout(() => { try { this.check(); } catch (_) {} }, 4000);
            return;
        }

        const streak = this.game.dailyStreak || 0;
        const reward = this._getReward(streak);

        this._showRewardOverlay(streak, reward);
    }

    // Get today's reward based on streak
    _getReward(streak) {
        // \u2500\u2500 TIER-1 milestones (early game; same as before) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
        if (streak === 3)  return { type: 'milestone', label: 'Dedicated', icon: '\uD83D\uDD25', desc: '3 days in a row! They noticed.', bond: 8, affection: 3, milestone: true };
        if (streak === 7)  return { type: 'milestone', label: 'Devoted', icon: '\uD83C\uDCCF', desc: '7-day streak! A bond is forming.', bond: 12, affection: 5, milestone: true };
        if (streak === 14) return { type: 'milestone', label: 'Inseparable', icon: '\uD83D\uDD2E', desc: '2 weeks of devotion!', bond: 15, affection: 8, milestone: true };
        if (streak === 30) return { type: 'milestone', label: 'Eternal', icon: '\u2B50', desc: 'One month. They can\'t imagine life without you.', bond: 20, affection: 12, milestone: true };

        // \u2500\u2500 TIER-2 milestones (May 2026 retention curve) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
        // Three unlocks for long-haul players: a unique letter, a gallery
        // card, and an exclusive Small Moment per tier. Sets persistent
        // flags so other systems (letter.js, gallery.js, small-moments.js)
        // can surface tier-2 content when they detect the flag.
        if (streak === 21)  return { type: 'milestone', label: 'Steadfast', icon: '\uD83C\uDFAF', desc: 'Three weeks. The kingdom has noticed who keeps the door.', bond: 25, affection: 15, milestone: true, tier2: true, tier2Key: 'steadfast' };
        if (streak === 45)  return { type: 'milestone', label: 'Sworn',     icon: '\uD83D\uDDDD\uFE0F', desc: 'Six weeks. They speak of you in the past tense by accident, and correct themselves.', bond: 30, affection: 18, milestone: true, tier2: true, tier2Key: 'sworn' };
        if (streak === 100) return { type: 'milestone', label: 'Legend',    icon: '\uD83D\uDC51', desc: 'A hundred days. There are now stories about you that you have not heard.', bond: 40, affection: 25, milestone: true, tier2: true, tier2Key: 'legend' };

        // Regular daily rewards cycle (post day-7 default loop)
        const rewards = [
            { type: 'bond',      label: 'Bond Boost',     icon: '\uD83D\uDC96', desc: 'A warm feeling grows...', bond: 5, affection: 0 },
            { type: 'affection', label: 'Affection Boost', icon: '\u2728',       desc: 'They noticed you came back.', bond: 3, affection: 3 },
            { type: 'gift',      label: 'Free Gift',       icon: '\uD83C\uDF81', desc: 'A small token of care.',     bond: 8, affection: 2 },
            { type: 'bond',      label: 'Heart Warmth',    icon: '\u2764\uFE0F', desc: 'Connection deepens.',        bond: 6, affection: 1 },
            { type: 'insight',   label: 'Insight',         icon: '\uD83D\uDCA1', desc: 'You understand them better.', bond: 4, affection: 4 }
        ];
        return rewards[streak % rewards.length];
    }

    // Show the daily reward overlay
    _showRewardOverlay(streak, reward) {
        // Create overlay
        let overlay = document.getElementById('daily-reward-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'daily-reward-overlay';
            document.querySelector('.game-container')?.appendChild(overlay) || document.body.appendChild(overlay);
        }

        // Build streak calendar (7 days)
        const days = [];
        for (let i = 0; i < 7; i++) {
            const dayNum = Math.floor(streak / 7) * 7 + i + 1;
            const isPast = dayNum < streak + 1;
            const isToday = dayNum === streak + 1;
            const isFuture = dayNum > streak + 1;
            days.push(`<div class="dr-day ${isPast ? 'dr-claimed' : ''} ${isToday ? 'dr-today' : ''} ${isFuture ? 'dr-locked' : ''}">
                <div class="dr-day-num">${dayNum}</div>
                <div class="dr-day-icon">${isPast ? '\u2705' : isToday ? reward.icon : '\uD83D\uDD12'}</div>
            </div>`);
        }

        const isMilestone = reward.milestone;
        overlay.innerHTML = `
            <div class="dr-backdrop"></div>
            <div class="dr-card ${isMilestone ? 'dr-milestone' : ''}">
                ${isMilestone ? '<div class="dr-milestone-particles"></div>' : ''}
                <div class="dr-streak">\uD83D\uDD25 ${streak + 1} Day Streak</div>
                ${isMilestone ? '<div class="dr-milestone-title">' + reward.label + '!</div>' : ''}
                <div class="dr-calendar">${days.join('')}</div>
                <div class="dr-reward">
                    <div class="dr-reward-icon ${isMilestone ? 'dr-reward-icon-big' : ''}">${reward.icon}</div>
                    ${!isMilestone ? '<div class="dr-reward-label">' + reward.label + '</div>' : ''}
                    <div class="dr-reward-desc">${reward.desc}</div>
                </div>
                <button class="dr-claim-btn">${isMilestone ? 'Claim Reward' : 'Claim'}</button>
            </div>
        `;

        overlay.classList.remove('hidden');
        requestAnimationFrame(() => overlay.classList.add('visible'));

        // Claim button
        overlay.querySelector('.dr-claim-btn').addEventListener('click', () => {
            // Apply reward
            this.game.bond = Math.min(100, this.game.bond + (reward.bond || 0));
            this.game.affection = Math.min(100, this.game.affection + (reward.affection || 0));

            // Tier-2 milestones: write a persistent flag that other systems
            // can read to surface unique content (letter, gallery card, or
            // exclusive Small Moment). Per-character so each character's
            // tier-2 unlock is independent. Pattern:
            //   pp_dr_tier2_<key>_<char> = '1'
            // Letter system can poll for `pp_dr_tier2_steadfast_alistair` etc.
            if (reward.tier2 && reward.tier2Key) {
                try {
                    const ch = this.game.selectedCharacter || 'alistair';
                    localStorage.setItem('pp_dr_tier2_' + reward.tier2Key + '_' + ch, '1');
                    // Also the char-agnostic flag for cross-cutting systems
                    localStorage.setItem('pp_dr_tier2_' + reward.tier2Key, '1');
                } catch (_) {}
            }

            // Play sound
            if (typeof sounds !== 'undefined') sounds.chime();

            // Animate out
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.classList.add('hidden');
                overlay.innerHTML = '';
            }, 400);

            this.game.save();
        });
    }
}
