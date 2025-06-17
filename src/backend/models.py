from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship, Session
from datetime import datetime

from database import Base, SessionLocal

# User 모델 (user 테이블)
class User(Base):
    __tablename__ = "user"

    user_num = Column(Integer, primary_key=True, autoincrement=True)
    id = Column(String(50), unique=True, nullable=False)
    pw = Column(String(100))
    profile_img = Column(String(255))
    register_date = Column(DateTime, default=datetime.utcnow)
    birth = Column(DateTime)

    boards = relationship("Board", back_populates="user", cascade="all, delete-orphan")

# Map 모델 (map 테이블)
class Map(Base):
    __tablename__ = "map"

    district_code = Column(String(30), primary_key=True)
    district_name = Column(String(50), nullable=False)

    boards = relationship("Board", back_populates="district")

# Board 모델 (board 테이블)
class Board(Base):
    __tablename__ = "board"

    board_id = Column(Integer, primary_key=True, autoincrement=True)
    user_num = Column(Integer, ForeignKey("user.user_num"))
    title = Column(String(255))
    district_code = Column(String(30), ForeignKey("map.district_code"))
    writer_date = Column(DateTime, default=datetime.utcnow)
    update_date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="boards")
    district = relationship("Map", back_populates="boards")
    images = relationship("BoardImg", back_populates="board", cascade="all, delete-orphan")

# BoardImg 모델 (board_img 테이블)
class BoardImg(Base):
    __tablename__ = "board_img"

    img_id = Column(Integer, primary_key=True, autoincrement=True)
    board_id = Column(Integer, ForeignKey("board.board_id"))
    img_url = Column(String(255))

    board = relationship("Board", back_populates="images")

def insert_default_map_data():
    districts = {
        'Dobong-gu': '도봉구',
        'Dongdaemun-gu': '동대문구',
        'Dongjak-gu': '동작구',
        'Eunpyeong-gu': '은평구',
        'Gangbuk-gu': '강북구',
        'Gangdong-gu': '강동구',
        'Gangseo-gu': '강서구',
        'Geumcheon-gu': '금천구',
        'Guro-gu': '구로구',
        'Gwanak-gu': '관악구',
        'Gwangjin-gu': '광진구',
        'Gangnam-gu': '강남구',
        'Jongno-gu': '종로구',
        'Jung-gu': '중구',
        'Jungnang-gu': '중랑구',
        'Mapo-gu': '마포구',
        'Nowon-gu': '노원구',
        'Seocho-gu': '서초구',
        'Seodaemun-gu': '서대문구',
        'Seongbuk-gu': '성북구',
        'Seongdong-gu': '성동구',
        'Songpa-gu': '송파구',
        'Yangcheon-gu': '양천구',
        'Yeongdeungpo-gu': '영등포구',
        'Yongsan-gu': '용산구'
    }

    session: Session = SessionLocal()
    try:
        for eng_name in districts:
            district_code = eng_name.lower()  # ex: 'dongjak-gu'
            district_name = districts[eng_name]

            if not session.query(Map).filter_by(district_code=district_code).first():
                session.add(Map(district_code=district_code, district_name=district_name))

        session.commit()
        print("Map 테이블에 기본 데이터 삽입 완료")
    except Exception as e:
        session.rollback()
        print("오류 발생:", e)
    finally:
        session.close()
