
uniform vec3 horizon, sunColor, sunDir, cloudLit, cloudShade, cityGlow, scatter;
uniform float sunVis, cover, time, dark, haze, ocK, ready;
uniform sampler2D tRing;
varying vec3 vDir; varying float vU, vE;
void main() {
  vec3 d = normalize(vDir);
  float sp = max(dot(d, sunDir), 0.0);
  vec2 rt = textureLod(tRing, vec2(vU + time * 0.00007, clamp(vE, 0.004, 0.996)), 0.0).rg; // explicit level: see SKY_FRAG
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
  cc = mix(cc, hazeCol, clamp(haze * (0.4 + 0.45 * (1.0 - clamp(vE, 0.0, 1.0))), 0.0, 0.85)); // far out: deep in the haze, more so low down
  gl_FragColor = vec4(cc, k * 0.92);
  #include <colorspace_fragment>
}