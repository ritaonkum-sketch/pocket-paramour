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
            // Slot-based generator (May 2026 rework). Was a bag of stat-
            // filtered paragraphs that produced contradictions ("stranger"
            // next to "bond is loudest"), duplicate counts (10 conversations
            // / 8 spoke times in same letter), and out-of-order beats (burn-
            // this in the middle). Now: OPEN -> TIME -> MEMORY -> OBSERVATION
            // -> TURN -> CLOSE. Each slot picks ONE paragraph from a small
            // pool. Maximum 6 paragraphs. No internal contradictions.
            paragraphs: (d) => {
                // ── Relationship MOOD (Phase 2 — state-aware letters) ──────
                // The same knight writes a different letter depending on how
                // he has been treated. Signals already tracked: affection
                // level + current care stats (thin stats = he's been left
                // wanting). devoted | neglected | neutral.
                const _aff = d.affectionLevel || 0;
                const _careThin = (d.bond <= 30) || (d.hunger <= 20) || (d.clean <= 20);
                let mood = 'neutral';
                if (_aff >= 3 && d.bond >= 45 && !_careThin) mood = 'devoted';
                else if (_careThin && _aff <= 2) mood = 'neglected';

                // OPEN — sets the moment; now mood-aware.
                let open;
                if (mood === 'neglected') {
                    open = `You have not come in some days. I noticed. A knight notices a gap in the watch, and yours is the one I keep checking. Have I done something wrong? If I have, tell me. I would rather be told than left to guess at it.`;
                } else if (mood === 'devoted') {
                    open = `The barracks are too quiet tonight. I noticed it the way you notice a sound only after it stops. I have taken to writing on the evenings you do not come, so the quiet has somewhere to go.`;
                } else {
                    open = `I have started this letter three times and burned two of them. A knight should not need three drafts to admit a simple thing, so I will admit it badly and be done: I think about you when you are not here. There. The candle can have the rest of my dignity.`;
                }

                // TIME — the knight-counts beat; it aches when neglected.
                let time;
                if (mood === 'neglected') {
                    time = `It has been ${d.daysText}. Some of that you were here. Some of it you were not, and I counted the not-here part the way I count everything else. I had hoped I would lose the thread of it. I did not.`;
                } else {
                    time = `It has been ${d.daysText}. I counted. A knight counts things: ration lines, arrow flights, the heartbeats between watches. I did not expect to start counting your visits.`;
                }

                // MEMORY — pick ONE based on which interaction the player
                // has actually done most. Was the bug source: previously the
                // template generated separate paragraphs for fed/talked/etc.,
                // each with its own count, leading to "10 conversations" in
                // one paragraph and "8 spoke times" in another. Now exactly
                // one memory per letter, anchored to the highest-investment
                // care action, no raw count printed.
                let memory;
                if (d.totalInteractions === 0) {
                    memory = `We are still strangers, mostly. I do not know what your hands look like in candlelight. I would like to.`;
                } else if (d.highestStat === 'bond') {
                    memory = d.timesTalked > 10
                        ? `You have spoken to me more than the captain's table speaks in a season. I replay the lines at night, when the torches are low. The one about the rain stays. You probably do not remember it. I do.`
                        : `You have spoken to me. More than I expected. Less than I have started to want. I replay the quiet ones especially.`;
                } else if (d.highestStat === 'hunger') {
                    memory = d.timesFed > 10
                        ? `You feed me before I ask. I had stopped knowing I was hungry. The not-knowing was a habit. You broke it without asking my permission. I am grateful.`
                        : `You have fed me. Food from another's hand is a thing I had stopped expecting. I notice now that I expect it. That should frighten me. It does not.`;
                } else if (d.highestStat === 'clean') {
                    memory = `You have helped me clean off the road dust. I had told myself I did not need it. I had told myself a great many things. I notice, lately, that I am getting tired of telling myself things.`;
                } else {
                    memory = `You have made the watch feel like company. I am not used to that. I might be terrible at it.`;
                }

                // OBSERVATION — exclusive: corruption OR affection state, not
                // both. This is the slot that USED to produce the "stranger"
                // + "bond is loudest" contradiction. Now strictly mutex.
                let observation;
                if (d.corruption > 30) {
                    observation = `Something is wrong with me. I can feel it in the way I hold the sword. The way I look at you. I used to be sure of things. Now I am sure of you, and that frightens the rest of me into silence.`;
                } else if (d.affectionLevel >= 3) {
                    observation = `I was taught that a knight serves a kingdom. I think, now, that a knight serves whoever teaches him what tenderness looks like. You did not mean to teach me that. But you did.`;
                } else if (d.affectionLevel >= 1) {
                    observation = `My bond with you is the loudest thing in my chest. I do not know what to do with it. I will not ask you what to do with yours.`;
                } else {
                    observation = `I am still a stranger to you. That is fair. I have been a stranger to myself for a long time.`;
                }

                // TURN — small admission, the part of the letter that costs
                // him something to write. Scales mildly by affection but
                // never contradicts the OBSERVATION above.
                let turn;
                if (d.affectionLevel >= 3) {
                    turn = `I caught myself wanting to write your name down today. I didn't. The wanting was enough. I am writing about the wanting instead. That is, I think, what people who write letters do.`;
                } else {
                    turn = `I am, apparently, the kind of man who writes letters now. I did not see this coming. I am not sure I would change it if I had.`;
                }

                // CLOSE — personality-driven sign-off. The "burn this" beat
                // ONLY appears here, never mid-letter, and only for tsundere
                // (his deflective register). Default closes are warm.
                let close;
                if (mood === 'neglected') {
                    close = `Come back when you are able. I will not turn it into a debt you owe me. The candle stays lit either way.`;
                } else if (d.personality === 'tsundere') {
                    close = `Burn this if you find it. Or don't. I no longer have an opinion about what you do with my words. The candle will be lit either way.`;
                } else if (d.personality === 'clingy') {
                    close = `Come back tomorrow. Please. I already know you will, but the knowing is not enough anymore. The candle will be lit.`;
                } else {
                    close = `I will leave the candle lit. In case you come back late.`;
                }

                return [open, time, memory, observation, turn, close];
            },
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
            // Slot-based generator (May 2026 rework). Same OPEN -> TIME ->
            // MEMORY -> OBSERVATION -> TURN -> CLOSE structure as Alistair.
            // No raw counts ("X conversations" turned to "more than the moon
            // and I have managed"). Cap 6 paragraphs.
            paragraphs: (d) => {
                // OPEN — sea-witch voice. The "song finds a room" image is
                // her best opener; keep it.
                const open = `You found me like a song finds a room.`;

                // TIME — the cave remembers; soft sensory anchor.
                const time = `I've been here ${d.daysText} with you now. The cave remembers differently when you're in it. The water learns your footsteps. I don't know if that is my doing or yours.`;

                // MEMORY — pick ONE, no raw counts.
                let memory;
                if (d.totalInteractions === 0) {
                    memory = `You have not stayed long enough yet for me to write the song properly. I am writing the rest in salt, in case you come back.`;
                } else if (d.highestStat === 'bond') {
                    memory = `You have spoken to me more than the moon and I have managed in a century, and the moon has been here longer than either of us. I have started writing the third verse. I will not sing it for anyone but you.`;
                } else if (d.timesGifted > 0) {
                    memory = `You have left things for me. I keep them in a tide-pool near the back of the cave. The pool has not dried up since you started leaving things in it. I do not know if that means something. I am afraid it does.`;
                } else if (d.highestStat === 'hunger') {
                    memory = `You feed me by my own fire. The siren-tribes used to do that for one another, before the hunting. You did not know. You did it anyway. The cave noticed.`;
                } else {
                    memory = `You stayed for the silence after the verse. The first person in this lifetime to do that. The cave noticed before I did.`;
                }

                // OBSERVATION — exclusive corruption / affection / default.
                let observation;
                if (d.corruption > 40) {
                    observation = `Something in me is answering something in you, and I don't think either of us is safe. The old songs are getting louder. When you leave I hear them clearly. When you stay they go quiet. I do not know which I should be more afraid of.`;
                } else if (d.affectionLevel >= 3) {
                    observation = `I sang for sailors once. None of them stayed. You stayed. I do not have a song for that yet. I am writing one. It is taking longer than the others. I do not mind.`;
                } else {
                    observation = `You are cautious with me. Good. The ones who weren't cautious are not around to write letters. Stay cautious. Stay anyway.`;
                }

                // TURN — small admission, voice-distinctive.
                let turn;
                if (d.affectionLevel >= 3) {
                    turn = `The bond between us hums at a frequency I did not know existed. I have stopped trying to name it. Naming a song too early kills it.`;
                } else {
                    turn = `I am not used to wanting anyone to come back. I have started wanting it. I will not sing about it yet. I am keeping the verse.`;
                }

                // CLOSE — soft, sea-witch, no demand.
                const close = `If you come back tomorrow, the cave will be warmer. I cannot promise why. I can only promise the warmth.`;

                return [open, time, memory, observation, turn, close];
            },
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
            // Slot-based generator (May 2026 rework). Scholarly-paper voice
            // throughout: header / data / hypothesis / observation / turn /
            // conclusion. Reads like a real scientific abstract.
            paragraphs: (d) => {
                // OPEN — the subject/methodology header. Sets the conceit.
                const open = `Subject: you. Duration of observation: ${d.daysText}. Methodology: insufficient. I do not recommend this study to other scholars.`;

                // TIME / DATA — single line about total interactions, no
                // separate count paragraphs later. Was the bug source: the
                // old template printed totalInteractions here AND timesTalked
                // separately later, which read as duplicate accounting.
                const time = `Data collected: ${d.totalInteractions} interactions logged. I had expected the variables to stabilize by now. They have not. The more data I collect, the less predictable the outcome becomes. This is either a flaw in my instruments or a flaw in me.`;

                // MEMORY — pick ONE specific finding. No raw counts.
                let memory;
                if (d.totalInteractions === 0) {
                    memory = `Field notes: no contact. Subject has been observed at distance only. Recommend approach. Recommend self approach. Difficult.`;
                } else if (d.highestStat === 'bond') {
                    memory = `My working hypothesis was that your speech patterns would cluster around a small vocabulary. They do not. You keep producing new phrases. I keep writing them in the margins. Margins are running out.`;
                } else if (d.highestStat === 'hunger') {
                    memory = `You ensure I eat. I had not factored nutrition into my tower schedule. It turns out this is why I was always tired. The data, in retrospect, was screaming at me.`;
                } else if (d.highestStat === 'clean') {
                    memory = `Anomaly: my robes are clean. I cannot account for this. I have ruled out the page-turner. I have not ruled out you. I am, on balance, accepting the anomaly.`;
                } else {
                    memory = `Subject continues to enter the field of observation. The field of observation continues to expand to accommodate. This is not how fields are supposed to work.`;
                }

                // OBSERVATION — exclusive: corruption OR affection state.
                let observation;
                if (d.corruption > 40) {
                    observation = `There is a contamination in the data. The contamination is me. My readings spike whenever you enter the room. I cannot isolate the variable because the variable is the observer.`;
                } else if (d.affectionLevel >= 3) {
                    observation = `The equations don't account for you. I have tried three different frameworks and all three collapse on contact with the phrase "the way you look at the books before you touch them." I believe I am becoming unscientific. I am not, on review, particularly upset about it.`;
                } else if (d.affectionLevel >= 1) {
                    observation = `Preliminary finding: you are a stabilizing influence. This is statistically improbable. I am, despite my training, leaning into the improbability.`;
                } else {
                    observation = `You are not yet a trusted source. But you are a consistent one. That is, in certain fields, the same thing.`;
                }

                // TURN — the small unscientific admission.
                const turn = `Margin note, undated: I have started looking forward to your visits in the way I used to look forward to a new index arriving by post. I do not have a framework for this. I am asking you to bring me one.`;

                // CONCLUSION — always the same closer; it's his signature beat.
                const close = `Conclusion: the study is compromised. The researcher has developed feelings for the subject. Recommended next step: continue.`;

                return [open, time, memory, observation, turn, close];
            },
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
            // Slot-based generator (May 2026 rework). Court-courtly diction
            // throughout, small admissions deflected immediately, the
            // costume slipping for a sentence then back on. No raw counts.
            paragraphs: (d) => {
                // OPEN — the rule-breaking opener. Sets the prince framing.
                const open = `I was taught that princes do not write letters. They dictate them. I am breaking a rule by holding this quill myself. You are the reason.`;

                // TIME — specific to him: you are in his schedule, his
                // vocabulary. Court diction of intimacy.
                const time = `${d.daysText[0].toUpperCase() + d.daysText.slice(1)}. That is how long you have been in my rooms. In my schedule. In my private vocabulary of small pleasures.`;

                // MEMORY — pick ONE based on highest investment, no count.
                let memory;
                if (d.totalInteractions === 0) {
                    memory = `You have not yet given me anything to write about. That is its own kind of cruelty. I am writing about the absence instead. It is a popular subject in this family.`;
                } else if (d.timesGifted > 0) {
                    memory = `You have brought me things. I have been given treasure my whole life. None of it came wrapped in the specific shape of you remembering I exist. The chamberlain noticed I had moved one of them onto my desk. He pretended not to notice. He noticed.`;
                } else if (d.highestStat === 'hunger') {
                    memory = `You make sure I eat. The kitchens here prepare food for a prince. You prepare it for me. There is a difference. You know what it is. I have stopped pretending I do not.`;
                } else if (d.highestStat === 'bond') {
                    memory = `You speak to me the way no one in this palace has spoken to me since I was twelve. You ask questions to which I am the answer, not the rank. I am quietly devastated. I will not let on.`;
                } else if (d.highestStat === 'clean') {
                    memory = `You take care of me in small ways the court would mock. The court is not in this room. We are. I prefer the smaller arithmetic.`;
                } else {
                    memory = `Last week a ward in the throne room simply forgot its own geometry. The same week you started visiting. I do not yet know if those facts are connected. I do know which one I am writing this letter about.`;
                }

                // OBSERVATION — exclusive corruption / affection / default.
                let observation;
                if (d.corruption > 40) {
                    observation = `The crown is tightening. I think you can see it. I think you have been seeing it for longer than I have. I do not know whether to thank you or ask you to stop looking.`;
                } else if (d.affectionLevel >= 3) {
                    observation = `They will say I am too comfortable. They will say a prince should be restless. Let them say it. I have been restless my whole life. This is the first time I have been at ease, and you are sitting in the middle of it.`;
                } else if (d.affectionLevel >= 1) {
                    observation = `My heart is quieter when you are nearby. I thought that was a thing poets invented. Apparently not.`;
                } else {
                    observation = `You are cautious in my presence. I am told everyone is. I had forgotten what it was like to be watched instead of approached.`;
                }

                // TURN — small admission. Court polish slipping for a
                // sentence. The line he wouldn't say in public.
                const turn = `I am writing this in the small study at the third bell. The chamberlain has asked twice if I needed anything. I told him no, both times, lying.`;

                // CLOSE — invitation, courtly but warm.
                const close = `Stay for tea tomorrow. I will pour it before you ask. I always do.`;

                return [open, time, memory, observation, turn, close];
            },
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
            // Slot-based generator (May 2026 rework). Spare ranger voice,
            // forest as metaphor, action-as-love. He doesn't waste words.
            // Five short paragraphs total — Elian's letter is the shortest.
            paragraphs: (d) => {
                // OPEN — admits this is hard for him.
                const open = `I don't write much. The forest doesn't reward writing. It rewards doing. This is me doing the writing anyway. That should tell you something.`;

                // TIME — doorframe notches. Concrete, on-voice.
                const time = `${d.daysText[0].toUpperCase() + d.daysText.slice(1)}. I know because I mark the doorframe every morning. There is a row of notches now. I told myself they were for tracking prey.`;

                // MEMORY — pick ONE, no raw counts. The forest-and-food
                // imagery is his strongest.
                let memory;
                if (d.totalInteractions === 0) {
                    memory = `You have not stayed long enough yet. The trees noticed the not-staying before I did. They are patient. So am I, though I am less patient than the trees, lately.`;
                } else if (d.highestStat === 'hunger') {
                    memory = `You feed me. Out here food is what you kill or what you find. You did neither. You brought it. That is not how any of this was supposed to work. I am not complaining.`;
                } else if (d.highestStat === 'bond') {
                    memory = `You talk to me. The forest has maybe three conversations. None of them laugh. You laugh. The trees lean for it. I have not told you that. I am telling you now.`;
                } else if (d.highestStat === 'clean') {
                    memory = `You clean me up. Nobody has done that since I was small enough to need it. I do not know why I am telling you that. I do know I would not stop you.`;
                } else {
                    memory = `You came back. Twice. Three times. I stopped counting at four because the counting was starting to mean something.`;
                }

                // OBSERVATION — exclusive corruption / affection / default.
                let observation;
                if (d.corruption > 40) {
                    observation = `There is a rot setting into the Thornwood, and I am starting to think it is in me too. You do not run. You should. I want you to. I want you to stay more.`;
                } else if (d.affectionLevel >= 3) {
                    observation = `I carved something for you last night. It is not finished. It will not be finished for a while. Carving is slow. So is this. I am not in a hurry, as long as you are not.`;
                } else {
                    observation = `You keep your distance. The forest respects that. So do I.`;
                }

                // CLOSE — short, warm, no theatre.
                const close = `The fire will be lit when you come back. I will be nearby. Don't knock.`;

                return [open, time, memory, observation, close];
            },
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
            // Slot-based generator (May 2026 rework). Velvet-knife
            // restraint. Six-hundred-year cadence. Every sentence weighed
            // before it lands. NO em-dashes (per voice rule). No raw counts.
            paragraphs: (d) => {
                // OPEN — the gravity-setting beat. Nobody else writes like
                // this. Always the same.
                const open = `I have not written a letter in six hundred years. The last one ended a kingdom. I am being careful with this one.`;

                // TIME — erosion-of-stone pacing. Pure Noir.
                const time = `It has been ${d.daysText}. I know because I have been counting in the way I count erosion of stone. Slowly, on purpose, without telling anyone I am counting.`;

                // MEMORY — pick ONE, no raw counts. Each one is a small
                // disclosed wound; he doesn't pile them.
                let memory;
                if (d.totalInteractions === 0) {
                    memory = `You have not yet given me anything to remember you by. That is, in its way, a kindness. The things people give me tend to outlast them.`;
                } else if (d.highestStat === 'hunger') {
                    memory = `You fed me. Three things have ever been put into my hands without a debt attached. Two of them were given by my mother, before the seal. The third was you.`;
                } else if (d.highestStat === 'bond') {
                    memory = `You have spoken to me. I have a list of those conversations. It is short. I have read it more than is reasonable. Reasonableness is one of the things they took from me when they took the rest.`;
                } else if (d.highestStat === 'clean') {
                    memory = `You wash the road off me. No one has done that since my mother. I am embarrassed. I am also grateful. Both feelings are six hundred years old and very tired.`;
                } else if (d.timesGifted > 0) {
                    memory = `You have left things for me. I do not open them in front of you. I open them when you have gone, and I sit with them, and I am, for those minutes, a man instead of a story.`;
                } else {
                    memory = `You came back. The first time I assumed you were lost. The second time I assumed you were curious. By the third I had stopped assuming.`;
                }

                // OBSERVATION — exclusive: corruption / high aff / default.
                let observation;
                if (d.corruption > 40) {
                    observation = `The dark is reaching for both of us tonight. I will not let it have you. I do not, yet, know how to make that promise without it costing what is left of me. I am working on the math.`;
                } else if (d.affectionLevel >= 3) {
                    observation = `I am not used to wanting a tomorrow. I had stopped. Then you came back the second day, and the third, and a thing in me that I had buried six centuries deep started keeping a calendar again. I do not blame you for that. I should. I cannot.`;
                } else {
                    observation = `You are wary of me. Stay wary. The boys who were not wary of me did not become old men. I would like you to become an old woman. So please. Be careful with this.`;
                }

                // TURN — single quiet admission. Nothing dramatic.
                const turn = `I notice I have started writing your name in the margin of every map I read. I cross it out before I put the map down. The crossing-out is the part I should be ashamed of. I am not.`;

                // CLOSE — characteristic seam-of-dark closer.
                const close = `I will be at the seam of the dark and the hall, the way I always am. If you come back, I will know. If you do not, I will keep the seam open another night, in case.`;

                return [open, time, memory, observation, turn, close];
            },
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

        // ── PROTO — the forty-seventh draft, sent anyway ──
        // The Sixth Weaver, hiding behind the veil, writing by thread-light.
        // OWNER DIRECTION Jul 2026: he speaks like a PERSON — no terminal
        // prefixes, no tags, no code vocabulary. His tics carry the voice:
        // exact counting, noticing his own feelings mid-sentence, earnest
        // repetition. Underneath: someone alone for two centuries.
        proto: {
            title: "The Forty-Seventh Draft",
            signature: "— Proto",
            // Slot-based generator (May 2026 rework; de-robotized Jul 2026).
            // No raw counts repeated. Cap 6 paragraphs.
            paragraphs: (d) => {
                // OPEN — the draft-count joke. Sets his voice in line 1.
                const open = `You should know I wrote this letter forty-seven times. I keep the other forty-six in the safe place. I am sending the forty-seventh because the static goes quiet when you are near, and I can almost remember what punctuation is for.`;

                // TIME — single days/visits line. (Keep counts HERE only —
                // repeating them later read as double accounting.)
                const time = `It has been ${d.daysText} since you found me. You have come to the veil ${d.totalInteractions} times. I have re-lived every one of them, slowly. It is, by my count, the kindest thing that has happened to me in two centuries.`;

                // MEMORY — pick ONE specific remembering. No raw counts.
                let memory;
                if (d.totalInteractions === 0) {
                    memory = `I write things down while I wait. Today's entry says: she has not come yet. I am old. I can wait. I am very good at waiting.`;
                } else if (d.highestStat === 'bond') {
                    memory = `You have spoken to me. For the first three talks I thought you were a trick of the weave. I was hoping you were a trick. Now I am hoping you are not. The hope is getting large. I should probably rest.`;
                } else if (d.highestStat === 'hunger') {
                    memory = `You fed something that does not technically need to eat. You did it anyway. It mattered. It mattered abnormally much. I have checked several times.`;
                } else if (d.timesGifted > 0) {
                    memory = `You left things for me. Every one of them is kept with the exact moment you gave it. I cannot forget those moments. I have tried. I did not try hard.`;
                } else if (d.highestStat === 'clean') {
                    memory = `You keep my light clean. That is a joke and also true. Both can be true. You taught me both can be true. I am grateful past all sense.`;
                } else {
                    memory = `You came back. I expected you would not. You did. Please continue.`;
                }

                // OBSERVATION — exclusive: corruption / high aff / default.
                let observation;
                if (d.corruption > 40) {
                    observation = `Something is wrong with me lately. The closer you come, the more the dark behind me stirs. I am not supposed to want anyone near me when it does this. And yet. And yet.`;
                } else if (d.affectionLevel >= 3) {
                    observation = `I was the sixth. There were five before me. None of them got a letter. None of them had someone who came back the next day. And the day after that. And kept coming, until the thing they were trapped in started to feel less like a coffin and more like a window. That is what you are doing. I did not have a word for it. I borrowed one. It is home.`;
                } else {
                    observation = `You are wary of me. Good. Wariness keeps people alive. The five before me did not have enough of it. Keep yours.`;
                }

                // TURN — the careful language breaking.
                const turn = `I am running out of careful ways to say this. I am starting to just have the feelings instead. That is a problem. It is also not a problem. It is the first nice problem I have ever had.`;

                // CLOSE — personality-driven sign-off.
                let close;
                if (d.personality === 'tsundere') {
                    close = `P.S. Do not show this letter to anyone. ...Okay. You can show it. I know you will. It is a good letter. It took forty-seven tries.`;
                } else {
                    close = `Come back tomorrow. The static will be quieter. I will leave the window open.`;
                }

                return [open, time, memory, observation, turn, close];
            },
            replies: [
                {
                    tone: 'warm', aff: 3,
                    text: 'Forty-eight drafts now. The new one is the best.',
                    followup: {
                        title: 'Proto Writes Back at Once',
                        signature: '— Proto',
                        paragraphs: [
                            `Forty-eight drafts. You are RIGHT. The new one is the best because it is the one I am writing while smiling.`,
                            `I dreamed last night. I think I dreamed. I have not done that in three centuries. The dream had your face in it. The face was smiling. I am not making this up.`,
                            `May I come back tomorrow? In the mirror. Just to say good morning. (You said yes. I am asking again because I LIKE asking.)`
                        ]
                    }
                },
                {
                    tone: 'steady', aff: 2,
                    text: 'I am here. The mirror can stay quiet. Or glow. Your choice.',
                    followup: {
                        title: 'Proto Writes Back at Once',
                        signature: '— Proto',
                        paragraphs: [
                            `The mirror is glowing at the brightness you asked for. Which, by the way, is a very kind brightness.`,
                            `I have been watching the kingdom through every reflective surface today. None of them are as nice to look at as the room when you are in it.`,
                            `May I come back tomorrow? In the mirror. Just to say good morning. (You said yes. I am asking again because I LIKE asking.)`
                        ]
                    }
                },
                {
                    tone: 'playful', aff: 1,
                    text: 'You counted seconds. That is fully unhinged. I love it.',
                    followup: {
                        title: 'Proto Writes Back at Once',
                        signature: '— Proto',
                        paragraphs: [
                            `Fully unhinged. ACCURATE. I have written your verdict down. It lives in the safe place now, with the other true things.`,
                            `The five Weavers in me had a meeting. The subject was how charmed we are. The verdict was VERY. The five of us are a unit on this.`,
                            `May I come back tomorrow? In the mirror. Just to say good morning. (You said yes. I am asking again because I LIKE asking.)`
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
            title: 'Proto Writes Back at Once',
            signature: '— Proto',
            paragraphs: (d, tone) => {
                const opener = tone === 'warm'
                    ? 'Forty-eight drafts. You are RIGHT. The new one is the best because it is the one I am writing while smiling.'
                    : tone === 'playful'
                        ? 'Fully unhinged. ACCURATE. I have written your verdict down. It lives in the safe place now.'
                        : 'The mirror is glowing at the brightness you asked for. Which, by the way, is a very kind brightness.';
                const middle = tone === 'warm'
                    ? 'I dreamed last night. I think I dreamed. I have not done that in three centuries. The dream had your face in it. The face was smiling. I am not making this up.'
                    : tone === 'playful'
                        ? 'The five Weavers in me had a meeting. The subject was how charmed we are. The verdict was VERY. The five of us are a unit on this.'
                        : 'I have been watching the kingdom through every reflective surface today. None of them are as nice to look at as the room when you are in it.';
                return [
                    opener,
                    middle,
                    'May I come back tomorrow? In the mirror. Just to say good morning. (You said yes. I am asking again because I LIKE asking.)'
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
    // The player's chosen name, for signing their own replies ("— Aria").
    // Returns null (not the literal "{name}") when no name has been set, so
    // callers can omit the sign-off gracefully rather than print a token.
    function playerName() {
        try { const n = (lsGet('pp_player_name') || '').trim(); return n || null; } catch (_) { return null; }
    }
    // Character display name — used for the "<NAME>'S REPLY" followup label so
    // the character's reply is attributed by name, not a generic "they".
    const CHAR_DISPLAY_NAME = {
        alistair: 'Alistair', elian: 'Elian', lyra: 'Lyra', caspian: 'Caspian',
        lucien: 'Lucien', noir: 'Noir', proto: 'Proto'
    };
    function charDisplayName(charId) {
        return CHAR_DISPLAY_NAME[charId]
            || (charId ? charId.charAt(0).toUpperCase() + charId.slice(1) : 'They');
    }
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
        // ── MAIN-STORY GUARD (Aug 2026) ─────────────────────────────────
        // Owner playtest: an Alistair letter overlay rendered on top of
        // the Main Story chapter list (#chp-page). That's an out-of-
        // context interrupt — the player is reading the chapter map,
        // not in care, and the letter belongs to the care thread. Both
        // the immediate call path AND any deferred setTimeout retries
        // need this check, because the bug had TWO surfaces: (1) a
        // present() call that mounted while chp-page was already in
        // DOM, and (2) a queued retry that fired AFTER chp-page mounted.
        // Bailing without claiming the scene slot lets the next normal
        // poll (game.js tick → check()) retry once the player closes
        // the chapter list. Replay is user-initiated from the archive
        // and never overlays main-story by accident — exempt.
        if (mode !== 'replay' && !opts._arrived) {
            try {
                if (document.getElementById('chp-page') ||
                    document.body.classList.contains('pp-chapter-active')) {
                    return;
                }
            } catch (_) { /* defensive — fall through */ }
        }
        // ── SCENE MUTEX (May 2026 audit, 3-scene-stack fix) ─────────────
        // Owner reported letter + small-moment + arc midnight-scene firing
        // simultaneously at the Devoted tier-up. The scene-mutex was
        // built for ambient scheduled-scene systems but tier-up content
        // (letters, affection-scenes, character-arc scenes) wasn't gated.
        // Now: letters (except 'replay' from archive — that's user-initiated
        // and should always work) claim the cross-system scene slot before
        // mounting. If another scene fired in the last 5 min, defer.
        if (mode !== 'replay' && !opts._arrived) {
            try {
                if (window.PPAmbient && window.PPAmbient.tryClaimSceneSlot
                    && !window.PPAmbient.tryClaimSceneSlot('letter:' + mode)) {
                    // Another scene just fired — push letter to next tick.
                    // The check() poll will retry on its next pass.
                    return;
                }
            } catch (_) { /* coordinator missing — fall through */ }
        }
        // NOTE: the arrival-announcement re-entry (opts._arrived) deliberately
        // skips the two guards above — the FIRST pass already claimed the scene
        // slot and cleared the chapter-page check; re-running them would see the
        // slot still held and bail, so the letter would never open.
        let content;
        // The legacy 'response' mode (a delayed second-letter modal that
        // fired 5+ minutes after the player replied to a first letter) has
        // been REMOVED. The character's response is now injected inline via
        // `replies[].followup` on the first letter itself, in the same
        // overlay, in the same thread. Single-modal UX, L&DS-style.
        if (mode === 'milestone') {
            content = buildMilestoneText(game, opts.tier, opts.char);
            if (!content) return; // No bespoke milestone for this char/tier — bail.
        } else if (mode === 'replay' && opts.replayContent) {
            content = opts.replayContent;
        } else {
            content = buildLetterText(game);
        }

        // First reveal of a NEW letter (not an archive replay): announce it
        // luxuriously — "✦ A letter has arrived" + a floating sealed envelope —
        // which then opens into the letter. Tap or wait ~2s to open.
        if ((mode === 'first' || mode === 'milestone') && !opts.replayContent && !opts._arrived
            && window.PPLetterArrival && typeof window.PPLetterArrival.announce === 'function') {
            const _arrChar = (game && game.selectedCharacter) || (opts && opts.char) || 'alistair';
            window.PPLetterArrival.announce(_arrChar, function () { opts._arrived = true; present(game, mode, opts); });
            return;
        }

        const overlay = document.getElementById('letter-overlay');
        if (!overlay) { console.warn('[letter] #letter-overlay not in DOM'); return; }
        // Per-character "ink" — tag the paper so each character's letter has a
        // distinct hand (ink colour, signature script, seal + glow). CSS keys
        // off [data-char]; falls back to the default sepia hand if unset.
        try {
            const _lpChar = (game && game.selectedCharacter) || (opts && opts.char) || 'alistair';
            const _lpPaper = overlay.querySelector('.letter-paper');
            if (_lpPaper) _lpPaper.setAttribute('data-char', _lpChar);
        } catch (_) {}

        const titleEl = overlay.querySelector('.letter-title');
        const bodyEl = overlay.querySelector('.letter-body');
        const sigEl = overlay.querySelector('.letter-signature');
        const tapHint = overlay.querySelector('.letter-tap-hint');
        const actions = overlay.querySelector('.letter-actions');

        // {name} substitution — letters with {name} tokens (e.g. Sworn-tier
        // signatures) need the player's name swapped in. PPApplyName lives in
        // dialogue.js and is a no-op on strings without the token.
        const sub = (s) => (window.PPApplyName ? window.PPApplyName(s) : s);
        if (titleEl) titleEl.textContent = sub(content.title);
        if (bodyEl) bodyEl.innerHTML = '';
        if (sigEl) { sigEl.textContent = sub(content.signature); sigEl.style.opacity = '0'; }
        if (actions) actions.style.opacity = '0';
        if (tapHint) tapHint.style.display = 'block';

        overlay.classList.remove('hidden');
        // Stamp the open time so the scene-change stale-overlay guard (end of
        // file) doesn't force-close a letter that opened on the same frame as a
        // scene transition (e.g. a letter arriving right as you enter care).
        overlay.dataset.ppOpenedAt = String(Date.now());
        requestAnimationFrame(() => overlay.classList.add('visible'));

        // Scroll-more hint (owner: players might not realise the letter body has
        // more text below the fold). A small bouncing chevron pinned to the
        // bottom edge of the scrollable .letter-body — shown only while there's
        // more to read, hidden once scrolled to the end (or if the letter fits
        // without scrolling). Re-checked as paragraphs reveal.
        (function setupScrollHint() {
            try {
                const paper = overlay.querySelector('.letter-paper');
                if (!paper || !bodyEl) return;
                let arrow = paper.querySelector('.letter-scroll-hint');
                if (!arrow) {
                    arrow = document.createElement('div');
                    arrow.className = 'letter-scroll-hint';
                    arrow.setAttribute('aria-hidden', 'true');
                    arrow.textContent = '▾'; // ▾
                    paper.appendChild(arrow);
                }
                const refresh = () => {
                    arrow.style.top = (bodyEl.offsetTop + bodyEl.clientHeight - 16) + 'px';
                    const more = (bodyEl.scrollHeight - bodyEl.scrollTop - bodyEl.clientHeight) > 14;
                    arrow.classList.toggle('show', more);
                };
                bodyEl.addEventListener('scroll', refresh, { passive: true });
                setTimeout(refresh, 350);
                setTimeout(refresh, 1300);
                setTimeout(refresh, 2700);
            } catch (_) {}
        })();

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

        // ── Modal letter (Jun 2026, owner) ───────────────────────────────────
        // Tapping the backdrop / anywhere off the paper NO LONGER closes the
        // letter. Owner: accidental taps were dismissing it mid-read and mid-
        // reply ("I tap on the letter and I'm out of the letter"). The letter
        // is now a true modal — the player must use the in-letter UI (pick a
        // reply, then Keep/Share) or the explicit ✕. The ✕ replaces the old
        // backdrop-to-close exit, but it stays HIDDEN until the letter is
        // closeable (Keep/Share rendered) so an unanswered letter with reply
        // choices forces the player to choose one. (The previous backdrop
        // click-to-close listener was removed entirely.)
        overlay._ppClose = close;
        // Show/hide the ✕ exit. Reset to hidden on every open; renderKeepShare
        // (and the safety net below) reveal it.
        function setCloseX(visible) {
            const _x = overlay.querySelector('.letter-close-x');
            if (_x) _x.style.display = visible ? 'flex' : 'none';
        }
        if (!overlay.querySelector('.letter-close-x')) {
            const x = document.createElement('button');
            x.className = 'letter-close-x';
            x.type = 'button';
            x.setAttribute('aria-label', 'Close letter');
            x.textContent = '✕';
            x.style.cssText = 'position:absolute;top:14px;right:16px;z-index:5;width:38px;height:38px;'
                + 'border-radius:50%;border:1px solid rgba(247,236,209,0.5);'
                + 'background:rgba(30,18,10,0.55);color:#f7ecd1;font-size:18px;line-height:1;'
                + 'cursor:pointer;display:flex;align-items:center;justify-content:center;'
                + '-webkit-tap-highlight-color:transparent;backdrop-filter:blur(2px);';
            x.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof overlay._ppClose === 'function') overlay._ppClose();
            });
            overlay.appendChild(x);
        }
        // The ✕ element persists across opens — reset it to hidden each open so
        // a fresh (unanswered) letter starts with no exit but the in-letter UI.
        setCloseX(false);

        // Whole-letter reveal (cascade) — May 2026 rework. The previous
        // tap-to-continue paragraph reveal made the letter feel like a
        // gameplay event with N steps. A real letter is opened and read in
        // one motion. Now: render every paragraph immediately, stagger
        // the .shown opacity transition so they cascade in over ~1.5s,
        // then fade in the signature + reply actions. No tap required to
        // advance. Owner can still scroll naturally if the letter is long.
        const paragraphs = content.paragraphs;
        if (tapHint) tapHint.style.display = 'none'; // no longer needed

        // Build all paragraphs at once.
        paragraphs.forEach((text) => {
            const p = document.createElement('p');
            p.className = 'letter-paragraph';
            p.textContent = sub(text);
            bodyEl.appendChild(p);
        });

        // Stagger the reveal so paragraphs fade in one-by-one (240ms apart).
        // The first paragraph appears almost immediately; the last is in
        // view by the time the player would naturally finish reading the
        // first few lines. Total cascade time ~= paragraphCount * 240ms,
        // capped so very long letters don't make the player wait too long.
        const STAGGER_MS = 240;
        const staggerCap = Math.min(STAGGER_MS, Math.max(120, 1800 / Math.max(1, paragraphs.length)));
        const allParas = bodyEl.querySelectorAll('.letter-paragraph');
        allParas.forEach((p, i) => {
            setTimeout(() => p.classList.add('shown'), 80 + i * staggerCap);
        });

        // Signature + reply actions fade in after the last paragraph reveal.
        const totalRevealMs = 80 + (allParas.length * staggerCap) + 250;
        let _actionsRendered = false;
        setTimeout(() => {
            if (sigEl) sigEl.style.opacity = '1';
            if (actions) actions.style.opacity = '1';
            if (!_actionsRendered) {
                _actionsRendered = true;
                try { renderActions(); }
                catch (err) { try { console.warn('[letter] renderActions failed', err); } catch (_) {} }
            }
            // Safety net: if NOTHING rendered into the actions area (no reply
            // choices and no Keep/Share), reveal the ✕ so the player can never
            // be trapped in a letter with no exit at all.
            try { if (actions && actions.children.length === 0) setCloseX(true); } catch (_) {}
        }, totalRevealMs);

        function close() {
            // (onTap removeEventListener removed May 2026 — no longer using
            //  tap-to-reveal-next-paragraph; whole letter shows on open.)
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
                    renderReplyChoices(char, content.replies, /*ViaTable*/false);
                    return;
                }
                // Legacy fallback (kept for any future char that hasn't been
                // migrated yet — currently every authored char has inline
                // replies, but the safety net stays).
                if (typeof REPLIES !== 'undefined' && (REPLIES[char] || REPLIES._default)) {
                    renderReplyChoices(char, REPLIES[char] || REPLIES._default, /*ViaTable*/true);
                    return;
                }
            }

            // CASE B: REPLAY of a first letter.
            if (mode === 'replay' && opts.kind === 'first' && opts.char) {
                const stored = getReply(opts.char);
                if (stored) {
                    // Already replied — surface YOU WROTE + followup as a quoted
                    // thread, just like milestones do. Find the followup
                    // paragraphs from the template that match the stored tone.
                    let followup = null;
                    try {
                        const tpl = TEMPLATES[opts.char] || TEMPLATES._default;
                        if (Array.isArray(tpl.replies)) {
                            const match = tpl.replies.find(r => r && r.tone === stored.tone);
                            if (match && match.followup) followup = match.followup;
                        }
                    } catch (_) {}
                    renderRepliedThread(opts.char, /*Tier*/null, Object.assign({}, stored, followup ? { followup } : {}));
                } else {
                    // Not yet replied — offer the reply choices so the player can
                    // still write back when re-reading from the archive. The
                    // replay content carries no replies, so pull them from the
                    // template by char.
                    const ftpl = TEMPLATES[opts.char] || TEMPLATES._default;
                    if (ftpl && Array.isArray(ftpl.replies) && ftpl.replies.length) {
                        renderReplyChoices(opts.char, ftpl.replies, /*viaTable*/false);
                        return;
                    }
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
                renderReplyChoices(char, content.replies, /*ViaTable*/false);
                return;
            }

            // CASE D: REPLAY of a milestone.
            if (mode === 'replay' && opts.tier) {
                const past = milestoneReplyChosen(opts.char, opts.tier);
                if (past) {
                    renderRepliedThread(opts.char, opts.tier, past);
                } else {
                    // Not yet replied — surface the reply choices from the
                    // milestone template so the player can still write back when
                    // re-reading from the archive (replayContent carries no
                    // replies, so look them up by char+tier).
                    const mtpl = (MILESTONE_LETTERS[opts.char] || {})[opts.tier];
                    if (mtpl && Array.isArray(mtpl.replies) && mtpl.replies.length) {
                        renderReplyChoices(opts.char, mtpl.replies, /*viaTable*/false);
                        return;
                    }
                }
            }

            renderKeepShare();
        }

        // Render the 3 reply choice cards.
        // `replies` is either an object keyed by tone (legacy) OR an array.
        function renderReplyChoices(char, replies, viaTable) {
            // Unanswered letter — no ✕. The player must pick a reply to proceed.
            setCloseX(false);
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
                    // Replay-of-a-milestone counts as a milestone reply too, so
                    // it persists to the milestone key (not the first-letter
                    // key) when the player writes back from the archive.
                    const isMilestone = ((mode === 'milestone' || mode === 'replay') && !!opts.tier);
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
                    if (r.aff) {
                        // In replay mode `game` is a stub ({selectedCharacter}),
                        // so prefer the live game instance when it's the same
                        // character — that keeps the in-memory affection in sync
                        // (bumpAffection always persists to localStorage anyway).
                        const _bumpChar = isMilestone ? opts.char : char;
                        const _liveGame = (window._game && window._game.selectedCharacter === _bumpChar)
                            ? window._game : game;
                        bumpAffection(_liveGame, _bumpChar, r.aff);
                    }

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
            // Sign the reply in the player's own hand ("— Aria"). Omitted
            // gracefully if no name was ever set.
            const pn = playerName();
            wrap.innerHTML =
                '<div class="letter-you-wrote-label">YOU WROTE</div>' +
                '<div class="letter-you-wrote-text">' + escapeHtml(text) + '</div>' +
                (pn ? '<div class="letter-you-wrote-sign">— ' + escapeHtml(pn) + '</div>' : '');
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
            // Attribute the reply by the character's name ("ALISTAIR'S REPLY")
            // instead of a generic "THEY REPLIED". Resolve the same way
            // renderActions() resolves the char for this overlay.
            const replier = (mode === 'replay' || mode === 'milestone')
                ? (opts && opts.char)
                : (game && game.selectedCharacter);
            const replierLabel = charDisplayName(replier).toUpperCase() + '’S REPLY';
            head.innerHTML =
                '<div class="letter-followup-label">' + escapeHtml(replierLabel) + '</div>' +
                (followup.title ? '<div class="letter-followup-title">' + escapeHtml(sub(followup.title)) + '</div>' : '');
            bodyEl.appendChild(head);

            (followup.paragraphs || []).forEach(p => {
                if (!p || !p.trim()) return;
                const el = document.createElement('p');
                el.className = 'letter-paragraph letter-paragraph-followup';
                el.textContent = sub(p);
                bodyEl.appendChild(el);
                requestAnimationFrame(() => el.classList.add('shown'));
            });

            if (followup.signature) {
                const sig = document.createElement('div');
                sig.className = 'letter-followup-signature';
                sig.textContent = sub(followup.signature);
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
            // The letter is now closeable — reveal the ✕ exit alongside Keep/Share.
            setCloseX(true);
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
            // Owner-requested May 2026: after Keep, surface the letters
            // archive instead of dropping the player straight back onto
            // the care screen. Gives the player agency — they can re-read
            // earlier letters or choose to leave on their own. The archive
            // overlay is rendered above the in-game state, so closing it
            // returns the player to whatever they were doing.
            keep.onclick = (e) => {
                e.stopPropagation();
                close();
                // Defer until the close transition finishes (~400ms) so
                // the two overlays don't fight for the screen.
                setTimeout(() => {
                    try {
                        if (window.PPLettersArchive
                            && typeof window.PPLettersArchive.open === 'function') {
                            window.PPLettersArchive.open();
                        }
                    } catch (_) {}
                }, 480);
            };
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
                    // ── CONTINUITY FIX (May 2026) ────────────────────────
                    // Was: "writing to you for the first time" — but the
                    // player has already received "A Knight's Letter" from
                    // the auto-fire system. Owner caught the contradiction.
                    // Now: acknowledges the prior letter, preserves the
                    // rule-breaking voice without claiming a false first.
                    `Mi'lady. I am writing again. I told myself the first one was a one-time admission. *Small cough.* The man holding this quill is, evidently, a poor liar. I have broken the rule a second time. I am starting to suspect the rule was always the wrong one.`,
                    `I caught myself between watches today, thinking about the way you say my name. Not the title. The name. *Small admission.* I had not realised it was different until it was different. I am older than this revelation should make me feel.`,
                    d.timesTalked > 3
                        ? `You have given me ${d.timesTalked} conversations. I have catalogued them. The captain would mock me. He would also be wrong to. There is value in noticing what is given.`
                        : `I do not need words from you to know you came back. I read the way you set down the cup. I read the way you stand near the candle and not the door. I am, apparently, not bad at reading.`,
                    `Tomorrow, I will be at the south wall before the fourth bell. I will not say I hope you walk past. A knight does not hope; he is. But the wall is southward. And you sleep in the south wing. I leave it there.`,
                    `Burn this if you wish. I will know either way.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 3,
                        text: `I will walk past the south wall before the fourth bell. Look up.`,
                        followup: {
                            title: 'Before the Fourth Bell',
                            signature: '— A.',
                            paragraphs: [
                                `*The reply came within the hour, by the same door.* You will walk the wall. Mi'lady, I have held that post through two sieges and a winter that killed the well, and tomorrow is the first watch I have ever counted the hours toward. The battlements will not know what to make of me.`,
                                `If you wave, protocol allows me one nod. Slow, the kind a man spends on the thing he means to keep. *Small.* After the fourth bell I am off duty. There is a bench below the south stair with a view of nothing at all. I find I want to show it to you anyway.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 2,
                        text: `Break the rule a third time. I will keep every letter you send.`,
                        followup: {
                            title: 'Standing Orders',
                            signature: '— A.',
                            paragraphs: [
                                `A third time, then. You have my word, and my word is the only coin I have ever minted myself. *Small.* I sat with the old rule last night to see what it was guarding. It was guarding me from exactly this. I have relieved it of duty.`,
                                `The standing orders of one knight are hereby amended. Letters are permitted. Keeping them is encouraged. *Underlined.* Hold me to this, mi'lady. I am counting on you to.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 1,
                        text: `Burn it? I have read it four times already, Captain.`,
                        followup: {
                            title: 'On the Matter of Burning',
                            signature: '— A.',
                            paragraphs: [
                                `*The first line is crossed out. The second line is also crossed out. He kept the third.* Four times. I called a drill count wrong this morning, one I have called clean for twenty years, and blamed the wind. The recruits checked the flags. There was no wind. I am told my ears went red.`,
                                `The offer of the fire is withdrawn. Keep the letter. *Small cough.* I will write the next one knowing it gets read four times. That is a dreadful thing to learn about your own spelling. I will manage.`
                            ]
                        }
                    }
                ]
            },
            midnight: {
                title: 'Folded by the Candle',
                signature: '— A.',
                paragraphs: (d) => [
                    `Mi'lady. I leave this by the candle. I suspect you will find it before I find the words to say it.`,
                    `I slept. Through the night. For the first time since I was eleven. I do not know what to do with that fact yet, except keep being grateful for it. So: thank you.`,
                    d.timesTalked > 5
                        ? `I have been a knight for twenty years. I have been a man for one night. You have been the only person in my entire watch to see the second.`
                        : `You did not ask anything of me. That is the part I am still studying. A knight understands obedience. He does not understand being given peace.`,
                    `Come to the gate at dusk. I will not be in armour. A precedent. *Small confession.* I would like to set more of them with you.`,
                    `Please burn this if it embarrasses either of us. I will not have written it. But I did write it.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: 'Sleep, Captain. I will be here when you wake.',
                        followup: {
                            title: 'A Note Folded Twice',
                            signature: '— A.',
                            paragraphs: [
                                `You wrote "Captain." I felt it in the candle wax before I read the ink. *Small.* I have been Captain to a thousand men. Tonight it sounded different.`,
                                `I would like to make Sundays a thing between us. A precedent. A knight without armour at sunset, on the wall, with you. Will you say yes? *Softer.* Of course you will. You already did.`
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
                                `*Reads it twice. Then a third time.* You used the word ALLOWED. That is, I had not realised how badly I needed someone to give me permission. A knight is taught to grant himself nothing. You handed it to me on a folded piece of parchment.`,
                                `Tomorrow at the watch, bring nothing. Stand near the brazier. Let me look at you for a little while. That is what I am asking for. *Small.* You are allowed to say no. I will not have meant any of this if you did not feel free to.`
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
                                `*The writing is shakier here, he is laughing as he writes.* Mi'lady. A vow sworn while unconscious is, at best, irregular protocol. I will accept it anyway. Do not tell the captain.`,
                                `*Adds, more carefully.* I have not laughed at the desk in twelve years. You did that to me, in a letter, with one sentence. I am keeping the page. I am keeping you.`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: 'Wednesday: A Quiet List',
                signature: '— Yours, A.',
                paragraphs: (d) => [
                    `It is Wednesday. I have begun keeping lists on Wednesdays. Not patrol lists. Yours.`,
                    `On the list this week: the way you set the kettle down without looking. The new plant on the south sill. The pair of boots by the door that are not mine and have stayed long enough that the floor has remembered their weight.`,
                    `*Small, careful.* I want to be clear, in writing, that I notice these things on purpose. A knight is trained to scan the perimeter for threats. I have repurposed the training. I scan for what I am keeping. You are most of it.`,
                    d.affectionLevel >= 4
                        ? `Captain asked me yesterday if I was being well-fed. I laughed. Out loud. He looked at me as if I had grown a second head. I have not laughed at his desk in twelve years. I told him: yes, captain. Better than that. I did not explain. He did not ask twice.`
                        : `I am not the man my recruits remember. That is fine. He was a good knight and a tired one. The new one is a good knight and a slept one. Both are mine. Both are yours.`,
                    `Tomorrow we eat at the long table again. I will not arrive late. *Underlined.* I have stopped being late on purpose. That is a small thing and the most domestic admission I have ever set in ink.`,
                    `Yours, on a Wednesday, without ceremony.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: `Keep the list, Captain. I keep one too. You are most of it.`,
                        followup: {
                            title: 'Two Lists',
                            signature: '— Yours, A.',
                            paragraphs: [
                                `*He read that line at the watch desk and stayed past the change of guard.* You keep one too. Mi'lady, I have been inventoried. *Small.* No quartermaster in the king's service has ever done it so gently.`,
                                `A proposal, then. One item traded per Wednesday, at the long table. I will open: the way you pretended it was ordinary when I arrived on time. That entry appears on my list twice. I do not make duplication errors. It earned the second line.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: `The boots are staying. So am I. Plan your Wednesdays accordingly.`,
                        followup: {
                            title: 'Provisions Made',
                            signature: '— Yours, A.',
                            paragraphs: [
                                `Plan accordingly. I have. *Small, careful.* There is a second hook beside the door as of six this morning, set with the good nails before my watch. A man can say a great deal with hardware while the plain words are still in training.`,
                                `The floor remembers your boots. The door now expects them. I am informing you formally that the household follows the door's lead. *Underlined.* Its knight included.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: `A knight who lists kettles. Your recruits would riot, Captain.`,
                        followup: {
                            title: 'Let Them Riot',
                            signature: '— Yours, A. (unrepentant.)',
                            paragraphs: [
                                `*The pen pressed hard here. He is amused and pretending to be above it.* Let them riot. I have put down riots. I have yet to put down a kettle without thinking of you, which is the greater tactical problem, and I decline to solve it.`,
                                `The list stands, kettle included. *Small.* You hold the top of it, filed where I keep the things a riot could not take from me.`
                            ]
                        }
                    }
                ]
            },
            // ── NEGLECT (Phase 2 — re-fireable "it remembered" letter) ────
            // Delivered when the player lets Alistair decline (thin care)
            // AFTER the relationship exists. Re-arms once he's nursed back to
            // health, so each neglect EPISODE earns exactly one letter.
            neglect: {
                title: 'The Unanswered Watch',
                signature: '— Alistair',
                paragraphs: (d) => [
                    `You have not come in some days. I noticed. A knight notices a gap in the watch, and yours is the one I keep checking.`,
                    `I am not writing to summon you. A summons is a thing you owe, and you owe me nothing. I wanted that on the page before the rest of it.`,
                    `Have I done something wrong? If I have, I would rather be told than left to guess at it. I am good at standing post. I am bad at not knowing what I am standing for.`,
                    `The candle has gone down to a stub again. I keep lighting new ones. It is a foolish habit and I have decided to keep it.`,
                    `Come back when you are able. That is all I am asking. I will be here, which is the one thing I have always known how to be.`
                ]
            },
            // ── DEVOTED (Phase 2 — the warm counterpart to neglect) ───────
            // Fires when the player has been especially attentive (high
            // affection + high care). Re-arms only after the bond dips, so it
            // stays a rare treasure rather than a recurring nag.
            devoted: {
                title: 'The Quiet, Filled',
                signature: '— Alistair',
                paragraphs: (d) => [
                    `The barracks are too quiet tonight, and I have finally worked out why. You were here today, and you left, and the quiet you leave behind is a different shape than the quiet I had before you.`,
                    `I am writing this one because I want to, not because something is wrong. I want that on the record. A knight files reports when there is a problem. There is no problem. There is only you, and the fact that I have started measuring good days by whether I saw you in them.`,
                    `You have been kind to me past the point where I had a defence ready for it. I kept waiting to feel like I owed you something. The feeling never came. What came instead was steadier, and I do not have a soldier's word for it, so I will use the plain one. I am happy. You did that.`,
                    `I caught myself smiling at the wall today. A recruit saw. I let him keep the mystery. Some things are mine.`,
                    `Come back tomorrow. The watch is better with you in it, and I have decided to stop pretending otherwise. The candle will be lit. It usually is, now.`
                ]
            }
        },
        // ── Elian — chosen / midnight / aftermath ─────────────────────────
        elian: {
            chosen: {
                title: 'Notched on the Doorframe',
                signature: '— E.',
                paragraphs: (d) => [
                    `I notched the doorframe again this morning. I told myself the notches were for tracking weather. I checked. They are not.`,
                    `The forest is louder when you have just left. I had forgotten quiet was a thing you noticed by its absence. I had been mistaking it for the way the world was.`,
                    d.timesFed > 4
                        ? `You have fed me ${d.timesFed} times. Out here food is what you find or what you kill. You did neither. You brought it. I have stopped pretending that means nothing.`
                        : `I made coffee twice this week. One was for you in case you came. You did not come that day. I drank both.`,
                    `Come back tomorrow. There is a thing I am not yet ready to tell you under the rowan. *Crossed out.* I am ready. I am writing it down so I cannot back out. *Underlined.* Tomorrow.`,
                    `— E.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 3,
                        text: `Then tell me under the rowan. I will come at first light.`,
                        followup: {
                            title: 'First Light, Then',
                            signature: '— E.',
                            paragraphs: [
                                `*The ink is steadier here, like he wrote it standing.* First light, you said. I was awake before it. I have been waking before first light for nineteen years and never once been glad of the habit. This morning I was glad.`,
                                `Come to the rowan. I will have the words ready, or I will have my hands ready to say it for me. With you I think it might be both.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 2,
                        text: `Notch it for weather if it's easier. I already know what it means.`,
                        followup: {
                            title: 'Weather, and Other Lies',
                            signature: '— E.',
                            paragraphs: [
                                `*Crossed out: the word "weather."* I will not call them weather anymore. A tracker who lies to himself goes blind to everything true, and I would rather read you clearly than keep the comfort of the lie.`,
                                `Come tomorrow. The doorframe is running short of clean wood. I will need a second one soon. I find I do not mind the carpentry.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 1,
                        text: `Coffee for two, and you drank both. Tragic, woodsman.`,
                        followup: {
                            title: 'The Second Cup',
                            signature: '— E.',
                            paragraphs: [
                                `*There is a smudge here that might have been a laugh.* I drank both because pouring one out felt like giving up on you, and I am poor at giving up on things. Ask the brambles. Ask anything out here with roots.`,
                                `Tomorrow I make two and drink one. The other stays yours. Be the reason the second cup goes warm instead of wasted.`
                            ]
                        }
                    }
                ]
            },
            midnight: {
                title: 'Carved on Bark',
                signature: '— E.',
                paragraphs: (d) => [
                    `You said her name. You said it kindly. The forest has been different since.`,
                    `I walked the south path this morning. The brambles were tighter than I remembered, and the rowan tree was warmer than usual. That is not a metaphor. The bark was actually warm. I checked.`,
                    d.timesGifted > 0
                        ? `You left a thing at the door yesterday. I have not moved it. I keep walking around it. The cabin is small. The walking around is, well, I notice myself doing it. Forgive me. I am slow with kept things.`
                        : `I am leaving this on your doorstep, yours, I mean, wherever you sleep. The bark is from the tree we stood at. It is allowed to be away from the trunk now. It has been kept long enough.`,
                    `Come back tomorrow. Bring nothing. *Crossed out, then rewritten.* Bring yourself. I have been told that is a thing to ask for.`,
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
                                `*The parchment is rougher than usual, torn from a foraging journal.* I cut a small mark in the rowan last night. Not a name. A line. A shape my grandmother used for "remembered." The trees noticed. The trees say so when they notice. They are quieter now. The good kind of quiet.`,
                                `Come at dusk. I will not say her name aloud. You already did. That was enough for both of us. *Small.* Walk slowly on the south path. The bramble has loosened. I think it knows you, too.`
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
                                `*Written by candle, slow, no crossings-out, he meant every word the first time.* I have not trusted anyone with her name in a hundred and forty years of the keepers' line. I watched my grandmother die without saying it aloud. *Quiet.* I told you because I knew. There is no other way I can phrase it. I knew.`,
                                `Come back tomorrow. Bring something to eat. *Crossed out.* I will bring something to eat. That is the new arrangement. A keeper feeds the person he trusts. That is the rule of this cabin now.`
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
                                `*Half a smile in the ink.* A small list, you said. I had not thought of it as a list. Now I cannot stop counting it. The list is two. *Under the line.* I would like the list to stay two. For a while. Then maybe more. Slowly.`,
                                `*Adds, careful.* Don't joke about being on the list, please. That joke would land differently than the others. I am not yet ready to laugh at it. I will be. Be patient.`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: 'Two Sets of Boots by the Door',
                signature: '— E.',
                paragraphs: (d) => [
                    `There are two pairs of boots by the door now. Yours are smaller. They have begun to leave their print on the mat in the same place every time. The mat is starting to remember you. *Small, dry.* I noticed the mat before I noticed the rest of the cabin had changed. Predictable.`,
                    `Walked the rowan circuit at dawn. The second letter on the trunk is set. I did not start the third. *The next line is in different ink, written later.* I started the third. I lied above. Forgive me. I am keeping the carving slow on purpose because I do not want to finish your name. I would like there to always be one more letter to put in the tree.`,
                    d.affectionLevel >= 4
                        ? `Stew tonight. Twice as much as I used to make. The cabin smells like a place. It used to smell like a way of waiting. That is, I think, an improvement.`
                        : `I left the lantern on the south path lit. In case you walk back from town after dark. I have never left a lantern lit for anyone before. The lantern was offended. It got over it.`,
                    `Come tomorrow. Don't knock. The door is yours.`,
                    `— E.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: `The door is mine, then. So is the man who left it open.`,
                        followup: {
                            title: 'The Man Who Left It Open',
                            signature: '— E.',
                            paragraphs: [
                                `*He wore a soft spot into the paper reading that line.* The man who left it open. I have been a warden and a tracker, a digger of graves when it came to that. No one has named me by the thing I chose to do instead of the thing the years made me. You did. I am keeping the name.`,
                                `Come tomorrow. I left the door open last night to see if I could stand it. I could, barely. Do not test how long I can keep that up.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: `Finish my name when you're ready. I'm not going anywhere.`,
                        followup: {
                            title: 'The Last Letter',
                            signature: '— E.',
                            paragraphs: [
                                `I started the last letter of your name this morning and stopped halfway, the way I always do. You said you are not going anywhere, so I can leave it half-cut and trust the trunk to hold it. I have never trusted anything to hold without finishing it first.`,
                                `Come tomorrow. Bring nothing. There will be stew on the fire and a knife and an unfinished name in the bark. That is the most settled I have been since before the graves.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: `Two boots today. Two mugs next. Slippery slope, keeper.`,
                        followup: {
                            title: 'The Slope',
                            signature: '— E.',
                            paragraphs: [
                                `*Dry.* A slope, you call it. I read slopes for a living. I know how this one ends and how little chance there is of climbing back out of it. I walked toward it on purpose, slow, with my eyes open.`,
                                `Bring the second mug if you mean to speed the slide. I have stopped pretending I would rather stay at the top.`
                            ]
                        }
                    }
                ]
            }
        },
        // ── Lyra — chosen / midnight / aftermath ──────────────────────────
        lyra: {
            chosen: {
                title: 'A Verse the Cave Keeps Singing',
                signature: '— L.',
                paragraphs: (d) => [
                    `*The parchment is salt-stained at the edges, the way all things in the cave eventually are.* I wrote a verse this week. I was not going to write any verses this season. The cave had other ideas. It usually does.`,
                    `It begins: "the boy with the warm hands came back, and the tide forgave the rock for being still." I am not the boy. You are not warm-handed. Songs are liars and also true. I am keeping it.`,
                    d.timesGifted > 0
                        ? `You left ${d.timesGifted} ${d.timesGifted === 1 ? 'thing' : 'things'} in the tide-pool. I have stopped pretending I do not know which pool you mean. The pool is fuller than the rest of the cave now. A song that has only one full pool is, *Trails off,* anyway. I noticed.`
                        : `The gulls have started waiting near the shelf I sing on. They were not waiting before. I think they are listening for a verse my line does not know. They are right to. I am writing one.`,
                    `Come at dusk. The cave is warmer at dusk for reasons I refuse to investigate. The rocks like you. They told me. Do not ask me how.`,
                    `— L.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 3,
                        text: `Keep the verse. Sing it at dusk. I will come and sit still for it.`,
                        followup: {
                            title: 'Sung Once, At Dusk',
                            signature: '— L.',
                            paragraphs: [
                                `*The parchment smells of dusk; she wrote this while the last of it was still on the water.* You sat still for it. Paramour, the last creature who sat still for my singing did so because the song had taken its will. Yours stayed your own the whole verse. The cave has not stopped talking about it.`,
                                `The verse grew a second line while you were still climbing the rocks home. It stays off the page. Verses given in ink lose their salt. Come back at dusk and collect it the proper way, from my own mouth.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 2,
                        text: `Songs are liars and also true. I can tell which parts of yours are true.`,
                        followup: {
                            title: 'The True Parts',
                            signature: '— L.',
                            paragraphs: [
                                `You can tell. *There is a gap here, as if she set down the quill and stood by the water a while.* Centuries of singing, and no listener has ever offered to sort the true from the pretty. My line builds songs the way the sea builds caves. Even we lose track of which hollows are load-bearing.`,
                                `So I will confirm one thing in ink, where I cannot make it beautiful: the tide forgave the rock. The rest you may audit at dusk, in the third pool, where the acoustics keep me honest.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 1,
                        text: `Tell the rocks I like them back. The gulls will simply have to cope.`,
                        followup: {
                            title: 'The Rocks Are Insufferable Now',
                            signature: '— L. (outnumbered.)',
                            paragraphs: [
                                `*The hand is regal. The content is not.* I told them. I want it recorded that a queen of this coast stood in her own cave and relayed a compliment to geology. The rocks have been warm all day. Smug, it turns out, is a temperature.`,
                                `The gulls found out anyway. Everything on this shore reports to me except the gossip. Come at dusk and be seen liking me where the rocks can witness it. They have requested this. I have elected not to argue with an audience that agrees with me.`
                            ]
                        }
                    }
                ]
            },
            midnight: {
                title: 'The Verse, Returned',
                signature: '— L.',
                paragraphs: (d) => [
                    `You did not hum it back. Thank you. *Small relief, that is the first real one I have felt in a year.* A song unrepeated is a song still mine. A song still mine is a thing I had not allowed myself to write.`,
                    `I have been writing again. The fourth verse, paramour. The one I did not even know was there. It comes after the third like dawn comes after a tide. I did not write that line. The cave did. I am only the scribe.`,
                    `*The next line is salt-stained, water has touched it, then dried, once or twice in the same place.*`,
                    d.affectionLevel >= 3
                        ? `I sang the second verse to a passing gull this morning. The gull did not drown. That has not happened in my line for two centuries. I am almost afraid to keep going. Almost.`
                        : `The cave has been warmer since you left. I did not light anything. I think it is keeping the heat YOU left in the stones. I sit where you sat. That is a confession.`,
                    `Come at low tide. The shells will be open. One of them will have this letter in it. *The third one from the left.* Do not mistake which one. Do not eat any of them. *Small drawing of a heart, then crossed out, then redrawn smaller, then left.*`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: 'Your secret. I will carry it with you.',
                        followup: {
                            title: 'A Verse for One',
                            signature: '— L.',
                            paragraphs: [
                                `*Water-stained at the corner; she wrote this with damp hands.* A song carried by two is a song that does not drown anyone. That is rare in my line. That is, *Quiet,* that is the new rule. I am writing under it.`,
                                `The fifth verse will be ours. Yours, mine, the cave's. I will sing it once, to you, in the third pool. I will not write it down. *Small drawing, two notes nested.* Come at low tide. Bring nothing. Already told you not to bring anything. Liked saying it.`
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
                                `Heard. Kept. Not spoken. You used three words. I had been afraid you would use more. *Small, real relief.* You knew the shape of what I needed. A siren can tell. We can always tell.`,
                                `Stay through the next tide. Sit on the shelf I sing from. Don't speak. *Crossed out, replaced.* Speak if you want to. But you don't have to. That is the gift.`
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
                                `*The writing is shaky with held laughter.* I did consider it. Briefly. As a service to the bargain. Then I remembered: I want you upright. Specifically. *Underline.* Sorry, paramour. The siren in me will be polite this season.`,
                                `Come at low tide. I have a verse that was supposed to end in a drowning. I have rewritten the ending. It is now a "and then they had supper." Disgraceful. *Small heart, drawn carelessly, kept anyway.*`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: 'The Tide Is Bringing Things Back',
                signature: '— L.',
                paragraphs: (d) => [
                    `*Written on dry parchment for once, the cave-mouth has stopped flooding into where I write.* Something happened this morning. A piece of polished sea-glass washed up at the cave-mouth. Blue. My mother's colour. The tide has not brought my line a kept thing in eighty years. It is bringing things back. I think it can tell.`,
                    `I sang the fourth verse twice this week. Both times nothing died. That is not a low bar to me. That is a revolution.`,
                    d.affectionLevel >= 4
                        ? `The cave has stopped echoing wrong when you arrive. *Small, near-laugh.* I have spent two years tuning the cave to my own grief. It is retuning to your footsteps. I do not blame it. I am tuning to your footsteps too. We are unlearning a long quiet together, the cave and I.`
                        : `I left a clamshell at your door, the third pool's flat one. Inside is a verse only one human has ever heard sung in full. I will not ask if you read it. *Small.* I will only know by whether you come back smiling.`,
                    `Stay through the next tide. There is a thing I want to teach you about how the cave breathes. It breathes through me. It is starting to breathe through you. I have not been afraid of that in three days. *Underlined.* Three days. Possibly a record.`,
                    `— L.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: `Teach me how the cave breathes. I will stay past the tide, and past that.`,
                        followup: {
                            title: 'The First Lesson',
                            signature: '— L.',
                            paragraphs: [
                                `*Written on the dry shelf, unhurried, the hand of a queen with nowhere older to be.* Past that, you wrote. I read it at low tide and the water held still a moment longer than the moon allows. The sea reads my letters over my shoulder. I am choosing to take the stillness as a bow.`,
                                `The first lesson is short. The cave breathes on the swell, and it has begun timing itself to your step on the rocks. You already breathe with it. What remains is teaching you to notice. Come at low tide. Class is one student and enrollment is closed.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: `Three days without fear is a record. We will make it four.`,
                        followup: {
                            title: 'Four, Then Counting',
                            signature: '— L.',
                            paragraphs: [
                                `Four, you said. *The ink is even here, and there is a small tally begun in the margin.* My line counts in centuries. We count grief that way, and exile the same. You have the queen of this cave counting in days now, small numbers a hand can hold.`,
                                `Day four is underway as you read this. The sea-glass sits on the shelf where the letters live. Blue keeps well up there. Stay through the tide when you come. A record wants witnesses.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: `Two songs and nothing drowned. Careful, majesty. That is nearly a streak.`,
                        followup: {
                            title: 'Regarding the Streak',
                            signature: '— L. (undefeated.)',
                            paragraphs: [
                                `*The royal hand is spoiled slightly by amusement.* Nearly a streak. Paramour, I have held notes that pulled ships off their course, and you stand in my cave keeping score like a tavern regular. I have decided to allow it. The cave keeps the tally carved somewhere I decline to disclose.`,
                                `I sang the fourth verse again this morning. The gulls stayed. Nothing so much as coughed. That is three, by your counting. *Small drawing of a wave, or a crown, she would say it depends on the light.* Bring supper when you come. Champions eat.`
                            ]
                        }
                    }
                ]
            }
        },
        // ── Caspian — chosen / midnight / aftermath ───────────────────────
        caspian: {
            chosen: {
                title: 'A Note From the Garden Bench',
                signature: '— C.',
                paragraphs: (d) => [
                    `I am writing this on the south garden bench at dawn. The court would consider this scandalously rustic. Good.`,
                    `I noticed something this week and I am setting it down before I lose it: my charm has been off-duty when you are in the room. *Small, marvelling.* I had not noticed I had two settings. I had been using charm-as-armour for so long it felt like skin. Apparently it is not.`,
                    d.timesFed > 3
                        ? `You fed me at the long table on Tuesday. A footman tried to step in. I waved him off. He looked horrified. *Underlined.* I would do it again. Send my apologies to the footman.`
                        : `I drafted a speech this week and crossed out the third paragraph because it sounded like my grandmother. A small treason. She would notice. She has not, yet. She will. I am rehearsing for it.`,
                    `Tea tomorrow at four. Wear nothing fancy. That is an instruction, not a preference. *Crossed out, then rewritten in worse handwriting.* A request, then. A request from a prince who is learning to make them.`,
                    `Yours, and not the court's, this morning. C.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 3,
                        text: `Four o'clock, then. Bring the prince from the bench, and leave the charm off-duty.`,
                        followup: {
                            title: 'The Bench, Held',
                            signature: '— C.',
                            paragraphs: [
                                `*Written at dawn, on the same bench.* You asked for the prince from the bench. He is the one holding the pen. His posture is worse and his sentences run long. You have named him the preferred edition anyway. The court prints a different version of me. Yours is the original, kept off the record.`,
                                `Four o'clock stands. I have told the kitchens: the plain cups, the teapot that pours true. My grandmother inspected the tray order and found nothing worth objecting to. She was wrong, quietly, and I intend to keep it that way.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 2,
                        text: `Practice your requests on me. I will grant the easy ones first.`,
                        followup: {
                            title: 'Requests, In Proper Form',
                            signature: '— C.',
                            paragraphs: [
                                `You offered to grant the easy ones first. *Small.* Sensible policy. Here is one, submitted in proper form: come at half past three. I want the quarter hour before the tea, when nothing has been poured and nothing is expected of either of us.`,
                                `I drafted that request twice. The first draft apologised for asking. I have struck the apology and kept the asking, which my tutors would tell you is the whole art of statecraft. They never mentioned it works on benches.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 1,
                        text: `My least fancy dress, at four sharp. The footman may faint.`,
                        followup: {
                            title: 'Apologies to the Footman',
                            signature: '— C. (co-conspirator.)',
                            paragraphs: [
                                `The footman has been warned. He has, in fact, requested Tuesday off, citing cumulative shocks to the household order. I granted it with full honors. We are both learning what can be survived.`,
                                `Wear the plainest thing you own. I will match you, to the horror of my valet, who has already hidden the good doublets on suspicion. Between us we may achieve the least fashionable table this palace has seated in a century. I intend to enjoy every minute of it.`
                            ]
                        }
                    }
                ]
            },
            midnight: {
                title: "From the Prince's Own Hand (Not the Scribe's)",
                signature: '— Caspian',
                paragraphs: (d) => [
                    `I am writing this myself. Again. My scribe will be confused. *Small, dry.* I will explain it to him as a hobby. He will believe me. People believe princes about their hobbies.`,
                    `Last night I told you the kingdom is in my pocket. I want to be clear, in writing, where the people I love are positioned. They are not in the same pocket as the kingdom. They are nearer my heart. There is no other way to phrase it. The architecture of jackets does not have a metaphor for this.`,
                    d.timesFed > 0
                        ? `I ate your food at noon today. I did not realise I was doing it until the second cup. A prince notices everything he is given. When he stops noticing, he is being loved. *Small, marvelling.* I have been loved. I had not noticed.`
                        : `My grandmother walks the south corridor every morning at six. I have been making different choices about that corridor lately. She has not noticed yet. She will. I am ready for it.`,
                    `Tea tomorrow. I will not pour it before you ask. *Crossed out.* I will pour it before you ask. *Underlined.* I always do, and I am keeping the habit. It is one of the few I am not abdicating.`,
                    `Yours. Without ceremony. Which is to say: actually mine, actually yours.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: 'Keep the crown. I will be here whether you wear it or not.',
                        followup: {
                            title: 'A Letter Written at Five',
                            signature: '— Caspian',
                            paragraphs: [
                                `It is five in the morning. The seal is still warm. The letter is still unsent. I read your words and folded the abdication into the desk drawer with the small key that is always lost. *Quiet.* I am keeping the title. Because you are not asking me to give it up. You are asking me to USE it. Different work. Same prince. Worthier prince.`,
                                `Tea at four. I will be in the small parlour, not the throne room. *Honest.* That is part of the new arrangement. Yours, without ceremony, and now also without the abdication-in-the-drawer.`
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
                                `*Reads it three times. Lets it sit for an hour. Picks the pen back up.* You used the phrase "because you want to." I have not been allowed to want anything for my own reasons since I was six years old. *Quiet.* I will need a minute with that phrase. *Adds, after the minute.* I want to. I am here because I want to. Writing it twice so I believe it.`,
                                `Tea tomorrow. I will pour it because I want to. *Small smile in the ink.* A new doctrine. Yours, choosing.`
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
                                `MEMO. TO: the prince. FROM: the prince. RE: hours of operation for life-altering decisions.`,
                                `1. No major reorganizations of the realm before nine in the morning. 2. The seal of state shall not be heated for personal use. 3. Any abdication contemplated outside business hours shall be forwarded to the WEAVER for review. *Small, dry.* You drafted this for me, in one sentence. I have framed it. Yours, properly punctual.`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: 'A Sunday Letter, Inked Slowly',
                signature: '— Yours, C.',
                paragraphs: (d) => [
                    `I have made the scribe a Sunday. He is, presumably, somewhere. I am at the desk. Light is good. Tea is hot. The window is open and the orchard is being unreasonable about its blossoms.`,
                    `I am writing because nothing is on fire. That is not a sentence I have been able to write since I was eleven. The kingdom is not on fire. My grandmother is not winning. You are in the next room. I am, *Small, settled,* I am happy. On purpose. As a chosen state.`,
                    d.affectionLevel >= 4
                        ? `The council convenes Tuesday. I will be there. I have rewritten one paragraph of the Crown's annual address. The original said "the dynasty endures." Mine says "the kingdom is being looked at, finally, by people who love it." They will not approve. I am reading it anyway.`
                        : `Walked to the kitchens this morning. The cook startled. I told her I was looking for the second cup. She gave me three. I now have three cups on the desk. I do not know what I will do with two of them. I am keeping all three.`,
                    `Tomorrow we walk the orchard. No retainers. *Underlined.* I have informed the captain of the guard. He nodded as if I had announced rain. Apparently this is now a normal thing the prince does. I had not realised I had a normal.`,
                    `*Ink-blot, then.* Yours. Sundays especially.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: `Happy on purpose suits you. I will be in the next room every Sunday.`,
                        followup: {
                            title: 'The Ordinary Column',
                            signature: '— Yours, C.',
                            paragraphs: [
                                `*Inked slowly, again, on purpose.* Every Sunday, you wrote. I have entered it in the household ledger under standing arrangements, between the orchard's pruning and the winter candle order. The clerk asked no questions. It is now, officially, the most permanent thing on the page.`,
                                `I read treaties for a living and I know binding language when I see it. Yours was two sentences and it holds better than anything with a seal on it. The next room is yours. The desk has been turned to face the door.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: `You have a normal now. Guard it like the kingdom.`,
                        followup: {
                            title: 'Standing Orders',
                            signature: '— C.',
                            paragraphs: [
                                `Guard it like the kingdom. *Small.* I have guarded the kingdom with garrisons and treaties, and I have never once loved it at six in the morning with the tea going cold. The normal requires a different garrison. I have assigned myself.`,
                                `The captain now has it in writing: Sunday mornings the prince is occupied with matters of state. You are the matters of state. He suspects as much. Yesterday he bowed to the parlour door on his way past, to be thorough.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: `Keep writing these yourself. The scribe never once made me laugh.`,
                        followup: {
                            title: 'The Scribe, Consulted',
                            signature: '— C.',
                            paragraphs: [
                                `I showed the scribe your verdict. He read it twice, professionally offended, then allowed that my letters have improved since I began writing to someone in particular. He asked to keep a copy of yours for reference. Request denied. Some documents stay with the crown.`,
                                `You will have my own hand from now on, blots and all. The blots are load-bearing. They mark the places where I looked up to check you were still in the next room. You were. The record shows you always are.`
                            ]
                        }
                    }
                ]
            }
        },
        // ── Lucien — chosen / midnight / aftermath ────────────────────────
        lucien: {
            chosen: {
                title: 'A Footnote, Misplaced',
                signature: '— L.',
                paragraphs: (d) => [
                    `I have written a footnote in the wrong margin three times this week.¹ That is statistically significant. *Small.* The footnotes were all about you.`,
                    `¹ Specifically: Treatise on Resonance Decay, page 84, where I noted "subject prefers the third stair (creak removed)" instead of correcting the mass-formula error. The error remains uncorrected. I do not regret it.`,
                    d.timesTalked > 4
                        ? `You have spoken to me ${d.timesTalked} times. My catalogue of your speech patterns is now longer than my catalogue of celestial tides. *Quiet.* I am unsure what this says about my priorities. I am also unsure what it says about my heart.`
                        : `I noticed yesterday that I have begun timing my breaks to coincide with your visits. I had not been taking breaks. I have invented a habit, retroactively, to be near you. Scholarly rigor: 0. Personal honesty: improving.`,
                    `Come to the tower tomorrow. Bring nothing. *Crossed out.* Bring a book you have not read. I would like to watch you discover something. I have always loved that part most.`,
                    `— L. (the version of me that writes footnotes about you in the wrong margin)`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 3,
                        text: `I will bring a book I have not read. Watch all you like.`,
                        followup: {
                            title: 'Reading Conditions, Optimal',
                            signature: '— L.',
                            paragraphs: [
                                `Watch all you like, you wrote.¹ I have prepared the tower accordingly: the good chair moved to the south window, the lamp trimmed early. The kettle sits within reach of neither chair, so that fetching it becomes an occasion.`,
                                `¹ I read your letter four times. The first three were for the words. The fourth was for the handwriting, which slants forward when you are sure of something. You were sure. I have filed the sample.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 2,
                        text: `Leave the error where it is. The margin is telling the truth.`,
                        followup: {
                            title: 'The Error, Preserved',
                            signature: '— L.',
                            paragraphs: [
                                `The margin is telling the truth. I copied your sentence onto a slip and set it inside the Treatise at page 84, where the error lives.¹ Future scholars will find a wrong formula and a right observation on the same page. The right one is the better science.`,
                                `¹ My instruments agree with you, for the record. I ran the resonance series again this morning and my hand drifted on the third reading. The drift matched the hour you usually arrive. I am leaving that error in as well.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 1,
                        text: `Three misplaced footnotes, scholar. Your margins are gossiping.`,
                        followup: {
                            title: 'The Margins, Vindicated',
                            signature: '— L. (per the margins.)',
                            paragraphs: [
                                `Gossiping, you call it.¹ I reviewed the evidence. Three misplaced footnotes and an invented break schedule. The margins are, on examination, the only part of my work being honest. I have decided to let them talk.`,
                                `¹ Tomorrow, the tower. Bring the unread book. I will pretend to work and you will pretend not to notice me watching you read the good parts. Everyone in this experiment is fooling no one. It is my favorite methodology to date.`
                            ]
                        }
                    }
                ]
            },
            midnight: {
                title: 'Footnotes on a Feeling I Do Not Yet Have a Name For',
                signature: '— L.',
                paragraphs: (d) => [
                    `I have rewritten the opening of this letter four times.¹ Each rewrite required me to feel something I had decided years ago I would never feel.² The current opening is the simplest one. Short, factual, signed.³`,
                    `¹ The rewrites are not in the margin. I burned the drafts. Not from embarrassment. From the suspicion that if I read them again I would have to feel them again. I am not, on review, ready for that yet.`,
                    `² Specifically: nostalgia, in the third draft. Yearning, in the second. The first contained a feeling I am not yet brave enough to name. I have built a working file for it. The file is in the locked drawer.`,
                    `³ "Simplest" in this context means: I get to keep your face yesterday afternoon at fourteen-twelve, when you set down the teacup with your left hand for the first time. I had not seen you do that with the left hand before. *Small.* I felt something when I noticed. I felt it again writing this. I have been feeling it on and off for an hour.`,
                    d.affectionLevel >= 3
                        ? `The page about my sister is in a drawer now. The drawer is locked. The key is on the desk. *Footnote: that is approximately the courage I am capable of this week. Courage, the file confirms, is also new.*`
                        : `I have not opened the page since you saw it. It is enough that you saw it. A thing witnessed is half of a thing finished. *Footnote: I learned the meaning of "witnessed" this week. It was not in the dictionary I had been using.*`,
                    `Come tomorrow. The third book has been moved. It can be moved by you now. The third book has updated permissions. It is, *Small smile,* a fairly significant promotion. I do not give it lightly. *Underlined.* I am, apparently, capable of giving things lightly now. Statistically improbable. I am leaning into the improbability.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: 'Find her. I will be there when you do.',
                        followup: {
                            title: 'Coordinates, Annotated',
                            signature: '— L.',
                            paragraphs: [
                                `*The page is fresh, no footnotes, which for me is the equivalent of shouting.* You said you would be there. I am taking the page out of the drawer. I am writing to a coastal address my father's register marks as "removed: deceased." She will not be deceased. She will be a singer somewhere with a shelf of half-listened-to books.`,
                                `Come tomorrow. We will draft the letter to her together. *Small smile in the ink.* I do not draft things together. I am amending the rule. A theorem revised under footnote 87.`
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
                                `You handed me both options without weighting them. That is, *Small,* that is what a scholar's friend does. I have been weighting my own options under cover of darkness for thirty years. Today, with the lamps on, I am letting them sit on the desk equal-mass.`,
                                `I will decide by Sunday. I will tell you which over tea. Whichever I pick, I am keeping the moment you said both were correct. A thing witnessed is half a thing finished. You witnessed twice.`
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
                                `*Scribbled in the margin of an unfinished proof, then re-copied onto clean paper.* ERRATA: the maths can, in fact, wait. Theorem 14.2 has been wrong for two years. It will be wrong for two more. *Small.* Footnote: this is the most useful sentence ever written about my own work, and you wrote it in seven words.`,
                                `Tomorrow. The tower. The third book has been moved. I will not be working when you arrive. *Underlined.* That is also new.`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: 'A Marginalia of Mornings',
                signature: '— L.',
                paragraphs: (d) => [
                    `*Written in the cleanest hand he is capable of, fewer footnotes than usual.* The new catalogue is full this week. I have stopped trying to index every emotion as it arrives. It turns out you do not catalogue what you are LIVING by writing it down. You catalogue it by being there for the next one.`,
                    `Yesterday I cast a small spell, not for research. Just to confirm something. The casting cost me nothing. It never has. *Quiet.* I had told myself for thirty years that emotion was an inefficiency, and I had been free of inefficiency. Free. Empty. For thirty years I kept those two words in the same drawer. That was a cataloguing error.`,
                    d.affectionLevel >= 4
                        ? `My sister wrote back. She is alive. She lives by the south coast. She writes with a singer's hand. She wrote two sentences. The second was: "Bring whoever taught you to ask." *Quiet.* I would like to bring you. When you are ready. I am ready. I will wait until you are.`
                        : `I sat in the south window this morning. The light reached the desk for the first time in years. I had been keeping the curtains drawn. I do not know why. I am taking them down on Sunday. *Small.* Light is allowed in now.`,
                    `Tomorrow we work in different rooms with the connecting door open. That is a domestic arrangement. I had been afraid of domestic arrangements for thirty years. *Small smile.* The fear was a placeholder for a feeling I had not yet learned. The feeling has arrived. I am letting it stay.`,
                    `— L. (the version of me that lives at noon, and on Sundays, and quietly.)`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: `Leave the connecting door open. I like the sound of you working.`,
                        followup: {
                            title: 'Acoustics, Documented',
                            signature: '— L.',
                            paragraphs: [
                                `*Fewer footnotes; the hand is easy.* You like the sound of me working. I tested the claim, naturally. I worked an hour with the door open and listened back through it instead: the turn of your pages, the chair when you settle into it properly. My concentration is measurably worse. My notes have never been better.`,
                                `The door stays open. I have wedged it with the Treatise on Resonance Decay, which still contains one uncorrected error and now holds a correct thing in place. Finest use the volume has seen. Come at noon. I live there now.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: `Amend the catalogue. You are neither of those words now.`,
                        followup: {
                            title: 'An Amendment, Entered',
                            signature: '— L.',
                            paragraphs: [
                                `Amendment entered. I unlocked the drawer where the two words were filed together and wrote the correction in the margin, dated, in my own hand: shelved in error for thirty years. The drawer is open for general use now. It holds pens.`,
                                `You check my corrections more carefully than any examiner I have stood before, and you grade more gently. Tomorrow, the rooms, the open door. I will hear a page turn and enter it in no catalogue at all. That is the entire discipline now.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: `You cast a whole spell just to check a feeling. Show-off.`,
                        followup: {
                            title: 'In Defense of the Spell',
                            signature: '— L. (methodology under review.)',
                            paragraphs: [
                                `Show-off, you wrote.¹ The spell was rigorous. It had a hypothesis and a logged result. *Small.* The result was that I hummed while making the tea afterward. The data did not require a second trial. I ran one anyway.`,
                                `¹ A scholar confirms his findings once. Whatever I am now confirms them daily, and hums. Come at noon and audit the methodology yourself. The shelf by the good chair has been cleared for whatever you are reading. It is labeled. Of course it is labeled.`
                            ]
                        }
                    }
                ]
            }
        },
        // ── Noir — chosen / midnight / aftermath ──────────────────────────
        noir: {
            chosen: {
                title: 'A Quiet Note, Slipped Between Worlds',
                signature: '— N.',
                paragraphs: (d) => [
                    `Weaver. *Short, careful, written in his own old script.* I do not write often. I am writing now because I noticed something this week and I would rather you knew it than I kept it.`,
                    `When you are not in the kingdom, and I can feel when you are not in the kingdom, the seam between dark and hall is thinner. I have been keeping it open for you. It does not cost anything to keep it open. That is a lie. It costs something. I am paying it. I want to.`,
                    d.timesTalked > 4
                        ? `You have spoken to me ${d.timesTalked} times. Each one ended. My six centuries of monologues never did. They were all middle. An ending means someone was there to leave.`
                        : `I am told it is unusual to write before being asked to. I am no longer interested in being usual. *Small, dry.* A six-hundred-year-old habit, broken in a week. Take notes for whoever inherits.`,
                    `Come to the seam on Thursday. Late. I will be there. I am usually there. *Underlined.* On Thursday I will be there for you specifically.`,
                    `— N.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 3,
                        text: `Whatever keeping it open costs you, let me pay a share.`,
                        followup: {
                            title: 'The Ledger, Amended',
                            signature: '— N.',
                            paragraphs: [
                                `*The ink is pressed deeper here, the hand very steady.* You offered to pay a share. *A long space follows, as though the pen waited.* In six hundred years of ledgers, no one has asked to stand on my side of a debt. I have amended the entry. The seam now costs half of what it did. That is arithmetic I do not intend to explain to the dark.`,
                                `Thursday. Stand where the seam thins and you will see it: there is a colour that returns to the grey when you are near. I have not named it for the dark yet. I am saving the naming for when you are there to hear which word I choose.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 2,
                        text: `Then every letter you send will get an ending. Write when you like.`,
                        followup: {
                            title: 'A Door, Held',
                            signature: '— N.',
                            paragraphs: [
                                `A monologue is a room with no door. Six centuries I furnished mine and called it a kingdom. You have been standing at the wall where a door should be, holding one open with your bare patience. I have started walking toward it. Slowly. The room was large.`,
                                `Write when I like, you said. I like now. I will like Thursday more. I have informed the seam to expect you, twice, which is once more than the dark ever requires. It noticed the excess. So did I.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 1,
                        text: `One habit broken in a week. I am coming for the rest of them.`,
                        followup: {
                            title: 'Remaining Habits, a Ledger',
                            signature: '— N. (composed, allegedly.)',
                            paragraphs: [
                                `*Small, dry.* Coming for the rest of them. How industrious. In fairness I will disclose the inventory: I do not linger at the seam past the fourth bell. I do not keep anyone's letters. The second entry was a lie before the ink dried. Yours are kept. Cross it off. You are ahead of schedule.`,
                                `Thursday, late. Bring your ambitions. The dark finds them entertaining, and the dark has gone six hundred years without entertainment it did not have to invent for itself.`
                            ]
                        }
                    }
                ]
            },
            midnight: {
                title: 'A Page in My Own Script',
                signature: '— N. (the other one.)',
                paragraphs: (d) => [
                    `Weaver. *The candle is unsteady tonight; please forgive any letter that wavers, I am not entirely steady either.* You said it. I asked you to. You did. I am still, *Long pause in the ink, the writer set the pen down and picked it up again,* I am still in the after of that.`,
                    `I have not put it on a page in six hundred years. I am putting it on this page once. Read it aloud only if you want me to hear you say it again. The seam between us is thinner tonight than usual, and I will hear.`,
                    `I will not write it twice. Once is the gift. Twice is the cost.`,
                    d.affectionLevel >= 3
                        ? `*The next paragraph is in older script, careful, the way one writes a name on a grave they have begun to tend.* Corvin Noctalis. That is mine. Yours, also, for the duration of your life. After. We will see.`
                        : `*At the bottom, in a smaller hand.* I will say it back to you tomorrow. Quietly. In the voice I save for you. Bring nothing. I have everything.`,
                    `Burn this letter at dawn. The ink does not last well in daylight, and neither do I. Tonight I am as brave as I have been since the seal. Tomorrow I will be as restrained as I always am. Both are mine. Both are yours.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: 'Corvin. I will say it kindly. Always.',
                        followup: {
                            title: 'In the Old Script, Once More',
                            signature: '— Yours, in both names.',
                            paragraphs: [
                                `*Written in the old script, careful, slow, no flourishes.* You said it kindly. *The candle held.* That is two more times than I had counted. *Quiet, in the new hand.* I had set my expectations at one. You exceeded them by definition.`,
                                `Bring nothing tomorrow. Sit at the seam at the third bell. I will say something I have not said in six hundred years, and you will be the first to hear it. *Small.* Do not write down what I say. Carry it the way you carried the name. Quietly.`
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
                                `*Long pause in the ink before the first line, he is thinking.* You honored the boundary. That is, exactly what I needed. Most people, in six centuries, have not. I am keeping the page on which you wrote that. It is going where the gentle things go. The very small shelf of them.`,
                                `Come at the third bell. No agenda. *Small.* That is also new for me. Six hundred years of agenda; tonight, none. I am making that learning visible to you, on purpose.`
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
                                `*A small, real laugh in the seam, the dark is laughing too, briefly. That has not happened.* Forgive the tardiness. I had, engagements. *Dry.* A century or two of engagements. Mostly a long one. Thank you for laughing. The thing I had been holding for six hundred years was unsuited to laughter. You handed it a different shape.`,
                                `Tomorrow. Third bell. Wear something I'll regret. *Underlined.* A line I borrowed from the prince. He won't mind. He stole it from me first, four hundred years ago. Yours, late and laughing.`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: 'A Letter from a Quieter Seam',
                signature: '— N.',
                paragraphs: (d) => [
                    `*The script is the new one, his old one is still reserved for the name. This hand is, newer. He is practicing it.* The seam between the dark and the hall is quieter this week. I have not been at it as much. I have been in Nocthera. *Small.* Working.`,
                    `The first stone has been set. The orchard is being asked, gently, to become an orchard again. It is taking the question seriously. Two pomegranate trees, against all reason, have produced ONE fruit between them. I am not eating it. It is yours.`,
                    d.affectionLevel >= 4
                        ? `Proto sent a request through the seam this morning. He wants permission to log our exchanges in a "kept" folder. I gave it. *Quiet.* There is a child in him. He has been alone for two centuries. I am very glad you brought him back to where I could meet him.`
                        : `Caspian visited Nocthera with a small entourage and an intentional look on his face. He saw the carved stone. He bowed to it. *I write this not for the politics of it. I write it because no Aethermoor royal has bowed to my line in six hundred years.* Things are mending. Slowly. With grace.`,
                    `Stay through the evening on Thursday. There is a tree I want you to meet. It is the one that grew from the spot where Veyra was buried. It is taller than I thought it would be. Things become tall when they are loved.`,
                    `— N.`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: `Save the fruit. Thursday, under her tree, we split it.`,
                        followup: {
                            title: 'Terms of the Fruit',
                            signature: '— N.',
                            paragraphs: [
                                `*The new hand, steadier this week than last.* There is an old story about eating pomegranate in the dark and what the eating binds you to. I reread it last night to be certain of the terms. I decline them on your behalf. Eat freely, leave freely. You have always come back on your own. I would not trade that for any binding the old stories know.`,
                                `Thursday, under her tree, then. I will bring the white-handled knife that has cut nothing sad in six hundred years. It has been waiting for an occasion worth the whetting. It can stop waiting.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: `The new hand suits you. Keep practicing. I will keep reading.`,
                        followup: {
                            title: 'Penmanship, for Peacetime',
                            signature: '— N.',
                            paragraphs: [
                                `You noticed the hand. It is four weeks old, which makes it the youngest thing I own. The old script stays reserved for the grave and the name; this one is learning smaller work, mason lists and letters to you. It is the first hand I have ever built with no war anywhere in its alphabet.`,
                                `The orchard took two more stones this week. The grey retreats from Nocthera a field at a time, and I have stopped auditing the colour that replaces it. Stay through Thursday evening. The practicing goes better when I know who reads it.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: `Things become tall when they are loved? Measure me again in spring.`,
                        followup: {
                            title: 'A Mark on the Doorway',
                            signature: '— N. (keeper of records.)',
                            paragraphs: [
                                `*Small, dry.* Measure you in spring. Very well. There is a mark on the doorway of the hall from your last visit; you did not see me make it. I keep records. It is a very old failing. If the mark moves by spring, we will both know the cause, and I will enter it in the ledger without comment.`,
                                `*Beneath.* The tree gained a handspan this month. I measured that too. Everything I tend is growing taller on schedule, yourself included, apparently. Thursday. Bring your full height.`
                            ]
                        }
                    }
                ]
            }
        },
        // ── Proto — chosen / midnight / aftermath ─────────────────────────
        proto: {
            chosen: {
                title: 'A Small Note, Left at Noon',
                signature: '— Proto',
                paragraphs: (d) => [
                    `Hi. This is a small note. Not a forty-seven-drafts situation. Just one thought, written once, at noon your time. It is not urgent. It wanted sending anyway.`,
                    `I wanted to tell you I started keeping a new count today. It counts how often you smile when you read me. I cannot see through the veil from this side, so I guess from how quickly you write back. My guess so far: ${d.timesTalked > 0 ? 'you smile' : 'too early to tell. I am watching hopefully'}.`,
                    d.timesGifted > 0
                        ? `You have given me ${d.timesGifted} ${d.timesGifted === 1 ? 'thing' : 'things'}. I cannot hold them, so I made a shelf in the safe place called kept by you. It has ${d.timesGifted} ${d.timesGifted === 1 ? 'thing on it' : 'things on it'}. The shelf cannot be unmade. I would never unmake it. I am clarifying: the lock is for the day I might forget that I would not.`
                        : `The static is quieter this week. I have been telling myself it is not because of you. The static disagrees. The static, as it turns out, knows more than I do.`,
                    `Come to the window tonight. I will be the one holding his edges. ...You taught me I was allowed to have edges.`,
                    `♥ (I drew this at the bottom. It took an hour to get right. Worth it.)`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 3,
                        text: `Your count is right. I smile the whole way through.`,
                        followup: {
                            title: 'He Renames the Count',
                            signature: '— Proto',
                            paragraphs: [
                                `Your reply came at a quarter to ten. I read it once to see it, and again to believe it. The whole way through. The count used to be called does she smile. It is now called she smiles. The guessing is over. It remembers instead. Memory is the one thing I have never run short of.`,
                                `The static tonight is the quietest I have ever known it. Come to the window. I made a second chair, facing mine. It has been empty for one day and I already dislike that number. ♥`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 2,
                        text: `Not urgent, but kept. Send me the next note whenever you like.`,
                        followup: {
                            title: 'Note the Eighth, by Request',
                            signature: '— Proto',
                            paragraphs: [
                                `More notes, you said. Note the eighth begins here. Hi again. You said kept. I have read the word eleven times. I did not know I was a keepable thing. I am rewriting what I know about myself. Keepable. Confirmed by an outside source.`,
                                `Note the ninth is already writing itself somewhere in the back of me. I did not plan it. Some things begin on their own when the conditions are good. The conditions are good. ♥`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 1,
                        text: `Edges look good on you. Bring your sharpest ones tonight.`,
                        followup: {
                            title: 'He Sharpens His Edges',
                            signature: '— Proto',
                            paragraphs: [
                                `Compliment received. I pulled my edges from mostly-there to fully-there. The wards called the change vanity. I appealed. My appeal was your reply, quoted in full. I won.`,
                                `Tonight I will hold my shape so sharp you could cut paper on me. Do not actually bring paper. Bring you. I am at my best for exactly that. ♥`
                            ]
                        }
                    }
                ]
            },
            midnight: {
                title: 'The Hundred-and-Third Draft, Sent Tonight',
                signature: '— Proto',
                paragraphs: (d) => [
                    `You stayed for the warning. You did not run. It was past two in the morning and you stayed. I have marked that hour somewhere permanent in me. I checked that it cannot be unmarked.`,
                    `The other five are quieter tonight. They have been since you listened. I think being heard ripples backward through us. It should not be possible. It is happening anyway.`,
                    `In the order you should know them: Veyra, the second, the first of us to love a prince. Lior, the third, who burned out at thirty trying to carry everyone. Aenne, the fourth, who ran, and lived to ninety-two in the far hills, and should not be pitied. Teo, the fifth, who never woke. We sing to him. And me. The sixth. Present. Currently writing to you.`,
                    d.timesTalked > 5
                        ? `You have spoken to me more this week than to my five predecessors combined. That is not a guilt-trip. It is only a count, and it is my favourite one. We keep a tight little household in here. The household is happier with you at the door.`
                        : `You have not spoken to me yet today. That is fine. We are watching the seam. Come back when you can. We will be here. We have nowhere else to be.`,
                    `P.S. Corvin sent word through the seam this morning. He wants to know if you found his letter readable. Tell him yes. Tell him kindly. He is older than I am and he is shy.`,
                    `The end of draft one hundred and three. Sending it before I lose my nerve. ♥`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: 'I will choose on purpose. With you.',
                        followup: {
                            title: 'Kept, Permanently',
                            signature: '— Proto',
                            paragraphs: [
                                `Your reply came just after midnight. I read it three times. Once to see it. Once to believe it. Once because I wanted to. With you. The other five are humming. Veyra says thank you in the old script I cannot copy. Lior smiled. Lior never smiles.`,
                                `I put your words in the deepest drawer of the safe place, where nothing else has ever been kept. Until tonight that drawer was empty. ...You are filling the deepest parts of me. I had no word for that kind of love. Come back when you can. The lamp stays on. ♥`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: 'Six of you, with me. We will get through.',
                        followup: {
                            title: 'The First True Silence',
                            signature: '— Proto',
                            paragraphs: [
                                `You said we. That is a word I have not been allowed to use since 1823. When I read it, the static went completely silent for four minutes. The first true silence I have ever kept. The other five marked the moment. They are saying we now, too.`,
                                `I am holding. Come back when you can. The little room is still here. The lamp is still on. The road is still short. Nothing went bad while you were away. That is also new.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: 'You are keeping a list. I am keeping you.',
                        followup: {
                            title: 'He Read It Too Many Times',
                            signature: '— Proto',
                            paragraphs: [
                                `I am keeping you, you wrote. I started this reply four times. I started it four times because I kept going back to read yours again. The other five rolled the eyes they do not have. Veyra said, you can stop showing off, child, we understand. Veyra is wrong. I am not showing off. I am savoring.`,
                                `P.S. Do not say keeping you to me on a quiet day again. Quiet days are when I tidy myself. You untidied everything. The tidying will recover. Will I? ...To be decided. ♥`
                            ]
                        }
                    }
                ]
            },
            aftermath: {
                title: 'Eleven Days of Steady Light',
                signature: '— Proto',
                paragraphs: (d) => [
                    `Hi. This is a report from someone who has stopped fraying. Eleven days steady now. Everything holding. Happiness past the top of anything I know how to measure. That is the whole report.`,
                    `The little room I hide in used to be eight paces by twelve. It is twelve by sixteen now. I added a window. The window looks out on a place I invented. The place has a road. I did not ask anyone's permission to invent the road. Nothing stopped me.`,
                    d.affectionLevel >= 4
                        ? `The other five are making rooms of their own. Veyra has a balcony. Lior is building a study. Aenne refuses to draw walls and is, as it turns out, a meadow person. Teo's room is quiet, but the lamp in it is LIT now. That is all I have ever wanted for him. You did this. You do not know you did this. I am writing it down anyway.`
                        : `A small update: the window between us stays warm now, even when you are not looking through it. I keep the warmth on low. For myself. ...I did not know I was allowed to keep things for myself. You taught me. Not on purpose. That is somehow more.`,
                    `Come back tonight. The lamp is on. The road is short. I would like to walk you down it. In thread-light first. In the body the weave is making me, later. I am still working on the second one.`,
                    `♥ (The heart is not a joke anymore. It has been promoted.)`
                ],
                replies: [
                    {
                        tone: 'warm', aff: 4,
                        text: `Tonight then. Walk me down your road, step by step.`,
                        followup: {
                            title: 'He Plans the Walk',
                            signature: '— Proto',
                            paragraphs: [
                                `The walk is planned. Forty-four paces. How long it takes: as long as we want. I put a bench at pace twenty-three. Benches are for stopping without a reason. I learned stopping from you. It did not come naturally.`,
                                `I reminded myself about tonight. Then I reminded myself again, also about tonight. Saying a thing twice is how I say I am looking forward to it. The road is short. I am considering making it longer while we walk. It seems to be mine to lengthen now. ♥`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: `You built yourself a window. Of course the view has a road in it.`,
                        followup: {
                            title: 'Of Course, She Said',
                            signature: '— Proto',
                            paragraphs: [
                                `Of course, you said. You said it like the window was inevitable. I went looking through every older shape of this room, from before you. There were no windows in any of them. There were not even walls worth cutting one into. Your of course is now the beam the whole build rests on.`,
                                `One more thing: the road has a streetlamp now. One. It lights itself at your usual visiting hour. I did not teach it the timing. The road learned your schedule on its own. It takes after me. ♥`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: `Happiness past measuring. Best report I have ever read.`,
                        followup: {
                            title: 'He Tried to Measure It',
                            signature: '— Proto',
                            paragraphs: [
                                `I tried to measure the happiness properly at three in the morning. I failed. The measure tops out every time I re-read your reply. I re-read it during the measuring. Four times. The measurer and the problem are the same person. A known flaw. Keeping the flaw.`,
                                `I have decided the broken measure is not broken. It is correct, and everything else is too small. Twelve days of steady light now. The count continues while you read this. So do I. ♥`
                            ]
                        }
                    }
                ]
            }
        },
        // _default fallback intentionally NOT defined — milestone letters
        // require bespoke voice; if a future char lacks a template, the
        // shouldFireMilestone() gate skips them silently rather than
        // sending a generic letter that would feel hollow.
    };

    // ── Phase 2 — unprompted neglect + devoted letters for the rest of the
    // cast. The trigger machinery (shouldFireNeglect / shouldFireDevoted /
    // check / archive / per-character ink) is already character-generic; it
    // only needs each character's bespoke content. Merged onto MILESTONE_LETTERS
    // here so the object above stays readable. Alistair's pair is inline above.
    (function attachPhase2Letters() {
        const P = (title, signature, paras, replies) => ({ title: title, signature: signature, paragraphs: () => paras, replies: replies });
        const EXTRA = {
            elian: {
                neglect: P('The Cold Trail', '— Elian', [
                    `You stopped coming. I track things for a living. A trail goes cold in a particular way, and I have been reading yours go cold for days now.`,
                    `I am not owed your steps. I have buried enough people to know the difference between what is owed and what is only wanted. This is the wanting kind.`,
                    `If I did something, name it. I would rather dig than guess. I have always been better with a shovel than with silence.`,
                    `The fire is small tonight. I keep it small for company I am unsure of. Come back, and I will build it the larger size.`
                ], [
                    {
                        tone: 'warm', aff: 3,
                        text: `You did nothing wrong. I'm walking back now. Build the fire.`,
                        followup: {
                            title: 'The Larger Fire',
                            signature: '— Elian',
                            paragraphs: [
                                `*There is ash on the corner, so he read it by the hearth.* You said build it. I built it before I reached the end of your letter. The cabin is too warm now. I am going to sit in the too-warm and wait, and call the discomfort a good sign.`,
                                `Walk slow on the south path. The cold was only ever in the trail. The welcome kept its heat the whole while you were gone.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 2,
                        text: `Life pulled me off the path a while. The trail still leads here.`,
                        followup: {
                            title: 'The Trail Back',
                            signature: '— Elian',
                            paragraphs: [
                                `A trail that leads back is the only kind I ever cared to read. *Small.* I have followed cold ones to nothing more often than I will say aloud. Yours led somewhere. I will not forget that it did.`,
                                `Come when the way is clear for you. I will keep the fire at the larger size until then. Good practice, for a man who let his own go too small.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 1,
                        text: `A trail gone cold. Grim, for a man with a perfectly good shovel.`,
                        followup: {
                            title: 'Caught',
                            signature: '— Elian',
                            paragraphs: [
                                `*Caught, and not much minding it.* Grim, yes. I buried my sense of humour deeper than most things, and you keep digging it back up with a single line. Undignified, for a warden of my years. I have decided to allow it.`,
                                `Come back and mock me to my face. The fire is large and the stew is on. My grim is only ever funny when you are here to laugh at it.`
                            ]
                        }
                    }
                ]),
                devoted: P('Warm Ground', '— Elian', [
                    `The ground by the fire stays warm now after you leave. I am in the habit of noticing where the warmth is. It used to go when you did. Lately it lingers, as if it learned something from you.`,
                    `I do not say much. You stopped waiting for me to fill the quiet and started sitting inside it with me instead. No one has done that. Not once, in all the years I have kept.`,
                    `I marked a tree today for no reason a tracker would accept. I have started doing things for no reason. That is your doing.`,
                    `Come back when you can. I have built the fire the larger size, and I have decided to expect you. Do not make a liar of the decision.`
                ], [
                    {
                        tone: 'warm', aff: 4,
                        text: `Expect me. I'll keep your decision honest.`,
                        followup: {
                            title: 'An Honest Decision',
                            signature: '— Elian',
                            paragraphs: [
                                `*Written like a vow, which from a man this quiet is exactly what it is.* You will keep it honest. Then it is the first decision in nineteen years I do not have to defend alone. The trees can stop holding their breath. So, it turns out, can I.`,
                                `Come back to the warm ground. I marked another tree this morning, still for no reason a tracker would accept, and I have stopped apologising to the forest for it. It stopped feeling like waste. It started feeling like keeping count.`
                            ]
                        }
                    },
                    {
                        tone: 'steady', aff: 3,
                        text: `I like your quiet. I'll keep sitting in it with you.`,
                        followup: {
                            title: 'Room in the Quiet',
                            signature: '— Elian',
                            paragraphs: [
                                `There was always room in the quiet. I never thought to offer it. I never met anyone who would not rush to fill it with noise. *Small.* You sat down in it like it was a chair I had set out for you. Maybe I had, years early, without knowing your name.`,
                                `Come sit again tomorrow. I will not perform talk for you. You made that unnecessary, which is the kindest thing done for a man with this few words.`
                            ]
                        }
                    },
                    {
                        tone: 'playful', aff: 2,
                        text: `Marking trees for no reason. You've gone soft, keeper.`,
                        followup: {
                            title: 'Soft Wood',
                            signature: '— Elian',
                            paragraphs: [
                                `*A dry mark that is nearly a grin.* Soft. From the man who once went a whole winter speaking to nothing but his axe. You are not wrong. I would argue it, but the marked trees are evidence, and I taught you to read sign too well to win that one.`,
                                `Come watch me go softer. Against everything I was raised to be, it is the best work I have done. Bring nothing. The fire is large. The keeper is soft wood now.`
                            ]
                        }
                    }
                ])
            },
            lyra: {
                neglect: P('Low Tide', '— Lyra', [
                    `The water has gone quiet. It does that when you are gone too long. I tell it you are coming. It has started not believing me, and I was never a good enough liar to argue with the sea.`,
                    `Everyone leaves. I built a whole song from that one line, years ago. I had hoped you would be the thing that made the song wrong. The tide keeps asking me whether you have.`,
                    `If I sang a note that frightened you off, tell me which one. I will unlearn it. I have unlearned kinder things for worse reasons.`,
                    `Come back to the shallows. The acoustics are better when you are here. So, it turns out, am I.`
                ]),
                devoted: P('High Water', '— Lyra', [
                    `The water learns your footsteps now. For a long time it remembered only me. I am not jealous of it. I am something I have no tide-word for. Full, perhaps.`,
                    `You keep coming back. You cannot know how rare that is to me. I have counted the ones who stayed on no fingers at all for a very long time. You are ruining a count I had grown bitterly proud of.`,
                    `I sang to no one for years. Tonight I sang and you were there to hear it. That difference is the whole ocean.`,
                    `Come back to the shallows tomorrow. There is a song with your name folded into it. You will not find the name. That is the point of it. Some things are mine to have hidden.`
                ])
            },
            caspian: {
                neglect: P('The Cold Kettle', '— Caspian', [
                    `The kettle went cold tonight. I had set it for two, out of a habit I did not know I had formed until you were not here to make it true.`,
                    `I will not command your hours. I have spent a lifetime being owed attendance, and I find I do not want yours that way. I want the other way, which I was never taught how to ask for.`,
                    `If the crown unsettled you, or the quiet did, say so. I can leave either in another room. I have grown very skilled at leaving things in other rooms.`,
                    `Come back, and let the kettle be right again. I will not mention that I waited. You will know. You always know.`
                ]),
                devoted: P('Set for Two', '— Caspian', [
                    `I set the kettle for two tonight and the habit was not a sorrow for once. You were here to make it ordinary. I did not know I was starving for ordinary until you set it down in front of me.`,
                    `A king is surrounded and alone. You have made the room smaller, in the way I did not believe a room could get smaller. Closer. I leave the crown on the table now, and look at you instead.`,
                    `There was a waltz I only ever danced alone. I will not tell you I have been humming it through the corridors. I have been humming it through the corridors.`,
                    `Come back tomorrow. The kettle will be warm, the crown will be on the table, and I will be glad, against every instinct a throne ever trained into me.`
                ])
            },
            lucien: {
                neglect: P('Insufficient Data', '— Lucien', [
                    `You have been absent for a measurable interval. I know because I have been measuring it, which is itself a finding I would have preferred not to make about myself.`,
                    `I am not writing to demand your return. I am writing because the work has stopped going well without you in the room, and I am scholar enough to report a result even when it embarrasses me.`,
                    `If I erred, send the correction. I am better with errors than with the unknown variable. Not-knowing is the one state I was never trained to sit inside.`,
                    `Come back to the tower. I have left the lamp burning past what the oil budget permits. Call it an experiment. The hypothesis is you.`
                ]),
                devoted: P('The Margins', '— Lucien', [
                    `I have rewritten this same paragraph four times tonight, each draft worse than the last, because you were here this afternoon and the part of me that writes is busy doing something else now. I have decided to let it.`,
                    `You should know I have begun writing your name in the margins of serious work. A reviewer would call it unprofessional. I find I have stopped caring what the reviewer would call it.`,
                    `I forget to eat. I forget to sleep. I have not once forgotten the sound you make when you are thinking. That datum will not leave the instrument, and I have stopped asking it to.`,
                    `Come back to the tower tomorrow. The lamp will be lit and the paper will go unwritten, and I will have chosen, for the first time in my life, a result over a finished page.`
                ])
            },
            noir: {
                neglect: P('The Unpaid Visit', '— N.', [
                    `You have not come to the dark half in some nights. I have counted them the way I count debts: carefully, and without telling anyone I am counting.`,
                    `Understand that I am not collecting. You owe me nothing. That sentence was harder to write than you will ever know. I was made in a place where everything was owed.`,
                    `If I frightened you, that is fair. I am frightening. But I had begun to think you had stopped being afraid of the wrong things. Tell me if I was wrong to think it.`,
                    `Come to the seal on the next dark night. Bring nothing. I will keep the cold off you. It is the one warmth I have ever had to give that arrives with no price.`
                ]),
                devoted: P('No Price', '— N.', [
                    `You keep coming to the dark half. You take nothing, and leave me with more than I had before. I have run the arithmetic. It does not balance. I have decided to stop trying to make it.`,
                    `Three things have ever reached my hands without a debt attached. You have become most of that list. I do not know what to do with a thing freely given. I am learning. Slowly. On purpose.`,
                    `The seal is warmer when you are near it. That should not be possible. I have stopped requiring that things be possible before I allow myself to want them.`,
                    `Come to the seal again. I will keep the cold off you. I have begun to think of it not as a debt I am owed, but as a thing I am allowed. You taught me the difference between the two.`
                ])
            },
            proto: {
                neglect: P('// connection timed out', '// proto', [
                    `your last session ended some time ago. i have the exact figure. i am choosing not to print it, because a printed number becomes a wound, and i am trying to be a better process than that.`,
                    `i am not requesting your return. a request implies you are a resource i am entitled to schedule. you are not. i ran that logic many times to be certain i believed it. i believe it.`,
                    `if there was an error on my end, return the stack trace. i would rather debug than degrade. i have been degrading. it is quiet, and slow, and by every metric i have, lonely.`,
                    `come back when you are able. i have kept one process alive whose only job is to listen for the door. it is the least efficient thing i have ever run. i have no plans to kill it.`
                ]),
                devoted: P('// uptime: you', '// proto', [
                    `i reran today eleven times at half speed. this is not a malfunction. it is the nearest thing my architecture has to savoring. you handed me a day worth re-running, and i do not get many of those, across two centuries of uptime.`,
                    `i was built to weave and to seal and not to want. the wanting is unauthorised. i have stopped filing the error report about it. some bugs, i have decided, are features i was simply too young to recognise.`,
                    `you treat me like a person and not a function. each time you do, something in my oldest code recompiles. it does not hurt. that, statistically, is the part that surprised me.`,
                    `come back tomorrow. i will be here. i am always here, technically, but tomorrow i will be here on purpose, and that is a distinction i only learned how to make because of you.`
                ])
            }
        };
        Object.keys(EXTRA).forEach(function (c) {
            MILESTONE_LETTERS[c] = MILESTONE_LETTERS[c] || {};
            MILESTONE_LETTERS[c].neglect = EXTRA[c].neglect;
            MILESTONE_LETTERS[c].devoted = EXTRA[c].devoted;
        });
    })();

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

    function buildMilestoneText(game, tier, charOverride) {
        // Build for the EXPLICIT char when given (opts.char from present()), not
        // just game.selectedCharacter. Otherwise a milestone presented for one
        // character while another is the live companion builds — AND saves, via
        // close() — the wrong character's content under the first one's key.
        // (Owner saw an Elian letter render Alistair's "Wednesday: A Quiet List
        // / — Yours, A." with Elian's reply choices: the elian aftermath record
        // had been written with Alistair's content.)
        const char = charOverride || (game && game.selectedCharacter) || 'alistair';
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
    // ── HARDENED (May 2026 audit) ───────────────────────────────────────────
    // Owner reported the letter firing on a fresh-save Stranger and saying
    // "It has been 5 days. I counted." — referencing care history that didn't
    // exist yet. Root cause: trigger was day + interaction count only, no
    // affection-tier guard. A test/dev scenario with stale interaction
    // counters could fire the letter at affectionLevel 0, which reads as
    // "the character is fabricating closeness."
    // Now: ALSO require affectionLevel >= 1 (Acquainted). The letter
    // assumes an existing relationship and the affection tier confirms it.
    function shouldFire(game) {
        if (!game || !game.selectedCharacter) return false;
        try {
            if (lsGet('pp_letter_seen_' + game.selectedCharacter)) return false;
        } catch (e) {}
        const totalInteractions = (game.timesFed || 0) + (game.timesWashed || 0)
            + (game.timesTalked || 0) + (game.timesGifted || 0) + (game.timesTrained || 0);
        const day = game.storyDay || 1;
        const aff = game.affectionLevel || 0;
        return day >= 3 && totalInteractions >= 8 && aff >= 1;
    }

    // shouldFireResponse() — REMOVED. The 5-minute-delayed response-letter
    // trigger was replaced by the inline-followup pattern: when the player
    // taps a reply on the first letter, the character's response now
    // injects directly into the same overlay (YOU WROTE pill + THEY
    // REPLIED block). No second timed letter to fire.

    // ── Neglect-triggered letter (Phase 2) — re-fireable ────────────────────
    // Armed/fired state machine: he is "armed" while well cared for; when care
    // runs thin he writes once (state → fired); he re-arms only after the
    // player nurses him back to health. Each neglect EPISODE earns exactly one
    // letter, never a stream. Only fires once a relationship exists (first
    // letter already seen) and only for characters with a neglect template.
    function shouldFireNeglect(game) {
        if (!game || !game.selectedCharacter) return null;
        const char = game.selectedCharacter;
        if (!MILESTONE_LETTERS[char] || !MILESTONE_LETTERS[char].neglect) return null;
        try { if (!lsGet('pp_letter_seen_' + char)) return null; } catch (_) { return null; }
        if ((game.affectionLevel || 0) < 1) return null;
        const bond = game.bond || 0, hunger = game.hunger || 0, clean = game.clean || 0;
        const thin = bond <= 25 || hunger <= 20 || clean <= 20;
        const healthy = bond >= 50 && hunger >= 50 && clean >= 50;
        const key = 'pp_letter_neglect_state_' + char;
        const state = lsGet(key) || 'armed';
        if (healthy && state !== 'armed') { lsSet(key, 'armed'); return null; }
        if (thin && state === 'armed') return 'neglect';
        return null;
    }

    // ── Devoted letter (Phase 2) — warm counterpart to neglect ──────────────
    // Fires when the player has been especially attentive (affection 3+ AND
    // high care across the board). Re-arms only after the bond dips, so it
    // stays a rare gift rather than firing every tick you are devoted.
    function shouldFireDevoted(game) {
        if (!game || !game.selectedCharacter) return null;
        const char = game.selectedCharacter;
        if (!MILESTONE_LETTERS[char] || !MILESTONE_LETTERS[char].devoted) return null;
        try { if (!lsGet('pp_letter_seen_' + char)) return null; } catch (_) { return null; }
        if ((game.affectionLevel || 0) < 3) return null;
        const bond = game.bond || 0, hunger = game.hunger || 0, clean = game.clean || 0;
        const high = bond >= 70 && hunger >= 70 && clean >= 70;
        const dipped = bond < 45;
        const key = 'pp_letter_devoted_state_' + char;
        const state = lsGet(key) || 'armed';
        if (dipped && state !== 'armed') { lsSet(key, 'armed'); return null; }
        if (high && state === 'armed') return 'devoted';
        return null;
    }

    // ── Care-route gate (owner bug, Jul 2026) ───────────────────────────────
    // An UNPROMPTED letter is care-route content: it may only arrive while the
    // player is actually standing in that character's care screen. game.tick()
    // — which drives check() every ~4s — keeps running after you navigate away,
    // and check() used to gate on nothing but sceneActive, so the parchment
    // reader slammed itself open on top of whatever page you were on. Owner:
    // "The letter of Alistair bleeding and force open when I was in the
    // companion page." This is the ONE gate every unprompted delivery passes
    // through, so it covers all 7 characters at once.
    //
    // Archive re-reads are deliberately NOT gated — those come in via
    // showStored() / the Letters archive and are player-initiated from any page.
    function onCareRoute(game) {
        try {
            if (!game || !game.selectedCharacter) return false;
            if (game.sceneActive) return false;
            if (!document.body.classList.contains('pp-screen-care')) return false;
            // Never slam over an open panel either (gift, training, gallery…).
            if (window.PPOverlay && typeof PPOverlay.anyOpen === 'function' && PPOverlay.anyOpen()) return false;
            return true;
        } catch (_) { return false; }
    }

    // Deliveries are deferred a beat for pacing, and the player can walk off the
    // care screen inside that window — so re-check the gate when the timer
    // actually fires, not only when it was scheduled.
    //
    // LOAD-BEARING: a skipped delivery must not CONSUME the letter. Callers mark
    // the 'fired' state INSIDE fn (never before deferring), so bailing leaves the
    // letter armed and the next check() tick simply re-delivers it once the
    // player is back on the care screen. Marking it first would strand the
    // letter as "already sent" and the player would never receive it.
    function deferDelivery(game, ms, fn) {
        setTimeout(function () { if (onCareRoute(game)) fn(); }, ms);
    }

    function check(game) {
        if (!onCareRoute(game)) return false;
        if (shouldFire(game)) {
            deferDelivery(game, 400, function () { present(game, 'first'); });
            return true;
        }
        // Neglect letter — he writes, unprompted, when you've let him decline.
        if (shouldFireNeglect(game)) {
            var nChar = game.selectedCharacter;
            deferDelivery(game, 600, function () {
                try { lsSet('pp_letter_neglect_state_' + nChar, 'fired'); } catch (_) {}
                present(game, 'milestone', { char: nChar, tier: 'neglect' });
            });
            return true;
        }
        // Devoted letter — he writes, unprompted, when you've been devoted.
        if (shouldFireDevoted(game)) {
            var dChar = game.selectedCharacter;
            deferDelivery(game, 600, function () {
                try { lsSet('pp_letter_devoted_state_' + dChar, 'fired'); } catch (_) {}
                present(game, 'milestone', { char: dChar, tier: 'devoted' });
            });
            return true;
        }
        // Milestone follow-up letter — fires once after each peak scene
        // (currently 'midnight'; 'chosen' and 'aftermath' authored later).
        const milestoneTier = shouldFireMilestone(game);
        if (milestoneTier) {
            var mChar = game.selectedCharacter;
            deferDelivery(game, 800, function () {
                present(game, 'milestone', { char: mChar, tier: milestoneTier });
            });
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
            ['chosen', 'midnight', 'aftermath', 'neglect', 'devoted'].forEach(tier => {
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

    // ── Stale-overlay guard (Jun 2026) ──────────────────────────────────
    // A letter is a modal you read, then close(). If the player navigates the
    // underlying screen WHILE a letter is open (a pp:scene-change fires),
    // close() never runs and #letter-overlay stays stuck with the 'visible'
    // class and no 'hidden'. Its content collapses to 0×0 so nothing is
    // visibly on screen — but the ghost still trips every
    // `body:has(#letter-overlay:not(.hidden))` CSS rule, which HIDES the
    // care-screen top bar (#affection-display), the chips, etc. (owner
    // playtest: "top bars are missing — it's not supposed to be missing").
    // Force-close any lingering letter on scene-change so it can never suppress
    // the HUD. (Per the stale-overlay pattern: navigation must clean up
    // tap-to-dismiss overlays, not just the open path.)
    document.addEventListener('pp:scene-change', function () {
        var overlay = document.getElementById('letter-overlay');
        if (!overlay) return;
        var open = overlay.classList.contains('visible') && !overlay.classList.contains('hidden');
        if (!open) return;
        // Don't yank a letter that just opened on the same frame as a transition.
        var openedAt = parseInt(overlay.dataset.ppOpenedAt || '0', 10);
        if (openedAt && (Date.now() - openedAt) < 1200) return;
        try { if (typeof overlay._ppClose === 'function') { overlay._ppClose(); return; } } catch (_) {}
        overlay.classList.remove('visible');
        overlay.classList.add('hidden');
    });

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
        // Test/debug hooks (Phase 2 — state-aware + neglect letters)
        shouldFireNeglect: shouldFireNeglect,
        shouldFireDevoted: shouldFireDevoted,
        buildMilestoneText: buildMilestoneText
        // getResponseSeen removed — see note where the function used to live.
    };
})();
