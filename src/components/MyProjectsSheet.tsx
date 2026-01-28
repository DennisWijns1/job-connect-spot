import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Clock, Users, MessageCircle, CheckCircle, Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MyProjectsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'handy' | 'seeker';
  onCreateProject?: () => void;
}

// Mock data for handy user's projects (projects they applied for / are working on)
const handyProjects = [
  {
    id: '1',
    title: 'Lekkende kraan repareren',
    client: 'Jan de Vries',
    status: 'in_progress',
    scheduledAt: '2025-01-20T10:00:00',
    budget: '€75-100',
  },
  {
    id: '2',
    title: 'Tuin onderhoud',
    client: 'Maria Jansen',
    status: 'scheduled',
    scheduledAt: '2025-01-22T14:00:00',
    budget: '€150-200',
  },
  {
    id: '3',
    title: 'Lamp ophangen',
    client: 'Pieter Bakker',
    status: 'completed',
    scheduledAt: '2025-01-15T09:00:00',
    budget: '€50',
  },
];

// Mock data for seeker user's projects
const seekerProjects = [
  {
    id: '1',
    title: 'Lekkende kraan repareren',
    handy: 'Klaas Loodgieter',
    status: 'in_progress',
    matches: 3,
    scheduledAt: '2025-01-20T10:00:00',
  },
  {
    id: '2',
    title: 'Tuin onderhoud',
    handy: null,
    status: 'open',
    matches: 5,
    scheduledAt: null,
  },
];

export const MyProjectsSheet = ({ isOpen, onClose, userType, onCreateProject }: MyProjectsSheetProps) => {
  const navigate = useNavigate();
  const isHandy = userType === 'handy';
  const projects = isHandy ? handyProjects : seekerProjects;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Lopend</Badge>;
      case 'scheduled':
        return <Badge className="bg-accent/10 text-accent hover:bg-accent/20">Gepland</Badge>;
      case 'completed':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Afgerond</Badge>;
      case 'open':
        return <Badge className="bg-muted text-muted-foreground">Open</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[340px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="font-display text-lg flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            {isHandy ? 'Mijn Opdrachten' : 'Mijn Projecten'}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Create Project Button - Only for seekers */}
          {!isHandy && onCreateProject && (
            <Button 
              onClick={onCreateProject}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-accent to-accent/80 text-white font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nieuw project plaatsen
            </Button>
          )}

          {/* Filters */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full text-xs">
              Allemaal
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-xs">
              Lopend
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-xs">
              Gepland
            </Button>
          </div>

          {/* Project list */}
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer group"
                onClick={() => navigate('/chats')}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.title}
                  </h4>
                  {getStatusBadge(project.status)}
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  {isHandy ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        <span>{(project as typeof handyProjects[0]).client}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {(project as typeof handyProjects[0]).budget}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {(project as typeof seekerProjects[0]).handy ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-success" />
                          <span>{(project as typeof seekerProjects[0]).handy}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          <span>{(project as typeof seekerProjects[0]).matches} matches</span>
                        </div>
                      )}
                    </>
                  )}

                  {project.scheduledAt && (
                    <div className="flex items-center gap-2 text-primary">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(project.scheduledAt)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                  <MessageCircle className="w-4 h-4" />
                  <span>Open chat →</span>
                </div>
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nog geen {isHandy ? 'opdrachten' : 'projecten'}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
