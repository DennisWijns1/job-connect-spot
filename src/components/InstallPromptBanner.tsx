import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const InstallPromptBanner = () => {
  const { t } = useTranslation();
  const { showPrompt, isInstalled, isIOS, canInstall, install, dismiss } = useInstallPrompt();
  const [showIOSDialog, setShowIOSDialog] = useState(false);

  if (isInstalled || !showPrompt) return null;

  const handleInstall = () => {
    if (isIOS) {
      setShowIOSDialog(true);
    } else {
      install();
    }
  };

  return (
    <>
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto"
          >
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {t('install.prompt', 'Installeer HandyMatch voor de beste ervaring')}
                </p>
              </div>
              <Button size="sm" onClick={handleInstall} className="rounded-xl text-xs h-8 flex-shrink-0">
                {t('install.install', 'Installeren')}
              </Button>
              <button onClick={dismiss} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Install Instructions Dialog */}
      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              {t('install.iosTitle', 'Installeer HandyMatch')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">1</div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t('install.iosStep1', 'Tik op het deel-icoon in Safari')}
                </p>
                <Share className="w-5 h-5 text-muted-foreground mt-1" />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">2</div>
              <p className="text-sm font-medium text-foreground">
                {t('install.iosStep2', "Kies 'Voeg toe aan beginscherm'")}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">3</div>
              <p className="text-sm font-medium text-foreground">
                {t('install.iosStep3', 'Geniet van HandyMatch als app!')}
              </p>
            </div>
          </div>
          <Button onClick={() => { setShowIOSDialog(false); dismiss(); }} className="w-full rounded-xl">
            {t('common.understood', 'Begrepen')}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
