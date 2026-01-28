import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { EmergencyButton } from '@/components/EmergencyButton';
import { SwipeCard, SwipeButtons } from '@/components/SwipeCard';
import { ProblemInputDialog } from '@/components/ProblemInputDialog';
import { HandyDetailModal } from '@/components/HandyDetailModal';
import { HandyFilterModal } from '@/components/HandyFilterModal';
import { ProjectDetailModal } from '@/components/ProjectDetailModal';
import { mockHandyProfiles, mockProjects } from '@/data/mockData';
import { ProjectSearchModal, ProjectFilters } from '@/components/ProjectSearchModal';
import { MyProjectsSheet } from '@/components/MyProjectsSheet';
import { CalendarSheet } from '@/components/CalendarSheet';
import { CreateProjectSheet } from '@/components/CreateProjectSheet';
import { HandyProfile, Project } from '@/types/handymatch';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';

const SwipePage = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isHandy = userType === 'handy';

  // Check if problem dialog was already shown (only show first time for seekers)
  const [hasShownProblemDialog, setHasShownProblemDialog] = useState(() => {
    return localStorage.getItem('handymatch_problemDialogShown') === 'true';
  });

  const [allItems] = useState(isHandy ? mockProjects : mockHandyProfiles);
  const [filteredItems, setFilteredItems] = useState(allItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [showProblemDialog, setShowProblemDialog] = useState(!isHandy && !hasShownProblemDialog);
  const [selectedHandy, setSelectedHandy] = useState<HandyProfile | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<string | null>(null);
  const [showProjectSearch, setShowProjectSearch] = useState(false);
  const [showHandyFilter, setShowHandyFilter] = useState(false);
  const [showMyProjects, setShowMyProjects] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Mark problem dialog as shown when it's closed
  useEffect(() => {
    if (!showProblemDialog && !hasShownProblemDialog && !isHandy) {
      localStorage.setItem('handymatch_problemDialogShown', 'true');
      setHasShownProblemDialog(true);
    }
  }, [showProblemDialog, hasShownProblemDialog, isHandy]);

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

  const handleProjectSearch = useCallback((filters: ProjectFilters) => {
    // Filter projects based on search criteria
    let filtered = mockProjects;
    
    if (filters.specialty) {
      filtered = filtered.filter(project => 
        project.category?.toLowerCase().includes(filters.specialty.toLowerCase())
      );
    }
    
    if (filters.location) {
      filtered = filtered.filter(project =>
        project.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Note: Budget filtering would be applied here once budget fields are added to projects
    
    setFilteredItems(filtered.length > 0 ? filtered : mockProjects);
    setCurrentIndex(0);
    toast.success('Projecten gefilterd', {
      description: `${filtered.length} projecten gevonden`,
    });
  }, []);

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

  const handleCardClick = useCallback((item: HandyProfile | Project) => {
    if (!isHandy) {
      setSelectedHandy(item as HandyProfile);
      setShowDetailModal(true);
    } else {
      setSelectedProject(item as Project);
      setShowProjectModal(true);
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

  const handleApplyForProject = useCallback(() => {
    setShowProjectModal(false);
    if (currentIndex < filteredItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, filteredItems.length]);

  const visibleItems = filteredItems.slice(currentIndex, currentIndex + 2);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title={isHandy ? 'Projecten' : currentProblem ? `"${currentProblem}"` : 'Handy\'s'}
        showSearch={!isHandy}
        onOpenSearch={() => setShowHandyFilter(true)}
        showOnlineToggle={isHandy}
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        showProjectsButton
        onOpenProjects={() => setShowMyProjects(true)}
        showCalendar
        onOpenCalendar={() => setShowCalendar(true)}
        showFavorites={!isHandy}
      />

      <div className="flex-1 px-4 py-2 flex flex-col">
        {/* Card Stack */}
        <div className="relative flex-1 w-full max-w-sm mx-auto" style={{ minHeight: '60vh', maxHeight: '65vh' }}>
          <AnimatePresence>
            {visibleItems.map((item, index) => (
              <SwipeCard
                key={item.id}
                item={item}
                type={isHandy ? 'project' : 'handy'}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                isTop={index === 0}
                onCardClick={() => handleCardClick(item)}
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
              <p className="text-muted-foreground text-sm max-w-xs">
                Probeer je filters aan te passen of kom later terug
              </p>
            </motion.div>
          )}
        </div>

        {/* Swipe Buttons - Fixed position above bottom nav */}
        {visibleItems.length > 0 && (
          <div className="w-full max-w-md mx-auto py-4 mt-auto">
            <SwipeButtons
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          </div>
        )}
      </div>

      {/* Spacer for bottom nav */}
      <div className="h-24" />

      {!isHandy && <EmergencyButton />}
      <BottomNav />
      
      {/* Floating Search Button for Handy's - to search projects (LEFT side) */}
      {isHandy && (
        <button
          onClick={() => setShowProjectSearch(true)}
          className="fixed bottom-28 left-4 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-card-hover flex items-center justify-center hover:scale-105 transition-transform z-40"
        >
          <Search className="w-6 h-6" />
        </button>
      )}

      {/* Floating Plus Button for Seekers - Quick project creation (LEFT side) */}
      {!isHandy && (
        <button
          onClick={() => setShowCreateProject(true)}
          className="fixed bottom-28 left-4 w-14 h-14 rounded-full bg-gradient-to-r from-accent to-accent/80 text-white shadow-card-hover flex items-center justify-center hover:scale-105 transition-transform z-40"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      )}

      {/* Project Search Modal - for Handy's */}
      <ProjectSearchModal
        isOpen={showProjectSearch}
        onClose={() => setShowProjectSearch(false)}
        onSearch={handleProjectSearch}
      />

      {/* My Projects Sheet */}
      <MyProjectsSheet
        isOpen={showMyProjects}
        onClose={() => setShowMyProjects(false)}
        userType={isHandy ? 'handy' : 'seeker'}
        onCreateProject={() => {
          setShowMyProjects(false);
          setShowCreateProject(true);
        }}
      />

      {/* Create Project Sheet - for Seekers */}
      <CreateProjectSheet
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
      />

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

      {/* Project Detail Modal (for Handy users) */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onApply={handleApplyForProject}
      />

      {/* Calendar Sheet */}
      <CalendarSheet
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
      />

      {/* Handy Filter Modal - for seekers */}
      <HandyFilterModal
        isOpen={showHandyFilter}
        onClose={() => setShowHandyFilter(false)}
      />
    </div>
  );
};

export default SwipePage;
