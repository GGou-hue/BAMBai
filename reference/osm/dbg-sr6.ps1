# control test with segment loop (Recognize until stream end)
Add-Type -AssemblyName System.Speech
$root = 'C:\Users\User4\Downloads\BAMBai\reference\osm'
$e = New-Object System.Speech.Recognition.SpeechRecognitionEngine
$words = @('koramangala','silk','silkboard','board','kempu','whitefield','marathahalli','hebbal','hosur','kannada','darshini','bengaluru','bangalore','madiwala','sarjapur','hale','haadu','outer','ring','eighty')
$choices = New-Object System.Speech.Recognition.Choices
$choices.Add([string[]]$words)
$gb = New-Object System.Speech.Recognition.GrammarBuilder
$gb.Append($choices)
$e.LoadGrammar((New-Object System.Speech.Recognition.Grammar($gb)))
$e.BabbleTimeout = 0
$e.EndSilenceTimeout = [TimeSpan]::FromSeconds(0.2)

$tests = @('vo-tmp-old\delhi-2.wav','vo-tmp-old\delhi-3.wav','vo-tmp-old\radio-9-1.wav','vo-tmp-old\whitefield-1.wav','vo-tmp-old\whitefield-2.wav','vo-tmp\goon-1-1.wav','vo-tmp\cop-2-1.wav','vo-tmp\driver-5-1.wav')
foreach ($c in $tests) {
  $p = Join-Path $root $c
  $e.SetInputToWaveFile($p)
  $found = @()
  for ($k = 0; $k -lt 30; $k++) {
    try { $r = $e.Recognize() } catch { break }
    if (-not $r) { break }
    $found += ("[{0}] {1:0.00}" -f $r.Text, $r.Confidence)
  }
  if ($found.Count) { Write-Output ("  {0} -> {1}" -f $c, ($found -join ' ')) }
  else { Write-Output ("  {0} -> null" -f $c) }
}
$e.Dispose()
