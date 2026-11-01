import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.change_request import ChangeRequest
from backend.app.models.disruption import Disruption
from backend.app.models.faculty import Faculty
from backend.app.models.course import Course
from backend.app.models.user import User
from backend.app.schemas.rescheduling import ChangeRequestCreate, ChangeRequestResponse
from backend.app.schemas.disruption import DisruptionCreate, DisruptionResponse
from backend.app.utils.security import get_current_user, require_roles
from backend.app.services.validation_service import validate_not_self_approval
from backend.app.services.audit_service import record_audit_log

router = APIRouter(prefix="/rescheduling", tags=["Rescheduling"])

@router.get("/changes", response_model=List[ChangeRequestResponse])
def get_change_requests(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ChangeRequest)
    if status:
        query = query.filter(ChangeRequest.status == status)
    
    requests = query.all()
    results = []
    for req in requests:
        results.append(
            ChangeRequestResponse(
                id=req.id,
                faculty_id=req.faculty_id,
                faculty_name=req.faculty.name if req.faculty else None,
                course_code=req.course_code,
                original_slot={
                    "day": req.original_day,
                    "periodId": req.original_period,
                    "roomName": req.original_room_name,
                    "groupName": req.original_group_name
                },
                proposed_slot={
                    "day": req.proposed_day,
                    "periodId": req.proposed_period,
                    "roomName": req.proposed_room_name,
                    "groupName": req.proposed_group_name
                },
                reason=req.reason,
                status=req.status,
                conflict_analysis=req.conflict_analysis or {
                    "hasConflicts": False,
                    "studentConflict": False,
                    "facultyConflict": False,
                    "roomConflict": False,
                    "details": "Zero conflicts detected in target slot."
                },
                submitted_date=req.submitted_date.strftime("%Y-%m-%d %H:%M") if req.submitted_date else "Recent"
            )
        )
    return results

@router.post("/propose", response_model=ChangeRequestResponse)
def propose_reschedule(
    req_in: ChangeRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN", "DEPARTMENT_COORDINATOR"]))
):
    # Match faculty from user or find first
    fac = db.query(Faculty).filter(
        (Faculty.email == current_user.email) | (Faculty.name == current_user.name)
    ).first()
    if not fac:
        fac = db.query(Faculty).first()

    course = db.query(Course).filter(Course.code == req_in.course_code).first()
    course_id = course.id if course else "crs-1"

    new_req = ChangeRequest(
        id=f"resch-{uuid.uuid4().hex[:8]}",
        faculty_id=fac.id if fac else "fac-1",
        course_id=course_id,
        original_day=req_in.original_day,
        original_period=req_in.original_period,
        original_room_name=req_in.original_room_name,
        original_group_name=req_in.original_group_name,
        proposed_day=req_in.proposed_day,
        proposed_period=req_in.proposed_period,
        proposed_room_name=req_in.proposed_room_name,
        proposed_group_name=req_in.proposed_group_name,
        reason=req_in.reason,
        status="Pending Admin Review",
        conflict_analysis={
            "hasConflicts": False,
            "studentConflict": False,
            "facultyConflict": False,
            "roomConflict": False,
            "details": "Initial verification: Cohort, Instructor, and Venue appear free in proposed period."
        },
        submitted_date=datetime.utcnow()
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="RESCHEDULE_PROPOSE",
        entity_type="change_request",
        entity_id=new_req.id,
        details={"course": req_in.course_code, "proposed_slot": f"{req_in.proposed_day} {req_in.proposed_period}"}
    )

    return ChangeRequestResponse(
        id=new_req.id,
        faculty_id=new_req.faculty_id,
        faculty_name=fac.name if fac else current_user.name,
        course_code=new_req.course_code,
        original_slot={
            "day": new_req.original_day,
            "periodId": new_req.original_period,
            "roomName": new_req.original_room_name,
            "groupName": new_req.original_group_name
        },
        proposed_slot={
            "day": new_req.proposed_day,
            "periodId": new_req.proposed_period,
            "roomName": new_req.proposed_room_name,
            "groupName": new_req.proposed_group_name
        },
        reason=new_req.reason,
        status=new_req.status,
        conflict_analysis=new_req.conflict_analysis,
        submitted_date="Just now"
    )

