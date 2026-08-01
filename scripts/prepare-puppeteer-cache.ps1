param(
    [string]$ProjectCache = ".puppeteer-cache"
)

$ErrorActionPreference = "Stop"

$projectCachePath = Resolve-Path -LiteralPath "." | ForEach-Object {
    Join-Path $_.Path $ProjectCache
}

function Test-ChromeCache($cachePath) {
    $chromeRoot = Join-Path $cachePath "chrome"
    if (-not (Test-Path $chromeRoot)) {
        return $false
    }

    $chromeExe = Get-ChildItem -Path $chromeRoot -Recurse -Filter "chrome.exe" -ErrorAction SilentlyContinue |
        Select-Object -First 1

    return $null -ne $chromeExe
}

if (Test-ChromeCache $projectCachePath) {
    Write-Host "Bundled Chromium cache already exists: $projectCachePath"
    exit 0
}

$userCache = Join-Path $env:USERPROFILE ".cache\puppeteer"
if (Test-ChromeCache $userCache) {
    Write-Host "Copying Chromium from user Puppeteer cache..."
    New-Item -Path $projectCachePath -ItemType Directory -Force | Out-Null
    Copy-Item -Path (Join-Path $userCache "chrome") -Destination $projectCachePath -Recurse -Force
    Write-Host "Chromium cache prepared: $projectCachePath"
    exit 0
}

Write-Host "Downloading Chromium for the Windows installer..."
& npx.cmd puppeteer browsers install chrome --path $projectCachePath
