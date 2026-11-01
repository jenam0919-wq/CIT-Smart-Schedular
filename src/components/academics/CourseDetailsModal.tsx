/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Course, TimetableSlot, FacultyMember, StudentGroup } from '../../types';
import {
  X,
  BookOpen,
  GraduationCap,
  Users,
  Clock,
  Building,
  DoorOpen,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Edit,
  FlaskConical,
  ShieldCheck
} from 'lucide-react';

interface CourseDetailsModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  timetableSlots: TimetableSlot[];
  facultyList: FacultyMember[];
  studentGroups: StudentGroup[];
  onEdit: (course: Course) => void;
}

const PERIOD_LABELS: Record<string, string> = {
  P1: '09:00 - 09:50',
  P2: '10:00 - 10:50',
  P3: '11:00 - 11:50',
  P4: '12:00 - 12:50',
  P5: '13:00 - 13:50',
  P6: '14:00 - 14:50',
  P7: '15:00 - 15:50',
  P8: '16:00 - 16:50',
  P9: '17:00 - 17:50',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  course,
  isOpen,
  onClose,
  timetableSlots,
  facultyList,
  studentGroups,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'instructors' | 'cohorts' | 'rooms'>('schedule');

  // Filter slots for this course
  const courseSlots = useMemo(() => {
    if (!course) return [];
    return timetableSlots.filter(
      s => s.courseCode?.toUpperCase() === course.code.toUpperCase()
    );
  }, [course, timetableSlots]);

  // Distinct faculty teaching this course
  const assignedFaculty = useMemo(() => {
    const facultyMap = new Map<string, number>();
    courseSlots.forEach(s => {
      if (!s.facultyName) return;
      facultyMap.set(s.facultyName, (facultyMap.get(s.facultyName) || 0) + 1);
    });
    return Array.from(facultyMap.entries()).map(([name, sessions]) => {
      const fac = facultyList.find(f => f.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        sessions,
        department: fac?.department || course?.department || 'Engineering',
        designation: fac?.designation || 'Instructor',
      };
    });
  }, [courseSlots, facultyList, course]);

  // Distinct groups taking this course
  const enrolledGroups = useMemo(() => {
    const groupMap = new Map<string, number>();
    courseSlots.forEach(s => {
      if (!s.groupName) return;
      groupMap.set(s.groupName, (groupMap.get(s.groupName) || 0) + 1);
    });
    return Array.from(groupMap.entries()).map(([name, sessions]) => {
      const grp = studentGroups.find(g => g.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        sessions,
        strength: grp?.strength || 60,
        semester: grp?.semester || 1,
      };
    });
  }, [courseSlots, studentGroups]);

  // Distinct rooms allocated
  const allocatedRooms = useMemo(() => {
    const roomMap = new Map<string, number>();
    courseSlots.forEach(s => {
      if (!s.roomName) return;
      roomMap.set(s.roomName, (roomMap.get(s.roomName) || 0) + 1);
    });
    return Array.from(roomMap.entries()).map(([name, sessions]) => ({ name, sessions }));
  }, [courseSlots]);

  if (!isOpen || !course) return null;

  const isLab = course.type === 'Lab';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white/95 border border-white/80 shadow-2xl shadow-blue-950/20 backdrop-blur-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative p-6 pb-5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative flex flex-col md:flex-row md:items-center gap-5">
            {/* Course Code Avatar */}
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl flex flex-col items-center justify-center text-white shrink-0 border border-white/20 p-2 text-center">
              <span className="font-mono font-black text-sm">{course.code}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 mt-0.5">{course.type}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  {course.department}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/15">
                  {course.credits} Credits
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/15">
                  {course.weeklyHours} hrs/week
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Active Syllabus
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white truncate">
                {course.title}
              </h2>

              <p className="text-xs text-slate-300 mt-2">
                Mandatory core curriculum course for academic department {course.department}.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 pt-2 md:pt-0">
              <button
                onClick={() => {
                  onClose();
                  onEdit(course);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Course
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Total Classes</span>
                <Clock className="w-3 h-3 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {courseSlots.length} <span className="text-xs font-normal text-slate-300">sessions/wk</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Instructors</span>
                <GraduationCap className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {assignedFaculty.length} <span className="text-xs font-normal text-slate-300">professors</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Cohorts</span>
                <Users className="w-3 h-3 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {enrolledGroups.length} <span className="text-xs font-normal text-slate-300">sections</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Venues</span>
                <DoorOpen className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {allocatedRooms.length} <span className="text-xs font-normal text-slate-300">rooms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200/80 bg-slate-50/70">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'schedule'
                ? 'text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Scheduled Sessions ({courseSlots.length})
          </button>
          <button
            onClick={() => setActiveTab('instructors')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'instructors'
                ? 'text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Assigned Instructors ({assignedFaculty.length})
          </button>
          <button
            onClick={() => setActiveTab('cohorts')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'cohorts'
                ? 'text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Enrolled Student Cohorts ({enrolledGroups.length})
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'rooms'
                ? 'text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Assigned Venues ({allocatedRooms.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Weekly Timetable Slots for {course.code}
                </h3>
                <p className="text-xs text-slate-500">
                  All active classroom lecture periods allocated for this syllabus.
                </p>
              </div>

              {courseSlots.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500">
                  <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold">No Active Sessions Scheduled</p>
                  <p className="text-xs text-slate-400 mt-1">Run the CP-SAT timetable solver to schedule this course.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {courseSlots.map(slot => (
                    <div
                      key={slot.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {slot.day} • {slot.periodId}
                        </span>
                        <span className="text-[11px] font-semibold text-blue-700">
                          {PERIOD_LABELS[slot.periodId] || slot.periodId}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-500">Room:</span>
                          <strong className="text-slate-900">{slot.roomName}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-500">Cohort:</span>
                          <span className="font-bold text-blue-700">{slot.groupName}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-500">Faculty:</span>
                          <span className="text-slate-800 font-medium truncate max-w-[140px]">{slot.facultyName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'instructors' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Faculty Instructors & Teaching Assistants
                </h3>
                <p className="text-xs text-slate-500">
                  Approved faculty members mapped to course {course.code}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assignedFaculty.map(fac => (
                  <div
                    key={fac.name}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center font-bold text-xs">
                        {fac.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{fac.name}</h4>
                        <p className="text-xs text-slate-500">{fac.designation} • {fac.department}</p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {fac.sessions} sessions/wk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cohorts' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Enrolled Student Sections
                </h3>
                <p className="text-xs text-slate-500">
                  Student cohorts taking this course during the active term.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {enrolledGroups.map(grp => (
                  <div
                    key={grp.name}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{grp.name}</h4>
                      <p className="text-xs text-slate-500">Semester {grp.semester} • {grp.strength} Students</p>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {grp.sessions} classes/wk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Allocated Classrooms and Laboratories
                </h3>
                <p className="text-xs text-slate-500">
                  Physical venues where this course is conducted.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {allocatedRooms.map(r => (
                  <div
                    key={r.name}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <DoorOpen className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{r.name}</h4>
                        <span className="text-[11px] text-slate-500">Scheduled Venue</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {r.sessions} sessions
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>CIT Smart Scheduler • Course Catalog Registry</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(course);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

