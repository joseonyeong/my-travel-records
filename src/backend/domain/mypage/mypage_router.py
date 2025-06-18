from fastapi import APIRouter, Depends, status, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from database import get_db
from models import User, Board
from domain.user.user_auth import get_current_user
from . import mypage_schema, mypage_crud
import shutil
import os

router = APIRouter(
    prefix="/api/mypage",
)

UPLOAD_DIRECTORY = "./src/frontend/public/images/profiles"

@router.get("/profile", response_model=mypage_schema.UserProfile)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post_count = db.query(Board).filter(Board.user_num == current_user.user_num).count()
    location_count = db.query(func.count(distinct(Board.district_code))).filter(Board.user_num == current_user.user_num).scalar()
    
    current_user.post_count = post_count
    current_user.location_count = location_count
    
    return current_user

@router.put("/profile", status_code=status.HTTP_204_NO_CONTENT)
def update_my_profile(
    _profile_update: mypage_schema.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mypage_crud.update_profile(db=db, db_user=current_user, profile_update=_profile_update)

@router.post("/profile/image", status_code=status.HTTP_204_NO_CONTENT)
def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
    file_extension = file.filename.split('.')[-1]
    filename = f"{current_user.id}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIRECTORY, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_url = f"/public/images/profiles/{filename}"
    current_user.profile_img = file_url
    db.add(current_user)
    db.commit()