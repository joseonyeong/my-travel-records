import os
import shutil
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from fastapi.responses import RedirectResponse  # <<< 1. RedirectResponse를 임포트합니다.
from sqlalchemy.orm import Session
from starlette import status

import database
from . import board_crud, board_schema

router = APIRouter()

# <<< 2. 성공 시의 기본 상태 코드를 303으로 변경합니다. (리다이렉트를 위한 표준 코드)
@router.post("/create", status_code=status.HTTP_303_SEE_OTHER)
def board_create(
    db: Session = Depends(database.get_db),
    title: str = Form(...),
    location: str = Form(...),
    image: UploadFile = File(...)
):
    # --- (기존의 파일 저장 및 DB 저장 로직은 그대로 둡니다) ---
    uploads_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads")
    unique_filename = f"{os.urandom(8).hex()}-{image.filename}"
    file_path = os.path.join(uploads_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    image_url = f"/uploads/{unique_filename}"
    board_data = board_schema.BoardCreate(title=title, location=location)
    
    temp_user_id = "1234"
    try:
        board_crud.create_board(db=db, board_data=board_data, image_url=image_url, user_id=temp_user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # <<< 3. JSON 메시지 대신 RedirectResponse를 반환합니다.
    return RedirectResponse(url="/map.html", status_code=status.HTTP_303_SEE_OTHER)