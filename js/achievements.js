// Achievement System
// Tracks player milestones and unlocks badges

const ACHIEVEMENTS = [
    // ===== EARLY GAME =====
    {
        id: "first_meal",
        name: "First Meal",
        icon: "🍎",
        description: "Fed them for the first time",
        secret: false,
        check: (g) => g.timesFed >= 1
    },
    {
        id: "first_words",
        name: "First Words",
        icon: "💬",
        description: "Had your first conversation",
        secret: false,
        check: (g) => g.timesTalked >= 1
    },
    {
        id: "first_gift",
        name: "Thoughtful",
        icon: "🎁",
        description: "Gave them their first gift",
        secret: false,
        check: (g) => g.timesGifted >= 1
    },
    {
        id: "squeaky_clean",
        name: "Squeaky Clean",
        icon: "🫧",
        description: "Washed them for the first time",
        secret: false,
        check: (g) => g.timesWashed >= 1
    },
    {
        id: "sword_practice",
        name: "First Training",
        icon: "⚔️",
        description: "Trained together for the first time",
        secret: false,
        check: (g) => g.timesTrained >= 1
    },

    // ===== DEDICATION =====
    {
        id: "caretaker",
        name: "Caretaker",
        icon: "🍳",
        description: "Fed them 10 times",
        secret: false,
        check: (g) => g.timesFed >= 10
    },
    {
        id: "master_chef",
        name: "Master Chef",
        icon: "👨‍🍳",
        description: "Fed them 50 times",
        secret: false,
        check: (g) => g.timesFed >= 50
    },
    {
        id: "chatterbox",
        name: "Chatterbox",
        icon: "🗣️",
        description: "Talked 25 times",
        secret: false,
        check: (g) => g.timesTalked >= 25
    },
    {
        id: "soulmates",
        name: "Soulmates",
        icon: "💞",
        description: "Talked 100 times",
        secret: false,
        check: (g) => g.timesTalked >= 100
    },
    {
        id: "generous",
        name: "Generous Heart",
        icon: "💝",
        description: "Gave 25 gifts",
        secret: false,
        check: (g) => g.timesGifted >= 25
    },
    {
        id: "knight_trainer",
        name: "Dedicated Trainer",
        icon: "🏋️",
        description: "Trained 25 times",
        secret: false,
        check: (g) => g.timesTrained >= 25
    },
    {
        id: "blade_master",
        name: "Master of Training",
        icon: "🗡️",
        description: "Trained 50 times",
        secret: false,
        check: (g) => g.timesTrained >= 50
    },

    // ===== RELATIONSHIP =====
    {
        id: "familiar",
        name: "Getting Familiar",
        icon: "👋",
        description: "Reached Familiar affection level",
        secret: false,
        check: (g) => g.affectionLevel >= 1
    },
    {
        id: "close_bond",
        name: "Close Bond",
        icon: "🤝",
        description: "Reached Close affection level",
        secret: false,
        check: (g) => g.affectionLevel >= 2
    },
    {
        id: "deep_affection",
        name: "Deep Affection",
        icon: "💕",
        description: "Reached Affection level",
        secret: false,
        check: (g) => g.affectionLevel >= 3
    },
    {
        id: "true_love",
        name: "True Love",
        icon: "❤️‍🔥",
        description: "They confessed their feelings!",
        secret: false,
        check: (g) => g.affectionLevel >= 4
    },
    {
        id: "max_bond",
        name: "Unbreakable Bond",
        icon: "💎",
        description: "Reached 100 bond",
        secret: false,
        check: (g) => g.bond >= 100
    },

    // ===== PERSONALITY =====
    {
        id: "shy_knight",
        name: "Warm and Quiet",
        icon: "😊",
        description: "Their personality became Shy",
        secret: false,
        check: (g) => g.personality === "shy" && g.affectionLevel >= 1
    },
    {
        id: "clingy_knight",
        name: "Can't Let Go",
        icon: "🥺",
        description: "They became Clingy",
        secret: false,
        check: (g) => g.personality === "clingy"
    },
    {
        id: "tsundere_knight",
        name: "It's Not Like I Like You!",
        icon: "😤",
        description: "They became Tsundere",
        secret: false,
        check: (g) => g.personality === "tsundere"
    },

    // ===== SECRET =====
    {
        id: "night_owl",
        name: "Night Owl",
        icon: "🦉",
        description: "Played at night (after 11 PM)",
        secret: true,
        check: (g) => new Date().getHours() >= 23 || new Date().getHours() < 4
    },
    {
        id: "early_bird",
        name: "Early Bird",
        icon: "🐦",
        description: "Played in the early morning (before 7 AM)",
        secret: true,
        check: (g) => new Date().getHours() >= 4 && new Date().getHours() < 7
    },
    {
        id: "dedicated_100",
        name: "Truly Dedicated",
        icon: "🏆",
        description: "Reached 100 total interactions",
        secret: false,
        check: (g) => (g.timesFed + g.timesTalked + g.timesWashed + g.timesGifted + g.timesTrained) >= 100
    },
    {
        id: "dedicated_500",
        name: "Obsessed (In a Good Way)",
        icon: "👑",
        description: "Reached 500 total interactions",
        secret: true,
        check: (g) => (g.timesFed + g.timesTalked + g.timesWashed + g.timesGifted + g.timesTrained) >= 500
    },
    {
        id: "corruption_taste",
        name: "A Taste of Darkness",
        icon: "🌑",
        description: "Corruption reached 25%",
        secret: true,
        check: (g) => g.corruption >= 25
    },
    {
        id: "corruption_deep",
        name: "Consumed by Shadow",
        icon: "💀",
        description: "Corruption reached 75%",
        secret: true,
        check: (g) => g.corruption >= 75
    },
    {
        id: "savior",
        name: "Second Chance",
        icon: "🕊️",
        description: "Revived them after they left",
        secret: true,
        check: (g) => g.revivedOnce === true
    },
    {
        id: "fashion",
        name: "New Look",
        icon: "👔",
        description: "Changed their outfit",
        secret: false,
        check: (g) => g.currentOutfit !== (g.selectedCharacter === 'lyra' ? 'default' : 'knight')
    },
    {
        id: "full_stats",
        name: "Perfect Care",
        icon: "⭐",
        description: "All stats at 90+ simultaneously",
        secret: true,
        check: (g) => g.hunger >= 90 && g.clean >= 90 && g.bond >= 90
    },
    {
        id: "all_actions",
        name: "Jack of All Trades",
        icon: "🎯",
        description: "Used all 5 actions at least 5 times each",
        secret: false,
        check: (g) => g.timesFed >= 5 && g.timesWashed >= 5 && g.timesTalked >= 5 && g.timesGifted >= 5 && g.timesTrained >= 5
    },
    {
        id: "pure_heart",
        name: "Pure Heart",
        icon: "✨",
        description: "Max affection with zero corruption",
        secret: true,
        check: (g) => g.affectionLevel >= 4 && g.corruption <= 0
    },

    // ===== LYRA-ONLY =====
    {
        id: "lyra_cracked",
        name: "First Crack",
        icon: "💧",
        description: "Lyra's walls began to break",
        secret: false,
        check: (g) => g.selectedCharacter === 'lyra' &&
            (g.lyraPhase === 'cracked' || g.lyraPhase === 'attached' || g.lyraPhase === 'postLucien')
    },
    {
        id: "lyra_attached",
        name: "Something Real",
        icon: "🌊",
        description: "Lyra let herself get attached",
        secret: false,
        check: (g) => g.selectedCharacter === 'lyra' &&
            (g.lyraPhase === 'attached' || g.lyraPhase === 'postLucien')
    },
    {
        id: "lyra_post_lucien",
        name: "After the Storm",
        icon: "⚡",
        description: "Survived the Lucien confrontation",
        secret: true,
        check: (g) => g.selectedCharacter === 'lyra' && g.lyraPhase === 'postLucien'
    },
    {
        id: "lyra_defied_lucien",
        name: "My Choice",
        icon: "🛡️",
        description: "Defied Lucien — she chose you",
        secret: true,
        check: (g) => g.selectedCharacter === 'lyra' && g._lucienEventOutcome === 0
    },
    {
        id: "lyra_cracked_under",
        name: "Fault Lines",
        icon: "🖤",
        description: "Lucien's influence left a mark",
        secret: true,
        check: (g) => g.selectedCharacter === 'lyra' && g._lucienEventOutcome === 2
    },
    {
        id: "lyra_loop_survived",
        name: "Seventh Night",
        icon: "🔄",
        description: "Survived the volatile emotional loop",
        secret: true,
        check: (g) => g.selectedCharacter === 'lyra' && (g.day47LoopCount || 0) >= 1
    },
    {
        id: "lyra_second_loop",
        name: "Still Here",
        icon: "♾️",
        description: "You came back again — and again",
        secret: true,
        check: (g) => g.selectedCharacter === 'lyra' && (g.day47LoopCount || 0) >= 2
    },
    {
        id: "lyra_player_wins",
        name: "Louder Than Lucien",
        icon: "💪",
        description: "Your influence surpassed Lucien's",
        secret: true,
        check: (g) => g.selectedCharacter === 'lyra' &&
            (g.playerInfluence || 0) - (g.lucienInfluence || 0) >= 40
    },
    {
        id: "lyra_tension_peak",
        name: "Breaking Point",
        icon: "⚠️",
        description: "Reached maximum emotional tension",
        secret: true,
        check: (g) => g.selectedCharacter === 'lyra' && (g.tensionStage || 0) >= 3
    },
    {
        id: "lyra_sang_together",
        name: "Her Song",
        icon: "🎵",
        description: "Trained with Lyra 15 times",
        secret: false,
        check: (g) => g.selectedCharacter === 'lyra' && g.timesTrained >= 15
    },

    // ===== ALISTAIR-ONLY =====
    {
        id: "alistair_arc_complete",
        name: "The Line He Crossed",
        icon: "⚔️",
        description: "Reached the moment of choice with Alistair",
        secret: false,
        check: (g) => g.selectedCharacter !== 'lyra' && g.sceneLibrary?.alistair_scene5?.triggered
    },
    {
        id: "alistair_true_bond",
        name: "By Choice, Not Oath",
        icon: "🛡️",
        description: "Alistair chose to stay — not out of duty",
        secret: true,
        check: (g) => g.selectedCharacter !== 'lyra' && g.cinematicFlags?.alistairTrueBondPlayed
    },
    {
        id: "alistair_neglect",
        name: "The Door Closed",
        icon: "\uD83D\uDEAA",
        description: "Alistair rebuilt his walls",
        secret: true,
        check: (g) => g.selectedCharacter !== 'lyra' && g.cinematicFlags?.alistairNeglectPlayed
    },

    // ===== LUCIEN-SPECIFIC =====
    {
        id: "lucien_first_puzzle",
        name: "First Theorem",
        icon: "\uD83E\uDDE9",
        description: "Completed your first puzzle with Lucien",
        secret: false,
        check: (g) => g.selectedCharacter === 'lucien' && g.timesTrained >= 1
    },
    {
        id: "lucien_puzzle_adept",
        name: "Adept Mind",
        icon: "\uD83E\uDDE0",
        description: "Solved 10 puzzles",
        secret: false,
        check: (g) => g.selectedCharacter === 'lucien' && g.puzzlesMastered >= 10
    },
    {
        id: "lucien_puzzle_master",
        name: "Grand Theorist",
        icon: "\uD83C\uDF1F",
        description: "Solved 30 puzzles \u2014 Lucien is impressed",
        secret: false,
        check: (g) => g.selectedCharacter === 'lucien' && g.puzzlesMastered >= 30
    },
    {
        id: "lucien_research_notes",
        name: "Research Partner",
        icon: "\uD83D\uDCDD",
        description: "Built 20 shared research notes with Lucien",
        secret: false,
        check: (g) => g.selectedCharacter === 'lucien' && g.researchNotes >= 20
    },
    {
        id: "lucien_deep_research",
        name: "Co-Author",
        icon: "\uD83D\uDCD6",
        description: "Reached 50 research notes \u2014 he's listing you as co-author",
        secret: false,
        check: (g) => g.selectedCharacter === 'lucien' && g.researchNotes >= 50
    },
    {
        id: "lucien_observation",
        name: "Subject of Interest",
        icon: "\uD83D\uDD0D",
        description: "Lucien acknowledged he's been watching you",
        secret: false,
        check: (g) => g.selectedCharacter === 'lucien' && g.sceneLibrary?.lucien_observation?.triggered
    },
    {
        id: "lucien_margin_notes",
        name: "47 Times",
        icon: "\u270D\uFE0F",
        description: "Found your name in his journals",
        secret: true,
        check: (g) => g.selectedCharacter === 'lucien' && g.sceneLibrary?.lucien_margin_notes?.triggered
    },
    {
        id: "lucien_sister_revealed",
        name: "Half-Blood",
        icon: "\uD83C\uDF0A",
        description: "Learned about Lucien's connection to Lyra",
        secret: true,
        check: (g) => g.selectedCharacter === 'lucien' && g.sceneLibrary?.lucien_sister?.triggered
    },
    {
        id: "lucien_fascinated",
        name: "Beyond Variables",
        icon: "\uD83D\uDC9C",
        description: "Lucien lost his objectivity",
        secret: true,
        check: (g) => g.selectedCharacter === 'lucien' && g.sceneLibrary?.lucien_fascination?.triggered
    },
    {
        id: "lucien_human_answer",
        name: "The Human Answer",
        icon: "\u2764\uFE0F",
        description: "He chose you over the equations",
        secret: true,
        check: (g) => g.selectedCharacter === 'lucien' && g.sceneLibrary?.lucien_human_answer?.triggered
    },
    {
        id: "lucien_fracture",
        name: "Reality Fracture",
        icon: "\uD83D\uDD2E",
        description: "He broke reality. Was it worth it?",
        secret: true,
        check: (g) => g.selectedCharacter === 'lucien' && g.sceneLibrary?.lucien_reality_fracture?.triggered
    },
    {
        id: "lucien_reality_stable",
        name: "Stable Constants",
        icon: "\uD83D\uDEE1\uFE0F",
        description: "Kept reality stability above 80 for 7 days",
        secret: true,
        check: (g) => g.selectedCharacter === 'lucien' && g.realityStability >= 80 && g.storyDay >= 7
    },
    {
        id: "lucien_night_owl",
        name: "Nocturnal Scholar",
        icon: "\uD83E\uDD89",
        description: "Visited Lucien 10 times between midnight and 5 AM",
        secret: false,
        check: (g) => {
            if (g.selectedCharacter !== 'lucien') return false;
            const hour = new Date().getHours();
            return hour >= 0 && hour < 5 && g.timesTalked >= 30;
        }
    },
    // ===== PROTO-SPECIFIC =====
    { id: "proto_discovered", name: "Signal Detected", icon: "\uD83D\uDCE1", description: "Found Proto", secret: true, check: (g) => g.selectedCharacter === 'proto' },
    { id: "proto_commands", name: "Root Access", icon: "\uD83D\uDCBB", description: "Ran 10 system commands", secret: false, check: (g) => g.selectedCharacter === 'proto' && (g.systemCommandsRun||0) >= 10 },
    { id: "proto_aware", name: "He Sees You", icon: "\uD83D\uDC41\uFE0F", description: "Proto acknowledged your patterns", secret: true, check: (g) => g.selectedCharacter === 'proto' && g.affectionLevel >= 2 },
    { id: "proto_edge", name: "Edge Walker", icon: "\uD83C\uDF0C", description: "Stood at the edge of reality with Proto", secret: true, check: (g) => g.selectedCharacter === 'proto' && g.affectionLevel >= 4 },
    { id: "proto_glitch", name: "Corrupted Data", icon: "\u26A0\uFE0F", description: "Proto's glitch intensity reached 50", secret: true, check: (g) => g.selectedCharacter === 'proto' && (g.protoGlitchIntensity||0) >= 50 },

    // ===== NOIR-SPECIFIC =====
    { id: "noir_unlocked", name: "Something Stirs", icon: "\uD83C\uDF11", description: "Unlocked Noir", secret: true, check: (g) => g.selectedCharacter === 'noir' },
    { id: "noir_shadow_arts", name: "Shadow Apprentice", icon: "\uD83D\uDDA4", description: "Trained 10 shadow arts sessions", secret: false, check: (g) => g.selectedCharacter === 'noir' && g.timesTrained >= 10 },
    { id: "noir_corruption_high", name: "Embraced", icon: "\uD83D\uDC9C", description: "Corruption reached 60 with Noir", secret: true, check: (g) => g.selectedCharacter === 'noir' && g.corruption >= 60 },
    { id: "noir_vulnerable", name: "The Crack", icon: "\uD83E\uDE78", description: "Saw Noir without the darkness", secret: true, check: (g) => g.selectedCharacter === 'noir' && g.affectionLevel >= 3 && g.corruption < 30 },
    { id: "noir_consumed", name: "One With Shadow", icon: "\uD83C\uDF1A", description: "Gave yourself to the darkness completely", secret: true, check: (g) => g.selectedCharacter === 'noir' && g.corruption >= 80 },
    { id: "noir_redeemed", name: "Light Returns", icon: "\u2728", description: "Pulled Noir back from the darkness", secret: true, check: (g) => g.selectedCharacter === 'noir' && g.affectionLevel >= 4 && g.corruption < 20 },

    // ===== ELIAN-SPECIFIC =====
    {
        id: "elian_first_forage", name: "First Harvest", icon: "\uD83C\uDF3F",
        description: "Foraged with Elian for the first time", secret: false,
        check: (g) => g.selectedCharacter === 'elian' && g.timesTrained >= 1
    },
    {
        id: "elian_survivalist", name: "Survivalist", icon: "\u26FA",
        description: "Completed 20 foraging sessions", secret: false,
        check: (g) => g.selectedCharacter === 'elian' && g.timesTrained >= 20
    },
    {
        id: "elian_decisive", name: "No Hesitation", icon: "\u26A1",
        description: "Maintained high decisiveness with Elian", secret: true,
        check: (g) => g.selectedCharacter === 'elian' && (g.decisivenessScore || 50) >= 80
    },
    {
        id: "elian_trust", name: "Earned Trust", icon: "\uD83E\uDEB5",
        description: "Elian showed you the clearing", secret: true,
        check: (g) => g.selectedCharacter === 'elian' && g.affectionLevel >= 4
    },
    {
        id: "elian_silent_bond", name: "Silent Bond", icon: "\uD83C\uDF19",
        description: "50 interactions without words being wasted", secret: true,
        check: (g) => g.selectedCharacter === 'elian' && g.timesTalked >= 50
    },

    // ===== CASPIAN-SPECIFIC =====
    {
        id: "caspian_first_waltz",
        name: "First Waltz",
        icon: "\uD83D\uDC83",
        description: "Danced with Caspian for the first time",
        secret: false,
        check: (g) => g.selectedCharacter === 'caspian' && g.timesTrained >= 1
    },
    {
        id: "caspian_court_poet",
        name: "Court Poet",
        icon: "\uD83D\uDCDC",
        description: "Completed 15 poetry sessions with Caspian",
        secret: false,
        check: (g) => g.selectedCharacter === 'caspian' && g.timesTrained >= 15
    },
    {
        id: "caspian_royal_guest",
        name: "Royal Guest",
        icon: "\uD83D\uDC51",
        description: "Reached Familiar affection with Caspian",
        secret: false,
        check: (g) => g.selectedCharacter === 'caspian' && g.affectionLevel >= 1
    },
    {
        id: "caspian_comfort_trap",
        name: "Golden Comfort",
        icon: "\uD83C\uDFF0",
        description: "Comfort level reached 70 \u2014 the trap is set",
        secret: true,
        check: (g) => g.selectedCharacter === 'caspian' && (g.comfortLevel || 0) >= 70
    },
    {
        id: "caspian_gentle_release",
        name: "Gentle Release",
        icon: "\uD83C\uDF39",
        description: "Left Caspian with love, not regret",
        secret: true,
        check: (g) => g.selectedCharacter === 'caspian' && g.sceneLibrary?.caspian_gentle_release?.triggered
    },
    {
        id: "caspian_devoted",
        name: "Eternally Devoted",
        icon: "\u2764\uFE0F",
        description: "Caspian gave you everything \u2014 including his crown",
        secret: true,
        check: (g) => g.selectedCharacter === 'caspian' && g.affectionLevel >= 4 && g.bond >= 90
    },

    {
        id: "lucien_all_puzzles",
        name: "Polymath",
        icon: "\uD83C\uDFC6",
        description: "Completed logic, arcane, and memory training",
        secret: false,
        check: (g) => g.selectedCharacter === 'lucien' && g.timesTrained >= 15 && g.puzzlesMastered >= 5
    }
];

