/* Local downloaded audio. One music voice, one looping acceleration voice and one brake voice. */
window.JourneyAudio=(()=>{
 const base=new URL('assets/audio/',document.currentScript.src);let context,loading,enabled=true,musicEnabled=true,unlocked=false,music,engine,brake,previous='coast',brakeHeld=false;
 const buffers={},gains={};let state={phase:'ready',control:'coast',speed:0,paused:true};
 function init(){if(context)return;context=new(window.AudioContext||window.webkitAudioContext)();for(const name of ['music','engine','brake']){const gain=context.createGain();gain.gain.value=0;gain.connect(context.destination);gains[name]=gain}loading=Promise.all([['music','road-trip.mp3'],['engine','accelerate.mp3'],['brake','brake.mp3']].map(async([name,file])=>{const r=await fetch(new URL(file,base));if(!r.ok)throw Error(`Audio ${r.status}`);buffers[name]=await context.decodeAudioData(await r.arrayBuffer())})).catch(e=>{console.warn('Journey audio unavailable',e);document.dispatchEvent(new CustomEvent('journey-audio-error'));});}
 function voice(name,loop=false){if(!buffers[name])return null;const source=context.createBufferSource();source.buffer=buffers[name];source.loop=loop;source.connect(gains[name]);source.start();return source}
 function stop(source){try{source?.stop()}catch{}return null}
 async function start(){init();unlocked=true;await context.resume();await loading;if(!music)music=voice('music',true);}
 function update(game,paused){state={phase:game.phase,control:game.control,speed:game.speed*3.6,paused:paused||document.hidden};if(!context||!unlocked)return;
 const active=enabled&&!state.paused&&state.phase!=='ready',driving=active&&state.phase==='drive',accelerating=driving&&state.control==='accelerate';
 if(accelerating&&!engine)engine=voice('engine',true);
 if(engine)engine.playbackRate.setTargetAtTime(Math.min(1.2,.85+state.speed*.0035),context.currentTime,.2);
 if(driving&&state.control==='brake'&&!brakeHeld&&state.speed>3){brake=stop(brake);brake=voice('brake');brakeHeld=true}
 if(state.control!=='brake'||!driving)brakeHeld=false;
 gains.music.gain.setTargetAtTime(active&&musicEnabled?(state.phase==='response'?.035:.075):0,context.currentTime,.3);
 gains.engine.gain.setTargetAtTime(accelerating?.26:0,context.currentTime,.12);
 gains.brake.gain.setTargetAtTime(driving&&state.control==='brake'&&state.speed>1?.58:0,context.currentTime,.08);
 if(!accelerating&&previous==='accelerate'){const old=engine;engine=null;setTimeout(()=>stop(old),450)}previous=accelerating?'accelerate':'coast';
 }
 function toggle(){enabled=!enabled;if(enabled)start();update({phase:state.phase,control:state.control,speed:state.speed/3.6},state.paused);return enabled}
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&context)for(const gain of Object.values(gains))gain.gain.setTargetAtTime(0,context.currentTime,.03)});
 window.addEventListener('blur',()=>{if(context)for(const gain of Object.values(gains))gain.gain.setTargetAtTime(0,context.currentTime,.03)});
 function toggleMusic(){musicEnabled=!musicEnabled;if(musicEnabled)start();update({phase:state.phase,control:state.control,speed:state.speed/3.6},state.paused);return musicEnabled}
 return{start,update,toggle,toggleMusic,get musicEnabled(){return musicEnabled},get enabled(){return enabled}};
})();
