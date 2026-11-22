import * as T from 'three';import{GLTFLoader}from'three/addons/loaders/GLTFLoader.js';
const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setSize(1672,941);renderer.setPixelRatio(1);renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
const scene=new T.Scene(),camera=new T.PerspectiveCamera(72,1672/941,.025,20);camera.position.set(-.28,1.08,-1.71);camera.lookAt(-.28,1.22,-.4);scene.add(new T.HemisphereLight(0xdceaff,0x70624d,2.8));const light=new T.DirectionalLight(0xffefce,3);light.position.set(-3,5,4);scene.add(light);
const dial=document.createElement('canvas');dial.width=1024;dial.height=512;const c=dial.getContext('2d'),tex=new T.CanvasTexture(dial);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
const panel=new T.Mesh(new T.PlaneGeometry(.205,.095),new T.MeshBasicMaterial({map:tex,transparent:true}));panel.position.set(-.335,.958,-1.251);panel.rotation.y=Math.PI;scene.add(panel);
const grain=document.createElement('canvas');grain.width=grain.height=128;const gc=grain.getContext('2d'),pixels=gc.createImageData(128,128);let seed=9182;for(let i=0;i<pixels.data.length;i+=4){seed=(1664525*seed+1013904223)>>>0;const v=100+seed%55;pixels.data.set([v,v,v,255],i)}gc.putImageData(pixels,0,0);const bump=new T.CanvasTexture(grain);bump.wrapS=bump.wrapT=T.RepeatWrapping;bump.repeat.set(24,24);
function finishMaterials(root){root.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){const n=m.name.toLowerCase();if(/mirror|metal|chrome/.test(n)){m.metalness=.8;m.roughness=.27}else if(/glass/.test(n)){m.roughness=.17}else{m.metalness=0;m.roughness=/gloss/.test(n)?.32:.86;m.bumpMap=bump;m.bumpScale=.00055;if(/color_008|bodypaint/.test(n))m.color.set('#343c40');if(/black|plastic/.test(n))m.color.set('#20262a');}m.needsUpdate=true}})}
// Shift only the right A-pillar region; feather its joints into the existing trim.
function movePillar(root){root.updateMatrixWorld(true);let changed=0;root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;if(!p)return;const inv=o.matrixWorld.clone().invert(),v=new T.Vector3();let touched=false;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);if(v.x<-.40&&v.y>.99&&v.z> -1.75&&v.z<-.35){const w=T.MathUtils.smoothstep(-v.x,.40,.56)*T.MathUtils.smoothstep(v.y,.99,1.17)*T.MathUtils.smoothstep(v.z,-1.75,-1.5)*(1-T.MathUtils.smoothstep(v.z,-.65,-.35));v.x-=.065*w;v.applyMatrix4(inv);p.setXYZ(i,v.x,v.y,v.z);touched=true;changed++}}if(touched){p.needsUpdate=true;o.geometry.computeBoundingSphere()}});return changed}
let wheelPivot,steering=0,lastDistance=null;const steeringAxis=new T.Vector3(0,-.45,.89).normalize();
function setupWheel(root){wheelPivot=new T.Group();wheelPivot.position.set(-.338,.835,-1.383);scene.add(wheelPivot);for(const name of ['Agrupar_66__134502_','Agrupar_67__134503_']){const part=root.getObjectByName(name);if(part)wheelPivot.attach(part)}}
// Move the supplied mirror and its mounting stalk as one assembly.
function placeMirror(root){
 const mirror=new T.Group();scene.add(mirror);
 for(const name of ['__27519_','Agrupar_60__27512_']){const part=root.getObjectByName(name);if(part)mirror.attach(part)}
 // Preserve the original geometry, size, materials and orientation.
 mirror.position.set(-.05,-.007,.055);
}
function turnWheel(){const g=window.environmentPreview?.game;if(!g||!wheelPivot)return;const d=g.distance;if(lastDistance===null){lastDistance=d;return}const delta=d-lastDistance;lastDistance=d;if(delta<0||delta>25){steering=0}else if(delta>0){const curvature=(window.RoadScenery.heading(d+12)-window.RoadScenery.heading(d))/12;const target=T.MathUtils.clamp(curvature*65,-.18,.18);steering=T.MathUtils.lerp(steering,target,1-Math.exp(-delta/5))}wheelPivot.quaternion.setFromAxisAngle(steeringAxis,steering);window.cockpitSteering=steering}
let ready=false;window.cockpitSpeed=0;new GLTFLoader().load('art/assets/interior.glb?v=3',g=>{finishMaterials(g.scene);scene.add(g.scene);const pillarVertices=movePillar(g.scene);setupWheel(g.scene);placeMirror(g.scene);ready=true;window.interiorPreview={camera,scene,renderer,wheelPivot,pillarVertices,ready:true};},undefined,console.error);
function update(speed,hazards){window.cockpitSpeed=speed;c.clearRect(0,0,1024,512);c.fillStyle='#050b0e';c.beginPath();c.roundRect(0,0,1024,512,55);c.fill();
const x=215,y=270,r=174;c.textAlign='center';c.textBaseline='middle';c.lineWidth=9;
// Fine, separated bands on a recessed dial, readable at cockpit scale.
c.save();const dial=c.createRadialGradient(x,y,12,x,y,r+26);dial.addColorStop(0,'#17262b');dial.addColorStop(1,'#080f13');c.fillStyle=dial;c.beginPath();c.arc(x,y,r+26,0,Math.PI*2);c.fill();
c.strokeStyle='#344349';c.lineWidth=2;c.beginPath();c.arc(x,y,r+25,Math.PI*.75,Math.PI*2.25);c.stroke();c.lineCap='round';
for(const [lo,hi,color] of [[0,50,'#75c77d'],[50,70,'#f4cc59'],[70,100,'#e66b59']]){c.strokeStyle=color;c.lineWidth=13;c.beginPath();c.arc(x,y,r+9,Math.PI*.75+lo/100*Math.PI*1.5+.025,Math.PI*.75+hi/100*Math.PI*1.5-.025);c.stroke()}
for(let n=0;n<=100;n+=5){const a=Math.PI*.75+n/100*Math.PI*1.5,major=n%20===0;c.strokeStyle=major?'#d8e2df':'#71858a';c.lineWidth=major?4:2;c.beginPath();c.moveTo(x+Math.cos(a)*r*(major?.85:.91),y+Math.sin(a)*r*(major?.85:.91));c.lineTo(x+Math.cos(a)*r*.97,y+Math.sin(a)*r*.97);c.stroke();if(major){c.fillStyle='#d8e2df';c.font='600 32px sans-serif';c.fillText(n,x+Math.cos(a)*r*.66,y+Math.sin(a)*r*.66)}}
const a=Math.PI*.75+Math.max(0,Math.min(speed,100))/100*Math.PI*1.5;c.translate(x,y);c.rotate(a);c.fillStyle='#eee7d1';c.beginPath();c.moveTo(r*.81,0);c.lineTo(-17,5);c.lineTo(-17,-5);c.closePath();c.fill();c.rotate(-a);c.fillStyle='#839895';c.beginPath();c.arc(0,0,11,0,Math.PI*2);c.fill();c.fillStyle='#203338';c.beginPath();c.arc(0,0,6,0,Math.PI*2);c.fill();c.restore();
c.fillStyle='#ffffff';c.font='bold 184px sans-serif';c.fillText(Math.round(speed),704,230);c.font='44px sans-serif';c.fillStyle='#d2e0e8';c.fillText('km/h',704,60);c.font='42px sans-serif';c.fillText('D',215,450);if(hazards!==undefined){for(const [ax,dir] of [[580,1],[825,-1]]){c.save();c.translate(ax,410);c.scale(dir,1);c.fillStyle=hazards?'#a9d78e':'#354740';c.beginPath();c.moveTo(-24,0);c.lineTo(-3,-17);c.lineTo(-3,-7);c.lineTo(21,-7);c.lineTo(21,7);c.lineTo(-3,7);c.lineTo(-3,17);c.closePath();c.fill();c.restore()}}tex.needsUpdate=true}

// Fixed reference crop. The stage maintains 1280:740, so neither side
// expands on wide monitors and the model is never stretched.
const old=window.DriverCockpit.draw;
window.DriverCockpit.draw=(ctx,speed,options)=>{
 if(!ready||window.artOriginal){old(ctx,speed,options);return}
 const w=ctx.canvas.width,h=ctx.canvas.height;
 if(renderer.domElement.width!==w||renderer.domElement.height!==h){
  renderer.setSize(w,h,false);
  const sourceScale=1672/1364;
  camera.setViewOffset(1672,941,84*sourceScale,29.2,1280*sourceScale,740*sourceScale);
  camera.updateProjectionMatrix();
 }
 update(speed,options?.hazards);turnWheel();if(options?.steer!==undefined&&wheelPivot)wheelPivot.quaternion.setFromAxisAngle(steeringAxis,options.steer);renderer.render(scene,camera);ctx.drawImage(renderer.domElement,0,0,w,h);
};
