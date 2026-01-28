import { useState } from 'react';
import { ArrowLeft, Wrench, Power, Calendar, Search, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FavoriteHandy {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
}

// Mock data - zou uit database komen
const mockFavoriteHandies: FavoriteHandy[] = [
  { id: '1', name: 'Jan Peeters', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', specialty: 'Loodgieter', rating: 4.8 },
  { id: '2', name: 'Mieke Janssen', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', specialty: 'Elektricien', rating: 4.9 },
  { id: '3', name: 'Peter Van den Berg', avatar: 'https://randomuser.me/api/portraits/men/55.jpg', specialty: 'Dakdekker', rating: 4.7 },
];

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

  return (
    <>
      <header className="sticky top-0 z-40 safe-area-top bg-gradient-to-r from-primary via-primary/90 to-accent/80 text-primary-foreground">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
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
            
            {/* Logo met oranje accent */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-md">
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
                className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Favorites button with star icon */}
            {showFavorites && (
              <button
                onClick={() => setShowFavoritesMenu(!showFavoritesMenu)}
                className="w-10 h-10 rounded-xl bg-accent/30 border border-accent/40 flex items-center justify-center hover:bg-accent/40 transition-colors relative"
              >
                <Star className="w-5 h-5 text-white fill-accent" />
                {mockFavoriteHandies.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {mockFavoriteHandies.length}
                  </span>
                )}
              </button>
            )}

            {/* Projects button (wrench icon) */}
            {showProjectsButton && (
              <button
                onClick={onOpenProjects}
                className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors relative"
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
              className="fixed top-16 right-4 w-80 bg-card rounded-2xl shadow-card border border-border z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  Mijn favoriete handy's
                </h3>
                <button 
                  onClick={() => setShowFavoritesMenu(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <ScrollArea className="max-h-80">
                {mockFavoriteHandies.length === 0 ? (
                  <div className="p-6 text-center">
                    <Star className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Je hebt nog geen favorieten</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {mockFavoriteHandies.map((handy) => (
                      <button
                        key={handy.id}
                        onClick={() => {
                          setShowFavoritesMenu(false);
                          navigate(`/profile/${handy.id}`);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                      >
                        <img 
                          src={handy.avatar} 
                          alt={handy.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">{handy.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{handy.specialty}</span>
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-accent fill-accent" />
                              {handy.rating}
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
