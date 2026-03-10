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
        "fixed bottom-24 left-4 w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 border z-40",
        "bg-background border-border text-primary",
        disabled || !onClick
          ? "opacity-50 cursor-not-allowed" 
          : "hover:scale-110 hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95"
      )}
      aria-label={label}
    >
      <Plus className="w-5 h-5" strokeWidth={2.5} />
    </button>
  );
};
