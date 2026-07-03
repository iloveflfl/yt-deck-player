Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Write-Host "=== YT Deck Player MVP ===" -ForegroundColor Cyan
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm을 찾을 수 없습니다. Node.js LTS를 먼저 설치하세요." -ForegroundColor Red
  exit 1
}
npm install
npm start
