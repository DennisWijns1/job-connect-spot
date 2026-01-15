import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { EmergencyButton } from '@/components/EmergencyButton';
import { SwipeCard, SwipeButtons } from '@/components/SwipeCard';
import { mockHandyProfiles, mockProjects } from '@/data/mockData';
import { FilterModal } from '@/components/FilterModal';
import { toast } from 'sonner';

const SwipePage = () => {
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isHandy = userType === 'handy';

  const [items, setItems] = useState(isHandy ? mockProjects : mockHandyProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const handleSwipeLeft = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      toast.info('Geen nieuwe profielen meer in de buurt');
    }
  }, [currentIndex, items.length]);

  const handleSwipeRight = useCallback(() => {
    const item = items[currentIndex];
    const name = 'name' in item ? item.name : item.title;
    toast.success(`Bericht verzonden naar ${name}!`, {
      description: 'Start een gesprek in je Chats',
    });
    
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      toast.info('Geen nieuwe profielen meer in de buurt');
    }
  }, [currentIndex, items]);

  const visibleItems = items.slice(currentIndex, currentIndex + 2);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title={isHandy ? 'Projecten' : 'Handy\'s'}
        showFilters
        showNotifications
        showOnlineToggle={isHandy}
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        onOpenFilters={() => setIsFilterOpen(true)}
      />

      <div className="flex-1 px-4 py-2 flex flex-col">
        {/* Card Stack */}
        <div className="relative flex-1 min-h-[300px] max-h-[400px] w-full max-w-md mx-auto">
          <AnimatePresence>
            {visibleItems.map((item, index) => (
              <SwipeCard
                key={item.id}
                item={item}
                type={isHandy ? 'project' : 'handy'}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                isTop={index === 0}
              />
            ))}
          </AnimatePresence>

          {visibleItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <span className="text-5xl">🔍</span>
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Niemand meer in de buurt
              </h3>
              <p className="text-secondary text-sm max-w-xs">
                Probeer je filters aan te passen of kom later terug
              </p>
            </motion.div>
          )}
        </div>

        {/* Swipe Buttons */}
        {visibleItems.length > 0 && (
          <div className="w-full max-w-md mx-auto">
            <SwipeButtons
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          </div>
        )}
      </div>

      {/* Spacer for bottom nav */}
      <div className="h-20" />

      {!isHandy && <EmergencyButton />}
      <BottomNav />
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </div>
  );
};

export default SwipePage;
