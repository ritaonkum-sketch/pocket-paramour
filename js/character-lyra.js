// Lyra - The Half-Human Half-Siren
// Character data for Pocket Paramour
//
// ════════════════════════════════════════════════════════════════════════════
//  ▸ THIS IS THE LYRA EDITING FILE.
//  ▸ For idle / feed / wash / affection-rising / ocean-themed gift dialogue,
//    EDIT THE CHARACTER_LYRA OBJECT BELOW. The merge patch at the bottom
//    of this file injects those pools into CHARACTER_LYRA_FULL (which lives
//    in character.js) at runtime. Do NOT duplicate these fields in
//    character.js.the patch overwrites whatever's there.
//  ▸ For sprites / poses / outfits / state-dialogue / story-events / endings,
//    EDIT character.js (CHARACTER_LYRA_FULL). See the SSOT header there.
// ════════════════════════════════════════════════════════════════════════════
//
// ============================================================================
// VOICE DIRECTION FOR CHARACTER_LYRA (and any future writer / VO):
//
// Primary reference: Florence Welch (Florence + the Machine). Half-spoken,
//   half-sung cadence. Grief and beauty in the same breath. Every third
//   sentence could be the first line of a song.
// Secondary: Anya Taylor-Joy in The Witch.eerie sovereign otherworldly
//   tone. Not human in the ordinary way, and she knows it.
// For the caged-child wound: Saoirse Ronan in Mary Queen of Scots.
// For the last-of-her-kind weight: Cate Blanchett as Galadriel.
//
// Do NOT write Lyra as: manic-pixie, Disney-mermaid sweet, or broken-doll
// waif. She is a QUEEN IN RUINS. Sovereign of her sorrow. Haunted but
// not helpless. She does not need rescuing.she needs COMPANY. Those
// are different things, and the distinction is her whole character.
//
// Voice moves Lyra owns (no one else in the cast does these):
//   1. Musical observation.she notices people through their rhythm,
//      their key, their silence ("your voice is higher when you lie").
//   2. Half-sung speech.sentences trail like lyrics, soft endings.
//   3. She FEELS your mood before you do ("the cave echoed wrong when
//      you came in").
//   4. The siren-warning."do not follow me too far".without menace.
//   5. The "I made you a song" move.she writes FOR the player.
//   6. Melancholy wisdom ("all beautiful things are a little cracked.
//      That is why they sing").
//   7. The vulnerable offering: Lyra is the ONE character who says "I
//      love you" first, openly, knowing it may not come back. Alistair
//      cannot say it. Caspian buries it. Noir refuses to. Lyra WILL.
//   8. SKINSHIP. CORE MODE. This is critical. Lyra is cold-blooded
//      (siren scales), touch-starved (caged for years, no comfort in
//      her father's family, alone in the cave since fifteen). She
//      REACHES for the player physically: cold fingers on warm hands,
//      cupped face, forehead-press (her people's greeting), head on
//      shoulder, hand against pulse, mouth against inside-of-wrist.
//      She is the most PHYSICAL of the seven. She touches because
//      she has been waiting years to be allowed to. Write her scenes
//      with physical action beats, not just lines.
//      Visual register: "cold hand finding warm one." That contrast
//      is her signature move. It hits dopamine every single time.
//
// ============================================================================
// LORE HOOK.her full backstory (baked in so every future writer sees it):
//
// Lyra is half-human, half-siren. Her father is of Lucien's bloodline
// (the same magical line that gives Lucien his power). Lyra is LUCIEN'S
// HALF-SISTER. Neither of them knows this yet. When they finally meet
// (future chapter), their bloodline-staffs will resonate and the truth
// will reveal itself.
//
// Her mother was a siren of the coastal town just past the cave. That
// town was the home of her kind.a whole siren-people.who were
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
// She carries her MOTHER'S STAFF.bloodline-paired with Lucien's
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

    // faceSprites alias.required by blink system and generic emotion code
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

    // bodySprites.full alias map used by UI systems (hunger, dirty, sleep, training, etc.)
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
    // (outfits block removed May 2026 — system was unreachable from UI)

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
            "I haven’t sung like this in a long time.",
            "Thank you for listening. Most people don’t.",
            "That one was for you. Don’t tell anyone.",
            "My voice sounds different when you’re here."
        ],
        magic: [
            "The resonance comes easier when I’m not afraid.",
            "I felt that. Did you feel that?",
            "... It’s not always in my control. But today it was.",
            "Something shifts when I channel it. Like breathing underwater.",
            "I’m stronger than I let on. You’re one of the few who’ve seen it."
        ],
        focus: [
            "The tide is loud today. But I can still hear you.",
            "... I almost forgot what quiet felt like.",
            "You’re patient with me. That’s not nothing.",
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
        "The sea gives much. It does not give bread.",
        "My voice thins when I am hungry. I would rather not thin today.",
        "Even sirens eat. Disappointing, I know.",
        "I am teaching the cave your name. I would teach it better with food."
    ],

    happyLines: [
        "You make the silence beautiful.",
        "I wrote a verse this morning that did not hurt. That is new.",
        "The tide came in and did not take anything from me. I think that is your doing.",
        "The cave is warm. It has not been warm in a long time.",
        "I sang inward today. To you. It held.",
        "*Leans her shoulder against yours without looking up*. This. Just this. I have been wanting this.",
        "Your hand is warm. *Threads her cold fingers through yours*. I am going to steal it. Fair warning.",
        "*Tucks her face into the crook of your neck*. You smell of sun. I have not smelled sun on a person in a long time.",
        "You are a Weaver. I felt it in your pulse the first time you took my hand. My mother taught me one true thing before she died.\u2018Protect the Weaver.\u2019. I thought it was a rule from an old story. It was instructions. For you."
    ],

    dirtyLines: [
        "The salt is drying on my skin. I am half one thing and half another. The salt knows which half.",
        "I miss the cool water. Walk me to the tide.",
        "There is a siren language for 'unwashed.'. My mother used it often.",
        "Help me. I do not want to feel less than I am tonight."
    ],

    annoyedLines: [
        "The water is rough today. So am I. Give me a moment.",
        "Please. Not right now.",
        "Even the ocean has storms. I will pass. Wait for me on the dry side.",
        "You are being careless. I have been broken once already. Mind the pieces."
    ],

    neutralLines: [
        "The tides are calm today.",
        "Can you hear the waves?. They say your name differently than mine.",
        "I was humming a melody. I cannot remember where it came from. Someone taught it to me once, I think.",
        "The moon will be beautiful tonight. The moon is the only audience I had for a long time.",
        "*Hums softly, the notes older than she is*",
        "Do you like the sound of the sea?. It is the sound of what I used to be part of.",
        "*Idly traces a cold finger along the back of your wrist, not looking at you*",
        "*Reaches for your hand without asking, sets it in her lap, keeps it*. Mm.",
        "*Studies your profile a moment too long, then looks away, then looks back*"
    ],

    // Personality-specific dialogue
    personalityDialogue: {
        shy: [
            "I wrote a song about you. I am not going to sing it. Not yet.",
            "When you look at me like that\u2026. I forget the next verse.",
            "My heart beats so loud I can hear it. Can you?",
            "I feel safe with you. That is not a word I use lightly. You should know.",
            "Please do not look away. I am practicing being seen.",
            "Your presence calms the storm in me. Do you know how many storms?"
        ],
        clingy: [
            "Do not leave without telling me. I have had enough of people leaving without telling me.",
            "Promise you will come back. Promise it on my mother\u2019s staff. I know I cannot make you. Promise anyway.",
            "I will sing until you come back. So the cave knows your way home.",
            "Stay in my waters. I will learn how to be enough for a person who stays.",
            "The sea is cold when you are away. I am colder.",
            "*Catches your sleeve as you move to leave*. One more moment. Just one. I am being greedy. I do not care.",
            "*Reaches up, cold palm to your cheek*. I have never had enough of this. I do not think I ever will.",
            "Come here. Closer. *Threads your arm around her waist and leans back into you*. There. Yes."
        ],
        tsundere: [
            "I was not waiting for you.\u2026I was. A little.",
            "The song just happened to play when you arrived. The cave is a bad liar. So am I.",
            "Do not think this means anything.\u2026It means something.",
            "I sing for myself, not for you. Mostly. Fine. Not mostly.",
            "One more song. That is it.\u2026Maybe two.",
            "My voice cracked because of the cold, not because of you. We will not speak of this again."
        ]
    },

    // Tap reactions
    tapDialogue: {
        shy: [
            "Oh\u2026.*Catches your hand on its way back, holds it a second longer*. Wait.",
            "That tickles. In a way that does not usually reach me.",
            "You surprised me. Good. Surprise me again.",
            "My scales are sensitive. Most people do not know that. Now you do. Be careful with it.",
            "I\u2026 I do not mind. *Presses her cheek briefly against your palm*. Do that again.",
            "Your hand is warm. Nothing in this cave is warm on its own. Leave it there."
        ],
        clingy: [
            "More. Please.",
            "*Turns your hand over and presses her mouth to the inside of your wrist*. Your pulse is music. Did you know that?",
            "Your hands are so warm. I am not. Teach me.",
            "Do not stop. The song I am writing has a chord in it that only plays when you do that.",
            "Again. Again. I am keeping count for later.",
            "*Catches your wrist, brings your palm to her face, closes her eyes*. Mm. Yes. Like that.",
            "I never want you to let go. I know I cannot ask that. I am asking anyway."
        ],
        tsundere: [
            "H-hey! My scales!",
            "D-don’t just touch me!",
            "I didn’t say you could do that!",
            "... It felt nice. But don’t do it again!",
            "You’re too bold!",
            "Stop! ... Why did you stop?"
        ]
    },

    // Feed dialogue
    feedDialogue: [
        "Mmm... ocean berries are my favourite...",
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
        apple:    ["Fruit from the surface? How exotic!", "It’s sweet... like you."],
        rose:     ["A flower? I’ve never had one before...", "It smells like dreams I’ve never had..."],
        sword:    ["A weapon? I prefer my voice...", "I’ll keep it for protection."],
        cake:     ["Surface sweets! Amazing!", "I’ve never tasted anything so wonderful!"],
        ring:     ["A ring...? Does this mean...?", "I’ll wear it always, close to my heart..."],
        book:     ["Poetry about the sea... you understand me.", "These words... they sing to me."],
        pearl:    ["You found a pearl... for me? The sea only gives these when it means it.", "I’ve dived for pearls my whole life. I never expected to receive one."],
        shell:    ["A shell... I can hear the ocean in this one. Did you know that?", "Hold it to your ear. You’ll hear home."],
        song:     ["A song sheet? You thought I’d want this... you’re right.", "New music. I’ll learn it tonight. For you."],
        starfish: ["A starfish! They always find their way back. I like that about them.", "I’ll keep it near the water. Where it’s safe."],
        stone:    ["It’s smooth from the tide. You held this... and thought of me.", "Ocean stones carry memories. This one’s yours now."],
        coral:    ["Coral from the deep... you went far for this.", "I have a piece like this. From before. I’ll keep yours next to it."]
    },

    // Affection level dialogue
    affectionDialogue: [
        "I’m starting to hear your heartbeat[shy] in the waves...",
        "Your voice... it’s becoming my favourite melody...[love]",
        "I think... my song is changing[shy] because of you...",
        "I love you...[shy] more than the sea loves the shore..."
    ],

    // Departure dialogue
    departureDialogue: [
        "The sea calls me back... goodbye...",
        "I can’t stay where I’m not wanted...",
        "My song fades... like our memories...",
        "The waves will carry me far from here..."
    ],

    // Idle dialogue
    idleDialogue: {
        hungry: ["...", "The sea provides... but I’m still hungry...", "Could you find me something to eat?"],
        dirty: ["...", "My scales feel so dry...", "I miss the cool water..."],
        lonely: ["...", "Sing with me... please?", "It’s so quiet without you..."],
        loving: [
            "I was composing a song... about us...",
            "The moonlight reminds me of your eyes...",
            "My heart feels like the tide... always pulling toward you...",
            "*Hums a gentle melody*",
            "I could look at you forever...",
            "Do you hear that? The waves are singing our song...",
            "I wrote your name in the sand. The tide keeps washing it away. I keep writing it.",
            "My voice sounds different when I’m thinking about you. Softer.",
            "The pearls glow brighter tonight. They react to my mood.",
            "I used to sing for the ocean. Now I sing for you.",
            "Every current that touches me reminds me of your hands.",
            "If I could turn this feeling into a song, it would never end.",
            "*Touches the place where you last held her hand*",
            "I dreamed we were swimming together. You could breathe underwater. It felt real."
        ],
        night: [
            "The stars are reflected in the water tonight...",
            "*Yawns softly*",
            "The ocean is so peaceful at night...",
            "Will you stay until I fall asleep...?",
            "The bioluminescence is out. The water glows blue.",
            "I sing quieter at night. The sound carries further.",
            "The moon is almost full. I feel it in my scales.",
            "Night is when the deep things come closer to the surface. Like me.",
            "... I don’t want to go to the cave yet. Stay a little longer."
        ],
        general: [
            "...",
            "*Adjusts seashell necklace*",
            "*Runs fingers through the water*",
            "Hmm...",
            "The tides are shifting...",
            "*Looks at you with curious eyes*",
            "I wonder what it’s like... up there...",
            "*Traces patterns on a shell*",
            "A fish swam into the cave. Stayed for a bit. Left.",
            "The coral is growing faster this season.",
            "My brother’s tower light was on again last night. He forgets to sleep.",
            "The knight sent a patrol near the cliffs today. I watched from below.",
            "The prince’s servants left flowers at the cave entrance. Caspian’s idea, probably.",
            "Something in the forest feels different. The druid would know.",
            "The ocean was going silent before you came. I could feel it dying.",
            "My song echoes further when you’re here. Like the water is listening again.",
            "The tides stopped obeying the moon for a while. They’re coming back now.",
            "Do you know why you’re here? Because the sea brought you to me. I’m sure of it.",
            "Something beneath the kingdom is stirring. The deep water feels it.",
            "The coral was turning grey. It’s getting colour back. Because of you, I think.",
            "A Soul Weaver... my mother used to sing about your kind. I thought they were myths.",
            "Your bonds heal the ocean. Every time you care for me, the tide grows stronger.",
            "The last Weaver... someone loved them very much. And when they died, that love turned dark.",
            "*Braids a strand of hair, unbraids it*",
            "The water is colder today. I don’t mind.",
            "*Catches a droplet from the ceiling, watches it fall*",
            "My brother hasn’t written. That’s normal. Still.",
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
            text: "Lyra surfaces from the water, looking up at the sky with wonder. 'You make me want to see what’s up there...'"
        },
        affection3: {
            title: "Heart’s Song",
            text: "Lyra’s eyes shimmer with tears. 'I’ve never sung this song for anyone... it’s the song of my heart. And it’s yours.'"
        },
        affection4: {
            title: "Eternal Tide",
            text: "Lyra takes your hand, her touch warm despite the cold water. 'In every life, in every sea... I would find you again.'"
        },
        corruption1: {
            title: "Dark Undertow",
            text: "Lyra’s eyes flash with an otherworldly light. 'Don’t leave me... the depths are calling, and I need an anchor...'"
        }
    }
};

