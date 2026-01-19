import { LayoutDashboard, BookOpen, Users, Star, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstructorBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const InstructorBottomNav = ({ activeTab, onTabChange }: InstructorBottomNavProps) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Overzicht', value: 'overview' },
    { icon: BookOpen, label: 'Lessen', value: 'lessons' },
    { icon: Users, label: 'Deelnemers', value: 'enrollments' },
    { icon: Star, label: 'Reviews', value: 'reviews' },
    { icon: UserCircle, label: 'Profiel', value: 'profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-secondary border-t border-secondary/20 safe-area-bottom z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, value }) => {
          const isActive = activeTab === value;
          return (
            <button
              key={value}
              onClick={() => onTabChange(value)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-2 rounded-[16px] transition-all duration-300 relative',
                isActive
                  ? 'text-primary bg-primary/20'
                  : 'text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-primary/10'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-all duration-300',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <div className="absolute -bottom-0.5 w-4 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
