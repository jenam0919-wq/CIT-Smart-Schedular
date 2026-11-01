from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.booking import BookingRequest
from backend.app.models.user import User
from backend.app.schemas.booking import (
    BookingRequestCreate,
    BookingRequestResponse,
    BookingDecisionRequest
)
from backend.app.utils.security import get_current_user, require_roles
from backend.app.services.booking_service import (
    create_booking_request,
    approve_booking_request,
    reject_booking_request,
    cancel_booking_request
)

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.get("", response_model=List[BookingRequestResponse])
def get_bookings(
    status: Optional[str] = None,
    room_id: Optional[str] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(BookingRequest)
    if status and status != "All":
        query = query.filter(BookingRequest.status == status)
    if room_id:
        query = query.filter(BookingRequest.room_id == room_id)
    if date:
        query = query.filter(BookingRequest.date == date)
    
    bookings = query.order_by(BookingRequest.created_at.desc()).all()
    results = []
    for b in bookings:
        resp = BookingRequestResponse.model_validate(b)
        resp.room_name = b.room.name if b.room else b.room_id
        results.append(resp)
    return results

@router.post("", response_model=BookingRequestResponse)
def submit_booking(
    booking_in: BookingRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    b = create_booking_request(db, booking_in, current_user)
    resp = BookingRequestResponse.model_validate(b)
    resp.room_name = b.room.name if b.room else b.room_id
    return resp

@router.get("/{booking_id}", response_model=BookingRequestResponse)
def get_booking_details(booking_id: str, db: Session = Depends(get_db)):
    b = db.query(BookingRequest).filter(BookingRequest.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking request not found")
    resp = BookingRequestResponse.model_validate(b)
    resp.room_name = b.room.name if b.room else b.room_id
    return resp

@router.post("/{booking_id}/approve", response_model=BookingRequestResponse)
def approve_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "DEPARTMENT_COORDINATOR"]))
):
    b = approve_booking_request(db, booking_id, current_user)
    resp = BookingRequestResponse.model_validate(b)
    resp.room_name = b.room.name if b.room else b.room_id
    return resp

@router.post("/{booking_id}/reject", response_model=BookingRequestResponse)
def reject_booking(
    booking_id: str,
    decision_in: BookingDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "DEPARTMENT_COORDINATOR"]))
):
    b = reject_booking_request(db, booking_id, decision_in, current_user)
    resp = BookingRequestResponse.model_validate(b)
    resp.room_name = b.room.name if b.room else b.room_id
    return resp

@router.post("/{booking_id}/cancel", response_model=BookingRequestResponse)
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    b = cancel_booking_request(db, booking_id, current_user)
    resp = BookingRequestResponse.model_validate(b)
    resp.room_name = b.room.name if b.room else b.room_id
    return resp
