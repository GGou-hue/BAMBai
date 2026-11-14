
    uniform sampler2D tDiffuse, tAO, tBloom, tDepth; uniform vec2 camNF; uniform float bloomOn, ao, sat, con, vignette, grain, flash, time; uniform vec3 lift, gain, tShadow, tHigh;
    uniform vec2 sunUV; uniform float shafts, aspect; uniform vec3 shaftCol;
    uniform float speedBlur, dofFocus, dofAmt, sharp; uniform vec2 texel;
    varying vec2 vUv;
    #include <tonemapping_pars_fragment>
    float rnd(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      // 11-04 performance mode (Low and Lowest drawn under the screen's own pixels): a contrast-adaptive sharpen (AMD CAS style, the cross of
      // four neighbours), so the browser's stretch of a smaller picture reads close to full resolution. Edges with contrast to spare get
      // more, flat areas and hard edges less, and the result stays inside its neighbours' range (no halos). The weights come from the
      // colours squashed into 0..1 (this buffer is HDR); the sharpen applies to the HDR colour itself.
      if (sharp > 0.0) {
        vec3 a = min(texture2D(tDiffuse, vUv - vec2(0.0, texel.y)).rgb, vec3(6e4)), b = min(texture2D(tDiffuse, vUv - vec2(texel.x, 0.0)).rgb, vec3(6e4));
        vec3 d = min(texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)).rgb, vec3(6e4)), e = min(texture2D(tDiffuse, vUv + vec2(0.0, texel.y)).rgb, vec3(6e4));
        vec3 mn = min(c, min(min(a, b), min(d, e))), mx = max(c, max(max(a, b), max(d, e)));
        vec3 mnS = mn / (1.0 + mn), mxS = mx / (1.0 + mx);
        vec3 amp = sqrt(clamp(min(mnS, 1.0 - mxS) / max(mxS, 1e-4), 0.0, 1.0));
        vec3 w = amp * (-1.0 / mix(8.0, 5.0, sharp));
        c = clamp((c + (a + b + d + e) * w) / (1.0 + 4.0 * w), mn, mx);
      }
      // GTA pass item 5: cutscene depth of field. The shot's subject (dofFocus m away) stays sharp; what lies well behind or in front
      // softens over a 12-tap disc, wider the further from the focus (a long lens on a close-up, not a tilt-shift on wide shots).
      if (dofAmt > 0.0) {
        float dz = texture2D(tDepth, vUv).x, dist = camNF.x * camNF.y / (camNF.y - (camNF.y - camNF.x) * dz);
        float coc = clamp((abs(dist - dofFocus) / max(dofFocus, 0.5) - 0.25) * 0.8, 0.0, 1.0) * dofAmt;
        if (coc > 0.02) {
          vec3 acc = c; float wsum = 1.0;
          for (int i = 0; i < 12; i++) {
            float a = float(i) * 2.39996, r = sqrt((float(i) + 0.5) / 12.0);
            vec2 o = vec2(cos(a), sin(a)) * r * coc * vec2(0.0065 / aspect * 1.78, 0.0065);
            float dz2 = texture2D(tDepth, vUv + o).x, d2 = camNF.x * camNF.y / (camNF.y - (camNF.y - camNF.x) * dz2);
            float w = step(dofFocus * 0.8, d2) + step(d2, dofFocus * 0.8) * step(dist, dofFocus * 0.8); // the sharp subject does not bleed into the blur behind it
            acc += texture2D(tDiffuse, vUv + o).rgb * w; wsum += w;
          }
          c = acc / wsum;
        }
      }
      // Speed blur (Settings > Motion blur): fast in a vehicle, the edges of the frame streak towards the middle; the centre stays sharp.
      if (speedBlur > 0.0) {
        vec2 d = vUv - 0.5;
        float k = speedBlur * smoothstep(0.12, 0.62, length(d * vec2(aspect / 1.78, 1.0)));
        if (k > 0.002) {
          vec3 acc = c;
          for (int i = 1; i < 8; i++) acc += texture2D(tDiffuse, vUv - d * (float(i) * 0.0075 * k)).rgb;
          c = acc / 8.0;
        }
      }
      if (bloomOn > 0.5) c += texture2D(tBloom, vUv).rgb;
      // Upgrade R3: sun shafts at dawn and dusk. March from this pixel towards the sun across the depth buffer; every step that lands
      // on open sky (depth at the far plane) lets light through, the rest (trees, buildings, wires) block it. Gaps in the rain-tree
      // canopy and between buildings become rays in the haze. Only with a low sun in a clear sky, on the High tier (needs the depth).
      if (shafts > 0.0) {
        vec2 toSun = sunUV - vUv;
        float reach = 1.0 - smoothstep(0.15, 1.05, length(toSun * vec2(aspect, 1.0)));
        if (reach > 0.0) {
          vec2 stepv = toSun * (0.9 / 20.0);
          vec2 p = vUv + stepv * rnd(vUv * 911.0 + fract(time * 7.0)); // jittered start: banding becomes fine noise
          float acc = 0.0, w = 1.0, wsum = 0.0;
          for (int i = 0; i < 20; i++) {
            float sky = step(0.999995, texture2D(tDepth, clamp(p, 0.001, 0.999)).x);
            acc += sky * w; wsum += w; w *= 0.93; p += stepv;
          }
          // the sky round the sun is already bright: there the shafts add only a little (else it is just a bigger sun glow); on
          // trees, walls and road they show as light in the haze, broken by whatever stands between them and the sun
          // and the light is scattered by the air between the eye and the surface, so it builds with distance: little on Arjun 3 m
          // away (no washed-out hero), full on the far trees
          float dz0 = texture2D(tDepth, vUv).x, here = step(0.999995, dz0);
          float dist = camNF.x * camNF.y / (camNF.y - (camNF.y - camNF.x) * dz0);
          float air = here > 0.5 ? 0.5 : 1.0 - exp(-dist / 20.0);
          c += shaftCol * (acc / wsum) * reach * reach * shafts * air;
        }
      }
      if (ao > 0.0) {
        // AO is a 1.4 m radius effect: past ~150 m it is sub-pixel noise (dark speckle on the far skyline slabs), so it fades out with view distance
        float zn = camNF.x, zf = camNF.y, dz = texture2D(tDepth, vUv).x, viewZ = zn * zf / ((zf - zn) * dz - zf);
        c *= mix(1.0, texture2D(tAO, vUv).r, ao * (1.0 - smoothstep(120.0, 320.0, -viewZ)));
      }
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
      { float l2 = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = clamp(c + tShadow * (1.0 - smoothstep(0.0, 0.5, l2)) + tHigh * smoothstep(0.4, 1.0, l2), 0.0, 1.0); } // R1 split tone
      vec2 q = vUv - 0.5;
      c *= 1.0 - vignette * dot(q, q) * 2.2;
      float n = rnd(vUv * 1000.0 + fract(time) * 37.0);
      c += (n - 0.5) * (1.0 / 255.0 + grain * 0.06);
      gl_FragColor = vec4(c, 1.0);
    }