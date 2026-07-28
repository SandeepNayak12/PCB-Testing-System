from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/parameters",
    tags=["Parameters"]
)


@router.post("/", response_model=schemas.ParameterResponse)
def create_parameter(
    parameter: schemas.ParameterCreate,
    db: Session = Depends(get_db)
):
    return crud.create_parameter(db, parameter)

@router.get("/")
def get_parameters(
    model_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_parameters_by_model(db, model_id)


@router.put("/{parameter_id}")
def update_parameter(
    parameter_id: int,
    parameter: schemas.TestParameterUpdate,
    db: Session = Depends(get_db)
):
    updated_parameter = crud.update_parameter(
        db,
        parameter_id,
        parameter
    )

    if not updated_parameter:
        raise HTTPException(
            status_code=404,
            detail="Parameter not found"
        )

    return {
        "message": "Parameter updated successfully",
        "parameter": updated_parameter
    }

@router.delete("/{parameter_id}")
def delete_parameter(
    parameter_id: int,
    db: Session = Depends(get_db)
):
    deleted_parameter = crud.delete_parameter(db, parameter_id)

    if not deleted_parameter:
        raise HTTPException(
            status_code=404,
            detail="Parameter not found"
        )

    return {
        "message": "Parameter deleted successfully"
    }