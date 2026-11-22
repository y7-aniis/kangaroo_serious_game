import * as T from 'three';
export function makeProne(model,mixer,clips){
 const idle=mixer.clipAction(clips.find(c=>c.name==='Idle'));idle.play();mixer.setTime(0);model.updateMatrixWorld(true);
 const bone=n=>model.getObjectByName(n),v=new T.Vector3(),axis=new T.Vector3(1,0,0);
 const feet=['l','r'].map(s=>bone('toe_tip_'+s).getWorldPosition(new T.Vector3()));
 bone('hips').position.y-=.23;bone('hips').quaternion.multiply(new T.Quaternion().setFromAxisAngle(axis,.65));bone('tail_1').quaternion.multiply(new T.Quaternion().setFromAxisAngle(axis,-.65));
 for(const [n,r] of [['spine_1',.25],['spine_2',.18],['spine_3',.12],['neck',-.2],['head',-.25]])bone(n).quaternion.multiply(new T.Quaternion().setFromAxisAngle(axis,r));
 model.updateMatrixWorld(true);
 function solve(tip,chain,target){for(let i=0;i<30;i++)for(const n of chain){const b=bone(n),origin=b.getWorldPosition(new T.Vector3()),a=bone(tip).getWorldPosition(new T.Vector3()).sub(origin).normalize(),d=target.clone().sub(origin).normalize(),q=new T.Quaternion().setFromUnitVectors(a,d),parent=b.parent.getWorldQuaternion(new T.Quaternion());b.quaternion.premultiply(parent.clone().invert().multiply(q).multiply(parent));model.updateMatrixWorld(true)}}
 function aim(n,child,dir){const b=bone(n),origin=b.getWorldPosition(new T.Vector3()),a=bone(child).getWorldPosition(new T.Vector3()).sub(origin).normalize(),q=new T.Quaternion().setFromUnitVectors(a,new T.Vector3(...dir).normalize()),parent=b.parent.getWorldQuaternion(new T.Quaternion());b.quaternion.premultiply(parent.clone().invert().multiply(q).multiply(parent));model.updateMatrixWorld(true)}
 // Reclining rest: horizontal trunk, raised neck, hindlegs resting to one side.
 aim('hips','spine_1',[-1,.12,0]);
 aim('spine_1','spine_2',[-1,.06,0]);
 aim('spine_2','spine_3',[-1,.12,0]);
 aim('spine_3','neck',[-.8,.35,0]);
 aim('neck','head',[-.35,.9,0]);
 aim('head','head_tip',[-1,-.12,0]);
 for(const s of ['l','r']){
 const near=s==='l';
 aim('thigh_'+s,'shin_'+s,[-.35,.16,near?.8:.65]);
 aim('shin_'+s,'foot_'+s,[.15,.18,.9]);
 aim('foot_'+s,'toe_'+s,[-.8,-.015,.55]);
 aim('toe_'+s,'toe_tip_'+s,[-.8,0,.55]);
 aim('upperarm_'+s,'forearm_'+s,[.10,-.40,near?.08:-.04]);
 aim('forearm_'+s,'hand_'+s,[-.30,-.18,.035]);
 aim('hand_'+s,'hand_tip_'+s,[-.25,0,.02]);
 }
 for(const [n,c,d] of [['tail_1','tail_2',[.5,-.25,.3]],['tail_2','tail_3',[.2,-.08,.5]],['tail_3','tail_4',[-.15,0,.5]],['tail_4','tail_5',[-.4,0,.3]],['tail_5','tail_tip',[-.5,0,.1]]])aim(n,c,d);
 model.updateMatrixWorld(true);model.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.update()});const low=new T.Box3().setFromObject(model,true).min.y;bone('hips').position.y+=(-low+.006)/1.8;model.updateMatrixWorld(true);const tracks=[];model.traverse(b=>{if(!b.isBone)return;const times=[0,1.5,3],ps=[],qs=[];for(let i=0;i<3;i++){const pos=b.position.clone();if(b.name==='spine_2'&&i===1)pos.y+=.0025;ps.push(...pos.toArray());qs.push(...b.quaternion.toArray())}tracks.push(new T.VectorKeyframeTrack(b.name+'.position',times,ps),new T.QuaternionKeyframeTrack(b.name+'.quaternion',times,qs))});
 mixer.stopAllAction();clips.push(new T.AnimationClip('Prone',3,tracks));
}
