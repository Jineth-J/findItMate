import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Building,
  Eye,
  MessageSquare,
  Users,
  MessageCircle,
  MapPin,
  Star,
  Sparkles,
  CheckCircle,
  Send,
  X,
  FileText,
  DollarSign,
  AlertTriangle,
  Download,
  LayoutGrid,
  ThumbsUp
} from
  'lucide-react';
import { User, Review } from '../types';
import { AddPropertyModal } from '../components/AddPropertyModal';
import { PropertyDetailModal } from '../components/landlord/PropertyDetailModal';
import { EditPropertyModal } from '../components/landlord/EditPropertyModal';
import { AllListingsModal } from '../components/landlord/AllListingsModal';
import { propertiesAPI, bookingsAPI, messagesAPI, uploadAPI } from '../services/api';
interface LandlordDashboardPageProps {
  user: User;
  isVerified: boolean;
  onNavigate: (page: string) => void;
  onVerifyClick: () => void;
  onOpenSubscription: () => void;
  reviews: Review[];
}
interface Tenant {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  status: 'occupying' | 'requested' | 'pending-tour';
  since?: string;
  date?: string;
  email: string;
  propertyName?: string;
  messages: {
    sender: 'landlord' | 'student';
    text: string;
  }[];
  rentStatus?: 'paid' | 'overdue' | 'pending';
  rentAmount?: string;
  dueDate?: string;
  leaseEnd?: string;
}
type DashboardTab = 'overview' | 'rent' | 'leases' | 'reports' | 'reviews';
export function LandlordDashboardPage({
  user,
  isVerified,
  onNavigate,
  onVerifyClick,
  onOpenSubscription,
  reviews
}: LandlordDashboardPageProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [activeConversation, setActiveConversation] = useState<
    {
      sender: 'landlord' | 'student';
      text: string;
    }[]>(
      []);
  // Property Detail Modal State
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  // Edit Property Modal State
  const [isEditPropertyOpen, setIsEditPropertyOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  // All Listings Modal State
  const [isAllListingsOpen, setIsAllListingsOpen] = useState(false);
  // Calculate review stats
  const averageRating =
    reviews.length > 0 ?
      (
        reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).
        toFixed(1) :
      '0.0';
  // Reusable function to refresh property list from API
  const refreshProperties = async () => {
    try {
      // Use getAll with no filters - the backend getByLandlord needs landlord._id, not user.id
      // We'll fetch all and filter client-side, or better yet fix the backend
      const propertiesResponse = await propertiesAPI.getByLandlord(user.id);
      const propertiesData = (propertiesResponse.success && propertiesResponse.data) ? propertiesResponse.data : [];

      const bookingsResponse = await bookingsAPI.getAll();
      const bookingsData = (bookingsResponse.success && bookingsResponse.data) ? bookingsResponse.data : [];

      const propertyWithTenants = propertiesData.map((prop: any) => {
        const propBookings = bookingsData.filter((b: any) =>
          (b.propertyId?._id === prop._id || b.propertyId === prop._id) && b.status !== 'cancelled'
        );

        const tenants = propBookings.map((b: any) => ({
          id: b._id,
          userId: b.user?._id || b.userId || 'unknown',
          name: b.guestName || 'Unknown User',
          avatar: (b.guestName || 'U').charAt(0).toUpperCase(),
          status: b.status === 'confirmed' ? 'occupying' : 'requested',
          since: new Date(b.createdAt).toLocaleDateString(),
          email: b.guestEmail || '',
          propertyName: prop.title,
          rentStatus: 'paid',
          rentAmount: prop.rent,
          dueDate: '5th',
          leaseEnd: b.checkOut ? new Date(b.checkOut).toLocaleDateString() : 'N/A',
          messages: []
        }));

        return {
          ...prop,
          id: prop._id,
          name: prop.title,
          tenants,
          location: prop.location?.city || prop.address || '',
          image: prop.images && prop.images.length > 0
            ? (typeof prop.images[0] === 'string' ? prop.images[0] : prop.images[0]?.url || '/uploads/default-property.png')
            : '/uploads/default-property.png',
          price: prop.rent,
          rating: prop.rating || 0,
          reviews: prop.reviewCount || 0,
          tags: prop.amenities || [],
          meals: 'Not Included',
          estimatedBudget: prop.estimatedBudget || prop.rent * 5
        };
      });

      setProperties(propertyWithTenants);
    } catch (error) {
      console.error('Error refreshing properties:', error);
    }
  };

  const handleAddPropertyClick = () => {
    if (isVerified) {
      setIsAddPropertyOpen(true);
    } else {
      onVerifyClick();
    }
  };
  const handleAddPropertySubmit = async (property: any) => {
    try {
      // 1. Upload images first if any
      let imageUrls: string[] = [];
      if (property.images && property.images.length > 0) {
        for (const imageFile of property.images) {
          try {
            const uploadResponse = await uploadAPI.upload(imageFile);
            if (uploadResponse.success && uploadResponse.data?.url) {
              imageUrls.push(uploadResponse.data.url);
            }
          } catch (uploadErr) {
            console.error('Image upload failed:', uploadErr);
          }
        }
      }

      // Use default image if none uploaded
      if (imageUrls.length === 0) {
        imageUrls = ['/uploads/default-property.png'];
      }

      // 2. Prepare property data matching the Property model schema
      const propertyData: any = {
        title: property.title,
        description: `${property.title} - Accommodates ${property.numberOfPeople || 1} people`,
        type: 'single',
        rent: parseInt(property.rent) || 0,
        deposit: parseInt(property.deposit) || 0,
        capacity: parseInt(property.numberOfPeople) || 1,
        amenities: property.amenities || [],
        address: property.address || '', // String, not object
        location: {
          lat: property.lat || 6.9271,
          lng: property.lng || 79.8612,
          city: property.address?.split(',')[0]?.trim() || 'Colombo'
        },
        estimatedBudget: parseInt(property.totalBudget) || parseInt(property.rent) || 0,
        utilitiesCost: parseInt(property.utilitiesCost) || 0,
        foodCost: parseInt(property.foodCost) || 0,
        transportCost: parseInt(property.transportCost) || 0,
        images: imageUrls,
        status: 'active'
      };

      const response = await propertiesAPI.create(propertyData);

      if (response.success) {
        // Refresh properties list
        await refreshProperties();
        setIsAddPropertyOpen(false);
        alert('Property added successfully!');
      } else {
        alert('Failed to add property: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Failed to add property. Please try again.');
    }
  };
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const handleOpenChat = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsChatOpen(true);
    setActiveConversation([]); // Clear previous messages

    // Fetch conversation with this tenant
    try {
      const conversationsResponse = await messagesAPI.getConversations();
      if (conversationsResponse.success && conversationsResponse.data) {
        const conversation = conversationsResponse.data.find((c: any) =>
          c.participants.some((p: any) => (p._id || p) === tenant.userId)
        );

        if (conversation) {
          setActiveConversationId(conversation._id);
          const messagesResponse = await messagesAPI.getMessages(conversation._id);
          if (messagesResponse.success && messagesResponse.data) {
            setActiveConversation(messagesResponse.data.map((m: any) => ({
              sender: m.sender._id === user.id ? 'landlord' : 'student',
              text: m.content
            })));
          }
        } else {
          setActiveConversationId(null); // No conversation yet
        }
      }
    } catch (error) {
      console.error("Error fetching conversation", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedTenant) return;

    // Optimistic update
    const newMessage = { sender: 'landlord' as const, text: chatMessage };
    setActiveConversation([...activeConversation, newMessage]);
    setChatMessage('');

    try {
      if (activeConversationId) {
        await messagesAPI.send({
          conversationId: activeConversationId,
          content: newMessage.text
        });
      } else {
        const response = await messagesAPI.send({
          recipientId: selectedTenant.userId,
          // propertyId is strictly not required if conversation doesn't exist, but good to have.
          // We can find propertyId from selectedTenant if we stored it.
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

  // Poll for messages in active conversation
  useEffect(() => {
    if (!activeConversationId || !isChatOpen) return;
    const interval = setInterval(async () => {
      try {
        const res = await messagesAPI.getMessages(activeConversationId);
        if (res.success && res.data) {
          setActiveConversation(res.data.map((m: any) => ({
            sender: m.sender._id === user.id ? 'landlord' : 'student',
            text: m.content
          })));
        }
      } catch (e) { console.error(e); }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConversationId, isChatOpen, user.id]);

  // Handlers for Property Detail Modal actions
  const handleEditProperty = (property: any) => {
    setIsPropertyModalOpen(false);
    setEditingProperty(property);
    setIsEditPropertyOpen(true);
  };
  const handleEditSubmit = async (data: any) => {
    try {
      const propertyId = editingProperty?._id || editingProperty?.id;
      if (!propertyId) {
        alert('Property ID not found');
        return;
      }

      // Upload new images if any
      let imageUrls = data.existingImages || [];
      if (data.newImages && data.newImages.length > 0) {
        for (const imageFile of data.newImages) {
          if (imageFile instanceof File) {
            try {
              const uploadResponse = await uploadAPI.upload(imageFile);
              if (uploadResponse.success && uploadResponse.data?.url) {
                imageUrls.push(uploadResponse.data.url);
              }
            } catch (err) {
              console.error('Edit image upload failed:', err);
            }
          }
        }
      }

      const updateData: any = {
        title: data.title,
        description: data.description,
        rent: parseInt(data.rent) || 0,
        deposit: parseInt(data.deposit) || 0,
        capacity: parseInt(data.capacity) || 1,
        amenities: data.amenities || [],
        address: data.address,
        location: {
          lat: data.lat || editingProperty.location?.lat || 6.9271,
          lng: data.lng || editingProperty.location?.lng || 79.8612,
          city: (data.address || editingProperty.address || '').split(',')[0]?.trim() || 'Colombo'
        },
        type: data.type,
        status: data.status
      };

      if (imageUrls.length > 0) {
        updateData.images = imageUrls;
      }

      const response = await propertiesAPI.update(propertyId, updateData);

      if (response.success) {
        await refreshProperties();
        alert('Property updated successfully!');
      } else {
        alert('Failed to update property: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Failed to update property. Please try again.');
    } finally {
      setIsEditPropertyOpen(false);
      setEditingProperty(null);
    }
  };
  const handleDeactivateProperty = (property: any) => {
    if (window.confirm(`Are you sure you want to deactivate ${property.name}?`)) {
      console.log('Deactivate property:', property.id);
      setIsPropertyModalOpen(false);
    }
  };
  const handleChatFromModal = (tenant: any) => {
    setIsPropertyModalOpen(false);
    handleOpenChat(tenant);
  };

  const handleViewAllListings = () => {
    setIsAllListingsOpen(true);
  };
  const handleSelectPropertyFromAll = (property: any) => {
    setIsAllListingsOpen(false);
    setSelectedProperty(property);
    setIsPropertyModalOpen(true);
  };
  // State for real data
  const [properties, setProperties] = useState<any[]>([]);
  // const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (user && user.id) {
          await refreshProperties();
        }
      } catch (error) {
        console.error("Error fetching landlord data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const allTenants = properties.
    flatMap((p) =>
      p.tenants ? p.tenants.map((t: any) => ({
        ...t,
        propertyName: p.name
      })) : []
    ).

    sort((a: any, b: any) => {
      const order: Record<string, number> = {
        occupying: 1,
        requested: 2,
        'pending-tour': 3
      };
      return (order[a.status] || 99) - (order[b.status] || 99);
    });
  const activeTenants = allTenants.filter((t) => t.status === 'occupying');
  // Mock Reports
  const reports = [
    {
      id: 1,
      type: 'Maintenance',
      title: 'Leaking Tap in Bathroom',
      tenant: 'Kavindi Perera',
      property: 'Modern Single Room',
      priority: 'Medium',
      status: 'Pending',
      date: 'Yesterday'
    },
    {
      id: 2,
      type: 'Complaint',
      title: 'Noise from neighbors',
      tenant: 'Sarah Silva',
      property: 'Premium Suite',
      priority: 'Low',
      status: 'Resolved',
      date: '3 days ago'
    }];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#3E2723] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#3E2723] font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-12">
      {/* Dashboard Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3E2723]">
              Property Command Center
            </h1>
            <p className="text-[#5D4037] mt-1">Welcome back, {user.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenSubscription}
              className="flex items-center gap-2 px-4 py-3 bg-[#3E2723] text-white rounded-xl hover:bg-[#2D1B18] transition-colors font-medium shadow-sm">

              <Sparkles className="h-4 w-4 text-yellow-400" />
              Upgrade Plan
            </button>
            <button
              onClick={() => onNavigate('notifications')}
              className="p-3 bg-white rounded-xl border border-[#E8E0D5] text-[#3E2723] hover:bg-[#FAF9F6] transition-colors">

              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={handleAddPropertyClick}
              className="flex items-center gap-2 px-6 py-3 bg-[#3E2723] text-white rounded-xl hover:bg-[#2D1B18] transition-colors font-medium">

              <Plus className="h-5 w-5" />
              Add Property
            </button>
          </div>
        </div>

        {/* Verification Banner */}
        {!isVerified &&
          <div className="bg-[#FBE9E7] border border-[#FFCCBC] rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFCCBC] flex items-center justify-center flex-shrink-0">
                <Bell className="h-5 w-5 text-[#D84315]" />
              </div>
              <div>
                <h3 className="font-bold text-[#3E2723]">
                  Complete Your Verification
                </h3>
                <p className="text-sm text-[#5D4037]">
                  Verify your identity to list properties and receive inquiries
                </p>
              </div>
            </div>
            <button
              onClick={onVerifyClick}
              className="px-6 py-2 bg-[#D32F2F] text-white font-medium rounded-lg hover:bg-[#B71C1C] transition-colors whitespace-nowrap">

              Verify Now
            </button>
          </div>
        }

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
          {[
            {
              id: 'overview',
              label: 'Overview',
              icon: LayoutGrid
            },
            {
              id: 'rent',
              label: 'Rent Tracker',
              icon: DollarSign
            },
            {
              id: 'leases',
              label: 'Lease Agreements',
              icon: FileText
            },
            {
              id: 'reports',
              label: 'Reports & Requests',
              icon: AlertTriangle
            },
            {
              id: 'reviews',
              label: 'Student Reviews',
              icon: Star
            }].
            map((tab) =>
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#3E2723] text-white shadow-md' : 'bg-white text-[#5D4037] hover:bg-[#E8E0D5]'}`}>

                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            )}
        </div>

        {/* TAB CONTENT */}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' &&
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#E8E0D5]">
                <div className="flex justify-between items-start mb-4">
                  <Building className="h-6 w-6 text-[#5D4037]" />
                  <span className="text-green-500 text-xs font-medium">↗</span>
                </div>
                <div className="text-3xl font-bold text-[#3E2723] mb-1">
                  {isVerified ? '3' : '0'}
                </div>
                <div className="text-sm text-[#5D4037]">Total Properties</div>
              </div>

              <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#E8E0D5]">
                <div className="flex justify-between items-start mb-4">
                  <Eye className="h-6 w-6 text-[#5D4037]" />
                  <span className="text-green-500 text-xs font-medium">↗</span>
                </div>
                <div className="text-3xl font-bold text-[#3E2723] mb-1">
                  {isVerified ? '1.2k' : '1.2k'}
                </div>
                <div className="text-sm text-[#5D4037]">Total Views</div>
              </div>

              <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#E8E0D5]">
                <div className="flex justify-between items-start mb-4">
                  <MessageSquare className="h-6 w-6 text-[#5D4037]" />
                  <span className="text-green-500 text-xs font-medium">↗</span>
                </div>
                <div className="text-3xl font-bold text-[#3E2723] mb-1">
                  {allTenants.filter((t) => t.status === 'requested').length}
                </div>
                <div className="text-sm text-[#5D4037]">New Requests</div>
              </div>

              <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#E8E0D5]">
                <div className="flex justify-between items-start mb-4">
                  <Users className="h-6 w-6 text-[#5D4037]" />
                  <span className="text-green-500 text-xs font-medium">↗</span>
                </div>
                <div className="text-3xl font-bold text-[#3E2723] mb-1">
                  {allTenants.filter((t) => t.status === 'occupying').length}
                </div>
                <div className="text-sm text-[#5D4037]">Active Tenants</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Your Properties Section */}
              <div className="lg:col-span-2 bg-[#FAF9F6] rounded-3xl p-8 border border-[#E8E0D5]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#3E2723]">
                    Your Properties
                  </h2>
                  {isVerified &&
                    <button
                      onClick={handleViewAllListings}
                      className="text-sm text-[#5D4037] hover:text-[#3E2723] font-medium flex items-center gap-1 bg-[#E8E0D5] px-3 py-1 rounded-lg">

                      View All Listings <span className="text-xs">→</span>
                    </button>
                  }
                </div>

                {!isVerified ?
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-[#E8E0D5] rounded-2xl flex items-center justify-center mb-4">
                      <Building className="h-8 w-8 text-[#A1887F]" />
                    </div>
                    <h3 className="text-[#5D4037] font-medium mb-6">
                      No properties listed yet
                    </h3>
                    <button
                      onClick={handleAddPropertyClick}
                      className="px-6 py-3 bg-[#3E2723] text-white font-medium rounded-xl hover:bg-[#2D1B18] transition-colors flex items-center gap-2">

                      <Plus className="h-5 w-5" />
                      Add Your First Property
                    </button>
                  </div> :

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {properties.map((property) =>
                      <div
                        key={property.id}
                        className="bg-white rounded-2xl overflow-hidden border border-[#E8E0D5] hover:shadow-md transition-shadow flex flex-col cursor-pointer group"
                        onClick={() => {
                          setSelectedProperty(property);
                          setIsPropertyModalOpen(true);
                        }}>

                        <div className="relative h-48">
                          <img
                            src={property.image}
                            alt={property.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-md uppercase shadow-sm">
                              {property.status}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-start gap-2 text-xs text-[#795548] mb-2">
                            <MapPin className="h-3 w-3 mt-0.5" />
                            {property.location}
                          </div>
                          <h3 className="font-bold text-[#3E2723] text-sm mb-2 line-clamp-1 group-hover:text-[#5D4037] transition-colors">
                            {property.name}
                          </h3>

                          <div className="mt-auto">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <span className="font-bold text-[#3E2723]">
                                  {property.price}
                                </span>
                                <span className="text-[10px] text-[#795548]">
                                  {property.period}
                                </span>
                              </div>
                            </div>

                            {/* Tenant Avatars Section */}
                            {property.tenants.length > 0 ?
                              <div className="flex items-center gap-3 mb-3 pt-3 border-t border-[#F5F5F5]">
                                <div className="flex -space-x-2">
                                  {property.tenants.map((tenant: Tenant) =>
                                    <div key={tenant.id} className="relative">
                                      <div
                                        className="w-7 h-7 rounded-full bg-[#3E2723] text-white text-[10px] flex items-center justify-center border-2 border-white font-bold"
                                        title={tenant.name}>

                                        {tenant.avatar}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs text-[#795548] font-medium">
                                  {property.tenants.length}{' '}
                                  {property.tenants.length === 1 ?
                                    'User' :
                                    'Users'}
                                </span>
                              </div> :

                              <div className="mb-3 pt-3 border-t border-[#F5F5F5] text-xs text-[#A1887F] italic">
                                No active tenants or requests
                              </div>
                            }

                            <button className="w-full px-3 py-2 bg-[#3E2723] text-white text-xs font-medium rounded-lg hover:bg-[#2D1B18] transition-colors shadow-sm">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                }
              </div>

              {/* Tenants & Requests Sidebar */}
              <div className="bg-[#FAF9F6] rounded-3xl p-6 border border-[#E8E0D5] flex flex-col h-fit">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#3E2723]">
                    Tenants & Requests
                  </h2>
                  <span className="bg-[#3E2723] text-white text-xs font-bold px-2 py-1 rounded-full">
                    {allTenants.length}
                  </span>
                </div>

                {allTenants.length === 0 ?
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 bg-[#E8E0D5] rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-[#A1887F]" />
                    </div>
                    <h3 className="text-[#5D4037] font-medium">
                      No active tenants yet
                    </h3>
                  </div> :

                  <div className="space-y-3">
                    {allTenants.map((tenant: Tenant) =>
                      <div
                        key={tenant.id}
                        className="bg-white p-3 rounded-xl border border-[#E8E0D5] hover:border-[#3E2723]/30 transition-colors cursor-pointer group"
                        onClick={() => handleOpenChat(tenant)}>

                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-[#F5F0E8] text-[#3E2723] font-bold flex items-center justify-center border border-[#E8E0D5]">
                                {tenant.avatar}
                              </div>
                              <div
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${tenant.status === 'occupying' ? 'bg-green-500' : tenant.status === 'requested' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-[#3E2723] text-sm">
                                {tenant.name}
                              </h4>
                              <p className="text-[10px] text-[#795548] line-clamp-1">
                                {tenant.propertyName}
                              </p>
                            </div>
                          </div>
                          <button
                            className="p-2 rounded-full bg-[#F5F0E8] text-[#3E2723] hover:bg-[#3E2723] hover:text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenChat(tenant);
                            }}>

                            <MessageCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                }
              </div>
            </div>
          </>
        }

        {/* RENT TRACKER TAB */}
        {activeTab === 'rent' &&
          <div className="bg-white rounded-3xl p-8 border border-[#E8E0D5] shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#3E2723]">Rent Tracker</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-[#F5F0E8] text-[#3E2723] rounded-lg text-sm font-medium">
                  This Month
                </button>
                <button className="px-4 py-2 bg-white border border-[#E8E0D5] text-[#5D4037] rounded-lg text-sm font-medium">
                  Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E8E0D5]">
                    <th className="text-left py-4 px-4 text-xs font-bold text-[#795548] uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-[#795548] uppercase tracking-wider">
                      Property
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-[#795548] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-[#795548] uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-[#795548] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-[#795548] uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeTenants.map((tenant: Tenant) =>
                    <tr
                      key={tenant.id}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAF9F6]">

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#3E2723] text-white flex items-center justify-center text-xs font-bold">
                            {tenant.avatar}
                          </div>
                          <span className="font-medium text-[#3E2723]">
                            {tenant.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-[#5D4037]">
                        {tenant.propertyName}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#3E2723]">
                        {tenant.rentAmount}
                      </td>
                      <td className="py-4 px-4 text-sm text-[#5D4037]">
                        {tenant.dueDate}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${tenant.rentStatus === 'paid' ? 'bg-green-100 text-green-700' : tenant.rentStatus === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>

                          {tenant.rentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {tenant.rentStatus !== 'paid' ?
                          <button
                            onClick={() => handleOpenChat(tenant)}
                            className="text-xs font-medium text-[#3E2723] hover:underline flex items-center gap-1">

                            <Bell className="h-3 w-3" /> Send Reminder
                          </button> :

                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Paid
                          </span>
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        }

        {/* LEASES TAB */}
        {activeTab === 'leases' &&
          <div className="bg-white rounded-3xl p-8 border border-[#E8E0D5] shadow-sm">
            <h2 className="text-xl font-bold text-[#3E2723] mb-6">
              Active Lease Agreements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTenants.map((tenant: Tenant) =>
                <div
                  key={tenant.id}
                  className="border border-[#E8E0D5] rounded-xl p-6 hover:border-[#3E2723] transition-colors">

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#F5F0E8] rounded-lg">
                        <FileText className="h-6 w-6 text-[#3E2723]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#3E2723]">
                          {tenant.name}
                        </h3>
                        <p className="text-xs text-[#795548]">
                          {tenant.propertyName}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#795548]">Lease Period</span>
                      <span className="font-medium text-[#3E2723]">
                        Jan 2024 - {tenant.leaseEnd}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#795548]">Monthly Rent</span>
                      <span className="font-medium text-[#3E2723]">
                        {tenant.rentAmount}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-2 border border-[#E8E0D5] rounded-lg text-sm font-medium text-[#5D4037] hover:bg-[#F5F0E8] flex items-center justify-center gap-2">
                      <Eye className="h-4 w-4" /> View
                    </button>
                    <button className="flex-1 py-2 bg-[#3E2723] text-white rounded-lg text-sm font-medium hover:bg-[#2D1B18] flex items-center justify-center gap-2">
                      <Download className="h-4 w-4" /> Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        }

        {/* REPORTS TAB */}
        {activeTab === 'reports' &&
          <div className="bg-white rounded-3xl p-8 border border-[#E8E0D5] shadow-sm">
            <h2 className="text-xl font-bold text-[#3E2723] mb-6">
              Reports & Requests
            </h2>
            <div className="space-y-4">
              {reports.map((report) =>
                <div
                  key={report.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-[#E8E0D5] rounded-xl hover:bg-[#FAF9F6]">

                  <div className="flex items-start gap-4 mb-4 md:mb-0">
                    <div
                      className={`p-3 rounded-full ${report.priority === 'High' ? 'bg-red-100 text-red-600' : report.priority === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>

                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-[#3E2723]">
                          {report.title}
                        </h4>
                        <span className="text-xs px-2 py-0.5 bg-[#EFEBE9] text-[#5D4037] rounded-full">
                          {report.type}
                        </span>
                      </div>
                      <p className="text-sm text-[#795548] mb-1">
                        Reported by{' '}
                        <span className="font-medium text-[#3E2723]">
                          {report.tenant}
                        </span>{' '}
                        • {report.property}
                      </p>
                      <p className="text-xs text-[#A1887F]">{report.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex flex-col items-end mr-4">
                      <span className="text-xs text-[#795548] uppercase font-bold">
                        Priority
                      </span>
                      <span
                        className={`text-sm font-bold ${report.priority === 'High' ? 'text-red-600' : report.priority === 'Medium' ? 'text-orange-600' : 'text-blue-600'}`}>

                        {report.priority}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const tenant = activeTenants.find(
                          (t) => t.name === report.tenant
                        );
                        if (tenant) handleOpenChat(tenant);
                      }}
                      className="px-4 py-2 border border-[#3E2723] text-[#3E2723] rounded-lg text-sm font-medium hover:bg-[#F5F0E8] flex items-center gap-2">

                      <MessageCircle className="h-4 w-4" /> Chat
                    </button>
                    <button className="px-4 py-2 bg-[#3E2723] text-white rounded-lg text-sm font-medium hover:bg-[#2D1B18]">
                      Resolve
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        }

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' &&
          <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E8E0D5] flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                  <Star className="h-6 w-6 fill-current" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#3E2723]">
                    {averageRating}
                  </div>
                  <div className="text-sm text-[#795548]">Average Rating</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#E8E0D5] flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#3E2723]">
                    {reviews.length}
                  </div>
                  <div className="text-sm text-[#795548]">Total Reviews</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#E8E0D5] flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <ThumbsUp className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#3E2723]">
                    {reviews.filter((r) => r.rating >= 4).length}
                  </div>
                  <div className="text-sm text-[#795548]">Positive Reviews</div>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-3xl p-8 border border-[#E8E0D5] shadow-sm">
              <h2 className="text-xl font-bold text-[#3E2723] mb-6">
                Recent Student Reviews
              </h2>

              {reviews.length === 0 ?
                <div className="text-center py-12 text-[#795548]">
                  No reviews yet. Encourage your students to leave feedback!
                </div> :

                <div className="space-y-6">
                  {reviews.map((review) =>
                    <div
                      key={review.id}
                      className="border-b border-[#F5F5F5] last:border-0 pb-6 last:pb-0">

                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#3E2723] text-white flex items-center justify-center font-bold text-sm">
                            {review.studentName.
                              split(' ').
                              map((n) => n[0]).
                              join('').
                              substring(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-bold text-[#3E2723] text-sm">
                              {review.studentName}
                            </h4>
                            <p className="text-xs text-[#795548]">
                              {review.propertyName}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((star) =>
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />

                            )}
                          </div>
                          <span className="text-xs text-[#A1887F]">
                            {review.date}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-[#5D4037] bg-[#FAF9F6] p-4 rounded-xl">
                        "{review.comment}"
                      </p>
                    </div>
                  )}
                </div>
              }
            </div>
          </div>
        }
      </div>

      {/* Add Property Modal - Only for verified landlords */}
      <AddPropertyModal
        isOpen={isAddPropertyOpen}
        onClose={() => setIsAddPropertyOpen(false)}
        onSubmit={handleAddPropertySubmit} />


      {/* Property Detail Modal */}
      <PropertyDetailModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        property={selectedProperty}
        onEdit={handleEditProperty}
        onDeactivate={handleDeactivateProperty}
        onChatWithTenant={handleChatFromModal} />


      {/* Edit Property Modal */}
      <EditPropertyModal
        isOpen={isEditPropertyOpen}
        onClose={() => setIsEditPropertyOpen(false)}
        onSubmit={handleEditSubmit}
        property={editingProperty} />


      {/* All Listings Modal */}
      <AllListingsModal
        isOpen={isAllListingsOpen}
        onClose={() => setIsAllListingsOpen(false)}
        properties={properties}
        onSelectProperty={handleSelectPropertyFromAll} />


      {/* Chat Modal */}
      {isChatOpen && selectedTenant &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#F5F0E8] rounded-2xl w-full max-w-md h-[500px] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Chat Header */}
            <div className="p-4 bg-[#F5F0E8] border-b border-[#E8E0D5] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#3E2723] text-white font-bold flex items-center justify-center">
                  {selectedTenant.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-[#3E2723] text-sm">
                    {selectedTenant.name}
                  </h3>
                  <p className="text-xs text-[#795548] line-clamp-1 max-w-[200px]">
                    {selectedTenant.propertyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 hover:bg-[#E8E0D5] rounded-full transition-colors text-[#5D4037]">

                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversation.length === 0 ?
                <div className="h-full flex flex-col items-center justify-center text-[#795548] text-sm opacity-60">
                  <MessageCircle className="h-8 w-8 mb-2" />
                  <p>Start the conversation with {selectedTenant.name}</p>
                </div> :

                activeConversation.map((msg, idx) =>
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'landlord' ? 'justify-end' : 'justify-start'}`}>

                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.sender === 'landlord' ? 'bg-[#3E2723] text-white rounded-br-none' : 'bg-white text-[#3E2723] border border-[#E8E0D5] rounded-bl-none'}`}>

                      {msg.text}
                    </div>
                  </div>
                )
              }
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-[#E8E0D5] flex gap-2">

              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 bg-[#F5F0E8] border border-[#E8E0D5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3E2723] placeholder-[#A1887F]" />

              <button
                type="submit"
                disabled={!chatMessage.trim()}
                className="p-2.5 bg-[#3E2723] text-white rounded-xl hover:bg-[#2D1B18] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      }
    </div>);

}