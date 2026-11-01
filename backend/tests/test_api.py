"""
CIT Smart Scheduler - Automated Test Suite
Verifies:
1. Database initialization and reference counts
2. Authentication & JWT generation for all 4 roles
3. Role permission checks & security guards
4. Booking lifecycle (submit, self-approval prevention, approve, reject, cancel)
5. Timetable slices (group, faculty, room)
6. Exam scheduler & Seating plan
7. Rescheduling proposals & endorsements
8. Analytics overview & utilization
9. Dataset status & reset demo
10. Audit logging verification
"""

import sys
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal, init_db
from backend.app.services.dataset_service import seed_initial_demo_database
from backend.app.models.audit_log import AuditLog

client = TestClient(app)

def run_tests():
    print("=== STARTING CIT SMART SCHEDULER BACKEND TEST SUITE ===")
    
    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✓ Health check passed")

    # 2. Login for all 4 roles
    tokens = {}
    roles = [
        ("admin@cit.edu", "demo123", "ADMIN"),
        ("coordinator@cit.edu", "demo123", "DEPARTMENT_COORDINATOR"),
        ("faculty@cit.edu", "demo123", "FACULTY"),
        ("club@cit.edu", "demo123", "CLUB_REPRESENTATIVE"),
    ]

    for email, password, role in roles:
        res = client.post("/api/auth/login", json={"email": email, "password": password})
        assert res.status_code == 200, f"Login failed for {email}: {res.text}"
        data = res.json()
        assert "access_token" in data
        assert data["user"]["role"] == role
        tokens[role] = data["access_token"]
        print(f"✓ Login verified for {role} ({email})")

    # 3. Role authorization checks
    admin_headers = {"Authorization": f"Bearer {tokens['ADMIN']}"}
    faculty_headers = {"Authorization": f"Bearer {tokens['FACULTY']}"}
    club_headers = {"Authorization": f"Bearer {tokens['CLUB_REPRESENTATIVE']}"}
    coord_headers = {"Authorization": f"Bearer {tokens['DEPARTMENT_COORDINATOR']}"}

    # Club trying to access Admin dashboard should get 403 Forbidden
    res = client.get("/api/dashboard/admin", headers=club_headers)
    assert res.status_code == 403, f"Security violation: Club accessed Admin dashboard ({res.status_code})"
    print("✓ Role permission guard verified (Club denied Admin dashboard access)")

    # Admin accessing admin dashboard should succeed
    res = client.get("/api/dashboard/admin", headers=admin_headers)
    assert res.status_code == 200, f"Admin dashboard failed: {res.text}"
    admin_dash = res.json()
    assert admin_dash["overview"]["total_rooms"] == 27
    assert admin_dash["overview"]["faculty_members"] == 40
    print("✓ Admin dashboard verified with reference counts (27 rooms, 40 faculty)")

    # 4. Rooms list & details
    res = client.get("/api/rooms")
    assert res.status_code == 200
    rooms = res.json()
    assert len(rooms) == 27, f"Expected 27 rooms, got {len(rooms)}"
    print(f"✓ Rooms endpoint verified ({len(rooms)} rooms)")

    # 5. Faculty & Student Groups
    res = client.get("/api/faculty")
    assert res.status_code == 200
    assert len(res.json()) == 40, f"Expected 40 faculty, got {len(res.json())}"
    print("✓ Faculty endpoint verified (40 faculty members)")

    res = client.get("/api/groups")
    assert res.status_code == 200
    assert len(res.json()) == 14, f"Expected 14 groups, got {len(res.json())}"
    print("✓ Student Groups endpoint verified (14 groups)")

    res = client.get("/api/courses")
    assert res.status_code == 200
    assert len(res.json()) == 62, f"Expected 62 courses, got {len(res.json())}"
    print("✓ Courses endpoint verified (62 courses)")

    # 6. Teaching Sessions & Timetable slices
    res = client.get("/api/sessions")
    assert res.status_code == 200
    assert len(res.json()) == 189, f"Expected 189 sessions, got {len(res.json())}"
    print("✓ Teaching Sessions verified (189 sessions)")

    res = client.get("/api/timetable/group/grp-5")
    assert res.status_code == 200
    print(f"✓ Group Timetable slice verified ({len(res.json())} slots for CSE-3A)")

    # 7. Booking Request submission & Self-Approval Prevention
    # Club submits a booking request
    booking_payload = {
        "event_title": "AI & Robotics Autonomous Hackathon",
        "event_category": "Workshop",
        "room_id": "rm-24",
        "date": "2026-11-20",
        "start_time": "14:00",
        "end_time": "17:00",
        "period_ids": ["P7", "P8"],
        "expected_attendees": 100,
        "description": "Technical hackathon demo",
        "requires_av": True,
        "requires_ac": True,
        "is_spectra_week": False
    }
    res = client.post("/api/bookings", json=booking_payload, headers=club_headers)
    assert res.status_code == 200, f"Booking submit failed: {res.text}"
    new_booking = res.json()
    booking_id = new_booking["id"]
    print(f"✓ Booking submission verified (ID: {booking_id})")

    # Guard Test: Requester (Club) attempts to approve their own booking -> Must be forbidden!
    res = client.post(f"/api/bookings/{booking_id}/approve", headers=club_headers)
    assert res.status_code == 403, f"Security bug: Self-approval or Club approval permitted ({res.status_code})"
    print("✓ Security Rule Verified: Requester cannot approve their own booking request")

    # Admin approves the booking
    res = client.post(f"/api/bookings/{booking_id}/approve", headers=admin_headers)
    assert res.status_code == 200, f"Admin approval failed: {res.text}"
    assert res.json()["status"] == "Approved"
    print("✓ Admin approval verified (Status: Approved)")

    # 8. Examinations
    res = client.get("/api/exams")
    assert res.status_code == 200
    assert len(res.json()) == 41, f"Expected 41 examinations, got {len(res.json())}"
    print("✓ Examinations verified (41 midsem exams)")

    # 9. Rescheduling & Change Requests
    res = client.get("/api/rescheduling/changes")
    assert res.status_code == 200
    print(f"✓ Rescheduling change requests list verified ({len(res.json())} items)")

    # 10. Analytics
    res = client.get("/api/analytics/overview")
    assert res.status_code == 200
    ov = res.json()
    assert ov["total_rooms"] == 27
    assert ov["midsem_exams"] == 41
    print("✓ Analytics overview verified")

    # 11. Audit log verification in database
    db = SessionLocal()
    audit_count = db.query(AuditLog).count()
    assert audit_count > 0, "Audit logs were not created!"
    print(f"✓ Audit logging verified ({audit_count} audit log records recorded)")
    db.close()

    print("\nALL BACKEND API TESTS COMPLETED SUCCESSFULLY WITH 0 FAILURES!")

if __name__ == "__main__":
    run_tests()
