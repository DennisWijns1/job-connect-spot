import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Shield, Award, Star, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { HandyProfile } from '@/types/handymatch';
import { HammerRating } from './HammerRating';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentQRModal } from './PaymentQRModal';

interface HandyDetailModalProps {
  handy: HandyProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: () => void;
}

// Mock reviews data
const mockReviews = [
  {
    id: '1',
    author: 'Sophie M.',
    rating: 5,
    text: 'Uitstekende service! Kwam op tijd en heeft het probleem snel opgelost. Zeer vriendelijk en professioneel.',
    date: '2 weken geleden',
  },
  {
    id: '2',
    author: 'Marc V.',
    rating: 4,
    text: 'Goed werk geleverd. Kleine vertraging maar verder helemaal tevreden.',
    date: '1 maand geleden',
  },
  {
    id: '3',
    author: 'Anna K.',
    rating: 5,
    text: 'Heel blij met het resultaat! Zeker aan te raden.',
    date: '2 maanden geleden',
  },
];

export const HandyDetailModal = ({ handy, isOpen, onClose, onContact }: HandyDetailModalProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!handy) return null;

  const photos = handy.workPhotos.length > 0 ? handy.workPhotos : [handy.avatar];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
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
            className="fixed inset-0 bg-black/50 z-50"
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
                alt={`Werk foto ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient overlay for better contrast */}
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
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <img
                  src={handy.avatar}
                  alt={handy.name}
                  className="w-16 h-16 rounded-full object-cover border-3 border-primary/20 shadow-lg ring-2 ring-white"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display font-bold text-xl text-foreground">
                      {handy.name}
                    </h2>
                    {handy.isVerified && (
                      <Shield className="w-5 h-5 text-primary fill-primary/20" />
                    )}
                  </div>
                  <p className="text-primary font-medium text-sm mb-2">{handy.specialty}</p>
                  <HammerRating rating={handy.rating} size="sm" showCount reviewCount={handy.reviewCount} />
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {handy.isProfessional && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 border font-medium">
                    <Award className="w-3 h-3 mr-1" />
                    Professioneel
                  </Badge>
                )}
                {handy.isVerified && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 border font-medium">
                    <Shield className="w-3 h-3 mr-1" />
                    Geverifieerd diploma
                  </Badge>
                )}
                <Badge variant="outline" className="text-muted-foreground border-border">
                  <MapPin className="w-3 h-3 mr-1" />
                  {handy.distance} km
                </Badge>
                <Badge variant="outline" className="text-muted-foreground border-border">
                  <Clock className="w-3 h-3 mr-1" />
                  {handy.experience}
                </Badge>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-4 mb-6 border border-primary/10">
                <div className="text-sm text-muted-foreground mb-1">Tarief</div>
                <div className="font-display font-bold text-2xl text-foreground">
                  {handy.isQuoteBased ? (
                    <span className="text-primary">Offerte op maat</span>
                  ) : (
                    <>
                      <span className="text-primary">€{handy.hourlyRate}</span>
                      <span className="text-base font-normal text-muted-foreground">/uur</span>
                    </>
                  )}
                </div>
              </div>

              {/* About */}
              <div className="mb-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-3">
                  Over {handy.name.split(' ')[0]}
                </h3>
                <div className="bg-card rounded-2xl p-4 border border-border">
                  <p className="text-foreground leading-relaxed">
                    {handy.description}
                  </p>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-3">
                  Specialiteiten
                </h3>
                <div className="flex flex-wrap gap-2">
                  {handy.specialties.map((specialty, index) => (
                    <Badge key={index} className="rounded-full bg-accent/10 text-accent border-accent/20 border font-medium">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="mb-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-3">
                  Reviews ({handy.reviewCount})
                </h3>
                <div className="space-y-3">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="bg-card rounded-2xl p-4 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">{review.author}</span>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-sm ${i < review.rating ? 'text-accent' : 'opacity-30'}`}>
                            🔨
                          </span>
                        ))}
                      </div>
                      <p className="text-muted-foreground text-sm">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work photos gallery */}
              {handy.workPhotos.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-3">
                    Uitgevoerde werken
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {handy.workPhotos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Werk ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="p-4 border-t border-border bg-card flex-shrink-0 space-y-3">
              {/* Payment QR Button */}
              <Button 
                onClick={() => setShowPaymentModal(true)} 
                variant="outline"
                className="w-full h-12 rounded-[20px] text-base font-medium border-2 border-primary/20 text-primary hover:bg-primary/5"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Betaal {handy.name.split(' ')[0]}
              </Button>
              
              {/* Contact Button */}
              <Button 
                onClick={onContact} 
                className="w-full h-14 rounded-[20px] text-base font-semibold btn-cta"
              >
                <span className="mr-2">💬</span>
                Start Gesprek
              </Button>
            </div>
          </motion.div>
          
          {/* Payment Modal */}
          <PaymentQRModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            recipientName={handy.name}
            recipientIBAN="BE71 0961 2345 6769"
            suggestedAmount={handy.hourlyRate}
          />
        </>
      )}
    </AnimatePresence>
  );
};
