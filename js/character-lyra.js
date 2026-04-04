// Lyra - The Half-Human Half-Siren
// Character data for Pocket Paramour

const CHARACTER_LYRA = {
    name: "Lyra",
    title: "The Resonant Siren",
    archetype: "siren",

    // Stat decay rates (per second) - Lyra is more emotional, bond decays faster
    decayRates: {
        hunger: 0.08,
        clean: 0.04,
        bond: 0.12
    },

    // Face emotions mapping
    faceEmotions: {
        neutral: "assets/lyra/face/neutral.png",
        happy: "assets/lyra/face/happy.png",
        sad: "assets/lyra/face/sad.png",
        angry: "assets/lyra/face/angry.png",
        love: "assets/lyra/face/love.png",
        shy: "assets/lyra/face/shy.png",
        sleeping: "assets/lyra/face/sleeping.png",
        sleepy: "assets/lyra/face/sleepy.png",
        tired: "assets/lyra/face/tired.png",
        wink: "assets/lyra/face/wink.png",
        corrupted: "assets/lyra/face/angry.png",
        left: "assets/lyra/face/sad.png",
        crying: "assets/lyra/face/sad.png"
    },

    // faceSprites alias — required by blink system and generic emotion code
    faceSprites: {
        happy:    ["assets/lyra/face/happy.png"],
        love:     ["assets/lyra/face/love.png"],
        neutral:  ["assets/lyra/face/neutral.png"],
        gentle:   ["assets/lyra/face/neutral.png"],
        sad:      ["assets/lyra/face/sad.png"],
        crying:   ["assets/lyra/face/sad.png"],
        angry:    ["assets/lyra/face/angry.png"],
        furious:  ["assets/lyra/face/angry.png"],
        shy:      ["assets/lyra/face/shy.png"],
        wink:     ["assets/lyra/face/wink.png"],
        sleeping: ["assets/lyra/face/sleeping.png"],
        sleepy:   ["assets/lyra/face/sleepy.png"],
        tired:    ["assets/lyra/face/tired.png"],
        corrupted:["assets/lyra/face/angry.png"],
        left:     ["assets/lyra/face/sad.png"]
    },

    // Body poses mapping
    bodyPoses: {
        neutral: "assets/lyra/body/neutral.png",
        happy: "assets/lyra/body/happy.png",
        sad: "assets/lyra/body/sad.png",
        angry: "assets/lyra/body/angry.png",
        love: "assets/lyra/body/love.png",
        shy: "assets/lyra/body/shy.png",
        singing: "assets/lyra/body/singing.png",
        wave: "assets/lyra/body/wave.png",
        corrupted: "assets/lyra/body/depressed.png",
        power: "assets/lyra/body/power.png",
        depressed: "assets/lyra/body/depressed.png"
    },

    // bodySprites — full alias map used by UI systems (hunger, dirty, sleep, training, etc.)
    bodySprites: {
        // Base emotions
        neutral:    "assets/lyra/body/neutral.png",
        neutral1:   "assets/lyra/body/neutral1.png",
        happy:      "assets/lyra/body/happy.png",
        sad:        "assets/lyra/body/sad.png",
        sad3:       "assets/lyra/body/sad3.png",
        angry:      "assets/lyra/body/angry.png",
        love:       "assets/lyra/body/love.png",
        shy:        "assets/lyra/body/shy.png",
        wave:       "assets/lyra/body/wave.png",
        singing:    "assets/lyra/body/singing.png",
        power:      "assets/lyra/body/power.png",
        depressed:  "assets/lyra/body/depressed.png",
        corrupted:  "assets/lyra/body/depressed.png",
        siren:      "assets/lyra/body/siren.png",
        queen:      "assets/lyra/body/queen.png",
        pose2:      "assets/lyra/body/pose2.png",
        pose3:      "assets/lyra/body/pose3.png",
        pose4:      "assets/lyra/body/pose4.png",
        casual1:    "assets/lyra/body/casual1.png",
        casual2:    "assets/lyra/body/casual2.png",
        // Hunger stages
        hungry1:    "assets/lyra/body/hungry1.png",
        hungry2:    "assets/lyra/body/hungry2.png",
        starving1:  "assets/lyra/body/starving1.png",
        starving2:  "assets/lyra/body/starving2.png",
        // Eating animation
        eating1:    "assets/lyra/body/eating1.png",
        eating2:    "assets/lyra/body/eating2.png",
        eating3:    "assets/lyra/body/eating3.png",
        eating4:    "assets/lyra/body/eating4.png",
        // Wash / splash
        splash1:    "assets/lyra/body/splash1.png",
        splash2:    "assets/lyra/body/splash2.png",
        splash3:    "assets/lyra/body/splash3.png",
        // Dirty stages
        dirty1:     "assets/lyra/body/dirty1.png",
        dirty2:     "assets/lyra/body/dirty2.png",
        verydirty1: "assets/lyra/body/verydirty1.png",
        verydirty2: "assets/lyra/body/verydirty2.png",
        // Singing training
        sing1:      "assets/lyra/body/sing1.png",
        sing2:      "assets/lyra/body/sing2.png",
        sing3:      "assets/lyra/body/sing3.png",
        sing4:      "assets/lyra/body/sing4.png",
        // Magic / resonance training
        power1:     "assets/lyra/body/power1.png",
        power2:     "assets/lyra/body/power2.png",
        power3:     "assets/lyra/body/power3.png",
        power4:     "assets/lyra/body/power4.png",
        power5:     "assets/lyra/body/power5.png",
        // Drift / mermaid training
        mermaid1:   "assets/lyra/body/mermaid1.png",
        mermaid2:   "assets/lyra/body/mermaid2.png",
        mermaid3:   "assets/lyra/body/mermaid3.png",
        mermaid4:   "assets/lyra/body/mermaid4.png",
        // Sleep / idle poses
        sleepy1:    "assets/lyra/body/sleepy1.png",
        sleepy2:    "assets/lyra/body/sleepy2.png",
        yawn1:      "assets/lyra/body/yawn1.png",
        yawn2:      "assets/lyra/body/yawn2.png",
        bored1:     "assets/lyra/body/bored1.png",
        bored2:     "assets/lyra/body/bored2.png",
        // Corruption stages (Feature 9)
        corrupt1:   "assets/lyra/body/corrupt1.png",
        corrupt2:   "assets/lyra/body/corrupt2.png",
        corrupt3:   "assets/lyra/body/corrupt3.png",
    },

    // Outfits
    outfits: {
        default: { name: "Siren Dress", body: "assets/lyra/body/neutral.png" },
        casual1: { name: "Ocean Breeze", body: "assets/lyra/body/casual1.png" },
        casual2: { name: "Shore Walk", body: "assets/lyra/body/casual2.png" },
        queen: { name: "Siren Queen", body: "assets/lyra/body/queen.png" },
        power: { name: "Resonance", body: "assets/lyra/body/power.png" }
    },

    background: "assets/bg-siren-cave.png",

    // Training variety for Lyra (replaces knight sword/strength/focus)
    trainingOptions: [
        { type: 'singing', icon: '🎵', label: 'Sing', desc: 'Let your voice out' },
        { type: 'magic',   icon: '✨', label: 'Resonance', desc: 'Channel siren power' },
        { type: 'focus',   icon: '🌊', label: 'Drift', desc: 'Find stillness in the tide' }
    ],

    trainingDialogue: {
        singing: [
            "The sound fills the cave... and something in me relaxes.",
            "I haven't sung like this in a long time.",
            "Thank you for listening. Most people don't.",
            "That one was for you. Don't tell anyone.",
            "My voice sounds different when you're here."
        ],
        magic: [
            "The resonance comes easier when I'm not afraid.",
            "I felt that. Did you feel that?",
            "...It's not always in my control. But today it was.",
            "Something shifts when I channel it. Like breathing underwater.",
            "I'm stronger than I let on. You're one of the few who've seen it."
        ],
        focus: [
            "The tide is loud today. But I can still hear you.",
            "...I almost forgot what quiet felt like.",
            "You're patient with me. That's not nothing.",
            "Stillness is harder than it looks.",
            "I was thinking about you. The whole time."
        ]
    },

    // Unique action (replaces Train for Lyra)
    uniqueAction: {
        id: "sing",
        label: "Sing",
        icon: "🎵",
        effect: { bond: 15, hunger: -5, corruption: -3 }
    },

    // ===== DIALOGUE =====

    // Smart dialogue pools
    hungryLines: [
        "The sea gives life... but I need nourishment too...",
        "I'm feeling faint...",
        "Even sirens need to eat...",
        "My voice weakens when I'm hungry..."
    ],

    happyLines: [
        "My heart sings when you're here!",
        "The waves dance for us today...",
        "I could sing forever with you near...",
        "You make the silence beautiful..."
    ],

    dirtyLines: [
        "The salt is drying on my skin...",
        "I miss the cool water...",
        "I feel so dry and uncomfortable...",
        "Can you help me feel fresh again?"
    ],

    annoyedLines: [
        "The water is too rough today...",
        "Please... not right now...",
        "Even the ocean has its storms...",
        "You're being careless..."
    ],

    neutralLines: [
        "The tides are calm today...",
        "Can you hear the waves?",
        "I was humming a melody...",
        "The moon will be beautiful tonight...",
        "*hums softly*",
        "Do you like the sound of the sea?"
    ],

    // Personality-specific dialogue
    personalityDialogue: {
        shy: [
            "I... I wrote a song about you...",
            "W-when you look at me like that...",
            "My heart beats so loud, can you hear it?",
            "I feel safe... with you...",
            "Please don't look away...",
            "Your presence calms the storm in me..."
        ],
        clingy: [
            "Don't go to the surface without me!",
            "Promise you'll come back...",
            "I'll sing so you never forget me!",
            "Stay in my waters forever...",
            "I can't breathe without you...",
            "The sea is cold when you're away..."
        ],
        tsundere: [
            "I wasn't waiting for you!",
            "The song just happened to play when you arrived...",
            "Don't think this means anything!",
            "I sing for myself, not for you!",
            "...Fine. One more song. But that's it!",
            "My voice cracked because of the cold, not because of you!"
        ]
    },

    // Tap reactions
    tapDialogue: {
        shy: [
            "Ah...!",
            "T-that tickles...",
            "You surprised me...",
            "My scales are sensitive...",
            "I-I don't mind...",
            "Your touch is warm..."
        ],
        clingy: [
            "More! Touch me more!",
            "Your hands are so warm!",
            "Don't stop!",
            "I love when you do that!",
            "Again, again!",
            "I never want you to let go..."
        ],
        tsundere: [
            "H-hey! My scales!",
            "D-don't just touch me!",
            "I didn't say you could do that!",
            "...It felt nice. But don't do it again!",
            "You're too bold!",
            "Stop! ...Why did you stop?"
        ]
    },

    // Feed dialogue
    feedDialogue: [
        "Mmm... ocean berries are my favorite...",
        "You know what I like...",
        "This tastes like home...",
        "The sweetness reminds me of your smile..."
    ],

    // Wash dialogue
    washDialogue: [
        "Ahh... the water feels wonderful...",
        "Like swimming in moonlight...",
        "My scales are shimmering again!",
        "Thank you... I feel alive again..."
    ],

    // Gift reactions
    giftDialogue: {
        apple:    ["Fruit from the surface? How exotic!", "It's sweet... like you."],
        rose:     ["A flower? I've never had one before...", "It smells like dreams I've never had..."],
        sword:    ["A weapon? I prefer my voice...", "I'll keep it for protection."],
        cake:     ["Surface sweets! Amazing!", "I've never tasted anything so wonderful!"],
        ring:     ["A ring...? Does this mean...?", "I'll wear it always, close to my heart..."],
        book:     ["Poetry about the sea... you understand me.", "These words... they sing to me."],
        pearl:    ["You found a pearl... for me? The sea only gives these when it means it.", "I've dived for pearls my whole life. I never expected to receive one."],
        shell:    ["A shell... I can hear the ocean in this one. Did you know that?", "Hold it to your ear. You'll hear home."],
        song:     ["A song sheet? You thought I'd want this... you're right.", "New music. I'll learn it tonight. For you."],
        starfish: ["A starfish! They always find their way back. I like that about them.", "I'll keep it near the water. Where it's safe."],
        stone:    ["It's smooth from the tide. You held this... and thought of me.", "Ocean stones carry memories. This one's yours now."],
        coral:    ["Coral from the deep... you went far for this.", "I have a piece like this. From before. I'll keep yours next to it."]
    },

    // Affection level dialogue
    affectionDialogue: [
        "I'm starting to hear your heartbeat[shy] in the waves...",
        "Your voice... it's becoming my favorite melody...[love]",
        "I think... my song is changing[shy] because of you...",
        "I love you...[shy] more than the sea loves the shore..."
    ],

    // Departure dialogue
    departureDialogue: [
        "The sea calls me back... goodbye...",
        "I can't stay where I'm not wanted...",
        "My song fades... like our memories...",
        "The waves will carry me far from here..."
    ],

    // Idle dialogue
    idleDialogue: {
        hungry: ["...", "The sea provides... but I'm still hungry...", "Could you find me something to eat?"],
        dirty: ["...", "My scales feel so dry...", "I miss the cool water..."],
        lonely: ["...", "Sing with me... please?", "It's so quiet without you..."],
        loving: [
            "I was composing a song... about us...",
            "The moonlight reminds me of your eyes...",
            "My heart feels like the tide... always pulling toward you...",
            "*hums a gentle melody*",
            "I could look at you forever...",
            "Do you hear that? The waves are singing our song...",
            "I wrote your name in the sand. The tide keeps washing it away. I keep writing it.",
            "My voice sounds different when I'm thinking about you. Softer.",
            "The pearls glow brighter tonight. They react to my mood.",
            "I used to sing for the ocean. Now I sing for you.",
            "Every current that touches me reminds me of your hands.",
            "If I could turn this feeling into a song, it would never end.",
            "*touches the place where you last held her hand*",
            "I dreamed we were swimming together. You could breathe underwater. It felt real."
        ],
        night: [
            "The stars are reflected in the water tonight...",
            "*yawns softly*",
            "The ocean is so peaceful at night...",
            "Will you stay until I fall asleep...?",
            "The bioluminescence is out. The water glows blue.",
            "I sing quieter at night. The sound carries further.",
            "The moon is almost full. I feel it in my scales.",
            "Night is when the deep things come closer to the surface. Like me.",
            "...I don't want to go to the cave yet. Stay a little longer."
        ],
        general: [
            "...",
            "*adjusts seashell necklace*",
            "*runs fingers through the water*",
            "Hmm...",
            "The tides are shifting...",
            "*looks at you with curious eyes*",
            "I wonder what it's like... up there...",
            "*traces patterns on a shell*",
            "A fish swam into the cave. Stayed for a bit. Left.",
            "The coral is growing faster this season.",
            "*braids a strand of hair, unbraids it*",
            "The water is colder today. I don't mind.",
            "*catches a droplet from the ceiling, watches it fall*",
            "My brother hasn't written. That's normal. Still.",
            "I found a new shell today. Spiral. Like a song."
        ]
    },

    // Story milestones
    storyMilestones: {
        affection1: {
            title: "First Melody",
            text: "Lyra hums a soft tune. For the first time, she lets you hear her true voice. It echoes through the cave like starlight made into sound."
        },
        affection2: {
            title: "The Surface World",
            text: "Lyra surfaces from the water, looking up at the sky with wonder. 'You make me want to see what's up there...'"
        },
        affection3: {
            title: "Heart's Song",
            text: "Lyra's eyes shimmer with tears. 'I've never sung this song for anyone... it's the song of my heart. And it's yours.'"
        },
        affection4: {
            title: "Eternal Tide",
            text: "Lyra takes your hand, her touch warm despite the cold water. 'In every life, in every sea... I would find you again.'"
        },
        corruption1: {
            title: "Dark Undertow",
            text: "Lyra's eyes flash with an otherworldly light. 'Don't leave me... the depths are calling, and I need an anchor...'"
        }
    }
};

// ── Patch: merge CHARACTER_LYRA rich data into CHARACTER_LYRA_FULL ────────
// CHARACTER_LYRA_FULL (in character.js) is what the game actually uses.
// CHARACTER_LYRA (above) has richer dialogue that was never wired up.
// This patch runs after both files load and fills the gaps.
if (typeof CHARACTER_LYRA_FULL !== 'undefined') {

    // Ocean-specific gift reactions (extend the standard gift reactions)
    CHARACTER_LYRA_FULL.giftDialogue = CHARACTER_LYRA_FULL.giftDialogue || {};
    const _lyraGifts = CHARACTER_LYRA.giftDialogue;
    for (const key in _lyraGifts) {
        if (!CHARACTER_LYRA_FULL.giftDialogue[key]) {
            CHARACTER_LYRA_FULL.giftDialogue[key] = _lyraGifts[key];
        }
    }

    // Rich idle dialogue pools
    CHARACTER_LYRA_FULL.idleDialogue = CHARACTER_LYRA.idleDialogue;

    // Feed & wash dialogue
    CHARACTER_LYRA_FULL.feedDialogue = CHARACTER_LYRA.feedDialogue;
    CHARACTER_LYRA_FULL.washDialogue = CHARACTER_LYRA.washDialogue;

    // Affection-rising dialogue
    CHARACTER_LYRA_FULL.affectionDialogue = CHARACTER_LYRA.affectionDialogue;
}
