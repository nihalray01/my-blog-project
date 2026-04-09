import Link from "next/link"
import { Navbar } from "@/components/navigation/navbar"
import { constructMetadata } from "@/lib/seo"
import { Calendar, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export const metadata = constructMetadata({
  title: "Roadmap | Nexus",
  description: "Check our commitment to transparency and the evolution of the developer narrative platform."
})

const roadmapItems = [
  {
    period: "Q2 2026 - CURRENT",
    title: "Nexus 5.0: The Productization",
    description: "Deployment of enterprise Auth (Clerk), real-time engagement analytics, and the immersive Code Review Console.",
    color: "bg-primary border-primary/20",
    status: "Active"
  },
  {
    period: "Q3 2026 - PLANNED",
    title: "AI Narrative Assistant",
    description: "Integrating LLMs to help developers translate complex codebases into human-friendly stories and broadcasts.",
    color: "bg-blue-500 border-blue-500/20",
    status: "UPCOMING"
  },
  {
    period: "Q4 2026 - RESEARCH",
    title: "Nexus Global Tribes",
    description: "Private workspaces for specialized labs and startups to collaborate on secret high-performance projects.",
    color: "bg-indigo-500 border-indigo-500/20",
    status: "FUTURE"
  }
]

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <main className="container pt-32 pb-20">
        <section className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-black tracking-tight mb-4">Product <span className="text-primary italic">Roadmap</span></h1>
            <p className="text-muted-foreground">Follow the evolution of the world's most immersive developer narrative platform.</p>
        </section>

        <section className="max-w-3xl mx-auto space-y-8">
            {roadmapItems.map((item, idx) => (
                <div key={idx} className="relative group">
                    <div className="p-8 rounded-2xl border bg-card hover:bg-muted/30 transition-all flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex flex-col gap-2 min-w-[120px]">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.period}</span>
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full border self-start",
                                item.status === "Active" ? "bg-primary/20 text-primary border-primary/20" : "bg-muted text-muted-foreground border-muted"
                            )}>
                                {item.status}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                        <div className="hidden md:flex items-center justify-center h-10 w-10 rounded-full border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                             <ChevronRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            ))}
        </section>

        <section className="max-w-2xl mx-auto mt-20 p-8 rounded-2xl border bg-card text-center space-y-4 shadow-xl">
             <h3 className="text-lg font-bold">Want to influence the future?</h3>
             <p className="text-xs text-muted-foreground">We build for you. Send us your feature requests directly or join our community discussions.</p>
             <div className="pt-4">
                 <Link href="/contact" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                    Submit Feedback
                 </Link>
             </div>
        </section>
      </main>
    </div>
  )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}

import Link from "next/link"
