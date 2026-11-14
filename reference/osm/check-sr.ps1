# quick check: does SAPI recognition work in this environment?
Add-Type -AssemblyName System.Speech
$e = New-Object System.Speech.Recognition.SpeechRecognitionEngine
Write-Output ("recognizer: " + $e.RecognizerInfo.Name + " culture " + $e.RecognizerInfo.Culture.Name)
$e.Dispose()
