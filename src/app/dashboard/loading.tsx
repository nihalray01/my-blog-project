import { ProjectSkeleton } from "@/components/ui/skeletons"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            <div className="h-8 w-48 animate-pulse bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[...Array(4)].map((_, i) => (
                 <ProjectSkeleton key={i} />
               ))}
            </div>
          </div>
          <div className="space-y-8">
             <div className="h-48 w-full animate-pulse bg-muted rounded-3xl" />
             <div className="h-48 w-full animate-pulse bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
