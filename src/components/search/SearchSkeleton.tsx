import Skeleton from '@/components/ui/Skeleton'

export default function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl"
        >
          <Skeleton className="w-full sm:w-56 lg:w-64 shrink-0 aspect-[4/3] sm:aspect-square rounded-xl" />
          <div className="flex-1 space-y-3 py-1">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <div className="flex justify-between pt-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}