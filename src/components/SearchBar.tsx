import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { CalendarPopover } from './CalendarPopover';
interface SearchBarProps {
  onSearch: (filters: any) => void;
  className?: string;
}
export function SearchBar({
  onSearch,
  className = ''
}: SearchBarProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      checkIn,
      checkOut,
      guests
    });
  };
  return <div className={`bg-white p-4 rounded-lg shadow-xl max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        {/* Check In */}
        <div className="flex-1 w-full">
          <CalendarPopover label="Check In" value={checkIn} onChange={setCheckIn} placeholder="Select Date" minDate={new Date().toISOString().split('T')[0]} />
        </div>

        {/* Check Out */}
        <div className="flex-1 w-full">
          <CalendarPopover label="Check Out" value={checkOut} onChange={setCheckOut} placeholder="Select Date" minDate={checkIn || new Date().toISOString().split('T')[0]} />
        </div>

        {/* Guests */}
        <div className="w-full md:w-32">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Guests
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-[#795548]" />
            </div>
            <select value={guests} onChange={(e) => setGuests(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-[#795548] sm:text-sm h-[38px]">
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5+">5+ Guests</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button type="submit" className="w-full md:w-auto bg-[#3E2723] hover:bg-[#2D1B18] text-white font-bold py-2 px-6 rounded-md shadow-md transition-colors duration-200 flex items-center justify-center gap-2 h-[38px]">
          <Search className="h-4 w-4" />
          <span>Search</span>
        </button>
      </form>
    </div>;
}