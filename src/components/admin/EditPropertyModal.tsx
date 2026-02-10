import React, { useState } from 'react';
import { X, Upload, ChevronDown, ChevronsUpDown, Edit } from 'lucide-react';

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  property?: any;
}

export function EditPropertyModal({
  isOpen,
  onClose,
  onSubmit,
  property
}: EditPropertyModalProps) {
  const [formData, setFormData] = React.useState<any>({});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || property.name || '',
        location: property.location?.city || property.address || property.location || '',
        type: property.type ? property.type.toLowerCase() : 'hostel',
        status: property.status || 'active',
        price: property.rent || property.price || 0,
        description: property.description || ''
      });
    }
  }, [property]);

  const handleChange = (e: any) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // @ts-ignore
      const { adminAPI } = await import('../../services/api');
      // Map form data back to API structure
      const apiData = {
        title: formData.title,
        type: formData.type,
        status: formData.status,
        rent: Number(formData.price),
        description: formData.description,
        location: { city: formData.location }
      };

      await adminAPI.updateProperty(property._id || property.id, apiData);
      onSubmit(formData);
      onClose(); // Close modal after successful update
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="w-full max-w-5xl bg-[#161616] border border-[#333] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto">
      {/* Left Side - Image Preview */}
      <div className="w-full md:w-5/12 bg-[#0f0f0f] border-r border-[#333] relative group">
        <img src={property?.images?.[0] || property?.image || '/uploads/default-property.png'} alt="Property" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-[#161616] border border-[#333] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#222] transition-colors shadow-xl">
            <Upload className="w-5 h-5" />
            Change Image
          </button>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-7/12 p-8 bg-[#161616] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="p-2 bg-[#222] rounded-lg">
              <Edit className="w-5 h-5" />
            </span>
            Edit Property
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Property Name
            </label>
            <input name="title" value={formData.title || ''} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Location
            </label>
            <input name="location" value={formData.location || ''} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Property Type
              </label>
              <div className="relative">
                <select name="type" value={formData.type || 'hostel'} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer">
                  <option value="hostel">Hostel</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="house">House</option>
                  <option value="room">Room</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Status
              </label>
              <div className="relative">
                <select name="status" value={formData.status || 'active'} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Price per Month (Rs)
            </label>
            <div className="relative">
              <input type="number" name="price" value={formData.price || 0} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" />
              <ChevronsUpDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Description
            </label>
            <textarea name="description" rows={4} value={formData.description || ''} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all resize-none" />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-[#222] hover:bg-[#333] text-white rounded-lg font-medium transition-colors border border-[#333]">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-900/20">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>;
}