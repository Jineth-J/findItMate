import React, { useEffect, useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, X, AlertCircle, Terminal } from 'lucide-react';
import { validateEmail } from '../utils/validation';
import { authAPI } from '../services/api';
import { User } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: User) => void;
}

export function AdminLoginModal({
  isOpen,
  onClose,
  onLogin
}: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setIsLoading(false);
      setShake(false);
      setInvalidFields({});
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerShake = () => {
    setShake(false);
    setTimeout(() => setShake(true), 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const invalid: Record<string, boolean> = {};
    let hasError = false;

    if (!email) {
      invalid.email = true;
      hasError = true;
    } else if (!validateEmail(email)) {
      invalid.email = true;
      hasError = true;
      setError('Invalid email format');
    }
    if (!password) {
      invalid.password = true;
      hasError = true;
    }

    if (hasError) {
      setInvalidFields(invalid);
      triggerShake();
      if (!error) setError('Credentials required');
      return;
    }

    setIsLoading(true);

    try {
      // Call the actual backend API to authenticate
      const response = await authAPI.login({ email, password });

      if (response.success && response.data) {
        const userData = response.data.user;

        // CRITICAL: Verify the user is actually an admin from the database
        if (userData.userType !== 'admin') {
          setError('Access denied. Admin privileges required.');
          setInvalidFields({ email: true, password: true });
          triggerShake();
          setIsLoading(false);
          return;
        }

        // User is verified as admin from database - grant access
        const adminUser: User = {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          type: 'admin',
          isVerified: userData.isVerified
        };
        onLogin(adminUser);
        onClose();
      } else {
        setError(response.message || 'Invalid credentials');
        setInvalidFields({ email: true, password: true });
        triggerShake();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setInvalidFields({ email: true, password: true });
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };
  const getInputClass = (fieldName: string) => {
    const baseClass = 'block w-full pl-10 pr-3 py-3 bg-[#1e293b] border text-white placeholder-gray-600 focus:outline-none transition-all text-sm rounded-none';
    if (invalidFields[fieldName]) {
      return `${baseClass} border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500 ${shake ? 'animate-shake' : ''}`;
    }
    return `${baseClass} border-[#334155] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]`;
  };
  return <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
    <div className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] shadow-2xl relative overflow-hidden">
      {/* Decorative top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#10b981] to-blue-600"></div>

      {/* Scanline effect overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%]"></div>

      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10">
        <X className="w-5 h-5" />
      </button>

      <div className="p-8 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#1e293b] border border-[#334155]">
            <Shield className="w-6 h-6 text-[#10b981]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wider uppercase">
              System Admin
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#10b981]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              SECURE CONNECTION
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
              Admin Identifier <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Terminal className={`h-4 w-4 transition-colors ${invalidFields.email ? 'text-red-500' : 'text-gray-500 group-focus-within:text-[#10b981]'}`} />
              </div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={getInputClass('email')} placeholder="admin@system.local" autoComplete="off" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
              Security Key <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`h-4 w-4 transition-colors ${invalidFields.password ? 'text-red-500' : 'text-gray-500 group-focus-within:text-[#10b981]'}`} />
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={getInputClass('password')} placeholder="••••••••••••" />
            </div>
          </div>

          {error && <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 p-3 border border-red-900/50 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>}

          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-[#0f172a] font-bold py-3 px-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-none uppercase tracking-wider text-sm">
            {isLoading ? <span className="w-4 h-4 border-2 border-[#0f172a]/30 border-t-[#0f172a] rounded-full animate-spin" /> : <>
              Authenticate <ArrowRight className="w-4 h-4" />
            </>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onClose} className="text-xs text-gray-500 hover:text-[#10b981] transition-colors uppercase tracking-widest">
            [ Return to Public Site ]
          </button>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="bg-[#020617] px-4 py-2 flex justify-between items-center text-[10px] text-gray-600 border-t border-[#1e293b]">
        <span>SYS.ADMIN.V2.4</span>
        <span>ENCRYPTED_SHA256</span>
      </div>
    </div>
  </div>;
}