/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FacultyMember, TimetableSlot, Course } from '../../types';
import {
  GraduationCap,
  LayoutGrid,
  List,
  Search,
  Filter,
  ArrowUpDown,
  Mail,
  BookOpen,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface FacultyDirectoryProps {
  facultyList: FacultyMember[];
  timetableSlots: TimetableSlot[];
  courses: Course[];
  onSelectFaculty: (faculty: FacultyMember) => void;
  onEditFaculty: (faculty: FacultyMember) => void;
  onDeleteFaculty?: (id: string) => void;
  onViewTimetable?: (faculty: FacultyMember) => void;
}

export const FacultyDirectory: React.FC<FacultyDirectoryProps> = ({
  facultyList,
  timetableSlots,
  courses,
  onSelectFaculty,
  onEditFaculty,
  onDeleteFaculty,
  onViewTimetable,
}) => {
  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedDesignation, setSelectedDesignation] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [selectedAssignment, setSelectedAssignment] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'workload-desc' | 'workload-asc' | 'dept'>('name');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = viewMode === 'grid' ? 9 : 12;

  // Extract departments and designations
  const departments = useMemo(() => {
    const set = new Set(facultyList.map(f => f.department));
    return ['All', ...Array.from(set).sort()];
  }, [facultyList]);

  const designations = useMemo(() => {
    const set = new Set(facultyList.map(f => f.designation));
    return ['All', ...Array.from(set).sort()];
  }, [facultyList]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedDesignation('All');
    setSelectedAvailability('All');
    setSelectedAssignment('All');
    setSortBy('name');
    setCurrentPage(1);
  };

  const isFiltered =
    searchQuery.trim().length > 0 ||
    selectedDept !== 'All' ||
    selectedDesignation !== 'All' ||
    selectedAvailability !== 'All' ||
    selectedAssignment !== 'All';

  // Get assigned courses for each faculty member
  const getFacultyCourses = (facultyName: string) => {
    const slots = timetableSlots.filter(s => s.facultyName === facultyName);
    const codes = Array.from(new Set(slots.map(s => s.courseCode)));
    return codes;
  };

  // Filter and sort faculty
  const filteredAndSortedFaculty = useMemo(() => {
    let result = facultyList.filter(f => {
      // Search
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matches =
          f.name.toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q) ||
          f.department.toLowerCase().includes(q) ||
          f.designation.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Department filter
      if (selectedDept !== 'All' && !f.department.toLowerCase().includes(selectedDept.toLowerCase())) {
        return false;
      }

      // Designation filter
      if (selectedDesignation !== 'All' && f.designation !== selectedDesignation) {
        return false;
      }

      // Course Assignment filter
      const assigned = getFacultyCourses(f.name);
      if (selectedAssignment === 'assigned' && assigned.length === 0) return false;
      if (selectedAssignment === 'unassigned' && assigned.length > 0) return false;

      // Availability filter
      const pct = (f.weeklyWorkloadHours / f.maxWorkloadHours) * 100;
      if (selectedAvailability === 'compliant' && pct > 90) return false;
      if (selectedAvailability === 'high-workload' && pct <= 85) return false;

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'workload-desc') return b.weeklyWorkloadHours - a.weeklyWorkloadHours;
      if (sortBy === 'workload-asc') return a.weeklyWorkloadHours - b.weeklyWorkloadHours;
      if (sortBy === 'dept') return a.department.localeCompare(b.department);
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [facultyList, searchQuery, selectedDept, selectedDesignation, selectedAvailability, selectedAssignment, sortBy, timetableSlots]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedFaculty.length / pageSize) || 1;
  const paginatedFaculty = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedFaculty.slice(start, start + pageSize);
  }, [filteredAndSortedFaculty, currentPage, pageSize]);

  // Generate color palette based on department
  const getDeptColor = (dept: string) => {
    if (dept.includes('Computer')) return { bg: 'bg-blue-500/15', text: 'text-blue-700', border: 'border-blue-400/30', ring: 'ring-blue-500/20' };
    if (dept.includes('Electronics')) return { bg: 'bg-emerald-500/15', text: 'text-emerald-700', border: 'border-emerald-400/30', ring: 'ring-emerald-500/20' };
    if (dept.includes('Mechanical')) return { bg: 'bg-amber-500/15', text: 'text-amber-700', border: 'border-amber-400/30', ring: 'ring-amber-500/20' };
    if (dept.includes('Civil')) return { bg: 'bg-purple-500/15', text: 'text-purple-700', border: 'border-purple-400/30', ring: 'ring-purple-500/20' };
    return { bg: 'bg-cyan-500/15', text: 'text-cyan-700', border: 'border-cyan-400/30', ring: 'ring-cyan-500/20' };
  };

  const getInitials = (name: string) => {
    return name
      .replace(/Dr\.|Prof\.|Mr\.|Mrs\./g, '')
      .trim()
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter and Search Controls Bar */}
      <div className="glass-card p-5 rounded-3xl border border-white/80 shadow-md space-y-4 transition-all">
        
        {/* Top Row: Search, View Switcher & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search faculty by name, department, designation, or email..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl focus:outline-hidden focus:border-blue-500 shadow-2xs text-slate-800 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-white/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 shadow-2xs text-xs font-semibold text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="name">Sort: Faculty Name</option>
                <option value="dept">Sort: Department</option>
                <option value="workload-desc">Workload: High to Low</option>
                <option value="workload-asc">Workload: Low to High</option>
              </select>
            </div>

            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex items-center p-1 bg-slate-200/60 backdrop-blur-md rounded-xl border border-white/60">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-md shadow-slate-200/80 border border-white/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-700 shadow-md shadow-slate-200/80 border border-white/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Filters Row: Department, Designation, Workload Status, Course Assignment */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200/60 text-xs">
          
          {/* 1. Department */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={e => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl font-bold text-slate-800 shadow-2xs cursor-pointer"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </select>
          </div>

          {/* 2. Designation */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Designation</label>
            <select
              value={selectedDesignation}
              onChange={e => {
                setSelectedDesignation(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl font-bold text-slate-800 shadow-2xs cursor-pointer"
            >
              {designations.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Designations' : d}</option>
              ))}
            </select>
          </div>

          {/* 3. Availability / Workload */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Workload Band</label>
            <select
              value={selectedAvailability}
              onChange={e => {
                setSelectedAvailability(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl font-bold text-slate-800 shadow-2xs cursor-pointer"
            >
              <option value="All">All Workload Bands</option>
              <option value="compliant">Policy Compliant (&le; 16h)</option>
              <option value="high-workload">High Workload (&gt; 16h)</option>
            </select>
          </div>

          {/* 4. Course Assignment */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Curriculum Sync</label>
            <select
              value={selectedAssignment}
              onChange={e => {
                setSelectedAssignment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl font-bold text-slate-800 shadow-2xs cursor-pointer"
            >
              <option value="All">All Faculty</option>
              <option value="assigned">Assigned to Courses</option>
              <option value="unassigned">Unassigned / Research Only</option>
            </select>
          </div>

        </div>

      </div>

      {/* Directory Count Summary */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{paginatedFaculty.length}</strong> of {filteredAndSortedFaculty.length} faculty members
        </span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* ================= VIEW 1: GRID VIEW ================= */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedFaculty.map(fac => {
            const colors = getDeptColor(fac.department);
            const assignedCourses = getFacultyCourses(fac.name);
            const workloadPct = Math.min(100, Math.round((fac.weeklyWorkloadHours / fac.maxWorkloadHours) * 100));

            return (
              <div
                key={fac.id}
                className="glass-card rounded-3xl border border-white/80 shadow-md hover:shadow-xl hover:border-blue-300 transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top: Avatar, Name & Designation */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className={`w-12 h-12 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center font-black text-sm shrink-0 border ${colors.border} shadow-sm ring-4 ${colors.ring}`}>
                      {getInitials(fac.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        onClick={() => onSelectFaculty(fac)}
                        className="font-black text-slate-900 text-sm sm:text-base truncate group-hover:text-blue-600 transition-colors cursor-pointer"
                        title={fac.name}
                      >
                        {fac.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-bold truncate">
                        {fac.designation}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{fac.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Department Badge */}
                  <div className="mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {fac.department}
                    </span>
                  </div>

                  {/* Workload Progress Meter */}
                  <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/70 space-y-1.5 mb-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Weekly Workload</span>
                      <span className="font-mono font-black text-slate-900">
                        {fac.weeklyWorkloadHours}h <span className="text-[10px] text-slate-400 font-normal">/ {fac.maxWorkloadHours}h max</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          workloadPct > 90
                            ? 'bg-rose-500'
                            : workloadPct > 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${workloadPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{workloadPct}% allocated</span>
                      <span className="font-semibold text-emerald-700">Policy Compliant</span>
                    </div>
                  </div>

                  {/* Assigned Courses Chips */}
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Assigned Courses ({assignedCourses.length})
                    </span>
                    {assignedCourses.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No courses currently assigned</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {assignedCourses.slice(0, 4).map(code => (
                          <span
                            key={code}
                            className="font-mono text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200/80"
                          >
                            {code}
                          </span>
                        ))}
                        {assignedCourses.length > 4 && (
                          <span className="text-[10px] font-bold text-slate-400 self-center">
                            +{assignedCourses.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3.5 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-bold text-emerald-700 text-[11px]">Available</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectFaculty(fac)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-100/80 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditFaculty(fac)}
                      className="p-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Edit Faculty Record"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= VIEW 2: TABLE VIEW ================= */
        <div className="glass-card rounded-3xl border border-white/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#101B3C] text-white text-[11px] font-bold">
                  <th className="p-3.5 pl-5">Faculty Name</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Designation</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5 text-center">Workload</th>
                  <th className="p-3.5">Assigned Courses</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {paginatedFaculty.map(fac => {
                  const assigned = getFacultyCourses(fac.name);
                  const colors = getDeptColor(fac.department);
                  return (
                    <tr key={fac.id} className="hover:bg-slate-50/70 transition-colors">
                      <td
                        onClick={() => onSelectFaculty(fac)}
                        className="p-3.5 pl-5 font-black text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl ${colors.bg} ${colors.text} font-black text-xs flex items-center justify-center shrink-0 border ${colors.border}`}>
                            {getInitials(fac.name)}
                          </div>
                          <div>
                            <div>{fac.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal font-mono">{fac.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-slate-800">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {fac.department}
                        </span>
                      </td>

                      <td className="p-3.5 font-semibold text-slate-700">{fac.designation}</td>

                      <td className="p-3.5 font-mono text-[11px] text-slate-500">{fac.email}</td>

                      <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                        {fac.weeklyWorkloadHours}h / {fac.maxWorkloadHours}h
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {assigned.slice(0, 3).map(c => (
                            <span key={c} className="font-mono text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                              {c}
                            </span>
                          ))}
                          {assigned.length > 3 && (
                            <span className="text-[10px] text-slate-400">+{assigned.length - 3}</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Available
                        </span>
                      </td>

                      <td className="p-3.5 text-right pr-5 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectFaculty(fac)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditFaculty(fac)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
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
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-white text-slate-700 font-bold text-xs disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/70'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-white text-slate-700 font-bold text-xs disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

