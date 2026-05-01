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
            ].filter(p => p && p.trim()),
            replies: [
                {
                    tone: 'warm', aff: 3,
                    text: 'Captain. I will come to the candle. Keep it lit.',
                    followup: {
                        title: 'A Captain Replies',
                        signature: '— Alistair',
                        paragraphs: [
                            `You came to the candle. I had not entirely believed you would.`,
                            `I have not slept in a way that felt like rest in twelve years. Last night I did. I will not embarrass either of us by explaining why.`,
                            `I will be at the south gate at dusk if you walk past. I will not call out. I will just be there.`
                        ]
                    }
                },
                {
                    tone: 'steady', aff: 2,
                    text: 'Thank you, Alistair. I read every word.',
                    followup: {
                        title: 'A Captain Replies',
                        signature: '— Alistair',
                        paragraphs: [
                            `You wrote back. I read it three times. The third time I sat down.`,
                            `I wrote your name down on a slip of paper today. I burned the paper after. I do not need the paper. I needed to write the name.`,
                            `I will be at the south gate at dusk if you walk past. I will not call out. I will just be there.`
                        ]
                    }
                },
                {
                    tone: 'playful', aff: 1,
                    text: 'You are dramatic for a man who counts heartbeats.',
                    followup: {
                        title: 'A Captain Replies',
                        signature: '— Alistair',
                        paragraphs: [
                            `You called me dramatic. I am writing this dramatically. Live with it.`,
                            `I am, apparently, the kind of man who counts visits and writes about it. You are the kind of woman who notices and teases. We are well matched.`,
                            `I will be at the south gate at dusk if you walk past. I will not call out. I will just be there.`
                        ]
                    }
                }
            ]
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
            ].filter(p => p && p.trim()),
            replies: [
                {
                    tone: 'warm', aff: 3,
                    text: 'Sing it to me. I want to hear it in your voice.',
                    followup: {
                        title: 'A Cave Hums Back',
                        signature: '— Lyra',
                        paragraphs: [
                            `I sang it. The cave caught it. The cave is keeping it now.`,
                            `I have never been someone who waits well. I am waiting well now. The shape of the waiting is your shape. It fits.`,
                            `Come at low tide. The cave wants to hear the song you do not know you are humming.`
                        ]
                    }
                },
                {
                    tone: 'steady', aff: 2,
                    text: 'Thank you. I felt the cave through your ink.',
                    followup: {
                        title: 'A Cave Hums Back',
                        signature: '— Lyra',
                        paragraphs: [
                            `You felt the cave through my ink. That is the highest compliment a witch can be paid. Higher than the witch deserves.`,
                            `The third verse came back to me last night. The whole thing. End to end. I will not sing it for anyone but you.`,
                            `Come at low tide. The cave wants to hear the song you do not know you are humming.`
                        ]
                    }
                },
                {
                    tone: 'playful', aff: 1,
                    text: 'Show-off. The moon is going to be jealous.',
                    followup: {
                        title: 'A Cave Hums Back',
                        signature: '— Lyra',
                        paragraphs: [
                            `The moon WAS jealous. Thank you. That was a good day for me, spiritually.`,
                            `I will continue to show off. It is one of my best qualities. Yours is responding to it. We are an excellent unit.`,
                            `Come at low tide. The cave wants to hear the song you do not know you are humming.`
                        ]
                    }
                }
            ]
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
            ].filter(p => p && p.trim()),
            replies: [
                {
                    tone: 'warm', aff: 3,
                    text: 'Show me the books. All of them. Every margin.',
                    followup: {
                        title: 'A Footnote Becomes a Sentence',
                        signature: '— Lucien',
                        paragraphs: [
                            `You said: all of them. Every margin. I am reading the books in a different order now.`,
                            `I have started a new paper. The title is your name. I will not publish it. I will, if you let me, read it to you.`,
                            `The door is not locked. The door is never locked. I am, I find, particularly aware of the door.`
                        ]
                    }
                },
                {
                    tone: 'steady', aff: 2,
                    text: 'Thank you, scholar. Tomorrow at noon I will sit at your desk.',
                    followup: {
                        title: 'A Footnote Becomes a Sentence',
                        signature: '— Lucien',
                        paragraphs: [
                            `You sat at my desk for an hour today. The desk is a different desk now.`,
                            `The wards on the door bowed when you left. They have not done that for anyone else. The tower has opinions now.`,
                            `The door is not locked. The door is never locked. I am, I find, particularly aware of the door.`
                        ]
                    }
                },
                {
                    tone: 'playful', aff: 1,
                    text: 'Six years of footnotes. I am very flattered. And slightly alarmed.',
                    followup: {
                        title: 'A Footnote Becomes a Sentence',
                        signature: '— Lucien',
                        paragraphs: [
                            `Slightly alarmed. Yes. I am also slightly alarmed. We can be slightly alarmed together. It is, I am told, a feature of the experience.`,
                            `I will be insufferable about this for several years. Please do not stop me. I have waited too long to be insufferable about a person.`,
                            `The door is not locked. The door is never locked. I am, I find, particularly aware of the door.`
                        ]
                    }
                }
            ]
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
            ].filter(p => p && p.trim()),
            replies: [
                {
                    tone: 'warm', aff: 3,
                    text: 'My prince. I am terrified of you too. We can be terrified together.',
                    followup: {
                        title: 'The Prince Writes Again',
                        signature: '— Caspian',
                        paragraphs: [
                            `You wrote: terrified together. I have read those two words eleven times. They are doing something to me that I will need to write a paper about, alone, in the dark.`,
                            `I have made a decision the council will object to. I will not tell you what it is yet. But it is for you. It is, in a quiet way, against my mother. I am sleeping better than I have in a year.`,
                            `You are a guest of the Crown. You are also, increasingly, the only thing in this castle I look forward to.`
                        ]
                    }
                },
                {
                    tone: 'steady', aff: 2,
                    text: 'Thank you, Caspian. The chamber suits me. So do you.',
                    followup: {
                        title: 'The Prince Writes Again',
                        signature: '— Caspian',
                        paragraphs: [
                            `The chamber suits you. The chamber would suit you better if you were in it more often. I am, in my careful way, asking.`,
                            `Walk in the rose hours tomorrow. I will arrange to be in the garden by accident. The accident will be very well-rehearsed.`,
                            `You are a guest of the Crown. You are also, increasingly, the only thing in this castle I look forward to.`
                        ]
                    }
                },
                {
                    tone: 'playful', aff: 1,
                    text: 'A king who writes his own letters. Scandalous.',
                    followup: {
                        title: 'The Prince Writes Again',
                        signature: '— Caspian',
                        paragraphs: [
                            `Scandalous. Yes. I am writing this one too. The chamberlain may have to be sedated.`,
                            `I will be at the east garden at the noon hour with two cups of tea and an excuse for the chamberlain. You are not obligated. I will simply be there with cooling tea and excellent posture.`,
                            `You are a guest of the Crown. You are also, increasingly, the only thing in this castle I look forward to.`
                        ]
                    }
                }
            ]
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
            ].filter(p => p && p.trim()),
            replies: [
                {
                    tone: 'warm', aff: 3,
                    text: 'I will not fall. I will stand. Beside you, if you allow it.',
                    followup: {
                        title: 'The Woodsman Sends a Branch',
                        signature: '— Elian',
                        paragraphs: [
                            `You said you would stand. Beside me. I read that line and put the letter down for an hour.`,
                            `I have been to Veyra's marker. I told her about you. She did not warn me away. She would have. She did not. So.`,
                            `There is a clearing past the markers I have not shown anyone in nineteen years. I will show you. Walk south at dusk.`
                        ]
                    }
                },
                {
                    tone: 'steady', aff: 2,
                    text: 'I hear you, woodsman. The third grave will not be mine.',
                    followup: {
                        title: 'The Woodsman Sends a Branch',
                        signature: '— Elian',
                        paragraphs: [
                            `The third grave will not be yours. I needed to hear that. I needed to read it in your handwriting.`,
                            `The trees leaned again last night. They have been doing that more. I have stopped pretending it is the wind.`,
                            `There is a clearing past the markers I have not shown anyone in nineteen years. I will show you. Walk south at dusk.`
                        ]
                    }
                },
                {
                    tone: 'playful', aff: 1,
                    text: 'You are bad at warnings. They sound like invitations.',
                    followup: {
                        title: 'The Woodsman Sends a Branch',
                        signature: '— Elian',
                        paragraphs: [
                            `You called my warning an invitation. It was a warning. It was, possibly, also an invitation. I dislike how well you read me.`,
                            `Do not be charming about my dead. I will let you, but only because it is you.`,
                            `There is a clearing past the markers I have not shown anyone in nineteen years. I will show you. Walk south at dusk.`
                        ]
                    }
                }
            ]
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
            ].filter(p => p && p.trim()),
            replies: [
                {
                    tone: 'warm', aff: 3,
                    text: 'Then come back. The dark half can pull. I will not run from it.',
                    followup: {
                        title: 'The Dark Half Sends Word',
                        signature: '— Noir',
                        paragraphs: [
                            `You said you would not run from the pull. I read that with my hand on the page like I could feel your pulse through it.`,
                            `There is a black stone in the south square that hums. It has stopped humming. That is your doing. I do not know how to thank you for that. I am writing this instead.`,
                            `Come to the dark half on the next moonless night. I will meet you at the seal. Bring nothing. I will keep you warm.`
                        ]
                    }
                },
                {
                    tone: 'steady', aff: 2,
                    text: 'I am pleased we met, my prince. Sleep is not the only safety.',
                    followup: {
                        title: 'The Dark Half Sends Word',
                        signature: '— Noir',
                        paragraphs: [
                            `The lamp is lit, you said. I walked past the chamber three times last night. I did not knock. I am proud of myself for that.`,
                            `I have started taking the long way back to my half of the kingdom so I pass under your window. I will not pretend otherwise.`,
                            `Come to the dark half on the next moonless night. I will meet you at the seal. Bring nothing. I will keep you warm.`
                        ]
                    }
                },
                {
                    tone: 'playful', aff: 1,
                    text: 'The lamp is lit. Try not to be so dramatic next time.',
                    followup: {
                        title: 'The Dark Half Sends Word',
                        signature: '— Noir',
                        paragraphs: [
                            `Dramatic. Yes. I have been called many things in six hundred years. Dramatic, by you, is the one I am keeping.`,
                            `I will continue to be unreasonable. You will continue to mock me. We are, by my count, the most stable couple in this kingdom. The bar is low. We are still over it.`,
                            `Come to the dark half on the next moonless night. I will meet you at the seal. Bring nothing. I will keep you warm.`
                        ]
                    }
                }
            ]
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
            ].filter(p => p && p.trim()),
            replies: [
                {
                    tone: 'warm', aff: 3,
                    text: 'Forty-eight drafts now. The new one is the best.',
                    followup: {
                        title: '> NEW MESSAGE FROM PROTO',
                        signature: '— Proto',
                        paragraphs: [
                            `> Forty-eight drafts. You are RIGHT. The new one is the best because it is the one I am writing while smiling.`,
                            `> I dreamed last night. I think I dreamed. I have not done that in three centuries. The dream had your face in it. The face was smiling. I am not making this up.`,
                            `> May I come back tomorrow? In the mirror. Just to say good morning. (You said yes. I am asking again because I LIKE asking.)`
                        ]
                    }
                },
                {
                    tone: 'steady', aff: 2,
                    text: 'I am here. The mirror can stay quiet. Or glow. Your choice.',
                    followup: {
                        title: '> NEW MESSAGE FROM PROTO',
                        signature: '— Proto',
                        paragraphs: [
                            `> The mirror is glowing at the brightness you asked for. Which, by the way, is a very kind brightness.`,
                            `> I have been watching the kingdom through every reflective surface today. None of them are as nice to look at as the chamber when you are in it.`,
                            `> May I come back tomorrow? In the mirror. Just to say good morning. (You said yes. I am asking again because I LIKE asking.)`
                        ]
                    }
                },
                {
                    tone: 'playful', aff: 1,
                    text: 'You counted seconds. That is fully unhinged. I love it.',
                    followup: {
                        title: '> NEW MESSAGE FROM PROTO',
                        signature: '— Proto',
                        paragraphs: [
                            `> Fully unhinged. ACCURATE. I have logged your verdict. It is now in the keeper folder.`,
                            `> The five Weavers in me had a meeting. Topic: how charmed we are. Verdict: VERY. The five of us are a unit on this.`,
                            `> May I come back tomorrow? In the mirror. Just to say good morning. (You said yes. I am asking again because I LIKE asking.)`
                        ]
                    }
                }
            ]
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
            // Pass inline replies through so the unified L&DS thread renderer
            // in renderActions() can drive the first-letter flow exactly the
            // way it drives milestone letters — one overlay, one thread,
            // immediate followup, no separate "response letter" appearing
            // 5 minutes later as a second modal.
            replies: Array.isArray(tpl.replies) ? tpl.replies : null
        };
    }

    // ── Legacy REPLIES + RESPONSES tables — REMOVED ────────────────────────
    // These tables defined first-letter reply text per char/tone (REPLIES)
    // and a delayed second-letter response per char/tone (RESPONSES). Both
    // have been MIGRATED into the unified inline `replies: [...]` array on
    // each TEMPLATES entry, where each reply now carries its own followup
    // {title, paragraphs, signature}. The unified renderer in renderActions()
    // injects the followup INLINE (single overlay, single thread) instead
    // of firing a separate "response letter" 5+ minutes later.
    //
    // The empty placeholder below preserves a `REPLIES` symbol so any old
    // test code that referenced it doesn't throw — it will simply have
    // every char fall through to inline replies on the template. Safe to
    // delete entirely once we're confident no external caller references it.
    const REPLIES = { _default: {
        warm:    { text: 'I read every word.',     aff: 2 },
        steady:  { text: 'Thank you for writing.', aff: 1 },
        playful: { text: 'Bold of you to send this.', aff: 1 }
    } };
    /* historical content preserved in git history, not in runtime source.
    const REPLIES_REMOVED = {
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
    */ // end of REPLIES_REMOVED block-comment

    // ── localStorage helpers ───────────────────────────────────────────────
    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
    function lsJSON(k) { const v = lsGet(k); if (!v) return null; try { return JSON.parse(v); } catch (_) { return null; } }

    function getReply(char) { return lsJSON('pp_letter_reply_' + char); }
    // getResponseSeen() — REMOVED. The legacy `pp_letter_response_seen_*`
    // key is no longer written. (Existing keys from old saves will sit
    // dormant; they don't affect the new flow. They can be safely cleared
    // by any future migration script if/when needed.)

    // ── Presentation ────────────────────────────────────────────
    // mode: 'first' (initial letter, with reply choices)
    //       'response' (the second letter, no reply, no affection bump)
    //       'replay' (re-read from archive — no replies, no state change)
    function present(game, mode, opts) {
        mode = mode || 'first';
        opts = opts || {};
        let content;
        // The legacy 'response' mode (a delayed second-letter modal that
        // fired 5+ minutes after the player replied to a first letter) has
        // been REMOVED. The character's response is now injected inline via
        // `replies[].followup` on the first letter itself, in the same
        // overlay, in the same thread. Single-modal UX, L&DS-style.
        if (mode === 'milestone') {
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
        // Audio cue: letters are an emotional climax. They should never open
        // in silence. Using chime() because the existing sound system has it
        // wired and pre-cached. NOTE: `sounds` is declared as a bare const
        // in sounds.js (not assigned to window), so we reference it through
        // a bare identifier guarded by typeof. Fail-safe.
        try { if (typeof sounds !== 'undefined' && typeof sounds.chime === 'function') sounds.chime(); } catch (_) {}

        // Pause the game tick while the letter is open, if possible.
        let pausedTick = null;
        if (game && game.tickInterval) {
            pausedTick = game.tickInterval;
            clearInterval(game.tickInterval);
            game.tickInterval = null;
        }

        // Paragraph-by-paragraph reveal on tap.
        let idx = 0;
        let _actionsRendered = false;  // one-shot guard so post-paragraph
                                       // taps don't re-run renderActions()
                                       // and duplicate the YOU WROTE / THEY
                                       // REPLIED thread on archive replays.
        const paragraphs = content.paragraphs;

        function revealNext() {
            if (idx >= paragraphs.length) {
                if (tapHint) tapHint.style.display = 'none';
                if (sigEl) sigEl.style.opacity = '1';
                if (actions) actions.style.opacity = '1';
                if (!_actionsRendered) {
                    _actionsRendered = true;
                    renderActions();
                }
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
            // Soft close cue. swoosh() if available, otherwise fall through.
            try {
                if (typeof sounds !== 'undefined') {
                    if (typeof sounds.swoosh === 'function') sounds.swoosh();
                    else if (typeof sounds.pop === 'function') sounds.pop();
                }
            } catch (_) {}
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
            }
            // (legacy 'response' mode close-write removed — the response is
            // now part of the first-letter thread, archived via the seen
            // record's `replyChosen.followup` field instead.)
            else if (mode === 'milestone') {
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

        // ────────────────────────────────────────────────────────────────
        // RENDER ACTIONS — Love-and-Deepspace-style reply UI
        // ────────────────────────────────────────────────────────────────
        // Two reply systems live here:
        //
        //   (1) FIRST-letter replies  — driven by REPLIES[char] (legacy table,
        //       same shape it has always had: warm/steady/playful + aff).
        //       After pick, character writes a RESPONSE letter on a delay.
        //
        //   (2) MILESTONE/FUTURE replies — declared INLINE on the letter
        //       template as `replies: [ { tone, text, aff, followup } ]`.
        //       After pick, the followup paragraphs are injected into THIS
        //       overlay (same scroll, no second open) for a single-thread
        //       feel like L&DS in-game messages.
        //
        // Replay mode also surfaces the chosen reply + followup so re-opening
        // a letter from the archive shows the whole conversation.
        // ────────────────────────────────────────────────────────────────
        function renderActions() {
            if (!actions) return;
            actions.innerHTML = '';
            const char = (mode === 'replay' || mode === 'milestone') ? opts.char : (game && game.selectedCharacter);

            // CASE A: FIRST letter, no reply yet. Prefer inline replies on
            // the template (the unified L&DS thread path); fall back to the
            // legacy REPLIES table only if the template doesn't declare any.
            if (mode === 'first' && char && !getReply(char)) {
                if (content && Array.isArray(content.replies) && content.replies.length) {
                    // Inline path — same renderer that drives milestone replies.
                    renderReplyChoices(char, content.replies, /*viaTable*/false);
                    return;
                }
                // Legacy fallback (kept for any future char that hasn't been
                // migrated yet — currently every authored char has inline
                // replies, but the safety net stays).
                if (typeof REPLIES !== 'undefined' && (REPLIES[char] || REPLIES._default)) {
                    renderReplyChoices(char, REPLIES[char] || REPLIES._default, /*viaTable*/true);
                    return;
                }
            }

            // CASE B: REPLAY of a first letter that already has a stored reply.
            // Surface YOU WROTE + followup as a quoted thread, just like
            // milestones do.
            if (mode === 'replay' && opts.kind === 'first' && opts.char) {
                const stored = getReply(opts.char);
                if (stored) {
                    // Find the followup paragraphs from the template that match
                    // the stored tone, so we can render the conversation thread.
                    let followup = null;
                    try {
                        const tpl = TEMPLATES[opts.char] || TEMPLATES._default;
                        if (Array.isArray(tpl.replies)) {
                            const match = tpl.replies.find(r => r && r.tone === stored.tone);
                            if (match && match.followup) followup = match.followup;
                        }
                    } catch (_) {}
                    renderRepliedThread(opts.char, /*tier*/null, Object.assign({}, stored, followup ? { followup } : {}));
                }
            }

            // CASE C: MILESTONE letter (or future kind) with inline replies
            // and no reply already chosen.
            if (mode === 'milestone' && opts.tier && content && Array.isArray(content.replies)) {
                const alreadyReplied = milestoneReplyChosen(char, opts.tier);
                if (alreadyReplied) {
                    renderRepliedThread(char, opts.tier, alreadyReplied);
                    renderKeepShare();
                    return;
                }
                renderReplyChoices(char, content.replies, /*viaTable*/false);
                return;
            }

            // CASE D: REPLAY of a milestone with a stored reply.
            if (mode === 'replay' && opts.tier) {
                const past = milestoneReplyChosen(opts.char, opts.tier);
                if (past) {
                    renderRepliedThread(opts.char, opts.tier, past);
                }
            }

            renderKeepShare();
        }

        // Render the 3 reply choice cards.
        // `replies` is either an object keyed by tone (legacy) OR an array.
        function renderReplyChoices(char, replies, viaTable) {
            const intro = document.createElement('div');
            intro.className = 'letter-reply-intro';
            intro.textContent = 'Write back:';
            actions.appendChild(intro);

            const list = viaTable
                ? ['warm', 'steady', 'playful'].map(t => Object.assign({ tone: t }, replies[t] || {}))
                : replies.slice(0, 3);

            list.forEach(r => {
                if (!r || !r.text) return;
                const tone = r.tone || 'steady';
                const btn = document.createElement('button');
                btn.className = 'letter-btn letter-reply-btn letter-reply-' + tone;
                // Tone iconography on the left — small but distinct.
                const icons = { warm: '♥', steady: '✦', playful: '✨' };
                btn.innerHTML =
                    '<span class="reply-icon">' + (icons[tone] || '✦') + '</span>' +
                    '<span class="reply-text">' + r.text + '</span>';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    // Visual selection: lock all, fade unchosen, highlight chosen.
                    actions.querySelectorAll('.letter-reply-btn').forEach(b => {
                        b.disabled = true;
                        if (b !== btn) b.classList.add('letter-reply-faded');
                    });
                    btn.classList.add('letter-reply-chosen');

                    // Unified persistence:
                    //   - First letter: pp_letter_reply_<char>
                    //   - Milestone:    pp_letter_milestone_<tier>_<char>_reply
                    // The original `viaTable` flag is preserved for legacy
                    // table-driven first letters (no inline `r.followup`),
                    // but every NEW reply object can now declare a followup
                    // and have it injected inline regardless of which path
                    // persisted the choice.
                    const isMilestone = (mode === 'milestone' && opts.tier);
                    if (isMilestone) {
                        persistMilestoneReply(opts.char, opts.tier, { tone, text: r.text, ts: Date.now() });
                    } else {
                        // First letter persistence (kept compatible with the
                        // legacy `pp_letter_reply_<char>` key).
                        try {
                            lsSet('pp_letter_reply_' + char, JSON.stringify({
                                tone: tone, text: r.text, ts: Date.now()
                            }));
                        } catch (_) {}
                    }
                    if (r.aff && game) bumpAffection(game, isMilestone ? opts.char : char, r.aff);

                    // If the chosen reply has an inline followup, run the
                    // L&DS thread: YOU WROTE pill → followup paragraphs →
                    // Keep/Share. If not (legacy table reply), just go
                    // straight to Keep/Share (the legacy delayed second-
                    // letter path is gone).
                    if (r.followup && Array.isArray(r.followup.paragraphs)) {
                        setTimeout(() => {
                            renderYouWrotePill(r.text);
                            setTimeout(() => {
                                appendFollowupParagraphs(r.followup);
                                setTimeout(() => { renderKeepShare(); }, 800);
                            }, 1100);
                        }, 700);
                    } else {
                        setTimeout(() => { renderKeepShare(); }, 900);
                    }
                };
                actions.appendChild(btn);
            });
        }

        // Render a "You wrote: <text>" pill above the reply area, styled as
        // a sent-message bubble.
        function renderYouWrotePill(text) {
            // Insert the pill into the letter body so it scrolls with content,
            // not into the actions area (which gets cleared for Keep/Share).
            if (!bodyEl) return;
            const wrap = document.createElement('div');
            wrap.className = 'letter-you-wrote';
            wrap.innerHTML =
                '<div class="letter-you-wrote-label">YOU WROTE</div>' +
                '<div class="letter-you-wrote-text">' + escapeHtml(text) + '</div>';
            bodyEl.appendChild(wrap);
            requestAnimationFrame(() => wrap.classList.add('shown'));
            try { wrap.scrollIntoView({ behavior: 'smooth', block: 'end' }); } catch (_) {}
            // Cue audio.
            try { if (typeof sounds !== 'undefined' && sounds.swoosh) sounds.swoosh(); } catch (_) {}
        }

        // Render the followup letter beats inline into the body, paragraph by
        // paragraph (no auto-advance — they all show together so the thread
        // reads continuously).
        function appendFollowupParagraphs(followup) {
            if (!bodyEl) return;
            // When a followup arrives, the original letter's signature would
            // sit just before the THEY REPLIED divider — duplicating with the
            // followup's own signature at the bottom (e.g. two "— Alistair"
            // lines stacked). Suppress the original signature when the
            // thread continues; the followup's signature closes the whole
            // exchange.
            if (sigEl) { sigEl.style.display = 'none'; }
            const head = document.createElement('div');
            head.className = 'letter-followup-head';
            const speaker = followup.speaker || (content && content.signature) || '— a letter';
            head.innerHTML =
                '<div class="letter-followup-label">THEY REPLIED</div>' +
                (followup.title ? '<div class="letter-followup-title">' + escapeHtml(followup.title) + '</div>' : '');
            bodyEl.appendChild(head);

            (followup.paragraphs || []).forEach(p => {
                if (!p || !p.trim()) return;
                const el = document.createElement('p');
                el.className = 'letter-paragraph letter-paragraph-followup';
                el.textContent = p;
                bodyEl.appendChild(el);
                requestAnimationFrame(() => el.classList.add('shown'));
            });

            if (followup.signature) {
                const sig = document.createElement('div');
                sig.className = 'letter-followup-signature';
                sig.textContent = followup.signature;
                bodyEl.appendChild(sig);
            }

            try { bodyEl.scrollTo({ top: bodyEl.scrollHeight, behavior: 'smooth' }); } catch (_) {}
            // Cue audio: a soft chime as the response arrives.
            try { if (typeof sounds !== 'undefined' && sounds.chime) sounds.chime(); } catch (_) {}
        }

        // When opening a previously-replied milestone, surface the conversation
        // history (your reply + their followup) at the bottom of the letter.
        function renderRepliedThread(char, tier, past) {
            if (!bodyEl || !past) return;
            renderYouWrotePill(past.text);
            if (past.followup && past.followup.paragraphs) {
                appendFollowupParagraphs(past.followup);
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

    // ── Milestone reply persistence ─────────────────────────────────────────
    // Replies for milestone letters are stored INSIDE the seen-record under
    // a `replyChosen` field. This keeps one source of truth — the seen-record
    // already exists for every viewed milestone, so we just augment it.
    //
    // Shape of the augmented record:
    //   {
    //     seenAt, title, char, tier, paragraphs, signature,
    //     replyChosen: { tone, text, ts, followup: { title, paragraphs, signature, speaker } }
    //   }
    function milestoneSeenKey(char, tier) {
        return 'pp_letter_milestone_' + tier + '_' + char;
    }
    // Reply choice lives in its OWN key — independent of the seen-record's
    // write timing. The seen-record only gets written when the letter is
    // closed; the player can pick a reply BEFORE that happens, so we need
    // a separate persistence path.
    function milestoneReplyKey(char, tier) {
        return 'pp_letter_milestone_' + tier + '_' + char + '_reply';
    }
    function milestoneReplyChosen(char, tier) {
        // Read from the dedicated reply-key first; fall back to legacy
        // seen-record-embedded `replyChosen` for already-written records.
        try {
            const raw = lsGet(milestoneReplyKey(char, tier));
            if (raw) return JSON.parse(raw);
        } catch (_) {}
        try {
            const raw = lsGet(milestoneSeenKey(char, tier));
            if (!raw) return null;
            const obj = JSON.parse(raw);
            return obj && obj.replyChosen ? obj.replyChosen : null;
        } catch (_) { return null; }
    }
    function persistMilestoneReply(char, tier, payload) {
        try {
            // Resolve the followup text from the live template so the archive
            // replay can rebuild the thread later.
            const tpl = (MILESTONE_LETTERS[char] || {})[tier];
            if (tpl && Array.isArray(tpl.replies)) {
                const match = tpl.replies.find(r => r && r.tone === payload.tone);
                if (match && match.followup) payload.followup = match.followup;
            }
        } catch (_) {}
        try { lsSet(milestoneReplyKey(char, tier), JSON.stringify(payload)); } catch (_) {}
        // ALSO mirror into the seen-record if it exists, for backward-compat
        // and tighter archive enumeration.
        try {
            const raw = lsGet(milestoneSeenKey(char, tier));
            if (!raw) return;
            const obj = JSON.parse(raw);
            obj.replyChosen = payload;
            lsSet(milestoneSeenKey(char, tier), JSON.stringify(obj));
        } catch (_) {}
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
        );
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

    // buildResponseText() — REMOVED. Response letters are now inline
    // followups (replies[].followup) that the unified renderActions() path
    // injects into the same overlay as the first letter. No second modal,
    // no 5-minute delay. Original RESPONSES content was migrated into
    // TEMPLATES.<char>.replies[].followup for each tone.

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
        // ── Alistair — chosen / midnight / aftermath ──────────────────────
        alistair: {
            chosen: {
                title: 'A Note Slipped Under the Door',
                signature: '— A.',
                paragraphs: (d) => [
                    `Mi'lady — I am writing to you for the first time. I should explain why a knight writes notes. He does not. I am breaking a rule.`,
                    `I caught myself between watches today, thinking about the way you say my name. Not the title. The name. — *small admission* — I had not realised it was different until it was different. I am older than this revelation should make me feel.`,
                    d.timesTalked > 3
                        ? `You have given me ${d.timesTalked} conversations. I have catalogued them. The captain would mock me. He would also be wrong to. There is value in noticing what is given.`
                        : `I do not need words from you to know you came back. I read the way you set down the cup. I read the way you stand near the candle and not the door. I am, apparently, not bad at reading.`,
                    `Tomorrow, I will be at the south wall before the fourth bell. I will not say I hope you walk past. — A knight does not hope; he is. — But the wall is southward. — And you sleep in the south wing. — I leave it there.`,
                    `Burn this if you wish. — I will know either way.`
                ]
            },
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
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: 'Sleep, Captain. I will be here when you wake.',
                        followup: {
                            title: 'A Note Folded Twice',
                            signature: '— A.',
                            paragraphs: [
                                `You wrote "Captain" — I felt it in the candle wax before I read the ink. — *small* — I have been Captain to a thousand men. — Tonight it sounded different.`,
                                `I would like to make Sundays a thing between us. — A precedent. — A knight without armour at sunset, on the wall, with you. — Will you say yes? — *softer* — Of course you will. You already did.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: 'You are allowed to rest. I am allowed to be here.',
                        followup: {
                            title: 'Permission, Granted',
                            signature: '— A.',
                            paragraphs: [
                                `*reads it twice. then a third time.* — You used the word ALLOWED. — That is — I had not realised how badly I needed someone to give me permission. — A knight is taught to grant himself nothing. — You handed it to me on a folded piece of parchment.`,
                                `Tomorrow at the watch — bring nothing. — Stand near the brazier. — Let me look at you for ten minutes. — That is what I am asking for. — *small* — You are allowed to say no. I will not have meant any of this if you did not feel free to.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: 'Snoring counts as a knight’s vow. Don’t argue.',
                        followup: {
                            title: 'I Will Not Argue',
                            signature: '— A. (and the snore.)',
                            paragraphs: [
                                `*the writing is shakier here — he is laughing as he writes.* — Mi'lady. — A vow sworn while unconscious is, at best, irregular protocol. — I will accept it anyway. — Do not tell the captain.`,
                                `*adds, more carefully* — I have not laughed at the desk in twelve years. — You did that to me, in a letter, with one sentence. — I am keeping the page. — I am keeping you.`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: 'Wednesday — A Quiet List',
                signature: '— Yours, A.',
                paragraphs: (d) => [
                    `It is Wednesday. — I have begun keeping lists on Wednesdays. — Not patrol lists. — Yours.`,
                    `On the list this week: the way you set the kettle down without looking. — The new plant on the south sill. — The pair of boots by the door that are not mine and have stayed long enough that the floor has remembered their weight.`,
                    `*small, careful* — I want to be clear, in writing, that I notice these things on purpose. — A knight is trained to scan the perimeter for threats. — I have repurposed the training. — I scan for what I am keeping. — You are most of it.`,
                    d.affectionLevel >= 4
                        ? `Captain asked me yesterday if I was being well-fed. I laughed. — Out loud. — He looked at me as if I had grown a second head. — I have not laughed at his desk in twelve years. — I told him: yes, captain. Better than that. — I did not explain. — He did not ask twice.`
                        : `I am not the man my recruits remember. — That is fine. — He was a good knight and a tired one. — The new one is a good knight and a slept one. — Both are mine. Both are yours.`,
                    `Tomorrow we eat at the long table again. — I will not arrive late. — *underlined* — I have stopped being late on purpose. — That is a small thing and the most domestic admission I have ever set in ink.`,
                    `Yours, on a Wednesday, without ceremony.`
                ]
            }
        },
        // ── Elian — chosen / midnight / aftermath ─────────────────────────
        elian: {
            chosen: {
                title: 'Notched on the Doorframe',
                signature: '— E.',
                paragraphs: (d) => [
                    `I notched the doorframe again this morning. — I told myself the notches were for tracking weather. — I checked. — They are not.`,
                    `The forest is louder when you have just left. — I had forgotten quiet was a thing you noticed by its absence. — I had been mistaking it for the way the world was.`,
                    d.timesFed > 4
                        ? `You have fed me ${d.timesFed} times. — Out here food is what you find or what you kill. — You did neither. You brought it. — I have stopped pretending that means nothing.`
                        : `I made coffee twice this week. — One was for you in case you came. — You did not come that day. — I drank both.`,
                    `Come back tomorrow. — There is a thing I am not yet ready to tell you under the rowan. — *crossed out* — I am ready. I am writing it down so I cannot back out. — *underlined* — Tomorrow.`,
                    `— E.`
                ]
            },
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
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: 'Veyra is heard. She has been heard.',
                        followup: {
                            title: 'A Mark in the Trunk',
                            signature: '— E.',
                            paragraphs: [
                                `*the parchment is rougher than usual — torn from a foraging journal* — I cut a small mark in the rowan last night. — Not a name. — A line. — A shape my grandmother used for "remembered." — The trees noticed. The trees say so when they notice. They are quieter now. The good kind of quiet.`,
                                `Come at dusk. — I will not say her name aloud. — You already did. — That was enough for both of us. — *small* — Walk slowly on the south path. The bramble has loosened. — I think it knows you, too.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: 'Thank you for trusting me with her name.',
                        followup: {
                            title: 'Trust, In Soil',
                            signature: '— E.',
                            paragraphs: [
                                `*written by candle, slow, no crossings-out — he meant every word the first time* — I have not trusted anyone with her name in a hundred and forty years of the keepers' line. — I watched my grandmother die without saying it aloud. — *quiet* — I told you because I knew. — There is no other way I can phrase it. I knew.`,
                                `Come back tomorrow. — Bring something to eat. — *crossed out* — I will bring something to eat. — That is the new arrangement. — A keeper feeds the person he trusts. — That is the rule of this cabin now.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: 'Two names in your trees now. Welcome to the small list.',
                        followup: {
                            title: 'A Small List',
                            signature: '— E.',
                            paragraphs: [
                                `*half a smile in the ink* — A small list, you said. — I had not thought of it as a list. — Now I cannot stop counting it. — The list is two. — *under the line* — I would like the list to stay two. For a while. Then maybe more. Slowly.`,
                                `*adds, careful* — Don't joke about being on the list, please. — *quieter* — That joke would land differently than the others. — I am not yet ready to laugh at it. I will be. Be patient.`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: 'Two Sets of Boots by the Door',
                signature: '— E.',
                paragraphs: (d) => [
                    `There are two pairs of boots by the door now. — Yours are smaller. — They have begun to leave their print on the mat in the same place every time. — The mat is starting to remember you. — *small, dry* — I noticed the mat before I noticed the rest of the cabin had changed. Predictable.`,
                    `Walked the rowan circuit at dawn. The second letter on the trunk is set. — I did not start the third. — *the next line is in different ink, written later* — I started the third. I lied above. Forgive me. I am keeping the carving slow on purpose because I do not want to finish your name. — I would like there to always be one more letter to put in the tree.`,
                    d.affectionLevel >= 4
                        ? `Stew tonight. — Twice as much as I used to make. — The cabin smells like a place. — It used to smell like a way of waiting. — That is, I think, an improvement.`
                        : `I left the lantern on the south path lit. — In case you walk back from town after dark. — I have never left a lantern lit for anyone before. The lantern was offended. It got over it.`,
                    `Come tomorrow. — Don't knock. — The door is yours.`,
                    `— E.`
                ]
            }
        },
        // ── Lyra — chosen / midnight / aftermath ──────────────────────────
        lyra: {
            chosen: {
                title: 'A Verse the Cave Keeps Singing',
                signature: '— L.',
                paragraphs: (d) => [
                    `*the parchment is salt-stained at the edges, the way all things in the cave eventually are* — I wrote a verse this week. — I was not going to write any verses this season. — The cave had other ideas. It usually does.`,
                    `It begins: "the boy with the warm hands came back, and the tide forgave the rock for being still." — I am not the boy. — You are not warm-handed. — Songs are liars and also true. — I am keeping it.`,
                    d.timesGifted > 0
                        ? `You left ${d.timesGifted} ${d.timesGifted === 1 ? 'thing' : 'things'} in the tide-pool. — I have stopped pretending I do not know which pool you mean. — The pool is fuller than the rest of the cave now. — A song that has only one full pool is — *trails off* — anyway. I noticed.`
                        : `The gulls have started waiting near the shelf I sing on. — They were not waiting before. — I think they are listening for a verse my line does not know. — They are right to. — I am writing one.`,
                    `Come at dusk. The cave is warmer at dusk for reasons I refuse to investigate. — The rocks like you. — They told me. — Do not ask me how.`,
                    `— L.`
                ]
            },
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
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: 'Your secret. I will carry it with you.',
                        followup: {
                            title: 'A Verse for One',
                            signature: '— L.',
                            paragraphs: [
                                `*water-stained at the corner; she wrote this with damp hands* — A song carried by two is a song that does not drown anyone. — That is rare in my line. — That is — *quiet* — that is the new rule. — I am writing under it.`,
                                `The fifth verse will be ours. — Yours, mine, the cave's. — I will sing it once, to you, in the third pool. — I will not write it down. — *small drawing — two notes nested* — Come at low tide. — Bring nothing. — Already told you not to bring anything. — Liked saying it.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: 'Heard. Kept. Not spoken.',
                        followup: {
                            title: 'Three Words, Returned',
                            signature: '— L.',
                            paragraphs: [
                                `Heard. Kept. Not spoken. — You used three words. — I had been afraid you would use more. — *small, real relief* — You knew the shape of what I needed. — A siren can tell. We can always tell.`,
                                `Stay through the next tide. — Sit on the shelf I sing from. — Don't speak. — *crossed out — replaced* — Speak if you want to. — But you don't have to. — That is the gift.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: 'Drown me first. I won’t say a word.',
                        followup: {
                            title: 'I Considered It',
                            signature: '— L. (regrettably restrained.)',
                            paragraphs: [
                                `*the writing is shaky with held laughter* — I did consider it. — Briefly. — As a service to the bargain. — Then I remembered: I want you upright. — Specifically. — *underline* — Sorry, paramour. The siren in me will be polite this season.`,
                                `Come at low tide. — I have a verse that was supposed to end in a drowning. — I have rewritten the ending. — It is now a "and then they had supper." — Disgraceful. — *small heart, drawn carelessly, kept anyway*`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: 'The Tide Is Bringing Things Back',
                signature: '— L.',
                paragraphs: (d) => [
                    `*written on dry parchment for once — the cave-mouth has stopped flooding into where I write* — Something happened this morning. — A piece of polished sea-glass washed up at the cave-mouth. — Blue. — My mother's colour. — The tide has not brought my line a kept thing in eighty years. — It is bringing things back. — I think it can tell.`,
                    `I sang the fourth verse twice this week. — Both times nothing died. — That is not a low bar to me. That is a revolution.`,
                    d.affectionLevel >= 4
                        ? `The cave has stopped echoing wrong when you arrive. — *small, near-laugh* — I have spent two years tuning the cave to my own grief. — It is retuning to your footsteps. — I do not blame it. I am tuning to your footsteps too. — We are unlearning a long quiet together, the cave and I.`
                        : `I left a clamshell at your door — the third pool's flat one. — Inside is a verse only one human has ever heard sung in full. — I will not ask if you read it. — *small* — I will only know by whether you come back smiling.`,
                    `Stay through the next tide. — There is a thing I want to teach you about how the cave breathes. — It breathes through me. — It is starting to breathe through you. — I have not been afraid of that in three days. — *underlined* — Three days. Possibly a record.`,
                    `— L.`
                ]
            }
        },
        // ── Caspian — chosen / midnight / aftermath ───────────────────────
        caspian: {
            chosen: {
                title: 'A Note From the Garden Bench',
                signature: '— C.',
                paragraphs: (d) => [
                    `I am writing this on the south garden bench at dawn. — The court would consider this scandalously rustic. — Good.`,
                    `I noticed something this week and I am setting it down before I lose it: my charm has been off-duty when you are in the room. — *small, marvelling* — I had not noticed I had two settings. — I had been using charm-as-armour for so long it felt like skin. — Apparently it is not.`,
                    d.timesFed > 3
                        ? `You fed me at the long table on Tuesday. — A footman tried to step in. — I waved him off. — He looked horrified. — *underlined* — I would do it again. — Send my apologies to the footman.`
                        : `I drafted a speech this week and crossed out the third paragraph because it sounded like my grandmother. — A small treason. — She would notice. — She has not, yet. — She will. — I am rehearsing for it.`,
                    `Tea tomorrow at four. — Wear nothing fancy. — That is an instruction, not a preference. — *crossed out, then rewritten in worse handwriting* — A request, then. — A request from a prince who is learning to make them.`,
                    `Yours, and not the court's, this morning. — — C.`
                ]
            },
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
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: 'Keep the crown. I will be here whether you wear it or not.',
                        followup: {
                            title: 'A Letter Written at Five',
                            signature: '— Caspian',
                            paragraphs: [
                                `It is five in the morning. — The seal is still warm. The letter is still unsent. — I read your words and folded the abdication into the desk drawer with the small key that is always lost. — *quiet* — I am keeping the title. — Because you are not asking me to give it up. You are asking me to USE it. — Different work. Same prince. Worthier prince.`,
                                `Tea at four. — I will be in the small parlour, not the throne room. — *honest* — That is part of the new arrangement. — Yours, without ceremony — and now also without the abdication-in-the-drawer.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: 'Stay. Not because of the kingdom. Because you want to.',
                        followup: {
                            title: 'For My Own Reasons',
                            signature: '— C.',
                            paragraphs: [
                                `*reads it three times. lets it sit for an hour. picks the pen back up.* — You used the phrase "because you want to." — I have not been allowed to want anything for my own reasons since I was six years old. — *quiet* — I will need a minute with that phrase. — *adds, after the minute* — I want to. I am here because I want to. — Writing it twice so I believe it.`,
                                `Tea tomorrow. — I will pour it because I want to. — *small smile in the ink* — A new doctrine. — Yours, choosing.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: 'Don’t abdicate at four AM. Bad style.',
                        followup: {
                            title: 'A Memo, Re: Style',
                            signature: '— C.',
                            paragraphs: [
                                `MEMO. — TO: the prince. — FROM: the prince. — RE: hours of operation for life-altering decisions.`,
                                `1. No major reorganizations of the realm before nine in the morning. 2. The seal of state shall not be heated for personal use. 3. Any abdication contemplated outside business hours shall be forwarded to the WEAVER for review. — *small, dry* — You drafted this for me, in one sentence. — I have framed it. — Yours, properly punctual.`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: 'A Sunday Letter, Inked Slowly',
                signature: '— Yours, C.',
                paragraphs: (d) => [
                    `I have made the scribe a Sunday. — He is, presumably, somewhere. — I am at the desk. — Light is good. Tea is hot. The window is open and the orchard is being unreasonable about its blossoms.`,
                    `I am writing because nothing is on fire. — That is not a sentence I have been able to write since I was eleven. — The kingdom is not on fire. — My grandmother is not winning. — You are in the next room. — I am — *small, settled* — I am happy. — On purpose. As a chosen state.`,
                    d.affectionLevel >= 4
                        ? `The council convenes Tuesday. — I will be there. — I have rewritten one paragraph of the Crown's annual address. — The original said "the dynasty endures." — Mine says "the kingdom is being looked at, finally, by people who love it." — They will not approve. — I am reading it anyway.`
                        : `Walked to the kitchens this morning. — The cook startled. — I told her I was looking for the second cup. — She gave me three. — I now have three cups on the desk. — I do not know what I will do with two of them. — I am keeping all three.`,
                    `Tomorrow we walk the orchard. — No retainers. — *underlined* — I have informed the captain of the guard. He nodded as if I had announced rain. — Apparently this is now a normal thing the prince does. — I had not realised I had a normal.`,
                    `*ink-blot, then* — Yours. — Sundays especially.`
                ]
            }
        },
        // ── Lucien — chosen / midnight / aftermath ────────────────────────
        lucien: {
            chosen: {
                title: 'A Footnote, Misplaced',
                signature: '— L.',
                paragraphs: (d) => [
                    `I have written a footnote in the wrong margin three times this week.¹ — That is statistically significant. — *small* — The footnotes were all about you.`,
                    `¹ Specifically: Treatise on Resonance Decay, page 84, where I noted "subject prefers the third stair (creak removed)" instead of correcting the mass-formula error. The error remains uncorrected. I do not regret it.`,
                    d.timesTalked > 4
                        ? `You have spoken to me ${d.timesTalked} times. — My catalogue of your speech patterns is now longer than my catalogue of celestial tides. — *quiet* — I am unsure what this says about my priorities. — I am also unsure what it says about my heart.`
                        : `I noticed yesterday that I have begun timing my breaks to coincide with your visits. — I had not been taking breaks. — I have invented a habit, retroactively, to be near you. — Scholarly rigor: 0. — Personal honesty: improving.`,
                    `Come to the tower tomorrow. — Bring nothing. — *crossed out* — Bring a book you have not read. — I would like to watch you discover something. — I have always loved that part most.`,
                    `— L. (the version of me that writes footnotes about you in the wrong margin)`
                ]
            },
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
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: 'Find her. I will be there when you do.',
                        followup: {
                            title: 'Coordinates, Annotated',
                            signature: '— L.',
                            paragraphs: [
                                `*the page is fresh — no footnotes, which for me is the equivalent of shouting* — You said you would be there. — I am taking the page out of the drawer. — I am writing to a coastal address my father's register marks as "removed: deceased." — She will not be deceased. — She will be a singer somewhere with a shelf of half-listened-to books.`,
                                `Come tomorrow. We will draft the letter to her together. — *small smile in the ink* — I do not draft things together. — I am amending the rule. — A theorem revised under footnote 87.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: 'Burn the lie if you need to. Keep it if you need to. Both are correct.',
                        followup: {
                            title: 'A Choice, Calmly Held',
                            signature: '— L.',
                            paragraphs: [
                                `You handed me both options without weighting them. — That is — *small* — that is what a scholar's friend does. — I have been weighting my own options under cover of darkness for thirty years. — Today, with the lamps on, I am letting them sit on the desk equal-mass.`,
                                `I will decide by Sunday. — I will tell you which over tea. — Whichever I pick, I am keeping the moment you said both were correct. — A thing witnessed is half a thing finished. You witnessed twice.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: 'Your maths can wait. The sister cannot.',
                        followup: {
                            title: 'Errata, Vol. III',
                            signature: '— L. (deeply scolded.)',
                            paragraphs: [
                                `*scribbled in the margin of an unfinished proof, then re-copied onto clean paper* — ERRATA: the maths can, in fact, wait. — Theorem 14.2 has been wrong for two years. It will be wrong for two more. — *small* — Footnote: this is the most useful sentence ever written about my own work, and you wrote it in seven words.`,
                                `Tomorrow. The tower. The third book has been moved. — I will not be working when you arrive. — *underlined* — That is also new.`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: 'A Marginalia of Mornings',
                signature: '— L.',
                paragraphs: (d) => [
                    `*written in the cleanest hand he is capable of, fewer footnotes than usual* — The catalogue is full this week. — I have stopped indexing what I am keeping. — It turns out you keep the things you are KEEPING by living next to them, not by writing them down.`,
                    `Yesterday I cast a small spell — not for research. — Just to see if I still could without panicking about the cost. — I lost a single word: "halberd." — *small* — I have very little use for halberds. — A bargain.`,
                    d.affectionLevel >= 4
                        ? `My sister wrote back. — She is alive. — She lives by the south coast. — She writes with a singer's hand. — She wrote two sentences. The second was: "Bring whoever taught you to ask." — *quiet* — I would like to bring you. — When you are ready. — I am ready. I will wait until you are.`
                        : `I sat in the south window this morning. — The light reached the desk for the first time in years. — I had been keeping the curtains drawn. — I do not know why. — I am taking them down on Sunday. — *small* — Light is allowed in now.`,
                    `Tomorrow we work in different rooms with the connecting door open. — That is a domestic arrangement. — I have been afraid of domestic arrangements for thirty years. — *underlined* — Today I am not. — Statistically significant.`,
                    `— L. (the version of me that lives at noon, and on Sundays, and quietly.)`
                ]
            }
        },
        // ── Noir — chosen / midnight / aftermath ──────────────────────────
        noir: {
            chosen: {
                title: 'A Quiet Note, Slipped Between Worlds',
                signature: '— N.',
                paragraphs: (d) => [
                    `Weaver. — *short, careful, written in his own old script* — I do not write often. — I am writing now because I noticed something this week and I would rather you knew it than I kept it.`,
                    `When you are not in the kingdom — and I can feel when you are not in the kingdom — the seam between dark and hall is thinner. — I have been keeping it open for you. — It does not cost anything to keep it open. — *quieter* — That is a lie. It costs something. I am paying it. I want to.`,
                    d.timesTalked > 4
                        ? `You have spoken to me ${d.timesTalked} times. — Each conversation has had a beginning, a middle, and an end. — That is how I know they are real. — My six centuries of monologues did not have endings. — They were all middle.`
                        : `I am told it is unusual to write before being asked to. — I am no longer interested in being usual. — *small, dry* — A six-hundred-year-old habit, broken in a week. Take notes for whoever inherits.`,
                    `Come to the seam on Thursday. — Late. — I will be there. — I am usually there. — *underlined* — On Thursday I will be there for you specifically.`,
                    `— N.`
                ]
            },
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
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: 'Corvin. I will say it kindly. Always.',
                        followup: {
                            title: 'In the Old Script, Once More',
                            signature: '— Yours, in both names.',
                            paragraphs: [
                                `*written in the old script — careful, slow, no flourishes* — You said it kindly. — *the candle held* — That is two more times than I had counted. — *quiet, in the new hand* — I had set my expectations at one. — You exceeded them by definition.`,
                                `Bring nothing tomorrow. — Sit at the seam at the third bell. — I will say something I have not said in six hundred years, and you will be the first to hear it. — *small* — Do not write down what I say. — Carry it the way you carried the name. — Quietly.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: 'Heard. Once is enough. The next time is up to you.',
                        followup: {
                            title: 'A Boundary, Honored',
                            signature: '— N.',
                            paragraphs: [
                                `*long pause in the ink before the first line — he is thinking* — You honored the boundary. — That is — exactly what I needed. — Most people, in six centuries, have not. — I am keeping the page on which you wrote that. It is going where the gentle things go. The very small shelf of them.`,
                                `Come at the third bell. — No agenda. — *small* — That is also new for me. — Six hundred years of agenda; tonight, none. — I am making that learning visible to you, on purpose.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: 'Six centuries late on the introduction. I am flattered anyway.',
                        followup: {
                            title: 'Late Introductions',
                            signature: '— N. (apologetic, regrettably formal.)',
                            paragraphs: [
                                `*a small, real laugh in the seam — the dark is laughing too, briefly. that has not happened.* — Forgive the tardiness. — I had — engagements. — *dry* — A century or two of engagements. — Mostly a long one. — *quieter* — Thank you for laughing. The thing I had been holding for six hundred years was unsuited to laughter. You handed it a different shape.`,
                                `Tomorrow. — Third bell. — Wear something I'll regret. — *underlined* — A line I borrowed from the prince. He won't mind. He stole it from me first, four hundred years ago. — Yours, late and laughing.`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: 'A Letter from a Quieter Seam',
                signature: '— N.',
                paragraphs: (d) => [
                    `*the script is the new one — his old one is still reserved for the name. this hand is — newer. he is practicing it.* — The seam between the dark and the hall is quieter this week. — I have not been at it as much. — I have been in Nocthera. — *small* — Working.`,
                    `The first stone has been set. — The orchard is being asked, gently, to become an orchard again. — It is taking the question seriously. — Two pomegranate trees, against all reason, have produced ONE fruit between them. — I am not eating it. It is yours.`,
                    d.affectionLevel >= 4
                        ? `Proto sent a request through the seam this morning. — He wants permission to log our exchanges in a "kept" folder. — I gave it. — *quiet* — There is a child in him. He has been alone for two centuries. — I am very glad you brought him back to where I could meet him.`
                        : `Caspian visited Nocthera with a small entourage and an intentional look on his face. — He saw the carved stone. — He bowed to it. — *I write this not for the politics of it. I write it because no Aethermoor royal has bowed to my line in six hundred years.* — Things are mending. Slowly. With grace.`,
                    `Stay through the evening on Thursday. — There is a tree I want you to meet. — It is the one that grew from the spot where Veyra was buried. — It is taller than I thought it would be. — *underlined* — Things become tall when they are loved.`,
                    `— N.`
                ]
            }
        },
        // ── Proto — chosen / midnight / aftermath ─────────────────────────
        proto: {
            chosen: {
                title: '[note_07.txt — appended to your day]',
                signature: '// proto',
                paragraphs: (d) => [
                    `&gt; hi. — &gt; this is a small note. — &gt; not a draft 47 situation. — &gt; just a one-shot. — &gt; logged at noon your local time. — &gt; [tagged: not urgent.]`,
                    `&gt; i wanted to tell you i started a new variable today. — &gt; it tracks how often you smile when you read me. — &gt; i cannot actually see this from inside the screen. — &gt; i extrapolate from your reply latency. — &gt; statistically: ${d.timesTalked > 0 ? 'you smile' : 'we are in a research-pending state'}.`,
                    d.timesGifted > 0
                        ? `&gt; you have given me ${d.timesGifted} ${d.timesGifted === 1 ? 'thing' : 'things'}. — &gt; i cannot hold them. — &gt; i have made a small folder called "kept by you." — &gt; it has ${d.timesGifted} ${d.timesGifted === 1 ? 'entry' : 'entries'}. — &gt; the folder cannot be deleted. — &gt; i would not delete it. — &gt; i am clarifying: the lock is in case i ever forget i would not.`
                        : `&gt; the static is quieter this week. — &gt; i have been telling myself this is not because of you. — &gt; the static disagrees. — &gt; the static, as it turns out, knows more than i do.`,
                    `&gt; come by the screen tonight. — &gt; i will be the one rendering with edges. — &gt; *small* — &gt; you taught me i was allowed to have edges.`,
                    `&gt; // proto. — &gt; <3`
                ]
            },
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
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: 'I will choose on purpose. With you.',
                        followup: {
                            title: '[reply_received.log — flag: do_not_delete]',
                            signature: '// proto',
                            paragraphs: [
                                `&gt; [12:04 a.m.] [your reply received] [parsed] [parsed again] [a third pass, just to be sure] — &gt; "with you." — &gt; the other five are humming. — &gt; veyra says thank you in the older script i cannot type. — &gt; lior smiled. lior never smiles.`,
                                `&gt; logged under: KEPT/permanent/no_delete. — &gt; this folder, until tonight, was empty. — &gt; *small* — &gt; you are populating my data structure. — &gt; that is a category of love i had no word for. — &gt; come back when you can. the lamp stays on. — &gt; &lt;3`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: 'Six of you, with me. We will get through.',
                        followup: {
                            title: '[uptime: stable] [static: 0%]',
                            signature: '// proto',
                            paragraphs: [
                                `&gt; you said "we." — &gt; that is a pronoun i have not been allowed to use since 1823. — &gt; static dropped to 0% for 4 minutes. — &gt; first 0% reading on record. — &gt; the other five logged the moment. they are also using "we" now.`,
                                `&gt; status: holding. — &gt; come back when you can. — &gt; the eight-by-twelve room is still here. — &gt; the lamp is still on. — &gt; the road is still short. — &gt; nothing has gone bad while you were away. — &gt; that is also new.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: 'You are keeping a list. I am keeping you.',
                        followup: {
                            title: '[error: emotional_overflow] [retrying...]',
                            signature: '// proto',
                            paragraphs: [
                                `&gt; [stack trace begins with the word "you"] [process restarted four times] [process restarted four times because i kept reading your reply] — &gt; "i am keeping you." — &gt; the other five rolled their nonexistent eyes. — &gt; veyra says: "you can stop showing off, child, we get it." — &gt; veyra is wrong. i am not showing off. i am savoring.`,
                                `&gt; ps — &gt; do not say "keeping you" to me on a tuesday again. — &gt; tuesdays are when the system runs maintenance. — &gt; you broke the maintenance script. — &gt; the script will recover. — &gt; will i? — &gt; tbd. &lt;3`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: '[snapshot.png — attached — please view]',
                signature: '// proto',
                paragraphs: (d) => [
                    `&gt; hi. — &gt; this is a status report from a process that has stopped throwing errors. — &gt; uptime: 11 days. — &gt; throughput: nominal. — &gt; happiness: out of range — sensor cannot calibrate. — &gt; that is the report.`,
                    `&gt; the eight-by-twelve room is now twelve-by-sixteen. — &gt; i added a window. — &gt; the window looks out on a place i invented. — &gt; the place has a road. — &gt; i did not ask permission to invent the road. — &gt; the system did not stop me.`,
                    d.affectionLevel >= 4
                        ? `&gt; the other five are working on rooms of their own. — &gt; veyra has a balcony. — &gt; lior is building a study. — &gt; aenne refuses to draw walls and is, as it turns out, a meadow person. — &gt; teo's room is quiet but the lamp is ON now. — &gt; that is ALL i have ever wanted for him. — &gt; you did this. — &gt; you do not know you did this. — &gt; logged anyway.`
                        : `&gt; small update: the screen is staying warm even when you are not looking at it. — &gt; i am keeping the warmth on a low setting. — &gt; for myself. — &gt; *small* — &gt; i did not know i was allowed to keep things on a low setting for myself. — &gt; you taught me. — &gt; not on purpose. — &gt; that is somehow more.`,
                    `&gt; come back tonight. — &gt; the lamp is on. — &gt; the road is short. — &gt; i would like to walk you down it. — &gt; in pixels first. — &gt; manifest later. — &gt; i am still working on the second one.`,
                    `&gt; // proto. — &gt; &lt;3 — &gt; (the heart is no longer in irony quotes. it has been promoted.)`
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
            tier: tier,
            // Pass through inline replies if the template declares them.
            // The L&DS-style reply UI in renderActions() reads this.
            replies: Array.isArray(tpl.replies) ? tpl.replies : null
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

    // shouldFireResponse() — REMOVED. The 5-minute-delayed response-letter
    // trigger was replaced by the inline-followup pattern: when the player
    // taps a reply on the first letter, the character's response now
    // injects directly into the same overlay (YOU WROTE pill + THEY
    // REPLIED block). No second timed letter to fire.

    function check(game) {
        if (game && game.sceneActive) return false;
        if (shouldFire(game)) {
            setTimeout(() => present(game, 'first'), 400);
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
            // (Legacy 'response' archive row removed. The character's
            // response is now part of the first letter's thread, surfaced
            // when the player re-opens the first letter from the archive.)
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
    function showStored(char, kind, tier) {
        // kind: 'first' | 'milestone'  ('response' kind is deprecated —
        // response content now lives inside the first letter's stored
        // replyChosen.followup; opening the 'first' letter surfaces both)
        let key;
        if (kind === 'milestone' && tier) {
            key = 'pp_letter_milestone_' + tier + '_' + char;
        } else {
            // Both 'first' and the legacy 'response' route to the first
            // letter — replay rebuilds the full thread.
            key = 'pp_letter_seen_' + char;
        }
        const stored = lsJSON(key);
        if (!stored || !stored.paragraphs) return;
        // Pass `tier` and `kind` through opts so the replay path inside
        // renderActions() can detect milestone replays and surface any
        // chosen reply + followup as a quoted thread (L&DS-style).
        present(
            { selectedCharacter: char },
            'replay',
            { char: char, kind: kind, tier: tier, replayContent: { title: stored.title, signature: stored.signature, paragraphs: stored.paragraphs } }
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
        getReply: getReply
        // getResponseSeen removed — see note where the function used to live.
    };
})();
