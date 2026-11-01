/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FacultyMember, TimetableSlot } from '../../types';
import {
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Building,
  Users,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

interface FacultyWorkloadAnalyticsProps {
  facultyList: FacultyMember[];
  timetableSlots: TimetableSlot[];
  onSelectFaculty: (faculty: FacultyMember) => void;
}

export const FacultyWorkloadAnalytics: React.FC<FacultyWorkloadAnalyticsProps> = ({
  facultyList,
  timetableSlots,
  onSelectFaculty,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'heavy' | 'optimal' | 'light' | 'overload'>('all');

  // Compute departmental metrics
  const departmentMetrics = useMemo(() => {
    const map: Record<
      string,
      { count: number; totalHours: number; maxHours: number; sessions: number }
    > = {};

    facultyList.forEach(f => {
      const dept = f.department;
      if (!map[dept]) {
        map[dept] = { count: 0, totalHours: 0, maxHours: 0, sessions: 0 };
      }
      map[dept].count += 1;
      map[dept].totalHours += f.weeklyWorkloadHours;
      map[dept].maxHours += f.maxWorkloadHours;
    });

    timetableSlots.forEach(s => {
      // Find faculty department
      const fac = facultyList.find(f => f.name.toLowerCase() === s.facultyName.toLowerCase());
      if (fac && map[fac.department]) {
        map[fac.department].sessions += 1;
      }
    });

    return Object.entries(map).map(([dept, data]) => ({
      department: dept,
      facultyCount: data.count,
      avgHours: data.count > 0 ? (data.totalHours / data.count).toFixed(1) : '0',
      totalSessions: data.sessions,
      utilizationRate: data.maxHours > 0 ? Math.round((data.totalHours / data.maxHours) * 100) : 0,
    }));
  }, [facultyList, timetableSlots]);

  // Overall KPI metrics
  const overallMetrics = useMemo(() => {
    const totalFaculty = facultyList.length;
    if (totalFaculty === 0) {
      return { avgWorkload: '0', compliantCount: 0, complianceRate: 100, totalTeachingHours: 0, overloadedCount: 0 };
    }

    const totalHours = facultyList.reduce((acc, f) => acc + f.weeklyWorkloadHours, 0);
    const avgWorkload = (totalHours / totalFaculty).toFixed(1);
    const overloaded = facultyList.filter(f => f.weeklyWorkloadHours > f.maxWorkloadHours);
    const compliantCount = totalFaculty - overloaded.length;
    const complianceRate = Math.round((compliantCount / totalFaculty) * 100);

    return {
      avgWorkload,
      compliantCount,
      complianceRate,
      totalTeachingHours: totalHours,
      overloadedCount: overloaded.length,
    };
  }, [facultyList]);

  // Workload bands
  const bandCounts = useMemo(() => {
    let heavy = 0; // >= 16h
    let optimal = 0; // 12-15h
    let light = 0; // < 12h
    let overload = 0; // > 18h

    facultyList.forEach(f => {
      if (f.weeklyWorkloadHours > f.maxWorkloadHours) overload += 1;
      else if (f.weeklyWorkloadHours >= 16) heavy += 1;
      else if (f.weeklyWorkloadHours >= 12) optimal += 1;
      else light += 1;
    });

    return { heavy, optimal, light, overload };
  }, [facultyList]);

  // Filtered faculty ranking list
  const filteredFaculty = useMemo(() => {
    return facultyList
      .filter(f => {
        if (selectedDept !== 'All' && f.department !== selectedDept) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = f.name.toLowerCase().includes(q);
          const matchDept = f.department.toLowerCase().includes(q);
          const matchDesignation = f.designation.toLowerCase().includes(q);
          if (!matchName && !matchDept && !matchDesignation) return false;
        }
        if (statusFilter === 'overload') return f.weeklyWorkloadHours > f.maxWorkloadHours;
        if (statusFilter === 'heavy') return f.weeklyWorkloadHours >= 16 && f.weeklyWorkloadHours <= f.maxWorkloadHours;
        if (statusFilter === 'optimal') return f.weeklyWorkloadHours >= 12 && f.weeklyWorkloadHours < 16;
        if (statusFilter === 'light') return f.weeklyWorkloadHours < 12;
        return true;
      })
      .sort((a, b) => b.weeklyWorkloadHours - a.weeklyWorkloadHours);
  }, [facultyList, selectedDept, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Average Workload</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {overallMetrics.avgWorkload}
            </span>
            <span className="text-xs font-semibold text-slate-500">hrs / week</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Optimal balance across 5 departments
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>UGC Policy Compliance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700 tracking-tight">
              {overallMetrics.complianceRate}%
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({overallMetrics.compliantCount}/{facultyList.length})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2">
            Standard &le; 18 contact hours/week statutory limit
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Total Contact Hours</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {overallMetrics.totalTeachingHours}
            </span>
            <span className="text-xs font-semibold text-slate-500">weekly hours</span>
          </div>
          <p className="text-[11px] text-purple-700 font-semibold mt-2">
            Distributed over {timetableSlots.length} scheduled sessions
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Workload Health Band</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-100/80 text-cyan-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {bandCounts.optimal}
            </span>
            <span className="text-xs font-semibold text-slate-500">in optimal band</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2">
            {bandCounts.heavy} near cap • {overallMetrics.overloadedCount} overloaded
          </p>
        </div>
      </div>

      {/* Department Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Departmental Workload Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Average teaching load and curriculum session distribution across academic units.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {departmentMetrics.map(dept => (
            <div
              key={dept.department}
              onClick={() => setSelectedDept(dept.department === selectedDept ? 'All' : dept.department)}
              className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                selectedDept === dept.department
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20 scale-[1.02]'
                  : 'bg-white/80 border-slate-200/80 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${selectedDept === dept.department ? 'text-blue-200' : 'text-slate-500'}`}>
                  {dept.department.split(' ')[0]}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  selectedDept === dept.department
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {dept.facultyCount} faculty
                </span>
              </div>

              <h4 className={`text-sm font-bold truncate ${selectedDept === dept.department ? 'text-white' : 'text-slate-900'}`} title={dept.department}>
                {dept.department}
              </h4>

              <div className="mt-3 pt-3 border-t border-slate-200/40 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className={selectedDept === dept.department ? 'text-blue-100' : 'text-slate-500'}>
                    Avg Workload:
                  </span>
                  <span className={`font-bold ${selectedDept === dept.department ? 'text-white' : 'text-slate-900'}`}>
                    {dept.avgHours} hrs/wk
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className={selectedDept === dept.department ? 'text-blue-100' : 'text-slate-500'}>
                    Sessions:
                  </span>
                  <span className={`font-semibold ${selectedDept === dept.department ? 'text-blue-200' : 'text-slate-600'}`}>
                    {dept.totalSessions} classes
                  </span>
                </div>

                {/* Mini progress */}
                <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${selectedDept === dept.department ? 'bg-white' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(dept.utilizationRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Faculty Workload Ranking Table */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Instructor Workload Audit & Utilization Ranking
            </h4>
            <p className="text-xs text-slate-500">
              Review individual faculty teaching hours against the 18 hrs statutory cap.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search faculty, dept..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              {Array.from(new Set(facultyList.map(f => f.department))).map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Workload Bands</option>
              <option value="heavy">Heavy (&ge; 16h)</option>
              <option value="optimal">Optimal (12-15h)</option>
              <option value="light">Light (&lt; 12h)</option>
              <option value="overload">Overloaded (&gt; 18h)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3.5 pl-5">Instructor Name</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Designation</th>
                <th className="p-3.5 min-w-[200px]">Weekly Contact Load</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No faculty match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map(faculty => {
                  const ratio = Math.round((faculty.weeklyWorkloadHours / faculty.maxWorkloadHours) * 100);
                  const isOverload = faculty.weeklyWorkloadHours > faculty.maxWorkloadHours;
                  const isHeavy = faculty.weeklyWorkloadHours >= 16 && !isOverload;

                  return (
                    <tr key={faculty.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {faculty.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => onSelectFaculty(faculty)}>
                              {faculty.name}
                            </div>
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

                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span className="text-slate-800">
                              {faculty.weeklyWorkloadHours} / {faculty.maxWorkloadHours} hrs
                            </span>
                            <span className={isOverload ? 'text-rose-600 font-bold' : isHeavy ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                              {ratio}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isOverload
                                  ? 'bg-rose-500'
                                  : isHeavy
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(ratio, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        {isOverload ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Overload
                          </span>
                        ) : isHeavy ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Near Limit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Compliant
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <button
                          onClick={() => onSelectFaculty(faculty)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          Inspect
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

