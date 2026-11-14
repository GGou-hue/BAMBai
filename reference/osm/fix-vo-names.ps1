# move generated radio-N.wav / goon-11.wav onto the manifest's -1-suffixed names,
# backing up the stale originals first
$root = 'C:\Users\User4\Downloads\BAMBai'
$backup = "$root\reference\osm\vo-backup"
New-Item -ItemType Directory -Path $backup -Force | Out-Null
$moves = @()
1..10 | ForEach-Object { $moves += "radio-$_" }
$moves += 'goon-11'
foreach ($n in $moves) {
  $real = "$root\audio\street\$n-1.wav"
  $gen  = "$root\audio\street\$n.wav"
  if (Test-Path $real) { Copy-Item $real "$backup\$n-1.wav" -Force }
  if (Test-Path $gen)  { Move-Item $gen $real -Force }
  Write-Output ("{0}: gen -> {1}" -f $n, (Test-Path $real))
}
