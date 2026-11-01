from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String, primary_key=True, index=True)
    entity_type = Column(String, nullable=False)  # booking, reschedule, disruption
    entity_id = Column(String, nullable=False, index=True)
    approver_id = Column(String, ForeignKey("users.id"), nullable=False)
    decision = Column(String, nullable=False)  # Approved, Rejected, Escalated
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    approver = relationship("User")
