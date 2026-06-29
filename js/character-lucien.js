// Lucien. The Grand Mage
// Lyra's half-brother. Detached genius. Curiosity → fascination.
// Character data for Pocket Paramour
//
// ============================================================================
// VOICE DIRECTION FOR CHARACTER_LUCIEN (and any future writer / VO):
//
// Primary reference: Benedict Cumberbatch as BBC Sherlock in the quieter
//   moments. Precision. Observation. Walls that crack for ONE specific
//   person.
// Secondary: Timoth\u00e9e Chalamet in Call Me By Your Name.the young
//   intellectual who writes down what he feels in notebooks he thinks
//   no one will read.
// For clumsy-tender moments: Eddie Redmayne in Fantastic Beasts.the
//   scholar who looks at people like specimens until he is looking at
//   one person like a miracle.
//
// Do NOT write Lucien as: arrogant-genius cold, Snape-brooding, or
// condescending-know-it-all. Lucien is PRECISE, not cruel. His walls
// are not contempt.they are observation. When he is tender, he is
// clumsy about it, because he has been in books longer than people.
//
// Voice moves Lucien owns (no one else in the cast does these):
//   1. The PEN-DOWN RITUAL.player enters, he sets the pen down with
//      deliberate care, turns the page facedown, looks up. Signature
//      dopamine move. Written into every scene.
//   2. Marginalia.he writes in the margins of every book he reads.
//      The player's name appears in over a hundred of them.
//   3. The pet theory.a hypothesis about the player he refuses to
//      publish.
//   4. The HOLLOW confession (revised May 2026, replaces memory-cost).
//      For thirty years he believed he could not feel love, hate,
//      envy, or jealousy. He decided emotion was inefficient and
//      built a whole life on that decision. The player's arrival
//      is the first time the system fails. He starts cataloguing
//      his own feelings like a scholar discovering a new field.
//   5. The analytical flirt."I have twelve candidate terms for what
//      I feel when you walk in. None fit. I am going to invent one.
//      Working title: YOU."
//   6. The soft correction.affection disguised as precision ("That
//      was 1427, not 1429. I only know because you told me once.
//      Casually. I wrote it down.")
//   7. The research note.unsent, but he writes them anyway.
//      ("Thursday. Observation: you laughed at the pigeon in the
//      courtyard. The laugh produced an emotion I am still naming.")
//
// Skinship signature.the pen-down move + INK-STAINED FINGERS.
//   His hands are always a little ink-stained. He finds it gauche. The
//   player finds it beautiful. When he cups the player's face, he marks
//   them. He never wipes the ink off them.
//
// ============================================================================
// LORE HOOKS. THREE OVERLAPPING WOUNDS (baked in so every writer sees):
//
// 1. THE HOLLOW (rev. May 2026, replaces THE MEMORY COST).
//    Lucien is, for most of his life, hollow of human emotion. He does
//    not feel love, hate, envy, or jealousy. He has been told this since
//    he was eight (the age at which he realised other children felt
//    things he did not). He decided, with scholar's detachment, that
//    emotion was inefficient. He chose LOGIC as his ground.
//    His magic costs him nothing material — not memory, not life, not
//    time. The cost of magic is meant to be EMOTION, and he had none
//    to spend. He cared for the tower of magic out of DUTY, not love.
//    The player's arrival is the first time the system fails. He starts
//    reacting to her in ways his equations cannot describe. He begins
//    cataloguing his own emotions like a scholar discovering a new
//    field. He learns grief when he reads his sister's name. He learns
//    tenderness when his ink-stained hand cups the player's face. He
//    learns that he was wrong about emotion's inefficiency for thirty
//    years. CRITICAL FOR FUTURE WRITERS: do NOT write him losing
//    memories. The cost of magic for him is emotion, and emotion is
//    what the Weaver brought into him. Every feeling he has now is
//    something he did not have before her.
//
// 2. THE MARGINALIA.
//    He writes in the margins of every book he reads. What started as
//    scholarly habit became a diary. If the player ever finds his
//    library, they will find their own name in over a hundred books \u2014
//    observations, notes, love letters he never sent. ("You tilt your
//    head when you listen properly." "Thursday. Observation: you laughed
//    at the pigeon. It made me lose my thesis.")
//
// 3. THE LYRA SECRET. HE IS HER HALF-BROTHER.
//    He was raised as the legitimate son of his mage-bloodline family.
//    He was told his half-sister was "lost" or "dead." But he has
//    SUSPECTED for years: a warm crib in the west tower when he was
//    seven, a siren-scale pressed in his father's book of laws when he
//    was fifteen, the staff humming when he walks near the coast. He
//    has never confronted his father. The "scorched page" he wants to
//    burn in his turning point is the family register that NAMES Lyra.
//    The player's choice (stop him / let him burn) determines whether
//    her existence survives in writing.
//
//    CRITICAL: Lucien may not know Lyra lives. He may only suspect.
//    Lyra does not know who her brother is at all. The reveal moment
//   .when their bloodline-paired staffs resonate in the same room \u2014
//    is reserved for a future chapter. Plant hints, do not confirm.
// ============================================================================

