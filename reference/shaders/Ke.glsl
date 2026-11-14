
attribute float hgt; varying float vH; varying vec3 vP;
void main() { vH = hgt; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }