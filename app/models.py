from sqlalchemy import (
    Column,
    Integer,
    BigInteger,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Numeric
)
from sqlalchemy.sql import func
from app.database import Base


class PCBModel(Base):
    __tablename__ = "pcb_models"

    model_id = Column(Integer, primary_key=True, index=True)
    model_code = Column(String(50), unique=True, nullable=False)
    model_name = Column(String(100), nullable=False)
    barcode_prefix = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import relationship

class TestParameter(Base):
    __tablename__ = "test_parameters"

    parameter_id = Column(Integer, primary_key=True, index=True)

    model_id = Column(
        Integer,
        ForeignKey("pcb_models.model_id"),
        nullable=False
    )

    param_code = Column(String(50), nullable=False)

    param_name = Column(String(100), nullable=False)

    data_type = Column(String(10), nullable=False)

    unit = Column(String(20))

    min_value = Column(Numeric)

    max_value = Column(Numeric)

    expected_text = Column(String(100))

    is_mandatory = Column(Boolean, default=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    model = relationship("PCBModel")

class PCBUnit(Base):
    __tablename__ = "pcb_units"

    unit_id = Column(BigInteger, primary_key=True, index=True)

    serial_number = Column(String(100), unique=True, nullable=False)

    model_id = Column(
        Integer,
        ForeignKey("pcb_models.model_id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    model = relationship("PCBModel")

class TestResult(Base):
    __tablename__ = "test_results"

    result_id = Column(BigInteger, primary_key=True, index=True)

    unit_id = Column(
        BigInteger,
        ForeignKey("pcb_units.unit_id"),
        nullable=False
    )

    parameter_id = Column(
        Integer,
        ForeignKey("test_parameters.parameter_id"),
        nullable=False
    )

    tested_at = Column(DateTime(timezone=True), nullable=False)

    jig_id = Column(String(50))

    operator_id = Column(String(50))

    value_numeric = Column(Numeric)

    value_text = Column(String(200))

    passed = Column(Boolean, nullable=False)

    jig_overall_result = Column(String(20))

    unit = relationship("PCBUnit")
    parameter = relationship("TestParameter")