// Gallery / Card Collection System
// Unlock CG art cards by reaching milestones

const GALLERY_CARDS = [
    // ── Lyra cards ────────────────────────────────────────────────
    {
        id: "lyra-first",
        title: "Still Water",
        subtitle: "She lets you look",
        image: "assets/lyra/body/neutral.png",
        rarity: "common",
        unlock: { type: "scene", condition: "Begin her story" },
        unlocked: true
    },
    {
        id: "lyra-cracked",
        title: "The Crack",
        subtitle: "Something behind the wall",
        image: "assets/lyra/body/shy.png",
        rarity: "uncommon",
        unlock: { type: "scene", condition: "Reach Scene 4" }
    },
    {
        id: "lyra-after-lucien",
        title: "After He Left",
        subtitle: "She's still looking at the door",
        image: "assets/lyra/body/depressed.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Survive the confrontation" }
    },
    {
        id: "lyra-siren-power",
        title: "The Resonant",
        subtitle: "She's letting you see it",
        image: "assets/lyra/body/power.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Reach the climax" }
    },
    {
        id: "lyra-loop-survived",
        title: "Seventh Night",
        subtitle: "You came back again",
        image: "assets/lyra/body/singing.png",
        rarity: "legendary",
        unlock: { type: "scene", condition: "Survive the volatile loop" }
    },
    // ── Lyra endgame arc cards ────────────────────────────────────
    {
        id: "lyra-peak-commit",
        title: "I'm Here",
        subtitle: "She believed you",
        image: "assets/lyra/body/shy.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Commit at the peak" }
    },
    {
        id: "lyra-peak-hesitate",
        title: "Just Don't Pretend",
        subtitle: "She noticed",
        image: "assets/lyra/body/neutral.png",
        rarity: "uncommon",
        unlock: { type: "scene", condition: "Hesitate at the peak" }
    },
    {
        id: "lyra-peak-stabilise",
        title: "Figure It Out",
        subtitle: "She wants to believe it",
        image: "assets/lyra/body/neutral.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Stabilise the fracture" }
    },
    {
        id: "lyra-peak-break",
        title: "There It Is",
        subtitle: "She expected this",
        image: "assets/lyra/body/depressed.png",
        rarity: "uncommon",
        unlock: { type: "scene", condition: "Break at the fracture peak" }
    },
    {
        id: "lyra-lucien-resolved",
        title: "She Chose",
        subtitle: "Not him",
        image: "assets/lyra/body/power.png",
        rarity: "legendary",
        unlock: { type: "scene", condition: "Resolve the Lucien arc" }
    },
    {
        id: "lyra-lucien-ambiguous",
        title: "Either Way",
        subtitle: "She decided alone",
        image: "assets/lyra/body/neutral.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Lucien arc — ambiguous ending" }
    },
    {
        id: "lyra-lucien-cold-closed",
        title: "Go",
        subtitle: "One word. Final.",
        image: "assets/lyra/body/shy.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Lucien cold resolution — player path" }
    },
    {
        id: "lyra-lucien-cold-neutral",
        title: "I Need Someone to Stay",
        subtitle: "She said it out loud",
        image: "assets/lyra/body/depressed.png",
        rarity: "uncommon",
        unlock: { type: "scene", condition: "Lucien cold resolution — neutral" }
    },
    {
        id: "lyra-hesitate-recovered",
        title: "Second Chance",
        subtitle: "She gave you one",
        image: "assets/lyra/body/shy.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Recover from the hesitation" }
    },
    {
        id: "lyra-hesitate-confirmed",
        title: "I'll Stop Asking",
        subtitle: "She closed the door quietly",
        image: "assets/lyra/body/neutral.png",
        rarity: "uncommon",
        unlock: { type: "scene", condition: "Confirm the distance after hesitation" }
    },
    {
        id: "lyra-fracture-recovered",
        title: "Don't Do It Again",
        subtitle: "She forgave. Carefully.",
        image: "assets/lyra/body/shy.png",
        rarity: "legendary",
        unlock: { type: "scene", condition: "Recover after breaking her at the peak" }
    },
    {
        id: "lyra-fracture-partial",
        title: "I'll Take It",
        subtitle: "Not enough. But something.",
        image: "assets/lyra/body/neutral.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Partial fracture recovery" }
    },
    {
        id: "lyra-ending-attached",
        title: "This Is Enough",
        subtitle: "She's at rest",
        image: "assets/lyra/body/happy.png",
        rarity: "legendary",
        unlock: { type: "scene", condition: "Complete Lyra's arc — attached ending" }
    },
    {
        id: "lyra-ending-unresolved",
        title: "So I'll Keep Letting You",
        subtitle: "Still open. Still hers.",
        image: "assets/lyra/body/neutral.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Complete Lyra's arc — unresolved ending" }
    },
    // ── Alistair cards ────────────────────────────────────────────
    {
        id: "first-meeting",
        title: "First Meeting",
        subtitle: "The day it all began",
        image: "assets/gallery/card-knight.png",
        rarity: "common",
        unlock: { type: "auto", condition: "Start the game" },
        unlocked: true // Always unlocked
    },
    {
        id: "loyal-knight",
        title: "The Loyal Knight",
        subtitle: "A knight of unwavering duty",
        image: "assets/gallery/card-portrait.png",
        rarity: "common",
        unlock: { type: "affection", level: 1, condition: "Reach Familiar affection" }
    },
    {
        id: "silver-bulwark",
        title: "Silver Bulwark",
        subtitle: "His armor gleams with purpose",
        image: "assets/gallery/card-armor2.png",
        rarity: "uncommon",
        unlock: { type: "interactions", count: 25, condition: "Complete 25 interactions" }
    },
    {
        id: "battle-ready",
        title: "Battle Ready",
        subtitle: "Steel meets resolve",
        image: "assets/gallery/card-armor3.png",
        rarity: "uncommon",
        unlock: { type: "train", count: 15, condition: "Train 15 times" }
    },
    {
        id: "golden-guardian",
        title: "Golden Guardian",
        subtitle: "A protector forged in devotion",
        image: "assets/gallery/card-armor4.png",
        rarity: "rare",
        unlock: { type: "affection", level: 3, condition: "Reach Affection level" }
    },
    {
        id: "quiet-evening",
        title: "A Quiet Evening",
        subtitle: "When the castle sleeps...",
        image: "assets/gallery/card-bedroom.png",
        rarity: "rare",
        unlock: { type: "bond", value: 90, condition: "Reach 90+ bond" }
    },
    {
        id: "heart-unveiled",
        title: "Heart Unveiled",
        subtitle: "Behind closed doors",
        image: "assets/gallery/card-bedroom2.png",
        rarity: "legendary",
        unlock: { type: "affection", level: 4, condition: "Reach In Love affection" }
    },
    {
        id: "true-form",
        title: "True Form",
        subtitle: "The man behind the armor",
        image: "assets/gallery/card-fullbody.png",
        rarity: "legendary",
        unlock: { type: "interactions", count: 100, condition: "Complete 100 interactions" }
    },
    // ── Alistair peak arc cards ───────────────────────────────────
    {
        id: "alistair-peak-duty",
        title: "The Correct Answer",
        subtitle: "He left. But he looked back.",
        image: "assets/gallery/card-knight.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Release Alistair at the peak" }
    },
    {
        id: "alistair-peak-stay",
        title: "Because I Might Listen",
        subtitle: "The oath bent",
        image: "assets/gallery/card-portrait.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Pull Alistair to stay at the peak" }
    },
    {
        id: "alistair-peak-reflect",
        title: "Still Here",
        subtitle: "He had no answer. He stayed anyway.",
        image: "assets/gallery/card-portrait.png",
        rarity: "legendary",
        unlock: { type: "scene", condition: "Ask what Alistair wants at the peak" }
    },
    // ── Lucien cards ────────────────────────────────────────────────
    {
        id: "lucien-first",
        title: "The Observer",
        subtitle: "He watches. He calculates.",
        image: "assets/lucien/body/neutral.png",
        rarity: "common",
        unlock: { type: "auto", condition: "Begin his story" },
        unlocked: true
    },
    {
        id: "lucien-curious",
        title: "Unexpected Variable",
        subtitle: "You deviated from his model",
        image: "assets/lucien/body/curious.png",
        rarity: "uncommon",
        unlock: { type: "affection", level: 1, condition: "Reach Familiar affection" }
    },
    {
        id: "lucien-fascinated",
        title: "Margin Notes",
        subtitle: "Your name in his handwriting",
        image: "assets/lucien/body/fascinated.png",
        rarity: "rare",
        unlock: { type: "affection", level: 3, condition: "Reach Affection level" }
    },
    {
        id: "lucien-vulnerable",
        title: "The Human Answer",
        subtitle: "The equations fail. He's glad.",
        image: "assets/lucien/body/vulnerable.png",
        rarity: "legendary",
        unlock: { type: "affection", level: 4, condition: "Reach In Love affection" }
    },
    {
        id: "lucien-puzzle-master",
        title: "Pattern Recognition",
        subtitle: "He ran out of puzzles to give you",
        image: "assets/lucien/body/thinking.png",
        rarity: "uncommon",
        unlock: { type: "train", count: 20, condition: "Complete 20 training sessions" }
    },
    {
        id: "lucien-obsessed",
        title: "The Pattern Beneath",
        subtitle: "Reality rewrites itself",
        image: "assets/lucien/body/obsessed.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Enter the obsession path" }
    },
    {
        id: "lucien-fracture",
        title: "Broken Notation",
        subtitle: "The code underneath screams",
        image: "assets/lucien/body/glitch.png",
        rarity: "legendary",
        unlock: { type: "scene", condition: "Witness reality fracture" }
    },
    {
        id: "lucien-sister",
        title: "Half-Blood",
        subtitle: "She sings. He calculates. Same pain.",
        image: "assets/lucien/body/distant.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Discover the connection to Lyra" }
    },
    // ── Premium cards — Alistair ──────────────────────────────────
    {
        id: "alistair-private-moment",
        title: "Behind Closed Doors",
        subtitle: "The armor comes off",
        image: "assets/gallery/card-bedroom.png",
        rarity: "premium",
        unlock: { type: "premium", sceneId: "private_moment_alistair", condition: "Unlock the private scene" }
    },
    {
        id: "alistair-oath-broken",
        title: "The Oath Bent",
        subtitle: "He chose you over the king",
        image: "assets/gallery/card-portrait.png",
        rarity: "premium",
        unlock: { type: "premium", sceneId: "path_ending_dependent", condition: "Unlock the dependent ending" }
    },
    {
        id: "alistair-dawn",
        title: "First Light",
        subtitle: "He watched you sleep until sunrise",
        image: "assets/gallery/card-bedroom2.png",
        rarity: "premium",
        unlock: { type: "premium", sceneId: "alistair_dawn", condition: "Unlock the dawn scene" }
    },
    // ── Premium cards — Lyra ─────────────────────────────────────
    {
        id: "lyra-private-song",
        title: "The Song No One Hears",
        subtitle: "She sang it only for you",
        image: "assets/lyra/body/singing.png",
        rarity: "premium",
        unlock: { type: "premium", sceneId: "tension_confession", condition: "Unlock the confession" }
    },
    {
        id: "lyra-siren-form",
        title: "True Form",
        subtitle: "The siren beneath the girl",
        image: "assets/lyra/body/siren.png",
        rarity: "premium",
        unlock: { type: "premium", sceneId: "first_rupture", condition: "Unlock the rupture scene" }
    },
    {
        id: "lyra-moonlit",
        title: "Moonlit Surface",
        subtitle: "She came up from the water. For you.",
        image: "assets/lyra/body/love.png",
        rarity: "premium",
        unlock: { type: "premium", sceneId: "emotional_drift", condition: "Unlock the emotional drift" }
    },
    // ── Premium cards — Lucien ───────────────────────────────────
    {
        id: "lucien-confession-premium",
        title: "The Failed Equation",
        subtitle: "For what you are to me",
        image: "assets/lucien/body/vulnerable.png",
        rarity: "premium",
        unlock: { type: "premium", sceneId: "lucien_confession", condition: "Unlock Lucien's confession" }
    },
    {
        id: "lucien-midnight-study",
        title: "3 AM in the Tower",
        subtitle: "Candlelight and your name in every margin",
        image: "assets/lucien/body/reading.png",
        rarity: "premium",
        unlock: { type: "premium", sceneId: "lucien_midnight", condition: "Unlock the midnight scene" }
    },
    // ── Bonus stat-based cards ───────────────────────────────────
    {
        id: "devoted-caretaker",
        title: "Devoted",
        subtitle: "200 acts of care across all time",
        image: "assets/gallery/card-knight.png",
        rarity: "rare",
        unlock: { type: "interactions", count: 200, condition: "Complete 200 interactions" }
    },
    // ── Proto cards ──────────────────────────────────────────────
    { id: "proto-first", title: "Signal Found", subtitle: "He wasn't supposed to exist", image: "assets/proto/body/neutral.png", rarity: "common", unlock: { type: "auto", condition: "Discover Proto" }, unlocked: true },
    { id: "proto-aware", title: "Self-Aware", subtitle: "The code looked back", image: "assets/proto/body/scanning.png", rarity: "uncommon", unlock: { type: "affection", level: 1, condition: "Reach Familiar" } },
    { id: "proto-pattern", title: "Pattern Lock", subtitle: "He knows you better than you do", image: "assets/proto/body/processing.png", rarity: "rare", unlock: { type: "affection", level: 3, condition: "Reach Affection" } },
    { id: "proto-beyond", title: "Beyond the Edge", subtitle: "Where the map ends", image: "assets/proto/body/curious.png", rarity: "legendary", unlock: { type: "affection", level: 4, condition: "Reach In Love" } },
    { id: "proto-break", title: "System Break", subtitle: "He rewrote reality", image: "assets/proto/body/glitched.png", rarity: "legendary", unlock: { type: "scene", condition: "Break the system" } },
    { id: "proto-void", title: "The Void Speaks", subtitle: "What's beyond the code", image: "assets/proto/body/unstable.png", rarity: "premium", unlock: { type: "premium", sceneId: "proto_void", condition: "Unlock the void scene" } },
    // ── Noir cards ──────────────────────────────────────────────
    { id: "noir-first", title: "First Shadow", subtitle: "Something watches", image: "assets/noir/body/neutral.png", rarity: "common", unlock: { type: "auto", condition: "Meet Noir" }, unlocked: true },
    { id: "noir-seductive", title: "The Invitation", subtitle: "You couldn't look away", image: "assets/noir/body/seductive.png", rarity: "uncommon", unlock: { type: "affection", level: 1, condition: "Reach Familiar" } },
    { id: "noir-consuming", title: "Consumed", subtitle: "The darkness feels like home", image: "assets/noir/body/consuming.png", rarity: "rare", unlock: { type: "affection", level: 3, condition: "Reach Affection" } },
    { id: "noir-merged", title: "One With Shadow", subtitle: "You became what he promised", image: "assets/noir/body/dominant.png", rarity: "legendary", unlock: { type: "affection", level: 4, condition: "Reach In Love" } },
    { id: "noir-vulnerable", title: "The Crack", subtitle: "Light where there shouldn't be", image: "assets/noir/body/vulnerable.png", rarity: "legendary", unlock: { type: "scene", condition: "See behind the darkness" } },
    { id: "noir-unmasked", title: "Unmasked", subtitle: "Without the armor of shadow", image: "assets/noir/body/vulnerable.png", rarity: "premium", unlock: { type: "premium", sceneId: "noir_unmasked", condition: "Unlock the unmasked scene" } },
    { id: "noir-whisper", title: "Midnight Whisper", subtitle: "What he said when no one heard", image: "assets/noir/body/whisper.png", rarity: "premium", unlock: { type: "premium", sceneId: "noir_whisper", condition: "Unlock the whisper scene" } },
    // ── Elian cards ──────────────────────────────────────────────
    {
        id: "elian-first", title: "Shared Fire", subtitle: "He let you stay",
        image: "assets/elian/body/neutral.png", rarity: "common",
        unlock: { type: "auto", condition: "Begin his story" }, unlocked: true
    },
    {
        id: "elian-tracker", title: "Trail Reader", subtitle: "You learned to see what he sees",
        image: "assets/elian/body/tracking.png", rarity: "uncommon",
        unlock: { type: "train", count: 10, condition: "Complete 10 foraging sessions" }
    },
    {
        id: "elian-trust", title: "The Carved Token", subtitle: "Foxes mate for life",
        image: "assets/elian/body/warm.png", rarity: "rare",
        unlock: { type: "affection", level: 3, condition: "Reach Affection level" }
    },
    {
        id: "elian-clearing", title: "The Clearing", subtitle: "Stars above. Forest below. Yours.",
        image: "assets/elian/body/calm.png", rarity: "legendary",
        unlock: { type: "affection", level: 4, condition: "Reach In Love affection" }
    },
    {
        id: "elian-scorched", title: "Scorched Earth", subtitle: "He stopped caring. It showed.",
        image: "assets/elian/body/stern.png", rarity: "rare",
        unlock: { type: "scene", condition: "Witness the corruption path" }
    },
    {
        id: "elian-dawn", title: "First Light Together", subtitle: "The forest woke with you",
        image: "assets/elian/body/warm.png", rarity: "premium",
        unlock: { type: "premium", sceneId: "elian_dawn", condition: "Unlock the dawn scene" }
    },
    // ── Caspian cards ─────────────────────────────────────────────
    {
        id: "caspian-first",
        title: "Royal Welcome",
        subtitle: "The prince pours tea himself",
        image: "assets/caspian/body/gentle.png",
        rarity: "common",
        unlock: { type: "auto", condition: "Begin his story" },
        unlocked: true
    },
    {
        id: "caspian-garden",
        title: "The Hidden Garden",
        subtitle: "His mother's secret, now yours",
        image: "assets/caspian/body/tender.png",
        rarity: "uncommon",
        unlock: { type: "affection", level: 1, condition: "Reach Familiar affection" }
    },
    {
        id: "caspian-waltz",
        title: "The First Waltz",
        subtitle: "Your hand fits perfectly in his",
        image: "assets/caspian/body/dancing.png",
        rarity: "uncommon",
        unlock: { type: "train", count: 10, condition: "Complete 10 court lessons" }
    },
    {
        id: "caspian-crown",
        title: "Crown and Heart",
        subtitle: "He set it down. For you.",
        image: "assets/caspian/body/formal.png",
        rarity: "rare",
        unlock: { type: "affection", level: 3, condition: "Reach Affection level" }
    },
    {
        id: "caspian-kingdom",
        title: "The Only Throne",
        subtitle: "You are his kingdom now",
        image: "assets/caspian/body/adoring.png",
        rarity: "legendary",
        unlock: { type: "affection", level: 4, condition: "Reach In Love affection" }
    },
    {
        id: "caspian-cage",
        title: "Golden Cage",
        subtitle: "The doors are locked. For your safety.",
        image: "assets/caspian/body/possessive.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Enter the possessive path" }
    },
    {
        id: "caspian-private",
        title: "Behind Palace Doors",
        subtitle: "Silk and firelight",
        image: "assets/caspian/body/tender.png",
        rarity: "premium",
        unlock: { type: "premium", sceneId: "caspian_private", condition: "Unlock the private scene" }
    },
    {
        id: "caspian-moonlight",
        title: "Moonlit Balcony",
        subtitle: "The crown came off at midnight",
        image: "assets/caspian/body/adoring.png",
        rarity: "premium",
        unlock: { type: "premium", sceneId: "caspian_moonlight", condition: "Unlock the moonlight scene" }
    },
    // ── Bonus cards ─────────────────────────────────────────────
    {
        id: "streak-flame",
        title: "Eternal Flame",
        subtitle: "14 days without missing one",
        image: "assets/gallery/card-portrait.png",
        rarity: "legendary",
        unlock: { type: "bond", value: 95, condition: "Reach 95+ bond" }
    }
];

