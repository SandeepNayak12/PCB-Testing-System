from sqlalchemy.orm import Session
from app import models, schemas


def create_model(db: Session, model: schemas.PCBModelCreate):
    db_model = models.PCBModel(
        model_code=model.model_code,
        model_name=model.model_name,
        barcode_prefix=model.barcode_prefix
    )

    db.add(db_model)
    db.commit()
    db.refresh(db_model)

    return db_model

def get_models(db: Session):
    return db.query(models.PCBModel).all()

def create_parameter(db: Session, parameter: schemas.ParameterCreate):
    db_parameter = models.TestParameter(
        model_id=parameter.model_id,
        param_code=parameter.param_code,
        param_name=parameter.param_name,
        data_type=parameter.data_type,
        unit=parameter.unit,
        min_value=parameter.min_value,
        max_value=parameter.max_value,
        expected_text=parameter.expected_text,
        is_mandatory=parameter.is_mandatory
    )

    db.add(db_parameter)
    db.commit()
    db.refresh(db_parameter)

    return db_parameter

def get_model_by_code(
    db: Session,
    model_code: str
):
    return (
        db.query(models.PCBModel)
        .filter(models.PCBModel.model_code == model_code)
        .first()
    )

def get_unit_by_serial(
    db: Session,
    serial_number: str
):
    return (
        db.query(models.PCBUnit)
        .filter(models.PCBUnit.serial_number == serial_number)
        .first()
    )

def get_parameter_by_code(
    db: Session,
    model_id: int,
    param_code: str
):
    return (
        db.query(models.TestParameter)
        .filter(
            models.TestParameter.model_id == model_id,
            models.TestParameter.param_code == param_code
        )
        .first()
    )

def create_pcb_unit(
    db: Session,
    serial_number: str,
    model_id: int
):
    db_unit = models.PCBUnit(
        serial_number=serial_number,
        model_id=model_id
    )

    db.add(db_unit)
    db.flush()          # Sends INSERT but doesn't commit
    db.refresh(db_unit)

    return db_unit

from datetime import datetime

def create_test_result(
    db: Session,
    unit_id: int,
    parameter,
    value,
    tested_at: datetime,
    overall_result: str
):
    db_result = models.TestResult(
        unit_id=unit_id,
        parameter_id=parameter.parameter_id,
        tested_at=tested_at,
        passed=overall_result.upper() == "PASS",
        jig_overall_result=overall_result
    )

    if parameter.data_type == "numeric":
        db_result.value_numeric = float(value)
    else:
        db_result.value_text = str(value)

    db.add(db_result)
    db.flush()          # No commit

    return db_result

def get_all_results(db: Session):
    return db.query(models.TestResult).all()


def get_results_with_details(db: Session, model_code: str):
    return (
        db.query(
            models.TestResult,
            models.PCBUnit,
            models.TestParameter
        )
        .join(models.PCBUnit)
        .join(models.TestParameter)
        .join(models.PCBModel)
        .filter(models.PCBModel.model_code == model_code)
        .order_by(models.PCBUnit.unit_id.asc())
        .all()
    )

def get_parameters_by_model(db: Session, model_id: int):
    return (
        db.query(models.TestParameter)
        .filter(models.TestParameter.model_id == model_id)
        .all()
    )


def update_model(db: Session, model_id: int, model_data):
    model = (
        db.query(models.PCBModel)
        .filter(models.PCBModel.model_id == model_id)
        .first()
    )

    if not model:
        return None

    model.model_name = model_data.model_name
    model.barcode_prefix = model_data.barcode_prefix

    db.commit()
    db.refresh(model)

    return model

def delete_model(db: Session, model_id: int):
    model = (
        db.query(models.PCBModel)
        .filter(models.PCBModel.model_id == model_id)
        .first()
    )

    if not model:
        return None

    parameter_exists = (
        db.query(models.TestParameter)
        .filter(models.TestParameter.model_id == model_id)
        .first()
    )

    if parameter_exists:
        raise ValueError("Cannot delete model. Parameters exist.")

    db.delete(model)
    db.commit()

    return model

def update_parameter(db: Session, parameter_id: int, parameter_data):
    parameter = (
        db.query(models.TestParameter)
        .filter(models.TestParameter.parameter_id == parameter_id)
        .first()
    )

    if not parameter:
        return None

    parameter.param_name = parameter_data.param_name
    parameter.param_code = parameter_data.param_code
    parameter.data_type = parameter_data.data_type
    parameter.min_value = parameter_data.min_value
    parameter.max_value = parameter_data.max_value
    parameter.expected_text = parameter_data.expected_text

    db.commit()
    db.refresh(parameter)

    return parameter


def delete_parameter(db: Session, parameter_id: int):
    parameter = (
        db.query(models.TestParameter)
        .filter(models.TestParameter.parameter_id == parameter_id)
        .first()
    )

    if not parameter:
        return None

    db.delete(parameter)
    db.commit()

    return parameter


def delete_results_by_unit(db: Session, unit_id: int):
    # Delete all test results for this PCB
    db.query(models.TestResult).filter(
        models.TestResult.unit_id == unit_id
    ).delete(synchronize_session=False)

    # Delete the PCB unit itself
    db.query(models.PCBUnit).filter(
        models.PCBUnit.unit_id == unit_id
    ).delete(synchronize_session=False)

    db.commit()

    return True


def delete_results_by_model(db: Session, model_id: int):

    model = (
        db.query(models.PCBModel)
        .filter(models.PCBModel.model_id == model_id)
        .first()
    )

    if not model:
        return None

    units = (
        db.query(models.PCBUnit)
        .filter(models.PCBUnit.model_id == model_id)
        .all()
    )

    for unit in units:
        db.query(models.TestResult).filter(
            models.TestResult.unit_id == unit.unit_id
        ).delete(synchronize_session=False)

    db.query(models.PCBUnit).filter(
        models.PCBUnit.model_id == model_id
    ).delete(synchronize_session=False)

    db.commit()

    return True