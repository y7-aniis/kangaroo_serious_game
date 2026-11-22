import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {cloneRig} from '../../biome/kangaroo-preview.js';
import {makeProne} from '../../actions/prone.js';
import {measureHopGroundOffsets} from '../../actions/grounding.js';

export async function createGameKangaroos(scene,center,height){
 const asset=await new GLTFLoader().loadAsync('../assets/kangaroo.glb');
 const sample=cloneRig(asset.scene);sample.scale.setScalar(1.8);sample.rotation.y=-Math.PI/2;
 const calibration=new T.AnimationMixer(sample);makeProne(sample,calibration,asset.animations);
 const offsets=measureHopGroundOffsets(sample,calibration,asset.animations);
 calibration.clipAction(asset.animations.find(c=>c.name==='Idle')).play();calibration.setTime(0);sample.updateMatrixWorld(true);
 const box=new T.Box3();offsets.Idle=.008-box.setFromObject(sample,true).min.y;offsets.Prone=0;offsets.Hit=offsets.Death=offsets.Idle;
 let records=new Map(),run=null,lastTime=0,wasResponse=false;
 function create(e){const model=cloneRig(asset.scene);model.scale.setScalar(1.8);model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false}});scene.add(model);const r={model,mixer:new T.AnimationMixer(model),name:null,action:null,y:offsets.Idle,yaw:Math.random()*Math.PI*2,collisionTime:null};records.set(e,r);return r;}
 function play(r,name){if(r.name===name)return;const old=r.action;r.name=name;r.action=r.mixer.clipAction(asset.animations.find(c=>c.name===name)).reset();r.action.setLoop(['Hit','Death'].includes(name)?T.LoopOnce:T.LoopRepeat,['Hit','Death'].includes(name)?1:Infinity);r.action.clampWhenFinished=true;r.action.play();if(old)old.crossFadeTo(r.action,.3,false);}
 return g=>{
  if(run!==g.encounters){for(const r of records.values()){scene.remove(r.model);r.mixer.stopAllAction();r.model.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose()})}records.clear();run=g.encounters;lastTime=g.time;}
  const clock=g.responseScene?(g.responseAnimationTime||0):g.time;
  if(g.responseScene!==wasResponse){lastTime=clock;wasResponse=g.responseScene;}
  const dt=Math.max(0,Math.min(.1,clock-lastTime));lastTime=clock;
  const items=[];
  for(const e of g.roadside||[])items.push({e,z:e.at,x:e.x,name:e.initialPose==='resting'?'Prone':'Idle',stationary:true});
  for(const e of g.encounters||[]){

   if(e.result==='collision'){if(!e.departed)items.push({e,z:e.at+18,x:e.bodyMoved?-5.4:-2.4,collision:true,stationary:true});continue;}
   const a=g.animal(e);items.push({e,z:e.at,x:a.x,hidden:a.hidden,name:a.pose==='hopping'?(e.moveSpeed>=2?'Hop_Fast':'Hop'):'Idle',stationary:a.pose!=='hopping',direction:a.direction});
  }
  for(const r of records.values())r.model.visible=false;
  for(const a of items){if(a.hidden||a.z-g.distance< -8||a.z-g.distance>150)continue;const r=records.get(a.e)||create(a.e);r.model.visible=true;
   if(a.collision){r.collisionTime??=g.time;const hit=asset.animations.find(c=>c.name==='Hit');a.name=!a.e.responseVisualStarted&&!a.e.responseComplete&&g.time-r.collisionTime<hit.duration?'Hit':a.e.condition==='dead'?'Death':'Prone';}
   if(a.collision&&g.responseScene){
    a.e.responseVisualStarted=true;
    const observation=g.responseObservationTime||0;
    a.name=a.e.condition==='dead'?'Death':a.e.condition==='alive'&&observation>2?'Hop':a.e.condition==='alive'&&observation>1?'Idle':'Prone';
    if(a.name==='Hop'){a.x+=(observation-2)*2.6;r.yaw=Math.PI/2;}
   }
   play(r,a.name);r.mixer.update(dt);if(a.collision&&(g.current?.outside||a.e.responseComplete)){r.action.stopFading();r.action.setEffectiveWeight(1);r.action.reset().play();r.mixer.setTime(a.name==='Death'?r.action.getClip().duration:clock%r.action.getClip().duration);r.yaw=Math.PI/2;}
   // A single random facing per animal/run; movement always follows the logical path.
   if(!a.stationary)r.yaw=a.direction>0?Math.PI/2:-Math.PI/2;
   r.model.rotation.y=r.yaw;
   r.y=T.MathUtils.lerp(r.y,offsets[a.name],Math.min(1,dt/0.2));
   if(g.current?.outside&&a.collision&&g.bodyWorld)a.e.responseBodyWorld={...g.bodyWorld};
   if(a.collision&&a.e.responseBodyWorld){a.z=a.e.responseBodyWorld.z;a.x=a.e.responseBodyWorld.x-center(a.z);}
   const x=center(a.z)+a.x,off=Math.abs(a.x),ground=off<3.5?.019:off<4.15?0:height(x,a.z);
   r.model.position.set(x,ground+r.y,-a.z);
   // Contact correction also covers blended and collapsed poses.
   r.model.updateMatrixWorld(true);r.model.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.update()});
   const low=box.setFromObject(r.model,true).min.y;
   if(['Prone','Death'].includes(a.name))r.model.position.y+=ground+.008-low;
   else r.model.position.y+=Math.max(0,ground+.008-low);
   if(g.current?.outside&&a.collision&&g.responseCamera){r.model.updateMatrixWorld(true);const tip=r.model.getObjectByName('tail_tip');if(tip){const p=tip.getWorldPosition(new T.Vector3()).project(g.responseCamera);window.BodyDrag?.setVisualTail({x:(p.x+1)/2,y:(1-p.y)/2});}}
  }
 };
}
