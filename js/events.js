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
                response: "*wakes up slowly* ...Your hand is warm. Was I... crying?",
                emotion: "shy"
            },
            {
                text: "Let him sleep through it",
                effects: { corruption: 3 },
                response: "*in the morning* I had a terrible dream... But you weren't there.",
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
                response: "*later that day, you catch him rewriting it more carefully*",
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
                text: "Ignore it — he's a knight, he can handle it",
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
        description: "A package arrived at the castle addressed to both of you. Inside is a beautiful matching pair of keychains — a sword and a shield...",
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
        description: "It's ${CHARACTER.name}'s birthday — but he never told you. You overheard the castle servants whispering about it...",
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
                response: "*stares out the window quietly all day*",
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
        description: "Late at night, you hear ${CHARACTER.name} talking to ${himself}. ${His} voice sounds different — deeper, colder...",
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
                response: "*flinches* ...You... you're real. I thought I was alone in the dark.",
                emotion: "crying"
            },
            {
                text: "Ask what ${he} sees",
                effects: { corruption: 5 },
                response: "I see what I'm becoming. And part of me... doesn't want to stop.",
                emotion: "corrupted"
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
                response: "*gasps* You heard that...? That song... it's the one I only sing when I think of you.",
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
                response: "Teach you? *laughs softly* Your voice is like the land... rough and beautiful. Let's try.",
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
                response: "You'd let me go...? *tears* That's why I'll never leave. You're the first to give me a choice.",
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
                response: "*holds it out with trembling hands* I made this... for you. Do you like it...?",
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
                response: "*gasps awake* The dark water... it was pulling me down... but your voice brought me back.",
                emotion: "crying"
            },
            {
                text: "Sing to her softly",
                effects: { bond: 25, corruption: -15, affection: 8 },
                response: "*eyes flutter open* You were... singing? For me? Nobody has ever sung me to sleep before...",
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
                response: "*blinks* What... what happened? I felt so cold... Thank you for calling me back.",
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
        description: "A second siren appears near the cave — younger, louder. She sings directly at you. ${CHARACTER.name} goes very still.",
        minAffection: 2,
        choices: [
            {
                text: "Stay next to ${CHARACTER.name}",
                effects: { bond: 25, affection: 8 },
                response: "You didn't even look at her... *exhales slowly* ...Good.",
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
                response: "You don't have to say that... *pause* ...But thank you. I needed to hear it.",
                emotion: "shy"
            }
        ]
    },
    {
        id: "lyra_birthday",
        title: "The Day She Won't Name",
        icon: "🌙",
        character: "lyra",
        description: "${CHARACTER.name} has been quieter than usual all morning. Something about today feels different — weighted. Like she's carrying a memory.",
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
                response: "*after a long moment* You didn't ask. You just stayed. ...That's exactly what I needed.",
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
                response: "You don't have to\u2014 ...Actually, the crystallized residue near your left foot is unstable. Step carefully. But thank you.",
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
                response: "You\u2014 this is\u2014 I'll spend years translating this. Decades. ...You just gave me decades of purpose.",
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
        description: "You find ${CHARACTER.name} at 3 AM, pacing. His hands are shaking and glowing faintly. \u201CThe patterns\u2014 they followed me out of a dream. I can still see them.\u201D",
        minAffection: 1,
        timeOfDay: "night",
        choices: [
            {
                text: "Ground him \u2014 hold his hands",
                effects: { bond: 22, affection: 8, corruption: -5 },
                response: "...The glowing stopped. How did you\u2014 ...Your hands are warm. The patterns can't compete with that.",
                emotion: "shy"
            },
            {
                text: "Ask him to describe what he sees",
                effects: { bond: 10, affection: 3, corruption: 3 },
                response: "You want to know? Most people run. It's... beautiful and terrible. Like looking at the sun's source code.",
                emotion: "neutral"
            }
        ]
    },
    {
        id: "lucien_lyra_memory",
        title: "Her Song, His Numbers",
        icon: "\uD83C\uDFB5",
        character: "lucien",
        description: "${CHARACTER.name} is transcribing something \u2014 musical notation converted into mathematical sequences. \u201CMy sister used to sing this. I'm trying to preserve it in a language that won't fade.\u201D",
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
        description: "The tower's wards flicker and die for three seconds. ${CHARACTER.name}'s face goes pale. \u201CThat shouldn't be possible. Something\u2014 or someone\u2014 tested them.\u201D",
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
        description: "You find ${CHARACTER.name} on the tower roof at midnight, not studying \u2014 just looking up. No instruments. No notes. Just him and the sky.",
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

        this.triggeredToday = true;
        this.triggeredCount++;
        this.lastEventTime = Date.now();
        this.seenEvents.add(event.id);

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
}
