@echo off
cd /d D:\Project\Concert_app

start /b cmd /c "cd concertapp && npm run start:dev"
timeout /t 1 >nul

start /b cmd /c "cd fontend && npm run dev"


 


pause
