from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON
from datetime import datetime
from backend.app.database import Base

class TimetableVersion(Base):
    __tablename__ = "timetable_versions"

    id = Column(String, primary_key=True, index=True)
    version_name = Column(String, nullable=False)
    academic_term = Column(String, default="Fall 2026 (Semester VII)")
    is_active = Column(Boolean, default=True)
    satisfaction_score = Column(Float, default=99.4)
    total_sessions = Column(Integer, default=189)
    conflicts_count = Column(Integer, default=0)
    solver_metrics = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
