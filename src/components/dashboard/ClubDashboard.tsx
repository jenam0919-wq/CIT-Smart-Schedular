/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { VenueBookingRequest } from '../../types';

export const ClubDashboard: React.FC = () => {
  const {
    currentUser,
    bookingRequests,
    submitBookingRequest,
    cancelBookingRequest,
    rooms,
    setActiveNavigation
  } = useApp();

  const clubName = currentUser?.clubName || 'CIT Robotics & AI Club';

  // Club's own booking requests
  const myRequests = bookingRequests.filter(
    b => b.clubOrDept.toLowerCase().includes('robotics') || b.requestedBy.toLowerCase().includes('ananya')
  );

  // Submit venue request modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('Autonomous Drone & Computer Vision BootCamp');
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[23]?.id || 'rm-24'); // Seminar Hall A
  const [requestDate, setRequestDate] = useState('2026-11-16');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('17:00');
  const [expectedAttendees, setExpectedAttendees] = useState(120);
  const [purpose, setPurpose] = useState('Hands-on drone assembly with OpenCV tracking module for 2nd and 3rd year students.');
  const [requiresAV, setRequiresAV] = useState(true);
  const [requiresAC, setRequiresAC] = useState(true);
  const [isSpectraWeek, setIsSpectraWeek] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const room = rooms.find(r => r.id === selectedRoomId);

    submitBookingRequest({
      eventTitle,
      requestedBy: currentUser?.name || 'Ananya Dash',
      requesterRole: 'club',
      requesterEmail: currentUser?.email || 'club@cit.edu',
      clubOrDept: clubName,
      roomId: selectedRoomId,
      roomName: room?.name || 'Seminar Hall A',
      date: requestDate,
      startTime,
      endTime,
      periodIds: ['P7', 'P8', 'P9'],
      expectedAttendees,
      purpose,
      requiresAV,
      requiresAC,
      isSpectraWeek,
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setIsSubmitModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Club Hero Banner */}
      <div className="bg-gradient-to-br from-[#101B3C] via-[#14264D] to-[#1E3A5F] rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Student Club Portal
            </span>
            <span className="text-slate-300 text-xs">• Chilika Institute of Technology</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
            {clubName}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Submit venue reservations for hackathons, workshops, and Spectra fest technical exhibits.
          </p>
        </div>

        {/* Quick Action */}
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="relative z-10 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Venue Request</span>
        </button>
      </div>

      {/* Booking Pipeline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Submitted</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{myRequests.length} Events</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Fall 2026 Semester</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border-amber-300/60 bg-amber-50/40">
          <div className="text-[10px] font-bold text-amber-700 uppercase">Under Review</div>
          <div className="text-2xl font-black text-amber-800 mt-1">
            {myRequests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length} Pending
          </div>
          <div className="text-[11px] text-amber-800 mt-0.5">Awaiting Dean/Coordinator</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border-emerald-300/60 bg-emerald-50/40">
          <div className="text-[10px] font-bold text-emerald-700 uppercase">Approved</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            {myRequests.filter(r => r.status === 'Approved').length} Confirmed
          </div>
          <div className="text-[11px] text-emerald-800 mt-0.5">Hall Keys Reserved</div>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Spectra Fest Slot</div>
          <div className="text-2xl font-black text-purple-700 mt-1">RoboWars</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Central Workshop Arena</div>
        </div>
      </div>

      {/* Booking Requests Pipeline Table with Rejection Reasons & Alternatives */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">My Booking Requests & Live Status</h3>
            <p className="text-xs text-slate-500">Track Dean approvals, cancellation status, and alternative options</p>
          </div>
          <button
            onClick={() => setActiveNavigation('venues', 'availability')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Check Live Room Availability →
          </button>
        </div>

        <div className="space-y-4 mt-4">
          {myRequests.map(req => {
            const isPending = req.status === 'Pending' || req.status === 'Under Review';
            const isApproved = req.status === 'Approved';
            const isRejected = req.status === 'Rejected';
            const isCancelled = req.status === 'Cancelled';

            return (
              <div
                key={req.id}
                className={`p-4 rounded-xl border text-xs transition-all ${
                  isApproved
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50/20'
                    : isCancelled
                    ? 'border-slate-200 bg-slate-50/50 opacity-60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{req.eventTitle}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isRejected
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : isCancelled
                            ? 'bg-slate-100 text-slate-600 border-slate-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {req.status}
                      </span>
                      {req.isSpectraWeek && (
                        <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                          Spectra Fest Flagged
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed max-w-2xl">
                      {req.purpose}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                      <span>Venue: <strong className="text-slate-800">{req.roomName}</strong></span>
                      <span>Date: <strong className="text-slate-800">{req.date}</strong></span>
                      <span>Time: <strong className="text-slate-800">{req.startTime} - {req.endTime}</strong></span>
                      <span>Expected: <strong className="text-slate-800">{req.expectedAttendees} Students</strong></span>
                      <span>AV & Sound: <strong className="text-slate-800">{req.requiresAV ? 'Yes' : 'No'}</strong></span>
                    </div>

                    {/* Rejection Reasons & Alternative Suggestions (Section 9) */}
                    {isRejected && (
                      <div className="mt-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Rejection Reason: {req.rejectionReason || 'Venue reserved for regular lecture sessions.'}</span>
                        </div>
                        <div className="text-[11px] text-rose-800 flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>Alternative Venue Suggestion:</strong>{' '}
                            {req.alternativeSuggestion || 'Consider Mini Auditorium or Turing Seminar Hall B which is free after 16:30.'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions: Cancel Booking */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isPending && (
                      <button
                        onClick={() => cancelBookingRequest(req.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alternative Venue Suggestions Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 p-5 rounded-xl text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-teal-300">
              Smart Venue Recommendation Engine
            </span>
          </div>
          <h4 className="font-bold text-sm text-white">Looking for High-Capacity Venues for Workshops?</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Mini Auditorium (250 seats) and Seminar Hall B (140 seats) have 82% free availability on Thursday & Friday afternoons.
          </p>
        </div>
        <button
          onClick={() => setActiveNavigation('venues', 'booking')}
          className="px-3.5 py-2 bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold rounded-lg text-xs shrink-0 transition-colors"
        >
          Explore All 27 Venues →
        </button>
      </div>

      {/* Submit Venue Request Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Submit Campus Venue Reservation</h3>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {submittedSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Venue reservation request successfully queued for Dean & Coordinator review!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Event / Workshop Title
                  </label>
                  <input
                    type="text"
                    required
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    placeholder="e.g., Autonomous Drone & Computer Vision BootCamp"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Preferred Venue</label>
                    <select
                      value={selectedRoomId}
                      onChange={e => setSelectedRoomId(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs"
                    >
                      {rooms.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.type} - {r.capacity} pax)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Event Date</label>
                    <input
                      type="date"
                      required
                      value={requestDate}
                      onChange={e => setRequestDate(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Expected Footfall</label>
                    <input
                      type="number"
                      required
                      value={expectedAttendees}
                      onChange={e => setExpectedAttendees(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Purpose & Activity Plan</label>
                  <textarea
                    rows={2}
                    required
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    placeholder="Brief description of the event, equipment setup, guest speakers..."
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={requiresAV}
                      onChange={e => setRequiresAV(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span>Requires Audio & Projector</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={requiresAC}
                      onChange={e => setRequiresAC(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span>Requires Air Conditioning</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-purple-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={isSpectraWeek}
                      onChange={e => setIsSpectraWeek(e.target.checked)}
                      className="rounded border-purple-300 text-purple-600"
                    />
                    <span>Spectra Fest Priority Request</span>
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg shadow-2xs"
                  >
                    Submit Booking Request
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
