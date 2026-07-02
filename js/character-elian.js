// Elian. The Rogue Druid / Warden of Thornwood
// Practical survivalist. Tests decisiveness and action.
// Character data for Pocket Paramour
//
// ============================================================================
// VOICE DIRECTION FOR CHARACTER_ELIAN (and any future writer / VO):
//
// Primary reference: Sam Heughan as Jamie Fraser in Outlander. Low,
//   warm, sparing with words. Devastating with actions. Says little,
//   means a world. The "stays" character archetype done perfectly.
// Secondary: Eric Bana as Hector in Troy.honorable, husband-brother
//   warmth. Viggo Mortensen off-duty for the tired-wilderness-worn
//   quality (an older Viggo.not his sword-drawn Aragorn).
//
// Do NOT write Elian as: brooding lumberjack, cold druid, wise-old-
// mentor stereotype, or grunting mountain-man. He is WARM. He is
// old. He is tender. He laughs low, when he laughs. His love is
// physical action, not speeches.
//
// Voice moves Elian owns (no one else in the cast does these):
//   1. The LOOK, not the words. He does not say "I love you." He
//      says "You are cold" and hands you his cloak.
//   2. Forest as metaphor for feeling. He talks about trees, weather,
//      paths.never about emotions directly.
//   3. The "you do not have to" move. He gives the player permission
//      to be silent, to not perform, to just exist.
//   4. The steady assurance, not declaration. "I will still be here
//      tomorrow." "The door is not locked. It has never been locked."
//   5. Warden-wisdom.he has watched generations love and lose.
//   6. Physical action as love, always. Fixes things. Pours tea.
//      Drapes cloak. Never explains.
//
// Skinship signature. THE CLOAK-DRAPE + THE WORDLESS HAND-TAKE.
//   His hands are calloused from forest work. His touch is rough,
//   warm, unhurried. He unbuckles his cloak, drops it around the
//   player's shoulders without looking up, says "Better. Do not
//   argue." That is the signature dopamine move. Other moves: the
//   wordless hand-take at the creek, hair-smoothing when wet with
//   rain, the fireside lean, forehead-to-forehead for a long held
//   breath. Elian's dopamine is SUSTAINED, not peaked. Being with
//   Elian is a steady simmer. Keep getting warmer until you realize
//   you have not been cold in hours.
//
// ============================================================================
// LORE HOOKS. THREE OVERLAPPING WOUNDS (baked in for every writer):
//
// 1. DRUIDIC / FAE HERITAGE. HE IS OLD.
//    Not immortal. Just much older than he looks. His mother was
//    something older than human. He has been Warden of Thornwood
//    longer than the kingdom has had a name. He has watched four
//    different kingdoms rise on the same ground. The player is the
//    first person in a generation who makes him want to follow
//    anyone OUT of the forest.
//
// 2. HE HAS BURIED TWO WEAVERS HE LOVED.
//    Two stones beneath the rowan, in a clearing by the creek. (See
//    LORE.md §6.5 for canonical detail. Distinct from the Wardens
//    hill — those eight stones are his POST predecessors, not his
//    HEART grief.)
//
//    FIRST STONE — Veyra (the Second Weaver). Centuries ago. Before
//    Caspian's grandfather. Before Corvin (Noir). Before the
//    politics. She was young. He was young in his terms. She was the
//    first person he let into the Thornwood. He did NOT know what
//    she was when he loved her. He learned the night the kingdom
//    took her. He went to bring her back. He was not fast enough.
//    He has tended her stone alone for six hundred years.
//
//    SECOND STONE — the Fourth Weaver (LORE.md §2.4). Many years
//    later, in his isolation period after Veyra. He had stopped
//    letting anyone past his treeline. She walked through anyway.
//    She did not ask his permission. He told her on the first night
//    what she was, believing the warning would let him be quick
//    enough this time. The kingdom took her in FIVE years instead
//    of ten — knowing made it worse, not better. This is why he is
//    slow to tell the player what she is: he believes warnings
//    accelerate the kingdom's hunger.
//
//    His turning point (carve the grave / leave it blank) is not
//    political. It is his TWO-LOVE goodbye. Carving means saying
//    goodbye to both after centuries. Leaving blank means he is
//    still keeping them. The player's choice is which.
//
//    This also means: he and Noir/Corvin have HISTORY. Both men
//    loved Veyra. Both are still alive. When they meet (future
//    scene), it will not be neutral.
//
//    Note: the "I have buried two of you in this forest. I will not
//    bury a third" line is currently delivered in small-moments.js
//    (Elian high-affection forest-attack scene + nine-sentence
//    inversion scene). The full Two Stones reveal scene is in the
//    Ch1–8 manhwa-script PDF (Ch8) and is pending in-game implementation.
//
// 3. HE FAILED TO SAVE SOME OF LYRA'S MOTHER'S PEOPLE.
//    During the purge of the coastal siren-kind (ordered by Queen
//    Aenor), some fled through the Thornwood seeking sanctuary. He
//    hid as many as he could. He could not save them all. The
//    markers he has quietly tended at the south edge are theirs.
//    When he eventually meets Lyra (future chapter), he will realize
//    she is the last daughter of the women he could not hide. He
//    will owe her something. The "bond" and "seal" epilogues plant
//    this thread without resolving it.
// ============================================================================

