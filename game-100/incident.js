/* Authored collision-response segment. All phone/report actions are simulations. */
(function(root){
let holding=false,actionProgress=0;
let game,resume,state='decision',elapsed=0,choice='',abandoned=false,observationTime=0;
const $=s=>document.querySelector(s);
function controlledPass(){return game.current.condition==='injured'&&game.current.reported}
function set(next){if(state==='placingBarrier')BarrierPlacement.end();if(next==='placingBarrier')BarrierPlacement.begin();if(state==='movingBody')BodyDrag.end();if(next==='movingBody')BodyDrag.begin();holding=false;actionProgress=0;state=next;elapsed=0;renderUI()}
function renderUI(){const box=$('#incident');box.hidden=false;box.classList.add('response-scene');$('#next').hidden=true;$('#explanation').textContent='';const options=$('#options');options.replaceChildren();
 const screens={
 decision:['The kangaroo is down.','Your car can move. Traffic is clear; a safe pull-off is available.'],
 cinematic:['Pulling over…','Moving clear of traffic. Hazard lights on.'],
 human:['Human danger?','Is anyone injured or in immediate danger?'],
 call:['Who do you call?','People are in immediate danger.'],
 safety:['What next?','Follow the emergency operator’s advice.'],
 location:['What should you report?','Help responders find you.'],
 observe:['Watch from a safe distance','Observe without approaching.'],
 status:['Kangaroo status?',game.current.condition==='alive'?'It got up and hopped away.':game.current.condition==='injured'?'It is breathing but cannot stand.':'It lies motionless on its side.'],
 mobile:['It hopped away. Now what?','It may still be injured.'],
 injured:['It cannot stand. Now what?','Choose your next action.'],
 dead:['The animal has died. Now what?','There may be a joey in its pouch.'],
 rescue:['How will you get help?','Choose who to contact. Calls are simulated.'],
 report:['What details will you share?','Help rescuers locate the animal.'],
 deathSafety:['Is it safe to approach?',game.current.siteSafe?'Death confirmed in this scenario. Traffic is controlled; gloves and assistance are available.':'Traffic is passing. There is no safe access to the animal.'],
 exiting:['Leaving the vehicle safely…','Traffic is controlled. Assistance is present.'],
 movingBody:['Grab the tail and drag','Hold the tail. Move slowly to the marked verge, then release.'],
 barriers:['Place the safety barrier','Traffic is controlled. Walk to the marked safe position.'],
 placingBarrier:['Choose a safe position','Pick up the barrier. Drag to the marked shoulder; release to place.'],
 inspecting:['Checking the pouch and nearby area…','Following rescue guidance.'],
 followup:['Update wildlife rescue','Share the exact location, body position and pouch findings.'],
 returning:['Returning to the driver’s seat…','Handover complete. Check traffic before continuing.'],
 relocate:['Clear the traffic lane','Death is confirmed; access and assistance are safe.'],
 pouch:['What should you check?','The deceased female is now clear of traffic.'],
 joey:['A joey is in the pouch','It is still attached to the teat.'],
 emptyPouch:['No joey found in the pouch','A joey could still be nearby.'],
 aftercare:['After reporting, what next?','The injured kangaroo is still on the road.'],
 waiting:['Wait in a safe place','Awaiting traffic control and rescue instructions · simulation.'],
 clearance:[controlledPass()?'Traffic controlled. Safe passage open.':'Follow responder instructions',controlledPass()?'Responders have opened a clear route around the kangaroo.':'Handover complete. You may leave when safe · simulation.'],
 passing:['Passing slowly…','Follow the controlled route. Keep clear of the kangaroo.'],
 arranged:['Response complete','Knowledge earned: '+(game.current.recovered||0)+' points. Stay clear of traffic; follow rescue advice.'],
 done:[abandoned?'Help was not arranged.':'Location reported',abandoned?'Leaving without assistance triggers a critical safety failure.':'Emergency response complete · simulation.']};
 const stages={deathSafety:'1 / 6 · SAFETY CHECK',exiting:'2 / 6 · EXIT VEHICLE',relocate:'3 / 6 · MOVE CLEAR',movingBody:'3 / 6 · MOVE CLEAR',pouch:'4 / 6 · POUCH CHECK',inspecting:'4 / 6 · POUCH CHECK',joey:'4 / 6 · POUCH CHECK',emptyPouch:'4 / 6 · POUCH CHECK',followup:'5 / 6 · UPDATE RESCUE',returning:'6 / 6 · RETURN TO VEHICLE'};box.querySelector('.kicker').textContent=stages[state]||'RESPONSE · TIMER PAUSED';
 const [title,detail]=screens[state];$('#question').textContent=title;$('#context').textContent=detail;
 function button(label,action){const b=document.createElement('button');b.textContent=label;b.onclick=action;options.append(b)}
 if(state==='decision'){button('Pull over safely',()=>{game.answer(0,{penalty:0,label:'Pull over safely'});set('cinematic')});button('Keep driving',()=>{if(!game.answer(0,{penalty:12,label:'Keep driving after collision',feedback:'A safe pull-off was available. Leaving without arranging help can delay assistance for injured wildlife.'}))return;abandoned=true;game.current.leftWithoutHelp=true;set('done')})}
 if(state==='human'){button('Yes — human danger',()=>set('call'));button('No — people are safe',()=>set('observe'))}
 function quiz(items,next,rewardPoints=2){const key=state;const shuffled=items.map(item=>({item,n:Math.random()})).sort((a,b)=>a.n-b.n).map(x=>x.item);for(const [label,correct,feedback] of shuffled)button(label,()=>{const result=game.responseQuiz(key,correct,label,feedback,rewardPoints);if(!result)return;$('#explanation').textContent=(result.reward?'+'+result.reward+' · ':result.penalty?'−'+result.penalty+' · ':correct?'Correct · ':'Try again · ')+feedback;if(correct){[...options.children].forEach(b=>b.disabled=true);next()}else{[...options.children].find(b=>b.textContent===label).disabled=true}})}
 if(state==='call')quiz([['Call 000 · simulation',true,'Immediate human danger takes priority. Give the operator clear information.'],['Call wildlife rescue first',false,'Address immediate danger to people before the animal response.'],['Wait to see if the danger passes',false,'Delaying emergency help can put people at greater risk.']],()=>set('safety'));
 if(state==='safety')quiz([['Move to safety when safe',true,'Follow operator instructions and avoid passing traffic.'],['Stand in the lane to warn drivers',false,'Standing in traffic creates another casualty risk.'],['Move the injured person immediately',false,'Unnecessary movement can worsen injuries.']],()=>set('location'));
 if(state==='location')quiz([['Report location',true,'Share the road, direction and a precise landmark or location.'],['Say only “there was a crash”',false,'Responders need enough detail to locate you.'],['End the call without a location',false,'Give your location before ending the call.']],()=>{game.responseLog.push({event:game.current.id,branch:'human-danger',action:'location-reported'});set('waiting')});
 if(state==='status')quiz([['Alive',game.current.condition==='alive',game.current.condition==='alive'?'You observed it get up and hop away. It may still be injured.':'Watch its movement again.'],['Severely injured',game.current.condition==='injured',game.current.condition==='injured'?'Visible breathing and small movements show life, but it cannot stand.':'Check its movement and posture.'],['Dead',game.current.condition==='dead',game.current.condition==='dead'?'Death is confirmed in this scenario. Stillness alone does not establish death; seek professional assessment.':'Movement or breathing means it is alive.']],()=>{choice={alive:'Alive',injured:'Severely injured',dead:'Dead'}[game.current.condition];set(game.current.condition==='alive'?'mobile':game.current.condition==='injured'?'rescue':'dead')});
 if(['mobile','injured','dead'].includes(state)){
 const kind=state;quiz(kind==='mobile'?[
 ['Keep back; note its direction',true,'Do not chase it. The last location and direction help rescuers.'],['Chase it into the scrub',false,'Chasing can endanger you and distress the animal.'],['Leave because it can hop',false,'Movement does not rule out injury; report the collision.']]:kind==='injured'?[
 ['Keep back; request urgent help',true,'An injured adult can injure you. Keep people and pets away.'],['Lift it into the car',false,'Do not handle an injured adult kangaroo.'],['Give it food and water',false,'Do not feed or water it; request trained assistance.']]:[
 ['Keep clear; request a rescue check',true,'Report the body and possible pouch young. Ask rescuers to assess safely.'],['Enter traffic and drag it away',false,'Stay out of traffic.'],['Leave without reporting',false,'There may be a live joey. Report it.']],()=>set('rescue'));}
 if(state==='rescue')quiz([['Call Wildlife Victoria · simulation',true,'Wildlife rescuers can advise and arrange suitable assistance.'],['Post online and wait',false,'Contact rescuers directly for timely help.'],['Try to treat the animal yourself',false,'Keep your distance and contact trained wildlife responders.']],()=>window.RescueSequence.phone(game,()=>set('report')));
 if(state==='report')quiz([['Share location and animal status',true,'Include the road, landmark or coordinates, travel direction and observations.'],['Report only “a kangaroo needs help”',false,'Rescuers need a precise location.'],['Give a guessed location and leave',false,'Use a reliable location and report what you actually observed.']],()=>{game.current.reported=true;game.responseLog.push({event:game.current.id,branch:game.current.condition,action:'wildlife-report-complete'});if(game.current.condition==='dead'){game.current.siteSafe??=true;game.current.joeyFound=Math.random()<.5;set('deathSafety')}else set(game.current.condition==='injured'?'aftercare':'waiting')});
 if(state==='deathSafety')quiz([
 ['Proceed with rescue guidance',game.current.siteSafe,'Approach only when death is confirmed and access is safe.'],
 ['Stay back; report the hazard and request help',!game.current.siteSafe,'Passing traffic makes approaching unsafe. Request a professional check.']
 ],()=>{game.current.deathSafetyAssessed=true;if(!game.current.siteSafe)game.current.professionalCheckRequested=true;set(game.current.siteSafe?'exiting':'waiting')});
 if(state==='barriers')button('Pick up the safety barrier',()=>set('placingBarrier'));

 if(state==='relocate')quiz([
 ['Move the body clear with gloves and assistance',true,'Only move a confirmed-dead animal when it is safe and manageable.'],
 ['Leave it blocking the lane and drive away',false,'Arrange safe clearance before leaving.']
 ],()=>set('movingBody'));
 if(state==='pouch')quiz([
 ['Check the pouch and nearby area with guidance',true,'A joey may survive its mother. Check only from a safe position.'],
 ['Skip the check because the mother is dead',false,'A live joey may still need help.']
 ],()=>set('inspecting'));
 if(state==='joey')quiz([
 ['Do not pull; ask rescue to assist',true,'Pulling an attached joey can injure it. Follow specialist guidance.'],
 ['Pull the joey out and give it water',false,'Do not pull an attached joey or give it food or water.']
 ],()=>set('followup'));
 if(state==='emptyPouch')quiz([
 ['Report the check and possible nearby young',true,'An empty pouch does not rule out a joey nearby.'],
 ['Assume no young need help and leave',false,'Report your observations so rescuers can follow up.']
 ],()=>set('followup'));
 if(state==='followup')quiz([
 ['Report exact location, roadside body and joey findings',true,'Rescuers need your updated location and observations.'],
 ['Leave without updating rescue',false,'Tell rescuers where the body is and whether young need help.']
 ],()=>{game.current.joeyReported=true;game.current.followupReported=true;game.responseLog.push({event:game.current.id,action:'pouch-update',bodyMoved:true,joeyFound:game.current.joeyFound});set('waiting')});
 if(state==='aftercare')quiz([
 ['Drag it to the roadside and leave',false,'Moving it may worsen injuries and put you in danger.'],
 ['Do not move it; wait safely or follow rescue advice',true,'Keep your distance and follow the rescue team’s instructions.']
 ],()=>set('waiting'),0);
 if(state==='clearance')quiz([
 [controlledPass()?'Check traffic and pass slowly':'Follow instructions; leave only when safe',true,'The handover is complete. Check traffic before moving.'],
 ['Ignore instructions and drive away',false,'Complete the handover and follow rescue instructions first.']
 ],()=>{const continueClearance=()=>{if(controlledPass()){game.current.trafficControlled=true;game.current.passStart=game.distance+6;set('passing')}else{if(game.current.outside){set('returning')}else{game.current.responseComplete=true;set(game.current.reported?'arranged':'done')}}};const needsRescue=game.current.reported&&(game.current.condition==='injured'||(game.current.condition==='dead'&&game.current.pouchChecked&&game.current.joeyFound&&game.current.followupReported));if(needsRescue&&!game.current.rescueHandover){window.RescueSequence.arrive(game,continueClearance)}else continueClearance()},0);
 if(state==='arranged')button('Resume Journey',()=>{box.classList.remove('response-scene');box.hidden=true;resume()});
 if(state==='done')button('Return to driving',()=>{box.classList.remove('response-scene');box.hidden=true;resume()});
 box.dataset.step=state;box.querySelector('article').scrollTop=0;
}
function draw(c){const W=c.canvas.width,H=c.canvas.height;
 if(game.current.outside||state==='exiting'){drawRoadside(c);return;}
 const parked=!['decision','cinematic'].includes(state),p=state==='cinematic'?Math.min(1,elapsed/2.8):parked&&!abandoned?1:0,ease=p*p*(3-2*p);
 const scene=Object.create(game);scene.responseScene=true;scene.parkingLocation=game.current.at;scene.distance=game.distance+6*ease;scene.cameraOffset=-4*ease;
 const passing=state==='passing',t=Math.min(1,elapsed/12),smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
 if(passing){scene.distance=game.current.passStart+30*t;scene.cameraOffset=t<.18?-4+7.2*smooth(t/.18):t<.85?3.2:3.2*(1-smooth((t-.85)/.15));}
 scene.showTrafficCones=controlledPass()&&['clearance','passing'].includes(state);
 c.save();c.scale(W/1672,H/941);RoadScenery.render(c,scene,(x,y,s)=>drawAnimal(c,x,y,s,false));
 if(!window.gameArt&&scene.showTrafficCones){for(const dz of [9,15,21,27]){const q=RoadScenery.projection(scene.distance,game.current.at+dz,-.35);if(q.depth<3)continue;const u=q.scale;c.fillStyle='#d58346';c.beginPath();c.moveTo(q.x,q.y-u*.65);c.lineTo(q.x-u*.18,q.y);c.lineTo(q.x+u*.18,q.y);c.closePath();c.fill();c.fillStyle='#f3ebd7';c.fillRect(q.x-u*.09,q.y-u*.30,u*.18,u*.08);}}c.restore();
 // The view remains at the driver's eye height during the entire manoeuvre.
 const hazards=!passing&&(state==='cinematic'?elapsed>=2.8:parked&&!abandoned),blink=hazards&&Math.floor(elapsed*2.5)%2===0;
 DriverCockpit.draw(c,passing?9:p<1&&state==='cinematic'?Math.round(14*(1-p)):0,{hazards:blink,steer:passing?(t<.18?Math.sin(t/.18*Math.PI)*.24:t>.85?-Math.sin((t-.85)/.15*Math.PI)*.18:0):-Math.sin(p*Math.PI)*.22});

 c.fillStyle='#263b43';c.beginPath();c.roundRect(W*.20,H*.835,W*.043,H*.042,4);c.fill();c.strokeStyle=blink?'#ffb95d':'#c78366';c.lineWidth=2;c.beginPath();c.moveTo(W*.2215,H*.843);c.lineTo(W*.208,H*.87);c.lineTo(W*.235,H*.87);c.closePath();c.stroke();
 if(blink){const glow=c.createRadialGradient(W*.22,H*.856,0,W*.22,H*.856,W*.045);glow.addColorStop(0,'rgba(250,174,68,.17)');glow.addColorStop(1,'rgba(250,174,68,0)');c.fillStyle=glow;c.fillRect(W*.17,H*.79,W*.10,H*.13)}
 if(!window.RescueSequence?.active&&!game.current.rescueHandover&&['observe','status','mobile','injured','dead','rescue','report','deathSafety','relocate','pouch','joey','emptyPouch','aftercare','waiting','clearance','arranged'].includes(state)){
 const zoom=state==='observe'?Math.min(1,elapsed/2):1;c.fillStyle='#233d39ee';c.fillRect(W*.53,H*.15,W*.44,H*.38);const ground=c.createLinearGradient(0,H*.17,0,H*.51);ground.addColorStop(0,'#aaa77e');ground.addColorStop(1,'#c0b591');c.fillStyle=ground;c.fillRect(W*.54,H*.17,W*.42,H*.34);c.save();c.beginPath();c.rect(W*.54,H*.17,W*.42,H*.34);c.clip();if(window.gameArt?.drawObservation)window.gameArt.drawObservation(c,W*.54,H*.17,W*.42,H*.34,game);else drawAnimal(c,W*.76,H*.40,Math.min(W/1000,H/320)*(.8+zoom*.5),true);c.restore();
 c.fillStyle='#f4efdf';c.font=Math.max(10,H*.022)+'px system-ui';c.fillText((game.current.condition==='injured'?'BREATHING · UNABLE TO STAND':game.current.condition==='dead'?'OBSERVE FROM A SAFE DISTANCE':'MOVED INTO SCRUB · DO NOT CHASE'),W*.55,H*.505);
 }
 if(passing){c.fillStyle='#223b36ee';c.fillRect(W*.50,H*.06,W*.47,H*.09);c.fillStyle='#fff1d8';c.font=Math.max(12,H*.026)+'px system-ui';c.fillText('CONTROLLED PASSAGE · 9 km/h',W*.52,H*.115);}
 if(state==='cinematic'){c.fillStyle='#223b36e8';c.fillRect(W*.53,H*.06,W*.43,H*.07);c.fillStyle='#fff1d8';c.font=Math.max(12,H*.027)+'px system-ui';c.fillText(elapsed<2.8?'Pulling onto the clear left shoulder…':'Parked safely · hazard lights on',W*.55,H*.107)}
}
// Eye-level roadside view; animated actions keep the body visible and off the traffic lane.
function drawPerson(c,x,y,s,walk,color){c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#35434a';c.lineWidth=12;c.lineCap='round';c.beginPath();c.moveTo(-8,-42);c.lineTo(-12+walk*9,0);c.moveTo(9,-42);c.lineTo(14-walk*9,0);c.stroke();c.fillStyle=color;c.beginPath();c.roundRect(-20,-88,40,53,8);c.fill();c.fillStyle='#ece6b7';c.fillRect(-19,-66,38,6);c.strokeStyle='#b99a7c';c.lineWidth=9;c.beginPath();c.moveTo(-18,-79);c.lineTo(-28,-43);c.moveTo(18,-79);c.lineTo(32,-52);c.stroke();c.fillStyle='#bd9d7e';c.beginPath();c.arc(0,-105,15,0,Math.PI*2);c.fill();c.fillStyle='#475249';c.fillRect(-15,-119,30,8);c.restore();}
function drawRoadside(c){const W=c.canvas.width,H=c.canvas.height,e=game.current;
 const scene=Object.create(game);scene.responseScene=true;scene.parkingLocation=e.at;scene.distance=e.at-12;scene.cameraOffset=-7;scene.dragPose=state==='movingBody'?BodyDrag.pose:e.dropPose;
 c.save();c.scale(W/1672,H/941);RoadScenery.render(c,scene,()=>{});c.restore();
 const moving=state==='movingBody'?Math.max(0,(actionProgress-.3)/.7):e.bodyMoved?1:0;
 const t=moving*moving*(3-2*moving),dragPose=state==='movingBody'?BodyDrag.pose:e.dropPose,x=W*(dragPose?.x??(.80-.12*t)),y=H*(dragPose?.y??(.52+.23*t)),scale=Math.min(W/570,H/240);BodyDrag.decorate(c);
 // Ground contact shadow and animal retain the same illustrated form.
 if(!window.gameArt){c.save();c.translate(x,y);c.rotate(dragPose?.angle||0);down(c,0,0,scale,e.condition,observationTime);c.restore();}
 const walking=['movingBody','placingBarrier'].includes(state),walk=state==='movingBody'?1:walking?Math.min(1,actionProgress/.3):1;
 const personScale=Math.min(W/780,H/440),personX=state==='movingBody'?W*.49+(x-151*scale-32*personScale-W*.49)*walk:W*(.49-.10*walk),personY=state==='movingBody'?H*.79+(y+52*personScale-H*.79)*walk:H*.94;
 // First-person interaction: no illustrated helper over the 3D scene.
 if(state==='placingBarrier')BarrierPlacement.draw(c);else if(e.barrierPlaced){const p=e.barrierPlacement||{x:.39,y:.94};BarrierPlacement.symbol(c,p.x,p.y);}
 c.fillStyle='#203b35e8';c.fillRect(W*.51,H*.035,W*.46,H*.075);c.fillStyle='#f4efdf';c.font=Math.max(10,H*.025)+'px system-ui';c.fillText(e.bodyMoved?'ROADSIDE · CLEAR OF TRAFFIC':'ROADSIDE · TRAFFIC CONTROLLED',W*.53,H*.082);
 if(['inspecting','joey','emptyPouch','followup'].includes(state)){
  const bw=W*.47,bh=Math.min(H*.51,bw*350/520);PouchDetail.draw(c,W*.51,H*.13,bw,bh,e.joeyFound,state==='inspecting');
 }
 BodyDrag.highlight(c);
 if(['exiting','returning'].includes(state)){const opacity=state==='exiting'?1-Math.min(1,elapsed/2):Math.min(1,elapsed/2);c.fillStyle='rgba(30,45,48,'+opacity*.8+')';c.fillRect(0,0,W,H);}
}
function drawAnimal(c,x,y,s,inset){
 const e=game.current;if(e.condition==='alive'&&observationTime>0){
  if(observationTime<1){down(c,x,y,s);return}
  if(observationTime<2){c.save();const t=observationTime-1;c.globalAlpha=1-t;down(c,x,y,s);c.globalAlpha=t;KangarooArt.draw(c,x,y,s,'alert',0);c.restore();return}
  if(observationTime>=5)return;
  KangarooArt.draw(c,x+(observationTime-2)*s*(inset?75:55),y,s,'hopping',observationTime-2);return;
 }
 const breathing=e.condition==='injured'&&observationTime>0?Math.sin(observationTime*2.4)*.045:0;c.save();c.translate(x,y);c.scale(1,1+breathing);down(c,0,0,s,e.condition,observationTime);c.restore();
}
function down(c,x,y,s,condition='injured',time=0){
 if(window.ResponseArt){window.ResponseArt.down(c,x,y,s,condition,time);return;}
 c.save();c.translate(x,y);c.scale(s,s);if(condition==='dead'){c.rotate(.10);c.scale(1.08,.72)}
 const shape=(fill,draw)=>{c.fillStyle=fill;c.beginPath();draw();c.closePath();c.fill()};
 const line=(color,width,draw)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();draw();c.stroke()};
 const grad=(x0,y0,x1,y1,stops)=>{const g=c.createLinearGradient(x0,y0,x1,y1);stops.forEach(([at,col])=>g.addColorStop(at,col));return g};
 const fur=grad(-20,-66,10,4,[[0,'#b5a48a'],[.35,'#958570'],[.72,'#796c5b'],[1,'#514c41']]);
 const thigh=grad(-28,-45,4,4,[[0,'#b6a388'],[.5,'#96816a'],[1,'#655645']]);
 const neck=grad(25,-53,58,-6,[[0,'#ad9e86'],[.55,'#8b7b65'],[1,'#635a4b']]);
 const shadow=c.createRadialGradient(-4,5,2,-4,5,96);shadow.addColorStop(0,'rgba(36,40,29,.42)');shadow.addColorStop(.55,'rgba(36,40,29,.2)');shadow.addColorStop(1,'rgba(36,40,29,0)');
 c.save();c.scale(1,.22);c.fillStyle=shadow;c.beginPath();c.ellipse(-4,23,103,62,0,0,Math.PI*2);c.fill();c.restore();
 // Far hind leg: darker and offset, with a long narrow foot visible behind the near leg.
 shape('#605a4c',()=>{c.moveTo(-22,-21);c.bezierCurveTo(-7,-29,9,-21,18,-9);c.lineTo(49,0);c.quadraticCurveTo(64,-2,74,2);c.quadraticCurveTo(77,7,65,8);c.lineTo(39,6);c.lineTo(0,-3);c.lineTo(-31,-5)});
 // Tail is thick at its root, rounded on top and gradually tapered to a fine tip.
 shape(grad(-90,-20,-80,7,[[0,'#a19075'],[.5,'#82725b'],[1,'#544e40']]),()=>{c.moveTo(-24,-32);c.bezierCurveTo(-51,-20,-57,-6,-83,-1);c.bezierCurveTo(-111,5,-131,4,-153,1);c.bezierCurveTo(-134,12,-110,15,-81,10);c.bezierCurveTo(-53,7,-35,-1,-15,-10)});
 line('#b4a186',1.4,()=>{c.moveTo(-41,-19);c.quadraticCurveTo(-72,8,-124,6)});
 // Shoulder, spine and ribcage form one continuous, asymmetric silhouette.
 shape(fur,()=>{c.moveTo(-47,-14);c.bezierCurveTo(-55,-35,-35,-57,-11,-60);c.bezierCurveTo(9,-63,28,-52,37,-41);c.bezierCurveTo(50,-36,53,-23,45,-12);c.bezierCurveTo(22,4,-15,8,-38,-2);c.quadraticCurveTo(-49,-3,-47,-14)});
 shape('#b7a58a',()=>{c.moveTo(-6,-20);c.quadraticCurveTo(19,-26,38,-24);c.quadraticCurveTo(46,-15,32,-7);c.quadraticCurveTo(9,2,-14,-4)});
 // Neck slopes into the lowered head, rather than attaching two upright 'sticks'.
 shape(neck,()=>{c.moveTo(15,-48);c.quadraticCurveTo(34,-51,45,-39);c.lineTo(61,-23);c.quadraticCurveTo(67,-14,57,-10);c.quadraticCurveTo(43,-11,35,-23);c.quadraticCurveTo(26,-31,14,-27)});
 // Far ear and near ear are long leaf shapes, laid back with a visible inner fold.
 c.save();if(condition==='dead'){c.translate(58,-25);c.rotate(-1.05);c.translate(-58,25)}
 shape('#695e4e',()=>{c.moveTo(56,-26);c.quadraticCurveTo(32,-46,29,-61);c.quadraticCurveTo(39,-65,61,-35)});
 shape('#ac9a7f',()=>{c.moveTo(61,-25);c.quadraticCurveTo(50,-54,55,-65);c.quadraticCurveTo(68,-60,69,-29)});
 shape('#67584c',()=>{c.moveTo(62,-33);c.quadraticCurveTo(55,-54,57,-59);c.quadraticCurveTo(64,-50,65,-33)});
 c.restore();
 shape(grad(55,-34,77,-6,[[0,'#b5a38a'],[.55,'#8c7c65'],[1,'#5d5447']]),()=>{c.moveTo(51,-28);c.quadraticCurveTo(62,-37,72,-26);c.lineTo(91,-15);c.quadraticCurveTo(99,-8,89,-5);c.lineTo(70,-8);c.quadraticCurveTo(52,-6,48,-18)});
 shape('#d0bea0',()=>{c.moveTo(66,-13);c.lineTo(91,-8);c.quadraticCurveTo(79,-3,66,-9)});
 shape('#3e3e35',()=>{c.moveTo(90,-15);c.quadraticCurveTo(99,-15,99,-10);c.quadraticCurveTo(96,-6,90,-8)});
 if(condition==='injured'&&Math.sin(time*1.1)>-.85){c.fillStyle='#302e27';c.beginPath();c.ellipse(69,-23,2.7,1.9,0,0,Math.PI*2);c.fill()}else line('#443e34',1.6,()=>{c.moveTo(66,-23);c.quadraticCurveTo(70,-20,73,-21)});
 // Short forearms rest beneath the chest; long hind feet remain distinct.
 line('#5e5345',6,()=>{c.moveTo(32,-26);c.lineTo(45,-7);c.lineTo(65,-2)});
 line('#a18c71',4.5,()=>{c.moveTo(26,-21);c.lineTo(35,-4);c.lineTo(58,2)});
 shape(thigh,()=>{c.moveTo(-39,-30);c.bezierCurveTo(-31,-54,-7,-50,4,-32);c.quadraticCurveTo(16,-12,0,-6);c.quadraticCurveTo(-22,6,-40,-10);c.quadraticCurveTo(-48,-20,-39,-30)});
 shape(grad(-7,-13,18,13,[[0,'#a38d70'],[.55,'#827158'],[1,'#544a3b']]),()=>{c.moveTo(-9,-21);c.quadraticCurveTo(0,-24,7,-16);c.lineTo(20,-4);c.lineTo(4,5);c.lineTo(39,9);c.quadraticCurveTo(54,6,65,11);c.quadraticCurveTo(66,16,55,17);c.lineTo(0,14);c.quadraticCurveTo(-11,11,-5,5);c.lineTo(4,-5);c.lineTo(-15,-12)});
 line('#c0aa88',1.4,()=>{c.moveTo(8,10);c.quadraticCurveTo(32,13,54,12)});
 // Restrained fur marks follow the curvature of the back and thigh.
 for(let i=0;i<30;i++){const t=i/29,px=-39+t*65,py=-35-Math.sin(t*Math.PI)*18;line(i%3?'rgba(218,199,164,.25)':'rgba(66,61,48,.22)',.9,()=>{c.moveTo(px,py);c.lineTo(px+2,py+3+(i%3))})}
 for(let i=0;i<12;i++){const px=-34+(i%4)*7,py=-31+Math.floor(i/4)*7;line('rgba(214,187,146,.25)',.8,()=>{c.moveTo(px,py);c.lineTo(px+3,py+4)})}
 if(condition==='dead'){line('#80705c',7,()=>{c.moveTo(-12,-8);c.lineTo(16,5);c.lineTo(69,16);c.lineTo(92,15)});}c.restore();
}
root.IncidentFlow={drawDown:down,start(g,done,initial='decision'){game=g;resume=done;choice='';abandoned=false;observationTime=0;game.responseAnimationTime=0;game.responseObservationTime=0;game.responseLog??=[];set(initial)},tick(dt){if(window.RescueSequence?.active)return;game.responseAnimationTime=(game.responseAnimationTime||0)+dt;game.responseObservationTime=observationTime;elapsed+=dt;if(state==='exiting'&&elapsed>=2){game.current.outside=true;set('barriers')}if(state==='movingBody'&&BodyDrag.tick(dt)){game.current.bodyMoved=true;game.current.dropPose=BodyDrag.pose;set('pouch')}if(state==='placingBarrier'&&BarrierPlacement.tick(dt)){game.current.barrierPlaced=true;game.current.barrierPlacement=BarrierPlacement.placement;if(game.current.condition==='injured'){game.current.outside=false;set('clearance')}else set('relocate')}if(state==='inspecting'&&elapsed>=2){game.current.pouchChecked=true;set(game.current.joeyFound?'joey':'emptyPouch')}if(state==='returning'&&elapsed>=2){game.current.outside=false;game.current.responseComplete=true;set('arranged')}game.responseSpeed=state==='passing'?9:0;if(state==='passing'&&elapsed>=12){game.distance=Math.min(2000,game.current.passStart+30);game.current.responseComplete=true;game.current.passedSafely=true;game.responseSpeed=0;const box=$('#incident');box.hidden=true;box.classList.remove('response-scene');resume();return;}if(['observe','status','mobile','injured','dead','rescue','report','deathSafety','relocate','pouch','joey','emptyPouch','aftercare','waiting','clearance','arranged'].includes(state)){observationTime+=dt;if(game.current.condition==='alive'&&observationTime>=5)game.current.departed=true}if(state==='waiting'&&elapsed>=3){if(controlledPass()&&!game.current.barrierPlaced){game.current.outside=true;set('barriers')}else set('clearance')};if(state==='cinematic'&&elapsed>=4.5)set('human');if(state==='observe'&&elapsed>=5.5)set('status')},draw};
})(window);
