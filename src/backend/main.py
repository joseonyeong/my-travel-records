import os
from pathlib import Path  # 경로를 더 안전하게 다루기 위해 pathlib 사용
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

# 라우터 임포트
from domain.board import board_router
from domain.user import user_router
from domain.map.districts import router as districts_router
from dotenv import load_dotenv

app = FastAPI()
load_dotenv()

# --- 경로 설정 (가장 중요!) ---
# 이 main.py 파일의 위치를 기준으로 경로를 설정합니다.
# BASE_DIR = /.../my-travel-records/src/backend/
BASE_DIR = Path(__file__).resolve().parent
# SRC_DIR = /.../my-travel-records/src/
SRC_DIR = BASE_DIR.parent
# PROJECT_ROOT = /.../my-travel-records/
PROJECT_ROOT = SRC_DIR.parent

origins = [os.getenv("FRONTEND_ORIGIN")]

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 정적 파일 mount (경로 수정) ---
# 1. /static/css, /static/javascript 경로 설정
# frontend/css 폴더를 /static/css URL 경로에 연결합니다.
app.mount("/static/css", StaticFiles(directory=SRC_DIR / "frontend" / "css"), name="static_css")
# frontend/javascript 폴더를 /static/javascript URL 경로에 연결합니다.
app.mount("/static/javascript", StaticFiles(directory=SRC_DIR / "frontend" / "javascript"), name="static_js")

# 2. /images 경로 설정
# public/images 폴더를 /images URL 경로에 연결합니다.
app.mount("/images", StaticFiles(directory=PROJECT_ROOT / "public" / "images"), name="public_images")

# 3. /uploads 경로 설정
# src/uploads 폴더를 /uploads URL 경로에 연결합니다.
app.mount("/uploads", StaticFiles(directory=SRC_DIR / "uploads"), name="user_uploads")


# --- HTML 파일 제공 라우트 ---
@app.get("/")
async def serve_root():
    # 루트 경로는 main.html을 보여주도록 설정 (예시)
    return FileResponse(SRC_DIR / "frontend" / "html" / "main.html")

@app.get("/{filename}.html")
async def serve_html(filename: str):
    return FileResponse(SRC_DIR / "frontend" / "html" / f"{filename}.html")

# --- API 라우터 포함 ---
app.include_router(user_router.router)
app.include_router(districts_router)
app.include_router(board_router.router)