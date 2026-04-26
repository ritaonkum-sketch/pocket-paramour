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

        // Fallback used for proto, noir, and any future chars.
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
