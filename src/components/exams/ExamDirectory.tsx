/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ExamScheduleItem, Room, FacultyMember } from '../../types';
import {
  FileSpreadsheet,
  LayoutGrid,
  List,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  Building2,
  Users,
  GraduationCap,
  ShieldCheck,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Printer,
  Download
} from 'lucide-react';

interface ExamDirectoryProps {
  examinations: ExamScheduleItem[];
  rooms: Room[];
  faculty: FacultyMember[];
  onSelectExam: (exam: ExamScheduleItem) => void;
  onEditExam: (exam: ExamScheduleItem) => void;
  onDeleteExam: (id: string) => void;
}

export const ExamDirectory: React.FC<ExamDirectoryProps> = ({
  examinations,
  rooms,
  faculty,
  onSelectExam,
  onEditExam,
  onDeleteExam,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSlot, setSelectedSlot] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'code' | 'students-desc'>('date-asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 8 : 10;

  // Distinct dates
  const dateOptions = useMemo(() => {
    const dates = Array.from(new Set(examinations.map(e => e.date))).sort();
    return ['All', ...dates];
  }, [examinations]);

  // Filter & Sort
  const filteredExams = useMemo(() => {
    return examinations
      .filter(e => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCode = e.courseCode.toLowerCase().includes(q);
          const matchTitle = e.courseTitle.toLowerCase().includes(q);
          const matchGroup = e.studentGroup.toLowerCase().includes(q);
          const matchRoom = (e.allocatedRooms || []).some(r => r.roomName.toLowerCase().includes(q));
          const matchInvigilator = (e.allocatedRooms || []).some(r => r.invigilator.toLowerCase().includes(q));
          if (!matchCode && !matchTitle && !matchGroup && !matchRoom && !matchInvigilator) return false;
        }

        // Exam Type filter
        if (selectedType !== 'All' && e.examType !== selectedType) return false;

        // Slot filter
        if (selectedSlot !== 'All' && !e.timeSlot.includes(selectedSlot)) return false;

        // Date filter
        if (selectedDate !== 'All' && e.date !== selectedDate) return false;

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date-asc':
            return a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot);
          case 'date-desc':
            return b.date.localeCompare(a.date) || b.timeSlot.localeCompare(a.timeSlot);
          case 'code':
            return a.courseCode.localeCompare(b.courseCode);
          case 'students-desc':
            return b.enrolledStudents - a.enrolledStudents;
          default:
            return 0;
        }
      });
  }, [examinations, searchQuery, selectedType, selectedSlot, selectedDate, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage) || 1;
  const currentExams = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExams.slice(start, start + itemsPerPage);
  }, [filteredExams, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedSlot('All');
    setSelectedDate('All');
    setSortBy('date-asc');
    setCurrentPage(1);
  };

  const isMorning = (slot: string) => slot.includes('09:') || slot.includes('AM');

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="p-4 md:p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Examination Papers Directory
              </h3>
              <p className="text-[11px] text-slate-500">
                Showing {filteredExams.length} of {examinations.length} scheduled exam sessions
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 self-start md:self-auto">
            <button
              onClick={() => {
                setViewMode('grid');
                setCurrentPage(1);
              }}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => {
                setViewMode('table');
                setCurrentPage(1);
              }}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Filters Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-3">
          {/* Search Bar */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search course code, title, cohort, invigilator..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300/80 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300/80 bg-white text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedType}
              onChange={e => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="All">All Types (Midsem & Endsem)</option>
              <option value="Midsem">Midsem Examination</option>
              <option value="Endsem">Endsem Examination</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300/80 bg-white text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="All">All Exam Dates</option>
              {dateOptions.filter(d => d !== 'All').map(date => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300/80 bg-white text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="date-asc">Date: Earliest First</option>
              <option value="date-desc">Date: Latest First</option>
              <option value="code">Course Code (A-Z)</option>
              <option value="students-desc">Enrolled (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || selectedType !== 'All' || selectedDate !== 'All' || selectedSlot !== 'All') && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Filtered to <strong className="text-slate-800">{filteredExams.length}</strong> matching papers
            </span>
            <button
              onClick={handleResetFilters}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Directory View (Grid / Table) */}
      {filteredExams.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/70 border border-slate-200/80 shadow-xs backdrop-blur-md">
          <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No Examinations Match Filter Criteria</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, exam type, or scheduled date filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentExams.map(exam => {
            const morning = isMorning(exam.timeSlot);
            return (
              <div
                key={exam.id}
                onClick={() => onSelectExam(exam)}
                className="group relative rounded-3xl bg-white/85 border border-white/80 p-5 shadow-xl shadow-blue-950/5 hover:shadow-2xl hover:shadow-blue-950/10 hover:border-blue-300/80 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge Strip */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        morning
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}
                    >
                      {morning ? 'Morning Shift' : 'Afternoon Shift'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {exam.id}
                    </span>
                  </div>

                  {/* Course Code & Title */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-black text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                        {exam.courseCode}
                      </span>
                      <span className="text-[11px] font-bold text-slate-700">
                        {exam.examType}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mt-1">
                      {exam.courseTitle}
                    </h4>
                  </div>

                  {/* Date, Time & Cohort */}
                  <div className="space-y-1.5 py-2.5 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        Date:
                      </span>
                      <strong className="text-slate-900">{exam.date} ({exam.day?.slice(0, 3)})</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        Time Slot:
                      </span>
                      <strong className="text-slate-900 font-mono text-[11px]">{exam.timeSlot}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5 text-purple-500" />
                        Cohort:
                      </span>
                      <strong className="text-slate-900 truncate max-w-[120px]">{exam.studentGroup}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Headcount:
                      </span>
                      <strong className="text-emerald-700 font-bold">{exam.enrolledStudents} Students</strong>
                    </div>
                  </div>

                  {/* Allocated Rooms Preview */}
                  <div className="mt-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Allocated Halls & Invigilators
                    </div>
                    <div className="space-y-1">
                      {(exam.allocatedRooms || []).map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          <span className="font-bold text-slate-900">{r.roomName} ({r.allocatedSeats} seats)</span>
                          <span className="text-slate-500 truncate max-w-[100px]" title={r.invigilator}>{r.invigilator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Alternate Seating
                  </span>

                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onEditExam(exam)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit Paper"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteExam(exam.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Paper"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3.5 pl-5">Date & Day</th>
                  <th className="p-3.5">Time Slot</th>
                  <th className="p-3.5">Course Code & Title</th>
                  <th className="p-3.5">Cohort Group</th>
                  <th className="p-3.5 text-center">Enrolled</th>
                  <th className="p-3.5 min-w-[220px]">Allocated Halls & Invigilators</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentExams.map(exam => {
                  const morning = isMorning(exam.timeSlot);
                  return (
                    <tr
                      key={exam.id}
                      onClick={() => onSelectExam(exam)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5 pl-5 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900">{exam.date}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{exam.day}</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            morning
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {exam.timeSlot}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {exam.courseCode}
                          </span>
                          <span className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {exam.courseTitle}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-semibold text-slate-700">
                        {exam.studentGroup}
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap font-bold text-slate-900 font-mono">
                        {exam.enrolledStudents}
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-1">
                          {(exam.allocatedRooms || []).map((r, i) => (
                            <div key={i} className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {r.roomName} ({r.allocatedSeats} seats)
                              </span>
                              <span className="text-slate-400">&bull;</span>
                              <span className="font-medium text-emerald-700">{r.invigilator}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectExam(exam)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onEditExam(exam)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExam(exam.id)}
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs backdrop-blur-md">
          <div className="text-xs text-slate-500 font-medium">
            Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

