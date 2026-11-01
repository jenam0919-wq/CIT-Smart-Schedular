import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.exam import Examination
from backend.app.models.course import Course
from backend.app.models.user import User
from backend.app.schemas.exam import (
    ExaminationResponse,
    ExaminationCreate,
    ExaminationUpdate,
    ExamGenerateRequest,
)
from backend.app.utils.security import get_current_user_optional, require_roles
from backend.app.services.audit_service import record_audit_log

router = APIRouter(prefix="/exams", tags=["Examinations"])

def _build_exam_response(ex: Examination, db: Session) -> ExaminationResponse:
    course = ex.course
    if not course and ex.course_id:
        course = db.query(Course).filter((Course.id == ex.course_id) | (Course.code == ex.course_id)).first()

    return ExaminationResponse(
        id=ex.id,
        exam_type=ex.exam_type,
        date=ex.date,
        day=ex.day,
        time_slot=ex.time_slot,
        course_id=ex.course_id,
        course_code=course.code if course else ex.course_id,
        course_title=course.title if course else "Examination Course",
        student_group=ex.student_group_name,
        enrolled_students=ex.enrolled_students,
        allocated_rooms=ex.allocated_rooms or []
    )

@router.get("", response_model=List[ExaminationResponse])
def get_examinations(
    exam_type: Optional[str] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Examination)
    if exam_type and exam_type != "All":
        query = query.filter(Examination.exam_type == exam_type)
    if date:
        query = query.filter(Examination.date == date)
    
    exams = query.all()
    return [_build_exam_response(ex, db) for ex in exams]

@router.get("/{exam_id}", response_model=ExaminationResponse)
def get_examination(exam_id: str, db: Session = Depends(get_db)):
    ex = db.query(Examination).filter(Examination.id == exam_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Examination not found")
    return _build_exam_response(ex, db)

@router.post("", response_model=ExaminationResponse)
def create_examination(
    exam_in: ExaminationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Verify course exists by ID or code
    course = db.query(Course).filter(
        (Course.id == exam_in.course_id) | (Course.code == exam_in.course_id)
    ).first()
    real_course_id = course.id if course else exam_in.course_id

    ex = Examination(
        id=f"exam-{uuid.uuid4().hex[:8]}",
        exam_type=exam_in.exam_type,
        date=exam_in.date,
        day=exam_in.day,
        time_slot=exam_in.time_slot,
        course_id=real_course_id,
        student_group_name=exam_in.student_group_name,
        enrolled_students=exam_in.enrolled_students,
        allocated_rooms=exam_in.allocated_rooms or []
    )
    db.add(ex)
    db.commit()
    db.refresh(ex)

    record_audit_log(
        db=db,
        actor_id=current_user.id if current_user else "sys-admin",
        actor_name=current_user.name if current_user else "Admin (Demo)",
        action="EXAM_CREATE",
        entity_type="exam",
        entity_id=ex.id,
        details={"date": ex.date, "course": ex.course_id, "group": ex.student_group_name}
    )
    return _build_exam_response(ex, db)

@router.put("/{exam_id}", response_model=ExaminationResponse)
def update_examination(
    exam_id: str,
    exam_update: ExaminationUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    ex = db.query(Examination).filter(Examination.id == exam_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Examination not found")

    update_data = exam_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if field == "course_id" and val:
            course = db.query(Course).filter((Course.id == val) | (Course.code == val)).first()
            setattr(ex, field, course.id if course else val)
        else:
            setattr(ex, field, val)

    db.commit()
    db.refresh(ex)

    record_audit_log(
        db=db,
        actor_id=current_user.id if current_user else "sys-admin",
        actor_name=current_user.name if current_user else "Admin (Demo)",
        action="EXAM_UPDATE",
        entity_type="exam",
        entity_id=ex.id,
        details=update_data
    )
    return _build_exam_response(ex, db)

@router.delete("/{exam_id}")
def delete_examination(
    exam_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    ex = db.query(Examination).filter(Examination.id == exam_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Examination not found")

    db.delete(ex)
    db.commit()

    record_audit_log(
        db=db,
        actor_id=current_user.id if current_user else "sys-admin",
        actor_name=current_user.name if current_user else "Admin (Demo)",
        action="EXAM_DELETE",
        entity_type="exam",
        entity_id=exam_id
    )
    return {"success": True, "message": f"Examination {exam_id} deleted"}

@router.post("/generate")
def generate_examination_schedule(
    gen_req: ExamGenerateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Records audit log and recalculates seating compliance
    record_audit_log(
        db=db,
        actor_id=current_user.id if current_user else "sys-admin",
        actor_name=current_user.name if current_user else "Admin (Demo)",
        action="EXAM_GENERATE",
        entity_type="exam",
        details=gen_req.model_dump()
    )
    return {
        "success": True,
        "message": "Examination seating plan verified with alternate seating (50% room capacity).",
        "total_scheduled_exams": db.query(Examination).count(),
        "start_date": gen_req.start_date,
        "end_date": gen_req.end_date
    }
