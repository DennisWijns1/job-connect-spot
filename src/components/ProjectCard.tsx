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
  return (
    <div
      className={cn(
        'card-elevated overflow-hidden w-full max-w-sm mx-auto',
        className
      )}
    >
      {/* Photo Section */}
      {project.photos.length > 0 && (
        <div className="relative h-56 overflow-hidden">
          <img
            src={project.photos[0]}
            alt={project.title}
            className="w-full h-full object-cover"
          />

          {/* Urgency Badge */}
          <div className="absolute top-4 left-4">
            <Badge className={cn('font-medium', urgencyStyles[project.urgency])}>
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              {urgencyLabels[project.urgency]}
            </Badge>
          </div>

          {/* Category */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary text-primary-foreground">
              {project.category}
            </Badge>
          </div>

          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Info Section */}
      <div className="p-5">
        <h3 className="font-display font-bold text-xl text-foreground mb-2">
          {project.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {project.location}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {formatDistanceToNow(project.postedAt, { addSuffix: true, locale: nl })}
          </div>
        </div>

        {/* Posted by */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Geplaatst door <span className="font-medium text-foreground">{project.postedBy}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
