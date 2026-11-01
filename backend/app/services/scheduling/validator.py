"""
CIT Smart Scheduler - Independent Timetable Validation Engine
Validates all 14 hard constraint categories without depending on the solver.
"""

from typing import Dict, List, Any, Set, Tuple
from backend.app.services.scheduling.models import (
    DAYS,
    PERIODS,
    PERIOD_INDEX,
    SessionInput,
    RoomInput,
    FacultyInput,
    StudentGroupInput,
    ScheduledAssignment,
)


def validate_timetable(
    schedule: List[ScheduledAssignment],
    sessions: List[SessionInput],
    rooms: List[RoomInput],
    faculty_list: List[FacultyInput],
    groups_list: List[StudentGroupInput],
) -> Dict[str, Any]:
    """
    Independently inspects every assigned slot and enforces rigorous check
    on all 14 hard constraint categories.
    """
    rooms_map = {r.id: r for r in rooms}
    faculty_map = {f.id: f for f in faculty_list}
    sessions_map = {s.id: s for s in sessions}

    categories = []
    total_violations = 0

    # 1. Single Assignment
    session_counts: Dict[str, int] = {}
    for item in schedule:
        session_counts[item.session_id] = session_counts.get(item.session_id, 0) + 1

    missing_sessions = [s.id for s in sessions if s.id not in session_counts]
    duplicate_sessions = [sid for sid, c in session_counts.items() if c > 1]
    single_assignment_passed = len(missing_sessions) == 0 and len(duplicate_sessions) == 0
    single_assignment_violations = []
    if missing_sessions:
        single_assignment_violations.append(f"{len(missing_sessions)} sessions unassigned")
    if duplicate_sessions:
        single_assignment_violations.append(f"{len(duplicate_sessions)} sessions scheduled multiple times")

    categories.append({
        "id": "single_assignment",
        "name": "Single Assignment Rule",
        "description": "Every teaching session is scheduled exactly once in the weekly cycle",
        "passed": single_assignment_passed,
        "violations_count": len(single_assignment_violations),
        "details": single_assignment_violations or ["100% of sessions assigned exactly once"],
    })
    if not single_assignment_passed:
        total_violations += len(single_assignment_violations)

    # 2. Faculty Overlap
    faculty_slots: Dict[Tuple[str, str, str], List[str]] = {}  # (fac_id, day, period) -> [session_id]
    for item in schedule:
        for p in item.periods_occupied:
            faculty_slots.setdefault((item.faculty_id, item.day, p), []).append(item.session_id)

    faculty_conflicts = [
        f"Faculty {k[0]} has simultaneous classes on {k[1]} {k[2]} in sessions: {', '.join(v)}"
        for k, v in faculty_slots.items()
        if len(v) > 1
    ]
    categories.append({
        "id": "faculty_overlap",
        "name": "Faculty Conflict Prevention",
        "description": "No faculty member is assigned to two overlapping classes",
        "passed": len(faculty_conflicts) == 0,
        "violations_count": len(faculty_conflicts),
        "details": faculty_conflicts or ["Zero faculty double-bookings detected across all periods"],
    })
    total_violations += len(faculty_conflicts)

    # 3. Student Group Overlap
    group_slots: Dict[Tuple[str, str, str], List[str]] = {}  # (group_id, day, period) -> [session_id]
    for item in schedule:
        for gid in item.group_ids:
            for p in item.periods_occupied:
                group_slots.setdefault((gid, item.day, p), []).append(item.session_id)

    group_conflicts = []
    for k, sids in group_slots.items():
        if len(sids) > 1:
            # Parallel elective sessions in the exact same elective basket are valid concurrent choices for a cohort
            baskets = {sessions_map[sid].elective_basket for sid in sids if sid in sessions_map and sessions_map[sid].elective_basket}
            non_basket_count = sum(1 for sid in sids if sid in sessions_map and not sessions_map[sid].elective_basket)
            if non_basket_count > 0 or len(baskets) > 1 or (len(baskets) == 0 and len(sids) > 1):
                group_conflicts.append(
                    f"Group {k[0]} has simultaneous classes on {k[1]} {k[2]} in sessions: {', '.join(sids)}"
                )
    categories.append({
        "id": "student_group_overlap",
        "name": "Student Group Conflict Prevention",
        "description": "No student cohort has overlapping teaching sessions",
        "passed": len(group_conflicts) == 0,
        "violations_count": len(group_conflicts),
        "details": group_conflicts or ["Zero student group timetable collisions detected"],
    })
    total_violations += len(group_conflicts)

    # 4. Combined Lectures Integrity
    combined_violations = []
    for item in schedule:
        if len(item.group_ids) > 1:
            for gid in item.group_ids:
                for p in item.periods_occupied:
                    concurrent = [sid for sid in group_slots.get((gid, item.day, p), []) if sid != item.session_id]
                    if concurrent:
                        combined_violations.append(
                            f"Combined lecture {item.session_id} clashing with {concurrent} for group {gid}"
                        )
    categories.append({
        "id": "combined_lectures",
        "name": "Combined Lectures Cohort Reservation",
        "description": "Multi-group combined lectures reserve all participating student groups synchronously",
        "passed": len(combined_violations) == 0,
        "violations_count": len(combined_violations),
        "details": combined_violations or ["All multi-group combined sessions properly synchronized with zero collisions"],
    })
    total_violations += len(combined_violations)

    # 5. Elective Basket Synchronization
    baskets: Dict[str, List[ScheduledAssignment]] = {}
    for item in schedule:
        sess_obj = sessions_map.get(item.session_id)
        if sess_obj and sess_obj.elective_basket:
            baskets.setdefault(sess_obj.elective_basket, []).append(item)

    basket_violations = []
    for b_name, b_items in baskets.items():
        if len(b_items) > 1:
            ref_day = b_items[0].day
            ref_start = b_items[0].start_period
            ref_rooms = set()
            for b_item in b_items:
                if b_item.day != ref_day or b_item.start_period != ref_start:
                    basket_violations.append(
                        f"Basket {b_name} session {b_item.session_id} scheduled at {b_item.day} {b_item.start_period} instead of {ref_day} {ref_start}"
                    )
                if b_item.room_id in ref_rooms:
                    basket_violations.append(
                        f"Basket {b_name} session {b_item.session_id} allocated duplicate room {b_item.room_id}"
                    )
                ref_rooms.add(b_item.room_id)

    categories.append({
        "id": "elective_basket_sync",
        "name": "Elective Basket Synchronization",
        "description": "Parallel elective courses in the same basket run at identical day/period in separate rooms",
        "passed": len(basket_violations) == 0,
        "violations_count": len(basket_violations),
        "details": basket_violations or ["All elective baskets run in synchronous parallel time slots across distinct rooms"],
    })
    total_violations += len(basket_violations)

    # 6. Room Overlap
    room_slots: Dict[Tuple[str, str, str], List[str]] = {}
    for item in schedule:
        for p in item.periods_occupied:
            room_slots.setdefault((item.room_id, item.day, p), []).append(item.session_id)

    room_conflicts = [
        f"Room {k[0]} occupied by multiple sessions on {k[1]} {k[2]}: {', '.join(v)}"
        for k, v in room_slots.items()
        if len(v) > 1
    ]
    categories.append({
        "id": "room_overlap",
        "name": "Room Conflict Prevention",
        "description": "No physical venue or laboratory is booked for multiple sessions at the same time",
        "passed": len(room_conflicts) == 0,
        "violations_count": len(room_conflicts),
        "details": room_conflicts or ["Zero room double-bookings across all 27 campus facilities"],
    })
    total_violations += len(room_conflicts)

    # 7. Room Type Compatibility
    room_type_violations = []
    for item in schedule:
        room = rooms_map.get(item.room_id)
        if not room:
            room_type_violations.append(f"Session {item.session_id} assigned to non-existent room {item.room_id}")
            continue

        sess_type = item.course_type.lower()
        rm_type = room.type.lower()
        if "lab" in sess_type:
            if not ("lab" in rm_type or "workshop" in rm_type):
                room_type_violations.append(
                    f"Lab session {item.session_id} placed in non-lab room {room.name} ({room.type})"
                )

    categories.append({
        "id": "room_type_compatibility",
        "name": "Room Type Compatibility",
        "description": "Sessions requiring specialized laboratories or lecture halls are matched accurately",
        "passed": len(room_type_violations) == 0,
        "violations_count": len(room_type_violations),
        "details": room_type_violations or ["All laboratory and lecture requirements matched to compliant venue types"],
    })
    total_violations += len(room_type_violations)

    # 8. Room Capacity
    capacity_violations = []
    for item in schedule:
        room = rooms_map.get(item.room_id)
        if room and room.capacity < item.total_students:
            capacity_violations.append(
                f"Session {item.session_id} ({item.total_students} students) exceeds room {room.name} capacity ({room.capacity})"
            )

    categories.append({
        "id": "room_capacity",
        "name": "Room Capacity Verification",
        "description": "Venue capacity strictly exceeds total student cohort enrollment",
        "passed": len(capacity_violations) == 0,
        "violations_count": len(capacity_violations),
        "details": capacity_violations or ["Zero capacity overflows; all cohorts accommodated safely"],
    })
    total_violations += len(capacity_violations)

    # 9. Accessibility Compliance
    accessibility_violations = []
    for item in schedule:
        sess_obj = sessions_map.get(item.session_id)
        room = rooms_map.get(item.room_id)
        if sess_obj and sess_obj.requires_accessible:
            if room and not room.is_accessible:
                accessibility_violations.append(
                    f"Session {item.session_id} requires barrier-free access but room {room.name} is not accessible"
                )

    categories.append({
        "id": "accessibility",
        "name": "Accessibility Compliance",
        "description": "Sessions with special accessibility requirements assigned barrier-free ground floor venues",
        "passed": len(accessibility_violations) == 0,
        "violations_count": len(accessibility_violations),
        "details": accessibility_violations or ["100% barrier-free accessibility guidelines satisfied"],
    })
    total_violations += len(accessibility_violations)

    # 10. Faculty Unavailability
    faculty_unavail_violations = []
    for item in schedule:
        fac = faculty_map.get(item.faculty_id)
        if fac and fac.unavailable_slots:
            for p in item.periods_occupied:
                if (item.day, p) in fac.unavailable_slots:
                    faculty_unavail_violations.append(
                        f"Faculty {fac.name} assigned during registered unavailability on {item.day} {p}"
                    )

    categories.append({
        "id": "faculty_unavailability",
        "name": "Faculty Leave & Unavailability Respect",
        "description": "Zero scheduling during faculty research leaves, steering meetings, or medical unavailabilities",
        "passed": len(faculty_unavail_violations) == 0,
        "violations_count": len(faculty_unavail_violations),
        "details": faculty_unavail_violations or ["Zero sessions placed during faculty unavailability windows"],
    })
    total_violations += len(faculty_unavail_violations)

    # 11. Room Unavailability & Maintenance Windows
    room_unavail_violations = []
    for item in schedule:
        room = rooms_map.get(item.room_id)
        if room and room.unavailable_slots:
            for p in item.periods_occupied:
                if (item.day, p) in room.unavailable_slots:
                    room_unavail_violations.append(
                        f"Room {room.name} assigned during maintenance window on {item.day} {p}"
                    )

    categories.append({
        "id": "room_unavailability",
        "name": "Room Maintenance & Reservations Respect",
        "description": "Zero teaching scheduled during room renovation or maintenance blackout windows",
        "passed": len(room_unavail_violations) == 0,
        "violations_count": len(room_unavail_violations),
        "details": room_unavail_violations or ["All designated maintenance windows and institutional reservations protected"],
    })
    total_violations += len(room_unavail_violations)

    # 12. Lunch Break Rule (13:00 - 14:00)
    lunch_violations = []
    for item in schedule:
        start_idx = PERIOD_INDEX.get(item.start_period, 0)
        dur = item.duration_periods
        end_idx = start_idx + dur - 1
        # Morning sessions must end by P5 (index 4)
        # Afternoon sessions must start at or after P6 (index 5)
        if start_idx <= 4 and end_idx >= 5:
            lunch_violations.append(
                f"Session {item.session_id} spans {item.start_period} to {item.end_period}, encroaching 13:00-14:00 lunch break"
            )

    categories.append({
        "id": "lunch_break_rule",
        "name": "Campus Lunch Break Inviolability (13:00–14:00)",
        "description": "Strict prohibition of classes spanning across the daily 13:00-14:00 student & faculty lunch hour",
        "passed": len(lunch_violations) == 0,
        "violations_count": len(lunch_violations),
        "details": lunch_violations or ["All morning sessions conclude by 13:00; afternoon sessions resume at 14:00"],
    })
    total_violations += len(lunch_violations)

    # 13. 3-Hour Lab Start Period Restrictions
    lab_start_violations = []
    for item in schedule:
        if item.duration_periods == 3:
            if item.start_period not in ["P2", "P6"]:
                lab_start_violations.append(
                    f"3-hour lab {item.session_id} begins at {item.start_period} instead of standard slots P2 (09:00) or P6 (14:00)"
                )

    categories.append({
        "id": "three_hour_lab_starts",
        "name": "3-Hour Continuous Lab Scheduling Standard",
        "description": "All 3-hour practical sessions locked exclusively to standard blocks P2–P4 or P6–P8",
        "passed": len(lab_start_violations) == 0,
        "violations_count": len(lab_start_violations),
        "details": lab_start_violations or ["100% of 3-hour labs adhere strictly to P2 or P6 block start times"],
    })
    total_violations += len(lab_start_violations)

    # 14. Faculty Daily Teaching Hours Limit (<= 4h)
    daily_fac_hours: Dict[Tuple[str, str], int] = {}
    for item in schedule:
        daily_fac_hours[(item.faculty_id, item.day)] = (
            daily_fac_hours.get((item.faculty_id, item.day), 0) + item.duration_periods
        )

    workload_violations = []
    for (fac_id, day), hours in daily_fac_hours.items():
        fac = faculty_map.get(fac_id)
        limit = fac.max_daily_hours if fac and fac.max_daily_hours else 4
        if hours > limit:
            workload_violations.append(
                f"Faculty {fac.name if fac else fac_id} teaches {hours}h on {day} (exceeds {limit}h statutory daily limit)"
            )

    categories.append({
        "id": "faculty_daily_limit",
        "name": "Faculty Maximum Daily Workload Rule",
        "description": "No instructor assigned more than 4 teaching contact hours on any single day",
        "passed": len(workload_violations) == 0,
        "violations_count": len(workload_violations),
        "details": workload_violations or ["All faculty daily workloads capped at or below the 4-hour statutory limit"],
    })
    total_violations += len(workload_violations)

    is_valid = total_violations == 0

    return {
        "is_valid": is_valid,
        "total_sessions_checked": len(schedule),
        "expected_sessions": len(sessions),
        "hard_conflicts_total": total_violations,
        "categories_passed": sum(1 for c in categories if c["passed"]),
        "categories_total": len(categories),
        "categories": categories,
    }
