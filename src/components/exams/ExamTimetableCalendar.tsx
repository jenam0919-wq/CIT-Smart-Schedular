/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ExamScheduleItem, Room } from '../../types';
import {
  CalendarDays,
  Clock,
  Building2,
  Users,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

interface ExamTimetableCalendarProps {
  examinations: ExamScheduleItem[];
  rooms: Room[];
  onSelectExam: (exam: ExamScheduleItem) => void;
}

export const ExamTimetableCalendar: React.FC<ExamTimetableCalendarProps> = ({
  examinations,
  rooms,
  onSelectExam,
}) => {
  const [viewType, setViewType] = useState<'date-wise' | 'room-matrix'>('date-wise');
  const [selectedSlot, setSelectedSlot] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Group examinations by Date
  const dateGroups = useMemo(() => {
    const map = new Map<string, ExamScheduleItem[]>();
    examinations.forEach(e => {
      // Filter by slot
      if (selectedSlot !== 'All' && !e.timeSlot.includes(selectedSlot)) return;
      // Filter by search
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchCode = e.courseCode.toLowerCase().includes(q);
        const matchTitle = e.courseTitle.toLowerCase().includes(q);
        const matchGroup = e.studentGroup.toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchGroup) return;
      }

      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    });

    return Array.from(map.entries())
      .sort(([d1], [d2]) => d1.localeCompare(d2))
      .map(([date, items]) => ({
        date,
        day: items[0]?.day || 'Weekday',
        morningExams: items.filter(e => e.timeSlot.includes('09:') || e.timeSlot.includes('AM')),
        afternoonExams: items.filter(e => e.timeSlot.includes('02:') || e.timeSlot.includes('PM')),
      }));
  }, [examinations, selectedSlot, searchFilter]);

  // Distinct dates for Room Matrix
  const distinctDates = useMemo(() => {
    const dates = Array.from(new Set(examinations.map(e => e.date))).sort();
    return dates.slice(0, 7); // First week
  }, [examinations]);

  // Distinct exam rooms
  const examRoomNames = useMemo(() => {
    const set = new Set<string>();
    examinations.forEach(e => {
      (e.allocatedRooms || []).forEach(r => set.add(r.roomName));
    });
    return Array.from(set).sort();
  }, [examinations]);

  // Room Matrix lookup: roomName -> date -> exam
  const roomMatrixMap = useMemo(() => {
    const map = new Map<string, Map<string, ExamScheduleItem>>();
    examinations.forEach(e => {
      (e.allocatedRooms || []).forEach(r => {
        if (!map.has(r.roomName)) map.set(r.roomName, new Map());
        map.get(r.roomName)!.set(e.date, e);
      });
    });
    return map;
  }, [examinations]);

  return (
    <div className="space-y-5">
      {/* View Switcher & Filter Bar */}
      <div className="p-4 md:p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              Examination Timetable & Seating Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Shift-wise examination schedule, lecture hall allocations, and invigilation duties.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setViewType('date-wise')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewType === 'date-wise'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Date-Wise Schedule
              </button>
              <button
                onClick={() => setViewType('room-matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewType === 'room-matrix'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Room Matrix
              </button>
            </div>

            {/* Shift Filter */}
            <select
              value={selectedSlot}
              onChange={e => setSelectedSlot(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Shifts (Morning & Afternoon)</option>
              <option value="09:">Morning Shift (09:30 - 11:30 AM)</option>
              <option value="02:">Afternoon Shift (02:00 - 04:00 PM)</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter course or cohort..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewType === 'date-wise' ? (
        <div className="space-y-5">
          {dateGroups.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-400">
              No examination papers match the search or shift filter.
            </div>
          ) : (
            dateGroups.map(group => (
              <div
                key={group.date}
                className="rounded-3xl bg-white/85 border border-white/80 shadow-xl overflow-hidden backdrop-blur-xl"
              >
                {/* Date Header Ribbon */}
                <div className="p-4 px-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-black text-xs">
                      {group.day.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white">
                        {group.date} &bull; {group.day}
                      </h4>
                      <p className="text-xs text-slate-300">
                        {group.morningExams.length + group.afternoonExams.length} Examination Papers Scheduled
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Seating Compliant
                  </span>
                </div>

                {/* Shifts Container */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                  {/* Morning Shift */}
                  <div className="space-y-3 lg:pr-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        Morning Shift (09:30 - 11:30 AM)
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {group.morningExams.length} Papers
                      </span>
                    </div>

                    {group.morningExams.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 italic">
                        No morning examinations scheduled on this date.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {group.morningExams.map(ex => (
                          <div
                            key={ex.id}
                            onClick={() => onSelectExam(ex)}
                            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer group space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-xs text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                                {ex.courseCode}
                              </span>
                              <span className="text-xs font-bold text-slate-800">
                                {ex.studentGroup} ({ex.enrolledStudents} students)
                              </span>
                            </div>

                            <h5 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {ex.courseTitle}
                            </h5>

                            {/* Rooms list */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(ex.allocatedRooms || []).map((r, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 flex items-center gap-1"
                                >
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  <strong>{r.roomName}</strong>: {r.invigilator}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Afternoon Shift */}
                  <div className="space-y-3 pt-4 lg:pt-0 lg:pl-6">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        Afternoon Shift (02:00 - 04:00 PM)
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {group.afternoonExams.length} Papers
                      </span>
                    </div>

                    {group.afternoonExams.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 italic">
                        No afternoon examinations scheduled on this date.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {group.afternoonExams.map(ex => (
                          <div
                            key={ex.id}
                            onClick={() => onSelectExam(ex)}
                            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-300 transition-all cursor-pointer group space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-xs text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                                {ex.courseCode}
                              </span>
                              <span className="text-xs font-bold text-slate-800">
                                {ex.studentGroup} ({ex.enrolledStudents} students)
                              </span>
                            </div>

                            <h5 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                              {ex.courseTitle}
                            </h5>

                            {/* Rooms list */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(ex.allocatedRooms || []).map((r, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 flex items-center gap-1"
                                >
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  <strong>{r.roomName}</strong>: {r.invigilator}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* ROOM MATRIX VIEW */
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-4 px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold text-slate-900">Lecture Hall Examination Allocations (Week 1)</span>
            <span>Click any booked exam slot to inspect paper details</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3.5 w-32 border-r border-slate-200">Exam Hall</th>
                  {distinctDates.map(date => (
                    <th key={date} className="p-3 text-center min-w-[130px] border-r border-slate-200 last:border-r-0">
                      <div className="font-extrabold text-slate-900">{date}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examRoomNames.map(roomName => (
                  <tr key={roomName} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900 bg-slate-50/70 border-r border-slate-200">
                      {roomName}
                    </td>
                    {distinctDates.map(date => {
                      const exam = roomMatrixMap.get(roomName)?.get(date);
                      if (exam) {
                        const roomInfo = (exam.allocatedRooms || []).find(r => r.roomName === roomName);
                        return (
                          <td
                            key={date}
                            onClick={() => onSelectExam(exam)}
                            className="p-1.5 border-r border-slate-200 last:border-r-0 hover:bg-blue-50/60 cursor-pointer"
                          >
                            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 shadow-2xs">
                              <div className="font-black text-blue-700 text-xs truncate">
                                {exam.courseCode}
                              </div>
                              <div className="text-[10px] text-slate-600 truncate mt-0.5">
                                {roomInfo?.allocatedSeats || 30} seats
                              </div>
                              <div className="text-[9px] font-medium text-slate-500 truncate mt-0.5">
                                {roomInfo?.invigilator}
                              </div>
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={date} className="p-2 text-center border-r border-slate-200 last:border-r-0 text-slate-300">
                          <span className="text-[10px]">Available</span>
                        </td>
                      );
                    })}
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

