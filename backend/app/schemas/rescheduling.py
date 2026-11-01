from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class ChangeRequestCreate(BaseModel):
    course_code: str
    original_day: str
    original_period: str
    original_room_name: str
    original_group_name: str
    proposed_day: str
    proposed_period: str
    proposed_room_name: str
    proposed_group_name: str
    reason: str

class ChangeRequestResponse(BaseModel):
    id: str
    faculty_id: str
    faculty_name: Optional[str] = None
    course_code: str
    original_slot: Dict[str, str]
    proposed_slot: Dict[str, str]
    reason: str
    status: str
    conflict_analysis: Dict[str, Any]
    submitted_date: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
