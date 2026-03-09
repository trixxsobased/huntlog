import { Skeleton } from "@/components/ui/skeleton";

export default function BugListLoading() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-24 rounded-sm" />
      </div>

      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-[110px] rounded-sm" />
        <Skeleton className="h-7 w-[110px] rounded-sm" />
        <div className="flex-1" />
        <Skeleton className="h-3 w-20" />
      </div>

      <div className="border border-border rounded-sm bg-card divide-y divide-border">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-4 w-14 rounded-sm" />
            <Skeleton className="h-3 w-14 hidden sm:block" />
            <Skeleton className="h-3 w-12 hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
