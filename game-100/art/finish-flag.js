import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export async function addFinishFlags(scene,center,distance=180){
 const gltf=await new GLTFLoader().loadAsync(new URL('./assets/finish/checkered-flag.glb',import.meta.url).href);
 const root=gltf.scene,box=new T.Box3().setFromObject(root),size=box.getSize(new T.Vector3()),mid=box.getCenter(new T.Vector3());
 const scale=2.8/size.y;root.scale.setScalar(scale);root.position.set(-mid.x*scale,-box.min.y*scale,-mid.z*scale);
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.side=T.DoubleSide;m.roughness=Math.max(.55,m.roughness);}}});
 for(const offset of [-16,-8,0])for(const side of [-1,1]){const flag=new T.Group();flag.add(root.clone(true));flag.position.set(center(distance+offset)+side*4.5,.02,-(distance+offset));flag.rotation.y=side<0?0:Math.PI;scene.add(flag)}
 // Actual beveled, extruded letters; open sky remains visible through the material.
 const outlines={
 F:[[0,0],[.18,0],[.18,.43],[.55,.43],[.55,.61],[.18,.61],[.18,.82],[.65,.82],[.65,1],[0,1]],
 I:[[0,0],[.22,0],[.22,1],[0,1]],
 N:[[0,0],[.18,0],[.18,.65],[.54,0],[.74,0],[.74,1],[.56,1],[.56,.35],[.2,1],[0,1]],
 S:[[0,0],[.65,0],[.65,.59],[.18,.59],[.18,.82],[.65,.82],[.65,1],[0,1],[0,.41],[.47,.41],[.47,.18],[0,.18]],
 H:[[0,0],[.18,0],[.18,.41],[.52,.41],[.52,0],[.7,0],[.7,1],[.52,1],[.52,.6],[.18,.6],[.18,1],[0,1]]};
 const front=new T.MeshStandardMaterial({color:'#ffffff',emissive:'#ffffff',emissiveIntensity:.8,metalness:0,roughness:.3,transparent:true,opacity:.78,depthWrite:false,toneMapped:false});
 const edge=new T.MeshStandardMaterial({color:'#d6e6e5',emissive:'#c9dedd',emissiveIntensity:.25,metalness:.15,roughness:.32,transparent:true,opacity:.55,depthWrite:false});
 const sign=new T.Group();let cursor=0;
 for(const ch of 'FINISH'){const points=outlines[ch],shape=new T.Shape(points.map(([x,y])=>new T.Vector2(x,y)));shape.closePath();const geometry=new T.ExtrudeGeometry(shape,{depth:.19,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:3,steps:1});const letter=new T.Mesh(geometry,[front,edge]);letter.position.x=cursor;sign.add(letter);cursor+=Math.max(...points.map(p=>p[0]))+.16;}
 const total=cursor-.16;for(const letter of sign.children)letter.position.x-=total/2;
 sign.scale.setScalar(1.55);sign.position.set(center(distance),4.25,-distance);sign.rotation.y=-.13;scene.add(sign);
}
