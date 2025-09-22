@echo off
echo run Django server
cd D:\project\LinguaRoot\backend
start python manage.py runserver

echo run FastAPI server
cd D:\project\LinguaRoot\backend
start uvicorn fastAPI.main:app --host 127.0.0.1 --port 8001 --reload

echo run frontend React + Vite
cd D:\project\LinguaRoot\
start npm run dev