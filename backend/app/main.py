from fastapi import FastAPI
from app.routers import models, parameters, upload, results
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(models.router)
app.include_router(parameters.router)
app.include_router(upload.router)
app.include_router(results.router)


@app.get("/")
def root():
    return {"message": "PCB Testing System API"}


from sqlalchemy.orm import Session
from fastapi import Depends

from app.database import get_db
from app.services.json_processor import process_json

@app.get("/test-json")
def test_json(db: Session = Depends(get_db)):

    sample_json = {
        "MODEL_A325": {
            "model_name": "A325 Series",
            "barcode_prefix": "A325",
            "test_records": [
                {
                    "barcode": "A32507040002",
                    "test_date": "2025-07-04",
                    "test_time": "09:30:19",
                    "measurements": {
                        "no_load_24v": 24.156334,
                        "no_load_5v": 4.990520,
                        "float_test": "TESTED_OK",
                        "battery_voltage": 3.28
                    },
                    "burnin_test": "Fill_After_Test",
                    "functionality_test": "Fill_After_Test",
                    "result": "PASS"
                }
            ]
        }
    }

    model = process_json(db, sample_json)

    return {
        "model_id": model.model_id,
        "model_code": model.model_code,
        "model_name": model.model_name
    }