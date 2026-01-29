import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeActionBarProps {
  onReject: () => void;
  onAccept: () => void;
  disabled?: boolean;
}

export const SwipeActionBar = ({
  onReject,
  onAccept,
  disabled = false,
}: SwipeActionBarProps) => {
  return (
    <div className="py-3 flex-shrink-0">
      <div className="flex items-center justify-center gap-8">
        {/* Reject button (❌) - 64x64px - Dark red contrast */}
        <button
          onClick={onReject}
          disabled={disabled}
          className={cn(
            "w-16 h-16 rounded-full bg-card shadow-lg flex items-center justify-center transition-all duration-200 border-2",
            disabled 
              ? "opacity-50 cursor-not-allowed border-muted" 
              : "border-destructive/30 text-destructive hover:scale-110 hover:bg-destructive hover:text-white hover:border-destructive active:scale-95"
          )}
          aria-label="Weigeren"
        >
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>

        {/* Accept button (🔨) - 64x64px - Electric Ochre */}
        <button
          onClick={onAccept}
          disabled={disabled}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 border-2",
            "bg-accent border-accent shadow-button",
            disabled 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:scale-110 active:scale-95 hover:shadow-[0_6px_28px_-4px_rgba(226,176,7,0.60)]"
          )}
          aria-label="Match"
        >
          <span className="text-3xl">🔨</span>
        </button>
      </div>
    </div>
  );
};
