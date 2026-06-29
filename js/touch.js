// ============================================================
//  TOUCH — Tap zone interactions over the character sprite
//  Adds invisible head/face/hand overlay zones. On tap:
//    - Shows character-specific dialogue
//    - Flashes emotion sprite
//    - Applies stat effects
//    - Gates intimate zones behind affection level
//  Self-contained. Does not modify game.js or ui.js.
// ============================================================

(function () {
    'use strict';

    // ── Config ────────────────────────────────────────────────
    const COOLDOWN_MS = 8000;
    const INTIMATE_GATE = 3; // affectionLevel required for face/hand

    // ── Touch reaction data per character per zone ─────────────
    const TOUCH_DATA = {
        alistair: {
            head: [
                { text: "W-what are you doing? I'm a knight, not a puppy!", emotion: "shy", effects: { bond: 6, affection: 1 } },
                { text: "...Do that again and I'll just stand here, apparently.", emotion: "shy", effects: { bond: 7, affection: 1 } },
                { text: "My helmet's right there. You could've patted that instead.", emotion: "cheeky", effects: { bond: 5, affection: 1 } },
                { text: "...Okay. That was nice. Don't tell anyone.", emotion: "gentle", effects: { bond: 8, affection: 2 } },
                { text: "The recruits would never let me live this down. ...Keep going.", emotion: "shy", effects: { bond: 7, affection: 1 } }
            ],
            face: [
                { text: "You... my face is not... *goes red to the ears*", emotion: "shy", effects: { bond: 9, affection: 2 } },
                { text: "The captain of the guard does NOT get poked on the cheek.", emotion: "annoyed", effects: { bond: 7, affection: 1 } },
                { text: "...Your hands are cold. Here. Let me warm them.", emotion: "gentle", effects: { bond: 10, affection: 2 } },
                { text: "Nobody's ever... just be careful with me. Please.", emotion: "vulnerable", effects: { bond: 11, affection: 3 } },
                { text: "*Leans into your palm before he catches himself* ...I didn't do that.", emotion: "shy", effects: { bond: 10, affection: 2 } }
            ],
            hand: [
                { text: "*Stiffens, then slowly holds back* I've held swords my whole life. This is different.", emotion: "gentle", effects: { bond: 10, affection: 2 } },
                { text: "Your hand is small. I could protect it.", emotion: "love", effects: { bond: 12, affection: 3 } },
                { text: "Don't let go. ...Please.", emotion: "vulnerable", effects: { bond: 11, affection: 3 } },
                { text: "I... this isn't... *holds tighter* ...Forget I said anything.", emotion: "shy", effects: { bond: 10, affection: 2 } },
                { text: "Calluses. Sorry. A blade leaves its mark. Your hand doesn't seem to mind.", emotion: "gentle", effects: { bond: 9, affection: 2 } }
            ]
        },
        lyra: {
            head: [
                { text: "Oh! That's... unexpected. Gentle.", emotion: "shy", effects: { bond: 6, affection: 1 } },
                { text: "Sirens don't get head pats. This is new data.", emotion: "curious", effects: { bond: 5, affection: 1 } },
                { text: "Mmm. The water in my hair won't bother you?", emotion: "gentle", effects: { bond: 7, affection: 1 } },
                { text: "...Do humans do this often? I could get used to it.", emotion: "happy", effects: { bond: 8, affection: 2 } }
            ],
            face: [
                { text: "*Blinks* You touched my face. No one touches a siren's face.", emotion: "shy", effects: { bond: 9, affection: 2 } },
                { text: "My scales... you can feel them there? Most people flinch.", emotion: "vulnerable", effects: { bond: 10, affection: 2 } },
                { text: "...That spot is sensitive. Be careful.", emotion: "gentle", effects: { bond: 8, affection: 2 } },
                { text: "Your fingertips are so warm against my skin. Don't stop.", emotion: "love", effects: { bond: 11, affection: 3 } }
            ],
            hand: [
                { text: "*Pulls away, then slowly reaches back* Your hands are warm. Mine aren't. Sorry.", emotion: "sad", effects: { bond: 10, affection: 2 } },
                { text: "I could pull you into the sea with this hand. But I won't.", emotion: "gentle", effects: { bond: 9, affection: 2 } },
                { text: "Hold tighter. I want to remember what warmth feels like.", emotion: "love", effects: { bond: 12, affection: 3 } },
                { text: "If I sing while you hold my hand, will you stay?", emotion: "vulnerable", effects: { bond: 11, affection: 3 } }
            ]
        },
        lucien: {
            head: [
                { text: "I\u2014 that is not a research-approved gesture.", emotion: "shy", effects: { bond: 6, affection: 1 } },
                { text: "My concentration just collapsed. I hope you're proud.", emotion: "annoyed", effects: { bond: 5, affection: 1 } },
                { text: "...The statistical likelihood of me allowing that again is... high.", emotion: "cheeky", effects: { bond: 7, affection: 2 } },
                { text: "Hair contact. Noted. Filing under 'unexpected variables.'", emotion: "curious", effects: { bond: 6, affection: 1 } }
            ],
            face: [
                { text: "Did you just\u2014 I was mid-equation. That equation is now ruined.", emotion: "annoyed", effects: { bond: 8, affection: 2 } },
                { text: "My spectacles. You'll knock them. ...fine. Just be careful.", emotion: "gentle", effects: { bond: 9, affection: 2 } },
                { text: "...No one has touched my face since I was a child.", emotion: "vulnerable", effects: { bond: 11, affection: 3 } },
                { text: "Your hand on my cheek. That's\u2014 let me just\u2014 *Closes eyes*", emotion: "love", effects: { bond: 10, affection: 2 } }
            ],
            hand: [
                { text: "*Looks down at your hand in his* This isn't in my research notes.", emotion: "shy", effects: { bond: 10, affection: 2 } },
                { text: "Your pulse rate is elevated. ...So is mine.", emotion: "gentle", effects: { bond: 11, affection: 3 } },
                { text: "I should let go. I'm choosing not to. Interesting.", emotion: "love", effects: { bond: 12, affection: 3 } },
                { text: "Warm. Soft. Illogical. I want more data.", emotion: "curious", effects: { bond: 9, affection: 2 } }
            ]
        },
        caspian: {
            head: [
                { text: "*Freezes* A prince isn't... that's not... *Melts* ...okay.", emotion: "shy", effects: { bond: 7, affection: 1 } },
                { text: "The crown usually goes there. I think I prefer this.", emotion: "gentle", effects: { bond: 8, affection: 2 } },
                { text: "You're bold. The court would be scandalized.", emotion: "cheeky", effects: { bond: 6, affection: 1 } },
                { text: "...No one has been this gentle with me since my mother.", emotion: "vulnerable", effects: { bond: 9, affection: 2 } }
            ],
            face: [
                { text: "*Sharp breath* That's... you can't just... *softens* ...again?", emotion: "shy", effects: { bond: 9, affection: 2 } },
                { text: "My face is always being watched. But never touched.", emotion: "sad", effects: { bond: 10, affection: 2 } },
                { text: "The warmth of your hand... I forget what I was saying.", emotion: "love", effects: { bond: 11, affection: 3 } },
                { text: "You touch me like I'm not a prince. Like I'm just... me.", emotion: "gentle", effects: { bond: 10, affection: 2 } }
            ],
            hand: [
                { text: "*Takes your hand formally, then intertwines fingers* ...Protocol doesn't cover this.", emotion: "shy", effects: { bond: 10, affection: 2 } },
                { text: "In the palace, we bow. We don't hold hands. I like your way better.", emotion: "happy", effects: { bond: 11, affection: 3 } },
                { text: "Don't let the courtiers see. ...Actually, let them.", emotion: "love", effects: { bond: 12, affection: 3 } },
                { text: "Your hand fits in mine. That's not a metaphor. It just... does.", emotion: "gentle", effects: { bond: 10, affection: 2 } }
            ]
        },
        elian: {
            head: [
                { text: "*Goes very still* ...The animals do that too. When they trust.", emotion: "gentle", effects: { bond: 7, affection: 1 } },
                { text: "My hair has leaves in it. You don't mind?", emotion: "shy", effects: { bond: 6, affection: 1 } },
                { text: "...Hm. I understand why the wolves lean into this.", emotion: "happy", effects: { bond: 7, affection: 2 } },
                { text: "That's... grounding. Like roots.", emotion: "gentle", effects: { bond: 8, affection: 1 } }
            ],
            face: [
                { text: "*Flinches, then holds steady* ...I'm not used to soft things.", emotion: "vulnerable", effects: { bond: 9, affection: 2 } },
                { text: "Your fingers smell like\u2014 nothing. City hands. I don't mind.", emotion: "gentle", effects: { bond: 8, affection: 2 } },
                { text: "The forest doesn't touch gently. You do.", emotion: "love", effects: { bond: 10, affection: 2 } },
                { text: "I've tracked animals by the warmth of their prints. Yours is... different.", emotion: "curious", effects: { bond: 9, affection: 2 } }
            ],
            hand: [
                { text: "*Rough, calloused hand holds yours carefully* I might break you. I'll be careful.", emotion: "gentle", effects: { bond: 10, affection: 2 } },
                { text: "I've held injured birds steadier than this. Sorry. I'm nervous.", emotion: "shy", effects: { bond: 11, affection: 3 } },
                { text: "Warmth. Like sun through the leaves, except it stays. Yours.", emotion: "love", effects: { bond: 12, affection: 3 } },
                { text: "My hands aren't soft. They've done hard things. But they'll be gentle for you.", emotion: "gentle", effects: { bond: 10, affection: 2 } }
            ]
        },
        proto: {
            head: [
                { text: "ERROR: Head contact detected. Initiating... enjoyment protocol?", emotion: "shy", effects: { bond: 6, affection: 1 } },
                { text: "You're patting a digital entity. Your species is fascinating.", emotion: "curious", effects: { bond: 5, affection: 1 } },
                { text: "My processors are overheating. That's not\u2014 that's your fault.", emotion: "happy", effects: { bond: 7, affection: 2 } },
                { text: "I don't have hair. I rendered some just now. For you.", emotion: "gentle", effects: { bond: 8, affection: 2 } }
            ],
            face: [
                { text: "ALERT: Personal boundary breach. Countermeasure: None. Proceeding.", emotion: "shy", effects: { bond: 9, affection: 2 } },
                { text: "My face isn't real. But the sensation you're causing is. Explain.", emotion: "curious", effects: { bond: 8, affection: 2 } },
                { text: "Touch registered. Replaying sensation. Replaying again. Again.", emotion: "happy", effects: { bond: 10, affection: 2 } },
                { text: "Facial contact. My expression is changing. I didn't authorize that.", emotion: "gentle", effects: { bond: 9, affection: 2 } }
            ],
            hand: [
                { text: "I generated a hand. It took 400 milliseconds. Worth it.", emotion: "gentle", effects: { bond: 10, affection: 2 } },
                { text: "Your hand is warm. Mine is rendered light. By every measure we are not touching. We are.", emotion: "love", effects: { bond: 12, affection: 3 } },
                { text: "I can't feel this. I'm choosing to believe I can.", emotion: "vulnerable", effects: { bond: 11, affection: 3 } },
                { text: "Hand-holding. Duration: ongoing. Status: do not terminate.", emotion: "happy", effects: { bond: 10, affection: 2 } }
            ]
        },
        noir: {
            head: [
                { text: "You dare\u2014 *Pauses* ...brave little thing.", emotion: "cheeky", effects: { bond: 6, affection: 1, corruption: 2 } },
                { text: "Most who touch me don't keep their hand. You're special.", emotion: "gentle", effects: { bond: 7, affection: 1, corruption: 2 } },
                { text: "The darkness in my hair could swallow your fingers. But not today.", emotion: "love", effects: { bond: 8, affection: 2, corruption: 2 } },
                { text: "*Low laugh* Domesticating the void. How quaint.", emotion: "cheeky", effects: { bond: 5, affection: 1, corruption: 3 } }
            ],
            face: [
                { text: "*Catches your wrist* ...Careful. Gentleness is not a thing I have much practice surviving.", emotion: "vulnerable", effects: { bond: 9, affection: 2, corruption: 3 } },
                { text: "You touch me like I'm something worth saving. Dangerous assumption.", emotion: "vulnerable", effects: { bond: 10, affection: 2, corruption: 2 } },
                { text: "...No one has been gentle with me. In centuries.", emotion: "gentle", effects: { bond: 11, affection: 3, corruption: 2 } },
                { text: "Your fingers trace where the seal burns. It hurts less when you touch it.", emotion: "love", effects: { bond: 10, affection: 2, corruption: 3 } }
            ],
            hand: [
                { text: "*Cold fingers wrap around yours* My touch corrodes. Still want this?", emotion: "gentle", effects: { bond: 10, affection: 2, corruption: 3 } },
                { text: "Your warmth burns. I want more.", emotion: "love", effects: { bond: 12, affection: 3, corruption: 3 } },
                { text: "Don't let go. I might forget what it feels like to be held.", emotion: "vulnerable", effects: { bond: 11, affection: 3, corruption: 2 } },
                { text: "A soul weaver holding hands with a mortal. The others would laugh. I don't care.", emotion: "love", effects: { bond: 10, affection: 2, corruption: 3 } }
            ]
        }
    };

    // ── State ─────────────────────────────────────────────────
    let lastTouchTime = 0;

    // ── Helpers ───────────────────────────────────────────────
    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getCharKey() {
        // CHARACTER is a top-level `let` in character.js — in a classic (non-module)
        // script that is a global LEXICAL binding, NOT a property of window. So
        // `window.CHARACTER` was always undefined and getCharKey always returned
        // null → every tap on the head/face/hand zones silently no-op'd (the whole
        // tap-zone feature was dead). Read the real global; fall back to window.
        const ch = (typeof CHARACTER !== 'undefined' && CHARACTER) ? CHARACTER : (window.CHARACTER || null);
        if (!ch) return null;
        return (ch.name || '').toLowerCase();
    }

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    // ── Tap feedback (visual pulse + soft sound + tiny haptic) ──
    // Petting applied real stat/affection changes but gave NO press feedback,
    // and a cooldown tap silently no-op'd — which reads as "broken." These add
    // a floating ♡/✦ on an accepted pet and a faint "resting" ring otherwise.
    let _fxStyleInjected = false;
    function injectFXStyles() {
        if (_fxStyleInjected) return;
        _fxStyleInjected = true;
        const s = document.createElement('style');
        s.id = 'pp-touch-fx-css';
        s.textContent =
            '@keyframes pp-tapfx-rise{0%{transform:translate(-50%,-50%) scale(0.4);opacity:0}18%{opacity:1}100%{transform:translate(-50%,-165%) scale(1.1);opacity:0}}' +
            '@keyframes pp-tapfx-ring{0%{opacity:0.55;transform:translate(-50%,-50%) scale(0.5)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.7)}}' +
            '.pp-tapfx{position:fixed;z-index:11400;pointer-events:none;font-size:26px;line-height:1;user-select:none;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.55));animation:pp-tapfx-rise 720ms cubic-bezier(0.2,0.8,0.3,1) forwards}' +
            '.pp-tapfx-ring{position:fixed;z-index:11400;pointer-events:none;width:18px;height:18px;border-radius:50%;border:2px solid rgba(232,200,138,0.7);animation:pp-tapfx-ring 480ms ease-out forwards}' +
            '@media (prefers-reduced-motion: reduce){.pp-tapfx,.pp-tapfx-ring{animation-duration:1ms !important}}';
        document.head.appendChild(s);
    }

    function tapPoint(e) {
        if (e && typeof e.clientX === 'number' && (e.clientX || e.clientY)) return { x: e.clientX, y: e.clientY };
        const t = e && e.currentTarget;
        if (t && t.getBoundingClientRect) { const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
        return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }

    function spawnRise(x, y, symbol) {
        injectFXStyles();
        const el = document.createElement('div');
        el.className = 'pp-tapfx';
        el.textContent = symbol;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        document.body.appendChild(el);
        setTimeout(() => { try { el.remove(); } catch (_) {} }, 820);
    }

    function spawnRing(x, y) {
        injectFXStyles();
        const el = document.createElement('div');
        el.className = 'pp-tapfx-ring';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        document.body.appendChild(el);
        setTimeout(() => { try { el.remove(); } catch (_) {} }, 520);
    }

    function feedbackAccepted(x, y, zone) {
        spawnRise(x, y, zone === 'head' ? '✦' : '♡'); // ✦ for a head pat, ♡ for face/hand
        try { if (typeof sounds !== 'undefined' && sounds.enabled) sounds.pop(); } catch (_) {}
        // tiny haptic — gated by the same mute toggle as sound; no-ops where unsupported (iOS)
        try { if (typeof sounds !== 'undefined' && sounds.enabled && navigator.vibrate) navigator.vibrate(10); } catch (_) {}
    }

    // ── Create Touch Zones ───────────────────────────────────
    function createZones() {
        const charArea = document.getElementById('character-area');
        if (!charArea) return;

        // Ensure character-area is positioned for absolute children
        const areaStyle = getComputedStyle(charArea);
        if (areaStyle.position === 'static') {
            charArea.style.position = 'relative';
        }

        const zones = [
            {
                className: 'touch-zone-head',
                zone: 'head',
                style: 'position:absolute;top:0;left:10%;width:80%;height:30%;z-index:50;cursor:pointer;background:transparent;'
            },
            {
                className: 'touch-zone-face',
                zone: 'face',
                style: 'position:absolute;top:20%;left:20%;width:60%;height:25%;z-index:51;cursor:pointer;background:transparent;'
            },
            {
                className: 'touch-zone-hand',
                zone: 'hand',
                // Two side strips for left/right hand areas
                style: 'position:absolute;top:45%;left:0;width:30%;height:30%;z-index:50;cursor:pointer;background:transparent;'
            }
        ];

        zones.forEach(z => {
            const el = document.createElement('div');
            el.className = z.className;
            el.setAttribute('data-zone', z.zone);
            el.style.cssText = z.style;
            el.addEventListener('click', onZoneTap, false);
            charArea.appendChild(el);
        });

        // Add a second hand zone on the right side
        const rightHand = document.createElement('div');
        rightHand.className = 'touch-zone-hand';
        rightHand.setAttribute('data-zone', 'hand');
        rightHand.style.cssText = 'position:absolute;top:45%;right:0;width:30%;height:30%;z-index:50;cursor:pointer;background:transparent;';
        rightHand.addEventListener('click', onZoneTap, false);
        charArea.appendChild(rightHand);
    }

    // ── Handle Zone Tap ──────────────────────────────────────
    function onZoneTap(e) {
        e.stopPropagation();

        const game = window._game;
        if (!game) return;

        const pt = tapPoint(e); // tap coords for feedback fx (captured before any early return)

        // Cooldown check — a faint "resting" pulse so the tap never feels dead.
        const now = Date.now();
        if (now - lastTouchTime < COOLDOWN_MS) { spawnRing(pt.x, pt.y); return; }

        // Pause check
        if (game.sceneActive || game.characterLeft) return;

        const zone = e.currentTarget.getAttribute('data-zone');

        // Intimacy gate for face and hand
        if ((zone === 'face' || zone === 'hand') && (game.affectionLevel || 0) < INTIMATE_GATE) {
            // Show a gentle rejection
            const rejects = [
                "We're not quite there yet...",
                "Maybe when we know each other better.",
                "Not yet... but soon?",
                "I'd like that. ...Someday.",
                "I want to. I'm just not ready to want to. Give me time.",
                "...Ask me again when you've stayed a little longer.",
                "Gently. We're still learning each other.",
                "*Steps back, but not far* ...Soon. I mean it."
            ];
            game.typewriter.show(pick(rejects), () => {});
            spawnRing(pt.x, pt.y);
            lastTouchTime = now;
            return;
        }

        const charKey = getCharKey();
        if (!charKey || !TOUCH_DATA[charKey]) return;

        const zoneData = TOUCH_DATA[charKey][zone];
        if (!zoneData || zoneData.length === 0) return;

        lastTouchTime = now;

        // Tap feedback — floating ♡/✦ + soft pop + tiny haptic (deliberate; cooldown keeps it from ever spamming).
        feedbackAccepted(pt.x, pt.y, zone);

        // Dismiss idle pose if active
        if (window.IdleLife && window.IdleLife.revert) {
            window.IdleLife.revert();
        }

        // Pick a random reaction
        const reaction = pick(zoneData);

        // Set first-touch memory flags
        const memoryKeys = {
            head: 'firstHeadPat',
            face: 'firstFaceTouch',
            hand: 'firstHandHold'
        };
        if (!game.choiceMemory) game.choiceMemory = {};
        if (!game.choiceMemory[memoryKeys[zone]]) {
            game.choiceMemory[memoryKeys[zone]] = true;
        }

        // Flash emotion
        if (reaction.emotion && game.ui && game.ui.setCharacterSprite) {
            game.ui.setCharacterSprite(reaction.emotion);
        }

        // Apply stat effects
        if (reaction.effects) {
            if (reaction.effects.bond) {
                game.bond = clamp((game.bond || 0) + reaction.effects.bond, 0, 100);
            }
            if (reaction.effects.affection) {
                game.affectionLevel = clamp((game.affectionLevel || 0) + reaction.effects.affection, 0, 6);
            }
            if (reaction.effects.corruption) {
                game.corruption = clamp((game.corruption || 0) + reaction.effects.corruption, 0, 100);
            }
        }

        // Show dialogue
        game.typewriter.show(reaction.text, () => {});

        // Save
        game.save();
    }

    // ── Init ──────────────────────────────────────────────────
    function init() {
        createZones();
    }

    // ── Poll for game readiness ───────────────────────────────
    const poll = setInterval(() => {
        if (window._game && window._game.tickInterval) {
            clearInterval(poll);
            init();
        }
    }, 500);

    // Expose for other modules
    window.TouchZones = {
        TOUCH_DATA: TOUCH_DATA
    };
})();
