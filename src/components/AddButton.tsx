import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddButtonProps {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
}

export const AddButton = ({
  onClick,
  label = "Nieuw",
  disabled = false,
}: AddButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      className={cn(
        "fixed bottom-24 left-4 w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center transition-all duration-200 border-2 border-accent/20 z-40",
        disabled || !onClick
          ? "opacity-50 cursor-not-allowed" 
          : "text-accent hover:scale-110 hover:bg-accent hover:text-white hover:border-accent active:scale-95"
      )}
      aria-label={label}
    >
      <Plus className="w-5 h-5" strokeWidth={2.5} />
    </button>
  );
};