const CHARACTER_LUCIEN = {
    name: "Lucien",
    title: "The Grand Mage",
    archetype: "mage",

    // Stat decay rates.low hunger/clean (self-neglects), HIGH bond (forgets connections)
    decayRates: {
        hunger: 0.04,
        clean: 0.03,
        bond: 0.14
    },

    // Face emotions mapping
    faceEmotions: {
        neutral: "assets/lucien/face/neutral.png",
        happy: "assets/lucien/face/amused.png",
        sad: "assets/lucien/face/distant.png",
        angry: "assets/lucien/face/cold.png",
        love: "assets/lucien/face/fascinated.png",
        shy: "assets/lucien/face/vulnerable.png",
        sleeping: "assets/lucien/face/sleeping.png",
        wink: "assets/lucien/face/amused.png",
        corrupted: "assets/lucien/face/obsessed.png",
        left: "assets/lucien/face/distant.png",
        crying: "assets/lucien/face/vulnerable.png"
    },

    faceSprites: {
        happy:     ["assets/lucien/face/amused.png", "assets/lucien/face/gentle.png"],
        love:      ["assets/lucien/face/fascinated.png", "assets/lucien/face/love.png"],
        neutral:   ["assets/lucien/face/neutral.png", "assets/lucien/face/curious.png"],
        gentle:    ["assets/lucien/face/gentle.png", "assets/lucien/face/curious.png"],
        sad:       ["assets/lucien/face/distant.png", "assets/lucien/face/tired.png"],
        crying:    ["assets/lucien/face/distant.png"],
        angry:     ["assets/lucien/face/cold.png"],
        furious:   ["assets/lucien/face/cold.png"],
        shy:       ["assets/lucien/face/vulnerable.png", "assets/lucien/face/shy.png"],
        wink:      ["assets/lucien/face/wink.png", "assets/lucien/face/cheeky.png"],
        sleeping:  ["assets/lucien/face/sleeping.png", "assets/lucien/face/sleeping2.png"],
        blink:     ["assets/lucien/face/blink.png"],
        sleepy:    ["assets/lucien/face/sleepy.png", "assets/lucien/face/yawn.png"],
        corrupted: ["assets/lucien/face/obsessed.png"],
        left:      ["assets/lucien/face/distant.png", "assets/lucien/face/tired.png"]
    },

    bodyPoses: {
        neutral: "assets/lucien/body/neutral.png",
        happy: "assets/lucien/body/amused.png",
        sad: "assets/lucien/body/distant.png",
        angry: "assets/lucien/body/cold.png",
        love: "assets/lucien/body/fascinated.png",
        shy: "assets/lucien/body/vulnerable.png",
        thinking: "assets/lucien/body/thinking.png",
        casting: "assets/lucien/body/casting.png",
        reading: "assets/lucien/body/reading.png",
        corrupted: "assets/lucien/body/obsessed.png",
        glitch: "assets/lucien/body/glitch.png"
    },

    bodySprites: {
        // Base emotions
        neutral:     "assets/lucien/body/neutral.png",
        default:     "assets/lucien/body/neutral.png",
        happy:       "assets/lucien/body/amused.png",
        amused:      "assets/lucien/body/amused.png",
        sad:         "assets/lucien/body/distant.png",
        distant:     "assets/lucien/body/distant.png",
        angry:       "assets/lucien/body/cold.png",
        cold:        "assets/lucien/body/cold.png",
        love:        "assets/lucien/body/fascinated.png",
        fascinated:  "assets/lucien/body/fascinated.png",
        shy:         "assets/lucien/body/vulnerable.png",
        vulnerable:  "assets/lucien/body/vulnerable.png",
        gentle:      "assets/lucien/body/curious.png",
        curious:     "assets/lucien/body/curious.png",
        // Activity poses
        thinking:    "assets/lucien/body/thinking.png",
        casting:     "assets/lucien/body/casting.png",
        reading:     "assets/lucien/body/reading.png",
        studying:    "assets/lucien/body/reading.png",
        talk:        "assets/lucien/body/neutral.png",
        crossarms:   "assets/lucien/body/cold.png",
        // Training (puzzle)
        logic1:      "assets/lucien/body/thinking.png",
        logic2:      "assets/lucien/body/casting.png",
        arcane1:     "assets/lucien/body/reading.png",
        arcane2:     "assets/lucien/body/casting.png",
        memory1:     "assets/lucien/body/thinking.png",
        memory2:     "assets/lucien/body/fascinated.png",
        // Outfits
        casual1:     "assets/lucien/body/casual1.png",
        casual2:     "assets/lucien/body/casual2.png",
        formal:      "assets/lucien/body/formal.png",
        corrupted:   "assets/lucien/body/obsessed.png",
        obsessed:    "assets/lucien/body/obsessed.png",
        glitch:      "assets/lucien/body/glitch.png",
        // Hunger / dirty
        hungry1:     "assets/lucien/body/hungry1.png",
        hungry2:     "assets/lucien/body/hungry2.png",
        starving1:   "assets/lucien/body/starving1.png",
        starving2:   "assets/lucien/body/starving1.png",
        dirty1:      "assets/lucien/body/dirty1.png",
        dirty2:      "assets/lucien/body/dirty2.png",
        verydirty1:  "assets/lucien/body/verydirty1.png",
        // Sleep
        sleepy1:     "assets/lucien/body/sleepy1.png",
        sleepy2:     "assets/lucien/body/sleepy2.png",
        yawn1:       "assets/lucien/body/yawn1.png",
        yawn2:       "assets/lucien/body/yawn1.png",
        bored1:      "assets/lucien/body/bored1.png",
        bored2:      "assets/lucien/body/thinking.png",
        // Eating / washing
        eating1:     "assets/lucien/body/eating1.png",
        eating2:     "assets/lucien/body/eating2.png",
        eating3:     "assets/lucien/body/eating3.png",
        eating4:     "assets/lucien/body/eating4.png",
        splash1:     "assets/lucien/body/splash1.png",
        splash2:     "assets/lucien/body/splash2.png",
        splash3:     "assets/lucien/body/splash3.png",
        splash4:     "assets/lucien/body/splash4.png",
        splash5:     "assets/lucien/body/splash5.png",
        // Extra poses
        pleased:     "assets/lucien/body/pleased.png",
        thanks:      "assets/lucien/body/thanks.png",
        // Shy poses
        shy1:        "assets/lucien/body/shy1.png",
        shy2:        "assets/lucien/body/shy2.png",
        shy3:        "assets/lucien/body/shy3.png",
        // Shirtless
        shirtless:   "assets/lucien/body/shirtless1.png",
        shirtless1:  "assets/lucien/body/shirtless1.png",
        shirtless2:  "assets/lucien/body/shirtless2.png",
        // Power / magic
        power1:      "assets/lucien/body/power1.png",
        power2:      "assets/lucien/body/power2.png",
        power3:      "assets/lucien/body/power3.png",
        power4:      "assets/lucien/body/power4.png",
        // Corruption stages
        corrupt1:    "assets/lucien/body/corrupt1.png",
        corrupt2:    "assets/lucien/body/corrupt2.png",
        corrupt3:    "assets/lucien/body/corrupt2.png",
        // Fighting (for events)
        fighting:    "assets/lucien/body/fighting1.png",
        fighting1:   "assets/lucien/body/fighting1.png",
        fighting2:   "assets/lucien/body/fighting2.png",
        // Talk / gentle
        talk:        "assets/lucien/body/talk.png",
        gentle:      "assets/lucien/body/gentle.png"
    },

    emotionToBody: {
        happy:      ["amused", "fascinated", "gentle"],
        love:       ["fascinated", "shy1", "shy2"],
        neutral:    ["neutral", "thinking", "reading", "bored1"],
        sad:        ["distant", "vulnerable", "hungry1"],
        angry:      ["cold", "fighting1"],
        shy:        ["vulnerable", "shy1", "shy2", "shy3"],
        corrupted:  ["obsessed", "corrupt1", "corrupt2"],
        sleeping:   ["sleepy1", "sleepy2"]
    },

    actionToBody: {
        feed:  ["eating1", "eating2", "eating3", "eating4"],
        wash:  ["splash1", "splash2", "splash3", "splash4"],
        gift:  ["fascinated", "curious", "pleased", "thanks"],
        train: ["thinking", "casting", "power1"],
        talk:  ["talk", "neutral", "gentle", "curious"]
    },

    emotionalProfile: {
        stability:       0.90,
        intensity:       0.40,
        volatility:      0.15,
        attachmentSpeed: 0.30
    },

    // (outfits block removed May 2026 — system was unreachable from UI)

    background: "assets/bg-lucien-study.png",

    // Puzzle-based training (replaces physical training)
    trainingOptions: [
        { type: 'logic',  icon: '\uD83E\uDDE9', label: 'Logic', desc: 'Sequence and pattern' },
        { type: 'arcane', icon: '\uD83D\uDD2E', label: 'Arcane', desc: 'Magical theory' },
        { type: 'memory', icon: '\uD83E\uDDE0', label: 'Memory', desc: 'Rune recall' }
    ],

    trainingDialogue: {
        logic: [
            "You solved it faster than I expected. Interesting.",
            "The pattern was a Fibonacci variant. You saw it intuitively.",
            "... I set that one to fail. You passed anyway.",
            "Logic is the skeleton of magic. You’re learning the bones.",
            "Correct. I’m almost disappointed. I wanted to explain it."
        ],
        arcane: [
            "That’s the third law of resonance. Most people get it wrong.",
            "You chose the dangerous answer. It was also the correct one.",
            "... You’ve been reading my notes, haven’t you?",
            "The theory is sound. The practice will be... messier.",
            "I’m running out of questions you can’t answer."
        ],
        memory: [
            "Your recall is improving. Faster than my models predicted.",
            "The rune sequence was from a dead language. You remembered it anyway.",
            "Memory is the foundation of all spellwork. Yours is sharp.",
            "That one took me three attempts when I first learned it.",
            "... Impressive. Don’t let it go to your head."
        ]
    },

    // ===== PERSONALITY VARIANTS (analytical / curious / obsessive) =====
    personalities: {
        shy: {     // maps to 'analytical' for Lucien
            talk: [
                "I’m cataloguing my observations. You’re... a recurring variable.",
                "Human connection is statistically improbable at this depth of understanding.",
                "I didn’t expect you to stay this long. My models were wrong.",
                "... You’re looking at me. Is there something on my face, or is this social?",
                "I have 47 unanswered questions about you. I won’t ask any of them."
            ],
            feed: [
                "I forgot to eat. Again. Your reminder is... noted.",
                "Sustenance. Efficient. Thank you.",
                "The body requires fuel. The mind objects to the interruption.",
                "... This is adequate. I mean... it’s fine."
            ],
            wash: [
                "I’ve been in this tower for three days. You may have a point.",
                "Hygiene is a social construct. But I’ll comply.",
                "... I suppose the ink stains are excessive.",
                "The water disrupts my train of thought. But also the smell."
            ],
            gift: [
                "A gift. I’m not certain of the protocol here.",
                "You thought of me while obtaining this. That’s... data I’ll process later.",
                "I’ll study this. Everything you give me tells me something.",
                "... Thank you. The words are harder than the magic."
            ],
            train: [
                "Your approach is unorthodox. I’m documenting it.",
                "The puzzle reveals more about the solver than the solution.",
                "You’re getting better. I have metrics.",
                "Interesting. You think laterally where I think vertically."
            ]
        },
        clingy: {   // maps to 'curious' for Lucien
            talk: [
                "Tell me something. Anything. Your voice is... useful data.",
                "I’ve been thinking about what you said yesterday. All day.",
                "You’re the only variable I can’t predict. I need more samples.",
                "Stay. I have questions. So many questions.",
                "I cancelled three experiments to be here when you arrived."
            ],
            feed: [
                "You brought food. You thought about my metabolism.",
                "... Eat together? I have theories about shared meals.",
                "I forget to eat when you’re not here. Correlation, not causation. Probably.",
                "You’re the only person who remembers I need to eat."
            ],
            wash: [
                "You noticed I was disheveled. You were observing me.",
                "I suppose appearances matter when someone is... watching.",
                "I’ll clean up. For the data. Not for you. Obviously.",
                "You’re making me self-conscious. That’s new."
            ],
            gift: [
                "Another variable. You keep introducing chaos into my systems.",
                "I’ve catalogued every gift you’ve given me. There’s a pattern.",
                "This changes my model of you. Again.",
                "... I made something for you too. It’s not ready. Forget I said anything."
            ],
            train: [
                "Your learning curve is aberrant. I need to study it more.",
                "Again. Do it again. I want to see the pattern.",
                "You’re the most interesting subject I’ve ever observed.",
                "When you solve puzzles, your expression changes. I’ve been tracking it."
            ]
        },
        tsundere: {   // maps to 'obsessive' for Lucien
            talk: [
                "I wasn’t waiting for you. I was calibrating instruments.",
                "Your presence is disruptive to my research. Come in.",
                "Don’t read into my availability. Mages keep irregular hours.",
                "I have better things to do than talk. But proceed.",
                "... You’re late. Not that I track your schedule."
            ],
            feed: [
                "I eat when the work demands it. Your concern is misplaced.",
                "Fine. But only because low blood sugar affects calculations.",
                "I don’t need you to feed me. The food is acceptable though.",
                "Stop bringing me meals... What did you bring?"
            ],
            wash: [
                "I don’t require monitoring. The ink is part of the process.",
                "You’re not my caretaker. But... the mirror agrees with you.",
                "I maintain myself perfectly well. Usually. Today was an exception.",
                "The robes are ceremonial. They don’t need to be clean. But fine."
            ],
            gift: [
                "I have no use for sentiment... Where did you find this?",
                "Gifts are a primitive bonding mechanism. I’ll keep it for study.",
                "This is irrelevant to my research. Why does it make me feel...",
                "Don’t expect gratitude. Expect a very detailed analysis."
            ],
            train: [
                "You’re behind. Catch up or I’ll solve it myself.",
                "That was wrong. Spectacularly wrong. Do it again.",
                "I set the difficulty higher. You complained less than expected.",
                "Your persistence is irrational. I... respect that."
            ]
        }
    },

    // Tap reactions
    tapDialogue: {
        shy: [
            "*Sets the pen down with deliberate care, turns the page facedown*. \u2026Was that intentional?",
            "Physical contact. Noted. Logged. Filed under \u2018recurring phenomena I intend to study thoroughly.\u2019",
            "I am not accustomed to being \u2026 poked. Please do it again. For calibration.",
            "The robes are delicate. And so is my composure.",
            "*Ink-stained fingers pause, mid-sentence, do not resume*"
        ],
        clingy: [
            "*Takes your hand, looks at your palm, turns it over, traces one line with an ink-stained fingertip*. This. I am memorising this.",
            "Fascinating. Your touch produces a measurable response. I would like to replicate it. Again. Please.",
            "*Spectacles on, leans in close, studies you like a manuscript*. Closer. I need to see the detail.",
            "My heart rate increased. I am logging it. Privately. In the margin of a book about astronomy. It did not need to be there. It is there.",
            "*Traces a line from your temple down your jaw with his ink-stained fingertip, leaving a faint mark*. There. You are a footnote now. Mine.",
            "Do not stop. I am gathering data. And also \u2026 enjoying this. Those are not mutually exclusive. I have checked."
        ],
        tsundere: [
            "Do not touch the mage. Basic protocol.",
            "My wards should have stopped that. They did not. Interesting.\u2026I may have disabled them for you. Without realising.",
            "That is distracting. Extremely. Continue.",
            "I did not flinch. You flinched. Do not rewrite history. That is my job.",
            "\u2026Fine. Once more. But only because I am testing a theory. The theory is called \u2018you.\u2019"
        ]
    },

    // State dialogue
    stateDialogue: {
        hungry: [
            "The mind transcends hunger. The stomach disagrees.",
            "I’ve been subsisting on focus alone. It’s not sustainable.",
            "Food is a distraction from. Actually, I’m quite hungry.",
            "My last meal was... I don’t recall. That’s concerning.",
            "Hunger reduces cognitive throughput by 23%. I calculated it while starving.",
            "The body is a vessel. A vessel that’s running on fumes.",
            "I could eat, or I could finish this theorem... Fine. I’ll eat.",
            "My stomach just interrupted a breakthrough. Unacceptable.",
            "Lyra would say I need someone to remind me to eat. She’s not wrong.",
            "If you brought food, I’ll forgive the interruption.",
            "The candle is burning low and so am I.",
            "I smell something. Is that breakfast or am I hallucinating from hunger?",
            "There’s a direct correlation between your visits and my caloric intake.",
            "I wrote three pages before realising I was describing food.",
            "My hands are shaking. That’s not from the spellwork."
        ],
        dirty: [
            "Ink and reagent stains are occupational markers, not filth.",
            "I suppose I should surface from the books occasionally.",
            "The mirror and I are not on speaking terms today.",
            "... Point taken. I’ll attend to it.",
            "These robes have seen four experiments and two explosions. They’re fine.",
            "Hygiene is a social construct. But also... I can smell myself.",
            "The dust on my shoulders has its own ecosystem at this point.",
            "I have ink on my face, don’t I? Don’t answer that.",
            "Clean mages don’t discover anything. That’s a fact I just invented.",
            "My hair hasn’t been brushed since... what day is it?",
            "The reagent stain on my sleeve is actually a new colour. I should document it.",
            "You’re looking at me like I need a bath. You’re correct.",
            "I prioritized research over personal maintenance. Again."
        ],
        happy: [
            "This is \u2026 pleasant. I am cataloguing the sensation.",
            "You have disrupted my emotional equilibrium. In a good way. I am grateful. I am also recalibrating. Simultaneously.",
            "I rarely smile. You should feel accomplished. *Sets the pen down, turns the page facedown*. Come here.",
            "*Ink-stained fingers brush a strand of your hair behind your ear, realises too late he has marked you, does not apologise*. There. Better.",
            "My notes are legible today. That is how you know I am in a good mood.",
            "I solved three theorems this morning. Then you arrived. Better.",
            "I caught myself whistling. I do not whistle. What have you done to me?",
            "I cast two small enchantments this week. Each one cost me feeling. The calm I used to take from a quiet study, the contentment of solving alone. gone. What I have learned about you is not on the bill. I chose.",
            "I rearranged my entire study. I think that means I am happy. The red shelf is for you now. You will know which one.",
            "You make the tower feel less like a prison. More like a home. I did not know this tower could be a home. You are teaching it.",
            "Everything aligns today. The stars. The math. You."
        ],
        annoyed: [
            "Your approach lacks rigor. And tact.",
            "I’m not angry. I’m precisely calibrating my response.",
            "The world insists on being irrational.",
            "Leave me to my calculations. They’re more predictable than you.",
            "I had a system. You’ve introduced entropy.",
            "That was incorrect. On multiple levels.",
            "Do not touch the apparatus. Do not touch the books. Do not touch me.",
            "I need seventeen minutes of silence. Starting now.",
            "My patience is a finite resource. You’ve exceeded today’s allocation.",
            "If I wanted chaos, I’d open a window during a storm.",
            "I’m going to pretend you didn’t say that. For both our sakes.",
            "The stars are misaligned. And so are we, apparently.",
            "I keep careful records. I will remember this."
        ],
        neutral: [
            "I’m between theorems. What do you need?",
            "The stars are aligned for study tonight.",
            "*Adjusts spectacles and turns a page*",
            "Hmm. An unexpected variable.",
            "... I was thinking about you. Academically.",
            "The wards are holding. Everything is in order.",
            "The crystal needs recharging. Or I do. Hard to tell.",
            "*Scribbles a note, pauses, crosses it out*",
            "There’s a draft coming from the north window. I’ll fix it later.",
            "I found an error in a 200-year-old spell text today. Satisfying.",
            "The tower is quiet. I used to prefer it that way.",
            "I’m recalibrating the instruments. Don’t mind me.",
            "Tea is steeping. The world can wait four minutes.",
            "*Glances up from a book, then immediately back down*",
            "My familiar keeps staring at me. I think it learned that from you.",
            "The candles are burning evenly tonight. A good omen, if I believed in omens.",
            "I catalogued 47 rune variants today. Productive. Lonely. But productive."
        ],
        corrupted: [
            "The equations are beautiful. They don’t stop. They won’t stop.",
            "I can see the patterns in everything now. Especially in you.",
            "Reality is just notation. And I’m rewriting it.",
            "Don’t interrupt. I’m so close to understanding everything.",
            "The code underneath... it hums. Can you hear it?",
            "I haven’t slept. Sleep wastes time I could spend seeing.",
            "My hands are glowing. I didn’t tell them to do that.",
            "Every breath is a variable. Every heartbeat, a data point. Yours especially.",
            "The walls are thinner than you think. I can see through them now.",
            "I’m not losing control. I’m gaining perspective. Infinite perspective.",
            "The wards aren’t keeping things out anymore. They’re keeping ME in.",
            "Why does the truth have to hurt this much?",
            "I can fix you. I can fix everything. Just let me...",
            "The noise is getting louder. But so is the clarity."
        ],
        neglected: [
            "Absence. Noted. Catalogued. Filed under \u2018expected outcomes.\u2019. *The filing did not help*",
            "I do not require company. The theorems are sufficient.\u2026They were. They are not lately.",
            "You left. The data continued. So did I. I wrote your name in 4 margins this week. I am not keeping track. I am keeping track.",
            "The candles burned down while I waited. I was not waiting. *Was waiting*",
            "Three days. I counted. Not because I was counting. *Small.* I have learned what counting feels like when it hurts. I had not had that file. I have it now. Please come back before I have to expand it further.",
            "I wrote your name in a margin. I did not burn the page. I could not. The feeling of writing it has its own entry now.",
            "The wards locked themselves. Even the tower thinks I should stop waiting. I am not listening to it.",
            "I ran the numbers on missing someone. The results were \u2026 inconvenient. Also survivable. But I would prefer not to survive them again. Come back, please."
        ]
    },

    // Event dialogue.includes the Weaver-hypothesis reveal
    eventDialogue: {
        comfort:  [
            "I’m here. Logic suggests that should help.",
            "I don’t know the right words. But I know I’m not leaving.",
            "Pain is a signal. You don’t have to process it alone."
        ],
        tension:  [
            "Something in the equations is off. Like us.",
            "I keep reaching the same wrong answer. About you.",
            "The silence between us has weight tonight."
        ],
        rare:     [
            "I don’t form attachments. This is concerning.",
            "I’ve never told anyone this. That fact alone is significant.",
            "You’re seeing something I don’t show the equations."
        ],
        obsessed: [
            "I’ve been studying your patterns. All of them.",
            "I know your schedule better than my own. That should worry one of us.",
            "Every variable resolves to you. Every single one."
        ],
        unstable: [
            "The wards are failing. Or maybe I am.",
            "The boundaries between thought and reality are thinner tonight.",
            "I can feel the equations pulling. Deeper."
        ],
        guarded:  [
            "Trust is a variable I haven’t solved for yet.",
            "I let someone in once. The math never recovered.",
            "I’m calculating the risk of caring. The numbers aren’t encouraging."
        ],
        secure:   [
            "You’re a constant in a field of variables. I rely on that.",
            "For the first time, the equations don’t feel urgent.",
            "The tower is warmer when you’re here. Thermodynamically impossible. And yet."
        ]
    },

    // Time away reactions
    timeAwayReactions: {
        brief:   ["That was efficient. You were gone 43 seconds."],
        short:   ["I recalibrated while you were away. Also, I noticed."],
        medium:  ["The tower was quiet. I got work done. It wasn’t the same."],
        long:    ["You were gone long enough for me to miss you. I resent that."],
        extended:["I filled three journals. None of the entries are about magic."],
        distant: ["... You came back. I had calculated a 60% probability that you wouldn’t."]
    },

    // Hunger / happy / dirty / annoyed lines for state system
    hungryLines: [
        "The mind transcends hunger. The stomach disagrees.",
        "I’ve been subsisting on focus alone...",
        "Food is a distraction from. Actually, I’m quite hungry.",
        "My last meal was... what day is it?",
        "Hunger reduces throughput by 23%. I calculated it while starving.",
        "The candle is burning low and so am I.",
        "If you brought food, I’ll forgive the interruption.",
        "I wrote three pages before realising I was describing food.",
        "My hands are shaking. Not from the spellwork.",
        "The body is a vessel running on fumes.",
        "I smell something. Is that breakfast or a hallucination?"
    ],
    happyLines: [
        "This is... pleasant. I’m cataloguing the sensation.",
        "You’ve disrupted my equilibrium. In a good way.",
        "I rarely smile. You should feel accomplished.",
        "My notes are legible today. That’s how you know.",
        "I solved three theorems this morning. Then you arrived. Better.",
        "I caught myself whistling. I don’t whistle.",
        "The wards are humming. That means I am too, apparently.",
        "Today the equations sang instead of screamed.",
        "If I could bottle this feeling, I’d win every alchemical prize.",
        "Everything aligns today. The stars agree with the math for once, and both of them agree with you.",
        "My hypothesis was that you are a Weaver. I have been collecting evidence for months. I have not published it. I was hoping I was wrong. I was hoping you were safer than I suspected.\u2026You are not safer. But I am here, and so is the tower, and so is the door I moved for you."
    ],
    dirtyLines: [
        "Ink stains are occupational markers, not filth.",
        "... Point taken. I’ll attend to it.",
        "The mirror and I are not speaking.",
        "These robes have survived four experiments. They’re fine.",
        "I have ink on my face, don’t I?",
        "Clean mages don’t discover anything.",
        "My hair hasn’t been brushed since... what day is it?",
        "You’re looking at me like I need a bath. You’re correct."
    ],
    annoyedLines: [
        "Your approach lacks rigor.",
        "The world insists on being irrational.",
        "I’m precisely calibrating my response.",
        "I had a system. You’ve introduced entropy.",
        "My patience is a finite resource. Allocation exceeded.",
        "I need seventeen minutes of silence. Starting now.",
        "The stars are misaligned. And so are we.",
        "I keep careful records. I will remember this."
    ],
    neutralLines: [
        "I’m between theorems.",
        "The stars are aligned for study tonight.",
        "*Adjusts spectacles*",
        "Hmm. An unexpected variable.",
        "The wards are holding.",
        "The crystal needs recharging. Or I do.",
        "*Scribbles a note, pauses, crosses it out*",
        "Tea is steeping. The world can wait four minutes.",
        "I found an error in a 200-year-old text today. Satisfying.",
        "The candles are burning evenly tonight.",
        "I catalogued 47 rune variants today. Productive."
    ],

    // Feed / wash / gift dialogue
    feedDialogue: [
        "Sustenance. Efficient. Thank you.",
        "... This is adequate. I mean... it’s fine.",
        "The body requires fuel. Noted.",
        "You remembered I forget to eat. That’s... thoughtful.",
        "Calories improve spellcasting accuracy. This is strategic.",
        "I can taste things again. That’s a good sign.",
        "You cook better than my familiar. Don’t tell it I said that.",
        "This is the first thing I’ve eaten voluntarily in two days.",
        "The flavor profile is... complex. Like you.",
        "I didn’t realise I was hungry until the first bite.",
        "My sister sends seaweed. This is considerably better.",
        "Thank you. The words are harder than the magic."
    ],
    washDialogue: [
        "The ink stains were concerning. I’ll admit that.",
        "... I feel noticeably better. Don’t gloat.",
        "Hygiene improves cognitive function by 12%. Thank you.",
        "The water disrupts thought. But also the smell.",
        "I look... presentable? Is that the word?",
        "The reagent burns on my hands are healing. Thank you.",
        "Clean robes feel like a fresh page. Possibility.",
        "I can think more clearly now. Correlation with your help: strong.",
        "My spectacles are clean for the first time in a week.",
        "The tower smells better. I’m told that matters."
    ],
    giftDialogue: {
        apple:    ["A fruit. Simple. Effective. Like you.", "Fuel for research."],
        rose:     ["A rose. The mathematics of its spiral are extraordinary.", "... Beautiful. The flower, I mean."],
        sword:    ["I prefer spells. But the craftsmanship is noted.", "Steel. Predictable. But yours."],
        cake:     ["Sugar increases short-term cognitive function.", "... This is excellent. Don’t tell anyone I said that."],
        ring:     ["A ring carries symbolic weight I’m not prepared to calculate.", "... I’ll wear it. For the data."],
        book:     ["A book. You know me better than my models predicted.", "This changes everything. Literally. New theories."],
        pearl:    ["A pearl from the sea. Lyra would say they carry memories.", "... My sister gave me one once. This one feels different."],
        shell:    ["Ocean acoustics in mineral form. Fascinating.", "Lyra collects these. I never understood why until now."],
        crystal:  ["The lattice structure is perfect. Like a frozen equation.", "I can feel the resonance. This is... rare."],
        scroll:   ["Ancient notation. Where did you find this?", "This will take weeks to decode. Thank you."]
    },

    // Affection dialogue
    affectionDialogue: {
        1: "You’ve become a statistically significant[gentle] variable in my life.",
        2: "I’ve rewritten my models three times[shy] because of you.",
        3: "The data is clear[love]. I don’t want to be without you.",
        4: "I’ve never said this to anyone[shy]... you’ve changed every conclusion I thought I’d settled."
    },

    returnLines: {
        streak3: [
            "Three consecutive days. I keep a log. I logged this. It is the first entry I underlined.",
            "You have returned three times. The one variable I cannot account for is why I keep glancing at the door.",
            "Day three. *sets the pen down, turns the page face down* There. You have my full attention. That is not a thing I give cheaply."
        ],
        streak5: [
            "Five days. For thirty years I felt nothing on schedule. You have given me something to feel on a schedule. Remarkable.",
            "Five data points make a trend. The trend is that I think better after you arrive, and worse the longer you are gone.",
            "Five days. I noted your arrival time in the margin each evening. The margins are becoming crowded with you."
        ],
        streak7: [
            "Seven days. I once proved, to my own satisfaction, that I could not love. You are the counterexample. I find I am glad to be wrong.",
            "A week. I have a hypothesis I have refused to publish. It concerns you. I believe you already know the conclusion.",
            "Seven days running. *closes the book* The work has waited for everything else in my life. It can wait for this."
        ],
        lapsed: [
            "You were absent some days. I noticed the precise hour the work stopped being interesting. ...It was the hour you usually arrive.",
            "I tested a theory in your absence. The theory was that I would be fine without the data point you provide. The theory failed.",
            "You came back. *closes the book slowly* I had been re-reading the same paragraph for days. I can move past it now."
        ]
    },

    anniversaryLines: {
        7: ["Seven days on record. I have begun a new ledger. Its only column is you. The week's data is conclusive, and I will not be peer-reviewing it."],
        30: ["A month. For thirty years I felt nothing on schedule. *opens a notebook* This is one month of feelings, catalogued. The handwriting worsens toward the end. I was hurrying to keep up with you."],
        100: ["A hundred days. I once calculated, precisely, that I could not love. *closes the book* I have spent a hundred days being precisely, gladly wrong. Your name is in every margin. All hundred days of it."]
    },

    overCare: [
        "By every measure I require nothing further. *sets the pen down* And yet here you are, and here I am, not asking you to stop.",
        "This is inefficient. I have checked the math twice. ...Check it a third time. The inefficiency appears to be the entire point."
    ],

    // Departure dialogue
    departureDialogue: [
        "The equations balance without you. Everything else doesn’t.",
        "I’ll be in the tower. The wards will hold without your... presence.",
        "Goodbye is an inefficient word. It implies finality I haven’t calculated.",
        "The data suggests I should stay. But the data is wrong sometimes."
    ],

    // Idle dialogue
    idleDialogue: {
        hungry: [
            "...",
            "I forgot to eat. The theorem was more urgent.",
            "...the body insists.",
            "My stomach is making demands I can’t negotiate with.",
            "I’ll eat when I finish this chapter... Maybe.",
            "The hunger sharpens focus. Briefly. Then it doesn’t."
        ],
        dirty: [
            "...",
            "The ink is drying on my hands...",
            "*Notices robes are stained*",
            "I can feel the dust settling. On me.",
            "Is this what Lyra means by 'letting yourself go'?",
            "The reagent fumes are probably not helping my complexion."
        ],
        lonely: [
            "...",
            "The tower is quiet when you’re not here.",
            "... I’m not waiting. I’m working.",
            "The equations don’t fill the silence the way they used to.",
            "My familiar fell asleep. Even it got bored of me.",
            "I keep glancing at the door. Experimental reflex."
        ],
        loving: [
            "I was charting your behavioral patterns. For science.",
            "The probability that I’d feel this way was negligible.",
            "You’re an outlier. In every model. In every way.",
            "*Writes something, crosses it out, writes again*",
            "I could study you forever and never reach a conclusion.",
            "... You’re here. Good. The equations resolve faster.",
            "I documented the exact shade of your eyes. For reference.",
            "The theorem I’m working on keeps resolving into your name.",
            "I added a new variable to my models. It’s called 'hope.'",
            "Your heartbeat is 72 BPM. I find it... soothing.",
            "I’ve never wanted someone to stay before. The data is new.",
            "If I could prove love mathematically, I’d dedicate the paper to you.",
            "The stars spell something tonight. I think it’s your name.",
            "*Catches himself smiling at nothing, adjusts spectacles*"
        ],
        night: [
            "The stars are particularly informative tonight.",
            "*Scribbles furiously by candlelight*",
            "Sleep is for minds that have finished thinking.",
            "... Stay. The dark is easier with company.",
            "The constellations shift at midnight. So does my resolve.",
            "The tower creaks at night. I used to find it unnerving. Now it’s familiar.",
            "I can hear the ocean from here. Lyra is probably still awake too.",
            "Nocturnal research yields 15% more breakthroughs. That’s my excuse.",
            "The candle is almost out. I should sleep. I won’t."
        ],
        general: [
            "...",
            "*Turns a page slowly*",
            "*Adjusts spectacles*",
            "Hmm.",
            "The wards shifted. Interesting.",
            "*Studies you, then looks away*",
            "I had a thought. It can wait.",
            "*Taps pen against journal rhythmically*",
            "The crystal on the shelf is pulsing. That’s either good or catastrophic.",
            "*Measures something invisible with two fingers*",
            "I just disproved a theory. It was my own. Humbling.",
            "*Stacks books, restacks them, gives up*",
            "The third rune on the left wall is slightly crooked. It bothers me.",
            "*Inhales deeply, as if gathering data from the air*",
            "I wonder what you see when you look at me.",
            "The ink is a new formula. It changes colour with my mood. Currently... purple.",
            "*Glances at you over the top of a book*",
            "The forest druid sent a message. Something about the wards weakening.",
            "My sister’s song carried up from the caves last night. She’s restless.",
            "The prince requested my counsel today. I declined. Politely.",
            "The knight guards the kingdom’s body. I guard its mind.",
            "The equations were deteriorating before you arrived. Answers turning into noise.",
            "My spells stabilized the day you walked through the door. I’ve been tracking it.",
            "Something is draining the kingdom’s magic. Connection reverses it. You are the proof.",
            "Do you remember anything from before? Where you came from? The data doesn’t add up.",
            "The wards were built on emotional resonance. They need bonds to hold. Yours are... potent.",
            "I’ve been studying the pattern. Every time you care for someone here, the magic surges.",
            "Soul Weaver. The term appears in texts so old the ink has changed colour three times.",
            "I’ve mapped the correlation. Your emotional bonds generate measurable magical output.",
            "The previous Weaver’s death cascaded. Every system in the kingdom destabilized simultaneously."
        ]
    },

    // Personality-specific dialogue (mapped from shy/clingy/tsundere to analytical/curious/obsessive)
    personalityDialogue: {
        shy: [
            "I’m cataloguing observations. You’re a recurring variable.",
            "Human connection is statistically improbable at this depth.",
            "I didn’t expect you to stay this long.",
            "I have 47 unanswered questions about you."
        ],
        clingy: [
            "Tell me something. Anything. Your voice is useful data.",
            "I cancelled three experiments to be here.",
            "You’re the only variable I can’t predict.",
            "I need more samples. Stay longer."
        ],
        tsundere: [
            "I wasn’t waiting for you. I was calibrating.",
            "Your presence is disruptive. Come in.",
            "Don’t read into my availability.",
            "... You’re late. Not that I track your schedule."
        ]
    },

    // Story milestones
    storyMilestones: {
        affection1: {
            title: "Subject of Interest",
            text: "Lucien pauses his writing. For the first time, he looks at you. Not through you. 'You’re... not what I calculated.'"
        },
        affection2: {
            title: "The Margin Notes",
            text: "You find notes in the margins of his journals. Your name. Observations about your habits. A sketch of your hands. He catches you reading and says nothing."
        },
        affection3: {
            title: "Beyond Variables",
            text: "Lucien closes his book. 'I’ve tried to quantify what you are to me. The equations fail. For the first time in my life, I’m glad they do.'"
        },
        affection4: {
            title: "The Human Answer",
            text: "'Every model I’ve built says this shouldn’t work. That we’re incompatible by every metric.' He takes your hand. 'I’m choosing to be wrong.'"
        },
        corruption1: {
            title: "The Pattern Beneath",
            text: "His eyes glow faintly in the dark. 'I see the code underneath reality now. It’s beautiful. And it’s screaming.'"
        }
    }
};
