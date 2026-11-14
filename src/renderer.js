// The renderer — ported from the original render.js: custom sky, horizon cloud
// ring, city silhouette, sun/moon light rig, exponential fog, PMREM environment
// capture, bloom + grade + SMAA post chain, and the full setHour() day cycle.

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { DAY, SKY_KEYS, SUNRISE, SUN_ELEV, MIN_ELEV, ZEN_DESAT, MOON, GOLD_WARM, GOLD_FILL } from './daycycle.js';
import {
  SKY_VERT, SKY_FRAG, RING_VERT, RING_FRAG, SKYLINE_VERT, SKYLINE_FRAG, skylineGeometry,
} from './sky.js';

// Quality tiers from the original quality.js (the two we ship first).
export const TIERS = {
  high: { pixelRatio: 1.5, msaa: 4, shadowMap: 2048, shadowFar: 150, shadows: true, bloom: true, smaa: true },
  medium: { pixelRatio: 1, msaa: 2, shadowMap: 1536, shadowFar: 110, shadows: true, bloom: true, smaa: true },
  low: { pixelRatio: 1, msaa: 0, shadowMap: 1024, shadowFar: 60, shadows: false, bloom: true, smaa: true },
  lowest: { pixelRatio: 0.75, msaa: 0, shadowMap: 1024, shadowFar: 60, shadows: false, bloom: false, smaa: false },
};

const clamp01 = (x) => Math.min(Math.max(x, 0), 1);
const smooth = (x) => { const t = clamp01(x); return t * t * (3 - 2 * t); };

const FINAL_FRAG = /* glsl */ `
uniform sampler2D tDiffuse, tBloom;
uniform float bloomOn, sat, con, vignette, grain, flash, time;
uniform vec3 lift, gain;
varying vec2 vUv;
// tonemapping_pars_fragment is not auto-injected (renderer toneMapping = none);
// colorspace_pars_fragment is injected by three
#include <tonemapping_pars_fragment>
float rnd(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec3 c = texture2D(tDiffuse, vUv).rgb;
  vec3 b = texture2D(tBloom, vUv).rgb;
  c += b * bloomOn;
  c *= 1.0 + flash * 1.6;
  #if TM == 1
    c = ACESFilmicToneMapping(c);
  #elif TM == 2
    c = AgXToneMapping(c);
  #else
    c = NeutralToneMapping(c);
  #endif
  c = sRGBTransferOETF(vec4(c, 1.0)).rgb;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, sat);
  c = clamp((c - 0.5) * con + 0.5, 0.0, 1.0);
  c = c * gain + lift * (1.0 - c);
  vec2 q = vUv - 0.5;
  c *= 1.0 - vignette * dot(q, q) * 2.2;
  float n = rnd(vUv * 1000.0 + fract(time) * 37.0);
  c += (n - 0.5) * (1.0 / 255.0 + grain * 0.06);
  gl_FragColor = vec4(c, 1.0);
}`;

export class Renderer {
  constructor(canvas, quality = 'high', params = new URLSearchParams()) {
    this.params = params;
    this.quality = quality;
    this.tier = TIERS[quality] || TIERS.high;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    if (!this.renderer.capabilities.isWebGL2) throw new Error('webgl2');
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.NoToneMapping; // the grade pass does it
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.info.autoReset = false;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1800);
    this.sun = new THREE.DirectionalLight(0xffffff, 3);
    this.hemi = new THREE.HemisphereLight(12375278, 9074784, 1.2);
    this.hour = 9;
    this.overcast = 0;
    this.cloud = 0.25;
    this.flash = 0;
    this.lamps = 0;
    this.envScale = 1;
    this.grade = { sat: 1, con: 1, lift: new THREE.Color(), gain: new THREE.Color(1, 1, 1), vig: 0.3 };
    this.sunDir = new THREE.Vector3(0, 1, 0);
    this.lightDir = new THREE.Vector3(0, 1, 0);
    this.focus = new THREE.Vector3();

