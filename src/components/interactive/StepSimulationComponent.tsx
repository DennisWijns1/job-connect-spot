import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

export interface SimulationStep {
  scenario: string;
  options: string[];
  correct_index: number;
  feedback_correct: string;
  feedback_wrong: string;
}

interface StepSimulationComponentProps {
  title: string;
  steps: SimulationStep[];
  onComplete: (score: number, total: number) => void;
}

export const StepSimulationComponent = ({ title, steps, onComplete }: StepSimulationComponentProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const current = steps[currentIndex];
  const isCorrect = selected === current?.correct_index;

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelected(index);
    setShowFeedback(true);
    if (index === current.correct_index) {
      setScore((s) => s + 1);
    } else {
      setMistakes((m) => [...m, currentIndex]);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < steps.length) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      setFinished(true);
      onComplete(score + (isCorrect ? 0 : 0), steps.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelected(null);
    setShowFeedback(false);
    setScore(0);
    setMistakes([]);
    setFinished(false);
  };

  if (finished) {
    const finalScore = score;
    const pct = Math.round((finalScore / steps.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border bg-card p-6 space-y-4"
      >
        <div className="text-center space-y-3">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${pct >= 70 ? 'bg-success/20' : 'bg-accent/20'}`}>
            {pct >= 70 ? (
              <CheckCircle className="w-8 h-8 text-success" />
            ) : (
              <RotateCcw className="w-8 h-8 text-accent" />
            )}
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {pct === 100 ? 'Perfect!' : pct >= 70 ? 'Goed gedaan!' : 'Probeer opnieuw'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {finalScore}/{steps.length} stappen correct ({pct}%)
          </p>
        </div>

        {mistakes.length > 0 && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-accent uppercase">Aandachtspunten</p>
            {mistakes.map((mi) => (
              <p key={mi} className="text-xs text-foreground">
                Stap {mi + 1}: {steps[mi].feedback_correct}
              </p>
            ))}
          </div>
        )}

        {pct < 100 && (
          <Button onClick={handleRestart} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Opnieuw proberen
          </Button>
        )}
      </motion.div>
    );
  }

  if (!current) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">{title}</h4>
        <span className="text-xs text-muted-foreground">
          Stap {currentIndex + 1}/{steps.length}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < currentIndex
                ? mistakes.includes(i)
                  ? 'bg-destructive/60'
                  : 'bg-success'
                : i === currentIndex
                ? 'bg-primary'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-3"
        >
          <div className="bg-muted/50 rounded-lg p-4 border">
            <p className="text-sm text-foreground">{current.scenario}</p>
          </div>

          <p className="text-xs text-muted-foreground">Wat doe je nu?</p>

          <div className="space-y-2">
            {current.options.map((option, i) => {
              let extraClass = 'border-border bg-card hover:border-primary/50';
              if (showFeedback) {
                if (i === current.correct_index) {
                  extraClass = 'border-success bg-success/10';
                } else if (i === selected) {
                  extraClass = 'border-destructive bg-destructive/10';
                } else {
                  extraClass = 'border-border bg-card opacity-50';
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={showFeedback}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${extraClass} disabled:cursor-default`}
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span>{option}</span>
                    {showFeedback && i === current.correct_index && (
                      <CheckCircle className="w-4 h-4 text-success ml-auto flex-shrink-0" />
                    )}
                    {showFeedback && i === selected && i !== current.correct_index && (
                      <XCircle className="w-4 h-4 text-destructive ml-auto flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg text-sm ${isCorrect ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}
            >
              <p className="text-foreground">
                {isCorrect ? current.feedback_correct : current.feedback_wrong}
              </p>
            </motion.div>
          )}

          {showFeedback && (
            <Button onClick={handleNext} className="w-full">
              {currentIndex + 1 < steps.length ? 'Volgende stap' : 'Bekijk resultaat'}
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
