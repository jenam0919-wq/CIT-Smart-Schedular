/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Building,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  ChevronRight,
  FileCheck,
  DoorOpen
} from 'lucide-react';

export const WardenDashboard: React.FC = () => {
  const { currentUser, bookingRequests, rooms, setActiveNavigation } = useApp();

  const residentialVenues = rooms.filter(r => 
    r.type === 'Auditorium' || r.type === 'Seminar Hall' || r.name.includes('Hall') || r.block.includes('Hostel') || r.capacity >= 80
  );

  const pendingApprovals = bookingRequests.filter(b => b.status === 'Pending');
  const approvedBookings = bookingRequests.filter(b => b.status === 'Approved').slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Warden Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-rose-200 border border-white/15">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>Hostel & Residential Life Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Campus Life & Hall Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Logged in as <strong className="text-white">{currentUser?.name}</strong>. Monitor residential student venue requests, auditorium bookings, evening workshops, and curfew adherence.
          </p>
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveNavigation('venues', 'calendar')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Audit Venue Occupancy</span>
            </button>
            <button
              onClick={() => setActiveNavigation('venues', 'requests')}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-rose-300" />
              <span>Review Pending Requests ({pendingApprovals.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Common Venues</span>
            <Building className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{residentialVenues.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Auditoriums & Halls</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Pending Bookings</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{pendingApprovals.length}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Awaiting Warden Review</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Approved Events</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{approvedBookings.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Active This Month</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Curfew Protocol</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">21:30</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Standard Campus Cutoff</div>
        </div>
      </div>

      {/* Main Grid: Pending Student Requests & Residential Venues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Pending Requests */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Venue Bookings Requiring Warden Clearance</h3>
              <p className="text-xs text-slate-500">Student club & hostel evening activity requests</p>
            </div>
            <button
              onClick={() => setActiveNavigation('venues', 'requests')}
              className="text-xs font-bold text-rose-600 hover:text-rose-800"
            >
              Manage All
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingApprovals.slice(0, 5).map(req => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-rose-200 bg-slate-50/50 hover:bg-rose-50/20 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{req.eventTitle}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Requester: <strong className="text-slate-700">{req.requestedBy}</strong> • Venue: <strong className="text-rose-700">{req.roomName}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Date: {req.date} ({req.startTime} - {req.endTime}) • Expected: {req.expectedAttendees} Attendees
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                    Pending
                  </span>
                  <button
                    onClick={() => setActiveNavigation('venues', 'requests')}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px]"
                    title="View Request Details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Residential Common Venues */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Residential Venues Directory</h3>
          <div className="space-y-2 text-xs">
            {residentialVenues.slice(0, 6).map(r => (
              <div key={r.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{r.name}</div>
                  <div className="text-[11px] text-slate-500">{r.block} • Cap: {r.capacity}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

