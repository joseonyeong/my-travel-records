from pydantic import BaseModel, field_validator
from pydantic_core.core_schema import FieldValidationInfo
from datetime import date , datetime

# 회원가입 요청에 사용되는 입력 데이터 구조
class UserCreate(BaseModel):
    id: str  # 사용자 아이디
    pw: str  # 비밀번호
    pw_confirm: str  # 비밀번호 확인

    @field_validator('id', 'pw', 'pw_confirm')
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('빈 값은 허용되지 않습니다.')
        return v

    @field_validator('pw_confirm')
    @classmethod
    def passwords_match(cls, v: str, info: FieldValidationInfo) -> str:
        if 'pw' in info.data and v != info.data['pw']:
            raise ValueError('비밀번호가 일치하지 않습니다')
        return v

# 로그인 요청에 대한 응답 데이터 구조
class Token(BaseModel):
    access_token: str
    token_type: str
    id: str


# 사용자 정보 입력 (업데이트용)
class UserUpdate(BaseModel):
    # HTML에서 변경 가능한 필드들을 정의합니다.
    # 모든 필드는 선택 사항이므로 | None = None 을 붙여줍니다.
    pw: str | None = None          # 새 비밀번호
    birth: date | None = None      # 새 생년월일
    username: str | None = None    # 새 이름

# 사용자 정보 출력 (기본적인 응답용 / PW 등은 포함 X)
class UserResponse(BaseModel):
    id: str
    register_date: datetime

    class Config:
        from_attributes = True

# 사용자 정보 상세 출력
class UserProfile(BaseModel):
    id: str
    register_date: datetime
    birth: date | None = None # 생년월일 (DB에 없으면 null)
    # 향후 계산해서 넣을 필드들 (기본값을 0으로 설정)
    post_count: int = 0
    location_count: int = 0

    class Config:
        from_attributes = True