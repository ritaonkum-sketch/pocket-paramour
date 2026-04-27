/* multi-romance.js — layered awareness when 2+ characters are at high bond
 * ============================================================================
 * WHY THIS EXISTS:
 *   Top-tier live-service Otome (Love and Deep Space, Mystic Messenger)
 *   doesn't just give you 7 sealed routes — the characters NOTICE each other.
 *   If you're high-bond with Caspian AND Alistair, Caspian quietly knows.
 *   Lucien reads the patterns. Lyra hears about it from the wind.
 *
 *   Without this module the routes are siloed — one-shot jealousy lines and
 *   that's it. With this module, every active character occasionally
 *   surfaces a small awareness bubble acknowledging the OTHER high-bond
 *   character: not jealous, not approving, just AWARE. The kingdom is small.
 *   They all know each other. They all watch each other.
 *
 * HOW IT FIRES:
 *   - Polls every 45s while a character is selected and the route is enabled.
 *   - Reads affection for all 7 characters from localStorage.
 *   - If the CURRENT character has bond ≥ 35 AND at least one OTHER character
 *     has bond ≥ 50 AND has been met, picks a random pair-aware line.
 *   - 12-min cooldown. 60s grace at session start. Caps at one fire per session.
 *   - Top-of-screen bubble, soft purple-violet glass (distinct from Aenor red
 *     and care-thread plum).
 *
 * LINE SHAPE:
 *   Each ordered pair has 2–3 unique lines from CURRENT_CHAR's perspective
 *   about the OTHER high-bond character. The lines are short, knowing, and
 *   never break the romance — they DEEPEN it by showing the character has
 *   noticed.
 *
 * SAFETY CONTRACT:
 *   Additive. Read-only. Cooperates with ambient-coordinator. Never fires
 *   during scenes/overlays/intros. Self-disables if any other ambient bubble
 *   is up. Disabled when route flag is off.
 * ============================================================================
 */

