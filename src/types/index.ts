/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'coordinator' | 'faculty' | 'student' | 'warden' | 'staff' | 'club';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatarUrl?: string;
  title?: string;
  clubName?: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimePeriod {
  id: string; // 'P1' to 'P9'
  periodNumber: number;
  startTime: string; // '08:00'
  endTime: string;   // '09:00'
  isLunchBreak?: boolean;
}

export type RoomType = 'Lecture Hall' | 'Computer Lab' | 'Hardware Lab' | 'Seminar Hall' | 'Auditorium' | 'Workshop';

export interface Room {
  id: string;
  name: string;
  code: string;
  block: string;
  floor: number;
  type: RoomType;
  capacity: number;
  examCapacity: number;
  hasProjector: boolean;
  hasAudioSystem: boolean;
  hasAirConditioning: boolean;
  isAvailableNow?: boolean;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  credits: number;
  type: 'Lecture' | 'Lab' | 'Tutorial';
  colorTag: string; // Tailwind hex or class reference
  weeklyHours: number;
}

export interface StudentGroup {
  id: string;
  name: string; // e.g., 'CSE-4A', 'ECE-3B'
  department: string;
  semester: number;
  strength: number;
  classRepresentative: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  weeklyWorkloadHours: number;
  maxWorkloadHours: number;
  unavailability?: {
    day: DayOfWeek;
    periodId: string;
    reason: string;
  }[];
}

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  periodId: string; // 'P1' ... 'P9'
  courseId: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  roomId: string;
  roomName: string;
  groupId: string;
  groupName: string;
  sessionType: 'Lecture' | 'Lab' | 'Tutorial';
  durationPeriods: number; // 1 or 2 (for labs)
  colorTag: string;
}

export type BookingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Under Review' | 'Cancelled';

export interface VenueBookingRequest {
  id: string;
  eventTitle: string;
  requestedBy: string;
  requesterRole: UserRole;
  requesterEmail: string;
  clubOrDept: string;
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  periodIds: string[];
  expectedAttendees: number;
  purpose: string;
  requiresAV: boolean;
  requiresAC: boolean;
  status: BookingStatus;
  rejectionReason?: string;
  alternativeSuggestion?: string;
  isSpectraWeek: boolean;
  submittedAt: string;
  priorityScore: number;
}

export interface ExamScheduleItem {
  id: string;
  examType: 'Midsem' | 'Endsem';
  date: string;
  day: string;
  timeSlot: string; // e.g., '09:30 - 11:30 AM'
  courseCode: string;
  courseTitle: string;
  studentGroup: string;
  enrolledStudents: number;
  allocatedRooms: {
    roomId: string;
    roomName: string;
    allocatedSeats: number;
    invigilator: string;
  }[];
}

export interface DisruptionEvent {
  id: string;
  title: string;
  type: 'Faculty Leave' | 'Room Maintenance' | 'Campus Event' | 'Equipment Failure';
  affectedDate: string;
  affectedEntity: string; // e.g., 'Prof. R. Sengupta' or 'LH-201'
  affectedSlotsCount: number;
  status: 'Unresolved' | 'Rescheduled' | 'Under Optimization';
  reportedAt: string;
  proposedResolution?: string;
}

export interface RescheduleRequest {
  id: string;
  facultyName: string;
  courseCode: string;
  originalSlot: {
    day: DayOfWeek;
    periodId: string;
    roomName: string;
    groupName: string;
  };
  proposedSlot: {
    day: DayOfWeek;
    periodId: string;
    roomName: string;
    groupName: string;
  };
  reason: string;
  status: 'Pending Admin Review' | 'Approved' | 'Rejected';
  conflictAnalysis: {
    hasConflicts: boolean;
    studentConflict: boolean;
    facultyConflict: boolean;
    roomConflict: boolean;
    details: string;
  };
  submittedDate: string;
}

export interface AnalyticsSummary {
  totalRooms: number;
  facultyMembers: number;
  studentGroups: number;
  courses: number;
  teachingSessions: number;
  midsemExams: number;
  pendingBookingRequests: number;
  scheduledSessions: number;
  unscheduledSessions: number;
  currentConflicts: number;
  solverSatisfactionRate: number;
  averageRoomUtilization: number;
  peakHour: string;
}

export interface SolverConstraintConfig {
  noFacultyOverlap: boolean;
  noStudentOverlap: boolean;
  roomCapacityCompliance: boolean;
  facultyConsecutiveLimit: number;
  maxDailyHoursPerGroup: number;
  preferMorningLectures: boolean;
  balanceWeeklyWorkload: boolean;
  solverTimeoutSeconds: number;
  workerThreads: number;
}

export interface ChatMessageItem {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface ChatConversationItem {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
}

export interface AIChatResponsePayload {
  response: string;
  conversationId: string;
  messageId: string;
  modelUsed: string;
  status: string;
  groundedEntitiesCount?: Record<string, number>;
}
