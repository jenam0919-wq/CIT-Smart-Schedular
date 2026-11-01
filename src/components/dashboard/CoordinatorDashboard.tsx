/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Users,
  CalendarDays,
  FileCheck,
  Send,
  AlertTriangle,
  ChevronRight,
  FlaskConical,
  Laptop
} from 'lucide-react';

export const CoordinatorDashboard: React.FC = () => {
  const {
    currentUser,
    setActiveNavigation,
    rooms,
    faculty,
    studentGroups,
    bookingRequests,
    rescheduleRequests,
    approveBookingRequest,
    rejectBookingRequest,
    approveRescheduleRequest,
    rejectRescheduleRequest
  } = useApp();

  const dept = currentUser?.department || 'Computer Science & Engineering';

  // Coordinator specific lab booking requests (CS labs)
  const labBookings = bookingRequests.filter(
    b => b.roomName.toLowerCase().includes('lab') || b.clubOrDept.includes('Science') || b.clubOrDept.includes('Robotics')
  );

  const deptReschedules = rescheduleRequests;

  const [activeTab, setActiveTab] = useState<'overview' | 'labs' | 'swaps' | 'events'>('overview');

  // Event booking form for department
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('Distinguished Research Colloquium');
  const [selectedLab, setSelectedLab] = useState('CS-Lab-1 (AI/ML)');
  const [eventDate, setEventDate] = useState('2026-11-12');
  const [eventSubmitted, setEventSubmitted] = useState(false);

  const handleBookDeptEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setEventSubmitted(true);
    setTimeout(() => {
      setEventSubmitted(false);
      setIsEventModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Coordinator Hero Banner */}
      <div className="bg-gradient-to-br from-[#101B3C] via-[#14264D] to-[#1E3A5F] rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Department Timetable Coordinator
            </span>
            <span className="text-slate-300 text-xs">• Chilika Institute of Technology</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
            {dept} Operations Desk
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Managing 4 high-performance computing laboratories, 22 departmental professors, and 7 student batches.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Book Dept Seminar / Lab</span>
          </button>
          <button
            onClick={() => setActiveNavigation('timetable', 'weekly')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 backdrop-blur-md transition-colors cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-teal-300" />
            <span>Sync Dept Timetable</span>
          </button>
        </div>
      </div>

      {/* Department Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Department Labs</div>
          <div className="text-2xl font-black text-slate-900 mt-1">4 Labs</div>
          <div className="text-[11px] text-slate-500 mt-0.5">220 Systems Total</div>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Department Faculty</div>
          <div className="text-2xl font-black text-slate-900 mt-1">22 Members</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Avg Load: 15.4 hrs/wk</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Active Batches</div>
          <div className="text-2xl font-black text-slate-900 mt-1">7 Batches</div>
          <div className="text-[11px] text-slate-500 mt-0.5">CSE 1st to 4th Year</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-300 bg-amber-50/20 shadow-2xs">
          <div className="text-[10px] font-bold text-amber-700 uppercase">Pending Approvals</div>
          <div className="text-2xl font-black text-amber-800 mt-1">{labBookings.length} Requests</div>
          <div className="text-[11px] text-amber-800 mt-0.5">Lab & Swap Approvals</div>
        </div>
      </div>

      {/* Main Coordinator Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Lab Booking Approvals & Change Requests */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Lab Booking Approvals */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Computing Laboratory Reservation Requests ({labBookings.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Student project work, club bootcamps, and external certification drives
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                CSE Departmental Jurisdiction
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {labBookings.slice(0, 4).map(req => (
                <div key={req.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{req.eventTitle}</span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                        {req.roomName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{req.purpose}</p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-3">
                      <span>Requester: <strong className="text-slate-600">{req.requestedBy} ({req.clubOrDept})</strong></span>
                      <span>Date: <strong className="text-slate-600">{req.date}</strong></span>
                      <span>Expected: <strong className="text-slate-600">{req.expectedAttendees} pax</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {req.status === 'Approved' ? (
                      <span className="px-2 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded">
                        Approved
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => approveBookingRequest(req.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-2xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => rejectBookingRequest(req.id, 'Conflict with regular practical hours', 'Try Saturday 09:00 - 13:00')}
                          className="px-2 py-1 text-xs font-semibold bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-md border border-slate-200 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Faculty Change Requests */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Department Timetable Change Requests ({deptReschedules.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Peer faculty adjustments before endorsement to Academic Dean
                </p>
              </div>
              <button
                onClick={() => setActiveNavigation('rescheduling', 'requests')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Review All →
              </button>
            </div>

            <div className="space-y-3 mt-3">
              {deptReschedules.map(req => (
                <div key={req.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900">
                      {req.facultyName} • <span className="font-mono text-indigo-600">{req.courseCode}</span>
                    </div>
                    <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                      {req.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">ORIGINAL SLOT</span>
                      {req.originalSlot.day} {req.originalSlot.periodId} ({req.originalSlot.roomName})
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">PROPOSED TARGET</span>
                      {req.proposedSlot.day} {req.proposedSlot.periodId} ({req.proposedSlot.roomName})
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2">
                    <strong>Reason:</strong> {req.reason}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{req.conflictAnalysis.details}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => approveRescheduleRequest(req.id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-2xs"
                      >
                        Endorse Swap
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Lab Utilization & Quick Links */}
        <div className="space-y-6">
          
          {/* Department Laboratories Status */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">CSE Laboratories Status</h3>
              <p className="text-xs text-slate-500">Live capacity & equipment readiness</p>
            </div>

            <div className="space-y-3 mt-3 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">CS-Lab-1 (AI & ML)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">60 GPU Workstations • Turing Floor 1</div>
                <div className="mt-1 text-[10px] text-slate-400">Current: CS391 Algorithms Lab</div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">CS-Lab-2 (Systems)</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500" title="Scheduled Maintenance Wed" />
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">60 Systems • Turing Floor 1</div>
                <div className="mt-1 text-[10px] text-amber-700 font-medium">Power audit scheduled Wednesday</div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">CS-Lab-3 (Cloud & IoT)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Available" />
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">50 Workstations • Turing Floor 2</div>
                <div className="mt-1 text-[10px] text-emerald-700 font-medium">Free for booking P6-P9</div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">CS-Lab-4 (Data Eng)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">50 Workstations • Turing Floor 2</div>
                <div className="mt-1 text-[10px] text-slate-400">Current: Data Structures Lab</div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Coordinator Tools
            </span>
            <button
              onClick={() => setActiveNavigation('timetable', 'weekly')}
              className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-800 flex items-center justify-between"
            >
              <span>Weekly Department Master Grid</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => setActiveNavigation('analytics', 'workload')}
              className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-800 flex items-center justify-between"
            >
              <span>Faculty Workload Compliance</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

        </div>

      </div>

      {/* Department Event Booking Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Book Department Event / Seminar</h3>
              </div>
              <button onClick={() => setIsEventModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {eventSubmitted ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Department venue reservation recorded in central calendar!</span>
              </div>
            ) : (
              <form onSubmit={handleBookDeptEvent} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Event / Colloquium Title</label>
                  <input
                    type="text"
                    required
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Facility</label>
                  <select
                    value={selectedLab}
                    onChange={e => setSelectedLab(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs"
                  >
                    <option value="CS-Lab-1 (AI/ML)">CS-Lab-1 (AI/ML) - 60 Capacity</option>
                    <option value="CS-Lab-3 (Cloud & IoT)">CS-Lab-3 (Cloud & IoT) - 50 Capacity</option>
                    <option value="Seminar Hall B">Seminar Hall B - 140 Capacity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-2xs"
                  >
                    Confirm Reservation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
