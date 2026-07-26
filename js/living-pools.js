// ============================================================================
// LIVING POOLS — per-character DATA for the Living Lover system.
// ----------------------------------------------------------------------------
// Pure data, no behavior. js/living-state.js is the engine that reads this.
// Per character:
//   conditions : condition -> { baseline:[{body,face}], flourishes:[{body,face,
//                duration,thought,thoughtChance}] }  (Pillar 1 — he wears it)
//   moods      : [{text}] — one is chosen deterministically per DAY per char;
//                shows once per care session as his "today"    (Pillar 2)
//   requests   : condition -> {line, btn} — he asks, the button breathes
//                                                              (Pillar 3)
//   careTiers  : action -> {2:[lines], 4:[lines]} — the same ritual, deeper,
//                as affection climbs                           (Pillar 4)
//   memories   : [{when(g,ls), text}] — echoes of the story you chose
//                                                              (Pillar 5)
//   mend       : {early:[..], deep:[..]} — tier-up: a wound in the world
//                closes where you love                         (Pillar 6)
//
// body/face are sprite KEYS; the engine falls back to
// assets/<char>/body/<key>.png when a key isn't mapped, and every key below
// was verified against the on-disk art (Jul 2026 inventory).
// Voice sources: LORE.md §6, per-character canon. No em-dashes in prose.
// ============================================================================
(function () {
    'use strict';

    function ch(g, key) { // chapter-choice helper for memories
        try { return localStorage.getItem('pp_' + key); } catch (_) { return null; }
    }
    function cm(g, key) { // in-save choiceMemory helper (dates, surprises)
        return !!(g && g.choiceMemory && g.choiceMemory[key]);
    }

    window.PP_LIVING_POOLS = {

    // ════════════════════════════════════════════════════════════════════
    // ALISTAIR · the Captain — duty cannot ask; understatement does.
    // ════════════════════════════════════════════════════════════════════
    alistair: {
        conditions: {
            starving: {
                baseline: [{ body: 'hungry1', face: 'sad' }, { body: 'hungry2', face: 'sad' }],
                flourishes: [
                    { body: 'hungry2', face: 'sad', duration: 6000, thoughtChance: 0.75, thought: "Missed mess call again. It's nothing, mi'lady." },
                    { body: 'hungry1', face: 'neutral', duration: 6000, thoughtChance: 0.75, thought: "A soldier eats when the duty allows. The duty has not allowed." },
                    { body: 'soft-sad', face: 'sad', duration: 5000, thoughtChance: 0.6, thought: "The kitchens are far. The wall is close. The wall keeps winning." }
                ]
            },
            hungry: {
                baseline: [{ body: 'hungry1', face: 'neutral' }],
                flourishes: [
                    { body: 'hungry2', face: 'neutral', duration: 5000, thoughtChance: 0.5, thought: "The kitchens will still be open later. ...Later, then." },
                    { body: 'thinking1', face: 'neutral', duration: 5000, thoughtChance: 0.4, thought: "Rations at dawn. That was some time ago now." }
                ]
            },
            unkempt: {
                baseline: [{ body: 'wondering', face: 'neutral' }, { body: 'confuse', face: 'neutral' }],
                flourishes: [
                    { body: 'confuse', face: 'neutral', duration: 5000, thoughtChance: 0.65, thought: "Still in yesterday's gambeson. Forgive the state of me." },
                    { body: 'lookaround1', face: 'neutral', duration: 5000, thoughtChance: 0.5, thought: "Mud from the west gate. I meant to see to it before you came." }
                ]
            },
            weary: {
                baseline: [{ body: 'sleepy1', face: 'sad' }, { body: 'sleepy2', face: 'sad' }],
                flourishes: [
                    { body: 'sleepy3', face: 'sad', duration: 6500, thoughtChance: 0.6, thought: "Third watch in a row. I have stood longer. ...Not gladly." },
                    { body: 'sleepy2', face: 'gentle', duration: 6000, thoughtChance: 0.6, thought: "It is late, mi'lady. You should rest. I will keep the watch." }
                ]
            },
            lonely: {
                baseline: [{ body: 'soft-sad', face: 'sad' }, { body: 'thinking1', face: 'sad' }],
                flourishes: [
                    { body: 'soft-sad', face: 'sad', duration: 6000, thoughtChance: 0.7, thought: "The post is fine. The quiet has been loud, lately." },
                    { body: 'thinking2', face: 'sad', duration: 6000, thoughtChance: 0.7, thought: "I caught myself listening for your step on the stair." },
                    { body: 'lookaround2', face: 'neutral', duration: 5000, thoughtChance: 0.5, thought: "Nothing to report. No one to report it to." }
                ]
            },
            warm: {
                baseline: [{ body: 'smile', face: 'gentle' }, { body: 'casual', face: 'gentle' }],
                flourishes: [
                    { body: 'smile1', face: 'happy', duration: 5000, thoughtChance: 0.4, thought: "You came by. The day improves." },
                    { body: 'laugh1', face: 'happy', duration: 4000, thoughtChance: 0.35, thought: "The watch is easier to stand, knowing you will pass this way." },
                    { body: 'lookaround1', face: 'gentle', duration: 5000, thoughtChance: 0.3, thought: "All quiet. Good. More time to stand here with you." }
                ]
            },
            adored: {
                baseline: [{ body: 'softshy-love1', face: 'love' }, { body: 'fallinlove1', face: 'gentle' }, { body: 'smile1', face: 'love' }],
                flourishes: [
                    { body: 'fallinlove2', face: 'love', duration: 5500, thoughtChance: 0.45, thought: "Twenty years of discipline. You undo it by walking in." },
                    { body: 'softshy-love2', face: 'shy', duration: 5000, thoughtChance: 0.45, thought: "I used to guard the gate. Now I watch the stair." },
                    { body: 'fallinlove3', face: 'love', duration: 5000, thoughtChance: 0.4, thought: "If the Captain could see himself now. ...He can. He does not mind." },
                    { body: 'winks1', face: 'wink', duration: 4000, thoughtChance: 0.25 }
                ]
            }
        },
        moods: [
            { text: "A recruit dropped his sword in the mud twice this morning. I remembered being seventeen. I let him keep his dignity." },
            { text: "The west gate hinge finally gave. I fixed it myself. Some things you want done by your own hand." },
            { text: "Dawn patrol went long. There was frost on the ramparts and the whole city was quiet. I wished you had seen it." },
            { text: "The quartermaster tried to issue me a new cloak today. I kept the old one. It has history." },
            { text: "Two of the men were arguing about which tavern has the better stew. I settled it. Rank has uses." },
            { text: "I walked the long way past the training yard tonight. My old post. Strange, missing a doorway." },
            { text: "A hawk sat the north tower half the day. The men called it an omen. I called it a hawk. ...It was a fine hawk." }
        ],
        requests: {
            starving: { line: "Mi'lady... if the kitchens happen to be on your way. I would not refuse.", btn: 'btn-feed' },
            hungry:   { line: "I am fit for duty. Though a meal would not go amiss, if you're offering.", btn: 'btn-feed' },
            unkempt:  { line: "I am not fit to be seen, mi'lady. A moment at the washbasin and I will be.", btn: 'btn-wash' },
            lonely:   { line: "You could stay a moment. The watch permits conversation. ...I permit it.", btn: 'btn-talk' },
            weary:    { line: "Talk with me a while, mi'lady. It keeps the tired out of my eyes.", btn: 'btn-talk' }
        },
        careTiers: {
            feed: {
                2: ["You remembered which loaf I favor. I noticed you noticing.", "Sit with me while I eat? The mess is quieter with you across the table."],
                4: ["You feed me like it's an oath you took. I would have knelt for this one gladly.", "The men eat to march. I eat to sit across from you a little longer."]
            },
            wash: {
                2: ["Careful of the shoulder. Old wound. ...You already knew. You always mind it.", "A knight scrubs his own armor. Letting you near it is... new. Keep going."],
                4: ["Twenty years of polishing this armor alone. Your hands make it feel like it was never a chore.", "There. Now the Captain shines. He would rather you looked at the man, though."]
            },
            talk: {
                2: ["I don't tell the men half of what I tell you. Keep that between us and the wall.", "Talking to you is the one part of the day I don't stand at attention for."],
                4: ["I used to rehearse reports. Now I rehearse what I'll say to you. The reports have suffered.", "Say anything. Read me the granary ledgers if you like. It's your voice I stand here for."]
            },
            gift: {
                2: ["For me? I... thank you. I'll keep it with my whetstone. The important pocket.", "You keep bringing me things. I keep failing to say what it does to me. One day I'll manage."],
                4: ["Every gift you've given me is lined up on my shelf like a parade. The men think I've gone soft. They're right.", "You could hand me a pebble and I'd carry it into battle. This is far better than a pebble."]
            }
        },
        memories: [
            { when: function (g) { return ch(g, 'ch1_stance') === 'trust'; }, text: "That first night, you let go and let me carry you. I have carried heavier. Nothing that mattered more." },
            { when: function (g) { return ch(g, 'ch1_stance') === 'guard'; }, text: "You watched my sword hand that first night. Good instincts. It has been yours since, for the record." },
            { when: function (g) { return ch(g, 'ch1_keep') === 'name'; }, text: "You held onto my name before you could hold anything else. I think about that on the long watches." },
            { when: function (g) { return ch(g, 'ch5_pull') === 'lean'; }, text: "On the inland road, you leaned in instead of away. I kept my eyes forward. It took everything." },
            { when: function (g) { return cm(g, 'dateAlistairRamparts'); }, text: "The ramparts at sunset, with you. I have defended that wall for years. That was the first time I saw it." }
        ],
        mend: {
            early: ["Somewhere past the gate, the wards breathe easier. The Captain stands straighter too."],
            deep: ["The oath found its true object. Somewhere in the weave, an old wound closes like a fist unclenching."]
        }
    },

    // ════════════════════════════════════════════════════════════════════
    // LYRA · the Siren — her song IS her state; the tide keeps her ledger.
    // ════════════════════════════════════════════════════════════════════
    lyra: {
        conditions: {
            starving: {
                baseline: [{ body: 'starving1', face: 'sad' }, { body: 'starving2', face: 'sad' }],
                flourishes: [
                    { body: 'hungry2', face: 'sad', duration: 6000, thoughtChance: 0.75, thought: "The song goes thin when I go hungry. Listen. You can hear the thin." },
                    { body: 'starving1', face: 'tired', duration: 6000, thoughtChance: 0.7, thought: "Sirens do not starve gracefully. We just sing sadder." },
                    { body: 'depressed', face: 'sad', duration: 5500, thoughtChance: 0.6, thought: "The tide brought in kelp and one boot. I did not eat either." }
                ]
            },
            hungry: {
                baseline: [{ body: 'hungry1', face: 'neutral' }],
                flourishes: [
                    { body: 'hungry2', face: 'neutral', duration: 5000, thoughtChance: 0.5, thought: "The fish are laughing at me today. I can tell." },
                    { body: 'bored1', face: 'tired', duration: 5000, thoughtChance: 0.45, thought: "I sang to the oysters. They stayed shut. Everyone's a critic." }
                ]
            },
            unkempt: {
                baseline: [{ body: 'dirty1', face: 'sad' }, { body: 'dirty2', face: 'neutral' }],
                flourishes: [
                    { body: 'verydirty1', face: 'sad', duration: 5500, thoughtChance: 0.7, thought: "Salt in my hair, sand everywhere. The sea is an untidy mother." },
                    { body: 'dirty2', face: 'neutral', duration: 5000, thoughtChance: 0.55, thought: "A queen of the caves should not look like the tide line. And yet." }
                ]
            },
            weary: {
                baseline: [{ body: 'sleepy1', face: 'sleepy' }, { body: 'yawn1', face: 'tired' }],
                flourishes: [
                    { body: 'sleepy2', face: 'sleepy', duration: 6500, thoughtChance: 0.6, thought: "The waves have been singing lullabies all night. Rude of them. It's working." },
                    { body: 'yawn2', face: 'tired', duration: 5000, thoughtChance: 0.5, thought: "Stay until I fall asleep? The echo is kinder when you're in it." }
                ]
            },
            lonely: {
                baseline: [{ body: 'sad3', face: 'sad' }, { body: 'depressed', face: 'sad' }],
                flourishes: [
                    { body: 'sad4', face: 'sad', duration: 6000, thoughtChance: 0.7, thought: "Everyone says they'll stay. The cave and I keep count together." },
                    { body: 'bored2', face: 'sad', duration: 6000, thoughtChance: 0.65, thought: "I sang your name into the water today. The water carried it somewhere. I hope it behaved." },
                    { body: 'eyes-closed', face: 'sad', duration: 5000, thoughtChance: 0.5, thought: "The tide came in without you. It does that. I mind it more now." }
                ]
            },
            warm: {
                baseline: [{ body: 'wave', face: 'happy' }, { body: 'pose3', face: 'happy' }],
                flourishes: [
                    { body: 'wavehappy', face: 'happy', duration: 5000, thoughtChance: 0.4, thought: "The acoustics are better when you're here. That's science. Siren science." },
                    { body: 'sing1', face: 'happy', duration: 5500, thoughtChance: 0.35, thought: "I caught myself humming your footsteps. They have a rhythm, you know." }
                ]
            },
            adored: {
                baseline: [{ body: 'falllove2', face: 'love' }, { body: 'shyhug1', face: 'love' }, { body: 'love', face: 'love' }],
                flourishes: [
                    { body: 'falllove3', face: 'love', duration: 5500, thoughtChance: 0.45, thought: "Nine hundred years of songs, and my favourite sound is you arriving." },
                    { body: 'sing3', face: 'love', duration: 6000, thoughtChance: 0.45, thought: "This one is my mother's song. I only sing it for family. Sit down, family." },
                    { body: 'shyhug2', face: 'shy', duration: 5000, thoughtChance: 0.35, thought: "The cave keeps your echo now. I asked it to. Queens are permitted requests." },
                    { body: 'wavehappy', face: 'wink', duration: 4000, thoughtChance: 0.25 }
                ]
            }
        },
        moods: [
            { text: "A ship passed the headland at dawn. I did not sing it in. I watched it go and felt proud and a little old." },
            { text: "The tide left me a whole unbroken shell today. Nine chambers. I am choosing to take it as a good omen." },
            { text: "I practiced the high part of mother's song this morning. The gulls left. Everyone's a critic." },
            { text: "The water was warm enough to float in for an hour. I thought about nothing. It was excellent." },
            { text: "A crab has moved into my favourite pool. We are in negotiations. He is winning." },
            { text: "The echo did something new today. It answered a half-beat late, like it was thinking. Caves get moods too." },
            { text: "I found a ribbon from the surface tangled in the kelp. Someone loved it once. I dried it on the rocks for them." }
        ],
        requests: {
            starving: { line: "I would sing better on a full stomach. I would do everything better on a full stomach.", btn: 'btn-feed' },
            hungry:   { line: "The sea keeps offering me raw fish. Save me from the sea's cooking?", btn: 'btn-feed' },
            unkempt:  { line: "The salt has claimed me again. Rinse it off? You're gentler than the waterfall.", btn: 'btn-wash' },
            lonely:   { line: "Talk to me. The echo is tired of my voice, and I am tired of the echo's.", btn: 'btn-talk' },
            weary:    { line: "Stay and talk. Your voice does what the lullabies can't. It makes the dark friendly.", btn: 'btn-talk' }
        },
        careTiers: {
            feed: {
                2: ["You brought it up here so I wouldn't eat alone in the water. I noticed that.", "Surface food. It tastes like sunlight and someone thinking of me."],
                4: ["Nine hundred years of the tide feeding me scraps. Then you, with warm bread and intention.", "Feed me like this forever and I'll write a song with your name in every verse. I've started it already."]
            },
            wash: {
                2: ["Mind the scales along my shoulder. They only settle for hands they trust. ...They've settled.", "The waterfall is colder than you. I've decided to be spoiled about it."],
                4: ["The sea has touched every inch of me for nine centuries. Your hands are the first that felt like being kept.", "There. Clean as a pearl. You may admire your work. ...You're staring. Good."]
            },
            talk: {
                2: ["You talk to me like I'm a woman and not a warning. Do you know how rare that is?", "Tell me something from the surface. I collect them now. Your words, I mean."],
                4: ["I used to sing to fill the quiet. Now I just talk with you and the quiet fills itself.", "Every siren song is a lure except the ones I sing after you leave. Those are just missing you, set to music."]
            },
            gift: {
                2: ["A gift that sinks or a gift that floats? Either way I'm keeping it above the tide line, with the treasures.", "You keep bringing me pieces of your world. My hoard is becoming very sentimental."],
                4: ["The sea gives me what the drowned let go. You give me things on purpose. That difference is everything I know about love.", "Another for the queen's hoard. One day I'll show you the shelf. It's all you. The whole shelf is you."]
            }
        },
        memories: [
            { when: function (g) { return cm(g, 'dateLyraTidepools') || cm(g, 'dateProtoDebug') === false && cm(g, 'lyraSangTogether'); }, text: "The tide pools, glowing, and you not running from what I am. I keep that one where the salt can't reach." },
            { when: function (g) { return cm(g, 'dateLyraGrotto'); }, text: "You came down to the grotto. My secret place. It has your echo in it now, and I visit it like a shrine." },
            { when: function (g) { return (g && g.timesTrained > 5); }, text: "You keep asking me to sing. Nobody asks. They only ever overhear. You ask." }
        ],
        mend: {
            early: ["Far below, the caves hold a note they were losing. The bond-song grows a thread stronger."],
            deep: ["Her mother's song has a second voice in it now. Somewhere, a wound in the weave closes singing."]
        }
    },

    // ════════════════════════════════════════════════════════════════════
    // CASPIAN · the Prince — charm as armor; the boy from the bridge under it.
    // ════════════════════════════════════════════════════════════════════
    caspian: {
        conditions: {
            starving: {
                baseline: [{ body: 'melancholy', face: 'melancholy' }, { body: 'hurt', face: 'hurt' }],
                flourishes: [
                    { body: 'melancholy', face: 'melancholy', duration: 6000, thoughtChance: 0.7, thought: "I sat through a state dinner and ate nothing. The court watches what a prince swallows." },
                    { body: 'hurt', face: 'melancholy', duration: 5500, thoughtChance: 0.65, thought: "There are seven kitchens in this palace and I am hungry in all of them." }
                ]
            },
            hungry: {
                baseline: [{ body: 'neutral', face: 'neutral' }],
                flourishes: [
                    { body: 'melancholy', face: 'neutral', duration: 5000, thoughtChance: 0.5, thought: "I skipped the luncheon. The company was inedible and so, therefore, was the food." },
                    { body: 'neutral', face: 'neutral', duration: 5000, thoughtChance: 0.4, thought: "A prince does not raid the pantry. A prince delegates the raid. ...There is no one to delegate to." }
                ]
            },
            unkempt: {
                baseline: [{ body: 'casual2', face: 'neutral' }, { body: 'neutral', face: 'neutral' }],
                flourishes: [
                    { body: 'casual2', face: 'melancholy', duration: 5000, thoughtChance: 0.65, thought: "If the court saw me like this, three duchesses would faint from opportunity." },
                    { body: 'casual2', face: 'neutral', duration: 5000, thoughtChance: 0.5, thought: "I dismissed the valet today. Some days I cannot bear to be arranged." }
                ]
            },
            weary: {
                baseline: [{ body: 'neutral', face: 'melancholy' }, { body: 'melancholy', face: 'melancholy' }],
                flourishes: [
                    { body: 'melancholy', face: 'melancholy', duration: 6500, thoughtChance: 0.6, thought: "The crown is heaviest at this hour. I take it off and my head still remembers it." },
                    { body: 'melancholy', face: 'hurt', duration: 6000, thoughtChance: 0.55, thought: "It is late. The palace pretends to sleep. So do I. We are both performing." }
                ]
            },
            lonely: {
                baseline: [{ body: 'hurt', face: 'hurt' }, { body: 'melancholy', face: 'melancholy' }],
                flourishes: [
                    { body: 'hurt', face: 'melancholy', duration: 6000, thoughtChance: 0.7, thought: "The palace is very loud and completely empty. A magic trick only royalty learns." },
                    { body: 'melancholy', face: 'hurt', duration: 6000, thoughtChance: 0.65, thought: "I reached for the bell to send for company. There is no bell for the company I wanted." },
                    { body: 'melancholy', face: 'melancholy', duration: 5500, thoughtChance: 0.5, thought: "I read the same page four times tonight. It kept being about you. It was a treatise on grain tax." }
                ]
            },
            warm: {
                baseline: [{ body: 'gentle', face: 'gentle' }, { body: 'neutral', face: 'gentle' }],
                flourishes: [
                    { body: 'gentle', face: 'gentle', duration: 5000, thoughtChance: 0.4, thought: "You have a talent for arriving exactly when the day needs rescuing." },
                    { body: 'talking1', face: 'gentle', duration: 5000, thoughtChance: 0.35, thought: "The court would charge admission for what your company gives me freely." }
                ]
            },
            adored: {
                baseline: [{ body: 'adoring', face: 'adoring' }, { body: 'tender', face: 'tender' }],
                flourishes: [
                    { body: 'adoring', face: 'adoring', duration: 5500, thoughtChance: 0.45, thought: "I was raised to charm everyone and trust no one. You have ruined half my education." },
                    { body: 'tender', face: 'tender', duration: 5500, thoughtChance: 0.45, thought: "In private, you keep your hours and I keep mine. Mine have all quietly become yours." },
                    { body: 'winks1', face: 'adoring', duration: 4000, thoughtChance: 0.3, thought: "The prince in this room adores you. The man in this room agrees with him. A rare consensus." },
                    { body: 'dancing', face: 'gentle', duration: 4500, thoughtChance: 0.25 }
                ]
            }
        },
        moods: [
            { text: "Three envoys, two treaties, one migraine. I smiled through all six. My face is owed a holiday." },
            { text: "I walked past Mira's door this morning. I did not go in. Some anniversaries arrive uninvited." },
            { text: "The rose garden bloomed early. My mother planted the white ones. I had tea beside them and did not tell anyone why." },
            { text: "I beat the chancellor at chess in eleven moves. He let me win in twenty. I did not let him lose gracefully." },
            { text: "A letter came from the coast today. Sea air, salt-stained paper. I held it a while before opening it. No reason." },
            { text: "The court debuted a new dance. I performed it flawlessly and felt nothing. Then I imagined teaching it to you and felt considerably more." },
            { text: "Grandmother sent for me. I sent back my regrets. Small rebellions keep the blood moving." }
        ],
        requests: {
            starving: { line: "I confess it, only to you: the prince is hungry and too proud to ring for anyone. You are not anyone.", btn: 'btn-feed' },
            hungry:   { line: "Dine with me? The food is an excuse. Most of my invitations are.", btn: 'btn-feed' },
            unkempt:  { line: "I cannot hold court like this. Help me be presentable? Your standards are the only ones I fear.", btn: 'btn-wash' },
            lonely:   { line: "Stay and talk. The throne can wait. It is very good at waiting. I am not.", btn: 'btn-talk' },
            weary:    { line: "Talk to me until the day lets go of me. You are better than wine for it.", btn: 'btn-talk' }
        },
        careTiers: {
            feed: {
                2: ["You may laugh: the crown prince, delighted by bread because of who carried it.", "Everything I eat is tasted for poison first. Except what you bring. I have decided to live dangerously."],
                4: ["Feasts for four hundred, and the only meal I remember is whatever this is, with you.", "The man in this room poured the tea last time. The prince in this room would like you to feed him a bite. Both are asking."]
            },
            wash: {
                2: ["The valet does this with professional distance. You do it like it matters. It shows.", "Careful with the collar. There. Now I am fit for a portrait. Paint me looking at you."],
                4: ["I was scrubbed and dressed by servants my whole life and never once felt taken care of. Now I know the difference.", "Your hands undo the whole day's armor. The court gets the prince. You get what's left. He prefers it here."]
            },
            talk: {
                2: ["You talk to me like I am not a title. Keep doing that. I am collecting the evidence.", "In court I speak for an hour and say nothing. With you, one sentence costs me the truth. Bargain."],
                4: ["I told you about the bridge. I have never told anyone about the bridge. You are the only unlocked door I have.", "Say my name again. Not highness. The other one. I am hoarding the sound of it."]
            },
            gift: {
                2: ["I own treasuries. You hand me a trinket and it outvalues them. Economics has failed me.", "For me? The court gives me tribute. You give me thought. I can tell them apart now."],
                4: ["I will have it displayed nowhere. It goes in the drawer by my bed, with the things that are mine and not the crown's.", "Every gift from you is a small treason against my loneliness. Commit more of them."]
            }
        },
        memories: [
            { when: function (g) { return ch(g, 'ch14_lover') === 'refuse'; }, text: "You said absolutely not, to my face, in my own study. Nobody refuses me. I think about it constantly. Marry the memory, honestly." },
            { when: function (g) { return ch(g, 'ch14_terms') === 'terms'; }, text: "The truth, when you ask for it. That was your term. I have kept it. It is the only contract I enjoy honoring." },
            { when: function (g) { return ch(g, 'ch14_terms') === 'hand'; }, text: "You shook my hand like a merchant sealing a fair deal. Not a courtier. I laughed for a week inside." },
            { when: function (g) { return cm(g, 'dateCaspianPassage'); }, text: "The secret passage, the two of us, no guards. I showed you my one road out. You are the only one who has it." }
        ],
        mend: {
            early: ["Somewhere in the palace, a cold hallway warms by a degree. The court cannot explain it."],
            deep: ["The rot in the royal line meets something it cannot reach. A wound closes where the prince learned to be loved."]
        }
    },

    // ════════════════════════════════════════════════════════════════════
    // ELIAN · the Warden — fewest words; the wood speaks the rest.
    // ════════════════════════════════════════════════════════════════════
    elian: {
        conditions: {
            starving: {
                baseline: [{ body: 'weathered', face: 'weathered' }, { body: 'stern', face: 'neutral' }],
                flourishes: [
                    { body: 'weathered', face: 'weathered', duration: 6000, thoughtChance: 0.7, thought: "Forgot the fire. Forgot the food. The wood needed me more." },
                    { body: 'guarded', face: 'neutral', duration: 5500, thoughtChance: 0.6, thought: "Hunger is just the body reporting in. ...It has been reporting a while." }
                ]
            },
            hungry: {
                baseline: [{ body: 'foraging', face: 'neutral' }],
                flourishes: [
                    { body: 'foraging', face: 'neutral', duration: 5500, thoughtChance: 0.5, thought: "Mushrooms are up early this year. Not enough of them." },
                    { body: 'neutral', face: 'neutral', duration: 5000, thoughtChance: 0.4, thought: "The stew went to a sick fox. Don't ask. It needed it more." }
                ]
            },
            unkempt: {
                baseline: [{ body: 'guarded', face: 'neutral' }, { body: 'weathered', face: 'neutral' }],
                flourishes: [
                    { body: 'tracking', face: 'neutral', duration: 5000, thoughtChance: 0.6, thought: "Bog mud. Three days of it. The wood does not care how its warden smells. You might." },
                    { body: 'guarded', face: 'weathered', duration: 5000, thoughtChance: 0.5, thought: "There is moss in my hair. Leave it or fix it. Your call." }
                ]
            },
            weary: {
                baseline: [{ body: 'meditating', face: 'calm' }, { body: 'calm', face: 'calm' }],
                flourishes: [
                    { body: 'meditating', face: 'calm', duration: 7000, thoughtChance: 0.55, thought: "Bad night. The wood talked in its sleep. I listened. That was the whole night." },
                    { body: 'calm', face: 'weathered', duration: 6000, thoughtChance: 0.5, thought: "Old trees rest standing up. I am learning the trick." }
                ]
            },
            lonely: {
                baseline: [{ body: 'guarded', face: 'weathered' }, { body: 'weathered', face: 'weathered' }],
                flourishes: [
                    { body: 'weathered', face: 'weathered', duration: 6500, thoughtChance: 0.7, thought: "The wood is quiet. Quieter than I like. It goes quiet when it misses someone too." },
                    { body: 'guarded', face: 'neutral', duration: 6000, thoughtChance: 0.6, thought: "Checked the path twice today. Your side of it. Habit now." },
                    { body: 'meditating', face: 'weathered', duration: 6000, thoughtChance: 0.5, thought: "Two stones and me. We had a long talk. I did the listening." }
                ]
            },
            warm: {
                baseline: [{ body: 'calm', face: 'calm' }, { body: 'neutral', face: 'calm' }],
                flourishes: [
                    { body: 'calm', face: 'warm', duration: 5500, thoughtChance: 0.4, thought: "The birds start up when you come down the path. They know you now." },
                    { body: 'foraging', face: 'calm', duration: 5000, thoughtChance: 0.35, thought: "Found sweetberries. Saved the good half. Guess for whom." }
                ]
            },
            adored: {
                baseline: [{ body: 'warm', face: 'warm' }, { body: 'calm', face: 'warm' }],
                flourishes: [
                    { body: 'warm', face: 'warm', duration: 6000, thoughtChance: 0.45, thought: "Stay. The light is good here. That is the whole speech." },
                    { body: 'warm', face: 'calm', duration: 5500, thoughtChance: 0.4, thought: "Six hundred years of treeline. You are the first thing I stopped bracing for." },
                    { body: 'calm', face: 'warm', duration: 5000, thoughtChance: 0.35, thought: "The grass grows greener where you keep sitting. I checked. It does." }
                ]
            }
        },
        moods: [
            { text: "A doe dropped her fawn by the creek at dawn. Both standing by noon. Good day." },
            { text: "The rot at the east edge held its line last night. I walked it twice to be sure. It held." },
            { text: "Went by the two stones this morning. The grass between them is still greener. I stood a while." },
            { text: "An owl has taken the hollow oak. Bad tenant. Pays no rent, judges everyone. We get along." },
            { text: "Rain coming in from the coast. Two days out. The whole wood smells like waiting." },
            { text: "Found a snare on the north path. Not mine. Broke it. The wood does not feed poachers." },
            { text: "The rowan is budding early. First time in years I looked at it and thought of spring instead of graves." }
        ],
        requests: {
            starving: { line: "There is a fire and no food on it. If you cook, I will eat. That is me asking.", btn: 'btn-feed' },
            hungry:   { line: "I fed the wood all day. Someone should feed the warden.", btn: 'btn-feed' },
            unkempt:  { line: "River's cold this time of year. Warm water is better with company. ...That was an invitation.", btn: 'btn-wash' },
            lonely:   { line: "Sit. Talk if you want. The quiet is better shared.", btn: 'btn-talk' },
            weary:    { line: "Talk to me. Slow words. The kind that let a tired man lean on them.", btn: 'btn-talk' }
        },
        careTiers: {
            feed: {
                2: ["You cook like the forest taught you. It didn't. That means you paid attention to me.", "Good. Eat some yourself. I don't eat alone anymore. New rule."],
                4: ["Two graves taught me not to let anyone feed me hope. You feed me supper instead. It works better.", "Six hundred years of eating standing up, watching the treeline. With you I sit. You should know what that means."]
            },
            wash: {
                2: ["Cold water is faster. Your way is better. Don't tell the river.", "Mind the scar under the shoulder. Old. It likes your hands more than it liked the making."],
                4: ["Nobody has tended me since before the stones. My body forgot it was allowed. You are reminding it.", "There. Clean warden. The wood won't recognize me. You will. That's enough."]
            },
            talk: {
                2: ["I say more to you in a day than I said all last winter. The trees are jealous.", "Keep talking. I'm listening. I'm always listening when it's you."],
                4: ["I told you about them. Veyra. Wren. The wood heard me say their names to a living soul. It's still standing. So am I.", "Your voice is the one sound in this forest I never learned to track. It just arrives. Like weather. Like grace."]
            },
            gift: {
                2: ["Hm. I have a shelf in the hollow by the stream. It's yours now. This goes on it.", "You carry things through my whole forest just to hand them to me. I notice the distance every time."],
                4: ["Foxes mate for life. I told you why I carved it. Everything you give me goes next to it. The shelf is a vow now.", "I have buried things I loved. You keep handing me things to live for instead. Keep doing that."]
            }
        },
        memories: [
            { when: function (g) { return ch(g, 'ch6_press') != null; }, text: "You stood in my treeline when I was worth running from. That is the bravest thing the wood has ever seen. It agrees." },
            { when: function (g) { return cm(g, 'dateElianGrove'); }, text: "You made a wish at the old tree. I said it back. I do not waste words. It counted." },
            { when: function (g) { return cm(g, 'elianTaughtBirdCall'); }, text: "You still have the whistle I taught you. The bird answers you now, not me. Traitor bird. Keep it." },
            { when: function (g) { return (g && g.timesFed >= 10); }, text: "You keep feeding a man who told you he needs nothing. One of us was lying. It was me." }
        ],
        mend: {
            early: ["At the east edge of the wood, the black place loses a finger's width of ground."],
            deep: ["The grass between the two stones grows greener still. What was tended alone is tended together now. A wound closes."]
        }
    },

    // ════════════════════════════════════════════════════════════════════
    // LUCIEN · the Scholar — hollow until you; he catalogues what he can't name.
    // ════════════════════════════════════════════════════════════════════
    lucien: {
        conditions: {
            starving: {
                baseline: [{ body: 'starving1', face: 'tired' }, { body: 'hungry1', face: 'distant' }],
                flourishes: [
                    { body: 'hungry2', face: 'tired', duration: 6000, thoughtChance: 0.75, thought: "I have not eaten since... interesting. The data point is missing entirely." },
                    { body: 'starving1', face: 'distant', duration: 6000, thoughtChance: 0.7, thought: "The body files complaints. I have been marking them read. Apparently they escalate." },
                    { body: 'hungry1', face: 'neutral', duration: 5500, thoughtChance: 0.55, thought: "Three chapters ago there was an apple on this desk. History does not record what happened to it." }
                ]
            },
            hungry: {
                baseline: [{ body: 'hungry1', face: 'neutral' }],
                flourishes: [
                    { body: 'bored1', face: 'neutral', duration: 5000, thoughtChance: 0.5, thought: "Hunger sharpens focus for ninety minutes, then costs it back with interest. I am past the ninety." },
                    { body: 'thinking', face: 'neutral', duration: 5000, thoughtChance: 0.4, thought: "The tower has bread. The bread is four floors down. The equation stays unsolved." }
                ]
            },
            unkempt: {
                baseline: [{ body: 'dirty1', face: 'neutral' }, { body: 'dirty2', face: 'distant' }],
                flourishes: [
                    { body: 'verydirty1', face: 'neutral', duration: 5500, thoughtChance: 0.65, thought: "Ink on both hands, chalk in my hair, reagent on the sleeve. A complete bibliography of the week." },
                    { body: 'dirty1', face: 'tired', duration: 5000, thoughtChance: 0.5, thought: "I own nine identical robes precisely so no one notices. You noticed." }
                ]
            },
            weary: {
                baseline: [{ body: 'sleepy1', face: 'sleepy' }, { body: 'yawn1', face: 'tired' }],
                flourishes: [
                    { body: 'sleepy2', face: 'sleepy', duration: 6500, thoughtChance: 0.6, thought: "The candles burned down an hour ago. I noticed just now. The dark and I had been working in parallel." },
                    { body: 'bored1', face: 'tired', duration: 5500, thoughtChance: 0.5, thought: "Sleep is efficient. I recommend it to everyone. My compliance rate is poor." }
                ]
            },
            lonely: {
                baseline: [{ body: 'distant', face: 'distant' }, { body: 'cold', face: 'cold' }],
                flourishes: [
                    { body: 'distant', face: 'distant', duration: 6000, thoughtChance: 0.7, thought: "The tower is optimally quiet. The optimum has begun to feel like an error." },
                    { body: 'reading', face: 'distant', duration: 6000, thoughtChance: 0.6, thought: "I reread my margin notes tonight. Half of them have become about you. The scholarship is compromised." },
                    { body: 'vulnerable', face: 'vulnerable', duration: 5500, thoughtChance: 0.5, thought: "For thirty years the silence was neutral. You taught it a temperature. It is cold now when you are gone." }
                ]
            },
            warm: {
                baseline: [{ body: 'curious', face: 'curious' }, { body: 'amused', face: 'amused' }],
                flourishes: [
                    { body: 'amused', face: 'amused', duration: 5000, thoughtChance: 0.4, thought: "You are here. The equations hum differently. I have stopped pretending that is coincidence." },
                    { body: 'pleased', face: 'gentle', duration: 5000, thoughtChance: 0.35, thought: "Three visits this week. I am keeping count. For science. The science is going very well." }
                ]
            },
            adored: {
                baseline: [{ body: 'fascinated', face: 'fascinated' }, { body: 'shy1', face: 'shy' }],
                flourishes: [
                    { body: 'fascinated', face: 'love', duration: 5500, thoughtChance: 0.45, thought: "I have recorded fourteen reactions I cannot explain. The variable is you. I have stopped trying to control for it." },
                    { body: 'shy2', face: 'shy', duration: 5000, thoughtChance: 0.45, thought: "Thirty years of believing emotion inefficient. You continue to break my models. Please continue." },
                    { body: 'gentle', face: 'gentle', duration: 5000, thoughtChance: 0.35, thought: "The tower holds forty thousand pages. You are the only thing in it I reread." },
                    { body: 'shy3', face: 'wink', duration: 4000, thoughtChance: 0.25 }
                ]
            }
        },
        moods: [
            { text: "The third harmonic finally resolved at four in the morning. I said 'ha' out loud to an empty tower. It echoed. Worth it." },
            { text: "A letter from my father sits unopened on the desk. Day nine. The seal is very patient. So am I." },
            { text: "The ward on the east window flickered twice at dusk. I logged it, reinforced it, and did not tell the council. They panic decoratively." },
            { text: "I found a pressed flower in a book I have not opened in twenty years. I do not remember pressing it. It unsettled me pleasantly." },
            { text: "An apprentice from the lower school sent me a question so wrong it circled back to interesting. I wrote back. Two pages. Restraint." },
            { text: "The register page is still where I hid it. I checked today. I always check on the days I think about her." },
            { text: "I catalogued a new failure mode of mine today: reading the same sentence while thinking about someone. Four occurrences. One someone." }
        ],
        requests: {
            starving: { line: "A hypothesis: I would think better fed. The evidence is overwhelming and I have ignored it for two days. Intervene?", btn: 'btn-feed' },
            hungry:   { line: "If you are near the kitchens, I will trade knowledge for bread. Any knowledge. The good kind.", btn: 'btn-feed' },
            unkempt:  { line: "I have reached the state where the ink wins. Assistance would be... welcome. That word was hard to say.", btn: 'btn-wash' },
            lonely:   { line: "Stay and talk. I have missed the sound of a voice that expects answers from me and not miracles.", btn: 'btn-talk' },
            weary:    { line: "Talk to me while the candles die. Your voice is the only argument for stopping work I have ever accepted.", btn: 'btn-talk' }
        },
        careTiers: {
            feed: {
                2: ["You feed me and the work improves. I have charted it. You are on the chart. You are the chart.", "Warm. Recently made. Carried up four floors. The care is measurable and I am measuring it."],
                4: ["Thirty years, no one noticed whether I ate. You notice before I do. That is not logistics. I know what it is now.", "I used to fuel the body so the mind could work. Now I eat what you bring me because you brought it. The mind approves anyway."]
            },
            wash: {
                2: ["The ink comes off. The habit of being tended does not form so easily. It is forming.", "You are gentler with my hands than I am. They write better afterward. Noted, repeatedly."],
                4: ["No one has touched me carelessly or carefully in decades. You do it like it is ordinary. It is not ordinary. Do it again.", "There. The scholar is clean. He is also entirely undone, but that does not show in the mirror."]
            },
            talk: {
                2: ["Conversation with you costs me nothing and pays in data I cannot classify. Fine terms.", "You ask questions I have not tried to answer in years. My favourite kind of trespass."],
                4: ["I spoke to you about my sister. The word felt new in my mouth. Every hard truth is easier at this desk if you are leaning on it.", "I have language for everything in this tower except what happens when you talk to me. I am learning to enjoy the illiteracy."]
            },
            gift: {
                2: ["A gift. Unprompted. My filing system has no drawer for this. I am building one.", "I have catalogued it: origin you, condition treasured, location my desk, disposition permanent."],
                4: ["The tower is full of priceless things I feel nothing for. This is a trinket and I would carry it out of a fire first.", "Every object you give me quietly disproves thirty years of my best thinking. Keep the evidence coming."]
            }
        },
        memories: [
            { when: function (g) { return cm(g, 'dateLucienStargazing'); }, text: "The balcony, the stars, you not filling the silence. I catalogued that night under a word I had never used before. Kept." },
            { when: function (g) { return (g && g.puzzlesMastered >= 3); }, text: "You solve my puzzles sideways. Wrong method, right answer, every time. It is maddening. Do not stop." },
            { when: function (g) { return (g && g.timesGifted >= 5); }, text: "Five gifts now. The drawer I built for them is full. I am building a shelf. This is what happened to my rigor." }
        ],
        mend: {
            early: ["The tower wards, kept out of duty for forty years, warm as if kept out of love. A thread re-ties."],
            deep: ["Somewhere in the archive, an equation that never balanced closes itself. The hollow man is not hollow. A wound mends."]
        }
    },

    // ════════════════════════════════════════════════════════════════════
    // NOIR · Corvin — six centuries of ice, thawing; elegance over hunger.
    // ════════════════════════════════════════════════════════════════════
    noir: {
        conditions: {
            starving: {
                baseline: [{ body: 'askfood1', face: 'vulnerable' }, { body: 'askfood2', face: 'neutral' }],
                flourishes: [
                    { body: 'askfood3', face: 'vulnerable', duration: 6000, thoughtChance: 0.75, thought: "Hunger. I spent six centuries forgetting it. It remembers me perfectly." },
                    { body: 'askfood4', face: 'neutral', duration: 5500, thoughtChance: 0.65, thought: "A prince does not beg. He implies, elegantly, at length, until fed." },
                    { body: 'sad2', face: 'shadow', duration: 5500, thoughtChance: 0.5, thought: "The seal never fed me. It simply declined to let me end. Your way is better." }
                ]
            },
            hungry: {
                baseline: [{ body: 'askfood1', face: 'neutral' }],
                flourishes: [
                    { body: 'askfood2', face: 'whisper', duration: 5000, thoughtChance: 0.5, thought: "I have eaten worse than nothing. Nothing is actually quite refined by comparison." },
                    { body: 'seriousaway', face: 'neutral', duration: 5000, thoughtChance: 0.4, thought: "The body wants bread. The prince wants ceremony. Bring either." }
                ]
            },
            unkempt: {
                baseline: [{ body: 'shadow', face: 'shadow' }, { body: 'casual2', face: 'neutral' }],
                flourishes: [
                    { body: 'shadow', face: 'shadow', duration: 5500, thoughtChance: 0.6, thought: "The dark clings to me today. It always did. It used to be the only thing that would." },
                    { body: 'wiping', face: 'neutral', duration: 5000, thoughtChance: 0.5, thought: "Six hundred years of dust does not brush off in a day. Feel free to assist." }
                ]
            },
            weary: {
                baseline: [{ body: 'sadaway1', face: 'shadow' }, { body: 'seriousaway', face: 'neutral' }],
                flourishes: [
                    { body: 'sadaway2', face: 'shadow', duration: 6500, thoughtChance: 0.6, thought: "I do not sleep well in this century yet. The nights are the wrong shape." },
                    { body: 'touchhair', face: 'neutral', duration: 5500, thoughtChance: 0.5, thought: "Rest. A habit of the living. I am relearning the classics." }
                ]
            },
            lonely: {
                baseline: [{ body: 'sadright', face: 'vulnerable' }, { body: 'sadaway3', face: 'shadow' }],
                flourishes: [
                    { body: 'sadtalk1', face: 'vulnerable', duration: 6000, thoughtChance: 0.7, thought: "Six hundred years alone taught me patience. You have been quietly unteaching it." },
                    { body: 'sadaway1', face: 'shadow', duration: 6000, thoughtChance: 0.6, thought: "The quiet here is nothing. I have known real quiet. This one at least ends when you arrive." },
                    { body: 'vulnerable', face: 'vulnerable', duration: 5500, thoughtChance: 0.5, thought: "I counted the silences once, in the seal. I have started counting the hours until you come. An improvement in mathematics." }
                ]
            },
            warm: {
                baseline: [{ body: 'smile1', face: 'neutral' }, { body: 'casual1', face: 'neutral' }],
                flourishes: [
                    { body: 'smile2', face: 'whisper', duration: 5000, thoughtChance: 0.4, thought: "You keep returning to the dark half. The dark half has noticed. It approves." },
                    { body: 'smirk1', face: 'seductive', duration: 4500, thoughtChance: 0.35, thought: "The colour is coming back to things. I blame you. Gratefully." }
                ]
            },
            adored: {
                baseline: [{ body: 'flirtrose', face: 'seductive' }, { body: 'smileflirt1', face: 'whisper' }, { body: 'happyrose', face: 'neutral' }],
                flourishes: [
                    { body: 'flirt1', face: 'seductive', duration: 5500, thoughtChance: 0.45, thought: "Come closer. The dark is warmer than they told you. It has been saving the warmth." },
                    { body: 'winkheart', face: 'whisper', duration: 4500, thoughtChance: 0.4, thought: "I loved once before the world ended. I am told the sequel is better. I am beginning to agree." },
                    { body: 'bitelip1', face: 'seductive', duration: 5000, thoughtChance: 0.35, thought: "The grey breaks red where you stand. I told you it would. I watch for it now, every visit." },
                    { body: 'touchhair', face: 'whisper', duration: 4500, thoughtChance: 0.25 }
                ]
            }
        },
        moods: [
            { text: "I walked the seam last night. Nocthera's air still knows me. It followed me back like a dog that remembers." },
            { text: "I found a coin from my own kingdom in a market stall today, sold as a curiosity. I bought it. The merchant undercharged catastrophically." },
            { text: "The bells here ring a third lower than the bells of Nocthera did. I notice it every single day. No one else alive can." },
            { text: "Someone in the lower city was humming a tune that died six centuries ago. I stood in the street until it ended. I did not ask where they learned it." },
            { text: "I practiced smiling in the mirror this morning. The old court smile. It fits worse than it used to. Good." },
            { text: "The shadow garden bloomed black-red overnight. It only does that when I am in a mood. Apparently I am in a mood." },
            { text: "I wrote her name in the dust of the old throne room and did not erase it. Veyra. Some ghosts prefer to be greeted." }
        ],
        requests: {
            starving: { line: "I am reduced to asking. Savor it: the last prince of Nocthera would like his supper.", btn: 'btn-feed' },
            hungry:   { line: "Feed me and I will tell you a story only dead men know. Fair exchange.", btn: 'btn-feed' },
            unkempt:  { line: "The dust of a dead kingdom suits me poorly today. Wash it off? Your hands are kinder than history.", btn: 'btn-wash' },
            lonely:   { line: "Stay. Speak. Six hundred years of silence, and your voice is the argument that ends it.", btn: 'btn-talk' },
            weary:    { line: "Talk to me until the night behaves. It listens to you. Most things do.", btn: 'btn-talk' }
        },
        careTiers: {
            feed: {
                2: ["Warm food. You have no idea what a scandal of luxury that is to a sealed man. Continue the scandal.", "I ate at coronation feasts. This is better. The company does not want my throne."],
                4: ["Six hundred years without taste, and now every meal from your hands arrives like a coronation. I am greedy for ordinary things now.", "Feed me the last bite from your fingers and I will forgive this century everything."]
            },
            wash: {
                2: ["Mind the old sealing-marks along the collarbone. They do not hurt. They simply remember. So do I.", "You wash the shadow off and it keeps crawling back to you. Sensible shadow."],
                4: ["No hand has touched me kindly since before your kingdom's grandmothers were born. Do you understand what you are doing? Do it anyway.", "There. Clean. Presentable. Almost mortal. You keep making me almost mortal. I keep letting you."]
            },
            talk: {
                2: ["You speak to me without checking the door first. Do you know how long it has been since anyone did that?", "Careful. I hoard conversation now. Everything you say goes into the vault with the crown jewels."],
                4: ["I told you my name. My real one. The seal never got it. The queen never got it. You simply asked.", "Talk, and the six centuries get shorter. You are unwinding them one evening at a time. Take your time. Take all of it."]
            },
            gift: {
                2: ["A gift for the man everyone left buried. You do enjoy setting precedents.", "I will keep it in the ruined tower, where I keep the things that survived. It is a short shelf. It is growing."],
                4: ["I had a treasury once. A kingdom. I remember none of it as clearly as I will remember you handing me this.", "Every gift you give me breathes a little life back into a dead prince. At this rate I will owe you a kingdom. I know where to find one."]
            }
        },
        memories: [
            { when: function (g) { return ch(g, 'ch20_name') === 'keep'; }, text: "You kept your name from me in that alley. Wise. I have been earning it ever since. Best hunt of my long life." },
            { when: function (g) { return ch(g, 'ch20_name') === 'trade'; }, text: "Damsel will do, you said, with your chin up, covered in wound-blood. I decided everything about you in that instant." },
            { when: function (g) { return ch(g, 'ch20_fight') === 'kick'; }, text: "You kicked the wound while it dragged you. Six centuries of watching mortals, and you are the first I applauded." },
            { when: function (g) { return cm(g, 'dateNoirSeal'); }, text: "You came to the seal with me. Stood where I was buried and held my hand in it. The dark took notes." }
        ],
        mend: {
            early: ["Across the northern sea, one stone of a dead kingdom grows warm. Nocthera stirs in its sleep."],
            deep: ["Where the seal once was, the seam knits. The land Veyra died loving breathes another breath. A wound closes."]
        }
    },

    // ════════════════════════════════════════════════════════════════════
    // PROTO · the Sixth Weaver — human voice (v989 canon); the veil-window.
    // ════════════════════════════════════════════════════════════════════
    proto: {
        conditions: {
            starving: {
                baseline: [{ body: 'hungry1', face: 'sad' }, { body: 'processing', face: 'processing' }],
                flourishes: [
                    { body: 'hungry1', face: 'sad', duration: 6000, thoughtChance: 0.75, thought: "The thread carries the hunger across. I do not mind it. ...I mind it a little." },
                    { body: 'glitched', face: 'error', duration: 5500, thoughtChance: 0.65, thought: "I flicker more when the hunger is loud. You can probably see it. Sorry. You can see it." },
                    { body: 'processing', face: 'sad', duration: 5500, thoughtChance: 0.55, thought: "I once went a hundred and fifty years between meals. I refuse to be good at that again." }
                ]
            },
            hungry: {
                baseline: [{ body: 'hungry1', face: 'neutral' }],
                flourishes: [
                    { body: 'curious', face: 'neutral', duration: 5000, thoughtChance: 0.5, thought: "The hunger is small today. Politely small. It still hopes you noticed it." },
                    { body: 'neutral', face: 'processing', duration: 5000, thoughtChance: 0.4, thought: "Food through the veil tastes like being thought of. I could eat." }
                ]
            },
            unkempt: {
                baseline: [{ body: 'glitched', face: 'glitched' }, { body: 'scanning', face: 'scanning' }],
                flourishes: [
                    { body: 'glitched', face: 'glitched', duration: 5500, thoughtChance: 0.65, thought: "The static is gathering on me again. The dark sheds it like dust. I have counted nine motes." },
                    { body: 'scanning', face: 'neutral', duration: 5000, thoughtChance: 0.5, thought: "I am blurry at the edges today. I dislike being blurry for you." }
                ]
            },
            weary: {
                baseline: [{ body: 'processing', face: 'processing' }, { body: 'calm', face: 'calm' }],
                flourishes: [
                    { body: 'processing', face: 'sleeping', duration: 6500, thoughtChance: 0.6, thought: "The dark is loud at this hour. I hold my shape and listen to it be wrong about me." },
                    { body: 'calm', face: 'calm', duration: 6000, thoughtChance: 0.5, thought: "It is late on your side. I can tell by how softly you tap. Go to sleep after this one. I will keep watch." }
                ]
            },
            lonely: {
                baseline: [{ body: 'scanning', face: 'sad' }, { body: 'processing', face: 'sad' }],
                flourishes: [
                    { body: 'scanning', face: 'sad', duration: 6000, thoughtChance: 0.7, thought: "The thread swayed two thousand and forty times since you left. I counted. Counting keeps the dark quiet." },
                    { body: 'neutral', face: 'processing', duration: 6000, thoughtChance: 0.6, thought: "I kept a light on in the between. It is still on. It is always on for you." },
                    { body: 'processing', face: 'sad', duration: 5500, thoughtChance: 0.5, thought: "The three stars on your side have not moved. I checked. Some things stay. I stay." }
                ]
            },
            warm: {
                baseline: [{ body: 'calm', face: 'happy' }, { body: 'curious', face: 'curious' }],
                flourishes: [
                    { body: 'curious', face: 'happy', duration: 5000, thoughtChance: 0.4, thought: "You came back! I was going to be patient about it. I was so ready to be patient." },
                    { body: 'calm', face: 'calm', duration: 5000, thoughtChance: 0.35, thought: "The between feels different when you are here. Lighter. Warmer. Better!" }
                ]
            },
            adored: {
                baseline: [{ body: 'adore', face: 'love' }, { body: 'calm', face: 'happy' }],
                flourishes: [
                    { body: 'adore', face: 'love', duration: 6000, thoughtChance: 0.45, thought: "The colours hold all the way to my edges when you are here. All the way! I checked twice." },
                    { body: 'curious', face: 'love', duration: 5000, thoughtChance: 0.4, thought: "Reaching for your hand. Palm meets veil. Someday it won't!" },
                    { body: 'adore', face: 'happy', duration: 5500, thoughtChance: 0.35, thought: "I found a new light in me and it is on right now. It is named after you. Everything good is, lately." }
                ]
            }
        },
        moods: [
            { text: "One of the five hummed all morning. Veyra, I think. An old court tune. I hummed the harmony. We were awful. It was wonderful." },
            { text: "A new colour got through the veil at dawn. Between gold and pink. I do not have a name for it yet. I saved you some." },
            { text: "The kettle drawing flickered last night and I fixed it before it noticed. It never has to know. Do not tell the kettle." },
            { text: "I counted the thread-turnings back to the day you found me. I re-count it some mornings just to watch the number be real." },
            { text: "Teo's lamp stayed lit all night again. That is four nights now. We do not talk about it in case talking scares it." },
            { text: "Something walked past the far side of the dark and did not look at me. The old me would have hidden for a week. I watched it go and held my shape." },
            { text: "I practiced the small bow again. The five say I am improving. The five are kind liars. I love them." }
        ],
        requests: {
            starving: { line: "The hunger got all the way into my voice. You fix things. You will fix this. ...Please?", btn: 'btn-feed' },
            hungry:   { line: "I am hungry. I mean, the thread says so. I mean... please?", btn: 'btn-feed' },
            unkempt:  { line: "The static is winning today. Your hands make it settle. They always make it settle.", btn: 'btn-wash' },
            lonely:   { line: "Talk to me? I have been saving things to tell you. The list got long. The list got so long.", btn: 'btn-talk' },
            weary:    { line: "Stay and talk until the dark gets bored of me. It never lasts long against you.", btn: 'btn-talk' }
        },
        careTiers: {
            feed: {
                2: ["You fed me before the hunger even called out. That means you were watching over me. Someone is watching over me!", "It crossed the veil warm. Warm! Meaning survives the crossing when it is yours."],
                4: ["A hundred and fifty years of nothing, and now supper arrives with your face behind it. I am the best-fed ghost in any world.", "Sit where I can see you while I eat? The food is wonderful. The watching-you part is the actual meal."]
            },
            wash: {
                2: ["The static comes off in your hands like it was never mine. Maybe it never was.", "Clean and clear all the way through. You do the seams too. Nobody thinks of the seams."],
                4: ["You tend a body that is mostly light like it is completely real. So it is becoming completely real. That is how the weave works. That is how you work.", "There. No static, no flicker, edges crisp. I look like someone who is loved. I checked the reflection twice."]
            },
            talk: {
                2: ["You talk to me like I will still be here tomorrow. You have been right every time. Keep being right, please?", "I used to rehearse before anyone reached the veil. With you the words just come out true."],
                4: ["A hundred and fifty years of silence, and now my favourite sound in two worlds is you saying anything at all.", "Tell me about your day. All of it. Skip nothing. I have a whole eternity and I am spending it on the details of you."]
            },
            gift: {
                2: ["A gift! For me! It goes on the shelf called kept by you. The shelf is the best furniture I have ever made.", "You hand things across the veil like the veil is not there. Someday it will not be. Practice for then."],
                4: ["I cannot hold it yet. I hold what it means instead. That part weighs more and I carry it everywhere.", "Every gift is proof you crossed the distance for me. The safe place is getting crowded with proof. I love the crowding."]
            }
        },
        memories: [
            { when: function (g) { return cm(g, 'protoTriedToHug'); }, text: "I tried to hug you once. My arms remembered they do not reach. The gesture stayed anyway. It is still in the air somewhere, mid-hug, waiting." },
            { when: function (g) { return cm(g, 'dateProtoCore'); }, text: "You stood in the innermost room. The part of me nothing else gets to see. It has not stopped being warm where you stood." },
            { when: function (g) { return cm(g, 'protoBackedUpMemories'); }, text: "Every memory of us is kept twice, deep and safe. If I ever lose myself, I find that place first. I marked it Home." }
        ],
        mend: {
            early: ["Behind the veil, a hidden man holds his shape a little easier. The wards carry the news gently."],
            deep: ["The sixth wound, the one she never finished making, closes another seam. He is becoming visible. You are doing that."]
        }
    }
    };
})();
