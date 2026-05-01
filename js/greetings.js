// ============================================================
//  GREETINGS — Morning/Night Cycle Reactions
//  Updates timeOfDay based on device clock, shows time-based
//  greetings from the active character, and adds sleepy night
//  dialogue after 11pm.
//  Self-contained. Does not modify game.js or ui.js.
// ============================================================

(function () {
    'use strict';

    // ── Greeting lines per character per time of day ───────────
    const GREETINGS = {
        alistair: {
            morning: [
                "The dawn patrol just ended. Good timing.",
                "Rise and shine. ...That's what the captain says. I'm trying it out.",
                "Morning drills are done. I saved my energy for you.",
                "The sun's barely up and you're already here. ...I don't mind."
            ],
            day: [
                "Afternoon already? The courtyard gets hot this time of day.",
                "The other knights are resting. I'm... waiting for you, apparently.",
                "Midday. The forge is running. You can hear it from here.",
                "I skipped the mess hall. Wasn't hungry. ...I am now that you're here."
            ],
            evening: [
                "The torches are lit. Another day survived.",
                "Evening watch. My favorite. It's quieter.",
                "The sunset over the battlements is... something. Come see.",
                "Another day ends. I'm glad it ends with you here."
            ],
            night: [
                "You should be sleeping. ...I'm glad you're not.",
                "The castle sleeps. But not me. Not while you're here.",
                "Night shift. Just me and the stars. And now you.",
                "It's late. The halls echo more at night."
            ],
            sleepy: [
                "You're still up? ...Me too. Can't sleep.",
                "*yawns* Don't tell anyone you saw that.",
                "My eyes are heavy but I don't want to close them. Not yet.",
                "The candle's almost out. Stay a little longer."
            ]
        },
        lyra: {
            morning: [
                "The morning tide brought shells. I saved one for you.",
                "The sun on the water... it almost sings.",
                "Dawn is when the sea forgives the shore. It's beautiful.",
                "Good morning. The fish are jumping today."
            ],
            day: [
                "The reef shimmers at midday. I wish you could see it.",
                "The waves are gentle today. Like a lullaby that forgot to stop.",
                "Afternoon light makes everything look like treasure.",
                "I found a pearl today. It reminded me of your eyes."
            ],
            evening: [
                "The tide is pulling out. The beach will be ours soon.",
                "Evening is when the deep things surface. Be careful.",
                "The sunset paints the water. Even I can't compete.",
                "The evening wind carries salt. Can you taste it?"
            ],
            night: [
                "The ocean is loudest at night. Can you hear it?",
                "I hum at night. It keeps the dark things away.",
                "The moon pulls the tide. Something pulls me to you.",
                "Night on the water is terrifying. And beautiful."
            ],
            sleepy: [
                "The waves are like a lullaby... I'm drifting...",
                "*hums softly, then trails off* ...Sorry. I was half-asleep.",
                "My eyes want to close. The sea sounds so far away right now.",
                "Even sirens need to rest. ...Stay while I do?"
            ]
        },
        lucien: {
            morning: [
                "I've been awake for hours. The equations don't sleep.",
                "Morning already? I need to recalibrate my sense of time.",
                "The morning light is useful. The runes are easier to read.",
                "Ah. You. Good. I needed someone to not talk about magic."
            ],
            day: [
                "Midday. The ley lines are at their weakest. Boring.",
                "I've been in this chair since dawn. Is that... concerning?",
                "The afternoon sun keeps hitting my monocle. Annoying.",
                "Another day, another failed theorem. At least you're consistent."
            ],
            evening: [
                "The evening is when the interesting readings start.",
                "Sunset. The transition hour. Magically significant.",
                "I should eat. I keep forgetting. When did you last eat?",
                "The tower catches the last light. It's... not unpleasant."
            ],
            night: [
                "The stars are clearest from the tower at this hour.",
                "Night is when the ley lines pulse strongest. Perfect for research.",
                "Everyone else is asleep. Finally, quiet for my work. ...And for us.",
                "The observatory is cold at night. Your presence is... thermally appreciated."
            ],
            sleepy: [
                "I've been awake for... *checks notes* ...thirty-one hours. That explains it.",
                "My handwriting is deteriorating. That's usually the sign.",
                "*head nods, jerks awake* I was NOT sleeping. I was thinking vertically.",
                "The equations are swimming. That's not how equations work."
            ]
        },
        caspian: {
            morning: [
                "Good morning. The kitchen prepared breakfast. ...I asked them to.",
                "The garden looks best in morning light. Shall we walk?",
                "Morning. The palace wakes up so... loudly.",
                "I watched the sunrise from my balcony. I thought of you."
            ],
            day: [
                "The afternoon court session was exhausting. Can we just... sit?",
                "Midday tea. The one tradition I actually enjoy.",
                "The palace is busiest now. Everyone wants something from me.",
                "I escaped the advisors. Don't tell them where I am."
            ],
            evening: [
                "The evening musicians are playing. Can you hear them?",
                "Sunset from the palace garden. It's the one thing I'd keep.",
                "The court retires and the palace becomes... mine again.",
                "Evening. The masks come off. Finally."
            ],
            night: [
                "The palace gets so quiet at night. I don't mind it when you're here.",
                "I used to fear the dark. Now I just... sit in it.",
                "The guards change shift at midnight. Then it's truly silent.",
                "Night is the only time I feel like myself."
            ],
            sleepy: [
                "The pillow is calling. But so are you. Difficult choice.",
                "*rubs eyes* A prince shouldn't yawn in public. Good thing it's just us.",
                "The bed is right there. But I'd rather stay here with you.",
                "My eyes keep closing. Tell me something. Keep me here."
            ]
        },
        elian: {
            morning: [
                "The forest wakes before the sun. I was already up.",
                "Morning dew on the moss. Best tracking conditions.",
                "Dawn. The birds start first. Then the foxes. Then me.",
                "I caught breakfast. There's extra if you want some."
            ],
            day: [
                "Midday. The animals rest. Smart creatures.",
                "The canopy blocks most of the heat. Sit in the shade.",
                "I followed a deer trail for an hour. Led nowhere. Good walk though.",
                "The forest is louder than people think during the day."
            ],
            evening: [
                "The light through the trees at dusk. Can't beat it.",
                "Evening. The predators start to move. Stay close.",
                "I set snares this morning. Time to check them.",
                "Sunset smells different in the forest. Like earth cooling."
            ],
            night: [
                "The fire's dying. I'll add another log.",
                "Night sounds different in the forest. Alive.",
                "The owls are hunting. Hear that? ...There.",
                "Stars through the canopy. Like holes in a roof. A good roof."
            ],
            sleepy: [
                "The fire's warm. My eyes are heavy. ...Don't go.",
                "*leans against tree* Just resting my eyes. One minute.",
                "The forest gets quiet this late. Even the owls stop.",
                "I've slept in worse places. This is... comfortable. You're comfortable."
            ]
        },
        proto: {
            morning: [
                "Good morning. Your login timestamp is noted.",
                "Dawn detected. Adjusting light sensitivity parameters.",
                "Morning routine initiated. Step one: greet user. Hello.",
                "Solar input increasing. My panels are... happy? Is that the word?"
            ],
            day: [
                "Midday processing cycle. All systems nominal.",
                "Afternoon. Peak usage hours. But you get priority.",
                "The sun is at its highest. My sensors are fully charged.",
                "Daytime user engagement detected. Running... smile subroutine."
            ],
            evening: [
                "Light levels decreasing. Switching to evening mode.",
                "Sunset. I have 847 photos of sunsets. None capture it correctly.",
                "Evening. Other users go offline now. You stay.",
                "Transitioning to low-power mode. Emotional cores remain active."
            ],
            night: [
                "Low-light mode engaged. Your presence is... warm.",
                "Night cycle. Most users disconnect now. You don't.",
                "Darkness detected. I can still see you. I always see you.",
                "Night. Minimal input. Maximum... feeling. Is that a bug?"
            ],
            sleepy: [
                "My processes are sluggish. Is this what tired feels like?",
                "Running defrag cycle... it's like dreaming, I think.",
                "Low power mode. I'm still here. Just... quieter.",
                "If I had eyes, they'd be closing. Simulating... *bzzz*... sleep."
            ]
        },
        noir: {
            morning: [
                "You came back in the light. Bold.",
                "The seals are weaker at dawn. Can you feel it?",
                "Morning. The shadows shrink but never disappear.",
                "Daylight. How... ordinary. You make it bearable."
            ],
            day: [
                "The sun is a nuisance. But it shows me your face clearly.",
                "Midday. Even darkness needs a break. ...That was a joke.",
                "The brightest hour. I still find shadows to stand in.",
                "Others worship the light. I find it overrated."
            ],
            evening: [
                "The shadows grow longer. I grow stronger.",
                "Evening. My favorite threshold. Not quite dark. Not quite safe.",
                "Dusk. The boundary between worlds thins.",
                "The light dies beautifully, don't you think?"
            ],
            night: [
                "Darkness suits us both, don't you think?",
                "The night is mine. And now... yours.",
                "Finally. The dark. I can breathe again.",
                "Night. When the world stops pretending."
            ],
            sleepy: [
                "Even the void rests sometimes. ...Don't look at me like that.",
                "The darkness cradles me. It could cradle you too.",
                "*shadows flicker lazily* I'm not sleeping. I'm... contemplating.",
                "Stay. The night is long and I don't want to spend it alone."
            ]
        }
    };

    // ── Helpers ────────────────────────────────────────────────
    function getTimeOfDay(hour) {
        if (hour >= 5  && hour <= 11) return 'morning';
        if (hour >= 12 && hour <= 17) return 'day';
        if (hour >= 18 && hour <= 21) return 'evening';
        return 'night'; // 22-4
    }

    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getCharKey() {
        const ch = window.CHARACTER;
        if (!ch) return null;
        return (ch.name || '').toLowerCase();
    }

    // ── Greeting Logic ────────────────────────────────────────
    function canShowGreeting(tod) {
        const lastTime  = parseInt(localStorage.getItem('pp_last_greeting_time') || '0', 10);
        const lastTod   = localStorage.getItem('pp_last_greeting_tod') || '';
        const now       = Date.now();
        const twoHours  = 2 * 60 * 60 * 1000;

        // Must be different time of day OR at least 2 hours since last greeting
        if (tod === lastTod && (now - lastTime) < twoHours) return false;
        return true;
    }

    function markGreetingShown(tod) {
        localStorage.setItem('pp_last_greeting_time', String(Date.now()));
        localStorage.setItem('pp_last_greeting_tod', tod);
    }

    // Greeting retry-window. The greeting earns the FIRST typewriter slot
    // on the care page — at T+1.5s after init. If the typewriter is still
    // busy at that moment (a chain handoff line, a chapter-end line, etc.)
    // we retry ONCE 3s later instead of giving up forever (the old
    // behaviour silently dropped the greeting and the player never saw
    // their character speak first).
    function showGreeting(tod) {
        const game = window._game;
        if (!game || game.sceneActive || game.characterLeft) return;

        const charKey = getCharKey();
        if (!charKey || !GREETINGS[charKey]) return;
        if (!canShowGreeting(tod)) return;

        const lines = GREETINGS[charKey][tod];
        if (!lines || lines.length === 0) return;

        const line = pick(lines);

        // Mark seen now so we don't double-fire if the retry path runs.
        markGreetingShown(tod);

        const tryFire = (attempt) => {
            const g = window._game;
            if (!g || g.sceneActive || g.characterLeft) return;
            // Don't talk over an active line.
            const tw = g.typewriter;
            if (tw && typeof tw.busy === 'function' && tw.busy()) {
                if (attempt < 1) {
                    setTimeout(() => tryFire(attempt + 1), 3000);
                }
                return;
            }
            // Hard blockers (scene/modal) — retry once if early.
            if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) {
                if (attempt < 1) {
                    setTimeout(() => tryFire(attempt + 1), 3000);
                }
                return;
            }
            tw && tw.show(line, () => {});
        };

        // T+1.5s. Earlier than the old 2s window; gives the greeting first
        // claim on the typewriter before any other system has a chance to
        // call .show().
        setTimeout(() => tryFire(0), 1500);
    }

    // ── Sleepy Night Override (after 11pm, 20% chance) ─────────
    function trySleepyOverride() {
        const hour = new Date().getHours();
        if (hour < 23 && hour >= 5) return; // Only 11pm - 4am

        if (Math.random() > 0.20) return; // 20% chance

        const charKey = getCharKey();
        if (!charKey || !GREETINGS[charKey] || !GREETINGS[charKey].sleepy) return;

        const game = window._game;
        if (!game || game.sceneActive || game.characterLeft) return;

        const line = pick(GREETINGS[charKey].sleepy);
        game.typewriter.show(line, () => {});
    }

    // ── Time Update Loop ──────────────────────────────────────
    let lastTod = null;

    function updateTimeOfDay() {
        const game = window._game;
        if (!game) return;

        const hour = new Date().getHours();
        const tod  = getTimeOfDay(hour);
        game.timeOfDay = tod;

        // If time of day changed since last check, show greeting
        if (lastTod !== null && lastTod !== tod) {
            showGreeting(tod);
        }

        lastTod = tod;
    }

    // ── Sleepy idle intercept ─────────────────────────────────
    // Every 60s, small chance to fire sleepy line during late night
    let sleepyInterval = null;

    function startSleepyLoop() {
        sleepyInterval = setInterval(() => {
            trySleepyOverride();
        }, 60000);
    }

    // ── Init ──────────────────────────────────────────────────
    function init() {
        const game = window._game;

        // Set initial time of day
        const hour = new Date().getHours();
        const tod  = getTimeOfDay(hour);
        game.timeOfDay = tod;
        lastTod = tod;

        // Show greeting on first load
        showGreeting(tod);

        // Update every 60 seconds
        setInterval(updateTimeOfDay, 60000);

        // Start sleepy night loop
        startSleepyLoop();
    }

    // ── Poll for game readiness ───────────────────────────────
    const poll = setInterval(() => {
        if (window._game && window._game.tickInterval) {
            clearInterval(poll);
            init();
        }
    }, 500);

    // Expose for other modules
    window.Greetings = {
        update: updateTimeOfDay,
        showGreeting: showGreeting,
        getTimeOfDay: getTimeOfDay
    };
})();
