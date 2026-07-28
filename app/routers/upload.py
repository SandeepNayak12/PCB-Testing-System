from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.json_processor import process_json
import json

router = APIRouter(
    prefix="/upload",
    tags=["JSON Upload"]
)

@router.post("/")
async def upload_json(
    json_data: dict,
    db: Session = Depends(get_db)
):
    try:
        result = process_json(db, json_data)

        return {
            "success": True,
            "message": "JSON processed successfully.",
            "data": result
        }

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )