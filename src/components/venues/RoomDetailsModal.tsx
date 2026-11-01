/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Room, TimetableSlot, VenueBookingRequest } from '../../types';
import {
  X,
  Building2,
  Users,
  Wind,
  Tv,
  Volume2,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
  Wrench,
  Sparkles,
  MapPin,
  Laptop
} from 'lucide-react';

interface RoomDetailsModalProps {
  room: Room | null;
  timetableSlots: TimetableSlot[];
  bookingRequests: VenueBookingRequest[];
  onClose: () => void;
  onReserve: (room: Room) => void;
}

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  room,
  timetableSlots,
  bookingRequests,
  onClose,
  onReserve,
}) => {
  if (!room) return null;

  // Filter timetable slots assigned to this room
  const assignedSlots = timetableSlots.filter(
    s => s.roomName === room.name || s.roomId === room.id
  );

  // Filter approved or upcoming bookings for this room
  const roomBookings = bookingRequests.filter(
    b => (b.roomName === room.name || b.roomId === room.id) && b.status === 'Approved'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1026]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl glass-card rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150 transition-all">
        
        {/* Header */}
        <div className="relative px-6 py-5 bg-[#101B3C] text-white flex items-center justify-between border-b border-white/10 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 border border-white/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {room.name}
                </h3>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 uppercase tracking-wider">
                  {room.type}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>{room.block} • Floor {room.floor} • Chilika Campus</span>
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
        <div className="p-6 space-y-5 text-xs overflow-y-auto">
          
          {/* Capacity and Utilization Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-100/70 backdrop-blur-md rounded-2xl border border-white/60">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Regular Capacity</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">{room.capacity} seats</div>
              <span className="text-[10px] text-slate-500 font-medium">Standard Lecture</span>
            </div>

            <div className="p-3.5 bg-slate-100/70 backdrop-blur-md rounded-2xl border border-white/60">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Exam Capacity</span>
              <div className="text-xl font-black text-amber-700 font-mono mt-1">{room.examCapacity} seats</div>
              <span className="text-[10px] text-slate-500 font-medium">1-Seat Spacing</span>
            </div>

            <div className="p-3.5 bg-slate-100/70 backdrop-blur-md rounded-2xl border border-white/60">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Live Status</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${room.isAvailableNow ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className={`text-xs font-black ${room.isAvailableNow ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {room.isAvailableNow ? 'Available Now' : 'Occupied (Lecture)'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Automated Sensor Sync</span>
            </div>
          </div>

          {/* Installed Facilities & Smart Amenities */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Installed Facilities & Amenities</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                room.hasAirConditioning
                  ? 'bg-sky-50/80 border-sky-200 text-sky-900'
                  : 'bg-slate-50/60 border-slate-200 text-slate-400'
              }`}>
                <Wind className={`w-4 h-4 ${room.hasAirConditioning ? 'text-sky-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-extrabold text-xs">Central AC</div>
                  <div className="text-[10px] font-medium">{room.hasAirConditioning ? 'Climate Controlled' : 'Natural Airflow'}</div>
                </div>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                room.hasProjector
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                  : 'bg-slate-50/60 border-slate-200 text-slate-400'
              }`}>
                <Tv className={`w-4 h-4 ${room.hasProjector ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-extrabold text-xs">HD Display</div>
                  <div className="text-[10px] font-medium">{room.hasProjector ? 'Ceiling Mount + Screen' : 'Standard Board'}</div>
                </div>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                room.hasAudioSystem
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50/60 border-slate-200 text-slate-400'
              }`}>
                <Volume2 className={`w-4 h-4 ${room.hasAudioSystem ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-extrabold text-xs">PA Sound System</div>
                  <div className="text-[10px] font-medium">{room.hasAudioSystem ? 'Wireless Mic + Speakers' : 'Acoustic Only'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Academic Courses from Master Timetable */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Assigned Master Timetable Slots ({assignedSlots.length})</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-semibold">Weekly CP-SAT Synchronized</span>
            </div>

            {assignedSlots.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 text-center text-slate-500 text-xs">
                No regular weekly academic lectures assigned to this venue. Available for booking requests.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {assignedSlots.slice(0, 8).map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs space-y-1 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {slot.courseCode}
                      </span>
                      <span className="font-bold text-[10px] text-slate-500 font-mono">
                        {slot.day} • {slot.periodId}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs line-clamp-1">
                      {slot.courseName}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>{slot.facultyName}</span>
                      <span className="font-semibold text-slate-700">{slot.groupName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Event Bookings */}
          {roomBookings.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>Approved Campus Event Bookings ({roomBookings.length})</span>
              </h4>

              <div className="space-y-2">
                {roomBookings.map(b => (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl bg-purple-50/50 border border-purple-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-purple-950">{b.eventTitle}</div>
                      <div className="text-[11px] text-purple-700 font-medium mt-0.5">
                        {b.clubOrDept} • {b.date} ({b.startTime} - {b.endTime})
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-300">
                      Approved
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance & Compliance Status */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-extrabold text-emerald-950 text-xs">
                  Facility Safety & Maintenance Certified
                </div>
                <div className="text-emerald-700 text-[10px] font-medium">
                  Fire evacuation compliant • Cleanliness audit passed • AV inspected
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg">
              Inspected
            </span>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-100/80 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            Close Details
          </button>

          <button
            type="button"
            onClick={() => {
              onReserve(room);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Reserve {room.name}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

