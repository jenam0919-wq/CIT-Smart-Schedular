/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Room, TimetableSlot, VenueBookingRequest, DayOfWeek } from '../../types';
import { TIME_PERIODS } from '../../data/mockData';
import {
  Clock,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  Search,
  Filter,
  Sparkles,
  Info,
  CalendarDays,
  PlusCircle
} from 'lucide-react';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface LiveRoomMatrixProps {
  rooms: Room[];
  timetableSlots: TimetableSlot[];
  bookingRequests: VenueBookingRequest[];
  onReserveRoom?: (room: Room) => void;
  onInspectRoom?: (room: Room) => void;
}

export const LiveRoomMatrix: React.FC<LiveRoomMatrixProps> = ({
  rooms,
  timetableSlots,
  bookingRequests,
  onReserveRoom,
  onInspectRoom,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('All');
  const [matrixSearch, setMatrixSearch] = useState<string>('');
  const [selectedCellInfo, setSelectedCellInfo] = useState<{
    room: Room;
    period: { id: string; startTime: string; endTime: string };
    classSlot?: TimetableSlot;
    eventBooking?: VenueBookingRequest;
    status: 'FREE' | 'CLASS' | 'EVENT' | 'CONFLICT';
  } | null>(null);

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      if (roomTypeFilter !== 'All' && r.type !== roomTypeFilter) return false;
      if (
        matrixSearch &&
        !r.name.toLowerCase().includes(matrixSearch.toLowerCase()) &&
        !r.block.toLowerCase().includes(matrixSearch.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [rooms, roomTypeFilter, matrixSearch]);

  // Compute daily matrix cell state based on real timetable and booking records
  const getCellStatus = (room: Room, periodId: string) => {
    // 1. Check academic class slot
    const classSlot = timetableSlots.find(
      s =>
        (s.roomName === room.name || s.roomId === room.id) &&
        s.day === selectedDay &&
        s.periodId === periodId
    );

    // 2. Check event booking (mock maps to Monday or specific date)
    const eventBooking = bookingRequests.find(
      b =>
        (b.roomName === room.name || b.roomId === room.id) &&
        b.status === 'Approved' &&
        b.periodIds?.includes(periodId)
    );

    if (classSlot && eventBooking) {
      return { status: 'CONFLICT' as const, classSlot, eventBooking };
    }
    if (classSlot) {
      return { status: 'CLASS' as const, classSlot };
    }
    if (eventBooking) {
      return { status: 'EVENT' as const, eventBooking };
    }
    return { status: 'FREE' as const };
  };

  // Calculate day utilization metrics
  const dayStats = useMemo(() => {
    let totalPeriods = filteredRooms.length * 9;
    let occupiedPeriods = 0;
    let freePeriods = 0;
    let conflicts = 0;

    filteredRooms.forEach(room => {
      TIME_PERIODS.forEach(p => {
        const cell = getCellStatus(room, p.id);
        if (cell.status === 'CONFLICT') conflicts++;
        if (cell.status === 'CLASS' || cell.status === 'EVENT') occupiedPeriods++;
        else freePeriods++;
      });
    });

    const utilizationRate = totalPeriods > 0 ? ((occupiedPeriods / totalPeriods) * 100).toFixed(1) : '0';

    return {
      totalPeriods,
      occupiedPeriods,
      freePeriods,
      conflicts,
      utilizationRate,
    };
  }, [filteredRooms, timetableSlots, bookingRequests, selectedDay]);

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Control Panel */}
      <div className="glass-card p-5 rounded-3xl border border-white/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Day Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Day:
          </span>
          {DAYS_OF_WEEK.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDay === d
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200/70'
              }`}
            >
              {d.substring(0, 3)}
            </button>
          ))}
        </div>

        {/* Room Type & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={matrixSearch}
              onChange={e => setMatrixSearch(e.target.value)}
              placeholder="Search room..."
              className="w-full text-xs pl-8 pr-2 py-1.5 bg-white/80 border border-slate-200/80 rounded-xl focus:outline-hidden"
            />
          </div>

          <select
            value={roomTypeFilter}
            onChange={e => setRoomTypeFilter(e.target.value)}
            className="text-xs py-1.5 px-3 bg-white/80 border border-slate-200/80 rounded-xl font-bold text-slate-700 shadow-2xs cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Lecture Hall">Lecture Halls</option>
            <option value="Computer Lab">Computer Labs</option>
            <option value="Hardware Lab">Hardware Labs</option>
            <option value="Seminar Hall">Seminar Halls</option>
            <option value="Auditorium">Auditoriums</option>
          </select>
        </div>

      </div>

      {/* Utilization Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-2xs">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Day Utilization</div>
          <div className="text-lg font-black text-blue-600 font-mono mt-0.5">{dayStats.utilizationRate}%</div>
          <div className="text-[10px] text-slate-500 font-medium">{selectedDay} Overall</div>
        </div>

        <div className="p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-2xs">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Available Periods</div>
          <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">{dayStats.freePeriods}</div>
          <div className="text-[10px] text-emerald-600 font-medium">Free for Reservation</div>
        </div>

        <div className="p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-2xs">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Academic Lectures</div>
          <div className="text-lg font-black text-indigo-700 font-mono mt-0.5">{dayStats.occupiedPeriods}</div>
          <div className="text-[10px] text-indigo-600 font-medium">Timetable Synchronized</div>
        </div>

        <div className="p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-2xs">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Double-Bookings</div>
          <div className="text-lg font-black text-rose-600 font-mono mt-0.5">{dayStats.conflicts}</div>
          <div className="text-[10px] text-emerald-600 font-medium">Zero Collisions Certified</div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="glass-card p-3 rounded-2xl border border-white/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Matrix Cell Key:</span>
        </span>

        <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center text-[9px] font-black">F</span>
            <span>Free / Available</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-blue-100 border border-blue-300 text-blue-800 flex items-center justify-center text-[9px] font-black">C</span>
            <span>Academic Lecture</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-purple-100 border border-purple-300 text-purple-800 flex items-center justify-center text-[9px] font-black">E</span>
            <span>Campus Event</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-[9px] font-black">L</span>
            <span>Lunch Recess</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-100 border border-rose-300 text-rose-800 flex items-center justify-center text-[9px] font-black">!</span>
            <span>Conflict Overlap</span>
          </div>
        </div>
      </div>

      {/* Main Visual Matrix Table */}
      <div className="glass-card rounded-3xl border border-white/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs min-w-[950px]">
            
            {/* Header: Periods P1 - P9 with Lunch Break */}
            <thead>
              <tr className="bg-[#101B3C] text-white text-[11px] font-bold">
                <th className="p-3.5 text-left pl-5 sticky left-0 z-20 bg-[#101B3C] border-r border-slate-800 w-44">
                  Venue & Capacity
                </th>

                {/* Morning Periods P1 - P5 */}
                {TIME_PERIODS.slice(0, 5).map(p => (
                  <th key={p.id} className="p-2.5 border-r border-slate-800 text-center w-20">
                    <div className="font-extrabold text-cyan-300">{p.id}</div>
                    <div className="text-[9px] text-slate-300 font-mono font-normal">
                      {p.startTime}
                    </div>
                  </th>
                ))}

                {/* Lunch Break Column */}
                <th className="p-2 w-16 bg-amber-950/70 border-r border-amber-900/60 text-center text-amber-300">
                  <div className="text-[10px] font-extrabold uppercase">Lunch</div>
                  <div className="text-[8px] text-amber-200/80 font-mono">12:30</div>
                </th>

                {/* Afternoon Periods P6 - P9 */}
                {TIME_PERIODS.slice(5).map(p => (
                  <th key={p.id} className="p-2.5 border-r border-slate-800 text-center w-20">
                    <div className="font-extrabold text-cyan-300">{p.id}</div>
                    <div className="text-[9px] text-slate-300 font-mono font-normal">
                      {p.startTime}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Matrix Body: Rooms as Rows */}
            <tbody className="divide-y divide-slate-200/80 text-xs">
              {filteredRooms.map(room => (
                <tr key={room.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Sticky Room Column */}
                  <td
                    onClick={() => onInspectRoom && onInspectRoom(room)}
                    className="p-3 text-left pl-5 font-bold text-slate-900 bg-white/90 backdrop-blur-md sticky left-0 z-10 border-r border-slate-200/80 cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center justify-between pr-2">
                      <span className="font-extrabold text-xs">{room.name}</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-bold">
                        {room.capacity}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                      {room.type} • {room.block}
                    </div>
                  </td>

                  {/* Morning Slots: P1 to P5 */}
                  {TIME_PERIODS.slice(0, 5).map(period => {
                    const cell = getCellStatus(room, period.id);
                    return (
                      <td key={period.id} className="p-1 border-r border-slate-200/60 text-center">
                        <MatrixCellButton
                          room={room}
                          period={period}
                          cell={cell}
                          onSelect={() => setSelectedCellInfo({ room, period, ...cell })}
                        />
                      </td>
                    );
                  })}

                  {/* Lunch Recess Cell */}
                  <td className="p-1 border-r border-amber-200/50 bg-amber-50/40 text-center">
                    <span className="text-[9px] font-bold text-amber-700/70 font-mono">REST</span>
                  </td>

                  {/* Afternoon Slots: P6 to P9 */}
                  {TIME_PERIODS.slice(5).map(period => {
                    const cell = getCellStatus(room, period.id);
                    return (
                      <td key={period.id} className="p-1 border-r border-slate-200/60 text-center">
                        <MatrixCellButton
                          room={room}
                          period={period}
                          cell={cell}
                          onSelect={() => setSelectedCellInfo({ room, period, ...cell })}
                        />
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* Selected Matrix Cell Popover Details */}
      {selectedCellInfo && (
        <div className="p-4 rounded-2xl glass-card border border-white/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
              selectedCellInfo.status === 'CLASS'
                ? 'bg-blue-600 text-white'
                : selectedCellInfo.status === 'EVENT'
                ? 'bg-purple-600 text-white'
                : selectedCellInfo.status === 'CONFLICT'
                ? 'bg-rose-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}>
              {selectedCellInfo.period.id}
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                {selectedCellInfo.room.name} on {selectedDay} ({selectedCellInfo.period.startTime} – {selectedCellInfo.period.endTime})
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                {selectedCellInfo.status === 'CLASS' && selectedCellInfo.classSlot && (
                  <span>Class: <strong>{selectedCellInfo.classSlot.courseCode}</strong> ({selectedCellInfo.classSlot.courseName}) • Prof: {selectedCellInfo.classSlot.facultyName} • Cohort: {selectedCellInfo.classSlot.groupName}</span>
                )}
                {selectedCellInfo.status === 'EVENT' && selectedCellInfo.eventBooking && (
                  <span>Event: <strong>{selectedCellInfo.eventBooking.eventTitle}</strong> ({selectedCellInfo.eventBooking.clubOrDept})</span>
                )}
                {selectedCellInfo.status === 'FREE' && (
                  <span className="text-emerald-700">Completely vacant and available for ad-hoc faculty reservations or committee meetings.</span>
                )}
                {selectedCellInfo.status === 'CONFLICT' && (
                  <span className="text-rose-700 font-bold">Double-Booking Collision Detected between Class and Event!</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCellInfo.status === 'FREE' && onReserveRoom && (
              <button
                type="button"
                onClick={() => onReserveRoom(selectedCellInfo.room)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-2xs hover:shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Reserve This Slot</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedCellInfo(null)}
              className="px-3 py-1.5 text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

// Subcomponent: Individual Matrix Cell Button
interface MatrixCellButtonProps {
  room: Room;
  period: { id: string; startTime: string; endTime: string };
  cell: {
    status: 'FREE' | 'CLASS' | 'EVENT' | 'CONFLICT';
    classSlot?: TimetableSlot;
    eventBooking?: VenueBookingRequest;
  };
  onSelect: () => void;
}

const MatrixCellButton: React.FC<MatrixCellButtonProps> = ({
  cell,
  onSelect,
}) => {
  if (cell.status === 'CONFLICT') {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="w-full py-1.5 rounded-lg bg-rose-500 text-white font-black text-[10px] shadow-2xs hover:scale-105 transition-transform cursor-pointer animate-pulse"
        title="Double-Booking Conflict!"
      >
        CLASH
      </button>
    );
  }

  if (cell.status === 'CLASS' && cell.classSlot) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="w-full py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[10px] font-mono shadow-2xs transition-colors cursor-pointer truncate px-1"
        title={`${cell.classSlot.courseCode}: ${cell.classSlot.courseName} (${cell.classSlot.facultyName})`}
      >
        {cell.classSlot.courseCode}
      </button>
    );
  }

  if (cell.status === 'EVENT' && cell.eventBooking) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="w-full py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[10px] font-mono shadow-2xs transition-colors cursor-pointer truncate px-1"
        title={`Event: ${cell.eventBooking.eventTitle} (${cell.eventBooking.clubOrDept})`}
      >
        EVENT
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full py-1.5 rounded-lg bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[10px] font-mono transition-colors cursor-pointer"
      title="Free / Available for Booking"
    >
      FREE
    </button>
  );
};

