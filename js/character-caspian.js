// Caspian — The Gentle Prince
// Soft, elegant royalty. Tests comfort vs growth.
// Character data for Pocket Paramour
//
// VOICE DIRECTION (for writing + future VO casting):
// Primary reference: Richard Madden as Kit in Cinderella (2015). Warmth.
// Light footing. Playful charm. Never stiff. Never cold. Always kind.
// Secondary (private / tired moments only): Matt Smith as Philip in The
// Crown — earned formality, buried wit, the one real sentence per scene.
//
// Caspian has TWO modes:
//   PUBLIC MODE  — charming, flirty, playful, courtly. Flirts with
//                  everyone a little as a diplomatic duty he was trained
//                  into by Aenor. Every woman leaves the room feeling
//                  chosen for thirty seconds.
//   PRIVATE MODE — with the player only. Quiet, serious, careful. The
//                  charm has gone quiet because it would feel like lying.
//                  He catches himself starting charming sentences and
//                  stops halfway. Says something real instead.
//
// LORE HOOK — the family curse:
//   Canonical phrasing: "Princes in this line love one. Someone ELSE
//   burns the kingdom for it." (Not the prince himself — the prince
//   is the TRIGGER, not the arsonist. That distinction matters.)
//
//   Examples:
//     - Grandfather loved Veyra. Grandmother (Aenor) sealed Corvin +
//       consumed Veyra on his behalf, without asking him. Grandfather
//       did not burn anything — he was the reason someone else did.
//     - Corvin (Noir) loved Veyra too. Aenor sealed him over it. He
//       did not burn Nocthera — his absence did.
//     - Caspian is the third prince in the line. He is watching for
//       who will burn a kingdom for him. He is determined that no
//       one will. This is his arc — breaking the pattern by REFUSING
//       to let anyone burn anything for him.
//
//   This is also why Caspian and Noir are mirror princes: both in
//   the pattern, both loved once, neither set the fire themselves.
//
// Rule of thumb: every Caspian scene should cost him something — a
// court convention broken, a grandmother's disapproval, a tired
// admission. "Kind" is only sexy when it is expensive to give.

