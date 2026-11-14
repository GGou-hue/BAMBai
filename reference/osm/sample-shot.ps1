# sample the horizon band colors in the screenshot
Add-Type -AssemblyName System.Drawing
$b = New-Object System.Drawing.Bitmap('C:\Users\User4\Downloads\BAMBai\shots\mum-sky-day2.png')
Write-Host "size $($b.Width) x $($b.Height)"
foreach ($y in @(180, 200, 220, 240, 260, 280, 300, 320, 340)) {
  $p = $b.GetPixel(640, $y)
  Write-Host "y=$y A=$($p.A) R=$($p.R) G=$($p.G) B=$($p.B)"
}
$b.Dispose()
