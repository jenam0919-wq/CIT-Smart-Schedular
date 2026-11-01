from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class ChangeRequest(Base):
    __tablename__ = "change_requests"

    id = Column(String, primary_key=True, index=True)
    faculty_id = Column(String, ForeignKey("faculty.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    session_id = Column(String, ForeignKey("teaching_sessions.id"), nullable=True)

    original_day = Column(String, nullable=False)
    original_period = Column(String, nullable=False)
    original_room_name = Column(String, nullable=False)
    original_group_name = Column(String, nullable=False)

    proposed_day = Column(String, nullable=False)
    proposed_period = Column(String, nullable=False)
    proposed_room_name = Column(String, nullable=False)
    proposed_group_name = Column(String, nullable=False)

    reason = Column(String, nullable=False)
    status = Column(String, default="Pending Admin Review")  # Pending Admin Review, Approved, Rejected
    conflict_analysis = Column(JSON, default=dict)
    submitted_date = Column(DateTime, default=datetime.utcnow)

    faculty = relationship("Faculty")
    course = relationship("Course")
