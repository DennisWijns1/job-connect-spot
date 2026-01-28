import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, X, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FollowedPerson {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  type: 'handy' | 'instructor';
}

// Mock data - zou uit database komen
const mockFollowed: FollowedPerson[] = [
  { id: '1', name: 'Jan Peeters', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', specialty: 'Loodgieter', rating: 4.8, type: 'handy' },
  { id: '2', name: 'Mieke Janssen', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', specialty: 'Elektricien', rating: 4.9, type: 'handy' },
  { id: '3', name: 'Peter Van den Berg', avatar: 'https://randomuser.me/api/portraits/men/55.jpg', specialty: 'Dakdekker', rating: 4.7, type: 'handy' },
];

interface InstructorHeaderProps {
  title: string;
  showBack?: boolean;
}

export const InstructorHeader = ({ title, showBack }: InstructorHeaderProps) => {
  const navigate = useNavigate();
  const [showFavorites, setShowFavorites] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground safe-area-top">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {showBack && (
              <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {/* Logo met oranje accent */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">HM</span>
              </div>
              <h1 className="font-display font-bold text-lg">{title}</h1>
            </div>
          </div>

          <button 
            onClick={() => setShowFavorites(!showFavorites)}
            className="w-10 h-10 rounded-xl bg-accent/30 border border-accent/40 flex items-center justify-center hover:bg-accent/40 transition-colors relative"
          >
            <Star className="w-5 h-5 text-white fill-accent" />
            {mockFollowed.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                {mockFollowed.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Favorites Dropdown */}
      <AnimatePresence>
        {showFavorites && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowFavorites(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, x: 10 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -10, x: 10 }}
              className="fixed top-16 right-4 w-80 bg-card rounded-2xl shadow-card border border-border z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  Mijn favorieten
                </h3>
                <button 
                  onClick={() => setShowFavorites(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <ScrollArea className="max-h-80">
                {mockFollowed.length === 0 ? (
                  <div className="p-6 text-center">
                    <Star className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Je volgt nog niemand</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {mockFollowed.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => {
                          setShowFavorites(false);
                          navigate(`/profile/${person.id}`);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                      >
                        <img 
                          src={person.avatar} 
                          alt={person.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">{person.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{person.specialty}</span>
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-accent fill-accent" />
                              {person.rating}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
