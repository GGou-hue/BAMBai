
varying vec3 vDir; varying float vU, vE;
void main() {
  vDir = position; vU = uv.x; vE = position.y / ${He.toFixed(2)};
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}