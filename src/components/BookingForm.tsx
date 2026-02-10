import React, { useState } from 'react';
import { CreditCard, User, Mail } from 'lucide-react';
import { BookingDetails, Room } from '../types';
import { CalendarPopover } from './CalendarPopover';
import { FormErrorBanner } from './FormErrorBanner';
import { validateEmail } from '../utils/validation';
interface BookingFormProps {
  room: Room;
  initialDates?: { checkIn: string; checkOut: string };
  onSubmit: (details: BookingDetails) => void;
  onCancel: () => void;
  userEmail?: string;
}
export function BookingForm({
  room,
  initialDates,
  onSubmit,
  onCancel,
  userEmail
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: userEmail || '',
    checkIn: initialDates?.checkIn || '',
    checkOut: initialDates?.checkOut || '',
    guests: '2',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});
  const [shake, setShake] = useState(false);
  const triggerShake = () => {
    setShake(false);
    setTimeout(() => setShake(true), 50);
  };
  const validate = () => {
    const errors: string[] = [];
    const invalid: Record<string, boolean> = {};
    if (!formData.firstName.trim()) {
      errors.push('First name is required');
      invalid.firstName = true;
    }
    if (!formData.lastName.trim()) {
      errors.push('Last name is required');
      invalid.lastName = true;
    }
    if (!formData.email) {
      errors.push('Email is required');
      invalid.email = true;
    } else if (!validateEmail(formData.email)) {
      errors.push('Please enter a valid email address');
      invalid.email = true;
    }
    if (!formData.checkIn) {
      errors.push('Check-in date is required');
      invalid.checkIn = true;
    }
    if (!formData.checkOut) {
      errors.push('Check-out date is required');
      invalid.checkOut = true;
    }
    if (!formData.cardNumber) {
      errors.push('Card number is required');
      invalid.cardNumber = true;
    }
    setFormErrors(errors);
    setInvalidFields(invalid);
    if (errors.length > 0) {
      triggerShake();
      return false;
    }
    return true;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        roomId: room.id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: parseInt(formData.guests),
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email
      });
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (invalidFields[name]) {
      setInvalidFields((prev) => {
        const newInvalid = {
          ...prev
        };
        delete newInvalid[name];
        return newInvalid;
      });
    }
  };
  const handleDateChange = (field: 'checkIn' | 'checkOut', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    if (invalidFields[field]) {
      setInvalidFields((prev) => {
        const newInvalid = {
          ...prev
        };
        delete newInvalid[field];
        return newInvalid;
      });
    }
  };
  const getInputClass = (fieldName: string) => {
    const baseClass = 'pl-10 block w-full rounded-md border py-2 px-3 focus:outline-none transition-all duration-200';
    if (invalidFields[fieldName]) {
      return `${baseClass} border-amber-400 focus:ring-amber-400 focus:border-amber-400 bg-amber-50/30 ${shake ? 'animate-shake' : ''}`;
    }
    return `${baseClass} border-gray-300 focus:ring-[#795548] focus:border-[#795548]`;
  };
  return <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <div className="bg-[#3E2723] px-6 py-4">
      <h2 className="text-xl font-bold text-white">
        Complete Your Reservation
      </h2>
      <p className="text-[#D7CCC8] text-sm">Secure booking for {room.name}</p>
    </div>

    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <FormErrorBanner errors={formErrors} onDismiss={() => setFormErrors([])} />

      {/* Personal Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Guest Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={getInputClass('firstName')} placeholder="Enter your first name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={getInputClass('lastName')} placeholder="Enter your last name" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${getInputClass('email')} ${userEmail ? 'cursor-not-allowed opacity-60 bg-gray-100' : ''}`}
              placeholder="your.email@example.com"
              readOnly={!!userEmail}
            />
          </div>
        </div>
      </div>

      {/* Stay Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Stay Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CalendarPopover label="Check In *" value={formData.checkIn} onChange={(val) => handleDateChange('checkIn', val)} minDate={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <CalendarPopover label="Check Out *" value={formData.checkOut} onChange={(val) => handleDateChange('checkOut', val)} minDate={formData.checkIn || new Date().toISOString().split('T')[0]} />
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Payment Method
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} className={getInputClass('cardNumber')} placeholder="1234 5678 9012 3456" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry
            </label>
            <input type="text" name="expiry" value={formData.expiry} onChange={handleChange} className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-[#795548] focus:border-[#795548]" placeholder="MM/YY" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVC
            </label>
            <input type="text" name="cvc" value={formData.cvc} onChange={handleChange} className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-[#795548] focus:border-[#795548]" placeholder="123" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-md hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button type="submit" className="flex-1 bg-[#3E2723] text-white font-bold py-3 px-4 rounded-md hover:bg-[#2D1B18] transition-colors shadow-md">
          Confirm Booking
        </button>
      </div>
    </form>
  </div>;
}