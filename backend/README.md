# CIT Smart Scheduler — Backend Documentation (Phase 2)

**Chilika Institute of Technology (CIT)**  
*Smarter Scheduling. Zero Conflicts. Better Campus Management.*

---

## 1. Architecture Overview

The backend is built with **FastAPI**, **SQLAlchemy ORM**, **Pydantic v2 validation**, and **PostgreSQL** (with automated **SQLite** fallback for zero-configuration local runs). It provides a high-performance RESTful API powering the CIT Smart Scheduler frontend, complete with JWT-based role authentication, role-based access control (RBAC), transactional audit logging, and conflict validation guards.

### Core Architecture Components:
- **FastAPI Core (`backend/app/main.py`)**: Async ASGI application with route prefixes, CORS middleware, and lifespan lifecycle hooks.
- **Database Engine (`backend/app/database.py`)**: PostgreSQL / SQLite connection pooling, session lifecycle management (`get_db`), and automated schema synchronization.
- **SQLAlchemy Models (`backend/app/models/`)**: 16 relational entities covering users, rooms, faculty, student groups, courses, sessions, multi-group associations, bookings, exams, reschedule requests, approvals, notifications, timetable versions, and audit logs.
- **Pydantic Schemas (`backend/app/schemas/`)**: Strict request/response typing and serialization.
- **Service Layer (`backend/app/services/`)**:
  - `booking_service.py`: Booking lifecycle, capacity checks, role-based approval routing, self-approval prevention.
  - `timetable_service.py`: Slot retrieval and filtering by student group, faculty, or room.
  - `validation_service.py`: Room capacity, slot clash prevention, self-approval guards.
  - `analytics_service.py`: Aggregations of room utilization, faculty workloads, conflict counts, and pending metrics.
  - `dataset_service.py`: ACID transactional seeding and dataset import for CIT official numbers.
  - `audit_service.py`: Immutable audit trail recording every state change with actor, action, and timestamp.
- **Alembic Migrations (`backend/migrations/`)**: Full database migration environment configured with automated revision tracking.

---

## 2. Official Reference Dataset Baseline

The database seeds with the exact baseline figures required for the CIT campus:
- **Total Rooms**: 27 (Classrooms, Labs, Lecture Halls, Auditoriums, Seminar Rooms)
- **Faculty Members**: 40 across CS, EC, EE, ME, and Math/Science departments
- **Student Groups**: 14 cohorts (B.Tech semesters 2, 4, 6, 8 across branches)
- **Courses**: 62 offerings including core courses and elective baskets
- **Teaching Sessions**: 189 total sessions (185 scheduled, 4 unscheduled)
- **Midsem Examinations**: 41 examination papers with allocated exam halls
- **Pending Booking Requests**: 25 venue requests across Pending, Approved, and Rejected states

---

## 3. User Roles and Demo Credentials

| Role | Email | Password | Allowed Operations |
|---|---|---|---|
| **Admin** | `admin@cit.edu` | `demo123` | Full system access, timetable generation, final change approvals, room locking, audit logs |
| **Department Coordinator** | `coordinator@cit.edu` | `demo123` | Department timetable view, departmental room bookings, lab approvals |
| **Faculty** | `faculty@cit.edu` | `demo123` | Personal timetable, mark unavailability, extra/reschedule session requests |
| **Club Representative** | `club@cit.edu` | `demo123` | Submit Spectra / club venue requests, cancel pending requests |

*Note: Self-approval is strictly forbidden in the backend. An Admin or Coordinator cannot approve their own booking or change request.*

---

