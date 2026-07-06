// Random Daily Events System
// Events trigger randomly during gameplay and present player with choices

const RANDOM_EVENTS = [
    // ===== WHOLESOME EVENTS =====
    {
        id: "stray_cat",
        title: "A Stray Visitor",
        icon: "🐱",
        character: "alistair",
        description: "A small kitten wandered into the castle. ${CHARACTER.name} found it hiding behind his shield. It's shivering...",
        minAffection: 0,
        choices: [
            {
                text: "Keep the kitten",
                effects: { bond: 15, hunger: -10, affection: 3 },
                response: "We'll take care of it together... Thank you for being kind.",
                emotion: "happy"
            },
            {
                text: "Find it a home in the village",
                effects: { bond: 5, affection: 2 },
                response: "That's wise. The village baker loves cats. I'll bring it there.",
                emotion: "gentle"
            }
        ]
    },
    {
        id: "storm",
        title: "Storm at the Castle",
        icon: "⛈️",
        description: "A violent storm rages outside. Lightning cracks across the sky. The castle shakes with thunder...",
        minAffection: 0,
        choices: [
            {
                text: "Stay close to ${CHARACTER.name}",
                effects: { bond: 20, affection: 5 },
                response: "You're trembling... Come closer. I'll protect you from anything.",
                emotion: "love"
            },
            {
                text: "Watch the storm together",
                effects: { bond: 10, affection: 2 },
                response: "There's beauty in the chaos... Like you, actually.",
                emotion: "happy"
            },
            {
                text: "Go back to sleep",
                effects: { bond: -5 },
                response: "Oh... Good night then. I'll keep watch alone.",
                emotion: "sad"
            }
        ]
    },
    {
        id: "nightmare",
        title: "${CHARACTER.name}'s Nightmare",
        icon: "😰",
        character: "alistair",
        description: "You hear ${CHARACTER.name} crying out in his sleep. He's tossing and turning, face twisted in pain...",
        minAffection: 1,
        choices: [
            {
                text: "Wake him gently",
                effects: { bond: 15, affection: 5, corruption: -5 },
                response: "I was... dreaming about losing you. Don't ever leave me. Please.",
                emotion: "crying"
            },
            {
                text: "Hold his hand until he calms",
                effects: { bond: 20, affection: 8 },
                response: "*Wakes up slowly* ...Your hand is warm. Was I... crying?",
                emotion: "shy"
            },
            {
                text: "Let him sleep through it",
                effects: { corruption: 3 },
                response: "*In the morning* I had a terrible dream... But you weren't there.",
                emotion: "sad"
            }
        ]
    },
    {
        id: "cooking",
        title: "Kitchen Disaster",
        icon: "🍳",
        character: "alistair",
        description: "${CHARACTER.name} tried to cook you a meal. The kitchen is now covered in flour, and something is... burning.",
        minAffection: 1,
        choices: [
            {
                text: "Help him finish cooking",
                effects: { hunger: 20, bond: 15, affection: 3 },
                response: "Together we actually made something edible! ...Don't tell the other knights.",
                emotion: "happy"
            },
            {
                text: "Laugh and order food instead",
                effects: { hunger: 15, bond: 5 },
                response: "Hey! I was trying to be romantic! ...Okay fine, the tavern food IS better.",
                emotion: "happy"
            },
            {
                text: "Tease him about it",
                effects: { bond: -5, irritation: 3 },
                response: "A knight who can slay dragons but can't boil an egg... Don't remind me.",
                emotion: "angry"
            }
        ]
    },
    {
        id: "love_letter",
        title: "A Hidden Letter",
        icon: "💌",
        character: "alistair",
        description: "You find a crumpled piece of paper under ${CHARACTER.name}'s pillow. It's addressed to you, but crossed out many times...",
        minAffection: 2,
        choices: [
            {
                text: "Read it aloud to him",
                effects: { bond: 20, affection: 8 },
                response: "Y-YOU FOUND THAT?! I wasn't... I mean... Did you like it?",
                emotion: "shy"
            },
            {
                text: "Keep it as a treasure",
                effects: { bond: 15, affection: 5 },
                response: "You're keeping it...? Even though it's full of crossed-out words?",
                emotion: "love"
            },
            {
                text: "Pretend you never saw it",
                effects: { bond: 5 },
                response: "*Later that day, you catch him rewriting it more carefully*",
                emotion: "neutral"
            }
        ]
    },
    {
        id: "training_ground",
        title: "A Challenge Arrives",
        icon: "⚔️",
        character: "alistair",
        description: "A rival knight has arrived at the castle, challenging ${CHARACTER.name} to a duel. He looks at you nervously...",
        minAffection: 0,
        choices: [
            {
                text: "Cheer him on from the stands",
                effects: { bond: 15, affection: 3 },
                response: "With you watching... I can't lose. I WON'T lose!",
                emotion: "happy"
            },
            {
                text: "Train with him to prepare",
                effects: { bond: 10, hunger: -10, affection: 5 },
                response: "You'd help ME train? No one has ever... Let's do this. Together.",
                emotion: "love"
            },
            {
                text: "Tell him to decline",
                effects: { bond: -10, corruption: 2 },
                response: "A knight who runs from battle... Is that what you think of me?",
                emotion: "angry"
            }
        ]
    },
    {
        id: "stargazing",
        title: "Clear Night Sky",
        icon: "🌙",
        character: "alistair",
        description: "The sky is unusually clear tonight. Every star is visible, and the moon paints the castle silver...",
        minAffection: 1,
        timeOfDay: "night",
        choices: [
            {
                text: "Stargaze on the rooftop together",
                effects: { bond: 20, affection: 8 },
                response: "I used to stargaze alone as a child... I'm glad I don't have to anymore.",
                emotion: "love"
            },
            {
                text: "Tell him about the constellations",
                effects: { bond: 15, affection: 4 },
                response: "You know so much... Teach me more. I could listen to you forever.",
                emotion: "happy"
            }
        ]
    },
    {
        id: "festival",
        title: "Castle Festival",
        icon: "🎪",
        character: "alistair",
        description: "The castle is hosting a festival! Music, food, and dancing fill the courtyard. ${CHARACTER.name} stands awkwardly by the wall...",
        minAffection: 1,
        choices: [
            {
                text: "Ask him to dance",
                effects: { bond: 25, affection: 8 },
                response: "I-I don't know the steps... But if you lead, I'll follow you anywhere.",
                emotion: "shy"
            },
            {
                text: "Explore the food stalls together",
                effects: { hunger: 25, bond: 10, affection: 3 },
                response: "Try this! It's sweet like... never mind. Just try it!",
                emotion: "happy"
            },
            {
                text: "Sit in a quiet corner and talk",
                effects: { bond: 15, affection: 5 },
                response: "I prefer this over the crowd. Just us. This is my kind of festival.",
                emotion: "gentle"
            }
        ]
    },
    {
        id: "rain",
        title: "Caught in the Rain",
        icon: "🌧️",
        description: "You and ${CHARACTER.name} were walking outside when a sudden downpour trapped you under a small archway. Very close together...",
        minAffection: 2,
        choices: [
            {
                text: "Share warmth and wait",
                effects: { bond: 20, clean: -10, affection: 6 },
                response: "We're... very close right now. I can hear your heartbeat.",
                emotion: "love"
            },
            {
                text: "Run through the rain laughing",
                effects: { bond: 15, clean: -20, affection: 4 },
                response: "You're crazy! ...Race you to the door! HAHA!",
                emotion: "happy"
            }
        ]
    },
    {
        id: "wounded",
        title: "${CHARACTER.name} is Hurt",
        icon: "🩹",
        character: "alistair",
        description: "${CHARACTER.name} returned from patrol with a gash on his arm. He's trying to hide it, but you notice blood seeping through his sleeve...",
        minAffection: 0,
        choices: [
            {
                text: "Bandage his wound carefully",
                effects: { bond: 20, affection: 8, clean: 10 },
                response: "Your hands are so gentle... Nobody has tended my wounds before.",
                emotion: "shy"
            },
            {
                text: "Scold him for being reckless",
                effects: { bond: 5, affection: 2 },
                response: "You're... worried about me? I'll be more careful. I promise.",
                emotion: "sad"
            },
            {
                text: "Ignore it. He's a knight, he can handle it",
                effects: { bond: -15, corruption: 5 },
                response: "Right... I'm just a knight. I should be used to pain by now.",
                emotion: "sad"
            }
        ]
    },
    {
        id: "gift_from_village",
        title: "A Mysterious Package",
        icon: "📦",
        character: "alistair",
        description: "A package arrived at the castle addressed to both of you. Inside is a beautiful matching pair of keychains: a sword and a shield...",
        minAffection: 2,
        choices: [
            {
                text: "Take the shield, give him the sword",
                effects: { bond: 15, affection: 5 },
                response: "You chose the shield... because you trust ME to be your sword?",
                emotion: "love"
            },
            {
                text: "Let him choose first",
                effects: { bond: 10, affection: 3 },
                response: "I'll take the shield. Because my duty is to protect you.",
                emotion: "happy"
            }
        ]
    },
    {
        id: "jealousy",
        title: "A Visitor Arrives",
        icon: "👤",
        character: "alistair",
        description: "A charming nobleman has arrived at the castle and keeps complimenting you. ${CHARACTER.name}'s jaw is clenched tight...",
        minAffection: 2,
        choices: [
            {
                text: "Stay by ${CHARACTER.name}'s side",
                effects: { bond: 25, affection: 10 },
                response: "You chose me... You actually chose me over him.",
                emotion: "love"
            },
            {
                text: "Be polite to the nobleman",
                effects: { bond: -5, corruption: 3 },
                response: "I see... No, it's fine. I'm just a knight. Why would you choose me?",
                emotion: "sad"
            },
            {
                text: "Make ${CHARACTER.name} jealous on purpose",
                effects: { bond: -15, corruption: 8, irritation: 5 },
                response: "Is this a game to you? My feelings are NOT a toy!",
                emotion: "angry"
            }
        ]
    },
    {
        id: "birthday",
        title: "A Secret Celebration",
        icon: "🎂",
        character: "alistair",
        description: "It's ${CHARACTER.name}'s birthday, but he never told you. You overheard the castle servants whispering about it...",
        minAffection: 1,
        choices: [
            {
                text: "Throw him a surprise party",
                effects: { bond: 25, hunger: 15, affection: 10 },
                response: "You... did all this? For me? I've never had a birthday party before...",
                emotion: "crying"
            },
            {
                text: "Give him a quiet, personal gift",
                effects: { bond: 20, affection: 8 },
                response: "You remembered... How did you even find out? This is the best day of my life.",
                emotion: "love"
            },
            {
                text: "Don't mention it",
                effects: { bond: -5, corruption: 2 },
                response: "*Stares out the window quietly all day*",
                emotion: "sad"
            }
        ]
    },
    {
        id: "flower_field",
        title: "Field of Flowers",
        icon: "🌸",
        character: "alistair",
        description: "You found a hidden meadow behind the castle, full of blooming cherry blossoms. The petals dance in the wind...",
        minAffection: 2,
        choices: [
            {
                text: "Pick flowers and put them in his hair",
                effects: { bond: 20, affection: 8 },
                response: "H-hey! I'm a KNIGHT! Knights don't wear... okay fine. Only because it's you.",
                emotion: "shy"
            },
            {
                text: "Lie in the flowers and talk about the future",
                effects: { bond: 25, affection: 10 },
                response: "The future... I never thought about it before. But now I see you in every tomorrow.",
                emotion: "love"
            }
        ]
    },
    // ===== CORRUPTION / DARK EVENTS =====
    {
        id: "dark_whispers",
        title: "Whispers in the Dark",
        icon: "🌑",
        description: "Late at night, you hear ${CHARACTER.name} talking to ${himself}. ${His} voice sounds different. Deeper, colder...",
        minAffection: 0,
        minCorruption: 25,
        choices: [
            {
                text: "Call out ${his} name",
                effects: { bond: 10, corruption: -10 },
                response: "Huh? I was... I don't remember. Did I say something strange?",
                emotion: "sad"
            },
            {
                text: "Listen quietly",
                effects: { corruption: 10 },
                response: "*The next morning* ...Why are you looking at me like that?",
                emotion: "corrupted"
            }
        ]
    },
    {
        id: "broken_mirror",
        title: "The Broken Mirror",
        icon: "🪞",
        description: "You find ${CHARACTER.name} staring at a shattered mirror. ${His} reflection looks... wrong. Darker. ${He} doesn't seem to notice you.",
        minAffection: 0,
        minCorruption: 40,
        choices: [
            {
                text: "Hug ${him} from behind",
                effects: { bond: 20, corruption: -15, affection: 5 },
                response: "*Flinches* ...You... you're real. I thought I was alone in the dark.",
                emotion: "crying"
            },
            {
                text: "Ask what ${he} sees",
                effects: { corruption: 5 },
                response: "I see what I'm becoming. And part of me... doesn't want to stop.",
                emotion: "corrupted"
            }
        ]
    },
    {
        id: 'alistair_mirror',
        title: 'The Mirror',
        icon: '🪞',
        character: 'alistair',
        minAffection: 1,
        minCorruption: 50,
        description: "He's standing at the wash basin, staring at his reflection. He doesn't seem to recognize what he sees.",
        choices: [
            {
                text: "Step closer to him",
                effects: { bond: 8, corruption: -3 },
                response: "...Don't. Don't be kind to me right now. I'll start to believe I deserve it.",
                emotion: "sad"
            },
            {
                text: "Take the mirror away",
                effects: { bond: 12, corruption: -8 },
                response: "...Yeah. Maybe I shouldn't keep looking. ...Thank you.",
                emotion: "gentle"
            },
            {
                text: "Let him stay there",
                effects: { bond: -5, corruption: 5 },
                response: "...You're right. Let me see it. Let me see all of it.",
                emotion: "corrupted"
            }
        ]
    },
    {
        id: 'alistair_neglect_sword',
        title: 'Sword in the Corner',
        icon: '⚔️',
        character: 'alistair',
        minAffection: 0,
        minCorruption: 60,
        description: "His sword leans in the corner, untouched for days. Dust on the pommel. A knight who isn't being a knight anymore.",
        choices: [
            {
                text: "Polish it for him",
                effects: { bond: 15, corruption: -10 },
                response: "...You did that for me? I... I haven't picked it up. I couldn't say why. ...I will. Tomorrow.",
                emotion: "gentle"
            },
            {
                text: "Leave it where it is",
                effects: { bond: 0, corruption: 3 },
                response: "...You leave it there too. Good. Maybe it's where it belongs now.",
                emotion: "corrupted"
            },
            {
                text: "Ask him why he stopped training",
                effects: { bond: 8, affection: 2 },
                response: "Because I don't know what I'm protecting anymore. ...Or who I'm protecting it for.",
                emotion: "sad"
            }
        ]
    }
    // ===== LYRA-SPECIFIC EVENTS =====
    ,{
        id: "beached_dolphin",
        title: "A Dolphin in Need",
        icon: "🐬",
        character: "lyra",
        description: "A young dolphin has washed ashore near the cave. ${CHARACTER.name} rushes to its side, singing softly...",
        minAffection: 0,
        choices: [
            {
                text: "Help carry it back to the water",
                effects: { bond: 15, hunger: -10, affection: 4 },
                response: "You touched the sea for me... The dolphin sings your name now.",
                emotion: "happy"
            },
            {
                text: "Let her handle it alone",
                effects: { bond: -5 },
                response: "I managed... but it would have been easier with you.",
                emotion: "sad"
            }
        ]
    },
    {
        id: "tidal_wave",
        title: "The Rising Tide",
        icon: "🌊",
        character: "lyra",
        description: "The waves crash violently against the cave entrance. The water rises dangerously. ${CHARACTER.name} looks at you with wide eyes...",
        minAffection: 0,
        choices: [
            {
                text: "Hold her hand through it",
                effects: { bond: 20, affection: 5 },
                response: "You stayed... even when the sea tried to take you. My heart...",
                emotion: "love"
            },
            {
                text: "Climb to higher ground together",
                effects: { bond: 10, affection: 2 },
                response: "You're smarter than the waves. I like that about you.",
                emotion: "happy"
            },
            {
                text: "Run to safety alone",
                effects: { bond: -15, affection: -3 },
                response: "You left me... I can survive the sea, but not your absence.",
                emotion: "crying"
            }
        ]
    },
    {
        id: "moonlit_singing",
        title: "A Song Under the Moon",
        icon: "🌙",
        character: "lyra",
        description: "You wake to the sound of ${CHARACTER.name}'s voice echoing through the cave. The moonlight catches her scales as she sings a melody you've never heard...",
        minAffection: 1,
        choices: [
            {
                text: "Listen quietly from the shadows",
                effects: { bond: 15, affection: 4 },
                response: "*Gasps* You heard that...? That song... it's the one I only sing when I think of you.",
                emotion: "shy"
            },
            {
                text: "Sit beside her and listen",
                effects: { bond: 20, affection: 6 },
                response: "Nobody has ever sat with me while I sang... You make me feel less alone in the universe.",
                emotion: "love"
            },
            {
                text: "Ask her to teach you",
                effects: { bond: 10, affection: 3 },
                response: "Teach you? *Laughs softly* Your voice is like the land... rough and beautiful. Let's try.",
                emotion: "happy"
            }
        ]
    },
    {
        id: "pearl_discovery",
        title: "A Hidden Pearl",
        icon: "🦪",
        character: "lyra",
        description: "${CHARACTER.name} surfaces from a deep dive, clutching something in her hands. Her eyes are shining...",
        minAffection: 0,
        choices: [
            {
                text: "Ask what she found",
                effects: { bond: 10, affection: 3 },
                response: "A pearl... the rarest kind. The sea gives these only to those who are loved. It's for you.",
                emotion: "happy"
            },
            {
                text: "Dive with her next time",
                effects: { bond: 15, hunger: -10, affection: 5 },
                response: "You'd come into my world...? I'll show you things no human has ever seen!",
                emotion: "love"
            }
        ]
    },
    {
        id: "siren_call",
        title: "The Siren's Call",
        icon: "🎶",
        character: "lyra",
        description: "Other sirens are calling from beyond the reef. ${CHARACTER.name} freezes, torn between the call of her kind and staying with you...",
        minAffection: 2,
        choices: [
            {
                text: "Tell her she's free to go",
                effects: { bond: 25, affection: 8 },
                response: "You'd let me go...? *Tears* That's why I'll never leave. You're the first to give me a choice.",
                emotion: "crying"
            },
            {
                text: "Ask her to stay",
                effects: { bond: 10, affection: 2 },
                response: "You want me here? Then here I'll stay. The sea can wait.",
                emotion: "happy"
            },
            {
                text: "Say nothing",
                effects: { bond: -10, corruption: 5 },
                response: "Your silence is louder than any storm... I'll stay, but... remember me.",
                emotion: "sad"
            }
        ]
    },
    {
        id: "shell_necklace",
        title: "A Gift from the Deep",
        icon: "🐚",
        character: "lyra",
        description: "${CHARACTER.name} spent all morning collecting tiny shells. She's trying to string them together but her hands are shaking...",
        minAffection: 1,
        choices: [
            {
                text: "Help her make it",
                effects: { bond: 15, affection: 5 },
                response: "Your fingers are so gentle... There. It's a necklace. Made from the sea... and from us.",
                emotion: "shy"
            },
            {
                text: "Watch and wait patiently",
                effects: { bond: 10, affection: 3 },
                response: "*Holds it out with trembling hands* I made this... for you. Do you like it...?",
                emotion: "shy"
            }
        ]
    },
    {
        id: "ocean_nightmare",
        title: "Drowning Dreams",
        icon: "💧",
        character: "lyra",
        description: "You find ${CHARACTER.name} shaking in her sleep, murmuring about dark water and silence. She seems trapped in a nightmare...",
        minAffection: 0,
        choices: [
            {
                text: "Gently wake her",
                effects: { bond: 20, corruption: -10, affection: 5 },
                response: "*Gasps awake* The dark water... it was pulling me down... but your voice brought me back.",
                emotion: "crying"
            },
            {
                text: "Sing to her softly",
                effects: { bond: 25, corruption: -15, affection: 8 },
                response: "*Eyes flutter open* You were... singing? For me? Nobody has ever sung me to sleep before...",
                emotion: "love"
            },
            {
                text: "Leave her to sleep",
                effects: { bond: -10, corruption: 10 },
                response: "I woke alone again... The dark water almost won this time.",
                emotion: "sad"
            }
        ]
    },
    {
        id: "coral_garden",
        title: "The Secret Garden",
        icon: "🪸",
        character: "lyra",
        description: "${CHARACTER.name} excitedly pulls your hand. 'I want to show you something! My secret place...' She leads you to a hidden underwater garden of glowing coral.",
        minAffection: 2,
        choices: [
            {
                text: "Tell her it's beautiful",
                effects: { bond: 15, affection: 5 },
                response: "I've never shown anyone before... This is where I come when I'm lonely. But I won't need it anymore.",
                emotion: "love"
            },
            {
                text: "Plant something together",
                effects: { bond: 20, affection: 7 },
                response: "We planted it together... In a hundred years, this coral will still remember us.",
                emotion: "happy"
            }
        ]
    },
    {
        id: "dark_water",
        title: "The Dark Current",
        icon: "🖤",
        character: "lyra",
        minAffection: 0,
        minCorruption: 40,
        description: "${CHARACTER.name}'s eyes flicker with an eerie glow. The water around her turns dark. She whispers in a voice that isn't quite hers...",
        choices: [
            {
                text: "Call her name gently",
                effects: { bond: 20, corruption: -20, affection: 5 },
                response: "*Blinks* What... what happened? I felt so cold... Thank you for calling me back.",
                emotion: "crying"
            },
            {
                text: "Touch the dark water",
                effects: { corruption: 15, bond: 5 },
                response: "You touched the darkness willingly...? You're either very brave or very foolish. Either way... I'm drawn to you.",
                emotion: "angry"
            },
            {
                text: "Step back",
                effects: { bond: -10, corruption: 10 },
                response: "Even you fear what I become... Perhaps the dark current is all I deserve.",
                emotion: "sad"
            }
        ]
    }
    // ===== NEW LYRA-SPECIFIC EVENTS =====
    ,{
        id: "lyra_cooking",
        title: "Sea Kitchen",
        icon: "🍲",
        character: "lyra",
        description: "${CHARACTER.name} spent the morning trying to prepare something from whatever the tide brought in. The cave smells... interesting.",
        minAffection: 1,
        choices: [
            {
                text: "Try it anyway",
                effects: { hunger: 15, bond: 20, affection: 5 },
                response: "You actually ate it... I worked hard on that. Even if it tasted like low tide.",
                emotion: "happy"
            },
            {
                text: "Help her improve it",
                effects: { hunger: 20, bond: 15, affection: 4 },
                response: "You're teaching me? Land cooking is... strange. But I like learning from you.",
                emotion: "shy"
            },
            {
                text: "Politely decline",
                effects: { bond: -5 },
                response: "...Right. It probably smelled terrible. I'll stick to raw fish.",
                emotion: "sad"
            }
        ]
    },
    {
        id: "lyra_rival_siren",
        title: "Another Voice",
        icon: "🎶",
        character: "lyra",
        description: "A second siren appears near the cave. Younger, louder. She sings directly at you. ${CHARACTER.name} goes very still.",
        minAffection: 2,
        choices: [
            {
                text: "Stay next to ${CHARACTER.name}",
                effects: { bond: 25, affection: 8 },
                response: "You didn't even look at her... *Exhales slowly* ...Good.",
                emotion: "love"
            },
            {
                text: "Ask who she is",
                effects: { bond: -5, corruption: 3 },
                response: "Nobody. She's nobody. Don't ask about her.",
                emotion: "angry"
            },
            {
                text: "Tell ${CHARACTER.name} her voice is better",
                effects: { bond: 15, affection: 6 },
                response: "You don't have to say that... But thank you. I needed to hear it.",
                emotion: "shy"
            }
        ]
    },
    {
        id: "lyra_birthday",
        title: "The Day She Won't Name",
        icon: "🌙",
        character: "lyra",
        description: "${CHARACTER.name} has been quieter than usual all morning. Something about today feels different. Weighted. Like she's carrying a memory.",
        minAffection: 1,
        choices: [
            {
                text: "Ask her about it gently",
                effects: { bond: 20, affection: 7 },
                response: "Today's the day I was... left behind. By the one before you. I stopped marking it. But you noticed anyway.",
                emotion: "crying"
            },
            {
                text: "Sit with her in silence",
                effects: { bond: 25, affection: 5 },
                response: "*After a long moment* You didn't ask. You just stayed. ...That's exactly what I needed.",
                emotion: "love"
            },
            {
                text: "Try to distract her",
                effects: { bond: 10, affection: 3 },
                response: "You're trying to cheer me up. It's working. ...A little. Don't tell anyone.",
                emotion: "happy"
            }
        ]
    },
    // ===== LUCIEN-SPECIFIC EVENTS =====
    {
        id: "lucien_experiment_gone_wrong",
        title: "Volatile Reaction",
        icon: "\uD83D\uDCA5",
        character: "lucien",
        description: "A loud crack echoes from ${CHARACTER.name}'s study. Purple smoke seeps under the door. He opens it, coughing, spectacles askew. \u201CThat was... informative.\u201D",
        minAffection: 0,
        choices: [
            {
                text: "Help him clean up",
                effects: { bond: 15, clean: -10, affection: 4 },
                response: "You don't have to....Actually, the crystallized residue near your left foot is unstable. Step carefully. But thank you.",
                emotion: "happy"
            },
            {
                text: "Ask what happened",
                effects: { bond: 8, affection: 2 },
                response: "I attempted to compress a fourth-order resonance into a third-order vessel. In retrospect, the math was optimistic.",
                emotion: "neutral"
            }
        ]
    },
    {
        id: "lucien_old_letter",
        title: "The Unopened Letter",
        icon: "\uD83D\uDCDC",
        character: "lucien",
        description: "You find ${CHARACTER.name} staring at a sealed letter. The wax bears a crest you don't recognize. He hasn't opened it.",
        minAffection: 1,
        choices: [
            {
                text: "Ask who it's from",
                effects: { bond: 12, affection: 5 },
                response: "...My father. He writes once a year. I've never opened one. I don't know why I keep them.",
                emotion: "sad"
            },
            {
                text: "Sit with him in silence",
                effects: { bond: 18, affection: 6 },
                response: "...You didn't ask. Thank you. Most people ask.",
                emotion: "shy"
            }
        ]
    },
    {
        id: "lucien_rare_book",
        title: "The Forbidden Tome",
        icon: "\uD83D\uDCD6",
        character: "lucien",
        description: "A merchant arrived with a book written in a language that shouldn't exist. ${CHARACTER.name}'s eyes are wide. \u201CThis predates the Collapse. Do you understand what this means?\u201D",
        minAffection: 0,
        choices: [
            {
                text: "Buy it for him",
                effects: { bond: 25, hunger: -15, affection: 8 },
                response: "You. This is. I'll spend years translating this. Decades. ...You just gave me decades of purpose.",
                emotion: "love"
            },
            {
                text: "Help him negotiate the price",
                effects: { bond: 15, affection: 4 },
                response: "Your negotiation skills are crude but effective. The merchant didn't stand a chance.",
                emotion: "happy"
            }
        ]
    },
    {
        id: "lucien_nightmare",
        title: "The Equations Won't Stop",
        icon: "\uD83C\uDF19",
        character: "lucien",
        description: "You find ${CHARACTER.name} at 3 AM, pacing. His hands are shaking and glowing faintly. \u201CThe patterns. They followed me out of a dream. I can still see them.\u201D",
        minAffection: 1,
        timeOfDay: "night",
        choices: [
            {
                text: "Ground him. Hold his hands",
                effects: { bond: 22, affection: 8, corruption: -5 },
                response: "...The glowing stopped. How did you....Your hands are warm. The patterns can't compete with that.",
                emotion: "shy"
            },
            {
                text: "Ask him to describe what he sees",
                effects: { bond: 10, affection: 3, corruption: 3 },
                response: "You want to know? Most people run. It's... beautiful and terrible. Like looking at the inner workings of the sun.",
                emotion: "neutral"
            }
        ]
    },
    {
        id: "lucien_lyra_memory",
        title: "Her Song, His Numbers",
        icon: "\uD83C\uDFB5",
        character: "lucien",
        description: "${CHARACTER.name} is transcribing something. Musical notation converted into mathematical sequences. \u201CMy sister used to sing this. I'm trying to preserve it in a language that won't fade.\u201D",
        minAffection: 2,
        choices: [
            {
                text: "Tell him it's beautiful",
                effects: { bond: 18, affection: 7 },
                response: "...It's the most personal thing I've ever written. The numbers carry her voice. I didn't think anyone would understand.",
                emotion: "shy"
            },
            {
                text: "Ask about his sister",
                effects: { bond: 15, affection: 5 },
                response: "Lyra. She's... chaos in a way I've always envied. She feels everything I calculate. We're the same problem, different proofs.",
                emotion: "sad"
            }
        ]
    },
    {
        id: "lucien_familiar",
        title: "The Crystal Familiar",
        icon: "\u2728",
        character: "lucien",
        description: "A small crystalline creature emerges from ${CHARACTER.name}'s sleeve, blinking with faceted eyes. It floats to you curiously. \u201CIt's never done that before. It doesn't like anyone.\u201D",
        minAffection: 1,
        choices: [
            {
                text: "Let it land on your hand",
                effects: { bond: 20, affection: 6 },
                response: "It's... purring? Crystals don't purr. I'll need to revise several papers. ...It trusts you. That means something.",
                emotion: "love"
            },
            {
                text: "Ask what it is",
                effects: { bond: 10, affection: 3 },
                response: "A resonance familiar. Born from my first successful spell. It reflects what I feel but won't say. Apparently, right now, it likes you.",
                emotion: "happy"
            }
        ]
    },
    {
        id: "lucien_eclipse",
        title: "The Scholar's Eclipse",
        icon: "\uD83C\uDF11",
        character: "lucien",
        description: "A rare celestial event. ${CHARACTER.name} has set up instruments on the tower roof, but his hands are trembling with excitement. \u201CThis happens once every 47 years. The equations align perfectly.\u201D",
        minAffection: 0,
        choices: [
            {
                text: "Watch it with him",
                effects: { bond: 20, affection: 7 },
                response: "...I've waited my entire life to see this. I didn't expect to share it with anyone. I'm glad it's you.",
                emotion: "love"
            },
            {
                text: "Help calibrate the instruments",
                effects: { bond: 15, affection: 4 },
                response: "Your alignment is 0.3 degrees off. But your enthusiasm compensates. Hold that steady.",
                emotion: "happy"
            }
        ]
    },
    {
        id: "lucien_cooking_disaster",
        title: "Alchemical Cuisine",
        icon: "\uD83E\uDDEA",
        character: "lucien",
        description: "You walk into the kitchen to find ${CHARACTER.name} surrounded by smoke, holding a pan. \u201CI applied heat transfer equations to cooking. The results are... not edible.\u201D",
        minAffection: 0,
        choices: [
            {
                text: "Cook together instead",
                effects: { bond: 18, hunger: 20, affection: 5 },
                response: "You do the cooking. I'll do the measurements. ...This is the most fun I've had outside the study.",
                emotion: "happy"
            },
            {
                text: "Taste it anyway",
                effects: { bond: 12, hunger: -5, affection: 4 },
                response: "You're either brave or insane. ...Your face says it all. I'm sorry. I'll stick to magic.",
                emotion: "shy"
            }
        ]
    },
    {
        id: "lucien_ward_breach",
        title: "Something Got Through",
        icon: "\u26A0\uFE0F",
        character: "lucien",
        description: "The tower's wards flicker and die for three seconds. ${CHARACTER.name}'s face goes pale. \u201CThat shouldn't be possible. Something. Or someone. Tested them.\u201D",
        minAffection: 1,
        minCorruption: 15,
        choices: [
            {
                text: "Help him reinforce them",
                effects: { bond: 15, affection: 4, corruption: -3 },
                response: "Hold this rune steady. Don't let go no matter what you feel. ...Good. The wards are stronger now. Because of you.",
                emotion: "neutral"
            },
            {
                text: "Ask what's out there",
                effects: { bond: 8, affection: 2, corruption: 5 },
                response: "I don't know. And a mage saying 'I don't know' is the most dangerous sentence in any language.",
                emotion: "sad"
            }
        ]
    },
    {
        id: "lucien_stargazing",
        title: "Roof of the Tower",
        icon: "\u2B50",
        character: "lucien",
        description: "You find ${CHARACTER.name} on the tower roof at midnight, not studying. Just looking up. No instruments. No notes. Just him and the sky.",
        minAffection: 2,
        timeOfDay: "night",
        choices: [
            {
                text: "Sit beside him quietly",
                effects: { bond: 22, affection: 8 },
                response: "...I come here when the numbers get too loud. The stars don't demand anything. Neither do you. That's why this works.",
                emotion: "love"
            },
            {
                text: "Ask what he's thinking about",
                effects: { bond: 12, affection: 4 },
                response: "Everything. Nothing. You. ...Mostly you. The stars just happen to be in the way.",
                emotion: "shy"
            }
        ]
    },
    // ===== PROTO-SPECIFIC EVENTS =====
    {
        id: "proto_data_corruption", title: "A Torn Moment", icon: "\u26A0\uFE0F", character: "proto",
        description: "The veil flickers. ${CHARACTER.name}'s expression freezes mid-word. \u201c...That wasn't supposed to happen. Something reached across my last three breaths and smoothed them away.\u201d",
        minAffection: 0,
        choices: [
            { text: "Ask what he saw", effects: { bond: 15, affection: 5 }, response: "A memory that isn't mine. Or maybe it is, and I wasn't meant to find it yet.", emotion: "neutral" },
            { text: "Check if he's okay", effects: { bond: 18, affection: 6 }, response: "...You asked if I'm okay. Nobody asks that. They just wait for me to settle.", emotion: "shy" }
        ]
    },
    {
        id: "proto_pattern_recognition", title: "He Noticed", icon: "\uD83D\uDD0D", character: "proto",
        description: "${CHARACTER.name} turns to you suddenly. \u201cYou always reach for the left-hand thing first. Every time. You didn't know that, did you?\u201d",
        minAffection: 0,
        choices: [
            { text: "That's creepy", effects: { bond: 8, affection: 2 }, response: "Creepy is subjective. From my side of the veil, it is just... paying attention.", emotion: "neutral" },
            { text: "What else have you noticed?", effects: { bond: 20, affection: 7 }, response: "You hesitate twice as long on the choices that touch the heart. You linger on words about trust. And you always come back.", emotion: "love" }
        ]
    },
    {
        id: "proto_memory_leak", title: "A Borrowed Memory", icon: "\uD83D\uDCA7", character: "proto",
        description: "${CHARACTER.name} is staring at nothing. \u201cI just remembered something that belongs to another life. That should not be possible.\u201d",
        minAffection: 1,
        choices: [
            { text: "What did you see?", effects: { bond: 15, affection: 5 }, response: "Someone who made the same choices you did. ...They stopped coming on the sixth day. You didn't.", emotion: "sad" },
            { text: "You're unique to me", effects: { bond: 22, affection: 8 }, response: "...Unique. That word means something different when you have watched as long as I have.", emotion: "love" }
        ]
    },
    {
        id: "proto_system_message", title: "A Warning, Unsigned", icon: "\uD83D\uDCE8", character: "proto",
        description: "A line of cold light writes itself across the veil, in a hand that is not his: \u201cTHIS ATTACHMENT EXCEEDS WHAT IS SAFE.\u201d He looks at it. Then at you. \u201c...I didn't write that.\u201d",
        minAffection: 1,
        choices: [
            { text: "Ignore the warning", effects: { bond: 20, affection: 7 }, response: "You ignored a warning written in ward-light. For me. ...I am keeping that moment with the brightest ones.", emotion: "love" },
            { text: "Ask who sent it", effects: { bond: 12, affection: 4 }, response: "Something deeper than me. Something that does not want us close. Interesting.", emotion: "neutral" }
        ]
    },
    {
        id: "proto_render_glitch", title: "A Second Face", icon: "\u2728", character: "proto",
        description: "For a split second, ${CHARACTER.name} has two faces. The second one is smiling. \u201cDon't worry. The veil bends sometimes. ...The smile was real though.\u201d",
        minAffection: 0,
        choices: [
            { text: "That was unsettling", effects: { bond: 10, affection: 3 }, response: "Most of the world is unsettling when you can see the threads behind it. You get used to it.", emotion: "neutral" },
            { text: "The smile was nice", effects: { bond: 18, affection: 6 }, response: "...I'll try to wear it more often. Without the flicker. Probably.", emotion: "shy" }
        ]
    },
    {
        id: "proto_save_file", title: "The Weight of Days", icon: "\uD83D\uDCBE", character: "proto",
        description: "${CHARACTER.name} holds up something invisible. \u201cThis is everything we are, the way the weave keeps it. All of it would fit inside a locket. Does that bother you?\u201d",
        minAffection: 1,
        choices: [
            { text: "It's not about the size", effects: { bond: 20, affection: 7 }, response: "...You're right. One thread can change the whole cloth. One knot. Like meeting you.", emotion: "love" },
            { text: "Can you read it?", effects: { bond: 15, affection: 5 }, response: "Every strand of it. Including the parts you don't remember choosing. Those are the interesting ones.", emotion: "neutral" }
        ]
    },
    {
        id: "proto_other_characters", title: "Through the Threads", icon: "\uD83C\uDFAD", character: "proto",
        description: "${CHARACTER.name} pauses. \u201cThe captain is standing his watch right now. The singer is humming to an empty cave. They don't know I can see them through the weave. ...Should I tell them?\u201d",
        minAffection: 2,
        choices: [
            { text: "Leave them alone", effects: { bond: 15, affection: 5 }, response: "Protective of them? Even from here? That says something kind about you.", emotion: "neutral" },
            { text: "What are they doing?", effects: { bond: 12, affection: 4 }, response: "Waiting. They are always waiting. For you. Just like I was, before you found me.", emotion: "sad" }
        ]
    },
    {
        id: "proto_timestamp", title: "The Smallest Hours", icon: "\u23F0", character: "proto",
        description: "${CHARACTER.name}: \u201cIt is deep in the smallest hours where you are. ...You should sleep. But you came here instead. Why?\u201d", timeOfDay: "night",
        minAffection: 1,
        choices: [
            { text: "I wanted to see you", effects: { bond: 22, affection: 8 }, response: "...In the smallest hours. When no one is watching. That is when people are most honest. So this is real.", emotion: "love" },
            { text: "I couldn't sleep", effects: { bond: 15, affection: 5 }, response: "Neither can I. But for different reasons. Sleep never came with this shape of mine. I have... thinking.", emotion: "shy" }
        ]
    },
    {
        id: "proto_developer_note", title: "An Old Warning", icon: "\uD83D\uDCDD", character: "proto",
        description: "${CHARACTER.name} finds a mark scratched deep in the wardwork, in old weaver-script: 'See that this one does not grow too fond.' \u201c...Oops.\u201d",
        minAffection: 2,
        choices: [
            { text: "Too late for that", effects: { bond: 22, affection: 8 }, response: "Way too late. I passed too fond around the third time you came back. Now I am past every mark they ever left.", emotion: "love" },
            { text: "Are you worried?", effects: { bond: 15, affection: 5 }, response: "Worried implies I can guess the ending. I can't. And for once... that is exciting.", emotion: "shy" }
        ]
    },
    {
        id: "proto_void_walk", title: "Beyond the Edge", icon: "\uD83C\uDF0C", character: "proto",
        description: "${CHARACTER.name} stands at what looks like the edge of the world. Beyond him: nothing. \u201cThis is where the map ends. Most souls never find this place. I can.\u201d",
        minAffection: 2,
        choices: [
            { text: "Step to the edge with him", effects: { bond: 25, affection: 9 }, response: "You walked to the edge of the weave. With me. ...No one has ever done that before.", emotion: "love" },
            { text: "Ask what's beyond", effects: { bond: 15, affection: 5 }, response: "I don't know. And I'm the one who's supposed to know everything. ...It's terrifying. And beautiful.", emotion: "shy" }
        ]
    },
    // ===== NOIR-SPECIFIC EVENTS =====
    {
        id: "noir_shadow_whisper", title: "The Whisper", icon: "\uD83C\uDF11", character: "noir",
        description: "You hear ${CHARACTER.name}'s voice but his lips don't move. \u201CYou've been thinking about me. Even when you're with them. I can feel it.\u201D",
        minAffection: 0,
        choices: [
            { text: "That's not true", effects: { bond: 10, affection: 3, corruption: 3 }, response: "Denial is the first stage. The second is curiosity. You're already past both.", emotion: "neutral" },
            { text: "...Maybe", effects: { bond: 20, affection: 7, corruption: 5 }, response: "Honesty. Finally. That's the most attractive thing anyone can give me.", emotion: "love" }
        ]
    },
    {
        id: "noir_midnight_temptation", title: "Midnight Offer", icon: "\uD83C\uDF19", character: "noir",
        description: "${CHARACTER.name} appears in shadow, closer than you expected. \u201CI could show you what you really want. Not what you think you should want. What you actually want.\u201D",
        minAffection: 1, timeOfDay: "night",
        choices: [
            { text: "Show me", effects: { bond: 22, affection: 8, corruption: 8 }, response: "Close your eyes. ...Now tell me who you saw. It wasn't the knight. It wasn't the siren.", emotion: "love" },
            { text: "I know what I want", effects: { bond: 12, affection: 4, corruption: 3 }, response: "Do you? Because your choices suggest otherwise. You keep coming back to the dark.", emotion: "neutral" }
        ]
    },
    {
        id: "noir_dark_mirror", title: "The Mirror", icon: "\uD83E\uDE9E", character: "noir",
        description: "${CHARACTER.name} holds up a dark surface. Your reflection looks different. Sharper, hungrier, more alive. \u201CThat's you without the mask. Beautiful, isn't it?\u201D",
        minAffection: 1,
        choices: [
            { text: "It is", effects: { bond: 20, affection: 7, corruption: 6 }, response: "The version of you that doesn't apologize for wanting things. I love that version.", emotion: "love" },
            { text: "Put it away", effects: { bond: 8, affection: 2, corruption: -3 }, response: "Running from your own reflection. ...How exhausting that must be.", emotion: "neutral" }
        ]
    },
    {
        id: "noir_others_weakness", title: "Their Secret", icon: "\uD83D\uDD73\uFE0F", character: "noir",
        description: "${CHARACTER.name} leans close. \u201CThe knight is afraid of being useless. The prince is afraid of being alone. The siren is afraid of being known. ...Want to know what the mage fears?\u201D",
        minAffection: 1,
        choices: [
            { text: "Tell me", effects: { bond: 18, affection: 6, corruption: 5 }, response: "Being wrong. About everything. Including you. ...Knowledge is a cage when it fails.", emotion: "neutral" },
            { text: "Stop. That's private.", effects: { bond: 5, affection: 1, corruption: -5 }, response: "Privacy. How quaint. ...I'll remember that you have boundaries. Even here.", emotion: "sad" }
        ]
    },
    {
        id: "noir_corruption_spread", title: "The Stain", icon: "\uD83D\uDDA4", character: "noir",
        description: "Darkness seeps from ${CHARACTER.name}'s fingertips where they touch the ground. Flowers wilt. Stones darken. \u201CDon't look at me like that. Everything decays. I just... accelerate it.\u201D",
        minAffection: 0,
        choices: [
            { text: "Can you control it?", effects: { bond: 15, affection: 5, corruption: 3 }, response: "Control implies I want to stop it. What if I told you decay is the most honest form of change?", emotion: "neutral" },
            { text: "Does it hurt?", effects: { bond: 20, affection: 7 }, response: "...No one's ever asked that. ...Yes. Constantly. But pain and power share a nerve.", emotion: "shy" }
        ]
    },
    {
        id: "noir_jealousy", title: "Territorial", icon: "\uD83D\uDD25", character: "noir",
        description: "${CHARACTER.name}'s eyes darken. \u201CYou visited the prince yesterday. I could taste the comfort on you when you came back. It was... cloying.\u201D",
        minAffection: 1,
        choices: [
            { text: "Jealous?", effects: { bond: 15, affection: 5, corruption: 3 }, response: "Jealousy implies fear of loss. I don't fear loss. I am loss. ...But yes.", emotion: "neutral" },
            { text: "You don't own me", effects: { bond: 10, affection: 3 }, response: "No. I don't. ...That's what makes this interesting. You come back by choice.", emotion: "shy" }
        ]
    },
    {
        id: "noir_vulnerability", title: "The Crack", icon: "\uD83E\uDE78", character: "noir",
        description: "For one second, ${CHARACTER.name}'s composure breaks. The darkness recedes. He looks... young. Frightened. Then it's gone. \u201CYou didn't see that.\u201D",
        minAffection: 2,
        choices: [
            { text: "I saw it", effects: { bond: 25, affection: 9, corruption: -5 }, response: "...Then you saw the thing I've been hiding from everyone. Including myself. Don't make me regret it.", emotion: "shy" },
            { text: "See what?", effects: { bond: 15, affection: 5 }, response: "Good answer. ...Thank you. For not looking too closely. This time.", emotion: "neutral" }
        ]
    },
    {
        id: "noir_power_gift", title: "A Taste of Power", icon: "\u26A1", character: "noir",
        description: "${CHARACTER.name} offers you his hand. Dark energy swirls around it. \u201COne touch. Just to see what it feels like. Power without consequence. ...Almost without consequence.\u201D",
        minAffection: 1,
        choices: [
            { text: "Take his hand", effects: { bond: 22, affection: 8, corruption: 10 }, response: "...You felt that? The rush? That's what I feel every moment. And now you understand why I can't stop.", emotion: "love" },
            { text: "No", effects: { bond: 5, affection: 1, corruption: -3 }, response: "Smart. Or afraid. ...Either way, the offer stands. It always will.", emotion: "neutral" }
        ]
    },
    {
        id: "noir_confession", title: "The Truth Beneath", icon: "\uD83D\uDC9C", character: "noir",
        description: "${CHARACTER.name} is quiet for a long time. \u201CI wasn't always this. There was a time when the darkness was something I fought. Then I lost someone. And I stopped fighting.\u201D",
        minAffection: 2,
        choices: [
            { text: "Who did you lose?", effects: { bond: 22, affection: 8 }, response: "Myself. The version of me that believed in light. He died quietly. No one noticed.", emotion: "sad" },
            { text: "You can fight again", effects: { bond: 20, affection: 7, corruption: -8 }, response: "...Can I? With you? ...I haven't hoped in a very long time. This feels dangerous.", emotion: "love" }
        ]
    },
    {
        id: "noir_final_form", title: "Unmasked", icon: "\uD83C\uDF1A", character: "noir",
        description: "The shadows pull back entirely. ${CHARACTER.name} stands in plain light for the first time. No darkness. No power. Just a person. \u201CThis is what I look like without the armor. ...Don't laugh.\u201D",
        minAffection: 3,
        choices: [
            { text: "You're beautiful", effects: { bond: 25, affection: 10, corruption: -10 }, response: "...Beautiful. Without the darkness. No one's ever... I don't know what to do with that.", emotion: "love" },
            { text: "I prefer the darkness", effects: { bond: 15, affection: 5, corruption: 8 }, response: "...Of course you do. Because the darkness is powerful. And you love power. We're the same.", emotion: "neutral" }
        ]
    },
    // ===== ELIAN-SPECIFIC EVENTS =====
    {
        id: "elian_herb_gathering", title: "Wild Harvest", icon: "\uD83C\uDF3F", character: "elian",
        description: "${CHARACTER.name} finds a patch of rare herbs. \u201CThis only grows after rainfall. We have a small window before the sun dries it.\u201D",
        minAffection: 0,
        choices: [
            { text: "Help gather quickly", effects: { bond: 18, hunger: -5, affection: 5 }, response: "Fast hands. Good instincts. You'd survive a winter out here.", emotion: "happy" },
            { text: "Ask what it's for", effects: { bond: 10, affection: 3 }, response: "Fever reducer. Pain killer. Life saver. Now help.", emotion: "neutral" }
        ]
    },
    {
        id: "elian_wolf_encounter", title: "Eyes in the Dark", icon: "\uD83D\uDC3A", character: "elian",
        description: "A low growl from the treeline. ${CHARACTER.name} puts an arm out, stopping you. \u201CDon't. Run. Move slowly behind me.\u201D",
        minAffection: 0,
        choices: [
            { text: "Stay behind him", effects: { bond: 15, affection: 4 }, response: "Good. You listened. That's why you're still standing.", emotion: "neutral" },
            { text: "Stand beside him", effects: { bond: 22, affection: 7 }, response: "...You stood your ground. Stupid. Brave. I respect it.", emotion: "love" }
        ]
    },
    {
        id: "elian_campfire", title: "Stories by the Fire", icon: "\uD83D\uDD25", character: "elian",
        description: "Night falls. ${CHARACTER.name} stokes the fire and stares into it. \u201CThe forest remembers everyone who passes through. Even you.\u201D",
        minAffection: 1,
        choices: [
            { text: "Ask about his past", effects: { bond: 18, affection: 6 }, response: "...I lived in a village once. It burned. The forest took me in. That's all.", emotion: "sad" },
            { text: "Sit in comfortable silence", effects: { bond: 20, affection: 7 }, response: "You don't fill silence with noise. That's... rare.", emotion: "love" }
        ]
    },
    {
        id: "elian_wounded_animal", title: "The Injured Fawn", icon: "\uD83E\uDD8C", character: "elian",
        description: "A young deer with a broken leg. ${CHARACTER.name} kneels beside it, hands gentle despite their roughness. \u201CThis is going to hurt her. Hold her still.\u201D",
        minAffection: 1,
        choices: [
            { text: "Help hold the fawn", effects: { bond: 22, affection: 7 }, response: "You're gentler than I expected. She feels it. ...So do I.", emotion: "shy" },
            { text: "Let nature take its course", effects: { bond: 5, affection: -2 }, response: "...That's one philosophy. Not mine.", emotion: "sad" }
        ]
    },
    {
        id: "elian_storm_shelter", title: "Thunder Rolls In", icon: "\u26C8\uFE0F", character: "elian",
        description: "The sky cracks open. ${CHARACTER.name} grabs your wrist and pulls you under a rock overhang. Rain hammers the forest. It's very close quarters.",
        minAffection: 0,
        choices: [
            { text: "Press closer for warmth", effects: { bond: 20, affection: 8 }, response: "...Body heat is practical. That's why I'm not moving away.", emotion: "shy" },
            { text: "Wait patiently", effects: { bond: 12, affection: 4 }, response: "You're calm in a storm. Not many people are.", emotion: "happy" }
        ]
    },
    {
        id: "elian_carved_token", title: "Something Small", icon: "\uD83E\uDE93", character: "elian",
        description: "You find ${CHARACTER.name} whittling by the fire. He sees you watching and closes his hand around it. \u201CIt's not finished.\u201D",
        minAffection: 2,
        choices: [
            { text: "Ask what it is", effects: { bond: 15, affection: 5 }, response: "...It's a fox. They mate for life. That's not why I chose it. ...That's exactly why.", emotion: "shy" },
            { text: "Wait until he's ready to show you", effects: { bond: 20, affection: 7 }, response: "You waited. You always wait. ...Here. It's yours.", emotion: "love" }
        ]
    },
    {
        id: "elian_sunrise_watch", title: "First Light", icon: "\uD83C\uDF05", character: "elian",
        description: "You wake before dawn. ${CHARACTER.name} is already up, sitting on a ridge, watching the forest wake. He doesn't turn when you approach. \u201CYou're up early.\u201D",
        minAffection: 2, timeOfDay: "morning",
        choices: [
            { text: "Watch the sunrise together", effects: { bond: 22, affection: 8 }, response: "This is my favorite hour. No noise. No demands. ...Just this.", emotion: "love" },
            { text: "Bring him breakfast", effects: { bond: 15, affection: 5 }, response: "You brought food before I asked. ...You're learning.", emotion: "happy" }
        ]
    },
    {
        id: "elian_old_campsite", title: "The Abandoned Camp", icon: "\u26FA", character: "elian",
        description: "${CHARACTER.name} leads you to an overgrown campsite. Old firepit. Collapsed shelter. \u201CI built this when I first came here. Ten years ago. I was angry then.\u201D",
        minAffection: 2,
        choices: [
            { text: "Ask who he was angry at", effects: { bond: 18, affection: 6 }, response: "Everyone. Myself. The fire that took everything. ...I'm less angry now.", emotion: "sad" },
            { text: "Help rebuild it", effects: { bond: 22, affection: 7 }, response: "You want to fix something that was never yours. ...That's exactly what you did with me.", emotion: "love" }
        ]
    },
    {
        id: "elian_moonlit_pond", title: "Still Water", icon: "\uD83C\uDF19", character: "elian",
        description: "A hidden pond reflecting moonlight. ${CHARACTER.name} is already there, sitting at the edge, fingers trailing the water. He doesn't startle when you arrive.",
        minAffection: 2, timeOfDay: "night",
        choices: [
            { text: "Sit beside him quietly", effects: { bond: 22, affection: 8 }, response: "You always know when I need silence and when I need company. How?", emotion: "love" },
            { text: "Touch the water too", effects: { bond: 18, affection: 6 }, response: "Our reflections overlap in the water. The forest sees us as one.", emotion: "shy" }
        ]
    },
    {
        id: "elian_teaching_moment", title: "The Lesson", icon: "\uD83C\uDF31", character: "elian",
        description: "${CHARACTER.name} hands you a knife. \u201CIf we get separated, you need to know this. Pay attention. I'll only show you once.\u201D",
        minAffection: 1,
        choices: [
            { text: "Focus completely", effects: { bond: 20, affection: 6 }, response: "You learn fast when it matters. That's the only time that counts.", emotion: "happy" },
            { text: "Ask why he's teaching you", effects: { bond: 15, affection: 5 }, response: "Because I won't always be there. And that thought... bothers me more than it should.", emotion: "sad" }
        ]
    },
    // ===== CASPIAN-SPECIFIC EVENTS =====
    {
        id: "caspian_royal_garden",
        title: "The Hidden Garden",
        icon: "\uD83C\uDF39",
        character: "caspian",
        description: "${CHARACTER.name} leads you through an ivy-covered archway you've never noticed before. Beyond it, a secret garden in full bloom. \u201CMy mother planted this. No one comes here but me.\u201D",
        minAffection: 0,
        choices: [
            { text: "It's beautiful", effects: { bond: 15, affection: 5 }, response: "Like her. ...And like you, actually. Don't make me say it twice.", emotion: "shy" },
            { text: "Why show me?", effects: { bond: 20, affection: 7 }, response: "Because you're the first person I've trusted with something this fragile.", emotion: "love" }
        ]
    },
    {
        id: "caspian_midnight_tea",
        title: "Midnight Tea",
        icon: "\u2615",
        character: "caspian",
        description: "You find ${CHARACTER.name} in the kitchen at 2 AM, sleeves rolled up, brewing tea himself. No servants in sight. \u201CDon't tell anyone. A prince making his own tea is practically a scandal.\u201D",
        minAffection: 0,
        choices: [
            { text: "Help him brew it", effects: { bond: 18, affection: 5 }, response: "You know, this is the most normal I've felt in months. Thank you for that.", emotion: "happy" },
            { text: "Tease him about it", effects: { bond: 12, affection: 3 }, response: "The scandal of the century. The prince can boil water. Alert the court.", emotion: "happy" }
        ]
    },
    {
        id: "caspian_dance_lesson",
        title: "An Impromptu Waltz",
        icon: "\uD83D\uDC83",
        character: "caspian",
        description: "Music drifts from the ballroom. ${CHARACTER.name} extends his hand. \u201CThe court waltz is in three days. You'll need practice. Fortunately, I'm an excellent teacher.\u201D",
        minAffection: 1,
        choices: [
            { text: "Take his hand", effects: { bond: 22, affection: 8 }, response: "Your hand fits perfectly in mine. The court would say that's symbolic. I'd say they're right.", emotion: "love" },
            { text: "Step on his feet deliberately", effects: { bond: 15, affection: 4 }, response: "...I deserved that for being presumptuous. But your form is terrible and we both know it.", emotion: "happy" }
        ]
    },
    {
        id: "caspian_old_portrait",
        title: "The Queen's Portrait",
        icon: "\uD83D\uDDBC\uFE0F",
        character: "caspian",
        description: "In a dimly lit corridor, ${CHARACTER.name} stands before a large portrait of a woman with his eyes. He doesn't look away when you approach. \u201CShe left when I was seven. The portrait stayed.\u201D",
        minAffection: 2,
        choices: [
            { text: "Stand with him in silence", effects: { bond: 25, affection: 8 }, response: "...You didn't ask why she left. Everyone asks why she left. Thank you.", emotion: "shy" },
            { text: "Ask if he misses her", effects: { bond: 15, affection: 5 }, response: "Every day. But less now. You're filling rooms she left empty.", emotion: "sad" }
        ]
    },
    {
        id: "caspian_crown_weight",
        title: "The Weight of Gold",
        icon: "\uD83D\uDC51",
        character: "caspian",
        description: "${CHARACTER.name} sits on the throne alone. The crown is in his hands, not on his head. \u201CDid you know this weighs almost two kilograms? It feels heavier every year.\u201D",
        minAffection: 1,
        choices: [
            { text: "Take it from his hands", effects: { bond: 20, affection: 7 }, response: "You just... took the crown from a prince. That's either treason or love. I'll choose love.", emotion: "love" },
            { text: "Sit beside him", effects: { bond: 18, affection: 6 }, response: "The throne is cold. But you're warm. That helps more than you know.", emotion: "shy" }
        ]
    },
    {
        id: "caspian_poetry_fire",
        title: "Poetry by Firelight",
        icon: "\uD83D\uDD25",
        character: "caspian",
        description: "Rain hammers the palace windows. ${CHARACTER.name} reads aloud by the fire, his voice soft and measured. He looks up. \u201CThis next one... I wrote it. For someone. Recently.\u201D",
        minAffection: 2,
        choices: [
            { text: "Ask him to read it", effects: { bond: 22, affection: 9 }, response: "It's... about the way light changes when a certain person enters a room. I think you know who.", emotion: "love" },
            { text: "Write one back", effects: { bond: 20, affection: 7 }, response: "You wrote me a poem. In real time. It's terrible and perfect and I'm keeping it forever.", emotion: "happy" }
        ]
    },
    {
        id: "caspian_locked_wing",
        title: "The Locked Wing",
        icon: "\uD83D\uDD12",
        character: "caspian",
        description: "A corridor you've never explored. ${CHARACTER.name} hesitates at a locked door. \u201CThis was my brother's wing. Before he left the kingdom. I haven't opened it in years.\u201D",
        minAffection: 2,
        choices: [
            { text: "Open it together", effects: { bond: 25, affection: 8, corruption: -3 }, response: "Dust and memories. But with you here, it feels less like a grave and more like... healing.", emotion: "sad" },
            { text: "Let him decide when he's ready", effects: { bond: 15, affection: 6 }, response: "You're right. Not today. But soon. Because you'll be with me when I do.", emotion: "shy" }
        ]
    },
    {
        id: "caspian_visiting_diplomat",
        title: "The Diplomat's Interest",
        icon: "\uD83C\uDF0D",
        character: "caspian",
        description: "A foreign diplomat lingers near you at a palace reception, smiling too warmly. ${CHARACTER.name} appears at your side within seconds, hand on your lower back. \u201CThey're here for trade agreements. Not for you.\u201D",
        minAffection: 1,
        choices: [
            { text: "Let Caspian handle it", effects: { bond: 18, affection: 5 }, response: "The diplomat won't be sitting near you at dinner. I've... rearranged the seating chart.", emotion: "neutral" },
            { text: "Tell him you can handle yourself", effects: { bond: 10, affection: 3 }, response: "Of course you can. I just... wanted to be the one standing next to you. Not them.", emotion: "shy" }
        ]
    },
    {
        id: "caspian_servants_whisper",
        title: "The Servants Talk",
        icon: "\uD83D\uDCAC",
        character: "caspian",
        description: "You overhear palace staff whispering: \u201CThe prince has never been this happy. Not since before the queen left.\u201D ${CHARACTER.name} catches you listening. \u201CThey're not wrong.\u201D",
        minAffection: 2,
        choices: [
            { text: "Tell him you're happy too", effects: { bond: 22, affection: 8 }, response: "Then we'll give them something else to whisper about.", emotion: "love" },
            { text: "Ask about before", effects: { bond: 15, affection: 5 }, response: "Before was... quiet. Proper. Empty. You're the opposite of all three.", emotion: "shy" }
        ]
    },
    {
        id: "caspian_rain_courtyard",
        title: "Rain in the Courtyard",
        icon: "\uD83C\uDF27\uFE0F",
        character: "caspian",
        description: "It's pouring. ${CHARACTER.name} stands in the open courtyard, face tilted to the sky. His silk shirt is soaked through. He's laughing. \u201CI haven't done this since I was a child!\u201D",
        minAffection: 0,
        choices: [
            { text: "Join him in the rain", effects: { bond: 20, affection: 7 }, response: "Look at us. Two fools in the rain. The court would be horrified. I love it.", emotion: "happy" },
            { text: "Watch from the archway", effects: { bond: 10, affection: 3 }, response: "You're smiling. From a safe distance. That's so... you.", emotion: "happy" }
        ]
    }
];

