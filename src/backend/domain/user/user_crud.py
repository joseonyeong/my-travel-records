from sqlalchemy.orm import Session
from domain.user.user_schema import UserCreate
from models import User

# 회원 데이터를 저장하는 함수
def create_user(db: Session, user_create: UserCreate):
    db_user = User(id=user_create.id,
                   pw=user_create.pw)
    db.add(db_user)
    db.commit()

# DB에 이미 존재하는 사용자가 있는지 확인하는 함수
def get_existing_user(db: Session, user_create: UserCreate):
    return db.query(User).filter(
        (User.id == user_create.id)
    ).first()