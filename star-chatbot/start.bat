@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto nonode

if exist node_modules goto skipinstall
echo 처음 실행이라 필요한 파일을 설치합니다. 잠시만 기다려주세요...
call npm install

:skipinstall
where ollama >nul 2>nul
if errorlevel 1 goto noollama
echo Ollama 서버를 확인/실행합니다...
start "" /min ollama serve
goto startserver

:noollama
echo [안내] Ollama가 설치되어 있지 않은 것 같아요.
echo 진짜 AI 답변을 받으려면 Ollama 앱을 먼저 실행해주세요.

:startserver
start "" http://localhost:3000
node server.js
echo.
echo 서버가 종료되었습니다.
pause
exit /b

:nonode
echo Node.js가 설치되어 있지 않습니다.
echo https://nodejs.org 에서 LTS 버전을 먼저 설치해주세요.
pause
exit /b
