import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  Fragment } from
'react';
import {
  X,
  Upload,
  User,
  Check,
  MapPin,
  ChevronRight,
  ChevronLeft,
  BedDouble,
  Sofa,
  UtensilsCrossed,
  ShieldCheck,
  Building,
  Sparkles } from
'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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
interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (property: {
    title: string;
    address: string;
    rent: string;
    deposit: string;
    images: File[];
    numberOfPeople: string;
    utilitiesCost: string;
    foodCost: string;
    transportCost: string;
    totalBudget: string;
    amenities: string[];
    lat?: number;
    lng?: number;
  }) => void;
}
const WIZARD_CATEGORIES = [
{
  id: 'room',
  label: 'Room Amenities',
  icon: BedDouble,
  items: [
  'WiFi',
  'AC',
  'Hot Water',
  'Attached Bath',
  'Ceiling Fan',
  'Balcony',
  'Wardrobe',
  'Study Desk',
  'Bookshelf']

},
{
  id: 'furniture',
  label: 'Furniture',
  icon: Sofa,
  items: [
  'Bed Frame',
  'Mattress',
  'Chair',
  'Table',
  'Sofa',
  'Curtains',
  'Mirror',
  'Shoe Rack']

},
{
  id: 'kitchen',
  label: 'Kitchen & Food',
  icon: UtensilsCrossed,
  items: [
  'Kitchen Access',
  'Meals Included',
  'Fridge',
  'Microwave',
  'Water Dispenser',
  'Dining Area']

},
{
  id: 'safety',
  label: 'Safety & Security',
  icon: ShieldCheck,
  items: [
  'CCTV',
  '24/7 Security Guard',
  'Fire Extinguisher',
  'Smoke Detector',
  'First Aid Kit',
  'Emergency Exit',
  'Gated Compound',
  'Female-Only Floor']

},
{
  id: 'facilities',
  label: 'Facilities',
  icon: Building,
  items: [
  'Laundry',
  'Parking',
  'Gym',
  'Study Area',
  'Common Room',
  'Garden',
  'Rooftop Access',
  'Elevator']

}];

