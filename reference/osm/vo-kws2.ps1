# full keyword sweep with the FIXED grammar, segment loop, over all street clips
Add-Type -AssemblyName System.Speech
$root = 'C:\Users\User4\Downloads\BAMBai'
$e = New-Object System.Speech.Recognition.SpeechRecognitionEngine
$words = @('koramangala','kempu','whitefield','marathahalli','hebbal','hosur','kannada','darshini','bengaluru','bangalore','madiwala','sarjapur','silk','indiranagar','jayanagar','majestic','vidhana','lalbagh','cubbon','mysore','benne','kaapi')
$choices = New-Object System.Speech.Recognition.Choices
$choices.Add([string[]]$words)
$gb = New-Object System.Speech.Recognition.GrammarBuilder
$gb.Append($choices)
$e.LoadGrammar((New-Object System.Speech.Recognition.Grammar($gb)))
$e.BabbleTimeout = 0
$e.EndSilenceTimeout = [TimeSpan]::FromSeconds(0.2)

$hits = New-Object System.Collections.ArrayList
$files = Get-ChildItem "$root\reference\osm\vo-tmp" -Filter *.wav | Sort-Object Name
$i = 0
foreach ($f in $files) {
  $i++
  $e.SetInputToWaveFile($f.FullName)
  for ($k = 0; $k -lt 40; $k++) {
    try { $r = $e.Recognize() } catch { break }
    if (-not $r) { break }
    if ($r.Confidence -ge 0.75) {
      [void]$hits.Add(("{0}`t{1:0.00}`t{2}" -f $f.Name, $r.Confidence, $r.Text))
    }
  }
  if ($i % 60 -eq 0) { Write-Output "... $i / $($files.Count)" }
}
$e.Dispose()
$hits | Set-Content "$root\reference\osm\vo-kws2.txt"
Write-Output ("done; hits>=0.75: " + $hits.Count)
