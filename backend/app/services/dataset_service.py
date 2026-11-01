import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.models.user import User
from backend.app.models.room import Room, RoomUnavailability
from backend.app.models.faculty import Faculty, FacultyUnavailability
from backend.app.models.student_group import StudentGroup
from backend.app.models.course import Course
from backend.app.models.session import TeachingSession, SessionGroupAssociation
from backend.app.models.booking import BookingRequest
from backend.app.models.exam import Examination
from backend.app.models.timetable_version import TimetableVersion
from backend.app.models.change_request import ChangeRequest
from backend.app.models.notification import Notification
from backend.app.models.disruption import Disruption
from backend.app.schemas.dataset import DatasetImportReport
from backend.app.services.audit_service import record_audit_log

def import_official_dataset(db: Session, data: Dict[str, Any], actor: User) -> DatasetImportReport:
    """
    Imports the official JSON dataset inside an ACID database transaction.
    If any constraint fails, the entire transaction is rolled back.
    """
    errors: List[str] = []
    imported_rooms = 0
    imported_faculty = 0
    imported_groups = 0
    imported_courses = 0
    imported_sessions = 0
    imported_bookings = 0

    try:
        # 1. Rooms
        if "rooms" in data:
            for r_data in data["rooms"]:
                existing = db.query(Room).filter(Room.id == r_data["id"]).first()
                if not existing:
                    room = Room(
                        id=r_data["id"],
                        name=r_data["name"],
                        code=r_data.get("code", r_data["name"]),
                        block=r_data.get("block", "Aryabhata Block"),
                        floor=r_data.get("floor", 1),
                        type=r_data.get("type", "Lecture Hall"),
                        capacity=r_data["capacity"],
                        exam_capacity=r_data.get("exam_capacity", r_data["capacity"] // 2),
                        has_projector=r_data.get("has_projector", True),
                        has_audio_system=r_data.get("has_audio_system", True),
                        has_air_conditioning=r_data.get("has_air_conditioning", True),
                        is_accessible=r_data.get("is_accessible", True),
                        features=r_data.get("features", {})
                    )
                    db.add(room)
                    imported_rooms += 1

        # 2. Faculty
        if "faculty" in data:
            for f_data in data["faculty"]:
                existing = db.query(Faculty).filter(Faculty.id == f_data["id"]).first()
                if not existing:
                    fac = Faculty(
                        id=f_data["id"],
                        name=f_data["name"],
                        designation=f_data.get("designation", "Assistant Professor"),
                        department=f_data.get("department", "Computer Science"),
                        email=f_data.get("email", f"{f_data['id']}@cit.edu"),
                        weekly_workload_hours=f_data.get("weekly_workload_hours", 16),
                        max_workload_hours=f_data.get("max_workload_hours", 18),
                        max_daily_hours=f_data.get("max_daily_hours", 4),
                        prefer_morning=f_data.get("prefer_morning", True),
                        preferences=f_data.get("preferences", {})
                    )
                    db.add(fac)
                    imported_faculty += 1

        # 3. Student Groups
        if "groups" in data:
            for g_data in data["groups"]:
                existing = db.query(StudentGroup).filter(StudentGroup.id == g_data["id"]).first()
                if not existing:
                    grp = StudentGroup(
                        id=g_data["id"],
                        name=g_data["name"],
                        department=g_data.get("department", "Computer Science"),
                        semester=g_data.get("semester", 3),
                        strength=g_data["strength"],
                        class_representative=g_data.get("class_representative")
                    )
                    db.add(grp)
                    imported_groups += 1

        # 4. Courses
        if "courses" in data:
            for c_data in data["courses"]:
                existing = db.query(Course).filter(Course.id == c_data["id"]).first()
                if not existing:
                    crs = Course(
                        id=c_data["id"],
                        code=c_data["code"],
                        title=c_data["title"],
                        department=c_data.get("department", "CSE"),
                        credits=c_data.get("credits", 3),
                        type=c_data.get("type", "Lecture"),
                        color_tag=c_data.get("color_tag", "#3B82F6"),
                        weekly_hours=c_data.get("weekly_hours", 3),
                        is_elective=c_data.get("is_elective", False),
                        elective_basket=c_data.get("elective_basket")
                    )
                    db.add(crs)
                    imported_courses += 1

        # 5. Teaching Sessions
        if "sessions" in data:
            for s_data in data["sessions"]:
                existing = db.query(TeachingSession).filter(TeachingSession.id == s_data["id"]).first()
                if not existing:
                    sess = TeachingSession(
                        id=s_data["id"],
                        course_id=s_data["course_id"],
                        faculty_id=s_data["faculty_id"],
                        room_id=s_data.get("room_id"),
                        day=s_data.get("day"),
                        period_id=s_data.get("period_id"),
                        duration_periods=s_data.get("duration_periods", 1),
                        session_type=s_data.get("session_type", "Lecture"),
                        is_fixed_slot=s_data.get("is_fixed_slot", False),
                        fixed_day=s_data.get("fixed_day"),
                        fixed_period=s_data.get("fixed_period"),
                        is_scheduled=s_data.get("is_scheduled", True)
                    )
                    db.add(sess)
                    
                    # Associate group IDs
                    group_ids = s_data.get("group_ids", [])
                    if "group_id" in s_data and s_data["group_id"] not in group_ids:
                        group_ids.append(s_data["group_id"])

                    for gid in group_ids:
                        assoc = SessionGroupAssociation(
                            id=f"assoc-{sess.id}-{gid}",
                            session_id=sess.id,
                            group_id=gid,
                            is_primary_group=True
                        )
                        db.add(assoc)
                    imported_sessions += 1

        # 6. Bookings
        if "bookings" in data:
            for b_data in data["bookings"]:
                existing = db.query(BookingRequest).filter(BookingRequest.id == b_data["id"]).first()
                if not existing:
                    bk = BookingRequest(
                        id=b_data["id"],
                        event_title=b_data["event_title"],
                        event_category=b_data.get("event_category", "Workshop"),
                        requested_by_id=b_data.get("requested_by_id", actor.id),
                        requester_name=b_data.get("requester_name", "Academic Guild"),
                        requester_role=b_data.get("requester_role", "club"),
                        requester_email=b_data.get("requester_email", "club@cit.edu"),
                        club_or_dept=b_data.get("club_or_dept", "Student Activity Center"),
                        room_id=b_data["room_id"],
                        date=b_data["date"],
                        start_time=b_data.get("start_time", "14:00"),
                        end_time=b_data.get("end_time", "16:00"),
                        period_ids=b_data.get("period_ids", ["P7", "P8"]),
                        expected_attendees=b_data.get("expected_attendees", 50),
                        mandatory_student_groups=b_data.get("mandatory_student_groups", []),
                        description=b_data.get("description", ""),
                        requires_av=b_data.get("requires_av", True),
                        requires_ac=b_data.get("requires_ac", True),
                        is_spectra_week=b_data.get("is_spectra_week", False),
                        priority_score=b_data.get("priority_score", 50),
                        status=b_data.get("status", "Pending")
                    )
                    db.add(bk)
                    imported_bookings += 1

        # Commit all atomically
        db.commit()

        record_audit_log(
            db=db,
            actor_id=actor.id,
            actor_name=actor.name,
            action="DATASET_IMPORT",
            entity_type="dataset",
            details={
                "imported_rooms": imported_rooms,
                "imported_faculty": imported_faculty,
                "imported_groups": imported_groups,
                "imported_courses": imported_courses,
                "imported_sessions": imported_sessions,
                "imported_bookings": imported_bookings
            }
        )

        return DatasetImportReport(
            success=True,
            message="Dataset imported and validated with zero integrity violations.",
            imported_rooms=imported_rooms,
            imported_faculty=imported_faculty,
            imported_groups=imported_groups,
            imported_courses=imported_courses,
            imported_sessions=imported_sessions,
            imported_bookings=imported_bookings,
            errors=errors
        )
    except Exception as e:
        db.rollback()
        return DatasetImportReport(
            success=False,
            message=f"Transaction rolled back due to error: {str(e)}",
            errors=[str(e)]
        )

def seed_initial_demo_database(db: Session) -> None:
    """Populates clean database with the exact reference dataset if tables are empty."""
    if db.query(Room).count() > 0:
        return  # already seeded

    # Seed 4 standard users
    users = [
        User(
            id="user-admin",
            name="Dr. Rameshwar Panda",
            email="admin@cit.edu",
            hashed_password="demo123",
            role="ADMIN",
            title="Dean of Academic Scheduling & Operations",
            department="Central Academic Affairs",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
        ),
        User(
            id="user-coord",
            name="Dr. Sunita Mohanty",
            email="coordinator@cit.edu",
            hashed_password="demo123",
            role="DEPARTMENT_COORDINATOR",
            title="Department Timetable Coordinator (CSE)",
            department="Computer Science & Engineering",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
        ),
        User(
            id="user-faculty",
            name="Prof. Arvind Tripathy",
            email="faculty@cit.edu",
            hashed_password="demo123",
            role="FACULTY",
            title="Associate Professor, Distributed Systems",
            department="Computer Science & Engineering",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
        ),
        User(
            id="user-club",
            name="Ananya Dash",
            email="club@cit.edu",
            hashed_password="demo123",
            role="CLUB_REPRESENTATIVE",
            title="President, CIT Robotics & AI Club",
            club_name="CIT Robotics & AI Club",
            department="Student Activity Center",
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
        ),
        User(
            id="user-student",
            name="Rohan Sen",
            email="student@cit.edu",
            hashed_password="demo123",
            role="STUDENT",
            title="Undergraduate Scholar (CSE-3A)",
            department="Computer Science & Engineering",
            avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80"
        ),
        User(
            id="user-warden",
            name="Dr. Bimalendra Rout",
            email="warden@cit.edu",
            hashed_password="demo123",
            role="WARDEN",
            title="Chief Hostel Warden & Hall Operations",
            department="Hostel & Campus Life Administration",
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
        ),
        User(
            id="user-staff",
            name="Rajesh Kumar Sahu",
            email="staff@cit.edu",
            hashed_password="demo123",
            role="STAFF",
            title="Senior Laboratory & Venue Operations Staff",
            department="Campus Estate & Venue Support",
            avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
        ),
    ]
    for u in users:
        db.add(u)

    # Seed 27 Rooms
    room_configs = [
        ("rm-1", "LH-101", "LH-101", "Aryabhata Academic Block", 1, "Lecture Hall", 90, 45, True, True, True),
        ("rm-2", "LH-102", "LH-102", "Aryabhata Academic Block", 1, "Lecture Hall", 90, 45, True, True, True),
        ("rm-3", "LH-103", "LH-103", "Aryabhata Academic Block", 1, "Lecture Hall", 75, 38, True, False, False),
        ("rm-4", "LH-201", "LH-201", "Aryabhata Academic Block", 2, "Lecture Hall", 120, 60, True, True, True),
        ("rm-5", "LH-202", "LH-202", "Aryabhata Academic Block", 2, "Lecture Hall", 120, 60, True, True, True),
        ("rm-6", "LH-203", "LH-203", "Aryabhata Academic Block", 2, "Lecture Hall", 80, 40, True, False, True),
        ("rm-7", "LH-301", "LH-301", "Aryabhata Academic Block", 3, "Lecture Hall", 80, 40, True, False, False),
        ("rm-8", "LH-302", "LH-302", "Aryabhata Academic Block", 3, "Lecture Hall", 80, 40, True, False, False),
        ("rm-9", "CS-Lab-1 (AI/ML)", "CSL-1", "Turing Computing Complex", 1, "Computer Lab", 75, 38, True, True, True),
        ("rm-10", "CS-Lab-2 (Systems)", "CSL-2", "Turing Computing Complex", 1, "Computer Lab", 75, 38, True, True, True),
        ("rm-11", "CS-Lab-3 (Cloud & IoT)", "CSL-3", "Turing Computing Complex", 2, "Computer Lab", 70, 35, True, True, True),
        ("rm-12", "CS-Lab-4 (Data Eng)", "CSL-4", "Turing Computing Complex", 2, "Computer Lab", 70, 35, True, True, True),
        ("rm-13", "ECE-Lab-1 (VLSI)", "ECL-1", "Bose Electronics Wing", 1, "Hardware Lab", 70, 35, True, False, True),
        ("rm-14", "ECE-Lab-2 (Signals)", "ECL-2", "Bose Electronics Wing", 1, "Hardware Lab", 70, 35, True, False, True),
        ("rm-15", "ECE-Lab-3 (Robotics)", "ECL-3", "Bose Electronics Wing", 2, "Hardware Lab", 70, 35, True, True, True),
        ("rm-16", "Mech-CAD Lab", "MCL-1", "Visvesvaraya Engineering Centre", 1, "Computer Lab", 70, 35, True, False, True),
        ("rm-17", "Mech-Fluids Lab", "MFL-1", "Visvesvaraya Engineering Centre", 1, "Hardware Lab", 65, 30, False, False, False),
        ("rm-18", "Central Workshop", "CWS-1", "Visvesvaraya Engineering Centre", 1, "Workshop", 75, 38, False, False, False),
        ("rm-19", "Civil Surveying Lab", "CVL-1", "Visvesvaraya Engineering Centre", 2, "Hardware Lab", 65, 30, True, False, False),
        ("rm-20", "Physics & Optics Lab", "BSL-1", "Raman Basic Sciences Block", 1, "Hardware Lab", 70, 35, True, False, True),
        ("rm-21", "Chemistry Lab", "BSL-2", "Raman Basic Sciences Block", 2, "Hardware Lab", 70, 35, False, False, False),
        ("rm-22", "Chilika Auditorium", "AUD-MAIN", "Student & Cultural Complex", 1, "Auditorium", 650, 300, True, True, True),
        ("rm-23", "Mini Auditorium", "AUD-MINI", "Student & Cultural Complex", 2, "Auditorium", 250, 120, True, True, True),
        ("rm-24", "Seminar Hall A", "SEM-A", "Aryabhata Academic Block", 3, "Seminar Hall", 150, 75, True, True, True),
        ("rm-25", "Seminar Hall B", "SEM-B", "Turing Computing Complex", 3, "Seminar Hall", 140, 70, True, True, True),

        ("rm-26", "Executive Council Room", "EC-RM", "Administrative Block", 2, "Seminar Hall", 40, 20, True, True, True),
        ("rm-27", "Open Amphitheatre", "AMPHI", "Central Campus Plaza", 1, "Auditorium", 800, 0, False, True, False),
    ]
    for r in room_configs:
        db.add(Room(
            id=r[0], name=r[1], code=r[2], block=r[3], floor=r[4], type=r[5],
            capacity=r[6], exam_capacity=r[7], has_projector=r[8], has_audio_system=r[9], has_air_conditioning=r[10]
        ))

    # Seed 14 Student Groups
    groups = [
        ("grp-1", "CSE-1A", "Computer Science", 1, 68),
        ("grp-2", "CSE-1B", "Computer Science", 1, 65),
        ("grp-3", "CSE-2A", "Computer Science", 3, 64),
        ("grp-4", "CSE-2B", "Computer Science", 3, 66),
        ("grp-5", "CSE-3A", "Computer Science", 5, 62),
        ("grp-6", "CSE-3B", "Computer Science", 5, 60),
        ("grp-7", "CSE-4A", "Computer Science", 7, 58),
        ("grp-8", "ECE-1A", "Electronics & Comm", 1, 60),
        ("grp-9", "ECE-2A", "Electronics & Comm", 3, 58),
        ("grp-10", "ECE-3A", "Electronics & Comm", 5, 55),
        ("grp-11", "ME-1A", "Mechanical Eng", 1, 56),
        ("grp-12", "ME-2A", "Mechanical Eng", 3, 54),
        ("grp-13", "ME-3A", "Mechanical Eng", 5, 50),
        ("grp-14", "CE-2A", "Civil Engineering", 3, 52),
    ]
    for g in groups:
        db.add(StudentGroup(id=g[0], name=g[1], department=g[2], semester=g[3], strength=g[4]))

    # Seed 40 Faculty Members
    faculty_names = [
        "Prof. Arvind Tripathy", "Dr. Sunita Mohanty", "Dr. Debabrata Samal", "Prof. Manisha Choudhury",
        "Dr. Rajesh K. Padhi", "Prof. Ipsita Nayak", "Dr. Pradeep K. Sahoo", "Prof. Swati Biswal",
        "Dr. Bijay K. Swain", "Prof. Smita Mohapatra", "Dr. Tarun K. Das", "Prof. Deepak Senapati",
        "Dr. Ashis Kumar Panda", "Prof. Chinmayee Hota", "Dr. Bibhuti B. Mishra", "Prof. Lopamudra Rath",
        "Dr. Anupama Satpathy", "Prof. Rakesh Mallick", "Dr. Geeta Pattnaik", "Prof. Alok Ray",
        "Dr. Sudhanshu Sekhar", "Prof. Priyadarshini Dey", "Dr. Niranjan Behera", "Prof. Monalisa Jena",
        "Dr. Harekrushna Sahu", "Prof. Tapasvi Tripathy", "Dr. Satyabrata Das", "Prof. Rashmi Rekha",
        "Dr. Biswaranjan Rout", "Prof. Archana Nayak", "Dr. Sarat Chandra Das", "Prof. Subhashree Dash",
        "Dr. Jagannath Lenka", "Prof. Bhabani Sankar", "Dr. Pritam Panda", "Prof. Sandeep Mohanty",
        "Dr. Minati Barik", "Prof. Gouranga Charan", "Dr. Santosh K. Prusty", "Prof. Madhuchhanda Sen"
    ]
    for i, name in enumerate(faculty_names):
        db.add(Faculty(
            id=f"fac-{i+1}",
            name=name,
            designation="Professor" if i % 4 == 0 else "Associate Professor",
            department="Computer Science" if i < 15 else "Electronics & Comm" if i < 25 else "Mechanical Eng",
            email=f"faculty{i+1}@cit.edu",
            weekly_workload_hours=14 + (i % 5),
            max_workload_hours=18
        ))

    # Seed 62 Courses
    courses_data = [
        ("crs-1", "CS301", "Design & Analysis of Algorithms", "CSE", 4, "Lecture", "#3B82F6"),
        ("crs-2", "CS302", "Database Management Systems", "CSE", 4, "Lecture", "#10B981"),
        ("crs-3", "CS303", "Computer Organization & Architecture", "CSE", 4, "Lecture", "#8B5CF6"),
        ("crs-4", "CS304", "Formal Language & Automata", "CSE", 3, "Lecture", "#EC4899"),
        ("crs-5", "CS391", "Algorithms Lab", "CSE", 2, "Lab", "#06B6D4"),
        ("crs-6", "CS392", "DBMS Laboratory", "CSE", 2, "Lab", "#14B8A6"),
        ("crs-7", "CS401", "Distributed Systems & Cloud", "CSE", 4, "Lecture", "#F59E0B"),
        ("crs-8", "CS402", "Artificial Intelligence & ML", "CSE", 4, "Lecture", "#6366F1"),
        ("crs-9", "CS491", "AI & Deep Learning Lab", "CSE", 2, "Lab", "#84CC16"),
        ("crs-10", "EC301", "Digital Signal Processing", "ECE", 4, "Lecture", "#E11D48"),
        ("crs-11", "EC302", "Microprocessors & Microcontrollers", "ECE", 4, "Lecture", "#D97706"),
        ("crs-12", "EC391", "DSP Laboratory", "ECE", 2, "Lab", "#0D9488"),
        ("crs-13", "ME301", "Heat & Mass Transfer", "ME", 4, "Lecture", "#EF4444"),
        ("crs-14", "ME302", "Kinematics of Machinery", "ME", 4, "Lecture", "#F97316"),
        ("crs-15", "BS101", "Engineering Mathematics III", "BS", 4, "Lecture", "#475569"),
    ]
    for c in courses_data:
        db.add(Course(id=c[0], code=c[1], title=c[2], department=c[3], credits=c[4], type=c[5], color_tag=c[6]))
    # Add remaining up to 62 courses
    for i in range(16, 63):
        dept = ["CSE", "ECE", "ME", "CE", "BS"][i % 5]
        code = f"{dept[:2]}{100 + i * 4}"
        db.add(Course(
            id=f"crs-{i}",
            code=code,
            title=f"Advanced {dept} Studies {i}",
            department=dept,
            credits=3,
            type="Lecture" if i % 4 != 0 else "Lab",
            color_tag=["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"][i % 4]
        ))

    # Seed Faculty Unavailabilities
    db.add(FacultyUnavailability(
        id="fac-unavail-1",
        faculty_id="fac-1",
        day="Monday",
        period_id="P1",
        reason="Academic Council Steering Meeting",
        is_recurrent=True
    ))
    db.add(FacultyUnavailability(
        id="fac-unavail-2",
        faculty_id="fac-5",
        day="Friday",
        period_id="P8",
        reason="Research Lab Grant Review",
        is_recurrent=True
    ))
    db.add(FacultyUnavailability(
        id="fac-unavail-3",
        faculty_id="fac-8",
        day="Wednesday",
        period_id="P9",
        reason="Ph.D. Defense Committee",
        is_recurrent=True
    ))

    # Seed Room Unavailabilities (Maintenance Windows)
    db.add(RoomUnavailability(
        id="rm-unavail-1",
        room_id="rm-9",
        day="Wednesday",
        period_id="P1",
        reason="High-Performance GPU Cluster Scheduled Maintenance",
        is_recurrent=True
    ))
    db.add(RoomUnavailability(
        id="rm-unavail-2",
        room_id="rm-22",
        day="Thursday",
        period_id="P8",
        reason="Institute Convocation Rehearsal",
        is_recurrent=True
    ))

    # Seed 189 Teaching Sessions totaling exactly 243 Teaching Hours:
    # 27 three-hour lab blocks (27 * 3 = 81 hours) + 162 one-hour lectures (162 * 1 = 162 hours) = 243 hours
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    periods = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9"]
    session_count = 0

    # 1. 27 Three-Hour Labs (Duration = 3 hours each = 81 hours)
    lab_courses = ["crs-5", "crs-6", "crs-9", "crs-12"]
    for i in range(1, 28):
        session_count += 1
        grp_id = f"grp-{((i - 1) % 14) + 1}"
        c_id = lab_courses[(i - 1) % len(lab_courses)]
        f_id = f"fac-{((i - 1) % 20) + 1}"
        r_id = f"rm-{9 + ((i - 1) % 7)}"  # assign candidate lab room (rm-9 to rm-16)
        
        # Valid start periods for 3h labs are P2 or P6
        day_alloc = days[(i - 1) % 5]
        p_alloc = "P2" if (i % 2 == 1) else "P6"

        sess = TeachingSession(
            id=f"sess-{session_count}",
            course_id=c_id,
            faculty_id=f_id,
            room_id=r_id,
            day=day_alloc,
            period_id=p_alloc,
            duration_periods=3,
            session_type="Lab",
            is_scheduled=True
        )
        db.add(sess)
        db.add(SessionGroupAssociation(
            id=f"assoc-{sess.id}-{grp_id}",
            session_id=sess.id,
            group_id=grp_id,
            is_primary_group=True
        ))

    # 2. 162 One-Hour Lectures/Tutorials (Duration = 1 hour each = 162 hours)
    # Total sessions = 27 + 162 = 189. Total hours = 81 + 162 = 243 hours.
    lecture_courses = [f"crs-{(k % 15) + 1}" for k in range(15)]
    while session_count < 189:
        session_count += 1
        idx = session_count - 28
        grp_id = f"grp-{(idx % 14) + 1}"
        c_id = lecture_courses[idx % len(lecture_courses)]
        f_id = f"fac-{(idx % 40) + 1}"
        r_id = f"rm-{(idx % 8) + 1}"  # Lecture halls rm-1 to rm-8

        # Distribute day and period
        d_idx = (idx // 7) % 5
        p_indices = [0, 1, 2, 3, 5, 6, 7]  # avoiding lunch P5-P6
        p_idx = p_indices[idx % len(p_indices)]

        # Specific constraint test cases:
        is_fixed = (session_count == 30)
        fixed_d = "Tuesday" if is_fixed else None
        fixed_p = "P3" if is_fixed else None

        sess = TeachingSession(
            id=f"sess-{session_count}",
            course_id=c_id,
            faculty_id=f_id,
            room_id=r_id,
            day=fixed_d or days[d_idx],
            period_id=fixed_p or periods[p_idx],
            duration_periods=1,
            session_type="Lecture",
            is_fixed_slot=is_fixed,
            fixed_day=fixed_d,
            fixed_period=fixed_p,
            is_scheduled=True
        )
        db.add(sess)

        # Combined lecture for session 28: both grp-1 and grp-2
        if session_count == 28:
            db.add(SessionGroupAssociation(
                id=f"assoc-{sess.id}-grp-1",
                session_id=sess.id,
                group_id="grp-1",
                is_primary_group=True
            ))
            db.add(SessionGroupAssociation(
                id=f"assoc-{sess.id}-grp-2",
                session_id=sess.id,
                group_id="grp-2",
                is_primary_group=False
            ))
        else:
            db.add(SessionGroupAssociation(
                id=f"assoc-{sess.id}-{grp_id}",
                session_id=sess.id,
                group_id=grp_id,
                is_primary_group=True
            ))


    # Seed 41 Midsem Exams
    for i in range(1, 42):
        db.add(Examination(
            id=f"ex-{i:02d}",
            exam_type="Midsem",
            date=f"2026-11-{18 + (i % 8):02d}",
            day=days[i % 5],
            time_slot="09:30 - 11:30 AM" if i % 2 == 0 else "02:00 - 04:00 PM",
            course_id=f"crs-{(i % 15) + 1}",
            student_group_name=f"CSE-{(i % 4) + 1}A",
            enrolled_students=55 + (i % 15),
            allocated_rooms=[
                {"room_id": f"rm-{(i % 6) + 1}", "room_name": f"LH-10{(i % 3) + 1}", "allocated_seats": 45, "invigilator": faculty_names[i % 30]}
            ]
        ))

    # Seed 25 Pending Booking Requests
    booking_titles = [
        "Autonomous Rover Workshop 2026", "Spectra Tech Fest: National Hackathon Pitch",
        "Google Developer Student Clubs Cloud Sprint", "Guest Lecture: Emerging Quantum Architectures",
        "E-Cell Founder Stories: Pre-Series A", "Annual Classical Dance & Music Auditions",
        "Industry 4.0 IoT Gateway Hardware Workshop", "Rotaract Blood Donation & Health Camp",
        "Spectra RoboWars Arena Construction", "Literary & Debating Society Finals",
        "Alumni Mentorship Round Table", "Civil Engineering Bridge Showcase",
        "Spectra Music Night Sound Check", "IEEE Paper Writing Clinic",
        "Department Board of Studies Meeting", "Kavita & Poetry Evening",
        "Aeromodelling Drone Flight Simulation", "Placement Mock Technical Interviews",
        "Baja SAE Vehicle Tuning", "Open Source Contributor Sprint",
        "Finance & FinTech Trading Simulation", "Clean Campus Green Drive Briefing",
        "Competitive Programming Contest", "Photography & Media Guild Exhibition",
        "TEDxChilikaInstitute Stage Rehearsals"
    ]
    for i, title in enumerate(booking_titles):
        db.add(BookingRequest(
            id=f"req-{i+1:02d}",
            event_title=title,
            event_category="Fest" if "Spectra" in title else "Workshop",
            requested_by_id="user-club" if i % 2 == 0 else "user-coord",
            requester_name="Ananya Dash" if i % 2 == 0 else "Dr. Sunita Mohanty",
            requester_role="club" if i % 2 == 0 else "coordinator",
            requester_email="club@cit.edu" if i % 2 == 0 else "coordinator@cit.edu",
            club_or_dept="CIT Robotics Club" if i % 2 == 0 else "CSE Department",
            room_id=f"rm-{(i % 10) + 1}",
            date=f"2026-11-{(i % 12) + 5:02d}",
            start_time="14:00",
            end_time="17:00",
            period_ids=["P7", "P8", "P9"],
            expected_attendees=60 + (i * 10),
            description="Official campus co-curricular / department activity awaiting approval.",
            status="Pending",
            priority_score=60 + (i % 30)
        ))

    # Seed Initial Notifications if empty
    if db.query(Notification).count() == 0:
        db.add_all([
            Notification(
                id="notif-1",
                title="Backend API: FastAPI Connected",
                description="PostgreSQL & SQLite models loaded with JWT authentication and audit trails.",
                type="success",
                read=False,
                link_module="analytics",
                link_sub_page="solver-stats"
            ),
            Notification(
                id="notif-2",
                title="Disruption Alert: Faculty Sick Leave",
                description="Dr. Debabrata Samal reported medical leave for Tuesday. 3 slots need rearrangement.",
                type="alert",
                read=False,
                link_module="rescheduling",
                link_sub_page="disruptions"
            ),
            Notification(
                id="notif-3",
                title="25 Pending Venue Bookings",
                description="Autonomous Rover Workshop & Spectra Hackathon requests require approval.",
                type="warning",
                read=False,
                link_module="venues",
                link_sub_page="requests"
            ),
            Notification(
                id="notif-4",
                title="CP-SAT Solver Baseline Generated",
                description="Optimal timetable baseline computed with 99.4% constraint satisfaction score.",
                type="success",
                read=True,
                link_module="timetable",
                link_sub_page="generator"
            )
        ])

    # Seed Initial Disruptions if empty
    if db.query(Disruption).count() == 0:
        db.add_all([
            Disruption(
                id="dis-1",
                title="Dr. Debabrata Samal Medical Leave",
                type="Faculty Leave",
                affected_date="2026-11-04 (Tuesday)",
                affected_entity="Dr. Debabrata Samal",
                affected_slots_count=3,
                status="Unresolved",
                reported_at="2026-10-30 18:20",
                proposed_resolution="Substitute CS303 lecture slot with Prof. Manisha Choudhury or swap with Friday tutorial."
            ),
            Disruption(
                id="dis-2",
                title="Turing Block CS-Lab-2 Power Distribution Maintenance",
                type="Room Maintenance",
                affected_date="2026-11-05 (Wednesday)",
                affected_entity="CS-Lab-2 (Systems)",
                affected_slots_count=4,
                status="Under Optimization",
                reported_at="2026-10-30 11:00",
                proposed_resolution="Shift DBMS Lab session of CSE-3A to Turing CS-Lab-3 (Cloud & IoT) during P6-P7."
            ),
            Disruption(
                id="dis-3",
                title="State Governor Academic Convocation Visit",
                type="Campus Event",
                affected_date="2026-11-17 (Tuesday)",
                affected_entity="Chilika Auditorium & Aryabhata Block 1st Floor",
                affected_slots_count=12,
                status="Unresolved",
                reported_at="2026-10-29 09:15",
                proposed_resolution="Relocate LH-101 and LH-102 morning lectures to Bose Wing & Virtual Classroom."
            )
        ])

    # Seed Initial Change Requests if empty
    if db.query(ChangeRequest).count() == 0:
        db.add_all([
            ChangeRequest(
                id="resch-01",
                faculty_id="fac-1",
                course_id="crs-1",
                original_day="Monday",
                original_period="P1",
                original_room_name="LH-101",
                original_group_name="CSE-3A",
                proposed_day="Wednesday",
                proposed_period="P5",
                proposed_room_name="LH-101",
                proposed_group_name="CSE-3A",
                reason="Attending IEEE AI Workshop Steering Committee remote session at 08:00 AM Monday.",
                status="Pending Admin Review",
                conflict_analysis={
                    "hasConflicts": False,
                    "studentConflict": False,
                    "facultyConflict": False,
                    "roomConflict": False,
                    "details": "Zero conflicts detected. All 62 students in CSE-3A, LH-101 and Prof. Tripathy are free at Wednesday P5."
                }
            ),
            ChangeRequest(
                id="resch-02",
                faculty_id="fac-2",
                course_id="crs-2",
                original_day="Tuesday",
                original_period="P3",
                original_room_name="LH-201",
                original_group_name="CSE-4A",
                proposed_day="Friday",
                proposed_period="P5",
                proposed_room_name="LH-201",
                proposed_group_name="CSE-4A",
                reason="Invigilator duty conflict with PhD comprehensive viva exam.",
                status="Pending Admin Review",
                conflict_analysis={
                    "hasConflicts": True,
                    "studentConflict": True,
                    "facultyConflict": False,
                    "roomConflict": False,
                    "details": "Warning: 24 students in CSE-4A have Elective CS512 in LH-203 during Friday P5."
                }
            )
        ])

    # Seed 1 active Timetable Version
    if db.query(TimetableVersion).count() == 0:
        db.add(TimetableVersion(
            id="v-1.0.0",
            version_name="Master Fall 2026 Baseline",
            academic_term="Fall 2026 (Semester VII)",
            is_active=True,
            satisfaction_score=99.4,
            total_sessions=189,
            conflicts_count=0
        ))

    db.commit()


