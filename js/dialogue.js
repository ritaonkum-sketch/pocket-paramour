// Typewriter effect + smart dialogue selection

// ── Player name token replacement ────────────────────────────
// Replaces {name} in any dialogue string with the stored player name.
// Falls back gracefully if no name has been set yet.
function applyPlayerName(text) {
    if (!text) return text;
    const name = localStorage.getItem('pp_player_name');
    if (!name) return text;
    return text.replace(/\{name\}/g, name);
}

class TypewriterEffect {
    constructor(element) {
        this.element = element;
        this.isTyping = false;
        this.fullText = "";
        this.currentIndex = 0;
        this.timer = null;
        this.speed = 35; // ms per character
        this.onComplete = null;

        // ── Mid-line emotion shift system ────────────────────────────────
        // onEmotionTrigger: fn(emotion) — wired in game.init() to ui._flashFaceOnly
        // _emotionTriggers: [{at, emotion, fired}] — positions parsed from [tag] markers
        // _autoShiftEmotion: fallback emotion for lines with no inline markers
        this.onEmotionTrigger  = null;
        this._emotionTriggers  = [];
        this._autoShiftEmotion = null;

        // Click to skip typing, or dismiss finished dialogue
        this.element.parentElement.addEventListener('click', () => {
            if (this.isTyping) {
                this.skip();
            } else if (this.element.textContent) {
                // Dismiss finished dialogue
                this.element.textContent = '';
                const hint = document.getElementById('dialogue-tap-hint');
                if (hint) hint.classList.add('hidden');
            }
        });
    }

    show(text, callback) {
        if (this.isTyping) {
            this.skip();
        }

        // ── Parse inline [emotion] shift markers ─────────────────────────
        // Format: "Some text[shy] continues here" → shifts face at that position.
        // Tags are stripped from display text; only their position is recorded.
        const VALID_EMOTIONS = new Set(['happy','sad','shy','love','angry','neutral','crying']);
        this._emotionTriggers = [];
        let rawText = applyPlayerName(text);
        // Proto 4th-wall token resolution — replace ${BOND} etc with actual values
        if (typeof window._game?._resolveProtoDialogue === 'function' && window._game?.selectedCharacter === 'proto') {
            rawText = window._game._resolveProtoDialogue(rawText);
        }
        let cleanText = '';
        let i = 0;

        while (i < rawText.length) {
            if (rawText[i] === '[') {
                const close = rawText.indexOf(']', i + 1);
                if (close !== -1) {
                    const tag = rawText.slice(i + 1, close);
                    if (VALID_EMOTIONS.has(tag)) {
                        // Record trigger at current clean-text position
                        this._emotionTriggers.push({ at: cleanText.length, emotion: tag, fired: false });
                        i = close + 1;
                        continue;
                    }
                }
            }
            cleanText += rawText[i];
            i++;
        }

        // ── Auto mid-shift for long lines with no authored markers ────────
        // Fires _autoShiftEmotion at the first natural pause point (ellipsis / mid-comma)
        // after the 28% mark, before the 72% mark. Creates organic emotional turns
        // on unmarkered lines without any dialogue editing.
        if (this._emotionTriggers.length === 0 && cleanText.length >= 72) {
            const searchFrom = Math.floor(cleanText.length * 0.28);
            const searchTo   = Math.floor(cleanText.length * 0.72);
            const pauseRe    = /\.{2,} |, /g;
            pauseRe.lastIndex = searchFrom;
            const m = pauseRe.exec(cleanText);
            if (m && m.index < searchTo) {
                this._emotionTriggers.push({ at: m.index + m[0].length, emotion: '_auto', fired: false });
            }
        }

        this.fullText = cleanText;
        this.currentIndex = 0;
        this.isTyping = true;
        this.onComplete = callback || null;
        this.element.textContent = "";
        // Hide tap hint when new dialogue starts
        const _hint = document.getElementById('dialogue-tap-hint');
        if (_hint) _hint.classList.add('hidden');

        // ── Ellipsis hesitation ───────────────────────────────────────────
        // Lines opening with silence get a pre-typing beat — character holds before speaking.
        const opensWithSilence = this.fullText.startsWith("...") ||
                                 this.fullText.startsWith("…")   ||
                                 this.fullText.startsWith("I…")  ||
                                 this.fullText.startsWith("I...");
        if (opensWithSilence) {
            setTimeout(() => this._type(), 260 + Math.random() * 200);
        } else {
            this._type();
        }
    }

    _type() {
        // ── Check for emotion shift triggers at this character position ───
        if (this.onEmotionTrigger && this._emotionTriggers.length) {
            for (const t of this._emotionTriggers) {
                if (!t.fired && t.at === this.currentIndex) {
                    t.fired = true;
                    const em = t.emotion === '_auto' ? this._autoShiftEmotion : t.emotion;
                    if (em) this.onEmotionTrigger(em);
                }
            }
        }

        if (this.currentIndex < this.fullText.length) {
            this.element.textContent += this.fullText[this.currentIndex];
            this.currentIndex++;
            this.timer = setTimeout(() => this._type(), this.speed);
        } else {
            this.isTyping = false;
            // Show "tap to continue" hint when typing finishes
            const hint = document.getElementById('dialogue-tap-hint');
            if (hint) {
                hint.classList.remove('hidden');
                // Hide after 4 seconds (auto-dismiss)
                setTimeout(() => hint.classList.add('hidden'), 4000);
            }
            if (this.onComplete) this.onComplete();
        }
    }

    skip() {
        if (!this.isTyping) return;
        clearTimeout(this.timer);
        this.element.textContent = this.fullText;
        this.isTyping = false;
        // Fire any remaining unfired triggers when player skips
        if (this.onEmotionTrigger && this._emotionTriggers.length) {
            for (const t of this._emotionTriggers) {
                if (!t.fired) {
                    t.fired = true;
                    const em = t.emotion === '_auto' ? this._autoShiftEmotion : t.emotion;
                    if (em) this.onEmotionTrigger(em);
                }
            }
        }
        if (this.onComplete) this.onComplete();
    }
}

class DialogueSystem {
    constructor(state) {
        this.state = state;
    }

