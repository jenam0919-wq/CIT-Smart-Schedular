from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)  # Nullable for broadcast
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    type = Column(String, default="info")  # info, warning, success, alert
    read = Column(Boolean, default=False)
    link_module = Column(String, nullable=True)
    link_sub_page = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
