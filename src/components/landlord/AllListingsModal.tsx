import React, { useState } from 'react';
import { X, Search, MapPin, Filter, Users } from 'lucide-react';
interface AllListingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: any[];
  onSelectProperty: (property: any) => void;
}
export function AllListingsModal({
  isOpen,
  onClose,
  properties,
  onSelectProperty
}: AllListingsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  if (!isOpen) return null;
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
    filterStatus === 'all' ||
    property.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[90vh] bg-[#F5F0E8] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#D7CCC8] bg-[#F5F0E8] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-[#3E2723]">
              All Properties
            </h2>
            <p className="text-[#795548] text-sm">
              Manage your complete property portfolio
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D7CCC8] rounded-xl text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548]" />

            </div>
            <button
              onClick={onClose}
              className="p-2.5 bg-white border border-[#D7CCC8] rounded-xl text-[#5D4037] hover:bg-[#E8E0D5] transition-colors">

              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredProperties.length === 0 ?
          <div className="flex flex-col items-center justify-center h-full text-[#795548] opacity-60">
              <Search className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">No properties found</p>
              <p className="text-sm">Try adjusting your search terms</p>
            </div> :

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) =>
            <div
              key={property.id}
              onClick={() => onSelectProperty(property)}
              className="bg-white rounded-2xl overflow-hidden border border-[#D7CCC8] hover:shadow-lg hover:border-[#3E2723]/30 transition-all cursor-pointer group flex flex-col">

                  <div className="relative h-48 overflow-hidden">
                    <img
                  src={property.image}
                  alt={property.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                    <div className="absolute top-3 left-3">
                      <span
                    className={`px-2 py-1 text-xs font-bold rounded-md uppercase shadow-sm ${property.status === 'Excellent' || property.status === 'Verified' ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white'}`}>

                        {property.status}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-2 text-xs text-[#795548] mb-2">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>
                    <h3 className="font-bold text-[#3E2723] text-lg mb-2 line-clamp-1 group-hover:text-[#5D4037] transition-colors">
                      {property.name}
                    </h3>

                    <div className="mt-auto pt-4 border-t border-[#F5F5F5] flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-[#3E2723] text-lg">
                            {property.price}
                          </span>
                          <span className="text-xs text-[#795548]">
                            {property.period}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#5D4037] bg-[#F5F0E8] px-2 py-1 rounded-lg">
                        <Users className="w-3.5 h-3.5" />
                        {property.tenants?.length || 0} Tenants
                      </div>
                    </div>
                  </div>
                </div>
            )}
            </div>
          }
        </div>
      </div>
    </div>);

}