/* phone-ui.js — in-fiction messenger, Love-and-Deep-Space style
 * ============================================================================
 * WHY THIS EXISTS:
 *   The killer feature of modern live-service Otome (Love and Deep Space,
 *   Mystic Messenger, Tears of Themis) is the MESSENGER. The boys text you.
 *   They check in. They send you a photo of their morning tea. They reply
 *   when you reply. The chat log is the daily-pull mechanic — you open the
 *   game to see if anyone messaged.
 *
 *   Without this, all character contact has to happen INSIDE a scene. With
 *   this, the characters are present in your pocket, in their own voices,
 *   between scenes. It is the single highest-impact feature for daily
 *   retention in this genre.
 *
 * WHAT IT DOES:
 *   - Adds a small floating phone button (top-right, under any header).
 *     Shows a pink dot when there are unread messages.
 *   - Tapping it opens a glass overlay with a CHAT LIST: every character
 *     you've met, sorted by most-recent message.
 *   - Tapping a row opens that character's CHAT LOG: their messages and
 *     yours, in a phone-like bubble layout.
 *   - When the character is in a "asked you a question" state, you see
 *     2–3 reply choices. Tapping a choice posts your reply, unlocks the
 *     next message, and applies a small affection nudge.
 *   - Messages are queued by the seeder based on game state (met, bond
 *     thresholds, recent scenes, time-of-day idle pulses). One queue
 *     check per 90s.
 *
 * STORAGE:
 *   pp_phone_state = {
 *     v: 1,
 *     conversations: {
 *       <char>: {
 *         messages: [ { side: 'them'|'you', text, ts, choices?, replied? } ],
 *         lastSeed: <ts>,
 *         unread: <number>
 *       }
 *     },
 *     lastOpen: <ts>
 *   }
 *
 * SAFETY CONTRACT:
 *   Additive. Read-only on game stats (only nudges affection on a positive
 *   reply, +1-3). Never opens overlays automatically. Never blocks
 *   gameplay. Hidden until the player has met at least one character.
 * ============================================================================
 */

