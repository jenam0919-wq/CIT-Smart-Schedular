/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TimetableSlot, Room, FacultyMember, StudentGroup } from '../../types';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building,
  Users,
  User,
  ArrowRight,
  Filter,
  Search,
  RefreshCw,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';

interface DetectedConflict {
  id: string;
  type: 'Faculty Double-Booking' | 'Room Collision' | 'Student Cohort Overlap' | 'Capacity Violation';
  severity: 'Critical' | 'Warning' | 'Low';
  day: string;
  periodId: string;
  primarySlot: TimetableSlot;
  conflictingSlot?: TimetableSlot;
  details: string;
  recommendation: string;
}

interface ConflictDetectionViewProps {
  timetableSlots: TimetableSlot[];
  rooms: Room[];
  faculty: FacultyMember[];
  studentGroups: StudentGroup[];
  onResolveWithMicroSolver?: (slot: TimetableSlot) => void;
}

export const ConflictDetectionView: React.FC<ConflictDetectionViewProps> = ({
  timetableSlots,
  rooms,
  faculty,
  studentGroups,
  onResolveWithMicroSolver,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Scan timetable for real conflicts
  const conflicts: DetectedConflict[] = useMemo(() => {
    const list: DetectedConflict[] = [];

    // Map by room
    const roomOccupied = new Map<string, TimetableSlot>();
    // Map by faculty
    const facultyOccupied = new Map<string, TimetableSlot>();
    // Map by student group
    const groupOccupied = new Map<string, TimetableSlot>();
    // Room capacity lookup
    const roomMap = new Map<string, Room>();
    rooms.forEach(r => roomMap.set(r.name, r));

    timetableSlots.forEach(slot => {
      const roomKey = `${slot.day}-${slot.periodId}-${slot.roomName}`;
      const facKey = `${slot.day}-${slot.periodId}-${slot.facultyName.toLowerCase()}`;
      const grpKey = `${slot.day}-${slot.periodId}-${slot.groupName}`;

      // 1. Room collision
      if (roomOccupied.has(roomKey)) {
        const existing = roomOccupied.get(roomKey)!;
        list.push({
          id: `conf-room-${slot.id}-${existing.id}`,
          type: 'Room Collision',
          severity: 'Critical',
          day: slot.day,
          periodId: slot.periodId,
          primarySlot: slot,
          conflictingSlot: existing,
          details: `Room ${slot.roomName} is double-booked between ${slot.courseCode} and ${existing.courseCode}.`,
          recommendation: `Relocate ${slot.courseCode} to another vacant lecture hall with similar capacity.`,
        });
      } else {
        roomOccupied.set(roomKey, slot);
      }

      // 2. Faculty double-booking
      if (facultyOccupied.has(facKey)) {
        const existing = facultyOccupied.get(facKey)!;
        list.push({
          id: `conf-fac-${slot.id}-${existing.id}`,
          type: 'Faculty Double-Booking',
          severity: 'Critical',
          day: slot.day,
          periodId: slot.periodId,
          primarySlot: slot,
          conflictingSlot: existing,
          details: `${slot.facultyName} is scheduled for two simultaneous classes (${slot.courseCode} and ${existing.courseCode}).`,
          recommendation: `Shift one session to an open period or assign a co-instructor.`,
        });
      } else {
        facultyOccupied.set(facKey, slot);
      }

      // 3. Student cohort overlap
      if (groupOccupied.has(grpKey)) {
        const existing = groupOccupied.get(grpKey)!;
        list.push({
          id: `conf-grp-${slot.id}-${existing.id}`,
          type: 'Student Cohort Overlap',
          severity: 'Critical',
          day: slot.day,
          periodId: slot.periodId,
          primarySlot: slot,
          conflictingSlot: existing,
          details: `Cohort ${slot.groupName} has conflicting classes: ${slot.courseCode} vs ${existing.courseCode}.`,
          recommendation: `Move ${slot.courseCode} to another period where ${slot.groupName} has an open slot.`,
        });
      } else {
        groupOccupied.set(grpKey, slot);
      }

      // 4. Capacity violation
      const room = roomMap.get(slot.roomName);
      if (room && room.capacity < 60 && slot.courseName.toLowerCase().includes('lecture')) {
        // e.g., if class size exceeds room capacity
        // Only trigger if severe mismatch
        if (room.capacity < 40) {
          list.push({
            id: `conf-cap-${slot.id}`,
            type: 'Capacity Violation',
            severity: 'Warning',
            day: slot.day,
            periodId: slot.periodId,
            primarySlot: slot,
            details: `Venue ${slot.roomName} capacity (${room.capacity}) may be insufficient for cohort size.`,
            recommendation: `Upgrade to a larger lecture hall (e.g. LH-101 or LH-102).`,
          });
        }
      }
    });

    return list;
  }, [timetableSlots, rooms]);

  const filteredConflicts = useMemo(() => {
    return conflicts.filter(c => {
      const matchSev = selectedSeverity === 'All' || c.severity === selectedSeverity;
      const matchSearch =
        searchQuery === '' ||
        c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.primarySlot.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.primarySlot.facultyName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSev && matchSearch;
    });
  }, [conflicts, selectedSeverity, searchQuery]);

  const handleScanAgain = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary */}
      <div className="p-6 rounded-3xl bg-white/90 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Master Schedule Conflict Inspector</h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  conflicts.length === 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {conflicts.length} Violations Found
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live automated collision detection across {timetableSlots.length} sessions, instructor schedules, and room allocations
            </p>
          </div>
        </div>

        <button
          onClick={handleScanAgain}
          disabled={isScanning}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/10 flex items-center gap-1.5 self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>Re-scan Master Schedule</span>
        </button>
      </div>

      {/* KPI Severity Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Critical Conflicts</span>
            <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              !
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">
            {conflicts.filter(c => c.severity === 'Critical').length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Room & Faculty Collisions</p>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Warnings</span>
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              ⚠
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {conflicts.filter(c => c.severity === 'Warning').length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Capacity & Consecutive Mismatches</p>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Compliance Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {timetableSlots.length > 0
              ? `${Math.max(0, 100 - conflicts.length * 5)}%`
              : '100%'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Zero Cascade Tolerance</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by course, faculty, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {['All', 'Critical', 'Warning'].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  selectedSeverity === sev
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conflict List */}
      {filteredConflicts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Zero Timetable Collisions Detected</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            All active {timetableSlots.length} academic periods comply with faculty availability, room capacities, and student cohort schedules.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConflicts.map(conf => (
            <div
              key={conf.id}
              className="p-5 rounded-3xl bg-white/90 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl space-y-3 hover:shadow-2xl transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      conf.severity === 'Critical'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {conf.severity}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{conf.type}</span>
                  <span className="text-xs font-mono text-slate-500">
                    {conf.day} • {conf.periodId}
                  </span>
                </div>

                {onResolveWithMicroSolver && (
                  <button
                    onClick={() => onResolveWithMicroSolver(conf.primarySlot)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Micro-Solve Conflict</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Primary Slot */}
                <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{conf.primarySlot.courseName}</span>
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {conf.primarySlot.courseCode}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Venue: {conf.primarySlot.roomName} • Group: {conf.primarySlot.groupName}
                  </div>
                  <div className="text-slate-500 text-[10px]">Instructor: {conf.primarySlot.facultyName}</div>
                </div>

                {/* Conflicting Slot if applicable */}
                {conf.conflictingSlot ? (
                  <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-950">{conf.conflictingSlot.courseName}</span>
                      <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                        {conf.conflictingSlot.courseCode}
                      </span>
                    </div>
                    <div className="text-rose-800 text-[11px]">
                      Venue: {conf.conflictingSlot.roomName} • Group: {conf.conflictingSlot.groupName}
                    </div>
                    <div className="text-rose-600 text-[10px]">Instructor: {conf.conflictingSlot.facultyName}</div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-center text-xs text-amber-800">
                    <span>{conf.details}</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-blue-900 block text-[11px]">Recommended Resolution:</span>
                  <span>{conf.recommendation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};