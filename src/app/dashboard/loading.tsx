import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Stats row skeleton */}
      <div className="grid grid-cols-4 gap-2 border border-border rounded-sm bg-card p-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center space-y-1.5">
            <Skeleton className="h-2.5 w-12 mx-auto" />
            <Skeleton className="h-7 w-10 mx-auto" />
          </div>
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Bug list skeleton */}
      <div className="border border-border rounded-sm bg-card divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-4 w-14 rounded-sm" />
            <Skeleton className="h-3 w-14 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