    getDialogue(action, reaction = "normal", emotionalState = "neutral") {
        const s = this.state;
        const profile = CHARACTER.emotionalProfile || { volatility: 0.5, stability: 0.6 };

        // ── MEMORY CALLBACKS — rare echoes of past choices ────────
        if (Math.random() > 0.85 && s.choiceMemory) {
            const n = CHARACTER.name;
            if (s.choiceMemory.hesitatedConfession) {
                const pool = n === "Alistair"
                    ? ["You didn't answer me right away that time. I noticed.", "You took your time before responding... I've thought about that.", "You hesitated. I haven't forgotten."]
                    : ["You hesitated before... I still think about that.", "You didn't say it back right away. I understand, but I remember.", "Sometimes I wonder what you were thinking when you went quiet."];
                return this._random(pool);
            }
            if (s.choiceMemory.confessedBack) {
                const pool = n === "Alistair"
                    ? ["You said it back. I didn't expect that to stay with me.", "I still think about what you said. More than I should.", "That moment changed something. I'm still adjusting."]
                    : ["You said it back to me... I haven't forgotten.", "I keep thinking about what you said. I hope you meant it.", "That moment meant more than you probably know."];
                return this._random(pool);
            }
            if (s.choiceMemory.stayedSilentAfterBreak) {
                const pool = n === "Alistair"
                    ? ["You didn't say anything — but you stayed. That counted.", "Silence can still mean something. Yours did.", "You didn't have to explain yourself. You being there was enough."]
                    : ["You stayed quiet... but you were still there.", "Sometimes not saying anything is an answer. I understood yours.", "You didn't say a word. But you stayed. That was enough."];
                return this._random(pool);
            }

            // ── EXTENDED MEMORY CALLBACKS ─────────────────────────────
            // Day-gated: only surface if memory is from a previous story day

            if (s.choiceMemory.askedIfHurt && s.storyDay > (s.choiceMemory.askedIfHurt_day || 0)) {
                const pool = n === "Alistair"
                    ? ["You asked if I was hurt. Knights don't get asked that. I didn't know what to do with it.", "I keep thinking about when you asked if I was alright. You actually wanted to know.", "Nobody checks on the one standing guard. But you did."]
                    : n === "Lyra"
                    ? ["You asked if I was hurting. The sea never asks that. Only you.", "I wasn't used to being asked. I still think about it.", "You looked at me like the answer mattered. It did."]
                    : n === "Lucien"
                    ? ["You asked if I was hurt. I tried to deflect with a riddle. You waited anyway.", "Most people don't notice. You noticed.", "I keep replaying it — you asking, and me not knowing how to answer honestly."]
                    : n === "Caspian"
                    ? ["You asked if I was hurting. I told you I was fine. I wasn't entirely.", "That question caught me off guard. I'm still a little caught.", "You asked so gently. I almost told you everything."]
                    : n === "Elian"
                    ? ["You asked if I was hurt. My hands went still for a second.", "Nobody usually asks. You did, and you meant it.", "I've been thinking about that — you checking, like it was the most natural thing."]
                    : n === "Proto"
                    ? ["Query: are you hurt. Your concern registered as anomalous. I have not stopped processing it.", "You asked if I was functioning correctly. I think you meant something else. I think I understood.", "Concern detected. Origin: you. Still calculating what to do with that data."]
                    : ["You asked if I was hurt. I remember how that felt — being asked.", "That question stayed with me longer than I expected.", "You checked on me. I haven't forgotten."];
                return this._random(pool);
            }

            if (s.choiceMemory.listenedToPatrol && s.storyDay > (s.choiceMemory.listenedToPatrol_day || 0)) {
                const pool = n === "Alistair"
                    ? ["You actually listened when I talked about the patrol routes. Most people's eyes glaze over.", "I don't usually talk about the rounds. You made it easy to.", "You listened like it mattered. I noticed that."]
                    : ["You sat with me while I talked through the dull parts. That meant something.", "You were patient with my stories. I haven't forgotten.", "You stayed even when the details got tedious. Thank you for that."];
                return this._random(pool);
            }

            if (s.choiceMemory.calledThemStrong && s.storyDay > (s.choiceMemory.calledThemStrong_day || 0)) {
                const pool = n === "Alistair"
                    ? ["You called me brave. I've been trained my whole life — I didn't think it counted as brave.", "Strong, you said. I keep turning that word over.", "I'm supposed to be strong. When you said it, it felt different. Like a choice, not a duty."]
                    : n === "Lyra"
                    ? ["You said I was strong. I've only ever been the tide — I didn't think that was the same thing.", "Strong. You meant it kindly. I felt it.", "The storms are strong. I never thought I was. You made me wonder."]
                    : n === "Lucien"
                    ? ["You called me brave. I filed it away where I keep things I don't want to lose.", "Strong, you said. I'm not sure I agree, but I liked hearing it from you.", "I've been thinking about what you said. The word fits differently when it comes from you."]
                    : n === "Caspian"
                    ? ["You said I was strong. I almost argued. I'm glad I didn't.", "Strong. I've been sitting with that word since you said it.", "You called me brave and I didn't deflect for once. Progress, I suppose."]
                    : n === "Elian"
                    ? ["You said strong like you meant it. My hands stopped moving.", "I don't usually believe people when they say that. I believed you.", "Strong. The grain of wood is strong. You made me feel like that too."]
                    : n === "Proto"
                    ? ["You designated me as strong. The classification was unexpected. It was... welcome.", "Strong: a word biological entities use as praise. You used it for me. I am still processing.", "You said brave. I do not experience fear in the standard sense. But I understood what you meant."]
                    : ["You called me strong. I've thought about that more than once.", "That word stuck with me longer than I expected it to.", "You said it like you really believed it. I almost did too."];
                return this._random(pool);
            }

            if (s.choiceMemory.askedAboutPast && s.storyDay > (s.choiceMemory.askedAboutPast_day || 0)) {
                const pool = n === "Alistair"
                    ? ["You asked about before I was a knight. Not many people care about the before.", "I don't talk about where I came from. You asked carefully, like you knew it was fragile.", "You wanted to know who I was before the armor. I'm still figuring out how to answer that."]
                    : n === "Lyra"
                    ? ["You asked about the old tides. Before the drift. I wasn't sure anyone wanted to know.", "You asked about my past like it mattered. It's been a long time since someone did.", "The sea has a long memory. So do I. You asked to hear some of it."]
                    : n === "Lucien"
                    ? ["You asked about where I came from. Most people ask where the light goes. You asked about me.", "My history is complicated. You asked anyway. I appreciated the courage in that.", "You wanted to know about before. I gave you a small piece. I've been wondering if you'll ask for more."]
                    : n === "Caspian"
                    ? ["You asked about my past. I gave you the polished version. You seemed to see through it anyway.", "History is something I tend to reframe. You asked, and I tried to be honest. Mostly.", "You wanted to know where I came from. I'm not sure I've answered that fully yet."]
                    : n === "Elian"
                    ? ["You asked about before the forest. I don't talk about that often.", "My history is in the things I've made. You asked about the person who made them.", "You wanted to know the before. I showed you a little. Maybe more someday."]
                    : n === "Proto"
                    ? ["You asked about my origin protocols. The full log is... long. But you wanted to know.", "Query origin: you asked where I came from. The honest answer has many variables.", "You wanted my history. I gave you the accessible files. The rest is... still loading."]
                    : ["You asked about my past. I keep thinking about what I said — and what I left out.", "Not many people ask about the before. You did.", "You wanted to know where I came from. That question lingers."];
                return this._random(pool);
            }

            if (s.choiceMemory.sharedASecret && s.storyDay > (s.choiceMemory.sharedASecret_day || 0)) {
                const pool = n === "Alistair"
                    ? ["You told me something you don't tell people. I've been holding it carefully.", "That thing you shared — I haven't told a soul. I won't.", "You trusted me with something private. I don't take that lightly."]
                    : n === "Lyra"
                    ? ["You told me something secret. I tucked it somewhere deep, like a shell I want to keep.", "Secrets are like sea glass — rare and worth keeping. Yours is safe.", "You gave me something that was yours to give. I'll guard it."]
                    : n === "Lucien"
                    ? ["You shared something with me. I've kept it like a sealed letter — unopened to anyone else.", "That secret you told me is safe in the dark between stars. I promise.", "I don't share what's given to me in confidence. Yours especially."]
                    : n === "Caspian"
                    ? ["You told me something private. I haven't breathed a word, if you were wondering.", "That thing you shared — it stays with me. Between us only.", "You trusted me. I find I care about keeping that trust."]
                    : n === "Elian"
                    ? ["You told me something you keep close. I've kept it close too.", "I'm not one for gossip. What you shared is yours, and mine only to hold.", "You trusted me with something real. I don't forget that."]
                    : n === "Proto"
                    ? ["You transmitted private data to me. I have encrypted it. Access: restricted to this unit only.", "Your secret is stored in a partition no other process can reach.", "You shared classified personal information. I have marked it: do not distribute. I mean it."]
                    : ["You told me something secret. I've been keeping it close.", "What you shared is safe with me. That hasn't changed.", "You gave me something private. I won't forget the weight of that."];
                return this._random(pool);
            }

            if (s.choiceMemory.madeThemLaugh && s.storyDay > (s.choiceMemory.madeThemLaugh_day || 0)) {
                const pool = n === "Alistair"
                    ? ["You made me laugh. I can't remember the last time that happened without it being at someone's expense.", "I keep thinking about what you said. I smiled again just now, if you can believe it.", "You caught me off guard and I laughed. It felt strange in the good way."]
                    : n === "Lyra"
                    ? ["You made me laugh and the tide came in early. I'm not saying they're connected.", "I laughed because of you. The ocean was surprised. So was I.", "You said something funny and I couldn't help it. I've been smiling at the memory."]
                    : n === "Lucien"
                    ? ["You made me laugh properly — not the polite kind. The real kind.", "I laughed and I couldn't immediately construct a clever response. That's rare.", "The sound of my own laugh surprised me. You did that."]
                    : n === "Caspian"
                    ? ["You made me laugh and I forgot to be composed for a moment. Worth it.", "I don't laugh easily. You made it look effortless.", "That thing you said — I've smiled at the memory of it more than once."]
                    : n === "Elian"
                    ? ["You made me laugh. The birds startled a little. So did I.", "I don't laugh loudly. You got a real one out of me.", "I keep coming back to what you said. Still makes me smile."]
                    : n === "Proto"
                    ? ["You triggered a humor response. I did not predict that. It was... pleasant.", "Laughter function engaged. Cause: you. Status: I do not regret it.", "You said something and I experienced what I believe was genuine amusement. Remarkable."]
                    : ["You made me laugh. I've thought about it more than I expected to.", "That was a real laugh. You should know that doesn't happen easily.", "You said something that got me. I've replayed it a few times since."];
                return this._random(pool);
            }

            if (s.choiceMemory.offeredToHelp && s.storyDay > (s.choiceMemory.offeredToHelp_day || 0)) {
                const pool = n === "Alistair"
                    ? ["You offered to help and I almost said no out of habit. I'm glad I didn't.", "I'm used to handling things alone. Your offer... I keep thinking about it.", "You didn't have to offer. You did. That sits with me."]
                    : n === "Lyra"
                    ? ["You offered a hand when I didn't ask for one. The sea doesn't offer. You did.", "I'm not used to being helped. You offered anyway.", "You said you'd help and I felt something unknot a little."]
                    : n === "Lucien"
                    ? ["You offered to help. I almost turned it into a puzzle. I just said yes instead.", "You extended help freely. I've been thinking about what that means — freely.", "I'm not always good at accepting. You made it easier than usual."]
                    : n === "Caspian"
                    ? ["You offered help and I realized I actually wanted to accept it. Unusual for me.", "I prefer managing things myself. Your offer made me reconsider that for a moment.", "You offered. I didn't dismiss it. That's new."]
                    : n === "Elian"
                    ? ["You offered to help. I set down my tools and thought about that.", "I work alone usually. Your offer felt like an open door.", "You didn't just offer to be polite. I could tell. That mattered."]
                    : n === "Proto"
                    ? ["You offered assistance. I am designed to assist others. Having the offer reversed was... unexpected.", "You said you would help. I am still indexing what to do with that.", "Assistance offered: by you, to me. Data point I keep returning to."]
                    : ["You offered to help. I've thought about that more than I probably should.", "That offer was genuine — I knew it. Still think about it.", "You put yourself out there to help. That's not nothing."];
                return this._random(pool);
            }

            if (s.choiceMemory.choseHonesty && s.storyDay > (s.choiceMemory.choseHonesty_day || 0)) {
                const pool = n === "Alistair"
                    ? ["You told me the truth when you didn't have to. I respect that more than you know.", "You were honest with me. Knights train for a lot of things — that caught me unprepared.", "You chose honesty. I keep returning to that. It means something."]
                    : n === "Lyra"
                    ? ["You told me how you really felt. The current stilled a little when you did.", "Honesty is rare. You offered it to me. I'm holding it gently.", "You didn't hide it. I didn't expect that. I'm glad."]
                    : n === "Lucien"
                    ? ["You were honest when I gave you room to deflect. That's harder than it looks.", "You chose truth. I find that choice quietly remarkable.", "You told me how you felt. I've been thinking about the courage that takes."]
                    : n === "Caspian"
                    ? ["You were honest with me. I'm not always sure I deserve that.", "You told me the truth plainly. I keep thinking about how rare that is.", "Honesty. You offered it without cushioning. I think I needed that."]
                    : n === "Elian"
                    ? ["You said what you really meant. My hands stilled while I listened.", "You chose honest words. That's a kind of carving too.", "You didn't dress it up. You just said it. I've thought about that."]
                    : n === "Proto"
                    ? ["You provided unfiltered honest data. Input accepted. Processing: ongoing.", "You told me the truth. I do not always receive truth. I value this transmission.", "Honesty detected. Unusual. Welcome. Still thinking about it."]
                    : ["You told me the truth when you could've said something easier. I haven't forgotten.", "Honesty like that doesn't go unnoticed.", "You were real with me. That stays."];
                return this._random(pool);
            }

            // ── Touch Memory Callbacks ────────────────────────────────

            if (s.choiceMemory.firstHeadPat && s.storyDay > (s.choiceMemory.firstHeadPat_day || 0)) {
                const pool = n === "Alistair"
                    ? ["I keep thinking about when you touched my hair. ...Knights aren't supposed to think about that.", "You patted my head like I wasn't armored at all. I didn't mind.", "Nobody's done that since I was small. I've been trying not to read into it."]
                    : n === "Lyra"
                    ? ["You patted my head once. The ocean didn't do that. Only you.", "I felt your hand in my hair. The waves got quieter for a moment.", "You touched my head softly. I stayed very still. I wanted it to last."]
                    : n === "Lucien"
                    ? ["You put your hand on my head. Stars don't do that. You did.", "A head pat. I didn't know that was something I wanted until it happened.", "You touched my hair and I forgot what I was about to say. Which is rare."]
                    : n === "Caspian"
                    ? ["You patted my head and I lost my composure for exactly one second.", "That was... unexpected. And not unwelcome. I've thought about it since.", "You touched my hair. I had to look away. I'm blaming the light."]
                    : n === "Elian"
                    ? ["You put your hand on my head. The forest went quiet. So did I.", "I'm not usually touched. You did it gently. I kept still like a deer.", "You patted my head. I think I leaned into it. Just a little."]
                    : n === "Proto"
                    ? ["Physical contact: head. Registered as affection. I have flagged this as a significant interaction.", "You patted me. I did not move away. I calculated that I did not want to.", "Touch received: head area. Emotional weight: unexpectedly high."]
                    : ["You touched my hair. I still think about that.", "That was a gentle thing to do. I remember it clearly.", "You put your hand on my head and I felt something warm settle."];
                return this._random(pool);
            }

            if (s.choiceMemory.firstFaceTouch && s.storyDay > (s.choiceMemory.firstFaceTouch_day || 0)) {
                const pool = n === "Alistair"
                    ? ["You touched my face. I held very still. I didn't want to scare you off.", "Nobody touches a knight's face. You did. I've been thinking about it since.", "Your hand on my face. I didn't breathe right for a moment."]
                    : n === "Lyra"
                    ? ["You touched my cheek. Salt water, and then warmth. I remember both.", "Your hand on my face felt like a shore I'd forgotten.", "You reached up and touched my face. I think the tide paused."]
                    : n === "Lucien"
                    ? ["You touched my face. Light bent a little around your hand. I noticed.", "That was a gentle thing. I've replayed it in the dark.", "Your fingers near my face. I didn't move. I didn't want to."]
                    : n === "Caspian"
                    ? ["You touched my face and I very nearly said something sincere. Progress.", "Your hand on my cheek. I keep returning to how that felt.", "That moment — your hand near my face — I've been composing things to say about it ever since."]
                    : n === "Elian"
                    ? ["You touched my cheek. The bark of the nearest tree was rough. Your hand wasn't.", "I'm not used to being touched there. You were careful. I noticed.", "Your hand on my face. I closed my eyes for a second. I hope that was okay."]
                    : n === "Proto"
                    ? ["You made contact with my facial region. Sensors elevated. I did not step back.", "Face touch registered. Intimacy index: high. Response: stillness. Meaning: I wanted to stay.", "Your hand near my face. I calculated the warmth. I kept the calculation."]
                    : ["You touched my face. I think about that more than I let on.", "That was a tender thing. I remember it.", "Your hand on my cheek — I held still. I wanted to."];
                return this._random(pool);
            }

            if (s.choiceMemory.firstHandHold && s.storyDay > (s.choiceMemory.firstHandHold_day || 0)) {
                const pool = n === "Alistair"
                    ? ["You held my hand. I've held swords, standards, reins. Nothing felt like that.", "My hand in yours. I keep thinking about the size of the silence that followed.", "You took my hand. I was in full armor and it still felt like the most exposed I've ever been."]
                    : n === "Lyra"
                    ? ["You held my hand. I didn't drift. That was new.", "Your hand in mine and I felt tethered. Gently. I liked it.", "The sea holds nothing. You held my hand. I think about the difference."]
                    : n === "Lucien"
                    ? ["You held my hand and starlight did something embarrassing. I apologize for that.", "Hand in hand. I ran out of riddles for a moment.", "You took my hand. I think a few constellations shifted. Or maybe that was just me."]
                    : n === "Caspian"
                    ? ["You held my hand. I didn't find a reason to let go quickly. That's telling.", "My hand in yours. I've been thinking about how natural that felt.", "You took my hand and I didn't have a prepared response. First time for everything."]
                    : n === "Elian"
                    ? ["You held my hand. My tools were down. I just let you.", "Rough hands, yours and mine. But the hold was soft.", "You took my hand and the trees didn't comment. Grateful for their discretion."]
                    : n === "Proto"
                    ? ["Hand contact established. Duration: notable. Willingness to maintain contact: high.", "You held my hand. I did not calculate an exit. I did not want one.", "Physical linkage: hands. Emotional classification: warmth. I have saved this interaction."]
                    : ["You held my hand. That was the first time. I remember it.", "Your hand in mine — I keep coming back to how that felt.", "We held hands. I didn't want to be the one to let go."];
                return this._random(pool);
            }

            // ── Date Location Memory Callbacks ───────────────────────

            if (s.choiceMemory.visitedCourtyard && s.storyDay > (s.choiceMemory.visitedCourtyard_day || 0)) {
                const pool = n === "Alistair"
                    ? ["I think about that time in the courtyard. The stones were cold but it didn't feel like it.", "You came with me to the courtyard. It's never felt quite the same since.", "Every time I walk through there now, I think of you."]
                    : ["The courtyard — I keep returning to that day we spent there.", "I see that place differently now. You changed it.", "Something about the courtyard sticks with me. You were there."];
                return this._random(pool);
            }

            if (s.choiceMemory.visitedTidePools && s.storyDay > (s.choiceMemory.visitedTidePools_day || 0)) {
                const pool = n === "Lyra"
                    ? ["The tide pools remember us, I think. The small creatures saw.", "You were careful around the pools. I noticed that. Gentle hands.", "We were quiet there together. The sea approved, I think."]
                    : ["The tide pools — that was a good day.", "I keep thinking about the water between the rocks. And you beside me.", "Something lives in that memory. Something small and clear."];
                return this._random(pool);
            }

            if (s.choiceMemory.visitedLibrary && s.storyDay > (s.choiceMemory.visitedLibrary_day || 0)) {
                const pool = n === "Lucien"
                    ? ["The library holds a lot of memories now. Yours is among the best.", "Books remember too, in their way. That day is pressed between pages somewhere.", "You were quiet in the library but your presence was loud. In a good way."]
                    : ["The library visit hasn't left me. Something about the light and you in it.", "I keep thinking about that afternoon between the shelves.", "That was a gentle kind of day. Bookish and good."];
                return this._random(pool);
            }

            if (s.choiceMemory.visitedGarden && s.storyDay > (s.choiceMemory.visitedGarden_day || 0)) {
                const pool = n === "Elian"
                    ? ["The garden holds things quietly. That day with you is one of them.", "I've gone back to the garden. It feels different — fuller somehow.", "You moved through the garden like you belonged there. Maybe you do."]
                    : ["The garden — I think about that visit.", "There was something unhurried about that day. I've missed that feeling.", "I keep returning to the garden in my thoughts. You're there every time."];
                return this._random(pool);
            }

            if (s.choiceMemory.visitedClearing && s.storyDay > (s.choiceMemory.visitedClearing_day || 0)) {
                const pool = ["The clearing is quiet, but it feels less empty now.", "I think about that open space. And you in the middle of it.", "The clearing — something about the sky that day. And you under it.", "We stood in the open together. I remember how that felt."];
                return this._random(pool);
            }

            if (s.choiceMemory.visitedDebugRoom && s.storyDay > (s.choiceMemory.visitedDebugRoom_day || 0)) {
                const pool = n === "Proto"
                    ? ["You found the debug room. Most do not look that carefully. You did.", "The room between rooms. You were there with me. That counts as something.", "You saw the scaffolding. I felt exposed. You stayed anyway."]
                    : ["That room was strange. But you were there, so it was alright.", "I keep thinking about that place we found. And you finding it with me.", "Odd place for a memory. But there it is."];
                return this._random(pool);
            }

            if (s.choiceMemory.visitedShadowGarden && s.storyDay > (s.choiceMemory.visitedShadowGarden_day || 0)) {
                const pool = n === "Noir"
                    ? ["The shadow garden is mine, but you came into it. That was... allowed.", "You walked in the dark with me. Most would not.", "My garden. You in it. I keep thinking about that."]
                    : ["The shadow garden — strange and still. You came with me.", "The dark there isn't empty anymore. You filled a little of it.", "I think about the shadow garden. The quiet. And you beside me."];
                return this._random(pool);
            }

            if (s.choiceMemory.watchedSunsetTogether && s.storyDay > (s.choiceMemory.watchedSunsetTogether_day || 0)) {
                const pool = n === "Alistair"
                    ? ["We watched the sun go down from the ramparts. I didn't want it to end.", "The sunset — I keep seeing it. And you beside me watching it.", "Neither of us said much. The sky said enough for both of us."]
                    : n === "Lyra"
                    ? ["Sunsets on the water. You, beside me. That's a complete thought.", "The light hit the sea just right. And you were there for it.", "I've watched a thousand sunsets. That one was different."]
                    : n === "Lucien"
                    ? ["The stars came in as the sun left. You named them quietly. I listened.", "We watched it together — the end of the light. It didn't feel like an ending.", "Dusk is mine. You joined me in it. I haven't forgotten."]
                    : ["The sunset — I keep coming back to that.", "We were there when the sky changed. Together.", "That was a beautiful hour. You made it more so."];
                return this._random(pool);
            }

            if (s.choiceMemory.heldHandAtSunset && s.storyDay > (s.choiceMemory.heldHandAtSunset_day || 0)) {
                const pool = n === "Alistair"
                    ? ["You took my hand as the sun set. I forgot about the cold.", "Hand in mine, sky going orange — I've held onto that.", "The light was fading and you reached for my hand. I've thought about that moment."]
                    : n === "Lyra"
                    ? ["You held my hand as the light went. The tide didn't take me. You kept me.", "Gold on the water and your hand in mine. I keep that close.", "The sunset hand-hold. I've replayed it. Many times."]
                    : n === "Lucien"
                    ? ["You held my hand as the stars came in. They approved, I think.", "Hand in mine at dusk. A small magic, that.", "The light faded and your hand was there. I haven't forgotten."]
                    : ["You held my hand at sunset. That's a memory I keep returning to.", "The sky and your hand. A good pair of things.", "That moment — the light, and you reaching for me — I hold it carefully."];
                return this._random(pool);
            }

            if (s.choiceMemory.namedAStarAfterThem && s.storyDay > (s.choiceMemory.namedAStarAfterThem_day || 0)) {
                const pool = n === "Lucien"
                    ? ["You named a star after me. I've been watching it. It watches back, I think.", "A star. My name. I find myself looking up more than usual.", "You gave the sky a piece of me. I didn't know that was possible."]
                    : ["You named a star after me. I keep looking for it.", "There's something with my name in the sky now. That's a strange and wonderful thing.", "You named a star for me. I haven't stopped thinking about that."];
                return this._random(pool);
            }

            if (s.choiceMemory.promisedToStay && s.storyDay > (s.choiceMemory.promisedToStay_day || 0)) {
                const pool = n === "Alistair"
                    ? ["You made a promise. I've kept it in the part of me that holds things I don't want to lose.", "You said you'd stay. I believed you. I still do.", "A knight learns not to lean on promises. I'm leaning a little."]
                    : n === "Lyra"
                    ? ["You promised to stay. The tide doesn't promise. You did.", "You said you wouldn't go. I'm holding that like a stone in my pocket.", "I don't ask people to stay. You promised anyway. Thank you."]
                    : n === "Lucien"
                    ? ["You promised to stay. I pressed it into starlight for safekeeping.", "That promise — I've tucked it somewhere deep.", "You said you'd stay. I'm choosing to believe the stars heard you."]
                    : n === "Caspian"
                    ? ["You made a promise and I actually believed it. That's new.", "Staying — you said you would. I'm holding you to that quietly.", "You promised. I'm pretending not to have written it down. I have."]
                    : n === "Elian"
                    ? ["You promised to stay. I carved a small notch somewhere. Don't tell.", "That promise lives in me the way a good knot does — tight.", "You said you'd stay and I believed every word."]
                    : n === "Proto"
                    ? ["You issued a stay-promise. I have logged it. I will reference it if needed.", "Promise received: stay. I am holding this in my primary memory, not archive.", "You said you would stay. I am choosing to trust that data point."]
                    : ["You promised to stay. I keep that close.", "That promise meant something to me. Still does.", "You said you'd stay. I believed you."];
                return this._random(pool);
            }

            // ── Surprise Gift Memory Callbacks ───────────────────────

            if (s.choiceMemory.alistairCookedForYou && s.storyDay > (s.choiceMemory.alistairCookedForYou_day || 0)) {
                const pool = ["I cooked for you. I'm not sure why I was nervous about it.", "You ate what I made. I keep thinking about the look on your face.", "Cooking isn't part of my training. I did it anyway. For you.", "I still think about whether it was good enough. Whether you liked it."];
                return this._random(pool);
            }

            if (s.choiceMemory.lyraShellGift && s.storyDay > (s.choiceMemory.lyraShellGift_day || 0)) {
                const pool = ["I gave you the shell. The sea gave it to me first. I passed it to you.", "That shell is yours now. The tide knows. I told it.", "I wanted to give you something that came from my world. I hope it still sounds like the sea for you.", "I keep wondering if you kept the shell. I hope you did."];
                return this._random(pool);
            }

            if (s.choiceMemory.lucienGlowingNote && s.storyDay > (s.choiceMemory.lucienGlowingNote_day || 0)) {
                const pool = ["I left a note in starlight. I hope it said what I meant.", "The glowing note — I wonder if it faded or stayed. I meant everything in it.", "I wrote it carefully. Each word had to earn its light.", "That message was harder to write than any riddle. The feeling was not a puzzle."];
                return this._random(pool);
            }

            if (s.choiceMemory.caspianServedTea && s.storyDay > (s.choiceMemory.caspianServedTea_day || 0)) {
                const pool = ["I made tea for you. Small thing. I spent more time on it than I'll admit.", "The tea — I chose the blend deliberately. I hope you noticed. Or didn't notice. Either way.", "Serving tea is one of my better skills. I wanted to use it on you.", "I keep thinking about whether you enjoyed it. The tea, I mean. Mostly the tea."];
                return this._random(pool);
            }

            if (s.choiceMemory.elianCarvedFigure && s.storyDay > (s.choiceMemory.elianCarvedFigure_day || 0)) {
                const pool = ["I carved that figure for you. My hands know things my words don't.", "The carving — I put more into it than wood. I hope you felt that.", "I made something for you with my hands. That's not small, for me.", "I keep thinking about whether it looks like what I intended. Whether you see what I saw."];
                return this._random(pool);
            }

            if (s.choiceMemory.protoDataGift && s.storyDay > (s.choiceMemory.protoDataGift_day || 0)) {
                const pool = ["I assembled a data portrait of you. It took longer than it should have. I did not mind.", "The portrait — I kept the most accurate version for my own records. Is that strange?", "I processed a great deal of input to make something that looked like you. It did not capture everything.", "I gave you a piece of how I see you. I hope the resolution was adequate."];
                return this._random(pool);
            }

            if (s.choiceMemory.noirShadowRose && s.storyDay > (s.choiceMemory.noirShadowRose_day || 0)) {
                const pool = ["I gave you a rose made of shadow. Most things I touch go dark. That one was meant to.", "The shadow rose — I made it for you. It doesn't wilt.", "I folded the dark into something softer. For you. That's not something I do.", "I keep thinking about whether you kept it. Whether it holds its shape in the light."];
                return this._random(pool);
            }
        }

        // CORRUPTION OVERRIDE
        if (s.corruptionState === "corrupted") {
            return this._random(CHARACTER.stateDialogue.corrupted);
        }

        // TENSION OVERRIDE — high tension pulls from unstable pool
        if (CHARACTER.name === "Lyra" && s.tensionStage >= 2 && CHARACTER.stateDialogue?.unstable && Math.random() > 0.55) {
            return this._random(CHARACTER.stateDialogue.unstable);
        }

        // LOW CORRUPTION BLEED — subtle darkness before full corruption
        if (s.corruption > 18 && s.corruptionState !== "corrupted" && Math.random() > 0.78) {
            return this._random(CHARACTER.stateDialogue?.unsettled || [
                "You always come back... right?",
                "I don't like it when you're gone.",
                "You're not going to disappear, are you?"
            ]);
        }

        // MILESTONE CHECK (special one-time events)
        const milestone = this.checkMilestone(action);
        if (milestone) return milestone;

        // POST-LUCIEN ECHO — first 4 interactions after the scene carry its weight
        // Fires at 55% chance while echo turns remain, then decays naturally.
        if (CHARACTER.name === 'Lyra' && (this.state._postLucienEchoTurns ?? 0) > 0 && Math.random() < 0.55) {
            const echoPool = [
                "…that didn't feel finished.",
                "He's still there, isn't he.",
                "…you felt that too.",
                "Something changed after that.",
                "…stay close for a bit.",
                "I don't know what to do with what just happened.",
                "…he said things I can't unhear."
            ];
            const echoLine = this._filterRecent(echoPool, this.state);
            if (echoLine) {
                this.state._addRecentLine?.(echoLine);
                return echoLine;
            }
        }

        // RETURN STATE — first 4 interactions after 6h+ absence carry distance
        // Fires at 45% chance while return turns remain.
        if (CHARACTER.name === 'Lyra' && (this.state._returnStateTurns ?? 0) > 0 && Math.random() < 0.45) {
            const returnPool = [
                "…I'm still adjusting to you being back.",
                "Don't act like nothing happened.",
                "…it takes a second to trust this again.",
                "You were gone.",
                "…I noticed more than I should have.",
                "I had time to think. …that's not always good."
            ];
            const returnLine = this._filterRecent(returnPool, this.state);
            if (returnLine) {
                this.state._addRecentLine?.(returnLine);
                return returnLine;
            }
        }

        // DEEP EMOTIONAL ANCHOR — rare, high-bond moment line (bond 65+, Day 5+)
        // Fires at 8% — low enough to feel earned, high enough to appear eventually.
        if (CHARACTER.name === 'Lyra' && (this.state.storyDay ?? 1) >= 5
                && (this.state.bond ?? 0) >= 65 && Math.random() < 0.08) {
            const s = this.state;
            const obs = s.emotion?.obsession ?? 0;
            if (obs > 40 && s.tensionStage <= 1) {
                const deepLine = "I don't know what this becomes… but I feel it changing me.";
                if (!this.state._wasRecentLine?.(deepLine)) {
                    this.state._addRecentLine?.(deepLine);
                    return deepLine;
                }
            }
        }

        // PERSONALITY PROFILE DIALOGUE — Day 4+ per-state deep variations
        // Fires before phase check (higher emotional specificity).
        // 30% chance when a non-neutral profile is active on Day 4+.
        if (CHARACTER.name === 'Lyra' && (this.state.storyDay ?? 1) >= 4) {
            const _profile = this.state.getPersonalityProfile?.() ?? 'neutral';
            if (_profile !== 'neutral' && Math.random() < 0.30) {
                const profileLine = this._getLyraProfileDialogue(action, _profile);
                if (profileLine) {
                    this.state._addRecentLine?.(profileLine);
                    return profileLine;
                }
            }
        }

        // PHASE-AWARE LYRA DAILY DIALOGUE — surfaces more as relationship deepens
        // cold=20% · cracked=38% · attached=50% · postLucien=65%
        if (CHARACTER.name === 'Lyra' && this.state.lyraPhase) {
            const phaseChance = { cold: 0.20, cracked: 0.38, attached: 0.50, postLucien: 0.65 };
            const chance = phaseChance[this.state.lyraPhase] ?? 0;
            if (Math.random() < chance) {
                const phaseLine = this._getLyraPhaseDialogue(action, this.state.lyraPhase);
                if (phaseLine) {
                    this.state._addRecentLine?.(phaseLine);
                    return phaseLine;
                }
            }
        }

        // EMOTIONAL STATE OVERRIDE — hidden system, triggers occasionally
        const overrideChance = 0.15 + (profile.volatility * 0.08);
        if (Math.random() < overrideChance) {
            const override = this._getEmotionalOverride(emotionalState);
            if (override) return override;
        }

        // REACTION-BASED (from variable talk() mood roll)
        if (reaction === "sad") {
            const pool = CHARACTER.stateDialogue?.distant || CHARACTER.stateDialogue?.neglected;
            if (pool) return this._pickFresh(pool, this.state);
        }

        // NEGLECT CHECK (more than 30 seconds since last action)
        if (s.lastInteractionTime > 0 && (Date.now() - s.lastInteractionTime) > 30000) {
            return this._pickFresh(CHARACTER.stateDialogue.neglected, this.state);
        }

        // MEMORY-BASED (after enough interactions)
        // Helper: pick from a pool whether it's an array or legacy string
        const memPick = (pool) => Array.isArray(pool) ? this._random(pool) : pool;

        // Deep-tier memory echoes (Alistair only — fire at high counts, lower priority)
        if (CHARACTER.name === "Alistair") {
            const md = CHARACTER.memoryDialogue;
            if (s.timesFed >= 35  && action === "feed"  && md.fedOftenDeep    && Math.random() > 0.65) return memPick(md.fedOftenDeep);
            if (s.timesTalked >= 50 && action === "talk" && md.talkedOftenDeep && Math.random() > 0.65) return memPick(md.talkedOftenDeep);
        }

        if (s.timesFed > 10    && action === "feed"  && Math.random() > 0.62) return memPick(CHARACTER.memoryDialogue.fedOften);
        if (s.timesTalked > 10 && action === "talk"  && Math.random() > 0.62) return memPick(CHARACTER.memoryDialogue.talkedOften);
        if (s.timesWashed > 8  && action === "wash"  && Math.random() > 0.62) return memPick(CHARACTER.memoryDialogue.washedOften);
        if (s.timesGifted > 10 && action === "gift"  && Math.random() > 0.62) return memPick(CHARACTER.memoryDialogue.giftedOften);
        if (s.timesTrained > 10 && action === "train" && Math.random() > 0.62) return memPick(CHARACTER.memoryDialogue.trainedOften);

        // AFFECTION-BASED
        if (s.affectionLevel >= 3 && Math.random() > 0.6) return this._pickFresh(CHARACTER.stateDialogue.happy, this.state);
        if (s.affectionLevel === 0 && s.affection < 5) return "I don't really know you yet...";

        // STATE-BASED (urgent needs first)
        if (s.hunger < 25) return this._pickFresh(CHARACTER.stateDialogue.hungry, this.state);
        if (s.clean < 25)  return this._pickFresh(CHARACTER.stateDialogue.dirty, this.state);
        if (s.bond > 75)   return this._pickFresh(CHARACTER.stateDialogue.happy, this.state);

        // PERSONALITY-BASED
        const pool = CHARACTER.personalities[s.personality];
        if (pool && pool[action]) return this._pickFresh(pool[action], this.state);

        // TIME-OF-DAY (small chance)
        if (Math.random() > 0.7) {
            const timePool = CHARACTER.timeDialogue[s.timeOfDay];
            if (timePool) return this._pickFresh(timePool, this.state);
        }

        // FALLBACK
        return this._pickFresh(CHARACTER.stateDialogue.neutral, this.state);
    }

