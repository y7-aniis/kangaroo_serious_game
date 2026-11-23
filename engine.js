/* GDD V1. All numerical parameters are teaching-prototype values. */
(function(root){
const scoring=root.Score100||(typeof require!=='undefined'?require('./scoring.js'):null);
const sections=[
 {at:0,name:'Open country',vegetation:'Dry / short grass',road:'Open straight road',density:0,bend:0},
 {at:250,name:'Long grass',vegetation:'Tall grass',road:'Curved / narrow road',density:1,bend:40},
 {at:500,name:'Open country',vegetation:'Dry / short grass',road:'Open straight road',density:0,bend:0},
 {at:800,name:'Scrub edge',vegetation:'Dense scrub',road:'Restricted roadside view',density:2,bend:-25},
 {at:1050,name:'Woodland edge',vegetation:'Tall grass',road:'Curved / narrow road',density:1,bend:-35},
 {at:1300,name:'Open country',vegetation:'Dry / short grass',road:'Open straight road',density:0,bend:0},
 {at:1550,name:'Fenced passage',vegetation:'Dense scrub',road:'Fence opening with visual obstruction',density:2,bend:25,fence:true},
 {at:1800,name:'Final stretch',vegetation:'Dry / short grass',road:'Open straight road',density:0,bend:0}
];
class Game{
 constructor(){this.reset()}
 reset(){this.responseLog=[];this.limit=180;this.riskChecks=sections.filter(s=>s.density>0).map(s=>({section:s,at:s.at+75,checked:false}));this.distance=0;this.time=0;this.speed=0;scoring.init(this);this.phase='ready';this.control='coast';const crossingSites=[{at:450,sight:100},{at:975,sight:65},{at:1725,sight:45}];this.encounters=crossingSites.map(e=>({...e,at:e.at+(Math.random()-.5)*80})).map((e,i)=>({...e,id:i+1,initialPose:'hopping',startTime:e.at/23-4+(Math.random()-.5)*8,moveSpeed:1.3+Math.random()*.5,direction:Math.random()<.5?1:-1,animationOffset:Math.random(),state:'waiting',result:null,brake:null,trigger:null,stopMargin:null})).map(e=>e.at<600?({...e,type:'open',startX:-9.5,pathLength:19}):({...e,type:'concealed',startTime:null,startX:-4.8,pathLength:14.3,direction:1,moveSpeed:2+Math.random()*.8,revealDistance:38+Math.random()*17,launchDelay:Math.random()*.3}));
 for(const [i,at] of [135,285,595,750,855,1115,1255,1410,1570,1890].entries()){
   this.encounters.push({id:6+i,at,turnDegrees:({135:125,595:180,855:125,1115:180,1255:125,1570:180})[at],sight:80,type:'verge-crossing',initialPose:'alert',
     startTime:null,startX:-5.2,pathLength:13.4,moveSpeed:4.4,direction:i%2?-1:1,
     revealDistance:[33,35,31,28,34,36,32,37,29,33][i],state:'waiting',result:null,brake:null,trigger:null,stopMargin:null});
 }
 this.encounters.sort((a,b)=>a.at-b.at);
 // Assign sides in road order. Preserve the filmed approach and the authored shrub cover.
 const sides=Math.random()<.5?[1,-1,1,-1,-1,1,1,-1,1,-1,-1,1,-1]:
   [-1,-1,1,1,-1,-1,1,-1,1,1,-1,1,1];
 for(const [i,e] of this.encounters.entries()){
   e.direction=sides[i];
   // Longitudinal metres per lateral metre; positive travels away from the driver.
   e.crossSlope=({285:.16,750:-.58,1410:.72,1890:-.45})[e.at]??0;
 }
 // Spread the herd over the route, with extra animals at both dense woodland edges.
 this.roadside=[];
 const addVerge=(at,index)=>this.roadside.push({at,x:(index%2?1:-1)*(5.5+Math.random()*4),
   initialPose:'alert',animationOffset:Math.random()*8,direction:Math.random()<.5?1:-1});
 const generalCount=50-this.encounters.length-16;
 for(let i=0;i<generalCount;i++)addVerge(35+(i+.2+.6*Math.random())*1920/generalCount,i);
 for(const start of [800,1550]){
   for(let i=0;i<8;i++)addVerge(start+12+i*29+Math.random()*12,i);
 }
 this.roadside.sort((a,b)=>a.at-b.at);
 // One resting animal in each quarter of the ordered herd.
 for(let i=0;i<4;i++){
   const first=Math.floor(i*this.roadside.length/4),end=Math.floor((i+1)*this.roadside.length/4);
   this.roadside[first+Math.floor(Math.random()*(end-first))].initialPose='resting';
 }
 this.events=[];this.mistakes=[];this.counts={safe:0,late:0,collision:0,response:0,passed:0,prepared:0,environment:0,comfortable:0};this.current=null;this.result=null;this.responseNode=0;this.answered=new Set();this.notice=null;}
 get score(){return Object.values(this.driving).reduce((a,b)=>a+b,0)+this.knowledge}
 get section(){return sections.filter(s=>s.at<=this.distance).at(-1)}
 get next(){return this.encounters.find(e=>e.state!=='done')}
 start(){this.phase='drive'}
 command(c){if(c==='brake'&&this.control!=='brake'&&this.phase==='drive'&&this.speed*3.6>70){this.hardBrakes++;const penalty=scoring.deduct(this,'smooth',scoring.config.penalties.hardBrake);const e={kind:'smooth',id:'brake-'+this.time,penalty,time:this.time,routeDistance:this.distance,section:{...this.section},choice:'High-speed braking',explanation:'Ease off earlier to avoid braking from high speed.'};this.events.push(e);this.mistakes.push(e)}this.control=c;const e=this.current;if(c==='brake'&&e&&e.state==='danger'&&!e.brake)e.brake={time:this.time,speed:this.speed*3.6,distance:e.at-this.distance,delay:this.time-e.trigger.time}}
 step(dt){if(this.phase!=='drive')return;let remain=Math.min(dt,1);while(remain>1e-8&&this.phase==='drive'){let h=Math.min(remain,.01,this.limit-this.time);if(h<=1e-9){this.end(false);break}this.integrate(h);remain-=h}}
 checkRisk(){for(const check of this.riskChecks){if(check.checked||this.distance<check.at)continue;check.checked=true;const section=check.section,speed=this.speed*3.6,high=section.density===2,target=high?50:70,requested=high?(speed>70?scoring.config.penalties.majorSpeed:speed>50?scoring.config.penalties.speed:0):(speed>70?scoring.config.penalties.speed:0);const explanation=high?'Dense scrub restricts your view. Reach the green band (50 km/h or below) before hidden wildlife appears.':'Tall grass or a bend reduces the view ahead. Reach the yellow band or lower (70 km/h or below).';
 check.prepared=!requested;this.counts[requested?'environment':'prepared']++;const penalty=scoring.deduct(this,'speed',requested);
 const event={kind:'environment',id:'risk-'+section.at,penalty,speed,target,section:{...section},time:this.time,routeDistance:this.distance,explanation};this.events.push(event);if(penalty)this.mistakes.push(event);
 this.notice={title:penalty?'Speed preparation · −'+penalty:'Prepared for the road',detail:penalty?explanation:'You entered this risk section within its target speed. Continue observing; the colour does not guarantee a safe stop.'};}}
 checkWildlife(){for(const e of [...this.encounters,...this.roadside]){const distance=(e.x!==undefined&&!e.type?this.animal(e).z:e.at)-this.distance;const visible=distance>0&&distance<=(e.sight||100)&&(!e.type||!this.animal(e).hidden);if(visible&&e.noticedAt===undefined){e.noticedAt=this.time;e.slowDeadline=this.time+Math.max(1.5,((this.speed*3.6)-50)/25+1);this.notice={title:'Kangaroo visible · slow down',detail:'Reach the green band: 50 km/h or below.'}}if(e.noticedAt===undefined||e.wildlifeChecked)continue;if(this.time<e.slowDeadline&&distance>0)continue;e.wildlifeChecked=true;const penalty=scoring.deduct(this,'speed',this.speed*3.6>50?scoring.config.penalties.visibleWildlife:0);const event={kind:'wildlife',id:'animal-'+e.at,penalty,time:this.time,routeDistance:this.distance,speed:this.speed*3.6,section:{...this.section},choice:'Speed around visible wildlife',explanation:'All visible kangaroos require 50 km/h or below, including resting and head-up animals. A short braking allowance is provided.'};this.events.push(event);if(penalty)this.mistakes.push(event);}}
 animal(e,time=this.time){
  if(e.x!==undefined && !e.type){
    const rest=e.initialPose==='resting';
    const seed=e.animationOffset;
    const wakeAt=(e.noticedAt??time)+3+seed*.35;
    const launch=rest?wakeAt+.65:(e.activeAt??Infinity)+(seed<3?0:seed*.37);
    const elapsed=Math.max(0,time-launch);
    const fast=seed>=4;
    const pace=fast?4.1:2.75;
    // Carry each bound forward. One gradual bend takes the animal into the grass.
    const strideDuration=fast?11/24:14/24;
    const movingDuration=(5+Math.floor(seed))*strideDuration;
    const cycle=movingDuration+1.1+seed*.27;
    const phase=elapsed%cycle;
    const movingTime=Math.floor(elapsed/cycle)*movingDuration+Math.min(phase,movingDuration);
    const travel=movingTime*pace;
    const bend=8+seed*1.5;
    const outward=.38*travel+.40*(travel-bend*(1-Math.exp(-travel/bend)));
    const slope=.38+.40*(1-Math.exp(-travel/bend));
    const side=Math.sign(e.x),along=e.direction??(Math.floor(seed)%2?1:-1);
    return {x:e.x+side*outward,z:e.at+along*travel,
      pose:rest&&time<wakeAt?'resting':time<launch||phase>=movingDuration?'alert':'hopping',fast,
      yaw:Math.atan2(side*slope,-along),direction:side,time:movingTime};

  }
  // Once launched, movement follows the animal clock and never waits for braking.
  const elapsed=e.startTime===null?-1:time-e.startTime,progress=Math.max(0,Math.min(e.pathLength,elapsed*e.moveSpeed));
  if(e.turnDegrees){
    // Pivot at the third Hop_Fast landing. The return leg also ends on contact.
    const cycle=11/24, approach=3*cycle, pivot=.42, exit=(e.turnDegrees===180?4:7)*cycle;
    const inbound=Math.max(0,Math.min(elapsed,approach))*e.moveSpeed;
    const turn=Math.max(0,Math.min(1,(elapsed-approach)/pivot));
    const outbound=Math.max(0,Math.min(exit,elapsed-approach-pivot));
    const angle=e.turnDegrees*Math.PI/180, heading=angle*turn*turn*(3-2*turn);
    const moving=elapsed>=0&&(elapsed<approach||elapsed>=approach+pivot&&outbound<exit);
    return {x:e.direction*(e.startX+inbound+Math.cos(angle)*e.moveSpeed*outbound),
      z:e.at+Math.sin(angle)*e.moveSpeed*outbound,yaw:Math.atan2(e.direction*Math.cos(heading),-Math.sin(heading)),
      direction:e.direction*(Math.cos(heading)>=0?1:-1),pose:moving?'hopping':'alert',
      time:outbound>0?outbound:Math.max(0,Math.min(elapsed,approach)),finished:outbound>=exit};
  }
  return {x:e.direction*(e.startX+progress),z:e.at+progress*(e.crossSlope||0),yaw:Math.atan2(e.direction,-(e.crossSlope||0)),hidden:e.type==='concealed'&&e.startX+progress<-4.35,pose:elapsed>=0&&progress<e.pathLength?'hopping':'alert',time:Math.max(0,elapsed),direction:e.direction};
 }
 occupied(e,time=this.time){return Math.abs(this.animal(e,time).x-(-1.15))<1.3}
 integrate(dt){const old=this.distance,oldV=this.speed;const a=this.control==='accelerate'?3:this.control==='brake'?-( (60/3.6)**2/40 ):0;
 const v=Math.max(0,Math.min(100/3.6,oldV+a*dt)),dx=(oldV+v)*dt/2;
 for(const check of this.riskChecks){if(!check.checked&&old>=check.section.at-100&&old<=check.at&&v<oldV)check.slowed=true;}
 this.time+=dt;this.speed=v;this.distance=Math.min(2000,old+dx);
 for(const e of this.roadside){if(e.activeAt===undefined&&this.distance>=e.at-150)e.activeAt=this.time;}
 this.checkRisk();this.checkWildlife();
 for(const e of this.encounters){
  if(e.state==='done')continue;
  // A minority of encounters are staged at a short sight distance for reaction practice.
  // The roadside cover is visible well before this one-time launch, even at low speed.
  if(e.startTime===null&&this.distance>=e.at-e.revealDistance)e.startTime=this.time+(e.launchDelay||0);
  if(e.state==='waiting'&&this.distance>=e.at-e.sight&&this.distance<=e.at+2&&!this.animal(e).hidden)this.trigger(e);
  if(e.state!=='danger')continue;
  const animal=this.animal(e),animalZ=animal.z,occupied=Math.abs(animal.x+1.15)<1.3,near=Math.abs(animalZ-this.distance)<1.5;
  if(occupied&&(near||(old<animalZ&&this.distance>=animalZ))){this.settle(e,'collision');return}
  e.wasOccupied=e.wasOccupied||occupied;
  if(this.speed===0&&this.distance<e.at&&e.wasOccupied)e.stopMargin=e.at-this.distance;
  const finished=animal.finished??(e.startTime!==null&&this.time>=e.startTime+e.pathLength/e.moveSpeed);
  if(e.stopMargin!==null&&!occupied&&(!e.turnDegrees||finished)){this.settle(e,e.stopMargin>20?'comfortable':e.stopMargin>=10?'safe':'late')}
  else if((!e.turnDegrees&&this.distance>animalZ+2)||finished){e.state='done';this.counts.passed++;this.notice={title:'Kangaroo clear',detail:'The animal followed its own timing. Keep watching the verge; a clear crossing does not prove your speed was safe.'};if(this.current===e)this.current=null}
 }
 if(this.distance>=2000)this.end(true);
 else if(this.time>=this.limit-1e-8)this.end(false);
 }
 trigger(e){e.state='danger';this.current=e;e.trigger={time:this.time,speed:this.speed*3.6,distance:e.at-this.distance,initialPose:e.initialPose,encounterType:e.type,section:{...this.section}};if(this.control==='brake')this.command('brake')}
 settle(e,result){if(e.result)return;e.result=result;const penalty=result==='collision'?scoring.deduct(this,'anticipation',scoring.config.penalties.collisionAnticipation)+scoring.deduct(this,'response',scoring.config.penalties.collisionResponse):scoring.deduct(this,'anticipation',result==='late'?scoring.config.penalties.late:result==='safe'?scoring.config.penalties.close:0);this.counts[result]++;const ev={kind:'driving',id:e.id,result,penalty,time:this.time,routeDistance:this.distance,margin:e.stopMargin??e.at-this.distance,impactSpeed:this.speed*3.6,trigger:e.trigger,brake:e.brake,section:e.trigger.section};this.events.push(ev);if(penalty)this.mistakes.push(ev);this.notice={title:result==='comfortable'?'Well prepared · no deduction':result==='safe'?'Safe stop · −'+penalty:result==='late'?'Close call · −'+penalty:'Collision · −'+penalty,detail:result==='collision'?'Driving time is paused. Assess the incident before continuing.':(e.type==='concealed'?'Dense scrub reduced the visible distance. ':'')+'Stopped with '+(e.stopMargin??e.at-this.distance).toFixed(1)+' m remaining. '+(result==='comfortable'?'More than 20 m earns no deduction.':result==='safe'?'10–20 m leaves limited room; earlier braking can leave more.':'Less than 10 m leaves very little room. Slow earlier.')+' Check the path before moving.'};if(result==='collision'){e.condition=['alive','injured','dead'][Math.floor(Math.random()*3)];e.departed=false;this.speed=0;this.phase='response';this.responseNode=0}else{e.state='done';this.current=null}}
 answer(node,option){const key=this.current.id+':'+node;if(this.phase!=='response'||this.answered.has(key)||node!==this.responseNode)return false;this.answered.add(key);if(option.penalty){this.abandonedIncident=true;const penalty=scoring.deduct(this,'response',scoring.config.penalties.abandon);this.counts.response++;const event={kind:'response',id:this.current.id,time:this.time,routeDistance:this.distance,penalty,correct:false,important:true,choice:option.label,explanation:option.feedback,section:this.current.trigger.section};this.events.push(event);this.mistakes.push(event)}return true}
 responseQuiz(key,correct,label,feedback){if(this.phase!=='response'||!this.current)return null;const e=this.current;e.quiz??={};const important=scoring.config.quiz.importantKeys.includes(key),result=scoring.quiz(this,e.id+':'+key,correct,important);if(!result)return null;e.quiz[key]=correct?'correct':'wrong';e.recovered=(e.recovered||0)+result.reward;const event={kind:'response',id:e.id,time:this.time,routeDistance:this.distance,...result,important,choice:label,explanation:feedback,section:e.trigger.section};this.events.push(event);if(!correct){this.mistakes.push(event);this.counts.response++}return result}
 knowledgeQuiz(key,correct,label,feedback,important=false){const result=scoring.quiz(this,'journey:'+key,correct,important);if(!result)return null;const event={kind:'knowledge',id:key,time:this.time,routeDistance:this.distance,...result,choice:label,explanation:feedback,section:{...this.section}};this.events.push(event);if(!correct)this.mistakes.push(event);return result}
 badges(){const complete=this.result==='Route Complete',collisions=this.encounters.filter(e=>e.result==='collision');return [
 {name:'Safe Driver',earned:complete&&this.counts.collision===0,detail:'Complete the route without a collision.'},
 {name:'Wildlife Protector',earned:complete&&collisions.length>0&&collisions.every(e=>e.responseComplete)&&this.counts.response===0,detail:'Complete every incident response without a wrong decision.'},
 {name:'Risk Observer',earned:complete&&this.riskChecks.filter(c=>c.checked&&c.prepared&&c.slowed).length>=2,detail:'Slow in advance and meet the target in at least 2 risk sections.'}
 ];}
 resume(){if(this.phase!=='response'||(!this.current.responseComplete&&!this.current.leftWithoutHelp))return;this.current.state='done';this.current=null;this.phase='drive';this.control='coast';this.speed=0;this.notice={title:'Resume the route',detail:'Teaching reset: accelerate to continue. Incident-handling time was not counted.'}}
 end(success){this.phase='ended';this.result=success?'Route Complete':'Route Failed';this.time=Math.min(this.limit,this.time);this.speed=0}
}
root.RoadGame=Game;root.RoadSections=sections;if(typeof module!=='undefined')module.exports={Game,sections};
})(typeof window!=='undefined'?window:globalThis);
