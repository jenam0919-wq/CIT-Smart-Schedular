"""
CIT Smart Scheduler - Soft Constraints and Penalty Minimization Module
"""

from typing import Dict, List, Tuple, Any
from ortools.sat.python import cp_model

from backend.app.services.scheduling.models import DAYS, SessionInput, RoomInput, FacultyInput
from backend.app.services.scheduling.variables import ScheduleVariablesBuilder


class SoftConstraintsBuilder:
    def __init__(
        self,
        model: cp_model.CpModel,
        var_builder: ScheduleVariablesBuilder,
        sessions: List[SessionInput],
        rooms_map: Dict[str, RoomInput],
        faculty_map: Dict[str, FacultyInput],
        weights: Dict[str, int] = None,
    ):
        self.model = model
        self.var_builder = var_builder
        self.sessions = sessions
        self.rooms_map = rooms_map
        self.faculty_map = faculty_map

        # Configurable penalty weights
        default_weights = {
            "faculty_time_preference": 3,
            "p9_late_slot": 5,
            "room_underutilization": 2,
            "student_daily_excess": 10,
            "same_day_duplicate_lecture": 4,
        }
        self.weights = {**default_weights, **(weights or {})}
        self.penalty_terms: List[Tuple[cp_model.IntVar, int, str]] = []

    def build_soft_penalties(self) -> List[Tuple[cp_model.IntVar, int, str]]:
        """
        Builds all soft penalty terms for the objective function.
        Returns list of (variable, weight, category_name).
        """
        # 1. Faculty preferred time violations & P9 late slot & Room underutilization
        for session in self.sessions:
            faculty = self.faculty_map.get(session.faculty_id)
            prefer_morning = faculty.prefer_morning if faculty else True

            for day, start_idx, room_id, var in self.var_builder.session_vars.get(session.id, []):
                room = self.rooms_map.get(room_id)

                # A. Faculty preference penalty
                # Morning: 0..4 (P1..P5), Afternoon: 5..8 (P6..P9)
                is_afternoon = start_idx >= 5
                if prefer_morning and is_afternoon:
                    self.penalty_terms.append(
                        (var, self.weights["faculty_time_preference"], "faculty_preference")
                    )
                elif not prefer_morning and not is_afternoon:
                    self.penalty_terms.append(
                        (var, self.weights["faculty_time_preference"], "faculty_preference")
                    )

                # B. P9 late slot penalty (17:00 - 18:00)
                if start_idx == 8 or (start_idx + session.duration_periods - 1) == 8:
                    self.penalty_terms.append(
                        (var, self.weights["p9_late_slot"], "p9_late_slot")
                    )

                # C. Room underutilization penalty (< 40% capacity used)
                if room and room.capacity > 0:
                    utilization = session.total_students / float(room.capacity)
                    if utilization < 0.40 and room.capacity >= 80:
                        self.penalty_terms.append(
                            (var, self.weights["room_underutilization"], "room_underutilization")
                        )

        # 2. Student group daily excessive hours (> 6 hours)
        for (gid, day), session_list in self.var_builder.group_day_sessions.items():
            if not session_list:
                continue

            # Linear relaxation / slack variable for daily hours > 6
            # excess_var >= sum(var * dur) - 6
            excess_var = self.model.NewIntVar(0, 9, f"excess_{gid}_{day}")
            total_hours = sum(var * dur for (var, dur) in session_list)
            self.model.Add(excess_var >= total_hours - 6)
            self.penalty_terms.append(
                (excess_var, self.weights["student_daily_excess"], "student_daily_excess")
            )

        # 3. Same-day duplicate lectures for same course & student group
        # Group sessions by (course_id, group_id, day)
        course_group_sessions: Dict[Tuple[str, str, str], List[cp_model.IntVar]] = {}
        for session in self.sessions:
            if session.session_type != "Lecture":
                continue  # Labs naturally stay as block
            for day, start_idx, room_id, var in self.var_builder.session_vars.get(session.id, []):
                for gid in session.group_ids:
                    course_group_sessions.setdefault((session.course_id, gid, day), []).append(var)

        for key, vars_list in course_group_sessions.items():
            if len(vars_list) > 1:
                dup_var = self.model.NewIntVar(0, 5, f"dup_{key[0]}_{key[1]}_{key[2]}")
                self.model.Add(dup_var >= sum(vars_list) - 1)
                self.penalty_terms.append(
                    (dup_var, self.weights["same_day_duplicate_lecture"], "same_day_duplicate")
                )

        return self.penalty_terms
