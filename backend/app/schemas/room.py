from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any

class RoomBase(BaseModel):
    name: str
    code: str
    block: str
    floor: int = 1
    type: str
    capacity: int
    exam_capacity: int
    has_projector: bool = True
    has_audio_system: bool = True
    has_air_conditioning: bool = True
    is_accessible: bool = True
    features: Optional[Dict[str, Any]] = None

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    exam_capacity: Optional[int] = None
    has_projector: Optional[bool] = None
    has_audio_system: Optional[bool] = None
    has_air_conditioning: Optional[bool] = None
    is_accessible: Optional[bool] = None
    is_available_now: Optional[bool] = None

class RoomResponse(RoomBase):
    id: str
    is_available_now: bool = True

    model_config = ConfigDict(from_attributes=True)

class RoomUnavailabilityCreate(BaseModel):
    room_id: str
    day: Optional[str] = None
    period_id: Optional[str] = None
    specific_date: Optional[str] = None
    reason: str
    is_recurrent: bool = False
