import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeActionBarProps {
  onReject: () => void;
  onAccept: () => void;
  onCreateProject?: () => void;
  showCreateProject?: boolean;
  disabled?: boolean;
}

export const SwipeActionBar = ({
  onReject,
  onAccept,
  onCreateProject,
  showCreateProject = false,
  disabled = false,
}: SwipeActionBarProps) => {
  return (
    // Fixed height action zone: 96px (h-24)
    <div className="h-24 flex-shrink-0 bg-background border-t border-border">
      <div className="h-full flex items-center justify-center gap-8 px-4 max-w-md mx-auto">
        {/* Left: Reject button (X) */}
        <button
          onClick={onReject}
          disabled={disabled}
          className={cn(
            "w-14 h-14 rounded-full bg-card shadow-card flex items-center justify-center transition-all duration-200 border-2 border-destructive/30",
            disabled 
              ? "opacity-50 cursor-not-allowed" 
              : "text-destructive hover:scale-110 hover:bg-destructive hover:text-white active:scale-95"
          )}
          aria-label="Weigeren"
        >
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>

        {/* Center: Accept button (Hammer) - Largest */}
        <button
          onClick={onAccept}
          disabled={disabled}
          className={cn(
            "w-18 h-18 rounded-full bg-accent shadow-card-hover flex items-center justify-center transition-all duration-200",
            disabled 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:scale-110 active:scale-95"
          )}
          style={{ width: '72px', height: '72px' }}
          aria-label="Accepteren"
        >
          <span className="text-4xl">🔨</span>
        </button>

        {/* Right: Create project button (+) */}
        {showCreateProject ? (
          <button
            onClick={onCreateProject}
            disabled={disabled}
            className={cn(
              "w-14 h-14 rounded-full bg-card shadow-card flex items-center justify-center transition-all duration-200 border-2 border-accent/30",
              disabled 
                ? "opacity-50 cursor-not-allowed" 
                : "text-accent hover:scale-110 hover:bg-accent hover:text-white active:scale-95"
            )}
            aria-label="Nieuw project"
          >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>
        ) : (
          // Placeholder to maintain 3-button layout symmetry
          <div className="w-14 h-14" />
        )}
      </div>
    </div>
  );
};