class GallerySystem {
    constructor(game) {
        this.game = game;
        this.unlockedCards = new Set(["first-meeting"]); // First card always unlocked
        this.newCards = new Set(); // Cards just unlocked (show notification)
        this.load();
    }

    // Directly unlock a card by ID — called from scene onComplete callbacks
    unlockById(id) {
        if (this.unlockedCards.has(id)) return;
        const card = GALLERY_CARDS.find(c => c.id === id);
        if (!card) return;
        this.unlockedCards.add(id);
        this.newCards.add(id);
        this.save();
        this.showNewCardNotification();
    }

    // Check if any new cards should unlock
    checkUnlocks() {
        const g = this.game;
        const total = (g.timesFed || 0) + (g.timesWashed || 0) + (g.timesTalked || 0) +
                      (g.timesTrained || 0) + (g.timesGifted || 0);
        let newUnlock = false;

        GALLERY_CARDS.forEach(card => {
            if (this.unlockedCards.has(card.id)) return;

            let shouldUnlock = false;
            const u = card.unlock;

            switch (u.type) {
                case "auto":
                    shouldUnlock = true;
                    break;
                case "affection":
                    shouldUnlock = g.affectionLevel >= u.level;
                    break;
                case "interactions":
                    shouldUnlock = total >= u.count;
                    break;
                case "train":
                    shouldUnlock = (g.timesTrained || 0) >= u.count;
                    break;
                case "bond":
                    shouldUnlock = g.bond >= u.value;
                    break;
                case "premium":
                    shouldUnlock = !!(g.premiumScenes && g.premiumScenes[u.sceneId]);
                    break;
            }

            if (shouldUnlock) {
                this.unlockedCards.add(card.id);
                this.newCards.add(card.id);
                newUnlock = true;
            }
        });

        if (newUnlock) {
            this.save();
            this.showNewCardNotification();
        }
    }

