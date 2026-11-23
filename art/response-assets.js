import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {cloneRig} from '../biome/kangaroo-preview.js';
import {makeProne} from '../actions/prone.js';
export async function createResponseAssets(){
 const gltf=await new GLTFLoader().loadAsync('assets/kangaroo.glb');
 const animal=cloneRig(gltf.scene);animal.scale.setScalar(1.8);animal.rotation.y=-Math.PI/2;
 const mix=new T.AnimationMixer(animal);makeProne(animal,mix,gltf.animations);animal.rotation.y=Math.PI/2;
 const scene=new T.Scene(),renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setSize(900,420);renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 scene.add(new T.HemisphereLight(0xe5eaf4,0x798576,1.65));const light=new T.DirectionalLight(0xfff0db,3);light.position.set(-3,7,5);scene.add(light,animal);
 const camera=new T.OrthographicCamera(-3,3,1.4,-1.4,.01,100),box=new T.Box3();let last='';
 const barrier=new T.Group(),metal=new T.MeshStandardMaterial({color:0x333b3b,metalness:.65,roughness:.5});
 function beam(w,h,d,x,y,z,mat){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);barrier.add(m);}
 for(const x of [-.65,.65]){beam(.055,.8,.07,x,.4,0,metal);beam(.2,.05,.55,x,.025,0,metal)}
 const orange=new T.MeshStandardMaterial({color:0xe9953e,roughness:.7}),white=new T.MeshStandardMaterial({color:0xf5eee0,roughness:.6});beam(1.65,.25,.09,0,.78,0,orange);for(let i=0;i<5;i++)beam(.16,.245,.012,-.67+i*.33,.78,.053,white);
 scene.add(barrier);barrier.visible=false;
 function fit(object){object.updateMatrixWorld(true);object.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.update()});box.setFromObject(object,true);const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3()),w=Math.max(size.x*1.12,size.y*900/420*1.12);camera.left=-w/2;camera.right=w/2;camera.top=w*420/900/2;camera.bottom=-camera.top;camera.position.set(center.x,center.y,center.z+10);camera.lookAt(center);camera.updateProjectionMatrix();camera.updateMatrixWorld();}
 return {
  down(c,x,y,s,condition,time){animal.visible=true;barrier.visible=false;const name=condition==='dead'?'Death':'Prone';if(last!==name){mix.stopAllAction();const a=mix.clipAction(gltf.animations.find(a=>a.name===name)).reset().play();a.setLoop(T.LoopOnce,1);a.clampWhenFinished=true;last=name;}const clip=gltf.animations.find(a=>a.name===name);const poseAction=mix.clipAction(clip);poseAction.reset().play();mix.setTime(name==='Death'?clip.duration:time%clip.duration);fit(animal);renderer.render(scene,camera);
   const w=185*s,h=w*420/900,left=x-113*s,top=y-h+8*s;c.save();c.fillStyle='rgba(28,34,22,.22)';c.beginPath();c.ellipse(x-20*s,y+5*s,80*s,9*s,0,0,Math.PI*2);c.fill();c.restore();c.drawImage(renderer.domElement,left,top,w,h);
   const tip=animal.getObjectByName('tail_tip');if(tip){const v=tip.getWorldPosition(new T.Vector3()).project(camera),p=c.getTransform().transformPoint({x:left+(v.x+1)*w/2,y:top+(1-v.y)*h/2});window.BodyDrag?.setVisualTail({x:p.x/c.canvas.width,y:p.y/c.canvas.height});}
  },
  barrier(c,x,y,opacity=1,tint){animal.visible=false;barrier.visible=true;barrier.rotation.y=-.15;orange.color.set(tint||0xe9953e);fit(barrier);renderer.render(scene,camera);const w=c.canvas.width*.18,h=w*420/900;c.save();c.globalAlpha*=opacity;c.drawImage(renderer.domElement,x*c.canvas.width-w/2,y*c.canvas.height-h,w,h);c.restore();}
 };
}
