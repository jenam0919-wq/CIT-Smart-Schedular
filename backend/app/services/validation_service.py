from typing import Tuple, List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.room import Room, RoomUnavailability
from backend.app.models.session import TeachingSession
from backend.app.models.booking import BookingRequest
from backend.app.models.user import User

def validate_not_self_approval(requester_id: str, approver_id: str) -> None:
    """Security rule: Nobody can approve their own request."""
    if requester_id == approver_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Users are strictly prohibited from approving their own requests."
        )

def check_room_capacity(room: Room, required_capacity: int) -> Tuple[bool, str]:
    if room.capacity < required_capacity:
        return False, f"Room capacity ({room.capacity}) is insufficient for {required_capacity} attendees."
    return True, "Capacity requirement satisfied."

def check_room_availability(
    db: Session,
    room_id: str,
    date: str,
    period_ids: List[str],
    exclude_booking_id: Optional[str] = None
) -> Tuple[bool, List[str]]:
    """Checks room unavailability and conflicting bookings."""
    conflicts = []

    # Check maintenance or manual unavailability
    unavail = db.query(RoomUnavailability).filter(
        RoomUnavailability.room_id == room_id,
        (RoomUnavailability.specific_date == date) | (RoomUnavailability.is_recurrent == True)
    ).all()
    for u in unavail:
        if u.period_id in period_ids or u.period_id is None:
            conflicts.append(f"Room maintenance / lock: {u.reason}")

    # Check existing approved bookings
    query = db.query(BookingRequest).filter(
        BookingRequest.room_id == room_id,
        BookingRequest.date == date,
        BookingRequest.status == "Approved"
    )
    if exclude_booking_id:
        query = query.filter(BookingRequest.id != exclude_booking_id)
    
    existing_bookings = query.all()
    for b in existing_bookings:
        overlap = set(b.period_ids or []).intersection(set(period_ids))
        if overlap:
            conflicts.append(f"Conflict with approved event '{b.event_title}' during {', '.join(overlap)}")

    return (len(conflicts) == 0, conflicts)
