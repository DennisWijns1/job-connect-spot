import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { HandyProfile, Project } from '@/types/handymatch';
import { HandyCard } from './HandyCard';
import { ProjectCard } from './ProjectCard';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeCardProps {
  item: HandyProfile | Project;
  type: 'handy' | 'project';
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
}

export const SwipeCard = ({
  item,
  type,
  onSwipeLeft,
  onSwipeRight,
  isTop,
}: SwipeCardProps) => {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(300);
      onSwipeRight();
    } else if (info.offset.x < -100) {
      setExitX(-300);
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      className={cn(
        'absolute w-full touch-none',
        isTop ? 'z-10' : 'z-0'
      )}
      style={{ x, rotate, opacity }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Like overlay - Hammer */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-accent/20 rounded-3xl z-20 pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <div className="bg-accent text-accent-foreground px-6 py-3 rounded-2xl font-bold text-2xl rotate-[-15deg] border-4 border-accent-foreground flex items-center gap-2">
          <span className="text-3xl">🔨</span>
          CHAT
        </div>
      </motion.div>

      {/* Nope overlay - X */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-destructive/20 rounded-3xl z-20 pointer-events-none"
        style={{ opacity: nopeOpacity }}
      >
        <div className="bg-destructive text-destructive-foreground px-6 py-3 rounded-2xl font-bold text-2xl rotate-[15deg] border-4 border-destructive-foreground flex items-center gap-2">
          <X className="w-8 h-8" />
          NOPE
        </div>
      </motion.div>

      {type === 'handy' ? (
        <HandyCard handy={item as HandyProfile} />
      ) : (
        <ProjectCard project={item as Project} />
      )}
    </motion.div>
  );
};

interface SwipeButtonsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export const SwipeButtons = ({ onSwipeLeft, onSwipeRight }: SwipeButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-12 py-4">
      {/* X Button - Reject */}
      <button
        onClick={onSwipeLeft}
        className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-destructive hover:scale-110 hover:bg-destructive hover:text-white transition-all duration-200 active:scale-95 border-2 border-destructive/30"
        aria-label="Weigeren"
      >
        <X className="w-8 h-8" strokeWidth={3} />
      </button>

      {/* Hammer Button - Accept/Chat */}
      <button
        onClick={onSwipeRight}
        className="w-20 h-20 rounded-full bg-accent shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 active:scale-95"
        aria-label="Accepteren"
      >
        <span className="text-4xl">🔨</span>
      </button>
    </div>
  );
};
