/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CITLogo } from '../ui/CITLogo';
import {
  LayoutDashboard,
  CalendarDays,
  FileSpreadsheet,
  Building2,
  RefreshCw,
  Sparkles,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Settings,
  X,
  UserCheck,
  GraduationCap,
  BookOpen
} from 'lucide-react';

interface NavItem {
  id: string;
  subPage: string;
  label: string;
  badge?: string | number;
  badgeColor?: string;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  defaultSubPage: string;
  children?: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    activeSubPage,
    setActiveNavigation,
    activeRole,
    currentUser,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    setIsDemoNoticeOpen,
    bookingRequests,
    rescheduleRequests,
    disruptions,
    notifications
  } = useApp();

  // Desktop collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pendingBookingsCount = bookingRequests.filter(b => b.status === 'Pending').length;
  const pendingReschedulesCount = rescheduleRequests.filter(r => r.status.includes('Pending')).length;
  const activeDisruptionsCount = disruptions.filter(d => d.status !== 'Rescheduled').length;
  const unreadNotificationsCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboard: true,
    timetable: true,
    faculty: false,
    academics: false,
    exams: false,
    venues: false,
    rescheduling: false,
    ai: false,
    analytics: false,
    notifications: false,
    admin: false,
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const navSections: NavSection[] = [
    {
      id: 'dashboard',
      title: activeRole === 'admin'
        ? 'Executive Overview'
        : activeRole === 'faculty'
        ? 'Faculty Desk'
        : activeRole === 'coordinator'
        ? 'Dept Coordinator'
        : activeRole === 'student'
        ? 'Student Portal'
        : activeRole === 'warden'
        ? 'Hostel & Warden Desk'
        : activeRole === 'staff'
        ? 'Facility Operations'
        : 'Club Portal',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      defaultSubPage: 'overview',
    },
    {
      id: 'timetable',
      title: 'Timetable',
      icon: <CalendarDays className="w-4 h-4 shrink-0" />,
      defaultSubPage: 'weekly',
      children: [
        { id: 'timetable', subPage: 'generator', label: 'CP-SAT Generator', badge: 'Solver', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
        { id: 'timetable', subPage: 'weekly', label: 'Weekly Timetable' },
        { id: 'timetable', subPage: 'group', label: 'Group Timetable' },
        { id: 'timetable', subPage: 'faculty', label: 'Faculty Timetable' },
        { id: 'timetable', subPage: 'room', label: 'Room Timetable' },
      ],
    },
    {
      id: 'faculty',
      title: 'Faculty Management',
      icon: <GraduationCap className="w-4 h-4 shrink-0" />,
      defaultSubPage: 'directory',
      children: [
        { id: 'faculty', subPage: 'directory', label: 'Faculty Directory' },
        { id: 'faculty', subPage: 'workload', label: 'Workload & Analytics' },
        { id: 'faculty', subPage: 'availability', label: 'Availability Matrix' },
      ],
    },
    {
      id: 'academics',
      title: 'Groups & Courses',
      icon: <BookOpen className="w-4 h-4 shrink-0" />,
      defaultSubPage: 'groups',
      children: [
        { id: 'academics', subPage: 'groups', label: 'Student Cohorts' },
        { id: 'academics', subPage: 'courses', label: 'Course Catalog' },
        { id: 'academics', subPage: 'analytics', label: 'Academic Analytics' },
      ],
    },
    {
      id: 'exams',
      title: 'Examinations',
      icon: <FileSpreadsheet className="w-4 h-4 shrink-0" />,
      defaultSubPage: 'timetable',
      children: [
        { id: 'exams', subPage: 'scheduler', label: 'Exam Scheduler' },
        { id: 'exams', subPage: 'timetable', label: 'Midsem Timetable', badge: '41', badgeColor: 'bg-white/10 text-slate-300' },
        { id: 'exams', subPage: 'allocation', label: 'Room & Invigilators' },
      ],
    },
    {
      id: 'venues',
      title: 'Venue Management',
      icon: <Building2 className="w-4 h-4 shrink-0" />,
      defaultSubPage: 'booking',
      children: [
        { id: 'venues', subPage: 'booking', label: 'Venue Catalog' },
        { id: 'venues', subPage: 'requests', label: 'Booking Requests', badge: pendingBookingsCount, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
        { id: 'venues', subPage: 'spectra', label: 'Spectra Week', badge: 'Fest', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
        { id: 'venues', subPage: 'approvals', label: 'Approval Centre' },
        { id: 'venues', subPage: 'availability', label: 'Live Room Matrix' },
      ],
    },
    {
      id: 'rescheduling',
      title: 'Rescheduling',
      icon: <RefreshCw className="w-4 h-4 shrink-0" />,
      defaultSubPage: 'disruptions',
      children: [
        { id: 'rescheduling', subPage: 'disruptions', label: 'Disruption Log', badge: activeDisruptionsCount, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
        { id: 'rescheduling', subPage: 'requests', label: 'Change Requests', badge: pendingReschedulesCount, badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
        { id: 'rescheduling', subPage: 'comparison', label: 'Before / After Diff' },
        { id: 'rescheduling', subPage: 'approval', label: 'Admin Approval' },
      ],
    },
    {
      id: 'ai',
      title: 'AI Assistant',
      icon: <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />,
      defaultSubPage: 'booking',
      children: [
        { id: 'ai', subPage: 'booking', label: 'Natural-Language Booking' },
        { id: 'ai', subPage: 'faculty', label: 'Faculty Assistant' },
        { id: 'ai', subPage: 'explanations', label: 'Decision Explanations' },
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
      defaultSubPage: 'utilization',
      children: [
        { id: 'analytics', subPage: 'utilization', label: 'Room Utilisation' },
        { id: 'analytics', subPage: 'workload', label: 'Faculty Workload' },
        { id: 'analytics', subPage: 'solver-stats', label: 'Scheduling Stats' },
        { id: 'analytics', subPage: 'conflicts', label: 'Conflict Reports' },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-4 h-4 shrink-0" />,
      defaultSubPage: 'all',
      children: [
        { id: 'notifications', subPage: 'all', label: 'Inbox', badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
        { id: 'notifications', subPage: 'unread', label: 'Unread Alerts' },
        { id: 'notifications', subPage: 'system', label: 'System Logs' },
      ],
    },
    {
      id: 'admin',
      title: 'Administration',
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
      defaultSubPage: 'users',
      children: [
        { id: 'admin', subPage: 'users', label: 'User Management' },
        { id: 'admin', subPage: 'upload', label: 'Dataset Upload' },
        { id: 'admin', subPage: 'export', label: 'Import / Export' },
        { id: 'admin', subPage: 'settings', label: 'System Settings' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop with blur */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#0A1026]/60 backdrop-blur-md lg:hidden transition-opacity"
        />
      )}

      {/* Main Glass Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-50 lg:z-10 h-screen lg:h-[calc(100vh-4rem)] glass-sidebar flex flex-col transition-all duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[76px]' : 'lg:w-[270px]'} w-[280px]`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10">
          <CITLogo
            variant="compact"
            theme="white"
            size="sm"
            showSubtitle={true}
            showBadge={false}
          />
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Institution Brand & Collapsible Desktop Toggle */}
        <div className={`hidden lg:flex items-center ${isCollapsed ? 'justify-center flex-col gap-2 py-3 px-1' : 'justify-between px-4 py-3.5'} border-b border-white/10`}>
          {!isCollapsed ? (
            <CITLogo
              variant="compact"
              theme="white"
              size="sm"
              showSubtitle={true}
              showBadge={false}
              className="max-w-[200px]"
            />
          ) : (
            <CITLogo
              variant="icon"
              theme="white"
              size="sm"
              title="CIT Smart Scheduler"
            />
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* User Workspace Profile Card */}
        {!isCollapsed && (
          <div className="px-3.5 py-3 border-b border-white/10">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-white/20">
                  {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate leading-tight">
                    {currentUser?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5 capitalize">
                    {activeRole} Console
                  </div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
          </div>
        )}

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto sidebar-scrollbar px-3 py-3 space-y-1">
          {navSections.map(section => {
            const isSectionActive = activeModule === section.id;
            const hasChildren = section.children && section.children.length > 0;
            const isExpanded = expandedSections[section.id] ?? false;

            return (
              <div key={section.id} className="space-y-0.5">
                {/* Section Header Button */}
                <button
                  onClick={() => {
                    if (hasChildren) {
                      toggleSection(section.id);
                      if (!isExpanded) {
                        setActiveNavigation(section.id, section.defaultSubPage);
                      }
                    } else {
                      setActiveNavigation(section.id, section.defaultSubPage);
                    }
                  }}
                  title={isCollapsed ? section.title : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
                  } rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isSectionActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isSectionActive ? 'text-white' : 'text-slate-400'}>
                      {section.icon}
                    </span>
                    {!isCollapsed && <span className="truncate">{section.title}</span>}
                  </div>

                  {!isCollapsed && hasChildren && (
                    <span className={isSectionActive ? 'text-white/80' : 'text-slate-400'}>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </button>

                {/* Sub-items (when not collapsed) */}
                {!isCollapsed && hasChildren && isExpanded && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 ml-3.5 border-l border-white/15">
                    {section.children!.map(item => {
                      const isItemActive = isSectionActive && activeSubPage === item.subPage;
                      return (
                        <button
                          key={item.subPage}
                          onClick={() => setActiveNavigation(item.id, item.subPage)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 text-left cursor-pointer ${
                            isItemActive
                              ? 'bg-white/15 text-white font-bold border border-white/20 shadow-xs'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                                item.badgeColor || 'bg-white/10 text-slate-300 border-white/15'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Architecture Status Card */}
        {!isCollapsed ? (
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => setIsDemoNoticeOpen(true)}
              className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-200 font-bold text-[11px]">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>OR-Tools CP-SAT</span>
                </div>
                <span className="text-[10px] font-extrabold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.2 rounded border border-cyan-400/30">
                  Online
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-tight group-hover:text-slate-200">
                Constraint Programming Satisfiability
              </p>
            </button>
          </div>
        ) : (
          <div className="p-2 border-t border-white/10 flex justify-center">
            <button
              onClick={() => setIsDemoNoticeOpen(true)}
              className="p-2 rounded-xl text-cyan-400 hover:bg-white/10 transition-colors"
              title="OR-Tools CP-SAT Online"
            >
              <Cpu className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
