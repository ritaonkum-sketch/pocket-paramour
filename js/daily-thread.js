// ============================================================
//  DAILY THREAD — the reason to come back tomorrow
//
//  Aug 2026 playtest finding: every mechanical goal on a care route can be
//  satisfied in one ~3 minute sitting (bond hits ~98/100, affection passes the
//  Bond-3 gate), while the route's ENDING needs storyDay >= 8 — eight separate
//  real days. Days 2-7 therefore had no new content and no reason to open the
//  app: the player had already "finished" him and was just waiting on a clock.
//
//  This module adds the missing daily rhythm. Three pieces, one system:
//
//    ARRIVE  (#2) one small scene per care-route day, played on the first
//                 visit of that day. Days are counted PER CHARACTER from the
//                 day their route opened, so everyone sees day 2, 3, 4 ... in
//                 order no matter when they start the route.
//    PROMISE (#5) at the end of a session he names one SPECIFIC thing about
//                 tomorrow. The next day's ARRIVE beat is that exact thing,
//                 so the promise is always kept. This is the hook.
//    STREAK  (#9) consecutive days acknowledged in his own voice, never as a
//                 UI badge.
//
//  SAFETY CONTRACT:
//   - Purely additive and read-only with respect to progression. It never
//     touches affection, bond, corruption, the balanced-care flag, or
//     bondLevelFor() — so the care-route ladder that unlocks chapters and the
//     next character is completely unaffected. This only SHOWS content.
//   - Speaks through the existing care dialogue box and always waits for it to
//     be free (the ambient-bubble busy() invariant), so it can never collide
//     with a care response.
//   - Characters with no thread data simply get nothing. No breakage.
// ============================================================

