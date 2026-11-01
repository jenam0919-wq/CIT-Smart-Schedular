"""
CIT Smart Scheduler - Candidate Domain Pruning and CP-SAT Decision Variables
"""

from typing import Dict, List, Tuple, Set, Any
from ortools.sat.python import cp_model

from backend.app.services.scheduling.models import (
    DAYS,
    PERIODS,
    PERIOD_INDEX,
    INDEX_TO_PERIOD,
    SessionInput,
    RoomInput,
    FacultyInput,
    StudentGroupInput,
)


def get_valid_start_period_indices(duration_periods: int) -> List[int]:
    """
    Returns valid start period indices for a given session duration,
    strictly respecting the 13:00-14:00 lunch break and 3-hour lab rules.
    """
    if duration_periods == 1:
        # P1..P9 (indices 0..8)
        return list(range(9))
    elif duration_periods == 2:
        # Morning: P1, P2, P3, P4 (end by 13:00)
        # Afternoon: P6, P7, P8 (P6: 14:00-16:00, P7: 15:00-17:00, P8: 16:00-18:00)
        # P5 is excluded because it would cross lunch (13:00-14:00)
        return [0, 1, 2, 3, 5, 6, 7]
    elif duration_periods == 3:
        # 3-hour lab rules:
        # Only P2 (09:00 - 12:00, periods P2, P3, P4) or P6 (14:00 - 17:00, periods P6, P7, P8)
        return [1, 5]
    else:
        # Fallback for arbitrary duration
        valid = []
        for p in range(9):
            end_p = p + duration_periods - 1
            if p <= 4 and end_p <= 4:
                valid.append(p)
            elif p >= 5 and end_p <= 8:
                valid.append(p)
        return valid


def is_room_type_compatible(session: SessionInput, room: RoomInput) -> bool:
    """
    Checks compatibility between session requirements and room type.
    Strictly separates practical laboratory/workshop venues from theory lecture halls.
    """
    sess_type = (session.session_type or "Lecture").lower()
    crs_type = (session.course_type or "Lecture").lower()
    rm_type = (room.type or "").lower()

    is_lab = ("lab" in sess_type) or ("lab" in crs_type)

    if is_lab:
        # Practical labs must be held in Computer Lab, Hardware Lab, or Workshop
        return ("lab" in rm_type) or ("workshop" in rm_type)
    elif "tutorial" in sess_type:
        # Tutorial can be in Lecture Hall or Seminar Hall
        return ("lecture hall" in rm_type) or ("seminar" in rm_type)
    else:
        # Theory lectures strictly in Lecture Hall, Seminar Hall, or Auditorium
        return ("lecture hall" in rm_type) or ("seminar hall" in rm_type) or ("auditorium" in rm_type)



