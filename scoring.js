(function(root){
const config={caps:{speed:25,anticipation:25,response:20,smooth:10},knowledgeMax:20,quiz:{normal:2,important:3,retry:1,importantKeys:['call','safety','deathSafety','joey','aftercare','clearance']},penalties:{speed:3,majorSpeed:6,visibleWildlife:3,late:4,close:1,collisionAnticipation:8,collisionResponse:8,hardBrake:2,abandon:12},safety:{seriousCollisionKmh:40,seriousCollisionFails:true,anyCollisionMaxStars:2,repeatedVisibleCount:2,repeatedMajorSectionCount:2,repeatedUnsafeResponseCount:2,criticalMaxStars:2,minimumDrivingToPass:48},stars:{three:85,two:70,one:60}};
function init(g){g.driving={...config.caps};g.knowledge=0;g.knowledgeAnswers={};g.hardBrakes=0;g.abandonedIncident=false;}
function deduct(g,key,n){const paid=Math.min(g.driving[key],Math.max(0,n));g.driving[key]-=paid;return paid}
function quiz(g,key,correct,important=false){const old=g.knowledgeAnswers[key];if(old==='correct')return null;g.knowledgeAnswers[key]=correct?'correct':'retry';const reward=correct?Math.min(config.knowledgeMax-g.knowledge,old==='retry'?config.quiz.retry:important?config.quiz.important:config.quiz.normal):0;g.knowledge+=reward;return{reward,penalty:0,correct,retried:old==='retry'};}
function evaluate(g){const driving=Object.values(g.driving).reduce((a,b)=>a+b,0),total=driving+g.knowledge,events=g.events||[],hits=events.filter(e=>e.kind==='driving'&&e.result==='collision'),visible=events.filter(e=>e.kind==='wildlife'&&e.speed>50),major=events.filter(e=>e.kind==='environment'&&e.section.density===2&&e.speed>70),unsafe=events.filter(e=>e.kind==='response'&&e.correct===false&&e.important),serious=hits.some(e=>e.impactSpeed>=config.safety.seriousCollisionKmh),complete=g.result==='Route Complete';
 let reason='';if(!complete)reason='The route was not completed within the journey time.';else if(serious&&config.safety.seriousCollisionFails)reason='A serious collision occurred: you did not create enough stopping room around wildlife.';else if(g.abandonedIncident)reason='You left a collision without arranging assistance.';else if(driving<config.safety.minimumDrivingToPass)reason='Driving performance was too unsafe; knowledge points cannot replace safe driving.';else if(total<config.stars.one)reason='You need more preparation and stopping room around wildlife.';
 let stars=reason?0:total>=config.stars.three?3:total>=config.stars.two?2:1;const gates=[];
 if(hits.length){stars=Math.min(stars,config.safety.anyCollisionMaxStars);gates.push('A kangaroo collision limits this journey to two stars.')}
 if(visible.length>=config.safety.repeatedVisibleCount){stars=Math.min(stars,config.safety.criticalMaxStars);gates.push('Repeatedly maintaining speed around visible kangaroos limits the rating.')}
 if(major.length>=config.safety.repeatedMajorSectionCount){stars=Math.min(stars,config.safety.criticalMaxStars);gates.push('Repeated excessive speed in dense roadside sections limits the rating.')}
 if(unsafe.length>=config.safety.repeatedUnsafeResponseCount){stars=Math.min(stars,config.safety.criticalMaxStars);gates.push('Repeated unsafe response choices limit the rating.')}
 const good=[],improve=[];
 if((g.riskChecks||[]).some(c=>c.checked&&c.prepared&&c.slowed))good.push('Slowed before restricted-view sections.');
 const wildlife=events.filter(e=>e.kind==='wildlife');if(wildlife.length&&!visible.length)good.push('Kept speed low around visible kangaroos.');
 if(complete&&!hits.length)good.push('Completed the journey without a collision.');
 if(complete&&!g.hardBrakes)good.push('Avoided braking from high speed.');
 if(events.some(e=>e.kind==='environment'&&e.speed>e.target))improve.push('Reduce speed earlier before restricted-view sections.');
 if(visible.length)improve.push('Slow to 50 km/h or below when a kangaroo becomes visible.');
 if(hits.length||events.some(e=>e.result==='late'))improve.push('Create more stopping room around wildlife.');
 if(events.some(e=>e.correct===false))improve.push('Review the response decisions you initially missed.');if(g.hardBrakes)improve.push('Ease off earlier to avoid high-speed braking.');
 return{total,driving,knowledge:g.knowledge,stars,failed:stars===0,complete,reason,gates,good:good.slice(0,3),improve:improve.slice(0,3),categories:Object.entries(config.caps).map(([key,max])=>({key,max,value:g.driving[key]}))};}
root.Score100={config,init,deduct,quiz,evaluate};if(typeof module!=='undefined')module.exports=root.Score100;
})(typeof window!=='undefined'?window:globalThis);