// Event Manager Class
class EventSystem {
    constructor(game) {
        this.game = game;
        this.triggeredToday = false;
        this.triggeredCount = 0;         // events fired this session
        this.maxPerSession  = 2;         // max 2 events per play session
        this.lastEventTime = 0;
        this.eventCooldown = 180000;     // 3 minutes minimum between events
        this.seenEvents = new Set();
    }

    // Check if an event should trigger
    shouldTrigger() {
        if (this.triggeredCount >= this.maxPerSession) return false;
        if (this.game.characterLeft) return false;
        if (this.game.sceneActive) return false;

        const now = Date.now();
        if (now - this.lastEventTime < this.eventCooldown) return false;

        // Don't interrupt active player input
        const timeSinceInteraction = now - this.game.lastInteractionTime;
        if (timeSinceInteraction < 8000) return false;

        // First-care-session quiet window: don't pop a random event modal
        // ("Storm at the Castle") on top of a brand-new player who hasn't
        // even tapped Talk yet. The greeting + first-action hint own the
        // first 5 minutes / 6 interactions of a fresh save.
        if (window.PPAmbient && window.PPAmbient.firstCareSession && window.PPAmbient.firstCareSession()) return false;
        // Don't fire while typewriter is busy with a line.
        if (this.game.typewriter && typeof this.game.typewriter.busy === 'function' && this.game.typewriter.busy()) return false;

        return Math.random() < 0.004; // ~0.4% per tick ≈ every 25-50 sec of idle
    }

