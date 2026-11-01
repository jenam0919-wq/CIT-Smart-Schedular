from pydantic import BaseModel, ConfigDict
from typing import Optional

class CourseBase(BaseModel):
    code: str
    title: str
    department: str
    credits: int = 3
    type: str = "Lecture"
    color_tag: str = "#3B82F6"
    weekly_hours: int = 3
    is_elective: bool = False
    elective_basket: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    code: Optional[str] = None
    title: Optional[str] = None
    department: Optional[str] = None
    credits: Optional[int] = None
    type: Optional[str] = None
    color_tag: Optional[str] = None
    weekly_hours: Optional[int] = None
    is_elective: Optional[bool] = None
    elective_basket: Optional[str] = None

class CourseResponse(CourseBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