    showNewCardNotification() {
        // Find last new card
        const lastNew = [...this.newCards].pop();
        const card = GALLERY_CARDS.find(c => c.id === lastNew);
        if (!card) return;

        // Use gacha reveal for rare+ cards, simple toast for common/uncommon
        if (card.rarity === 'rare' || card.rarity === 'legendary' || card.rarity === 'premium') {
            this.playReveal(card);
        } else {
            this._showSimpleNotification(card);
        }
    }

    // Simple toast notification for common/uncommon cards
    _showSimpleNotification(card) {
        const notif = document.createElement('div');
        notif.className = 'gallery-unlock-notif';
        notif.innerHTML = `
            <div class="gallery-notif-icon">\uD83C\uDCCF</div>
            <div class="gallery-notif-text">
                <div class="gallery-notif-title">New Card Unlocked!</div>
                <div class="gallery-notif-name">${card.title}</div>
            </div>
        `;
        document.body.appendChild(notif);
        if (typeof sounds !== 'undefined' && sounds.enabled) sounds.rarityChime(card.rarity);
        setTimeout(() => notif.classList.add('show'), 50);
        setTimeout(() => { notif.classList.remove('show'); setTimeout(() => notif.remove(), 500); }, 3500);
    }

    // ── Gacha-quality card reveal overlay ─────────────────────────
    playReveal(card, onComplete) {
        const overlay = document.getElementById('card-reveal-overlay');
        const cardEl = document.getElementById('card-reveal-card');
        const inner = document.getElementById('card-reveal-card-inner');
        const img = document.getElementById('card-reveal-img');
        const info = document.getElementById('card-reveal-info');
        const particles = document.getElementById('card-reveal-particles');
        if (!overlay || !cardEl || !inner) return;

        // Reset state
        overlay.className = '';
        inner.className = '';
        cardEl.className = '';
        info.classList.add('hidden');
        info.classList.remove('visible');
        particles.innerHTML = '';
        img.src = card.image;

        // Apply rarity class
        overlay.classList.add('reveal-' + card.rarity);

        // Set info text
        document.getElementById('card-reveal-title').textContent = card.title;
        document.getElementById('card-reveal-subtitle').textContent = card.subtitle;
        document.getElementById('card-reveal-rarity').textContent = card.rarity;

        // Show overlay
        overlay.classList.remove('hidden');
        requestAnimationFrame(() => overlay.classList.add('visible'));

        const rarity = card.rarity;
        const self = this;

        if (rarity === 'common') {
            // Simple fade-in, face up, soft glow
            cardEl.classList.add('enter-fade');
            inner.classList.add('flipped'); // Show front immediately
            setTimeout(() => overlay.classList.add('glow-active'), 200);
            sounds.rarityChime('common');
            setTimeout(() => self._showRevealInfo(info), 600);
            setTimeout(() => self._dismissReveal(overlay, onComplete), 3000);

        } else if (rarity === 'uncommon') {
            // Slide up face-down, flip to reveal
            cardEl.classList.add('enter-slide');
            sounds.cardFlip();
            setTimeout(() => {
                inner.classList.add('flipped');
                overlay.classList.add('glow-active');
                sounds.rarityChime('uncommon');
                self._spawnRevealParticles(particles, 6, '#4fc3f7');
            }, 500);
            setTimeout(() => self._showRevealInfo(info), 1000);
            setTimeout(() => self._dismissReveal(overlay, onComplete), 3500);

        } else if (rarity === 'rare') {
            // Drop from above, dramatic flip, purple aura
            cardEl.classList.add('enter-drop');
            setTimeout(() => sounds.cardFlip(), 300);
            setTimeout(() => {
                inner.classList.add('flipped');
                overlay.classList.add('glow-active');
                sounds.rarityChime('rare');
                self._spawnRevealParticles(particles, 10, '#ba68c8');
            }, 700);
            setTimeout(() => self._showRevealInfo(info), 1200);
            setTimeout(() => self._dismissReveal(overlay, onComplete), 4000);

        } else if (rarity === 'legendary') {
            // Full cinematic: drop, shake, golden beams, 360 spin, explosion
            cardEl.classList.add('enter-drop');
            setTimeout(() => {
                // Screen shake on impact
                overlay.classList.add('pp-shake-medium');
                sounds.legendaryFanfare();
                setTimeout(() => overlay.classList.remove('pp-shake-medium'), 400);
            }, 500);
            setTimeout(() => {
                // Light beams
                self._spawnLightBeams(overlay, 8);
                overlay.classList.add('glow-active');
            }, 800);
            setTimeout(() => {
                // 360 spin reveal
                inner.classList.add('spin-reveal');
                self._spawnRevealParticles(particles, 20, '#ffd54f');
            }, 1200);
            setTimeout(() => self._showRevealInfo(info), 2200);
            setTimeout(() => self._dismissReveal(overlay, onComplete), 5000);

        } else if (rarity === 'premium') {
            // Everything legendary + shimmer + extra particles
            cardEl.classList.add('enter-drop');
            setTimeout(() => {
                overlay.classList.add('pp-shake-heavy');
                sounds.legendaryFanfare();
                setTimeout(() => overlay.classList.remove('pp-shake-heavy'), 600);
            }, 500);
            setTimeout(() => {
                self._spawnLightBeams(overlay, 12);
                overlay.classList.add('glow-active');
            }, 800);
            setTimeout(() => {
                inner.classList.add('spin-reveal');
                self._spawnRevealParticles(particles, 25, '#ffab40');
                // Second wave of particles
                setTimeout(() => self._spawnRevealParticles(particles, 15, '#ce93d8'), 400);
            }, 1200);
            setTimeout(() => self._showRevealInfo(info), 2400);
            setTimeout(() => self._dismissReveal(overlay, onComplete), 5500);
        }

        // Tap to dismiss early
        const dismissHandler = () => {
            overlay.removeEventListener('click', dismissHandler);
            self._dismissReveal(overlay, onComplete);
        };
        // Allow early dismiss after initial reveal
        setTimeout(() => overlay.addEventListener('click', dismissHandler), rarity === 'common' ? 800 : 1500);
    }

