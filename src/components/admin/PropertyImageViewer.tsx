import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';
interface PropertyImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  property?: {
    name: string;
    location: string;
    type: string;
    rating: number;
    image: string;
    images?: string[];
  };
}
export function PropertyImageViewer({
  isOpen,
  onClose,
  property
}: PropertyImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!isOpen || !property) return null;
  const allImages = property.images && property.images.length > 0 ? property.images : [property.image, '/uploads/default-property.png', '/uploads/default-property.png'];
  const handlePrev = () => {
    setCurrentIndex((prev) => prev === 0 ? allImages.length - 1 : prev - 1);
  };
  const handleNext = () => {
    setCurrentIndex((prev) => prev === allImages.length - 1 ? 0 : prev + 1);
  };
  return <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-[#161616] border border-[#333] rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[#333] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white">{property.name}</h3>
            <span className="bg-[#222] text-gray-300 px-2 py-1 rounded border border-[#333] text-xs">
              {property.type}
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Image Display */}
        <div className="relative bg-black aspect-video flex items-center justify-center">
          <img src={allImages[currentIndex]} alt={`${property.name} - ${currentIndex + 1}`} className="w-full h-full object-contain" />

          {/* Navigation Arrows */}
          {allImages.length > 1 && <>
              <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {currentIndex + 1} / {allImages.length}
          </div>
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && <div className="p-4 border-t border-[#333] flex gap-2 overflow-x-auto">
            {allImages.map((img, idx) => <button key={idx} onClick={() => setCurrentIndex(idx)} className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${idx === currentIndex ? 'border-red-600 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>)}
          </div>}

        {/* Property Info */}
        <div className="p-4 border-t border-[#333] flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <MapPin className="w-4 h-4" />
            {property.location}
          </div>
          <div className="flex items-center gap-1 text-yellow-500 text-sm">
            <Star className="w-4 h-4 fill-yellow-500" />
            <span className="text-white font-bold">{property.rating}</span>
          </div>
        </div>
      </div>
    </div>;
}