// BAMBai branding: rotating key-art on the engine's loading screen, sarcastic
// Mumbai tips (Hinglish), and a text sweep that renames the old game name to
// BAMBai everywhere it shows up in UI text. Story/city names are left alone.

// loading carousel: the comic-collage slides rotate every few seconds (all
// pre-shrunk to ~1280px JPEGs so they never flash a black frame). The old
// "Amchi Mumbai" hero is NOT in the rotation (user request).
const LOAD_ART = [
  '/brand/carousel/slide-1.jpg', '/brand/carousel/slide-2.jpg', '/brand/carousel/slide-3.jpg',
  '/brand/carousel/slide-4.jpg', '/brand/carousel/slide-5.jpg', '/brand/carousel/slide-6.jpg',
  '/brand/carousel/slide-7.jpg', '/brand/carousel/slide-8.jpg', '/brand/carousel/slide-9.jpg',
];
const CYCLE_MS = 7000;

// --- loading-screen tips: Mumbai fun facts, sarcasm with innocence ----------
const TIPS = [
  ['First time here?', 'The first load takes about two minutes. Order a cutting chai and read this while it works.'],
  ['Mumbai traffic rule', 'A red light is a suggestion, not a guarantee. Learn the language of the horn first — “coming from behind” means “move, I am not stopping”.'],
  ['Local train fact', 'Breathing inside a coach at peak hour is a skill. Do not praise the Virar fast — it can hear you.'],
  ['Cutting chai', 'One cutting = half a glass, but the friendship is full. The tapri guy keeps credit running; the bank does not.'],
  ['Auto uncles', 'By meter it is Zurich, by negotiated fare it is Mumbai. Saying twenty for thirty is the local greeting.'],
  ['Vada pav', 'Fifteen rupees of guaranteed happiness. Do not compare it to a batata vada — that starts a fight.'],
  ['The rain timetable', 'June arrives and everyone remembers the BMC. The lane pothole gleams with water — locals call it a swimming pool.'],
  ['Marine Drive rule', 'At night the Queen’s Necklace wakes up. All your tension ends here… then Monday comes back.'],
  ['Dabbawala fact', 'Six sigma accuracy — Harvard studies it, the dabbawala simply wins. The tiffin left home, so it will reach home. Promise.'],
  ['Bollywood fact', 'Film City shoots three blockbusters a day. Become an extra — the dream of being a hero is free.'],
  ['Pothole fact', 'Mumbai’s potholes have their own pin code. Bike riders call them “surprise speed breakers”.'],
  ['Cricket fact', 'Hit a six in the gully, but do not break a window — the “ball only” rule applies. The maidan is booked from five in the evening.'],
];
const FLAVOR = [
  'Auto uncle: “the meter does not work, we agree on a fare.” Classic.',
  'In the local, “please adjust a little” means: empty the entire space.',
  'Best route from Bandra to Worli: sleep first, figure it out later.',
  'Enjoy the smile of the flower-selling aunty at the signal, then say no.',
  'In Mumbai distance is measured in time, not kilometres.',
  'Here “I am coming in five minutes” means: after the chai, we will see.',
  'The city never sleeps — it just walks with its eyes closed.',
  'Order the cutting chai twice; the second one is free. (It is not.)',
  'If you miss your train at Kurla, do not wait for it. Nobody ever waits for it.',
  'Government files list the pothole as a “natural speed breaker”.',
  'Do not drive slowly on the sea link — the drivers behind will share their full vocabulary.',
  'Mumbai’s best air conditioning: the breeze from an open bus window.',
];
const TIP_MS = 8500;
let tipI = -1, flavorI = -1, curTip = null, curFlavor = null;

function renderTip(el) {
  if (!el || !el.isConnected) return;
  const [b, t] = curTip;
  el.innerHTML = `<b>${b}</b>${t}<small>Next one loads even faster.</small>`;
}

function startTips(load) {
  if (load.dataset.tips) return;
  load.dataset.tips = '1';
  const tick = () => {
    if (!load.isConnected) { clearInterval(timer); return; }
    tipI = (tipI + 1) % TIPS.length;
    flavorI = (flavorI + 1) % FLAVOR.length;
    curTip = TIPS[tipI];
    curFlavor = FLAVOR[flavorI];
    renderTip(load.querySelector('.nu-lnote'));
    const tip = load.querySelector('.nu-tip');
    if (tip) tip.textContent = curFlavor;
  };
  tick();
  const timer = setInterval(tick, TIP_MS);
}

function assertTips(load) {
  // the engine writes its own tips at progress thresholds; ours win
  if (!curTip) return;
  const note = load.querySelector('.nu-lnote');
  if (note && !note.querySelector('b')) { note.innerHTML = `<b>${curTip[0]}</b>${curTip[1]}<small>Next one loads even faster.</small>`; }
  else if (note && note.textContent && !note.textContent.includes(curTip[0])) renderTip(note);
  const tip = load.querySelector('.nu-tip');
  if (tip && curFlavor && tip.textContent !== curFlavor) tip.textContent = curFlavor;
}

