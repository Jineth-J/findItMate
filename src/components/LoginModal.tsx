import React, { useEffect, useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  X,
  User,
  Phone,
  CreditCard,
  Building,
  Home,
  GraduationCap,
  ClipboardList
} from
  'lucide-react';
import { FormErrorBanner } from './FormErrorBanner';
import { PasswordRequirements } from './PasswordRequirements';
import {
  validateEmail,
  validateSriLankanPhone,
  validateNIC,
  validatePassword
} from
  '../utils/validation';
import { authAPI, setAuthToken } from '../services/api';
type ModalView =
  'student-login' |
  'landlord-login' |
  'student-signup' |
  'landlord-signup' |
  'landlord-signup';
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: { id: string; name: string; email: string; type: 'student' | 'landlord'; isVerified: boolean; verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected' }) => void;
  defaultTab?: 'student' | 'landlord';
}
export function LoginModal({
  isOpen,
  onClose,
  onLogin,
  defaultTab = 'student'
}: LoginModalProps) {
  const [currentView, setCurrentView] = useState<ModalView>(
    defaultTab === 'student' ? 'student-login' : 'landlord-login'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);
  // Validation State
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>(
    {}
  );
  const [shake, setShake] = useState(false);
  // Student login form state
  const [studentLoginEmail, setStudentLoginEmail] = useState('');
  const [studentLoginPassword, setStudentLoginPassword] = useState('');
  // Landlord login form state
  const [landlordLoginEmail, setLandlordLoginEmail] = useState('');
  const [landlordLoginPassword, setLandlordLoginPassword] = useState('');
  // Student signup form state
  const [studentSignupName, setStudentSignupName] = useState('');
  const [studentSignupEmail, setStudentSignupEmail] = useState('');
  const [studentSignupPhone, setStudentSignupPhone] = useState('');
  const [studentSignupNIC, setStudentSignupNIC] = useState('');
  const [studentSignupPassword, setStudentSignupPassword] = useState('');
  const [studentSignupConfirmPassword, setStudentSignupConfirmPassword] =
    useState('');
  // Landlord signup form state
  const [landlordSignupName, setLandlordSignupName] = useState('');
  const [landlordSignupEmail, setLandlordSignupEmail] = useState('');
  const [landlordSignupPhone, setLandlordSignupPhone] = useState('');
  const [landlordSignupNIC, setLandlordSignupNIC] = useState('');
  const [landlordSignupBusiness, setLandlordSignupBusiness] = useState('');
  const [landlordSignupPassword, setLandlordSignupPassword] = useState('');
  const [landlordSignupConfirmPassword, setLandlordSignupConfirmPassword] =
    useState('');
  // Reset to default view when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentView(
        defaultTab === 'student' ? 'student-login' : 'landlord-login'
      );
      setShowPassword(false);
      setShowConfirmPassword(false);
      setFormErrors([]);
      setInvalidFields({});
      setShake(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, defaultTab]);
  // Clear errors when switching views
  useEffect(() => {
    setFormErrors([]);
    setInvalidFields({});
    setShake(false);
  }, [currentView]);
  if (!isOpen) return null;
  const triggerShake = () => {
    setShake(false);
    setTimeout(() => setShake(true), 50);
  };
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    const invalid: Record<string, boolean> = {};
    if (!studentLoginEmail) {
      errors.push('Email is required');
      invalid.email = true;
    } else if (!validateEmail(studentLoginEmail)) {
      errors.push('Please enter a valid email address');
      invalid.email = true;
    }
    if (!studentLoginPassword) {
      errors.push('Password is required');
      invalid.password = true;
    }
    if (errors.length > 0) {
      setFormErrors(errors);
      setInvalidFields(invalid);
      triggerShake();
      return;
    }
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email: studentLoginEmail, password: studentLoginPassword });
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        const userData = response.data.user;
        onLogin({
          id: userData._id,
          name: userData.name,
          email: userData.email,
          type: userData.userType as 'student' | 'landlord',
          isVerified: userData.verificationStatus === 'verified',
          verificationStatus: userData.verificationStatus
        });
        onClose();
      } else {
        setFormErrors([response.message || 'Login failed']);
        triggerShake();
      }
    } catch (error: any) {
      setFormErrors([error.message || 'Login failed. Please try again.']);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };
  const handleLandlordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    const invalid: Record<string, boolean> = {};
    if (!landlordLoginEmail) {
      errors.push('Email is required');
      invalid.email = true;
    } else if (!validateEmail(landlordLoginEmail)) {
      errors.push('Please enter a valid email address');
      invalid.email = true;
    }
    if (!landlordLoginPassword) {
      errors.push('Password is required');
      invalid.password = true;
    }
    if (errors.length > 0) {
      setFormErrors(errors);
      setInvalidFields(invalid);
      triggerShake();
      return;
    }
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email: landlordLoginEmail, password: landlordLoginPassword });
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        const userData = response.data.user;
        onLogin({
          id: userData._id,
          name: userData.name,
          email: userData.email,
          type: userData.userType as 'student' | 'landlord',
          isVerified: userData.verificationStatus === 'verified',
          verificationStatus: userData.verificationStatus
        });
        onClose();
      } else {
        setFormErrors([response.message || 'Login failed']);
        triggerShake();
      }
    } catch (error: any) {
      setFormErrors([error.message || 'Login failed. Please try again.']);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };
  const handleStudentSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    const invalid: Record<string, boolean> = {};
    if (!studentSignupName.trim()) {
      errors.push('Full Name is required');
      invalid.name = true;
    }
    if (!studentSignupEmail) {
      errors.push('Email is required');
      invalid.email = true;
    } else if (!validateEmail(studentSignupEmail)) {
      errors.push('Please enter a valid email address');
      invalid.email = true;
    }
    if (!studentSignupPhone) {
      errors.push('Phone number is required');
      invalid.phone = true;
    } else if (!validateSriLankanPhone(studentSignupPhone)) {
      errors.push('Please enter a valid Sri Lankan phone number');
      invalid.phone = true;
    }
    if (!studentSignupNIC) {
      errors.push('NIC number is required');
      invalid.nic = true;
    } else if (!validateNIC(studentSignupNIC)) {
      errors.push('Please enter a valid NIC number');
      invalid.nic = true;
    }
    if (!studentSignupPassword) {
      errors.push('Password is required');
      invalid.password = true;
    } else if (!validatePassword(studentSignupPassword)) {
      errors.push('Password does not meet requirements');
      invalid.password = true;
    }
    if (studentSignupPassword !== studentSignupConfirmPassword) {
      errors.push('Passwords do not match');
      invalid.confirmPassword = true;
    }
    if (errors.length > 0) {
      setFormErrors(errors);
      setInvalidFields(invalid);
      triggerShake();
      return;
    }
    setIsLoading(true);
    try {
      const response = await authAPI.register({
        email: studentSignupEmail,
        password: studentSignupPassword,
        name: studentSignupName,
        phone: studentSignupPhone,
        nic: studentSignupNIC,
        userType: 'student'
      });
      if (response.success && response.data) {
        // Auto-login success
        setAuthToken(response.data.token);
        const userData = response.data.user;
        onLogin({
          id: userData._id,
          name: userData.name,
          email: userData.email,
          type: userData.userType as 'student' | 'landlord',
          isVerified: userData.verificationStatus === 'verified',
          verificationStatus: userData.verificationStatus
        });
        onClose();
      } else {
        setFormErrors([response.message || 'Registration failed']);
        triggerShake();
      }
    } catch (error: any) {
      setFormErrors([error.message || 'Registration failed. Please try again.']);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };
  const handleLandlordSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    const invalid: Record<string, boolean> = {};
    if (!landlordSignupName.trim()) {
      errors.push('Full Name is required');
      invalid.name = true;
    }
    if (!landlordSignupEmail) {
      errors.push('Email is required');
      invalid.email = true;
    } else if (!validateEmail(landlordSignupEmail)) {
      errors.push('Please enter a valid email address');
      invalid.email = true;
    }
    if (!landlordSignupPhone) {
      errors.push('Phone number is required');
      invalid.phone = true;
    } else if (!validateSriLankanPhone(landlordSignupPhone)) {
      errors.push('Please enter a valid Sri Lankan phone number');
      invalid.phone = true;
    }
    if (!landlordSignupNIC) {
      errors.push('NIC number is required');
      invalid.nic = true;
    } else if (!validateNIC(landlordSignupNIC)) {
      errors.push('Please enter a valid NIC number');
      invalid.nic = true;
    }
    if (!landlordSignupPassword) {
      errors.push('Password is required');
      invalid.password = true;
    } else if (!validatePassword(landlordSignupPassword)) {
      errors.push('Password does not meet requirements');
      invalid.password = true;
    }
    if (landlordSignupPassword !== landlordSignupConfirmPassword) {
      errors.push('Passwords do not match');
      invalid.confirmPassword = true;
    }
    if (errors.length > 0) {
      setFormErrors(errors);
      setInvalidFields(invalid);
      triggerShake();
      return;
    }
    setIsLoading(true);
    try {
      const response = await authAPI.register({
        email: landlordSignupEmail,
        password: landlordSignupPassword,
        name: landlordSignupName,
        phone: landlordSignupPhone,
        nic: landlordSignupNIC,
        userType: 'landlord',
        businessName: landlordSignupBusiness
      });
      if (response.success && response.data) {
        // Auto-login success
        setAuthToken(response.data.token);
        const userData = response.data.user;
        onLogin({
          id: userData._id,
          name: userData.name,
          email: userData.email,
          type: userData.userType as 'student' | 'landlord',
          isVerified: userData.verificationStatus === 'verified',
          verificationStatus: userData.verificationStatus
        });
        onClose();
      } else {
        setFormErrors([response.message || 'Registration failed']);
        triggerShake();
      }
    } catch (error: any) {
      setFormErrors([error.message || 'Registration failed. Please try again.']);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  // Helper to get input class
  const getInputClass = (fieldName: string) => {
    const baseClass =
      'w-full pl-12 pr-4 py-4 bg-white border rounded-xl text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200';
    if (invalidFields[fieldName]) {
      return `${baseClass} border-amber-400 focus:ring-amber-400 bg-amber-50/30 ${shake ? 'animate-shake' : ''}`;
    }
    return `${baseClass} border-[#D7CCC8] focus:ring-[#795548]`;
  };
  const BackButton = () =>
    <button
      onClick={onClose}
      className="mt-2 mb-8 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-[#3E2723]/10 hover:bg-[#3E2723]/20 text-[#3E2723] transition-colors">

      <ArrowLeft className="h-5 w-5" />
      <span className="font-medium text-sm">Back</span>
    </button>;

  const CloseButton = () =>
    <button
      onClick={onClose}
      className="absolute top-6 right-6 z-10 p-2 rounded-full bg-[#3E2723]/10 hover:bg-[#3E2723]/20 text-[#3E2723] transition-colors lg:hidden">

      <X className="h-5 w-5" />
    </button>;

  const SignupPromoContent = () =>
    <div className="hidden lg:flex w-1/2 bg-[#3E2723] p-12 flex-col justify-center items-center text-white">
      <h2 className="text-3xl font-bold mb-4 leading-tight">
        Join the Largest
        <br />
        Student Housing
        <br />
        Community
      </h2>
      <p className="text-white/70 mb-12 max-w-sm text-center">
        Whether you're a student looking for accommodation or a landlord wanting
        to list properties, FindItMate has you covered.
      </p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-12">
        <div className="bg-white/10 rounded-xl p-6">
          <GraduationCap className="h-8 w-8 mb-4 text-white/80" />
          <h4 className="font-semibold mb-2">For Students</h4>
          <ul className="text-sm text-white/60 space-y-1">
            <li>• Verified listings</li>
            <li>• AI matching</li>
            <li>• Tour planner</li>
          </ul>
        </div>
        <div className="bg-white/10 rounded-xl p-6">
          <Building className="h-8 w-8 mb-4 text-white/80" />
          <h4 className="font-semibold mb-2">For Landlords</h4>
          <ul className="text-sm text-white/60 space-y-1">
            <li>• Easy listings</li>
            <li>• Manage inquiries</li>
            <li>• Analytics</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="text-3xl font-bold">2,000+</div>
          <div className="text-sm text-white/60">Students Registered</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">500+</div>
          <div className="text-sm text-white/60">Verified Properties</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">150+</div>
          <div className="text-sm text-white/60">Active Landlords</div>
        </div>
      </div>
    </div>;

  const SignupTabSwitcher = ({
    activeTab


  }: { activeTab: 'student' | 'landlord'; }) =>
    <div className="flex bg-gray-100 rounded-full p-1 mb-8">
      <button
        type="button"
        onClick={() => setCurrentView('student-signup')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'student' ? 'bg-[#D7CCC8] text-[#3E2723] shadow-sm' : 'text-gray-500 hover:text-[#3E2723]'}`}>

        <GraduationCap className="h-4 w-4" />
        Student
      </button>
      <button
        type="button"
        onClick={() => setCurrentView('landlord-signup')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'landlord' ? 'bg-[#D7CCC8] text-[#3E2723] shadow-sm' : 'text-gray-500 hover:text-[#3E2723]'}`}>

        <Building className="h-4 w-4" />
        Landlord
      </button>
    </div>;

  // ==================== STUDENT LOGIN VIEW ====================
  if (currentView === 'student-login') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}>

        <div className="relative w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto lg:overflow-visible">
          <CloseButton />

          <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 overflow-y-auto bg-[#F5F0E8]">
            <BackButton />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#3E2723]/10 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-[#3E2723]" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-[#3E2723]">FindItMate</h2>
                <p className="text-sm text-[#795548]">Student Portal</p>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#3E2723] mb-2">
              Welcome back, Student!
            </h1>
            <p className="text-[#795548] mb-8">
              Sign in to find your perfect accommodation
            </p>

            <FormErrorBanner
              errors={formErrors}
              onDismiss={() => setFormErrors([])} />


            <form onSubmit={handleStudentLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">
                  University Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                  <input
                    type="email"
                    value={studentLoginEmail}
                    onChange={(e) => setStudentLoginEmail(e.target.value)}
                    placeholder="your.email@university.edu"
                    className={getInputClass('email')} />

                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={studentLoginPassword}
                    onChange={(e) => setStudentLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={getInputClass('password')} />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#795548] hover:text-[#3E2723]">

                    {showPassword ?
                      <EyeOff className="h-5 w-5" /> :

                      <Eye className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#3E2723] text-white py-4 rounded-xl font-medium hover:bg-[#2D1B18] transition-colors flex items-center justify-center gap-2">

                Sign In
                <ArrowRight className="h-5 w-5" />
              </button>

              <div className="text-center text-sm">
                <span className="text-[#795548]">New to FindItMate?</span>{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('student-signup')}
                  className="text-[#3E2723] font-medium hover:underline">

                  Create account
                </button>
              </div>

              <div className="border-t border-[#D7CCC8] pt-6 text-center text-sm">
                <span className="text-[#795548]">
                  Looking to list property?
                </span>{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('landlord-login')}
                  className="text-[#3E2723] font-medium hover:underline">

                  Sign in as a landlord
                </button>
              </div>
            </form>
          </div>

          <div className="hidden lg:flex w-1/2 bg-[#3E2723] p-12 flex-col justify-center items-center text-white">
            <div className="w-20 h-20 border-2 border-white/30 rounded-2xl flex items-center justify-center mb-8">
              <GraduationCap className="h-10 w-10 text-white/80" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-4">
              Find Your Perfect Student Home
            </h2>
            <p className="text-center text-white/70 mb-12 max-w-sm">
              Join thousands of students who found safe, verified accommodation
              near UCSC.
            </p>
            {/* Promo items omitted for brevity but structure maintained */}
          </div>
        </div>
      </div>);

  }
  // ==================== LANDLORD LOGIN VIEW ====================
  if (currentView === 'landlord-login') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}>

        <div className="relative w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto lg:overflow-visible">
          <CloseButton />

          <div className="hidden lg:flex w-1/2 bg-[#5D4037] p-12 flex-col justify-center items-center text-white">
            <div className="w-20 h-20 border-2 border-white/30 rounded-2xl flex items-center justify-center mb-8">
              <ClipboardList className="h-10 w-10 text-white/80" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-4">
              Reach Thousands of Students
            </h2>
            <p className="text-center text-white/70 mb-12 max-w-sm">
              List your property on Sri Lanka's premier student accommodation
              platform.
            </p>
            {/* Promo items omitted */}
          </div>

          <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 overflow-y-auto bg-[#F5F0E8]">
            <BackButton />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#3E2723]/10 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-[#3E2723]" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-[#3E2723]">FindItMate</h2>
                <p className="text-sm text-[#795548]">Landlord Portal</p>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#3E2723] mb-2">
              Welcome back, Partner!
            </h1>
            <p className="text-[#795548] mb-8">
              Sign in to manage your properties
            </p>

            <FormErrorBanner
              errors={formErrors}
              onDismiss={() => setFormErrors([])} />


            <form onSubmit={handleLandlordLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                  <input
                    type="email"
                    value={landlordLoginEmail}
                    onChange={(e) => setLandlordLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={getInputClass('email')} />

                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={landlordLoginPassword}
                    onChange={(e) => setLandlordLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={getInputClass('password')} />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#795548] hover:text-[#3E2723]">

                    {showPassword ?
                      <EyeOff className="h-5 w-5" /> :

                      <Eye className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#3E2723] text-white py-4 rounded-xl font-medium hover:bg-[#2D1B18] transition-colors flex items-center justify-center gap-2">

                Sign In
                <ArrowRight className="h-5 w-5" />
              </button>

              <div className="text-center text-sm">
                <span className="text-[#795548]">New to FindItMate?</span>{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('landlord-signup')}
                  className="text-[#3E2723] font-medium hover:underline">

                  Create account
                </button>
              </div>

              <div className="border-t border-[#D7CCC8] pt-6 text-center text-sm">
                <span className="text-[#795548]">
                  Looking for accommodation?
                </span>{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('student-login')}
                  className="text-[#3E2723] font-medium hover:underline">

                  Sign in as a student
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>);

  }


  // ==================== STUDENT SIGNUP VIEW ====================
  if (currentView === 'student-signup') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}>

        <div className="relative w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto lg:overflow-visible">
          <CloseButton />

          <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 overflow-y-auto bg-white">
            <BackButton />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#3E2723]/10 rounded-xl flex items-center justify-center">
                <Home className="h-6 w-6 text-[#3E2723]" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-[#3E2723]">FindItMate</h2>
                <p className="text-sm text-[#795548]">Create Account</p>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#3E2723] mb-2">
              Create Your Account
            </h1>
            <p className="text-[#795548] mb-6">
              Join FindItMate today and get started
            </p>

            <SignupTabSwitcher activeTab="student" />
            <FormErrorBanner
              errors={formErrors}
              onDismiss={() => setFormErrors([])} />


            <form onSubmit={handleStudentSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                  <input
                    type="text"
                    value={studentSignupName}
                    onChange={(e) => setStudentSignupName(e.target.value)}
                    placeholder="Your full name"
                    className={getInputClass('name')} />

                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                  <input
                    type="email"
                    value={studentSignupEmail}
                    onChange={(e) => setStudentSignupEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className={getInputClass('email')} />

                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                    <input
                      type="tel"
                      value={studentSignupPhone}
                      onChange={(e) => setStudentSignupPhone(e.target.value)}
                      placeholder="+94 77..."
                      className={getInputClass('phone')} />

                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">
                    NIC Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                    <input
                      type="text"
                      value={studentSignupNIC}
                      onChange={(e) => setStudentSignupNIC(e.target.value)}
                      placeholder="199012345678"
                      className={getInputClass('nic')} />

                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={studentSignupPassword}
                    onChange={(e) => setStudentSignupPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className={getInputClass('password')} />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#795548] hover:text-[#3E2723]">

                    {showPassword ?
                      <EyeOff className="h-5 w-5" /> :

                      <Eye className="h-5 w-5" />
                    }
                  </button>
                </div>
                <PasswordRequirements password={studentSignupPassword} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={studentSignupConfirmPassword}
                    onChange={(e) =>
                      setStudentSignupConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm your password"
                    className={getInputClass('confirmPassword')} />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#795548] hover:text-[#3E2723]">

                    {showConfirmPassword ?
                      <EyeOff className="h-5 w-5" /> :

                      <Eye className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#D7CCC8] text-[#3E2723] py-4 rounded-xl font-medium hover:bg-[#BCAAA4] transition-colors flex items-center justify-center gap-2 mt-6">

                Create Student Account
                <ArrowRight className="h-5 w-5" />
              </button>

              <div className="text-center text-sm pt-2">
                <span className="text-[#795548]">Already have an account?</span>{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('student-login')}
                  className="text-[#3E2723] font-medium hover:underline">

                  Sign in here
                </button>
              </div>
            </form>
          </div>

          <SignupPromoContent />
        </div>
      </div>);

  }
  // ==================== LANDLORD SIGNUP VIEW ====================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}>

      <div className="relative w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto lg:overflow-visible">
        <CloseButton />

        <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 overflow-y-auto bg-white">
          <BackButton />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#3E2723]/10 rounded-xl flex items-center justify-center">
              <Home className="h-6 w-6 text-[#3E2723]" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-[#3E2723]">FindItMate</h2>
              <p className="text-sm text-[#795548]">Create Account</p>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#3E2723] mb-2">
            Create Your Account
          </h1>
          <p className="text-[#795548] mb-6">
            Join FindItMate today and get started
          </p>

          <SignupTabSwitcher activeTab="landlord" />
          <FormErrorBanner
            errors={formErrors}
            onDismiss={() => setFormErrors([])} />


          <form onSubmit={handleLandlordSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3E2723] mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                <input
                  type="text"
                  value={landlordSignupName}
                  onChange={(e) => setLandlordSignupName(e.target.value)}
                  placeholder="Your full name"
                  className={getInputClass('name')} />

              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3E2723] mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                <input
                  type="email"
                  value={landlordSignupEmail}
                  onChange={(e) => setLandlordSignupEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className={getInputClass('email')} />

              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                  <input
                    type="tel"
                    value={landlordSignupPhone}
                    onChange={(e) => setLandlordSignupPhone(e.target.value)}
                    placeholder="+94 771234567"
                    className={getInputClass('phone')} />

                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">
                  NIC Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                  <input
                    type="text"
                    value={landlordSignupNIC}
                    onChange={(e) => setLandlordSignupNIC(e.target.value)}
                    placeholder="199012345678"
                    className={getInputClass('nic')} />

                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3E2723] mb-2">
                Business/Property Name (Optional)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                <input
                  type="text"
                  value={landlordSignupBusiness}
                  onChange={(e) => setLandlordSignupBusiness(e.target.value)}
                  placeholder="e.g., Sunset Boarding House"
                  className={getInputClass('business')} />

              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3E2723] mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={landlordSignupPassword}
                  onChange={(e) => setLandlordSignupPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className={getInputClass('password')} />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#795548] hover:text-[#3E2723]">

                  {showPassword ?
                    <EyeOff className="h-5 w-5" /> :

                    <Eye className="h-5 w-5" />
                  }
                </button>
              </div>
              <PasswordRequirements password={landlordSignupPassword} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3E2723] mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#795548]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={landlordSignupConfirmPassword}
                  onChange={(e) =>
                    setLandlordSignupConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm your password"
                  className={getInputClass('confirmPassword')} />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#795548] hover:text-[#3E2723]">

                  {showConfirmPassword ?
                    <EyeOff className="h-5 w-5" /> :

                    <Eye className="h-5 w-5" />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#D7CCC8] text-[#3E2723] py-4 rounded-xl font-medium hover:bg-[#BCAAA4] transition-colors flex items-center justify-center gap-2 mt-6">

              Create Landlord Account
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="text-center text-sm pt-2">
              <span className="text-[#795548]">Already have an account?</span>{' '}
              <button
                type="button"
                onClick={() => setCurrentView('landlord-login')}
                className="text-[#3E2723] font-medium hover:underline">

                Sign in here
              </button>
            </div>
          </form>
        </div>

        <SignupPromoContent />
      </div>
    </div>);

}