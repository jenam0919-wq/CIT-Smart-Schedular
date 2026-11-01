/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  User,
  UserRole,
  Room,
  FacultyMember,
  StudentGroup,
  Course,
  TimetableSlot,
  VenueBookingRequest,
  RescheduleRequest,
  DisruptionEvent,
  ExamScheduleItem,
} from '../types';
import {
  DEMO_USERS,
  MOCK_ROOMS,
  MOCK_FACULTY,
  MOCK_STUDENT_GROUPS,
  MOCK_COURSES,
  MOCK_TIMETABLE_SLOTS,
  MOCK_BOOKING_REQUESTS,
  MOCK_DISRUPTIONS,
  MOCK_RESCHEDULE_REQUESTS,
  MOCK_EXAM_SCHEDULE,
} from '../data/mockData';
import { api } from '../services/api';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  linkModule?: string;
  linkSubPage?: string;
}

interface AppContextType {
  currentUser: User | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  activeModule: string;
  activeSubPage: string;
  academicTerm: string;
  searchQuery: string;
  isSearchModalOpen: boolean;
  isMobileSidebarOpen: boolean;
  isDemoNoticeOpen: boolean;

  // API Integration state
  apiStatus: 'connected' | 'offline' | 'connecting';
  isLoadingData: boolean;
  apiError: string | null;

  // Filter states
  filterGroup: string;
  filterFaculty: string;
  filterRoom: string;
  filterDay: string;

  // Data sets
  rooms: Room[];
  faculty: FacultyMember[];
  studentGroups: StudentGroup[];
  courses: Course[];
  timetableSlots: TimetableSlot[];
  bookingRequests: VenueBookingRequest[];
  rescheduleRequests: RescheduleRequest[];
  disruptions: DisruptionEvent[];
  examinations: ExamScheduleItem[];
  notifications: NotificationItem[];

  // Actions
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  setActiveNavigation: (module: string, subPage?: string) => void;
  setSearchQuery: (query: string) => void;
  setIsSearchModalOpen: (open: boolean) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
  setIsDemoNoticeOpen: (open: boolean) => void;
  setAcademicTerm: (term: string) => void;

  setFilterGroup: (group: string) => void;
  setFilterFaculty: (faculty: string) => void;
  setFilterRoom: (room: string) => void;
  setFilterDay: (day: string) => void;

  approveBookingRequest: (id: string) => Promise<void>;
  rejectBookingRequest: (id: string, reason: string, suggestion?: string) => Promise<void>;
  submitBookingRequest: (newReq: Omit<VenueBookingRequest, 'id' | 'submittedAt' | 'priorityScore' | 'status'>) => Promise<void>;
  cancelBookingRequest: (id: string) => Promise<void>;

  approveRescheduleRequest: (id: string) => Promise<void>;
  rejectRescheduleRequest: (id: string) => Promise<void>;
  submitRescheduleRequest: (req: Omit<RescheduleRequest, 'id' | 'submittedDate' | 'status'>) => Promise<void>;

  createDisruptionEvent: (data: any) => Promise<void>;
  resolveDisruptionEvent: (id: string, notes?: string) => Promise<void>;

  generateTimetableSchedule: (timeLimit?: number, weights?: any) => Promise<any>;

  createRoom: (room: any) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  createFaculty: (fac: any) => Promise<void>;
  updateFaculty: (id: string, fac: any) => Promise<void>;
  deleteFaculty: (id: string) => Promise<void>;
  markFacultyUnavailability: (data: { faculty_id: string; day: string; period_id: string; reason: string }) => Promise<void>;
  createStudentGroup: (group: any) => Promise<void>;
  updateStudentGroup: (id: string, group: any) => Promise<void>;
  deleteStudentGroup: (id: string) => Promise<void>;
  createCourse: (course: any) => Promise<void>;
  updateCourse: (id: string, course: any) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  createExamination: (exam: any) => Promise<void>;
  updateExamination: (id: string, exam: any) => Promise<void>;
  deleteExamination: (id: string) => Promise<void>;
  generateExamSchedule: (config: any) => Promise<any>;