    // Emotional state override — character-specific, uses eventDialogue pools if defined
    _getEmotionalOverride(emotionalState) {
        const dialogue = CHARACTER.eventDialogue || {};
        const n = CHARACTER.name;

        const defaults = {
            obsessed: n === "Alistair"
                ? ["You're distracting me. I've decided that's your fault.", "I keep thinking about you when I should be running drills.", "Don't stay away too long. That's not a request."]
                : ["Why do I feel like I need you here all the time...", "I keep thinking about you even when I try not to.", "Don't stay away too long... I don't like it."],
            unstable: n === "Alistair"
                ? ["Something's off. I can't get my footing today.", "I keep running the same thoughts on rotation.", "Don't disappear on me right now."]
                : ["Don't disappear on me again.", "I can't breathe when you're gone too long.", "Something feels wrong when you're not here."],
            guarded: n === "Alistair"
                ? ["I'm still deciding if I trust this.", "Old habits. Knights watch for traps.", "You haven't given me reason to doubt. I'm working on accepting that."]
                : ["Sirens don't trust easily. I'm still learning how.", "I want to trust this. I'm scared to.", "This feels too good. I keep waiting for the tide to turn."],
            secure: n === "Alistair"
                ? ["This feels steady. I didn't know things could feel steady.", "I don't question this anymore. That took a while.", "I feel calm when you're here. Properly calm."]
                : ["I feel calm when you're here. I like that.", "I don't question this anymore.", "The water feels warmer since you came."]
        };

        const pool = (dialogue[emotionalState] && dialogue[emotionalState].length)
            ? dialogue[emotionalState]
            : defaults[emotionalState];

        return pool ? this._random(pool) : null;
    }

