@echo off
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js가 설치되어 있지 않습니다.
  echo https://nodejs.org 에서 LTS 버전을 먼저 설치해주세요.
  pause
  exit /b
)

if not exist node_modules (
  echo 처음 실행이라 필요한 파일을 설치합니다. 잠시만 기다려주세요...
  call npm install
)

start "" http://localhost:3000
node server.js

pause
