@echo off
setlocal
cd /d "%~dp0"
set "PAGE=%~dp0index.html"
set "PAGE=%PAGE:\=/%"
set "URL=file:///%PAGE%"

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" --app="%URL%" --window-size=1100,780 --disable-extensions --no-first-run
  exit /b 0
)

set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME%" (
  start "" "%CHROME%" --app="%URL%" --window-size=1100,780 --disable-extensions --no-first-run
  exit /b 0
)

start "" "%~dp0index.html"
exit /b 0
