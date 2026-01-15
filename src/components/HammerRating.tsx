interface HammerRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  reviewCount?: number;
}

export const HammerRating = ({
  rating,
  maxRating = 5,
  size = 'md',
  showCount = false,
  reviewCount,
}: HammerRatingProps) => {
  const fullHammers = Math.floor(rating);

  const sizeClasses = {
    sm: 'text-[10px]',
    md: 'text-sm',
    lg: 'text-lg',
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const isFilled = i < fullHammers;
          return (
            <span
              key={i}
              className={`${sizeClasses[size]} leading-none ${isFilled ? '' : 'opacity-30 grayscale'}`}
              role="img"
              aria-label={isFilled ? 'filled hammer' : 'empty hammer'}
            >
              🔨
            </span>
          );
        })}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-muted-foreground text-sm ml-1">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
