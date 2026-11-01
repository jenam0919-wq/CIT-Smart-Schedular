import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.faculty import Faculty, FacultyUnavailability
from backend.app.models.user import User
from backend.app.schemas.faculty import (
    FacultyResponse,
    FacultyCreate,
    FacultyUpdate,
    FacultyUnavailabilityCreate,
    FacultyUnavailabilityResponse,
)
from backend.app.utils.security import get_current_user, require_roles
from backend.app.services.audit_service import record_audit_log

router = APIRouter(prefix="/faculty", tags=["Faculty"])

@router.get("", response_model=List[FacultyResponse])
def get_faculty_list(
    department: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Faculty)
    if department and department != "All":
        query = query.filter(Faculty.department.ilike(f"%{department}%"))
    return query.all()

@router.get("/{faculty_id}", response_model=FacultyResponse)
def get_faculty_member(faculty_id: str, db: Session = Depends(get_db)):
    fac = db.query(Faculty).filter((Faculty.id == faculty_id) | (Faculty.name == faculty_id)).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Faculty member not found")
    return fac

@router.post("/unavailability", response_model=FacultyUnavailabilityResponse)
def mark_faculty_unavailability(
    unavail_in: FacultyUnavailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN", "DEPARTMENT_COORDINATOR"]))
):
    faculty = db.query(Faculty).filter(Faculty.id == unavail_in.faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty record not found")

    unavail = FacultyUnavailability(
        id=f"unavail-{uuid.uuid4().hex[:8]}",
        faculty_id=unavail_in.faculty_id,
        day=unavail_in.day,
        period_id=unavail_in.period_id,
        specific_date=unavail_in.specific_date,
        reason=unavail_in.reason,
        is_recurrent=unavail_in.is_recurrent
    )
    db.add(unavail)
    db.commit()
    db.refresh(unavail)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="FACULTY_UNAVAILABILITY_MARK",
        entity_type="faculty",
        entity_id=faculty.id,
        details={"day": unavail.day, "period": unavail.period_id, "reason": unavail.reason}
    )
    return unavail

@router.post("", response_model=FacultyResponse)
def create_faculty(
    faculty_in: FacultyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    existing = db.query(Faculty).filter(Faculty.email == faculty_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Faculty member with this email already exists")

    fac = Faculty(
        id=f"fac-{uuid.uuid4().hex[:8]}",
        **faculty_in.model_dump()
    )
    db.add(fac)
    db.commit()
    db.refresh(fac)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="FACULTY_CREATE",
        entity_type="faculty",
        entity_id=fac.id,
        details={"name": fac.name, "email": fac.email, "department": fac.department}
    )
    return fac

@router.put("/{faculty_id}", response_model=FacultyResponse)
def update_faculty(
    faculty_id: str,
    faculty_update: FacultyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "DEPARTMENT_COORDINATOR"]))
):
    fac = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Faculty member not found")

    update_data = faculty_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(fac, field, val)

    db.commit()
    db.refresh(fac)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="FACULTY_UPDATE",
        entity_type="faculty",
        entity_id=fac.id,
        details=update_data
    )
    return fac

@router.delete("/{faculty_id}")
def delete_faculty(
    faculty_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    fac = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Faculty member not found")

    db.delete(fac)
    db.commit()

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="FACULTY_DELETE",
        entity_type="faculty",
        entity_id=faculty_id
    )
    return {"success": True, "message": f"Faculty {faculty_id} deleted"}

