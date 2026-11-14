# scan night shot horizon band
Add-Type -AssemblyName System.Drawing
$b = New-Object System.Drawing.Bitmap('C:\Users\User4\Downloads\BAMBai\shots\mum-sky-night2.png')
foreach ($y in @(280, 320, 360, 400)) {
  $line = "y=$y :"
  foreach ($x in @(100, 400, 640, 900, 1200)) {
    $p = $b.GetPixel($x, $y)
    $line += " $($p.R),$($p.G),$($p.B);"
  }
  Write-Host $line
}
$b.Dispose()
