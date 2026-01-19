import { Shield, Award } from 'lucide-react';
import { HandyProfile } from '@/types/handymatch';
import { HammerRating } from './HammerRating';
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
        'bg-card rounded-3xl shadow-card overflow-hidden border border-border cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Work Photo - Larger display */}
      <div className="relative h-64">
        <img
          src={mainPhoto}
          alt={`Werk van ${handy.name}`}
          className="w-full h-full object-cover"
        />
        
        {/* Online indicator */}
        {handy.isOnline && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-700">Online</span>
          </div>
        )}
        
        {/* Professional badge */}
        {handy.isProfessional && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-primary-foreground border-none shadow-md">
              <Award className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Name and avatar overlay at bottom of image */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
          <img
            src={handy.avatar}
            alt={handy.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg text-white truncate">
                {handy.name}
              </h3>
              {handy.isVerified && (
                <Shield className="w-4 h-4 text-white fill-white/30 flex-shrink-0" />
              )}
            </div>
            <p className="text-white/80 text-sm">{handy.specialty}</p>
          </div>
        </div>
      </div>

      {/* Minimal Content - Only essential info */}
      <div className="p-4 flex items-center justify-between">
        {/* Rating */}
        <HammerRating rating={handy.rating} size="sm" showCount reviewCount={handy.reviewCount} />

        {/* Price */}
        <div className="font-display font-bold text-lg text-foreground">
          {handy.isQuoteBased ? (
            <span className="text-sm text-muted-foreground">Offerte op maat</span>
          ) : (
            <span>€{handy.hourlyRate}<span className="text-sm font-normal text-muted-foreground">/uur</span></span>
          )}
        </div>
      </div>
    </div>
  );
};
