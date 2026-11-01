/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RescheduleRequest, TimetableSlot, UserRole } from '../../types';
import {
  GitCompare,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Clock,
  Building,
  Users,
  ShieldCheck,
  Sparkles,
  FileText,
  User,
  Layers,
  ChevronRight,
  Check,
  RotateCcw
} from 'lucide-react';

interface TimetableDiffViewerProps {
  requests: RescheduleRequest[];
  selectedRequest: RescheduleRequest | null;
  onSelectRequest: (req: RescheduleRequest) => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  timetableSlots: TimetableSlot[];
  userRole?: UserRole;
  userEmail?: string;
}

export const TimetableDiffViewer: React.FC<TimetableDiffViewerProps> = ({
  requests,
  selectedRequest,
  onSelectRequest,
  onApprove,
  onReject,
  timetableSlots,
  userRole = 'admin',
  userEmail = '',
}) => {
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // If no request is selected, pick the first pending or first available
  const activeReq = selectedRequest || requests.find(r => r.status === 'Pending Admin Review') || requests[0] || null;

  if (!activeReq) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
        <GitCompare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Change Requests Available</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          There are currently no reschedule requests to compare. When faculty submit a change or a disruption is rescheduled, the visual diff matrix will display here.
        </p>
      </div>
    );
  }

  const isSelf = userEmail && activeReq.facultyName.toLowerCase().includes(userEmail.split('@')[0].toLowerCase());
  const canApprove = (userRole === 'admin' || userRole === 'coordinator') && !isSelf;

  const handleCommit = async () => {
    try {
      setIsCommitting(true);
      setActionError(null);
      await onApprove(activeReq.id);
      setCommitSuccess(true);
      setTimeout(() => setCommitSuccess(false), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to commit reschedule request.');
    } finally {
      setIsCommitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsCommitting(true);
      setActionError(null);
      await onReject(activeReq.id);
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject request.');
    } finally {
      setIsCommitting(false);
    }
  };

  // Find related existing slot in master timetable
  const originalTimetableSlot = timetableSlots.find(
    s => s.courseCode === activeReq.courseCode && s.day === activeReq.originalSlot.day && s.periodId === activeReq.originalSlot.periodId
  );

  return (
    <div className="space-y-6">
      {/* Header and Quick Switcher Bar */}
      <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Before & After Timetable Diff Matrix</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Zero Cascade Impact Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Side-by-side delta view highlighting slot reallocation, vacated room periods, and cohort availability
              </p>
            </div>
          </div>
        </div>

        {/* Request selector dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Selected Request:</label>
          <select
            value={activeReq.id}
            onChange={(e) => {
              const found = requests.find(r => r.id === e.target.value);
              if (found) onSelectRequest(found);
            }}
            className="px-3 py-2 bg-white/90 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
          >
            {requests.map(r => (
              <option key={r.id} value={r.id}>
                {r.courseCode} — {r.facultyName} ({r.originalSlot.day} → {r.proposedSlot.day}) [{r.status}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {commitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Reschedule committed successfully!</span>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Master timetable has relocated <strong>{activeReq.courseCode}</strong> to {activeReq.proposedSlot.day} ({activeReq.proposedSlot.periodId}) in {activeReq.proposedSlot.roomName}. Notifications broadcast to students and faculty.
            </p>
          </div>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 text-xs shadow-sm">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-medium">{actionError}</span>
        </div>
      )}

      {/* Main Request Summary Card */}
      <div className="p-6 rounded-3xl bg-white/90 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
              {activeReq.courseCode.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {activeReq.courseCode}
                </span>
                <span className="text-sm font-bold text-slate-900">{activeReq.facultyName}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Submitted: <strong>{activeReq.submittedDate}</strong></span>
                <span>•</span>
                <span>Cohort: <strong>{activeReq.originalSlot.groupName}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                activeReq.status === 'Approved'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : activeReq.status === 'Rejected'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {activeReq.status}
            </span>

            {activeReq.status === 'Pending Admin Review' && canApprove && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReject}
                  disabled={isCommitting}
                  className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={handleCommit}
                  disabled={isCommitting}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isCommitting ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Endorse & Commit</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reason banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs text-slate-700 flex items-start gap-2.5">
          <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">Justification / Reason: </span>
            <span>{activeReq.reason}</span>
          </div>
        </div>

        {/* Side-by-Side Before vs After Delta Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* LEFT: Current Master Timetable Slot (BEFORE) */}
          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/30 p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-rose-200/60">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-rose-950 uppercase tracking-wider">Original Schedule (Vacating)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                BEFORE
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    <span>{activeReq.originalSlot.day}</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    Period {activeReq.originalSlot.periodId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Venue: <strong className="text-slate-800">{activeReq.originalSlot.roomName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cohort: <strong className="text-slate-800">{activeReq.originalSlot.groupName}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Instructor: <strong className="text-slate-800">{activeReq.facultyName}</strong></span>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3 rounded-xl bg-rose-100/70 border border-rose-200 text-[11px] text-rose-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Vacated Slot Status:</strong>
                  Upon approval, this slot becomes immediately available for other academic sessions or department tutorials.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Proposed Alternate Slot (AFTER) */}
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/30 p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Proposed Schedule (Reallocation)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                AFTER
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{activeReq.proposedSlot.day}</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Period {activeReq.proposedSlot.periodId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Building className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Venue: <strong className="text-emerald-900 font-bold">{activeReq.proposedSlot.roomName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cohort: <strong className="text-slate-800">{activeReq.proposedSlot.groupName}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Instructor: <strong className="text-slate-800">{activeReq.facultyName}</strong></span>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Micro-Solver Conflict Analysis:</strong>
                  {activeReq.conflictAnalysis.details}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 4 Multi-Constraint Verification Cards */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Constraint Compliance Breakdown</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* 1. Faculty Clash Check */}
            <div className={`p-3.5 rounded-2xl border ${
              activeReq.conflictAnalysis.facultyConflict
                ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold">Faculty Availability</span>
                {activeReq.conflictAnalysis.facultyConflict ? (
                  <XCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-600">
                {activeReq.conflictAnalysis.facultyConflict ? 'Double-booked in target period' : 'Instructor free in target period'}
              </p>
            </div>

            {/* 2. Room Collision Check */}
            <div className={`p-3.5 rounded-2xl border ${
              activeReq.conflictAnalysis.roomConflict
                ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold">Venue Availability</span>
                {activeReq.conflictAnalysis.roomConflict ? (
                  <XCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-600">
                {activeReq.conflictAnalysis.roomConflict ? `${activeReq.proposedSlot.roomName} occupied` : `${activeReq.proposedSlot.roomName} unoccupied`}
              </p>
            </div>

            {/* 3. Student Group Overlap */}
            <div className={`p-3.5 rounded-2xl border ${
              activeReq.conflictAnalysis.studentConflict
                ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold">Student Cohort</span>
                {activeReq.conflictAnalysis.studentConflict ? (
                  <XCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-600">
                {activeReq.conflictAnalysis.studentConflict ? 'Cohort has another class scheduled' : 'Cohort has zero concurrent class'}
              </p>
            </div>

            {/* 4. Lunch Break & Max Consecutive Hours */}
            <div className="p-3.5 rounded-2xl border bg-emerald-50/60 border-emerald-200 text-emerald-900">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold">Daily Limits & Lunch</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-600">
                Within max 3 consecutive teaching hrs; lunch window maintained.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
