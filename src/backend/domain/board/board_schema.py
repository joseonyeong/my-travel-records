# src/backend/domain/board/board_schema.py

import pydantic
from datetime import datetime

# BoardImg 테이블에서 이미지 url 링크
class BoardImg(pydantic.BaseModel):
    img_url: str

    class Config:
        from_attributes = True 


#  Board 호출 구문
class Board(pydantic.BaseModel):
    board_id: int
    title: str
    writer_date: datetime
    update_date: datetime
    images: list[BoardImg] = []

    class Config:
        from_attributes = True


# board 생성 
class BoardCreate(pydantic.BaseModel):
    title: str
    location: str