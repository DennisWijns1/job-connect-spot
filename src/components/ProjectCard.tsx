import { Project } from '@/types/handymatch';
import { MapPin, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ProjectCardProps {
  project: Project;
  className?: string;
}

const urgencyStyles = {
  low: 'bg-success/10 text-success',
  medium: 'bg-accent/10 text-accent',
  high: 'bg-destructive/10 text-destructive',
};

const urgencyLabels = {
  low: 'Niet dringend',
  medium: 'Gemiddeld',
  high: 'Dringend!',
};

export const ProjectCard = ({ project, className }: ProjectCardProps) => {
  // Use first project photo as main image
  const mainPhoto = project.photos.length > 0 ? project.photos[0] : 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop';

  return (
    <div 
      className={cn(
        'bg-card rounded-3xl shadow-card overflow-hidden border border-border cursor-pointer h-full flex flex-col',
        className
      )}
    >
      {/* Photo Section - Fills available space (same as HandyCard) */}
      <div className="relative flex-1 min-h-0">
        <img
          src={mainPhoto}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        
        {/* Urgency Badge - Top left */}
        <div className="absolute top-4 left-4">
          <Badge className={cn('font-medium', urgencyStyles[project.urgency])}>
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            {urgencyLabels[project.urgency]}
          </Badge>
        </div>

        {/* Category Badge - Top right */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-primary text-primary-foreground">
            {project.category}
          </Badge>
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Title and location overlay at bottom of image */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display font-bold text-xl text-white mb-1 line-clamp-2">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <MapPin className="w-4 h-4" />
            {project.location}
          </div>
        </div>
      </div>

      {/* Minimal Content - Only essential info (same as HandyCard) */}
      <div className="p-4 flex items-center justify-between">
        {/* Time posted */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {formatDistanceToNow(project.postedAt, { addSuffix: true, locale: nl })}
        </div>

        {/* Posted by */}
        <span className="font-medium text-foreground text-sm">
          {project.postedBy}
        </span>
      </div>
    </div>
  );
};
