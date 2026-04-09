import { db } from "@/lib/db"
import { Navbar } from "@/components/navigation/navbar"
import { PostCard } from "@/components/posts/post-card"
import { constructMetadata } from "@/lib/seo"

export const metadata = constructMetadata({
  title: "Broadcast Feed | Nexus",
  description: "Discover the latest narratives from architects around the world."
})

export default async function FeedPage() {
  // Server Component: Fetch posts directly from DB
  const posts = await db.post.findMany({
    where: {
      published: true
    },
    include: {
      author: {
        select: {
          username: true,
          imageUrl: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <main className="container pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-2 mb-10">
            <h1 className="text-3xl font-bold tracking-tight">Broadcast Feed</h1>
            <p className="text-muted-foreground">Discover the latest narratives from architects around the world.</p>
          </div>

          <div className="grid gap-6">
            {posts.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-xl">
                <p className="text-muted-foreground">No broadcasts yet. Be the first to tell your story.</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard 
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  content={post.content}
                  author={post.author}
                  likes={post._count.likes}
                  comments={post._count.comments}
                  createdAt={new Date(post.createdAt).toLocaleDateString()}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
