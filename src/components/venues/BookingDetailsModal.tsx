/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VenueBookingRequest, Room, TimetableSlot } from '../../types';
import {
  X,
  CalendarCheck,
  Building,
  User,
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface BookingDetailsModalProps {
  request: VenueBookingRequest | null;
  roomDetails?: Room;
  timetableSlots: TimetableSlot[];
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string, suggestion?: string) => Promise<void>;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  request,
  roomDetails,
  timetableSlots,
  onClose,
  onApprove,
  onReject,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [altSuggestion, setAltSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!request) return null;

  // Check automated conflict: is there an academic lecture in this room during the requested period?
  const hasAcademicClash = timetableSlots.some(
    s =>
      (s.roomName === request.roomName || s.roomId === request.roomId) &&
      request.periodIds?.includes(s.periodId)
  );

  const capacityExceeded = roomDetails && request.expectedAttendees > roomDetails.capacity;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(request.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject(
        request.id,
        rejectionReason || 'Venue reserved for primary academic commitments.',
        altSuggestion || 'Consider Seminar Hall B or booking after 16:30.'
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1026]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl glass-card rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150 transition-all">
        
        {/* Header */}
        <div className="relative px-6 py-5 bg-[#101B3C] text-white flex items-center justify-between border-b border-white/10 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 border border-white/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Booking Request Review
                </h3>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  request.status === 'Approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : request.status === 'Rejected'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                }`}>
                  {request.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Request ID: {request.id} • Priority Score: {request.priorityScore}/100
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto">
          
          {/* Event Title & Purpose */}
          <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Event Information</div>
            <h4 className="text-base font-black text-slate-900 tracking-tight">{request.eventTitle}</h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {request.purpose || 'Campus academic initiative or student activity session.'}
            </p>
          </div>

          {/* Organizer & Venue Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            <div className="p-3.5 rounded-2xl bg-slate-100/70 backdrop-blur-md border border-white/60 space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-blue-500" />
                <span>Applicant Information</span>
              </div>
              <div className="font-extrabold text-slate-900 text-xs">{request.requestedBy}</div>
              <div className="text-[11px] text-slate-500 font-medium">{request.clubOrDept}</div>
              <div className="text-[10px] text-slate-400 font-mono">{request.requesterEmail}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100/70 backdrop-blur-md border border-white/60 space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Building className="w-3 h-3 text-emerald-500" />
                <span>Requested Facility</span>
              </div>
              <div className="font-extrabold text-slate-900 text-xs">{request.roomName}</div>
              <div className="text-[11px] text-slate-500 font-medium">
                Capacity: {roomDetails?.capacity || 90} seats • {roomDetails?.block || 'Academic Complex'}
              </div>
              <div className="text-[10px] text-slate-500">
                Expected Attendees: <strong>{request.expectedAttendees} pax</strong>
              </div>
            </div>

          </div>

          {/* Timing & Schedule Slots */}
          <div className="p-3.5 rounded-2xl bg-slate-100/70 backdrop-blur-md border border-white/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Scheduled Window</div>
                <div className="font-black text-slate-900 text-xs sm:text-sm">
                  {request.date} • {request.startTime} – {request.endTime}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Periods: {(request.periodIds || ['P7', 'P8']).join(', ')}
                </div>
              </div>
            </div>
            {request.isSpectraWeek && (
              <span className="text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-1 rounded-xl">
                Spectra Fest Priority
              </span>
            )}
          </div>

          {/* Automated Clash & Capacity Assessment Banner */}
          {hasAcademicClash ? (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1 text-xs">
              <div className="flex items-center gap-2 font-black">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Timetable Conflict Detected</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-snug">
                An official academic class is already scheduled in {request.roomName} during periods {(request.periodIds || []).join(', ')}. Recommend an alternate venue or slot.
              </p>
            </div>
          ) : capacityExceeded ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 space-y-1 text-xs">
              <div className="flex items-center gap-2 font-black">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Capacity Warning</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-snug">
                Expected attendees ({request.expectedAttendees}) exceeds room seating capacity ({roomDetails?.capacity} seats). Consider a larger venue.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-black text-emerald-950">Academic Timetable Conflict-Free</div>
                  <div className="text-[10px] text-emerald-700 font-medium">
                    Zero scheduled curriculum clashes. Venue is completely vacant for reservation.
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                Verified Clean
              </span>
            </div>
          )}

          {/* Rejection Form (Revealed when rejecting) */}
          {showRejectForm && (
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3 animate-in fade-in duration-150">
              <h5 className="font-bold text-rose-950 text-xs">Specify Rejection Justification</h5>
              <div>
                <label className="block text-[10px] font-bold text-rose-900 uppercase mb-1">Reason</label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. Venue required for mandatory departmental mid-term evaluation..."
                  className="w-full p-2 bg-white border border-rose-300 rounded-xl text-xs text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-rose-900 uppercase mb-1">Recommended Alternative</label>
                <input
                  type="text"
                  value={altSuggestion}
                  onChange={e => setAltSuggestion(e.target.value)}
                  placeholder="e.g. Suggest Seminar Hall B or Mini Auditorium after 16:30"
                  className="w-full p-2 bg-white border border-rose-300 rounded-xl text-xs text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-100/80 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>

          {request.status === 'Pending' && (
            <div className="flex items-center gap-2">
              {!showRejectForm ? (
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Reject...
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Confirm Rejection
                </button>
              )}

              <button
                type="button"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Grant Approval</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

