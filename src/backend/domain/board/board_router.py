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
        # ★★★ 수정된 부분 1: user_id 대신 user_num을 사용합니다. ★★★
        board_crud.create_board(db=db, board_data=board_data, image_url=image_url, user_num=current_user.user_num)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return RedirectResponse(url="/map.html", status_code=status.HTTP_303_SEE_OTHER)

@router.get("/me", response_model=list[board_schema.Board])
def get_my_boards(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 이 부분은 이미 올바르게 user_num을 사용하고 있습니다.
    boards = board_crud.get_boards_by_user(db=db, user_num=current_user.user_num)
    return boards

# 마이페이지 게시물삭제 
@router.delete("/delete/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def board_delete(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    지정된 ID의 게시물을 삭제합니다.
    """
    # 1. DB에서 삭제할 게시물을 찾습니다.
    board_to_delete = board_crud.get_board(db, board_id=board_id)

    # 2. 게시물이 없으면 404 에러를 발생시킵니다.
    if not board_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="게시물을 찾을 수 없습니다.")

    # ★★★ 수정된 부분 2: 권한 확인할 때 user_num을 사용합니다. ★★★
    if board_to_delete.user_num != current_user.user_num:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="게시물을 삭제할 권한이 없습니다.")

    # 4. (중요) 서버에 저장된 이미지 파일을 삭제합니다.
    if board_to_delete.images:
        image_url = board_to_delete.images[0].img_url
        # URL 경로('/uploads/filename.jpg')를 실제 파일 시스템 경로로 변환
        file_name = os.path.basename(image_url)
        file_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads", file_name)
        if os.path.exists(file_path):
            os.remove(file_path)

    # 5. DB에서 게시물 데이터를 삭제합니다.
    board_crud.delete_board(db=db, board=board_to_delete)

    # 성공 시 내용 없이 204 상태 코드를 반환합니다.
    return