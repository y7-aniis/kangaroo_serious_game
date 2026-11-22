(function(root){
function draw(c,speed,options={}){
const W=c.canvas.width,H=c.canvas.height;
const path=(points,fill)=>{c.fillStyle=fill;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fill()};
const ellipse=(x,y,rx,ry,fill)=>{c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
const p=(points,fill)=>path(points.map(([x,y])=>[x*W,y*H]),fill);
const grad=c.createLinearGradient(0,H*.54,0,H);grad.addColorStop(0,'#61717b');grad.addColorStop(.2,'#3c515d');grad.addColorStop(1,'#192d37');
// Dashboard, roof and near A-pillar are composed directly in the available viewport.
p([[0,.57],[.3,.53],[.7,.53],[.87,.56],[1,.7],[1,1],[0,1]],grad);
p([[0,.585],[.3,.55],[.7,.55],[.87,.58],[1,.72],[1,.745],[.85,.6],[.3,.57],[0,.605]],'#243b46');
p([[0,0],[1,0],[1,.06],[.76,.047],[.3,.06],[0,.035]],'#263943');
// Side-window glass is outside the pillar, with an exterior mirror below its sightline.
p([[.91,.06],[1,.055],[1,.69],[.91,.62],[.86,.55],[.9,.3]],'#adc5c4');
p([[.90,.40],[1,.39],[1,.68],[.90,.6],[.875,.55]],'#889c75');
p([[.88,.52],[1,.59],[1,.65],[.875,.57]],'#7d877e');
// External mirror and mounting arm: both on the exterior side of the A-pillar.
p([[.902,.635],[.928,.56],[.953,.56],[.927,.65]],'#1c303a');
c.fillStyle='#182f39';c.beginPath();c.roundRect(W*.928,H*.465,W*.085,H*.18,Math.min(W*.012,H*.025));c.fill();
c.save();c.beginPath();c.roundRect(W*.934,H*.477,W*.074,H*.151,Math.min(W*.008,H*.016));c.clip();c.fillStyle='#b6ced0';c.fillRect(W*.934,H*.477,W*.08,H*.16);
p([[.93,.55],[.954,.524],[.978,.544],[1,.53],[1,.64],[.93,.64]],'#8a9e79');p([[.945,.64],[.984,.55],[.995,.55],[.974,.64]],'#75817f');c.restore();
p([[.872,.02],[.913,.035],[.927,.18],[.90,.44],[.857,.625],[.815,.596],[.864,.40],[.884,.18]],'#273c48');
p([[.884,.055],[.902,.07],[.910,.19],[.882,.44],[.850,.596],[.831,.587],[.868,.423],[.894,.18]],'#74838a');
p([[.857,.625],[1,.666],[1,1],[.835,1],[.815,.69]],'#304955');p([[.87,.673],[1,.712],[1,.74],[.859,.70]],'#7b8c91');
// Centre stack recedes to the left of the driver.
p([[.055,.665],[.285,.626],[.30,.96],[.055,1]],'#263c46');p([[.07,.69],[.269,.655],[.276,.80],[.07,.828]],'#152d37');
for(let i=0;i<5;i++)p([[.085,.706+i*.02],[.254,.678+i*.02],[.255,.684+i*.02],[.085,.712+i*.02]],'#5c717b');
ellipse(W*.14,H*.9,H*.032,H*.032,'#657b84');ellipse(W*.23,H*.89,H*.032,H*.032,'#657b84');
const cx=W*.60,cy=H*.965,r=Math.min(W*.32,H*.48),scale=r/404;
// Instruments and wheel share one driver centre; circles retain their proportions.
c.save();c.translate(cx,cy);c.scale(scale,scale);c.translate(-870,-1003);
// Recessed, compact binnacle attached to the dash rather than the wheel rim.
c.save();c.translate(870,795);c.scale(.80,.80);c.translate(-870,-744);
path([[542,809],[548,718],[582,636],[658,603],[1082,603],[1158,636],[1192,718],[1198,809]],'#142a34');
path([[566,796],[573,718],[607,649],[664,626],[1076,626],[1133,649],[1167,718],[1174,796]],'#293e47');
function gauge(x,y,value,max,label,coloured){ellipse(x,y,104,104,'#52636b');ellipse(x,y,96,96,'#132731');const start=Math.PI*.8,span=Math.PI*1.4;
 if(coloured){[[0,.5,'#8fa57a'],[.5,.7,'#d3b875'],[.7,1,'#be8170']].forEach(([a,b,color])=>{c.strokeStyle=color;c.lineWidth=6;c.beginPath();c.arc(x,y,84,start+a*span,start+b*span);c.stroke()})}
 c.font='14px system-ui';c.fillStyle='#e5e8dd';c.textAlign='center';for(let i=0;i<=10;i++){const angle=start+i/10*span;c.strokeStyle='#afc2c4';c.lineWidth=2;c.beginPath();c.moveTo(x+Math.cos(angle)*76,y+Math.sin(angle)*76);c.lineTo(x+Math.cos(angle)*83,y+Math.sin(angle)*83);c.stroke();if(i%2===0)c.fillText(Math.round(i/10*max),x+Math.cos(angle)*60,y+Math.sin(angle)*60+5)}
 const a=start+Math.min(1,value/max)*span;c.strokeStyle='#e3b287';c.lineWidth=4;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*72,y+Math.sin(a)*72);c.stroke();ellipse(x,y,7,7,'#9bb0b1');c.font='12px system-ui';c.fillText(label,x,y+46);c.textAlign='left';}
gauge(706,742,speed>0?1+speed/40:0,5,'×1000',false);gauge(1034,742,speed,100,'km/h',true);
c.fillStyle='#3d554e';c.beginPath();c.roundRect(814,692,112,96,8);c.fill();c.fillStyle='#f1efdf';c.font='500 38px system-ui';c.textAlign='center';c.fillText(Math.round(speed),870,741);c.font='13px system-ui';c.fillText('km/h',870,769);c.textAlign='left';
c.restore();
c.save();c.translate(870,1003);c.rotate(options.steer||0);c.translate(-870,-1003);
const rim=c.createLinearGradient(0,573,0,1100);rim.addColorStop(0,'#73838c');rim.addColorStop(.15,'#304752');rim.addColorStop(.6,'#192e38');rim.addColorStop(1,'#425965');
c.strokeStyle='#142833';c.lineWidth=75;c.beginPath();c.arc(870,1003,404,0,Math.PI*2);c.stroke();c.strokeStyle=rim;c.lineWidth=55;c.beginPath();c.arc(870,1003,404,0,Math.PI*2);c.stroke();c.strokeStyle='#819098';c.lineWidth=5;c.beginPath();c.arc(870,1003,431,Math.PI*1.08,Math.PI*1.92);c.stroke();
path([[482,858],[633,844],[783,907],[957,907],[1107,844],[1258,858],[1228,908],[1078,924],[980,1020],[760,1020],[660,924],[512,908]],'#657984');
path([[490,879],[633,868],[768,931],[972,931],[1107,868],[1250,879],[1228,908],[1080,924],[990,1030],[750,1030],[660,924],[512,908]],'#304954');
ellipse(870,1000,179,118,'#243d49');ellipse(870,997,166,107,'#3b5360');c.restore();c.restore();
// Interior mirror remains above the centre console, to the driver's left.
c.fillStyle='#263a43';c.fillRect(W*.323,H*.045,W*.012,H*.065);c.beginPath();c.roundRect(W*.218,H*.108,W*.223,H*.112,Math.min(18,H*.025));c.fill();c.save();c.beginPath();c.roundRect(W*.224,H*.119,W*.211,H*.087,Math.min(12,H*.018));c.clip();c.fillStyle='#b9cdd0';c.fillRect(W*.224,H*.119,W*.211,H*.087);p([[.224,.176],[.26,.15],[.30,.173],[.35,.155],[.40,.178],[.44,.16],[.44,.21],[.224,.21]],'#8b9f89');c.restore();
}
root.DriverCockpit={draw};
})(window);
