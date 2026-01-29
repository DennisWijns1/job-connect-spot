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
  low: 'bg-success/15 text-success',
  medium: 'bg-accent/20 text-accent-foreground',
  high: 'bg-destructive/15 text-destructive',
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
        'bg-card rounded-[32px] shadow-xl overflow-hidden cursor-pointer h-full flex flex-col',
        className
      )}
    >
      {/* Photo Section - Fills available space with 4:5 aspect */}
      <div className="relative flex-1 min-h-0">
        <img
          src={mainPhoto}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        
        {/* Urgency Badge - Top left */}
        <div className="absolute top-4 left-4">
          <Badge className={cn('font-bold shadow-md', urgencyStyles[project.urgency])}>
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            {urgencyLabels[project.urgency]}
          </Badge>
        </div>

        {/* Category Badge - Top right */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-primary text-primary-foreground font-bold shadow-md">
            {project.category}
          </Badge>
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Title and location overlay at bottom of image */}
        <div className="absolute bottom-5 left-5 right-5">
          <h3 className="font-display font-extrabold text-2xl text-white mb-2 line-clamp-2">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
            <MapPin className="w-4 h-4" />
            {project.location}
          </div>
        </div>
      </div>

      {/* Minimal Content - Only essential info */}
      <div className="p-5 flex items-center justify-between bg-card">
        {/* Time posted */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
          <Clock className="w-4 h-4" />
          {formatDistanceToNow(project.postedAt, { addSuffix: true, locale: nl })}
        </div>

        {/* Posted by */}
        <span className="font-bold text-foreground text-sm">
          {project.postedBy}
        </span>
      </div>
    </div>
  );
};
