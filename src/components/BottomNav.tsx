import { Home, Map, MessageCircle, Bot, User, MessagesSquare, GraduationCap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isSeeker = userType === 'seeker';

  const navItems = isSeeker ? [
    { icon: Bot, label: 'AI Hulp', path: '/ai' },
    { icon: Map, label: 'Kaart', path: '/map' },
    { icon: MessagesSquare, label: 'Quick Chat', path: '/quick-chat', highlight: true },
    { icon: Home, label: 'Swipe', path: '/swipe' },
    { icon: MessageCircle, label: 'Chats', path: '/chats' },
    { icon: User, label: 'Profiel', path: '/profile' },
  ] : [
    { icon: Home, label: 'Swipe', path: '/swipe' },
    { icon: Map, label: 'Kaart', path: '/map' },
    { icon: GraduationCap, label: 'Lessen', path: '/learning', highlight: true },
    { icon: Bot, label: 'AI Hulp', path: '/ai' },
    { icon: MessageCircle, label: 'Chats', path: '/chats' },
    { icon: User, label: 'Profiel', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, path, highlight }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 min-w-[44px] min-h-[44px] rounded-2xl transition-all duration-300 relative',
                isActive
                  ? 'text-primary bg-primary/10'
                  : highlight
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {highlight && !isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 transition-all duration-300',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className={cn("text-[11px]", isActive ? "font-semibold" : "font-medium")}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};