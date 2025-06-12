from sqlalchemy.orm import Session
from . import board_schema
from models import Board, BoardImg, User

def create_board(db: Session, board_data: board_schema.BoardCreate, image_url: str, user_id: str):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("해당 유저를 찾을 수 없습니다.")

    db_board = Board(
        user_num=user.user_num,
        title=board_data.title,
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

# <<< 아래 함수를 파일 맨 아래에 추가해주세요 >>>
def get_boards_by_user(db: Session, user_num: int):
    """
    특정 사용자가 작성한 모든 게시물을 최신순으로 조회합니다.
    """
    return db.query(Board).filter(Board.user_num == user_num).order_by(Board.writer_date.desc()).all()