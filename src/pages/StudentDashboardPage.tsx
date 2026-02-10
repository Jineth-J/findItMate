import React, { useState, useEffect } from 'react';
import {
  Bell,
  User,
  CreditCard,
  FileText,
  BookOpen,
  AlertTriangle,
  Download,
  Phone,
  Mail,
  MessageCircle,
  X,
  Send,
  Home,
  CheckCircle,
  Clock,
  ChevronRight,
  ThumbsUp,
  Sparkles,
  Star,
  LayoutDashboard,
  Calendar
} from
  'lucide-react';
import { User as UserType, Review } from '../types';
import { bookingsAPI, messagesAPI, propertiesAPI } from '../services/api';
interface StudentDashboardPageProps {
  user: UserType;
  onNavigate: (page: string) => void;
  onOpenSubscription: () => void;
  onSubmitReview: (review: Review) => void;
}
type Tab = 'dashboard' | 'payments' | 'lease' | 'rules' | 'issues';
export function StudentDashboardPage({
  user,
  onNavigate,
  onOpenSubscription,
  onSubmitReview
}: StudentDashboardPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'landlord',
      text: 'Hello! Let me know if you need anything.'
    }]
  );
  const [rentalData, setRentalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Bookings
        const bookingsResponse = await bookingsAPI.getAll();
        if (bookingsResponse.success && bookingsResponse.data && bookingsResponse.data.length > 0) {
          // Find the active booking (logic can be improved)
          const activeBooking = bookingsResponse.data.find((b: any) => b.status === 'confirmed' || b.status === 'active');

          if (activeBooking) {
            // 2. Fetch Property Details (if not fully populated)
            let property = activeBooking.propertyId;
            if (typeof property === 'string') {
              const propResponse = await propertiesAPI.getById(property);
              if (propResponse.success) property = propResponse.data;
            }

            // 3. Construct Rental Data
            const landlord = property.landlordId || { name: 'Landlord', email: 'landlord@example.com', phone: '0771234567' };

            setRentalData({
              property: {
                id: property._id || property.id,
                name: property.name,
                address: `${property.address?.number || ''}, ${property.address?.street || ''}, ${property.address?.city || ''}`,
                image: property.images?.[0] || '/uploads/default-property.png',
                status: 'Active',
                leaseStart: new Date(activeBooking.checkIn).toLocaleDateString(),
                leaseEnd: new Date(activeBooking.checkOut).toLocaleDateString(),
                rent: `LKR ${property.price}`,
                deposit: `LKR ${property.price * 2}`,
                keyMoney: `LKR ${property.price}`
              },
              landlord: {
                id: landlord._id || landlord.id,
                name: landlord.name,
                role: 'Property Owner',
                phone: landlord.phone || '+94 77 123 4567',
                email: landlord.email
              },
              payments: [] // Mock payments for now
            });

            // 4. Fetch Conversation with Landlord
            const conversationsResponse = await messagesAPI.getConversations();
            if (conversationsResponse.success && conversationsResponse.data) {
              // Find conversation with this landlord/property
              const conversation = conversationsResponse.data.find((c: any) =>
                c.participants.some((p: any) => (p._id || p) === (landlord._id || landlord.id))
              );

              if (conversation) {
                setActiveConversationId(conversation._id);
                // Fetch messages
                const messagesResponse = await messagesAPI.getMessages(conversation._id);
                if (messagesResponse.success && messagesResponse.data) {
                  setChatHistory(messagesResponse.data.map((m: any) => ({
                    sender: m.sender._id === user.id ? 'student' : 'landlord',
                    text: m.content
                  })));
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching student dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Poll for messages
  useEffect(() => {
    if (!activeConversationId || !isChatOpen) return;

    const intervalId = setInterval(async () => {
      try {
        const messagesResponse = await messagesAPI.getMessages(activeConversationId);
        if (messagesResponse.success && messagesResponse.data) {
          setChatHistory(messagesResponse.data.map((m: any) => ({
            sender: m.sender._id === user.id ? 'student' : 'landlord',
            text: m.content
          })));
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [activeConversationId, isChatOpen, user.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !rentalData) return;

    // Optimistic update
    const newMessage = { sender: 'student', text: chatMessage };
    setChatHistory([...chatHistory, newMessage]);
    setChatMessage('');

    try {
      if (activeConversationId) {
        await messagesAPI.send({
          conversationId: activeConversationId,
          content: newMessage.text
        });
      } else {
        // Create new conversation
        const response = await messagesAPI.send({
          recipientId: rentalData.landlord.id,
          propertyId: rentalData.property.id,
          content: newMessage.text
        });
        if (response.success && response.data) {
          setActiveConversationId((response.data as any).conversationId);
        }
      }
    } catch (error) {
      console.error("Failed to send message", error);
      alert("Failed to send message");
    }
  };
  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssueModalOpen(false);
    // Logic to submit issue would go here
    alert('Issue reported successfully!');
  };
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) {
      alert('Please select a star rating');
      return;
    }
    const newReview: Review = {
      id: Date.now().toString(),
      roomId: '1',
      propertyName: rentalData.property.name,
      studentName: user.name,
      studentEmail: user.email,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString().split('T')[0]
    };
    onSubmitReview(newReview);
    setIsReviewModalOpen(false);
    setReviewRating(0);
    setReviewHover(0);
    setReviewComment('');
    alert('Review submitted successfully!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-[#3E2723] font-medium animate-pulse">Loading rental details...</div>
      </div>
    );
  }

  if (!rentalData) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] pb-12">
        <div className="bg-[#F5F0E8] border-b border-[#E8E0D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-2 text-sm text-[#795548] mb-2">
              <span>Dashboard</span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-[#3E2723]">My Rentals</span>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#3E2723]">My Rentals</h1>
                <p className="text-[#5D4037] mt-1">
                  Manage your rented properties
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => onNavigate('rooms')} className="px-6 py-3 bg-[#3E2723] text-white rounded-xl">Browse Rooms</button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center min-h-[400px]">
          <Home className="h-16 w-16 text-[#D7CCC8] mb-4" />
          <h2 className="text-xl font-bold text-[#3E2723] mb-2">No Active Rentals</h2>
          <p className="text-[#5D4037] mb-6">You don't have any active rentals yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-12">
      {/* Dashboard Header */}
      <div className="bg-[#F5F0E8] border-b border-[#E8E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-[#795548] mb-2">
            <span>Dashboard</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-[#3E2723]">My Rentals</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#3E2723]">My Rentals</h1>
              <p className="text-[#5D4037] mt-1">
                Manage your rented properties
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenSubscription}
                className="flex items-center gap-2 px-4 py-2 bg-[#3E2723] text-white rounded-full text-sm font-medium hover:bg-[#2D1B18] transition-colors shadow-sm">

                <Sparkles className="h-4 w-4 text-yellow-400" />
                Upgrade to Premium
              </button>
              <button
                onClick={() => onNavigate('notifications')}
                className="p-2 rounded-full bg-white border border-[#E8E0D5] text-[#3E2723] hover:bg-[#FAF9F6]">

                <Bell className="h-5 w-5" />
              </button>
              <button
                onClick={() => onNavigate('student-settings')}
                className="p-2 rounded-full bg-white border border-[#E8E0D5] text-[#3E2723] hover:bg-[#FAF9F6]">

                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Property Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E0D5] shadow-sm">
              <div className="relative h-48 rounded-2xl overflow-hidden mb-6 bg-[#F5F5F5] flex items-center justify-center">
                {rentalData.property.image ?
                  <img
                    src={rentalData.property.image}
                    alt="Property"
                    className="w-full h-full object-cover" /> :


                  <Home className="h-12 w-12 text-[#D7CCC8]" />
                }
              </div>

              <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-3">
                {rentalData.property.status}
              </span>

              <h2 className="text-xl font-bold text-[#3E2723] mb-2">
                {rentalData.property.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-[#795548] mb-2">
                <div className="min-w-[16px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">

                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                {rentalData.property.address}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#795548] mb-6">
                <Clock className="h-4 w-4" />
                {rentalData.property.leaseStart} -{' '}
                {rentalData.property.leaseEnd}
              </div>

              <div className="pt-6 border-t border-[#F5F5F5]">
                <div className="text-2xl font-bold text-[#3E2723]">
                  {rentalData.property.rent}
                </div>
                <div className="text-sm text-[#795548]">per month</div>
              </div>
            </div>

            {/* Landlord Contact */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E0D5] shadow-sm">
              <h3 className="font-bold text-[#3E2723] mb-4">
                Landlord Contact
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[#3E2723]">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-[#3E2723]">
                    {rentalData.landlord.name}
                  </div>
                  <div className="text-sm text-[#795548]">
                    {rentalData.landlord.role}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-[#5D4037]">
                  <Phone className="h-4 w-4" />
                  {rentalData.landlord.phone}
                </div>
                <div className="flex items-center gap-3 text-sm text-[#5D4037]">
                  <Mail className="h-4 w-4" />
                  {rentalData.landlord.email}
                </div>
              </div>

              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full py-3 bg-[#3E2723] text-white rounded-xl font-medium hover:bg-[#2D1B18] transition-colors flex items-center justify-center gap-2">

                <MessageCircle className="h-4 w-4" />
                Send Message
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E0D5] shadow-sm">
              <h3 className="font-bold text-[#3E2723] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsIssueModalOpen(true)}
                  className="w-full py-3 px-4 bg-[#F5F0E8] text-[#3E2723] rounded-xl text-sm font-medium hover:bg-[#E8E0D5] transition-colors flex items-center gap-3 text-left">

                  <AlertTriangle className="h-4 w-4 text-[#D32F2F]" />
                  Report Issue / Complaint
                </button>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full py-3 px-4 bg-[#F5F0E8] text-[#3E2723] rounded-xl text-sm font-medium hover:bg-[#E8E0D5] transition-colors flex items-center gap-3 text-left">

                  <ThumbsUp className="h-4 w-4 text-[#2E7D32]" />
                  Leave Recommendation
                </button>
                <button className="w-full py-3 px-4 bg-[#F5F0E8] text-[#3E2723] rounded-xl text-sm font-medium hover:bg-[#E8E0D5] transition-colors flex items-center gap-3 text-left">
                  <Download className="h-4 w-4 text-[#1976D2]" />
                  Download Lease Agreement
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-full p-1 mb-8 shadow-sm border border-[#E8E0D5] flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-[#3E2723] text-white shadow-sm' : 'text-[#5D4037] hover:bg-[#F5F0E8]'}`}>

                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'payments' ? 'bg-[#3E2723] text-white shadow-sm' : 'text-[#5D4037] hover:bg-[#F5F0E8]'}`}>

                <CreditCard className="h-4 w-4" />
                Payments
              </button>
              <button
                onClick={() => setActiveTab('lease')}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'lease' ? 'bg-[#3E2723] text-white shadow-sm' : 'text-[#5D4037] hover:bg-[#F5F0E8]'}`}>

                <FileText className="h-4 w-4" />
                Lease Details
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'rules' ? 'bg-[#3E2723] text-white shadow-sm' : 'text-[#5D4037] hover:bg-[#F5F0E8]'}`}>

                <BookOpen className="h-4 w-4" />
                Rules
              </button>
              <button
                onClick={() => setActiveTab('issues')}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'issues' ? 'bg-[#3E2723] text-white shadow-sm' : 'text-[#5D4037] hover:bg-[#F5F0E8]'}`}>

                <AlertTriangle className="h-4 w-4" />
                Issues
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-3xl p-8 border border-[#E8E0D5] shadow-sm min-h-[500px]">
              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' &&
                <div>
                  <h2 className="text-xl font-bold text-[#3E2723] mb-6">
                    Welcome, {user.name.split(' ')[0]}!
                  </h2>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-[#3E2723] to-[#5D4037] p-5 rounded-2xl text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="h-5 w-5" />
                        <span className="text-sm font-medium opacity-80">Current Property</span>
                      </div>
                      <div className="font-bold text-lg truncate">{rentalData.property.name}</div>
                      <div className="text-xs opacity-70 mt-1">Active Lease</div>
                    </div>

                    <div className="bg-[#F5F0E8] p-5 rounded-2xl border border-[#E8E0D5]">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-5 w-5 text-[#795548]" />
                        <span className="text-sm font-medium text-[#795548]">Monthly Rent</span>
                      </div>
                      <div className="font-bold text-lg text-[#3E2723]">{rentalData.property.rent}</div>
                      <div className="text-xs text-[#795548] mt-1">Due Monthly</div>
                    </div>

                    <div className="bg-[#F5F0E8] p-5 rounded-2xl border border-[#E8E0D5]">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-[#795548]" />
                        <span className="text-sm font-medium text-[#795548]">Lease Ends</span>
                      </div>
                      <div className="font-bold text-lg text-[#3E2723]">{rentalData.property.leaseEnd}</div>
                      <div className="text-xs text-[#795548] mt-1">Keep track of renewals</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <h3 className="font-bold text-[#3E2723] mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="flex flex-col items-center gap-2 p-4 bg-[#FAF9F6] rounded-xl border border-[#E8E0D5] hover:bg-[#F5F0E8] transition-colors">
                      <CreditCard className="h-6 w-6 text-[#3E2723]" />
                      <span className="text-xs font-medium text-[#5D4037]">Payments</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('lease')}
                      className="flex flex-col items-center gap-2 p-4 bg-[#FAF9F6] rounded-xl border border-[#E8E0D5] hover:bg-[#F5F0E8] transition-colors">
                      <FileText className="h-6 w-6 text-[#3E2723]" />
                      <span className="text-xs font-medium text-[#5D4037]">Lease Details</span>
                    </button>
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="flex flex-col items-center gap-2 p-4 bg-[#FAF9F6] rounded-xl border border-[#E8E0D5] hover:bg-[#F5F0E8] transition-colors">
                      <MessageCircle className="h-6 w-6 text-[#3E2723]" />
                      <span className="text-xs font-medium text-[#5D4037]">Message Landlord</span>
                    </button>
                    <button
                      onClick={() => setIsIssueModalOpen(true)}
                      className="flex flex-col items-center gap-2 p-4 bg-[#FAF9F6] rounded-xl border border-[#E8E0D5] hover:bg-[#F5F0E8] transition-colors">
                      <AlertTriangle className="h-6 w-6 text-[#3E2723]" />
                      <span className="text-xs font-medium text-[#5D4037]">Report Issue</span>
                    </button>
                  </div>

                  {/* Landlord Info Summary */}
                  <h3 className="font-bold text-[#3E2723] mb-4">Your Landlord</h3>
                  <div className="flex items-center gap-4 p-4 bg-[#FAF9F6] rounded-xl border border-[#E8E0D5]">
                    <div className="w-12 h-12 rounded-full bg-[#3E2723] flex items-center justify-center text-white font-bold">
                      {rentalData.landlord.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[#3E2723]">{rentalData.landlord.name}</div>
                      <div className="text-sm text-[#795548]">{rentalData.landlord.email}</div>
                    </div>
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="px-4 py-2 bg-[#3E2723] text-white rounded-xl text-sm font-medium hover:bg-[#2D1B18] transition-colors">
                      Message
                    </button>
                  </div>
                </div>
              }

              {/* LEASE DETAILS TAB */}
              {activeTab === 'lease' &&
                <div>
                  <h2 className="text-xl font-bold text-[#3E2723] mb-8">
                    Lease Agreement Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mb-12">
                    <div>
                      <div className="text-sm text-[#795548] mb-1">
                        Lease Start Date
                      </div>
                      <div className="font-bold text-[#3E2723] text-lg">
                        {rentalData.property.leaseStart}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-[#795548] mb-1">
                        Lease End Date
                      </div>
                      <div className="font-bold text-[#3E2723] text-lg">
                        {rentalData.property.leaseEnd}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-[#795548] mb-1">
                        Monthly Rent
                      </div>
                      <div className="font-bold text-[#3E2723] text-lg">
                        {rentalData.property.rent}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-[#795548] mb-1">
                        Security Deposit
                      </div>
                      <div className="font-bold text-[#3E2723] text-lg">
                        {rentalData.property.deposit}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-[#795548] mb-1">
                        Key Money
                      </div>
                      <div className="font-bold text-[#3E2723] text-lg">
                        {rentalData.property.keyMoney}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-[#795548] mb-1">
                        Lease Status
                      </div>
                      <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        {rentalData.property.status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-[#F5F5F5]">
                    <button className="w-full sm:w-auto px-6 py-3 border border-[#3E2723] text-[#3E2723] rounded-xl font-medium hover:bg-[#F5F0E8] transition-colors flex items-center justify-center gap-2">
                      <Download className="h-4 w-4" />
                      Download Full Lease Agreement (PDF)
                    </button>
                  </div>
                </div>
              }

              {/* PAYMENTS TAB */}
              {activeTab === 'payments' &&
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-[#3E2723]">
                      Payment History
                    </h2>
                    <button className="text-xs font-medium text-[#2E7D32] bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                      All Payments Up to Date
                    </button>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#F5F0E8] p-4 rounded-xl text-center">
                      <div className="text-xs text-[#795548] mb-1">
                        Monthly Rent
                      </div>
                      <div className="font-bold text-[#3E2723]">
                        {rentalData.property.rent}
                      </div>
                    </div>
                    <div className="bg-[#F5F0E8] p-4 rounded-xl text-center">
                      <div className="text-xs text-[#795548] mb-1">
                        Deposit Paid
                      </div>
                      <div className="font-bold text-[#3E2723]">
                        {rentalData.property.deposit}
                      </div>
                    </div>
                    <div className="bg-[#F5F0E8] p-4 rounded-xl text-center">
                      <div className="text-xs text-[#795548] mb-1">
                        Key Money
                      </div>
                      <div className="font-bold text-[#3E2723]">
                        {rentalData.property.keyMoney}
                      </div>
                    </div>
                  </div>

                  {/* Payment List */}
                  <div className="space-y-4">
                    {rentalData.payments.map((payment: any) =>
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 bg-[#F5F0E8] rounded-xl border border-[#E8E0D5]">

                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2E7D32]">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-[#3E2723]">
                              {payment.type}
                            </div>
                            <div className="text-xs text-[#795548]">
                              {payment.date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#3E2723]">
                            {payment.amount}
                          </div>
                          <div className="inline-block px-2 py-0.5 bg-[#2E7D32] text-white text-[10px] font-bold rounded-full uppercase">
                            {payment.status}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              }

              {/* RULES TAB */}
              {activeTab === 'rules' &&
                <div>
                  <h2 className="text-xl font-bold text-[#3E2723] mb-6">
                    Property Rules & Guidelines
                  </h2>
                  <div className="space-y-4">
                    {[
                      'Quiet hours are from 10:00 PM to 6:00 AM.',
                      'No smoking inside the premises.',
                      'Guests are allowed until 9:00 PM.',
                      'Keep the kitchen and common areas clean after use.',
                      'Garbage must be separated and disposed of in designated bins.'].
                      map((rule, idx) =>
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-4 bg-[#F5F0E8] rounded-xl">

                          <div className="mt-0.5 min-w-[20px]">
                            <CheckCircle className="h-5 w-5 text-[#3E2723]" />
                          </div>
                          <span className="text-[#5D4037]">{rule}</span>
                        </div>
                      )}
                  </div>
                </div>
              }

              {/* ISSUES TAB */}
              {activeTab === 'issues' &&
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#3E2723]">
                      Issues & Complaints
                    </h2>
                    <button
                      onClick={() => setIsIssueModalOpen(true)}
                      className="px-4 py-2 bg-[#3E2723] text-white text-sm font-medium rounded-lg hover:bg-[#2D1B18] transition-colors flex items-center gap-2">

                      <AlertTriangle className="h-4 w-4" />
                      Report Issue
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-[#E8E0D5] rounded-2xl">
                    <div className="w-16 h-16 bg-[#F5F0E8] rounded-full flex items-center justify-center mb-4">
                      <AlertTriangle className="h-8 w-8 text-[#A1887F]" />
                    </div>
                    <h3 className="text-[#3E2723] font-bold mb-1">
                      No issues reported yet
                    </h3>
                    <p className="text-sm text-[#795548]">
                      Click "Report Issue" if you need to raise any concerns
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      {/* REPORT ISSUE MODAL */}
      {isIssueModalOpen &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-[#3E2723]">Report an Issue</h3>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full">

                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleReportIssue} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3E2723] mb-1">
                  Type
                </label>
                <select className="w-full px-4 py-2 bg-[#F5F0E8] border border-[#E8E0D5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E2723]">
                  <option>Complaint</option>
                  <option>Maintenance Issue</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3E2723] mb-1">
                  Priority
                </label>
                <select className="w-full px-4 py-2 bg-[#F5F0E8] border border-[#E8E0D5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E2723]">
                  <option>Medium</option>
                  <option>High</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3E2723] mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Brief description of the issue"
                  className="w-full px-4 py-2 bg-[#F5F0E8] border border-[#E8E0D5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E2723]" />

              </div>
              <div>
                <label className="block text-xs font-bold text-[#3E2723] mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide details about the issue..."
                  className="w-full px-4 py-2 bg-[#F5F0E8] border border-[#E8E0D5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E2723] resize-none">
                </textarea>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#3E2723] text-white font-bold rounded-xl hover:bg-[#2D1B18] transition-colors">

                Submit Issue
              </button>
            </form>
          </div>
        </div>
      }

      {/* REVIEW MODAL */}
      {isReviewModalOpen &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-[#3E2723]">Write a Review</h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full">

                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-sm text-[#795548] mb-3">
                  How would you rate your stay?
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) =>
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(0)}
                      className="focus:outline-none transition-transform hover:scale-125 active:scale-95">

                      <Star
                        className={`h-8 w-8 transition-colors duration-150 ${star <= (reviewHover || reviewRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`} />

                    </button>
                  )}
                </div>
                {(reviewHover > 0 || reviewRating > 0) &&
                  <p className="text-xs text-[#795548] mt-2 font-medium">
                    {
                      ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][
                      reviewHover || reviewRating]

                    }
                  </p>
                }
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3E2723] mb-1">
                  Your Experience
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about your stay, the landlord, and the property..."
                  className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#E8E0D5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E2723] resize-none"
                  required>
                </textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#3E2723] text-white font-bold rounded-xl hover:bg-[#2D1B18] transition-colors">

                Submit Review
              </button>
            </form>
          </div>
        </div>
      }

      {/* CHAT MODAL */}
      {isChatOpen &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#F5F0E8] rounded-2xl w-full max-w-md h-[500px] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#F5F0E8] border-b border-[#E8E0D5] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#3E2723]" />
                <h3 className="font-bold text-[#3E2723]">
                  Chat with {rentalData.landlord.name}
                </h3>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-[#E8E0D5] rounded-full">

                <X className="h-5 w-5 text-[#3E2723]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 ?
                <div className="h-full flex items-center justify-center text-[#795548] text-sm">
                  No messages yet. Start the conversation!
                </div> :

                chatHistory.map((msg, idx) =>
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>

                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.sender === 'student' ? 'bg-[#3E2723] text-white rounded-br-none' : 'bg-white text-[#3E2723] border border-[#E8E0D5] rounded-bl-none'}`}>

                      {msg.text}
                    </div>
                  </div>
                )
              }
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-[#E8E0D5] flex gap-2">

              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-[#F5F0E8] border border-[#E8E0D5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E2723]" />

              <button
                type="submit"
                className="p-2 bg-[#3E2723] text-white rounded-xl hover:bg-[#2D1B18] transition-colors">

                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      }
    </div>);

}