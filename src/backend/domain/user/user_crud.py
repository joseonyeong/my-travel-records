from passlib.context import CryptContext
from sqlalchemy.orm import Session
from domain.user.user_schema import UserCreate
from models import User

# 비밀번호 해싱 처리
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 회원 데이터를 저장
def create_user(db: Session, user_create: UserCreate):
    # 비밀번호를 안전하게 해싱하여 저장
    hashed_password = pwd_context.hash(user_create.pw)
    db_user = User(id=user_create.id, pw=hashed_password)
    db.add(db_user)
    db.commit()

# 특정 사용자 정보 조회
def get_user(db: Session, id: str):
    return db.query(User).filter(User.id == id).first()
