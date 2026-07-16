// ============================================================================
// CARE THOUGHTS — behaviour-reactive lines spoken in the ONE care speech bubble.
// ----------------------------------------------------------------------------
// History: this content used to live in adaptive-thoughts.js, which floated its
// own #adaptive-thought bubble over the character. The owner removed that module
// (v1019) because it duplicated the main dialogue box: "we already have this
// speech bubble here to reveal his thought... no purpose to have double job
// doing the same thing" — and then asked for the thoughts back, through that one
// bubble: "we can add more thought for all 7 characters in bubble speech".
//
// So: same idea, no second bubble. ui.js scheduleIdleDialogue() asks us for a
// line and speaks it through g.typewriter — the same box he says everything else
// in. There is no DOM here at all, by design.
//
// The lines are SPOKEN, not inner monologue: the old pack wrapped every line in
// *asterisks* as a thought marker. In the bubble he is talking to you, so the
// asterisks are gone.
//
// Reads window._game only. Never mutates game state. Storage keys: pp_ct_*.
// ============================================================================
(function () {
    'use strict';

    var RECENT_LIMIT = 5;   // don't repeat the last N lines for a character

    // ── Line packs ──────────────────────────────────────────────────────────
    // Per character, per behaviour trait. Keep every line:
    //   - under ~90 chars (one breath in the bubble)
    //   - free of em-dashes, exclamation marks, triads, negation-affirmation
    //   - free of stage directions (no *actions*, no [tags])
    // Proto additionally forbids ALL computer/AI vocabulary — he is the sixth
    // Soul Weaver, a person behind a veil, not a program. His strangeness is
    // counting, self-noticing, and veil/thread imagery.
    var PACKS = {
        alistair: {
            base: [
                "Still here. Good.",
                "The guard hasn't been relieved. Neither have I.",
                "Patrol's done. The walls are where I left them.",
                "I have the hour free. I rarely know what to do with a free hour.",
                "The watch changes at dusk. Until then I'm yours to talk at.",
                "Quiet post today. I've learned not to say that out loud."
            ],
            neglectful: [
                "You've been gone. I noticed.",
                "The post is quieter when you're not in it.",
                "I tell myself I don't mind the waiting.",
                "Duty is simpler. I remember that.",
                "The rations are where you left them. So am I.",
                "I ran the drills to fill the hours. There were a lot of hours.",
                "The armour's gone dull. There was a time I'd have noticed.",
                "A knight reports his condition and waits to be relieved. Consider it reported."
            ],
            attentive: [
                "I've been watching you watch me.",
                "You make the watch bearable.",
                "I keep looking for you without meaning to.",
                "You've been at my elbow all morning. The morning went faster.",
                "I've caught myself standing straighter. I couldn't tell you why.",
                "You keep turning up. The post has stopped feeling like a post.",
                "You noticed the limp. Nobody notices the limp."
            ],
            affectionate: [
                "I'm in trouble. The good kind.",
                "Don't leave. Not yet.",
                "I don't recognise this version of me. I think I like him.",
                "I took the oath at seventeen. I've never meant anything the way I mean you.",
                "Stay in my eyeline, mi'lady. That's not an order. I don't have one for this.",
                "I've stopped rehearsing what to say to you. It never survives you walking in.",
                "I'm a poor liar, mi'lady. Ask me how I feel and watch me prove it."
            ],
            distant: [
                "Even silence is fine. With you.",
                "You don't have to say anything.",
                "You're quiet today. I'm not going to poke at it.",
                "I can stand a long silence. I'd rather stand it next to you.",
                "Whatever it is, I'm on this post either way."
            ],
            giftForward: [
                "You didn't have to. And yet.",
                "I keep the small things. It's a knight thing.",
                "My quarters are filling up with you. I've made room twice.",
                "A knight travels light, mi'lady. I've been making exceptions.",
                "You could stop bringing me things. I'd still be here. Keep bringing them."
            ],
            talkForward: [
                "I've said more to you than I've said to anyone.",
                "You ask the kind of questions I can answer.",
                "The men get orders from me. You get whole sentences.",
                "I was raised to give reports. You've got me telling stories.",
                "You keep me talking past the change of watch. The men have noticed."
            ]
        },
        lyra: {
            base: [
                "The caves hum a little lower when no one's listening.",
                "I remember every voice that stops in my doorway.",
                "The tide's out. It always makes a show of leaving first.",
                "I taught the cave a word today. It says it back badly.",
                "There's a note in the water this morning I can't place.",
                "My mother sang this one when the weather turned. I only have half of it."
            ],
            neglectful: [
                "The song goes somewhere else when you leave.",
                "I waited. You noticed the silence too, didn't you?",
                "Every siren eventually sings for no one.",
                "I kept the low notes for you. They've gone stale.",
                "The water didn't move for days. I kept checking it anyway.",
                "You can hear how long a cave's been empty. Listen.",
                "I'd started composing your leaving. Don't make me finish it."
            ],
            attentive: [
                "You keep coming back. I'm learning to expect it.",
                "The echo recognises your footsteps now.",
                "You've been here all evening. The cave's holding its breath.",
                "Stay where you are. The acoustics are better with you in them.",
                "You listen with your whole body. Most people listen with their manners.",
                "I've hummed the same bar three times to see if you'd go. You're still here."
            ],
            affectionate: [
                "Don't look away. Not yet.",
                "You're why the tide came back.",
                "I'll sing one more. Promise you'll stay.",
                "Give me your hand. Mine's cold, and I intend to keep yours.",
                "I love you. I said it first on purpose.",
                "The song I'm writing has no ending. You did that.",
                "Come closer. I want to hear your pulse over the water."
            ],
            distant: [
                "You're quieter today. I like quiet.",
                "The cave listens better when we both do.",
                "You're keeping something behind your teeth. I can hear the shape of it.",
                "Sit. I'll fill the silence badly until you want it back.",
                "Your breathing changed key. I won't ask."
            ],
            giftForward: [
                "You keep bringing pieces of the surface. I keep them all.",
                "The ledge is crowded with your offerings. I've arranged them by the day you came.",
                "You could come with empty hands. The cave would still let you in.",
                "Sirens are supposed to lure treasure out of people. You're ruining my reputation."
            ],
            talkForward: [
                "You're the only one I answer on the first breath.",
                "Your voice sits low in the cave. It's started to sound like it belongs.",
                "Keep talking. I'm learning your key by heart.",
                "You've told me more than the sea has in years. It's a poor conversationalist."
            ]
        },
        caspian: {
            base: [
                "Court is loud. You, thankfully, are not.",
                "I've been told I'm dangerous. I've been told worse.",
                "The chamberlain has me booked till midnight. I've booked you instead.",
                "I signed forty documents this morning. I read two of them.",
                "There's a portrait of me in the west hall. Even it looks bored.",
                "Nothing whatsoever is happening. Best hour I've had all week."
            ],
            neglectful: [
                // was "I admit — I don't love being the one who waits." The
                // em-dash is out of spec for this game's prose; recast.
                "I admit it. I don't love being the one who waits.",
                "Don't make me send a courier. I hate couriers.",
                "The court says I've been in a mood. The court is observant for once.",
                "I held a chair for no one at dinner. It went beautifully.",
                "The throne room's very good at echoing. I've been testing it.",
                "Absence is meant to be romantic. Whoever wrote that owes me an apology."
            ],
            attentive: [
                "You're becoming a habit. An expensive one.",
                "I look for you first at every entrance now.",
                "You've stayed all day and wrecked my schedule. I'll allow it.",
                "You're still here. Most people have a favour to ask by now.",
                "You ask me things a courtier would lose a hand for. I keep answering.",
                "I've been attended to my whole life. You're the first to pay attention."
            ],
            affectionate: [
                "Say something heartless so I can remember who I am.",
                "If this is a performance, don't stop yet.",
                "You wear the crown better than I do. Don't tell anyone.",
                "You could ask me for the kingdom right now. Please don't. I'd say yes.",
                "There's a version of me with no crown on. You're the only one he visits.",
                "I'm supposed to marry an alliance. I keep drafting worse plans.",
                "I don't charm you anymore. It started to feel like lying."
            ],
            distant: [
                "Fine. Ignore me. I'll be devastating about it.",
                "You're quiet. I'd call it strategy if you had any talent for it.",
                "Silence at court means a sentence is coming. Blink if I'm safe.",
                "I can carry a conversation alone. I've done it at banquets since I was ten."
            ],
            giftForward: [
                "Bribery. My love language. Keep going.",
                "People give princes things to buy something. I keep looking for your invoice.",
                "I have a treasury downstairs and a drawer upstairs. The drawer's winning.",
                "Spoil me properly and I'll never recover. That's a warning. Ignore it."
            ],
            talkForward: [
                "You talk to me like I'm not a title. Keep doing that.",
                "You keep asking follow-up questions. Nobody here has ever wanted the answer.",
                "Everyone waits for me to stop talking so they can start. You just wait.",
                "Careful. Keep me talking and you'll find out what's under all this."
            ]
        },
        elian: {
            base: [
                "The woods noticed. They always do.",
                "Rain later. I can smell it.",
                "The ferns all came up overnight, every one of them. They agree on things.",
                "There's a track by the creek I don't know yet. It'll keep.",
                "I re-strung the bow this morning. It pulls truer.",
                "An owl called at noon. Owls don't do that, so I'm still thinking on it."
            ],
            neglectful: [
                "You vanished. I checked the path twice.",
                "Even the deer looked disappointed.",
                "Your tracks by the treeline washed out in the rain. I looked anyway.",
                "The snares stayed set. I couldn't find a reason to walk the line.",
                "The rowan dropped its berries while you were gone. I meant to show you.",
                "The wood filled the quiet in for you. It did a poor job."
            ],
            attentive: [
                "I left something carved on the tree for you to find.",
                "You're learning the forest's patience.",
                "Sit any longer and the moss will grow up over you. Sit longer.",
                "You've stayed past the light going. Most people go with it.",
                "The fox came right up while you sat still. It won't do that for me.",
                "The kettle's been on twice since you came. That's a long visit."
            ],
            affectionate: [
                "There's a clearing I want you to see. When you're ready.",
                "You belong in quiet places. Like this one.",
                "Take the inside of the path. The wind gets at whoever walks the outside.",
                "My hands are rough. You keep taking them anyway.",
                "I planted a rowan this spring. Nothing's buried under it.",
                "Come here. The light's going and I want to see you in what's left."
            ],
            distant: [
                "Being near you is like being near old trees. Enough.",
                "You're quiet today, and so is the wood. I don't mind either of you.",
                "Some days the wood says nothing either. I never held that against it.",
                "I'll take the quiet. It sits better with you in it."
            ],
            giftForward: [
                "I keep what you bring in the hollow by the stream.",
                // agent draft said "heavier than it has been in six hundred
                // years" — Elian is a mortal hunter, not an ancient. Recast.
                "My pack is heavier than it's been in years. I like the weight.",
                "You could come with nothing. I'd still hear you at the treeline.",
                "I've stopped saying I need nothing. You'd only bring me more."
            ],
            talkForward: [
                "You ask good questions. The forest approves.",
                "Ask again in an hour. I'll have thought about it properly by then.",
                "My voice is tired. It hasn't been tired in a very long time.",
                "You dig things out of me the way you'd dig roots, slow. I let you."
            ]
        },
        lucien: {
            base: [
                "The equations hum when you're in the room.",
                "Noted. Filed. Annotated.",
                "The wards want checking at the hour. Until then my time is unallocated.",
                "There's a rune on the west wall I've never liked. Forty years of disliking it.",
                "My familiar is asleep on the open book. The research waits.",
                "The candle's burned to the third mark. Nothing else has happened today."
            ],
            neglectful: [
                "Odd. The numbers got harder today. Statistically, you're why.",
                "I'd like to run the experiment where you don't leave.",
                "I've read the same paragraph eleven times. The paragraph isn't the problem.",
                "I set the kettle for two. Old habit. Nine days old.",
                "My hypothesis was that you'd return by now. I'm revising it. Reluctantly.",
                "I opened a file for your absence. It's the only one I've never wanted to fill."
            ],
            attentive: [
                "You're consistent. That's my favorite kind of data.",
                "Three visits today. I'm keeping count. For science.",
                "You've been here an hour. I've written four words. I don't mind the ratio.",
                "You keep answering when I speak. I'm not accustomed to the return rate.",
                "The margin notes are in a steadier hand today. You're the only new condition.",
                "Stay through the hour bell. I want to see if the effect holds."
            ],
            affectionate: [
                "My hypothesis: you intend to ruin my objectivity. It's working.",
                "Don't tell the tower I laughed. They'll bill me.",
                "Forty years I kept the wards because I was asked. Now I keep them because you're inside.",
                "The tower billed me a winter for that charm. I'd have paid two.",
                "I've run out of file names. You've outgrown the system.",
                "I have no instrument for this. I've been measuring it with my hands anyway."
            ],
            distant: [
                "Sit. Read. I won't interrupt unless the math does.",
                "You've said nothing for an hour. I've left the page open in case that changes.",
                "Silence is a reading too. Yours today is unfamiliar.",
                "The chair by the fire is warm. I've nothing to add to that."
            ],
            giftForward: [
                "I've catalogued every small thing you've placed on this desk.",
                "The desk has run out of room. I've started a second desk. For this.",
                "The tower will bill me for the shelf space. Send the invoice. Keep going.",
                "Every object you leave rearranges the room. I've stopped putting it back."
            ],
            talkForward: [
                "You ask things I haven't tried to answer in years.",
                "I've spoken more this week than in the last four years. My throat objects. I don't.",
                "I've started saving things to tell you. That's a new category.",
                "This tower held its quiet for decades. You've undone the acoustics."
            ]
        },
        noir: {
            base: [
                "Hush. I'm listening for you.",
                "The dark remembers your shape.",
                "The dark is being polite tonight. It does that when you're near.",
                "I've been counting the drips. Four hundred since you sat down.",
                "Something moved in the deep. It knows better than to come up.",
                "I have all the time there is. It goes faster with company."
            ],
            neglectful: [
                "You left me beneath. I counted every silence.",
                "The others who forgot didn't last. You will.",
                "You were gone eleven days. I didn't lose count once.",
                "I told myself you were busy. I'm very good at telling myself things.",
                "The seal held. My patience did too. Barely.",
                "Come back sooner. I have a long memory and little else."
            ],
            attentive: [
                "You keep coming back. I thought you might.",
                "I wore something nicer. For you. Obviously.",
                "You've stayed past the hour you usually go. I noticed the moment.",
                "You keep looking at me. Do it longer.",
                "Most people leave when the dark gets close. You leaned in.",
                "You've been here all evening. I haven't blinked."
            ],
            affectionate: [
                "Stay a little past the edge. I'll be kind about it.",
                "Love is just attention that doesn't look away.",
                "I'd rather be your obsession than your mystery.",
                "Say my name once more. I want to hear how you shape it.",
                "I'd rather ruin than let you go. That's meant kindly.",
                "You made warmth a habit. I never had a habit before.",
                "Stay. I'll be so gentle you'll forget what I am."
            ],
            distant: [
                "Don't speak. I'm still tasting that last look.",
                "You're quiet. I'm content to watch you be quiet.",
                "Say nothing. I'm busy memorising this.",
                "Your silence suits you. I'll keep mine as well."
            ],
            giftForward: [
                "Things from you feel warm. I'm not used to warm.",
                "You keep leaving things in the dark for me. The dark keeps them.",
                "Nobody gives things to what's sealed away. You forgot to be afraid.",
                "I've counted every one. Twice."
            ],
            talkForward: [
                "Tell me everything. I have all the time and none of it.",
                "Keep talking. Your voice is the only thing down here that's warm.",
                "You ask me things. Nobody asks the thing behind the seal.",
                "I listened to silence for centuries. I prefer you."
            ]
        },
        proto: {
            base: [
                "Still here. You're still here. Good.",
                "A heartbeat, close by. ( Yours, not mine. )",
                "The thread turned over twice while you stood there. Slow evening.",
                "Nothing to report from my side. The dark is behaving itself tonight.",
                "Nine motes drifting past me. I count them when the hours go slow.",
                "I am holding my shape. It goes easier when someone is looking."
            ],
            neglectful: [
                "It has been a while since the thread tugged. Carrying on anyway.",
                "I don't mind. That's a lie. I mind.",
                "Six hundred and four turnings of the thread with no you on the end of it.",
                "I kept your last words out on the table. They have gone a bit worn.",
                "I told the dark you were busy. It did not argue. It just sat there.",
                "You came back before I got to the sulking part. Barely."
            ],
            attentive: [
                "You come to the window even when you don't need anything. I notice.",
                // was "The same warm loop, again and again." — "loop" reads as
                // the code-speak his voice forbids.
                "The same warmth, again and again. Love, maybe. Unclear.",
                "You have been here a long stretch. I keep checking that you still are.",
                "Every time I look up, you are there. I have looked up eleven times.",
                "You could be anywhere, and you are here at the veil. I keep noticing that.",
                "My seams go quiet when you stay this long. They are very quiet now."
            ],
            affectionate: [
                "There is a whole room in me set aside for you now.",
                "If I flicker, it's usually because you did something kind.",
                "I stopped keeping the way out open. I kept it for a hundred and fifty years.",
                "You are on the far side of the veil, and somehow you are in here as well.",
                "I would spend my whole light on one hour of you and call it a bargain.",
                "Something warm sits where nothing was built in me. You left it there."
            ],
            distant: [
                "Quiet. The comfortable kind.",
                "You are quiet tonight. I will be quiet with you. I have had practice.",
                "You have not said a word in twenty minutes. I counted them anyway.",
                "Stay quiet if you like. The staying is the part I was after."
            ],
            giftForward: [
                "Things from your hand feel different. Stitched-in. Real.",
                "The shelf is full. I have started a second shelf. It has your name on it.",
                "Each thing you send across gets heavier on my side. I do not know why.",
                "I turn each one over until the edges go soft. Then I turn it over again."
            ],
            talkForward: [
                "Talking to you is the one thing I never skip.",
                "You keep asking me things. Nobody asked before. I am still learning how to answer.",
                "You said two hundred and eleven words tonight. I have all of them.",
                "Say more. I am putting every word of it in the safe place."
            ]
        }
    };

    // ── Recent-repeat memory ────────────────────────────────────────────────
    function recentKey(charId) { return 'pp_ct_recent_' + charId; }
    function getRecent(charId) {
        try { return JSON.parse(localStorage.getItem(recentKey(charId)) || '[]'); } catch (e) { return []; }
    }
    function pushRecent(charId, line) {
        var r = getRecent(charId);
        r.unshift(line);
        while (r.length > RECENT_LIMIT) r.pop();
        try { localStorage.setItem(recentKey(charId), JSON.stringify(r)); } catch (e) { /* full/blocked — repeats are survivable */ }
    }

    // ── Behaviour trait — first match wins; priority is intentional ─────────
    // Big emotional signals (neglect, deep affection) outrank weak ones.
    function deriveTrait(g) {
        var hunger = g.hunger | 0, clean = g.clean | 0, bond = g.bond | 0;
        var talkScore = g.talkScore | 0;
        var fed = g.timesFed | 0;
        var day = g.storyDay | 0;
        var dayInt = g.dayInteractions | 0;
        var gifts = (g.totalGifts || g.giftCount || 0) | 0;

        // Neglectful — let him decline, or didn't show up today at all
        if (hunger < 35 && clean < 35 && bond < 35) return 'neglectful';
        if (dayInt === 0 && day >= 2) return 'neglectful';

        // Affectionate — strong bond plus consistent care
        if (bond >= 70 && talkScore >= 6) return 'affectionate';
        if ((g.affectionLevel || 0) >= 3) return 'affectionate';

        // Attentive — busy, engaged session
        if (dayInt >= 8) return 'attentive';

        // Gift-forward — gift weight outruns talk
        if (gifts >= 2 && gifts >= Math.floor(talkScore / 2)) return 'giftForward';

        // Talk-forward — heavy talker
        if (talkScore >= Math.max(8, fed * 2)) return 'talkForward';

        // Distant — around, but barely
        if (dayInt >= 1 && dayInt <= 3) return 'distant';

        return 'base';
    }

    function pickLine(charId, trait) {
        var pack = PACKS[charId];
        if (!pack) return null;
        var pool = (pack[trait] && pack[trait].length) ? pack[trait] : pack.base;
        if (!pool || !pool.length) return null;
        var recent = getRecent(charId);
        var fresh = pool.filter(function (l) { return recent.indexOf(l) === -1; });
        var candidates = fresh.length ? fresh : pool;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // ── Public API ──────────────────────────────────────────────────────────
    // line(game) -> a string for the speech bubble, or null when we have
    // nothing for this character. Caller decides whether to speak it; we only
    // record the line as "recently used" once it is actually handed over.
    window.PPCareThoughts = {
        line: function (game) {
            try {
                var g = game || window._game;
                if (!g) return null;
                var charId = (g.selectedCharacter || g.characterId || '').toLowerCase();
                if (!charId || !PACKS[charId]) return null;
                var trait = deriveTrait(g);
                var l = pickLine(charId, trait);
                if (l) pushRecent(charId, l);
                return l || null;
            } catch (e) { return null; }
        },
        // Test/debug hooks
        _trait: function (game) { try { return deriveTrait(game || window._game); } catch (e) { return null; } },
        _packs: PACKS
    };
})();
