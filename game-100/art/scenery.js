import {addFinishFlags} from './finish-flag.js?v=white1';
import {createResponseAssets} from './response-assets.js?v=2';
import {createGameKangaroos} from './kangaroos.js?v=turn13';
import {addRoadsideReplacements} from './roadside-replacements.js?v=forest1';
import {addBermudaGrass} from './bermuda-grass.js';
import * as T from 'three';import{GLTFLoader}from'three/addons/loaders/GLTFLoader.js';import './interior.js?v=sharp14';
const legacy=window.RoadScenery; const renderer=new T.WebGLRenderer({antialias:true});renderer.setSize(1,1);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#e8dfbd');scene.fog=new T.Fog('#d9d4be',55,185);const camera=new T.PerspectiveCamera(58,1672/941,.1,230);scene.add(new T.HemisphereLight(0xe5eaf4,0x798576,1.65));const sun=new T.DirectionalLight(0xfff0db,3.0);sun.position.set(-40,55,25);scene.add(sun);scene.add(sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:170});sun.shadow.bias=-.00025;sun.shadow.normalBias=.035;sun.shadow.radius=3;
const skyTexture=await new T.TextureLoader().loadAsync('art/assets/sky/blender-soft-sky.jpg?v=3');skyTexture.colorSpace=T.SRGBColorSpace;const sky=new T.Mesh(new T.SphereGeometry(220,64,32),new T.MeshBasicMaterial({map:skyTexture,side:T.BackSide,depthWrite:false,toneMapped:false,fog:false}));sky.scale.x=-1;sky.frustumCulled=false;scene.add(sky);
let seed=918;function rand(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}const center=legacy.roadX,heading=legacy.heading;const section=d=>RoadSections.filter(s=>s.at<=Math.max(0,d)).at(-1);
await addFinishFlags(scene,center,2000);
// World-space traffic cones share the landscape lighting and perspective.
const trafficCones=new T.Group();scene.add(trafficCones);
const coneOrange=new T.MeshStandardMaterial({color:0xe96520,roughness:.62}),coneWhite=new T.MeshStandardMaterial({color:0xf1efe5,roughness:.36}),coneRubber=new T.MeshStandardMaterial({color:0x252829,roughness:.94});
for(let i=0;i<4;i++){
 const cone=new T.Group();
 const base=new T.Mesh(new T.BoxGeometry(.43,.055,.43),coneRubber);base.position.y=.0275;cone.add(base);
 const radius=y=>.17-(y/.60)*.145;
 const bands=[0,.18,.29,.40,.49,.60];
 for(let j=0;j<bands.length-1;j++){const lo=bands[j],hi=bands[j+1];const m=new T.Mesh(new T.CylinderGeometry(radius(hi),radius(lo),hi-lo,32),j===1||j===3?coneWhite:coneOrange);m.position.y=.055+(lo+hi)/2;cone.add(m);}
 cone.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});trafficCones.add(cone);
}
function updateTrafficCones(g){trafficCones.visible=!!g.showTrafficCones;if(!trafficCones.visible)return;trafficCones.children.forEach((cone,i)=>{const z=g.current.at+9+i*6;cone.position.set(center(z)-.35,.019,-z);cone.rotation.y=.08*i;});}
function vegetationGreen(d){let value=0;for(let i=0;i<RoadSections.length;i++){const a=RoadSections[i],end=RoadSections[i+1]?.at??2200;value+=(a.density/2)*T.MathUtils.smoothstep(d,a.at-35,a.at+45)*(1-T.MathUtils.smoothstep(d,end-35,end+45));}return T.MathUtils.clamp(value,0,1);}
const geometries=new WeakMap(),materials=new WeakMap();function geometry(o){if(!geometries.has(o)){const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);geometries.set(o,g)}return geometries.get(o)}function material(m){if(!materials.has(m))materials.set(m,m.clone());return materials.get(m)}
function height(x,d){
 const off=Math.abs(x-center(d));if(off<7)return -.015;
 // Smoothly blend only the authored vegetation sections into gentle rolling terrain.
 let density=0;for(let i=0;i<RoadSections.length;i++){const s=RoadSections[i],end=RoadSections[i+1]?.at??2200;const fadeIn=T.MathUtils.smoothstep(d,s.at-25,s.at+35),fadeOut=1-T.MathUtils.smoothstep(d,end-25,end+35);density+=s.density*fadeIn*fadeOut;}
 const edge=T.MathUtils.smoothstep(off,7,25),wave=.55+.3*Math.sin(d/31+x/17)+.15*Math.sin(d/57-x/11);
 return -.015+edge*(density*1.8*wave+.06*Math.sin(d/43+x/19));
}
function texture(base,spread){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),im=ctx.createImageData(256,256);for(let i=0;i<im.data.length;i+=4){const n=(rand()-.5)*spread;for(let k=0;k<3;k++)im.data[i+k]=base[k]+n;im.data[i+3]=255}ctx.putImageData(im,0,0);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t}
const earthTex=texture([247,240,211],16),roadTex=texture([67,69,66],30);earthTex.repeat.set(1,1);roadTex.repeat.set(1,1);
const groundMaps=await Promise.all(['color.jpg','normal.png','roughness.png'].map(file=>new T.TextureLoader().loadAsync('art/assets/ground/'+file)));groundMaps.forEach(t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());});groundMaps[0].colorSpace=T.SRGBColorSpace;
const gravelMaps=await Promise.all(['color.jpg','normal.png','roughness.jpg'].map(file=>new T.TextureLoader().loadAsync('art/assets/gravel/'+file)));gravelMaps.forEach(t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());});gravelMaps[0].colorSpace=T.SRGBColorSpace;
const groundMaterial=new T.MeshStandardMaterial({map:groundMaps[0],normalMap:groundMaps[1],normalScale:new T.Vector2(.35,.35),roughnessMap:groundMaps[2],roughness:1,vertexColors:true});
groundMaterial.onBeforeCompile=shader=>{shader.uniforms.gravelMap={value:gravelMaps[0]};shader.vertexShader='attribute float vegetation;varying float turfGreen;varying vec3 groundPosition;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ngroundPosition=position;turfGreen=vegetation;');shader.fragmentShader='varying float turfGreen;uniform sampler2D gravelMap;\nvarying vec3 groundPosition;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat roadOffset=abs(groundPosition.x-(22.0*sin(-groundPosition.z/160.0)+14.0*sin(-groundPosition.z/87.0+0.7)));\nfloat edgeNoise=0.16*sin(groundPosition.z*2.1)+0.12*sin(groundPosition.x*5.7);\nfloat grassBlend=smoothstep(4.0,5.8,roadOffset+edgeNoise);\ndiffuseColor.rgb=mix(texture2D(gravelMap,vec2(groundPosition.x,-groundPosition.z)/2.0).rgb,mix(mix(vec3(.22,.19,.065),vec3(.075,.115,.028),turfGreen),mix(vec3(.34,.29,.115),vec3(.14,.20,.055),turfGreen),clamp(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))*2.0,0.0,1.0)),grassBlend);');};
const terrain=new T.PlaneGeometry(260,2400,100,720);terrain.rotateX(-Math.PI/2);terrain.translate(0,0,-1080);const pa=terrain.attributes.position,col=[];for(let i=0;i<pa.count;i++){let x=pa.getX(i),d=-pa.getZ(i);pa.setY(i,height(x,d));const off=Math.abs(x-center(d)),mix=T.MathUtils.smoothstep(off,4,8),patch=.5+.5*Math.sin(d*.06+x*.23)*Math.sin(x*.41-d*.04),c=new T.Color('#e8eee4').lerp(new T.Color('#c9dfbd'),mix*(.3+.65*patch));col.push(c.r,c.g,c.b)}terrain.setAttribute('color',new T.Float32BufferAttribute(col,3));terrain.setAttribute('vegetation',new T.Float32BufferAttribute(Array.from({length:pa.count},(_,i)=>vegetationGreen(-pa.getZ(i))),1));terrain.computeVertexNormals();for(let i=0;i<pa.count;i++)terrain.attributes.uv.setXY(i,pa.getX(i)/4,pa.getZ(i)/4);scene.add(new T.Mesh(terrain,groundMaterial));
function strip(left,right,material,y=.01,from=-25,to=2200){const pos=[],uv=[],idx=[];for(let d=from;d<=to;d++){for(const x of [left,right]){pos.push(center(d)+x,y,-d);uv.push((x-left)/2,d/2)}if(d<to){let i=(d-from)*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();scene.add(new T.Mesh(g,material))}
const road=new T.MeshStandardMaterial({map:roadTex,roughness:.97}),shoulder=new T.MeshStandardMaterial({map:gravelMaps[0],normalMap:gravelMaps[1],normalScale:new T.Vector2(.45,.45),roughnessMap:gravelMaps[2],roughness:1}),paint=new T.MeshStandardMaterial({color:'#dddcc6',roughness:.9});strip(-4.15,4.15,shoulder,0);strip(-3.5,3.5,road,.014);for(const side of [-1,1])strip(side*3.35-.045,side*3.35+.045,paint,.018);for(let d=-24;d<2200;d+=12)strip(-.045,.045,paint,.019,d,d+4);
// Repeat inexpensive objects, but distribute plants in irregular patches rather than rows.
const chunks=[],dummy=new T.Object3D();function patch(d,x){return .5+.5*Math.sin(d*.21+x*.47)*Math.sin(d*.09-x*.81)}
const models=await Promise.all(['wild','dry','clover','nettle'].map(async name=>({name,g:await new GLTFLoader().loadAsync('art/assets/'+name+'.glb')})));
for(let z=-20;z<2200;z+=20){const group=new T.Group();group.userData.distance=z+10;scene.add(group);chunks.push(group);for(const {name,g} of models){const transforms=[];for(let i=0;i<(name==='nettle'?120:180);i++){const d=z+rand()*20,side=rand()<.5?-1:1,off=(name==='dry'||name==='wild'?5.3:12.5)+rand()*12,x=center(d)+side*off,p=patch(d,x),green=vegetationGreen(d);if(rand()>p*.95||rand()>T.MathUtils.smoothstep(off,4.25,6.5))continue;if(name==='wild'&&rand()>.20+.25*green)continue;if(name==='nettle'&&(rand()>green*.45||off<6))continue;if(name==='dry'&&rand()>.8*(1-green))continue;if(name==='clover'&&rand()>.25+green*.7)continue;const scale=(name==='wild'?.6:name==='dry'?.85:1.8)*(.65+rand()*.8);dummy.position.set(x,height(x,d)+.01,-d);dummy.rotation.set(0,rand()*Math.PI*2,0);dummy.scale.setScalar(scale);dummy.updateMatrix();transforms.push(dummy.matrix.clone())}g.scene.updateMatrixWorld(true);g.scene.traverse(o=>{if(!o.isMesh||!transforms.length)return;const geo=geometry(o);const mat=material(o.material);mat.side=T.DoubleSide;mat.roughness=.98;mat.alphaTest=.45;mat.color.setScalar(1);mat.emissive.set(name==='dry'?'#b99d55':'#739345');mat.emissiveIntensity=.12;const palette=name==='dry'?['#827138','#d7b96b']:name==='wild'?['#526e29','#aabb57']:['#426b31','#94b653'];const low=new T.Color(palette[0]),high=new T.Color(palette[1]);mat.customProgramCacheKey=()=>name+'-warm-v1';mat.onBeforeCompile=shader=>{shader.uniforms.leafLow={value:low};shader.uniforms.leafHigh={value:high};shader.fragmentShader='uniform vec3 leafLow;uniform vec3 leafHigh;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat sourceValue=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b));\ndiffuseColor.a *= smoothstep(0.003,0.018,sourceValue);\nfloat leafDetail=clamp(pow(sourceValue,0.45),0.0,1.0);\ndiffuseColor.rgb=mix(leafLow,leafHigh,leafDetail);')};const mesh=new T.InstancedMesh(geo,mat,transforms.length);transforms.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();group.add(mesh)})}}
// Source trees: Nicholas-3D, CC BY 4.0; see ATTRIBUTION.md.
const forestChunks=[];
const treeAssets=await Promise.all([0,1].map(async type=>Promise.all(['near','far'].map(lod=>new GLTFLoader().loadAsync(`art/assets/tree-${type}-${lod}.glb?v=2`)))));
for(let z=-25;z<2200;z+=25){
 const lodGroups=[new T.Group(),new T.Group()];lodGroups.forEach(g=>scene.add(g));forestChunks.push({d:z+12.5,lods:lodGroups});
 for(let type=0;type<2;type++){
  const matrices=[];
  for(let i=0;i<18;i++){
   const d=z+rand()*25,side=i%2?1:-1,off=8+rand()*25;
   if(rand()>(section(d).density===0?.12:section(d).density===1?.7:1))continue;
   const x=center(d)+side*off;
   dummy.position.set(x,height(x,d)-.08,-d);dummy.rotation.set(0,rand()*Math.PI*2,0);dummy.scale.set(.75+rand()*.4,.75+rand()*.55,.75+rand()*.4);dummy.updateMatrix();matrices.push(dummy.matrix.clone());
  }
  treeAssets[type].forEach((asset,lod)=>{asset.scene.updateMatrixWorld(true);asset.scene.traverse(o=>{
   if(!o.isMesh||!matrices.length)return;
   const geo=geometry(o);const mat=material(o.material);mat.roughness=.9;mat.metalness=0;
   if(mat.name==='Leaves'){
    mat.side=T.DoubleSide;mat.alphaTest=.3;mat.transparent=false;mat.emissive.set('#74894b');mat.emissiveIntensity=.065;
    mat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat leafLight=clamp(pow(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722)),.5),0.,1.);\ndiffuseColor.rgb=mix(vec3(.055,.095,.025),vec3(.30,.39,.105),leafLight);');};
   }
   const mesh=new T.InstancedMesh(geo,mat,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();mesh.castShadow=lod===0;mesh.receiveShadow=true;lodGroups[lod].add(mesh);
  });});
 }
}
scene.traverse(o=>{if(o.isMesh&&o!==sky)o.receiveShadow=true;});
// Delineators remain outside the carriageway.
const postMat=new T.MeshStandardMaterial({color:'#e3e1cc'}),redMat=new T.MeshStandardMaterial({color:'#b9523b'});for(let d=-12;d<2200;d+=18)for(const side of [-1,1]){const post=new T.Mesh(new T.BoxGeometry(.10,.85,.07),postMat);post.position.set(center(d)+side*4.0,.425,-d);scene.add(post);const r=new T.Mesh(new T.BoxGeometry(.065,.13,.015),redMat);r.position.set(post.position.x,.7,-d+.045);scene.add(r)}

