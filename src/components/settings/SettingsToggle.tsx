import { type LucideIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface SettingsToggleProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const SettingsToggle = ({ 
  icon: Icon, 
  label, 
  description, 
  checked, 
  onCheckedChange 
}: SettingsToggleProps) => (
  <div className="flex items-center gap-4 p-4 border-b border-border last:border-b-0">
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-foreground">{label}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);
