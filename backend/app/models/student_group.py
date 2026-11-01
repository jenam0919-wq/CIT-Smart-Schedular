from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class StudentGroup(Base):
    __tablename__ = "student_groups"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)  # e.g., 'CSE-3A'
    department = Column(String, nullable=False)
    semester = Column(Integer, nullable=False)
    strength = Column(Integer, nullable=False)
    class_representative = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships via association
    sessions = relationship("SessionGroupAssociation", back_populates="student_group")
