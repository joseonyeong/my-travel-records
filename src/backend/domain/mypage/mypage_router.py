from fastapi import APIRouter, Depends, status, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from database import get_db
from models import User, Board
from domain.user.user_auth import get_current_user
from domain.mypage import mypage_crud, mypage_schema 
from domain.mypage.mypage_schema import UserProfile, ProfileUpdate, UserStatsResponse

import shutil
import os

router = APIRouter(prefix="/api/mypage")

# ✨ 서버 실행 위치에 상관없이 항상 올바른 경로를 가리키도록 절대 경로로 수정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT_DIR = os.path.join(BASE_DIR, "..", "..", "..", "..")
UPLOAD_DIRECTORY = os.path.join(PROJECT_ROOT_DIR, "uploads", "profiles")

@router.get("/profile", response_model=mypage_schema.UserProfile)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user is None:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증에 실패했습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    post_count = mypage_crud.count_user_boards(db=db, user_num=current_user.user_num)
    location_count = mypage_crud.count_unique_user_districts(db=db, user_num=current_user.user_num)
    

    return mypage_schema.UserProfile(
        id=current_user.id,
        nickname=current_user.id,  # ✨ 이 부분을 수정!
        profile_img=current_user.profile_img,
        register_date=current_user.register_date,
        birth=current_user.birth,
        post_count=post_count,
        location_count=location_count
    )

@router.put("/profile", status_code=status.HTTP_204_NO_CONTENT)
def update_my_profile(
    _profile_update: mypage_schema.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="인증에 실패했습니다.")
    mypage_crud.update_profile(db=db, db_user=current_user, profile_update=_profile_update)

@router.post("/profile/image", status_code=status.HTTP_204_NO_CONTENT)
def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="인증에 실패했습니다.")

    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
    
    file_extension = file.filename.split('.')[-1]
    filename = f"{current_user.id}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIRECTORY, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ✨ 실제 파일이 저장되는 /uploads/ 경로와 일치하도록 URL 수정
    file_url = f"/uploads/profiles/{filename}"
    current_user.profile_img = file_url
    db.add(current_user)
    db.commit()

# ✨ 이 API는 이제 /profile API와 기능이 중복되지만, 혹시 다른 곳에서 사용할 경우를 위해 그대로 둡니다.
# 만약 더 이상 필요 없다면 이 라우터 자체를 삭제해도 좋습니다.
@router.get("/me/stats", response_model=UserStatsResponse)
def read_user_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="인증에 실패했습니다.")

    user_num = current_user.user_num
    post_count = mypage_crud.count_user_boards(db=db, user_num=user_num)
    visited_districts_count = mypage_crud.count_unique_user_districts(db=db, user_num=user_num)

    return {
        "post_count": post_count,
        "visited_districts_count": visited_districts_count
    }