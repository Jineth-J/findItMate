import { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Eye,
  Trash2,
  X,
  Shield
} from
  'lucide-react';
import { notificationsAPI } from '../services/api';

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  type: 'alert' | 'info' | 'success' | 'security';
}
interface NotificationCenterProps {
  onBack?: () => void;
  onClose?: () => void; // For modal usage if needed
  theme?: 'light' | 'dark';
}
export function NotificationCenter({
  onBack,
  onClose,
  theme = 'light'
}: NotificationCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications from database
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Pass searchQuery and currentPage to API
        const response = await notificationsAPI.getAll(undefined, searchQuery, currentPage);
        if (response.success && response.data) {
          const mappedNotifications = response.data.map((n: any) => ({
            id: n._id,
            title: n.title,
            description: n.message || n.description,
            date: formatDate(n.createdAt),
            isRead: n.isRead,
            type: n.type === 'warning' ? 'alert' : n.type === 'error' ? 'alert' : n.type === 'security' ? 'security' : n.type || 'info'
          }));
          setNotifications(mappedNotifications);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, currentPage]); // Re-run when searchQuery or currentPage changes

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };
  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ?
          {
            ...n,
            isRead: true
          } :
          n
      )
    );
    // Optimistically update backend
    notificationsAPI.markAsRead(id);
  };
  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };
  const handleReadAll = () => {
    setNotifications(
      notifications.map((n) => ({
        ...n,
        isRead: true
      }))
    );
    notificationsAPI.markAllAsRead();
  };

  // Backend filtering is now enabled
  const filteredNotifications = notifications;
  const isDark = theme === 'dark';
  // Styles based on theme
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-[#F5F0E8]';
  const cardBgClass = isDark ?
    'bg-[#1e1e1e] border border-[#333]' :
    'bg-white border border-[#E8E0D5]';
  const textPrimaryClass = isDark ? 'text-gray-100' : 'text-[#3E2723]';
  const textSecondaryClass = isDark ? 'text-gray-400' : 'text-[#795548]';
  const inputBgClass = isDark ?
    'bg-[#2a2a2a] text-white border-none' :
    'bg-[#F5F0E8] text-[#3E2723] border-none';
  const buttonBgClass = isDark ?
    'bg-[#2a2a2a] hover:bg-[#333] text-gray-200' :
    'bg-[#FAF9F6] hover:bg-[#F5F0E8] text-[#5D4037]';
  const headerIconBg = isDark ?
    'bg-[#2a2a2a] text-gray-200' :
    'bg-[#FAF9F6] border border-[#E8E0D5] text-[#5D4037]';
  return (
    <div
      className={`min-h-screen ${bgClass} p-4 md:p-8 transition-colors duration-300`}>

      <div
        className={`max-w-4xl mx-auto ${isDark ? '' : 'bg-[#EFEBE9]/30'} rounded-3xl p-6 md:p-8`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${headerIconBg}`}>

              <Bell className="h-6 w-6" />
            </div>
            <h1 className={`text-2xl font-bold ${textPrimaryClass}`}>
              Notifications
            </h1>
          </div>
          {onClose &&
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-black/5 ${textSecondaryClass}`}>

              <X className="h-6 w-6" />
            </button>
          }
          {onBack && !onClose &&
            <button
              onClick={onBack}
              className={`p-2 rounded-full hover:bg-black/5 ${textSecondaryClass}`}>

              <X className="h-6 w-6" />
            </button>
          }
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${textSecondaryClass}`} />

            <input
              type="text"
              placeholder="Search Notifications..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#3E2723]/20 ${inputBgClass}`} />

          </div>
          <button
            onClick={handleReadAll}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-[#3E2723] hover:bg-[#2D1B18] text-white'}`}>

            Read All
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className={`text-center py-12 ${textSecondaryClass}`}>Loading...</div>
          ) : filteredNotifications.length === 0 ?
            <div className={`text-center py-12 ${textSecondaryClass}`}>
              No notifications found
            </div> :

            filteredNotifications.map((notification) =>
              <div
                key={notification.id}
                className={`p-6 rounded-2xl shadow-sm transition-all ${cardBgClass} ${!notification.isRead ? isDark ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-[#3E2723]' : ''}`}>

                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {notification.type === 'security' && <Shield className="h-5 w-5 text-blue-600" />}
                      <h3 className={`text-lg font-bold ${textPrimaryClass}`}>
                        {notification.title}
                      </h3>
                    </div>
                    <span className={`text-xs ${textSecondaryClass}`}>
                      {notification.date}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${textSecondaryClass} whitespace-pre-line`}>

                    {notification.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${buttonBgClass} ${notification.isRead ? 'opacity-50 cursor-default' : ''}`}
                    disabled={notification.isRead}>

                    <Eye className="h-4 w-4" />
                    {notification.isRead ? 'Read' : 'Mark as Read'}
                  </button>
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${buttonBgClass}`}>

                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            )
          }
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200/20">
          <div className={`text-sm ${textSecondaryClass}`}>
            Page {currentPage}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-[#333] text-white hover:bg-[#444]' : 'bg-[#3E2723] text-white hover:bg-[#2D1B18]'}`}
              disabled={currentPage === 1}>

              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-[#333] text-white hover:bg-[#444]' : 'bg-[#F5F0E8] text-[#3E2723] hover:bg-[#E8E0D5]'}`}>

              Next
            </button>
          </div>
        </div>
      </div>
    </div>);

}