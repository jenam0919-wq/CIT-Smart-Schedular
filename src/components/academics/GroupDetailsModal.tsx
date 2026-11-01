/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { StudentGroup, TimetableSlot, Course } from '../../types';
import {
  X,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Building,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Edit,
  UserCheck,
  DoorOpen,
  Sparkles,
  Layers,
  CalendarCheck
} from 'lucide-react';

interface GroupDetailsModalProps {
  group: StudentGroup | null;
  isOpen: boolean;
  onClose: () => void;
  timetableSlots: TimetableSlot[];
  courses: Course[];
  onEdit: (group: StudentGroup) => void;
  onViewTimetable?: (group: StudentGroup) => void;
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

export const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  group,
  isOpen,
  onClose,
  timetableSlots,
  courses,
  onEdit,
  onViewTimetable,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'courses' | 'faculty' | 'rooms'>('schedule');

  // Filter slots for this group
  const groupSlots = useMemo(() => {
    if (!group) return [];
    return timetableSlots.filter(
      s => s.groupId === group.id || s.groupName?.toLowerCase() === group.name.toLowerCase()
    );
  }, [group, timetableSlots]);

  // Assigned courses for this group
  const assignedCourses = useMemo(() => {
    if (!group) return [];
    const courseCodes = Array.from(new Set(groupSlots.map(s => s.courseCode)));
    return courses.filter(c => courseCodes.includes(c.code));
  }, [group, groupSlots, courses]);

  // Distinct faculty teaching this group
  const assignedFaculty = useMemo(() => {
    const facultyMap = new Map<string, { name: string; courses: Set<string>; sessions: number }>();
    groupSlots.forEach(s => {
      if (!s.facultyName) return;
      if (!facultyMap.has(s.facultyName)) {
        facultyMap.set(s.facultyName, { name: s.facultyName, courses: new Set(), sessions: 0 });
      }
      const entry = facultyMap.get(s.facultyName)!;
      entry.sessions += 1;
      if (s.courseCode) entry.courses.add(s.courseCode);
    });
    return Array.from(facultyMap.values());
  }, [groupSlots]);

  // Distinct rooms used
  const assignedRooms = useMemo(() => {
    const roomMap = new Map<string, number>();
    groupSlots.forEach(s => {
      if (!s.roomName) return;
      roomMap.set(s.roomName, (roomMap.get(s.roomName) || 0) + 1);
    });
    return Array.from(roomMap.entries()).map(([room, count]) => ({ room, count }));
  }, [groupSlots]);

