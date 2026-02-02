import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HammerRating } from './HammerRating';
import { getFavorites, removeFavorite, type FavoriteHandy } from '@/stores/favoritesStore';
import { toast } from 'sonner';

interface FavoritesSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FavoritesSheet = ({ isOpen, onClose }: FavoritesSheetProps) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteHandy[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFavorites(getFavorites());
    }
  }, [isOpen]);

  const handleRemove = (handyId: string, name: string) => {
    removeFavorite(handyId);
    setFavorites(getFavorites());
    toast.success(`${name} verwijderd uit favorieten`);
  };

  const handleNavigate = (handyId: string) => {
    onClose();
    navigate(`/profile/${handyId}`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display text-xl flex items-center gap-2">
            <Star className="w-5 h-5 text-accent fill-accent" />
            Opgeslagen Handy's
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100%-80px)]">
          {favorites.length === 0 ? (
            <div className="p-8 text-center">
              <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Geen favorieten</p>
              <p className="text-sm text-muted-foreground mt-2">
                Swipe naar rechts op de swipe pagina om handy's op te slaan
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {favorites.map((handy) => (
                <div
                  key={handy.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all group"
                >
                  <button
                    onClick={() => handleNavigate(handy.id)}
                    className="flex items-center gap-4 flex-1"
                  >
                    <img 
                      src={handy.avatar} 
                      alt={handy.name}
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-border group-hover:ring-accent transition-all"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-foreground group-hover:text-accent transition-colors">
                        {handy.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {handy.specialty}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{handy.location}</span>
                      </div>
                      <div className="mt-1">
                        <HammerRating rating={handy.rating} size="xs" showCount reviewCount={handy.reviewCount} />
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRemove(handy.id, handy.name)}
                    className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
