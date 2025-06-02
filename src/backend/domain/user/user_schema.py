from pydantic import BaseModel, field_validator
from pydantic_core.core_schema import FieldValidationInfo

# User_Create Pydantic 모델 작성
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
