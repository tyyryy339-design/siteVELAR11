@echo off
color 1F
title VELAR Server - Press Ctrl+C to stop
cls

echo.
echo ==========================================
echo   VELAR - Local Server
echo ==========================================
echo.
echo Starting server on port 8080...
echo.

cd /d "c:\Users\user\Desktop\werrrrrrrrrr"

echo Open this in your browser:
echo http://localhost:8080/index.html
echo.
echo Or for PHONE ACCESS:
echo http://localhost:8080/phone.html
echo.
echo ==========================================
echo.

python -m http.server 8080

pause
