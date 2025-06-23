from sqlalchemy.orm import Session
from sqlalchemy import func, distinct  
from models import User, Board         
from domain.mypage.mypage_schema import ProfileUpdate
from passlib.context import CryptContext
from fastapi import HTTPException, status
from domain.user import user_crud 

# 비밀번호 해싱을 위한 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 프로필 업데이트를 처리하는 함수
def update_profile(db: Session, db_user: User, profile_update: ProfileUpdate):
    update_data = profile_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "pw" and value:
            hashed_password = pwd_context.hash(value)
            setattr(db_user, "pw", hashed_password)
        else:
            setattr(db_user, key, value)
    db.add(db_user)
    db.commit()

# 사용자 총 게시물 계산
def count_user_boards(db: Session, user_num: int):
    return db.query(Board).filter(Board.user_num == user_num).count()

# 사용자 방문 자치구 계산
def count_unique_user_districts(db: Session, user_num: int):
    return db.query(func.count(distinct(Board.district_code))).filter(Board.user_num == user_num).scalar()