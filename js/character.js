// Character data and personality definitions

const CHARACTER_ALISTAIR = {
    name: "Alistair",
    title: "The Loyal Knight",
    basePersonality: "shy",

    // Full-body sprite mappings. Only eating1-5 currently exist — all other
    // keys are kept as aliases pointing to eating1 so old code paths don't
    // break. When new portrait sprites are added (neutral/happy/sad/etc.),
    // replace each alias with the real filename.
    bodySprites: {
        // Real art — drinking/eating animation (portrait format)
        eating1: "assets/alistair/body/eating1.png",
        eating2: "assets/alistair/body/eating2.png",
        eating3: "assets/alistair/body/eating3.png",
        eating4: "assets/alistair/body/eating4.png",
        eating5: "assets/alistair/body/eating5.png",
        // Real art — shower/wash animation (portrait format)
        shower1: "assets/alistair/body/shower1.png",
        shower2: "assets/alistair/body/shower2.png",
        shower3: "assets/alistair/body/shower3.png",
        shower4: "assets/alistair/body/shower4.png",
        shower5: "assets/alistair/body/shower5.png",
        // Real art — sword-fighting animation (portrait format)
        fighting1: "assets/alistair/body/fighting1.png",
        fighting2: "assets/alistair/body/fighting2.png",
        fighting3: "assets/alistair/body/fighting3.png",
        fighting4: "assets/alistair/body/fighting4.png",
        fighting5: "assets/alistair/body/fighting5.png",
        // TEMP aliases — pointed at eating1 until portrait replacements arrive.
        // Don't delete these keys; existing code and saves reference them.
        neutral:     "assets/alistair/body/eating1.png",
        default:     "assets/alistair/body/eating1.png",
        happy:       "assets/alistair/body/eating1.png",
        happy2:      "assets/alistair/body/eating1.png",
        happy3:      "assets/alistair/body/eating1.png",
        gentle:      "assets/alistair/body/eating1.png",
        sad:         "assets/alistair/body/eating1.png",
        sad1:        "assets/alistair/body/eating1.png",
        sad2:        "assets/alistair/body/eating1.png",
        sad3:        "assets/alistair/body/eating1.png",
        "sad-deep":  "assets/alistair/body/eating1.png",
        talk:        "assets/alistair/body/eating1.png",
        "cross-arms":"assets/alistair/body/eating1.png",
        crossarms:   "assets/alistair/body/eating1.png",
        armor1:      "assets/alistair/body/eating1.png",
        armor2:      "assets/alistair/body/eating1.png",
        armor3:      "assets/alistair/body/eating1.png",
        armor5:      "assets/alistair/body/eating1.png",
        // `fighting` (legacy key) points to the first real sword-form frame
        fighting:    "assets/alistair/body/fighting1.png",
        // fighting1 / fighting2 are now real — see the sprite block above
        casual1:     "assets/alistair/body/eating1.png",
        casual2:     "assets/alistair/body/eating1.png",
        casual3:     "assets/alistair/body/eating1.png",
        shirtless:   "assets/alistair/body/eating1.png",
        shirtless1:  "assets/alistair/body/eating1.png",
        shirtless2:  "assets/alistair/body/eating1.png",
        shirtless3:  "assets/alistair/body/eating1.png",
    },

    // Pixel face portrait mappings per emotion
    faceSprites: {
        happy: ["assets/alistair/face/happy.png", "assets/alistair/face/happy2.png"],
        love: ["assets/alistair/face/love.png", "assets/alistair/face/cheeky.png"],
        neutral: ["assets/alistair/face/gentle.png", "assets/alistair/face/gentle2.png", "assets/alistair/face/neutral.png", "assets/alistair/face/neutral2.png"],
        gentle: ["assets/alistair/face/gentle.png", "assets/alistair/face/gentle2.png"],
        sad: ["assets/alistair/face/sad.png", "assets/alistair/face/sad2.png"],
        crying: ["assets/alistair/face/crying.png", "assets/alistair/face/crying2.png"],
        angry: ["assets/alistair/face/annoyed.png", "assets/alistair/face/annoyed2.png"],
        furious: ["assets/alistair/face/angry.png", "assets/alistair/face/angry2.png"],
        shy: ["assets/alistair/face/shy.png", "assets/alistair/face/cheeky.png"],
        wink: ["assets/alistair/face/wink.png", "assets/alistair/face/love.png"],
        sleeping: ["assets/alistair/face/sleeping.png"],
        corrupted: ["assets/alistair/face/angry.png", "assets/alistair/face/angry2.png", "assets/alistair/face/crying.png"],
        left: ["assets/alistair/face/crying2.png"]
    },

    // Map emotions to body poses. Only eating1-5 exist right now — all
    // emotions currently resolve to one of those (which all show Alistair
    // holding a mug). When new portrait sprites arrive (happy, sad, gentle,
    // etc.), restore per-emotion arrays like the other characters use.
    emotionToBody: {
        happy:    ["eating1", "eating2", "eating5"],
        love:     ["eating1", "eating5"],
        neutral:  ["eating1"],
        gentle:   ["eating1", "eating5"],
        sad:      ["eating1"],
        crying:   ["eating1"],
        angry:    ["fighting1", "fighting4"],
        furious:  ["fighting1", "fighting2", "fighting3", "fighting4", "fighting5"],
        shy:      ["eating1", "eating5"],
        wink:     ["eating1", "eating2"],
        sleeping: ["eating1"],
        corrupted:["fighting1", "fighting2", "fighting5"],
        left:     ["eating1"]
    },

    // Action-to-body mappings:
    //   Feed  → 5-frame eating animation
    //   Wash  → 5-frame shower animation
    //   Train → 5-frame sword fighting animation (Sword Forms)
    //   Gift / Talk → temporary eating1 fallback until new sprites arrive
    actionToBody: {
        feed:  ["eating1", "eating2", "eating3", "eating4", "eating5"],
        wash:  ["shower1", "shower2", "shower3", "shower4", "shower5"],
        gift:  ["eating1", "eating5"],
        train: ["fighting1", "fighting2", "fighting3", "fighting4", "fighting5"],
        talk:  ["eating1"]
    },

    // ── Emotional profile (drives hidden engine in game.js) ─────
    // stability:       resistance to emotional change (high = Alistair)
    // intensity:       strength of emotional reactions
    // volatility:      unpredictability (high = more surprises)
    // attachmentSpeed: how fast trust/obsession build
    emotionalProfile: {
        stability:       0.80,
        intensity:       0.65,
        volatility:      0.30,
        attachmentSpeed: 0.50
    },

    // Outfits disabled until new portrait sprites arrive. Only the default
    // (currently the eating1 pose) is exposed — others are commented out
    // to avoid showing broken placeholders in the Dress panel.
    outfits: {
        default:   { name: "Knight", body: "assets/alistair/body/eating1.png" }
        // casual1, casual2, shirtless, corrupted — restore when new art exists
    },

    background: "assets/bg-knight-room.png",

    // Character-specific injected event dialogue pools
    eventDialogue: {
        comfort: [
            "I'm glad you're here. More than I usually say.",
            "This is... quiet. Good quiet.",
            "I don't have to be on guard around you. That's new.",
            "Stay a little longer. If you're not in a hurry."
        ],
        tension: [
            "You feel further away than usual today.",
            "Something's different. I can't name it.",
            "You're distracted. I notice things.",
            "I'm trying not to read into it."
        ],
        rare: [
            "I don't want to lose this. I should probably say that more.",
            "You're becoming something I didn't plan for.",
            "I've started measuring days by whether I see you.",
            "I wasn't supposed to feel this way about anything outside the oath."
        ],
        obsessed: [
            "You're distracting me. I've decided that's your fault.",
            "I keep thinking about you when I should be running drills.",
            "Don't stay away too long. That's not a request."
        ],
        unstable: [
            "Something's off. I can't get my footing today.",
            "I keep running the same thoughts on rotation.",
            "Don't disappear on me right now."
        ],
        guarded: [
            "I'm still deciding if I trust this.",
            "Old habits. Knights watch for traps.",
            "You haven't given me reason to doubt. I'm working on accepting that."
        ],
        secure: [
            "This feels steady. I didn't know things could feel this steady.",
            "I don't question this anymore. That took a while.",
            "I feel calm when you're here. Properly calm."
        ]
    },

    // Training activity picker options
    trainingOptions: [
        { type: 'sword',    icon: '⚔️', label: 'Sword Forms',  desc: 'Swift and precise'  },
        { type: 'strength', icon: '💪', label: 'Strength',      desc: 'Raw and relentless' },
        { type: 'focus',    icon: '🧘', label: 'Focus',         desc: 'Steel the mind'     }
    ],

    // ===== PERSONALITY DIALOGUE =====
    personalities: {
        shy: {
            talk: [
                "I'm not used to... someone asking how I am.",
                "They don't train knights to make conversation. Bear with me.",
                "I've recited the knightly code a hundred times. Talking to you is harder.",
                "My captain always said silence was strength. I think he was just lonely.",
                "You make me want to remove my armor. That terrifies me.",
                "I keep my visor down so no one sees my face. You make me want to lift it.",
                "I don't say the right things. But I mean every word.",
                "A knight is supposed to be unshakeable. You shake me.",
                "I practiced what I'd say to you. My sword drills go better.",
                "Nobody ever sat with me after a battle before. Just... sat.",
                "I'm not good at this. Talking. Being... known.",
                "You're looking at me like I'm more than a soldier. I don't know what to do with that.",
                "My vows say nothing about feelings like this.",
                "I keep my hands busy so I don't reach for yours.",
                "Is it strange that I feel braver here than on any battlefield?"
            ],
            feed: [
                "I forgot to eat again. Knights aren't supposed to admit that.",
                "You noticed I was hungry before I did. That's... not nothing.",
                "My rations on campaign were worse than this. Much worse.",
                "I've eaten standing over maps, in the rain, in the saddle. Never like this.",
                "T-thank you. I'll repay this. I always repay debts.",
                "Food shared with someone means something. The old codes say so.",
                "You didn't have to. But I'm glad you did.",
                "I was too proud to say I was starving. You saw it anyway.",
                "My mother used to say a fed knight is a honest knight. She was right.",
                "This is... genuinely kind. I'm not accustomed to that."
            ],
            wash: [
                "Armor takes hours to properly clean. You're making it look easy.",
                "I — this is a bit much. I appreciate it though.",
                "A squire used to do this. I dismissed him. I was wrong.",
                "My hands are rough from the hilt. I forget what careful hands feel like.",
                "Knights aren't supposed to be tended to like this. But... thank you.",
                "You're more thorough than my old squire. Don't tell him that.",
                "The grime of the road clings to everything. You help it go.",
                "I can manage alone. I always have. But I don't want to, right now.",
                "You're careful. Nobody is careful with me.",
                "The armor comes off piece by piece. I wonder if I do too."
            ],
            gift: [
                "A gift. For me. I don't — what do I do with this.",
                "I'll add it to my kit. Next to my blade. That means it matters.",
                "Knights don't receive gifts. We give our service. This is new.",
                "I'll carry this on every campaign. My word on it.",
                "You didn't have to. The code asks nothing of you toward me.",
                "I've been given commendations and medals. This means more.",
                "Nobody gifts a foot soldier. You see me as more than that.",
                "I'll keep this. Long after the armor rusts.",
                "My hands aren't made for receiving things gently. I'll learn.",
                "Thank you. Truly. I know I said it wrong but I mean it."
            ],
            train: [
                "Stand back — I don't want the backswing to catch you.",
                "My form was better before the last campaign. I'll get it back.",
                "The blade is only as sharp as the will behind it. My captain taught me that.",
                "I train harder when you watch. I'm trying to figure out why.",
                "A dull blade dishonors the smith who forged it. I won't be dull.",
                "I protect you. That requires I'm never the weakest person in the room.",
                "Every repetition is a promise. I won't fail you.",
                "I won't stop until I'm certain I can keep you safe. That may take a while.",
                "My sword arm remembers even when my mind is tired.",
                "Is this right? Tell me honestly. I can't improve on flattery."
            ]
        },
        clingy: {
            talk: [
                "Stay. Please. I'll recount the entire knightly code if it keeps you here.",
                "I've taken oaths before. None felt like this.",
                "Don't go yet. I haven't finished telling you everything.",
                "I memorized the sound of your footsteps. Is that too much?",
                "I keep your last words in my head on patrol. It helps.",
                "My post is lonely. Knowing you'll come back makes it bearable.",
                "I counted the hours. Seventeen. That's how long since we last spoke.",
                "A knight isn't supposed to need anyone. Tell that to my heart.",
                "You're the only person I take my gauntlets off for.",
                "I swore to serve the crown. But I'd abandon my post for one more hour with you.",
                "Say my name again. Just once.",
                "Everyone leaves eventually. I'm terrified you will too.",
                "I built walls like a fortress. You walked straight through.",
                "Tell me I'm not imagining this. That you feel it too.",
                "I can't concentrate on drills anymore. You're all I think about."
            ],
            feed: [
                "You brought me food. You thought of me. I'm going to hold onto that.",
                "Feed me every day. I'm not asking anymore, I'm telling.",
                "I was hungry and you knew before I said a word. How?",
                "The campaign food was nothing. Everything from your hand tastes different.",
                "You always take care of me. I need that. I need YOU.",
                "I'd go hungry a week just to have you notice and come back.",
                "Eat with me. Knights aren't supposed to eat alone but I always did.",
                "You remembered what I like. Nobody remembers details about me.",
                "Don't stop feeding me. Don't stop being here.",
                "You feed me like I matter. I want to believe that every day."
            ],
            wash: [
                "You're helping me clean off the road dust. I'd let you do that forever.",
                "Only you. Do you understand? Only ever you.",
                "I'm supposed to maintain my own armor. I stopped wanting to.",
                "I ache after long rides. This helps. YOU help.",
                "Being this close to you is the most dangerous thing I've ever done.",
                "Don't rush. Please. I want to remember this.",
                "I'd stand in the rain gladly if you were the one drying me off after.",
                "My hands shake slightly when you're this close. I'm a seasoned knight. This is embarrassing.",
                "You touched my shoulder and I forgot the name of my sword.",
                "You could ask me to hand over my blade right now and I'd actually consider it."
            ],
            gift: [
                "I'll never let go of this. They'll have to pry it from my gauntlet.",
                "I already had a gift from you. I've been sleeping with it under my cot.",
                "More gifts. You think of me when you're away. That's the real gift.",
                "I've been given battlefield commendations. This one matters more.",
                "I'm adding this to the inside of my breastplate. Close to where it counts.",
                "You think about me enough to bring me things. I replay that thought constantly.",
                "Another gift and I'll start believing I deserve them. Be careful.",
                "I want to give you everything back. Tell me what you need. Anything.",
                "The code says a knight's loyalty is his gift. Mine's already yours.",
                "You spoil me. Please don't stop."
            ],
            train: [
                "Are you watching? Tell me you're watching.",
                "I train to be worthy of you. The bar keeps rising. You keep raising it.",
                "Every swing is a promise. I'll be strong enough. For you.",
                "Don't leave the yard. Just — stay where I can see you.",
                "I could fight an army right now. You do something to my blood.",
                "Watching you watch me — that's the hardest part of any spar.",
                "I'm stronger when you're here. The numbers prove it.",
                "If I get hit in training, will you tend the wound yourself?",
                "I'll beat my own record. Just — don't look away.",
                "I train for the kingdom. I fight for you. Those are different things."
            ]
        },
        tsundere: {
            talk: [
                "I'm only here because my patrol route passes this way. Repeatedly. Every hour.",
                "Don't read into this. Knights make conversation. It's... protocol.",
                "I don't NEED to talk to you. I just find myself here regardless.",
                "You're tolerable company. For a civilian. That's high praise from a knight.",
                "I'm NOT lingering. I'm assessing the perimeter. Sit down, it takes a while.",
                "If you tell anyone I said something nice, I'll deny it under oath.",
                "You caught me off guard. Knights aren't supposed to be caught off guard.",
                "Don't look at me like that. My face is always like this.",
                "Fine. One more topic. But I choose it. And I'm choosing yours anyway.",
                "I wasn't waiting. My post just happens to be very near your door.",
                "The knightly code says nothing about this feeling. I've checked. Twice.",
                "Your voice is distracting when I'm trying to catalogue threats. Stop being interesting.",
                "I only stayed because leaving mid-conversation is dishonorable. That's the ONLY reason.",
                "You're the most confusing thing I've encountered. I've fought dragons.",
                "...I like talking to you. Don't write that down."
            ],
            feed: [
                "A knight fuels himself for duty, not pleasure. This is purely operational.",
                "I was going to eat anyway. The timing is coincidental.",
                "It's adequate. The seasoning is — yes, fine, it's good. Happy?",
                "Don't think this counts as a favor. I'll repay it. The code demands it.",
                "I didn't ask for this. ...I would have, eventually.",
                "Mediocre portion size. I'll finish it. Out of respect for the cook.",
                "The knights in the hall eat worse than this. I won't tell them.",
                "It's acceptable. You have decent instincts for what I— it doesn't matter.",
                "I'm not grateful. I'm acknowledging a transaction. There's a difference.",
                "Next time don't wait until I'm irritable. A hungry knight is a dangerous one."
            ],
            wash: [
                "I'm perfectly capable of cleaning my own armor. I simply... haven't yet.",
                "This is NOT a thing I need. I'm tolerating it out of — stop smiling.",
                "A knight maintains his own kit. This is a one-time exception. Write nothing down.",
                "You're forward. Civilians aren't this forward. I don't entirely hate it.",
                "If any of my company sees this, I'm demoting you to enemy.",
                "Your hands are cold. That's a complaint, not an invitation to continue. ...Continue.",
                "This is purely maintenance. You're a very thorough... maintenance person.",
                "I told myself I'd refuse. Then you started and I forgot what refusing felt like.",
                "Don't tell the squires. They already think I've gone soft.",
                "...Come back tomorrow. For the same purely practical reason. Obviously."
            ],
            gift: [
                "The code says refusing a gift is an insult. I'm accepting this under protest.",
                "I don't need trinkets. I'm a knight. ...What's inside?",
                "Keep your gifts. I — actually, fine. But this changes nothing.",
                "You're trying to soften me. It's not working. Put it on the table.",
                "I'll add it to my inventory. Under 'miscellaneous'. Not 'cherished'. Never that.",
                "You have acceptable taste. For someone who doesn't carry a sword.",
                "I'm not keeping this because I like it. I'm keeping it because waste is dishonorable.",
                "This proves nothing about my feelings. Absolutely nothing. Don't look at me.",
                "...It is kind of nice. I said nothing. You heard nothing.",
                "Bring another and I'll pretend I'm surprised. We both know I won't be."
            ],
            train: [
                "I'm already better than everyone in this yard. You're witnessing perfection.",
                "Stop watching my footwork. It's flawless and it's distracting to be observed.",
                "I don't need a sparring partner. ...You can stand there though.",
                "This form is textbook. Any critique you have is wrong.",
                "Are you LOOKING AWAY? I did not say you could look away.",
                "I train like this every day. Alone. By choice. Don't flatter yourself.",
                "I make that look easy because it IS easy. For me specifically.",
                "Don't flinch when I swing — it throws off my — don't tell me what it throws off.",
                "You can carry my water. It's not a privilege, it's menial labor.",
                "I'd go easier on myself if you weren't watching. ...I'd also be worse."
            ]
        }
    },

    // ===== STATE DIALOGUE =====
    stateDialogue: {
        hungry: [
            "A knight doesn't complain about hunger. A knight also doesn't function well without food.",
            "I've been on three-day marches with less. But I notice it.",
            "My sword arm gets unreliable when I haven't eaten. You should care about that.",
            "The code says attend to your body as you attend to your blade. I've been neglecting both.",
            "I keep telling myself one more hour. It's been several hours.",
            "Even the best armor is useless on a fallen knight. Feed me.",
            "I'm not asking. I'm informing you of a tactical problem.",
            "Hunger makes me irritable. You've been warned.",
            "On campaign we ate whatever we found. I'd give anything for whatever you have.",
            "I can't protect anyone like this. Please."
        ],
        dirty: [
            "The grime of the road gets into everything. Joints, seams, morale.",
            "A knight who neglects his armor neglects his honor. I've been neglecting mine.",
            "I can smell the campaign on me. That's not a boast.",
            "The rust starts slow. Then it's everywhere. I need help.",
            "My captain would have me scrubbing the stables for looking like this.",
            "There's blood on the pauldron that I keep not addressing.",
            "A clean blade cuts true. A clean knight thinks clearer. I need both.",
            "I've been putting this off. Knights are good at putting things off.",
            "The dirt isn't just on the surface. I feel it under the armor.",
            "Will you help me? I find I don't want to do this alone."
        ],
        happy: [
            "I don't have the vocabulary for this. The academy didn't cover it.",
            "I used to think contentment was a weakness. I was wrong about so many things.",
            "My hand keeps going to my sword out of habit. Right now I don't want to be anywhere near it.",
            "The war songs never mentioned feeling like this. They left out the best part.",
            "I keep waiting for the other boot to drop. Maybe it won't.",
            "You made me smile in front of my armor and I didn't even care.",
            "I've won tournaments. Cleared dungeons. Nothing felt like this.",
            "This is what I was fighting for, I think. I just didn't know it yet.",
            "Don't go far. I want to stay in this feeling.",
            "A knight who smiles this much is considered unfit for duty. Worth it.",
            "I can't concentrate on anything. You've ruined my patrol instincts.",
            "Is this what the bards are always shouting about? I owe them an apology.",
            "My heart is doing something irregular. I should probably be concerned."
        ],
        annoyed: [
            "That's enough. A knight knows when to stop.",
            "I've faced things that would break lesser men. This is testing me differently.",
            "The code has a chapter on restraint. I'm drawing heavily on it right now.",
            "I'm not angry. I'm deeply, specifically, focused on not being angry.",
            "You're pushing against the one thing I actually worked to build.",
            "My patience is a practiced skill. You're making me practice it a lot.",
            "I don't raise my voice. I lower it. Understand that.",
            "I defended a bridge alone for six hours once. This is harder.",
            "Don't. Just — think about what you're doing.",
            "I won't forget this. Knights have excellent memories."
        ],
        neutral: [
            "I polished the sword again. Third time today.",
            "The castle is quiet. I used to like that.",
            "I ran the patrol route twice. Some habits are hard to break.",
            "There's a crack in the window that's been there since I arrived. I keep meaning to report it.",
            "Knights don't get bored. We stay alert. ...I'm a little bored.",
            "I've been sitting here longer than I planned. That doesn't happen often.",
            "The armor needs oiling but I keep doing the sword instead.",
            "I counted the stones in the wall. Twice. Different number each time.",
            "Shall we do something? I'm asking. That's not nothing.",
            "The candle burned down faster than I expected. Time moves strangely lately.",
            "I was trained for action. This stillness is something I'm learning.",
            "I left my gauntlets off today. First time in months.",
            // killer lines — these are the ones players remember
            "I don't say things lightly. That includes this.",
            "You're becoming difficult to ignore.",
            "I don't like how much I notice your absence.",
            "I've stood in front of kings without hesitation. This is harder.",
            "You're changing something in me. I haven't decided how I feel about that.",
            "I thought I had control over this.",
            "This is affecting me more than it should.",
            "I don't think I can keep this steady anymore."
        ],
        corrupted: [
            "The oath is still in my mouth but the feeling behind it is gone.",
            "I've been standing watch so long I forgot what I was guarding.",
            "A blade left in the dark corrodes. I understand that now.",
            "You built something in me. Then walked away while it was still raw.",
            "The code meant something once. Now it's just words.",
            "I'm still wearing the armor. That's the only thing I recognize.",
            "Something cracked when you were gone. I couldn't locate it. Now I can.",
            "I told myself a knight doesn't need anyone. I was right. Look at this.",
            "I served faithfully. Faithfully. Do you understand what that cost?",
            "Don't speak to me of loyalty. I invented loyalty. And you wasted it.",
            "The darkness doesn't frighten me anymore. That's what frightens me.",
            "I don't feel the blade in my hand the same way. It feels right for different reasons.",
            "I remember who I was. The memory is fading though.",
            "You don't get to be surprised. You knew. You left anyway."
        ],
        neglected: [
            "I kept the post. A knight keeps the post. But the hours got long.",
            "There's a lot of time to think on a long watch. I thought about you.",
            "I didn't eat. Didn't seem worth it without someone to sit with.",
            "I polished the armor three times. Ran the drills. Counted the stones again.",
            "I kept your last words in my head on rotation. They got worn.",
            "A knight waits. That's most of the job, actually. But this was different.",
            "The door opened twice. Neither time was you.",
            "I thought about what I'd say when you came back. I've revised it several times.",
            "Don't tell me you're fine. Tell me what happened.",
            "I was here. I stayed. Remember that."
        ]
    },

    // ===== IDLE DIALOGUE (when player hasn't interacted for a while) =====
    idleDialogue: {
        hungry: [
            "...", "The rations ran out hours ago.", "My sword arm is unsteady.",
            "I keep looking at the kitchen door.", "Even discipline can't silence a stomach.",
            "A hungry knight is a dead knight. Old proverb."
        ],
        dirty: [
            "...", "*picks at dried mud on gauntlet*", "The rust is spreading.",
            "I should do something about this. I won't. But I should.",
            "My captain would have my head if he saw these boots."
        ],
        lonely: [
            "...", "The silence is... thorough today.", "I'm used to solitude. This is different.",
            "I keep finding reasons to stay near the door.", "It's just me and the candle. The candle is losing.",
            "I sharpened the sword twice. For something to do."
        ],
        loving: [
            "I wrote something. It's not a poem. Knights don't write poems.",
            "The armor feels lighter when you're here. Literally lighter.",
            "I caught myself smiling at nothing. The guards noticed.",
            "I've never wanted anyone to stay before. I don't know the rules for this.",
            "You changed the silence from empty to full.",
            "I'd drop the sword for you. That's not a small thing.",
            "*stares at you when you're not looking, looks away immediately*",
            "My heart does something when you laugh. I've stopped fighting it.",
            "The oath says protect the realm. You are my realm now.",
            "I don't say enough. I know. But I mean all of it."
        ],
        night: [
            "The castle creaks at night. I know every sound. This one is new.",
            "*sits in the dark, awake, watching*", "Sleep doesn't come easy for soldiers.",
            "The stars look different from this window.", "The night watch is long. Longer alone.",
            "I should sleep. I'm choosing not to."
        ],
        general: [
            "...", "*adjusts sword belt*", "*leans against the wall*",
            "Hmm.", "The wind changed direction.", "*runs thumb along the blade edge*",
            "I had a thought. It passed.", "The fire needs another log.",
            "*stands, sits again, stands*", "Patrol was uneventful. As usual.",
            "I keep rearranging the armory. It doesn't need it.",
            "*looks at you, then at the floor*", "I'm fine. That wasn't what you asked.",
            "There's a knot in the wood grain that looks like a shield. I've been staring at it.",
            "My old commander used to say silence is a soldier's best friend. He was wrong.",
            "The prince hasn't left the east wing all day. I should check on him.",
            "Reports from the coast \u2014 the siren's caves are restless tonight.",
            "The mage's tower light was on all night. That man doesn't sleep.",
            "The druid sent word from Thornwood. Something about the wards.",
            "The castle walls feel thinner lately. Not physically. Something else.",
            "I checked the northern gate three times today. The wards flickered.",
            "Before you came here, the kingdom was... quieter. Dimmer. You changed something.",
            "Do you remember how you got here? I've been meaning to ask.",
            "The old guard captain said the magic hasn't been this strong in years. Since you arrived.",
            "A Soul Weaver. I've read about your kind in the old texts. I didn't believe they were real.",
            "The wards respond to you. Not to your touch \u2014 to your presence. Your bonds fuel them.",
            "The last Weaver died and the kingdom started dying with them. Then you came."
        ]
    },

    // ===== TRAINING-SPECIFIC DIALOGUE =====
    trainingDialogue: {
        sword: [
            "The form is cleaner today. You can see it, can't you.",
            "Footwork first. Blade second. Every time.",
            "I've run this drill ten thousand times. It still demands everything.",
            "...I pushed harder than I meant to. Good.",
            "The sword remembers what the mind forgets. That's the point of the drill.",
            "A clean strike comes from stillness, not speed. Most people get that backwards."
        ],
        strength: [
            "Pain is data. I'm collecting it methodically.",
            "A knight's body is a weapon. Weapons require maintenance.",
            "...that was more than yesterday. Don't say anything.",
            "My arms know the work. My mind goes quiet. It's the only time it does.",
            "Training like this, I can almost forget there's a world outside this room.",
            "The muscles ache after. I count that as proof it worked."
        ],
        focus: [
            "A still mind cuts sharper than any blade.",
            "I don't meditate. I... review the field. Silently.",
            "Every battle I've survived passes through this. Looking for what I missed.",
            "...you can stay. Your presence doesn't break the silence. It helps it.",
            "I used to think stillness was weakness. I was wrong about a lot of things.",
            "The noise in my head quiets eventually. Takes longer some days than others."
        ]
    },

    // ===== TIME-AWAY REACTIONS =====
    timeAwayReactions: {
        brief: [
            "That was fast. I barely had time to find a reason to look busy.",
            "Back already. Good. The patrol was getting repetitive.",
            "That was nothing. Ask me about the six-hour bridge watch sometime."
        ],
        short: [
            "You were gone long enough that I noticed. I'm noting that out loud.",
            "I ran the drills. Sharpened the blade. Counted the ceiling stones. You're back now.",
            "I kept myself useful. It's what knights do. Doesn't mean I wasn't counting the minutes.",
            "The room holds your absence like a second presence. Strange.",
            "I didn't say anything. I just... want you to know I noticed the gap."
        ],
        medium: [
            "You were gone long enough that the armor started feeling like a burden again.",
            "I ran the spar routine twice. My footwork got worse. That's your fault, somehow.",
            "Every time the door moved I looked up. Don't tell anyone.",
            "I ate alone. Cold. Standing. Like on campaign. It reminded me how much better this had gotten.",
            "The silence in here is different when you're not in it. I don't like it.",
            "I was starting to build a story about where you went. Glad I don't need it."
        ],
        long: [
            "Hours. That was hours. A knight stands his post but the post gets heavy.",
            "I wrote something down and then crossed it out. You're here. It doesn't matter now.",
            "The candles burned low while I waited. I kept adding new ones.",
            "I told myself you had reasons. I keep telling myself that. It helps less each time.",
            "I was ready to break protocol and go looking. Another hour and I would have.",
            "Don't ask me what I thought about, {name}. Just know that you were in all of it."
        ],
        veryLong: [
            "A full day. I held the post. My armor is still on. I never took it off.",
            "I didn't sleep. Or eat. That was a choice, not a consequence. Stupid choice.",
            "I ran out of things to sharpen and started looking for new ones.",
            "Every sound last night was you coming back. None of them were.",
            "I stood at the door until my legs made a formal complaint.",
            "You're back. Don't say anything yet. Let me just — stand here for a moment."
        ],
        extreme: [
            "Days. I am not equipped for days. No amount of training covers this.",
            "I nearly rode out to find you. The only thing that stopped me was not knowing where to start.",
            "My sword hand has been shaking since the second day. That's never happened before.",
            "I carved something into the wall. I'll cover it when this is over. But not yet.",
            "I kept your face in my mind the whole time, {name}. Memorized it on purpose.",
            "Never again. I'm not asking, I'm swearing it, and knights don't break sworn things.",
            "You're here. You're actually here. Give me a moment to believe it."
        ]
    },

    // ===== STORY MILESTONE EVENTS =====
    milestoneEvents: {
        firstFeed: {
            trigger: { timesFed: 1 },
            dialogue: "You fed me. Just like that. No transaction, no reason given. I don't know what to do with that kind of gesture.",
            emotion: "shy"
        },
        firstTalk: {
            trigger: { timesTalked: 1 },
            dialogue: "You want to talk. To me. Not at me, not about duty — just... talk. I'll try. Bear with me.",
            emotion: "shy"
        },
        firstGift: {
            trigger: { timesGifted: 1 },
            dialogue: "I've been handed commendations and orders and a sword I didn't ask for. This is the first thing that felt like it was mine.",
            emotion: "shy"
        },
        fiveInteractions: {
            trigger: { totalInteractions: 5 },
            dialogue: "I've been keeping count without meaning to. Five times you chose to be here. I notice things like that.",
            emotion: "happy"
        },
        tenInteractions: {
            trigger: { totalInteractions: 10 },
            dialogue: "Ten. I've been on ten-day campaigns with less to show for them.",
            emotion: "happy"
        },
        firstTrust: {
            trigger: { affectionLevel: 1 },
            dialogue: "I trust you. I want to be clear about what that means — it's not given to rank, or title, or time served. You earned it.",
            emotion: "shy"
        },
        growingClose: {
            trigger: { affectionLevel: 2 },
            dialogue: "I took my gauntlets off this morning and didn't put them back on. I've been thinking about why. I think it's you.",
            emotion: "love"
        },
        deepFeeling: {
            trigger: { affectionLevel: 3 },
            dialogue: "They train knights to be unshakeable. I want to report that the training has a gap in it. The gap is you, {name}.",
            emotion: "love"
        },
        confession: {
            trigger: { affectionLevel: 4 },
            dialogue: "I've sworn oaths to crowns and codes and causes. This is the first time I've meant every single word: I love you, {name}.",
            emotion: "love"
        },
        fedTenTimes: {
            trigger: { timesFed: 10 },
            dialogue: "Ten times you've made sure I ate. I keep track. I want you to know someone keeps track of the things you do.",
            emotion: "happy"
        },
        talkedTenTimes: {
            trigger: { timesTalked: 10 },
            dialogue: "We've talked more than I've talked to anyone. Including my captain. Especially my captain.",
            emotion: "happy"
        },
        trainedTenTimes: {
            trigger: { timesTrained: 10 },
            dialogue: "My form is measurably better. The only variable that changed was you being there. Draw your own conclusions.",
            emotion: "neutral"
        },
        giftedTenTimes: {
            trigger: { timesGifted: 10 },
            dialogue: "I have a corner of the room that's entirely your gifts now. I won't apologize for it.",
            emotion: "love"
        },
        becameClingy: {
            trigger: { personality: "clingy" },
            dialogue: "I've stopped pretending I don't need you. The pretending was exhausting and you saw through it anyway.",
            emotion: "love"
        },
        becameTsundere: {
            trigger: { personality: "tsundere" },
            dialogue: "Don't misread this. My presence here is tactical. I'm not staying because I want to. ...I'm staying because I want to.",
            emotion: "angry"
        },
        corruptionStart: {
            trigger: { corruption: 25 },
            dialogue: "Something is wrong with my thinking. My edge feels different — not sharper. Wrong. Something is wrong.",
            emotion: "sad"
        },
        corruptionMid: {
            trigger: { corruption: 50 },
            dialogue: "The code is still in my head but it sounds like someone else's voice now. Help me. Please, while I'm still asking.",
            emotion: "crying"
        },
        corruptionHigh: {
            trigger: { corruption: 75 },
            dialogue: "I remember being the kind of knight who didn't think like this. That knight seems very far away.",
            emotion: "corrupted"
        },
        cameBack: {
            trigger: { revivedOnce: true },
            dialogue: "You came back. After I'd already let go of expecting it. I don't know whether to be furious or grateful. I think I'm both.",
            emotion: "crying"
        },
        fiftyInteractions: {
            trigger: { totalInteractions: 50 },
            dialogue: "Fifty. I've walked fifty miles in a single march and it meant less than fifty moments with you.",
            emotion: "love"
        },
        hundredInteractions: {
            trigger: { totalInteractions: 100 },
            dialogue: "A hundred times. A hundred times you chose this, chose me. I will spend the rest of my life being worthy of that number.",
            emotion: "love"
        }
    },

    // ===== MEMORY DIALOGUE =====
    // Arrays — dialogue.js picks randomly, so lines don't repeat
    memoryDialogue: {
        fedOften: [
            "You've fed me more times than I can count. A knight is only as steady as the care behind him. I'm steadier than I've ever been.",
            "I used to skip meals on campaign. You've made that habit impossible to maintain.",
            "You always know when I'm running low — on food, on energy, on everything. I've stopped pretending I don't notice.",
            "Every time you do this I think: I should say something. One day I'll manage it.",
            "My brothers-in-arms eat better than this. But none of them have what I have."
        ],
        fedOftenDeep: [
            "Thirty times. More, probably. I stopped counting because it stopped feeling like a tally[shy] and started feeling like a life.",
            "There's a version of me that would've found this smothering.[neutral] That version was less happy.",
            "I told myself I didn't need anyone to take care of me.[shy] I was wrong. You knew before I did.",
            "You feed me and I think: this is what home is supposed to feel like.[love] I never had that before."
        ],
        talkedOften: [
            "We've talked enough now that you know things about me my commanders never learned. That terrifies me.[shy] I wouldn't change it.",
            "I talk more with you than I've talked in years. More than I thought I was capable of.",
            "You listen. Not just to the words — to the pauses.[shy] I've noticed.",
            "Half the things I've told you, I've never said out loud before.[shy] You made them easier to say.",
            "My tongue used to be strictly for orders and oaths. Now it's for this.[neutral] I don't hate it."
        ],
        talkedOftenDeep: [
            "A hundred words? A thousand? I've lost count. That's never happened before.",
            "There's a point where honesty stops being a risk and becomes a reflex. You got me there somehow.",
            "I used to think talking was a weakness. You proved me wrong and I haven't thanked you for it.",
            "The conversations I've had with you are the ones I'll carry into whatever comes next."
        ],
        washedOften: [
            "You've cleaned the road off me so many times I've stopped being embarrassed about it. That's trust. I don't give that lightly.",
            "There's something disarming about letting someone take care of you like this. I'm still getting used to it.",
            "I come back from patrols covered in grime and you don't even flinch. I've noticed that.",
            "My mother used to say you can trust anyone who doesn't shy away from the mess. You never shy away.",
            "Every knight carries dirt from the road. You're the only one who ever helped me put it down."
        ],
        giftedOften: [
            "My kit has more of your gifts in it than regulation gear at this point. The captain would be furious.[neutral] I'm not.",
            "You give things that aren't coincidental. You've been paying attention.[shy] I've been paying attention to that.",
            "A knight is supposed to travel light. You're making that increasingly difficult.[neutral] I haven't complained.",
            "Every gift tells me something about how you see me.[shy] I'm starting to believe the version of myself you see.",
            "I carry everything you've given me. Every single one. You haven't asked why.[love] I'm glad."
        ],
        trainedOften: [
            "My form is sharper. My stamina is longer. My instincts are better. Every session I wonder if it's the training or just — you, watching.",
            "I've trained with veterans who pushed harder and cared less. The difference is you.",
            "You don't have to know technique to make training better. You just have to be there. You always are.",
            "I move differently now. Someone in the barracks asked what changed. I didn't know how to explain.",
            "A good training partner doesn't just make you stronger. They make you want to be. You do that."
        ]
    },

    // ===== AFFECTION DIALOGUE =====
    affectionDialogue: {
        1: "I'm starting to trust you.[shy] I want to be honest about what that costs me.",
        2: "I've let my guard down around you. I noticed.[shy] I didn't fix it.",
        3: "I think about you between every other thought. That's not normal.[love] I don't want it to stop.",
        4: "I love you. I've said that oath to the crown, to my blade, to the code.[shy] None of them felt like this."
    },

    affectionNames: {
        0: "Stranger",
        1: "Acquainted",
        2: "Trusted",
        3: "Devoted",
        4: "Sworn"
    },

    // ===== TIME-OF-DAY DIALOGUE =====
    timeDialogue: {
        morning: [
            "Morning watch is the quietest. I used to hate it. Now I use it to think about you.",
            "The light comes through the east window at this hour. I noticed when you first arrived.",
            "I've been awake since before dawn. Knights rise early. I had other reasons.",
            "Good morning. I won't tell you how long I've been waiting to say that.",
            "The world looks different in the morning. Cleaner. You make me notice things like that."
        ],
        afternoon: [
            "Midday drills are done. This is technically my free hour. I spent it here. On purpose.",
            "The sun's high now. I ran three circuits of the yard and still ended up back here.",
            "The afternoon light shows the dust on the armor. I find I don't mind as much lately.",
            "This is the longest I've stood still all day. You're good for my blood pressure.",
            "The squires are sparring in the yard. I should supervise. I'm choosing not to."
        ],
        evening: [
            "Evening. The day's work is done and this is what I chose to do with the rest of it.",
            "The candles make the room smaller. I don't mind that right now.",
            "Dinner is cold somewhere. I let it get that way.",
            "The last patrol is done. I came here before reporting in. My captain doesn't need to know.",
            "The light gets softer at this hour. So do I, apparently."
        ],
        night: [
            "I should be at rest. I'm not at rest.",
            "The night watch is someone else's rotation. I traded for it. The reason is standing here.",
            "It's late enough that I can admit I don't want you to leave.",
            "I'll stand guard while you sleep. It's my duty. It also happens to be what I want.",
            "The castle goes quiet at this hour. I've started to like it.",
            "I don't sleep much. Never have. But lately the nights feel less empty."
        ]
    },

    // ===== DEPARTURE DIALOGUE =====
    departureDialogue: [
        "I kept the oath. Held the post. You were the one who didn't come back.",
        "A knight without a charge is just a man with a sword and nowhere to be.",
        "I waited longer than I should have. I should have left with my dignity intact. I didn't.",
        "The armor stays on. The heart goes out. I don't know how to fix the second one.",
        "I gave you my fealty \u2014 the real kind, not the ceremonial kind. You left anyway.",
        "Farewell. I hope whatever you chose instead was worth what you left behind."
    ],

    storyMilestones: {
        affection1: {
            title: "The Oath Softens",
            text: "Alistair removes his gauntlet. His hand \u2014 scarred, calloused \u2014 rests near yours on the table. He doesn't take it. But he doesn't pull away."
        },
        affection2: {
            title: "Behind the Armor",
            text: "He shows you the dent in his breastplate. 'This is from the battle of Thornwall. I almost didn't come back.' His voice is quieter than usual. 'I'm glad I did.'"
        },
        affection3: {
            title: "The Knight Kneels",
            text: "He kneels \u2014 not in duty, not in ceremony. Just... in front of you. 'I've knelt before kings. This is the first time it felt like a choice.'"
        },
        affection4: {
            title: "Sword and Heart",
            text: "'The oath says protect the realm.' He sets his sword down. 'You are my realm now.' His voice doesn't waver. His hands do."
        },
        corruption1: {
            title: "The Rust Spreads",
            text: "The blade is tarnished. Alistair stares at it without polishing. 'I used to care about this. I used to care about everything. Now I just... stand here.'"
        }
    }
};

