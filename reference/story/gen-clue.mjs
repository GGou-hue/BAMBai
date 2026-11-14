// S1: generate the Ch1 distorted audio clue (SAPI TTS -> ffmpeg radio filter -> vo/*.mp3)
// Usage: node reference/story/gen-clue.mjs
import fs from 'fs';
import { execSync } from 'child_process';

const root = 'C:/Users/User4/Downloads/BAMBai';
const tmp = `${root}/reference/story/tmp-clue.wav`;
const out = `${root}/vo/ch1-clue-retibandar.mp3`;
fs.mkdirSync(`${root}/vo`, { recursive: true });

const ps = `
\$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
\$syn = New-Object System.Speech.Synthesis.SpeechSynthesizer
\$syn.SelectVoice('Microsoft David Desktop')
\$syn.Rate = -2
\$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050,[System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,[System.Speech.AudioFormat.AudioChannel]::Mono)
\$syn.SetOutputToWaveFile('${tmp}',\$fmt)
\$syn.Speak('Retibandar. Pegs hatao. Leela ke paas. Bolo pehle. Please.')
\$syn.SetOutputToNull()
\$syn.Dispose()
`;
fs.writeFileSync(`${root}/reference/story/tmp-clue.ps1`, ps, 'utf8');
execSync(`powershell -ExecutionPolicy Bypass -File ${root}/reference/story/tmp-clue.ps1`, { stdio: 'inherit' });

// radio-filter: bandpass + crunch + short slap echo -> old handset / pirate broadcast
execSync(`ffmpeg -y -i ${tmp} -af "highpass=f=350,lowpass=f=2700,acrusher=level_in=2.5:level_out=0.9:aa=0.6:bits=9:mode=log:mix=0.55,aecho=0.5:0.25:60:0.22" -codec:a libmp3lame -q:a 4 ${out}`, { stdio: 'inherit' });
fs.unlinkSync(tmp);
fs.unlinkSync(`${root}/reference/story/tmp-clue.ps1`);

const index = `${root}/vo/index.json`;
let ids = [];
if (fs.existsSync(index)) ids = JSON.parse(fs.readFileSync(index, 'utf8'));
if (!ids.includes('ch1-clue-retibandar')) ids.push('ch1-clue-retibandar');
fs.writeFileSync(index, JSON.stringify(ids, null, 1));
console.log('clue clip written:', out, '| vo/index.json ids:', ids.length);
