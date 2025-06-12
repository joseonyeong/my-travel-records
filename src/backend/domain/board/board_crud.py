from sqlalchemy.orm import Session
from . import board_schema
from models import Board, BoardImg, User

def create_board(db: Session, board_data: board_schema.BoardCreate, image_url: str, user_id: str):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("해당 유저를 찾을 수 없습니다.")

    # <<< 수정됨: content 관련 로직 모두 제거
    db_board = Board(
        user_num=user.user_num,
        title=board_data.title, # content 대신 board_data에서 직접 title을 가져옴
        district_code=board_data.location,
    )
    db.add(db_board)
    db.commit()
    db.refresh(db_board)

    db_board_img = BoardImg(
        board_id=db_board.board_id,
        img_url=image_url
    )
    db.add(db_board_img)
    db.commit()

    return db_board