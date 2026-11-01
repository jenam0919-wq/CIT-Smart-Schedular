/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Room } from '../../types';
import {
  Building2,
  LayoutGrid,
  List,
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  Wind,
  Tv,
  Volume2,
  Users,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface RoomDirectoryProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  onReserveRoom: (room: Room) => void;
}

export const RoomDirectory: React.FC<RoomDirectoryProps> = ({
  rooms,
  onSelectRoom,
  onReserveRoom,
}) => {
  // View mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCapacity, setSelectedCapacity] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'capacity-desc' | 'capacity-asc' | 'floor'>('name');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = viewMode === 'grid' ? 9 : 12;

  // Extract unique blocks and floors
  const availableBlocks = useMemo(() => {
    const blocks = new Set(rooms.map(r => r.block));
    return ['All', ...Array.from(blocks).sort()];
  }, [rooms]);

  const availableFloors = useMemo(() => {
    const floors = new Set(rooms.map(r => String(r.floor)));
    return ['All', ...Array.from(floors).sort((a, b) => Number(a) - Number(b))];
  }, [rooms]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBlock('All');
    setSelectedFloor('All');
    setSelectedType('All');
    setSelectedCapacity('All');
    setSelectedAvailability('All');
    setSortBy('name');
    setCurrentPage(1);
  };

  const isFiltered =
    searchQuery.trim().length > 0 ||
    selectedBlock !== 'All' ||
    selectedFloor !== 'All' ||
    selectedType !== 'All' ||
    selectedCapacity !== 'All' ||
    selectedAvailability !== 'All';

  // Apply filtering and sorting
  const filteredAndSortedRooms = useMemo(() => {
    let result = rooms.filter(r => {
      // Search
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.name.toLowerCase().includes(q) ||
          r.block.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          (r.code && r.code.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Block filter
      if (selectedBlock !== 'All' && r.block !== selectedBlock) return false;

      // Floor filter
      if (selectedFloor !== 'All' && String(r.floor) !== selectedFloor) return false;

      // Type filter
      if (selectedType !== 'All' && r.type !== selectedType) return false;

      // Capacity filter
      if (selectedCapacity !== 'All') {
        if (selectedCapacity === '<60' && r.capacity >= 60) return false;
        if (selectedCapacity === '60-100' && (r.capacity < 60 || r.capacity > 100)) return false;
        if (selectedCapacity === '100-200' && (r.capacity < 100 || r.capacity > 200)) return false;
        if (selectedCapacity === '200+' && r.capacity < 200) return false;
      }

      // Availability filter
      if (selectedAvailability !== 'All') {
        if (selectedAvailability === 'available' && !r.isAvailableNow) return false;
        if (selectedAvailability === 'occupied' && r.isAvailableNow) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'capacity-desc') return b.capacity - a.capacity;
      if (sortBy === 'capacity-asc') return a.capacity - b.capacity;
      if (sortBy === 'floor') return a.floor - b.floor;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [rooms, searchQuery, selectedBlock, selectedFloor, selectedType, selectedCapacity, selectedAvailability, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedRooms.length / pageSize) || 1;
  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedRooms.slice(start, start + pageSize);
  }, [filteredAndSortedRooms, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      
      {/* Top Filter and Search Controls Bar */}
      <div className="glass-card p-5 rounded-3xl border border-white/80 shadow-md space-y-4 transition-all">
        
        {/* Top Row: Search, View Switcher & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by room name, code, block, or type..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl focus:outline-hidden focus:border-blue-500 shadow-2xs text-slate-800 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-white/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 shadow-2xs text-xs font-semibold text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="name">Sort: Room Name</option>
                <option value="capacity-desc">Capacity: High to Low</option>
                <option value="capacity-asc">Capacity: Low to High</option>
                <option value="floor">Floor: Low to High</option>
              </select>
            </div>

            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex items-center p-1 bg-slate-200/60 backdrop-blur-md rounded-xl border border-white/60">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-md shadow-slate-200/80 border border-white/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-700 shadow-md shadow-slate-200/80 border border-white/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Filters Row: Building, Floor, Room Type, Capacity, Availability */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-200/60 text-xs">
          
          {/* 1. Building / Block */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Building Block</label>
            <select
              value={selectedBlock}
              onChange={e => {
                setSelectedBlock(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl font-bold text-slate-800 shadow-2xs cursor-pointer"
            >
              {availableBlocks.map(b => (
                <option key={b} value={b}>{b === 'All' ? 'All Blocks' : b}</option>
              ))}
            </select>
          </div>

          {/* 2. Floor */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Floor</label>
            <select
              value={selectedFloor}
              onChange={e => {
                setSelectedFloor(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl font-bold text-slate-800 shadow-2xs cursor-pointer"
            >
              {availableFloors.map(f => (
                <option key={f} value={f}>{f === 'All' ? 'All Floors' : `Floor ${f}`}</option>
              ))}
            </select>
          </div>

          {/* 3. Room Type */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Room Type</label>
            <select
              value={selectedType}
              onChange={e => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl font-bold text-slate-800 shadow-2xs cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Lecture Hall">Lecture Hall</option>
              <option value="Computer Lab">Computer Lab</option>
              <option value="Hardware Lab">Hardware Lab</option>
              <option value="Seminar Hall">Seminar Hall</option>
              <option value="Auditorium">Auditorium</option>
            </select>
          </div>

          {/* 4. Capacity Range */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Capacity</label>
            <select
              value={selectedCapacity}
              onChange={e => {
                setSelectedCapacity(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl font-bold text-slate-800 shadow-2xs cursor-pointer"
            >
              <option value="All">All Capacities</option>
              <option value="<60">&lt; 60 seats</option>
              <option value="60-100">60 - 100 seats</option>
              <option value="100-200">100 - 200 seats</option>
              <option value="200+">200+ seats (Auditorium)</option>
            </select>
          </div>

          {/* 5. Live Availability */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Availability</label>
            <select
              value={selectedAvailability}
              onChange={e => {
                setSelectedAvailability(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl font-bold text-slate-800 shadow-2xs cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="available">Available Now</option>
              <option value="occupied">Occupied (Class in Session)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Directory Count Summary */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{paginatedRooms.length}</strong> of {filteredAndSortedRooms.length} rooms
        </span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* ================= VIEW 1: GRID VIEW ================= */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedRooms.map(room => (
            <div
              key={room.id}
              className="glass-card rounded-3xl border border-white/80 shadow-md hover:shadow-xl hover:border-blue-300 transition-all p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3
                      onClick={() => onSelectRoom(room)}
                      className="font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {room.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{room.block} • Floor {room.floor}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                    {room.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 my-3.5 text-xs">
                  <div className="p-2.5 bg-white/80 rounded-2xl border border-slate-200/70">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase">Seating Capacity</div>
                    <div className="text-base font-black text-slate-900 font-mono mt-0.5">{room.capacity} seats</div>
                  </div>
                  <div className="p-2.5 bg-white/80 rounded-2xl border border-slate-200/70">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase">Exam Spacing</div>
                    <div className="text-base font-black text-amber-700 font-mono mt-0.5">{room.examCapacity} seats</div>
                  </div>
                </div>

                {/* Facilities Tags */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600 mb-4">
                  {room.hasAirConditioning && (
                    <span className="flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200/80 px-2 py-0.5 rounded-lg font-bold">
                      <Wind className="w-3 h-3" />
                      <span>Central AC</span>
                    </span>
                  )}
                  {room.hasProjector && (
                    <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-lg font-bold">
                      <Tv className="w-3 h-3" />
                      <span>HD Projector</span>
                    </span>
                  )}
                  {room.hasAudioSystem && (
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-lg font-bold">
                      <Volume2 className="w-3 h-3" />
                      <span>PA System</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3.5 border-t border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${room.isAvailableNow ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className={`font-bold ${room.isAvailableNow ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {room.isAvailableNow ? 'Available' : 'In Class'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectRoom(room)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-100/80 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => onReserveRoom(room)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Reserve</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= VIEW 2: TABLE VIEW ================= */
        <div className="glass-card rounded-3xl border border-white/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#101B3C] text-white text-[11px] font-bold">
                  <th className="p-3.5 pl-5">Room Name</th>
                  <th className="p-3.5">Building Block</th>
                  <th className="p-3.5 text-center">Floor</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5 text-center">Capacity</th>
                  <th className="p-3.5 text-center">Exam Seats</th>
                  <th className="p-3.5">Amenities</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {paginatedRooms.map(room => (
                  <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                    <td
                      onClick={() => onSelectRoom(room)}
                      className="p-3.5 pl-5 font-black text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      {room.name}
                    </td>

                    <td className="p-3.5 font-semibold text-slate-700">{room.block}</td>

                    <td className="p-3.5 text-center font-mono font-bold text-slate-600">
                      Floor {room.floor}
                    </td>

                    <td className="p-3.5 font-bold text-slate-800">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                        {room.type}
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                      {room.capacity}
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-amber-700">
                      {room.examCapacity}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        {room.hasAirConditioning && (
                          <span title="Central AC">
                            <Wind className="w-3.5 h-3.5 text-sky-600" />
                          </span>
                        )}
                        {room.hasProjector && (
                          <span title="Projector">
                            <Tv className="w-3.5 h-3.5 text-indigo-600" />
                          </span>
                        )}
                        {room.hasAudioSystem && (
                          <span title="PA Audio">
                            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          room.isAvailableNow
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {room.isAvailableNow ? 'Available' : 'Occupied'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right pr-5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectRoom(room)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => onReserveRoom(room)}
                          className="px-3 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Reserve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-white text-slate-700 font-bold text-xs disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/70'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-white text-slate-700 font-bold text-xs disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
