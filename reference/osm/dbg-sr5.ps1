# probe: single-word variants on the delhi controls
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

$tests = @('vo-tmp-old\delhi-2.wav','vo-tmp-old\delhi-3.wav','vo-tmp-old\tamil-3.wav','vo-tmp-old\radio-2-1.wav','vo-tmp-old\radio-9-1.wav','vo-tmp-old\whitefield-1.wav','vo-tmp-old\whitefield-2.wav','vo-tmp\delhi-2.wav','vo-tmp\delhi-3.wav')
foreach ($c in $tests) {
  $p = Join-Path $root $c
  if (-not (Test-Path $p)) { Write-Output "$c missing"; continue }
  $e.SetInputToWaveFile($p)
  $r = $e.Recognize()
  if ($r) { Write-Output ("  {0} -> [{1}] conf {2:0.00}" -f $c, $r.Text, $r.Confidence) }
  else { Write-Output ("  {0} -> null" -f $c) }
}
$e.Dispose()
