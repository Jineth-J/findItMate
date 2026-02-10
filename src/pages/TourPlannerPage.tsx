import { useEffect, useState } from 'react';
import {
  MapPin,
  Star,
  ArrowRight,
  Route,
  RotateCcw,
  Clock,
  Navigation,
  Save,
  Check,
  Loader2
} from
  'lucide-react';
import { Room, User } from '../types';
import { CalendarPopover } from '../components/CalendarPopover';
import { toursAPI, getAuthToken } from '../services/api';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from
  'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
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
interface TourPlannerPageProps {
  rooms: Room[];
  onViewRoom: (roomId: string) => void;
  user?: User | null;
}
interface TourProperty {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  type: string;
  image: string;
  amenities: string[];
  badge: string;
  badgeColor: string;
  tag?: string;
  estimatedBudget?: number;
  lat: number;
  lng: number;
  step?: number;
}
// Helper to convert Room to TourProperty
const mapRoomToProperty = (room: Room): TourProperty => {
  // Use real coordinates from database, fallback to deterministic mock based on ID
  const lat = room.location?.lat || (6.9271 + (parseInt(room.id.slice(-4), 16) % 100) * 0.001);
  const lng = room.location?.lng || (79.8612 + (parseInt(room.id.slice(-4), 16) % 100) * 0.001);
  return {
    id: room.id,
    name: room.name,
    location: room.location?.city ? `${room.location.city}, Sri Lanka` : 'Colombo, Sri Lanka',
    price: room.price,
    rating: room.rating,
    reviews: Math.floor(Math.random() * 50) + 10,
    type: room.type,
    image: room.image,
    amenities: room.amenities.slice(0, 3),
    badge: room.rating > 4.7 ? 'Excellent' : 'Good',
    badgeColor: room.rating > 4.7 ? 'bg-green-500' : 'bg-yellow-500',
    estimatedBudget: room.estimatedBudget,
    lat,
    lng
  };
};
// Custom hook to fit map bounds
function MapBounds({ markers }: { markers: TourProperty[]; }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, {
        padding: [50, 50]
      });
    }
  }, [markers, map]);
  return null;
}
export function TourPlannerPage({ rooms, onViewRoom, user }: TourPlannerPageProps) {
  const [tourDate, setTourDate] = useState('');
  const [tourName, setTourName] = useState('My Tour Plan');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedTourId, setSavedTourId] = useState<string | null>(null);
  // Initialize properties from passed rooms prop
  const [properties, setProperties] = useState<TourProperty[]>(() => {
    return rooms.map(mapRoomToProperty);
  });
  // Update properties when rooms prop changes
  useEffect(() => {
    setProperties(rooms.map(mapRoomToProperty));
    // Reset saved state when rooms change
    setIsSaved(false);
    setSavedTourId(null);
  }, [rooms]);
  const [isRouteGenerated, setIsRouteGenerated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [stats, setStats] = useState({
    duration: 0,
    distance: 0
  });

  const isLoggedIn = !!getAuthToken() && !!user;
  const handleGenerateRoute = async () => {
    setIsAnimating(true);
    // Simulate calculation delay
    setTimeout(async () => {
      // Mock optimal order: just shuffle slightly for demo
      const optimalOrder = [...properties].sort(() => Math.random() - 0.5);
      // Add step numbers
      const orderedWithSteps = optimalOrder.map((p, index) => ({
        ...p,
        step: index + 1
      }));
      setProperties(orderedWithSteps);
      // Calculate path coordinates
      const path: [number, number][] = orderedWithSteps.map((p) => [
        p.lat,
        p.lng]
      );
      setRoutePath(path);
      // Update stats
      const newStats = {
        duration: 45 + properties.length * 15,
        distance: parseFloat((5.2 + properties.length * 1.5).toFixed(1)) // km
      };
      setStats(newStats);
      setIsRouteGenerated(true);
      setIsAnimating(false);

      // Auto-save route if tour was previously saved
      if (savedTourId && isLoggedIn) {
        try {
          await toursAPI.update(savedTourId, {
            optimizedOrder: orderedWithSteps.map(p => p.id),
            estimatedDuration: newStats.duration,
            estimatedDistance: newStats.distance,
            routePath: path.map(([lat, lng]) => ({ lat, lng }))
          });
        } catch (error) {
          console.error('Failed to save route:', error);
        }
      }
    }, 1500);
  };

  const handleSaveTour = async () => {
    if (!isLoggedIn) {
      alert('Please log in to save your tour plan.');
      return;
    }

    if (properties.length === 0) {
      alert('Add some properties to your tour first.');
      return;
    }

    setIsSaving(true);
    try {
      const tourData = {
        name: tourName || 'My Tour Plan',
        properties: properties.map(p => p.id),
        scheduledDate: tourDate || undefined,
        notes: ''
      };

      let response;
      if (savedTourId) {
        // Update existing tour
        response = await toursAPI.update(savedTourId, {
          ...tourData,
          ...(isRouteGenerated && {
            optimizedOrder: properties.map(p => p.id),
            estimatedDuration: stats.duration,
            estimatedDistance: stats.distance,
            routePath: routePath.map(([lat, lng]) => ({ lat, lng }))
          })
        });
      } else {
        response = await toursAPI.create(tourData);
        if (response.success && response.data) {
          setSavedTourId((response.data as any)._id);
        }
      }

      if (response.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save tour:', error);
      alert('Failed to save tour. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to initial order (by ID or just list) without steps
    setProperties(rooms.map(mapRoomToProperty));
    setIsRouteGenerated(false);
    setRoutePath([]);
    setStats({
      duration: 0,
      distance: 0
    });
  };
  // Custom Marker Icon Generator
  const createCustomIcon = (property: TourProperty) => {
    const isStepVisible = isRouteGenerated && property.step;
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative group">
          <div class="w-12 h-12 rounded-full border-4 border-white shadow-lg overflow-hidden relative z-10 transition-transform transform group-hover:scale-110 ${isStepVisible ? 'ring-4 ring-[#3E2723]' : ''}">
            <img src="${property.image}" class="w-full h-full object-cover" />
          </div>
          <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white filter drop-shadow-sm"></div>
          ${isStepVisible ?
          `
            <div class="absolute -top-2 -right-2 w-6 h-6 bg-[#3E2723] text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white z-20 shadow-md animate-bounce-in">
              ${property.step}
            </div>
          ` :
          ''}
        </div>
      `,

      iconSize: [48, 48],
      iconAnchor: [24, 54],
      popupAnchor: [0, -50]
    });
  };
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col h-screen overflow-hidden">
      {/* Header Section */}
      <div className="bg-[#F5F0E8] px-4 sm:px-6 lg:px-8 py-6 flex-shrink-0 border-b border-[#E8E0D5]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#3E2723] rounded-xl flex items-center justify-center shadow-sm">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#3E2723]">
                AI Tour Planner
              </h1>
              <p className="text-sm text-gray-600">
                Optimize your property visits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-[#E8E0D5]">
              <CalendarPopover
                value={tourDate}
                onChange={setTourDate}
                placeholder="Select Date"
                minDate={new Date().toISOString().split('T')[0]} />
            </div>

            {/* Save Tour Button */}
            {isLoggedIn && properties.length > 0 && (
              <button
                onClick={handleSaveTour}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-sm ${isSaved
                  ? 'bg-green-500 text-white'
                  : 'bg-[#3E2723] text-white hover:bg-[#2D1B18]'
                  } disabled:opacity-50`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Tour
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Left Side - Properties List (Scrollable) */}
            <div className="lg:col-span-4 flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-lg font-bold text-[#3E2723]">
                  {isRouteGenerated ?
                    'Optimal Route Order' :
                    'Added Properties'}
                </h2>
                <span className="text-xs font-medium bg-[#3E2723]/10 text-[#3E2723] px-2 py-1 rounded-full">
                  {properties.length} Properties
                </span>
              </div>

              {properties.length === 0 ?
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                  <MapPin className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="font-medium">Your tour list is empty</p>
                  <p className="text-sm mt-2">
                    Add properties from the "Find Hostels" page to plan your
                    tour.
                  </p>
                </div> :

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4 custom-scrollbar">
                  <AnimatePresence>
                    {properties.map((property) =>
                      <motion.div
                        layout
                        key={property.id}
                        initial={{
                          opacity: 0,
                          y: 20
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.9
                        }}
                        transition={{
                          duration: 0.3
                        }}
                        className={`bg-white rounded-xl overflow-hidden shadow-sm border transition-all cursor-pointer group ${isRouteGenerated ? 'border-[#3E2723] ring-1 ring-[#3E2723]/10' : 'border-transparent hover:border-[#D7CCC8]'}`}
                        onClick={() => onViewRoom(property.id)}>

                        <div className="flex">
                          {/* Image */}
                          <div className="w-32 h-32 relative flex-shrink-0">
                            <img
                              src={property.image}
                              alt={property.name}
                              className="w-full h-full object-cover" />

                            {isRouteGenerated && property.step &&
                              <div className="absolute top-2 left-2 w-6 h-6 bg-[#3E2723] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md z-10">
                                {property.step}
                              </div>
                            }
                          </div>

                          {/* Content */}
                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-semibold text-[#3E2723] text-sm leading-tight mb-1 line-clamp-2 group-hover:text-[#5D4037] transition-colors">
                                {property.name}
                              </h3>
                              <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">
                                  {property.location}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div>
                                <div className="text-sm font-bold text-[#3E2723]">
                                  LKR {property.price.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span>{property.rating}</span>
                                </div>
                              </div>
                              <button className="p-1.5 bg-[#F5F0E8] rounded-lg text-[#3E2723] hover:bg-[#3E2723] hover:text-white transition-colors">
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              }
            </div>

            {/* Right Side - Interactive Map (Full Height) */}
            <div className="lg:col-span-8 h-full flex flex-col rounded-2xl overflow-hidden shadow-lg border border-[#E8E0D5] relative bg-white">
              {/* Map Container */}
              <div className="flex-1 relative z-0">
                <MapContainer
                  center={[6.9271, 79.8612]}
                  zoom={13}
                  style={{
                    height: '100%',
                    width: '100%'
                  }}
                  zoomControl={false}>

                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />


                  <MapBounds markers={properties} />

                  {/* Markers */}
                  {properties.map((property) =>
                    <Marker
                      key={property.id}
                      position={[property.lat, property.lng]}
                      icon={createCustomIcon(property)}>

                      <Popup className="custom-popup">
                        <div className="p-1 text-center">
                          <h3 className="font-bold text-[#3E2723] text-sm">
                            {property.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {property.location}
                          </p>
                          <div className="mt-1 font-bold text-[#3E2723]">
                            LKR {property.price.toLocaleString()}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Animated Route Polyline */}
                  {isRouteGenerated && routePath.length > 0 &&
                    <Polyline
                      positions={routePath}
                      pathOptions={{
                        color: '#3E2723',
                        weight: 4,
                        dashArray: '10, 10',
                        opacity: 0.8,
                        className: 'animate-dash'
                      }} />

                  }
                </MapContainer>

                {/* Map Controls Overlay */}
                <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                  <button
                    className="bg-white p-2 rounded-lg shadow-md text-[#3E2723] hover:bg-gray-50 border border-gray-100"
                    title="Zoom In">

                    <span className="text-xl font-bold">+</span>
                  </button>
                  <button
                    className="bg-white p-2 rounded-lg shadow-md text-[#3E2723] hover:bg-gray-50 border border-gray-100"
                    title="Zoom Out">

                    <span className="text-xl font-bold">-</span>
                  </button>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="bg-white border-t border-[#E8E0D5] p-4 z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Stats */}
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F0E8] rounded-full flex items-center justify-center">
                        <Navigation className="h-5 w-5 text-[#795548]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                          Distance
                        </p>
                        <p className="text-lg font-bold text-[#3E2723]">
                          {stats.distance} km
                        </p>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F0E8] rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-[#795548]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                          Est. Time
                        </p>
                        <p className="text-lg font-bold text-[#3E2723]">
                          {stats.duration} min
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 w-full md:w-auto">
                    {isRouteGenerated ?
                      <button
                        onClick={handleReset}
                        className="flex-1 md:flex-none px-6 py-3 bg-white border border-[#D7CCC8] text-[#5D4037] font-medium rounded-xl hover:bg-[#F5F0E8] transition-colors flex items-center justify-center gap-2">

                        <RotateCcw className="h-5 w-5" />
                        Reset Route
                      </button> :

                      <button
                        onClick={handleGenerateRoute}
                        disabled={isAnimating}
                        className="flex-1 md:flex-none px-8 py-3 bg-[#3E2723] text-white font-medium rounded-xl hover:bg-[#2D1B18] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#3E2723]/20 disabled:opacity-70">

                        {isAnimating ?
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Calculating...
                          </> :

                          <>
                            <Route className="h-5 w-5" />
                            Generate Optimal Route
                          </>
                        }
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D7CCC8;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A1887F;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-dash {
          animation: dash 1s linear infinite;
        }
        .animate-bounce-in {
          animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>);

}