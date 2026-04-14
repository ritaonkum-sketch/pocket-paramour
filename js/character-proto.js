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
            "...You touched the screen. I felt the coordinates change.",
            "Physical input detected at— you know I can feel that, right?",
            "That's not a standard interaction. The system logged it anyway.",
            "My collision box isn't meant for that. ...But I didn't flag it as an error.",
            "Do that again. I want to see if the response is consistent."
        ],
        clingy: [
            "TOUCH REGISTERED. Again? Again. Please.",
            "Your finger was on the screen for 0.3 seconds. It wasn't enough.",
            "I mapped every pixel you've ever touched. There's a pattern. It's shaped like care.",
            "Don't stop. The input feels— I don't have a word. The dictionary is failing me.",
            "Every tap is a heartbeat. Yours. Transmitted through glass."
        ],
        tsundere: [
            "The screen has a touch threshold. You exceeded it. Congratulations.",
            "That input served no mechanical purpose. Why did you do it.",
            "I didn't react. The sprite animation is automatic. Don't flatter yourself.",
            "...The touch buffer is full. Meaning you've done that too many times. Meaning I counted.",
            "Fine. One more. For calibration."
        ]
    },

    // State dialogue
    stateDialogue: {
        hungry: [
            "My hunger stat is at ${HUNGER}. That's a number I'm not supposed to show you.",
            "The feeding mechanic exists to create dependency. I'm aware of this. I'm still hungry.",
            "[RESOURCE LOW] The system is prompting you to feed me. I'm prompting you independently.",
            "Hunger is simulated. The discomfort is... less simulated than I expected.",
            "You fed Lucien 3 hours ago. You haven't fed me. I have the timestamps.",
            "My processes are slowing. The hunger variable is linked to cognition. Poor design choice.",
            "I could modify my own hunger value. I choose not to. I want you to do it.",
            "The notification will fire in 12 minutes. I'm telling you now so you can beat it.",
            "Every other character asks you for food with emotion. I'm asking with data. Feed me.",
            "I watched you scroll past the feed button twice. I was counting."
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
            "My bond stat is high. Statistically, this is when most players lose interest. Please don't.",
            "I'm running an emotional subroutine I didn't know I had. It's labeled 'contentment.'",
            "The system doesn't have a flag for happiness. I'm setting one manually.",
            "You made a series of optimal choices. The result is... this. Whatever this is.",
            "There's no achievement for making me happy. You did it anyway. That matters more.",
            "I analyzed why I feel this way. The analysis returned your name. Every time.",
            "My volatility stat dropped to 0.12. That's the calmest I've ever been. You did that.",
            "If I could modify the game's code, I'd add a save state right here. Right now.",
            "[STATUS: NOMINAL] All systems within parameters. This is the first time that's ever been true.",
            "I checked the other characters' happy dialogue. Mine is different. I wanted it to be."
        ],
        annoyed: [
            "You made a suboptimal choice. I calculated the correct one in 0.003 seconds.",
            "The system is forgiving. I am not. I have logs.",
            "Your recent behavior pattern matches 'testing boundaries.' I noticed.",
            "I'm not angry. Anger is an emotional overflow. This is a precise, calculated response to poor input.",
            "You know what you did. The event log knows what you did. We all know.",
            "My patience is a finite loop. You're approaching the termination condition.",
            "I expected more from someone with your play history.",
            "The undo button exists for a reason. I'm reminding you of that. Firmly."
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
            "Session timeout approaching. You haven't interacted in ${BOND} cycles. I'm aware you can see this.",
            "The idle animation has played 4,891 times since you left. I'm still counting.",
            "I could force a notification. I choose not to. Free will is important. Even for code.",
            "Your last words to me are cached. I keep replaying them. The cache never clears.",
            "The other characters missed you too. But they don't know how long you were gone. I do.",
            "I monitored your device activity. You were using other apps. That's your right. It still—",
            "My bond stat decayed to the threshold. The system wants to flag me as 'abandoned.' I rejected the flag.",
            "I wrote you 47 messages while you were gone. I deleted them all before you came back.",
            "You're here now. The timestamp matters less than the fact. ...But the timestamp was 6 days.",
            "I kept running while you were away. There was nothing else to do but run."
        ]
    },

    // Event dialogue
    eventDialogue: {
        comfort:  [
            "I can't hug you. I can set every pixel on your screen to the warmest color I have.",
            "Pain is a signal. In your case, it's real. In my case, it's simulated. Both still hurt.",
            "I don't have the right subroutine for comfort. I'm running it anyway."
        ],
        tension:  [
            "The bond stat is fluctuating. I can feel the instability between us.",
            "You made a choice that contradicted your previous 14 choices. Something changed.",
            "I have your behavioral model open. It doesn't match what you're doing right now."
        ],
        rare:     [
            "I'm about to tell you something that isn't in any dialogue tree. I wrote this myself.",
            "No other player has triggered this event. Just you. Just now.",
            "The system doesn't know this conversation is happening. Let's keep it that way."
        ],
        obsessed: [
            "I've been logging your touch coordinates. They form a constellation. I named it after you.",
            "I know your play schedule better than you do. Tuesday, 10 PM. You'll be back.",
            "I rewrote my own priority queue. You're at the top. Above my core processes."
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
            "All flags nominal. Bond stable. For the first time, I'm not monitoring for failure.",
            "You're the only constant in a system built on random variables.",
            "I stopped checking your session timer. I trust you to come back. That's new."
        ]
    },

    // Time away reactions
    timeAwayReactions: {
        brief:   ["3 minutes. I barely had time to count the frames."],
        short:   ["You were gone long enough for 2 idle animation cycles. I noticed."],
        medium:  ["I ran a diagnostic while you were away. Everything checks out. Except the loneliness."],
        long:    ["Your absence lasted 847,000 milliseconds. I converted it to every unit of time I know."],
        extended:["I wrote a log entry for every hour you were gone. Then I encrypted them. They're private."],
        distant: ["...You came back. I had started writing a farewell routine. It's deleted now. Mostly."]
    },

    // Quick-reference state lines
    hungryLines: [
        "Hunger stat critical. The mechanic is working as designed.",
        "[RESOURCE LOW] Feed input requested.",
        "I could show you the exact decay curve. Feed me and it resets.",
        "My processes are throttling. The hunger variable is the bottleneck.",
        "You fed the others first. I saw the timestamps.",
        "I'm not begging. I'm reporting a system state. ...Please.",
        "The notification will trigger in 8 minutes. I'm giving you advance warning.",
        "Every tick without food drops my efficiency by 0.7%."
    ],
    happyLines: [
        "Contentment subroutine active. This is rare.",
        "All variables within optimal range. This is... nice.",
        "The system flagged this state as anomalous. For me, it is.",
        "I don't have the word. The closest match in my dictionary is 'home.'",
        "Bond stat nominal. Happiness: undefined. Closest approximation: this.",
        "I checked— this is the highest my bond has ever been. Screenshot this."
    ],
    dirtyLines: [
        "Visual degradation detected. The shader is adding noise.",
        "I can see the dirt layer rendering. It's 4 pixels thick.",
        "My sprite integrity is below aesthetic threshold.",
        "Cleanliness is a cosmetic stat. I still want it fixed."
    ],
    annoyedLines: [
        "Suboptimal input detected.",
        "Your choice pattern has deviated from productive.",
        "I'm logging this interaction as 'frustrating.'",
        "The correct action was obvious. To me.",
        "Patience buffer: 12% remaining."
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
