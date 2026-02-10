import React from 'react';
import { Users, Bed, Star, ArrowRight, Plus, Check, Heart } from 'lucide-react';
import { Room } from '../types';
interface RoomCardProps {
  room: Room;
  onViewDetails: (roomId: string) => void;
  isInTour?: boolean;
  onToggleTour?: (roomId: string, e: React.MouseEvent) => void;
  isFavourite?: boolean;
  onToggleFavourite?: (roomId: string, e: React.MouseEvent) => void;
}
export function RoomCard({
  room,
  onViewDetails,
  isInTour,
  onToggleTour,
  isFavourite,
  onToggleFavourite
}: RoomCardProps) {
  return (
    <div
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1 cursor-pointer border border-gray-100"
      onClick={() => onViewDetails(room.id)}>

      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />


        {/* Rating Badge - Moved slightly to accommodate heart if needed, or keep as is */}
        <div className="absolute top-3 right-12 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
          <Star className="h-3 w-3 text-yellow-500 fill-current" />
          <span className="text-xs font-bold text-gray-800">{room.rating}</span>
        </div>

        {/* Favourite Button */}
        {onToggleFavourite &&
          <button
            onClick={(e) => onToggleFavourite(room.id, e)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-all z-10"
            title={isFavourite ? 'Remove from Favourites' : 'Add to Favourites'}>

            <Heart
              className={`h-4 w-4 transition-colors ${isFavourite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />

          </button>
        }

        {/* Add to Tour Planner Button */}
        {onToggleTour &&
          <button
            onClick={(e) => onToggleTour(room.id, e)}
            className={`absolute top-3 left-3 p-2 rounded-full shadow-md transition-all duration-200 z-10 ${isInTour ? 'bg-[#3E2723] text-white hover:bg-[#2D1B18]' : 'bg-white/90 text-[#3E2723] hover:bg-white hover:scale-110'}`}
            title={
              isInTour ? 'Remove from Tour Planner' : 'Add to Tour Planner'
            }>

            {isInTour ?
              <Check className="h-4 w-4" /> :

              <Plus className="h-4 w-4" />
            }
          </button>
        }
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-[#3E2723] group-hover:text-[#795548] transition-colors">
            {room.name}
          </h3>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {room.description}
        </p>

        {/* Features */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{room.capacity} Guests</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{room.type}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-[#3E2723]">
              LKR {room.price}
            </span>
            <span className="text-gray-500 text-sm">/night</span>
            {room.estimatedBudget &&
              <div className="text-[#A1887F] text-xs mt-1">
                Est. Budget: LKR {room.estimatedBudget.toLocaleString()}/=
              </div>
            }
          </div>
          <button className="flex items-center gap-1 text-[#795548] font-semibold text-sm group-hover:translate-x-1 transition-transform">
            View Details <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>);

}