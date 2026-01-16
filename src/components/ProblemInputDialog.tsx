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
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Dialog - Smaller and centered at bottom */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 z-50 bg-card rounded-2xl p-5 shadow-card-hover max-w-md mx-auto border border-border"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Title */}
            <div className="mb-4 pr-8">
              <h2 className="font-display font-bold text-lg text-foreground">
                Wat is je probleem?
              </h2>
              <p className="text-muted-foreground text-sm">
                We filteren direct op de juiste handy's
              </p>
            </div>

            {/* Search input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Bijv. 'de kraan lekt'"
                className="pl-10 pr-4 h-12 text-sm rounded-xl border-border focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={!problem.trim()}
              className="w-full h-11 rounded-xl text-sm font-semibold mb-4 bg-gradient-to-r from-primary to-primary/90 hover:brightness-110"
            >
              <Search className="w-4 h-4 mr-2" />
              Zoek Handy's
            </Button>

            {/* Suggestions */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium text-muted-foreground">Populaire problemen</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestionPrompts.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                  >
                    <span className="text-base">{suggestion.icon}</span>
                    <span className="text-xs text-foreground group-hover:text-primary transition-colors">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skip button */}
            <button
              onClick={onClose}
              className="w-full py-2 text-muted-foreground text-xs hover:text-foreground transition-colors"
            >
              Overslaan en direct beginnen swipen →
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};