// --- rotating loading-screen art -------------------------------------------
function dressLoading(el) {
  if (el.querySelector('.nu-loadart')) return;
  const wrap = document.createElement('div');
  wrap.className = 'nu-loadart';
  LOAD_ART.forEach((src, i) => {
    const layer = document.createElement('div');
    layer.className = 'nu-artlayer' + (i === 0 ? ' on' : '');
    const img = new Image();
    img.src = src; img.alt = ''; img.decoding = 'async'; img.className = 's';
    layer.append(img);
    wrap.append(layer);
  });
  el.prepend(wrap);
  const mark = new Image();
  mark.src = '/brand/icon.png';
  mark.alt = '';
  mark.className = 'nu-loadmark';
  el.append(mark);
  // the little auto on the progress bar (replaces the engine's car icon)
  const slot = el.querySelector('.nu-road-auto');
  if (slot && !slot.dataset.auto) {
    slot.dataset.auto = '1';
    slot.innerHTML = `<svg viewBox="0 0 32 22" aria-hidden="true">
      <path d="M3 13v-3q0-5 6-5h9q5 0 7 3.4L28 12v4h-2.2" fill="currentColor"/>
      <rect x="2" y="12" width="26" height="4" rx="2" fill="currentColor" opacity=".55"/>
      <circle cx="9" cy="17.5" r="3.2" fill="currentColor"/>
      <circle cx="24" cy="17.5" r="3.2" fill="currentColor"/>
      <path d="M1.5 10.5 4 9.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`;
  }
  // the engine paints its own background inline; ours is the art layer instead
  el.style.background = 'linear-gradient(rgba(7,4,11,.16) 55%, rgba(7,4,11,.6)), #0b0714';
  let i = 0;
  const timer = setInterval(() => {
    if (!el.isConnected) { clearInterval(timer); return; }
    const layers = wrap.querySelectorAll('.nu-artlayer');
    i = (i + 1) % layers.length;
    layers.forEach((l, k) => l.classList.toggle('on', k === i));
  }, CYCLE_MS);
}

// --- BAMBai brand renames ---------------------------------------------------
// Every player-facing string in the game engine has been rewritten to plain
// English at the source, so the old Hinglish word-by-word conversion is gone.
// kept for API compatibility with the boot sequence — a straight pass-through.
export function hinglishify(g) { /* text is English at source */ }

// --- characters actually SPEAK (browser speech, full lines, English) ---------
// Priority: every line is spoken IN FULL with a proper English accent — no
// Hinglish, no mid-line cancellations. The system speech engine queues
// complete utterances; female/male voices are picked per character.
const VOICE_KEY = 'bambai.voice';
let speechQ = [], speaking = false;

