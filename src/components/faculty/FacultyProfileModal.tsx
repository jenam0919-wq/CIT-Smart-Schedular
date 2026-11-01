/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FacultyMember, TimetableSlot, Course } from '../../types';
import {
  X,
  GraduationCap,
  Mail,
  BookOpen,
  Calendar,
  Clock,
  Building,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Edit,
  ExternalLink,
  Layers,
  Sparkles,
  UserCheck,
  Users
} from 'lucide-react';

interface FacultyProfileModalProps {
  faculty: FacultyMember | null;
  isOpen: boolean;
  onClose: () => void;
  timetableSlots: TimetableSlot[];
  courses: Course[];
  onEdit: (faculty: FacultyMember) => void;
  onManageAvailability?: (faculty: FacultyMember) => void;
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

export const FacultyProfileModal: React.FC<FacultyProfileModalProps> = ({
  faculty,
  isOpen,
  onClose,
  timetableSlots,
  courses,
  onEdit,
  onManageAvailability,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'courses' | 'compliance'>('schedule');

  // Filter slots for this faculty member
  const facultySlots = useMemo(() => {
    if (!faculty) return [];
    return timetableSlots.filter(
      s => s.facultyId === faculty.id || s.facultyName.toLowerCase() === faculty.name.toLowerCase()
    );
  }, [faculty, timetableSlots]);

  // Distinct courses taught by this faculty member
  const assignedCourses = useMemo(() => {
    if (!faculty) return [];
    const courseCodes = Array.from(new Set(facultySlots.map(s => s.courseCode)));
    return courses.filter(c => courseCodes.includes(c.code));
  }, [faculty, facultySlots, courses]);

  // Workload calculations
  const workloadRatio = faculty ? (faculty.weeklyWorkloadHours / faculty.maxWorkloadHours) * 100 : 0;
  const isOverloaded = workloadRatio > 100;
  const isNearLimit = workloadRatio >= 85 && !isOverloaded;

  // Timetable grid mapping: day -> periodId -> slot
  const scheduleMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, TimetableSlot>> = {};
    DAYS.forEach(day => {
      matrix[day] = {};
    });

    facultySlots.forEach(slot => {
      if (matrix[slot.day]) {
        matrix[slot.day][slot.periodId] = slot;
      }
    });

    return matrix;
  }, [facultySlots]);

  // Unavailability lookup
  const unavailabilityMap = useMemo(() => {
    const map = new Set<string>();
    if (faculty?.unavailability) {
      faculty.unavailability.forEach(u => {
        map.add(`${u.day}-${u.periodId}`);
      });
    }
    return map;
  }, [faculty]);

  if (!isOpen || !faculty) return null;

  // Department colors
  const getDeptColor = (dept: string) => {
    if (dept.includes('Computer')) return 'from-blue-600 to-indigo-600 text-white';
    if (dept.includes('Electronics')) return 'from-purple-600 to-indigo-600 text-white';
    if (dept.includes('Electrical')) return 'from-amber-500 to-orange-600 text-white';
    if (dept.includes('Mechanical')) return 'from-teal-600 to-emerald-600 text-white';
    return 'from-sky-600 to-blue-700 text-white';
  };

