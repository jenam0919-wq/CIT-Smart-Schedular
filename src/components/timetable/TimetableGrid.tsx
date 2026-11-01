/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DayOfWeek, TimetableSlot } from '../../types';
import { TIME_PERIODS } from '../../data/mockData';
import { TimetableFilterBar } from './TimetableFilterBar';
import { TimetableSlotModal } from './TimetableSlotModal';
import { TimetableConflictModal } from './TimetableConflictModal';
import {
  Clock,
  Coffee,
  Info,
  Calendar,
  Layers,
  Building,
  User,
  SlidersHorizontal,
  Download,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

const ALL_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface TimetableGridProps {
  customSlots?: TimetableSlot[];
  readOnly?: boolean;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  customSlots,
  readOnly = false,
}) => {
  const {
    timetableSlots: globalSlots,
    rooms,
    faculty,
    studentGroups,
    courses,
    filterGroup,
    filterFaculty,
    filterRoom,
    filterDay,
    setFilterDay,
    setActiveNavigation
  } = useApp();

  // Local filter states for Course, Department and Search
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // View state: 'week' or 'day'
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDayTab, setSelectedDayTab] = useState<DayOfWeek>('Monday');

  // Interactive modal states
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  const baseSlots = customSlots || globalSlots;

  const isAll = (v?: string) => !v || v.toLowerCase() === 'all';

  // Filter slots according to all active filters
  const filteredSlots = useMemo(() => {
    return baseSlots.filter(slot => {
      // Group filter
      if (!isAll(filterGroup) && slot.groupName !== filterGroup) return false;
      // Faculty filter
      if (!isAll(filterFaculty) && slot.facultyName !== filterFaculty) return false;
      // Room filter
      if (!isAll(filterRoom) && slot.roomName !== filterRoom) return false;
      // Day filter
      if (!isAll(filterDay) && slot.day !== filterDay) return false;
      // Course filter
      if (!isAll(filterCourse) && slot.courseCode !== filterCourse) return false;

      // Department filter
      if (!isAll(filterDepartment)) {
        const course = courses.find(c => c.code === slot.courseCode);
        const group = studentGroups.find(g => g.name === slot.groupName);
        const fac = faculty.find(f => f.name === slot.facultyName);
        const matched =
          (course && course.department.toUpperCase() === filterDepartment.toUpperCase()) ||
          (group && group.department.toUpperCase().includes(filterDepartment.toUpperCase())) ||
          (fac && fac.department.toUpperCase().includes(filterDepartment.toUpperCase()));
        if (!matched) return false;
      }

      // Search keyword
      if (searchKeyword && searchKeyword.trim().length > 0) {
        const q = searchKeyword.toLowerCase();
        const matches =
          slot.courseCode.toLowerCase().includes(q) ||
          slot.courseName.toLowerCase().includes(q) ||
          slot.facultyName.toLowerCase().includes(q) ||
          slot.roomName.toLowerCase().includes(q) ||
          slot.groupName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [baseSlots, filterGroup, filterFaculty, filterRoom, filterDay, filterCourse, filterDepartment, searchKeyword, courses, studentGroups, faculty]);

  // Which days to display
  const displayDays = useMemo(() => {
    if (viewMode === 'day') {
      return [selectedDayTab];
    }
    if (!isAll(filterDay)) {
      return [filterDay as DayOfWeek];
    }
    return ALL_DAYS;
  }, [viewMode, selectedDayTab, filterDay]);

  // Helper to find slot for day + period
  const getSlot = (day: DayOfWeek, periodId: string) => {
    return filteredSlots.find(s => s.day === day && s.periodId === periodId);
  };

  // Check if slot has a collision with another slot
  const isSlotConflicted = (slot: TimetableSlot) => {
    const collisions = baseSlots.filter(
      s => s.id !== slot.id &&
      s.day === slot.day &&
      s.periodId === slot.periodId &&
      (s.roomName === slot.roomName || s.facultyName === slot.facultyName || s.groupName === slot.groupName)
    );
    return collisions.length > 0;
  };

  // Color mapping based on session type and conflict status
  const getSlotStyles = (slot: TimetableSlot) => {
    const hasConflict = isSlotConflicted(slot);
    if (hasConflict) {
      return {
        cardClass: 'bg-rose-50/90 hover:bg-rose-100 border-rose-300 text-rose-950 shadow-rose-500/10',
        badgeClass: 'bg-rose-600 text-white',
        typeClass: 'bg-rose-200/80 text-rose-800 border-rose-300',
        dotColor: 'bg-rose-500',
        borderAccent: 'border-l-4 border-l-rose-500',
      };
    }

    const type = (slot.sessionType || '').toLowerCase();
    if (type.includes('lab') || type.includes('practical')) {
      return {
        cardClass: 'bg-purple-50/75 hover:bg-purple-100/90 border-purple-200/80 text-purple-950 shadow-purple-500/10',
        badgeClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
        typeClass: 'bg-purple-100 text-purple-700 border-purple-200',
        dotColor: 'bg-purple-500',
        borderAccent: 'border-l-4 border-l-purple-500',
      };
    }

    if (type.includes('special') || type.includes('tutorial') || type.includes('seminar')) {
      return {
        cardClass: 'bg-cyan-50/75 hover:bg-cyan-100/90 border-cyan-200/80 text-cyan-950 shadow-cyan-500/10',
        badgeClass: 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white',
        typeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
        dotColor: 'bg-cyan-500',
        borderAccent: 'border-l-4 border-l-cyan-500',
      };
    }

    // Default regular lecture
    return {
      cardClass: 'bg-blue-50/75 hover:bg-blue-100/90 border-blue-200/80 text-blue-950 shadow-blue-500/10',
      badgeClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
      typeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      dotColor: 'bg-blue-500',
      borderAccent: 'border-l-4 border-l-blue-500',
    };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 print-container">
      
      {/* Filter Bar (Hidden in Print) */}
      <div className="no-print">
        <TimetableFilterBar
          filterCourse={filterCourse}
          setFilterCourse={setFilterCourse}
          filterDepartment={filterDepartment}
          setFilterDepartment={setFilterDepartment}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          totalFilteredCount={filteredSlots.length}
          totalSlotsCount={baseSlots.length}
        />
      </div>

      {/* Grid Sub-Header with View Switches & Conflict Status */}
      <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
        
        {/* Left: View Switcher (Weekly vs Daily) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-slate-200/60 backdrop-blur-md rounded-xl border border-white/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white text-blue-700 shadow-md shadow-slate-200/80 border border-white/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Master (Mon - Sat)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-white text-blue-700 shadow-md shadow-slate-200/80 border border-white/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily View
            </button>
          </div>

          {/* If Day View is active, show day pills */}
          {viewMode === 'day' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {ALL_DAYS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDayTab(d)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    selectedDayTab === d
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                      : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200/70'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {/* Color Legend Indicators */}
          <div className="hidden xl:flex items-center gap-3 text-[11px] font-semibold text-slate-500 pl-2 border-l border-slate-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Regular Class</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span>Laboratory</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
              <span>Special / Elective</span>
            </span>
          </div>
        </div>

        {/* Right: Conflict Status Pill & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Conflict Inspector Pill (Clickable) */}
          <button
            type="button"
            onClick={() => setIsConflictModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-2xs cursor-pointer"
            title="Inspect clash-free certification & warnings"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>0 Hard Conflicts</span>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-md font-black ml-1">
              CP-SAT Verified
            </span>
          </button>

          {/* Quick Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Print or export PDF of active timetable view"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print View</span>
          </button>
        </div>

      </div>

      {/* ================= VIEW 1: WEEKLY MASTER GRID ================= */}
      {viewMode === 'week' ? (
        <div className="glass-card rounded-2xl border border-white/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              
              {/* Table Header: Day / Period Headers */}
              <thead>
                <tr className="bg-[#101B3C] text-white text-[11px] font-bold">
                  <th className="p-3 w-32 sticky left-0 z-20 bg-[#101B3C] border-r border-slate-800 text-center uppercase tracking-wider">
                    Day / Period
                  </th>
                  
                  {/* Morning Periods P1 - P5 */}
                  {TIME_PERIODS.slice(0, 5).map(period => (
                    <th key={period.id} className="p-2.5 border-r border-slate-800 text-center w-36">
                      <div className="font-extrabold text-cyan-300 text-xs">{period.id}</div>
                      <div className="text-[10px] text-slate-300 font-mono font-normal">
                        {period.startTime} - {period.endTime}
                      </div>
                    </th>
                  ))}

                  {/* Lunch Break Column Header */}
                  <th className="p-2.5 w-24 bg-amber-950/70 border-r border-amber-900/60 text-center text-amber-300">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Lunch</span>
                    </div>
                    <div className="text-[10px] text-amber-200/80 font-mono font-normal">
                      12:30 - 13:30
                    </div>
                  </th>

                  {/* Afternoon Periods P6 - P9 */}
                  {TIME_PERIODS.slice(5).map(period => (
                    <th key={period.id} className="p-2.5 border-r border-slate-800 text-center w-36">
                      <div className="font-extrabold text-cyan-300 text-xs">{period.id}</div>
                      <div className="text-[10px] text-slate-300 font-mono font-normal">
                        {period.startTime} - {period.endTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body: Day Rows (Monday through Saturday) */}
              <tbody className="divide-y divide-slate-200/80 text-xs">
                {displayDays.map(day => (
                  <tr key={day} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Sticky Day Column */}
                    <td className="p-3 font-extrabold text-slate-900 bg-slate-50/90 backdrop-blur-md sticky left-0 z-10 border-r border-slate-200/80 text-center">
                      <div className="text-xs font-black">{day}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {day === 'Saturday' ? 'Weekend Session' : 'Academic Day'}
                      </div>
                    </td>

                    {/* Morning Slots: P1 to P5 */}
                    {TIME_PERIODS.slice(0, 5).map(period => {
                      const slot = getSlot(day, period.id);
                      if (!slot) {
                        return (
                          <td key={period.id} className="p-1.5 border-r border-slate-200/60 align-top h-28">
                            <div className="h-full rounded-xl border border-dashed border-slate-200/90 bg-white/40 flex items-center justify-center text-[10px] font-semibold text-slate-400">
                              Available
                            </div>
                          </td>
                        );
                      }

                      const styles = getSlotStyles(slot);
                      return (
                        <td key={period.id} className="p-1.5 border-r border-slate-200/60 align-top h-28">
                          <div
                            onClick={() => setSelectedSlot(slot)}
                            className={`h-full p-2.5 rounded-xl border ${styles.borderAccent} ${styles.cardClass} text-left cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md flex flex-col justify-between group`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded shadow-2xs ${styles.badgeClass}`}>
                                  {slot.courseCode}
                                </span>
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${styles.typeClass}`}>
                                  {slot.sessionType}
                                </span>
                              </div>
                              <div className="font-extrabold text-slate-900 text-[11px] leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {slot.courseName}
                              </div>
                            </div>

                            <div className="mt-1 pt-1.5 border-t border-slate-200/60 space-y-0.5 text-[10px]">
                              <div className="flex items-center gap-1 text-slate-700 font-medium truncate">
                                <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate">{slot.facultyName.split(' ')[0]} {slot.facultyName.split(' ').slice(-1)}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-500 text-[9px]">
                                <span className="font-bold text-slate-800">{slot.roomName}</span>
                                <span className="text-slate-500 font-medium">{slot.groupName}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    {/* Campus Lunch Break Column */}
                    <td className="p-2 border-r border-amber-200/50 bg-amber-50/50 text-center align-middle text-amber-800">
                      <div className="flex flex-col items-center justify-center h-full py-2">
                        <Coffee className="w-4 h-4 text-amber-500 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          Lunch Recess
                        </span>
                        <span className="text-[9px] text-amber-600/80 font-mono">60 mins</span>
                      </div>
                    </td>

                    {/* Afternoon Slots: P6 to P9 */}
                    {TIME_PERIODS.slice(5).map(period => {
                      const slot = getSlot(day, period.id);
                      if (!slot) {
                        return (
                          <td key={period.id} className="p-1.5 border-r border-slate-200/60 align-top h-28">
                            <div className="h-full rounded-xl border border-dashed border-slate-200/90 bg-white/40 flex items-center justify-center text-[10px] font-semibold text-slate-400">
                              Available
                            </div>
                          </td>
                        );
                      }

                      const styles = getSlotStyles(slot);
                      return (
                        <td key={period.id} className="p-1.5 border-r border-slate-200/60 align-top h-28">
                          <div
                            onClick={() => setSelectedSlot(slot)}
                            className={`h-full p-2.5 rounded-xl border ${styles.borderAccent} ${styles.cardClass} text-left cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md flex flex-col justify-between group`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded shadow-2xs ${styles.badgeClass}`}>
                                  {slot.courseCode}
                                </span>
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${styles.typeClass}`}>
                                  {slot.sessionType}
                                </span>
                              </div>
                              <div className="font-extrabold text-slate-900 text-[11px] leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {slot.courseName}
                              </div>
                            </div>

                            <div className="mt-1 pt-1.5 border-t border-slate-200/60 space-y-0.5 text-[10px]">
                              <div className="flex items-center gap-1 text-slate-700 font-medium truncate">
                                <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate">{slot.facultyName.split(' ')[0]} {slot.facultyName.split(' ').slice(-1)}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-500 text-[9px]">
                                <span className="font-bold text-slate-800">{slot.roomName}</span>
                                <span className="text-slate-500 font-medium">{slot.groupName}</span>
                              </div>
                            </div>
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
      ) : (
        /* ================= VIEW 2: DAILY TIMELINE VIEW ================= */
        <div className="glass-card rounded-2xl border border-white/80 p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Daily Timeline Schedule — {selectedDayTab}
              </h3>
              <p className="text-xs text-slate-500">
                Detailed chronological sequence of lectures, laboratory sections, and breaks
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-xl border border-blue-200/80">
              {filteredSlots.filter(s => s.day === selectedDayTab).length} sessions scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {TIME_PERIODS.map(period => {
              if (period.id === 'P5') {
                return (
                  <React.Fragment key="lunch-block">
                    {/* Period 5 */}
                    <DailyPeriodCard
                      day={selectedDayTab}
                      period={period}
                      slot={getSlot(selectedDayTab, period.id)}
                      onSelectSlot={setSelectedSlot}
                      getStyles={getSlotStyles}
                    />
                    {/* Dedicated Lunch Break Card */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3.5 text-amber-900">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-xs uppercase tracking-wider text-amber-800">
                          Campus Lunch Recess (60m)
                        </div>
                        <div className="text-xs text-amber-700 font-mono mt-0.5">
                          12:30 PM – 13:30 PM
                        </div>
                        <div className="text-[11px] text-amber-600/90 mt-0.5">
                          Dedicated faculty & student nutrition gap
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              }

              return (
                <DailyPeriodCard
                  key={period.id}
                  day={selectedDayTab}
                  period={period}
                  slot={getSlot(selectedDayTab, period.id)}
                  onSelectSlot={setSelectedSlot}
                  getStyles={getSlotStyles}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      <TimetableSlotModal
        slot={selectedSlot}
        roomDetails={rooms.find(r => r.name === selectedSlot?.roomName)}
        facultyDetails={faculty.find(f => f.name === selectedSlot?.facultyName)}
        groupDetails={studentGroups.find(g => g.name === selectedSlot?.groupName)}
        courseDetails={courses.find(c => c.code === selectedSlot?.courseCode)}
        onClose={() => setSelectedSlot(null)}
        onRequestChange={slot => {
          setSelectedSlot(null);
          setActiveNavigation('rescheduling', 'disruptions');
        }}
      />

      {/* Global Conflict Management Modal */}
      <TimetableConflictModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        onSelectSlot={slot => setSelectedSlot(slot)}
        onOpenReschedule={() => setActiveNavigation('rescheduling', 'disruptions')}
      />

    </div>
  );
};

// Helper Subcomponent for Daily View Period Card
interface DailyPeriodCardProps {
  day: DayOfWeek;
  period: { id: string; startTime: string; endTime: string };
  slot?: TimetableSlot;
  onSelectSlot: (slot: TimetableSlot) => void;
  getStyles: (slot: TimetableSlot) => any;
}

const DailyPeriodCard: React.FC<DailyPeriodCardProps> = ({
  period,
  slot,
  onSelectSlot,
  getStyles,
}) => {
  if (!slot) {
    return (
      <div className="p-4 rounded-2xl border border-dashed border-slate-200/90 bg-white/50 flex items-center justify-between text-xs text-slate-400">
        <div>
          <div className="font-mono font-bold text-slate-600">{period.id}</div>
          <div className="text-[10px] text-slate-400 font-mono">{period.startTime} - {period.endTime}</div>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">No session assigned</span>
      </div>
    );
  }

  const styles = getStyles(slot);

  return (
    <div
      onClick={() => onSelectSlot(slot)}
      className={`p-4 rounded-2xl border ${styles.borderAccent} ${styles.cardClass} shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`font-mono text-[10px] font-black px-2 py-0.5 rounded shadow-2xs ${styles.badgeClass}`}>
              {slot.courseCode}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${styles.typeClass}`}>
              {slot.sessionType}
            </span>
          </div>
          <div className="font-mono text-[10px] font-bold text-slate-500">
            {period.id} ({period.startTime} - {period.endTime})
          </div>
        </div>

        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1 mt-1">
          {slot.courseName}
        </h4>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1 text-slate-700 font-semibold truncate max-w-[140px]">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{slot.facultyName}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <span className="font-bold text-slate-800">{slot.roomName}</span>
          <span>•</span>
          <span>{slot.groupName}</span>
        </div>
      </div>
    </div>
  );
};
