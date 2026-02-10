import React, { useEffect, useState, useRef } from 'react';
import { Search, Command, ArrowRight } from 'lucide-react';
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}
export function CommandPalette({
  isOpen,
  onClose,
  onCommand
}: CommandPaletteProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure focus works after render
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setInput('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().toLowerCase() === 'admin') {
      onCommand('admin');
      onClose();
    } else {
      // Shake effect or visual feedback could go here
      setInput('');
    }
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4 bg-black/60 backdrop-blur-sm transition-all duration-200" onClick={(e) => {
    if (e.target === e.currentTarget) onClose();
  }}>
      <div className="w-full max-w-xl bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit} className="relative flex items-center border-b border-[#333]">
          <Search className="absolute left-4 w-5 h-5 text-gray-500" />
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a command..." className="w-full bg-transparent text-white px-12 py-4 text-lg outline-none placeholder:text-gray-600 font-mono" autoComplete="off" autoCorrect="off" spellCheck="false" />
          <div className="absolute right-4 flex items-center gap-2">
            <span className="text-xs text-gray-600 font-mono px-2 py-1 rounded bg-[#2a2a2a] border border-[#333]">
              ESC
            </span>
          </div>
        </form>

        {input.trim().length > 0 && <div className="px-2 py-2">
            <div className="px-3 py-2 text-sm text-gray-400 flex items-center justify-between group cursor-pointer hover:bg-[#2a2a2a] rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Command className="w-4 h-4" />
                <span className="text-white">
                  Run command:{' '}
                  <span className="font-mono text-white font-bold">
                    {input}
                  </span>
                </span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>}

        {input.trim().length === 0 && <div className="px-4 py-8 text-center text-gray-600 text-sm font-mono">
            Type 'admin' to access system controls
          </div>}
      </div>
    </div>;
}