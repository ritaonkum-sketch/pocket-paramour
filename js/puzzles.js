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
        ".fg-bars{margin-top:auto;display:flex;flex-direction:column;gap:5px}"+
        ".fg-bar{height:6px;border-radius:5px;background:rgba(255,255,255,.09);overflow:hidden}"+
        ".fg-bar>i{display:block;height:100%;width:0%;border-radius:5px}"+
        ".fg-pouchfill{background:linear-gradient(90deg,#6f9a3f,#a7c957)}"+
        ".fg-timefill{background:linear-gradient(90deg,#c9a24a,#e8c979)}"+
        ".fg-say{position:absolute;left:14px;right:14px;bottom:12px;pointer-events:none;font-style:italic;font-size:14px;line-height:1.4;color:#f0e8da;text-shadow:0 2px 8px rgba(0,0,0,.75);opacity:0;transition:opacity .35s;z-index:2}"+
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
            '<div class="fg-bars"><div class="fg-bar"><i class="fg-pouchfill"></i></div><div class="fg-bar"><i class="fg-timefill"></i></div></div></div>'+
          '<div class="fg-say"></div>'+
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
          var best=+(localStorage.getItem('pp_forage_best_elian')||0), nb=score>best;
          if(nb){ try{ localStorage.setItem('pp_forage_best_elian',String(score)); }catch(e){} }
          try{ if(game.save) game.save(); }catch(e){}
          container.querySelector('.fg-grade').textContent=gr.g;
          container.querySelector('.fg-big').textContent=score;
          container.querySelector('.fg-meta').innerHTML=(nb?'<b>New best pouch</b>':'Best '+Math.max(best,score))+(moon?' &middot; '+moon+' moonpetal'+(moon>1?'s':''):'');
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
    play(type, container, onComplete) {
        switch (type) {
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
