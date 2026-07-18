@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title KEY Research Console Launcher

echo.
echo ==============================================
echo   KEY Research Console - Setup and Launch
echo ==============================================
echo.
echo Project folder:
echo   %CD%
echo.

where node >nul 2>nul
if errorlevel 1 goto :node_missing

where npm >nul 2>nul
if errorlevel 1 goto :npm_missing

echo Node version:
node --version
echo npm version:
call npm --version

if not exist package.json goto :package_missing

if not exist node_modules (
  echo.
  echo First run detected. Installing dependencies...
  echo This can take several minutes, especially on the first run.
  echo.
  call npm install
  if errorlevel 1 goto :failure
)

echo.
echo Running validation tests...
call npm test
if errorlevel 1 goto :failure

echo.
echo Tests passed.
echo Starting the KEY server in a separate window...
echo.

start "KEY Research Console Server" cmd /k "cd /d "%CD%" && npm run dev"

echo Waiting for http://localhost:3000 to become ready...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ready=$false; for($i=0;$i -lt 60;$i++){ try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3000' -TimeoutSec 2; if($r.StatusCode -ge 200){$ready=$true; break} } catch {}; Start-Sleep -Seconds 2 }; if($ready){exit 0}else{exit 1}"

if errorlevel 1 goto :server_failure

echo.
echo KEY is ready. Opening your default browser...
start "" "http://localhost:3000"
echo.
echo The application is running in the window titled:
echo   KEY Research Console Server
echo.
echo To stop KEY, go to that window and press Ctrl+C.
echo You may close this launcher window now.
echo.
pause
exit /b 0

:node_missing
echo ERROR: Node.js was not found in the Windows PATH.
echo.
echo Install Node.js LTS, then restart Windows or sign out and back in.
echo Recommended command:
echo   winget install OpenJS.NodeJS.LTS
goto :hold

:npm_missing
echo ERROR: npm was not found in the Windows PATH.
echo Reinstall Node.js LTS, then restart Windows.
goto :hold

:package_missing
echo ERROR: package.json was not found.
echo This launcher must remain inside apps\research-console.
goto :hold

:server_failure
echo ERROR: The server did not respond at http://localhost:3000 within two minutes.
echo.
echo Look at the separate window titled KEY Research Console Server.
echo The visible error there will tell us what failed.
goto :hold

:failure
echo.
echo ERROR: Setup or validation failed.
echo Copy or photograph the error text above and send it with your report.
goto :hold

:hold
echo.
echo This window will remain open so the error can be read.
pause
exit /b 1
