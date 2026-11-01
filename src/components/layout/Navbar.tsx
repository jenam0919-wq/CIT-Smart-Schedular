/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Search,
  ChevronDown,
  Calendar,
  LogOut,
  UserCheck,
  Cpu,
  Layers,
  GraduationCap,
  Users,
  Building,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { UserRole } from '../../types';
import { CITLogo } from '../ui/CITLogo';
import { UserProfileModal } from '../profile/UserProfileModal';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    activeRole,
    switchRole,
    logout,
    academicTerm,
    setAcademicTerm,
    setIsSearchModalOpen,
    setIsMobileSidebarOpen,
    isMobileSidebarOpen,
    setIsDemoNoticeOpen,
    apiStatus,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    setActiveNavigation
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isTermMenuOpen, setIsTermMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifMenuOpen(false);
      }
      if (termRef.current && !termRef.current.contains(e.target as Node)) {
        setIsTermMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<UserRole, { title: string; color: string; icon: React.ReactNode }> = {
    admin: {
      title: 'Administrator',
      color: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
      icon: <Layers className="w-3.5 h-3.5 mr-1" />
    },
    coordinator: {
      title: 'Dept Coordinator',
      color: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
      icon: <Building className="w-3.5 h-3.5 mr-1" />
    },
    faculty: {
      title: 'Faculty Member',
      color: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
      icon: <GraduationCap className="w-3.5 h-3.5 mr-1" />
    },
    club: {
      title: 'Club Representative',
      color: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
      icon: <Users className="w-3.5 h-3.5 mr-1" />
    },
    student: {
      title: 'Student Scholar',
      color: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
      icon: <GraduationCap className="w-3.5 h-3.5 mr-1" />
    },
    warden: {
      title: 'Hostel Warden',
      color: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
      icon: <ShieldCheck className="w-3.5 h-3.5 mr-1" />
    },
    staff: {
      title: 'Campus Support Staff',
      color: 'bg-teal-500/15 text-teal-700 border-teal-500/30',
      icon: <Building className="w-3.5 h-3.5 mr-1" />
    }
  };

  const terms = [
    'Fall 2026 (Semester VII)',
    'Spring 2026 (Semester VI)',
    'Summer Term 2026 (Remedial & Research)',
  ];

  return (
    <header className="sticky top-0 z-30 glass-navbar h-16 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        
        {/* Left: Mobile Sidebar Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <CITLogo
            variant="compact"
            theme="color"
            size="sm"
            showSubtitle={true}
            showBadge={true}
          />
        </div>

        {/* Center: Search Bar & Academic Term Selector */}
        <div className="flex-1 max-w-xl mx-2 hidden md:flex items-center gap-3">
          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 text-slate-500 shadow-sm transition-all text-xs cursor-pointer focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search courses, faculty, rooms, or bookings...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded-md text-slate-400 shadow-2xs">
              Ctrl K
            </kbd>
          </button>

          {/* Academic Term Picker */}
          <div className="relative" ref={termRef}>
            <button
              onClick={() => setIsTermMenuOpen(!isTermMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white/60 hover:bg-white/90 border border-white/80 rounded-xl shadow-sm whitespace-nowrap transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="max-w-[130px] truncate">{academicTerm.split(' ')[0]} Term</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isTermMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-dropdown rounded-2xl py-2 z-40 text-xs shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                  Academic Term
                </div>
                {terms.map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setAcademicTerm(t);
                      setIsTermMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-blue-50/70 transition-colors cursor-pointer ${
                      academicTerm === t ? 'text-blue-600 font-bold bg-blue-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span>{t}</span>
                    {academicTerm === t && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Theme Toggle, Architecture Status, Notifications, Profile */}
        <div className="flex items-center gap-2">
          
          {/* Architecture Status Badge */}
          <button
            onClick={() => setIsDemoNoticeOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/60 hover:bg-white/90 text-slate-700 rounded-xl border border-white/80 shadow-sm transition-colors cursor-pointer"
            title="View backend architecture & integration roadmap"
          >
            <span className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="hidden xl:inline">Engine:</span>
            <span className="font-extrabold text-slate-800">
              {apiStatus === 'connected' ? 'FastAPI Online' : 'FastAPI Ready'}
            </span>
          </button>

          {/* Theme Indicator Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
            title={isDarkMode ? 'Dark Glass Mode' : 'Light Glass Mode'}
          >
            {isDarkMode ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          {/* Search trigger on mobile */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-white/60"
            aria-label="Open search dialog"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Centre Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {isNotifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-dropdown rounded-2xl py-2 z-40 text-xs shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 font-extrabold text-[10px]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-blue-600 hover:text-blue-800 text-[11px] font-bold cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkModule) {
                          setActiveNavigation(n.linkModule, n.linkSubPage);
                          setIsNotifMenuOpen(false);
                        }
                      }}
                      className={`p-3 hover:bg-blue-50/50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                          {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {n.type === 'info' && <Bell className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`font-bold truncate ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">{n.time}</span>
                          </div>
                          <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed line-clamp-2">
                            {n.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-3 py-2 border-t border-slate-200/60 bg-white/40 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Central Academic Dispatch
                  </span>
                  <button
                    onClick={() => {
                      setActiveNavigation('notifications');
                      setIsNotifMenuOpen(false);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Open Notification Center &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu & Role Quick Switcher */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/60 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm border border-white/40 overflow-hidden">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name.charAt(0) || 'U'
                )}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.name || 'Guest User'}
                </div>
                <div className="text-[10px] text-slate-500 leading-none mt-0.5">
                  {roleLabels[activeRole]?.title || 'User'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 glass-dropdown rounded-2xl py-2 z-40 text-xs shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="px-4 py-2.5 border-b border-slate-200/60">
                  <div className="font-extrabold text-slate-900 text-sm">
                    {currentUser?.name}
                  </div>
                  <div className="text-slate-500 text-[11px] truncate">
                    {currentUser?.email}
                  </div>
                  <div className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-bold ${roleLabels[activeRole]?.color}`}>
                    {roleLabels[activeRole]?.icon}
                    {roleLabels[activeRole]?.title}
                  </div>
                </div>

                {/* Instant Role Switcher */}
                <div className="px-3 py-2.5 border-b border-slate-200/60 bg-white/40">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Switch Role Preview</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['admin', 'faculty', 'student', 'warden', 'staff', 'coordinator', 'club'] as UserRole[]).map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          setIsProfileMenuOpen(false);
                        }}
                        className={`px-2.5 py-1.5 text-left rounded-lg transition-colors text-[11px] flex items-center justify-between cursor-pointer ${
                          activeRole === r
                            ? 'bg-blue-600 text-white font-bold shadow-sm'
                            : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/60'
                        }`}
                      >
                        <span className="capitalize">{r === 'club' ? 'Club Rep' : r}</span>
                        {activeRole === r && <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile & Security Option */}
                <div className="px-2 py-1">
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50/60 rounded-xl flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>My Profile & Security</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDemoNoticeOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50/60 rounded-xl flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    <span>FastAPI & OR-Tools Architecture</span>
                  </button>
                </div>

                {/* Logout Button */}
                <div className="px-2 pt-1 border-t border-slate-200/60">
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-bold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out (Demo Session)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};
