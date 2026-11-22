import {makeProne} from '../actions/prone.js';
import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { measureHopGroundOffsets } from '../actions/grounding.js';

// Clone bones as well as meshes so each animal has an independent animation.
export function cloneRig(source) {
  const root=source.clone(true), originals=[], copies=[];
  source.traverse(o=>originals.push(o));root.traverse(o=>copies.push(o));
  const mapping=new Map(originals.map((o,i)=>[o,copies[i]]));
  source.traverse(o=>{if(!o.isSkinnedMesh)return;const c=mapping.get(o);c.skeleton=o.skeleton.clone();c.skeleton.bones=o.skeleton.bones.map(b=>mapping.get(b));c.bind(c.skeleton,o.bindMatrix);});
  return root;
}
export async function addKangarooPreview(scene,center,height) {
  const loader=new GLTFLoader();
  const asset=await loader.loadAsync('../assets/kangaroo.glb');
  const calibration=cloneRig(asset.scene);calibration.scale.setScalar(1.8);
  const mixer=new T.AnimationMixer(calibration);
  calibration.rotation.y=-Math.PI/2;
  makeProne(calibration,mixer,asset.animations);
  const contacts={};
  const offsets=measureHopGroundOffsets(calibration,mixer,asset.animations,contacts);
  mixer.clipAction(asset.animations.find(c=>c.name==='Idle')).play();mixer.setTime(0);calibration.updateMatrixWorld(true);
  calibration.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.update()});
  offsets.Idle=.008-new T.Box3().setFromObject(calibration,true).min.y;
  const animals=[];
  function create(name){const model=cloneRig(asset.scene);model.scale.setScalar(1.8);model.rotation.y=-Math.PI/2;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false}});scene.add(model);const mix=new T.AnimationMixer(model);const clip=asset.animations.find(c=>c.name===name);mix.clipAction(clip).play();const a={model,mix,clip,name};animals.push(a);return a;}
  const resting=create('Idle'),crossing=create('Hop');
  let restAction=resting.mix.clipAction(resting.clip),restTime=0;
  function setState(name='Idle'){
    resting.mix.stopAllAction();resting.name=name;restTime=0;
    resting.clip=asset.animations.find(c=>c.name===name);
    restAction=resting.mix.clipAction(resting.clip).reset();
    restAction.setLoop(name==='Hit'||name==='Death'?T.LoopOnce:T.LoopRepeat,Infinity);
    restAction.clampWhenFinished=true;restAction.play();
  }
  // Use the same downloaded shrub material and geometry as the roadside.
  const bush=await loader.loadAsync('assets/new-plants/bush.glb');
  const cover=bush.scene;cover.scale.setScalar(1.35);scene.add(cover);
  cover.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  let elapsed=0,anchor=0,fast=false,hop,idle,travel,pathSlope=0;
  const transitionBounds=new T.Box3();
  const smooth=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t)};
  function reset(distance=0,isFast=false){
    anchor=distance;elapsed=0;fast=isFast;crossing.mix.stopAllAction();
    crossing.name=fast?'Hop_Fast':'Hop';
    crossing.clip=asset.animations.find(c=>c.name===crossing.name);
    // An integer number of cycles ends at the measured foot-contact pose.
    travel=Math.max(2,Math.round(22/((fast?4.8:2.6)*crossing.clip.duration)))*crossing.clip.duration;
    hop=crossing.mix.clipAction(crossing.clip).reset().play();
    idle=crossing.mix.clipAction(asset.animations.find(c=>c.name==='Idle')).reset().play();
    hop.paused=idle.paused=true;
  }
  function place(a,off,d){const x=center(d)+off;let ground=-Infinity;for(const dx of [-.5,0,.5])for(const dz of [-.4,0,.4]){const px=x+dx,pd=d+dz,lateral=Math.abs(px-center(pd));ground=Math.max(ground,lateral<3.5?.019:lateral<4.15?0:height(px,pd));}a.model.position.set(x,ground+(a.groundOffset??offsets[a.name]),-d);}
  function update(dt,distance){
    elapsed+=dt;restTime+=dt;
    if(resting.name==='Hit'&&restTime>=resting.clip.duration){
      const next=resting.mix.clipAction(asset.animations.find(c=>c.name==='Idle')).reset().play();
      restAction.crossFadeTo(next,.3,false);restAction=next;resting.name='Idle';
    }
    resting.mix.update(dt);resting.groundOffset=offsets.Idle;
    const wait=1.5,segment=travel+wait*2,leg=Math.floor(elapsed/segment),phase=elapsed%segment;
    const t=T.MathUtils.clamp(phase-wait,0,travel),r=crossing.clip.duration;
    // Smooth acceleration/deceleration over the first and last hop.
    const travelled=t<r?t*t/(2*r):t>travel-r?travel-r-(travel-t)**2/(2*r):t-r/2;
    const progress=travelled/(travel-r),direction=leg%2===0?1:-1;
    const off=direction*(-11+22*progress);
    // Blend on the ground; never cut an airborne pose to idle.
    const weight=smooth((phase-(wait-.28))/.28)*(1-smooth((phase-wait-travel)/.38));
    hop.time=(contacts[crossing.name]+t)%crossing.clip.duration;
    idle.time=elapsed%idle.getClip().duration;
    hop.setEffectiveWeight(weight);idle.setEffectiveWeight(1-weight);
    crossing.mix.update(0);
    crossing.groundOffset=T.MathUtils.lerp(offsets.Idle,offsets[crossing.name],weight);
    place(resting,-5.2,anchor+13);place(crossing,off,anchor+32+off*pathSlope);
    // Keep the resting body's lowest skinned surface on the terrain in every pose.
    resting.model.updateMatrixWorld(true);
    resting.model.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.update()});
    const restFloor=resting.model.position.y-resting.groundOffset;
    resting.model.position.y+=restFloor+.008-transitionBounds.setFromObject(resting.model,true).min.y;
    // Turn while resting, then cross back instead of teleporting to the start.
    const turn=smooth((phase-wait-travel-.55)/.6);
    crossing.model.rotation.y=Math.atan2(1,-pathSlope)+leg*Math.PI+turn*Math.PI;
    if(weight>0&&weight<1){
      crossing.model.updateMatrixWorld(true);
      crossing.model.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.update()});
      const floor=crossing.model.position.y-crossing.groundOffset;
      const low=transitionBounds.setFromObject(crossing.model,true).min.y;
      crossing.model.position.y+=Math.max(0,floor+.008-low);
    }

    for(const a of animals)a.model.visible=a.model.position.z< -distance+12&&a.model.position.z> -distance-100;
    const bx=center(anchor+32)-8;cover.position.set(bx,height(bx,anchor+32),-anchor-30.7);cover.visible=Math.abs(anchor+32-distance)<100;
  }
  function setFacing(view){const angles={side:-Math.PI/2,front:0,frontThree:-Math.PI/4,backThree:-3*Math.PI/4,back:Math.PI};resting.model.rotation.y=angles[view]??angles.side;}
  reset();return {update,reset,setState,setFacing,setPath(value){pathSlope=value==='away'?.55:value==='toward'?-.55:0;elapsed=0;}};
}
