import React, { useState, useRef } from 'react';
import { X, Upload, ChevronDown, ChevronsUpDown } from 'lucide-react';
interface AdminAddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}
export function AdminAddPropertyModal({
  isOpen,
  onClose,
  onSubmit
}: AdminAddPropertyModalProps) {
  const [images, setImages] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('single');
  const [rent, setRent] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [deposit, setDeposit] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setImages(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !address || !rent) {
      alert('Please fill in title, address, and rent');
      return;
    }
    onSubmit({
      title,
      address,
      type,
      rent,
      deposit,
      description,
      capacity,
      images,
    });
    // Reset form
    setTitle('');
    setAddress('');
    setType('single');
    setRent('');
    setDescription('');
    setCapacity('1');
    setDeposit('');
    setImages([]);
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="w-full max-w-5xl bg-[#161616] border border-[#333] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto">
      {/* Left Side - Image Upload */}
      <div className="w-full md:w-5/12 bg-[#0f0f0f] border-r border-[#333] p-8 flex flex-col">
        <div className="flex-1 border-2 border-dashed border-[#333] rounded-xl flex flex-col items-center justify-center text-center p-8 hover:border-[#444] hover:bg-[#1a1a1a] transition-colors cursor-pointer group" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
          <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => e.target.files && setImages(Array.from(e.target.files))} />
          <div className="w-16 h-16 rounded-full bg-[#222] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Click to upload images or drag and drop
          </h3>
          <p className="text-sm text-gray-500">PNG, JPG up to 5MB each</p>

          {images.length > 0 && <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {images.map((img, i) => <span key={i} className="text-xs bg-[#222] text-gray-300 px-2 py-1 rounded-md truncate max-w-[150px]">
              {img.name}
            </span>)}
          </div>}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-7/12 p-8 bg-[#161616] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="p-2 bg-[#222] rounded-lg">
              <Upload className="w-5 h-5" />
            </span>
            Add New Property
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Property Name *
            </label>
            <input
              type="text"
              placeholder="Enter property name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Location / Address *
            </label>
            <input
              type="text"
              placeholder="Enter location (e.g., Colombo, Sri Lanka)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Property Type
              </label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer">
                  <option value="single">Single Room</option>
                  <option value="shared">Shared Room</option>
                  <option value="apartment">Apartment</option>
                  <option value="hostel">Hostel</option>
                  <option value="suite">Suite</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Capacity
              </label>
              <input
                type="number"
                placeholder="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min="1"
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Monthly Rent (LKR) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Enter rent"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  required
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" />
                <ChevronsUpDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Deposit (LKR)
              </label>
              <input
                type="number"
                placeholder="Enter deposit"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Enter property description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all resize-none" />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-[#222] hover:bg-[#333] text-white rounded-lg font-medium transition-colors border border-[#333]">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-900/20">
              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>;
}