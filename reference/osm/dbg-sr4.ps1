# controls with vo-kws-style config, proper Choices grammar, no recognizer setting changes
Add-Type -AssemblyName System.Speech
$root = 'C:\Users\User4\Downloads\BAMBai\reference\osm'
$e = New-Object System.Speech.Recognition.SpeechRecognitionEngine
$words = @('koramangala','silk board','kempu','whitefield','marathahalli','hebbal','hosur','kannada','darshini','bengaluru','bangalore','madiwala','eighty feet','sarjapur','hale haadu','outer ring')
$choices = New-Object System.Speech.Recognition.Choices
$choices.Add([string[]]$words)
$gb = New-Object System.Speech.Recognition.GrammarBuilder
$gb.Append($choices)
$e.LoadGrammar((New-Object System.Speech.Recognition.Grammar($gb)))
$e.BabbleTimeout = 0
$e.EndSilenceTimeout = [TimeSpan]::FromSeconds(0.2)

$controls = @('vo-tmp-old\delhi-3.wav','vo-tmp-old\radio-1-1.wav','vo-tmp-old\radio-5-1.wav','vo-tmp\goon-1-1.wav','vo-tmp\cop-2-1.wav','vo-tmp\arjun-effort-1.wav')
foreach ($c in $controls) {
  $p = Join-Path $root $c
  $e.SetInputToWaveFile($p)
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $r = $e.Recognize()
  $sw.Stop()
  if ($r) { Write-Output ("  {0} -> [{1}] conf {2:0.00} ({3:0.1}s)" -f $c, $r.Text, $r.Confidence, $sw.Elapsed.TotalSeconds) }
  else { Write-Output ("  {0} -> null ({1:0.1}s)" -f $c, $sw.Elapsed.TotalSeconds) }
}
$e.Dispose()
