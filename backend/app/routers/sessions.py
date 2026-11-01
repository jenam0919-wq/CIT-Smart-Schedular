from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.session import TeachingSession
from backend.app.schemas.session import TeachingSessionResponse, TimetableSlotView
from backend.app.services.timetable_service import (
    format_session_to_slot_views,
    get_timetable_for_group,
    get_timetable_for_faculty,
    get_timetable_for_room
)

router = APIRouter(tags=["Sessions & Timetable"])

@router.get("/sessions", response_model=List[TeachingSessionResponse])
def get_sessions(
    day: Optional[str] = None,
    period_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TeachingSession)
    if day:
        query = query.filter(TeachingSession.day == day)
    if period_id:
        query = query.filter(TeachingSession.period_id == period_id)
    
    sessions = query.all()
    results = []
    for s in sessions:
        group_names = [assoc.student_group.name for assoc in s.group_associations if assoc.student_group]
        results.append(
            TeachingSessionResponse(
                id=s.id,
                course_id=s.course_id,
                faculty_id=s.faculty_id,
                room_id=s.room_id,
                day=s.day,
                period_id=s.period_id,
                duration_periods=s.duration_periods,
                session_type=s.session_type,
                is_fixed_slot=s.is_fixed_slot,
                fixed_day=s.fixed_day,
                fixed_period=s.fixed_period,
                is_scheduled=s.is_scheduled,
                course_code=s.course.code if s.course else None,
                course_name=s.course.title if s.course else None,
                faculty_name=s.faculty.name if s.faculty else None,
                room_name=s.room.name if s.room else None,
                group_names=group_names,
                color_tag=s.course.color_tag if s.course else "#3B82F6"
            )
        )
    return results

@router.get("/sessions/{session_id}", response_model=TeachingSessionResponse)
def get_session(session_id: str, db: Session = Depends(get_db)):
    s = db.query(TeachingSession).filter(TeachingSession.id == session_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Teaching session not found")
    group_names = [assoc.student_group.name for assoc in s.group_associations if assoc.student_group]
    return TeachingSessionResponse(
        id=s.id,
        course_id=s.course_id,
        faculty_id=s.faculty_id,
        room_id=s.room_id,
        day=s.day,
        period_id=s.period_id,
        duration_periods=s.duration_periods,
        session_type=s.session_type,
        is_fixed_slot=s.is_fixed_slot,
        fixed_day=s.fixed_day,
        fixed_period=s.fixed_period,
        is_scheduled=s.is_scheduled,
        course_code=s.course.code if s.course else None,
        course_name=s.course.title if s.course else None,
        faculty_name=s.faculty.name if s.faculty else None,
        room_name=s.room.name if s.room else None,
        group_names=group_names,
        color_tag=s.course.color_tag if s.course else "#3B82F6"
    )

@router.get("/timetable/group/{group_id}", response_model=List[TimetableSlotView])
def get_group_timetable(group_id: str, db: Session = Depends(get_db)):
    return get_timetable_for_group(db, group_id)

@router.get("/timetable/faculty/{faculty_id}", response_model=List[TimetableSlotView])
def get_faculty_timetable(faculty_id: str, db: Session = Depends(get_db)):
    return get_timetable_for_faculty(db, faculty_id)

@router.get("/timetable/room/{room_id}", response_model=List[TimetableSlotView])
def get_room_timetable(room_id: str, db: Session = Depends(get_db)):
    return get_timetable_for_room(db, room_id)
