/* Guided practice uses its own simulation; it never calls the scored game step. */
window.JourneyTutorial=(()=>{
 let game,begin,resetInput,active=false,step=0,elapsed=0,hold=0,blocked=false,animal,braked=false;
 const stage=document.querySelector('#stage'),panel=document.createElement('aside');
 panel.id='journey-tutorial';panel.hidden=true;panel.setAttribute('aria-label','Driving tutorial');
 panel.innerHTML='<div class="tutorial-top"><span id="tutorial-count"></span><button id="tutorial-skip">SKIP TUTORIAL</button></div><div class="tutorial-dots" aria-hidden="true"></div><h2 id="tutorial-title"></h2><p id="tutorial-copy" aria-live="polite"></p><small id="tutorial-hint"></small><button id="tutorial-next" hidden></button>';
 stage.append(panel);
 const $=s=>panel.querySelector(s);
 const instructions=[
 ['A gentle start.','Hold the accelerator to reach 30 km/h.','RIGHT PEDAL · Hold ↑ / W'],
 ['Make room to stop.','Release the accelerator. Hold the brake until you are below 20 km/h.','LEFT PEDAL · Hold SPACE / ↓'],
 ['Look beyond the road.','A kangaroo is waiting on the left beside the bushes. Keep your speed at 50 km/h or below as you approach.','WATCH THE VERGE · Read your speedometer'],
 ['Give it room.','The kangaroo is crossing. Brake to a complete stop and wait until it clears the road.','STOP & WAIT · Keep watching the animal']
 ];
 function completed(){try{return localStorage.getItem('wellington-tutorial-v1')==='done'}catch{return false}}
 function show(n){step=n;elapsed=hold=0;blocked=false;resetInput();$('#tutorial-next').hidden=true;$('#tutorial-count').textContent=`BASICS ${n+1} / 4 · NO TIMER · NO SCORE`;$('.tutorial-dots').innerHTML=[0,1,2,3].map(i=>`<i class="${i<n?'done':i===n?'current':''}"></i>`).join('');$('#tutorial-title').textContent=instructions[n][0];$('#tutorial-copy').textContent=instructions[n][1];$('#tutorial-hint').textContent=instructions[n][2];document.querySelector('#gas').classList.toggle('tutorial-focus',n===0);document.querySelector('#brake').classList.toggle('tutorial-focus',n===1||n===3);}
 function crossing(){game.distance=animal.at-48;game.speed=18/3.6;game.time=0;animal.startTime=0;braked=false;show(3)}
 function finish(){blocked=true;game.speed=0;resetInput();document.querySelectorAll('.tutorial-focus').forEach(e=>e.classList.remove('tutorial-focus'));$('#tutorial-count').textContent='BASICS COMPLETE';$('.tutorial-dots').innerHTML='<i class="done"></i>'.repeat(4);$('#tutorial-title').textContent='Ready for the road.';$('#tutorial-copy').textContent='Observe early. Leave room. Your journey starts fresh with 180 seconds and a new route.';$('#tutorial-hint').textContent='✓ Accelerator   ✓ Braking   ✓ Observation   ✓ Waiting';$('#tutorial-next').hidden=false;$('#tutorial-next').textContent='START JOURNEY →';$('#tutorial-next').onclick=()=>{try{localStorage.setItem('wellington-tutorial-v1','done')}catch{}stop();begin()}}
 function stop(){active=false;blocked=false;panel.hidden=true;stage.classList.remove('tutorial-active');document.body.classList.remove('tutorial-running');document.querySelectorAll('.tutorial-focus').forEach(e=>e.classList.remove('tutorial-focus'));resetInput()}
 function start(){begin();game.reset();game.start();game.encounters=[];game.roadside=[];game.riskChecks=[];active=true;panel.hidden=false;stage.classList.add('tutorial-active');document.body.classList.add('tutorial-running');show(0)}
 function tick(dt){if(!active||blocked)return;elapsed+=dt;game.time+=dt;const old=game.speed,a=game.control==='accelerate'?3:game.control==='brake'?-((60/3.6)**2/40):0;game.speed=Math.max(0,Math.min(60/3.6,old+a*dt));game.distance+=(old+game.speed)*dt/2;
 if(step===0&&game.speed*3.6>=30)show(1);
 else if(step===1&&game.control==='brake'&&game.speed*3.6<=20){game.distance=800;game.time=0;animal={id:'tutorial',at:865,sight:100,type:'open',startX:-5.8,pathLength:14,moveSpeed:1.7,direction:1,animationOffset:0,initialPose:'alert',state:'waiting',result:null,startTime:1e9};game.encounters=[animal];show(2)}
 else if(step===2){if(game.speed*3.6<=50)hold+=dt;else hold=0;if(game.distance>=animal.at-48&&hold>=2)crossing();else if(game.distance>=animal.at-40){game.speed=0;game.distance=animal.at-40;$('#tutorial-copy').textContent='Ease off earlier when you see wildlife. Keep below 50 km/h before continuing.'}}
 else if(step===3){if(game.control==='brake'&&game.speed<.15)braked=true;const clear=game.time>=animal.pathLength/animal.moveSpeed;if(clear&&braked&&game.speed<.15){hold+=dt;if(hold>.8)finish()}else if(!clear&&game.distance>=animal.at-12){blocked=true;game.speed=0;resetInput();$('#tutorial-title').textContent='Try braking a little earlier.';$('#tutorial-copy').textContent='Practice paused before contact. Stop before the crossing and wait for the kangaroo to pass.';$('#tutorial-next').hidden=false;$('#tutorial-next').textContent='RETRY THIS STEP';$('#tutorial-next').onclick=crossing}else if(clear){$('#tutorial-copy').textContent='The road is clear. Bring the car to a complete stop to finish your braking practice.'}}
 }
 function install(g,b,reset){game=g;begin=b;resetInput=reset;const launch=document.createElement('button');launch.id='learn-basics';launch.className='primary';launch.textContent=completed()?'PRACTISE THE BASICS':'LEARN THE BASICS →';launch.disabled=true;Promise.resolve(window.artReady).then(()=>{launch.disabled=false});launch.onclick=start;const original=document.querySelector('#start');original.before(launch);original.textContent=completed()?'START JOURNEY →':'SKIP TUTORIAL · START JOURNEY';$('#tutorial-skip').onclick=()=>{stop();begin()};}
 return{install,tick,stop,get active(){return active},get blocked(){return blocked}};
})();
