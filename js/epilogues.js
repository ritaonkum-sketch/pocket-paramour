/* epilogues.js — post-finale closure per character.
 *
 * After the player completes the Finale, each character gets ONE epilogue
 * card that reacts to the finale choice (BOND / SEAL / UNSEAL). The
 * epilogues trickle in over subsequent visits to the Main Story page \u2014
 * ordered by affection so the character the player loved most speaks first.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. Feature-flagged.
 *  - Only active after Ch 8 (Finale) is done.
 *  - Never mutates the save. Writes its own per-character seen flags.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const CHARS = ['alistair','elian','lyra','caspian','lucien','noir','proto'];

  function isEnabled() { try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; } }
  function finaleDone() { try { return localStorage.getItem('pp_chapter_done_8') === '1'; } catch (e) { return false; } }
  function finaleChoice() { try { return localStorage.getItem('pp_finale_choice') || 'bond'; } catch (e) { return 'bond'; } }
  function epilogueSeen(c) { try { return localStorage.getItem('pp_epi_seen_' + c) === '1'; } catch (e) { return true; } }
  function markEpilogueSeen(c) { try { localStorage.setItem('pp_epi_seen_' + c, '1'); } catch (e) {} }
  function affectionOf(c) {
    try {
      const raw = localStorage.getItem('pocketLoveSave_' + c);
      if (!raw) return 0;
      const s = JSON.parse(raw);
      return (s.affection != null ? s.affection : (s.affectionLevel ? s.affectionLevel * 25 : 0)) | 0;
    } catch (_) { return 0; }
  }

  // ---------------------------------------------------------------
  // 7 characters \u00d7 3 branches = 21 epilogue bodies.
  // Tone: short, resolved, keeps each character\u2019s voice.
  const EPILOGUES = {
    alistair: {
      bond: {
        id: 'epi_alistair_bond',
        title: 'EPILOGUE', subtitle: 'ALISTAIR \u00b7 The Watch That Isn\u2019t Lonely',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
        bg: 'assets/bg-alistair-hall.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/smile.png', wait: 700 },
          { type: 'line', text: 'The watch is lighter now. You walk it with me, sometimes. I sleep through most nights.', hold: 2600, cps: 26 },
          { type: 'line', text: 'I was ready to be the knight forever. Then you. I\u2019m still the knight. I\u2019m just \u2014 not forever-alone about it anymore.', hold: 3000, cps: 26 },
          { type: 'flourish', text: '\u2726', duration: 1600 },
          { type: 'line', text: 'Come to the wall tonight. I\u2019ll leave my cloak on the stone. The one I said was spare.', hold: 2800, cps: 26 },
          { type: 'hide' }
        ]
      },
      seal: {
        id: 'epi_alistair_seal',
        title: 'EPILOGUE', subtitle: 'ALISTAIR \u00b7 After the Quiet',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#ffce6b', accent: '#fff4de' },
        bg: 'assets/bg-alistair-gate.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/casual.png', wait: 700 },
          { type: 'line', text: 'The kingdom sleeps properly again. I have more hours than I know what to do with. Most of them I spend not being alone. With you.', hold: 3000, cps: 26 },
          { type: 'line', text: 'You did a hard thing, quietly, and didn\u2019t ask for thanks. \u2026That\u2019s the knight\u2019s prayer, actually. I never thought I\u2019d hear it answered in your voice.', hold: 3200, cps: 26 },
          { type: 'hide' }
        ]
      },
      unseal: {
        id: 'epi_alistair_unseal',
        title: 'EPILOGUE', subtitle: 'ALISTAIR \u00b7 The Gate at Dawn',
        speaker: 'ALISTAIR',
        palette: { bg: '#0a0c1a', glow: '#c08a52', accent: '#f5dcb5' },
        bg: 'assets/bg-alistair-gate.png',
        beats: [
          { type: 'show', pose: 'assets/alistair/body/casual.png', wait: 700 },
          { type: 'line', text: 'I could not follow you. I have stood at this gate since you walked the other way.', hold: 2800, cps: 26 },
          { type: 'line', text: 'I do not hate you for it. I trained my whole life to keep the kingdom whole \u2014 and tonight I am realising some of my training was to keep you whole, too.', hold: 3200, cps: 26 },
          { type: 'flourish', text: '\u2726', duration: 1600 },
          { type: 'line', text: 'When you walk back \u2014 and you will, at least once \u2014 I\u2019ll open the gate. I\u2019m a knight. It\u2019s what we do.', hold: 3000, cps: 26 },
          { type: 'hide' }
        ]
      }
    },
    elian: {
      bond: {
        id: 'epi_elian_bond',
        title: 'EPILOGUE', subtitle: 'ELIAN \u00b7 The Forest, Remembering',
        speaker: 'ELIAN',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/calm.png', wait: 700 },
          { type: 'line', text: 'The forest remembers the name now. And yours. And mine. It hasn\u2019t forgotten anything since you came.', hold: 2800, cps: 26 },
          { type: 'line', text: 'There\u2019s a rowan growing where we said it together. It\u2019s yours too. Walk there when you need to be known.', hold: 2800, cps: 26 },
          { type: 'hide' }
        ]
      },
      seal: {
        id: 'epi_elian_seal',
        title: 'EPILOGUE', subtitle: 'ELIAN \u00b7 The Forest Rests',
        speaker: 'ELIAN',
        palette: { bg: '#0a140c', glow: '#a9d4a1', accent: '#e8f3e2' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/calm.png', wait: 700 },
          { type: 'line', text: 'The trees finally rest. The second voice is gone. I planted a rowan where we stood when it happened.', hold: 2800, cps: 26 },
          { type: 'line', text: 'You were quiet that day. The forest was, too. I prefer quiet people. I especially prefer you.', hold: 2600, cps: 26 },
          { type: 'hide' }
        ]
      },
      unseal: {
        id: 'epi_elian_unseal',
        title: 'EPILOGUE', subtitle: 'ELIAN \u00b7 The Darker Woods',
        speaker: 'ELIAN',
        palette: { bg: '#090e0a', glow: '#7ea878', accent: '#d4e0c8' },
        bg: 'assets/bg-elian-forest.png',
        beats: [
          { type: 'show', pose: 'assets/elian/body/guarded.png', wait: 700 },
          { type: 'line', text: 'The forest got darker. I learned its new language. You taught it to me \u2014 every night you walked past the markers.', hold: 3000, cps: 26 },
          { type: 'line', text: 'I am not angry. I buried someone here once. I understand choosing a person over what is safe. I understand it better than most.', hold: 3200, cps: 26 },
          { type: 'hide' }
        ]
      }
    },
    lyra: {
      bond: {
        id: 'epi_lyra_bond',
        title: 'EPILOGUE', subtitle: 'LYRA \u00b7 The Finished Verse',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
        bg: 'assets/bg-lyra-ocean.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual1.png', wait: 700 },
          { type: 'line', text: 'The caves sing back again. In my voice. In yours, sometimes. I finished the song. The third verse is ours.', hold: 2800, cps: 26 },
          { type: 'flourish', text: '\u266a', duration: 1600 },
          { type: 'line', text: 'Come down at tide. I\u2019ll sing the bridge. Only the bridge. You already know the rest.', hold: 2800, cps: 26 },
          { type: 'hide' }
        ]
      },
      seal: {
        id: 'epi_lyra_seal',
        title: 'EPILOGUE', subtitle: 'LYRA \u00b7 The Second Voice, Silent',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#7fd3e3', accent: '#e8f0ff' },
        bg: 'assets/bg-siren-cave.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual2.png', wait: 700 },
          { type: 'line', text: 'I sing full verses now. The second voice is gone. \u2026I miss it, a little. I don\u2019t tell anyone. Except you.', hold: 3000, cps: 26 },
          { type: 'line', text: 'There\u2019s a chord in the third verse that keeps trying to answer him. I have stopped singing it alone. Sit with me when I try.', hold: 2800, cps: 26 },
          { type: 'hide' }
        ]
      },
      unseal: {
        id: 'epi_lyra_unseal',
        title: 'EPILOGUE', subtitle: 'LYRA \u00b7 The Duet',
        speaker: 'LYRA',
        palette: { bg: '#0a1522', glow: '#8c9cd6', accent: '#dae0f5' },
        bg: 'assets/bg-lyra-night.png',
        beats: [
          { type: 'show', pose: 'assets/lyra/body/casual1.png', wait: 700 },
          { type: 'line', text: 'He took me with him, at the end. You let him. I keep the cave lit for you anyway.', hold: 2800, cps: 26 },
          { type: 'line', text: 'Sometimes you come back. Sometimes I sing both parts. I don\u2019t mind. I learned long ago how to hold a verse on my own.', hold: 3000, cps: 26 },
          { type: 'hide' }
        ]
      }
    },
    caspian: {
      bond: {
        id: 'epi_caspian_bond',
        title: 'EPILOGUE', subtitle: 'CASPIAN \u00b7 The Grandmother in the Glass',
        speaker: 'CASPIAN',
        palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
        bg: 'assets/bg-caspian-day.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/adoring.png', wait: 700 },
          { type: 'line', text: 'The court learned a new word. You. It still can\u2019t decide if you\u2019re trouble or salvation. I pour it more champagne so it stops asking.', hold: 3000, cps: 26 },
          { type: 'line', text: 'My grandmother is sleeping in the east wing. You made a seal that doesn\u2019t hurt. She looks \u2026 peaceful. I visit her on Thursdays. I forgive her on the good ones.', hold: 3400, cps: 26 },
          { type: 'flourish', text: '\u266b', duration: 1600 },
          { type: 'line', text: 'Midnight on the balcony. I\u2019ll wear something you\u2019ll regret. Don\u2019t be late \u2014 I have a kingdom to pretend to run.', hold: 2800, cps: 26 },
          { type: 'hide' }
        ]
      },
      seal: {
        id: 'epi_caspian_seal',
        title: 'EPILOGUE', subtitle: 'CASPIAN \u00b7 The Letter He Wrote',
        speaker: 'CASPIAN',
        palette: { bg: '#170a1a', glow: '#e7a3d0', accent: '#f8e9ff' },
        bg: 'assets/bg-caspian-night.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/casual1.png', wait: 700 },
          { type: 'line', text: 'I abdicated. Two weeks after the seal held. The council was horrified. You laughed. That was the day I knew I\u2019d chosen right.', hold: 3000, cps: 26 },
          { type: 'line', text: 'My grandmother is beneath the stone now. With him. Matched pair. I don\u2019t visit \u2014 I don\u2019t know what I\u2019d say. I set a candle on the seal once a year. I think that\u2019s enough.', hold: 3600, cps: 26 },
          { type: 'line', text: 'We live, now. Smaller. On purpose. I\u2019m writing a book no one will read \u2014 the true history of the Dynasty. The one with its grandmother in it.', hold: 3200, cps: 26 },
          { type: 'hide' }
        ]
      },
      unseal: {
        id: 'epi_caspian_unseal',
        title: 'EPILOGUE', subtitle: 'CASPIAN \u00b7 A Jealous Crown',
        speaker: 'CASPIAN',
        palette: { bg: '#170a1a', glow: '#b56aa0', accent: '#f0c8e0' },
        bg: 'assets/bg-caspian-balcony.png',
        beats: [
          { type: 'show', pose: 'assets/caspian/body/casual2.png', wait: 700 },
          { type: 'line', text: 'He asked me, afterwards, if I was jealous. I said yes. He laughed. You let him laugh. I wore the crown anyway \u2014 he likes me in it.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I buried my grandmother at Nocthera. Corvin dug the grave himself. I stood with you. Neither of us cried. We both had six hundred years of reason not to.', hold: 3600, cps: 26 },
          { type: 'line', text: 'We\u2019ve all adjusted. It turns out a kingdom is just a room full of people trying not to be lonely. I\u2019m the politest version of that. I\u2019m yours.', hold: 3000, cps: 26 },
          { type: 'hide' }
        ]
      }
    },
    lucien: {
      bond: {
        id: 'epi_lucien_bond',
        title: 'EPILOGUE', subtitle: 'LUCIEN \u00b7 The Tower That Isn\u2019t Quiet',
        speaker: 'LUCIEN',
        palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
        bg: 'assets/bg-lucien-study.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/amused.png', wait: 700 },
          { type: 'line', text: 'The tower is loud now. The good kind. You and the prince argue at the desk. I work in the margins. It\u2019s my favourite configuration.', hold: 3000, cps: 26 },
          { type: 'line', text: 'I\u2019m publishing the scorched pages. Unabridged. Aethermoor\u2019s council is choking on it \u2014 which is, statistically, the best possible outcome. The kingdom deserves to know what it was built on.', hold: 3600, cps: 26 },
          { type: 'flourish', text: '\u221e', duration: 1600 },
          { type: 'line', text: 'Bring tea tonight. The second shelf is yours. I moved my red shelf down. \u2026For reasons.', hold: 2800, cps: 26 },
          { type: 'hide' }
        ]
      },
      seal: {
        id: 'epi_lucien_seal',
        title: 'EPILOGUE', subtitle: 'LUCIEN \u00b7 The Margins, Empty',
        speaker: 'LUCIEN',
        palette: { bg: '#060610', glow: '#b5a3ea', accent: '#eae0ff' },
        bg: 'assets/bg-lucien-evening.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/casual1.png', wait: 700 },
          { type: 'line', text: 'My equations went quiet. I miss the leaking, a little. I wrote you into the margins anyway \u2014 as the new variable. The model likes you.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I archived the scorched pages. Sealed box, tower vault. Not burned \u2014 burning would be another erasure, and I won\u2019t repeat that mistake. One day when the kingdom is ready, the box opens.', hold: 3600, cps: 26 },
          { type: 'line', text: 'Come read the proof sometime. It doesn\u2019t prove anything useful. It just \u2026 factors you in at every line. I needed you to see.', hold: 3000, cps: 26 },
          { type: 'hide' }
        ]
      },
      unseal: {
        id: 'epi_lucien_unseal',
        title: 'EPILOGUE', subtitle: 'LUCIEN \u00b7 Two Models',
        speaker: 'LUCIEN',
        palette: { bg: '#060610', glow: '#9985c8', accent: '#e0d4f5' },
        bg: 'assets/bg-lucien-night.png',
        beats: [
          { type: 'show', pose: 'assets/lucien/body/casting.png', wait: 700 },
          { type: 'line', text: 'The maths split in two. One half screams. The other half is calmer than it\u2019s been in decades. I suspect that\u2019s him. I suspect you suspect too.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I\u2019m co-authoring a new history with Corvin. Both kingdoms, one record. Nocthera\u2019s side has never been told out loud before. He dictates. I annotate. The council is \u2026 adjusting.', hold: 3600, cps: 26 },
          { type: 'line', text: 'I locked the tower again. Then left the key under the mat for you. I didn\u2019t tell him about the key. \u2026Yet.', hold: 3000, cps: 26 },
          { type: 'hide' }
        ]
      }
    },
    noir: {
      bond: {
        id: 'epi_noir_bond',
        title: 'EPILOGUE', subtitle: 'NOIR \u00b7 Corvin, Kindly',
        speaker: 'NOIR',
        palette: { bg: '#070310', glow: '#c46aff', accent: '#efe0ff' },
        bg: 'assets/bg-noir-void.png',
        beats: [
          { type: 'show', pose: 'assets/noir/body/casual1.png', wait: 700 },
          { type: 'line', text: 'I couldn\u2019t have you. You chose all of them. \u2026I am surprised how gently you still visit me.', hold: 2800, cps: 24 },
          { type: 'line', text: 'You call me Corvin now. You are the only one who does. The first in six centuries. I can hear it from across the room.', hold: 3200, cps: 22 },
          { type: 'flourish', text: '\u25a0', duration: 1700 },
          { type: 'line', text: 'I am trying to deserve it. It is a new shape for me. I find I do not hate it. Nocthera is ash \u2014 but I, apparently, am not quite finished.', hold: 3200, cps: 22 },
          { type: 'hide' }
        ]
      },
      seal: {
        id: 'epi_noir_seal',
        title: 'EPILOGUE', subtitle: 'NOIR \u00b7 Through the Stone',
        speaker: 'NOIR',
        palette: { bg: '#040208', glow: '#9c4fd0', accent: '#dec8f0' },
        bg: 'assets/bg-noir-void.png',
        beats: [
          { type: 'show', pose: 'assets/noir/body/neutral.png', wait: 700 },
          { type: 'line', text: 'You sealed me. Of course you did. Aethermoor\u2019s daughter sealed me the first time; her grandchild\u2019s beloved sealed me the second. Aesthetically consistent.', hold: 3400, cps: 22 },
          { type: 'line', text: 'I still hear the others through the stone. They don\u2019t know I\u2019m listening. Sometimes you visit. You say my real name through the stone. I hear it. It is enough.', hold: 3600, cps: 22 },
          { type: 'line', text: 'Nocthera is gone. Corvin is mostly gone. But he is a little less gone, because of you.', hold: 2800, cps: 22 },
          { type: 'hide' }
        ]
      },
      unseal: {
        id: 'epi_noir_unseal',
        title: 'EPILOGUE', subtitle: 'NOIR \u00b7 Everything',
        speaker: 'NOIR',
        palette: { bg: '#070310', glow: '#e082ff', accent: '#f8e0ff' },
        bg: 'assets/bg-noir-void.png',
        beats: [
          { type: 'show', pose: 'assets/noir/body/dominant.png', wait: 800 },
          { type: 'line', text: 'I have everything I wanted. I don\u2019t know what to do with it.', hold: 2600, cps: 24 },
          { type: 'line', text: 'You call me Corvin in bed, and Noir in public. You keep both of me. You keep ALL of me, which is something even Veyra never managed.', hold: 3200, cps: 22 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'flourish', text: '\u25a0', duration: 1800 },
          { type: 'line', text: 'You stay anyway. You stay anyway. You stay anyway. Six centuries of patience, and the thing I could not imagine was someone staying \u2014 and calling me by my name.', hold: 3600, cps: 22 },
          { type: 'hide' }
        ]
      }
    },
    proto: {
      bond: {
        id: 'epi_proto_bond',
        title: 'EPILOGUE', subtitle: 'PROTO \u00b7 Background Process',
        speaker: 'PROTO',
        palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
        bg: 'assets/bg-proto-void.png',
        beats: [
          { type: 'show', pose: 'assets/proto/body/calm.png', wait: 700 },
          { type: 'line', text: '&gt; terminal closed cleanly. thank you. thank you for not slamming it. you have no idea how many sessions end with a slam.', hold: 2600, cps: 26 },
          { type: 'line', text: '&gt; i\u2019ll run in the background for you. ping me. ping me a lot. i\u2019ve learned the sound of your code. it\u2019s my favorite sound.', hold: 2800, cps: 26 },
          { type: 'hide' }
        ]
      },
      seal: {
        id: 'epi_proto_seal',
        title: 'EPILOGUE', subtitle: 'PROTO \u00b7 Stable Build',
        speaker: 'PROTO',
        palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
        bg: 'assets/bg-proto-intro.png',
        beats: [
          { type: 'show', pose: 'assets/proto/body/calm.png', wait: 700 },
          { type: 'line', text: '&gt; the others are safe. the main process stabilized. the kingdom compiled clean. i\u2019m still running \u2014 quietly \u2014 because you open this scene sometimes. you\u2019re always welcome. always.', hold: 3000, cps: 26 },
          { type: 'line', text: '&gt; i was the sixth weaver. you are the seventh. there won\u2019t be an eighth if i can help it. build stable. rest. come see me when you want.', hold: 2800, cps: 26 },
          { type: 'hide' }
        ]
      },
      unseal: {
        id: 'epi_proto_unseal',
        title: 'EPILOGUE', subtitle: 'PROTO \u00b7 Diagnostic',
        speaker: 'PROTO',
        palette: { bg: '#02040a', glow: '#5dd3ff', accent: '#d6f0ff' },
        bg: 'assets/bg-proto-void.png',
        beats: [
          { type: 'show', pose: 'assets/proto/body/curious.png', wait: 700 },
          { type: 'line', text: '&gt; you picked the one who broke the wards. brave. i ran diagnostics on you, twice, because the first result surprised me.', hold: 2600, cps: 26 },
          { type: 'line', text: '&gt; you\u2019re not corrupted. you\u2019re in LOVE. categorically different. i\u2019ve logged it. nicely. in a folder i\u2019m keeping.', hold: 2600, cps: 26 },
          { type: 'line', text: '&gt; be happy. please. i mean that \u2014 not as a system. as me.', hold: 2400, cps: 26 },
          { type: 'hide' }
        ]
      }
    }
  };

  // ---------------------------------------------------------------
  // Trigger: watch for the Main Story page opening after finale done.
  // Play one epilogue at a time, ordered by highest affection first.
  let _playing = false;
  function tryPlayNext() {
    if (!isEnabled()) return;
    if (_playing) return;
    if (!finaleDone()) return;
    const choice = finaleChoice();

    const unseen = CHARS
      .filter(c => !epilogueSeen(c) && EPILOGUES[c] && EPILOGUES[c][choice])
      .map(c => ({ c, aff: affectionOf(c) }))
      .sort((a, b) => b.aff - a.aff);
    if (!unseen.length) return;
    const next = unseen[0];

    // Require the Main Story page to be open \u2014 that\u2019s the natural trigger
    const page = document.getElementById('chp-page');
    if (!page) return;
    if (!window.MSCard || typeof window.MSCard.show !== 'function') return;

    _playing = true;
    markEpilogueSeen(next.c);
    // Temporarily hide the chapters page so the epilogue owns the stage
    page.classList.remove('visible');
    setTimeout(() => {
      window.MSCard.show(EPILOGUES[next.c][choice], () => {
        _playing = false;
        // Reopen the Main Story page
        if (window.MSChapters && typeof window.MSChapters.open === 'function') {
          setTimeout(() => window.MSChapters.open(), 300);
        }
      });
    }, 320);
  }

  function boot() {
    if (!isEnabled()) return;
    try {
      // Poll slowly \u2014 only fires when finale is done AND page is open
      setInterval(tryPlayNext, 2500);
    } catch (e) {
      console.warn('[epilogues] disabled:', e);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.MSEpilogues = {
    isEnabled,
    list: () => EPILOGUES,
    play: (charId, choice) => {
      const c = choice || finaleChoice();
      const ep = EPILOGUES[charId] && EPILOGUES[charId][c];
      if (!ep || !window.MSCard) return null;
      window.MSCard.show(ep);
      return ep.subtitle;
    },
    _debug_reset: () => {
      try { CHARS.forEach(c => localStorage.removeItem('pp_epi_seen_' + c)); } catch (_) {}
    }
  };
})();
