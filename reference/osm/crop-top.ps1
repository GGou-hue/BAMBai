# crop the top band of the day screenshot (where the skyline ring should be)
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile('C:\Users\User4\Downloads\BAMBai\shots\mum-sky-day2.png')
$rect = New-Object System.Drawing.Rectangle(0, 0, 1280, 200)
$crop = $src.Clone($rect, $src.PixelFormat)
$big = New-Object System.Drawing.Bitmap(2560, 400)
$g = [System.Drawing.Graphics]::FromImage($big)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.DrawImage($crop, 0, 0, 2560, 400)
$g.Dispose()
$big.Save('C:\Users\User4\Downloads\BAMBai\shots\sky-top-crop.png', [System.Drawing.Imaging.ImageFormat]::Png)
$big.Dispose(); $crop.Dispose(); $src.Dispose()
Write-Host "saved shots/sky-top-crop.png"