    const p = this.sun;
    p.castShadow = this.tier.shadows;
    p.shadow.mapSize.set(this.tier.shadowMap, this.tier.shadowMap);
    p.shadow.camera.near = 0.5;
    p.shadow.camera.far = this.tier.shadowFar;
    p.shadow.bias = -3e-4;
    p.shadow.normalBias = 0.035;
    p.shadow.radius = this.tier.shadowMap >= 2048 ? 2.5 : 1.5;
    this.scene.add(p, this.hemi);

    // --- sky dome ---
    const su = this.skyUniforms = {
      zenith: { value: new THREE.Color() }, horizon: { value: new THREE.Color() },
      glow: { value: new THREE.Color() }, ground: { value: new THREE.Color() },
      sunColor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() },
      moonDir: { value: new THREE.Vector3(0, 1, 0) }, cloudLit: { value: new THREE.Color() },
      cloudShade: { value: new THREE.Color() }, cityGlow: { value: new THREE.Color() },
      scatter: { value: new THREE.Color() }, sunVis: { value: 1 }, cover: { value: 0.3 },
      time: { value: 0 }, dark: { value: 0 }, night: { value: 0 }, flash: { value: 0 },
      haze: { value: 0.6 }, envMode: { value: 0 }, keyA: { value: 2 }, keyB: { value: 2 },
      keyT: { value: 0 }, ocK: { value: 0 }, sunAz: { value: 0 }, ready: { value: 0 },
      tKeys: { value: null }, tClouds: { value: null },
    };
    this.sky = new THREE.Mesh(
      new THREE.SphereGeometry(1500, 96, 48),
      new THREE.ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false, uniforms: su }),
    );
    this.sky.renderOrder = 1e6;
    this.sky.frustumCulled = false;
    this.scene.add(this.sky);

    // --- horizon cloud ring ---
    const ringShared = ['horizon', 'sunColor', 'sunDir', 'cloudLit', 'cloudShade', 'cityGlow', 'scatter', 'sunVis', 'cover', 'time', 'dark', 'haze', 'ocK', 'ready'];
    const ru = this.ringUniforms = { tRing: { value: null } };
    for (const k of ringShared) ru[k] = su[k];
    const ringGeo = new THREE.CylinderGeometry(1400, 1400, 2800, 96, 1, true);
    this.cloudRing = new THREE.Mesh(ringGeo, new THREE.ShaderMaterial({
      vertexShader: RING_VERT, fragmentShader: RING_FRAG, uniforms: ru,
      transparent: true, depthWrite: false, side: THREE.BackSide, fog: false,
    }));
    this.cloudRing.name = 'horizon cloud ring';
    this.cloudRing.renderOrder = -6;
    this.cloudRing.frustumCulled = false;
    this.scene.add(this.cloudRing);

    // --- distant city silhouette (main scene until Phase 2 replaces it) ---
    this.ringMat = new THREE.ShaderMaterial({
      vertexShader: SKYLINE_VERT, fragmentShader: SKYLINE_FRAG, fog: false, side: THREE.DoubleSide,
      uniforms: { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() }, win: { value: new THREE.Color(1, 0.62, 0.3) }, lit: { value: 0 } },
    });
    this.skyline = new THREE.Mesh(skylineGeometry(), this.ringMat);
    this.skyline.name = 'skyline';
    this.skyline.frustumCulled = false;
    this.scene.add(this.skyline);

    this.scene.fog = new THREE.FogExp2(13622758, 0.0015);

    // --- environment (ambient) capture ---
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envScene = new THREE.Scene();
    this.envCube = new THREE.WebGLCubeRenderTarget(64, { generateMipmaps: false });
    this.envCam = new THREE.CubeCamera(1, 4000, this.envCube);
    const skyClone = new THREE.Mesh(this.sky.geometry, this.sky.material);
    skyClone.frustumCulled = false;
    this.envGroundMat = new THREE.MeshBasicMaterial({ color: 7829367, fog: false });
    const envGround = new THREE.Mesh(new THREE.CircleGeometry(1400, 32).rotateX(-Math.PI / 2), this.envGroundMat);
    envGround.position.y = -3;
    this.envScene.add(skyClone, envGround, new THREE.Mesh(skylineGeometry(), this.ringMat), this.envCam);
    this.envRT = null;

    // --- post chain: render -> bloom -> grade -> SMAA ---
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: this.tier.msaa });
    this.composer = new EffectComposer(this.renderer, rt);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.4, 0.55, 1);
    this.composer.addPass(this.bloom);
    const tm = Number(params.get('tm') ?? 0);
    this.final = new ShaderPass({
      defines: { TM: tm },
      uniforms: {
        tDiffuse: { value: null }, tBloom: { value: null }, bloomOn: { value: 1 },
        toneMappingExposure: { value: 1 }, sat: { value: 1.1 }, con: { value: 1.05 },
        lift: { value: new THREE.Color() }, gain: { value: new THREE.Color(1, 1, 1) },
        vignette: { value: 0.28 }, grain: { value: Number(params.get('grain') ?? 0) },
        flash: { value: 0 }, time: { value: 0 },
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: FINAL_FRAG,
    });
    this.composer.addPass(this.final);
    this.smaa = new SMAAPass();
    this.smaa.enabled = this.tier.smaa;
    this.composer.addPass(this.smaa);
    this.final.uniforms.tBloom.value = this.bloom.texture;

    addEventListener('resize', () => this.resize());
    this.resize();
    this.setHour(this.hour);
  }

  // ---- textures for the sky (called by the boot preloader) ----
  loadSkyTextures(onProgress) {
    const loader = new THREE.TextureLoader();
    let done = 0, n = 2; // keys + clouds gate `ready`; the ring loads on its own
    const one = () => { if (++done === n) { this.skyUniforms.ready.value = 1; this.envKey = ''; } onProgress?.(done / n); };
    const load = (file, srgb, count) => {
      const t = loader.load(`/textures/sky/${file}`, count ? one : undefined);
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.generateMipmaps = false;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      return t;
    };
    this.skyUniforms.tKeys.value = load('keys.png', true, true);
    this.skyUniforms.tClouds.value = load('clouds.webp', false, true);
    this.ringUniforms.tRing.value = load('ring.webp', false, false);
  }

  applyTier(name) {
    const t = TIERS[name] || TIERS.high;
    this.tier = t; this.quality = name;
    this.composer.renderTarget1.samples = t.msaa;
    this.composer.renderTarget2.samples = t.msaa;
    this.smaa.enabled = t.smaa && t.msaa === 0;
    this.bloom.enabled = t.bloom;
    this.sun.castShadow = t.shadows;
    if (this.sun.shadow.mapSize.x !== t.shadowMap) {
      this.sun.shadow.mapSize.set(t.shadowMap, t.shadowMap);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
    }
    this.setPixelRatio();
    this.setHour(this.hour);
  }

  setPixelRatio() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(Math.min(this.tier.pixelRatio, dpr));
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ---- the day cycle: port of the original setHour() ----
  setHour(hour) {
    const I = THREE.MathUtils;
    this.hour = ((hour % 24) + 24) % 24;
    let t = 0;
    while (DAY[t + 1].h < this.hour) t++;
    const n = DAY[t], r = DAY[t + 1];
    const i = smooth((this.hour - n.h) / (r.h - n.h));
    const a = (dst, from, to) => dst.set(from).lerp(_c.set(to), i);
    const o = (x, y) => x + (y - x) * i;
    const desat = (col, k) => {
      const l = col.r * 0.3 + col.g * 0.59 + col.b * 0.11;
      return col.lerp(_c.setRGB(l, l, l).multiplyScalar(0.8), k);
    };
    const c = this.overcast, l = this.hour, u = this.skyUniforms;
    const d = 1 - smooth((l - 4.9) / 1) * (1 - smooth((l - 19) / 1.2));
    const f = (l - SUNRISE) / 12.1;
    const p = Math.sin(Math.PI * f) * I.degToRad(SUN_ELEV);
    const m = Math.PI * f;
    this.sunDir.set(Math.cos(m), 0, 0.42).normalize().multiplyScalar(Math.cos(p)).setY(Math.sin(p)).normalize();
    const h = Math.max(p, I.degToRad(MIN_ELEV));
    const g = (((l - 18.8) % 24) + 24) % 24 / 11.5;
    const elev = Math.sin(Math.PI * Math.min(Math.max(g, 0), 1)) * I.degToRad(58) + 0.12;
    const v = u.moonDir.value;
    v.set(Math.cos(Math.PI * g), 0, -0.3).normalize().multiplyScalar(Math.cos(elev)).setY(Math.sin(elev)).normalize();

    let sunI = o(n.sunI, r.sunI) * (1 - c * 0.8) * smooth((p + 0.035) / 0.06);
    const moonI = MOON.intensity * smooth((d - 0.6) / 0.4) * (1 - c * 0.7);
    if (sunI >= moonI) {
      this.lightDir.set(this.sunDir.x, 0, this.sunDir.z).normalize().multiplyScalar(Math.cos(h)).setY(Math.sin(h));
      a(this.sun.color, n.sun, r.sun);
      this.sun.intensity = sunI;
    } else {
      this.lightDir.copy(v);
      this.sun.color.set(MOON.color);
      this.sun.intensity = moonI;
    }
    this.sun.position.copy(this.lightDir).multiplyScalar(100);
    this.sun.shadow.intensity = this.tier.shadows === false ? 0 : 0.93 - c * 0.5;
    this.sun.shadow.radius = (this.tier.shadowMap >= 2048 ? 2.5 : this.tier.shadowMap >= 1536 ? 2 : 1.5) * (1 + c * 1.5);

    desat(a(u.zenith.value, n.zenith, r.zenith), c * 0.85).multiplyScalar(1 - c * 0.35);
    {
      const z = u.zenith.value;
      const lum = z.r * 0.2126 + z.g * 0.7152 + z.b * 0.0722;
      z.lerp(_c.setRGB(lum, lum, lum), ZEN_DESAT);
    }
    desat(a(u.horizon.value, n.horizon, r.horizon), c * 0.8).multiplyScalar(1 - c * 0.25);
    a(u.glow.value, n.glow, r.glow).multiplyScalar(0.55 * (1 - c));
    a(u.ground.value, n.ground, r.ground);
    a(u.cloudLit.value, n.cloudLit, r.cloudLit);
    desat(a(u.cloudShade.value, n.cloudShade, r.cloudShade), c * 0.6).multiplyScalar(1 - c * 0.45);
    desat(u.cloudLit.value, c * 0.7).multiplyScalar(1 - c * 0.5);
    u.sunColor.value.copy(this.sun.color);
    if (sunI < moonI) a(u.sunColor.value, n.sun, r.sun);
    u.sunVis.value = (1 - c) * smooth((p + 0.06) / 0.1);
    u.sunDir.value.copy(this.sunDir);
    u.cover.value = Math.max(this.cloud, c * 1.1);
    u.dark.value = c;
    u.night.value = d * (1 - c);
    u.flash.value = this.flash;
    u.haze.value = 0.55 + c * 0.4;
    {
      let e = 0;
      while (SKY_KEYS[e + 1][0] < l) e++;
      const t0 = SKY_KEYS[e], t1 = SKY_KEYS[e + 1];
      u.keyA.value = t0[1];
      u.keyB.value = t1[1];
      u.keyT.value = smooth((l - t0[0]) / (t1[0] - t0[0]));
      u.ocK.value = smooth((c - 0.15) / 0.6);
      u.sunAz.value = Math.atan2(this.sunDir.z, this.sunDir.x) / (Math.PI * 2);
    }
    u.cityGlow.value.setRGB(1, 0.62, 0.4).multiplyScalar(0.05 * Math.max(0, this.lamps - 0.3) * (0.4 + c));

    const x = 1 - smooth((p - 0.05) / 0.5);
    _c.copy(this.sun.color).multiplyScalar(0.35 * x * (1 - c) * smooth((p + 0.08) / 0.1));
    u.scatter.value.copy(_c);

    const fog = this.scene.fog;
    fog.color.copy(u.horizon.value).lerp(u.zenith.value, 0.22 + 0.16 * x * (1 - d));
    fog.density = o(n.fogD, r.fogD) * (1 + c * 1.8);

    desat(a(this.hemi.color, n.sky, r.sky), c * 0.7);
    a(this.hemi.groundColor, n.skyGround, r.skyGround);
    const warm = GOLD_WARM * x * (1 - c) * smooth((p + 0.06) / 0.1) * (1 - d);
    if (warm > 0) {
      this.hemi.color.lerp(_c.set(16760970), warm);
      this.hemi.groundColor.lerp(_c.set(12615760), warm);
    }
    this.hemi.intensity = o(n.hemiI, r.hemiI) * 0.38 * (1 + c * 0.35) * (1 + this.flash * 3) * (1 + 3.2 * smooth((o(n.lamps, r.lamps) - 0.3) / 1.2));
    this.lamps = Math.max(o(n.lamps, r.lamps), c * 0.9);

    const exposure = o(n.exposure, r.exposure) * (1 + c * 0.12);
    this.renderer.toneMappingExposure = exposure;
    this.final.uniforms.toneMappingExposure.value = exposure;
    this.bloom.strength = o(n.bloom, r.bloom);
    this.bloom.threshold = 1 - Math.min(this.lamps, 1.5) * 0.04;

    const E = this.grade;
    E.sat = o(n.sat, r.sat) * (1 - c * 0.18);
    E.con = o(n.con, r.con);
    a(E.lift, n.lift, r.lift);
    a(E.gain, n.gain, r.gain);
    desat(E.gain, c * 0.8);
    E.vig = o(n.vig, r.vig);
    const D = this.final.uniforms;
    D.sat.value = E.sat;
    D.con.value = E.con;
    D.vignette.value = E.vig;
    D.flash.value = this.flash * 0.35;
    D.lift.value.copy(E.lift);
    D.gain.value.copy(E.gain);
    const gMax = Math.max(D.gain.value.r, D.gain.value.g, D.gain.value.b);
    D.gain.value.multiplyScalar(1 / gMax);

    // skyline + env
    this.ringMat.uniforms.top.value.copy(u.horizon.value).multiplyScalar(0.75);
    this.ringMat.uniforms.bottom.value.copy(this.hemi.groundColor).lerp(u.horizon.value, 0.35).multiplyScalar(0.7);
    this.ringMat.uniforms.lit.value = Math.max(0, this.lamps - 0.3) * 0.6;
    this.updateEnvironment();
  }

  updateEnvironment() {
    if (!this.skyUniforms.ready.value) return;
    const u = this.skyUniforms;
    u.envMode.value = 1;
    this.envCam.update(this.renderer, this.envScene);
    u.envMode.value = 0;
    const rt = this.pmrem.fromCubemap(this.envCube.texture, this.envRT);
    if (!this.envRT) {
      this.envRT = rt;
      this.scene.environment = rt.texture;
      this.scene.environmentIntensity = 0.85 * this.envScale;
    }
  }

  render() {
    this.final.uniforms.time.value = performance.now() / 1000;
    this.skyUniforms.time.value = performance.now() / 1000;
    this.renderer.shadowMap.needsUpdate = true;
    this.composer.render();
    this.lastCalls = this.renderer.info.render.calls;
    this.renderer.info.reset();
  }

  start() {
    let last = performance.now();
    this.renderer.setAnimationLoop(() => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      this.tick?.(dt);
      this.render();
    });
  }
}

const _c = new THREE.Color();
