/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { StudentGroup, TimetableSlot, Course } from '../../types';
import {
  Users,
  LayoutGrid,
  List,
  Search,
  Filter,
  ArrowUpDown,
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
  AlertCircle,
  GraduationCap,
  Building,
  UserCheck
} from 'lucide-react';

interface GroupDirectoryProps {
  groups: StudentGroup[];
  timetableSlots: TimetableSlot[];
  courses: Course[];
  onSelectGroup: (group: StudentGroup) => void;
  onEditGroup: (group: StudentGroup) => void;
  onDeleteGroup?: (id: string) => void;
  onViewTimetable?: (group: StudentGroup) => void;
}

export const GroupDirectory: React.FC<GroupDirectoryProps> = ({
  groups,
  timetableSlots,
  courses,
  onSelectGroup,
  onEditGroup,
  onDeleteGroup,
  onViewTimetable,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'semester' | 'strength-desc' | 'sessions-desc'>('name');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 8 : 10;

  // Department options
  const departmentOptions = useMemo(() => {
    const set = new Set(groups.map(g => g.department));
    return ['All', ...Array.from(set)];
  }, [groups]);

  // Semester options
  const semesterOptions = useMemo(() => {
    const set = new Set(groups.map(g => g.semester.toString()));
    return ['All', ...Array.from(set).sort((a, b) => Number(a) - Number(b))];
  }, [groups]);

  // Group statistics mapping: groupId -> sessions, assigned courses
  const groupStatsMap = useMemo(() => {
    const map = new Map<
      string,
      { sessionsCount: number; courseCodes: Set<string>; rooms: Set<string> }
    >();

    groups.forEach(g => {
      map.set(g.name.toLowerCase(), {
        sessionsCount: 0,
        courseCodes: new Set(),
        rooms: new Set(),
      });
    });

    timetableSlots.forEach(s => {
      if (!s.groupName) return;
      const key = s.groupName.toLowerCase();
      const stats = map.get(key);
      if (stats) {
        stats.sessionsCount += 1;
        if (s.courseCode) stats.courseCodes.add(s.courseCode);
        if (s.roomName) stats.rooms.add(s.roomName);
      }
    });

    return map;
  }, [groups, timetableSlots]);

  // Filter and sort groups
  const filteredGroups = useMemo(() => {
    return groups
      .filter(g => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = g.name.toLowerCase().includes(q);
          const matchDept = g.department.toLowerCase().includes(q);
          const matchRep = g.classRepresentative?.toLowerCase().includes(q);
          const matchId = g.id.toLowerCase().includes(q);
          if (!matchName && !matchDept && !matchRep && !matchId) return false;
        }

        // Dept filter
        if (selectedDept !== 'All' && g.department !== selectedDept) return false;

        // Semester filter
        if (selectedSemester !== 'All' && g.semester.toString() !== selectedSemester) return false;

        return true;
      })
      .sort((a, b) => {
        const statsA = groupStatsMap.get(a.name.toLowerCase());
        const statsB = groupStatsMap.get(b.name.toLowerCase());

        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'semester':
            return a.semester - b.semester;
          case 'strength-desc':
            return b.strength - a.strength;
          case 'sessions-desc':
            return (statsB?.sessionsCount || 0) - (statsA?.sessionsCount || 0);
          default:
            return 0;
        }
      });
  }, [groups, searchQuery, selectedDept, selectedSemester, sortBy, groupStatsMap]);

  // Pagination slice
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage) || 1;
  const currentGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGroups.slice(start, start + itemsPerPage);
  }, [filteredGroups, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedSemester('All');
    setSortBy('name');
    setCurrentPage(1);
  };

  // Department color helper
  const getDeptColor = (dept: string) => {
    if (dept.toLowerCase().includes('computer')) return 'from-blue-600 to-indigo-600';
    if (dept.toLowerCase().includes('electronics')) return 'from-purple-600 to-indigo-600';
    if (dept.toLowerCase().includes('mechanical')) return 'from-teal-600 to-emerald-600';
    if (dept.toLowerCase().includes('civil')) return 'from-amber-600 to-orange-600';
    return 'from-sky-600 to-blue-700';
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="p-4 md:p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Student Cohort Directory
              </h3>
              <p className="text-[11px] text-slate-500">
                Showing {filteredGroups.length} of {groups.length} registered academic sections
              </p>
            </div>
          </div>

          {/* View Toggle */}
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
              placeholder="Search by group name, class rep, dept..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300/80 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300/80 bg-white text-xs">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedDept}
              onChange={e => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer truncate"
            >
              {departmentOptions.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300/80 bg-white text-xs">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedSemester}
              onChange={e => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="All">All Semesters</option>
              {semesterOptions.filter(s => s !== 'All').map(sem => (
                <option key={sem} value={sem}>
                  Semester {sem}
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
              <option value="name">Sort: Name (A-Z)</option>
              <option value="semester">Sort: Semester (1-8)</option>
              <option value="strength-desc">Sort: Strength (High-Low)</option>
              <option value="sessions-desc">Sort: Sessions (Most First)</option>
            </select>
          </div>
        </div>

        {/* Active filter count & clear */}
        {(searchQuery || selectedDept !== 'All' || selectedSemester !== 'All') && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Filtered to <strong className="text-slate-800">{filteredGroups.length}</strong> matching sections
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

      {/* Directory Content (Grid / Table) */}
      {filteredGroups.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/70 border border-slate-200/80 shadow-xs backdrop-blur-md">
          <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No Student Cohorts Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, department, or semester filter to locate the desired student section.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentGroups.map(group => {
            const stats = groupStatsMap.get(group.name.toLowerCase());
            const sessionsCount = stats?.sessionsCount || 0;
            const coursesCount = stats?.courseCodes.size || 0;
            const academicYear = Math.ceil(group.semester / 2);

            return (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className="group relative rounded-3xl bg-white/85 border border-white/80 p-5 shadow-xl shadow-blue-950/5 hover:shadow-2xl hover:shadow-blue-950/10 hover:border-blue-300/80 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Header Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Semester {group.semester} • Year {academicYear}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {group.id}
                    </span>
                  </div>

                  {/* Group Avatar & Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getDeptColor(group.department)} text-white flex items-center justify-center font-black text-sm shadow-md shrink-0`}>
                      {group.name}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {group.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate" title={group.department}>
                        {group.department}
                      </p>
                    </div>
                  </div>

                  {/* Class Representative & Strength */}
                  <div className="space-y-1.5 py-2.5 border-y border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        Class Strength:
                      </span>
                      <strong className="text-slate-900 font-bold">{group.strength} students</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500 truncate">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Class Rep:
                      </span>
                      <span className="text-slate-800 font-semibold truncate max-w-[120px]" title={group.classRepresentative}>
                        {group.classRepresentative || 'Not Assigned'}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Courses preview */}
                  <div className="mt-3">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                      <span>Curriculum Subjects</span>
                      <span className="text-blue-600 font-bold">{coursesCount} courses</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {stats && stats.courseCodes.size > 0 ? (
                        Array.from(stats.courseCodes).slice(0, 3).map(code => (
                          <span key={code} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                            {code}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No assigned classes</span>
                      )}
                      {stats && stats.courseCodes.size > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium">
                          +{stats.courseCodes.size - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{sessionsCount} sessions/wk</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onEditGroup(group);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit Group"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteGroup && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteGroup(group.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Group"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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
                  <th className="p-3.5 pl-5">Cohort / Group</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Semester & Year</th>
                  <th className="p-3.5 text-center">Strength</th>
                  <th className="p-3.5">Class Representative</th>
                  <th className="p-3.5">Curriculum Courses</th>
                  <th className="p-3.5 text-center">Sessions</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentGroups.map(group => {
                  const stats = groupStatsMap.get(group.name.toLowerCase());
                  const sessionsCount = stats?.sessionsCount || 0;
                  const coursesCount = stats?.courseCodes.size || 0;
                  const academicYear = Math.ceil(group.semester / 2);

                  return (
                    <tr
                      key={group.id}
                      onClick={() => onSelectGroup(group)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getDeptColor(group.department)} text-white font-black text-xs flex items-center justify-center shrink-0`}>
                            {group.name}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {group.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {group.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-medium text-slate-700">
                        {group.department}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Sem {group.semester} • Yr {academicYear}
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-bold text-slate-800">
                        {group.strength}
                      </td>

                      <td className="p-3.5 font-semibold text-slate-700">
                        {group.classRepresentative || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          {stats && stats.courseCodes.size > 0 ? (
                            Array.from(stats.courseCodes).slice(0, 2).map(c => (
                              <span key={c} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">None</span>
                          )}
                          {coursesCount > 2 && (
                            <span className="text-[10px] text-slate-500 font-medium">+{coursesCount - 2}</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                          {sessionsCount} slots
                        </span>
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <div className="inline-flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectGroup(group)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onEditGroup(group)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteGroup && (
                            <button
                              onClick={() => onDeleteGroup(group.id)}
                              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

