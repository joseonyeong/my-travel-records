from sqlalchemy.orm import Session
from . import board_schema
from models import Board, BoardImg, User

def create_board(db: Session, board_data: board_schema.BoardCreate, image_url: str, user_num: int):
    # User를 찾을 때 .id 대신 .user_num을 사용합니다.
    user = db.query(User).filter(User.user_num == user_num).first()
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

# 마이페이지 조회구문
def get_boards_by_user(db: Session, user_num: int):
    return db.query(Board).filter(Board.user_num == user_num).order_by(Board.writer_date.desc()).all()


# 조회 및 삭제 구현
def get_board(db: Session, board_id: int):
    return db.query(Board).filter(Board.board_id == board_id).first()

def delete_board(db: Session, board: Board):
    db.delete(board)
    db.commit()


# 사용자의 전체 게시글 수를 세는 함수
def count_user_boards(db: Session, user_num: int) -> int:
    # Board 테이블에서 user_num이 일치하는 레코드의 개수를 센다.
    return db.query(Board).filter(Board.user_num == user_num).count()

# 사용자가 방문한 (게시글을 작성한) 고유한 구의 개수를 세는 함수
from sqlalchemy import func, distinct # func와 distinct를 사용하려면 임포트 필요

def count_unique_user_districts(db: Session, user_num: int) -> int:
    # Board 테이블에서 user_num이 일치하는 레코드 중
    # district_code 컬럼의 중복을 제거한 개수를 센다.
    return db.query(func.count(distinct(Board.district_code))).filter(Board.user_num == user_num).scalar()

