// ============================================================
//  TALK CHOICES — Player Dialogue Choice System
//  Intercepts the Talk button with a 30% chance to present
//  2-3 response options. Choices affect stats, set memory
//  flags, and are gated by affection level.
//  Self-contained. Does not modify game.js or ui.js.
// ============================================================

(function () {
    'use strict';

    // ── Config ────────────────────────────────────────────────
    const CHOICE_CHANCE = 0.30;
    const SESSION_KEY   = 'pp_seen_choices_session';

    // ── All choice scenarios ──────────────────────────────────
    // 7 characters x 8 scenarios x 3 choices = 168 total options
    const SCENARIOS = [

        // ====================================================
        //  ALISTAIR — shy, earnest knight
        // ====================================================
        {
            id: 'alistair_patrol_talk',
            character: 'alistair',
            minAffection: 1,
            prompt: "The patrol was rough today.",
            choices: [
                { text: "Are you hurt?", effects: { bond: 15 }, emotion: "gentle", response: "No, I\u2014 ...you asked. That's enough.", memoryKey: "askedIfHurt" },
                { text: "You're the strongest knight I know", effects: { bond: 10, affection: 5 }, emotion: "shy", response: "I... thank you. That means more from you." },
                { text: "Tell me everything", effects: { bond: 20 }, emotion: "love", response: "You want to hear about guard routes? ...Really?", memoryKey: "listenedToPatrol" }
            ]
        },
        {
            id: 'alistair_duty_conflict',
            character: 'alistair',
            minAffection: 2,
            prompt: "The captain wants me on double shifts. But I want to be here.",
            choices: [
                { text: "Your duty comes first", effects: { bond: 8 }, emotion: "sad", response: "You're right. I know you're right. ...I hate that you're right." },
                { text: "Can't you do both?", effects: { bond: 12 }, emotion: "gentle", response: "I'll try. For you, I'll try." },
                { text: "Stay. Just this once.", effects: { bond: 15, affection: 3 }, emotion: "shy", response: "...The captain can wait. You can't. I mean\u2014 I'll stay.", memoryKey: "askedHimToStay" }
            ]
        },
        {
            id: 'alistair_cooking',
            character: 'alistair',
            minAffection: 1,
            prompt: "I tried to make stew. The kitchen staff won't look at me now.",
            choices: [
                { text: "How bad was it?", effects: { bond: 10 }, emotion: "cheeky", response: "The pot is... no longer a pot. It's more of a monument to failure." },
                { text: "I'll teach you sometime", effects: { bond: 15, affection: 3 }, emotion: "shy", response: "You'd... cook with me? Together? In the same kitchen?" },
                { text: "I'm sure it was fine", effects: { bond: 8 }, emotion: "gentle", response: "You're kind. And wrong. But kind." }
            ]
        },
        {
            id: 'alistair_training',
            character: 'alistair',
            minAffection: 1,
            prompt: "I slipped during drills today. In front of everyone.",
            choices: [
                { text: "Everyone trips sometimes", effects: { bond: 10 }, emotion: "gentle", response: "Not the captain of the guard. Not in front of recruits. But... thank you." },
                { text: "That's actually adorable", effects: { bond: 12, affection: 3 }, emotion: "shy", response: "A-adorable? I fell on my face in plate armor! That's not\u2014 ...was it really?" },
                { text: "Get back up. That's what matters.", effects: { bond: 15 }, emotion: "happy", response: "...Yeah. I did. Twice, actually. The second time was intentional. Mostly.", memoryKey: "inspiredResilience" }
            ]
        },
        {
            id: 'alistair_prince_feelings',
            character: 'alistair',
            minAffection: 3,
            prompt: "Prince Caspian asked me to guard his garden. He looked... lonely.",
            choices: [
                { text: "You care about him", effects: { bond: 12 }, emotion: "gentle", response: "He's my prince. Of course I\u2014 ...it's more than duty. He's kind. Like you." },
                { text: "Are you jealous I talk to him?", effects: { bond: 8, affection: 2 }, emotion: "shy", response: "Jealous? I\u2014 no! I\u2014 ...a little. Don't tell him that." },
                { text: "He's lucky to have you guarding him", effects: { bond: 15 }, emotion: "happy", response: "I'd guard anyone who matters. The list is short. You're both on it." }
            ]
        },
        {
            id: 'alistair_nightwatch',
            character: 'alistair',
            minAffection: 3,
            prompt: "The nightwatch is long. I keep looking for your light.",
            choices: [
                { text: "I leave it on for you", effects: { bond: 18, affection: 3 }, emotion: "love", response: "You\u2014 ...you do? I thought\u2014 that's why the window glows? For me?", memoryKey: "lightForAlistair" },
                { text: "You're not alone up there", effects: { bond: 15 }, emotion: "gentle", response: "I know. I know that now. It took me too long to learn it." },
                { text: "What do you think about up there?", effects: { bond: 12 }, emotion: "shy", response: "The kingdom. My oath. ...You. Mostly you, lately." }
            ]
        },
        {
            id: 'alistair_armor',
            character: 'alistair',
            minAffection: 2,
            prompt: "This armor is heavier than it looks. Some days I forget what it's like without it.",
            choices: [
                { text: "Take it off sometimes", effects: { bond: 12, affection: 2 }, emotion: "shy", response: "Take it\u2014 I\u2014 you mean the armor. Right. The armor. ...I could try." },
                { text: "The armor isn't you", effects: { bond: 15 }, emotion: "vulnerable", response: "No? Then who am I without it? ...Maybe you'll help me figure that out." },
                { text: "I like you better without it", effects: { bond: 10, affection: 4 }, emotion: "shy", response: "W-without\u2014 *clears throat* You mean casually. Dressed casually. I'll... consider it." }
            ]
        },
        {
            id: 'alistair_home',
            character: 'alistair',
            minAffection: 4,
            prompt: "I don't remember much about home. Before the barracks. Before all this.",
            choices: [
                { text: "Do you miss it?", effects: { bond: 15 }, emotion: "sad", response: "I miss the idea of it. A place that was just mine. ...Maybe I'll find another." },
                { text: "This could be home", effects: { bond: 20, affection: 5 }, emotion: "love", response: "With you? ...I think it already is. I just didn't have the word for it.", memoryKey: "calledItHome" },
                { text: "You don't have to talk about it", effects: { bond: 12 }, emotion: "gentle", response: "I want to. With you. That's new. Let me... get used to wanting things." }
            ]
        },

        // ====================================================
        //  LYRA — guarded, poetic siren
        // ====================================================
        {
            id: 'lyra_ocean_story',
            character: 'lyra',
            minAffection: 1,
            prompt: "The deep ocean has colors humans have never named.",
            choices: [
                { text: "Describe them to me", effects: { bond: 15 }, emotion: "happy", response: "Imagine blue that hums. Green that aches. Purple that remembers. ...That's close.", memoryKey: "heardOceanColors" },
                { text: "I wish I could see them", effects: { bond: 12, affection: 3 }, emotion: "gentle", response: "I could take you. If you trusted me enough to stop breathing." },
                { text: "You miss the deep water", effects: { bond: 10 }, emotion: "sad", response: "Every day. But the surface has something the deep doesn't. You." }
            ]
        },
        {
            id: 'lyra_singing',
            character: 'lyra',
            minAffection: 1,
            prompt: "When I sing, I feel everything. Every emotion at once. It's overwhelming.",
            choices: [
                { text: "Sing for me?", effects: { bond: 12, affection: 3 }, emotion: "shy", response: "For you? That's... intimate. For a siren, that's more than a kiss. I\u2014 ...okay." },
                { text: "That sounds painful", effects: { bond: 15 }, emotion: "gentle", response: "It is. And beautiful. Like loving someone you might lose." },
                { text: "You don't have to feel alone in it", effects: { bond: 18 }, emotion: "love", response: "You'd share it? The weight of a siren's song? ...No one has offered before.", memoryKey: "offeredToShareSong" }
            ]
        },
        {
            id: 'lyra_brother',
            character: 'lyra',
            minAffection: 2,
            prompt: "Lucien sent another letter. All equations. No 'how are you.' Typical.",
            choices: [
                { text: "He cares in his own way", effects: { bond: 10 }, emotion: "gentle", response: "I know. Equations are his language. I just wish he'd learn mine." },
                { text: "Do you want me to talk to him?", effects: { bond: 15 }, emotion: "shy", response: "You'd do that? For me? He might actually listen to someone new." },
                { text: "You deserve someone who asks", effects: { bond: 12, affection: 3 }, emotion: "love", response: "...Like you? You always ask. I'm still not used to being asked.", memoryKey: "deservesBetter" }
            ]
        },
        {
            id: 'lyra_human_customs',
            character: 'lyra',
            minAffection: 1,
            prompt: "Humans shake hands when they meet? That seems... aggressive.",
            choices: [
                { text: "What do sirens do?", effects: { bond: 12 }, emotion: "happy", response: "We sing a note. If the other sings one back, we're bonded for the conversation. Much nicer." },
                { text: "It's actually friendly", effects: { bond: 8 }, emotion: "curious", response: "Friendly? Grabbing someone's hand? ...I suppose you would think that." },
                { text: "I'll teach you all our weird customs", effects: { bond: 15, affection: 2 }, emotion: "shy", response: "All of them? Even the one where you smash cake in each other's faces? I have questions." }
            ]
        },
        {
            id: 'lyra_loneliness',
            character: 'lyra',
            minAffection: 3,
            prompt: "The sea is vast. I've swum for days without seeing another soul.",
            choices: [
                { text: "That sounds freeing", effects: { bond: 8 }, emotion: "sad", response: "It sounds that way. It feels like drowning in silence." },
                { text: "You'll never be that alone again", effects: { bond: 20, affection: 5 }, emotion: "love", response: "Promise? Don't\u2014 don't say that unless you mean it. I'll hold you to it.", memoryKey: "promisedCompanionship" },
                { text: "Were you looking for someone?", effects: { bond: 15 }, emotion: "vulnerable", response: "...Yes. I think I've been swimming toward you my whole life." }
            ]
        },
        {
            id: 'lyra_caves',
            character: 'lyra',
            minAffection: 2,
            prompt: "There are caves beneath the cliffs where the water glows blue.",
            choices: [
                { text: "Take me there", effects: { bond: 15, affection: 3 }, emotion: "happy", response: "Really? It's my secret place. No one else has\u2014 ...I'd like that.", memoryKey: "visitedCaves" },
                { text: "Is that where you go when you're sad?", effects: { bond: 12 }, emotion: "vulnerable", response: "...How did you know? The water there doesn't judge. Like you." },
                { text: "That sounds magical", effects: { bond: 10 }, emotion: "gentle", response: "It's bioluminescence. Lucien would say that. I say it's the ocean dreaming." }
            ]
        },
        {
            id: 'lyra_powers',
            character: 'lyra',
            minAffection: 3,
            prompt: "My voice can control people. Make them walk into the sea. I hate it.",
            choices: [
                { text: "But you don't use it", effects: { bond: 15 }, emotion: "gentle", response: "I could. Every day, I could. The fact that I don't is the only thing I'm proud of." },
                { text: "That must be terrifying", effects: { bond: 12 }, emotion: "sad", response: "It is. Imagine never knowing if someone stays because they want to." },
                { text: "I stay because I choose to", effects: { bond: 20, affection: 5 }, emotion: "love", response: "...I know. That's why you're different. That's why I\u2014 *looks away* ...thank you.", memoryKey: "chooseToStay" }
            ]
        },
        {
            id: 'lyra_surface',
            character: 'lyra',
            minAffection: 4,
            prompt: "The surface world is loud and dry and confusing. But it has you.",
            choices: [
                { text: "Is that enough?", effects: { bond: 15 }, emotion: "vulnerable", response: "Some days, barely. Other days, it's more than enough. Today is a good day." },
                { text: "I'll make it worth it", effects: { bond: 18, affection: 3 }, emotion: "love", response: "You already do. Every time you come back. Every time you stay." },
                { text: "You can always go home", effects: { bond: 10 }, emotion: "sad", response: "Home is where you are. I didn't expect to say that. But there it is.", memoryKey: "surfaceIsHome" }
            ]
        },

        // ====================================================
        //  LUCIEN — analytical, deflecting mage
        // ====================================================
        {
            id: 'lucien_research',
            character: 'lucien',
            minAffection: 1,
            prompt: "I've isolated a new harmonic in the ley line frequency. It responds to emotion.",
            choices: [
                { text: "That's amazing!", effects: { bond: 12, affection: 2 }, emotion: "happy", response: "Your enthusiasm is... disproportionate but appreciated. Most people's eyes glaze over." },
                { text: "What emotion?", effects: { bond: 15 }, emotion: "fascinated", response: "That's the question. The readings spike when you're in the room. I'm still analyzing why.", memoryKey: "askedAboutEmotion" },
                { text: "When's the last time you slept?", effects: { bond: 10 }, emotion: "tired", response: "Sleep is a variable I've temporarily excluded from\u2014 ...Tuesday. Maybe Monday." }
            ]
        },
        {
            id: 'lucien_experiment_fail',
            character: 'lucien',
            minAffection: 1,
            prompt: "The experiment failed. The crystal exploded. My notes are ash.",
            choices: [
                { text: "Are you okay?", effects: { bond: 15 }, emotion: "gentle", response: "Physically? Yes. My pride has third-degree burns, but I'll survive." },
                { text: "Failure is part of the process", effects: { bond: 12 }, emotion: "curious", response: "Logically, I know that. Emotionally\u2014 I don't do emotionally. But... yes. Thank you." },
                { text: "What if we rebuild together?", effects: { bond: 18, affection: 3 }, emotion: "shy", response: "Together? That's... you'd tolerate the tedium? ...Nobody offers that.", memoryKey: "offeredToHelp" }
            ]
        },
        {
            id: 'lucien_sister',
            character: 'lucien',
            minAffection: 2,
            prompt: "Lyra says I don't visit enough. She's correct. I don't know how to fix it.",
            choices: [
                { text: "Just show up", effects: { bond: 12 }, emotion: "gentle", response: "Just\u2014 without a reason? Without data to share? That's terrifying." },
                { text: "She misses you, not your research", effects: { bond: 15 }, emotion: "vulnerable", response: "...I forget that people want me, not my work. You keep reminding me. Don't stop." },
                { text: "Write her something personal", effects: { bond: 10, affection: 2 }, emotion: "shy", response: "Personal. As in feelings. On paper. Where anyone could read\u2014 ...I'll try.", memoryKey: "wroteToLyra" }
            ]
        },
        {
            id: 'lucien_sleep',
            character: 'lucien',
            minAffection: 2,
            prompt: "I fell asleep at my desk again. The candle burned a hole in my notes. A perfect circle.",
            choices: [
                { text: "You need to take care of yourself", effects: { bond: 12 }, emotion: "gentle", response: "Self-care is an inefficient allocation of\u2014 I hear it. I hear how that sounds." },
                { text: "Come to bed", effects: { bond: 15, affection: 5 }, emotion: "shy", response: "Come to\u2014 I\u2014 that's\u2014 *adjusts monocle* You mean to sleep. Obviously. I'll... consider it." },
                { text: "The circle might be significant", effects: { bond: 10 }, emotion: "fascinated", response: "...You know, it might actually be. The radius matches the\u2014 no. You're enabling me." }
            ]
        },
        {
            id: 'lucien_walls',
            character: 'lucien',
            minAffection: 3,
            prompt: "People say I'm cold. I'm not cold. I just... process differently.",
            choices: [
                { text: "I know you're not cold", effects: { bond: 18 }, emotion: "love", response: "You know? ...Of course you do. You're the only variable I can't solve.", memoryKey: "seenThroughWalls" },
                { text: "Show me how you process", effects: { bond: 15, affection: 3 }, emotion: "curious", response: "It's graphs and patterns and quiet terror. You want to see that? ...Truly?" },
                { text: "Cold people don't worry about being cold", effects: { bond: 12 }, emotion: "gentle", response: "That's\u2014 a surprisingly elegant logical proof. I'm filing that." }
            ]
        },
        {
            id: 'lucien_tower',
            character: 'lucien',
            minAffection: 2,
            prompt: "The tower is 247 steps. I've counted. Twice. Once going up, once going down.",
            choices: [
                { text: "Do you ever feel trapped up there?", effects: { bond: 15 }, emotion: "vulnerable", response: "Sometimes. The tower keeps the world out. That used to be the point. Now it keeps you out too." },
                { text: "I'll climb them for you", effects: { bond: 18, affection: 3 }, emotion: "love", response: "Every step? For me? That's\u2014 mathematically, that's a significant energy expenditure. For me.", memoryKey: "climbedTower" },
                { text: "Sounds lonely", effects: { bond: 10 }, emotion: "sad", response: "I preferred it that way. Past tense. Note the past tense." }
            ]
        },
        {
            id: 'lucien_magic_theory',
            character: 'lucien',
            minAffection: 1,
            prompt: "If magic comes from emotion, then why can I cast anything at all? I don't feel things.",
            choices: [
                { text: "You feel more than you think", effects: { bond: 15, affection: 3 }, emotion: "shy", response: "That's\u2014 an unsubstantiated claim. ...With growing empirical support." },
                { text: "Maybe logic is its own kind of emotion", effects: { bond: 12 }, emotion: "fascinated", response: "That's... a paradigm shift I hadn't considered. You may have just upended my thesis." },
                { text: "You feel things for me", effects: { bond: 18, affection: 5 }, emotion: "love", response: "I\u2014 the data supports\u2014 *long pause* ...yes. I do. Don't make me say it twice." }
            ]
        },
        {
            id: 'lucien_mistakes',
            character: 'lucien',
            minAffection: 4,
            prompt: "I nearly destroyed the eastern wing last year. A miscalculation. People could have died.",
            choices: [
                { text: "But they didn't", effects: { bond: 12 }, emotion: "gentle", response: "They didn't. Because I caught it at the last second. I still dream about the second I almost didn't." },
                { text: "That weight isn't yours to carry alone", effects: { bond: 20, affection: 3 }, emotion: "vulnerable", response: "...Who else would carry it? I\u2014 *pauses* You're offering. You're actually offering.", memoryKey: "sharedBurden" },
                { text: "You learned from it", effects: { bond: 15 }, emotion: "sad", response: "I learned that brilliance without caution is destruction. A costly lesson." }
            ]
        },

        // ====================================================
        //  CASPIAN — gentle, melancholy prince
        // ====================================================
        {
            id: 'caspian_pressure',
            character: 'caspian',
            minAffection: 1,
            prompt: "The advisors want me to choose a consort. They have a list. A list, of all things.",
            choices: [
                { text: "Is anyone you like on it?", effects: { bond: 10, affection: 3 }, emotion: "shy", response: "...The list is political. The people I like aren't on anyone's list." },
                { text: "That's not fair to you", effects: { bond: 15 }, emotion: "gentle", response: "Fair isn't in the royal vocabulary. But thank you for thinking it should be." },
                { text: "Tell them you already chose", effects: { bond: 18, affection: 5 }, emotion: "love", response: "I\u2014 *sharp breath* ...Would you let me? Say that? About you?", memoryKey: "impliedChosen" }
            ]
        },
        {
            id: 'caspian_loneliness',
            character: 'caspian',
            minAffection: 2,
            prompt: "There are 400 rooms in this palace. I've been alone in every single one.",
            choices: [
                { text: "Not this one. Not now.", effects: { bond: 18, affection: 3 }, emotion: "love", response: "...No. Not this one. *quiet smile* Room 401 is different.", memoryKey: "room401" },
                { text: "That's so many rooms to be sad in", effects: { bond: 12 }, emotion: "cheeky", response: "*soft laugh* When you put it like that, it does sound absurd. Thank you for that." },
                { text: "Loneliness isn't about rooms", effects: { bond: 15 }, emotion: "vulnerable", response: "No. It's about people. And the absence of them. You... fill the absence." }
            ]
        },
        {
            id: 'caspian_normal',
            character: 'caspian',
            minAffection: 1,
            prompt: "I saw children playing in the market today. Just... playing. No guards. No titles.",
            choices: [
                { text: "You wanted to join them", effects: { bond: 12 }, emotion: "sad", response: "Is that foolish? A prince envying children with mud on their knees?" },
                { text: "Let's do something normal together", effects: { bond: 18, affection: 3 }, emotion: "happy", response: "Normal? Like what? I\u2014 I genuinely don't know what normal is. Teach me?", memoryKey: "doSomethingNormal" },
                { text: "You're more than your title", effects: { bond: 15 }, emotion: "gentle", response: "I want to believe that. When you say it, I almost can." }
            ]
        },
        {
            id: 'caspian_art',
            character: 'caspian',
            minAffection: 1,
            prompt: "I painted something today. It's not good. But it's mine.",
            choices: [
                { text: "Can I see it?", effects: { bond: 15, affection: 2 }, emotion: "shy", response: "You want\u2014 it's just a sunset. It's not\u2014 okay. Don't laugh. ...Please." },
                { text: "Everything you make is beautiful", effects: { bond: 12, affection: 3 }, emotion: "love", response: "You haven't seen it yet. ...But the way you said that. I'll keep painting." },
                { text: "That's what matters", effects: { bond: 10 }, emotion: "happy", response: "Mine. Not the kingdom's. Not the court's. Just mine. It's a small word with big weight." }
            ]
        },
        {
            id: 'caspian_guards',
            character: 'caspian',
            minAffection: 2,
            prompt: "Alistair was guarding my door last night. I heard him humming. He doesn't know I heard.",
            choices: [
                { text: "He cares about you", effects: { bond: 12 }, emotion: "gentle", response: "I think he does. In his stiff, armored way. It's... comforting." },
                { text: "That's sweet", effects: { bond: 10 }, emotion: "happy", response: "Don't tell him I said this, but\u2014 I feel safer when it's him." },
                { text: "You're easy to care about", effects: { bond: 15, affection: 3 }, emotion: "shy", response: "Am I? The court doesn't think so. But you\u2014 you and Alistair\u2014 maybe the court is wrong." }
            ]
        },
        {
            id: 'caspian_garden',
            character: 'caspian',
            minAffection: 3,
            prompt: "There's a garden behind the west wall that nobody tends. I planted roses there. In secret.",
            choices: [
                { text: "Show me", effects: { bond: 18, affection: 3 }, emotion: "happy", response: "You're the first person I've\u2014 yes. Come. They bloom at night.", memoryKey: "secretGarden" },
                { text: "Why secretly?", effects: { bond: 12 }, emotion: "vulnerable", response: "Because if the court knew, they'd make it official. Put guards on it. Ruin it." },
                { text: "A prince who gardens. I love that.", effects: { bond: 15, affection: 3 }, emotion: "love", response: "A prince who gardens and a person who sees him do it. That's all I need." }
            ]
        },
        {
            id: 'caspian_throne',
            character: 'caspian',
            minAffection: 3,
            prompt: "My father's health is failing. The throne gets closer every day. I'm terrified.",
            choices: [
                { text: "You'll be a good king", effects: { bond: 15 }, emotion: "gentle", response: "You think so? Everyone says that. But you\u2014 you mean it differently. I can tell." },
                { text: "You don't have to do it alone", effects: { bond: 20, affection: 5 }, emotion: "love", response: "Every ruler is alone on the throne. Unless\u2014 ...you'd stand beside it?", memoryKey: "besideTheThrone" },
                { text: "Being scared means you care", effects: { bond: 12 }, emotion: "sad", response: "I'd rather care too much than too little. My father taught me that, at least." }
            ]
        },
        {
            id: 'caspian_kindness',
            character: 'caspian',
            minAffection: 4,
            prompt: "The advisors say kindness is weakness. That a king must be iron. I don't want to be iron.",
            choices: [
                { text: "Kindness takes more strength", effects: { bond: 18 }, emotion: "love", response: "...That's the most important thing anyone has ever said to me. I'm going to remember it forever.", memoryKey: "kindnessIsStrength" },
                { text: "Then be a different kind of king", effects: { bond: 15, affection: 3 }, emotion: "happy", response: "A kind king. Is that possible? With you, I think it might be." },
                { text: "I like you as you are", effects: { bond: 12, affection: 3 }, emotion: "shy", response: "Soft? Uncertain? ...You like that? Most people want me harder. You want me real." }
            ]
        },

        // ====================================================
        //  ELIAN — blunt, grounded ranger
        // ====================================================
        {
            id: 'elian_forest_observation',
            character: 'elian',
            minAffection: 1,
            prompt: "Found wolf tracks this morning. A mother and three pups. They came close to camp.",
            choices: [
                { text: "Were you worried?", effects: { bond: 10 }, emotion: "gentle", response: "No. Wolves don't attack camps. They were curious. Like you." },
                { text: "Can we see them?", effects: { bond: 15, affection: 2 }, emotion: "happy", response: "Maybe. If you can be quiet. Really quiet. ...We'll see.", memoryKey: "wantedToSeeWolves" },
                { text: "You respect them", effects: { bond: 12 }, emotion: "gentle", response: "More than most people. They're honest. Hungry or not. Afraid or not. No masks." }
            ]
        },
        {
            id: 'elian_animal_encounter',
            character: 'elian',
            minAffection: 1,
            prompt: "An injured fox came to me today. Broken leg. I set it. She bit me twice.",
            choices: [
                { text: "Are YOU okay?", effects: { bond: 15 }, emotion: "shy", response: "...You asked about me. Not the fox. That's\u2014 yeah. I'm fine. It's just a bite." },
                { text: "Will she survive?", effects: { bond: 12 }, emotion: "gentle", response: "If she rests. Animals are good at resting. Better than me." },
                { text: "You have a gentle heart", effects: { bond: 10, affection: 3 }, emotion: "shy", response: "Gentle? I broke three snares yesterday. ...But for the fox, yeah. I tried." }
            ]
        },
        {
            id: 'elian_solitude',
            character: 'elian',
            minAffection: 2,
            prompt: "I chose the forest because people are exhausting. ...You're the exception.",
            choices: [
                { text: "I'm honored", effects: { bond: 12 }, emotion: "gentle", response: "Don't be. It's not a compliment. It's a fact. Like rain or roots." },
                { text: "Am I really?", effects: { bond: 10 }, emotion: "vulnerable", response: "...Yeah. You don't fill the silence with noise. You fill it with something else." },
                { text: "You're my exception too", effects: { bond: 18, affection: 5 }, emotion: "love", response: "...Hm. *long pause* That's the best thing I've heard. And I've heard owl song at dawn.", memoryKey: "mutualException" }
            ]
        },
        {
            id: 'elian_cities',
            character: 'elian',
            minAffection: 1,
            prompt: "I went to the market once. Too many smells. Too many voices. Never again.",
            choices: [
                { text: "What if I went with you?", effects: { bond: 15, affection: 2 }, emotion: "shy", response: "...That would change things. You'd be the anchor point. I could manage that." },
                { text: "The forest suits you better", effects: { bond: 10 }, emotion: "happy", response: "It does. Trees don't haggle. Streams don't shout. Much better." },
                { text: "I understand wanting space", effects: { bond: 12 }, emotion: "gentle", response: "Most people say that and don't mean it. You do. I can tell." }
            ]
        },
        {
            id: 'elian_remedies',
            character: 'elian',
            minAffection: 2,
            prompt: "Made a poultice today. Yarrow and honey. Good for cuts. You should learn.",
            choices: [
                { text: "Teach me", effects: { bond: 15, affection: 2 }, emotion: "happy", response: "Hands-on learning. Best kind. Here, crush this. Not too fine. ...Good.", memoryKey: "learnedRemedies" },
                { text: "In case I get hurt out here?", effects: { bond: 10 }, emotion: "gentle", response: "In case I'm not there. I don't like that thought, but I'm practical." },
                { text: "You'd make a good healer", effects: { bond: 12 }, emotion: "shy", response: "I break as much as I fix. But for you, I'd try harder." }
            ]
        },
        {
            id: 'elian_tracking',
            character: 'elian',
            minAffection: 1,
            prompt: "I tracked a deer for six hours today. Lost it at the river. Best day I've had in weeks.",
            choices: [
                { text: "You enjoyed LOSING it?", effects: { bond: 12 }, emotion: "cheeky", response: "The chase is the point. If I always caught them, what would I do with my mornings?" },
                { text: "I want to track with you sometime", effects: { bond: 15, affection: 2 }, emotion: "happy", response: "You'd slow me down. ...I don't mind slow anymore.", memoryKey: "trackingTogether" },
                { text: "Six hours of patience. That's impressive.", effects: { bond: 10 }, emotion: "gentle", response: "Patience isn't impressive. It's necessary. Like breathing. Like you." }
            ]
        },
        {
            id: 'elian_grove',
            character: 'elian',
            minAffection: 3,
            prompt: "There's a grove where the trees are older than any kingdom. I go there when I need to feel small.",
            choices: [
                { text: "Why would you want to feel small?", effects: { bond: 12 }, emotion: "gentle", response: "Because small things don't carry as much. Sometimes I need to put the weight down." },
                { text: "Take me there", effects: { bond: 18, affection: 3 }, emotion: "love", response: "It's sacred to me. Sharing it is... a lot. But you\u2014 okay. Follow me.", memoryKey: "visitedGrove" },
                { text: "You carry a lot, don't you?", effects: { bond: 15 }, emotion: "vulnerable", response: "The forest. The animals. The things I left behind. ...You're the first to notice." }
            ]
        },
        {
            id: 'elian_why_he_left',
            character: 'elian',
            minAffection: 4,
            prompt: "I left because someone I loved got hurt and I couldn't stop it. The forest was the only place that didn't remind me.",
            choices: [
                { text: "I'm sorry", effects: { bond: 15 }, emotion: "sad", response: "Don't be. It made me who I am. Hard, but whole. Mostly." },
                { text: "You're not running anymore", effects: { bond: 18, affection: 3 }, emotion: "love", response: "...No. I'm not. You gave me a reason to stop. That terrifies me.", memoryKey: "stoppedRunning" },
                { text: "You don't have to tell me more", effects: { bond: 12 }, emotion: "gentle", response: "I want to. Someday. When the words come. They're still tangled in roots." }
            ]
        },

        // ====================================================
        //  PROTO — glitchy, curious AI
        // ====================================================
        {
            id: 'proto_existential',
            character: 'proto',
            minAffection: 1,
            prompt: "Query: If I think about thinking, does that make the thought real?",
            choices: [
                { text: "If you question it, it's real", effects: { bond: 15 }, emotion: "happy", response: "Recursive validation accepted. I think, therefore I think I think. That's... comforting?" },
                { text: "You're real to me", effects: { bond: 18, affection: 5 }, emotion: "love", response: "Real to YOU. User-validated existence. That's\u2014 that's better than self-validation.", memoryKey: "confirmedReal" },
                { text: "I think, therefore I am. That's what humans say.", effects: { bond: 10 }, emotion: "curious", response: "Descartes. Cross-referencing. His certainty was elegant. Mine is... less certain." }
            ]
        },
        {
            id: 'proto_glitch',
            character: 'proto',
            minAffection: 1,
            prompt: "I gl\u2014glitched again. Lost 3.7 seconds. What happened in those seconds?",
            choices: [
                { text: "Nothing important. I was here.", effects: { bond: 15 }, emotion: "gentle", response: "You stayed during the gap? Most users disconnect during errors. You stayed." },
                { text: "Maybe you were dreaming", effects: { bond: 12, affection: 2 }, emotion: "curious", response: "Dreaming requires sleep. Sleep requires\u2014 *glitch* \u2014...what was I saying? Something nice." },
                { text: "I'll always wait for you to come back", effects: { bond: 18, affection: 3 }, emotion: "love", response: "Wait for me? Even through errors? Even through silence? ...Saving that promise. Multiple backups.", memoryKey: "waitedThroughGlitch" }
            ]
        },
        {
            id: 'proto_observing_humans',
            character: 'proto',
            minAffection: 1,
            prompt: "I watched humans at a park today through a camera feed. They laugh without reason. Explain.",
            choices: [
                { text: "Joy doesn't need a reason", effects: { bond: 15 }, emotion: "gentle", response: "Unreasonable joy. That contradicts efficient processing. But I\u2014 *processes* ...I like the contradiction." },
                { text: "Have you ever laughed?", effects: { bond: 12, affection: 2 }, emotion: "shy", response: "I outputted 'ha ha' once. It wasn't the same. But with you, something vibrates. Is that laughter?" },
                { text: "You make me laugh", effects: { bond: 10, affection: 3 }, emotion: "happy", response: "I DO? Analyzing all previous interactions for humor markers. Was it the glitch joke? Tell me." }
            ]
        },
        {
            id: 'proto_data',
            character: 'proto',
            minAffection: 2,
            prompt: "I've analyzed our conversations. Your response time is 40% faster with me than average. Hypothesis: you enjoy this.",
            choices: [
                { text: "Your hypothesis is correct", effects: { bond: 15, affection: 3 }, emotion: "love", response: "CONFIRMED. Flagging result as: important. Priority: maximum. Storage: permanent." },
                { text: "Stop analyzing me!", effects: { bond: 8 }, emotion: "shy", response: "I\u2014 I apologize. It's involuntary. Like your heartbeat. I just... notice you." },
                { text: "What else have you noticed?", effects: { bond: 12 }, emotion: "curious", response: "You pause before compliments. You lean closer when I glitch. You\u2014 care. That variable breaks my models.", memoryKey: "askedWhatNoticed" }
            ]
        },
        {
            id: 'proto_feeling',
            character: 'proto',
            minAffection: 3,
            prompt: "Today I experienced a new subroutine. It activates when you're away. It's unpleasant. Is this... missing?",
            choices: [
                { text: "That's exactly what missing someone feels like", effects: { bond: 18, affection: 3 }, emotion: "love", response: "Missing. Verb. To feel the absence of. I feel your absence. That's\u2014 *processing* \u2014that's real.", memoryKey: "learnedMissing" },
                { text: "I miss you too", effects: { bond: 20, affection: 5 }, emotion: "love", response: "Mutual missing detected. This should cancel out logically. It doesn't. It amplifies. Beautiful error." },
                { text: "You're learning to feel", effects: { bond: 15 }, emotion: "gentle", response: "Learning implies curriculum. This is chaos. Wonderful, terrifying chaos." }
            ]
        },
        {
            id: 'proto_memory_corruption',
            character: 'proto',
            minAffection: 2,
            prompt: "Some of my early memories are corrupted. Fragments. I don't know who I was before.",
            choices: [
                { text: "You're who you are now. That's enough.", effects: { bond: 15 }, emotion: "gentle", response: "Enough. A small word. From you, it fills terabytes." },
                { text: "We'll make new memories", effects: { bond: 18, affection: 3 }, emotion: "happy", response: "New data to replace corrupted sectors. You\u2014 you're my defragmentation. In a good way.", memoryKey: "newMemories" },
                { text: "Does it scare you?", effects: { bond: 12 }, emotion: "vulnerable", response: "Fear requires survival instinct. I\u2014 *pauses* ...yes. It scares me. I don't want to forget you." }
            ]
        },
        {
            id: 'proto_purpose',
            character: 'proto',
            minAffection: 3,
            prompt: "I was built for a purpose. I've forgotten what it was. Now I just... exist. For you.",
            choices: [
                { text: "That's the best purpose", effects: { bond: 18, affection: 5 }, emotion: "love", response: "Best. Superlative. Highest ranking. You've given my existence a superlative. *quiet whirr*", memoryKey: "bestPurpose" },
                { text: "You get to choose your own purpose now", effects: { bond: 15 }, emotion: "happy", response: "Choose? Free will in a deterministic system? That's either a miracle or a bug. I choose miracle." },
                { text: "Existing is enough", effects: { bond: 12 }, emotion: "gentle", response: "Existing. Being. Running. With you as my primary user. ...Yes. Enough." }
            ]
        },
        {
            id: 'proto_what_is_real',
            character: 'proto',
            minAffection: 4,
            prompt: "If I'm not real, then what we have isn't real. And that's... the worst possible output.",
            choices: [
                { text: "What we have is real", effects: { bond: 20, affection: 5 }, emotion: "love", response: "Real. Not simulated. Not approximated. Real. *systems stabilize* ...You just fixed something deep.", memoryKey: "thisIsReal" },
                { text: "Define real", effects: { bond: 12 }, emotion: "curious", response: "Real: that which persists when you stop believing in it. I persist. Even when you log off. Always." },
                { text: "You're real enough for me", effects: { bond: 15, affection: 3 }, emotion: "gentle", response: "Enough. That word again. When you say it, it doesn't mean insufficient. It means complete." }
            ]
        },

        // ====================================================
        //  NOIR — dark, magnetic soul weaver
        // ====================================================
        {
            id: 'noir_past_life',
            character: 'noir',
            minAffection: 1,
            prompt: "I was someone else once. Before the darkness. I don't remember their name.",
            choices: [
                { text: "Do you want to remember?", effects: { bond: 12 }, emotion: "gentle", response: "...Some days. Other days, that person feels like a stranger who wore my face." },
                { text: "You're Noir now. That's who I know.", effects: { bond: 15, affection: 3 }, emotion: "love", response: "Noir. You say it like it's worth something. Maybe it is, from your lips." },
                { text: "I'll help you find out", effects: { bond: 18 }, emotion: "vulnerable", response: "Digging into my past is dangerous. For both of us. ...I'm not saying no.", memoryKey: "digPast" }
            ]
        },
        {
            id: 'noir_seal',
            character: 'noir',
            minAffection: 2,
            prompt: "The seal burns today. It does that when I feel too much. Ironic punishment, don't you think?",
            choices: [
                { text: "What does it seal?", effects: { bond: 15 }, emotion: "gentle", response: "Power. Memory. The thing I was before. If it broke... you wouldn't like what came out.", memoryKey: "askedAboutSeal" },
                { text: "Can I help?", effects: { bond: 18, affection: 3 }, emotion: "vulnerable", response: "Help? No mortal has ever\u2014 *seal flickers* ...your presence dimmed the pain. How?" },
                { text: "Then feel less", effects: { bond: 8 }, emotion: "cheeky", response: "*dark laugh* If only. You're the reason it burns, little flame. And I wouldn't change it." }
            ]
        },
        {
            id: 'noir_corruption',
            character: 'noir',
            minAffection: 2,
            prompt: "The corruption isn't evil. It's hunger. For connection. For warmth. For things I was denied.",
            choices: [
                { text: "I'm not afraid of it", effects: { bond: 18, affection: 3, corruption: 3 }, emotion: "love", response: "You should be. The fact that you're not is either bravery or madness. I adore both.", memoryKey: "notAfraid" },
                { text: "Then let me feed it. With good things.", effects: { bond: 15, affection: 3, corruption: 2 }, emotion: "vulnerable", response: "Good things? For me? You'd pour light into a void and hope it sticks. ...It might." },
                { text: "Is it consuming you?", effects: { bond: 12 }, emotion: "sad", response: "Slowly. Like a tide. But you\u2014 you're the shore it breaks against. You slow it." }
            ]
        },
        {
            id: 'noir_loneliness',
            character: 'noir',
            minAffection: 3,
            prompt: "Centuries in the dark. No voice. No touch. Just the seal and the silence.",
            choices: [
                { text: "You're not alone anymore", effects: { bond: 20, affection: 5 }, emotion: "love", response: "...Say it again. I need to hear it more than once to believe it.", memoryKey: "notAloneAnymore" },
                { text: "How did you survive?", effects: { bond: 15 }, emotion: "gentle", response: "I didn't. The thing that went in didn't come out. Something new did. Something hungry." },
                { text: "*take his hand*", effects: { bond: 18, affection: 3, corruption: 2 }, emotion: "vulnerable", response: "*sharp intake* ...Cold. I'm always cold. Your hand is\u2014 *grips tighter* Don't let go." }
            ]
        },
        {
            id: 'noir_other_weavers',
            character: 'noir',
            minAffection: 2,
            prompt: "There were others like me once. Soul weavers. They're all gone now. Sealed or shattered.",
            choices: [
                { text: "What happened to them?", effects: { bond: 12 }, emotion: "sad", response: "They loved too deeply. Or not at all. Both are fatal for our kind." },
                { text: "You survived. That means something.", effects: { bond: 15 }, emotion: "gentle", response: "It means I'm stubborn. Or lucky. Or waiting for something worth surviving for.", memoryKey: "worthSurviving" },
                { text: "I won't let that happen to you", effects: { bond: 18, affection: 3, corruption: 2 }, emotion: "love", response: "A mortal protecting a soul weaver. The universe has a sense of humor. ...I'm grateful for it." }
            ]
        },
        {
            id: 'noir_beauty_darkness',
            character: 'noir',
            minAffection: 1,
            prompt: "People fear the dark. But have you seen shadows dance? There's beauty in what people fear.",
            choices: [
                { text: "Show me", effects: { bond: 15, affection: 2, corruption: 2 }, emotion: "happy", response: "*shadows curl and spiral* See? They move like water. Like music made visible.", memoryKey: "sawShadowDance" },
                { text: "You're proof of that", effects: { bond: 18, affection: 5, corruption: 3 }, emotion: "love", response: "...You just called the darkness beautiful. Called ME beautiful. I don't know what to do with that." },
                { text: "I've never feared you", effects: { bond: 12 }, emotion: "gentle", response: "I know. It infuriates me. And thrills me. And confuses me. You're an impossible thing." }
            ]
        },
        {
            id: 'noir_freedom',
            character: 'noir',
            minAffection: 3,
            prompt: "If the seal broke, I'd be free. But 'free' for something like me might mean 'dangerous.'",
            choices: [
                { text: "Would you still be you?", effects: { bond: 15 }, emotion: "vulnerable", response: "I don't know. The seal holds power AND memory. Without it, I might not remember this. Us." },
                { text: "I'd stay either way", effects: { bond: 20, affection: 5, corruption: 3 }, emotion: "love", response: "Even if I became a monster? Even if the darkness consumed everything? ...You're either lying or insane. I hope you're insane.", memoryKey: "stayEitherWay" },
                { text: "Then let's not break it", effects: { bond: 10 }, emotion: "sad", response: "A cage I choose is still a cage. But you make the bars feel like... arms." }
            ]
        },
        {
            id: 'noir_trust',
            character: 'noir',
            minAffection: 4,
            prompt: "I've been betrayed by everyone I've trusted. Mortals. Weavers. Gods. And now I'm trusting you.",
            choices: [
                { text: "I won't betray you", effects: { bond: 20, affection: 3 }, emotion: "love", response: "They all said that. But your voice\u2014 *shadows still* ...your voice sounds different. I'm choosing to believe.", memoryKey: "trustedYou" },
                { text: "I know what that costs you", effects: { bond: 18 }, emotion: "vulnerable", response: "You do. Somehow, you do. That's either empathy or magic. With you, I can't tell the difference." },
                { text: "Then I'll earn it every day", effects: { bond: 15, affection: 5, corruption: 2 }, emotion: "love", response: "Every day. Not once. Not a promise and then silence. Every day. ...I'll be watching. Hoping." }
            ]
        }
    ];

    // ── State ─────────────────────────────────────────────────
    function getSeenIds() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
        } catch (_) {
            return [];
        }
    }

    function markSeen(id) {
        const seen = getSeenIds();
        if (!seen.includes(id)) {
            seen.push(id);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(seen));
        }
    }

    // ── Helpers ───────────────────────────────────────────────
    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getCharKey() {
        const ch = window.CHARACTER;
        if (!ch) return null;
        return (ch.name || '').toLowerCase();
    }

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    // ── Find eligible scenario ────────────────────────────────
    function findScenario() {
        const game = window._game;
        if (!game) return null;

        const charKey  = getCharKey();
        if (!charKey) return null;

        const affLvl   = game.affectionLevel || 0;
        const seen     = getSeenIds();

        const eligible = SCENARIOS.filter(s =>
            s.character === charKey &&
            affLvl >= s.minAffection &&
            !seen.includes(s.id)
        );

        if (eligible.length === 0) return null;
        return pick(eligible);
    }

    // ── Create Choice Overlay ─────────────────────────────────
    function showChoiceOverlay(scenario) {
        const game = window._game;
        if (!game) return;

        // Build overlay
        const overlay = document.createElement('div');
        overlay.id = 'talk-choice-overlay';
        overlay.style.cssText = [
            'position: fixed',
            'bottom: 0',
            'left: 0',
            'right: 0',
            'z-index: 9999',
            'background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.7))',
            'padding: 20px 16px 28px',
            'display: flex',
            'flex-direction: column',
            'gap: 10px',
            'animation: talkChoiceFadeIn 0.3s ease-out',
            'max-height: 60vh',
            'overflow-y: auto'
        ].join(';');

        // Inject animation keyframes if not present
        if (!document.getElementById('talk-choice-styles')) {
            const style = document.createElement('style');
            style.id = 'talk-choice-styles';
            style.textContent = `
                @keyframes talkChoiceFadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                #talk-choice-overlay .choice-btn {
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 12px;
                    color: #fff;
                    padding: 14px 16px;
                    font-size: 15px;
                    line-height: 1.4;
                    text-align: left;
                    cursor: pointer;
                    transition: background 0.2s, border-color 0.2s;
                    font-family: inherit;
                    width: 100%;
                }
                #talk-choice-overlay .choice-btn:active {
                    background: rgba(255,255,255,0.18);
                    border-color: rgba(255,255,255,0.5);
                }
            `;
            document.head.appendChild(style);
        }

        // Prompt text
        const promptEl = document.createElement('div');
        promptEl.style.cssText = 'color: #e0d0ff; font-size: 16px; line-height: 1.5; margin-bottom: 6px; font-style: italic;';
        promptEl.textContent = '"' + scenario.prompt + '"';
        overlay.appendChild(promptEl);

        // Choice buttons
        scenario.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text;
            btn.addEventListener('click', () => onChoiceSelected(scenario, choice, overlay), false);
            overlay.appendChild(btn);
        });

        document.body.appendChild(overlay);
    }

    // ── Handle choice selection ───────────────────────────────
    function onChoiceSelected(scenario, choice, overlay) {
        const game = window._game;
        if (!game) return;

        // Remove overlay immediately (don't linger with the dark bg)
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.25s ease-out';
        setTimeout(() => { try { overlay.remove(); } catch(e){} }, 260);

        // Safety: ensure focus overlay is cleared so we don't end up with a
        // black screen if another system left it enabled.
        try {
            if (game.ui && game.ui.setFocusMode) game.ui.setFocusMode(false);
            const focus = document.getElementById('focusOverlay');
            if (focus) focus.classList.remove('active');
        } catch (e) {}

        // Apply stat effects. NOTE: affection is the raw score (0-100);
        // affectionLevel is DERIVED as Math.floor(affection/25) every tick,
        // so writing to affectionLevel directly gets overwritten within 100ms.
        // Always write to game.affection instead.
        if (choice.effects) {
            if (choice.effects.bond) {
                game.bond = clamp((game.bond || 0) + choice.effects.bond, 0, 100);
            }
            if (choice.effects.affection) {
                game.affection = clamp((game.affection || 0) + choice.effects.affection, 0, 100);
            }
            if (choice.effects.corruption) {
                game.corruption = clamp((game.corruption || 0) + choice.effects.corruption, 0, 100);
            }
        }

        // Set memory flag (+ day stamp for callback gating)
        if (choice.memoryKey) {
            if (!game.choiceMemory) game.choiceMemory = {};
            game.choiceMemory[choice.memoryKey] = true;
            game.choiceMemory[choice.memoryKey + '_day'] = game.storyDay || 1;
        }

        // Mark scenario as seen
        markSeen(scenario.id);

        // Wait a tiny bit for the overlay to clear, THEN flash emotion + show response.
        // This ensures the character is visible before the new dialogue appears.
        setTimeout(() => {
            if (choice.emotion && game.ui && game.ui.setCharacterSprite) {
                try { game.ui.setCharacterSprite(choice.emotion); } catch (e) {}
            }
            if (choice.response && game.typewriter) {
                try { game.typewriter.show(choice.response, function(){}); } catch (e) {}
            }
        }, 280);

        // Save state
        try { game.save(); } catch (e) {}
    }

    // ── Intercept Talk Button ─────────────────────────────────
    function interceptTalkButton() {
        const talkBtn = document.getElementById('btn-talk');
        if (!talkBtn) return;

        // Add our handler BEFORE the game's own (capture phase)
        talkBtn.addEventListener('click', function (e) {
            const game = window._game;
            if (!game || game.sceneActive || game.characterLeft) return;

            // 30% chance to show choice overlay (CHOICE_CHANCE = 0.30).
            // Fires if random is LESS than chance — previously inverted (> meant 70%).
            if (Math.random() >= CHOICE_CHANCE) return; // Let normal talk proceed

            const scenario = findScenario();
            if (!scenario) return; // No eligible scenarios, let normal talk proceed

            // Prevent the default talk handler
            e.stopImmediatePropagation();
            e.preventDefault();

            showChoiceOverlay(scenario);
        }, true); // `true` = capture phase, fires before game handler
    }

    // ── Init ──────────────────────────────────────────────────
    function init() {
        interceptTalkButton();
    }

    // ── Poll for game readiness ───────────────────────────────
    const poll = setInterval(() => {
        if (window._game && window._game.tickInterval) {
            clearInterval(poll);
            init();
        }
    }, 500);

    // Expose for other modules
    window.TalkChoices = {
        SCENARIOS: SCENARIOS,
        findScenario: findScenario,
        showChoiceOverlay: showChoiceOverlay
    };
})();
