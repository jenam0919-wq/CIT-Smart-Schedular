from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    title: str
    description: str
    type: str = "info"  # info, warning, success, alert
    read: bool = False
    link_module: Optional[str] = None
    link_sub_page: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: Optional[str] = None

class NotificationResponse(NotificationBase):
    id: str
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None
    time: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
