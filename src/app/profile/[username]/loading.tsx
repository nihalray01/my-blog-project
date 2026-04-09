import { PostSkeleton, ProjectSkeleton } from "@/components/ui/skeletons"

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="h-64 bg-muted animate-pulse border-b" />
      <main className="container pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-8">
             <div className="h-48 w-full animate-pulse bg-muted rounded-2xl" />
             <div className="h-48 w-full animate-pulse bg-muted rounded-3xl" />
          </div>
          <div className="lg:col-span-2 space-y-16">
             <div className="space-y-6">
                <div className="h-8 w-48 animate-pulse bg-muted rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {[...Array(2)].map((_, i) => <ProjectSkeleton key={i} />)}
                </div>
             </div>
             <div className="space-y-6">
                <div className="h-8 w-48 animate-pulse bg-muted rounded" />
                {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
