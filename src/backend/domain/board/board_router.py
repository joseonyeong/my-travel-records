# src/backend/domain/board/board_router.py

import os
import shutil
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from starlette import status

# 필요한 모든 함수와 클래스를 정확하게 임포트합니다.
from database import get_db
from models import User
# user_router에서 get_current_user 함수를 가져옵니다.
from domain.user.user_router import get_current_user 
from . import board_crud, board_schema

router = APIRouter(
    prefix="/api/board",
    tags=["Board"]
)

@router.post("/create")
def board_create(
    db: Session = Depends(get_db),
    title: str = Form(...),
    location: str = Form(...),
    image: UploadFile = File(...),
    # 의존성 주입으로 현재 로그인된 사용자 정보를 가져옵니다.
    current_user: User = Depends(get_current_user)
):
    uploads_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads")
    unique_filename = f"{os.urandom(8).hex()}-{image.filename}"
    file_path = os.path.join(uploads_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    image_url = f"/uploads/{unique_filename}"
    board_data = board_schema.BoardCreate(title=title, location=location)

    try:
        # 이제 current_user 변수에서 직접 id를 가져옵니다.
        board_crud.create_board(db=db, board_data=board_data, image_url=image_url, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return RedirectResponse(url="/map.html", status_code=status.HTTP_303_SEE_OTHER)

@router.get("/me", response_model=list[board_schema.Board])
def get_my_boards(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    현재 로그인된 사용자의 모든 게시물 목록을 반환합니다.
    """
    boards = board_crud.get_boards_by_user(db=db, user_num=current_user.user_num)
    return boards