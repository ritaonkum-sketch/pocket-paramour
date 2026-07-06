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
    // ── Lyra CARE-LOOP reward cards (Jun 2026) ────────────────────────────
    // Lyra had ZERO care-unlockable cards — every other card was story-choice
    // or premium, so her care route never popped a reveal. These mirror the
    // other characters' cadence (an early "keep showing up" reward + the
    // affection-tier climb at Bond 1/3/4) so tending Lyra feels rewarding too.
    {
        id: "lyra-care-tide",
        title: "Tide-Learned",
        subtitle: "The cave knows your footsteps now",
        image: "assets/lyra/body/neutral.png",
        rarity: "uncommon",
        unlock: { type: "interactions", count: 8, condition: "Care for her 8 times" }
    },
    {
        id: "lyra-care-note",
        title: "A Note, For You",
        subtitle: "She hummed it, and meant it",
        image: "assets/lyra/body/singing.png",
        rarity: "uncommon",
        unlock: { type: "affection", level: 1, condition: "Reach Familiar affection" }
    },
    {
        id: "lyra-care-unsung",
        title: "The Unsung Verse",
        subtitle: "The one she kept from the sailors",
        image: "assets/lyra/body/power.png",
        rarity: "rare",
        unlock: { type: "affection", level: 3, condition: "Reach Close affection" }
    },
    {
        id: "lyra-care-saltname",
        title: "Your Name in Salt",
        subtitle: "She wrote it where the tide can’t reach",
        image: "assets/lyra/body/singing.png",
        rarity: "legendary",
        unlock: { type: "affection", level: 4, condition: "Reach In Love affection" }
    },
    {
        id: "lyra-care-deep",
        title: "What the Deep Taught Her",
        subtitle: "A note only you have heard her hold",
        image: "assets/lyra/body/power.png",
        rarity: "rare",
        unlock: { type: "bond", value: 70, condition: "Reach a deep bond" }
    },
    {
        id: "lyra-care-tongue",
        title: "A Word of the Old Tongue",
        subtitle: "She taught you a word her people are the last to know",
        image: "assets/lyra/body/singing.png",
        rarity: "uncommon",
        unlock: { type: "train", value: 20, condition: "Train with her 20 times" }
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
        unlock: { type: "scene", condition: "Lucien arc, ambiguous ending" }
    },
    {
        id: "lyra-lucien-cold-closed",
        title: "Go",
        subtitle: "One word. Final.",
        image: "assets/lyra/body/shy.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Lucien cold resolution, player path" }
    },
    {
        id: "lyra-lucien-cold-neutral",
        title: "I Need Someone to Stay",
        subtitle: "She said it out loud",
        image: "assets/lyra/body/depressed.png",
        rarity: "uncommon",
        unlock: { type: "scene", condition: "Lucien cold resolution, neutral" }
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
        unlock: { type: "scene", condition: "Complete Lyra's arc, attached ending" }
    },
    {
        id: "lyra-ending-unresolved",
        title: "So I'll Keep Letting You",
        subtitle: "Still open. Still hers.",
        image: "assets/lyra/body/neutral.png",
        rarity: "rare",
        unlock: { type: "scene", condition: "Complete Lyra's arc, unresolved ending" }
    },
    // ── Alistair cards ────────────────────────────────────────────
    {
        id: "first-meeting",
        title: "First Meeting",
        subtitle: "The day it all began",
        image: "assets/gallery/card-first-meeting.png",
        rarity: "common",
        unlock: { type: "auto", condition: "Start the game" },
        unlocked: true // Always unlocked
    },
    {
        id: "loyal-knight",
        title: "The Loyal Knight",
        subtitle: "A knight of unwavering duty",
        image: "assets/gallery/card-loyal-knight.png",
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
    { id: "proto-reach", title: "Palm to the Glass", subtitle: "Reaching for your hand. Someday it won't pass through.", image: "assets/proto/body/calm.png", rarity: "uncommon", unlock: { type: "interactions", count: 6, condition: "Spend time with him 6 times" } },
    { id: "proto-name", title: "He Learned Your Name", subtitle: "A new word today. It was your name.", image: "assets/proto/body/scanning.png", rarity: "rare", unlock: { type: "bond", value: 65, condition: "Reach a deep bond" } },
    { id: "proto-break", title: "System Break", subtitle: "He rewrote reality", image: "assets/proto/body/glitched.png", rarity: "legendary", unlock: { type: "scene", condition: "Break the system" } },
    { id: "proto-void", title: "The Void Speaks", subtitle: "What's beyond the code", image: "assets/proto/body/unstable.png", rarity: "premium", unlock: { type: "premium", sceneId: "proto_void", condition: "Unlock the void scene" } },
    // ── Noir cards ──────────────────────────────────────────────
    { id: "noir-first", title: "First Shadow", subtitle: "Something watches", image: "assets/noir/body/neutral.png", rarity: "common", unlock: { type: "auto", condition: "Meet Noir" }, unlocked: true },
    { id: "noir-seductive", title: "The Invitation", subtitle: "You couldn't look away", image: "assets/noir/body/seductive.png", rarity: "uncommon", unlock: { type: "affection", level: 1, condition: "Reach Familiar" } },
    { id: "noir-consuming", title: "Consumed", subtitle: "The darkness feels like home", image: "assets/noir/body/consuming.png", rarity: "rare", unlock: { type: "affection", level: 3, condition: "Reach Affection" } },
    { id: "noir-merged", title: "One With Shadow", subtitle: "You became what he promised", image: "assets/noir/body/dominant.png", rarity: "legendary", unlock: { type: "affection", level: 4, condition: "Reach In Love" } },
    { id: "noir-namelow", title: "Said Low", subtitle: "He spoke your name once. You felt it for hours.", image: "assets/noir/body/whisper.png", rarity: "uncommon", unlock: { type: "interactions", count: 6, condition: "Spend time with him 6 times" } },
    { id: "noir-ration", title: "Unhurried", subtitle: "Mortals burn so quickly. You, he would ration.", image: "assets/noir/body/casual2.png", rarity: "rare", unlock: { type: "bond", value: 65, condition: "Reach a deep bond" } },
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
        id: "elian-cloak", title: "The Cloak-Drape", subtitle: "He dropped it round your shoulders. “Better. Don’t argue.”",
        image: "assets/elian/body/warm.png", rarity: "uncommon",
        unlock: { type: "interactions", count: 6, condition: "Spend time with him 6 times" }
    },
    {
        id: "elian-rowan", title: "Beneath the Rowan", subtitle: "He showed you the place he tends alone.",
        image: "assets/elian/body/meditating.png", rarity: "rare",
        unlock: { type: "bond", value: 65, condition: "Reach a deep bond" }
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
        id: "caspian-devoted",
        title: "The Crown He Set Down",
        subtitle: "He chose the quiet wing, and you, over the court",
        image: "assets/caspian/body/tender.png",
        rarity: "rare",
        unlock: { type: "bond", value: 70, condition: "Reach a deep bond" }
    },
    {
        id: "caspian-everyday",
        title: "The Everyday Cup",
        subtitle: "Not court porcelain, the cup he keeps only for you",
        image: "assets/caspian/body/gentle.png",
        rarity: "uncommon",
        unlock: { type: "interactions", value: 90, condition: "Care for him 90 times" }
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
        // Was { type:'bond', value:95 } — that's the Bond CARE STAT, which the
        // player can max in a single session, so this legendary "14 days"
        // card fired almost immediately. It now gates on the real consecutive
        // daily-check-in streak (game.dailyStreak), matching the subtitle.
        unlock: { type: "streak", value: 14, condition: "Care 14 days without missing one" }
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
        this._enqueueReveals([id]);
    }

    // Check if any new cards should unlock
    // ── Derive which character a card belongs to ──────────────────
    // GALLERY_CARDS holds every character's cards in one flat list.
    // Most cards encode the character in their id ("caspian-first",
    // "elian-trust", etc.) or in the image path ("assets/lyra/body/...").
    // Alistair's older cards use neither — they have IDs like "first-meeting"
    // and paths like "assets/gallery/card-knight.png" — so they fall
    // through to the Alistair default. The newer "alistair-peak-*" cards
    // are caught by the id prefix check.
    cardCharacter(card) {
        if (!card) return null;
        const id = card.id || '';
        const img = card.image || '';
        const charPrefixes = ['alistair', 'lyra', 'lucien', 'caspian', 'elian', 'noir', 'proto'];
        for (const c of charPrefixes) {
            if (id.indexOf(c + '-') === 0) return c;
            if (img.indexOf('assets/' + c + '/') !== -1) return c;
        }
        // Legacy Alistair cards (image path "assets/gallery/card-*.png",
        // id without character prefix). Default unattributed cards to him.
        return 'alistair';
    }

    checkUnlocks() {
        const g = this.game;
        const total = (g.timesFed || 0) + (g.timesWashed || 0) + (g.timesTalked || 0) +
                      (g.timesTrained || 0) + (g.timesGifted || 0);
        const activeChar = (g.selectedCharacter || g.characterId || 'alistair');
        let newUnlock = false;
        const justUnlocked = []; // every card unlocked THIS pass — each gets its own reveal

        GALLERY_CARDS.forEach(card => {
            if (this.unlockedCards.has(card.id)) return;
            // Only unlock cards that belong to the character the player is
            // currently caring for. Without this filter, every "auto" type
            // card unlocks for every character on first load (the player
            // ends up with Caspian's "Royal Welcome" and Elian's "Shared
            // Fire" while playing Alistair's route).
            // Streak / commitment cards are player-wide, not character-specific
            // (they reward showing up over time, not any one route) — so they
            // unlock regardless of who's being cared for. Everything else stays
            // scoped to the active character.
            if (card.unlock.type !== 'streak' && this.cardCharacter(card) !== activeChar) return;

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
                case "streak":
                    // Consecutive daily check-ins — the SAME counter the
                    // daily-rewards milestones use. This is what "14 days
                    // without missing one" actually means (not the Bond stat).
                    shouldUnlock = (g.dailyStreak || 0) >= u.value;
                    break;
                case "premium":
                    shouldUnlock = !!(g.premiumScenes && g.premiumScenes[u.sceneId]);
                    break;
            }

            if (shouldUnlock) {
                this.unlockedCards.add(card.id);
                this.newCards.add(card.id);
                justUnlocked.push(card.id);
                newUnlock = true;
            }
        });

        if (newUnlock) {
            this.save();
            // Reveal EVERY newly-unlocked card in turn — not just the last one.
            this._enqueueReveals(justUnlocked);
        }

        // One-time: the starter card ("first-meeting") is seeded as unlocked at
        // construction, so it never travels through the reveal queue — the player
        // never actually SEES their very first memory (owner report). Reveal it
        // once, but ONLY on a genuinely calm care screen (this method also runs
        // on the 5s care tick, so it can never fire over the title/intro), and
        // only when nothing else is on screen, so it slots in cleanly after the
        // onboarding beats settle. Latched via pp_starter_card_seen.
        try {
            if (!localStorage.getItem('pp_starter_card_seen') &&
                this.unlockedCards.has('first-meeting') &&
                document.body.classList.contains('pp-screen-care') &&
                !this._screenBusyForReveal() &&
                !this._revealActive &&
                (!this._revealQueue || !this._revealQueue.length)) {
                localStorage.setItem('pp_starter_card_seen', '1');
                this._enqueueReveals(['first-meeting']);
            }
        } catch (_) {}
    }

    // ── Sequential reveal queue ───────────────────────────────────────
    // Multiple cards can unlock in ONE checkUnlocks pass (entering a route
    // with affection already built, a chapter award that jumps two levels,
    // etc.). The old code revealed only the LAST of them and silently
    // swallowed the rest — so the player saw one popup, or NONE when it
    // deferred over a busy screen (owner: "I don't get any card popups").
    // Now every unlocked card is queued and revealed one after another,
    // tap-paced. The queue is separate from newCards, so opening the gallery
    // (which clears the "new" badge) can't lose a pending reveal.
    _enqueueReveals(ids) {
        if (!ids || !ids.length) return;
        this._revealQueue = (this._revealQueue || []).concat(ids);
        this._flushRevealQueue();
    }

    _flushRevealQueue() {
        if (this._revealActive) return;            // a reveal is already on screen
        if (!this._revealQueue || !this._revealQueue.length) return;
        // NEVER reveal over a story beat / chapter / blocking overlay — defer
        // the WHOLE queue until the screen is calm, then resume from where it
        // left off.
        if (this._screenBusyForReveal()) { this._scheduleRevealRetry(); return; }
        const id = this._revealQueue.shift();
        const card = GALLERY_CARDS.find(c => c.id === id);
        if (!card) { this._flushRevealQueue(); return; }   // skip unknown id, keep going
        this._revealActive = true;
        const next = () => { this._revealActive = false; this._flushRevealQueue(); };
        // EVERY rarity gets the full card-art reveal so the player always SEES
        // the card they just earned. (Owner report: common cards — "First
        // Meeting", "The Loyal Knight" — only flashed a text-only corner toast
        // with no art, so unlocking read as "the cards aren't showing".)
        // playReveal scales the drama by rarity — a soft fade-in for common, a
        // cinematic burst for legendary — and in every case shows the real card
        // and waits for a player tap before continuing.
        this.playReveal(card, next);
    }

    // Back-compat shim — any remaining caller routes through the queue so a
    // reveal still surfaces (and still respects the busy-screen defer).
    showNewCardNotification() {
        const last = [...this.newCards].pop();
        if (last) this._enqueueReveals([last]);
    }

    // True when a story scene / chapter / blocking overlay is up — a card
    // reveal must not cover it.
    _screenBusyForReveal() {
        try {
            const b = document.body.classList;
            if (b.contains('pp-chapter-active')) return true;
            if (b.contains('pp-overlay-active')) return true;        // any panel up
            if (b.contains('pp-chain-in-progress')) return true;     // mid story-chain
            // Authoritative single-source overlay check (Daily page, letters,
            // gift/training panels, etc. all register here) so a reveal can never
            // bleed over a panel that the selector list below doesn't enumerate.
            if (window.PPOverlay && typeof PPOverlay.anyOpen === 'function' && PPOverlay.anyOpen()) return true;
            return !!document.querySelector(
                '#mscard-root:not(:empty), #chp-page:not(:empty),' +
                '#cinematic-overlay.visible, #intro-overlay.visible,' +
                '#story-overlay:not(.hidden), #ms-encounter-root:not(:empty),' +
                '#tp-root:not(:empty), #date-overlay:not(.hidden),' +
                '#event-overlay:not(.hidden), #gallery-overlay:not(.hidden),' +
                '#settings-overlay:not(.hidden), #card-reveal-overlay.visible,' +
                // Route-open / Ch6 / main-story-gate celebrations are modal too —
                // never pop a card reveal on top of one (defer until it closes).
                '#pp-route-gate-backdrop, #pp-ch6-backdrop, #pp-ms-gate-backdrop,' +
                // Jul 2026 playtest: tutorials count as busy too — the First
                // Meeting reveal was found buried in a 4-deep overlay stack
                // with the care guide and onboarding tour.
                '#pp-aci-backdrop, #pp-onboarding-overlay.show'
            );
        } catch (_) { return false; }
    }

    // Poll until the screen is calm, then flush the deferred reveal. newCards
    // still holds the unlocked card(s) (it's only cleared when the gallery
    // opens), so re-calling showNewCardNotification reveals the pending one.
    _scheduleRevealRetry() {
        if (this._revealRetryTimer) return;
        this._revealRetryTimer = setInterval(() => {
            if (this._screenBusyForReveal()) return;
            clearInterval(this._revealRetryTimer);
            this._revealRetryTimer = null;
            this._flushRevealQueue();
        }, 1200);
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
        // Tap to dismiss (owner rule: reward notices wait for the player); the
        // long fallback only clears it if ignored, so it never just flashes past.
        let _done = false;
        const _close = () => { if (_done) return; _done = true; notif.classList.remove('show'); setTimeout(() => { try { notif.remove(); } catch (e) {} }, 500); };
        notif.style.cursor = 'pointer';
        notif.addEventListener('click', _close);
        setTimeout(_close, 8000);
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
        // If the card art is missing or a placeholder, fall back to the owner's
        // select-portrait so the marquee reveal never shows a broken-image glyph.
        img.onerror = () => { img.onerror = null; img.src = 'assets/' + this.cardCharacter(card) + '/select-portrait.png'; };
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

        // Tap (or touch) anywhere to dismiss — now the ONLY way the reveal
        // closes (the per-rarity auto-dismiss timers are neutralized in
        // _dismissReveal). Enabled once the reveal animation has settled so a
        // stray tap doesn't skip it, and a soft "tap to continue" hint appears
        // with it so the player knows it's waiting for them.
        const dismissHandler = () => {
            overlay.removeEventListener('click', dismissHandler);
            overlay.removeEventListener('touchstart', dismissHandler);
            self._dismissReveal(overlay, onComplete, true);
        };
        setTimeout(() => {
            overlay.addEventListener('click', dismissHandler);
            overlay.addEventListener('touchstart', dismissHandler, { passive: true });
            self._showRevealHint(overlay);
        }, rarity === 'common' ? 800 : 1600);
    }

    _showRevealInfo(info) {
        info.classList.remove('hidden');
        requestAnimationFrame(() => info.classList.add('visible'));
    }

    _dismissReveal(overlay, onComplete, viaTap) {
        // Owner direction (Jun 2026): the card reveal must WAIT FOR A TAP — it no
        // longer auto-vanishes. The per-rarity setTimeout(...) calls above pass no
        // viaTap and are deliberately neutralized here; ONLY a player tap/touch
        // (viaTap === true) closes the reveal, so they can admire the card as long
        // as they like.
        if (!viaTap) return;
        if (overlay.classList.contains('dismissing')) return;
        overlay.classList.add('dismissing');
        overlay.classList.remove('visible');
        const hint = overlay.querySelector('.card-reveal-hint');
        if (hint) hint.remove();
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('dismissing');
            overlay.querySelectorAll('.pp-light-beam').forEach(b => b.remove());
            if (onComplete) onComplete();
        }, 500);
    }

    // Soft "tap to continue" affordance so the player knows the reveal waits for
    // them (it no longer closes on its own).
    _showRevealHint(overlay) {
        if (!overlay || overlay.querySelector('.card-reveal-hint')) return;
        const hint = document.createElement('div');
        hint.className = 'card-reveal-hint';
        hint.textContent = 'tap to continue';
        hint.style.cssText = 'position:absolute;left:50%;bottom:6%;transform:translateX(-50%);' +
            'font-family:"Quicksand","Inter",sans-serif;font-size:11px;letter-spacing:0.18em;' +
            'text-transform:uppercase;color:rgba(255,255,255,0.5);opacity:0;' +
            'transition:opacity 700ms ease;pointer-events:none;z-index:5;white-space:nowrap;';
        overlay.appendChild(hint);
        requestAnimationFrame(() => { hint.style.opacity = '1'; });
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
        // Default the active tab to whoever the player is currently caring for.
        if (!this._activeTab) {
            this._activeTab = this.game.selectedCharacter || 'all';
        }
        if (!this._mode) this._mode = 'cards';
        this.renderModeToggle();
        this.renderTabs();
        this.renderActive();
        overlay.classList.remove('hidden');
        this.newCards.clear(); // Mark all as seen
        // Opening the gallery counts as having seen the starter card, so the
        // one-time "first-meeting" reveal won't pop redundantly afterward.
        try { localStorage.setItem('pp_starter_card_seen', '1'); } catch (_) {}
    }

    // ── Cards / Stories mode toggle ──────────────────────────────
    // Lives just under the header. Two pills; warm-gold for active.
    // The Stories mode shows the PPStories archive with locked
    // silhouettes + replay buttons; Cards mode is the existing grid.
    renderModeToggle() {
        let strip = document.getElementById('gallery-mode-strip');
        if (!strip) {
            const header = document.getElementById('gallery-header');
            const tabs   = document.getElementById('gallery-tabs');
            if (!header || !tabs) return;
            strip = document.createElement('div');
            strip.id = 'gallery-mode-strip';
            tabs.parentNode.insertBefore(strip, tabs);
        }
        const mode = this._mode || 'cards';
        strip.innerHTML = ''
            + '<button class="gallery-mode-btn' + (mode === 'cards' ? ' active' : '') + '" data-mode="cards">CARDS</button>'
            + '<button class="gallery-mode-btn' + (mode === 'stories' ? ' active' : '') + '" data-mode="stories">MEMORIES</button>';
        Array.from(strip.querySelectorAll('.gallery-mode-btn')).forEach(btn => {
            btn.addEventListener('click', () => {
                this._mode = btn.getAttribute('data-mode');
                this.renderModeToggle();
                this.renderTabs();
                this.renderActive();
            });
        });
    }

    // Renders the right grid for the current mode.
    renderActive() {
        if (this._mode === 'stories') this.renderStories();
        else this.renderCards();
    }

    // Per-character tab strip — owner request: per-character pages + See All.
    // Uses cardCharacter() (the same helper checkUnlocks uses) so the
    // legacy Alistair cards (image path "assets/gallery/card-*.png", no
    // character prefix in the id — e.g. "first-meeting", "loyal-knight",
    // "silver-bulwark") are correctly attributed to Alistair instead of
    // falling through to "uncategorised". Without this, those 10 cards
    // were counted in the All total (75) but not in any per-char tab,
    // and the seed-unlocked "first-meeting" card never showed up under
    // Alistair's tab.
    cardsForChar(charId) {
        return GALLERY_CARDS.filter(c => this.cardCharacter(c) === charId);
    }

    renderTabs() {
        const tabs = document.getElementById('gallery-tabs');
        if (!tabs) return;
        const CHARS = [
            { id: 'all',      label: 'All' },
            { id: 'alistair', label: 'Alistair' },
            { id: 'elian',    label: 'Elian' },
            { id: 'lyra',     label: 'Lyra' },
            { id: 'caspian',  label: 'Caspian' },
            { id: 'lucien',   label: 'Lucien' },
            { id: 'noir',     label: 'Noir' },
            { id: 'proto',    label: 'Proto' }
        ];
        tabs.innerHTML = '';
        const mode = this._mode || 'cards';
        CHARS.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'gallery-tab' + (this._activeTab === c.id ? ' active' : '');
            // Tab counter reflects the active mode — Stories counter when
            // in Stories mode, Cards counter when in Cards mode.
            let counterText;
            if (mode === 'stories') {
                // PPStories.counts('all') returns deduplicated counts
                // (a crossover that appears under two characters is
                // only counted once in the All total).
                const cnt = (window.PPStories && window.PPStories.counts) ? window.PPStories.counts(c.id) : { seen: 0, total: 0 };
                counterText = cnt.seen + '/' + cnt.total;
            } else {
                const cards = c.id === 'all' ? GALLERY_CARDS : this.cardsForChar(c.id);
                const unlocked = cards.filter(card => this.unlockedCards.has(card.id)).length;
                counterText = unlocked + '/' + cards.length;
            }
            btn.innerHTML = '<span class="gtl">' + c.label + '</span><span class="gtc">' + counterText + '</span>';
            btn.addEventListener('click', () => {
                this._activeTab = c.id;
                this.renderTabs();
                this.renderActive();
            });
            tabs.appendChild(btn);
        });
    }

    close() {
        const overlay = document.getElementById('gallery-overlay');
        if (overlay) overlay.classList.add('hidden');
    }

    // ── Stories grid ────────────────────────────────────────────
    // Renders the Story Archive entries for the active character tab.
    // Locked entries show a silhouette + lockHint. Unlocked entries
    // show the title, subtitle, and a Replay button (when the entry
    // defines a replay() callback).
    renderStories() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        const tab = this._activeTab || 'all';
        // PPStories.list('all') returns the deduped union of every
        // character's catalogue + every crossover (so a crossover
        // appears once even though it lives under two characters).
        const entries = (window.PPStories && window.PPStories.list)
            ? window.PPStories.list(tab)
            : [];

        // Counter: seen / total for the active scope (also deduped).
        const counter = document.getElementById('gallery-counter');
        if (counter) {
            const c = (window.PPStories && window.PPStories.counts) ? window.PPStories.counts(tab) : { seen: 0, total: 0 };
            const label = (tab === 'all') ? 'Memories' : (tab.charAt(0).toUpperCase() + tab.slice(1) + ' · Memories');
            counter.textContent = label + ': ' + c.seen + ' / ' + c.total;
        }

        grid.innerHTML = '';

        if (!entries.length) {
            const empty = document.createElement('div');
            empty.style.cssText = 'grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.5);padding:32px 16px;font-style:italic;';
            empty.textContent = 'Story archive coming soon for this character.';
            grid.appendChild(empty);
            return;
        }

        // Section labels per category. Order matters — this is also the
        // order of headers in the rendered grid. Memories is curated to
        // multi-beat cinematic scenes only.
        // Jun 2026 — Soul Weaver fragments added at the top of every
        // character's tab: they're the meta-narrative spine of the
        // whole game, so a player visiting Memories should see them
        // FIRST (whether unlocked yet or not — locked ones become
        // the chase).
        const CATEGORY_ORDER = ['fragment', 'beginning', 'affection', 'arc', 'shared', 'card', 'date', 'surprise', 'crossover', 'ending', 'epilogue'];
        const CATEGORY_LABELS = {
            fragment:  'Soul Weaver Memories',
            beginning: 'Beginnings',
            affection: 'Affection Scenes',
            arc:       'Decisions & Devotion',
            shared:    'Shared Moments',
            card:      'Memory Cards',
            date:      'Date Outings',
            surprise:  'Idle Surprises',
            crossover: 'Crossovers & Encounters',
            ending:    'Endings',
            epilogue:  'Route Endings'
        };
        // Bucket entries by category, preserving authoring order within each.
        const buckets = {};
        entries.forEach(e => {
            const cat = e.category || 'other';
            (buckets[cat] = buckets[cat] || []).push(e);
        });
        const renderOrder = CATEGORY_ORDER.filter(c => buckets[c] && buckets[c].length)
            .concat(Object.keys(buckets).filter(c => CATEGORY_ORDER.indexOf(c) === -1));

        // Render each category as a header strip + the entries that
        // belong to it. The header is a full-width grid row; the
        // entries remain in the existing 2-column grid below.
        renderOrder.forEach(cat => {
            const list = buckets[cat];
            const seenInCat = list.filter(e => { try { return e.isUnlocked(); } catch (_) { return false; } }).length;
            const header = document.createElement('div');
            header.className = 'story-section-header';
            header.innerHTML = ''
                + '<span class="story-section-label">' + (CATEGORY_LABELS[cat] || cat.toUpperCase()) + '</span>'
                + '<span class="story-section-count">' + seenInCat + ' / ' + list.length + '</span>';
            grid.appendChild(header);
            list.forEach(entry => this._renderStoryCard(entry, grid));
        });
    }

    // Renders a single story-archive entry into the grid. Extracted so the
    // section-grouped Stories renderer can reuse the same card layout for
    // every category without forking the logic.
    _renderStoryCard(entry, grid) {
        let isUnlocked = false;
        try { isUnlocked = !!entry.isUnlocked(); } catch (_) {}
        const cardEl = document.createElement('div');
        const rarity = entry.rarity || 'common';
        cardEl.className = 'gallery-card story-card rarity-' + rarity + ' ' + (isUnlocked ? 'unlocked' : 'locked');

        if (isUnlocked) {
            const replayBtn = entry.replay
                ? '<button class="story-replay-btn" type="button">▶ Replay</button>'
                : '<div class="story-watched-pill">✓ Watched</div>';
            cardEl.innerHTML = ''
                + '<div class="gallery-card-img-wrap">'
                +   '<img src="' + (entry.thumbnail || '') + '" alt="' + entry.title + '" class="gallery-card-img">'
                + '</div>'
                + '<div class="gallery-card-info">'
                +   '<div class="gallery-card-title">' + entry.title + '</div>'
                +   '<div class="story-card-subtitle">' + (entry.subtitle || '') + '</div>'
                +   replayBtn
                + '</div>';
            if (entry.replay) {
                const btn = cardEl.querySelector('.story-replay-btn');
                if (btn) {
                    btn.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        // Close the gallery overlay so the replayed
                        // scene has the screen to itself.
                        this.close();
                        setTimeout(() => {
                            try { entry.replay(); } catch (e) { console.error('[stories] replay failed:', e); }
                        }, 300);
                    });
                }
            }
        } else {
            // ── MYSTERY POLISH (May 2026) ─────────────────────────────
            // For crossovers + endings + epilogues, hide the per-card
            // lockHint entirely — those reveal character pairings or
            // story moments and would spoil the gasp when the scene
            // actually fires. Player sees only "???" + a generic
            // "keep caring" line. Other categories (beginnings,
            // affection, arc) keep their hints since players know
            // which character they're caring for.
            const HINT_HIDDEN_CATEGORIES = new Set(['crossover', 'ending', 'epilogue']);
            const condition = HINT_HIDDEN_CATEGORIES.has(entry.category)
                ? 'Keep caring. It will land on its own.'
                : (entry.lockHint || 'Locked');
            cardEl.innerHTML = ''
                + '<div class="gallery-card-img-wrap locked-wrap">'
                +   '<div class="gallery-card-lock">🔒</div>'
                + '</div>'
                + '<div class="gallery-card-info">'
                +   '<div class="gallery-card-title">???</div>'
                +   '<div class="story-card-condition">' + condition + '</div>'
                + '</div>';
        }
        grid.appendChild(cardEl);
    }

    renderCards() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        // Pick the card list for the active tab. 'all' shows everything.
        const tab = this._activeTab || 'all';
        const filteredCards = tab === 'all' ? GALLERY_CARDS : this.cardsForChar(tab);

        // Counter reflects the active tab. On the All tab we just show the
        // grand total. On a per-character tab we show "<Name>: X/Y" without
        // duplicating the total \u2014 the tabs strip already shows X/Y per char.
        const counter = document.getElementById('gallery-counter');
        if (counter) {
            const charUnlocked = filteredCards.filter(c => this.unlockedCards.has(c.id)).length;
            if (tab === 'all') {
                counter.textContent = this.unlockedCards.size + ' / ' + GALLERY_CARDS.length;
            } else {
                const prefix = tab.charAt(0).toUpperCase() + tab.slice(1);
                counter.textContent = prefix + ': ' + charUnlocked + ' / ' + filteredCards.length;
            }
        }

        grid.innerHTML = '';

        // Empty-state hint when a character tab has zero cards (shouldn't happen
        // with the seed data but we render gracefully if it ever does).
        if (!filteredCards.length) {
            const empty = document.createElement('div');
            empty.style.cssText = 'grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.5);padding:32px 16px;font-style:italic;';
            empty.textContent = 'No cards yet for this character. Keep playing.';
            grid.appendChild(empty);
            return;
        }

        filteredCards.forEach((card, index) => {
            const isUnlocked = this.unlockedCards.has(card.id);
            const isNew = this.newCards.has(card.id);

            const cardEl = document.createElement('div');
            cardEl.className = `gallery-card rarity-${card.rarity} ${isUnlocked ? 'unlocked' : 'locked'} ${isNew ? 'new' : ''}`;
            // Staggered entrance (juice): the first dozen cards cascade in; the
            // rest share the last step so the big "All" grid doesn't drag.
            cardEl.style.setProperty('--pp-i', Math.min(index, 12));

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
        // Same broken-image guard as the reveal: fall back to the select-portrait.
        img.onerror = () => { img.onerror = null; img.src = 'assets/' + this.cardCharacter(card) + '/select-portrait.png'; };
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
            const active = this.game.selectedCharacter || 'alistair';
            const key = 'pocketlove_gallery_' + active;
            const data = localStorage.getItem(key);
            this.unlockedCards = new Set(data ? JSON.parse(data) : []);
            // Seed the catalog's freebies (cards flagged unlocked:true — one
            // "first" memory per character) for the ACTIVE character, so every
            // route's album opens at >=1 instead of a broken-looking 0. Before
            // this, load() only ever re-added Alistair's "first-meeting", so a
            // character with no saved gallery yet (e.g. caring for Lyra for the
            // first time) showed 0/N and the collection felt empty/dead — fatal
            // for the collect-them-all loop. Scoped to the active char because
            // the save is per-character (pocketlove_gallery_<char>); seeding all
            // routes' freebies here would leak other characters' cards into this
            // character's tab counts.
            GALLERY_CARDS.forEach(c => {
                if (c.unlocked && this.cardCharacter(c) === active) this.unlockedCards.add(c.id);
            });
        } catch (e) {}
    }
}
