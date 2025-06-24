from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Board, BoardImg, User
from domain.user.user_auth import get_current_user
import csv
import os

router = APIRouter(
    prefix="/api/districts"
)

@router.get("/")
def get_districts():
    csv_path = os.path.join(os.path.dirname(__file__), "seoul_districts_mapped.csv")

    districts = []
    try:
        with open(csv_path, newline="", encoding="utf-8-sig") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                districts.append({
                    "id": row["id"],
                    "display_name": row["display_name"],
                    "color": row["color"],
                    "value": row["value"],
                    "d": row["d"]
                })
        return JSONResponse(content=districts)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.get("/{district_code}/image")
def get_district_images(
    district_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    
    user_boards = db.query(Board).filter(
        Board.district_code == district_code,
        Board.user_num == current_user.user_num
    ).all()

    if not user_boards:
        raise HTTPException(status_code=404, detail="해당 지역 게시물이 없습니다.")

    latest_board = max(user_boards, key=lambda b: b.writer_date)

    images = []
    for img in latest_board.images:
        images.append({
            "board_id": latest_board.board_id,
            "img_url": img.img_url,
            "title": latest_board.title,
            "writer_date": latest_board.writer_date.isoformat()
        })
    return JSONResponse(content=images)

@router.get("/{district_code}/images")
def get_all_district_images(
    district_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. 해당 지역 + 사용자 게시글 모두 조회
    user_boards = db.query(Board).filter(
        Board.district_code == district_code,
        Board.user_num == current_user.user_num
    ).all()

    if not user_boards:
        raise HTTPException(status_code=404, detail="해당 지역 게시물이 없습니다.")

    # 2. 게시글별 이미지들 다 모아서 리스트에 추가
    all_images = []
    for board in user_boards:
        for img in board.images:
            all_images.append({
                "board_id": board.board_id,
                "img_url": img.img_url,
                "title": board.title,
                "writer_date": board.writer_date.isoformat()
            })

    return JSONResponse(content=all_images)