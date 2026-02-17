import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, RotateCcw, GripVertical } from 'lucide-react';

export interface DragDropExercise {
  instruction: string;
  items: string[];
  targets: string[];
  correct_mapping: Record<string, string>; // item -> target
}

interface DragDropComponentProps {
  exercises: DragDropExercise[];
  onComplete: (score: number, total: number) => void;
}

export const DragDropComponent = ({ exercises, onComplete }: DragDropComponentProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = exercises[currentIndex];

  const handleItemClick = (item: string) => {
    if (checked) return;
    if (selectedItem === item) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const handleTargetClick = (target: string) => {
    if (checked || !selectedItem) return;
    setPlacements((prev) => {
      const next = { ...prev };
      // Remove item from any previous target
      Object.keys(next).forEach((k) => {
        if (next[k] === target) delete next[k];
      });
      next[selectedItem] = target;
      return next;
    });
    setSelectedItem(null);
  };

  const handleCheck = () => {
    if (!current) return;
    setChecked(true);
    let correct = 0;
    Object.entries(current.correct_mapping).forEach(([item, target]) => {
      if (placements[item] === target) correct++;
    });
    setScore((s) => s + correct);
  };

  const handleNext = () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((i) => i + 1);
      setPlacements({});
      setSelectedItem(null);
      setChecked(false);
    } else {
      setFinished(true);
      const totalItems = exercises.reduce((sum, ex) => sum + Object.keys(ex.correct_mapping).length, 0);
      onComplete(score, totalItems);
    }
  };

  const handleReset = () => {
    setPlacements({});
    setSelectedItem(null);
    setChecked(false);
  };

  if (finished) {
    const totalItems = exercises.reduce((sum, ex) => sum + Object.keys(ex.correct_mapping).length, 0);
    const pct = Math.round((score / totalItems) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border bg-card p-6 text-center space-y-4"
      >
        <CheckCircle className="w-12 h-12 text-success mx-auto" />
        <h3 className="text-lg font-bold text-foreground">Oefening voltooid!</h3>
        <p className="text-sm text-muted-foreground">
          {score}/{totalItems} correct ({pct}%)
        </p>
      </motion.div>
    );
  }

  if (!current) return null;

  const placedItems = new Set(Object.keys(placements));
  const unplacedItems = current.items.filter((item) => !placedItems.has(item));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Oefening {currentIndex + 1} van {exercises.length}</span>
      </div>

      <h4 className="text-sm font-semibold text-foreground">{current.instruction}</h4>

      {/* Available items */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase font-semibold">Sleep items</p>
        <div className="flex flex-wrap gap-2">
          {unplacedItems.map((item) => (
            <motion.button
              key={item}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleItemClick(item)}
              className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition-all ${
                selectedItem === item
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <GripVertical className="w-3 h-3 text-muted-foreground" />
              {item}
            </motion.button>
          ))}
          {unplacedItems.length === 0 && !checked && (
            <p className="text-xs text-muted-foreground italic">Alle items geplaatst</p>
          )}
        </div>
      </div>

      {/* Targets */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase font-semibold">Doelen</p>
        {current.targets.map((target) => {
          const itemsInTarget = Object.entries(placements)
            .filter(([, t]) => t === target)
            .map(([item]) => item);

          let isCorrectTarget = false;
          let isWrongTarget = false;
          if (checked) {
            itemsInTarget.forEach((item) => {
              if (current.correct_mapping[item] === target) isCorrectTarget = true;
              else isWrongTarget = true;
            });
          }

          return (
            <div
              key={target}
              onClick={() => handleTargetClick(target)}
              className={`p-3 rounded-lg border-2 border-dashed min-h-[56px] transition-all cursor-pointer ${
                selectedItem
                  ? 'border-primary/50 bg-primary/5'
                  : checked && isCorrectTarget && !isWrongTarget
                  ? 'border-success bg-success/5'
                  : checked && isWrongTarget
                  ? 'border-destructive bg-destructive/5'
                  : 'border-border bg-muted/30'
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground mb-1">{target}</p>
              <div className="flex flex-wrap gap-1">
                {itemsInTarget.map((item) => {
                  const correct = checked && current.correct_mapping[item] === target;
                  return (
                    <span
                      key={item}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!checked) {
                          setPlacements((prev) => {
                            const next = { ...prev };
                            delete next[item];
                            return next;
                          });
                        }
                      }}
                      className={`px-2 py-1 rounded text-xs border ${
                        checked
                          ? correct
                            ? 'bg-success/20 border-success/30 text-success'
                            : 'bg-destructive/20 border-destructive/30 text-destructive'
                          : 'bg-card border-border cursor-pointer hover:border-destructive/50'
                      }`}
                    >
                      {item}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        {!checked ? (
          <>
            <Button variant="outline" onClick={handleReset} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button
              onClick={handleCheck}
              className="flex-1"
              disabled={Object.keys(placements).length === 0}
            >
              Controleer
            </Button>
          </>
        ) : (
          <Button onClick={handleNext} className="w-full">
            {currentIndex + 1 < exercises.length ? 'Volgende oefening' : 'Bekijk resultaat'}
          </Button>
        )}
      </div>
    </div>
  );
};
