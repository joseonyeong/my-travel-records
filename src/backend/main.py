import os

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from domain.user import user_router

app = FastAPI()

origins = [
    "http://127.0.0.1:5173",    # 또는 "http://localhost:5173"
]

# JS에서 fetch로 API 요청할 때 필요함
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 경로 설정
base_dir = os.path.dirname(__file__)  # src/backend
frontend_dir = os.path.abspath(os.path.join(base_dir, "..", "frontend"))
html_dir = os.path.join(frontend_dir, "html")
css_dir = os.path.join(frontend_dir, "css")
js_dir = os.path.join(frontend_dir, "javascript")

# 정적 파일 mount
app.mount("/static/css", StaticFiles(directory=css_dir), name="css")
app.mount("/static/javascript", StaticFiles(directory=js_dir), name="javascript")

@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(html_dir, "index.html"))

@app.get("/{filename}.html")
async def serve_html(filename: str):
    return FileResponse(os.path.join(html_dir, f"{filename}.html"))

# API 라우터
app.include_router(user_router.router)