@echo off
title BulkSender - Package for Sharing
color 0E

echo.
echo  ============================================================
echo           Creating shareable BulkSender package...
echo  ============================================================
echo.

set "OUTPUT=BulkSender-Share.zip"

:: Delete old zip if exists
if exist "%OUTPUT%" del "%OUTPUT%"

echo  Compressing files (excluding node_modules, sessions, logs)...

powershell -NoProfile -Command "Compress-Archive -Path @('install.bat','BulkSender.vbs','run.bat','stop.bat','uninstall.bat','package-for-share.bat','server.js','package.json','package-lock.json','.env.example','.gitignore','README.md','LICENSE','CONTRIBUTING.md','CHANGELOG.md','SECURITY.md','sample_message.txt','sample_numbers.txt','assets','public','scripts','screenshots') -DestinationPath '%OUTPUT%' -Force"

if exist "%OUTPUT%" (
    echo.
    echo  ============================================================
    echo                  Package Created Successfully!
    echo  ============================================================
    echo.
    echo   File: %OUTPUT%
    for %%A in (%OUTPUT%) do echo   Size: %%~zA bytes
    echo.
    echo   Share this file with anyone. They just need to:
    echo     1. Extract the zip
    echo     2. Double-click install.bat
    echo     3. Done!
    echo.
    echo  ============================================================
) else (
    echo.
    echo  [ERROR] Failed to create zip file.
)
echo.
pause
