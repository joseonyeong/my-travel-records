from passlib.context import CryptContext
from sqlalchemy.orm import Session
from domain.user.user_schema import UserCreate ,UserUpdate
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

# 사용자 정보 업데이트 
def update_user(db: Session, db_user: User, user_update: UserUpdate):
    update_data = user_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        if key == "pw" and value:
            # "hashed_password"가 아니라 모델에 정의된 "pw"로 속성 이름을 수정합니다.
            hashed_password = pwd_context.hash(value)
            setattr(db_user, "pw", hashed_password)
        else:
            setattr(db_user, key, value)
    
    db.add(db_user)
    db.commit()