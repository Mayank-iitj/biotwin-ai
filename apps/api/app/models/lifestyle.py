"""Lifestyle and nutrition models"""
import uuid
import datetime
from sqlalchemy import String, DateTime, Date, Numeric, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class LifestyleLog(Base):
    __tablename__ = "lifestyle_logs"

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
    log_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    exercise_minutes: Mapped[int | None] = mapped_column(Numeric(5), nullable=True)
    sleep_hours: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    smoking: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    alcohol_units: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    diet_quality_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )


class NutritionLog(Base):
    __tablename__ = "nutrition_logs"

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
    log_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    calories: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    protein_g: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    carbs_g: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    fat_g: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    sodium_mg: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)


class FamilyHistory(Base):
    __tablename__ = "family_history"

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
    condition: Mapped[str] = mapped_column(String(50), nullable=False)
    relation: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )