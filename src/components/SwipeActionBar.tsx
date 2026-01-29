import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeActionBarProps {
  onReject: () => void;
  onAccept: () => void;
  onThirdAction?: () => void;
  thirdActionLabel?: string;
  disabled?: boolean;
}

export const SwipeActionBar = ({
  onReject,
  onAccept,
  onThirdAction,
  thirdActionLabel = "Actie",
  disabled = false,
}: SwipeActionBarProps) => {
  // Button size constants for consistent sizing (8pt grid)
  const buttonSize = 56; // 56px = 7 * 8pt
  const centerButtonSize = 72; // 72px = 9 * 8pt
  const gap = 32; // 32px = 4 * 8pt

  return (
    // Zone 3: Swipe Action Zone - Fixed height 96px (12 * 8pt)
    <div className="h-24 flex-shrink-0 bg-background border-t border-border">
      <div 
        className="h-full flex items-center justify-center px-4 max-w-md mx-auto"
        style={{ gap: `${gap}px` }}
      >
        {/* Left: Reject button (❌) - Fixed 56px */}
        <button
          onClick={onReject}
          disabled={disabled}
          className={cn(
            "rounded-full bg-card shadow-card flex items-center justify-center transition-all duration-200 border-2 border-destructive/30",
            disabled 
              ? "opacity-50 cursor-not-allowed" 
              : "text-destructive hover:scale-110 hover:bg-destructive hover:text-white active:scale-95"
          )}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          aria-label="Weigeren"
        >
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>

        {/* Center: Accept button (🔨) - Fixed 72px */}
        <button
          onClick={onAccept}
          disabled={disabled}
          className={cn(
            "rounded-full bg-accent shadow-card-hover flex items-center justify-center transition-all duration-200",
            disabled 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:scale-110 active:scale-95"
          )}
          style={{ width: `${centerButtonSize}px`, height: `${centerButtonSize}px` }}
          aria-label="Accepteren"
        >
          <span className="text-4xl">🔨</span>
        </button>

        {/* Right: New project button (➕) - Fixed 56px */}
        <button
          onClick={onThirdAction}
          disabled={disabled || !onThirdAction}
          className={cn(
            "rounded-full bg-card shadow-card flex items-center justify-center transition-all duration-200 border-2 border-accent/30",
            disabled || !onThirdAction
              ? "opacity-50 cursor-not-allowed" 
              : "text-accent hover:scale-110 hover:bg-accent hover:text-white active:scale-95"
          )}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          aria-label={thirdActionLabel}
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
