import { Home, Map, MessageCircle, Bot, User, MessagesSquare, GraduationCap, LayoutDashboard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const userType = localStorage.getItem('handymatch_userType') || 'seeker';
  const isSeeker = userType === 'seeker';

  const navItems = isSeeker ? [
    { icon: Bot, label: t('nav.aiHelp'), path: '/ai' },
    { icon: LayoutDashboard, label: t('nav.dashboard', 'Dashboard'), path: '/dashboard' },
    { icon: MessagesSquare, label: t('nav.quickChat'), path: '/quick-chat', highlight: true },
    { icon: Home, label: t('nav.swipe'), path: '/swipe' },
    { icon: MessageCircle, label: t('nav.chats'), path: '/chats' },
    { icon: User, label: t('nav.profile'), path: '/profile' },
  ] : [
    { icon: Home, label: t('nav.swipe'), path: '/swipe' },
    { icon: Map, label: t('nav.map'), path: '/map' },
    { icon: GraduationCap, label: t('nav.lessons'), path: '/learning', highlight: true },
    { icon: Bot, label: t('nav.aiHelp'), path: '/ai' },
    { icon: MessageCircle, label: t('nav.chats'), path: '/chats' },
    { icon: User, label: t('nav.profile'), path: '/profile' },
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