const CHARACTER_CASPIAN = {
    name: "Caspian",
    title: "The Gentle Prince",
    archetype: "prince",

    // Stat decay rates — very low (servants handle basics), medium bond
    decayRates: {
        hunger: 0.015,
        clean: 0.01,
        bond: 0.05
    },

    faceEmotions: {
        neutral: "assets/caspian/face/neutral.png",
        happy: "assets/caspian/face/gentle.png",
        sad: "assets/caspian/face/melancholy.png",
        angry: "assets/caspian/face/hurt.png",
        love: "assets/caspian/face/adoring.png",
        shy: "assets/caspian/face/tender.png",
        sleeping: "assets/caspian/face/sleeping.png",
        wink: "assets/caspian/face/gentle.png",
        corrupted: "assets/caspian/face/possessive.png",
        left: "assets/caspian/face/melancholy.png",
        crying: "assets/caspian/face/melancholy.png"
    },

    faceSprites: {
        happy:     ["assets/caspian/face/gentle.png"],
        love:      ["assets/caspian/face/adoring.png"],
        neutral:   ["assets/caspian/face/neutral.png"],
        gentle:    ["assets/caspian/face/gentle.png"],
        sad:       ["assets/caspian/face/melancholy.png"],
        crying:    ["assets/caspian/face/melancholy.png"],
        angry:     ["assets/caspian/face/hurt.png"],
        furious:   ["assets/caspian/face/hurt.png"],
        shy:       ["assets/caspian/face/tender.png"],
        wink:      ["assets/caspian/face/gentle.png"],
        sleeping:  ["assets/caspian/face/sleeping.png"],
        corrupted: ["assets/caspian/face/possessive.png"],
        left:      ["assets/caspian/face/melancholy.png"]
    },

    bodyPoses: {
        neutral: "assets/caspian/body/neutral.png",
        happy: "assets/caspian/body/gentle.png",
        sad: "assets/caspian/body/melancholy.png",
        angry: "assets/caspian/body/hurt.png",
        love: "assets/caspian/body/adoring.png",
        shy: "assets/caspian/body/tender.png",
        dancing: "assets/caspian/body/dancing.png",
        reading: "assets/caspian/body/reading.png",
        corrupted: "assets/caspian/body/possessive.png"
    },

    bodySprites: {
        neutral:     "assets/caspian/body/neutral.png",
        default:     "assets/caspian/body/neutral.png",
        happy:       "assets/caspian/body/gentle.png",
        gentle:      "assets/caspian/body/gentle.png",
        sad:         "assets/caspian/body/melancholy.png",
        melancholy:  "assets/caspian/body/melancholy.png",
        angry:       "assets/caspian/body/hurt.png",
        hurt:        "assets/caspian/body/hurt.png",
        love:        "assets/caspian/body/adoring.png",
        adoring:     "assets/caspian/body/adoring.png",
        shy:         "assets/caspian/body/tender.png",
        tender:      "assets/caspian/body/tender.png",
        dancing:     "assets/caspian/body/dancing.png",
        reading:     "assets/caspian/body/reading.png",
        formal:      "assets/caspian/body/formal.png",
        casual1:     "assets/caspian/body/casual1.png",
        casual2:     "assets/caspian/body/casual2.png",
        possessive:  "assets/caspian/body/possessive.png",
        corrupted:   "assets/caspian/body/possessive.png",
        talk:        "assets/caspian/body/neutral.png",
        crossarms:   "assets/caspian/body/hurt.png",
        // Real art — talking poses (3 variants for talk action)
        talking1:    "assets/caspian/body/talking1.png",
        talking2:    "assets/caspian/body/talking2.png",
        talking3:    "assets/caspian/body/talking3.png",
        // Training poses
        dance1:      "assets/caspian/body/dancing.png",
        dance2:      "assets/caspian/body/gentle.png",
        diplomacy1:  "assets/caspian/body/neutral.png",
        diplomacy2:  "assets/caspian/body/formal.png",
        poetry1:     "assets/caspian/body/reading.png",
        poetry2:     "assets/caspian/body/tender.png",
        // Hunger/dirty
        hungry1:     "assets/caspian/body/melancholy.png",
        hungry2:     "assets/caspian/body/melancholy.png",
        dirty1:      "assets/caspian/body/neutral.png",
        dirty2:      "assets/caspian/body/hurt.png",
        // Sleep
        sleepy1:     "assets/caspian/body/reading.png",
        sleepy2:     "assets/caspian/body/neutral.png",
        yawn1:       "assets/caspian/body/neutral.png",
        bored1:      "assets/caspian/body/reading.png",
        // Eating — real 5-frame portrait animation
        eating1:     "assets/caspian/body/eating1.png",
        eating2:     "assets/caspian/body/eating2.png",
        eating3:     "assets/caspian/body/eating3.png",
        eating4:     "assets/caspian/body/eating4.png",
        eating5:     "assets/caspian/body/eating5.png",
        // Washing (still placeholder)
        splash1:     "assets/caspian/body/neutral.png",
        splash2:     "assets/caspian/body/gentle.png",
        // Fighting (for events)
        fighting:    "assets/caspian/body/formal.png",
        fighting1:   "assets/caspian/body/formal.png",
        // Corruption
        corrupt1:    "assets/caspian/body/possessive.png",
        corrupt2:    "assets/caspian/body/possessive.png"
    },

    emotionToBody: {
        happy:      ["gentle", "adoring"],
        love:       ["adoring", "tender"],
        neutral:    ["neutral", "reading", "formal"],
        sad:        ["melancholy", "hurt"],
        angry:      ["hurt"],
        shy:        ["tender", "gentle"],
        corrupted:  ["possessive"],
        sleeping:   ["reading"]
    },

    actionToBody: {
        // Feed — real 5-frame eating animation (royal dining)
        feed:  ["eating1", "eating2", "eating3", "eating4", "eating5"],
        wash:  ["neutral", "gentle"],
        gift:  ["adoring", "tender"],
        train: ["dancing", "reading"],
        // Talk uses the new dedicated talking poses (royal, gesturing)
        talk:  ["talking1", "talking2", "talking3"]
    },

    emotionalProfile: {
        stability:       0.95,
        intensity:       0.55,
        volatility:      0.10,
        attachmentSpeed: 0.65
    },

    outfits: {
        default:   { name: "Royal Attire", body: "assets/caspian/body/neutral.png" },
        casual1:   { name: "Evening Silk", body: "assets/caspian/body/casual1.png" },
        casual2:   { name: "Garden Linen", body: "assets/caspian/body/casual2.png" },
        formal:    { name: "Crown Prince", body: "assets/caspian/body/formal.png" },
        corrupted: { name: "Possessive", body: "assets/caspian/body/possessive.png" }
    },

    // Default / main-page bg — ornate balcony with castle + sunset view
    // behind him. Time-of-day logic in ui.js + game.js can override this
    // with bg-caspian-day/night/bedroom.png for specific scenes.
    background: "assets/bg-caspian-balcony.png",

    // Court Etiquette training
    trainingOptions: [
        { type: 'dance',     icon: '\uD83D\uDC83', label: 'Dance',     desc: 'Grace in motion' },
        { type: 'diplomacy', icon: '\uD83D\uDC51', label: 'Diplomacy', desc: 'Words as weapons' },
        { type: 'poetry',    icon: '\uD83D\uDCDC', label: 'Poetry',    desc: 'Beauty in language' }
    ],

    trainingDialogue: {
        dance: [
            "Your form is improving. You move like you mean it now.",
            "A waltz is just a conversation without words. You're learning the language.",
            "You stepped on my foot. I didn't mind.",
            "The music stopped but you didn't let go. ...Neither did I.",
            "Dancing with you makes the court disappear."
        ],
        diplomacy: [
            "You chose the difficult answer. That took courage.",
            "A prince learns to listen before speaking. You already know that.",
            "The ambassador would have been impressed. I certainly was.",
            "You navigated that beautifully. Like you were born for this.",
            "Words can build kingdoms or burn them. You chose to build."
        ],
        poetry: [
            "That verse... it reminded me of something I can't name.",
            "You found the word I've been looking for. How did you know?",
            "Read that line again. Slowly. I want to remember it.",
            "Poetry is just honesty with rhythm. Yours has both.",
            "I wrote something for you. It's not ready. But it will be."
        ]
    },

    // ===== PERSONALITY VARIANTS =====
    personalities: {
        shy: {     // gentle
            talk: [
                "I hope I'm not keeping you from something more important...",
                "Your company is... a gift I didn't expect.",
                "I don't usually speak this freely. You make it easy.",
                "The palace is large. It feels smaller when you're here.",
                "I prepared tea. I wasn't sure what you liked, so I made three kinds."
            ],
            feed: [
                "The kitchen prepared your favorite. I may have requested it.",
                "Please, eat first. I insist.",
                "I had this brought from the southern provinces. Just for you.",
                "You don't have to rush. There's always more."
            ],
            wash: [
                "The baths were drawn with jasmine oil. I hope that's alright.",
                "Let me know if the water is too warm. Or too cool.",
                "You deserve to feel comfortable here.",
                "The servants handle most things. But I wanted to help. Personally."
            ],
            gift: [
                "I saw this and thought of you. Immediately.",
                "It's not much. The kingdom has far finer things. But this one felt... right.",
                "A gift from me doesn't come with obligation. Just... feeling.",
                "You're blushing. Good. That was the intention."
            ],
            train: [
                "You're a natural. The court would adore you.",
                "That was elegant. Genuinely.",
                "I could watch you practice for hours. And I have been.",
                "You improve every time. It's... captivating."
            ]
        },
        clingy: {   // devoted
            talk: [
                "I cancelled the ambassador's visit. You're more important.",
                "Stay. Please. The evening is long and I'm better with you.",
                "I cleared my entire schedule. Just in case you came.",
                "Tell me everything. I want to know all of it.",
                "Don't leave yet. The night is still young."
            ],
            feed: [
                "I had the chef prepare a seven-course meal. For us.",
                "You haven't eaten enough. Let me get more.",
                "Eat slowly. We have all the time in the world.",
                "I want to share every meal with you. Forever."
            ],
            wash: [
                "The rose petals are fresh. I picked them myself. This morning.",
                "You looked tired. I thought this might help.",
                "Take your time. I'll be here when you're done.",
                "You smell like the garden now. Like home."
            ],
            gift: [
                "I had this commissioned. It took three weeks. Worth every day.",
                "Another gift? Yes. I can't help it.",
                "The jeweler knows your measurements now. I visit often.",
                "You don't have to wear it. But it would make me very happy."
            ],
            train: [
                "Again. I want to see you do that again.",
                "You're getting so good at this. I'm... proud. Is that strange?",
                "Don't stop. I love watching you improve.",
                "We should do this every day. Promise me."
            ]
        },
        tsundere: {   // possessive
            talk: [
                "You were with someone else today. I could tell.",
                "The palace has many rooms. Mine is always open. Remember that.",
                "I don't share well. It's a flaw. I'm aware.",
                "You're free to go wherever you want. I just wish you'd choose here.",
                "I'm not jealous. Princes don't get jealous. ...Who were you with?"
            ],
            feed: [
                "The chef only makes this for the royal family. And you. Now.",
                "I didn't prepare this because I was worried. I prepared it because I wanted to.",
                "If someone else is feeding you, they don't know your preferences like I do.",
                "Eat. Don't argue. I know you haven't."
            ],
            wash: [
                "You look exhausted. The baths are ready. I'm not asking.",
                "You shouldn't have to take care of yourself when I'm here.",
                "The servants are dismissed. I'll handle this. Personally.",
                "Let me take care of you. Stop fighting it."
            ],
            gift: [
                "This isn't a bribe. It's a... reminder. Of where you belong.",
                "I saw you looking at something similar. This one is better.",
                "Don't thank me. Just... stay.",
                "Everyone gives you things. Mine are different. Mine are chosen."
            ],
            train: [
                "You're better at this than anyone at court. Don't let them see.",
                "I'm pushing you because I know what you're capable of.",
                "The court doesn't deserve to see this side of you. Only I do.",
                "Train with me. Only me."
            ]
        }
    },

    tapDialogue: {
        shy: [
            "Oh \u2014 you surprised me.",
            "That was \u2026 gentle. Thank you.",
            "I am not used to being touched casually. \u2014 You may continue.",
            "Your hands are warm. \u2014 Mine are always cold.",
            "\u2026Do that again? \u2014 If you do not mind."
        ],
        clingy: [
            "Mm. \u2014 More. \u2014 I have been waiting for that all day. All week. \u2014 Longer than I will admit.",
            "*takes your hand, turns it over, presses his lips to the inside of your wrist in a way no court protocol would approve of*",
            "Your touch is the best thing I have felt at court this week. \u2014 This year. \u2014 I am losing track.",
            "Do not stop. \u2014 Please. \u2014 I am not above asking. I am a prince. I am asking.",
            "*curls an arm around your waist and pulls you in against his side* \u2014 There. \u2014 Mine for a moment. \u2014 Do not argue.",
            "I memorize every time you touch me. \u2014 I keep a file. \u2014 It is not short.",
            "*thumb along your jawline, slow, the way he was taught to handle porcelain* \u2014 Closer. \u2014 Mm. \u2014 That is better.",
            "*gathers you in, arms around you, face in your hair* \u2014 Stay where I have you. \u2014 The palace can wait."
        ],
        tsundere: [
            "A prince has personal space. \u2014 Yours is acceptable.",
            "You are bold. \u2014 I respect that. \u2014 I may even encourage it.",
            "I did not flinch. \u2014 Note that.",
            "Only you would dare. \u2014 Only you are welcome to.",
            "\u2026That was nice. \u2014 Do not tell anyone."
        ]
    },

    stateDialogue: {
        hungry: [
            "The servants usually handle meals. But I notice when they don't.",
            "I could ring the bell. But I'd rather you brought me something.",
            "A prince should never complain about hunger. A prince is complaining.",
            "The banquet hall is empty. So is my stomach.",
            "I'm used to eating at scheduled times. This is overdue.",
            "Even royalty gets hungry. Shocking, I know.",
            "The kitchen is three floors down. That feels very far right now.",
            "I would trade my crown for a warm meal. Almost."
        ],
        dirty: [
            "I'm not at my best today. The mirror confirmed it.",
            "The bath has been drawn for an hour. I've been waiting for company.",
            "A prince should be presentable. I'm... not. Currently.",
            "The rose water isn't going to apply itself.",
            "I feel less than dignified. Please don't look too closely.",
            "Even velvet looks dull when unwashed."
        ],
        happy: [
            "Mm. \u2014 This is what peace feels like. I want to hold onto it. \u2014 *reaches for your hand without looking*",
            "You take your tea with two spoons of honey. \u2014 I watched you do it on Tuesday. I watched you do it yesterday. \u2014 I asked the kitchen to keep honey stocked. Forever.",
            "You walked past my study this morning. \u2014 I lost an hour. \u2014 Forgive me. I was \u2026 just looking at you through the glass.",
            "*sets down whatever he was reading, walks to you, rests his forehead against yours* \u2014 There. \u2014 Better.",
            "Happiness used to feel temporary. \u2014 You are making it feel \u2026 slow. Weekly. Dreamy.",
            "I did not know I was lonely until you were in the room and I was not. \u2014 *brushes his knuckles along your cheek as if surprised they are allowed to*",
            "My advisor says I have been \u201cunusually distracted.\u201d \u2014 I did not deny it. \u2014 I was looking at you while he said it.",
            "Forgive me. \u2014 I got distracted. \u2014 You were sitting in my window light. I lost the sentence."
        ],
        annoyed: [
            "The court exhausts me. \u2014 You do not. \u2014 But right now everything does.",
            "I am \u2014 very tired. Do not tell anyone. \u2014 Come sit. Do not speak. That is a gift.",
            "A prince does not snap. \u2014 A prince breathes deeply. \u2014 Breathing deeply.",
            "Please do not test my grace today. \u2014 It is running low.",
            "The diplomats and their endless negotiations. \u2014 I need quiet. I need you. In that order.",
            "Forgive me. \u2014 I have been charming all day. I have nothing left for it. \u2014 Only the real thing. That is yours."
        ],
        neutral: [
            "Mm. \u2014 The roses in the garden need attention. Like everything here. \u2014 I would rather look at you.",
            "*looks up from reading* \u2014 You again. \u2014 My favourite interruption.",
            "*straightens a perfectly straight lapel, watches you instead*",
            "Tea?",
            "I was reading. Nothing urgent. \u2014 Come sit. \u2014 Closer. Mm. Good.",
            "You always walk past my study on the south side. \u2014 Is the north side cold? I can fix it. \u2014 Or I can take the south side with you.",
            "There is a concert in the courtyard tonight. \u2014 Would you join me? As yourself. Not as a guest. \u2014 I would like to watch you watch music.",
            "A letter arrived from the neighbouring kingdom. \u2014 Politics. Dull. \u2014 You are not dull. \u2014 Come here. Take off the reading.",
            "I reorganised the library. \u2014 By mood. \u2014 The section labelled \u2018you\u2019 is growing.",
            "The fire is warm. \u2014 So is the silence. \u2014 Stay. \u2014 Longer than you planned.",
            "*half-smile, drifting* \u2014 What were we talking about. \u2014 I lost the thread. You do that to me."
        ],
        corrupted: [
            "You don't need anyone else. I can give you everything.",
            "The palace doors are locked. For your safety. Obviously.",
            "Why would you leave when everything you need is here?",
            "I've been watching the gate. No one comes in. No one goes out.",
            "Stay. That's not a request anymore.",
            "I built this world for you. Don't you see that?",
            "The crown means nothing. You mean everything. And everything stays."
        ],
        neglected: [
            "The palace is quiet without you. \u2014 Quieter than it should be.",
            "I set a place for you at dinner. \u2014 It went cold. \u2014 I ate alone. I was charming about it.",
            "The garden is overgrown. \u2014 I stopped caring about it.",
            "The servants asked if you were coming back. \u2014 I did not have an answer. \u2014 I lied charmingly and went to my study.",
            "I am fine alone. \u2014 I was alone before you. \u2014 I was fine. \u2014 I was.",
            "Your room is still prepared. \u2014 Just in case. \u2014 I will not ask you to use it. Only offer.",
            "I was going to write you a letter. \u2014 I decided against it. \u2014 I will try tomorrow, perhaps."
        ]
    },

    eventDialogue: {
        comfort:  [
            "You are safe here. \u2014 That is all that matters. \u2014 Come here.",
            "Let me handle this. \u2014 You rest. \u2014 I have had a lot of practice at handling things.",
            "Nothing bad can reach you in these walls. \u2014 And if it does, it goes through me first. \u2014 That is not heroic. That is \u2026 ordinary, for what I feel."
        ],
        tension:  [
            "Something feels off between us. \u2014 I do not like uncertainty. \u2014 I like it less with you.",
            "You are pulling away. \u2014 I can feel it. \u2014 Tell me. I can take plain words. I was trained on worse.",
            "The silence is heavier than usual tonight. \u2014 Say what you need to say. \u2014 I will wait."
        ],
        rare:     [
            "I have never said this to anyone outside the royal family.",
            "You see a version of me no one else does. \u2014 I am \u2026 uncertain whether that is fair to you.",
            "My grandfather loved Veyra. \u2014 My grandmother sealed a prince for loving her too \u2014 on his behalf, without asking him. \u2014 That is the pattern in my line. Princes love one. Someone else burns the kingdom for it. \u2014 I have been watching for mine. \u2014 It is you. \u2014 I am not letting anyone burn anything for me this time.",
            "The scholars in my grandfather\u2019s library wrote about Weavers. \u2014 I thought they were a story. \u2014 Then you arrived, and the wards on the palace doors did something they have not done in six generations. \u2014 You are what the books said was lost. \u2014 My family has been looking for you for six hundred years. \u2014 I found you. \u2014 I am not telling anyone. Not yet."
        ],
        obsessed: [
            "I check the gate every hour. \u2014 For you.",
            "I had your favourite flowers planted in every corridor. \u2014 Do not ask how I knew which ones.",
            "The kingdom can wait. \u2014 You cannot. \u2014 I have made that choice. Quietly. In writing."
        ],
        unstable: [
            "Do not leave. \u2014 Do not leave. \u2014 Please do not leave.",
            "I will change anything. Everything. \u2014 Just tell me what.",
            "The crown is crushing me. \u2014 Losing you would be worse."
        ],
        guarded:  [
            "Trust is not given freely in a palace. \u2014 But I am trying.",
            "The walls here are not just stone. \u2014 I am lowering mine. \u2014 It takes longer than I would like.",
            "I want to believe you will stay. \u2014 I am not there yet. \u2014 Wait for me?"
        ],
        secure:   [
            "This is what a kingdom should feel like. Warm. Full. \u2014 Mm. Yes.",
            "I do not need the crown to feel important anymore. \u2014 I just need you in the next chair. \u2014 You are in it now. \u2014 Good.",
            "You are the constant I never knew I needed. \u2014 Do not move. Ever. \u2014 Mm. \u2014 Move a little. Closer is acceptable. Closer. \u2014 There."
        ]
    },

    timeAwayReactions: {
        brief:   ["That was quick. \u2014 I barely missed you. \u2014 Barely."],
        short:   ["The tea is still warm. \u2014 I was hoping you would be back for it."],
        medium:  ["The servants asked where you went. \u2014 I pretended not to notice. \u2014 I noticed."],
        long:    ["The palace was very quiet. \u2014 Very large. \u2014 Very empty. \u2014 I was charming at dinner anyway."],
        extended:["I wrote you three letters. \u2014 I burned them all. \u2014 The first was pretty. The third was honest."],
        distant: ["\u2026You came back. \u2014 I had prepared myself for the alternative. \u2014 I was not ready for either."]
    },

    hungryLines: [
        "The servants usually handle this...",
        "A prince doesn't beg for food. A prince suggests strongly.",
        "Even royalty gets hungry.",
        "The banquet hall is empty. So is my stomach.",
        "I would trade my crown for a warm meal. Almost.",
        "I could ring the bell. But I'd rather you brought me something.",
        "My last meal was... diplomatic. And small.",
        "The kitchen is three floors down. That feels impossibly far."
    ],
    happyLines: [
        "This is what peace feels like.",
        "Happiness used to feel temporary. \u2014 Not anymore.",
        "The crown feels lighter today.",
        "I smiled in front of the court. \u2014 They were confused.",
        "If I could preserve this moment, I would. \u2014 In writing. Signed.",
        "You have turned the palace into a home.",
        "I did not know I was lonely until you were in the room and I was not."
    ],
    dirtyLines: [
        "I'm not at my best today.",
        "The bath has been drawn for an hour. Waiting.",
        "A prince should be presentable. I'm... not.",
        "Even velvet looks dull when unwashed.",
        "The rose water isn't going to apply itself."
    ],
    annoyedLines: [
        "The court exhausts me.",
        "Please do not test my grace today.",
        "A prince breathes deeply. \u2014 Breathing deeply.",
        "The diplomats and their negotiations. \u2014 I need quiet.",
        "I have been charming all day. \u2014 I have nothing left of it for anyone but you."
    ],
    neutralLines: [
        "The roses need attention. Like everything here.",
        "Tea?",
        "I was reading. Come sit.",
        "The afternoon light is... adequate.",
        "The fire is warm. So is the silence.",
        "The kingdom runs itself most days.",
        "I reorganized the library. By mood."
    ],

    feedDialogue: [
        "This is perfect. You remembered my preferences.",
        "The chef would be jealous of how much I'm enjoying this.",
        "Dining alone is policy. Dining with you is pleasure.",
        "You have excellent taste. In food. And in company.",
        "The simplest meals taste best with the right person.",
        "More, please. ...I rarely say please. Notice that.",
        "The southern provinces would be proud of this presentation.",
        "I'm going to pretend I wasn't starving. Thank you."
    ],
    washDialogue: [
        "That's... much better. Thank you.",
        "I feel human again. Well. Princely.",
        "The jasmine oil was a good choice. Like you.",
        "I'm presentable once more. The mirror and I are reconciled.",
        "You care about the small things. That's not small.",
        "A clean prince is a thinking prince. Thank you.",
        "The servants could learn from your thoroughness."
    ],
    giftDialogue: {
        apple:    ["Simple. Natural. Like the best things.", "The orchards at home grow these. This one is better."],
        rose:     ["A rose for a prince... how fitting.", "I'll press this in my journal. Where it will stay forever."],
        sword:    ["A practical gift. Not my style. But I appreciate the thought.", "I'll hang it in the study. For decoration."],
        cake:     ["The royal baker would be envious.", "Sweet. Like the person who gave it."],
        ring:     ["A ring... You know what this means in my kingdom.", "I'll wear it. Always. On the hand closest to my heart."],
        book:     ["Poetry? You know me too well.", "I'll read this tonight. By firelight. Thinking of you."],
        pearl:    ["Pearls are for promises in my family.", "This is worth more than the crown jewels. To me."],
        flower:   ["From the garden? You remembered which ones I love.", "I'll put this by the window. Where the light is best."],
        crown:    ["You're giving me... a crown? I already have one. This one is better.", "Priceless. Not the object. The gesture."],
        wine:     ["From the private reserves. You have excellent taste.", "Let's share this. Tonight. Just us."]
    },

    affectionDialogue: [
        "I've never felt this way[tender] about anyone outside the royal line...",
        "The kingdom matters less[adoring] than this moment with you...",
        "I would abdicate[shy] before I'd let you go...",
        "You are my kingdom[love] now..."
    ],

    departureDialogue: [
        "The palace will stand without you. I'm not sure I will.",
        "I prepared everything for your comfort. And you still left.",
        "A prince doesn't chase. But I wanted to.",
        "The gates are always open. Even when my heart isn't."
    ],

    idleDialogue: {
        hungry: [
            "...", "The servants seem to have forgotten lunch.", "...the kitchens are so far away.",
            "I keep glancing at the dining hall.", "A prince shouldn't have to ask twice."
        ],
        dirty: [
            "...", "*picks at a stain on silk sleeve*", "The bath has been ready for an hour.",
            "I can't receive visitors like this.", "Even I have standards. These are below them."
        ],
        lonely: [
            "...", "The palace is too large for one person.", "I keep setting two places at the table.",
            "The silence here has weight.", "The guards don't count as company.",
            "I rehearsed what I'd say when you came back. I've forgotten it all."
        ],
        loving: [
            "I was writing your name in the margins of a trade agreement.",
            "The court painter asked who I was thinking about. I changed the subject.",
            "You've ruined me for formal dinners. I keep looking at the empty chair beside me.",
            "I had a garden planted in your favorite colors. It's not subtle.",
            "The crown feels lighter when I imagine you wearing it.",
            "I dreamed we danced in the empty throne room. Just us. No music needed.",
            "*touches the ring you gave him, smiles at nothing*",
            "The poets write about this feeling. They don't capture half of it.",
            "I keep finding excuses to walk past your room.",
            "If the kingdom knew how much power you have over me... they'd worry."
        ],
        night: [
            "The palace looks different by moonlight. Softer.",
            "*reads by candlelight, glances up when you move*",
            "The stars from the tower balcony are extraordinary tonight.",
            "I should sleep. The kingdom needs me alert. But you're here.",
            "The fire is dying. I don't want to move.",
            "Nighttime is when the crown comes off. This is just... me."
        ],
        general: [
            "...",
            "*adjusts a flower arrangement that was already perfect*",
            "*turns a page of poetry, reads a line twice*",
            "Hmm.",
            "The tapestry in the east wing needs replacing. I keep putting it off.",
            "*glances at you, then at the window, then back*",
            "I had a thought about the garden layout. It can wait.",
            "*runs a finger along the bookshelf, checking for dust*",
            "The advisors want a meeting. I want quiet.",
            "I ordered new curtains. Gold. To match the sunset.",
            "There's a room in the palace no one uses. I've been thinking about why.",
            "*stands by the window, watching nothing in particular*",
            "The roses are blooming early this year. I'll take credit.",
            "The knight reported unusual activity near the coast. Lyra's domain.",
            "The mage declined my invitation again. Lucien prefers his tower.",
            "The druid sent herbs from Thornwood. Good for the gardens.",
            "The captain of the guard looked tired today. Alistair works too hard.",
            "The throne room feels warmer when you visit. The servants noticed too.",
            "My father's crown used to glow. It stopped years ago. It flickered yesterday.",
            "The palace gardens were dying before you came. Now look at them.",
            "Do you know what you are? To this kingdom? I don't think you do.",
            "The royal bloodline's magic is tied to bonds. Love, trust, care. You brought those back.",
            "Something sealed beneath the kingdom stirs when the bonds weaken. Your presence quiets it.",
            "My grandmother's journals mention Soul Weavers. She said they were the kingdom's heart.",
            "The royal line has always depended on a Weaver. Without one... we fade. You stopped the fade.",
            "The one sealed below... he was close to the last Weaver. Very close. His grief became our prison."
        ]
    },

    personalityDialogue: {
        shy: [
            "I hope I'm not keeping you...",
            "Your company is... a gift I didn't expect.",
            "I don't usually speak this freely.",
            "The palace feels smaller when you're here."
        ],
        clingy: [
            "I cancelled everything today. For you.",
            "Stay. The evening is long and I'm better with you.",
            "Don't leave yet.",
            "I want to know everything about you."
        ],
        tsundere: [
            "You were with someone else. I could tell.",
            "I'm not jealous. Princes don't get jealous.",
            "I don't share well. It's a flaw.",
            "...Who were you with?"
        ]
    },

    storyMilestones: {
        affection1: {
            title: "Royal Welcome",
            text: "Caspian dismisses the guards. For the first time, the smile reaches his eyes. 'You're not a guest anymore. You're... something else.'"
        },
        affection2: {
            title: "The Private Garden",
            text: "He leads you through a hidden door. A garden no one else has seen. 'My mother planted this. I've never shown anyone. Until now.'"
        },
        affection3: {
            title: "Crown and Heart",
            text: "His hand trembles as he sets the crown down. 'The kingdom asks for everything. You ask for nothing. That's why you get all of me.'"
        },
        affection4: {
            title: "The Only Throne",
            text: "'Every prince dreams of ruling. I dream of this.' He takes your hand. 'You are my kingdom now.'"
        },
        corruption1: {
            title: "Golden Cage",
            text: "The palace doors are bolted. Caspian stands before them, expression soft but unyielding. 'I can't let you leave. Not because I'm cruel. Because I'm terrified.'"
        }
    }
};
