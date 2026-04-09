import { PostSkeleton } from "@/components/ui/skeletons"

export default function FeedLoading() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container pt-32 pb-20">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2 mb-10">
            <div className="h-8 w-48 animate-pulse bg-muted rounded" />
            <div className="h-4 w-72 animate-pulse bg-muted rounded" />
          </div>
          {[...Array(5)].map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