class ScheduleVariablesBuilder:
    def __init__(
        self,
        model: cp_model.CpModel,
        sessions: List[SessionInput],
        rooms: List[RoomInput],
        faculty_map: Dict[str, FacultyInput],
        groups_map: Dict[str, StudentGroupInput],
    ):
        self.model = model
        self.sessions = sessions
        self.rooms = rooms
        self.rooms_map = {r.id: r for r in rooms}
        self.faculty_map = faculty_map
        self.groups_map = groups_map

        # Primary decision variables:
        # session_vars[session_id] -> list of (day, start_p_idx, room_id, var)
        self.session_vars: Dict[str, List[Tuple[str, int, str, cp_model.IntVar]]] = {}

        # Period occupancy lookups for conflict enforcement:
        # Key: (faculty_id, day, period_idx) -> list of var
        self.faculty_slot_vars: Dict[Tuple[str, str, int], List[cp_model.IntVar]] = {}

        # Key: (group_id, day, period_idx) -> list of (session_id, elective_basket, var)
        self.group_slot_vars: Dict[Tuple[str, str, int], List[Tuple[str, Any, cp_model.IntVar]]] = {}

        # Key: (room_id, day, period_idx) -> list of var
        self.room_slot_vars: Dict[Tuple[str, str, int], List[cp_model.IntVar]] = {}

        # Key: (faculty_id, day) -> list of (var, duration)
        self.faculty_day_sessions: Dict[Tuple[str, str], List[Tuple[cp_model.IntVar, int]]] = {}

        # Key: (group_id, day) -> list of (var, duration)
        self.group_day_sessions: Dict[Tuple[str, str], List[Tuple[cp_model.IntVar, int]]] = {}

        # Key: (session_id, day, period_idx) -> list of var (across rooms)
        self.session_time_vars: Dict[Tuple[str, str, int], List[cp_model.IntVar]] = {}

        # Grouping by elective basket: basket_name -> list of session_id
        self.elective_baskets: Dict[str, List[str]] = {}

    def build_variables(self) -> None:
        """Prunes domains and instantiates decision variables."""
        for session in self.sessions:
            self.session_vars[session.id] = []
            faculty = self.faculty_map.get(session.faculty_id)

            if session.elective_basket:
                self.elective_baskets.setdefault(session.elective_basket, []).append(session.id)

            # Determine candidate rooms
            candidate_rooms = []
            for room in self.rooms:
                if not is_room_type_compatible(session, room):
                    continue
                if room.capacity < session.total_students:
                    continue
                if session.requires_accessible and not room.is_accessible:
                    continue
                candidate_rooms.append(room)

            # Fallback ensuring room type compatibility is never violated
            if not candidate_rooms:
                compatible_type_rooms = [
                    r for r in self.rooms if is_room_type_compatible(session, r)
                ]
                if compatible_type_rooms:
                    # Pick highest capacity rooms of compatible type
                    candidate_rooms = sorted(compatible_type_rooms, key=lambda r: r.capacity, reverse=True)[:5]
                else:
                    candidate_rooms = [
                        r for r in self.rooms if r.capacity >= session.total_students
                    ] or self.rooms[:3]


            # Determine valid start periods based on session duration
            valid_start_indices = get_valid_start_period_indices(session.duration_periods)

            # Determine valid days
            valid_days = DAYS
            if session.is_fixed_slot and session.fixed_day:
                valid_days = [session.fixed_day] if session.fixed_day in DAYS else DAYS

            if session.is_fixed_slot and session.fixed_period:
                if session.fixed_period in PERIOD_INDEX:
                    fixed_idx = PERIOD_INDEX[session.fixed_period]
                    if fixed_idx in valid_start_indices:
                        valid_start_indices = [fixed_idx]

            # Generate variables
            for day in valid_days:
                for start_idx in valid_start_indices:
                    # Check faculty unavailability across occupied periods
                    occupied_indices = [start_idx + k for k in range(session.duration_periods)]
                    has_faculty_unavail = False
                    if faculty:
                        for occ_idx in occupied_indices:
                            period_code = INDEX_TO_PERIOD[occ_idx]
                            if (day, period_code) in faculty.unavailable_slots:
                                has_faculty_unavail = True
                                break
                    if has_faculty_unavail:
                        continue

                    for room in candidate_rooms:
                        # Check room unavailability across occupied periods
                        has_room_unavail = False
                        for occ_idx in occupied_indices:
                            period_code = INDEX_TO_PERIOD[occ_idx]
                            if (day, period_code) in room.unavailable_slots:
                                has_room_unavail = True
                                break
                        if has_room_unavail:
                            continue

                        # Create binary decision variable
                        var_name = f"x_{session.id}_{day}_{INDEX_TO_PERIOD[start_idx]}_{room.id}"
                        var = self.model.NewBoolVar(var_name)

                        self.session_vars[session.id].append((day, start_idx, room.id, var))

                        # Register in time lookup
                        self.session_time_vars.setdefault((session.id, day, start_idx), []).append(var)

                        # Register in faculty daily workload
                        self.faculty_day_sessions.setdefault((session.faculty_id, day), []).append(
                            (var, session.duration_periods)
                        )

                        # Register in student groups daily workload
                        for gid in session.group_ids:
                            self.group_day_sessions.setdefault((gid, day), []).append(
                                (var, session.duration_periods)
                            )

                        # Register in period occupancy maps for clash prevention
                        for occ_idx in occupied_indices:
                            # Faculty slot
                            self.faculty_slot_vars.setdefault(
                                (session.faculty_id, day, occ_idx), []
                            ).append(var)

                            # Room slot
                            self.room_slot_vars.setdefault(
                                (room.id, day, occ_idx), []
                            ).append(var)

                            # Group slot (stores session_id, elective_basket, var)
                            for gid in session.group_ids:
                                self.group_slot_vars.setdefault(
                                    (gid, day, occ_idx), []
                                ).append((session.id, session.elective_basket, var))
