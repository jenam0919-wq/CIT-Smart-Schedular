/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  X,
  BookOpen,
  User,
  Building,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    courses,
    faculty,
    rooms,
    studentGroups,
    setActiveNavigation,
    setFilterFaculty,
    setFilterRoom,
    setFilterGroup
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const filteredCourses = query
    ? courses.filter(c => c.code.toLowerCase().includes(cleanQuery) || c.title.toLowerCase().includes(cleanQuery)).slice(0, 4)
    : [];

  const filteredFaculty = query
    ? faculty.filter(f => f.name.toLowerCase().includes(cleanQuery) || f.department.toLowerCase().includes(cleanQuery)).slice(0, 4)
    : [];

  const filteredRooms = query
    ? rooms.filter(r => r.name.toLowerCase().includes(cleanQuery) || r.type.toLowerCase().includes(cleanQuery)).slice(0, 4)
    : [];

  const filteredGroups = query
    ? studentGroups.filter(g => g.name.toLowerCase().includes(cleanQuery)).slice(0, 3)
    : [];

  const quickNav = [
    { title: 'Weekly Master Timetable', module: 'timetable', subPage: 'weekly', category: 'Module' },
    { title: 'OR-Tools CP-SAT Timetable Generator', module: 'timetable', subPage: 'generator', category: 'Module' },
    { title: 'Midsem Exam Timetable (41 Papers)', module: 'exams', subPage: 'timetable', category: 'Module' },
    { title: 'Venue Booking Catalog & Requests', module: 'venues', subPage: 'booking', category: 'Module' },
    { title: 'Spectra Tech/Cultural Fest Bookings', module: 'venues', subPage: 'spectra', category: 'Module' },
    { title: 'Smart Rescheduling & Disruption Log', module: 'rescheduling', subPage: 'disruptions', category: 'Module' },
    { title: 'Natural Language AI Assistant', module: 'ai', subPage: 'booking', category: 'AI Tools' },
  ].filter(item => !cleanQuery || item.title.toLowerCase().includes(cleanQuery));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#0A1026]/50 backdrop-blur-md">
      <div className="w-full max-w-2xl glass-modal rounded-2xl shadow-2xl border border-white/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200/60 px-4 py-3.5 flex items-center gap-3 bg-white/40">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search courses (e.g. CS301), faculty, rooms (LH-101), or quick modules..."
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-white/80 rounded-md border border-slate-200 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* If empty query, show quick navigation */}
          {!cleanQuery && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Quick Shortcuts
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {quickNav.slice(0, 6).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveNavigation(item.module, item.subPage);
                      setIsSearchModalOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-left"
                  >
                    <span className="font-medium text-slate-700 truncate">{item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Courses Search Results */}
          {filteredCourses.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-indigo-500" />
                <span>Courses</span>
              </div>
              <div className="space-y-1">
                {filteredCourses.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveNavigation('timetable', 'weekly');
                      setIsSearchModalOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-indigo-50/50 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-600 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                        {c.code}
                      </span>
                      <span className="font-semibold text-slate-900">{c.title}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{c.department} • {c.credits} Credits</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Faculty Results */}
          {filteredFaculty.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1 flex items-center gap-1.5">
                <User className="w-3 h-3 text-teal-600" />
                <span>Faculty Members</span>
              </div>
              <div className="space-y-1">
                {filteredFaculty.map(f => (
                  <div
                    key={f.id}
                    onClick={() => {
                      setFilterFaculty(f.name);
                      setActiveNavigation('timetable', 'faculty');
                      setIsSearchModalOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-teal-50/50 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{f.name}</span>
                      <span className="text-slate-400 ml-2 text-[11px]">({f.designation})</span>
                    </div>
                    <span className="text-teal-700 font-medium">{f.department}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rooms Results */}
          {filteredRooms.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1 flex items-center gap-1.5">
                <Building className="w-3 h-3 text-amber-600" />
                <span>Campus Rooms & Labs</span>
              </div>
              <div className="space-y-1">
                {filteredRooms.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setFilterRoom(r.name);
                      setActiveNavigation('venues', 'booking');
                      setIsSearchModalOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{r.name}</span>
                      <span className="text-slate-400 ml-2 text-[11px]">{r.block} • Floor {r.floor}</span>
                    </div>
                    <span className="text-slate-600">Cap: {r.capacity} seats</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Groups Results */}
          {filteredGroups.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-sky-600" />
                <span>Student Cohorts</span>
              </div>
              <div className="space-y-1">
                {filteredGroups.map(g => (
                  <div
                    key={g.id}
                    onClick={() => {
                      setFilterGroup(g.name);
                      setActiveNavigation('timetable', 'group');
                      setIsSearchModalOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-sky-50/50 cursor-pointer flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-900">{g.name}</span>
                    <span className="text-slate-500">{g.strength} students • Sem {g.semester}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback no results */}
          {cleanQuery && filteredCourses.length === 0 && filteredFaculty.length === 0 && filteredRooms.length === 0 && (
            <div className="py-8 text-center text-slate-500">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-700">No matching campus entities found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching for "CS301", "Tripathy", "LH-101", or "Robotics"</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="font-semibold text-slate-700">Navigation:</span> Click to jump directly to entity
          </span>
          <span className="text-[10px] text-slate-400">CIT Smart Scheduler v1.0</span>
        </div>

      </div>
    </div>
  );
};
