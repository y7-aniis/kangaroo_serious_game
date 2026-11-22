import * as T from '../art/vendor/three.module.js';
import {GLTFLoader} from '../art/vendor/loaders/GLTFLoader.js';
// Phone, full forearm and finger animation are authored together in FPS_Phone_Call.blend.
export async function createHandPhone(host,onDial){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.setClearColor(0,0);renderer.domElement.className='hand-phone-canvas';host.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(37,1,.01,40);camera.position.set(0,-.4,8.2);camera.lookAt(0,-.4,0);scene.add(new T.HemisphereLight(0xe9efff,0x776950,1.8));const light=new T.DirectionalLight(0xffefdb,2.4);light.position.set(-3,4,5);scene.add(light);
 const model=await new GLTFLoader().loadAsync(new URL('./assets/fps-phone-call.glb',import.meta.url).href);const root=model.scene;root.rotation.x=Math.PI/2;root.position.set(.2,-1.6,0);scene.add(root);let screen;
 root.traverse(o=>{if(o.isMesh){o.frustumCulled=false;if(o.name==='Phone_screen')screen=o;if(o.name==='Call_button')o.visible=false}});
 if(!screen||!model.animations.length)throw new Error('FPS phone asset is missing its display or authored animation');
 const mixer=new T.AnimationMixer(root),action=mixer.clipAction(model.animations[0]);action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;action.play();action.paused=true;mixer.setTime(0);
 const c=document.createElement('canvas');c.width=512;c.height=1024;const ctx=c.getContext('2d'),texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.flipY=false;screen.material=new T.MeshBasicMaterial({map:texture});
 let lastLabel='',visible=false,playing=false,time=0;
 function label(status){
  if(status===lastLabel)return;lastLabel=status;
  const gradient=ctx.createLinearGradient(0,0,512,1024);gradient.addColorStop(0,'#304e46');gradient.addColorStop(1,'#122c25');ctx.fillStyle=gradient;ctx.fillRect(0,0,512,1024);
  ctx.beginPath();ctx.roundRect(9,9,494,1006,48);ctx.strokeStyle='#81988a';ctx.lineWidth=2;ctx.stroke();
  ctx.textAlign='center';ctx.fillStyle='#c5d0c4';ctx.font='26px sans-serif';ctx.fillText('SIMULATED CALL',256,155);
  ctx.fillStyle='#f4efdf';ctx.font='bold 54px sans-serif';ctx.fillText('Wildlife',256,325);ctx.fillText('Rescue',256,398);
  ctx.font='32px sans-serif';ctx.fillText(status,256,510);
  ctx.beginPath();ctx.arc(256,760,78,0,Math.PI*2);ctx.fillStyle='#ccb67c';ctx.fill();
  ctx.fillStyle='#193b2f';ctx.font='60px sans-serif';ctx.fillText('☎',256,782);texture.needsUpdate=true;
 }
 label('Ready to call');const ray=new T.Raycaster();renderer.domElement.onclick=e=>{if(playing)return;const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);const hit=ray.intersectObject(screen)[0];if(hit?.uv&&Math.hypot(hit.uv.x*512-256,hit.uv.y*1024-760)<90)onDial()};
 return{setStatus:label,show(){visible=true;playing=false;time=0;host.hidden=false;action.reset().play();action.paused=true;mixer.setTime(0);label('Ready to call')},lower(){/* The final authored pose keeps the phone in front of the driver. */},hide(){visible=false;host.hidden=true},tap(){if(playing)return;playing=true;action.reset().play();action.paused=false},update(dt){if(!visible)return;time+=dt;if(playing)mixer.update(dt);root.rotation.z=Math.sin(time*.8)*.002;const r=host.getBoundingClientRect();if(!r.width||!r.height)return;const pixel=renderer.getPixelRatio();if(renderer.domElement.width!==Math.round(r.width*pixel)||renderer.domElement.height!==Math.round(r.height*pixel))renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;root.position.x=.35-camera.aspect*.08;camera.updateProjectionMatrix();renderer.render(scene,camera)},dispose(){renderer.dispose()}};
}
