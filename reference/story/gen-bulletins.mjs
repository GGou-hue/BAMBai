// S6: generate Act I bulletin VO (SAPI TTS -> ffmpeg radio filter -> vo/<slug>.mp3)
// slug recipe replicated exactly from vendor/audio.js: u(lineId) + '-' + d(text)
import fs from 'fs';
import { execSync } from 'child_process';

const root = 'C:/Users/User4/Downloads/BAMBai';
const bulletins = JSON.parse(fs.readFileSync(`${root}/story/radio/bulletins-act1.json`, 'utf8'));

// u: NFKD -> strip combining marks -> lowercase -> non-alnum to '-' -> trim '-'
const u = (e) => e.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'line';
// d: fnv1a-32 -> base36 -> pad 7 -> last 6
const d = (e) => { let t = 2166136261; for (let n = 0; n < e.length; n++) { t ^= e.charCodeAt(n); t = Math.imul(t, 16777619) >>> 0; } return t.toString(36).padStart(7, '0').slice(-6); };
const slug = (id, text) => `${u(id)}-${d(text.trim())}`;

fs.mkdirSync(`${root}/vo`, { recursive: true });
const indexPath = `${root}/vo/index.json`;
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const have = new Set(index);
const made = [];

for (const b of bulletins.bulletins) {
  for (const line of b.lines) {
    const id = slug(line.lineId, line.textOriginal);
    if (have.has(id)) { console.log('skip (exists):', id); continue; }
    const tmp = `${root}/reference/story/tmp-bul.wav`;
    const ps = `
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
$syn = New-Object System.Speech.Synthesis.SpeechSynthesizer
$syn.SelectVoice('Microsoft David Desktop')
$syn.Rate = -1
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050,[System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,[System.Speech.AudioFormat.AudioChannel]::Mono)
$syn.SetOutputToWaveFile('${tmp}',$fmt)
$syn.Speak('${line.textOriginal.replace(/'/g, "''").replace(/"/g, '')}')
$syn.SetOutputToNull()
$syn.Dispose()
`;
    fs.writeFileSync(`${root}/reference/story/tmp-bul.ps1`, ps, 'utf8');
    execSync(`powershell -ExecutionPolicy Bypass -File ${root}/reference/story/tmp-bul.ps1`, { stdio: 'pipe' });
    // broadcast filter: bandpass + crunch + longer slap echo -> pirate radio from the Mother Tower
    execSync(`ffmpeg -y -i ${tmp} -af "highpass=f=300,lowpass=f=3000,acrusher=level_in=2:level_out=0.9:aa=0.5:bits=10:mode=log:mix=0.45,aecho=0.6:0.28:70:0.25" -codec:a libmp3lame -q:a 4 "${root}/vo/${id}.mp3"`, { stdio: 'pipe' });
    fs.unlinkSync(tmp);
    fs.unlinkSync(`${root}/reference/story/tmp-bul.ps1`);
    made.push(id);
    console.log('made:', id);
  }
}

if (made.length) {
  fs.writeFileSync(indexPath, JSON.stringify([...index, ...made], null, 1));
  console.log('index.json updated:', made.length, 'new ids');
}
console.log('total vo ids:', index.length + made.length);
