/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TIME_PERIODS } from '../../data/mockData';
import { DayOfWeek, TimetableSlot } from '../../types';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Send,
  CalendarX,
  Building,
  UserCheck,
  ChevronRight,
  BookOpen
} from 'lucide-react';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const FacultyDashboard: React.FC = () => {
  const {
    currentUser,
    timetableSlots,
    submitRescheduleRequest,
    setActiveNavigation,
    notifications
  } = useApp();

  // Filter slots for logged-in faculty (Prof. Arvind Tripathy or current user)
  const facultyName = currentUser?.name || 'Prof. Arvind Tripathy';
  const mySlots = timetableSlots.filter(s => s.facultyName === facultyName);

  // Availability matrix state (5 days x 9 periods)
  // Initially all true except Monday P1 (preferred unavailable)
  const [availability, setAvailability] = useState<Record<string, boolean>>({
    'Monday-P1': false,
    'Friday-P9': false,
  });

  const [isUnavailabilityModalOpen, setIsUnavailabilityModalOpen] = useState(false);
  const [unavailDay, setUnavailDay] = useState<DayOfWeek>('Monday');
  const [unavailPeriod, setUnavailPeriod] = useState('P1');
  const [unavailReason, setUnavailReason] = useState('Research Paper Committee meeting');
  const [unavailSuccess, setUnavailSuccess] = useState(false);

  // Request change state
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [selectedSlotForChange, setSelectedSlotForChange] = useState<TimetableSlot | null>(mySlots[0] || null);
  const [targetDay, setTargetDay] = useState<DayOfWeek>('Wednesday');
  const [targetPeriod, setTargetPeriod] = useState('P5');
  const [changeReason, setChangeReason] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  const toggleSlotAvailability = (day: string, periodId: string) => {
    const key = `${day}-${periodId}`;
    setAvailability(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleMarkUnavailability = (e: React.FormEvent) => {
    e.preventDefault();
    const key = `${unavailDay}-${unavailPeriod}`;
    setAvailability(prev => ({ ...prev, [key]: false }));
    setUnavailSuccess(true);
    setTimeout(() => {
      setUnavailSuccess(false);
      setIsUnavailabilityModalOpen(false);
    }, 1200);
  };

  const handleScheduleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotForChange) return;

    submitRescheduleRequest({
      facultyName: facultyName,
      courseCode: selectedSlotForChange.courseCode,
      originalSlot: {
        day: selectedSlotForChange.day,
        periodId: selectedSlotForChange.periodId,
        roomName: selectedSlotForChange.roomName,
        groupName: selectedSlotForChange.groupName,
      },
      proposedSlot: {
        day: targetDay,
        periodId: targetPeriod,
        roomName: selectedSlotForChange.roomName,
        groupName: selectedSlotForChange.groupName,
      },
      reason: changeReason || 'Pedagogical requirement / academic travel adjustment',
      conflictAnalysis: {
        hasConflicts: false,
        studentConflict: false,
        facultyConflict: false,
        roomConflict: false,
        details: 'Initial check: Room and student cohort appear free in proposed slot. Awaiting Admin commit.'
      }
    });

    setChangeSuccess(true);
    setTimeout(() => {
      setChangeSuccess(false);
      setIsChangeModalOpen(false);
      setChangeReason('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Faculty Hero Banner */}
      <div className="bg-gradient-to-br from-[#101B3C] via-[#14264D] to-[#1E3A5F] rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Faculty Workspace
            </span>
            <span className="text-slate-300 text-xs">• Dept of Computer Science & Engineering</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
            Welcome back, {facultyName}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            You have <strong className="text-white">{mySlots.length} weekly teaching sessions</strong> assigned across CSE-3A and CSE-4A batches.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsUnavailabilityModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 backdrop-blur-md transition-colors cursor-pointer"
          >
            <CalendarX className="w-4 h-4 text-rose-300" />
            <span>Mark Unavailability</span>
          </button>
          <button
            onClick={() => {
              if (mySlots.length > 0) setSelectedSlotForChange(mySlots[0]);
              setIsChangeModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Request Schedule Change</span>
          </button>
        </div>
      </div>

      {/* Grid: Weekly Classes & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): My Weekly Timetable */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">My Weekly Timetable</h2>
                <p className="text-xs text-slate-500">Your scheduled lectures and laboratory sessions</p>
              </div>
              <span className="text-xs font-bold text-sky-700 bg-sky-500/15 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                16 Workload Hours / Week
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {mySlots.map(slot => (
                <div key={slot.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 px-1.5 py-0.5 bg-indigo-50 rounded border border-indigo-200">
                        {slot.courseCode}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">{slot.courseName}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                        {slot.sessionType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span>Day: <strong className="text-slate-700">{slot.day}</strong></span>
                      <span>Period: <strong className="text-slate-700">{slot.periodId} (08:00 - 08:50)</strong></span>
                      <span>Venue: <strong className="text-slate-700">{slot.roomName}</strong></span>
                      <span>Cohort: <strong className="text-slate-700">{slot.groupName}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSlotForChange(slot);
                      setIsChangeModalOpen(true);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 shrink-0 px-2 py-1 bg-indigo-50/50 hover:bg-indigo-50 rounded"
                  >
                    Swap Slot
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* My Availability Matrix */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">My Availability Matrix</h2>
                <p className="text-xs text-slate-500">
                  Click any period box to toggle preferred availability for the CP-SAT solver
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span className="text-slate-600">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-500" />
                  <span className="text-slate-600">Unavailable / Off</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-center border-collapse min-w-[600px] text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                    <th className="p-2 border border-slate-200 text-left">Day</th>
                    {TIME_PERIODS.map(p => (
                      <th key={p.id} className="p-1.5 border border-slate-200">
                        <div>{p.id}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map(day => (
                    <tr key={day}>
                      <td className="p-2 border border-slate-200 font-semibold text-slate-800 text-left text-[11px]">
                        {day}
                      </td>
                      {TIME_PERIODS.map(p => {
                        const key = `${day}-${p.id}`;
                        const isAvailable = availability[key] !== false;
                        return (
                          <td key={p.id} className="p-1 border border-slate-200">
                            <button
                              onClick={() => toggleSlotAvailability(day, p.id)}
                              className={`w-full py-1.5 rounded text-[10px] font-semibold transition-all ${
                                isAvailable
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              }`}
                              title={`${day} ${p.id}: Click to toggle`}
                            >
                              {isAvailable ? '✓' : '✕'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              * Preferences are incorporated as soft constraints in OR-Tools CP-SAT scheduler.
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): AI Assistant & Faculty Notifications */}
        <div className="space-y-6">
          
          {/* AI Scheduling Assistant Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-xl text-white shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-teal-400/20 text-teal-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">AI Scheduling Assistant</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Need a makeup lecture for CS301 or want to find a mutually free 2-hour window? Ask in natural language.
            </p>

            <button
              onClick={() => setActiveNavigation('ai', 'faculty')}
              className="w-full py-2 px-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Launch Faculty AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Faculty Notifications */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Notifications & Deadlines</h3>
              <span className="text-[10px] text-slate-400">Term VII</span>
            </div>

            <div className="space-y-3 mt-3 text-xs">
              <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100">
                <div className="font-semibold text-indigo-900">Midsem Exam Invigilation</div>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Assigned to CS301 (Hall LH-201) on Wednesday, Nov 18 from 09:30 – 11:30 AM.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100">
                <div className="font-semibold text-amber-900">Syllabus Coverage Audit</div>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  14 of 36 lectures completed. Ahead of department average by 2 sessions.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-800">Turing CS-Lab-2 Power Notice</div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Power maintenance on Wednesday; lab shifted to CS-Lab-3 during P6-P7.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Mark Unavailability Modal */}
      {isUnavailabilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarX className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Mark Unavailability</h3>
              </div>
              <button
                onClick={() => setIsUnavailabilityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {unavailSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Unavailability logged and solver constraints updated!</span>
              </div>
            ) : (
              <form onSubmit={handleMarkUnavailability} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Day</label>
                  <select
                    value={unavailDay}
                    onChange={e => setUnavailDay(e.target.value as DayOfWeek)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs"
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Time Period</label>
                  <select
                    value={unavailPeriod}
                    onChange={e => setUnavailPeriod(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs"
                  >
                    {TIME_PERIODS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.id} ({p.startTime} - {p.endTime})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason</label>
                  <input
                    type="text"
                    required
                    value={unavailReason}
                    onChange={e => setUnavailReason(e.target.value)}
                    placeholder="e.g., Medical leave, Research conference travel"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUnavailabilityModalOpen(false)}
                    className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg"
                  >
                    Confirm Unavailability
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Schedule Change Request Modal */}
      {isChangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Request Schedule Change</h3>
              </div>
              <button
                onClick={() => setIsChangeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {changeSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Change request submitted to Dean & Coordinator review queue!</span>
              </div>
            ) : (
              <form onSubmit={handleScheduleChange} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Select Lecture Session to Swap
                  </label>
                  <select
                    value={selectedSlotForChange?.id}
                    onChange={e => {
                      const found = mySlots.find(s => s.id === e.target.value);
                      if (found) setSelectedSlotForChange(found);
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs"
                  >
                    {mySlots.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.courseCode} - {s.courseName} ({s.day} {s.periodId} in {s.roomName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Preferred Target Day
                    </label>
                    <select
                      value={targetDay}
                      onChange={e => setTargetDay(e.target.value as DayOfWeek)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs"
                    >
                      {DAYS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Preferred Target Period
                    </label>
                    <select
                      value={targetPeriod}
                      onChange={e => setTargetPeriod(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs"
                    >
                      {TIME_PERIODS.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.id} ({p.startTime} - {p.endTime})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Justification / Reason
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={changeReason}
                    onChange={e => setChangeReason(e.target.value)}
                    placeholder="Provide details for Academic Dean & Coordinator review..."
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChangeModalOpen(false)}
                    className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs"
                  >
                    Submit Request
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
