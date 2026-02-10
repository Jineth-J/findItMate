import React, {
  useCallback,
  useEffect,
  useState,
  useRef
} from 'react';
import { adminAPI, propertiesAPI, uploadAPI } from '../services/api';
import {
  LayoutDashboard,
  Users,
  Home,
  Settings,
  LogOut,
  Search,
  Bell,
  AlertTriangle,
  Shield,
  BarChart3,
  FileText,
  Download,
  Clock,
  Activity,
  Globe,
  Database,
  Server,
  Wifi,
  MessageSquare,
  ChevronRight,
  Save,
  ToggleLeft,
  ToggleRight,
  Building,
  Calendar,
  AlertCircle,
  Check,
  Send,
  MoreVertical
} from 'lucide-react';
import { User } from '../types';
import { ManageUsersModal } from '../components/admin/ManageUsersModal';
import { AllPropertiesModal } from '../components/admin/AllPropertiesModal';
import { AdminAddPropertyModal } from '../components/admin/AdminAddPropertyModal';
import { EditPropertyModal } from '../components/admin/EditPropertyModal';
import { PropertyImageViewer } from '../components/admin/PropertyImageViewer';
import { CreateUserModal } from '../components/admin/CreateUserModal';
import { NotificationCenter } from '../components/NotificationCenter';
import { AnalyticsModal } from '../components/admin/AnalyticsModal';
import { ReportGenerator } from '../components/admin/ReportGenerator';
import { ImageUploadManager } from '../components/admin/ImageUploadManager';
interface AdminDashboardPageProps {
  user: User;
  onLogout: () => void;
}
type AdminView =
  'overview' |
  'users' |
  'properties' |
  'reports' |
  'security' |
  'settings' |
  'analytics' |
  'notifications' |
  'chat';

// Removed hardcoded SECURITY_LOGS


