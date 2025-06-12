from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base

# User 모델 (수정 없음)
class User(Base):
    __tablename__ = "user"
    user_num = Column(Integer, primary_key=True, autoincrement=True)
    id = Column(String(50), unique=True, nullable=False)
    pw = Column(String(100))
    profile_img = Column(String(255))
    register_date = Column(DateTime, default=datetime.utcnow)
    birth = Column(DateTime)
    boards = relationship("Board", back_populates="user", cascade="all, delete-orphan")

# Map 모델 (수정 없음)
class Map(Base):
    __tablename__ = "map"
    district_code = Column(String(10), primary_key=True)
    district_name = Column(String(50), nullable=False)
    coordinate = Column(String(100))
    boards = relationship("Board", back_populates="district")

# Board 모델 (수정됨)
class Board(Base):
    __tablename__ = "board"

    board_id = Column(Integer, primary_key=True, autoincrement=True)
    user_num = Column(Integer, ForeignKey("user.user_num"))
    # content = Column(Text)  # <<< 수정됨: 이 줄을 삭제
    title = Column(String(255))
    district_code = Column(String(10), ForeignKey("map.district_code"))
    writer_date = Column(DateTime, default=datetime.utcnow)
    update_date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="boards")
    district = relationship("Map", back_populates="boards")
    images = relationship("BoardImg", back_populates="board", cascade="all, delete-orphan")

# BoardImg 모델 (수정 없음)
class BoardImg(Base):
    __tablename__ = "board_img"
    img_id = Column(Integer, primary_key=True, autoincrement=True)
    board_id = Column(Integer, ForeignKey("board.board_id"))
    img_url = Column(String(255))
    board = relationship("Board", back_populates="images")