from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime
from backend.app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    actor_id = Column(String, nullable=False, index=True)
    actor_name = Column(String, nullable=False)
    action = Column(String, nullable=False, index=True)  # DATASET_IMPORT, TIMETABLE_GENERATE, BOOKING_SUBMIT, BOOKING_APPROVE, BOOKING_REJECT, RESCHEDULE_PROPOSE, RESCHEDULE_APPROVE, DEMO_RESET
    entity_type = Column(String, nullable=False)        # session, booking, dataset, exam, user
    entity_id = Column(String, nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
