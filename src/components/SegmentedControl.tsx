import React from 'react';
import { motion } from 'framer-motion';
export interface SegmentOption {
  value: string;
  label: string;
}
interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}
export function SegmentedControl({
  options,
  value,
  onChange,
  className = ''
}: SegmentedControlProps) {
  return <div className={`relative bg-[#E0D6CC] rounded-full p-1 flex ${className}`}>
      {options.map((option) => {
      const isActive = value === option.value;
      return <button key={option.value} onClick={() => onChange(option.value)} className={`
              relative flex-1 py-2 px-4 text-sm font-medium rounded-full z-10 transition-colors duration-200
              ${isActive ? 'text-white' : 'text-[#5D4037] hover:text-[#3E2723]'}
            `}>
            {isActive && <motion.div layoutId="activeSegment" className="absolute inset-0 bg-[#3E2723] rounded-full -z-10" transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }} />}
            {option.label}
          </button>;
    })}
    </div>;
}