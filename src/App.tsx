import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { RoomsPage } from './pages/RoomsPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { BookingPage } from './pages/BookingPage';
import { TourPlannerPage } from './pages/TourPlannerPage';
import { LandlordDashboardPage } from './pages/LandlordDashboardPage';
import { LandlordVerificationPage } from './pages/LandlordVerificationPage';
import { LandlordSettingsPage } from './pages/LandlordSettingsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { StudentSettingsPage } from './pages/StudentSettingsPage';
import { StudentVerificationPage } from './pages/StudentVerificationPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { Chatbot } from './components/Chatbot';
import { LoginModal } from './components/LoginModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CommandPalette } from './components/CommandPalette';
import { SubscriptionModal } from './components/SubscriptionModal';
import { PaymentModal } from './components/PaymentModal';
import { NotificationCenter } from './components/NotificationCenter';
import { Room, Page, User, Review } from './types';
import { MessageCircle, X } from 'lucide-react';
import { Footer } from './components/Footer';
import { favoritesAPI } from './services/api';
import { propertiesAPI, messagesAPI, reviewsAPI } from './services/api';
import { ContactLandlordModal } from './components/ContactLandlordModal';
// Mock Data


// Helper to map API property to Room type
const mapPropertyToRoom = (property: any): Room => ({
  id: property._id,
  landlordId: property.landlordId?._id || property.landlordId || 'landlord-1',
  name: property.title,
  price: property.rent,
  description: property.description,
  image: property.images?.[0]?.url || property.images?.[0] || '/uploads/default-property.png',
  images: property.images?.map((img: any) => img.url || img) || [],
  amenities: property.amenities || [],
  rating: property.rating || 4.5,
  capacity: property.capacity || 1,
  type: property.type || 'standard',
  estimatedBudget: property.estimatedBudget || property.rent,
  location: property.location ? {
    lat: property.location.lat || 6.9271,
    lng: property.location.lng || 79.8612,
    city: property.location.city || property.address?.city || '',
    district: property.location.district || property.address?.district || ''
  } : undefined
});

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [previousPage, setPreviousPage] = useState<Page | null>(null);
  const [pageBeforeRoomDetail, setPageBeforeRoomDetail] =
    useState<Page>('rooms');
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalData, setContactModalData] = useState<{ landlordId: string; propertyId: string; propertyName: string } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [tourPlannerRoomIds, setTourPlannerRoomIds] = useState<string[]>([]);
  const [favouriteRoomIds, setFavouriteRoomIds] = useState<string[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<'student' | 'landlord'>(
    'student'
  );
  const [user, setUser] = useState<User | null>(null);
  // Properties from API
  const [rooms, setRooms] = useState<Room[]>([]);


  // Fetch properties from API on mount
  useEffect(() => {
    const fetchProperties = async () => {

      try {
        const response = await propertiesAPI.getAll();
        if (response.success && response.data) {
          const mappedRooms = response.data.map(mapPropertyToRoom);
          setRooms(mappedRooms);
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {

      }
    };
    fetchProperties();

    // Check for verification link
    if (window.location.pathname === '/verify') {
      setCurrentPage('verify-email');
    }
  }, []);
  // Reviews State - fetch from database
  const [reviews, setReviews] = useState<Review[]>([]);

  // Fetch reviews from database
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewsAPI.getAll();
        if (response.success && response.data) {
          const mappedReviews = response.data.map((r: any) => ({
            id: r._id,
            roomId: r.propertyId,
            propertyName: r.propertyName || 'Unknown Property',
            studentName: r.studentName || r.studentId?.userId?.name || 'Anonymous',
            studentEmail: r.studentEmail || '',
            rating: r.rating,
            comment: r.comment,
            date: new Date(r.createdAt).toLocaleDateString()
          }));
          setReviews(mappedReviews);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };
    fetchReviews();
  }, []);
  // Subscription & Payment State
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<
    'student' | 'landlord'>(
      'student');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState({
    name: '',
    price: ''
  });
  // Footer Secret Trigger State
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  // Command Palette State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  // Homepage Search State
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [homeSearchGroupSize, setHomeSearchGroupSize] = useState('');
  // Command Palette Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        currentPage === 'home' &&
        !user &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, user]);
  const handleHomeSearch = (query: string, groupSize: string) => {
    setHomeSearchQuery(query);
    setHomeSearchGroupSize(groupSize);
    setCurrentPage('rooms');
    window.scrollTo(0, 0);
  };
  const handleToggleTourRoom = (roomId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setTourPlannerRoomIds((prev) => {
      if (prev.includes(roomId)) {
        return prev.filter((id) => id !== roomId);
      } else {
        return [...prev, roomId];
      }
    });
  };
  // Fetch favorites on login
  useEffect(() => {
    if (user && user.type === 'student') {
      const fetchFavorites = async () => {
        try {
          const response = await favoritesAPI.getAll();
          if (response.success && response.data) {
            setFavouriteRoomIds(response.data.map((fav: any) => fav.propertyId._id || fav.propertyId));
          }
        } catch (error) {
          console.error('Error fetching favorites:', error);
        }
      };
      fetchFavorites();
    } else {
      setFavouriteRoomIds([]);
    }
  }, [user]);

  const handleToggleFavourite = async (roomId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (!user) {
      setLoginModalTab('student');
      setIsLoginModalOpen(true);
      return;
    }

    if (user.type !== 'student') {
      alert('Only students can add favorites');
      return;
    }

    // Optimistic update
    const wasFavorited = favouriteRoomIds.includes(roomId);
    setFavouriteRoomIds((prev) => {
      if (prev.includes(roomId)) {
        return prev.filter((id) => id !== roomId);
      } else {
        return [...prev, roomId];
      }
    });

    try {
      if (wasFavorited) {
        await favoritesAPI.remove(roomId);
      } else {
        await favoritesAPI.add(roomId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setFavouriteRoomIds((prev) => {
        if (wasFavorited) {
          return [...prev, roomId];
        } else {
          return prev.filter((id) => id !== roomId);
        }
      });
      alert('Failed to update favorites');
    }
  };
  const handleNavigate = (page: Page) => {
    if (page === 'login') {
      setLoginModalTab('student');
      setIsLoginModalOpen(true);
    } else if (page === 'landlord-login') {
      setLoginModalTab('landlord');
      setIsLoginModalOpen(true);
    } else {
      if (
        page === 'landlord-settings' ||
        page === 'student-settings' ||
        page === 'notifications') {
        setPreviousPage(currentPage);
      }
      // Clear search params when navigating away from rooms to a non-rooms page
      if (page !== 'rooms') {
        setHomeSearchQuery('');
        setHomeSearchGroupSize('');
      }
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };
  const handleBackFromSettings = () => {
    if (previousPage) {
      setCurrentPage(previousPage);
    } else {
      if (user?.type === 'landlord') {
        setCurrentPage('landlord-dashboard');
      } else if (user?.type === 'student') {
        setCurrentPage('student-dashboard');
      } else {
        setCurrentPage('home');
      }
    }
    window.scrollTo(0, 0);
  };
  const handleViewRoom = (roomId: string) => {
    setPageBeforeRoomDetail(currentPage);
    setSelectedRoomId(roomId);
    setCurrentPage('room-detail');
    window.scrollTo(0, 0);
  };
  // Booking State
  const [bookingDates, setBookingDates] = useState<{ checkIn: string; checkOut: string } | null>(null);

  const handleBookRoom = (roomId: string, dates?: { checkIn: string; checkOut: string }) => {
    setSelectedRoomId(roomId);
    if (dates) {
      setBookingDates(dates);
    } else {
      setBookingDates(null);
    }
    setCurrentPage('booking');
    window.scrollTo(0, 0);
  };
  const handleBookingComplete = () => {
    setCurrentPage('home');
    setSelectedRoomId(undefined);
    setBookingDates(null);
  };
  const handleLogin = (userData: {
    id: string;
    name: string;
    email: string;
    type: 'student' | 'landlord';
    isVerified: boolean;
    verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  }) => {
    const newUser: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      type: userData.type,
      isVerified: userData.isVerified,
      verificationStatus: userData.verificationStatus
    };
    setUser(newUser);
    setIsLoginModalOpen(false);

    // Routing Logic based on Verification Status
    if (userData.verificationStatus === 'unverified') {
      if (userData.type === 'student') setCurrentPage('student-verification');
      else if (userData.type === 'landlord') setCurrentPage('landlord-verification');
    } else if (userData.type === 'landlord') {
      setCurrentPage('landlord-dashboard');
    } else if (userData.type === 'student') {
      setCurrentPage('student-dashboard');
    } else if (currentPage !== 'tour-planner') {
      setCurrentPage('tour-planner');
    }
    window.scrollTo(0, 0);
  };

  const handleContactLandlord = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      setLoginModalTab('student');
      return;
    }
    // Only students can contact
    if (user.type !== 'student') {
      alert('Only students can contact landlords');
      return;
    }

    // Check verification status
    if (user.verificationStatus === 'unverified') {
      alert('Please complete your verification to contact landlords.');
      setCurrentPage('student-verification');
      return;
    }
    if (user.verificationStatus === 'pending') {
      alert('Your verification is pending. You cannot contact landlords yet.');
      return;
    }

    const room = rooms.find(r => r.id === selectedRoomId);
    if (room) {
      setContactModalData({
        landlordId: room.landlordId,
        propertyId: room.id,
        propertyName: room.name
      });
      setIsContactModalOpen(true);
    }
  };

  const handleSendContactMessage = async (message: string) => {
    if (!contactModalData || !user) return;

    // Check if conversation exists or create new one
    await messagesAPI.send({
      recipientId: contactModalData.landlordId,
      content: message
    });
  };

  const handleAdminLogin = (adminUser: User) => {
    // adminUser has already been verified as admin from the database by AdminLoginPage
    setUser(adminUser);
    setIsAdminModalOpen(false);
    setCurrentPage('admin-dashboard');
    window.scrollTo(0, 0);
  };
  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };
  const handleVerificationSubmit = () => {
    if (user) {
      setUser({
        ...user,
        isVerified: true,
        verificationStatus: 'verified'
      });
      setCurrentPage('landlord-dashboard');
      window.scrollTo(0, 0);
    }
  };
  const handleStudentVerificationSubmit = () => {
    if (user) {
      setUser({
        ...user,
        isVerified: true,
        verificationStatus: 'verified'
      });
      setCurrentPage('student-dashboard');
      window.scrollTo(0, 0);
    }
  };
  const handleCommand = (command: string) => {
    if (command === 'admin') {
      setCurrentPage('admin-login');
    }
  };
  const handleFooterSecretClick = () => {
    const now = Date.now();
    if (now - lastClickTime > 500) {
      setAdminClickCount(1);
    } else {
      const newCount = adminClickCount + 1;
      setAdminClickCount(newCount);
      if (newCount >= 5) {
        setIsAdminModalOpen(true);
        setAdminClickCount(0);
      }
    }
    setLastClickTime(now);
  };
  // Subscription Handlers
  const handleOpenSubscription = (type?: 'student' | 'landlord') => {
    if (type) {
      setSubscriptionType(type);
    } else if (user?.type === 'student' || user?.type === 'landlord') {
      setSubscriptionType(user.type);
    } else {
      // Default to student if not logged in or specified
      setSubscriptionType('student');
    }
    setIsSubscriptionModalOpen(true);
  };
  const handleSelectPlan = (planName: string, price: string) => {
    setSelectedPlanDetails({
      name: planName,
      price
    });
    setIsSubscriptionModalOpen(false);
    setIsPaymentModalOpen(true);
  };
  const handlePaymentComplete = () => {
    // Logic to upgrade user would go here
    alert('Subscription upgraded successfully!');
  };
  const handleAddReview = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
  };
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  if (currentPage === 'admin-login') {
    return (
      <AdminLoginPage
        onLogin={handleAdminLogin}
        onBack={() => setCurrentPage('home')} />);


  }
  if (currentPage === 'admin-dashboard' && user?.type === 'admin') {
    return <AdminDashboardPage user={user} onLogout={handleLogout} />;
  }
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-900">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout} />


      <main>
        {currentPage === 'home' &&
          <HomePage
            featuredRooms={rooms.slice(0, 3)}
            onNavigate={handleNavigate}
            onViewRoom={handleViewRoom}
            onOpenSubscription={() => handleOpenSubscription()}
            onSearch={handleHomeSearch}
            tourPlannerRoomIds={tourPlannerRoomIds}
            onToggleTourRoom={handleToggleTourRoom}
            favouriteRoomIds={favouriteRoomIds}
            onToggleFavourite={handleToggleFavourite}
            user={user} />

        }

        {currentPage === 'rooms' &&
          <RoomsPage
            rooms={rooms}
            onViewRoom={handleViewRoom}
            initialSearchQuery={homeSearchQuery}
            initialGroupSize={homeSearchGroupSize}
            tourPlannerRoomIds={tourPlannerRoomIds}
            onToggleTourRoom={handleToggleTourRoom}
            user={user}
            favouriteRoomIds={favouriteRoomIds}
            onToggleFavourite={handleToggleFavourite} />

        }

        {currentPage === 'room-detail' && selectedRoom &&
          <RoomDetailPage
            room={selectedRoom}
            onBook={(roomId, dates) => handleBookRoom(roomId, dates)}
            onBack={() => {
              setCurrentPage(pageBeforeRoomDetail);
              window.scrollTo(0, 0);
            }}
            isInTour={tourPlannerRoomIds.includes(selectedRoom.id)}
            onToggleTour={(e) => handleToggleTourRoom(selectedRoom.id, e)}
            isFavourite={favouriteRoomIds.includes(selectedRoom.id)}
            onToggleFavourite={(e) => handleToggleFavourite(selectedRoom.id, e)}
            onContact={handleContactLandlord} />

        }

        {currentPage === 'booking' && selectedRoom &&
          <BookingPage
            room={selectedRoom}
            initialDates={bookingDates || undefined}
            onConfirm={handleBookingComplete}
            onBack={() => handleViewRoom(selectedRoom.id)}
            user={user} />

        }

        {currentPage === 'tour-planner' &&
          <TourPlannerPage
            rooms={rooms.filter((r) => tourPlannerRoomIds.includes(r.id))}
            onViewRoom={handleViewRoom}
            user={user} />

        }

        {currentPage === 'landlord-dashboard' && user &&
          <LandlordDashboardPage
            user={user}
            isVerified={!!user.isVerified}
            onNavigate={(page) => handleNavigate(page as Page)}
            onVerifyClick={() => handleNavigate('landlord-verification')}
            onOpenSubscription={() => handleOpenSubscription('landlord')}
            reviews={reviews} />

        }

        {currentPage === 'landlord-verification' &&
          <LandlordVerificationPage
            onBack={() => {
              handleLogout();
            }}
            onSubmit={handleVerificationSubmit} />

        }

        {currentPage === 'landlord-settings' && user &&
          <LandlordSettingsPage
            user={user}
            onBack={handleBackFromSettings}
            onNavigate={(page) => handleNavigate(page as Page)}
            onLogout={handleLogout}
            onOpenSubscription={() => handleOpenSubscription('landlord')}
            onUserUpdate={(updatedData) => setUser(prev => prev ? { ...prev, ...updatedData } : null)} />

        }

        {currentPage === 'student-dashboard' && user &&
          <StudentDashboardPage
            user={user}
            onNavigate={(page) => handleNavigate(page as Page)}
            onOpenSubscription={() => handleOpenSubscription('student')}
            onSubmitReview={handleAddReview} />

        }

        {currentPage === 'student-settings' && user &&
          <StudentSettingsPage
            user={user}
            onBack={handleBackFromSettings}
            onNavigate={(page) => handleNavigate(page as Page)}
            onLogout={handleLogout}
            onOpenSubscription={() => handleOpenSubscription('student')}
            onUserUpdate={(updatedData) => setUser(prev => prev ? { ...prev, ...updatedData } : null)} />

        }

        {currentPage === 'student-verification' &&
          <StudentVerificationPage
            onBack={() => {
              setCurrentPage('student-dashboard');
              window.scrollTo(0, 0);
            }}
            onSubmit={handleStudentVerificationSubmit} />

        }

        {currentPage === 'notifications' &&
          <NotificationCenter

            onBack={handleBackFromSettings} />

        }
      </main>

      {/* Footer */}
      {(currentPage === 'home' ||
        currentPage === 'rooms' ||
        currentPage === 'tour-planner' ||
        currentPage === 'room-detail' ||
        currentPage === 'booking') &&
        <Footer
          onNavigate={handleNavigate}
          onFooterSecretClick={handleFooterSecretClick}
          user={user} />

      }

      {/* Chatbot */}
      <Chatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        rooms={rooms}
        onNavigateToRoom={handleViewRoom} />


      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 z-50 ${isChatOpen ? 'bg-[#795548] hover:bg-[#5D4037] rotate-0' : 'bg-[#3E2723] hover:bg-[#2D1B18]'}`}>

        {isChatOpen ?
          <X className="h-6 w-6 text-white" /> :

          <MessageCircle className="h-6 w-6 text-white" />
        }
      </button>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        defaultTab={loginModalTab} />


      {/* Admin Login Modal (Secret) */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLogin={handleAdminLogin} />


      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        type={subscriptionType}
        onSelectPlan={handleSelectPlan} />


      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onBack={() => {
          setIsPaymentModalOpen(false);
          setIsSubscriptionModalOpen(true);
        }}
        amount={selectedPlanDetails.price}
        planName={selectedPlanDetails.name}
        onPaymentComplete={handlePaymentComplete} />


      {/* Command Palette */}
      <ContactLandlordModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        propertyId={contactModalData?.propertyId || ''}
        propertyName={contactModalData?.propertyName || ''}
        landlordId={contactModalData?.landlordId || ''}
        onSend={handleSendContactMessage}
      />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCommand={handleCommand} />

    </div>);

}