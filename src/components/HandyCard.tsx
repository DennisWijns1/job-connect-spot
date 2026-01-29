import { Shield, Award, Clock, Euro, MapPin } from 'lucide-react';
import { HandyProfile } from '@/types/handymatch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HandyCardProps {
  handy: HandyProfile;
  onClick?: () => void;
  className?: string;
}

export const HandyCard = ({ handy, onClick, className }: HandyCardProps) => {
  // Use first work photo as main image, fallback to avatar
  const mainPhoto = handy.workPhotos.length > 0 ? handy.workPhotos[0] : handy.avatar;

  return (
    <div 
      className={cn(
        'relative w-full h-full rounded-[32px] overflow-hidden shadow-xl cursor-pointer bg-card',
        className
      )}
      onClick={onClick}
    >
      {/* Full-bleed image with 4:5 aspect */}
      <div className="absolute inset-0">
        <img
          src={mainPhoto}
          alt={`Werk van ${handy.name}`}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Online indicator - top right */}
      {handy.isOnline && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 z-10 shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-800">Online</span>
        </div>
      )}
      
      {/* Professional badge - top left */}
      {handy.isProfessional && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-primary text-primary-foreground border-none shadow-lg font-bold px-3 py-1">
            <Award className="w-3.5 h-3.5 mr-1" />
            Pro
          </Badge>
        </div>
      )}

      {/* Gradient overlay - bottom half for content */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

      {/* Content overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 p-6 z-10">
        {/* Avatar and name row */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={handy.avatar}
            alt={handy.name}
            className="w-16 h-16 rounded-full object-cover border-3 border-white/90 shadow-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-2xl text-white truncate">
                {handy.name}
              </h3>
              {handy.isVerified && (
                <Shield className="w-5 h-5 text-accent fill-accent/30 flex-shrink-0" />
              )}
            </div>
            <p className="text-white/85 text-sm font-semibold truncate">{handy.specialty}</p>
          </div>
        </div>

        {/* Icon-based info row */}
        <div className="flex items-center justify-between">
          {/* Rating with hammers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "text-base",
                  i < Math.floor(handy.rating) ? "" : "opacity-30 grayscale"
                )}
              >
                🔨
              </span>
            ))}
            <span className="text-white/70 text-xs font-medium ml-1">({handy.reviewCount})</span>
          </div>

          {/* Price icon-based */}
          <div className="flex items-center gap-1.5 text-white">
            {handy.isQuoteBased ? (
              <span className="text-sm text-white/70 italic font-medium">Op maat</span>
            ) : (
              <>
                <Euro className="w-4 h-4 text-accent" />
                <span className="font-extrabold text-xl">{handy.hourlyRate}</span>
                <Clock className="w-3.5 h-3.5 text-white/50 ml-0.5" />
              </>
            )}
          </div>
        </div>

        {/* Distance indicator */}
        <div className="flex items-center gap-1 mt-3 text-white/65 text-xs font-medium">
          <MapPin className="w-3.5 h-3.5" />
          <span>{handy.distance} km</span>
        </div>
      </div>
    </div>
  );
};
