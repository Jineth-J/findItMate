export interface Room {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  images?: string[]; // Multiple images for carousel
  amenities: string[];
  rating: number;
  capacity: number;
  type: 'suite' | 'standard' | 'deluxe';
  estimatedBudget?: number;
  landlordId: string;
  location?: {
    lat: number;
    lng: number;
    city: string;
    district: string;
  };
}

export interface BookingDetails {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  name?: string;
  email?: string;
}

export interface Review {
  id: string;
  roomId: string;
  propertyName: string;
  studentName: string;
  studentEmail: string;
  rating: number;
  comment: string;
  date: string;
}

export type Page =
  'home' |
  'rooms' |
  'room-detail' |
  'booking' |
  'confirmation' |
  'login' |
  'tour-planner' |
  'landlord-login' |
  'landlord-dashboard' |
  'landlord-verification' |
  'landlord-settings' |
  'student-dashboard' |
  'student-settings' |
  'student-verification' |
  'admin-login' |
  'admin-dashboard' |
  'notifications' |
  'verify-email';

export type UserType = 'student' | 'landlord' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  isVerified?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
}

export interface NavigationState {
  currentPage: Page;
  selectedRoomId?: string;
  bookingDetails?: BookingDetails;
}