// Mock Chat Data
interface ChatMessage {
  id: string;
  sender: string;
  role: 'student' | 'landlord' | 'admin';
  content: string;
  timestamp: string;
}
interface ChatConversation {
  id: string;
  participants: {
    student: string;
    landlord: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: ChatMessage[];
}
// Chats initialized as empty array
const MOCK_CHATS: ChatConversation[] = [];

export function AdminDashboardPage({
  user,
  onLogout
}: AdminDashboardPageProps) {
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [manageUsersOpen, setManageUsersOpen] = useState(false);
  const [allPropertiesOpen, setAllPropertiesOpen] = useState(false);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [editPropertyOpen, setEditPropertyOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // New Modal States
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [reportGeneratorOpen, setReportGeneratorOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  // Chat State
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chats, setChats] = useState<ChatConversation[]>(MOCK_CHATS);

  // Real Data State
  const [stats, setStats] = useState<any>(null);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data on Mount and set up real-time updates
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, logsRes, verificationsRes, chatsRes] = await Promise.all([
          adminAPI.getAnalytics(),
          adminAPI.getSecurityLogs(),
          adminAPI.getVerifications('pending'),
          adminAPI.getChats()
        ]);
        if (analyticsRes.success) setStats(analyticsRes.data);
        if (logsRes.success) setSecurityLogs(logsRes.data || []);
        if (verificationsRes.success) setVerifications(verificationsRes.data || []);
        if (chatsRes.success) {
          // Map backend conversations to frontend ChatConversation structure
          const mappedChats: ChatConversation[] = (chatsRes.data || []).map((c: any) => {
            const student = c.participants.find((p: any) => p.userType === 'student');
            const landlord = c.participants.find((p: any) => p.userType === 'landlord');
            return {
              id: c._id,
              participants: {
                student: student ? student.name : 'Unknown Student',
                landlord: landlord ? landlord.name : 'Unknown Landlord'
              },
              lastMessage: c.lastMessage || 'No messages yet',
              lastMessageTime: new Date(c.lastMessageTime).toLocaleDateString(),
              unread: false, // You might want to fetch this from backend if available
              messages: [] // We can fetch messages on demand or if provided
            };
          });
          setChats(mappedChats);
        }
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleReviewVerification = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await adminAPI.reviewVerification(id, { status });
      if (response.success) {
        // Remove from list
        setVerifications(prev => prev.filter(v => v._id !== id));
        // Update stats
        setStats((prev: any) => ({
          ...prev,
          users: {
            ...prev.users,
            pending: Math.max(0, (prev.users.pending || 0) - 1)
          }
        }));
      } else {
        alert('Failed to update verification status');
      }
    } catch (error) {
      console.error('Review error:', error);
      alert('An error occurred');
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeView === 'chat' && selectedChatId) {
      chatEndRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [activeView, selectedChatId, chats]);
  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedChatId) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Admin Moderator',
      role: 'admin',
      content: chatInput,
      timestamp: 'Just now'
    };
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === selectedChatId) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: `Admin: ${chatInput}`,
            lastMessageTime: 'Just now'
          };
        }
        return chat;
      })
    );
    setChatInput('');
  };
  // Auto-reports state
  const [autoReports, setAutoReports] = useState([
    {
      id: 1,
      name: 'Weekly User Summary',
      schedule: 'Every Monday 9:00 AM',
      status: 'active'
    },
    {
      id: 2,
      name: 'Monthly Financial Report',
      schedule: '1st of every month',
      status: 'active'
    },
    {
      id: 3,
      name: 'Daily Security Digest',
      schedule: 'Every day 6:00 PM',
      status: 'paused'
    }]
  );
  // Report generation & download
  const generateReport = useCallback(async (type: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let content = '';
    let filename = '';

    try {
      setLoading(true);
      switch (type) {
        case 'users': {
          filename = `user-report-${timestamp}.csv`;
          const res = await adminAPI.getUsers(undefined, 1, '');
          if (res.success && res.data) {
            content = 'Name,Email,Role,Status,Join Date,Verification\n';
            res.data.forEach((u: any) => {
              content += `${u.name},${u.email},${u.userType},${u.isActive ? 'Active' : 'Suspended'},${new Date(u.createdAt).toLocaleDateString()},${u.isVerified ? 'Verified' : 'Pending'}\n`;
            });
          }
          break;
        }
        case 'properties': {
          filename = `property-report-${timestamp}.csv`;
          const res = await adminAPI.getProperties(undefined, 1, '');
          if (res.success && res.data) {
            content = 'Title,City,Landlord,Price,Status,Verified\n';
            res.data.forEach((p: any) => {
              content += `"${p.title}",${p.location?.city || 'N/A'},${p.landlordId?.userId?.name || 'N/A'},${p.price},${p.status},${p.isVerified ? 'Yes' : 'No'}\n`;
            });
          }
          break;
        }
        case 'bookings': {
          // We might not have a direct admin bookings endpoint in adminAPI, so using bookingsAPI if available or relying on admin endpoint if added.
          // Looking at api.ts, bookingsAPI.getAll exists.
          filename = `booking-report-${timestamp}.csv`;
          // WARNING: This assumes admin has permission to call bookingsAPI.getAll and it returns all bookings.
          // If not, we might need to add a specific admin route. Let's try.
          const { bookingsAPI } = await import('../services/api');
          const res = await bookingsAPI.getAll();
          if (res.success && res.data) {
            content = 'Booking ID,Property,Guest,Check In,Check Out,Total Price,Status\n';
            res.data.forEach((b: any) => {
              content += `${b._id},"${b.propertyId?.title || 'Unknown'}",${b.studentId?.userId?.name || 'Unknown'},${new Date(b.checkIn).toLocaleDateString()},${new Date(b.checkOut).toLocaleDateString()},${b.totalPrice},${b.status}\n`;
            });
          }
          break;
        }
        case 'financial': {
          filename = `financial-report-${timestamp}.csv`;
          const res = await adminAPI.getPayments();
          if (res.success && res.data) {
            content = 'Payment ID,User,Type,Amount,Status,Date\n';
            res.data.forEach((p: any) => {
              content += `${p._id},${p.userId?.name || 'Unknown'},${p.type},${p.amount},${p.status},${new Date(p.createdAt).toLocaleDateString()}\n`;
            });
          }
          break;
        }
        default:
          return;
      }

      if (!content) {
        alert('No data found for this report');
        return;
      }

      const blob = new Blob([content], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Report generation failed:', err);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  }, []);
  const handleSidebarClick = (view: AdminView) => {
    if (view === 'users') {
      setManageUsersOpen(true);
    } else if (view === 'properties') {
      setAllPropertiesOpen(true);
    } else if (view === 'analytics') {
      setAnalyticsModalOpen(true);
    } else {
      setActiveView(view);
    }
  };
  const handleViewProperty = (property: any) => {
    setSelectedProperty(property);
    setImageViewerOpen(true);
  };
  const handleEditProperty = (property: any) => {
    setSelectedProperty(property);
    setEditPropertyOpen(true);
  };
  const handleOpenReportGenerator = (type: string) => {
    setSelectedReportType(type);
    setReportGeneratorOpen(true);
  };
  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };
  const toggleAutoReport = (id: number) => {
    setAutoReports((prev) =>
      prev.map((report) =>
        report.id === id ?
          {
            ...report,
            status: report.status === 'active' ? 'paused' : 'active'
          } :
          report
      )
    );
  };
  const sidebarItems: {
    id: AdminView;
    label: string;
    icon: React.ReactNode;
  }[] = [
      {
        id: 'overview',
        label: 'Overview',
        icon: <LayoutDashboard className="w-5 h-5" />
      },
      {
        id: 'users',
        label: 'Users',
        icon: <Users className="w-5 h-5" />
      },
      {
        id: 'properties',
        label: 'Properties',
        icon: <Home className="w-5 h-5" />
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: <FileText className="w-5 h-5" />
      },
      {
        id: 'security',
        label: 'Security Logs',
        icon: <Shield className="w-5 h-5" />
      },
      {
        id: 'chat',
        label: 'Chat',
        icon: <MessageSquare className="w-5 h-5" />
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: <BarChart3 className="w-5 h-5" />
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings className="w-5 h-5" />
      }];

  // Transform historical data for charts
  const analyticsData = React.useMemo(() => {
    if (!stats?.historical) {
      // Return empty or default structure if no data yet
      return Array(6).fill(0).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
          label: d.toLocaleString('default', { month: 'short' }),
          users: 0,
          properties: 0
        };
      });
    }

    const { users = [], properties = [] } = stats.historical;

    // Create last 6 months buckets
    const months = Array(6).fill(0).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        dateStr: d.toISOString().slice(0, 7), // YYYY-MM
        label: d.toLocaleString('default', { month: 'short' })
      };
    });

    return months.map(m => {
      const userCount = users.find((u: any) => u._id === m.dateStr)?.count || 0;
      const propCount = properties.find((p: any) => p._id === m.dateStr)?.count || 0;
      return {
        label: m.label,
        users: userCount,
        properties: propCount
      };
    });
  }, [stats]);


  // Use real stats if available, else mock
  const displayStats = stats || {
    users: { total: 0, students: 0, landlords: 0, pending: 0, growth: 0 },
    properties: { total: 0, active: 0, pending: 0, growth: 0 },
    bookings: { total: 0, pending: 0 },
    reviews: { total: 0 },
    historical: { users: [], properties: [] }
  };

  const maxVal = Math.max(1, ...analyticsData.map((d) => Math.max(d.users, d.properties)));

  // Filter Security Logs
  const filteredSecurityLogs = securityLogs.filter(log =>
    !searchQuery ||
    log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.user || log.userId?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.ip?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter Chats
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const filteredChats = chats.filter(chat =>
    !chatSearchQuery ||
    chat.participants.student.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
    chat.participants.landlord.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-300 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#161616] border-r border-[#333] flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-[#333]">
          <h1 className="text-xl font-bold text-white tracking-tight">
            FindItMate <span className="text-red-600">Admin</span>
          </h1>
          <p className="text-[10px] text-gray-600 mt-1 font-mono">
            CONTROL CENTER v2.4
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) =>
            <button
              key={item.id}
              onClick={() => handleSidebarClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === item.id && item.id !== 'users' && item.id !== 'properties' && item.id !== 'analytics' ? 'bg-red-600/10 text-red-500 border border-red-600/20' : 'text-gray-400 hover:bg-[#222] hover:text-white'}`}>

              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-[#333]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors">

            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-[#161616] border-b border-[#333] flex items-center justify-between px-8 sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, properties, or logs..."
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-gray-600" />

          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAnalyticsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg text-sm font-medium transition-colors border border-[#333]">

              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => setActiveView('notifications')}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#222] relative transition-colors">

              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>
            <button
              onClick={() => setActiveView('settings')}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#222] transition-colors">

              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className={`flex-1 ${activeView === 'notifications' ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          {activeView === 'notifications' &&
            <NotificationCenter
              theme="dark"
              onBack={() => setActiveView('overview')} />

          }

          {activeView !== 'notifications' && activeView !== 'chat' &&
            <div className="p-8 overflow-y-auto h-full">
              {/* ==================== OVERVIEW VIEW ==================== */}
              {activeView === 'overview' &&
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Admin Control Center
                    </h2>
                    <p className="text-gray-500">
                      Platform management and moderation dashboard
                    </p>
                  </div>

                  {/* Stats Grid - 4 cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="bg-[#161616] border border-[#333] p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-[#222] rounded-lg border border-[#333]">
                          <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-green-400 text-xs font-bold bg-green-900/20 px-2 py-1 rounded-full">
                          +{displayStats?.users?.growth || 0}%
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">
                        {loading ? '...' : (displayStats?.users?.total || 0)}
                      </div>
                      <div className="text-sm text-gray-500">Total Users</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {displayStats?.users?.students || 0} students • {displayStats?.users?.landlords || 0} landlords
                      </div>
                    </div>

                    <div className="bg-[#161616] border border-[#333] p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-[#222] rounded-lg border border-[#333]">
                          <Building className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-green-400 text-xs font-bold bg-green-900/20 px-2 py-1 rounded-full">
                          +{displayStats?.properties?.growth || 0}%
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">
                        {loading ? '...' : (displayStats?.properties?.total || 0)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total Properties
                      </div>
                    </div>

                    <div className="bg-[#161616] border border-[#333] p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-[#222] rounded-lg border border-[#333]">
                          <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <span className="text-green-400 text-xs font-bold bg-green-900/20 px-2 py-1 rounded-full">
                          +24%
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">
                        {loading ? '...' : (displayStats?.users?.pending || 0)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Pending Verification
                      </div>
                    </div>

                    <div className="bg-[#161616] border border-[#333] p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-[#222] rounded-lg border border-[#333]">
                          <MessageSquare className="w-5 h-5 text-teal-400" />
                        </div>
                        <span className="text-green-400 text-xs font-bold bg-green-900/20 px-2 py-1 rounded-full">
                          +5%
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">
                        {loading ? '...' : (displayStats?.bookings?.pending || 0)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Pending Bookings
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Pending Verification */}
                    <div className="bg-[#161616] border border-[#333] rounded-xl overflow-hidden">
                      <div className="p-6 border-b border-[#333] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          <h3 className="font-bold text-white">
                            Pending Verification
                          </h3>
                        </div>
                        <span className="text-xs bg-yellow-900/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-900/30">
                          {verifications.length > 0 ? verifications.length : 'No'} users
                        </span>
                      </div>
                      <div className="p-6 space-y-3">
                        {loading ? (
                          <div className="text-center text-gray-500 py-4">Loading...</div>
                        ) : verifications.length === 0 ? (
                          <div className="text-center text-gray-500 py-4">No pending verifications</div>
                        ) : (
                          verifications.map((verification) => (
                            <div key={verification._id} className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#222]">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-sm font-bold text-gray-400">
                                  {verification.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    {verification.user.name}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">
                                    {verification.user.userType} • Submitted {new Date(verification.submittedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReviewVerification(verification._id, 'approved')}
                                  className="px-3 py-1.5 bg-green-600/20 text-green-400 text-xs font-medium rounded-lg hover:bg-green-600/30 transition-colors border border-green-600/30">
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReviewVerification(verification._id, 'rejected')}
                                  className="px-3 py-1.5 bg-red-600/20 text-red-400 text-xs font-medium rounded-lg hover:bg-red-600/30 transition-colors border border-red-600/30">
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-[#161616] border border-[#333] rounded-xl overflow-hidden">
                      <div className="p-6 border-b border-[#333]">
                        <h3 className="font-bold text-white">Quick Actions</h3>
                      </div>
                      <div className="p-6 grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setManageUsersOpen(true)}
                          className="flex flex-col items-center gap-3 p-6 bg-[#0f0f0f] rounded-xl border border-[#222] hover:border-red-600/30 hover:bg-red-600/5 transition-all group">

                          <Users className="w-7 h-7 text-gray-400 group-hover:text-red-500 transition-colors" />
                          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            Manage Users
                          </span>
                        </button>
                        <button
                          onClick={() => setAllPropertiesOpen(true)}
                          className="flex flex-col items-center gap-3 p-6 bg-[#0f0f0f] rounded-xl border border-[#222] hover:border-red-600/30 hover:bg-red-600/5 transition-all group">

                          <Building className="w-7 h-7 text-gray-400 group-hover:text-red-500 transition-colors" />
                          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            All Properties
                          </span>
                        </button>
                        <button
                          onClick={() => setActiveView('security')}
                          className="flex flex-col items-center gap-3 p-6 bg-[#0f0f0f] rounded-xl border border-[#222] hover:border-red-600/30 hover:bg-red-600/5 transition-all group">

                          <Shield className="w-7 h-7 text-gray-400 group-hover:text-red-500 transition-colors" />
                          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            Security Logs
                          </span>
                        </button>
                        <button
                          onClick={() => setActiveView('reports')}
                          className="flex flex-col items-center gap-3 p-6 bg-[#0f0f0f] rounded-xl border border-[#222] hover:border-red-600/30 hover:bg-red-600/5 transition-all group">

                          <BarChart3 className="w-7 h-7 text-gray-400 group-hover:text-red-500 transition-colors" />
                          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            Reports
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Manager */}
                  <ImageUploadManager />

                  {/* Recent Activity */}
                  <div className="mt-8 bg-[#161616] border border-[#333] rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-[#333] flex items-center justify-between">
                      <h3 className="font-bold text-white">
                        Recent System Activity
                      </h3>
                      <button
                        onClick={() => setActiveView('security')}
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">

                        View All <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="divide-y divide-[#222]">
                      {loading ? (
                        <div className="p-6 text-center text-gray-500">Loading...</div>
                      ) : filteredSecurityLogs.length > 0 ? filteredSecurityLogs.slice(0, 4).map((log) =>
                        <div
                          key={log.id}
                          className="px-6 py-4 flex items-center justify-between hover:bg-[#222] transition-colors"
                        >

                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${log.severity === 'danger' ? 'bg-red-500' : log.severity === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                            <div>
                              <p className="text-sm text-white">{log.action}</p>
                              <p className="text-xs text-gray-500">
                                {log.userId?.email || 'Unknown User'}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs text-gray-600">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-gray-500 text-sm">No recent activity</div>
                      )}
                    </div>
                  </div>

                  {/* Recent Users & Properties */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {/* Recent Users */}
                    <div className="bg-[#161616] border border-[#333] rounded-xl overflow-hidden">
                      <div className="p-6 border-b border-[#333]">
                        <h3 className="font-bold text-white">Recent Users</h3>
                      </div>
                      <div className="p-6 space-y-3">
                        {loading ? (
                          <div className="text-center text-gray-500">Loading...</div>
                        ) : displayStats?.users?.recent && displayStats.users.recent.length > 0 ? (
                          displayStats.users.recent.slice(0, 3).map((user: any) => (
                            <div key={user._id} className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-[#222]">
                              <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-sm font-bold text-gray-400">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {user.userType} • {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 text-sm">No recent users</div>
                        )}
                      </div>
                    </div>

                    {/* Recent Properties */}
                    <div className="bg-[#161616] border border-[#333] rounded-xl overflow-hidden">
                      <div className="p-6 border-b border-[#333]">
                        <h3 className="font-bold text-white">Recent Properties</h3>
                      </div>
                      <div className="p-6 space-y-3">
                        {loading ? (
                          <div className="text-center text-gray-500">Loading...</div>
                        ) : displayStats?.properties?.recent && displayStats.properties.recent.length > 0 ? (
                          displayStats.properties.recent.slice(0, 3).map((property: any) => (
                            <div key={property._id} className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#222]">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white truncate">
                                  {property.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {property.landlordId?.userId?.name || 'Unknown'} • {new Date(property.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => handleViewProperty(property)}
                                className="px-3 py-1.5 bg-red-600/20 text-red-400 text-xs font-medium rounded-lg hover:bg-red-600/30 transition-colors border border-red-600/30"
                              >
                                View
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 text-sm">No recent properties</div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              }

              {/* ==================== REPORTS VIEW ==================== */}
              {
                activeView === 'reports' &&
                <>
                  <div className="mb-8 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        Reports & Downloads
                      </h2>
                      <p className="text-gray-500">
                        Generate and download platform reports
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveView('overview')}
                      className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg text-sm font-medium transition-colors border border-[#333]">

                      Back to Overview
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        type: 'users',
                        title: 'User Report',
                        desc: 'Complete list of all registered users with roles and status',
                        icon: <Users className="w-6 h-6" />,
                        color: 'blue'
                      },
                      {
                        type: 'properties',
                        title: 'Property Report',
                        desc: 'All listed properties with ratings, bookings, and verification status',
                        icon: <Building className="w-6 h-6" />,
                        color: 'purple'
                      },
                      {
                        type: 'bookings',
                        title: 'Booking Report',
                        desc: 'Recent bookings with guest details, dates, and payment status',
                        icon: <Calendar className="w-6 h-6" />,
                        color: 'teal'
                      },
                      {
                        type: 'financial',
                        title: 'Financial Report',
                        desc: 'Monthly revenue breakdown, commission earnings, and trends',
                        icon: <BarChart3 className="w-6 h-6" />,
                        color: 'green'
                      }].
                      map((report) =>
                        <div
                          key={report.type}
                          className="bg-[#161616] border border-[#333] rounded-xl p-6">

                          <div className="flex items-start justify-between mb-4">
                            <div
                              className={`p-3 rounded-xl bg-${report.color === 'blue' ? 'blue' : report.color === 'purple' ? 'purple' : report.color === 'teal' ? 'teal' : 'green'}-900/20 border border-[#333]`}>

                              {report.icon}
                            </div>
                            <span className="text-[10px] text-gray-600 font-mono">
                              CSV & PDF
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-6">
                            {report.desc}
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => generateReport(report.type)}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg font-medium transition-colors text-xs border border-[#333]">

                              <FileText className="w-3 h-3" />
                              CSV
                            </button>
                            <button
                              onClick={() =>
                                handleOpenReportGenerator(report.type)
                              }
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-xs shadow-lg shadow-red-900/20">

                              <Download className="w-3 h-3" />
                              PDF Report
                            </button>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Auto-download section */}
                  <div className="mt-8 bg-[#161616] border border-[#333] rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">
                      Scheduled Auto-Reports
                    </h3>
                    <div className="space-y-3">
                      {autoReports.map((auto) =>
                        <div
                          key={auto.id}
                          className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-lg border border-[#222]">

                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {auto.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {auto.schedule}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => toggleAutoReport(auto.id)}
                              className="text-gray-400 hover:text-white transition-colors">

                              {auto.status === 'active' ?
                                <ToggleRight className="w-8 h-8 text-green-500" /> :

                                <ToggleLeft className="w-8 h-8" />
                              }
                            </button>

                            <button
                              onClick={() => handleOpenReportGenerator('users')}
                              className="flex items-center gap-2 px-3 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs rounded-lg transition-colors border border-[#333]">

                              <Download className="w-3 h-3" />
                              Download Now
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              }

              {/* ==================== SECURITY LOGS VIEW ==================== */}
              {
                activeView === 'security' &&
                <>
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        Security Logs
                      </h2>
                      <p className="text-gray-500">
                        Monitor all system activity and access events
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setActiveView('overview')}
                        className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg text-sm font-medium transition-colors border border-[#333]">

                        Back
                      </button>
                      <button
                        onClick={() => handleOpenReportGenerator('security')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-900/20">

                        <Download className="w-4 h-4" />
                        Export Logs
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#161616] border border-[#333] rounded-xl overflow-hidden">
                    <div className="divide-y divide-[#222]">
                      {filteredSecurityLogs.map((log) =>
                        <div
                          key={log.id}
                          className="px-6 py-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors">

                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${log.severity === 'danger' ? 'bg-red-900/20 border border-red-900/30' : log.severity === 'warning' ? 'bg-yellow-900/20 border border-yellow-900/30' : 'bg-green-900/20 border border-green-900/30'}`}>

                              {log.severity === 'danger' ?
                                <AlertCircle className="w-5 h-5 text-red-400" /> :
                                log.severity === 'warning' ?
                                  <AlertTriangle className="w-5 h-5 text-yellow-400" /> :

                                  <Activity className="w-5 h-5 text-green-400" />
                              }
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {log.action}
                              </p>
                              <p className="text-xs text-gray-500">
                                {log.user} • IP: {log.ip}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${log.severity === 'danger' ? 'bg-red-900/20 text-red-400 border border-red-900/30' : log.severity === 'warning' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-900/30' : 'bg-green-900/20 text-green-400 border border-green-900/30'}`}>

                              {log.severity}
                            </span>
                            <span className="text-xs text-gray-600 font-mono w-24 text-right">
                              {log.time}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              }

              {/* ==================== ANALYTICS VIEW (Fallback if modal fails) ==================== */}
              {
                activeView === 'analytics' &&
                <>
                  <div className="mb-8 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        Analytics
                      </h2>
                      <p className="text-gray-500">
                        Platform growth and performance metrics
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setActiveView('overview')}
                        className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg text-sm font-medium transition-colors border border-[#333]">

                        Back
                      </button>
                      <button
                        onClick={() => setAnalyticsModalOpen(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-900/20">

                        Open Full Analytics
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* User Growth Chart */}
                    <div className="bg-[#161616] border border-[#333] rounded-xl p-6">
                      <h3 className="text-sm font-bold text-white mb-6">
                        User Growth (Last 6 Months)
                      </h3>
                      <div className="flex items-end gap-3 h-48">
                        {analyticsData.map((d, i) =>
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center gap-2">

                            <div
                              className="w-full bg-[#222] rounded-t-md relative overflow-hidden"
                              style={{
                                height: `${d.users / maxVal * 100}%`
                              }}>

                              <div className="absolute inset-0 bg-gradient-to-t from-red-600/40 to-red-600/10 rounded-t-md" />
                            </div>
                            <span className="text-[10px] text-gray-500">
                              {d.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Property Growth Chart */}
                    <div className="bg-[#161616] border border-[#333] rounded-xl p-6">
                      <h3 className="text-sm font-bold text-white mb-6">
                        Property Listings (Last 6 Months)
                      </h3>
                      <div className="flex items-end gap-3 h-48">
                        {analyticsData.map((d, i) =>
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center gap-2">

                            <div
                              className="w-full bg-[#222] rounded-t-md relative overflow-hidden"
                              style={{
                                height: `${d.properties / maxVal * 100}%`
                              }}>

                              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/40 to-purple-600/10 rounded-t-md" />
                            </div>
                            <span className="text-[10px] text-gray-500">
                              {d.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              }

              {/* ==================== SETTINGS VIEW ==================== */}
              {
                activeView === 'settings' &&
                <>
                  <div className="mb-8 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        Admin Settings
                      </h2>
                      <p className="text-gray-500">
                        Configure platform preferences and system options
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveView('overview')}
                      className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg text-sm font-medium transition-colors border border-[#333]">

                      Back
                    </button>
                  </div>

                  <div className="space-y-6 max-w-2xl">
                    {/* General Settings */}
                    <div className="bg-[#161616] border border-[#333] rounded-xl overflow-hidden">
                      <div className="p-6 border-b border-[#333]">
                        <h3 className="font-bold text-white">
                          General Settings
                        </h3>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">
                              Email Notifications
                            </p>
                            <p className="text-xs text-gray-500">
                              Receive alerts for new registrations and reports
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setEmailNotifications(!emailNotifications)
                            }
                            className="text-gray-400">

                            {emailNotifications ?
                              <ToggleRight className="w-10 h-10 text-red-500" /> :

                              <ToggleLeft className="w-10 h-10" />
                            }
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">
                              Auto Backup
                            </p>
                            <p className="text-xs text-gray-500">
                              Automatically backup database every 24 hours
                            </p>
                          </div>
                          <button
                            onClick={() => setAutoBackup(!autoBackup)}
                            className="text-gray-400">

                            {autoBackup ?
                              <ToggleRight className="w-10 h-10 text-red-500" /> :

                              <ToggleLeft className="w-10 h-10" />
                            }
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">
                              Maintenance Mode
                            </p>
                            <p className="text-xs text-gray-500">
                              Temporarily disable public access for updates
                            </p>
                          </div>
                          <button
                            onClick={() => setMaintenanceMode(!maintenanceMode)}
                            className="text-gray-400">

                            {maintenanceMode ?
                              <ToggleRight className="w-10 h-10 text-red-500" /> :

                              <ToggleLeft className="w-10 h-10" />
                            }
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* System Info */}
                    <div className="bg-[#161616] border border-[#333] rounded-xl overflow-hidden">
                      <div className="p-6 border-b border-[#333]">
                        <h3 className="font-bold text-white">
                          System Information
                        </h3>
                      </div>
                      <div className="p-6 space-y-4">
                        {[
                          {
                            icon: <Server className="w-4 h-4" />,
                            label: 'Server Status',
                            value: 'Online',
                            status: 'green'
                          },
                          {
                            icon: <Database className="w-4 h-4" />,
                            label: 'Database',
                            value: 'Connected (PostgreSQL)',
                            status: 'green'
                          },
                          {
                            icon: <Globe className="w-4 h-4" />,
                            label: 'API Version',
                            value: 'v2.4.1',
                            status: 'blue'
                          },
                          {
                            icon: <Wifi className="w-4 h-4" />,
                            label: 'Uptime',
                            value: '99.97% (30 days)',
                            status: 'green'
                          }].
                          map((item, i) =>
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#222]">

                              <div className="flex items-center gap-3 text-gray-400">
                                {item.icon}
                                <span className="text-sm">{item.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${item.status === 'green' ? 'bg-green-500' : 'bg-blue-500'}`} />

                                <span className="text-sm text-white">
                                  {item.value}
                                </span>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    <button
                      onClick={handleSaveSettings}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg ${saveSuccess ? 'bg-green-600 text-white shadow-green-900/20' : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20'}`}>

                      {saveSuccess ?
                        <>
                          <Check className="w-4 h-4" />
                          Saved Successfully!
                        </> :

                        <>
                          <Save className="w-4 h-4" />
                          Save Settings
                        </>
                      }
                    </button>
                  </div>
                </>
              }
            </div >
          }

          {/* ==================== CHAT VIEW (Inline) ==================== */}
          {
            activeView === 'chat' &&
            <div className="flex h-full bg-[#0f0f0f]">
              {/* Left Panel: Conversation List */}
              <div className="w-80 border-r border-[#333] flex flex-col bg-[#161616]">
                <div className="p-4 border-b border-[#333]">
                  <h2 className="text-lg font-bold text-white">Messages</h2>
                  <div className="mt-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full bg-[#222] text-sm text-white pl-9 pr-4 py-2 rounded-lg border border-[#333] focus:outline-none focus:border-red-600/50" />

                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredChats.map((chat) =>
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`p-4 border-b border-[#222] cursor-pointer hover:bg-[#222] transition-colors ${selectedChatId === chat.id ? 'bg-[#222] border-l-4 border-l-red-600' : ''}`}>

                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-xs font-bold text-gray-400">
                            {chat.participants.student.charAt(0)}
                          </div>
                          <span className="font-medium text-white text-sm truncate max-w-[120px]">
                            {chat.participants.student}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {chat.lastMessageTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">vs</span>
                        <span className="text-xs text-gray-400">
                          {chat.participants.landlord} (Landlord)
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate ${chat.unread ? 'text-white font-medium' : 'text-gray-500'}`}>

                        {chat.lastMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Chat Thread */}
              <div className="flex-1 flex flex-col bg-[#0f0f0f]">
                {selectedChatId ?
                  <>
                    {/* Chat Header */}
                    <div className="h-16 border-b border-[#333] flex items-center justify-between px-6 bg-[#161616]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-sm font-bold text-white">
                          {chats.
                            find((c) => c.id === selectedChatId)?.
                            participants.student.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">
                            {
                              chats.find((c) => c.id === selectedChatId)?.
                                participants.student
                            }
                          </h3>
                          <p className="text-xs text-gray-500">
                            Chatting with{' '}
                            {
                              chats.find((c) => c.id === selectedChatId)?.
                                participants.landlord
                            }
                          </p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-[#333] rounded-full text-gray-400">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {chats.
                        find((c) => c.id === selectedChatId)?.
                        messages.map((msg) =>
                          <div
                            key={msg.id}
                            className={`flex ${msg.role === 'admin' ? 'justify-center' : msg.role === 'student' ? 'justify-start' : 'justify-end'}`}>

                            <div
                              className={`max-w-[70%] ${msg.role === 'admin' ? 'w-full' : ''}`}>

                              {msg.role === 'admin' ?
                                <div className="flex flex-col items-center my-4">
                                  <span className="text-[10px] text-purple-400 font-bold mb-1 uppercase tracking-wider bg-purple-900/20 px-2 py-0.5 rounded-full border border-purple-900/30">
                                    Moderator Note
                                  </span>
                                  <div className="bg-purple-900/10 border border-purple-900/30 text-purple-200 px-4 py-2 rounded-lg text-sm text-center">
                                    {msg.content}
                                  </div>
                                </div> :

                                <>
                                  <div
                                    className={`flex items-center gap-2 mb-1 ${msg.role === 'landlord' ? 'justify-end' : ''}`}>

                                    <span className="text-xs font-bold text-gray-400">
                                      {msg.sender}
                                    </span>
                                    <span className="text-[10px] text-gray-600">
                                      {msg.timestamp}
                                    </span>
                                  </div>
                                  <div
                                    className={`px-4 py-3 rounded-2xl text-sm ${msg.role === 'student' ? 'bg-[#222] text-white rounded-tl-none border border-[#333]' : 'bg-red-900/20 text-white rounded-tr-none border border-red-900/30'}`}>

                                    {msg.content}
                                  </div>
                                </>
                              }
                            </div>
                          </div>
                        )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-[#333] bg-[#161616]">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && handleSendMessage()
                          }
                          placeholder="Type a message as moderator..."
                          className="flex-1 bg-[#222] text-white px-4 py-3 rounded-xl border border-[#333] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder:text-gray-600" />

                        <button
                          onClick={handleSendMessage}
                          disabled={!chatInput.trim()}
                          className="px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2 text-center">
                        Messages sent here will be visible to both parties as an
                        official moderator note.
                      </p>
                    </div>
                  </> :

                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                    <p>Select a conversation to view details</p>
                  </div>
                }
              </div>
            </div>
          }
        </div >
      </main >

      {/* ==================== ALL MODALS ==================== */}
      < ManageUsersModal
        isOpen={manageUsersOpen}
        onClose={() => setManageUsersOpen(false)
        }
        onCreateUser={() => {
          setManageUsersOpen(false);
          setCreateUserOpen(true);
        }} />


      < AllPropertiesModal
        isOpen={allPropertiesOpen}
        onClose={() => setAllPropertiesOpen(false)}
        onAddProperty={() => {
          setAllPropertiesOpen(false);
          setAddPropertyOpen(true);
        }}
        onEditProperty={(property) => {
          setAllPropertiesOpen(false);
          handleEditProperty(property);
        }}
        onViewProperty={(property) => {
          handleViewProperty(property);
        }} />


      < AdminAddPropertyModal
        isOpen={addPropertyOpen}
        onClose={() => {
          setAddPropertyOpen(false);
          setAllPropertiesOpen(true);
        }}
        onSubmit={async (data: any) => {
          try {
            // Upload images first
            let imageUrls: string[] = [];
            if (data.images && data.images.length > 0) {
              for (const imageFile of data.images) {
                try {
                  const uploadResponse = await uploadAPI.upload(imageFile);
                  if (uploadResponse.success && uploadResponse.data?.url) {
                    imageUrls.push(uploadResponse.data.url);
                  }
                } catch (err) {
                  console.error('Image upload failed:', err);
                }
              }
            }
            if (imageUrls.length === 0) {
              imageUrls = ['/uploads/default-property.png'];
            }

            const propertyData = {
              title: data.title,
              description: data.description || `${data.title} - ${data.type}`,
              type: data.type || 'single',
              rent: parseInt(data.rent) || 0,
              deposit: parseInt(data.deposit) || 0,
              capacity: parseInt(data.capacity) || 1,
              address: data.address || '',
              location: { city: data.address?.split(',')[0]?.trim() || 'Colombo' },
              images: imageUrls,
              status: 'active'
            };

            const response = await propertiesAPI.create(propertyData);
            if (response.success) {
              alert('Property added successfully!');
            } else {
              alert('Failed to add property: ' + (response.message || 'Unknown error'));
            }
          } catch (error: any) {
            console.error('Error adding property:', error);
            alert('Failed to add property: ' + (error.message || 'Please try again'));
          }
          setAddPropertyOpen(false);
          setAllPropertiesOpen(true);
        }} />


      < EditPropertyModal
        isOpen={editPropertyOpen}
        onClose={() => {
          setEditPropertyOpen(false);
          setAllPropertiesOpen(true);
        }}
        onSubmit={() => {
          setEditPropertyOpen(false);
          setAllPropertiesOpen(true);
        }}
        property={selectedProperty} />


      <PropertyImageViewer
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        property={selectedProperty} />


      <CreateUserModal
        isOpen={createUserOpen}
        onClose={() => {
          setCreateUserOpen(false);
          setManageUsersOpen(true);
        }}
        onSubmit={() => {
          setCreateUserOpen(false);
          setManageUsersOpen(true);
          // Refresh stats
          adminAPI.getAnalytics().then(res => {
            if (res.success) setStats(res.data);
          });
        }} />


      <AnalyticsModal
        isOpen={analyticsModalOpen}
        onClose={() => setAnalyticsModalOpen(false)}
        stats={displayStats}
      />


      <ReportGenerator
        isOpen={reportGeneratorOpen}
        onClose={() => setReportGeneratorOpen(false)}
        reportType={selectedReportType} />

    </div >);

}