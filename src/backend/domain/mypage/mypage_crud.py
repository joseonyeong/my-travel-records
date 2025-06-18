from sqlalchemy.orm import Session
from models import User
from domain.mypage.mypage_schema import ProfileUpdate
from passlib.context import CryptContext

# 비밀번호 해싱을 위한 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 프로필 업데이트를 처리하는 함수
def update_profile(db: Session, db_user: User, profile_update: ProfileUpdate):
    # Pydantic 모델을 딕셔너리로 변환 (값이 있는 필드만)
    update_data = profile_update.model_dump(exclude_unset=True)

    # 각 필드를 순회하며 db_user 객체의 값을 변경
    for key, value in update_data.items():
        if key == "pw" and value:
            # 새 비밀번호가 있다면 해싱해서 저장
            hashed_password = pwd_context.hash(value)
            setattr(db_user, "pw", hashed_password)
        else:
            # 나머지 필드는 그대로 값을 덮어쓰기
            setattr(db_user, key, value)
    
    # 변경사항을 DB에 커밋
    db.add(db_user)
    db.commit()