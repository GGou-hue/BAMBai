# calibrate CFGConfidenceRejectionThreshold using known positive/negative controls
Add-Type -AssemblyName System.Speech
$root = 'C:\Users\User4\Downloads\BAMBai\reference\osm'
$e = New-Object System.Speech.Recognition.SpeechRecognitionEngine
$words = @('koramangala','silk board','kempu','whitefield','marathahalli','hebbal','hosur','kannada','darshini','bengaluru','bangalore','madiwala','eighty feet','sarjapur','hale haadu','outer ring')
$choices = New-Object System.Speech.Recognition.Choices
$choices.Add([string[]]$words)
$gb = New-Object System.Speech.Recognition.GrammarBuilder
$gb.Append($choices)
$e.BabbleTimeout = [TimeSpan]::FromSeconds(0)
$e.LoadGrammar((New-Object System.Speech.Recognition.Grammar($gb)))

$controls = @(
  @{ f = 'vo-backup\delhi-3.wav';    want = 'HIT (silk board)' },
  @{ f = 'vo-backup\radio-1-1.wav';  want = 'HIT (koramangala)' },
  @{ f = 'vo-backup\radio-5-1.wav';  want = 'HIT (koramangala)' },
  @{ f = 'vo-tmp\goon-1-1.wav';      want = 'MISS (generic)' },
  @{ f = 'vo-tmp\cop-2-1.wav';       want = 'MISS (generic)' },
  @{ f = 'vo-tmp\arjun-effort-1.wav'; want = 'MISS (grunt)' }
)
foreach ($thr in 60, 70, 80, 90) {
  try { $e.UpdateRecognizerSetting('CFGConfidenceRejectionThreshold', $thr) } catch { Write-Output "setting failed at $thr"; break }
  Write-Output "--- threshold $thr"
  foreach ($c in $controls) {
    $p = Join-Path $root $c.f
    $e.SetInputToWaveFile($p)
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $r = $e.Recognize()
    $sw.Stop()
    if ($r) { Write-Output ("  {0} -> [{1}] conf {2:0.00}" -f $c.f, $r.Text, $r.Confidence) }
    else { Write-Output ("  {0} -> null ({1:0.1}s)" -f $c.f, $sw.Elapsed.TotalSeconds) }
  }
}
$e.Dispose()

