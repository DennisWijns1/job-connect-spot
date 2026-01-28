import { useState } from 'react';
import { Search, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HammerRating } from './HammerRating';

interface FavoriteHandy {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  location: string;
}

// Mock data - zou uit database komen
const mockFavoriteHandies: FavoriteHandy[] = [
  { 
    id: '1', 
    name: 'Jan Peeters', 
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg', 
    specialty: 'Loodgieter', 
    rating: 4.8,
    reviewCount: 127,
    location: 'Leuven'
  },
  { 
    id: '2', 
    name: 'Mieke Janssen', 
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg', 
    specialty: 'Elektricien', 
    rating: 4.9,
    reviewCount: 89,
    location: 'Brussel'
  },
  { 
    id: '3', 
    name: 'Peter Van den Berg', 
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg', 
    specialty: 'Dakdekker', 
    rating: 4.7,
    reviewCount: 56,
    location: 'Antwerpen'
  },
  { 
    id: '4', 
    name: 'Lisa De Smet', 
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg', 
    specialty: 'Schilder', 
    rating: 4.6,
    reviewCount: 34,
    location: 'Gent'
  },
];

interface SwipeHeaderProps {
  title: string;
  showSearch?: boolean;
  showFavorites?: boolean;
  onOpenSearch?: () => void;
}

export const SwipeHeader = ({
  title,
  showSearch = false,
  showFavorites = false,
  onOpenSearch,
}: SwipeHeaderProps) => {
  const navigate = useNavigate();
  const [showFavoritesMenu, setShowFavoritesMenu] = useState(false);

  return (
    <>
      {/* Fixed height header: 64px (h-16) */}
      <header className="h-16 flex-shrink-0 z-40 bg-gradient-to-r from-primary via-primary/90 to-accent/80 text-primary-foreground">
        <div className="h-full flex items-center justify-between px-4">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">HM</span>
            </div>
            <h1 className="font-display font-bold text-lg truncate max-w-[200px]">
              {title}
            </h1>
          </div>

          {/* Right: Max 2 action icons (search + favorites) */}
          <div className="flex items-center gap-2">
            {showSearch && (
              <button
                onClick={onOpenSearch}
                className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                aria-label="Zoeken en filteren"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {showFavorites && (
              <button
                onClick={() => setShowFavoritesMenu(!showFavoritesMenu)}
                className="w-10 h-10 rounded-xl bg-accent/30 border border-accent/40 flex items-center justify-center hover:bg-accent/40 transition-colors relative"
                aria-label="Favorieten"
              >
                <Star className="w-5 h-5 text-white fill-accent" />
                {mockFavoriteHandies.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {mockFavoriteHandies.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Favorites Dropdown */}
      <AnimatePresence>
        {showFavoritesMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowFavoritesMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 bg-card rounded-2xl shadow-card border border-border z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent fill-accent" />
                  Opgeslagen handy's
                </h3>
                <button 
                  onClick={() => setShowFavoritesMenu(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <ScrollArea className="max-h-[60vh]">
                {mockFavoriteHandies.length === 0 ? (
                  <div className="p-8 text-center">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Je hebt nog geen favorieten</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Swipe naar rechts om een handy op te slaan
                    </p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {mockFavoriteHandies.map((handy) => (
                      <button
                        key={handy.id}
                        onClick={() => {
                          setShowFavoritesMenu(false);
                          navigate(`/profile/${handy.id}`);
                        }}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors group"
                      >
                        <img 
                          src={handy.avatar} 
                          alt={handy.name}
                          className="w-14 h-14 rounded-xl object-cover ring-2 ring-border group-hover:ring-accent transition-all"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-foreground group-hover:text-accent transition-colors">
                            {handy.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {handy.specialty} • {handy.location}
                          </p>
                          <div className="mt-1">
                            <HammerRating rating={handy.rating} size="xs" showCount reviewCount={handy.reviewCount} />
                          </div>
                        </div>
                        <div className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                          →
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
