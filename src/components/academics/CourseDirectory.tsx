/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Course, TimetableSlot, FacultyMember, StudentGroup } from '../../types';
import {
  BookOpen,
  LayoutGrid,
  List,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  Users,
  Building,
  GraduationCap,
  FlaskConical,
  Layers,
  Edit,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CourseDirectoryProps {
  courses: Course[];
  timetableSlots: TimetableSlot[];
  facultyList: FacultyMember[];
  studentGroups: StudentGroup[];
  onSelectCourse: (course: Course) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse?: (id: string) => void;
}

export const CourseDirectory: React.FC<CourseDirectoryProps> = ({
  courses,
  timetableSlots,
  facultyList,
  studentGroups,
  onSelectCourse,
  onEditCourse,
  onDeleteCourse,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCredits, setSelectedCredits] = useState('All');
  const [sortBy, setSortBy] = useState<'code' | 'title' | 'credits-desc' | 'hours-desc'>('code');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 8 : 10;

  // Department options
  const departmentOptions = useMemo(() => {
    const set = new Set(courses.map(c => c.department));
    return ['All', ...Array.from(set)];
  }, [courses]);

  // Course mappings: code -> assigned faculty, enrolled groups, session count
  const courseStatsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        facultyNames: Set<string>;
        groupNames: Set<string>;
        sessionsCount: number;
        rooms: Set<string>;
      }
    >();

    courses.forEach(c => {
      map.set(c.code.toUpperCase(), {
        facultyNames: new Set(),
        groupNames: new Set(),
        sessionsCount: 0,
        rooms: new Set(),
      });
    });

    timetableSlots.forEach(s => {
      if (!s.courseCode) return;
      const key = s.courseCode.toUpperCase();
      const stats = map.get(key);
      if (stats) {
        stats.sessionsCount += 1;
        if (s.facultyName) stats.facultyNames.add(s.facultyName);
        if (s.groupName) stats.groupNames.add(s.groupName);
        if (s.roomName) stats.rooms.add(s.roomName);
      }
    });

    return map;
  }, [courses, timetableSlots]);

  // Filter & Sort
  const filteredCourses = useMemo(() => {
    return courses
      .filter(c => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCode = c.code.toLowerCase().includes(q);
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchDept = c.department.toLowerCase().includes(q);
          const stats = courseStatsMap.get(c.code.toUpperCase());
          const matchFaculty = stats && Array.from(stats.facultyNames).some(f => f.toLowerCase().includes(q));
          if (!matchCode && !matchTitle && !matchDept && !matchFaculty) return false;
        }

        // Dept filter
        if (selectedDept !== 'All' && c.department !== selectedDept) return false;

        // Type filter
        if (selectedType !== 'All' && c.type !== selectedType) return false;

        // Credits filter
        if (selectedCredits !== 'All' && c.credits.toString() !== selectedCredits) return false;

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'code':
            return a.code.localeCompare(b.code);
          case 'title':
            return a.title.localeCompare(b.title);
          case 'credits-desc':
            return b.credits - a.credits;
          case 'hours-desc':
            return b.weeklyHours - a.weeklyHours;
          default:
            return 0;
        }
      });
  }, [courses, searchQuery, selectedDept, selectedType, selectedCredits, sortBy, courseStatsMap]);

  // Pagination slice
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  const currentCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(start, start + itemsPerPage);
  }, [filteredCourses, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedType('All');
    setSelectedCredits('All');
    setSortBy('code');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="p-4 md:p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Curriculum Course Catalog
              </h3>
              <p className="text-[11px] text-slate-500">
                Showing {filteredCourses.length} of {courses.length} verified academic courses
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
              placeholder="Search course code, title, faculty..."
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

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300/80 bg-white text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedType}
              onChange={e => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="All">All Course Types</option>
              <option value="Lecture">Lecture (Theory)</option>
              <option value="Lab">Laboratory</option>
              <option value="Tutorial">Tutorial</option>
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
              <option value="code">Sort: Code (A-Z)</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="credits-desc">Sort: Credits (High-Low)</option>
              <option value="hours-desc">Sort: Hours/Wk (High-Low)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Reset */}
        {(searchQuery || selectedDept !== 'All' || selectedType !== 'All' || selectedCredits !== 'All') && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Filtered to <strong className="text-slate-800">{filteredCourses.length}</strong> matching courses
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

      {/* Course List / Grid */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/70 border border-slate-200/80 shadow-xs backdrop-blur-md">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No Courses Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to view all catalog courses.
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
          {currentCourses.map(course => {
            const stats = courseStatsMap.get(course.code.toUpperCase());
            const facultyCount = stats?.facultyNames.size || 0;
            const groupsCount = stats?.groupNames.size || 0;
            const sessionsCount = stats?.sessionsCount || 0;
            const isLab = course.type === 'Lab';

            return (
              <div
                key={course.id || course.code}
                onClick={() => onSelectCourse(course)}
                className="group relative rounded-3xl bg-white/85 border border-white/80 p-5 shadow-xl shadow-blue-950/5 hover:shadow-2xl hover:shadow-blue-950/10 hover:border-blue-300/80 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge Strip */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        isLab
                          ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {course.type}
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {course.credits} Credits
                    </span>
                  </div>

                  {/* Course Code & Title */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-black text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                        {course.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {course.department}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mt-1">
                      {course.title}
                    </h4>
                  </div>

                  {/* Stats Strip */}
                  <div className="space-y-1.5 py-2.5 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        Weekly Contact:
                      </span>
                      <strong className="text-slate-900 font-bold">{course.weeklyHours} hrs/wk</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                        Instructors:
                      </span>
                      <strong className="text-slate-900 font-bold">
                        {facultyCount > 0 ? `${facultyCount} Assigned` : 'Pending'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5 text-purple-500" />
                        Enrolled Cohorts:
                      </span>
                      <strong className="text-slate-900 font-bold">
                        {groupsCount} Sections
                      </strong>
                    </div>
                  </div>

                  {/* Groups preview pills */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {stats && stats.groupNames.size > 0 ? (
                        Array.from(stats.groupNames).slice(0, 3).map(g => (
                          <span key={g} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {g}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No sections mapped</span>
                      )}
                      {stats && stats.groupNames.size > 3 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                          +{stats.groupNames.size - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {sessionsCount} scheduled
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onEditCourse(course);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit Course"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteCourse && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteCourse(course.id || course.code);
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Course"
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
                  <th className="p-3.5 pl-5">Course Code</th>
                  <th className="p-3.5">Course Title</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5 text-center">Type</th>
                  <th className="p-3.5 text-center">Credits</th>
                  <th className="p-3.5 text-center">Weekly Hours</th>
                  <th className="p-3.5">Assigned Faculty</th>
                  <th className="p-3.5">Enrolled Sections</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentCourses.map(course => {
                  const stats = courseStatsMap.get(course.code.toUpperCase());
                  const facultyCount = stats?.facultyNames.size || 0;
                  const groupsCount = stats?.groupNames.size || 0;
                  const isLab = course.type === 'Lab';

                  return (
                    <tr
                      key={course.id || course.code}
                      onClick={() => onSelectCourse(course)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5 pl-5">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {course.code}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-slate-900 group-hover:text-blue-600 transition-colors max-w-xs truncate">
                        {course.title}
                      </td>

                      <td className="p-3.5 font-medium text-slate-700">
                        {course.department}
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isLab
                              ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {course.type}
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-bold text-slate-800">
                        {course.credits}
                      </td>

                      <td className="p-3.5 text-center font-bold text-slate-700">
                        {course.weeklyHours}h/wk
                      </td>

                      <td className="p-3.5">
                        {stats && stats.facultyNames.size > 0 ? (
                          <span className="font-semibold text-slate-800 truncate block max-w-[130px]" title={Array.from(stats.facultyNames).join(', ')}>
                            {Array.from(stats.facultyNames)[0]}
                            {stats.facultyNames.size > 1 && ` (+${stats.facultyNames.size - 1})`}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          {stats && stats.groupNames.size > 0 ? (
                            Array.from(stats.groupNames).slice(0, 2).map(g => (
                              <span key={g} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                {g}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">None</span>
                          )}
                          {groupsCount > 2 && (
                            <span className="text-[10px] text-slate-500 font-medium">+{groupsCount - 2}</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <div className="inline-flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectCourse(course)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onEditCourse(course)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteCourse && (
                            <button
                              onClick={() => onDeleteCourse(course.id || course.code)}
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