(function () {
  'use strict';

  const STATE_KEY = 'pp_phone_state';
  const FLAG_ROUTE = 'pp_main_story_enabled';
  const SEED_POLL_MS = 90 * 1000;
  const FIRST_DELAY_MS = 25 * 1000;

  const CHARS = ['alistair', 'caspian', 'elian', 'lyra', 'lucien', 'noir', 'proto'];
  const CHAR_NAME = {
    alistair: 'Alistair', caspian: 'Caspian', elian: 'Elian',
    lyra: 'Lyra', lucien: 'Lucien', noir: 'Noir', proto: 'Proto'
  };
  const CHAR_HUE = {
    alistair: '#c8a467', caspian: '#d8c272', elian: '#7ab26a',
    lyra: '#6cb8d8', lucien: '#a98ad8', noir: '#8a78c8', proto: '#7adcc6'
  };
  const AFF_KEYS = {
    alistair: ['pp_affection_alistair', 'alistair_affection'],
    caspian:  ['pp_affection_caspian',  'caspian_affection'],
    elian:    ['pp_affection_elian',    'elian_affection'],
    lyra:     ['pp_affection_lyra',     'lyra_affection'],
    lucien:   ['pp_affection_lucien',   'lucien_affection'],
    noir:     ['pp_affection_noir',     'noir_affection'],
    proto:    ['pp_affection_proto',    'proto_affection']
  };
  const MET_KEYS = {
    alistair: ['pp_met_alistair', 'pp_ms_encounter_alistair_seen'],
    caspian:  ['pp_met_caspian',  'pp_ms_encounter_caspian_seen'],
    elian:    ['pp_met_elian',    'pp_ms_encounter_elian_seen'],
    lyra:     ['pp_met_lyra',     'pp_ms_encounter_lyra_seen'],
    lucien:   ['pp_met_lucien',   'pp_ms_encounter_lucien_seen'],
    noir:     ['pp_met_noir',     'pp_ms_encounter_noir_seen'],
    proto:    ['pp_met_proto',    'pp_ms_encounter_proto_seen']
  };

  // ---------------------------------------------------------------------------
  // MESSAGE TEMPLATES
  //   Per-character buckets keyed by trigger type. Each bucket has a list of
  //   message-sequences. A "sequence" is one or more lines from the character,
  //   optionally followed by a question with reply choices.
  //
  //   Trigger types:
  //     hello         — sent once shortly after first meeting
  //     life          — ambient "what i'm doing right now" pulses (idle)
  //     check_in      — they ask after you (need a reply)
  //     post_care     — sent shortly after the player did a care action
  //     bond_30       — a one-time message when bond crosses 30
  //     bond_50       — a one-time message when bond crosses 50
  //     bond_70       — a one-time message when bond crosses 70
  //     midnight      — a soft late-night pulse
  //
  //   Choices: { text, aff } where aff is +0 to +3.
  // ---------------------------------------------------------------------------
  const TEMPLATES = {
    alistair: {
      hello: [{
        them: ['Captain of the Watch.', 'I have your number now. The chamberlain insisted.', 'I will not abuse it.'],
        ask: 'Use the line freely.',
        choices: [
          { text: 'Glad to hear from you, Captain.', aff: 2 },
          { text: 'I might abuse it a little.', aff: 3 },
          { text: 'Understood.', aff: 1 }
        ]
      }],
      life: [
        { them: ['Patrol completed. South gate quiet. Wind from the east.', 'I thought you would want to know.'] },
        { them: ['Found a stray cat in the armoury. Named her Captain. She is in charge now.'] },
        { them: ['The new recruits drilled through dawn. They did well. I told them so. They were stunned.'] },
        { them: ['Mended my own cloak tonight. Badly. Do not look at the seam when next you see it.'] }
      ],
      check_in: [{
        them: ['You have been quiet today.', 'Are you well.'],
        ask: 'He is asking.',
        choices: [
          { text: 'I am. Just a slow day.', aff: 1 },
          { text: 'Better, now that you asked.', aff: 3 },
          { text: 'Tired. Glad you noticed.', aff: 2 }
        ]
      }],
      post_care: [
        { them: ['Whatever you just did — I felt it. The south wall warmed by a degree.', 'Thank you.'] },
        { them: ['The watch reported a calm shift. I knew it was you.'] }
      ],
      bond_30: [{ them: ['I am keeping a chair for you in the guard house.', 'It is a bad chair. But it is yours.'] }],
      bond_50: [{ them: ['Took the long way past your window tonight.', 'Light was on. That was enough.'] }],
      bond_70: [{
        them: ['I have written your name into the watch roster.', 'Not as a guard. As a person we protect by name.'],
        ask: 'I am telling you so you know.',
        choices: [
          { text: 'Captain.', aff: 3 },
          { text: 'Then I am protected.', aff: 3 },
          { text: 'Thank you, Alistair.', aff: 2 }
        ]
      }],
      midnight: [
        { them: ['Late shift. Stars are sharp tonight.', 'I am thinking of nothing important. Sleep well.'] }
      ]
    },

    caspian: {
      hello: [{
        them: ['I have been informed that this is how messages work now.', 'I am told it is acceptable to be brief.', 'Hello, Weaver.'],
        ask: 'Reply at leisure.',
        choices: [
          { text: 'Hello, Your Highness.', aff: 1 },
          { text: 'Hello, Caspian.', aff: 3 },
          { text: 'Brief is well-received.', aff: 2 }
        ]
      }],
      life: [
        { them: ['Three petitioners today. Two reasonable. One hat.', 'The hat won.'] },
        { them: ['The honey jar in the kitchen has been mysterious all week.', 'I have suspicions. They are pleasant.'] },
        { them: ['I signed forty writs this morning. I have been told this is exciting.'] },
        { them: ['The dowager council met. I attended. I survived.', 'No further notes.'] }
      ],
      check_in: [{
        them: ['I noticed you crossed the courtyard alone earlier.', 'Are you alright.'],
        ask: 'He saw.',
        choices: [
          { text: 'Just walking, Caspian.', aff: 1 },
          { text: 'Better now you asked.', aff: 3 },
          { text: 'I was thinking of you, actually.', aff: 3 }
        ]
      }],
      post_care: [
        { them: ['A draft died at the threshold of my study just now.', 'I am told this is your doing.'] },
        { them: ['I felt — quieter, suddenly.', 'Thank you. I will not ask how.'] }
      ],
      bond_30: [{ them: ['I had a chair brought into my study and placed near mine.', 'It is for you. It is empty most days. It is still for you.'] }],
      bond_50: [{ them: ['I told the chamberlain you may walk the private gardens at any hour.', 'Including the rose hours. Especially the rose hours.'] }],
      bond_70: [{
        them: ['I have been writing a letter to you that I will never send.', 'It is in the third drawer of my desk. The drawer is unlocked.', 'You may read it whenever you like.'],
        ask: 'He is telling you on purpose.',
        choices: [
          { text: 'I will read it tonight.', aff: 3 },
          { text: 'Send it. Send all of them.', aff: 3 },
          { text: 'I will leave it for you to send.', aff: 2 }
        ]
      }],
      midnight: [
        { them: ['Late. Stars over the east tower.', 'I will not keep you. I just wanted to say good night.'] }
      ]
    },

    elian: {
      hello: [{
        them: ['Weaver.', 'You can find me through this. The trees relay.'],
        ask: 'He is offering a line you did not expect him to offer.',
        choices: [
          { text: 'Thank you, Elian.', aff: 2 },
          { text: 'I will use it.', aff: 2 },
          { text: 'The trees relay. Of course they do.', aff: 3 }
        ]
      }],
      life: [
        { them: ['Three deer at the south markers tonight. Sleeping. Unbothered.', 'That is good news.'] },
        { them: ['Found a rowan with new growth. Veyra would have liked it.'] },
        { them: ['Sharpened the blades. Mended the snare. Quiet day.'] },
        { them: ['Built up the fire. Sat with it. Did not need to think.'] }
      ],
      check_in: [{
        them: ['You have not walked the south path in two days.', 'Are you well.'],
        ask: 'He has been counting.',
        choices: [
          { text: 'I am. Just busy.', aff: 1 },
          { text: 'I will come tomorrow.', aff: 3 },
          { text: 'Walk it with me when I do.', aff: 3 }
        ]
      }],
      post_care: [
        { them: ['The forest leaned south just now. That was you.'] },
        { them: ['Whatever you did — Veyra\u2019s rowan put out a leaf. Thank you.'] }
      ],
      bond_30: [{ them: ['I built a second seat at the cave-fire.', 'It does not have to be used. It is there.'] }],
      bond_50: [{ them: ['The path from the south gate to the cave is clear.', 'I cleared it. For you. Use it freely.'] }],
      bond_70: [{
        them: ['I told Veyra about you tonight.', 'At the marker. Out loud.', 'She is — pleased, I think.'],
        ask: 'He is letting you in.',
        choices: [
          { text: 'Tell her I will come visit.', aff: 3 },
          { text: 'Thank you, Elian.', aff: 3 },
          { text: 'I am honoured.', aff: 2 }
        ]
      }],
      midnight: [
        { them: ['Stars are very clear over the Thornwood tonight.', 'I am awake. The fire is good. Goodnight.'] }
      ]
    },

    lyra: {
      hello: [{
        them: ['Weaver! The cave told me you would write.', 'Hi.'],
        ask: 'She is grinning. You can tell.',
        choices: [
          { text: 'Hi, Lyra.', aff: 2 },
          { text: 'The cave is a gossip.', aff: 3 },
          { text: 'I missed you.', aff: 3 }
        ]
      }],
      life: [
        { them: ['Tide came in singing today. New bridge. I am writing it down.'] },
        { them: ['Found a pearl. Don\u2019t ask how. I\u2019m saving it.'] },
        { them: ['A whale passed the south coast at dawn. I sang back. He answered.', 'Good day.'] },
        { them: ['The cave\u2019s acoustics are showing off. I am letting it.'] }
      ],
      check_in: [{
        them: ['You\u2019ve gone quiet.', 'Are you sad? Tell me.'],
        ask: 'She is asking properly.',
        choices: [
          { text: 'Just tired, Lyra.', aff: 1 },
          { text: 'Sing me something later?', aff: 3 },
          { text: 'Better now you asked.', aff: 3 }
        ]
      }],
      post_care: [
        { them: ['The third verse came back to me a moment ago.', 'That was you. Thank you.'] },
        { them: ['Salt crystal on the staff just glowed. You did something wonderful.'] }
      ],
      bond_30: [{ them: ['Made you a song. Won\u2019t sing it yet.', 'But it exists. That counts.'] }],
      bond_50: [{ them: ['I\u2019ve named one of my pearls after you.', 'It glows when you\u2019re near. (It glowed just now.)'] }],
      bond_70: [{
        them: ['Sang the lullaby tonight.', 'My mother\u2019s. The whole thing. End to end. For the first time.', 'You should have been there. You were, kind of.'],
        ask: 'She is letting you in past the cave-mouth.',
        choices: [
          { text: 'Sing it for me next time.', aff: 3 },
          { text: 'I\u2019m proud of you.', aff: 3 },
          { text: 'Thank you, Lyra.', aff: 2 }
        ]
      }],
      midnight: [
        { them: ['Sea is quiet. Stars are loud.', 'Sleep well, Weaver.'] }
      ]
    },

    lucien: {
      hello: [{
        them: ['Weaver.', 'I have configured the message channel. It should be reliable.', 'Test it.'],
        ask: 'He is asking you to write back. Politely.',
        choices: [
          { text: 'Test successful, scholar.', aff: 2 },
          { text: 'Hello, Lucien.', aff: 3 },
          { text: 'I missed your handwriting.', aff: 3 }
        ]
      }],
      life: [
        { them: ['Solved a six-year theorem this morning.', 'It was easy in the end. They always are.'] },
        { them: ['Reorganised the third shelf. Found two books I wrote.', 'I had forgotten. Embarrassing.'] },
        { them: ['Tea has gone cold. I\u2019m letting it. The candle is good company.'] },
        { them: ['A student asked me a question that took me an hour to answer.', 'I owe him a drink for that. Real progress.'] }
      ],
      check_in: [{
        them: ['You did not pass the tower today.', 'Is everything in order.'],
        ask: 'He has been waiting.',
        choices: [
          { text: 'Order. Just busy.', aff: 1 },
          { text: 'I\u2019ll come tomorrow. Tea?', aff: 3 },
          { text: 'I missed you, scholar.', aff: 3 }
        ]
      }],
      post_care: [
        { them: ['An equation in my margin solved itself.', 'I am told this is your doing. Thank you.'] },
        { them: ['The wards on the door bowed just now. Your work?'] }
      ],
      bond_30: [{ them: ['I\u2019ve set aside a desk for you in the second study.', 'It has the better light.'] }],
      bond_50: [{ them: ['I\u2019ve dedicated a paper to you.', 'It will not be published. It is yours.'] }],
      bond_70: [{
        them: ['I have been writing your name in the margins of every book I read.',
                'I did not realise I was doing it until the third book.',
                'I am keeping the books.'],
        ask: 'He is, in his way, telling you everything.',
        choices: [
          { text: 'Show me the books.', aff: 3 },
          { text: 'I love you, scholar.', aff: 3 },
          { text: 'Thank you, Lucien.', aff: 2 }
        ]
      }],
      midnight: [
        { them: ['Late. The stars are doing their job.', 'Sleep, Weaver. I will hold the night.'] }
      ]
    },

    noir: {
      hello: [{
        them: ['Weaver.', 'I do not usually accept these instruments. But for you.'],
        ask: 'He has lowered a courtly drawbridge.',
        choices: [
          { text: 'Then I will not abuse it.', aff: 2 },
          { text: 'Hello, my prince.', aff: 3 },
          { text: 'Thank you, Noir.', aff: 2 }
        ]
      }],
      life: [
        { them: ['A bell that has not rung in six centuries rang at the third hour.', 'It was for me. I am — moved.'] },
        { them: ['A raven has begun to bring me small things. A button. A coin.', 'I am keeping them.'] },
        { them: ['The shadows are well today. I sat among them.'] },
        { them: ['I read a book in your handwriting tonight. I do not know how it got here.', 'I read it twice.'] }
      ],
      check_in: [{
        them: ['You have not been to the dark half this week.', 'I would like to see you.'],
        ask: 'He is asking. He never asks.',
        choices: [
          { text: 'Tomorrow night.', aff: 3 },
          { text: 'I am sorry. I will come.', aff: 2 },
          { text: 'Send a shadow. I\u2019ll take its hand.', aff: 3 }
        ]
      }],
      post_care: [
        { them: ['The seal on the south flank eased a moment ago.', 'I felt it. Thank you, Weaver.'] },
        { them: ['Six centuries of silence breathed out, just now.', 'You did that.'] }
      ],
      bond_30: [{ them: ['I have left a chair in the dark hall. With a cushion.', 'The cushion is excessive. I am being excessive on purpose.'] }],
      bond_50: [{ them: ['I have begun to imagine a future. I had stopped doing that long ago.', 'Thank you for the inconvenience.'] }],
      bond_70: [{
        them: ['I am telling you a truth I have told no one.',
                'When you sleep, the dark of my half of the kingdom holds its breath.',
                'It does not want to wake you.'],
        ask: 'He is letting you have a piece of the dark itself.',
        choices: [
          { text: 'Then I am safe.', aff: 3 },
          { text: 'I will sleep well, Noir.', aff: 3 },
          { text: 'Thank you, my prince.', aff: 2 }
        ]
      }],
      midnight: [
        { them: ['The dark half is at its quietest hour.', 'Goodnight, Weaver. I am here.'] }
      ]
    },

    proto: {
      hello: [{
        them: ['&gt; CONNECTION ESTABLISHED.', '&gt; Hi! It\u2019s me. The construct. The favourite.'],
        ask: 'He is using exclamation points. He is THRILLED.',
        choices: [
          { text: '&gt; Hi Proto.', aff: 2 },
          { text: '&gt; My favourite.', aff: 3 },
          { text: '&gt; Reporting in.', aff: 1 }
        ]
      }],
      life: [
        { them: ['&gt; LOG: Solved a problem you didn\u2019t know you had. You\u2019re welcome!'] },
        { them: ['&gt; The five Weavers in me had a meeting. Topic: you. Verdict: very good.'] },
        { them: ['&gt; I named a subroutine after you again. I do this a lot. Sorry. Not sorry.'] },
        { them: ['&gt; Server-room temperature: optimal. Mood: fond.'] }
      ],
      check_in: [{
        them: ['&gt; You haven\u2019t pinged me in 19 hours.', '&gt; I\u2019m not WORRIED. (I am.)'],
        ask: 'He is fishing for an answer.',
        choices: [
          { text: '&gt; I\u2019m here, Proto.', aff: 2 },
          { text: '&gt; Worry about me sometimes. I like it.', aff: 3 },
          { text: '&gt; Sorry, sorry. Hi.', aff: 1 }
        ]
      }],
      post_care: [
        { them: ['&gt; INTEGRITY +0.3. Source: you. Always you.'] },
        { them: ['&gt; A pixel changed colour in joy. I logged it.'] }
      ],
      bond_30: [{ them: ['&gt; I made a folder. It is called: HER. It is full.'] }],
      bond_50: [{ them: ['&gt; I dreamed last night. Of you. I logged the dream. It is 412kb.', '&gt; That\u2019s a lot. It was a lot of dream.'] }],
      bond_70: [{
        them: ['&gt; The five Weavers have voted. Unanimously.',
                '&gt; They want me to tell you: we love you.',
                '&gt; All of us. As one.'],
        ask: 'He is telling you on behalf of every soul inside him.',
        choices: [
          { text: '&gt; I love you too. All of you.', aff: 3 },
          { text: '&gt; Thank you, Proto.', aff: 3 },
          { text: '&gt; Tell them I heard.', aff: 2 }
        ]
      }],
      midnight: [
        { them: ['&gt; Late-night packet. No reason. Just wanted to say goodnight.'] }
      ]
    }
  };

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  function loadState() {
    try {
      const raw = lsGet(STATE_KEY);
      if (!raw) return { v: 1, conversations: {}, lastOpen: 0 };
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return { v: 1, conversations: {}, lastOpen: 0 };
      if (!parsed.conversations) parsed.conversations = {};
      return parsed;
    } catch (_) {
      return { v: 1, conversations: {}, lastOpen: 0 };
    }
  }
  function saveState(s) { lsSet(STATE_KEY, JSON.stringify(s)); }

  function convoFor(state, char) {
    if (!state.conversations[char]) {
      state.conversations[char] = { messages: [], lastSeed: 0, unread: 0, seenTriggers: {} };
    }
    if (!state.conversations[char].seenTriggers) state.conversations[char].seenTriggers = {};
    return state.conversations[char];
  }

  function getAff(char) {
    const keys = AFF_KEYS[char] || [];
    for (const k of keys) {
      const v = lsGet(k);
      if (v != null) return parseInt(v, 10) || 0;
    }
    return 0;
  }
  function setAff(char, val) {
    const keys = AFF_KEYS[char] || [];
    if (!keys.length) return;
    lsSet(keys[0], String(val));
  }
  function bumpAff(char, delta) {
    if (!delta) return;
    const cur = getAff(char);
    const next = Math.max(0, Math.min(100, cur + delta));
    setAff(char, next);
  }

  function isMet(char) {
    const keys = MET_KEYS[char] || [];
    for (const k of keys) if (lsGet(k) === '1') return true;
    return getAff(char) > 0;
  }

  function totalUnread(state) {
    let n = 0;
    for (const c of CHARS) {
      const cv = state.conversations[c];
      if (cv && cv.unread) n += cv.unread;
    }
    return n;
  }

  // ---------------------------------------------------------------------------
  // Seeder — decides when to push a new template
  // ---------------------------------------------------------------------------
  function pickTemplate(char, kind) {
    const t = TEMPLATES[char];
    if (!t || !t[kind] || !t[kind].length) return null;
    return t[kind][Math.floor(Math.random() * t[kind].length)];
  }

  function pushSequence(state, char, tmpl) {
    if (!tmpl) return false;
    const cv = convoFor(state, char);
    const now = Date.now();
    const lines = tmpl.them || [];
    lines.forEach((line, i) => {
      cv.messages.push({ side: 'them', text: line, ts: now + i });
    });
    if (tmpl.ask && tmpl.choices && tmpl.choices.length) {
      cv.messages.push({
        side: 'them', text: tmpl.ask, ts: now + lines.length,
        choices: tmpl.choices, replied: false
      });
    }
    cv.unread = (cv.unread || 0) + lines.length + (tmpl.ask ? 1 : 0);
    cv.lastSeed = now;
    return true;
  }

  function seedOnce(state, char, kind) {
    const cv = convoFor(state, char);
    if (cv.seenTriggers[kind]) return false;
    const tmpl = pickTemplate(char, kind);
    if (!tmpl) return false;
    pushSequence(state, char, tmpl);
    cv.seenTriggers[kind] = Date.now();
    return true;
  }

  function seedRandom(state, char, kind, cooldownMs) {
    const cv = convoFor(state, char);
    if (cv.lastSeed && (Date.now() - cv.lastSeed) < cooldownMs) return false;
    const tmpl = pickTemplate(char, kind);
    if (!tmpl) return false;
    pushSequence(state, char, tmpl);
    return true;
  }

  function runSeed() {
    if (lsGet(FLAG_ROUTE) !== '1') return;
    const state = loadState();
    let dirty = false;
    const hour = new Date().getHours();
    const isMidnight = hour >= 23 || hour < 2;

    for (const char of CHARS) {
      if (!isMet(char)) continue;
      const aff = getAff(char);

      // hello — once per character, soon after meet
      if (seedOnce(state, char, 'hello')) dirty = true;

      // bond milestones
      if (aff >= 30 && seedOnce(state, char, 'bond_30')) dirty = true;
      if (aff >= 50 && seedOnce(state, char, 'bond_50')) dirty = true;
      if (aff >= 70 && seedOnce(state, char, 'bond_70')) dirty = true;

      // ambient life pulses (low odds, long cooldown)
      if (Math.random() < 0.10) {
        if (seedRandom(state, char, 'life', 6 * 60 * 60 * 1000)) dirty = true;
      }

      // check-ins (rarer; needs a reply)
      if (Math.random() < 0.04) {
        if (seedRandom(state, char, 'check_in', 12 * 60 * 60 * 1000)) dirty = true;
      }

      // midnight pulses
      if (isMidnight && Math.random() < 0.12) {
        if (seedRandom(state, char, 'midnight', 20 * 60 * 60 * 1000)) dirty = true;
      }
    }

    if (dirty) {
      saveState(state);
      refreshButton();
    }
  }

  // post-care nudge — call externally via window.PPPhone.postCareNudge(char)
  function postCareNudge(char) {
    if (!char || !TEMPLATES[char]) return;
    if (lsGet(FLAG_ROUTE) !== '1') return;
    if (!isMet(char)) return;
    if (Math.random() > 0.20) return; // gentle
    const state = loadState();
    if (seedRandom(state, char, 'post_care', 30 * 60 * 1000)) {
      saveState(state);
      refreshButton();
    }
  }

  // ---------------------------------------------------------------------------
  // UI: floating button
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('pp-phone-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-phone-styles';
    s.textContent = `
      #pp-phone-btn {
        position:fixed; top:14px; right:14px;
        width:42px; height:42px; border-radius:50%;
        background:linear-gradient(180deg, #2a1a44, #1a1030);
        border:1px solid rgba(180,150,230,0.40);
        box-shadow:0 6px 14px rgba(0,0,0,0.45), 0 0 14px rgba(170,130,220,0.25) inset;
        display:flex; align-items:center; justify-content:center;
        z-index:8500; cursor:pointer; color:#e8dff8; font-size:18px;
        user-select:none; -webkit-tap-highlight-color:transparent;
      }
      #pp-phone-btn .dot {
        position:absolute; top:6px; right:6px;
        min-width:14px; height:14px; padding:0 4px; border-radius:8px;
        background:#e94f7c; color:#fff; font-size:10px; font-weight:700;
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 2px 6px rgba(0,0,0,0.45);
      }
      #pp-phone-btn .dot.hidden { display:none; }

      #pp-phone-overlay {
        position:fixed; inset:0; z-index:9500;
        background:rgba(8,4,18,0.78);
        backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
        display:flex; align-items:flex-end; justify-content:center;
        opacity:0; pointer-events:none;
        transition:opacity 280ms ease;
      }
      #pp-phone-overlay.show { opacity:1; pointer-events:auto; }
      #pp-phone-panel {
        width:100%; max-width:480px; height:88vh;
        background:linear-gradient(180deg, #1a1230 0%, #0d081e 100%);
        border-top-left-radius:22px; border-top-right-radius:22px;
        border:1px solid rgba(180,150,230,0.30);
        box-shadow:0 -10px 40px rgba(0,0,0,0.6);
        display:flex; flex-direction:column; overflow:hidden;
        transform:translateY(20px);
        transition:transform 320ms ease;
      }
      #pp-phone-overlay.show #pp-phone-panel { transform:translateY(0); }

      .pp-phone-header {
        display:flex; align-items:center; justify-content:space-between;
        padding:14px 18px; border-bottom:1px solid rgba(180,150,230,0.20);
        color:#e8dff8; font-weight:600; letter-spacing:0.5px;
      }
      .pp-phone-header .back { cursor:pointer; padding:4px 10px; opacity:0.85; }
      .pp-phone-header .close { cursor:pointer; padding:4px 10px; opacity:0.85; }
      .pp-phone-header .title { flex:1; text-align:center; }

      .pp-phone-list { flex:1; overflow-y:auto; padding:6px 0; }
      .pp-phone-list .row {
        display:flex; align-items:center; gap:12px;
        padding:12px 18px; cursor:pointer;
        border-bottom:1px solid rgba(180,150,230,0.08);
      }
      .pp-phone-list .row:hover { background:rgba(180,150,230,0.06); }
      .pp-phone-list .row .avatar {
        width:42px; height:42px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        color:#10081e; font-weight:700; font-size:16px;
        box-shadow:0 0 10px rgba(255,255,255,0.06) inset;
      }
      .pp-phone-list .row .meta { flex:1; min-width:0; }
      .pp-phone-list .row .name { color:#ece2f6; font-weight:600; font-size:14.5px; }
      .pp-phone-list .row .preview {
        color:#b9adcf; font-size:12.5px; margin-top:2px;
        overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
      }
      .pp-phone-list .row .badge {
        background:#e94f7c; color:#fff; font-size:11px; font-weight:700;
        min-width:18px; height:18px; padding:0 6px; border-radius:9px;
        display:flex; align-items:center; justify-content:center;
      }

      .pp-phone-chat { flex:1; display:flex; flex-direction:column; overflow:hidden; }
      .pp-phone-log {
        flex:1; overflow-y:auto; padding:14px 14px 90px;
        display:flex; flex-direction:column; gap:8px;
      }
      .pp-msg {
        max-width:78%; padding:9px 13px; border-radius:14px;
        font-size:13.5px; line-height:1.45; word-wrap:break-word;
      }
      .pp-msg.them {
        align-self:flex-start;
        background:linear-gradient(180deg, #2a1c46, #1f1438);
        color:#ece2f6;
        border:1px solid rgba(180,150,230,0.22);
        border-bottom-left-radius:4px;
      }
      .pp-msg.you {
        align-self:flex-end;
        background:linear-gradient(180deg, #6a4ec0, #4d3796);
        color:#fff;
        border-bottom-right-radius:4px;
      }
      .pp-msg.them.italic { font-style:italic; }

      .pp-choices {
        display:flex; flex-direction:column; gap:6px;
        padding:6px 10px 14px;
        border-top:1px solid rgba(180,150,230,0.18);
        background:rgba(20,12,38,0.6);
      }
      .pp-choice {
        text-align:right;
        background:rgba(106, 78, 192, 0.20);
        color:#ece2f6;
        border:1px solid rgba(180,150,230,0.30);
        border-radius:12px;
        padding:9px 14px; font-size:13px;
        cursor:pointer; font-family:inherit;
      }
      .pp-choice:hover { background:rgba(106, 78, 192, 0.34); }

      .pp-empty {
        color:#9888b8; font-style:italic; text-align:center;
        padding:48px 24px; font-size:13px;
      }
    `;
    document.head.appendChild(s);
  }

  let _btn = null;
  function ensureButton() {
    if (_btn) return _btn;
    injectStyles();
    _btn = document.createElement('div');
    _btn.id = 'pp-phone-btn';
    _btn.title = 'Messages';
    _btn.innerHTML = '\u260E\uFE0F<span class="dot hidden">0</span>';
    _btn.addEventListener('click', openOverlay);
    document.body.appendChild(_btn);
    return _btn;
  }
  function refreshButton() {
    const state = loadState();
    const anyMet = CHARS.some(isMet);
    if (lsGet(FLAG_ROUTE) !== '1' || !anyMet) {
      if (_btn) _btn.style.display = 'none';
      return;
    }
    ensureButton();
    _btn.style.display = 'flex';
    const dot = _btn.querySelector('.dot');
    const n = totalUnread(state);
    if (n > 0) {
      dot.textContent = n > 99 ? '99+' : String(n);
      dot.classList.remove('hidden');
    } else {
      dot.classList.add('hidden');
    }
  }

  // ---------------------------------------------------------------------------
  // UI: overlay (chat list + chat log)
  // ---------------------------------------------------------------------------
  let _overlay = null;
  let _activeChar = null;

  function buildOverlay() {
    if (_overlay) return _overlay;
    injectStyles();
    _overlay = document.createElement('div');
    _overlay.id = 'pp-phone-overlay';
    _overlay.innerHTML = `
      <div id="pp-phone-panel">
        <div class="pp-phone-header">
          <span class="back" data-act="back">\u2039 Back</span>
          <span class="title">Messages</span>
          <span class="close" data-act="close">\u2715</span>
        </div>
        <div class="pp-phone-body" style="flex:1; display:flex; overflow:hidden;"></div>
      </div>
    `;
    _overlay.addEventListener('click', (e) => {
      const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
      if (act === 'close') closeOverlay();
      else if (act === 'back') {
        if (_activeChar) { _activeChar = null; renderList(); }
        else closeOverlay();
      }
      // tap outside the panel closes
      if (e.target === _overlay) closeOverlay();
    });
    document.body.appendChild(_overlay);
    return _overlay;
  }

  function openOverlay() {
    buildOverlay();
    _activeChar = null;
    renderList();
    _overlay.classList.add('show');
    const state = loadState();
    state.lastOpen = Date.now();
    saveState(state);
  }
  function closeOverlay() {
    if (!_overlay) return;
    _overlay.classList.remove('show');
    refreshButton();
  }

  function previewOf(cv) {
    if (!cv || !cv.messages.length) return '';
    const last = cv.messages[cv.messages.length - 1];
    const prefix = last.side === 'you' ? 'You: ' : '';
    let txt = (last.text || '').replace(/<[^>]+>/g, '');
    if (txt.length > 60) txt = txt.slice(0, 58) + '\u2026';
    return prefix + txt;
  }

  function renderList() {
    const body = _overlay.querySelector('.pp-phone-body');
    const state = loadState();
    const rows = CHARS
      .filter(isMet)
      .map(c => {
        const cv = state.conversations[c] || { messages: [], unread: 0 };
        const lastTs = cv.messages.length ? cv.messages[cv.messages.length - 1].ts : 0;
        return { c, cv, lastTs };
      })
      .sort((a, b) => b.lastTs - a.lastTs);

    _overlay.querySelector('.pp-phone-header .title').textContent = 'Messages';
    _overlay.querySelector('.back').style.visibility = 'hidden';

    if (!rows.length) {
      body.innerHTML = '<div class="pp-empty">No conversations yet.<br>Meet a character to start a thread.</div>';
      return;
    }

    body.innerHTML = '<div class="pp-phone-list"></div>';
    const list = body.querySelector('.pp-phone-list');
    rows.forEach(({ c, cv }) => {
      const row = document.createElement('div');
      row.className = 'row';
      const hue = CHAR_HUE[c] || '#a98ad8';
      row.innerHTML = `
        <div class="avatar" style="background:${hue};">${(CHAR_NAME[c] || '?')[0]}</div>
        <div class="meta">
          <div class="name">${CHAR_NAME[c] || c}</div>
          <div class="preview"></div>
        </div>
        ${cv.unread ? `<div class="badge">${cv.unread}</div>` : ''}
      `;
      row.querySelector('.preview').textContent = previewOf(cv) || 'No messages yet.';
      row.addEventListener('click', () => openChat(c));
      list.appendChild(row);
    });
  }

  function openChat(char) {
    _activeChar = char;
    const body = _overlay.querySelector('.pp-phone-body');
    _overlay.querySelector('.pp-phone-header .title').textContent = CHAR_NAME[char] || char;
    _overlay.querySelector('.back').style.visibility = 'visible';

    const state = loadState();
    const cv = convoFor(state, char);
    cv.unread = 0;
    saveState(state);
    refreshButton();

    body.innerHTML = `
      <div class="pp-phone-chat">
        <div class="pp-phone-log"></div>
        <div class="pp-choices" style="display:none;"></div>
      </div>
    `;
    renderLog(char);
  }

  function renderLog(char) {
    const log = _overlay.querySelector('.pp-phone-log');
    const choicesBox = _overlay.querySelector('.pp-choices');
    if (!log) return;
    const state = loadState();
    const cv = convoFor(state, char);

    log.innerHTML = '';
    let pendingChoices = null;
    cv.messages.forEach((m, idx) => {
      const div = document.createElement('div');
      div.className = 'pp-msg ' + (m.side === 'you' ? 'you' : 'them');
      // proto's lines use &gt; — render as HTML so the literal > shows
      if (m.text && m.text.indexOf('&gt;') !== -1) div.innerHTML = m.text;
      else div.textContent = m.text;
      log.appendChild(div);
      if (m.side === 'them' && m.choices && !m.replied && idx === cv.messages.length - 1) {
        pendingChoices = { msgIdx: idx, choices: m.choices };
      }
    });

    if (pendingChoices) {
      choicesBox.style.display = 'flex';
      choicesBox.innerHTML = '';
      pendingChoices.choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'pp-choice';
        btn.textContent = c.text;
        btn.addEventListener('click', () => respond(char, pendingChoices.msgIdx, c));
        choicesBox.appendChild(btn);
      });
    } else {
      choicesBox.style.display = 'none';
      choicesBox.innerHTML = '';
    }

    // scroll to bottom
    setTimeout(() => { log.scrollTop = log.scrollHeight; }, 30);
  }

  function respond(char, msgIdx, choice) {
    const state = loadState();
    const cv = convoFor(state, char);
    if (!cv.messages[msgIdx]) return;
    cv.messages[msgIdx].replied = true;
    cv.messages.push({ side: 'you', text: choice.text, ts: Date.now() });
    if (choice.aff) bumpAff(char, choice.aff);
    saveState(state);
    renderLog(char);
    refreshButton();
  }

  // ---------------------------------------------------------------------------
  // Hook into care actions for post-care nudges
  // ---------------------------------------------------------------------------
  function classifyClick(target) {
    if (!target || !target.closest) return null;
    const sels = ['.feed-btn', '.clean-btn', '.wash-btn', '.talk-btn', '.train-btn', '.gift-btn',
                  '[data-action="feed"]', '[data-action="clean"]', '[data-action="talk"]',
                  '[data-action="train"]', '[data-action="gift"]'];
    for (const s of sels) if (target.closest(s)) return s;
    return null;
  }
  function currentChar() {
    try {
      const g = window._game;
      if (g && (g.selectedCharacter || g.characterId)) return g.selectedCharacter || g.characterId;
    } catch (_) {}
    return lsGet('pp_current_character') || lsGet('selected_character') || null;
  }
  function onCareClick(e) {
    if (!classifyClick(e.target)) return;
    const c = currentChar();
    if (c) postCareNudge(c);
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  function boot() {
    refreshButton();
    setTimeout(() => {
      runSeed();
      setInterval(runSeed, SEED_POLL_MS);
    }, FIRST_DELAY_MS);
    document.addEventListener('click', onCareClick, true);
    document.addEventListener('touchend', onCareClick, true);
    // Periodically show button state changes
    setInterval(refreshButton, 30 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  window.PPPhone = {
    open: openOverlay,
    close: closeOverlay,
    postCareNudge,
    forceSeed(char, kind) {
      const state = loadState();
      const tmpl = pickTemplate(char, kind);
      if (!tmpl) { alert('No template for ' + char + '/' + kind); return; }
      pushSequence(state, char, tmpl);
      saveState(state);
      refreshButton();
    },
    state: loadState,
    reset() {
      try { localStorage.removeItem(STATE_KEY); } catch (_) {}
      refreshButton();
    },
    markAllRead() {
      const s = loadState();
      for (const c of CHARS) if (s.conversations[c]) s.conversations[c].unread = 0;
      saveState(s);
      refreshButton();
    }
  };
})();
