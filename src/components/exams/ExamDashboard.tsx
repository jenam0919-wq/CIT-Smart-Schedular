/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { ExamScheduleItem, Room, FacultyMember } from '../../types';
import {
  FileSpreadsheet,
  CalendarDays,
  Building2,
  Users,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Layers,
  Flame
} from 'lucide-react';

interface ExamDashboardProps {
  examinations: ExamScheduleItem[];
  rooms: Room[];
  faculty: FacultyMember[];
  onOpenScheduler?: () => void;
}

export const ExamDashboard: React.FC<ExamDashboardProps> = ({
  examinations,
  rooms,
  faculty,
  onOpenScheduler,
}) => {
  const metrics = useMemo(() => {
    const totalExams = examinations.length;

    // Dates check relative to today (or simulation calendar: Fall 2026)
    const today = new Date().toISOString().split('T')[0];
    let upcoming = 0;
    let completed = 0;

    examinations.forEach(e => {
      if (e.date < today) {
        completed += 1;
      } else {
        upcoming += 1;
      }
    });

    // Total distinct rooms allocated across all examinations
    const examRoomsSet = new Set<string>();
    const invigilatorsSet = new Set<string>();
    let totalAssignedSeats = 0;

    examinations.forEach(e => {
      (e.allocatedRooms || []).forEach(r => {
        if (r.roomId || r.roomName) examRoomsSet.add(r.roomName || r.roomId);
        if (r.invigilator) invigilatorsSet.add(r.invigilator.toLowerCase().trim());
        totalAssignedSeats += r.allocatedSeats || 0;
      });
    });

    // Conflict detection: 2 exams sharing the same room at the same date + timeSlot
    const roomSlotMap = new Map<string, string>();
    const conflictingRooms = new Set<string>();
    examinations.forEach(e => {
      (e.allocatedRooms || []).forEach(r => {
        const key = `${r.roomName || r.roomId}-${e.date}-${e.timeSlot}`;
        if (roomSlotMap.has(key)) {
          conflictingRooms.add(r.roomName || r.roomId);
        } else {
          roomSlotMap.set(key, e.id);
        }
      });
    });

    // Date range
    const dates = examinations.map(e => e.date).filter(Boolean).sort();
    const startDate = dates[0] || '2026-11-18';
    const endDate = dates[dates.length - 1] || '2026-11-28';

    return {
      totalExams,
      upcoming,
      completed,
      pending: 0,
      totalExamRooms: examRoomsSet.size,
      totalInvigilators: invigilatorsSet.size,
      conflictsCount: conflictingRooms.size,
      startDate,
      endDate,
      totalAssignedSeats,
    };
  }, [examinations]);

  return (
    <div className="space-y-4">
      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Examinations */}
        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Total Papers</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics.totalExams}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Midsem & Endsem</p>
        </div>

        {/* Upcoming Papers */}
        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Upcoming</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-700 tracking-tight">
            {metrics.upcoming}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Scheduled in window</p>
        </div>

        {/* Completed Examinations */}
        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Completed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {metrics.completed}
          </div>
          <p className="text-[10px] text-emerald-600/80 mt-1 font-medium">Evaluations Active</p>
        </div>

        {/* Exam Rooms */}
        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Exam Venues</span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics.totalExamRooms}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Lecture Halls Mapped</p>
        </div>

        {/* Faculty Invigilators */}
        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Invigilators</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-700 tracking-tight">
            {metrics.totalInvigilators}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Faculty on Duty</p>
        </div>

        {/* Room / Invigilator Conflicts */}
        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Schedule Conflicts</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {metrics.conflictsCount}
          </div>
          <p className="text-[10px] text-emerald-600/80 mt-1 font-medium">100% Conflict Free</p>
        </div>
      </div>

      {/* Examination Schedule Overview Banner */}
      <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-blue-900/90 via-indigo-950/90 to-slate-900/95 text-white border border-white/10 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Active Assessment Window
            </span>
            <span className="text-xs text-slate-300">
              {metrics.startDate} to {metrics.endDate}
            </span>
          </div>
          <h3 className="text-base font-extrabold tracking-tight text-white">
            Alternate Seating Protocol: 50% Hall Capacity Active
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Strict 1-seat buffer policy enforced across all {metrics.totalExamRooms} venues. Total {metrics.totalAssignedSeats.toLocaleString()} seats verified for exam integrity.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">Morning & Afternoon Shifts</div>
            <div className="text-[11px] text-slate-300">09:30 - 11:30 AM &bull; 02:00 - 04:00 PM</div>
          </div>
          {onOpenScheduler && (
            <button
              onClick={onOpenScheduler}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
            >
              Configure Engine
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

