@echo off
title BulkSender - Uninstaller
color 0C

echo.
echo  ============================================================
echo                BulkSender Uninstaller
echo  ============================================================
echo.
echo   This will:
echo     [1] Stop any running BulkSender server
echo     [2] Remove desktop shortcut
echo     [3] Remove Start Menu entries
echo     [4] Optionally clear WhatsApp session and history
echo.
echo   Note: This will NOT delete the project folder itself.
echo         You can delete it manually after uninstalling.
echo.
echo  ============================================================
echo.
choice /c YN /m "Continue with uninstall? (Y/N)"
if errorlevel 2 exit /b

echo.
echo  [1/4] Stopping server (if running)...
taskkill /F /IM node.exe >nul 2>&1
echo        Done.

echo  [2/4] Removing desktop shortcut...
del "%USERPROFILE%\Desktop\BulkSender.lnk" >nul 2>&1
echo        Done.

echo  [3/4] Removing Start Menu entries...
rmdir /S /Q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\BulkSender" >nul 2>&1
echo        Done.

echo  [4/4] Clear data?
choice /c YN /m "Clear WhatsApp session and message history? (Y/N)"
if errorlevel 2 goto :done

rmdir /S /Q ".wwebjs_auth" >nul 2>&1
rmdir /S /Q ".wwebjs_cache" >nul 2>&1
del "history.json" >nul 2>&1
rmdir /S /Q "uploads" >nul 2>&1
echo        Data cleared.

:done
echo.
echo  ============================================================
echo                Uninstall Complete!
echo  ============================================================
echo.
echo   To completely remove BulkSender, delete this folder:
echo   %~dp0
echo.
pause
