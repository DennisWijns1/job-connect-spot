import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { motion, AnimatePresence } from 'framer-motion';

export const PushNotificationBanner = () => {
  const { t } = useTranslation();
  const { permission, isSubscribed, isSupported, subscribe } = usePushNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isSupported || isSubscribed || permission === 'denied') return;

    const dismissed = localStorage.getItem('handymatch_push_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 30 * 24 * 60 * 60 * 1000) return;

    // Show after short delay on first login
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission]);

  const handleEnable = async () => {
    await subscribe();
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('handymatch_push_dismissed', String(Date.now()));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">
                  {t('notifications.stayUpdated', 'Blijf op de hoogte')}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('notifications.pushDescription', 'Ontvang weerwaarschuwingen en herinneringen voor keuringen op tijd')}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleEnable} className="rounded-xl text-xs h-8">
                    {t('notifications.enable', 'Meldingen inschakelen')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDismiss} className="rounded-xl text-xs h-8">
                    {t('notifications.notNow', 'Niet nu')}
                  </Button>
                </div>
              </div>
              <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
