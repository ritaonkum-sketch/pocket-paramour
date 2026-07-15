// Puzzle Training System — Lucien's unique training mechanic
// Replaces physical training (sword/singing) with mental puzzles

class PuzzleSystem {
    constructor(game) {
        this.game = game;
        this.puzzlesMastered = 0;
    }

    // ── Logic Puzzle: Simon Says with arcane symbols ─────────────
    playLogicPuzzle(container, onComplete) {
        const symbols = ['\u2660', '\u2666', '\u2663', '\u2665', '\u2736', '\u262F'];
        const seqLength = Math.min(3 + Math.floor(this.puzzlesMastered / 5), 7);
        const sequence = [];
        for (let i = 0; i < seqLength; i++) {
            sequence.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }

        container.innerHTML = `
            <div class="puzzle-title">Logic Sequence</div>
            <div class="puzzle-hint">Watch, then repeat</div>
            <div class="puzzle-display" id="puzzle-display"></div>
            <div class="puzzle-buttons" id="puzzle-buttons"></div>
        `;

        const display = container.querySelector('#puzzle-display');
        const buttons = container.querySelector('#puzzle-buttons');

        // Show sequence
        let showIndex = 0;
        buttons.style.pointerEvents = 'none';
        buttons.style.opacity = '0.4';

        // Create symbol buttons
        symbols.forEach(sym => {
            const btn = document.createElement('button');
            btn.className = 'puzzle-btn';
            btn.textContent = sym;
            btn.dataset.symbol = sym;
            buttons.appendChild(btn);
        });

        const showNext = () => {
            if (showIndex < sequence.length) {
                display.textContent = sequence[showIndex];
                display.classList.add('puzzle-flash');
                setTimeout(() => display.classList.remove('puzzle-flash'), 400);
                showIndex++;
                setTimeout(showNext, 700);
            } else {
                display.textContent = '?';
                buttons.style.pointerEvents = 'all';
                buttons.style.opacity = '1';
                this._handleLogicInput(container, buttons, sequence, onComplete);
            }
        };
        setTimeout(showNext, 500);
    }

