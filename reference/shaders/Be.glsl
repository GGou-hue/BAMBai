
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
    g = mix(vec3(1.0), g, mix(vec3(0.4), vec3(0.85), step(1.0, g))); // keep most of the glow, little of the darker anti-sun side (milky haze) // half the photo's profile, half the old curve: the dawn photo stays pale for 40 degrees, noon's turns deep blue by 20
    vSky = mix(horizon, zenith, w) * g;
  } else vSky = mix(horizon, zenith, pow(clamp(h, 0.0, 1.0), 0.5)); // until the atlas has loaded
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}