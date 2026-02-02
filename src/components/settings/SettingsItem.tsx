import { ChevronRight, type LucideIcon } from 'lucide-react';

interface SettingsItemProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

export const SettingsItem = ({ 
  icon: Icon, 
  label, 
  description, 
  onClick, 
  rightElement,
  destructive = false
}: SettingsItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-b-0 ${
      destructive ? 'hover:bg-destructive/5' : ''
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
      destructive ? 'bg-destructive/10' : 'bg-primary/10'
    }`}>
      <Icon className={`w-5 h-5 ${destructive ? 'text-destructive' : 'text-primary'}`} />
    </div>
    <div className="flex-1">
      <p className={`font-medium ${destructive ? 'text-destructive' : 'text-foreground'}`}>
        {label}
      </p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {rightElement || <ChevronRight className="w-5 h-5 text-muted-foreground" />}
  </button>
);
