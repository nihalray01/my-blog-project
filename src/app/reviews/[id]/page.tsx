import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Navbar } from "@/components/navigation/navbar"
import { CodeExplorer } from "@/components/reviews/code-explorer"
import { addReviewComment, upvoteComment, markBestReview } from "@/lib/actions/review.actions"

interface ReviewPageProps {
  params: {
    id: string
  }
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { userId } = auth()
  
  const review = await db.codeReview.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      comments: {
        include: {
          author: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })

  if (!review) notFound()

  const isAuthor = userId === review.authorId

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <main className="container pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div>
               <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                  Live Code Audit
               </div>
               <h1 className="text-3xl font-black tracking-tight mb-2">{review.title}</h1>
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Authorized by</span>
                  <span className="font-bold text-foreground">@{review.author.username}</span>
                  <span>•</span>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <CodeExplorer 
                code={review.codeSnippet}
                language={review.language}
                comments={review.comments}
                currentUserId={userId || undefined}
                isAuthor={isAuthor}
                // These will be wired to client-side wrappers or handled via passing actions
              />
            </div>
            
            <div className="space-y-6">
                <div className="p-6 rounded-2xl border bg-card shadow-sm">
                   <h3 className="font-bold text-sm mb-4">Audit Intel</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-muted-foreground">Total Comments</span>
                         <span className="font-bold">{review.comments.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-muted-foreground">Language</span>
                         <span className="font-bold uppercase">{review.language}</span>
                      </div>
                   </div>
                </div>

                <div className="p-6 rounded-2xl border-2 border-primary/20 bg-primary/5">
                   <h3 className="font-bold text-sm mb-2 text-primary">Mission Guidelines</h3>
                   <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Focus on logic clarity, security vulnerabilities, and performance bottlenecks. Respect the architect while being rigorous in your audit.
                   </p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
