Add-Type -AssemblyName System.Speech
$e = New-Object System.Speech.Recognition.SpeechRecognitionEngine
$words = @('stop','vehicle','station','koramangala')
$choices = New-Object System.Speech.Recognition.Choices
$choices.Add([string[]]$words)
$gb = New-Object System.Speech.Recognition.GrammarBuilder
$gb.Append($choices, [System.Speech.Recognition.SubsetMatchingMode]::Subsequence)
$g = New-Object System.Speech.Recognition.Grammar($gb)
$e.LoadGrammar($g)
$e.SetInputToWaveFile('C:\Users\User4\Downloads\BAMBai\reference\osm\vo-tmp\cop-2-1.wav')
$r = $e.Recognize()
Write-Output ("type: " + $r.GetType().FullName)
Write-Output ("text: [" + $r.Text + "]")
Write-Output ("conf: " + $r.Confidence)
foreach ($alt in $r.Alternates(3)) { Write-Output ("alt: [" + $alt.Text + "] " + $alt.Confidence) }
$e.Dispose()
