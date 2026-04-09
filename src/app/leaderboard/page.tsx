import { db } from "@/lib/db"
import { Navbar } from "@/components/navigation/navbar"
import { Trophy, Medal, Target, Star, Users, Zap } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { constructMetadata } from "@/lib/seo"

export const metadata = constructMetadata({
  title: "Leaderboard | Nexus Elite",
  description: "The global ranking of the world's most reputable architects."
})

export default async function LeaderboardPage() {
  const topDevs = await db.profile.findMany({
    orderBy: {
      reputation: 'desc'
    },
    take: 20,
    include: {
      _count: {
        select: {
          followers: true,
          posts: true
        }
      }
    }
  })

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <main className="container pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
              <Trophy className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Global Leaderboard</h1>
            <p className="text-muted-foreground max-w-lg">
              Recognizing the elite architects building the future of the Nexus narrative. Based on reputation, reach, and community contributions.
            </p>
          </div>

          <div className="grid gap-4">
            {topDevs.map((dev, idx) => (
              <div key={dev.id} className="group relative flex items-center justify-between p-6 rounded-2xl border bg-card hover:bg-primary/5 transition-all">
                <div className="flex items-center gap-6">
                  {/* Rank Badge */}
                  <div className="w-12 flex justify-center text-2xl font-black italic opacity-20 group-hover:opacity-100 transition-opacity">
                    {idx + 1}
                  </div>
                  
                  {/* Profile Info */}
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-2 border-muted overflow-hidden bg-muted group-hover:border-primary transition-colors">
                      {dev.imageUrl && <img src={dev.imageUrl} alt={dev.username} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">@{dev.username}</h3>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {dev._count.followers} Architects</span>
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {dev._count.posts} Broadcasts</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                   <div className="text-2xl font-black text-primary flex items-center gap-2">
                     <Star className="h-5 w-5 fill-current" /> {dev.reputation}
                   </div>
                   <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Reputation Points</span>
                </div>
              </div>
            ))}
          </div>

          {/* Hall of Fame Info */}
          <div className="mt-20 p-10 rounded-3xl border bg-card/50 text-center space-y-4">
             <Target className="h-10 w-10 text-primary mx-auto mb-4" />
             <h2 className="text-2xl font-bold">How to climb the ranks?</h2>
             <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
                Reputation is earned by broadcasting high-signal technical narratives, receiving elite badges in code reviews, and maintaining a consistent coding streak. 
             </p>
          </div>
        </div>
      </main>
    </div>
  )
}
