import * as T from 'three';

// A constant offset for each whole hop preserves its authored flight arc.
// Idle's floor height is not valid for the extended feet in a hop cycle.
export function measureHopGroundOffsets(model, mixer, clips, contacts = {}) {
  const offsets = {};
  const bounds = new T.Box3();
  const previousY = model.position.y;
  model.position.y = 0;
  for (const name of ['Hop', 'Hop_Fast']) {
    const clip = clips.find(c => c.name === name);
    if (!clip) continue;
    mixer.stopAllAction();
    const action = mixer.clipAction(clip);
    action.reset().setLoop(T.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    let lowest = Infinity;
    const steps = Math.max(120, Math.ceil(clip.duration * 120));
    for (let i = 0; i <= steps; i++) {
      mixer.setTime(clip.duration * i / steps);
      model.updateMatrixWorld(true);
      model.traverse(o => { if (o.isSkinnedMesh) o.skeleton.update(); });
      const y = bounds.setFromObject(model, true).min.y;
      if (y < lowest) { lowest = y; contacts[name] = clip.duration * i / steps; }
    }
    offsets[name] = .008 - lowest;
  }
  mixer.stopAllAction();
  model.position.y = previousY;
  return offsets;
}
