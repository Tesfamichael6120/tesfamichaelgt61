import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex gap-4">
          {/* Company Logo Skeleton */}
          <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />

          {/* Job Info Skeleton */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>

            {/* Meta Info Skeleton */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>

            {/* Footer Skeleton */}
            <div className="mt-4 flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
