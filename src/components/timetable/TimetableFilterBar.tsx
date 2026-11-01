/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Filter,
  RotateCcw,
  Users,
  User,
  Building,
  Calendar,
  BookOpen,
  Layers,
  Search,
  X,
  Sparkles
} from 'lucide-react';

interface TimetableFilterBarProps {
  filterCourse?: string;
  setFilterCourse?: (course: string) => void;
  filterDepartment?: string;
  setFilterDepartment?: (dept: string) => void;
  searchKeyword?: string;
  setSearchKeyword?: (keyword: string) => void;
  totalFilteredCount?: number;
  totalSlotsCount?: number;
}

export const TimetableFilterBar: React.FC<TimetableFilterBarProps> = ({
  filterCourse = 'all',
  setFilterCourse,
  filterDepartment = 'all',
  setFilterDepartment,
  searchKeyword = '',
  setSearchKeyword,
  totalFilteredCount,
  totalSlotsCount,
}) => {
  const {
    filterGroup,
    setFilterGroup,
    filterFaculty,
    setFilterFaculty,
    filterRoom,
    setFilterRoom,
    filterDay,
    setFilterDay,
    studentGroups,
    faculty,
    rooms,
    courses,
  } = useApp();

  const resetAllFilters = () => {
    setFilterGroup('all');
    setFilterFaculty('all');
    setFilterRoom('all');
    setFilterDay('all');
    if (setFilterCourse) setFilterCourse('all');
    if (setFilterDepartment) setFilterDepartment('all');
    if (setSearchKeyword) setSearchKeyword('');
  };

  const isAll = (val?: string) => !val || val.toLowerCase() === 'all';

  const activeFiltersCount = [
    !isAll(filterGroup),
    !isAll(filterFaculty),
    !isAll(filterRoom),
    !isAll(filterDay),
    !isAll(filterCourse),
    !isAll(filterDepartment),
    Boolean(searchKeyword && searchKeyword.trim().length > 0),
  ].filter(Boolean).length;

  // Standard engineering departments
  const departments = [
    { code: 'all', label: 'All Departments' },
    { code: 'CSE', label: 'Computer Science (CSE)' },
    { code: 'ECE', label: 'Electronics & Comm (ECE)' },
    { code: 'ME', label: 'Mechanical Eng (ME)' },
    { code: 'CE', label: 'Civil Engineering (CE)' },
    { code: 'BS', label: 'Basic Sciences (BS)' },
  ];

  return (
    <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/80 shadow-md mb-4 transition-all">
      <div className="flex flex-col gap-3.5">
        
        {/* Top Header of Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
                  Academic Schedule Filters
                </span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 border border-blue-200/80">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Filter master schedule across instructor, venue, cohort, course, department, and day
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalFilteredCount !== undefined && totalSlotsCount !== undefined && (
              <span className="text-[11px] font-semibold text-slate-600 bg-white/80 px-3 py-1.5 rounded-xl border border-white shadow-2xs">
                Showing <strong className="text-blue-600">{totalFilteredCount}</strong> of {totalSlotsCount} sessions
              </span>
            )}

            {/* Clear Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-xl border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Required Select Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          
          {/* 1. Student Group Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-500" />
              <span>Student Group</span>
            </label>
            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl focus:outline-hidden focus:border-blue-500 font-semibold text-slate-800 shadow-2xs transition-colors cursor-pointer"
            >
              <option value="all">All Groups ({studentGroups.length})</option>
              {studentGroups.map(g => (
                <option key={g.id} value={g.name}>
                  {g.name} ({g.strength} std)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Faculty Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-emerald-500" />
              <span>Faculty Member</span>
            </label>
            <select
              value={filterFaculty}
              onChange={e => setFilterFaculty(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl focus:outline-hidden focus:border-blue-500 font-semibold text-slate-800 shadow-2xs transition-colors cursor-pointer"
            >
              <option value="all">All Faculty ({faculty.length})</option>
              {faculty.slice(0, 30).map(f => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Room / Lab Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Building className="w-3 h-3 text-amber-500" />
              <span>Room / Venue</span>
            </label>
            <select
              value={filterRoom}
              onChange={e => setFilterRoom(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl focus:outline-hidden focus:border-blue-500 font-semibold text-slate-800 shadow-2xs transition-colors cursor-pointer"
            >
              <option value="all">All Rooms ({rooms.length})</option>
              {rooms.map(r => (
                <option key={r.id} value={r.name}>
                  {r.name} ({r.type.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Course Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-purple-500" />
              <span>Course</span>
            </label>
            <select
              value={filterCourse}
              onChange={e => setFilterCourse && setFilterCourse(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl focus:outline-hidden focus:border-blue-500 font-semibold text-slate-800 shadow-2xs transition-colors cursor-pointer"
            >
              <option value="all">All Courses ({courses.length})</option>
              {courses.slice(0, 30).map(c => (
                <option key={c.id} value={c.code}>
                  {c.code} - {c.title.length > 18 ? c.title.substring(0, 18) + '...' : c.title}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Department Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-500" />
              <span>Department</span>
            </label>
            <select
              value={filterDepartment}
              onChange={e => setFilterDepartment && setFilterDepartment(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl focus:outline-hidden focus:border-blue-500 font-semibold text-slate-800 shadow-2xs transition-colors cursor-pointer"
            >
              {departments.map(d => (
                <option key={d.code} value={d.code}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Day of Week Filter (Monday - Saturday) */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-500" />
              <span>Day of Week</span>
            </label>
            <select
              value={filterDay}
              onChange={e => setFilterDay(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl focus:outline-hidden focus:border-blue-500 font-semibold text-slate-800 shadow-2xs transition-colors cursor-pointer"
            >
              <option value="all">Full Week (Mon - Sat)</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </div>

        </div>

        {/* Live Search Input */}
        {setSearchKeyword && (
          <div className="relative mt-0.5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="Search by course code (e.g. CS301), subject name, instructor, or room number..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl placeholder-slate-400 focus:outline-hidden focus:border-blue-500 text-slate-800 shadow-2xs transition-all"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
