import React, { useState, useEffect } from 'react';
import { X, Search, Building, Star, Eye, Edit, Trash2, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { adminAPI, propertiesAPI } from '../../services/api';

interface AllPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: () => void;
  onEditProperty: (property: any) => void;
  onViewProperty: (property: any) => void;
}

interface PropertyData {
  id: string;
  name: string;
  location: string;
  type: string;
  rating: number;
  bookings: number;
  status: string;
  image: string;
  raw: any;
}

export function AllPropertiesModal({
  isOpen,
  onClose,
  onAddProperty,
  onEditProperty,
  onViewProperty
}: AllPropertiesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Pass searchTerm to the API
      const response = await adminAPI.getProperties(undefined, currentPage, searchTerm);
      if (response.success && response.data) {
        const mappedProperties = response.data.map((p: any) => ({
          id: p._id,
          name: p.title || p.name || 'Untitled Property',
          location: typeof p.address === 'string' ? p.address : (p.location?.city || 'Unknown Location'),
          type: p.type,
          rating: p.rating || 0,
          bookings: 0,
          status: p.isVerified ? 'Verified' : (p.status === 'active' ? 'Active' : 'Pending'),
          image: p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/300',
          raw: p
        }));
        setProperties(mappedProperties);
        if (response.pagination) {
          setTotalPages(Math.ceil(response.pagination.total / response.pagination.limit));
        }
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchProperties();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentPage, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page
  };

  const handleDelete = async (id: string) => {
    try {
      await propertiesAPI.delete(id);
      setDeleteConfirm(null);
      fetchProperties();
    } catch (error) {
      console.error('Failed to delete property:', error);
      alert('Failed to delete property');
    }
  };

  const handleVerify = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await adminAPI.verifyProperty(id);
      fetchProperties();
    } catch (error) {
      console.error('Failed to verify property:', error);
      alert('Failed to verify property');
    }
  };

  // Backend filtering is now enabled
  const filteredProperties = properties;

  if (!isOpen) return null;

  return <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="w-full max-w-6xl bg-[#161616] border border-[#333] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
      {/* Header */}
      <div className="p-6 border-b border-[#333] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#222] rounded-lg border border-[#333]">
            <Building className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">All Properties</h2>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Search properties..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" />
          </div>
          <button onClick={onAddProperty} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-red-900/20 whitespace-nowrap">
            Add Property
          </button>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#0f0f0f]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">Loading properties...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProperties.map((property) => <div key={property.id} className="bg-[#161616] border border-[#333] rounded-xl overflow-hidden hover:border-[#444] transition-all group">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <MapPin className="w-3 h-3" />
                      {property.location}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${property.status === 'Verified' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                    {property.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 my-4 text-sm">
                  <span className="bg-[#222] text-gray-300 px-2 py-1 rounded border border-[#333] text-xs">
                    {property.type}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-yellow-500" />
                    <span className="font-bold text-white">
                      {property.rating || 'N/A'}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs ml-auto">
                    {property.bookings} bookings
                  </span>
                </div>

                {/* Actions */}
                {deleteConfirm === property.id ? <div className="mt-4 pt-4 border-t border-[#333]">
                  <div className="flex items-center gap-2 mb-3 text-yellow-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Delete this property?</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setDeleteConfirm(null)} className="flex items-center justify-center bg-[#222] hover:bg-[#333] text-white py-2 rounded-lg text-sm font-medium transition-colors border border-[#333]">
                      Cancel
                    </button>
                    <button onClick={() => handleDelete(property.id)} className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                      Confirm Delete
                    </button>
                  </div>
                </div> : <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-[#333]">
                  <button onClick={() => onViewProperty(property.raw)} className="col-span-1 flex items-center justify-center gap-1.5 bg-[#222] hover:bg-[#333] text-white py-2 rounded-lg text-sm font-medium transition-colors border border-[#333]">
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button onClick={() => onEditProperty(property.raw)} className="col-span-1 flex items-center justify-center gap-1.5 bg-[#222] hover:bg-[#333] text-white py-2 rounded-lg text-sm font-medium transition-colors border border-[#333]">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  {property.status === 'Pending' && (
                    <button onClick={(e) => handleVerify(property.id, e)} className="col-span-1 flex items-center justify-center gap-1.5 bg-green-900/20 hover:bg-green-900/40 text-green-500 py-2 rounded-lg transition-colors border border-green-900/30" title="Verify Property">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setDeleteConfirm(property.id)} className="col-span-1 flex items-center justify-center bg-red-900/20 hover:bg-red-900/40 text-red-500 py-2 rounded-lg transition-colors border border-red-900/30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>}
              </div>
            </div>)}
            {filteredProperties.length === 0 && <div className="col-span-2 text-center py-12 text-gray-500">
              No properties found.
            </div>}
          </div>
        )}
      </div>

      {/* Footer / Pagination */}
      <div className="p-4 border-t border-[#333] bg-[#161616] flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-[#222] text-white rounded-lg text-sm font-medium hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed border border-[#333] transition-colors">
            Previous
          </button>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>;
}