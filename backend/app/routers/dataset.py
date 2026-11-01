import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.room import Room
from backend.app.models.faculty import Faculty
from backend.app.models.student_group import StudentGroup
from backend.app.models.course import Course
from backend.app.models.session import TeachingSession
from backend.app.models.booking import BookingRequest
from backend.app.models.user import User
from backend.app.schemas.dataset import DatasetImportReport, DatasetStatusResponse
from backend.app.utils.security import get_current_user, require_roles
from backend.app.services.dataset_service import import_official_dataset, seed_initial_demo_database
from backend.app.services.audit_service import record_audit_log

router = APIRouter(prefix="/dataset", tags=["Dataset Operations"])

@router.get("/status", response_model=DatasetStatusResponse)
def get_dataset_status(db: Session = Depends(get_db)):
    rooms_count = db.query(Room).count()
    faculty_count = db.query(Faculty).count()
    groups_count = db.query(StudentGroup).count()
    courses_count = db.query(Course).count()
    sessions_count = db.query(TeachingSession).count()
    bookings_count = db.query(BookingRequest).count()

    is_loaded = rooms_count > 0 and faculty_count > 0

    return DatasetStatusResponse(
        is_dataset_loaded=is_loaded,
        dataset_version="CIT-Fall2026-v1.0",
        rooms_count=rooms_count,
        faculty_count=faculty_count,
        groups_count=groups_count,
        courses_count=courses_count,
        sessions_count=sessions_count,
        bookings_count=bookings_count,
        last_updated="2026-10-31"
    )

@router.post("/upload", response_model=DatasetImportReport)
async def upload_official_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    try:
        contents = await file.read()
        dataset_json = json.loads(contents.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file format: {str(e)}")

    report = import_official_dataset(db, dataset_json, current_user)
    return report

@router.post("/reset-demo")
def reset_demo_database(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    """Admin-only demo reset utility to reseed pristine reference dataset."""
    try:
        # Clear existing tables safely
        from backend.app.models.session import SessionGroupAssociation
        from backend.app.models.approval import Approval
        from backend.app.models.change_request import ChangeRequest
        from backend.app.models.exam import Examination
        from backend.app.models.booking import BookingRequest
        from backend.app.models.session import TeachingSession
        from backend.app.models.course import Course
        from backend.app.models.faculty import Faculty, FacultyUnavailability
        from backend.app.models.student_group import StudentGroup
        from backend.app.models.room import Room, RoomUnavailability

        db.query(SessionGroupAssociation).delete()
        db.query(TeachingSession).delete()
        db.query(BookingRequest).delete()
        db.query(ChangeRequest).delete()
        db.query(Approval).delete()
        db.query(Examination).delete()
        db.query(RoomUnavailability).delete()
        db.query(FacultyUnavailability).delete()
        db.query(Course).delete()
        db.query(StudentGroup).delete()
        db.query(Faculty).delete()
        db.query(Room).delete()
        db.commit()

        # Reseed
        seed_initial_demo_database(db)

        record_audit_log(
            db=db,
            actor_id=current_user.id,
            actor_name=current_user.name,
            action="DEMO_RESET",
            entity_type="dataset",
            details={"status": "Clean reference dataset restored"}
        )

        return {
            "success": True,
            "message": "Demo database successfully reset to clean CIT reference counts."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Reset failed: {str(e)}")
