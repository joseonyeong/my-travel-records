from pydantic import BaseModel
from datetime import date, datetime

# 사용자 정보 수정을 위해 입력받는 데이터의 규칙
class ProfileUpdate(BaseModel):
    id: str | None = None
    nickname: str | None = None
    pw: str | None = None
    birth: date | None = None

# 사용자 프로필 정보를 프론트엔드로 보낼 때의 규칙
class UserProfile(BaseModel):
    id: str
    nickname: str | None = None
    profile_img: str | None = None
    register_date: datetime | None = None
    birth: date | None = None
    post_count: int = 0
    location_count: int = 0

    class Config:
        from_attributes = True

# 통계 API의 응답 형식을 정의하는 스키마
class UserStatsResponse(BaseModel):
    post_count: int
    visited_districts_count: int