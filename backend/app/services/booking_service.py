import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.booking import BookingRequest
from backend.app.models.room import Room
from backend.app.models.user import User
from backend.app.models.approval import Approval
from backend.app.schemas.booking import BookingRequestCreate, BookingDecisionRequest
from backend.app.services.validation_service import validate_not_self_approval, check_room_availability, check_room_capacity
from backend.app.services.audit_service import record_audit_log

def create_booking_request(
    db: Session,
    booking_in: BookingRequestCreate,
    current_user: User
) -> BookingRequest:
    room = db.query(Room).filter(Room.id == booking_in.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Requested room does not exist")

    # Priority score heuristic (e.g. Spectra week or academic department gets higher baseline)
    priority = 50
    if booking_in.is_spectra_week:
        priority = 90
    elif current_user.role.upper() in ["ADMIN", "DEPARTMENT_COORDINATOR"]:
        priority = 75

    booking = BookingRequest(
        id=f"req-{uuid.uuid4().hex[:8]}",
        event_title=booking_in.event_title,
        event_category=booking_in.event_category,
        requested_by_id=current_user.id,
        requester_name=current_user.name,
        requester_role=current_user.role,
        requester_email=current_user.email,
        club_or_dept=current_user.department or current_user.club_name or "Student Guild",
        room_id=booking_in.room_id,
        date=booking_in.date,
        start_time=booking_in.start_time,
        end_time=booking_in.end_time,
        period_ids=booking_in.period_ids or ["P7", "P8"],
        expected_attendees=booking_in.expected_attendees,
        mandatory_student_groups=booking_in.mandatory_student_groups or [],
        description=booking_in.description,
        requires_av=booking_in.requires_av,
        requires_ac=booking_in.requires_ac,
        is_spectra_week=booking_in.is_spectra_week,
        priority_score=priority,
        status="Pending",
        created_at=datetime.utcnow()
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="BOOKING_SUBMIT",
        entity_type="booking",
        entity_id=booking.id,
        details={"title": booking.event_title, "room_id": booking.room_id, "date": booking.date}
    )
    return booking

def approve_booking_request(
    db: Session,
    booking_id: str,
    approver: User
) -> BookingRequest:
    booking = db.query(BookingRequest).filter(BookingRequest.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking request not found")

    # Security check: User cannot approve their own booking request
    validate_not_self_approval(booking.requested_by_id, approver.id)

    # Role authorization
    approver_role = approver.role.upper()
    if approver_role not in ["ADMIN", "DEPARTMENT_COORDINATOR"]:
        raise HTTPException(status_code=403, detail="Only Admins and Coordinators can approve venue bookings")

    booking.status = "Approved"
    booking.approved_by_id = approver.id
    booking.decision_at = datetime.utcnow()

    # Record approval entry
    approval = Approval(
        id=f"appr-{uuid.uuid4().hex[:8]}",
        entity_type="booking",
        entity_id=booking.id,
        approver_id=approver.id,
        decision="Approved",
        comments="Approved by designated authority"
    )
    db.add(approval)
    db.commit()
    db.refresh(booking)

    record_audit_log(
        db=db,
        actor_id=approver.id,
        actor_name=approver.name,
        action="BOOKING_APPROVE",
        entity_type="booking",
        entity_id=booking.id,
        details={"approved_by": approver.email}
    )
    return booking

def reject_booking_request(
    db: Session,
    booking_id: str,
    decision_in: BookingDecisionRequest,
    reviewer: User
) -> BookingRequest:
    booking = db.query(BookingRequest).filter(BookingRequest.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking request not found")

    validate_not_self_approval(booking.requested_by_id, reviewer.id)

    booking.status = "Rejected"
    booking.approved_by_id = reviewer.id
    booking.decision_reason = decision_in.reason or "Venue reserved for higher-priority academic commitments"
    booking.alternative_suggestion = decision_in.alternative_suggestion or "Consider alternative seminar halls or weekend slots"
    booking.decision_at = datetime.utcnow()

    approval = Approval(
        id=f"appr-{uuid.uuid4().hex[:8]}",
        entity_type="booking",
        entity_id=booking.id,
        approver_id=reviewer.id,
        decision="Rejected",
        comments=booking.decision_reason
    )
    db.add(approval)
    db.commit()
    db.refresh(booking)

    record_audit_log(
        db=db,
        actor_id=reviewer.id,
        actor_name=reviewer.name,
        action="BOOKING_REJECT",
        entity_type="booking",
        entity_id=booking.id,
        details={"reason": booking.decision_reason, "alt_suggestion": booking.alternative_suggestion}
    )
    return booking

def cancel_booking_request(
    db: Session,
    booking_id: str,
    current_user: User
) -> BookingRequest:
    booking = db.query(BookingRequest).filter(BookingRequest.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking request not found")

    # Only requester or admin can cancel
    if booking.requested_by_id != current_user.id and current_user.role.upper() != "ADMIN":
        raise HTTPException(status_code=403, detail="You can only cancel your own booking requests")

    booking.status = "Cancelled"
    booking.decision_at = datetime.utcnow()
    db.commit()
    db.refresh(booking)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="BOOKING_CANCEL",
        entity_type="booking",
        entity_id=booking.id
    )
    return booking