const updateBermuda=await addBermudaGrass(scene,center,height,vegetationGreen);
const updateReplacements=await addRoadsideReplacements(scene,center,height,section);
window.ResponseArt=await createResponseAssets();
const updateKangaroos=await createGameKangaroos(scene,center,height);
let activeGame=null;
function projection(travel,z,x=0,h=0){
 
 const v=new T.Vector3(center(z)+x,h,-z).project(camera),up=new T.Vector3(center(z)+x,h+1,-z).project(camera);
 return{x:(v.x+1)*836,y:(1-v.y)*470.5,scale:Math.abs(up.y-v.y)*470.5,depth:z-travel+4};
}
function render(ctx,g,roo){activeGame=g;window.environmentPreview={game:g};
 
 const aspect=ctx.canvas.width/ctx.canvas.height;if(camera.aspect!==aspect){camera.aspect=aspect;camera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(58)/2)*Math.max(1,(1672/941)/aspect)));camera.updateProjectionMatrix();}
 if(renderer.domElement.width!==ctx.canvas.width||renderer.domElement.height!==ctx.canvas.height)renderer.setSize(ctx.canvas.width,ctx.canvas.height,false);
 const d=g.distance;updateTrafficCones(g);updateBermuda(d,false);updateReplacements(g);const lateral=g.responseScene?(g.cameraOffset||0):0;camera.position.set(center(d)-1.6+lateral,1.2,-d+4);camera.lookAt(center(d+20)-1.6+lateral,-1,-d-20);if(g.current?.outside){const z=g.current.at;camera.position.set(center(z+6)-7,1.65,-z-6);camera.lookAt(center(z+18)-3.5,.2,-z-18);}
 camera.updateMatrixWorld();
 if(g.current?.outside){g.responseCamera=camera;const pose=g.dragPose;
 if(pose){const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(pose.x*2-1,1-pose.y*2),camera);const point=new T.Vector3();if(ray.ray.intersectPlane(new T.Plane(new T.Vector3(0,1,0),0),point))g.bodyWorld={x:point.x,z:-point.z};}}
 updateKangaroos(g);
 for(const chunk of chunks)chunk.visible=chunk.userData.distance>d-25&&chunk.userData.distance<d+100&&!(g.current?.outside&&Math.abs(chunk.userData.distance-d)<25);
 for(const chunk of forestChunks){const delta=chunk.d-d,active=delta>-30&&delta<150&&!(g.current?.outside&&Math.abs(delta)<35),far=Math.abs(delta)>75;chunk.lods[0].visible=active&&!far;chunk.lods[1].visible=active&&far}
 sun.position.set(center(d+25)+28,34,-d-50);sun.target.position.set(center(d+25),0,-d-25);sun.target.updateMatrixWorld();sky.position.copy(camera.position);renderer.render(scene,camera);ctx.drawImage(renderer.domElement,0,0,1672,941);

}
function drawObservation(ctx,x,y,w,h,g){
 const e=g.current,z=e.at+18,off=e.bodyMoved?-5.4:-2.4;
 const close=new T.PerspectiveCamera(40,w/h,.1,230);
 close.position.set(center(z)+off+3.7,2.1,-z+5.6);close.lookAt(center(z)+off,.8,-z);
 renderer.render(scene,close);ctx.drawImage(renderer.domElement,x,y,w,h);
}
window.RoadScenery={roadX:center,heading,projection,render};window.gameArt={dragLayout(){const e=activeGame?.current;if(!e)return null;const point=(off,z)=>{const p=new T.Vector3(center(z)+off,0,-z).project(camera);return{x:(p.x+1)/2,y:(1-p.y)/2}};return{start:point(-2.4,e.at+18),target:point(-6,e.at+10)};},drawObservation,ready:true,renderer,scene,get game(){return activeGame},legacy};