  const initials = faculty.name
    .split(' ')
    .filter(n => !n.startsWith('Dr.') && !n.startsWith('Prof.'))
    .slice(0, 2)
    .map(n => n[0])
    .join('') || faculty.name.slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white/95 border border-white/80 shadow-2xl shadow-blue-950/20 backdrop-blur-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Gradient Ribbon & Header */}
        <div className="relative p-6 pb-5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white overflow-hidden">
          {/* Subtle glowing orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative flex flex-col md:flex-row md:items-center gap-5">
            {/* Initials Avatar */}
            <div className={`w-18 h-18 rounded-2xl bg-gradient-to-br ${getDeptColor(faculty.department)} shadow-xl flex items-center justify-center text-2xl font-black shrink-0 border border-white/20`}>
              {initials}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  {faculty.department}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/15">
                  ID: {faculty.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  Active Faculty
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white truncate">
                {faculty.name}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                  {faculty.designation}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  {faculty.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  Chilika Institute of Technology
                </span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 pt-2 md:pt-0">
              <button
                onClick={() => {
                  onClose();
                  onEdit(faculty);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Weekly Workload</span>
                <Clock className="w-3 h-3 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {faculty.weeklyWorkloadHours} <span className="text-xs font-normal text-slate-300">/ {faculty.maxWorkloadHours} hrs</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Scheduled Sessions</span>
                <Calendar className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {facultySlots.length} <span className="text-xs font-normal text-slate-300">sessions/wk</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Assigned Courses</span>
                <BookOpen className="w-3 h-3 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {assignedCourses.length} <span className="text-xs font-normal text-slate-300">subjects</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Compliance</span>
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-sm font-bold mt-1.5 flex items-center gap-1.5">
                {isOverloaded ? (
                  <span className="text-rose-400 flex items-center gap-1 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" /> Overloaded
                  </span>
                ) : isNearLimit ? (
                  <span className="text-amber-400 flex items-center gap-1 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" /> High Load
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> AI Compliant
                  </span>
                )}
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
            Weekly Schedule ({facultySlots.length})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'courses'
                ? 'text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Assigned Courses ({assignedCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'compliance'
                ? 'text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Workload & Preferences
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Teaching Schedule (Monday – Saturday)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live timetable slots allocated to {faculty.name} by CP-SAT solver.
                  </p>
                </div>
                {onManageAvailability && (
                  <button
                    onClick={() => {
                      onClose();
                      onManageAvailability(faculty);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Open Availability Matrix
                  </button>
                )}
              </div>

              {/* Weekly Mini Matrix */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
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
                          const isUnavailable = unavailabilityMap.has(`${day}-${p}`);

                          if (isLunch) {
                            return (
                              <td key={p} className="p-1.5 text-center bg-slate-100/50 border-r border-slate-200 last:border-r-0 text-slate-400 text-[10px] font-medium">
                                Lunch Break
                              </td>
                            );
                          }

                          if (isUnavailable) {
                            return (
                              <td key={p} className="p-1 text-center bg-rose-50/70 border-r border-rose-100 last:border-r-0">
                                <div className="p-1 rounded-lg bg-rose-100 border border-rose-200 text-rose-800 text-[10px] font-semibold">
                                  Unavailable
                                </div>
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
                                  <div className="text-[9px] font-medium text-slate-500 truncate" title={slot.groupName}>
                                    {slot.groupName}
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
                  Assigned Academic Curriculum
                </h3>
                <p className="text-xs text-slate-500">
                  Courses instructed by {faculty.name} for the active academic semester.
                </p>
              </div>

              {assignedCourses.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold">No Courses Formally Mapped</p>
                  <p className="text-xs text-slate-400 mt-1">
                    No active course syllabus has been specifically assigned to this instructor.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assignedCourses.map(course => {
                    const sessionCount = facultySlots.filter(s => s.courseCode === course.code).length;
                    return (
                      <div
                        key={course.id || course.code}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-mono font-bold text-xs">
                              {course.code}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {course.credits || 4} Credits
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-2">
                            {course.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {course.department}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            {sessionCount} sessions/week
                          </span>
                          <span className="flex items-center gap-1 font-medium text-blue-700">
                            <Users className="w-3.5 h-3.5" />
                            {course.type === 'Lab' ? 'Laboratory' : 'Lecture Hall'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              {/* Compliance Overview */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200/70 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Statutory Teaching Hours Compliance
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      UGC and AICTE regulations mandate an 18-hour contact limit per week for university faculty.
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    isOverloaded
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : isNearLimit
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {workloadRatio.toFixed(0)}% Workload Ratio
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Assigned Contact Hours: {faculty.weeklyWorkloadHours} hrs</span>
                    <span>Max Limit: {faculty.maxWorkloadHours} hrs/wk</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverloaded
                          ? 'bg-rose-500'
                          : isNearLimit
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(workloadRatio, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Preferences and Constraints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Daily Scheduling Limits
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Max Daily Contact Hours:</span>
                      <span className="font-bold text-slate-900">4 Hours / Day</span>
                    </li>
                    <li className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Consecutive Class Cap:</span>
                      <span className="font-bold text-slate-900">2 Periods Max</span>
                    </li>
                    <li className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Preferred Slot Band:</span>
                      <span className="font-bold text-blue-700">Morning Slots (P1 - P4)</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Unavailability & Exemptions
                  </h4>
                  {faculty.unavailability && faculty.unavailability.length > 0 ? (
                    <div className="space-y-2">
                      {faculty.unavailability.map((u, i) => (
                        <div key={i} className="p-2 rounded-xl bg-white border border-amber-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{u.day} ({u.periodId})</span>
                            <p className="text-[11px] text-slate-500">{u.reason}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Excused
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No active leaves or unavailability exemptions recorded.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>CIT Smart Scheduler • Academic Faculty Registry</span>
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
                onEdit(faculty);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Faculty Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

