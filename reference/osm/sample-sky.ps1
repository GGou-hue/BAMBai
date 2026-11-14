# sample pixels of the processed sky png
Add-Type -AssemblyName System.Drawing
$b = New-Object System.Drawing.Bitmap('C:\Users\User4\Downloads\BAMBai\art\sky\SKY-DAY-01.png')
foreach ($pt in @(@(100,20),@(1024,20),@(1900,20),@(1024,400),@(1024,480),@(1024,500),@(5,250),@(2042,250))) {
  $p = $b.GetPixel($pt[0], $pt[1])
  Write-Host "$($pt[0]),$($pt[1]) A=$($p.A) R=$($p.R) G=$($p.G) B=$($p.B)"
}
$b.Dispose()
