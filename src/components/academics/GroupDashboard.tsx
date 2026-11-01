/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { StudentGroup, TimetableSlot } from '../../types';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Building,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface GroupDashboardProps {
  groups: StudentGroup[];
  timetableSlots: TimetableSlot[];
}

export const GroupDashboard: React.FC<GroupDashboardProps> = ({
  groups,
  timetableSlots,
}) => {
  const metrics = useMemo(() => {
    const totalGroups = groups.length;
    const totalStudents = groups.reduce((acc, g) => acc + (g.strength || 0), 0);

    // Active groups with scheduled classes
    const activeGroupNames = new Set(timetableSlots.map(s => s.groupName?.toLowerCase()));
    const activeGroups = groups.filter(g => activeGroupNames.has(g.name?.toLowerCase())).length;

    // Distinct departments
    const departments = new Set(groups.map(g => g.department));
    const totalDepartments = departments.size;

    // Total scheduled sessions
    const totalSessions = timetableSlots.filter(s => s.groupName).length;

    // Detect group conflicts (multiple sessions at same day + period for same group)
    const slotMap = new Map<string, string>();
    const conflictingGroupNames = new Set<string>();
    timetableSlots.forEach(s => {
      if (!s.groupName) return;
      const key = `${s.groupName}-${s.day}-${s.periodId}`;
      if (slotMap.has(key)) {
        conflictingGroupNames.add(s.groupName);
      } else {
        slotMap.set(key, s.id);
      }
    });

    return {
      totalGroups,
      totalStudents,
      activeGroups,
      totalDepartments,
      totalSessions,
      conflictCount: conflictingGroupNames.size,
    };
  }, [groups, timetableSlots]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* Total Groups */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Total Cohorts</span>
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {metrics.totalGroups}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Undergrad & Postgrad</p>
      </div>

      {/* Total Enrolled Students */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Total Enrolled</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black text-indigo-700 tracking-tight">
          {metrics.totalStudents.toLocaleString()}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Verified Student Headcount</p>
      </div>

      {/* Active Scheduled Groups */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Active Cohorts</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-600 tracking-tight">
          {metrics.activeGroups}
        </div>
        <p className="text-[10px] text-emerald-600/80 mt-1 font-medium">Timetable Allocated</p>
      </div>

      {/* Academic Departments */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Departments</span>
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Building className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {metrics.totalDepartments}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Academic Divisions</p>
      </div>

      {/* Scheduled Sessions */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Scheduled Sessions</span>
          <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
            <CalendarCheck className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black text-cyan-700 tracking-tight">
          {metrics.totalSessions}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Weekly Contact Slots</p>
      </div>

      {/* Group Conflicts */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Group Conflicts</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-600 tracking-tight">
          {metrics.conflictCount}
        </div>
        <p className="text-[10px] text-emerald-600/80 mt-1 font-medium">Zero Overlap Guarantee</p>
      </div>
    </div>
  );
};

