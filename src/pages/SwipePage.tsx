import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { EmergencyButton } from '@/components/EmergencyButton';
import { SwipeCard, SwipeButtons } from '@/components/SwipeCard';
import { ProblemInputDialog } from '@/components/ProblemInputDialog';
import { HandyDetailModal } from '@/components/HandyDetailModal';
import { mockHandyProfiles, mockProjects } from '@/data/mockData';
import { FilterModal } from '@/components/FilterModal';
import { HandyProfile } from '@/types/handymatch';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const SwipePage = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isHandy = userType === 'handy';

  const [allItems] = useState(isHandy ? mockProjects : mockHandyProfiles);
  const [filteredItems, setFilteredItems] = useState(allItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showProblemDialog, setShowProblemDialog] = useState(!isHandy);
  const [selectedHandy, setSelectedHandy] = useState<HandyProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<string | null>(null);

  const filterByProblem = useCallback((problem: string) => {
    const lowerProblem = problem.toLowerCase();
    
    // Map common problem keywords to specialties/categories
    const keywordMap: Record<string, string[]> = {
      'kraan': ['loodgieter', 'sanitair', 'lekken'],
      'lekt': ['loodgieter', 'sanitair', 'lekken'],
      'water': ['loodgieter', 'sanitair'],
      'lamp': ['elektricien', 'elektriciteit', 'lampen', 'domotica'],
      'licht': ['elektricien', 'elektriciteit', 'lampen'],
      'stopcontact': ['elektricien', 'elektriciteit', 'stopcontacten'],
      'tuin': ['tuinwerk', 'tuinonderhoud', 'grasmaaien'],
      'gras': ['tuinwerk', 'grasmaaien'],
      'maaien': ['tuinwerk', 'grasmaaien'],
      'tegel': ['tegels', 'badkamer', 'keuken'],
      'schilder': ['schilder', 'schilderen', 'behangen'],
      'verf': ['schilder', 'schilderen'],
      'muur': ['schilder', 'schilderen', 'behangen'],
    };

    // Find matching keywords
    const matchingCategories: string[] = [];
    Object.entries(keywordMap).forEach(([keyword, categories]) => {
      if (lowerProblem.includes(keyword)) {
        matchingCategories.push(...categories);
      }
    });

    if (matchingCategories.length === 0) {
      // No specific match, show all
      setFilteredItems(allItems);
    } else {
      // Filter profiles that match any of the categories
      const filtered = (allItems as HandyProfile[]).filter(profile => {
        const specialtyMatch = matchingCategories.some(cat => 
          profile.specialty.toLowerCase().includes(cat)
        );
        const specialtiesMatch = profile.specialties.some(spec =>
          matchingCategories.some(cat => spec.toLowerCase().includes(cat))
        );
        return specialtyMatch || specialtiesMatch;
      });
      
      setFilteredItems(filtered.length > 0 ? filtered : allItems);
    }
    
    setCurrentIndex(0);
    setCurrentProblem(problem);
    setShowProblemDialog(false);
    toast.success(`Zoeken naar: "${problem}"`, {
      description: 'We tonen nu de beste matches voor jouw probleem',
    });
  }, [allItems]);

  const handleSwipeLeft = useCallback(() => {
    if (currentIndex < filteredItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      toast.info('Geen nieuwe profielen meer in de buurt');
    }
  }, [currentIndex, filteredItems.length]);

  const handleSwipeRight = useCallback(() => {
    const item = filteredItems[currentIndex];
    const name = 'name' in item ? item.name : item.title;
    toast.success(`Bericht verzonden naar ${name}!`, {
      description: 'Start een gesprek in je Chats',
    });
    
    if (currentIndex < filteredItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      toast.info('Geen nieuwe profielen meer in de buurt');
    }
  }, [currentIndex, filteredItems]);

  const handleCardClick = useCallback((item: HandyProfile) => {
    if (!isHandy) {
      setSelectedHandy(item);
      setShowDetailModal(true);
    }
  }, [isHandy]);

  const handleContactFromDetail = useCallback(() => {
    if (selectedHandy) {
      toast.success(`Bericht verzonden naar ${selectedHandy.name}!`, {
        description: 'Start een gesprek in je Chats',
      });
      setShowDetailModal(false);
      navigate('/chats');
    }
  }, [selectedHandy, navigate]);

  const visibleItems = filteredItems.slice(currentIndex, currentIndex + 2);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title={isHandy ? 'Projecten' : currentProblem ? `"${currentProblem}"` : 'Handy\'s'}
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
                onCardClick={!isHandy ? () => handleCardClick(item as HandyProfile) : undefined}
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
      
      {/* Floating Search Button - to reopen problem dialog */}
      {!isHandy && !showProblemDialog && (
        <button
          onClick={() => setShowProblemDialog(true)}
          className="fixed bottom-28 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-card-hover flex items-center justify-center hover:scale-105 transition-transform z-40"
        >
          <Search className="w-6 h-6" />
        </button>
      )}

      {/* Problem Input Dialog - Only for seekers */}
      <ProblemInputDialog
        isOpen={showProblemDialog}
        onClose={() => setShowProblemDialog(false)}
        onSubmit={filterByProblem}
      />

      {/* Handy Detail Modal */}
      <HandyDetailModal
        handy={selectedHandy}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onContact={handleContactFromDetail}
      />
    </div>
  );
};

export default SwipePage;
