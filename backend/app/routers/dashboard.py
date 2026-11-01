from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.room import Room
from backend.app.models.faculty import Faculty
from backend.app.models.student_group import StudentGroup
from backend.app.models.course import Course
from backend.app.models.session import TeachingSession
from backend.app.models.exam import Examination
from backend.app.models.booking import BookingRequest
from backend.app.models.change_request import ChangeRequest
from backend.app.utils.security import get_current_user, require_roles
from backend.app.services.analytics_service import compute_analytics_overview
from backend.app.services.timetable_service import get_timetable_for_faculty

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/admin")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    overview = compute_analytics_overview(db)
    pending_bookings = db.query(BookingRequest).filter(BookingRequest.status == "Pending").limit(5).all()
    recent_exams = db.query(Examination).limit(4).all()
    pending_reschedules = db.query(ChangeRequest).filter(ChangeRequest.status.contains("Pending")).all()

    return {
        "overview": overview,
        "pending_bookings": pending_bookings,
        "upcoming_exams": recent_exams,
        "pending_reschedules": pending_reschedules,
        "current_user": current_user
    }

@router.get("/faculty")
def get_faculty_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"]))
):
    # Match faculty by name or email
    faculty_record = db.query(Faculty).filter(
        (Faculty.email == current_user.email) | (Faculty.name == current_user.name)
    ).first()

    my_slots = []
    if faculty_record:
        my_slots = get_timetable_for_faculty(db, faculty_record.id)
    else:
        # Default preview for faculty
        first_fac = db.query(Faculty).first()
        if first_fac:
            my_slots = get_timetable_for_faculty(db, first_fac.id)

    unavailability = []
    if faculty_record:
        unavailability = faculty_record.unavailability

    return {
        "faculty": faculty_record,
        "weekly_slots": my_slots,
        "total_teaching_hours": len(my_slots),
        "unavailability": unavailability,
        "invigilation_duties": [
            {"date": "2026-11-18", "slot": "09:30 - 11:30 AM", "room": "LH-201", "course": "CS301 Algorithms"}
        ]
    }

@router.get("/coordinator")
def get_coordinator_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["DEPARTMENT_COORDINATOR", "ADMIN"]))
):
    dept = current_user.department or "Computer Science"
    dept_faculty = db.query(Faculty).filter(Faculty.department.ilike(f"%{dept}%")).all()
    dept_rooms = db.query(Room).filter(Room.type.in_(["Computer Lab", "Hardware Lab"])).all()
    lab_requests = db.query(BookingRequest).filter(
        BookingRequest.status == "Pending"
    ).limit(6).all()
    change_requests = db.query(ChangeRequest).all()

    return {
        "department": dept,
        "total_faculty": len(dept_faculty),
        "total_labs": len(dept_rooms),
        "lab_requests": lab_requests,
        "change_requests": change_requests,
        "labs_status": dept_rooms
    }

@router.get("/club")
def get_club_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["CLUB_REPRESENTATIVE", "ADMIN"]))
):
    my_bookings = db.query(BookingRequest).filter(
        (BookingRequest.requested_by_id == current_user.id) |
        (BookingRequest.requester_email == current_user.email)
    ).all()

    venues = db.query(Room).filter(Room.type.in_(["Auditorium", "Seminar Hall", "Lecture Hall"])).all()

    return {
        "club_name": current_user.club_name or "CIT Robotics & AI Club",
        "total_submitted": len(my_bookings),
        "pending_count": len([b for b in my_bookings if b.status == "Pending"]),
        "approved_count": len([b for b in my_bookings if b.status == "Approved"]),
        "my_bookings": my_bookings,
        "available_venues": venues
    }