  // Conflict detection for this group
  const conflicts = useMemo(() => {
    const map = new Map<string, TimetableSlot[]>();
    const foundConflicts: { day: string; period: string; slots: TimetableSlot[] }[] = [];

    groupSlots.forEach(s => {
      const key = `${s.day}-${s.periodId}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });

    map.forEach((slots, key) => {
      if (slots.length > 1) {
        const [day, period] = key.split('-');
        foundConflicts.push({ day, period, slots });
      }
    });

    return foundConflicts;
  }, [groupSlots]);

  // Schedule matrix: day -> periodId -> slot
  const scheduleMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, TimetableSlot>> = {};
    DAYS.forEach(day => {
      matrix[day] = {};
    });

    groupSlots.forEach(slot => {
      if (matrix[slot.day]) {
        matrix[slot.day][slot.periodId] = slot;
      }
    });

    return matrix;
  }, [groupSlots]);

  if (!isOpen || !group) return null;

  const academicYear = Math.ceil(group.semester / 2);
  const labSessions = groupSlots.filter(s => s.sessionType === 'Lab').length;
  const theorySessions = groupSlots.length - labSessions;

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
            {/* Avatar */}
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl flex items-center justify-center text-xl font-black shrink-0 border border-white/20">
              {group.name}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  {group.department}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/15">
                  Semester {group.semester} • Year {academicYear}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/15">
                  ID: {group.id}
                </span>
                {conflicts.length === 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Conflict Free
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {conflicts.length} Overlaps
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white truncate">
                Cohort {group.name}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  {group.strength} Enrolled Students
                </span>
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Class Rep: <strong className="text-white ml-0.5">{group.classRepresentative || 'Not Assigned'}</strong>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 pt-2 md:pt-0">
              <button
                onClick={() => {
                  onClose();
                  onEdit(group);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Cohort
              </button>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Weekly Contact</span>
                <Clock className="w-3 h-3 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {groupSlots.length} <span className="text-xs font-normal text-slate-300">sessions/wk</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Curriculum Subjects</span>
                <BookOpen className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {assignedCourses.length} <span className="text-xs font-normal text-slate-300">courses</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Course Split</span>
                <Layers className="w-3 h-3 text-purple-400" />
              </div>
              <div className="text-xs font-bold text-white mt-1.5">
                {theorySessions} Lec • {labSessions} Labs
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Instructors</span>
                <GraduationCap className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {assignedFaculty.length} <span className="text-xs font-normal text-slate-300">professors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200/80 bg-slate-50/70">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'schedule'
                ? 'text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Weekly Timetable ({groupSlots.length})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'courses'
                ? 'text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Curriculum Courses ({assignedCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'faculty'
                ? 'text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Faculty Mentors ({assignedFaculty.length})
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'rooms'
                ? 'text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Venues & Labs ({assignedRooms.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Weekly Master Timetable (Monday – Saturday)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Optimal schedule generated with Google OR-Tools CP-SAT solver.
                  </p>
                </div>
                {onViewTimetable && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewTimetable(group);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    Open in Timetable Module
                  </button>
                )}
              </div>

              {/* Weekly Matrix */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="p-3 w-28 border-r border-slate-200">Day</th>
                      {['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'].map(p => (
                        <th key={p} className="p-2.5 text-center min-w-[95px] border-r border-slate-200 last:border-r-0">
                          <div className="font-bold text-slate-900">{p}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{PERIOD_LABELS[p]?.split(' - ')[0]}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {DAYS.map(day => (
                      <tr key={day} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800 bg-slate-50/40 border-r border-slate-200">
                          {day}
                        </td>
                        {['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'].map(p => {
                          const slot = scheduleMatrix[day]?.[p];
                          const isLunch = p === 'P5';

                          if (isLunch) {
                            return (
                              <td key={p} className="p-1.5 text-center bg-slate-100/50 border-r border-slate-200 last:border-r-0 text-slate-400 text-[10px] font-medium">
                                Lunch Break
                              </td>
                            );
                          }

                          if (slot) {
                            return (
                              <td key={p} className="p-1 text-center border-r border-slate-200 last:border-r-0">
                                <div className="p-1.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 shadow-2xs hover:bg-blue-100/80 transition-colors">
                                  <div className="font-extrabold text-blue-700 text-[11px] truncate" title={slot.courseCode}>
                                    {slot.courseCode}
                                  </div>
                                  <div className="text-[9px] text-slate-600 truncate mt-0.5" title={slot.roomName}>
                                    {slot.roomName}
                                  </div>
                                  <div className="text-[9px] font-medium text-slate-500 truncate" title={slot.facultyName}>
                                    {slot.facultyName}
                                  </div>
                                </div>
                              </td>
                            );
                          }

                          return (
                            <td key={p} className="p-1 text-center border-r border-slate-200 last:border-r-0 text-slate-300">
                              <span className="text-[10px] font-normal text-slate-300 select-none">Free</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Enrolled Semester Curriculum
                </h3>
                <p className="text-xs text-slate-500">
                  Academic subjects and laboratory modules scheduled for cohort {group.name}.
                </p>
              </div>

              {assignedCourses.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold">No Formally Assigned Courses</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assignedCourses.map(course => {
                    const sessions = groupSlots.filter(s => s.courseCode === course.code).length;
                    return (
                      <div
                        key={course.id || course.code}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-mono font-bold text-xs">
                              {course.code}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {course.credits || 3} Credits
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-2">
                            {course.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {course.department} • {course.type}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            {sessions} sessions/wk
                          </span>
                          <span className="font-semibold text-blue-700">
                            {course.type === 'Lab' ? 'Laboratory' : 'Theory Class'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'faculty' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Faculty Teaching Assignments
                </h3>
                <p className="text-xs text-slate-500">
                  Professors delivering lectures and laboratory sessions to cohort {group.name}.
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
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.from(fac.courses).map(c => (
                            <span key={c} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {fac.sessions} slots/wk
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
                  Classrooms and Laboratories
                </h3>
                <p className="text-xs text-slate-500">
                  Physical venues utilized for cohort {group.name} weekly classes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {assignedRooms.map(r => (
                  <div
                    key={r.room}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <DoorOpen className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{r.room}</h4>
                        <span className="text-[11px] text-slate-500">Scheduled Venue</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {r.count} sessions
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
            <span>CIT Smart Scheduler • Student Academic Registry</span>
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
                onEdit(group);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Cohort
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

