/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  UserRole,
  Room,
  FacultyMember,
  StudentGroup,
  Course,
  TimetableSlot,
  VenueBookingRequest,
  ExamScheduleItem,
  RescheduleRequest,
  AnalyticsSummary,
  DisruptionEvent,
  ChatMessageItem,
  ChatConversationItem,
  AIChatResponsePayload,
} from '../types';
import { auth } from './firebase';

// Base URL: defaults to empty string (using Vite /api proxy to FastAPI on port 8001)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('cit_auth_token') : null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('cit_auth_token', token);
    } else {
      localStorage.removeItem('cit_auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    let activeToken = this.token;
    if (!activeToken && auth?.currentUser) {
      try {
        activeToken = await auth.currentUser.getIdToken();
      } catch (_) {}
    }

    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData.detail) {
            errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (err: any) {
      throw err;
    }
  }

  // Helper mappers
  private mapSlot(s: any): TimetableSlot {
    return {
      id: s.id,
      day: s.day,
      periodId: s.period_id || s.periodId,
      courseId: s.course_id || s.courseId,
      courseCode: s.course_code || s.courseCode,
      courseName: s.course_name || s.courseName,
      facultyId: s.faculty_id || s.facultyId,
      facultyName: s.faculty_name || s.facultyName,
      roomId: s.room_id || s.roomId,
      roomName: s.room_name || s.roomName,
      groupId: s.group_id || s.groupId,
      groupName: s.group_name || s.groupName,
      sessionType: s.session_type || s.sessionType || 'Lecture',
      durationPeriods: s.duration_periods || s.durationPeriods || 1,
      colorTag: s.color_tag || s.colorTag || '#3B82F6',
    };
  }

  private mapDisruption(d: any): DisruptionEvent {
    return {
      id: d.id,
      title: d.title,
      type: d.type as any,
      affectedDate: d.affected_date || d.affectedDate,
      affectedEntity: d.affected_entity || d.affectedEntity,
      affectedSlotsCount: d.affected_slots_count ?? d.affectedSlotsCount ?? 0,
      status: d.status as any,
      reportedAt: d.reported_at || d.reportedAt || 'Just now',
      proposedResolution: d.proposed_resolution || d.proposedResolution,
    };
  }

  private mapRoom(r: any): Room {
    return {
      id: r.id,
      name: r.name,
      code: r.code,
      block: r.block,
      floor: r.floor,
      type: r.type,
      capacity: r.capacity,
      examCapacity: r.exam_capacity ?? r.examCapacity ?? Math.floor(r.capacity * 0.6),
      hasProjector: r.has_projector ?? r.hasProjector ?? false,
      hasAudioSystem: r.has_audio_system ?? r.hasAudioSystem ?? false,
      hasAirConditioning: r.has_air_conditioning ?? r.hasAirConditioning ?? false,
      isAvailableNow: r.is_available_now ?? r.isAvailableNow ?? true,
    };
  }

  private mapFaculty(f: any): FacultyMember {
    return {
      id: f.id,
      name: f.name,
      designation: f.designation,
      department: f.department,
      email: f.email,
      weeklyWorkloadHours: f.weekly_workload_hours ?? f.weeklyWorkloadHours ?? 0,
      maxWorkloadHours: f.max_workload_hours ?? f.maxWorkloadHours ?? 18,
      unavailability: f.unavailability,
    };
  }

  private mapCourse(c: any): Course {
    return {
      id: c.id,
      code: c.code,
      title: c.title,
      department: c.department,
      credits: c.credits,
      type: c.type,
      colorTag: c.color_tag ?? c.colorTag ?? '#3B82F6',
      weeklyHours: c.weekly_hours ?? c.weeklyHours ?? 3,
    };
  }

  // Health
  async checkHealth(): Promise<{ status: string; service: string }> {
    return this.request('/api/health');
  }

  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string; user: any }> {
    const res = await this.request<{ access_token: string; token_type: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<any> {
    return this.request('/api/auth/me');
  }

  // Dashboard
  async getAdminDashboard(): Promise<any> {
    return this.request('/api/dashboard/admin');
  }

  async getFacultyDashboard(): Promise<any> {
    return this.request('/api/dashboard/faculty');
  }

  async getCoordinatorDashboard(): Promise<any> {
    return this.request('/api/dashboard/coordinator');
  }

  async getClubDashboard(): Promise<any> {
    return this.request('/api/dashboard/club');
  }

  // Rooms
  async getRooms(type?: string): Promise<Room[]> {
    const query = type && type !== 'All' ? `?type=${encodeURIComponent(type)}` : '';
    const raw = await this.request<any[]>(`/api/rooms${query}`);
    return raw.map(r => this.mapRoom(r));
  }

  async getRoomById(id: string): Promise<Room> {
    const raw = await this.request<any>(`/api/rooms/${id}`);
    return this.mapRoom(raw);
  }

  async createRoom(room: any): Promise<Room> {
    const raw = await this.request<any>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({
        name: room.name,
        code: room.code,
        block: room.block,
        floor: room.floor,
        type: room.type,
        capacity: room.capacity,
        exam_capacity: room.examCapacity || Math.floor(room.capacity * 0.6),
        has_projector: room.hasProjector ?? false,
        has_audio_system: room.hasAudioSystem ?? false,
        has_air_conditioning: room.hasAirConditioning ?? false,
      }),
    });
    return this.mapRoom(raw);
  }

  async updateRoom(id: string, room: any): Promise<Room> {
    const raw = await this.request<any>(`/api/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(room),
    });
    return this.mapRoom(raw);
  }

  async deleteRoom(id: string): Promise<any> {
    return this.request(`/api/rooms/${id}`, { method: 'DELETE' });
  }

  // Faculty
  async getFaculty(department?: string): Promise<FacultyMember[]> {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    const raw = await this.request<any[]>(`/api/faculty${query}`);
    return raw.map(f => this.mapFaculty(f));
  }

  async createFaculty(fac: any): Promise<FacultyMember> {
    const raw = await this.request<any>('/api/faculty', {
      method: 'POST',
      body: JSON.stringify({
        name: fac.name,
        designation: fac.designation,
        department: fac.department,
        email: fac.email,
        max_daily_hours: fac.maxDailyHours || 4,
        prefer_morning: fac.preferMorning ?? false,
        max_workload_hours: fac.maxWorkloadHours || 18,
      }),
    });
    return this.mapFaculty(raw);
  }

  async updateFaculty(id: string, fac: any): Promise<FacultyMember> {
    const raw = await this.request<any>(`/api/faculty/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fac),
    });
    return this.mapFaculty(raw);
  }

  async deleteFaculty(id: string): Promise<any> {
    return this.request(`/api/faculty/${id}`, { method: 'DELETE' });
  }

  async markFacultyUnavailability(data: { faculty_id: string; day: string; period_id: string; reason: string }): Promise<any> {
    return this.request('/api/faculty/unavailability', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Student Groups
  async getStudentGroups(): Promise<StudentGroup[]> {
    return this.request<StudentGroup[]>('/api/groups');
  }

  async createStudentGroup(group: any): Promise<StudentGroup> {
    return this.request<StudentGroup>('/api/groups', {
      method: 'POST',
      body: JSON.stringify({
        name: group.name,
        department: group.department,
        semester: group.semester,
        strength: group.strength,
        class_representative: group.classRepresentative || '',
      }),
    });
  }

  async updateStudentGroup(id: string, group: any): Promise<StudentGroup> {
    return this.request<StudentGroup>(`/api/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(group),
    });
  }

  async deleteStudentGroup(id: string): Promise<any> {
    return this.request(`/api/groups/${id}`, { method: 'DELETE' });
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    const raw = await this.request<any[]>('/api/courses');
    return raw.map(c => this.mapCourse(c));
  }

  async createCourse(course: any): Promise<Course> {
    const raw = await this.request<any>('/api/courses', {
      method: 'POST',
      body: JSON.stringify({
        code: course.code,
        title: course.title,
        department: course.department,
        credits: course.credits,
        type: course.type,
        color_tag: course.colorTag || '#3B82F6',
        weekly_hours: course.weeklyHours || 3,
      }),
    });
    return this.mapCourse(raw);
  }

  async updateCourse(id: string, course: any): Promise<Course> {
    const raw = await this.request<any>(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(course),
    });
    return this.mapCourse(raw);
  }

  async deleteCourse(id: string): Promise<any> {
    return this.request(`/api/courses/${id}`, { method: 'DELETE' });
  }

  // Sessions & Timetables
  async getSessions(): Promise<any[]> {
    return this.request<any[]>('/api/sessions');
  }

  async getCurrentTimetable(): Promise<{
    status: string;
    isClashFree: boolean;
    totalSessions: number;
    scheduledSessions: number;
    totalTeachingHours: number;
    solverTimeSeconds: number;
    hardConflictsCount: number;
    softPenaltyScore: number;
    metrics: any;
    validationSummary: any;
    schedule: any[];
    slots: TimetableSlot[];
  }> {
    const raw = await this.request<any>('/api/timetable/current');
    const slots = (raw.slots || raw.schedule || []).map((s: any) => this.mapSlot(s));
    return {
      status: raw.status,
      isClashFree: raw.is_clash_free,
      totalSessions: raw.total_sessions,
      scheduledSessions: raw.scheduled_sessions,
      totalTeachingHours: raw.total_teaching_hours,
      solverTimeSeconds: raw.solver_time_seconds,
      hardConflictsCount: raw.hard_conflicts_count,
      softPenaltyScore: raw.soft_penalty_score,
      metrics: raw.metrics,
      validationSummary: raw.validation_summary,
      schedule: raw.schedule || [],
      slots,
    };
  }

  async generateTimetable(params?: { time_limit_seconds?: number; objective_weights?: any }): Promise<{
    status: string;
    isClashFree: boolean;
    totalSessions: number;
    scheduledSessions: number;
    totalTeachingHours: number;
    solverTimeSeconds: number;
    hardConflictsCount: number;
    softPenaltyScore: number;
    metrics: any;
    validationSummary: any;
    schedule: any[];
    slots: TimetableSlot[];
  }> {
    const raw = await this.request<any>('/api/timetable/generate', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    });
    const slots = (raw.slots || raw.schedule || []).map((s: any) => this.mapSlot(s));
    return {
      status: raw.status,
      isClashFree: raw.is_clash_free,
      totalSessions: raw.total_sessions,
      scheduledSessions: raw.scheduled_sessions,
      totalTeachingHours: raw.total_teaching_hours,
      solverTimeSeconds: raw.solver_time_seconds,
      hardConflictsCount: raw.hard_conflicts_count,
      softPenaltyScore: raw.soft_penalty_score,
      metrics: raw.metrics,
      validationSummary: raw.validation_summary,
      schedule: raw.schedule || [],
      slots,
    };
  }

  async getTimetableStatus(): Promise<any> {
    return this.request('/api/timetable/status');
  }

  async getValidationReport(): Promise<any> {
    return this.request('/api/timetable/validation-report');
  }

  async getGroupTimetable(groupIdOrName: string): Promise<TimetableSlot[]> {
    const res = await this.request<any>(`/api/timetable/group/${encodeURIComponent(groupIdOrName)}`);
    const raw = Array.isArray(res) ? res : (res.schedule || []);
    return raw.map((s: any) => this.mapSlot(s));
  }

  async getFacultyTimetable(facultyIdOrName: string): Promise<TimetableSlot[]> {
    const res = await this.request<any>(`/api/timetable/faculty/${encodeURIComponent(facultyIdOrName)}`);
    const raw = Array.isArray(res) ? res : (res.schedule || []);
    return raw.map((s: any) => this.mapSlot(s));
  }

  async getRoomTimetable(roomIdOrName: string): Promise<TimetableSlot[]> {
    const res = await this.request<any>(`/api/timetable/room/${encodeURIComponent(roomIdOrName)}`);
    const raw = Array.isArray(res) ? res : (res.schedule || []);
    return raw.map((s: any) => this.mapSlot(s));
  }

  // Bookings
  async getBookings(status?: string): Promise<VenueBookingRequest[]> {
    const query = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    const raw = await this.request<any[]>(`/api/bookings${query}`);
    return raw.map(b => ({
      id: b.id,
      eventTitle: b.event_title,
      requestedBy: b.requester_name,
      requesterRole: (b.requester_role || 'faculty').toLowerCase() as UserRole,
      requesterEmail: b.requester_email,
      clubOrDept: b.club_or_dept,
      roomId: b.room_id,
      roomName: b.room_name || b.room_id,
      date: b.date,
      startTime: b.start_time,
      endTime: b.end_time,
      periodIds: b.period_ids || ['P7', 'P8'],
      expectedAttendees: b.expected_attendees,
      purpose: b.description || 'Academic or student activity',
      requiresAV: b.requires_av,
      requiresAC: b.requires_ac,
      status: b.status,
      rejectionReason: b.decision_reason,
      alternativeSuggestion: b.alternative_suggestion,
      isSpectraWeek: b.is_spectra_week,
      submittedAt: b.created_at ? new Date(b.created_at).toLocaleString() : 'Recent',
      priorityScore: b.priority_score || 50,
    }));
  }

  async createBooking(booking: any): Promise<any> {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        event_title: booking.eventTitle,
        event_category: booking.isSpectraWeek ? 'Fest' : 'Workshop',
        room_id: booking.roomId,
        date: booking.date,
        start_time: booking.startTime,
        end_time: booking.endTime,
        period_ids: booking.periodIds,
        expected_attendees: booking.expectedAttendees,
        description: booking.purpose,
        requires_av: booking.requiresAV,
        requires_ac: booking.requiresAC,
        is_spectra_week: booking.isSpectraWeek,
      }),
    });
  }

  async approveBooking(bookingId: string): Promise<any> {
    return this.request(`/api/bookings/${bookingId}/approve`, { method: 'POST' });
  }

  async rejectBooking(bookingId: string, reason: string, alternative_suggestion?: string): Promise<any> {
    return this.request(`/api/bookings/${bookingId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, alternative_suggestion }),
    });
  }

  async cancelBooking(bookingId: string): Promise<any> {
    return this.request(`/api/bookings/${bookingId}/cancel`, { method: 'POST' });
  }

  // Exams
  async getExaminations(examType?: string, date?: string): Promise<ExamScheduleItem[]> {
    const params = new URLSearchParams();
    if (examType && examType !== 'All') params.append('exam_type', examType);
    if (date) params.append('date', date);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const raw = await this.request<any[]>(`/api/exams${qs}`);
    return raw.map(e => ({
      id: e.id,
      examType: (e.exam_type || 'Midsem') as 'Midsem' | 'Endsem',
      date: e.date,
      day: e.day,
      timeSlot: e.time_slot,
      courseCode: e.course_code || 'CS301',
      courseTitle: e.course_title || 'Course Examination',
      studentGroup: e.student_group,
      enrolledStudents: e.enrolled_students,
      allocatedRooms: (e.allocated_rooms || []).map((r: any) => ({
        roomId: r.room_id || r.roomId,
        roomName: r.room_name || r.roomName,
        allocatedSeats: r.allocated_seats ?? r.allocatedSeats ?? 30,
        invigilator: r.invigilator || r.invigilator_name || 'Prof. Faculty',
      })),
    }));
  }

  async createExamination(exam: any): Promise<ExamScheduleItem> {
    const raw = await this.request<any>('/api/exams', {
      method: 'POST',
      body: JSON.stringify({
        exam_type: exam.examType || 'Midsem',
        date: exam.date,
        day: exam.day,
        time_slot: exam.timeSlot || '09:30 - 11:30 AM',
        course_id: exam.courseId || exam.courseCode,
        student_group_name: exam.studentGroup,
        enrolled_students: exam.enrolledStudents || 60,
        allocated_rooms: (exam.allocatedRooms || []).map((r: any) => ({
          room_id: r.roomId,
          room_name: r.roomName,
          allocated_seats: r.allocatedSeats,
          invigilator: r.invigilator,
        })),
      }),
    });
    return {
      id: raw.id,
      examType: (raw.exam_type || 'Midsem') as 'Midsem' | 'Endsem',
      date: raw.date,
      day: raw.day,
      timeSlot: raw.time_slot,
      courseCode: raw.course_code || exam.courseCode,
      courseTitle: raw.course_title || exam.courseTitle || 'Course Examination',
      studentGroup: raw.student_group,
      enrolledStudents: raw.enrolled_students,
      allocatedRooms: (raw.allocated_rooms || []).map((r: any) => ({
        roomId: r.room_id || r.roomId,
        roomName: r.room_name || r.roomName,
        allocatedSeats: r.allocated_seats ?? r.allocatedSeats ?? 30,
        invigilator: r.invigilator || r.invigilator_name || 'Prof. Faculty',
      })),
    };
  }

  async updateExamination(id: string, exam: any): Promise<ExamScheduleItem> {
    const raw = await this.request<any>(`/api/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        exam_type: exam.examType,
        date: exam.date,
        day: exam.day,
        time_slot: exam.timeSlot,
        course_id: exam.courseId || exam.courseCode,
        student_group_name: exam.studentGroup,
        enrolled_students: exam.enrolledStudents,
        allocated_rooms: exam.allocatedRooms ? exam.allocatedRooms.map((r: any) => ({
          room_id: r.roomId,
          room_name: r.roomName,
          allocated_seats: r.allocatedSeats,
          invigilator: r.invigilator,
        })) : undefined,
      }),
    });
    return {
      id: raw.id,
      examType: (raw.exam_type || 'Midsem') as 'Midsem' | 'Endsem',
      date: raw.date,
      day: raw.day,
      timeSlot: raw.time_slot,
      courseCode: raw.course_code || exam.courseCode,
      courseTitle: raw.course_title || exam.courseTitle || 'Course Examination',
      studentGroup: raw.student_group,
      enrolledStudents: raw.enrolled_students,
      allocatedRooms: (raw.allocated_rooms || []).map((r: any) => ({
        roomId: r.room_id || r.roomId,
        roomName: r.room_name || r.roomName,
        allocatedSeats: r.allocated_seats ?? r.allocatedSeats ?? 30,
        invigilator: r.invigilator || r.invigilator_name || 'Prof. Faculty',
      })),
    };
  }

  async deleteExamination(id: string): Promise<any> {
    return this.request(`/api/exams/${id}`, { method: 'DELETE' });
  }

  async generateExams(config: any): Promise<any> {
    return this.request('/api/exams/generate', {
      method: 'POST',
      body: JSON.stringify({
        start_date: config.startDate,
        end_date: config.endDate,
        slot_morning: config.slotMorning,
        slot_afternoon: config.slotAfternoon,
        alternate_seating: config.alternateSeating,
      }),
    });
  }

  // Rescheduling & Disruptions
  async getChangeRequests(): Promise<RescheduleRequest[]> {
    const raw = await this.request<any[]>('/api/rescheduling/changes');
    return raw.map(r => ({
      id: r.id,
      facultyName: r.faculty_name || 'Faculty Member',
      courseCode: r.course_code,
      originalSlot: {
        day: r.original_slot.day,
        periodId: r.original_slot.periodId,
        roomName: r.original_slot.roomName,
        groupName: r.original_slot.groupName,
      },
      proposedSlot: {
        day: r.proposed_slot.day,
        periodId: r.proposed_slot.periodId,
        roomName: r.proposed_slot.roomName,
        groupName: r.proposed_slot.groupName,
      },
      reason: r.reason,
      status: r.status,
      conflictAnalysis: r.conflict_analysis,
      submittedDate: r.submitted_date || 'Recent',
    }));
  }

  async proposeReschedule(data: any): Promise<any> {
    return this.request('/api/rescheduling/propose', {
      method: 'POST',
      body: JSON.stringify({
        course_code: data.courseCode,
        original_day: data.originalSlot.day,
        original_period: data.originalSlot.periodId,
        original_room_name: data.originalSlot.roomName,
        original_group_name: data.originalSlot.groupName,
        proposed_day: data.proposedSlot.day,
        proposed_period: data.proposedSlot.periodId,
        proposed_room_name: data.proposedSlot.roomName,
        proposed_group_name: data.proposedSlot.groupName,
        reason: data.reason,
      }),
    });
  }

  async approveReschedule(id: string): Promise<any> {
    return this.request(`/api/rescheduling/${id}/approve`, { method: 'POST' });
  }

  async rejectReschedule(id: string): Promise<any> {
    return this.request(`/api/rescheduling/${id}/reject`, { method: 'POST' });
  }

  async getDisruptions(): Promise<DisruptionEvent[]> {
    const raw = await this.request<any[]>('/api/rescheduling/disruptions');
    return raw.map(d => this.mapDisruption(d));
  }

  async createDisruption(data: any): Promise<DisruptionEvent> {
    const raw = await this.request<any>('/api/rescheduling/disruptions', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        type: data.type,
        affected_date: data.affectedDate || data.affected_date,
        affected_entity: data.affectedEntity || data.affected_entity,
        affected_slots_count: data.affectedSlotsCount ?? data.affected_slots_count ?? 1,
        status: data.status || 'Unresolved',
        reported_at: data.reportedAt || data.reported_at || 'Just now',
        proposed_resolution: data.proposedResolution || data.proposed_resolution,
      }),
    });
    return this.mapDisruption(raw);
  }

  async updateDisruption(id: string, data: any): Promise<DisruptionEvent> {
    const raw = await this.request<any>(`/api/rescheduling/disruptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.mapDisruption(raw);
  }

  // Notifications
  async getNotifications(unreadOnly?: boolean): Promise<any[]> {
    const query = unreadOnly ? '?unread_only=true' : '';
    const raw = await this.request<any[]>(`/api/notifications${query}`);
    return raw.map(n => ({
      id: n.id,
      title: n.title,
      description: n.description,
      time: n.time || (n.created_at ? new Date(n.created_at).toLocaleTimeString() : 'Just now'),
      type: n.type || 'info',
      read: !!n.read,
      linkModule: n.link_module || n.linkModule,
      linkSubPage: n.link_sub_page || n.linkSubPage,
    }));
  }

  async markNotificationRead(id: string): Promise<any> {
    return this.request(`/api/notifications/${id}/read`, { method: 'POST' });
  }

  async deleteNotification(id: string): Promise<any> {
    try {
      return await this.request(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  }

  async clearNotifications(): Promise<any> {
    return this.request('/api/notifications/clear-all', { method: 'POST' });
  }

  // Analytics
  async getAnalyticsOverview(): Promise<AnalyticsSummary> {
    const raw = await this.request<any>('/api/analytics/overview');
    return {
      totalRooms: raw.total_rooms,
      facultyMembers: raw.faculty_members,
      studentGroups: raw.student_groups,
      courses: raw.courses,
      teachingSessions: raw.teaching_sessions,
      midsemExams: raw.midsem_exams,
      pendingBookingRequests: raw.pending_booking_requests,
      scheduledSessions: raw.scheduled_sessions,
      unscheduledSessions: raw.unscheduled_sessions,
      currentConflicts: raw.current_conflicts,
      solverSatisfactionRate: raw.solver_satisfaction_rate,
      averageRoomUtilization: raw.average_room_utilization,
      peakHour: raw.peak_hour,
    };
  }

  async getRoomUtilization(): Promise<any[]> {
    return this.request<any[]>('/api/analytics/room-utilization');
  }

  async getFacultyWorkload(): Promise<any[]> {
    return this.request<any[]>('/api/analytics/faculty-workload');
  }

  async getConflicts(): Promise<any> {
    return this.request<any>('/api/analytics/conflicts');
  }

  // Dataset
  async getDatasetStatus(): Promise<any> {
    return this.request('/api/dataset/status');
  }

  async resetDemo(): Promise<any> {
    return this.request('/api/dataset/reset-demo', { method: 'POST' });
  }
  // AI Assistant & Gemini Integration
  async getAIConversations(): Promise<ChatConversationItem[]> {
    const raw = await this.request<any[]>('/api/ai/conversations');
    return raw.map(c => ({
      id: c.id,
      userId: c.user_id,
      title: c.title,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      messageCount: c.message_count || 0,
      lastMessage: c.last_message,
    }));
  }

  async createAIConversation(title?: string): Promise<ChatConversationItem> {
    const raw = await this.request<any>('/api/ai/conversations', {
      method: 'POST',
      body: JSON.stringify({ title: title || 'New Schedule Inquiry' }),
    });
    return {
      id: raw.id,
      userId: raw.user_id,
      title: raw.title,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      messageCount: raw.message_count || 0,
      lastMessage: raw.last_message,
    };
  }

  async getAIConversation(id: string): Promise<{ conversation: ChatConversationItem; messages: ChatMessageItem[] }> {
    const raw = await this.request<any>(`/api/ai/conversations/${id}`);
    return {
      conversation: {
        id: raw.id,
        userId: raw.user_id,
        title: raw.title,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
        messageCount: raw.messages?.length || 0,
      },
      messages: (raw.messages || []).map((m: any) => ({
        id: m.id,
        conversationId: m.conversation_id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
      })),
    };
  }

  async renameAIConversation(id: string, title: string): Promise<ChatConversationItem> {
    const raw = await this.request<any>(`/api/ai/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
    return {
      id: raw.id,
      userId: raw.user_id,
      title: raw.title,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      messageCount: raw.message_count || 0,
    };
  }

  async deleteAIConversation(id: string): Promise<void> {
    await this.request(`/api/ai/conversations/${id}`, { method: 'DELETE' });
  }

  async sendAIChat(message: string, conversationId?: string): Promise<AIChatResponsePayload> {
    const raw = await this.request<any>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId || null,
      }),
    });
    return {
      response: raw.response,
      conversationId: raw.conversation_id,
      messageId: raw.message_id,
      modelUsed: raw.model_used,
      status: raw.status,
      groundedEntitiesCount: raw.grounded_entities_count,
    };
  }
}

export const api = new ApiClient();
