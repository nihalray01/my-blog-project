import { Skeleton } from "@/components/ui/skeleton"

export function PostSkeleton() {
  return (
    <div className="p-6 border rounded-xl bg-card space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 w-12" />
        </div>
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="pt-4 border-t flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-8" />
      </div>
    </div>
  )
}

export function ProjectSkeleton() {
  return (
    <div className="p-6 border rounded-xl bg-card space-y-4">
       <div className="flex justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-4" />
       </div>
       <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
       </div>
       <div className="pt-4 border-t flex justify-between">
          <div className="flex gap-4">
             <Skeleton className="h-3 w-10" />
             <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-3 w-16" />
       </div>
    </div>
  )
}
