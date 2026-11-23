/* Abstract world-anchored environment, independent of encounters and risk checks. */
window.RoadMinimapEnvironment={draw(ctx,{distance,point,zoom,r,style="patches",sections=RoadSections,roadX=RoadScenery.roadX}){
 const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
 const density=z=>{let v=0;for(let i=0;i<sections.length;i++){const s=sections[i],end=sections[i+1]?.at??2200;v+=s.density*smooth(s.at-25,s.at+35,z)*(1-smooth(end-25,end+35,z));}return v;};
 const noise=(a,b)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v)};
 const project=(z,off)=>{const p=point(z);return{x:p.x+off*zoom*2.2,y:p.y}};
 function patch(x,y,rx,ry,seed,color){ctx.fillStyle=color;ctx.beginPath();for(let i=0;i<=12;i++){const a=i%12/12*Math.PI*2,k=.83+noise(seed,i%12)*.28;const px=x+Math.cos(a)*rx*k,py=y+Math.sin(a)*ry*k;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();ctx.fill()}
 function crown(x,y,size,seed,forest){
  // Small overlapping canopy lobes: top view, no trunks or pictogram outlines.
  ctx.fillStyle='rgba(7,24,22,.17)';ctx.beginPath();ctx.ellipse(x+size*.2,y+size*.28,size,size*.85,0,0,Math.PI*2);ctx.fill();
  const count=5+Math.floor(noise(seed,17)*3);
  for(let j=0;j<count;j++){const a=j/count*Math.PI*2+noise(seed,18),reach=size*(.36+noise(seed,j+20)*.25),lx=x+Math.cos(a)*reach,ly=y+Math.sin(a)*reach,rr=size*(.48+noise(seed,j+30)*.2);const g=ctx.createRadialGradient(lx-rr*.3,ly-rr*.35,0,lx,ly,rr);g.addColorStop(0,forest?'rgba(104,139,94,.53)':'rgba(142,165,108,.48)');g.addColorStop(1,forest?'rgba(45,80,58,.48)':'rgba(76,112,76,.32)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(lx,ly,rr,0,Math.PI*2);ctx.fill();}
 }
 function grass(x,y,seed){ctx.strokeStyle='rgba(161,179,127,.24)';ctx.lineWidth=Math.max(.4,zoom*.7);for(let j=0;j<9;j++){const gx=x+(noise(seed,j+40)-.5)*22*zoom,gy=y+(noise(seed,j+55)-.5)*22*zoom;ctx.beginPath();ctx.moveTo(gx-zoom,gy+zoom);ctx.lineTo(gx,gy-zoom*1.6);ctx.lineTo(gx+zoom,gy);ctx.stroke();}}
 const start=Math.floor((distance-130)/20)*20,end=distance+240;
 ctx.save();
 // Broad relief shadows follow the same roadside height envelope as the terrain.
 for(let z=start;z<end;z+=40){if(z<0||z>2000)continue;const d=density(z);for(const side of [-1,1]){const off=side*(20+noise(z,side)*20),p=project(z,off),wave=.55+.3*Math.sin(z/31+(roadX(z)+off)/17)+.15*Math.sin(z/57-(roadX(z)+off)/11);const rise=d*1.8*wave;const rx=(18+rise*5)*zoom,ry=30*zoom;ctx.save();ctx.translate(p.x,p.y);ctx.scale(rx,ry);const shade=ctx.createRadialGradient(-.22,-.28,0,0,0,1);shade.addColorStop(0,`rgba(175,184,147,${.025+rise*.025})`);shade.addColorStop(.56,`rgba(15,30,28,${.035+rise*.035})`);shade.addColorStop(1,'rgba(15,30,28,0)');ctx.fillStyle=shade;ctx.fillRect(-1,-1,2,2);ctx.restore();}}
 for(let z=start;z<end;z+=20){if(z<0||z>2000)continue;const d=density(z);for(const side of [-1,1])for(let band=0;band<3;band++){
 const seed=z*3+band*23+side*7,n=noise(seed,1),along=z+(noise(seed,2)-.5)*13;
 const off=side*(8+(1-Math.min(d,2)/2)*8+band*17+(noise(seed,3)-.5)*10),p=project(along,off);
 if(style==='canopy'){
  if(n<.55+d*.12)grass(p.x,p.y,seed);
  if(d>.25&&n<d*.38)crown(p.x,p.y,(5+noise(seed,71)*4)*zoom,seed,false);
  if(d>1&&band>0&&n<.7)for(let k=0;k<3;k++)crown(p.x+(k-1)*9*zoom,p.y+(noise(seed,k+9)-.5)*18*zoom,(7+noise(seed,k)*5)*zoom,seed+k,true);
  continue;
 }
 if(n<.42+d*.22)patch(p.x,p.y,(7+noise(seed,4)*6)*zoom,(8+noise(seed,5)*9)*zoom,seed,'rgba(151,174,117,.17)');
 if(d>.25&&n<d*.38){patch(p.x,p.y,(7+d*2)*zoom,(9+noise(seed,6)*7)*zoom,seed+5,'rgba(109,145,98,.27)');}
 if(d>1&&band>0&&n<.7){for(let k=0;k<3;k++)patch(p.x+(k-1)*7*zoom,p.y+(noise(seed,k+9)-.5)*14*zoom,(8+noise(seed,k)*4)*zoom,12*zoom,seed+k,'rgba(48,86,62,.40)');}
 }}ctx.restore();
}};
