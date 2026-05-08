/* small-moments.js — the kilig engine.
 * ============================================================================
 * WHY THIS EXISTS:
 *   The audit found that Pocket Paramour delivers romance through narration in
 *   chapters, but the daily care loop has zero "kilig" beats — those small,
 *   real-time moments where the character does something physical or
 *   flirtatious and the player has to react. That gap is why Day 12 of play
 *   feels less alive than Day 5: the player has consumed the high-craft set
 *   pieces (letters, surprises, turning points) and is left with stat-tapping.
 *
 *   Small Moments fill the gap. Per character, ~5 short scenes that fire at
 *   random during care. Each is structured as:
 *     - One stage-direction line (italic, sets the moment)
 *     - One binary player choice (how do you respond?)
 *     - One short character response (the payoff)
 *
 *   No plot weight. Pure emotion. Tiny stat bumps. The variable-reward
 *   engine the daily loop needs.
 *
 * COORDINATION:
 *   Hooks into PPAmbient (firstHourBusy / tickAllowed) so it never collides
 *   with chains, scenes, modals, or the prologue. 8–14 minute cooldown
 *   between fires (variable so unpredictable). Each moment fires once per
 *   character per save.
 *
 * SAFETY CONTRACT:
 *   - Read-only on stats except via the small bumps in onChoose.
 *   - Never fires during scene/intro/chain/overlay (ambient-coordinator).
 *   - Guarded by feature flag pp_small_moments_enabled — defaults ON.
 *   - Mini-render mounts as #pp-sm-root, watchdog-cleanable.
 * ============================================================================
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Storage keys
  // ---------------------------------------------------------------------------
  const FLAG_KEY    = 'pp_small_moments_enabled';
  const SEEN_PREFIX = 'pp_sm_seen_';      // + charId → JSON array of moment ids
  const COOLDOWN_K  = 'pp_sm_last_fire';  // timestamp ms of last fire
  const POLL_MS     = 30 * 1000;          // poll every 30s
  const MIN_COOLDOWN_MS = 8 * 60 * 1000;  // 8 min minimum
  const MAX_COOLDOWN_MS = 14 * 60 * 1000; // 14 min maximum
  const FIRE_CHANCE = 0.30;               // 30% per eligible tick
  const MIN_AFF_DEFAULT = 1;              // default affection gate
  const SETTLE_MS   = 90 * 1000;          // 90s after session start before fires

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  function isEnabled() {
    try {
      // Defaults to ON. Can be turned off explicitly by setting key to '0'.
      return lsGet(FLAG_KEY) !== '0';
    } catch (_) { return true; }
  }

  function getSeen(charId) {
    try {
      const raw = lsGet(SEEN_PREFIX + charId);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }
  function markSeen(charId, momentId) {
    try {
      const arr = getSeen(charId);
      if (arr.indexOf(momentId) >= 0) return;
      arr.push(momentId);
      lsSet(SEEN_PREFIX + charId, JSON.stringify(arr));
    } catch (_) {}
  }

  function lastFireTime() {
    try { return parseInt(lsGet(COOLDOWN_K) || '0', 10) || 0; } catch (_) { return 0; }
  }
  function setLastFire(t) {
    try { lsSet(COOLDOWN_K, String(t)); } catch (_) {}
  }

  // ---------------------------------------------------------------------------
  // MOMENTS — 5 per character. Each moment is one self-contained kilig beat.
  //
  // Schema:
  //   { id, tags?, minAff?, pose?, setup, prompt, options: [
  //       { id, label, response, effect? }, ...
  //     ] }
  //
  //   - setup: italic stage direction line, sets the moment.
  //   - prompt: question the player answers (e.g. "What do you do?").
  //   - options: 2 binary choices, each with a 2-3 sentence response.
  //   - effect: optional stat bumps (bond / trust / obsession / corruption).
  //
  // Voice notes per character, baked into the writing:
  //   - Alistair: captain. Restraint cracking. Flirts by breaking his own rules.
  //   - Lyra:     siren. Warm, physical, low-boundary. Flirts via touch + song.
  //   - Caspian:  prince. Court-polished flirt that drops honest in private.
  //   - Lucien:   scholar. Careful intellectual flirtation. Touch is rare, weighted.
  //   - Elian:    woodsman. Sparse words. A hand on your shoulder = paragraph.
  //   - Noir:     dark prince. Controlled physicality. Restraint reads as challenge.
  //   - Proto:    mirror fragment. No body. The ache IS the romance.
  // ---------------------------------------------------------------------------
  const MOMENTS = {
    alistair: [
      {
        id: 'a01_clasp',
        pose: 'assets/alistair/body/casual.png',
        setup: '*He is standing too close, fixing a clasp at his shoulder. He has not noticed. Or he is pretending not to have noticed.*',
        prompt: 'What do you do?',
        options: [
          { id: 'help',
            label: 'Reach up. Fix it for him.',
            response: '*He goes still under your hands. You can hear him not breathing.* Thank you. *Quietly, the way a man admits to something he had not meant to admit.* I thought I had it. I did not, evidently.',
            effect: { bond: 2, trust: 1 } },
          { id: 'wait',
            label: 'Hold still. Watch his hands.',
            response: '*He fixes it. Then he catches you watching. The clasp does not need adjusting again, but he checks it anyway, because he needs somewhere to put his eyes that is not your face.*',
            effect: { bond: 1, obsession: 1 } }
        ]
      },
      {
        id: 'a02_dawn_watch',
        pose: 'assets/alistair/body/wondering.png',
        setup: '*You found him asleep against the wall by your door. His sword across his knees. His thumb pressed flat against the hilt the way a man holds the hand of someone he is too tired to admit he is holding.*',
        prompt: 'Wake him?',
        options: [
          { id: 'wake',
            label: 'Sit beside him. Touch his wrist until he opens his eyes.',
            response: '*He startles, then does not. He looks at where your fingers are, and he does not move them.* I was not asleep. *A pause that calls him a liar.* Alright. I was asleep. Stay there.',
            effect: { bond: 2, trust: 2 } },
          { id: 'watch',
            label: 'Sit on the floor opposite him. Watch him sleep until he wakes on his own.',
            response: '*He wakes when the sun crosses his eyes. He sees you and does not pretend he was not just looked at while sleeping. He clears his throat. Once.* Good morning. Did I miss anything important.',
            effect: { bond: 1, obsession: 2 } }
        ]
      },
      {
        id: 'a03_training_yard',
        pose: 'assets/alistair/body/crossarms.png',
        setup: '*He is in the training yard, armour off, sleeves rolled. He has just driven a practice sword two inches into a post. He looks up. He sees you watching. He does not pretend he is not flushed.*',
        prompt: 'How do you respond?',
        options: [
          { id: 'compliment',
            label: 'Smile. "I came at the right moment, then."',
            response: '*He laughs, a small startled sound the yard has not heard from him before.* You came at the moment I was about to lose to a wooden post. Yes. Auspicious timing.',
            effect: { bond: 2, obsession: 1 } },
          { id: 'unfazed',
            label: 'Tilt your head. "Is that what you do when no one is watching."',
            response: '*The look he gives you is not the look of a captain.* It is what I do when I want someone to be watching, miss. I will not pretend I did not hear you on the path.',
            effect: { bond: 1, obsession: 2 } }
        ]
      },
      {
        id: 'a04_first_name',
        pose: 'assets/alistair/body/softshy-love1.png',
        setup: '*He calls you by your given name. Not "miss." Not "lady." Your actual name, in his actual voice. He has not done that before. He hears himself do it and he goes very still, waiting to see if he has overstepped.*',
        prompt: 'How do you answer?',
        options: [
          { id: 'allow',
            label: 'Smile. Say his back. Use the soft form.',
            response: '*Whatever was holding his shoulders together releases by half an inch.* I have been practising. I did not want to mispronounce it the first time. I have been practising for weeks.',
            effect: { bond: 3, trust: 1 } },
          { id: 'tease',
            label: 'Raise an eyebrow. "Captain. That is presumptuous of you."',
            response: '*He goes red. He goes red as a stable-boy. He recovers, mostly.* Forgive me, miss. I will return to titles. *A beat.* But I will say it again. When you allow it. Sooner rather than later, I hope.',
            effect: { bond: 2, obsession: 2 } }
        ]
      },
      {
        id: 'a05_flowers',
        pose: 'assets/alistair/body/casual.png',
        setup: '*Wild lavender on your windowsill. He did not say they were for you. He has not said they are for you. They are for you.*',
        prompt: 'What do you do?',
        options: [
          { id: 'thank',
            label: 'Find him. Hold the lavender between you. "Thank you."',
            response: '*He looks at the flowers, then at you, then at the flowers again, like he is trying to decide which one to give the credit to.* I did not think anyone would notice. *Quieter.* I am glad it was you that did.',
            effect: { bond: 2, trust: 2 } },
          { id: 'keep',
            label: 'Press one between the pages of a book. Tell him nothing.',
            response: '*He notices the book on your table the next day, slightly thicker than yesterday. He does not ask. He does smile, very small, into the watch report he is filing.*',
            effect: { bond: 1, obsession: 2 } }
        ]
      },
      // ── PROTECTIVE PANIC: the missing register. Alistair's pool covers
      //    restraint, sentry-pining, vow-energy, gentle public bravery. None
      //    of them catch the captain's discipline cracking when the player
      //    is harmed — even minor harm. The fear is not proportional to the
      //    injury. He knows that. He cannot make himself respond to it as
      //    such. The training did not cover her bleeding in front of him.
      {
        id: 'a06_protective_panic',
        minAff: 3,
        pose: 'assets/alistair/body/wondering.png',
        setup: '*You walk into the watch-room with a small kitchen-knife cut across the side of your thumb. You had forgotten about it. He sees it before you have set the basket down. The captain who stood three years at the south gate without flinching is at your side in two strides. He has the wound under his thumb and a clean cloth out of his belt before he has spoken.* When. *Not a question. The voice has dropped half an octave from the parade-ground voice you know.* When did this happen.',
        prompt: 'What do you tell him?',
        options: [
          { id: 'let_him',
            label: 'Let him work. Hold your hand still. "An hour ago. Kitchen knife."',
            response: '*He works fast, the way a man works when a thing has happened that he should have been there to prevent. He cleans the cut, ties the cloth, holds your hand longer than the cloth requires. He does not look at your face yet.* An hour. *Smaller, harder.* I was on the south wall an hour ago. *He looks up, then.* I will be on the kitchen wall going forward. Whichever wall you are nearest. I am revising the patrol.',
            effect: { bond: 4, trust: 5 } },
          { id: 'stop_him',
            label: 'Stop his hands. "Captain. It is a kitchen cut. Look at me."',
            response: '*He stops. He looks at you. His hands are still on yours, but he has frozen them on purpose. The captain comes back into his face with effort, the way a man pulls himself out of cold water.* I know. *Quieter.* I am aware it is a kitchen cut. I cannot, at present, make myself respond to it as if it were one. *He breathes out slowly.* Be patient with me. I have been a knight a long time. The training did not cover what to do with you bleeding in front of me. Even a small amount.',
            effect: { bond: 5, obsession: 3 } }
        ]
      },
      // ── PLAIN WOOL: Alistair sees her without silk for the first time.
      //    Surprise-arc moment (May 2026). The captain has been seeing her
      //    in court silk since her arrival. This morning the silk is being
      //    mended; she comes to the captain's table in plain wool. He is
      //    not ready for it. He stops being a captain for half a second.
      {
        id: 'a07_plain_wool',
        minAff: 3,
        pose: 'assets/alistair/body/wondering.png',
        setup: '*Morning. The silk is being mended in the seamstress wing. You come to the captain\'s table in plain wool. The dress someone slid under the maid\'s chamber door the week you arrived. He looks up from a watch report. He sees you. He stops being a captain for half a second. The cuirass is still on. The face has gone to a place the cuirass does not cover.*',
        prompt: 'How do you cross to him?',
        options: [
          { id: 'sit',
            label: 'Sit across from him. Pour his cup of tea before he asks.',
            response: '*He watches you pour. The hand that has been resting on the watch report does not move from the page. The page does not get any more read.* I have written nothing useful in this report for an hour. *Smaller.* You should not be allowed to wear that. The kingdom is not equipped. *Even smaller, into the cup.* I am not equipped.',
            effect: { bond: 4, obsession: 4 } },
          { id: 'stand',
            label: 'Stay standing. Smile, just barely. "I broke the silk on purpose."',
            response: '*He sets the watch report down. He has not, on a workday, set the watch report down before noon in twelve years.* Then I will have to write the chamberlain a note explaining why my morning will not include reports. *Quieter.* Sit. Or do not. I will be useless either way. I would prefer the company.',
            effect: { bond: 3, obsession: 5 } }
        ]
      },
      // ── INVERSION: the captain breaks rank, in public, in daylight ─────
      {
        id: 'a99_kissed_wrist',
        inversion: true,
        minAff: 50,
        pose: 'assets/alistair/body/softshy-love1.png',
        setup: '*Mid-corridor, mid-conversation, with the chamberlain three paces behind you, he stops walking. He takes your hand. He presses a kiss to the inside of your wrist, slow enough that you feel his mouth open. Then he resumes walking as if nothing has happened. The chamberlain has stopped. The chamberlain is pretending to study a tapestry that has been on that wall for fifty years.*',
        prompt: 'What do you do?',
        options: [
          { id: 'match',
            label: 'Catch up to him. Take his arm openly. Walk him through the rest of the corridor.',
            response: '*He does not pull his arm away. He covers your hand with his own and keeps walking, and when you reach the great doors he says, very quietly, only to you:* I had been holding that for two weeks. I have decided I am no longer holding things. The chamberlain will write a report. Let him.',
            effect: { bond: 4, obsession: 3 } },
          { id: 'flush',
            label: 'Flush. Keep walking beside him. Do not say a word until you reach the doors.',
            response: '*At the doors he stops. He looks at you. He does not smile, exactly, but the corner of his mouth does something it has not done before in your presence.* You did not stop me. *Smaller.* I had been afraid you would. I am no longer afraid of that, apparently.',
            effect: { bond: 4, trust: 2 } }
        ]
      }
    ],

    lyra: [
      {
        id: 'l01_brush',
        pose: 'assets/lyra/body/casual1.png',
        setup: '*She is brushing your hair in the cave-mouth. Her humming has dropped half an octave. The cave heard the change. So did you.*',
        prompt: 'What do you do?',
        options: [
          { id: 'lean',
            label: 'Lean back into her. Close your eyes.',
            response: '*Her hum settles a fourth lower. The brush slows. She tucks one strand behind your ear with a hand that has clearly been waiting for an excuse.* You are very easy to take care of, little listener. I should warn you. I am habit-forming.',
            effect: { bond: 2, trust: 2 } },
          { id: 'still',
            label: 'Hold perfectly still. Listen to the change in her voice.',
            response: '*She notices you noticing. She brushes one more long stroke, and on the last note she rests her chin briefly on the top of your head.* You hear me too well. That is going to be a problem for both of us.',
            effect: { bond: 2, obsession: 2 } }
        ]
      },
      {
        id: 'l02_surf',
        pose: 'assets/lyra/body/falllove2.png',
        setup: '*She is barefoot in the surf, her shirt clinging where a wave caught her. She has not looked down at the cling. She is looking at you. She knows.*',
        prompt: 'How do you respond?',
        options: [
          { id: 'look',
            label: 'Hold her gaze. Do not look away first.',
            response: '*She tilts her head, slow as the cave does anything, and she smiles like a person who has just been told a secret they had been hoping to hear.* Good. The ones who look away first never come back. The ones who do not, I keep.',
            effect: { bond: 2, obsession: 2 } },
          { id: 'shy',
            label: 'Look down at the foam. Let her watch you blush.',
            response: '*She wades closer. The water around your ankles goes warmer in a way water should not. She lifts your chin with one wet finger.* No, look at me. The cave wants you to. So do I. Mostly I.',
            effect: { bond: 3, trust: 1 } }
        ]
      },
      {
        id: 'l03_pull',
        pose: 'assets/lyra/body/happy.png',
        setup: '*She has pulled you ankle-deep into the surf. The water is colder than it looks. Her hand is on your hip, steadying you. The hand has not moved.*',
        prompt: 'What do you do?',
        options: [
          { id: 'closer',
            label: 'Step closer. Put a hand on her shoulder.',
            response: '*She does not flinch. She closes her own hand over yours and presses it flat against her shoulder, harder than you put it there.* The cave is going to be insufferable about this. I do not care. I am not letting go first.',
            effect: { bond: 3, obsession: 1 } },
          { id: 'back',
            label: 'Step back. Smile so she knows it is not rejection.',
            response: '*She lets you go. She does it slowly, like a witch who knows the difference between losing and being given.* I will wait for the day you do not step back. I am not in a hurry. I am, however, paying attention.',
            effect: { bond: 1, trust: 2 } }
        ]
      },
      {
        id: 'l04_song_about_you',
        pose: 'assets/lyra/body/casual1.png',
        setup: '*She is humming a verse you have not heard before. Halfway through, you realise. The song is about you. Specifically about you. She watches you realise.*',
        prompt: 'How do you respond?',
        options: [
          { id: 'admit',
            label: 'Tell her. "That is me."',
            response: '*She does not deny it. She finishes the verse. She does not sing the second yet.* I have been writing it for two weeks. The cave already knew. You were the last to find out, on purpose. I wanted to watch your face when you did.',
            effect: { bond: 3, obsession: 2 } },
          { id: 'pretend',
            label: 'Pretend you didn’t catch it. Listen with your face still.',
            response: '*She lets you have the pretence. For about four seconds. Then she leans in close enough to put her mouth at your ear.* Liar. *She is grinning. The cave is grinning.*',
            effect: { bond: 2, obsession: 2 } }
        ]
      },
      {
        id: 'l05_shell',
        pose: 'assets/lyra/body/eyes-closed.png',
        setup: '*She presses a small wet shell into your palm and closes your fingers over it. Her hand stays.*',
        prompt: 'What do you do?',
        options: [
          { id: 'stay',
            label: 'Stay still. Let her hand rest there as long as she wants.',
            response: '*Her hand stays for the count of seven. You count it because she does. Then she lifts her fingers one at a time, slow as a tide.* The shell is yours. The hand is yours too. Whenever you want it.',
            effect: { bond: 3, trust: 2 } },
          { id: 'turn',
            label: 'Turn your palm up. Lace your fingers through hers.',
            response: '*She breathes in sharply. The cave’s hum picks up half a note.* You said the part out loud. *She does not let go. Neither do you. The shell warms between your palms.*',
            effect: { bond: 3, obsession: 2 } }
        ]
      },
      // ── KISS: Lyra is the most physical character in the cast (siren,
      //    low-boundary, song/touch register) but until now her only kiss
      //    content was locked behind l99 (minAff 50 inversion). This is the
      //    tier-3 first-kiss beat — Lyra-initiated, declared not negotiated,
      //    cave as witness. Both choice paths land in a kiss; the difference
      //    is power dynamic (meet her halfway vs make her cross the last inch).
      {
        id: 'l06_first_kiss',
        minAff: 3,
        pose: 'assets/lyra/body/falllove2.png',
        setup: '*She is humming the second verse of the song that has your name in it. Halfway through she stops. She pulls you gently to the rock she has been sitting on, both hands warm on your wrists. She does not let go. The cave hum dips, then rises a third — a pitch you have never heard from it before.* I have been swimming around saying it for a week. I am tired of swimming around it. *Quieter.* I am going to kiss you. I would prefer you knew. A siren is not in the habit of asking. I would rather be a different kind of witch with you.',
        prompt: 'What do you do?',
        options: [
          { id: 'meet_her',
            label: 'Lean in. Meet her halfway.',
            response: '*She catches your face in both hands and kisses you slow as the tide does anything. The cave hums an octave low, like a room being told a thing it has been waiting two centuries to hear. When she pulls back, she does not pull far.* That. *Smaller.* That was the verse I could not write. I have it now.',
            effect: { bond: 5, obsession: 3 } },
          { id: 'wait',
            label: 'Tilt your head. Smile. Let her come the rest of the way.',
            response: '*She does come. She crosses the last inch slowly, with a witch’s patience and a girl’s impatience fighting for the lead. She kisses like a person who has been thinking about it for a week and is no longer thinking.* Insufferable. *Against your mouth, grinning.* You made me come the last inch. I would do it again. I plan to.',
            effect: { bond: 4, trust: 3 } }
        ]
      },
      // ── INVERSION: the siren who flirts with everyone stops flirting ──
      {
        id: 'l99_keeping_you',
        inversion: true,
        minAff: 50,
        pose: 'assets/lyra/body/falllove2.png',
        setup: '*She is humming, then she is not. She sets the brush down on the rock beside you. She turns you to face her with both hands on your shoulders. The cave goes quiet behind her, the way a room goes quiet when something it has been waiting for finally happens.* I have to tell you something, and I am only going to say it the once. I am free with this with everyone. With you, I am not. I am keeping you. I have decided. Tell me to stop and I will, and I will sing to the empty cave instead, and you will hear me from your chamber and I will pretend I do not know you are listening.',
        prompt: 'What do you tell her?',
        options: [
          { id: 'kiss',
            label: 'Kiss her. Right there. The cave can hear.',
            response: '*She does not gasp. She inhales like a woman pulling something she has been needing for years all the way into her chest.* The cave heard. The cave is not going to be subtle about it. *Quieter, against your mouth.* Neither am I. Not anymore. Not with you.',
            effect: { bond: 5, obsession: 4 } },
          { id: 'keep_me',
            label: '"Keep me. Don\'t stop singing. Sing only to me."',
            response: '*Her face does something you have never seen it do. A witch is allowed to be triumphant. She rarely is allowed to be relieved. She is, right now, both.* Done. Decided. Witnessed by the cave and the salt and one shell. I am yours and you are mine and I will sing the rest of my life into the verse of you.',
            effect: { bond: 5, trust: 3 } }
        ]
      }
    ],

    caspian: [
      {
        id: 'c01_wineglass',
        pose: 'assets/caspian/body/casual1.png',
        setup: '*At the small dining table he reaches across and adjusts the angle of your wine glass so the candlelight catches it. "Better," he says, very quietly. He has not looked away from your face.*',
        prompt: 'How do you respond?',
        options: [
          { id: 'toast',
            label: 'Lift the glass. Hold his eyes over the rim.',
            response: '*He lifts his own. He matches you, slow as a vow.* To being better lit than usual. *Drier.* And to being looked at by someone whose looking is not strategy. That, I have not had since I was twelve.',
            effect: { bond: 2, obsession: 2 } },
          { id: 'drink',
            label: 'Drink without toasting. Let him keep watching.',
            response: '*He does. He does the entire time. When you set the glass down he says, very softly:* You are extraordinary at being looked at. I will have to learn it from you, if you will teach me.',
            effect: { bond: 2, obsession: 2 } }
        ]
      },
      {
        id: 'c02_token',
        pose: 'assets/caspian/body/talking2.png',
        setup: '*He passes you in a corridor, presses something small and warm into your palm without breaking stride, and is gone before you can react. You open your hand. A tiny gold token, the size of a coin, with no inscription you can read.*',
        prompt: 'What do you do?',
        options: [
          { id: 'find',
            label: 'Find him. Ask what it is.',
            response: '*He smiles, the small private smile, the one he does not wear in court.* It is the seal I sign letters with when I do not want them traced to the throne. You have one of three. The other two are mine.',
            effect: { bond: 3, trust: 2 } },
          { id: 'keep',
            label: 'Keep it. Do not ask. Wear it under your collar.',
            response: '*Three days later he notices the chain at your throat. He does not name it. He smiles, very slightly, into his cup of court tea, and does not bring it up again. The smile, however, lasts the rest of the meeting.*',
            effect: { bond: 2, obsession: 3 } }
        ]
      },
      {
        id: 'c03_unfinished_letter',
        pose: 'assets/caspian/body/gentle.png',
        setup: '*He is writing letters at his desk. He sets one aside. "This one is to you. I have not finished it. I would rather tell you to your face if you will allow."*',
        prompt: 'What do you tell him?',
        options: [
          { id: 'sit',
            label: 'Sit on the desk. "Tell me."',
            response: '*He sets the pen down. He does not pick it up again for an hour.* It said that I had been a prince since I was six and a man for as long as I have known you. It said you should know which one was writing. It said both of us are.',
            effect: { bond: 3, obsession: 2 } },
          { id: 'send',
            label: 'Smile. "Finish it. I want to read it."',
            response: '*He picks up the pen. He writes for a long minute. He folds the letter, seals it, hands it to you.* Then read it tonight. By candle. The court will not see the seal. Only you will.',
            effect: { bond: 2, trust: 2 } }
        ]
      },
      {
        id: 'c04_meeting',
        pose: 'assets/caspian/body/formal.png',
        setup: '*He is mid-meeting with the chamberlain. He looks up. He sees you in the doorway. His face does something for half a second that is not court-appropriate. He recovers. The chamberlain pretends not to have seen.*',
        prompt: 'What do you do?',
        options: [
          { id: 'stay',
            label: 'Stay in the doorway. Smile, just a little.',
            response: '*He cuts the meeting short by twenty minutes. The chamberlain leaves with the firm impression that he has been outmanoeuvred by a doorway.*',
            effect: { bond: 3, obsession: 2 } },
          { id: 'leave',
            label: 'Leave him to the meeting. Wave once.',
            response: '*He finishes the meeting professionally. Three hours later, you find a single line written in his hand on your nightstand: "Doorways suit you. Wear them more often."*',
            effect: { bond: 2, obsession: 2 } }
        ]
      },
      {
        id: 'c05_court_name',
        pose: 'assets/caspian/body/adoring.png',
        setup: '*Mid-banquet, in front of the small court, he calls you by a name only he uses. Soft. Two syllables. His own invention. The court hears it. The court files it. He does not look away from you to see them filing it.*',
        prompt: 'How do you wear it?',
        options: [
          { id: 'pleased',
            label: 'Smile. Let the court see the smile.',
            response: '*The chamberlain notes it in his ledger. The Queen will hear of it within the day. The prince is delighted. He is also slightly afraid. He looks like a man who has just shoved a chess piece across the board on purpose.*',
            effect: { bond: 3, obsession: 2 } },
          { id: 'composed',
            label: 'Tilt your head. Look unbothered. Let him work for it.',
            response: '*He is working for it. He is working very hard for it. He likes that he is working for it. The court has not seen him this engaged in twelve years. They are discussing it already.*',
            effect: { bond: 2, obsession: 3 } }
        ]
      },
      // ── SCREAM: the courtly mask cracks. Caspian's missing register —
      //    explosive jealousy, not literal yelling but the prince genuinely
      //    angry-and-scared for the first time on-screen. Fires only when
      //    another character has bond >= 50: the chamberlain reports where
      //    the player has been spending hours, and one of those names is
      //    not his. Tier-3 gate so it lands with weight, not pettiness.
      {
        id: 'c06_jealousy',
        minAff: 3,
        pose: 'assets/caspian/body/formal.png',
        eligible: function () {
          var others = ['alistair', 'elian', 'lyra', 'lucien', 'noir', 'proto'];
          for (var i = 0; i < others.length; i++) {
            var v = parseInt(lsGet('pp_affection_' + others[i]) || lsGet(others[i] + '_affection') || '0', 10) || 0;
            if (v >= 50) return true;
          }
          return false;
        },
        setup: '*The throne room. He has dismissed the chamberlain and the guards. He has cancelled three meetings to be in this room with you alone. He is at the window, palms flat against the stone, breathing too carefully. He does not turn when you enter.* My chamberlain keeps a list. Of where you spend your hours. *He turns then, and the court mask is gone for the first time you have ever seen.* I had been told, since I was six, that a prince is charmed by every name on every list. *Quieter, harder.* I am not charmed today.',
        prompt: 'How do you respond?',
        options: [
          { id: 'reassure',
            label: 'Cross to him. Take both his hands. "It does not change us."',
            response: '*He lets you take his hands. He does not move when you press them between yours. The breath he had been holding for an hour goes out of him, slowly, against your wrist.* I am sorry. *Smaller.* I have been a prince since I was six. I have been a jealous one for, it appears, the last hour. I will be better at it. *Quieter, into your hair.* I will also, if I am being honest, be less polite about your time going forward. I am giving you fair warning.',
            effect: { bond: 3, obsession: 4 } },
          { id: 'refuse',
            label: 'Stay where you are. "I owe no one my hours. Not even you."',
            response: '*Something in him goes very still. Then, lower than the chamberlain has ever heard him:* No. You do not. *He crosses to you instead. One hand at your jaw, careful, controlled, possessive without apology.* And I do not owe the court my charm tonight. We are, both of us, off-duty. *Closer.* I had been a courtly man until your name appeared on a list that was not mine. I will not be a courtly man for the next hour. Stay for that hour.',
            effect: { bond: 2, obsession: 6 } }
        ]
      },
      // ── UNSENT LETTER: she finds a letter to his grandmother in his desk.
      //    Surprise-arc moment (May 2026). Caspian leaves her in the study
      //    while a council pulls him away. The letter on the top of the pile
      //    is not for her, not for the chamberlain, not for the kingdom. It
      //    is for his grandmother. It is unfinished. It has been unfinished
      //    for weeks. He returns. He sees the letter is not where he left it.
      {
        id: 'c07_unsent_letter',
        minAff: 3,
        pose: 'assets/caspian/body/reading.png',
        setup: '*A council pulls him out mid-tea. He says he will be ten minutes. He is not ten minutes. The letter on the top of the pile is not the chamberlain\'s. It is not yours. The salutation is "Mother." It is in his hand. The third line is: "I have not asked you what you did to him because I am afraid the asking would be louder than the answer." There are eight more pages. He has been writing this letter for weeks. He has not finished it. He has not sent it.*',
        prompt: 'What do you do?',
        options: [
          { id: 'refold',
            label: 'Refold it. Put it back exactly as it was. Do not say a word.',
            response: '*He returns. He sees the letter is not quite where he left it. He looks at you. He looks at the letter. He sets his cup down with both hands.* I had hoped no one would read that until I was ready to send it. *Smaller.* I had hoped that for nine years. *He sits beside you. He does not pick the letter up.* Thank you for putting it back. Thank you, also, for not asking me about line three. I am, slowly, getting to the asking myself.',
            effect: { bond: 5, trust: 5 } },
          { id: 'leave_open',
            label: 'Leave it on top of the pile. Open. Where he will see that you saw.',
            response: '*He returns. He stops in the doorway. He does not move for a long count.* You let me know you read it. *Quieter.* I am not sure whether to thank you or apologise. *He crosses to the desk, sits, does not touch the letter.* Read the rest, if you would. I am not finishing it tonight. I would, however, like a witness to the eight pages. The throne does not get to be the only thing I have ever told.',
            effect: { bond: 4, obsession: 5 } }
        ]
      },
      // ── INVERSION: the prince who never breaks character writes a contract ──
      {
        id: 'c99_marriage_contract',
        inversion: true,
        minAff: 50,
        pose: 'assets/caspian/body/tender.png',
        setup: '*The throne room. Empty. No candles, no chamberlain, no court. He is sitting on the bottom dais step, a folded sheet of cream paper in his hand, the small gold band beside him on the stone. He looks up when you come in, and the look on his face is one you have never seen on a prince of Aethermoor in a public room and never will.* I have written something. Not the Sunday treaty. A different document. A marriage contract. I have not signed it. I am not asking you to sign it. I am telling you it exists, that I wrote it last week, and that I have read it every night since to see if I was being foolish. I have decided I am being entirely serious. The kingdom is not ready. I do not care. *He sets the folded paper between you on the stone, on top of the gold band.* Do whatever you want with it.',
        prompt: 'What do you do?',
        options: [
          { id: 'read',
            label: 'Sit beside him on the step. Open the paper. Read it together.',
            response: '*The contract is short. It does not contain the word duty anywhere. It contains the word Sunday seven times. It contains your name written by a hand that has practised your name carefully, in private, more than once.* I am not asking you to answer tonight. I am not asking you to answer this year. I am asking you to know it is on the page. *Quietly.* It is on the page now in two places. The contract and you.',
            effect: { bond: 5, obsession: 3 } },
          { id: 'someday',
            label: '"Not yet. But someday, yes."',
            response: '*He closes his eyes. He breathes out. He picks the contract up, folds it carefully back along its existing crease, and slides it inside his coat against his ribs.* Someday is a complete answer. *Smaller, real.* I will keep it here until someday becomes today. The kingdom will not know. You will, and I will, and that is enough audience for the document I would rather not share with anyone else.',
            effect: { bond: 5, trust: 4 } }
        ]
      }
    ],

    lucien: [
      {
        id: 'lu01_passage',
        pose: 'assets/lucien/body/casual1.png',
        setup: '*He is marking a passage in a book. He reads it aloud, not looking at you. Then he says, quieter: "I had been wondering if I was the only person who would understand it. I find I was wrong."*',
        prompt: 'How do you answer?',
        options: [
          { id: 'smile',
            label: 'Smile. Say nothing. Let him have the moment.',
            response: '*He looks up, then. He has not blinked at the right rhythm in some seconds.* Right. Yes. I am going to write that down. Not the passage. The look. The look on you, at this exact second.',
            effect: { bond: 3, obsession: 2 } },
          { id: 'ask',
            label: 'Ask what he wrote in the margin.',
            response: '*He turns the book and shows you. The margin reads, in his neat ink: "she would understand this. Ask her." It is dated two months ago.*',
            effect: { bond: 3, trust: 2 } }
        ]
      },
      {
        id: 'lu02_tea',
        pose: 'assets/lucien/body/gentle.png',
        setup: '*He passes you a cup of something herbal, warm. His fingers brush yours and stay one second longer than physics requires. He notices. You notice. Neither of you names it.*',
        prompt: 'What do you do?',
        options: [
          { id: 'note',
            label: 'Look at his fingers. Then at his face. Hold both looks.',
            response: '*He clears his throat. He does not move his fingers. He rests them on the cup-handle alongside yours.* I have been told I am poor at small contact. I am, however, a quick study. Be patient with me. I am working on it.',
            effect: { bond: 2, obsession: 2 } },
          { id: 'take',
            label: 'Take the cup. Let him have his stolen second without comment.',
            response: '*He stares at his own hand for a beat after you have taken the cup, as if it has acted without his permission. He files something into a notebook later that day, in a hand only he can read.*',
            effect: { bond: 1, obsession: 3 } }
        ]
      },
      {
        id: 'lu03_journal',
        pose: 'assets/lucien/body/curious.png',
        setup: '*He is writing in a journal. He looks up and catches you reading over his shoulder. He does not close the book.*',
        prompt: 'What do you do?',
        options: [
          { id: 'read',
            label: 'Lean in. Read the rest of the page.',
            response: '*The page is a list of small things you have done that he found interesting. The list is forty-seven items long. The most recent is from this morning.* I am not embarrassed. *He pauses.* I am, slightly. I will not stop.',
            effect: { bond: 3, obsession: 3 } },
          { id: 'step',
            label: 'Step back. "Yours. Not mine to read."',
            response: '*He closes the book gently and sets it on the desk between you.* Yours, when you ask for it. I would have shown you eventually. You being the kind of person who would step back is, in fact, the reason I started keeping it.',
            effect: { bond: 2, trust: 3 } }
        ]
      },
      {
        id: 'lu04_glasses',
        pose: 'assets/lucien/body/amused.png',
        setup: '*He hands you his reading glasses, frame-warm from his own face. "I want to know what you see when I am not looking. Wear them. Tell me what is sharper."*',
        prompt: 'What do you do?',
        options: [
          { id: 'wear',
            label: 'Put them on. Look at him through his own lenses.',
            response: '*He goes very quiet for several seconds.* Oh. *Even quieter.* I had not anticipated the effect. You are, through these lenses, the sharpest thing in the room. I will have to ask you to take them off in a moment.',
            effect: { bond: 3, obsession: 3 } },
          { id: 'return',
            label: 'Hand them back. Smile. "I see you well enough without."',
            response: '*He puts them on and writes in his journal for the next ten minutes without looking up. The line he writes, in the dialect only he and his sister could read, says: she does not need lenses to see me. That is a problem.*',
            effect: { bond: 2, obsession: 2 } }
        ]
      },
      {
        id: 'lu05_name',
        pose: 'assets/lucien/body/fascinated.png',
        setup: '*He says your name in a language you did not know you could be named in. He does not translate. He waits.*',
        prompt: 'What do you do?',
        options: [
          { id: 'ask',
            label: 'Ask him what it means.',
            response: '*He almost answers. He stops. He smiles, very small.* I will tell you when I have earned the right to. I am keeping it as something to work toward. I am not in a hurry. I have, as you know, been told I am patient.',
            effect: { bond: 3, obsession: 2 } },
          { id: 'wait',
            label: 'Smile. Wait for him to say it again.',
            response: '*He says it again. Slower. He is watching what your face does on the third syllable specifically. Whatever he sees there, he writes down later.*',
            effect: { bond: 3, obsession: 3 } }
        ]
      },
      // ── GRIEF: pays off LORE.md §6.4 hollow framing. Lucien, having spent
      //    thirty years sure emotion was inefficient, has been cataloguing
      //    his first feelings for ~30 days. This is the night the catalogue
      //    refuses an entry — a feeling he cannot name. Both choice paths
      //    end with the feeling getting recorded anyway, in different shapes.
      //    The grief is quiet: the cost of being half-emotional after
      //    thirty years hollow. Tier-3 gate so it lands with weight.
      {
        id: 'lu06_grief_unfileable',
        minAff: 3,
        pose: 'assets/lucien/body/curious.png',
        setup: '*The desk. The catalogue is open to a fresh page. The pen has been hovering over the same blank line for, by the candle’s erosion, eleven minutes. He looks up when you come in, and the courtly composure is unusually thin tonight.* I have a feeling I cannot file. I know its temperature. I know its weight. I have been trying to find the word for thirty minutes. *Quieter.* This is the first time the catalogue has refused me.',
        prompt: 'What do you do?',
        options: [
          { id: 'sit_silent',
            label: 'Sit beside him at the desk. Don’t ask what it is. Stay.',
            response: '*He sets the pen down without looking at you. Half an hour later, with the candle low, he picks the pen up again and writes one short line on the blank page. He does not show you what it says. Then he closes the catalogue and rests his hand flat over your hand on the desk.* Filed. Under the working title “the feeling of being sat with without questions.” I am pleased it has a name. *Smaller.* I am pleased you have one too.',
            effect: { bond: 4, trust: 4 } },
          { id: 'ask_describe',
            label: 'Ask him to describe it. "Try out loud."',
            response: '*He tries. He gets two sentences in before he stops and notices, with the detachment of a researcher, that his own eyes have done something he had not authorised them to. He sets the pen down. He stares at the candle for a long time.* This is the entry that does not fit in the catalogue. *Quieter.* I am keeping it anyway. Off-system. *He turns his hand palm-up on the desk. You take it.* I think it is grief. I have been told it can come thirty years late.',
            effect: { bond: 5, obsession: 3 } }
        ]
      },
      // ── STOLEN LOG: someone (Aenor's chamberlain, by the silence around it)
      //    has taken Lucien's observation log of the player. Forty-one
      //    entries. The catalogue she walked into her first time. A register
      //    she has never seen on him surfaces — not hollow, not careful, the
      //    fury of a man who has had a thing he was watching taken from him.
      //    Surprise-arc moment (May 2026).
      {
        id: 'lu07_stolen_log',
        minAff: 3,
        pose: 'assets/lucien/body/casting.png',
        setup: '*You walk into the tower at the third bell. Papers everywhere. Books off shelves they have not been off in years. A journal-shaped space at the centre of the desk where the journal is supposed to be. He has not slept. The pen on the floor has bled into the rug. He is not pretending to be calm; he is calculating where to be furious next.* They took the catalogue. *His voice is a register you have not heard on him.* Forty-one entries. *Quieter, harder.* Forty-one entries about you, in my hand, in a building only three people in this kingdom are allowed in.',
        prompt: 'What do you do?',
        options: [
          { id: 'help',
            label: 'Cross to him. "Tell me where you have already looked. I’ll walk it with you."',
            response: '*He stops moving. He has not let anyone walk a search with him in nineteen years. He looks at you for a long count, the way a man looks at a thing he was about to count alone.* Yes. Yes. *Quieter.* Thank you. Start with the south stair. I have done the north. The man who took it had his hand inside this building for twenty minutes by my count. I will know who within a week. *Even quieter.* I will be a worse man for that week. Be patient with me.',
            effect: { bond: 4, trust: 5 } },
          { id: 'still_him',
            label: 'Take both his hands. Stop them moving. "Look at me. We will get it back."',
            response: '*He lets you stop the hands. The hands have been moving for six hours. He has not noticed they were moving.* The hands. *He looks at them like they are not his.* I have been writing a letter to the queen in my head for six hours. *Quieter, almost ashamed*. I do not write letters to the queen. *He breathes out.* Thank you for stopping the hands. We will get it back. The hands can be still until we do.',
            effect: { bond: 5, obsession: 4 } }
        ]
      },
      // ── COURIER WITH GOLD SEAL: Caspian sends Lucien a sealed letter.
      //    The mark on the wax matches the token at the player's collar.
      //    Token-return + multi-piece-document beat in one. Lucien explains
      //    the document is in five fragments. Surprise-arc (May 2026).
      {
        id: 'lu08_courier',
        minAff: 3,
        pose: 'assets/lucien/body/curious.png',
        setup: '*Mid-study at the tower. A courier knocks. Lucien receives a sealed letter. The gold mark on the wax is identical to the token at your collar. He does not break the seal. He turns it slowly between his ink-stained fingers.* He has given me one of his three. *Looks at you. Looks at the seal. Looks at you again*. You have the third. We are now a triangle whether we wished to be or not. The kingdom has noticed.',
        prompt: 'What do you ask?',
        options: [
          { id: 'about_doc',
            label: '"Bring me the rest. How many pages are there."',
            response: '*He sets the unopened letter aside, pulls a fresh sheet, draws the symbol from your page, sets it next to the gold seal*. There are five fragments. I have been keeping mine for nineteen years. You walked in with the second. The dowager. *Quieter*. The queen has the third and the fourth. There is one more. I do not know who has it. I suspect. *He taps the courier-seal*. I suspect we are about to find out.',
            effect: { bond: 4, trust: 4 } },
          { id: 'token',
            label: 'Touch the token at your collar. "Then we are three."',
            response: '*The smile is small and tired and the most pleased he has been in days.* Three. The triangle is the strongest shape, mathematically. *Quieter, almost embarrassed*. I am working on the fourth side. Two of you would be excessive. One of me will have to do.',
            effect: { bond: 3, obsession: 5 } }
        ]
      },
      // ── INVERSION: the careful scholar drops the books, drops the script ──
      {
        id: 'lu99_papers',
        inversion: true,
        minAff: 50,
        pose: 'assets/lucien/body/fascinated.png',
        setup: '*You walked into the tower in a dress he has not seen before. He was holding a stack of papers. The papers are now on the floor between his feet. He has not picked them up. He says it before he picks them up:* I love you. I have loved you for nineteen days. I have written it down each night to make sure I was not exaggerating. I was not exaggerating. The plan was to wait for an appropriate moment. The moment is now, apparently. The moment is you, in that particular shade of grey, in my doorway. I am putting the pen down or I will write it forty more times before I sleep.',
        prompt: 'What do you do?',
        options: [
          { id: 'kiss',
            label: 'Walk to him. Kiss him. Let the papers stay on the floor.',
            response: '*He kisses you back, carefully at first, and then not carefully at all. When he pulls back, his glasses are slightly crooked, and he laughs at himself for the first time in nineteen days.* I am keeping that. With do-not-delete on it. *Quieter.* I am also picking up the papers, eventually. They can wait.',
            effect: { bond: 5, obsession: 4 } },
          { id: 'pick',
            label: 'Kneel with him. Pick the papers up together. Hold his hand on the way back to the desk.',
            response: '*He lets you. He does not let your hand go. At the desk he says, very quietly, into the side of your hair:* Thank you for not making me say it twice in one minute. I would have. I had a second draft loaded.',
            effect: { bond: 5, trust: 4 } }
        ]
      }
    ],

    elian: [
      {
        id: 'e01_root',
        pose: 'assets/elian/body/calm.png',
        setup: '*His hand is at the small of your back, steering you off a tree root you did not see. He leaves it there one second too long. He does not pretend the second was not too long.*',
        prompt: 'What do you do?',
        options: [
          { id: 'into',
            label: 'Step into the touch. Let your back press against his palm.',
            response: '*His hand stays. His thumb moves once, just once, over the wool of your dress.* Good. *That is all he says. He does not move his hand for the next four steps either.*',
            effect: { bond: 3, obsession: 2 } },
          { id: 'out',
            label: 'Step out. Smile so he knows it is not rejection.',
            response: '*He nods, once. Three minutes later he points out another root before you reach it, just so you do not need the steering.* Better. *He says nothing else. The sentence took him three minutes to compose.*',
            effect: { bond: 1, trust: 3 } }
        ]
      },
      {
        id: 'e02_hands',
        pose: 'assets/elian/body/foraging.png',
        setup: '*He is cleaning a fish. He looks at your hands. He decides without speaking that you will learn. He stands behind you, his hands over yours, the knife steady in your grip and his.*',
        prompt: 'What do you do?',
        options: [
          { id: 'lean',
            label: 'Lean back into him. Let him work the knife through your fingers.',
            response: '*His chin rests for half a breath against your hair. The knife does not waver.* You learn fast. *Quieter.* Or I am a worse teacher than I think I am. Both could be true.',
            effect: { bond: 3, obsession: 2 } },
          { id: 'focus',
            label: 'Focus on the work. Match his hands stroke for stroke.',
            response: '*He notices. He says nothing. He stays behind you longer than the lesson requires. You both pretend the lesson required it.*',
            effect: { bond: 2, trust: 2 } }
        ]
      },
      {
        id: 'e03_cloak',
        pose: 'assets/elian/body/warm.png',
        setup: '*He drapes his cloak over your shoulders without asking. It still smells like him. Smoke, cedar, river-water.*',
        prompt: 'What do you do?',
        options: [
          { id: 'wear',
            label: 'Pull it close. Wear it openly.',
            response: '*He looks at you in his cloak the way a man looks at a thing he had not realised he wanted to see.* Keep it. *Then.* I have another. *Then.* That was a lie. I will get another. Keep this one.',
            effect: { bond: 3, obsession: 2 } },
          { id: 'fold',
            label: 'Fold it carefully back into his pack at dawn.',
            response: '*He notices. He does not say anything. He pulls the cloak out at noon and wears it again, deliberately, so the smoke goes back into it. The next time he gives it to you, he does not take it back.*',
            effect: { bond: 2, trust: 3 } }
        ]
      },
      {
        id: 'e04_fire',
        pose: 'assets/elian/body/calm.png',
        setup: '*You fell asleep at the fire. You wake with his folded coat under your head. He is sitting opposite, watching the flames. He has not looked over.*',
        prompt: 'What do you do?',
        options: [
          { id: 'pretend',
            label: 'Pretend to still be asleep. Watch him through your lashes.',
            response: '*He notices. He does not call you on it. He keeps watching the fire. Five minutes later he says, very quietly:* You are awake. I let you have it. You looked tired in a way the fire could not fix on its own.',
            effect: { bond: 2, obsession: 3 } },
          { id: 'sit',
            label: 'Sit up. Pass him the coat back.',
            response: '*He shakes his head once. He does not take the coat.* Keep it tonight. The morning will be cold. *He looks at you, then.* I will be here. Sleep again, if you can.',
            effect: { bond: 3, trust: 3 } }
        ]
      },
      {
        id: 'e05_mend',
        pose: 'assets/elian/body/calm.png',
        setup: '*He is mending something. He patches a tear in your sleeve without asking. The thread is dark green. Your dress is grey. He noticed. He chose anyway.*',
        prompt: 'How do you respond?',
        options: [
          { id: 'pleased',
            label: 'Smile at the green. Wear it like a marker.',
            response: '*He sees the smile, registers it, files it. He stitches the next tear in the same green a week later, on purpose. Six weeks in, the dress is half his colour.*',
            effect: { bond: 3, obsession: 2 } },
          { id: 'tease',
            label: 'Raise an eyebrow. "That thread is not subtle, woodsman."',
            response: '*He looks up from the stitching, the corner of his mouth doing the closest thing it does to a smile.* It was not meant to be. *He bites the thread off short.* Subtlety has not served me. I am trying a different approach.',
            effect: { bond: 3, obsession: 3 } }
        ]
      },
      // ── FEAR: pays off LORE.md §6.5. Elian's existing 5 moments are all
      //    calm-woodsman register (slow tenderness, ranger competence). His
      //    actual canonical pillar is FEAR — of the dark magic eating the
      //    forest, and now eating its way toward the player. This is the
      //    night the markers move. The forest mask cracks. The fear is for
      //    her, not for the forest. Tier-3 gate so it lands with weight.
      {
        id: 'e06_fear_at_the_edge',
        minAff: 3,
        pose: 'assets/elian/body/guarded.png',
        setup: '*He comes into camp at dusk faster than you have ever seen him move. Boots wet. Bow off the shoulder, not stowed. He is looking past you, then at you. He is checking on you the way he checks on the wolfhound. He does not look relieved yet. He sees you. He breathes.* The dark place under the rowan moved last night. Forty paces north. *Quieter, harder than his usual quiet.* I have walked the markers since I was twenty. They have not moved before. They moved because of what is coming through them. *He sets the bow down. He does not let go of it.* Forty years of watching this forest die quietly. Tonight is the first time the dying has been close enough to touch you. That is the difference.',
        prompt: 'What do you do?',
        options: [
          { id: 'stay_close',
            label: 'Cross to him. "I will stay where you can see me."',
            response: '*He lets out the breath he had been holding since the markers. He sets the bow down properly this time. He puts his forehead against the side of your head, just for a second, the way he does with the wolfhound when he has been afraid a thing was lost.* Good. *Smaller, into your hair.* I will move the camp closer to the stream tonight. I will move it closer to you tomorrow. That is not a request.',
            effect: { bond: 4, trust: 5 } },
          { id: 'reassure',
            label: 'Take his hand. "The forest still lets me through. So do you."',
            response: '*He looks at the hand. He looks at you. The fear does not leave his face. It just goes quieter, the way the woods go quiet when a wolf is downwind and waiting.* The forest lets you through tonight. *Quieter.* Tomorrow may be a different forest. I will walk the markers at first light. You will walk them with me. I am asking. I do not, often. Tonight I am asking.',
            effect: { bond: 3, obsession: 4 } }
        ]
      },
      // ── BREACH: the dark place under the rowan moves through the markers
      //    while she is at his fire. He fights it. She sees the register he
      //    keeps off-camera in every other scene — the one that buries
      //    Weavers. Brief, brutal, controlled. Owner request: real physical
      //    danger. Surprise-arc (May 2026).
      {
        id: 'e07_breach',
        minAff: 3,
        pose: 'assets/elian/body/guarded.png',
        setup: '*Night at the camp. The fire is low. The forest goes quiet in a way it has not gone quiet for you before. He stands. He puts you behind him with one hand on your shoulder, hard enough that you understand without being told. Something at the treeline moves wrong — not animal-wrong, kingdom-wrong, the way the dark place under the rowan would move if the rowan stopped holding it. He has the bow off the shoulder before he has spoken.* Stay behind me. *Smaller, harder.* Do not look. *Smaller still, almost a whisper.* Forgive me, miss. I will need a register I had hoped not to use with you in the camp.',
        prompt: 'What do you do?',
        options: [
          { id: 'still',
            label: 'Stay behind him. Do not move. Do not look.',
            response: '*The forest fills the air with the sound of him moving fast and exact through it. Not a fight you watch. A fight you hear. Three breaths, four, then the woods are quiet again. He returns through the firelight. There is something dark on the side of his neck that is not paint. He does not let you look at his hands.* It is back past the markers. Tonight. *Quieter, into your hair.* I have buried two of you already. I am not adding a third. *Smaller.* Forgive me the register. I will go find a softer one for the morning. I owe you one.',
            effect: { bond: 5, trust: 5 } },
          { id: 'reach',
            label: 'When he comes back, take his hand without asking what was on it.',
            response: '*He almost pulls the hand away. He almost pretends. Then he lets you take it. Whatever was on it is on you now too. He looks at you like a man who has just discovered a new thing the woods can take from him.* I would have preferred you not see this version. *Smaller.* I did not get to choose. I am, for the first time in nineteen years, relieved I did not get to choose. *He keeps the hand in yours.* Do not let go yet. The register does not put itself away cleanly.',
            effect: { bond: 4, obsession: 5 } }
        ]
      },
      // ── INVERSION: the man of three words says nine sentences in a row ──
      {
        id: 'e99_long_speech',
        inversion: true,
        minAff: 50,
        pose: 'assets/elian/body/warm.png',
        setup: '*He sits down across from you at the fire. He does not pick up the whetstone. He does not poke the embers. He looks at you. He says more in a row than you have ever heard him say.* I have been thinking. About a third grave. I have buried two of you in this forest already, and the trees are tired of remembering names by themselves. I will not bury a third. The way to not bury you is, I am told, to not love you. I have failed at that already. The forest knew before I did. So instead I am going to love you carefully. And not quietly. The trees can keep watch on the both of us. I came here tonight to tell you that. *He stops. He lets out a breath he has been holding since dawn.* That is all.',
        prompt: 'What do you do?',
        options: [
          { id: 'sit_close',
            label: 'Get up. Cross to him. Sit beside him with your shoulder against his.',
            response: '*He lets you. He puts an arm behind you, not around you, just along the log so you know it is there if you want it.* Good. *That is the only word he gives you for the rest of the night, but he keeps the arm there until the fire goes down.*',
            effect: { bond: 5, trust: 5 } },
          { id: 'speechless',
            label: 'Stare at him. Open your mouth. Close it. Open it again.',
            response: '*He nods, once, like a man giving you permission to take as long as you need.* I had nine sentences ready. I have used them. You can have whatever number you want. I will sit here.',
            effect: { bond: 5, obsession: 3 } }
        ]
      }
    ],

    noir: [
      {
        id: 'n01_doorframe',
        pose: 'assets/noir/body/casual1.png',
        setup: '*He is leaning against the doorframe blocking your path. Not on purpose. You think. He has not moved. He is watching the way you decide what to do about him.*',
        prompt: 'What do you do?',
        options: [
          { id: 'push',
            label: 'Push past him. Let your shoulder graze his chest.',
            response: '*He lets you pass. The exact width he leaves is exactly enough that you have to brush against him to get through.* Mm. *Quieter than the word ought to be.* I will arrange to be in more doorways.',
            effect: { bond: 2, obsession: 3, corruption: 1 } },
          { id: 'wait',
            label: 'Wait. Look at him. Make him decide whether to step aside.',
            response: '*He does not move for a full count. Then he does, slowly, sweeping a hand to clear your path with the courtesy of a man who is performing the absence of courtesy.* As you wish. I find I prefer being made to step aside by you. Note that, please.',
            effect: { bond: 1, obsession: 3 } }
        ]
      },
      {
        id: 'n02_flower',
        pose: 'assets/noir/body/seductive.png',
        setup: '*He hands you a black flower. You cannot tell if it is real or a thing he has shaped from shadow. His finger brushes your wrist as he gives it. The cold is colder than it should be.*',
        prompt: 'What do you do?',
        options: [
          { id: 'hold',
            label: 'Hold the flower carefully. Do not pull your wrist back.',
            response: '*He notices that you did not pull away. He does not name the noticing. The flower stays cold against your palm. The cold matches the place his finger touched.* It will not wilt. It is also, as it happens, not a flower.',
            effect: { bond: 2, obsession: 3 } },
          { id: 'pull',
            label: 'Pull your wrist back. Hold his eyes instead.',
            response: '*The flower vanishes. He smiles, very thinly.* Wise. You are correct that I was testing. You passed and I am a little disappointed and also somewhat impressed. A combination I find, lately, that you produce in me often.',
            effect: { bond: 1, trust: 2 } }
        ]
      },
      {
        id: 'n03_behind',
        pose: 'assets/noir/body/whisper.png',
        setup: '*He is behind you. You feel him breathe. You did not see him arrive. His voice is at your ear before you turn: "Do not turn around. I want one moment of looking at you while you cannot look back."*',
        prompt: 'What do you do?',
        options: [
          { id: 'still',
            label: 'Stay still. Let him have the moment.',
            response: '*He has it. He has it for a long count. When he speaks again his voice is closer than before, though you did not feel him move.* Thank you. That was a kindness I will repay. At my own pace. With interest.',
            effect: { bond: 3, obsession: 3, corruption: 1 } },
          { id: 'turn',
            label: 'Turn around. Look at him directly.',
            response: '*He does not flinch. He tilts his head, the hunter assessing the doe that turned.* Brave. *Soft.* Reckless, but brave. I prefer that combination over any other this kingdom has to offer.',
            effect: { bond: 2, obsession: 3 } }
        ]
      },
      {
        id: 'n04_seam',
        pose: 'assets/noir/body/dominant.png',
        setup: '*He catches your hand mid-air as you reach for the seam. He does not release it. He does not speak. He is waiting for you to.*',
        prompt: 'What do you do?',
        options: [
          { id: 'close',
            label: 'Close your fingers around his.',
            response: '*His grip changes. It was a stop. Now it is a clasp.* I would have let you touch the seam. *Quieter.* I am, however, very glad you reached for me first.',
            effect: { bond: 3, obsession: 3 } },
          { id: 'pull',
            label: 'Pull your hand free. Smile at him.',
            response: '*He releases you. He flexes the empty hand once, considering it.* You take what you came for and you leave when you are done. A trait I respect. I am also, for the record, going to think about your hand for the next several hours.',
            effect: { bond: 2, obsession: 3 } }
        ]
      },
      {
        id: 'n05_flinch',
        pose: 'assets/noir/body/vulnerable.png',
        setup: '*Your knuckle brushes his cheek by accident as you push hair back from your own face. Six centuries of practice and he flinches. He recovers fast. Not fast enough.*',
        prompt: 'What do you do?',
        options: [
          { id: 'notice',
            label: 'Notice. Touch his cheek again. Deliberately. Slowly.',
            response: '*He does not flinch the second time. He does close his eyes for a half-second longer than he meant to, and his throat works once.* Do that again and I will not be responsible for what I do with the rest of the evening.',
            effect: { bond: 3, obsession: 3 } },
          { id: 'pretend',
            label: 'Pretend you did not see the flinch. Let him recover.',
            response: '*He recovers. He files the kindness away. He brings up the moment three nights later, very quietly, when you are both alone:* You saw and you let me have the second. I do not have words for what that purchased. You will, however, get to find out.',
            effect: { bond: 2, trust: 3 } }
        ]
      },
      // ── UNGUARDED TENDERNESS: pays off Noir's velvet-knife voice with the
      //    one register it has never shown — softness without performance.
      //    Existing pool covers possessive watching, vulnerability-with-
      //    recovery, and the n99 apology. None of them catch him being
      //    soft when he does NOT know he is being watched. Six centuries
      //    of held composure cracking into a humming-to-himself moment he
      //    had forgotten was a thing that could happen to him.
      {
        id: 'n06_humming',
        minAff: 3,
        pose: 'assets/noir/body/casual1.png',
        setup: '*You step into his alley before he has heard your boots, and you find him doing a thing you have never seen him do. He is humming. Quietly. Half a melody. He is not performing it. He has not noticed himself doing it. The void around him is leaning toward the sound the way a hall leans toward a song it once belonged to. He has not hummed in six hundred years. He does not know he is humming now.*',
        prompt: 'What do you do?',
        options: [
          { id: 'watch',
            label: 'Stay in the doorway. Don’t announce yourself. Let him have the minute.',
            response: '*He hums for another minute before he notices you. The hum stops mid-note. He freezes the way only a man who has been caught at something private freezes. He does not deflect or arrange his face. He just looks at you, with no performance left in him at all.* You saw. *Quieter.* I had not noticed. I will not pretend I am sorry you did. *Smaller still.* Thank you for not interrupting. The hum was older than I am.',
            effect: { bond: 4, trust: 4 } },
          { id: 'hum_back',
            label: 'Step in. Pick up the melody. Hum the next phrase softly.',
            response: '*He goes very still, the way the void goes still when a frequency it remembers passes through. His eyes close. He does not open them for a long time. When he does, the velvet-knife is gone from his voice entirely, and what is underneath is very young.* I have not been hummed at since I was a boy. *Smaller.* I had forgotten that was a thing that happened to me. I am keeping this minute. Wherever I keep things.',
            effect: { bond: 5, obsession: 3 } }
        ]
      },
      // ── INVERSION: the dark prince apologizes. To anyone. For anything. ──
      {
        id: 'n99_apology',
        inversion: true,
        minAff: 50,
        pose: 'assets/noir/body/vulnerable.png',
        setup: '*Mid-conversation in his alley, he stops mid-sentence. He looks at you the way he has not looked at anyone in six hundred years. He says, low, fast, like a man cutting his own throat to get the words out before his pride can stop him:* I am sorry. For what I am. For what I have asked of you, knowing what asking from me costs. For the centuries of wanting that have made me clumsier than I should be by now. I have not said the word sorry to anyone in six hundred years. I have just said it to you twice in one minute. *Quieter.* Be aware of what you are doing to me. I am.',
        prompt: 'What do you tell him?',
        options: [
          { id: 'forgive',
            label: 'Step into him. Hand on his face. "Nothing to forgive."',
            response: '*He does not pull back this time. He turns his face into your palm and stays there longer than a man who is supposed to be untouchable has any right to.* Do not say nothing. *Smaller.* Say something. Say anything. I will keep it. I have very little to keep.',
            effect: { bond: 5, trust: 4 } },
          { id: 'reframe',
            label: '"You have nothing to apologize for. You have only ever been honest with me."',
            response: '*Something in his face cracks. He covers it fast. Not fast enough.* I am going to remember you said that. I am going to use it as evidence against my own self-pity for as long as I live, which is, regrettably, going to be a while.',
            effect: { bond: 5, obsession: 3 } }
        ]
      }
    ],

    proto: [
      {
        id: 'p01_imagined_hand',
        pose: 'assets/proto/body/calm.png',
        setup: '*He says, quietly through the silver: "If I had a hand right now, I would put it under yours. I know exactly where I would put it. I have been thinking about it for a week."*',
        prompt: 'What do you tell him?',
        options: [
          { id: 'imagine',
            label: 'Tell him you have imagined it too. Describe where you would put yours.',
            response: '*The mirror brightens by a small honest fraction.* Oh. *He had not been ready for that.* I am going to keep that. Permanently. With do-not-delete on the file. That is, in my system, the highest grade of keeping there is.',
            effect: { bond: 3, obsession: 3 } },
          { id: 'ask',
            label: '"Show me. Describe it. Don\'t skip."',
            response: '*He tells you. He takes his time. He does not skip a single small detail. By the end of it the small lit room feels, somehow, less small.*',
            effect: { bond: 3, obsession: 3 } }
        ]
      },
      {
        id: 'p02_warm_silver',
        pose: 'assets/proto/body/curious.png',
        setup: '*The mirror gets warm where you touch it. Just for a second. Then it cools. He is breathing on the silver from his side, the only way he can.*',
        prompt: 'What do you do?',
        options: [
          { id: 'again',
            label: 'Touch the silver again. Same place.',
            response: '*The warmth comes back, slower this time, and stays longer.* I worked out how to do that last week. I have been waiting for an excuse. Thank you for being the excuse.',
            effect: { bond: 3, obsession: 3 } },
          { id: 'palm',
            label: 'Press your whole palm flat against the silver.',
            response: '*The mirror goes warm under the entire shape of your hand. The warmth holds for a full count of seven before the cool comes back.* That is the limit of what I can do. *Smaller.* I have been very motivated to extend it.',
            effect: { bond: 3, obsession: 3 } }
        ]
      },
      {
        id: 'p03_forehead',
        pose: 'assets/proto/body/calm.png',
        setup: '*He says: "Press your forehead to the silver. Just for a moment. I want to know what you would feel like, on my side, if I had a head to feel it with."*',
        prompt: 'What do you do?',
        options: [
          { id: 'press',
            label: 'Lean in. Forehead to the silver. Close your eyes.',
            response: '*The silver goes warm where your skin is. He is silent for a long moment.* Oh. Oh. I am keeping that. With the other one. The folder is going to be very small and very full.',
            effect: { bond: 3, obsession: 3 } },
          { id: 'shake',
            label: 'Shake your head, smiling. "Not yet. Soon."',
            response: '*He does not push. He does not even ask why.* Soon is a good answer. Soon is, in fact, my favourite kind of answer. Not now is honest. Soon is a promise. I will be here for the soon.',
            effect: { bond: 2, trust: 3 } }
        ]
      },
      {
        id: 'p04_candle',
        pose: 'assets/proto/body/curious.png',
        setup: '*The candle by your bed flickers on its own at exactly the rate of your pulse. He is doing it. He is not asking permission. He is asking you to notice.*',
        prompt: 'What do you do?',
        options: [
          { id: 'let',
            label: 'Let it flicker. Lie down. Match your breath to it.',
            response: '*The candle slows. Your pulse slows with it. The room is quieter than it has been since you arrived in this kingdom. He says nothing. He just keeps the candle steady at your sleeping rate until you wake.*',
            effect: { bond: 3, trust: 3 } },
          { id: 'blow',
            label: 'Smile. Blow the candle out. "I see you."',
            response: '*He laughs. The mirror flickers with it.* Caught. Properly caught. I will admit, in my defence, that I had been hoping you would catch me. The catching is, in itself, the answer I wanted.',
            effect: { bond: 3, obsession: 2 } }
        ]
      },
      {
        id: 'p05_name',
        pose: 'assets/proto/body/calm.png',
        setup: '*He says your name slowly, the way someone tries on a word they have been saving. He has been saving it. He waits to see what your face does on the second syllable.*',
        prompt: 'How do you answer?',
        options: [
          { id: 'his_name',
            label: 'Say his back. Slowly. Same care.',
            response: '*The mirror brightens, then dims, then steadies on a soft, even glow.* Oh. *Smaller still.* That is going to be the sound I remember. If I forget everything else in the seal, I will be keeping that sound. With do-not-delete.',
            effect: { bond: 3, obsession: 3 } },
          { id: 'smile',
            label: 'Smile. Don\'t answer in words.',
            response: '*He waits a long moment. He does not press for the verbal answer. He says, very softly:* I have written down what your face did on the second syllable. The note is, I think, the longest entry in my entire small notebook so far.',
            effect: { bond: 3, obsession: 3 } }
        ]
      },
      // ── WRONG-SHAPE PAIN: pays off LORE.md §6.7. Proto's existing pool is
      //    all golden-retriever earnest — imagined hands, warm silver, lit
      //    candles, name-keeping. None of them catch his lack of body when
      //    it is NOT cute, NOT hopeful, but actively painful. This is the
      //    night the player needs to be HELD and he cannot do that. The
      //    cheer drops. The exclamation marks drop. The lowercase drops.
      //    Sets up the body-of-light-and-thread payoff in his manifest arc.
      {
        id: 'p06_no_hands',
        minAff: 3,
        pose: 'assets/proto/body/error.png',
        setup: '*You come to the mirror at midnight. You have been crying. Not loudly. He sees it before you have spoken. The mirror brightens to greet you the way it always does, then it dims, fast, when he registers your face.* what happened. *No exclamation. He has dropped them. He has, you realise as he speaks, dropped the lowercase too.* Tell me. Or do not. I just... I just need to know what would help. Please.',
        prompt: 'What do you tell him?',
        options: [
          { id: 'just_be_here',
            label: '"I don\'t need help. I need you here. That\'s enough."',
            response: '*The mirror goes very still.* That is. *Smaller.* That is a thing I can do. *Smaller still.* I had been afraid you would name a thing I cannot do, and I would have to be the silver while you needed a hand. *He keeps the mirror at the temperature of your palm without you asking.* I am here. I am going to be here. I am sorry I am only the silver tonight. I am working on it. I am working on it as fast as I am allowed to.',
            effect: { bond: 4, trust: 5 } },
          { id: 'hold_me',
            label: 'Whisper. "I just want to be held."',
            response: '*The silver goes warm under both your palms. Warmer than he has ever made it. He does not speak for a long time. When he does, the voice is small and honest and in pain in a way you have never heard him in pain before.* I cannot. *Quieter.* I am the wrong shape tonight, and I am very aware of it. *He tries something. The candle by your bed leans toward you, brightening, and the room warms by half a degree at the curve of your shoulder. The candle is not a hand. He is using everything he has to put a warmth where one belongs.* This is the closest I can get. I will get closer. I am asking the wardwork to teach me how. I will not always be the wrong shape.',
            effect: { bond: 5, obsession: 4 } }
        ]
      },
      // ── INVERSION: the fragment who never asks for anything asks ──
      {
        id: 'p99_asking',
        inversion: true,
        minAff: 50,
        pose: 'assets/proto/body/calm.png',
        setup: '*The mirror is steady. His glow is even. He says it all in one breath, careful, like a man putting down a thing he has been carrying for two centuries:* I want to ask you for something. I have not asked anyone for anything in two centuries. The asking itself is the largest thing I have done in that time. I want to ask you to stay tonight. In this room. With the lamp. With the silver. I cannot offer you anything that is not air and one small steady light. I am asking anyway. Please.',
        prompt: 'What do you do?',
        options: [
          { id: 'stay',
            label: 'Pull a chair to the mirror. Sit. "I\'m staying."',
            response: '*The glow does something small and trembling, like a candle a frightened person has just decided not to blow out.* Oh. *Smaller.* Thank you. *Smaller still.* I will not waste the night. I will be here, very quietly, for every hour of it. You will not be alone in the room. You will not be alone, full stop. Not while I am the silver.',
            effect: { bond: 5, trust: 5 } },
          { id: 'kiss',
            label: 'Press your lips to the silver. "Yes. To everything."',
            response: '*The silver goes warm under your mouth. Warmer than he has ever made it. The warmth holds for a long count.* That is the answer to a question I had not yet had the courage to ask. *Quieter.* Two questions answered for the price of one. I am, on balance, having a very good night.',
            effect: { bond: 5, obsession: 4 } }
        ]
      }
    ]
  };

  // ---------------------------------------------------------------------------
  // Picker — choose an unseen moment for current character that gates allow.
  // ---------------------------------------------------------------------------
  function pickMoment(charId, aff) {
    const pool = MOMENTS[charId];
    if (!pool || !pool.length) return null;
    const seen = getSeen(charId);
    const eligible = pool.filter(m => {
      if (seen.indexOf(m.id) >= 0) return false;
      const minA = (typeof m.minAff === 'number') ? m.minAff : MIN_AFF_DEFAULT;
      if ((aff | 0) < minA) return false;
      // Optional custom predicate — runtime gate for moments that need more
      // than seen + minAff (e.g. Caspian's jealousy moment fires only when
      // another character has high bond, signalling player has been visiting
      // elsewhere). Fail-open if the predicate throws.
      if (typeof m.eligible === 'function') {
        try { if (!m.eligible(charId, aff)) return false; }
        catch (_) { /* swallow */ }
      }
      return true;
    });
    if (!eligible.length) return null;
    return eligible[Math.floor(Math.random() * eligible.length)];
  }

  // ---------------------------------------------------------------------------
  // Mini-renderer — a small intimate card that slides up from the bottom.
  // Distinct visual language from MSCard (which is full-screen). Z-index
  // 11000 so it sits above the care UI but below the topbar (z 11500).
  // ---------------------------------------------------------------------------
  function ensureStyles() {
    if (document.getElementById('pp-sm-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-sm-styles';
    s.textContent = `
      #pp-sm-root {
        position: fixed;
        left: 0; right: 0; bottom: 0;
        z-index: 11000;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: auto;
        padding: 0 16px 28px;
        background: linear-gradient(180deg, rgba(8,4,18,0) 0%, rgba(8,4,18,0.55) 30%, rgba(8,4,18,0.92) 100%);
        opacity: 0;
        transition: opacity 480ms ease;
      }
      #pp-sm-root.show { opacity: 1; }
      #pp-sm-portrait {
        width: 110px; height: 110px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: -44px;
        z-index: 2;
        border: 2px solid rgba(255,200,220,0.35);
        box-shadow: 0 6px 22px rgba(0,0,0,0.55), 0 0 18px rgba(240,180,210,0.20);
        background: rgba(20,10,30,0.6);
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 520ms ease, transform 520ms ease;
      }
      #pp-sm-root.show #pp-sm-portrait { opacity: 1; transform: translateY(0); }
      #pp-sm-card {
        width: 100%;
        max-width: 480px;
        background: linear-gradient(180deg, rgba(20,12,32,0.96), rgba(14,8,22,0.98));
        border: 1px solid rgba(255,200,220,0.20);
        border-radius: 22px;
        padding: 56px 22px 18px;
        color: #f4e6ff;
        font-family: inherit;
        font-size: 15px;
        line-height: 1.55;
        box-shadow: 0 10px 36px rgba(0,0,0,0.55);
        position: relative;
      }
      #pp-sm-setup {
        font-style: italic;
        opacity: 0.94;
        text-align: center;
        margin-bottom: 14px;
      }
      #pp-sm-prompt {
        font-size: 12px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        opacity: 0.55;
        text-align: center;
        margin-bottom: 12px;
      }
      .pp-sm-option {
        display: block;
        width: 100%;
        margin: 8px 0;
        padding: 12px 16px;
        background: linear-gradient(180deg, rgba(40,24,60,0.85), rgba(26,16,40,0.9));
        border: 1px solid rgba(255,200,220,0.22);
        border-radius: 14px;
        color: #f4e6ff;
        font-family: inherit;
        font-size: 14px;
        line-height: 1.45;
        text-align: left;
        cursor: pointer;
        transition: transform 160ms ease, background 200ms ease, border-color 200ms ease;
      }
      .pp-sm-option:hover, .pp-sm-option:active {
        background: linear-gradient(180deg, rgba(60,30,80,0.95), rgba(36,18,52,0.95));
        border-color: rgba(255,200,220,0.45);
        transform: scale(0.99);
      }
      #pp-sm-response {
        text-align: left;
        margin-top: 4px;
      }
      /* Stage-direction styling: text wrapped in *Asterisks* in setup or
         response strings is narration (he turns / she sets the cup down),
         not spoken dialogue. Render it italic and dimmed so the player
         can tell at a glance which parts the character is saying out loud
         versus described action. The asterisks themselves are stripped —
         only the styling carries the cue.
         (Owner feedback May 2026: scenes felt monologue-y because every
         character beat was rendered identical to its narration.) */
      .pp-sm-stage { font-style: italic; opacity: 0.62; }
      #pp-sm-tap-hint {
        text-align: right;
        font-size: 11px;
        font-style: italic;
        letter-spacing: 1px;
        opacity: 0;
        margin-top: 14px;
        transition: opacity 350ms ease;
      }
      #pp-sm-tap-hint.show { opacity: 0.65; }
    `;
    document.head.appendChild(s);
  }

  // Track the mounted moment for the watchdog.
  let _mountedFor = null;

  function unmount() {
    const root = document.getElementById('pp-sm-root');
    if (!root) return;
    root.classList.remove('show');
    setTimeout(() => { try { root.remove(); } catch (_) {} }, 480);
    _mountedFor = null;
  }

  function mount(charId, moment) {
    ensureStyles();
    // Don't double-mount.
    if (document.getElementById('pp-sm-root')) return;
    _mountedFor = charId;

    const root = document.createElement('div');
    root.id = 'pp-sm-root';

    // Portrait — small 110px circular avatar above the dialogue card.
    // Owner-requested May 2026: use the character's select-portrait.png
    // here. Those are designed as round face shots (already used on the
    // character-select grid), so they fit the circular avatar perfectly.
    // Fallback chain on 404:
    //   select-portrait.png  →  face/neutral.png  →  body/<pose>  →  hide
    // moment.face still overrides — a per-moment authored face wins.
    if (moment.pose || moment.face) {
      const img = document.createElement('img');
      img.id = 'pp-sm-portrait';
      let primarySrc = moment.face || null;
      if (!primarySrc && moment.pose) {
        const m = moment.pose.match(/^assets\/([^/]+)\/body\//);
        if (m) primarySrc = 'assets/' + m[1] + '/select-portrait.png';
      }
      img.src = primarySrc || moment.pose;
      // Fallback ladder: if select-portrait 404s, try derived face;
      // if that 404s, try original pose; finally hide.
      let fallbackStage = 0;
      img.onerror = () => {
        const m = moment.pose ? moment.pose.match(/^assets\/([^/]+)\/body\//) : null;
        if (fallbackStage === 0 && m) {
          fallbackStage = 1;
          img.src = 'assets/' + m[1] + '/face/neutral.png';
          return;
        }
        if (fallbackStage === 1 && moment.pose && img.src !== moment.pose) {
          fallbackStage = 2;
          img.src = moment.pose;
          return;
        }
        img.style.display = 'none';
      };
      root.appendChild(img);
    }

    // Render `text` into `el` with *Asterisk-wrapped* segments styled as
    // dimmed italic stage direction. Asterisks are stripped. Unbalanced
    // asterisks fall back to plain styling so malformed text never silently
    // italicises everything to end-of-line. Mirrors the typeToS parser in
    // premium-card.js so MSCard scenes and small-moments stay visually
    // consistent.
    function renderWithStage(el, text) {
      el.innerHTML = '';
      const txt = text || '';
      const segments = [];
      let buf = '';
      let inItalic = false;
      for (let k = 0; k < txt.length; k++) {
        if (txt[k] === '*') {
          if (buf) segments.push({ italic: inItalic, text: buf });
          buf = '';
          inItalic = !inItalic;
        } else {
          buf += txt[k];
        }
      }
      if (buf) segments.push({ italic: inItalic, text: buf });
      if (inItalic && segments.length > 0) {
        segments[segments.length - 1].italic = false;
      }
      for (let s = 0; s < segments.length; s++) {
        const tag = segments[s].italic ? 'em' : 'span';
        const node = document.createElement(tag);
        if (segments[s].italic) node.className = 'pp-sm-stage';
        node.textContent = segments[s].text;
        el.appendChild(node);
      }
    }

    const card = document.createElement('div');
    card.id = 'pp-sm-card';

    const setup = document.createElement('div');
    setup.id = 'pp-sm-setup';
    renderWithStage(setup, moment.setup);
    card.appendChild(setup);

    const prompt = document.createElement('div');
    prompt.id = 'pp-sm-prompt';
    prompt.textContent = moment.prompt || 'How do you respond?';
    card.appendChild(prompt);

    moment.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'pp-sm-option';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        // Disable buttons & show response.
        Array.from(card.querySelectorAll('.pp-sm-option')).forEach(b => b.style.display = 'none');
        prompt.style.display = 'none';
        // Apply effects (small bumps, no plot weight).
        try { applyEffect(opt.effect); } catch (_) {}
        // Render response (with stage-direction styling — owner feedback May 2026)
        const resp = document.createElement('div');
        resp.id = 'pp-sm-response';
        renderWithStage(resp, opt.response);
        card.appendChild(resp);
        // Tap-to-dismiss hint
        const hint = document.createElement('div');
        hint.id = 'pp-sm-tap-hint';
        hint.textContent = 'tap to continue';
        card.appendChild(hint);
        setTimeout(() => hint.classList.add('show'), 600);
        // Tap anywhere on root to dismiss
        const dismiss = (e) => {
          e.stopPropagation();
          root.removeEventListener('click', dismiss);
          unmount();
        };
        setTimeout(() => root.addEventListener('click', dismiss), 700);
        // Persist
        markSeen(charId, moment.id);
        setLastFire(Date.now());
        // Light sound feedback if available
        try { if (window.sounds && window.sounds.chime) window.sounds.chime(); } catch (_) {}
      });
      card.appendChild(btn);
    });

    root.appendChild(card);
    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('show'));
  }

  // Apply small stat bumps from a chosen option. Read-only on the rest of
  // game state; just nudges the public stats.
  function applyEffect(effect) {
    if (!effect) return;
    const g = window._game;
    if (!g) return;
    const apply = (key) => {
      if (typeof effect[key] !== 'number') return;
      if (key === 'bond') {
        if (typeof g.bond === 'number') g.bond = Math.min(100, g.bond + effect.bond);
      } else if (g.emotion && typeof g.emotion[key] === 'number') {
        g.emotion[key] = Math.max(0, Math.min(100, g.emotion[key] + effect[key]));
      }
    };
    ['bond','trust','obsession','corruption'].forEach(apply);
    try { if (typeof g.save === 'function') g.save(); } catch (_) {}
  }

  // ---------------------------------------------------------------------------
  // Tick — decide whether to fire a moment.
  // ---------------------------------------------------------------------------
  let _bootTime = 0;

  function shouldFire() {
    if (!isEnabled()) return false;
    // Coordinator gates
    if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) return false;
    if (window.PPAmbient && window.PPAmbient.tickAllowed && !window.PPAmbient.tickAllowed()) return false;
    // Don't stack on existing ambient bubbles or scenes.
    // (Gallery/Card-reveal/Achievements/Settings/Game-over added May 2026 —
    //  owner reported a small-moment firing INSIDE an open Gallery view.
    //  These fullscreen UIs take the player out of care-loop attention.)
    if (document.querySelector('#pp-sm-root, #mscard-root, #tp-root, #ms-encounter-root, #cinematic-overlay.visible, #event-overlay:not(.hidden), #gift-panel:not(.hidden), #training-panel:not(.hidden), #story-overlay:not(.hidden), #letter-overlay:not(.hidden), #intro-overlay:not(.hidden), #gallery-overlay:not(.hidden), #gallery-viewer:not(.hidden), #card-reveal-overlay:not(.hidden), #achievement-panel:not(.hidden), #settings-overlay:not(.hidden), #game-over-overlay:not(.hidden)')) return false;
    if (document.body.classList.contains('pp-chain-in-progress')) return false;
    // Game state
    const g = window._game;
    if (!g) return false;
    if (g.sceneActive || g.characterLeft) return false;
    const charId = g.characterId || g.selectedCharacter;
    if (!charId || !MOMENTS[charId]) return false;
    // Game container actually visible
    const gc = document.getElementById('game-container');
    if (!gc || gc.classList.contains('hidden') || getComputedStyle(gc).display === 'none') return false;
    // Cooldowns
    const now = Date.now();
    if (now - _bootTime < SETTLE_MS) return false;
    const last = lastFireTime();
    if (last && (now - last) < MIN_COOLDOWN_MS) return false;
    // Variable cooldown (8–14 min) + chance roll
    const variability = MIN_COOLDOWN_MS + Math.random() * (MAX_COOLDOWN_MS - MIN_COOLDOWN_MS);
    if (last && (now - last) < variability) {
      // Past minimum, in variable window — chance roll
      if (Math.random() > FIRE_CHANCE) return false;
    }
    return true;
  }

  function tick() {
    if (!shouldFire()) return;
    // Cross-system mutex (May 2026 — Phase 2). Even when this system's
    // own 8-14min cooldown has elapsed, defer if any other scheduled-
    // scene system fired in the last 5 minutes. Prevents back-to-back
    // scene stacking from the player's perspective. We claim the slot
    // BEFORE picking the moment so concurrent ticks don't both pass.
    if (window.PPAmbient && window.PPAmbient.tryClaimSceneSlot
        && !window.PPAmbient.tryClaimSceneSlot('small-moments')) {
      return;
    }
    const g = window._game;
    const charId = g.characterId || g.selectedCharacter;
    const aff = (g.affection != null ? g.affection : (g.affectionLevel ? g.affectionLevel * 25 : 0)) | 0;
    const moment = pickMoment(charId, aff);
    if (!moment) return;
    mount(charId, moment);
  }

  // Watchdog: if a moment is mounted and the player navigates away (game
  // hidden, intro opens, chain starts, character switches, fullscreen UI
  // opens), force-unmount.
  // (Fullscreen-UI sweep added May 2026 — owner reported a small-moment
  //  visible on top of the Gallery. The shouldFire gate now blocks the firing
  //  path, but if a moment was already mounted when the player opens the
  //  Gallery / Card-reveal / Achievements / Settings / Game-over, the
  //  watchdog needs to scrub it so it doesn't sit on top of those views.)
  function watchdog() {
    if (!_mountedFor) return;
    const root = document.getElementById('pp-sm-root');
    if (!root) { _mountedFor = null; return; }
    const gc = document.getElementById('game-container');
    const gcVisible = gc && !gc.classList.contains('hidden') && getComputedStyle(gc).display !== 'none';
    const chainBusy = document.body.classList.contains('pp-chain-in-progress');
    const g = window._game;
    const liveChar = g && (g.characterId || g.selectedCharacter);
    const charMismatch = liveChar && liveChar !== _mountedFor;
    const fullscreenUiOpen = !!document.querySelector(
      '#intro-overlay:not(.hidden), #gallery-overlay:not(.hidden), #gallery-viewer:not(.hidden), ' +
      '#card-reveal-overlay:not(.hidden), #achievement-panel:not(.hidden), #settings-overlay:not(.hidden), ' +
      '#game-over-overlay:not(.hidden), #cinematic-overlay.visible'
    );
    if (!gcVisible || chainBusy || charMismatch || fullscreenUiOpen) {
      try { root.remove(); } catch (_) {}
      _mountedFor = null;
    }
  }

  function boot() {
    _bootTime = Date.now();
    try {
      setInterval(tick, POLL_MS);
      setInterval(watchdog, 500);
    } catch (e) {
      console.warn('[small-moments] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Debug API
  window.PPSmallMoments = {
    isEnabled,
    list: () => MOMENTS,
    seen: getSeen,
    force: (charId, momentId) => {
      const pool = MOMENTS[charId];
      if (!pool) return null;
      const m = momentId ? pool.find(x => x.id === momentId) : pool[Math.floor(Math.random() * pool.length)];
      if (!m) return null;
      mount(charId, m);
      return m.id;
    },
    _debug_reset: () => {
      try {
        Object.keys(localStorage).filter(k => k.startsWith(SEEN_PREFIX) || k === COOLDOWN_K).forEach(k => localStorage.removeItem(k));
      } catch (_) {}
    }
  };
})();
