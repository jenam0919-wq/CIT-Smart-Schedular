from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class BookingRequest(Base):
    __tablename__ = "booking_requests"

    id = Column(String, primary_key=True, index=True)
    event_title = Column(String, nullable=False, index=True)
    event_category = Column(String, default="Workshop")  # Fest, Workshop, Meeting, Guest Lecture, Exam
    requested_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    requester_name = Column(String, nullable=False)
    requester_role = Column(String, nullable=False)
    requester_email = Column(String, nullable=False)
    club_or_dept = Column(String, nullable=False)
    
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    start_time = Column(String, nullable=False)  # HH:MM
    end_time = Column(String, nullable=False)    # HH:MM
    period_ids = Column(JSON, default=list)      # ['P7', 'P8']
    
    expected_attendees = Column(Integer, nullable=False)
    mandatory_student_groups = Column(JSON, default=list)  # Groups required to attend
    description = Column(String, nullable=True)
    requires_av = Column(Boolean, default=True)
    requires_ac = Column(Boolean, default=True)
    is_spectra_week = Column(Boolean, default=False)
    priority_score = Column(Integer, default=50)

    # Workflow & Decision
    status = Column(String, default="Pending", index=True)  # Pending, Approved, Rejected, Cancelled
    decision_reason = Column(String, nullable=True)
    alternative_suggestion = Column(String, nullable=True)
    approved_by_id = Column(String, ForeignKey("users.id"), nullable=True)
    decision_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    room = relationship("Room", back_populates="bookings")
    requester = relationship("User", foreign_keys=[requested_by_id])
    approver = relationship("User", foreign_keys=[approved_by_id])
