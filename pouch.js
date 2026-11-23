// User-supplied photographic references, shown without stretching or cropping.
const pouchPhotoBase=new URL('assets/',document.currentScript.src);
const pouchPhotos=[1,2,3].map(n=>{const image=new Image();image.src=new URL(`pouch-photo-${n}.png`,pouchPhotoBase).href;return image});
window.PouchDetail={draw(c,x,y,w,h,found,checking){
 c.save();c.translate(x,y);const u=w/520,head=44*u,foot=35*u;
 c.shadowColor='#162d3655';c.shadowBlur=18;c.shadowOffsetY=7;c.fillStyle='#172824';c.beginPath();c.roundRect(0,0,w,h,14*u);c.fill();c.shadowColor='transparent';c.clip();
 c.fillStyle='#233b35';c.fillRect(0,0,w,head);c.fillStyle='#f6edd9';c.font=`600 ${14*u}px system-ui`;c.textAlign='left';c.textBaseline='middle';c.fillText('POUCH INSPECTION',20*u,head/2);c.fillStyle='#c5d3bd';c.font=`${11*u}px system-ui`;c.textAlign='right';c.fillText('PHOTO REFERENCE',w-20*u,head/2);
 const top=head+8*u,areaH=Math.max(1,h-head-foot-16*u),gap=6*u,cell=(w-28*u)/3;
 if(found&&!checking){pouchPhotos.forEach((image,i)=>{const left=8*u+i*(cell+gap);if(image.complete&&image.naturalWidth){const scale=Math.min(cell/image.naturalWidth,areaH/image.naturalHeight),iw=image.naturalWidth*scale,ih=image.naturalHeight*scale;c.drawImage(image,left+(cell-iw)/2,top+(areaH-ih)/2,iw,ih)}else{c.fillStyle='#cad4c9';c.font=`${12*u}px system-ui`;c.textAlign='center';c.fillText('Loading photo…',left+cell/2,top+areaH/2)}})}else{c.fillStyle='#c5d3bd';c.font=`${15*u}px system-ui`;c.textAlign='center';c.fillText(checking?'Checking the pouch…':'No joey found in the pouch',w/2,top+areaH/2)}
 c.fillStyle='#f2ead8';c.fillRect(0,h-foot,w,foot);c.fillStyle='#33463b';c.font=`600 ${13*u}px system-ui`;c.textAlign='left';c.fillText(checking?'Observe the pouch and surrounding area':found?'Joey found · do not pull':'Pouch empty · check the surrounding area',20*u,h-foot/2);c.restore();
}};
