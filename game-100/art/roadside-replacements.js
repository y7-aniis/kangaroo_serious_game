import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const hash=n=>{const a=Math.sin(n*127.1+311.7)*43758.5453;return a-Math.floor(a)};
export async function addRoadsideReplacements(scene,center,height,section){
 const loader=new GLTFLoader();
 async function parts(name){const g=await loader.loadAsync(new URL('./assets/new-plants/'+name+'.glb',import.meta.url).href),groups=new Map();g.scene.updateMatrixWorld(true);g.scene.traverse(o=>{if(!o.isMesh)return;const key=o.material.uuid;if(!groups.has(key))groups.set(key,{geos:[],mat:o.material.clone()});const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);groups.get(key).geos.push(geo);});return [...groups.values()].map(({geos,mat})=>{mat.roughness=.9;mat.metalness=0;if(mat.transparent||mat.alphaMap){mat.transparent=false;mat.alphaTest=.42;mat.side=T.DoubleSide;}return {geo:mergeGeometries(geos),mat};});}
 const [bush,fence]=await Promise.all([parts('bush'),parts('fence-wood')]),chunks=[],dummy=new T.Object3D();
 function add(parts,matrices,group){if(!matrices.length)return;for(const {geo,mat}of parts){const mesh=new T.InstancedMesh(geo,mat,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();mesh.receiveShadow=true;group.add(mesh);}}
 function bushMatrix(z,off,scale,seed){const x=center(z)+off;dummy.position.set(x,height(x,z)-.015,-z);dummy.rotation.set(0,hash(seed)*Math.PI*2,0);dummy.scale.set(scale,scale,scale);dummy.updateMatrix();return dummy.matrix.clone();}
 for(let start=-30;start<2200;start+=30){const group=new T.Group(),matrices=[];scene.add(group);chunks.push({group,d:start+15});
  for(let i=Math.ceil(start/9);i*9<start+30;i++){const z=i*9,s=section(z);for(const side of [-1,1]){const seed=i*19+(side===1?911:77),h=hash(seed);if(h>.4||s.density===2)matrices.push(bushMatrix(z+2,side*(6+h*6),.65+h*.35,seed));}}
  for(let i=Math.ceil(start/6);i*6<start+30;i++){const z=i*6,s=section(z);if(!s.density)continue;for(const side of [-1,1]){const seed=i*43+(side<0?317:883),patch=.5+.5*Math.sin(z/38+side*2),count=s.density===2?7:3+Math.floor(patch*3);for(let j=0;j<count;j++){const r=hash(seed+j*11),depth=z+hash(seed+j*17)*5;matrices.push(bushMatrix(depth,side*(5.8+r*13),.85+hash(seed+j)*.55,seed+j));}}}
  add(bush,matrices,group);
 }
 // Replace only the authored fenced passage; panels never bridge its wildlife opening.
 const fenceMatrices=[];const spans=[[1550,1670],[1745,1800]];
 for(const [from,to] of spans)for(let z=from;z<to;z+=5.5){const end=Math.min(z+5.5,to),mid=(z+end)/2;for(const side of [-1,1]){const x=center(mid)+side*5.2;dummy.position.set(x,height(x,mid),-mid);dummy.rotation.set(0,-Math.atan2(center(end)-center(z),end-z),0);dummy.scale.set(1,1,Math.hypot(end-z,center(end)-center(z))/5.5);dummy.updateMatrix();fenceMatrices.push(dummy.matrix.clone());}}
 const fenceGroup=new T.Group();scene.add(fenceGroup);add(fence,fenceMatrices,fenceGroup);
 let encounters=null,cover=new T.Group();scene.add(cover);
 return game=>{const d=game.distance;for(const c of chunks)c.group.visible=c.d>d-30&&c.d<d+125;fenceGroup.visible=d>1380&&d<1830;
  if(encounters!==game.encounters){encounters=game.encounters;for(const child of [...cover.children]){cover.remove(child);child.dispose();}const matrices=[];for(const e of encounters||[])if(e.type==='concealed')for(let j=0;j<3;j++)matrices.push(bushMatrix(e.at-1+j*1.7,-5.4-j*1.1,1.65,e.id*31+j));add(bush,matrices,cover);}
 };
}
