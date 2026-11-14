# scan SKY-DAY-01.png for surviving pink/magenta opaque pixels
Add-Type -AssemblyName System.Drawing
$b = New-Object System.Drawing.Bitmap('C:\Users\User4\Downloads\BAMBai\art\sky\SKY-DAY-01.png')
$counts = @{}
for ($y = 0; $y -lt 504; $y += 4) {
  for ($x = 0; $x -lt 2048; $x += 4) {
    $p = $b.GetPixel($x, $y)
    if ($p.A -gt 100 -and $p.R -gt 180 -and $p.G -lt 110 -and $p.B -lt 170) {
      $band = [int]([math]::Floor($y / 63))
      if (-not $counts.ContainsKey($band)) { $counts[$band] = 0 }
      $counts[$band] = 1 + $counts[$band]
    }
  }
}
Write-Host "pink opaque pixels by 63px row band:"
$counts.GetEnumerator() | Sort-Object {[int]$_.Key} | ForEach-Object { Write-Host "band $($_.Key) (y $($_.Key*63)-$($_.Key*63+62)): $($_.Value)" }
# sample a few
$n = 0
for ($y = 0; $y -lt 504 -and $n -lt 8; $y += 2) {
  for ($x = 0; $x -lt 2048 -and $n -lt 8; $x += 2) {
    $p = $b.GetPixel($x, $y)
    if ($p.A -gt 100 -and $p.R -gt 180 -and $p.G -lt 110 -and $p.B -lt 170) {
      Write-Host "x=$x y=$y A=$($p.A) $($p.R),$($p.G),$($p.B)"
      $n++
    }
  }
}
$b.Dispose()
