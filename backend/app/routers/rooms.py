import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.room import Room, RoomUnavailability
from backend.app.models.user import User
from backend.app.schemas.room import RoomCreate, RoomUpdate, RoomResponse, RoomUnavailabilityCreate
from backend.app.utils.security import get_current_user, require_roles
from backend.app.services.audit_service import record_audit_log

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("", response_model=List[RoomResponse])
def get_rooms(
    type: Optional[str] = None,
    min_capacity: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Room)
    if type and type != "All":
        query = query.filter(Room.type == type)
    if min_capacity:
        query = query.filter(Room.capacity >= min_capacity)
    return query.all()

@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter((Room.id == room_id) | (Room.name == room_id)).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.get("/{room_id}/availability")
def check_room_availability(
    room_id: str,
    day: Optional[str] = Query(None, description="Day of the week e.g. Monday"),
    period_id: Optional[str] = Query(None, description="Period code e.g. P1"),
    date: Optional[str] = Query(None, description="Specific date YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    room = db.query(Room).filter((Room.id == room_id) | (Room.name == room_id)).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    is_available = True
    reason = None

    # Check RoomUnavailability
    unavail_query = db.query(RoomUnavailability).filter(RoomUnavailability.room_id == room.id)
    if day:
        unavail_query = unavail_query.filter(RoomUnavailability.day == day)
    if period_id:
        unavail_query = unavail_query.filter(RoomUnavailability.period_id == period_id)
    if date:
        unavail_query = unavail_query.filter(RoomUnavailability.specific_date == date)
    unavail = unavail_query.first()
    if unavail:
        is_available = False
        reason = f"Room unavailable: {unavail.reason}"

    # Check Scheduled Teaching Sessions if day and period_id provided
    if is_available and day and period_id:
        from backend.app.models.session import TeachingSession
        from backend.app.services.scheduling.models import PERIOD_INDEX, INDEX_TO_PERIOD

        sessions = db.query(TeachingSession).filter(
            TeachingSession.room_id == room.id,
            TeachingSession.day == day,
            TeachingSession.is_scheduled == True
        ).all()

        for s in sessions:
            if s.period_id and s.period_id in PERIOD_INDEX:
                start_p = PERIOD_INDEX[s.period_id]
                occupied_periods = [INDEX_TO_PERIOD[start_p + i] for i in range(s.duration_periods or 1) if (start_p + i) < 9]
                if period_id in occupied_periods:
                    is_available = False
                    course_info = s.course.code if s.course else "Class"
                    reason = f"Occupied by {course_info} session"
                    break

    # Check Approved Bookings if date provided
    if is_available and date:
        from backend.app.models.booking import BookingRequest
        booking = db.query(BookingRequest).filter(
            BookingRequest.room_id == room.id,
            BookingRequest.date == date,
            BookingRequest.status == "Approved"
        ).first()
        if booking:
            is_available = False
            reason = f"Booked for event: {booking.event_title}"

    return {
        "room_id": room.id,
        "room_name": room.name,
        "is_available": is_available,
        "conflict_reason": reason,
        "day": day,
        "period_id": period_id,
        "date": date
    }

@router.post("", response_model=RoomResponse)
def create_room(
    room_in: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    existing = db.query(Room).filter(Room.name == room_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Room with this name already exists")

    room = Room(
        id=f"rm-{uuid.uuid4().hex[:8]}",
        **room_in.model_dump()
    )
    db.add(room)
    db.commit()
    db.refresh(room)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="ROOM_CREATE",
        entity_type="room",
        entity_id=room.id,
        details={"name": room.name, "capacity": room.capacity}
    )
    return room

@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: str,
    room_update: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    update_data = room_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(room, field, val)

    db.commit()
    db.refresh(room)

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="ROOM_UPDATE",
        entity_type="room",
        entity_id=room.id,
        details=update_data
    )
    return room

@router.delete("/{room_id}")
def delete_room(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    db.delete(room)
    db.commit()

    record_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="ROOM_DELETE",
        entity_type="room",
        entity_id=room_id
    )
    return {"success": True, "message": f"Room {room_id} deleted"}

