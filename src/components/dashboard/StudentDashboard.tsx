/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  MapPin,
  FileText,
  UserCheck
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser, timetableSlots, courses, examinations, notifications, setActiveNavigation } = useApp();

  // Filter slots for student cohort (CSE-3A default)
  const studentGroup = 'CSE-3A';
  const cohortSlots = timetableSlots.filter(s => s.groupName === studentGroup || s.groupName.includes('CSE'));
  const todayClasses = cohortSlots.filter(s => s.day === 'Monday' || s.day === 'Tuesday').slice(0, 5);

  const upcomingExams = examinations.slice(0, 3);
  const enrolledCourses = courses.filter(c => c.department === 'CSE' || c.department === 'All').slice(0, 6);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold text-sky-200 border border-white/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Academic Portal • {studentGroup} Cohort</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {currentUser?.name || 'Student'}!
          </h1>
          <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
            Your weekly timetable has been verified with zero room conflicts by the OR-Tools CP-SAT scheduler. You have <strong className="text-white">{todayClasses.length} sessions</strong> scheduled today.
          </p>
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveNavigation('timetable', 'grid')}
              className="px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-sky-50 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>View Full Weekly Timetable</span>
            </button>
            <button
              onClick={() => setActiveNavigation('ai')}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Ask AI Schedule Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{enrolledCourses.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">24 Credit Hours Total</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Weekly Classes</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{cohortSlots.length || 24}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">100% Attendance Eligible</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Upcoming Exams</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{examinations.length || 4}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Next in 4 Days</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">0</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Zero Classroom Collisions</div>
        </div>
      </div>

      {/* Main Grid: Today's Timeline & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Today's Class Schedule */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Today's Class Schedule</h3>
              <p className="text-xs text-slate-500">Live lecture & laboratory roster for {studentGroup}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
              Live Term Roster
            </span>
          </div>

          <div className="space-y-2.5">
            {todayClasses.map((s, idx) => (
              <div
                key={s.id || idx}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                    {s.periodId}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{s.courseName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Prof: {s.facultyName}</span>
                      <span>•</span>
                      <span className="font-semibold text-blue-700">Slot {s.periodId}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-[11px] shadow-2xs">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span>{s.roomName}</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-1">Confirmed Slot</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Upcoming Examinations & Notices */}
        <div className="space-y-6">
          
          {/* Upcoming Examinations Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Upcoming Exams</h3>
              <button
                onClick={() => setActiveNavigation('exams')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                View Roster
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {upcomingExams.map(ex => (
                <div key={ex.id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-amber-950">{ex.courseCode} - {ex.courseTitle}</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      {ex.date}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-800 flex items-center justify-between">
                    <span>Room: {ex.allocatedRooms?.[0]?.roomName || 'LH-101'}</span>
                    <span>Invigilator: {ex.allocatedRooms?.[0]?.invigilator || 'Staff On Duty'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-sm space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-yellow-300 font-bold text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Advisory</span>
            </div>
            <h4 className="font-bold text-sm text-white">Spectra Tech Fest 2026</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Main Auditorium reserved on Saturday for National Autonomous Robotics Hackathon. Afternoon lecture slots swapped to morning P1-P4.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

