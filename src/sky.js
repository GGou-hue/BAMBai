// Sky dome, horizon cloud ring and the distant city silhouette.
// Shaders are the original's (render.js Be/Ve/We/Ge/Ke/qe), kept as close to
// verbatim as possible so the look matches.

import * as THREE from 'three';

export const SKY_VERT = /* glsl */ `
uniform float keyA, keyB, keyT, ocK, sunAz, ready;
uniform vec3 horizon, zenith;
uniform sampler2D tKeys;
varying vec3 vDir, vSky;
// keys.png (bake-sky.py): rows 0-511 the eight glow tiles (64 rows each, zenith on top), rows 512-519 their gradient profiles
vec3 glowTap(float k, float u, float e) { return textureLod(tKeys, vec2(u, 1.0 - (k * 64.0 + 0.5 + (1.0 - e) * 63.0) / 520.0), 0.0).rgb * 4.0; }
float profTap(float k, float e) { return textureLod(tKeys, vec2((0.5 + e * 255.0) / 256.0, 1.0 - (512.5 + k) / 520.0), 0.0).r; }
void main() {
  vDir = normalize(position);
  // the keys are smooth (the bake blurs them ~6 degrees), so they are read per vertex (96 x 48 sphere, 3.75 degree steps) and the
  // colour is interpolated: no texture reads per sky pixel for the gradient. The game's own horizon -> zenith colours (KEYS) are laid
  // along the photo's profile, then the photo's glow pattern (round the sun, the darker anti-sun side) multiplies them.
  float h = vDir.y, az = atan(vDir.z, vDir.x) * 0.15915494, e = clamp(asin(clamp(h, 0.0, 1.0)) * 0.63661977, 0.0, 1.0);
  if (ready > 0.5) {
    float u = az - sunAz + 0.5;
    float w = mix(profTap(keyA, e), profTap(keyB, e), keyT);
    vec3 g = mix(glowTap(keyA, u, e), glowTap(keyB, u, e), keyT);
    if (ocK > 0.01) { w = mix(w, profTap(7.0, e), ocK); g = mix(g, glowTap(7.0, az, e), ocK); }
    w = mix(w, sqrt(clamp(h, 0.0, 1.0)), 0.5);
    g = mix(vec3(1.0), g, mix(vec3(0.4), vec3(0.85), step(1.0, g))); // keep most of the glow, little of the darker anti-sun side (milky haze)
    vSky = mix(horizon, zenith, w) * g;
  } else vSky = mix(horizon, zenith, pow(clamp(h, 0.0, 1.0), 0.5)); // until the atlas has loaded
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

export const SKY_FRAG = /* glsl */ `
uniform vec3 zenith, horizon, glow, ground, sunColor, sunDir, moonDir, cloudLit, cloudShade, cityGlow, scatter;
uniform float sunVis, cover, time, dark, night, flash, haze, envMode, ocK, ready;
uniform sampler2D tClouds;
varying vec3 vDir, vSky;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  float s = dot(d, sunDir);
  float sp = max(s, 0.0);
  vec3 c = vSky;
  // dawn/dusk glow: wide around the sun's azimuth, hugging the horizon
  c += glow * pow(0.5 + 0.5 * s, 5.0) * exp(-max(h, 0.0) * 5.0) * (1.0 - 0.5 * ready);
  // haze band at the horizon, same colour the fog uses (incl. warm scatter towards the sun) so the city melts into it
  vec3 hazeCol = horizon + scatter * pow(sp, 6.0);
  c = mix(c, hazeCol, haze * exp(-max(h, 0.0) * 14.0));
  if (h < 0.0) c = mix(hazeCol, ground, clamp(-h * 5.0, 0.0, 1.0));
  // sun: halo, glare and disc (hidden once it has set)
  float up = smoothstep(-0.03, 0.02, sunDir.y);
  c += sunColor * (pow(sp, 10.0) * 0.18 + pow(sp, 120.0) * 0.5) * sunVis * up;
  c += sunColor * smoothstep(0.99955, 0.99972, s) * 7.0 * sunVis * up * smoothstep(-0.02, 0.0, h) * mix(0.35, 1.0, smoothstep(0.0, 0.3, sunDir.y)) * (1.0 - envMode);
  // night: stars and the moon
  float k = 0.0;
  if (night > 0.01 && h > 0.0) {
    vec3 sd = d * 260.0, cell = floor(sd), f = fract(sd) - 0.5;
    float r = hash3(cell);
    float star = step(0.987, r) * smoothstep(0.3, 0.0, length(f)) * (0.55 + 0.45 * sin(time * (1.5 + r * 3.0) + r * 60.0));
    c += vec3(0.85, 0.9, 1.0) * star * night * smoothstep(0.05, 0.35, h) * 1.4;
    float m = dot(d, moonDir);
    float disc = smoothstep(0.99966, 0.99978, m);
    float shade = 0.82 + 0.18 * noise(d.xz * 900.0);
    c += vec3(0.95, 0.97, 1.0) * (disc * 2.4 * shade + pow(max(m, 0.0), 300.0) * 0.25 + pow(max(m, 0.0), 20.0) * 0.04) * night;
  }
  // clouds: two layers cut from real skies (R density + G shading of scattered cumulus, B density of bigger masses), each turning
  // slowly about the zenith; more cover lowers the threshold (only the dense cores show on a fair day) and brings in the big masses
  if (h > 0.0 && cover > 0.01 && ready > 0.5) {
    float az = atan(d.z, d.x) * 0.15915494, e = asin(min(h, 1.0)) * 0.63661977;
    vec3 ca = textureLod(tClouds, vec2(az + time * 0.00009, e), 0.0).rgb;
    float cv = clamp(cover, 0.0, 1.0);
    float kA = smoothstep(0.66 - cv * 0.7, 1.1 - cv * 0.6, ca.r);
    float kB = smoothstep(0.9 - cv * 0.75, 1.2 - cv * 0.6, ca.b) * smoothstep(0.3, 0.7, cv);
    k = max(kA, kB);
    float lit = kA >= kB ? ca.g : mix(ca.g, 0.75 - 0.3 * ca.b, 0.5);
    k *= smoothstep(0.0, 0.08, h) * (1.0 - ocK * 0.55);
    lit = clamp(lit * 1.15 - 0.12 - 0.15 * k, 0.0, 1.0);
    lit = mix(lit, 0.3, dark);
    vec3 cc = mix(cloudShade * 0.8, cloudLit, lit);
    cc += sunColor * pow(sp, 6.0) * 0.6 * sunVis * up * (1.0 - k * 0.6);
    cc += cityGlow * (0.25 - 0.15 * lit) * (1.0 - h);
    cc = mix(cc, hazeCol, haze * exp(-h * 9.0));
    c = mix(c, cc, k * 0.92);
  }
  c += vec3(0.7, 0.75, 0.95) * flash * (0.4 + k);
  // in the reflection/ambient capture, tame the saturated horizon so dusk light on walls is not a single orange
  if (envMode > 0.5) { float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(c, vec3(l) * vec3(0.9, 0.95, 1.1), 0.55 * exp(-max(h, 0.0) * 3.0)); }
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;

