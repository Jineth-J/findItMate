import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { bookingsAPI } from '../services/api';
import { useState, useEffect, useCallback } from 'react';
import { Room } from '../types';
import {
  Wifi,
  Tv,
  Coffee,
  Wind,
  Check,
  ArrowLeft,
  Star,
  Wallet,
  MapPin,
  Plus,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Map from '../components/Map';

interface RoomDetailPageProps {
  room: Room;
  onBook: (roomId: string, dates?: { checkIn: string; checkOut: string }) => void;
  onBack: () => void;
  isInTour?: boolean;
  onToggleTour?: (e: React.MouseEvent) => void;
  isFavourite?: boolean;
  onToggleFavourite?: (e: React.MouseEvent) => void;
  onContact?: () => void;
}

export function RoomDetailPage({
  room,
  onBook,
  onBack,
  isInTour,
  onToggleTour,
  isFavourite,
  onToggleFavourite,
  onContact
}: RoomDetailPageProps) {
  // Image Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = room.images && room.images.length > 0 ? room.images : [room.image];

  // Auto-swipe effect
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Auto-swap every 5 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Calendar State
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Fetch availability
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        const response = await bookingsAPI.getAvailability(room.id);
        if (response.success && response.data) {
          const blocked = response.data.flatMap(range => {
            const start = new Date(range.start);
            const end = new Date(range.end);
            const dates = [];
            let current = start;
            while (current <= end) {
              dates.push(new Date(current));
              current.setDate(current.getDate() + 1);
            }
            return dates;
          });
          setBlockedDates(blocked);
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      } finally {
        setIsLoadingAvailability(false);
      }
    };
    fetchAvailability();
  }, [room.id]);

  const onChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const handleBookClick = () => {
    if (startDate && endDate) {
      onBook(room.id, {
        checkIn: startDate.toISOString().split('T')[0],
        checkOut: endDate.toISOString().split('T')[0]
      });
    } else {
      onBook(room.id);
    }
  };

  // Calculate total nights and price
  const totalNights = startDate && endDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = totalNights * room.price;

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      {/* Image Carousel */}
      <div className="relative h-[50vh] w-full overflow-hidden group">
        {/* Images */}
        <div
          className="flex transition-transform duration-700 ease-out h-full"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${room.name} - Image ${index + 1}`}
              className="w-full h-full object-cover flex-shrink-0"
            />
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6 text-[#3E2723]" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
            >
              <ChevronRight className="h-6 w-6 text-[#3E2723]" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`transition-all duration-300 rounded-full ${index === currentImageIndex
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                  }`}
              />
            ))}
          </div>
        )}

        {/* Image Counter Badge */}
        {images.length > 1 && (
          <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Top Navigation */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <button
            onClick={onBack}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200 transform hover:scale-105">
            <ArrowLeft className="h-5 w-5 text-[#3E2723]" />
          </button>

          {onToggleFavourite &&
            <button
              onClick={onToggleFavourite}
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200 transform hover:scale-105">
              <Heart
                className={`h-5 w-5 transition-colors ${isFavourite ? 'fill-red-500 text-red-500' : 'text-[#3E2723]'}`} />
            </button>
          }
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8">
              <div className="flex-1">
                {/* Room Details */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-[#795548] to-[#5D4037] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                    {room.type}
                  </span>
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-bold text-gray-700 ml-1">
                      {room.rating}
                    </span>
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-[#3E2723] mb-4">
                  {room.name}
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mb-6 leading-relaxed">
                  {room.description}
                </p>

                {room.estimatedBudget &&
                  <div className="flex items-center gap-2 mt-3 bg-[#FFF8E1] px-4 py-2 rounded-lg w-fit">
                    <Wallet className="h-5 w-5 text-[#795548]" />
                    <span className="text-[#5D4037] font-medium">
                      Estimated Overall Budget — LKR{' '}
                      {room.estimatedBudget.toLocaleString()}/=
                    </span>
                  </div>
                }

                <div className="border-t border-gray-100 pt-8 mt-8">
                  <h2 className="text-2xl font-bold text-[#3E2723] mb-6">
                    Room Amenities
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3 bg-[#F5F5F5] p-4 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Wifi className="h-5 w-5 text-[#795548]" />
                      </div>
                      <span className="text-gray-700 font-medium">High-speed Wifi</span>
                    </div>
                    <div className="flex items-center gap-3 bg-[#F5F5F5] p-4 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Tv className="h-5 w-5 text-[#795548]" />
                      </div>
                      <span className="text-gray-700 font-medium">Smart TV</span>
                    </div>
                    <div className="flex items-center gap-3 bg-[#F5F5F5] p-4 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Coffee className="h-5 w-5 text-[#795548]" />
                      </div>
                      <span className="text-gray-700 font-medium">Coffee Maker</span>
                    </div>
                    <div className="flex items-center gap-3 bg-[#F5F5F5] p-4 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Wind className="h-5 w-5 text-[#795548]" />
                      </div>
                      <span className="text-gray-700 font-medium">Air Conditioning</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-8 mt-8">
                  <h2 className="text-2xl font-bold text-[#3E2723] mb-6">
                    What's Included
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {room.amenities.map((amenity, index) =>
                      <li key={index} className="flex items-center gap-3 bg-green-50/50 p-3 rounded-lg">
                        <div className="bg-green-100 p-1.5 rounded-full">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">{amenity}</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Location Map */}
                <div className="border-t border-gray-100 pt-8 mt-8">
                  <h2 className="text-2xl font-bold text-[#3E2723] mb-6 flex items-center gap-2">
                    <MapPin className="h-6 w-6" /> Location
                  </h2>
                  <Map
                    center={[
                      room.location?.lat || 6.9271,
                      room.location?.lng || 79.8612
                    ]}
                    popupText={room.name}
                  />
                </div>
              </div>

              {/* Sidebar with Booking & Calendar */}
              <div className="bg-gradient-to-b from-[#FAFAFA] to-white p-6 rounded-2xl border border-gray-100 min-w-[360px] sticky top-24 shadow-lg">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#3E2723]">
                    LKR {room.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-lg"> / night</span>
                </div>

                {/* Beautiful Date Picker */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Select Dates</label>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <DatePicker
                      selected={startDate}
                      onChange={onChange}
                      startDate={startDate}
                      endDate={endDate}
                      selectsRange
                      inline
                      minDate={new Date()}
                      excludeDates={blockedDates}
                      monthsShown={1}
                      calendarClassName="custom-calendar"
                      dayClassName={(date) => {
                        const isBlocked = blockedDates.some(
                          d => d.toDateString() === date.toDateString()
                        );
                        if (isBlocked) return 'blocked-day';
                        return 'available-day';
                      }}
                    />
                  </div>
                </div>

                {/* Total Price Calculation */}
                {startDate && endDate && totalNights > 0 && (
                  <div className="bg-gradient-to-r from-[#EFEBE9] to-[#F5F0E8] p-5 rounded-xl mb-5">
                    <div className="flex justify-between mb-3 text-[#5D4037]">
                      <span className="font-medium">LKR {room.price.toLocaleString()} × {totalNights} nights</span>
                      <span className="font-semibold">LKR {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-[#D7CCC8] pt-3 flex justify-between font-bold text-[#3E2723] text-lg">
                      <span>Total</span>
                      <span>LKR {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBookClick}
                  disabled={!startDate || !endDate}
                  className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 mb-3 text-lg ${startDate && endDate
                    ? 'bg-[#3E2723] text-white hover:bg-[#2D1B18] hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}>
                  {startDate && endDate ? 'Book Now' : 'Select Dates to Book'}
                </button>

                <button
                  onClick={onContact}
                  className="w-full bg-white text-[#3E2723] font-bold py-4 px-6 rounded-xl shadow-sm border-2 border-[#3E2723] hover:bg-[#3E2723] hover:text-white transition-all duration-200 mb-3 flex items-center justify-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contact Landlord
                </button>

                {onToggleTour &&
                  <button
                    onClick={onToggleTour}
                    className={`w-full font-bold py-4 px-6 rounded-xl shadow-sm border-2 transition-all duration-200 flex items-center justify-center gap-2 ${isInTour ? 'bg-[#EFEBE9] text-[#3E2723] border-[#D7CCC8] hover:bg-[#D7CCC8]' : 'bg-white text-[#3E2723] border-[#3E2723] hover:bg-[#F5F5F5]'}`}>

                    {isInTour ?
                      <>
                        <Check className="h-5 w-5" />
                        Added to Tour Planner
                      </> :

                      <>
                        <Plus className="h-5 w-5" />
                        Add to Tour Planner
                      </>
                    }
                  </button>
                }

                <p className="text-sm text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  Free cancellation up to 24h before check-in
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Calendar Styles */}
      <style>{`
        .custom-calendar {
          font-family: inherit;
          border: none !important;
          width: 100% !important;
        }
        .react-datepicker {
          border: none !important;
          font-family: inherit !important;
        }
        .react-datepicker__header {
          background: linear-gradient(135deg, #3E2723 0%, #5D4037 100%) !important;
          border: none !important;
          border-radius: 12px 12px 0 0 !important;
          padding: 16px !important;
        }
        .react-datepicker__current-month {
          color: white !important;
          font-weight: 700 !important;
          font-size: 1.1rem !important;
          margin-bottom: 8px !important;
        }
        .react-datepicker__day-names {
          display: flex !important;
          justify-content: space-around !important;
          margin-top: 8px !important;
        }
        .react-datepicker__day-name {
          color: rgba(255,255,255,0.8) !important;
          font-weight: 600 !important;
          font-size: 0.75rem !important;
          width: 2.5rem !important;
          margin: 0 !important;
        }
        .react-datepicker__month {
          margin: 0 !important;
          padding: 12px !important;
        }
        .react-datepicker__week {
          display: flex !important;
          justify-content: space-around !important;
        }
        .react-datepicker__day {
          width: 2.5rem !important;
          height: 2.5rem !important;
          line-height: 2.5rem !important;
          margin: 2px !important;
          border-radius: 50% !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
        }
        .react-datepicker__day:hover {
          background: #EFEBE9 !important;
          color: #3E2723 !important;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end {
          background: #3E2723 !important;
          color: white !important;
          font-weight: 700 !important;
        }
        .react-datepicker__day--in-range {
          background: #EFEBE9 !important;
          color: #3E2723 !important;
        }
        .react-datepicker__day--in-selecting-range {
          background: #D7CCC8 !important;
          color: #3E2723 !important;
        }
        .react-datepicker__day--disabled {
          color: #ccc !important;
          text-decoration: line-through !important;
        }
        .react-datepicker__day--today {
          font-weight: 700 !important;
          color: #795548 !important;
        }
        .react-datepicker__navigation {
          top: 16px !important;
        }
        .react-datepicker__navigation-icon::before {
          border-color: white !important;
        }
        .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
          border-color: rgba(255,255,255,0.8) !important;
        }
        .react-datepicker__month-container {
          width: 100% !important;
        }
        .blocked-day {
          color: #e57373 !important;
          text-decoration: line-through !important;
        }
        .available-day {
          color: #333 !important;
        }
      `}</style>
    </div>);
}