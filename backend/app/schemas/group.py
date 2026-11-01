from pydantic import BaseModel, ConfigDict
from typing import Optional

class StudentGroupBase(BaseModel):
    name: str
    department: str
    semester: int
    strength: int
    class_representative: Optional[str] = None

class StudentGroupCreate(StudentGroupBase):
    pass

class StudentGroupUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    strength: Optional[int] = None
    class_representative: Optional[str] = None

class StudentGroupResponse(StudentGroupBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
