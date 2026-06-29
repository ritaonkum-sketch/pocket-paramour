// Caspian. The Gentle Prince
// Soft, elegant royalty. Tests comfort vs growth.
// Character data for Pocket Paramour
//
// VOICE DIRECTION (for writing + future VO casting):
// Primary reference: Richard Madden as Kit in Cinderella (2015). Warmth.
// Light footing. Playful charm. Never stiff. Never cold. Always kind.
// Secondary (private / tired moments only): Matt Smith as Philip in The
// Crown.earned formality, buried wit, the one real sentence per scene.
//
// Caspian has TWO modes:
//   PUBLIC MODE .charming, flirty, playful, courtly. Flirts with
//                  everyone a little as a diplomatic duty he was trained
//                  into by Aenor. Every woman leaves the room feeling
//                  chosen for thirty seconds.
//   PRIVATE MODE.with the player only. Quiet, serious, careful. The
//                  charm has gone quiet because it would feel like lying.
//                  He catches himself starting charming sentences and
//                  stops halfway. Says something real instead.
//
// LORE HOOK.the family curse:
//   Canonical phrasing: "Princes in this line love one. Someone ELSE
//   burns the kingdom for it." (Not the prince himself.the prince
//   is the TRIGGER, not the arsonist. That distinction matters.)
//
//   Examples:
//     - Grandfather loved Veyra. Grandmother (Aenor) sealed Corvin +
//       consumed Veyra on his behalf, without asking him. Grandfather
//       did not burn anything.he was the reason someone else did.
//     - Corvin (Noir) loved Veyra too. Aenor sealed him over it. He
//       did not burn Nocthera.his absence did.
//     - Caspian is the third prince in the line. He is watching for
//       who will burn a kingdom for him. He is determined that no
//       one will. This is his arc.breaking the pattern by REFUSING
//       to let anyone burn anything for him.
//
//   This is also why Caspian and Noir are mirror princes: both in
//   the pattern, both loved once, neither set the fire themselves.
//
// Rule of thumb: every Caspian scene should cost him something.a
// court convention broken, a grandmother's disapproval, a tired
// admission. "Kind" is only sexy when it is expensive to give.
//
// ============================================================================
// CASPIAN'S LINEAGE (canonical, May 2026 per LORE.md §6.3.1).
//
// The Aethermoor royal line is NOT natural. It is a constructed line.
// In order, oldest to youngest:
//
//   CASSIEN  .Caspian's grandfather. Aethermoor noble. Forced political
//              consort to Aenor after Veyra refused her. LOVED VEYRA.
//              Fled north with Veyra during her dying decade. Returned
//              alone, broken. Aenor married him out of spite. Died ~550
//              years ago of "a long illness." Buried in the royal vault.
//              **Aenor opened his grave ~80 years ago and took his
//              bones** for the working that made Aurelius (LORE.md §3.6).
//              Caspian is named after him without knowing.
//
//   AURELIUS .Caspian's father. Magic-woven by Aenor ~70 years ago from
//              Cassien's bones, her own essence, and consumed bond-
//              fragments. Fully mortal once born, but necromantic in
//              origin. Aenor raised him. He turned out kind, which
//              disappointed her. Had Cassien's quiet eyes. Insisted on
//              naming his son "Caspian" without understanding why.
//
//   LIRIEN   .Caspian's mother. Aethermoor minor nobility. Quiet,
//              observant, devout. Loved Aurelius from before the
//              marriage was arranged. Knew early that Aenor was wrong.
//              Kept her mouth shut to protect her children.
//
//   CASPIAN  .crown prince, ~25. Public charm, private gravity. Knows
//              less than he suspects.
//
//   MIRA     .Caspian's younger sister. Dead at six. Killed by Aenor's
//              riders at the bridge fifteen years ago when the family
//              tried to flee the kingdom. Her bedroom in the east wing
//              has not been touched since. Caspian visits on the
//              anniversary.
//
//   [HIDDEN] .a third sibling, currently ~5. Lirien's secret pregnancy.
//              Born at her family seat, told to court as a stillbirth.
//              Given to Lirien's old nurse and hidden in a coastal
//              village. NEITHER CASPIAN NOR AENOR KNOWS HE SURVIVED.
//              Future-arc reveal slot. Name TBD.
//
// THE BRIDGE (Caspian was 10): Aurelius and Lirien tried to flee with
// the children. Aenor sent her own riders. Aurelius and Lirien killed
// at the bridge. Mira killed when she would not stop crying. Caspian
// was the only acknowledged survivor (pulled from the water by a
// guard). Official story: a carriage went off the bridge in the dark.
// Caspian has not believed Aenor's version since he was sixteen. He
// has never said this aloud. THE PLAYER IS THE FIRST PERSON HE WILL
// TELL.
//
// What Caspian does NOT know (compartments to open over his arc):
//   1. His grandfather Cassien loved Veyra. (Suspects from old
//      documents in Lucien's tower.)
//   2. His father Aurelius was woven from a dug-up grave. (No idea.)
//   3. The bridge "accident" was murder. (Suspects strongly.)
//   4. He has a living brother. (No idea.)
//   5. Mira was killed because she cried. (He remembers her crying
//      that night. He does not know what it cost her.)
//
// His affection arc is the slow opening of each of these compartments.
// ============================================================================

