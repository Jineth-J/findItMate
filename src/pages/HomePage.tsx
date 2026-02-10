import React, { useEffect, useState, useRef } from 'react'
import { Room } from '../types'
import { User } from '../types'
import { RoomCard } from '../components/RoomCard'
import {
  Search,
  MapPin,
  User as UserIcon,
  Shield,
  Star,
  Zap,
  Users,
  MessageCircle,
  CheckCircle,
  Utensils,
  ArrowRight,
  Calendar,
  Home,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
interface HomePageProps {
  featuredRooms: Room[]
  onNavigate: (page: any) => void
  onViewRoom: (roomId: string) => void
  onOpenSubscription: () => void
  onSearch?: (query: string, groupSize: string) => void
  tourPlannerRoomIds?: string[]
  onToggleTourRoom?: (roomId: string, e: React.MouseEvent) => void
  favouriteRoomIds?: string[]
  onToggleFavourite?: (roomId: string, e: React.MouseEvent) => void
  user?: User | null
}
const MOCK_SUGGESTIONS = [
  'Reid Avenue, Colombo 07',
  'Baseline Road, Colombo 08',
  'Havelock Road, Colombo 05',
  'Galle Road, Colombo 03',
  'Duplication Road, Colombo 04',
  'Park Road, Colombo 05',
  'Flower Road, Colombo 07',
  'Bauddhaloka Mawatha, Colombo 07',
  'Wijerama Road, Colombo 07',
  'Thimbirigasyaya Road, Colombo 05',
]
export function HomePage({
  featuredRooms,
  onNavigate,
  onViewRoom,
  onOpenSubscription,
  onSearch,
  tourPlannerRoomIds = [],
  onToggleTourRoom,
  favouriteRoomIds = [],
  onToggleFavourite,
  user = null,
}: HomePageProps) {
  const [locationQuery, setLocationQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [heroGroupSize, setHeroGroupSize] = useState('Solo')
  const searchContainerRef = useRef<HTMLDivElement>(null)
  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  const handleSearch = () => {
    if (onSearch) {
      onSearch(locationQuery, heroGroupSize)
    } else {
      onNavigate('rooms')
    }
  }
  const filteredSuggestions = MOCK_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(locationQuery.toLowerCase()),
  )
  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#3E2723]">
      {/* HERO SECTION */}
      <div className="relative h-[600px] w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://cdn.magicpatterns.com/uploads/r6w3vzgf8YfHaVYJ3rRWcC/Starter_Page.png"
            alt="Student Bedroom"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay Image */}
          <img
            src="https://cdn.magicpatterns.com/uploads/iFAinp4CdkLDMwvMP83nc2/Gradient.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#4E342E]/80 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-sm font-medium mb-6 border border-[#795548]/50">
              <Star className="h-4 w-4 fill-white" />
              <span>AI-Powered Student Accommodation</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find Your Perfect{' '}
              <span className="text-[#D7CCC8]">Student Home</span> Near Campus
            </h1>

            <p className="text-lg text-gray-200 mb-8 max-w-xl">
              Discover verified hostels and rooms near UCSC with our intelligent
              search, safety scores, and AI-powered tour planning. Your comfort
              and safety, simplified.
            </p>

            {/* Custom Search Bar */}
            <div className="relative" ref={searchContainerRef}>
              <div className="bg-[#F5F0E8] p-2 rounded-3xl md:rounded-full shadow-2xl max-w-2xl flex flex-col md:flex-row items-center gap-2 relative z-20">
                <div className="flex-1 flex items-center px-4 h-12 w-full border-b md:border-b-0 md:border-r border-[#D7CCC8]">
                  <MapPin className="h-5 w-5 text-[#795548] mr-3" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Near UCSC, Colombo 07..."
                    className="w-full bg-transparent outline-none text-[#3E2723] placeholder-[#A1887F]"
                  />
                </div>
                <div className="flex-1 flex items-center px-4 h-12 w-full">
                  <UserIcon className="h-5 w-5 text-[#795548] mr-3" />
                  <select
                    value={heroGroupSize}
                    onChange={(e) => setHeroGroupSize(e.target.value)}
                    className="w-full bg-transparent outline-none text-[#3E2723] cursor-pointer appearance-none"
                  >
                    <option>Solo</option>
                    <option>Group (2+)</option>
                  </select>
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-[#3E2723] hover:bg-[#2D1B18] text-white px-8 h-12 rounded-full font-medium transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions &&
                locationQuery &&
                filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#E8E0D5] overflow-hidden z-10 max-w-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setLocationQuery(suggestion)
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-6 py-3 hover:bg-[#F5F0E8] flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none group"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#F5F0E8] flex items-center justify-center group-hover:bg-[#E8E0D5] transition-colors">
                          <MapPin className="h-4 w-4 text-[#795548]" />
                        </div>
                        <span className="text-[#3E2723] font-medium">
                          {suggestion}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap items-center gap-8 text-white">
              <div>
                <div className="font-bold text-2xl">500+</div>
                <div className="text-xs text-gray-300 uppercase tracking-wide">
                  Verified Properties
                </div>
              </div>
              <div className="hidden md:block h-8 w-px bg-white/20"></div>
              <div>
                <div className="font-bold text-2xl">2,000+</div>
                <div className="text-xs text-gray-300 uppercase tracking-wide">
                  Happy Students
                </div>
              </div>
              <div className="hidden md:block h-8 w-px bg-white/20"></div>
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-[#D7CCC8]" />
                <div>
                  <div className="font-bold text-lg">100% Safe</div>
                  <div className="text-xs text-gray-300 uppercase tracking-wide">
                    Verified Listings
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SMART FEATURES SECTION */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-bold text-[#795548] uppercase tracking-widest mb-2">
            Why Choose Us
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3E2723]">
            Smart Features for Smart Students
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Beyond listings — we provide an intelligent ecosystem that saves you
            20+ hours of searching and keeps you safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-[#FAF9F6] p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-5 w-5 text-gray-700" />
            </div>
            <h3 className="font-bold text-lg mb-2">AI Tour Organizer</h3>
            <p className="text-sm text-gray-600">
              Plan optimal property visit routes with AI. Coordinate with
              landlords and tour with friends.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#FAF9F6] p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-5 w-5 text-green-700" />
            </div>
            <h3 className="font-bold text-lg mb-2">Safety Scores</h3>
            <p className="text-sm text-gray-600">
              Comprehensive safety ratings based on location, landlord
              reputation, and building features.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#FAF9F6] p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-5 w-5 text-blue-700" />
            </div>
            <h3 className="font-bold text-lg mb-2">AI Chatbot</h3>
            <p className="text-sm text-gray-600">
              Natural language search in Sinhala, Tamil, or English. Find places
              matching your lifestyle.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#FAF9F6] p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-5 w-5 text-orange-700" />
            </div>
            <h3 className="font-bold text-lg mb-2">Group Search</h3>
            <p className="text-sm text-gray-600">
              Search as solo, with 2-3 friends, or larger groups. AI calculates
              per-person costs.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#FAF9F6] p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Utensils className="h-5 w-5 text-red-700" />
            </div>
            <h3 className="font-bold text-lg mb-2">Food Integration</h3>
            <p className="text-sm text-gray-600">
              See meal options, kitchen access, and nearby restaurants for every
              listing.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-[#FAF9F6] p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-5 w-5 text-teal-700" />
            </div>
            <h3 className="font-bold text-lg mb-2">Verified Listings</h3>
            <p className="text-sm text-gray-600">
              Every property is verified. Student reviews from actual residents
              only.
            </p>
          </div>
        </div>
      </section>

      {/* POPULAR LISTINGS */}
      <section className="bg-[#EFEBE9]/30 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="text-xs font-bold text-[#795548] uppercase tracking-widest mb-2">
                Featured Listings
              </div>
              <h2 className="text-3xl font-bold text-[#3E2723]">
                Popular Near UCSC
              </h2>
            </div>
            <button
              onClick={() => onNavigate('rooms')}
              className="hidden md:flex items-center gap-2 text-sm font-bold text-[#3E2723] bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              View All Listings <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onViewDetails={onViewRoom}
                isInTour={tourPlannerRoomIds.includes(room.id)}
                onToggleTour={onToggleTourRoom}
                isFavourite={favouriteRoomIds.includes(room.id)}
                onToggleFavourite={onToggleFavourite}
              />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <button
              onClick={() => onNavigate('rooms')}
              className="inline-flex items-center gap-2 bg-white text-[#3E2723] px-6 py-3 rounded-full font-bold shadow-sm"
            >
              View All Listings <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-bold text-[#795548] uppercase tracking-widest mb-2">
            How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3E2723]">
            Your Journey to Finding a Home
          </h2>
          <p className="text-gray-600 mt-4">
            From search to move-in, we've streamlined every step of finding
            student accommodation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-[#D7CCC8] -z-10"></div>

          {/* Step 1 */}
          <div className="text-center">
            <div
              className="w-24 h-24 bg-[#5D4037] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg relative z-10 step-icon"
              style={{ '--jiggle-base': '3deg' } as React.CSSProperties}
            >
              <Search className="h-10 w-10 text-white" />
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#D7CCC8] rounded-full flex items-center justify-center text-[#3E2723] font-bold text-sm border-2 border-white">
                01
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Search & Filter</h3>
            <p className="text-sm text-gray-600 px-4">
              Use our smart search with filters for budget, location, group
              size, and amenities.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div
              className="w-24 h-24 bg-[#5D4037] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg relative z-10 step-icon step-icon-delay-1"
              style={{ '--jiggle-base': '-2deg' } as React.CSSProperties}
            >
              <Calendar className="h-10 w-10 text-white" />
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#D7CCC8] rounded-full flex items-center justify-center text-[#3E2723] font-bold text-sm border-2 border-white">
                02
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Plan Your Tour</h3>
            <p className="text-sm text-gray-600 px-4">
              Add properties to your tour list. Our AI plans the optimal route
              and coordinates with landlords.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div
              className="w-24 h-24 bg-[#5D4037] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg relative z-10 step-icon step-icon-delay-2"
              style={{ '--jiggle-base': '1deg' } as React.CSSProperties}
            >
              <Home className="h-10 w-10 text-white" />
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#D7CCC8] rounded-full flex items-center justify-center text-[#3E2723] font-bold text-sm border-2 border-white">
                03
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Visit & Compare</h3>
            <p className="text-sm text-gray-600 px-4">
              Tour properties with friends using shared notes. Rate each visit
              and compare your options.
            </p>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div
              className="w-24 h-24 bg-[#5D4037] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg relative z-10 step-icon step-icon-delay-3"
              style={{ '--jiggle-base': '-3deg' } as React.CSSProperties}
            >
              <Check className="h-10 w-10 text-white" />
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#D7CCC8] rounded-full flex items-center justify-center text-[#3E2723] font-bold text-sm border-2 border-white">
                04
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Book Securely</h3>
            <p className="text-sm text-gray-600 px-4">
              Found your place? Complete the booking with secure payments and
              verified lease agreements.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS CAROUSEL */}
      <section className="bg-[#EFEBE9]/50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-[#795548] uppercase tracking-widest mb-2">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E2723]">
              Loved by UCSC Students
            </h2>
            <p className="text-gray-600 mt-4">
              Real stories from students who found their perfect accommodation
              through FindItMate.
            </p>
          </div>

          {/* Manual Carousel with Arrows */}
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => {
                const carousel = document.getElementById('testimonial-track');
                if (carousel) carousel.scrollBy({ left: -380, behavior: 'smooth' });
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#D7CCC8] transition-colors duration-200 -ml-4 md:-ml-6"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6 text-[#3E2723]" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => {
                const carousel = document.getElementById('testimonial-track');
                if (carousel) carousel.scrollBy({ left: 380, behavior: 'smooth' });
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#D7CCC8] transition-colors duration-200 -mr-4 md:-mr-6"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6 text-[#3E2723]" />
            </button>

            {/* Testimonials Track */}
            <div
              id="testimonial-track"
              className="flex gap-6 overflow-x-auto scroll-smooth px-8 py-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[
                { name: "Kavindi Perera", dept: "2nd Year, Computer Science", quote: "Found my place in just 2 days! The AI tour planner saved me so much time. I visited 5 hostels in one afternoon, all perfectly planned.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 5 },
                { name: "Dinesh Jayawardena", dept: "3rd Year, Information Systems", quote: "The safety scores gave my parents peace of mind. They loved that I could show them verified information about the landlord and neighborhood.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 5 },
                { name: "Tharushi Silva", dept: "1st Year, Data Science", quote: "Me and my friends searched together using the group feature. The per-person cost calculator made comparing options so easy!", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 5 },
                { name: "Ruwan Fernando", dept: "4th Year, Software Engineering", quote: "Best platform for student housing! The virtual tours saved me a trip from Kandy. Signed my lease online in minutes.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 5 },
                { name: "Nethmi Wickrama", dept: "2nd Year, Business IT", quote: "The chat feature let me negotiate directly with landlords. Got a great deal on a room just 5 minutes from campus!", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 4 },
                { name: "Sandun Rathnayake", dept: "3rd Year, Network Engineering", quote: "Finally, a platform that understands student budgets! Found an affordable room with all amenities included.", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 5 },
                { name: "Dilini Senanayake", dept: "1st Year, Cyber Security", quote: "As a first-year student, I was nervous about finding housing. FindItMate made it simple and stress-free!", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 5 },
                { name: "Amith Bandara", dept: "4th Year, AI & Machine Learning", quote: "The map view helped me find places near my favorite cafes and the library. Location search is incredibly precise!", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 4 },
                { name: "Sachini Gamage", dept: "2nd Year, Statistics", quote: "Loved the review system! Reading honest feedback from other students helped me avoid some sketchy places.", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 5 },
                { name: "Chamath Liyanage", dept: "3rd Year, Computer Science", quote: "The landlord verification gave me confidence. Knowing they're verified by UCSC students made all the difference.", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 5 },
              ].map((t, idx) => (
                <div key={idx} className="flex-shrink-0 w-[350px]">
                  <div className="testimonial-card-premium">
                    {/* Centered Avatar at Top */}
                    <div className="flex justify-center mb-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img
                          src={t.img}
                          alt={t.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    {/* Name & Role */}
                    <div className="text-center mb-4">
                      <div className="font-bold text-lg text-[#3E2723]">{t.name}</div>
                      <div className="text-sm text-[#795548]">{t.dept}</div>
                    </div>
                    {/* Divider */}
                    <div className="w-12 h-1 bg-gradient-to-r from-[#D7CCC8] to-[#795548] mx-auto mb-4 rounded-full"></div>
                    {/* Quote */}
                    <p className="text-gray-600 text-center text-sm leading-relaxed mb-4 px-2">
                      "{t.quote}"
                    </p>
                    {/* Stars */}
                    <div className="flex justify-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < t.stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <button
                  key={i}
                  onClick={() => {
                    const carousel = document.getElementById('testimonial-track');
                    if (carousel) carousel.scrollTo({ left: i * 380, behavior: 'smooth' });
                  }}
                  className="w-2 h-2 rounded-full bg-[#D7CCC8] hover:bg-[#795548] transition-colors duration-200"
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM CTA */}
      <section className="bg-[#D7CCC8] py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[#3E2723] mb-6">
            Unlock Premium <br />
            Features with a Subscription
          </h2>
          <p className="text-[#5D4037] text-lg mb-10 max-w-2xl mx-auto">
            Get access to advanced search, priority support, and more for
            landlords and students.
          </p>
          <button
            onClick={() => {
              if (!user) {
                onNavigate('login')
              } else {
                onOpenSubscription()
              }
            }}
            className="bg-[#3E2723] text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-[#2D1B18] hover:scale-105 transition-all"
          >
            View Subscription Plans
          </button>
        </div>
      </section>

      {/* DUAL CTA */}
      <section className="bg-[#3E2723] py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student CTA */}
          <div className="bg-[#4E342E] rounded-3xl p-10 md:p-14 flex flex-col items-start border border-[#5D4037]">
            <div className="bg-white/10 p-3 rounded-xl mb-6">
              <UserIcon className="h-8 w-8 text-[#D7CCC8]" />
            </div>
            <div className="text-[#D7CCC8] font-medium mb-2">For Students</div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Start Your Search Today
            </h3>
            <p className="text-gray-300 mb-8 max-w-md">
              Join thousands of students who found their perfect home through
              our platform. Create a free account and let our AI help you find
              the ideal place.
            </p>
            <button
              onClick={() => {
                if (!user) {
                  onNavigate('login')
                } else {
                  onNavigate('rooms')
                }
              }}
              className="bg-white text-[#3E2723] px-6 py-3 rounded-full font-bold hover:bg-[#D7CCC8] transition-colors flex items-center gap-2"
            >
              Find Your Home <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Landlord CTA */}
          <div className="bg-[#F5F0E8] rounded-3xl p-10 md:p-14 flex flex-col items-start">
            <div className="bg-[#3E2723]/10 p-3 rounded-xl mb-6">
              <Home className="h-8 w-8 text-[#3E2723]" />
            </div>
            <div className="text-[#5D4037] font-medium mb-2">For Landlords</div>
            <h3 className="text-3xl font-bold text-[#3E2723] mb-4">
              List Your Property
            </h3>
            <p className="text-gray-600 mb-8 max-w-md">
              Reach verified student tenants directly. Manage inquiries,
              schedule tours, and track performance with our Property Command
              Center.
            </p>
            <button
              onClick={() => {
                if (!user) {
                  onNavigate('landlord-login')
                } else if (user.type === 'landlord') {
                  onNavigate('landlord-dashboard')
                } else {
                  onNavigate('landlord-login')
                }
              }}
              className="bg-[#3E2723] text-white px-6 py-3 rounded-full font-bold hover:bg-[#2D1B18] transition-colors flex items-center gap-2"
            >
              Start Listing Free <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
