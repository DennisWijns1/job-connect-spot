import { cn } from '@/lib/utils';

interface HammerRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  reviewCount?: number;
}

const Hammer = ({ filled, size }: { filled: boolean; size: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <svg
      className={cn(
        sizeClasses[size],
        'transition-all duration-200',
        filled ? 'text-accent' : 'text-muted-foreground/30'
      )}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
    >
      <path d="M14.5 3.5L18.5 7.5L9.5 16.5L3.5 18.5L5.5 12.5L14.5 3.5Z" />
      <path d="M14 4L18 8" />
      <path d="M19 2L22 5L20 7L17 4L19 2Z" />
    </svg>
  );
};

export const HammerRating = ({
  rating,
  maxRating = 5,
  size = 'md',
  showCount = false,
  reviewCount,
}: HammerRatingProps) => {
  const fullHammers = Math.floor(rating);
  const hasHalfHammer = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => (
          <Hammer
            key={i}
            filled={i < fullHammers || (i === fullHammers && hasHalfHammer)}
            size={size}
          />
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-muted-foreground text-sm ml-1">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
