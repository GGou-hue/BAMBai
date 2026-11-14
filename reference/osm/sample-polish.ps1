Add-Type -AssemblyName System.Drawing
$b=[System.Drawing.Bitmap]::FromFile('C:\Users\User4\Downloads\BAMBai\shots\sky-day-polish.png')
foreach($y in 300,320,340,360){
  $r=0;$g=0;$bl=0;$n=0
  for($x=200; $x -lt 1000; $x+=20){ $c=$b.GetPixel($x,$y); $r+=$c.R;$g+=$c.G;$bl+=$c.B;$n++ }
  $ri=[int]($r/$n); $gi=[int]($g/$n); $bi=[int]($bl/$n)
  Write-Output ("y={0} avg rgb {1},{2},{3}" -f $y,$ri,$gi,$bi)
}
$pink=0
for($y=250; $y -lt 450; $y+=4){
  for($x=0; $x -lt $b.Width; $x+=8){
    $c=$b.GetPixel($x,$y)
    if($c.R -gt 140 -and ($c.R-$c.G) -gt 60 -and ($c.B-$c.G) -gt 15){$pink++}
  }
}
Write-Output ("pink samples: {0}" -f $pink)
$b.Dispose()
