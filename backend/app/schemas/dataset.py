from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class DatasetImportReport(BaseModel):
    success: bool
    message: str
    imported_rooms: int = 0
    imported_faculty: int = 0
    imported_groups: int = 0
    imported_courses: int = 0
    imported_sessions: int = 0
    imported_bookings: int = 0
    errors: List[str] = []

class DatasetStatusResponse(BaseModel):
    is_dataset_loaded: bool
    dataset_version: Optional[str] = None
    rooms_count: int
    faculty_count: int
    groups_count: int
    courses_count: int
    sessions_count: int
    bookings_count: int
    last_updated: Optional[str] = None