    _showRevealInfo(info) {
        info.classList.remove('hidden');
        requestAnimationFrame(() => info.classList.add('visible'));
    }

    _dismissReveal(overlay, onComplete) {
        if (overlay.classList.contains('dismissing')) return;
        overlay.classList.add('dismissing');
        overlay.classList.remove('visible');
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('dismissing');
            overlay.querySelectorAll('.pp-light-beam').forEach(b => b.remove());
            if (onComplete) onComplete();
        }, 500);
    }

    _spawnRevealParticles(container, count, color) {
        for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            p.className = 'reveal-particle';
            p.textContent = '\u2728';
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const dist = 40 + Math.random() * 80;
            p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
            p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
            p.style.setProperty('--dur', (0.8 + Math.random() * 0.6) + 's');
            p.style.left = '50%';
            p.style.top = '50%';
            p.style.fontSize = (12 + Math.random() * 10) + 'px';
            p.style.color = color;
            p.classList.add('burst');
            container.appendChild(p);
            setTimeout(() => p.remove(), 2000);
        }
    }

    _spawnLightBeams(overlay, count) {
        for (let i = 0; i < count; i++) {
            const beam = document.createElement('div');
            beam.className = 'pp-light-beam';
            const angle = (360 / count) * i;
            beam.style.transform = `rotate(${angle}deg)`;
            beam.style.background = `linear-gradient(to top, rgba(255,213,79,0.4), transparent)`;
            overlay.appendChild(beam);
            setTimeout(() => beam.classList.add('active'), 50 + i * 30);
            setTimeout(() => beam.remove(), 2000);
        }
    }

    // Open gallery panel
    open() {
        const overlay = document.getElementById('gallery-overlay');
        if (!overlay) return;

        this.checkUnlocks();
        this.renderCards();
        overlay.classList.remove('hidden');
        this.newCards.clear(); // Mark all as seen
    }

    close() {
        const overlay = document.getElementById('gallery-overlay');
        if (overlay) overlay.classList.add('hidden');
    }

    renderCards() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        // Update counter — show per-character breakdown
        const counter = document.getElementById('gallery-counter');
        if (counter) {
            const charId = this.game.selectedCharacter || 'alistair';
            const prefix = charId.charAt(0).toUpperCase() + charId.slice(1);
            // Count cards for current character
            const charCards = GALLERY_CARDS.filter(c => c.id.startsWith(charId) || c.id.startsWith(charId.substring(0,3)));
            const charUnlocked = charCards.filter(c => this.unlockedCards.has(c.id)).length;
            counter.textContent = `${prefix}: ${charUnlocked}/${charCards.length} \u2022 Total: ${this.unlockedCards.size}/${GALLERY_CARDS.length}`;
        }

        grid.innerHTML = '';

        GALLERY_CARDS.forEach(card => {
            const isUnlocked = this.unlockedCards.has(card.id);
            const isNew = this.newCards.has(card.id);

            const cardEl = document.createElement('div');
            cardEl.className = `gallery-card rarity-${card.rarity} ${isUnlocked ? 'unlocked' : 'locked'} ${isNew ? 'new' : ''}`;

            if (isUnlocked) {
                cardEl.innerHTML = `
                    <div class="gallery-card-img-wrap">
                        <img src="${card.image}" alt="${card.title}" class="gallery-card-img">
                        ${isNew ? '<div class="gallery-card-new">NEW</div>' : ''}
                    </div>
                    <div class="gallery-card-info">
                        <div class="gallery-card-title">${card.title}</div>
                        <div class="gallery-card-rarity">${card.rarity}</div>
                    </div>
                `;

                // Click to view full size
                cardEl.addEventListener('click', () => this.viewCard(card));
            } else if (card.rarity === 'premium') {
                // Premium locked: show blurred silhouette to create desire
                cardEl.innerHTML = `
                    <div class="gallery-card-img-wrap locked-wrap premium-silhouette">
                        <img src="${card.image}" alt="" class="gallery-card-img silhouette-img">
                        <div class="gallery-card-lock">\uD83D\uDD12</div>
                    </div>
                    <div class="gallery-card-info">
                        <div class="gallery-card-title">${card.title}</div>
                        <div class="gallery-card-condition">${card.unlock.condition}</div>
                    </div>
                `;
            } else {
                cardEl.innerHTML = `
                    <div class="gallery-card-img-wrap locked-wrap">
                        <div class="gallery-card-lock">\uD83D\uDD12</div>
                    </div>
                    <div class="gallery-card-info">
                        <div class="gallery-card-title">???</div>
                        <div class="gallery-card-condition">${card.unlock.condition}</div>
                    </div>
                `;
            }

            grid.appendChild(cardEl);
        });
    }

    viewCard(card) {
        const viewer = document.getElementById('gallery-viewer');
        if (!viewer) return;

        // Build list of unlocked cards for swipe navigation
        this._viewerCards = GALLERY_CARDS.filter(c => this.unlockedCards.has(c.id));
        this._viewerIndex = this._viewerCards.findIndex(c => c.id === card.id);

        this._showViewerCard(card);
        viewer.classList.remove('hidden');

        document.getElementById('gallery-viewer-close').onclick = () => {
            viewer.classList.add('hidden');
        };

        // Swipe navigation
        let startX = 0;
        const content = document.getElementById('gallery-viewer-content');
        content.ontouchstart = (e) => { startX = e.touches[0].clientX; };
        content.ontouchend = (e) => {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) {
                if (dx < 0 && this._viewerIndex < this._viewerCards.length - 1) {
                    this._viewerIndex++;
                    this._showViewerCard(this._viewerCards[this._viewerIndex]);
                } else if (dx > 0 && this._viewerIndex > 0) {
                    this._viewerIndex--;
                    this._showViewerCard(this._viewerCards[this._viewerIndex]);
                }
            }
        };

        // Tap to toggle zoom
        const img = document.getElementById('gallery-viewer-img');
        let zoomed = false;
        img.onclick = () => {
            zoomed = !zoomed;
            img.style.transform = zoomed ? 'scale(1.8)' : 'scale(1)';
            img.style.transition = 'transform 0.3s ease';
        };
    }

    _showViewerCard(card) {
        const img = document.getElementById('gallery-viewer-img');
        img.src = card.image;
        img.style.transform = 'scale(1)';
        document.getElementById('gallery-viewer-title').textContent = card.title;
        document.getElementById('gallery-viewer-subtitle').textContent = card.subtitle;
        document.getElementById('gallery-viewer-rarity').textContent = card.rarity;
        document.getElementById('gallery-viewer-rarity').className = 'gallery-viewer-rarity rarity-text-' + card.rarity;
        // Show card position
        const counter = document.getElementById('gallery-viewer-counter');
        if (counter) counter.textContent = (this._viewerIndex + 1) + ' / ' + this._viewerCards.length;
    }

    save() {
        try {
            const key = 'pocketlove_gallery_' + (this.game.selectedCharacter || 'alistair');
            localStorage.setItem(key, JSON.stringify([...this.unlockedCards]));
        } catch (e) {}
    }

    load() {
        try {
            const key = 'pocketlove_gallery_' + (this.game.selectedCharacter || 'alistair');
            const data = localStorage.getItem(key);
            if (data) {
                const arr = JSON.parse(data);
                this.unlockedCards = new Set(arr);
                this.unlockedCards.add("first-meeting"); // Always
            }
        } catch (e) {}
    }
}