function LocationMarker({
  position,
  setPosition,
  setAddress




}: {position: L.LatLng | null;setPosition: (pos: L.LatLng) => void;setAddress: (addr: string) => void;}) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setAddress(
        `Selected Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`
      );
    }
  });
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  return position === null ? null : <Marker position={position}></Marker>;
}
export function AddPropertyModal({
  isOpen,
  onClose,
  onSubmit
}: AddPropertyModalProps) {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('Solo');
  // Map State
  const [mapPosition, setMapPosition] = useState<L.LatLng | null>(null);
  const [showMap, setShowMap] = useState(false);
  // Estimated costs
  const [utilitiesCost, setUtilitiesCost] = useState('');
  const [foodCost, setFoodCost] = useState('');
  const [transportCost, setTransportCost] = useState('');
  const [totalBudget, setTotalBudget] = useState('0');
  // Amenities & Wizard
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Auto-calculate total budget
  useEffect(() => {
    const rentVal = parseFloat(rent) || 0;
    const utilVal = parseFloat(utilitiesCost) || 0;
    const foodVal = parseFloat(foodCost) || 0;
    const transVal = parseFloat(transportCost) || 0;
    const total = rentVal + utilVal + foodVal + transVal;
    setTotalBudget(total > 0 ? `Rs. ${total.toLocaleString()}` : '');
  }, [rent, utilitiesCost, foodCost, transportCost]);
  const resetForm = () => {
    setTitle('');
    setAddress('');
    setRent('');
    setDeposit('');
    setNumberOfPeople('Solo');
    setUtilitiesCost('');
    setFoodCost('');
    setTransportCost('');
    setTotalBudget('');
    setSelectedAmenities([]);
    setImages([]);
    setMapPosition(null);
    setShowMap(false);
  };
  const handleClose = () => {
    resetForm();
    onClose();
  };
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && address && rent && deposit) {
      onSubmit({
        title,
        address,
        rent,
        deposit,
        images,
        numberOfPeople,
        utilitiesCost,
        foodCost,
        transportCost,
        totalBudget,
        amenities: selectedAmenities,
        lat: mapPosition?.lat,
        lng: mapPosition?.lng
      });
      handleClose();
    }
  };
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter(
      (file) =>
      (file.type === 'image/png' || file.type === 'image/jpeg') &&
      file.size <= 5 * 1024 * 1024
    );
    setImages((prev) => [...prev, ...validFiles]);
  }, []);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
    prev.includes(amenity) ?
    prev.filter((a) => a !== amenity) :
    [...prev, amenity]
    );
  };
  const computeSafetyScore = (): number => {
    const safetyCategory = WIZARD_CATEGORIES.find((c) => c.id === 'safety');
    if (!safetyCategory) return 0;
    const selectedSafetyItems = safetyCategory.items.filter((item) =>
    selectedAmenities.includes(item)
    );
    return (
      Math.round(
        selectedSafetyItems.length / safetyCategory.items.length * 100
      ) / 10);

  };
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}>

      <div className="relative w-full max-w-3xl bg-[#F5F0E8] rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#D7CCC8] flex justify-between items-center bg-[#F5F0E8] sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">
              Add New Property
            </h1>
            <p className="text-[#795548] text-sm">
              Fill in the details to list your property
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-[#3E2723]/10 text-[#3E2723] transition-colors">

            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* 1. Property Images */}
          <div>
            <label className="block text-sm font-medium text-[#3E2723] mb-2">
              Property Images
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragging ? 'border-[#795548] bg-[#D7CCC8]/30' : 'border-[#D7CCC8] bg-[#FAF9F6] hover:border-[#A1887F]'}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}>

              <Upload className="h-8 w-8 text-[#A1887F] mx-auto mb-3" />
              <p className="text-sm text-[#5D4037]">
                Click to upload images or drag and drop
              </p>
              <p className="text-xs text-[#A1887F] mt-1">
                PNG, JPG up to 5MB each
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden" />

            </div>

            {/* Image Previews */}
            {images.length > 0 &&
            <div className="flex flex-wrap gap-3 mt-3">
                {images.map((file, index) =>
              <div key={index} className="relative group">
                    <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-20 h-20 object-cover rounded-xl border border-[#D7CCC8]" />

                    <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-[#D32F2F] text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">

                      ×
                    </button>
                  </div>
              )}
              </div>
            }
          </div>

          {/* 2. Basic Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3E2723] mb-1">
                Property Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Modern Single Room near UCSC"
                required
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548]" />

            </div>

            <div>
              <label className="block text-sm font-medium text-[#3E2723] mb-1">
                Address *
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full address"
                  required
                  className="flex-1 px-4 py-3 bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548]" />

                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="px-4 py-3 bg-[#C1B0A4] text-[#3E2723] font-medium rounded-xl hover:bg-[#A1887F] transition-colors flex items-center gap-2 whitespace-nowrap">

                  <MapPin className="h-4 w-4" />
                  Verify Location
                </button>
              </div>

              {showMap &&
              <div className="mt-3 h-[200px] w-full rounded-xl overflow-hidden border border-[#D7CCC8] relative z-0 animate-in fade-in slide-in-from-top-2">
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
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                    <LocationMarker
                    position={mapPosition}
                    setPosition={setMapPosition}
                    setAddress={setAddress} />

                  </MapContainer>
                  <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs text-[#3E2723] z-[1000]">
                    Click map to set location
                  </div>
                </div>
              }
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-1">
                  Monthly Rent (Rs.) *
                </label>
                <input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  placeholder="12000"
                  required
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548]" />

              </div>
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-1">
                  Deposit (Rs.) *
                </label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="24000"
                  required
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548]" />

              </div>
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-1">
                  Number of People
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#795548]" />
                  <select
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#795548] appearance-none">

                    <option value="Solo">Solo</option>
                    <option value="2 People">2 People</option>
                    <option value="3 People">3 People</option>
                    <option value="4+ People">4+ People</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Estimated Monthly Cost */}
          <div className="pt-6 border-t border-[#D7CCC8]">
            <h3 className="text-xl font-bold text-[#3E2723] mb-4">
              Estimated monthly cost
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-1">
                  Utilities cost (Rs.) *
                </label>
                <input
                  type="number"
                  value={utilitiesCost}
                  onChange={(e) => setUtilitiesCost(e.target.value)}
                  placeholder="12000"
                  required
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548]" />

              </div>
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-1">
                  Food cost (Rs.) *
                </label>
                <input
                  type="number"
                  value={foodCost}
                  onChange={(e) => setFoodCost(e.target.value)}
                  placeholder="12000"
                  required
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548]" />

              </div>
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-1">
                  Transport cost (Rs.) *
                </label>
                <input
                  type="number"
                  value={transportCost}
                  onChange={(e) => setTransportCost(e.target.value)}
                  placeholder="12000"
                  required
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#D7CCC8] rounded-xl text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548]" />

              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3E2723] mb-1">
                Total estimated monthly budget (Rs.) *
              </label>
              <input
                type="text"
                value={totalBudget}
                readOnly
                placeholder="Rs. 24,000"
                className="w-full px-4 py-3 bg-[#EFEBE9] border border-[#D7CCC8] rounded-xl text-[#3E2723] font-medium focus:outline-none cursor-not-allowed" />

            </div>
          </div>

          {/* 4. Amenities & Features (Categorized List) */}
          <div className="pt-6 border-t border-[#D7CCC8]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#3E2723]">
                Amenities & Features
              </h3>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#D7CCC8]">
                <ShieldCheck className="h-4 w-4 text-[#3E2723]" />
                <span className="text-xs font-medium text-[#5D4037]">
                  Safety Score:{' '}
                  <span
                    className={`font-bold ${computeSafetyScore() >= 7 ? 'text-green-600' : 'text-[#3E2723]'}`}>

                    {computeSafetyScore()}/10
                  </span>
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {WIZARD_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    className="bg-white rounded-xl border border-[#D7CCC8] overflow-hidden">

                    <div className="bg-[#EFEBE9] px-4 py-3 border-b border-[#D7CCC8] flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#5D4037]" />
                      <h4 className="font-bold text-[#3E2723] text-sm">
                        {category.label}
                      </h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {category.items.map((item) => {
                        const isSelected = selectedAmenities.includes(item);
                        return (
                          <label
                            key={item}
                            className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-[#F5F0E8]' : 'hover:bg-[#FAF9F6]'}`}>

                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#3E2723] border-[#3E2723]' : 'bg-white border-[#D7CCC8]'}`}>

                              {isSelected &&
                              <Check className="h-3 w-3 text-white" />
                              }
                            </div>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={isSelected}
                              onChange={() => toggleAmenity(item)} />

                            <span
                              className={`text-sm ${isSelected ? 'text-[#3E2723] font-medium' : 'text-[#5D4037]'}`}>

                              {item}
                            </span>
                          </label>);

                      })}
                    </div>
                  </div>);

              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#D7CCC8]">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 rounded-xl text-[#3E2723] font-medium border border-[#D7CCC8] hover:bg-[#E8E0D5] transition-colors bg-white">

              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-[#3E2723] text-white font-medium hover:bg-[#2D1B18] transition-colors shadow-lg">

              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>);

}