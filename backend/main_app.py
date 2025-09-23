import os
import django
from django.conf import settings
from django.core.wsgi import get_wsgi_application

# 設定 Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.wsgi import WSGIMiddleware

# 導入你的 FastAPI routes
from fastapi.routes.connect import router as connect_router
from fastapi.routes.crawler import router as crawler_router
from fastapi.routes.database import router as database_router
from fastapi.routes.database_img import router as database_img_router
from fastapi.routes.dictionary import router as dictionary_router
from fastapi.routes.model import router as model_router
from fastapi.routes.vision import router as vision_router
from fastapi.routes.test import router as test_router

# 建立 FastAPI 應用
fastapi_app = FastAPI(title="LinguaRoot API", version="1.0.0")

# CORS 設定
origins = [
    "https://react-app-34d4b.web.app/",
    "https://react-app-34d4b.firebaseapp.com/",
    "http://localhost:5173",
]

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 添加 FastAPI 路由
fastapi_app.include_router(connect_router, prefix="/api/connect", tags=["connect"])
fastapi_app.include_router(crawler_router, prefix="/api/crawler", tags=["crawler"])
fastapi_app.include_router(database_router, prefix="/api/database", tags=["database"])
fastapi_app.include_router(database_img_router, prefix="/api/database_img", tags=["database_img"])
fastapi_app.include_router(dictionary_router, prefix="/api/dictionary", tags=["dictionary"])
fastapi_app.include_router(model_router, prefix="/api/model", tags=["model"])
fastapi_app.include_router(vision_router, prefix="/api/vision", tags=["vision"])
fastapi_app.include_router(test_router, prefix="/api/test", tags=["test"])

@fastapi_app.get("/")
def read_root():
    return {"message": "LinguaRoot FastAPI + Django is running!"}

@fastapi_app.get("/health")
def health_check():
    return {"status": "healthy", "services": ["Django", "FastAPI"]}

# 獲取 Django WSGI 應用
django_app = get_wsgi_application()

# 將 Django 作為子應用掛載到 FastAPI
fastapi_app.mount("/django", WSGIMiddleware(django_app))

# 主應用就是 FastAPI
app = fastapi_app