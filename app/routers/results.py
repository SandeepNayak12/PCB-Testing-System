from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud

router = APIRouter(
    prefix="/results",
    tags=["Results"]
)


@router.get("/")
def get_results(
    model_code: str,
    db: Session = Depends(get_db)
):
    results = crud.get_results_with_details(db, model_code)

    grouped = {}
    available_columns = set()

    for test_result, pcb_unit, parameter in results:

        barcode = pcb_unit.serial_number

        if barcode not in grouped:

            tested_at = test_result.tested_at

            grouped[barcode] = {
                "unit_id": pcb_unit.unit_id,
                "test_date": tested_at.strftime("%d/%m/%Y"),
                "test_time": tested_at.strftime("%H:%M:%S"),
                "barcode": barcode,
                "result": test_result.jig_overall_result
            }

        value = (
            test_result.value_numeric
            if test_result.value_numeric is not None
            else test_result.value_text
        )

        grouped[barcode][parameter.param_code] = value

        available_columns.add(parameter.param_code)

    preferred = [
        "test_date",
        "test_time",
        "barcode",
        "no_load_24v",
        "no_load_5v",
        "float_test",
        "inlet_sv_test",
        "normal_sv_test",
        "with_load_24v",
        "with_load_5v",
        "uv_test",
        "battery_voltage",
        "battery_current",
        "burnin_test",
        "functionality_test",
        "result",
    ]

    columns = []

    for col in preferred:
        if (
            col in available_columns
            or col in ["test_date", "test_time", "barcode", "result"]
        ):
            columns.append(col)

    return {
        "columns": columns,
        "rows": list(grouped.values())
    }

@router.delete("/unit/{unit_id}")
def delete_result(
    unit_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_results_by_unit(db, unit_id)

    return {
        "message": "PCB test results deleted successfully"
    }

@router.delete("/model/{model_id}")
def delete_results_by_model(
    model_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_results_by_model(db, model_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Model not found"
        )

    return {
        "message": "All results deleted successfully."
    }