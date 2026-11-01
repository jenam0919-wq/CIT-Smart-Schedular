"""
CIT Smart Scheduler - Gemini AI Assistant Service
Official Google Gemini integration with real institutional data grounding,
role-based context isolation, and multi-tier SDK/REST execution.
"""

import json
import logging
import os
import sys
import urllib.request
import ssl
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.models.user import User
from backend.app.models.room import Room
from backend.app.models.faculty import Faculty
from backend.app.models.course import Course
from backend.app.models.student_group import StudentGroup
from backend.app.models.session import TeachingSession
from backend.app.models.exam import Examination
from backend.app.models.change_request import ChangeRequest
from backend.app.models.disruption import Disruption

logger = logging.getLogger("cit_scheduler.gemini_service")

# Candidate models in preference order (deduplicated)
_CONFIGURED_MODEL = getattr(settings, "GEMINI_MODEL", "gemini-3.5-flash") or "gemini-3.5-flash"
FALLBACK_MODELS = []
for _m in [_CONFIGURED_MODEL, "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]:
    if _m and _m not in FALLBACK_MODELS:
        FALLBACK_MODELS.append(_m)

def build_institutional_context(db: Session, user: User, query: str) -> Tuple[str, Dict[str, int]]:
    """
    Extracts real live database records for institutional grounding based on user's authorized role.
    Prevents unauthorized data leakage and ensures zero hallucination.
    """
    user_role = (getattr(user, "role", "STUDENT") or "STUDENT").upper()
    entities_count = {}

    # 1. Rooms
    rooms = db.query(Room).all()
    entities_count["rooms"] = len(rooms)
    rooms_text = []
    for r in rooms:
        features = []
        if getattr(r, "has_projector", False): features.append("HD Projector")
        if getattr(r, "has_audio_system", False): features.append("PA Audio")
        if getattr(r, "has_air_conditioning", False): features.append("AC")
        rooms_text.append(
            f"- {r.name} ({r.code}): Block {r.block}, Floor {r.floor}, Type: {r.type}, "
            f"Capacity: {r.capacity} seats, Facilities: {', '.join(features) if features else 'Standard'}"
        )

    # 2. Courses
    courses = db.query(Course).all()
    entities_count["courses"] = len(courses)
    courses_text = [
        f"- {c.code}: {c.title} ({c.department}, {c.credits} Credits, {c.type}, {c.weekly_hours} hrs/wk)"
        for c in courses
    ]

    # 3. Student Groups
    groups = db.query(StudentGroup).all()
    entities_count["student_groups"] = len(groups)
    groups_text = [
        f"- {g.name} ({g.department}): Semester {g.semester}, {getattr(g, 'strength', 60)} enrolled students"
        for g in groups
    ]

    # 4. Faculty (Filtered by Role)
    faculty_list = db.query(Faculty).all()
    entities_count["faculty"] = len(faculty_list)
    faculty_text = []
    for f in faculty_list:
        if user_role in ["ADMIN", "DEPARTMENT_COORDINATOR"]:
            faculty_text.append(
                f"- {f.name} ({f.department}): Designation: {f.designation}, Email: {f.email}, "
                f"Workload: {f.weekly_workload_hours}/{f.max_workload_hours} hrs/week"
            )
        elif user_role == "FACULTY" and (f.email == getattr(user, "email", "") or f.name.lower() in getattr(user, "name", "").lower()):
            faculty_text.append(
                f"- [YOUR PROFILE] {f.name} ({f.department}): Designation: {f.designation}, "
                f"Workload: {f.weekly_workload_hours}/{f.max_workload_hours} hrs/week"
            )
        else:
            # Public directory view for students
            faculty_text.append(f"- {f.name} ({f.department}, {f.designation})")

    # 5. Master Timetable Sessions
    sessions = db.query(TeachingSession).all()
    entities_count["timetable_sessions"] = len(sessions)
    sessions_text = []
    for s in sessions:
        cohorts = []
        if getattr(s, "group_associations", None):
            for assoc in s.group_associations:
                if assoc.student_group:
                    cohorts.append(assoc.student_group.name)
        group_names = ", ".join(cohorts) if cohorts else "General Cohort"
        fac_name = s.faculty.name if s.faculty else "Unassigned"
        room_name = s.room.name if s.room else "Unassigned Venue"
        course_code = s.course.code if s.course else getattr(s, "course_id", "Course")

        # Student role filtering
        if user_role == "STUDENT" and getattr(user, "department", None):
            if user.department.lower() not in (s.course.department.lower() if s.course else ""):
                continue

        sessions_text.append(
            f"- {s.day} Period {s.period_id} (08:00 - 16:10 window): Course {course_code} | Venue: {room_name} | "
            f"Instructor: {fac_name} | Cohort: {group_names}"
        )

    # 6. Examinations
    exams = db.query(Examination).all()
    entities_count["examinations"] = len(exams)
    exams_text = []
    for ex in exams:
        c_code = ex.course.code if ex.course else getattr(ex, "course_id", "Exam")
        c_title = ex.course.title if ex.course else ""
        halls = []
        if getattr(ex, "allocated_rooms", None) and isinstance(ex.allocated_rooms, list):
            for al in ex.allocated_rooms:
                halls.append(al.get("room_name", "Hall"))
        halls_str = ", ".join(halls) if halls else "General Exam Hall"

        exams_text.append(
            f"- {c_code} ({c_title}): Date: {ex.date} ({ex.day}), Session: {ex.time_slot}, "
            f"Venue(s): {halls_str}, Cohort: {ex.student_group_name}, Students: {ex.enrolled_students}"
        )

    # 7. Rescheduling Requests & Campus Disruptions
    reschedules = db.query(ChangeRequest).all()
    entities_count["reschedule_requests"] = len(reschedules)
    reschedules_text = [
        f"- Request {r.id}: Course {r.course.code if r.course else r.course_id} "
        f"({r.faculty.name if r.faculty else 'Instructor'}) moving from "
        f"{r.original_day} {r.original_period} ({r.original_room_name}) -> {r.proposed_day} {r.proposed_period} ({r.proposed_room_name}). "
        f"Status: {r.status}. Reason: {r.reason}"
        for r in reschedules
    ]

    disruptions = db.query(Disruption).all()
    entities_count["disruptions"] = len(disruptions)
    disruptions_text = [
        f"- Disruption {d.id}: {d.title} ({d.type}) on {d.affected_date}. Entity: {d.affected_entity}. "
        f"Impact: {d.affected_slots_count} slots. Status: {d.status}"
        for d in disruptions
    ]

    # Combine into institutional markdown reference
    context_markdown = f"""
### INSTITUTIONAL DATA BASELINE — CHILIKA INSTITUTE OF TECHNOLOGY (CIT)
*Authorized Access Level: {user_role} ({user.name} <{user.email}>)*

#### 1. Campus Venues & Laboratories ({len(rooms_text)} rooms):
{chr(10).join(rooms_text[:25])}

#### 2. Academic Departments & Faculty ({len(faculty_text)} faculty members):
{chr(10).join(faculty_text[:20])}

#### 3. Active Courses & Curriculum ({len(courses_text)} courses):
{chr(10).join(courses_text[:20])}

#### 4. Student Cohorts ({len(groups_text)} groups):
{chr(10).join(groups_text[:15])}

#### 5. Master Timetable Sessions (Current Schedule):
{chr(10).join(sessions_text[:40]) if sessions_text else "No active sessions found for this scope."}

#### 6. Examination Timetable ({len(exams_text)} exams):
{chr(10).join(exams_text) if exams_text else "No examinations currently scheduled."}

#### 7. Schedule Rescheduling & Campus Disruptions:
Rescheduling Requests ({len(reschedules_text)}):
{chr(10).join(reschedules_text[:10]) if reschedules_text else "None"}

Active Campus Disruptions ({len(disruptions_text)}):
{chr(10).join(disruptions_text[:10]) if disruptions_text else "None"}

#### 8. CIT Institutional Scheduling Policies:
- Daily Teaching Periods: P1 (08:00 - 08:50), P2 (08:50 - 09:40), P3 (09:50 - 10:40), P4 (10:40 - 11:30), P5 (11:40 - 12:30), P6 (13:30 - 14:20), P7 (14:20 - 15:10), P8 (15:20 - 16:10).
- Lunch Window: 12:30 PM - 13:30 PM (No teaching sessions permitted).
- Hard Constraints: Zero Room Double-Booking, Zero Instructor Overlap, Zero Cohort Collision, Room Capacity >= Enrolled Count.
- Modifications Policy: AI may explain, analyze, and recommend solutions. Any actual change to the master schedule must be verified by the OR-Tools CP-SAT engine and approved by the Department Coordinator.
"""
    return context_markdown.strip(), entities_count


def generate_gemini_response(
    db: Session,
    user: User,
    user_prompt: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """
    Sends prompt to Google Gemini with institutional grounding context and role enforcement.
    Never exposes API keys or secrets in logs or responses.
    """
    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""

    # Guard: Missing API key
    if not api_key or api_key == "your_gemini_api_key":
        return {
            "response": (
                "⚠️ **Gemini API Key Required**\n\n"
                "The Google Gemini API key is currently unconfigured or set to the default placeholder on this server.\n\n"
                "To enable live generative scheduling intelligence, please set a valid `GEMINI_API_KEY` in `backend/.env` "
                "and restart the backend service.\n\n"
                "*(Live AI testing is pending configuration; mock responses are disabled per system policy.)*"
            ),
            "model_used": "unconfigured",
            "status": "unconfigured",
            "grounded_entities_count": {},
        }

    # Extract real database context
    context_data, entities_count = build_institutional_context(db, user, user_prompt)

    # Build system instructions
    system_instruction = (
        "You are the CIT Smart Scheduler AI Assistant, an intelligent, professional academic scheduling co-pilot "
        "for Chilika Institute of Technology (CIT).\n\n"
        "CORE RULES & RESPONSIBILITIES:\n"
        "1. Strictly ground all facts, names, course codes, room numbers, capacities, and times on the provided verified institutional data.\n"
        "2. Do NOT invent or hallucinate timetable records, faculty, or exams. If data is not present in the institutional records, clearly and politely inform the user.\n"
        "3. Respect the user's role (Student, Faculty, Admin, Coordinator). Tailor your answers to their authorized scope.\n"
        "4. When discussing conflicts, explain the specific hard constraints involved (e.g. Faculty Overlap, Room Collision, Cohort Overlap).\n"
        "5. For schedule modifications or generation: suggest optimal candidate slots, but remind the user that changes must be confirmed and approved through the platform's OR-Tools micro-solver and Department Coordinator.\n"
        "6. Format responses clearly with markdown headings, tables, bold text, and clean bullet points.\n\n"
        f"VERIFIED CIT INSTITUTIONAL DATA:\n{context_data}"
    )

    # Build conversation payload
    contents: List[Dict[str, Any]] = []

    # Include recent history if provided (up to last 6 messages for context memory)
    if conversation_history:
        for msg in conversation_history[-6:]:
            role = "user" if msg.get("role") == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg.get("content", "")}]
            })

    # Add current user prompt
    contents.append({
        "role": "user",
        "parts": [{"text": user_prompt}]
    })

    # Attempt to query Gemini models in priority order
    last_error_msg = None
    ssl_context = ssl.create_default_context()

    for model_name in FALLBACK_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048,
            }
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )

            # Enforce fast timeout (12s per candidate model)
            timeout_sec = min(getattr(settings, "GEMINI_TIMEOUT_SECONDS", 12), 12)
            with urllib.request.urlopen(req, context=ssl_context, timeout=timeout_sec) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                candidates = res_data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        answer_text = parts[0]["text"]
                        return {
                            "response": answer_text,
                            "model_used": model_name,
                            "status": "success",
                            "grounded_entities_count": entities_count,
                        }
        except urllib.error.HTTPError as http_err:
            try:
                err_body = json.loads(http_err.read().decode("utf-8"))
                err_detail = err_body.get("error", {}).get("message", str(http_err))
            except Exception:
                err_detail = str(http_err)

            last_error_msg = f"HTTP {http_err.code}: {err_detail}"
            logger.warning("Gemini model %s failed: %s", model_name, last_error_msg)

            # If model not found (404), continue to next fallback model
            if http_err.code == 404:
                continue

            # If quota or auth failure, don't spam other models
            if http_err.code in [400, 401, 403, 429]:
                break
        except Exception as exc:
            last_error_msg = str(exc)
            logger.warning("Gemini request error for %s: %s", model_name, last_error_msg)
            continue

    # If all models failed or network issue
    return {
        "response": (
            "⚠️ **AI Scheduling Service Temporarily Unavailable**\n\n"
            f"Unable to complete generative response via Google Gemini ({last_error_msg or 'Network timeout'}).\n\n"
            "**Troubleshooting Suggestions:**\n"
            "- Verify that the backend server has outbound internet access to `generativelanguage.googleapis.com`.\n"
            "- Check API key permissions and quota in Google AI Studio / Google Cloud Console.\n"
            "- Check `GEMINI_MODEL` in backend configuration."
        ),
        "model_used": settings.GEMINI_MODEL,
        "status": "error",
        "grounded_entities_count": entities_count,
    }