  resetDemoDatabase: () => Promise<void>;
  refreshBackendData: () => Promise<void>;

  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  dismissApiError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Backend API: FastAPI Connected',
    description: 'PostgreSQL & SQLite models loaded with Google OR-Tools CP-SAT scheduler.',
    time: 'Just now',
    type: 'success',
    read: false,
    linkModule: 'analytics',
    linkSubPage: 'solver-stats',
  },
  {
    id: 'notif-2',
    title: 'Disruption Alert: Faculty Sick Leave',
    description: 'Dr. Debabrata Samal reported medical leave. Rescheduling engine ready.',
    time: '12m ago',
    type: 'alert',
    read: false,
    linkModule: 'rescheduling',
    linkSubPage: 'disruptions',
  },
  {
    id: 'notif-3',
    title: 'Venue Booking: Spectra Fest 2026',
    description: 'Robotics Club requested Main Auditorium for Saturday Robotics Exhibition.',
    time: '45m ago',
    type: 'info',
    read: false,
    linkModule: 'booking',
    linkSubPage: 'pending',
  },
  {
    id: 'notif-4',
    title: 'Midsem Exam Schedule Verified',
    description: '41 examination sessions mapped with alternate seating compliance.',
    time: '2h ago',
    type: 'warning',
    read: true,
    linkModule: 'exams',
    linkSubPage: 'seating',
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USERS[0]);
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [activeSubPage, setActiveSubPage] = useState<string>('overview');
  const [academicTerm, setAcademicTerm] = useState<string>('Spring 2026 (Even Semester)');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isDemoNoticeOpen, setIsDemoNoticeOpen] = useState<boolean>(false);

  // API connectivity status
  const [apiStatus, setApiStatus] = useState<'connected' | 'offline' | 'connecting'>('connecting');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters
  const [filterGroup, setFilterGroup] = useState<string>('All');
  const [filterFaculty, setFilterFaculty] = useState<string>('All');
  const [filterRoom, setFilterRoom] = useState<string>('All');
  const [filterDay, setFilterDay] = useState<string>('All');

  // Application Data Sets
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [faculty, setFaculty] = useState<FacultyMember[]>(MOCK_FACULTY);
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>(MOCK_STUDENT_GROUPS);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(MOCK_TIMETABLE_SLOTS);
  const [bookingRequests, setBookingRequests] = useState<VenueBookingRequest[]>(MOCK_BOOKING_REQUESTS);
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>(MOCK_RESCHEDULE_REQUESTS);
  const [disruptions, setDisruptions] = useState<DisruptionEvent[]>(MOCK_DISRUPTIONS);
  const [examinations, setExaminations] = useState<ExamScheduleItem[]>(MOCK_EXAM_SCHEDULE);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const activeRole: UserRole = currentUser ? currentUser.role : 'admin';
  const isAuthenticated = currentUser !== null;

  // Refresh live backend data
  const refreshBackendData = async () => {
    setIsLoadingData(true);
    try {
      await api.checkHealth();
      setApiStatus('connected');

      // Fetch live data from backend endpoints simultaneously
      const [
        fetchedRooms,
        fetchedFaculty,
        fetchedGroups,
        fetchedCourses,
        fetchedBookings,
        fetchedReschedules,
        fetchedTimetable,
        fetchedDisruptions,
        fetchedExaminations,
        fetchedNotifications,
      ] = await Promise.allSettled([
        api.getRooms(),
        api.getFaculty(),
        api.getStudentGroups(),
        api.getCourses(),
        api.getBookings(),
        api.getChangeRequests(),
        api.getCurrentTimetable(),
        api.getDisruptions(),
        api.getExaminations(),
        api.getNotifications(),
      ]);

      if (fetchedRooms.status === 'fulfilled' && fetchedRooms.value.length > 0) {
        setRooms(fetchedRooms.value);
      }
      if (fetchedFaculty.status === 'fulfilled' && fetchedFaculty.value.length > 0) {
        setFaculty(fetchedFaculty.value);
      }
      if (fetchedGroups.status === 'fulfilled' && fetchedGroups.value.length > 0) {
        setStudentGroups(fetchedGroups.value);
      }
      if (fetchedCourses.status === 'fulfilled' && fetchedCourses.value.length > 0) {
        setCourses(fetchedCourses.value);
      }
      if (fetchedBookings.status === 'fulfilled') {
        setBookingRequests(fetchedBookings.value);
      }
      if (fetchedReschedules.status === 'fulfilled') {
        setRescheduleRequests(fetchedReschedules.value);
      }
      if (fetchedTimetable.status === 'fulfilled' && fetchedTimetable.value.slots?.length > 0) {
        setTimetableSlots(fetchedTimetable.value.slots);
      }
      if (fetchedDisruptions.status === 'fulfilled' && fetchedDisruptions.value.length > 0) {
        setDisruptions(fetchedDisruptions.value);
      }
      if (fetchedExaminations.status === 'fulfilled' && fetchedExaminations.value.length > 0) {
        setExaminations(fetchedExaminations.value);
      }
      if (fetchedNotifications.status === 'fulfilled' && fetchedNotifications.value.length > 0) {
        setNotifications(fetchedNotifications.value);
      }

      setApiError(null);
    } catch (err: any) {
      setApiStatus('offline');
      // Graceful local fallback
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshBackendData();
  }, []);

  // Listen to Firebase Auth state changes and persist session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          api.setToken(idToken);
          if (!currentUser || currentUser.email !== fbUser.email) {
            const roleMatch = DEMO_USERS.find(u => u.email.toLowerCase() === fbUser.email?.toLowerCase());
            if (roleMatch) {
              setCurrentUser(roleMatch);
            } else {
              setCurrentUser({
                id: fbUser.uid,
                email: fbUser.email || '',
                name: fbUser.displayName || fbUser.email?.split('@')[0] || 'CIT User',
                role: 'admin',
                department: 'Chilika Institute of Technology',
              });
            }
          }
        } catch (err) {
          console.warn('Firebase token sync error:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Ensure an active authentication token exists for the active session
  useEffect(() => {
    const ensureAuth = async () => {
      if (currentUser && !api.getToken() && !auth.currentUser) {
        try {
          await api.login(currentUser.email, 'demo123');
        } catch (err) {
          try {
            await api.login('admin@cit.edu', 'demo123');
          } catch (_) {}
        }
      }
    };
    ensureAuth();
  }, [currentUser]);

  const login = async (email: string, password = 'demo123', preferredRole?: UserRole): Promise<boolean> => {
    setIsLoadingData(true);
    try {
      const res = await api.login(email, password);
      const roleMap: Record<string, UserRole> = {
        ADMIN: 'admin',
        DEPARTMENT_COORDINATOR: 'coordinator',
        FACULTY: 'faculty',
        CLUB_REPRESENTATIVE: 'club',
      };

      const userObj: User = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: roleMap[res.user.role.toUpperCase()] || 'admin',
        department: res.user.department,
        title: res.user.title,
        clubName: res.user.club_name,
        avatarUrl: res.user.avatar_url,
      };

      setCurrentUser(userObj);
      setActiveModule('dashboard');
      setActiveSubPage('overview');
      setApiStatus('connected');
      await refreshBackendData();
      return true;
    } catch (backendErr) {
      let found = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found && preferredRole) {
        found = DEMO_USERS.find(u => u.role === preferredRole);
      }
      if (found) {
        setCurrentUser(found);
        setActiveModule('dashboard');
        setActiveSubPage('overview');
        return true;
      }
      if (email.includes('admin')) {
        setCurrentUser(DEMO_USERS[0]);
      } else if (email.includes('coordinator')) {
        setCurrentUser(DEMO_USERS[1]);
      } else if (email.includes('faculty')) {
        setCurrentUser(DEMO_USERS[2]);
      } else if (email.includes('club')) {
        setCurrentUser(DEMO_USERS[3]);
      } else {
        return false;
      }
      setActiveModule('dashboard');
      setActiveSubPage('overview');
      return true;
    } finally {
      setIsLoadingData(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setCurrentUser(null);
    setActiveModule('dashboard');
    setActiveSubPage('overview');
  };

  const switchRole = (role: UserRole) => {
    const targetUser = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    setCurrentUser(targetUser);
    setActiveModule('dashboard');
    setActiveSubPage('overview');
  };

  const setActiveNavigation = (module: string, subPage: string = 'overview') => {
    setActiveModule(module);
    setActiveSubPage(subPage);
    setIsMobileSidebarOpen(false);
  };

  // Timetable Solver Generator
  const generateTimetableSchedule = async (timeLimit = 30.0, weights?: any) => {
    setIsLoadingData(true);
    setApiError(null);
    try {
      const res = await api.generateTimetable({ time_limit_seconds: timeLimit, objective_weights: weights });
      if (res.slots && res.slots.length > 0) {
        setTimetableSlots(res.slots);
      }
      return res;
    } catch (err: any) {
      const msg = err.message || 'Timetable solver failed to execute';
      setApiError(msg);
      throw err;
    } finally {
      setIsLoadingData(false);
    }
  };

  // Venue Bookings
  const approveBookingRequest = async (id: string) => {
    try {
      await api.approveBooking(id);
      setBookingRequests(prev =>
        prev.map(item => (item.id === id ? { ...item, status: 'Approved' } : item))
      );
    } catch (err: any) {
      setApiError(err.message || 'Failed to approve booking');
      throw err;
    }
  };

  const rejectBookingRequest = async (id: string, reason: string, suggestion?: string) => {
    try {
      await api.rejectBooking(id, reason, suggestion);
      setBookingRequests(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                status: 'Rejected',
                rejectionReason: reason,
                alternativeSuggestion: suggestion || 'Consider booking an alternative venue or later time slot.',
              }
            : item
        )
      );
    } catch (err: any) {
      setApiError(err.message || 'Failed to reject booking');
      throw err;
    }
  };

  const submitBookingRequest = async (newReq: Omit<VenueBookingRequest, 'id' | 'submittedAt' | 'priorityScore' | 'status'>) => {
    try {
      await api.createBooking(newReq);
      await refreshBackendData();
    } catch (err: any) {
      // Optimistic fallback for demo
      const item: VenueBookingRequest = {
        ...newReq,
        id: `req-${Date.now()}`,
        status: 'Pending',
        submittedAt: 'Just now',
        priorityScore: 75,
      };
      setBookingRequests(prev => [item, ...prev]);
    }
  };

  const cancelBookingRequest = async (id: string) => {
    try {
      await api.cancelBooking(id);
      setBookingRequests(prev =>
        prev.map(item => (item.id === id ? { ...item, status: 'Cancelled' } : item))
      );
    } catch (err: any) {
      setApiError(err.message || 'Failed to cancel booking');
      throw err;
    }
  };

  // Rescheduling
  const approveRescheduleRequest = async (id: string) => {
    try {
      const targetReq = rescheduleRequests.find(item => item.id === id);
      try {
        await api.approveReschedule(id);
      } catch (e) {
        // Fallback for offline/local simulation
      }
      setRescheduleRequests(prev =>
        prev.map(item => (item.id === id ? { ...item, status: 'Approved' } : item))
      );

      // If matching timetable slot exists, relocate to proposed slot
      if (targetReq) {
        setTimetableSlots(prevSlots =>
          prevSlots.map(slot => {
            if (
              slot.courseCode === targetReq.courseCode &&
              slot.day === targetReq.originalSlot.day &&
              slot.periodId === targetReq.originalSlot.periodId
            ) {
              return {
                ...slot,
                day: targetReq.proposedSlot.day,
                periodId: targetReq.proposedSlot.periodId,
                roomName: targetReq.proposedSlot.roomName,
                isRescheduled: true,
              };
            }
            return slot;
          })
        );

        // Add real-time notification
        setNotifications(prev => [
          {
            id: `notif-appr-${Date.now()}`,
            title: `Schedule Updated: ${targetReq.courseCode}`,
            description: `${targetReq.facultyName}'s class was relocated to ${targetReq.proposedSlot.day} ${targetReq.proposedSlot.periodId} (${targetReq.proposedSlot.roomName}).`,
            time: 'Just now',
            type: 'success',
            read: false,
            linkModule: 'timetables',
          },
          ...prev,
        ]);
      }
    } catch (err: any) {
      setApiError(err.message || 'Failed to approve reschedule request');
      throw err;
    }
  };

  const rejectRescheduleRequest = async (id: string) => {
    try {
      const targetReq = rescheduleRequests.find(item => item.id === id);
      try {
        await api.rejectReschedule(id);
      } catch (e) {
        // Fallback for offline/local simulation
      }
      setRescheduleRequests(prev =>
        prev.map(item => (item.id === id ? { ...item, status: 'Rejected' } : item))
      );

      if (targetReq) {
        setNotifications(prev => [
          {
            id: `notif-rej-${Date.now()}`,
            title: `Reschedule Rejected: ${targetReq.courseCode}`,
            description: `Change request for ${targetReq.facultyName} on ${targetReq.originalSlot.day} was rejected. Original slot retained.`,
            time: 'Just now',
            type: 'warning',
            read: false,
            linkModule: 'rescheduling',
            linkSubPage: 'requests',
          },
          ...prev,
        ]);
      }
    } catch (err: any) {
      setApiError(err.message || 'Failed to reject reschedule request');
      throw err;
    }
  };

  const submitRescheduleRequest = async (req: Omit<RescheduleRequest, 'id' | 'submittedDate' | 'status'>) => {
    try {
      try {
        await api.proposeReschedule(req);
        await refreshBackendData();
      } catch (e) {
        const item: RescheduleRequest = {
          ...req,
          id: `resch-${Date.now()}`,
          status: 'Pending Admin Review',
          submittedDate: 'Just now',
        };
        setRescheduleRequests(prev => [item, ...prev]);
      }

      setNotifications(prev => [
        {
          id: `notif-sub-${Date.now()}`,
          title: `New Reschedule Request: ${req.courseCode}`,
          description: `${req.facultyName} requested shift to ${req.proposedSlot.day} ${req.proposedSlot.periodId} (${req.proposedSlot.roomName}).`,
          time: 'Just now',
          type: 'info',
          read: false,
          linkModule: 'rescheduling',
          linkSubPage: 'approval',
        },
        ...prev,
      ]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit reschedule request');
      throw err;
    }
  };

  // Disruptions
  const createDisruptionEvent = async (data: any) => {
    try {
      let created: DisruptionEvent;
      try {
        created = await api.createDisruption(data);
      } catch (e) {
        created = {
          id: `dis-${Date.now()}`,
          title: data.title,
          type: data.type,
          affectedDate: data.affectedDate || data.affected_date,
          affectedEntity: data.affectedEntity || data.affected_entity,
          affectedSlotsCount: data.affectedSlotsCount || data.affected_slots_count || 2,
          status: data.status || 'Unresolved',
          reportedAt: 'Just now',
          proposedResolution: data.proposedResolution || data.proposed_resolution,
        };
      }
      setDisruptions(prev => [created, ...prev]);

      setNotifications(prev => [
        {
          id: `notif-dis-${Date.now()}`,
          title: `Campus Disruption Logged: ${created.title}`,
          description: `Disruption logged for ${created.affectedEntity} on ${created.affectedDate}. Micro-solver optimization required.`,
          time: 'Just now',
          type: 'alert',
          read: false,
          linkModule: 'rescheduling',
          linkSubPage: 'disruptions',
        },
        ...prev,
      ]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to create disruption');
      throw err;
    }
  };

  const resolveDisruptionEvent = async (id: string, notes?: string) => {
    try {
      try {
        const updated = await api.updateDisruption(id, { status: 'Rescheduled', proposed_resolution: notes });
        setDisruptions(prev => prev.map(d => (d.id === id ? updated : d)));
      } catch (e) {
        setDisruptions(prev =>
          prev.map(d => (d.id === id ? { ...d, status: 'Rescheduled', proposedResolution: notes || d.proposedResolution } : d))
        );
      }

      setNotifications(prev => [
        {
          id: `notif-disres-${Date.now()}`,
          title: 'Disruption Resolved & Rescheduled',
          description: notes || 'Disruption event marked as rescheduled and master timetable updated.',
          time: 'Just now',
          type: 'success',
          read: false,
          linkModule: 'rescheduling',
          linkSubPage: 'disruptions',
        },
        ...prev,
      ]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to resolve disruption');
      throw err;
    }
  };

  // Entity Management CRUD
  const createRoom = async (roomData: any) => {
    try {
      const newRoom = await api.createRoom(roomData);
      setRooms(prev => [...prev, newRoom]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to create room');
      throw err;
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      await api.deleteRoom(id);
      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      setApiError(err.message || 'Failed to delete room');
      throw err;
    }
  };

  const createFaculty = async (facData: any) => {
    try {
      const newFac = await api.createFaculty(facData);
      setFaculty(prev => [...prev, newFac]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to create faculty');
      throw err;
    }
  };

  const updateFaculty = async (id: string, facData: any) => {
    try {
      const updated = await api.updateFaculty(id, facData);
      setFaculty(prev => prev.map(f => (f.id === id ? updated : f)));
    } catch (err: any) {
      setApiError(err.message || 'Failed to update faculty');
      throw err;
    }
  };

  const markFacultyUnavailability = async (data: { faculty_id: string; day: string; period_id: string; reason: string }) => {
    try {
      await api.markFacultyUnavailability(data);
      await refreshBackendData();
    } catch (err: any) {
      setApiError(err.message || 'Failed to mark faculty unavailability');
      throw err;
    }
  };

  const deleteFaculty = async (id: string) => {
    try {
      await api.deleteFaculty(id);
      setFaculty(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      setApiError(err.message || 'Failed to delete faculty');
      throw err;
    }
  };

  const createStudentGroup = async (groupData: any) => {
    try {
      const newGroup = await api.createStudentGroup(groupData);
      setStudentGroups(prev => [...prev, newGroup]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to create student group');
      throw err;
    }
  };

  const updateStudentGroup = async (id: string, groupData: any) => {
    try {
      const updated = await api.updateStudentGroup(id, groupData);
      setStudentGroups(prev => prev.map(g => (g.id === id ? updated : g)));
    } catch (err: any) {
      setApiError(err.message || 'Failed to update student group');
      throw err;
    }
  };

  const deleteStudentGroup = async (id: string) => {
    try {
      await api.deleteStudentGroup(id);
      setStudentGroups(prev => prev.filter(g => g.id !== id));
    } catch (err: any) {
      setApiError(err.message || 'Failed to delete student group');
      throw err;
    }
  };

  const createCourse = async (courseData: any) => {
    try {
      const newCourse = await api.createCourse(courseData);
      setCourses(prev => [...prev, newCourse]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to create course');
      throw err;
    }
  };

  const updateCourse = async (id: string, courseData: any) => {
    try {
      const updated = await api.updateCourse(id, courseData);
      setCourses(prev => prev.map(c => (c.id === id ? updated : c)));
    } catch (err: any) {
      setApiError(err.message || 'Failed to update course');
      throw err;
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      await api.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setApiError(err.message || 'Failed to delete course');
      throw err;
    }
  };

  const createExamination = async (examData: any) => {
    try {
      const newExam = await api.createExamination(examData);
      setExaminations(prev => [newExam, ...prev]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to create examination');
      throw err;
    }
  };

  const updateExamination = async (id: string, examData: any) => {
    try {
      const updated = await api.updateExamination(id, examData);
      setExaminations(prev => prev.map(e => (e.id === id ? updated : e)));
    } catch (err: any) {
      setApiError(err.message || 'Failed to update examination');
      throw err;
    }
  };

  const deleteExamination = async (id: string) => {
    try {
      await api.deleteExamination(id);
      setExaminations(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      setApiError(err.message || 'Failed to delete examination');
      throw err;
    }
  };

  const generateExamSchedule = async (config: any) => {
    try {
      const res = await api.generateExams(config);
      await refreshBackendData();
      return res;
    } catch (err: any) {
      setApiError(err.message || 'Failed to generate exam schedule');
      throw err;
    }
  };

  const resetDemoDatabase = async () => {
    setIsLoadingData(true);
    try {
      await api.resetDemo();
      await refreshBackendData();
    } catch (err: any) {
      setApiError(err.message || 'Failed to reset demo data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    api.markNotificationRead(id).catch(() => {});
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    api.clearNotifications().catch(() => {});
  };

  const dismissApiError = () => {
    setApiError(null);
  };

  const contextValue = useMemo<AppContextType>(() => ({
    currentUser,
    activeRole,
    isAuthenticated,
    activeModule,
    activeSubPage,
    academicTerm,
    searchQuery,
    isSearchModalOpen,
    isMobileSidebarOpen,
    isDemoNoticeOpen,

    apiStatus,
    isLoadingData,
    apiError,

    filterGroup,
    filterFaculty,
    filterRoom,
    filterDay,

    rooms,
    faculty,
    studentGroups,
    courses,
    timetableSlots,
    bookingRequests,
    rescheduleRequests,
    disruptions,
    examinations,
    notifications,

    login,
    logout,
    switchRole,
    setActiveNavigation,
    setSearchQuery,
    setIsSearchModalOpen,
    setIsMobileSidebarOpen,
    setIsDemoNoticeOpen,
    setAcademicTerm,

    setFilterGroup,
    setFilterFaculty,
    setFilterRoom,
    setFilterDay,

    approveBookingRequest,
    rejectBookingRequest,
    submitBookingRequest,
    cancelBookingRequest,

    approveRescheduleRequest,
    rejectRescheduleRequest,
    submitRescheduleRequest,

    createDisruptionEvent,
    resolveDisruptionEvent,

    generateTimetableSchedule,

    createRoom,
    deleteRoom,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    markFacultyUnavailability,
    createStudentGroup,
    updateStudentGroup,
    deleteStudentGroup,
    createCourse,
    updateCourse,
    deleteCourse,
    createExamination,
    updateExamination,
    deleteExamination,
    generateExamSchedule,

    resetDemoDatabase,
    refreshBackendData,

    setCurrentUser,
    markNotificationAsRead,
    clearAllNotifications,
    dismissApiError,
  }), [
    currentUser,
    activeRole,
    isAuthenticated,
    activeModule,
    activeSubPage,
    academicTerm,
    searchQuery,
    isSearchModalOpen,
    isMobileSidebarOpen,
    isDemoNoticeOpen,
    apiStatus,
    isLoadingData,
    apiError,
    filterGroup,
    filterFaculty,
    filterRoom,
    filterDay,
    rooms,
    faculty,
    studentGroups,
    courses,
    timetableSlots,
    bookingRequests,
    rescheduleRequests,
    disruptions,
    examinations,
    notifications,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
