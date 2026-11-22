const assert=require('node:assert/strict');
const S=require('./scoring.js');const {Game}=require('./engine.js');
function fresh(){const g=new Game();g.end(true);return g}
let g=fresh();assert.equal(g.score,80);assert.equal(S.quiz(g,'a',false).reward,0);assert.equal(g.score,80);assert.equal(S.quiz(g,'a',true).reward,1);assert.equal(S.quiz(g,'a',true),null);assert.equal(S.quiz(g,'b',true).reward,2);assert.equal(S.quiz(g,'c',true,true).reward,3);
for(let i=0;i<20;i++)S.quiz(g,'cap'+i,true,true);assert.equal(g.knowledge,20);assert.equal(g.score,100);assert.equal(S.evaluate(g).stars,3);
for(const [score,stars] of [[59,0],[60,1],[69,1],[70,2],[84,2],[85,3],[100,3]]){g=fresh();if(score>=80)g.knowledge=score-80;else S.deduct(g,'speed',80-score);assert.equal(S.evaluate(g).stars,stars,String(score))}
g=fresh();g.knowledge=20;g.events=[{kind:'driving',result:'collision',impactSpeed:39}];assert.equal(S.evaluate(g).stars,2);g.events[0].impactSpeed=40;assert.equal(S.evaluate(g).stars,0);S.config.safety.seriousCollisionFails=false;assert.equal(S.evaluate(g).stars,2);S.config.safety.seriousCollisionFails=true;
for(const events of [[{kind:'wildlife',speed:60},{kind:'wildlife',speed:60}],[{kind:'environment',speed:80,section:{density:2}},{kind:'environment',speed:80,section:{density:2}}],[{kind:'response',correct:false,important:true},{kind:'response',correct:false,important:true}]]){g=fresh();g.knowledge=20;g.events=events;assert.equal(S.evaluate(g).stars,2)}
g=fresh();g.knowledge=20;S.deduct(g,'speed',25);S.deduct(g,'anticipation',9);assert.equal(g.score,66);assert.equal(S.evaluate(g).stars,0);
g=fresh();assert.equal(S.deduct(g,'speed',100),25);assert.equal(S.deduct(g,'speed',100),0);g.reset();assert.equal(g.score,80);assert.equal(g.knowledge,0);assert.equal(S.evaluate(g).stars,0);
g=fresh();g.knowledgeQuiz('test',false,'wrong','why',true);assert.equal(g.score,80);g.knowledgeQuiz('test',true,'right','why',true);assert.equal(g.score,81);
console.log('PASS: reward caps, retry, thresholds, safety overrides, category floors, reset, engine quiz integration');
