from pydantic import BaseModel, ConfigDict
from typing import Optional

class DisruptionBase(BaseModel):
    title: str
    type: str  # Faculty Leave, Room Maintenance, Campus Event, Equipment Failure
    affected_date: str
    affected_entity: str
    affected_slots_count: int = 1
    status: str = "Unresolved"  # Unresolved, Rescheduled, Under Optimization
    proposed_resolution: Optional[str] = None

class DisruptionCreate(DisruptionBase):
    pass

class DisruptionResponse(DisruptionBase):
    id: str
    reported_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
