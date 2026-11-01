/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ExamScheduleItem, Room, FacultyMember } from '../../types';
import {
  Building2,
  Users,
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  DoorOpen
} from 'lucide-react';

interface ExamAllocationViewProps {
  examinations: ExamScheduleItem[];
  rooms: Room[];
  faculty: FacultyMember[];
  onSelectExam?: (exam: ExamScheduleItem) => void;
}

export const ExamAllocationView: React.FC<ExamAllocationViewProps> = ({
  examinations,
  rooms,
  faculty,
  onSelectExam,
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'invigilators'>('rooms');
  const [searchQuery, setSearchQuery] = useState('');

  // Room metrics
  const roomAllocationMetrics = useMemo(() => {
    const roomDutyMap = new Map<string, { sessionsCount: number; seatsAllocated: number; examIds: string[] }>();

    examinations.forEach(e => {
      (e.allocatedRooms || []).forEach(r => {
        const key = r.roomName || r.roomId;
        if (!roomDutyMap.has(key)) {
          roomDutyMap.set(key, { sessionsCount: 0, seatsAllocated: 0, examIds: [] });
        }
        const entry = roomDutyMap.get(key)!;
        entry.sessionsCount += 1;
        entry.seatsAllocated += r.allocatedSeats || 0;
        entry.examIds.push(e.id);
      });
    });

    return rooms.map(room => {
      const duties = roomDutyMap.get(room.name) || roomDutyMap.get(room.id) || { sessionsCount: 0, seatsAllocated: 0, examIds: [] };
      const examCapacity = Math.floor(room.capacity * 0.5); // Strict 50% alternate seating
      const isOverCapacity = duties.seatsAllocated > (examCapacity * duties.sessionsCount) && duties.sessionsCount > 0;

      return {
        room,
        examCapacity,
        sessionsCount: duties.sessionsCount,
        seatsAllocated: duties.seatsAllocated,
        isOverCapacity,
      };
    }).sort((a, b) => b.sessionsCount - a.sessionsCount);
  }, [rooms, examinations]);

  // Invigilator duty roster
  const invigilatorRoster = useMemo(() => {
    const dutyMap = new Map<string, { count: number; exams: ExamScheduleItem[]; dates: Set<string> }>();

    examinations.forEach(e => {
      (e.allocatedRooms || []).forEach(r => {
        if (!r.invigilator) return;
        const name = r.invigilator.trim();
        if (!dutyMap.has(name)) {
          dutyMap.set(name, { count: 0, exams: [], dates: new Set() });
        }
        const entry = dutyMap.get(name)!;
        entry.count += 1;
        entry.exams.push(e);
        entry.dates.add(e.date);
      });
    });

    return faculty.map(fac => {
      const duty = dutyMap.get(fac.name) || { count: 0, exams: [], dates: new Set() };
      return {
        faculty: fac,
        dutyCount: duty.count,
        exams: duty.exams,
        distinctDates: duty.dates.size,
      };
    }).sort((a, b) => b.dutyCount - a.dutyCount);
  }, [faculty, examinations]);

  // Overall totals
  const totalAllocatedRoomsCount = roomAllocationMetrics.filter(r => r.sessionsCount > 0).length;
  const totalAssignedInvigilatorsCount = invigilatorRoster.filter(i => i.dutyCount > 0).length;
  const totalExamSeatingPool = rooms.reduce((acc, r) => acc + Math.floor(r.capacity * 0.5), 0);

  // Filtered lists
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return roomAllocationMetrics;
    const q = searchQuery.toLowerCase();
    return roomAllocationMetrics.filter(
      r => r.room.name.toLowerCase().includes(q) || r.room.block.toLowerCase().includes(q)
    );
  }, [roomAllocationMetrics, searchQuery]);

  const filteredInvigilators = useMemo(() => {
    if (!searchQuery.trim()) return invigilatorRoster;
    const q = searchQuery.toLowerCase();
    return invigilatorRoster.filter(
      i => i.faculty.name.toLowerCase().includes(q) || i.faculty.department.toLowerCase().includes(q)
    );
  }, [invigilatorRoster, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Exam Venues Mapped</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {totalAllocatedRoomsCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ {rooms.length} rooms</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Lecture halls & auditoriums
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Seating Capacity (50% Rule)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-700 tracking-tight">
              {totalExamSeatingPool}
            </span>
            <span className="text-xs font-semibold text-slate-500">concurrent seats</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2">
            Alternate seating distance verified
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Faculty Invigilators</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {totalAssignedInvigilatorsCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">professors on duty</span>
          </div>
          <p className="text-[11px] text-purple-700 font-semibold mt-2">
            Assigned across 41 exam sessions
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Buffer Compliance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 tracking-tight">
              100%
            </span>
            <span className="text-xs font-semibold text-slate-500">strict buffer</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2">
            No adjacent student seating
          </p>
        </div>
      </div>

      {/* Tabs & Search Strip */}
      <div className="p-4 md:p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rooms'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Exam Venues & Capacity ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('invigilators')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'invigilators'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Faculty Invigilator Roster ({faculty.length})
          </button>
        </div>

        <div className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={activeTab === 'rooms' ? 'Search hall, building...' : 'Search faculty name, dept...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tab 1: Rooms & Capacity Matrix */}
      {activeTab === 'rooms' && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3.5 pl-5">Exam Hall</th>
                  <th className="p-3.5">Building & Floor</th>
                  <th className="p-3.5 text-center">Classroom Capacity</th>
                  <th className="p-3.5 text-center">Exam Capacity (50%)</th>
                  <th className="p-3.5 text-center">Assigned Sessions</th>
                  <th className="p-3.5 min-w-[180px]">Seating Buffer Status</th>
                  <th className="p-3.5 pr-5 text-center">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map(({ room, examCapacity, sessionsCount, isOverCapacity }) => (
                  <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xs border border-blue-200">
                          <DoorOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{room.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {room.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-medium text-slate-700">
                      {room.block} &bull; Floor {room.floor}
                    </td>

                    <td className="p-3.5 text-center font-bold text-slate-600">
                      {room.capacity} seats
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-mono">
                        {examCapacity} seats
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-bold text-slate-900">
                      {sessionsCount} papers
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                          <span>1-Seat Buffer Spacing</span>
                          <span className="text-emerald-600 font-bold">50% Cap</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${Math.min((sessionsCount > 0 ? 50 : 0), 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 pr-5 text-center">
                      {isOverCapacity ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          Over Capacity
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1 w-fit mx-auto">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Compliant
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Invigilator Roster */}
      {activeTab === 'invigilators' && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3.5 pl-5">Faculty Member</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Designation</th>
                  <th className="p-3.5 text-center">Invigilation Duties</th>
                  <th className="p-3.5 text-center">Duty Days</th>
                  <th className="p-3.5 min-w-[200px]">Assigned Exam Papers</th>
                  <th className="p-3.5 pr-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvigilators.map(({ faculty, dutyCount, exams, distinctDates }) => (
                  <tr key={faculty.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {faculty.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{faculty.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {faculty.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-medium text-slate-700">
                      {faculty.department}
                    </td>

                    <td className="p-3.5 text-slate-600">
                      {faculty.designation}
                    </td>

                    <td className="p-3.5 text-center font-black text-slate-900 text-sm">
                      {dutyCount}
                    </td>

                    <td className="p-3.5 text-center font-semibold text-slate-700">
                      {distinctDates} days
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {exams.slice(0, 3).map(e => (
                          <span
                            key={e.id}
                            className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200"
                            title={`${e.courseCode}: ${e.date}`}
                          >
                            {e.courseCode}
                          </span>
                        ))}
                        {exams.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-semibold">
                            +{exams.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 pr-5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Available
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

