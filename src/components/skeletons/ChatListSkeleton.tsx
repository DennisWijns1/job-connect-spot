import { Skeleton } from '@/components/ui/skeleton';

export const ChatListSkeleton = () => (
  <div className="space-y-0">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-border">
        <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
        <Skeleton className="h-3 w-10" />
      </div>
    ))}
  </div>
);
