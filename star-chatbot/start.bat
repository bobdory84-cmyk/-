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

where ollama >nul 2>nul
if errorlevel 1 (
  echo [안내] Ollama가 설치되어 있지 않은 것 같아요.
  echo 진짜 AI 답변을 받으려면 Ollama 앱을 먼저 실행해주세요.
) else (
  echo Ollama 서버를 확인/실행합니다...
  start "" /min ollama serve
)

start "" http://localhost:3000
node server.js

pause
