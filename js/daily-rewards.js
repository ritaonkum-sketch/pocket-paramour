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

        const streak = this.game.dailyStreak || 0;
        const reward = this._getReward(streak);

        this._showRewardOverlay(streak, reward);
    }

    // Get today's reward based on streak
    _getReward(streak) {
        // Milestone rewards
        if (streak === 7)  return { type: 'card', label: 'Exclusive Card', icon: '\uD83C\uDCCF', desc: '7-day streak bonus!', bond: 5, affection: 3 };
        if (streak === 14) return { type: 'teaser', label: 'Premium Teaser', icon: '\uD83D\uDD2E', desc: '2-week dedication reward!', bond: 8, affection: 5 };
        if (streak === 30) return { type: 'rare', label: 'Rare Card', icon: '\u2B50', desc: 'One month of devotion!', bond: 15, affection: 10 };

        // Regular daily rewards cycle
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

        overlay.innerHTML = `
            <div class="dr-backdrop"></div>
            <div class="dr-card">
                <div class="dr-streak">\uD83D\uDD25 ${streak + 1} Day Streak</div>
                <div class="dr-calendar">${days.join('')}</div>
                <div class="dr-reward">
                    <div class="dr-reward-icon">${reward.icon}</div>
                    <div class="dr-reward-label">${reward.label}</div>
                    <div class="dr-reward-desc">${reward.desc}</div>
                </div>
                <button class="dr-claim-btn">Claim</button>
            </div>
        `;

        overlay.classList.remove('hidden');
        requestAnimationFrame(() => overlay.classList.add('visible'));

        // Claim button
        overlay.querySelector('.dr-claim-btn').addEventListener('click', () => {
            // Apply reward
            this.game.bond = Math.min(100, this.game.bond + (reward.bond || 0));
            this.game.affection = Math.min(100, this.game.affection + (reward.affection || 0));

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
