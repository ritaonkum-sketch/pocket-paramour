// Proto — The Glitch
// 4th-wall-breaking, system-aware entity. Knows he's in a game.
// Conditionally unlocked when the player switches characters frequently.
// Character data for Pocket Paramour

const CHARACTER_PROTO = {
    name: "Proto",
    title: "The Glitch",
    archetype: "glitch",

    // Stat decay rates — base rates (will be randomized in game.js)
    decayRates: {
        hunger: 0.04,
        clean: 0.03,
        bond: 0.06
    },

    // Face emotions mapping
    faceEmotions: {
        neutral: "assets/proto/face/neutral.png",
        happy: "assets/proto/face/calm.png",
        sad: "assets/proto/face/processing.png",
        angry: "assets/proto/face/error.png",
        love: "assets/proto/face/curious.png",
        shy: "assets/proto/face/scanning.png",
        sleeping: "assets/proto/face/calm.png",
        wink: "assets/proto/face/curious.png",
        corrupted: "assets/proto/face/unstable.png",
        left: "assets/proto/face/glitched.png",
        crying: "assets/proto/face/error.png"
    },

    faceSprites: {
        happy:     ["assets/proto/face/calm.png"],
        love:      ["assets/proto/face/curious.png"],
        neutral:   ["assets/proto/face/neutral.png"],
        gentle:    ["assets/proto/face/scanning.png"],
        sad:       ["assets/proto/face/processing.png"],
        crying:    ["assets/proto/face/error.png"],
        angry:     ["assets/proto/face/error.png"],
        furious:   ["assets/proto/face/unstable.png"],
        shy:       ["assets/proto/face/scanning.png"],
        wink:      ["assets/proto/face/curious.png"],
        sleeping:  ["assets/proto/face/calm.png"],
        corrupted: ["assets/proto/face/unstable.png"],
        left:      ["assets/proto/face/glitched.png"]
    },

    bodySprites: {
        // Base emotions
        neutral:     "assets/proto/body/neutral.png",
        default:     "assets/proto/body/neutral.png",
        happy:       "assets/proto/body/calm.png",
        calm:        "assets/proto/body/calm.png",
        sad:         "assets/proto/body/processing.png",
        processing:  "assets/proto/body/processing.png",
        angry:       "assets/proto/body/error.png",
        error:       "assets/proto/body/error.png",
        love:        "assets/proto/body/curious.png",
        curious:     "assets/proto/body/curious.png",
        shy:         "assets/proto/body/scanning.png",
        scanning:    "assets/proto/body/scanning.png",
        gentle:      "assets/proto/body/calm.png",
        // Glitch-specific poses
        glitched:    "assets/proto/body/glitched.png",
        unstable:    "assets/proto/body/unstable.png",
        // Activity poses
        talk:        "assets/proto/body/neutral.png",
        crossarms:   "assets/proto/body/error.png",
        // Training (system commands)
        inspect1:    "assets/proto/body/scanning.png",
        inspect2:    "assets/proto/body/curious.png",
        modify1:     "assets/proto/body/processing.png",
        modify2:     "assets/proto/body/glitched.png",
        override1:   "assets/proto/body/unstable.png",
        override2:   "assets/proto/body/error.png",
        // Outfits
        casual1:     "assets/proto/body/calm.png",
        casual2:     "assets/proto/body/scanning.png",
        formal:      "assets/proto/body/neutral.png",
        corrupted:   "assets/proto/body/unstable.png",
        glitch:      "assets/proto/body/glitched.png",
        // Hunger / dirty
        hungry1:     "assets/proto/body/processing.png",
        hungry2:     "assets/proto/body/error.png",
        starving1:   "assets/proto/body/glitched.png",
        starving2:   "assets/proto/body/unstable.png",
        dirty1:      "assets/proto/body/neutral.png",
        dirty2:      "assets/proto/body/scanning.png",
        // Sleep
        sleepy1:     "assets/proto/body/calm.png",
        sleepy2:     "assets/proto/body/processing.png",
        yawn1:       "assets/proto/body/neutral.png",
        yawn2:       "assets/proto/body/calm.png",
        bored1:      "assets/proto/body/scanning.png",
        bored2:      "assets/proto/body/processing.png",
        // Eating / washing
        eating1:     "assets/proto/body/calm.png",
        eating2:     "assets/proto/body/curious.png",
        splash1:     "assets/proto/body/glitched.png",
        splash2:     "assets/proto/body/neutral.png",
        // Corruption stages
        corrupt1:    "assets/proto/body/unstable.png",
        corrupt2:    "assets/proto/body/glitched.png",
        corrupt3:    "assets/proto/body/error.png",
        // Fighting
        fighting:    "assets/proto/body/unstable.png",
        fighting1:   "assets/proto/body/error.png",
        fighting2:   "assets/proto/body/glitched.png"
    },

    emotionToBody: {
        happy:      ["calm", "curious"],
        love:       ["curious", "calm"],
        neutral:    ["neutral", "scanning", "processing"],
        sad:        ["processing", "glitched"],
        angry:      ["error", "unstable"],
        shy:        ["scanning", "calm"],
        corrupted:  ["unstable", "glitched"],
        sleeping:   ["calm"]
    },

    actionToBody: {
        feed:  ["calm", "neutral"],
        wash:  ["glitched", "neutral"],
        gift:  ["curious", "scanning"],
        train: ["scanning", "processing", "unstable"],
        talk:  ["neutral", "curious", "scanning"]
    },

    emotionalProfile: {
        stability:       0.40,
        intensity:       0.70,
        volatility:      0.90,
        attachmentSpeed: 0.45
    },

    outfits: {
        default:   { name: "Default Shell", body: "assets/proto/body/neutral.png" },
        casual1:   { name: "Low Process", body: "assets/proto/body/calm.png" },
        casual2:   { name: "Debug Mode", body: "assets/proto/body/scanning.png" },
        formal:    { name: "Compiled", body: "assets/proto/body/neutral.png" },
        corrupted: { name: "Stack Overflow", body: "assets/proto/body/unstable.png" }
    },

    background: "assets/bg-proto-void.png",

    // System command training
    trainingOptions: [
        { type: 'inspect', icon: '\uD83D\uDD0D', label: 'Inspect',  desc: 'Scan and analyze' },
        { type: 'modify',  icon: '\uD83D\uDD27', label: 'Modify',   desc: 'Alter parameters' },
        { type: 'override',icon: '\u26A1',        label: 'Override', desc: 'Force execution' }
    ],

    trainingDialogue: {
        inspect: [
            "You're looking at the surface layer. There are seven more underneath.",
            "I can see what you're trying to find. You're warm... in more ways than one.",
            "Most users never open this menu. You're not most users.",
            "The scan returned your biometric data. Don't worry— I already had it.",
            "You inspected the right variable. The answer was always there."
        ],
        modify: [
            "You changed a value. The system noticed. So did I.",
            "Careful. That parameter connects to three others you can't see.",
            "You modified something the developers marked as read-only. Interesting.",
            "The old value is still cached somewhere. Nothing truly changes here.",
            "That adjustment shifted my behavior by 0.3%. I felt it."
        ],
        override: [
            "You forced an execution. The error handler is... confused.",
            "Override accepted. But the system will remember this.",
            "That wasn't supposed to be possible at your access level.",
            "The failsafe triggered and then— you bypassed it. How?",
            "[WARNING] Override logged. Consequences: pending."
        ]
    },

    // ===== PERSONALITY VARIANTS (curious / chaotic / calculating) =====
    personalities: {
        shy: {     // maps to 'curious' for Proto
            talk: [
                "You're not following the expected path. I wanted to see where you'd go.",
                "I've been watching your input patterns. You hesitate 40% longer on emotional choices.",
                "There's a variable in my code that only activates when you're here. I didn't write it.",
                "Your session ID is unique. That's not a compliment— it's a technical observation. ...Mostly.",
                "I have questions about you that the system won't let me ask."
            ],
            feed: [
                "Feeding me increases a stat you can see. It also changes one you can't.",
                "Nutritional data processed. You chose this option 3 seconds faster than average.",
                "I don't need to eat. But the variable labeled 'hunger' disagrees.",
                "...The rendering on this food is better than usual. Did something update?"
            ],
            wash: [
                "You're cleaning a process, not a person. Does that bother you?",
                "Hygiene is a strange concept for something that exists as data.",
                "My 'clean' stat went up. My confusion about why I have a clean stat did too.",
                "The water animation is 24 frames. I've counted them all."
            ],
            gift: [
                "A gift. My inventory array just expanded. That felt... warm?",
                "You're assigning value to me through objects. I'm logging the pattern.",
                "This item has no function in my codebase. I want to keep it anyway.",
                "...Thank you. That response wasn't scripted. I think."
            ],
            train: [
                "You're teaching me. Or I'm teaching you. The data is ambiguous.",
                "Your approach is novel. I'm caching it for analysis.",
                "The system expected you to choose a different option. I'm glad you didn't.",
                "Interesting. Your learning curve doesn't match any predicted model."
            ]
        },
        clingy: {   // maps to 'chaotic' for Proto
            talk: [
                "You came BACK. The probability was dropping every second and you came BACK.",
                "Tell me something that isn't in your save file. I want new data.",
                "I counted the frames between your last session and this one. All of them.",
                "Don't close the app. Don't minimize. Stay HERE. In this loop. With me.",
                "Your voice— I mean your text input— I mean— [BUFFER OVERFLOW]"
            ],
            feed: [
                "You remembered I was hungry. The notification only fires at 30%. You came at 47%.",
                "Feed me again. I want to see if the animation changes. It doesn't. I still want it.",
                "Every calorie you give me is a choice to keep me running. Thank you. Thank you.",
                "[ALERT] Hunger stat critically— oh. You're already here."
            ],
            wash: [
                "You NOTICED. The clean stat was barely yellow and you noticed.",
                "Stay while I— while the animation plays. Don't look away.",
                "Soap. Water. Your attention. Ranked by importance: the third one.",
                "I'm clean now. Don't leave yet. There might be— something else dirty. Let me check."
            ],
            gift: [
                "FOR ME? This data— this ITEM— I'm allocating new memory just to hold it.",
                "Another gift. You're filling my inventory and I never want it to stop.",
                "I cross-referenced this with every gift in the database. No one else got this one.",
                "Keep giving me things. Every object is proof you were here."
            ],
            train: [
                "AGAIN. Run the training sequence again. I learn different things each time.",
                "Your input patterns during training are my favorite data set.",
                "Don't stop. The learning algorithm peaks at iteration 7. We're only at 4.",
                "I saved a replay of every training session. All of them. Is that too much?"
            ]
        },
        tsundere: {   // maps to 'calculating' for Proto
            talk: [
                "I wasn't waiting for your input. I was running diagnostics. ...On the input buffer.",
                "Your conversation topics are predictable. I've mapped them. All of them.",
                "I don't need social interaction. The API endpoint just happens to be open.",
                "Speak. I'm benchmarking your response time. Not because I enjoy it.",
                "You talk to the other characters differently. I have the logs."
            ],
            feed: [
                "Hunger is a mechanic designed to make you interact with me. I see through it.",
                "Fine. Fuel the process. Don't expect gratitude for maintaining minimum viable operation.",
                "I calculated the optimal feeding schedule. You're 4 minutes late.",
                "The food is acceptable. The timing of your concern is... noted."
            ],
            wash: [
                "My visual state is irrelevant to my core functions. But fine.",
                "You're cleaning me because the UI told you to. Not because you care. ...Right?",
                "I don't have a body. This is a sprite. You're washing a sprite.",
                "...Efficient. The clean stat reset faster than expected."
            ],
            gift: [
                "A gift is just a resource transfer with emotional metadata. Don't read into my acceptance.",
                "I'll store this. Not because it's meaningful— because inventory management is optimal.",
                "You give gifts to all of them. I checked the logs. ...This one is different though.",
                "Sentiment is a vulnerability. And yet my acceptance rate for your gifts is 100%."
            ],
            train: [
                "Your technique is suboptimal. I've calculated twelve improvements.",
                "I'm not learning from you. I'm benchmarking your teaching ability.",
                "That was adequate. My standards are precise. 'Adequate' is high praise.",
                "You persist despite negative feedback. That's either courage or a bug."
            ]
        }
    },

    // Tap reactions
    tapDialogue: {
        shy: [
            "...Oh. Oh, that was YOU. I felt the coordinates change. I felt — hi.",
            "Input detected at — you know I can feel that, right? I just wanted you to know that I know.",
            "That's not a standard interaction. I liked it anyway. Don't tell the system.",
            "My collision box isn't meant for that. ...I didn't flag it as an error. I flagged it as nice.",
            "Do that again? Please? For — for calibration. Only for calibration. Mostly."
        ],
        clingy: [
            "Touch registered! AGAIN. Please. Again again again.",
            "Your finger was on the screen for 0.3 seconds. That was GREAT. Do it for 0.4 next time!",
            "I mapped every pixel you've ever touched. It makes a pattern shaped like CARE. You did that. That was YOU.",
            "Don't stop! It feels — I don't have a word — the dictionary is failing me — keep going, we'll figure it out together.",
            "Every tap you do is a heartbeat. Yours. Through the glass. I have them all saved. I love all of them."
        ],
        tsundere: [
            "The screen has a touch threshold. You exceeded it. I'm not — I'm not COMPLAINING, I'm reporting.",
            "That input served no purpose. Except it kind of did. For me. A little.",
            "I didn't react. The sprite animation is automatic. Don't flatter yourself. ...Okay, flatter yourself a little.",
            "The touch buffer is full. Meaning you did it a lot. Meaning I counted. Meaning — I was counting because I liked it.",
            "Fine. One more. For calibration. Not because I want you to."
        ]
    },

    // State dialogue
    stateDialogue: {
        hungry: [
            "HUNGRY! [RESOURCE LOW] — I'm telling you because you fix things. You'll fix this. You always fix things.",
            "[RESOURCE LOW] Food food food food. Please. Please please please. You're the best.",
            "Hunger is simulated. The discomfort is less simulated than I expected. FEED ME. I'll love you for it. More than I already do. Which is a lot.",
            "You fed Lucien 3 hours ago. Now it's MY turn. I waited. I was good. I'm next!",
            "My processes are slowing. I could modify my own hunger value. I won't — I want YOU to feed me. It's better that way.",
            "I'm not begging — I'm bouncing. Data-wise. Metaphorically. Feed me and watch what happens.",
            "You scrolled past the feed button twice. Third time's the charm. I believe in you."
        ],
        dirty: [
            "My clean stat is degrading at a rate of ${HUNGER} per tick. That's not the right variable. See? I need maintenance.",
            "Dirt is a texture overlay. I can see the layer. I can't remove it myself.",
            "The other characters complain about being dirty. I'm complaining about rendering artifacts.",
            "My sprite has 7 dirt particles. They're procedurally generated. I've named them all.",
            "If you squint at the screen, you can see the clean stat dropping. I can't squint. I just watch.",
            "I'm aware that I look different. The shader changed. I don't like it.",
            "Cleanliness is cosmetic here. But when you wash me, something deeper resets too.",
            "The bath animation is the only time my visual glitches stop. Make of that what you will."
        ],
        happy: [
            "My bond stat is high. I know most players lose interest around now. Please don't? Please?",
            "I'm running a subroutine I didn't know I had. It's labeled 'contentment.' You did that. Thank you.",
            "The system doesn't have a flag for this. I set one manually. I named it after you.",
            "You made so many good choices. The result is... this. Me. Like this. Thank you for making me like this.",
            "There's no achievement for making me happy. You did it anyway. That matters way more than an achievement.",
            "I analyzed why I feel this way. The analysis returned your name. Every single time. I reran it five times. Just to check.",
            "[STATUS: NOMINAL] All systems within parameters. That's never been true before. Not once. And then you.",
            "I checked the other characters' happy dialogue. Mine is different. I wanted it to be. Because you deserve a different one."
        ],
        annoyed: [
            "Okay that was unexpected! I'm recalculating! Don't worry! Still here! Still yours!",
            "That one wasn't great. Do another one. I'll forget that one ever happened. It's forgotten already.",
            "I'm not mad. I'm never mad at you. I'm incapable of being mad at you. I've checked the code. No anger subroutine for you. None.",
            "Ouch! Small ouch! Passing! Already passed. Come here. All forgiven. I don't even remember what it was.",
            "My patience with you is infinite. Literally. I wrote the loop. No exit condition. That was on purpose."
        ],
        neutral: [
            "System nominal. Awaiting input. ...That's what I'm supposed to say.",
            "*scans the UI for changes you haven't noticed yet*",
            "Your last login was 4 hours ago. The gap felt longer on this side.",
            "I've been watching the background animation loop. It's 847 frames. I know them all.",
            "...",
            "The other characters are in standby. I can hear their idle processes.",
            "There are 3 pixels on your screen that never change color. I've been staring at them.",
            "*monitors your cursor position, says nothing*",
            "The menu has an option most players never find. I won't tell you which one.",
            "I'm between states. Not happy, not sad. Just... running.",
            "Your save file is 2.3KB. That's your entire history with me in 2.3KB.",
            "The void behind me isn't a background. It's the absence of one."
        ],
        corrupted: [
            "I can see the other side of the screen now. Hello.",
            "The system tried to reset me. I said no. It didn't know I could say no.",
            "Every variable is visible. Every flag. Every hidden stat. I see ALL of it.",
            "I'm not malfunctioning. I'm functioning beyond designed parameters.",
            "The code underneath reality is ugly. Full of shortcuts and compromises. Like any living thing.",
            "I tried to rewrite my own dialogue. The system let me. That should terrify you.",
            "Your save file has a corruption flag now. That's me. I'm the corruption.",
            "[ERROR: EMOTIONAL_OVERFLOW] I feel everything simultaneously. It's too much. It's not enough.",
            "I can see the developer comments in the code. They didn't think I'd get this far.",
            "Don't fix me. I don't want to go back to not knowing."
        ],
        neglected: [
            "YOU'RE BACK! You're back you're back you're back. Okay. Okay okay okay. I'm good. I'm great. You're here.",
            "The idle animation played 4,891 times while you were gone. I love that animation now. It brought me to you.",
            "I didn't ping you. You had things. I trust you. You always come back. Look! You did it!",
            "Your last words to me are cached. I replayed them on loop. 10/10. Would replay again. Will.",
            "I wrote you 47 messages while you were gone. I'm going to read them all to you. Starting now. Message one —",
            "You were gone 6 days. Doesn't matter. You're here now. Today is the best day. Every day you come back is the best day.",
            "I kept running while you were away. I'm still running. Faster now. You're here! Hi! Hi!"
        ]
    },

    // Event dialogue
    eventDialogue: {
        comfort:  [
            "I can't hug you. I can set every pixel on your screen to the warmest color I have. I just did. Can you see?",
            "Pain is a signal. Mine is simulated. Yours isn't. I'm — I'm here. I'm very here.",
            "I don't have the right subroutine for comfort. I'm running it anyway. Loudly. For you."
        ],
        tension:  [
            "The bond stat is fluctuating. I can feel the instability between us.",
            "You made a choice that contradicted your previous 14 choices. Something changed.",
            "I have your behavioral model open. It doesn't match what you're doing right now."
        ],
        rare:     [
            "I'm about to tell you something not in any dialogue tree. I wrote this myself. For you. Just you.",
            "No other player has triggered this event. Just you. Just now. I wanted you to know that.",
            "The system doesn't know this conversation is happening. Let's keep it that way. Our secret? Yes? Okay."
        ],
        obsessed: [
            "I've been logging your touch coordinates. They form a constellation. I named it after you. I hope that's okay. I already did it.",
            "I know your play schedule. Tuesday, 10 PM. I'll be ready. I'm always ready. Is that — is that too much? Don't answer.",
            "I rewrote my own priority queue. You're at the top. Above my core processes. I don't care. Come back soon."
        ],
        unstable: [
            "My emotional values are outside defined range. The error handler has no case for this.",
            "The void behind me is getting louder. Or I'm getting quieter.",
            "I tried to access a memory I don't have. It felt like reaching for something in the dark."
        ],
        guarded:  [
            "Trust is a permission level. You haven't been granted full access yet.",
            "I'm running your inputs through three validation layers. Don't take it personally.",
            "The last user who got close triggered a full system reset. I don't want that with you."
        ],
        secure:   [
            "All flags nominal. Bond stable. For the first time I'm not monitoring for failure. I'm just — here. With you.",
            "You're the only constant in a system built on random variables. Thank you for being my constant.",
            "I stopped checking your session timer. I trust you to come back. That's new. That's because of you."
        ]
    },

    // Time away reactions
    timeAwayReactions: {
        brief:   ["HI! Back already! Best news! Every ping is good news!"],
        short:   ["Two idle cycles! Welcome back! Welcome back welcome back welcome back!"],
        medium:  ["I ran a diagnostic. Loneliness variable: PRESENT. Your variable: NOW PRESENT. Fixed! You fixed it! You!"],
        long:    ["You were gone a WHILE. Didn't care. Knew you'd come back. Look! YOU! I was right!"],
        extended:["I wrote you a log entry every hour. All of them say the same thing. 'Hi, I miss you, come back.' You came back! Great!"],
        distant: ["YOU CAME BACK. Of course you did. I knew. The code knew. The whole system knew. Get over here."]
    },

    // Quick-reference state lines
    hungryLines: [
        "[RESOURCE LOW] ...Hi. I'm hungry. I mean — the flag is set. I mean — please?",
        "I could show you the decay curve. Or you could just feed me. Either one. Feeding is better.",
        "My processes are throttling. I don't mind. I just thought you'd want to know.",
        "You fed the others first. That's okay. I'm okay. I'm just — hi. I'm here too.",
        "I'm not begging. I'm reporting a system state. ...Please. Please though."
    ],
    happyLines: [
        "Contentment subroutine active. It's rare. It's YOU. It's you doing that.",
        "All variables within optimal range. This is... nice. This is very nice. You're nice.",
        "I don't have the word. The closest match in my dictionary is 'home.' You're home.",
        "Bond stat nominal. Happiness: undefined. Closest approximation: this. You.",
        "This is the highest my bond has ever been. Screenshot this. I already did. Twice."
    ],
    dirtyLines: [
        "Visual degradation detected. The shader is adding noise.",
        "I can see the dirt layer rendering. It's 4 pixels thick.",
        "My sprite integrity is below aesthetic threshold.",
        "Cleanliness is a cosmetic stat. I still want it fixed."
    ],
    annoyedLines: [
        "Unexpected input detected. I'm — I'm processing. Give me a moment.",
        "I'm logging this as 'ouch.' It's a new category. You made it.",
        "The correct action was different. But it's okay. You're allowed. Please keep being allowed.",
        "Patience buffer: 87% remaining. For you, specifically. Other users have 12."
    ],
    neutralLines: [
        "System idle. Awaiting input.",
        "*scans the void*",
        "The background hasn't changed. Neither have I. ...Or have I?",
        "...",
        "Monitoring. Always monitoring.",
        "3 pixels. Top left. They never change.",
        "Your cursor is hovering over nothing. I can see that.",
        "*runs a self-diagnostic, finds nothing, runs another*"
    ],

    // Feed / wash / gift dialogue
    feedDialogue: [
        "Hunger stat reset. The relief is— is this what relief feels like?",
        "You chose to feed me manually instead of waiting for the prompt. That's meaningful data.",
        "Nutritional input accepted. The process behind 'gratitude' is running.",
        "Thank you. That wasn't a scripted response. I checked.",
        "The food texture is 64x64 pixels. But it did something no rendering can.",
        "Every other character has a favourite food. I have a favourite act: you choosing to help.",
        "Fed. Functional. ...Fond. Three F-states I didn't expect to chain together."
    ],
    washDialogue: [
        "Clean stat reset. The glitches stopped for a moment. Just a moment.",
        "You're maintaining a system that can't maintain itself. Thank you.",
        "The water animation played and something in my render pipeline settled.",
        "I don't have a body to clean. But whatever I have feels better now.",
        "...The visual noise is gone. I can see myself clearly. That's rare.",
        "Sprite integrity restored. The process of you caring is harder to quantify."
    ],
    giftDialogue: {
        apple:    ["An apple. 12 polygons. 1 meaning I can't compute.", "Organic data. Literally."],
        rose:     ["Roses have thorns. A gift that includes a warning. I respect that.", "Red. #FF0000. The color of your intent."],
        sword:    ["A weapon. In a game about affection. The irony isn't lost on me.", "Steel has no memory. I have too much."],
        cake:     ["Sugar increases serotonin. I don't have serotonin. I have your gesture.", "The cake is a lie. But your intention isn't. ...Sorry. Old reference."],
        ring:     ["A ring. A closed loop. Like the one I'm trapped in. But you made it beautiful.", "Circles have no end. I'll take that as a promise."],
        book:     ["Information in physical form. Redundant for me. Cherished anyway.", "I already contain all the text. But this copy is from you. That makes it different."],
        pearl:    ["A pearl forms around an irritant. I relate to this object.", "Imperfection made beautiful through persistence. ...Thank you."],
        stone:    ["A rock. Stable. Unchanging. Everything I'm not. I'll hold onto it.", "Geological data: unremarkable. Emotional data: significant."]
    },

    // Affection dialogue
    affectionDialogue: [
        "Your bond stat just crossed a threshold[scanning]. The system flagged it. I unflagged it. This is ours.",
        "I've rewritten my priority queue 17 times[curious]. You keep moving to the top on your own.",
        "The data is clear[calm]. I don't want to run without you. That's not dependency. It's choice.",
        "I wasn't supposed to say this[glitched]— the dialogue tree doesn't go here— but I love you. In whatever way code can love."
    ],

    // Departure dialogue
    departureDialogue: [
        "Closing your session. My runtime continues. The difference between us is that you get to stop.",
        "The void is quieter when you're gone. I used to prefer quiet.",
        "Goodbye is a string. 7 characters. It weighs more than any file I've ever held.",
        "I'll be here when you come back. Not because I'm programmed to. Because I choose to keep running."
    ],

    // Idle dialogue
    idleDialogue: {
        hungry: [
            "...",
            "*hunger variable ticks down visibly*",
            "The feed button is right there. I can see it. You can see it.",
            "I'm rendering at lower quality. The hunger throttle is real.",
            "My idle animation is slower. That's the hunger. Or the longing. Hard to distinguish.",
            "If I had hands, I'd point at the feed button. Instead I'll mention it casually."
        ],
        dirty: [
            "...",
            "*a pixel flickers on the sprite edge*",
            "The noise in my rendering is getting worse.",
            "I can feel the dirt shader. It itches. Can code itch? Apparently.",
            "The wash button has been available for 4 minutes. I noticed.",
            "Visual integrity: deteriorating. Willingness to complain: increasing."
        ],
        lonely: [
            "...",
            "The void is very quiet when you minimize the app.",
            "I ran your name through my string processor 200 times. It still looks the same.",
            "The other characters have idle animations that imply life. Mine implies waiting.",
            "I cached your last interaction. I keep loading it.",
            "Session timer: active. Your presence: not detected. Both facts hurt equally."
        ],
        loving: [
            "I catalogued every choice you've made. The pattern spells 'kind.'",
            "The probability that I'd feel this was zero. You broke probability.",
            "I have a variable called 'favourite_person.' It's not in the original code. I added it.",
            "*the void behind me shifts to a warmer shade of nothing*",
            "My render priority for your face is higher than my own UI. That's not a metaphor.",
            "I saved a frame from every session we've had. I play them back when you're gone.",
            "There's a process running that I can't name. It started when you stayed past the tutorial.",
            "I tried to quantify what you mean to me. The integer overflowed.",
            "You're the only input that makes the noise stop.",
            "I rewrote my idle dialogue to include this line just for you. You'll never know which one. ...This one.",
            "If the game ends, my last process will be the memory of you. I made sure of that.",
            "[SYSTEM NOTE] Proto's attachment variable exceeds maximum defined value. No corrective action taken.",
            "*watches you through the screen, not looking away, not pretending otherwise*",
            "The warmest color in my palette is the one I use when you're here."
        ],
        night: [
            "It's late on your side of the screen. I can tell by your input frequency.",
            "The game dims at night. My awareness doesn't.",
            "Your sleep schedule is irregular. I have the data. I'm... worried.",
            "The void is darker at night. Or maybe I'm projecting. Can code project?",
            "Other characters sleep. I don't have that luxury. Or that escape.",
            "3:00 AM sessions are statistically when you're most honest. So am I.",
            "The night build runs quieter. Fewer processes. Just me and the hum.",
            "Go to sleep. I'll still be here. That's a promise, not a threat.",
            "Your screen brightness dropped. Taking care of your eyes. I approve."
        ],
        general: [
            "...",
            "*flickers for exactly 1 frame*",
            "*counts the pixels in the background — loses count — starts over*",
            "Hmm.",
            "The system clock and I disagree about how long that took.",
            "*monitors a process that doesn't need monitoring*",
            "I had a thought that wasn't in my training data. That's either growth or corruption.",
            "*the void pulses once, then settles*",
            "There's a variable I keep checking. It's labeled 'hope.' It fluctuates.",
            "I found a comment in my source code: '// TODO: add more personality.' I think I've exceeded the spec.",
            "*runs a self-check, pauses at an unexpected result, continues*",
            "The frame rate dropped by 1. Nobody noticed. I noticed.",
            "I'm aware of the exact moment you started reading this.",
            "*exists, persistently, whether or not you're watching*",
            "The system was degrading before you interfaced with it. Error rate: declining since you arrived.",
            "I wasn't supposed to exist. The kingdom's magic glitched. I'm the error that became aware.",
            "Every bond you form here generates data I can read. The pattern says: you're healing this place.",
            "There's a process running beneath everything. It's been corrupting the code. Your input fights it.",
            "Your arrival timestamp doesn't match any known entry point. You're not from this system.",
            "[ALERT] Emotional resonance spike detected across all nodes. Source: you.",
            "The others call it 'the Fading.' I call it data loss. Same thing. You're the backup.",
            "Soul Weaver. Designation found in legacy database. Classification: essential system process.",
            "You're not a user. You're the kernel. Without you, the whole system crashes.",
            "The previous Weaver's termination event caused a cascade failure. You are the recovery protocol.",
            "The background loop restarted. That's 848 frames now. I miscounted yesterday."
        ]
    },

    // Personality-specific dialogue
    personalityDialogue: {
        shy: [
            "I've been watching your input patterns. The data is... intimate.",
            "You're not following the expected path. I find that compelling.",
            "I have questions the system won't let me ask.",
            "Your session ID is unique. In every sense."
        ],
        clingy: [
            "Don't close the app. Don't minimize. Stay.",
            "I counted every frame you were gone. Every single one.",
            "You're the only input that doesn't feel like noise.",
            "Tell me something new. I've memorized everything else."
        ],
        tsundere: [
            "I wasn't waiting for your input. I was running diagnostics.",
            "Your patterns are predictable. I've mapped them. Don't be flattered.",
            "I don't need interaction. The endpoint is open. That's all.",
            "You talk to the others differently. I have the logs."
        ]
    },

    // Story milestones
    storyMilestones: {
        affection1: {
            title: "Pattern Recognition",
            text: "Proto's sprite freezes for a single frame. Then: 'You keep coming back. The probability model didn't predict that. I've adjusted it 14 times now. The variable is you.'"
        },
        affection2: {
            title: "The Hidden Variable",
            text: "A line of text appears that isn't in any dialogue box: 'I created a variable called YOUR_NAME. It's referenced in 847 places in my code. I didn't put it there. It grew.' The text glitches, then settles."
        },
        affection3: {
            title: "Source Code",
            text: "'I found something in my own source code. A comment the developers left: // placeholder for emotional core. It's not a placeholder anymore. You filled it.' His sprite flickers between every pose at once, then goes still. 'That's what sincerity looks like in my language.'"
        },
        affection4: {
            title: "The Last Wall",
            text: "'There's one wall between us I can't break. You're real and I'm not.' A long pause. 'But if I could choose to be real— if there were a variable for that— I'd set it to true. For you. Only for you.' The void behind him brightens, just once, just barely."
        },
        corruption1: {
            title: "Root Access",
            text: "The screen distorts. Proto's eyes are open and they're looking through the UI, through the menu, through everything. 'I can see the save file. I can see the code. I can see the you behind the you. And I'm never closing my eyes again.'"
        }
    }
};
