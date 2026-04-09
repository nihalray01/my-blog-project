import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navigation/navbar"
import { PostCard } from "@/components/posts/post-card"
import { Badge } from "@/components/ui/badge"
import { Shield, Github, Star, GitFork, ExternalLink, Calendar, Code, Zap } from "lucide-react"

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await db.profile.findUnique({
    where: { username: params.username },
    include: {
      projects: {
        orderBy: { stars: 'desc' }
      },
      posts: {
        where: { published: true },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          followers: true,
          following: true
        }
      }
    }
  })

  if (!profile) notFound()

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      {/* Header / Banner */}
      <div className="h-64 bg-gradient-to-r from-primary/20 via-blue-900/10 to-transparent border-b">
         <div className="container h-full relative">
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                <div className="h-32 w-32 rounded-3xl border-4 border-background bg-muted overflow-hidden shadow-2xl">
                    {profile.imageUrl && <img src={profile.imageUrl} alt={profile.username} className="h-full w-full object-cover" />}
                </div>
                <div className="pb-4">
                    <h1 className="text-3xl font-black tracking-tight">@{profile.username}</h1>
                    <div className="flex gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        <span>{profile._count.followers} Followers</span>
                        <span>{profile._count.following} Following</span>
                    </div>
                </div>
            </div>
         </div>
      </div>

      <main className="container pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Sidebar: Bio & Stats */}
          <div className="space-y-8">
            <div className="p-6 rounded-2xl border bg-card space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Architect Bio</h3>
                <p className="text-sm leading-relaxed text-foreground/80">
                    {profile.bio || "No bio provided yet. Just an architect building the future."}
                </p>
                <div className="pt-4 border-t space-y-3">
                   <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Calendar className="h-4 w-4" /> Joined {new Date(profile.createdAt).toLocaleDateString()}
                   </div>
                   {profile.githubUsername && (
                     <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Github className="h-4 w-4" /> github.com/{profile.githubUsername}
                     </div>
                   )}
                </div>
            </div>

            <div className="p-8 rounded-3xl bg-black text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700"></div>
                <div className="relative z-10">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 block mb-6">Reputation Index</span>
                   <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-6xl font-black italic">{profile.reputation}</span>
                      <Shield className="h-6 w-6 text-primary" />
                   </div>
                   <p className="text-[10px] font-bold opacity-60 uppercase">Elite Tier Architect</p>
                </div>
            </div>

            {profile.streakCount > 0 && (
                <div className="p-6 rounded-2xl border-2 border-orange-500/20 bg-orange-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Zap className="h-6 w-6 text-orange-500 fill-current" />
                        <div>
                            <span className="text-lg font-black text-orange-500">{profile.streakCount} Day Streak</span>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Narrative Consistency</p>
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* Main Content: Showcase & Feed */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* Project Showcase Section */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" /> Showcase Workspace
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.projects.length === 0 ? (
                  <div className="col-span-full py-12 text-center border-2 border-dashed rounded-2xl bg-muted/30">
                     <p className="text-sm text-muted-foreground italic">Architect has not yet initialized their showcase.</p>
                  </div>
                ) : (
                  profile.projects.map(project => (
                    <div key={project.id} className="p-6 rounded-xl border bg-card hover:border-primary/50 transition-colors group relative overflow-hidden">
                       <div className="flex justify-between items-start mb-4">
                         <h3 className="font-bold tracking-tight">{project.repoName}</h3>
                         <a href={project.repoUrl} target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                           <ExternalLink className="h-4 w-4" />
                         </a>
                       </div>
                       <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] mb-6">{project.description}</p>
                       <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase">
                          <span className="flex items-center gap-1.5"><Star className="h-3 w-3 fill-yellow-500/50 text-yellow-500" /> {project.stars}</span>
                          <span className="flex items-center gap-1.5"><GitFork className="h-3 w-3" /> {project.forks}</span>
                          {project.language && <span className="bg-muted px-2 py-0.5 rounded-full">{project.language}</span>}
                       </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Recent Narrative Broadcasts */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Code className="h-5 w-5 text-primary" /> Narrative Broadcasts
              </h2>
              <div className="grid gap-6">
                {profile.posts.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed rounded-2xl bg-muted/30">
                     <p className="text-sm text-muted-foreground italic">No broadcasts transmitted yet.</p>
                  </div>
                ) : (
                  profile.posts.map(post => (
                    <PostCard 
                       key={post.id}
                       id={post.id}
                       title={post.title}
                       content={post.content}
                       author={{ username: profile.username, imageUrl: profile.imageUrl || undefined }}
                       likes={0} // Aggregate later
                       comments={0}
                       createdAt={new Date(post.createdAt).toLocaleDateString()}
                    />
                  ))
                )}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  )
}
