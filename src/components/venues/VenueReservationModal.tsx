/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Room, TimetableSlot } from '../../types';
import {
  X,
  Building,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';

interface VenueReservationModalProps {
  room: Room | null;
  timetableSlots: TimetableSlot[];
  onClose: () => void;
  onSubmit: (data: {
    eventTitle: string;
    date: string;
    startTime: string;
    endTime: string;
    periodIds: string[];
    expectedAttendees: number;
    purpose: string;
    requiresAV: boolean;
    requiresAC: boolean;
  }) => Promise<void>;
}

export const VenueReservationModal: React.FC<VenueReservationModalProps> = ({
  room,
  timetableSlots,
  onClose,
  onSubmit,
}) => {
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-11-10');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [periodIds, setPeriodIds] = useState<string[]>(['P7', 'P8']);
  const [attendees, setAttendees] = useState(room ? Math.min(room.capacity, 80) : 60);
  const [purpose, setPurpose] = useState('');
  const [requiresAV, setRequiresAV] = useState(room?.hasAudioSystem ?? false);
  const [requiresAC, setRequiresAC] = useState(room?.hasAirConditioning ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!room) return null;

  // Check if there are scheduled academic classes during requested periods
  const clashCount = timetableSlots.filter(
    s => (s.roomName === room.name || s.roomId === room.id) && periodIds.includes(s.periodId)
  ).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        eventTitle,
        date: eventDate,
        startTime,
        endTime,
        periodIds,
        expectedAttendees: attendees,
        purpose,
        requiresAV,
        requiresAC,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1026]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-card rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 transition-all">
        
        {/* Header */}
        <div className="relative px-6 py-5 bg-[#101B3C] text-white flex items-center justify-between border-b border-white/10 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 border border-white/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Reserve {room.name}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                {room.type} • Capacity: {room.capacity} seats • {room.block}
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

        {/* Content Body / Form */}
        <div className="p-6 text-xs">
          {success ? (
            <div className="p-8 text-center bg-emerald-50/70 rounded-2xl border border-emerald-300 space-y-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-black text-emerald-950 text-base">Reservation Request Submitted!</h4>
              <p className="text-xs text-emerald-700 font-medium">
                Your venue booking for {room.name} has been routed to the Administrative Approval Centre.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Event / Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  placeholder="e.g. Department Board of Studies Meeting"
                  className="w-full p-2.5 bg-white/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full p-2 bg-white/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden cursor-pointer shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Expected Attendance *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={room.capacity}
                    value={attendees}
                    onChange={e => setAttendees(Number(e.target.value))}
                    className="w-full p-2 bg-white/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden shadow-2xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Max: {room.capacity} seats</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full p-2 bg-white/80 border border-slate-200/80 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden shadow-2xs cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full p-2 bg-white/80 border border-slate-200/80 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden shadow-2xs cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Purpose / Agenda Notes
                </label>
                <textarea
                  rows={2}
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder="State the academic purpose, guest attendees, or session equipment requirements..."
                  className="w-full p-2.5 bg-white/80 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-hidden shadow-2xs"
                />
              </div>

              {/* Amenities Checkboxes */}
              <div className="p-3 rounded-2xl bg-slate-100/70 border border-white/60 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Equipment Requirements
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={requiresAC}
                      onChange={e => setRequiresAC(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Central AC Required</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={requiresAV}
                      onChange={e => setRequiresAV(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Projector & Audio</span>
                  </label>
                </div>
              </div>

              {/* Clash Detection Note */}
              {clashCount > 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2 text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Note: {clashCount} academic class slot is scheduled in this venue. An administrator will review slot swapping.</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-900 flex items-center gap-2 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Venue is completely free during this period on the academic timetable.</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Reservation'}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