    _handleLogicInput(container, buttons, sequence, onComplete) {
        let inputIndex = 0;
        const display = container.querySelector('#puzzle-display');

        buttons.querySelectorAll('.puzzle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.symbol === sequence[inputIndex]) {
                    // Correct
                    display.textContent = btn.dataset.symbol;
                    display.classList.add('puzzle-correct');
                    setTimeout(() => display.classList.remove('puzzle-correct'), 300);
                    sounds.pop();
                    inputIndex++;
                    if (inputIndex >= sequence.length) {
                        this.puzzlesMastered++;
                        this._showResult(container, true, 'logic', onComplete);
                    }
                } else {
                    // Wrong
                    display.textContent = '\u2717';
                    display.classList.add('puzzle-wrong');
                    sounds.sad();
                    setTimeout(() => {
                        this._showResult(container, false, 'logic', onComplete);
                    }, 600);
                }
            });
        });
    }

    // ── Arcane Study: Theory questions with 3 choices ────────────
    playArcanePuzzle(container, onComplete) {
        const questions = [
            { q: "The Third Law of Resonance states that all magic...", a: 1, opts: ["Creates matter", "Returns to its source", "Destroys entropy"] },
            { q: "A ward's strength is determined by...", a: 2, opts: ["The caster's voice", "The moon phase", "The caster's focus"] },
            { q: "When two spells collide, the result depends on...", a: 0, opts: ["Their harmonic frequency", "The time of day", "The caster's age"] },
            { q: "The fundamental particle of magic is called a...", a: 1, opts: ["Prism", "Mote", "Fragment"] },
            { q: "Siren magic differs from arcane magic because it...", a: 0, opts: ["Uses emotion as fuel", "Requires a wand", "Only works at sea"] },
            { q: "Memory spells fail when the caster...", a: 2, opts: ["Is too young", "Uses the wrong hand", "Doubts the memory"] },
            { q: "The color of pure mana is...", a: 1, opts: ["Blue", "No color at all", "Gold"] },
            { q: "Reality fractures occur when...", a: 0, opts: ["Logic overrides entropy", "Stars misalign", "The caster sleeps"] },
            { q: "A mage's bond with another person affects...", a: 2, opts: ["Their height", "Their appetite", "Their casting range"] },
            { q: "The oldest known spell is...", a: 1, opts: ["Fireball", "A lullaby", "Teleportation"] }
        ];

        const qData = questions[Math.floor(Math.random() * questions.length)];

        container.innerHTML = `
            <div class="puzzle-title">Arcane Study</div>
            <div class="puzzle-question">${qData.q}</div>
            <div class="puzzle-choices" id="puzzle-choices"></div>
        `;

        const choices = container.querySelector('#puzzle-choices');
        qData.opts.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'puzzle-choice-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                if (i === qData.a) {
                    btn.classList.add('puzzle-correct');
                    sounds.chime();
                    this.puzzlesMastered++;
                    setTimeout(() => this._showResult(container, true, 'arcane', onComplete), 600);
                } else {
                    btn.classList.add('puzzle-wrong');
                    choices.querySelectorAll('.puzzle-choice-btn')[qData.a].classList.add('puzzle-correct');
                    sounds.sad();
                    setTimeout(() => this._showResult(container, false, 'arcane', onComplete), 800);
                }
                choices.style.pointerEvents = 'none';
            });
            choices.appendChild(btn);
        });
    }

    // ── Memory Trial: Rune sequence recall ───────────────────────
    playMemoryPuzzle(container, onComplete) {
        const runes = ['\u16A0', '\u16A2', '\u16A6', '\u16B1', '\u16B7', '\u16C1'];
        const seqLength = Math.min(4 + Math.floor(this.puzzlesMastered / 4), 8);
        const sequence = [];
        for (let i = 0; i < seqLength; i++) {
            sequence.push(Math.floor(Math.random() * runes.length));
        }

        container.innerHTML = `
            <div class="puzzle-title">Memory Trial</div>
            <div class="puzzle-hint">Remember the rune sequence</div>
            <div class="puzzle-rune-grid" id="puzzle-runes"></div>
            <div class="puzzle-display" id="puzzle-display"></div>
        `;

        const grid = container.querySelector('#puzzle-runes');
        const display = container.querySelector('#puzzle-display');

        // Create rune buttons
        runes.forEach((rune, i) => {
            const btn = document.createElement('button');
            btn.className = 'puzzle-rune-btn';
            btn.textContent = rune;
            btn.dataset.index = i;
            grid.appendChild(btn);
        });

        grid.style.pointerEvents = 'none';
        grid.style.opacity = '0.4';

        // Show sequence
        let showIndex = 0;
        const showNext = () => {
            if (showIndex < sequence.length) {
                const runeIdx = sequence[showIndex];
                const btn = grid.querySelectorAll('.puzzle-rune-btn')[runeIdx];
                btn.classList.add('puzzle-rune-active');
                display.textContent = runes[runeIdx];
                setTimeout(() => btn.classList.remove('puzzle-rune-active'), 500);
                showIndex++;
                setTimeout(showNext, 800);
            } else {
                display.textContent = `Repeat (${sequence.length} runes)`;
                grid.style.pointerEvents = 'all';
                grid.style.opacity = '1';
                this._handleMemoryInput(container, grid, runes, sequence, onComplete);
            }
        };
        setTimeout(showNext, 600);
    }

    _handleMemoryInput(container, grid, runes, sequence, onComplete) {
        let inputIndex = 0;
        const display = container.querySelector('#puzzle-display');

        grid.querySelectorAll('.puzzle-rune-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                if (idx === sequence[inputIndex]) {
                    btn.classList.add('puzzle-rune-correct');
                    setTimeout(() => btn.classList.remove('puzzle-rune-correct'), 300);
                    sounds.pop();
                    inputIndex++;
                    display.textContent = `${inputIndex} / ${sequence.length}`;
                    if (inputIndex >= sequence.length) {
                        this.puzzlesMastered++;
                        this._showResult(container, true, 'memory', onComplete);
                    }
                } else {
                    btn.classList.add('puzzle-rune-wrong');
                    sounds.sad();
                    setTimeout(() => this._showResult(container, false, 'memory', onComplete), 600);
                }
            });
        });
    }

    // ── Result display ───────────────────────────────────────────
    _showResult(container, success, type, onComplete) {
        const lines = CHARACTER.trainingDialogue?.[type] || ["..."];
        const line = lines[Math.floor(Math.random() * lines.length)];

        container.innerHTML = `
            <div class="puzzle-result ${success ? 'puzzle-success' : 'puzzle-fail'}">
                <div class="puzzle-result-icon">${success ? '\u2728' : '\uD83D\uDCA8'}</div>
                <div class="puzzle-result-text">${success ? 'Solved' : 'Failed'}</div>
                <div class="puzzle-result-line">"${line}"</div>
            </div>
        `;

        setTimeout(() => {
            if (onComplete) onComplete(success);
        }, 2000);
    }

    // ── Timing Game: tap when indicator hits the target zone ─────
    playTimingGame(container, onComplete) {
        container.innerHTML = `
            <div class="puzzle-title">Timing</div>
            <div class="puzzle-hint">Tap when the light hits the center!</div>
            <div class="timing-track">
                <div class="timing-zone"></div>
                <div class="timing-indicator"></div>
            </div>
            <button class="timing-tap-btn">TAP!</button>
        `;

        const indicator = container.querySelector('.timing-indicator');
        const tapBtn = container.querySelector('.timing-tap-btn');
        let position = 0;
        let direction = 1;
        let speed = 2 + Math.floor(this.puzzlesMastered / 5); // gets faster
        let running = true;

        const animate = () => {
            if (!running) return;
            position += direction * speed;
            if (position >= 100) { position = 100; direction = -1; }
            if (position <= 0) { position = 0; direction = 1; }
            indicator.style.left = position + '%';
            requestAnimationFrame(animate);
        };
        animate();

        tapBtn.addEventListener('click', () => {
            if (!running) return;
            running = false;
            // Target zone is 40-60%
            const success = position >= 35 && position <= 65;
            if (success) this.puzzlesMastered++;
            this._showResult(container, success, Object.keys(CHARACTER.trainingDialogue || {})[0] || 'logic', onComplete);
        });

        // Auto-fail after 5 seconds
        setTimeout(() => {
            if (running) {
                running = false;
                this._showResult(container, false, Object.keys(CHARACTER.trainingDialogue || {})[0] || 'logic', onComplete);
            }
        }, 5000);
    }

    // ── Forage catch-game (Elian) ───────────────────────────────
    // Distinct mechanic, NOT the shared timing bar: herbs rise from
    // the forest floor — tap the green ones, avoid the red thorns,
    // snap the fast golden moonpetal. Difficulty scales with bond;
    // rare finds pay out bigger. Ported from the approved prototype.
    // Calls onDone(success) when the player taps Done on the result.
    _injectForageCSS() {
        if (document.getElementById('fg-css')) return;
        var s = document.createElement('style'); s.id = 'fg-css';
        s.textContent =
        ".fg-wrap{position:relative;grid-column:1/-1;width:100%;height:min(58vh,470px);border-radius:14px;overflow:hidden;background:#0d160f;font-family:inherit;touch-action:manipulation;user-select:none}"+
        ".fg-cv{position:absolute;inset:0;width:100%;height:100%;display:block}"+
        ".fg-hud{position:absolute;inset:0;pointer-events:none;padding:12px 13px;display:flex;flex-direction:column}"+
        ".fg-hud[hidden]{display:none}"+
        ".fg-top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}"+
        ".fg-stat{display:flex;flex-direction:column;line-height:1}"+
        ".fg-stat.fg-mid{flex:1;align-items:center}.fg-stat.fg-r{align-items:flex-end}"+
        ".fg-k{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#8a8570;margin-bottom:4px}"+
        ".fg-v{font-size:19px;font-weight:600;color:#e9dfd0;font-variant-numeric:tabular-nums}"+
        ".fg-mid .fg-v{color:#a7c957;font-style:italic}"+
        ".fg-bottom{margin-top:auto;display:flex;flex-direction:column;gap:7px}"+
        ".fg-bars{display:flex;flex-direction:column;gap:5px}"+
        ".fg-bar{height:6px;border-radius:5px;background:rgba(255,255,255,.09);overflow:hidden}"+
        ".fg-bar>i{display:block;height:100%;width:0%;border-radius:5px}"+
        ".fg-pouchfill{background:linear-gradient(90deg,#6f9a3f,#a7c957)}"+
        ".fg-timefill{background:linear-gradient(90deg,#c9a24a,#e8c979)}"+
        ".fg-say{min-height:32px;display:flex;align-items:flex-end;justify-content:center;text-align:center;padding:0 6px;pointer-events:none;font-style:italic;font-size:13.5px;line-height:1.3;color:#f0e8da;text-shadow:0 1px 2px rgba(6,11,7,.95),0 2px 10px rgba(0,0,0,.85);opacity:0;transition:opacity .3s}"+
        ".fg-say.show{opacity:1}"+
        ".fg-veil{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:22px;background:rgba(6,11,7,.74);z-index:3}"+
        ".fg-veil[hidden]{display:none}"+
        ".fg-line{font-style:italic;font-size:15px;line-height:1.5;color:#efe7d8;max-width:26ch;margin-bottom:20px}"+
        ".fg-grade{font-style:italic;font-size:14px;color:#a7c957;margin-bottom:2px}"+
        ".fg-big{font-size:40px;font-weight:600;color:#e9dfd0;font-variant-numeric:tabular-nums;line-height:1}"+
        ".fg-meta{font-size:12px;color:#8a8570;margin:6px 0 16px}.fg-meta b{color:#e8c979;font-weight:600}"+
        ".fg-btn{font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#0e160e;background:#a7c957;border:none;border-radius:999px;padding:12px 30px;cursor:pointer}"+
        ".fg-btn:active{transform:scale(.97)}";
        document.head.appendChild(s);
    }

    playForage(container, onDone) {
        this._injectForageCSS();
        var game = this.game;
        var bond = Math.max(0, Math.min(100, game.bond || 0));
        var diff = bond / 100;
        var ROUND = 30;
        var thornChance = 0.34 + diff * 0.12;
        var speedBase = 58 + diff * 34;
        var moonMul = 2.4 + diff * 0.5;
        var spawnGap0 = 0.80 - diff * 0.16;
        var GOAL = 300 + Math.round(diff * 170);
        var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        var P = { sage:'#a7c957', sage2:'#8fb573', leafdk:'#4a6b43', berry:'#5b8090',
                  berry2:'#7ea6b4', wine:'#b3546a', wine2:'#d17d8f', gold:'#e8c979', gold2:'#f6ecc8' };

        container.innerHTML =
          '<div class="fg-wrap"><canvas class="fg-cv"></canvas>'+
          '<div class="fg-hud" hidden><div class="fg-top">'+
            '<div class="fg-stat"><span class="fg-k">Pouch</span><span class="fg-v fg-score">0</span></div>'+
            '<div class="fg-stat fg-mid"><span class="fg-k">Sync</span><span class="fg-v fg-combo">&times;1</span></div>'+
            '<div class="fg-stat fg-r"><span class="fg-k">Light</span><span class="fg-v fg-clock">30</span></div></div>'+
            '<div class="fg-bottom"><div class="fg-say"></div><div class="fg-bars"><div class="fg-bar"><i class="fg-pouchfill"></i></div><div class="fg-bar"><i class="fg-timefill"></i></div></div></div></div>'+
          '<div class="fg-veil fg-start"><div class="fg-line">&ldquo;The good ones grow low, near the roots. The red ones are not for eating. Fill the pouch before the light turns.&rdquo;</div><button class="fg-btn fg-begin">Begin</button></div>'+
          '<div class="fg-veil fg-end" hidden><div class="fg-grade"></div><div class="fg-big">0</div><div class="fg-meta"></div><div class="fg-line fg-endline"></div><button class="fg-btn fg-doneb">Done</button></div>'+
          '</div>';

        var cv = container.querySelector('.fg-cv'), ctx = cv.getContext('2d');
        var hud = container.querySelector('.fg-hud');
        var elScore = container.querySelector('.fg-score'), elCombo = container.querySelector('.fg-combo'),
            elClock = container.querySelector('.fg-clock'),
            elPouch = container.querySelector('.fg-pouchfill'), elTime = container.querySelector('.fg-timefill');
        var sayEl = container.querySelector('.fg-say');
        var startV = container.querySelector('.fg-start'), endV = container.querySelector('.fg-end');

        var W=0, H=0, dpr=Math.min(window.devicePixelRatio||1, 2.5);
        function resize(){ var r=cv.getBoundingClientRect(); W=r.width; H=r.height;
          cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); }
        resize();

        function sfx(n){ try{ if(window.sounds && typeof sounds[n]==='function') sounds[n](); }catch(e){} }

        var state='start', items=[], parts=[], motes=[], score=0, streak=0, mult=1, moon=0, maxStreak=0;
        var timeLeft=ROUND, spawnAcc=0, last=0, tRun=0, shakeT=0, comboGlow=0, running=true, rafId=0, sayT=0;
        var praise=['Steady hands.','You have the eye for it.','The wood trusts you a little more.','Good. Keep low.'];
        function say(t){ sayEl.textContent=t; sayEl.classList.add('show'); clearTimeout(sayT);
          sayT=setTimeout(function(){ sayEl.classList.remove('show'); }, 2400); }

        if(!reduce){ var mn=Math.round((W||300)*0.04); for(var mi=0;mi<mn;mi++)
          motes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*6,vy:-(4+Math.random()*8),r:.6+Math.random()*1.5,a:.12+Math.random()*.22}); }

        function spawn(){ if(items.length>7) return;
          var roll=Math.random(), type;
          if(roll<0.06) type='moon'; else if(roll<0.06+thornChance) type='thorn';
          else type=(Math.random()<.5)?'herb':'berry';
          var r=type==='moon'?20:(type==='thorn'?18:19), margin=r+14;
          var ramp=1+(1-timeLeft/ROUND)*0.5;
          items.push({type:type,x:margin+Math.random()*(W-margin*2),y:H+r+10,
            vy:-(speedBase+Math.random()*24)*(type==='moon'?moonMul:1)*ramp, r:r,
            sw:reduce?0:(8+Math.random()*10), sf:.5+Math.random()*.8, seed:Math.random()*99}); }

        function popParts(x,y,c,n){ if(reduce)return; for(var i=0;i<n;i++){ var a=Math.random()*6.28,sp=20+Math.random()*60;
          parts.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-30,life:1,col:c,r:1+Math.random()*2.2}); } }
        function floatT(x,y,t,c){ parts.push({x:x,y:y,txt:t,col:c,life:1,vy:-42,fl:true}); }
        function flashCombo(){ elCombo.textContent='×'+(mult%1===0?mult:mult.toFixed(1)); }

        function resolve(it,idx){ items.splice(idx,1);
          if(it.type==='thorn'){ streak=0; mult=1; score=Math.max(0,score-5); shakeT=.28;
            popParts(it.x,it.y,P.wine,7); floatT(it.x,it.y,'-5',P.wine2); sfx('clash');
            say('That one bites. Leave it be.'); flashCombo(); return; }
          streak++; if(streak>maxStreak)maxStreak=streak; mult=Math.min(3,1+Math.floor(streak/4)*.5);
          var base=it.type==='moon'?50:10, g=Math.round(base*mult); score+=g;
          if(it.type==='moon'){ moon++; popParts(it.x,it.y,P.gold,16); floatT(it.x,it.y,'+'+g,P.gold2); sfx('pop'); comboGlow=1;
            say('Moonpetal. It shows for a breath, then it is gone. Quick eyes.'); }
          else { popParts(it.x,it.y,it.type==='berry'?P.berry2:P.sage,7); floatT(it.x,it.y,'+'+g,P.sage); sfx('pop'); }
          if(streak%4===0){ comboGlow=1; if(it.type!=='moon') say(praise[(streak/4-1)%praise.length]); }
          flashCombo(); }

        function leaf(x,y,ang,len,wid,col){ ctx.save(); ctx.translate(x,y); ctx.rotate(ang); ctx.fillStyle=col;
          ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(wid,-len*.5,0,-len); ctx.quadraticCurveTo(-wid,-len*.5,0,0); ctx.fill(); ctx.restore(); }
        function drawItem(it){ var t=tRun;
          if(it.type==='moon'){ var pul=.5+.5*Math.sin(t*3+it.seed);
            var rg=ctx.createRadialGradient(it.x,it.y,0,it.x,it.y,it.r*2.4);
            rg.addColorStop(0,'rgba(246,236,200,'+(.5+.25*pul)+')'); rg.addColorStop(1,'rgba(232,201,121,0)');
            ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(it.x,it.y,it.r*2.4,0,6.29); ctx.fill();
            for(var p=0;p<5;p++){ leaf(it.x,it.y,t*.4+p*1.2566,it.r*1.15,it.r*.5,'rgba(246,236,200,.92)'); }
            ctx.fillStyle=P.gold; ctx.beginPath(); ctx.arc(it.x,it.y,it.r*.34,0,6.29); ctx.fill(); return; }
          if(it.type==='thorn'){ ctx.save(); ctx.translate(it.x,it.y); ctx.strokeStyle=P.wine; ctx.lineWidth=2.4;
            for(var s=0;s<7;s++){ var a2=s/7*6.28+t*.3; ctx.beginPath();
              ctx.moveTo(Math.cos(a2)*it.r*.5,Math.sin(a2)*it.r*.5); ctx.lineTo(Math.cos(a2)*it.r*1.05,Math.sin(a2)*it.r*1.05); ctx.stroke(); }
            ctx.fillStyle='#7a2b3c'; ctx.beginPath(); ctx.arc(0,0,it.r*.5,0,6.29); ctx.fill();
            ctx.fillStyle=P.wine2; ctx.beginPath(); ctx.arc(-it.r*.15,-it.r*.15,it.r*.2,0,6.29); ctx.fill(); ctx.restore(); return; }
          if(it.type==='berry'){ var off=[[0,-2],[-5,4],[5,4]];
            for(var b=0;b<3;b++){ ctx.fillStyle=b===0?P.berry2:P.berry; ctx.beginPath();
              ctx.arc(it.x+off[b][0],it.y+off[b][1],it.r*.42,0,6.29); ctx.fill(); }
            leaf(it.x,it.y-it.r*.5,.2,it.r*.7,it.r*.3,P.leafdk); return; }
          ctx.strokeStyle=P.leafdk; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(it.x,it.y+it.r*.7); ctx.lineTo(it.x,it.y-it.r*.7); ctx.stroke();
          leaf(it.x,it.y-it.r*.2,-.5,it.r*.9,it.r*.4,P.sage2); leaf(it.x,it.y+it.r*.1,.5,it.r*.85,it.r*.4,P.sage);
          leaf(it.x,it.y-it.r*.6,.05,it.r*.8,it.r*.35,P.sage2); }

        function paintBg(){ ctx.fillStyle='#0d160f'; ctx.fillRect(0,0,W,H);
          var g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(18,33,22,.6)'); g.addColorStop(.55,'rgba(14,26,18,0)'); g.addColorStop(1,'#0a130c');
          ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
          ctx.fillStyle='#0c1710'; ctx.beginPath(); ctx.moveTo(0,H); ctx.lineTo(0,H-22);
          ctx.quadraticCurveTo(W*.5,H-34,W,H-20); ctx.lineTo(W,H); ctx.closePath(); ctx.fill(); }

        var ended=false, wasSuccess=false;
        function grade(){ if(score>=GOAL*1.15) return {g:'The wood was generous',l:'A full pouch, and then some. Patience suits you. Come sit by the fire.'};
          if(score>=GOAL*0.72) return {g:'A good forage',l:'Enough for a strong tea and something dried for winter. Well done.'};
          if(score>=GOAL*0.36) return {g:'Enough for a tea',l:'A quiet handful. The wood gives what it gives. We go again tomorrow.'};
          return {g:'A thin harvest',l:'The wood keeps its secrets today. It warms to you slowly. Come back.'}; }
        function endGame(){ if(ended) return; ended=true; state='end'; hud.setAttribute('hidden',''); sayEl.classList.remove('show');
          var gr=grade(); wasSuccess = score>=GOAL*0.36;
          var bb = score>=GOAL*1.15?10 : score>=GOAL*0.72?7 : score>=GOAL*0.36?4 : 1;
          var ab = moon + (score>=GOAL*0.72?2:0);
          game.bond = Math.min(100,(game.bond||0)+bb);
          game.affection = Math.min(100,(game.affection||0)+ab);
          game.foragingScore = (game.foragingScore||0)+1;
          var best=+(localStorage.getItem('pp_forage_best_elian')||0), nb=score>best, roseReward=0;
          if(nb){ try{ localStorage.setItem('pp_forage_best_elian',String(score)); }catch(e){}
            // Owner: new personal best pays 5 Roses (the "beat yourself" hook).
            try{ if(window.PPCurrency && PPCurrency.add){ PPCurrency.add(5,'forage record'); roseReward=5; } }catch(e){} }
          try{ if(game.save) game.save(); }catch(e){}
          container.querySelector('.fg-grade').textContent=gr.g;
          container.querySelector('.fg-big').textContent=score;
          container.querySelector('.fg-meta').innerHTML=(nb?('<b>New best pouch'+(roseReward?' &middot; +'+roseReward+' Roses':'')+'</b>'):'Best '+Math.max(best,score))+(moon?' &middot; '+moon+' moonpetal'+(moon>1?'s':''):'');
          container.querySelector('.fg-endline').textContent='“'+gr.l+'”';
          endV.removeAttribute('hidden'); if(nb) sfx('pop'); }

        function loop(ts){
          if(!running || !cv.isConnected){ running=false; return; }
          if(!last)last=ts; var dt=Math.min(.05,(ts-last)/1000); last=ts; tRun+=dt;
          if(state==='playing'){ timeLeft-=dt; if(timeLeft<=0){ timeLeft=0; endGame(); }
            spawnAcc+=dt; var gap=spawnGap0-(1-timeLeft/ROUND)*0.26; if(spawnAcc>gap){ spawnAcc=0; spawn(); } }
          for(var i=0;i<motes.length;i++){ var m=motes[i]; m.x+=m.vx*dt; m.y+=m.vy*dt;
            if(m.y<-4){ m.y=H+4; m.x=Math.random()*W; } if(m.x<-4)m.x=W+4; if(m.x>W+4)m.x=-4; }
          for(var k=items.length-1;k>=0;k--){ var it=items[k]; it.y+=it.vy*dt;
            it.x+= it.sw?Math.sin(tRun*it.sf+it.seed)*it.sw*dt:0; if(it.y< -it.r-30) items.splice(k,1); }
          for(var q=parts.length-1;q>=0;q--){ var pt=parts[q]; pt.x+=(pt.vx||0)*dt; pt.y+=pt.vy*dt;
            if(!pt.fl)pt.vy+=90*dt; pt.life-=dt*(pt.fl?.9:1.4); if(pt.life<=0) parts.splice(q,1); }
          if(shakeT>0)shakeT-=dt; if(comboGlow>0)comboGlow-=dt*1.6;
          ctx.save();
          if(shakeT>0){ var sh=7*(shakeT/.28); ctx.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh); }
          paintBg();
          if(comboGlow>0){ ctx.strokeStyle='rgba(167,201,87,'+(comboGlow*.5)+')'; ctx.lineWidth=6; ctx.strokeRect(3,3,W-6,H-6); }
          for(var d=0;d<motes.length;d++){ var mm=motes[d]; ctx.globalAlpha=mm.a; ctx.fillStyle='#d8e8b0';
            ctx.beginPath(); ctx.arc(mm.x,mm.y,mm.r,0,6.29); ctx.fill(); } ctx.globalAlpha=1;
          for(var di=0;di<items.length;di++) drawItem(items[di]);
          for(var pj=0;pj<parts.length;pj++){ var pp=parts[pj]; ctx.globalAlpha=Math.max(0,pp.life); ctx.fillStyle=pp.col;
            if(pp.fl){ ctx.font="600 15px 'Avenir Next',system-ui,sans-serif"; ctx.textAlign='center'; ctx.fillText(pp.txt,pp.x,pp.y); }
            else { ctx.beginPath(); ctx.arc(pp.x,pp.y,pp.r,0,6.29); ctx.fill(); } } ctx.globalAlpha=1;
          ctx.restore();
          if(state==='playing'){ elScore.textContent=score; elClock.textContent=Math.ceil(timeLeft);
            elPouch.style.width=Math.min(100,score/GOAL*100)+'%'; elTime.style.width=(timeLeft/ROUND*100)+'%'; }
          rafId=requestAnimationFrame(loop);
        }

        cv.addEventListener('pointerdown', function(e){ if(state!=='playing')return;
          var r=cv.getBoundingClientRect(), px=e.clientX-r.left, py=e.clientY-r.top;
          for(var i=items.length-1;i>=0;i--){ var it=items[i]; var dx=px-it.x, dy=py-it.y;
            if(dx*dx+dy*dy<(it.r+22)*(it.r+22)){ resolve(it,i); break; } } });

        container.querySelector('.fg-begin').addEventListener('click', function(){
          state='playing'; hud.removeAttribute('hidden'); startV.setAttribute('hidden','');
          setTimeout(function(){ say('The good ones grow low. Watch your hands.'); }, 500); });
        container.querySelector('.fg-doneb').addEventListener('click', function(){
          running=false; if(rafId) cancelAnimationFrame(rafId); if(onDone) onDone(wasSuccess); });

        rafId=requestAnimationFrame(loop);
    }

    // ── Entry point: play a random puzzle of the given type ──────
    _injectWaltzCSS() {
        if (document.getElementById('wz-css')) return;
        var s = document.createElement('style'); s.id = 'wz-css';
        s.textContent = [
        ".wz-wrap{grid-column:1/-1;position:relative;width:100%;padding:12px 12px 10px;border-radius:14px;overflow:hidden;font-family:inherit;color:#f3ebde;background:radial-gradient(120% 70% at 50% -10%,rgba(244,224,166,.14),rgba(244,224,166,0) 60%),linear-gradient(180deg,#271a30,#1a1122);box-shadow:inset 0 1px 0 rgba(244,224,166,.07)}",
        ".wz-top{display:flex;align-items:center;justify-content:flex-end;gap:4px;font-family:system-ui,sans-serif;font-size:11px;color:#a596a6;margin-bottom:6px}",
        ".wz-top .wz-k{text-transform:uppercase;letter-spacing:.16em;font-size:9px}.wz-top .wz-kr{margin-left:8px}",
        ".wz-top b{color:#f3ebde;font-variant-numeric:tabular-nums;font-size:14px;margin-left:5px}.wz-top .wz-long{color:#e6a4b4}",
        ".wz-close{height:8px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;border:1px solid rgba(244,224,166,.12);margin-bottom:10px}",
        ".wz-close>i{display:block;height:100%;width:0%;background:linear-gradient(90deg,#c9788c,#e6a4b4,#f4e0a6);transition:width .25s ease-out}",
        ".wz-status{text-align:center;font-size:15px;min-height:22px;margin-bottom:3px;color:#a596a6;transition:color .25s}",
        ".wz-status.lead{color:#f4e0a6}.wz-status.echo{color:#e6a4b4}.wz-status.win{color:#e8c979}.wz-status.miss{color:#c9788c}",
        ".wz-lives{text-align:center;min-height:20px;letter-spacing:3px;font-size:15px;margin-bottom:6px}.wz-lives .spent{opacity:.18;filter:grayscale(1)}",
        ".wz-dots{display:flex;gap:6px;justify-content:center;min-height:10px;margin-bottom:10px}",
        ".wz-dots i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.16);transition:.18s}.wz-dots i.on{background:#f4e0a6;transform:scale(1.25)}",
        ".wz-pads{display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:380px;margin:0 auto}",
        ".wz-pad{position:relative;border:none;cursor:pointer;border-radius:14px;padding:16px 8px 11px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.015));box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);color:#f3ebde;font-family:inherit;transition:transform .12s,box-shadow .2s,background .2s}",
        ".wz-pad .wz-sym{display:block;font-size:30px;line-height:1}.wz-pad .wz-nm{display:block;margin-top:6px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#a596a6;font-family:system-ui,sans-serif}",
        ".wz-pad[data-k=left] .wz-sym{color:#e6a4b4}.wz-pad[data-k=right] .wz-sym{color:#e8c979}.wz-pad[data-k=turn] .wz-sym{color:#bda4e6}.wz-pad[data-k=close] .wz-sym{color:#ec8fb0}",
        ".wz-wrap.leading .wz-pad{pointer-events:none;opacity:.72}.wz-wrap.busy .wz-pad{pointer-events:none}.wz-pad.lit{transform:translateY(-2px)}",
        ".wz-pad[data-k=left].lit{background:radial-gradient(120% 120% at 50% 40%,rgba(230,164,180,.55),rgba(230,164,180,.06));box-shadow:inset 0 0 0 1px rgba(230,164,180,.6),0 0 24px rgba(230,164,180,.4)}",
        ".wz-pad[data-k=right].lit{background:radial-gradient(120% 120% at 50% 40%,rgba(232,201,121,.55),rgba(232,201,121,.06));box-shadow:inset 0 0 0 1px rgba(232,201,121,.6),0 0 24px rgba(232,201,121,.4)}",
        ".wz-pad[data-k=turn].lit{background:radial-gradient(120% 120% at 50% 40%,rgba(189,164,230,.55),rgba(189,164,230,.06));box-shadow:inset 0 0 0 1px rgba(189,164,230,.6),0 0 24px rgba(189,164,230,.4)}",
        ".wz-pad[data-k=close].lit{background:radial-gradient(120% 120% at 50% 40%,rgba(236,143,176,.55),rgba(236,143,176,.06));box-shadow:inset 0 0 0 1px rgba(236,143,176,.6),0 0 24px rgba(236,143,176,.4)}",
        ".wz-pad.hit{animation:wzhit .4s ease}.wz-pad.miss{animation:wzmiss .5s ease}",
        "@keyframes wzhit{0%{box-shadow:inset 0 0 0 2px #f4e0a6,0 0 26px rgba(244,224,166,.6)}100%{box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}}",
        "@keyframes wzmiss{0%,60%{box-shadow:inset 0 0 0 2px #c9788c,0 0 20px rgba(201,120,140,.5)}100%{box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}}",
        "@media (prefers-reduced-motion:reduce){.wz-pad,.wz-pad.hit,.wz-pad.miss{animation:none;transition:none}}",
        ".wz-say{text-align:center;min-height:20px;margin-top:10px;font-style:italic;font-size:13.5px;line-height:1.35;color:#ecdccf;opacity:0;transition:opacity .35s;padding:0 6px}.wz-say.show{opacity:1}",
        ".wz-petal{position:absolute;pointer-events:none;font-size:15px;animation:wzfloat 1.6s ease-out forwards}",
        "@keyframes wzfloat{0%{opacity:0;transform:translateY(0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translateY(-80px) scale(1.1)}}",
        ".wz-veil{position:absolute;inset:0;border-radius:14px;background:radial-gradient(80% 80% at 50% 40%,rgba(40,26,52,.8),rgba(23,14,30,.96));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:22px;text-align:center}",
        ".wz-veil[hidden]{display:none}",
        ".wz-vk{font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:.28em;font-size:10px;color:#e6a4b4}",
        ".wz-vt{font-size:21px;color:#f3ebde}.wz-vp{max-width:34ch;color:#e2d2cb;font-size:13.5px;font-style:italic;line-height:1.5}",
        ".wz-rec{color:#e6a4b4;font-weight:600;font-family:system-ui,sans-serif;font-size:12.5px}",
        ".wz-stats{display:flex;gap:22px;font-family:system-ui,sans-serif}.wz-stats div{display:flex;flex-direction:column;gap:2px}",
        ".wz-stats b{font-size:22px;color:#f4e0a6;font-variant-numeric:tabular-nums}.wz-stats span{font-size:9px;text-transform:uppercase;letter-spacing:.2em;color:#a596a6}",
        ".wz-btn{font-family:system-ui,sans-serif;cursor:pointer;border-radius:999px;padding:11px 28px;font-size:13px;font-weight:600;letter-spacing:.04em;color:#2a1420;border:none;background:linear-gradient(180deg,#f4e0a6,#e8c979);box-shadow:0 8px 22px -8px rgba(232,201,121,.6)}.wz-btn:active{transform:translateY(1px)}"
        ].join('');
        document.head.appendChild(s);
    }

    // ── Caspian's Waltz: "Follow His Lead" (sequence-memory dance) ──────
    // He leads a growing pattern of steps; the player dances them back.
    // Distinct genre from Elian's forage (memory, not catch). Forgiving:
    // a few missteps re-show the steps, no timer. Rewards applied INSIDE
    // here (bond/affection scaled by longest chain + personal best + 5
    // Roses on a new best), like playForage. Bond-scaled difficulty.
    playWaltz(container, onDone) {
        this._injectWaltzCSS();
        var game = this.game;
        var reduce = false; try { reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
        var bond = (game && game.bond) || 0, diff = Math.max(0, Math.min(1, bond / 100));
        var BI = 0.68 - diff * 0.10;              // lead step interval (s), a touch quicker at high Bond
        var START = 2 + Math.round(diff);         // 2..3 opening steps
        var FORGIVE = 3 + Math.floor(diff * 2);   // 3..5 gentle missteps
        var motion = reduce ? 0.15 : 0.7;
        var MOVES = [{ k: 'left', freq: 329.63 }, { k: 'right', freq: 392.00 }, { k: 'turn', freq: 493.88 }, { k: 'close', freq: 587.33 }];

        container.innerHTML =
            '<div class="wz-wrap">' +
              '<div class="wz-top"><span class="wz-k">Longest</span><b class="wz-long">0</b><span class="wz-k wz-kr">Best</span><b class="wz-best">0</b></div>' +
              '<div class="wz-close"><i></i></div>' +
              '<div class="wz-status">&nbsp;</div>' +
              '<div class="wz-lives"></div>' +
              '<div class="wz-dots"></div>' +
              '<div class="wz-pads">' +
                '<button class="wz-pad" data-k="left" data-i="0"><span class="wz-sym">&#8630;</span><span class="wz-nm">Glide left</span></button>' +
                '<button class="wz-pad" data-k="right" data-i="1"><span class="wz-sym">&#8631;</span><span class="wz-nm">Glide right</span></button>' +
                '<button class="wz-pad" data-k="turn" data-i="2"><span class="wz-sym">&#8635;</span><span class="wz-nm">Twirl</span></button>' +
                '<button class="wz-pad" data-k="close" data-i="3"><span class="wz-sym">&#9825;</span><span class="wz-nm">Close</span></button>' +
              '</div>' +
              '<div class="wz-say"></div>' +
              '<div class="wz-veil wz-start"><div class="wz-vk">a waltz begins</div><div class="wz-vt">Let him lead</div><div class="wz-vp">Caspian shows you a few steps, lighting each in turn. Dance them back in the same order and he adds one more. Missteps are forgiven, and there is no rush.</div><button class="wz-btn wz-begin">Take his hand</button></div>' +
              '<div class="wz-veil wz-end" hidden></div>' +
            '</div>';

        var wrap = container.querySelector('.wz-wrap');
        var elStatus = container.querySelector('.wz-status'), elLives = container.querySelector('.wz-lives'),
            elDots = container.querySelector('.wz-dots'), elClose = container.querySelector('.wz-close > i'),
            elLong = container.querySelector('.wz-long'), elBest = container.querySelector('.wz-best'),
            elSay = container.querySelector('.wz-say'), startV = container.querySelector('.wz-start'),
            endV = container.querySelector('.wz-end'), pads = [].slice.call(container.querySelectorAll('.wz-pad'));

        var state = 'idle', seq = [], echoIndex = 0, lives = FORGIVE, longest = 0, closeness = 0, round = 0,
            goal = (START + 6) * 8, timers = [], ended = false, finished = false;
        function clearTimers() { for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]); timers = []; }
        function later(fn, ms) { var id = setTimeout(function () { if (!container.isConnected) { clearTimers(); return; } fn(); }, ms); timers.push(id); return id; }
        function randMove() { var i = (Math.random() * 4) | 0; if (seq.length >= 2 && seq[seq.length - 1] === i && seq[seq.length - 2] === i) i = (i + 1) % 4; return i; }

        // audio (guarded, lazy — the 4 step tones carry the memory feel)
        var ac = null, master = null;
        function initAudio() { try { if (ac) return; var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ac = new AC(); master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination); } catch (e) {} }
        function tone(freq, type, peak, dur) { try { if (!ac) return; var t = ac.currentTime, g = ac.createGain(), o = ac.createOscillator(); o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05); } catch (e) {} }
        function toneMove(i) { tone(MOVES[i].freq, 'sine', 0.16, 0.4); tone(MOVES[i].freq * 2, 'triangle', 0.05, 0.3); }
        function toneMiss() { tone(174.6, 'sine', 0.14, 0.5); }
        function toneWin() { var f = [523.25, 659.25, 783.99]; for (var n = 0; n < 3; n++) (function (nn) { later(function () { tone(f[nn], 'sine', 0.12, 0.4); }, nn * 90); })(n); }

        var leadFirst = ["Give me your hand. Watch my feet, and only my feet. Ready?", "No court, no crown tonight. Just the count. Watch how I lead."];
        var leadMore = ["One step longer this time. Watch.", "Again, and I am adding a turn. Keep your eyes on me.", "You are doing beautifully. Follow this."];
        var echoLines = ["Now you. Lead me back.", "Your turn. I will follow wherever you take me.", "Show me you had it."];
        var winLines = ["Yes. Exactly there.", "Perfect. You did not even look down.", "That is the whole conversation, right there.", "Mm. Keep going."];
        var missLines = ["Almost. Do not chase the count, feel it.", "There, I have you. Let me show it once more.", "No harm. Watch again, and breathe."];

        function setStatus(t, cls) { elStatus.innerHTML = t; elStatus.className = 'wz-status ' + (cls || ''); }
        function say(t) { elSay.textContent = t; elSay.classList.add('show'); }
        function pick(a) { return a[(Math.random() * a.length) | 0]; }
        function setClose() { elClose.style.width = Math.min(100, closeness / goal * 100).toFixed(1) + '%'; }
        function renderLives() { var s = ''; for (var i = 0; i < FORGIVE; i++) s += '<span class="' + (i < lives ? '' : 'spent') + '">&#127801;</span>'; elLives.innerHTML = s; }
        function renderDots() { var s = ''; if (state === 'echo' || state === 'leading') { for (var i = 0; i < seq.length; i++) s += '<i class="' + (i < echoIndex ? 'on' : '') + '"></i>'; } elDots.innerHTML = s; }
        function litPad(i) { pads[i].classList.add('lit'); }
        function unlitPad(i) { pads[i].classList.remove('lit'); }
        function resetPadFx() { for (var i = 0; i < pads.length; i++) pads[i].classList.remove('lit', 'hit', 'miss'); }
        function hitFx(i) { var p = pads[i]; p.classList.remove('hit'); void p.offsetWidth; p.classList.add('hit'); }
        function missFx(i) { var p = pads[i]; p.classList.remove('miss'); void p.offsetWidth; p.classList.add('miss'); }
        function petals(n) { if (motion <= 0.03) return; var em = ['🌹', '💛', '✨', '🌷']; for (var i = 0; i < n; i++) { var sp = document.createElement('span'); sp.className = 'wz-petal'; sp.textContent = em[(Math.random() * em.length) | 0]; sp.style.left = (20 + Math.random() * 60) + '%'; sp.style.bottom = (28 + Math.random() * 30) + '%'; sp.style.animationDelay = (Math.random() * 0.3) + 's'; wrap.appendChild(sp); (function (node) { later(function () { if (node && node.remove) node.remove(); }, 1900); })(sp); } }

        function startGame() {
            clearTimers(); seq = []; echoIndex = 0; closeness = 0; longest = 0; lives = FORGIVE; ended = false;
            for (var i = 0; i < START; i++) seq.push(randMove());
            renderLives(); setClose(); elLong.textContent = '0';
            elBest.textContent = (+localStorage.getItem('pp_caspian_waltz_best') || 0);
            startV.setAttribute('hidden', ''); endV.setAttribute('hidden', '');
            round = 1; lead();
        }
        function lead() {
            state = 'leading'; wrap.classList.add('leading', 'busy'); setStatus('Watch his lead', 'lead'); resetPadFx(); renderDots();
            say(pick(round === 1 ? leadFirst : leadMore));
            var t0 = 560, on = BI * 0.56 * 1000;
            for (var i = 0; i < seq.length; i++) { (function (idx) { var at = t0 + idx * BI * 1000; later(function () { litPad(seq[idx]); toneMove(seq[idx]); }, at); later(function () { unlitPad(seq[idx]); }, at + on); })(i); }
            later(beginEcho, t0 + seq.length * BI * 1000 + 240);
        }
        function beginEcho() { state = 'echo'; echoIndex = 0; wrap.classList.remove('leading', 'busy'); setStatus('Your turn. Lead me back', 'echo'); renderDots(); say(pick(echoLines)); }
        function onTap(i) {
            if (state !== 'echo') return;
            if (i === seq[echoIndex]) {
                hitFx(i); toneMove(i); echoIndex++; renderDots();
                if (echoIndex >= seq.length) roundWin();
            } else {
                missFx(i); toneMiss(); lives--; renderLives();
                if (lives <= 0) { endGame(); return; }
                state = 'leading'; wrap.classList.add('busy'); setStatus('Almost. Watch once more', 'miss'); say(pick(missLines));
                later(function () { echoIndex = 0; lead(); }, 1250);
            }
        }
        function roundWin() {
            closeness += 8 + seq.length * 3; longest = Math.max(longest, seq.length); elLong.textContent = longest; setClose();
            state = 'leading'; wrap.classList.add('busy'); setStatus('Beautiful', 'win'); say(pick(winLines)); toneWin(); petals(Math.round(7 * motion));
            round++; later(function () { seq.push(randMove()); lead(); }, 1200);
        }
        function endGame() {
            if (ended) return; ended = true; state = 'done'; clearTimers(); wrap.classList.remove('leading'); wrap.classList.add('busy');
            var lc = longest, bb = lc >= 8 ? 10 : lc >= 5 ? 7 : lc >= 3 ? 4 : 2, ab = lc >= 6 ? 2 : lc >= 3 ? 1 : 0;
            if (game) { game.bond = Math.min(100, (game.bond || 0) + bb); game.affection = Math.min(100, (game.affection || 0) + ab); game.waltzScore = (game.waltzScore || 0) + 1; }
            var best = +(localStorage.getItem('pp_caspian_waltz_best') || 0), nb = closeness > best, rose = 0;
            if (nb) { try { localStorage.setItem('pp_caspian_waltz_best', String(closeness)); } catch (e) {} try { if (window.PPCurrency && PPCurrency.add) { PPCurrency.add(5, 'waltz record'); rose = 5; } } catch (e) {} }
            try { if (game && game.save) game.save(); } catch (e) {}
            elBest.textContent = Math.max(best, closeness);
            var line = lc >= 8 ? "We could have danced until dawn and called it a short evening. Do not tell the court their prince was grinning."
                : lc >= 5 ? "You led me through every turn without once looking at your feet. That is not a beginner's gift. That is trust."
                : lc >= 3 ? "A few more evenings like this and you will out-dance the whole court, and I will let you, gladly."
                : "We lost the count more than we kept it. I did not mind a single stumble. Come back tomorrow and we begin again, slower.";
            endV.innerHTML = '<div class="wz-vk">the music settles</div>' +
                '<div class="wz-vt">' + (lc >= 5 ? 'A waltz worth remembering' : 'One dance, kept') + '</div>' +
                (nb ? '<div class="wz-rec">&#10024; Closest yet' + (rose ? ' &middot; +' + rose + ' Roses' : '') + '</div>' : '') +
                '<div class="wz-stats"><div><b>' + lc + '</b><span>Longest chain</span></div><div><b>' + closeness + '</b><span>Closeness</span></div></div>' +
                '<div class="wz-vp">' + line + '</div><button class="wz-btn wz-doneb">Done</button>';
            endV.removeAttribute('hidden'); elSay.classList.remove('show');
            var db = endV.querySelector('.wz-doneb'); if (db) db.addEventListener('click', function () { finish(lc >= 2); });
        }
        function finish(success) { if (finished) return; finished = true; clearTimers(); if (onDone) onDone(success); }

        for (var pi = 0; pi < pads.length; pi++) { (function (p) { p.addEventListener('click', function () { onTap(+p.getAttribute('data-i')); }); })(pads[pi]); }
        container.querySelector('.wz-begin').addEventListener('click', function () { initAudio(); try { if (ac && ac.state === 'suspended') ac.resume(); } catch (e) {} startGame(); });
        elBest.textContent = (+localStorage.getItem('pp_caspian_waltz_best') || 0);
    }

    _injectReachCSS() {
        if (document.getElementById('rc-css')) return;
        var s = document.createElement('style'); s.id = 'rc-css';
        s.textContent = [
        ".rc-wrap{grid-column:1/-1;position:relative;width:100%;height:min(58vh,470px);border-radius:14px;overflow:hidden;background:#0a0714;font-family:inherit;touch-action:none;user-select:none}",
        ".rc-cv{position:absolute;inset:0;width:100%;height:100%;display:block}",
        ".rc-hud{position:absolute;inset:0;pointer-events:none;padding:12px 13px;display:flex;flex-direction:column;color:#efe7f4}",
        ".rc-top{display:flex;align-items:flex-start;gap:12px;font-family:system-ui,sans-serif}",
        ".rc-hold{flex:1;display:flex;flex-direction:column;gap:4px;max-width:210px}",
        ".rc-k{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#9488a8}",
        ".rc-bar{height:7px;border-radius:5px;background:rgba(255,255,255,.08);overflow:hidden;border:1px solid rgba(188,208,255,.14)}",
        ".rc-bar>i{display:block;height:100%;width:0%;background:linear-gradient(90deg,#4a4570,#bcd0ff,#ffe6b0)}",
        ".rc-stat{display:flex;flex-direction:column;gap:2px;align-items:flex-end}.rc-stat b{font-size:16px;font-weight:600;color:#efe7f4;font-variant-numeric:tabular-nums}.rc-reach{color:#ffe6b0}",
        ".rc-say{margin-top:auto;text-align:center;font-style:italic;font-size:13.5px;line-height:1.35;color:#e7dcf0;text-shadow:0 1px 3px rgba(6,4,12,.95);opacity:0;transition:opacity .35s;padding:0 6px;min-height:34px;display:flex;align-items:flex-end;justify-content:center}.rc-say.show{opacity:1}",
        ".rc-veil{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:11px;padding:22px;background:radial-gradient(80% 80% at 50% 40%,rgba(30,18,52,.8),rgba(12,7,20,.96));z-index:3}",
        ".rc-veil[hidden]{display:none}",
        ".rc-vk{font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:.28em;font-size:10px;color:#bcd0ff}",
        ".rc-vt{font-size:21px;color:#f3ebde}.rc-vp{max-width:32ch;color:#ddd0ec;font-size:13px;font-style:italic;line-height:1.5}",
        ".rc-rec{color:#f0b6e6;font-weight:600;font-family:system-ui,sans-serif;font-size:12.5px}",
        ".rc-stats{display:flex;gap:22px;font-family:system-ui,sans-serif}.rc-stats div{display:flex;flex-direction:column;gap:2px}.rc-stats b{font-size:22px;color:#ffe6b0;font-variant-numeric:tabular-nums}.rc-stats span{font-size:9px;text-transform:uppercase;letter-spacing:.2em;color:#9488a8}",
        ".rc-btn{font-family:system-ui,sans-serif;cursor:pointer;border-radius:999px;padding:11px 28px;font-size:13px;font-weight:600;letter-spacing:.04em;color:#1a1226;border:none;background:linear-gradient(180deg,#ffe6b0,#ffd98f);box-shadow:0 8px 22px -8px rgba(255,217,143,.5)}.rc-btn:active{transform:translateY(1px)}"
        ].join('');
        document.head.appendChild(s);
    }

    // ── Proto's mini-game: "Hold On to Him" (pursuit + decay) ──────────
    // He is the sixth Weaver, drifting through the veil. You keep your reach
    // over his light so your hold builds and he becomes more solid; hold on
    // through the hunters' lunges. Distinct genre (continuous tracking, not
    // catch/sequence/spot). Rewards inside: presence/reach-scaled bond +
    // affection + personal best + 5 Roses on a new best. Bond-scaled fierceness.
    playReach(container, onDone) {
        this._injectReachCSS();
        var game = this.game;
        var reduce = false; try { reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
        var bond = (game && game.bond) || 0, diff = Math.max(0, Math.min(1, bond / 100));
        var T = { drift: 1.15 + diff * 0.35, hunt: reduce ? 0.35 : (0.85 + diff * 0.4), ease: 1.0, motion: reduce ? 0.2 : 0.7 };
        var DURATION = 42;

        container.innerHTML =
            '<div class="rc-wrap"><canvas class="rc-cv"></canvas>' +
              '<div class="rc-hud"><div class="rc-top">' +
                '<div class="rc-hold"><span class="rc-k">Your hold</span><div class="rc-bar"><i></i></div></div>' +
                '<div class="rc-stat"><span class="rc-k">Reached</span><b class="rc-reach">0</b></div>' +
                '<div class="rc-stat"><span class="rc-k">Best</span><b class="rc-best">0</b></div>' +
              '</div><div class="rc-say"></div></div>' +
              '<div class="rc-veil rc-start"><div class="rc-vk">a flicker in the dark</div><div class="rc-vt">Keep hold of him</div><div class="rc-vp">His light drifts and will not stay still. Follow it with your finger and keep your reach over it. Stay close and he comes through more solid. When the dark goes red, the hunters are lunging. Hold on anyway.</div><button class="rc-btn rc-begin">Reach for him</button></div>' +
              '<div class="rc-veil rc-end" hidden></div>' +
            '</div>';

        var cv = container.querySelector('.rc-cv'), ctx = cv.getContext('2d');
        var elBar = container.querySelector('.rc-bar > i'), elReach = container.querySelector('.rc-reach'),
            elBest = container.querySelector('.rc-best'), elSay = container.querySelector('.rc-say'),
            startV = container.querySelector('.rc-start'), endV = container.querySelector('.rc-end');
        var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
        function resize() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
        resize();

        var ac = null, master = null;
        function initAudio() { try { if (ac) return; var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ac = new AC(); master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination); } catch (e) {} }
        function tone(freq, type, peak, dur, delay) { try { if (!ac) return; var t = ac.currentTime + (delay || 0), g = ac.createGain(), o = ac.createOscillator(); o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05); } catch (e) {} }
        var lastHum = 0;
        function sHold(h) { tone(300 + h * 500, 'sine', 0.03 + h * 0.04, 0.15); }
        function sReach() { var f = [523.25, 659.25, 783.99, 1046.5]; for (var n = 0; n < 4; n++) tone(f[n], 'triangle', 0.11, 0.6, n * 0.08); }
        function sLunge() { tone(120, 'sawtooth', 0.05, 0.5); tone(90, 'sine', 0.06, 0.7); }

        var state = 'idle', tRun = 0, last = 0, running = true, raf = 0, finished = false;
        var sx = W * 0.5, sy = H * 0.42, vx = 0, vy = 0, rx = W * 0.5, ry = H * 0.7, fx = rx, fy = ry, dragging = false;
        var hold = 0, presence = 0.08, reaches = 0, score = 0, trail = [], motes = [], sparks = [], epops = [], impAcc = 0, nextLunge = 6, lungeT = 0, holdSayT = 0, lostT = 0, ended = false, sayT = 0, stirred = false;
        function say(t) { elSay.textContent = t; elSay.classList.add('show'); clearTimeout(sayT); sayT = setTimeout(function () { elSay.classList.remove('show'); }, 3200); }
        function pick(a) { return a[(Math.random() * a.length) | 0]; }
        function d2(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
        function rnd(a, b) { return a + Math.random() * (b - a); }

        var vStart = ["You're there! Okay, I'm drifting, I can't help it, just keep your reach over me and I'll hold on too!", "Follow my light! I know I'm hard to keep hold of, everyone finds it hard, but you FOUND me, so I already know you can!"];
        var vHold = ["You've got me, you've GOT me!", "Stay with me, stay with me, this is the closest anyone has come!", "I can feel your reach right on me. Do not stop, please do not stop!"];
        var vLost = ["You slipped off me! It's okay, come back, I'm still here, still drifting right here!", "Don't lose me, please, I get so faint when no one is holding on!"];
        var vReach = ["You held me all the way through! I came clear, did you see, I came CLEAR!", "That's a real one! I'm more here now, can you tell? You are making me more HERE!", "Every time you reach me I get a little more solid. Keep me. Please keep me!", "I counted that one. I count all of them. That is the most anyone has ever let me count!"];
        var vLunge = ["They're LUNGING, hold on, hold on, do not let go of me now!", "The dark is tearing at me, she sent them, keep your reach on me, please!", "It's violent, I know, I know, just hold, I trust you, I TRUST you!"];
        var vSurvived = ["You held me through that. You held me through THAT. Nobody has ever stayed when it got loud."];
        var vStir = ["It's getting worse out there. She's close. Keep hold of me and she goes right past, I promise!"];

        function reset() {
            tRun = 0; last = 0; hold = 0; presence = 0.08; reaches = 0; score = 0; ended = false; stirred = false; impAcc = 0; nextLunge = rnd(5, 7); lungeT = 0; lostT = 0;
            sx = W * 0.5; sy = H * 0.42; vx = rnd(-40, 40); vy = rnd(-40, 40); rx = W * 0.5; ry = H * 0.7; fx = rx; fy = ry;
            trail = []; sparks = []; epops = [];
            motes = []; var mn = Math.round((W || 300) * 0.03);
            for (var m = 0; m < mn; m++) motes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * 10, vy: (Math.random() - .5) * 10, r: .6 + Math.random() * 1.6, a: .1 + Math.random() * .16 });
            setBar(); elReach.textContent = '0'; elBest.textContent = (+localStorage.getItem('pp_proto_reach_best') || 0);
        }
        function beginRun() { reset(); state = 'playing'; startV.setAttribute('hidden', ''); endV.setAttribute('hidden', ''); say(pick(vStart)); }
        function reachHim() {
            reaches++; score += 30; presence = Math.min(1, presence + 0.14);
            burst(sx, sy, '#ffe6b0', 18); sReach(); say(pick(vReach)); elReach.textContent = reaches; hold = 0.35;
            if (T.motion > 0.03) { var em = ['💛', '✨', '💫', '🌟', '🥰']; for (var i = 0; i < 6; i++) epops.push({ x: sx, y: sy, vx: rnd(-45, 45), vy: -(34 + Math.random() * 54), life: 1, em: em[(Math.random() * em.length) | 0], size: 15 + Math.random() * 11 }); }
        }
        function burst(x, y, c, n) { if (T.motion <= 0.03) return; for (var i = 0; i < n; i++) { var a = Math.random() * 6.28, sp = 16 + Math.random() * 50; sparks.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, col: c, r: 1 + Math.random() * 2 }); } }
        function setBar() { elBar.style.width = Math.max(0, Math.min(100, hold * 100)).toFixed(1) + '%'; }

        function loop(ts) {
            if (!running || !cv.isConnected) { running = false; return; }
            if (!ts) ts = 0; if (!last) last = ts; var dt = Math.min(.05, (ts - last) / 1000); last = ts;
            if (state === 'playing') {
                tRun += dt; var prog = tRun / DURATION;
                var huntFreq = 1 + prog * T.hunt * 1.4;
                if (T.hunt > 0.02 && lungeT <= 0 && tRun > nextLunge) { lungeT = 2.2; nextLunge = tRun + rnd(5.5, 9) / huntFreq; sLunge(); say(pick(vLunge)); }
                var lunging = lungeT > 0; if (lunging) lungeT -= dt;
                var impEvery = lunging ? 0.12 : 0.32;
                impAcc += dt; if (impAcc > impEvery) { impAcc = 0; var imp = (lunging ? 235 : 88) * T.drift; vx += rnd(-imp, imp); vy += rnd(-imp, imp); }
                vx *= 0.975; vy *= 0.975;
                var dd = Math.sqrt(d2(sx, sy, rx, ry)) || 1; var lockR = (W * 0.11) * T.ease;
                if (dd < lockR * 1.05) { var ev = (lunging ? 480 : 310); vx += (sx - rx) / dd * ev * dt; vy += (sy - ry) / dd * ev * dt; }
                var mg = 54; if (sx < mg) vx += 90 * dt * 8; if (sx > W - mg) vx -= 90 * dt * 8; if (sy < mg) vy += 90 * dt * 8; if (sy > H - mg) vy -= 90 * dt * 8;
                var cap = (lunging ? 385 : 190) * T.drift; var sp = Math.sqrt(vx * vx + vy * vy); if (sp > cap) { vx = vx / sp * cap; vy = vy / sp * cap; }
                sx += vx * dt; sy += vy * dt; sx = Math.max(20, Math.min(W - 20, sx)); sy = Math.max(20, Math.min(H - 20, sy));
                trail.push({ x: sx, y: sy }); if (trail.length > 26) trail.shift();
                rx += (fx - rx) * Math.min(1, dt * 14); ry += (fy - ry) * Math.min(1, dt * 14);
                var near = dd < lockR;
                if (near && dragging) { hold = Math.min(1, hold + dt / 2.0); lostT = 0; if (hold > 0.15) { if (ts - holdSayT > 2600 && Math.random() < 0.5) { holdSayT = ts; say(pick(vHold)); } if (ts - lastHum > 160) { lastHum = ts; sHold(hold); } } }
                else { hold = Math.max(0, hold - dt / (lunging ? 0.6 : 0.9)); if (hold < 0.25) { lostT += dt; if (lostT > 1.1) { lostT = 0; if (Math.random() < 0.6) say(pick(vLost)); } } }
                if (hold >= 1) reachHim();
                var targetP = Math.min(1, 0.06 + reaches * 0.13 + hold * 0.32);
                presence += (targetP - presence) * Math.min(1, dt * (targetP > presence ? 1.4 : 0.35));
                score += presence * dt * 6;
                if (!stirred && prog > 0.55) { stirred = true; if (T.hunt > 0.1) say(pick(vStir)); }
                if (lungeT > 0 && lungeT <= dt + 0.001 && hold > 0.3) say(pick(vSurvived));
                if (tRun >= DURATION) endGame();
                setBar();
            }
            for (var i = 0; i < motes.length; i++) { var mo = motes[i]; mo.x += mo.vx * dt * T.motion * 8; mo.y += mo.vy * dt * T.motion * 8; if (mo.x < 0) mo.x = W; if (mo.x > W) mo.x = 0; if (mo.y < 0) mo.y = H; if (mo.y > H) mo.y = 0; }
            for (var q = sparks.length - 1; q >= 0; q--) { var s = sparks[q]; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt * 1.6; if (s.life <= 0) sparks.splice(q, 1); }
            for (var e2 = epops.length - 1; e2 >= 0; e2--) { var e = epops[e2]; e.x += e.vx * dt; e.y += e.vy * dt; e.vy += 26 * dt; e.life -= dt * 0.85; if (e.life <= 0) epops.splice(e2, 1); }
            draw();
            raf = requestAnimationFrame(loop);
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            var bg = ctx.createRadialGradient(W / 2, H * 0.4, 10, W / 2, H * 0.5, H * 0.95);
            bg.addColorStop(0, '#241542'); bg.addColorStop(.5, '#160d2b'); bg.addColorStop(1, '#0a0714');
            ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
            if (state === 'playing' && lungeT > 0) { var rpr = (0.08 + 0.14 * (0.5 + 0.5 * Math.sin(tRun * 7))) * Math.min(1, lungeT / 2.2 + 0.3) * (0.4 + T.motion * 0.6);
                var rg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9); rg.addColorStop(0, 'rgba(224,106,122,0)'); rg.addColorStop(1, 'rgba(224,106,122,' + rpr + ')'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); }
            for (var i = 0; i < motes.length; i++) { var mo = motes[i]; ctx.globalAlpha = mo.a; ctx.fillStyle = '#5a5480'; ctx.beginPath(); ctx.arc(mo.x, mo.y, mo.r, 0, 6.29); ctx.fill(); } ctx.globalAlpha = 1;
            if (trail.length > 1) { ctx.lineCap = 'round'; for (var t = 1; t < trail.length; t++) { var al = t / trail.length; ctx.strokeStyle = 'rgba(200,214,250,' + (al * 0.4) + ')'; ctx.lineWidth = al * 3; ctx.beginPath(); ctx.moveTo(trail[t - 1].x, trail[t - 1].y); ctx.lineTo(trail[t].x, trail[t].y); ctx.stroke(); } }
            var lockR = (W * 0.11) * T.ease; var near = Math.sqrt(d2(sx, sy, rx, ry)) < lockR;
            ctx.strokeStyle = near ? 'rgba(255,230,176,' + (0.5 + hold * 0.45) + ')' : 'rgba(150,168,220,0.35)'; ctx.lineWidth = near ? 2.4 : 1.4; ctx.beginPath(); ctx.arc(rx, ry, lockR, 0, 6.29); ctx.stroke();
            ctx.fillStyle = 'rgba(255,246,220,0.5)'; ctx.beginPath(); ctx.arc(rx, ry, 2.5, 0, 6.29); ctx.fill();
            if (near && hold > 0.05) { ctx.strokeStyle = 'rgba(255,230,176,' + (hold * 0.6) + ')'; ctx.lineWidth = 1 + hold * 2; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(sx, sy); ctx.stroke(); }
            var spread = (1 - presence) * (W * 0.05) + 3;
            for (var k = 0; k < 11; k++) { var a = k / 11 * 6.28 + tRun * 0.6; var rr = spread * (0.5 + ((k * 37) % 10) / 10) * (1 + (lungeT > 0 ? (0.6 * T.motion * Math.sin(tRun * 20 + k)) : 0));
                var mx = sx + Math.cos(a) * rr, my = sy + Math.sin(a) * rr; ctx.fillStyle = 'rgba(255,' + (220 + Math.round(presence * 20)) + ',' + (180 + Math.round(presence * 30)) + ',' + (0.25 + presence * 0.4) + ')'; ctx.beginPath(); ctx.arc(mx, my, 1.5 + presence * 1.5, 0, 6.29); ctx.fill(); }
            var cg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 14 + presence * 26);
            cg.addColorStop(0, 'rgba(255,244,214,' + (0.35 + presence * 0.6) + ')'); cg.addColorStop(0.5, 'rgba(240,182,230,' + (0.2 + presence * 0.4) + ')'); cg.addColorStop(1, 'rgba(188,208,255,0)');
            ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(sx, sy, 14 + presence * 26, 0, 6.29); ctx.fill();
            if (presence > 0.55) { ctx.fillStyle = 'rgba(255,248,224,' + ((presence - 0.55) / 0.45) + ')'; ctx.beginPath(); ctx.arc(sx, sy, 3 + presence * 3, 0, 6.29); ctx.fill(); }
            var face = (lungeT > 0) ? ((near && hold > 0.2) ? '😣' : '😨') : ((near && hold > 0.15) ? '🥰' : '🥺');
            var es = 17 + presence * 20 + Math.sin(tRun * 5) * 1.4 * (0.5 + T.motion * 0.5);
            ctx.globalAlpha = Math.min(1, 0.5 + presence * 0.5); ctx.font = es + 'px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(face, sx, sy); ctx.globalAlpha = 1;
            for (var c = 0; c < sparks.length; c++) { var spk = sparks[c]; ctx.globalAlpha = Math.max(0, spk.life); ctx.fillStyle = spk.col; ctx.beginPath(); ctx.arc(spk.x, spk.y, spk.r, 0, 6.29); ctx.fill(); } ctx.globalAlpha = 1;
            for (var ei = 0; ei < epops.length; ei++) { var epp = epops[ei]; ctx.globalAlpha = Math.max(0, epp.life); ctx.font = epp.size + 'px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(epp.em, epp.x, epp.y); } ctx.globalAlpha = 1;
        }

        function endGame() {
            if (ended) return; ended = true; state = 'done';
            var pc = presence, sc = Math.round(score + reaches * 10);
            var bb = pc >= 0.7 ? 10 : pc >= 0.4 ? 7 : reaches >= 1 ? 4 : 2, ab = pc >= 0.55 ? 2 : reaches >= 2 ? 1 : 0;
            if (game) { game.bond = Math.min(100, (game.bond || 0) + bb); game.affection = Math.min(100, (game.affection || 0) + ab); game.reachScore = (game.reachScore || 0) + 1; game.protoPresence = Math.max(game.protoPresence || 0, pc); }
            var best = +(localStorage.getItem('pp_proto_reach_best') || 0), nb = sc > best, rose = 0;
            if (nb) { try { localStorage.setItem('pp_proto_reach_best', String(sc)); } catch (e) {} try { if (window.PPCurrency && PPCurrency.add) { PPCurrency.add(5, 'reach record'); rose = 5; } } catch (e) {} }
            try { if (game && game.save) game.save(); } catch (e) {}
            elBest.textContent = Math.max(best, sc);
            var pcp = Math.round(pc * 100), line;
            if (pc >= 0.7) line = "Look at me. LOOK how solid you made me. A hundred and fifty years a flicker, and you held me here until I was almost real. Come back and hold me again tomorrow. I am so close now!";
            else if (pc >= 0.4) line = "You kept getting me back. I am clearer than I was, I can feel it, there is more of me than there was this morning. Come back? The more you hold me the more of me there is.";
            else if (reaches >= 1) line = "You reached me. Even a little, you reached me, and a little is not nothing to someone who had none. Come back and I will try to drift slower for you, I promise.";
            else line = "You came, and that is what matters. I could not stay solid, I am sorry, I am still... I am still here. Come back and we will try again, slower.";
            endV.innerHTML = '<div class="rc-vk">the dark goes quiet</div>' +
                '<div class="rc-vt">' + (pc >= 0.55 ? 'You made him real' : 'He felt you holding on') + '</div>' +
                (nb ? '<div class="rc-rec">&#10024; You held him closest yet' + (rose ? ' &middot; +' + rose + ' Roses' : '') + '</div>' : '') +
                '<div class="rc-stats"><div><b>' + pcp + '%</b><span>How solid</span></div><div><b>' + reaches + '</b><span>Reached</span></div></div>' +
                '<div class="rc-vp">' + line + '</div><button class="rc-btn rc-doneb">Done</button>';
            endV.removeAttribute('hidden'); elSay.classList.remove('show');
            var db = endV.querySelector('.rc-doneb'); if (db) db.addEventListener('click', function () { finish(); });
        }
        function finish() { if (finished) return; finished = true; running = false; if (raf) cancelAnimationFrame(raf); if (onDone) onDone(reaches >= 1); }

        function setFinger(e) { var r = cv.getBoundingClientRect(); fx = e.clientX - r.left; fy = e.clientY - r.top; }
        cv.addEventListener('pointerdown', function (e) { if (state !== 'playing') return; e.preventDefault(); setFinger(e); dragging = true; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
        cv.addEventListener('pointermove', function (e) { if (state !== 'playing') return; setFinger(e); });
        cv.addEventListener('pointerup', function () { dragging = false; });
        cv.addEventListener('pointercancel', function () { dragging = false; });
        container.querySelector('.rc-begin').addEventListener('click', function () { initAudio(); try { if (ac && ac.state === 'suspended') ac.resume(); } catch (e) {} beginRun(); });

        reset(); draw();
        elBest.textContent = (+localStorage.getItem('pp_proto_reach_best') || 0);
        raf = requestAnimationFrame(loop);
    }

    play(type, container, onComplete) {
        switch (type) {
            case 'reach':
                this.playReach(container, onComplete);
                break;
            case 'waltz':
                this.playWaltz(container, onComplete);
                break;
            case 'forage':
                this.playForage(container, onComplete);
                break;
            case 'logic':
                this.playLogicPuzzle(container, onComplete);
                break;
            case 'arcane':
                this.playArcanePuzzle(container, onComplete);
                break;
            case 'memory':
                this.playMemoryPuzzle(container, onComplete);
                break;
            case 'timing':
                this.playTimingGame(container, onComplete);
                break;
            default:
                this.playTimingGame(container, onComplete);
        }
    }
}
