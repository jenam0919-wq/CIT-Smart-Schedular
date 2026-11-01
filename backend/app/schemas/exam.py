from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any

class AllocatedRoomView(BaseModel):
    room_id: str
    room_name: str
    allocated_seats: int
    invigilator: str

class ExaminationResponse(BaseModel):
    id: str
    exam_type: str
    date: str
    day: str
    time_slot: str
    course_id: str
    course_code: Optional[str] = None
    course_title: Optional[str] = None
    student_group: str
    enrolled_students: int
    allocated_rooms: List[Dict[str, Any]] = []

    model_config = ConfigDict(from_attributes=True)

class ExaminationCreate(BaseModel):
    exam_type: str = "Midsem"
    date: str
    day: str
    time_slot: str = "09:30 - 11:30 AM"
    course_id: str
    student_group_name: str
    enrolled_students: int = 60
    allocated_rooms: List[Dict[str, Any]] = []

class ExaminationUpdate(BaseModel):
    exam_type: Optional[str] = None
    date: Optional[str] = None
    day: Optional[str] = None
    time_slot: Optional[str] = None
    course_id: Optional[str] = None
    student_group_name: Optional[str] = None
    enrolled_students: Optional[int] = None
    allocated_rooms: Optional[List[Dict[str, Any]]] = None

class ExamGenerateRequest(BaseModel):
    start_date: str
    end_date: str
    slot_morning: str = "09:30 - 11:30 AM"
    slot_afternoon: str = "02:00 - 04:00 PM"
    alternate_seating: bool = True
