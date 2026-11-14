# control test: real keyword spotting with dictation filler
Add-Type -AssemblyName System.Speech
$e = New-Object System.Speech.Recognition.SpeechRecognitionEngine
$words = @('koramangala','silk board','kempu','whitefield','marathahalli','hebbal','hosur','kannada','darshini','bengaluru','bangalore')
$choices = New-Object System.Speech.Recognition.Choices
$choices.Add([string[]]$words)

# grammar A: keyword followed by anything
$gbA = New-Object System.Speech.Recognition.GrammarBuilder
$gbA.Append($choices)
$gbA.AppendDictation()
# grammar B: anything followed by keyword
$gbB = New-Object System.Speech.Recognition.GrammarBuilder
$gbB.AppendDictation()
$gbB.Append($choices)

$e.LoadGrammar((New-Object System.Speech.Recognition.Grammar($gbA)))
$e.LoadGrammar((New-Object System.Speech.Recognition.Grammar($gbB)))
$e.BabbleTimeout = [TimeSpan]::FromSeconds(1)
$e.EndSilenceTimeout = [TimeSpan]::FromSeconds(0.3)

$tests = @('vo-backup\delhi-3.wav','vo-backup\radio-1-1.wav','vo-backup\goon-1.wav','vo-tmp\goon-1-1.wav')
foreach ($t in $tests) {
  $p = "C:\Users\User4\Downloads\BAMBai\reference\osm\$t"
  if (-not (Test-Path $p)) { Write-Output "$t MISSING"; continue }
  $e.SetInputToWaveFile($p)
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $r = $e.Recognize()
  $sw.Stop()
  if ($r) { Write-Output ("{0} -> [{1}] conf {2:0.00} ({3:0.0}s)" -f $t, $r.Text, $r.Confidence, $sw.Elapsed.TotalSeconds) }
  else { Write-Output ("{0} -> no match ({1:0.0}s)" -f $t, $sw.Elapsed.TotalSeconds) }
}
$e.Dispose()
