/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Course, TimetableSlot } from '../../types';
import {
  BookOpen,
  Layers,
  FlaskConical,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  Building
} from 'lucide-react';

interface CourseDashboardProps {
  courses: Course[];
  timetableSlots: TimetableSlot[];
}

export const CourseDashboard: React.FC<CourseDashboardProps> = ({
  courses,
  timetableSlots,
}) => {
  const metrics = useMemo(() => {
    const totalCourses = courses.length;

    // Course codes scheduled in timetable
    const activeCourseCodes = new Set(timetableSlots.map(s => s.courseCode?.toUpperCase()));
    const activeCourses = courses.filter(c => activeCourseCodes.has(c.code?.toUpperCase())).length;

    // Theory & Lab categories
    const theoryCourses = courses.filter(c => c.type === 'Lecture').length;
    const labCourses = courses.filter(c => c.type === 'Lab').length;

    // Total sessions
    const totalSessions = timetableSlots.filter(s => s.courseCode).length;

    // Unassigned courses with 0 scheduled sessions
    const unassignedCourses = courses.filter(c => !activeCourseCodes.has(c.code?.toUpperCase())).length;

    return {
      totalCourses,
      activeCourses,
      theoryCourses,
      labCourses,
      totalSessions,
      unassignedCourses,
    };
  }, [courses, timetableSlots]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* Total Courses */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Total Courses</span>
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {metrics.totalCourses}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Syllabus Catalog</p>
      </div>

      {/* Active Scheduled Courses */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Active Courses</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-600 tracking-tight">
          {metrics.activeCourses}
        </div>
        <p className="text-[10px] text-emerald-600/80 mt-1 font-medium">Timetable Running</p>
      </div>

      {/* Theory Courses */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Theory Classes</span>
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black text-purple-700 tracking-tight">
          {metrics.theoryCourses}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Lecture Curricula</p>
      </div>

      {/* Laboratory Courses */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Lab Practicals</span>
          <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
            <FlaskConical className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black text-cyan-700 tracking-tight">
          {metrics.labCourses}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Hands-on Workshops</p>
      </div>

      {/* Total Sessions */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Weekly Sessions</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <CalendarCheck className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {metrics.totalSessions}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Class Contact Periods</p>
      </div>

      {/* Unassigned Courses */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Unscheduled</span>
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className={`text-2xl font-black tracking-tight ${metrics.unassignedCourses > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
          {metrics.unassignedCourses}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Pending Solver Mapping</p>
      </div>
    </div>
  );
};

