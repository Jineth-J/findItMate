import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Settings,
  User,
  Globe,
  Bell,
  Shield,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  CreditCard,
  Save,
  Moon,
  Sun,
  Monitor,
  Check,
  MessageSquare,
  Eye,
  Calendar,
  Lock,
  Download,
  Trash2,
  LogOut,
  Smartphone,
  Building,
  Sparkles,
  Globe2,
  ChevronDown
} from
  'lucide-react';
import { User as UserType } from '../types';
import { usersAPI } from '../services/api';
interface LandlordSettingsPageProps {
  user: UserType;
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onOpenSubscription: () => void;
  onUserUpdate?: (updatedUser: Partial<UserType>) => void;
}
type Tab = 'landlord' | 'theme' | 'alerts' | 'account';
export function LandlordSettingsPage({
  user,
  onBack,
  onNavigate,
  onLogout,
  onOpenSubscription,
  onUserUpdate
}: LandlordSettingsPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('landlord');
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [accentColor, setAccentColor] = useState('brown');
  // New State for Account Settings
  const [twoFactorAuthenticator, setTwoFactorAuthenticator] = useState(false);
  const [twoFactorSMS, setTwoFactorSMS] = useState(false);
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('LKR');
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  // Alerts State
  const [alerts, setAlerts] = useState({
    newInquiries: true,
    bookings: true,
    weeklySummary: false,
    marketing: false,
    pushMessages: true,
    pushViews: false,
    pushReminders: true,
    pushSecurity: true,
    quietHours: false
  });
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  // File Upload Refs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await usersAPI.getMe();
        if (response.success && response.data) {
          const userData = response.data.user;
          setFullName(userData.name || '');
          setEmail(userData.email || '');
          setPhone(userData.phone || '');
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Fall back to props
        setFullName(user?.name || '');
        setEmail(user?.email || '');
      }
    };
    fetchProfile();
  }, [user]);
  const handleProfileUploadClick = () => {
    profileInputRef.current?.click();
  };
  const handleDocUploadClick = () => {
    docInputRef.current?.click();
  };
  const handleProfileFileChange = (
    event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDocFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert(`Document ${file.name} uploaded successfully!`);
    }
  };
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const response = await usersAPI.updateMe({
        name: fullName,
        phone: phone,
      });
      if (response.success) {
        setSaveMessage('Profile updated successfully!');
        // Update the user in parent component to reflect changes in the bar
        if (onUserUpdate) {
          onUserUpdate({ name: fullName });
        }
        setTimeout(() => {
          setSaveMessage('');
          onBack();
        }, 1500);
      } else {
        setSaveMessage('Failed to update profile');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      setSaveMessage(error.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };
  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  const handlePasswordUpdate = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setPasswordError('');
    alert('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await usersAPI.deleteMe();
      if (response.success) {
        onLogout();
      } else {
        alert('Failed to delete account: ' + response.message);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('An error occurred while deleting your account');
    }
  };

  // Tab Navigation Component
  const TabNav = () =>
    <div className="flex bg-white p-1 rounded-xl mb-8 shadow-sm border border-[#E8E0D5]">
      <button
        onClick={() => setActiveTab('landlord')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'landlord' ? 'bg-[#3E2723] text-white shadow-sm' : 'text-[#5D4037] hover:bg-[#F5F0E8]'}`}>

        <User className="h-4 w-4" />
        Landlord
      </button>
      <button
        onClick={() => setActiveTab('theme')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'theme' ? 'bg-[#3E2723] text-white shadow-sm' : 'text-[#5D4037] hover:bg-[#F5F0E8]'}`}>

        <Globe className="h-4 w-4" />
        Theme
      </button>
      <button
        onClick={() => setActiveTab('alerts')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'alerts' ? 'bg-[#3E2723] text-white shadow-sm' : 'text-[#5D4037] hover:bg-[#F5F0E8]'}`}>

        <Bell className="h-4 w-4" />
        Alerts
      </button>
      <button
        onClick={() => setActiveTab('account')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'account' ? 'bg-[#3E2723] text-white shadow-sm' : 'text-[#5D4037] hover:bg-[#F5F0E8]'}`}>

        <Shield className="h-4 w-4" />
        Account
      </button>
    </div>;

  return (
    <div
      className={`min-h-screen pb-20 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#F5F0E8]'}`}>

      {/* Header */}
      <div
        className={`${theme === 'dark' ? 'bg-[#2d2d2d]' : 'bg-[#F5F0E8]'} sticky top-0 z-10 pt-8 pb-4 px-4 sm:px-6 lg:px-8`}>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="p-2 hover:bg-[#3E2723]/10 rounded-full transition-colors">

              <ArrowLeft
                className={`h-6 w-6 ${theme === 'dark' ? 'text-white' : 'text-[#3E2723]'}`} />

            </button>
            <div className="w-10 h-10 bg-[#E8E0D5] rounded-xl flex items-center justify-center">
              <Settings className="h-5 w-5 text-[#3E2723]" />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#3E2723]'}`}>

                Settings
              </h1>
              <p
                className={`${theme === 'dark' ? 'text-gray-400' : 'text-[#5D4037]'} text-sm`}>

                Manage your account preferences
              </p>
            </div>
          </div>

          <TabNav />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* LANDLORD PROFILE TAB */}
        {activeTab === 'landlord' &&
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-[#3E2723]" />
                <h2 className="text-lg font-bold text-[#3E2723]">
                  Profile Picture
                </h2>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-[#EFEBE9] flex items-center justify-center overflow-hidden">
                  {profileImage ?
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover" /> :


                    <span className="text-2xl font-bold text-[#5D4037]">
                      {user?.name?.substring(0, 2).toUpperCase() || 'KP'}
                    </span>
                  }
                </div>
                <div>
                  <input
                    type="file"
                    ref={profileInputRef}
                    onChange={handleProfileFileChange}
                    accept="image/png, image/jpeg"
                    className="hidden" />

                  <button
                    onClick={handleProfileUploadClick}
                    className="px-4 py-2 bg-[#F5F5F5] text-[#3E2723] text-sm font-medium rounded-lg hover:bg-[#E0E0E0] transition-colors mb-2">

                    Upload Photo
                  </button>
                  <p className="text-xs text-[#9E9E9E]">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-5 w-5 text-[#3E2723]" />
                <h2 className="text-lg font-bold text-[#3E2723]">
                  Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-medium text-[#5D4037] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5D4037] mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="How students will see your name"
                    className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-[#5D4037] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723] cursor-not-allowed opacity-60" />

                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-[#5D4037] mb-2">
                    Primary Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full pl-10 pr-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5D4037] mb-2">
                    Secondary Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
                    <input
                      type="tel"
                      defaultValue="+94 11 234 5678"
                      className="w-full pl-10 pr-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-5 w-5 text-[#3E2723]" />
                <h2 className="text-lg font-bold text-[#3E2723]">
                  Business Information
                </h2>
              </div>
              <p className="text-sm text-[#795548] mb-6">
                Details about your rental business
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-[#5D4037] mb-2">
                    Business Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Colombo Student Homes"
                    className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5D4037] mb-2">
                    Business Address
                  </label>
                  <input
                    type="text"
                    defaultValue="123 Reid Avenue, Colombo 07"
                    className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-[#5D4037] mb-2">
                      Number of Properties
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5D4037] mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      defaultValue="3"
                      className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5D4037] mb-2">
                    About Your Properties
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your properties and what makes them special for students..."
                    className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723] resize-none">
                  </textarea>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-5 w-5 text-[#3E2723]" />
                <h2 className="text-lg font-bold text-[#3E2723]">
                  Verification Status
                </h2>
              </div>

              <div className="bg-[#F5F0E8] rounded-xl p-4 flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${user.isVerified ? 'bg-green-100' : 'bg-[#E0E0E0]'}`}>

                    <CheckCircle
                      className={`h-5 w-5 ${user.isVerified ? 'text-green-600' : 'text-[#9E9E9E]'}`} />

                  </div>
                  <div>
                    <h4 className="font-medium text-[#3E2723]">
                      {user.isVerified ?
                        'Account Verified' :
                        'Account not verified'}
                    </h4>
                    <p className="text-xs text-[#795548]">
                      {user.isVerified ?
                        'You are a verified landlord' :
                        'Complete verification to list properties'}
                    </p>
                  </div>
                </div>
                {!user.isVerified &&
                  <button
                    onClick={() => onNavigate('landlord-verification')}
                    className="px-4 py-2 bg-[#3E2723] text-white text-sm font-medium rounded-lg hover:bg-[#2D1B18] transition-colors">

                    Verify Now
                  </button>
                }
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="h-5 w-5 text-[#3E2723]" />
                <h2 className="text-lg font-bold text-[#3E2723]">
                  Subscription
                </h2>
              </div>
              <p className="text-sm text-[#795548] mb-6">
                Manage your subscription plan
              </p>

              <div className="bg-[#F5F0E8] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-[#3E2723] tracking-widest">
                    FREE
                  </div>
                  <div className="h-8 w-px bg-[#D7CCC8]"></div>
                  <div>
                    <h4 className="font-bold text-[#3E2723]">Free Plan</h4>
                    <p className="text-xs text-[#795548]">
                      1 Property, Basic support
                    </p>
                  </div>
                </div>
                <button
                  onClick={onOpenSubscription}
                  className="px-6 py-2 bg-[#3E2723] text-white font-medium rounded-lg hover:bg-[#2D1B18] transition-colors shadow-sm">

                  Subscribe
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {saveMessage && (
                <span className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {saveMessage}
                </span>
              )}
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className={`flex items-center gap-2 px-6 py-3 bg-[#3E2723] text-white font-medium rounded-xl hover:bg-[#2D1B18] transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>

                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Button Previews */}
          </div>
        }

        {/* THEME TAB */}
        {activeTab === 'theme' &&
          <div className="space-y-6">
            {/* Theme Selection */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="h-5 w-5 text-[#3E2723]" />
                <h2 className="text-lg font-bold text-[#3E2723]">Theme</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-[#3E2723] bg-[#EFEBE9]' : 'border-transparent bg-[#F5F5F5] hover:bg-[#EEEEEE]'}`}>

                  <div className="w-12 h-12 rounded-full bg-[#3E2723] flex items-center justify-center mb-4">
                    <Sun className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-bold text-[#3E2723] mb-1">Light</span>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-[#3E2723] bg-[#EFEBE9]' : 'border-transparent bg-[#F5F5F5] hover:bg-[#EEEEEE]'}`}>

                  <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
                    <Moon className="h-6 w-6 text-[#3E2723]" />
                  </div>
                  <span className="font-bold text-[#3E2723] mb-1">Dark</span>
                </button>

                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${theme === 'system' ? 'border-[#3E2723] bg-[#EFEBE9]' : 'border-transparent bg-[#F5F5F5] hover:bg-[#EEEEEE]'}`}>

                  <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
                    <Monitor className="h-6 w-6 text-[#3E2723]" />
                  </div>
                  <span className="font-bold text-[#3E2723] mb-1">System</span>
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[#3E2723] mb-2">
                Accent Color
              </h2>
              <p className="text-sm text-[#795548] mb-8">
                Customize the primary color throughout the app
              </p>

              <div className="flex gap-6">
                {[
                  {
                    id: 'brown',
                    color: '#3E2723',
                    label: 'Brown'
                  },
                  {
                    id: 'blue',
                    color: '#1E88E5',
                    label: 'Blue'
                  },
                  {
                    id: 'green',
                    color: '#43A047',
                    label: 'Green'
                  },
                  {
                    id: 'orange',
                    color: '#FB8C00',
                    label: 'Orange'
                  }].
                  map((color) =>
                    <button
                      key={color.id}
                      onClick={() => setAccentColor(color.id)}
                      className="flex flex-col items-center gap-2">

                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${accentColor === color.id ? 'scale-110 ring-2 ring-offset-2 ring-[#3E2723]' : ''}`}
                        style={{
                          backgroundColor: color.color
                        }}>

                        {accentColor === color.id &&
                          <Check className="h-6 w-6 text-white" />
                        }
                      </div>
                      <span className="text-xs font-medium text-[#5D4037]">
                        {color.label}
                      </span>
                    </button>
                  )}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[#3E2723] mb-2">Preview</h2>
              <p className="text-sm text-[#795548] mb-8">
                See how your changes will look
              </p>

              <div className="bg-[#F9F9F9] border border-[#E8E0D5] rounded-xl p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#5D4037] flex items-center justify-center text-white font-bold text-lg">
                    FI
                  </div>
                  <div>
                    <h4 className="font-bold text-[#3E2723]">FindItMate</h4>
                    <p className="text-xs text-[#795548]">
                      Your perfect home awaits
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 mb-8">
                  <button className="px-6 py-2.5 bg-[#3E2723] text-white text-sm font-medium rounded-full shadow-sm">
                    Primary Button
                  </button>
                  <button className="px-6 py-2.5 bg-[#EFEBE9] text-[#3E2723] text-sm font-medium rounded-full hover:bg-[#E0E0E0]">
                    Secondary
                  </button>
                </div>

                <div className="bg-white border border-[#E8E0D5] rounded-xl p-4 text-sm text-[#5D4037] text-center">
                  This is how cards and content will appear with your selected
                  theme.
                </div>
              </div>
            </div>
          </div>
        }

        {/* ALERTS TAB */}
        {activeTab === 'alerts' &&
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="h-5 w-5 text-[#3E2723]" />
                <h2 className="text-lg font-bold text-[#3E2723]">
                  Email Notifications
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: 'newInquiries',
                    title: 'New Inquiries',
                    desc: 'Get notified when students inquire about your properties'
                  },
                  {
                    key: 'bookings',
                    title: 'Booking Confirmations',
                    desc: 'Receive confirmation when bookings are made'
                  },
                  {
                    key: 'weeklySummary',
                    title: 'Weekly Summary',
                    desc: 'Get a weekly report of your property performance'
                  },
                  {
                    key: 'marketing',
                    title: 'Marketing Emails',
                    desc: 'Tips, product updates, and promotional offers'
                  }].
                  map((item) =>
                    <div
                      key={item.key}
                      className="bg-[#F5F0E8] rounded-xl p-4 flex items-center justify-between">

                      <div>
                        <h4 className="font-medium text-[#3E2723] text-sm">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#795548]">{item.desc}</p>
                      </div>
                      <div
                        onClick={() =>
                          toggleAlert(item.key as keyof typeof alerts)
                        }
                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${alerts[item.key as keyof typeof alerts] ? 'bg-[#3E2723]' : 'bg-[#D7CCC8]'}`}>

                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${alerts[item.key as keyof typeof alerts] ? 'translate-x-6' : ''}`}>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="h-5 w-5 text-[#3E2723]" />
                <h2 className="text-lg font-bold text-[#3E2723]">
                  Push Notifications
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: 'pushMessages',
                    icon: MessageSquare,
                    title: 'Messages',
                    desc: 'New messages from students or landlords'
                  },
                  {
                    key: 'pushViews',
                    icon: Eye,
                    title: 'Property Views',
                    desc: 'When someone views your property listing'
                  },
                  {
                    key: 'pushReminders',
                    icon: Calendar,
                    title: 'Tour Reminders',
                    desc: 'Reminders for scheduled property tours'
                  },
                  {
                    key: 'pushSecurity',
                    icon: Shield,
                    title: 'Security Alerts',
                    desc: 'Login attempts and account security'
                  }].
                  map((item) =>
                    <div key={item.key} className="flex items-start gap-4 p-2">
                      <div className="w-10 h-10 rounded-xl bg-[#F5F0E8] flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-[#5D4037]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-[#3E2723] text-sm">
                            {item.title}
                          </h4>
                          <div
                            onClick={() =>
                              toggleAlert(item.key as keyof typeof alerts)
                            }
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${alerts[item.key as keyof typeof alerts] ? 'bg-[#3E2723]' : 'bg-[#D7CCC8]'}`}>

                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform ${alerts[item.key as keyof typeof alerts] ? 'translate-x-6' : ''}`}>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-[#795548]">{item.desc}</p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[#3E2723] mb-2">
                Quiet Hours
              </h2>
              <p className="text-sm text-[#795548] mb-6">
                Pause notifications during specific times
              </p>

              <div className="bg-[#F5F0E8] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-[#3E2723] text-sm">
                    Enable Quiet Hours
                  </h4>
                  <p className="text-xs text-[#795548]">
                    No notifications between 10 PM - 8 AM
                  </p>
                </div>
                <div
                  onClick={() => toggleAlert('quietHours')}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${alerts.quietHours ? 'bg-[#3E2723]' : 'bg-[#D7CCC8]'}`}>

                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${alerts.quietHours ? 'translate-x-6' : ''}`}>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        {/* ACCOUNT TAB */}
        {activeTab === 'account' &&
          <div className="space-y-6">
            {/* Subscription Management */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#D7CCC8]">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="h-5 w-5 text-[#3E2723]" />
                <h2 className="text-lg font-bold text-[#3E2723]">
                  Subscription Plan
                </h2>
              </div>

              <div className="bg-[#F5F0E8] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#3E2723]">Starter Plan</h4>
                    <span className="px-2 py-0.5 bg-[#D7CCC8] text-[#3E2723] text-xs font-bold rounded-full">
                      FREE
                    </span>
                  </div>
                  <p className="text-sm text-[#795548]">
                    Upgrade to Premium for unlimited listings and advanced
                    analytics.
                  </p>
                </div>
                <button
                  onClick={onOpenSubscription}
                  className="px-6 py-2 bg-[#3E2723] text-white font-medium rounded-xl hover:bg-[#2D1B18] transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">

                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  Upgrade Plan
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="h-5 w-5 text-[#3E2723]" />
                <h2 className="text-lg font-bold text-[#3E2723]">
                  Change Password
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-[#5D4037] mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5D4037] mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5D4037] mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                </div>
                {passwordError &&
                  <p className="text-red-500 text-xs">{passwordError}</p>
                }
              </div>

              <button
                onClick={handlePasswordUpdate}
                className="px-6 py-2 border border-[#3E2723] text-[#3E2723] text-sm font-medium rounded-xl hover:bg-[#F5F0E8] transition-colors">

                Update Password
              </button>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-[#3E2723]" />
                <h2 className="text-lg font-bold text-[#3E2723]">
                  Two-Factor Authentication
                </h2>
              </div>
              <p className="text-sm text-[#795548] mb-6">
                Add an extra layer of security to your account
              </p>

              <div className="space-y-4">
                <div className="bg-[#F5F0E8] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#EFEBE9] flex items-center justify-center">
                      <Shield className="h-5 w-5 text-[#5D4037]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3E2723] text-sm">
                        Authenticator App
                      </h4>
                      <p className="text-xs text-[#795548]">
                        Use an app like Google Authenticator
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() =>
                      setTwoFactorAuthenticator(!twoFactorAuthenticator)
                    }
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${twoFactorAuthenticator ? 'bg-[#3E2723]' : 'bg-[#D7CCC8]'}`}>

                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${twoFactorAuthenticator ? 'translate-x-6' : ''}`}>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F5F0E8] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#EFEBE9] flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-[#5D4037]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3E2723] text-sm">
                        SMS Verification
                      </h4>
                      <p className="text-xs text-[#795548]">
                        Receive codes via text message
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => setTwoFactorSMS(!twoFactorSMS)}
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${twoFactorSMS ? 'bg-[#3E2723]' : 'bg-[#D7CCC8]'}`}>

                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${twoFactorSMS ? 'translate-x-6' : ''}`}>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Language & Region */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Globe2 className="h-5 w-5 text-[#3E2723]" />
                <h2 className="text-lg font-bold text-[#3E2723]">
                  Language & Region
                </h2>
              </div>
              <p className="text-sm text-[#795548] mb-6">
                Choose your preferred language and region settings
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-[#5D4037] mb-2">
                    Language
                  </label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723] appearance-none cursor-pointer">

                      <option>English</option>
                      <option>Sinhala</option>
                      <option>Tamil</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5D4037] mb-2">
                    Currency
                  </label>
                  <div className="relative">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723] appearance-none cursor-pointer">

                      <option>LKR</option>
                      <option>USD</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Data & Privacy */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Download className="h-5 w-5 text-[#3E2723]" />
                <h2 className="text-lg font-bold text-[#3E2723]">
                  Data & Privacy
                </h2>
              </div>
              <p className="text-sm text-[#795548] mb-6">
                Manage your data and privacy settings
              </p>

              <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-[#F5F5F5]">
                  <div>
                    <h4 className="font-medium text-[#3E2723] text-sm">
                      Download Your Data
                    </h4>
                    <p className="text-xs text-[#795548]">
                      Get a copy of all your data on FindItMate
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-[#D7CCC8] text-[#5D4037] text-xs font-medium rounded-full hover:bg-[#F5F0E8] transition-colors">
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#3E2723] text-sm">
                      Profile Visibility
                    </h4>
                    <p className="text-xs text-[#795548]">
                      Allow others to find your profile
                    </p>
                  </div>
                  <div
                    onClick={() => setProfileVisibility(!profileVisibility)}
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${profileVisibility ? 'bg-[#3E2723]' : 'bg-[#D7CCC8]'}`}>

                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${profileVisibility ? 'translate-x-6' : ''}`}>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-red-100">
              <div className="flex items-center gap-3 mb-6">
                <Trash2 className="h-5 w-5 text-[#D32F2F]" />
                <h2 className="text-lg font-bold text-[#D32F2F]">
                  Danger Zone
                </h2>
              </div>
              <p className="text-sm text-[#795548] mb-6">
                Irreversible actions that affect your account
              </p>

              <div className="space-y-4">
                <div className="bg-[#FFF5F5] rounded-xl p-4 flex items-center justify-between border border-red-100">
                  <div>
                    <h4 className="font-medium text-[#D32F2F] text-sm">
                      Delete Account
                    </h4>
                    <p className="text-xs text-[#795548]">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-[#D32F2F] text-white text-xs font-medium rounded-lg hover:bg-[#B71C1C] transition-colors">
                    Delete Account
                  </button>
                </div>

                <div className="bg-[#F5F0E8] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#3E2723] text-sm">
                      Sign Out Everywhere
                    </h4>
                    <p className="text-xs text-[#795548]">
                      Log out from all devices
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 border border-[#3E2723] text-[#3E2723] text-xs font-medium rounded-lg hover:bg-[#EFEBE9] transition-colors">

                    <LogOut className="h-3 w-3" />
                    Sign Out All
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl transform transition-all scale-100">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Account?</h3>
            <p className="text-gray-500 text-center mb-6">
              This action cannot be undone. All your data, including profile details, properties, and messages will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>);

}