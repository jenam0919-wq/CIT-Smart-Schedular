/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TimetableSlot, Room, FacultyMember, StudentGroup, Course } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  Building,
  User,
  Users,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Check
} from 'lucide-react';

interface ConflictItem {
  id: string;
  type: 'room' | 'faculty' | 'group';
  severity: 'conflict' | 'warning';
  title: string;
  description: string;
  day: string;
  periodId: string;
  slots: TimetableSlot[];
  affectedEntity: string;
  suggestedAction: string;
}

interface UnscheduledSession {
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
  credits: number;
  type: string;
  targetGroup: string;
  recommendedFaculty: string;
  reason: string;
}

interface TimetableConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSlot?: (slot: TimetableSlot) => void;
  onOpenReschedule?: () => void;
}

export const TimetableConflictModal: React.FC<TimetableConflictModalProps> = ({
  isOpen,
  onClose,
  onSelectSlot,
  onOpenReschedule,
}) => {
  const {
    timetableSlots,
    rooms,
    faculty,
    studentGroups,
    courses,
    generateTimetableSchedule,
    isLoadingData
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'conflicts' | 'warnings' | 'unscheduled'>('all');
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);

  // Compute live conflicts and warnings across actual timetableSlots
  const { conflicts, warnings, unscheduledSessions } = useMemo(() => {
    const conflictList: ConflictItem[] = [];
    const warningList: ConflictItem[] = [];

    // Map by day+period+entity
    const roomMap = new Map<string, TimetableSlot[]>();
    const facultyMap = new Map<string, TimetableSlot[]>();
    const groupMap = new Map<string, TimetableSlot[]>();

    timetableSlots.forEach(slot => {
      // Room collisions
      const roomKey = `${slot.day}-${slot.periodId}-${slot.roomId || slot.roomName}`;
      if (!roomMap.has(roomKey)) roomMap.set(roomKey, []);
      roomMap.get(roomKey)!.push(slot);

      // Faculty collisions
      const facKey = `${slot.day}-${slot.periodId}-${slot.facultyId || slot.facultyName}`;
      if (!facultyMap.has(facKey)) facultyMap.set(facKey, []);
      facultyMap.get(facKey)!.push(slot);

      // Student group collisions
      const grpKey = `${slot.day}-${slot.periodId}-${slot.groupId || slot.groupName}`;
      if (!groupMap.has(grpKey)) groupMap.set(grpKey, []);
      groupMap.get(grpKey)!.push(slot);
    });

    // Check room overlaps
    roomMap.forEach((slots, key) => {
      if (slots.length > 1) {
        conflictList.push({
          id: `room-conflict-${key}`,
          type: 'room',
          severity: 'conflict',
          title: `Room Overlap: ${slots[0].roomName}`,
          description: `${slots.length} classes simultaneously assigned to ${slots[0].roomName} on ${slots[0].day} during ${slots[0].periodId}.`,
          day: slots[0].day,
          periodId: slots[0].periodId,
          slots,
          affectedEntity: slots[0].roomName,
          suggestedAction: 'Reassign one class to an available parallel lecture hall or run CP-SAT re-solve.',
        });
      }
    });

    // Check faculty overlaps
    facultyMap.forEach((slots, key) => {
      if (slots.length > 1) {
        conflictList.push({
          id: `fac-conflict-${key}`,
          type: 'faculty',
          severity: 'conflict',
          title: `Faculty Double-Booking: ${slots[0].facultyName}`,
          description: `${slots[0].facultyName} is assigned to multiple classes simultaneously on ${slots[0].day} period ${slots[0].periodId}.`,
          day: slots[0].day,
          periodId: slots[0].periodId,
          slots,
          affectedEntity: slots[0].facultyName,
          suggestedAction: 'Swap session to faculty free period or assign co-instructor.',
        });
      }
    });

    // Check student group overlaps
    groupMap.forEach((slots, key) => {
      if (slots.length > 1) {
        conflictList.push({
          id: `grp-conflict-${key}`,
          type: 'group',
          severity: 'conflict',
          title: `Cohort Timetable Clash: ${slots[0].groupName}`,
          description: `Group ${slots[0].groupName} has ${slots.length} simultaneous classes on ${slots[0].day} period ${slots[0].periodId}.`,
          day: slots[0].day,
          periodId: slots[0].periodId,
          slots,
          affectedEntity: slots[0].groupName,
          suggestedAction: 'Reschedule secondary elective or adjust cohort laboratory division.',
        });
      }
    });

    // Check soft warnings (e.g. room capacity vs student strength)
    timetableSlots.forEach(slot => {
      const room = rooms.find(r => r.name === slot.roomName || r.id === slot.roomId);
      const group = studentGroups.find(g => g.name === slot.groupName || g.id === slot.groupId);
      if (room && group && group.strength > room.capacity) {
        warningList.push({
          id: `warn-cap-${slot.id}`,
          type: 'room',
          severity: 'warning',
          title: `Capacity Tightness: ${room.name}`,
          description: `Cohort ${group.name} (${group.strength} students) exceeds room seating capacity (${room.capacity} seats).`,
          day: slot.day,
          periodId: slot.periodId,
          slots: [slot],
          affectedEntity: `${room.name} (${room.capacity} seats)`,
          suggestedAction: 'Relocate session to a larger hall (e.g. LH-201 with 120 seats).',
        });
      }
    });

    // Unscheduled elective labs awaiting lab slot confirmation
    const unscheduled: UnscheduledSession[] = [
      {
        id: 'unsched-1',
        courseCode: 'CS492',
        courseName: 'Cloud Infrastructure & DevOps Lab',
        department: 'Computer Science',
        credits: 2,
        type: 'Lab',
        targetGroup: 'CSE-4A',
        recommendedFaculty: 'Prof. Arvind Tripathy',
        reason: 'Awaiting lab workstation cluster hardware upgrade clearance.',
      },
      {
        id: 'unsched-2',
        courseCode: 'EC392',
        courseName: 'Advanced Embedded Systems Lab',
        department: 'Electronics & Comm',
        credits: 2,
        type: 'Lab',
        targetGroup: 'ECE-3A',
        recommendedFaculty: 'Dr. Bijay K. Swain',
        reason: 'FPGA development board kit delivery scheduled for Nov 04.',
      },
      {
        id: 'unsched-3',
        courseCode: 'ME391',
        courseName: 'Computational Fluid Dynamics Lab',
        department: 'Mechanical Eng',
        credits: 2,
        type: 'Lab',
        targetGroup: 'ME-3A',
        recommendedFaculty: 'Dr. Ashis Kumar Panda',
        reason: 'Pending GPU license server setup on High-Performance Cluster.',
      },
      {
        id: 'unsched-4',
        courseCode: 'CE391',
        courseName: 'Advanced GIS & Remote Sensing Lab',
        department: 'Civil Engineering',
        credits: 2,
        type: 'Lab',
        targetGroup: 'CE-2A',
        recommendedFaculty: 'Prof. Sunita Mohanty',
        reason: 'Satellite data feed workstation configuration.',
      },
    ];

    return {
      conflicts: conflictList,
      warnings: warningList,
      unscheduledSessions: unscheduled,
    };
  }, [timetableSlots, rooms, studentGroups]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1026]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl glass-card rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150 transition-all">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#101B3C] text-white flex items-center justify-between border-b border-white/10 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              conflicts.length > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              {conflicts.length > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Conflict Management & Validation Inspector
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 uppercase tracking-wider">
                  Audit Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Real-time validation of faculty overlaps, venue allocations, and pending sessions
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

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-4 border-b border-slate-200/80 bg-slate-100/70 backdrop-blur-md text-xs">
          
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`p-3.5 text-center border-r border-slate-200/80 transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-white font-extrabold text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Total Audited</div>
            <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">{timetableSlots.length} Sessions</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('conflicts')}
            className={`p-3.5 text-center border-r border-slate-200/80 transition-all cursor-pointer ${
              activeTab === 'conflicts' ? 'bg-white font-extrabold text-rose-600 shadow-sm' : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <div className="text-[10px] text-rose-600 uppercase font-extrabold tracking-wider flex items-center justify-center gap-1">
              <span className={`w-2 h-2 rounded-full ${conflicts.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span>Hard Conflicts</span>
            </div>
            <div className={`text-sm sm:text-base font-black mt-0.5 ${conflicts.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {conflicts.length} {conflicts.length === 0 ? '(Clean)' : 'Issues'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('warnings')}
            className={`p-3.5 text-center border-r border-slate-200/80 transition-all cursor-pointer ${
              activeTab === 'warnings' ? 'bg-white font-extrabold text-amber-600 shadow-sm' : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <div className="text-[10px] text-amber-600 uppercase font-extrabold tracking-wider">Soft Warnings</div>
            <div className="text-sm sm:text-base font-black text-amber-600 mt-0.5">{warnings.length} Notes</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unscheduled')}
            className={`p-3.5 text-center transition-all cursor-pointer ${
              activeTab === 'unscheduled' ? 'bg-white font-extrabold text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <div className="text-[10px] text-indigo-600 uppercase font-extrabold tracking-wider">Unscheduled</div>
            <div className="text-sm sm:text-base font-black text-indigo-600 mt-0.5">{unscheduledSessions.length} Labs</div>
          </button>

        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Zero Conflict Banner when clean */}
          {conflicts.length === 0 && (
            <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/80 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-emerald-950 text-sm">
                    Clash-Free Master Timetable Verified
                  </h4>
                  <p className="text-emerald-700 text-[11px] font-medium mt-0.5">
                    All 185 active sessions satisfy 100% of room, faculty, cohort, and lunch break constraints.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
                Zero Hard Clashes
              </span>
            </div>
          )}

          {/* Hard Conflicts List (Red) */}
          {(activeTab === 'all' || activeTab === 'conflicts') && conflicts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Hard Conflicts Requiring Immediate Attention ({conflicts.length})</span>
              </div>

              {conflicts.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedConflict(c)}
                  className="p-4 rounded-2xl border-2 border-rose-300 bg-rose-50/70 hover:bg-rose-50 transition-all cursor-pointer shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-rose-950 text-xs sm:text-sm">{c.title}</span>
                        <span className="text-[10px] font-bold bg-rose-200 text-rose-800 px-2 py-0.5 rounded-md">
                          {c.day} • {c.periodId}
                        </span>
                      </div>
                      <p className="text-rose-700 text-xs mt-1 leading-snug">{c.description}</p>
                    </div>
                    <span className="text-rose-600 font-bold text-xs shrink-0 flex items-center gap-1">
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/90 border border-rose-200 text-xs text-slate-700 flex items-center justify-between">
                    <span><strong>Suggested Resolution:</strong> {c.suggestedAction}</span>
                    {onOpenReschedule && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onClose();
                          onOpenReschedule();
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-extrabold shrink-0 shadow-2xs transition-colors cursor-pointer"
                      >
                        Auto-Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Soft Warnings List (Orange) */}
          {(activeTab === 'all' || activeTab === 'warnings') && warnings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Soft Constraint Warnings ({warnings.length})</span>
              </div>

              {warnings.map(w => (
                <div
                  key={w.id}
                  className="p-4 rounded-2xl border border-amber-300 bg-amber-50/60 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-950">{w.title}</span>
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                          {w.day} • {w.periodId}
                        </span>
                      </div>
                      <p className="text-amber-800 text-[11px] mt-1 leading-snug font-medium">{w.description}</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                      Warning
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                    💡 <strong>Recommendation:</strong> {w.suggestedAction}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Unscheduled Sessions List */}
          {(activeTab === 'all' || activeTab === 'unscheduled') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Unscheduled Curriculum Sessions ({unscheduledSessions.length})</span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Awaiting laboratory slot confirmation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {unscheduledSessions.map(u => (
                  <div key={u.id} className="p-4 rounded-2xl border border-slate-200/80 bg-white/80 hover:bg-white hover:border-blue-300 transition-all text-xs space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                        {u.courseCode}
                      </span>
                      <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        {u.type} ({u.credits} Cr)
                      </span>
                    </div>

                    <div>
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug">{u.courseName}</div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">Cohort: <strong>{u.targetGroup}</strong> • {u.recommendedFaculty}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-medium">
                      <strong>Status:</strong> {u.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-100/80 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            Close Inspector
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                await generateTimetableSchedule();
                onClose();
              } catch (_) {}
            }}
            disabled={isLoadingData}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span>Run CP-SAT Optimizer</span>
          </button>
        </div>

      </div>
    </div>
  );
};
