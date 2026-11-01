"""
CIT Smart Scheduler - Automated Test Suite for Google OR-Tools CP-SAT Scheduling Engine
Covers all 14 hard constraint categories and end-to-end official dataset optimization.
"""

import pytest
from ortools.sat.python import cp_model

from backend.app.services.scheduling.models import (
    DAYS,
    PERIODS,
    PERIOD_INDEX,
    SessionInput,
    RoomInput,
    FacultyInput,
    StudentGroupInput,
)
from backend.app.services.scheduling.solver import TimetableSolver
from backend.app.services.scheduling.validator import validate_timetable


@pytest.fixture
def mock_dataset():
    """Generates a controlled, self-contained mini dataset for discrete constraint testing."""
    rooms = [
        RoomInput(id="rm-1", name="LH-101", code="LH-101", block="A", floor=1, type="Lecture Hall", capacity=100, is_accessible=True),
        RoomInput(id="rm-2", name="LH-102", code="LH-102", block="A", floor=2, type="Lecture Hall", capacity=80, is_accessible=False),
        RoomInput(id="rm-3", name="CS-Lab-1", code="CSL-1", block="T", floor=1, type="Computer Lab", capacity=70, is_accessible=True),
        RoomInput(id="rm-4", name="ECE-Lab-1", code="ECL-1", block="B", floor=1, type="Hardware Lab", capacity=60, is_accessible=True),
    ]

    faculty = [
        FacultyInput(id="fac-1", name="Prof. Arvind Tripathy", department="CSE", prefer_morning=True, max_daily_hours=4),
        FacultyInput(id="fac-2", name="Dr. Sunita Mohanty", department="CSE", prefer_morning=False, max_daily_hours=4),
        FacultyInput(id="fac-3", name="Dr. Debabrata Samal", department="ECE", prefer_morning=True, max_daily_hours=4),
    ]

    groups = [
        StudentGroupInput(id="grp-1", name="CSE-1A", strength=60, department="CSE", semester=1),
        StudentGroupInput(id="grp-2", name="CSE-1B", strength=55, department="CSE", semester=1),
        StudentGroupInput(id="grp-3", name="ECE-1A", strength=50, department="ECE", semester=1),
    ]

    return rooms, faculty, groups


