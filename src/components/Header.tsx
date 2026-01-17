import { ArrowLeft, SlidersHorizontal, Wrench, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus, Clock, Users } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showFilters?: boolean;
  showNotifications?: boolean;
  showOnlineToggle?: boolean;
  isOnline?: boolean;
  onToggleOnline?: () => void;
  onOpenFilters?: () => void;
}

// Mock user projects
const userProjects = [
  {
    id: '1',
    title: 'Lekkende kraan repareren',
    status: 'active',
    matches: 3,
    createdAt: '2 dagen geleden',
  },
  {
    id: '2',
    title: 'Tuin onderhoud',
    status: 'active',
    matches: 5,
    createdAt: '1 week geleden',
  },
  {
    id: '3',
    title: 'Lamp ophangen',
    status: 'completed',
    matches: 2,
    createdAt: '2 weken geleden',
  },
];

export const Header = ({
  title,
  showBack = false,
  showFilters = false,
  showNotifications = false,
  showOnlineToggle = false,
  isOnline = true,
  onToggleOnline,
  onOpenFilters,
}: HeaderProps) => {
  const navigate = useNavigate();
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isSeeker = userType === 'seeker';

  return (
    <header className="sticky top-0 glass border-b border-border safe-area-top z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="font-display font-bold text-xl text-foreground">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {showOnlineToggle && (
            <button
              onClick={onToggleOnline}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200',
                isOnline
                  ? 'bg-success/10 text-success'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Power className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </button>
          )}

          {showFilters && (
            <button
              onClick={onOpenFilters}
              className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          )}

          {/* Projects button for seekers (wrench icon) */}
          {showNotifications && isSeeker && (
            <Sheet>
              <SheetTrigger asChild>
                <button className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors relative">
                  <Wrench className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[340px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="font-display text-lg">Mijn Projecten</SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* Add new project button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-primary/80"
                    onClick={() => navigate('/swipe')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nieuw Project Toevoegen
                  </Button>

                  {/* Project list */}
                  <div className="space-y-3">
                    {userProjects.map((project) => (
                      <div
                        key={project.id}
                        className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer group"
                        onClick={() => navigate('/chats')}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {project.title}
                          </h4>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            project.status === 'active' 
                              ? 'bg-success/10 text-success' 
                              : 'bg-muted text-muted-foreground'
                          )}>
                            {project.status === 'active' ? 'Actief' : 'Afgerond'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{project.matches} matches</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{project.createdAt}</span>
                          </div>
                        </div>
                        
                        {project.matches > 0 && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                            <MessageCircle className="w-4 h-4" />
                            <span>Chat met kandidaten →</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};