export const RING_VERT = /* glsl */ `
varying vec3 vDir; varying float vU, vE;
void main() {
  vDir = position; vU = uv.x; vE = position.y / 1400.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const RING_FRAG = /* glsl */ `
uniform vec3 horizon, sunColor, sunDir, cloudLit, cloudShade, cityGlow, scatter;
uniform float sunVis, cover, time, dark, haze, ocK, ready;
uniform sampler2D tRing;
varying vec3 vDir; varying float vU, vE;
void main() {
  vec3 d = normalize(vDir);
  float sp = max(dot(d, sunDir), 0.0);
  vec2 rt = textureLod(tRing, vec2(vU + time * 0.00007, clamp(vE, 0.004, 0.996)), 0.0).rg;
  float cv = clamp(cover, 0.0, 1.0);
  float k = smoothstep(0.5 - cv * 0.45, 0.88 - cv * 0.4, rt.r);
  k *= smoothstep(-0.12, 0.1, vE) * (1.0 - smoothstep(0.65, 1.0, vE)) * (1.0 - ocK * 0.5) * ready;
  if (k < 0.004) discard;
  float lit = clamp(rt.g * 1.15 - 0.1, 0.0, 1.0);
  lit = mix(lit, 0.3, dark);
  vec3 cc = mix(cloudShade * 0.8, cloudLit, lit);
  cc += sunColor * pow(sp, 6.0) * 0.6 * sunVis * (1.0 - k * 0.5);
  cc += cityGlow * (1.0 - lit);
  vec3 hazeCol = horizon + scatter * pow(sp, 6.0);
  cc = mix(cc, hazeCol, clamp(haze * (0.4 + 0.45 * (1.0 - clamp(vE, 0.0, 1.0))), 0.0, 0.85));
  gl_FragColor = vec4(cc, k * 0.92);
  #include <colorspace_fragment>
}`;

// Distant city silhouette with lit windows — the original uses it for the
// environment capture; we also draw it in the main scene until Phase 2 brings
// the real skyline.
export const SKYLINE_VERT = /* glsl */ `
attribute float hgt; varying float vH; varying vec3 vP;
void main() { vH = hgt; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

export const SKYLINE_FRAG = /* glsl */ `
uniform vec3 top, bottom, win; uniform float lit;
varying float vH; varying vec3 vP;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec3 c = mix(bottom, top, vH);
  vec2 g = vec2(atan(vP.z, vP.x) * 160.0, vP.y / 3.4);
  float w = step(0.35, fract(g.x)) * step(0.4, fract(g.y)) * step(0.55, hash(floor(g)));
  c += win * w * lit;
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;

// 150 quads round a 700 m circle: low blocks, with a taller one every 23rd.
export function skylineGeometry() {
  const pos = [], hgt = [], idx = [];
  let r = 7;
  const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 150; i++) {
    if (rnd() < 0.08) continue;
    const a = (i / 150) * Math.PI * 2;
    const b = a + (Math.PI * 2 / 150) * (0.75 + rnd() * 0.3);
    const tower = i % 23 === 11;
    const dist = 700 * (0.9 + rnd() * 0.2);
    const h = tower ? 40 + rnd() * 20 : 8 + rnd() * 8;
    const at = (ang, y) => [Math.cos(ang) * dist, y, Math.sin(ang) * dist];
    const base = pos.length / 3;
    for (const [ang, y] of [[a, -5], [b, -5], [b, h], [a, h]]) pos.push(...at(ang, y));
    hgt.push(0, 0, 1, 1);
    idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('hgt', new THREE.Float32BufferAttribute(hgt, 1));
  g.setIndex(idx);
  return g;
}
