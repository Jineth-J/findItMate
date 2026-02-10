import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { validateEmail } from '../utils/validation';
import { authAPI } from '../services/api';
import { User } from '../types';

interface AdminLoginPageProps {
  onLogin: (userData: User) => void;
  onBack: () => void;
}

export function AdminLoginPage({
  onLogin,
  onBack
}: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});

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
      if (!error) setError('Please check your credentials');
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
          setError('Access denied. This portal is for administrators only.');
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
      } else {
        setError(response.message || 'Invalid credentials');
        setInvalidFields({ email: true, password: true });
        triggerShake();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
      setInvalidFields({ email: true, password: true });
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };
  const getInputClass = (fieldName: string) => {
    const baseClass = 'w-full bg-[#0a0a0a] border px-12 py-3.5 rounded-lg focus:outline-none transition-all placeholder:text-gray-700';
    if (invalidFields[fieldName]) {
      return `${baseClass} border-red-500/50 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 ${shake ? 'animate-shake' : ''}`;
    }
    return `${baseClass} border-[#333] text-white focus:border-red-600 focus:ring-1 focus:ring-red-600`;
  };
  return <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4 font-mono text-gray-300">
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1a1a1a] rounded-2xl mb-6 border border-[#333] shadow-lg shadow-black/50">
          <Shield className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          FindItMate <span className="text-red-600">Admin</span>
        </h1>
        <p className="text-gray-500 text-sm">Secure Access Terminal v2.0</p>
      </div>

      {/* Login Card */}
      <div className="bg-[#161616] border border-[#333] rounded-xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">
              Admin Identifier <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${invalidFields.email ? 'text-red-500' : 'text-gray-600 group-focus-within:text-red-500'}`} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={getInputClass('email')} placeholder="admin@finditmate.com" autoComplete="off" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">
              Security Key <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${invalidFields.password ? 'text-red-500' : 'text-gray-600 group-focus-within:text-red-500'}`} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={getInputClass('password')} placeholder="••••••••••••" />
            </div>
          </div>

          {error && <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>}

          <button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20">
            {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>
              Authenticate <ArrowRight className="w-4 h-4" />
            </>}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-400 text-sm transition-colors flex items-center justify-center gap-2 mx-auto">
          ← Return to public site
        </button>
      </div>
    </div>
  </div>;
}