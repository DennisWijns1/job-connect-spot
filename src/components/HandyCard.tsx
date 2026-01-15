import { HandyProfile } from '@/types/handymatch';
import { HammerRating } from './HammerRating';
import { MapPin, Shield, Briefcase, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HandyCardProps {
  handy: HandyProfile;
  className?: string;
}

export const HandyCard = ({ handy, className }: HandyCardProps) => {
  return (
    <div
      className={cn(
        'card-elevated overflow-hidden w-full max-w-sm mx-auto',
        className
      )}
    >
      {/* Photo Section */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={handy.avatar}
          alt={handy.name}
          className="w-full h-full object-cover"
        />
        
        {/* Online Indicator */}
        {handy.isOnline && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-success/90 text-success-foreground px-3 py-1.5 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-white pulse-online" />
            Online
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {handy.isVerified && (
            <div className="trust-badge">
              <Shield className="w-3.5 h-3.5" />
              Geverifieerd
            </div>
          )}
          {handy.isProfessional && (
            <div className="trust-badge bg-accent/10 text-accent">
              <Briefcase className="w-3.5 h-3.5" />
              Professioneel
            </div>
          )}
        </div>

        {/* Distance */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-foreground flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary" />
          {handy.distance} km
        </div>

        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Info Section */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-display font-bold text-xl text-foreground">
              {handy.name}
            </h3>
            <p className="text-primary font-medium">{handy.specialty}</p>
          </div>
          <div className="text-right">
            {handy.isQuoteBased ? (
              <span className="text-sm font-medium text-secondary">
                Offerte op maat
              </span>
            ) : (
              <div>
                <span className="text-2xl font-bold text-foreground">
                  €{handy.hourlyRate}
                </span>
                <span className="text-muted-foreground text-sm">/uur</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <HammerRating rating={handy.rating} size="md" />
          <span className="text-sm font-semibold text-foreground">
            {handy.rating}
          </span>
          <span className="text-muted-foreground text-sm">
            ({handy.reviewCount} reviews)
          </span>
        </div>

        {/* Description */}
        <p className="text-secondary text-sm mb-4 line-clamp-2">
          {handy.description}
        </p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {handy.specialties.slice(0, 3).map((spec) => (
            <Badge
              key={spec}
              variant="secondary"
              className="bg-background text-secondary text-xs"
            >
              {spec}
            </Badge>
          ))}
          {handy.specialties.length > 3 && (
            <Badge variant="secondary" className="bg-background text-muted-foreground text-xs">
              +{handy.specialties.length - 3}
            </Badge>
          )}
        </div>

        {/* Experience Badge */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {handy.experience}
        </div>
      </div>

    </div>
  );
};
