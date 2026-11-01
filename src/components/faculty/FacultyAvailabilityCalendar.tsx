/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FacultyMember, TimetableSlot } from '../../types';
import {
  Calendar,
  Clock,
  Filter,
  UserCheck,
  AlertCircle,
  PlusCircle,
  X,
  CheckCircle2,
  CalendarCheck,
  Building,
  Loader2,
  Info,
  ChevronDown
} from 'lucide-react';

interface FacultyAvailabilityCalendarProps {
  facultyList: FacultyMember[];
  timetableSlots: TimetableSlot[];
  initialFacultyId?: string;
  onMarkUnavailability: (data: {
    faculty_id: string;
    day: string;
    period_id: string;
    reason: string;
  }) => Promise<void>;
}

const PERIODS = [
  { id: 'P1', time: '09:00 - 09:50' },
  { id: 'P2', time: '10:00 - 10:50' },
  { id: 'P3', time: '11:00 - 11:50' },
  { id: 'P4', time: '12:00 - 12:50' },
  { id: 'P5', time: '13:00 - 13:50', isLunch: true },
  { id: 'P6', time: '14:00 - 14:50' },
  { id: 'P7', time: '15:00 - 15:50' },
  { id: 'P8', time: '16:00 - 16:50' },
  { id: 'P9', time: '17:00 - 17:50' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const REASON_PRESETS = [
  'Research Work & Lab Supervision',
  'Department Academic Council Meeting',
  'Approved Medical / Sick Leave',
  'National Conference / Paper Presentation',
  'External PhD Viva / Thesis Defense',
  'Institutional Accreditation Committee Duty',
  'Personal Emergency Leave',
];

export const FacultyAvailabilityCalendar: React.FC<FacultyAvailabilityCalendarProps> = ({
  facultyList,
  timetableSlots,
  initialFacultyId,
  onMarkUnavailability,
}) => {
  // Department filter
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Filtered faculty list
  const departments = useMemo(() => {
    const depts = Array.from(new Set(facultyList.map(f => f.department)));
    return ['All', ...depts];
  }, [facultyList]);

  const filteredFaculty = useMemo(() => {
    if (selectedDept === 'All') return facultyList;
    return facultyList.filter(f => f.department === selectedDept);
  }, [facultyList, selectedDept]);

  // Selected faculty member
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(() => {
    if (initialFacultyId && facultyList.some(f => f.id === initialFacultyId)) {
      return initialFacultyId;
    }
    return facultyList[0]?.id || '';
  });

  const selectedFaculty = useMemo(() => {
    return facultyList.find(f => f.id === selectedFacultyId) || facultyList[0] || null;
  }, [facultyList, selectedFacultyId]);

  // Timetable slots for this faculty
  const facultySlots = useMemo(() => {
    if (!selectedFaculty) return [];
    return timetableSlots.filter(
      s => s.facultyId === selectedFaculty.id || s.facultyName.toLowerCase() === selectedFaculty.name.toLowerCase()
    );
  }, [selectedFaculty, timetableSlots]);

  // Map slots: day -> periodId -> slot
  const scheduleMap = useMemo(() => {
    const map = new Map<string, TimetableSlot>();
    facultySlots.forEach(s => {
      map.set(`${s.day}-${s.periodId}`, s);
    });
    return map;
  }, [facultySlots]);

  // Unavailability lookup
  const unavailabilityMap = useMemo(() => {
    const map = new Map<string, string>();
    if (selectedFaculty?.unavailability) {
      selectedFaculty.unavailability.forEach(u => {
        map.set(`${u.day}-${u.periodId}`, u.reason);
      });
    }
    return map;
  }, [selectedFaculty]);

  // Unavailability modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [targetDay, setTargetDay] = useState<string>('Monday');
  const [targetPeriod, setTargetPeriod] = useState<string>('P1');
  const [reason, setReason] = useState<string>(REASON_PRESETS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleOpenMarkModal = (day?: string, periodId?: string) => {
    if (day) setTargetDay(day);
    if (periodId) setTargetPeriod(periodId);
    setReason(REASON_PRESETS[0]);
    setCustomReason('');
    setFeedback(null);
    setModalOpen(true);
  };

  const handleSaveUnavailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty) return;

    setSubmitting(true);
    setFeedback(null);

    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) {
      setFeedback({ type: 'error', message: 'Please specify the unavailability reason.' });
      setSubmitting(false);
      return;
    }

    try {
      await onMarkUnavailability({
        faculty_id: selectedFaculty.id,
        day: targetDay,
        period_id: targetPeriod,
        reason: finalReason,
      });

      setFeedback({ type: 'success', message: 'Unavailability recorded. CP-SAT solver constraint updated.' });
      setTimeout(() => {
        setModalOpen(false);
        setFeedback(null);
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit unavailability.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const teachingHours = facultySlots.length;
  const unavailableSlotsCount = unavailabilityMap.size;
  const totalWeeklyPeriods = 48; // 6 days * 8 periods
  const freePeriods = Math.max(0, totalWeeklyPeriods - teachingHours - unavailableSlotsCount);

  return (
    <div className="space-y-6">
      {/* Top Filter & Faculty Selector Card */}
      <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Title & Department */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Faculty Availability & Timetable Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Inspect live teaching commitments, research blocks, and log unavailability periods.
              </p>
            </div>
          </div>

          {/* Right Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Department Filter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDept}
                onChange={e => {
                  setSelectedDept(e.target.value);
                  const firstInDept = facultyList.find(f => e.target.value === 'All' || f.department === e.target.value);
                  if (firstInDept) setSelectedFacultyId(firstInDept.id);
                }}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                {departments.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Faculty Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <select
                value={selectedFacultyId}
                onChange={e => setSelectedFacultyId(e.target.value)}
                className="bg-transparent text-blue-950 font-bold focus:outline-none cursor-pointer max-w-xs truncate"
              >
                {filteredFaculty.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.department.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Mark Unavailability Button */}
            <button
              onClick={() => handleOpenMarkModal()}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Log Unavailability
            </button>
          </div>
        </div>

        {/* Selected Faculty Profile Strip */}
        {selectedFaculty && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shadow-md">
                {selectedFaculty.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">{selectedFaculty.name}</span>
                  <span className="text-[11px] font-semibold text-blue-700 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200">
                    {selectedFaculty.designation}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{selectedFaculty.department} • {selectedFaculty.email}</span>
              </div>
            </div>

            {/* Metric Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-semibold">
                Teaching: <strong className="font-bold">{teachingHours} hrs/wk</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                Available: <strong className="font-bold">{freePeriods} periods</strong>
              </span>
              {unavailableSlotsCount > 0 && (
                <span className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
                  Exemptions: <strong className="font-bold">{unavailableSlotsCount} slots</strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Timetable Matrix */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
        <div className="p-4 px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Click any empty cell to log research block or faculty leave.</span>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-blue-100 border border-blue-300"></div>
              <span className="text-slate-600 font-medium">Assigned Class</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-300"></div>
              <span className="text-slate-600 font-medium">Free / Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300"></div>
              <span className="text-slate-600 font-medium">Leave / Unavailability</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-slate-200 border border-slate-300"></div>
              <span className="text-slate-600 font-medium">Lunch Break</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3.5 w-28 border-r border-slate-200">Day</th>
                {PERIODS.map(p => (
                  <th key={p.id} className="p-3 text-center min-w-[110px] border-r border-slate-200 last:border-r-0">
                    <div className="font-extrabold text-slate-900">{p.id}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{p.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DAYS.map(day => (
                <tr key={day} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-800 bg-slate-50/70 border-r border-slate-200">
                    {day}
                  </td>
                  {PERIODS.map(p => {
                    const slotKey = `${day}-${p.id}`;
                    const slot = scheduleMap.get(slotKey);
                    const unavailReason = unavailabilityMap.get(slotKey);

                    if (p.isLunch) {
                      return (
                        <td
                          key={p.id}
                          className="p-2 text-center bg-slate-100/60 border-r border-slate-200 last:border-r-0 text-slate-400 font-semibold text-[11px]"
                        >
                          Lunch Break
                        </td>
                      );
                    }

                    if (unavailReason) {
                      return (
                        <td
                          key={p.id}
                          className="p-1.5 border-r border-slate-200 last:border-r-0 bg-amber-50/60"
                        >
                          <div className="h-full min-h-[58px] p-2 rounded-xl bg-amber-100/90 border border-amber-300/80 text-amber-900 flex flex-col justify-center">
                            <span className="font-extrabold text-[11px] text-amber-800 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              Unavailable
                            </span>
                            <span className="text-[10px] text-amber-700 font-medium truncate mt-0.5" title={unavailReason}>
                              {unavailReason}
                            </span>
                          </div>
                        </td>
                      );
                    }

                    if (slot) {
                      return (
                        <td
                          key={p.id}
                          className="p-1.5 border-r border-slate-200 last:border-r-0 bg-blue-50/30"
                        >
                          <div className="h-full min-h-[58px] p-2 rounded-xl bg-blue-50 border border-blue-200 shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-blue-700 text-xs truncate">
                                {slot.courseCode}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                                {slot.sessionType || 'Lec'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-700 font-semibold truncate mt-1">
                              {slot.roomName}
                            </div>
                            <div className="text-[9px] text-slate-500 font-medium truncate">
                              {slot.groupName}
                            </div>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={p.id}
                        onClick={() => handleOpenMarkModal(day, p.id)}
                        className="p-1.5 border-r border-slate-200 last:border-r-0 hover:bg-emerald-50/40 cursor-pointer group transition-colors"
                      >
                        <div className="h-full min-h-[58px] rounded-xl border border-dashed border-slate-200 p-2 flex flex-col items-center justify-center text-slate-400 group-hover:border-emerald-400 group-hover:text-emerald-700 transition-all">
                          <span className="text-[11px] font-semibold opacity-70 group-hover:opacity-100">
                            Available
                          </span>
                          <span className="text-[9px] opacity-0 group-hover:opacity-100 text-emerald-600 font-bold mt-0.5">
                            + Mark Leave
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Unavailability Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-3xl bg-white border border-white/80 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Record Faculty Unavailability
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Mark slot as unavailable for {selectedFaculty?.name}. The solver will prevent conflicts.
              </p>
            </div>

            <form onSubmit={handleSaveUnavailability} className="p-5 space-y-4">
              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={targetDay}
                    onChange={e => setTargetDay(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Period</label>
                  <select
                    value={targetPeriod}
                    onChange={e => setTargetPeriod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                  >
                    {PERIODS.filter(p => !p.isLunch).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.id} ({p.time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unavailability Reason</label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold mb-2"
                >
                  {REASON_PRESETS.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="Other">Other (Custom Reason)...</option>
                </select>

                {reason === 'Other' && (
                  <input
                    type="text"
                    required
                    placeholder="Describe reason for exemption..."
                    value={customReason}
                    onChange={e => setCustomReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm Unavailability
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

