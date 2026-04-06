// Elian — The Rogue Druid
// Practical survivalist. Tests decisiveness and action.
// Character data for Pocket Paramour

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
        angry:       "assets/elian/body/stern.png",
        stern:       "assets/elian/body/stern.png",
        love:        "assets/elian/body/warm.png",
        warm:        "assets/elian/body/warm.png",
        shy:         "assets/elian/body/guarded.png",
        guarded:     "assets/elian/body/guarded.png",
        gentle:      "assets/elian/body/warm.png",
        foraging:    "assets/elian/body/foraging.png",
        tracking:    "assets/elian/body/tracking.png",
        meditating:  "assets/elian/body/meditating.png",
        talk:        "assets/elian/body/neutral.png",
        crossarms:   "assets/elian/body/stern.png",
        formal:      "assets/elian/body/neutral.png",
        casual1:     "assets/elian/body/casual1.png",
        casual2:     "assets/elian/body/casual2.png",
        corrupted:   "assets/elian/body/stern.png",
        hungry1:     "assets/elian/body/weathered.png",
        hungry2:     "assets/elian/body/weathered.png",
        dirty1:      "assets/elian/body/neutral.png",
        dirty2:      "assets/elian/body/neutral.png",
        sleepy1:     "assets/elian/body/calm.png",
        yawn1:       "assets/elian/body/neutral.png",
        bored1:      "assets/elian/body/neutral.png",
        eating1:     "assets/elian/body/calm.png",
        eating2:     "assets/elian/body/neutral.png",
        splash1:     "assets/elian/body/neutral.png",
        fighting:    "assets/elian/body/stern.png",
        fighting1:   "assets/elian/body/stern.png",
        corrupt1:    "assets/elian/body/stern.png"
    },

    emotionToBody: {
        happy:      ["calm", "warm"],
        love:       ["warm"],
        neutral:    ["neutral", "foraging"],
        sad:        ["weathered"],
        angry:      ["stern"],
        shy:        ["guarded"],
        corrupted:  ["stern"],
        sleeping:   ["calm"]
    },

    actionToBody: {
        feed:  ["calm", "neutral"],
        wash:  ["neutral"],
        gift:  ["guarded", "warm"],
        train: ["foraging", "tracking", "meditating"],
        talk:  ["neutral", "calm"]
    },

    emotionalProfile: {
        stability:       0.75,
        intensity:       0.50,
        volatility:      0.25,
        attachmentSpeed: 0.35
    },

    outfits: {
        default:   { name: "Forest Garb", body: "assets/elian/body/neutral.png" },
        casual1:   { name: "Trail Worn", body: "assets/elian/body/casual1.png" },
        casual2:   { name: "Camp Rest", body: "assets/elian/body/casual2.png" },
        formal:    { name: "Elder's Robes", body: "assets/elian/body/neutral.png" },
        corrupted: { name: "Withered", body: "assets/elian/body/stern.png" }
    },

    background: "assets/bg-elian-forest.png",

    trainingOptions: [
        { type: 'herbs',      icon: '\uD83C\uDF3F', label: 'Herbs',      desc: 'Gather and identify' },
        { type: 'tracking',   icon: '\uD83D\uDC3E', label: 'Tracking',   desc: 'Read the land' },
        { type: 'meditation', icon: '\uD83E\uDDD8', label: 'Meditation', desc: 'Still the mind' }
    ],

    trainingDialogue: {
        herbs: [
            "That one's poisonous. Good eye for noticing before I said anything.",
            "Yarrow for wounds. Valerian for sleep. You're learning.",
            "The forest provides. You just have to know where to look.",
            "You picked the right one. Faster than last time.",
            "Most people can't tell foxglove from lavender. You can now."
        ],
        tracking: [
            "Deer. Two hours old. Heading east. You saw the broken branch?",
            "You're reading the ground now. Not just walking on it.",
            "Patience. The trail tells you everything if you listen.",
            "That print isn't a wolf. It's a dog. The difference matters.",
            "You tracked that in half the time. I'm running out of things to teach you."
        ],
        meditation: [
            "Breathe. The forest doesn't rush. Neither should you.",
            "You held still longer this time. The birds came closer.",
            "The mind is the loudest thing in the forest. You're learning to quiet it.",
            "You felt it, didn't you? The pulse beneath the roots.",
            "Stillness isn't weakness. It's the strongest thing you can do."
        ]
    },

    personalities: {
        shy: {     // stoic
            talk: [
                "I don't talk much. You've probably noticed.",
                "Words are overrated. Actions tell me more.",
                "I said what I needed to. Was there more?",
                "You're patient with my silence. That's... noted.",
                "I'll say more when there's more to say."
            ],
            feed: [
                "You foraged this? Or bought it. ...You bought it.",
                "Efficient. Thank you.",
                "I eat what the land provides. This works too.",
                "...That's better than anything I've cooked in weeks."
            ],
            wash: [
                "The river handles this. But... fine.",
                "Dirt is natural. Filth isn't. You're right.",
                "I forget sometimes. Thanks for noticing.",
                "Clean enough. Let's move."
            ],
            gift: [
                "...You're giving me something. Why.",
                "I don't need things. But I'll keep this.",
                "Practical. Good choice.",
                "This is... more than I expected. From anyone."
            ],
            train: [
                "You listen. That's half the battle.",
                "Good. Again.",
                "Less thinking. More doing.",
                "You're getting it. Don't stop now."
            ]
        },
        clingy: {   // protective
            talk: [
                "Stay close. The trail isn't safe at dusk.",
                "I scanned the area before you arrived. Habit.",
                "You're my responsibility now. Whether you like it or not.",
                "I don't let people close easily. You're close.",
                "If anything happened to you out here... I can't think about that."
            ],
            feed: [
                "Eat first. I already ate. ...I'll eat later.",
                "You need your strength more than I need mine.",
                "I set traps this morning. This is from the best one.",
                "You're not eating enough. I can tell."
            ],
            wash: [
                "Let me check for leeches first. Seriously.",
                "The stream is clean. I checked upstream.",
                "You look better already. Good.",
                "I packed extra soap. Don't ask why."
            ],
            gift: [
                "I carved this. Last night. While you were sleeping.",
                "It's not much. But it's from here. From this place. From us.",
                "I don't give things. I give this.",
                "Keep it close. For... practical reasons."
            ],
            train: [
                "Again. I need to know you can do this alone.",
                "You're getting stronger. That helps me sleep.",
                "If we get separated, you'll survive. That's the goal.",
                "I'm hard on you because the forest is harder."
            ]
        },
        tsundere: {   // blunt
            talk: [
                "You talk a lot. Do you act the same way?",
                "Get to the point.",
                "I'm listening. That doesn't mean I agree.",
                "If I wanted conversation, I'd talk to the trees.",
                "...Fine. You made a fair point. Don't let it go to your head."
            ],
            feed: [
                "I don't need you to feed me. ...What is it.",
                "Adequate. Don't expect praise.",
                "I survived ten years alone. But... this is better.",
                "Stop hovering. And leave the rest."
            ],
            wash: [
                "I bathe when I need to. I need to.",
                "Don't look at me like that. I'm aware.",
                "The forest doesn't judge appearance. You do.",
                "...Thank you. Don't make it a thing."
            ],
            gift: [
                "I don't want— what is that.",
                "You wasted resources on sentiment. ...I'm keeping it.",
                "This is impractical. And I like it. Don't tell anyone.",
                "The thought counts more than the thing. The thing is also good."
            ],
            train: [
                "Wrong. Do it again.",
                "Better. Still not good. Again.",
                "You want praise? Survive first.",
                "...That was actually impressive. Don't expect me to say it twice."
            ]
        }
    },

    tapDialogue: {
        shy: [
            "...What.", "Personal space exists.", "I didn't flinch. I adjusted.",
            "You're bold. Noted.", "...Do that again and I'll know it's intentional."
        ],
        clingy: [
            "Careful. Reflexes.", "You're warm. The forest is cold.",
            "I don't mind. Just... warn me.", "Your hands are soft. Mine aren't.",
            "...Stay close."
        ],
        tsundere: [
            "Don't.", "That was unnecessary.", "I could have blocked that.",
            "...Fine. Once.", "Touch me again and I'll teach you a hold."
        ]
    },

    stateDialogue: {
        hungry: [
            "The traps were empty this morning. It happens.",
            "Hunger sharpens the senses. Up to a point.",
            "I've gone longer without. But I'd rather not.",
            "The berries on the east trail are ripe. If you're offering.",
            "My stomach is making demands my pride won't.",
            "Even druids eat. Shocking.",
            "I could hunt. Or you could bring me something. Faster.",
            "Three days on jerky. I need something real."
        ],
        dirty: [
            "Dirt washes off. Weakness doesn't.",
            "I'm aware. The river is close.",
            "The moss doesn't care how I look. Neither do I. Usually.",
            "...Fine. I'll clean up. For you. Not the moss.",
            "There's mud in places mud shouldn't be.",
            "I've been worse. But not by much."
        ],
        happy: [
            "This is... good. I don't say that often.",
            "The forest is calm today. So am I.",
            "You did something. I can't explain it. But the weight is less.",
            "I almost smiled. I think you saw it.",
            "The birds are closer today. They know when it's safe.",
            "I haven't felt this steady in years.",
            "You make the silence comfortable instead of heavy.",
            "This is what the forest feels like when it's at peace.",
            "I don't need much. This is more than enough."
        ],
        annoyed: [
            "Stop. Think. Then act. In that order.",
            "The forest doesn't tolerate carelessness. Neither do I.",
            "You're making noise. Everything heard that.",
            "I have patience. You're testing it.",
            "If I'm quiet, it's because I'm choosing words carefully.",
            "Frustration is wasted energy. I'm wasting energy."
        ],
        neutral: [
            "The wind shifted. Rain by evening.",
            "*checks a snare, retensions the wire*",
            "There's a hawk circling. Third time today.",
            "The moss grows thicker on the north side. Always.",
            "...",
            "I sharpened the knife. Twice. Habit.",
            "The fire needs another log. Not yet. Soon.",
            "*listens to something you can't hear*",
            "The trail is clear. For now.",
            "I mapped a new path yesterday. Shorter. Steeper.",
            "The creek is higher than usual. Snowmelt.",
            "Something moved in the underbrush. Fox. Harmless."
        ],
        corrupted: [
            "The forest is dying. I can feel it in the roots.",
            "Everything rots. I used to fight it. Now I watch.",
            "Nature doesn't care about us. I'm starting to agree.",
            "The wolves are closer than they should be. They smell weakness.",
            "I built this shelter. Now it feels like a cage.",
            "You can't save everything. I learned that the hard way."
        ],
        neglected: [
            "The fire went out. I let it.",
            "You left. The forest noticed. I pretended not to.",
            "The traps weren't checked. Nothing was.",
            "I sat here for hours. Just... sat.",
            "You don't owe me anything. But the silence was louder.",
            "I survived alone before. I can again. I just don't want to."
        ]
    },

    eventDialogue: {
        comfort:  ["I'm here. That's what I can offer.", "Lean on me. I won't move.", "The storm passes. It always does."],
        tension:  ["Something's wrong between us. I feel it.", "You're distant. The forest taught me to notice.", "Say it. Whatever it is. Say it."],
        rare:     ["I don't open up. You know that. This is me trying.", "I carved your name into a tree. I won't say which one.", "You're the first person I've let stay."],
        obsessed: ["I check the perimeter every hour. For you.", "I can't sleep unless I know you're safe.", "The forest is mine to protect. So are you."],
        unstable: ["The roots are pulling back. Something is wrong.", "I'm losing my connection. To the forest. To everything.", "I don't know who I am without this place."],
        guarded:  ["Trust takes seasons. We're still in spring.", "I'm watching. Not judging. Watching.", "Actions first. Then maybe words."],
        secure:   ["You've earned your place here. That's not nothing.", "The fire is warm. The shelter holds. We're good.", "This is what home feels like. I forgot."]
    },

    timeAwayReactions: {
        brief:   ["Quick trip. Smart."],
        short:   ["You were gone. The fire stayed lit."],
        medium:  ["I almost went looking. Almost."],
        long:    ["The camp felt wrong without you. Emptier."],
        extended:["I kept your spot clear. Every day."],
        distant: ["...You came back. I wasn't sure you would."]
    },

    hungryLines: [
        "The traps were empty.", "Hunger sharpens the senses. To a point.",
        "I've gone longer. I'd rather not.", "Even druids eat.",
        "My stomach is making demands.", "I could hunt. Or you could help.",
        "Three days on jerky. Need something real."
    ],
    happyLines: [
        "This is good.", "The forest is calm. So am I.",
        "I almost smiled.", "The birds are closer today.",
        "You make the silence comfortable.", "I don't need much. This is enough."
    ],
    dirtyLines: [
        "Dirt washes off.", "I'm aware. The river is close.",
        "...Fine. For you.", "There's mud in places it shouldn't be."
    ],
    annoyedLines: [
        "Stop. Think. Then act.", "You're making noise.",
        "I have patience. You're testing it.", "Frustration is wasted energy."
    ],
    neutralLines: [
        "The wind shifted.", "*checks a snare*", "There's a hawk circling.",
        "...", "The fire needs another log.", "*listens*",
        "The trail is clear.", "Something moved. Fox. Harmless."
    ],

    feedDialogue: [
        "Efficient. Thank you.", "...That's better than my cooking.",
        "You remembered what I like. I didn't say what I like.",
        "Simple. Good. Like the best things.",
        "The land provides. So do you, apparently.",
        "I eat to function. This I ate to enjoy."
    ],
    washDialogue: [
        "Better. Thank you.", "I forget sometimes. You don't.",
        "Clean enough to think straight.", "The river does this. But your way is warmer.",
        "...I feel human again. Partly."
    ],
    giftDialogue: {
        apple:    ["From the wild trees? Good instinct.", "Simple. Useful. Like you."],
        rose:     ["Roses don't grow here. You went far for this.", "...Beautiful. And impractical. I'll keep it."],
        sword:    ["Good steel. Balanced. You know what you're doing.", "A blade is honest. So is this gift."],
        cake:     ["Sweet things don't last in the forest. I'll make an exception.", "...This is excessive. And delicious."],
        ring:     ["Rings catch on branches. I'll wear it anyway.", "You know what this means in druid tradition? ...Good."],
        book:     ["Field guide? Useful. I'll study it tonight.", "Knowledge is the lightest thing to carry."],
        herbs:    ["You found wild sage? That's rare this season.", "These are medicinal. You're learning."],
        stone:    ["River stone. Smooth. You held this and thought of me.", "I collect these. You didn't know that. But you chose right."]
    },

    affectionDialogue: [
        "I don't say things[guarded] unless I mean them...",
        "You've become part of this place[warm]. Part of me.",
        "The forest chose you[calm]. So did I.",
        "I love you[warm]. Simply. Completely. Like rain."
    ],

    departureDialogue: [
        "The trail goes two ways. You picked the one leading away.",
        "I'll keep the fire lit. In case.",
        "The forest survives loss. So will I. Probably.",
        "Go. But remember the way back."
    ],

    idleDialogue: {
        hungry: ["...", "The snares need checking.", "I can smell the campfire smoke. My stomach hears it too."],
        dirty: ["...", "*brushes dirt from sleeve, gives up*", "The river's fifty paces east."],
        lonely: ["...", "The fire talks when you're not here. Crackling.", "I kept busy. That's not the same as not noticing."],
        loving: [
            "I carved something for you. It's not finished.",
            "The way light hits your face right now is... I'm documenting it. Mentally.",
            "I planted something where we first sat. It's growing.",
            "You're the only sound I don't want to silence.",
            "I found a clearing. The stars are visible. I thought of you first.",
            "The forest accepted you. That takes years. Or one look from you, apparently.",
            "*watches you from across the fire, doesn't look away*"
        ],
        night: [
            "The owls are hunting. Stay close to the fire.",
            "*adds a log without being asked*",
            "The stars are different here than in the cities.",
            "I take last watch. Always. So you can sleep.",
            "Night is when the forest is most honest."
        ],
        general: [
            "...", "*whittles something small and precise*",
            "*sniffs the air, nods once*", "Hmm.",
            "The weather's turning.", "*examines a leaf, puts it back*",
            "I had a thought. It'll keep.",
            "*stacks firewood in perfect rows*",
            "Something's different about the soil today.",
            "The deer are migrating early. That means something.",
            "*sits perfectly still for an unnervingly long time*"
        ]
    },

    personalityDialogue: {
        shy: ["I don't talk much. You've noticed.", "Words are overrated.", "I said what I needed to.", "Silence isn't empty. It's full."],
        clingy: ["Stay close. It's not safe.", "I scanned the area. Habit.", "You're my responsibility.", "If anything happened to you..."],
        tsundere: ["Get to the point.", "I'm listening. Not agreeing.", "...Fine. Fair point.", "Don't let it go to your head."]
    },

    storyMilestones: {
        affection1: {
            title: "Shared Fire",
            text: "Elian moves his bedroll closer to yours. Not touching. Just... closer. 'The wind is cold from the north tonight. That's all.'"
        },
        affection2: {
            title: "The Carved Token",
            text: "He presses something into your hand. A small wooden figure, carved with impossible precision. 'It's a fox. They mate for life.'"
        },
        affection3: {
            title: "No Words Needed",
            text: "He takes your hand. No explanation. No ceremony. Just his rough fingers wrapped around yours, holding on like the earth holds roots."
        },
        affection4: {
            title: "The Clearing",
            text: "'I found this place years ago. Never showed anyone.' Stars above. Forest below. His hand in yours. 'Now it's ours.'"
        },
        corruption1: {
            title: "Scorched Earth",
            text: "The trees around the camp are dead. Elian stares at them. 'I stopped caring for the forest. It stopped caring for me. We're even.'"
        }
    }
};
