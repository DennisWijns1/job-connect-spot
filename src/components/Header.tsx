import { useState, useEffect } from 'react';
import { ArrowLeft, Wrench, Power, Calendar, Search, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HammerRating } from './HammerRating';
import { getFavorites, type FavoriteHandy } from '@/stores/favoritesStore';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showOnlineToggle?: boolean;
  isOnline?: boolean;
  onToggleOnline?: () => void;
  onOpenSearch?: () => void;
  showProjectsButton?: boolean;
  onOpenProjects?: () => void;
  showCalendar?: boolean;
  onOpenCalendar?: () => void;
  showFavorites?: boolean;
}

export const Header = ({
  title,
  showBack = false,
  showSearch = false,
  showOnlineToggle = false,
  isOnline = true,
  onToggleOnline,
  onOpenSearch,
  showProjectsButton = false,
  onOpenProjects,
  showCalendar = false,
  onOpenCalendar,
  showFavorites = false,
}: HeaderProps) => {
  const navigate = useNavigate();
  const [showFavoritesMenu, setShowFavoritesMenu] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteHandy[]>([]);

  useEffect(() => {
    if (showFavoritesMenu || showFavorites) {
      setFavorites(getFavorites());
    }
  }, [showFavoritesMenu, showFavorites]);

  return (
    <>
      <header className="sticky top-0 z-40 safe-area-top text-white relative overflow-hidden gradient-teal">
        <div className="flex items-center justify-between px-4 py-3 relative z-10">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/25 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            {showCalendar && (
              <button
                onClick={onOpenCalendar}
                className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors relative"
              >
                <Calendar className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
              </button>
            )}
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md" style={{ backgroundColor: 'hsl(38, 92%, 50%)' }}>
                <span className="text-white font-bold text-sm">HM</span>
              </div>
              <h1 className="font-display font-bold text-lg">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showOnlineToggle && (
              <button
                onClick={onToggleOnline}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200',
                  isOnline
                    ? 'bg-success/20 text-white'
                    : 'bg-white/15 text-white/70'
                )}
              >
                <Power className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </button>
            )}

            {/* Search button - replaces filter */}
            {showSearch && (
              <button
                onClick={onOpenSearch}
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Favorites button with star icon */}
            {showFavorites && (
              <button
                onClick={() => setShowFavoritesMenu(!showFavoritesMenu)}
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors relative"
              >
                <Star className="w-5 h-5 text-white fill-accent" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {favorites.length}
                  </span>
                )}
              </button>
            )}

            {/* Projects button (wrench icon) */}
            {showProjectsButton && (
              <button
                onClick={onOpenProjects}
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors relative"
              >
                <Wrench className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
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
              initial={{ opacity: 0, y: -10, x: 10 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -10, x: 10 }}
              className="fixed top-16 right-4 left-4 sm:left-auto sm:w-96 bg-card rounded-2xl shadow-card border border-border z-50 overflow-hidden"
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
