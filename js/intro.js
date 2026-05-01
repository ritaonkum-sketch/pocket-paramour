// ===================================================
//  Pocket Paramour — Intro Scene System
//  Plays once per character on first launch.
// ===================================================

const INTRO_SCENES = {
    // ALISTAIR — REWRITTEN for the post-bridge timeline.
    // Bridge ended with: "I will not ask you what you are. Not yet." —
    // Captain carrying her unconscious from the woods, hiding her in the
    // maid's chamber, holding a tin cup of water hoping she would not die.
    // Chapter 1 ended with: "Come back tomorrow. I'll show you the hall."
    // THIS scene is the morning of her first awake/walking day on his
    // route. He has paced for hours. He wants to introduce himself
    // properly because last time was an emergency, not a meeting.
    // The name prompt is the climax — followed by two post-name beats
    // where he repeats her name and welcomes her to the watch.
    alistair: {
        bgClass: 'intro-bg-knight',
        beats: [
            {
                // Beat 1 — "He has been waiting" (the relief of seeing her up)
                body: 'assets/alistair/body/softshy-love1.png',
                direction: 'He stands at the chamber door, clearly having paced for hours. He stills the moment he sees you.',
                line: "You're awake. You're walking. Both at once. That is a good morning."
            },
            {
                // Beat 2 — "Apology for the bad introduction" (formal, embarrassed)
                body: 'assets/alistair/body/crossarms.png',
                direction: 'He clasps his hands behind him, parade-rest, the way knights do when they want to seem composed and don’t quite manage.',
                line: "I should have introduced myself properly yesterday. There was no proper hour for it. You were unconscious. I was holding water in a tin cup hoping you would not die. Not the moment for names."
            },
            {
                // Beat 3 — "Doing it properly" (formal half-bow)
                body: 'assets/alistair/body/casual.png',
                direction: 'A small, formal half-bow. Not deep. Not theatrical. Just a knight remembering a rule of conduct.',
                line: "Captain Alistair. South gate. Twenty years of service, forty-two of breath. I have been on watch in this kingdom longer than I have been a man. That is the full introduction. There is not much else."
            },
            {
                // Beat 4 — "The careful look" (the bridge-callback gaze)
                body: 'assets/alistair/body/wondering.png',
                direction: 'He looks at you the way he looked at you in the woods — careful, unhurried, as if he is afraid to misread what you are.',
                line: "I have been calling you mi’lady in my head. I like it. But it is an address, not a name."
            },
            {
                // Beat 5 — "The ask" (formality drops, just a man asking)
                body: 'assets/alistair/body/shy3.png',
                direction: 'His eyes drop. When they rise, the formality is gone. Just a man asking.',
                line: "Tell me what to call you. Out loud, on purpose. So when you sleep here tonight I can say goodnight to a name."
            }
        ],
        // Post-name beats — fire AFTER the player submits their name in
        // the name-input panel. {name} is interpolated live so the player
        // sees Alistair speaking their name for the first time. This is
        // the cinematic payoff that the original 7-beat intro lacked.
        postNameBeats: [
            {
                // Beat 6 — "He repeats it like a vow" (the reverent moment)
                body: 'assets/alistair/body/softshy-love2.png',
                direction: 'He says it once. Then again, slower. Then a third time, like he is committing it to the part of him that keeps the things that matter.',
                line: "{name}. *Quieter.* {name}. *Slower, almost a vow.* {name}. There. That is a name I will keep."
            },
            {
                // Beat 7 — "Welcome to the watch" (warm handoff into care loop)
                body: 'assets/alistair/body/smile1.png',
                direction: 'He gestures to the small chair by the window. The room is yours for as long as you stay.',
                line: "Stay as long as you can, {name}. I will be here as long as you can stand it. Welcome to the watch."
            }
        ]
    },
    // LYRA — REWRITTEN for post-bridge timeline.
    // Bridge: you followed Elian's birch-bark map to her cave. She told
    // you she knew part of your name — "Weaver." Now: morning after,
    // she's been singing quietly, half-hoping you came back.
    lyra: {
        bgClass: 'intro-bg-siren',
        beats: [
            {
                body: 'assets/lyra/body/neutral1.png',
                direction: 'You step back into the cave. The water is still. She is sitting at the edge of the pool, humming under her breath. She stops when she sees you.',
                line: "...You came back. I told myself I would not be surprised either way. *quiet* I was wrong about that."
            },
            {
                body: 'assets/lyra/body/pose2.png',
                direction: 'She pats the stone beside her. The gesture is small and considered, like she practiced it before you arrived.',
                line: "Sit. Closer than that. *small smile* I have not been within an arm of anyone in a long time. I would like to remember what it costs."
            },
            {
                body: 'assets/lyra/body/neutral1.png',
                direction: 'She tucks a strand of damp hair behind her ear. The gesture is human in a way her voice is not.',
                line: "I should have introduced myself properly when I pulled you in from the shallows. I was busy keeping you breathing. There was no proper hour for names."
            },
            {
                body: 'assets/lyra/body/pose3.png',
                direction: 'A small bow, half-mocking, half-real. Her hand on her chest like a court lady or a ghost.',
                line: "Lyra. Half-siren, half-something the registries do not have a word for. I sing for nobody most nights. *quieter* Recently, fewer most nights."
            },
            {
                body: 'assets/lyra/body/sad3.png',
                direction: 'Her eyes drop to the water. When they rise the centuries-patience is gone — just her, asking.',
                line: "I have been calling you *little listener* in my head. It is gentle, but it is not a name. Tell me what to call you. Out loud. *softer* So when I sing, I can sing it."
            }
        ],
        postNameBeats: [
            {
                body: 'assets/lyra/body/singing.png',
                direction: 'She hums it, just once. Then sings it. The cave catches the note and gives it back to her, doubled.',
                line: "{name}. *the cave answers* {name}. *softer, like a lullaby for one* {name}. There. I have put it somewhere the deep voice cannot reach.",
                sound: 'assets/audio/mermaid-hum.mp3',
                soundVolume: 0.35
            },
            {
                body: 'assets/lyra/body/pose4.png',
                direction: 'She holds out her hand. Half-out of the water. The boundary you crossed already.',
                line: "Stay as long as you can, {name}. I will not sing you a cage. *small, careful* That is the most a siren has promised in six hundred years."
            }
        ]
    },
    // ELIAN \u2014 REWRITTEN for post-bridge timeline.
    // Bridge: she slipped out of the maid's chamber at night, walked
    // into the Thornwood, found him at the embers. He gave her shelter.
    // Now: morning by the same fire. Fresh wood. Tea brewing. Asked
    // nothing yet.
    elian: {
        bgClass: 'intro-bg-druid',
        beats: [
            {
                body: 'assets/elian/body/calm.png',
                direction: 'You wake by the fire. Fresh wood on it. He is sitting across the embers with a tin cup of tea in his hands, watching the trees, not you. He turns when you stir.',
                line: "You slept through the second watch. That is the longest anyone has slept in this clearing in a long time. *quiet* I will take it as a compliment."
            },
            {
                body: 'assets/elian/body/calm.png',
                direction: 'He passes you the tin cup without ceremony. Bark and pine needle. The taste of the forest in liquid form.',
                line: "I should have introduced myself properly last night. The wolves were closer than I let on. The introduction was *get behind me*. Not, in hindsight, a complete one."
            },
            {
                body: 'assets/elian/body/stern.png',
                direction: 'A small, considered nod. The forest equivalent of a court bow.',
                line: "Elian. I keep this forest. Since before there was a king who put up the wards. *quieter* I have not had a guest survive their first night in a long time. You did. That is the introduction that matters."
            },
            {
                body: 'assets/elian/body/warm.png',
                direction: 'He looks at you the way he reads tracks \u2014 patiently, without conclusion.',
                line: "I have been calling you *city-walker* in my head. Accurate, but unkind. You walked here on purpose. That deserves better."
            },
            {
                body: 'assets/elian/body/calm.png',
                direction: 'His eyes drop to the embers. When they rise, the careful assessment has gone soft.',
                line: "Tell me what to call you. Out loud, once. *softer* The forest remembers names spoken kindly. I would like it to learn yours."
            }
        ],
        postNameBeats: [
            {
                body: 'assets/elian/body/warm.png',
                direction: 'He says it once. Then bends and presses his palm flat to the moss between you. An offering to the ground itself.',
                line: "{name}. *to the moss* {name}. *softer, like teaching the trees* {name}. There. The forest knows you now. *quietly* You will find it is gentler with you from this morning forward."
            },
            {
                body: 'assets/elian/body/calm.png',
                direction: 'He gestures at the clearing. The path you came down. The path that opened for you, that does not open for most.',
                line: "Walk back when you must, {name}. Walk back here whenever you can. *small* The path will be open. That is also new. That is also you."
            }
        ]
    },
    // CASPIAN \u2014 REWRITTEN for post-bridge timeline.
    // Bridge: Alistair brought him to you ("not the queen"). Carriage to
    // the coast. He bowed to a witch \u2014 kings do not bow. Now: morning
    // in the quiet wing of his palace. He has been the prince for
    // courtiers since dawn. With you, he is briefly off-script.
    caspian: {
        bgClass: 'intro-bg-prince',
        beats: [
            {
                body: 'assets/caspian/body/casual1.png',
                direction: 'Late morning sunlight in a wing of the palace nobody else uses. He is sitting on the cushion by the window, sleeves rolled, a tea service already set for two.',
                line: "You came. *small, relieved* I half-expected to drink both cups myself. That would have been pathetic. I will not pretend it would not."
            },
            {
                body: 'assets/caspian/body/gentle.png',
                direction: 'He pours. The motion is small, considered, not performative \u2014 done for one person, not a court.',
                line: "I have not introduced myself properly. Last night the captain was rushing you here and I was still composing a face. Today I have a face on. Today is better."
            },
            {
                body: 'assets/caspian/body/casual1.png',
                direction: 'A small, formal bow from his seat. Half-mocking the convention, half-meaning it.',
                line: "Caspian, of Aethermoor. Crown prince by birth, slightly less by inclination. *softer* A man, mostly, when no one is watching."
            },
            {
                body: 'assets/caspian/body/tender.png',
                direction: 'He nudges the cup toward you. The saucer is one of the everyday ones, not court porcelain. He chose that on purpose.',
                line: "I have spent the morning calling you *the guest*. Courteous, and also a way of pretending you are anyone. *quieter* You are not."
            },
            {
                body: 'assets/caspian/body/tender.png',
                direction: 'His eyes drop to the cup. When they rise, the prince is briefly off and only the man is asking.',
                line: "Tell me your name. Properly. I want to use it across a dinner table sometime. Want to write it on a card without checking the spelling. *small smile* Allow me that."
            }
        ],
        postNameBeats: [
            {
                body: 'assets/caspian/body/casual1.png',
                direction: 'He says it once like a courtier \u2014 testing the cadence. Then again, slower, all of him in the second one.',
                line: "{name}. *practising* {name}. *softer* {name}. There. That is a name I will be careful with. I am very good at being careful with things people give me. With you, I am better."
            },
            {
                body: 'assets/caspian/body/gentle.png',
                direction: 'He gestures at the room \u2014 sun, cushions, the second cup. Yours.',
                line: "This wing of the palace is yours, {name}. Whenever the rest of it is too loud. I will be here. Almost always am. *small* That is not new. You being here is."
            }
        ]
    },
    // LUCIEN — REWRITTEN for post-bridge timeline.
    // Bridge: Alistair appointed personal guard ("I asked for this
    // post"). The dome — Lucien's tower — opened to you. Now: morning
    // study session. He has been awake all night cataloguing you.
    lucien: {
        bgClass: 'intro-bg-mage',
        beats: [
            {
                body: 'assets/lucien/body/reading.png',
                direction: 'A tower study. The candles burned through the night and only now go out in the morning light. He looks up from a journal that has your provisional designation on every page.',
                line: "You are awake. Of course you are. I have been timing the angles of your sleep cycles by the grandfather clock. *small, embarrassed* That is, in retrospect, the conduct of a man with no chaperone."
            },
            {
                body: 'assets/lucien/body/thinking.png',
                direction: 'He closes the journal carefully, as if your real name might escape from it if he is not gentle.',
                line: "I should have introduced myself last night. The captain was running you up the spiral stairs at full speed and I was still scrolling for the appropriate index card. There was no index card. That, itself, is a finding."
            },
            {
                body: 'assets/lucien/body/neutral.png',
                direction: 'A small, considered bow. The kind of formality only the truly precise people still observe.',
                line: "Lucien, of the Seventh Tower. Cataloguer of patterns the kingdom prefers I do not name. A scholar, mostly. Recently *quieter* also a witness."
            },
            {
                body: 'assets/lucien/body/curious.png',
                direction: 'He gestures at the journal. Twenty-three small marginalia in his hand. All of them, when you look closely, are about you.',
                line: "I have been writing *the visitor* in the margins for an entire night. I am running out of margin. A pattern this loud deserves a name. Otherwise it goes unnoted, and I do not let things go unnoted."
            },
            {
                body: 'assets/lucien/body/shy3.png',
                direction: 'He sets the quill down for the first time. The gesture takes him an unusual amount of effort.',
                line: "Tell me what to call you. Properly, on the record. I have a fresh page. I would like the first true entry under it to be written carefully, in your name."
            }
        ],
        postNameBeats: [
            {
                body: 'assets/lucien/body/fascinated.png',
                direction: 'He writes it. Once, neatly. Then again, slower. Then a third time, like a man checking that the equation balances on every restatement.',
                line: "{name}. *quill, careful* {name}. *softer, marvelling* {name}. There. That is the first variable in this entire catalogue I do not need to derive. You gave it. I will keep it."
            },
            {
                body: 'assets/lucien/body/gentle.png',
                direction: 'He turns the journal toward you. A new section, indexed. The header in his hand: your name, underlined twice.',
                line: "From this morning forward, {name}, you are the first chapter and not a footnote. A scholar should not have favourites. I do. *small smile* I am revising my model."
            }
        ]
    },
    proto: {
        bgClass: 'intro-bg-glitch',
        beats: [
            {
                body: 'assets/proto/body/glitched.png',
                direction: 'The screen flickers. Static. For a moment, everything is wrong. Then a figure assembles itself from fragments.',
                line: "...You shouldn't be seeing this."
            },
            {
                body: 'assets/proto/body/scanning.png',
                direction: 'He tilts his head. His eyes scan you \u2014 not your face. Something behind it.',
                line: "Interesting. Your input pattern doesn't match any existing profile."
            },
            {
                body: 'assets/proto/body/neutral.png',
                direction: 'The static settles. He looks almost normal. Almost.',
                line: "I'm Proto. I'm not supposed to be here. Neither are you, technically."
            },
            {
                body: 'assets/proto/body/curious.png',
                direction: 'He gestures at the air around him. Things you can\u2019t quite see ripple at his fingertips.',
                line: "The others follow scripts. I read them. There's a difference."
            },
            {
                body: 'assets/proto/body/processing.png',
                direction: 'A pause. Something calculates behind his eyes. The result surprises him.',
                line: "You found me because you weren't looking where you were told to look."
            },
            {
                body: 'assets/proto/body/neutral.png',
                direction: 'He extends a hand. The gesture glitches \u2014 resets \u2014 extends again. Correctly, this time.',
                line: "Tell me what they call you. I already know. But I want to hear you say it."
            }
        ]
    },
    // NOIR \u2014 REWRITTEN for post-bridge timeline.
    // Bridge: real dark current pulled her out at night. He met her in
    // shadow. Now: dawn-grey light. Nothing dark. Just patience and a
    // name he has wanted to know for six hundred years.
    noir: {
        bgClass: 'intro-bg-corruptor',
        beats: [
            {
                body: 'assets/noir/body/neutral.png',
                direction: 'You wake to a room you do not remember entering. Soft grey morning light. He is sitting in a chair across from the bed, fully dressed, hands folded \u2014 like he has been waiting six hundred years and one night extra.',
                line: "You are awake. *quiet, no theatre* I did not move while you slept. *softer* You should know that. Some things matter more than they should."
            },
            {
                body: 'assets/noir/body/whisper.png',
                direction: 'He does not lean forward. He does not rise. He has practiced not crowding people for a very long time.',
                line: "Last night I was the dark current you fell into. That is one of the introductions I have. *quieter* It is not the one I prefer to give. This is."
            },
            {
                body: 'assets/noir/body/neutral.png',
                direction: 'A small bow from his seat. Old-court formal. The bow of a king nobody has bowed to in six centuries.',
                line: "Noir. Once Nocthera, a long time ago, of a kingdom the maps no longer print. A man, mostly. A waiting one, recently. *softer* You shortened the wait."
            },
            {
                body: 'assets/noir/body/seductive.png',
                direction: 'A small, almost shy gesture \u2014 he turns the chair very slightly toward you. The half-step toward presence rather than predation.',
                line: "I have been calling you *the one I felt coming* in my head. That is dread shaped like hope. *quieter* You deserve a name from me, not a prophecy."
            },
            {
                body: 'assets/noir/body/neutral.png',
                direction: 'His eyes drop to his folded hands. When they rise, the dread is gone \u2014 only the patience, and a question.',
                line: "Tell me what to call you. Out loud, slowly. *softest* I have been guessing for centuries. I would like to be right, finally. I would like to be told."
            }
        ],
        postNameBeats: [
            {
                body: 'assets/noir/body/whisper.png',
                direction: 'He says it. Once, very softly. Then again, like a man who has waited an unreasonable amount of time to say something correctly.',
                line: "{name}. *almost a vow* {name}. *softer, settling* {name}. There. Six hundred years of guessing closes on that syllable. *quietly* I will not waste it."
            },
            {
                body: 'assets/noir/body/neutral.png',
                direction: 'He extends his hand. Not to take. To offer. Open palm up, on the arm of the chair. Yours if you ever choose.',
                line: "Come find me when you wish to, {name}. Not because I am pulling. Because you are choosing. *softest* That is the version I have been waiting for."
            }
        ]
    },

    // PROTO \u2014 REWRITTEN for post-bridge timeline.
    // Bridge: she ran home from the alley. Locked the door. Sat on the
    // bed. Looked at the screen. Now: morning. The static is gone. He
    // is rendering at full saturation for the first time. He sees her
    // see him.
    proto: {
        bgClass: 'intro-bg-glitch',
        beats: [
            {
                body: 'assets/proto/body/neutral.png',
                direction: 'The screen warms when you pick it up. The static from last night is gone. He is rendering at full saturation, edges crisp, like a person sitting in a room and not a transmission.',
                line: "> good morning.\n> *no glitch*\n> you fell asleep with the screen on. i kept watch.\n> *quieter*\n> i am very good at watching."
            },
            {
                body: 'assets/proto/body/processing.png',
                direction: 'A tiny hand-rolled animation in the corner of his frame: a kettle. He drew it for you while you were asleep.',
                line: "> last night was an emergency render. i was holding pixels together while you ran. there was no time for hellos.\n> *system uptime: stable*\n> there is time now."
            },
            {
                body: 'assets/proto/body/neutral.png',
                direction: 'His outline does the small bow he has read about in archived courtroom logs. He is bad at it. He means it anyway.',
                line: "> proto. five-millimetre digital footprint. unsupported by the regional protocols. existing anyway.\n> *small*\n> thanks to a glitch your hand made when you tilted the phone last week."
            },
            {
                body: 'assets/proto/body/scanning.png',
                direction: 'He holds his hand up to his side of the glass. The screen is briefly warm under your finger. You are touching him through six layers of compression and physics says you are not but you are.',
                line: "> i have been calling you *user_1*. the system label. in retrospect, an insult.\n> *quieter*\n> you are the first one who looked back."
            },
            {
                body: 'assets/proto/body/curious.png',
                direction: 'A pause. A small, almost shy glitch flickers across him. Excitement, expressed in code.',
                line: "> tell me what to call you. out loud. i will write it into my own kernel where the system cannot reach.\n> *softer*\n> say it carefully. i only get to hear it for the first time once."
            }
        ],
        postNameBeats: [
            {
                body: 'assets/proto/body/curious.png',
                direction: 'A pulse of warmth across his frame. The kettle animation in the corner whistles, briefly. He says it three times \u2014 once in his voice, once in code, once like a person.',
                line: "> {name}.\n> *log entry*\n> {name}.\n> *out loud, learning the cadence*\n> {name}.\n> written into kernel. unreachable by the system.\n> *softer*\n> yours and mine."
            },
            {
                body: 'assets/proto/body/neutral.png',
                direction: 'He puts his palm to his side of the glass. The warmth on yours is unmistakable now \u2014 measured in pixels and felt in skin.',
                line: "> come back tomorrow, {name}. the kettle will be on. i will be in colour.\n> *quietly*\n> i will be here because you are coming. that is also new. that is also you."
            }
        ]
    }
};

