import { ArrowLeft, SlidersHorizontal, Key, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showFilters?: boolean;
  showNotifications?: boolean;
  showOnlineToggle?: boolean;
  isOnline?: boolean;
  onToggleOnline?: () => void;
  onOpenFilters?: () => void;
  showProjectsButton?: boolean;
  onOpenProjects?: () => void;
}

export const Header = ({
  title,
  showBack = false,
  showFilters = false,
  showOnlineToggle = false,
  isOnline = true,
  onToggleOnline,
  onOpenFilters,
  showProjectsButton = false,
  onOpenProjects,
}: HeaderProps) => {
  const navigate = useNavigate();

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

          {/* Projects button (key icon) */}
          {showProjectsButton && (
            <button
              onClick={onOpenProjects}
              className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors relative"
            >
              <Key className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
