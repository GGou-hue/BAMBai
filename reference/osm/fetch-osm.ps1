# Patient Overpass fetcher: retries each query across endpoints with backoff.
# Success = response starts with '{' and is > 1000 bytes.
$ErrorActionPreference = 'Continue'
$endpoints = @(
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
)
$jobs = @(
  @{ q = 'reference/osm/q1-highways-core.overpassql';  out = 'reference/osm/sm-highways.json' },
  @{ q = 'reference/osm/q2-green-water-rail.overpassql'; out = 'reference/osm/sm-green.json' },
  @{ q = 'reference/osm/q3-poi.overpassql';            out = 'reference/osm/sm-poi.json' },
  @{ q = 'reference/osm/q4-buildings.overpassql';      out = 'reference/osm/sm-buildings.json' }
)
$delay = 45
foreach ($j in $jobs) {
  if ((Test-Path $j.out) -and ((Get-Item $j.out).Length -gt 100000)) { Write-Output "SKIP $($j.out) exists"; continue }
  $done = $false; $attempt = 0
  while (-not $done -and $attempt -lt 40) {
    $ep = $endpoints[$attempt % $endpoints.Count]
    $attempt++
    Write-Output ("[{0}] attempt {1} -> {2} {3}" -f (Get-Date -Format HH:mm:ss), $attempt, $ep, $j.q)
    curl.exe -s -m 420 -A "BAMBai-migration/0.1" -X POST --data-urlencode "data@$($j.q)" $ep -o $j.out
    $len = 0; if (Test-Path $j.out) { $len = (Get-Item $j.out).Length }
    $first = ''; if ($len -gt 0) { $first = (Get-Content $j.out -TotalCount 1 -ErrorAction SilentlyContinue) }
    if ($len -gt 100000 -and $first.TrimStart().StartsWith('{')) { Write-Output "OK $($j.out) $len bytes"; $done = $true }
    else { Write-Output "fail size=$len; sleeping $delay"; Start-Sleep -Seconds $delay; $delay = [Math]::Min(180, $delay + 15) }
  }
  if (-not $done) { Write-Output "GAVE UP $($j.q)"; }
  $delay = 45
}
Write-Output 'ALL-DONE'