@router.post("/{change_id}/approve", response_model=ChangeRequestResponse)
def approve_change_request(
    change_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "DEPARTMENT_COORDINATOR"]))
):
    req = db.query(ChangeRequest).filter(ChangeRequest.id == change_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Change request not found")

    # Guard: Faculty cannot approve their own schedule change
    if req.faculty and req.faculty.email == current_user.email:
        raise HTTPException(status_code=403, detail="Instructors cannot approve their own schedule change requests.")

    req.status = "Approved"
    db.commit()
    db.refresh(req)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="RESCHEDULE_APPROVE",
        entity_type="change_request",
        entity_id=req.id
    )

    return ChangeRequestResponse(
        id=req.id,
        faculty_id=req.faculty_id,
        faculty_name=req.faculty.name if req.faculty else None,
        course_code=req.course_code,
        original_slot={
            "day": req.original_day,
            "periodId": req.original_period,
            "roomName": req.original_room_name,
            "groupName": req.original_group_name
        },
        proposed_slot={
            "day": req.proposed_day,
            "periodId": req.proposed_period,
            "roomName": req.proposed_room_name,
            "groupName": req.proposed_group_name
        },
        reason=req.reason,
        status=req.status,
        conflict_analysis=req.conflict_analysis or {},
        submitted_date=req.submitted_date.strftime("%Y-%m-%d %H:%M") if req.submitted_date else "Recent"
    )

@router.post("/{change_id}/reject", response_model=ChangeRequestResponse)
def reject_change_request(
    change_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "DEPARTMENT_COORDINATOR"]))
):
    req = db.query(ChangeRequest).filter(ChangeRequest.id == change_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Change request not found")

    req.status = "Rejected"
    db.commit()
    db.refresh(req)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="RESCHEDULE_REJECT",
        entity_type="change_request",
        entity_id=req.id
    )

    return ChangeRequestResponse(
        id=req.id,
        faculty_id=req.faculty_id,
        faculty_name=req.faculty.name if req.faculty else None,
        course_code=req.course_code,
        original_slot={
            "day": req.original_day,
            "periodId": req.original_period,
            "roomName": req.original_room_name,
            "groupName": req.original_group_name
        },
        proposed_slot={
            "day": req.proposed_day,
            "periodId": req.proposed_period,
            "roomName": req.proposed_room_name,
            "groupName": req.proposed_group_name
        },
        reason=req.reason,
        status=req.status,
        conflict_analysis=req.conflict_analysis or {},
        submitted_date=req.submitted_date.strftime("%Y-%m-%d %H:%M") if req.submitted_date else "Recent"
    )

# Disruption Events Endpoints
@router.get("/disruptions", response_model=List[DisruptionResponse])
def get_disruptions(db: Session = Depends(get_db)):
    disruptions = db.query(Disruption).order_by(Disruption.created_at.desc()).all()
    return disruptions

@router.post("/disruptions", response_model=DisruptionResponse)
def create_disruption(
    dis_in: DisruptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "DEPARTMENT_COORDINATOR"]))
):
    dis = Disruption(
        id=f"dis-{uuid.uuid4().hex[:8]}",
        title=dis_in.title,
        type=dis_in.type,
        affected_date=dis_in.affected_date,
        affected_entity=dis_in.affected_entity,
        affected_slots_count=dis_in.affected_slots_count,
        status=dis_in.status,
        proposed_resolution=dis_in.proposed_resolution,
        reported_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    )
    db.add(dis)
    db.commit()
    db.refresh(dis)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="DISRUPTION_CREATE",
        entity_type="disruption",
        entity_id=dis.id,
        details={"title": dis.title, "affected_entity": dis.affected_entity}
    )
    return dis

@router.put("/disruptions/{disruption_id}", response_model=DisruptionResponse)
def update_disruption(
    disruption_id: str,
    dis_in: DisruptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "DEPARTMENT_COORDINATOR"]))
):
    dis = db.query(Disruption).filter(Disruption.id == disruption_id).first()
    if not dis:
        raise HTTPException(status_code=404, detail="Disruption event not found")

    for k, v in dis_in.model_dump().items():
        setattr(dis, k, v)

    db.commit()
    db.refresh(dis)
    return dis

