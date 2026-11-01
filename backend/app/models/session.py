from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class SessionGroupAssociation(Base):
    __tablename__ = "session_group_associations"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("teaching_sessions.id"), nullable=False, index=True)
    group_id = Column(String, ForeignKey("student_groups.id"), nullable=False, index=True)
    is_primary_group = Column(Boolean, default=True)

    session = relationship("TeachingSession", back_populates="group_associations")
    student_group = relationship("StudentGroup", back_populates="sessions")

class TeachingSession(Base):
    __tablename__ = "teaching_sessions"

    id = Column(String, primary_key=True, index=True)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    faculty_id = Column(String, ForeignKey("faculty.id"), nullable=False)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=True)

    # Time slot assignment
    day = Column(String, nullable=True)  # Monday...Friday
    period_id = Column(String, nullable=True)  # P1...P9
    duration_periods = Column(Integer, default=1)  # 1 for lecture, 2 for continuous lab
    session_type = Column(String, default="Lecture")  # Lecture, Lab, Tutorial

    # Fixed slot constraints (e.g., cannot be moved by automated solver)
    is_fixed_slot = Column(Boolean, default=False)
    fixed_day = Column(String, nullable=True)
    fixed_period = Column(String, nullable=True)

    is_scheduled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    course = relationship("Course", back_populates="sessions")
    faculty = relationship("Faculty", back_populates="sessions")
    room = relationship("Room", back_populates="sessions")
    group_associations = relationship("SessionGroupAssociation", back_populates="session", cascade="all, delete-orphan")
