import { useState } from 'react';
import { AlertTriangle, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EmergencyButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Zone 4: Safety Layer - Floating Emergency Button - Soft Peach */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 w-10 h-10 rounded-full bg-secondary shadow-lg flex items-center justify-center z-40 hover:scale-110 transition-transform active:scale-95"
        aria-label="Noodhulp"
      >
        <AlertTriangle className="w-5 h-5 text-secondary-foreground" />
      </button>

      {/* Emergency Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-[32px] p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-secondary-foreground" />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="font-display font-extrabold text-xl text-foreground mb-2">
                Noodhulp
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Voel je je onveilig? We staan klaar om te helpen. Klik om direct de hulpdiensten te contacteren.
              </p>

              <div className="space-y-3">
                <a
                  href="tel:112"
                  className="flex items-center gap-4 w-full p-4 bg-destructive text-destructive-foreground rounded-2xl font-bold hover:brightness-110 transition-all"
                >
                  <Phone className="w-6 h-6" />
                  <div>
                    <p className="font-bold">Bel 112</p>
                    <p className="text-sm opacity-80">Nooddiensten</p>
                  </div>
                </a>

                <button className="flex items-center gap-4 w-full p-4 bg-accent/20 text-foreground rounded-2xl font-semibold hover:bg-accent/30 transition-all">
                  <AlertTriangle className="w-6 h-6 text-accent-foreground" />
                  <div className="text-left">
                    <p className="font-bold">Meld incident</p>
                    <p className="text-sm text-muted-foreground">Mensen in de buurt verwittigen</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
