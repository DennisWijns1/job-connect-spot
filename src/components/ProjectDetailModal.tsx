import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, AlertTriangle, ChevronLeft, ChevronRight, Hammer } from 'lucide-react';
import { useState } from 'react';
import { Project } from '@/types/handymatch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { toast } from 'sonner';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export const ProjectDetailModal = ({ project, isOpen, onClose, onApply }: ProjectDetailModalProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!project) return null;

  const photos = project.photos.length > 0 ? project.photos : ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop'];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleApply = () => {
    toast.success(`Je hebt je aangeboden voor "${project.title}"!`, {
      description: 'De klant ontvangt nu je aanvraag en kan je profiel bekijken.',
    });
    onApply();
  };

  const urgencyConfig = {
    low: { label: 'Niet dringend', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    medium: { label: 'Medium', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    high: { label: 'Dringend!', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 top-12 z-50 bg-background rounded-t-3xl overflow-hidden flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-foreground/20 backdrop-blur-sm flex items-center justify-center hover:bg-foreground/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Photo gallery */}
            <div className="relative h-72 bg-muted flex-shrink-0">
              <img
                src={photos[currentPhotoIndex]}
                alt={`Project foto ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6 text-foreground" />
                  </button>
                  
                  {/* Photo indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors shadow-sm ${
                          index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-background">
              {/* Urgency & Category badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={`${urgencyConfig[project.urgency].color} border`}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {urgencyConfig[project.urgency].label}
                </Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20 border">
                  {project.category}
                </Badge>
              </div>

              {/* Title */}
              <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                {project.title}
              </h2>

              {/* Meta info */}
              <div className="flex items-center gap-4 text-muted-foreground text-sm mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDistanceToNow(project.postedAt, { addSuffix: true, locale: nl })}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-3">
                  Beschrijving van het probleem
                </h3>
                <div className="bg-card rounded-2xl p-4 border border-border">
                  <p className="text-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Posted by */}
              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-semibold text-primary">{project.postedBy.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{project.postedBy}</p>
                    <p className="text-sm text-muted-foreground">Geplaatst {formatDistanceToNow(project.postedAt, { addSuffix: true, locale: nl })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="p-4 border-t border-border bg-card flex-shrink-0">
              <Button onClick={handleApply} className="w-full h-14 rounded-2xl text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground">
                <Hammer className="w-5 h-5 mr-2" />
                Ik bied mezelf aan voor deze klus
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