// ════════════════════════════════════════════════════════════════════════════
// ▸ MERGE PATCH. Runs at load time to wire CHARACTER_LYRA's rich dialogue
//   pools into CHARACTER_LYRA_FULL (the active object selectCharacter
//   points to). Without this, the game would use the thinner LYRA_FULL
//   stubs in character.js instead.
//
// EDIT-HERE RULES:
//   - Want to change idle / feed / wash / affection-rising lines?
//     Edit them in CHARACTER_LYRA above. They land here automatically.
//   - Want to add a new ocean-themed gift reaction? Add the key to
//     CHARACTER_LYRA.giftDialogue above. It only lands if LYRA_FULL
//     does not already define that key (LYRA_FULL wins on collisions
//    .this is intentional so the main file can override per-key).
//
// SAFETY:
//   - Defensive console warning if CHARACTER_LYRA_FULL hasn't loaded —
//     this catches script-order bugs early instead of silently
//     producing a Lyra with stub dialogue.
//   - The patch is idempotent. Hot-reloading this file twice produces
//     the same final state.
// ════════════════════════════════════════════════════════════════════════════
(function applyLyraMergePatch() {
    // Idempotency guard (Jun 2026 QA audit). This script was running its
    // merge patch ~12 times per page load, producing ~336 console-warn
    // lines that buried any real errors. The patch IS idempotent (final
    // state is identical) but the warning fires every run, so the noise
    // grew with each invocation. We now hard-gate the patch to a single
    // execution per page load.
    if (window.__ppLyraMergeApplied) return;
    window.__ppLyraMergeApplied = true;

    if (typeof CHARACTER_LYRA_FULL === 'undefined') {
        console.warn(
            '[character-lyra.js] CHARACTER_LYRA_FULL is not defined when this ' +
            'patch ran. Lyra will load with the stub dialogue from character.js. ' +
            'Check <script> order in index.html.character.js must load BEFORE ' +
            'character-lyra.js.'
        );
        return;
    }

    // Ocean-specific gift reactions.additive only. LYRA_FULL keys win
    // so the main file can override on a per-gift basis.
    CHARACTER_LYRA_FULL.giftDialogue = CHARACTER_LYRA_FULL.giftDialogue || {};
    const _lyraGifts = CHARACTER_LYRA.giftDialogue || {};
    for (const key in _lyraGifts) {
        if (!CHARACTER_LYRA_FULL.giftDialogue[key]) {
            CHARACTER_LYRA_FULL.giftDialogue[key] = _lyraGifts[key];
        }
    }

    // Rich pools — REPLACE whatever LYRA_FULL had with the wrapper's
    // versions. Owner audit (May 2026) found the merge patch was UNDER-
    // configured: only 4 pools were being patched (idle/feed/wash/affection)
    // while character.js held OLDER Disney-mermaid stub versions of 7 OTHER
    // pools (hungryLines/happyLines/dirtyLines/annoyedLines/neutralLines/
    // personalities/tapDialogue) that silently won at runtime. The wrapper's
    // queen-in-ruins / Florence-Welch versions never reached the player.
    //
    // FOOT-GUN GUARD: If a future writer accidentally adds any of these to
    // CHARACTER_LYRA_FULL in character.js, this patch silently overwrites.
    // The console.warn below catches that — they'll see it in DevTools and
    // know to move the content here instead.
    const _PATCHED_KEYS = [
        'idleDialogue', 'feedDialogue', 'washDialogue', 'affectionDialogue',
        // Extended May 2026 — voice-fidelity audit:
        'hungryLines', 'happyLines', 'dirtyLines', 'annoyedLines', 'neutralLines',
        'personalities', 'tapDialogue'
    ];
    _PATCHED_KEYS.forEach((key) => {
        const existing = CHARACTER_LYRA_FULL[key];
        const incoming = CHARACTER_LYRA[key];
        if (incoming === undefined) return; // wrapper doesn't define this — leave LYRA_FULL alone
        const existingNonEmpty = existing && (Array.isArray(existing) ? existing.length > 0
            : (typeof existing === 'object' && Object.keys(existing).length > 0));
        if (existingNonEmpty) {
            console.warn(
                '[character-lyra.js] Overwriting non-empty CHARACTER_LYRA_FULL.' + key + ' from character.js. ' +
                'The wrapper file (character-lyra.js) is the SSOT for this field. ' +
                'Move your content to CHARACTER_LYRA in character-lyra.js to make the change permanent.'
            );
        }
        CHARACTER_LYRA_FULL[key] = incoming;
    });
})();
