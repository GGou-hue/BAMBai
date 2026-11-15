Set-Location "C:\Users\User4\Downloads\BAMBai"
$env:PROBE_URL = 'http://localhost:5174/'
foreach ($w in 'aarav', 'naina', 'arjun') {
  Write-Output "=== sweep $w start $(Get-Date -Format HH:mm:ss) ==="
  $env:WHO = $w
  $env:SHOT = "s8-act1-cliffhanger-$w"
  node reference/story/probe-s8.cjs
  Write-Output "=== sweep $w exit=$LASTEXITCODE $(Get-Date -Format HH:mm:ss) ==="
}
Write-Output 'ALL SWEEPS DONE'
