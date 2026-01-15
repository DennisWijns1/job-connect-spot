import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProblemInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (problem: string) => void;
}

const suggestionPrompts = [
  { icon: '🔧', text: 'De kraan lekt' },
  { icon: '💡', text: 'Lamp werkt niet meer' },
  { icon: '🌿', text: 'Tuin moet gemaaid worden' },
  { icon: '🧱', text: 'Tegels leggen in badkamer' },
  { icon: '🎨', text: 'Muur moet geschilderd worden' },
  { icon: '🔌', text: 'Stopcontact werkt niet' },
];

export const ProblemInputDialog = ({ isOpen, onClose, onSubmit }: ProblemInputDialogProps) => {
  const [problem, setProblem] = useState('');

  const handleSubmit = () => {
    if (problem.trim()) {
      onSubmit(problem.trim());
      setProblem('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSubmit(suggestion);
    setProblem('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 pb-8 shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            {/* Handle bar */}
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-5 h-5 text-secondary" />
            </button>

            {/* Title */}
            <div className="mb-6">
              <h2 className="font-display font-bold text-xl text-foreground mb-2">
                Wat is je probleem?
              </h2>
              <p className="text-secondary text-sm">
                Beschrijf kort wat je nodig hebt, we filteren direct op de juiste handy's
              </p>
            </div>

            {/* Search input */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
              <Input
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Bijv. 'de kraan lekt' of 'lamp ophangen'"
                className="pl-12 pr-4 h-14 text-base rounded-2xl border-2 border-border focus:border-primary bg-background"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={!problem.trim()}
              className="w-full h-14 rounded-2xl text-base font-semibold mb-6"
            >
              <Search className="w-5 h-5 mr-2" />
              Zoek Handy's
            </Button>

            {/* Suggestions */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-secondary">Populaire problemen</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {suggestionPrompts.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-left"
                  >
                    <span className="text-xl">{suggestion.icon}</span>
                    <span className="text-sm text-foreground">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skip button */}
            <button
              onClick={onClose}
              className="w-full py-3 text-secondary text-sm hover:text-foreground transition-colors"
            >
              Overslaan en direct beginnen swipen →
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
