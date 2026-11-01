from backend.app.routers.auth import router as auth_router
from backend.app.routers.dashboard import router as dashboard_router
from backend.app.routers.rooms import router as rooms_router
from backend.app.routers.faculty import router as faculty_router
from backend.app.routers.groups import router as groups_router
from backend.app.routers.courses import router as courses_router
from backend.app.routers.sessions import router as sessions_router
from backend.app.routers.bookings import router as bookings_router
from backend.app.routers.exams import router as exams_router
from backend.app.routers.rescheduling import router as rescheduling_router
from backend.app.routers.analytics import router as analytics_router
from backend.app.routers.dataset import router as dataset_router
from backend.app.routers.users import router as users_router
from backend.app.routers.timetable import router as timetable_router
from backend.app.routers.notifications import router as notifications_router
from backend.app.routers.ai_assistant import router as ai_assistant_router

__all__ = [
    "auth_router",
    "dashboard_router",
    "rooms_router",
    "faculty_router",
    "groups_router",
    "courses_router",
    "sessions_router",
    "bookings_router",
    "exams_router",
    "rescheduling_router",
    "analytics_router",
    "dataset_router",
    "users_router",
    "timetable_router",
    "notifications_router",
    "ai_assistant_router",
]

