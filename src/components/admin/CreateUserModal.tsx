import React, { useEffect, useState } from 'react';
import { X, UserPlus, Mail, Lock, User, Shield, Phone, CreditCard, ArrowRight } from 'lucide-react';
import { FormErrorBanner } from '../FormErrorBanner';
import { PasswordRequirements } from '../PasswordRequirements';
import { validateEmail, validateSriLankanPhone, validateNIC, validatePassword } from '../../utils/validation';
import { authAPI } from '../../services/api';
interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}
export function CreateUserModal({
  isOpen,
  onClose,
  onSubmit
}: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    role: 'Student',
    email: '',
    phone: '',
    nic: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        role: 'Student',
        email: '',
        phone: '',
        nic: '',
        password: ''
      });
      setFormErrors([]);
      setInvalidFields({});
      setShake(false);
    }
  }, [isOpen]);
  if (!isOpen) return null;
  const triggerShake = () => {
    setShake(false);
    setTimeout(() => setShake(true), 50);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user types
    if (invalidFields[name]) {
      setInvalidFields((prev) => {
        const next = {
          ...prev
        };
        delete next[name];
        return next;
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    const invalid: Record<string, boolean> = {};
    if (!formData.name.trim()) {
      errors.push('Full Name is required');
      invalid.name = true;
    }
    if (!formData.email) {
      errors.push('Email is required');
      invalid.email = true;
    } else if (!validateEmail(formData.email)) {
      errors.push('Please enter a valid email address');
      invalid.email = true;
    }
    if (!formData.phone) {
      errors.push('Phone number is required');
      invalid.phone = true;
    } else if (!validateSriLankanPhone(formData.phone)) {
      errors.push('Please enter a valid Sri Lankan phone number');
      invalid.phone = true;
    }
    if (!formData.nic) {
      errors.push('NIC number is required');
      invalid.nic = true;
    } else if (!validateNIC(formData.nic)) {
      errors.push('Please enter a valid NIC number');
      invalid.nic = true;
    }
    if (!formData.password) {
      errors.push('Password is required');
      invalid.password = true;
    } else if (!validatePassword(formData.password)) {
      errors.push('Password does not meet requirements');
      invalid.password = true;
    }
    if (errors.length > 0) {
      setFormErrors(errors);
      setInvalidFields(invalid);
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        userType: formData.role.toLowerCase() === 'administrator' ? 'admin' : formData.role.toLowerCase()
      };
      // Use adminAPI to create user (avoids auto-login side effects)
      // @ts-ignore
      const { adminAPI } = await import('../../services/api');
      await adminAPI.createUser(payload);
      onSubmit(formData);
      onClose();
    } catch (error: any) {
      console.error('Registration failed:', error);
      setFormErrors([error.message || 'Registration failed']);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };
  const getInputClass = (fieldName: string) => {
    const baseClass = 'w-full bg-[#0a0a0a] border rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none transition-all';
    if (invalidFields[fieldName]) {
      return `${baseClass} border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500 ${shake ? 'animate-shake' : ''}`;
    }
    return `${baseClass} border-[#333] focus:border-red-600 focus:ring-1 focus:ring-red-600`;
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="w-full max-w-2xl bg-[#161616] border border-[#333] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="p-6 border-b border-[#333] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#222] rounded-lg border border-[#333]">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create New User</h2>
            <p className="text-sm text-gray-500">
              Add a new administrator, landlord, or student
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form */}
      <div className="p-8 overflow-y-auto bg-[#0f0f0f]">
        <FormErrorBanner errors={formErrors} onDismiss={() => setFormErrors([])} className="bg-red-900/10 border-red-900/30 text-red-200" />

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={getInputClass('name')} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Role
              </label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer">
                  <option>Student</option>
                  <option>Landlord</option>
                  <option>Administrator</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className={getInputClass('email')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+94 77..." className={getInputClass('phone')} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                NIC / ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" name="nic" value={formData.nic} onChange={handleChange} placeholder="ID Number" className={getInputClass('nic')} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••••••" className={getInputClass('password')} />
            </div>
            <PasswordRequirements password={formData.password} />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-[#333] mt-6">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-[#222] hover:bg-[#333] text-white rounded-lg font-medium transition-colors border border-[#333]">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating...' : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>;
}