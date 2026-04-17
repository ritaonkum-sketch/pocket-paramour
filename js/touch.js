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
                { text: "W-what are you\u2014 I'm a knight, not a puppy!", emotion: "shy", effects: { bond: 6, affection: 1 } },
                { text: "...Do that again and I'll... just stand here, apparently.", emotion: "shy", effects: { bond: 7, affection: 1 } },
                { text: "My helmet is right there. You could've patted that instead.", emotion: "cheeky", effects: { bond: 5, affection: 1 } },
                { text: "...Okay. That was nice. Don't tell anyone.", emotion: "gentle", effects: { bond: 8, affection: 2 } }
            ],
            face: [
                { text: "You\u2014 my face is not a\u2014 *turns red*", emotion: "shy", effects: { bond: 9, affection: 2 } },
                { text: "The captain of the guard does NOT get poked on the cheek.", emotion: "annoyed", effects: { bond: 7, affection: 1 } },
                { text: "...Your hands are cold. Here, let me\u2014", emotion: "gentle", effects: { bond: 10, affection: 2 } },
                { text: "Nobody has ever\u2014 just... be careful. Please.", emotion: "vulnerable", effects: { bond: 11, affection: 3 } }
            ],
            hand: [
                { text: "*stiffens, then slowly holds back* ...I've held swords my whole life. This is different.", emotion: "gentle", effects: { bond: 10, affection: 2 } },
                { text: "Your hand is small. I could protect it.", emotion: "love", effects: { bond: 12, affection: 3 } },
                { text: "Don't let go. ...Please.", emotion: "vulnerable", effects: { bond: 11, affection: 3 } },
                { text: "I\u2014 this isn't\u2014 *holds tighter* ...Forget what I was about to say.", emotion: "shy", effects: { bond: 10, affection: 2 } }
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
                { text: "*blinks* You touched my face. No one touches a siren's face.", emotion: "shy", effects: { bond: 9, affection: 2 } },
                { text: "My scales... you can feel them there? Most people flinch.", emotion: "vulnerable", effects: { bond: 10, affection: 2 } },
                { text: "...That spot is sensitive. Be careful.", emotion: "gentle", effects: { bond: 8, affection: 2 } },
                { text: "Your fingertips are so warm against my skin. I\u2014 don't stop.", emotion: "love", effects: { bond: 11, affection: 3 } }
            ],
            hand: [
                { text: "*pulls away, then slowly reaches back* Your hands are warm. Mine aren't. Sorry.", emotion: "sad", effects: { bond: 10, affection: 2 } },
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
                { text: "My monocle. You'll knock my\u2014 ...fine. Just be careful.", emotion: "gentle", effects: { bond: 9, affection: 2 } },
                { text: "...No one has touched my face since I was a child.", emotion: "vulnerable", effects: { bond: 11, affection: 3 } },
                { text: "Your hand on my cheek. That's\u2014 let me just\u2014 *closes eyes*", emotion: "love", effects: { bond: 10, affection: 2 } }
            ],
            hand: [
                { text: "*looks down at your hand in his* This isn't in my research notes.", emotion: "shy", effects: { bond: 10, affection: 2 } },
                { text: "Your pulse rate is elevated. ...So is mine.", emotion: "gentle", effects: { bond: 11, affection: 3 } },
                { text: "I should let go. I'm choosing not to. Interesting.", emotion: "love", effects: { bond: 12, affection: 3 } },
                { text: "Warm. Soft. Illogical. I want more data.", emotion: "curious", effects: { bond: 9, affection: 2 } }
            ]
        },
        caspian: {
            head: [
                { text: "*freezes* A prince isn't... that's not... *melts* ...okay.", emotion: "shy", effects: { bond: 7, affection: 1 } },
                { text: "The crown usually goes there. I think I prefer this.", emotion: "gentle", effects: { bond: 8, affection: 2 } },
                { text: "You're bold. The court would be scandalized.", emotion: "cheeky", effects: { bond: 6, affection: 1 } },
                { text: "...No one has been this gentle with me since my mother.", emotion: "vulnerable", effects: { bond: 9, affection: 2 } }
            ],
            face: [
                { text: "*sharp breath* That's\u2014 you can't just\u2014 *softens* ...again?", emotion: "shy", effects: { bond: 9, affection: 2 } },
                { text: "My face is always being watched. But never touched.", emotion: "sad", effects: { bond: 10, affection: 2 } },
                { text: "The warmth of your hand... I forget what I was saying.", emotion: "love", effects: { bond: 11, affection: 3 } },
                { text: "You touch me like I'm not a prince. Like I'm just... me.", emotion: "gentle", effects: { bond: 10, affection: 2 } }
            ],
            hand: [
                { text: "*takes your hand formally, then intertwines fingers* ...Protocol doesn't cover this.", emotion: "shy", effects: { bond: 10, affection: 2 } },
                { text: "In the palace, we bow. We don't hold hands. I like your way better.", emotion: "happy", effects: { bond: 11, affection: 3 } },
                { text: "Don't let the courtiers see. ...Actually, let them.", emotion: "love", effects: { bond: 12, affection: 3 } },
                { text: "Your hand fits in mine. That's not a metaphor. It just... does.", emotion: "gentle", effects: { bond: 10, affection: 2 } }
            ]
        },
        elian: {
            head: [
                { text: "*goes very still* ...The animals do that too. When they trust.", emotion: "gentle", effects: { bond: 7, affection: 1 } },
                { text: "My hair has leaves in it. You don't mind?", emotion: "shy", effects: { bond: 6, affection: 1 } },
                { text: "...Hm. I understand why the wolves lean into this.", emotion: "happy", effects: { bond: 7, affection: 2 } },
                { text: "That's... grounding. Like roots.", emotion: "gentle", effects: { bond: 8, affection: 1 } }
            ],
            face: [
                { text: "*flinches, then holds steady* ...I'm not used to soft things.", emotion: "vulnerable", effects: { bond: 9, affection: 2 } },
                { text: "Your fingers smell like\u2014 nothing. City hands. I don't mind.", emotion: "gentle", effects: { bond: 8, affection: 2 } },
                { text: "The forest doesn't touch gently. You do.", emotion: "love", effects: { bond: 10, affection: 2 } },
                { text: "I've tracked animals by the warmth of their prints. Yours is... different.", emotion: "curious", effects: { bond: 9, affection: 2 } }
            ],
            hand: [
                { text: "*rough, calloused hand holds yours carefully* I might break you. I'll be careful.", emotion: "gentle", effects: { bond: 10, affection: 2 } },
                { text: "I've held injured birds steadier than this. Sorry. I'm nervous.", emotion: "shy", effects: { bond: 11, affection: 3 } },
                { text: "Warmth. Real warmth. Not fire, not sun. Just... you.", emotion: "love", effects: { bond: 12, affection: 3 } },
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
                { text: "Your hand is organic. Mine is code. We're holding nothing. It means everything.", emotion: "love", effects: { bond: 12, affection: 3 } },
                { text: "I can't feel this. I'm choosing to believe I can.", emotion: "vulnerable", effects: { bond: 11, affection: 3 } },
                { text: "Hand-holding. Duration: ongoing. Status: do not terminate.", emotion: "happy", effects: { bond: 10, affection: 2 } }
            ]
        },
        noir: {
            head: [
                { text: "You dare\u2014 *pauses* ...brave little thing.", emotion: "cheeky", effects: { bond: 6, affection: 1, corruption: 2 } },
                { text: "Most who touch me don't keep their hand. You're special.", emotion: "gentle", effects: { bond: 7, affection: 1, corruption: 2 } },
                { text: "The darkness in my hair could swallow your fingers. But not today.", emotion: "love", effects: { bond: 8, affection: 2, corruption: 2 } },
                { text: "*low laugh* Domesticating the void. How quaint.", emotion: "cheeky", effects: { bond: 5, affection: 1, corruption: 3 } }
            ],
            face: [
                { text: "*catches your wrist* Careful. This face has devoured stronger souls.", emotion: "intense", effects: { bond: 9, affection: 2, corruption: 3 } },
                { text: "You touch me like I'm something worth saving. Dangerous assumption.", emotion: "vulnerable", effects: { bond: 10, affection: 2, corruption: 2 } },
                { text: "...No one has been gentle with me. In centuries.", emotion: "gentle", effects: { bond: 11, affection: 3, corruption: 2 } },
                { text: "Your fingers trace where the seal burns. It hurts less when you touch it.", emotion: "love", effects: { bond: 10, affection: 2, corruption: 3 } }
            ],
            hand: [
                { text: "*cold fingers wrap around yours* My touch corrodes. Still want this?", emotion: "gentle", effects: { bond: 10, affection: 2, corruption: 3 } },
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
        const ch = window.CHARACTER;
        if (!ch) return null;
        return (ch.name || '').toLowerCase();
    }

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
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

        // Cooldown check
        const now = Date.now();
        if (now - lastTouchTime < COOLDOWN_MS) return;

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
                "I'd like that. ...Someday."
            ];
            game.typewriter.show(pick(rejects), () => {});
            lastTouchTime = now;
            return;
        }

        const charKey = getCharKey();
        if (!charKey || !TOUCH_DATA[charKey]) return;

        const zoneData = TOUCH_DATA[charKey][zone];
        if (!zoneData || zoneData.length === 0) return;

        lastTouchTime = now;

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
