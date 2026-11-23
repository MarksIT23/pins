@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
echo Starting PINS dev server at http://localhost:5173/pins/
call npm run dev
pause
