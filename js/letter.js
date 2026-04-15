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

    // ── Presentation ────────────────────────────────────────────
    function present(game) {
        const content = buildLetterText(game);
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
                return;
            }
            const p = document.createElement('p');
            p.className = 'letter-paragraph';
            p.textContent = paragraphs[idx];
            bodyEl.appendChild(p);
            // Next-tick so the CSS transition fires
            requestAnimationFrame(() => p.classList.add('shown'));
            // Scroll down if the letter got tall
            try { p.scrollIntoView({ behavior: 'smooth', block: 'end' }); } catch (e) {}
            idx++;
        }
        // Show first paragraph immediately so the letter isn't blank.
        revealNext();

        function onTap(e) {
            // Ignore taps on the action buttons.
            if (e.target && e.target.closest('.letter-actions')) return;
            revealNext();
        }
        overlay.addEventListener('click', onTap);

        // Close handlers
        function close() {
            overlay.removeEventListener('click', onTap);
            overlay.classList.remove('visible');
            setTimeout(() => overlay.classList.add('hidden'), 400);
            // Resume tick.
            if (pausedTick !== null && game && !game.tickInterval) {
                game.lastTick = Date.now();
                game.tickInterval = setInterval(() => game.tick && game.tick(), 100);
            }
            // Persist so it only fires once per character.
            try {
                const key = 'pp_letter_seen_' + (game.selectedCharacter || 'alistair');
                localStorage.setItem(key, JSON.stringify({
                    seenAt: Date.now(),
                    day: content.data.storyDay,
                    title: content.title,
                }));
            } catch (err) {}
        }

        const keepBtn = overlay.querySelector('.letter-btn-keep');
        const shareBtn = overlay.querySelector('.letter-btn-share');

        if (keepBtn) keepBtn.onclick = (e) => { e.stopPropagation(); close(); };
        if (shareBtn) shareBtn.onclick = (e) => {
            e.stopPropagation();
            // Copy full letter text to clipboard so they can paste it anywhere.
            const text = [content.title, '', ...content.paragraphs, '', content.signature].join('\n\n');
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    shareBtn.textContent = 'Copied ✓';
                    setTimeout(() => { shareBtn.textContent = 'Share'; }, 1800);
                }).catch(() => {
                    shareBtn.textContent = 'Copy failed';
                });
            } else {
                shareBtn.textContent = 'No clipboard';
            }
        };
    }

    // ── Trigger logic ───────────────────────────────────────────
    // Conditions: story day >= 3, at least 8 interactions, not seen yet.
    function shouldFire(game) {
        if (!game || !game.selectedCharacter) return false;
        try {
            const key = 'pp_letter_seen_' + game.selectedCharacter;
            if (localStorage.getItem(key)) return false;
        } catch (e) {}
        const totalInteractions = (game.timesFed || 0) + (game.timesWashed || 0)
            + (game.timesTalked || 0) + (game.timesGifted || 0) + (game.timesTrained || 0);
        const day = game.storyDay || 1;
        return day >= 3 && totalInteractions >= 8;
    }

    function check(game) {
        if (!shouldFire(game)) return false;
        // Don't interrupt an active scene.
        if (game && game.sceneActive) return false;
        // Small delay so it doesn't fire mid-action
        setTimeout(() => present(game), 400);
        return true;
    }

    // ── Manual trigger for testing + potential menu entry ──────
    function force(game) { if (game) present(game); }

    // Expose globally — game.js will poll check() once per tick.
    window.LetterSystem = {
        check: check,
        force: force,
        buildLetterText: buildLetterText,
    };
})();