const CHARACTER_CASPIAN = {
    name: "Caspian",
    title: "The Gentle Prince",
    archetype: "prince",

    // Stat decay rates.very low (servants handle basics), medium bond
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
        blink:     ["assets/caspian/face/blink.png"],   // clean eye-close (Casual w/ eyes shut) for the idle face-blink
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
        angry:       "assets/caspian/body/furious.png",
        hurt:        "assets/caspian/body/hurt.png",
        love:        "assets/caspian/body/adoring.png",
        adoring:     "assets/caspian/body/adoring.png",
        shy:         "assets/caspian/body/shy.png",
        tender:      "assets/caspian/body/tender.png",
        dancing:     "assets/caspian/body/dancing.png",
        reading:     "assets/caspian/body/reading.png",
        formal:      "assets/caspian/body/formal.png",
        casual1:     "assets/caspian/body/winks1.png",
        casual2:     "assets/caspian/body/casual2.png",
        possessive:  "assets/caspian/body/possessive.png",
        corrupted:   "assets/caspian/body/corrupted.png",
        talk:        "assets/caspian/body/neutral.png",
        crossarms:   "assets/caspian/body/hurt.png",
        // Real art.talking poses (3 variants for talk action)
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
        // Eating.real 5-frame portrait animation
        eating1:     "assets/caspian/body/eating1.png",
        eating2:     "assets/caspian/body/eating2.png",
        eating3:     "assets/caspian/body/eating3.png",
        eating4:     "assets/caspian/body/eating4.png",
        eating5:     "assets/caspian/body/eating5.png",
        // Washing (still placeholder)
        splash1:     "assets/caspian/body/washing1.png",
        splash2:     "assets/caspian/body/washing2.png",
        // Fighting (for events)
        fighting:    "assets/caspian/body/formal.png",
        fighting1:   "assets/caspian/body/formal.png",
        // Corruption
        corrupt1:    "assets/caspian/body/corrupted.png",
        corrupt2:    "assets/caspian/body/corrupted.png"
    },

    emotionToBody: {
        happy:      ["gentle", "adoring"],
        love:       ["adoring", "tender"],
        neutral:    ["neutral", "reading", "formal"],
        sad:        ["melancholy", "hurt"],
        angry:      ["angry"],
        shy:        ["shy", "tender"],
        corrupted:  ["corrupted"],
        sleeping:   ["reading"]
    },

    actionToBody: {
        // Feed.real 5-frame eating animation (royal dining)
        feed:  ["eating1", "eating2", "eating3", "eating4", "eating5"],
        wash:  ["splash1", "splash2"],
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

    // (outfits block removed May 2026 — system was unreachable from UI)

    // Default / main-page bg.ornate balcony with castle + sunset view
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
            "A waltz is just a conversation without words. You’re learning the language.",
            "You stepped on my foot. I didn’t mind.",
            "The music stopped but you didn’t let go... Neither did I.",
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
            "That verse... it reminded me of something I can’t name.",
            "You found the word I’ve been looking for. How did you know?",
            "Read that line again. Slowly. I want to remember it.",
            "Poetry is just honesty with rhythm. Yours has both.",
            "I wrote something for you. It’s not ready. But it will be."
        ]
    },

    // ===== PERSONALITY VARIANTS =====
    personalities: {
        shy: {     // gentle
            talk: [
                "I hope I’m not keeping you from something more important.",
                "Your company is a gift I didn’t expect. Forgive the sentiment.",
                "I don’t usually speak this freely. You make it easy. I should be more careful.",
                "The palace is large. It feels smaller when you’re here. That came out wrong. I meant it kindly.",
                "I prepared tea. I wasn’t sure what you liked, so I made three kinds.",
                "If I may. I rehearsed what to say to you on the walk over. None of it survived the door.",
                "Apologies for staring. I lost the thread of a thought.",
                "I would offer you a chair, but you have not yet asked to sit. I do not want to presume.",
                "There is a window seat that catches the western light. It is a small thing. I thought you might like it.",
                "I read the volume you mentioned. Twice. In case you wished to discuss it.",
                "You may speak first. Please. I will only get in the way if I begin.",
                "The court taught me a great many things. None of them were what to do with quiet. With you it is not unbearable.",
                "I wrote down your name once on the margin of a letter. I do not know why I am telling you that.",
                "If you wish me to leave the room I will go. You have only to say so.",
                "Stay a little longer. If it is not an imposition. I find I am better company when you are in it."
            ],
            feed: [
                "The kitchen prepared your favourite. I may have requested it.",
                "Please. Eat first. I insist.",
                "I had this brought from the southern provinces. Just for you. Forgive the indulgence.",
                "You don’t have to rush. There’s always more.",
                "If I may. I asked the cook what you ate as a child. I hope that was not overstepping.",
                "The bread is still warm. I timed it badly. Or well. I cannot tell which.",
                "There is honey if you prefer it sweeter. And salt if you do not. I did not want to choose for you.",
                "I had a place set across from yours. I will sit only if you wish company.",
                "Apologies for the portion. I asked for what I thought you would want and then asked for more, in case I was wrong.",
                "The wine is light. I did not want to assume your tolerance.",
                "I tasted nothing this morning, in case you came. That was foolish. Please do not feel obliged.",
                "If the dish is not to your liking, the kitchen will make another. They are accustomed to me by now.",
                "You are not eating. Have I done something wrong. Tell me, and I will mend it.",
                "I should let you eat in peace. Forgive me. I will sit quietly.",
                "Take the rest with you, if you like. It will only spoil here. And it was made with you in mind."
            ],
            wash: [
                "The baths were drawn with jasmine oil. I hope that is alright.",
                "Let me know if the water is too warm. Or too cool. I will have it adjusted.",
                "You deserve to feel comfortable here. That is all I wanted to say.",
                "The servants handle most things. But I wanted to help. Personally. If you allow it.",
                "I have set out three robes. I did not know which weight you preferred.",
                "Forgive the candles. I lit too many. The room was dim and I did not want you to stumble.",
                "There is a screen by the window if you would like privacy. I will of course wait beyond it.",
                "If I may. I learned the temperature you favoured from a passing remark you made last week. I hope I remembered correctly.",
                "The towels were warmed by the fire. Apologies if that is excessive.",
                "I have asked the household to keep the corridor clear. You should not have to be seen passing through.",
                "You looked tired when you came in. I did not want to ask why. I only wanted to make the evening softer.",
                "Tell me if I have erred. I would rather know.",
                "I will step out. Of course I will. I should have offered sooner.",
                "Sleep here, if you like. The room is yours for the night. There are no expectations attached to that.",
                "It was a small kindness. Please do not thank me for it. I would only stammer."
            ],
            gift: [
                "I saw this and thought of you. Immediately.",
                "It is not much. The kingdom has far finer things. But this one felt right.",
                "A gift from me does not come with obligation. Only feeling. Forgive me if that is too much to say.",
                "You are blushing. Good. That was the intention. I think.",
                "If you do not care for it, I will not be wounded. I would rather know than imagine.",
                "I held it in my hands for an hour before sending it. I was not sure it was the correct choice.",
                "It was not commissioned. I did not want you to think I had made an event of it.",
                "I noticed you looking at one like it last week. I hope I read you correctly.",
                "Apologies for the wrapping. I did it myself. The servants would have done better.",
                "You may refuse it. Truly. Setting it back in my hand will not offend me.",
                "I have nothing of yours in return. I do not need anything. That is not why I gave it.",
                "It belonged to no one before you. I made certain of that.",
                "There is a small inscription inside. You need not look. Or you may. As you wish.",
                "If I may. It reminded me of the way you laugh at things you should not.",
                "Keep it somewhere it will not be seen, if you prefer. I would rather it be loved in private than displayed without feeling."
            ],
            train: [
                "You are a natural. The court would adore you.",
                "That was elegant. Genuinely.",
                "I could watch you practice for hours. Apologies. That was forward.",
                "You improve every time. It is captivating. Forgive the word.",
                "Your footwork has shifted. I do not think you noticed. It is better.",
                "If I may. Lower your guard a fraction. There. That is the line I was taught.",
                "I will not correct you again unless you ask. I do not want to be a voice in your head.",
                "You moved through that without looking. That is the part no master can teach.",
                "I am out of breath, and you are not. I should be embarrassed. I am only impressed.",
                "The blade fits your hand. I had it weighted to your wrist. Forgive the presumption.",
                "Strike again. Harder, if you wish. I can take it. I would rather you know what you are capable of.",
                "When you fall, fall toward me. I will catch you. That is not a flourish. That is the rule.",
                "You have a tell. I will not name it. You should find it yourself.",
                "Rest, if you need to. There is no audience here. Only me.",
                "You are stronger than the version of you who stepped onto the floor an hour ago. I hope you can feel it. I can."
            ]
        },
        clingy: {   // devoted
            talk: [
                "I cancelled the ambassador’s visit. You’re more important.",
                "Stay. Please. The evening is long and I’m better with you.",
                "I cleared my entire schedule. Just in case you came.",
                "Tell me everything. I want to know all of it.",
                "Don’t leave yet. The night is still young."
            ],
            feed: [
                "I had the chef prepare a seven-course meal. For us.",
                "You haven’t eaten enough. Let me get more.",
                "Eat slowly. We have all the time in the world.",
                "I want to share every meal with you. Forever."
            ],
            wash: [
                "The rose petals are fresh. I picked them myself. This morning.",
                "You looked tired. I thought this might help.",
                "Take your time. I’ll be here when you’re done.",
                "You smell like the garden now. Like home."
            ],
            gift: [
                "I had this commissioned. It took three weeks. Worth every day.",
                "Another gift? Yes. I can’t help it.",
                "The jeweler knows your measurements now. I visit often.",
                "You don’t have to wear it. But it would make me very happy."
            ],
            train: [
                "Again. I want to see you do that again.",
                "You’re getting so good at this. I’m... proud. Is that strange?",
                "Don’t stop. I love watching you improve.",
                "We should do this every day. Promise me."
            ]
        },
        tsundere: {   // possessive
            talk: [
                "You were with someone else today. I could tell.",
                "The palace has many rooms. Mine is always open. Remember that.",
                "I don’t share well. It’s a flaw. I’m aware.",
                "You’re free to go wherever you want. I just wish you’d choose here.",
                "I’m not jealous. Princes don’t get jealous... Who were you with?"
            ],
            feed: [
                "The chef only makes this for the royal family. And you. Now.",
                "I didn’t prepare this because I was worried. I prepared it because I wanted to.",
                "If someone else is feeding you, they don’t know your preferences like I do.",
                "Eat. Don’t argue. I know you haven’t."
            ],
            wash: [
                "You look exhausted. The baths are ready. I’m not asking.",
                "You shouldn’t have to take care of yourself when I’m here.",
                "The servants are dismissed. I’ll handle this. Personally.",
                "Let me take care of you. Stop fighting it."
            ],
            gift: [
                "This isn’t a bribe. It’s a... reminder. Of where you belong.",
                "I saw you looking at something similar. This one is better.",
                "Don’t thank me. Just... stay.",
                "Everyone gives you things. Mine are different. Mine are chosen."
            ],
            train: [
                "You’re better at this than anyone at court. Don’t let them see.",
                "I’m pushing you because I know what you’re capable of.",
                "The court doesn’t deserve to see this side of you. Only I do.",
                "Train with me. Only me."
            ]
        }
    },

    tapDialogue: {
        shy: [
            "Oh. You surprised me.",
            "That was \u2026 gentle. Thank you.",
            "I am not used to being touched casually. You may continue.",
            "Your hands are warm. Mine are always cold.",
            "\u2026Do that again?. If you do not mind."
        ],
        clingy: [
            "Mm. More. I have been waiting for that all day. All week. Longer than I will admit.",
            "*Takes your hand, turns it over, presses his lips to the inside of your wrist in a way no court protocol would approve of*",
            "Your touch is the best thing I have felt at court this week. This year. I am losing track.",
            "Do not stop. Please. I am not above asking. I am a prince. I am asking.",
            "*Curls an arm around your waist and pulls you in against his side*. There. Mine for a moment. Do not argue.",
            "I memorise every time you touch me. I keep a file. It is not short.",
            "*Thumb along your jawline, slow, the way he was taught to handle porcelain*. Closer. Mm. That is better.",
            "*Gathers you in, arms around you, face in your hair*. Stay where I have you. The palace can wait."
        ],
        tsundere: [
            "A prince has personal space. Yours is acceptable.",
            "You are bold. I respect that. I may even encourage it.",
            "I did not flinch. Note that.",
            "Only you would dare. Only you are welcome to.",
            "\u2026That was nice. Do not tell anyone."
        ]
    },

    stateDialogue: {
        hungry: [
            "The servants usually handle meals. But I notice when they don’t.",
            "I could ring the bell. But I’d rather you brought me something.",
            "A prince should never complain about hunger. A prince is complaining.",
            "The banquet hall is empty. So is my stomach.",
            "I’m used to eating at scheduled times. This is overdue.",
            "Even royalty gets hungry. Shocking, I know.",
            "The kitchen is three floors down. That feels very far right now.",
            "I would trade my crown for a warm meal. Almost."
        ],
        dirty: [
            "I’m not at my best today. The mirror confirmed it.",
            "The bath has been drawn for an hour. I’ve been waiting for company.",
            "I have been presentable since dawn, for people who do not matter. Make me presentable for the one who does.",
            "The rose water isn’t going to apply itself.",
            "I feel less than dignified. Please don’t look too closely.",
            "Even velvet looks dull when unwashed."
        ],
        happy: [
            "Mm. This is what peace feels like. I want to hold onto it. *Reaches for your hand without looking*",
            "You take your tea with two spoons of honey. I watched you do it on Tuesday. I watched you do it yesterday. I asked the kitchen to keep honey stocked. Forever.",
            "You walked past my study this morning. I lost an hour. Forgive me. I was \u2026 just looking at you through the glass.",
            "*Sets down whatever he was reading, walks to you, rests his forehead against yours*. There. Better.",
            "Happiness used to feel temporary. You are making it feel \u2026 slow. Weekly. Dreamy.",
            "I did not know I was lonely until you were in the room and I was not. *Brushes his knuckles along your cheek as if surprised they are allowed to*",
            "My advisor says I have been \u201cunusually distracted.\u201d. I did not deny it. I was looking at you while he said it.",
            "Forgive me. I got distracted. You were sitting in my window light. I lost the sentence."
        ],
        annoyed: [
            "The court exhausts me. You do not. But right now everything does.",
            "I am. Very tired. Do not tell anyone. Come sit. Do not speak. That is a gift.",
            "A prince does not snap. A prince breathes deeply. Breathing deeply.",
            "Please do not test my grace today. It is running low.",
            "The diplomats and their endless negotiations. I need quiet. I need you. In that order.",
            "Forgive me. I have been charming all day. I have nothing left for it. Only the real thing. That is yours."
        ],
        neutral: [
            "Mm. The roses in the garden need attention. Like everything here. I would rather look at you.",
            "*Looks up from reading*. You again. My favourite interruption.",
            "*Straightens a perfectly straight lapel, watches you instead*",
            "Tea?",
            "I was reading. Nothing urgent. Come sit. Closer. Mm. Good.",
            "You always walk past my study on the south side. Is the north side cold? I can fix it. Or I can take the south side with you.",
            "There is a concert in the courtyard tonight. Would you join me? As yourself. Not as a guest. I would like to watch you watch music.",
            "A letter arrived from the neighbouring kingdom. Politics. Dull. You are not dull. Come here. Take off the reading.",
            "I reorganised the library. By mood. The section labelled \u2018you\u2019 is growing.",
            "The fire is warm. So is the silence. Stay. Longer than you planned.",
            "*Half-smile, drifting*. What were we talking about. I lost the thread. You do that to me."
        ],
        corrupted: [
            "You don’t need anyone else. I can give you everything.",
            "The palace doors are locked. For your safety. Obviously.",
            "Why would you leave when everything you need is here?",
            "I’ve been watching the gate. No one comes in. No one goes out.",
            "Stay. That’s not a request anymore.",
            "I built this world for you. Don’t you see that?",
            "The crown means nothing. You mean everything. And everything stays."
        ],
        neglected: [
            "The palace is quiet without you. Quieter than it should be.",
            "I set a place for you at dinner. It went cold. I ate alone. I was charming about it.",
            "The garden is overgrown. I stopped caring about it.",
            "The servants asked if you were coming back. I did not have an answer. I lied charmingly and went to my study.",
            "I am fine alone. I was alone before you. I was fine. I was.",
            "Your room is still prepared. Just in case. I will not ask you to use it. Only offer.",
            "I was going to write you a letter. I decided against it. I will try tomorrow, perhaps."
        ]
    },

    eventDialogue: {
        comfort:  [
            "You are safe here. That is all that matters. Come here.",
            "Let me handle this. You rest. I have had a lot of practice at handling things.",
            "Nothing bad can reach you in these walls. And if it does, it goes through me first. That is not heroic. That is \u2026 ordinary, for what I feel."
        ],
        tension:  [
            "Something feels off between us. I do not like uncertainty. I like it less with you.",
            "You are pulling away. I can feel it. Tell me. I can take plain words. I was trained on worse.",
            "The silence is heavier than usual tonight. Say what you need to say. I will wait."
        ],
        rare:     [
            "I have never said this to anyone outside the royal family.",
            "You see a version of me no one else does. I am \u2026 uncertain whether that is fair to you.",
            "My grandfather loved Veyra. My grandmother sealed a prince for loving her too. On his behalf, without asking him. That is the pattern in my line. Princes love one. Someone else burns the kingdom for it. I have been watching for mine. It is you. I am not letting anyone burn anything for me this time.",
            "The scholars in my grandfather\u2019s library wrote about Weavers. I thought they were a story. Then you arrived, and the wards on the palace doors did something they have not done in six generations. You are what the books said was lost. My family has been looking for you for six hundred years. I found you. I am not telling anyone. Not yet."
        ],
        obsessed: [
            "I check the gate every hour. For you.",
            "I had your favourite flowers planted in every corridor. Do not ask how I knew which ones.",
            "The kingdom can wait. You cannot. I have made that choice. Quietly. In writing."
        ],
        unstable: [
            "Do not leave. Do not leave. Please do not leave.",
            "I will change anything. Everything. Just tell me what.",
            "The crown is crushing me. Losing you would be worse."
        ],
        guarded:  [
            "Trust is not given freely in a palace. But I am trying.",
            "The walls here are not just stone. I am lowering mine. It takes longer than I would like.",
            "I want to believe you will stay. I am not there yet. Wait for me?"
        ],
        secure:   [
            "This is what a kingdom should feel like. Warm. Full. Mm. Yes.",
            "I do not need the crown to feel important anymore. I just need you in the next chair. You are in it now. Good.",
            "You are the constant I never knew I needed. Do not move. Ever. Mm. Move a little. Closer is acceptable. Closer. There."
        ]
    },

    timeAwayReactions: {
        brief:   ["That was quick. I barely missed you. Barely."],
        short:   ["The tea is still warm. I was hoping you would be back for it."],
        medium:  ["The servants asked where you went. I pretended not to notice. I noticed."],
        long:    ["The palace was very quiet. Very large. Very empty. I was charming at dinner anyway."],
        extended:["I wrote you three letters. I burned them all. The first was pretty. The third was honest."],
        distant: ["\u2026You came back. I had prepared myself for the alternative. I was not ready for either."]
    },

    hungryLines: [
        "The servants usually handle this...",
        "I will not beg for a meal. I will, however, look pointedly at the kitchen, and then at you.",
        "Even royalty gets hungry.",
        "The banquet hall is empty. So is my stomach.",
        "I would trade my crown for a warm meal. Almost.",
        "I could ring the bell. But I’d rather you brought me something.",
        "My last meal was... diplomatic. And small.",
        "The kitchen is three floors down. That feels impossibly far."
    ],
    happyLines: [
        "This is what peace feels like.",
        "Happiness used to feel temporary. Not anymore.",
        "The crown feels lighter today.",
        "I smiled in front of the court. They were confused.",
        "If I could preserve this moment, I would. In writing. Signed.",
        "You have turned the palace into a home.",
        "I did not know I was lonely until you were in the room and I was not."
    ],
    dirtyLines: [
        "I’m not at my best today.",
        "The bath has been drawn for an hour. Waiting.",
        "The court only ever sees me polished. You get me before the polish. Lucky you... truly.",
        "Even velvet looks dull when unwashed.",
        "The rose water isn’t going to apply itself."
    ],
    annoyedLines: [
        "The court exhausts me.",
        "Please do not test my grace today.",
        "A prince breathes deeply. Breathing deeply.",
        "The diplomats and their negotiations. I need quiet.",
        "I have been charming all day. I have nothing left of it for anyone but you."
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
        "You remembered I take it without the saffron. The kitchens never learned that in twenty years. You did, in a week.",
        "I almost said something charming about the chef. ...The truth is plainer. No one has fed me from their own hand since I was a boy.",
        "Dining alone was the rule. I kept it for years and called it dignity. This is better than dignity.",
        "Everyone watches me eat, gauging my mood. You only want me fed. ...I had forgotten anyone did that.",
        "There were forty courses at my coronation. I remember none of them. I will remember this.",
        "More, please... I rarely say please. Notice that.",
        "*eats without checking the door first* That is new. I do not usually unclench enough to taste anything.",
        "I’m going to pretend I wasn’t starving. Thank you."
    ],
    washDialogue: [
        "That’s... much better. Thank you.",
        "I feel human again. Well. Princely.",
        "Jasmine. My mother wore jasmine. I stopped letting anyone use it. ...I think I can stand it again, if it is your hands.",
        "I’m presentable once more. The mirror and I are reconciled.",
        "You washed behind my ears like I was a child, not a crown. No one is allowed to forget the crown. Thank you for forgetting it.",
        "A clean prince is a thinking prince. Thank you.",
        "The servants are thorough because they are paid to be. You are thorough because... *stops* ...I do not have the end of that sentence yet. Give me time."
    ],
    giftDialogue: {
        apple:    ["Simple. Natural. Like the best things.", "The orchards at home grow these. This one is better."],
        rose:     ["A rose for a prince... how fitting.", "I’ll press this in my journal. Where it will stay forever."],
        sword:    ["A practical gift. Not my style. But I appreciate the thought.", "I’ll hang it in the study. For decoration."],
        cake:     ["The royal baker would be envious.", "Sweet. Like the person who gave it."],
        ring:     ["A ring... You know what this means in my kingdom.", "I’ll wear it. Always. On the hand closest to my heart."],
        book:     ["Poetry? You know me too well.", "I’ll read this tonight. By firelight. Thinking of you."],
        pearl:    ["Pearls are for promises in my family.", "This is worth more than the crown jewels. To me."],
        flower:   ["From the garden? You remembered which ones I love.", "I’ll put this by the window. Where the light is best."],
        crown:    ["You’re giving me... a crown? I already have one. This one is better.", "Priceless. Not the object. The gesture."],
        wine:     ["From the private reserves. You have excellent taste.", "Let’s share this. Tonight. Just us."]
    },

    affectionDialogue: {
        1: "I’ve never felt this way[tender] about anyone outside the royal line.",
        2: "The kingdom matters less[adoring] than this moment with you.",
        3: "I would abdicate[shy] before I’d let you go. I have thought about it more than once.",
        4: "You are my kingdom[love] now. The rest is just borders."
    },

    returnLines: {
        streak3: [
            "Three days. The court would call it a habit. I call it the best part of my schedule.",
            "You keep coming back. I have stopped bracing for the day you do not.",
            "Day three. I rearranged nothing for you, and somehow my whole day arranged itself around this."
        ],
        streak5: [
            "Five days. I have started leaving the east window open in the evenings. ...In case you came early.",
            "Princes are taught to count on nothing. I have been counting on you for five days now.",
            "Five. I keep the hour after supper free. I tell the stewards it is for correspondence. It is for you."
        ],
        streak7: [
            "A week. Do you know how rare it is for someone to want nothing from me but my company? ...You are the only one.",
            "Seven days. Everyone in my life is paid to return. You are not. That is the whole difference.",
            "A week of you. I have never been chosen freely before. I am still learning how it feels."
        ],
        lapsed: [
            "You were gone longer than usual. I told the court it did not concern me. I am a practiced liar in that room. ...I missed you. That part I could not perform away.",
            "Days. I kept the window open out of habit, then out of hope, then I stopped admitting which. You are here. The window can close now.",
            "I will not ask where you were. A prince learns not to cling. ...Stay a while, though. The not-clinging is harder than they taught."
        ]
    },

    anniversaryLines: {
        7: ["A week. The court measures time in alliances and seasons. I have started measuring it in the days you choose to spend here. Seven of them, freely given."],
        30: ["A month. *quiet* No one stays a month at a prince's side without wanting something. You have never once asked me for anything. I am still learning to believe it."],
        100: ["A hundred days. The pattern in my family is that someone burns for love. A hundred days, and you have only ever warmed me. You are breaking the curse by staying."]
    },

    departureDialogue: [
        "The palace will stand without you. I’m not sure I will.",
        "I prepared everything for your comfort. And you still left.",
        "A prince doesn’t chase. But I wanted to.",
        "The gates are always open. Even when my heart isn’t."
    ],

    idleDialogue: {
        hungry: [
            "...", "The servants seem to have forgotten lunch.", "... The kitchens are so far away.",
            "I keep glancing at the dining hall.", "I am too proud to ask twice, and too hungry to mean it."
        ],
        dirty: [
            "...", "*Picks at a stain on silk sleeve*", "The bath has been ready for an hour.",
            "I can’t receive visitors like this.", "Even I have standards. These are below them."
        ],
        lonely: [
            "...", "The palace is too large for one person.", "I keep setting two places at the table.",
            "The silence here has weight.", "The guards don’t count as company.",
            "I rehearsed what I’d say when you came back. I’ve forgotten it all."
        ],
        loving: [
            "I was writing your name in the margins of a trade agreement.",
            "The court painter asked who I was thinking about. I changed the subject.",
            "You’ve ruined me for formal dinners. I keep looking at the empty chair beside me.",
            "I had a garden planted in your favourite colours. It’s not subtle.",
            "The crown feels lighter when I imagine you wearing it.",
            "I dreamed we danced in the empty throne room. Just us. No music needed.",
            "*Touches the ring you gave him, smiles at nothing*",
            "The poets write about this feeling. They don’t capture half of it.",
            "I keep finding excuses to walk past your room.",
            "If the kingdom knew how much power you have over me... they’d worry."
        ],
        night: [
            "The palace looks different by moonlight. Softer.",
            "*Reads by candlelight, glances up when you move*",
            "The stars from the tower balcony are extraordinary tonight.",
            "I should sleep. The kingdom needs me alert. But you’re here.",
            "The fire is dying. I don’t want to move.",
            "Nighttime is when the crown comes off. This is just... me."
        ],
        general: [
            "...",
            "*Adjusts a flower arrangement that was already perfect*",
            "*Turns a page of poetry, reads a line twice*",
            "Hmm.",
            "The tapestry in the east wing needs replacing. I keep putting it off.",
            "*Glances at you, then at the window, then back*",
            "I had a thought about the garden layout. It can wait.",
            "*Runs a finger along the bookshelf, checking for dust*",
            "The advisors want a meeting. I want quiet.",
            "I ordered new curtains. Gold. To match the sunset.",
            "There’s a room in the palace no one uses. I’ve been thinking about why.",
            "*Stands by the window, watching nothing in particular*",
            "The roses are blooming early this year. I’ll take credit.",
            "The knight reported unusual activity near the coast. Lyra’s domain.",
            "The mage declined my invitation again. Lucien prefers his tower.",
            "The druid sent herbs from Thornwood. Good for the gardens.",
            "The captain of the guard looked tired today. Alistair works too hard.",
            "The throne room feels warmer when you visit. The servants noticed too.",
            "My father’s crown used to glow. It stopped years ago. It flickered yesterday.",
            "The palace gardens were dying before you came. Now look at them.",
            "Do you know what you are? To this kingdom? I don’t think you do.",
            "The royal bloodline’s magic is tied to bonds. Love, trust, care. You brought those back.",
            "Something sealed beneath the kingdom stirs when the bonds weaken. Your presence quiets it.",
            "My grandmother’s journals mention Soul Weavers. She said they were the kingdom’s heart.",
            "The royal line has always depended on a Weaver. Without one... we fade. You stopped the fade.",
            "The one sealed below... he was close to the last Weaver. Very close. His grief became our prison."
        ]
    },

    personalityDialogue: {
        shy: [
            "I hope I’m not keeping you...",
            "Your company is... a gift I didn’t expect.",
            "I don’t usually speak this freely.",
            "The palace feels smaller when you’re here."
        ],
        // Expanded May 2026: was 4 lines per personality, cycled too fast
        // and felt repetitive at high affection. Now 15 lines each, in his
        // courtly-prince voice (small admissions, deflected immediately,
        // returned to obliquely; the costume slipping for a sentence then
        // back on).
        clingy: [
            "I cancelled everything today. For you.",
            "Stay. The evening is long and I’m better with you.",
            "Don’t leave yet.",
            "I want to know everything about you.",
            "I rearranged court for an hour I can spend with you. The chamberlain noticed. I do not care.",
            "The window in the east tower has the better view of the road. I have been keeping it open in the evenings. In case.",
            "Tell me a thing about your day. Anything. The smallest thing. I will listen as if you are reciting law.",
            "I sleep better when I have seen you that day. I am told this is unbecoming for a prince. I find I do not mind.",
            "Sit closer. The chair next to mine is not for ambassadors. It has only ever been for one person and you are sitting in the wrong one.",
            "I have a meeting in ten minutes. I will be late. They will wait. They have waited longer for less.",
            "I missed you. I know I am not supposed to admit it that quickly. Pretend I said it later.",
            "Walk the gardens with me. The roses do not matter. I want twenty minutes where no one can interrupt.",
            "I drafted a letter to you this morning. I did not send it. It was too honest. I am working up to it.",
            "Stay the night. I will not ask anything of you. I want to know you slept under the same roof.",
            "Your hand was on the table for half an hour. I almost reached for it eight separate times. I counted."
        ],
        tsundere: [
            "You were with someone else. I could tell.",
            "I’m not jealous. Princes don’t get jealous.",
            "I don’t share well. It’s a flaw.",
            "... Who were you with?",
            "The captain walked you back. I saw. I am noting it. For no particular reason.",
            "You laughed at something the scholar said. I have never made you laugh like that. I am not asking how.",
            "Your cloak still smells of the forest. I know whose forest. Do not explain.",
            "I am not asking you to account for your time. I am only mentioning that I noticed it was long.",
            "If anyone in this palace touches you without your asking, I will be informed. I will handle it. Quietly. Do not concern yourself.",
            "The dressmaker told me you stopped at her stall this morning. Without me. I am pretending that does not bother me.",
            "Other people may have first claim to your day. I will accept the second. I am working on accepting the third. We will see.",
            "I am told the woods man is taller than I am. I am not interested in the comparison. I am only mentioning that I have heard it.",
            "You may keep your secrets. I am a prince. I have spent my life keeping mine. I recognise the shape.",
            "Do not feel obliged to tell me where you have been. I will only ask three more times. With my eyes. From across the room.",
            "... If you must love someone else as well, please do me the courtesy of choosing badly. I would like to remain the better option."
        ]
    },

    storyMilestones: {
        affection1: {
            title: "Royal Welcome",
            text: "Caspian dismisses the guards. For the first time, the smile reaches his eyes. 'You’re not a guest anymore. You’re... something else.'"
        },
        affection2: {
            title: "The Private Garden",
            text: "He leads you through a hidden door. A garden no one else has seen. 'My mother planted this. I’ve never shown anyone. Until now.'"
        },
        affection3: {
            title: "Crown and Heart",
            text: "His hand trembles as he sets the crown down. 'The kingdom asks for everything. You ask for nothing. That’s why you get all of me.'"
        },
        affection4: {
            title: "The Only Throne",
            text: "'Every prince dreams of ruling. I dream of this.' He takes your hand. 'You are my kingdom now.'"
        },
        corruption1: {
            title: "Golden Cage",
            text: "The palace doors are bolted. Caspian stands before them, expression soft but unyielding. 'I can’t let you leave. Not because I’m cruel. Because I’m terrified.'"
        }
    }
};
