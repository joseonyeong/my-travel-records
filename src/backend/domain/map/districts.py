from fastapi import APIRouter
from fastapi.responses import JSONResponse
import csv
import os

router = APIRouter()

@router.get("/api/districts")
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
