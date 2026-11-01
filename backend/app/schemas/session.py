from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class TeachingSessionBase(BaseModel):
    course_id: str
    faculty_id: str
    room_id: Optional[str] = None
    day: Optional[str] = None
    period_id: Optional[str] = None
    duration_periods: int = 1
    session_type: str = "Lecture"
    is_fixed_slot: bool = False
    fixed_day: Optional[str] = None
    fixed_period: Optional[str] = None
    is_scheduled: bool = True

class TeachingSessionCreate(TeachingSessionBase):
    group_ids: List[str]

class TeachingSessionResponse(TeachingSessionBase):
    id: str
    course_code: Optional[str] = None
    course_name: Optional[str] = None
    faculty_name: Optional[str] = None
    room_name: Optional[str] = None
    group_names: List[str] = []
    color_tag: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TimetableSlotView(BaseModel):
    id: str
    day: str
    period_id: str
    course_id: str
    course_code: str
    course_name: str
    faculty_id: str
    faculty_name: str
    room_id: str
    room_name: str
    group_id: str
    group_name: str
    session_type: str
    duration_periods: int
    color_tag: str
    periods_occupied: Optional[List[str]] = None
    time_display: Optional[str] = None
    room_reason: Optional[str] = None
    time_reason: Optional[str] = None
    constraint_status: Optional[str] = None
