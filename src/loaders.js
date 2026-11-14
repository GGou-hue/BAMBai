// Asset loading: GLTFLoader + KTX2Loader (with the game's own basis
// transcoder), plus the boot preloader with progress.

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export const ktx2 = new KTX2Loader().setTranscoderPath('/assets/basis/');

let _renderer;
export function setKTX2Renderer(renderer) {
  _renderer = renderer;
  ktx2.detectSupport(renderer);
}

export const gltf = new GLTFLoader()
  .setKTX2Loader(ktx2)
  .setMeshoptDecoder(MeshoptDecoder);

// A material set: textures/<name>/{color,normal,rough}.ktx2
export async function loadMaterialSet(name, repeat = 1) {
  const [color, normal, rough] = await Promise.all([
    ktx2.loadAsync(`/textures/${name}/color.ktx2`),
    ktx2.loadAsync(`/textures/${name}/normal.ktx2`),
    ktx2.loadAsync(`/textures/${name}/rough.ktx2`),
  ]);
  for (const t of [color, normal, rough]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.setScalar(repeat);
    t.anisotropy = 8;
  }
  color.colorSpace = THREE.SRGBColorSpace;
  return { color, normal, rough };
}

export function standardMaterial(set) {
  const m = new THREE.MeshStandardMaterial({
    map: set.color,
    normalMap: set.normal,
    roughnessMap: set.rough,
    roughness: 1,
    metalness: 0,
  });
  return m;
}

// The boot preloader: loads everything on the manifest with a progress bar.
export async function preload(items, onProgress) {
  let done = 0;
  const bump = () => onProgress(++done / items.length);
  const jobs = items.map((item) =>
    (typeof item === 'function' ? item() : Promise.resolve()).then(bump, (e) => { console.error('preload failed', item, e); bump(); }));
  await Promise.allSettled(jobs);
}
