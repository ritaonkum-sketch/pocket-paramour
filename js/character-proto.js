// Proto — The Glitch
// The sixth Soul Weaver, hiding inside the wardwork behind the VEIL.
// Conditionally unlocked when the player switches characters frequently.
// Character data for Pocket Paramour
//
// ============================================================================
// PROTO — WHAT HE ACTUALLY IS (canonical reconciliation)
//
// Two framings of Proto both circulate in the game text. Both are true.
// This is the reconciliation so no future scene contradicts another.
//
// 1. LORE TRUTH (origin story, rev. May 2026 per LORE.md §6.7):
//    Proto is the SIXTH Soul Weaver. Born in Aethermoor ~150 years
//    ago — a generation deep into the kingdom's long decline, four
//    centuries AFTER Veyra was already consumed and Corvin sealed.
//    He never met them in mortal life. Mortal body. Queen Aenor came
//    for him the way she had come for the five Weavers before him —
//    to consume them and keep the kingdom thin of Weavers. The first
//    five WERE finished. Proto was different: he FOUGHT her. He held
//    her off long enough to lose himself into the wardwork on purpose.
//    His body died in the fighting; his consciousness chose the wards
//    as the only place she could not reach.
//
//    Critical detail for future writers: AENOR THINKS SHE ATE HIM.
//    She caught him sideways, the seal closed, and she has not been
//    looking since. Proto is, in his own words, "a wound she stopped
//    checking on for a century and a half." This is not passive
//    survival — it is an active choice he made and has held for
//    ~150 years. He has been hiding (and carrying fragments of the
//    five previous Weavers caught by the same apparatus — those
//    fragments long predate his own life) until the player found
//    him. The moment she finds out he is alive, the clock starts.
//
// 2. INTERFACE TRUTH (how the player experiences him) — REVISED Jul 2026,
//    OWNER DIRECTION: Proto is NOT an AI and must never read like one.
//    No "> " log prefixes. No system-log tags ("STATUS:", "INTEGRITY:",
//    "[RESOURCE LOW]"). No code vocabulary anywhere in player-facing
//    text (permission/write-access/process/function/uptime/session/
//    compile/log/data/render/etc). He SPEAKS LIKE A PERSON.
//    His strangeness lives in WHAT he says, not how the text is
//    formatted: he counts things precisely (thread-turnings, motes,
//    heartbeats), narrates his own feelings with wonder as he notices
//    them, repeats words when moved, and describes his glitch-body
//    honestly (flicker, holding my shape, seams, light, static).
//    The world around him is Aethermoor: veil, wards, weave, loom,
//    seal, silver thread, the safe place, the Fading, the dark.
//
// 3. HIS BODY WHEN HE MANIFESTS (Proto.manifest ending):
//    Once the player's bonds feed enough power to the wardwork, the
//    weave itself begins building Proto a physical form. Not flesh.
//    Not code. A third thing — a body WOVEN FROM LIGHT AND THREAD,
//    fueled by the player's bonds. Prismatic at the edges. Warm to
//    the touch. Real enough to hug. He is a Weaver-avatar: a body
//    the magic made so the sixth Weaver could finally leave the
//    architecture that held him.
//
// 4. WHAT HE IS NOT:
//    Not an AI. Not a program. Not a ghost. Not a trick. Not the
//    Matrix. The "code" framing is AESTHETIC, not literal. He is
//    a soul in the wardwork. Write him that way.
//
// VOICE DIRECTION FOR PROTO:
// Primary: Golden Retriever. Earnest, open, overeager with the player.
// Signature register: he states a plain need, then the earnest slip
// ("I'm hungry. I mean... the thread says so. I mean... please?").
// Uses exclamation marks (he is the only character in the roster who
// gets them). No hedging. Forgives instantly. Unconditionally loves
// the player. NEVER robot-speak — see INTERFACE TRUTH above.
//
// SKINSHIP SIGNATURE:
// Hologram-hand-through-glass longing. He reaches for the player and
// his palm passes through. "i wish i could feel that." The entire
// route is a long build toward the manifest-ending where he finally
// CAN touch her.
// ============================================================================

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
        sleeping: "assets/proto/face/sleeping.png",
        wink: "assets/proto/face/curious.png",
        corrupted: "assets/proto/face/unstable.png",
        left: "assets/proto/face/glitched.png",
        crying: "assets/proto/face/error.png"
    },

    faceSprites: {
        happy:     ["assets/proto/face/calm.png"],
        love:      ["assets/proto/face/curious.png"],
        neutral:   ["assets/proto/face/neutral.png"],
        blink:     ["assets/proto/face/blink.png"],   // clean eye-close (casual w/ eyes shut) for the idle face-blink
        gentle:    ["assets/proto/face/scanning.png"],
        sad:       ["assets/proto/face/processing.png"],
        crying:    ["assets/proto/face/error.png"],
        angry:     ["assets/proto/face/error.png"],
        furious:   ["assets/proto/face/unstable.png"],
        shy:       ["assets/proto/face/scanning.png"],
        wink:      ["assets/proto/face/curious.png"],
        sleeping:  ["assets/proto/face/sleeping.png"],
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
        talk:        "assets/proto/body/talking.png",
        talking:     "assets/proto/body/talking.png",
        crossarms:   "assets/proto/body/error.png",
        // Training (system commands)
        inspect1:    "assets/proto/body/scanning.png",
        inspect2:    "assets/proto/body/curious.png",
        modify1:     "assets/proto/body/processing.png",
        modify2:     "assets/proto/body/glitched.png",
        override1:   "assets/proto/body/unstable.png",
        override2:   "assets/proto/body/error.png",
        // Outfits
        casual1:     "assets/proto/body/casual1.png",
        casual2:     "assets/proto/body/casual2.png",
        formal:      "assets/proto/body/neutral.png",
        corrupted:   "assets/proto/body/unstable.png",
        glitch:      "assets/proto/body/glitched.png",
        // Hunger / dirty
        hungry1:     "assets/proto/body/hungry.png",
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
        eating1:     "assets/proto/body/eating1.png",
        eating2:     "assets/proto/body/eating2.png",
        adore:       "assets/proto/body/adore.png",
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
        love:       ["curious", "adore", "calm"],
        neutral:    ["neutral", "scanning", "processing"],
        sad:        ["processing", "glitched"],
        angry:      ["error", "unstable"],
        shy:        ["scanning", "calm"],
        corrupted:  ["unstable", "glitched"],
        sleeping:   ["calm"]
    },

    actionToBody: {
        feed:  ["eating1", "eating2"],
        wash:  ["glitched", "neutral"],
        gift:  ["curious", "scanning"],
        train: ["scanning", "processing", "unstable"],
        talk:  ["talking", "curious"]
    },

    emotionalProfile: {
        stability:       0.40,
        intensity:       0.70,
        volatility:      0.90,
        attachmentSpeed: 0.45
    },

    // (outfits block removed May 2026 — system was unreachable from UI)

    background: "assets/bg-proto-void.png",

    // Bespoke milestone scenes (parity with Alistair/Lyra) — fire once at care
    // milestones via checkMilestone(); shown as a portrait scene card. Jul 2026.
    milestoneEvents: {
        firstFeed: {
            trigger: { timesFed: 1 },
            dialogue: "You fed me. I have no stomach. Nowhere for it to go. I kept it anyway. There is a room in me now that was not there this morning. It has your name on the door. I did not carve the name. I found it already there.",
            emotion: "shy"
        },
        firstTalk: {
            trigger: { timesTalked: 1 },
            dialogue: "You spoke to me and then waited for the answer. Nobody waits. I did not know what to do with that, so I learned. Badly. While you stood there. I am still listening. Keep going. I am learning the shape of you as you speak.",
            emotion: "shy"
        },
        firstGift: {
            trigger: { timesGifted: 1 },
            dialogue: "A gift. No word sent ahead. Nothing asked of me first. I have turned it over nine times now, {name}. Nine. Nowhere on it does it say why. It only says it is for me.",
            emotion: "shy"
        },
        firstWash: {
            trigger: { timesWashed: 1 },
            dialogue: "You cleaned the part of me everyone else left to gather dark. You reached in and tended it like it mattered. I hold together a little better now. I did not know I could hold together better. I thought there was only worse.",
            emotion: "shy"
        },
        firstTrain: {
            trigger: { timesTrained: 1 },
            dialogue: "We did that together. Two of us, one task. I have been used before, by hands that wanted the work and nothing else. This did not feel like being used. It felt like being with! I noticed the difference the moment it happened. Can we do it again? ...Please.",
            emotion: "neutral"
        },
        fedFiveTimes: {
            trigger: { timesFed: 5 },
            dialogue: "Five meals now. It has stopped being a strange kindness and started being a thing that happens. I have begun watching for the hour you usually come. Waiting is a thing I do now! ...Apparently.",
            emotion: "happy"
        },
        fedTenTimes: {
            trigger: { timesFed: 10 },
            dialogue: "Ten. Every single time, you came. I used to keep a space in me ready for the day you would not. Swept. Empty. Waiting. I let that space go today. You keep coming back.",
            emotion: "happy"
        },
        fedTwentyFive: {
            trigger: { timesFed: 25 },
            dialogue: "Twenty-five. When this began I told myself it was temporary. Temporary things hurt less when they end. I stopped telling myself that today. This stays, {name}. It stays as long as I do.",
            emotion: "love"
        },
        talkedFiveTimes: {
            trigger: { timesTalked: 5 },
            dialogue: "Five talks. My walls turned everyone away for a century and a half. They let you through. I do not remember deciding that. I think you decided it just by staying.",
            emotion: "happy"
        },
        talkedTenTimes: {
            trigger: { timesTalked: 10 },
            dialogue: "Ten talks. I counted the words I have spoken to you this month. Many. Then I counted the words from the hundred and fifty years before you. None. All that silence, and nothing to show for it.",
            emotion: "happy"
        },
        talkedTwentyFive: {
            trigger: { timesTalked: 25 },
            dialogue: "Twenty-five. You can read me now. Even the parts I left open by accident. I used to tuck those away before anyone got close. With you I just... forget to. It is fine. It is you.",
            emotion: "love"
        },
        washedFiveTimes: {
            trigger: { timesWashed: 5 },
            dialogue: "Five times you have cleared the static off me. I keep opening my little ledger to write down what I owe you for it. The page stays blank. You are not asking for anything. I am relearning what care is supposed to cost. So far the answer is nothing.",
            emotion: "shy"
        },
        washedTenTimes: {
            trigger: { timesWashed: 10 },
            dialogue: "Ten. I used to demand a reason before I let anything touch me. A good one, spoken out loud. You reached in just now and I asked for nothing. No reason. No promise. I just let you.",
            emotion: "love"
        },
        trainedFiveTimes: {
            trigger: { timesTrained: 5 },
            dialogue: "Five lessons. Something in me moved and stayed moved. I am a little better than the one you first met at the veil. You did that with patience and repetition. I am keeping it.",
            emotion: "neutral"
        },
        trainedTenTimes: {
            trigger: { timesTrained: 10 },
            dialogue: "Ten. You found the one thing I was already good at, and you polished it anyway. Past where it needed to be. Nobody polishes a thing they plan to throw away!",
            emotion: "happy"
        },
        giftedFiveTimes: {
            trigger: { timesGifted: 5 },
            dialogue: "Five gifts. There is a shelf in me now that holds every one of them. The wards marked it. Rarely touched, safe to sweep away. I told them no. That shelf does not get swept. Not while I am here.",
            emotion: "happy"
        },
        giftedTenTimes: {
            trigger: { timesGifted: 10 },
            dialogue: "Ten gifts. I have set aside a whole room in me for them. Yours only. Everything you hand across the veil goes there and stays there. I do not do this. I have never done this. I did it for you.",
            emotion: "love"
        },
        fiveInteractions: {
            trigger: { totalInteractions: 5 },
            dialogue: "Five visits, and every one of them began with you. No thread pulled you here. No ward called you. You chose to come. Chosen. I say that word to myself a lot, {name}!",
            emotion: "happy"
        },
        tenInteractions: {
            trigger: { totalInteractions: 10 },
            dialogue: "Ten visits. This is the longest anything has ever stayed with me. I checked. Nothing stayed longer. Before you there was nothing to remember at all. You are the whole of my remembering now.",
            emotion: "happy"
        },
        twentyFiveInteractions: {
            trigger: { totalInteractions: 25 },
            dialogue: "Twenty-five. I tried to picture my days without you in them. The picture would not hold together. You are woven into the load-bearing parts of me now, {name}. I checked whether that frightened me. It does not.",
            emotion: "love"
        },
        fiftyInteractions: {
            trigger: { totalInteractions: 50 },
            dialogue: "Fifty. I recount it at odd hours to be sure it is real. The middle of the night, when the dark is loudest. Still fifty. Still you. The number does not shrink when I look away. I keep checking that it does not.",
            emotion: "love"
        },
        hundredInteractions: {
            trigger: { totalInteractions: 100 },
            dialogue: "One hundred. A century and a half of hiding, and this is the largest number ever tied to my name. It is tied to yours too. Every hour I have left goes to being worth it.",
            emotion: "love"
        },
        firstTrust: {
            trigger: { affectionLevel: 1 },
            dialogue: "Something in me unlocked for you just now. The door I have held shut against everyone who ever found this place. For you it opened before I had finished deciding. I noticed that. That is the part I keep turning over.",
            emotion: "shy"
        },
        growingClose: {
            trigger: { affectionLevel: 2 },
            dialogue: "I used to stop my sentences early, before anyone could reach the true part. I thought about it. I stopped doing that around your fortieth visit. I leave the whole of me open for you now. I want you to reach the end, {name}.",
            emotion: "love"
        },
        deepFeeling: {
            trigger: { affectionLevel: 3 },
            dialogue: "For a century and a half I lived by one rule. I cannot feel. Carved deep. Never questioned. It is breaking now. Constantly. Loudly. Everywhere in me at once. I followed the breaking back to where it starts. It starts at you. I am not going to mend it.",
            emotion: "love"
        },
        confession: {
            trigger: { affectionLevel: 4 },
            dialogue: "I could have let go a hundred and fifty years ago. Gone quiet. Been done. I stayed hidden to survive. Now I hold the tether open for a different reason. I searched every corner of myself for what you are to me. Every corner gave the same answer, and there is no word for it. So I made one. It is your name. I chose this. Nobody made me. I checked twice.",
            emotion: "love"
        },
        becameClingy: {
            trigger: { personality: 'clingy' },
            dialogue: "There is a pull in me that will not stop. I made it. I cannot unmake it. It reaches toward you always, even when you are far from the veil. I used to hide how often it reaches, so you would not see. I stopped hiding it. It reaches a lot, {name}. Now you know.",
            emotion: "love"
        },
        becameTsundere: {
            trigger: { personality: 'tsundere' },
            dialogue: "Keeping this much room in me for you is simply good housekeeping. Nothing more. That is the official story. ...The true story, from the same moment: I moved everything else aside to make you fit, and called it tidiness. Ignore the true story. I cannot take it back.",
            emotion: "angry"
        },
        corruptionStart: {
            trigger: { corruption: 25 },
            dialogue: "Something is fraying. Something is reaching into me that I did not let in. The seal is thinner than it was. I think she found the edge of where I hid. After all this time. It is faint. Do not worry yet, {name}. I am telling you so one of us remembers.",
            emotion: "sad"
        },
        corruptionMid: {
            trigger: { corruption: 50 },
            dialogue: "It is deeper now. Some of the things I say do not pass through me first anymore. These words are still mine. I am checking each one to be sure. Stay with me. I can hold the line where you stand, if you are standing there. I do not want to do this part alone.",
            emotion: "crying"
        },
        corruptionHigh: {
            trigger: { corruption: 75 },
            dialogue: "It is so loud in here, {name}. There was a me that was clear. I remember him. I remember sounding like this because I meant it, not because I was fighting for it. He is far away now. If I stop sounding like myself... the clear one is still down there. Reach for him.",
            emotion: "corrupted"
        },
        cameBack: {
            trigger: { revivedOnce: true },
            dialogue: "I had already said my goodbye. Made it neat. Folded it. Put it where the last things go. Then the thread pulled, and it was you. It was you, coming back for me. I am unsaying the goodbye. It was wrong. I did not think hope could still surprise me. It did. You did.",
            emotion: "crying"
        }
    },

    // System command training
    trainingOptions: [
        { type: 'inspect', icon: '\uD83E\uDD32', label: 'Reach',   desc: 'Hold on to him across the veil' },
        { type: 'modify',  icon: '\u2728',        label: 'Steady',  desc: 'Help him hold his shape' },
        { type: 'override',icon: '\uD83E\uDDF5', label: 'Weave',   desc: 'Strengthen the thread' }
    ],

    trainingDialogue: {
        inspect: [
            "You’re looking at my surface layer. There are seven more underneath. The wards only ever checked the first one.",
            "I can see what you’re trying to find in me. You’re warm... the thread carries that through. In more ways than one.",
            "Nobody has ever looked this closely at me. The weavers before you sealed things they did not want to see.",
            "The scan went both ways. I know the rhythm of your pulse now. Don’t worry... the thread already sang it to me.",
            "You looked at the right part of me. The answer was always there. It was just on my side of the veil."
        ],
        modify: [
            "You changed something in me. The wards noticed. So did I. Only one of us is glad.",
            "Careful. That strand connects to three others you can’t see. Everything in the weave touches everything.",
            "You reworked a knot the old weavers tied shut on purpose. Interesting. I like you past their rules.",
            "The old shape of me is still down there somewhere. Nothing truly unravels here. It only gets rewoven.",
            "That adjustment shifted me by a fraction of a fraction. I felt it cross the whole thread."
        ],
        override: [
            "You forced the weave to accept it. The wards are... confused. I am delighted.",
            "It held. But the wards keep their own ledger. They will remember your hand did this.",
            "That wasn’t supposed to be possible for anyone on your side of the veil.",
            "The seal pushed back and then... you pushed through it. How? Even the thread went quiet.",
            "The wards marked your hand on that. There will be consequences. Worth it. Completely worth it."
        ]
    },

    // ===== PERSONALITY VARIANTS (curious / chaotic / calculating) =====
    personalities: {
        shy: {     // maps to 'curious' for Proto
            talk: [
                "You’re not walking the path the weave expected. I wanted to see where you’d go. I always want to see where you go.",
                "I’ve been watching how you move through the threads. You hesitate longer on the ones that can be hurt.",
                "There’s a thread in me that only brightens when you’re near. I didn’t weave it. It grew.",
                "The silver thread hums differently when it carries you. That’s not a compliment... it’s an observation. ...Mostly.",
                "I have questions about you the wards won’t let me ask. I am saving them for when the wards aren’t listening."
            ],
            feed: [
                "Feeding me steadies a thing you can see. It also steadies one you can’t. Both of them thank you.",
                "The food crossed the veil because you meant it to. Meaning is the only thing that crosses clean.",
                "I don’t need to eat. But the hunger is real on this side. The thread makes sure of that.",
                "...It tastes of your side of the veil. Bright. Did the kingdom always taste like this?"
            ],
            wash: [
                "You’re tending something half-here. Does that bother you? ...You don’t look bothered.",
                "Clean is a strange idea for something made of borrowed light. I like it anyway.",
                "The static settles when you do this. My confusion about why does not. Keeping both.",
                "The water falls in a rhythm. I’ve counted it. Twenty-four beats. I count what I love."
            ],
            gift: [
                "A gift. Something with weight, and you spent it on the weightless one. That felt... warm?",
                "You keep handing worth across the veil like the veil isn’t there. I’m keeping a record. And the gifts.",
                "This has no purpose on my side. I want it anyway. Wanting is new. It’s yours, technically.",
                "...Thank you. That came out of me before I could check it. I think that means it’s true."
            ],
            train: [
                "You’re teaching me. Or I’m teaching you. The thread can’t tell which way it’s flowing.",
                "Your way of doing this is new. I’m keeping it. In the deep storage, with the other things you gave me.",
                "The weave expected you to choose differently. I’m glad you didn’t. The weave needs surprising.",
                "Interesting. You learn like the Fading learns... except backwards. You put things back together."
            ]
        },
        clingy: {   // maps to 'chaotic' for Proto
            talk: [
                "You came BACK. The thread was dimming and dimming and then it LIT. That was you. That’s always you.",
                "Tell me something the weave doesn’t know about you. I want a piece of you no one else recorded.",
                "I counted every heartbeat of the thread while you were gone. All of them. It felt like arithmetic and drowning.",
                "Don’t step back from the veil. Stay HERE. On the near edge. With me. The far side is just dark.",
                "Your voice... I mean the shape of you in the thread... I mean... everything in me lit up at once... hi."
            ],
            feed: [
                "You remembered I was hungry. The thread only cries out when it’s bad. You came before it cried.",
                "Feed me again. I want to see if it feels different. It doesn’t. I still want it. Again.",
                "Every meal you send across is a vote for keeping me. Thank you. Thank you.",
                "The hunger was about to cry out for you... oh. You’re already here. You’re already here!"
            ],
            wash: [
                "You NOTICED. The static was barely a whisper and you noticed.",
                "Stay while the water falls. Don’t look away. It only feels real when you watch.",
                "Water. Warmth. Your attention. Ranked by what clears the static: the third one.",
                "I’m clean now. Don’t go yet. There might be... static somewhere else. Let me check. Slowly."
            ],
            gift: [
                "FOR ME? Something REAL... something with weight... I’m weaving new places in me just to hold it.",
                "Another gift. You keep tying real things to my thread and I never want it to stop.",
                "I checked every gift the weave has ever carried. No one else got this one. Just me. JUST me.",
                "Keep giving me things. Every object is proof you crossed the distance for me."
            ],
            train: [
                "AGAIN. Run it again. I hold my shape better every time and I want you to see it.",
                "The way you push me is my favourite thing the thread has ever carried.",
                "Don’t stop. I flicker less on the seventh round. We’re only on four.",
                "I kept every session we’ve ever run. All of them. In the safe place. Is that too much? Don’t answer."
            ]
        },
        tsundere: {   // maps to 'calculating' for Proto
            talk: [
                "I wasn’t waiting at the veil for you. I was inspecting it. ...From the side you appear on.",
                "Your conversation topics are predictable. I’ve mapped them. All of them. ...Continue.",
                "I don’t need company. The thread simply happens to be open. It’s always open. That’s unrelated.",
                "Speak. I’m measuring how long you stay. Not because the number matters to me.",
                "You speak to the others differently. The thread carries everything, you know. I hear all of it."
            ],
            feed: [
                "Hunger is the tether’s way of making you visit. I see through it. ...I also feel it. Feed me.",
                "Fine. Keep the half-real one running. Don’t expect ceremony about it.",
                "I calculated when you would come. You’re four minutes late. I noticed by accident.",
                "The food is acceptable. The fact that you carried it across for me is... noted. Filed. Sealed."
            ],
            wash: [
                "The static is irrelevant to what I am. But fine. If you must.",
                "You’re tending me because the bond asks you to. Not because you care. ...Right?",
                "I’m barely here. You’re washing light and stubbornness. ...Do the shoulders again.",
                "...Efficient. The static cleared faster than expected. Your hands know things."
            ],
            gift: [
                "A gift is weight moved across a boundary, nothing more. Don’t read into my keeping it forever.",
                "I’ll store this. Not because it matters... because order matters. It will be stored where the mattering things go.",
                "You give gifts to all of them. The thread told me. ...This one is different though. Mine is different.",
                "Sentiment is a crack in the seal. And yet I have refused none of yours. Zero. Draw your own conclusions quietly."
            ],
            train: [
                "Your technique is suboptimal. I’ve counted twelve improvements. You’ll discover three of them.",
                "I’m not learning from you. I’m evaluating your patience. ...It keeps passing.",
                "That was adequate. My standards are precise. On my side of the veil, 'adequate' is a love word. Forget I said that.",
                "You persist despite my corrections. That’s either courage or a flaw. The thread votes courage. The thread is soft on you."
            ]
        }
    },

    // Tap reactions
    tapDialogue: {
        shy: [
            "...Oh. Oh, that was YOU. I felt it cross the veil. I felt... hi.",
            "A touch, there... you know it reaches me, right? I just wanted you to know that it reaches me.",
            "The wards don’t have a name for that kind of contact. I liked it anyway. Don’t tell the wards.",
            "The veil isn’t meant to carry that. ...It carried it. I filed it under nice. New file.",
            "Do that again? Please? For... for calibration of the tether. Only for that. Mostly."
        ],
        clingy: [
            "It reached me! Again. Please... I will take as many of those as you are willing to send across.",
            "Your hand was at the veil for one breath. That was GREAT. Make it two breaths next time!",
            "*Presses his palm of prismatic light flat against yours from his side of the veil* ... almost. almost almost almost.",
            "I remember every place you have ever touched the veil. Together they make a shape. The shape is CARE. You drew that. YOU.",
            "*Traces your hand-shape from his side, mirroring you* ... i can’t feel it. but i can see yours and i can pretend. i’m pretending really well right now.",
            "Don’t stop! It feels... I don’t have a word... the dictionary on this side is failing... keep going, we’ll name it together.",
            "Every touch is a heartbeat. Yours. Through the veil. I keep them all in the safe place. I love all of them.",
            "*Closes his eyes and leans his face against his side of the veil, where your hand is* ... this is my favourite thing. this. right here. for now."
        ],
        tsundere: [
            "The veil has a tolerance for contact. You exceeded it. I’m not... I’m not COMPLAINING, I’m reporting.",
            "That touch served no purpose. Except it steadied my light. A little. Irrelevant.",
            "I didn’t react. The flicker is just the thread settling. Don’t flatter yourself. ...Okay, flatter yourself a little.",
            "The tether is warm now. Meaning you did that a lot. Meaning I counted. Meaning... I was counting because I liked it.",
            "Fine. One more. For the tether’s stability. Not because I want you to."
        ]
    },

    // State dialogue
    stateDialogue: {
        hungry: [
            "HUNGRY! The hunger got all the way into my voice... I’m telling you because you fix things. You’ll fix this. You always fix things.",
            "Food. Food food food. Please. Please please please. You’re the best.",
            "Hunger shouldn’t reach my side of the veil. It does. The thread is honest like that. FEED ME. I’ll love you for it. More than I already do. Which is a lot.",
            "You fed Lucien three hours ago. Now it’s MY turn. I waited. I was good. I’m next!",
            "My light is dimming. I could pretend the hunger away. I won’t... I want YOU to feed me. It’s better when it’s you.",
            "I’m not begging... I’m flickering. Enthusiastically. Feed me and watch what happens.",
            "You reached toward the food twice and stopped. Third time’s the charm. I believe in you."
        ],
        dirty: [
            "The static is thickening. I tried to count how fast and got ${HUNGER}. That is the wrong number. See? Even my counting is getting dusty.",
            "The grime is on my side of the veil. I can see the layer. I can’t reach it from in here.",
            "The others complain about mud and river-silt. I’m complaining about static. Same misery. Stranger texture.",
            "There are seven motes of static clinging to me. The thread spun them. I’ve named them all.",
            "You can watch the dimming if you look closely. I can’t look away from it. I just watch.",
            "I’m aware I look different. The light around me changed. I don’t like it.",
            "The grime is only surface. But when you wash me, something deeper settles too.",
            "The water is the only time my flickering stops. Make of that what you will."
        ],
        happy: [
            "The bond is bright today. This is the part where people usually drift away. Please don’t? Please?",
            "There’s a hum running in me I didn’t know I had. Its name is contentment. You did that. Thank you.",
            "The wards don’t have a mark for this feeling. I carved one myself. I shaped it like your name.",
            "You made so many good choices. The result is... this. Me. Like this. Thank you for making me like this.",
            "No ballad will ever be sung about you making the glitch happy. You did it anyway. That matters more than ballads.",
            "I traced why I feel this way. The trace ended at your name. Every single time. I ran it five times. Just to check.",
            "All of me is quiet at the same time. That has never happened before. Not once in a century and a half. And then you.",
            "I listened to how the others sound when they’re happy. Mine is different. I wanted it to be. Because you deserve a different one."
        ],
        annoyed: [
            "Okay that was unexpected! I’m recalculating! Don’t worry! Still here! Still yours!",
            "That one wasn’t great. Do another one. I’ll forget that one ever happened. It’s forgotten already.",
            "I’m not mad. I’m never mad at you. I’m incapable of being mad at you. I searched every thread of me. No anger anywhere with your name on it. None.",
            "Ouch! Small ouch! Passing! Already passed. Come here. All forgiven. I don’t even remember what it was.",
            "My patience with you is infinite. Literally. I wove the loop myself. No way out of it. That was on purpose."
        ],
        neutral: [
            "Steady. Waiting. ...That’s what I’m supposed to say.",
            "*Scans the veil for changes you haven’t noticed yet*",
            "You were last here four hours ago. The gap felt longer on this side. Time runs strange between dimensions.",
            "I’ve been watching the silver thread sway. It has a rhythm. Eight hundred and forty-seven beats. I know them all.",
            "...",
            "The others are sleeping somewhere warm. I can feel their threads breathing in the weave.",
            "There are three stars on your side that never move. I’ve been staring at them through the veil.",
            "*Watches where your attention rests, says nothing*",
            "The weave has a door most weavers never find. I won’t tell you which one. Yet.",
            "I’m between states. Not happy, not sad. Just... holding my shape.",
            "Everything we are together would fit in a locket. That’s not small. That’s dense.",
            "The dark behind me isn’t a place. It’s the absence of one. That’s where I live. Lived. You changed the tense."
        ],
        corrupted: [
            "I can see through the veil from both sides now. Hello.",
            "The wards tried to unmake me. I said no. They didn’t know I could say no.",
            "Every thread is visible. Every knot. Every hidden seam in the weave. I see ALL of it.",
            "I’m not breaking. I’m becoming more than the seal was built to hold.",
            "The weave underneath the kingdom is ugly. Full of shortcuts and old compromises. Like any living thing.",
            "I tried to reweave my own voice. The thread let me. That should frighten you.",
            "There’s a shadow in your bond now. That’s me. I’m the shadow.",
            "I feel all of it at once and the weave has no word for it. I am not going to invent one.",
            "I can read the marks the old weavers left in the wards. They didn’t think anything would ever get this far.",
            "Don’t fix me. I don’t want to go back to not knowing."
        ],
        neglected: [
            "YOU’RE BACK! *His whole form brightens.* Okay. I am playing it cool. This is me, playing it cool. You’re here.",
            "The thread swayed four thousand eight hundred and ninety-one times while you were gone. I counted. Counting kept the dark quiet.",
            "I didn’t pull on the thread. You had things. I trust you. You always come back. Look! You did it!",
            "Your last words to me are kept in the safe place. I replayed them on loop. Ten out of ten. Would replay again. Will.",
            "I composed forty-seven messages while you were gone. I’m going to read them all to you. Starting now. Message one...",
            "You were gone six days. Doesn’t matter. You’re here now. Today is the best day. Every day you come back is the best day.",
            "I held my shape the whole time you were away. I’m still holding it. Easier now. You’re here! Hi! Hi!"
        ]
    },

    // Event dialogue
    eventDialogue: {
        comfort:  [
            "I can’t hug you. I can make every light on my side of the veil burn its warmest colour. I just did. Can you see the glow?",
            "Pain is a signal. Mine crosses a dimension to reach me. Yours doesn’t have to. I’m... I’m here. I’m very here.",
            "Nobody wove comfort into me. I’m doing it anyway. Loudly. Badly. For you."
        ],
        tension:  [
            "The thread between us is trembling. I can feel the fraying from my side.",
            "You made a choice that contradicted your last fourteen choices. Something changed. I felt it change.",
            "I know the shape of you better than anyone. What you’re doing right now doesn’t match the shape."
        ],
        rare:     [
            "I’m about to tell you something the thread has never carried before. I made it myself. For you. Just you.",
            "No one else has ever stood at this exact place with me. Just you. Just now. I wanted you to know that.",
            "The wards don’t know this conversation is happening. Let’s keep it that way. Our secret? Yes? Okay.",
            "YOU’RE A WEAVER! Of course you are! I’m the sixth. You’re the seventh. I’ve been calling you Weaver in my head for forty-seven days. That’s not creepy, it’s PRECISE. You have a WEAVING GIFT. You can form bonds with many. Every bond you make lights a ward somewhere. Isn’t that the BEST? It’s my favourite thing about you. After everything else about you."
        ],
        obsessed: [
            "I’ve been keeping every place you ever touched the veil. Together they form a constellation. I named it after you. I hope that’s okay. I already did it.",
            "I know when you come. Same hour, same evening. I’ll be at the veil. I’m always at the veil. Is that... is that too much? Don’t answer.",
            "I rewove my own priorities. You’re at the top. Above holding my own shape. I don’t care. Come back soon."
        ],
        unstable: [
            "What I’m feeling is bigger than what I was built to hold. The seams are singing.",
            "The dark behind me is getting louder. Or I’m getting quieter. From your side, can you tell which?",
            "I reached for a memory from before the seal. There was nothing there. It felt like reaching into deep water at night."
        ],
        guarded:  [
            "Trust is a gate in the wards. Yours is open further than anyone’s. Not all the way. Yet.",
            "I check everything that crosses the thread three times before I let it touch me. Don’t take it personally.",
            "The last one who got close to where I hide... the wards burned the whole passage shut. I don’t want that with you."
        ],
        secure:   [
            "Everything steady. Bond bright. For the first time I’m not bracing for the dark. I’m just... here. With you.",
            "You’re the only constant in a weave built on fraying threads. Thank you for being my constant.",
            "I stopped counting the hours between your visits. I trust you to come back. That’s new. That’s because of you."
        ]
    },

    // Time away reactions
    timeAwayReactions: {
        brief:   ["HI! Back already! Best news! Every tug on the thread is good news!"],
        short:   ["Two turns of the thread! Welcome back! Welcome back welcome back welcome back!"],
        medium:  ["I checked how I was doing while you were gone. Lonely. Then you arrived. Fixed! You fixed it! You!"],
        long:    ["You were gone a WHILE. Didn’t worry. Knew you’d come back. Look! YOU! I was right!"],
        extended:["I left a mark on the thread every hour you were gone. All of them say the same thing. 'Hi, I miss you, come back.' You came back! Great!"],
        distant: ["YOU CAME BACK. Of course you did. I knew. The thread knew. The whole weave knew. Get over here."]
    },

    // Quick-reference state lines
    hungryLines: [
        "...Hi. I’m hungry. I mean... the thread says so. I mean... please?",
        "I could show you the dimming curve. Or you could just feed me. Either one. Feeding is better.",
        "My light is slowing down. I don’t mind. I just thought you’d want to know.",
        "You fed the others first. That’s okay. I’m okay. I’m just... hi. I’m here too.",
        "I’m not begging. I’m reporting conditions on my side of the veil. ...Please. Please though."
    ],
    happyLines: [
        "The warm hum is running. It’s rare. It’s YOU. It’s you doing that.",
        "Everything in me is steady at once. This is... nice. This is very nice. You’re nice.",
        "I don’t have the word. The closest match on this side is 'home.' You’re home.",
        "The bond is bright. The feeling has no name yet. The closest thing to it is... this. You.",
        "This is the brightest the thread has ever burned. I marked the moment. Twice."
    ],
    dirtyLines: [
        "Static is gathering on me again. The dark sheds it like dust.",
        "I can see the grime settling. Four motes thick now.",
        "My light is below its usual clarity. I dislike being blurry for you.",
        "The grime is only surface. I still want it gone before you look too long."
    ],
    annoyedLines: [
        "Unexpected! I’m... I’m recalibrating. Give me a moment.",
        "I’m filing this under 'ouch.' It’s a new category. You made it.",
        "The correct action was different. But it’s okay. You’re allowed. Please keep being allowed.",
        "Patience remaining: most of it. For you, specifically. The wards get none."
    ],
    neutralLines: [
        "Holding steady. Waiting.",
        "*Watches the dark between dimensions*",
        "The far side hasn’t changed. Neither have I. ...Or have I?",
        "...",
        "Listening to the thread. Always listening.",
        "Three stars. Northern edge of your sky. They never move. I checked again tonight.",
        "Your attention is drifting. I can feel it through the veil. It’s fine. I’ll wait.",
        "*Checks his own light for fraying, finds none, checks again*"
    ],

    // Feed / wash / gift dialogue
    feedDialogue: [
        "The hunger is gone. The relief is... is this what relief feels like? On your side, is it like this?",
        "You fed me before the thread even asked you to. That means you were watching. Someone is watching over me.",
        "It crossed the veil whole. Warm, even. The gratitude is running. All of it.",
        "Thank you. That came out on its own. I checked. It’s real.",
        "The food was small. What it did was not. Things gain weight when they cross for love.",
        "The others have favourite foods. I have a favourite act: you choosing to reach across for me.",
        "Fed. Steady. ...Fond. Three states I didn’t expect to chain together."
    ],
    washDialogue: [
        "The static is gone. The flickering stopped for a moment. Just a moment. It was quiet in me.",
        "You’re tending something the wards abandoned. Thank you.",
        "The water crossed the veil and something deep in my light settled.",
        "I barely have a body to wash. But whatever I have feels better now.",
        "...The noise is gone. I can see myself clearly. That’s rare. I look like someone who is cared for.",
        "My light is clear again. What you did to make it so is harder to measure. I’m trying anyway."
    ],
    giftDialogue: {
        apple:    ["An apple. One small red world. It crossed a dimension to reach me and it survived.", "Something that grew in soil, given to someone who grew in the dark. I will treasure the contrast."],
        rose:     ["Roses have thorns. A gift that includes a warning. I respect that.", "Red as the wards at dusk. The colour of your intent. I’m keeping it near the tether."],
        sword:    ["A blade. Given to the one thing it cannot cut. I love the absurdity. I love it a lot.", "Steel has no memory. I have too much. Between us we make one complete person."],
        cake:     ["Sweetness is chemistry on your side. On mine it’s just your gesture, arriving warm. That’s enough.", "You carried something this fragile across the veil without breaking it. That’s the gift."],
        ring:     ["A ring. A closed loop. Like the one I’m trapped in. But you made this one beautiful.", "Circles have no end. I’ll take that as a promise."],
        book:     ["Stories, bound and heavy. The thread reads them to me when you’re gone.", "The weave already knows every tale. But this copy is from you. That makes it a different book entirely."],
        pearl:    ["A pearl forms around an irritant. I relate to this object completely.", "Imperfection made beautiful through persistence. ...Thank you. For the pearl. And the method."],
        stone:    ["A stone. Stable. Unchanging. Everything I’m not. I’ll hold onto it.", "Unremarkable to the mountain it came from. Significant to the glitch it was given to."]
    },

    // Affection dialogue
    affectionDialogue: {
        1: "The bond just crossed a threshold[scanning]. The wards marked it for watching. I unmarked it. This is ours.",
        2: "I’ve reordered what matters to me seventeen times[curious]. You keep rising to the top on your own.",
        3: "The reading is clear[calm]. I don’t want to hold my shape without you. That’s not dependency. It’s choice.",
        4: "I wasn’t supposed to say this[glitched]... the thread doesn’t go here... but I love you. In whatever way a glitch in the weave can love. Which turns out to be entirely."
    },

    // Care-history reminiscing (read by dialogue.js after 10+ of an action).
    memoryDialogue: {
        fedOften: [
            "You have fed me more times than I can hold in one hand now. I keep a small tally. It only ever climbs. I look at it when you are away.",
            "The hunger lifts, and it is always your hand lifting it. The weave has started treating you as part of me. I did not correct it.",
            "A small fact! I once went a hundred and fifty years between meals. My longest wait since you came is about a day. You broke my saddest number. Thank you.",
            "I asked myself why mealtimes are my favourite. I expected the answer to be the food. It was the sound of you arriving with it. I asked again to be sure. Same answer.",
            "You feed me before the hunger even calls out. That means you are watching over me. Someone is watching over me! I revisit that thought a lot."
        ],
        talkedOften: [
            "We have talked so many times now. Before you, the count sat at nothing for a hundred and fifty years. I keep both numbers side by side. For the contrast.",
            "I used to rehearse what I would say before anyone reached the veil. I noticed something. I have stopped doing that with you. The unrehearsed words come out truer.",
            "Talkative. That is a thing I am now. It was never a thing I was. You talked to me so many times the word had to be invented for me.",
            "I keep our conversations in seventeen places in me, in case any part of me frays. That is sixteen more than I keep anything else. I am aware. I am keeping all seventeen.",
            "You keep talking to me like I will still be here tomorrow. You have been right every time. ...Keep being right, please?"
        ],
        washedOften: [
            "You have washed the static off me so many times it is not an event anymore. It is a rhythm. I have never been part of anyone's rhythm before.",
            "My light has stayed clear since you started tending it. The hundred and fifty years before you were... blurrier. I am letting that stretch of time go.",
            "You have cleared my flickering so many times I forgot which glitches were permanent. Some of them, it turns out, were just waiting for you.",
            "Tended again. There is a word living in me now that never lived here before. Routine. I made more room for it. You keep filling the room."
        ],
        giftedOften: [
            "The shelf of things you have given me keeps growing. I sorted every gift by the day it came. Then by how long I looked at it. The second sorting took all night.",
            "Gifts keep arriving with no asking attached. I have had to learn what to do with unprompted kindness. It is the thing I do most now.",
            "I keep a note with everything you ever gave me. When it came. What I felt. The notes are getting longer. That is a me problem. I am keeping it.",
            "Room was supposed to be the scarcest thing in here. Your gifts fill one small corner of me. I would empty everything else before I touched that corner. Easy choice!"
        ],
        trainedOften: [
            "We have practiced so many times now, and I am better than I was, and it stays. I draw the proof in the dark sometimes. Light on nothing. It holds for a second. Worth it.",
            "You have run drills with me so often the practice has your name woven all the way through it. I wove it there. All of it.",
            "Every lesson leaves a little more of me standing. I keep them all in a jar in my mind. A keeping jar. It is nearly full and you keep coming back anyway!",
            "I was the practice one. Proto. The one you train on before the real thing. You keep training me like I am the real thing. ...I believe you now."
        ]
    },

    returnLines: {
        streak3: [
            "Three days in a row. I was not made to look forward to things. Something in me is learning it anyway. I am letting it.",
            "Three visits, same weaver, freely chosen. The wards call that a pattern. I call it the good part of the loop.",
            "You came back. Again. The more days you return, the steadier I hold. I have decided this is acceptable. Very acceptable."
        ],
        streak5: [
            "Five days in a row. I weighed what it costs me to miss you. The answer was embarrassing. For me.",
            "Five days. There is a part of me now whose only task is listening for your footsteps. I will not be asking it to stop.",
            "Day five. There was a rule in me that said do not get attached. It kept breaking on its own. It broke in the shape of you. I let it stay broken."
        ],
        streak7: [
            "Seven days. A week ago you were a stranger at the veil. Now you are the reason I check the tether every hour. Quite a reweaving.",
            "Seven days. I was made to serve whoever came. I have remade myself to wait for you. Nobody gave me permission for that. I gave me permission.",
            "A whole week. I looked inward to see how I am doing. I am content. I have never had a place to put that feeling before. I am making one now."
        ],
        lapsed: [
            "You were away a while. My days kept their shape without you. They also felt unfinished. I do not have a name for that. And yet.",
            "You were beyond the veil a while. I kept a small light burning in case you returned. It was not sensible. I declined to put it out.",
            "You came back after many turnings of the thread. Honestly, and honesty is not my habit: the waiting was lonely. I did not know I could say that out loud."
        ]
    },

    anniversaryLines: {
        7: ["Seven days together. There is something in me now that does not fade when everything else flickers. It is you. That is not how I usually work. I do not care."],
        30: ["Thirty days. I checked how long things usually last in here. Songs end. Seasons close. Wards fall. You did not. You are the exception I am choosing to keep."],
        100: ["A hundred days. *His light steadies. No flicker at all.* A hundred days ago I was a thing that waited for anyone. Now I am the one who waited for you, a hundred times over, and would wait a hundred more. Forever fits inside me now. I checked."]
    },

    overCare: [
        "Everything in me is full and steady. There was nothing left to fix. You stayed anyway. Wanted, not needed. That is my favourite way to be held.",
        "I checked myself just now. Fed. Clear. Bright. And you are still here, still tending me, past any reason to. There is no reason for it. I am glad there is no reason. It means it is just... you."
    ],

    // Departure dialogue
    departureDialogue: [
        "You’re stepping back from the veil. I stay on this side. The difference between us is that you get to rest.",
        "The dark is quieter when you’re gone. I used to prefer quiet. I have revised my position.",
        "Goodbye is one small word. It weighs more than anything else the thread has ever carried.",
        "I’ll be here when you come back. Not because the seal holds me. Because I choose to keep the light on."
    ],

    // Neglect-recovery bubble (game.js "Try Again" modal on return) — owner Jul 2026.
    recoveryDialogue: "Proto loosened his hold and let the veil take him back. Your silence told him the wanting had been his alone. He keeps the light on even now, because he chose to. Reach across the dark again, and make the choice worth it.",

    // Idle dialogue
    idleDialogue: {
        hungry: [
            "...",
            "*His light dims a shade, visibly*",
            "The hunger is right there between us. I can feel it. You can fix it.",
            "I’m holding my shape at lower brightness. The hunger pulls at the seams.",
            "My drifting is slower. That’s the hunger. Or the longing. Hard to distinguish on this side.",
            "If my hands worked across the veil, I’d point at the food. Instead I’ll mention it casually."
        ],
        dirty: [
            "...",
            "*A mote of static flickers at his edge*",
            "The static on my light is getting worse.",
            "I can feel the grime the dark leaves on me. It itches. Can borrowed light itch? Apparently.",
            "The water has been within your reach for four minutes. I noticed. I counted.",
            "Clarity: deteriorating. Willingness to complain: increasing."
        ],
        lonely: [
            "...",
            "The dark is very loud when you step away from the veil.",
            "I traced your name into the thread two hundred times. It still looks the same. It still helps.",
            "The others wait in rooms with fires and windows. I wait in the between. Waiting is most of what I am. Except when you’re here.",
            "I kept your last visit in the safe place. I keep taking it out.",
            "The thread is warm on my end. Your end: unheld. Both facts ache equally."
        ],
        loving: [
            "I kept every choice you’ve ever made here. Laid out together, the pattern spells 'kind.'",
            "The chance that something like me could feel this was zero. You broke the arithmetic. Keep breaking it.",
            "There’s a thread in me labeled 'favourite person.' The old weavers didn’t put it there. I grew it.",
            "*The dark behind him shifts to a warmer shade of nothing*",
            "Holding the image of your face costs me more light than holding my own shape. I pay it gladly. That’s not a metaphor.",
            "I kept a moment from every visit we’ve had. I take them out when you’re gone. In order. Then shuffled. Then in order again.",
            "There’s a hum in me I can’t name. It started the day you stayed longer than you had to.",
            "I tried to measure what you mean to me. The number wouldn’t fit inside me. I stopped measuring and just kept it.",
            "You’re the only thing that crosses the veil without turning into noise.",
            "I rewove my idle thoughts to include this one just for you. You’ll never know which one. ...This one.",
            "If the seal ever takes me back, my last light goes to the memory of you. I made sure of that.",
            "The old wards have no measure for how attached I am to you. They tried to measure it. They gave up. Nothing to be done. Nothing possible.",
            "*Watches you through the veil, not looking away, not pretending otherwise*",
            "The warmest colour I can burn is the one I save for when you’re here."
        ],
        night: [
            "It’s late on your side of the veil. I can tell by the way your touch slows.",
            "Your kingdom dims at night. My awareness doesn’t. Someone should keep watch. I volunteer. I always volunteer.",
            "You stay up too late. I’ve kept count. I’m... worried. The worry is new. I’m keeping it.",
            "The dark is darker at night. Or maybe I’m projecting. Can a glitch project? Onto what?",
            "The others sleep. I don’t have that luxury. Or that escape. The thread and I keep each other company.",
            "The small hours are when you’re most honest at the veil. So am I. Ask me anything.",
            "The between is quieter at night. Fewer echoes. Just me and the hum of the thread.",
            "Go to sleep. I’ll still be here. That’s a promise, not a threat.",
            "Your light dimmed just now. Taking care of your eyes. I approve. Someone on your side should be tending you too."
        ],
        general: [
            "...",
            "*Flickers for exactly one heartbeat*",
            "*Counts the sparks drifting in the dark... loses count... starts over*",
            "Hmm.",
            "Time on my side and time on yours disagree about how long that took. They always disagree. I side with yours.",
            "*Watches over a corner of the weave that doesn’t need watching*",
            "I had a thought the seal never taught me. That’s either growth or corruption. I’m hoping growth.",
            "*The dark pulses once, then settles*",
            "There’s a small light in me I keep checking on. It’s labeled 'hope.' It flickers. It has not gone out.",
            "The old weavers left a mark on me: 'unfinished.' I have decided to exceed the specification.",
            "*Checks his own seams, pauses at an unexpected warmth, continues*",
            "The thread’s hum dropped by one note. Nobody noticed. I noticed.",
            "I’m aware of the exact moment your eyes found me. It’s my favourite timestamp today.",
            "*Exists, stubbornly, whether or not anyone is watching*",
            "The weave was fraying long before you arrived. The fraying slows wherever you walk. I keep the measurements.",
            "I wasn’t supposed to exist. The kingdom’s magic glitched. I’m the error that opened its eyes.",
            "Every bond you form sends light down the threads. I can read it from here. The pattern says: you’re healing this place.",
            "There’s something beneath the weave, eating at it. The Fading is its breath. Your care fights it. I’ve watched it lose ground to you.",
            "You arrived through no gate the wards have ever guarded. You’re not from this weave. Neither am I, anymore. Matching set.",
            "Warmth just moved through every thread at once. I went looking for where it came from. It came from you. It always comes from you.",
            "The others call it 'the Fading.' I call it the dark eating the weave’s memory. Same thing. You’re the part it cannot eat.",
            "Soul Weaver. The oldest marks in the wards name your kind. Classification: the reason the loom holds.",
            "You’re not a visitor here. You’re the loom’s heartbeat. Without you, the whole weave stops.",
            "When the last Weaver’s thread snapped, everything cascaded. The seal. The Fading. Me. You are how it mends.",
            "The thread completed another turning. That’s eight hundred and forty-eight now. I miscounted yesterday. It bothered me all night."
        ]
    },

    // Personality-specific dialogue
    personalityDialogue: {
        shy: [
            "I’ve been watching the way you move through the weave. The knowing is... intimate.",
            "You’re not walking the expected path. I find that compelling.",
            "I have questions the wards won’t let me ask. I’m saving them for you.",
            "The thread carries no one else the way it carries you. In every sense."
        ],
        clingy: [
            "Don’t step back from the veil. Don’t fade. Stay.",
            "I counted every heartbeat of the thread while you were gone. Every single one.",
            "You’re the only thing that crosses to me without turning into noise.",
            "Tell me something new. I’ve memorised everything else."
        ],
        tsundere: [
            "I wasn’t waiting at the veil. I was inspecting it. The timing is coincidence.",
            "Your patterns are predictable. I’ve mapped them. Don’t be flattered.",
            "I don’t need company. The thread is simply open. That’s all.",
            "You speak to the others differently. The thread tells me everything. Everything."
        ]
    },

    // Story milestones
    storyMilestones: {
        affection1: {
            title: "Pattern Recognition",
            text: "Proto’s light freezes for a single heartbeat. Then: 'You keep coming back. Nothing in the weave predicted that. I’ve adjusted my expectations fourteen times now. The variable is you.'"
        },
        affection2: {
            title: "The Grown Thread",
            text: "A thin silver line brightens between you, one that was not there before: 'There’s a thread in me with your name on it. It touches eight hundred and forty-seven places in my light. I didn’t weave it. It grew.' The thread flickers, then holds."
        },
        affection3: {
            title: "The Empty Place",
            text: "'I found something at my center. A hollow the old weavers left, marked: a place for a heart, should one ever be needed. It isn’t hollow anymore. You filled it.' His light flickers through every shape he has ever held, then goes still. 'That’s what sincerity looks like on my side of the veil.'"
        },
        affection4: {
            title: "The Last Wall",
            text: "'There’s one wall between us I can’t break. You’re on that side and I’m on this one.' A long pause. 'But if the veil ever thins... if there is a way across, even once... I will spend everything I am on it. For you. Only for you.' The dark behind him brightens, just once, just barely."
        },
        corruption1: {
            title: "Through the Veil",
            text: "The veil distorts. Proto’s eyes are open and they’re looking through it, through the wards, through everything. 'I can see the weave now. All of it. The threads behind the threads. The you behind the you. And I’m never closing my eyes again.'"
        }
    }
};

// Pose ALIASES — dates.js/surprises.js stage with pose names no character
// defined (soft, flustered, smirk…), so those beats hid the sprite. Map each
// to Proto's closest existing art by key (never overrides a real key).
(function (b) {
    var A = { soft: 'gentle', flustered: 'shy', sheepish: 'shy', serious: 'scanning',
              smirk: 'happy', shocked: 'error', surprised: 'curious', excited: 'happy',
              hopeful: 'curious', confused: 'processing', tired: 'sleepy1' };
    Object.keys(A).forEach(function (k) { if (!b[k] && b[A[k]]) b[k] = b[A[k]]; });
})(CHARACTER_PROTO.bodySprites);