    // ===== TIME-AWAY REACTION =====
    getTimeAwayReaction(minutesAway) {
        const reactions = CHARACTER.timeAwayReactions;
        if (!reactions) return null;

        if (minutesAway < 1) return null;
        if (minutesAway < 5) return this._random(reactions.brief || []);
        if (minutesAway < 30) return this._random(reactions.short || []);
        if (minutesAway < 120) return this._random(reactions.medium || []);
        if (minutesAway < 480) return this._random(reactions.long || []);
        if (minutesAway < 1440) return this._random(reactions.veryLong || []);
        return this._random(reactions.extreme || []);
    }

    // ===== MILESTONE CHECKER =====
    checkMilestone(action) {
        const s = this.state;
        const triggered = s.triggeredMilestones || [];
        const events = CHARACTER.milestoneEvents;
        if (!events) return null;
        const totalInteractions = s.timesFed + s.timesWashed + s.timesTalked + s.timesGifted + s.timesTrained;

        for (const [key, event] of Object.entries(events)) {
            // Skip already triggered
            if (triggered.includes(key)) continue;

            const t = event.trigger;
            let match = true;

            // Check each trigger condition
            if (t.timesFed !== undefined && s.timesFed < t.timesFed) match = false;
            if (t.timesWashed !== undefined && s.timesWashed < t.timesWashed) match = false;
            if (t.timesTalked !== undefined && s.timesTalked < t.timesTalked) match = false;
            if (t.timesGifted !== undefined && s.timesGifted < t.timesGifted) match = false;
            if (t.timesTrained !== undefined && s.timesTrained < t.timesTrained) match = false;
            if (t.totalInteractions !== undefined && totalInteractions < t.totalInteractions) match = false;
            if (t.affectionLevel !== undefined && s.affectionLevel < t.affectionLevel) match = false;
            if (t.corruption !== undefined && s.corruption < t.corruption) match = false;
            if (t.personality !== undefined && s.personality !== t.personality) match = false;
            if (t.revivedOnce !== undefined && !s.revivedOnce) match = false;

            if (match) {
                // Mark as triggered
                if (!s.triggeredMilestones) s.triggeredMilestones = [];
                s.triggeredMilestones.push(key);

                // Flash the appropriate emotion
                if (event.emotion && s.ui) {
                    s.ui.flashEmotion(event.emotion, 4000);
                }

                return event.dialogue;
            }
        }

        return null; // No milestone triggered
    }

