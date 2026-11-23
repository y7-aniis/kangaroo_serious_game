/* Original canvas silhouettes, with a synchronised hind-leg hop cycle informed by Plate 753. */
(function(root){
function draw(c,x,y,scale,pose,t=0,blend=1,direction=1){
 const fur='#887661',light='#ad9a7e',dark='#665a49',shade='#76654f';
 const oval=(x,y,rx,ry,color,rot=0)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,rot,0,Math.PI*2);c.fill()};
 const limb=(points,width,color)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke()};
 const shape=(color,fn)=>{c.fillStyle=color;c.beginPath();fn();c.closePath();c.fill()};
 function head(x,y,tilt=0){c.save();c.translate(x,y);c.rotate(tilt);
  const twitch=Math.sin(t*1.3)*.04;c.save();c.rotate(twitch);
  shape(dark,()=>{c.moveTo(-5,-2);c.quadraticCurveTo(-17,-27,-10,-29);c.quadraticCurveTo(-1,-24,1,-4)});
  shape(fur,()=>{c.moveTo(2,-3);c.quadraticCurveTo(6,-30,13,-32);c.quadraticCurveTo(18,-24,8,0)});
  limb([[7,-8],[12,-25]],2,light);c.restore();
  shape(fur,()=>{c.moveTo(-10,2);c.quadraticCurveTo(-10,-11,2,-10);c.quadraticCurveTo(10,-8,12,-2);c.lineTo(26,4);c.quadraticCurveTo(29,11,17,10);c.lineTo(2,6)});
  limb([[8,7],[21,9]],2,light);oval(25,5,3,2.5,dark);oval(6,-3,1.6,1.8,'#202723');oval(6.3,-3.5,.4,.4,'#e6dbc4');c.restore();
 }
 function tail(hx,hy,tx,ty){shape(dark,()=>{c.moveTo(hx,hy-7);c.bezierCurveTo(hx-29,hy+5,tx+22,ty+3,tx,ty);c.bezierCurveTo(tx+24,ty+8,hx-20,hy+19,hx+7,hy+9)});}
 function resting(){tail(-22,-12,-103,-1);oval(-8,-15,38,16,fur,.07);oval(9,-12,22,10,light);oval(-27,-13,19,13,shade);limb([[-24,-8],[-3,-2],[29,-1]],7,fur);limb([[20,-20],[28,-8],[45,-5]],4,dark);limb([[15,-19],[23,-5],[41,-3]],4,fur);limb([[16,-20],[28,-35]],12,fur);head(31,-40,-.03);}
 function alert(){const breath=Math.sin(t*1.5)*.6;tail(-12,-31,-94,-1);oval(-5,-42+breath,17,29,fur,.22);oval(4,-40+breath,10,24,light,.22);limb([[3,-58+breath],[17,-79+breath]],13,fur);head(20,-86+breath,.04);limb([[13,-54],[23,-40],[18,-32]],4,dark);limb([[9,-53],[18,-37],[14,-30]],4,fur);oval(-16,-27,17,22,shade,-.2);oval(-9,-27,15,20,fur,-.2);limb([[-12,-23],[3,-18],[-9,-5],[20,-2]],7,dark);limb([[-6,-24],[10,-16],[0,-5],[30,-2]],7,fur);}
 // Pose keys: compression, push-off, extension, airborne tuck, reach, landing.
 const keys=[
  [0,0,12,16,-2,33,23,36],
  [.15,-7,5,24,-26,47,-8,51],
  [.3,-19,-1,21,-37,41,-24,48],
  [.48,-27,15,16,0,31,22,34],
  [.65,-21,23,17,11,35,35,37],
  [.83,-8,13,24,-2,41,24,43],
  [1,0,12,16,-2,33,23,36]
 ];
 function hopping(){const phase=((t/.68)%1+1)%1;let i=0;while(keys[i+1][0]<phase)i++;const a=keys[i],b=keys[i+1],u=(phase-a[0])/(b[0]-a[0]),k=a.map((v,j)=>v+(b[j]-v)*u);const hy=-36+k[1];
  tail(-15,hy+3,-109,hy+31);
  // Long forward-leaning trunk, unlike the upright head-up pose.
  shape(fur,()=>{c.moveTo(-31,hy+8);c.bezierCurveTo(-40,hy-18,-11,hy-35,18,hy-36);c.quadraticCurveTo(34,hy-36,40,hy-49);c.lineTo(52,hy-40);c.quadraticCurveTo(42,hy-19,22,hy-12);c.quadraticCurveTo(0,hy+9,-31,hy+8)});
  shape(light,()=>{c.moveTo(-10,hy+3);c.quadraticCurveTo(18,hy-1,36,hy-29);c.quadraticCurveTo(25,hy-10,8,hy-5);c.lineTo(-15,hy+9)});
  head(49,hy-49,.05);
  limb([[24,hy-23],[32,hy-5],[25,hy+3]],4,dark);limb([[18,hy-22],[23,hy-3],[16,hy+5]],4,fur);
  // Both legs share the same phase; the small offset only reveals the far leg.
  for(const off of [-6,0]){const color=off?dark:fur;oval(-19+off,hy+4,17,21,color,-.55);limb([[-16+off,hy+6],[k[2]+off-15,hy+k[3]],[k[4]+off-15,hy+k[5]],[k[6]+off-15,hy+k[7]]],off?5:7,color);}
  // Small tonal patches retain the muted, illustrated finish at close range.
  oval(-12,hy-18,12,5,shade,-.5);limb([[-22,hy-9],[-13,hy-16]],2,light);
 }
 c.save();c.translate(x,y);c.scale(scale*direction,scale);oval(-10,2,42,3,'rgba(48,59,42,.18)');
 if(pose==='resting')resting();else if(pose==='hopping')hopping();else alert();c.restore();
}
root.KangarooArt={draw};
})(window);
