import React from 'react';
import { X, MapPin, Star, Users, DollarSign, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Fix for default Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});
interface ViewPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: any;
}
export function ViewPropertyModal({
  isOpen,
  onClose,
  property
}: ViewPropertyModalProps) {
  if (!isOpen) return null;
  // Fallback mock data if no property passed
  const data = property || {
    name: 'Sunset Beach Hostel',
    location: 'Bali, Indonesia',
    type: 'Hostel',
    rating: 4.8,
    price: 45,
    description:
    'Experience the ultimate beachfront living at Sunset Beach Hostel. Located right on the shores of Kuta Beach, we offer a perfect blend of relaxation and social vibes. Our hostel features modern dorms, private rooms, a swimming pool, and a rooftop bar with stunning sunset views.',
    image:
    '/uploads/default-property.png',
    amenities: [
    'WiFi',
    'Air Conditioning',
    'Pool',
    'Bar',
    'Breakfast',
    'Lockers']

  };
  // Mock coordinates (Bali approx for fallback, or Colombo for others)
  const lat = data.lat || (data.location.includes('Bali') ? -8.7185 : 6.9271);
  const lng = data.lng || (data.location.includes('Bali') ? 115.1706 : 79.8612);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-[#161616] border border-[#333] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
        {/* Image Header */}
        <div className="relative h-64 md:h-80 w-full">
          <img
            src={data.image}
            alt={data.name}
            className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors">

            <X className="w-6 h-6" />
          </button>
          <div className="absolute bottom-0 left-0 p-8 w-full">
            <div className="flex justify-between items-end">
              <div>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3 inline-block shadow-lg shadow-red-900/40">
                  {data.type}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {data.name}
                </h2>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-red-500" />
                  {data.location}
                </div>
              </div>
              <div className="text-right hidden md:block">
                <div className="text-3xl font-bold text-white">
                  ${data.price}
                </div>
                <div className="text-sm text-gray-400">per night</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#0f0f0f]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  About this property
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {data.description}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {data.amenities.map((amenity: string, idx: number) =>
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-gray-300">

                      <CheckCircle className="w-5 h-5 text-green-500" />
                      {amenity}
                    </div>
                  )}
                </div>
              </div>

              {/* Map Preview */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Location</h3>
                <div className="h-64 w-full rounded-xl overflow-hidden border border-[#333] z-0 relative">
                  <MapContainer
                    center={[lat, lng]}
                    zoom={14}
                    style={{
                      height: '100%',
                      width: '100%'
                    }}
                    scrollWheelZoom={false}>

                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                    <Marker position={[lat, lng]}>
                      <Popup className="text-black">{data.name}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="bg-[#161616] border border-[#333] rounded-xl p-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Property Stats
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Rating
                    </div>
                    <span className="font-bold text-white">
                      {data.rating}/5.0
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Users className="w-5 h-5 text-blue-500" />
                      Capacity
                    </div>
                    <span className="font-bold text-white">4 Guests</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-300">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Price
                    </div>
                    <span className="font-bold text-white">${data.price}</span>
                  </div>
                </div>

                <button className="w-full mt-6 bg-[#222] hover:bg-[#333] text-white py-3 rounded-lg font-medium transition-colors border border-[#333]">
                  View Booking History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}