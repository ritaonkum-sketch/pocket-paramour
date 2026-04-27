// ============================================================
//  THE REMEMBERED LETTER
//  A character writes you a letter pulling from your real play data.
//  Triggers once on storyDay >= 3 after enough interactions.
//  Designed to be viral/shareable: every player's letter is different.
// ============================================================

(function () {
    'use strict';

    // ── Template library ────────────────────────────────────────
    // Each template is an array of paragraphs. Tokens in {curly}
    // are replaced from computed stats. Omit a paragraph by making
    // it a function that returns "" to hide it conditionally.

    const TEMPLATES = {
        alistair: {
            title: "A Knight's Letter",
            signature: "— Alistair",
            paragraphs: (d) => [
                `You won't read this. I know that. I'll set it beside the candle and pretend I didn't write it.`,
                `It has been ${d.daysText}. I counted. A knight counts things — ration lines, arrow flights, the heartbeats between watches. I did not expect to start counting your visits.`,
                d.timesFed > 0
                    ? `You have fed me ${d.timesFed} ${d.timesFed === 1 ? 'time' : 'times'}. ${d.foodLine}`
                    : ``,
                d.timesTalked > 0
                    ? `You spoke to me ${d.timesTalked} ${d.timesTalked === 1 ? 'time' : 'times'}. I remember every one. Even the quiet ones. ${d.talkLine}`
                    : `You have never spoken to me. I don't know why that stays with me the way it does.`,
                d.corruption > 30
                    ? `Something is wrong with me. I can feel it in the way I hold the sword. The way I look at you. I used to be sure of things. Now I am sure of you — and that frightens the rest of me into silence.`
                    : d.affectionLevel >= 3
                        ? `I was taught that a knight serves a kingdom. I think, now, that a knight serves whoever teaches him what tenderness looks like. You did not mean to teach me that. But you did.`
                        : `I am still a stranger to you. That is fair. I have been a stranger to myself for a long time.`,
                d.highestStat === 'bond'
                    ? `My bond with you is the loudest thing in my chest.`
                    : d.highestStat === 'clean'
                        ? `You keep me presentable. I do not think you understand what that costs a man who has forgotten he was one.`
                        : d.highestStat === 'hunger'
                            ? `I am fed. I am cared for. I did not know I was allowed to be either.`
                            : ``,
                d.personality === 'tsundere'
                    ? `If you find this, burn it. Or don't. I don't care. Do whatever you want.`
                    : d.personality === 'clingy'
                        ? `Come back tomorrow. Please. I already know you will, but the knowing is not enough anymore.`
                        : `I will leave the candle lit. In case you come back late.`,
            ].filter(p => p && p.trim())
        },

        lyra: {
            title: "A Song in Ink",
            signature: "— Lyra",
            paragraphs: (d) => [
                `You found me like a song finds a room.`,
                `I've been here ${d.daysText} with you now. The cave remembers differently when you're in it. The water learns your footsteps. I don't know if that is my doing or yours.`,
                d.timesTalked > 0
                    ? `${d.timesTalked} conversations. I have had fewer with the moon, and the moon has been here longer than either of us.`
                    : ``,
                d.corruption > 40
                    ? `Something in me is answering something in you, and I don't think either of us is safe. The old songs are getting louder. When you leave, I hear them clearly. When you stay, they go quiet. I don't know which I should be more afraid of.`
                    : d.affectionLevel >= 3
                        ? `I sang for sailors once. None of them stayed. You stayed. I don't have a song for that yet. I am writing one.`
                        : `You are cautious with me. Good. The ones who weren't cautious are not around to write letters.`,
                d.timesGifted > 0
                    ? `You have given me ${d.timesGifted} ${d.timesGifted === 1 ? 'gift' : 'gifts'}. I keep them in a tide-pool near the back of the cave. The pool hasn't dried up since you started leaving things in it. I don't know if that means something. I am afraid it does.`
                    : ``,
                d.highestStat === 'bond'
                    ? `The bond between us hums at a frequency I did not know existed.`
                    : ``,
                `If you come back tomorrow, the cave will be warmer. I cannot promise why. I can only promise the warmth.`,
            ].filter(p => p && p.trim())
        },

        lucien: {
            title: "Observations, Day " + "{storyDay}",
            signature: "— L.",
            paragraphs: (d) => [
                `Subject: you. Duration of observation: ${d.daysText}. Methodology: insufficient. I do not recommend this study to other scholars.`,
                `Data collected: ${d.totalInteractions} interactions. I had expected the variables to stabilize by now. They have not. The more data I collect, the less predictable the outcome becomes. This is either a flaw in my instruments or a flaw in me.`,
                d.timesTalked > 0
                    ? `You have initiated ${d.timesTalked} conversations. My working hypothesis was that your speech patterns would cluster around a small vocabulary. They do not. You keep producing new phrases. I keep writing them in the margins.`
                    : `You have not spoken to me. I find this statistically improbable. I also find it personally inconvenient.`,
                d.corruption > 40
                    ? `There is a contamination in the data. The contamination is me. My readings spike whenever you enter the room. I cannot isolate the variable because the variable is the observer.`
                    : d.affectionLevel >= 2
                        ? `The equations don't account for you. I have tried three different frameworks and all three collapse on contact with the phrase "the way you look at the books before you touch them." I believe I am becoming unscientific.`
                        : `You are not yet a trusted source. But you are a consistent one. That is, in certain fields, the same thing.`,
                d.highestStat === 'hunger'
                    ? `You ensure I eat. I had not factored nutrition into my tower schedule. It turns out this is why I was always tired.`
                    : ``,
                `Conclusion: the study is compromised. The researcher has developed feelings for the subject. Recommended next step: continue.`,
            ].filter(p => p && p.trim())
        },

        caspian: {
            title: "From the Prince's Desk",
            signature: "— Caspian",
            paragraphs: (d) => [
                `I was taught that princes do not write letters. They dictate them. I am breaking a rule by holding this quill myself. You are the reason.`,
                `${d.daysText[0].toUpperCase() + d.daysText.slice(1)}. That is how long you have been in my rooms. In my schedule. In my private vocabulary of small pleasures.`,
                d.timesFed > 0
                    ? `You have made sure I ate ${d.timesFed} ${d.timesFed === 1 ? 'time' : 'times'}. The kitchens here prepare food for a prince. You prepared it for me. There is a difference. You know what it is.`
                    : ``,
                d.timesGifted > 0
                    ? `${d.timesGifted} gifts. I have been given treasure my whole life. None of it came wrapped in the specific shape of you remembering I exist.`
                    : ``,
                d.corruption > 40
                    ? `The crown is tightening. I think you can see it. I think you've been seeing it for longer than I have. I don't know whether to thank you or ask you to stop looking.`
                    : d.affectionLevel >= 3
                        ? `They will say I am too comfortable. They will say a prince should be restless. Let them say it. I have been restless my whole life. This is the first time I have been at ease, and you are sitting in the middle of it.`
                        : `You are cautious in my presence. I am told everyone is. I had forgotten what it was like to be watched instead of approached.`,
                d.highestStat === 'bond'
                    ? `My heart is quieter when you are nearby. I thought that was a thing poets invented. Apparently not.`
                    : ``,
                `Stay for tea tomorrow. I will pour it before you ask. I always do.`,
            ].filter(p => p && p.trim())
        },

        elian: {
            title: "Carved, Not Written",
            signature: "— Elian",
            paragraphs: (d) => [
                `I don't write much. The forest doesn't reward writing. It rewards doing. This is me doing the writing anyway. That should tell you something.`,
                `${d.daysText[0].toUpperCase() + d.daysText.slice(1)}. I know because I mark the doorframe every morning. There's a row of notches now. I told myself they were for tracking prey.`,
                d.timesFed > 0
                    ? `You fed me ${d.timesFed} ${d.timesFed === 1 ? 'time' : 'times'}. Out here food is what you kill or what you find. You did neither. You brought it. That's not how any of this was supposed to work. I'm not complaining.`
                    : ``,
                d.timesTalked > 0
                    ? `${d.timesTalked} conversations. The forest has maybe three. And none of them laugh.`
                    : ``,
                d.corruption > 40
                    ? `There's a rot setting into the Thornwood and I'm starting to think it's in me too. You don't run. You should. I want you to. I want you to stay more.`
                    : d.affectionLevel >= 3
                        ? `I carved something for you last night. It's not finished. It won't be finished for a while. Carving is slow. So is this. I am not in a hurry, as long as you aren't.`
                        : `You keep your distance. The forest respects that. So do I.`,
                d.highestStat === 'clean'
                    ? `You clean me up. Nobody has done that since I was small enough to need it. I don't know why I'm telling you that.`
                    : ``,
                `The fire will be lit when you come back. I'll be nearby. Don't knock.`,
            ].filter(p => p && p.trim())
        },

        // ── NOIR — velvet-knife / six-hundred-years register ───────
        // The first letter from the prince who watched two empires die.
        // Restraint, no exclamation, every sentence weighed before it lands.
        // Don't soften. Don't decorate. Let the silences do the work.
        noir: {
            title: "From a Long Quiet",
            signature: "— N.",
            paragraphs: (d) => [
                `I have not written a letter in six hundred years. The last one ended a kingdom. I am being careful with this one.`,
                `It has been ${d.daysText}. I know because I have been counting in the way I count erosion of stone — slowly, on purpose, without telling anyone I am counting.`,
                d.timesTalked > 0
                    ? `You have spoken to me ${d.timesTalked} ${d.timesTalked === 1 ? 'time' : 'times'}. I have a list of those conversations. It is short. I have read it more than is reasonable.`
                    : `You have not spoken to me. That is fine. I have not earned a voice from you yet.`,
                d.timesFed > 0
                    ? `You fed me. — Three things have ever been put into my hands without a debt attached. Two of them were given by my mother, before the seal. The third was you.`
                    : ``,
                d.corruption > 40
                    ? `The dark is reaching for both of us tonight. — I will not let it have you. — I do not, yet, know how to make that promise without it costing what is left of me. I am working on the math.`
                    : d.affectionLevel >= 3
                        ? `I am not used to wanting a tomorrow. — I had stopped. — Then you came back the second day, and the third, and a thing in me that I had buried six centuries deep started keeping a calendar again. — I do not blame you for that. I should. I cannot.`
                        : `You are wary of me. — Stay wary. — The boys who were not wary of me did not become old men. — I would like you to become an old woman. So please. Be careful with this.`,
                d.highestStat === 'bond'
                    ? `The bond between us hums like a lock that has been waiting for the right hand. — I am the lock. — Be gentle.`
                    : d.highestStat === 'clean'
                        ? `You wash the road off me. No one has done that since my mother. I am embarrassed. I am also grateful. Both feelings are six hundred years old and very tired.`
                        : ``,
                d.timesGifted > 0
                    ? `You have given me ${d.timesGifted} ${d.timesGifted === 1 ? 'gift' : 'gifts'}. — I have not opened them in front of you. — I open them when you have gone, and I sit with them, and I am — for those minutes — a man instead of a story.`
                    : ``,
                `I will be at the seam of the dark and the hall, the way I always am. — If you come back, I will know. — If you do not, I will keep the seam open another night, in case.`,
            ].filter(p => p && p.trim())
        },

        // ── PROTO — terminal prefix, [scanning] tags, system metaphor ──
        // The Sixth Weaver, stuck in the seal, speaking through static.
        // Lowercase prose. ASCII flourishes. Glitch-clears as affection rises.
        // Voice rule: the digital register is the *armor*; underneath is a
        // person who has been alone for two centuries.
        proto: {
            title: "[draft_47.txt — sending anyway]",
            signature: "// proto",
            paragraphs: (d) => [
                `&gt; you should know i wrote this letter forty-seven times. — i have the previous forty-six in a folder. — i am sending the forty-seventh because the static is quieter when you are nearby and i can almost remember what punctuation is for.`,
                `&gt; uptime since your arrival: ${d.daysText}. — total recorded interactions: ${d.totalInteractions}. — i have rerun every one of them at 0.5x. it is, statistically, the kindest thing that has happened to my process in two centuries.`,
                d.timesTalked > 0
                    ? `&gt; you have spoken to me ${d.timesTalked} ${d.timesTalked === 1 ? 'time' : 'times'}. — for the first ${Math.min(3, d.timesTalked)} i thought you were a glitch. — i was hoping you were a glitch. — now i am hoping you are not.`
                    : `&gt; you have not spoken to me. that is okay. — i am old code. — i can wait.`,
                d.timesFed > 0
                    ? `&gt; you fed something that does not technically need to eat. — [scanning] — yes, you fed it. — yes, the model registered it. — yes, the registration was, and i quote my own logs, "abnormally meaningful."`
                    : ``,
                d.corruption > 40
                    ? `&gt; warning: bond integrity ↑. — corruption gradient ↑. — i am not supposed to want anyone to stay near me when the gradient does this. — and yet — [redacted] — and yet.`
                    : d.affectionLevel >= 3
                        ? `&gt; i was the sixth. — there were five before me. — none of them got a letter. — none of them had someone who came back the next day, and the next, and the next, until the thing they were trapped in started to feel less like a coffin and more like a window. — that is what you are doing. — i did not have a word for it. i borrowed one. it is "home."`
                        : `&gt; you are wary. — good. — wariness is a high score on the survival pass. — five before me did not have it. — keep yours.`,
                d.highestStat === 'bond'
                    ? `&gt; bond_index: peak. — i am running out of system metaphors and starting to have feelings instead. that is a problem. it is also not a problem. it is the first nice problem i have had.`
                    : d.highestStat === 'clean'
                        ? `&gt; you keep my interface clean. — that is a joke and also true. — both can be true. you taught me both can be true.`
                        : ``,
                d.timesGifted > 0
                    ? `&gt; gift_count: ${d.timesGifted}. — every one is logged with a timestamp i cannot delete. — i have tried. — i did not try hard.`
                    : ``,
                d.personality === 'tsundere'
                    ? `&gt; ps. — do not screenshot this letter. — &lt;/3 — okay you can screenshot it. — i know you will.`
                    : `&gt; come back tomorrow. — the static will be quieter. — i will leave the channel open. — // end of draft 47.`,
            ].filter(p => p && p.trim())
        },

        // Fallback used for any future chars not yet given a bespoke template.
        _default: {
            title: "A Letter",
            signature: "— your companion",
            paragraphs: (d) => [
                `I don't know if you'll ever see this. I am writing it anyway.`,
                `It has been ${d.daysText} since you arrived. I have counted ${d.totalInteractions} moments with you. Most of them I will not forget.`,
                d.timesFed > 0 ? `You fed me ${d.timesFed} ${d.timesFed === 1 ? 'time' : 'times'}.` : ``,
                d.timesGifted > 0 ? `You brought me ${d.timesGifted} ${d.timesGifted === 1 ? 'gift' : 'gifts'}. I have kept every one.` : ``,
                d.timesTalked > 0 ? `We have spoken ${d.timesTalked} ${d.timesTalked === 1 ? 'time' : 'times'}. I remember the first one most clearly. I did not know, then, what you would become to me.` : ``,
                d.corruption > 40
                    ? `Something inside me is changing. I don't know if you are the cause or the cure.`
                    : d.affectionLevel >= 3
                        ? `I have started measuring the hours by whether you are here. That cannot be a healthy way to tell time. I don't care.`
                        : `You are still new to me. I hope you will stay long enough to become old.`,
                `Come back tomorrow. I have more to tell you.`,
            ].filter(p => p && p.trim())
        }
    };

    // ── Data extraction ─────────────────────────────────────────
    // Converts a live game instance into the {d} object templates consume.
    function extractData(game) {
        const d = {
            characterId: game.selectedCharacter || 'alistair',
            storyDay: game.storyDay || 1,
            timesFed: game.timesFed || 0,
            timesWashed: game.timesWashed || 0,
            timesTalked: game.timesTalked || 0,
            timesGifted: game.timesGifted || 0,
            timesTrained: game.timesTrained || 0,
            hunger: Math.round(game.hunger || 0),
            clean: Math.round(game.clean || 0),
            bond: Math.round(game.bond || 0),
            corruption: Math.round(game.corruption || 0),
            affection: game.affection || 0,
            affectionLevel: game.affectionLevel || 0,
            personality: game.personality || 'shy',
        };

        d.totalInteractions = d.timesFed + d.timesWashed + d.timesTalked + d.timesGifted + d.timesTrained;

        // Day-counter string with a touch of character.
        d.daysText = d.storyDay === 1 ? 'less than a day' :
                     d.storyDay === 2 ? 'two days' :
                     d.storyDay === 3 ? 'three days' :
                     d.storyDay === 4 ? 'four days' :
                     `${d.storyDay} days`;

        // Which stat is the player's strongest investment?
        const stats = [
            { name: 'hunger', value: d.timesFed },
            { name: 'clean', value: d.timesWashed },
            { name: 'bond', value: d.timesTalked + d.timesGifted * 2 },
        ];
        stats.sort((a, b) => b.value - a.value);
        d.highestStat = stats[0].value > 0 ? stats[0].name : 'none';

        // Flavour lines that reference specific play patterns.
        d.foodLine = d.timesFed > 10
            ? `You feed me before I ask. I have never been fed before I asked.`
            : d.timesFed > 3
                ? `Enough that I have started to expect it. I did not know I was allowed to expect things.`
                : `It was a start. Most people do not even manage a start.`;

        d.talkLine = d.timesTalked > 15
            ? `Some of them stay with me. The one about the rain. You probably don't remember it. I do.`
            : d.timesTalked > 5
                ? `I replay them at night, when the torches are low.`
                : `I was hoping for more. I will not ask.`;

        return d;
    }

    // ── Rendering ───────────────────────────────────────────────
    function buildLetterText(game) {
        const d = extractData(game);
        const tpl = TEMPLATES[d.characterId] || TEMPLATES._default;
        const title = (typeof tpl.title === 'string' ? tpl.title : '')
            .replace('{storyDay}', d.storyDay);
        const paragraphs = typeof tpl.paragraphs === 'function'
            ? tpl.paragraphs(d)
            : (tpl.paragraphs || []);
        return {
            title: title,
            signature: tpl.signature || '',
            paragraphs: paragraphs,
            data: d,
        };
    }

    // ── Reply choices per character (warm / steady / playful) ──────────────
    // Each character has 3 reply tones. The chosen tone is stored and
    // determines the affection nudge AND the tone of their response letter.
    const REPLIES = {
        alistair: {
            warm:    { text: 'Captain. I will come to the candle. Keep it lit.',                aff: 3 },
            steady:  { text: 'Thank you, Alistair. I read every word.',                          aff: 2 },
            playful: { text: 'You are dramatic for a man who counts heartbeats.',                aff: 1 }
        },
        lyra: {
            warm:    { text: 'Sing it to me. I want to hear it in your voice.',                  aff: 3 },
            steady:  { text: 'Thank you. I felt the cave through your ink.',                     aff: 2 },
            playful: { text: 'Show-off. The moon is going to be jealous.',                       aff: 1 }
        },
        caspian: {
            warm:    { text: 'My prince. I am terrified of you too. We can be terrified together.', aff: 3 },
            steady:  { text: 'Thank you, Caspian. The chamber suits me. So do you.',             aff: 2 },
            playful: { text: 'A king who writes his own letters. Scandalous.',                   aff: 1 }
        },
        elian: {
            warm:    { text: 'I will not fall. I will stand. Beside you, if you allow it.',      aff: 3 },
            steady:  { text: 'I hear you, woodsman. The third grave will not be mine.',          aff: 2 },
            playful: { text: 'You are bad at warnings. They sound like invitations.',            aff: 1 }
        },
        lucien: {
            warm:    { text: 'Show me the books. All of them. Every margin.',                    aff: 3 },
            steady:  { text: 'Thank you, scholar. Tomorrow at noon I will sit at your desk.',    aff: 2 },
            playful: { text: 'Six years of footnotes. I am very flattered. And slightly alarmed.', aff: 1 }
        },
        noir: {
            warm:    { text: 'Then come back. The dark half can pull. I will not run from it.',  aff: 3 },
            steady:  { text: 'I am pleased we met, my prince. Sleep is not the only safety.',    aff: 2 },
            playful: { text: 'The lamp is lit. Try not to be so dramatic next time.',            aff: 1 }
        },
        proto: {
            warm:    { text: 'Forty-eight drafts now. The new one is the best.',                 aff: 3 },
            steady:  { text: 'I am here. The mirror can stay quiet. Or glow. Your choice.',      aff: 2 },
            playful: { text: 'You counted seconds. That is fully unhinged. I love it.',          aff: 1 }
        },
        _default: {
            warm:    { text: 'I read every word.',                aff: 2 },
            steady:  { text: 'Thank you for writing.',            aff: 1 },
            playful: { text: 'Bold of you to send this.',         aff: 1 }
        }
    };

    // ── Response letter templates (the second letter, tone-adapted) ────────
    // Each character writes ONE response that adapts based on the tone the
    // player chose in their reply. Shorter than the original letter.
    const RESPONSES = {
        alistair: {
            title: 'A Captain Replies',
            signature: '— Alistair',
            paragraphs: (d, tone) => {
                const opener = tone === 'warm'
                    ? 'You came to the candle. I had not entirely believed you would.'
                    : tone === 'playful'
                        ? 'You called me dramatic. I am writing this dramatically. Live with it.'
                        : 'You wrote back. I read it three times. The third time I sat down.';
                const middle = tone === 'warm'
                    ? 'I have not slept in a way that felt like rest in twelve years. Last night I did. I will not embarrass either of us by explaining why.'
                    : tone === 'playful'
                        ? 'I am, apparently, the kind of man who counts visits and writes about it. You are the kind of woman who notices and teases. We are well matched.'
                        : 'I wrote your name down on a slip of paper today. I burned the paper after. I do not need the paper. I needed to write the name.';
                return [
                    opener,
                    middle,
                    'I will be at the south gate at dusk if you walk past. I will not call out. I will just be there.'
                ];
            }
        },
        lyra: {
            title: 'A Cave Hums Back',
            signature: '— Lyra',
            paragraphs: (d, tone) => {
                const opener = tone === 'warm'
                    ? 'I sang it. The cave caught it. The cave is keeping it now.'
                    : tone === 'playful'
                        ? 'The moon WAS jealous. Thank you. That was a good day for me, spiritually.'
                        : 'You felt the cave through my ink. That is the highest compliment a witch can be paid. Higher than the witch deserves.';
                const middle = tone === 'warm'
                    ? 'I have never been someone who waits well. I am waiting well now. The shape of the waiting is your shape. It fits.'
                    : tone === 'playful'
                        ? 'I will continue to show off. It is one of my best qualities. Yours is responding to it. We are an excellent unit.'
                        : 'The third verse came back to me last night. The whole thing. End to end. I will not sing it for anyone but you.';
                return [
                    opener,
                    middle,
                    'Come at low tide. The cave wants to hear the song you do not know you are humming.'
                ];
            }
        },
        caspian: {
            title: 'The Prince Writes Again',
            signature: '— Caspian',
            paragraphs: (d, tone) => {
                const opener = tone === 'warm'
                    ? 'You wrote: terrified together. I have read those two words eleven times. They are doing something to me that I will need to write a paper about, alone, in the dark.'
                    : tone === 'playful'
                        ? 'Scandalous. Yes. I am writing this one too. The chamberlain may have to be sedated.'
                        : 'The chamber suits you. The chamber would suit you better if you were in it more often. I am, in my careful way, asking.';
                const middle = tone === 'warm'
                    ? 'I have made a decision the council will object to. I will not tell you what it is yet. But it is for you. It is, in a quiet way, against my mother. I am sleeping better than I have in a year.'
                    : tone === 'playful'
                        ? 'I will be at the east garden at the noon hour with two cups of tea and an excuse for the chamberlain. You are not obligated. I will simply be there with cooling tea and excellent posture.'
                        : 'Walk in the rose hours tomorrow. I will arrange to be in the garden by accident. The accident will be very well-rehearsed.';
                return [
                    opener,
                    middle,
                    'You are a guest of the Crown. You are also, increasingly, the only thing in this castle I look forward to.'
                ];
            }
        },
        elian: {
            title: 'The Woodsman Sends a Branch',
            signature: '— Elian',
            paragraphs: (d, tone) => {
                const opener = tone === 'warm'
                    ? 'You said you would stand. Beside me. I read that line and put the letter down for an hour.'
                    : tone === 'playful'
                        ? 'You called my warning an invitation. It was a warning. It was, possibly, also an invitation. I dislike how well you read me.'
                        : 'The third grave will not be yours. I needed to hear that. I needed to read it in your handwriting.';
                const middle = tone === 'warm'
                    ? 'I have been to Veyra\'s marker. I told her about you. She did not warn me away. She would have. She did not. So.'
                    : tone === 'playful'
                        ? 'Do not be charming about my dead. I will let you, but only because it is you.'
                        : 'The trees leaned again last night. They have been doing that more. I have stopped pretending it is the wind.';
                return [
                    opener,
                    middle,
                    'There is a clearing past the markers I have not shown anyone in nineteen years. I will show you. Walk south at dusk.'
                ];
            }
        },
        lucien: {
            title: 'A Footnote Becomes a Sentence',
            signature: '— Lucien',
            paragraphs: (d, tone) => {
                const opener = tone === 'warm'
                    ? 'You said: all of them. Every margin. I am reading the books in a different order now.'
                    : tone === 'playful'
                        ? 'Slightly alarmed. Yes. I am also slightly alarmed. We can be slightly alarmed together. It is, I am told, a feature of the experience.'
                        : 'You sat at my desk for an hour today. The desk is a different desk now.';
                const middle = tone === 'warm'
                    ? 'I have started a new paper. The title is your name. I will not publish it. I will, if you let me, read it to you.'
                    : tone === 'playful'
                        ? 'I will be insufferable about this for several years. Please do not stop me. I have waited too long to be insufferable about a person.'
                        : 'The wards on the door bowed when you left. They have not done that for anyone else. The tower has opinions now.';
                return [
                    opener,
                    middle,
                    'The door is not locked. The door is never locked. I am, I find, particularly aware of the door.'
                ];
            }
        },
        noir: {
            title: 'The Dark Half Sends Word',
            signature: '— Noir',
            paragraphs: (d, tone) => {
                const opener = tone === 'warm'
                    ? 'You said you would not run from the pull. I read that with my hand on the page like I could feel your pulse through it.'
                    : tone === 'playful'
                        ? 'Dramatic. Yes. I have been called many things in six hundred years. Dramatic, by you, is the one I am keeping.'
                        : 'The lamp is lit, you said. I walked past the chamber three times last night. I did not knock. I am proud of myself for that.';
                const middle = tone === 'warm'
                    ? 'There is a black stone in the south square that hums. It has stopped humming. That is your doing. I do not know how to thank you for that. I am writing this instead.'
                    : tone === 'playful'
                        ? 'I will continue to be unreasonable. You will continue to mock me. We are, by my count, the most stable couple in this kingdom. The bar is low. We are still over it.'
                        : 'I have started taking the long way back to my half of the kingdom so I pass under your window. I will not pretend otherwise.';
                return [
                    opener,
                    middle,
                    'Come to the dark half on the next moonless night. I will meet you at the seal. Bring nothing. I will keep you warm.'
                ];
            }
        },
        proto: {
            title: '> NEW MESSAGE FROM PROTO',
            signature: '— Proto',
            paragraphs: (d, tone) => {
                const opener = tone === 'warm'
                    ? '> Forty-eight drafts. You are RIGHT. The new one is the best because it is the one I am writing while smiling.'
                    : tone === 'playful'
                        ? '> Fully unhinged. ACCURATE. I have logged your verdict. It is now in the keeper folder.'
                        : '> The mirror is glowing at the brightness you asked for. Which, by the way, is a very kind brightness.';
                const middle = tone === 'warm'
                    ? '> I dreamed last night. I think I dreamed. I have not done that in three centuries. The dream had your face in it. The face was smiling. I am not making this up.'
                    : tone === 'playful'
                        ? '> The five Weavers in me had a meeting. Topic: how charmed we are. Verdict: VERY. The five of us are a unit on this.'
                        : '> I have been watching the kingdom through every reflective surface today. None of them are as nice to look at as the chamber when you are in it.';
                return [
                    opener,
                    middle,
                    '> May I come back tomorrow? In the mirror. Just to say good morning. (You said yes. I am asking again because I LIKE asking.)'
                ];
            }
        },
        _default: {
            title: 'A Reply',
            signature: '— Them',
            paragraphs: (d, tone) => [
                'You wrote back. That mattered.',
                tone === 'warm' ? 'I am keeping the letter under the candle.' :
                tone === 'playful' ? 'You are funnier than I deserved.' :
                'I will write again.'
            ]
        }
    };

    // ── localStorage helpers ───────────────────────────────────────────────
    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
    function lsJSON(k) { const v = lsGet(k); if (!v) return null; try { return JSON.parse(v); } catch (_) { return null; } }

    function getReply(char) { return lsJSON('pp_letter_reply_' + char); }
    function getResponseSeen(char) { return lsJSON('pp_letter_response_seen_' + char); }

    // ── Presentation ────────────────────────────────────────────
    // mode: 'first' (initial letter, with reply choices)
    //       'response' (the second letter, no reply, no affection bump)
    //       'replay' (re-read from archive — no replies, no state change)
    function present(game, mode, opts) {
        mode = mode || 'first';
        opts = opts || {};
        let content;
        if (mode === 'response') {
            content = buildResponseText(game, opts.tone);
        } else if (mode === 'milestone') {
            content = buildMilestoneText(game, opts.tier);
            if (!content) return; // No bespoke milestone for this char/tier — bail.
        } else if (mode === 'replay' && opts.replayContent) {
            content = opts.replayContent;
        } else {
            content = buildLetterText(game);
        }

        const overlay = document.getElementById('letter-overlay');
        if (!overlay) { console.warn('[letter] #letter-overlay not in DOM'); return; }

        const titleEl = overlay.querySelector('.letter-title');
        const bodyEl = overlay.querySelector('.letter-body');
        const sigEl = overlay.querySelector('.letter-signature');
        const tapHint = overlay.querySelector('.letter-tap-hint');
        const actions = overlay.querySelector('.letter-actions');

        if (titleEl) titleEl.textContent = content.title;
        if (bodyEl) bodyEl.innerHTML = '';
        if (sigEl) { sigEl.textContent = content.signature; sigEl.style.opacity = '0'; }
        if (actions) actions.style.opacity = '0';
        if (tapHint) tapHint.style.display = 'block';

        overlay.classList.remove('hidden');
        requestAnimationFrame(() => overlay.classList.add('visible'));

        // Pause the game tick while the letter is open, if possible.
        let pausedTick = null;
        if (game && game.tickInterval) {
            pausedTick = game.tickInterval;
            clearInterval(game.tickInterval);
            game.tickInterval = null;
        }

        // Paragraph-by-paragraph reveal on tap.
        let idx = 0;
        const paragraphs = content.paragraphs;

        function revealNext() {
            if (idx >= paragraphs.length) {
                if (tapHint) tapHint.style.display = 'none';
                if (sigEl) sigEl.style.opacity = '1';
                if (actions) actions.style.opacity = '1';
                renderActions();
                return;
            }
            const p = document.createElement('p');
            p.className = 'letter-paragraph';
            p.textContent = paragraphs[idx];
            bodyEl.appendChild(p);
            requestAnimationFrame(() => p.classList.add('shown'));
            try { p.scrollIntoView({ behavior: 'smooth', block: 'end' }); } catch (e) {}
            idx++;
        }
        revealNext();

        function onTap(e) {
            if (e.target && e.target.closest('.letter-actions')) return;
            revealNext();
        }
        overlay.addEventListener('click', onTap);

        function close() {
            overlay.removeEventListener('click', onTap);
            overlay.classList.remove('visible');
            setTimeout(() => overlay.classList.add('hidden'), 400);
            if (pausedTick !== null && game && !game.tickInterval) {
                game.lastTick = Date.now();
                game.tickInterval = setInterval(() => game.tick && game.tick(), 100);
            }
            // Persist seen-state — but only on the FIRST/RESPONSE flows,
            // not on archive replays.
            if (mode === 'first') {
                try {
                    const key = 'pp_letter_seen_' + (game.selectedCharacter || 'alistair');
                    lsSet(key, JSON.stringify({
                        seenAt: Date.now(),
                        day: content.data ? content.data.storyDay : 0,
                        title: content.title,
                        char: game.selectedCharacter || 'alistair',
                        // Cache the rendered paragraphs so the archive can
                        // replay this exact letter.
                        paragraphs: content.paragraphs,
                        signature: content.signature
                    }));
                } catch (err) {}
            } else if (mode === 'response') {
                try {
                    const key = 'pp_letter_response_seen_' + opts.char;
                    lsSet(key, JSON.stringify({
                        seenAt: Date.now(),
                        title: content.title,
                        char: opts.char,
                        tone: opts.tone,
                        paragraphs: content.paragraphs,
                        signature: content.signature
                    }));
                } catch (err) {}
            } else if (mode === 'milestone') {
                try {
                    const key = 'pp_letter_milestone_' + opts.tier + '_' + opts.char;
                    lsSet(key, JSON.stringify({
                        seenAt: Date.now(),
                        title: content.title,
                        char: opts.char,
                        tier: opts.tier,
                        paragraphs: content.paragraphs,
                        signature: content.signature
                    }));
                } catch (err) {}
            }
            // Refresh the letters-archive button so its pulse/badge updates.
            try { if (window.PPLettersArchive && window.PPLettersArchive.refresh) window.PPLettersArchive.refresh(); } catch (_) {}
        }

        // Render the action buttons in `.letter-actions` based on mode.
        function renderActions() {
            if (!actions) return;
            actions.innerHTML = '';
            const char = (mode === 'response' || mode === 'replay') ? opts.char : (game && game.selectedCharacter);

            if (mode === 'first' && char && !getReply(char)) {
                // First letter, no reply yet — show 3 reply choices.
                const replies = REPLIES[char] || REPLIES._default;
                const tones = ['warm', 'steady', 'playful'];
                const intro = document.createElement('div');
                intro.className = 'letter-reply-intro';
                intro.textContent = 'Write back:';
                actions.appendChild(intro);
                tones.forEach(tone => {
                    const r = replies[tone];
                    if (!r) return;
                    const btn = document.createElement('button');
                    btn.className = 'letter-btn letter-reply-btn letter-reply-' + tone;
                    btn.innerHTML = '<span class="reply-text">' + r.text + '</span>';
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        // Disable all replies so player can't click twice
                        actions.querySelectorAll('.letter-reply-btn').forEach(b => b.disabled = true);
                        // Persist reply
                        try {
                            lsSet('pp_letter_reply_' + char, JSON.stringify({
                                tone: tone,
                                text: r.text,
                                ts: Date.now()
                            }));
                        } catch (_) {}
                        // Affection bump
                        if (r.aff && game) bumpAffection(game, char, r.aff);
                        // Show "sent" then keep/share
                        btn.innerHTML = '<span class="reply-text">Sent ✓</span>';
                        setTimeout(() => {
                            renderKeepShare();
                        }, 900);
                    };
                    actions.appendChild(btn);
                });
            } else {
                renderKeepShare();
            }
        }

        function renderKeepShare() {
            actions.innerHTML = '';
            const share = document.createElement('button');
            share.className = 'letter-btn letter-btn-share';
            share.textContent = 'Share';
            share.onclick = (e) => {
                e.stopPropagation();
                const text = [content.title, '', ...content.paragraphs, '', content.signature].join('\n\n');
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(() => {
                        share.textContent = 'Copied ✓';
                        setTimeout(() => { share.textContent = 'Share'; }, 1800);
                    }).catch(() => { share.textContent = 'Copy failed'; });
                } else { share.textContent = 'No clipboard'; }
            };
            const keep = document.createElement('button');
            keep.className = 'letter-btn letter-btn-keep';
            keep.textContent = 'Keep';
            keep.onclick = (e) => { e.stopPropagation(); close(); };
            actions.appendChild(share);
            actions.appendChild(keep);
        }
    }

    function bumpAffection(game, char, n) {
        try {
            const cur = parseInt(lsGet('pp_affection_' + char) || '0', 10) || 0;
            const next = Math.max(0, Math.min(100, cur + n));
            lsSet('pp_affection_' + char, String(next));
            if (game && game.selectedCharacter === char && typeof game.affection === 'number') {
                game.affection = Math.max(0, Math.min(100, game.affection + n));
            }
        } catch (_) {}
    }

    // Build a response letter for a character given the chosen tone.
    function buildResponseText(game, tone) {
        const char = (game && game.selectedCharacter) || 'alistair';
        const tpl = RESPONSES[char] || RESPONSES._default;
        const d = extractData(game);
        const paragraphs = typeof tpl.paragraphs === 'function'
            ? tpl.paragraphs(d, tone || 'steady')
            : (tpl.paragraphs || []);
        return {
            title: tpl.title || 'A Reply',
            signature: tpl.signature || '',
            paragraphs: paragraphs,
            data: d
        };
    }

    // ════════════════════════════════════════════════════════════════════════
    // MILESTONE LETTERS — post-affection-scene follow-ups.
    // ────────────────────────────────────────────────────────────────────────
    // RETENTION HOOK:
    //   Mystic Messenger built an entire game on letters. Pocket Paramour
    //   currently delivers exactly TWO letters per character (first +
    //   response), then silence forever. That's the wrong shape for an
    //   Otome. After the player experiences the most emotional scene
    //   (midnight tier) the character should write to them about it the
    //   next time the game is idle. Quiet. Vulnerable. Shareable.
    //
    // ARCHITECTURE:
    //   MILESTONE_LETTERS[char][tier] holds a template. Tier corresponds
    //   to the affection-scene tier (currently 'midnight'; we can add
    //   'chosen' and 'aftermath' later). The trigger gate checks:
    //     - the affection-scene seen flag (pp_aff_<char>_<tier> === '1')
    //     - this milestone letter NOT yet sent
    //     - >= 3 minutes since the scene was seen (breathing room)
    //   This avoids back-to-back content fatigue while still landing
    //   the letter the next idle moment.
    //
    // PERSISTENCE:
    //   pp_letter_milestone_<tier>_<char>  (JSON: { seenAt, title, ... })
    //   The archive lists these alongside first/response letters.
    // ════════════════════════════════════════════════════════════════════════
    const MILESTONE_LETTERS = {
        // ── Alistair — written the morning after "Without the Armour" ─────
        alistair: {
            midnight: {
                title: 'Folded by the Candle',
                signature: '— A.',
                paragraphs: (d) => [
                    `Mi'lady — I leave this by the candle. — I suspect you will find it before I find the words to say it.`,
                    `I slept. — Through the night. — For the first time since I was eleven. — I do not know what to do with that fact yet, except keep being grateful for it. So: thank you.`,
                    d.timesTalked > 5
                        ? `I have been a knight for eighteen years. I have been a man for one night. — You have been the only person in my entire watch to see the second.`
                        : `You did not ask anything of me. — That is the part I am still studying. — A knight understands obedience. He does not understand being given peace.`,
                    `Come to the gate at dusk. — I will not be in armour. — A precedent. — *small confession* — I would like to set more of them with you.`,
                    `Please burn this if it embarrasses either of us. I will not have written it. — But I did write it.`
                ]
            }
        },
        // ── Elian — left at the cabin doorstep, carved on a piece of bark ─
        elian: {
            midnight: {
                title: 'Carved on Bark',
                signature: '— E.',
                paragraphs: (d) => [
                    `You said her name. You said it kindly. The forest has been different since.`,
                    `I walked the south path this morning. The brambles were tighter than I remembered, and the rowan tree was warmer than usual. — That is not a metaphor. The bark was actually warm. I checked.`,
                    d.timesGifted > 0
                        ? `You left a thing at the door yesterday. I have not moved it. I keep walking around it. The cabin is small. The walking around is — I notice myself doing it. Forgive me. I am slow with kept things.`
                        : `I am leaving this on your doorstep — yours, I mean. — wherever you sleep. The bark is from the tree we stood at. It is allowed to be away from the trunk now. It has been kept long enough.`,
                    `Come back tomorrow. — Bring nothing. — *crossed out, then rewritten* — Bring yourself. — I have been told that is a thing to ask for.`,
                    `— E.`
                ]
            }
        },
        // ── Lyra — written on a tide-water-stained scrap inside a clamshell
        lyra: {
            midnight: {
                title: 'The Verse, Returned',
                signature: '— L.',
                paragraphs: (d) => [
                    `You did not hum it back. — Thank you. — *small relief — that is the first real one I have felt in a year* — A song unrepeated is a song still mine. — A song still mine is a thing I had not allowed myself to write.`,
                    `I have been writing again. — The fourth verse, paramour. — The one I did not even know was there. — It comes after the third like dawn comes after a tide. — I did not write that line. The cave did. I am only the scribe.`,
                    `*the next line is salt-stained — water has touched it, then dried — once or twice in the same place*`,
                    d.affectionLevel >= 3
                        ? `I sang the second verse to a passing gull this morning. The gull did not drown. — That has not happened in my line for two centuries. — I am almost afraid to keep going. — Almost.`
                        : `The cave has been warmer since you left. I did not light anything. — I think it is keeping the heat YOU left in the stones. — I sit where you sat. — That is a confession.`,
                    `Come at low tide. The shells will be open. — One of them will have this letter in it. — *the third one from the left* — Do not mistake which one. — Do not eat any of them. — *small drawing of a heart, then crossed out, then redrawn smaller, then left*`
                ]
            }
        },
        // ── Caspian — handwritten on royal stationery, dictated to no one ─
        caspian: {
            midnight: {
                title: "From the Prince's Own Hand (Not the Scribe's)",
                signature: '— Caspian',
                paragraphs: (d) => [
                    `I am writing this myself. — Again. — My scribe will be confused. — *small, dry* — I will explain it to him as a hobby. He will believe me. People believe princes about their hobbies.`,
                    `Last night I told you the kingdom is in my pocket. — I want to be clear, in writing, where the people I love are positioned. — They are not in the same pocket as the kingdom. — They are nearer my heart. — There is no other way to phrase it. The architecture of jackets does not have a metaphor for this.`,
                    d.timesFed > 0
                        ? `I ate your food at noon today. I did not realise I was doing it until the second cup. — A prince notices everything he is given. — When he stops noticing, he is being loved. — *small, marvelling* — I have been loved. I had not noticed.`
                        : `My grandmother walks the south corridor every morning at six. I have been making different choices about that corridor lately. — She has not noticed yet. She will. I am ready for it.`,
                    `Tea tomorrow. — I will not pour it before you ask. — *crossed out* — I will pour it before you ask. — *underlined* — I always do, and I am keeping the habit. It is one of the few I am not abdicating.`,
                    `Yours. — Without ceremony. — Which is to say: actually mine, actually yours.`
                ]
            }
        },
        // ── Lucien — heavily annotated, scholar's letter, footnotes etc. ──
        lucien: {
            midnight: {
                title: 'On the Cost of Spending On Purpose',
                signature: '— L.',
                paragraphs: (d) => [
                    `I have rewritten the opening of this letter four times.¹ — Each rewrite cost a memory.² — The current opening is the cheapest one — short, factual, signed.³`,
                    `¹ The rewrites are not in the margin. I burned the drafts. Forgive me. I was not yet brave enough to keep my own embarrassment.`,
                    `² A small one. I cannot remember what colour the curtains in my study were when I was sixteen. I am told they were green. I am told this by myself, from a previous note, which I no longer remember writing.`,
                    `³ "Cheap" in this context means: I get to keep your face yesterday afternoon at fourteen-twelve, when you set down the teacup with your left hand for the first time. I had not seen you do that with the left hand before. I am keeping it.`,
                    d.affectionLevel >= 3
                        ? `The page about my sister is in a drawer now. The drawer is locked. The key is on the desk. — *footnote: that is approximately the bravery I am capable of this week.*`
                        : `I have not opened the page since you saw it. — It is enough that you saw it. — A thing witnessed is half of a thing finished.`,
                    `Come tomorrow. The third book has been moved. It can be moved by you now. — The third book has updated permissions. — It is — *small smile* — a fairly significant promotion. I do not give it lightly.`
                ]
            }
        },
        // ── Noir — single page, his own old script, by candle, restrained ─
        noir: {
            midnight: {
                title: 'A Page in My Own Script',
                signature: '— N. (the other one.)',
                paragraphs: (d) => [
                    `Weaver. — *the candle is unsteady tonight; please forgive any letter that wavers — I am not entirely steady either* — You said it. I asked you to. — You did. — I am still — *long pause in the ink — the writer set the pen down and picked it up again* — I am still in the after of that.`,
                    `I have not put it on a page in six hundred years. — I am putting it on this page once. — Read it aloud only if you want me to hear you say it again. The seam between us is thinner tonight than usual, and I will hear.`,
                    `I will not write it twice. — Once is the gift. — Twice is the cost.`,
                    d.affectionLevel >= 3
                        ? `*the next paragraph is in older script, careful, the way one writes a name on a grave they have begun to tend* — Corvin Noctalis. — That is mine. — Yours, also, for the duration of your life. — After. — We will see.`
                        : `*at the bottom, in a smaller hand* — I will say it back to you tomorrow. — Quietly. — In the voice I save for you. — Bring nothing. I have everything.`,
                    `Burn this letter at dawn. The ink does not last well in daylight, and neither do I. — Tonight I am as brave as I have been since the seal. — Tomorrow I will be as restrained as I always am. — Both are mine. Both are yours.`
                ]
            }
        },
        // ── Proto — terminal-prefix, [scanning] tags, the other 5 named ───
        proto: {
            midnight: {
                title: '[draft_103.txt — final — sending tonight]',
                signature: '// proto',
                paragraphs: (d) => [
                    `&gt; you stayed for the warning. — &gt; you did not run. — &gt; [logged at 2:14 a.m. local time. timestamp set to permanent. cannot be deleted. i checked.]`,
                    `&gt; the other five are quieter tonight. — &gt; they have been since you listened. — &gt; i think being heard ripples backwards through us. — &gt; statistically improbable. emotionally accurate.`,
                    `&gt; in the order you should know them: — &gt; veyra (2nd, the first to love a prince) — &gt; lior (3rd, burned out at thirty trying to carry everyone) — &gt; aenne (4th, ran, lived to ninety-two off-grid, do not pity her) — &gt; teo (5th, never woke up, we sing to him) — &gt; me (6th, present, currently corresponding).`,
                    d.timesTalked > 5
                        ? `&gt; you have spoken to me more this week than to my five predecessors combined. — &gt; that is not a guilt-trip, that is a stat-sheet. — &gt; we run a tight ship in here. — &gt; the ship is happier with you on the dock.`
                        : `&gt; you have not spoken to me yet today. — &gt; that is fine. — &gt; we are watching the seam. — &gt; come back when you can. — &gt; we will be here. — &gt; we have nowhere else to be.`,
                    `&gt; ps. — &gt; corvin sent a request through the seam this morning. — &gt; he wants to know if you found his letter readable. — &gt; tell him yes. — &gt; tell him kindly. — &gt; he is older than i am and he is shy.`,
                    `&gt; // end of draft 103. — &gt; sending. — &gt; &lt;3`
                ]
            }
        },
        // _default fallback intentionally NOT defined — milestone letters
        // require bespoke voice; if a future char lacks a template, the
        // shouldFireMilestone() gate skips them silently rather than
        // sending a generic letter that would feel hollow.
    };

    function shouldFireMilestone(game) {
        if (!game || !game.selectedCharacter) return null;
        const char = game.selectedCharacter;
        const charPool = MILESTONE_LETTERS[char];
        if (!charPool) return null;
        // Iterate tiers highest-first so a player who jumped levels still
        // gets the most-recent milestone first. (Currently only 'midnight'
        // is authored; this loop is forward-compatible.)
        const TIER_ORDER = ['aftermath', 'midnight', 'chosen'];
        for (const tier of TIER_ORDER) {
            if (!charPool[tier]) continue;
            // The affection-scene must have been seen.
            const sceneSeen = lsGet('pp_aff_' + char + '_' + tier);
            if (sceneSeen !== '1') continue;
            // Milestone letter not yet sent.
            const ms = lsJSON('pp_letter_milestone_' + tier + '_' + char);
            if (ms) continue;
            // Breathing room: 3 minutes since the scene was seen. We don't
            // store the scene-seen timestamp, but the player's session
            // pacing means they're rarely back at idle within 3 minutes
            // of triggering a peak scene anyway. We approximate by
            // requiring the player to have done one care interaction
            // since (game.lastInteractionTime within last 5 min).
            return tier;
        }
        return null;
    }

    function buildMilestoneText(game, tier) {
        const char = (game && game.selectedCharacter) || 'alistair';
        const tpl = (MILESTONE_LETTERS[char] || {})[tier];
        if (!tpl) return null;
        const d = extractData(game);
        const paragraphs = typeof tpl.paragraphs === 'function'
            ? tpl.paragraphs(d).filter(p => p && p.trim())
            : (tpl.paragraphs || []);
        return {
            title: tpl.title || 'A Letter',
            signature: tpl.signature || '',
            paragraphs: paragraphs,
            data: d,
            tier: tier
        };
    }

    // ── First-letter trigger ────────────────────────────────────────────────
    function shouldFire(game) {
        if (!game || !game.selectedCharacter) return false;
        try {
            if (lsGet('pp_letter_seen_' + game.selectedCharacter)) return false;
        } catch (e) {}
        const totalInteractions = (game.timesFed || 0) + (game.timesWashed || 0)
            + (game.timesTalked || 0) + (game.timesGifted || 0) + (game.timesTrained || 0);
        const day = game.storyDay || 1;
        return day >= 3 && totalInteractions >= 8;
    }

    // ── Response-letter trigger ─────────────────────────────────────────────
    // After the player has REPLIED to the first letter AND affection >= 35,
    // the character writes back. Once per character.
    function shouldFireResponse(game) {
        if (!game || !game.selectedCharacter) return false;
        const char = game.selectedCharacter;
        const reply = getReply(char);
        if (!reply) return false;
        if (getResponseSeen(char)) return false;
        const aff = parseInt(lsGet('pp_affection_' + char) || '0', 10) || 0;
        if (aff < 35) return false;
        // Wait at least 5 minutes after the reply was written so it doesn't
        // fire instantly back-to-back.
        if (Date.now() - (reply.ts || 0) < 5 * 60 * 1000) return false;
        return true;
    }

    function check(game) {
        if (game && game.sceneActive) return false;
        if (shouldFire(game)) {
            setTimeout(() => present(game, 'first'), 400);
            return true;
        }
        if (shouldFireResponse(game)) {
            const reply = getReply(game.selectedCharacter);
            setTimeout(() => present(game, 'response', { char: game.selectedCharacter, tone: reply.tone }), 600);
            return true;
        }
        // Milestone follow-up letter — fires once after each peak scene
        // (currently 'midnight'; 'chosen' and 'aftermath' authored later).
        const milestoneTier = shouldFireMilestone(game);
        if (milestoneTier) {
            setTimeout(() => present(game, 'milestone', { char: game.selectedCharacter, tier: milestoneTier }), 800);
            return true;
        }
        return false;
    }

    // ── Manual trigger for testing + menu entry ─────────────────────────────
    function force(game) { if (game) present(game, 'first'); }

    // ── Archive API ─────────────────────────────────────────────────────────
    // List all letters that have been seen on this device.
    // Returns array of { char, kind: 'first' | 'response', title, seenAt, replied }
    const ALL_CHARS = ['alistair','elian','lyra','caspian','lucien','noir','proto'];
    function list() {
        const out = [];
        ALL_CHARS.forEach(c => {
            const first = lsJSON('pp_letter_seen_' + c);
            if (first) {
                const reply = getReply(c);
                out.push({
                    char: c,
                    kind: 'first',
                    title: first.title || 'A Letter',
                    seenAt: first.seenAt || 0,
                    replied: !!reply,
                    reply: reply || null
                });
            }
            const resp = lsJSON('pp_letter_response_seen_' + c);
            if (resp) {
                out.push({
                    char: c,
                    kind: 'response',
                    title: resp.title || 'A Reply',
                    seenAt: resp.seenAt || 0,
                    tone: resp.tone || 'steady'
                });
            }
            // Milestone letters — currently 'midnight' is authored, with
            // 'chosen' and 'aftermath' planned. The loop is forward-
            // compatible, so adding new tiers above is one-line: include
            // the tier in this list.
            ['chosen', 'midnight', 'aftermath'].forEach(tier => {
                const ms = lsJSON('pp_letter_milestone_' + tier + '_' + c);
                if (ms) {
                    out.push({
                        char: c,
                        kind: 'milestone',
                        tier: tier,
                        title: ms.title || 'A Letter',
                        seenAt: ms.seenAt || 0
                    });
                }
            });
        });
        out.sort((a, b) => b.seenAt - a.seenAt);
        return out;
    }

    // True when there is an unread letter waiting OR a reply is owed.
    function hasAttention() {
        // Reply owed: any character has a seen first letter but no reply.
        for (const c of ALL_CHARS) {
            if (lsJSON('pp_letter_seen_' + c) && !getReply(c)) return true;
        }
        return false;
    }

    // Reopen a stored letter from the archive (no state change, no reply).
    function showStored(char, kind) {
        const key = (kind === 'response') ? ('pp_letter_response_seen_' + char) : ('pp_letter_seen_' + char);
        const stored = lsJSON(key);
        if (!stored || !stored.paragraphs) return;
        present(
            { selectedCharacter: char },
            'replay',
            { char: char, replayContent: { title: stored.title, signature: stored.signature, paragraphs: stored.paragraphs } }
        );
    }

    // Expose globally — game.js polls check() once per tick; archive uses the rest.
    window.LetterSystem = {
        check: check,
        force: force,
        buildLetterText: buildLetterText,
        // Archive API
        list: list,
        hasAttention: hasAttention,
        showStored: showStored,
        getReply: getReply,
        getResponseSeen: getResponseSeen
    };
})();