## 4. API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate user and issue JWT bearer token.
- `POST /api/auth/register` — Register a new account.
- `GET /api/auth/me` — Retrieve current authenticated user profile and permissions.

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/admin` — Executive KPIs, utilization, conflict indicators, pending approvals.
- `GET /api/dashboard/faculty` — Personal weekly schedule, teaching hours, pending requests.
- `GET /api/dashboard/coordinator` — Department room usage, faculty availability, pending department bookings.
- `GET /api/dashboard/club` — Club bookings summary, venue availability status.

### Rooms & Facilities (`/api/rooms`)
- `GET /api/rooms` — List 27 rooms with features, capacity, floor, projector, and accessibility flags.
- `GET /api/rooms/{id}` — Room details, equipment, and maintenance windows.
- `POST /api/rooms` — Create room (Admin only).
- `PUT /api/rooms/{id}` — Update room specifications (Admin only).
- `GET /api/rooms/{id}/availability` — Check room availability for a given day and time slot.

### Faculty (`/api/faculty`)
- `GET /api/faculty` — List 40 faculty members with departments, designations, and max daily hours.
- `GET /api/faculty/{id}` — Faculty details and preferences.
- `POST /api/faculty/{id}/unavailability` — Mark unavailabilities (medical, conference, research).

### Student Groups & Courses (`/api/groups`, `/api/courses`)
- `GET /api/groups` — List 14 student groups with strength, branch, and semester.
- `GET /api/courses` — List 62 courses with elective basket definitions and required sessions.

### Timetable & Teaching Sessions (`/api/sessions`)
- `GET /api/sessions` — List 189 teaching sessions with multi-group associations.
- `GET /api/sessions/group/{group_id}` — Weekly timetable grid for a student group.
- `GET /api/sessions/faculty/{faculty_id}` — Weekly schedule for a faculty member.
- `GET /api/sessions/room/{room_id}` — Weekly timetable for a room.
- `POST /api/sessions` — Create a teaching session (Admin only).

### Venue Booking (`/api/bookings`)
- `GET /api/bookings` — List booking requests with status filter (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
- `POST /api/bookings` — Submit a new venue booking request.
- `PUT /api/bookings/{id}/approve` — Approve request with auditable reasoning (self-approval blocked).
- `PUT /api/bookings/{id}/reject` — Reject request with reason and alternative room/slot suggestions.
- `PUT /api/bookings/{id}/cancel` — Cancel booking request (Owner or Admin).

### Examinations (`/api/exams`)
- `GET /api/exams` — List 41 midterm examinations with dates, sessions, and seat allocations.
- `POST /api/exams` — Create new examination schedule entry.

### Smart Rescheduling (`/api/rescheduling`)
- `GET /api/rescheduling/requests` — List schedule change proposals.
- `POST /api/rescheduling/requests` — Submit reschedule or displacement request.
- `PUT /api/rescheduling/requests/{id}/approve` — Approve timetable adjustment (Admin only).
- `PUT /api/rescheduling/requests/{id}/reject` — Reject reschedule proposal.

### Analytics & System Management (`/api/analytics`, `/api/dataset`)
- `GET /api/analytics/overview` — High-level campus utilization and metrics.
- `GET /api/analytics/room-utilization` — Per-room occupancy and utilization rates.
- `GET /api/analytics/faculty-workload` — Teaching load per faculty member.
- `POST /api/dataset/import` — Load raw dataset JSON (ACID transaction).
- `POST /api/dataset/reset-demo` — Reset database to pristine 27/40/14/62/189/41 state.
- `GET /api/dataset/audit-logs` — Query immutable audit trail logs.

---

## 5. Startup and Run Commands

### 1. Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Configure Environment (.env)
```bash
cp backend/.env.example backend/.env
# Optional: Set DATABASE_URL to a PostgreSQL connection string
# e.g.: DATABASE_URL="postgresql://user:password@localhost:5432/cit_scheduler"
# If unset, SQLite (cit_scheduler.db) is automatically used.
```

### 3. Run Database Migrations or Direct Initialization
```bash
# Initialize schema and seed demo data automatically on first launch
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8001 --reload
```

Or using Alembic:
```bash
cd backend
alembic upgrade head
```

### 4. Run API Test Suite
```bash
PYTHONPATH=. python3 backend/tests/test_api.py
```

### 5. Frontend Integration
The frontend automatically proxies `/api` requests to `http://127.0.0.1:8001` via `vite.config.ts`.
To run the full stack together:
- **Backend**: `python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8001`
- **Frontend**: `npm run dev` (Runs Vite on port 3000)
- **Interactive Swagger Docs**: `http://localhost:8001/docs` or `http://localhost:3000/api/docs`
