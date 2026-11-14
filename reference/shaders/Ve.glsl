
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
  // dawn/dusk glow: wide around the sun's azimuth, hugging the horizon (the photos carry most of it now)
  c += glow * pow(0.5 + 0.5 * s, 5.0) * exp(-max(h, 0.0) * 5.0) * (1.0 - 0.5 * ready);
  // haze band at the horizon, same colour the fog uses (incl. warm scatter towards the sun) so the city melts into it
  vec3 hazeCol = horizon + scatter * pow(sp, 6.0);
  c = mix(c, hazeCol, haze * exp(-max(h, 0.0) * 14.0));
  if (h < 0.0) c = mix(hazeCol, ground, clamp(-h * 5.0, 0.0, 1.0));
  // sun: halo, glare and disc (hidden once it has set)
  float up = smoothstep(-0.03, 0.02, sunDir.y);
  c += sunColor * (pow(sp, 10.0) * 0.18 + pow(sp, 120.0) * 0.5) * sunVis * up;
  c += sunColor * smoothstep(0.99955, 0.99972, s) * 7.0 * sunVis * up * smoothstep(-0.02, 0.0, h) * mix(0.35, 1.0, smoothstep(0.0, 0.3, sunDir.y)) * (1.0 - envMode); // F12c: no disc in the env capture (glare blobs on water/glass)
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
    // one read, at an explicit level 0 (the map has no mip chain): an implicit-LOD read (texture2D) measured ~0.3-0.5 ms per full
    // 1080p sky on ANGLE/Metal, the explicit one ~0.03 ms, the same as the old procedural sky
    float az = atan(d.z, d.x) * 0.15915494, e = asin(min(h, 1.0)) * 0.63661977;
    vec3 ca = textureLod(tClouds, vec2(az + time * 0.00009, e), 0.0).rgb;
    float cv = clamp(cover, 0.0, 1.0);
    float kA = smoothstep(0.66 - cv * 0.7, 1.1 - cv * 0.6, ca.r);
    float kB = smoothstep(0.9 - cv * 0.75, 1.2 - cv * 0.6, ca.b) * smoothstep(0.3, 0.7, cv);
    k = max(kA, kB);
    float lit = kA >= kB ? ca.g : mix(ca.g, 0.75 - 0.3 * ca.b, 0.5);
    k *= smoothstep(0.0, 0.08, h) * (1.0 - ocK * 0.55);
    lit = clamp(lit * 1.15 - 0.12 - 0.15 * k, 0.0, 1.0);                // dark bases, bright tops, thick cores a little darker
    lit = mix(lit, 0.3, dark);
    vec3 cc = mix(cloudShade * 0.8, cloudLit, lit);
    cc += sunColor * pow(sp, 6.0) * 0.6 * sunVis * up * (1.0 - k * 0.6); // silver lining near the sun
    cc += cityGlow * (0.25 - 0.15 * lit) * (1.0 - h);                     // sodium-orange city light on the undersides
    cc = mix(cc, hazeCol, haze * exp(-h * 9.0));                         // distant clouds fade into the haze
    c = mix(c, cc, k * 0.92);
  }
  c += vec3(0.7, 0.75, 0.95) * flash * (0.4 + k);
  // in the reflection/ambient capture, tame the saturated horizon so dusk light on walls is not a single orange
  if (envMode > 0.5) { float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(c, vec3(l) * vec3(0.9, 0.95, 1.1), 0.55 * exp(-max(h, 0.0) * 3.0)); } // F12c 0.4 -> 0.55, cooler: shade at dusk reads blue, not salmon
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}