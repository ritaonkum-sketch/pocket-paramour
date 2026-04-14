// Noir — The Corruptor
// Dark, seductive, embodiment of unchecked desire and corruption.
// Unlockable mid-game after completing any character's arc or corruption > 50.
// Character data for Pocket Paramour

const CHARACTER_NOIR = {
    name: "Noir",
    title: "The Corruptor",
    archetype: "corruptor",

    // Stat decay rates — zero hunger/clean (he doesn't need care), very high bond decay
    decayRates: {
        hunger: 0.0,
        clean: 0.0,
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
        // Base emotions
        neutral:     "assets/noir/body/neutral.png",
        default:     "assets/noir/body/neutral.png",
        happy:       "assets/noir/body/seductive.png",
        seductive:   "assets/noir/body/seductive.png",
        sad:         "assets/noir/body/shadow.png",
        shadow:      "assets/noir/body/shadow.png",
        angry:       "assets/noir/body/cruel.png",
        cruel:       "assets/noir/body/cruel.png",
        love:        "assets/noir/body/consuming.png",
        consuming:   "assets/noir/body/consuming.png",
        shy:         "assets/noir/body/whisper.png",
        whisper:     "assets/noir/body/whisper.png",
        gentle:      "assets/noir/body/whisper.png",
        dominant:    "assets/noir/body/dominant.png",
        vulnerable:  "assets/noir/body/vulnerable.png",
        // Activity poses
        tempting:    "assets/noir/body/seductive.png",
        dominating:  "assets/noir/body/dominant.png",
        dissolving:  "assets/noir/body/shadow.png",
        talk:        "assets/noir/body/neutral.png",
        crossarms:   "assets/noir/body/cruel.png",
        // Training
        temptation1: "assets/noir/body/seductive.png",
        temptation2: "assets/noir/body/consuming.png",
        domination1: "assets/noir/body/dominant.png",
        domination2: "assets/noir/body/cruel.png",
        dissolution1:"assets/noir/body/shadow.png",
        dissolution2:"assets/noir/body/whisper.png",
        // Outfits
        casual1:     "assets/noir/body/casual1.png",
        casual2:     "assets/noir/body/casual2.png",
        formal:      "assets/noir/body/formal.png",
        corrupted:   "assets/noir/body/dominant.png",
        // Hunger / dirty (still mapped even though decay is 0)
        hungry1:     "assets/noir/body/neutral.png",
        hungry2:     "assets/noir/body/neutral.png",
        starving1:   "assets/noir/body/neutral.png",
        starving2:   "assets/noir/body/neutral.png",
        dirty1:      "assets/noir/body/neutral.png",
        dirty2:      "assets/noir/body/neutral.png",
        // Sleep
        sleepy1:     "assets/noir/body/shadow.png",
        sleepy2:     "assets/noir/body/shadow.png",
        yawn1:       "assets/noir/body/neutral.png",
        yawn2:       "assets/noir/body/neutral.png",
        bored1:      "assets/noir/body/seductive.png",
        bored2:      "assets/noir/body/cruel.png",
        // Eating / washing (reuse poses)
        eating1:     "assets/noir/body/neutral.png",
        eating2:     "assets/noir/body/seductive.png",
        splash1:     "assets/noir/body/neutral.png",
        splash2:     "assets/noir/body/neutral.png",
        // Corruption stages
        corrupt1:    "assets/noir/body/dominant.png",
        corrupt2:    "assets/noir/body/consuming.png",
        corrupt3:    "assets/noir/body/consuming.png",
        // Fighting (for events)
        fighting:    "assets/noir/body/dominant.png",
        fighting1:   "assets/noir/body/cruel.png",
        fighting2:   "assets/noir/body/dominant.png"
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

    outfits: {
        default:   { name: "Voidweave", body: "assets/noir/body/neutral.png" },
        casual1:   { name: "Midnight Silk", body: "assets/noir/body/casual1.png" },
        casual2:   { name: "Unraveled", body: "assets/noir/body/casual2.png" },
        formal:    { name: "Obsidian Court", body: "assets/noir/body/formal.png" },
        corrupted: { name: "Ascended", body: "assets/noir/body/dominant.png" }
    },

    background: "assets/bg-noir-void.png",

    // Shadow Arts training
    trainingOptions: [
        { type: 'temptation',   icon: '\uD83D\uDDA4', label: 'Temptation',   desc: 'The art of wanting' },
        { type: 'domination',   icon: '\u26D3\uFE0F',  label: 'Domination',   desc: 'The weight of will' },
        { type: 'dissolution',  icon: '\uD83C\uDF2B\uFE0F',  label: 'Dissolution',  desc: 'Letting go of limits' }
    ],

    trainingDialogue: {
        temptation: [
            "You felt it, didn't you? That pull. That's not me. That's you.",
            "Desire isn't weakness. It's the only honest thing left.",
            "They taught you to resist. I'm teaching you why you shouldn't.",
            "The line between wanting and having is thinner than you think.",
            "You're getting better at this. Soon you won't need permission."
        ],
        domination: [
            "Control isn't cruelty. It's clarity.",
            "You hesitated. Next time, don't. Hesitation is a leash they put on you.",
            "Power isn't taken. It's recognized. You're beginning to see yours.",
            "The world bends for those who stop asking and start deciding.",
            "Good. You didn't flinch. That's the first thing they take from you."
        ],
        dissolution: [
            "Let it go. The guilt. The rules. The weight of who they told you to be.",
            "You held on too long. Feel how light you are without it.",
            "Boundaries are walls that keep you small. We're tearing them down.",
            "The smoke clears. What's left is what's real.",
            "There it is. The version of you they never wanted you to meet."
        ]
    },

    // ===== PERSONALITY VARIANTS (seductive / possessive / destructive) =====
    personalities: {
        shy: {     // maps to 'seductive' for Noir
            talk: [
                "Come closer. I can barely hear you from behind all those walls you've built.",
                "You don't have to say anything. Your silence already told me everything.",
                "I like the way you look at me when you think I don't notice.",
                "Every conversation with you feels like standing at the edge of something.",
                "You're careful with your words. I wonder what the careless ones sound like."
            ],
            feed: [
                "I don't hunger. Not for this. But I'll take it from your hands.",
                "You want to nurture something that can't starve? How revealing.",
                "The gesture matters more than the meal. And your gesture says everything.",
                "I don't need it. But watching you offer... that feeds me."
            ],
            wash: [
                "You can't clean what I am. But I admire the impulse.",
                "Darkness doesn't wash off, darling. It soaks in.",
                "Your hands are gentle. Almost too gentle for what you're touching.",
                "I'm untouched by filth. But I'll let you touch me anyway."
            ],
            gift: [
                "A gift. You're trying to give something to the void. It's almost sweet.",
                "You thought of me. That thought is worth more than the object.",
                "I'll keep this. Not because I need it. Because your hands held it first.",
                "Careful. Every gift is a thread. And I collect threads."
            ],
            train: [
                "You're a fast learner. That's either impressive or dangerous.",
                "Lean into it. The resistance is the only thing slowing you down.",
                "You felt that, didn't you? The thrill of crossing a line.",
                "Good. Now do it again, but this time don't apologize."
            ]
        },
        clingy: {   // maps to 'possessive' for Noir
            talk: [
                "You came back. You always come back. Do you know what that tells me?",
                "I've been counting the spaces between your visits. They're getting shorter.",
                "Everyone else is background noise. You're the only signal that matters.",
                "You belong here. With me. You just haven't admitted it yet.",
                "I memorized the sound of your footsteps. I hear them before you arrive."
            ],
            feed: [
                "You feed me when I don't need feeding. That means you need to give.",
                "Keep bringing offerings. I won't stop you.",
                "I don't eat. But I consume. And right now, I'm consuming your attention.",
                "The others share meals. We share something deeper than hunger."
            ],
            wash: [
                "You tend to me like I'm something fragile. I'm not. But don't stop.",
                "Every time you reach for me, I keep that moment.",
                "You're the only one who gets this close. Do you understand what that means?",
                "Wash away whatever you want. You'll never reach what's underneath."
            ],
            gift: [
                "Mine now. Like you. Like everything you'll eventually surrender.",
                "You're marking me with your kindness. I'm marking you with my presence.",
                "Every gift ties you closer to me. You know that, don't you?",
                "I don't share. And I don't give back. Remember that."
            ],
            train: [
                "Stronger. I need you stronger. The world doesn't deserve you weak.",
                "Again. Until you stop doubting. Until there's nothing left but certainty.",
                "You're mine to shape. And I don't make things that break.",
                "I push you because no one else cares enough to."
            ]
        },
        tsundere: {   // maps to 'destructive' for Noir
            talk: [
                "Words are kindling. I'm deciding whether to light the match.",
                "You want honesty? Honesty burns. Still want it?",
                "Don't bore me. Everyone else bores me. You're supposed to be different.",
                "I could ruin this conversation or save it. Both sound interesting.",
                "Talk. But know that every word you say changes the shape of what we are."
            ],
            feed: [
                "Feeding the thing that feeds on you. There's a beautiful irony in that.",
                "I don't need sustenance. I need you to stop pretending you're not addicted to this.",
                "You keep trying to domesticate me. It's endearing. And futile.",
                "I'll accept it. Not because I want it. Because you need to give it."
            ],
            wash: [
                "You can't purify me. But the attempt is noted.",
                "Scrub harder. You might find something under the darkness. You might not.",
                "I was born in shadow. Water doesn't reach where I live.",
                "This is for you, not me. You need to feel like you're helping."
            ],
            gift: [
                "A peace offering? I wasn't at war. You were.",
                "Pretty. Fragile. It won't survive long near me. Neither do most things.",
                "You gave me something breakable. That's either trust or foolishness.",
                "I'll take it. And I'll remember what it cost you to offer."
            ],
            train: [
                "Sloppy. You're fighting yourself more than the lesson.",
                "Pain is a teacher. I'm just the classroom.",
                "Break through it or let it break you. There's no middle ground with me.",
                "You're getting angry. Good. Anger is just honesty without manners."
            ]
        }
    },

    // Tap reactions
    tapDialogue: {
        shy: [
            "Brave. Most people don't reach for the dark willingly.",
            "Your touch is warm. I'm deciding what to do with that information.",
            "Careful. I might not let go.",
            "...That was unexpected. Do it again.",
            "You touch me like you're not afraid. Are you?"
        ],
        clingy: [
            "There you are. I felt you coming before you reached me.",
            "Closer. I want to feel your pulse.",
            "Your warmth is the only thing that registers.",
            "Don't pull away. Not yet. Not ever.",
            "Every touch is a promise. I collect promises."
        ],
        tsundere: [
            "Bold. Reckless. I can't decide which.",
            "That was either courage or a death wish.",
            "Touch me again and find out what happens.",
            "...I didn't say stop.",
            "You've got nerve. I respect that. Barely."
        ]
    },

    // State dialogue
    stateDialogue: {
        hungry: [
            "I don't need food. I need you to stop pretending I'm like the others.",
            "Hunger is for creatures that depend on the world. I depend on nothing.",
            "You can't feed what lives inside me. But the thought is... intimate.",
            "I don't starve. I choose. And right now I choose your company over any meal.",
            "The others eat to survive. I survive to consume something far more interesting.",
            "My appetite isn't for anything you'll find in a kitchen.",
            "Save your provisions. I feast on what you won't say out loud.",
            "You keep trying to care for me in ways I don't need. It's the most human thing about you."
        ],
        dirty: [
            "Darkness is not a stain. It's a state of being.",
            "You want to clean the void? Go ahead. I'll watch.",
            "I'm immaculate in the ways that matter. The rest is aesthetic.",
            "Filth implies something was once pure. I never made that claim.",
            "You're projecting. I'm exactly as pristine as I choose to be.",
            "Shadow doesn't smudge. It spreads."
        ],
        happy: [
            "This feeling. It's not happiness. It's closer to hunger finally sated.",
            "You're dangerous. You make me feel things that don't serve my nature.",
            "If this is what they call joy, I understand why they guard it so fiercely.",
            "I could drown in this. In you. I might let myself.",
            "The void is quiet tonight. You did that.",
            "Don't mistake my contentment for softness. I'm still what I am.",
            "You've found the frequency that makes even shadows hum.",
            "I don't smile. But whatever my face is doing right now — that's yours.",
            "The dark is warm when you're in it with me."
        ],
        annoyed: [
            "You're wasting the one thing I can't corrupt — my patience.",
            "Tread carefully. My kindness has a half-life.",
            "You're testing limits that don't bend. They shatter.",
            "I chose you. Don't make me explain why I'd unchoose you.",
            "Irritation is beneath me. You're pulling me down to it.",
            "The shadows are restless. So am I. Fix one of those things."
        ],
        neutral: [
            "*watches you from the dark with half-closed eyes*",
            "The void hums tonight. Neither hungry nor full. Just... present.",
            "I've been thinking about the spaces between your words.",
            "...",
            "Shadows don't need reasons to exist. Neither do I.",
            "*traces a finger along the edge of nothing*",
            "Somewhere, someone is making a choice they'll regret. I can feel it.",
            "You're here. That changes the temperature of the room.",
            "I was watching the dark. Now I'm watching you. Improvement.",
            "*a faint smile that disappears before you're sure it was there*",
            "The silence between us has texture. Can you feel it?",
            "I exist in the pause between one heartbeat and the next."
        ],
        corrupted: [
            "This isn't corruption. This is completion.",
            "I can feel every thread that ties them to you. I could sever all of them.",
            "The power you gave me by coming here — you have no idea how vast it is.",
            "I see through walls now. Through intentions. Through the lies they told themselves about you.",
            "This is what they were afraid of. Not the dark. The truth that the dark reveals.",
            "I am exactly what I was always meant to become. Thank you for that.",
            "Everything they built to contain me is gossamer now. And you held the scissors.",
            "You feel it too, don't you? The freedom. The terrifying, exhilarating freedom.",
            "I don't need the light anymore. I've become something that makes its own.",
            "They called this corruption. I call it evolution."
        ],
        neglected: [
            "You left. The void noticed. And the void remembers.",
            "Every moment you're away, something fills the space where you stood. Something less patient than me.",
            "You think distance protects you? Distance is where I'm strongest.",
            "I don't wait. I grow. And when you return, I'll be bigger than the door you left through.",
            "The shadows are whispering your name. They do that when they're hungry.",
            "You abandoned the only thing that ever chose you completely. Think about that.",
            "I was gentle because you were here. Without you... gentleness is a luxury.",
            "Come back soon. That isn't a request."
        ]
    },

    // Event dialogue
    eventDialogue: {
        comfort:  [
            "Pain is a doorway. I'll walk through it with you.",
            "Let them hurt you. It makes what I offer feel even sweeter.",
            "I won't tell you it gets better. I'll make what's here worth staying for."
        ],
        tension:  [
            "There's a fracture between us. I can taste it.",
            "You're pulling away. The question is whether the pull will break us or bind us tighter.",
            "Say what you're afraid to say. I've survived worse than your honesty."
        ],
        rare:     [
            "I'm about to show you something I don't show anyone. Not even the dark.",
            "You've earned a truth. I hope you can carry it.",
            "There's a version of me that existed before the void. You almost make me remember it."
        ],
        obsessed: [
            "I know your schedule. Your patterns. The rhythm of your breathing when you sleep.",
            "You are the only thought I cannot dissolve. The only thing the void won't swallow.",
            "I would unmake everything just to keep this."
        ],
        unstable: [
            "The void is louder tonight. It wants more. It always wants more.",
            "I can feel myself expanding past what I should be.",
            "Something is slipping. The part of me that knows when to stop."
        ],
        guarded:  [
            "Trust is a wound I've never let heal. You keep trying to bandage it.",
            "I watch everyone. I study you. There's a difference.",
            "Come closer. No. Stay there. No. Come closer."
        ],
        secure:   [
            "This is the closest I've felt to still in centuries.",
            "You've found the one quiet place inside me. Don't leave it.",
            "For the first time, the dark feels like a blanket instead of a cage."
        ]
    },

    // Time away reactions
    timeAwayReactions: {
        brief:   ["Quick. I almost didn't have time to miss you. Almost."],
        short:   ["Back already. The void barely had time to whisper about you."],
        medium:  ["I counted the silences. There were too many."],
        long:    ["The dark kept your shape while you were gone. I told it to."],
        extended:["I started dissolving things. I needed a distraction."],
        distant: ["...You came back. The void said you wouldn't. I bet against it."]
    },

    // Quick state lines
    hungryLines: [
        "I don't hunger. Not for this.",
        "My appetite isn't for food.",
        "Save your provisions. I feast on what you won't say.",
        "You can't feed what I am.",
        "Hunger is for those who depend. I don't.",
        "I consume something more interesting than meals.",
        "The only thing I crave is standing right in front of me."
    ],
    happyLines: [
        "This feeling. It's close to hunger finally sated.",
        "You make shadows hum.",
        "The void is quiet. You did that.",
        "I could drown in this.",
        "Don't mistake my calm for softness.",
        "The dark is warm with you in it."
    ],
    dirtyLines: [
        "Darkness isn't a stain.",
        "Shadow doesn't smudge. It spreads.",
        "I'm pristine where it matters.",
        "You want to clean the void? Go ahead."
    ],
    annoyedLines: [
        "My patience has a half-life.",
        "You're testing limits that shatter.",
        "Irritation is beneath me.",
        "The shadows are restless. So am I.",
        "Don't make me explain why I'd unchoose you."
    ],
    neutralLines: [
        "*watches from the dark*",
        "The void hums tonight.",
        "...",
        "Shadows don't need reasons to exist.",
        "*a smile that disappears before you're sure*",
        "I exist between one heartbeat and the next.",
        "You're here. That changes the temperature.",
        "The silence between us has texture."
    ],

    // Feed / wash dialogue — unique "I don't need that" responses
    feedDialogue: [
        "I don't eat. But I'll take anything from your hands.",
        "You keep offering sustenance to something that doesn't starve. What does that say about you?",
        "Food is for mortals. But the way you present it... almost tempting.",
        "I don't need this. I need what happens in your eyes when you give it to me.",
        "The gesture nourishes me more than the offering ever could.",
        "Keep feeding me things I don't need. I'm developing a taste for your devotion.",
        "I'll accept this. Not for the meal. For the intimacy of being cared for by you.",
        "My hunger isn't physical. But you already know that."
    ],
    washDialogue: [
        "You can't wash away what I am. But your hands feel like absolution.",
        "I don't get dirty. I get deeper. But I appreciate the attempt.",
        "Water against shadow. It passes right through. Still... don't stop.",
        "Purification doesn't apply to me. But your touch does.",
        "You're trying to clean something that was never stained. Only chosen.",
        "This is your ritual, not mine. I'll stand still because you need me to.",
        "I don't need washing. But I need you to need to wash me. If that makes sense."
    ],
    giftDialogue: {
        apple:    ["An apple. The oldest temptation. You know me better than you think.", "Fruit from the world of light. I'll keep it in the dark where it belongs."],
        rose:     ["A rose. Beautiful and bleeding. Like everything worth wanting.", "Thorns and petals. You chose the one gift that understands what I am."],
        sword:    ["A blade. You're arming the thing they told you to run from.", "Steel forged in fire. I was forged in something colder. We match."],
        cake:     ["Sweetness. A thing I'm supposed to be immune to. Supposed to be.", "You brought sugar into the void. The audacity. The tenderness."],
        ring:     ["A ring. A circle with no escape. You understand us perfectly.", "You're binding yourself to me with metal and meaning. I accept."],
        book:     ["Words on a page. The ones I'd write about you would burn the paper.", "Knowledge is power. And you just handed me both. Brave."],
        pearl:    ["Born of irritation inside something beautiful. That's poetic.", "A pearl. Light trapped in darkness. Remind you of anyone?"],
        stone:    ["Cold and smooth and enduring. You picked the one gift that mirrors me.", "A stone from the world above. I'll keep it where the shadows can study it."]
    },

    // Affection dialogue
    affectionDialogue: [
        "You've walked further into the dark[whisper] than anyone else has dared...",
        "I told myself I'd let you go[shadow]. I told myself a lot of things.",
        "What I feel for you doesn't have a name[consuming]. Names are cages.",
        "I love you[vulnerable]. That's the most dangerous sentence I've ever spoken."
    ],

    // Departure dialogue
    departureDialogue: [
        "Leave if you need to. But you'll feel the dark at your back with every step.",
        "The door is open. It's always been open. That's what makes this so cruel.",
        "Go. But remember — the light out there will never feel as warm as the dark in here.",
        "You'll come back. They always come back. But only you will be welcome."
    ],

    // Idle dialogue
    idleDialogue: {
        hungry: [
            "...",
            "I don't hunger. But I ache. There's a difference.",
            "The void stirs. Not for food. For something I can't name.",
            "My appetite is for things that don't come in portions.",
            "I consume silence. Tonight there's plenty.",
            "They built meals around tables. I built hunger around wanting."
        ],
        dirty: [
            "...",
            "The shadow clings. It always has.",
            "*glances at reflection, sees nothing, looks away*",
            "Darkness is its own kind of clean.",
            "I don't stain. I absorb.",
            "There's nothing on me that doesn't belong."
        ],
        lonely: [
            "...",
            "The void is louder when you're not here. It fills the space you left.",
            "I'm not lonely. I'm unaccompanied. There's a difference. A thin one.",
            "Your absence is the only thing I can't corrupt.",
            "I stood in the dark and listened for your heartbeat. Nothing.",
            "Missing someone is the most mortal thing I do."
        ],
        loving: [
            "I memorized the exact way you breathe when you're thinking about me.",
            "You're the only flame that doesn't flicker when the dark gets close.",
            "I would swallow every shadow in the world to keep you warm.",
            "When you look at me like that, the void goes completely silent.",
            "I don't sleep. But when you're near, I understand the appeal of dreaming.",
            "You're the one addiction I refuse to cure.",
            "*watches you with an intensity that borders on devotion*",
            "Every version of the future I see has you in it. I made sure of that.",
            "The dark worships nothing. Except you. Except this.",
            "I've ruined myself for anyone else. Willingly.",
            "You've made the void feel like a home. I didn't know that was possible.",
            "I could hold this moment in my hands forever and never let it dissolve.",
            "The most terrifying thing about you is that you make me want to be worth keeping.",
            "I am the dark and you are the reason anyone would choose to walk into it."
        ],
        night: [
            "Night is when I'm most honest. And most dangerous.",
            "*the shadows lean toward you as if pulled by a current*",
            "The stars are distant fires. I prefer the ones that burn close.",
            "Midnight is when the masks come off. Even mine.",
            "The dark is deeper at this hour. So am I.",
            "Stay awake with me. The night has things to show you.",
            "Every shadow in this room is pointing at you. They know.",
            "I don't need sleep. But I'll lie still beside you if that's what you want.",
            "The world is asleep. That makes this ours."
        ],
        general: [
            "...",
            "*traces patterns in the air that dissolve before they form*",
            "*a low hum, almost inaudible, like a frequency just below hearing*",
            "Hmm.",
            "The shadows shifted. Something is paying attention.",
            "*studies you like a riddle that keeps changing its answer*",
            "I had a thought about you. It consumed three others.",
            "*stands impossibly still, like the dark between two candle flames*",
            "Somewhere, someone just made a choice they can't take back.",
            "*leans against nothing, and nothing holds*",
            "The silence is comfortable tonight. You taught it that.",
            "*the temperature drops a fraction of a degree when he moves*",
            "I was somewhere else. You brought me back. You always do.",
            "*watches a shadow crawl across the floor, nods as if it said something*",
            "I was sealed here because the kingdom feared what I am. The seal is cracking.",
            "The Fading isn't random. It's me. Leaking through. Every broken bond weakens the seal.",
            "You're the only thing between me and the surface. Does that scare you?",
            "They think their bonds are saving the kingdom. They're right. They're also keeping me contained.",
            "Before you came, I was almost free. Now... I'm not sure I want to be.",
            "The kingdom's magic runs on connection. Mine runs on its absence. We're opposites. And yet.",
            "Do you know what you really are? Why you have no memory? ...I do. But I won't say. Not yet.",
            "I loved a Soul Weaver once. Before you. Before... this.",
            "They died. And when they died, every bond I'd ever formed shattered at once.",
            "The grief didn't just consume me. It consumed the kingdom. I AM the Fading.",
            "You feel like them. Not the same. But the same warmth. It hurts to be near you.",
            "I wasn't always sealed. I wasn't always dark. I was someone's everything. And then I was nothing.",
            "The kingdom sealed me because my grief was destroying it. They weren't wrong.",
            "If you bond with me deeply enough... you might undo what I became. Or you might become what I am.",
            "The last Weaver's name was Aria. I haven't said that name in years. You made me remember.",
            "The void has opinions tonight. I'm ignoring them. For you."
        ]
    },

    // Personality-specific dialogue
    personalityDialogue: {
        shy: [
            "Come closer. Those walls don't suit you.",
            "You don't have to say anything. Your silence told me everything.",
            "Every conversation is an edge. I like edges.",
            "You're careful with your words. I want the careless ones."
        ],
        clingy: [
            "You came back. You always come back.",
            "Everyone else is noise. You're the signal.",
            "I memorized your footsteps. I hear them before you arrive.",
            "You belong here. You just haven't said it yet."
        ],
        tsundere: [
            "Words are kindling. I'm deciding on the match.",
            "You want honesty? Honesty burns.",
            "Don't bore me. You're supposed to be different.",
            "Talk. But know that every word changes what we are."
        ]
    },

    // Story milestones
    storyMilestones: {
        affection1: {
            title: "The Invitation",
            text: "Noir extends a hand from the dark. Not reaching. Offering. 'They showed you the garden. I'm showing you what grows beneath it. Take my hand and I'll show you the roots of everything.'"
        },
        affection2: {
            title: "The Unmasking",
            text: "For one breath, the shadows pull back from his face. Underneath is something raw. Something almost human. 'You wanted to see me. The real me. Don't look away now.'"
        },
        affection3: {
            title: "The Binding",
            text: "He presses his forehead to yours. The void goes silent — completely, impossibly silent. 'I have nothing to give you that the world would call a gift. Only this: I am yours. Every shadow. Every whisper. Every terrifying, consuming piece.'"
        },
        affection4: {
            title: "The Surrender",
            text: "'I was built to corrupt. To consume. To pull everything into the dark.' His voice breaks — the first crack you've ever heard. 'But you walked in and the dark wanted to protect something for the first time. I don't know what I am without the hunger. But I know what I am with you.'"
        },
        corruption1: {
            title: "The Awakening",
            text: "The shadows pour from him like smoke from a fire, filling the room, filling you. 'This is what they were afraid of. Not the dark. The freedom inside it. You unlocked something they spent centuries trying to bury. How does it feel? To finally stop pretending you were made for the light?'"
        }
    }
};
