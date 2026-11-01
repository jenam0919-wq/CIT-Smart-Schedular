from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any

class FacultyBase(BaseModel):
    name: str
    designation: str
    department: str
    email: str
    weekly_workload_hours: int = 16
    max_workload_hours: int = 18
    max_daily_hours: int = 4
    prefer_morning: bool = True
    preferences: Optional[Dict[str, Any]] = None

class FacultyCreate(FacultyBase):
    pass

class FacultyUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    email: Optional[str] = None
    weekly_workload_hours: Optional[int] = None
    max_workload_hours: Optional[int] = None
    max_daily_hours: Optional[int] = None
    prefer_morning: Optional[bool] = None
    preferences: Optional[Dict[str, Any]] = None

class FacultyResponse(FacultyBase):
    id: str

    model_config = ConfigDict(from_attributes=True)

class FacultyUnavailabilityCreate(BaseModel):
    faculty_id: str
    day: str
    period_id: str
    specific_date: Optional[str] = None
    reason: str
    is_recurrent: bool = True

class FacultyUnavailabilityResponse(FacultyUnavailabilityCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)
