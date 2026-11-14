# scan the horizon band across x
Add-Type -AssemblyName System.Drawing
$b = New-Object System.Drawing.Bitmap('C:\Users\User4\Downloads\BAMBai\shots\mum-sky-day2.png')
foreach ($x in @(50, 200, 400, 640, 900, 1100, 1230)) {
  $line = "x=$x :"
  foreach ($y in @(200, 240, 280, 320)) {
    $p = $b.GetPixel($x, $y)
    $line += " y$y=$($p.R),$($p.G),$($p.B);"
  }
  Write-Host $line
}
$b.Dispose()