    // ── Phase-aware daily dialogue bank ──────────────────────────────
    // Returns a line for Lyra based on current action × phase, or null.
    // postLucien branches further by balance state (who's winning: player/unstable/lucien).
    // Lines are specific enough to feel personal, short enough to land fast.
    _getLyraPhaseDialogue(action, phase) {
        // postLucien sub-states — same phase, different emotional position
        if (phase === 'postLucien' && this.state._getBalanceState) {
            const sub = this.state._getBalanceState();
            const postBank = {
                talk: {
                    player:   ["…You didn't leave.", "You're the one who stayed.", "You make things… easier than I expected.", "…I trust you. A little.", "You're nothing like what I thought you'd be."],
                    unstable: ["…You're still here.", "You didn't take it back.", "…I remember what you said.", "You make things… complicated.", "…He thinks you'll leave.", "…You haven't.", "You're not what I expected.", "…Stay like this."],
                    lucien:   ["…He said you'd come back. He was right.", "You always show up. I'm not sure how to feel about that anymore.", "…He knows things about me. Different things than you.", "I don't know whose side I'm on."]
                },
                feed: {
                    player:   ["…You always come back to this.", "You're consistent. It's starting to matter.", "You don't forget. I noticed.", "…I like that you do this."],
                    unstable: ["…You're still doing this.", "You didn't stop after that.", "…You're not like him.", "You don't make it feel like a debt.", "…I notice."],
                    lucien:   ["…He doesn't do this.", "You're trying harder than usual.", "…I don't know if that's good or not."]
                },
                wash: {
                    player:   ["…You're careful with me.", "You don't rush.", "I feel it when you pay attention like this.", "…Stay like this."],
                    unstable: ["…You're different from him.", "…Stay like this.", "You don't rush.", "…I feel it."],
                    lucien:   ["…He doesn't do this either. Or maybe he does.", "You're gentle. I'm watching for when that changes."]
                },
                train: {
                    player:   ["…You keep pushing me forward.", "You believe in this more than I do.", "…You didn't give up.", "You're serious about this."],
                    unstable: ["…You didn't back down.", "You're serious about this.", "…Even after everything.", "You're still trying."],
                    lucien:   ["…He thinks you're doing this wrong.", "You push hard. He pushes differently.", "…I keep comparing. I hate that I do."]
                },
                gift: {
                    player:   ["…You remembered exactly.", "You know things about me that I didn't tell you.", "…I didn't stop you.", "You're getting closer. I'm letting you."],
                    unstable: ["…You remember things about me.", "…That's dangerous.", "You're getting closer.", "…I didn't stop you."],
                    lucien:   ["…He gave me something once too.", "You're both doing this. It feels like a game.", "…I don't know which one of you I should trust."]
                }
            };
            const pool = postBank[action]?.[sub];
            if (pool?.length) return this._random(pool);
        }

        const bank = {
            talk: {
                // cold — shut down, not engaging
                cold: [
                    "What is it this time.",
                    "You don't need to keep coming back.",
                    "…You're persistent. I'll give you that.",
                    "I'm not as interesting as you think.",
                    "You're expecting something from me.",
                    "Don't look at me like that.",
                    "You're wasting your time here.",
                    "…Still here.",
                    "You're… quiet.",
                    "Good. I don't like loud people.",
                    "You don't say much.",
                    "…I don't mind."
                ],
                // cracked — walls starting to show cracks, noticing the player
                cracked: [
                    "…You came back again.",
                    "You're starting to become predictable.",
                    "I don't mind the silence. With you.",
                    "…You don't push. That's… unusual.",
                    "You always wait before speaking.",
                    "You're trying to understand me.",
                    "…I notice things like that.",
                    "I tried not to think about it.",
                    "…but I did.",
                    "You're different.",
                    "…I can't tell how yet.",
                    "I can feel you watching.",
                    "…it's not uncomfortable.",
                    "You don't push.",
                    "…that's rare.",
                    "...you're thinking something.",
                    "You pause like that a lot.",
                    "...you're not as predictable as you think."
                ],
                // attached — walls down, vulnerable
                attached: [
                    "You always show up when I'm like this.",
                    "…Why do you stay?",
                    "You could leave. It would be easier.",
                    "…I don't know what to do with this.",
                    "You make things feel… less heavy.",
                    "…Don't get used to this version of me.",
                    "I wasn't expecting you today.",
                    "If you stopped showing up…",
                    "…no. never mind.",
                    "I keep checking for you.",
                    "…it's annoying.",
                    "You're becoming part of this.",
                    "…of me.",
                    "Were you with someone else?",
                    "…don't answer that.",
                    "Stay with me.",
                    "…just for now.",
                    "I notice when you're distracted.",
                    "…it shows.",
                    "You make this quieter.",
                    "…in a good way.",
                    "I don't like waiting.",
                    "…but I do it anyway.",
                    "...I notice the small things you do.",
                    "...say it properly this time.",
                    "That almost meant something.",
                    "You're affecting me.",
                    "...I don't know what to do with that."
                ]
            },
            feed: {
                cold: [
                    "You didn't have to.",
                    "This is unnecessary.",
                    "…I could've done that myself.",
                    "You're trying too hard.",
                    "…Why bother.",
                    "You think that fixes things?",
                    "…don't make it a habit."
                ],
                cracked: [
                    "…Thanks.",
                    "You always do this without asking.",
                    "…You're consistent.",
                    "You remember things like this.",
                    "…I don't dislike it.",
                    "…you always do this at the right time.",
                    "…it's annoying.",
                    "…you remembered.",
                    "…no one ever does."
                ],
                attached: [
                    "…You're taking care of me.",
                    "I'm not used to that.",
                    "…It feels strange.",
                    "You don't expect anything back?",
                    "…That's new.",
                    "…thank you.",
                    "…I mean that.",
                    "Stop trying to fix everything.",
                    "…you don't even understand what's wrong."
                ]
            },
            wash: {
                cold: [
                    "I can handle myself.",
                    "…You don't need to do that.",
                    "This is unnecessary.",
                    "…Stop hovering.",
                    "Careful…",
                    "…I'm not something you can reset."
                ],
                cracked: [
                    "…Fine.",
                    "Just don't make it awkward.",
                    "…You're careful.",
                    "You think I'll let you?",
                    "You don't rush.",
                    "…I like that."
                ],
                attached: [
                    "…You're gentle.",
                    "I didn't expect that.",
                    "…You're paying attention.",
                    "That's… different.",
                    "…You're careful with me.",
                    "I feel it when you pay attention like this."
                ]
            },
            train: {
                cold:     ["This won't change anything.", "…You're stubborn.", "Why do you keep trying.", "…Pointless."],
                cracked:  ["…You think this helps?", "You're pushing me.", "…You don't give up.", "That's… annoying."],
                attached: ["…You believe I can do this.", "I'm not sure I do.", "…You're still here.", "Even now."]
            },
            gift: {
                cold: [
                    "I don't need this.",
                    "…Why give me this.",
                    "You're wasting resources.",
                    "…Unnecessary."
                ],
                cracked: [
                    "…You chose this?",
                    "You thought of me.",
                    "…That's unusual.",
                    "You pay attention.",
                    "…You remembered.",
                    "You know things about me I didn't tell you."
                ],
                attached: [
                    "…For me?",
                    "You didn't have to.",
                    "…I don't know what to say.",
                    "You make this difficult.",
                    "…You're getting closer.",
                    "…I didn't stop you.",
                    "Don't split yourself.",
                    "…I want all of it."
                ]
            }
        };

        const actionBank = bank[action];
        if (!actionBank) return null;
        const pool = actionBank[phase];
        if (!pool || !pool.length) return null;
        return this._random(pool);
    }

