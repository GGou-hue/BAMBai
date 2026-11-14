# keyword-spot suspect Bangalore/Kannada words across all street VO clips
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech

$root = 'C:\Users\User4\Downloads\BAMBai'
$tmp = "$root\reference\osm\vo-tmp"
$words = @(
  'koramangala','silk board','kempu','whitefield','marathahalli','hebbal','hosur',
  'eighty feet','madiwala','sarjapur','bengaluru','bangalore','kannada','darshini',
  'benne','kaapi','majestic','indiranagar','jayanagar','malleshwaram','basavanagudi',
  'cubbon','lalbagh','vidhana soudha','electronic city','outer ring','hale haadu',
  'santhe','pete','vidaranya','kadlekai','mysore',' Silk Board','Koramangala'
) | ForEach-Object { $_.ToLower().Trim() } | Select-Object -Unique

$choices = New-Object System.Speech.Recognition.Choices
$choices.Add([string[]]$words)
$gb = New-Object System.Speech.Recognition.GrammarBuilder
$gb.Append($choices, [System.Speech.Recognition.SubsetMatchingMode]::Subsequence)
$g = New-Object System.Speech.Recognition.Grammar($gb)

$e = New-Object System.Speech.Recognition.SpeechRecognitionEngine
$e.LoadGrammar($g)
$e.BabbleTimeout = 0
$e.EndSilenceTimeout = [TimeSpan]::FromSeconds(0.2)

$hits = New-Object System.Collections.ArrayList
$files = Get-ChildItem $tmp -Filter *.wav | Sort-Object Name
$i = 0
foreach ($f in $files) {
  $i++
  try {
    $e.SetInputToWaveFile($f.FullName)
    $r = $e.Recognize()
    while ($r -ne $null) {
      if ($r.Confidence -gt 0.5) {
        $txt = $r.Text.ToLower()
        $w = $r.Text
        [void]$hits.Add(("{0}`t{1:0.00}`t{2}" -f $f.Name, $r.Confidence, $w))
      }
      $r = $e.Recognize()
    }
  } catch {
    [void]$hits.Add(("{0}`tERR`t{1}" -f $f.Name, $_.Exception.Message))
  }
  if ($i % 50 -eq 0) { Write-Output "... $i / $($files.Count)" }
}
$e.Dispose()
$hits | Set-Content "$root\reference\osm\vo-kws.txt"
Write-Output ("done; hits: " + $hits.Count)

