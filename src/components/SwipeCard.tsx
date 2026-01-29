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
  stackIndex?: number;
  onCardClick?: () => void;
}

export const SwipeCard = ({
  item,
  type,
  onSwipeLeft,
  onSwipeRight,
  isTop,
  stackIndex = 0,
  onCardClick,
}: SwipeCardProps) => {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  // Stack effect: cards behind are slightly smaller and offset
  const stackScale = 1 - stackIndex * 0.04;
  const stackY = stackIndex * 8;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(400);
      onSwipeRight();
    } else if (info.offset.x < -100) {
      setExitX(-400);
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      className={cn(
        'absolute inset-0 touch-none',
        isTop ? 'z-10' : 'z-0'
      )}
      style={{ 
        x: isTop ? x : 0, 
        rotate: isTop ? rotate : 0, 
        opacity: isTop ? opacity : 1,
        scale: stackScale,
        y: stackY,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Like overlay - Hammer */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-accent/30 rounded-3xl z-20 pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <div className="bg-accent text-accent-foreground px-8 py-4 rounded-2xl font-bold text-3xl rotate-[-15deg] border-4 border-accent-foreground flex items-center gap-3 shadow-2xl">
          <span className="text-4xl">🔨</span>
          MATCH
        </div>
      </motion.div>

      {/* Nope overlay - X */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-destructive/30 rounded-3xl z-20 pointer-events-none"
        style={{ opacity: nopeOpacity }}
      >
        <div className="bg-destructive text-destructive-foreground px-8 py-4 rounded-2xl font-bold text-3xl rotate-[15deg] border-4 border-destructive-foreground flex items-center gap-3 shadow-2xl">
          <X className="w-10 h-10" />
          NOPE
        </div>
      </motion.div>

      {/* Card content - full height */}
      <div 
        className="w-full h-full"
        onClick={(e) => {
          if (onCardClick && Math.abs(x.get()) < 10) {
            e.stopPropagation();
            onCardClick();
          }
        }}
      >
        {type === 'handy' ? (
          <HandyCard handy={item as HandyProfile} className="h-full" />
        ) : (
          <ProjectCard project={item as Project} className="h-full" />
        )}
      </div>
    </motion.div>
  );
};