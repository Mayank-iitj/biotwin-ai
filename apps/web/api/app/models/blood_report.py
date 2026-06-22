"""Blood report and values models"""
import uuid
import datetime
from sqlalchemy import String, DateTime, Date, Numeric, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class BloodReport(Base):
    __tablename__ = "blood_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    report_date: Mapped[datetime.date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="processing")
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    values: Mapped[list["BloodReportValue"]] = relationship(
        "BloodReportValue",
        back_populates="blood_report",
        cascade="all, delete-orphan"
    )


class BloodReportValue(Base):
    __tablename__ = "blood_report_values"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    blood_report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("blood_reports.id", ondelete="CASCADE"),
        nullable=False
    )
    marker: Mapped[str] = mapped_column(String(50), nullable=False)
    value: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    reference_low: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    reference_high: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)

    blood_report: Mapped["BloodReport"] = relationship("BloodReport", back_populates="values")