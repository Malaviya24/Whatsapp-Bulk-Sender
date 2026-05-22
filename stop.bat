@echo off
title BulkSender - Stop
color 0C

echo.
echo  Stopping BulkSender...
echo.

:: Kill all node.exe processes (server)
taskkill /F /IM node.exe >nul 2>&1

:: Kill any leftover Chrome processes from puppeteer
:: (Only kills the specific Chromium instances spawned by node)
for /f "tokens=2 delims=," %%P in ('tasklist /FI "IMAGENAME eq chrome.exe" /FO CSV /NH ^| findstr /i "wwebjs"') do taskkill /F /PID %%~P >nul 2>&1

echo  BulkSender stopped successfully.
echo.
timeout /t 2 /nobreak >nul
exit
