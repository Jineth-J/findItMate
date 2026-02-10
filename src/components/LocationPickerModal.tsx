import React, { useEffect, useState, Component } from 'react';
import { X, MapPin, Search, Check } from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap } from
'react-leaflet';
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
interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: {lat: number;lng: number;address: string;}) => void;
}
// Component to handle map clicks
function LocationMarker({
  position,
  setPosition



}: {position: L.LatLng | null;setPosition: (pos: L.LatLng) => void;}) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    }
  });
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  return position === null ? null : <Marker position={position} />;
}
// Component to update map view when search result is selected
function MapUpdater({ center }: {center: [number, number];}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
}
export function LocationPickerModal({
  isOpen,
  onClose,
  onConfirm
}: LocationPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<L.LatLng | null>(
    null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>([
  6.9271, 79.8612]
  ); // Colombo
  const [isSearching, setIsSearching] = useState(false);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    // Simulate search delay and result
    setTimeout(() => {
      setIsSearching(false);
      // Mock result: Move slightly from center
      const newLat = 6.9271 + (Math.random() - 0.5) * 0.01;
      const newLng = 79.8612 + (Math.random() - 0.5) * 0.01;
      const newPos = new L.LatLng(newLat, newLng);
      setMapCenter([newLat, newLng]);
      setSelectedPosition(newPos);
    }, 800);
  };
  const handleConfirm = () => {
    if (selectedPosition) {
      onConfirm({
        lat: selectedPosition.lat,
        lng: selectedPosition.lng,
        address:
        searchQuery ||
        `Location (${selectedPosition.lat.toFixed(4)}, ${selectedPosition.lng.toFixed(4)})`
      });
      onClose();
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-[#075E54] p-4 flex items-center gap-3 text-white shadow-md z-10">
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors">

            <X className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-medium flex-1">Send location</h2>
        </div>

        {/* Search Bar */}
        <div className="p-2 bg-[#F0F2F5] border-b border-gray-200">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a place..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border-none focus:ring-2 focus:ring-[#075E54] bg-white shadow-sm text-gray-800 placeholder-gray-500" />

          </form>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-[#E5E3DF] overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{
              height: '100%',
              width: '100%'
            }}
            zoomControl={false}>

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

            <LocationMarker
              position={selectedPosition}
              setPosition={setSelectedPosition} />

            <MapUpdater center={mapCenter} />
          </MapContainer>

          {/* Instructions Overlay */}
          {!selectedPosition &&
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
              <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                Tap anywhere to place a pin
              </div>
            </div>
          }
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-200">
          {selectedPosition ?
          <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#3E2723] text-sm">
                  Selected Location
                </p>
                <p className="text-xs text-gray-500">
                  {selectedPosition.lat.toFixed(4)},{' '}
                  {selectedPosition.lng.toFixed(4)}
                </p>
              </div>
              <button
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-[#075E54] text-white font-medium rounded-lg hover:bg-[#064C44] transition-colors flex items-center gap-2 shadow-sm">

                <Check className="h-4 w-4" />
                Confirm Location
              </button>
            </div> :

          <p className="text-center text-gray-500 text-sm italic">
              Please select a location on the map
            </p>
          }
        </div>
      </div>
    </div>);

}