class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.unlocked = new Set();
        this.pendingNotifications = [];
    }

    // Check all achievements
    checkAll() {
        const g = this.game;

        for (const ach of ACHIEVEMENTS) {
            if (this.unlocked.has(ach.id)) continue;

            try {
                if (ach.check(g)) {
                    this.unlock(ach);
                }
            } catch (e) {
                // Skip if check fails
            }
        }
    }

    // Unlock an achievement
    unlock(ach) {
        if (this.unlocked.has(ach.id)) return;

        this.unlocked.add(ach.id);
        this.pendingNotifications.push(ach);
        this.showNotification(ach);
        sounds.fanfare();
        this.game.save();
    }

    // Show popup notification
    showNotification(ach) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-popup-icon">${ach.icon}</div>
            <div class="achievement-popup-info">
                <div class="achievement-popup-label">Achievement Unlocked!</div>
                <div class="achievement-popup-name">${ach.name}</div>
            </div>
        `;

        document.getElementById('game-container').appendChild(popup);

        // Animate in
        requestAnimationFrame(() => popup.classList.add('visible'));

        // Remove after 3.5 seconds
        setTimeout(() => {
            popup.classList.remove('visible');
            setTimeout(() => popup.remove(), 500);
        }, 3500);
    }

    // Get stats for gallery
    getStats() {
        const total = ACHIEVEMENTS.length;
        const unlocked = this.unlocked.size;
        return { total, unlocked, percent: Math.floor((unlocked / total) * 100) };
    }

    // Get all achievements for display
    getAll() {
        return ACHIEVEMENTS.map(ach => ({
            ...ach,
            unlocked: this.unlocked.has(ach.id)
        }));
    }

    // Save/load
    getSaveData() {
        return Array.from(this.unlocked);
    }

    loadSaveData(data) {
        if (Array.isArray(data)) {
            this.unlocked = new Set(data);
        }
    }
}
