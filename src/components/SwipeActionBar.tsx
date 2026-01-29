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
  return (
    <div className="py-3 flex-shrink-0">
      <div className="flex items-center justify-center gap-6 max-w-md mx-auto px-4">
        {/* Left: Reject button (❌) - 64x64px */}
        <button
          onClick={onReject}
          disabled={disabled}
          className={cn(
            "w-16 h-16 rounded-full bg-card shadow-lg flex items-center justify-center transition-all duration-200 border-2 border-destructive/20",
            disabled 
              ? "opacity-50 cursor-not-allowed" 
              : "text-destructive hover:scale-110 hover:bg-destructive hover:text-white hover:border-destructive active:scale-95"
          )}
          aria-label="Weigeren"
        >
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>

        {/* Center: Accept button (🔨) - 64x64px */}
        <button
          onClick={onAccept}
          disabled={disabled}
          className={cn(
            "w-16 h-16 rounded-full bg-accent shadow-lg flex items-center justify-center transition-all duration-200 border-2 border-accent",
            disabled 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:scale-110 active:scale-95 hover:shadow-xl"
          )}
          aria-label="Match"
        >
          <span className="text-3xl">🔨</span>
        </button>

        {/* Right: New project button (➕) - 64x64px */}
        <button
          onClick={onThirdAction}
          disabled={disabled || !onThirdAction}
          className={cn(
            "w-16 h-16 rounded-full bg-card shadow-lg flex items-center justify-center transition-all duration-200 border-2 border-accent/20",
            disabled || !onThirdAction
              ? "opacity-50 cursor-not-allowed" 
              : "text-accent hover:scale-110 hover:bg-accent hover:text-white hover:border-accent active:scale-95"
          )}
          aria-label={thirdActionLabel}
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};