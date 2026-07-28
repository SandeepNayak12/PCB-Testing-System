from app import crud
from datetime import datetime
from fastapi import HTTPException


def process_json(db, json_data):

    # Step 1: Read model information
    model_name = list(json_data.keys())[0]

    model_info = json_data[model_name]

    model_code = model_info["model_code"]

    model = crud.get_model_by_code(db, model_code)

    if model is None:
        raise Exception(f"Model {model_code} not found.")

    # Step 2: Read test records
    test_records = model_info["test_records"]

    print(f"Found {len(test_records)} record(s)")

    for record in test_records:

        try:
            barcode = record["barcode"]

            print("Barcode:", barcode)

            # Check whether PCB already exists
            unit = crud.get_unit_by_serial(db, barcode)

            if unit is not None:
                raise HTTPException(
                    status_code=409,
                    detail=f"PCB '{barcode}' has already been uploaded."
                )

            print("Creating New PCB...")

            unit = crud.create_pcb_unit(
                db,
                barcode,
                model.model_id
            )

            print("Unit ID:", unit.unit_id)

            measurements = record["measurements"]

            for param_code, value in measurements.items():

                print(f"Processing {param_code} = {value}")

                parameter = crud.get_parameter_by_code(
                    db,
                    model.model_id,
                    param_code
                )

                if parameter is None:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Parameter '{param_code}' is not configured for model '{model_code}'."
                    )

                tested_at = datetime.strptime(
                    f"{record['test_date']} {record['test_time']}",
                    "%Y-%m-%d %H:%M:%S"
                )

                crud.create_test_result(
                    db=db,
                    unit_id=unit.unit_id,
                    parameter=parameter,
                    value=value,
                    tested_at=tested_at,
                    overall_result=record["result"]
                )

                print(f"{param_code} stored successfully")

            # Commit only after everything for this PCB succeeds
            db.commit()

        except Exception:
            db.rollback()
            raise

    return model