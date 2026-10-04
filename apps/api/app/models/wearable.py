"""Wearable data model"""
import uuid
import datetime
from sqlalchemy import String, DateTime, Numeric, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class WearableData(Base):
    __tablename__ = "wearable_data"

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
    recorded_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    metric: Mapped[str] = mapped_column(String(30), nullable=False)
    value: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    source: Mapped[str | None] = mapped_column(String(30), nullable=True)


__table_args__ = (
    Index('idx_wearable_user_time', 'user_id', 'recorded_at'),
)