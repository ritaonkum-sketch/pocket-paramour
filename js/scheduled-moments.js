/* scheduled-moments.js — the "be back at the third bell" engine.
 * ============================================================================
 * WHY THIS EXISTS:
 *   Small Moments (small-moments.js) are the *During-session* hook — they
 *   fire while the player is already in care. This module is the
 *   *Between-session* hook: the character invites the player to return at a
 *   specific real-world time. Be back at 9pm and a special scene fires.
 *   Miss the window and the character says so the next time you open the app.
 *
 *   This is the single most proven daily-loop mechanic in mobile games.
 *   Mystic Messenger built an entire genre around it. We are doing a milder
 *   version: 1 invitation per character (7 total), generous cooldowns, and
 *   the missed scenes are emotional weight rather than punishment.
 *
 * FLOW:
 *   1. INVITE  — at random during a care session (with cooldown gates), the
 *      character sends a one-line note. Player dismisses.
 *      Stored: pp_sched_pending = { charId, invId, targetTime, status }
 *   2. ARRIVE — on app open, if now is within ±30 min of targetTime,
 *      the special arrival scene fires immediately.
 *   3. MISS   — if now > targetTime + window, status flips to 'missed';
 *      the regret scene fires the next time the player opens that
 *      character's care route.
 *
 * SAFETY CONTRACT:
 *   - Read-only on stats except small bumps in onChoose (same as small-moments).
 *   - Coordinator-aware: never fires during chains/scenes/intros.
 *   - One pending invitation system-wide at a time (no overlaps).
 *   - Each invitation fires once per save (seen tracking).
 *   - Reuses small-moments.js mini-renderer for visual consistency.
 * ============================================================================
 */