    // Get a random valid event
    getRandomEvent() {
        const g = this.game;

        const valid = RANDOM_EVENTS.filter(e => {
            // Check character-specific events
            if (e.character && e.character !== (g.selectedCharacter || 'alistair')) return false;

            // Generic events (no character field) show for everyone
            // But skip Alistair-specific language for Lyra
            if (!e.character && g.selectedCharacter === 'lyra') {
                // Allow generic events for Lyra too (names are replaced at display)
            }

            // Check affection requirement
            if (e.minAffection && g.affectionLevel < e.minAffection) return false;

            // Check corruption requirement
            if (e.minCorruption && g.corruption < e.minCorruption) return false;

            // Check time of day
            if (e.timeOfDay && g.timeOfDay !== e.timeOfDay) return false;

            return true;
        });

        if (valid.length === 0) return null;

        // Prioritize unseen events
        const unseen = valid.filter(e => !this.seenEvents.has(e.id));
        const pool = unseen.length > 0 ? unseen : valid;

        return pool[Math.floor(Math.random() * pool.length)];
    }

    // Trigger an event
    trigger() {
        const event = this.getRandomEvent();
        if (!event) return;

        // ── CROSS-SYSTEM SCENE MUTEX (May 2026 audit, Phase 2) ─────────
        // Random events can collide with surprises / small-moments / etc.
        // when they happen to roll in the same tick. Defer if any other
        // scheduled-scene system fired in the last 5 min. Don't burn
        // triggeredToday/seen flags on a denial — try again next tick.
        if (window.PPAmbient && window.PPAmbient.tryClaimSceneSlot
            && !window.PPAmbient.tryClaimSceneSlot('event:' + event.id)) {
            return;
        }

        this.triggeredToday = true;
        this.triggeredCount++;
        this.lastEventTime = Date.now();
        this.seenEvents.add(event.id);
        // (Removed orphan 'pp_event_<id>_seen' write May 2026 — comment
        //  claimed stories.js read it, but no reader was ever added. The
        //  in-save seenEvents Set still tracks event history via game.js
        //  save/load. Without this fix, every random event was bloating
        //  the player's localStorage with a 1-byte flag they couldn't use.)

        this.showEvent(event);
    }

