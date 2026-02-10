import React, { useState, useEffect, useCallback } from 'react';
import { RoomCard } from '../components/RoomCard';
import { Room } from '../types';
import { propertiesAPI } from '../services/api';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  LayoutGrid,
  List,
  Heart,
  Sparkles,
  Loader2
} from
  'lucide-react';
import { SegmentedControl, SegmentOption } from '../components/SegmentedControl';
import { User } from '../types';
interface RoomsPageProps {
  rooms: Room[];
  onViewRoom: (roomId: string) => void;
  initialSearchQuery?: string;
  initialGroupSize?: string;
  tourPlannerRoomIds?: string[];
  onToggleTourRoom?: (roomId: string, e: React.MouseEvent) => void;
  user?: User | null;
  favouriteRoomIds?: string[];
  onToggleFavourite?: (roomId: string, e: React.MouseEvent) => void;
}
export function RoomsPage({
  rooms: initialRooms,
  onViewRoom,
  initialSearchQuery = '',
  initialGroupSize = '',
  tourPlannerRoomIds = [],
  onToggleTourRoom,
  user,
  favouriteRoomIds = [],
  onToggleFavourite
}: RoomsPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [groupSize, setGroupSize] = useState(() => {
    // Map homepage group size values to RoomsPage segmented control values
    if (initialGroupSize === 'Group (2+)') return '2';
    if (initialGroupSize === 'Solo') return 'solo';
    return 'solo';
  });
  const [showFilters, setShowFilters] = useState(!!initialSearchQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([5000, 25000]);
  const [roomType, setRoomType] = useState('any');
  const [distance, setDistance] = useState('any');

  // API-fetched rooms state
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const groupOptions: SegmentOption[] = [
    {
      value: 'solo',
      label: 'Solo'
    },
    {
      value: '2',
      label: '2'
    },
    {
      value: '4-6',
      label: '4-6'
    }];

  // Function to search rooms from API
  const searchRooms = useCallback(async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      // Map group size to capacity
      let capacity: number | undefined;
      if (groupSize === '2') capacity = 2;
      else if (groupSize === '4-6') capacity = 4;

      const response = await propertiesAPI.getAll({
        search: searchQuery || undefined,
        type: roomType !== 'any' ? roomType : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        capacity: capacity,
      });

      if (response.success && response.data) {
        // Map API properties to Room format
        const mappedRooms = response.data.map((prop: any) => ({
          id: prop._id,
          name: prop.title || prop.name || 'Untitled',
          description: prop.description,
          location: {
            lat: prop.location?.lat || 6.9023,
            lng: prop.location?.lng || 79.8612,
            city: prop.location?.city || 'Colombo',
            district: prop.location?.district || 'Colombo'
          },
          price: prop.rent,
          type: prop.type,
          capacity: prop.capacity,
          amenities: prop.amenities || [],
          image: prop.images?.[0] || '/uploads/default-property.png',
          images: prop.images || [],
          rating: prop.rating || 4.5,
          reviews: prop.reviewCount || 0,
          available: prop.status === 'active',
          latitude: prop.location?.lat || 6.9023,
          longitude: prop.location?.lng || 79.8612,
          safetyScore: prop.safetyScore || 8,
          landlordId: typeof prop.landlordId === 'object' ? prop.landlordId._id : prop.landlordId || 'unknown',
          estimatedBudget: prop.rent + 5000,
        }));
        setRooms(mappedRooms);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fall back to initial rooms on error
      setRooms(initialRooms);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, roomType, priceRange, groupSize, initialRooms]);

  // Initial search on mount or when initialSearchQuery prop changes
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
      setHasSearched(true);
    }
  }, [initialSearchQuery]);

  // Update search when filters change (with debounce effect)
  useEffect(() => {
    if (hasSearched || searchQuery || roomType !== 'any') {
      const timer = setTimeout(() => {
        searchRooms();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, roomType, priceRange, groupSize, hasSearched, searchRooms]);

  // Always fetch fresh data from API on mount
  useEffect(() => {
    searchRooms();
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setGroupSize('solo');
    setPriceRange([5000, 25000]);
    setRoomType('any');
    setDistance('any');
    setHasSearched(false);
    setRooms(initialRooms);
  };
  // Get favourite rooms
  const favouriteRooms = rooms.filter((room) =>
    favouriteRoomIds.includes(room.id)
  );
  // Get recommended rooms (mock logic: rooms not in favourites, random selection)
  const recommendedRooms = rooms.
    filter((room) => !favouriteRoomIds.includes(room.id)).
    sort(() => 0.5 - Math.random()).
    slice(0, 3);
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Header Section */}
      <div
        className={`bg-[#D7CCC8] px-4 sm:px-6 lg:px-8 ${user ? 'py-6' : 'py-10'}`}>

        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-[#3E2723] mb-2">
            {user ?
              `Welcome back, ${user.name.split(' ')[0]}!` :
              'Find Your Perfect Hostel'}
          </h1>
          <p className="text-[#5D4037]">
            {user ?
              'Your Housing Journey Hub' :
              `${rooms.length} verified properties near UCSC`}
          </p>
        </div>
      </div>

      {/* User Personalization Section (Only if logged in) */}
      {user &&
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8 relative z-10">
          {/* Favourites Section */}
          {favouriteRooms.length > 0 &&
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-red-500 fill-current" />
                <h2 className="text-xl font-bold text-[#3E2723]">
                  Your Favourites
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favouriteRooms.map((room) =>
                  <RoomCard
                    key={room.id}
                    room={room}
                    onViewDetails={onViewRoom}
                    isInTour={tourPlannerRoomIds.includes(room.id)}
                    onToggleTour={onToggleTourRoom}
                    isFavourite={true}
                    onToggleFavourite={onToggleFavourite} />

                )}
              </div>
            </div>
          }

          {/* Recommendations Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-yellow-500 fill-current" />
              <h2 className="text-xl font-bold text-[#3E2723]">
                Recommended For You
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedRooms.map((room) =>
                <RoomCard
                  key={room.id}
                  room={room}
                  onViewDetails={onViewRoom}
                  isInTour={tourPlannerRoomIds.includes(room.id)}
                  onToggleTour={onToggleTourRoom}
                  isFavourite={favouriteRoomIds.includes(room.id)}
                  onToggleFavourite={onToggleFavourite} />

              )}
            </div>
          </div>

          <div className="border-b border-[#D7CCC8] mb-8"></div>
          <h2 className="text-2xl font-bold text-[#3E2723] mb-6">
            All Listings
          </h2>
        </div>
      }

      {/* Search Section */}
      <div
        className={`${user ? '' : 'bg-[#D7CCC8]'} px-4 sm:px-6 lg:px-8 pb-8`}>

        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            {/* Main Search Row */}
            <div className="flex flex-col md:flex-row gap-3 items-center">
              {/* Search Input */}
              <div className="flex-1 relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location, property name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#FAF9F6] border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-transparent" />

              </div>

              {/* Group Size Segmented Control */}
              <div className="w-full md:w-auto min-w-[240px]">
                <SegmentedControl
                  options={groupOptions}
                  value={groupSize}
                  onChange={setGroupSize} />

              </div>

              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors w-full md:w-auto ${showFilters ? 'bg-[#3E2723] text-white' : 'bg-[#E8E0D5] text-[#3E2723] hover:bg-[#D7CCC8]'}`}>

                <SlidersHorizontal className="h-5 w-5" />
                <span>Filters</span>
              </button>

              {/* Search Button */}
              <button className="flex items-center justify-center gap-2 px-8 py-3 bg-[#3E2723] text-white rounded-xl font-medium hover:bg-[#2D1B18] transition-colors w-full md:w-auto">
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters &&
              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range (Rs. {priceRange[0].toLocaleString()} -{' '}
                    {priceRange[1].toLocaleString()})
                  </label>
                  <input
                    type="range"
                    min="5000"
                    max="25000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#3E2723]" />

                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Room Type
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF9F6] border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#795548]">

                    <option value="any">Any Type</option>
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                  </select>
                </div>

                {/* Distance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Distance from UCSC
                  </label>
                  <select
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF9F6] border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#795548]">

                    <option value="any">Any Distance</option>
                    <option value="500m">Within 500m</option>
                    <option value="1km">Within 1km</option>
                    <option value="2km">Within 2km</option>
                    <option value="5km">Within 5km</option>
                  </select>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Results Header */}
          <div className="flex justify-between items-center mb-8">
            <p className="text-gray-600">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching properties...
                </span>
              ) : (
                <>
                  Showing{' '}
                  <span className="font-semibold text-[#3E2723]">
                    {rooms.length}
                  </span>{' '}
                  results
                </>
              )}
            </p>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#3E2723] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>

                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#3E2723] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>

                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Results Grid or Empty State */}
          {rooms.length > 0 ?
            <div
              className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>

              {rooms.map((room: Room) =>
                <RoomCard
                  key={room.id}
                  room={room}
                  onViewDetails={onViewRoom}
                  isInTour={tourPlannerRoomIds.includes(room.id)}
                  onToggleTour={onToggleTourRoom}
                  isFavourite={favouriteRoomIds.includes(room.id)}
                  onToggleFavourite={onToggleFavourite} />

              )}
            </div> :

            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-[#E8E0D5] rounded-full flex items-center justify-center mb-6">
                <MapPin className="h-10 w-10 text-[#795548]" />
              </div>
              <h3 className="text-xl font-semibold text-[#3E2723] mb-2">
                No properties found
              </h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                Try adjusting your filters or check back later for new listings.
              </p>
              <button
                onClick={clearFilters}
                className="px-8 py-3 bg-[#3E2723] text-white rounded-xl font-medium hover:bg-[#2D1B18] transition-colors">

                Clear Filters
              </button>
            </div>
          }
        </div>
      </div>
    </div>);

}