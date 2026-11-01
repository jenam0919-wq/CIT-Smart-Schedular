"""
CIT Smart Scheduler - Scheduling Engine Data Models
"""

from dataclasses import dataclass, field
from typing import Dict, List, Set, Tuple, Optional, Any


DAYS: List[str] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
PERIODS: List[str] = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9"]

PERIOD_TIMES: Dict[str, str] = {
    "P1": "08:00 - 09:00",
    "P2": "09:00 - 10:00",
    "P3": "10:00 - 11:00",
    "P4": "11:00 - 12:00",
    "P5": "12:00 - 13:00",
    "Lunch": "13:00 - 14:00 (Break)",
    "P6": "14:00 - 15:00",
    "P7": "15:00 - 16:00",
    "P8": "16:00 - 17:00",
    "P9": "17:00 - 18:00",
}

PERIOD_INDEX: Dict[str, int] = {p: i for i, p in enumerate(PERIODS)}
INDEX_TO_PERIOD: Dict[int, str] = {i: p for i, p in enumerate(PERIODS)}

# Lunch break occurs between P5 (index 4, 12:00-13:00) and P6 (index 5, 14:00-15:00)
# A session cannot cross this boundary.


@dataclass
class RoomInput:
    id: str
    name: str
    code: str
    block: str
    floor: int
    type: str  # Lecture Hall, Computer Lab, Hardware Lab, Seminar Hall, Auditorium, Workshop
    capacity: int
    is_accessible: bool = True
    features: Dict[str, Any] = field(default_factory=dict)
    unavailable_slots: Set[Tuple[str, str]] = field(default_factory=set)  # (day, period_id)


@dataclass
class FacultyInput:
    id: str
    name: str
    department: str
    prefer_morning: bool = True
    max_daily_hours: int = 4
    unavailable_slots: Set[Tuple[str, str]] = field(default_factory=set)  # (day, period_id)


@dataclass
class StudentGroupInput:
    id: str
    name: str
    strength: int
    department: str
    semester: int


@dataclass
class SessionInput:
    id: str
    course_id: str
    course_code: str
    course_title: str
    course_type: str  # Lecture, Lab, Tutorial
    faculty_id: str
    faculty_name: str
    group_ids: List[str]
    group_names: List[str]
    total_students: int
    duration_periods: int = 1  # 1 for lecture, 3 for lab blocks
    session_type: str = "Lecture"
    is_fixed_slot: bool = False
    fixed_day: Optional[str] = None
    fixed_period: Optional[str] = None
    elective_basket: Optional[str] = None
    requires_accessible: bool = False


@dataclass
class ScheduledAssignment:
    session_id: str
    course_id: str
    course_code: str
    course_title: str
    course_type: str
    faculty_id: str
    faculty_name: str
    group_ids: List[str]
    group_names: List[str]
    total_students: int
    room_id: str
    room_name: str
    room_type: str
    room_capacity: int
    day: str
    start_period: str
    end_period: str
    duration_periods: int
    periods_occupied: List[str]
    time_display: str
    room_reason: str
    time_reason: str
    constraint_status: str
    soft_penalty_breakdown: Dict[str, Any] = field(default_factory=dict)


@dataclass
class OptimizationResult:
    status: str  # OPTIMAL, FEASIBLE, INFEASIBLE, TIMEOUT
    is_clash_free: bool
    total_sessions: int
    scheduled_sessions: int
    total_teaching_hours: int
    solver_time_seconds: float
    hard_conflicts_count: int
    soft_penalty_score: int
    metrics: Dict[str, Any]
    schedule: List[ScheduledAssignment]
    unassigned_sessions: List[str] = field(default_factory=list)
    validation_summary: Dict[str, Any] = field(default_factory=dict)