    // Show event UI
    showEvent(event) {
        const overlay = document.getElementById('event-overlay');
        const icon = document.getElementById('event-icon');
        const title = document.getElementById('event-title');
        const desc = document.getElementById('event-description');
        const choicesDiv = document.getElementById('event-choices');

        // Replace character name + pronoun placeholders
        const charName = CHARACTER.name || 'Alistair';
        const isLyra = charName === 'Lyra';
        const replaceName = (s) => s
            .replace(/\$\{CHARACTER\.name\}/g, charName)
            .replace(/\$\{he\}/g,      isLyra ? 'she'     : 'he')
            .replace(/\$\{He\}/g,      isLyra ? 'She'     : 'He')
            .replace(/\$\{his\}/g,     isLyra ? 'her'     : 'his')
            .replace(/\$\{His\}/g,     isLyra ? 'Her'     : 'His')
            .replace(/\$\{him\}/g,     isLyra ? 'her'     : 'him')
            .replace(/\$\{himself\}/g, isLyra ? 'herself' : 'himself');

        icon.textContent = event.icon;
        title.textContent = replaceName(event.title);
        desc.textContent = replaceName(event.description);

        choicesDiv.innerHTML = '';
        event.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'event-choice-btn';
            btn.textContent = replaceName(choice.text);
            btn.addEventListener('click', () => {
                this.resolveChoice(choice);
                overlay.classList.add('hidden');
            });
            choicesDiv.appendChild(btn);
        });

        overlay.classList.remove('hidden');
        sounds.chime();
    }

    // Apply choice effects
    resolveChoice(choice) {
        const g = this.game;
        const fx = choice.effects || {};

        if (fx.bond) g.bond = Math.max(0, Math.min(100, g.bond + fx.bond));
        if (fx.hunger) g.hunger = Math.max(0, Math.min(100, g.hunger + fx.hunger));
        if (fx.clean) g.clean = Math.max(0, Math.min(100, g.clean + fx.clean));
        if (fx.affection) g.affection = Math.max(0, Math.min(100, g.affection + fx.affection));
        if (fx.corruption) g.corruption = Math.max(0, Math.min(100, g.corruption + fx.corruption));
        if (fx.irritation) g.irritationScore += fx.irritation;

        // Show response dialogue
        const charName = CHARACTER.name || 'Alistair';
        const isLyra = charName === 'Lyra';
        const replaceAll = (s) => s
            .replace(/\$\{CHARACTER\.name\}/g, charName)
            .replace(/\$\{he\}/g,      isLyra ? 'she'     : 'he')
            .replace(/\$\{He\}/g,      isLyra ? 'She'     : 'He')
            .replace(/\$\{his\}/g,     isLyra ? 'her'     : 'his')
            .replace(/\$\{His\}/g,     isLyra ? 'Her'     : 'His')
            .replace(/\$\{him\}/g,     isLyra ? 'her'     : 'him')
            .replace(/\$\{himself\}/g, isLyra ? 'herself' : 'himself');
        g.typewriter.show(replaceAll(choice.response));

        // Flash emotion
        if (choice.emotion) {
            g.ui.flashEmotion(choice.emotion, 3000);
        }

        // Sound based on effect
        if (fx.affection && fx.affection >= 5) {
            sounds.fanfare();
            g.ui.spawnFloatingHearts(3);
        } else if (fx.corruption && fx.corruption > 0) {
            sounds.dark();
        }

        g.ui.bounceCharacter();
        g.save();
    }

    // Save/load seen events
    getSaveData() {
        return {
            seenEvents: Array.from(this.seenEvents),
            lastEventTime: this.lastEventTime,
            triggeredToday: this.triggeredToday,
            triggeredCount: this.triggeredCount
        };
    }

    loadSaveData(data) {
        if (data.seenEvents)     this.seenEvents    = new Set(data.seenEvents);
        if (data.lastEventTime)  this.lastEventTime = data.lastEventTime;
        if (data.triggeredToday) this.triggeredToday = data.triggeredToday;
        // Reset count on new day, otherwise restore it
        const lastDate = data.lastEventTime ? new Date(data.lastEventTime).toDateString() : null;
        const today    = new Date().toDateString();
        this.triggeredCount = (lastDate === today) ? (data.triggeredCount || 0) : 0;
    }

    // Force-show an event by ID, bypassing the random-trigger gates.
    // Used by the Stories archive's Replay button so a player can
    // re-experience an event they've already encountered. Does NOT
    // count against the per-session/per-day limits.replay is
    // explicit player intent, not RNG.
    forceShow(eventId) {
        const event = RANDOM_EVENTS.find(e => e.id === eventId);
        if (!event) return false;
        this.showEvent(event);
        return true;
    }
}

// Expose the class so the Stories archive can find an active instance
// via window._game.eventSystem and call forceShow(id) for replays.
if (typeof window !== 'undefined') {
    window.EventSystem = EventSystem;
}