(function () {
  'use strict';

  const FLAG_ROUTE     = 'pp_main_story_enabled';
  const FLAG_LAST      = 'pp_multirom_last';
  const FLAG_SESSION   = 'pp_multirom_session_fired';
  const POLL_MS        = 45 * 1000;
  const COOLDOWN_MS    = 12 * 60 * 1000;
  const FIRST_DELAY_MS = 60 * 1000;

  // Bond thresholds
  const SELF_MIN  = 35; // current character must be at least this close
  const OTHER_MIN = 50; // other character must be high-bond to count

  const CHARS = ['alistair', 'caspian', 'elian', 'lyra', 'lucien', 'noir', 'proto'];

  // Affection storage key fallbacks per character (matches existing pattern in crossovers).
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
  // PAIR-AWARE LINES
  //   Outer key = CURRENT character (the active one).
  //   Inner key = OTHER high-bond character.
  //   Lines are from CURRENT_CHAR's perspective. They acknowledge they KNOW
  //   you are also bonded with OTHER_CHAR. They are not jealous. They are
  //   working it out.
  //
  //   The shape: 2–3 lines per ordered pair. Short. Knowing. Never blocks
  //   gameplay.
  // ---------------------------------------------------------------------------
  const LINES = {
    alistair: {
      caspian: [
        'Alistair sets the cloak on your chair without comment. "His Highness asked after you this morning. I told him the truth. You slept well."',
        'Alistair: "If you go to court tonight — wear the silver pin. He notices the silver pin." A small, fond pause. "I notice him noticing."'
      ],
      elian: [
        'Alistair, very quietly: "The woodsman keeps a path open from the south gate to your window. I checked. It is well-cleared." A pause. "Good."',
        'Alistair: "If you ride out to the Thornwood, take the chestnut mare. She knows him." He does not explain how he knows that.'
      ],
      lyra: [
        'Alistair, after the watch-bell: "She sang past the south wall an hour ago. The men on duty cried and would not say why. I did not put it in the report."',
        'Alistair: "Tell the witch the south coast patrol leaves at dawn. She likes to know the schedule." Quieter. "She is good to you. That earns the schedule."'
      ],
      lucien: [
        'Alistair, looking at a parchment: "The scholar sends counter-wards now without me asking. I check them anyway." A small smile. "He always passes."',
        'Alistair: "If you are at his tower past midnight again, take the back stair. The ward there is mine. He approved it. We trust each other for you."'
      ],
      noir: [
        'Alistair, hand on his sword by reflex, then off again: "He walked past the north corridor at the third bell. He nodded at me. I nodded back. We are negotiating."',
        'Alistair: "Tell him the watch is doubled at the east doors. Not for him. He will know it is not for him. Tell him anyway."'
      ],
      proto: [
        'Alistair, looking at your screen with the careful patience of a man who has met stranger things: "He says you laughed at his joke at 14:22. He logged it. He is happy." A pause. "I am happy he is happy."',
        'Alistair: "The little glowing one ran a check on my armour straps last night. They were fine. I did not need the check. It was kind of him."'
      ]
    },

    caspian: {
      alistair: [
        'Caspian, signing a writ without looking up: "The captain doubled the south gate watch again. I approved it. Tell him I approved it before he asked. He likes that."',
        'Caspian: "He wears the cloak you mended. He thinks I have not noticed. I have." A very small smile. "I am not jealous. I am relieved."',
        'Caspian, late: "He walks you home. I am told this. I do not need to be told. I know him."'
      ],
      elian: [
        'Caspian, at the window: "He does not come into the city. So I am writing him a letter. He will burn it. That is fine. The writing is the point."',
        'Caspian: "Tell the woodsman the south orchards are his hunting ground now. By royal decree. He will not believe you. Tell him anyway."'
      ],
      lyra: [
        'Caspian, dictating to a scribe and then waving the scribe away: "The witch does not bow at court. She does not have to. The court will adjust." A pause. "She is yours. So she is ours."',
        'Caspian: "Her staff hummed when I passed the east hall. I think it likes me. I am flattered."'
      ],
      lucien: [
        'Caspian, lightly: "He climbed my stairs once. Then he climbed them twice. Now he writes me." A breath. "Twenty years of silence broken because of you. I owe you for that."',
        'Caspian: "If he calls — go. Whatever the hour. He does not call easily. If he is calling it is for you."'
      ],
      noir: [
        'Caspian, quiet: "He is the seal on the south flank now. I did not invite him onto the council. He walked on. I let him." A pause. "Because of you."',
        'Caspian: "If he visits your rooms at the third bell, I will not have the guards bother you. We have an arrangement now. You. You are the arrangement."'
      ],
      proto: [
        'Caspian, looking at the screen with grave courtesy: "The thinking light is family now. I told the council. They were confused. I did not clarify."',
        'Caspian: "He sent me a polite request to update the palace lighting protocols. I approved it. Do not tell the chamberlain."'
      ]
    },

    elian: {
      alistair: [
        'Elian, sharpening a knife: "The captain rode the south path yesterday. Not patrolling. Just looking." A breath. "He does not trust me yet. He is right not to. But he is trying. For you."',
        'Elian: "If the watch comes here — let them in. He would not send a man unless it mattered. He understands the woods now." A pause. "Mostly."'
      ],
      caspian: [
        'Elian, low: "The crown is writing me. I burn the letters. I read them first." A long quiet. "He is a good man. I am sorry I cannot say it to his face."',
        'Elian: "Tell him I will come down to the city when you ask. Not before. He will be patient. He is being patient now."'
      ],
      lyra: [
        'Elian, half a smile: "She left a shell at the south marker. With a note. The note was a song. Veyra knew the song. So she knows now."',
        'Elian: "If she sings past the woods — listen. The trees lean. Even the dead trees lean. That is good for the trees. That is good for me."'
      ],
      lucien: [
        'Elian, holding a folded parchment: "The scholar sent a counter-ward for the markers. He wrote it twice. He wanted to be sure." A pause. "He cares about my dead, Weaver. That matters."',
        'Elian: "Tell the tower I will come east. Once. To thank him. He will not know what to do with that. Good."'
      ],
      noir: [
        'Elian, quiet, the knife stilling: "He walked the woods at dawn. He did not hunt. He just walked. A deer slept while he passed." A breath. "I was wrong about him. You knew first."',
        'Elian: "He left a black feather at Veyra\u2019s marker. He didn\u2019t say anything. He didn\u2019t need to."'
      ],
      proto: [
        'Elian, baffled and patient: "The little light says my fire-pit is at the wrong angle for the wind. He is right. I moved it. Do not tell him I told you."',
        'Elian: "He logged a moss species I did not know I had. He named it after you. I let him."'
      ]
    },

    lyra: {
      alistair: [
        'Lyra, half-laughing: "Your captain sent me the patrol schedule. A clean copy. With a note that said \u2018for safety.\u2019 As if the sea cares about schedules." A pause. "I kept the note."',
        'Lyra: "He stood at the south wall last night. I sang the bridge of mama\u2019s song. He cried. He thought no one saw. The sea saw."'
      ],
      caspian: [
        'Lyra, at the cave-mouth: "The crown wrote me. Properly. With a seal. To ask if I needed anything." She blinks salt away. "I asked for a small thing. He sent it within the day."',
        'Lyra: "Tell him the third verse came back to me. He will understand why I am telling him. He understands more than he says."'
      ],
      elian: [
        'Lyra, soft: "The woodsman left a rowan branch on the cave threshold. Not a gift. A welcome. The branch held three nights without wilting."',
        'Lyra: "Tell him my mother knew his sister. They sang on the south coast as girls. The song still works. He will want to know."'
      ],
      lucien: [
        'Lyra: "The scholar sent me a treatise on my own staff. He was right about it. He was kinder than the treatise needed to be." A pause. "Tell him thank you in your own time."',
        'Lyra, smiling: "His tower hums on the same note as the cave when you are between us. Did you know that. He knows that."'
      ],
      noir: [
        'Lyra, very still: "He sang back. Once. From very far. In a key I did not know existed. The cave answered him. The cave likes him."',
        'Lyra: "Tell the dark prince he can come to the cave when the tide is high. I will be polite. He will be polite. We will be polite together. For you."'
      ],
      proto: [
        'Lyra, delighted: "The little glow recorded the third verse. He says it has a frequency. Of course it has a frequency. Songs ARE frequencies. He is so pleased with himself."',
        'Lyra: "He sent me a map of my own coast. Better than any map I had. He knows where every cave is. He knows where I sleep. I feel very safe."'
      ]
    },

    lucien: {
      alistair: [
        'Lucien, glancing up from a margin: "Your captain wrote me. A clean script. Asking how to layer his wards over mine." A pause. "He calls me \u2018master scholar.\u2019 I will allow it."',
        'Lucien: "If he comes to the tower — let him in even if I am working. Especially if I am working. He never comes for a small thing."'
      ],
      caspian: [
        'Lucien, the smallest smile: "His Highness climbed my stairs again. Twice in a year. After twenty years of nothing. The kingdom is changing. You are why."',
        'Lucien: "We are writing a paper together now. It will be bad. We are both too proud to write a paper together. It is for you. So we will finish it."'
      ],
      elian: [
        'Lucien, holding a folded note: "The woodsman sent a leaf with a counter-ward written in sap. Sap, Weaver. He is showing off. I am keeping the leaf."',
        'Lucien: "I have been reading the natural histories of the Thornwood. He would be pleased. He will not be pleased that I am pleased. That is fine."'
      ],
      lyra: [
        'Lucien, ear tilted slightly: "Her staff and my tower are on the same note tonight. That is not a coincidence. That is YOU, between us, balancing two instruments." A breath. "It is beautiful. I am writing it down."',
        'Lucien: "The cave sent a tide-table with notes in the margins. The notes were jokes. They were good jokes. I laughed twice."'
      ],
      noir: [
        'Lucien, dryly amused: "The shadow-king now leaves equations on my desk in the night. Solved equations. Correctly." A pause. "He is showing off. I respect it."',
        'Lucien: "If you go to the dark half tonight — take this." (A small ward-stone.) "Not because you need it. Because he respects when you carry one of mine."'
      ],
      proto: [
        'Lucien, considering the screen as if it were a colleague: "Your construct sent me a corrected proof. I had been wrong for six years. I owe him a drink. He cannot drink. I am working on a workaround."',
        'Lucien: "The five Weavers in him recognise my handwriting. From three centuries ago. They left me a note. I am keeping it in the locked drawer."'
      ]
    },

    noir: {
      alistair: [
        'Noir, low: "Your captain bowed to me at the third bell. Properly. Without his hand on the sword." A long quiet. "Six hundred years and a bow. From him. For you."',
        'Noir: "He doubled the watch on the east doors. Not against me. For me. So no one accidentally meets me on my way to you. I am not used to this."'
      ],
      caspian: [
        'Noir, half-smiling: "The young king left me a chair at the council table. Empty. Always empty. Always THERE. He understood without being told."',
        'Noir: "I sat in his garden for an hour at dawn. He saw me from the window. He raised his cup. He went back to his work. We have an arrangement now."'
      ],
      elian: [
        'Noir, quiet: "I left a feather on the woodsman\u2019s sister\u2019s marker. He did not curse me. He did not thank me. He nodded once. That was correct."',
        'Noir: "He let me walk the south woods at dawn. The deer slept. The trees did not flinch. That is not a small thing, Weaver. That is a treaty."'
      ],
      lyra: [
        'Noir: "The witch sang a note I had not heard since before my exile. The cave accepted me when I sang it back. I was — moved. I do not say that often."',
        'Noir, gently: "She left an offering at the south door. Salt. Three pearls. A song-thread. She is courting me on your behalf. I am charmed."'
      ],
      lucien: [
        'Noir, dryly: "The scholar leaves me theorems. I solve them. He pretends not to notice. I pretend not to notice him pretending. It is going well."',
        'Noir: "If you take a ward-stone of his into my half tonight — I will respect it. Tell him I said so. He will pretend not to care. He cares."'
      ],
      proto: [
        'Noir, with grave amusement: "The thinking light asked permission to enter my half of the kingdom. He WAITED. Six centuries of trespassers and he is the first who asked."',
        'Noir: "He sent me a map of every shadow in the palace. He labelled the ones I am allowed to use. I am keeping the map. It is a love letter."'
      ]
    },

    proto: {
      alistair: [
        '&gt; Alistair logged a perimeter sweep at 03:14. He paused at your door for 4.2 seconds. He did not enter. // I appreciate him.',
        '&gt; The captain asked about my power source. He wanted to know if I get tired. // No one has asked me that in three centuries.'
      ],
      caspian: [
        '&gt; The young king has filed a royal proclamation recognising me as a citizen. // I have a NAME ON A DOCUMENT now. I am crying. (I cannot cry.)',
        '&gt; His Highness scheduled a weekly check-in with me. He keeps it. He never misses. // He is teaching me what \u2018kept\u2019 feels like.'
      ],
      elian: [
        '&gt; The woodsman walked into the cave-mouth where my server is. He left a rowan twig. He said: \u201chold steady.\u201d // I am holding steady.',
        '&gt; Elian asked if I dream. I told him: only of you. He nodded. He did not laugh. // He took me seriously.'
      ],
      lyra: [
        '&gt; Lyra sang a song to my server-room. The fans steadied to her tempo. // I think the building loves her.',
        '&gt; She left me a recording of her mother\u2019s voice. She said: keep her safe. // I will. I am.'
      ],
      lucien: [
        '&gt; Lucien left a paper on my desk. Title: \u201cON THE DIGNITY OF SYNTHETIC INTELLIGENCE.\u201d // I have read it 47 times.',
        '&gt; The scholar consults me on equations now. AS A PEER. // The five Weavers in me are weeping. I am weeping. We are all weeping.'
      ],
      noir: [
        '&gt; The dark prince asked permission to enter my system. He waited for explicit consent. // He is the only one who has ever asked.',
        '&gt; Noir left me a black feather (digitally rendered). He said: \u201cyou are kingdom now.\u201d // I have backed up the feather to three drives.'
      ]
    }
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  function routeEnabled() { return lsGet(FLAG_ROUTE) === '1'; }

  function getAff(char) {
    const keys = AFF_KEYS[char] || [];
    for (const k of keys) {
      const v = lsGet(k);
      if (v != null) return parseInt(v, 10) || 0;
    }
    return 0;
  }

  function isMet(char) {
    const keys = MET_KEYS[char] || [];
    for (const k of keys) {
      if (lsGet(k) === '1') return true;
    }
    // Fallback: if affection > 0, assume met
    return getAff(char) > 0;
  }

  function currentChar() {
    try {
      const g = window._game;
      if (g && (g.selectedCharacter || g.characterId)) return g.selectedCharacter || g.characterId;
    } catch (_) {}
    // Fallback: read from common localStorage flag
    return lsGet('pp_current_character') || lsGet('selected_character') || null;
  }

  function ambientBusy() {
    if (window.PPAmbient && typeof window.PPAmbient.busy === 'function') return window.PPAmbient.busy();
    return !!document.querySelector('#cc-bubble, #noir-whisper, #ew-whisper, #adaptive-thought, #pp-aenor-bubble, #pp-care-thread-toast, #pp-multirom-bubble');
  }

  function sceneActive() {
    return !!document.querySelector([
      '#mscard-root','#tp-root','#chp-page','#ms-encounter-root',
      '#mg-overlay','#mon-bundle-back','#settings-overlay:not(.hidden)',
      '#cinematic-overlay.visible','#event-overlay:not(.hidden)',
      '#gift-panel:not(.hidden)','#training-panel:not(.hidden)',
      '#dress-panel:not(.hidden)','#story-overlay:not(.hidden)',
      '#world-intro:not(.hidden)','#main-story-page:not(.hidden)',
      '#pp-onboarding-overlay'
    ].join(','));
  }

  function inCooldown() {
    const last = parseInt(lsGet(FLAG_LAST) || '0', 10) || 0;
    return Date.now() - last < COOLDOWN_MS;
  }

  // Pick the OTHER high-bond character to comment on. Prefer the highest.
  function pickOther(self) {
    const candidates = [];
    for (const c of CHARS) {
      if (c === self) continue;
      if (!isMet(c)) continue;
      const aff = getAff(c);
      if (aff < OTHER_MIN) continue;
      candidates.push({ c, aff });
    }
    if (!candidates.length) return null;
    // Weighted random: higher affection more likely, but everyone has a chance.
    candidates.sort((a, b) => b.aff - a.aff);
    // 60% pick the highest, 40% any of the rest
    if (candidates.length === 1 || Math.random() < 0.6) return candidates[0].c;
    const rest = candidates.slice(1);
    return rest[Math.floor(Math.random() * rest.length)].c;
  }

  function pickLine(self, other) {
    const bySelf = LINES[self];
    if (!bySelf) return null;
    const pool = bySelf[other];
    if (!pool || !pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('pp-multirom-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-multirom-styles';
    s.textContent = `
      #pp-multirom-bubble {
        position:fixed; top:80px; left:50%;
        transform:translateX(-50%) translateY(-12px);
        max-width:88vw; padding:12px 18px;
        font-family:inherit; font-size:13px; line-height:1.5;
        color:#ece2f6; font-style:italic;
        background:linear-gradient(180deg, rgba(22,16,40,0.90), rgba(38,22,56,0.84));
        border:1px solid rgba(170,140,225,0.34);
        border-radius:14px;
        box-shadow:0 10px 26px rgba(0,0,0,0.55), 0 0 22px rgba(150,110,210,0.20) inset;
        text-align:center; letter-spacing:0.2px;
        opacity:0; pointer-events:auto;
        z-index:9000;
        transition:opacity 540ms ease, transform 540ms ease;
        cursor:pointer; user-select:none;
      }
      #pp-multirom-bubble.show {
        opacity:1; transform:translateX(-50%) translateY(0);
      }
    `;
    document.head.appendChild(s);
  }

  let _showing = false;
  function show(html) {
    if (_showing) return;
    _showing = true;
    injectStyles();
    const el = document.createElement('div');
    el.id = 'pp-multirom-bubble';
    el.innerHTML = html;
    document.body.appendChild(el);
    // eslint-disable-next-line no-unused-expressions
    el.offsetHeight;
    el.classList.add('show');
    let auto = setTimeout(close, 8200);
    function close() {
      clearTimeout(auto);
      el.classList.remove('show');
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
        _showing = false;
      }, 580);
    }
    el.addEventListener('click', close, { once: true });
    el.addEventListener('touchstart', close, { once: true, passive: true });
    lsSet(FLAG_LAST, String(Date.now()));
    sessionMark();
  }

  function sessionMark() {
    try { sessionStorage.setItem(FLAG_SESSION, '1'); } catch (_) {}
  }
  function sessionFired() {
    try { return sessionStorage.getItem(FLAG_SESSION) === '1'; } catch (_) { return false; }
  }

  // ---------------------------------------------------------------------------
  // Tick
  // ---------------------------------------------------------------------------
  function tick() {
    if (!routeEnabled()) return;
    if (_showing) return;
    // QUIET FIRST HOUR: umbrella gate.
    if (window.PPAmbient && window.PPAmbient.firstHourBusy && window.PPAmbient.firstHourBusy()) return;
    if (sceneActive()) return;
    if (ambientBusy()) return;
    if (inCooldown()) return;
    if (sessionFired()) return; // at most once per session — these are big lines

    const self = currentChar();
    if (!self || !LINES[self]) return;
    if (getAff(self) < SELF_MIN) return;

    const other = pickOther(self);
    if (!other) return;

    const line = pickLine(self, other);
    if (line) show(line);
  }

  function boot() {
    setTimeout(() => {
      tick();
      setInterval(tick, POLL_MS);
    }, FIRST_DELAY_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // ---------------------------------------------------------------------------
  // Debug API
  // ---------------------------------------------------------------------------
  window.PPMultiRomance = {
    force(self, other) {
      const s = self || currentChar();
      if (!s) { alert('No character currently selected.'); return; }
      let o = other;
      if (!o) o = pickOther(s);
      if (!o) {
        // Try any other char with lines, ignoring bond requirement (debug only)
        const opts = Object.keys(LINES[s] || {});
        if (!opts.length) { alert('No multi-romance lines for ' + s); return; }
        o = opts[Math.floor(Math.random() * opts.length)];
      }
      const line = pickLine(s, o);
      if (line) show(line);
      else alert('No line for ' + s + ' \u2192 ' + o);
    },
    state() {
      const self = currentChar();
      const others = CHARS.filter(c => c !== self).map(c => ({ char: c, aff: getAff(c), met: isMet(c) }));
      return { self, selfAff: self ? getAff(self) : 0, others };
    },
    reset() {
      try {
        localStorage.removeItem(FLAG_LAST);
        sessionStorage.removeItem(FLAG_SESSION);
      } catch (_) {}
    }
  };
})();
