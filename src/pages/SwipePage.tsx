import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { SwipeCard } from '@/components/SwipeCard';
import { SwipeHeader } from '@/components/SwipeHeader';
import { SwipeActionBar } from '@/components/SwipeActionBar';
import { EmergencyButton } from '@/components/EmergencyButton';
import { ProblemInputDialog } from '@/components/ProblemInputDialog';
import { HandyDetailModal } from '@/components/HandyDetailModal';
import { ProjectDetailModal } from '@/components/ProjectDetailModal';
import { mockHandyProfiles, mockProjects } from '@/data/mockData';
import { ProjectSearchModal, ProjectFilters } from '@/components/ProjectSearchModal';
import { MyProjectsSheet } from '@/components/MyProjectsSheet';
import { CreateProjectSheet } from '@/components/CreateProjectSheet';
import { HandyProfile, Project } from '@/types/handymatch';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  // Show problem dialog on first visit for seekers
  const [showProblemDialog, setShowProblemDialog] = useState(!isHandy && !hasShownProblemDialog);
  const [selectedHandy, setSelectedHandy] = useState<HandyProfile | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<string | null>(null);
  const [showProjectSearch, setShowProjectSearch] = useState(false);
  const [showMyProjects, setShowMyProjects] = useState(false);
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

    const matchingCategories: string[] = [];
    Object.entries(keywordMap).forEach(([keyword, categories]) => {
      if (lowerProblem.includes(keyword)) {
        matchingCategories.push(...categories);
      }
    });

    if (matchingCategories.length === 0) {
      setFilteredItems(allItems);
    } else {
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Zone 1: Header - Fixed 64px */}
      <SwipeHeader
        title={isHandy ? 'Projecten' : currentProblem ? `"${currentProblem}"` : 'Handy\'s'}
        onOpenSearch={() => isHandy ? setShowProjectSearch(true) : setShowProblemDialog(true)}
        onOpenProjects={() => setShowMyProjects(true)}
        projectCount={3}
      />

      {/* Zone 4: Safety Layer - Global floating alarm */}
      <EmergencyButton />

      {/* Zone 2: Swipe Area - Card-first design, 80-85% of available space */}
      <div className="flex-1 flex items-center justify-center px-4 py-2 min-h-0">
        {/* Card container with consistent margins and max-width */}
        <div className="relative w-full max-w-[450px] h-full max-h-[55vh] aspect-[3/4]">
          {/* Stack indicator - shows edge of next card */}
          {visibleItems.length > 1 && (
            <div className="absolute inset-0 rounded-3xl bg-card/50 border border-border/30 transform translate-y-2 scale-[0.96] -z-10" />
          )}
          {visibleItems.length > 2 && (
            <div className="absolute inset-0 rounded-3xl bg-card/30 border border-border/20 transform translate-y-4 scale-[0.92] -z-20" />
          )}

          <AnimatePresence>
            {visibleItems.map((item, index) => (
              <SwipeCard
                key={item.id}
                item={item}
                type={isHandy ? 'project' : 'handy'}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                isTop={index === 0}
                stackIndex={index}
                onCardClick={() => handleCardClick(item)}
              />
            ))}
          </AnimatePresence>

          {visibleItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-3xl bg-card border border-border"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <span className="text-5xl">🔍</span>
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Niemand meer in de buurt
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs px-4">
                Probeer je filters aan te passen of kom later terug
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Zone 3: Swipe Action Zone - Centered buttons */}
      <SwipeActionBar
        onReject={handleSwipeLeft}
        onAccept={handleSwipeRight}
        onThirdAction={() => setShowCreateProject(true)}
        thirdActionLabel={isHandy ? "Nieuw aanbod" : "Nieuw project"}
        disabled={visibleItems.length === 0}
      />

      {/* Bottom Navigation */}
      <div className="flex-shrink-0">
        <BottomNav />
      </div>
      {/* Modals - Outside main layout flow */}
      <ProjectSearchModal
        isOpen={showProjectSearch}
        onClose={() => setShowProjectSearch(false)}
        onSearch={handleProjectSearch}
      />

      <MyProjectsSheet
        isOpen={showMyProjects}
        onClose={() => setShowMyProjects(false)}
        userType={isHandy ? 'handy' : 'seeker'}
        onCreateProject={() => {
          setShowMyProjects(false);
          setShowCreateProject(true);
        }}
      />

      <CreateProjectSheet
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
      />

      <ProblemInputDialog
        isOpen={showProblemDialog}
        onClose={() => setShowProblemDialog(false)}
        onSubmit={filterByProblem}
      />

      <HandyDetailModal
        handy={selectedHandy}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onContact={handleContactFromDetail}
      />

      <ProjectDetailModal
        project={selectedProject}
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onApply={handleApplyForProject}
      />

    </div>
  );
};

export default SwipePage;
