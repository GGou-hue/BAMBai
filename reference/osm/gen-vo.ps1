# TTS-generate stale VO WAVs with Windows SAPI (System.Speech)
# usage: gen-vo.ps1 [-Lines vo-lines.json]
param($Lines = 'vo-lines.json')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech

$root = 'C:\Users\User4\Downloads\BAMBai'
$lines = Get-Content "$root\reference\osm\$Lines" -Raw | ConvertFrom-Json
$backup = "$root\reference\osm\vo-backup"
if (-not (Test-Path $backup)) { New-Item -ItemType Directory -Path $backup | Out-Null }

$syn = New-Object System.Speech.Synthesis.SpeechSynthesizer
Write-Output ("voices: " + (($syn.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }) -join ', '))
$syn.SelectVoice('Microsoft David Desktop')
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)

$done = 0
foreach ($l in $lines) {
  $dst = "$root\audio\street\$($l.file).wav"
  if (Test-Path $dst) { Copy-Item $dst "$backup\$($l.file).wav" -Force }
  $syn.Rate = [int]$l.rate
  $syn.SetOutputToWaveFile($dst, $fmt)
  $syn.Speak($l.text)
  $syn.SetOutputToNull()
  $done++
}
$syn.Dispose()
Write-Output "generated $done wavs from $Lines"
