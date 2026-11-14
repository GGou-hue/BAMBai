
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
}