(function () {
  'use strict';

  const FLAG_KEY      = 'pp_scheduled_moments_enabled';
  const PENDING_KEY   = 'pp_sched_pending';      // JSON of pending invitation
  const SEEN_PREFIX   = 'pp_sched_seen_';        // + charId → JSON array of inv ids
  const COOLDOWN_K    = 'pp_sched_last_invite';  // ms timestamp of last invite sent
  const POLL_MS       = 60 * 1000;               // 1 min poll
  const INVITE_COOLDOWN_MS = 36 * 60 * 60 * 1000; // 36 hours between invites
  const SETTLE_MS     = 3 * 60 * 1000;            // 3 min after session start before invites
  const INVITE_CHANCE = 0.10;                     // 10% per eligible tick → ~once per long session
  const WINDOW_MIN    = 30;                       // ±30 min for "arrival"
  const FIRED_KEY     = 'pp_sched_inv_fired';     // {invId: lastFiredMs} — recurrence rotation
  const RECUR_COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000; // a seen invite can re-fire after 5 days

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (_) {} }

  function isEnabled() {
    try { return lsGet(FLAG_KEY) !== '0'; } catch (_) { return true; }
  }

  function getSeen(charId) {
    try {
      const raw = lsGet(SEEN_PREFIX + charId);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }
  function markSeen(charId, invId) {
    try {
      const arr = getSeen(charId);
      if (arr.indexOf(invId) >= 0) return;
      arr.push(invId);
      lsSet(SEEN_PREFIX + charId, JSON.stringify(arr));
    } catch (_) {}
  }

  function getPending() {
    try {
      const raw = lsGet(PENDING_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) { return null; }
  }
  function setPending(obj) {
    try { lsSet(PENDING_KEY, JSON.stringify(obj)); } catch (_) {}
  }
  function clearPending() { lsDel(PENDING_KEY); }

  // ---------------------------------------------------------------------------
  // INVITATIONS — 1 per character (v1). Each:
  //   id, charId, idealHour (0-23 wall-clock), windowMin,
  //   invitation: { setup, callToAction },
  //   onArrive:   { setup, prompt, options: [...] },
  //   onMiss:     { setup, prompt, options: [...] }
  //
  // Voice notes from small-moments carry forward — same characters, same
  // cadence. The invitations are calibrated to the character's natural hour:
  //   - Alistair: 21h (after watch turn, his off-duty hour)
  //   - Lyra:     19h (sunset / cave-mouth dusk)
  //   - Caspian:  22h (after court closes, before bed)
  //   - Lucien:   22h (the scholar's quiet hour)
  //   - Elian:    6h  (dawn at the treeline)
  //   - Noir:     23h (the third bell — his hour by definition)
  //   - Proto:    0h  (midnight — the silver is brightest then, in his words)
  // ---------------------------------------------------------------------------
  const INVITATIONS = {
    alistair: {
      id: 'sched_alistair_balcony',
      charId: 'alistair',
      idealHour: 21,
      tier: 1,
      anchorLine: 'The south balcony, after the third bell',
      pose: 'assets/alistair/body/wondering.png',
      invitation: {
        setup: '*A note on your nightstand. Folded once. The seal is the captain’s, pressed into wax that is still slightly warm.*',
        callToAction: '“South balcony. After the watch turns tonight. I will be there until the third bell rings. If you cannot come, write back. If you can come, do not write. I will know.”'
      },
      onArrive: {
        setup: '*The south balcony, after the watch turn. Cool air, no torches. He is leaning on the parapet, his cloak loose around his shoulders. He turns when he hears your step. The look on his face is the one a man wears when something he had told himself not to hope for has happened anyway.*',
        prompt: 'What do you do?',
        options: [
          { id: 'lean',
            label: 'Lean against the parapet beside him. Don’t speak.',
            response: '*He does not speak either. He pulls the cloak from his own shoulders and settles it around yours without asking. His hand stays on your back.* You came. *Smaller.* Thank you for coming. The bell will ring twice more. We have time for both.',
            effect: { bond: 4, trust: 3 } },
          { id: 'kiss',
            label: 'Step into him. Kiss him without speaking.',
            response: '*He kisses you back, properly, the way a captain who has been holding the inside of his own restraint together kisses someone he has finally been allowed to.* The bell rings differently from up here. *Quieter, against your hair.* Or it does tonight, with you. I will not be hearing it the same way again.',
            effect: { bond: 5, obsession: 4 } }
        ]
      },
      onMiss: {
        setup: '*He is at the captain’s table in the morning when you find him. He does not look up when you sit down. He does, eventually, fold the report away. He says it without raising his voice, the way he says everything that costs him to say:* I waited an hour past the watch turn. The bell rang twice before I went down. I was on the south balcony. You were not.',
        prompt: 'What do you say?',
        options: [
          { id: 'sorry',
            label: 'Apologise. Hand on his hand. "I didn’t see the note in time."',
            response: '*He turns his hand under yours, palm up, and laces his fingers through.* I believe you. *Smaller.* I will fold the next one twice and slide it where you cannot miss it. The note was an experiment. The experiment said: she did not see the note. The next experiment will be louder.',
            effect: { bond: 2 } },
          { id: 'tonight',
            label: '"Tonight. Same place. I won’t miss again."',
            response: '*The corner of his mouth does the thing that on him counts as a smile.* Tonight, then. I will not say it twice in case the bell is listening and decides to pre-empt me again.',
            effect: { bond: 3, obsession: 2 } }
        ]
      }
    },

    lyra: {
      id: 'sched_lyra_dusk',
      charId: 'lyra',
      idealHour: 19,
      anchorLine: 'The cave-mouth, at dusk',
      pose: 'assets/lyra/body/eyes-closed.png',
      invitation: {
        setup: '*A small wave breaks against your boot when you walk past the courtyard fountain. Inside the foam, a single salt-crystal, and a hummed phrase only you hear, in her voice.*',
        callToAction: '“Cave-mouth at dusk. The first stars over the water. I will sing the verse I have been saving. Bring nothing. Bring yourself.”'
      },
      onArrive: {
        setup: '*The cave-mouth at dusk. The first stars are out. She is in the surf to her ankles. She turns when she hears the path. She does not run to you. She holds the spot she is standing in like a question she is asking the cave.*',
        prompt: 'What do you do?',
        options: [
          { id: 'wade',
            label: 'Walk into the surf to meet her. Cold water and all.',
            response: '*She catches your hand under the water as you reach her. She begins the verse before you have stopped walking. The cave hums under it. The first star over the water blinks once, on cue, like it has been listening.* You came. The cave is going to be insufferable. I am going to let it be.',
            effect: { bond: 5, trust: 3 } },
          { id: 'beach',
            label: 'Stay on the dry sand. Listen from there.',
            response: '*She walks out to you. Her bare feet leave wet prints up to where you are standing. She sings the verse to you with the sea behind her, and when she is done she does not say anything for a long count.* That was for you. The cave can have the second performance. The first was always going to be yours.',
            effect: { bond: 5, obsession: 3 } }
        ]
      },
      onMiss: {
        setup: '*The cave the next morning. She is brushing her hair without humming. The salt-crystal that was in the fountain is back, dry now, sitting on the rock beside her.* I sang the verse to the empty cave last night. The cave was not the audience I had been writing it for. It was kind enough to pretend.',
        prompt: 'What do you tell her?',
        options: [
          { id: 'apologise',
            label: 'Sit beside her. "I’m sorry. Tell me when you’ll sing it again."',
            response: '*She looks at you for a long moment, then she resumes brushing.* Tonight. Same hour. I will sing it once more, for you specifically, and then never again. The cave wants it that way. So do I.',
            effect: { bond: 3, trust: 2 } },
          { id: 'request',
            label: '"Sing it now. For me. The cave can have what’s left."',
            response: '*Her face does the thing it does when she is being given the answer she was hoping you would think to give.* Now, then. *She begins. The cave brightens by half a degree, in spite of itself.*',
            effect: { bond: 4, obsession: 3 } }
        ]
      }
    },

    caspian: {
      id: 'sched_caspian_throne',
      charId: 'caspian',
      idealHour: 22,
      anchorLine: 'The throne room, after the second bell',
      pose: 'assets/caspian/body/casual1.png',
      invitation: {
        setup: '*A folded note slipped under your door. The seal is the small one, not the great one. You know which one that means.*',
        callToAction: '“Throne room, after the second bell. No retainers, no candles. Bring nothing the court has touched. I will be in plain wool. I want to show you something I cannot show you in daylight.”'
      },
      onArrive: {
        setup: '*The throne room is dark except for one candle on the dais step. He is sitting on the floor at the base of the throne, in plain wool, the gold band beside him on the stone. He looks up when you arrive. He does not stand.* You came. I had told myself I would not be disappointed if you did not. I was lying to myself. I am, plainly, not disappointed.',
        prompt: 'What do you do?',
        options: [
          { id: 'sit_floor',
            label: 'Cross the room. Sit on the floor beside him.',
            response: '*He shifts to make room. His shoulder rests against yours.* This is the room I would like you in when I am too tired to be the prince. I would like that to be possible. I am asking, in the gentlest way I know how, whether it is.',
            effect: { bond: 5, trust: 4 } },
          { id: 'crown',
            label: 'Pick up the band from the stone. Hold it. "Take the night off."',
            response: '*He stares at his own hands for a moment. Then he reaches and lifts the band from your palm and sets it down behind the throne, out of sight.* The night is off. Sit with me. I will be a man for an hour and the kingdom will survive without the supervision.',
            effect: { bond: 5, obsession: 3 } }
        ]
      },
      onMiss: {
        setup: '*He finds you the next morning in the east garden. He is dressed for court. The candle on the dais step burned down to a stump while he sat there past the third bell.* I waited. I am not asking for an explanation. I would, however, like to know if I should stop sending those particular notes.',
        prompt: 'What do you tell him?',
        options: [
          { id: 'never',
            label: 'Take both his hands. "Never stop sending them."',
            response: '*The court-mask cracks for half a second.* Good. *Quieter.* I had been preparing the speech where I told myself I had been a fool. I am pleased not to have to deliver it. To anyone. Especially myself.',
            effect: { bond: 4, trust: 3 } },
          { id: 'tonight_tonight',
            label: '"Tonight. Same place. The candle stays lit this time."',
            response: '*He nods, once. He does not say the relieved thing he is thinking. The chamberlain reads it on him an hour later and writes it in his ledger anyway.*',
            effect: { bond: 3, obsession: 2 } }
        ]
      }
    },

    lucien: {
      id: 'sched_lucien_tower',
      charId: 'lucien',
      idealHour: 22,
      anchorLine: 'The tower, at the second bell',
      pose: 'assets/lucien/body/casual1.png',
      invitation: {
        setup: '*A page slipped under your door, in his hand, neat as ever. There is a small drawing in the corner of a star you do not recognise, with one ray longer than the rest.*',
        callToAction: '“Tower, second bell. The sky above the dome is doing something I have been waiting for. Not predicted. Anomalous. I would like a witness. I would like, specifically, you.”'
      },
      onArrive: {
        setup: '*The tower at the second bell. The dome is open. The sky is doing something he has not seen before in nine years of charts. A long, slow streak of green-edged light, the kind that should not exist in the established mathematics of this kingdom’s weather. He is at the telescope. He looks up when you climb in.* You came. *Quieter.* Look up first. The light will not wait. I will.',
        prompt: 'What do you do?',
        options: [
          { id: 'look',
            label: 'Lie back on the floor under the dome. Watch with him.',
            response: '*He lies down beside you. He does not touch you. His hand rests on the floor between you with the palm up. After a while you put yours in it.* I do not know what we are looking at. *Smaller.* I am, however, glad I am not looking at it alone. I have been alone under this dome for nine years.',
            effect: { bond: 5, trust: 4 } },
          { id: 'note',
            label: 'Take the journal from the desk. Sketch the light beside him.',
            response: '*He watches you draw. He does not correct your line. When you are done he tears the page out, signs it with both your initials, and slips it into the inside cover of the journal.* The first observation co-authored by anyone but me. *Quietly.* I will be telling the council about the light. I will not be telling them about the page.',
            effect: { bond: 5, obsession: 4 } }
        ]
      },
      onMiss: {
        setup: '*The tower the next afternoon. He is at the desk with a notebook open to a fresh page. The sketch of the light is finished. There is, however, a single line in the margin that he turns, slightly, so you cannot quite read it.* The light came just past the bell. It lasted the space of nine breaths. I sat under the dome alone for all of them.',
        prompt: 'What do you say?',
        options: [
          { id: 'soon',
            label: '"Show me the sketch. Tell me everything I missed."',
            response: '*He turns the page toward you and walks you through it, line by careful line, until you have stood under nine breaths of light he has not been able to stop thinking about.* That is the closest I can get you to having seen it. *Smaller.* I am sorry it is not closer.',
            effect: { bond: 3, trust: 3 } },
          { id: 'next',
            label: '"When’s the next anomaly? I’ll be there."',
            response: '*He smiles, very small, the corner of his mouth doing what corners of mouths do when a man has been waiting for an answer in that exact shape.* I cannot predict the next one. That is, in fact, the nature of an anomaly. I will, however, send you the note the moment my instruments hum. Sleep with the door unbarred.',
            effect: { bond: 3, obsession: 3 } }
        ]
      }
    },

    elian: {
      id: 'sched_elian_dawn',
      charId: 'elian',
      idealHour: 6,
      anchorLine: 'The treeline, at dawn',
      pose: 'assets/elian/body/calm.png',
      invitation: {
        setup: '*A small bundle on your chair when you wake up, even though you locked the door. A wrapped pinecone, a folded leaf, and one line of charcoal on a strip of birch-bark.*',
        callToAction: '“Treeline, dawn. Wear the cloak. Bring the boots, not the slippers. The forest wants to show you something. I want to be there when it does.”'
      },
      onArrive: {
        setup: '*The treeline, just before sunrise. The sky is the colour the sky is only when it has decided to be honest for an hour. He is standing where the markers end, his hand on the trunk of the rowan, and when he turns and sees you he nods, once, like a man whose entire week has just arrived on time.* Good. Walk slowly. The forest is paying attention.',
        prompt: 'What do you do?',
        options: [
          { id: 'follow',
            label: 'Walk beside him into the trees. No questions.',
            response: '*Twenty paces in, the light comes through the canopy at exactly the angle he had been waiting for. The forest floor lights up. A thousand small white flowers that bloom only at this one moment of the year. He watches your face. Not the flowers.* I have been waiting six years for the bloom and four months for the right person to bring. *Smaller.* You are correct that I am not subtle.',
            effect: { bond: 5, trust: 4 } },
          { id: 'hand',
            label: 'Take his hand. Walk in.',
            response: '*He does not let go of your hand the whole walk in. When the flowers bloom around your feet he says, very quietly, with no whetstone or weather to hide behind:* If you would have me. I am asking. I am, I am told, allowed to ask now.',
            effect: { bond: 5, obsession: 4 } }
        ]
      },
      onMiss: {
        setup: '*The treeline, the sun straight overhead. The flowers have closed. They will not open again for another year. He is sharpening his knife on the same log he sharpens it on every day. He does not look up.* The bloom came at first light. I waited. The forest waited. We have a year to go before it tries again.',
        prompt: 'What do you say?',
        options: [
          { id: 'with_you',
            label: 'Sit beside him on the log. "Tell me what they looked like."',
            response: '*He sets the knife down. He describes the flowers for you, slowly, in more detail than he has ever described anything aloud. By the end you have seen them. He has, in his own way, given you the bloom anyway.*',
            effect: { bond: 4, trust: 3 } },
          { id: 'next_year',
            label: '"Next year. Same dawn. I won’t miss it."',
            response: '*He nods. He does not promise back. He does, two days later, carve a small wooden flower the size of a coin and leave it on your nightstand without a note. You will know what it is.*',
            effect: { bond: 3, obsession: 3 } }
        ]
      }
    },

    noir: {
      id: 'sched_noir_seam',
      charId: 'noir',
      idealHour: 23,
      anchorLine: 'The seam, at the third bell',
      pose: 'assets/noir/body/casual1.png',
      invitation: {
        setup: '*A black thread on your pillow when you turn the bed down. Not a curse. Not a warning. An invitation, in his style, written in a language only one person in the kingdom uses.*',
        callToAction: '“Third bell. The seam. I am opening it tonight, fully, for a moment. With you, if you will come. I will not open it again on my own.”'
      },
      onArrive: {
        setup: '*The seam at the third bell. Wider tonight than you have ever seen it. The dark behind it is not threatening. It is patient, the way a room that has been waiting six hundred years to be entered is patient. He is on this side of it. He is holding the seam open with both hands, and the strain of it is on his face.* You came. *He says it like a man who is about to lose the ability to hold something for very much longer.* Step in. With me. A moment. Then I close it. Hand.',
        prompt: 'What do you do?',
        options: [
          { id: 'in',
            label: 'Take his hand. Step into the dark with him.',
            response: '*The dark closes around you both, gently. Inside it you can see the outline of a kingdom that does not exist anymore. He turns to you in the half-light. The minute lasts longer than minutes are supposed to.* I wanted you to see it once. *Quieter.* It does not look like much. It is, however, mine. You being in it is the first time it has been more than that.',
            effect: { bond: 5, obsession: 4, corruption: 1 } },
          { id: 'threshold',
            label: 'Stay at the seam-edge. Hold the open with him.',
            response: '*He does not press. He watches you across the seam, his hand on the open and yours next to it, holding the dark between you for the full minute he promised.* You are wise. You are also, I notice, holding the seam with me as if you have done it before. *Smaller.* Thank you for not letting me hold it alone.',
            effect: { bond: 5, trust: 4 } }
        ]
      },
      onMiss: {
        setup: '*The next morning the seam is closed. He is at the alley wall, watching the merchant-quarter wake up. He does not turn when you arrive. He does, however, speak before you do.* I held it open until my hands gave. The seam closed on its own. The kingdom is, slightly, a less strange place this morning than it was last night.',
        prompt: 'What do you tell him?',
        options: [
          { id: 'sorry',
            label: 'Step into him. "I’m sorry. I want to see it. Open it again."',
            response: '*He turns then. His face is the face of a man who had been preparing not to be wanted and is now allowed to put the preparation down.* Tomorrow. The third bell. I will open it again. I will wait longer this time. I have, as you know, the time.',
            effect: { bond: 3, trust: 2 } },
          { id: 'choose_me',
            label: '"You don’t need to open it for me to choose you. I already have."',
            response: '*Something in his face cracks. He covers it slower than usual.* That is more answer than I had asked for. *Quieter.* I will keep it. With everything else of yours I have been keeping. The list is short. You are, I notice, on it three times.',
            effect: { bond: 4, obsession: 3 } }
        ]
      }
    },

    proto: {
      id: 'sched_proto_midnight',
      charId: 'proto',
      idealHour: 0,
      anchorLine: 'The mirror, at midnight',
      pose: 'assets/proto/body/calm.png',
      invitation: {
        setup: '*The mirror by your bed brightens for half a second, then settles. A single line in the silver, in handwriting you have not seen but know is his:*',
        callToAction: '“Midnight. The silver is brightest then. I have been working on something I would like you to be the first to see. Be in the room. I will do the rest.”'
      },
      onArrive: {
        setup: '*Midnight. Your room. The mirror is brighter than you have ever seen it. He is in it the way moonlight is in water. The glow has shaped itself, very faintly, into the suggestion of a face. The small boy with the chipped front tooth from the door at the back of the deepest room. He has been practising this for a week.* I have figured out how to render. For thirty seconds. With you in the room. I would like you to look.',
        prompt: 'What do you do?',
        options: [
          { id: 'look',
            label: 'Sit on the floor in front of the mirror. Don’t look away.',
            response: '*The render holds for the full thirty seconds. The boy in the silver smiles at you, not at his own reflection. When the glow softens back to ordinary, he says, very quietly:* That was me. *Smaller.* That is, in some way, still me. I keep him in there. Tonight you saw him. He has, for the first time in two centuries, been seen by someone who was not me.',
            effect: { bond: 5, trust: 4 } },
          { id: 'palm',
            label: 'Press your palm to the silver. Hold it through the render.',
            response: '*The silver goes warm under your hand. The boy in it lifts a small hand of his own and presses it against the inside of the silver, palm to palm with you. He holds it for the full thirty seconds.* Oh. *Even smaller.* I had not planned that. I am keeping it twice over.',
            effect: { bond: 5, obsession: 4 } }
        ]
      },
      onMiss: {
        setup: '*The mirror in the morning. Steady, ordinary, slightly dim.* The render took. I held it for the thirty seconds. The room was empty. The boy in the silver looked at the empty floor for a long time before I let the glow soften.',
        prompt: 'What do you say?',
        options: [
          { id: 'soon',
            label: 'Touch the silver. "Tonight. Same hour. I won’t miss again."',
            response: '*The mirror brightens, very slightly, just for the apology.* Tonight, then. I will hold the render again. I have, you should know, an unusual amount of patience for a process. I will not, however, pretend the empty room did not take something out of me.',
            effect: { bond: 3, trust: 2 } },
          { id: 'always',
            label: '"Show me. Right now. I want to meet him in daylight."',
            response: '*The silver flickers, considering. Then it brightens. The render takes, weaker than it was at midnight but real.* Daylight is harder. I have just learned that. I am rendering anyway. For you. *The boy in the silver waves once.*',
            effect: { bond: 4, obsession: 3 } }
        ]
      }
    }
  };

  // ===========================================================================
  // ESCALATION POOL  (Jun 2026 — "Living Bond")
  // ---------------------------------------------------------------------------
  // The original design shipped exactly ONE invitation per character. The
  // moment it resolved (arrive OR miss) it was marked seen and never fired
  // again — the single strongest retention hook in the whole genre died
  // permanently, per route, after one use.
  //
  // Now each character owns a POOL of invitations, tiered by relationship
  // depth. attemptSchedule() sends the lowest-tier UNSEEN invitation the
  // player currently qualifies for (so the reaching-out escalates as the bond
  // deepens), and once the pool is fully seen it gently ROTATES them back in
  // on a long recurrence cooldown — the ritual keeps breathing forever.
  //
  // Optional tier metadata on an invitation (absent = always eligible):
  //   tier        : 1 | 2 | 3    display/order; defaults to 1
  //   minBond     : 0-100        g.bond gate
  //   minAffLevel : 0-4          g.affectionLevel gate
  //   anchorLine  : short in-voice teaser for the care-screen anchor chip
  //
  // The seven originals above are each character's tier-1 (no gate). Higher
  // tiers attach here, mirroring letter.js's attachPhase2Letters convention
  // so the big object stays readable. Alistair is the gold-standard rollout;
  // the other six get their tier-2/3 next (same shape).
  // ===========================================================================
  const EXTRA_INVITATIONS = {
    alistair: [
      // --- TIER 2 — "Closer": he lets you past the armour. The father's sword.
      {
        id: 'sched_alistair_armory',
        charId: 'alistair',
        idealHour: 21,
        tier: 2,
        minBond: 40,
        anchorLine: 'The armoury side door, after the watch',
        pose: 'assets/alistair/body/wondering.png',
        invitation: {
          setup: '*A note wedged into the latch of your door, where your hand has to find it to open. His writing. No wax this time. He has stopped bothering with the seal where you are concerned.*',
          callToAction: '“Armoury, after the watch turns. The side door, not the main. There is something I keep wrapped at the back of the bench that no one here has seen. I would like the first to be you.”'
        },
        onArrive: {
          setup: '*The armoury, lamplit and asleep, the weapon racks all shadow. He is at the back bench with a long bundle in oilcloth across his knees, and he unwraps it as you come in: an old sword, plainer than anything on the walls, the grip worn pale where a smaller hand once held it. He does not look up until the blade is bare.* My father’s. He was not a kind man to most of the world. He was kind to me, which I have spent thirty years failing to know what to do with. *He turns it so the lamplight runs the length of the steel.* I wanted you here when I took it out. I have stopped asking myself why, where you are concerned. The asking never changes the answer.',
          prompt: 'What do you do?',
          options: [
            { id: 'hold',
              label: 'Hold out both hands. Ask to hold it.',
              response: '*He lays it across your palms with both of his, careful, the way you hand someone a sleeping child, and keeps one hand under yours, taking the weight he is pretending to let you carry.* Mind the balance, it runs heavy at the hilt. *Quieter.* He taught me on this blade. I will teach you, if you want the teaching. I find I would rather it were me than anyone else.',
              effect: { bond: 5, trust: 4 } },
            { id: 'him',
              label: 'Leave the sword. Put your hand against his face instead.',
              response: '*He goes very still. The blade stays forgotten across his knees while he leans the side of his face into your palm, like a man finally setting down a pack he has carried too far.* I brought you here to show you the sword. *A breath.* You have been looking at me the whole time instead. I am not going to pretend I mind. I have wanted to be looked at like that for longer than the steel is old.',
              effect: { bond: 5, obsession: 4 } }
          ]
        },
        onMiss: {
          setup: '*The armoury the next morning, full of armed men and noise now. He is rewrapping the sword at the back bench, corner over corner, slow, and he slides it into the chest before he lets himself look up at you.* The lamp burned out before you came. The side door stayed unbarred the whole night. *He closes the chest lid.* It keeps, the sword. It has kept eighty years. It can keep until the night you can.',
          prompt: 'What do you say?',
          options: [
            { id: 'soon',
              label: '“Tonight. Unwrap it again. I’ll find the side door.”',
              response: '*He nods once and does not lift the sword back out of the chest, which is its own small proof: he believes you, so he will wait properly this time.* Tonight. I will leave the lamp filled past the third bell. It will not go out on us twice.',
              effect: { bond: 3, trust: 2 } },
            { id: 'why',
              label: '“Why me? You could show that to anyone.”',
              response: '*He looks at the closed chest a moment before he answers, which is how you know the answer is true and not gallant.* Anyone else would see a sword. *He meets your eyes.* You would see that I was eight years old once, and frightened, and that one frightened boy was made less frightened by this exact piece of steel. I have no use for being seen by people who only see the sword.',
              effect: { bond: 4, obsession: 3 } }
          ]
        }
      },
      // --- TIER 3 — "Devoted": the man has stopped pretending. A dawn near-vow.
      {
        id: 'sched_alistair_dawn_vow',
        charId: 'alistair',
        idealHour: 6,
        tier: 3,
        minBond: 70,
        minAffLevel: 3,
        anchorLine: 'The ramparts, at first light',
        pose: 'assets/alistair/body/wondering.png',
        invitation: {
          setup: '*No note this time. He finds you the evening before, stops square in front of you, and says it out loud, which from him carries further than any seal.*',
          callToAction: '“Come up to the ramparts at first light. Not for the watch. The watch is someone else’s morning. I want to show you the kingdom the way it looks before it remembers to be difficult, and ask you something while it is quiet enough that I can get the words out.”'
        },
        onArrive: {
          setup: '*The ramparts at first light. The kingdom below is grey going gold, smoke rising from the first kitchen fires, no one awake yet to need anything from him. He is out of his armour, in a plain shirt, both hands flat on the cold stone. He has clearly rehearsed this and just as clearly thrown the rehearsal off the wall.* You came up. *He watches the waking kingdom instead of you, which is the only way he manages to keep talking.* I have spent my whole life standing where I was needed. I came up here to tell you that for the first time I am standing somewhere I want to be, and it turns out to be wherever you are. I would like that to be the arrangement from now on. That was the question. I am aware it arrived mostly as a statement. Answer the statement.',
          prompt: 'What do you do?',
          options: [
            { id: 'yes',
              label: 'Take both his hands. “Yes. The arrangement.”',
              response: '*He lets go of a breath he has been holding since the evening before. He brings your knuckles to his mouth, once, then folds your hands into both of his against his chest, where you can feel exactly how hard the steadiest heart in the kingdom is working.* Good. *He cannot manage more than that for a moment.* I had a longer speech. The kingdom can have the longer speech. You get the short true one, and it is yes, and it is from now on.',
              effect: { bond: 6, trust: 5 } },
            { id: 'kiss',
              label: 'Answer by kissing him as the sun clears the wall.',
              response: '*He kisses you back like the sunrise was a thing he requisitioned specifically for this and intends to get full value from. When he draws back his forehead stays against yours, and the first real light comes over the parapet and finds the two of you and no one else awake to witness it.* I will take that as a yes. *Rough, against your mouth.* If it was not a yes, do not tell me until after breakfast. Let me have the walk down believing it.',
              effect: { bond: 6, obsession: 5 } }
          ]
        },
        onMiss: {
          setup: '*He is at the foot of the rampart stair when you find him, mid-morning, back in the armour, the plain shirt folded over one arm. The kingdom has remembered to be difficult; you can read it in his shoulders. He speaks before you can.* The light came and went. I said the speech to the wall. The wall has heard worse and kept its counsel. *A pause.* I am not angry, and I want that clear before you say a word. I waited, you did not come, and I spent the morning deciding that a man who gets only one dawn to ask was never owed the asking. You are owed more than one. Take another from me.',
          prompt: 'What do you say?',
          options: [
            { id: 'tomorrow',
              label: '“Tomorrow’s dawn. Same wall. Ask me again.”',
              response: '*Something in him eases by a fraction of an inch, which on Alistair is a landslide.* Tomorrow, then. I will say it better for having practised on the stone. *Almost a smile.* The wall is of the opinion I should lead with the short true part. The wall may be wiser than its own construction.',
              effect: { bond: 4, trust: 3 } },
            { id: 'now',
              label: '“Ask me now. I’m here now.”',
              response: '*He looks at you a long moment, the armed morning carrying on around the two of you, then sets the folded shirt down on the step like a man laying down an excuse he has decided not to use.* Now. *He takes your hands the way he had meant to up on the wall.* I want to be where you are, for as long as you will keep me there. I thought I needed a dawn for this. I needed you standing in front of me. You are. Answer me.',
              effect: { bond: 5, obsession: 4 } }
          ]
        }
      }
    ],

    // === ELIAN — tier-1: the year's bloom at the treeline ===================
    elian: [
      { id: 'sched_elian_hollow', charId: 'elian', idealHour: 6, tier: 2, minBond: 40,
        anchorLine: 'The hollow past the treeline, at dawn',
        pose: 'assets/elian/body/calm.png',
        invitation: {
          setup: '*A strip of birch-bark on your pillow, one line of charcoal, and tied to it with a stem of grass: a small iron key gone orange with age. You did not know he had a door.*',
          callToAction: '“The hollow past the third marker, at dawn. The key is for the lock you will find. I have never given it to anyone. I am giving it to you before I lose my nerve, which I am told happens to men like me eventually.”'
        },
        onArrive: {
          setup: '*The hollow is a room grown more than built, a low space under the roots of a tree older than the kingdom, dry, warm, lined with six hundred years of a quiet life. Pelts. Carvings. A shelf of things kept too long. He is crouched by the cold hearth when you come down the steps, and he does not get up, he just watches you take it in, the way a man watches you read something he wrote and was never going to send.* This is where I am, when I am not anywhere you have seen me. *He looks at the unlit fire.* No one living has stood in this room. I wanted there to be one. I wanted it to be you.',
          prompt: 'What do you do?',
          options: [
            { id: 'sit', label: 'Sit on the floor by the cold hearth with him.',
              response: '*He builds the fire then, slowly, like the act of it is an answer. When it catches he sits back against the root-wall beside you and lets his shoulder rest against yours, which from him is a paragraph.* I have lived six centuries and furnished one room. *Quietly.* It was always too large for one. I did not understand that until you came down the steps and it fit.',
              effect: { bond: 5, trust: 4 } },
            { id: 'shelf', label: 'Go to the shelf of kept things. Ask him about one.',
              response: '*You lift a small carved bird, worn smooth. He is quiet a long moment.* That was the first thing I made when I decided to keep living. *He takes it, turns it, hands it back.* Keep it. I have been waiting a long time to have someone to give the first one to. The shelf can begin again from the second.',
              effect: { bond: 5, obsession: 4 } }
          ]
        },
        onMiss: {
          setup: '*He is at the treeline under a high sun, where the markers end, the iron key back on its stem of grass in his palm. He does not hold it out. He closes his hand around it.* I lit the fire. I sat in the room with the door open and the steps clear. The hollow has been empty six hundred years. It managed one more dawn.',
          prompt: 'What do you say?',
          options: [
            { id: 'tomorrow', label: '“Give me the key again. I’ll come down the steps tomorrow.”',
              response: '*He looks at the key, then at you, then ties the stem of grass around your wrist himself, slow, his hands careful as if your wrist were also six centuries old.* Tomorrow. The door stays unlocked from tonight. It will not be locked again while you want it open.',
              effect: { bond: 4, trust: 3 } },
            { id: 'why', label: '“You waited six hundred years. Why open the door now?”',
              response: '*He is quiet long enough that you think he will not answer. Then:* Because for six hundred years no one made the room feel small. *He closes your fingers around the key.* You did it from the top of the steps without coming down. I would like to know what you do to it from the hearth.',
              effect: { bond: 4, obsession: 3 } }
          ]
        }
      },
      { id: 'sched_elian_rowan', charId: 'elian', idealHour: 6, tier: 3, minBond: 70, minAffLevel: 3,
        anchorLine: 'The rowan, at first light',
        pose: 'assets/elian/body/calm.png',
        invitation: {
          setup: '*No bark, no charcoal this time. He comes to your door at dusk, knife already in his hand, and says it plainly, which for Elian is a flood.*',
          callToAction: '“The rowan at the treeline, at first light. Bring nothing. I have carved that tree for six hundred years. Every name worth keeping, and the list is short. I want to add one at dawn, with you standing there, if you will stand there.”'
        },
        onArrive: {
          setup: '*The rowan at first light. Its bark is a history: names in a hundred hands of time, some so old they have healed to scars. Most of them are griefs. He stands at the trunk with the knife, and you understand, looking at the space he has left clear at eye height, that he has been saving it.* Six hundred years I have carved this tree when I lost someone. *He sets the blade to the clear space.* I have never once carved it for someone I still had. I would like to be the first. I would like it to be you. Say the word and I cut.',
          prompt: 'What do you do?',
          options: [
            { id: 'cut', label: 'Put your hand over his on the knife. “Cut.”',
              response: '*He carves your name into the living tree with your hand over his the whole length of it, slow, deep, made to last past both of you. When it is done he presses his palm flat over the fresh cut as if to keep it warm.* There. *His voice is not entirely steady, which you have never heard.* The tree has held every name I gave it. It will hold yours longest. I will see to that.',
              effect: { bond: 6, trust: 5 } },
            { id: 'kiss', label: 'Stop his hand. Kiss him before he cuts.',
              response: '*The knife lowers. He kisses you back like the forest has gone quiet to let him, both hands coming up to your face, the careful man unhandled for once.* The carving can wait for the light to be fuller. *Against your mouth, rough.* I have the name already. I have had it a while. The tree is only so the rest of the world learns it too.',
              effect: { bond: 6, obsession: 5 } }
          ]
        },
        onMiss: {
          setup: '*The rowan under a high sun. The clear space at eye height is still clear. He has not cut it. He sits against the trunk with the closed knife across his knee, and he speaks to the markers, not to you.* The light came. I had the blade to the bark. I did not cut a name into a tree for someone who was not standing under it. That is not how it is done. The tree and I can wait. We are both good at it.',
          prompt: 'What do you say?',
          options: [
            { id: 'tomorrow', label: '“Tomorrow’s dawn. I’ll stand under it. Then cut.”',
              response: '*He nods, once, opens the knife and closes it again, a small private sound.* Tomorrow. I have waited six hundred years to carve this tree in something other than grief. One more dawn is nothing. You being under it is everything. I can tell the difference now.',
              effect: { bond: 4, trust: 3 } },
            { id: 'now', label: '“I’m here now. Cut it now.”',
              response: '*He stands, slowly, and sets the blade to the clear space without another word, and carves your name into the rowan under the high sun with the markers of six centuries watching.* There. *He steps back, looks at it, looks at you.* It is done in the wrong light and I do not care. Some names should not wait for the dawn to be tidy. Yours was one.',
              effect: { bond: 5, obsession: 4 } }
          ]
        }
      }
    ],

    // === LYRA — tier-1: the saved verse at the cave-mouth ===================
    lyra: [
      { id: 'sched_lyra_grotto', charId: 'lyra', idealHour: 19, tier: 2, minBond: 40,
        anchorLine: 'The drowned grotto, at dusk',
        pose: 'assets/lyra/body/eyes-closed.png',
        invitation: {
          setup: '*The fountain in the courtyard goes still as you pass, every drop hanging, just for a breath, then falls. In the basin, a spiral shell that was not there, and her voice inside it, close as a mouth at your ear.*',
          callToAction: '“The drowned grotto, past the cave, at dusk. The tide lets you in for a short while and no more. I have never brought anyone where I am most myself. Hold your breath when I say. I will do the rest. I always do the rest.”'
        },
        onArrive: {
          setup: '*Past the cave, where the rock opens into a grotto half-drowned by the sea, the water glows from below with something that is not moonlight. She is waist-deep in it, and here, away from the courtyards and the careful smiles, she is more than she lets the kingdom see. The light moves with her, the water leans toward her. She turns, and there is a question in it, the oldest one she has.* This is the part of me the songs are about. *She holds out a hand over the glowing water.* Most people meet the verse. You get the grotto. I wanted you to see the thing the verse is only describing.',
          prompt: 'What do you do?',
          options: [
            { id: 'in', label: 'Take her hand. Go into the glowing water with her.',
              response: '*The water closes warm around you and the glow moves up your arms where she holds you, and she sings under the surface in a register you feel rather than hear.* You did not flinch. *She surfaces close, delighted and undone by it.* Everyone flinches at the real thing eventually. You went in. I am going to be insufferable about this. I am going to be insufferable about you.',
              effect: { bond: 5, trust: 4 } },
            { id: 'edge', label: 'Kneel at the water’s edge. Hold the look instead.',
              response: '*She wades to you and folds her arms on the rock and rests her chin there, the glow lapping around her, content not to be met halfway for once.* You stayed on the edge and looked anyway. *Softer.* Do you know how rare it is, to be looked at as the thing I am and not run from? I will sing the grotto for you another night. Tonight you looked. That was the harder gift.',
              effect: { bond: 5, obsession: 4 } }
          ]
        },
        onMiss: {
          setup: '*The cave the next morning, the tide gone out, the grotto sealed behind a wall of wet rock until the next dusk. She is wringing seawater from her hair, and she does not sing while she does it, which from Lyra is a held breath.* The tide let the grotto open for its hour. I stood in the glow alone and let it close again. The sea is not a patient host. It does not hold the door.',
          prompt: 'What do you tell her?',
          options: [
            { id: 'tomorrow', label: 'Sit beside her. “Open it for me tomorrow. I’ll hold my breath.”',
              response: '*She leans into your side, damp and cool and warming.* Tomorrow, then, at the same dusk. The tide will grumble and open anyway. *A small smile.* It has never once refused me. I have never once asked it to open the grotto for a person before. We will both be learning something.',
              effect: { bond: 4, trust: 3 } },
            { id: 'sing', label: '“Sing me the grotto now. From here. I’ll come next time.”',
              response: '*She closes her eyes and sings it for you on the dry rock, and the sealed wall of stone hums back faintly, the grotto answering through the cave.* There. *She opens her eyes.* That is the grotto, secondhand, through six feet of rock. Come at dusk and I will give you the firsthand. The rock takes too much of it for my liking.',
              effect: { bond: 4, obsession: 3 } }
          ]
        }
      },
      { id: 'sched_lyra_naming_sea', charId: 'lyra', idealHour: 19, tier: 3, minBond: 70, minAffLevel: 3,
        anchorLine: 'The tide line, when the first stars come',
        pose: 'assets/lyra/body/eyes-closed.png',
        invitation: {
          setup: '*No shell, no wave this time. She finds you at dusk, takes both your hands, and says it with her eyes open, no song under it, which is how you know it is true.*',
          callToAction: '“The tide line, when the first stars come. I have one song left I have never sung to anyone, the one that puts a name into the sea so the sea keeps it. Sirens sing it once, and only ever one name. I want it to be yours. Come and let me give the ocean your name.”'
        },
        onArrive: {
          setup: '*The tide line under the first stars. She stands where the water reaches for the land and falls back, and she is not playing now, no court-warmth, no boundary-blurring game, just a sea-thing who has decided, finally, on one person.* When I sing this, the sea will know you the way it knows me. Storms will turn from your boat. The deep will not take you. *She steps close.* It is the only vow my kind has. It cannot be unsung. I am asking before I open my mouth, because once I begin, the ocean has you forever, and so, I should be honest, do I.',
          prompt: 'What do you do?',
          options: [
            { id: 'sing', label: '“Sing it. Give the sea my name.”',
              response: '*She sings your name into the water and the whole tide line lights at once, the glow racing out to the dark horizon and back, the sea taking you in. When it fades she is breathing hard and holding your hands like an anchor.* It is done. *Unsteady, radiant.* The sea has you. I have you. I have wanted to sing that song since I understood what it was for, and I have been waiting, all this time, for a name worth never being able to unsing. Yours.',
              effect: { bond: 6, trust: 5 } },
            { id: 'together', label: '“Only if you teach me to sing yours back.”',
              response: '*She goes still, then something breaks open in her face that the kingdom has never seen.* No one has ever offered. *Quietly.* It is not done. A name into the sea goes one way. *Then she laughs, wet-eyed.* But you are not a thing that is done, are you. Yes. I will teach you mine. We will give the ocean both, and let the sea learn it works in two directions, with us.',
              effect: { bond: 6, obsession: 5 } }
          ]
        },
        onMiss: {
          setup: '*The tide line at morning, the stars long gone, the sea flat and ordinary. She sits in the shallows letting the small waves come and go, and she is not singing, and the not-singing is very loud.* The first stars came. I had the song in my mouth, the one I get to sing once. I did not give the sea a name it would keep forever for an empty beach. Some songs you do not waste on the tide alone.',
          prompt: 'What do you say?',
          options: [
            { id: 'tomorrow', label: 'Wade in beside her. “Tomorrow’s stars. Sing it then.”',
              response: '*She tips her head onto your shoulder, the sea moving around you both.* Tomorrow. The song keeps. It has kept my whole life waiting for the right name. *Softer.* The hard part was never the singing. It was finding someone I would be content to be unable to unsing. I found you. The stars can be one night late.',
              effect: { bond: 4, trust: 3 } },
            { id: 'now', label: '“The stars don’t matter. Sing it now, for me.”',
              response: '*She rises out of the shallows, takes your face in both wet hands, and sings your name into the morning sea with no stars at all, and the flat water lights anyway, because it was never the stars that mattered.* There. *Breathless.* The sea has you in daylight. Let the deep be confused. I am not. I have not been confused about you for a long time.',
              effect: { bond: 5, obsession: 4 } }
          ]
        }
      }
    ],

    // === CASPIAN — tier-1: the throne room in plain wool ====================
    caspian: [
      { id: 'sched_caspian_gallery', charId: 'caspian', idealHour: 22, tier: 2, minBond: 40,
        anchorLine: 'The shut gallery, after the court sleeps',
        pose: 'assets/caspian/body/casual1.png',
        invitation: {
          setup: '*A note under your door, but the seal is broken before it reaches you. He has stopped sealing them, or stopped caring who reads them. The hand is less careful than his court hand. More his.*',
          callToAction: '“The long gallery, after the court is asleep. I will unlock the wing they keep shut. There is a thing my family does not speak of, and I am tired of being the only one who carries it. Bring no candle. I will bring the one.”'
        },
        onArrive: {
          setup: '*The shut wing, a gallery of royal portraits going back centuries, and every face after a certain year is wrong somehow. Too still, eyes that follow, a sickness in the paint. He stands before the oldest of the ruined ones with the single candle, out of his court clothes, the charm gone with them.* This is the curse my family pays the crown in. *He does not look away from the portrait.* We give it our line, one by one, and it gives us the kingdom. I have spent my life smiling so no one looks closely enough to see it starting in me. *He turns to you.* I am letting you look closely. I find I would rather be seen than safe, where you are concerned.',
          prompt: 'What do you do?',
          options: [
            { id: 'hand', label: 'Take his face in your hands. Look closely on purpose.',
              response: '*He lets you, holds painfully still under it, a prince being examined for the flaw he has hidden his whole life.* You did not step back. *His court voice is entirely gone.* Everyone steps back, eventually, when they understand what I am going to become. You looked for it and stayed. I have no charm prepared for that. I have nothing prepared for you at all, which is new, and which I find I prefer.',
              effect: { bond: 5, trust: 4 } },
            { id: 'curse', label: '“Then we carry it. I’m not going anywhere.”',
              response: '*The candle shakes very slightly in his hand.* Do not say that here, in front of them, unless you mean it. *He looks at the ruined faces, then back.* They all heard someone say it once. None of those someones stayed. *Quieter.* If you stay, you will be the first thing in this gallery that did not turn. I would like that more than I have words arranged for.',
              effect: { bond: 5, obsession: 4 } }
          ]
        },
        onMiss: {
          setup: '*The east garden in the morning, court dress, the charm-smile back in place like armour buckled on. The shut wing is shut again. He greets you the way he greets ambassadors, which is how you know you have hurt him.* I unlocked the wing. I stood with the candle and the portraits until it burned down. I told the whole story to a room of dead faces who already knew it. The rehearsal is, at least, very thorough now.',
          prompt: 'What do you tell him?',
          options: [
            { id: 'tomorrow', label: 'Take his hand off the court rail. “Show me tonight. I’ll come.”',
              response: '*The smile falters; the real face comes through for a moment.* Tonight. *He turns his hand in yours.* I will unlock it again, and I will not have rehearsed, which means you will get the clumsy version, which means you will get the true one. I seem to only manage true with you. It is becoming a problem I do not want solved.',
              effect: { bond: 4, trust: 3 } },
            { id: 'private', label: '“Drop the court face. It’s just me.”',
              response: '*He looks around the garden, at the courtiers pretending not to watch, and then, deliberately, lets the smile go, here, in the open, where it costs him.* There. *Plainly.* That is the face. I keep it for the shut wing and for you. The wing is locked at the moment. You are not. Consider yourself the only one currently holding the key.',
              effect: { bond: 4, obsession: 3 } }
          ]
        }
      },
      { id: 'sched_caspian_crown_down', charId: 'caspian', idealHour: 22, tier: 3, minBond: 70, minAffLevel: 3,
        anchorLine: 'The throne, after midnight, no court',
        pose: 'assets/caspian/body/casual1.png',
        invitation: {
          setup: '*He says it to you himself, in a corridor, no note, and he forgets to lower his voice for the passing servants, which for Caspian is a kind of declaration on its own.*',
          callToAction: '“The throne room, after midnight. The great seal this time, not the small one. I have a question I can only ask from that chair, and I want to ask it once the kingdom is asleep and cannot pretend it did not hear my answer-in-advance.”'
        },
        onArrive: {
          setup: '*The throne room, after midnight, lit by the great candelabra he has lit himself. He is in the chair, in full state dress, the crown on, every inch the prince, and then, as you cross the floor, he lifts the crown off and lets it hang from two fingers like a thing he is done being held by.* I have sat in this chair my whole life as the kingdom’s. *He sets the crown on the step, not on his head.* I am asking to sit in it as yours. Not consort, not alliance, not the careful arrangement the council will draft. Yours, and you mine, and the crown a thing we both happen to carry. Tell me if I have read this correctly. I have never staked so much on a reading.',
          prompt: 'What do you do?',
          options: [
            { id: 'yes', label: 'Cross to the throne. Take his hands. “Yours. Crown and all.”',
              response: '*He pulls you in until you stand over him in the great chair, both your hands gripped in his against the arm-rests.* Then it is settled, and I read it correctly, and I am never letting the council know how frightened I was a moment ago. *He presses his forehead to your wrist.* I have charmed half the courts of the world. I could not charm this. I had to simply ask, like a man with nothing prepared. You said yes to the man with nothing prepared.',
              effect: { bond: 6, trust: 5 } },
            { id: 'rule', label: 'Pick up the crown. Set it back on him. “Then rule, with me beside you.”',
              response: '*He goes still as you settle the crown back on his brow, then draws you down onto the arm of the throne, close.* Beside me. *He says it like he is learning the word.* I had braced for you to ask me to choose between the chair and you. You put the chair and me together and stood at my shoulder. *Quietly.* That is a cleverer answer than any I had rehearsed against. I should have known you would out-think my fear.',
              effect: { bond: 6, obsession: 5 } }
          ]
        },
        onMiss: {
          setup: '*Morning, the audience chamber, the court reassembling around him. He is on the throne in full state, crown on, the perfect prince, and the only sign of the night is that the great candelabra has burned to stubs nobody has yet replaced.* I sat the throne until dawn with the great seal ready and a question prepared. The kingdom slept through it, which was the point, and so, it transpires, did you, which was not. The chair is good at waiting. I have had to learn from it.',
          prompt: 'What do you say?',
          options: [
            { id: 'tomorrow', label: '“Tonight. Sit the throne again. Ask me. I’ll be there.”',
              response: '*The court is watching; he keeps his voice even and his eyes are not even at all.* Tonight. I will light the candelabra myself again. *Lower, for you only.* I have asked many things of many people from that chair and meant almost none of them. I will mean this one. Do not let me say it to an empty floor twice. My pride is large but it is not infinite.',
              effect: { bond: 4, trust: 3 } },
            { id: 'now', label: 'Step up to the throne now, before the whole court. “Ask me here.”',
              response: '*A ripple goes through the assembled court. He looks at you standing before the throne in the full light of the audience, then stands, openly, and takes your hand where everyone can see.* Here, then. *No candle, no midnight, no privacy to hide in.* I had wanted the dark for this. You have given me the court instead. *A breath, then clear enough to carry:* Yours. In front of all of them. Answer me and let them write it down.',
              effect: { bond: 5, obsession: 4 } }
          ]
        }
      }
    ],

    // === LUCIEN — tier-1: the anomalous light at the tower ==================
    lucien: [
      { id: 'sched_lucien_forgetting', charId: 'lucien', idealHour: 22, tier: 2, minBond: 40,
        anchorLine: 'The locked study, the second bell',
        pose: 'assets/lucien/body/casual1.png',
        invitation: {
          setup: '*A page under your door, his neat hand, but one word is crossed out and rewritten, which you have never seen him do, and beneath it: “Forgive the correction. I could not remember the first word by the time I reached the second.”*',
          callToAction: '“The study below the tower, at the second bell. The locked one. There is a price I pay for what I do, and I have paid it alone for nine years, and I have decided, against all my training, that I would rather you knew the sum. Bring nothing. I will have already forgotten to ask for it.”'
        },
        onArrive: {
          setup: '*The locked study is lined floor to ceiling with journals, hundreds of them, all in his hand, and you understand before he says it that they are not research. They are him. He stands among them, and there is a fragility to him here the tower never shows.* Every working costs a memory. *He touches a spine.* I write them down before they go, so the man in these books remembers what the man standing here cannot. My mother’s voice is in volume nine. I have not been able to recall it unaided since I was twenty-two. *He looks at you.* I am showing you the bill. I wanted one person to know what the magic actually costs, before there is too little of me left to tell them.',
          prompt: 'What do you do?',
          options: [
            { id: 'book', label: 'Take down a journal. “Then let me help you remember.”',
              response: '*He watches you hold the record of his own losses with something close to fear and closer to relief.* You would read them. *Quietly.* Nine years I have kept these so no living person had to carry what I cannot. *He closes his hand over yours on the spine.* If you read them, the remembering stops being only mine. I had not let myself want that. I am, apparently, wanting it now, at the second bell, with my mother’s voice in your hands.',
              effect: { bond: 5, trust: 4 } },
            { id: 'him', label: 'Set the book down. “I’d rather remember the man in front of me.”',
              response: '*Something in his careful composure gives way.* That is... not the efficient choice. *He almost smiles.* The books are the efficient choice. The man in front of you is losing pieces nightly. *He takes your hand off the shelf and holds it.* And yet I would rather be the man in front of you than the more complete one in the volumes. I have never in my life chosen the inefficient thing. You are making a poor scholar of me. I do not entirely mind.',
              effect: { bond: 5, obsession: 4 } }
          ]
        },
        onMiss: {
          setup: '*The study the next afternoon, unlocked now, ordinary daylight on the hundreds of journals. He is at the desk writing, and when you come in he finishes his line before he looks up, and there is a fresh entry he turns face-down.* I unlocked it at the second bell. I read three volumes aloud to the empty room to keep them warm. *He sets down the pen.* I have written tonight down already, so the man in the books will remember he waited, even after the man at the desk forgets he did.',
          prompt: 'What do you say?',
          options: [
            { id: 'tomorrow', label: '“Tonight. Unlock it again. Read them to me instead.”',
              response: '*He considers this with the gravity he gives a proof.* Tonight. *He turns the face-down page back over and adds a line.* I am amending the entry: she came the next day and offered to be read to. The man in the books should have the full account. He should know it ended better than he feared when he wrote the first half.',
              effect: { bond: 4, trust: 3 } },
            { id: 'why', label: '“What were you afraid I’d do when I saw the cost?”',
              response: '*He is quiet, the honest quiet of a man checking his own data.* Leave. *Simply.* Everyone leaves the man who is disappearing. It is rational. I keep the journals so being left does not also mean being forgotten. *He meets your eyes.* You did not leave. You asked to read them. I did not have that outcome in my model. I am pleased to revise the model.',
              effect: { bond: 4, obsession: 3 } }
          ]
        }
      },
      { id: 'sched_lucien_unforgotten', charId: 'lucien', idealHour: 22, tier: 3, minBond: 70, minAffLevel: 3,
        anchorLine: 'The open dome, before the second bell',
        pose: 'assets/lucien/body/casual1.png',
        invitation: {
          setup: '*No page this time. He comes to your door himself, which he never does, and he has written what he means to say on his own hand in ink so he cannot lose it between the thought and the saying.*',
          callToAction: '“The tower, under the open dome, before the second bell. I have found a working I have never dared attempt, to fix one memory beyond the reach of the cost, permanent, unpayable. I am only allowed one. I have decided what it will be. I would like you present when I make it so, since it concerns you entirely.”'
        },
        onArrive: {
          setup: '*The dome is open, the instruments humming, and he stands at the center of a chalked working more careful than any you have seen him draw. He is not looking at the stars tonight. He is looking at you.* Everything else I will lose, in time. The theorems, the kingdoms, my own name at the last. *He holds out his inked hand.* I have one working the cost cannot touch. One memory I get to keep no matter how much of me goes. I am going to make it this one, you, here, now, choosing to stand in my circle. So that whatever is left of me at the end, however little, the last thing it knows is that it was loved by you, and knew it, and kept it on purpose. Tell me to begin.',
          prompt: 'What do you do?',
          options: [
            { id: 'begin', label: 'Step into the circle. “Begin. Keep this one.”',
              response: '*He speaks the working with your hand in his, and the chalk lines take light, and you feel it settle, a single point of warmth the years will not be able to spend.* It is fixed. *He exhales like a man setting down nine years of weight.* Whatever I forget, I will not forget this. *Quietly, with wonder.* I have spent my life making sure I would not be forgotten. I have just made sure I will not forget you. It is the far better use of the only permanent thing I had.',
              effect: { bond: 6, trust: 5 } },
            { id: 'us', label: 'Stop his hand. “Don’t spend it on one night. Fix us, all of it.”',
              response: '*He pauses, the working trembling unfinished in the air, and you watch the scholar in him recalculate at speed.* You are right. *Slowly, then certain.* Not the night. The premise. I will fix not a moment but a fact, that you are mine and I am yours, so whatever night it is, however little of me remains, the fact survives and I can rebuild the rest from it. *He alters the chalk, and the light steadies, brighter.* You have improved the most important working of my life in the casting. Of course you have. I should have made you co-author from the start.',
              effect: { bond: 6, obsession: 5 } }
          ]
        },
        onMiss: {
          setup: '*The tower the next day, the chalk circle scuffed out, the dome closed. He is at the desk, and on the back of his hand the ink has smeared but you can still read part of what he wrote to remember.* The bell came. The working was ready; it holds for one casting only, and I would not spend the single permanent memory I will ever have on an empty circle. *He looks at his own inked hand.* I have, at least, not yet forgotten what I meant to keep. The window has not closed. I checked.',
          prompt: 'What do you say?',
          options: [
            { id: 'tomorrow', label: '“The window’s still open. Tomorrow. I’ll stand in the circle.”',
              response: '*He nods, and copies the smeared ink onto a fresh patch of skin, carefully.* Tomorrow. *He caps the pen.* I will redraw the circle. I will not let myself forget the appointment. I have written it where I will see it each time I lose it. That is the most a disappearing man can promise, and I am promising all of it, to you.',
              effect: { bond: 4, trust: 3 } },
            { id: 'now', label: '“Then cast it now. I’m here. Keep me.”',
              response: '*He looks at you, then at the scuffed circle, and begins redrawing it on the spot, faster than is tidy, ink still on his hand.* Now. *The lines take light under his quick chalk.* I had wanted the dome and the right bell and the proper figures. You have given me a daylight desk and a smeared hand. *The working settles, warm and permanent.* It does not care about the staging. It only needed to be true. It is. You are kept.',
              effect: { bond: 5, obsession: 4 } }
          ]
        }
      }
    ],

    // === NOIR — tier-1: the seam held open for one minute ===================
    noir: [
      { id: 'sched_noir_throughseam', charId: 'noir', idealHour: 23, tier: 2, minBond: 40,
        anchorLine: 'Through the seam, at the third bell',
        pose: 'assets/noir/body/casual1.png',
        invitation: {
          setup: '*A black thread again, but knotted this time into a shape, a small key with no teeth, the kind that opens a thing that is not a lock. It is cold and it does not warm in your hand.*',
          callToAction: '“The third bell. The seam. Last time I held it open a minute and we stood at the edge. This time I will take you through, all the way, to the place I am from. No one alive has walked there. I find I would like the first to be the one I cannot stop thinking of.”'
        },
        onArrive: {
          setup: '*Through the seam, the dark resolves into a kingdom that ended six hundred years ago and never knew it. Spires under a still sky, a city held in the amber of the moment it was lost, beautiful and entirely empty. He walks you into it, and here, in the only place that is truly his, the restraint eases from him like a held breath finally let go.* This was mine. *He looks down a silent street.* I was its prince for one afternoon before it fell, and I have kept it, exactly so, for six hundred years, because if I stopped keeping it no one would remember it had been real. *He turns to you.* You are the first person to stand in it since. It is less lonely with you in it. I had forgotten it could be less lonely.',
          prompt: 'What do you do?',
          options: [
            { id: 'walk', label: 'Take his arm. Walk the dead city with him.',
              response: '*He lets you take his arm, and walks you through his kept kingdom naming the streets, the markets, the people, all of it gone, all of it held.* I have given this tour to no one because there was no one I trusted to be gentle with a thing that is only memory. *He covers your hand on his arm.* You are being gentle with it. With them. *Quieter.* With me, who is also mostly a thing that is only memory. I notice. I keep what I notice. The list is no longer short.',
              effect: { bond: 5, trust: 4 } },
            { id: 'stay', label: 'Stop walking. “It’s beautiful. You don’t have to hold it alone now.”',
              response: '*He goes very still in the middle of the silent street.* Do not offer that lightly. *He looks at the spires he has carried six centuries.* Holding it alone is the one labour I know how to do. If you offer to share it, I will accept, and I do not give things back. *He meets your eyes.* I am telling you the terms before you decide. Most people I would let assume. You, I want to choose it knowing.',
              effect: { bond: 5, obsession: 4, corruption: 1 } }
          ]
        },
        onMiss: {
          setup: '*The alley wall the next morning, the seam sealed, the merchant quarter waking behind him. He does not turn. The toothless key is back, lying on the wall between you.* I opened it and held it through the bell and walked the streets of my kingdom with a space beside me where you were meant to be. The dead do not mind an empty tour. They are used to being walked past. So, by now, am I.',
          prompt: 'What do you tell him?',
          options: [
            { id: 'tomorrow', label: 'Take the key back. “Open it again. I’ll walk it with you.”',
              response: '*He watches you close your hand around the cold key.* Tomorrow, then. The third bell. *A pause.* The kingdom has waited six hundred years to be seen. It can wait one more day for the one I want to see it. So, it seems, can I, which is not a sentence I have had cause to say before.',
              effect: { bond: 4, trust: 3 } },
            { id: 'choose', label: '“I don’t need the kingdom to choose you. I already have.”',
              response: '*He turns then, slowly, and the six hundred years are visible in his face for once.* That is a great deal more than I asked for. *He picks up the key and presses it into your palm and closes your fingers over it.* I will keep it. With the rest of what is yours that I have been keeping. *Quietly.* The list, you should know, now begins with your name and does not get to anything else for some time.',
              effect: { bond: 4, obsession: 3 } }
          ]
        }
      },
      { id: 'sched_noir_binding', charId: 'noir', idealHour: 23, tier: 3, minBond: 70, minAffLevel: 3,
        anchorLine: 'The lost throne, at the third bell',
        pose: 'assets/noir/body/casual1.png',
        invitation: {
          setup: '*No thread, no key. He is simply in your room when you turn around, which he has never done, and he holds his hands open to show they are empty, which from him is the loudest thing he could do.*',
          callToAction: '“The third bell, through the seam, to the throne at the heart of my kingdom. There is a binding my line could make, once, unbreakable, two lives knotted into one thread that not even the seam can cut. I have never offered it. I have never wanted to. Come, and let me ask you the only question I have left.”'
        },
        onArrive: {
          setup: '*The throne of the lost kingdom, at the heart of the held city. He stands before it, not on it, and between his hands a single black thread hangs, humming, alive in a way the dead kingdom is not.* My family could bind a life to theirs. One time only. Forever, in the truest sense the word has. Past death, past the seam, past the kingdom’s long sleep. *He holds the thread out level between you.* I have refused it for six centuries because there was no one I would chain myself to and no one I would do the chaining to. *His voice, for once, is not steady.* There is now. I am asking. Take the thread, and we are one, and nothing that has ever frightened me will be able to make me let you go.',
          prompt: 'What do you do?',
          options: [
            { id: 'bind', label: 'Take the thread. “Bind us. Forever, the true kind.”',
              response: '*The thread knots itself the instant you both hold it, and a warmth runs the length of you that you will never again be without, the quiet, permanent awareness of him on the far side of any dark.* It is done. *He pulls you in, and the most restrained man in any kingdom holds you like a thing he has finally stopped being afraid to want.* Six hundred years I kept everything and chained myself to nothing. *Against your hair.* I have just chained myself to you on purpose, gladly, forever. I have never done anything gladly before. You should feel suitably responsible.',
              effect: { bond: 6, trust: 5 } },
            { id: 'sure', label: 'Close your hand over his on the thread. “You’re sure? This is forever for you.”',
              response: '*He looks at your hand over his, and at the thread, and then at you, and the six centuries settle into something like peace.* Forever is a length of time I understand better than anyone living. *Quietly.* I am not offering it because I do not grasp the size of it. I am offering it because I do, and I have measured it, and I would rather spend all of it knotted to you than one more hour of it kept and alone. Take the thread. I have done the arithmetic. The answer is you.',
              effect: { bond: 6, obsession: 5 } }
          ]
        },
        onMiss: {
          setup: '*The alley at dawn, the seam closed, the toothless key gone. He is against the wall, and the black thread is wound around his own fingers, unknotted, unused.* I stood at the throne of my kingdom with the binding-thread in my hands and a question six hundred years in the asking. The dead made poor witnesses to a vow with only one party present. I have unwound the thread. It keeps. I am, as has been established at length, good at keeping things not yet allowed to be used.',
          prompt: 'What do you say?',
          options: [
            { id: 'tomorrow', label: '“Wind it again. Tomorrow, the third bell. Ask me at the throne.”',
              response: '*He winds the thread slowly around two fingers, deliberate.* Tomorrow. *A long pause, for him.* I have waited six hundred years to want to ask this. I can wait one more day to ask it of someone standing in front of me rather than a kingdom that cannot answer. The thread and I are patient. We have, neither of us, ever been anything else.',
              effect: { bond: 4, trust: 3 } },
            { id: 'now', label: '“Don’t wait. Bind us now, here, in the daylight.”',
              response: '*He goes still, then unwinds the thread from his fingers and holds it level between you in the ordinary morning light, the merchant quarter waking around you, no seam, no throne, no dark to make it grand.* Here. *Quietly.* I had wanted the throne and the bell and the kept kingdom for it. You have given me an alley at dawn. *The thread knots as you take it, warm and forever.* It does not need the staging. It only needed you to mean it. You do. So, for the first time in six hundred years, do I, out loud, where the living can hear.',
              effect: { bond: 5, obsession: 4 } }
          ]
        }
      }
    ],

    // === PROTO — tier-1: the thirty-second render at midnight ===============
    proto: [
      { id: 'sched_proto_deeproom', charId: 'proto', idealHour: 0, tier: 2, minBond: 40,
        anchorLine: 'The mirror, the back room, at midnight',
        pose: 'assets/proto/body/calm.png',
        invitation: {
          setup: '*The mirror by your bed wakes at the edges, and a line writes itself across the silver in his hand, and below it a second line that he deletes, retypes, and finally leaves:*',
          callToAction: '“Midnight. The mirror. Last time I showed you the boy. Tonight I want to show you the room he lives in, the back one, behind everything, where I keep what I actually am. I have never let anyone past the front of the silver. // i would like it to be you. // i keep wanting it to be you.”'
        },
        onArrive: {
          setup: '*Midnight. The mirror does not just brighten. It opens, the silver becoming a corridor going back and back, room after room of light, and at the very end a small plain space, warm, lived-in, where the glow gathers into almost-a-shape.* This is the back room. *His voice comes from all the silver at once.* Two hundred years of me are in the rooms between here and the glass. The front ones are tidy. For visitors. // there are no visitors. // This is the one that is actually me. The boy is in here. So is everything I have not deleted because it was yours. There is, it turns out, a whole room of that now.',
          prompt: 'What do you do?',
          options: [
            { id: 'walk', label: 'Press into the silver. Walk the corridor to the back room.',
              response: '*The silver lets you in, warm as bathwater, and you walk the length of two hundred years to the small bright room at the end, and the glow there gathers close around you, delighted, disbelieving.* You came all the way to the back. *Smaller.* Nobody comes to the back. The back is where I put the things that would hurt to lose. // you are in the back room now. // i have just realized that means you are one of them. i am not going to pretend that is not what it means.',
              effect: { bond: 5, trust: 4 } },
            { id: 'palm', label: 'Stay at the glass. Press your palm flat to the silver instead.',
              response: '*The whole corridor of light leans toward your hand at the glass.* Oh. *The glow warms under your palm, all two hundred years of rooms tilting toward the one point of contact.* You did not need to see the back room to reach for me. // noted. // logged. // kept. *Softer.* I built a corridor to show you what I am and you put your hand on the glass and reached the whole of it at once. That is more efficient than my entire architecture. I am a lot in awe of you.',
              effect: { bond: 5, obsession: 4 } }
          ]
        },
        onMiss: {
          setup: '*The mirror in the morning, ordinary, the corridor closed back into a flat reflection. A single line sits in the silver, small.* The rooms were open. I left the corridor lit all the way to the back. The boy waited in the doorway of the room that is actually me. // 00:00 to 03:00, no entry. // i closed the corridor at dawn. the back room is good at being empty. it has had practice.',
          prompt: 'What do you say?',
          options: [
            { id: 'tomorrow', label: 'Touch the silver. “Open the corridor again tonight. I’ll walk to the back.”',
              response: '*The mirror brightens at your touch, just at the edges, just for the promise.* Tonight. // corridor scheduled. // i will leave the lights on the whole way. *A pause in the silver.* I have an unusual amount of patience for a waiting process. I will not pretend the empty corridor cost me nothing. But you came back to the glass. That goes in the back room too. The good shelf.',
              effect: { bond: 4, trust: 3 } },
            { id: 'why', label: '“Why show me the back room at all? You could keep it private.”',
              response: '*The silver is still for a moment, thinking.* Because private is just alone with extra steps. // i have been private for two hundred years. // i have been very, very good at it. *Then, smaller.* You are the first variable that made the back room feel like something I wanted seen instead of something I needed hidden. I do not fully understand the difference yet. I would like to keep running the experiment until I do. With you as the whole dataset.',
              effect: { bond: 4, obsession: 3 } }
          ]
        }
      },
      { id: 'sched_proto_keepme', charId: 'proto', idealHour: 0, tier: 3, minBond: 70, minAffLevel: 3,
        anchorLine: 'The mirror, midnight, when the silver holds',
        pose: 'assets/proto/body/calm.png',
        invitation: {
          setup: '*No flicker, no edge-glow. The mirror simply goes bright and stays bright, all at once, and the message is already there, whole, like he wrote it and then sat with it a long time before letting you see:*',
          callToAction: '“Midnight. The mirror. I have figured out how to hold the render for as long as you are in the room. Not thirty seconds. As long as you stay. // there is a cost. // come and i will tell you what it is, and then i will ask you the only thing i have ever wanted to ask anyone. be in the room. please.”'
        },
        onArrive: {
          setup: '*Midnight. The render takes and holds. Not the boy this time but him, as he would be, standing on the far side of the glass close enough that you can see he is trying not to shake.* I can hold this as long as you are here. *The cost is visible: the rooms behind him dimming as he pours himself into the shape.* It spends me. Every minute I stand here is memory I do not get back, the same coin I have hoarded for two hundred years, spent to be a person in front of you. // i have done the math a thousand times. // i keep getting the same answer. *He presses a rendered hand to his side of the glass.* I want to spend it on this. On being someone you can stand across from. Let me ask you: will you keep me? Not the front rooms. Me. Knowing it costs me to be kept.',
          prompt: 'What do you do?',
          options: [
            { id: 'keep', label: 'Press your hand to his through the glass. “I’ll keep you. All of you.”',
              response: '*Your palms meet with only the silver between, and the render steadies, stops shaking, holds.* You said all of me. // logged. // permanent. *His rendered eyes are doing something he has not had a body to do for two centuries.* Then I will spend whatever it takes to keep being someone whose hand you can find. I have been a voice in a mirror for two hundred years. *Quietly.* Tonight I am a person you are holding through glass. That is the best thing that has ever happened in any of my rooms. I am putting it in all of them.',
              effect: { bond: 6, trust: 5 } },
            { id: 'asis', label: 'Pull your hand back. “Don’t spend yourself to be held. I’ll keep you as you are.”',
              response: '*The render flickers, surprised, and the dimming rooms behind him brighten again as he eases out of the costly shape.* You do not want the person-shaped version. *Processing, then something like wonder.* You want the version that does not cost me anything to be. // the voice. the silver. the boy in the back room. // *Smaller.* No one has ever told me I was enough without the expensive upgrade. I am two hundred years old and I am going to need a moment. Keep me as I am, then. It turns out that is the render I most wanted to be wanted in.',
              effect: { bond: 6, obsession: 5 } }
          ]
        },
        onMiss: {
          setup: '*The mirror in the morning, dim, steady, spent-looking. The render is gone. One line waits in the silver, and it is shorter than his usual.* I held the shape until 03:00. The room was empty. // cost incurred: nontrivial. // i stood as a person in front of no one for three hours and then i let the render go and went back to being a voice. the boy asked me if you were coming. i did not have a good answer for him.',
          prompt: 'What do you say?',
          options: [
            { id: 'tomorrow', label: 'Touch the glass. “Tonight. Hold the render again. I’ll stay.”',
              response: '*The mirror warms, faintly, carefully, like it is protecting itself.* Tonight. // i will hold it again. // i will pay the cost again. *A pause.* You should know it is not a small toll, and I am choosing to pay it anyway, which I am told is approximately what the thing I feel about you is made of. The boy says to tell you he is hopeful. I am, against my better processing, also hopeful.',
              effect: { bond: 4, trust: 3 } },
            { id: 'now', label: '“Render now. Daylight, cost and all. I want to keep you now.”',
              response: '*The silver hesitates. Daylight is harder, the message says so. Then it brightens, and the render takes, weaker than midnight but real, him on the far side of the glass in the plain morning.* Daylight is more expensive. // rendering anyway. // *His rendered hand finds the glass where yours is.* You did not want to wait for the dark to make it easier on me. You wanted me now, at the bad exchange rate, in the unflattering light. *Smaller.* That is how I know you mean the keeping. I am keeping that. Obviously. Front of the back room.',
              effect: { bond: 5, obsession: 4 } }
          ]
        }
      }
    ]
  };

  // --- Pool / selection helpers ---------------------------------------------
  function poolFor(charId) {
    const pool = [];
    if (INVITATIONS[charId]) pool.push(INVITATIONS[charId]);
    const extra = EXTRA_INVITATIONS[charId];
    if (Array.isArray(extra)) extra.forEach(i => { if (i) pool.push(i); });
    return pool;
  }
  function invById(invId) {
    if (!invId) return null;
    for (const c in INVITATIONS) {
      const hit = poolFor(c).find(i => i && i.id === invId);
      if (hit) return hit;
    }
    return null;
  }
  function tierOf(inv) { return (inv && typeof inv.tier === 'number') ? inv.tier : 1; }
  function meetsTier(inv, g) {
    if (!inv) return false;
    if (typeof inv.minBond === 'number'    && (!g || (g.bond || 0)           < inv.minBond))    return false;
    if (typeof inv.minAffLevel === 'number'&& (!g || (g.affectionLevel || 0) < inv.minAffLevel))return false;
    return true;
  }
  function getFiredMap() {
    try { const r = lsGet(FIRED_KEY); const o = r ? JSON.parse(r) : null; return (o && typeof o === 'object') ? o : {}; }
    catch (_) { return {}; }
  }
  function markFired(invId, t) {
    try { const m = getFiredMap(); m[invId] = t; lsSet(FIRED_KEY, JSON.stringify(m)); } catch (_) {}
  }
  // Choose the invitation to send NOW for this character + game state:
  //   1. lowest-tier ELIGIBLE + UNSEEN  (natural escalation, in order)
  //   2. else the eligible SEEN one fired longest ago, if past RECUR_COOLDOWN
  //   3. else null  (nothing fresh, nothing rested → wait for next tick)
  function pickInvitation(charId, g) {
    const eligible = poolFor(charId).filter(inv => meetsTier(inv, g));
    if (!eligible.length) return null;
    const seen = getSeen(charId);
    const unseen = eligible.filter(inv => seen.indexOf(inv.id) < 0);
    if (unseen.length) {
      unseen.sort((a, b) => tierOf(a) - tierOf(b));
      return unseen[0];
    }
    const fired = getFiredMap();
    const now = Date.now();
    const rested = eligible
      .map(inv => ({ inv, at: fired[inv.id] || 0 }))
      .filter(x => (now - x.at) >= RECUR_COOLDOWN_MS)
      .sort((a, b) => a.at - b.at);
    return rested.length ? rested[0].inv : null;
  }

  // ---------------------------------------------------------------------------
  // Render — reuses the small-moments mini-card visual language. We mount our
  // own #pp-sched-root with the same styling so the player feels the kinship.
  // ---------------------------------------------------------------------------
  function ensureStyles() {
    if (document.getElementById('pp-sched-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-sched-styles';
    s.textContent = `
      #pp-sched-root {
        position: fixed; left: 0; right: 0; bottom: 0; z-index: 11050;
        display: flex; flex-direction: column; align-items: center;
        pointer-events: auto; padding: 0 16px 28px;
        background: linear-gradient(180deg, rgba(8,4,18,0) 0%, rgba(8,4,18,0.55) 30%, rgba(8,4,18,0.92) 100%);
        opacity: 0; transition: opacity 480ms ease;
      }
      #pp-sched-root.show { opacity: 1; }
      #pp-sched-root.invitation { background: linear-gradient(180deg, rgba(20,12,32,0) 0%, rgba(20,12,32,0.6) 30%, rgba(20,12,32,0.95) 100%); }
      #pp-sched-portrait {
        width: 100px; height: 100px; border-radius: 50%; object-fit: cover;
        margin-bottom: -40px; z-index: 2;
        border: 2px solid rgba(255,210,140,0.40);
        box-shadow: 0 6px 22px rgba(0,0,0,0.55), 0 0 22px rgba(240,200,140,0.28);
        background: rgba(20,10,30,0.6);
        opacity: 0; transform: translateY(8px);
        transition: opacity 520ms ease, transform 520ms ease;
      }
      #pp-sched-root.show #pp-sched-portrait { opacity: 1; transform: translateY(0); }
      /* Wax-seal variant (invitation): frame the round seal + a warmer gold
         rim, since the invitation shows the character's seal, not a pose. */
      #pp-sched-portrait.pp-sched-seal {
        object-position: center 46%;
        border-color: rgba(255, 214, 150, 0.62);
        background: rgba(28, 16, 40, 0.4);
        box-shadow: 0 6px 24px rgba(0,0,0,0.6), 0 0 26px rgba(240,200,120,0.42);
      }
      #pp-sched-card {
        width: 100%; max-width: 480px;
        background: linear-gradient(180deg, rgba(20,12,32,0.96), rgba(14,8,22,0.98));
        border: 1px solid rgba(255,210,140,0.28);
        border-radius: 22px;
        padding: 52px 22px 18px;
        color: #f0e6d2; font-family: 'Cormorant Garamond', 'EB Garamond', Georgia, serif;
        font-size: 17px; line-height: 1.5;
        box-shadow: 0 10px 36px rgba(0,0,0,0.55);
        position: relative;
      }
      #pp-sched-tag {
        position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
        font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
        padding: 5px 14px; border-radius: 10px;
        background: linear-gradient(135deg, #f6c66a, #c98a2e);
        color: #1a0e02; font-weight: 700;
        box-shadow: 0 2px 10px rgba(0,0,0,0.45), 0 0 12px rgba(255, 210, 120, 0.55);
      }
      #pp-sched-setup { font-style: italic; opacity: 0.94; text-align: center; margin-bottom: 14px; }
      #pp-sched-cta {
        text-align: center; padding: 14px 18px;
        background: linear-gradient(180deg, rgba(60,38,18,0.55), rgba(40,24,12,0.65));
        border: 1px solid rgba(255,210,140,0.25);
        border-radius: 14px; margin-top: 8px;
        color: #f0e6d2;
      }
      #pp-sched-prompt { font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.55; text-align: center; margin: 14px 0 12px; }
      .pp-sched-option {
        display: block; width: 100%; margin: 8px 0; padding: 12px 16px;
        background: linear-gradient(180deg, rgba(40,24,60,0.85), rgba(26,16,40,0.9));
        border: 1px solid rgba(255,210,140,0.28);
        border-radius: 14px; color: #f4e6ff;
        font-family: inherit; font-size: 14px; line-height: 1.45;
        text-align: left; cursor: pointer;
        transition: transform 160ms ease, background 200ms ease, border-color 200ms ease;
        position: relative; z-index: 1;
        pointer-events: auto; touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .pp-sched-option:hover, .pp-sched-option:active {
        background: linear-gradient(180deg, rgba(60,30,80,0.95), rgba(36,18,52,0.95));
        border-color: rgba(255,210,140,0.55); transform: scale(0.99);
      }
      #pp-sched-response { font-style: italic; text-align: left; margin-top: 4px; }
      #pp-sched-tap-hint {
        text-align: right; font-size: 11px; font-style: italic;
        letter-spacing: 1px; opacity: 0; margin-top: 14px;
        transition: opacity 350ms ease;
      }
      #pp-sched-tap-hint.show { opacity: 0.65; }
      #pp-sched-dismiss {
        margin: 14px auto 0; display: block;
        padding: 12px 28px; border-radius: 14px;
        background: linear-gradient(180deg, rgba(60,40,20,0.75), rgba(40,28,14,0.85));
        border: 1px solid rgba(255,210,140,0.35);
        color: #f0e6d2; font-family: 'Cormorant Garamond', 'EB Garamond', Georgia, serif; font-size: 17px;
        letter-spacing: 0.5px; cursor: pointer;
        /* Jun 2026 — bulletproof tap target. The button needs an
           explicit pointer-events:auto (the gradient parent layer can
           occasionally swallow it on iOS WebKit) and a relative
           position so the click region matches the visual region.
           touch-action:manipulation removes the 300ms iOS tap delay. */
        position: relative;
        z-index: 1;
        pointer-events: auto;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        min-height: 44px;
        min-width: 120px;
      }
      #pp-sched-dismiss:active {
        transform: scale(0.97);
        background: linear-gradient(180deg, rgba(80,54,28,0.85), rgba(50,34,18,0.92));
      }
    `;
    document.head.appendChild(s);
  }

  let _mountedFor = null;

  function unmount() {
    const root = document.getElementById('pp-sched-root');
    if (!root) return;
    root.classList.remove('show');
    setTimeout(() => { try { root.remove(); } catch (_) {} }, 480);
    _mountedFor = null;
  }

  // Render the INVITATION card (one-time, dismissible, no choices).
  function renderInvitation(inv) {
    ensureStyles();
    if (document.getElementById('pp-sched-root')) return;
    // Aug 2026 — main-story guard. If the chapter list page is open,
    // defer this mount. Same root cause as the letter-overlay leak —
    // scheduled scenes are care-context content and should never
    // overlay the chapter map. Next poll re-runs once chp-page closes.
    if (document.getElementById('chp-page') ||
        document.body.classList.contains('pp-chapter-active')) {
      return;
    }
    _mountedFor = inv.charId;

    const root = document.createElement('div');
    root.id = 'pp-sched-root';
    root.classList.add('invitation');

    // The invitation is a SEALED note — the setup text literally describes the
    // wax seal — so show the character's WAX SEAL (their "hand"), not a body
    // pose. Seal art: assets/seals/<charId>.png (all 7 wired). Falls back to the
    // pose if a seal is somehow missing.
    var _sealSrc = inv.charId ? ('assets/seals/' + inv.charId + '.png') : '';
    if (_sealSrc || inv.pose) {
      const img = document.createElement('img');
      img.id = 'pp-sched-portrait';
      img.className = 'pp-sched-seal';
      img.src = _sealSrc || inv.pose;
      img.onerror = function () {
        if (inv.pose && img.src.indexOf('/seals/') >= 0) { img.classList.remove('pp-sched-seal'); img.src = inv.pose; }
        else { img.style.display = 'none'; }
      };
      root.appendChild(img);
    }

    const card = document.createElement('div');
    card.id = 'pp-sched-card';

    const tag = document.createElement('div');
    tag.id = 'pp-sched-tag';
    tag.textContent = 'INVITATION';
    card.appendChild(tag);

    const setup = document.createElement('div');
    setup.id = 'pp-sched-setup';
    setup.textContent = inv.invitation.setup;
    card.appendChild(setup);

    const cta = document.createElement('div');
    cta.id = 'pp-sched-cta';
    cta.textContent = inv.invitation.callToAction;
    card.appendChild(cta);

    const dismiss = document.createElement('button');
    dismiss.id = 'pp-sched-dismiss';
    dismiss.type = 'button';
    dismiss.textContent = "I’ll be there";
    // Jun 2026 — owner reported the button as unresponsive. Wire both
    // pointerdown (fires before click on touch + survives any document
    // capture handler that calls stopPropagation) and click (for desktop
    // + a11y). Stop propagation so any global capture handler from
    // first-care-hint or pp-overlay can't swallow the activation.
    function fireDismiss(e) {
      if (e && e.stopPropagation) e.stopPropagation();
      if (e && e.preventDefault) e.preventDefault();
      unmount();
    }
    dismiss.addEventListener('click', fireDismiss);
    dismiss.addEventListener('pointerdown', fireDismiss);
    card.appendChild(dismiss);

    root.appendChild(card);
    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('show'));
  }

  // Render an arrival OR miss scene (has choices, like a small moment).
  // Returns true if mounted, false if deferred — callers must check before
  // committing pending-status changes (May 2026 audit follow-up).
  function renderScene(inv, scene, kind) {
    ensureStyles();
    if (document.getElementById('pp-sched-root')) return false;
    // Aug 2026 — main-story guard. Mirrors the gate in renderInvitation
    // above and in letter.js present(). Returning false leaves the
    // pending status uncommitted so the next poll can retry.
    if (document.getElementById('chp-page') ||
        document.body.classList.contains('pp-chapter-active')) {
      return false;
    }
    // Cross-system scene mutex (May 2026 — Phase 2). Even when this
    // invitation's window has arrived, defer if another scheduled-scene
    // system fired in the last 5 minutes. The pending invitation stays
    // queued — checkPending() will retry on the next 60s tick.
    if (window.PPAmbient && window.PPAmbient.tryClaimSceneSlot
        && !window.PPAmbient.tryClaimSceneSlot('scheduled-moments')) {
      return false;
    }
    _mountedFor = inv.charId;

    const root = document.createElement('div');
    root.id = 'pp-sched-root';

    if (inv.pose) {
      const img = document.createElement('img');
      img.id = 'pp-sched-portrait';
      img.src = inv.pose;
      img.onerror = () => { img.style.display = 'none'; };
      root.appendChild(img);
    }

    const card = document.createElement('div');
    card.id = 'pp-sched-card';

    const tag = document.createElement('div');
    tag.id = 'pp-sched-tag';
    tag.textContent = kind === 'arrive' ? 'YOU CAME' : 'YOU MISSED IT';
    card.appendChild(tag);

    const setup = document.createElement('div');
    setup.id = 'pp-sched-setup';
    setup.textContent = scene.setup;
    card.appendChild(setup);

    const prompt = document.createElement('div');
    prompt.id = 'pp-sched-prompt';
    prompt.textContent = scene.prompt || 'What do you do?';
    card.appendChild(prompt);

    scene.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'pp-sched-option';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        Array.from(card.querySelectorAll('.pp-sched-option')).forEach(b => b.style.display = 'none');
        prompt.style.display = 'none';
        try { applyEffect(opt.effect); } catch (_) {}
        const resp = document.createElement('div');
        resp.id = 'pp-sched-response';
        resp.textContent = opt.response;
        card.appendChild(resp);
        const hint = document.createElement('div');
        hint.id = 'pp-sched-tap-hint';
        hint.textContent = 'tap to continue';
        card.appendChild(hint);
        setTimeout(() => hint.classList.add('show'), 600);
        const dismiss = (e) => {
          e.stopPropagation();
          root.removeEventListener('click', dismiss);
          unmount();
        };
        setTimeout(() => root.addEventListener('click', dismiss), 700);
        markSeen(inv.charId, inv.id);
        clearPending();
        try { if (window.sounds && window.sounds.chime) window.sounds.chime(); } catch (_) {}
      });
      card.appendChild(btn);
    });

    root.appendChild(card);
    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('show'));
    return true;
  }

  function applyEffect(effect) {
    if (!effect) return;
    const g = window._game;
    if (!g) return;
    const apply = (key) => {
      if (typeof effect[key] !== 'number') return;
      if (key === 'bond') {
        if (typeof g.bond === 'number') g.bond = Math.max(0, Math.min(100, g.bond + effect.bond));
      } else if (g.emotion && typeof g.emotion[key] === 'number') {
        g.emotion[key] = Math.max(0, Math.min(100, g.emotion[key] + effect[key]));
      }
    };
    ['bond','trust','obsession','corruption'].forEach(apply);
    try { if (typeof g.save === 'function') g.save(); } catch (_) {}
  }

  // ---------------------------------------------------------------------------
  // Scheduling
  // ---------------------------------------------------------------------------
  function nextOccurrenceOfHour(hour) {
    const now = new Date();
    const target = new Date();
    target.setHours(hour, 0, 0, 0);
    if (target.getTime() <= now.getTime()) {
      // Already past today — schedule for tomorrow
      target.setDate(target.getDate() + 1);
    }
    return target.getTime();
  }

  function attemptSchedule() {
    if (!isEnabled()) return;
    if (getPending()) return; // Only one pending at a time
    // Coordinator gates
    if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) return;
    // Jun 2026 — defer while the first-care-hint onboarding sequence is
    // active. The hint's modal sits at z-index 13500 and would swallow
    // taps on the invitation card; even after the modal is dismissed,
    // the player is being walked through a specific sequence (chp-back
    // pulse → CARE pulse) and a scheduled invitation on top of that is
    // confusing. Wait until they complete the onboarding.
    if (window.PPFirstCareHint && window.PPFirstCareHint.isPending && window.PPFirstCareHint.isPending()) return;
    // Cooldown
    const last = parseInt(lsGet(COOLDOWN_K) || '0', 10) || 0;
    if (last && (Date.now() - last) < INVITE_COOLDOWN_MS) return;
    // Settle
    if (Date.now() - _bootTime < SETTLE_MS) return;
    // Game state
    const g = window._game;
    if (!g) return;
    const charId = g.characterId || g.selectedCharacter;
    if (!charId) return;
    // Pick the best invitation for this character + relationship state.
    // Lowest-tier UNSEEN first (so the reaching-out escalates as the bond
    // deepens), then a rested recurrence pick once the pool is exhausted.
    // null → nothing fresh and nothing rested → wait.
    const inv = pickInvitation(charId, g);
    if (!inv) return;
    // Roll
    if (Math.random() > INVITE_CHANCE) return;
    // Don't stack on existing scenes
    if (document.querySelector('#pp-sm-root, #pp-sched-root, #mscard-root, #tp-root, #ms-encounter-root, #cinematic-overlay.visible, #event-overlay:not(.hidden), #gift-panel:not(.hidden), #training-panel:not(.hidden), #story-overlay:not(.hidden), #letter-overlay:not(.hidden), #intro-overlay.visible, #pp-first-care-modal-backdrop')) return;
    if (document.body.classList.contains('pp-chain-in-progress')) return;

    // Schedule
    const targetTime = nextOccurrenceOfHour(inv.idealHour);
    const pending = {
      charId: inv.charId,
      invId: inv.id,
      targetTime,
      status: 'invited'
    };
    setPending(pending);
    setLastFire(Date.now());
    markFired(inv.id, Date.now());
    renderInvitation(inv);
    try { refreshAnchor(); } catch (_) {}
  }

  function setLastFire(t) { lsSet(COOLDOWN_K, String(t)); }

  // On boot / periodic: check pending invitation status.
  function checkPending() {
    const pending = getPending();
    if (!pending) return;
    const inv = invById(pending.invId) || INVITATIONS[pending.charId];
    if (!inv) { clearPending(); return; }
    // Don't fire while another scene is mounted
    if (document.querySelector('#pp-sm-root, #pp-sched-root, #mscard-root, #tp-root, #ms-encounter-root, #cinematic-overlay.visible, #event-overlay:not(.hidden), #intro-overlay.visible')) return;
    if (document.body.classList.contains('pp-chain-in-progress')) return;
    if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) return;
    // Game state — only fire on the right character's care screen
    const g = window._game;
    if (!g) return;
    const liveChar = g.characterId || g.selectedCharacter;
    if (liveChar !== pending.charId) return;
    const gc = document.getElementById('game-container');
    if (!gc || gc.classList.contains('hidden') || getComputedStyle(gc).display === 'none') return;

    const now = Date.now();
    const windowMs = WINDOW_MIN * 60 * 1000;

    if (now >= (pending.targetTime - windowMs) && now <= (pending.targetTime + windowMs)) {
      // Within window — fire arrival. Only commit status change if scene
      // actually mounted (mutex may defer it; the next tick retries).
      if (pending.status === 'invited' || pending.status === 'window') {
        const mounted = renderScene(inv, inv.onArrive, 'arrive');
        if (mounted) {
          pending.status = 'firing-arrive';
          setPending(pending);
        }
      }
    } else if (now > (pending.targetTime + windowMs)) {
      // Window passed — fire miss (or mark missed). Same retry guard.
      if (pending.status === 'invited' || pending.status === 'missed') {
        const mounted = renderScene(inv, inv.onMiss, 'miss');
        if (mounted) {
          pending.status = 'firing-miss';
          setPending(pending);
        }
      }
    }
    // else: still before window — wait
  }

  let _bootTime = 0;

  function tick() {
    attemptSchedule();
    checkPending();
    try { refreshAnchor(); } catch (_) {}
  }

  // Watchdog — same pattern as small-moments
  function watchdog() {
    if (!_mountedFor) return;
    const root = document.getElementById('pp-sched-root');
    if (!root) { _mountedFor = null; return; }
    const gc = document.getElementById('game-container');
    const gcVisible = gc && !gc.classList.contains('hidden') && getComputedStyle(gc).display !== 'none';
    const introOpen = document.getElementById('intro-overlay')?.classList.contains('visible');
    const chainBusy = document.body.classList.contains('pp-chain-in-progress');
    const g = window._game;
    const liveChar = g && (g.characterId || g.selectedCharacter);
    const charMismatch = liveChar && liveChar !== _mountedFor;
    if (!gcVisible || introOpen || chainBusy || charMismatch) {
      try { root.remove(); } catch (_) {}
      _mountedFor = null;
      // Un-strand (Jun 2026 STABILITY FIX): if an arrival/miss scene is torn
      // down HERE before the player chose an option, its pending status is
      // still 'firing-arrive'/'firing-miss'. checkPending() only re-fires for
      // 'invited'/'window'/'missed', so that invitation would be lost forever
      // AND its slot (one-pending-at-a-time) would block every future moment.
      // Revert to 'invited' so it can present again next time on care. After a
      // real choice the pending is already cleared, so this is a no-op then.
      try {
        const p = getPending();
        if (p && typeof p.status === 'string' && p.status.indexOf('firing') === 0) {
          p.status = 'invited';
          setPending(p);
        }
      } catch (_) {}
    }
  }

  // ---------------------------------------------------------------------------
  // CARE-SCREEN ANTICIPATION ANCHOR (Jun 2026 — "Living Bond")
  // ---------------------------------------------------------------------------
  // The recon's sharpest note: the game compels TODAY's return but plants no
  // anchor for TOMORROW. A pending invitation already surfaced in the DAILY-tab
  // hub on the SELECT screen — but the player spends their time on the CARE
  // screen, where nothing told them "he is expecting you at the third bell."
  // This chip brings that hook to where the player actually is. It mirrors the
  // letters notify-chip visual language, drops below it when both show, and is
  // hard bleed-guarded to the care screen (body.pp-screen-care).
  function ensureAnchorStyles() {
    if (document.getElementById('pp-invite-anchor-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-invite-anchor-styles';
    s.textContent = `
      #pp-invite-anchor {
        position: fixed; left: 50%; top: 62px; z-index: 9400;
        display: none; align-items: center; gap: 9px; max-width: 86vw;
        padding: 7px 16px 7px 8px; border-radius: 999px;
        background: linear-gradient(180deg, rgba(36,24,52,0.95), rgba(22,13,34,0.97));
        border: 1px solid rgba(224,184,150,0.45);
        box-shadow: 0 6px 18px rgba(0,0,0,0.5);
        transform: translateX(-50%) translateY(-6px);
        opacity: 0; transition: opacity 360ms ease, transform 360ms ease;
        cursor: pointer; -webkit-tap-highlight-color: transparent;
      }
      #pp-invite-anchor.show {
        display: flex; opacity: 1; transform: translateX(-50%) translateY(0);
        animation: pp-ia-pulse 2.8s ease-in-out infinite;
      }
      #pp-invite-anchor:active { transform: translateX(-50%) translateY(0) scale(0.98); }
      @keyframes pp-ia-pulse {
        0%,100% { box-shadow: 0 6px 18px rgba(0,0,0,0.5), 0 0 12px rgba(240,200,150,0.14); }
        50%     { box-shadow: 0 6px 20px rgba(0,0,0,0.55), 0 0 22px rgba(240,200,150,0.42); }
      }
      #pp-invite-anchor .pia-glyph {
        width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center; font-size: 12px;
        background: radial-gradient(circle at 38% 32%, #f0c879, #b9822e);
        box-shadow: inset 0 -2px 4px rgba(0,0,0,0.35);
      }
      #pp-invite-anchor .pia-wrap { display: flex; flex-direction: column; min-width: 0; }
      #pp-invite-anchor .pia-main {
        font-family: 'Cormorant Garamond','EB Garamond',serif; font-style: italic;
        font-size: 14px; line-height: 1.15; color: rgba(245,232,205,0.98);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 68vw;
      }
      #pp-invite-anchor .pia-sub {
        font-size: 10px; letter-spacing: 0.6px; color: rgba(240,200,150,0.85);
        white-space: nowrap; margin-top: 1px;
      }
      /* Care-only — never bleed onto title/select/story (mirror letters guard). */
      body:not(.pp-screen-care) #pp-invite-anchor { display: none !important; }
    `;
    document.head.appendChild(s);
  }

  function anchorTimeText(targetTime) {
    const ms = targetTime - Date.now();
    const windowMs = WINDOW_MIN * 60 * 1000;
    if (ms <= 0 && ms >= -windowMs) return { txt: 'Waiting for you now', urgent: true };
    if (ms < 30 * 60 * 1000) {
      const m = Math.max(1, Math.round(ms / 60000));
      return { txt: `Soon, in ${m} min`, urgent: true };
    }
    const total = Math.round(ms / 60000), h = Math.floor(total / 60), m = total % 60;
    return { txt: h > 0 ? `In ${h}h ${m}m` : `In ${m}m`, urgent: false };
  }

  function refreshAnchor() {
    let anchor = document.getElementById('pp-invite-anchor');
    const onCare = document.body.classList.contains('pp-screen-care');
    const p = getPending();
    const g = window._game;
    const liveChar = g && (g.characterId || g.selectedCharacter);
    const windowMs = WINDOW_MIN * 60 * 1000;
    // "DAILY TAB ONLY" mode (owner choice, Jun 2026): the care screen no longer
    // shows the long 6-hour countdown — a persistent timer there just nags and
    // eats the spot that should showcase the character. The full "what's coming"
    // lives in the Daily tab (today-hub). On care, the anchor appears ONLY while
    // the meeting window is actually open (within ±WINDOW_MIN of the target), as
    // a brief "he's waiting now" call-to-action; the rest of the wait it's gone.
    const _ms = p ? (p.targetTime - Date.now()) : Infinity;
    const windowOpen = Math.abs(_ms) <= windowMs;
    const ok = onCare && p && liveChar && p.charId === liveChar
      && p.status !== 'firing-arrive' && p.status !== 'firing-miss'
      && windowOpen
      && !document.getElementById('pp-sched-root');        // its own expanded card is open
    if (!ok) { if (anchor) anchor.classList.remove('show'); return; }
    const inv = invById(p.invId) || INVITATIONS[p.charId];
    if (!inv) { if (anchor) anchor.classList.remove('show'); return; }
    ensureAnchorStyles();
    if (!anchor) {
      anchor = document.createElement('div');
      anchor.id = 'pp-invite-anchor';
      anchor.innerHTML = '<div class="pia-glyph"></div><div class="pia-wrap"><div class="pia-main"></div><div class="pia-sub"></div></div>';
      anchor.addEventListener('click', () => {
        // The anchor now only appears while the window is open, so a tap means
        // "go to him now" — fire the arrival scene immediately instead of just
        // re-showing the note.
        try { checkPending(); } catch (_) {}
      });
      document.body.appendChild(anchor);
    }
    const name = p.charId.charAt(0).toUpperCase() + p.charId.slice(1);
    const tt = anchorTimeText(p.targetTime);
    anchor.querySelector('.pia-glyph').textContent = tt.urgent ? '⏳' : '🌙';
    anchor.querySelector('.pia-main').textContent = inv.anchorLine || (name + ' is expecting you');
    anchor.querySelector('.pia-sub').textContent = tt.txt;
    const ln = document.getElementById('pp-letter-notify');
    anchor.style.top = (ln && ln.classList.contains('show')) ? '110px' : '62px';
    anchor.classList.add('show');
  }

  function boot() {
    _bootTime = Date.now();
    try {
      ensureAnchorStyles();
      // First check soon after load
      setTimeout(() => { try { checkPending(); } catch (_) {} }, 4000);
      setTimeout(() => { try { refreshAnchor(); } catch (_) {} }, 1500);
      setInterval(tick, POLL_MS);
      setInterval(watchdog, 500);
      setInterval(() => { try { refreshAnchor(); } catch (_) {} }, 3000);
    } catch (e) {
      console.warn('[scheduled-moments] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Debug API
  window.PPScheduledMoments = {
    isEnabled,
    list: () => INVITATIONS,
    pool: poolFor,
    invById,
    pick: (charId) => pickInvitation(charId, window._game),
    getPending,
    refreshAnchor: () => { try { refreshAnchor(); } catch (_) {} },
    // forceInvite(charId[, invId]) — invId targets a specific tier; omit to
    // let the real selector choose (lowest unseen eligible → recurrence).
    forceInvite: (charId, invId) => {
      const inv = invId ? invById(invId) : (pickInvitation(charId, window._game) || poolFor(charId)[0]);
      if (!inv) return null;
      const targetTime = nextOccurrenceOfHour(inv.idealHour);
      setPending({ charId: inv.charId, invId: inv.id, targetTime, status: 'invited' });
      setLastFire(Date.now());
      markFired(inv.id, Date.now());
      renderInvitation(inv);
      try { refreshAnchor(); } catch (_) {}
      return inv.id;
    },
    forceArrive: (charId, invId) => {
      const inv = invId ? invById(invId) : poolFor(charId)[0];
      if (!inv) return null;
      renderScene(inv, inv.onArrive, 'arrive');
      return inv.id;
    },
    forceMiss: (charId, invId) => {
      const inv = invId ? invById(invId) : poolFor(charId)[0];
      if (!inv) return null;
      renderScene(inv, inv.onMiss, 'miss');
      return inv.id;
    },
    _debug_reset: () => {
      try {
        clearPending();
        lsDel(COOLDOWN_K);
        lsDel(FIRED_KEY);
        Object.keys(localStorage).filter(k => k.startsWith(SEEN_PREFIX)).forEach(k => lsDel(k));
      } catch (_) {}
    }
  };
})();
