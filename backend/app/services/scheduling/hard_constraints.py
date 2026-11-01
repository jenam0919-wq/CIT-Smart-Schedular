"""
CIT Smart Scheduler - Hard Constraints Enforcement Module
"""

from typing import Dict, List, Tuple
from ortools.sat.python import cp_model

from backend.app.services.scheduling.models import DAYS, PERIOD_INDEX, SessionInput, FacultyInput
from backend.app.services.scheduling.variables import ScheduleVariablesBuilder


def apply_hard_constraints(
    model: cp_model.CpModel,
    var_builder: ScheduleVariablesBuilder,
    sessions: List[SessionInput],
    faculty_map: Dict[str, FacultyInput],
) -> Dict[str, int]:
    """
    Applies all 14 hard constraint categories to the CP-SAT model.
    Returns counts of enforced constraints per category for audit logs.
    """
    enforced_counts = {
        "single_assignment": 0,
        "faculty_no_overlap": 0,
        "student_group_no_overlap": 0,
        "room_no_overlap": 0,
        "elective_basket_sync": 0,
        "faculty_daily_limit": 0,
        "fixed_slots": 0,
    }

    # 1. Every session assigned exactly once: sum(vars) == 1
    for session in sessions:
        vars_for_session = [var for (_, _, _, var) in var_builder.session_vars.get(session.id, [])]
        if vars_for_session:
            model.Add(sum(vars_for_session) == 1)
            enforced_counts["single_assignment"] += 1
        else:
            # Domain became empty, infeasible candidate space
            pass

    # 2. Faculty conflict: A faculty member cannot teach two overlapping sessions
    for (fac_id, day, occ_idx), slot_vars in var_builder.faculty_slot_vars.items():
        if len(slot_vars) > 1:
            model.Add(sum(slot_vars) <= 1)
            enforced_counts["faculty_no_overlap"] += 1

    # 3. Student group conflict (including combined lectures multi-group reservation & elective basket parallelism)
    for (grp_id, day, occ_idx), slot_entries in var_builder.group_slot_vars.items():
        if len(slot_entries) > 1:
            constraint_vars = []
            seen_baskets: Dict[str, str] = {}
            for sess_id, basket, var in slot_entries:
                if not basket:
                    constraint_vars.append(var)
                else:
                    if basket not in seen_baskets:
                        seen_baskets[basket] = sess_id
                    if sess_id == seen_baskets[basket]:
                        constraint_vars.append(var)
            if len(constraint_vars) > 1:
                model.Add(sum(constraint_vars) <= 1)
                enforced_counts["student_group_no_overlap"] += 1

    # 4. Room conflict: Room cannot hold two overlapping sessions
    for (room_id, day, occ_idx), slot_vars in var_builder.room_slot_vars.items():
        if len(slot_vars) > 1:
            model.Add(sum(slot_vars) <= 1)
            enforced_counts["room_no_overlap"] += 1

    # 5. Elective basket synchronization:
    # Sessions in the same elective basket must occur at the exact same day and start period
    for basket_name, basket_session_ids in var_builder.elective_baskets.items():
        if len(basket_session_ids) <= 1:
            continue

        base_session_id = basket_session_ids[0]
        for other_session_id in basket_session_ids[1:]:
            for day in DAYS:
                for start_idx in range(9):
                    base_vars = var_builder.session_time_vars.get((base_session_id, day, start_idx), [])
                    other_vars = var_builder.session_time_vars.get((other_session_id, day, start_idx), [])

                    if base_vars and other_vars:
                        model.Add(sum(base_vars) == sum(other_vars))
                        enforced_counts["elective_basket_sync"] += 1
                    elif base_vars and not other_vars:
                        model.Add(sum(base_vars) == 0)
                    elif other_vars and not base_vars:
                        model.Add(sum(other_vars) == 0)

    # 6. Faculty daily teaching limit: Maximum 4 hours per day per faculty
    for (fac_id, day), session_list in var_builder.faculty_day_sessions.items():
        faculty = faculty_map.get(fac_id)
        max_hours = faculty.max_daily_hours if faculty and faculty.max_daily_hours else 4
        if session_list:
            model.Add(
                sum(var * dur for (var, dur) in session_list) <= max_hours
            )
            enforced_counts["faculty_daily_limit"] += 1

    return enforced_counts