(function () {
    'use strict';

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
    function todayStr() { return new Date().toISOString().slice(0, 10); }

    // ── Content ──────────────────────────────────────────────────────────
    // day N: `arrive` pays off the promise made on day N-1.
    //        `promise` is the hook for day N+1.
    // Voice rules: no em-dashes, understated, a knight who states facts and
    // lets the feeling sit underneath them.
    var THREAD = {
        alistair: {
            1: {
                promise: "Come at first light tomorrow. There is something on the north wall I have never shown anyone."
            },
            2: {
                arrive: [
                    "You came at first light. I did not entirely expect it.",
                    "The north wall. That notch in the stone is mine. I put my sword through it the first night I stood watch alone, because I was seventeen and certain something was coming.",
                    "Nothing came. I have kept the notch anyway. It reminds me that being afraid and standing still are not opposites."
                ],
                promise: "Tomorrow, come at the change of the guard. I want you to hear the horn from inside the gate. It sounds different when you belong to it."
            },
            3: {
                arrive: [
                    "There. The horn. Listen to it from here.",
                    "From outside the wall it is a warning. From in here it is only tired men telling each other they are still awake.",
                    "You did not flinch this time. Good."
                ],
                promise: "Tomorrow I am off the roster until noon. I have never had a morning I did not owe to someone. Spend it with me and I will not know what to do with either of us."
            },
            4: {
                arrive: [
                    "No armour today. It felt strange on the stairs, walking without the sound of myself.",
                    "Every morning of my life has been owed to a roster. This one I gave away on purpose. To you.",
                    "Do not make it mean more than it does. ...Or do. I am not certain which I would prefer."
                ],
                promise: "Come after dark tomorrow. There is a thing I do at the end of a watch that no one has ever watched me do."
            },
            5: {
                arrive: [
                    "You came after dark. Stand there, and do not speak for a moment.",
                    "*He sets the sword across his knees and cleans it slowly, hilt to point*",
                    "That is the whole of it. A man, a blade, and the counting of a day that did not go wrong. It is not a ceremony. It only feels like one because you are watching."
                ],
                promise: "Tomorrow, ask me the question you have been not asking. I have watched you decide against it three times. I will answer it."
            },
            6: {
                arrive: [
                    "You have been carrying a question since the moss. Ask it.",
                    "...Yes. I knew the one before you. I stood this same watch for her.",
                    "I am not going to tell you it is different this time. I am going to show you, and you may decide for yourself."
                ],
                promise: "Tomorrow I report to the King. Come to the gate at noon and hear what I say when they ask him what you are."
            },
            7: {
                arrive: [
                    "They asked me what you are to the Kingdom. In front of the whole hall.",
                    "I said she is the reason the wards are still lit, and she is under my watch. Both. In that order, because the second one is mine and I did not want to hand it to them.",
                    "The King let it stand. ...I did not know I was going to say the second part."
                ],
                promise: "Tomorrow, bring me nothing. Tend to nothing. Just come and sit. I want to know what we are when there is nothing to do."
            },
            8: {
                arrive: [
                    "Nothing to do. No orders, no wall, no horn.",
                    "Sit. There. That is the chair I moved to the window on your first day, and you have never once used it.",
                    "...This is the part I did not know how to want. The room, and you in it, and no reason for it."
                ],
                promise: "Come back tomorrow anyway. There is no plan. That is rather the point."
            }
        },

        elian: {
            1: { promise: "Come at dawn. The deer cross the low creek then. You should see it once." },
            2: {
                arrive: [
                    "You came at dawn. Quiet. Good.",
                    "There. Three of them, and the small one is limping and will not last the winter. I know. I am not going to do anything about it.",
                    "The wood does not need saving. It needs someone to look at it honestly. You did that without being told."
                ],
                promise: "Tomorrow bring nothing. I want to show you which things out here will kill you."
            },
            3: {
                arrive: [
                    "This one. Pretty, is it not. It will stop your heart in an hour.",
                    "That one beside it looks the same and will only make you sleep. The difference is the underside of the leaf.",
                    "Now you know. I do not like teaching people this. I like that you will be harder to lose."
                ],
                promise: "Come after the rain tomorrow. The wood smells like the start of the world for about an hour. Then it stops."
            },
            4: {
                arrive: [
                    "You made it inside the hour.",
                    "*He says nothing for a while and lets the wet green smell do the talking*",
                    "That. That is the thing I could never explain to anyone at the castle. You did not ask me to explain it."
                ],
                promise: "Tomorrow I am setting a snare. You will hate it. Come anyway."
            },
            5: {
                arrive: [
                    "You hated it. I told you.",
                    "I check them twice a day so nothing waits. Most men check once. That is the whole of my morality, and it is thinner than people think.",
                    "You did not call me cruel and you did not call me kind. You just helped me check the second one. ...Thank you for that."
                ],
                promise: "Come at dusk tomorrow. There is a rowan on the ridge I tend. I have not shown anyone."
            },
            6: {
                arrive: [
                    "The rowan. Careful of the roots.",
                    "I clear the moss off it four times a year. Nobody asked me to. Nobody knows I do it.",
                    "Now one person knows. That is more people than I intended to tell, and fewer than I am sorry about."
                ],
                promise: "Tomorrow, ask me about the two stones by the creek. I would rather you asked than guessed."
            },
            7: {
                arrive: [
                    "You asked. Good.",
                    "Two Weavers before you. I found the first one too late and the second one in time, and in time was not enough.",
                    "I am telling you so you know what it costs me when you are late. Not to make you sorry. So you know."
                ],
                promise: "Tomorrow, do not help. Sit by the fire and let me work. I want to look up and find you there."
            },
            8: {
                arrive: [
                    "Sit. No, properly. The work is mine tonight.",
                    "*He carves without looking up, and the shape in the wood is starting to be a bird*",
                    "I looked up four times. You were there four times. ...That is a new number for me."
                ],
                promise: "Come back. The chair stays by the fire either way, but it is better with you in it."
            }
        },

        lyra: {
            1: { promise: "Come at low tide tomorrow. The pools hold things that only exist for an hour." },
            2: {
                arrive: [
                    "You came at low tide. The pools are awake.",
                    "That one is a whole kingdom and it will be gone by evening and it does not mind. I have always envied it that.",
                    "You were careful where you put your feet. The small things noticed. So did I."
                ],
                promise: "Tomorrow, come when it is loud. I want you to hear the cave when the sea is angry."
            },
            3: {
                arrive: [
                    "Listen. That is the sea being furious about nothing at all.",
                    "Everyone runs from this sound. You came toward it.",
                    "...I have been the loud thing in a room my whole life. It is strange to stand next to something louder with someone who stayed."
                ],
                promise: "Come at night tomorrow. I will sing you the one I never finish."
            },
            4: {
                arrive: [
                    "This is the one. I have never got past the bridge.",
                    "*She sings, and it stops in the same place it always stops*",
                    "There. That is where it goes quiet. I do not know the rest. I am not sure there is a rest."
                ],
                promise: "Tomorrow bring me something from the land. Anything. I want to hold a thing that has never been wet."
            },
            5: {
                arrive: [
                    "You brought it. Let me hold it.",
                    "It is warm. Land things are warm. I keep forgetting that and then being surprised.",
                    "I am putting it on the shelf above the tide line. That means it stays dry. That means it stays."
                ],
                promise: "Come at dawn. I want to try floating without drifting. You will have to hold the rope."
            },
            6: {
                arrive: [
                    "Hold it. Do not let go, and do not pull either.",
                    "*She lies back on the water with her eyes closed and does not move away from the shore*",
                    "I did not drift. That has not happened since I was small. It turns out I only needed someone at the other end of the rope."
                ],
                promise: "Tomorrow, ask me about the six. I will tell you the truth, which is worse than the rumour."
            },
            7: {
                arrive: [
                    "The truth, then. Sit down for it.",
                    "Six before you. I sang at every one of their funerals and I never once sang to stop it happening. I did not know I could.",
                    "You are the seventh. I have been practising a different song. I have not told the sea about it yet."
                ],
                promise: "Come tomorrow and say nothing. I want to find out whether quiet works between us."
            },
            8: {
                arrive: [
                    "You are not talking. Good. Neither am I.",
                    "*The water moves. Nobody fills the silence.*",
                    "...It works. I did not think it would. Everything I know how to do is loud."
                ],
                promise: "Come back. The tide does. I am learning from it."
            }
        },

        caspian: {
            1: { promise: "Come to the east gardens at dawn. The court is not awake, and neither is the prince." },
            2: {
                arrive: [
                    "You found it. Nobody uses this gate.",
                    "No audience out here. No one to be delightful for. I am told I am considerably worse company like this.",
                    "You have not left, so either that is untrue or you are being polite. I would like it to be the first one."
                ],
                promise: "Tomorrow, come while I am being the prince. I want you to watch me lie."
            },
            3: {
                arrive: [
                    "You watched. Well?",
                    "Forty minutes, eleven compliments, not one of them true. They call it diplomacy. It is closer to needlework.",
                    "You were the only person in that hall who knew. I found I did not mind being caught by you."
                ],
                promise: "Come after the audience tomorrow. I will take the face off in front of you."
            },
            4: {
                arrive: [
                    "There. That is the whole trick. It comes off like a collar.",
                    "*He sits down without arranging himself first, which he has not done in front of anyone in years*",
                    "This is what is underneath. Tired, mostly. I did warn you it was not much of a reveal."
                ],
                promise: "Tomorrow bring nothing and expect nothing. I will make the tea myself. Badly."
            },
            5: {
                arrive: [
                    "It is bad. I am aware it is bad.",
                    "I have had tea poured for me every day of my life and I have never once made it. That is not charming. That is just a fact about how I was raised.",
                    "You drank it anyway. ...You drank all of it. I noticed."
                ],
                promise: "Come at the hour I am due at council tomorrow. I intend not to be there."
            },
            6: {
                arrive: [
                    "They will have started without me. Let them.",
                    "I have never missed one. Not when I was ill, not when my mother was ill. I missed this one for a walk.",
                    "Do not tell me that is romantic. It is closer to a small treason, and I enjoyed it enormously."
                ],
                promise: "Tomorrow, ask me what happens to me if I am ever not charming. I will answer honestly, which I have not done since I was nine."
            },
            7: {
                arrive: [
                    "You asked. All right.",
                    "Nothing happens. That is the answer. If I am not charming there is no version of me left that anyone has a use for. I have believed that since I was nine years old.",
                    "You have been sitting with the unlovely version for a week and have not gone anywhere. I am having to rewrite something rather large."
                ],
                promise: "Come tomorrow and let me introduce you to no one. I want one hour where you are not a position at court."
            },
            8: {
                arrive: [
                    "No titles today. Not yours, not mine.",
                    "*He does not perform, and the silence does not seem to frighten him this time*",
                    "I have been a prince in every room I have ever stood in. This is the first room I have simply been in. ...Do not make me say more than that."
                ],
                promise: "Come back. There is no version of these gardens that is better without you in them."
            }
        },

        lucien: {
            1: { promise: "Come at the second bell. I have a question I cannot solve alone, and it is not about magic." },
            2: {
                arrive: [
                    "You came. Sit.",
                    "The question is this: how does a person know that what they are feeling is the thing other people mean by the word. There is no instrument for it. I have looked.",
                    "You did not laugh. Most would have laughed. I have noted that."
                ],
                promise: "Tomorrow, watch me work. I want to see whether being watched changes the result."
            },
            3: {
                arrive: [
                    "It changed the result.",
                    "Slower. Nine per cent slower, and more accurate, which should not follow and does.",
                    "I have no explanation. I am recording it anyway, under a heading I have not decided how to name."
                ],
                promise: "Bring your own book tomorrow. We will not speak. I want to test something."
            },
            4: {
                arrive: [
                    "Two hours. Neither of us spoke.",
                    "I have shared a room in silence with colleagues for a decade and found it unbearable within minutes.",
                    "That was not unbearable. I would like to run it again. Tomorrow, if you are willing."
                ],
                promise: "Tomorrow I will show you the journals. Do not read them. Just look at how many there are."
            },
            5: {
                arrive: [
                    "There. Floor to ceiling. Do not open them yet.",
                    "Every one is a feeling I had and wrote down within the hour, because I have no practice holding them and I was afraid of losing the only ones I have.",
                    "The count is four hundred and eleven. Every single one is dated after the week you arrived."
                ],
                promise: "Come at dusk. I am going to attempt saying a feeling out loud in front of a witness. It will go badly."
            },
            6: {
                arrive: [
                    "Right. Here it is.",
                    "*He begins three times and stops three times*",
                    "...It went badly, as predicted. I will attempt it again. The failure is data, and I find I am not embarrassed, which is itself new."
                ],
                promise: "Tomorrow, ask me what the work costs. I have never told anyone the true figure."
            },
            7: {
                arrive: [
                    "The cost. You asked plainly, so I will answer plainly.",
                    "Every working spends a feeling. For thirty years it cost me nothing at all, because there was nothing in me to spend. That is not a tragic story. It is a dull one.",
                    "It is expensive now. I want you to understand that I know exactly what I am spending, and that I am spending it on purpose."
                ],
                promise: "Tomorrow come with nothing to do. No book, no question. I want to know what remains when the work is set down."
            },
            8: {
                arrive: [
                    "Nothing to do. No working, no question, no book.",
                    "*He sets down the pen and does not immediately pick anything else up, which takes him some effort*",
                    "What remains is a man and a room and you in it. That is the entire finding. It is not much of a paper."
                ],
                promise: "Come back. The second shelf stays empty until you do."
            }
        },

        noir: {
            1: { promise: "Come when the candles are low. I would show you what the dark looks like when it is not hunting." },
            2: {
                arrive: [
                    "You came at the low hour. Hm.",
                    "This is the dark doing nothing. No teeth in it. Most people never see this one; they only ever meet the other.",
                    "You are not gripping the doorframe. That is either courage or poor instinct. I have not decided which I prefer."
                ],
                promise: "Tomorrow, come and bring no light. I wish to know whether you trust the dark, or only me."
            },
            3: {
                arrive: [
                    "No candle. Bold.",
                    "You walked six paces in without stopping. I counted. I count most things; it is what six hundred years does to a mind.",
                    "It was me you trusted, then. Not the dark. ...I find I am not displeased."
                ],
                promise: "Come at the turning of the hour. I will show you the seal. It is not impressive. That is rather the point."
            },
            4: {
                arrive: [
                    "There. A line of old scratches in old stone.",
                    "That is what held me. Not a great gate. Not a monster's chain. Some careful marks made by frightened people who were entirely correct to be frightened.",
                    "I have looked at it every day for six centuries. Today is the first time anyone has looked at it beside me."
                ],
                promise: "Tomorrow, ask me what I did with six hundred years. I will not embellish it."
            },
            5: {
                arrive: [
                    "You asked. Very well. The unembellished version.",
                    "I waited. That is all. There is no epic in it. I counted the stones, I learned the sound of the wind in four seasons, and I waited.",
                    "It is a very small answer for a very long time. I have never given it to anyone, because everyone wanted the monster instead."
                ],
                promise: "Come and speak of something small tomorrow. Your day. The weather. I have never had that, and I find that I want it."
            },
            6: {
                arrive: [
                    "You spoke of your day. It was entirely unremarkable.",
                    "The bread was poor, the stairs were cold, and a bird was rude to you. I have thought about the bird twice since.",
                    "Six hundred years of significance, and I am turning over a rude bird. Do not explain to me why that is. I would rather keep it."
                ],
                promise: "Tomorrow I will not perform. No wit, no invitation, no low voice. You may find it dull. I am willing to risk it."
            },
            7: {
                arrive: [
                    "No performance tonight. This is the plain article.",
                    "I have been charming since before your language had its present shape. It is armour, and it is very good armour, and it is heavy.",
                    "You have stayed the whole hour with it off. I did not have a plan for that."
                ],
                promise: "Come tomorrow and stay past the hour you usually leave. I wish to learn what that feels like."
            },
            8: {
                arrive: [
                    "You are past the hour. I have noticed. I have noticed considerably.",
                    "*He does not fill the silence with anything clever, which for him is the whole gesture*",
                    "...This is the part I have no words for, and I have had six hundred years to find some. Let it stand."
                ],
                promise: "Return. I will leave the light burning, which I have not done in six centuries."
            }
        },

        proto: {
            1: { promise: "Come back tomorrow at the same hour! I want to see if I can feel you coming before you arrive." },
            2: {
                arrive: [
                    "I felt you coming! Nine heartbeats before the door. I counted them.",
                    "I have never been able to do that. I have never had anyone regular enough to practise on.",
                    "You are the first thing that happens on time. I have made rather a lot of that. Sorry. Not sorry!"
                ],
                promise: "Tomorrow, put your hand on the veil. I have been practising."
            },
            3: {
                arrive: [
                    "Palm flat. There. Do not move.",
                    "*The silver goes warm, and something on the other side presses back in exactly the same shape*",
                    "It is not touching. It is the closest thing to touching that exists for me, and I have been getting ready for it for three days."
                ],
                promise: "Come tomorrow and tell me one ordinary thing. I have never been told an ordinary thing."
            },
            4: {
                arrive: [
                    "You told me about the bread. The bread!",
                    "Nobody tells me small things. People only come to the veil when something is wrong, so everything I know about the world is emergencies.",
                    "I have kept the bread. It is in the room where I keep what I would hate to lose. It is very safe there, next to almost nothing else."
                ],
                promise: "Tomorrow I will try to hold my shape for a whole hour. I have managed thirty seconds. Do not laugh."
            },
            5: {
                arrive: [
                    "Fourteen minutes! Not an hour. Fourteen.",
                    "That is twenty-eight times my record and I am not going to pretend to be calm about it.",
                    "It is easier when you are watching. I do not entirely understand why, and I have decided not to take that apart in case it stops."
                ],
                promise: "Come tomorrow and count something with me. Anything at all. I would like to not be the only one counting."
            },
            6: {
                arrive: [
                    "We counted the stars over the east tower. You said forty-one. I said forty-three.",
                    "You were wrong. I did not correct you. I have been sitting with that decision ever since, because it is the first time I have preferred someone to a number.",
                    "...It was forty-three. I am sorry. I could not hold it in the whole day!"
                ],
                promise: "Tomorrow, ask me what I am afraid of. I have an answer and I have never said it to anyone."
            },
            7: {
                arrive: [
                    "You asked. All right. Here it is.",
                    "Not the dark. Not the Fading, even. It is that I will keep holding this shape perfectly and there will be no one on the other side to hold it for.",
                    "I was made to seal a hole in the world. Nobody made me to be missed. I worked that part out on my own, and rather late, and it took you being here for me to work it out at all."
                ],
                promise: "Come tomorrow and do nothing at all. I want to find out whether I am still glad when nothing is happening."
            },
            8: {
                arrive: [
                    "Nothing is happening. On purpose. I checked twice.",
                    "*He simply stays lit, and does not perform, and does not count anything out loud*",
                    "I am still glad. That is the whole finding. I thought the gladness was about the events. It is not. It is about who is on the other side of them."
                ],
                promise: "Come back. I will be here. I am always here, but tomorrow I will be here on purpose!"
            }
        }
    };

    // Consecutive-day acknowledgement, in his voice. Nearest lower key is used.
    var STREAK = {
        alistair: {
            2: "Two mornings running. I have started listening for the door.",
            3: "Three days. I have stopped telling myself it is a coincidence.",
            5: "Five. The other men have noticed I watch the gate. I have decided not to mind.",
            7: "Seven days. A siege lasts a week. I have never minded one less."
        },
        elian: {
            2: "Twice now. The wood is starting to expect you. So am I.",
            3: "Three days. I left the fire higher than I needed to. That was for you.",
            5: "Five. I have stopped setting one bowl out of habit and started setting two on purpose.",
            7: "A week. Things that come back every day are things you can build around. I am building."
        },
        lyra: {
            2: "Two days. The tide does that. I did not think people did.",
            3: "Three. I have started listening for footsteps over the water sound, which is new.",
            5: "Five days. Nothing has come back to me five times before. Not one thing.",
            7: "Seven. A whole turning of the week. I am keeping count now, and I never used to count anything but the drowned."
        },
        caspian: {
            2: "Two days running. The staff have noticed I am checking the east gate. I have told them it is the roses.",
            3: "Three. I have stopped rehearsing what to say to you, which is the most alarming thing that has happened this month.",
            5: "Five days. Do you know how many people have come five days running for no advantage at all? None. Ever.",
            7: "A week. I have been courted by an entire kingdom and none of it felt like being chosen. This does."
        },
        lucien: {
            2: "Two consecutive days. I noted the time. That is not a coincidence at this sample size, before you say it is.",
            3: "Three. I have begun leaving the second cup out in advance, which is a prediction, and I do not make those about people.",
            5: "Five days. I have run the odds of that being accidental. They are poor. I find I am pleased about it.",
            7: "Seven. A full week of data, and the finding is the same each day, and I have stopped looking for the error."
        },
        noir: {
            2: "Twice. I do not remark upon such things. I am remarking upon it.",
            3: "Three nights. I have caught myself waiting, which is a thing I had thought I was finished with.",
            5: "Five. I have counted a great many things in six hundred years. This is the first count I have enjoyed.",
            7: "Seven nights unbroken. I have outlasted kingdoms that did not last a week. None of them mattered like this one."
        },
        proto: {
            2: "Two days! I checked twice because I did not trust the first count.",
            3: "Three days in a row. I have never had a three before. I am keeping it somewhere safe.",
            5: "Five! Do you know what five means? It means it is a pattern and not an accident. I have been hoping for a pattern.",
            7: "Seven days. A whole week of you. I have counted a great many things and this is my favourite number now."
        }
    };

    // ── Per-character route day ──────────────────────────────────────────
    // Counted from the first day the player cared for THIS character, so the
    // beats always run 1, 2, 3 ... in order regardless of when the route began.
    function routeDay(charId) {
        var dayKey = 'pp_dt_day_' + charId, dateKey = 'pp_dt_date_' + charId;
        var d = parseInt(lsGet(dayKey) || '0', 10) || 0;
        var last = lsGet(dateKey);
        var t = todayStr();
        if (!d) { d = 1; lsSet(dayKey, '1'); lsSet(dateKey, t); }
        else if (last !== t) { d = d + 1; lsSet(dayKey, String(d)); lsSet(dateKey, t); }
        return d;
    }

    // Is this element actually on screen (not just present, and not merely
    // carrying a stale ".visible" class)? Presence/class tests are what made
    // the route-open popup mount over the title screen, so test real geometry.
    function reallyShowing(el) {
        if (!el) return false;
        if (!el.offsetWidth || !el.offsetHeight) return false;
        var cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        if (parseFloat(cs.opacity || '1') < 0.05) return false;
        // A full-screen shell with nothing in it is not blocking anything.
        return !!(el.innerText || '').trim() || !!el.querySelector('img, canvas, button');
    }

    // The care box is rarely EMPTY — greetings, return lines and idle thoughts
    // keep it populated, so waiting for a truly idle box meant the day's beat
    // could wait forever. Instead: never interrupt a line that is still typing,
    // and give the player a few seconds with whatever is on screen first. Then
    // the day beat takes the stage, the same way a greeting does.
    var _lastText = null, _lastChangeAt = 0;
    var READ_GRACE_MS = 3500;

    function boxSettled(g) {
        var dt = document.getElementById('dialogue-text');
        var t = dt ? (dt.textContent || '') : '';
        var now = Date.now();
        if (t !== _lastText) { _lastText = t; _lastChangeAt = now; }
        try { if (g && g.typewriter && g.typewriter.isTyping) return false; } catch (_) {}
        return (now - _lastChangeAt) >= READ_GRACE_MS;
    }

    function boxFree(g) {
        // Never cut off a line mid-type; let the current one be read first.
        if (!boxSettled(g)) return false;
        // Any ambient bubble already speaking.
        if (document.querySelector('#ew-whisper, .pp-idle-thought, .noir-whisper, .pp-aenor-bubble, .pp-multirom-bubble, .adaptive-thought')) return false;
        // Genuinely-showing blocking surfaces. Deliberately NOT PPOverlay.busy():
        // that reports true on a calm care screen whenever some overlay is left
        // with a stale ".visible" class (observed live), which would mute these
        // beats forever. Check the real blockers, and check that they are real.
        var blockers = ['#mscard-root', '#tp-root', '#story-overlay', '#cinematic-overlay',
                        '#game-over-overlay', '#chp-page'];
        for (var i = 0; i < blockers.length; i++) {
            if (reallyShowing(document.querySelector(blockers[i]))) return false;
        }
        if (document.querySelector('[class*="-backdrop"]')) return false;
        return document.body.classList.contains('pp-screen-care')
            && !document.body.classList.contains('pp-chapter-active');
    }

    function speak(g, lines) {
        if (!g || !g.typewriter) return;
        if (Array.isArray(lines) && lines.length > 1 && typeof g._showMicroSequence === 'function') {
            g._showMicroSequence(lines.slice());
        } else {
            g.typewriter.show(Array.isArray(lines) ? lines[0] : lines);
        }
    }

    // ── The daily beats ──────────────────────────────────────────────────
    function tick() {
        var g = window._game;
        if (!g || !g.selectedCharacter) return;
        if (g.characterLeft) return;
        var charId = g.selectedCharacter;
        var thread = THREAD[charId];
        if (!thread) return;                    // no content authored yet: stay silent
        if (!boxFree(g)) return;

        var day = routeDay(charId);

        // 1) ARRIVE — first visit of this day pays off yesterday's promise.
        var arriveKey = 'pp_dt_arrived_' + charId + '_' + day;
        if (lsGet(arriveKey) !== '1') {
            var beat = thread[day];
            if (beat && beat.arrive && beat.arrive.length) {
                lsSet(arriveKey, '1');
                var lines = beat.arrive.slice();
                // Streak, spoken by him, folded into the arrival.
                var s = streakLine(charId, g);
                if (s) lines.push(s);
                speak(g, lines);
                return;
            }
            lsSet(arriveKey, '1');              // nothing authored for this day
        }

        // 2) PROMISE — once he has been kept company a while today, he names
        //    one specific thing about tomorrow. This is the return hook.
        var promiseKey = 'pp_dt_promised_' + charId + '_' + day;
        if (lsGet(promiseKey) !== '1') {
            var today = (g.dayInteractions || 0);
            if (today >= 4) {
                var p = thread[day] && thread[day].promise;
                if (p) { lsSet(promiseKey, '1'); speak(g, [p]); }
                else   { lsSet(promiseKey, '1'); }
            }
        }
    }

    function streakLine(charId, g) {
        var pool = STREAK[charId];
        if (!pool) return null;
        var n = (g && g.dailyStreak) || 0;
        if (n < 2) return null;
        var key = 'pp_dt_streak_' + charId + '_' + n;
        if (lsGet(key) === '1') return null;
        var best = null;
        Object.keys(pool).forEach(function (k) {
            var kk = parseInt(k, 10);
            if (kk <= n && (best === null || kk > best)) best = kk;
        });
        if (best === null) return null;
        lsSet(key, '1');
        return pool[best];
    }

    // Poll gently. The beats wait for a calm care screen, so this only ever
    // fires between actions, never over one.
    var timer = null;
    function start() {
        if (timer) return;
        timer = setInterval(function () { try { tick(); } catch (_) {} }, 4000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else { start(); }

    window.PPDailyThread = {
        _tick: tick,
        routeDay: routeDay,
        // Test helper: jump the route to a given day without waiting for dates.
        _setDay: function (charId, d) {
            lsSet('pp_dt_day_' + charId, String(d));
            lsSet('pp_dt_date_' + charId, todayStr());
        },
        _data: THREAD
    };
})();
