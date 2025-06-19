import os

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from domain.board import board_router
from domain.user import user_router
from domain.map import districts
from domain.mypage import mypage_router
from dotenv import load_dotenv


app = FastAPI()
load_dotenv()

origins = [os.getenv("FRONTEND_ORIGIN")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ✨ 경로 설정 부분을 아래 내용으로 수정/교체해주세요 ✨ ---

# 경로 설정의 기준점을 프로젝트 최상위 폴더로 잡습니다.
base_dir = os.path.dirname(__file__)  # src/backend
project_root = os.path.abspath(os.path.join(base_dir, "..", ".."))

# 모든 경로를 project_root 기준으로 재설정합니다.
frontend_dir = os.path.join(project_root, "src", "frontend")
uploads_dir  = os.path.join(project_root, "uploads") # ✨ 'src' 밖의 uploads 폴더를 가리키도록 수정
public_dir = os.path.join(project_root, "public")

html_dir = os.path.join(frontend_dir, "html")
css_dir = os.path.join(frontend_dir, "css")
js_dir = os.path.join(frontend_dir, "javascript")
img_dir = os.path.join(frontend_dir, "images")
<<<<<<< HEAD

=======
>>>>>>> 109933e9725ecc9b814120645e87c80d20ba9d97


# 정적 파일 mount
app.mount("/static/css", StaticFiles(directory=css_dir), name="css")
app.mount("/static/javascript", StaticFiles(directory=js_dir), name="javascript")
<<<<<<< HEAD
<<<<<<< HEAD
app.mount("/static/images", StaticFiles(directory=img_dir), name="images")
=======
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads") # 이미지 로컬 저장소 
>>>>>>> yunsanghyeon2
=======
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads") 
app.mount("/public", StaticFiles(directory=public_dir), name="public")
>>>>>>> 109933e9725ecc9b814120645e87c80d20ba9d97

@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(html_dir, "index.html"))

@app.get("/{filename}.html")
async def serve_html(filename: str):
    return FileResponse(os.path.join(html_dir, f"{filename}.html"))

# API 라우터
app.include_router(user_router.router)
app.include_router(districts.router) 
app.include_router(board_router.router)
app.include_router(mypage_router.router)