import { useState, useEffect } from 'react';
import { X, Search, Users, UserPlus, Trash2, CheckCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';

interface ManageUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  date: string;
  raw: any;
}

export function ManageUsersModal({
  isOpen,
  onClose,
  onCreateUser
}: ManageUsersModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Pass searchTerm to the API
      const response = await adminAPI.getUsers(undefined, currentPage, searchTerm);
      if (response.success && response.data) {
        const mappedUsers = response.data.map((u: any) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.userType === 'student' ? 'Student' : u.userType === 'landlord' ? 'Host' : 'Admin',
          status: u.isActive ? (u.isVerified ? 'Active' : 'Pending') : 'Suspended',
          date: new Date(u.createdAt).toLocaleDateString(),
          raw: u
        }));
        setUsers(mappedUsers);
        if (response.pagination) {
          setTotalPages(Math.ceil(response.pagination.total / response.pagination.limit));
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchUsers();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentPage, searchTerm]);

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(id);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleVerifyUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to verify this user?')) return;
    try {
      await adminAPI.verifyUser(id);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Failed to verify user:', error);
      alert('Failed to verify user');
    }
  };

  // Backend filtering is now enabled
  const filteredUsers = users;

  if (!isOpen) return null;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  return <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="w-full max-w-6xl bg-[#161616] border border-[#333] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
      {/* Header */}
      <div className="p-6 border-b border-[#333] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#222] rounded-lg border border-[#333]">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Manage Users</h2>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" />
          </div>
          <button onClick={onCreateUser} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2 whitespace-nowrap">
            <UserPlus className="w-5 h-5" />
            Add User
          </button>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#0f0f0f]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">Loading users...</div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => <div key={user.id} className="bg-[#161616] border border-[#333] rounded-xl p-4 flex items-center justify-between hover:border-[#444] transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center text-lg font-bold text-gray-400 border border-[#333]">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-white">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-8">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.role === 'Admin' ? 'bg-red-900/20 text-red-400 border-red-900/30' : user.role === 'Host' ? 'bg-[#3E2723] text-[#D7CCC8] border-[#5D4037]' : 'bg-[#222] text-gray-400 border-[#333]'}`}>
                  {user.role}
                </span>

                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.status === 'Active' ? 'bg-green-900/20 text-green-400 border-green-900/30' : user.status === 'Pending' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-900/30' : 'bg-red-900/20 text-red-400 border-red-900/30'}`}>
                  {user.status}
                </span>

                <span className="text-sm text-gray-500 font-mono">
                  {user.date}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {user.status === 'Pending' && (
                  <button
                    onClick={() => handleVerifyUser(user.id)}
                    className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-900/10 rounded-lg transition-colors"
                    title="Verify User"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-900/10 rounded-lg transition-colors"
                  title="Delete User"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>)}
            {filteredUsers.length === 0 && <div className="text-center py-12 text-gray-500">
              No users found.
            </div>}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#333] bg-[#161616] flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-[#222] text-white rounded-lg text-sm font-medium hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed border border-[#333] transition-colors">
            Previous
          </button>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>;
}