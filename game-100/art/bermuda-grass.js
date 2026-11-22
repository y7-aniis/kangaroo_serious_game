import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export async function addBermudaGrass(scene,center,height,vegetationGreen){
 const asset=await new GLTFLoader().loadAsync(new URL('./assets/new-plants/bermuda-short.glb',import.meta.url).href);
 const parts=[];asset.scene.updateMatrixWorld(true);
 asset.scene.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);const mat=o.material.clone();mat.transparent=false;mat.alphaTest=.45;mat.side=T.DoubleSide;mat.roughness=.9;mat.emissive.set('#657b35');mat.emissiveIntensity=.08;parts.push({geo,mat});});
 let seed=451;const rand=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296),dummy=new T.Object3D(),chunks=[];
 function build(start){
  const group=new T.Group();scene.add(group);const chunk={group,d:start+5,start};chunks.push(chunk);
  const transforms=parts.map(()=>[]),colors=parts.map(()=>[]);
  for(let i=0;i<14400;i++){
   const d=start+rand()*10,side=i%2?1:-1,off=4.45+rand()*8;
   if(rand()>T.MathUtils.smoothstep(off,4.45,5.15))continue;
   const green=vegetationGreen(d);if(rand()>.4+.6*green)continue;const x=center(d)+side*off;
   dummy.position.set(x,height(x,d)+.002,-d);
   const normal=new T.Vector3(-(height(x+.1,d)-height(x-.1,d))/.2,1,(height(x,d+.1)-height(x,d-.1))/.2).normalize();
   dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),normal);dummy.rotateY(rand()*Math.PI*2);dummy.scale.setScalar(.85+rand()*.4);dummy.updateMatrix();transforms[i%parts.length].push(dummy.matrix.clone());colors[i%parts.length].push(new T.Color('#d4bd76').lerp(new T.Color('#ffffff'),green));
  }
  parts.forEach(({geo,mat},i)=>{const ms=transforms[i],mesh=new T.InstancedMesh(geo,mat,ms.length);ms.forEach((m,j)=>{mesh.setMatrixAt(j,m);mesh.setColorAt(j,colors[i][j]);});mesh.computeBoundingSphere();mesh.receiveShadow=true;group.add(mesh);});
 }
 for(let start=-20;start<60;start+=10)build(start);
 return (d,low)=>{const first=Math.floor((d-20)/10)*10;for(const c of [...chunks])if(c.start<first||c.start>=first+80){scene.remove(c.group);c.group.children.forEach(m=>m.dispose());chunks.splice(chunks.indexOf(c),1);}for(let start=first;start<first+80;start+=10)if(!chunks.some(c=>c.start===start))build(start);chunks.forEach(c=>c.group.visible=c.d>d-12&&c.d<d+(low?22:38));};
}
