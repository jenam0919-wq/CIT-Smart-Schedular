import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.course import Course
from backend.app.models.user import User
from backend.app.schemas.course import CourseResponse, CourseCreate, CourseUpdate
from backend.app.utils.security import require_roles
from backend.app.services.audit_service import record_audit_log

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("", response_model=List[CourseResponse])
def get_courses(
    department: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Course)
    if department:
        query = query.filter(Course.department.ilike(f"%{department}%"))
    if type:
        query = query.filter(Course.type == type)
    return query.all()

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter((Course.id == course_id) | (Course.code == course_id)).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("", response_model=CourseResponse)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    existing = db.query(Course).filter(Course.code == course_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course with this code already exists")

    course = Course(
        id=f"crs-{uuid.uuid4().hex[:8]}",
        **course_in.model_dump()
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="COURSE_CREATE",
        entity_type="course",
        entity_id=course.id,
        details={"code": course.code, "title": course.title}
    )
    return course

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: str,
    course_update: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "DEPARTMENT_COORDINATOR"]))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    update_data = course_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(course, field, val)

    db.commit()
    db.refresh(course)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="COURSE_UPDATE",
        entity_type="course",
        entity_id=course.id,
        details=update_data
    )
    return course

@router.delete("/{course_id}")
def delete_course(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="COURSE_DELETE",
        entity_type="course",
        entity_id=course_id
    )
    return {"success": True, "message": f"Course {course_id} deleted"}