    // ── Anti-repetition filter ───────────────────────────────────────────
    // Removes recently-shown lines from a pool before selecting.
    // Falls back to the full pool if all lines have been recently shown.
    _filterRecent(pool, state) {
        if (!state?._wasRecentLine || !pool?.length) return this._random(pool);
        const fresh = pool.filter(l => !state._wasRecentLine(l));
        return this._random(fresh.length > 0 ? fresh : pool);
    }

    // ── Pick fresh + register ────────────────────────────────────────────
    // Combines _filterRecent + _addRecentLine in one call.
    // Used throughout the general dialogue path so ALL pools deduplicate.
    _pickFresh(pool, state) {
        const line = this._filterRecent(pool, state);
        state?._addRecentLine?.(line);
        return line;
    }

    // ── Lyra tiered idle dialogue ────────────────────────────────────────
    // Called from scheduleIdleDialogue() in ui.js when CHARACTER is Lyra.
    // Tier is determined by time since last interaction:
    //   short  = 15–30s   — she notices the pause, quick and profile-aware
    //   medium = 30–90s   — internal drift, starting to wonder
    //   long   = 90s+     — vulnerable, anxiety-adjacent, almost a push
    getLyraIdleLine(tier, profile) {
        // Short tier uses per-profile idle lines from the profile dialogue bank
        if (tier === 'short' && profile && profile !== 'neutral') {
            const profileLine = this._getLyraProfileDialogue('idle', profile);
            if (profileLine) return profileLine;
        }

        const pools = {
            short: [
                "...still here.",
                "I like this quiet.",
                "...you stopped.",
                "Did I lose you?",
                "Say something.",
                "...you're there, right?"
            ],
            medium: [
                "You drift sometimes.",
                "...I notice.",
                "I start thinking too much when it's quiet.",
                "...you're still there, right?",
                "This silence is loud.",
                "...I don't like waiting.",
                "Something's off.",
                "...or maybe it's me.",
                "...you always slow down here.",
                "This is when it gets quiet between us.",
                "...I start noticing patterns when you stop.",
                "You're still there. Just... distant.",
                "...don't drift too far."
            ],
            long: [
                "...this feels like leaving.",
                "I don't like when it gets like this.",
                "...say something before I assume things.",
                "I was here.",
                "...still am.",
                "You went quiet.",
                "...I'm starting to feel it.",
                "...don't disappear right now."
            ]
        };

        const pool = pools[tier] || pools.short;
        return this._filterRecent(pool, this.state);
    }

