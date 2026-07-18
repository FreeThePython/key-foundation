@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js was not found.
  echo Install the current Node.js LTS release, then run this file again.
  echo Recommended command from Windows Terminal:
  echo   winget install OpenJS.NodeJS.LTS
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js LTS, then try again.
  pause
  exit /b 1
)

echo.
echo ==============================================
echo   KEY Research Console - Setup and Launch
echo ==============================================
echo.
node --version
npm --version

if not exist node_modules (
  echo.
  echo First run detected. Installing dependencies...
  call npm install
  if errorlevel 1 goto :failure
)

echo.
echo Running validation tests...
call npm test
if errorlevel 1 goto :failure

echo.
echo Tests passed.
echo The console will open at http://localhost:3000
start "" "http://localhost:3000"
echo.
echo Keep this window open while testing.
echo Press Ctrl+C when you are finished.
echo.
call npm run dev
exit /b %errorlevel%

:failure
echo.
echo Setup or validation failed.
echo Copy the error text from this window and include it in your report.
echo.
pause
exit /b 1
