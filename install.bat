@echo off
title BulkSender - Installer
color 0A

echo.
echo  ============================================================
echo                BulkSender Installation Wizard
echo  ============================================================
echo.
echo   This installer will:
echo     [1] Check / install Node.js (if needed)
echo     [2] Install all required packages
echo     [3] Create a desktop shortcut with logo
echo     [4] Add to Start Menu
echo.
echo  ============================================================
echo.
pause
echo.

:: ─── Step 1: Check Node.js ───
echo  [1/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "delims=" %%i in ('node --version') do echo        Node.js %%i found.
    goto :install_packages
)

echo        Node.js NOT found. Attempting to install...
echo.

:: Try winget first (Windows 10/11)
winget --version >nul 2>&1
if %errorlevel% equ 0 (
    echo        Using Windows Package Manager...
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent
    if %errorlevel% equ 0 goto :node_installed
)

:: Fallback: direct download
echo        Downloading Node.js installer...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi' -OutFile '%TEMP%\node-installer.msi' -UseBasicParsing"
if not exist "%TEMP%\node-installer.msi" (
    echo  [ERROR] Failed to download Node.js. Please install manually from https://nodejs.org
    pause
    exit /b 1
)

echo        Installing Node.js (please wait, may take a few minutes)...
msiexec /i "%TEMP%\node-installer.msi" /quiet /norestart
del "%TEMP%\node-installer.msi" >nul 2>&1

:node_installed
:: Refresh PATH so node is recognized in this session
set "PATH=%PATH%;%ProgramFiles%\nodejs"
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js installation completed but not detected.
    echo         Please close this window and run install.bat again.
    pause
    exit /b 1
)
echo        Node.js installed successfully!
echo.

:install_packages
:: ─── Step 2: Install npm packages ───
echo  [2/4] Installing packages (may take 2-3 minutes)...
call npm install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo  [ERROR] Package installation failed.
    pause
    exit /b 1
)
echo        All packages installed.
echo.

:: ─── Step 3: Generate icon and create shortcuts ───
echo  [3/4] Creating logo and desktop shortcut...

if not exist "assets" mkdir assets
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\create-icon.ps1" "%~dp0assets\icon.ico"

if not exist "assets\icon.ico" (
    echo  [WARNING] Could not create icon. Continuing without logo.
)

if not exist "public\logo.png" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\create-png-logo.ps1" "%~dp0public\logo.png" 256
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\create-shortcuts.ps1"
echo        Desktop shortcut created.
echo.

:: ─── Step 4: Create .env if missing ───
echo  [4/4] Creating default configuration...
if not exist ".env" (
    (
        echo # BulkSender Configuration
        echo PORT=5000
        echo DELAY_MIN=10
        echo DELAY_MAX=25
        echo BATCH_SIZE=25
        echo BATCH_COOLDOWN=180
    ) > .env
)
echo        Configuration ready.
echo.

echo  ============================================================
echo                  Installation Complete!
echo  ============================================================
echo.
echo   Look for the BulkSender icon on your desktop.
echo   Double-click it to launch the app.
echo.
echo   The browser will open automatically at:
echo   http://localhost:5000
echo.
echo  ============================================================
echo.
pause
