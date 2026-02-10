import React from 'react';
import { X, Check } from 'lucide-react';
interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'student' | 'landlord';
  onSelectPlan: (planName: string, price: string) => void;
}
export function SubscriptionModal({
  isOpen,
  onClose,
  type,
  onSelectPlan
}: SubscriptionModalProps) {
  if (!isOpen) return null;
  const isStudent = type === 'student';
  const content = {
    header: isStudent ?
    'Student Premium Upgrade' :
    'Landlord Subscription Plans',
    subheader: isStudent ?
    'Unlock Your Best Campus Life' :
    'Grow Your Property Business',
    starter: {
      title: 'Starter (Free)',
      features: isStudent ?
      [
      'Basic property Search',
      'AI Chatbot with Session Memory',
      'Tour Organizer (Manual Planning)'] :

      ['2 Properties', 'Basic Analytics', 'Standard Support']
    },
    premium: {
      title: 'Premium',
      price: 'LKR 2,500 / monthly',
      features: isStudent ?
      [
      'Unlimited Inquiries',
      '24 Hour Early Access to New Listings',
      'Priority AI Roommate Matching',
      'Advanced Search Filter'] :

      [
      'Unlimited Listings',
      'Priority Search placement',
      'Advanced Analytics & Heatmaps',
      'Bulk Messages']

    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl bg-[#F5F0E8] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-[#3E2723]/10 hover:bg-[#3E2723]/20 text-[#3E2723] transition-colors">

          <X className="h-5 w-5" />
        </button>

        <div className="p-8 md:p-12 text-center">
          <h3 className="text-[#795548] font-bold uppercase tracking-wider text-sm mb-2">
            {content.header}
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3E2723] mb-12">
            {content.subheader}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-[#FAF9F6] rounded-3xl p-8 border border-[#D7CCC8] flex flex-col relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#5D4037] text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg whitespace-nowrap">
                {content.starter.title}
              </div>

              <div className="mt-8 flex-1">
                <ul className="space-y-4 text-left mt-8">
                  {content.starter.features.map((feature, idx) =>
                  <li key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 min-w-[20px]">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-[#3E2723]">{feature}</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-8">
                <button
                  disabled
                  className="w-full py-4 bg-[#3E2723] text-white/80 font-medium rounded-xl cursor-default opacity-90">

                  Current Plan
                </button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-[#3E2723] rounded-3xl p-8 border border-[#3E2723] flex flex-col relative text-white shadow-xl transform md:scale-105">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#5D4037] text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg border border-[#795548] whitespace-nowrap">
                {content.premium.title}
              </div>

              <div className="mt-8 text-center">
                <div className="text-xl font-bold text-[#D7CCC8] mb-8">
                  ({content.premium.price})
                </div>

                <ul className="space-y-4 text-left">
                  {content.premium.features.map((feature, idx) =>
                  <li key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 min-w-[20px]">
                        <Check className="h-5 w-5 text-[#D7CCC8]" />
                      </div>
                      <span className="text-white/90">{feature}</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-8 flex-1 flex items-end">
                <button
                  onClick={() =>
                  onSelectPlan('Premium Plan', content.premium.price)
                  }
                  className="w-full py-4 bg-[#F5F0E8] text-[#3E2723] font-bold rounded-xl hover:bg-white transition-colors shadow-lg">

                  Select Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}