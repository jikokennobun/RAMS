param([Parameter(Mandatory=$true)][ValidatePattern('^RAMS-Q\d{3}$')][string]$TaskId)
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $repoRoot
try {
    node scripts/check.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Ledger validation failed.' }
    node scripts/prepare-task.mjs $TaskId
    if ($LASTEXITCODE -ne 0) { throw 'Task preparation failed.' }
    $runDir = Join-Path $repoRoot "research/runs/$TaskId"
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
    $promptPath = Join-Path $runDir 'prompt.md'
    $reportPath = Join-Path $runDir "$stamp-final.md"
    $logPath = Join-Path $runDir "$stamp-events.jsonl"
    $oldEncoding = $OutputEncoding
    try {
        $OutputEncoding = [System.Text.UTF8Encoding]::new($false)
        Get-Content -LiteralPath $promptPath -Raw -Encoding UTF8 | codex exec --sandbox workspace-write --json --output-last-message $reportPath - | Tee-Object -FilePath $logPath
        if ($LASTEXITCODE -ne 0) { throw "Codex run failed. Inspect $logPath" }
    } finally { $OutputEncoding = $oldEncoding }
    Write-Output "Run finished: $reportPath. A separate mathematical audit is still required."
} finally { Pop-Location }
