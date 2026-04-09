import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Navbar } from "@/components/navigation/navbar"
import { RepoImporter } from "@/components/github/repo-importer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, ExternalLink, ShieldCheck, Star, GitFork, BookOpen } from "lucide-react"

export default async function DashboardPage() {
  const { userId } = auth()
  if (!userId) redirect("/sign-in")

  const profile = await db.profile.findUnique({
    where: { userId },
    include: {
      projects: {
        orderBy: { stars: 'desc' }
      },
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  })

  if (!profile) redirect("/")

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <main className="container pt-32 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Architect Dashboard</h1>
            <p className="text-muted-foreground">Manage your broadcasts, narratives, and global project presence.</p>
          </div>
          <div className="flex gap-3">
             <Link href="/new-broadcast">
               <Button className="shadow-lg shadow-primary/20">
                 <PlusCircle className="mr-2 h-4 w-4" /> New Broadcast
               </Button>
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Project Showcase Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Showcase Projects
                </h2>
              </div>
              
              {profile.projects.length === 0 ? (
                <div className="p-8 border-2 border-dashed rounded-2xl bg-card/50">
                   <RepoImporter />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.projects.map(project => (
                    <div key={project.id} className="p-6 rounded-xl border bg-card hover:border-primary/50 transition-colors group">
                       <div className="flex justify-between items-start mb-4">
                         <h3 className="font-bold tracking-tight">{project.repoName}</h3>
                         <a href={project.repoUrl} target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                           <ExternalLink className="h-4 w-4" />
                         </a>
                       </div>
                       <p className="text-xs text-muted-foreground line-clamp-2 mb-6 h-8">{project.description}</p>
                       <div className="flex items-center justify-between border-t pt-4">
                          <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase">
                             <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {project.stars}</span>
                             <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> {project.forks}</span>
                             <span className="bg-muted px-2 py-0.5 rounded-full">{project.language}</span>
                          </div>
                          <Link href={`/projects/${project.id}/review`} className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                             Audit Code
                          </Link>
                       </div>
                    </div>
                  ))}
                  <div className="p-6 rounded-xl border-2 border-dashed flex items-center justify-center hover:bg-muted/30 cursor-pointer transition-colors">
                     <span className="text-xs font-bold text-muted-foreground">+ Add More Repositories</span>
                  </div>
                </div>
              )}
            </section>

            {/* Recent Broadcasts */}
            <section>
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <BookOpen className="h-5 w-5 text-primary" /> Active Narratives
               </h2>
               <div className="space-y-4">
                  {profile.posts.map(post => (
                    <div key={post.id} className="p-5 rounded-xl border bg-card flex justify-between items-center group">
                       <div>
                          <h3 className="font-bold text-sm mb-1">{post.title}</h3>
                          <span className="text-[10px] text-muted-foreground uppercase font-medium">{new Date(post.createdAt).toLocaleDateString()} • {post.status}</span>
                       </div>
                       <Link href={`/broadcast/${post.id}/edit`}>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">Edit</Button>
                       </Link>
                    </div>
                  ))}
               </div>
            </section>
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-8">
             <div className="p-8 rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
                <div className="relative z-10">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-6 opacity-70">Community Rank</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-black">#120</span>
                    <span className="text-xs font-medium opacity-70">Global Tier</span>
                  </div>
                  <p className="text-xs font-medium opacity-80 leading-relaxed">
                    You are in the top 2% of architects this week. Continue broadcasting to reach Tier 1.
                  </p>
                </div>
             </div>

             <div className="p-6 rounded-2xl border bg-card space-y-6">
                 <h3 className="font-bold text-sm">Engagement Intensity</h3>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <div className="flex justify-between text-[10px] font-bold uppercase">
                          <span>Reach</span>
                          <span className="text-primary">85%</span>
                       </div>
                       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[85%] bg-primary"></div>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <div className="flex justify-between text-[10px] font-bold uppercase">
                          <span>Reputation</span>
                          <span className="text-primary">{profile.reputation} / 5000</span>
                       </div>
                       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[40%] bg-primary"></div>
                       </div>
                    </div>
                 </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
