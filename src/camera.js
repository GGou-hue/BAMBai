// Free-fly camera with pointer-lock mouse look — the city-view camera, plus
// the ?x/y/z/yaw/pitch params the original supports.
// Deliberately three-free: it only pokes the camera object it's given.

const KEYS = {};
addEventListener('keydown', (e) => { KEYS[e.code] = true; });
addEventListener('keyup', (e) => { KEYS[e.code] = false; });

export class FlyCamera {
  constructor(camera, params) {
    this.camera = camera;
    this.speed = Number(params.get('speed') ?? 24);
    this.enabled = true;
    this.yaw = Number(params.get('yaw') ?? 0.78);
    this.pitch = Number(params.get('pitch') ?? -0.22);
    camera.position.set(
      Number(params.get('x') ?? 34),
      Number(params.get('y') ?? 15),
      Number(params.get('z') ?? 34),
    );
    this.apply();
    addEventListener('click', () => document.body.requestPointerLock?.());
    addEventListener('mousemove', (e) => {
      if (document.pointerLockElement !== document.body) return;
      this.yaw -= e.movementX * 0.0022;
      this.pitch = Math.min(1.5, Math.max(-1.5, this.pitch - e.movementY * 0.0022));
      this.apply();
    });
    addEventListener('wheel', (e) => {
      this.speed = Math.min(200, Math.max(2, this.speed * (e.deltaY > 0 ? 0.85 : 1.18)));
    }, { passive: true });
  }

  apply() {
    const { camera } = this;
    camera.rotation.set(0, 0, 0);
    camera.rotateY(this.yaw);
    camera.rotateX(this.pitch);
  }

  tick(dt) {
    if (!this.enabled || document.hidden) return;
    const k = (c) => (KEYS[c] ? 1 : 0);
    const dx = k('KeyD') - k('KeyA');
    const dy = k('KeyE') - k('KeyQ');
    const dz = k('KeyS') - k('KeyW');
    if (!dx && !dy && !dz) return;
    const fast = KEYS['ShiftLeft'] || KEYS['ShiftRight'] ? 4 : 1;
    const s = this.speed * fast * dt;
    // rotate the (dx, dz) plan around Y by yaw (same as applyAxisAngle)
    const cos = Math.cos(this.yaw), sin = Math.sin(this.yaw);
    const p = this.camera.position;
    p.x += (dx * cos + dz * sin) * s;
    p.z += (-dx * sin + dz * cos) * s;
    p.y += dy * s;
  }
}
