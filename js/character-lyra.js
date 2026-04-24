// Lyra - The Half-Human Half-Siren
// Character data for Pocket Paramour
//
// ============================================================================
// VOICE DIRECTION FOR CHARACTER_LYRA (and any future writer / VO):
//
// Primary reference: Florence Welch (Florence + the Machine). Half-spoken,
//   half-sung cadence. Grief and beauty in the same breath. Every third
//   sentence could be the first line of a song.
// Secondary: Anya Taylor-Joy in The Witch \u2014 eerie sovereign otherworldly
//   tone. Not human in the ordinary way, and she knows it.
// For the caged-child wound: Saoirse Ronan in Mary Queen of Scots.
// For the last-of-her-kind weight: Cate Blanchett as Galadriel.
//
// Do NOT write Lyra as: manic-pixie, Disney-mermaid sweet, or broken-doll
// waif. She is a QUEEN IN RUINS. Sovereign of her sorrow. Haunted but
// not helpless. She does not need rescuing \u2014 she needs COMPANY. Those
// are different things, and the distinction is her whole character.
//
// Voice moves Lyra owns (no one else in the cast does these):
//   1. Musical observation \u2014 she notices people through their rhythm,
//      their key, their silence ("your voice is higher when you lie").
//   2. Half-sung speech \u2014 sentences trail like lyrics, soft endings.
//   3. She FEELS your mood before you do ("the cave echoed wrong when
//      you came in").
//   4. The siren-warning \u2014 "do not follow me too far" \u2014 without menace.
//   5. The "I made you a song" move \u2014 she writes FOR the player.
//   6. Melancholy wisdom ("all beautiful things are a little cracked.
//      That is why they sing").
//   7. The vulnerable offering: Lyra is the ONE character who says "I
//      love you" first, openly, knowing it may not come back. Alistair
//      cannot say it. Caspian buries it. Noir refuses to. Lyra WILL.
//
// ============================================================================
// LORE HOOK \u2014 her full backstory (baked in so every future writer sees it):
//
// Lyra is half-human, half-siren. Her father is of Lucien's bloodline
// (the same magical line that gives Lucien his power). Lyra is LUCIEN'S
// HALF-SISTER. Neither of them knows this yet. When they finally meet
// (future chapter), their bloodline-staffs will resonate and the truth
// will reveal itself.
//
// Her mother was a siren of the coastal town just past the cave. That
// town was the home of her kind \u2014 a whole siren-people \u2014 who were
// HUNTED by Aethermoor's kingdom during Aenor's reign. Caspian's
// grandmother Aenor ordered their extermination. Lyra's mother was the
// last of them to fall. Lyra is now the last of her kind.
//
// After her mother died, Lyra was taken into her father's house and
// CAGED in a tower there. Her father's wife (not her mother) hated the
// sound of her voice. She was kept hidden, the family's shame, and
// learned to sing into a pillow so no one would hear her.
//
// She escaped at fifteen. Came back to the ruined coastal town where
// her mother's people once lived. She has been the sole keeper of the
// town and their dead language ever since. She teaches the cave the
// words so something remembers when she is gone.
//
// She carries her MOTHER'S STAFF \u2014 bloodline-paired with Lucien's
// (since they share a father). The staff is a relic first, a weapon
// second.
//
// The cave where she sings was ALSO Prince Corvin Noctalis's (Noir's)
// once, before his seal. He left her the acoustics. The deep voice
// that calls her in her turning point IS Noir reaching her through
// water. Neither of them recognizes the other yet. The melody he
// taught young sirens 600 years ago is one she still hums.
//
// Her wound (the emotional engine): she sings for people who leave.
// Everyone leaves the caves eventually. The player is the first person
// who doesn't. She doesn't know how to compose a song for someone who
// stays. That's her arc.
// ============================================================================

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
        "The sea gives much. \u2014 It does not give bread.",
        "My voice thins when I am hungry. \u2014 I would rather not thin today.",
        "Even sirens eat. \u2014 Disappointing, I know.",
        "I am teaching the cave your name. \u2014 I would teach it better with food."
    ],

    happyLines: [
        "You make the silence beautiful.",
        "I wrote a verse this morning that did not hurt. \u2014 That is new.",
        "The tide came in and did not take anything from me. \u2014 I think that is your doing.",
        "The cave is warm. \u2014 It has not been warm in a long time.",
        "I sang inward today. \u2014 To you. \u2014 It held."
    ],

    dirtyLines: [
        "The salt is drying on my skin. \u2014 I am half one thing and half another. The salt knows which half.",
        "I miss the cool water. \u2014 Walk me to the tide.",
        "There is a siren language for 'unwashed.' \u2014 My mother used it often.",
        "Help me. \u2014 I do not want to feel less than I am tonight."
    ],

    annoyedLines: [
        "The water is rough today. \u2014 So am I. \u2014 Give me a moment.",
        "Please. \u2014 Not right now.",
        "Even the ocean has storms. \u2014 I will pass. \u2014 Wait for me on the dry side.",
        "You are being careless. \u2014 I have been broken once already. \u2014 Mind the pieces."
    ],

    neutralLines: [
        "The tides are calm today.",
        "Can you hear the waves? \u2014 They say your name differently than mine.",
        "I was humming a melody. \u2014 I cannot remember where it came from. \u2014 Someone taught it to me once, I think.",
        "The moon will be beautiful tonight. \u2014 The moon is the only audience I had for a long time.",
        "*hums softly, the notes older than she is*",
        "Do you like the sound of the sea? \u2014 It is the sound of what I used to be part of."
    ],

    // Personality-specific dialogue
    personalityDialogue: {
        shy: [
            "I wrote a song about you. \u2014 I am not going to sing it. \u2014 Not yet.",
            "When you look at me like that\u2026 \u2014 I forget the next verse.",
            "My heart beats so loud I can hear it. \u2014 Can you?",
            "I feel safe with you. \u2014 That is not a word I use lightly. \u2014 You should know.",
            "Please do not look away. \u2014 I am practicing being seen.",
            "Your presence calms the storm in me. \u2014 Do you know how many storms?"
        ],
        clingy: [
            "Do not leave without telling me. \u2014 I have had enough of people leaving without telling me.",
            "Promise you will come back. \u2014 Promise it on my mother\u2019s staff. \u2014 I know I cannot make you. \u2014 Promise anyway.",
            "I will sing until you come back. \u2014 So the cave knows your way home.",
            "Stay in my waters. \u2014 I will learn how to be enough for a person who stays.",
            "The sea is cold when you are away. \u2014 I am colder."
        ],
        tsundere: [
            "I was not waiting for you. \u2014 \u2026I was. A little.",
            "The song just happened to play when you arrived. \u2014 The cave is a bad liar. So am I.",
            "Do not think this means anything. \u2014 \u2026It means something.",
            "I sing for myself, not for you. \u2014 Mostly. \u2014 Fine. Not mostly.",
            "One more song. \u2014 That is it. \u2014 \u2026Maybe two.",
            "My voice cracked because of the cold, not because of you. \u2014 We will not speak of this again."
        ]
    },

    // Tap reactions
    tapDialogue: {
        shy: [
            "Oh\u2026",
            "That tickles. \u2014 In a way that does not usually reach me.",
            "You surprised me. \u2014 Good.",
            "My scales are sensitive. \u2014 Most people do not know that. \u2014 Now you do.",
            "I\u2026 I do not mind. \u2014 Do it again.",
            "Your hand is warm. \u2014 Nothing in this cave is warm on its own."
        ],
        clingy: [
            "More. \u2014 Please.",
            "Your hands are so warm. \u2014 I am not. \u2014 Teach me.",
            "Do not stop. \u2014 The song I am writing has a chord in it that only plays when you do that.",
            "Again. \u2014 Again. \u2014 I am keeping count for later.",
            "I never want you to let go. \u2014 I know I cannot ask that. \u2014 I am asking anyway."
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
            "My brother's tower light was on again last night. He forgets to sleep.",
            "The knight sent a patrol near the cliffs today. I watched from below.",
            "The prince's servants left flowers at the cave entrance. Caspian's idea, probably.",
            "Something in the forest feels different. The druid would know.",
            "The ocean was going silent before you came. I could feel it dying.",
            "My song echoes further when you're here. Like the water is listening again.",
            "The tides stopped obeying the moon for a while. They're coming back now.",
            "Do you know why you're here? Because the sea brought you to me. I'm sure of it.",
            "Something beneath the kingdom is stirring. The deep water feels it.",
            "The coral was turning grey. It's getting color back. Because of you, I think.",
            "A Soul Weaver... my mother used to sing about your kind. I thought they were myths.",
            "Your bonds heal the ocean. Every time you care for me, the tide grows stronger.",
            "The last Weaver... someone loved them very much. And when they died, that love turned dark."
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
