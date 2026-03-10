import { Skeleton } from '@/components/ui/skeleton';

export const SwipeCardSkeleton = () => (
  <div className="w-full max-w-[450px] rounded-3xl bg-card border border-border overflow-hidden">
    <Skeleton className="h-64 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  </div>
);