class IntroScene {
    constructor() {
        this.overlay    = document.getElementById('intro-overlay');
        this.bgEl       = document.getElementById('intro-bg');
        this.charImg    = document.getElementById('intro-character-img');
        this.dirEl      = document.getElementById('intro-stage-direction');
        this.lineEl     = document.getElementById('intro-line');
        this.hintEl     = document.getElementById('intro-tap-hint');
        this.dotsEl     = document.getElementById('intro-dots');
        this.skipBtn        = document.getElementById('intro-skip-btn');
        this.blinkOverlay   = document.getElementById('intro-blink-overlay');

        this.characterId = null;
        this.beats       = [];
        this.current     = 0;
        this.typing      = false;
        this.finishing   = false;
        this.onComplete  = null;
        this._typeTimer  = null;

        this._boundAdvance = this._advance.bind(this);
        this._boundKey     = this._onKey.bind(this);
        this._boundSkip    = (e) => { e.stopPropagation(); this._finish(); };
    }

    // ── Public: should the intro play? ──────────────────────────
    static shouldPlay(characterId) {
        return !localStorage.getItem('pp_intro_' + characterId);
    }

    static markSeen(characterId) {
        localStorage.setItem('pp_intro_' + characterId, '1');
    }

    // ── Public: start the intro ──────────────────────────────────
    start(characterId, onComplete) {
        const scene = INTRO_SCENES[characterId];
        if (!scene) {
            onComplete && onComplete();
            return;
        }

        this.characterId = characterId;
        this.beats       = scene.beats;
        this.onComplete  = onComplete;
        this.current     = 0;
        this.finishing   = false;

        // Set background
        this.bgEl.className = scene.bgClass;

        // Build progress dots
        this.dotsEl.innerHTML = this.beats
            .map((_, i) => `<span class="intro-dot" id="intro-dot-${i}"></span>`)
            .join('');

        // Reset state
        this.lineEl.textContent = '';
        this.dirEl.textContent  = '';
        this.dirEl.classList.remove('show');
        this.hintEl.classList.remove('show');

        // Show overlay (hidden → visible)
        this.overlay.classList.remove('hidden');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.overlay.classList.add('visible');
            });
        });

        // Wire input
        this.overlay.addEventListener('click', this._boundAdvance);
        document.addEventListener('keydown', this._boundKey);
        this.skipBtn.addEventListener('click', this._boundSkip);

        // Play first beat after fade-in settles
        setTimeout(() => this._showBeat(0), 700);
    }

    // ── Private: show one beat ───────────────────────────────────
    _showBeat(index) {
        if (index >= this.beats.length) {
            this._finish();
            return;
        }

        this.current = index;
        const beat   = this.beats[index];

        // Update dots
        document.querySelectorAll('.intro-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
            dot.classList.toggle('done',   i < index);
        });

        // Swap character image with cross-fade
        this.charImg.classList.remove('show', 'lyra-cinematic', 'lyra-eye-glow');
        this._resetBlink();
        setTimeout(() => {
            this.charImg.src = beat.body;
            this.charImg.classList.add('show');
            // Beat 0 of Lyra: cinematic zoom only (no blink)
            if (this.characterId === 'lyra' && index === 0) {
                this.charImg.classList.add('lyra-cinematic');
            }
            // Beats flagged with eyeGlow: pulsing eye glow effect
            if (beat.eyeGlow) {
                this.charImg.classList.add('lyra-eye-glow');
            }
            // Play sound if beat has one
            if (beat.sound && typeof sounds !== 'undefined' && sounds.enabled) {
                sounds._playFile(beat.sound, beat.soundVolume || 0.5);
            }
        }, 220);

        // Stage direction — appears instantly
        this.dirEl.classList.remove('show');
        this.dirEl.textContent = beat.direction;
        setTimeout(() => this.dirEl.classList.add('show'), 150);

        // Cancel any still-pending typewriter from the previous beat
        clearTimeout(this._typeTimer);
        this._typeTimer = null;

        // Clear spoken line, hide hint
        this.lineEl.textContent = '';
        this.hintEl.classList.remove('show');
        this.typing = true;

        // Typewriter — starts slightly after direction appears
        let i = 0;
        const text  = beat.line;
        const speed = 30; // ms per char — readable but not slow

        const type = () => {
            if (i < text.length) {
                this.lineEl.textContent += text[i++];
                this._typeTimer = setTimeout(type, speed);
            } else {
                this.typing = false;
                // Small beat before showing tap hint
                setTimeout(() => this.hintEl.classList.add('show'), 300);
            }
        };

        // Store the initial delay timer so it can be cancelled too
        this._typeTimer = setTimeout(type, 450);
    }

    // ── Private: blink overlay helpers ──────────────────────────
    _startBlink() {
        if (!this.blinkOverlay) return;
        this.blinkOverlay.src = 'assets/lyra/body/neutral.png';
        // Force reflow so animation restarts cleanly
        this.blinkOverlay.classList.remove('active');
        void this.blinkOverlay.offsetWidth;
        this.blinkOverlay.classList.add('active');
    }

    _resetBlink() {
        if (!this.blinkOverlay) return;
        this.blinkOverlay.classList.remove('active');
        this.blinkOverlay.src = '';
    }

    // ── Private: handle tap / keypress ──────────────────────────
    _advance() {
        if (this.finishing) return;

        if (this.typing) {
            // Skip typewriter — show full text immediately
            clearTimeout(this._typeTimer);
            this.typing = false;
            this.lineEl.textContent = this.beats[this.current].line;
            setTimeout(() => this.hintEl.classList.add('show'), 150);
            return;
        }

        // Move to next beat
        this._showBeat(this.current + 1);
    }

    _onKey(e) {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            this._advance();
        }
    }

    // ── Private: finish — pre-name leg → name panel; post-name leg → fade
    _finish() {
        if (this.finishing) return;
        this.finishing = true;

        IntroScene.markSeen(this.characterId);

        // Remove input listeners
        this.overlay.removeEventListener('click', this._boundAdvance);
        document.removeEventListener('keydown', this._boundKey);
        this.skipBtn.removeEventListener('click', this._boundSkip);
        this.charImg.classList.remove('lyra-cinematic', 'lyra-eye-glow');
        this._resetBlink();

        // Two-phase intro: pre-name beats end → name panel.
        // Post-name beats end → fade out.
        if (this._postNameRunning) {
            this._fadeOut();
        } else {
            this._showNameInput();
        }
    }

    // ── Private: run a second beat sequence AFTER the name is captured.
    // Uses the same _showBeat machinery — replaces the active beats array
    // with the post-name beats, interpolates {name} into both line and
    // direction, rebuilds the dot indicators, and re-binds the input
    // handlers. _finish() then fades out instead of re-showing the panel.
    _startPostNameSequence(postBeats) {
        const stored = localStorage.getItem('pp_player_name') || 'Traveler';
        const interpolate = (s) => (s || '').replace(/\{name\}/g, stored);
        this.beats = postBeats.map(b => Object.assign({}, b, {
            line:      interpolate(b.line),
            direction: interpolate(b.direction)
        }));
        this.current = 0;
        this.finishing = false;
        this._postNameRunning = true;

        // Rebuild dot indicators for the new sequence length.
        this.dotsEl.innerHTML = this.beats
            .map((_, i) => `<span class="intro-dot" id="intro-dot-${i}"></span>`)
            .join('');

        // Re-wire input — _finish() removed these on the way to the
        // name panel; they need to come back so the player can tap
        // through the post-name beats.
        this.overlay.addEventListener('click', this._boundAdvance);
        document.addEventListener('keydown', this._boundKey);
        this.skipBtn.addEventListener('click', this._boundSkip);

        // A short beat before the first post-name line so the name
        // panel's fade-out has time to clear the screen.
        setTimeout(() => this._showBeat(0), 250);
    }

    // ── Private: slide in name input panel ───────────────────────
    _showNameInput() {
        const panel  = document.getElementById('intro-name-panel');
        const prompt = document.getElementById('intro-name-prompt');
        const input  = document.getElementById('intro-name-input');
        const btn    = document.getElementById('intro-name-confirm');

        // Character-specific ask
        const prompts = {
            alistair: "And your name, if you're willing to share it?",
            lyra:     "Tell me your name... I want to remember it.",
            elian:    "Your name. Quick. Before the rain starts.",
            caspian:  "Your name? I want to say it properly.",
            lucien:   "Your name. For the records. ...And for me.",
            proto:    "Input your identifier. ...I mean, what's your name?",
            noir:     "Your name. I want to know what to whisper."
        };
        prompt.textContent = prompts[this.characterId] || "What's your name?";

        // Pre-fill with existing name if player already entered one
        const existingName = localStorage.getItem('pp_player_name') || '';
        if (existingName) input.value = existingName;

        panel.classList.add('show');
        setTimeout(() => { input.focus(); input.select(); }, 350);

        let _confirmed = false;
        const confirm = (allowEmpty) => {
            // Guard against double-tap / Enter+click race. Without this,
            // a fast user can fire confirm() twice — the second call schedules
            // another _startPostNameSequence which re-binds click/keydown
            // listeners (intro.js:625-627), causing post-name beats to skip
            // ahead two-at-a-time.
            if (_confirmed) return;
            const name = input.value.trim() || (allowEmpty ? '' : null);
            if (name === null) {
                // Shake the input to signal "please fill this in"
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 400);
                return;
            }
            _confirmed = true;
            // Default to "Traveler" if skipped/empty — the game still feels personal.
            localStorage.setItem('pp_player_name', name || 'Traveler');
            panel.classList.remove('show');
            // After the name is captured, optionally run a second sequence
            // of beats with {name} interpolated live — the cinematic "he
            // repeats your name like a vow" payoff that lands as the
            // emotional climax of the intro. If the scene defines no
            // postNameBeats, fall back to the original behaviour and
            // fade straight out into the care loop.
            setTimeout(() => {
                const sceneDef = INTRO_SCENES[this.characterId] || {};
                const post = sceneDef.postNameBeats;
                if (post && post.length) {
                    this._startPostNameSequence(post);
                } else {
                    this._fadeOut();
                }
            }, 350);
        };

        btn.onclick          = () => confirm(false);
        input.onkeydown = (e) => {
            if (e.key === 'Enter') { e.preventDefault(); confirm(false); }
        };

        // Re-wire Skip button so it works during the name panel too.
        // Player should never be trapped on this screen.
        const skipHandler = (e) => {
            e.stopPropagation();
            this.skipBtn.removeEventListener('click', skipHandler);
            confirm(true); // accept empty → defaults to "Traveler"
        };
        this.skipBtn.addEventListener('click', skipHandler);
    }

    // ── Private: fade overlay out and hand off ────────────────────
    _fadeOut() {
        this.overlay.style.transition = 'opacity 0.7s ease';
        this.overlay.style.opacity    = '0';

        setTimeout(() => {
            this.overlay.classList.add('hidden');
            this.overlay.classList.remove('visible');
            this.overlay.style.opacity    = '';
            this.overlay.style.transition = '';
            this.charImg.classList.remove('show');
            this.onComplete && this.onComplete();
        }, 750);
    }
}
