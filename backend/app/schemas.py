from pydantic import BaseModel


class PCBModelCreate(BaseModel):
    model_code: str
    model_name: str
    barcode_prefix: str | None = None


class PCBModelResponse(BaseModel):
    model_id: int
    model_code: str
    model_name: str
    barcode_prefix: str | None = None
    is_active: bool

    class Config:
        from_attributes = True


from decimal import Decimal
from typing import Optional

class ParameterCreate(BaseModel):
    model_id: int
    param_code: str
    param_name: str
    data_type: str
    unit: Optional[str] = None
    min_value: Optional[Decimal] = None
    max_value: Optional[Decimal] = None
    expected_text: Optional[str] = None
    is_mandatory: bool = True


class ParameterResponse(BaseModel):
    parameter_id: int
    model_id: int
    param_code: str
    param_name: str
    data_type: str
    unit: Optional[str] = None
    min_value: Optional[Decimal] = None
    max_value: Optional[Decimal] = None
    expected_text: Optional[str] = None
    is_mandatory: bool
    is_active: bool

    class Config:
        from_attributes = True


class PCBModelUpdate(BaseModel):
    model_name: str
    barcode_prefix: str

class TestParameterUpdate(BaseModel):
    param_name: str
    param_code: str
    data_type: str
    min_value: float | None = None
    max_value: float | None = None
    expected_text: str | None = None