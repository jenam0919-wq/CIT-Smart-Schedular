from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    designation = Column(String, nullable=False)
    department = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    weekly_workload_hours = Column(Integer, default=16)
    max_workload_hours = Column(Integer, default=18)
    max_daily_hours = Column(Integer, default=4)
    prefer_morning = Column(Boolean, default=True)
    preferences = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    unavailability = relationship("FacultyUnavailability", back_populates="faculty", cascade="all, delete-orphan")
    sessions = relationship("TeachingSession", back_populates="faculty")

class FacultyUnavailability(Base):
    __tablename__ = "faculty_unavailability"

    id = Column(String, primary_key=True, index=True)
    faculty_id = Column(String, ForeignKey("faculty.id"), nullable=False)
    day = Column(String, nullable=False)  # Monday...Friday
    period_id = Column(String, nullable=False)  # P1...P9
    specific_date = Column(String, nullable=True)
    reason = Column(String, nullable=False)  # Medical, Research travel, Steering committee
    is_recurrent = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    faculty = relationship("Faculty", back_populates="unavailability")
