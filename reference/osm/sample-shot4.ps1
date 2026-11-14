# dense scan around y=340-380 for the pink band
Add-Type -AssemblyName System.Drawing
$b = New-Object System.Drawing.Bitmap('C:\Users\User4\Downloads\BAMBai\shots\mum-sky-day3.png')
foreach ($y in @(330, 340, 350, 355, 360, 365, 370, 375, 380, 390)) {
  $line = "y=$y :"
  foreach ($x in @(20, 150, 300, 500, 700, 950, 1150, 1260)) {
    $p = $b.GetPixel($x, $y)
    $line += " $($p.R),$($p.G),$($p.B);"
  }
  Write-Host $line
}
$b.Dispose()
