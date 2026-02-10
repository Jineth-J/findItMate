import React from 'react';
import {
  X,
  MapPin,
  Star,
  Users,
  Wifi,
  Wind,
  Coffee,
  Utensils,
  MessageCircle,
  Edit,
  Power,
  Shield,
  CheckCircle,
  DollarSign } from
'lucide-react';
// Define types based on the usage in LandlordDashboardPage
interface Tenant {
  id: string;
  name: string;
  avatar: string;
  status: 'occupying' | 'requested' | 'pending-tour';
  since?: string;
  date?: string;
  email: string;
  rentStatus?: 'paid' | 'overdue' | 'pending';
  rentAmount?: string;
  dueDate?: string;
  leaseEnd?: string;
}
interface Property {
  id: number;
  name: string;
  location: string;
  price: string;
  period: string;
  image: string;
  rating: number;
  reviews: number;
  type: string;
  tags: string[];
  status: string;
  meals: string;
  estimatedBudget: number;
  tenants: Tenant[];
  description?: string;
}
interface PropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onEdit: (property: Property) => void;
  onDeactivate: (property: Property) => void;
  onChatWithTenant: (tenant: Tenant) => void;
}
export function PropertyDetailModal({
  isOpen,
  onClose,
  property,
  onEdit,
  onDeactivate,
  onChatWithTenant
}: PropertyDetailModalProps) {
  if (!isOpen || !property) return null;
  // Helper to get icon for amenity tag
  const getAmenityIcon = (tag: string) => {
    const lower = tag.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-4 h-4" />;
    if (lower.includes('ac') || lower.includes('air'))
    return <Wind className="w-4 h-4" />;
    if (lower.includes('coffee') || lower.includes('breakfast'))
    return <Coffee className="w-4 h-4" />;
    if (lower.includes('meal') || lower.includes('food'))
    return <Utensils className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-[#F5F0E8] w-full h-full md:h-[90vh] md:w-[90vw] md:max-w-6xl md:rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true">

        {/* Hero Image Section */}
        <div className="relative h-64 md:h-80 w-full flex-shrink-0">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/80 via-transparent to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-colors z-10"
            aria-label="Close modal">

            <X className="w-6 h-6" />
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full text-white">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-green-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full uppercase tracking-wide shadow-sm">
                    {property.status}
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full uppercase tracking-wide border border-white/30">
                    {property.type}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-md">
                  {property.name}
                </h2>
                <div className="flex items-center gap-2 text-gray-200 text-sm md:text-base">
                  <MapPin className="w-4 h-4" />
                  {property.location}
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white drop-shadow-md">
                    {property.price}
                  </span>
                  <span className="text-gray-300 text-sm">
                    {property.period}
                  </span>
                </div>
                {property.estimatedBudget &&
                <div className="text-xs text-gray-300 mt-1">
                    Est. Budget: LKR {property.estimatedBudget.toLocaleString()}
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-8 min-h-full">
            {/* Left Column: Details & Amenities */}
            <div className="lg:col-span-2 p-6 md:p-8 space-y-8">
              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 p-4 bg-white rounded-xl border border-[#E8E0D5] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="font-bold text-[#3E2723] text-lg">
                      {property.rating}
                    </div>
                    <div className="text-xs text-[#795548]">
                      {property.reviews} Reviews
                    </div>
                  </div>
                </div>
                <div className="w-px h-10 bg-[#E8E0D5]"></div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[#3E2723] text-lg">
                      {property.tenants.length}
                    </div>
                    <div className="text-xs text-[#795548]">
                      Current Tenants
                    </div>
                  </div>
                </div>
                <div className="w-px h-10 bg-[#E8E0D5]"></div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[#3E2723] text-lg">
                      Monthly
                    </div>
                    <div className="text-xs text-[#795548]">Payment Cycle</div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-bold text-[#3E2723] mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#795548]" />
                  Amenities & Features
                </h3>
                <div className="flex flex-wrap gap-3">
                  {property.tags.map((tag, idx) =>
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E0D5] rounded-full text-[#5D4037] text-sm font-medium shadow-sm hover:border-[#3E2723]/30 transition-colors cursor-default">

                      {getAmenityIcon(tag)}
                      {tag}
                    </div>
                  )}
                  {property.meals &&
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#3E2723]/5 border border-[#3E2723]/10 rounded-full text-[#3E2723] text-sm font-medium">
                      <Utensils className="w-4 h-4" />
                      {property.meals}
                    </div>
                  }
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-[#3E2723] mb-3">
                  About this property
                </h3>
                <p className="text-[#5D4037] leading-relaxed">
                  {property.description ||
                  `Located in the heart of ${property.location.split(',')[0]}, this ${property.type.toLowerCase()} offers exceptional comfort for students. With ${property.tags.join(', ').toLowerCase()}, it provides a conducive environment for both study and relaxation. The property is verified and managed professionally to ensure a hassle-free stay.`}
                </p>
              </div>

              {/* Management Actions - Mobile Only */}
              <div className="lg:hidden space-y-3 pt-4 border-t border-[#E8E0D5]">
                <h3 className="text-lg font-bold text-[#3E2723] mb-3">
                  Management Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onEdit(property)}
                    className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-[#3E2723] text-white rounded-xl font-medium hover:bg-[#2D1B18] transition-colors">

                    <Edit className="w-4 h-4" /> Edit Property
                  </button>
                  <button
                    onClick={() => onDeactivate(property)}
                    className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors">

                    <Power className="w-4 h-4" /> Deactivate Listing
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Tenants & Actions */}
            <div className="bg-white border-l border-[#E8E0D5] p-6 md:p-8 flex flex-col h-full">
              {/* Tenants Section */}
              <div className="mb-8 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#3E2723]">
                    Tenant List
                  </h3>
                  <span className="px-2 py-1 bg-[#F5F0E8] text-[#5D4037] text-xs font-bold rounded-lg">
                    {property.tenants.length} Active
                  </span>
                </div>

                {property.tenants.length === 0 ?
                <div className="text-center py-12 bg-[#F5F0E8] rounded-xl border border-dashed border-[#D7CCC8]">
                    <Users className="w-8 h-8 text-[#A1887F] mx-auto mb-2" />
                    <p className="text-[#5D4037] font-medium">No tenants yet</p>
                    <p className="text-xs text-[#795548]">
                      Wait for new requests
                    </p>
                  </div> :

                <div className="space-y-4">
                    {property.tenants.map((tenant) =>
                  <div
                    key={tenant.id}
                    className="p-4 bg-white border border-[#E8E0D5] rounded-xl hover:border-[#3E2723]/30 hover:shadow-sm transition-all group">

                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#3E2723] text-white flex items-center justify-center font-bold text-sm">
                              {tenant.avatar}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#3E2723] text-sm">
                                {tenant.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span
                              className={`w-2 h-2 rounded-full ${tenant.status === 'occupying' ? 'bg-green-500' : tenant.status === 'requested' ? 'bg-yellow-500' : 'bg-blue-500'}`}>
                            </span>
                                <span className="text-xs text-[#795548] capitalize">
                                  {tenant.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                        onClick={() => onChatWithTenant(tenant)}
                        className="p-2 text-[#795548] hover:text-[#3E2723] hover:bg-[#F5F0E8] rounded-full transition-colors"
                        title="Chat with tenant">

                            <MessageCircle className="w-5 h-5" />
                          </button>
                        </div>

                        {tenant.rentStatus &&
                    <div className="pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-xs">
                            <div className="text-[#795548]">
                              Rent:{' '}
                              <span className="font-medium text-[#3E2723]">
                                {tenant.rentAmount}
                              </span>
                            </div>
                            <span
                        className={`px-2 py-0.5 rounded-md font-medium ${tenant.rentStatus === 'paid' ? 'bg-green-100 text-green-700' : tenant.rentStatus === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>

                              {tenant.rentStatus.toUpperCase()}
                            </span>
                          </div>
                    }
                      </div>
                  )}
                  </div>
                }
              </div>

              {/* Desktop Actions */}
              <div className="hidden lg:block space-y-3 pt-6 border-t border-[#E8E0D5]">
                <h3 className="text-sm font-bold text-[#795548] uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <button
                  onClick={() => onEdit(property)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#3E2723] text-white rounded-xl font-medium hover:bg-[#2D1B18] transition-colors shadow-sm">

                  <Edit className="w-4 h-4" /> Edit Property Details
                </button>
                <button
                  onClick={() => onDeactivate(property)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors">

                  <Power className="w-4 h-4" /> Deactivate Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}