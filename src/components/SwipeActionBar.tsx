import { X, Hammer } from 'lucide-react';
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
    <div className="py-4 flex-shrink-0">
      <div className="flex items-center justify-center gap-6">
        {/* Reject button (❌) - 56x56px - White with red X */}
        <button
          onClick={onReject}
          disabled={disabled}
          className={cn(
            "w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center transition-all duration-200 border-2 border-transparent",
            disabled 
              ? "opacity-50 cursor-not-allowed" 
              : "text-destructive hover:scale-110 hover:bg-destructive hover:text-white hover:border-destructive active:scale-95"
          )}
          aria-label="Overslaan"
        >
          <X className="w-6 h-6" strokeWidth={3} />
        </button>

        {/* Accept button (🔨) - 72x72px - Vivid Sunshine with black hammer */}
        <button
          onClick={onAccept}
          disabled={disabled}
          className={cn(
            "w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-200",
            "bg-accent shadow-button",
            disabled 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:scale-110 active:scale-95 hover:shadow-[0_8px_35px_-5px_rgba(253,224,71,0.70)]"
          )}
          aria-label="Match"
        >
          <Hammer className="w-8 h-8 text-black" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
