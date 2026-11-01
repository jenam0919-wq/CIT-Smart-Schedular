from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False, index=True)  # e.g., 'CS301'
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    credits = Column(Integer, default=3)
    type = Column(String, default="Lecture")  # Lecture, Lab, Tutorial
    color_tag = Column(String, default="#3B82F6")
    weekly_hours = Column(Integer, default=3)
    is_elective = Column(Boolean, default=False)
    elective_basket = Column(String, nullable=True)  # Preserves elective basket grouping (e.g. 'Basket-A-AI')
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    sessions = relationship("TeachingSession", back_populates="course")
