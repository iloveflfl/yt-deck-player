@echo off
rem Launch YT Deck Player for ControlDeck: newest packaged build, else dev app.
setlocal
set "EXE="
for /f "delims=" %%F in ('dir /b /o-d "%~dp0dist\YTDeckPlayer-*-portable.exe" 2^>nul') do (
  set "EXE=%~dp0dist\%%F"
  goto :run
)
:run
if defined EXE (
  start "" "%EXE%"
) else (
  cd /d "%~dp0"
  call npm.cmd start
)
endlocal
