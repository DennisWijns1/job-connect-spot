import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface QuizComponentProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
}

export const QuizComponent = ({ questions, onComplete }: QuizComponentProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[currentIndex];
  const isCorrect = selectedAnswer === current?.correct_index;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === current.correct_index) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setFinished(true);
      onComplete(score + (isCorrect ? 0 : 0), questions.length);
    }
  };

  if (finished) {
    const finalScore = score;
    const pct = Math.round((finalScore / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border bg-card p-6 text-center space-y-4"
      >
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${pct >= 70 ? 'bg-success/20' : 'bg-accent/20'}`}>
          {pct >= 70 ? (
            <CheckCircle className="w-8 h-8 text-success" />
          ) : (
            <HelpCircle className="w-8 h-8 text-accent" />
          )}
        </div>
        <h3 className="text-lg font-bold text-foreground">
          {pct >= 70 ? 'Uitstekend!' : 'Blijf oefenen!'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Je score: {finalScore}/{questions.length} ({pct}%)
        </p>
      </motion.div>
    );
  }

  if (!current) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Vraag {currentIndex + 1} van {questions.length}</span>
        <span>Score: {score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-3"
        >
          <h4 className="text-sm font-semibold text-foreground">{current.question}</h4>

          <div className="space-y-2">
            {current.options.map((option, i) => {
              let variant: 'outline' | 'default' | 'destructive' = 'outline';
              let extraClass = '';

              if (showResult) {
                if (i === current.correct_index) {
                  extraClass = 'border-success bg-success/10 text-success';
                } else if (i === selectedAnswer) {
                  extraClass = 'border-destructive bg-destructive/10 text-destructive';
                }
              } else if (i === selectedAnswer) {
                extraClass = 'border-primary bg-primary/10';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={showResult}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${extraClass || 'border-border bg-card hover:border-primary/50'} disabled:cursor-default`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{option}</span>
                    {showResult && i === current.correct_index && (
                      <CheckCircle className="w-4 h-4 text-success ml-auto flex-shrink-0" />
                    )}
                    {showResult && i === selectedAnswer && i !== current.correct_index && (
                      <XCircle className="w-4 h-4 text-destructive ml-auto flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg text-sm ${isCorrect ? 'bg-success/10 border border-success/20' : 'bg-accent/10 border border-accent/20'}`}
            >
              <p className="text-foreground">{current.explanation}</p>
            </motion.div>
          )}

          {showResult && (
            <Button onClick={handleNext} className="w-full">
              {currentIndex + 1 < questions.length ? 'Volgende vraag' : 'Bekijk resultaat'}
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
