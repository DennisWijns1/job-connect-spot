import { useState, useEffect } from 'react';
import { Search, Star, KeyRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HammerRating } from './HammerRating';
import { getFavorites, type FavoriteHandy } from '@/stores/favoritesStore';

interface SwipeHeaderProps {
  title: string;
  onOpenSearch?: () => void;
  onOpenFavorites?: () => void;
  onOpenProjects?: () => void;
  favoriteCount?: number;
  projectCount?: number;
}

export const SwipeHeader = ({
  title,
  onOpenSearch,
  onOpenFavorites,
  onOpenProjects,
  favoriteCount = 0,
  projectCount = 0,
}: SwipeHeaderProps) => {
  const navigate = useNavigate();
  const [showFavoritesMenu, setShowFavoritesMenu] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteHandy[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, [showFavoritesMenu]);

  const handleFavoritesClick = () => {
    if (onOpenFavorites) {
      onOpenFavorites();
    } else {
      setShowFavoritesMenu(!showFavoritesMenu);
    }
  };

  return (
    <>
      {/* Zone 1: Header - Fixed 64px height */}
      <header className="h-16 flex-shrink-0 z-40 bg-gradient-to-r from-primary via-primary/90 to-accent/80 text-primary-foreground">
        <div className="h-full flex items-center justify-between px-4">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">HM</span>
            </div>
            <h1 className="font-display font-bold text-lg truncate max-w-[160px]">
              {title}
            </h1>
          </div>

          {/* Right: Exactly 3 action icons - Search, Favorites, Projects */}
          <div className="flex items-center gap-2">
            {/* Icon 1: Search */}
            <button
              onClick={onOpenSearch}
              className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
              aria-label="Zoeken en filteren"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Icon 2: Favorites */}
            <button
              onClick={handleFavoritesClick}
              className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors relative"
              aria-label="Favorieten"
            >
              <Star className="w-5 h-5 text-white fill-accent/50" />
              {(favoriteCount > 0 || favorites.length > 0) && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {favoriteCount || favorites.length}
                </span>
              )}
            </button>

            {/* Icon 3: Running Projects */}
            <button
              onClick={onOpenProjects}
              className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors relative"
              aria-label="Lopende projecten"
            >
              <KeyRound className="w-5 h-5" />
              {projectCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {projectCount}
                </span>
              )}
            </button>
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
                {favorites.length === 0 ? (
                  <div className="p-8 text-center">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Je hebt nog geen favorieten</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Swipe naar rechts om een handy op te slaan
                    </p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {favorites.map((handy) => (
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
