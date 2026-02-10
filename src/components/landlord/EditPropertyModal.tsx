import React, { useEffect, useState } from 'react';
import {
  X,
  Upload,
  ChevronDown,
  Save,
  Edit,
  Search,
  MapPin,
  Maximize2,
  Minimize2,
  Plus,
  X as CloseIcon
} from
'lucide-react';
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
interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  property?: any;
}
// Sub-component: handle map clicks to move pin
function LocationMarker({
  position,
  setPosition,
  interactive




}: {position: L.LatLng | null;setPosition: (pos: L.LatLng) => void;interactive: boolean;}) {
  useMapEvents({
    click(e) {
      if (interactive) {
        setPosition(e.latlng);
      }
    }
  });
  return position ? <Marker position={position} /> : null;
}
// Sub-component: fly map to new center
function MapUpdater({ center }: {center: [number, number];}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}
// Sub-component: invalidate map size on expand/collapse
function MapResizer({ expanded }: {expanded: boolean;}) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 300);
  }, [expanded, map]);
  return null;
}
export function EditPropertyModal({
  isOpen,
  onClose,
  onSubmit,
  property
}: EditPropertyModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    type: 'single',
    status: 'active',
    rent: '',
    deposit: '',
    capacity: '1',
    description: '',
    amenities: [] as string[]
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([
  6.9271, 79.8612]
  );
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(
    new L.LatLng(6.9271, 79.8612)
  );
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || property.name || '',
        address: property.address || property.location || '',
        type: property.type || 'single',
        status: property.status || 'active',
        rent: property.rent ? property.rent.toString() : (property.price ? property.price.replace(/[^0-9]/g, '') : ''),
        deposit: property.deposit ? property.deposit.toString() : '',
        capacity: property.capacity ? property.capacity.toString() : '1',
        description: property.description || '',
        amenities: property.amenities || property.tags || []
      });
      setExistingImages(property.images || []);
      
      // Set map position based on property location
      if (property.location?.lat && property.location?.lng) {
        const coords = [property.location.lat, property.location.lng] as [number, number];
        setMapCenter(coords);
        setMarkerPosition(new L.LatLng(coords[0], coords[1]));
      } else {
        // Fallback to address-based geocoding
        const locationMap: Record<string, [number, number]> = {
          'Reid Avenue, Colombo 07': [6.9023, 79.8614],
          'Havelock Road, Colombo 05': [6.8841, 79.8673],
          'Colombo': [6.9271, 79.8612]
        };
        const address = property.address || property.location || '';
        const coords = Object.entries(locationMap).find(([key]) =>
          address.toLowerCase().includes(key.toLowerCase().split(',')[0])
        );
        if (coords) {
          setMapCenter(coords[1]);
          setMarkerPosition(new L.LatLng(coords[1][0], coords[1][1]));
        }
      }
    }
  }, [property]);
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      lat: markerPosition?.lat,
      lng: markerPosition?.lng,
      existingImages,
      newImages
    };
    
    onSubmit(submitData);
  };
  const handleMarkerUpdate = (pos: L.LatLng) => {
    setMarkerPosition(pos);
    setMapCenter([pos.lat, pos.lng]);
  };
  const handleMapSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearchQuery.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const newLat = 6.9271 + (Math.random() - 0.5) * 0.02;
      const newLng = 79.8612 + (Math.random() - 0.5) * 0.02;
      const newPos = new L.LatLng(newLat, newLng);
      setMapCenter([newLat, newLng]);
      setMarkerPosition(newPos);
    }, 600);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-[#F5F0E8] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
        {/* Left Side - Image Preview & Uploads */}
        <div className="w-full md:w-5/12 p-6 flex flex-col gap-4 overflow-y-auto border-r border-[#D7CCC8]">
          {/* Main Image */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden group">
            <img
              src={
              existingImages[0] ||
              '/uploads/default-property.png'
              }
              alt="Property"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="bg-white/90 text-[#3E2723] px-4 py-2 rounded-lg font-medium text-sm shadow-lg flex items-center gap-2 hover:bg-white cursor-pointer">
                <Upload className="w-4 h-4" /> Change Cover
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewImages([...newImages, file]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Existing Images Gallery */}
          {existingImages.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#5D4037]">Current Images</h4>
              <div className="grid grid-cols-3 gap-2">
                {existingImages.slice(1).map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={img} alt={`Property ${index + 2}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setExistingImages(existingImages.filter((_, i) => i !== index + 1));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <CloseIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          {newImages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#5D4037]">New Images</h4>
              <div className="grid grid-cols-3 gap-2">
                {newImages.map((file, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`New ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNewImages(newImages.filter((_, i) => i !== index));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <CloseIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Areas */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            <label className="aspect-square border-2 border-dashed border-[#D7CCC8] rounded-2xl flex flex-col items-center justify-center text-center p-4 hover:bg-[#E8E0D5]/50 transition-colors cursor-pointer group">
              <Upload className="w-6 h-6 text-[#A1887F] mb-2 group-hover:text-[#3E2723] transition-colors" />
              <span className="text-xs font-medium text-[#5D4037]">
                Click to upload images
              </span>
              <span className="text-[10px] text-[#A1887F] mt-1">
                PNG, JPG up to 5MB each
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setNewImages([...newImages, ...files]);
                }}
                className="hidden"
              />
            </label>
            <div className="aspect-square border-2 border-dashed border-[#D7CCC8] rounded-2xl flex flex-col items-center justify-center text-center p-4 hover:bg-[#E8E0D5]/50 transition-colors cursor-pointer group">
              <Plus className="w-6 h-6 text-[#A1887F] mb-2 group-hover:text-[#3E2723] transition-colors" />
              <span className="text-xs font-medium text-[#5D4037]">
                {newImages.length} new images
              </span>
              <span className="text-[10px] text-[#A1887F] mt-1">
                {existingImages.length} existing
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 bg-[#F5F0E8] overflow-y-auto relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#3E2723] flex items-center gap-2">
              <Edit className="w-6 h-6" />
              Edit Property
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#E8E0D5] rounded-full text-[#5D4037] transition-colors">

              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5D4037]">
                Property Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value
                })
                }
                className="w-full bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl px-4 py-3 text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-transparent transition-all"
                placeholder="e.g. Sunset Beach Hostel" />

            </div>

            {/* Location + Mini Map */}
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5D4037]">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: e.target.value
                  })
                  }
                  className="w-full bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl px-4 py-3 text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-transparent transition-all"
                  placeholder="e.g. Reid Avenue, Colombo 07" />

              </div>

              {/* Mini Map */}
              <div
                className="relative rounded-xl border border-[#D7CCC8] overflow-hidden transition-all duration-300 ease-in-out cursor-pointer"
                style={{
                  height: isMapExpanded ? 250 : 120
                }}
                onClick={() => {
                  if (!isMapExpanded) setIsMapExpanded(true);
                }}>

                <MapContainer
                  center={mapCenter}
                  zoom={14}
                  style={{
                    height: '100%',
                    width: '100%'
                  }}
                  zoomControl={false}
                  scrollWheelZoom={isMapExpanded}
                  dragging={isMapExpanded}
                  doubleClickZoom={isMapExpanded}
                  touchZoom={isMapExpanded}>

                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                  <LocationMarker
                    position={markerPosition}
                    setPosition={handleMarkerUpdate}
                    interactive={isMapExpanded} />

                  <MapUpdater center={mapCenter} />
                  <MapResizer expanded={isMapExpanded} />
                </MapContainer>

                {/* Search overlay - only when expanded */}
                {isMapExpanded &&
                <div className="absolute top-2 left-2 right-10 z-[400]">
                    <form onSubmit={handleMapSearch} className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1887F]" />
                      <input
                      type="text"
                      value={mapSearchQuery}
                      onChange={(e) => setMapSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Search location..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white/95 backdrop-blur-sm border border-[#D7CCC8] rounded-lg text-xs text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-1 focus:ring-[#795548] shadow-md" />

                    </form>
                  </div>
                }

                {/* Expand/Collapse toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMapExpanded(!isMapExpanded);
                  }}
                  className="absolute top-2 right-2 z-[400] p-1.5 bg-white/90 backdrop-blur-sm border border-[#D7CCC8] rounded-lg text-[#5D4037] hover:bg-white shadow-sm transition-colors">

                  {isMapExpanded ?
                  <Minimize2 className="w-3.5 h-3.5" /> :

                  <Maximize2 className="w-3.5 h-3.5" />
                  }
                </button>

                {/* Compact overlay hint */}
                {!isMapExpanded &&
                <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[10px] text-[#5D4037] font-medium shadow-sm border border-[#D7CCC8]">
                    <MapPin className="w-3 h-3 text-[#3E2723]" />
                    Click to expand & edit pin
                  </div>
                }

                {/* Expanded hint */}
                {isMapExpanded &&
                <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[10px] text-[#5D4037] font-medium shadow-sm border border-[#D7CCC8]">
                    <MapPin className="w-3 h-3 text-[#3E2723]" />
                    Click map to move pin
                  </div>
                }
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5D4037]">
                  Property Type
                </label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value
                    })
                    }
                    className="w-full bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl px-4 py-3 text-[#3E2723] appearance-none focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-transparent transition-all cursor-pointer">

                    <option value="single">Single Room</option>
                    <option value="shared">Shared Room</option>
                    <option value="apartment">Apartment</option>
                    <option value="hostel">Hostel</option>
                    <option value="suite">Suite</option>
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1887F] pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5D4037]">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value
                    })
                    }
                    className="w-full bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl px-4 py-3 text-[#3E2723] appearance-none focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-transparent transition-all cursor-pointer">

                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="occupied">Occupied</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1887F] pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5D4037]">
                  Rent per Month (LKR)
                </label>
                <input
                  type="number"
                  value={formData.rent}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    rent: e.target.value
                  })
                  }
                  className="w-full bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl px-4 py-3 text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-transparent transition-all"
                  placeholder="45000" />

              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5D4037]">
                  Deposit (LKR)
                </label>
                <input
                  type="number"
                  value={formData.deposit}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    deposit: e.target.value
                  })
                  }
                  className="w-full bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl px-4 py-3 text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-transparent transition-all"
                  placeholder="10000" />

              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5D4037]">
                  Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: e.target.value
                  })
                  }
                  className="w-full bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl px-4 py-3 text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-transparent transition-all"
                  placeholder="1" />

              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5D4037]">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value
                })
                }
                className="w-full bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl px-4 py-3 text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-transparent transition-all resize-none"
                placeholder="Enter property description..." />

            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5D4037]">
                Amenities
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'WiFi', 'Air Conditioning', 'Parking', 'Laundry',
                  'Kitchen', 'Study Room', 'Security', 'Gym',
                  'Swimming Pool', 'Backup Power'
                ].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 p-2 bg-white border border-[#D7CCC8] rounded-lg cursor-pointer hover:bg-[#FAF9F6] transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            amenities: [...formData.amenities, amenity]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            amenities: formData.amenities.filter(a => a !== amenity)
                          });
                        }
                      }}
                      className="rounded border-[#D7CCC8] text-[#3E2723] focus:ring-[#795548]"
                    />
                    <span className="text-sm text-[#5D4037]">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6 mt-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-transparent border border-[#3E2723] text-[#3E2723] rounded-xl font-medium hover:bg-[#E8E0D5] transition-colors">

                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#3E2723] text-white rounded-xl font-medium hover:bg-[#2D1B18] transition-colors shadow-lg flex items-center justify-center gap-2">

                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>);

}