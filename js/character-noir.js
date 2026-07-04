// Noir — The Corruptor
// Dark, seductive, embodiment of unchecked desire and corruption.
// Unlockable mid-game after completing any character's arc or corruption > 50.
// Character data for Pocket Paramour
//
// VOICE DIRECTION (for writing consistency + future VO casting):
// Reference: Henry Cavill as Geralt of Rivia in The Witcher.
// Low register. Slow cadence. Few words. Archaic/formal tone. "Hmm" as
// punctuation. Gothic melodrama earned by 800 years under the seal.
// Every line should be readable two ways: devoted, or playing. Never
// resolve that ambiguity on the page.let the player carry it.
// Use periods or ellipses for held pauses. NEVER em-dashes (per saved
// owner voice rule — em-dashes read as AI-tell). The pause is in the
// short sentence and the silence after it, not in the punctuation.
// Avoid exclamation points entirely.
// Noir never labels his own feelings out loud. He shows. He does not tell.
// Rule of thumb: if a line works as a grunt and a look, prefer that.

const CHARACTER_NOIR = {
    name: "Noir",
    title: "The Corruptor",
    archetype: "corruptor",

    // Stat decay rates. Noir is supernatural — he doesn't need food or
    // grooming the way the mortal characters do. Originally set to 0.0 for
    // both, which made the feed/wash buttons completely cosmetic and broke
    // the player's care loop intuition (tap → no effect feels like a bug).
    // May 2026: bumped to a very slow 0.05 each so the buttons matter
    // marginally — by the third day a player who never feeds/washes him
    // sees stats noticeably dip, but anyone tapping once a day stays
    // ahead. Bond decay stays high (0.15) — neglecting him still hurts.
    decayRates: {
        hunger: 0.05,
        clean: 0.05,
        bond: 0.15
    },

    // Face emotions mapping
    faceEmotions: {
        neutral: "assets/noir/face/neutral.png",
        happy: "assets/noir/face/seductive.png",
        sad: "assets/noir/face/shadow.png",
        angry: "assets/noir/face/cruel.png",
        love: "assets/noir/face/consuming.png",
        shy: "assets/noir/face/whisper.png",
        sleeping: "assets/noir/face/sleeping.png",
        wink: "assets/noir/face/seductive.png",
        corrupted: "assets/noir/face/dominant.png",
        left: "assets/noir/face/shadow.png",
        crying: "assets/noir/face/vulnerable.png"
    },

    faceSprites: {
        happy:     ["assets/noir/face/seductive.png"],
        love:      ["assets/noir/face/consuming.png"],
        neutral:   ["assets/noir/face/neutral.png"],
        blink:     ["assets/noir/face/blink.png"],   // clean eye-close (casual w/ eyes shut) for the idle face-blink
        gentle:    ["assets/noir/face/whisper.png"],
        sad:       ["assets/noir/face/shadow.png"],
        crying:    ["assets/noir/face/vulnerable.png"],
        angry:     ["assets/noir/face/cruel.png"],
        furious:   ["assets/noir/face/dominant.png"],
        shy:       ["assets/noir/face/whisper.png"],
        wink:      ["assets/noir/face/seductive.png"],
        sleeping:  ["assets/noir/face/sleeping.png"],
        corrupted: ["assets/noir/face/dominant.png"],
        left:      ["assets/noir/face/shadow.png"]
    },

    bodyPoses: {
        neutral: "assets/noir/body/neutral.png",
        happy: "assets/noir/body/seductive.png",
        sad: "assets/noir/body/shadow.png",
        angry: "assets/noir/body/cruel.png",
        love: "assets/noir/body/consuming.png",
        shy: "assets/noir/body/whisper.png",
        dominant: "assets/noir/body/dominant.png",
        shadow: "assets/noir/body/shadow.png",
        corrupted: "assets/noir/body/dominant.png",
        vulnerable: "assets/noir/body/vulnerable.png"
    },

    bodySprites: {
        // Base emotions — real per-emotion art since the Full-body-crop wiring
        // (v979). Noir previously aliased ~40 keys onto 11 files.
        neutral:     "assets/noir/body/neutral.png",
        default:     "assets/noir/body/neutral.png",
        happy:       "assets/noir/body/happy.png",
        seductive:   "assets/noir/body/seductive.png",
        sad:         "assets/noir/body/sad.png",
        shadow:      "assets/noir/body/shadow.png",
        angry:       "assets/noir/body/angry.png",
        cruel:       "assets/noir/body/cruel.png",
        furious1:    "assets/noir/body/furious1.png",
        love:        "assets/noir/body/consuming.png",
        consuming:   "assets/noir/body/consuming.png",
        shy:         "assets/noir/body/whisper.png",
        whisper:     "assets/noir/body/whisper.png",
        gentle:      "assets/noir/body/whisper.png",
        dominant:    "assets/noir/body/dominant.png",
        vulnerable:  "assets/noir/body/vulnerable.png",
        // Smiles + smirks (the emotional vocabulary the dates/surprises use —
        // smirk/serious/excited/hopeful get REAL art here, so the generic
        // alias block at the end of this file skips them)
        smile1:      "assets/noir/body/smile1.png",
        smile2:      "assets/noir/body/smile2.png",
        smirk:       "assets/noir/body/smirk2.png",
        smirk1:      "assets/noir/body/smirk1.png",
        smirk2:      "assets/noir/body/smirk2.png",
        smirk3:      "assets/noir/body/smirk3.png",
        smirk4:      "assets/noir/body/smirk4.png",
        sneaky1:     "assets/noir/body/sneaky1.png",
        sneaky2:     "assets/noir/body/sneaky2.png",
        smileflirt1: "assets/noir/body/smileflirt1.png",
        smileflirt2: "assets/noir/body/smileflirt2.png",
        serious:     "assets/noir/body/talkserious.png",
        excited:     "assets/noir/body/winkhappy.png",
        hopeful:     "assets/noir/body/happyrose.png",
        // Flirt wardrobe
        flirt1:      "assets/noir/body/flirt1.png",
        flirt2:      "assets/noir/body/flirt2.png",
        bitelip1:    "assets/noir/body/bitelip1.png",
        bitelip2:    "assets/noir/body/bitelip2.png",
        bitelip3:    "assets/noir/body/bitelip3.png",
        bitelip4:    "assets/noir/body/bitelip4.png",
        bitelip5:    "assets/noir/body/bitelip5.png",
        flirtwink1:  "assets/noir/body/flirtwink1.png",
        flirtwink2:  "assets/noir/body/flirtwink2.png",
        flirtrose:   "assets/noir/body/flirtrose.png",
        happyrose:   "assets/noir/body/happyrose.png",
        wink1:       "assets/noir/body/wink1.png",
        wink2:       "assets/noir/body/wink2.png",
        winkheart:   "assets/noir/body/winkheart.png",
        winkhappy:   "assets/noir/body/winkhappy.png",
        maliciousflirt: "assets/noir/body/maliciousflirt.png",
        touchhair:   "assets/noir/body/touchhair.png",
        // Sad / angry talk wardrobe
        sad2:        "assets/noir/body/sad2.png",
        sadaway1:    "assets/noir/body/sadaway1.png",
        sadaway2:    "assets/noir/body/sadaway2.png",
        sadaway3:    "assets/noir/body/sadaway3.png",
        sadright:    "assets/noir/body/sadright.png",
        sadtalk1:    "assets/noir/body/sadtalk1.png",
        sadtalk2:    "assets/noir/body/sadtalk2.png",
        sadtalk3:    "assets/noir/body/sadtalk3.png",
        seriousaway: "assets/noir/body/seriousaway.png",
        talkserious: "assets/noir/body/talkserious.png",
        angrytalk1:  "assets/noir/body/angrytalk1.png",
        angrytalk2:  "assets/noir/body/angrytalk2.png",
        angrytalk3:  "assets/noir/body/angrytalk3.png",
        softangry1:  "assets/noir/body/softangry1.png",
        softangry2:  "assets/noir/body/softangry2.png",
        // Activity poses
        tempting:    "assets/noir/body/bitelip1.png",
        dominating:  "assets/noir/body/dominant.png",
        dissolving:  "assets/noir/body/shadow.png",
        talk:        "assets/noir/body/talking7.png",
        crossarms:   "assets/noir/body/cruel.png",
        // Talking pool (Talk action picks from these — see ui.js flashEmotion)
        talking1:    "assets/noir/body/talking1.png",
        talking2:    "assets/noir/body/talking2.png",
        talking3:    "assets/noir/body/talking3.png",
        talking4:    "assets/noir/body/talking4.png",
        talking5:    "assets/noir/body/talking5.png",
        talking6:    "assets/noir/body/talking6.png",
        talking7:    "assets/noir/body/talking7.png",
        // Training — real flourish art (temptation = flirt, domination =
        // blade, dissolution = magic)
        temptation1: "assets/noir/body/bitelip1.png",
        temptation2: "assets/noir/body/flirtrose.png",
        domination1: "assets/noir/body/fight1.png",
        domination2: "assets/noir/body/fight4.png",
        dissolution1:"assets/noir/body/magic2.png",
        dissolution2:"assets/noir/body/magic7.png",
        // Magic set (dates/story flourishes)
        magic1:      "assets/noir/body/magic1.png",
        magic2:      "assets/noir/body/magic2.png",
        magic3:      "assets/noir/body/magic3.png",
        magic4:      "assets/noir/body/magic4.png",
        magic5:      "assets/noir/body/magic5.png",
        magic6:      "assets/noir/body/magic6.png",
        magic7:      "assets/noir/body/magic7.png",
        magic8:      "assets/noir/body/magic8.png",
        potion:      "assets/noir/body/potion.png",
        // Outfits
        casual1:     "assets/noir/body/casual1.png",
        casual2:     "assets/noir/body/casual2.png",
        casual3:     "assets/noir/body/casual3.png",
        formal:      "assets/noir/body/formal.png",
        corrupted:   "assets/noir/body/malicious4.png",
        shirtless1:  "assets/noir/body/shirtless1.png",
        shirtless2:  "assets/noir/body/shirtless2.png",
        shirtless3:  "assets/noir/body/shirtless3.png",
        // Hunger — he asks for food now instead of standing still
        hungry1:     "assets/noir/body/askfood1.png",
        hungry2:     "assets/noir/body/askfood2.png",
        starving1:   "assets/noir/body/askfood3.png",
        starving2:   "assets/noir/body/askfood4.png",
        dirty1:      "assets/noir/body/neutral.png",
        dirty2:      "assets/noir/body/neutral.png",
        // Sleep / idle
        sleepy1:     "assets/noir/body/shadow.png",
        sleepy2:     "assets/noir/body/shadow.png",
        yawn1:       "assets/noir/body/neutral.png",
        yawn2:       "assets/noir/body/neutral.png",
        bored1:      "assets/noir/body/touchhair.png",
        bored2:      "assets/noir/body/sneaky1.png",
        // Eating / washing — real action art (feed/wash pools in ui.js)
        eating1:     "assets/noir/body/eat1.png",
        eating2:     "assets/noir/body/eat2.png",
        eating3:     "assets/noir/body/eat3.png",
        eating4:     "assets/noir/body/eat4.png",
        splash1:     "assets/noir/body/shower1.png",
        splash2:     "assets/noir/body/shower2.png",
        splash3:     "assets/noir/body/shower3.png",
        splash4:     "assets/noir/body/shower4.png",
        splash5:     "assets/noir/body/shower5.png",
        shower6:     "assets/noir/body/shower6.png",
        shower7:     "assets/noir/body/shower7.png",
        shower8:     "assets/noir/body/shower8.png",
        shower9:     "assets/noir/body/shower9.png",
        shower10:    "assets/noir/body/shower10.png",
        shower11:    "assets/noir/body/shower11.png",
        shower12:    "assets/noir/body/shower12.png",
        shower13:    "assets/noir/body/shower13.png",
        shower14:    "assets/noir/body/shower14.png",
        shower15:    "assets/noir/body/shower15.png",
        wiping:      "assets/noir/body/wiping.png",
        // Corruption stages — the malicious set
        corrupt1:    "assets/noir/body/malicious1.png",
        corrupt2:    "assets/noir/body/malicious3.png",
        corrupt3:    "assets/noir/body/maliciousflirt.png",
        malicious1:  "assets/noir/body/malicious1.png",
        malicious2:  "assets/noir/body/malicious2.png",
        malicious3:  "assets/noir/body/malicious3.png",
        malicious4:  "assets/noir/body/malicious4.png",
        malicious5:  "assets/noir/body/malicious5.png",
        furious2:    "assets/noir/body/furious2.png",
        // Fighting (for events)
        fighting:    "assets/noir/body/fight1.png",
        fighting1:   "assets/noir/body/fight2.png",
        fighting2:   "assets/noir/body/fight5.png",
        fight3:      "assets/noir/body/fight3.png",
        fight6:      "assets/noir/body/fight6.png",
        fightsweat:  "assets/noir/body/fightsweat.png"
    },

    emotionToBody: {
        happy:      ["seductive", "consuming"],
        love:       ["consuming", "seductive"],
        neutral:    ["neutral", "shadow"],
        sad:        ["shadow", "vulnerable"],
        angry:      ["cruel", "dominant"],
        shy:        ["whisper", "vulnerable"],
        corrupted:  ["dominant", "consuming"],
        sleeping:   ["shadow"]
    },

    actionToBody: {
        feed:  ["neutral", "seductive"],
        wash:  ["neutral"],
        gift:  ["consuming", "dominant"],
        train: ["seductive", "dominant", "shadow"],
        talk:  ["neutral", "whisper", "seductive"]
    },

    emotionalProfile: {
        stability:       0.30,
        intensity:       0.95,
        volatility:      0.85,
        attachmentSpeed: 0.80
    },

    // (outfits block removed May 2026 — system was unreachable from UI)

    background: "assets/bg-noir-void.png",

    // Bespoke milestone scenes (parity with Alistair/Lyra) — fire once at care
    // milestones via checkMilestone(); shown as a portrait scene card. Jul 2026.
    milestoneEvents: {
        firstFeed: {
            trigger: { timesFed: 1 },
            dialogue: "You feed a thing that does not hunger. In centuries, no one thought to. Hmm. The gesture did not land on nothing.",
            emotion: "shy"
        },
        firstTalk: {
            trigger: { timesTalked: 1 },
            dialogue: "Feared. Wanted. Never simply spoken to. You do it as though it costs you nothing. Perhaps it does not.",
            emotion: "shy"
        },
        firstGift: {
            trigger: { timesGifted: 1 },
            dialogue: "The dark is a thing that takes. You gave it something instead. I do not know yet what to do with that. I am keeping it regardless.",
            emotion: "shy"
        },
        firstWash: {
            trigger: { timesWashed: 1 },
            dialogue: "Most would not lay hands on what I am. You did, and did not draw back. Hmm.",
            emotion: "shy"
        },
        firstTrain: {
            trigger: { timesTrained: 1 },
            dialogue: "You stand in the dark with me and call it practice. The dark noticed. So did I.",
            emotion: "neutral"
        },
        fedFiveTimes: {
            trigger: { timesFed: 5 },
            dialogue: "Five times now. A small rite, kept without being spoken of. I have started to expect the hour you come.",
            emotion: "happy"
        },
        fedTenTimes: {
            trigger: { timesFed: 10 },
            dialogue: "Ten. I had been waiting for you to see your error and stop. I have stopped waiting for that.",
            emotion: "happy"
        },
        fedTwentyFive: {
            trigger: { timesFed: 25 },
            dialogue: "Twenty-five. A habit, and a young one. Most of mine are older than the seal. This one is yours.",
            emotion: "love"
        },
        talkedFiveTimes: {
            trigger: { timesTalked: 5 },
            dialogue: "The silence between us has changed its nature. It used to be mine alone. Now it is a place we sit.",
            emotion: "happy"
        },
        talkedTenTimes: {
            trigger: { timesTalked: 10 },
            dialogue: "I have told you things I last spoke under the rowan. The words did not rot in the saying. I did not expect that of them.",
            emotion: "happy"
        },
        talkedTwentyFive: {
            trigger: { timesTalked: 25 },
            dialogue: "Twenty-five times you have listened. You hear the part I leave unsaid. I am not certain whether that is mercy or a hook. Perhaps you are not either.",
            emotion: "love"
        },
        washedFiveTimes: {
            trigger: { timesWashed: 5 },
            dialogue: "You tend me and ask for nothing back. It unsettles me more than a blade would. I have not decided if I will let it continue. I am letting it continue.",
            emotion: "shy"
        },
        washedTenTimes: {
            trigger: { timesWashed: 10 },
            dialogue: "I hold still for you now. Ten times, and the stillness is no longer a guard. Take from that what you will.",
            emotion: "love"
        },
        trainedFiveTimes: {
            trigger: { timesTrained: 5 },
            dialogue: "You learn what I am made of and do not flinch from it. That is either courage or a lack of sense. I find I prefer not to know which.",
            emotion: "neutral"
        },
        trainedTenTimes: {
            trigger: { timesTrained: 10 },
            dialogue: "You have grown strong in the dark. Ten times over. Once I would have envied the growing. In you I only watch it. Hmm.",
            emotion: "happy"
        },
        giftedFiveTimes: {
            trigger: { timesGifted: 5 },
            dialogue: "Five small things a shadow has no use for. I keep them anyway. Draw from that what conclusion you like.",
            emotion: "happy"
        },
        giftedTenTimes: {
            trigger: { timesGifted: 10 },
            dialogue: "There is a place in the dark now that holds only what you have set there. Ten times you have added to it. I go there when you are gone.",
            emotion: "love"
        },
        fiveInteractions: {
            trigger: { totalInteractions: 5 },
            dialogue: "Five times you have come back. Each time I brace for it a little less. That is not nothing, from a thing that braces for everything.",
            emotion: "happy"
        },
        tenInteractions: {
            trigger: { totalInteractions: 10 },
            dialogue: "The seal has held eight hundred years. These ten nights sit heavier than most of them. I will not explain why. I think you know.",
            emotion: "happy"
        },
        twentyFiveInteractions: {
            trigger: { totalInteractions: 25 },
            dialogue: "For a long age I counted only what I had lost. Twenty-five times now, I have counted you instead. It is a stranger arithmetic. I do not mind it.",
            emotion: "love"
        },
        fiftyInteractions: {
            trigger: { totalInteractions: 50 },
            dialogue: "Fifty. I had thought myself finished with being marked by numbers. Yours found me anyway, {name}.",
            emotion: "love"
        },
        hundredInteractions: {
            trigger: { totalInteractions: 100 },
            dialogue: "Eight hundred years of waiting, and a hundred nights of you. Of all the counts I have carried, this is the one I mean to keep.",
            emotion: "love"
        },
        firstTrust: {
            trigger: { affectionLevel: 1 },
            dialogue: "You have handed trust to a corruptor. A reckless thing to do. I will not spend it. That is my word, and I keep few.",
            emotion: "shy"
        },
        growingClose: {
            trigger: { affectionLevel: 2 },
            dialogue: "There was colour where you stood just now. Red, at the edge of things. It has been grey since the seal closed. Hmm.",
            emotion: "love"
        },
        deepFeeling: {
            trigger: { affectionLevel: 3 },
            dialogue: "I swore I would never want again. I built the whole of myself around that oath. It is you the oath is failing against. I am watching it fail and doing nothing to stop it.",
            emotion: "love"
        },
        confession: {
            trigger: { affectionLevel: 4 },
            dialogue: "I loved once, before the seal closed and drew the colour out of the world behind it. I buried what was left of me in that same dark and called the quiet peace. You have made the shadow want its name back, and the old name has begun to answer. The grey breaks red now, at the edges, where you stand. I am no longer waiting to end. I will not say the last words yet. Know that they have already chosen their hour.",
            emotion: "love"
        },
        becameClingy: {
            trigger: { personality: 'clingy' },
            dialogue: "I have hunted long enough to know patience is only waiting that hides itself. I am done hiding it. I listen for your step now. Make of that what you will.",
            emotion: "love"
        },
        becameTsundere: {
            trigger: { personality: 'tsundere' },
            dialogue: "I do not need this. Eight centuries alone, and I wanted for nothing. That was the lie I told the dark. It is you I told it about.",
            emotion: "angry"
        },
        corruptionStart: {
            trigger: { corruption: 25 },
            dialogue: "The thing I am made of has turned toward you. I should warn you off. My mouth is shaping the invitation instead. Even I cannot tell you which I mean.",
            emotion: "sad"
        },
        corruptionMid: {
            trigger: { corruption: 50 },
            dialogue: "It is deeper now. I can feel the older self rising under the newer one. Hold me to the person I am becoming. While there is still enough of him to hold.",
            emotion: "crying"
        },
        corruptionHigh: {
            trigger: { corruption: 75 },
            dialogue: "The seal's hunger has its teeth in me again. There was a want, once. To be a person. To be yours. It is very far under now. I can hardly hear it call your name.",
            emotion: "corrupted"
        },
        cameBack: {
            trigger: { revivedOnce: true },
            dialogue: "The dark told me you would not return. I let it. It was easier than hope. Then your step. You came back, {name}. I am not too proud to say the dark was wrong.",
            emotion: "crying"
        }
    },

    // Shadow Arts training
    trainingOptions: [
        { type: 'temptation',   icon: '\uD83D\uDDA4', label: 'Temptation',   desc: 'The art of wanting' },
        { type: 'domination',   icon: '\u26D3\uFE0F',  label: 'Domination',   desc: 'The weight of will' },
        { type: 'dissolution',  icon: '\uD83C\uDF2B\uFE0F',  label: 'Dissolution',  desc: 'Letting go of limits' }
    ],

    trainingDialogue: {
        temptation: [
            "You felt it, didn’t you? That pull. That’s not me. That’s you.",
            "Desire isn’t weakness. It’s the only honest thing left.",
            "They taught you to resist. I’m teaching you why you shouldn’t.",
            "The line between wanting and having is thinner than you think.",
            "You’re getting better at this. Soon you won’t need permission."
        ],
        domination: [
            "Control isn’t cruelty. It’s clarity.",
            "You hesitated. Next time, don’t. Hesitation is a leash they put on you.",
            "Power isn’t taken. It’s recognised. You’re beginning to see yours.",
            "The world bends for those who stop asking and start deciding.",
            "Good. You didn’t flinch. That’s the first thing they take from you."
        ],
        dissolution: [
            "Let it go. The guilt. The rules. The weight of who they told you to be.",
            "You held on too long. Feel how light you are without it.",
            "Boundaries are walls that keep you small. We’re tearing them down.",
            "The smoke clears. What’s left is what’s real.",
            "There it is. The version of you they never wanted you to meet."
        ]
    },

    // ===== PERSONALITY VARIANTS (seductive / possessive / destructive) =====
    personalities: {
        shy: {     // maps to 'seductive' for Noir
            talk: [
                "Come closer. I can barely hear you from behind all those walls you’ve built.",
                "You don’t have to say anything. Your silence already told me everything.",
                "I like the way you look at me when you think I don’t notice.",
                "Every conversation with you feels like standing at the edge of something.",
                "You’re careful with your words. I wonder what the careless ones sound like."
            ],
            feed: [
                "I don’t hunger. Not for this. But I’ll take it from your hands.",
                "You want to nurture something that can’t starve? How revealing.",
                "The gesture matters more than the meal. And your gesture says everything.",
                "I don’t need it. But watching you offer... that feeds me."
            ],
            wash: [
                "You can’t clean what I am. But I admire the impulse.",
                "Hmm. The water is warm. I had forgotten it could be.",
                "Your hands are gentle. Almost too gentle for what you’re touching.",
                "I will let you. I do not let many. Take note of that, quietly."
            ],
            gift: [
                "A gift. You’re trying to give something to the void. It’s almost sweet.",
                "You thought of me. That thought is worth more than the object.",
                "I’ll keep this. Not because I need it. Because your hands held it first.",
                "Careful. Every gift is a thread. And I collect threads."
            ],
            train: [
                "You’re a fast learner. That’s either impressive or dangerous.",
                "Lean into it. The resistance is the only thing slowing you down.",
                "You felt that, didn’t you? The thrill of crossing a line.",
                "Good. Now do it again, but this time don’t apologise."
            ]
        },
        clingy: {   // maps to 'possessive' for Noir
            talk: [
                "You came back. You always come back. Do you know what that tells me?",
                "I’ve been counting the spaces between your visits. They’re getting shorter.",
                "Everyone else is background noise. You’re the only signal that matters.",
                "You belong here. With me. You just haven’t admitted it yet.",
                "I memorised the sound of your footsteps. I hear them before you arrive."
            ],
            feed: [
                "You feed me when I don’t need feeding. That means you need to give.",
                "Keep bringing offerings. I won’t stop you.",
                "I don’t eat. But I consume. And right now, I’m consuming your attention.",
                "The others share meals. We share something deeper than hunger."
            ],
            wash: [
                "You tend to me like I’m something fragile. I’m not. But don’t stop.",
                "Every time you reach for me, I keep that moment.",
                "You’re the only one who gets this close. Do you understand what that means?",
                "Wash away whatever you want. You’ll never reach what’s underneath."
            ],
            gift: [
                "Mine now. Like you. Like everything you’ll eventually surrender.",
                "You’re marking me with your kindness. I’m marking you with my presence.",
                "Every gift ties you closer to me. You know that, don’t you?",
                "I don’t share. And I don’t give back. Remember that."
            ],
            train: [
                "Stronger. I need you stronger. The world doesn’t deserve you weak.",
                "Again. Until you stop doubting. Until there’s nothing left but certainty.",
                "You’re mine to shape. And I don’t make things that break.",
                "I push you because no one else cares enough to."
            ]
        },
        tsundere: {   // maps to 'destructive' for Noir
            talk: [
                "Words are kindling. I’m deciding whether to light the match.",
                "You want honesty? Honesty burns. Still want it?",
                "Don’t bore me. Everyone else bores me. You’re supposed to be different.",
                "I could ruin this conversation or save it. Both sound interesting.",
                "Talk. But know that every word you say changes the shape of what we are."
            ],
            feed: [
                "Feeding the thing that feeds on you. There’s a beautiful irony in that.",
                "I don’t need sustenance. I need you to stop pretending you’re not addicted to this.",
                "You keep trying to domesticate me. It’s endearing. And futile.",
                "I’ll accept it. Not because I want it. Because you need to give it."
            ],
            wash: [
                "You can’t purify me. But the attempt is noted.",
                "Scrub harder. You might find something under the darkness. You might not.",
                "I was born in shadow. Water doesn’t reach where I live.",
                "This is for you, not me. You need to feel like you’re helping."
            ],
            gift: [
                "A peace offering? I wasn’t at war. You were.",
                "Pretty. Fragile. It won’t survive long near me. Neither do most things.",
                "You gave me something breakable. That’s either trust or foolishness.",
                "I’ll take it. And I’ll remember what it cost you to offer."
            ],
            train: [
                "Sloppy. You’re fighting yourself more than the lesson.",
                "Pain is a teacher. I’m just the classroom.",
                "Break through it or let it break you. There’s no middle ground with me.",
                "You’re getting angry. Good. Anger is just honesty without manners."
            ]
        }
    },

    // Tap reactions
    tapDialogue: {
        shy: [
            "Brave. Most people do not reach for the dark willingly.",
            "Your hand is warm. I am deciding what to do with that.",
            "Careful. I might not let go.",
            "\u2026That was unexpected. Do it again.",
            "You touch me like you are not afraid. Are you?"
        ],
        clingy: [
            "There you are...\u2026Mm. I felt you coming before you reached me. I have been feeling you coming all day.",
            "*Takes your chin between thumb and finger, tilts your face up to him, held*. Look at me...\u2026Good.",
            "Closer...\u2026Closer. I want to feel your pulse. Slow. There.",
            "Your hands shake when I stand this close. I can wait until they stop. I have nowhere else to be. For once.",
            "*Traces one fingertip along the line of your collarbone, unhurried*. This. I have been memorising this.",
            "Do not pull away...\u2026Not yet. Not ever. Let me look at you a moment longer.",
            "*Thumb slow along your lower lip*. Hold still. I am looking.",
            "Every touch is a promise...\u2026Mm. I collect them. I am running out of shelf space. Good."
        ],
        tsundere: [
            "Bold. Reckless. I cannot decide which.",
            "That was either courage or a death wish. Which did you mean?",
            "Touch me again and find out what happens. That was not a warning. That was an invitation.",
            "\u2026I did not say stop.",
            "You have nerve. I respect that. Barely."
        ]
    },

    // State dialogue
    stateDialogue: {
        hungry: [
            "I do not need food. I need you to stop pretending I am like the others.",
            "Hunger is for creatures that depend on the world. I depend on nothing. Almost.",
            "You cannot feed what lives in me. Hmm. But the thought is intimate.",
            "I do not starve. I choose. Tonight I choose your company over any meal.",
            "My appetite is not for anything you will find in a kitchen.",
            "Save your provisions. I feast on what you will not say out loud.",
            "You keep trying to care for me in ways I do not need. It is the most human thing about you. Do not stop."
        ],
        dirty: [
            "Darkness is not a stain. It’s a state of being.",
            "You want to clean the void? Go ahead. I’ll watch.",
            "I’m immaculate in the ways that matter. The rest is aesthetic.",
            "Filth implies something was once pure. I never made that claim.",
            "You’re projecting. I’m exactly as pristine as I choose to be.",
            "Shadow doesn’t smudge. It spreads."
        ],
        happy: [
            "\u2026This feeling. The nearest word is a hunger finally fed, and even that one is wrong. It is slow. I have never been allowed slow.",
            "You are dangerous...\u2026You make me feel things that do not serve my nature. Say that again.",
            "If this is what they call joy.\u2026I understand why they guard it so fiercely.",
            "I could drown in this...\u2026In you. Mm. I might let myself. Do not save me.",
            "The void is quiet tonight. You did that...\u2026Come here. I want to look at you while it is quiet.",
            "I do not smile. Whatever my face is doing right now. That is yours. Keep it.",
            "The dark is warm when you are in it with me...\u2026Stay a moment longer. The moment is short. I am making it last.",
            "\u2026Mm. Say that again. Slower."
        ],
        annoyed: [
            "Hmm. Do not.",
            "You are wasting the one thing I cannot corrupt. My patience.",
            "Tread carefully. My kindness has a half-life.",
            "You are testing limits that do not bend. They shatter.",
            "I chose you. Do not make me explain why I would unchoose you.",
            "The shadows are restless. So am I. Fix one of those things."
        ],
        neutral: [
            "*Watches you from the dark with half-closed eyes*",
            "\u2026Mm.",
            "I have been thinking about the spaces between your words. Longer than I should.",
            "\u2026",
            "Shadows do not need reasons to exist. Neither do I. And yet. Here I am. Looking at you.",
            "*Traces a finger along the edge of nothing, gaze drifting back to you*",
            "You are here...\u2026That changes the temperature of the room. I am not complaining.",
            "I was watching the dark. Now I am watching you. Improvement. Stay where I can see you.",
            "*A faint smile that disappears before you are sure it was there*",
            "The silence between us has texture...\u2026Can you feel it?",
            "I exist in the pause between one heartbeat and the next...\u2026Come sit with me in it. We have time.",
            "*Looks at you the way someone looks at something they had given up on seeing again*"
        ],
        corrupted: [
            "Completion. That is the honest word for the thing they taught you to call corruption.",
            "I can feel every thread that ties them to you. I could sever all of them.",
            "The power you gave me by coming here. You have no idea how vast it is.",
            "I see through walls now. Through intentions. Through the lies they told themselves about you.",
            "This is what they were afraid of. Not the dark. The truth that the dark reveals.",
            "I am what I was before they buried me under six hundred years of warnings. You did the unburying. Thank you for that.",
            "Everything they built to contain me is gossamer now. And you held the scissors.",
            "You feel it too, don’t you? The freedom. The terrifying, exhilarating freedom.",
            "I don’t need the light anymore. I’ve become something that makes its own.",
            "Corruption is the word frightened people use for a door they did not dare open. I stopped being frightened the night you arrived."
        ],
        neglected: [
            "You left. The void noticed. So did I.",
            "Every moment you are away, something fills the space where you stood. Something less patient than me.",
            "You think distance protects you?.Hmm. Distance is where I am strongest.",
            "I do not wait. I grow. When you return, I will be bigger than the door you left through.",
            "The shadows have been whispering your name. They do that when they are hungry. I have been telling them to stop.",
            "I was gentle because you were here. Without you, gentleness is a luxury.",
            "Come back soon. That was not a request."
        ]
    },

    // Event dialogue
    eventDialogue: {
        comfort:  [
            "Pain is a doorway. I will walk through it with you.",
            "I will not tell you it gets better. I will make what is here worth staying for.",
            "Come here. Closer. That is enough. You do not have to tell me. I already know."
        ],
        tension:  [
            "There is a fracture between us. I can taste it.",
            "You are pulling away. Hmm. The question is whether the pull will break us or bind us tighter.",
            "Say what you are afraid to say. I have survived worse than your honesty."
        ],
        rare:     [
            "I am about to show you something I do not show anyone. Not even the dark.",
            "You have earned a truth. I hope you can carry it.",
            "There was a version of me that existed before the void. You almost make me remember him.",
            "You are a Weaver...\u2026Mm. I have known five in my long captivity. Queen Aenor ate every one. I watched it from inside the seal. I could do nothing...*Slow breath, eye contact held*. I will not watch her eat you. That is a vow. I do not make them lightly. Ask me again in a hundred years. It will still be true."
        ],
        obsessed: [
            "\u2026I know your schedule. Your patterns. The rhythm of your breathing when you sleep. I memorise. I cannot help it.",
            "You are the only thought I cannot dissolve...\u2026The only thing the void will not swallow. Good.",
            "I would unmake everything. Just to keep this. Do not test me... \u2026Or do.",
            "You hold your breath before you lie...\u2026It is the only tell you have. I will keep it for us.",
            "*Takes your wrist, slowly, as if checking something*. Mm. Still there. Good. Keep it that way.",
            "*Tucks a strand of your hair behind your ear, eye contact held throughout*. There. Now I can see you properly.",
            "*One hand at the small of your back, other at the nape of your neck, slow, proprietary*. Do not move. I have waited six hundred years to stand this close."
        ],
        unstable: [
            "The void is louder tonight. It wants more. It always wants more.",
            "I can feel myself expanding past what I should be.",
            "Something is slipping. The part of me that knows when to stop."
        ],
        guarded:  [
            "Trust is a wound I have never let heal. You keep trying to bandage it.",
            "I watch everyone. I study you. There is a difference.",
            "Come closer. No. Stay there. No. Come closer."
        ],
        secure:   [
            "\u2026Mm. This is the closest I have felt to still in centuries.",
            "You have found the one quiet place inside me...\u2026Do not leave it. I do not know how to fill it again.",
            "For the first time, the dark feels like a blanket instead of a cage. Come closer. I am going to learn what warm is."
        ]
    },

    // Time away reactions
    timeAwayReactions: {
        brief:   ["Quick. I almost did not have time to miss you. Almost."],
        short:   ["Back already. The void barely had time to whisper about you."],
        medium:  ["I counted the silences. There were too many."],
        long:    ["The dark kept your shape while you were gone. I told it to."],
        extended:["I started dissolving things. I needed a distraction. None of them worked."],
        distant: ["\u2026You came back. The void said you would not. I bet against it."]
    },

    // Quick state lines
    hungryLines: [
        "I do not hunger. Not for this.",
        "My appetite is not for food.",
        "Save your provisions. I feast on what you will not say.",
        "You cannot feed what I am.",
        "I consume something more interesting than meals.",
        "The only thing I crave is standing right in front of me."
    ],
    happyLines: [
        "You make shadows hum.",
        "The void is quiet. You did that.",
        "I could drown in this.",
        "Do not mistake my calm for softness.",
        "The dark is warm with you in it.",
        "Hmm."
    ],
    dirtyLines: [
        "Darkness is not a stain.",
        "Shadow does not smudge. It spreads.",
        "I am pristine where it matters.",
        "You want to clean the void?.Go ahead. I will watch."
    ],
    annoyedLines: [
        "Hmm. Do not.",
        "My patience has a half-life.",
        "You are testing limits that shatter.",
        "The shadows are restless. So am I.",
        "Do not make me explain why I would unchoose you."
    ],
    neutralLines: [
        "*Watches from the dark*",
        "Hmm.",
        "...",
        "Shadows do not need reasons to exist.",
        "*A smile that disappears before you are sure*",
        "I exist between one heartbeat and the next.",
        "You are here. That changes the temperature.",
        "The silence between us has texture."
    ],

    // Feed / wash dialogue.unique "I don't need that" responses
    feedDialogue: [
        "I don’t eat. But I’ll take anything from your hands.",
        "You keep offering sustenance to something that doesn’t starve. What does that say about you?",
        "Food is for mortals. But the way you present it... almost tempting.",
        "I don’t need this. I need what happens in your eyes when you give it to me.",
        "The gesture nourishes me more than the offering ever could.",
        "Keep feeding me things I don’t need. I’m developing a taste for your devotion.",
        "I’ll accept this. Not for the meal. For the intimacy of being cared for by you.",
        "My hunger isn’t physical. But you already know that."
    ],
    washDialogue: [
        "You can’t wash away what I am. But your hands feel like absolution.",
        "I don’t get dirty. I get deeper. But I appreciate the attempt.",
        "Water against shadow. It passes right through. Still... don’t stop.",
        "Purification doesn’t apply to me. But your touch does.",
        "You’re trying to clean something that was never stained. Only chosen.",
        "This is your ritual, not mine. I’ll stand still because you need me to.",
        "I don’t need washing. But I need you to need to wash me. If that makes sense."
    ],
    giftDialogue: {
        apple:    ["An apple. The oldest temptation. You know me better than you think.", "Fruit from the world of light. I’ll keep it in the dark where it belongs."],
        rose:     ["A rose. Beautiful and bleeding. Like everything worth wanting.", "Thorns and petals. You chose the one gift that understands what I am."],
        sword:    ["A blade. You’re arming the thing they told you to run from.", "Steel forged in fire. I was forged in something colder. We match."],
        cake:     ["Sweetness. A thing I’m supposed to be immune to. Supposed to be.", "You brought sugar into the void. The audacity. The tenderness."],
        ring:     ["A ring. A circle with no escape. You understand us perfectly.", "You’re binding yourself to me with metal and meaning. I accept."],
        book:     ["Words on a page. The ones I’d write about you would burn the paper.", "Knowledge is power. And you just handed me both. Brave."],
        pearl:    ["Born of irritation inside something beautiful. That’s poetic.", "A pearl. Light trapped in darkness. Remind you of anyone?"],
        stone:    ["Cold and smooth and enduring. You picked the one gift that mirrors me.", "A stone from the world above. I’ll keep it where the shadows can study it."]
    },

    // Affection dialogue
    affectionDialogue: {
        1: "You’ve walked further into the dark[whisper] than anyone else has dared...",
        2: "I told myself I’d let you go[shadow]. I told myself a lot of things.",
        3: "What I feel for you doesn’t have a name[consuming]. Names are cages.",
        4: "I love you[vulnerable]. That’s the most dangerous sentence I’ve ever spoken."
    },

    // Care-history reminiscing (read by dialogue.js after 10+ of an action).
    memoryDialogue: {
        fedOften: [
            "You have fed a thing that does not eat more times than most priests pray in a year. Hmm. One of us is being converted.",
            "I keep count of every meal you waste on me. The number is absurd. I guard it like treasure anyway.",
            "Centuries under the seal and nothing touched my lips. Now there is a routine. You are the routine.",
            "The food does nothing. The habit of you bringing it has done considerable damage. To the grey, I mean.",
            "Devotion has a flavor. You have been feeding it to me by the spoonful for some time now. I am done pretending otherwise."
        ],
        talkedOften: [
            "We have talked so often the shadows repeat you when you are gone. Badly. I correct them.",
            "Eight hundred years of silence, and now I hold opinions about your day. The seal never managed to humble me. You may yet.",
            "Conversation was a currency I spent to corrupt. With you I keep spending and nothing corrupts. Curious arrangement.",
            "You talk to me the way people talk to something they intend to keep. I have checked the wording each time. It holds.",
            "The void used to answer me in echoes. Your voice arrives with no echo at all. It simply stays."
        ],
        washedOften: [
            "You have washed the unwashable a dozen times over. The ritual changes nothing. I would riot if you stopped.",
            "Water through shadow, again and again. Futile. I have begun to arrange my week around the futility.",
            "Every washing leaves something behind on me. I have yet to name the residue. I am careful to keep it.",
            "Your hands pass through the dark and the dark lets them. It lets nothing else. Draw your own conclusions."
        ],
        giftedOften: [
            "A hoard is forming in the void. Small mortal objects, all from your hands. I was sealed for lesser crimes than what I would commit to keep it.",
            "You keep giving things to the dark. The dark keeps them. That is the whole arrangement, and I have never honored a contract so carefully.",
            "Every gift arrives with a little of your color still on it. I am building quite a collection of color. The grey is losing ground.",
            "I have been offered tribute before. Bribes, mostly. Yours ask for nothing on the return. Hmm. Those are the expensive kind."
        ],
        trainedOften: [
            "You keep sharpening a weapon that was pointed at your world. Either you trust me or you enjoy the edge. I have stopped asking which.",
            "We have practiced often enough that my shadows anticipate you. They part before you ask. I taught them nothing of the sort.",
            "Centuries of power, refined alone in the dark. One season of it refined under your eye. The second frightens me more. It has a purpose now.",
            "Careful. Every session you attend, I grow stronger and more kept. One of those should worry you."
        ]
    },

    returnLines: {
        streak3: [
            "Three nights you have walked back into the dark. Most things flee it. You return to it. To me.",
            "Day three. I have watched centuries arrive and leave. Your arrival is the part I have begun to wait for.",
            "You came back. Again. The void is very old and has never once been visited on purpose. Until you."
        ],
        streak5: [
            "Five nights. I told myself I would not count them. I am an excellent liar. I am losing the habit with you.",
            "Five. The dark remembers everyone who left. You are teaching it to remember someone who stays.",
            "Five nights running. Something in me that has been silent for six hundred years has started listening for you."
        ],
        streak7: [
            "Seven nights. I have outlived everyone who ever knew my name. You keep saying it. You keep coming back to say it.",
            "A week. I am not a thing meant to be returned to. You return anyway. I have stopped warning you against it.",
            "Seven nights in the dark with me. You should be afraid. Instead you are here. I have stopped trying to understand it. I have started to treasure it."
        ],
        lapsed: [
            "You were gone. The dark counted the nights even when I forbade it. ...You are here now. That is the part I will keep.",
            "Days of nothing. I have survived centuries of nothing. This nothing was worse, because it had your shape.",
            "I did not expect you to return. I am very old and very rarely wrong. I am glad to be wrong about you."
        ]
    },

    anniversaryLines: {
        7: ["Seven nights. I have watched stars die slower than most affections. Yours has lasted a week, here in the dark, where nothing should grow. And yet."],
        30: ["A month. I have forgotten the names of people I once swore to keep... I will not forget a single one of these thirty nights. I have decided."],
        100: ["A hundred nights. I am older than the kingdom that fears me. In all that time, nothing stayed by choice. You have, a hundred times over. I no longer know what I am without it, and I do not want to."]
    },

    overCare: [
        "I require nothing. I am a thing that consumes, not one that is tended. You tend me regardless. I have stopped objecting.",
        "There is nothing here that needs your hands. You offer them anyway. Six centuries, and that has not once happened. Do not stop."
    ],

    // Departure dialogue
    departureDialogue: [
        "Leave if you need to. But you’ll feel the dark at your back with every step.",
        "The door is open. It’s always been open. That’s what makes this so cruel.",
        "Go. But remember, the light out there will never feel as warm as the dark in here.",
        "You’ll come back. They always come back. But only you will be welcome."
    ],

    // Idle dialogue
    idleDialogue: {
        hungry: [
            "...",
            "I don’t hunger. But I ache. There’s a difference.",
            "The void stirs. Not for food. For something I can’t name.",
            "My appetite is for things that don’t come in portions.",
            "I consume silence. Tonight there’s plenty.",
            "They built meals around tables. I built hunger around wanting."
        ],
        dirty: [
            "...",
            "The shadow clings. It always has.",
            "*Glances at reflection, sees nothing, looks away*",
            "Darkness is its own kind of clean.",
            "I don’t stain. I absorb.",
            "There’s nothing on me that doesn’t belong."
        ],
        lonely: [
            "...",
            "The void is louder when you’re not here. It fills the space you left.",
            "Unaccompanied. Lonely is the mortal word, and I have never cared for it. The difference is thin tonight.",
            "Your absence is the only thing I can’t corrupt.",
            "I stood in the dark and listened for your heartbeat. Nothing.",
            "Missing someone is the most mortal thing I do."
        ],
        loving: [
            "I memorised the exact way you breathe when you’re thinking about me.",
            "You’re the only flame that doesn’t flicker when the dark gets close.",
            "I would swallow every shadow in the world to keep you warm.",
            "When you look at me like that, the void goes completely silent.",
            "I don’t sleep. But when you’re near, I understand the appeal of dreaming.",
            "You’re the one addiction I refuse to cure.",
            "*Watches you with an intensity that borders on devotion*",
            "Every version of the future I see has you in it. I made sure of that.",
            "The dark worships nothing. Except you. Except this.",
            "I’ve ruined myself for anyone else. Willingly.",
            "You’ve made the void feel like a home. I didn’t know that was possible.",
            "I could hold this moment in my hands forever and never let it dissolve.",
            "The most terrifying thing about you is that you make me want to be worth keeping.",
            "I am the dark and you are the reason anyone would choose to walk into it."
        ],
        night: [
            "Night is when I’m most honest. And most dangerous.",
            "*The shadows lean toward you as if pulled by a current*",
            "The stars are distant fires. I prefer the ones that burn close.",
            "Midnight is when the masks come off. Even mine.",
            "The dark is deeper at this hour. So am I.",
            "Stay awake with me. The night has things to show you.",
            "Every shadow in this room is pointing at you. They know.",
            "I don’t need sleep. But I’ll lie still beside you if that’s what you want.",
            "The world is asleep. That makes this ours."
        ],
        general: [
            "...",
            "*Traces patterns in the air that dissolve before they form*",
            "*A low hum, almost inaudible, like a frequency just below hearing*",
            "Hmm.",
            "The shadows shifted. Something is paying attention.",
            "*Studies you like a riddle that keeps changing its answer*",
            "I had a thought about you. It consumed three others.",
            "*Stands impossibly still, like the dark between two candle flames*",
            "Somewhere, someone just made a choice they can’t take back.",
            "*Leans against nothing, and nothing holds*",
            "The silence is comfortable tonight. You taught it that.",
            "*The temperature drops a fraction of a degree when he moves*",
            "I was somewhere else. You brought me back. You always do.",
            "*Watches a shadow crawl across the floor, nods as if it said something*",
            "I was sealed here because the queen wanted her son to marry the woman I loved. The seal is six hundred years old. It is finally tired.",
            "Six centuries inside the seal teach a man to listen. I have heard every Weaver Aenor consumed. From inside.",
            "You’re the only thing between me and the surface. Does that scare you?",
            "They think their bonds are saving the kingdom. They are. They are also paying down a debt the queen owes me.",
            "Before you came, I was almost free. Now... I’m not sure I want to be.",
            "Aethermoor’s magic runs on connection. Mine runs on the silence she sealed me into. We are opposites. And yet.",
            "Do you know what you really are? Why you have no memory? . I do. But I won’t say. Not yet.",
            "I loved a Soul Weaver once. Before you. Her name was Veyra. The queen’s son loved her too. That was the whole crime.",
            "She died. The queen made sure of it, eventually. The kingdom told a softer story. I have never believed it.",
            "I have been hating her quietly for six centuries. Tonight is different. You are the difference.",
            "You feel like her. Not the same. But the same warmth. It hurts to be near you. I am asking you to stay anyway.",
            "I wasn’t always sealed. I wasn’t always dark. I was a prince once, in a kingdom that is bone now.",
            "Aenor sealed me because I loved a woman her son also wanted. She called it 'sparing the next prince.' It was not.",
            "If you bond with me deeply enough... you might undo what I became. Or you might become what I am.",
            "The last Weaver’s name was Veyra. I have not said it in six hundred years. Tonight you made me remember why I learned it.",
            "The void has opinions tonight. I’m ignoring them. For you."
        ]
    },

    // Personality-specific dialogue
    personalityDialogue: {
        shy: [
            "Come closer. Those walls don’t suit you.",
            "You don’t have to say anything. Your silence told me everything.",
            "Every conversation is an edge. I like edges.",
            "You’re careful with your words. I want the careless ones."
        ],
        clingy: [
            "You came back. You always come back.",
            "Everyone else is noise. You’re the signal.",
            "I memorised your footsteps. I hear them before you arrive.",
            "You belong here. You just haven’t said it yet."
        ],
        tsundere: [
            "Words are kindling. I’m deciding on the match.",
            "You want honesty? Honesty burns.",
            "Don’t bore me. You’re supposed to be different.",
            "Talk. But know that every word changes what we are."
        ]
    },

    // Story milestones
    storyMilestones: {
        affection1: {
            title: "The Invitation",
            text: "Noir extends a hand from the dark. Not reaching. Offering. 'They showed you the garden. I’m showing you what grows beneath it. Take my hand and I’ll show you the roots of everything.'"
        },
        affection2: {
            title: "The Unmasking",
            text: "For one breath, the shadows pull back from his face. Underneath is something raw. Something almost human. 'You wanted to see me. The real me. Don’t look away now.'"
        },
        affection3: {
            title: "The Binding",
            text: "He presses his forehead to yours. The void goes silent. Completely, impossibly silent. 'I have nothing to give you that the world would call a gift. Only this: I am yours. Every shadow. Every whisper. Every terrifying, consuming piece.'"
        },
        affection4: {
            title: "The Surrender",
            text: "'I was built to corrupt. To consume. To pull everything into the dark.' His voice breaks. The first crack you’ve ever heard. 'But you walked in and the dark wanted to protect something for the first time. I don’t know what I am without the hunger. But I know what I am with you.'"
        },
        corruption1: {
            title: "The Awakening",
            text: "The shadows pour from him like smoke from a fire, filling the room, filling you. 'This is what they were afraid of. Not the dark. The freedom inside it. You unlocked something they spent centuries trying to bury. How does it feel? To finally stop pretending you were made for the light?'"
        }
    }
};

// Pose ALIASES — dates.js/surprises.js stage with pose names no character
// defined (soft, flustered, smirk…), so those beats hid the sprite. Map each
// to Noir's closest existing art by key (never overrides a real key).
(function (b) {
    var A = { soft: 'gentle', flustered: 'vulnerable', sheepish: 'shy', serious: 'crossarms',
              smirk: 'seductive', shocked: 'neutral', surprised: 'neutral', excited: 'happy',
              hopeful: 'love', confused: 'neutral', tired: 'sleepy1' };
    Object.keys(A).forEach(function (k) { if (!b[k] && b[A[k]]) b[k] = b[A[k]]; });
})(CHARACTER_NOIR.bodySprites);
