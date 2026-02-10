import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon } from
'lucide-react';
interface CalendarPopoverProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: string;
  className?: string;
}
export function CalendarPopover({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  minDate,
  className = ''
}: CalendarPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Initialize navigation date from value or today
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setCurrentDate(date);
      }
    }
  }, [value, isOpen]);
  // Position the dropdown relative to the trigger
  const updatePosition = useCallback(() => {
    if (triggerRef.current && isOpen) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 320;
      const dropdownHeight = 380;
      let top = rect.bottom + 8;
      let left = rect.left;
      // Ensure dropdown doesn't go off-screen right
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 8;
      }
      // Ensure dropdown doesn't go off-screen bottom
      if (top + dropdownHeight > window.innerHeight) {
        top = rect.top - dropdownHeight - 8;
      }
      setDropdownPos({
        top,
        left
      });
    }
  }, [isOpen]);
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, updatePosition]);
  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
      triggerRef.current &&
      !triggerRef.current.contains(target) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(target))
      {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const daysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();
  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };
  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };
  const handleDateClick = (day: number) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const offset = selectedDate.getTimezoneOffset();
    const adjustedDate = new Date(selectedDate.getTime() - offset * 60 * 1000);
    onChange(adjustedDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }
    const today = new Date();
    const selected = value ? new Date(value) : null;
    for (let day = 1; day <= daysCount; day++) {
      const dateToCheck = new Date(year, month, day);
      const isToday =
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year;
      const isSelected =
      selected &&
      selected.getDate() === day &&
      selected.getMonth() === month &&
      selected.getFullYear() === year;
      let isDisabled = false;
      if (minDate) {
        const min = new Date(minDate);
        if (
        dateToCheck <
        new Date(min.getFullYear(), min.getMonth(), min.getDate()))
        {
          isDisabled = true;
        }
      }
      days.push(
        <button
          key={day}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isDisabled) handleDateClick(day);
          }}
          disabled={isDisabled}
          className={`
            h-10 w-10 flex items-center justify-center text-sm rounded-full transition-all
            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-[#3E2723]/10 cursor-pointer text-gray-700'}
            ${isSelected ? 'bg-[#3E2723] text-white hover:bg-[#3E2723] font-medium' : ''}
            ${!isSelected && isToday ? 'border border-dashed border-[#3E2723] text-[#3E2723] font-medium' : ''}
          `}>

          {day}
        </button>
      );
    }
    return days;
  };
  const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'];

  const dropdown =
  isOpen && dropdownPos ?
  ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      className="bg-white rounded-2xl shadow-xl border border-[#E0D6CC] p-4 w-[320px] animate-in fade-in zoom-in-95 duration-200"
      style={{
        position: 'fixed',
        top: dropdownPos.top,
        left: dropdownPos.left,
        zIndex: 9999
      }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
          onClick={(e) => {
            e.preventDefault();
            handlePrevMonth();
          }}
          className="p-1 hover:bg-gray-100 rounded-full text-[#3E2723] transition-colors">

                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-bold text-[#3E2723]">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button
          onClick={(e) => {
            e.preventDefault();
            handleNextMonth();
          }}
          className="p-1 hover:bg-gray-100 rounded-full text-[#3E2723] transition-colors">

                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) =>
        <div
          key={day}
          className="h-10 flex items-center justify-center text-xs font-medium text-gray-400">

                  {day}
                </div>
        )}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {renderCalendarDays()}
            </div>
          </div>,
    document.body
  ) :
  null;
  return (
    <div className={`relative ${className}`}>
      {label &&
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </label>
      }

      {/* Input Trigger */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer group">

        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <CalendarIcon className="h-5 w-5 text-[#795548] group-hover:text-[#3E2723] transition-colors" />
        </div>
        <div
          className={`
          block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white sm:text-sm transition-colors
          ${isOpen ? 'border-[#3E2723] ring-1 ring-[#3E2723]' : 'border-gray-300 hover:border-[#795548]'}
          ${!value ? 'text-gray-500' : 'text-gray-900'}
        `}>

          {value || placeholder}
        </div>
      </div>

      {dropdown}
    </div>);

}