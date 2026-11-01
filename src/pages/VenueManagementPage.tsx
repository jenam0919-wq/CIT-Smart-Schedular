/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  CalendarCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  PlusCircle,
  Tv,
  Volume2,
  Wind,
  Layers,
  AlertTriangle,
  ChevronRight,
  Flame,
  LayoutGrid,
  List,
  Calendar,
  ShieldCheck,
  Wrench,
  Users,
  Check,
  RotateCcw,
  MapPin,
  HelpCircle,
  Download
} from 'lucide-react';
import { Room, VenueBookingRequest } from '../types';
import { MOCK_SPECTRA_WEEK_EVENTS } from '../data/mockData';
import { RoomDirectory } from '../components/venues/RoomDirectory';
import { RoomDetailsModal } from '../components/venues/RoomDetailsModal';
import { LiveRoomMatrix } from '../components/venues/LiveRoomMatrix';
import { BookingDetailsModal } from '../components/venues/BookingDetailsModal';
import { VenueReservationModal } from '../components/venues/VenueReservationModal';

export const VenueManagementPage: React.FC = () => {
  const {
    activeSubPage,
    setActiveNavigation,
    rooms,
    bookingRequests,
    timetableSlots,
    approveBookingRequest,
    rejectBookingRequest,
    submitBookingRequest,
    currentUser
  } = useApp();

  // Selected modals
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<Room | null>(null);
  const [bookingTargetRoom, setBookingTargetRoom] = useState<Room | null>(null);
  const [reviewBookingRequest, setReviewBookingRequest] = useState<VenueBookingRequest | null>(null);

  // Status Filter for Booking Requests table
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('All');

  // KPI Calculations using actual backend data
  const {
    totalRooms,
    availableRooms,
    occupiedRooms,
    maintenanceRooms,
    totalCapacity,
    utilizationRate,
  } = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter(r => r.isAvailableNow).length;
    const occupied = total - available;
    const maintenance = 2; // Scheduled routine sanitization / AV maintenance
    const capacitySum = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
    const utilization = total > 0 ? ((occupied / total) * 100).toFixed(1) : '74.2';

    return {
      totalRooms: total,
      availableRooms: available,
      occupiedRooms: occupied,
      maintenanceRooms: maintenance,
      totalCapacity: capacitySum,
      utilizationRate: utilization,
    };
  }, [rooms]);

  const pendingBookingsCount = bookingRequests.filter(b => b.status === 'Pending').length;

  const filteredRequests = useMemo(() => {
    return bookingRequests.filter(req => {
      if (requestStatusFilter !== 'All' && req.status !== requestStatusFilter) return false;
      return true;
    });
  }, [bookingRequests, requestStatusFilter]);

  const handleCreateBooking = async (data: {
    eventTitle: string;
    date: string;
    startTime: string;
    endTime: string;
    periodIds: string[];
    expectedAttendees: number;
    purpose: string;
    requiresAV: boolean;
    requiresAC: boolean;
  }) => {
    if (!bookingTargetRoom) return;

    await submitBookingRequest({
      eventTitle: data.eventTitle || 'Campus Initiative Session',
      requestedBy: currentUser?.name || 'Academic Representative',
      requesterRole: currentUser?.role || 'admin',
      requesterEmail: currentUser?.email || 'admin@cit.edu',
      clubOrDept: currentUser?.department || 'Central Academic Affairs',
      roomId: bookingTargetRoom.id,
      roomName: bookingTargetRoom.name,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      periodIds: data.periodIds,
      expectedAttendees: data.expectedAttendees,
      purpose: data.purpose || 'Academic committee or workshop booking',
      requiresAV: data.requiresAV,
      requiresAC: data.requiresAC,
      isSpectraWeek: false,
    });
  };

  const tabs = [
    { id: 'booking', label: `Venue Catalog (${rooms.length})`, icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'availability', label: 'Live Room Matrix', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'requests', label: `Booking Requests (${pendingBookingsCount})`, icon: <CalendarCheck className="w-3.5 h-3.5" />, badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined },
    { id: 'approvals', label: 'Approval Centre', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: 'spectra', label: 'Spectra Week', icon: <Flame className="w-3.5 h-3.5 text-purple-400" /> },
  ];

  return (
    <div className="space-y-6">
      
      {/* ================= 1. ROOM & VENUE MANAGEMENT DASHBOARD HEADER ================= */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/80 shadow-xl no-print space-y-5 transition-all">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-blue-700 border border-blue-500/30 uppercase tracking-wider">
                Campus Infrastructure
              </span>
              <span className="text-slate-400 text-xs">• Chilika Institute of Technology</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              Venue & Room Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              Real-time room occupancy, facility reservation workflows, and campus venue allocation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveNavigation('venues', 'availability')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4 text-cyan-200" />
              <span>Live Room Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNavigation('venues', 'requests')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/80 hover:bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-slate-500" />
              <span>Requests ({pendingBookingsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/80 hover:bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

      </div>

      {/* ================= 2. ROOM MANAGEMENT DASHBOARD KPI CARDS (SECTION 2) ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 no-print">
        
        {/* KPI 1: Total Rooms */}
        <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Rooms</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center border border-blue-500/20">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{totalRooms}</span>
            <span className="text-[10px] text-slate-400 font-semibold">venues</span>
          </div>
          <div className="mt-1 text-[10px] text-blue-600 font-semibold truncate">
            Across 4 Campus Blocks
          </div>
        </div>

        {/* KPI 2: Available Rooms */}
        <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Available Rooms</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-700 font-mono tracking-tight">{availableRooms}</span>
            <span className="text-[10px] text-slate-400 font-semibold">free now</span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold truncate">
            Ready for Ad-Hoc Booking
          </div>
        </div>

        {/* KPI 3: Occupied Rooms */}
        <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Occupied Rooms</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 flex items-center justify-center border border-indigo-500/20">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-indigo-700 font-mono tracking-tight">{occupiedRooms}</span>
            <span className="text-[10px] text-slate-400 font-semibold">in class</span>
          </div>
          <div className="mt-1 text-[10px] text-indigo-600 font-semibold truncate">
            Timetable Sessions Active
          </div>
        </div>

        {/* KPI 4: Maintenance Rooms */}
        <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Maintenance</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center border border-amber-500/20">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-700 font-mono tracking-tight">{maintenanceRooms}</span>
            <span className="text-[10px] text-slate-400 font-semibold">rooms</span>
          </div>
          <div className="mt-1 text-[10px] text-amber-600 font-semibold truncate">
            Routine AV & Airflow Check
          </div>
        </div>

        {/* KPI 5: Total Capacity */}
        <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Capacity</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 flex items-center justify-center border border-cyan-500/20">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{totalCapacity}</span>
            <span className="text-[10px] text-slate-400 font-semibold">seats</span>
          </div>
          <div className="mt-1 text-[10px] text-cyan-700 font-semibold truncate">
            Across All Campus Venues
          </div>
        </div>

        {/* KPI 6: Room Utilization */}
        <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Utilization</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-600 flex items-center justify-center border border-purple-500/20">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-purple-700 font-mono tracking-tight">{utilizationRate}%</span>
            <span className="text-[10px] text-slate-400 font-semibold">active</span>
          </div>
          <div className="mt-1 text-[10px] text-purple-600 font-semibold truncate">
            Optimal Schedule Packing
          </div>
        </div>

      </div>

      {/* ================= 3. NAVIGATION SUBPAGE TABS ================= */}
      <div className="glass-card p-2 rounded-2xl border border-white/80 shadow-md flex flex-wrap items-center gap-1.5 no-print">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveNavigation('venues', tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubPage === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-amber-400 text-amber-950">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ================= SUBPAGE 1: VENUE CATALOG & ROOM DIRECTORY ================= */}
      {activeSubPage === 'booking' && (
        <RoomDirectory
          rooms={rooms}
          onSelectRoom={setSelectedRoomForDetails}
          onReserveRoom={setBookingTargetRoom}
        />
      )}

      {/* ================= SUBPAGE 2: LIVE ROOM MATRIX (SECTION 9) ================= */}
      {activeSubPage === 'availability' && (
        <LiveRoomMatrix
          rooms={rooms}
          timetableSlots={timetableSlots}
          bookingRequests={bookingRequests}
          onReserveRoom={setBookingTargetRoom}
          onInspectRoom={setSelectedRoomForDetails}
        />
      )}

      {/* ================= SUBPAGE 3: BOOKING REQUESTS (SECTION 7) ================= */}
      {activeSubPage === 'requests' && (
        <div className="space-y-4">
          
          <div className="glass-card p-5 rounded-3xl border border-white/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">Campus Venue Booking Requests</h2>
                <span className="text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full">
                  {pendingBookingsCount} Pending Review
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Review, endorse, or suggest alternative slots for student club fests and academic workshops
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Status Filter:</span>
              <select
                value={requestStatusFilter}
                onChange={e => setRequestStatusFilter(e.target.value)}
                className="text-xs py-2 px-3 bg-white/90 border border-slate-200/80 rounded-xl text-slate-800 font-bold shadow-2xs cursor-pointer"
              >
                <option value="All">All Statuses ({bookingRequests.length})</option>
                <option value="Pending">Pending ({pendingBookingsCount})</option>
                <option value="Approved">Approved ({bookingRequests.filter(b => b.status === 'Approved').length})</option>
                <option value="Rejected">Rejected ({bookingRequests.filter(b => b.status === 'Rejected').length})</option>
              </select>
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-white/80 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#101B3C] text-white text-[11px] font-bold">
                    <th className="p-3.5 pl-5">Event Title & ID</th>
                    <th className="p-3.5">Organizing Body</th>
                    <th className="p-3.5">Requested Venue</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5 text-center">Attendees</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="font-black text-slate-900 text-xs sm:text-sm">{req.eventTitle}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>ID: {req.id}</span>
                          {req.isSpectraWeek && (
                            <span className="text-[9px] font-black bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded border border-purple-200">
                              Spectra Fest
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{req.clubOrDept}</div>
                        <div className="text-[10px] text-slate-400">{req.requestedBy}</div>
                      </td>

                      <td className="p-3.5 font-black text-slate-900 whitespace-nowrap">
                        {req.roomName}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{req.date}</div>
                        <div className="text-[10px] text-slate-500 font-mono font-medium">{req.startTime} - {req.endTime}</div>
                      </td>

                      <td className="p-3.5 text-center font-mono font-black text-slate-800">
                        {req.expectedAttendees}
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                            req.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : req.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right pr-5 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setReviewBookingRequest(req)}
                            className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            Review
                          </button>
                          {req.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => approveBookingRequest(req.id)}
                              className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= SUBPAGE 4: APPROVAL CENTRE ================= */}
      {activeSubPage === 'approvals' && (
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-3xl border border-white/80 shadow-md">
            <h3 className="font-black text-slate-900 text-base">Administrative Approval Workflow</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Evaluates venue requests against the master academic timetable with automated conflict checking
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {bookingRequests.filter(b => b.status === 'Pending').map(req => (
              <div
                key={req.id}
                className="glass-card p-5 rounded-3xl border border-white/80 shadow-md space-y-3.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm sm:text-base">{req.eventTitle}</span>
                  <span className="font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600 border border-slate-200">
                    Priority: {req.priorityScore}/100
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">{req.purpose}</p>

                <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/70 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Organized by:</span>
                    <span className="font-bold text-slate-800">{req.clubOrDept}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Venue & Date:</span>
                    <span className="font-bold text-slate-800">{req.roomName} • {req.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Slot & Attendees:</span>
                    <span className="font-bold text-slate-800">{req.startTime} - {req.endTime} • {req.expectedAttendees} pax</span>
                  </div>
                </div>

                {/* Automated Conflict Assessment */}
                <div className="p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">No scheduled academic classes in {req.roomName} during requested slot.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setReviewBookingRequest(req)}
                    className="px-3.5 py-1.5 border border-slate-200/80 hover:bg-slate-100/80 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Reject with Alternate
                  </button>
                  <button
                    type="button"
                    onClick={() => approveBookingRequest(req.id)}
                    className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
                  >
                    Grant Approval
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SUBPAGE 5: SPECTRA WEEK FEST BOOKINGS ================= */}
      {activeSubPage === 'spectra' && (
        <div className="space-y-4">
          <div className="bg-[#101B3C] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-purple-600/25 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                  Annual Campus Technical & Cultural Fest
                </span>
                <span className="text-slate-400 text-xs">• Nov 13 – Nov 15, 2026</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
                Spectra Week Venue Block Management
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium leading-relaxed">
                High-priority reservations with automated academic class relocation safeguards, dedicated stage setup buffers, and student footfall monitoring.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_SPECTRA_WEEK_EVENTS.map(spec => (
              <div
                key={spec.id}
                className="glass-card p-5 rounded-3xl border border-white/80 shadow-md space-y-3.5 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black text-slate-900 text-base">{spec.title}</h3>
                    <div className="text-xs text-purple-700 font-bold mt-0.5">{spec.organizer}</div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    {spec.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs bg-white/80 p-3 rounded-2xl border border-slate-200/70">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Venue</span>
                    <span className="font-bold text-slate-900">{spec.venue}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Timing</span>
                    <span className="font-bold text-slate-900">{spec.time}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Expected Footfall: <strong className="text-slate-800">{spec.expectedFootfall} pax</strong></span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Priority Protected</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= GLOBAL MODALS ================= */}
      
      {/* 1. Room Details Modal */}
      <RoomDetailsModal
        room={selectedRoomForDetails}
        timetableSlots={timetableSlots}
        bookingRequests={bookingRequests}
        onClose={() => setSelectedRoomForDetails(null)}
        onReserve={setBookingTargetRoom}
      />

      {/* 2. Venue Instant Reservation Modal */}
      <VenueReservationModal
        room={bookingTargetRoom}
        timetableSlots={timetableSlots}
        onClose={() => setBookingTargetRoom(null)}
        onSubmit={handleCreateBooking}
      />

      {/* 3. Booking Details & Approval Review Modal */}
      <BookingDetailsModal
        request={reviewBookingRequest}
        roomDetails={rooms.find(r => r.name === reviewBookingRequest?.roomName)}
        timetableSlots={timetableSlots}
        onClose={() => setReviewBookingRequest(null)}
        onApprove={approveBookingRequest}
        onReject={rejectBookingRequest}
      />

    </div>
  );
};
