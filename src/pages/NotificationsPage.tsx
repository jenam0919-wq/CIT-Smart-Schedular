/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { NotificationItem } from '../context/AppContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Check,
  Search,
  Filter,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Calendar,
  Building,
  GraduationCap,
  Layers,
  X
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    setActiveNavigation,
    currentUser
  } = useApp();

  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'timetable' | 'exams' | 'venues' | 'rescheduling' | 'alert'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
  const [localList, setLocalList] = useState<NotificationItem[]>(notifications);

  useEffect(() => {
    setLocalList(notifications);
  }, [notifications]);

  // Filtered notifications
  const filteredList = localList.filter(n => {
    // Tab filter
    if (filterTab === 'unread' && n.read) return false;
    if (filterTab === 'timetable' && n.linkModule !== 'timetable') return false;
    if (filterTab === 'exams' && n.linkModule !== 'exams') return false;
    if (filterTab === 'venues' && n.linkModule !== 'venues' && n.linkModule !== 'booking') return false;
    if (filterTab === 'rescheduling' && n.linkModule !== 'rescheduling') return false;
    if (filterTab === 'alert' && n.type !== 'alert' && n.type !== 'warning') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = localList.filter(n => !n.read).length;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
    } catch (_) {}
    setLocalList(prev => prev.filter(n => n.id !== id));
    if (selectedNotif?.id === id) {
      setSelectedNotif(null);
    }
  };

  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    markNotificationAsRead(id);
    setLocalList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    clearAllNotifications();
    setLocalList(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'info':
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-sky-200 border border-white/15">
            <Bell className="w-3.5 h-3.5 text-sky-400" />
            <span>Institutional Dispatch & Alert Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Centralized notification hub for Chilika Institute of Technology. Real-time updates for master timetable publications, examination dates, room approvals, and class reschedule events.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Stream Active (SSE / Polling Sync)</span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All ({unreadCount}) Read</span>
              </button>
            )}
            <button
              onClick={() => setIsPrefModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-300" />
              <span>Preferences</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {[
            { id: 'all', label: `All (${localList.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'timetable', label: 'Timetable' },
            { id: 'exams', label: 'Exams' },
            { id: 'venues', label: 'Venues' },
            { id: 'rescheduling', label: 'Rescheduling' },
            { id: 'alert', label: 'Alerts' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/80 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No notifications found</h3>
            <p className="text-xs text-slate-500">There are no notices matching your active filter criteria.</p>
          </div>
        ) : (
          filteredList.map(item => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedNotif(item);
                if (!item.read) handleMarkRead(item.id);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !item.read
                  ? 'bg-white/95 border-blue-200 shadow-sm hover:border-blue-400'
                  : 'bg-white/60 border-slate-200/70 hover:bg-white/90'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="mt-0.5 p-2 rounded-xl bg-slate-100 shrink-0">
                  {getTypeIcon(item.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-xs sm:text-sm ${!item.read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {item.title}
                    </span>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                    {item.linkModule && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-extrabold text-[10px] uppercase tracking-wide">
                        {item.linkModule}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                  <div className="text-[10px] text-slate-400 font-medium mt-1.5 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{item.time || 'Recent'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {item.linkModule && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNavigation(item.linkModule!, item.linkSubPage);
                    }}
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                    title={`Open ${item.linkModule}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">View Module</span>
                  </button>
                )}
                {!item.read && (
                  <button
                    onClick={(e) => handleMarkRead(item.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Details Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-100">
                  {getTypeIcon(selectedNotif.type)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedNotif.title}</h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">{selectedNotif.time || 'Official Dispatch'}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 leading-relaxed text-xs sm:text-sm">
              {selectedNotif.description}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400 text-[10px]">CIT Institutional Messaging Protocol</span>
              <div className="flex items-center gap-2">
                {selectedNotif.linkModule && (
                  <button
                    onClick={() => {
                      setActiveNavigation(selectedNotif.linkModule!, selectedNotif.linkSubPage);
                      setSelectedNotif(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Navigate to {selectedNotif.linkModule}</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {isPrefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Notification Preferences</span>
              </div>
              <button
                onClick={() => setIsPrefModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-500 text-[11px] leading-relaxed">
              Configure which campus event categories dispatch real-time alerts to your account.
            </p>

            <div className="space-y-2.5">
              {[
                { title: 'New Timetable Publication', desc: 'Alerts when dean issues semester timetable releases.' },
                { title: 'Examination Announcements', desc: 'Seat allocations and invigilator updates.' },
                { title: 'Class Cancellations & Swap Alerts', desc: 'Instant faculty sick leave and slot swap notifications.' },
                { title: 'Venue Booking Clearances', desc: 'Auditorium and lab reservation approvals.' },
              ].map((pref, i) => (
                <label key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <input type="checkbox" defaultChecked={true} className="mt-0.5 rounded text-blue-600 focus:ring-blue-500" />
                  <div>
                    <div className="font-bold text-slate-900">{pref.title}</div>
                    <div className="text-[10px] text-slate-500">{pref.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-[11px] font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>In-app real-time delivery active; SMTP relay in Sandbox mode.</span>
            </div>

            <button
              onClick={() => setIsPrefModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-xs cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

