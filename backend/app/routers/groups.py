import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.student_group import StudentGroup
from backend.app.models.user import User
from backend.app.schemas.group import StudentGroupResponse, StudentGroupCreate, StudentGroupUpdate
from backend.app.utils.security import require_roles
from backend.app.services.audit_service import record_audit_log

router = APIRouter(prefix="/groups", tags=["Student Groups"])

@router.get("", response_model=List[StudentGroupResponse])
def get_student_groups(
    department: Optional[str] = None,
    semester: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(StudentGroup)
    if department:
        query = query.filter(StudentGroup.department.ilike(f"%{department}%"))
    if semester:
        query = query.filter(StudentGroup.semester == semester)
    return query.all()

@router.get("/{group_id}", response_model=StudentGroupResponse)
def get_student_group(group_id: str, db: Session = Depends(get_db)):
    grp = db.query(StudentGroup).filter((StudentGroup.id == group_id) | (StudentGroup.name == group_id)).first()
    if not grp:
        raise HTTPException(status_code=404, detail="Student group not found")
    return grp

@router.post("", response_model=StudentGroupResponse)
def create_student_group(
    grp_in: StudentGroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    existing = db.query(StudentGroup).filter(StudentGroup.name == grp_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student group with this name already exists")

    grp = StudentGroup(
        id=f"grp-{uuid.uuid4().hex[:8]}",
        **grp_in.model_dump()
    )
    db.add(grp)
    db.commit()
    db.refresh(grp)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="GROUP_CREATE",
        entity_type="student_group",
        entity_id=grp.id,
        details={"name": grp.name, "department": grp.department, "strength": grp.strength}
    )
    return grp

@router.put("/{group_id}", response_model=StudentGroupResponse)
def update_student_group(
    group_id: str,
    grp_update: StudentGroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "DEPARTMENT_COORDINATOR"]))
):
    grp = db.query(StudentGroup).filter(StudentGroup.id == group_id).first()
    if not grp:
        raise HTTPException(status_code=404, detail="Student group not found")

    update_data = grp_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(grp, field, val)

    db.commit()
    db.refresh(grp)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="GROUP_UPDATE",
        entity_type="student_group",
        entity_id=grp.id,
        details=update_data
    )
    return grp

@router.delete("/{group_id}")
def delete_student_group(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    grp = db.query(StudentGroup).filter(StudentGroup.id == group_id).first()
    if not grp:
        raise HTTPException(status_code=404, detail="Student group not found")

    db.delete(grp)
    db.commit()

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="GROUP_DELETE",
        entity_type="student_group",
        entity_id=group_id
    )
    return {"success": True, "message": f"Student group {group_id} deleted"}
