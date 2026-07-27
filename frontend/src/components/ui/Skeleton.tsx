import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-dsce-blue/10", className)}
      {...props}
    />
  )
}

/**
 * Loading skeleton component for displaying loading states
 * Mimics the shape of content while data is loading
 */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow p-6 border border-dsce-blue/5">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded-lg w-full animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded-lg w-5/6 animate-pulse"></div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"
          style={{
            width: i === lines - 1 ? '80%' : '100%',
          }}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonAvatar() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
        <div className="h-3 bg-gray-100 rounded-lg w-24 animate-pulse"></div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="flex gap-3 mb-4 pb-4 border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={`header-${i}`}
            className="h-4 bg-gray-200 rounded-lg flex-1 animate-pulse"
          ></div>
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-3 mb-3">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={`cell-${rowIdx}-${colIdx}`}
              className="h-4 bg-gray-100 rounded-lg flex-1 animate-pulse"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export { Skeleton }
