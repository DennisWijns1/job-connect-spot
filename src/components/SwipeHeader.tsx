import { useState, useEffect } from 'react';
import { Search, Star, KeyRound, X, Wrench, Calendar, Users, CheckCircle, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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

// Mock reviews for handy users
const mockReviews = [
  { id: '1', clientName: 'Jan de Vries', rating: 5, comment: 'Uitstekend werk! Kraan gerepareerd in 30 minuten.', projectTitle: 'Lekkende kraan', date: '2025-01-18', projectId: 'p1' },
  { id: '2', clientName: 'Maria Jansen', rating: 4, comment: 'Goede vakman, was op tijd en netjes.', projectTitle: 'Tuin onderhoud', date: '2025-01-15', projectId: 'p2' },
  { id: '3', clientName: 'Pieter Bakker', rating: 5, comment: 'Perfecte lamp installatie, aanrader!', projectTitle: 'Lamp ophangen', date: '2025-01-10', projectId: 'p3' },
];

// Mock running/scheduled projects for handy users
const mockHandyProjects = [
  { id: '1', title: 'Lekkende kraan repareren', client: 'Jan de Vries', status: 'in_progress', scheduledAt: '2025-01-20T10:00:00', budget: '€75-100' },
  { id: '2', title: 'Tuin onderhoud', client: 'Maria Jansen', status: 'scheduled', scheduledAt: '2025-01-22T14:00:00', budget: '€150-200' },
];

// Mock interesting projects based on handy's specialty/radius
const mockInterestingProjects = [
  { id: 'i1', title: 'Stopcontact plaatsen', location: 'Leuven, 2.3 km', category: 'Elektriciteit', urgency: 'medium' as const },
  { id: 'i2', title: 'Boiler aansluiten', location: 'Heverlee, 3.1 km', category: 'Sanitair', urgency: 'high' as const },
  { id: 'i3', title: 'Deur herstellen', location: 'Kessel-Lo, 1.8 km', category: 'Timmerwerk', urgency: 'low' as const },
];

export const SwipeHeader = ({
  title,
  onOpenSearch,
  onOpenFavorites,
  onOpenProjects,
  favoriteCount = 0,
  projectCount = 0,
}: SwipeHeaderProps) => {
  const navigate = useNavigate();
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isHandy = userType === 'handy';

  const [showFavoritesMenu, setShowFavoritesMenu] = useState(false);
  const [showProjectsMenu, setShowProjectsMenu] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteHandy[]>([]);

  useEffect(() => {
    if (!isHandy) {
      setFavorites(getFavorites());
    }
  }, [showFavoritesMenu, isHandy]);

  const handleStarClick = () => {
    if (isHandy) {
      // For handy: show reviews
      setShowFavoritesMenu(!showFavoritesMenu);
      setShowProjectsMenu(false);
    } else {
      if (onOpenFavorites) {
        onOpenFavorites();
      } else {
        setShowFavoritesMenu(!showFavoritesMenu);
        setShowProjectsMenu(false);
      }
    }
  };

  const handleProjectsClick = () => {
    if (isHandy) {
      setShowProjectsMenu(!showProjectsMenu);
      setShowFavoritesMenu(false);
    } else if (onOpenProjects) {
      onOpenProjects();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px]">Lopend</Badge>;
      case 'scheduled':
        return <Badge className="bg-accent/10 text-accent hover:bg-accent/20 text-[10px]">Gepland</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <header className="h-16 flex-shrink-0 z-40 text-white relative overflow-hidden gradient-teal">
        <div className="h-full flex items-center justify-between px-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md" style={{ backgroundColor: 'hsl(38, 92%, 50%)' }}>
              <span className="text-white font-bold text-sm">HM</span>
            </div>
            <h1 className="font-display font-bold text-lg truncate max-w-[160px]">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Icon 1: Search */}
            <button onClick={onOpenSearch} className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Zoeken en filteren">
              <Search className="w-5 h-5" />
            </button>

            {/* Icon 2: Star - Reviews (handy) / Favorites (seeker) */}
            <button onClick={handleStarClick} className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors relative" aria-label={isHandy ? 'Reviews' : 'Favorieten'}>
              <Star className="w-5 h-5 text-white fill-accent/50" />
              {isHandy ? (
                mockReviews.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {mockReviews.length}
                  </span>
                )
              ) : (
                (favoriteCount > 0 || favorites.length > 0) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {favoriteCount || favorites.length}
                  </span>
                )
              )}
            </button>

            {/* Icon 3: Projects (wrench for handy, key for seeker) */}
            <button onClick={handleProjectsClick} className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors relative" aria-label="Projecten">
              {isHandy ? <Wrench className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
              {projectCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {projectCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>


      {/* Star Dropdown: Reviews for Handy */}
      <AnimatePresence>
        {showFavoritesMenu && isHandy && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowFavoritesMenu(false)} />
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 bg-card rounded-2xl shadow-card border border-border z-50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent fill-accent" />
                  Reviews van klanten
                </h3>
                <button onClick={() => setShowFavoritesMenu(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <ScrollArea className="max-h-[60vh]">
                {mockReviews.length === 0 ? (
                  <div className="p-8 text-center">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nog geen reviews ontvangen</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {mockReviews.map((review) => (
                      <button
                        key={review.id}
                        onClick={() => {
                          setShowFavoritesMenu(false);
                          navigate('/profile', { state: { scrollTo: 'completed-projects', reviewId: review.projectId } });
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-muted transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold text-sm text-foreground">{review.clientName}</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-accent fill-accent" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-primary font-medium">{review.projectTitle}</span>
                          <span className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <p className="text-xs text-accent mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Bekijk & beantwoord →</p>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Star Dropdown: Favorites for Seeker */}
      <AnimatePresence>
        {showFavoritesMenu && !isHandy && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowFavoritesMenu(false)} />
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 bg-card rounded-2xl shadow-card border border-border z-50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent fill-accent" />
                  Opgeslagen handy's
                </h3>
                <button onClick={() => setShowFavoritesMenu(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <ScrollArea className="max-h-[60vh]">
                {favorites.length === 0 ? (
                  <div className="p-8 text-center">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Je hebt nog geen favorieten</p>
                    <p className="text-sm text-muted-foreground mt-1">Swipe naar rechts om een handy op te slaan</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {favorites.map((handy) => (
                      <button key={handy.id} onClick={() => { setShowFavoritesMenu(false); navigate(`/profile/${handy.id}`); }} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors group">
                        <img src={handy.avatar} alt={handy.name} className="w-14 h-14 rounded-xl object-cover ring-2 ring-border group-hover:ring-accent transition-all" />
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-foreground group-hover:text-accent transition-colors">{handy.name}</p>
                          <p className="text-sm text-muted-foreground">{handy.specialty} • {handy.location}</p>
                          <div className="mt-1">
                            <HammerRating rating={handy.rating} size="xs" showCount reviewCount={handy.reviewCount} />
                          </div>
                        </div>
                        <div className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Projects Dropdown for Handy */}
      <AnimatePresence>
        {showProjectsMenu && isHandy && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowProjectsMenu(false)} />
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 bg-card rounded-2xl shadow-card border border-border z-50 overflow-hidden max-h-[75vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary" />
                  Mijn projecten
                </h3>
                <button onClick={() => setShowProjectsMenu(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {/* Running & Scheduled projects */}
                  <p className="text-xs font-semibold text-muted-foreground uppercase px-1 pt-1">Lopende & Geplande</p>
                  {mockHandyProjects.map((project) => (
                    <div key={project.id} onClick={() => { setShowProjectsMenu(false); navigate('/chats'); }} className="p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer group">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{project.title}</p>
                        {getStatusBadge(project.status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{project.client}</span>
                        <span className="font-medium text-foreground">{project.budget}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-primary mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(project.scheduledAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-accent mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MessageCircle className="w-3 h-3" />
                        Open chat →
                      </div>
                    </div>
                  ))}

                  {/* Interesting projects */}
                  <div className="border-t border-border mt-2 pt-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase px-1 pt-1 mb-2">Interessante projecten voor jou</p>
                    {mockInterestingProjects.map((project) => (
                      <div key={project.id} onClick={() => { setShowProjectsMenu(false); }} className="p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer group">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{project.title}</p>
                          <Badge className={`text-[10px] ${project.urgency === 'high' ? 'bg-destructive/10 text-destructive' : project.urgency === 'medium' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                            {project.urgency === 'high' ? 'Dringend' : project.urgency === 'medium' ? 'Normaal' : 'Rustig'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{project.location}</span>
                          <Badge variant="outline" className="text-[10px]">{project.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