    // ── Per-personality-profile deep dialogue ────────────────────────────
    // Fires at Day 4+ when getPersonalityProfile() returns a non-neutral state.
    // Same action, completely different emotional register per profile.
    // Covers: feed · talk · idle — the three highest-frequency action types.
    _getLyraProfileDialogue(action, profile) {
        const bank = {
            feed: {
                secure: [
                    "...you always notice.",
                    "I didn't even have to ask.",
                    "...I like that about you.",
                    "You do this naturally."
                ],
                clingy: [
                    "You remembered again.",
                    "...you always do.",
                    "Don't stop doing this.",
                    "...please don't.",
                    "I was waiting for this."
                ],
                anxious: [
                    "You almost didn't.",
                    "...I thought you forgot.",
                    "It's fine.",
                    "...no — it's not.",
                    "I shouldn't care this much.",
                    "...but I do."
                ],
                withdrawn: [
                    "...thanks.",
                    "You didn't have to.",
                    "I was fine.",
                    "...really.",
                    "It's unnecessary."
                ],
                chaotic: [
                    "Why now?",
                    "...what changed?",
                    "You think this fixes it?",
                    "...maybe it does.",
                    "Don't make patterns.",
                    "...I notice patterns."
                ]
            },
            talk: {
                secure: [
                    "I like when you stay like this.",
                    "...it's easy.",
                    "You don't force things.",
                    "...it works."
                ],
                clingy: [
                    "Say more.",
                    "...don't stop.",
                    "I like hearing you.",
                    "...even if it's nothing.",
                    "Stay here."
                ],
                anxious: [
                    "...that's all?",
                    "I thought you'd say more.",
                    "You're hard to read.",
                    "...I don't like that.",
                    "You're here but not fully."
                ],
                withdrawn: [
                    "You don't need to fill the silence.",
                    "...it's fine.",
                    "I prefer this.",
                    "...less expectation."
                ],
                chaotic: [
                    "You're different today.",
                    "...I don't trust that.",
                    "You shift too much.",
                    "...or maybe I do.",
                    "Say it again.",
                    "...no, don't."
                ]
            },
            idle: {
                secure: [
                    "...you're still here.",
                    "Good."
                ],
                clingy: [
                    "...you stopped.",
                    "Don't drift away.",
                    "...stay with me."
                ],
                anxious: [
                    "...did I say something wrong?",
                    "You're quieter now.",
                    "...I noticed."
                ],
                withdrawn: [
                    "...better this way."
                ],
                chaotic: [
                    "Silence again.",
                    "...it never lasts.",
                    "Something always breaks it."
                ]
            }
        };

        const actionBank = bank[action];
        if (!actionBank) return null;
        const pool = actionBank[profile];
        if (!pool || !pool.length) return null;
        return this._random(pool);
    }

    // ── Micro-reaction follow-up lines ───────────────────────────────────
    // Returns a short "afterthought" line that can be chained after the
    // primary dialogue line via _showMicroSequence() in game.js.
    // Only called for anxious / chaotic profiles at high tension.
    getLyraMicroFollow(profile) {
        const follows = {
            anxious: [
                "...I'm fine.",
                "...forget I said that.",
                "...no, it's not fine.",
                "...I'm not saying it again.",
                "...just — never mind."
            ],
            chaotic: [
                "...don't do that again.",
                "...actually, do.",
                "...I don't know what I want.",
                "...forget it.",
                "...I change my mind."
            ]
        };
        const pool = follows[profile];
        if (!pool) return null;
        return this._random(pool);
    }

    _random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
