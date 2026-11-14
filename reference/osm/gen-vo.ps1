// TTS-generate the 37 stale VO WAVs with Windows SAPI (System.Speech)
// reads reference/osm/vo-lines.json; backs up originals to reference/osm/vo-backup/
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech

$root = 'C:\Users\User4\Downloads\BAMBai'
$lines = Get-Content "$root\reference\osm\vo-lines.json" -Raw | ConvertFrom-Json
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
Write-Output "generated $done wavs"
