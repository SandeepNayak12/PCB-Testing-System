from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import schemas, crud

router = APIRouter(
    prefix="/models",
    tags=["Models"]
)


@router.post("/", response_model=schemas.PCBModelResponse)
def create_model(
    model: schemas.PCBModelCreate,
    db: Session = Depends(get_db)
):
    return crud.create_model(db, model)

@router.get("/", response_model=list[schemas.PCBModelResponse])
def get_models(db: Session = Depends(get_db)):
    return crud.get_models(db)

@router.put("/{model_id}")
def update_model(
    model_id: int,
    model: schemas.PCBModelUpdate,
    db: Session = Depends(get_db)
):
    updated_model = crud.update_model(db, model_id, model)

    if not updated_model:
        raise HTTPException(
            status_code=404,
            detail="Model not found"
        )

    return {
        "message": "Model updated successfully",
        "model": updated_model
    }

@router.delete("/{model_id}")
def delete_model(
    model_id: int,
    db: Session = Depends(get_db)
):
    try:
        deleted_model = crud.delete_model(db, model_id)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    if not deleted_model:
        raise HTTPException(
            status_code=404,
            detail="Model not found"
        )

    return {
        "message": "Model deleted successfully"
    }

