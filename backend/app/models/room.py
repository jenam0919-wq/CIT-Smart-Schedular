from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    code = Column(String, nullable=False)
    block = Column(String, nullable=False)
    floor = Column(Integer, default=1)
    type = Column(String, nullable=False)  # Lecture Hall, Computer Lab, Hardware Lab, Seminar Hall, Auditorium, Workshop
    capacity = Column(Integer, nullable=False)
    exam_capacity = Column(Integer, nullable=False)
    has_projector = Column(Boolean, default=True)
    has_audio_system = Column(Boolean, default=True)
    has_air_conditioning = Column(Boolean, default=True)
    is_accessible = Column(Boolean, default=True)
    features = Column(JSON, default=dict)  # accessibility details, specialized equipment
    is_available_now = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    unavailability = relationship("RoomUnavailability", back_populates="room", cascade="all, delete-orphan")
    sessions = relationship("TeachingSession", back_populates="room")
    bookings = relationship("BookingRequest", back_populates="room")

class RoomUnavailability(Base):
    __tablename__ = "room_unavailability"

    id = Column(String, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    day = Column(String, nullable=True)  # Monday...Friday or None if date-specific
    period_id = Column(String, nullable=True)  # P1...P9 or None for full day
    start_time = Column(String, nullable=True)
    end_time = Column(String, nullable=True)
    specific_date = Column(String, nullable=True)
    reason = Column(String, nullable=False)  # Maintenance window, Dean reserve, Renovation
    is_recurrent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    room = relationship("Room", back_populates="unavailability")
