# verify generated WAVs: header, format, duration
$files = Get-ChildItem 'C:\Users\User4\Downloads\BAMBai\reference\osm\vo-lines.json' | Out-Null
$lines = Get-Content 'C:\Users\User4\Downloads\BAMBai\reference\osm\vo-lines.json' -Raw | ConvertFrom-Json
$bad = 0
foreach ($l in $lines) {
  $p = "C:\Users\User4\Downloads\BAMBai\audio\street\$($l.file).wav"
  $b = [System.IO.File]::ReadAllBytes($p)
  $riff = [System.Text.Encoding]::ASCII.GetString($b, 0, 4)
  $fmt = [BitConverter]::ToUInt16($b, 20)
  $ch = [BitConverter]::ToUInt16($b, 22)
  $rate = [BitConverter]::ToUInt32($b, 24)
  $bits = [BitConverter]::ToUInt16($b, 34)
  $dataIdx = [System.Text.Encoding]::ASCII.GetString($b).IndexOf('data')
  $dur = [Math]::Round(($b.Length - $dataIdx - 8) / ($rate * $ch * $bits / 8), 1)
  $ok = ($riff -eq 'RIFF') -and ($fmt -eq 1) -and ($ch -eq 1) -and ($bits -eq 16)
  if (-not $ok) { $bad++; Write-Output ("BAD {0}: riff={1} fmt={2} ch={3} bits={4}" -f $l.file, $riff, $fmt, $ch, $bits) }
  Write-Output ("{0,-26} {1,6:0.0}s  {2,8} bytes" -f $l.file, $dur, $b.Length)
}
Write-Output ("bad: {0} of {1}" -f $bad, $lines.Count)
