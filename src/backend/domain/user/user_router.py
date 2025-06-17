from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.orm import Session
from database import get_db

from domain.user import user_crud, user_schema
from domain.user.user_auth import create_access_token, get_current_user
from domain.user.user_crud import pwd_context
from models import User  

import os
import shutil

router = APIRouter(
    prefix="/api/user",
)

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
SECRET_KEY = "4ab2fce7a6bd79e1c014396315ed322dd6edb1c5d975c6b74a2904135172c03c"
ALGORITHM = "HS256"


# 회원가입 API
@router.post("/create", status_code=status.HTTP_204_NO_CONTENT)
def user_create(_user_create: user_schema.UserCreate, db: Session = Depends(get_db)):
    user = user_crud.get_user(db, _user_create.id)
    if user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="이미 존재하는 사용자입니다.")
    # 데이터베이스 추가
    user_crud.create_user(db=db, user_create=_user_create)

# 아이디 중복 체크
@router.get("/check-id")
def check_user_id(id: str, db: Session = Depends(get_db)):
    user = user_crud.get_user(db, id)
    if user:
        return {"available": False, "detail": "이미 존재하는 아이디입니다."}
    return {"available": True}

# 로그인 API
@router.post("/login", response_model=user_schema.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(),
                           db: Session = Depends(get_db)):
    user = user_crud.get_user(db, form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.pw):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UserID 또는 Password가 일치하지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "id": user.id
    }

@router.get("/me")
def read_users_me(current_user=Depends(get_current_user)):
    return {"id": current_user.id}


# 사용자정보 업데이트 ()
@router.put("/update", status_code=status.HTTP_204_NO_CONTENT)
def user_update(
    _user_update: user_schema.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    현재 로그인된 사용자의 정보(비밀번호, 생일 등)를 수정합니다.
    """
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="인증이 필요합니다.")

    user_crud.update_user(db=db, db_user=current_user, user_update=_user_update)


# 사용자 정보 반환 현재유저만 조회가능하도록 /me 추가
@router.get("/me", response_model=user_schema.UserProfile)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    현재 로그인된 사용자의 상세 프로필 정보를 조회합니다.
    """
    # TODO: 향후 게시물, 방문 장소 수를 계산하는 로직 추가 필요
    # user_profile = user_schema.UserProfile.from_orm(current_user)
    # user_profile.post_count = ...
    # user_profile.location_count = ...
    return current_user

# 프로필 이미지 업로드 API
@router.post("/upload-profile-image", status_code=status.HTTP_204_NO_CONTENT)
def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    UPLOAD_DIRECTORY = "./src/frontend/public/images/profiles"
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