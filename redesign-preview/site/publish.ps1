param(
  [Parameter(Mandatory = $true)]
  [string]$TargetRepo
)

$ErrorActionPreference = "Stop"

$sourceRoot = $PSScriptRoot
$targetRoot = (Resolve-Path $TargetRepo).Path

if (-not (Test-Path $targetRoot)) {
  throw "Target repo path does not exist: $TargetRepo"
}

$publicRootFiles = @(
  "index.html",
  "technology.html",
  "impact.html",
  "team.html",
  "contact.html",
  "CNAME"
)

Write-Host "Publishing public site files from $sourceRoot to $targetRoot"

foreach ($file in $publicRootFiles) {
  $sourceFile = Join-Path $sourceRoot $file
  if (-not (Test-Path $sourceFile)) {
    throw "Missing required public file: $sourceFile"
  }

  Copy-Item -Path $sourceFile -Destination (Join-Path $targetRoot $file) -Force
}

$assetsSource = Join-Path $sourceRoot "assets"
$assetsTarget = Join-Path $targetRoot "assets"

if (-not (Test-Path $assetsTarget)) {
  New-Item -ItemType Directory -Path $assetsTarget | Out-Null
}

$robocopyArgs = @(
  $assetsSource,
  $assetsTarget,
  "/MIR",
  "/R:2",
  "/W:1",
  "/NFL",
  "/NDL",
  "/NJH",
  "/NJS",
  "/NP",
  "/XF",
  "studio.css",
  "studio.js"
)

& robocopy @robocopyArgs | Out-Null
$robocopyExitCode = $LASTEXITCODE
if ($robocopyExitCode -ge 8) {
  throw "Robocopy failed with exit code $robocopyExitCode"
}

if (Test-Path (Join-Path $targetRoot "studio.html")) {
  Remove-Item -Path (Join-Path $targetRoot "studio.html") -Force
}

Write-Host "Publish staging complete."
Write-Host "Next steps:"
Write-Host "1. Review the staged changes in your GitHub Pages repo clone."
Write-Host "2. Commit and push to the Pages branch."
Write-Host "3. Confirm Settings > Pages still points at the expected repo and branch."
