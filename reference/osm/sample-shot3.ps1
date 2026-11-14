# scan horizon band for magenta
Add-Type -AssemblyName System.Drawing
$b = New-Object System.Drawing.Bitmap('C:\Users\User4\Downloads\BAMBai\shots\mum-sky-day3.png')
Write-Host "size $($b.Width) x $($b.Height)"
foreach ($y in @(120, 160, 200, 240, 280, 320, 360, 400)) {
  $line = "y=$y :"
  foreach ($x in @(100, 400, 640, 900, 1200)) {
    $p = $b.GetPixel($x, $y)
    $line += " x$x=$($p.R),$($p.G),$($p.B);"
  }
  Write-Host $line
}
$b.Dispose()
