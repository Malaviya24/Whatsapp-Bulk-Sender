@echo off
title BulkSender
color 0A

:: Quick launcher (visible console for debugging)
:: For silent launch, use the desktop shortcut

if not exist "node_modules" (
    echo  [!] Packages not installed. Running installer first...
    call install.bat
    exit /b
)

echo.
echo  ============================================================
echo                BulkSender - Starting Server
echo  ============================================================
echo   Open: http://localhost:5000
echo   Press Ctrl+C to stop the server
echo  ============================================================
echo.

:: Open browser after 3 seconds
start "" /B cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5000"

node server.js
pause
