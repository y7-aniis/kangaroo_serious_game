/* One world-coordinate projection for road, shoulders, scenery and animals. */
(function(root){
const F=1050,H=285,EYE=1.65;
let cameraOffset=0;
const hash=n=>{const a=Math.sin(n*127.1+311.7)*43758.5453;return a-Math.floor(a)};
function roadX(z){return 22*Math.sin(z/160)+14*Math.sin(z/87+.7)}
function heading(z){return 22/160*Math.cos(z/160)+14/87*Math.cos(z/87+.7)}
function section(z){return RoadSections.filter(s=>s.at<=Math.max(0,z)).at(-1)}
function projection(travel,z,x=0,height=0){const camera=travel-4,depth=z-camera;return {x:836+F*(roadX(z)+x-(roadX(camera)-1.15+cameraOffset)-heading(camera)*depth)/depth,y:H+F*(EYE-height)/depth,scale:F/depth,depth}}
function poly(c,ps,color){c.fillStyle=color;c.beginPath();ps.forEach((p,i)=>i?c.lineTo(p.x??p[0],p.y??p[1]):c.moveTo(p.x??p[0],p.y??p[1]));c.closePath();c.fill()}
function oval(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
function tuft(c,x,y,s,seed,tall){c.strokeStyle=tall?'#9aa56b':'#c4ba83';c.lineWidth=Math.max(.7,s);c.beginPath();for(let k=0;k<7;k++){c.moveTo(x+(k-3)*s*2,y);c.lineTo(x+(k-3)*s*3,y-(4+hash(seed+k)*12)*(tall?2:1)*s)}c.stroke()}
function foliage(c,x,y,s,seed,tree){c.save();c.translate(x,y);c.scale(s,s);if(tree){poly(c,[[-3,0],[-2,-130],[7,-160],[3,-61],[5,0]],'#857f69');poly(c,[[0,-73],[-26,-129],[-22,-132],[3,-94],[34,-151],[38,-149],[5,-77]],'#99907a')}
 const base=tree?-143:-13,count=tree?24:11;
 for(let i=0;i<count;i++){const r=hash(seed+i*7),a=i*2.399;const px=Math.cos(a)*(tree?40:24)*Math.sqrt(r),py=base+Math.sin(a)*(tree?32:13)*Math.sqrt(r);const size=(tree?15:10)+hash(seed+i*3)*10;poly(c,Array.from({length:9},(_,j)=>{const a2=j/9*Math.PI*2;const rr=size*(.8+hash(seed+i*20+j)*.3);return[px+Math.cos(a2)*rr,py+Math.sin(a2)*rr*.8]}),['#627758','#75845b','#8b9668','#566e53','#a2a877'][i%5]);}c.restore()}
const foliageCache=new Map();
function spriteFoliage(c,x,y,s,seed,tree){const variant=((seed%16)+16)%16,key=(tree?'t':'b')+variant;let sprite=foliageCache.get(key);if(!sprite){sprite=document.createElement('canvas');sprite.width=320;sprite.height=440;const b=sprite.getContext('2d');b.scale(2,2);foliage(b,80,210,1,variant*19,tree);foliageCache.set(key,sprite)}c.drawImage(sprite,x-80*s,y-210*s,160*s,220*s)}
function groundColour(z){const s=section(z),idx=RoadSections.indexOf(s),prev=RoadSections[Math.max(0,idx-1)],t=Math.max(0,Math.min(1,(z-s.at)/65)),pal=[[184,178,131],[158,171,119],[133,155,113]],a=pal[prev.density],b=pal[s.density];return 'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')+')'}
function render(c,g,roo){const travel=g.distance,camera=travel-4;cameraOffset=g.cameraOffset||0;
 const sky=c.createLinearGradient(0,0,0,320);sky.addColorStop(0,'#87bfe0');sky.addColorStop(1,'#d3e2df');c.fillStyle=sky;c.fillRect(0,0,1672,650);
 const pan=heading(camera)*-500;
 for(let i=-1;i<6;i++){const x=i*400+pan+100;oval(c,x,95+(i%2)*38,85,13,'#e9eeea');oval(c,x+42,84+(i%2)*38,44,19,'#edf0e9');}
 for(let layer=0;layer<3;layer++){const ps=[[-300,340]];for(let x=-300;x<=2000;x+=45)ps.push([x,258+layer*13+Math.sin((x+pan*(layer+1))/170+layer)*17+Math.sin(x/71+layer)*6]);ps.push([2000,380]);poly(c,ps,['#8babb3','#8fa79d','#9eac89'][layer])}
 // Road segments and terrain are fixed in metres; their screen velocity follows the car.
 const far=camera+720,near=camera+2.4;
 for(let z=Math.floor(far/3)*3;z>near;z-=3){const zn=Math.max(near,z-3),a=projection(travel,z),b=projection(travel,zn);if(b.y<H)continue;c.fillStyle=groundColour(z);c.fillRect(0,a.y,1672,b.y-a.y+1);
  poly(c,[projection(travel,z,-4.25),projection(travel,z,4.25),projection(travel,zn,4.25),projection(travel,zn,-4.25)],'#b6ab89');
  if(g.parkingLocation!==undefined&&Math.abs(z-g.parkingLocation)<65)poly(c,[projection(travel,z,-6.7),projection(travel,z,-3.55),projection(travel,zn,-3.55),projection(travel,zn,-6.7)],Math.floor(z/6)%2?'#b5aa8e':'#b8ad91');
  poly(c,[projection(travel,z,-3.55),projection(travel,z,3.55),projection(travel,zn,3.55),projection(travel,zn,-3.55)],Math.floor(z/18)%2?'#72797a':'#757c7c');
  for(const side of [-1,1])poly(c,[projection(travel,z,side*3.42-.045),projection(travel,z,side*3.42+.045),projection(travel,zn,side*3.42+.045),projection(travel,zn,side*3.42-.045)],'#e9e8d9');
  if(((z%12)+12)%12<6)poly(c,[projection(travel,z,-.05),projection(travel,z,.05),projection(travel,zn,.05),projection(travel,zn,-.05)],'#eceade');
 }
 const objects=[];
 for(let i=Math.floor((camera+2.5)/9);i<Math.ceil(far/9);i++){const z=i*9,s=section(z);for(const side of [-1,1]){const seed=i*19+(side===1?911:77),h=hash(seed);objects.push({z,x:side*(4.7+h*2),kind:'grass',seed,s});if(h>.4||s.density===2)objects.push({z:z+2,x:side*(6+h*6),kind:'bush',seed,s});if((s.density===2&&h>.18)||(s.density===1&&h>.5)||(s.density===0&&h>.79))objects.push({z:z+5,x:side*(8+h*10),kind:'tree',seed,s});if(s.fence&&!(z>1670&&z<1745))objects.push({z,x:side*5.2,kind:'fence',seed,s,side});if(i%4===0)objects.push({z:z+3,x:side*4.15,kind:'post',seed,s})}}
 // Layered patches in wooded sections: preserve open country and keep plants off the carriageway.
 // World-space seeds keep the same patch stable while the car approaches and passes it.
 for(let i=Math.floor((camera+3)/6);i<Math.ceil((camera+360)/6);i++){
  const z=i*6,s=section(z);if(!s.density)continue;
  for(const side of [-1,1]){
   const seed=i*43+(side<0?317:883),patch=.5+.5*Math.sin(z/38+side*2);
   const count=s.density===2?7:3+Math.floor(patch*3);
   for(let j=0;j<count;j++){
    const r=hash(seed+j*11),depth=z+hash(seed+j*17)*5;
    objects.push({z:depth,x:side*(5.8+r*13),kind:'bush',seed:seed+j,s,thicket:true});
    objects.push({z:depth-.8,x:side*(4.5+hash(seed+j*29)*9),kind:'grass',seed:seed+j*3,s});
   }
   const trees=s.density===2?3:patch>.45?2:1;
   for(let j=0;j<trees;j++)objects.push({z:z+hash(seed+j*7)*5,x:side*(9+hash(seed+j*31)*21),kind:'tree',seed:seed+j*13,s});
  }
 }
 // Persistent animals are placed at reset. Being noticed never changes their behaviour.
 for(const e of (g.responseScene?[]:g.roadside)){const a=g.animal(e);if(a.z>camera+2.4&&a.z<far)objects.push({z:a.z,x:a.x,kind:'roo',posture:a.pose,time:a.time,direction:a.direction});}
 for(const e of (g.responseScene?[]:g.encounters)){if(e.result==='collision'){if(!e.departed&&e.at+18>camera+2.4&&e.at+18<far)objects.push({z:e.at+18,x:e.bodyMoved?-5.4:-2.4,kind:'roo',posture:e.condition==='dead'?'down-dead':'down',time:0,direction:1});continue}if(e.at>camera+2.4&&e.at<far){const animal=g.animal(e);
 if(e.type==='concealed'){for(let j=0;j<3;j++)objects.push({z:e.at-1+j*1.7,x:-5.4-j*1.1,kind:'bush',seed:e.id*31+j,cover:true});objects.push({z:e.at+3,x:-7.6,kind:'tree',seed:e.id*51});}
 if(!animal.hidden)objects.push({z:animal.z??e.at,x:animal.x,kind:'roo',posture:animal.pose,time:animal.time,direction:animal.direction});}}

if(g.responseScene)objects.push({z:g.parkingLocation+18,x:g.current.bodyMoved?-5.4:-2.4,kind:'roo',posture:'down',time:0,direction:1});
 objects.sort((a,b)=>b.z-a.z);
 for(const o of objects){if(g.responseScene&&o.kind!=='roo'&&o.x< -3.6&&o.x> -7.2&&Math.abs(o.z-g.parkingLocation)<65)continue;const p=projection(travel,o.z,o.x);if(p.depth<2.4||p.x< -500||p.x>2172)continue;const alpha=Math.min(1,Math.max(0,(720-p.depth)/120));c.globalAlpha=alpha;const unit=p.scale;
  if(o.kind==='roo'){roo(p.x,p.y,unit*.019,o.posture,o.time,1,o.direction);c.globalAlpha=1;continue}
  if(o.kind==='grass')tuft(c,p.x,p.y,unit*.022,o.seed,o.s.density>0);
  if(o.kind==='bush')spriteFoliage(c,p.x,p.y,unit*(o.cover?.065:o.thicket?.027+hash(o.seed)*.012:.019),o.seed,false);
  if(o.kind==='tree'){oval(c,p.x+unit*.8,p.y,unit*1.4,unit*.1,'#84916a');spriteFoliage(c,p.x,p.y,unit*(.031+hash(o.seed+4)*.015),o.seed,true)}
  if(o.kind==='post'){poly(c,[[p.x-unit*.035,p.y],[p.x-unit*.035,p.y-unit*.85],[p.x+unit*.035,p.y-unit*.85],[p.x+unit*.035,p.y]],'#e9e6d3');c.fillStyle='#9d7157';c.fillRect(p.x-unit*.035,p.y-unit*.72,unit*.07,unit*.12)}
  if(o.kind==='fence'){c.fillStyle='#594b39';c.fillRect(p.x-unit*.065,p.y-unit*1.4,unit*.13,unit*1.4);if(section(o.z+9).fence&&!(o.z+9>1670&&o.z+9<1745)){for(const h of [.55,1.1]){const a=projection(travel,o.z,o.x,h),b=projection(travel,o.z+9,o.x,h);c.strokeStyle='#b9a784';c.lineWidth=Math.max(2,unit*.075);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke()}}}
  c.globalAlpha=1;
 }
}
root.RoadScenery={render,projection,roadX,heading};
})(window);
