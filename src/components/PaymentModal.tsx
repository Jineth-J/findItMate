import React, { useEffect, useState } from 'react';
import {
  X,
  CreditCard,
  Lock,
  MapPin,
  Calendar,
  User,
  CheckCircle
} from
  'lucide-react';
import { subscriptionsAPI } from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  amount: string;
  planName: string;
  onPaymentComplete: () => void;
}
export function PaymentModal({
  isOpen,
  onClose,
  onBack,
  amount,
  planName,
  onPaymentComplete
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'success' | 'error'>('details');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setIsProcessing(false);
      setErrorMessage('');
    }
  }, [isOpen]);
  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Call the subscriptions API to upgrade to premium
      const response = await subscriptionsAPI.subscribe('premium');

      if (response.success) {
        setIsProcessing(false);
        setStep('success');
        setTimeout(() => {
          onPaymentComplete();
          onClose();
        }, 2000);
      } else {
        throw new Error(response.message || 'Subscription upgrade failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      setStep('error');
    }
  };
  const tax = 200; // Mock tax
  const total = parseInt(amount.replace(/[^0-9]/g, '')) + tax;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl bg-[#F5F0E8] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-[#3E2723]/10 hover:bg-[#3E2723]/20 text-[#3E2723] transition-colors">

          <X className="h-5 w-5" />
        </button>

        {step === 'success' ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#3E2723] mb-2">
              Payment Successful!
            </h2>
            <p className="text-[#5D4037] text-lg">
              You have successfully upgraded to {planName}.
            </p>
            <p className="text-[#795548] text-sm mt-4">Redirecting...</p>
          </div>
        ) : step === 'error' ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <X className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#3E2723] mb-2">
              Payment Failed
            </h2>
            <p className="text-red-600 text-lg mb-4">
              {errorMessage}
            </p>
            <button
              onClick={() => setStep('details')}
              className="px-6 py-3 bg-[#3E2723] text-white rounded-xl hover:bg-[#2D1B18] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (

          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-[#3E2723] mb-8">
              Secure Checkout
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Order Summary & Billing Address */}
              <div className="space-y-8">
                {/* Order Summary */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E0D5]">
                  <h3 className="text-xl font-bold text-[#3E2723] mb-6">
                    Order Summary
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between text-[#5D4037]">
                      <span>{planName}</span>
                      <span className="font-medium">{amount}</span>
                    </div>
                    <div className="flex justify-between text-[#5D4037]">
                      <span>Tax</span>
                      <span className="font-medium">LKR {tax}</span>
                    </div>
                    <div className="border-t border-[#E8E0D5] pt-4 flex justify-between text-lg font-bold text-[#3E2723]">
                      <span>Total</span>
                      <span>LKR {total}</span>
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E0D5]">
                  <h3 className="text-xl font-bold text-[#3E2723] mb-6">
                    Billing Address
                  </h3>

                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-medium text-[#5D4037] mb-1">
                          Street Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
                          <input
                            type="text"
                            placeholder="123 Main St"
                            className="w-full pl-10 pr-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#5D4037] mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="Colombo"
                          className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#5D4037] mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          placeholder="00700"
                          className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-medium text-[#5D4037] mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          placeholder="Sri Lanka"
                          className="w-full px-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]" />

                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Payment Details */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E0D5] h-fit">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="h-6 w-6 text-[#3E2723]" />
                  <h3 className="text-xl font-bold text-[#3E2723]">
                    Payment Details
                  </h3>
                </div>

                <form onSubmit={handlePay} className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium text-[#5D4037] mb-1">
                      Credit Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        className="w-full pl-10 pr-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]"
                        required />

                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#5D4037] mb-1">
                        Expiry Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full pl-10 pr-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]"
                          required />

                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#5D4037] mb-1">
                        CVV
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full pl-10 pr-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]"
                          required />

                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5D4037] mb-1">
                      Cardholder Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-[#F5F0E8] border-none rounded-xl text-[#3E2723] text-sm focus:ring-2 focus:ring-[#3E2723]"
                        required />

                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 bg-[#3E2723] text-white font-bold rounded-xl hover:bg-[#2D1B18] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">

                      {isProcessing ?
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </> :

                        'Pay Now'
                      }
                    </button>
                    {onBack &&
                      <button
                        type="button"
                        onClick={onBack}
                        className="w-full mt-3 py-3 text-[#5D4037] text-sm font-medium hover:text-[#3E2723] transition-colors">

                        Back to Plans
                      </button>
                    }
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>);

}