/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { StudentGroup, Course, TimetableSlot, FacultyMember } from '../../types';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Building,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  Layers,
  FlaskConical,
  Zap,
  ArrowRight
} from 'lucide-react';

interface AcademicsAnalyticsProps {
  groups: StudentGroup[];
  courses: Course[];
  timetableSlots: TimetableSlot[];
  facultyList: FacultyMember[];
  onSelectGroup: (group: StudentGroup) => void;
  onSelectCourse: (course: Course) => void;
}

export const AcademicsAnalytics: React.FC<AcademicsAnalyticsProps> = ({
  groups,
  courses,
  timetableSlots,
  facultyList,
  onSelectGroup,
  onSelectCourse,
}) => {
  // Department-wise distribution
  const departmentMetrics = useMemo(() => {
    const map: Record<
      string,
      { groupsCount: number; studentCount: number; coursesCount: number; sessionsCount: number }
    > = {};

    groups.forEach(g => {
      const dept = g.department;
      if (!map[dept]) {
        map[dept] = { groupsCount: 0, studentCount: 0, coursesCount: 0, sessionsCount: 0 };
      }
      map[dept].groupsCount += 1;
      map[dept].studentCount += g.strength || 0;
    });

    courses.forEach(c => {
      // Find matching dept or normalize
      const dept = Object.keys(map).find(k => k.toLowerCase().includes(c.department.toLowerCase())) || c.department;
      if (!map[dept]) {
        map[dept] = { groupsCount: 0, studentCount: 0, coursesCount: 0, sessionsCount: 0 };
      }
      map[dept].coursesCount += 1;
    });

    timetableSlots.forEach(s => {
      const grp = groups.find(g => g.name.toLowerCase() === s.groupName?.toLowerCase());
      if (grp && map[grp.department]) {
        map[grp.department].sessionsCount += 1;
      }
    });

    return Object.entries(map).map(([dept, data]) => ({
      department: dept,
      ...data,
      avgGroupSize: data.groupsCount > 0 ? Math.round(data.studentCount / data.groupsCount) : 0,
    }));
  }, [groups, courses, timetableSlots]);

  // Course types distribution
  const courseTypeMetrics = useMemo(() => {
    const lectures = courses.filter(c => c.type === 'Lecture').length;
    const labs = courses.filter(c => c.type === 'Lab').length;
    const tutorials = courses.filter(c => c.type === 'Tutorial').length;
    const total = courses.length || 1;

    return {
      lectures,
      labs,
      tutorials,
      lecturesPct: Math.round((lectures / total) * 100),
      labsPct: Math.round((labs / total) * 100),
      tutorialsPct: Math.round((tutorials / total) * 100),
    };
  }, [courses]);

  // Summary KPIs
  const overallKPIs = useMemo(() => {
    const totalStudents = groups.reduce((acc, g) => acc + (g.strength || 0), 0);
    const avgGroupSize = groups.length > 0 ? (totalStudents / groups.length).toFixed(1) : '0';

    const activeCourseCodes = new Set(timetableSlots.map(s => s.courseCode?.toUpperCase()));
    const scheduledCoursesCount = courses.filter(c => activeCourseCodes.has(c.code.toUpperCase())).length;
    const syllabusCoverage = courses.length > 0 ? Math.round((scheduledCoursesCount / courses.length) * 100) : 100;

    const totalSessions = timetableSlots.length;
    const avgSessionsPerGroup = groups.length > 0 ? (totalSessions / groups.length).toFixed(1) : '0';

    return {
      totalStudents,
      avgGroupSize,
      syllabusCoverage,
      scheduledCoursesCount,
      totalSessions,
      avgSessionsPerGroup,
    };
  }, [groups, courses, timetableSlots]);

  // Group utilization ranking (weekly sessions)
  const groupUtilization = useMemo(() => {
    const map = new Map<string, number>();
    timetableSlots.forEach(s => {
      if (!s.groupName) return;
      map.set(s.groupName.toLowerCase(), (map.get(s.groupName.toLowerCase()) || 0) + 1);
    });

    return groups.map(g => {
      const sessions = map.get(g.name.toLowerCase()) || 0;
      const targetWeeklyHours = 24; // Standard contact benchmark
      const pct = Math.round((sessions / targetWeeklyHours) * 100);
      return {
        group: g,
        sessions,
        utilizationPct: pct,
      };
    }).sort((a, b) => b.sessions - a.sessions);
  }, [groups, timetableSlots]);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Total Enrolled Headcount</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {overallKPIs.totalStudents.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">students</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Avg {overallKPIs.avgGroupSize} students / section
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Curriculum Timetable Coverage</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 tracking-tight">
              {overallKPIs.syllabusCoverage}%
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({overallKPIs.scheduledCoursesCount}/{courses.length} courses)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2">
            Fully mapped into active timetable
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Weekly Class Sessions</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {overallKPIs.totalSessions}
            </span>
            <span className="text-xs font-semibold text-slate-500">slots / week</span>
          </div>
          <p className="text-[11px] text-purple-700 font-semibold mt-2">
            Avg {overallKPIs.avgSessionsPerGroup} slots per student group
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Theory vs Practical Ratio</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {courseTypeMetrics.lecturesPct}:{courseTypeMetrics.labsPct}
            </span>
            <span className="text-xs font-semibold text-slate-500">Lec / Lab %</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2">
            {courseTypeMetrics.labs} Hands-on workshops scheduled
          </p>
        </div>
      </div>

      {/* Department Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Departmental Student & Course Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of student cohorts, total headcount enrollment, and active curricula by academic division.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentMetrics.map(dept => (
            <div
              key={dept.department}
              className="p-5 rounded-3xl bg-white/85 border border-white/80 shadow-xl shadow-blue-950/5 backdrop-blur-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {dept.department.split(' ')[0]}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {dept.groupsCount} Cohorts
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 truncate" title={dept.department}>
                  {dept.department}
                </h4>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500">Enrolled Students:</span>
                    <strong className="text-slate-900 font-bold">{dept.studentCount.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500">Curriculum Courses:</span>
                    <strong className="text-slate-900 font-bold">{dept.coursesCount}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500">Weekly Contact Slots:</span>
                    <strong className="text-blue-700 font-bold">{dept.sessionsCount}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Avg Cohort Size:</span>
                <strong className="text-slate-800">{dept.avgGroupSize} students</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cohort Weekly Load & Utilization Matrix */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Student Section Schedule Saturation & Contact Load
            </h4>
            <p className="text-xs text-slate-500">
              Comparison of scheduled classroom contact hours against the 24-hour weekly academic curriculum target.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
            {groups.length} Academic Cohorts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3.5 pl-5">Cohort Name</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-center">Semester</th>
                <th className="p-3.5 text-center">Enrolled</th>
                <th className="p-3.5 min-w-[200px]">Weekly Contact Load (Target: 24 hrs)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupUtilization.map(item => {
                const isOptimal = item.utilizationPct >= 80 && item.utilizationPct <= 110;
                const isHeavy = item.utilizationPct > 110;

                return (
                  <tr key={item.group.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-extrabold text-slate-900">{item.group.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {item.group.id}</div>
                    </td>

                    <td className="p-3.5 font-medium text-slate-700">
                      {item.group.department}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Sem {item.group.semester}
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-bold text-slate-800">
                      {item.group.strength}
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-slate-800">{item.sessions} / 24 hrs</span>
                          <span className={isHeavy ? 'text-rose-600 font-bold' : isOptimal ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                            {item.utilizationPct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isHeavy ? 'bg-rose-500' : isOptimal ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(item.utilizationPct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      {isHeavy ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          Heavy Load
                        </span>
                      ) : isOptimal ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Optimal
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Light Load
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => onSelectGroup(item.group)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Inspect
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

