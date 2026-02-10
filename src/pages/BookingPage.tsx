import React, { useState } from 'react';
import { BookingForm } from '../components/BookingForm';
import { Room, BookingDetails, User } from '../types';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { bookingsAPI } from '../services/api';
interface BookingPageProps {
  room: Room;
  initialDates?: { checkIn: string; checkOut: string };
  onConfirm: (details: BookingDetails) => void;
  onBack: () => void;
  user?: User | null;
}
export function BookingPage({
  room,
  initialDates,
  onConfirm,
  onBack,
  user
}: BookingPageProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (details: BookingDetails) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingsAPI.create({
        propertyId: details.roomId,
        checkIn: details.checkIn,
        checkOut: details.checkOut,
        guests: details.guests,
        guestName: details.name,
        guestEmail: details.email
      });

      if (response.success) {
        setIsConfirmed(true);
        setTimeout(() => {
          onConfirm(details);
        }, 2000);
      } else {
        setError(response.message || 'Failed to create booking');
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'An error occurred while creating booking');
    } finally {
      setIsLoading(false);
    }
  };
  if (isConfirmed) {
    return <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#3E2723] mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-gray-600 mb-6">
          Thank you for choosing Luxe Haven. We've sent a confirmation email
          with all the details.
        </p>
        <div className="animate-pulse text-[#795548] text-sm font-medium">
          Redirecting to home...
        </div>
      </div>
    </div>;
  }
  return <div className="min-h-screen bg-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-[#795548] font-medium mb-8 hover:text-[#3E2723] transition-colors">
        <ArrowLeft className="h-5 w-5" /> Back to Room Details
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h3 className="text-lg font-bold text-[#3E2723] mb-4 border-b pb-2">
              Order Summary
            </h3>

            <div className="flex gap-4 mb-4">
              <img src={room.image} alt={room.name} className="w-20 h-20 object-cover rounded-md" />
              <div>
                <h4 className="font-bold text-gray-800">{room.name}</h4>
                <p className="text-sm text-gray-500">{room.type}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Price per night</span>
                <span className="font-medium">LKR {room.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees (10%)</span>
                <span className="font-medium">LKR {Math.round(room.price * 0.1).toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-bold text-[#3E2723]">
                <span>Total / Night</span>
                <span>LKR {Math.round(room.price * 1.1).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#EFEBE9] p-4 rounded-md text-xs text-[#5D4037]">
              <p>
                <strong>Cancellation Policy:</strong> Free cancellation until
                24 hours before check-in. Late cancellations are subject to a
                one-night fee.
              </p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md shadow-sm">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
          <BookingForm
            room={room}
            initialDates={initialDates}
            onSubmit={handleConfirm}
            onCancel={onBack}
            userEmail={user?.email}
          />
        </div>
      </div>
    </div>
  </div >;
}