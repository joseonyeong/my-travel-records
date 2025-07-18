import os

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from domain.board import board_router
from domain.user import user_router
from domain.map import districts
from domain.mypage import mypage_router

app = FastAPI()
load_dotenv()

origins = [os.getenv("FRONTEND_ORIGIN")]

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
src_dir = os.path.abspath(os.path.join(base_dir, ".."))  # → src/
project_root = os.path.abspath(os.path.join(src_dir, ".."))  # → my-travel-records

frontend_dir = os.path.join(src_dir, "frontend")
uploads_dir  = os.path.join(project_root, "uploads")

html_dir = os.path.join(frontend_dir, "html")
css_dir = os.path.join(frontend_dir, "css")
js_dir = os.path.join(frontend_dir, "javascript")
img_dir = os.path.join(frontend_dir, "images")

os.makedirs(uploads_dir, exist_ok=True)

# 정적 파일 mount
app.mount("/static/css", StaticFiles(directory=css_dir), name="css")
app.mount("/static/javascript", StaticFiles(directory=js_dir), name="javascript")
app.mount("/static/images", StaticFiles(directory=img_dir), name="images")
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(html_dir, "index.html"))

@app.get("/{filename}.html")
async def serve_html(filename: str):
    return FileResponse(os.path.join(html_dir, f"{filename}.html"))

@app.post("/upload/{user_num}")
async def upload_image(user_num: int, file: UploadFile = File(...)):
    user_dir = os.path.join(uploads_dir, f"user_{user_num}")
    os.makedirs(user_dir, exist_ok=True)

    # 저장 경로
    save_path = os.path.join(user_dir, file.filename)

    # 파일 저장
    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())

    # 접근 URL (정적 mount 기준)
    public_url = f"/uploads/user_{user_num}/{file.filename}"
    return {"image_url": public_url}

# API 라우터
app.include_router(user_router.router)
app.include_router(districts.router) 
app.include_router(board_router.router)
app.include_router(mypage_router.router)
