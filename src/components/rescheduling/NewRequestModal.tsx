/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Course, FacultyMember, Room, StudentGroup, TimetableSlot, DayOfWeek, RescheduleRequest } from '../../types';
import {
  RefreshCw,
  X,
  Calendar,
  Clock,
  Building,
  Users,
  User,
  AlertTriangle,
  CheckCircle2,
  Send,
  Sparkles
} from 'lucide-react';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<RescheduleRequest, 'id' | 'submittedDate' | 'status'>) => Promise<void>;
  courses: Course[];
  faculty: FacultyMember[];
  rooms: Room[];
  studentGroups: StudentGroup[];
  timetableSlots: TimetableSlot[];
  currentUserName?: string;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  courses,
  faculty,
  rooms,
  studentGroups,
  timetableSlots,
  currentUserName = 'Dr. Debabrata Samal',
}) => {
  const [selectedCourseCode, setSelectedCourseCode] = useState(courses[0]?.code || 'CS301');
  const [selectedFacultyName, setSelectedFacultyName] = useState(currentUserName);

  // Original slot
  const [origDay, setOrigDay] = useState<DayOfWeek>('Monday');
  const [origPeriod, setOrigPeriod] = useState('P1');
  const [origRoom, setOrigRoom] = useState(rooms[0]?.name || 'LH-101');
  const [origGroup, setOrigGroup] = useState(studentGroups[0]?.name || 'CSE-3A');

  // Proposed slot
  const [propDay, setPropDay] = useState<DayOfWeek>('Wednesday');
  const [propPeriod, setPropPeriod] = useState('P5');
  const [propRoom, setPropRoom] = useState(rooms[0]?.name || 'LH-101');
  const [propGroup, setPropGroup] = useState(studentGroups[0]?.name || 'CSE-3A');

  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If a timetable slot matches courseCode, auto-populate original slot
  const handleCourseChange = (code: string) => {
    setSelectedCourseCode(code);
    const match = timetableSlots.find(s => s.courseCode === code);
    if (match) {
      setOrigDay(match.day);
      setOrigPeriod(match.periodId);
      setOrigRoom(match.roomName);
      setOrigGroup(match.groupName);
      setPropGroup(match.groupName);
      setSelectedFacultyName(match.facultyName);
    }
  };

  // Live conflict detection on proposed slot
  const conflictReport = useMemo(() => {
    const keyRoom = `${propDay}-${propPeriod}-${propRoom}`;
    const keyFac = `${propDay}-${propPeriod}-${selectedFacultyName.toLowerCase()}`;
    const keyGrp = `${propDay}-${propPeriod}-${propGroup}`;

    let roomConflict = false;
    let facultyConflict = false;
    let studentConflict = false;

    timetableSlots.forEach(s => {
      // Don't collide with the very slot we are moving out of
      if (s.courseCode === selectedCourseCode && s.day === origDay && s.periodId === origPeriod) {
        return;
      }
      if (`${s.day}-${s.periodId}-${s.roomName}` === keyRoom) roomConflict = true;
      if (`${s.day}-${s.periodId}-${s.facultyName.toLowerCase()}` === keyFac) facultyConflict = true;
      if (`${s.day}-${s.periodId}-${s.groupName}` === keyGrp) studentConflict = true;
    });

    const hasConflicts = roomConflict || facultyConflict || studentConflict;
    let details = 'Target slot is 100% conflict-free across cohort, instructor, and venue.';
    if (roomConflict) details = `Venue ${propRoom} is already booked in ${propDay} ${propPeriod}.`;
    else if (facultyConflict) details = `Instructor has another class scheduled in ${propDay} ${propPeriod}.`;
    else if (studentConflict) details = `Cohort ${propGroup} has another class in ${propDay} ${propPeriod}.`;

    return {
      hasConflicts,
      roomConflict,
      facultyConflict,
      studentConflict,
      details,
    };
  }, [propDay, propPeriod, propRoom, propGroup, selectedFacultyName, origDay, origPeriod, selectedCourseCode, timetableSlots]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason or justification for the reschedule.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        courseCode: selectedCourseCode,
        facultyName: selectedFacultyName,
        originalSlot: {
          day: origDay,
          periodId: origPeriod,
          roomName: origRoom,
          groupName: origGroup,
        },
        proposedSlot: {
          day: propDay,
          periodId: propPeriod,
          roomName: propRoom,
          groupName: propGroup,
        },
        reason,
        conflictAnalysis: conflictReport,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit reschedule request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 text-xs my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Propose Timetable Reschedule</h3>
              <p className="text-[11px] text-slate-500">
                Submit an academic session relocation for department review and solver verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Course & Faculty Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Course</label>
              <select
                value={selectedCourseCode}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.code}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Faculty / Instructor</label>
              <select
                value={selectedFacultyName}
                onChange={(e) => setSelectedFacultyName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {faculty.map(f => (
                  <option key={f.id} value={f.name}>
                    {f.name} ({f.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Slot (Vacating) */}
          <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Current Slot (To be Vacated)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Day</label>
                <select
                  value={origDay}
                  onChange={(e) => setOrigDay(e.target.value as DayOfWeek)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Period</label>
                <select
                  value={origPeriod}
                  onChange={(e) => setOrigPeriod(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Venue</label>
                <select
                  value={origRoom}
                  onChange={(e) => setOrigRoom(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Cohort</label>
                <select
                  value={origGroup}
                  onChange={(e) => setOrigGroup(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  {studentGroups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Proposed Slot (Reallocation) */}
          <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Proposed Target Slot (Reallocation)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Target Day</label>
                <select
                  value={propDay}
                  onChange={(e) => setPropDay(e.target.value as DayOfWeek)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Target Period</label>
                <select
                  value={propPeriod}
                  onChange={(e) => setPropPeriod(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Target Venue</label>
                <select
                  value={propRoom}
                  onChange={(e) => setPropRoom(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  {rooms.map(r => <option key={r.id} value={r.name}>{r.name} (Cap: {r.capacity})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Target Cohort</label>
                <select
                  value={propGroup}
                  onChange={(e) => setPropGroup(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  {studentGroups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                </select>
              </div>
            </div>

            {/* Live Conflict Feedback Badge */}
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
                conflictReport.hasConflicts
                  ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-medium'
                  : 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-medium'
              }`}
            >
              {conflictReport.hasConflicts ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{conflictReport.details}</span>
            </div>
          </div>

          {/* Reason / Justification */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Academic Justification / Reason *
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Faculty invited to University Senate meeting; makeup lab slot requested."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};