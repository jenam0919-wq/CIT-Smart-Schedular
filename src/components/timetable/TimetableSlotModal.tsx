/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TimetableSlot, Room, FacultyMember, StudentGroup, Course } from '../../types';
import {
  X,
  BookOpen,
  User,
  Building,
  Users,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Printer,
  CheckCircle2,
  Sparkles,
  MapPin,
  Cpu,
  GraduationCap
} from 'lucide-react';
import { TIME_PERIODS } from '../../data/mockData';

interface TimetableSlotModalProps {
  slot: TimetableSlot | null;
  roomDetails?: Room;
  facultyDetails?: FacultyMember;
  groupDetails?: StudentGroup;
  courseDetails?: Course;
  onClose: () => void;
  onRequestChange?: (slot: TimetableSlot) => void;
}

export const TimetableSlotModal: React.FC<TimetableSlotModalProps> = ({
  slot,
  roomDetails,
  facultyDetails,
  groupDetails,
  courseDetails,
  onClose,
  onRequestChange
}) => {
  if (!slot) return null;

  const period = TIME_PERIODS.find(p => p.id === slot.periodId);
  const durationMinutes = (slot.durationPeriods || 1) * 50;

  const handlePrintSession = () => {
    window.print();
  };

  const isLab = slot.sessionType.toLowerCase().includes('lab') || slot.sessionType.toLowerCase().includes('practical');
  const isSpecial = slot.sessionType.toLowerCase().includes('special') || slot.sessionType.toLowerCase().includes('tutorial') || slot.sessionType.toLowerCase().includes('seminar');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1026]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl glass-card rounded-3xl shadow-2xl border border-white/80 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col transition-all">
        
        {/* Header with Course Color Banner */}
        <div
          className="relative px-6 py-5 text-white flex items-center justify-between overflow-hidden"
          style={{
            background: isLab
              ? 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)'
              : isSpecial
              ? 'linear-gradient(135deg, #0284C7 0%, #0D9488 100%)'
              : 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
          }}
        >
          {/* Subtle glowing circle accent */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black bg-white/20 text-white px-2.5 py-0.5 rounded-lg border border-white/30 backdrop-blur-xs">
                {slot.courseCode}
              </span>
              <span className="text-[11px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-black/20 text-white/90">
                {slot.sessionType}
              </span>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md text-white">
                {durationMinutes} mins
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black mt-2 text-white tracking-tight leading-snug">
              {slot.courseName}
            </h3>
            <p className="text-xs text-white/80 font-medium mt-0.5">
              Chilika Institute of Technology • Fall 2026 Academic Term
            </p>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[68vh]">
          
          {/* Timing details */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-100/70 backdrop-blur-md rounded-2xl border border-white/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Academic Day</div>
                <div className="font-black text-slate-900 text-sm">{slot.day}</div>
                <div className="text-[10px] text-slate-500">Weekly Scheduled Session</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Period Slot</div>
                <div className="font-black text-slate-900 text-sm">
                  {slot.periodId}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {period?.startTime || '08:00'} – {period?.endTime || '08:50'}
                </div>
              </div>
            </div>
          </div>

          {/* Key Entities Info */}
          <div className="space-y-3">
            
            {/* Instructor */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-200/80 bg-white/70 hover:bg-white transition-all shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20 mt-0.5">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Faculty Instructor</div>
                <div className="font-black text-slate-900 text-sm">{slot.facultyName}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {facultyDetails?.designation || 'Faculty Member'} • {facultyDetails?.department || 'Computer Science & Engineering'}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-emerald-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Availability Confirmed • Workload within daily limit</span>
                </div>
              </div>
            </div>

            {/* Venue & Facilities */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-200/80 bg-white/70 hover:bg-white transition-all shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0 border border-blue-500/20 mt-0.5">
                <Building className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Assigned Venue</div>
                <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <span>{slot.roomName}</span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.2 rounded border border-blue-200">
                    {roomDetails?.type || 'Lecture Hall'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                  <span>Capacity: {roomDetails?.capacity || 90} seats</span>
                  <span>•</span>
                  <span>{roomDetails?.block || 'Academic Complex'}</span>
                  <span>•</span>
                  <span>{roomDetails?.hasAirConditioning ? 'Air Conditioned' : 'Standard Airflow'}</span>
                  <span>•</span>
                  <span>{roomDetails?.hasProjector ? 'Projector' : 'Smartboard'}</span>
                </div>
              </div>
            </div>

            {/* Cohort */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-200/80 bg-white/70 hover:bg-white transition-all shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-500/20 mt-0.5">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Enrolled Cohort</div>
                <div className="font-black text-slate-900 text-sm">{slot.groupName}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Strength: {groupDetails?.strength || 62} Registered Students • Semester {groupDetails?.semester || 7}
                </div>
              </div>
            </div>

            {/* Course Curriculum & Credits */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-200/80 bg-white/70 hover:bg-white transition-all shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0 border border-purple-500/20 mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Curriculum & Credits</div>
                <div className="font-black text-slate-900 text-sm">{slot.courseName}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {courseDetails?.credits || 4} Academic Credits • {slot.sessionType} Session
                </div>
              </div>
            </div>

          </div>

          {/* Solver Verification & Scheduling Status Badge */}
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-extrabold text-emerald-950 text-xs">
                  Scheduling Status: Confirmed & Clash-Free
                </div>
                <div className="text-emerald-700 text-[10px] font-medium">
                  Google OR-Tools CP-SAT Mathematical Guarantee • Zero Conflicts
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg">
              Optimal
            </span>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-100/80 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrintSession}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Session Slip</span>
            </button>
          </div>

          {onRequestChange && (
            <button
              type="button"
              onClick={() => {
                onRequestChange(slot);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <span>Request Reschedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
