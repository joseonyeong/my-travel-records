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
def update_user(db: Session, db_user: User, user_update: UserUpdate) -> User:
    """
    사용자 정보를 업데이트합니다.
    :param db: 데이터베이스 세션
    :param db_user: 수정할 User 모델 객체 (DB에서 조회한 원본)
    :param user_update: 수정할 내용이 담긴 Pydantic 스키마 객체
    """
    # 1. Pydantic 스키마를 딕셔너리로 변환 (값이 들어온 필드만)
    update_data = user_update.model_dump(exclude_unset=True)

    # 2. 각 필드를 순회하며 db_user 객체의 값을 변경
    for key, value in update_data.items():
        if key == "pw": # 비밀번호 필드는 특별 취급
            # 새 비밀번호를 해싱해서 저장
            hashed_password = pwd_context.hash(value)
            setattr(db_user, "hashed_password", hashed_password)
        else:
            # 나머지 필드는 그대로 값을 덮어쓴다
            setattr(db_user, key, value)
    
    # 3. 변경사항을 DB에 커밋
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user