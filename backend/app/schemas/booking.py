from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class BookingRequestBase(BaseModel):
    event_title: str
    event_category: str = "Workshop"
    room_id: str
    date: str  # YYYY-MM-DD
    start_time: str
    end_time: str
    period_ids: List[str] = []
    expected_attendees: int
    mandatory_student_groups: List[str] = []
    description: Optional[str] = None
    requires_av: bool = True
    requires_ac: bool = True
    is_spectra_week: bool = False

class BookingRequestCreate(BookingRequestBase):
    pass

class BookingDecisionRequest(BaseModel):
    reason: Optional[str] = None
    alternative_suggestion: Optional[str] = None

class BookingRequestResponse(BookingRequestBase):
    id: str
    requested_by_id: str
    requester_name: str
    requester_role: str
    requester_email: str
    club_or_dept: str
    room_name: Optional[str] = None
    status: str
    decision_reason: Optional[str] = None
    alternative_suggestion: Optional[str] = None
    priority_score: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
