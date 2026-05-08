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
            label: 'Apologize. Hand on his hand. "I didn’t see the note in time."',
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
        setup: '*The tower the next afternoon. He is at the desk with a notebook open to a fresh page. The sketch of the light is finished. There is, however, a single line in the margin that he turns, slightly, so you cannot quite read it.* The light came at one minute past the bell. It lasted nine. I sat under the dome alone for the nine minutes.',
        prompt: 'What do you say?',
        options: [
          { id: 'soon',
            label: '"Show me the sketch. Tell me everything I missed."',
            response: '*He turns the page toward you and walks you through it, line by careful line, until you have stood under nine minutes of light he has not been able to stop thinking about.* That is the closest I can get you to having seen it. *Smaller.* I am sorry it is not closer.',
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
            response: '*Twenty paces in, the light comes through the canopy at exactly the angle he had been waiting for. The forest floor lights up. A thousand small white flowers that bloom only at this one hour of the year. He watches your face. Not the flowers.* I have been waiting six years for the bloom and four months for the right person to bring. *Smaller.* You are correct that I am not subtle.',
            effect: { bond: 5, trust: 4 } },
          { id: 'hand',
            label: 'Take his hand. Walk in.',
            response: '*He does not let go of your hand the whole walk in. When the flowers bloom around your feet he says, very quietly, with no whetstone or weather to hide behind:* If you would have me. I am asking. I am, I am told, allowed to ask now.',
            effect: { bond: 5, obsession: 4 } }
        ]
      },
      onMiss: {
        setup: '*The treeline at noon. The flowers have closed. They will not open again for another year. He is sharpening his knife on the same log he sharpens it on every day. He does not look up.* The bloom came at first light. I waited. The forest waited. We have a year to go before it tries again.',
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
      pose: 'assets/noir/body/casual1.png',
      invitation: {
        setup: '*A black thread on your pillow when you turn the bed down. Not a curse. Not a warning. An invitation, in his style, written in a language only one person in the kingdom uses.*',
        callToAction: '“Third bell. The seam. I am opening it tonight, fully, for one minute. With you, if you will come. I will not open it again on my own.”'
      },
      onArrive: {
        setup: '*The seam at the third bell. Wider tonight than you have ever seen it. The dark behind it is not threatening. It is patient, the way a room that has been waiting six hundred years to be entered is patient. He is on this side of it. He is holding the seam open with both hands, and the strain of it is on his face.* You came. *He says it like a man who is about to lose the ability to hold something for very much longer.* Step in. With me. One minute. Then I close it. Hand.',
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
      #pp-sched-card {
        width: 100%; max-width: 480px;
        background: linear-gradient(180deg, rgba(20,12,32,0.96), rgba(14,8,22,0.98));
        border: 1px solid rgba(255,210,140,0.28);
        border-radius: 22px;
        padding: 52px 22px 18px;
        color: #f4e6ff; font-family: inherit;
        font-size: 15px; line-height: 1.55;
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
        color: #fde8c6;
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
        padding: 10px 22px; border-radius: 14px;
        background: linear-gradient(180deg, rgba(60,40,20,0.75), rgba(40,28,14,0.85));
        border: 1px solid rgba(255,210,140,0.35);
        color: #fde8c6; font-family: inherit; font-size: 13px;
        letter-spacing: 1px; cursor: pointer;
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
    _mountedFor = inv.charId;

    const root = document.createElement('div');
    root.id = 'pp-sched-root';
    root.classList.add('invitation');

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
    dismiss.textContent = "I'll be there";
    dismiss.addEventListener('click', () => { unmount(); });
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
    const inv = INVITATIONS[charId];
    if (!inv) return;
    // Unseen?
    if (getSeen(charId).indexOf(inv.id) >= 0) return;
    // Roll
    if (Math.random() > INVITE_CHANCE) return;
    // Don't stack on existing scenes
    if (document.querySelector('#pp-sm-root, #pp-sched-root, #mscard-root, #tp-root, #ms-encounter-root, #cinematic-overlay.visible, #event-overlay:not(.hidden), #gift-panel:not(.hidden), #training-panel:not(.hidden), #story-overlay:not(.hidden), #letter-overlay:not(.hidden), #intro-overlay.visible')) return;
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
    renderInvitation(inv);
  }

  function setLastFire(t) { lsSet(COOLDOWN_K, String(t)); }

  // On boot / periodic: check pending invitation status.
  function checkPending() {
    const pending = getPending();
    if (!pending) return;
    const inv = INVITATIONS[pending.charId];
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
    }
  }

  function boot() {
    _bootTime = Date.now();
    try {
      // First check soon after load
      setTimeout(() => { try { checkPending(); } catch (_) {} }, 4000);
      setInterval(tick, POLL_MS);
      setInterval(watchdog, 500);
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
    getPending,
    forceInvite: (charId) => {
      const inv = INVITATIONS[charId];
      if (!inv) return null;
      const targetTime = nextOccurrenceOfHour(inv.idealHour);
      setPending({ charId: inv.charId, invId: inv.id, targetTime, status: 'invited' });
      setLastFire(Date.now());
      renderInvitation(inv);
      return inv.id;
    },
    forceArrive: (charId) => {
      const inv = INVITATIONS[charId];
      if (!inv) return null;
      renderScene(inv, inv.onArrive, 'arrive');
      return inv.id;
    },
    forceMiss: (charId) => {
      const inv = INVITATIONS[charId];
      if (!inv) return null;
      renderScene(inv, inv.onMiss, 'miss');
      return inv.id;
    },
    _debug_reset: () => {
      try {
        clearPending();
        lsDel(COOLDOWN_K);
        Object.keys(localStorage).filter(k => k.startsWith(SEEN_PREFIX)).forEach(k => lsDel(k));
      } catch (_) {}
    }
  };
})();
