/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExamScheduleItem } from '../../types';
import {
  X,
  FileSpreadsheet,
  Calendar,
  Clock,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  Edit,
  Trash2,
  Sparkles,
  Printer
} from 'lucide-react';

interface ExamDetailsModalProps {
  exam: ExamScheduleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (exam: ExamScheduleItem) => void;
  onDelete: (id: string) => void;
}

export const ExamDetailsModal: React.FC<ExamDetailsModalProps> = ({
  exam,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !exam) return null;

  const isMorning = exam.timeSlot.includes('09:') || exam.timeSlot.includes('AM');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl flex flex-col rounded-3xl bg-white/95 border border-white/80 shadow-2xl shadow-blue-950/20 backdrop-blur-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                {exam.examType} Examination
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{exam.courseCode}:</span> {exam.courseTitle}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              {exam.date} ({exam.day})
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {exam.timeSlot}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              50% Alternate Seating Buffer Active
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500">Target Cohort</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{exam.studentGroup}</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500">Enrolled Headcount</span>
              <div className="text-sm font-bold text-emerald-700 mt-0.5">{exam.enrolledStudents} Students</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500">Shift</span>
              <div className="text-sm font-bold text-blue-700 mt-0.5">
                {isMorning ? 'Morning Session' : 'Afternoon Session'}
              </div>
            </div>
          </div>

          {/* Allocated Halls & Invigilators */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Allocated Halls & Invigilators
            </h4>

            <div className="space-y-2">
              {(exam.allocatedRooms || []).map((room, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">{room.roomName}</div>
                      <div className="text-xs text-slate-500">Hall Allocation: {room.allocatedSeats} Students</div>
                    </div>
                  </div>

                  <div className="text-right sm:text-right">
                    <span className="text-[11px] font-semibold text-slate-500 block">Invigilator:</span>
                    <span className="font-bold text-xs text-emerald-700">{room.invigilator}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Seating Slip
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onDelete(exam.id);
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Paper
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(exam);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Examination
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

