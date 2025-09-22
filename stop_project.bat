@echo off
echo stop FastAPI server
taskkill /IM uvicorn.exe /F

echo stop Django server
taskkill /IM python.exe /F

echo stop React + Vite
taskkill /IM cmd.exe /F