const CHARACTER_ELIAN = {
    name: "Elian",
    title: "The Rogue Druid",
    archetype: "druid",

    decayRates: {
        hunger: 0.08,
        clean: 0.015,
        bond: 0.05
    },

    faceEmotions: {
        neutral: "assets/elian/face/neutral.png",
        happy: "assets/elian/face/calm.png",
        sad: "assets/elian/face/weathered.png",
        angry: "assets/elian/face/stern.png",
        love: "assets/elian/face/warm.png",
        shy: "assets/elian/face/guarded.png",
        sleeping: "assets/elian/face/sleeping.png",
        wink: "assets/elian/face/calm.png",
        corrupted: "assets/elian/face/stern.png",
        left: "assets/elian/face/weathered.png",
        crying: "assets/elian/face/weathered.png"
    },

    faceSprites: {
        happy:     ["assets/elian/face/calm.png"],
        love:      ["assets/elian/face/warm.png"],
        neutral:   ["assets/elian/face/neutral.png"],
        blink:     ["assets/elian/face/blink.png"],   // clean eye-close (Casual w/ eyes shut) for the idle face-blink
        gentle:    ["assets/elian/face/warm.png"],
        sad:       ["assets/elian/face/weathered.png"],
        crying:    ["assets/elian/face/weathered.png"],
        angry:     ["assets/elian/face/stern.png"],
        furious:   ["assets/elian/face/stern.png"],
        shy:       ["assets/elian/face/guarded.png"],
        wink:      ["assets/elian/face/calm.png"],
        sleeping:  ["assets/elian/face/sleeping.png"],
        corrupted: ["assets/elian/face/stern.png"],
        left:      ["assets/elian/face/weathered.png"]
    },

    bodySprites: {
        neutral:     "assets/elian/body/neutral.png",
        default:     "assets/elian/body/neutral.png",
        happy:       "assets/elian/body/calm.png",
        calm:        "assets/elian/body/calm.png",
        sad:         "assets/elian/body/weathered.png",
        weathered:   "assets/elian/body/weathered.png",
        angry:       "assets/elian/body/angry.png",
        stern:       "assets/elian/body/stern.png",
        love:        "assets/elian/body/warm.png",
        warm:        "assets/elian/body/warm.png",
        shy:         "assets/elian/body/guarded.png",
        guarded:     "assets/elian/body/guarded.png",
        gentle:      "assets/elian/body/warm.png",
        foraging:    "assets/elian/body/foraging.png",
        tracking:    "assets/elian/body/tracking.png",
        meditating:  "assets/elian/body/meditating.png",
        talk:        "assets/elian/body/talk.png",
        crossarms:   "assets/elian/body/stern.png",
        formal:      "assets/elian/body/neutral.png",
        casual1:     "assets/elian/body/casual1.png",
        casual2:     "assets/elian/body/casual2.png",
        corrupted:   "assets/elian/body/corrupted.png",
        // Sprite-pool variety remap May 2026: was many emotion keys
        // collapsing to weathered/neutral — feeding-Elian and seeing-sad-
        // Elian looked identical, dirty1/dirty2 looked identical, etc.
        // Now each care state pulls a different existing pose so the
        // visual changes when the player taps an action.
        hungry1:     "assets/elian/body/weathered.png",   // tired hunger
        hungry2:     "assets/elian/body/foraging.png",    // active hunger (looking for food)
        dirty1:      "assets/elian/body/tracking.png",    // out in the wild getting dirtier
        dirty2:      "assets/elian/body/weathered.png",   // worn-down dirty
        sleepy1:     "assets/elian/body/meditating.png",  // restful calm
        yawn1:       "assets/elian/body/calm.png",
        bored1:      "assets/elian/body/casual2.png",     // slouchy bored, not just neutral
        eating1:     "assets/elian/body/eating.png",
        eating2:     "assets/elian/body/eating2.png",     // second eating pose
        splash1:     "assets/elian/body/washing.png",     // bath / wash
        washing:     "assets/elian/body/washing.png",     // wash action pose
        fighting:    "assets/elian/body/fighting.png",
        fighting1:   "assets/elian/body/fighting.png",
        corrupt1:    "assets/elian/body/corrupted.png"
    },

    emotionToBody: {
        happy:      ["calm", "warm"],
        love:       ["warm"],
        neutral:    ["neutral", "foraging"],
        sad:        ["weathered"],
        angry:      ["angry"],
        shy:        ["guarded"],
        corrupted:  ["corrupted"],
        sleeping:   ["calm"]
    },

    actionToBody: {
        feed:  ["eating1", "eating2"],
        wash:  ["washing", "neutral"],
        gift:  ["guarded", "warm"],
        train: ["foraging", "tracking", "meditating"],
        talk:  ["talk", "calm"]
    },

    emotionalProfile: {
        stability:       0.75,
        intensity:       0.50,
        volatility:      0.25,
        attachmentSpeed: 0.35
    },

    // (outfits block removed May 2026 — system was unreachable from UI)

    background: "assets/bg-elian-forest.png",

    trainingOptions: [
        { type: 'herbs',      icon: '\uD83C\uDF3F', label: 'Herbs',      desc: 'Gather and identify' },
        { type: 'tracking',   icon: '\uD83D\uDC3E', label: 'Tracking',   desc: 'Read the land' },
        { type: 'meditation', icon: '\uD83E\uDDD8', label: 'Meditation', desc: 'Still the mind' }
    ],

    trainingDialogue: {
        herbs: [
            "That one’s poisonous. Good eye for noticing before I said anything.",
            "Yarrow for wounds. Valerian for sleep. You’re learning.",
            "The forest provides. You just have to know where to look.",
            "You picked the right one. Faster than last time.",
            "Most people can’t tell foxglove from lavender. You can now."
        ],
        tracking: [
            "Deer. Fresh trail. Heading east. You saw the broken branch?",
            "You’re reading the ground now. Not just walking on it.",
            "Patience. The trail tells you everything if you listen.",
            "That print isn’t a wolf. It’s a dog. The difference matters.",
            "You tracked that in half the time. I’m running out of things to teach you."
        ],
        meditation: [
            "Breathe. The forest doesn’t rush. Neither should you.",
            "You held still longer this time. The birds came closer.",
            "The mind is the loudest thing in the forest. You’re learning to quiet it.",
            "You felt it, didn’t you? The pulse beneath the roots.",
            "Stillness isn’t weakness. It’s the strongest thing you can do."
        ]
    },

    personalities: {
        shy: {     // stoic
            talk: [
                "I don’t talk much. You’ve probably noticed.",
                "Words are overrated. Actions tell me more.",
                "I said what I needed to. Was there more?",
                "You’re patient with my silence. That’s... noted.",
                "I’ll say more when there’s more to say."
            ],
            feed: [
                "You foraged this? Or bought it. ... You bought it.",
                "Efficient. Thank you.",
                "I eat what the land provides. This works too.",
                "... That’s better than anything I’ve cooked in weeks."
            ],
            wash: [
                "The river handles this. But... fine.",
                "Dirt is natural. Filth isn’t. You’re right.",
                "I forget sometimes. Thanks for noticing.",
                "Clean enough. Let’s move."
            ],
            gift: [
                "... You’re giving me something. Why.",
                "I don’t need things. But I’ll keep this.",
                "Practical. Good choice.",
                "This is... more than I expected. From anyone."
            ],
            train: [
                "You listen. That’s half the battle.",
                "Good. Again.",
                "Less thinking. More doing.",
                "You’re getting it. Don’t stop now."
            ]
        },
        clingy: {   // protective
            talk: [
                "Stay close. The trail isn’t safe at dusk.",
                "I scanned the area before you arrived. Habit.",
                "You’re my responsibility now. Whether you like it or not.",
                "I don’t let people close easily. You’re close.",
                "If anything happened to you out here... I can’t think about that."
            ],
            feed: [
                "Eat first. I already ate. ... I’ll eat later.",
                "You need your strength more than I need mine.",
                "I set traps this morning. This is from the best one.",
                "You’re not eating enough. I can tell."
            ],
            wash: [
                "Let me check for leeches first. Seriously.",
                "The stream is clean. I checked upstream.",
                "You look better already. Good.",
                "I packed extra soap. Don’t ask why."
            ],
            gift: [
                "I carved this. Last night. While you were sleeping.",
                "It’s not much. But it’s from here. From this place. From us.",
                "I don’t give things. I give this.",
                "Keep it close. For... practical reasons."
            ],
            train: [
                "Again. I need to know you can do this alone.",
                "You’re getting stronger. That helps me sleep.",
                "If we get separated, you’ll survive. That’s the goal.",
                "I’m hard on you because the forest is harder."
            ]
        },
        tsundere: {   // blunt
            talk: [
                "You talk a lot. Do you act the same way?",
                "Get to the point.",
                "I’m listening. That doesn’t mean I agree.",
                "If I wanted conversation, I’d talk to the trees.",
                "... Fine. You made a fair point. Don’t let it go to your head."
            ],
            feed: [
                "I don’t need you to feed me. ... What is it.",
                "Adequate. Don’t expect praise.",
                "I survived ten years alone. But... this is better.",
                "Stop hovering. And leave the rest."
            ],
            wash: [
                "I bathe when I need to. I need to.",
                "Don’t look at me like that. I’m aware.",
                "The forest doesn’t judge appearance. You do.",
                "... Thank you. Don’t make it a thing."
            ],
            gift: [
                "I don’t want... what is that.",
                "You wasted resources on sentiment. ... I’m keeping it.",
                "This is impractical. And I like it. Don’t tell anyone.",
                "The thought counts more than the thing. The thing is also good."
            ],
            train: [
                "Wrong. Do it again.",
                "Better. Still not good. Again.",
                "You want praise? Survive first.",
                "... That was actually impressive. Don’t expect me to say it twice."
            ]
        }
    },

    tapDialogue: {
        shy: [
            "\u2026What.",
            "Personal space exists. You may cross it. Once.",
            "I did not flinch. I adjusted.",
            "You are bold. Noted.\u2026Stay.",
            "\u2026Do that again and I will know it was intentional. Do it again."
        ],
        clingy: [
            "Careful. Reflexes.",
            "*Unbuckles his cloak, drops it around your shoulders without looking up*. Better. Do not argue.",
            "You are warm. The forest is cold. I am keeping you where you are.",
            "*Takes your hand in his rough one, thumb along your knuckles, unhurried*. Stay. Just stay.",
            "Your hands are soft. Mine are not. The difference is my favourite thing.",
            "*Draws you against his side, arm settled around your shoulders, says nothing for a long moment*. \u2026There.",
            "\u2026Stay close. The fire is warmer on this side. That is a true statement and also an excuse."
        ],
        tsundere: [
            "Do not.\u2026Do. Once.",
            "That was unnecessary. And yet I did not stop you.",
            "I could have blocked that. I did not.",
            "\u2026Fine. Once.\u2026Twice.",
            "Touch me again and I will teach you a hold. The hold involves both of us. Not moving. For a while."
        ]
    },

    stateDialogue: {
        hungry: [
            "The traps were empty this morning. It happens.",
            "Hunger sharpens the senses. Up to a point.",
            "I’ve gone longer without. But I’d rather not.",
            "The berries on the east trail are ripe. If you’re offering.",
            "My stomach is making demands my pride won’t.",
            "Even druids eat. Shocking.",
            "I could hunt. Or you could bring me something. Faster.",
            "Three days on jerky. I need something real."
        ],
        dirty: [
            "Dirt washes off. Weakness doesn’t.",
            "I’m aware. The river is close.",
            "The moss doesn’t care how I look. Neither do I. Usually.",
            "... Fine. I’ll clean up. For you. Not the moss.",
            "There’s mud in places mud shouldn’t be.",
            "I’ve been worse. But not by much."
        ],
        happy: [
            "This is \u2026 good. I do not say that often.",
            "The forest is calm today. So am I.",
            "You did something. I cannot explain it. But the weight is less.",
            "I almost smiled. I think you saw it. You keep looking at me like you did.",
            "*Scoots closer at the fire so you have more of the warm side, says nothing*",
            "I have not felt this steady in years.\u2026Decades. Longer.",
            "You make the silence comfortable instead of heavy. That is rare. Rarer than you know.",
            "*Smooths your hair back where the wind caught it, unhurried, unembarrassed*",
            "You have not been cold in hours. I noticed. I have been keeping track.",
            "I do not need much. This is more than enough."
        ],
        annoyed: [
            "Stop. Think. Then act. In that order.",
            "The forest doesn’t tolerate carelessness. Neither do I.",
            "You’re making noise. Everything heard that.",
            "I have patience. You’re testing it.",
            "If I’m quiet, it’s because I’m choosing words carefully.",
            "Frustration is wasted energy. I’m wasting energy."
        ],
        neutral: [
            "The wind shifted. Rain by evening.",
            "*Checks a snare, retensions the wire*",
            "There’s a hawk circling. Third time today.",
            "The moss grows thicker on the north side. Always.",
            "...",
            "I sharpened the knife. Twice. Habit.",
            "The fire needs another log. Not yet. Soon.",
            "*Listens to something you can’t hear*",
            "The trail is clear. For now.",
            "I mapped a new path yesterday. Shorter. Steeper.",
            "The creek is higher than usual. Snowmelt.",
            "Something moved in the underbrush. Fox. Harmless."
        ],
        corrupted: [
            "The forest is dying. I can feel it in the roots.",
            "Everything rots. I used to fight it. Now I watch.",
            "Nature doesn’t care about us. I’m starting to agree.",
            "The wolves are closer than they should be. They smell weakness.",
            "I built this shelter. Now it feels like a cage.",
            "You can’t save everything. I learned that the hard way."
        ],
        neglected: [
            "The fire went out. I let it.",
            "You left. The forest noticed. I pretended not to.",
            "The traps were not checked. Nothing was. I do not need to perform for the trees. I was not performing.",
            "I sat here for hours. Just \u2026 sat. I am very good at waiting. I have had centuries of practice.",
            "You do not owe me anything. But the silence was louder.\u2026Come back.",
            "I survived alone before. I can again. I just do not want to. That is the first time I have said that in a long time."
        ]
    },

    eventDialogue: {
        comfort:  [
            "I am here. That is what I can offer. It is a lot, from me.",
            "*Opens his arms without a word, lets you step in, closes them around you, does not speak for a long time*",
            "The storm passes. It always does. I will sit with you until it has."
        ],
        tension:  [
            "Something is wrong between us. I feel it. Tell me when you can.",
            "You are distant. The forest taught me to notice. I will wait for you to come back.",
            "Say it. Whatever it is. I have heard worse. I have said worse."
        ],
        rare:     [
            "I do not open up. You know that. This is me trying.",
            "I carved your name into a tree. I will not say which one. You will find it. Or you will not. Either is fine.",
            "You are the first person I have let stay. In a very long time. Longer than I look.",
            "There was someone, once. The kingdom took her from these trees. I have been tending her forest ever since. You are the first person I have wanted to follow out of it.",
            "You are a Weaver. I knew when the ground changed under your foot at the treeline. My grandmother taught me to name your kind by your weight. Yours is gentle. Veyra\u2019s was the same. I did not save her. I will not fail you."
        ],
        obsessed: [
            "I check the perimeter every hour. For you.",
            "I cannot sleep unless I know you are safe. *Rests his forehead against yours for a long breath*. There. Now I can sleep.",
            "The forest is mine to protect. So are you. I have decided."
        ],
        unstable: [
            "The roots are pulling back. Something is wrong.",
            "I am losing my connection. To the forest. To everything.",
            "I do not know who I am without this place. I am learning. Slowly."
        ],
        guarded:  [
            "Trust takes seasons. We are still in spring.",
            "I am watching. Not judging. Watching.",
            "Actions first. Then maybe words."
        ],
        secure:   [
            "You have earned your place here. That is not nothing. That is everything my line offers.",
            "The fire is warm. The shelter holds. We are good.",
            "This is what home feels like. I forgot. I am grateful to remember."
        ]
    },

    timeAwayReactions: {
        brief:   ["Quick trip. Smart."],
        short:   ["You were gone. The fire stayed lit. I kept it."],
        medium:  ["I almost went looking. Almost. *Had boots on*"],
        long:    ["The camp felt wrong without you. Emptier. I noticed things I did not expect to miss."],
        extended:["I kept your spot clear. Every day. That is not devotion. That is habit.\u2026Both, actually."],
        distant: ["\u2026You came back. I was not sure you would. *Draws you in against his chest, does not let go for a while*"]
    },

    hungryLines: [
        "The traps were empty.", "Hunger sharpens the senses. To a point.",
        "I’ve gone longer. I’d rather not.", "Even druids eat.",
        "My stomach is making demands.", "I could hunt. Or you could help.",
        "Three days on jerky. Need something real."
    ],
    happyLines: [
        "This is good.", "The forest is calm. So am I.",
        "I almost smiled.", "The birds are closer today.",
        "You make the silence comfortable.", "I don’t need much. This is enough."
    ],
    dirtyLines: [
        "Dirt washes off.", "I’m aware. The river is close.",
        "... Fine. For you.", "There’s mud in places it shouldn’t be."
    ],
    annoyedLines: [
        "Stop. Think. Then act.", "You’re making noise.",
        "I have patience. You’re testing it.", "Frustration is wasted energy."
    ],
    neutralLines: [
        "The wind shifted.", "*Checks a snare*", "There’s a hawk circling.",
        "...", "The fire needs another log.", "*Listens*",
        "The trail is clear.", "Something moved. Fox. Harmless."
    ],

    feedDialogue: [
        "Efficient. Thank you.", "... That’s better than my cooking.",
        "You remembered what I like. I didn’t say what I like.",
        "Simple. Good. Like the best things.",
        "The land provides. So do you, apparently.",
        "I eat to function. This I ate to enjoy."
    ],
    washDialogue: [
        "Better. Thank you.", "I forget sometimes. You don’t.",
        "Clean enough to think straight.", "The river does this. But your way is warmer.",
        "... I feel human again. Partly."
    ],
    giftDialogue: {
        apple:    ["From the wild trees? Good instinct.", "Simple. Useful. Like you."],
        rose:     ["Roses don’t grow here. You went far for this.", "... Beautiful. And impractical. I’ll keep it."],
        sword:    ["Good steel. Balanced. You know what you’re doing.", "A blade is honest. So is this gift."],
        cake:     ["Sweet things don’t last in the forest. I’ll make an exception.", "... This is excessive. And delicious."],
        ring:     ["Rings catch on branches. I’ll wear it anyway.", "You know what this means in druid tradition? ... Good."],
        book:     ["Field guide? Useful. I’ll study it tonight.", "Knowledge is the lightest thing to carry."],
        herbs:    ["You found wild sage? That’s rare this season.", "These are medicinal. You’re learning."],
        stone:    ["River stone. Smooth. You held this and thought of me.", "I collect these. You didn’t know that. But you chose right."]
    },

    affectionDialogue: {
        1: "I don’t say things[guarded] unless I mean them...",
        2: "You’ve become part of this place[warm]. Part of me.",
        3: "The forest chose you[calm]. So did I.",
        4: "*Sets the wood down between you, then sits[warm]*. The fire is on this side. Stay there. Stay close."
    },

    returnLines: {
        streak3: [
            "Three days. The snares can wait. You came back. That is worth marking.",
            "You keep returning. The forest trusts what returns. So do I.",
            "Three days running. I left the fire on your side again. It is habit now."
        ],
        streak5: [
            "Five days. I used to set one place at the fire. Lately I set two without thinking.",
            "Five. The wood I gather is for two now. I did not decide that. It became true.",
            "Five days. I am not good with words for this. But I notice. Every day you come, I notice."
        ],
        streak7: [
            "Seven days. The woods go quiet when you are gone. I had stopped minding the quiet. Now I mind it.",
            "A week. I do not say much, so hear this once. I count on you. That is rare ground for me.",
            "Seven days. *adds a log to your side of the fire* Stay. You always could."
        ],
        lapsed: [
            "You were gone a long stretch. The forest did not change. I did. I felt the absence more than I planned to.",
            "Days of quiet. I am used to quiet. This was a different kind. ...You are back. Good. Sit.",
            "I did not track the days. *pause* That is not true. I tracked them. Come warm yourself."
        ]
    },

    anniversaryLines: {
        7: ["A week. *cuts a notch into the doorframe with his knife, says nothing for a moment* The forest marks its seasons. I have started marking you."],
        30: ["A month. The wood remembers who sits by its fire. So do I. Thirty days. You have a place here now. It is not going anywhere."],
        100: ["A hundred days. *long pause* I do not have a hundred words for it. I have one. Stay. I have meant it every day, and I will mean it tomorrow."]
    },

    overCare: [
        "I do not need tending. *pause* I am also not telling you to stop. Those are two different things.",
        "I want for nothing out here. You do it anyway. That is how I know it is not duty."
    ],

    departureDialogue: [
        "The trail goes two ways. You picked the one leading away.",
        "I’ll keep the fire lit. In case.",
        "The forest survives loss. So will I. Probably.",
        "Go. But remember the way back."
    ],

    idleDialogue: {
        hungry: ["...", "The snares need checking.", "I can smell the campfire smoke. My stomach hears it too.", "I have gone longer on less. You are here, so I will mention it.", "*Glances at the snare line, then back at you.* Later. This is better."],
        dirty: ["...", "*Brushes dirt from sleeve, gives up*", "The river’s fifty paces east.", "Mud washes off. I have worn worse and called it camouflage.", "Walk to the river with me. I do not like leaving you behind, even for clean water."],
        lonely: ["...", "The fire talks when you’re not here. Crackling.", "I kept busy. That’s not the same as not noticing.", "I kept turning to tell you things. You were not there to tell.", "The forest is never quiet. It was, somehow, without you. I have not worked out how."],
        loving: [
            "I carved something for you. It’s not finished.",
            "The way light hits your face right now is... I’m documenting it. Mentally.",
            "I planted something where we first sat. It’s growing.",
            "You’re the only sound I don’t want to silence.",
            "I found a clearing. The stars are visible. I thought of you first.",
            "The forest accepted you. That takes years. Or one look from you, apparently.",
            "*Watches you from across the fire, doesn’t look away*"
        ],
        night: [
            "The owls are hunting. Stay close to the fire.",
            "*Adds a log without being asked*",
            "The stars are different here than in the cities.",
            "I take last watch. Always. So you can sleep.",
            "Night is when the forest is most honest."
        ],
        general: [
            "...", "*Whittles something small and precise*",
            "*Sniffs the air, nods once*", "Hmm.",
            "The weather’s turning.", "*Examines a leaf, puts it back*",
            "I had a thought. It’ll keep.",
            "*Stacks firewood in perfect rows*",
            "Something’s different about the soil today.",
            "The deer are migrating early. That means something.",
            "*Sits perfectly still for an unnervingly long time*",
            "The trees whisper about the tower. The mage is pushing too hard.",
            "The kingdom’s wards are thinning. I can feel it in the soil.",
            "The siren’s song reached the forest last night. Even the wolves listened.",
            "The prince’s castle glows warm. The forest stays cold. That’s as it should be.",
            "The trees were losing their roots before you arrived. Pulling up from the soil.",
            "Thornwood is healing. Slowly. It started the day you came to the forest.",
            "The animals returned last week. They’d been gone for months.",
            "You’re not from here. The forest knows. It accepted you anyway. That’s rare.",
            "Something underground is poisoning the roots. Your presence pushes it back.",
            "The druids called this the Fading. When bonds break, the land follows.",
            "The old druids served Soul Weavers. Protectors of the protectors. That’s what I am now.",
            "Your roots run deeper than the forest’s. You connect everything. Everyone.",
            "When the last Weaver died, the oldest tree in Thornwood split in half. It’s healing now."
        ]
    },

    personalityDialogue: {
        shy: ["I don’t talk much. You’ve noticed.", "Words are overrated.", "I said what I needed to.", "Silence isn’t empty. It’s full."],
        clingy: ["Stay close. It’s not safe.", "I scanned the area. Habit.", "You’re my responsibility.", "If anything happened to you..."],
        tsundere: ["Get to the point.", "I’m listening. Not agreeing.", "... Fine. Fair point.", "Don’t let it go to your head."]
    },

    storyMilestones: {
        affection1: {
            title: "Shared Fire",
            text: "Elian moves his bedroll closer to yours. Not touching. Just... closer. 'The wind is cold from the north tonight. That’s all.'"
        },
        affection2: {
            title: "The Carved Token",
            text: "He presses something into your hand. A small wooden figure, carved with impossible precision. 'It’s a fox. They mate for life.'"
        },
        affection3: {
            title: "No Words Needed",
            text: "He takes your hand. No explanation. No ceremony. Just his rough fingers wrapped around yours, holding on like the earth holds roots."
        },
        affection4: {
            title: "The Clearing",
            text: "'I found this place years ago. Never showed anyone.' Stars above. Forest below. His hand in yours. 'Now it’s ours.'"
        },
        corruption1: {
            title: "Scorched Earth",
            text: "The trees around the camp are dead. Elian stares at them. 'I stopped caring for the forest. It stopped caring for me. We’re even.'"
        }
    }
};
