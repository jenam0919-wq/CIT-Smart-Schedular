from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime
from backend.app.database import Base

class Disruption(Base):
    __tablename__ = "disruptions"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)  # Faculty Leave, Room Maintenance, Campus Event, Equipment Failure
    affected_date = Column(String, nullable=False)
    affected_entity = Column(String, nullable=False)
    affected_slots_count = Column(Integer, default=1)
    status = Column(String, default="Unresolved")  # Unresolved, Rescheduled, Under Optimization
    reported_at = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d %H:%M"))
    proposed_resolution = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
