from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class AnalyticsOverviewResponse(BaseModel):
    total_rooms: int
    faculty_members: int
    student_groups: int
    courses: int
    teaching_sessions: int
    midsem_exams: int
    pending_booking_requests: int
    scheduled_sessions: int
    unscheduled_sessions: int
    current_conflicts: int
    solver_satisfaction_rate: float
    average_room_utilization: float
    peak_hour: str

class RoomUtilizationCategory(BaseModel):
    category: str
    utilization_pct: float
    total_venues: int

class FacultyWorkloadItem(BaseModel):
    faculty_id: str
    name: str
    department: str
    weekly_hours: int
    max_hours: int
    utilization_pct: int

class ConflictItem(BaseModel):
    type: str  # HARD, SOFT
    title: str
    description: str
    severity: str

# Detailed Institutional Analytics Schemas for Phase 12

class InstitutionalKPIs(BaseModel):
    total_students: int
    total_faculty: int
    total_courses: int
    total_classrooms: int
    total_scheduled_classes: int
    total_unscheduled_classes: int
    total_examinations: int
    average_room_utilization: float
    average_faculty_workload_pct: float
    timetable_success_rate: float
    active_conflicts: int
    total_reschedule_requests: int
    approved_reschedule_requests: int
    rejected_reschedule_requests: int
    pending_reschedule_requests: int
    total_venue_bookings: int
    pending_venue_bookings: int
    peak_demand_hour: str

class DepartmentDistributionItem(BaseModel):
    department: str
    classes_count: int
    faculty_count: int
    courses_count: int
    student_count: int
    avg_workload_hours: float

class DailyDistributionItem(BaseModel):
    day: str
    classes_count: int
    pct: float

class PeriodDistributionItem(BaseModel):
    period_id: str
    period_name: str
    classes_count: int
    utilization_pct: float

class RoomOccupancyItem(BaseModel):
    room_id: str
    room_name: str
    room_type: str
    capacity: int
    scheduled_periods: int
    utilization_pct: float

class ExamDepartmentItem(BaseModel):
    department: str
    exam_count: int
    upcoming_count: int
    completed_count: int

class ReschedulingAnalytics(BaseModel):
    total_requests: int
    approved: int
    rejected: int
    pending: int
    top_conflict_reasons: List[Dict[str, Any]]

class StudentPersonalAnalytics(BaseModel):
    group_name: str
    department: str
    semester: int
    weekly_classes_count: int
    weekly_hours: int
    assigned_courses_count: int
    upcoming_exams_count: int
    free_periods_count: int

class FacultyPersonalAnalytics(BaseModel):
    faculty_id: str
    name: str
    department: str
    weekly_workload_hours: int
    max_workload_hours: int
    utilization_pct: int
    assigned_sessions_count: int
    distinct_rooms_count: int
    distinct_courses_count: int

class RoleBasedAnalyticsResponse(BaseModel):
    role: str
    user_name: str
    user_email: str
    student_view: Optional[StudentPersonalAnalytics] = None
    faculty_view: Optional[FacultyPersonalAnalytics] = None
    institutional_kpis: InstitutionalKPIs

class InstitutionalAnalyticsData(BaseModel):
    kpis: InstitutionalKPIs
    department_metrics: List[DepartmentDistributionItem]
    daily_distribution: List[DailyDistributionItem]
    period_distribution: List[PeriodDistributionItem]
    room_categories: List[RoomUtilizationCategory]
    top_used_rooms: List[RoomOccupancyItem]
    faculty_workloads: List[FacultyWorkloadItem]
    exam_analytics: List[ExamDepartmentItem]
    rescheduling: ReschedulingAnalytics
    timestamp: str

class ReportMetadata(BaseModel):
    id: str
    title: str
    generated_at: str
    file_type: str
    record_count: int
    file_size_kb: float
    filters_applied: Dict[str, Any]
