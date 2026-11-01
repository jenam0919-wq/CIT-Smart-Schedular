from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class Examination(Base):
    __tablename__ = "examinations"

    id = Column(String, primary_key=True, index=True)
    exam_type = Column(String, default="Midsem")  # Midsem, Endsem, Quiz
    date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    day = Column(String, nullable=False)
    time_slot = Column(String, nullable=False)  # '09:30 - 11:30 AM'
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    student_group_name = Column(String, nullable=False)
    enrolled_students = Column(Integer, nullable=False)
    
    # JSON list of allocated rooms: [{room_id, room_name, allocated_seats, invigilator_name}]
    allocated_rooms = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course")
