"""
CIT Smart Scheduler - Scheduling Engine Package
"""

from backend.app.services.scheduling.models import (
    DAYS,
    PERIODS,
    PERIOD_TIMES,
    PERIOD_INDEX,
    INDEX_TO_PERIOD,
    SessionInput,
    RoomInput,
    FacultyInput,
    StudentGroupInput,
    ScheduledAssignment,
    OptimizationResult,
)
from backend.app.services.scheduling.solver import TimetableSolver
from backend.app.services.scheduling.validator import validate_timetable

__all__ = [
    "DAYS",
    "PERIODS",
    "PERIOD_TIMES",
    "PERIOD_INDEX",
    "INDEX_TO_PERIOD",
    "SessionInput",
    "RoomInput",
    "FacultyInput",
    "StudentGroupInput",
    "ScheduledAssignment",
    "OptimizationResult",
    "TimetableSolver",
    "validate_timetable",
]
