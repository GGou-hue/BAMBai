// Day cycle — keyframes and sky-glow key indices extracted verbatim from the
// original renderer (render.js `J` / `Ne`). Colours are packed 0xRRGGBB ints,
// consumed through THREE.Color.set(), exactly as the game does.

export const KEYS = {
  zenith: 198418, horizon: 1712696, glow: 0, ground: 658192, sun: 10466559,
  sunI: 0, sky: 5925532, skyGround: 3812386, hemiI: 1.9, bounce: 2760730,
  fogD: 0.0022, exposure: 1.55, lamps: 1.5, cloudLit: 1843762, cloudShade: 724502,
  sat: 0.98, con: 1.06, lift: 395804, gain: 16184575, vig: 0.4, bloom: 0.5,
};

export const DAY = [
  { h: 0, ...KEYS },
  { h: 4.9, ...KEYS, zenith: 395806, horizon: 2763336, glow: 1708064, lamps: 1.5 },
  { h: 5.9, zenith: 2373228, horizon: 11048090, glow: 11558968, ground: 2761768, sun: 16751208, sunI: 0.2, sky: 6977708, skyGround: 3420212, hemiI: 0.8, bounce: 3551284, fogD: 0.0022, exposure: 1.15, lamps: 1.1, cloudLit: 14196880, cloudShade: 4869740, sat: 1, con: 1.04, lift: 395290, gain: 16773868, vig: 0.34, bloom: 0.5 },
  { h: 6.6, zenith: 4879548, horizon: 15256240, glow: 16752736, ground: 6968904, sun: 16757876, sunI: 2, sky: 9876192, skyGround: 7234648, hemiI: 1.15, bounce: 8415832, fogD: 0.0017, exposure: 1.05, lamps: 0.25, cloudLit: 16766128, cloudShade: 9080492, sat: 1.03, con: 1.05, lift: 263436, gain: 16773860, vig: 0.3, bloom: 0.4 },
  { h: 8, zenith: 2582224, horizon: 11850480, glow: 4204568, ground: 9206370, sun: 16770236, sunI: 3, sky: 10404590, skyGround: 10125412, hemiI: 1.7, bounce: 11045478, fogD: 0.0011, exposure: 1, lamps: 0, cloudLit: 16777215, cloudShade: 11845844, sat: 1.05, con: 1.07, lift: 263692, gain: 16774888, vig: 0.26, bloom: 0.28 },
  { h: 10.5, zenith: 2254036, horizon: 12113136, glow: 0, ground: 9206370, sun: 16773340, sunI: 3.2, sky: 10667246, skyGround: 9863270, hemiI: 1.7, bounce: 10521192, fogD: 0.0011, exposure: 0.98, lamps: 0, cloudLit: 16777215, cloudShade: 12109014, sat: 1.04, con: 1.07, lift: 263692, gain: 16775922, vig: 0.24, bloom: 0.26 },
  { h: 13.5, zenith: 2779856, horizon: 12638446, glow: 0, ground: 9206370, sun: 16774890, sunI: 3.3, sky: 10929900, skyGround: 9863784, hemiI: 1.7, bounce: 10258538, fogD: 0.0013, exposure: 0.96, lamps: 0, cloudLit: 16777215, cloudShade: 12371670, sat: 1.02, con: 1.07, lift: 263692, gain: 16776440, vig: 0.24, bloom: 0.26 },
  { h: 16, zenith: 3832012, horizon: 13687008, glow: 3153936, ground: 9206370, sun: 16771268, sunI: 3.1, sky: 10797284, skyGround: 9863268, hemiI: 1.7, bounce: 11045476, fogD: 0.0014, exposure: 0.98, lamps: 0, cloudLit: 16775406, cloudShade: 12106956, sat: 1.04, con: 1.07, lift: 263692, gain: 16774372, vig: 0.26, bloom: 0.28 },
  { h: 17.3, zenith: 4617920, horizon: 14472902, glow: 13666888, ground: 8021072, sun: 16758888, sunI: 3.2, sky: 9220846, skyGround: 6710896, hemiI: 1.75, bounce: 10123872, fogD: 0.0014, exposure: 1.1, lamps: 0.05, cloudLit: 16769208, cloudShade: 10132660, sat: 1.12, con: 1.1, lift: 263951, gain: 16773340, vig: 0.3, bloom: 0.32 },
  { h: 18.05, zenith: 4216990, horizon: 15119504, glow: 16740408, ground: 5916224, sun: 16748624, sunI: 2.3, sky: 8428772, skyGround: 5263966, hemiI: 1.95, bounce: 7232080, fogD: 0.0017, exposure: 1.26, lamps: 0.35, cloudLit: 16752752, cloudShade: 8024212, sat: 1.12, con: 1.09, lift: 329754, gain: 16772828, vig: 0.32, bloom: 0.44 },
  { h: 18.6, zenith: 2306158, horizon: 11832456, glow: 15755840, ground: 3813432, sun: 16743016, sunI: 0.15, sky: 7375048, skyGround: 4867152, hemiI: 1.9, bounce: 3946048, fogD: 0.0019, exposure: 1.4, lamps: 1.15, cloudLit: 14190714, cloudShade: 4210794, sat: 1.04, con: 1.07, lift: 461858, gain: 15922431, vig: 0.34, bloom: 0.5 },
  { h: 19.3, zenith: 1054282, horizon: 4080240, glow: 4859952, ground: 1578526, sun: 10466559, sunI: 0, sky: 6189226, skyGround: 3812914, hemiI: 1.95, bounce: 3155498, fogD: 0.0022, exposure: 1.5, lamps: 1.5, cloudLit: 4208730, cloudShade: 1447976, sat: 0.95, con: 1.05, lift: 526878, gain: 16184063, vig: 0.38, bloom: 0.5 },
  { h: 20.5, ...KEYS },
  { h: 24, ...KEYS },
];

// Which baked glow tile (rows of keys.png) the sky reads, per hour.
export const SKY_KEYS = [[0, 6], [4.8, 6], [5.7, 0], [6.25, 0], [7.3, 3], [8.75, 1], [12.2, 2], [15, 2], [17.09, 3], [17.88, 4], [18.55, 5], [19.5, 6], [24, 6]];

// Sun/moon geometry constants from the original.
export const SUNRISE = 6.15;      // ke
export const SUN_ELEV = 64;       // Ae — max elevation, degrees
export const MIN_ELEV = 24;       // je — min elevation, degrees (?minelev)
export const ZEN_DESAT = 0.35;    // Pe — how far the zenith is pulled to grey
export const MOON = { color: 11057407, intensity: 1 };
export const GOLD_WARM = 0.18;    // lt — warm bounce on the hemisphere at dawn/dusk
export const GOLD_FILL = 0.9;     // ct — how much of it survives overcast
