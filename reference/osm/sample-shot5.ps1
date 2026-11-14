# scan day4 horizon band for pink
Add-Type -AssemblyName System.Drawing
$b = New-Object System.Drawing.Bitmap('C:\Users\User4\Downloads\BAMBai\shots\mum-sky-day4.png')
foreach ($y in @(280, 300, 320, 340, 360, 380, 400)) {
  $line = "y=$y :"
  foreach ($x in @(100, 400, 640, 900, 1200)) {
    $p = $b.GetPixel($x, $y)
    $line += " $($p.R),$($p.G),$($p.B);"
  }
  Write-Host $line
}
$b.Dispose()
