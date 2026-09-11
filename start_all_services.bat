@echo off
title AnnSetu Multi-Service Launcher
echo ========================================================
echo         ANNSETU AI FOOD RESCUE PLATFORM
echo ========================================================
echo.
echo Starting all services...
echo [1] AI Service (FastAPI)     -> http://localhost:8000
echo [2] Backend Server (Node.js) -> http://localhost:5000
echo [3] Web Frontend (Vite)      -> http://localhost:5173
echo [4] Mobile App (Expo)        -> http://localhost:8081
echo.
echo Your Wi-Fi Local IP: 10.132.49.31
echo ========================================================
echo.

start "AnnSetu AI Microservice (Port 8000)" cmd /k "cd /d %~dp0ai_module && python -m uvicorn app:app --port 8000 --reload"
timeout /t 3 /nobreak >nul

start "AnnSetu Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul

start "AnnSetu Web Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 2 /nobreak >nul

start "AnnSetu Mobile App (Expo)" cmd /k "cd /d %~dp0mobile && npx expo start"

echo.
echo All services launched in separate windows!
echo Scan the Expo QR code using your phone's camera or Expo Go app.
echo.
pause