function voiceFor(who) {
  const w = String(who ?? '').toLowerCase();
  if (/(aunty|akka|amma|didi|mausi|shobha|meera|priya|vidya|lakshmi|ma'am|madam|sister)/.test(w)) return { pitch: 1.25, rate: 1.0, female: true };
  if (/(kid|bablu|pappu|chintu|bachcha)/.test(w)) return { pitch: 1.45, rate: 1.06, female: true };
  if (/(uncle|appa|papa|baba)/.test(w)) return { pitch: 0.72, rate: 0.92, female: false };
  if (/(cop|inspector|police|constable)/.test(w)) return { pitch: 0.8, rate: 0.96, female: false };
  if (/arjun/.test(w)) return { pitch: 1.05, rate: 1.03, female: false };
  return { pitch: 0.9, rate: 1.0, female: /[ai]$/.test(w.split(/\s+/).pop() ?? '') };
}

function pickSystemVoice(female) {
  if (!('speechSynthesis' in window)) return null;
  const vs = speechSynthesis.getVoices();
  if (!vs.length) return null;
  // prefer a natural English (US/UK) voice — NOT the Indian-accent voices
  const F = /(aria|jenny|neerja|sonia|libby|maisie|zira|hazel|susan|serena|samantha|victoria|karen|moira|tessa|fiona|ellen|ava|allison|emma|amber|ashley|cora|elizabeth|jane|nancy|sara|lydia|michelle|ana|clarity|female)/i;
  const M = /(guy|davis|tony|brandon|christopher|eric|roger|steffan|ryan|thomas|george|william|alex|daniel|david|mark|fred|tom|aaron|arthur|james|brian|male)/i;
  const en = vs.filter((v) => /^en[-_]/i.test(v.lang) && !/en[-_]in/i.test(v.lang));
  const pool = en.length ? en : vs.filter((v) => /^en/i.test(v.lang));
  const named = pool.filter((v) => (female ? F : M).test(v.name) && !(female ? M : F).test(v.name));
  return named[0] ?? pool[0] ?? vs[0];
}

function voiceOn() {
  const p = new URLSearchParams(location.search).get('voice');
  if (p != null) return p !== '0';
  return localStorage.getItem(VOICE_KEY) !== '0';
}

function stopVoice() {
  speechQ = [];
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

function speakFull(who, text) {
  return new Promise((done) => {
    let settled = false;
    const finish = () => { if (!settled) { settled = true; done(); } };
    try {
      const u = new SpeechSynthesisUtterance(String(text).replace(/[*_~]/g, ''));
      const cfg = voiceFor(who);
      const v = pickSystemVoice(cfg.female);
      if (v) u.voice = v;
      u.lang = v?.lang || 'en-US';
      u.pitch = cfg.pitch; u.rate = cfg.rate; u.volume = 1;
      u.onend = finish; u.onerror = finish;
      speechSynthesis.speak(u);
      // safety net: resolve if the engine never fires onend (rare but real)
      setTimeout(finish, Math.min(45000, 2000 + String(text).length * 95));
    } catch { finish(); }
  });
}

function pump() {
  if (speaking || !speechQ.length) return;
  speaking = true;
  (async () => {
    while (speechQ.length && voiceOn()) {
      const { who, text } = speechQ.shift();
      window.__voiceLast = { who, text: String(text).slice(0, 70), at: Date.now() };
      await speakFull(who, text);
      window.__voiceLast.played = true;
    }
    speaking = false;
  })();
}

export function speakify(g) {
  const hud = g?.hud;
  if (!hud?.say || hud.__spk) return;
  hud.__spk = true;
  const orig = hud.say.bind(hud);
  hud.say = (who, text, ...rest) => {
    const shown = String(text);
    const p = orig(who, shown, ...rest);
    if (p && typeof p.then === 'function' && shown && voiceOn()) {
      speechQ.push({ who, text: shown });
      if (speechQ.length > 4) speechQ.shift(); // keep up with fast scenes
      pump();
    }
    return p;
  };
  if (hud.choice && !hud.__chEn) {
    hud.__chEn = true;
    const origChoice = hud.choice.bind(hud);
    hud.choice = (q, opts, ...rest) =>
      origChoice(q, (opts ?? []).map((o) => String(o)), ...rest);
  }
}


// --- BAMBai text sweep -------------------------------------------------------
const RENAMES = [
  [/loading koramangala/gi, 'Loading BAMBai'],
  [/downloading koramangala/gi, 'Downloading BAMBai'],
  [/game paused\. chai is getting cold\./gi, 'Paused. Your tea is getting cold.'],
  [/bangalore/gi, 'BAMBai'],
  [/ootago/gi, 'FoodDash'],
  [/kaasupay/gi, 'CashPay'],
  [/nimma savari/gi, 'Your Ride'],
  [/hogi cabs/gi, 'GoGo Cabs'],
  [/hogi cab/gi, 'GoGo Cab'],
  [/daari maps/gi, 'Routes'],
  [/\bdaari\b/gi, 'Routes'],
  [/\bgumpu\b/gi, 'Family'],
  [/thoda break/gi, 'Short break'],
  [/namma net/gi, 'Mumbai Net'],
];
const ATTRS = ['aria-label', 'alt', 'title'];

function sweepNode(node) {
  if (node.__swept) return; // don't re-walk nodes we've already converted
  node.__swept = true;
  for (const [re, to] of RENAMES) {
    if (re.test(node.nodeValue)) node.nodeValue = node.nodeValue.replace(re, to);
  }
}

function sweep(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) sweepNode(n);
  for (const a of ATTRS) {
    for (const e of el.querySelectorAll(`[${a}]`)) {
      const v = e.getAttribute(a);
      if (v) for (const [re, to] of RENAMES) if (re.test(v)) e.setAttribute(a, v.replace(re, to));
    }
  }
}

export function initBranding() {
  const ui = document.getElementById('ui');
  if (!ui) return;

  const mo = new MutationObserver(() => {
    const load = ui.querySelector('.nu-loading');
    if (load) { dressLoading(load); startTips(load); assertTips(load); }
  });
  mo.observe(ui, { childList: true, subtree: true });

  // throttled text sweep: the HUD mutates text constantly (typewriter, meters),
  // so records are queued and flushed every 250 ms instead of per-mutation
  const pending = [];
  let tmoQueued = false;
  const flush = () => {
    tmoQueued = false;
    const batch = pending.splice(0);
    for (const m of batch) {
      if (m.type === 'characterData' && m.target.nodeValue) sweepNode(m.target);
      else if (m.type === 'attributes') sweepNode(m.target);
      else if (m.type === 'childList') {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 3) sweepNode(n);
          else if (n.nodeType === 1) sweep(n);
        });
      }
    }
  };
  const tmo = new MutationObserver((muts) => {
    pending.push(...muts);
    if (!tmoQueued) { tmoQueued = true; setTimeout(flush, 250); }
  });
  tmo.observe(ui, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  sweep(ui);
}
