# scan night/dusk PNGs for un-keyed dark pink pixels
Add-Type -AssemblyName System.Drawing
foreach ($f in @('SKY-NIGHT-01.png','SKY-DUSK-01.png')) {
  $b = New-Object System.Drawing.Bitmap("C:\Users\User4\Downloads\BAMBai\art\sky\$f")
  $count = 0; $samples = @()
  for ($y = 0; $y -lt 504; $y += 3) {
    for ($x = 0; $x -lt 2048; $x += 3) {
      $p = $b.GetPixel($x, $y)
      if ($p.A -gt 100 -and ($p.R - $p.G) -gt 50 -and ($p.B - $p.G) -gt 10 -and $p.R -gt 60) {
        $count++
        if ($samples.Count -lt 5) { $samples += "x=$x y=$y A=$($p.A) $($p.R),$($p.G),$($p.B)" }
      }
    }
  }
  Write-Host "$f : $count dark-pink opaque samples"
  $samples | ForEach-Object { Write-Host "  $_" }
  $b.Dispose()
}
