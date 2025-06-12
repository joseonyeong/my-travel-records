import pydantic
from datetime import datetime

# <<< 수정됨: content 대신 title을 받도록 변경
class BoardCreate(pydantic.BaseModel):
    title: str
    location: str

class Board(pydantic.BaseModel):
    board_id: int
    # content: str # <<< 수정됨: 이 줄을 삭제
    title: str
    writer_date: datetime
    update_date: datetime

    class Config:
        from_attributes = True