/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_ANALYTICS } from '../../data/mockData';
import {
  GlassCard,
  StatCard,
  ChartCard,
  StatusBadge,
  GlassButton
} from '../ui/glass';
import {
  Building2,
  Users,
  Layers,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  PlusCircle,
  FileText,
  Activity,
  Cpu,
  ChevronRight,
  TrendingUp,
  Sliders,
  Calendar,
  Send,
  Download,
  ShieldCheck,
  Zap,
  BarChart3,
  MapPin
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    setActiveNavigation,
    bookingRequests,
    rescheduleRequests,
    disruptions,
    setIsDemoNoticeOpen,
    rooms,
    faculty,
    studentGroups,
    courses,
    timetableSlots,
    academicTerm,
    generateTimetableSchedule,
    isLoadingData
  } = useApp();

  const pendingBookings = bookingRequests.filter(b => b.status === 'Pending');
  const activeDisruptions = disruptions.filter(d => d.status !== 'Rescheduled');

  // Format today's date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="space-y-6">
      
      {/* 1. CAMPUS GLASS HERO HEADER BANNER */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-6 sm:p-8 text-white bg-gradient-to-br from-[#101B3C] via-[#14264D] to-[#1E3A5F]">
        {/* Visual atmospheric background lighting & glow accents */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 top-0 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            {/* Institution Badge & Term Indicators */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-cyan-300 border border-white/20 backdrop-blur-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Central Operations Console</span>
              </span>
              <span className="text-slate-300 text-xs">• Chilika Institute of Technology</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Academic Year 2026 - 2027
              </span>
            </div>

            {/* Welcome Heading */}
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {currentUser?.name || 'Dean of Academics'}
            </h1>

            {/* Subtext and Date Pill */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{todayFormatted}</span>
              </span>
              <span>•</span>
              <span className="text-cyan-300 font-semibold">{academicTerm}</span>
              <span>•</span>
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OR-Tools CP-SAT Active</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300/90 max-w-2xl leading-relaxed pt-1">
              Autonomous constraint optimization engine monitoring campus capacity, timetable integrity, venue pipelines, and examination seating.
            </p>
          </div>

          {/* Quick Action Button Hub */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <GlassButton
              variant="primary"
              size="md"
              glow
              icon={<Cpu className="w-4 h-4" />}
              onClick={() => setActiveNavigation('timetable', 'generator')}
            >
              Run CP-SAT Solver
            </GlassButton>

            <GlassButton
              variant="glass"
              size="md"
              icon={<CalendarCheck className="w-4 h-4 text-amber-300" />}
              onClick={() => setActiveNavigation('venues', 'requests')}
              className="text-white hover:bg-white/20"
            >
              Review Bookings ({pendingBookings.length})
            </GlassButton>
          </div>
        </div>
      </div>

      {/* 2. FIVE PRIMARY METRICS (STATISTICS CARDS) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
              Academic Reference Dataset (CIT Campus)
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20">
              Live State
            </span>
          </div>

          <button
            onClick={() => setIsDemoNoticeOpen(true)}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Architecture Specs</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* 5 Statistics Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          {/* Total Rooms: 27 */}
          <StatCard
            title="Total Rooms"
            value={rooms.length || MOCK_ANALYTICS.totalRooms}
            subtitle="27 Academic Halls & Labs"
            icon={<Building2 className="w-5 h-5" />}
            iconColor="blue"
            onClick={() => setActiveNavigation('venues', 'booking')}
          />

          {/* Total Faculty: 40 */}
          <StatCard
            title="Total Faculty"
            value={faculty.length || MOCK_ANALYTICS.facultyMembers}
            subtitle="40 Active Instructors"
            icon={<Users className="w-5 h-5" />}
            iconColor="purple"
            onClick={() => setActiveNavigation('timetable', 'faculty')}
          />

          {/* Student Groups: 14 */}
          <StatCard
            title="Student Groups"
            value={studentGroups.length || MOCK_ANALYTICS.studentGroups}
            subtitle="14 Registered Batches"
            icon={<Layers className="w-5 h-5" />}
            iconColor="cyan"
            onClick={() => setActiveNavigation('timetable', 'group')}
          />

          {/* Courses: 62 */}
          <StatCard
            title="Courses"
            value={courses.length || MOCK_ANALYTICS.courses}
            subtitle="62 Curricula Syllabi"
            icon={<BookOpen className="w-5 h-5" />}
            iconColor="orange"
            onClick={() => setActiveNavigation('admin', 'upload')}
          />

          {/* Sessions: 189 */}
          <StatCard
            title="Weekly Sessions"
            value={MOCK_ANALYTICS.teachingSessions}
            subtitle="185 Scheduled • 4 Electives"
            icon={<CalendarCheck className="w-5 h-5" />}
            iconColor="green"
            onClick={() => setActiveNavigation('timetable', 'weekly')}
            className="col-span-2 sm:col-span-1"
          />

        </div>
      </div>

      {/* 3. QUICK ACTIONS HUB (6 Actions) */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 mb-3.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Quick Action Hub
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Common Operations</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => setActiveNavigation('timetable', 'generator')}
            className="p-3 rounded-xl bg-white/60 hover:bg-white border border-white/80 shadow-2xs hover:shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-slate-900 text-xs">Generate Timetable</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Run CP-SAT solver</div>
          </button>

          <button
            onClick={() => setActiveNavigation('venues', 'booking')}
            className="p-3 rounded-xl bg-white/60 hover:bg-white border border-white/80 shadow-2xs hover:shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-slate-900 text-xs">Book Venue</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Reserve halls & labs</div>
          </button>

          <button
            onClick={() => setActiveNavigation('ai', 'booking')}
            className="p-3 rounded-xl bg-white/60 hover:bg-white border border-white/80 shadow-2xs hover:shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-slate-900 text-xs">Ask AI Assistant</div>
            <div className="text-[10px] text-slate-500 mt-0.5">NL scheduling & search</div>
          </button>

          <button
            onClick={() => setActiveNavigation('analytics', 'utilization')}
            className="p-3 rounded-xl bg-white/60 hover:bg-white border border-white/80 shadow-2xs hover:shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-slate-900 text-xs">View Analytics</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Workload & capacity</div>
          </button>

          <button
            onClick={() => setActiveNavigation('admin', 'settings')}
            className="p-3 rounded-xl bg-white/60 hover:bg-white border border-white/80 shadow-2xs hover:shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-500/10 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-slate-900 text-xs">Manage Settings</div>
            <div className="text-[10px] text-slate-500 mt-0.5">System preferences</div>
          </button>

          <button
            onClick={() => setActiveNavigation('admin', 'export')}
            className="p-3 rounded-xl bg-white/60 hover:bg-white border border-white/80 shadow-2xs hover:shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Download className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-slate-900 text-xs">Export Report</div>
            <div className="text-[10px] text-slate-500 mt-0.5">JSON & CSV dumps</div>
          </button>
        </div>
      </GlassCard>

      {/* 4. PRIMARY ANALYTICS & SCHEDULING HEALTH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Analytics & Operations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Scheduling Health & Solver Diagnostics */}
          <ChartCard
            title="OR-Tools CP-SAT Scheduling Health"
            subtitle="Constraint satisfaction benchmark across 189 teaching sessions"
            action={
              <StatusBadge variant="green" pulse size="md">
                100% Clash-Free Verified
              </StatusBadge>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Schedule Success */}
              <div className="p-4 rounded-xl bg-white/60 border border-white/80 shadow-2xs space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Schedule Success</div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  99.4%
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full" style={{ width: '99.4%' }} />
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold pt-1">
                  185 / 189 Sessions Fixed
                </p>
              </div>

              {/* Hard Conflicts */}
              <div className="p-4 rounded-xl bg-white/60 border border-white/80 shadow-2xs space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Scheduling Conflicts</div>
                <div className="text-2xl font-black text-emerald-600 font-mono">
                  0
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  Zero faculty or venue collisions
                </p>
              </div>

              {/* Pending Sessions */}
              <div className="p-4 rounded-xl bg-white/60 border border-white/80 shadow-2xs space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Pending Electives</div>
                <div className="text-2xl font-black text-amber-600 font-mono">
                  4
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '20%' }} />
                </div>
                <p className="text-[10px] text-amber-700 font-medium pt-1">
                  Awaiting coordinator lab slot
                </p>
              </div>

            </div>

            {/* Room Utilisation Breakdown */}
            <div className="mt-5 pt-4 border-t border-slate-200/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Average Room Utilisation</span>
                <span className="text-xs font-mono font-bold text-slate-900">76.8% Peak Capacity</span>
              </div>
              <div className="w-full bg-slate-200/70 h-3 rounded-full overflow-hidden flex">
                <div className="bg-blue-600 h-full" style={{ width: '55%' }} title="Lecture Halls (55%)" />
                <div className="bg-indigo-600 h-full" style={{ width: '15%' }} title="Computer Labs (15%)" />
                <div className="bg-amber-500 h-full" style={{ width: '6.8%' }} title="Auditorium & Seminars (6.8%)" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span>Peak Period: P4-P5 (10:45 – 12:30 PM, 92% occupancy)</span>
                <button
                  onClick={() => setActiveNavigation('analytics', 'utilization')}
                  className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                >
                  Full Heatmap →
                </button>
              </div>
            </div>
          </ChartCard>

          {/* Pending Venue Approvals Queue (25 Requests) */}
          <ChartCard
            title={`Pending Venue Booking Queue (${pendingBookings.length})`}
            subtitle="Student club events and departmental workshops awaiting review"
            action={
              <button
                onClick={() => setActiveNavigation('venues', 'requests')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                View All {pendingBookings.length} Requests →
              </button>
            }
          >
            <div className="divide-y divide-slate-100">
              {pendingBookings.slice(0, 4).map(req => (
                <div key={req.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-xs">{req.eventTitle}</span>
                      {req.isSpectraWeek && (
                        <span className="text-[10px] font-bold bg-purple-500/15 text-purple-700 px-2 py-0.2 rounded-full border border-purple-500/30">
                          Spectra Fest
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span>By: <strong className="text-slate-700">{req.clubOrDept}</strong></span>
                      <span>Venue: <strong className="text-slate-700">{req.roomName}</strong></span>
                      <span>Date: <strong className="text-slate-700">{req.date}</strong></span>
                    </div>
                  </div>

                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveNavigation('venues', 'approvals')}
                  >
                    Review
                  </GlassButton>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Upcoming Schedule & Midsem Examinations */}
          <ChartCard
            title="Upcoming Midsem Examinations (41 Papers)"
            subtitle="Starting Nov 18, 2026 • Alternate seating rule active"
            action={
              <button
                onClick={() => setActiveNavigation('exams', 'timetable')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Full Exam Schedule →
              </button>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-white/60 border border-white/80 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-blue-600">CS301</span>
                  <span className="text-[10px] text-slate-500 font-bold">Nov 18, 09:30 AM</span>
                </div>
                <div className="font-extrabold text-slate-900 text-xs">Design & Analysis of Algorithms</div>
                <div className="text-[11px] text-slate-500">
                  122 Students • Halls: LH-201, LH-202
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/60 border border-white/80 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-amber-600">EC301</span>
                  <span className="text-[10px] text-slate-500 font-bold">Nov 18, 02:00 PM</span>
                </div>
                <div className="font-extrabold text-slate-900 text-xs">Digital Signal Processing</div>
                <div className="text-[11px] text-slate-500">
                  55 Students • Halls: LH-101, LH-103
                </div>
              </div>
            </div>
          </ChartCard>

        </div>

        {/* Right Column (1 Col): Disruptions, Recent Activity, System Status */}
        <div className="space-y-6">
          
          {/* Active Disruptions Widget */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">Disruptions ({activeDisruptions.length})</h3>
              </div>
              <button
                onClick={() => setActiveNavigation('rescheduling', 'disruptions')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3 mt-3">
              {activeDisruptions.map(dis => (
                <div key={dis.id} className="p-3 rounded-xl border border-rose-300/60 bg-rose-50/50 text-xs space-y-1.5">
                  <div className="font-extrabold text-rose-950">{dis.title}</div>
                  <p className="text-[11px] text-rose-700 leading-snug">
                    {dis.affectedDate} • {dis.affectedSlotsCount} slots affected
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">{dis.status}</span>
                    <button
                      onClick={() => setActiveNavigation('rescheduling', 'comparison')}
                      className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                    >
                      Solve Diff →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recent Campus Activities & System Audit Log */}
          <GlassCard className="p-5">
            <div className="pb-3 border-b border-slate-200/50">
              <h3 className="font-extrabold text-slate-900 text-sm">Recent Activities</h3>
              <p className="text-xs text-slate-500">System audit log & dispatch tracking</p>
            </div>

            <div className="space-y-3.5 mt-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-slate-800 font-medium leading-snug">
                    CP-SAT baseline generated for Term VII with zero hard conflicts.
                  </p>
                  <span className="text-[10px] text-slate-400">2 hours ago • Automated Engine</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-slate-800 font-medium leading-snug">
                    Robotics Club submitted booking request for Seminar Hall A.
                  </p>
                  <span className="text-[10px] text-slate-400">3 hours ago • Ananya Dash</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-slate-800 font-medium leading-snug">
                    Prof. Arvind Tripathy requested Monday P1 slot swap for CS301.
                  </p>
                  <span className="text-[10px] text-slate-400">5 hours ago • Faculty Portal</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-slate-800 font-medium leading-snug">
                    Spectra Tech Fest venue blocks configured for Chilika Auditorium.
                  </p>
                  <span className="text-[10px] text-slate-400">Yesterday • Dean Academic Affairs</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* System Status & Engine Health */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">System Status</h3>
              </div>
              <StatusBadge variant="green" size="sm">
                All Operational
              </StatusBadge>
            </div>

            <div className="space-y-2.5 mt-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/50 border border-white/60">
                <span className="text-slate-600 font-medium">Solver Engine</span>
                <span className="font-mono font-bold text-slate-900">Google OR-Tools CP-SAT</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/50 border border-white/60">
                <span className="text-slate-600 font-medium">API Service</span>
                <span className="font-mono font-bold text-emerald-600">FastAPI Online</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/50 border border-white/60">
                <span className="text-slate-600 font-medium">Database</span>
                <span className="font-mono font-bold text-slate-900">SQLite / PostgreSQL Ready</span>
              </div>
            </div>
          </GlassCard>

        </div>

      </div>

    </div>
  );
};
