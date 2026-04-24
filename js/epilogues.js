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
          { type: 'line', text: 'The watch is lighter now. \u2014 You walk it with me, sometimes. \u2014 I sleep through most nights.', hold: 2600, cps: 26 },
          { type: 'line', text: 'I was ready to be the knight forever. \u2014 Then you. \u2014 I am still the knight. \u2014 I am just \u2014 not forever-alone about it anymore.', hold: 3000, cps: 26 },
          { type: 'flourish', text: '\u2726', duration: 1600 },
          { type: 'line', text: 'Come to the wall tonight, mi\u2019lady. \u2014 I will leave my cloak on the stone. \u2014 The one I said was spare.', hold: 2800, cps: 26 },
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
          { type: 'line', text: 'The kingdom sleeps properly again. \u2014 I have more hours than I know what to do with. \u2014 Most of them I spend not being alone. \u2014 With you.', hold: 3000, cps: 26 },
          { type: 'line', text: 'You did a hard thing. \u2014 Quietly. \u2014 You did not ask for thanks. \u2014 That is the knight\u2019s prayer. \u2014 I never thought I would hear it answered in your voice.', hold: 3200, cps: 26 },
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
          { type: 'line', text: 'I could not follow you. \u2014 I have stood at this gate since you walked the other way.', hold: 2800, cps: 26 },
          { type: 'line', text: 'I do not hate you for it. \u2014 I trained my whole life to keep the kingdom whole. \u2014 Tonight I am realising some of my training was to keep YOU whole. Too.', hold: 3200, cps: 26 },
          { type: 'flourish', text: '\u2726', duration: 1600 },
          { type: 'line', text: 'When you walk back \u2014 and you will, at least once \u2014 I will open the gate. \u2014 I am a knight. \u2014 It is what we do.', hold: 3000, cps: 26 },
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
          { type: 'line', text: 'The caves sing back again. \u2014 In my voice. In yours, sometimes. \u2014 I finished the song. \u2014 The third verse is ours.', hold: 2800, cps: 26 },
          { type: 'flourish', text: '\u266a', duration: 1600 },
          { type: 'line', text: 'There is a man in a tower I have never visited. \u2014 Bloodline like mine. \u2014 The staff hummed when his name was said yesterday. \u2014 One day I will walk to him. \u2014 I think you already know what I will find.', hold: 3600, cps: 26 },
          { type: 'line', text: 'Come down at tide. \u2014 I will sing the bridge. \u2014 Only the bridge. \u2014 You already know the rest.', hold: 2800, cps: 26 },
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
          { type: 'line', text: 'I sing full verses now. \u2014 The deep voice is gone. \u2014 I miss it, a little. \u2014 I do not tell anyone. Except you.', hold: 3000, cps: 26 },
          { type: 'line', text: 'I went back to the ruined town. \u2014 I stood in the square where my mother\u2019s people sang. \u2014 The stones remembered her. \u2014 I taught them her name.', hold: 3400, cps: 26 },
          { type: 'line', text: 'There is a chord in the third verse that keeps trying to answer him. \u2014 I have stopped singing it alone. \u2014 Sit with me when I try.', hold: 2800, cps: 26 },
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
          { type: 'line', text: 'He came to me before he went to you. \u2014 He knelt in my cave. \u2014 He said he had taught a young siren a song, six hundred years ago. \u2014 I hummed it back. \u2014 I had not known where the melody came from.', hold: 3600, cps: 26 },
          { type: 'line', text: 'He did not stay. \u2014 You had him first. \u2014 I did not mind. \u2014 I have the song now. \u2014 With an author. \u2014 That is rarer than a man who stays.', hold: 3400, cps: 26 },
          { type: 'line', text: 'Come down when the tide is high. \u2014 Sometimes I sing both parts. \u2014 I have had practice.', hold: 2800, cps: 26 },
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
          { type: 'line', text: 'The court learned a new word. \u2014 You. \u2014 It still cannot decide if you are trouble or salvation. I pour it more champagne so it stops asking.', hold: 3000, cps: 26 },
          { type: 'line', text: 'My grandmother sleeps in the east wing. \u2014 You made a seal that does not hurt. She looks \u2026 peaceful. \u2014 I visit her on Thursdays. I forgive her on the good ones.', hold: 3400, cps: 26 },
          { type: 'flourish', text: '\u266b', duration: 1600 },
          { type: 'line', text: 'Midnight. On the balcony. \u2014 I will wear something you will regret. \u2014 Do not be late. I have a kingdom to pretend to run.', hold: 2800, cps: 26 },
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
          { type: 'line', text: 'I abdicated. \u2014 Two weeks after the seal held. \u2014 The council was horrified. You laughed. That was the day I knew I had chosen right.', hold: 3000, cps: 26 },
          { type: 'line', text: 'My grandmother is beneath the stone now. With him. \u2014 Matched pair. \u2014 I do not visit. I do not know what I would say. I set a candle on the seal once a year. I think that is enough.', hold: 3600, cps: 26 },
          { type: 'line', text: 'We live now. \u2014 Smaller. On purpose. \u2014 I am writing a book no one will read. The true history of the Dynasty. \u2014 The one with its grandmother in it.', hold: 3200, cps: 26 },
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
          { type: 'line', text: 'He asked me, afterwards, if I was jealous. \u2014 I said yes. \u2014 He laughed. You let him laugh. \u2014 I wore the crown anyway. He likes me in it.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I buried my grandmother at Nocthera. \u2014 Corvin dug the grave himself. I stood with you. \u2014 Neither of us cried. We had six centuries of reason not to.', hold: 3600, cps: 26 },
          { type: 'line', text: 'We have all adjusted. \u2014 A kingdom, it turns out, is just a room full of people trying not to be lonely. \u2014 I am the politest version of that. \u2014 I am yours.', hold: 3000, cps: 26 },
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
          { type: 'line', text: 'The tower is loud now. \u2014 The good kind. \u2014 You and the prince argue at the desk. \u2014 I work in the margins. \u2014 It is my favourite configuration.', hold: 3000, cps: 26 },
          { type: 'line', text: 'I found her. \u2014 My sister. She sings in a cave past the coast. \u2014 She hummed a melody I had dreamed all my life without knowing where it came from. \u2014 We have tea on Thursdays. \u2014 Do not tell my father. \u2014 He does not deserve to know yet.', hold: 4000, cps: 26 },
          { type: 'flourish', text: '\u221e', duration: 1600 },
          { type: 'line', text: 'Bring tea tonight. \u2014 The second shelf is yours. \u2014 I moved my red shelf down. \u2026For reasons. \u2014 *pen-down, page facedown, looks up* \u2014 Come here.', hold: 3200, cps: 26 },
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
          { type: 'line', text: 'My equations went quiet. \u2014 I miss the leaking, a little. \u2014 I wrote you into the margins anyway \u2014 as the new variable. \u2014 The model likes you.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I archived the scorched page. Sealed box. Tower vault. \u2014 Not burned. Burning would be another erasure. I will not repeat that mistake.', hold: 3400, cps: 26 },
          { type: 'line', text: 'I walked the coast alone last Thursday. \u2014 I heard a woman singing. \u2014 I did not approach. \u2014 I will, one day. \u2014 When I am certain I can carry what I will find there.', hold: 3600, cps: 26 },
          { type: 'line', text: 'Come read the proof sometime. \u2014 It does not prove anything useful. \u2014 It just \u2026 factors you in at every line. \u2014 I needed you to see.', hold: 3000, cps: 26 },
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
          { type: 'line', text: 'The maths split in two. \u2014 One half screams. \u2014 The other half is calmer than it has been in decades. \u2014 I suspect that is him. \u2014 I suspect you suspect, too.', hold: 3200, cps: 26 },
          { type: 'line', text: 'I am co-authoring a new history with Corvin. \u2014 Both kingdoms, one record. \u2014 He dictates. I annotate. \u2014 He taught a siren a song six hundred years ago. \u2014 That siren was my sister\u2019s mother. \u2014 Our family tree has new branches. It is going to take me a while to draw it.', hold: 4000, cps: 26 },
          { type: 'line', text: 'I locked the tower again. \u2014 Then left the key under the mat for you. \u2014 I did not tell him about the key. \u2026Yet.', hold: 3000, cps: 26 },
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
          { type: 'line', text: 'I could not have you. You chose the others. \u2014 Hmm. \u2014 I am surprised how gently you still visit me.', hold: 2800, cps: 24 },
          { type: 'line', text: 'You call me Corvin now. \u2014 You are the only one. The first in six centuries. \u2014 I can hear it from across the room.', hold: 3200, cps: 22 },
          { type: 'flourish', text: '\u25a0', duration: 1700 },
          { type: 'line', text: 'I am trying to deserve it. \u2014 It is a new shape for me. I find I do not hate it. \u2014 Nocthera is ash. I, apparently, am not quite finished.', hold: 3200, cps: 22 },
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
          { type: 'line', text: 'You sealed me. \u2014 Of course you did. \u2014 Aethermoor\u2019s daughter sealed me once. Her grandchild\u2019s beloved seals me again. Hmm. Aesthetically consistent.', hold: 3400, cps: 22 },
          { type: 'line', text: 'I hear the others through the stone. They do not know I am listening. \u2014 Sometimes you come. You say my real name through the stone. \u2014 I hear it. It is enough.', hold: 3600, cps: 22 },
          { type: 'line', text: 'Nocthera is gone. Corvin is mostly gone. \u2014 He is a little less gone. Because of you.', hold: 2800, cps: 22 },
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
          { type: 'line', text: 'I have everything I wanted. \u2014 Hmm. \u2014 I do not know what to do with it.', hold: 2600, cps: 24 },
          { type: 'line', text: 'You call me Corvin in bed. Noir in public. \u2014 You keep both of me. You keep ALL of me. \u2014 Something even Veyra never managed.', hold: 3200, cps: 22 },
          { type: 'particles', count: 16, duration: 1800 },
          { type: 'flourish', text: '\u25a0', duration: 1800 },
          { type: 'line', text: 'You stay. \u2014 You stay anyway. \u2014 You stay anyway. \u2014 Six centuries of patience, and the thing I could not imagine \u2014 was someone staying. \u2014 Someone calling me by my name. \u2014 Not tonight. Tomorrow. Every morning after.', hold: 3800, cps: 22 },
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
