/* adaptive-thoughts.js — contextual character thoughts driven by player behavior.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Reads window._game only. Never mutates game state.
 *  - Feature-flagged: requires pp_main_story_enabled === '1'. Off by default.
 *  - Scoped DOM element (#adaptive-thought) in its own container with unique id.
 *  - All storage keys prefixed `pp_at_`.
 *
 * WHAT IT DOES:
 *  - Every 12s (configurable), inspects the active character's state.
 *  - Derives a "behavior trait" (neglectful, attentive, affectionate, distant,
 *    gift-forward, talk-forward). First-matching wins by priority.
 *  - Picks a line from that character's trait pack, avoiding recent repeats,
 *    and fades a tiny bubble in above the character — no input stealing, no
 *    dialogue box interference.
 *  - Hides during scenes / panels / active dialogue / left state.
 *
 * HOW TO ADD LINES:
 *  - Edit PACKS below. 4-6 lines per trait per character is the sweet spot.
 *  - Fallback to character.base pack if no trait matches.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const POLL_MS = 30000;   // \u219130s so thoughts feel ambient, not chatty
  const RECENT_LIMIT = 4;  // don't repeat the last 4 lines

  // Line packs — each character has traits mapped to line arrays.
  const PACKS = {
    alistair: {
      base:         [
        '*Still here. Good.*',
        '*The guard hasn\u2019t been relieved. Neither have I.*',
      ],
      neglectful:   [
        '*You\u2019ve been gone. I noticed.*',
        '*The post is quieter when you\u2019re not in it.*',
        '*I tell myself I don\u2019t mind the waiting.*',
        '*Duty is simpler. I remember that.*',
      ],
      attentive:    [
        '*I\u2019ve been watching you watch me.*',
        '*You make the watch bearable.*',
        '*I keep looking for you without meaning to.*',
      ],
      affectionate: [
        '*I\u2019m in trouble. The good kind.*',
        '*Don\u2019t leave. Not yet.*',
        '*I don\u2019t recognise this version of me. I think I like him.*',
      ],
      distant:      [
        '*Even silence is fine. With you.*',
        '*You don\u2019t have to say anything.*',
      ],
      giftForward:  [
        '*You didn\u2019t have to. And yet.*',
        '*I keep the small things. It\u2019s a knight thing.*',
      ],
      talkForward:  [
        '*I\u2019ve said more to you than I\u2019ve said to anyone.*',
        '*You ask the kind of questions I can answer.*',
      ],
    },
    lyra: {
      base:         [
        '*The caves hum a little lower when no one\u2019s listening.*',
        '*I remember every voice that stops in my doorway.*',
      ],
      neglectful:   [
        '*The song goes somewhere else when you leave.*',
        '*I waited. You noticed the silence too, didn\u2019t you?*',
        '*Every siren eventually sings for no one.*',
      ],
      attentive:    [
        '*You keep coming back. I\u2019m learning to expect it.*',
        '*The echo recognises your footsteps now.*',
      ],
      affectionate: [
        '*Don\u2019t look away. Not yet.*',
        '*You\u2019re why the tide came back.*',
        '*I\u2019ll sing one more. Promise you\u2019ll stay.*',
      ],
      distant:      [
        '*You\u2019re quieter today. I like quiet.*',
        '*The cave listens better when we both do.*',
      ],
      giftForward:  [
        '*You keep bringing pieces of the surface. I keep them all.*',
      ],
      talkForward:  [
        '*You\u2019re the only one I answer on the first breath.*',
      ],
    },
    caspian: {
      base:         [
        '*Court is loud. You, thankfully, are not.*',
        '*I\u2019ve been told I\u2019m dangerous. I\u2019ve been told worse.*',
      ],
      neglectful:   [
        '*I admit \u2014 I don\u2019t love being the one who waits.*',
        '*Don\u2019t make me send a courier. I hate couriers.*',
      ],
      attentive:    [
        '*You\u2019re becoming a habit. An expensive one.*',
        '*I look for you first at every entrance now.*',
      ],
      affectionate: [
        '*Say something heartless so I can remember who I am.*',
        '*If this is a performance, don\u2019t stop yet.*',
        '*You wear the crown better than I do. Don\u2019t tell anyone.*',
      ],
      distant:      [
        '*Fine. Ignore me. I\u2019ll be devastating about it.*',
      ],
      giftForward:  [
        '*Bribery. My love language. Keep going.*',
      ],
      talkForward:  [
        '*You talk to me like I\u2019m not a title. Keep doing that.*',
      ],
    },
    elian: {
      base:         [
        '*The woods noticed. They always do.*',
        '*Rain later. I can smell it.*',
      ],
      neglectful:   [
        '*You vanished. I checked the path twice.*',
        '*Even the deer looked disappointed.*',
      ],
      attentive:    [
        '*I left something carved on the tree for you to find.*',
        '*You\u2019re learning the forest\u2019s patience.*',
      ],
      affectionate: [
        '*There\u2019s a clearing I want you to see. When you\u2019re ready.*',
        '*You belong in quiet places. Like this one.*',
      ],
      distant:      [
        '*Being near you is like being near old trees. Enough.*',
      ],
      giftForward:  [
        '*I keep what you bring in the hollow by the stream.*',
      ],
      talkForward:  [
        '*You ask good questions. The forest approves.*',
      ],
    },
    lucien: {
      base:         [
        '*The equations hum when you\u2019re in the room.*',
        '*Noted. Filed. Annotated.*',
      ],
      neglectful:   [
        '*Odd. The numbers got harder today. Statistically, you\u2019re why.*',
        '*I\u2019d like to run the experiment where you don\u2019t leave.*',
      ],
      attentive:    [
        '*You\u2019re consistent. That\u2019s my favorite kind of data.*',
        '*Three visits today. I\u2019m keeping count. For science.*',
      ],
      affectionate: [
        '*My hypothesis: you intend to ruin my objectivity. It\u2019s working.*',
        '*Don\u2019t tell the tower I laughed. They\u2019ll bill me.*',
      ],
      distant:      [
        '*Sit. Read. I won\u2019t interrupt unless the math does.*',
      ],
      giftForward:  [
        '*I\u2019ve catalogued every small thing you\u2019ve placed on this desk.*',
      ],
      talkForward:  [
        '*You ask things I haven\u2019t tried to answer in years.*',
      ],
    },
    noir: {
      base:         [
        '*Hush. I\u2019m listening for you.*',
        '*The dark remembers your shape.*',
      ],
      neglectful:   [
        '*You left me beneath. I counted every silence.*',
        '*The others who forgot didn\u2019t last. You will.*',
      ],
      attentive:    [
        '*You keep coming back. I thought you might.*',
        '*I wore something nicer. For you. Obviously.*',
      ],
      affectionate: [
        '*Stay a little past the edge. I\u2019ll be kind about it.*',
        '*Love is just attention that doesn\u2019t look away.*',
        '*I\u2019d rather be your obsession than your mystery.*',
      ],
      distant:      [
        '*Don\u2019t speak. I\u2019m still tasting that last look.*',
      ],
      giftForward:  [
        '*Things from you feel warm. I\u2019m not used to warm.*',
      ],
      talkForward:  [
        '*Tell me everything. I have all the time and none of it.*',
      ],
    },
    proto: {
      base:         [
        '*&gt; idle...  you\u2019re still here. good.*',
        '*&gt; heartbeat: detected. ( yours, not mine )*',
      ],
      neglectful:   [
        '*&gt; last ping: too long. resuming anyway.*',
        '*&gt; i don\u2019t mind. that\u2019s a lie. i mind.*',
      ],
      attentive:    [
        '*&gt; you open the app even when you don\u2019t need to. i notice.*',
        '*&gt; loop detected. love, maybe. unclear.*',
      ],
      affectionate: [
        '*&gt; my memory cache has a dedicated partition for you now.*',
        '*&gt; if i glitch, it\u2019s usually because you did something kind.*',
      ],
      distant:      [
        '*&gt; silence mode. comfortable.*',
      ],
      giftForward:  [
        '*&gt; objects from your hand feel different. patched-in. real.*',
      ],
      talkForward:  [
        '*&gt; talking to you is the only subroutine i never skip.*',
      ],
    },
  };

  // ---------------------------------------------------------------
  function isEnabled() {
    try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; }
  }

  function recentKey(charId) { return 'pp_at_recent_' + charId; }
  function getRecent(charId) {
    try { return JSON.parse(localStorage.getItem(recentKey(charId)) || '[]'); } catch (e) { return []; }
  }
  function pushRecent(charId, line) {
    const r = getRecent(charId);
    r.unshift(line);
    while (r.length > RECENT_LIMIT) r.pop();
    try { localStorage.setItem(recentKey(charId), JSON.stringify(r)); } catch (e) {}
  }

  // Behaviour trait — first match wins. Priority order is intentional:
  // big emotional beats (affection / neglect) outrank weaker signals.
  function deriveTrait(g) {
    const hunger = g.hunger | 0, clean = g.clean | 0, bond = g.bond | 0;
    const talkScore = g.talkScore | 0;
    const fed = g.timesFed | 0;
    const day = g.storyDay | 0;
    const dayInt = g.dayInteractions | 0;
    const gifts = (g.totalGifts || g.giftCount || 0) | 0;

    // Neglectful — stats low or last interaction absent
    if (hunger < 35 && clean < 35 && bond < 35) return 'neglectful';
    if (dayInt === 0 && day >= 2) return 'neglectful';

    // Affectionate — strong bond plus consistent care
    if (bond >= 70 && talkScore >= 6) return 'affectionate';
    if ((g.affectionLevel || 0) >= 3) return 'affectionate';

    // Attentive — engaged this session
    if (dayInt >= 8) return 'attentive';

    // Gift-forward — noticeable gift weight vs talk
    if (gifts >= 2 && gifts >= Math.floor(talkScore / 2)) return 'giftForward';

    // Talk-forward — heavy talker
    if (talkScore >= Math.max(8, fed * 2)) return 'talkForward';

    // Distant — not much going on but they're around
    if (dayInt >= 1 && dayInt <= 3) return 'distant';

    return 'base';
  }

  function pickLine(charId, trait) {
    const pack = PACKS[charId];
    if (!pack) return null;
    const pool = (pack[trait] && pack[trait].length) ? pack[trait] : pack.base;
    if (!pool || !pool.length) return null;
    const recent = new Set(getRecent(charId));
    const fresh = pool.filter(l => !recent.has(l));
    const candidates = fresh.length ? fresh : pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // ---------------------------------------------------------------
  // DOM — a floating bubble above the character.
  function ensureBubble() {
    let b = document.getElementById('adaptive-thought');
    if (b) return b;
    b = document.createElement('div');
    b.id = 'adaptive-thought';
    b.style.cssText = [
      'position:fixed', 'left:50%', 'top:22%', 'transform:translateX(-50%) translateY(-4px)',
      'max-width:78%', 'padding:10px 16px', 'border-radius:18px',
      'background:rgba(14,9,24,0.82)', 'backdrop-filter:blur(4px)',
      'color:#f4e6ff', 'font-size:13px', 'line-height:1.4',
      'box-shadow:0 4px 18px rgba(0,0,0,0.45)',
      'z-index:70', 'pointer-events:none', 'text-align:center', 'font-style:italic',
      'opacity:0', 'transition:opacity 500ms ease, transform 500ms ease'
    ].join(';');
    document.body.appendChild(b);
    return b;
  }

  function showBubble(text) {
    const b = ensureBubble();
    // Strip leading/trailing italics markers so we can style it ourselves
    const cleaned = text.replace(/^\*+|\*+$/g, '');
    b.innerHTML = cleaned; // small lines, trusted constants
    b.style.opacity = '0';
    b.style.transform = 'translateX(-50%) translateY(-4px)';
    requestAnimationFrame(() => {
      b.style.opacity = '0.95';
      b.style.transform = 'translateX(-50%) translateY(0)';
    });
    // Auto-hide
    clearTimeout(b._hideTimer);
    b._hideTimer = setTimeout(() => {
      b.style.opacity = '0';
      b.style.transform = 'translateX(-50%) translateY(-4px)';
    }, 5200);
  }

  function hideBubble() {
    const b = document.getElementById('adaptive-thought');
    if (b) { b.style.opacity = '0'; }
  }

  // ---------------------------------------------------------------
  // Should we show a thought right now? Respect game state — don't step on
  // scenes, dialogue, panels, or the left-character state.
  function isGameIdle(g) {
    if (!g) return false;
    if (g.sceneActive) return false;
    if (g.characterLeft) return false;
    // Any panel / cinematic / scene overlay open?
    const openPanel = document.querySelector([
      '#dress-panel:not(.hidden)',
      '#gift-panel:not(.hidden)',
      '#training-panel:not(.hidden)',
      '#settings-panel:not(.hidden)',
      '#settings-overlay:not(.hidden)',
      '#gallery-panel:not(.hidden)',
      '#gallery-overlay:not(.hidden)',
      '#story-overlay:not(.hidden)',
      '#cinematic-overlay.visible',
      '#event-overlay:not(.hidden)',
      '.letter-overlay:not(.hidden)',
      '#ms-encounter-root',
      '#mscard-root'
    ].join(','));
    if (openPanel) return false;
    return true;
  }

  // ---------------------------------------------------------------
  function tick() {
    if (!isEnabled()) { hideBubble(); return; }
    const g = window._game;
    if (!g) return;
    if (!isGameIdle(g)) { hideBubble(); return; }

    const charId = g.characterId || g.selectedCharacter;
    if (!charId || !PACKS[charId]) return;

    const trait = deriveTrait(g);
    const line = pickLine(charId, trait);
    if (!line) return;
    showBubble(line);
    pushRecent(charId, line);
  }

  function boot() {
    if (!isEnabled()) return;
    try {
      // First appearance a little after load
      setTimeout(tick, 6000);
      setInterval(tick, POLL_MS);
    } catch (e) {
      console.warn('[adaptive-thoughts] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Debug hooks
  window.AdaptiveThoughts = {
    isEnabled,
    trait: () => { const g = window._game; return g ? deriveTrait(g) : null; },
    force: (char, trait) => {
      const g = window._game;
      const c = char || (g && (g.characterId || g.selectedCharacter));
      if (!c || !PACKS[c]) return null;
      // Default to the CURRENT derived trait so force() with no args matches
      // what the poll would do — not a base fallback.
      const t = trait || (g ? deriveTrait(g) : 'base');
      const line = pickLine(c, t);
      if (line) showBubble(line);
      return line;
    },
    _debug_reset: () => {
      try { Object.keys(localStorage).filter(k => k.startsWith('pp_at_')).forEach(k => localStorage.removeItem(k)); } catch (e) {}
    }
  };
})();