class TestHardConstraints:
    def test_single_assignment_rule(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        sessions = [
            SessionInput(
                id="s-1", course_id="c-1", course_code="CS101", course_title="Intro to CS",
                course_type="Lecture", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=60, duration_periods=1
            ),
            SessionInput(
                id="s-2", course_id="c-2", course_code="CS102", course_title="Data Structures",
                course_type="Lecture", faculty_id="fac-2", faculty_name="Dr. Sunita",
                group_ids=["grp-2"], group_names=["CSE-1B"], total_students=55, duration_periods=1
            ),
        ]
        solver = TimetableSolver(sessions=sessions, rooms=rooms, faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        assert res.scheduled_sessions == 2
        assigned_ids = [s.session_id for s in res.schedule]
        assert "s-1" in assigned_ids and "s-2" in assigned_ids

    def test_faculty_conflict_prevention(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        # Two sessions taught by the SAME faculty member
        sessions = [
            SessionInput(
                id="s-1", course_id="c-1", course_code="CS101", course_title="Algorithms A",
                course_type="Lecture", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=60, duration_periods=1
            ),
            SessionInput(
                id="s-2", course_id="c-1", course_code="CS101", course_title="Algorithms B",
                course_type="Lecture", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-2"], group_names=["CSE-1B"], total_students=55, duration_periods=1
            ),
        ]
        solver = TimetableSolver(sessions=sessions, rooms=rooms, faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        s1 = next(s for s in res.schedule if s.session_id == "s-1")
        s2 = next(s for s in res.schedule if s.session_id == "s-2")
        # Cannot be on same day and same period
        assert not (s1.day == s2.day and s1.start_period == s2.start_period)

    def test_student_group_conflict_prevention(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        # Two sessions attended by the SAME student group with different professors
        sessions = [
            SessionInput(
                id="s-1", course_id="c-1", course_code="CS101", course_title="Course 1",
                course_type="Lecture", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=60, duration_periods=1
            ),
            SessionInput(
                id="s-2", course_id="c-2", course_code="CS102", course_title="Course 2",
                course_type="Lecture", faculty_id="fac-2", faculty_name="Dr. Sunita",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=60, duration_periods=1
            ),
        ]
        solver = TimetableSolver(sessions=sessions, rooms=rooms, faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        s1 = next(s for s in res.schedule if s.session_id == "s-1")
        s2 = next(s for s in res.schedule if s.session_id == "s-2")
        assert not (s1.day == s2.day and s1.start_period == s2.start_period)

    def test_combined_lectures_synchronization(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        # Session 1 is a combined lecture for grp-1 and grp-2
        # Session 2 is a solo session for grp-2
        sessions = [
            SessionInput(
                id="s-comb", course_id="c-1", course_code="MATH101", course_title="Engineering Math",
                course_type="Lecture", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1", "grp-2"], group_names=["CSE-1A", "CSE-1B"], total_students=115,
                duration_periods=1
            ),
            SessionInput(
                id="s-solo", course_id="c-2", course_code="CS102", course_title="Programming",
                course_type="Lecture", faculty_id="fac-2", faculty_name="Dr. Sunita",
                group_ids=["grp-2"], group_names=["CSE-1B"], total_students=55, duration_periods=1
            ),
        ]
        # Make sure at least one room can hold 115
        rooms[0].capacity = 120
        solver = TimetableSolver(sessions=sessions, rooms=rooms, faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        s_comb = next(s for s in res.schedule if s.session_id == "s-comb")
        s_solo = next(s for s in res.schedule if s.session_id == "s-solo")
        # grp-2 cannot attend s-solo when s-comb is taking place
        assert not (s_comb.day == s_solo.day and s_comb.start_period == s_solo.start_period)

    def test_elective_basket_synchronization(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        # Two parallel elective sessions in the same basket
        sessions = [
            SessionInput(
                id="s-el1", course_id="c-el1", course_code="EL401", course_title="Deep Learning",
                course_type="Lecture", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=30, duration_periods=1,
                elective_basket="Basket-AI"
            ),
            SessionInput(
                id="s-el2", course_id="c-el2", course_code="EL402", course_title="Cloud Security",
                course_type="Lecture", faculty_id="fac-2", faculty_name="Dr. Sunita",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=30, duration_periods=1,
                elective_basket="Basket-AI"
            ),
        ]
        solver = TimetableSolver(sessions=sessions, rooms=rooms, faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        s1 = next(s for s in res.schedule if s.session_id == "s-el1")
        s2 = next(s for s in res.schedule if s.session_id == "s-el2")
        # Must run at same day and period, but in distinct rooms
        assert s1.day == s2.day
        assert s1.start_period == s2.start_period
        assert s1.room_id != s2.room_id

    def test_room_conflict_prevention(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        # Only 1 room available
        single_room = [rooms[0]]
        sessions = [
            SessionInput(
                id="s-1", course_id="c-1", course_code="CS101", course_title="Class 1",
                course_type="Lecture", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=60, duration_periods=1
            ),
            SessionInput(
                id="s-2", course_id="c-2", course_code="CS102", course_title="Class 2",
                course_type="Lecture", faculty_id="fac-2", faculty_name="Dr. Sunita",
                group_ids=["grp-2"], group_names=["CSE-1B"], total_students=55, duration_periods=1
            ),
        ]
        solver = TimetableSolver(sessions=sessions, rooms=single_room, faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        s1 = next(s for s in res.schedule if s.session_id == "s-1")
        s2 = next(s for s in res.schedule if s.session_id == "s-2")
        assert not (s1.day == s2.day and s1.start_period == s2.start_period)

    def test_room_type_compatibility(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        sessions = [
            SessionInput(
                id="s-lab", course_id="c-lab", course_code="CS191", course_title="Linux Lab",
                course_type="Lab", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=60, duration_periods=1,
                session_type="Lab"
            ),
        ]
        solver = TimetableSolver(sessions=sessions, rooms=rooms, faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        s_lab = next(s for s in res.schedule if s.session_id == "s-lab")
        assert "Lab" in s_lab.room_type or "Workshop" in s_lab.room_type

    def test_room_capacity_constraint(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        # Group has strength 95, rm-2 has 80, rm-3 has 70, rm-4 has 60, only rm-1 has 100
        sessions = [
            SessionInput(
                id="s-big", course_id="c-1", course_code="CS101", course_title="Massive Lecture",
                course_type="Lecture", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=95, duration_periods=1
            ),
        ]
        solver = TimetableSolver(sessions=sessions, rooms=rooms, faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        s = next(s for s in res.schedule if s.session_id == "s-big")
        assert s.room_id == "rm-1"
        assert s.room_capacity >= 95

    def test_accessibility_constraint(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        # rm-1 is accessible (floor 1), rm-2 is NOT accessible (floor 2)
        sessions = [
            SessionInput(
                id="s-acc", course_id="c-1", course_code="CS101", course_title="Barrier-Free Class",
                course_type="Lecture", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=50, duration_periods=1,
                requires_accessible=True
            ),
        ]
        solver = TimetableSolver(sessions=sessions, rooms=[rooms[0], rooms[1]], faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        s = next(s for s in res.schedule if s.session_id == "s-acc")
        assigned_room = next(r for r in rooms if r.id == s.room_id)
        assert assigned_room.is_accessible

    def test_faculty_unavailability(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        # Mark fac-1 unavailable on Monday P1
        faculty[0].unavailable_slots = {("Monday", "P1")}
        sessions = [
            SessionInput(
                id="s-1", course_id="c-1", course_code="CS101", course_title="Session",
                course_type="Lecture", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=50, duration_periods=1
            ),
        ]
        solver = TimetableSolver(sessions=sessions, rooms=rooms, faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        s = next(s for s in res.schedule if s.session_id == "s-1")
        assert not (s.day == "Monday" and s.start_period == "P1")

    def test_room_unavailability(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        # Mark rm-1 unavailable on Tuesday P3
        rooms[0].unavailable_slots = {("Tuesday", "P3")}
        sessions = [
            SessionInput(
                id="s-1", course_id="c-1", course_code="CS101", course_title="Session",
                course_type="Lecture", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=95, duration_periods=1
            ),
        ]
        solver = TimetableSolver(sessions=sessions, rooms=rooms, faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        s = next(s for s in res.schedule if s.session_id == "s-1")
        assert not (s.day == "Tuesday" and s.start_period == "P3" and s.room_id == "rm-1")

    def test_lunch_break_rule(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        # 2-hour session should NOT start at P5 (12:00-13:00) because it would cross lunch (13:00-14:00)
        sessions = [
            SessionInput(
                id="s-2h", course_id="c-1", course_code="CS201", course_title="2-Hour Block",
                course_type="Lecture", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=50, duration_periods=2
            ),
        ]
        solver = TimetableSolver(sessions=sessions, rooms=rooms, faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        s = next(s for s in res.schedule if s.session_id == "s-2h")
        assert s.start_period != "P5"
        assert not ("P5" in s.periods_occupied and "P6" in s.periods_occupied)

    def test_three_hour_lab_starts_only_at_p2_or_p6(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        sessions = [
            SessionInput(
                id="s-3h", course_id="c-lab", course_code="CS391", course_title="Advanced Systems Lab",
                course_type="Lab", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=50, duration_periods=3,
                session_type="Lab"
            ),
        ]
        solver = TimetableSolver(sessions=sessions, rooms=rooms, faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        s = next(s for s in res.schedule if s.session_id == "s-3h")
        assert s.start_period in ["P2", "P6"]
        if s.start_period == "P2":
            assert s.periods_occupied == ["P2", "P3", "P4"]
        else:
            assert s.periods_occupied == ["P6", "P7", "P8"]

    def test_faculty_maximum_daily_limit(self, mock_dataset):
        rooms, faculty, groups = mock_dataset
        # 5 sessions assigned to fac-1. Max daily hours is 4.
        # So fac-1 CANNOT teach all 5 sessions on the same day!
        sessions = [
            SessionInput(
                id=f"s-{i}", course_id=f"c-{i}", course_code=f"CS10{i}", course_title=f"Course {i}",
                course_type="Lecture", faculty_id="fac-1", faculty_name="Prof. Arvind",
                group_ids=["grp-1"], group_names=["CSE-1A"], total_students=50, duration_periods=1
            )
            for i in range(1, 6)
        ]
        solver = TimetableSolver(sessions=sessions, rooms=rooms, faculty=faculty, groups=groups, time_limit_seconds=10.0)
        res = solver.solve()
        assert res.is_clash_free
        # Group by day
        fac1_by_day = {}
        for s in res.schedule:
            fac1_by_day[s.day] = fac1_by_day.get(s.day, 0) + s.duration_periods
        for d, hours in fac1_by_day.items():
            assert hours <= 4


def test_full_dataset_end_to_end_validation():
    """Validates the official CIT dataset (189 sessions, 243 teaching hours) in database."""
    from backend.app.database import SessionLocal
    from backend.app.services.timetable_service import get_latest_timetable_result

    db = SessionLocal()
    result = get_latest_timetable_result(db)

    assert result.is_clash_free is True
    assert result.total_sessions == 189
    assert result.scheduled_sessions == 189
    assert result.total_teaching_hours == 243
    assert result.hard_conflicts_count == 0

    val = result.validation_summary
    assert val["is_valid"] is True
    assert val["categories_passed"] == 14
    assert val["hard_conflicts_total"] == 0
