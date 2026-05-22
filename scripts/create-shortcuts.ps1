# Create desktop shortcut and start menu entry
param([string]$AppPath = "")

# Default to script's parent dir if no path given
if ([string]::IsNullOrWhiteSpace($AppPath)) {
    $AppPath = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
}

$AppPath = $AppPath.TrimEnd('\')
$launcher = Join-Path $AppPath "BulkSender.vbs"
$icon = Join-Path $AppPath "assets\icon.ico"

$shell = New-Object -ComObject WScript.Shell

# 1. Desktop shortcut
$desktop = [Environment]::GetFolderPath("Desktop")
$desktopLink = Join-Path $desktop "BulkSender.lnk"

$shortcut = $shell.CreateShortcut($desktopLink)
$shortcut.TargetPath = $launcher
$shortcut.WorkingDirectory = $AppPath
$shortcut.Description = "BulkSender - WhatsApp Bulk Messenger"
if (Test-Path $icon) { $shortcut.IconLocation = $icon }
$shortcut.Save()

# 2. Start Menu shortcut
$startMenu = Join-Path ([Environment]::GetFolderPath("StartMenu")) "Programs\BulkSender"
if (-not (Test-Path $startMenu)) {
    New-Item -Path $startMenu -ItemType Directory -Force | Out-Null
}

$startLink = Join-Path $startMenu "BulkSender.lnk"
$shortcut2 = $shell.CreateShortcut($startLink)
$shortcut2.TargetPath = $launcher
$shortcut2.WorkingDirectory = $AppPath
$shortcut2.Description = "BulkSender - WhatsApp Bulk Messenger"
if (Test-Path $icon) { $shortcut2.IconLocation = $icon }
$shortcut2.Save()

# Stop shortcut
$stopLink = Join-Path $startMenu "Stop BulkSender.lnk"
$stop = $shell.CreateShortcut($stopLink)
$stop.TargetPath = Join-Path $AppPath "stop.bat"
$stop.WorkingDirectory = $AppPath
$stop.Description = "Stop BulkSender server"
$stop.Save()

# Uninstall shortcut
$uninstallLink = Join-Path $startMenu "Uninstall BulkSender.lnk"
$uninstall = $shell.CreateShortcut($uninstallLink)
$uninstall.TargetPath = Join-Path $AppPath "uninstall.bat"
$uninstall.WorkingDirectory = $AppPath
$uninstall.Description = "Uninstall BulkSender"
$uninstall.Save()

Write-Host "Shortcuts created successfully."
Write-Host "  Desktop: $desktopLink"
Write-Host "  Start Menu: $startLink"