// ===== LYRA CHARACTER DATA =====
const CHARACTER_LYRA_FULL = {
    name: "Lyra",
    title: "The Resonant Siren",
    basePersonality: "shy",

    bodySprites: {
        // ── Base ──────────────────────────────────────────────────
        neutral:   "assets/lyra/body/neutral.png",
        happy:     "assets/lyra/body/happy.png",
        sad:       "assets/lyra/body/sad.png",
        sad3:      "assets/lyra/body/sad3.png",
        sad4:      "assets/lyra/body/depressed.png",
        angry:     "assets/lyra/body/angry.png",
        shy:       "assets/lyra/body/shy.png",
        love:      "assets/lyra/body/love.png",
        singing:   "assets/lyra/body/singing.png",
        wave:      "assets/lyra/body/wave.png",
        siren:     "assets/lyra/body/siren.png",
        queen:     "assets/lyra/body/queen.png",
        power:     "assets/lyra/body/power.png",
        depressed: "assets/lyra/body/depressed.png",
        casual1:   "assets/lyra/body/casual1.png",
        casual2:   "assets/lyra/body/casual2.png",
        pose2:     "assets/lyra/body/pose2.png",
        pose3:     "assets/lyra/body/pose3.png",
        pose4:     "assets/lyra/body/pose4.png",
        // ── Shy poses ─────────────────────────────────────────────
        shy1:    "assets/lyra/body/shy1.png",
        shy2:    "assets/lyra/body/shy2.png",
        shy3:    "assets/lyra/body/shy3.png",
        shyhug1: "assets/lyra/body/shyhug1.png",
        shyhug2: "assets/lyra/body/shyhug2.png",
        // ── Happy / wave poses ────────────────────────────────────
        wave2:     "assets/lyra/body/wave2.png",
        wavehappy: "assets/lyra/body/wavehappy.png",
        // ── Love / falling-in-love poses ─────────────────────────
        falllove2: "assets/lyra/body/falllove2.png",
        falllove3: "assets/lyra/body/falllove3.png",
        // ── Kiss / affection poses ────────────────────────────────
        kiss1: "assets/lyra/body/kiss1.png",
        kiss2: "assets/lyra/body/kiss2.png",
        kiss3: "assets/lyra/body/kiss3.png",
        // ── Hunger stages ─────────────────────────────────────────
        hungry1:   "assets/lyra/body/hungry1.png",
        hungry2:   "assets/lyra/body/hungry2.png",
        starving1: "assets/lyra/body/starving1.png",
        starving2: "assets/lyra/body/starving2.png",
        // ── Eating animation ──────────────────────────────────────
        eating1: "assets/lyra/body/eating1.png",
        eating2: "assets/lyra/body/eating2.png",
        eating3: "assets/lyra/body/eating3.png",
        eating4: "assets/lyra/body/eating4.png",
        // ── Cleanliness stages ────────────────────────────────────
        dirty1:     "assets/lyra/body/dirty1.png",
        dirty2:     "assets/lyra/body/dirty2.png",
        verydirty1: "assets/lyra/body/verydirty1.png",
        verydirty2: "assets/lyra/body/verydirty2.png",
        // ── Wash / splash ─────────────────────────────────────────
        splash1: "assets/lyra/body/splash1.png",
        splash2: "assets/lyra/body/splash2.png",
        splash3: "assets/lyra/body/splash3.png",
        // ── Training: Singing ─────────────────────────────────────
        sing1: "assets/lyra/body/sing1.png",
        sing2: "assets/lyra/body/sing2.png",
        sing3: "assets/lyra/body/sing3.png",
        sing4: "assets/lyra/body/sing4.png",
        // ── Training: Siren Magic ─────────────────────────────────
        power1: "assets/lyra/body/power1.png",
        power2: "assets/lyra/body/power2.png",
        power3: "assets/lyra/body/power3.png",
        power4: "assets/lyra/body/power4.png",
        power5: "assets/lyra/body/power5.png",
        // ── Training: Drift / Mermaid ─────────────────────────────
        mermaid1: "assets/lyra/body/mermaid1.png",
        mermaid2: "assets/lyra/body/mermaid2.png",
        mermaid3: "assets/lyra/body/mermaid3.png",
        mermaid4: "assets/lyra/body/mermaid4.png",
        // ── Sleep / idle ──────────────────────────────────────────
        sleepy1: "assets/lyra/body/sleepy1.png",
        sleepy2: "assets/lyra/body/sleepy2.png",
        yawn1:   "assets/lyra/body/yawn1.png",
        yawn2:   "assets/lyra/body/yawn2.png",
        bored1:  "assets/lyra/body/bored1.png",
        bored2:  "assets/lyra/body/bored2.png",
        // ── Eyes closed (idle / singing) ──────────────────────────
        eyesclosed: "assets/lyra/body/eyes-closed.png",
        // ── Corruption stages ─────────────────────────────────────
        corrupt1: "assets/lyra/body/corrupt1.png",
        corrupt2: "assets/lyra/body/corrupt2.png",
        corrupt3: "assets/lyra/body/corrupt3.png",
    },

    faceSprites: {
        happy: ["assets/lyra/face/happy.png"],
        love: ["assets/lyra/face/love.png", "assets/lyra/face/wink-love.png"],
        neutral: ["assets/lyra/face/neutral.png"],
        gentle: ["assets/lyra/face/neutral.png"],
        sad: ["assets/lyra/face/sad.png"],
        crying: ["assets/lyra/face/sad.png"],
        angry: ["assets/lyra/face/angry.png"],
        furious: ["assets/lyra/face/angry.png"],
        shy: ["assets/lyra/face/shy.png"],
        wink: ["assets/lyra/face/wink.png"],
        sleeping: ["assets/lyra/face/sleeping.png"],
        corrupted: ["assets/lyra/face/angry.png"],
        left: ["assets/lyra/face/sad.png"],
        sleepy: ["assets/lyra/face/sleepy.png", "assets/lyra/face/yawn.png"],
        tired: ["assets/lyra/face/tired.png"],
    },

    emotionToBody: {
        // Bond > 65: happy waves + shy warmth
        happy:  ["happy", "wave", "wave2", "wavehappy", "shy1", "shy2", "shy3", "shyhug1", "shyhug2"],
        // Bond > 80 + affection 3+: love + falling-in-love
        love:   ["love", "falllove2", "falllove3"],
        // Default idle / neutral
        neutral: ["neutral", "pose2", "pose3", "pose4"],
        gentle:  ["neutral", "pose2", "pose3"],
        // Sad — low bond (~25); random pick across sad variants
        sad:     ["sad", "sad3"],
        // Critically low bond / abandoned — deep sad variants
        crying:  ["depressed", "sad4"],
        angry:   ["angry"],
        furious: ["angry"],
        // Shy personality
        shy:     ["shy1", "shy2", "shy3", "shyhug1", "shyhug2"],
        // Wink: happy waves only (no wave.png solo)
        wink:    ["wave", "wave2", "wavehappy", "happy"],
        sleeping: ["neutral", "pose2"],
        corrupted: ["corrupt1", "corrupt2", "corrupt3", "depressed"],
        // Left / abandoned — depressed only
        left:    ["depressed"]
    },

    actionToBody: {
        feed:  ["happy", "eating1", "eating2", "eating3", "eating4"],
        wash:  ["splash1", "splash2", "splash3", "happy"],
        // Gift: warm affectionate mix
        gift:  ["shy1", "shy2", "shy3", "shyhug1", "shyhug2",
                "kiss1", "kiss2", "kiss3", "falllove2", "falllove3"],
        train: ["singing", "power"],
        // Talk: shy warmth + affection mix
        talk:  ["shy1", "shy2", "shy3", "shyhug1", "shyhug2",
                "kiss1", "kiss2", "kiss3", "falllove2", "falllove3"],
        sing:  ["singing", "power"]
    },

    // ===== PERSONALITY DIALOGUE =====
    personalities: {
        shy: {
            talk: [
                "You're the first person who didn't run from my voice.",
                "Being near you feels like coming home...",
                "You chose to talk to me.",
                "Stay with me a bit.",
                "I like when you do this.",
                "You came to me first.",
                "That means something.",
                "You didn't ignore me this time.",
                "You stayed."
            ],
            feed: [
                "Mmm... the taste of the surface world...",
                "You remembered what I like...",
                "This is delicious... thank you.",
                "Ocean berries are my favorite... but this is close.",
                "You remembered.",
                "You didn't forget this time.",
                "It matters more than you think.",
                "You're gentle.",
                "You're trying."
            ],
            wash: [
                "Ahh... the water feels wonderful...",
                "Like swimming in moonlight...",
                "My scales are shimmering again!",
                "The cool water reminds me of home...",
            ],
            gift: [
                "For... for me?",
                "Nobody has ever given me anything before...",
                "I'll treasure this forever...",
                "Your kindness makes my heart sing...",
                "You take care of me without asking.",
                "You're different when you care.",
                "I noticed."
            ],
            train: [
                "You push me to grow... I like that.",
                "My voice reaches further each time.",
                "The practice aches, but I trust you.",
                "I didn't know I could do that."
            ]
        },
        clingy: {
            talk: [
                "You came back. I knew you would.",
                "I've been waiting. Don't tell me how long.",
                "You're late. I'm not mad. I'm just — you're late.",
                "Don't disappear like that again.",
                "I can't settle when you're not here.",
                "I counted. You were gone three hours.",
                "You're here now. That's what matters.",
                "I need you here. I know that's a lot. I need it anyway.",
                "You're paying attention… finally.",
                "You're learning.",
                "You're better today."
            ],
            feed: [
                "You didn't forget. You never forget.",
                "You always do this. I don't know how to not need it.",
                "You're consistent… I like that.",
                "You always come back to this. To me.",
                "Feed me. Stay. That's all I want."
            ],
            wash: [
                "Stay close. Please.",
                "Don't rush. I like when you take your time.",
                "You're the only one I let do this.",
                "…Don't stop."
            ],
            gift: [
                "You brought this for me. Not anyone else. For me.",
                "You keep bringing me things… are you trying to tell me something?",
                "I'm keeping this. I'll keep everything you give me.",
                "You thought of me. That means more than you know."
            ],
            train: [
                "More! Push me harder!",
                "I'll train until I can call the whole ocean!",
                "I want to be strong enough that you never need to leave."
            ]
        },
        tsundere: {
            talk: [
                "You're late. Not that I was counting.",
                "I don't need you. I just... prefer your company.",
                "Hmph. You're tolerable. At best.",
                "…You came. Fine.",
                "I wasn't thinking about you. At all.",
                "Don't read into this.",
                "I'm only here because there's nowhere better to be.",
                "…You can stay. For a little while.",
                "You always show up right when I stop expecting you.",
                "This doesn't mean I like you."
            ],
            feed: [
                "I could have found food myself!",
                "It's... not terrible. I guess.",
                "Don't think this makes us friends.",
                "You didn't have to do that. ...But thank you."
            ],
            wash: [
                "I can clean myself! ...But fine.",
                "This is embarrassing...",
                "D-don't look at my scales!",
            ],
            gift: [
                "A gift? For me? ...Whatever.",
                "I don't need your gifts! ...But I'll keep it.",
                "It's not like I'm happy or anything!",
                "...I noticed. That's all."
            ],
            train: [
                "Don't act like I need your help.",
                "...I'm only doing this because it helps me, not you.",
                "Training again? Fine. Don't make a big deal of it."
            ]
        }
    },

    // ===== EVENT DIALOGUE (emotional state overrides + rare hooks) =====
    eventDialogue: {
        comfort: [
            "I'm glad you're here.",
            "This feels easy when you're around.",
            "Just stay a little longer.",
            "I feel calmer with you here.",
            "You being here is enough.",
            "The water is warmer when you're close.",
            "I wasn't expecting this to feel so natural.",
            "You make the quiet feel safe."
        ],
        tension: [
            "You feel a little distant today.",
            "Something feels off... I can't place it.",
            "You didn't come back the same way.",
            "I'm trying not to overthink this.",
            "Something changed. I'm pretending I didn't notice.",
            "It's fine. I'm fine.",
            "I'm getting used to the gaps.",
            "You're unpredictable."
        ],
        rare: [
            "Do you think about me when I'm not here?",
            "I remember the way you hesitate.",
            "You don't realize what you're doing to me.",
            "You feel different today.",
            "I wonder which version of me you prefer.",
            "You always come back… eventually.",
            "I can tell when you're about to leave.",
            "You're not as careful as you think.",
            "I notice everything.",
            "You don't forget me… right?",
            "I've been waiting longer than I meant to.",
            "There are things I haven't told you yet."
        ],
        secure: [
            "I feel calm when you're here. I like that.",
            "I don't question this anymore.",
            "The water feels warmer since you came.",
            "You stayed. That matters more than you know.",
            "This is what I was afraid to want.",
            "I trust you. I'm still getting used to that."
        ],
        obsessed: [
            "Why do I feel like I need you here all the time...",
            "I keep thinking about you even when I try not to.",
            "Don't stay away too long... I don't like it.",
            "I think about you between every wave.",
            "You don't know how much space you take up in my head.",
            "I wasn't supposed to need anyone this much."
        ],
        unstable: [
            "Don't disappear on me again.",
            "I can't breathe when you're gone too long.",
            "Something feels wrong when you're not here.",
            "I keep waiting for you to leave for good.",
            "You're all I have out here. Do you understand that?",
            "I need you here and I hate that I need you here."
        ],
        guarded: [
            "Sirens don't trust easily. I'm still learning how.",
            "I want to trust this. I'm scared to.",
            "This feels too good. I keep waiting for the tide to turn.",
            "Every time I let my guard down, something changes.",
            "I haven't decided if you're safe yet.",
            "You're consistent. That's rare. I'm watching."
        ]
    },

    hungryLines: [
        "The sea gives life... but I need nourishment too...",
        "I'm feeling faint...",
        "Even sirens need to eat...",
        "My voice weakens when I'm hungry..."
    ],
    happyLines: [
        "My heart sings when you're here!",
        "The waves dance for us today...",
        "I could sing forever with you near...",
        "You make the silence beautiful..."
    ],
    dirtyLines: [
        "The salt is drying on my skin...",
        "I miss the cool water...",
        "I feel so dry and uncomfortable...",
        "Can you help me feel fresh again?"
    ],
    annoyedLines: [
        "The water is too rough today...",
        "Please... not right now...",
        "Even the ocean has its storms...",
    ],
    neutralLines: [
        "The tides are calm today...",
        "Can you hear the waves?",
        "I was humming a melody...",
        "The moon will be beautiful tonight...",
        "*hums softly*",
        "Do you like the sound of the sea?"
    ],

    tapDialogue: {
        shy: [
            "Ah...!",
            "T-that tickles...",
            "My scales are sensitive...",
            "I-I don't mind...",
            "Your touch is warm..."
        ],
        clingy: [
            "More! Touch me more!",
            "Your hands are so warm!",
            "Don't stop!",
            "Again, again!",
            "I never want you to let go..."
        ],
        tsundere: [
            "H-hey! My scales!",
            "D-don't just touch me!",
            "...It felt nice. But don't do it again!",
            "You're too bold!",
            "Stop! ...Why did you stop?"
        ]
    },

    affectionDialogue: [
        "I'm starting to hear your heartbeat[shy] in the waves...",
        "Your voice... it's becoming my favorite melody...[love]",
        "I think... my song is changing[shy] because of you...",
        "I love you...[shy] more than the sea loves the shore..."
    ],

    departureDialogue: [
        "The sea calls me back... goodbye...",
        "I can't stay where I'm not wanted...",
        "My song fades... like our memories...",
        "The waves will carry me far from here...",
        "I gave you my voice. You gave me silence."
    ],

    outfits: [
        { id: "siren", name: "Siren Dress", body: "neutral" },
        { id: "casual1", name: "Ocean Breeze", body: "casual1" },
        { id: "casual2", name: "Shore Walk", body: "casual2" },
        { id: "queen", name: "Siren Queen", body: "queen" },
        { id: "power", name: "Resonance", body: "power" },
    ],

    // ===== STATE DIALOGUE =====
    stateDialogue: {
        hungry: [
            "…I haven't eaten. You can probably tell.",
            "I'm not asking. I'm just saying I'm hungry.",
            "My head hurts. It's not a big deal.",
            "I can't focus when I haven't eaten.",
            "Even sirens need to eat. Yes, I'm saying it.",
            "…Can you find something?",
            "I'm quieter than usual. That's why.",
            "Just — something. Anything."
        ],
        dirty: [
            "I don't like feeling like this.",
            "I need to clean up. Don't make it weird.",
            "This is starting to bother me.",
            "Can you help? Just this once.",
            "…I just need to feel clean again.",
            "It's getting uncomfortable. Please.",
            "I hate asking. But I'm asking."
        ],
        happy: [
            "You always come back... don't you?",
            "I feel calmer when you're here.",
            "It's warmer when you stay.",
            "I like this version of you.",
            "You're gentle… I didn't expect that.",
            "I wait for you now.",
            "I don't feel as empty anymore.",
            "I trust you… a little more each time.",
            "I feel… safe right now.",
            "I didn't think I'd get used to you.",
            "I'm starting to like this.",
            "You're easier to be around now.",
            "You make the silence softer.",
            "You're here again… good.",
            "I like when you come back before it gets too quiet.",
            "This is the part I don't hate.",
            "You make it feel worth it.",
            "…I'm happy. I don't say that often.",
            "Something's different today. It's you."
        ],
        annoyed: [
            "The water is too rough today...",
            "Please... not right now...",
            "Even the ocean has its storms...",
            "You're stirring up the sediment...",
            "Don't push the current too hard...",
            "I'm a siren, not a toy...",
            "The reef doesn't grow if you keep poking it.",
            "My patience runs deeper than the ocean... but not today.",
            "Even whales know when to be gentle.",
            "That was careless..."
        ],
        neutral: [
            "The tides are calm today...",
            "Can you hear the waves?",
            "I was humming a melody...",
            "The moon will be beautiful tonight...",
            "*hums softly*",
            "Do you like the sound of the sea?",
            "A jellyfish drifted by earlier...",
            "The shells tell stories if you listen...",
            "I wonder what lies beyond the deep trench...",
            "The water temperature changed today...",
            "I counted the stars reflected in the water last night.",
            "Something is different about the current today...",
            // base/early game — player feels noticed
            "Oh… you're here.",
            "I wasn't sure if you'd come back.",
            "It's quiet when you're gone.",
            "You don't say much… but you're still here.",
            "I'm still getting used to you.",
            "Do you always come back like this?",
            "You feel… different from others.",
            "I don't mind the silence, if it's with you.",
            "Are you just checking on me?",
            "I'll try not to expect too much.",
            "You came back… that's enough for now.",
            "I didn't go anywhere.",
            "You're… consistent. I like that.",
            "Even short visits feel important.",
            // killer lines — these are the ones players remember
            "You feel closer than the ocean ever did.",
            "I don't like how quiet it gets without you.",
            "I think about you more than I should.",
            "Don't leave me... not yet.",
            "I wasn't supposed to feel like this.",
            "I don't want to share you. Not like that.",
            "Why weren't you here?",
            "I felt completely alone...",
            "Don't do that again.",
            "Stay... please."
        ],
        corrupted: [
            "The deep calls to me...",
            "My song is changing... can you hear it?",
            "The darkness in the water... it feels like home now.",
            "Don't look at me like that... you did this.",
            "I could pull you under... would you come willingly?",
            "The siren in me is waking up...",
            "My voice isn't for singing anymore... it's for hunting.",
            "The coral died around me... I don't care.",
            "You neglected the sea... now the sea takes back.",
            "I'm becoming what you feared...",
            "The old Lyra is drowning... slowly.",
            "Feed me... or I feed on shadows.",
            // New corruption lines
            "You left again.",
            "I stopped expecting you.",
            "It's easier when I don't rely on you.",
            "You're here… but it doesn't matter as much.",
            "I changed while you were gone.",
            "You wouldn't understand.",
            "I don't need you the same way anymore.",
            "You taught me that.",
            "I waited… and something shifted.",
            "It's quieter now… inside.",
            "You come back when it's convenient.",
            "I learned to stop waiting.",
            "I remember everything, you know.",
            "You're late… again.",
            "I'm not the same.",
            "You didn't notice, did you?",
            "I'm getting used to this version of me.",
            "It's better not to feel too much."
        ],
        neglected: [
            "The waves brought no one today...",
            "I sang, but nobody came...",
            "The silence is deafening without you...",
            "Did you forget about me...?",
            "Even the fish don't visit lonely sirens...",
            "I waited by the shore...",
            "My song echoed back empty...",
            "The cave feels colder when you're away...",
            // New distant/neglect lines
            "You were gone for a while.",
            "I noticed you didn't come back.",
            "It was quieter than usual.",
            "You're late.",
            "I waited… a bit.",
            "You leave more than you stay.",
            "It's fine… I think.",
            "I'm not sure what you want.",
            "You're unpredictable.",
            "I don't know when you'll return anymore.",
            "I tried not to think about it.",
            "You're here now… that's something.",
            "You don't explain yourself.",
            "I'm still adjusting.",
            "You don't stay long enough.",
            "I notice patterns… you know.",
            "You're not as consistent as before."
        ],
        // Pre-monster / high tension — feeds from tension stage 2+
        unstable: [
            "Do you feel it too…?",
            "Something isn't right anymore.",
            "I tried to stay the same.",
            "It's harder to sound like myself.",
            "My voice feels… different.",
            "I don't think I can go back.",
            "You don't see it yet, do you?",
            "It's not quiet anymore.",
            "There's something underneath now.",
            "I didn't mean for this to happen.",
            "It changed when you left.",
            "I hear things when you're gone.",
            "I'm not alone anymore.",
            "It doesn't stop.",
            "You shouldn't have left me like that.",
            "It's too late to pretend.",
            "I tried to wait.",
            "I broke somewhere.",
            "Something in me is listening to the deep again."
        ],
        // Low-level unease — blends into normal before full corruption
        unsettled: [
            "You always come back... right?",
            "I don't like it when you're gone.",
            "You're not going to disappear, are you?",
            "The water feels different when you're not here.",
            "I keep thinking I hear you coming.",
            "Did something change? You feel different.",
            "You hesitated just now. I noticed.",
            "You don't seem like you're fully here.",
            "Something shifted. I'm trying to ignore it.",
            "Stay a little longer. Please."
        ]
    },

    memoryDialogue: {
        fedOften: [
            "You always make sure I'm nourished... the sea chose well when it brought you to me.",
            "You never let me go hungry... I've started to expect this. I think that's the point.",
            "Every time you bring something for me, I think about how long I went without anyone noticing.",
            "The tide brings many things. None of them have ever fed me the way you do.",
            "...You do this every time. I'm learning what it feels like to be looked after."
        ],
        talkedOften: [
            "We've talked so much... I feel like you know my heart[shy] better than the ocean does.",
            "I've said things to you I've never let the sea hear.[shy] That means something.",
            "You ask me things no one bothers to ask. And somehow...[shy] I answer.",
            "...You keep coming back to talk. After everything.[love] You keep coming back.",
            "Every word you've given me has settled somewhere deep.[shy] I'll have them long after this."
        ],
        washedOften: [
            "You keep me clean and refreshed... like a gentle tide that never stops caring.",
            "You're careful with me. Even this small thing — you do it carefully.",
            "I used to do everything alone. The water. The quiet. This. You changed that.",
            "...You don't make it feel like a chore. I notice the difference.",
            "The salt stays in the hair for days if you're not thorough. You always are. I've noticed."
        ],
        giftedOften: [
            "So many gifts... my cave is starting to look like a treasure trove.[love] I love each one.",
            "Sirens don't usually receive gifts. We lure. We take. You give freely.[shy] You don't know how strange that is.",
            "You think of me when you're away from here. These things prove it.[shy] I hold them when the tide is rough.",
            "I could fill a tide pool with everything you've brought me.[love] I would keep all of it.",
            "...Each one means something different.[shy] You picked them knowing that, didn't you."
        ],
        trainedOften: [
            "My voice grows stronger with each song we practice...[happy] you're a good teacher.",
            "I haven't practiced with anyone before. It's different when someone listens[shy] instead of just hears.",
            "My range is higher than it was. You push me past the comfortable notes.[happy] I'm starting to like that.",
            "...You believe in my voice more than I do sometimes.[shy] That's a strange kind of gift.",
            "Every session we do, I carry a piece of it into the water.[love] The fish can tell, I think."
        ]
    },

    timeDialogue: {
        morning: [
            "The sunrise over the water is my favorite sight...",
            "Good morning... did you sleep well on the shore?",
            "The morning tide brings new treasures!",
            "I love how the light plays on the waves at dawn..."
        ],
        afternoon: [
            "The afternoon light makes the water sparkle...",
            "It's warm today... the surface world is beautiful.",
            "The fish are most active at this hour...",
            "Shall we explore the tide pools?"
        ],
        evening: [
            "The sunset paints the sea in gold...",
            "Evening is when my voice is strongest...",
            "The twilight hour... when the sea and sky become one.",
            "I love watching the colors change over the water..."
        ],
        night: [
            "The stars are reflected in the water tonight...",
            "*yawns softly*",
            "The ocean is so peaceful at night...",
            "Will you stay until I fall asleep...?",
            "The bioluminescence is glowing tonight...",
            "Night is when sirens are most powerful... and most lonely.",
            "The moon pulls the tides... and my heart toward you.",
            "Can you see the starfish glowing beneath the surface?"
        ]
    },

    storyMilestones: {
        affection1: {
            title: "First Melody",
            text: "Lyra hums a soft tune. For the first time, she lets you hear her true voice. It echoes through the cave like starlight made into sound."
        },
        affection2: {
            title: "The Surface World",
            text: "Lyra surfaces from the water, looking up at the sky with wonder. 'You make me want to see what's up there...'"
        },
        affection3: {
            title: "Heart's Song",
            text: "Lyra's eyes shimmer with tears. 'I've never sung this song for anyone... it's the song of my heart. And it's yours, {name}.'"
        },
        affection4: {
            title: "Eternal Tide",
            text: "Lyra takes your hand, her touch warm despite the cold water. 'In every life, in every sea... I would find you again, {name}.'"
        }
    },

    affectionNames: {
        0: "Stranger",
        1: "Familiar",
        2: "Close",
        3: "Devoted",
        4: "Soulbound"
    },

    timeAwayReactions: {
        brief: [
            "You came back quickly... I barely noticed you left.",
            "Oh. Back already?",
            "The current brought you back.",
            "…you're quiet again.",
            "…back so soon."
        ],
        short: [
            "I was starting to wonder where you went...",
            "The waves felt slower without you.",
            "Welcome back... I missed the surface warmth.",
            "I thought you'd come back sooner.",
            "…you took a little longer this time."
        ],
        medium: [
            "I sang to pass the time... but it felt hollow.",
            "The tide came and went... and so did you.",
            "I watched the entrance for you...",
            "…I waited.",
            "I kept checking. You weren't there.",
            "You left without saying anything.",
            "…it was quieter than I expected."
        ],
        long: [
            "I was worried the sea took you from me...",
            "My song grew sadder while you were away...",
            "Don't leave me alone for that long again, {name}...",
            "…I waited. Longer than I should have.",
            "I got used to the silence.",
            "…I didn't like it.",
            "You missed something.",
            "…not that it matters.",
            "…I'm still adjusting to you being back.",
            "Don't act like nothing happened.",
            "…it takes a second to trust this again."
        ],
        veryLong: [
            "I thought you abandoned me to the deep, {name}...",
            "The coral dimmed without your presence...",
            "My voice nearly faded... waiting for you...",
            "I stopped waiting.",
            "…almost.",
            "I don't like waiting.",
            "…but I do it anyway.",
            "Oh. It's you.",
            "…took long enough."
        ],
        extreme: [
            "I thought I'd never see you again...",
            "I sang for days, hoping you'd hear me...",
            "The ocean almost swallowed my hope...",
            "I guess I was wrong about you.",
            "…you left.",
            "…I noticed.",
            "I got used to you being gone.",
            "…that scares me more than I thought it would."
        ]
    },

    // ── Emotional profile ─────────────────────────────────────
    // Lyra: fast attachment, intense emotions, highly unpredictable
    emotionalProfile: {
        stability:       0.30,
        intensity:       0.90,
        volatility:      0.80,
        attachmentSpeed: 0.90
    },

    // Character-specific injected event dialogue pools
    // (eventDialogue defined above in the personalities section)

    // Training activity picker options
    trainingOptions: [
        { type: 'singing', icon: '🎵', label: 'Singing',    desc: 'Voice like the tide'      },
        { type: 'magic',   icon: '✨', label: 'Siren Magic', desc: 'Draw on the deep'          },
        { type: 'focus',   icon: '🌊', label: 'Drift',       desc: 'Find stillness in the tide' }
    ],

    // Training-specific dialogue pools
    trainingDialogue: {
        singing: [
            "My voice carries further than I thought... can you hear the walls echo?",
            "A siren's song is never just sound. It's memory, longing, tide...",
            "I sang this one before I knew what words were. My body still remembers.",
            "The notes feel different when someone is listening. Warmer.",
            "I used to sing alone. I didn't know how much was missing until now.",
            "There's a frequency that makes the water shimmer. I found it again."
        ],
        magic: [
            "The current responds to intent. I'm still learning to control it.",
            "Siren magic isn't power... it's persuasion. Even the sea must be asked.",
            "I felt the deep pull just now. The ocean always wants me back.",
            "That was more than I intended. Good.",
            "Magic like this leaves a mark on the water. The cave will remember.",
            "I don't use this often. It costs something. I'm not sure what yet."
        ],
        focus: [
            "The tide is loud today. But I can still hear you.",
            "...I almost forgot what quiet felt like.",
            "You're patient with me. That's not nothing.",
            "Stillness is harder than it looks.",
            "I was thinking about you. The whole time.",
            "The ocean pulls at me even here. But I stayed."
        ]
    },

    milestoneEvents: {
        firstFeed: {
            trigger: { timesFed: 1 },
            dialogue: "You fed me... no one from the surface has ever done that before.",
            emotion: "shy"
        },
        firstWash: {
            trigger: { timesWashed: 1 },
            dialogue: "The water feels different when someone else cares for you...",
            emotion: "shy"
        },
        firstTrain: {
            trigger: { timesTrained: 1 },
            dialogue: "You want to hear me sing? Most people run from a siren's voice...",
            emotion: "neutral"
        },
        manyTalks: {
            trigger: { timesTalked: 20 },
            dialogue: "We've talked so much... I forget you're not from the sea.",
            emotion: "happy"
        },
        manyFeeds: {
            trigger: { timesFed: 30 },
            dialogue: "You always make sure I'm nourished... the sea chose well.",
            emotion: "love"
        },
        highAffection: {
            trigger: { affectionLevel: 3, timesTalked: 10 },
            dialogue: "I've never let anyone this close to my heart... or my cave.",
            emotion: "love"
        }
    },

    // ── Siren stage transition lines ─────────────────────────────
    // Shown once when crossing each threshold — stored in localStorage
    sirenStageLines: {
        affection:  "Something is shifting in me... not the tide. Something quieter.",
        resonant:   "My voice is changing. I can feel it reach further. It scares me a little.",
        unstable:   "I can feel the deep calling. I've been ignoring it. I'm not sure I can anymore.",
        monster:    "Do you hear it? That sound in the water... that's what you made me."
    },

    // ── Lucien arc — revealed across three corruption/affection milestones ──
    // lucien1: hint (affection ≥ 35)   lucien2: pain (first corruption milestone)   lucien3: reveal (corruption ≥ 66 OR affection ≥ 70)
    lucienArc: {
        hint: {
            title: "A Familiar Silence",
            text: "Lyra pauses mid-song, eyes somewhere distant. 'There's someone... who looks like me. Sounds like me. He doesn't know it. Or maybe he does, and that's worse.'"
        },
        pain: {
            title: "The Name She Won't Say",
            text: "A ripple crosses her face—not sadness exactly. Something older. 'He's the Grand Master now. Very respected. Very... clean. No half-siren sister to complicate his image. He made sure of that.'"
        },
        reveal: {
            title: "Half-Blood",
            text: "Lyra looks at you for a long moment. Then: 'Lucien is my half-brother. Same father, different worlds. He had the family. I had the water. He never once said my name in public. After a while... I stopped expecting him to.'"
        }
    },

    // ── Lucien idle mentions — surface occasionally once hint is unlocked ──
    lucienLines: [
        "Sometimes I wonder if Lucien can hear my voice across the water... and chooses not to.",
        "He got everything. I got the sea. I used to think that was worse.",
        "The Grand Master's family doesn't include half-sirens. I learned that early.",
        "Lucien looked through me once. Like I was ocean spray. I think that was the moment I stopped hoping.",
        "If he ever acknowledged me... I don't know if I'd want that anymore."
    ],

    // ── Story milestones for Lucien arc and siren corruption stages ──
    storyMilestones: {
        affection1: {
            title: "First Melody",
            text: "Lyra hums a soft tune. For the first time, she lets you hear her true voice. It echoes through the cave like starlight made into sound."
        },
        affection2: {
            title: "The Surface World",
            text: "Lyra surfaces from the water, looking up at the sky with wonder. 'You make me want to see what's up there...'"
        },
        affection3: {
            title: "Heart's Song",
            text: "Lyra's eyes shimmer with tears. 'I've never sung this song for anyone... it's the song of my heart. And it's yours, {name}.'"
        },
        affection4: {
            title: "Eternal Tide",
            text: "Lyra takes your hand, her touch warm despite the cold water. 'In every life, in every sea... I would find you again, {name}.'"
        },
        corruption1: {
            title: "Dark Undertow",
            text: "Lyra's eyes flash with an otherworldly light. 'Don't leave me... the depths are calling, and I need an anchor...'"
        },
        corruption2: {
            title: "The Tide Turns",
            text: "Her voice carries a resonance you've never heard before — beautiful and wrong at the same time. 'I feel stronger when I stop fighting it. That's the part that worries me.'"
        },
        corruption3: {
            title: "The Deep Wakes",
            text: "Lyra's silhouette shimmers, something vast moving beneath her surface. 'You left too many times. The Lyra who waited for you... she's getting quieter. And something else is getting louder.'"
        }
    }
};

// ===== CHARACTER SELECTOR =====
// Default to Alistair, game.js switches this based on selection
let CHARACTER = CHARACTER_ALISTAIR;

function selectCharacter(id) {
    if (id === 'lyra') {
        CHARACTER = CHARACTER_LYRA_FULL;
    } else if (id === 'caspian') {
        CHARACTER = CHARACTER_CASPIAN;
    } else if (id === 'elian') {
        CHARACTER = CHARACTER_ELIAN;
    } else if (id === 'lucien') {
        CHARACTER = CHARACTER_LUCIEN;
    } else if (id === 'proto') {
        CHARACTER = CHARACTER_PROTO;
    } else if (id === 'noir') {
        CHARACTER = CHARACTER_NOIR;
    } else {
        CHARACTER = CHARACTER_ALISTAIR;
    }
    return CHARACTER;
}
